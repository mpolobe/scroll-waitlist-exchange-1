# Africoin OAuth 2.1 Integration Guide

This guide explains how third-party railway operators and partners can integrate with Africoin using OAuth 2.1.

## Overview

Africoin uses Supabase OAuth 2.1 Server to allow third-party applications to:
- Authenticate users with "Sign in with Africoin"
- Access user railway bookings and tickets
- View and transfer AFC tokens on behalf of users
- Integrate with the Africa Railways network

## OAuth Endpoints

| Endpoint | URL |
|----------|-----|
| Authorization | `https://llvprbmrnjvamjzavmhg.supabase.co/auth/v1/oauth/authorize` |
| Token | `https://llvprbmrnjvamjzavmhg.supabase.co/auth/v1/oauth/token` |
| JWKS | `https://llvprbmrnjvamjzavmhg.supabase.co/auth/v1/.well-known/jwks.json` |
| Discovery | `https://llvprbmrnjvamjzavmhg.supabase.co/.well-known/oauth-authorization-server/auth/v1` |
| OIDC Discovery | `https://llvprbmrnjvamjzavmhg.supabase.co/auth/v1/.well-known/openid-configuration` |

## Getting Started

### 1. Register Your Application

Contact Africoin to register your application as an OAuth client. You'll need to provide:

- **Application Name**: Your app's display name
- **Redirect URIs**: Where users will be redirected after authorization
- **Client Type**: 
  - `public` - For mobile/SPA apps (no client secret)
  - `confidential` - For server-side apps (includes client secret)

You'll receive:
- **Client ID**: Your unique application identifier
- **Client Secret**: (For confidential clients only) Keep this secure!

### 2. Available Scopes

| Scope | Description |
|-------|-------------|
| `openid` | Verify user identity (required for OIDC) |
| `email` | Access user's email address |
| `profile` | Access user's name and profile info |
| `phone` | Access user's phone number |
| `railway:read` | View user's railway bookings and tickets |
| `railway:write` | Create/manage bookings on user's behalf |
| `wallet:read` | View user's AFC token balance |
| `wallet:transfer` | Transfer AFC tokens on user's behalf |

### 3. Authorization Code Flow (with PKCE)

OAuth 2.1 requires PKCE for all clients. Here's the flow:

#### Step 1: Generate PKCE Parameters

```javascript
// Generate code verifier (random string)
function generateCodeVerifier() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return base64URLEncode(array);
}

// Generate code challenge from verifier
async function generateCodeChallenge(verifier) {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return base64URLEncode(new Uint8Array(hash));
}

function base64URLEncode(buffer) {
  return btoa(String.fromCharCode(...buffer))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}
```

#### Step 2: Redirect to Authorization

```javascript
const codeVerifier = generateCodeVerifier();
const codeChallenge = await generateCodeChallenge(codeVerifier);

// Store code_verifier for later use
sessionStorage.setItem('code_verifier', codeVerifier);

const authUrl = new URL('https://llvprbmrnjvamjzavmhg.supabase.co/auth/v1/oauth/authorize');
authUrl.searchParams.set('client_id', 'YOUR_CLIENT_ID');
authUrl.searchParams.set('redirect_uri', 'https://your-app.com/callback');
authUrl.searchParams.set('response_type', 'code');
authUrl.searchParams.set('scope', 'openid email profile railway:read');
authUrl.searchParams.set('code_challenge', codeChallenge);
authUrl.searchParams.set('code_challenge_method', 'S256');
authUrl.searchParams.set('state', generateRandomState()); // CSRF protection

window.location.href = authUrl.toString();
```

#### Step 3: Handle Callback

After user approves, they're redirected to your `redirect_uri` with an authorization code:

```
https://your-app.com/callback?code=AUTH_CODE&state=YOUR_STATE
```

#### Step 4: Exchange Code for Tokens

```javascript
const codeVerifier = sessionStorage.getItem('code_verifier');

const response = await fetch('https://llvprbmrnjvamjzavmhg.supabase.co/auth/v1/oauth/token', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
  },
  body: new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: 'YOUR_CLIENT_ID',
    code: authorizationCode,
    redirect_uri: 'https://your-app.com/callback',
    code_verifier: codeVerifier,
  }),
});

const tokens = await response.json();
// {
//   access_token: "...",
//   refresh_token: "...",
//   token_type: "bearer",
//   expires_in: 3600,
//   id_token: "..." // if openid scope requested
// }
```

