import express from 'express';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables FIRST before importing any modules that use them!
dotenv.config();

console.log('🔑 Webhook Secret loaded:', process.env.GITHUB_WEBHOOK_SECRET ? 'YES ✅' : 'NO ❌');
console.log('🔑 Secret value:', process.env.GITHUB_WEBHOOK_SECRET);

// NOW import modules that depend on environment variables
import webhookRoutes from './routes/webhooks.js';
import { runMigrations } from './db/migrate.js';
import depositMonitor from './services/deposit-monitor.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS for development
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Routes
app.use('/api/webhooks', webhookRoutes);

// Simulation endpoint for testing
app.post('/api/simulate-deposit', async (req, res) => {
  try {
    const { getBountyByStatus, updateBountyStatus } = await import('./services/bounty.js');
    const { postIssueComment, generateDepositConfirmedComment } = await import('./services/github.js');
    
    console.log('🔍 Simulating deposit...');
    
    const pendingBounties = getBountyByStatus('pending_deposit');
    
    if (pendingBounties.length === 0) {
      return res.status(404).json({ error: 'No pending bounties found' });
    }
    
    const latestBounty = pendingBounties[pendingBounties.length - 1];
    console.log('Found bounty:', {
      id: latestBounty.id,
      issue: latestBounty.github_issue_number,
      amount: latestBounty.bounty_amount,
      wallet: latestBounty.escrow_wallet_address
    });
    
    // Update status to deposit_confirmed
    updateBountyStatus(latestBounty.id, 'deposit_confirmed');
    console.log('✅ Updated bounty status to deposit_confirmed');
    
    // Post confirmation comment
    const comment = generateDepositConfirmedComment(
      latestBounty.bounty_amount,
      latestBounty.currency
    );
    
    await postIssueComment(
      latestBounty.github_installation_id,
      latestBounty.github_repo_owner,
      latestBounty.github_repo_name,
      latestBounty.github_issue_number,
      comment
    );
    
    console.log('💬 Posted confirmation comment!');
    
    res.json({ 
      success: true, 
      message: 'Deposit simulated successfully!',
      bounty: {
        id: latestBounty.id,
        issue: latestBounty.github_issue_number,
        amount: latestBounty.bounty_amount
      }
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'GitWork API',
    version: '1.0.0',
    description: 'Turn GitHub issues into instant bounties on Solana',
    endpoints: {
      health: '/api/webhooks/health',
      githubWebhook: '/api/webhooks/github'
    }
  });
});

// Initialize database and start server
async function start() {
  try {
    console.log('🚀 Starting GitWork...');
    
    // Run database migrations
    console.log('📊 Initializing database...');
    runMigrations();
    
    // Start the server
    app.listen(PORT, () => {
      console.log(`✅ GitWork API running on port ${PORT}`);
      console.log(`📡 Webhook endpoint: http://localhost:${PORT}/api/webhooks/github`);
      console.log(`🔍 Health check: http://localhost:${PORT}/api/webhooks/health`);
      
      // Start deposit monitoring service
      depositMonitor.start();
      
      if (process.env.NODE_ENV === 'development') {
        console.log('\n⚠️  Running in development mode');
        console.log('💡 Use ngrok or similar to expose webhooks to GitHub:');
        console.log('   ngrok http 3000');
      }
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

start();

