# Phone Authentication & 2FA Integration

## Overview

Integrated phone number authentication with Account Kit 2FA for enhanced wallet security. Users can now sign up and log in using their phone number, then secure their wallet with biometric authentication (Face ID, Touch ID, or passkey).

## Architecture

### Two-Layer Security Model

**Layer 1: Account Authentication (Supabase)**
- Primary: Phone number + SMS OTP
- Backup: Email/password
- Purpose: User identity verification
- Manages: User profile, preferences, KYC data

**Layer 2: Wallet Authentication (Alchemy Account Kit)**
- Primary: Passkey (biometric/device authentication)
- Backup: Email OTP
- Purpose: Wallet access and transaction signing
- Manages: Private keys, transaction signing

## Features Implemented

### 1. Phone Number Authentication

**Sign Up with Phone:**
- Enter phone number with country code
- Receive 6-digit SMS OTP
- Verify OTP to create account
- Automatically prompts for wallet connection

**Sign In with Phone:**
- Enter registered phone number
- Receive SMS OTP
- Verify OTP to access account
- Connect wallet with biometric auth

### 2. Wallet Connection with 2FA

**Authentication Methods:**
- **Face ID**: Biometric facial recognition
- **Touch ID**: Fingerprint authentication
- **Passcode**: Device passcode/PIN
- **Email OTP**: Fallback method

**Security Features:**
- Device-level security
- Self-custodial wallet
- Gas-sponsored transactions
- Secure key management

### 3. User Experience Flow

```
┌─────────────────────────────────────────────────────┐
│ 1. Choose Authentication Method                     │
│    - Email (existing)                               │
│    - Phone (new)                                    │
└─────────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────┐
│ 2. Phone Authentication                             │
│    - Enter phone number (+country code)            │
│    - Receive SMS OTP                                │
│    - Enter 6-digit code                             │
│    - Account created/logged in                      │
└─────────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────┐
│ 3. Wallet Connection (Optional but Recommended)     │
│    - Choose authentication method                   │
│    - Set up biometric/passkey                       │
│    - Wallet connected and secured                   │
└─────────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────┐
│ 4. Access Dashboard                                 │
│    - View wallet balance                            │
│    - Send/receive tokens                            │
│    - Book railway tickets                           │
│    - Access all features                            │
└─────────────────────────────────────────────────────┘
```

## Implementation Details

### Files Created/Modified

**New Files:**
- `src/components/auth/PhoneLoginForm.tsx` - Phone authentication UI
- `src/components/wallet/WalletConnectionFlow.tsx` - Wallet connection with 2FA
- `PHONE_AUTH_INTEGRATION.md` - This documentation

**Modified Files:**
- `src/contexts/AuthContext.tsx` - Added phone auth methods
- `src/pages/Signup.tsx` - Added phone/email toggle
- `.env.local` - Added Twilio configuration

### AuthContext Methods

```typescript
// Phone Authentication
signUpWithPhone(phone: string, fullName: string, country: string): Promise<any>
signInWithPhone(phone: string): Promise<any>
verifyPhoneOTP(phone: string, token: string): Promise<any>

// Existing Methods
signUp(email: string, password: string, fullName: string, country: string)
signIn(email: string, password: string)
signInWithOTP(email: string)
verifyOTP(email: string, token: string)
```

### Phone Number Format

**Required Format:** E.164 international format
- Must start with `+`
- Include country code
- 10-15 digits total

**Examples:**
- US: `+12025551234`
- Kenya: `+254712345678`
- South Africa: `+27821234567`
- Nigeria: `+2348012345678`

### Validation Rules

**Phone Number:**
- Regex: `^\+[1-9]\d{9,14}$`
- Must include country code
- No spaces or special characters (except +)

**OTP Code:**
- Exactly 6 digits
- Numeric only
- Expires after 10 minutes

## Configuration

### Supabase Setup

1. **Enable Phone Authentication:**
   ```
   Supabase Dashboard > Authentication > Providers > Phone
   Enable: ✓
   ```

2. **Configure SMS Provider (Twilio):**
   ```
   Provider: Twilio
   Account SID: [from Twilio dashboard]
   Auth Token: [from Twilio dashboard]
   Phone Number: [your Twilio number]
   ```

3. **Set Rate Limits:**
   ```
   Max OTP requests per hour: 5
   OTP expiry: 600 seconds (10 minutes)
   ```

### Environment Variables

```env
# Supabase Configuration
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# Twilio Configuration (configured in Supabase Dashboard)
# These are set in Supabase, not in your app
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+1234567890
```

### Alchemy Account Kit Configuration

Already configured in `src/lib/alchemyConfig.ts`:
```typescript
export const alchemyConfig = createConfig(
  {
    transport: alchemy({ apiKey: process.env.VITE_ALCHEMY_API_KEY }),
    chain: sepolia,
    enablePopupOauth: true,
    policyId: process.env.VITE_ALCHEMY_GAS_POLICY_ID,
  },
  {
    auth: {
      sections: [
        [{ type: "passkey" }],  // Primary: Biometric
        [{ type: "email" }]      // Fallback: Email OTP
      ],
      addPasskeyOnSignup: false,
    },
  }
);
```

## Usage Examples

### Sign Up with Phone

