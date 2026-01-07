# Africa Railways Integration Strategy

## Executive Summary

Integration plan to connect **Africoin Wallet** (Ethereum/Sepolia-based payment system) with **Africa Railways** (Sui blockchain-based railway infrastructure).

### Repository Analysis

**Africoin Wallet (scroll-waitlist-exchange-1):**
- **Tech Stack**: React + TypeScript, Supabase, Alchemy Account Kit
- **Blockchain**: Ethereum Sepolia testnet
- **Features**: Smart wallet, phone auth, railway booking UI, AI chatbot
- **Status**: Frontend complete, backend missing

**Africa Railways (africa-railways):**
- **Tech Stack**: Go backend, Sui Move blockchain, Firebase, React Native mobile
- **Blockchain**: Sui mainnet/testnet
- **Features**: Real-time telemetry, sentinel network, governance, AFRC token
- **Status**: Backend infrastructure, blockchain contracts, mobile app

---

## Integration Architecture

### Option 1: Bridge Architecture (Recommended)

```
┌─────────────────────────────────────────────────────────────┐
│                    AFRICOIN WALLET                           │
│                  (User-Facing Frontend)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Railway    │  │   Payment    │  │   Wallet     │      │
│  │   Booking    │  │   (ETH/AFC)  │  │   (Alchemy)  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    BRIDGE LAYER (NEW)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Payment    │  │   Booking    │  │   Token      │      │
│  │   Gateway    │  │   Sync       │  │   Bridge     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                  AFRICA RAILWAYS BACKEND                     │
│                    (Go + Sui Blockchain)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Railway    │  │   Sui Move   │  │   Sentinel   │      │
│  │   API        │  │   Contracts  │  │   Network    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

### Option 2: Unified Architecture

Migrate Africoin Wallet to Sui blockchain to match Africa Railways infrastructure.

---

## Integration Points

### 1. Railway Booking System

**Current State:**
- Africoin: Mock booking UI, no backend
- Africa Railways: Real Go backend with Sui contracts

**Integration:**
```typescript
// Africoin Wallet calls Africa Railways API
const bookTicket = async (booking: BookingData) => {
  // 1. User selects route in Africoin UI
  // 2. Call Africa Railways booking API
  const response = await fetch('https://africa-railways-api.com/api/v1/bookings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${userToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: booking.from,
      to: booking.to,
      date: booking.date,
      passengers: booking.passengers,
      seats: booking.seats
    })
  });
  
  const { bookingId, price, paymentAddress } = await response.json();
  
  // 3. Process payment via bridge
  await processPayment(bookingId, price);
  
  return bookingId;
};
```

### 2. Payment Processing

**Challenge**: Different blockchains (Ethereum vs Sui)

**Solution A: Cross-Chain Bridge**
```typescript
// Bridge AFC (ERC-20) to AFRC (Sui)
const bridgePayment = async (amount: string, destination: string) => {
  // 1. Lock AFC tokens on Ethereum
  const lockTx = await afcContract.lock(amount, destination);
  
  // 2. Relay proof to Sui
  const proof = await generateBridgeProof(lockTx);
  
  // 3. Mint equivalent AFRC on Sui
  const mintTx = await suiClient.executeMoveCall({
    packageObjectId: AFRC_PACKAGE_ID,
    module: 'bridge',
    function: 'mint_from_ethereum',
    arguments: [proof, amount, destination]
  });
  
  return mintTx;
};
```

**Solution B: Fiat Gateway (Simpler)**
```typescript
// Convert AFC to fiat, then purchase AFRC
const processPayment = async (bookingId: string, amountAFC: string) => {
  // 1. User pays with AFC (Ethereum)
  const ethTx = await sendAFC(PAYMENT_GATEWAY_ADDRESS, amountAFC);
  
  // 2. Backend converts to fiat
  // 3. Backend purchases AFRC on Sui
  // 4. Backend completes booking
  
  await fetch('/api/v1/payments/process', {
    method: 'POST',
    body: JSON.stringify({
      bookingId,
      ethTxHash: ethTx.hash,
      amount: amountAFC
    })
  });
};
```

### 3. User Authentication

**Current State:**
- Africoin: Supabase auth (email, phone, OAuth)
- Africa Railways: zkLogin (Sui-native)

**Integration:**
```typescript
// Unified auth system
const authenticateUser = async (credentials: AuthCredentials) => {
  // 1. Authenticate with Supabase (Africoin)
  const { user, session } = await supabase.auth.signIn(credentials);
  
  // 2. Generate Sui zkLogin proof
  const zkProof = await generateZkLoginProof(session);
  
  // 3. Create Sui wallet address
  const suiAddress = await deriveAddressFromZkProof(zkProof);
  
  // 4. Link accounts
  await linkAccounts(user.id, suiAddress);
  
  return { user, suiAddress };
};
```

### 4. Real-Time Train Tracking

**Integration:**
```typescript
// Subscribe to Africa Railways telemetry
const trackTrain = (trainNumber: string) => {
  const ws = new WebSocket('wss://africa-railways-api.com/telemetry');
  
  ws.on('message', (data) => {
    const telemetry = JSON.parse(data);
    
    // Update Africoin UI
    updateTrainPosition({
      trainNumber: telemetry.train_id,
      lat: telemetry.latitude,
      lng: telemetry.longitude,
      speed: telemetry.speed,
      status: telemetry.status
    });
  });
  
  ws.send(JSON.stringify({ subscribe: trainNumber }));
};
```

### 5. Loyalty Points System

**Integration:**
```typescript
// Sync loyalty points between systems
const syncLoyaltyPoints = async (userId: string) => {
  // 1. Get points from Africoin (Supabase)
  const { data: africoinPoints } = await supabase
    .from('loyalty_points')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  // 2. Get points from Africa Railways (Sui)
  const suiPoints = await suiClient.getObject({
    id: `${userId}_loyalty_object`,
    options: { showContent: true }
  });
  
  // 3. Sync and reconcile
  const totalPoints = africoinPoints.points_balance + suiPoints.balance;
  
  // 4. Update both systems
  await Promise.all([
    updateAfricoinPoints(userId, totalPoints),
    updateSuiPoints(userId, totalPoints)
  ]);
};
```

---

## Implementation Plan

### Phase 1: API Integration (Weeks 1-4)

**Goal**: Connect Africoin frontend to Africa Railways backend

**Tasks:**
1. **Set up API Gateway**
   - Deploy bridge service (Node.js/Express)
   - Configure CORS and authentication
   - Set up rate limiting

2. **Implement Booking API**
   ```typescript
   // src/lib/africaRailwaysAPI.ts
   export const africaRailwaysAPI = {
     searchRoutes: async (from, to, date) => {
       return await fetch(`${API_BASE}/routes/search`, {
         method: 'POST',
         body: JSON.stringify({ from, to, date })
       });
     },
     
     createBooking: async (bookingData) => {
       return await fetch(`${API_BASE}/bookings`, {
         method: 'POST',
         body: JSON.stringify(bookingData)
       });
     },
     
     getBooking: async (bookingId) => {
       return await fetch(`${API_BASE}/bookings/${bookingId}`);
     }
   };
   ```

3. **Update Africoin Components**
   - Replace mock data with real API calls
   - Add loading states and error handling
   - Implement retry logic

**Deliverables:**
- Working API integration
- Real-time route search
- Booking creation and retrieval

### Phase 2: Payment Bridge (Weeks 5-8)

**Goal**: Enable cross-chain payments

**Option A: Simple Fiat Gateway**
```typescript
// Backend service
app.post('/api/bridge/payment', async (req, res) => {
  const { ethTxHash, amount, bookingId } = req.body;
  
  // 1. Verify Ethereum transaction
  const ethTx = await ethProvider.getTransaction(ethTxHash);
  if (!ethTx || ethTx.value < amount) {
    return res.status(400).json({ error: 'Invalid transaction' });
  }
  
  // 2. Convert to fiat (via exchange API)
  const fiatAmount = await convertToFiat(amount, 'AFC', 'USD');
  
  // 3. Purchase AFRC on Sui
  const suiTx = await purchaseAFRC(fiatAmount);
  
  // 4. Complete booking
  await completeBooking(bookingId, suiTx.digest);
  
  res.json({ success: true, suiTxHash: suiTx.digest });
});
```

**Option B: Cross-Chain Bridge (Advanced)**
- Deploy bridge contracts on both chains
- Implement relayer service
- Set up validator network
- Add security measures

**Deliverables:**
- Payment processing system
- Transaction verification
- Booking confirmation

### Phase 3: User Experience (Weeks 9-12)

**Goal**: Seamless user experience

**Tasks:**
1. **Unified Dashboard**
   - Show bookings from both systems
   - Display combined loyalty points
   - Unified transaction history

2. **Real-Time Updates**
   - WebSocket integration for train tracking
   - Push notifications for booking updates
   - Live seat availability

3. **Mobile Optimization**
   - Responsive design improvements
   - PWA capabilities
   - Offline support

**Deliverables:**
- Unified user dashboard
- Real-time features
- Mobile-optimized experience

### Phase 4: Advanced Features (Weeks 13-16)

**Goal**: Leverage Africa Railways infrastructure

**Tasks:**
1. **Sentinel Network Integration**
   - Display safety reports
   - Show track worker alerts
   - Real-time incident notifications

2. **Governance Participation**
   - Allow users to vote on proposals
   - Display governance decisions
   - Stakeholder communication

3. **Analytics Dashboard**
   - Route popularity metrics
   - Price trends
   - User behavior insights

**Deliverables:**
- Sentinel network features
- Governance integration
- Analytics dashboard

---

## Technical Specifications

### API Endpoints

**Africa Railways Backend:**
```
GET  /api/v1/routes/search
POST /api/v1/bookings
GET  /api/v1/bookings/:id
GET  /api/v1/trains/:id/telemetry
GET  /api/v1/sentinel/reports
POST /api/v1/payments/verify
```

**Bridge Service (New):**
```
POST /api/bridge/payment
GET  /api/bridge/status/:txHash
POST /api/bridge/sync-loyalty
GET  /api/bridge/user/:id/bookings
```

### Database Schema

**New Tables (Supabase):**
```sql
-- Bridge transactions
CREATE TABLE bridge_transactions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  eth_tx_hash TEXT NOT NULL,
  sui_tx_hash TEXT,
  amount_afc DECIMAL NOT NULL,
  amount_afrc DECIMAL,
  status TEXT NOT NULL, -- pending, completed, failed
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

