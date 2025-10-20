import express from 'express';
import { getBountyById } from '../services/bounty.js';

const router = express.Router();

/**
 * Claim page - shows bounty details and claim button
 */
router.get('/:bountyId', (req, res) => {
  const { bountyId } = req.params;
  
  const bounty = getBountyById(parseInt(bountyId));
  
  if (!bounty) {
    return res.status(404).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Bounty Not Found - GitWork</title>
          <style>
            body { font-family: system-ui; max-width: 600px; margin: 50px auto; padding: 20px; }
            h1 { color: #dc2626; }
          </style>
        </head>
        <body>
          <h1>❌ Bounty Not Found</h1>
          <p>The bounty you're looking for doesn't exist.</p>
        </body>
      </html>
    `);
  }
  
  if (bounty.status !== 'ready_to_claim') {
    return res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Bounty Not Available - GitWork</title>
          <style>
            body { font-family: system-ui; max-width: 600px; margin: 50px auto; padding: 20px; }
            h1 { color: #f59e0b; }
          </style>
        </head>
        <body>
          <h1>⚠️ Bounty Not Available</h1>
          <p>This bounty is not ready to claim yet.</p>
          <p>Status: <strong>${bounty.status}</strong></p>
        </body>
      </html>
    `);
  }
  
  // Check if user is authenticated
  const isAuthenticated = req.session && req.session.githubUser;
  const isAuthorized = isAuthenticated && 
    req.session.githubUser.login === bounty.contributor_github_username;
  
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Claim Your Bounty - GitWork</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
          }
          .container {
            max-width: 600px;
            margin: 50px auto;
            background: white;
            border-radius: 16px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            overflow: hidden;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
          }
          .header h1 { font-size: 32px; margin-bottom: 10px; }
          .header p { opacity: 0.9; font-size: 18px; }
          .content { padding: 40px 30px; }
          .bounty-details {
            background: #f3f4f6;
            padding: 20px;
            border-radius: 12px;
            margin-bottom: 30px;
          }
          .detail-row {
            display: flex;
            justify-content: space-between;
            padding: 12px 0;
            border-bottom: 1px solid #e5e7eb;
          }
          .detail-row:last-child { border-bottom: none; }
          .detail-label { color: #6b7280; font-weight: 500; }
          .detail-value { font-weight: 600; color: #111827; }
          .wallet-input {
            width: 100%;
            padding: 16px;
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            font-size: 14px;
            font-family: monospace;
            margin-bottom: 20px;
            transition: border-color 0.3s;
          }
          .wallet-input:focus {
            outline: none;
            border-color: #667eea;
          }
          .btn {
            width: 100%;
            padding: 16px;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.2s, box-shadow 0.2s;
          }
          .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(0,0,0,0.1);
          }
          .btn-primary {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
          }
          .btn-github {
            background: #24292e;
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
          }
          .alert {
            padding: 16px;
            border-radius: 8px;
            margin-bottom: 20px;
          }
          .alert-info {
            background: #dbeafe;
            color: #1e40af;
            border: 1px solid #93c5fd;
          }
          .alert-success {
            background: #d1fae5;
            color: #065f46;
            border: 1px solid #6ee7b7;
          }
          #claiming-status {
            display: none;
            text-align: center;
            padding: 20px;
          }
          .spinner {
            border: 3px solid #f3f4f6;
            border-top: 3px solid #667eea;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin: 0 auto 16px;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Claim Your Bounty</h1>
            <p>GitWork Rewards</p>
          </div>
          
          <div class="content">
            <div class="bounty-details">
              <div class="detail-row">
                <span class="detail-label">Amount</span>
                <span class="detail-value">${bounty.bounty_amount} ${bounty.currency}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Issue</span>
                <span class="detail-value">#${bounty.github_issue_number}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Repository</span>
                <span class="detail-value">${bounty.github_repo_owner}/${bounty.github_repo_name}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Contributor</span>
                <span class="detail-value">@${bounty.contributor_github_username}</span>
              </div>
            </div>
            
            ${!isAuthenticated ? `
              <div class="alert alert-info">
                🔐 Please sign in with GitHub to verify your identity and claim your bounty.
              </div>
              <a href="/auth/github?returnTo=/claim/${bounty.id}" style="text-decoration: none;">
                <button class="btn btn-github">
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z"/>
                  </svg>
                  Sign in with GitHub
                </button>
              </a>
            ` : !isAuthorized ? `
              <div class="alert alert-info">
                ⚠️ You are signed in as <strong>@${req.session.githubUser.login}</strong>, but this bounty belongs to <strong>@${bounty.contributor_github_username}</strong>.
              </div>
              <a href="/auth/logout?returnTo=/claim/${bounty.id}" style="text-decoration: none;">
                <button class="btn btn-github">Sign in as different user</button>
              </a>
            ` : `
              <div class="alert alert-success">
                ✅ Signed in as <strong>@${req.session.githubUser.login}</strong>
              </div>
              
              <label for="wallet" style="display: block; margin-bottom: 8px; font-weight: 600; color: #374151;">
                Your Solana Wallet Address
              </label>
              <input 
                type="text" 
                id="wallet" 
                class="wallet-input" 
                placeholder="Enter your Solana wallet address..."
                required
              />
              
              <button class="btn btn-primary" onclick="claimBounty()">
                Claim ${bounty.bounty_amount} ${bounty.currency}
              </button>
              
              <div id="claiming-status">
                <div class="spinner"></div>
                <p>Processing your claim...</p>
              </div>
            `}
          </div>
        </div>
        
        <script>
          async function claimBounty() {
            const wallet = document.getElementById('wallet').value.trim();
            
            if (!wallet) {
              alert('Please enter your Solana wallet address');
              return;
            }
            
            // Basic Solana address validation (32-44 characters, base58)
            if (wallet.length < 32 || wallet.length > 44) {
              alert('Invalid Solana wallet address');
              return;
            }
            
            document.querySelector('.btn-primary').style.display = 'none';
            document.getElementById('claiming-status').style.display = 'block';
            
            try {
              const response = await fetch('/api/claim/${bounty.id}', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({ walletAddress: wallet })
              });
              
              const result = await response.json();
              
              if (response.ok) {
                window.location.href = '/claim/${bounty.id}/success?tx=' + result.transactionSignature;
              } else {
                alert('Error: ' + result.error);
                document.querySelector('.btn-primary').style.display = 'block';
                document.getElementById('claiming-status').style.display = 'none';
              }
            } catch (error) {
              alert('Error claiming bounty: ' + error.message);
              document.querySelector('.btn-primary').style.display = 'block';
              document.getElementById('claiming-status').style.display = 'none';
            }
          }
        </script>
      </body>
    </html>
  `);
});

/**
 * Success page after claiming
 */
router.get('/:bountyId/success', (req, res) => {
  const { bountyId } = req.params;
  const { tx } = req.query;
  
  const bounty = getBountyById(parseInt(bountyId));
  
  if (!bounty) {
    return res.status(404).send('Bounty not found');
  }
  
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Bounty Claimed! - GitWork</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
          }
          .container {
            max-width: 600px;
            background: white;
            border-radius: 16px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            padding: 60px 40px;
            text-align: center;
          }
          .success-icon {
            font-size: 80px;
            margin-bottom: 20px;
          }
          h1 {
            font-size: 32px;
            color: #10b981;
            margin-bottom: 16px;
          }
          p {
            color: #6b7280;
            font-size: 18px;
            margin-bottom: 30px;
          }
          .amount {
            font-size: 48px;
            font-weight: 700;
            color: #111827;
            margin-bottom: 30px;
          }
          .tx-link {
            background: #f3f4f6;
            padding: 16px;
            border-radius: 8px;
            margin-bottom: 30px;
            word-break: break-all;
          }
          .tx-link a {
            color: #667eea;
            text-decoration: none;
            font-family: monospace;
            font-size: 14px;
          }
          .btn {
            display: inline-block;
            padding: 16px 32px;
            background: #10b981;
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            transition: transform 0.2s;
          }
          .btn:hover {
            transform: translateY(-2px);
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="success-icon">🎉</div>
          <h1>Bounty Claimed!</h1>
          <p>Congratulations! Your reward has been sent to your wallet.</p>
          
          <div class="amount">${bounty.bounty_amount} ${bounty.currency}</div>
          
          ${tx ? `
            <div class="tx-link">
              <strong>Transaction:</strong><br>
              <a href="https://explorer.solana.com/tx/${tx}?cluster=devnet" target="_blank">
                ${tx}
              </a>
            </div>
          ` : ''}
          
          <a href="https://github.com/${bounty.github_repo_owner}/${bounty.github_repo_name}/issues/${bounty.github_issue_number}" class="btn">
            View Issue on GitHub
          </a>
        </div>
      </body>
    </html>
  `);
});

export default router;