### 4. Using Access Tokens

Include the access token in API requests:

```javascript
const response = await fetch('https://api.africoin.io/v1/railway/bookings', {
  headers: {
    'Authorization': `Bearer ${accessToken}`,
  },
});
```

### 5. Refreshing Tokens

```javascript
const response = await fetch('https://llvprbmrnjvamjzavmhg.supabase.co/auth/v1/oauth/token', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
  },
  body: new URLSearchParams({
    grant_type: 'refresh_token',
    client_id: 'YOUR_CLIENT_ID',
    refresh_token: refreshToken,
  }),
});
```

## Example: Railway Operator Integration

Here's a complete example for a railway operator integrating with Africoin:

```javascript
// railway-operator-app.js

class AfricoinOAuth {
  constructor(clientId, redirectUri) {
    this.clientId = clientId;
    this.redirectUri = redirectUri;
    this.baseUrl = 'https://llvprbmrnjvamjzavmhg.supabase.co/auth/v1';
  }

  async login(scopes = ['openid', 'email', 'railway:read']) {
    const codeVerifier = this.generateCodeVerifier();
    const codeChallenge = await this.generateCodeChallenge(codeVerifier);
    const state = this.generateState();

    sessionStorage.setItem('oauth_code_verifier', codeVerifier);
    sessionStorage.setItem('oauth_state', state);

    const authUrl = new URL(`${this.baseUrl}/oauth/authorize`);
    authUrl.searchParams.set('client_id', this.clientId);
    authUrl.searchParams.set('redirect_uri', this.redirectUri);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('scope', scopes.join(' '));
    authUrl.searchParams.set('code_challenge', codeChallenge);
    authUrl.searchParams.set('code_challenge_method', 'S256');
    authUrl.searchParams.set('state', state);

    window.location.href = authUrl.toString();
  }

  async handleCallback() {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const state = params.get('state');
    const error = params.get('error');

    if (error) {
      throw new Error(params.get('error_description') || error);
    }

    // Verify state
    const savedState = sessionStorage.getItem('oauth_state');
    if (state !== savedState) {
      throw new Error('Invalid state parameter');
    }

    const codeVerifier = sessionStorage.getItem('oauth_code_verifier');

    const response = await fetch(`${this.baseUrl}/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: this.clientId,
        code,
        redirect_uri: this.redirectUri,
        code_verifier: codeVerifier,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error_description || 'Token exchange failed');
    }

    const tokens = await response.json();
    
    // Clean up
    sessionStorage.removeItem('oauth_code_verifier');
    sessionStorage.removeItem('oauth_state');

    return tokens;
  }

  generateCodeVerifier() {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return this.base64URLEncode(array);
  }

  async generateCodeChallenge(verifier) {
    const encoder = new TextEncoder();
    const data = encoder.encode(verifier);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return this.base64URLEncode(new Uint8Array(hash));
  }

  generateState() {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return this.base64URLEncode(array);
  }

  base64URLEncode(buffer) {
    return btoa(String.fromCharCode(...buffer))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }
}

// Usage
const oauth = new AfricoinOAuth('your-client-id', 'https://your-railway-app.com/callback');

// Login button click
document.getElementById('login-btn').addEventListener('click', () => {
  oauth.login(['openid', 'email', 'railway:read', 'railway:write']);
});

// On callback page
if (window.location.pathname === '/callback') {
  oauth.handleCallback()
    .then(tokens => {
      console.log('Logged in!', tokens);
      // Store tokens and redirect to dashboard
    })
    .catch(error => {
      console.error('Login failed:', error);
    });
}
```

## Security Best Practices

1. **Always use HTTPS** in production
2. **Validate the state parameter** to prevent CSRF attacks
3. **Store tokens securely** - use httpOnly cookies for web apps
4. **Request minimal scopes** - only ask for what you need
5. **Handle token expiration** - implement refresh token rotation
6. **Validate JWTs** - verify tokens using the JWKS endpoint

## Support

For integration support, contact:
- Email: developers@africoin.io
- Discord: [Africoin Developers](https://discord.gg/africoin)

## Changelog

- **v1.0** - Initial OAuth 2.1 Server release