-- Railway bookings (synced from Africa Railways)
CREATE TABLE railway_bookings_sync (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  africa_railways_booking_id TEXT NOT NULL,
  route_from TEXT NOT NULL,
  route_to TEXT NOT NULL,
  departure_date DATE NOT NULL,
  seats JSONB NOT NULL,
  total_price_afrc DECIMAL NOT NULL,
  status TEXT NOT NULL,
  sui_tx_hash TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  synced_at TIMESTAMP DEFAULT NOW()
);

-- Sui wallet addresses
CREATE TABLE sui_wallets (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) UNIQUE,
  sui_address TEXT NOT NULL UNIQUE,
  zk_proof TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Environment Variables

```env
# Africa Railways API
VITE_AFRICA_RAILWAYS_API_URL=https://api.africa-railways.com
AFRICA_RAILWAYS_API_KEY=your-api-key

# Sui Blockchain
VITE_SUI_NETWORK=testnet
VITE_SUI_RPC_URL=https://fullnode.testnet.sui.io
SUI_PRIVATE_KEY=your-private-key

# Bridge Service
BRIDGE_SERVICE_URL=https://bridge.africoin.com
BRIDGE_SERVICE_API_KEY=your-bridge-key

# Payment Gateway
PAYMENT_GATEWAY_ADDRESS=0x...
PAYMENT_GATEWAY_API_KEY=your-gateway-key
```

