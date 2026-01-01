# API Endpoints Documentation

This document provides a comprehensive list of all API endpoints used in the Africoin Wallet application.

## Table of Contents
1. [Africa Railways API](#africa-railways-api)
2. [Merchant Payment API](#merchant-payment-api)
3. [External Services](#external-services)
4. [Database Services](#database-services)

---

## Africa Railways API

**Base URL:** `https://api.africa-railways.com`
**Environment Variable:** `VITE_AFRICA_RAILWAYS_API_URL`
**Authentication:** Bearer token via `AFRICA_RAILWAYS_API_KEY`

### Route Management

#### Search Routes
- **Endpoint:** `POST /api/v1/routes/search`
- **Description:** Search for available railway routes
- **Request Body:**
  ```json
  {
    "from": "string",
    "to": "string",
    "date": "string",
    "passengers": number
  }
  ```

#### Get Route Details
- **Endpoint:** `GET /api/v1/routes/{routeId}`
- **Description:** Get detailed information about a specific route

#### Get Available Seats
- **Endpoint:** `GET /api/v1/routes/{routeId}/seats?date={date}`
- **Description:** Get available seats for a route on a specific date

### Booking Management

#### Create Booking
- **Endpoint:** `POST /api/v1/bookings`
- **Description:** Create a new railway booking
- **Request Body:**
  ```json
  {
    "routeId": "string",
    "from": "string",
    "to": "string",
    "departureDate": "string",
    "passengers": {
      "adults": number,
      "children": number
    },
    "seats": ["string"],
    "totalPrice": number
  }
  ```

#### Get Booking Details
- **Endpoint:** `GET /api/v1/bookings/{bookingId}`
- **Description:** Retrieve details of a specific booking

#### Get User Bookings
- **Endpoint:** `GET /api/v1/users/{userId}/bookings`
- **Description:** Get all bookings for a specific user

#### Cancel Booking
- **Endpoint:** `POST /api/v1/bookings/{bookingId}/cancel`
- **Description:** Cancel an existing booking
- **Request Body:**
  ```json
  {
    "reason": "string (optional)"
  }
  ```

#### Request Refund
- **Endpoint:** `POST /api/v1/bookings/{bookingId}/refund`
- **Description:** Request a refund for a cancelled booking

### Payment Processing

#### Process Payment
- **Endpoint:** `POST /api/v1/payments/process`
- **Description:** Process payment for a booking using AFC, ETH, or USDC
- **Request Body:**
  ```json
  {
    "bookingId": "string",
    "ethTxHash": "string",
    "amount": "string",
    "token": "AFC" | "ETH" | "USDC"
  }
  ```

#### Verify Payment
- **Endpoint:** `GET /api/v1/payments/{paymentId}/verify`
- **Description:** Verify the status of a payment

### Train Tracking

#### Get Train Telemetry
- **Endpoint:** `GET /api/v1/trains/{trainId}/telemetry`
- **Description:** Get real-time telemetry data for a train
- **Response:**
  ```json
  {
    "trainId": "string",
    "latitude": number,
    "longitude": number,
    "speed": number,
    "status": "on_time" | "delayed" | "stopped",
    "nextStation": "string",
    "estimatedArrival": "string"
  }
  ```

#### WebSocket - Train Tracking
- **Endpoint:** `WSS /telemetry`
- **Description:** Subscribe to real-time train tracking updates
- **Connection URL:** `wss://api.africa-railways.com/telemetry`

### Sentinel Network

#### Get Sentinel Reports
- **Endpoint:** `GET /api/v1/sentinel/reports`
- **Description:** Get safety reports from the sentinel network
- **Query Parameters:**
  - `trainId` (optional): Filter by train ID
  - `severity` (optional): Filter by severity (low, medium, high, critical)
  - `startDate` (optional): Filter by start date
  - `endDate` (optional): Filter by end date

---

## Merchant Payment API

**Base URL:** `https://api.africoin.io`
**Authentication:** Bearer token via API key

### Payment Operations

#### Create Payment
- **Endpoint:** `POST /api/v1/payments/create`
- **Description:** Create a new payment request
- **Request Body:**
  ```json
  {
    "amount": 100.00,
    "currency": "USD",
    "customer_email": "customer@example.com",
    "description": "Payment for order #123"
  }
  ```

#### Get Payment Details
- **Endpoint:** `GET /api/v1/payments/{id}`
- **Description:** Retrieve details of a specific payment

#### Create Refund
- **Endpoint:** `POST /api/v1/refunds/create`
- **Description:** Process a refund for a payment
- **Request Body:**
  ```json
  {
    "payment_id": "txn_123456",
    "amount": 50.00,
    "reason": "Customer request"
  }
  ```

---

## External Services

### Alchemy Account Kit

**Dashboard:** https://dashboard.alchemy.com/
**Environment Variables:**
- `VITE_ALCHEMY_API_KEY` - API key for wallet operations
- `VITE_ALCHEMY_GAS_POLICY_ID` - Gas manager policy for sponsored transactions

#### Endpoints Used:
- Smart Wallets Configuration: https://dashboard.alchemy.com/services/smart-wallets/configuration
- Gas Manager: https://dashboard.alchemy.com/services/gas-manager/configuration

#### RPC Endpoint:
- **Sepolia Testnet:** `https://eth-sepolia.g.alchemy.com/v2/{VITE_ALCHEMY_API_KEY}`

### Google Gemini AI

**Base URL:** Google Gemini Pro API
**Environment Variable:** `VITE_GEMINI_API_KEY`
**Model:** `gemini-pro`

- **API Documentation:** https://ai.google.dev/docs
- **Console:** https://console.cloud.google.com/apis/dashboard?project=5780586642
- **API Key Management:** https://aistudio.google.com/app/apikey

### BrowserStack Testing

**Base URL:** `https://api-cloud.browserstack.com`
**Local Testing URL:** `http://benjaminmpolokos_dzbone.browserstack.com`
**Environment Variables:**
- `BROWSERSTACK_USERNAME`
- `BROWSERSTACK_ACCESS_KEY`
- `BROWSERSTACK_URL`

#### Upload App
- **Endpoint:** `POST https://api-cloud.browserstack.com/app-automate/upload`

#### Get Plan Information
- **Endpoint:** `GET https://api.browserstack.com/app-automate/plan.json`

#### Web Interfaces:
- **App Live:** https://app-live.browserstack.com/
- **App Automate:** https://app-automate.browserstack.com/

---

## Database Services

### Supabase

**Environment Variables:**
- `VITE_SUPABASE_URL` - Frontend Supabase URL
- `VITE_SUPABASE_ANON_KEY` - Frontend anonymous key

**Migration Variables:**
- `SOURCE_SUPABASE_URL` - Source database URL (Famous.AI)
- `SOURCE_SUPABASE_KEY` - Source service role key
- `TARGET_SUPABASE_URL` - Target database URL (Vercel: `https://llvprbmrnjvamjzavmhg.supabase.co`)
- `TARGET_SUPABASE_KEY` - Target service role key

#### Tables Migrated:
1. `profiles` - User profile information
2. `users` - User account data
3. `admin_roles` - Administrative role assignments
4. `loyalty_points` - Loyalty program data
5. `points_transactions` - Points transaction history
6. `favorite_posts` - User favorites
7. `support_tickets` - Customer support tickets

#### Authentication:
- Phone authentication via Supabase Auth
- Email authentication
- Social login (Google, Facebook)

---

## Blockchain Explorer

### Sepolia Etherscan
- **Base URL:** `https://sepolia.etherscan.io`
- **Address View:** `https://sepolia.etherscan.io/address/{address}`

---

## Social Media & External Links

### Official Websites
- **Africa Railways:** https://www.africarailways.com/
- **Project Repository:** https://github.com/mpolobe/scroll-waitlist-exchange-1

### Social Media
- **Twitter:** https://twitter.com/africoin
- **LinkedIn:** https://linkedin.com/company/africoin
- **Facebook:** https://www.facebook.com/profile.php?id=61584643210653
- **Instagram:** https://instagram.com/africoin

### Support
- **Contact:** support@africoin.com

---

## Google Cloud Platform

**Project ID:** `gen-lang-client-0453426956`
**Project Number:** `834148498046`

### Console Links:
- **Dashboard:** https://console.cloud.google.com/home/dashboard?project=gen-lang-client-0453426956
- **IAM & Admin:** https://console.cloud.google.com/iam-admin/iam?project=gen-lang-client-0453426956
- **Service Accounts:** https://console.cloud.google.com/iam-admin/serviceaccounts?project=gen-lang-client-0453426956
- **APIs & Services:** https://console.cloud.google.com/apis/dashboard?project=gen-lang-client-0453426956

---

## Mobile Distribution

### Google Play Console
- **Developer ID:** `8975457855584245860`
- **Console:** https://play.google.com/console/developers/8975457855584245860
- **API Access:** https://play.google.com/console/developers/8975457855584245860/api-access

### Apple Developer (iOS)
- **Portal:** https://developer.apple.com/
- **Account:** https://developer.apple.com/account/
- **Certificates:** https://developer.apple.com/account/resources/certificates/list

### App Store Connect
- **URL:** https://appstoreconnect.apple.com/

---

## CI/CD Platforms

### Codemagic
- **Dashboard:** https://codemagic.io/apps
- **Documentation:** https://docs.codemagic.io/

### Vercel
- **Platform:** https://vercel.com
- **Documentation:** https://vercel.com/docs

---

## Documentation References

### Framework Documentation
- **Capacitor:** https://capacitorjs.com/docs
- **React:** https://react.dev/
- **Vite:** https://vitejs.dev/config/

### Library Documentation
- **Supabase:** https://supabase.com/docs
- **Alchemy Account Kit:** https://accountkit.alchemy.com/
- **TanStack Query:** https://tanstack.com/query/latest

### Build Tools
- **Android Gradle Plugin:** https://developer.android.com/studio/build
- **Android App Signing:** https://developer.android.com/studio/publish/app-signing

---

## Environment Configuration Summary

### Required Environment Variables

```bash
# Alchemy (Required)
VITE_ALCHEMY_API_KEY=your_alchemy_api_key
VITE_ALCHEMY_GAS_POLICY_ID=your_gas_policy_id  # Optional

# Supabase (Required)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Gemini AI (Optional)
VITE_GEMINI_API_KEY=your_gemini_api_key

# Africa Railways (Optional)
VITE_AFRICA_RAILWAYS_API_URL=https://api.africa-railways.com
AFRICA_RAILWAYS_API_KEY=your_africa_railways_api_key
VITE_SUI_NETWORK=testnet

# BrowserStack (Testing)
BROWSERSTACK_USERNAME=your_username
BROWSERSTACK_ACCESS_KEY=your_access_key
BROWSERSTACK_URL=http://benjaminmpolokos_dzbone.browserstack.com

# Database Migration (Deployment)
SOURCE_SUPABASE_URL=https://your-source-project.supabase.co
SOURCE_SUPABASE_KEY=your_source_service_role_key
TARGET_SUPABASE_URL=https://llvprbmrnjvamjzavmhg.supabase.co
TARGET_SUPABASE_KEY=your_target_service_role_key
```

---

## Notes

1. **Database Migration Status:** The migration infrastructure is complete and production-ready. See `DATABASE_MIGRATION_VERIFICATION_REPORT.md` for details.

2. **API Authentication:** All external APIs require proper authentication. Never commit API keys to the repository.

3. **Testing:** Use BrowserStack for mobile device testing. The local testing URL is available at `http://benjaminmpolokos_dzbone.browserstack.com`.

4. **Security:** All production credentials should be managed through environment variables and CI/CD platform secrets.

5. **Supabase Configuration:** The `src/lib/supabase.ts` file must be created from `src/lib/supabase.ts.example` before the application can connect to the database.

---

**Last Updated:** January 1, 2026
**Maintained By:** Africoin Development Team
