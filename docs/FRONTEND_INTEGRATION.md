# Frontend Integration Guide

This guide explains how to integrate the GitWork frontend with the backend.

## 📁 Structure

```
GitWork/
├── src/                          # Backend (Node.js + Express)
│   ├── routes/
│   │   ├── api-bounties.js      # Bounty search API
│   │   └── api-user.js          # User profile API
│   └── index.js                 # Main server
│
└── gitwork-front/               # Frontend (React + Vite)
    ├── src/
    │   ├── services/api.js      # API client
    │   ├── pages/
    │   │   ├── HomePage.jsx     # Search bounties
    │   │   └── ProfilePage.jsx  # User profile
    │   └── ...
    └── dist/                    # Built frontend (production)
```

## 🔌 API Endpoints

### Bounty Search
- **GET** `/api/bounties/search?query=<search>`
- Returns all bounties or filtered by repo name/language
- No authentication required

### User Profile
- **GET** `/api/user/status`
- Check if user is authenticated
- Returns: `{ authenticated: boolean, username: string }`

- **GET** `/api/user/profile`
- Get user profile with claimed bounties
- Requires GitHub OAuth session
- Returns: User info, stats, bounty history

## 🚀 Development Setup

### 1. Backend (Port 3000)
```bash
cd GitWork
npm install
npm start
```

### 2. Frontend (Port 5173)
```bash
cd gitwork-front
npm install
npm run dev
```

### 3. Access
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- CORS is enabled for development

## 📦 Production Build

### 1. Build Frontend
```bash
cd gitwork-front
npm run build
# Creates gitwork-front/dist/
```

### 2. Backend Serves Frontend
The backend is configured to serve the built frontend in production:

```javascript
// src/index.js
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('../gitwork-front/dist'));
  
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api') && !req.path.startsWith('/auth')) {
      res.sendFile(path.join(__dirname, '../gitwork-front/dist/index.html'));
    }
  });
}
```

### 3. Deploy
```bash
# On server
export NODE_ENV=production
pm2 start src/index.js --name gitwork
```

## 🔑 Authentication Flow

1. **User clicks "Login with GitHub"** on ProfilePage
2. Frontend redirects to `/auth/github?returnTo=/profile`
3. User authorizes on GitHub
4. GitHub redirects to `/auth/github/callback`
5. Backend creates session, redirects to `/profile`
6. Frontend checks `/api/user/status` to confirm auth
7. Frontend loads `/api/user/profile` with session cookie

## 🔍 Search Flow

1. **User enters query** (or presses Enter for all bounties)
2. Frontend calls `/api/bounties/search?query=<term>`
3. Backend searches `bounties` table
4. Results displayed with amount, status, GitHub link

## 🎨 Features

### HomePage
- Clean search interface
- Enter query or press Enter for all bounties
- Results show: repo, issue, amount, currency, status
- Click to view on GitHub

### ProfilePage
- GitHub OAuth login
- Total USDC and SOL earned
- Bounties completed count
- Claimed bounty history with transaction links

## 🐛 Troubleshooting

### CORS Issues (Development)
Backend has CORS enabled:
```javascript
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});
```

### Session Not Persisting
Make sure cookies are enabled and using `credentials: 'include'`:
```javascript
fetch(url, {
  credentials: 'include'  // Required for session cookies!
});
```

### 404 on Frontend Routes (Production)
Backend catch-all route must be **AFTER** all API routes:
```javascript
// API routes first
app.use('/api/bounties', apiBountiesRoutes);
app.use('/api/user', apiUserRoutes);

// Frontend catch-all last
app.get('*', (req, res) => { ... });
```

## 📊 Database Schema Used

```sql
-- Bounties table
SELECT 
  id,
  bounty_amount,
  currency,
  status,  -- 'deposit_confirmed', 'ready_to_claim', 'claimed'
  github_repo_owner,
  github_repo_name,
  github_issue_number,
  github_issue_title,
  claimed_by_github_username,
  claimed_at,
  payout_transaction
FROM bounties;
```

## ✅ Testing Checklist

- [ ] Search with no query returns all bounties
- [ ] Search with "c++" returns only C++ repos
- [ ] Profile page redirects to GitHub OAuth
- [ ] After OAuth, session persists
- [ ] Profile shows correct earnings and bounties
- [ ] Transaction links open Solscan
- [ ] GitHub links open correct issue

## 🎯 Next Steps

1. Add real-time updates (WebSocket for new bounties)
2. Add repo search autocomplete
3. Add bounty filtering (currency, amount range)
4. Add pagination for large result sets
5. Add reputation system (coming soon)

---

**Built with ❤️ for the open source community**

