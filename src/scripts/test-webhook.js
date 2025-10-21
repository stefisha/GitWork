/**
 * Test script to simulate GitHub webhook events
 * Usage: node src/scripts/test-webhook.js
 */

import axios from 'axios';
import crypto from 'crypto';

const WEBHOOK_URL = process.env.WEBHOOK_URL || 'http://localhost:3000/api/webhooks/github';
const WEBHOOK_SECRET = process.env.GITHUB_WEBHOOK_SECRET || 'development-secret';

/**
 * Create GitHub webhook signature
 */
function createSignature(payload, secret) {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(JSON.stringify(payload));
  return 'sha256=' + hmac.digest('hex');
}

/**
 * Send a test webhook
 */
async function sendWebhook(eventName, payload) {
  const signature = createSignature(payload, WEBHOOK_SECRET);

  try {
    const response = await axios.post(WEBHOOK_URL, payload, {
      headers: {
        'Content-Type': 'application/json',
        'X-GitHub-Event': eventName,
        'X-GitHub-Delivery': crypto.randomUUID(),
        'X-Hub-Signature-256': signature,
      },
    });

    console.log(`✅ ${eventName} webhook sent successfully`);
    console.log(`   Status: ${response.status}`);
  } catch (error) {
    console.error(`❌ Error sending ${eventName} webhook:`, error.message);
  }
}

/**
 * Test: Issue labeled with bounty
 */
async function testIssueLabeledWithBounty() {
  const payload = {
    action: 'labeled',
    issue: {
      id: 1,
      number: 42,
      title: 'Add dark mode support',
      body: 'We need dark mode for better UX',
      labels: [
        { name: 'Octavian:USDC:50' },
        { name: 'enhancement' }
      ],
      state: 'open',
      user: {
        login: 'repo-owner'
      }
    },
    label: {
      name: 'Octavian:USDC:50'
    },
    repository: {
      id: 123456,
      name: 'test-repo',
      full_name: 'repo-owner/test-repo',
      owner: {
        login: 'repo-owner',
        type: 'User'
      }
    },
    installation: {
      id: 12345
    }
  };

  await sendWebhook('issues', payload);
}

/**
 * Test: PR merged that closes an issue
 */
async function testPullRequestMerged() {
  const payload = {
    action: 'closed',
    pull_request: {
      id: 2,
      number: 15,
      title: 'Implement dark mode',
      body: 'This PR implements dark mode.\n\nFixes #42',
      state: 'closed',
      merged: true,
      merged_at: new Date().toISOString(),
      user: {
        login: 'contributor-username'
      }
    },
    repository: {
      id: 123456,
      name: 'test-repo',
      full_name: 'repo-owner/test-repo',
      owner: {
        login: 'repo-owner',
        type: 'User'
      }
    },
    installation: {
      id: 12345
    }
  };

  await sendWebhook('pull_request', payload);
}

/**
 * Test: Installation created
 */
async function testInstallationCreated() {
  const payload = {
    action: 'created',
    installation: {
      id: 12345,
      account: {
        login: 'repo-owner',
        type: 'User'
      }
    }
  };

  await sendWebhook('installation', payload);
}

// Run tests
async function runTests() {
  console.log('🧪 Running webhook tests...\n');

  await testInstallationCreated();
  await new Promise(r => setTimeout(r, 1000));

  await testIssueLabeledWithBounty();
  await new Promise(r => setTimeout(r, 1000));

  await testPullRequestMerged();

  console.log('\n✅ All tests completed!');
  console.log('💡 Check your server logs and database to verify the results');
}

runTests();


