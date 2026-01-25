# SENT Airdrop Production Checklist

## Overview

This document outlines the steps to verify the $SENT airdrop system is ready for 2,000 workers to claim their tokens.

## Architecture

```
Worker Browser                    Vercel Serverless              Polygon Mainnet
     │                                  │                              │
     │  1. Connect Wallet               │                              │
     │  2. Pass Quiz (80%+)             │                              │
     │  3. Click "Claim"                │                              │
     │ ─────────────────────────────────>                              │
     │         POST /api/airdrop/sign   │                              │
     │         { address: "0x..." }     │                              │
     │                                  │                              │
     │                           4. Verify quiz_score >= 80            │
     │                           5. Check claimed == false             │
     │                           6. Mark claimed = true                │
     │                           7. Sign with ADMIN_PRIVATE_KEY        │
     │ <─────────────────────────────────                              │
     │         { payload, signature }   │                              │
     │                                  │                              │
     │  8. Submit to Airdrop Contract ─────────────────────────────────>
     │     airdropERC20WithSignature()  │                              │
     │                                  │                       9. Verify signature
     │                                  │                      10. Transfer 100 SENT
     │ <───────────────────────────────────────────────────────────────
     │         Transaction confirmed    │                              │
```

## Environment Variables (Vercel Production)

Set these in Vercel Dashboard → Settings → Environment Variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `THIRDWEB_SECRET_KEY` | Backend API key from thirdweb.com | `abc123...` |
| `ADMIN_PRIVATE_KEY` | Wallet that approved SENT spending | `0x...` (64 hex chars) |
| `SUPABASE_URL` | Database URL | `https://llvprbmrnjvamjzavmhg.supabase.co` |
| `SUPABASE_SERVICE_KEY` | Service role key (not anon key) | `eyJ...` |

## Pre-Launch Checklist

### 1. Smart Contract Setup ✓

- [x] SENT Token deployed: `0x75CaEb2c62D8E29DAE0cdFde6775B898Dee43f46`
- [x] Airdrop Contract deployed: `0x7175F1b0A27ebD20Cb9CA00f915C6670b4596bcf`
- [ ] Admin wallet (`0xfcfa02a852551618f544fbce52908a0f941abef9`) has approved Airdrop contract
- [ ] Airdrop contract has sufficient SENT tokens (200,000+ for 2,000 workers)

### 2. Admin Wallet Setup

- [ ] Admin wallet has 1-2 POL for gas fees
- [ ] Admin wallet private key is set in Vercel environment
- [ ] Verify approval: Check on PolygonScan that admin approved Airdrop contract

### 3. Database Setup

- [ ] `airdrop_status` table exists in Supabase
- [ ] Table has columns: `wallet_address`, `quiz_score`, `claimed`, `claim_tx_hash`, `claimed_at`
- [ ] Service role key is set in Vercel environment

### 4. API Endpoint Verification

Test the signing endpoint:

```bash
# Replace with your production URL
curl -X POST https://your-app.vercel.app/api/airdrop/sign \
  -H "Content-Type: application/json" \
  -d '{"address": "0xYourTestWallet"}'
```

Expected responses:
- `403 Unauthorized` - Wallet not in database or quiz_score < 80
- `200 OK` with `{ payload, signature }` - Ready to claim

### 5. Frontend Verification

- [ ] ClaimButton component renders correctly
- [ ] Wallet connection works (thirdweb ConnectButton)
- [ ] Quiz completion updates `airdrop_status.quiz_score`
- [ ] Claim button calls `/api/airdrop/sign` with wallet address
- [ ] Transaction submits to Polygon successfully

### 6. Help Page

- [ ] `/airdrop/help` page is accessible
- [ ] Instructions for adding SENT to MetaMask are clear
- [ ] FAQ covers common issues

## Testing Flow

### Manual Test (Recommended Before Launch)

1. **Add test entry to Supabase:**
   ```sql
   INSERT INTO airdrop_status (wallet_address, quiz_score, claimed)
   VALUES ('0xYourTestWallet', 100, false);
   ```

2. **Connect test wallet to frontend**

3. **Click Claim button**

4. **Verify on PolygonScan:**
   - Transaction succeeded
   - 100 SENT transferred to test wallet

5. **Verify in Supabase:**
   - `claimed` = true
   - `claim_tx_hash` populated
   - `claimed_at` timestamp set

6. **Clean up test data:**
   ```sql
   DELETE FROM airdrop_status WHERE wallet_address = '0xYourTestWallet';
   ```

### Automated Test Script

```bash
# Run from project root with credentials
SUPABASE_URL=https://llvprbmrnjvamjzavmhg.supabase.co \
SUPABASE_SERVICE_KEY=your_key \
node scripts/test-airdrop-flow.js
```

## Monitoring

### During Launch

1. Monitor Supabase for claim activity:
   ```sql
   SELECT COUNT(*) as total_claims, 
          COUNT(CASE WHEN claimed THEN 1 END) as completed
   FROM airdrop_status;
   ```

2. Monitor admin wallet POL balance

3. Check Vercel function logs for errors

### Post-Launch

1. Export claim data:
   ```sql
   SELECT wallet_address, claimed_at, claim_tx_hash 
   FROM airdrop_status 
   WHERE claimed = true
   ORDER BY claimed_at;
   ```

## Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| "Unauthorized" error | Quiz score < 80 or already claimed | Check `airdrop_status` table |
| Transaction reverts | Signature invalid or already used | Check admin wallet approval |
| No SENT received | Wrong network | Ensure wallet is on Polygon |
| API timeout | Thirdweb rate limit | Add retry logic or upgrade plan |

## Contract Addresses Reference

| Contract | Address | Network |
|----------|---------|---------|
| SENT Token | `0x75CaEb2c62D8E29DAE0cdFde6775B898Dee43f46` | Polygon Mainnet |
| Airdrop Contract | `0x7175F1b0A27ebD20Cb9CA00f915C6670b4596bcf` | Polygon Mainnet |
| Admin Wallet | `0xfcfa02a852551618f544fbce52908a0f941abef9` | Polygon Mainnet |

## Support

Workers can access help at `/airdrop/help` for:
- Adding SENT token to MetaMask
- Troubleshooting claim issues
- FAQ for common questions
