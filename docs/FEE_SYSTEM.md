# GitWork Fee System

## Overview

GitWork has a flexible platform fee system that can be enabled/disabled via environment variables. During the **alpha phase**, all fees are set to **0%**, meaning contributors receive 100% of bounty amounts.

## Configuration

### Environment Variables

Add these to your `.env` file:

```bash
# Platform fee as a decimal (0.05 = 5%)
# Set to 0 for no fees during alpha
PLATFORM_FEE_PERCENTAGE=0

# Revenue wallet (private key in base58)
# Defaults to fee payer wallet if not set
PLATFORM_REVENUE_WALLET=<your-revenue-wallet-private-key>
```

### Current Settings (Alpha)

```bash
PLATFORM_FEE_PERCENTAGE=0
```

This means:
- ✅ Contributors get **100%** of bounty amounts
- ✅ "No fees during alpha" shown throughout UI
- ✅ No revenue collection happens
- ✅ Platform only pays gas fees

## How It Works

### Fee Calculation

The system automatically calculates fees based on the `PLATFORM_FEE_PERCENTAGE`:

```javascript
// Example with 5% fee (when enabled)
Bounty Amount: 100 USDC
Platform Fee (5%): 5 USDC
Contributor Receives: 95 USDC

// During alpha (0% fee)
Bounty Amount: 100 USDC
Platform Fee (0%): 0 USDC
Contributor Receives: 100 USDC ← Full amount
```

### Payment Flow

1. **Bounty Created**: Funds deposited to escrow wallet
2. **PR Merged**: Claim link sent to contributor
3. **Claim Initiated**: 
   - If `PLATFORM_FEE_PERCENTAGE > 0`:
     - Contributor receives: `amount - fee`
     - Platform receives: `fee` (to revenue wallet)
   - If `PLATFORM_FEE_PERCENTAGE = 0`:
     - Contributor receives: full `amount`
     - Platform receives: nothing

## Enabling Fees

When you're ready to enable fees (post-alpha):

### Step 1: Set Fee Percentage

```bash
# In .env
PLATFORM_FEE_PERCENTAGE=0.05  # 5%
```

### Step 2: Set Revenue Wallet (Optional)

If you want fees to go to a different wallet than the gas payer:

```bash
PLATFORM_REVENUE_WALLET=your_base58_private_key_here
```

### Step 3: Restart Server

```bash
pm2 restart gitwork
```

That's it! The system will automatically:
- ✅ Calculate and deduct fees
- ✅ Update UI to show fee percentage
- ✅ Collect fees to revenue wallet
- ✅ Update all displays to reflect active fees

## API Endpoints

### Get Current Fee Info

```bash
GET /api/fees/info

Response:
{
  "feePercentage": 0,
  "isAlpha": true,
  "message": "No fees during alpha"
}
```

### Calculate Fee for Amount

```bash
GET /api/fees/calculate?amount=100&currency=USDC

Response (during alpha):
{
  "totalAmount": 100,
  "currency": "USDC",
  "text": "No fees during alpha",
  "netAmount": 100,
  "displayAmount": "100 USDC",
  "feeAmount": "0",
  "showFee": false
}

Response (with 5% fee):
{
  "totalAmount": 100,
  "currency": "USDC",
  "text": "5% platform fee",
  "netAmount": 95,
  "displayAmount": "95 USDC",
  "feeAmount": "5 USDC",
  "showFee": true
}
```

## Frontend Integration

### Display Fee Information

Use the `<FeeInfo>` component:

```jsx
import FeeInfo from '../components/FeeInfo';

// Simple inline display
<FeeInfo />
// Shows: "No fees during alpha"

// With specific bounty amount
<FeeInfo amount={100} currency="USDC" />
// Shows: "No fees during alpha (You'll receive: 100 USDC)"

// Detailed breakdown
<FeeInfo amount={100} currency="USDC" showDetailed={true} />
// Shows:
// Bounty Amount: 100 USDC
// ✨ No fees during alpha
// You'll Receive: 100 USDC
```

