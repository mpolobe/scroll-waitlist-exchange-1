# Alchemy Account Kit Troubleshooting Guide

## Common Issues and Solutions

### Issue: "Must be authenticated" error when trying to use Face ID/Touch ID/Passcode

**Problem:** The app shows an error saying you must be authenticated when trying to use biometric authentication (Face ID, Touch ID, or device passcode).

**Root Cause:** Passkeys (biometric authentication) in Alchemy Account Kit require the user to be authenticated first. They cannot be used as the primary authentication method.

**Solution:**
1. First authenticate using email or social login (Google, Facebook)
2. After successful authentication, you can add a passkey for future logins
3. Passkeys are added via the `addPasskeyOnSignup: true` configuration option

**Correct Authentication Flow:**
```
1. User clicks "Connect Wallet"
2. Alchemy modal opens with email/social login options
3. User enters email and receives OTP code
4. User verifies OTP code
5. (Optional) User is prompted to add passkey for future logins
6. Wallet is created and connected
```

### Issue: Missing Alchemy API Key

**Problem:** Wallet connection fails or shows "demo-api-key" errors.

**Solution:**
1. Go to [Alchemy Dashboard](https://dashboard.alchemy.com/)
2. Create a new app or select existing app
3. Copy your API key
4. Add to `.env.local`:
   ```
   VITE_ALCHEMY_API_KEY=your_actual_api_key_here
   ```
5. Restart the development server

### Issue: Authentication modal doesn't appear

**Problem:** Clicking "Connect Wallet" does nothing or shows errors.

**Solution:**
1. Verify Alchemy Account Kit is properly configured in the dashboard
2. Check that you have created a Configuration in [Smart Wallets Configuration](https://dashboard.alchemy.com/services/smart-wallets/configuration)
3. Ensure the configuration is linked to your API key
4. Verify `AlchemyAccountProvider` is wrapping your app in `App.tsx`

### Issue: Social login not working

**Problem:** Google or Facebook login fails or doesn't appear.

**Solution:**
1. Go to [Smart Wallets Configuration](https://dashboard.alchemy.com/services/smart-wallets/configuration)
2. Enable social login providers in your configuration
3. Configure OAuth credentials for each provider
4. Ensure `enablePopupOauth: true` is set in `alchemyConfig.ts`
5. Check browser popup blockers are disabled

### Issue: Gas sponsorship not working

**Problem:** Users are prompted to pay gas fees instead of sponsored transactions.

**Solution:**
1. Create a Gas Manager Policy at [Gas Manager Configuration](https://dashboard.alchemy.com/services/gas-manager/configuration)
2. Copy the Policy ID
3. Add to `.env.local`:
   ```
   VITE_ALCHEMY_GAS_POLICY_ID=your_policy_id_here
   ```
4. Ensure the policy is linked to your API key
5. Configure policy rules (spending limits, allowed operations, etc.)

## Configuration Checklist

Before deploying or testing wallet features, ensure:

- [ ] Alchemy API key is set in `.env.local`
- [ ] Smart Wallets Configuration is created in Alchemy Dashboard
- [ ] Configuration is linked to your API key
- [ ] Email authentication is enabled in configuration
- [ ] (Optional) Social login providers are configured
- [ ] (Optional) Gas Manager Policy is created and ID is set
- [ ] `AlchemyAccountProvider` wraps your app
- [ ] `useAuthModal()` hook is used to open authentication modal

## Understanding Passkey Authentication

### What are Passkeys?
Passkeys are a modern authentication method that uses device biometrics (Face ID, Touch ID) or device passcode to securely authenticate users without passwords.

### How Passkeys Work in Alchemy Account Kit:
1. **Initial Authentication:** User must first authenticate with email or social login
2. **Passkey Creation:** After authentication, user can create a passkey on their device
3. **Future Logins:** User can use passkey for quick, secure authentication
4. **Device-Specific:** Passkeys are tied to the device and cannot be used on other devices

### Passkey Configuration:
```typescript
auth: {
  sections: [
    [
      {
        type: "email",  // Primary authentication method
      }
    ],
  ],
  addPasskeyOnSignup: true,  // Prompt to add passkey after email auth
}
```

### Important Notes:
- Passkeys cannot be used without prior authentication
- Passkeys are optional and device-specific
- Email/social login is always available as fallback
- Users can have multiple passkeys on different devices

## API Reference

### Key Hooks:
- `useUser()` - Get current authenticated user
- `useAccount()` - Get smart wallet account details
- `useAuthModal()` - Control authentication modal
- `useSignerStatus()` - Check authentication status
- `useAuthenticate()` - Programmatic authentication (advanced)

### Configuration Options:
```typescript
createConfig(
  {
    transport: alchemy({ apiKey: "..." }),
    chain: sepolia,
    enablePopupOauth: true,
    policyId: "...",  // Optional gas policy
    ssr: false,
  },
  {
    auth: {
      sections: [...],  // Authentication methods
      addPasskeyOnSignup: true,  // Add passkey after auth
      header: "...",  // Modal header text
    },
  }
)
```

## Getting Help

If you continue to experience issues:

1. Check [Alchemy Documentation](https://accountkit.alchemy.com/)
2. Review [GitHub Issues](https://github.com/alchemyplatform/aa-sdk/issues)
3. Contact [Alchemy Support](https://www.alchemy.com/support)
4. Check browser console for detailed error messages
5. Verify all environment variables are set correctly

## Additional Resources

- [Alchemy Account Kit Docs](https://accountkit.alchemy.com/)
- [React Quickstart](https://accountkit.alchemy.com/react/quickstart)
- [Smart Wallets Dashboard](https://dashboard.alchemy.com/services/smart-wallets)
- [Gas Manager Dashboard](https://dashboard.alchemy.com/services/gas-manager)