---

## Security Considerations

### 1. Cross-Chain Security

**Risks:**
- Bridge exploits
- Replay attacks
- Double spending

**Mitigations:**
- Multi-signature validation
- Time-locked transactions
- Transaction limits
- Monitoring and alerts

### 2. API Security

**Measures:**
- JWT authentication
- Rate limiting
- Input validation
- HTTPS only
- API key rotation

### 3. User Data Protection

**Compliance:**
- GDPR compliance
- Data encryption at rest
- Secure key management
- Privacy policy updates

---

## Cost Analysis

### Development Costs

**Phase 1 (API Integration):**
- Backend development: 160 hours
- Frontend integration: 80 hours
- Testing: 40 hours
- **Total**: 280 hours

**Phase 2 (Payment Bridge):**
- Smart contract development: 120 hours
- Backend service: 100 hours
- Security audit: 80 hours
- **Total**: 300 hours

**Phase 3 (UX):**
- Frontend development: 120 hours
- Mobile optimization: 60 hours
- Testing: 40 hours
- **Total**: 220 hours

**Phase 4 (Advanced Features):**
- Feature development: 160 hours
- Integration: 80 hours
- Testing: 40 hours
- **Total**: 280 hours

**Grand Total**: 1,080 hours (~6 months with 2 developers)

### Operational Costs

**Monthly:**
- Bridge service hosting: $200
- API gateway: $150
- Database: $100
- Monitoring: $50
- **Total**: $500/month

---

## Success Metrics

### Key Performance Indicators

1. **Integration Success**
   - API response time < 500ms
   - 99.9% uptime
   - < 1% transaction failure rate

2. **User Adoption**
   - 1,000+ bookings in first month
   - 80%+ user satisfaction
   - < 5% support ticket rate

3. **Financial**
   - $50K+ transaction volume/month
   - < 2% payment processing costs
   - Positive ROI within 6 months

---

## Risks and Mitigation

### Technical Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Bridge exploit | High | Low | Security audit, insurance |
| API downtime | Medium | Medium | Redundancy, caching |
| Data sync issues | Medium | Medium | Reconciliation service |
| Blockchain congestion | Low | Medium | Gas optimization, queuing |

### Business Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Low adoption | High | Medium | Marketing, incentives |
| Regulatory issues | High | Low | Legal compliance |
| Competition | Medium | High | Unique features, UX |
| Cost overruns | Medium | Medium | Agile development |

---

## Conclusion

### Recommended Approach

**Short-term (3 months):**
1. Implement API integration (Phase 1)
2. Deploy simple fiat payment gateway
3. Launch with limited routes (pilot)

**Medium-term (6 months):**
1. Build cross-chain bridge
2. Add real-time features
3. Expand to more routes

**Long-term (12 months):**
1. Full Sui migration
2. Advanced governance features
3. Pan-African expansion

### Next Steps

1. **Week 1**: Set up development environment
2. **Week 2**: Deploy bridge service infrastructure
3. **Week 3**: Implement first API endpoint
4. **Week 4**: Test end-to-end booking flow

---

**Document Version**: 1.0
**Last Updated**: December 25, 2025
**Status**: Planning Phase
**Owner**: Africoin Development Team
