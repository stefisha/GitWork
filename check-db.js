/**
 * Quick database inspector
 * Shows what happened after webhook tests
 */

import db from './src/db/simple-db.js';

console.log('🔍 GitWork Database Status After Webhook Tests\n');

console.log('📦 INSTALLATIONS:');
console.log('================');
if (db.installations.length === 0) {
  console.log('No installations found');
} else {
  db.installations.forEach(install => {
    console.log(`✅ App installed by: ${install.github_account_login}`);
    console.log(`   Installation ID: ${install.github_installation_id}`);
    console.log(`   Installed at: ${install.installed_at}`);
    console.log('');
  });
}

console.log('💰 BOUNTIES:');
console.log('============');
if (db.bounties.length === 0) {
  console.log('No bounties found');
} else {
  db.bounties.forEach(bounty => {
    console.log(`✅ Bounty #${bounty.github_issue_number} in ${bounty.github_repo_owner}/${bounty.github_repo_name}`);
    console.log(`   Amount: ${bounty.bounty_amount} ${bounty.currency}`);
    console.log(`   Status: ${bounty.status}`);
    console.log(`   Escrow Wallet: ${bounty.escrow_wallet_address}`);
    console.log(`   Created: ${bounty.created_at}`);
    console.log('');
  });
}

console.log('📝 ACTIVITY LOG:');
console.log('================');
if (db.activityLog.length === 0) {
  console.log('No activity logged');
} else {
  db.activityLog.forEach(log => {
    console.log(`✅ ${log.event_type} - ${log.created_at}`);
    if (log.event_data) {
      try {
        const data = JSON.parse(log.event_data);
        console.log(`   Data: ${JSON.stringify(data, null, 2)}`);
      } catch (e) {
        console.log(`   Data: ${log.event_data}`);
      }
    }
    console.log('');
  });
}

console.log('🎯 SUMMARY:');
console.log('============');
console.log(`📦 Installations: ${db.installations.length}`);
console.log(`💰 Bounties: ${db.bounties.length}`);
console.log(`📝 Activities: ${db.activityLog.length}`);

if (db.bounties.length > 0) {
  console.log('\n🎉 SUCCESS! The webhook test created a bounty!');
  console.log('💡 Next step: Send USDC to the escrow wallet to activate it');
} else {
  console.log('\n⚠️  No bounties were created. Check server logs for errors.');
}
