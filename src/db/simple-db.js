/**
 * Simple in-memory database for quick testing
 * Replace with SQLite in production
 */

class SimpleDatabase {
  constructor() {
    this.bounties = [];
    this.installations = [];
    this.activityLog = [];
    this.nextId = 1;
  }

  prepare(sql) {
    const self = this;
    
    return {
      run(...params) {
        if (sql.includes('INSERT INTO bounties')) {
          const bounty = {
            id: self.nextId++,
            github_issue_id: params[0],
            github_repo_owner: params[1],
            github_repo_name: params[2],
            github_issue_number: params[3],
            bounty_amount: params[4],
            currency: params[5],
            escrow_wallet_address: params[6],
            escrow_wallet_private_key: params[7],
            github_installation_id: params[8],
            status: params[9] || 'pending_deposit',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          self.bounties.push(bounty);
          return { lastInsertRowid: bounty.id };
        }
        
        if (sql.includes('INSERT INTO installations')) {
          const installation = {
            id: self.nextId++,
            github_installation_id: params[0],
            github_account_login: params[1],
            github_account_type: params[2],
            installed_at: new Date().toISOString()
          };
          self.installations.push(installation);
          return { lastInsertRowid: installation.id };
        }
        
        if (sql.includes('INSERT INTO activity_log')) {
          const log = {
            id: self.nextId++,
            bounty_id: params[0],
            event_type: params[1],
            event_data: params[2],
            created_at: new Date().toISOString()
          };
          self.activityLog.push(log);
          return { lastInsertRowid: log.id };
        }
        
        if (sql.includes('UPDATE bounties')) {
          const statusMatch = params.findIndex(p => typeof p === 'string' && ['pending_deposit', 'deposit_confirmed', 'ready_to_claim', 'claimed', 'cancelled'].includes(p));
          if (statusMatch !== -1) {
            const id = params[params.length - 1];
            const bounty = self.bounties.find(b => b.id === id);
            if (bounty) {
              bounty.status = params[statusMatch];
              bounty.updated_at = new Date().toISOString();
              if (bounty.status === 'deposit_confirmed') {
                bounty.deposit_confirmed_at = new Date().toISOString();
              }
              if (bounty.status === 'claimed') {
                bounty.claimed_at = new Date().toISOString();
              }
            }
          }
        }
        
        if (sql.includes('UPDATE installations')) {
          const id = params[0];
          const installation = self.installations.find(i => i.github_installation_id === id);
          if (installation) {
            installation.uninstalled_at = new Date().toISOString();
          }
        }
        
        return { changes: 1 };
      },
      
      get(...params) {
        if (sql.includes('FROM bounties')) {
          if (sql.includes('WHERE github_repo_owner')) {
            return self.bounties.find(b => 
              b.github_repo_owner === params[0] && 
              b.github_repo_name === params[1] && 
              b.github_issue_number === params[2]
            );
          }
          if (sql.includes('WHERE id')) {
            return self.bounties.find(b => b.id === params[0]);
          }
          if (sql.includes('WHERE status')) {
            return self.bounties.find(b => b.status === params[0]);
          }
        }
        
        if (sql.includes('FROM installations')) {
          if (sql.includes('WHERE github_account_login')) {
            return self.installations.find(i => 
              i.github_account_login === params[0] && 
              !i.uninstalled_at
            );
          }
        }
        
        return null;
      },
      
      all(...params) {
        if (sql.includes('FROM bounties')) {
          if (sql.includes('WHERE status')) {
            return self.bounties.filter(b => b.status === params[0]);
          }
          return self.bounties;
        }
        
        if (sql.includes('FROM installations')) {
          return self.installations;
        }
        
        if (sql.includes('FROM activity_log')) {
          return self.activityLog;
        }
        
        return [];
      }
    };
  }

  exec(sql) {
    // For migrations - just log
    console.log('📊 Database migration executed (in-memory)');
  }

  pragma(statement) {
    // Ignore pragma statements for in-memory DB
  }
}

const db = new SimpleDatabase();

export default db;

