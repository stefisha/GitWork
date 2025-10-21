# GitWork Deployment Guide

## Overview

This guide covers deploying GitWork to production on various platforms.

## Prerequisites

- GitHub App created and configured
- Solana RPC provider account (for mainnet)
- Domain name (optional but recommended)

## Environment Variables for Production

```env
NODE_ENV=production
PORT=3000

# GitHub App
GITHUB_APP_ID=your_app_id
GITHUB_PRIVATE_KEY_PATH=./private-key.pem
GITHUB_WEBHOOK_SECRET=your_webhook_secret

# Solana (Mainnet)
SOLANA_RPC_URL=https://your-rpc-provider.com/your-api-key
SOLANA_NETWORK=mainnet-beta

# USDC Mint Address (Mainnet)
USDC_MINT_ADDRESS=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v

# Claim URL
CLAIM_BASE_URL=https://yourdomain.com

# Database
DATABASE_PATH=/var/data/gitwork.db
```

## Option 1: Railway

Railway is the easiest way to deploy.

### Steps:

1. Install Railway CLI:
   ```bash
   npm i -g @railway/cli
   ```

2. Login:
   ```bash
   railway login
   ```

3. Create a new project:
   ```bash
   railway init
   ```

4. Add environment variables:
   ```bash
   railway variables set GITHUB_APP_ID=123456
   railway variables set GITHUB_WEBHOOK_SECRET=your_secret
   # ... add all other variables
   ```

5. Add private key as a file:
   ```bash
   # Upload private-key.pem through Railway dashboard
   # Or use Railway volumes
   ```

6. Deploy:
   ```bash
   railway up
   ```

7. Get your deployment URL:
   ```bash
   railway domain
   ```

8. Update GitHub App webhook URL to: `https://yourapp.railway.app/api/webhooks/github`

## Option 2: Render

### Steps:

1. Create a new Web Service on [Render](https://render.com)

2. Connect your GitHub repository

3. Configure:
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

4. Add environment variables in Render dashboard

5. For the private key:
   - Option A: Add as environment variable (base64 encode it first)
   - Option B: Use Render's secret files feature

6. Deploy and get your URL

7. Update GitHub App webhook URL

## Option 3: Heroku

### Steps:

1. Install Heroku CLI:
   ```bash
   npm install -g heroku
   ```

2. Create app:
   ```bash
   heroku create your-app-name
   ```

3. Add buildpack:
   ```bash
   heroku buildpacks:set heroku/nodejs
   ```

4. Set environment variables:
   ```bash
   heroku config:set GITHUB_APP_ID=123456
   heroku config:set GITHUB_WEBHOOK_SECRET=your_secret
   # ... add all variables
   ```

5. For private key:
   ```bash
   # Base64 encode the key
   cat private-key.pem | base64
   
   # Set as environment variable
   heroku config:set GITHUB_PRIVATE_KEY="$(cat private-key.pem)"
   ```

6. Deploy:
   ```bash
   git push heroku main
   ```

7. Update GitHub App webhook URL to: `https://your-app-name.herokuapp.com/api/webhooks/github`

## Option 4: VPS (DigitalOcean, AWS, etc.)

### Steps:

1. SSH into your server

2. Install Node.js:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

3. Clone repository:
   ```bash
   git clone your-repo-url
   cd gitwork
   ```

4. Install dependencies:
   ```bash
   npm install
   ```

5. Create `.env` file with production values

6. Upload private key:
   ```bash
   scp private-key.pem user@yourserver:/path/to/gitwork/
   ```

7. Run database migrations:
   ```bash
   npm run db:migrate
   ```

8. Install PM2 for process management:
   ```bash
   sudo npm install -g pm2
   ```

9. Start the application:
   ```bash
   pm2 start src/index.js --name gitwork
   pm2 save
   pm2 startup
   ```

10. Set up nginx as reverse proxy:
    ```nginx
    server {
        listen 80;
        server_name yourdomain.com;

        location / {
            proxy_pass http://localhost:3000;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }
    }
    ```

11. Install SSL certificate:
    ```bash
    sudo certbot --nginx -d yourdomain.com
    ```

## Database Backup

### Automated Backup Script

Create `scripts/backup-db.sh`:

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/gitwork"
mkdir -p $BACKUP_DIR

# Backup database
cp data/gitwork.db $BACKUP_DIR/gitwork_$DATE.db

# Keep only last 7 days
find $BACKUP_DIR -name "gitwork_*.db" -mtime +7 -delete

echo "Backup completed: gitwork_$DATE.db"
```

Add to crontab:
```bash
# Daily backup at 2 AM
0 2 * * * /path/to/gitwork/scripts/backup-db.sh
```

## Monitoring

### Health Check Endpoint

The app provides a health check at `/api/webhooks/health`

### Uptime Monitoring

Use services like:
- UptimeRobot
- Pingdom
- StatusCake

Configure to ping: `https://yourdomain.com/api/webhooks/health`

### Logging

For production, consider adding a logging service:

```bash
npm install winston
```

Create `src/utils/logger.js`:
```javascript
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

export default logger;
```

## Security Checklist

- [ ] Private key is secure and not in version control
- [ ] Webhook secret is strong and unique
- [ ] Environment variables are set securely
- [ ] HTTPS is enabled
- [ ] Database has restricted permissions
- [ ] Rate limiting is enabled
- [ ] CORS is properly configured
- [ ] Regular backups are scheduled
- [ ] Monitoring is set up

## Switching to Mainnet

1. Update RPC URL to a mainnet provider:
   - Alchemy: https://www.alchemy.com/solana
   - QuickNode: https://www.quicknode.com/chains/solana
   - Helius: https://www.helius.dev/

2. Update USDC mint address:
   ```env
   USDC_MINT_ADDRESS=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v
   ```

3. Update network:
   ```env
   SOLANA_NETWORK=mainnet-beta
   ```

4. Test thoroughly with small amounts first!

## Performance Optimization

### Database

For production with high traffic, consider:
- PostgreSQL instead of SQLite
- Connection pooling
- Indexing optimization

### Caching

Add Redis for caching:
```bash
npm install redis
```

Cache GitHub API responses and wallet balances.

### Rate Limiting

Add express-rate-limit:
```bash
npm install express-rate-limit
```

```javascript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

## Scaling

For high traffic:
- Use load balancer
- Multiple app instances
- Separate database server
- Message queue for async processing (Bull/BullMQ)
- WebSocket for real-time updates

## Troubleshooting Production Issues

### Check logs
```bash
pm2 logs gitwork
```

### Restart service
```bash
pm2 restart gitwork
```

### Database access
```bash
sqlite3 /var/data/gitwork.db
```

### Test webhook delivery
Use GitHub App's "Advanced" tab to redeliver webhooks

---

**Production Deployment Complete!** 🚀

Your GitWork instance is now running and ready to process real bounties.


