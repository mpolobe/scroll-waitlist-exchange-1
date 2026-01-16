const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Generate secure random token
function generateToken(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

// OAuth Authorization Endpoint
// GET /oauth/authorize?client_id=XXX&redirect_uri=YYY&scope=ZZZ&state=AAA&response_type=code
router.get('/authorize', async (req, res) => {
  try {
    const { client_id, redirect_uri, scope, state, response_type } = req.query;

    // Validate required parameters
    if (!client_id || !redirect_uri || !response_type) {
      return res.status(400).json({
        error: 'invalid_request',
        error_description: 'Missing required parameters'
      });
    }

    if (response_type !== 'code') {
      return res.status(400).json({
        error: 'unsupported_response_type',
        error_description: 'Only authorization code flow is supported'
      });
    }

    // Validate client
    const { data: client, error } = await supabase
      .from('oauth_clients')
      .select('*')
      .eq('client_id', client_id)
      .eq('is_active', true)
      .single();

    if (error || !client) {
      return res.status(401).json({
        error: 'invalid_client',
        error_description: 'Client not found or inactive'
      });
    }

    // Validate redirect URI
    if (!client.redirect_uris.includes(redirect_uri)) {
      return res.status(400).json({
        error: 'invalid_request',
        error_description: 'Invalid redirect_uri'
      });
    }

    // Parse and validate scopes
    const requestedScopes = scope ? scope.split(' ') : [];
    const invalidScopes = requestedScopes.filter(s => !client.allowed_scopes.includes(s));

    if (invalidScopes.length > 0) {
      return res.status(400).json({
        error: 'invalid_scope',
        error_description: `Invalid scopes: ${invalidScopes.join(', ')}`
      });
    }

    // Redirect to consent page with authorization details
    const consentUrl = new URL(process.env.SITE_URL || 'http://localhost:5173');
    consentUrl.pathname = '/oauth/consent';
    consentUrl.searchParams.set('client_id', client_id);
    consentUrl.searchParams.set('redirect_uri', redirect_uri);
    consentUrl.searchParams.set('scope', scope || '');
    consentUrl.searchParams.set('state', state || '');

    res.redirect(consentUrl.toString());

  } catch (error) {
    console.error('OAuth authorization error:', error);
    res.status(500).json({ error: 'server_error' });
  }
});

// OAuth Token Endpoint
// POST /oauth/token
router.post('/token', async (req, res) => {
  try {
    const { grant_type, code, redirect_uri, client_id, client_secret, refresh_token } = req.body;

    // Validate client credentials
    const { data: client } = await supabase
      .from('oauth_clients')
      .select('*')
      .eq('client_id', client_id)
      .eq('is_active', true)
      .single();

    if (!client) {
      return res.status(401).json({
        error: 'invalid_client',
        error_description: 'Client not found'
      });
    }

    // For confidential clients, verify secret
    if (client.client_type === 'confidential' && client.client_secret !== client_secret) {
      return res.status(401).json({
        error: 'invalid_client',
        error_description: 'Invalid client credentials'
      });
    }

    if (grant_type === 'authorization_code') {
      // Exchange authorization code for access token
      const { data: authCode } = await supabase
        .from('oauth_authorization_codes')
        .select('*')
        .eq('code', code)
        .eq('client_id', client_id)
        .is('used_at', null)
        .single();

      if (!authCode || new Date(authCode.expires_at) < new Date()) {
        return res.status(400).json({
          error: 'invalid_grant',
          error_description: 'Invalid or expired authorization code'
        });
      }

      // Mark code as used
      await supabase
        .from('oauth_authorization_codes')
        .update({ used_at: new Date().toISOString() })
        .eq('id', authCode.id);

      // Generate tokens
      const accessToken = generateToken();
      const newRefreshToken = generateToken();
      const expiresIn = client.token_expiry_seconds || 3600;

      // Hash tokens for storage
      const accessTokenHash = crypto.createHash('sha256').update(accessToken).digest('hex');
      const refreshTokenHash = crypto.createHash('sha256').update(newRefreshToken).digest('hex');

      const { data: accessTokenRecord } = await supabase
        .from('oauth_access_tokens')
        .insert({
          token_hash: accessTokenHash,
          client_id: client.client_id,
          user_id: authCode.user_id,
          scopes: authCode.scopes,
          expires_at: new Date(Date.now() + expiresIn * 1000).toISOString()
        })
        .select()
        .single();

      await supabase
        .from('oauth_refresh_tokens')
        .insert({
          token_hash: refreshTokenHash,
          access_token_id: accessTokenRecord.id,
          client_id: client.client_id,
          user_id: authCode.user_id,
          scopes: authCode.scopes,
          expires_at: new Date(Date.now() + (client.refresh_token_expiry_days || 30) * 24 * 60 * 60 * 1000).toISOString()
        });

      // Audit log
      await supabase.from('oauth_audit_log').insert({
        event_type: 'token_issued',
        client_id: client.client_id,
        user_id: authCode.user_id,
        details: { grant_type: 'authorization_code' }
      });

      return res.json({
        access_token: accessToken,
        token_type: 'Bearer',
        expires_in: expiresIn,
        refresh_token: newRefreshToken,
        scope: authCode.scopes.join(' ')
      });

    } else if (grant_type === 'refresh_token') {
      // Refresh access token
      const refreshTokenHash = crypto.createHash('sha256').update(refresh_token).digest('hex');

      const { data: refreshTokenRecord } = await supabase
        .from('oauth_refresh_tokens')
        .select('*')
        .eq('token_hash', refreshTokenHash)
        .eq('client_id', client_id)
        .is('revoked_at', null)
        .single();

      if (!refreshTokenRecord || new Date(refreshTokenRecord.expires_at) < new Date()) {
        return res.status(400).json({
          error: 'invalid_grant',
          error_description: 'Invalid or expired refresh token'
        });
      }

      // Generate new access token
      const newAccessToken = generateToken();
      const expiresIn = client.token_expiry_seconds || 3600;
      const newAccessTokenHash = crypto.createHash('sha256').update(newAccessToken).digest('hex');

      await supabase
        .from('oauth_access_tokens')
        .insert({
          token_hash: newAccessTokenHash,
          client_id: client.client_id,
          user_id: refreshTokenRecord.user_id,
          scopes: refreshTokenRecord.scopes,
          expires_at: new Date(Date.now() + expiresIn * 1000).toISOString()
        });

      return res.json({
        access_token: newAccessToken,
        token_type: 'Bearer',
        expires_in: expiresIn,
        scope: refreshTokenRecord.scopes.join(' ')
      });

    } else {
      return res.status(400).json({
        error: 'unsupported_grant_type',
        error_description: 'Only authorization_code and refresh_token grants are supported'
      });
    }

  } catch (error) {
    console.error('OAuth token error:', error);
    res.status(500).json({ error: 'server_error' });
  }
});

// OAuth UserInfo Endpoint
router.get('/userinfo', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'invalid_token' });
    }

    const token = authHeader.substring(7);
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const { data: accessToken } = await supabase
      .from('oauth_access_tokens')
      .select('*, oauth_clients(operator_name)')
      .eq('token_hash', tokenHash)
      .is('revoked_at', null)
      .single();

    if (!accessToken || new Date(accessToken.expires_at) < new Date()) {
      return res.status(401).json({ error: 'invalid_token' });
    }

    const { data: { user } } = await supabase.auth.admin.getUserById(accessToken.user_id);

    const userInfo = {
      sub: user.id
    };

    // Add claims based on scopes
    if (accessToken.scopes.includes('email')) {
      userInfo.email = user.email;
      userInfo.email_verified = user.email_confirmed_at != null;
    }

    if (accessToken.scopes.includes('profile')) {
      userInfo.name = user.user_metadata?.full_name;
    }

    if (accessToken.scopes.includes('phone')) {
      userInfo.phone_number = user.phone;
    }

    return res.json(userInfo);

  } catch (error) {
    console.error('OAuth userinfo error:', error);
    res.status(500).json({ error: 'server_error' });
  }
});

