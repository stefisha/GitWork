/**
 * Test environment variables
 */

console.log('🔍 Environment Variables Check:');
console.log('GITHUB_APP_ID:', process.env.GITHUB_APP_ID);
console.log('GITHUB_PRIVATE_KEY_PATH:', process.env.GITHUB_PRIVATE_KEY_PATH);
console.log('GITHUB_WEBHOOK_SECRET:', process.env.GITHUB_WEBHOOK_SECRET ? 'Set' : 'Not set');

// Test reading the private key
import { readFileSync } from 'fs';

try {
  const privateKey = readFileSync('./private-key.pem', 'utf8');
  console.log('✅ Private key file readable');
  console.log('Private key starts with:', privateKey.substring(0, 30) + '...');
} catch (error) {
  console.error('❌ Private key file error:', error.message);
}

