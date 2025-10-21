/**
 * Simple webhook test to debug the 500 error
 */

import axios from 'axios';
import crypto from 'crypto';

const WEBHOOK_URL = 'http://localhost:3000/api/webhooks/github';
const WEBHOOK_SECRET = '0672L5FUSQV6rNuhOBGvN9Wt8ryqFSxi';

function createSignature(payload, secret) {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(JSON.stringify(payload));
  return 'sha256=' + hmac.digest('hex');
}

// Simple installation payload
const payload = {
  action: 'created',
  installation: {
    id: 12345,
    account: {
      login: 'test-user',
      type: 'User'
    }
  }
};

const signature = createSignature(payload, WEBHOOK_SECRET);

console.log('🧪 Testing simple webhook...');
console.log('URL:', WEBHOOK_URL);
console.log('Secret:', WEBHOOK_SECRET.substring(0, 10) + '...');
console.log('Signature:', signature.substring(0, 20) + '...');

try {
  const response = await axios.post(WEBHOOK_URL, payload, {
    headers: {
      'Content-Type': 'application/json',
      'X-GitHub-Event': 'installation',
      'X-GitHub-Delivery': crypto.randomUUID(),
      'X-Hub-Signature-256': signature,
    },
  });

  console.log('✅ Webhook sent successfully!');
  console.log('Status:', response.status);
  console.log('Response:', response.data);
} catch (error) {
  console.error('❌ Error:', error.message);
  if (error.response) {
    console.error('Status:', error.response.status);
    console.error('Response:', error.response.data);
  }
}

