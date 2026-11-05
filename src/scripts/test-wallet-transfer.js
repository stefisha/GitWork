import dotenv from 'dotenv';
import { Connection, PublicKey, Keypair } from '@solana/web3.js';
import { 
  getAssociatedTokenAddress, 
  getAccount,
  createAssociatedTokenAccountInstruction,
  createTransferInstruction,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID
} from '@solana/spl-token';
import bs58 from 'bs58';

dotenv.config();

const connection = new Connection(process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com');
const USDC_MINT = process.env.USDC_MINT_ADDRESS || '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU';

// Test: Send 0.01 USDC from fee payer to itself (should work)
async function testWalletTransfer() {
  console.log('🧪 Testing Wallet-to-Wallet Transfer...\n');

  // Get fee payer wallet
  const feePayerKey = process.env.SOLANA_FEE_PAYER_PRIVATE_KEY;
  if (!feePayerKey) {
    console.error('❌ SOLANA_FEE_PAYER_PRIVATE_KEY not found in .env');
    process.exit(1);
  }

  const feePayer = Keypair.fromSecretKey(bs58.decode(feePayerKey));
  console.log(`👛 Fee Payer Wallet: ${feePayer.publicKey.toBase58()}`);

  // Check SOL balance
  const solBalance = await connection.getBalance(feePayer.publicKey);
  console.log(`💰 SOL Balance: ${solBalance / 1e9} SOL`);

  if (solBalance < 5000) {
    console.error('❌ Insufficient SOL for transaction fees');
    process.exit(1);
  }

  // Get fee payer's USDC token account
  const feePayerTokenAccount = await getAssociatedTokenAddress(
    new PublicKey(USDC_MINT),
    feePayer.publicKey
  );

  console.log(`📦 Fee Payer Token Account: ${feePayerTokenAccount.toBase58()}`);

  // Check USDC balance
  let usdcBalance = 0;
  try {
    const accountInfo = await getAccount(connection, feePayerTokenAccount);
    usdcBalance = Number(accountInfo.amount) / 1_000_000;
    console.log(`💵 USDC Balance: ${usdcBalance} USDC\n`);
  } catch (error) {
    console.log('⚠️  No USDC token account found\n');
  }

  if (usdcBalance < 0.01) {
    console.log('⚠️  Insufficient USDC for test (need at least 0.01 USDC)');
    console.log('📝 This test will create a token account but cannot transfer USDC\n');
  }

  // Create a test recipient wallet (or use fee payer as recipient for testing)
  const testRecipient = Keypair.generate();
  console.log(`🎯 Test Recipient: ${testRecipient.publicKey.toBase58()}\n`);

  // Get recipient token account
  const recipientTokenAccount = await getAssociatedTokenAddress(
    new PublicKey(USDC_MINT),
    testRecipient.publicKey
  );

  console.log(`📦 Recipient Token Account: ${recipientTokenAccount.toBase58()}\n`);

  // Check if recipient token account exists
  const instructions = [];
  let accountExists = false;

  try {
    await getAccount(connection, recipientTokenAccount);
    console.log('✅ Recipient token account already exists\n');
    accountExists = true;
  } catch (error) {
    console.log('🔨 Recipient token account does NOT exist - will create it\n');
    
    // Create the token account
    const createAccountIx = createAssociatedTokenAccountInstruction(
      feePayer.publicKey,
      recipientTokenAccount,
      testRecipient.publicKey,
      new PublicKey(USDC_MINT),
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    );
    
    instructions.push(createAccountIx);
    console.log('📝 Added instruction: Create Associated Token Account');
  }

  // Only add transfer if we have USDC
  if (usdcBalance >= 0.01) {
    const transferAmount = 0.01; // 0.01 USDC
    const transferIx = createTransferInstruction(
      feePayerTokenAccount,
      recipientTokenAccount,
      feePayer.publicKey,
      transferAmount * 1_000_000, // Convert to micro-USDC
      [],
      TOKEN_PROGRAM_ID
    );
    
    instructions.push(transferIx);
    console.log(`📝 Added instruction: Transfer ${transferAmount} USDC\n`);
  }

  if (instructions.length === 0) {
    console.log('⚠️  No instructions to execute (no USDC to transfer)');
    process.exit(0);
  }

  // Build and send transaction
  console.log('🚀 Building transaction...');
  
  const { TransactionMessage, VersionedTransaction } = await import('@solana/web3.js');
  
  const recentBlockhash = await connection.getLatestBlockhash();
  
  const message = new TransactionMessage({
    payerKey: feePayer.publicKey,
    recentBlockhash: recentBlockhash.blockhash,
    instructions: instructions,
  }).compileToV0Message();
  
  const transaction = new VersionedTransaction(message);
  transaction.sign([feePayer]);
  
  console.log('📡 Sending transaction...');
  
  try {
    const signature = await connection.sendTransaction(transaction);
    console.log(`✅ Transaction sent: ${signature}\n`);
    
    console.log('⏳ Confirming transaction...');
    const confirmation = await connection.confirmTransaction({
      signature,
      blockhash: recentBlockhash.blockhash,
      lastValidBlockHeight: recentBlockhash.lastValidBlockHeight
    });
    
    if (confirmation.value.err) {
      console.error('❌ Transaction failed:', confirmation.value.err);
    } else {
      console.log('✅ Transaction confirmed!\n');
      console.log(`🔗 View on Solana Explorer:`);
      console.log(`   https://explorer.solana.com/tx/${signature}?cluster=devnet\n`);
      
      if (usdcBalance >= 0.01) {
        console.log('🎉 SUCCESS! Wallet-to-wallet transfer works!');
        console.log('✅ Token account creation works');
        console.log('✅ USDC transfer works');
      } else {
        console.log('✅ Token account creation works!');
        console.log('⚠️  Could not test USDC transfer (no balance)');
      }
    }
  } catch (error) {
    console.error('❌ Transaction error:', error.message);
    if (error.logs) {
      console.error('\n📋 Transaction logs:');
      error.logs.forEach(log => console.error('  ', log));
    }
  }
}

testWalletTransfer().catch(console.error);

