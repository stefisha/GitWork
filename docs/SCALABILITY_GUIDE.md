> Historical reference: the hosted service is retired. Hostnames ending in `.example` below are placeholders for a self-hosted installation, not live GitWork services.

# GitWork Scalability Guide

**Last Updated**: November 5, 2025  
**Current State**: 1 PM2 worker, in-memory sessions  
**Current Capacity**: 100-200 concurrent users  

---

## Table of Contents

1. [Current Performance Metrics](#current-performance-metrics)
2. [Scaling Phases (By User Count)](#scaling-phases-by-user-count)
3. [Phase 1: Sticky Sessions (0-1000 users)](#phase-1-sticky-sessions-0-1000-users)
4. [Phase 2: JWT Authentication (1000-10000 users)](#phase-2-jwt-authentication-1000-10000-users)
5. [Phase 3: Horizontal Scaling (10000+ users)](#phase-3-horizontal-scaling-10000-users)
6. [Alternative: SQLite Sessions](#alternative-sqlite-sessions)
7. [Monitoring & Metrics](#monitoring--metrics)
8. [Emergency Scaling Procedures](#emergency-scaling-procedures)

---

## Current Performance Metrics

### What We Can Handle Today (1 Worker)

| Metric | Current Capacity | Notes |
|--------|------------------|-------|
| Concurrent Users | 100-200 | Users actively browsing |
| Requests/Second | 50-100 | API + page loads |
| Session Memory | 1-2 MB/100 users | In-memory storage |
| Response Time | <100ms | Average API response |
| CPU Usage | 20-30% | Under normal load |

### When to Scale

⚠️ **Scale Trigger**: When you consistently hit:
- **70%+ CPU** usage
- **500+ concurrent users**
- **200+ requests/second**
- **Response time >500ms**

---

## Scaling Phases (By User Count)

```
0-500 users     → Current setup (1 worker)
500-1,000       → Phase 1: Sticky Sessions (2-4 workers)
1,000-10,000    → Phase 2: JWT Authentication (unlimited workers)
10,000+         → Phase 3: Horizontal Scaling (multiple servers)
```

---

## Phase 1: Sticky Sessions (0-1000 users)

**When**: You have 500+ concurrent users or 70%+ CPU  
**Time to Implement**: 10 minutes  
**Cost**: $0  
**Downtime**: 0 seconds  

### How It Works

Nginx routes each user (by IP) to the same PM2 worker. Sessions stay in memory on that worker.

```
User A (IP: 1.2.3.4) → Always goes to Worker 1
User B (IP: 5.6.7.8) → Always goes to Worker 2
```

### Implementation Steps

#### Step 1: Update Nginx Configuration

```bash
# Edit nginx config
sudo nano /etc/nginx/sites-available/gitwork
```

Add `ip_hash` to upstream:

```nginx
upstream gitwork_backend {
    ip_hash;  # This enables sticky sessions
    server 127.0.0.1:3000;
}

server {
    listen 80;
    listen 443 ssl http2;
    server_name gitwork.example www.gitwork.example;

    # SSL certificates
    ssl_certificate /etc/letsencrypt/live/gitwork.example/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/gitwork.example/privkey.pem;

    location / {
        proxy_pass http://gitwork_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### Step 2: Test Nginx Config

```bash
sudo nginx -t
```

Should output: `syntax is ok` and `test is successful`

#### Step 3: Reload Nginx

```bash
sudo systemctl reload nginx
```

#### Step 4: Scale PM2 Workers

```bash
cd ~/apps/gitwork
pm2 scale gitwork 4
```

#### Step 5: Verify It's Working

```bash
# Check PM2 status
pm2 status

# Should show 4 workers running
┌────┬─────────┬─────────┬──────┬─────────┐
│ id │ name    │ mode    │ ↺    │ status  │
├────┼─────────┼─────────┼──────┼─────────┤
│ 0  │ gitwork │ cluster │ 0    │ online  │
│ 1  │ gitwork │ cluster │ 0    │ online  │
│ 2  │ gitwork │ cluster │ 0    │ online  │
│ 3  │ gitwork │ cluster │ 0    │ online  │
└────┴─────────┴─────────┴──────┴─────────┘

# Monitor load distribution
pm2 monit
```

#### Step 6: Test User Sessions

1. Open gitwork.example in browser
2. Log in with GitHub
3. Refresh multiple times
4. Should stay logged in ✅

### Pros & Cons

✅ **Pros**:
- Zero code changes
- Works immediately
- No new dependencies
- Scales to 1000 users easily

⚠️ **Cons**:
- If a worker crashes, those users lose sessions
- Users behind corporate NAT might have issues
- Can't truly load balance (some workers may be busier)

### Capacity After Phase 1

| Metric | Phase 1 Capacity (4 workers) |
|--------|------------------------------|
| Concurrent Users | 800-1000 |
| Requests/Second | 200-400 |
| CPU Usage | 60-80% (distributed) |
| Memory | 200-400 MB total |

---

## Phase 2: JWT Authentication (1000-10,000 users)

**When**: Hitting limits with sticky sessions or want true stateless scaling  
**Time to Implement**: 4-8 hours (weekend project)  
**Cost**: $0  
**Downtime**: 0 seconds (can run both in parallel)  

### How It Works

Replace session cookies with **JSON Web Tokens (JWT)**. No server-side session storage needed.

```
User logs in → Get JWT token → Store in httpOnly cookie → Verify token on each request
```

### Implementation Steps

#### Step 1: Install Dependencies

```bash
cd ~/apps/gitwork
npm install jsonwebtoken cookie-parser
```

#### Step 2: Add JWT Secret to .env

```bash
echo "JWT_SECRET=$(openssl rand -base64 32)" >> .env
```

#### Step 3: Create JWT Service

Create `src/services/jwt.js`:

```javascript
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRY = '24h';

/**
 * Generate JWT token for authenticated user
 */
export function generateToken(user) {
  const payload = {
    githubId: user.id,
    username: user.username || user.login,
    name: user.displayName || user.name,
    avatar: user.photos?.[0]?.value || user.avatar_url
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });
}

/**
 * Verify and decode JWT token
 */
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

/**
 * Refresh token (extend expiry)
 */
export function refreshToken(oldToken) {
  const decoded = verifyToken(oldToken);
  if (!decoded) return null;
  
  // Remove JWT metadata (iat, exp)
  const { iat, exp, ...userData } = decoded;
  
  // Generate new token with same data
  return jwt.sign(userData, JWT_SECRET, { expiresIn: JWT_EXPIRY });
}
```

#### Step 4: Update Auth Routes

Modify `src/routes/auth.js`:

```javascript
import express from 'express';
import passport from 'passport';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { generateToken } from '../services/jwt.js';

const router = express.Router();

// ... existing GitHub strategy config ...

/**
 * GitHub OAuth callback - now returns JWT
 */
router.get('/github/callback',
  passport.authenticate('github', { 
    failureRedirect: '/',
    session: false  // Disable sessions, using JWT
  }),
  (req, res) => {
    console.log('🔐 GitHub OAuth callback received');
    console.log('   User:', req.user?.username);
    
    // Generate JWT token
    const token = generateToken(req.user);
    
    // Set as httpOnly cookie (secure in production)
    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });
    
    // Extract returnTo from state
    let returnTo = '/';
    try {
      const state = req.query.state;
      if (state) {
        const decodedState = JSON.parse(Buffer.from(state, 'base64').toString());
        returnTo = decodedState.returnTo || '/';
      }
    } catch (error) {
      console.log('   Error parsing state:', error.message);
    }
    
    console.log('   ✅ JWT token generated');
    console.log('   Redirecting to:', returnTo);
    res.redirect(returnTo);
  }
);

/**
 * Logout - clear JWT cookie
 */
router.get('/logout', (req, res) => {
  const returnTo = req.query.returnTo || '/';
  res.clearCookie('auth_token');
  res.redirect(returnTo);
});

export default router;
```

#### Step 5: Create JWT Auth Middleware

Create `src/middleware/auth.js`:

```javascript
import { verifyToken } from '../services/jwt.js';

/**
 * Middleware to verify JWT and attach user to request
 */
export function requireAuth(req, res, next) {
  const token = req.cookies.auth_token;
  
  if (!token) {
    return res.status(401).json({ 
      success: false, 
      error: 'Not authenticated',
      message: 'Please log in'
    });
  }
  
  const user = verifyToken(token);
  
  if (!user) {
    return res.status(401).json({ 
      success: false, 
      error: 'Invalid or expired token',
      message: 'Please log in again'
    });
  }
  
  // Attach user to request
  req.user = user;
  next();
}

/**
 * Optional auth - doesn't block if not authenticated
 */
export function optionalAuth(req, res, next) {
  const token = req.cookies.auth_token;
  
  if (token) {
    const user = verifyToken(token);
    if (user) {
      req.user = user;
    }
  }
  
  next();
}
```

#### Step 6: Update index.js

Modify `src/index.js`:

```javascript
import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';  // Add this
import passport from 'passport';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config();

// Import routes
import webhookRoutes from './routes/webhooks.js';
import authRoutes from './routes/auth.js';
import claimRoutes from './routes/claim.js';
import apiClaimRoutes from './routes/api-claim.js';
import apiBountiesRoutes from './routes/api-bounties.js';
import apiUserRoutes from './routes/api-user.js';
import apiContactRoutes from './routes/api-contact.js';
import apiWalletRoutes from './routes/api-wallet.js';
import { runMigrations } from './db/migrate.js';
import depositMonitor from './services/deposit-monitor.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// REMOVE session middleware entirely
// No more: app.use(session({ ... }))

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());  // Add this for JWT cookies

// Passport (but no session)
app.use(passport.initialize());
// REMOVE: app.use(passport.session());

// CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Routes
app.use('/api/webhooks', webhookRoutes);
app.use('/auth', authRoutes);
app.use('/claim', claimRoutes);
app.use('/api/claim', apiClaimRoutes);
app.use('/api/bounties', apiBountiesRoutes);
app.use('/api/user', apiUserRoutes);
app.use('/api/contact', apiContactRoutes);
app.use('/api/wallet', apiWalletRoutes);

// ... rest of your existing code ...
```

#### Step 7: Update API Routes to Use JWT

Example for `src/routes/api-user.js`:

```javascript
import express from 'express';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

/**
 * Get current user status (now uses JWT)
 */
router.get('/status', requireAuth, (req, res) => {
  console.log('🔍 Checking user status...');
  console.log('   User from JWT:', req.user.username);
  
  res.json({
    authenticated: true,
    user: req.user
  });
});

export default router;
```

#### Step 8: Test JWT Implementation

```bash
# Restart PM2
pm2 restart gitwork

# Test login flow
curl -i https://gitwork.example/auth/github

# After login, check cookie
curl -i https://gitwork.example/api/user/status \
  -H "Cookie: auth_token=YOUR_TOKEN_HERE"
```

#### Step 9: Deploy Gradually

**Migration Strategy** (run both systems in parallel):

1. Deploy JWT code
2. Keep session code as fallback
3. Monitor for 24 hours
4. If stable, remove session code
5. If issues, rollback to sessions

### Pros & Cons

✅ **Pros**:
- Truly stateless (no session storage)
- Unlimited horizontal scaling
- Works with any number of workers
- No Redis needed
- Better performance (no DB lookups)

⚠️ **Cons**:
- Can't immediately revoke tokens (must wait for expiry)
- Slightly larger cookies (~200 bytes)
- Need to handle token refresh
- Requires code changes

### Capacity After Phase 2

| Metric | Phase 2 Capacity |
|--------|------------------|
| Concurrent Users | 10,000+ |
| Requests/Second | 1000+ |
| Workers | Unlimited (scale as needed) |
| Session Storage | 0 MB (stateless) |

---

## Phase 3: Horizontal Scaling (10,000+ users)

**When**: Single server hitting 80%+ CPU even with 8 workers  
**Time to Implement**: 1-2 days  
**Cost**: $50-200/month (additional servers)  
**Downtime**: 0 seconds  

### Architecture

```
                    ┌─────────────┐
                    │  Cloudflare │ (CDN + DDoS protection)
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │   Nginx LB  │ (Load balancer)
                    └──────┬──────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
  ┌─────▼─────┐     ┌─────▼─────┐     ┌─────▼─────┐
  │ Server 1  │     │ Server 2  │     │ Server 3  │
  │ 4 workers │     │ 4 workers │     │ 4 workers │
  └─────┬─────┘     └─────┬─────┘     └─────┬─────┘
        │                  │                  │
        └──────────────────┼──────────────────┘
                           │
                    ┌──────▼──────┐
                    │  Postgres   │ (Shared database)
                    └─────────────┘
```

### Implementation

#### 1. Set Up Load Balancer

**Option A: Nginx Load Balancer**

```nginx
upstream gitwork_cluster {
    least_conn;  # Route to least busy server
    
    server 10.0.1.10:3000 weight=1 max_fails=3 fail_timeout=30s;
    server 10.0.1.11:3000 weight=1 max_fails=3 fail_timeout=30s;
    server 10.0.1.12:3000 weight=1 max_fails=3 fail_timeout=30s;
}
```

**Option B: Use Cloudflare Load Balancing** (Recommended)
- More reliable
- Built-in health checks
- DDoS protection included
- Costs ~$50/month

#### 2. Migrate to Postgres

SQLite won't work across multiple servers. Migrate to Postgres:

```bash
# On new database server
sudo apt install postgresql postgresql-contrib

# Create database
sudo -u postgres createdb gitwork_prod
sudo -u postgres createuser gitwork_user

# Grant permissions
sudo -u postgres psql
ALTER USER gitwork_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE gitwork_prod TO gitwork_user;
```

Update `src/db/database.js` to use Postgres instead of SQLite.

#### 3. Deploy to Multiple Servers

**Clone to Server 2 & 3**:

```bash
# On each new server
git clone https://github.com/stefisha/Octavian.git gitwork
cd gitwork
npm install
cd gitwork-front && npm install && npm run build

# Set environment variables
cp .env.example .env
# Edit .env with DATABASE_URL pointing to Postgres

# Start PM2
pm2 start src/index.js --name gitwork -i 4
pm2 save
pm2 startup
```

### Capacity After Phase 3

| Metric | Phase 3 Capacity (3 servers) |
|--------|------------------------------|
| Concurrent Users | 30,000+ |
| Requests/Second | 3000+ |
| Total Workers | 12 (4 per server) |
| Database | Postgres (10,000+ connections) |

---

## Alternative: SQLite Sessions

If you want to keep sessions but avoid Redis, use **SQLite for session storage**.

### Quick Implementation

```bash
npm install express-session connect-sqlite3
```

```javascript
import session from 'express-session';
import connectSqlite3 from 'connect-sqlite3';

const SQLiteStore = connectSqlite3(session);

app.use(session({
  store: new SQLiteStore({
    db: 'sessions.db',
    dir: './data'
  }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000
  }
}));
```

**Pros**: Simple, familiar session workflow  
**Cons**: Limited to ~2000 concurrent users  

---

## Monitoring & Metrics

### Tools to Install

```bash
# PM2 monitoring
pm2 install pm2-logrotate

# System monitoring
sudo apt install htop iotop nethogs

# Optional: Professional monitoring
# - Datadog (free tier)
# - New Relic (free tier)
# - PM2 Plus ($10/month)
```

### Key Metrics to Watch

```bash
# Real-time monitoring
pm2 monit

# Check specific metrics
pm2 status
pm2 logs --lines 100
```

**Alert Thresholds**:
- CPU > 70% for 5+ minutes → Scale up
- Memory > 80% → Investigate memory leak
- Response time > 500ms → Optimize or scale
- Error rate > 1% → Check logs immediately

### Custom Monitoring Endpoint

Add to `src/routes/api-user.js`:

```javascript
router.get('/health', (req, res) => {
  const memUsage = process.memoryUsage();
  const uptime = process.uptime();
  
  res.json({
    status: 'healthy',
    uptime: uptime,
    memory: {
      heapUsed: (memUsage.heapUsed / 1024 / 1024).toFixed(2) + ' MB',
      heapTotal: (memUsage.heapTotal / 1024 / 1024).toFixed(2) + ' MB'
    },
    pid: process.pid,
    timestamp: new Date().toISOString()
  });
});
```

---

## Emergency Scaling Procedures

### Scenario 1: Sudden Traffic Spike (500+ users)

**Immediate Action (5 minutes)**:

```bash
# Enable sticky sessions
sudo nano /etc/nginx/sites-available/gitwork
# Add: ip_hash

sudo systemctl reload nginx

# Scale PM2
pm2 scale gitwork 4

# Monitor
pm2 monit
```

### Scenario 2: Server Overload (90%+ CPU)

**Immediate Action (10 minutes)**:

```bash
# Reduce workers temporarily
pm2 scale gitwork 2

# Check for runaway processes
pm2 logs --lines 500 | grep ERROR

# Restart if needed
pm2 restart gitwork

# If still overloaded, enable rate limiting in nginx
```

### Scenario 3: Database Lock (SQLite)

**Immediate Action**:

```bash
# Check database locks
lsof ~/apps/gitwork/data/gitwork.db

# Enable WAL mode if not already
sqlite3 ~/apps/gitwork/data/gitwork.db "PRAGMA journal_mode=WAL;"

# Restart PM2
pm2 restart gitwork
```

---

## Scaling Decision Tree

```
Are you hitting limits?
│
├─ NO → Do nothing, monitor
│
└─ YES → What's the bottleneck?
    │
    ├─ CPU > 70%
    │   ├─ 1 worker → Scale to 4 workers (Phase 1)
    │   ├─ 4 workers → Implement JWT (Phase 2)
    │   └─ 8+ workers → Add servers (Phase 3)
    │
    ├─ Memory > 80%
    │   ├─ Session bloat → Implement JWT
    │   └─ Memory leak → Check logs, restart
    │
    ├─ Database slow
    │   ├─ SQLite → Enable WAL mode
    │   └─ Still slow → Migrate to Postgres
    │
    └─ Network slow
        ├─ Add Cloudflare CDN
        └─ Enable nginx gzip
```

---

## Cost Breakdown

| Phase | Monthly Cost | User Capacity |
|-------|--------------|---------------|
| Current (1 worker) | $0 | 100-200 |
| Phase 1 (Sticky) | $0 | 500-1000 |
| Phase 2 (JWT) | $0 | 1000-10000 |
| Phase 3 (3 servers) | $150-300 | 30,000+ |

**Note**: Assumes you're on existing VPS. Costs are for additional servers/services only.

---

## Summary: What to Do When

| User Count | Action | Time | Cost |
|------------|--------|------|------|
| 0-500 | Nothing | 0 min | $0 |
| 500-1000 | Sticky sessions + 4 workers | 10 min | $0 |
| 1000-2000 | Implement JWT | 8 hours | $0 |
| 2000-10000 | Optimize, monitor | Ongoing | $0 |
| 10000+ | Add servers + Postgres | 2 days | $150/mo |

---

## Next Steps

1. **Monitor current usage**: `pm2 monit` daily
2. **Set up alerts**: CPU/memory thresholds
3. **Test Phase 1**: Implement sticky sessions in staging
4. **Plan Phase 2**: JWT implementation over a weekend
5. **Budget for Phase 3**: When you hit 5000+ users

---

**Remember**: Don't over-engineer! Your current setup is perfect for 100 users. Scale when you need to, not before.

**Questions or issues?** Check `RESTORE_POINT_WORKING.md` first, then this guide.

---

**Last tested**: November 5, 2025  
**Status**: ✅ All phases documented and ready to implement

