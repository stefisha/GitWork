# ✅ SOL Support Added!

GitWork now supports both **USDC** and **SOL** bounties on Solana mainnet!

---

## 🎯 What's New

### Supported Currencies:
- ✅ **USDC** (SPL Token) - Stablecoin
- ✅ **SOL** (Native) - Solana's native token

---

## 📝 How to Use

### Create a USDC Bounty:
```
Label: Octavian:USDC:5
```
- Repo owner sends 5 USDC to escrow
- Contributor receives 5 USDC

### Create a SOL Bounty:
```
Label: Octavian:SOL:0.01
```
- Repo owner sends 0.01 SOL to escrow
- Contributor receives 0.01 SOL

---

## 🔧 Technical Changes

### 1. **Updated `transferBountyFunds()` in `src/services/privy.js`**
- Added `currency` parameter (defaults to 'USDC')
- Checks currency type and creates appropriate transfer instruction:
  - **SOL**: Uses `SystemProgram.transfer()` (native transfer)
  - **USDC**: Uses SPL token transfer (existing logic)

### 2. **Updated `src/routes/api-claim.js`**
- Now passes `bounty.currency` to `transferBountyFunds()`

### 3. **Deposit Monitor**
- Already supported both currencies via `checkBountyDeposit()`
- Checks SOL balance for SOL bounties
- Checks USDC token account for USDC bounties

---

## 💰 Transfer Differences

### USDC Transfer:
- Creates SPL token transfer instruction
- Requires token accounts for sender and recipient
- Amount: `amount * 1_000_000` (6 decimals)
- Fee payer covers gas (~0.000005 SOL)

### SOL Transfer:
- Creates native transfer instruction (simpler!)
- Direct wallet-to-wallet transfer
- Amount: `amount * 1_000_000_000` (9 decimals)
- Fee payer covers gas (~0.000005 SOL)

---

## 🧪 Testing

### Test SOL Bounty:

1. **Create Issue:**
   - Add label: `Octavian:SOL:0.001`
   - Bot comments with escrow address

2. **Fund Bounty:**
   - Send 0.001 SOL to escrow address
   - Wait for deposit confirmation (~30s)

3. **Claim Bounty:**
   - Create PR with `#issue-number`
   - Merge PR
   - Click claim link
   - Receive SOL!

### Test USDC Bounty:
Same flow, but with `Octavian:USDC:0.5` label

---

## ⚠️ Important Notes

### SOL vs USDC:

**USDC Advantages:**
- ✅ Stablecoin (1 USDC = $1 USD always)
- ✅ Better for predictable bounty values
- ✅ No price volatility

**SOL Advantages:**
- ✅ Simpler transfers (no token accounts)
- ✅ Native Solana token
- ✅ Lower transaction complexity

**SOL Disadvantages:**
- ❌ Price volatility (SOL price fluctuates)
- ❌ Bounty value changes with market
- ❌ Less predictable for contributors

---

## 📊 Code Changes Summary

**Files Modified:**
1. `src/services/privy.js` - Added SOL transfer logic (~60 lines)
2. `src/routes/api-claim.js` - Pass currency parameter (~1 line)

**Total Lines Added:** ~60 lines
**Complexity:** Low (SOL transfers are actually simpler than USDC!)

---

## 🚀 Status

✅ **SOL support is LIVE and ready to test on mainnet!**

You can now create bounties in both USDC and SOL. The system automatically detects the currency from the label and handles the transfer accordingly.

---

*Last Updated: October 21, 2025*
*Network: Solana Mainnet Beta*