When fees are enabled (e.g., 5%):

```jsx
<FeeInfo amount={100} currency="USDC" showDetailed={true} />
// Shows:
// Bounty Amount: 100 USDC
// Platform Fee (5%): - 5 USDC
// You'll Receive: 95 USDC
```

## Future: Tiered Fees

The infrastructure supports tiered fees. To implement later:

```javascript
// In src/utils/fees.js
export function calculateFee(bountyAmount) {
  const basePercentage = config.PLATFORM_FEE_PERCENTAGE;
  
  if (basePercentage === 0) {
    return { fee: 0, netAmount: bountyAmount, feePercentage: 0, isAlpha: true };
  }
  
  // Tiered pricing
  let feePercentage;
  if (bountyAmount < 10) {
    feePercentage = 0.10; // 10% for small bounties
  } else if (bountyAmount < 50) {
    feePercentage = 0.07; // 7% for medium
  } else if (bountyAmount < 100) {
    feePercentage = 0.05; // 5% for large
  } else {
    feePercentage = 0.03; // 3% for huge bounties
  }
  
  const fee = bountyAmount * feePercentage;
  const netAmount = bountyAmount - fee;
  
  return {
    fee: parseFloat(fee.toFixed(6)),
    netAmount: parseFloat(netAmount.toFixed(6)),
    feePercentage: feePercentage * 100,
    isAlpha: false
  };
}
```

## Code Structure

### Backend Files

- **`src/config.js`**: Environment variable configuration
- **`src/utils/fees.js`**: Fee calculation logic
- **`src/services/privy.js`**: Payment processing with fee handling
- **`src/routes/api-fees.js`**: Fee information API endpoints

### Frontend Files

- **`gitwork-front/src/components/FeeInfo.jsx`**: Fee display component
- **`gitwork-front/src/pages/AboutPage.jsx`**: Updated to show "No fees during alpha"

## Industry Comparison

| Platform | Fee Structure |
|----------|---------------|
| Upwork | 20% (first $500), 10% ($500-$10k), 5% ($10k+) |
| Fiverr | 20% |
| Gitcoin | 10-15% |
| Coinbase | 1-2% |
| Stripe | 2.9% + $0.30 |
| **GitWork (Alpha)** | **0%** ← You are here |
| **GitWork (Planned)** | **5%** ← Competitive! |

## Logging

The system logs fee information:

```
🎁 Alpha mode: No platform fees (contributor receives full 100 USDC)
💸 Transferring 100 USDC from <escrow> to <contributor>
✅ Sponsored USDC transfer successful
```

When fees are enabled:

```
💰 Platform fee (5%): 5 USDC
💵 Contributor receives: 95 USDC
💸 Transferring 95 USDC from <escrow> to <contributor>
✅ Sponsored USDC transfer successful
💰 Collecting platform fee: 5 USDC to <revenue-wallet>
✅ Platform fee collected
```

## Security Notes

- ⚠️ **Never commit** `PLATFORM_REVENUE_WALLET` private key to git
- ⚠️ Keep revenue wallet private key in `.env` only
- ⚠️ Revenue wallet can be the same as fee payer wallet initially
- ⚠️ Consider using a separate revenue wallet for accounting

## Testing

Test fee calculation:

```bash
# Get current fee info
curl http://localhost:3000/api/fees/info

# Calculate fee for 100 USDC
curl http://localhost:3000/api/fees/calculate?amount=100&currency=USDC

# Calculate fee for 50 SOL
curl http://localhost:3000/api/fees/calculate?amount=50&currency=SOL
```

## Summary

✅ **Infrastructure is ready** - Just change `.env` when you want to enable fees  
✅ **Currently**: 0% fees during alpha (contributors get 100%)  
✅ **Future**: Set `PLATFORM_FEE_PERCENTAGE=0.05` and restart server  
✅ **Transparent**: UI automatically updates to show fee structure  
✅ **Flexible**: Easy to implement tiered fees later  