```typescript
import { useAuth } from '@/contexts/AuthContext';

const SignupComponent = () => {
  const { signUpWithPhone, verifyPhoneOTP } = useAuth();
  
  // Step 1: Send OTP
  const handleSignup = async () => {
    const { data, error } = await signUpWithPhone(
      '+254712345678',
      'John Doe',
      'Kenya'
    );
    
    if (!error) {
      // Show OTP input
    }
  };
  
  // Step 2: Verify OTP
  const handleVerify = async (code: string) => {
    const { data, error } = await verifyPhoneOTP(
      '+254712345678',
      code
    );
    
    if (!error) {
      // Redirect to wallet connection
      navigate('/wallet');
    }
  };
};
```

### Connect Wallet with 2FA

```typescript
import { WalletConnectionFlow } from '@/components/wallet/WalletConnectionFlow';

const WalletSetup = () => {
  return (
    <WalletConnectionFlow
      onComplete={() => {
        // Wallet connected successfully
        navigate('/dashboard');
      }}
    />
  );
};
```

## Security Considerations

### Phone Number Security

✅ **Implemented:**
- Phone numbers stored in E.164 format
- OTP expires after 10 minutes
- Rate limiting (5 requests per hour)
- Validation before sending OTP

⚠️ **Recommended:**
- Implement CAPTCHA to prevent SMS bombing
- Add fraud detection for suspicious patterns
- Monitor SMS usage and costs
- Implement account recovery flow

### Wallet Security

✅ **Implemented:**
- Passkey authentication (biometric)
- Device-level security
- Self-custodial wallet
- Secure key management by Alchemy

✅ **Best Practices:**
- Never store private keys
- Never ask for seed phrases
- Use secure communication channels
- Implement transaction confirmation

## Cost Optimization

### SMS Costs

**Twilio Pricing (approximate):**
- US/Canada: $0.0075 per SMS
- Kenya: $0.05 per SMS
- South Africa: $0.03 per SMS
- Nigeria: $0.08 per SMS

**Optimization Strategies:**
1. **Rate Limiting**: Max 5 OTP requests per hour per user
2. **Email Fallback**: Offer email as free alternative
3. **Caching**: Store verified numbers to reduce re-verification
4. **Monitoring**: Set up budget alerts in Twilio
5. **Regional Routing**: Use local numbers for better rates

### Estimated Monthly Costs

**Assumptions:**
- 1,000 new signups/month
- 5,000 logins/month
- Average 1.5 OTP per authentication

**Calculation:**
```
New Signups: 1,000 × 1.5 × $0.05 = $75
Logins: 5,000 × 1.5 × $0.05 = $375
Total: $450/month
```

**Cost Reduction:**
- Implement email as primary (free)
- Use phone as optional 2FA
- Estimated savings: 60-70%

## Testing

### Manual Testing Checklist

**Phone Authentication:**
- [ ] Sign up with valid phone number
- [ ] Receive SMS OTP
- [ ] Verify OTP successfully
- [ ] Handle invalid phone number
- [ ] Handle expired OTP
- [ ] Handle incorrect OTP
- [ ] Test rate limiting
- [ ] Test resend OTP

**Wallet Connection:**
- [ ] Connect wallet with Face ID
- [ ] Connect wallet with Touch ID
- [ ] Connect wallet with passcode
- [ ] Connect wallet with email OTP
- [ ] Handle authentication failure
- [ ] Test on different devices
- [ ] Test wallet disconnection

### Test Phone Numbers

**Twilio Test Numbers (Sandbox):**
```
+15005550006 - Valid number, delivers SMS
+15005550001 - Invalid number
+15005550007 - Number cannot receive SMS
```

## Troubleshooting

### Common Issues

**1. SMS Not Received**
- Check phone number format (must include +country code)
- Verify Twilio configuration in Supabase
- Check Twilio account balance
- Verify phone number is not blocked

**2. OTP Verification Failed**
- Check OTP hasn't expired (10 minutes)
- Verify correct phone number
- Try resending OTP
- Check for typos in code

**3. Wallet Connection Failed**
- Ensure device supports passkey/biometric
- Check browser compatibility
- Try email OTP as fallback
- Clear browser cache and retry

**4. Rate Limit Exceeded**
- Wait 1 hour before retrying
- Use email authentication instead
- Contact support if urgent

## Future Enhancements

### Phase 2 (Planned)
- [ ] WhatsApp OTP integration
- [ ] Voice call OTP fallback
- [ ] Multi-device wallet sync
- [ ] Hardware wallet support
- [ ] Social recovery

### Phase 3 (Planned)
- [ ] Biometric transaction confirmation
- [ ] Spending limits and controls
- [ ] Multi-signature wallets
- [ ] Advanced fraud detection
- [ ] Compliance reporting

## Support

### For Users
- **Phone Auth Issues**: Check phone number format and try resending OTP
- **Wallet Connection**: Ensure device supports biometric authentication
- **General Help**: Contact support@africoin.com

### For Developers
- **Supabase Docs**: https://supabase.com/docs/guides/auth/phone-login
- **Alchemy Docs**: https://accountkit.alchemy.com/
- **Twilio Docs**: https://www.twilio.com/docs/sms

## Compliance

### Regulations
- **TCPA (US)**: Obtain consent before sending SMS
- **GDPR (EU)**: Store phone numbers securely, allow deletion
- **TRAI DLT (India)**: Register templates and sender IDs
- **POPIA (South Africa)**: Comply with data protection laws

### Best Practices
- ✅ Obtain explicit consent for SMS
- ✅ Provide opt-out mechanism
- ✅ Store consent records
- ✅ Encrypt phone numbers at rest
- ✅ Implement data retention policies

---

**Integration Date**: December 25, 2025
**Status**: ✅ Implemented and Ready for Testing
**Version**: 1.0.0
**Dependencies**: Supabase, Alchemy Account Kit, Twilio (via Supabase)
