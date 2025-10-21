/**
 * Direct test of the webhook processing logic
 */

import db from './src/db/simple-db.js';
import { processBountyLabel } from './src/services/bounty.js';

console.log('🧪 Testing webhook processing directly...\n');

// Test installation processing
console.log('📦 Testing installation processing...');
const stmt = db.prepare(`
  INSERT INTO installations (github_installation_id, github_account_login, github_account_type)
  VALUES (?, ?, ?)
`);

try {
  const result = stmt.run(12345, 'test-user', 'User');
  console.log('✅ Installation created with ID:', result.lastInsertRowid);
} catch (error) {
  console.error('❌ Installation error:', error.message);
}

// Test bounty processing
console.log('\n💰 Testing bounty processing...');
const mockIssue = {
  id: 1,
  number: 42,
  title: 'Add dark mode support',
  labels: [
    { name: 'Octavian:USDC:50' },
    { name: 'enhancement' }
  ],
  repository: {
    owner: { login: 'test-user' },
    name: 'test-repo'
  }
};

try {
  const bounty = await processBountyLabel(mockIssue, 12345);
  console.log('✅ Bounty processed:', bounty);
} catch (error) {
  console.error('❌ Bounty error:', error.message);
  console.error('Stack:', error.stack);
}

// Check database state
console.log('\n📊 Database state:');
console.log('Installations:', db.installations.length);
console.log('Bounties:', db.bounties.length);
console.log('Activity logs:', db.activityLog.length);

if (db.installations.length > 0) {
  console.log('Installation details:', db.installations[0]);
}

if (db.bounties.length > 0) {
  console.log('Bounty details:', db.bounties[0]);
}