// Revoke Token Endpoint
router.post('/revoke', async (req, res) => {
  try {
    const { token, token_type_hint } = req.body;
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    if (token_type_hint === 'access_token' || !token_type_hint) {
      await supabase
        .from('oauth_access_tokens')
        .update({ revoked_at: new Date().toISOString() })
        .eq('token_hash', tokenHash);
    }

    if (token_type_hint === 'refresh_token' || !token_type_hint) {
      await supabase
        .from('oauth_refresh_tokens')
        .update({ revoked_at: new Date().toISOString() })
        .eq('token_hash', tokenHash);
    }

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error('OAuth revoke error:', error);
    res.status(500).json({ error: 'server_error' });
  }
});

// Approve authorization (called from consent page)
router.post('/approve', async (req, res) => {
  try {
    const { client_id, redirect_uri, scope, state, user_id } = req.body;

    // Generate authorization code
    const code = generateToken(32);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await supabase
      .from('oauth_authorization_codes')
      .insert({
        code,
        client_id,
        user_id,
        redirect_uri,
        scopes: scope.split(' ').filter(Boolean),
        state,
        expires_at: expiresAt.toISOString()
      });

    // Record consent
    await supabase
      .from('oauth_consents')
      .upsert({
        user_id,
        client_id,
        scopes: scope.split(' ').filter(Boolean),
        granted_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,client_id'
      });

    // Audit log
    await supabase.from('oauth_audit_log').insert({
      event_type: 'authorization_approved',
      client_id,
      user_id,
      details: { scopes: scope }
    });

    // Build redirect URL
    const redirectUrl = new URL(redirect_uri);
    redirectUrl.searchParams.set('code', code);
    if (state) {
      redirectUrl.searchParams.set('state', state);
    }

    return res.json({ redirect_to: redirectUrl.toString() });

  } catch (error) {
    console.error('OAuth approve error:', error);
    res.status(500).json({ error: 'server_error' });
  }
});

// Deny authorization
router.post('/deny', async (req, res) => {
  try {
    const { client_id, redirect_uri, state, user_id } = req.body;

    // Audit log
    await supabase.from('oauth_audit_log').insert({
      event_type: 'authorization_denied',
      client_id,
      user_id
    });

    // Build redirect URL with error
    const redirectUrl = new URL(redirect_uri);
    redirectUrl.searchParams.set('error', 'access_denied');
    redirectUrl.searchParams.set('error_description', 'User denied the authorization request');
    if (state) {
      redirectUrl.searchParams.set('state', state);
    }

    return res.json({ redirect_to: redirectUrl.toString() });

  } catch (error) {
    console.error('OAuth deny error:', error);
    res.status(500).json({ error: 'server_error' });
  }
});

module.exports = router;
