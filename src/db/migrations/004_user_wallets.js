/**
 * Migration 004: User Wallets
 * Creates user_wallets table for GitWork Wallet feature
 * One wallet per GitHub user (instead of per bounty)
 */

export function up(db) {
  console.log('📊 Running migration 004: Creating user_wallets table...');
  
  // Create user_wallets table
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_wallets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      github_user_id INTEGER NOT NULL UNIQUE,
      github_username TEXT NOT NULL,
      privy_wallet_address TEXT NOT NULL UNIQUE,
      privy_wallet_id TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // Add index for fast lookups by GitHub user ID
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_user_wallets_github_user_id 
    ON user_wallets(github_user_id)
  `);
  
  // Add claim_type column to bounties table to track how bounty was claimed
  db.exec(`
    ALTER TABLE bounties 
    ADD COLUMN claim_type TEXT DEFAULT NULL
  `);
  
  // Add claimed_by_github_id to track which GitHub user claimed (by ID, not username)
  db.exec(`
    ALTER TABLE bounties 
    ADD COLUMN claimed_by_github_id INTEGER DEFAULT NULL
  `);
  
  // claim_type values:
  // - NULL: not claimed yet
  // - 'direct': claimed directly to user's own wallet
  // - 'wallet': claimed to GitWork wallet (kept in balance)
  
  console.log('✅ Migration 004 complete: user_wallets table created');
}

export function down(db) {
  console.log('📊 Rolling back migration 004...');
  
  db.exec('DROP TABLE IF EXISTS user_wallets');
  
  // Note: SQLite doesn't support DROP COLUMN, so we'd need to recreate the table
  // For now, just leave the claim_type column (it won't hurt)
  
  console.log('✅ Migration 004 rolled back');
}

