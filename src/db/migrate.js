import db from './database.js';

function runMigrations() {
  console.log('📊 Setting up database schema...');
  
  // Just create the tables directly - no migration BS
  db.exec(`
    CREATE TABLE IF NOT EXISTS bounties (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      github_issue_id INTEGER NOT NULL UNIQUE,
      github_repo_owner TEXT NOT NULL,
      github_repo_name TEXT NOT NULL,
      github_issue_number INTEGER NOT NULL,
      github_issue_title TEXT,
      is_repo_private INTEGER NOT NULL DEFAULT 0,
      bounty_amount REAL NOT NULL,
      currency TEXT NOT NULL DEFAULT 'USDC',
      escrow_wallet_address TEXT,
      escrow_wallet_private_key TEXT,
      github_installation_id INTEGER,
      status TEXT NOT NULL DEFAULT 'pending_deposit',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      deposit_confirmed_at DATETIME,
      claimed_at DATETIME,
      cancelled_at DATETIME,
      claim_wallet_address TEXT,
      contributor_github_username TEXT,
      pull_request_number INTEGER,
      transaction_signature TEXT,
      refund_transaction TEXT,
      UNIQUE(github_repo_owner, github_repo_name, github_issue_number)
    );

    CREATE INDEX IF NOT EXISTS idx_bounties_status ON bounties(status);
    CREATE INDEX IF NOT EXISTS idx_bounties_repo ON bounties(github_repo_owner, github_repo_name);
    CREATE INDEX IF NOT EXISTS idx_bounties_escrow_wallet ON bounties(escrow_wallet_address);

    CREATE TABLE IF NOT EXISTS installations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      github_installation_id INTEGER NOT NULL UNIQUE,
      github_account_login TEXT NOT NULL,
      github_account_type TEXT NOT NULL,
      installed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      uninstalled_at DATETIME
    );

    CREATE TABLE IF NOT EXISTS activity_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      bounty_id INTEGER,
      event_type TEXT NOT NULL,
      event_data TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (bounty_id) REFERENCES bounties(id)
    );

    CREATE INDEX IF NOT EXISTS idx_activity_log_bounty ON activity_log(bounty_id);

    CREATE TABLE IF NOT EXISTS user_wallets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      github_user_id INTEGER NOT NULL UNIQUE,
      github_username TEXT NOT NULL,
      privy_wallet_address TEXT NOT NULL UNIQUE,
      privy_wallet_id TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_user_wallets_github_user_id 
    ON user_wallets(github_user_id);
  `);

  // Add new columns to bounties table if they don't exist
  try {
    db.exec(`ALTER TABLE bounties ADD COLUMN claim_type TEXT DEFAULT NULL`);
  } catch (e) {
    // Column already exists, ignore
  }
  
  try {
    db.exec(`ALTER TABLE bounties ADD COLUMN claimed_by_github_id INTEGER DEFAULT NULL`);
  } catch (e) {
    // Column already exists, ignore
  }

  try {
    db.exec(`ALTER TABLE bounties ADD COLUMN github_issue_title TEXT`);
  } catch (e) {
    // Column already exists, ignore
  }

  try {
    db.exec(`ALTER TABLE bounties ADD COLUMN is_repo_private INTEGER NOT NULL DEFAULT 0`);
  } catch (e) {
    // Column already exists, ignore
  }

  try {
    db.exec(`ALTER TABLE bounties ADD COLUMN depositor_address TEXT DEFAULT NULL`);
  } catch (e) {
    // Column already exists, ignore
  }
  
  console.log('✅ Database schema ready!');
}

// Run migrations if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runMigrations();
  process.exit(0);
}

export { runMigrations };

