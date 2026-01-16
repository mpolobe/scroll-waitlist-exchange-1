const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Middleware to verify OAuth access tokens
async function verifyOAuthToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'unauthorized',
        error_description: 'Missing or invalid authorization header'
      });
    }

    const token = authHeader.substring(7);
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    // Verify token
    const { data: accessToken, error } = await supabase
      .from('oauth_access_tokens')
      .select('*, oauth_clients(*)')
      .eq('token_hash', tokenHash)
      .is('revoked_at', null)
      .single();

    if (error || !accessToken) {
      return res.status(401).json({
        error: 'invalid_token',
        error_description: 'Token not found or revoked'
      });
    }

    // Check expiration
    if (new Date(accessToken.expires_at) < new Date()) {
      return res.status(401).json({
        error: 'token_expired',
        error_description: 'Access token has expired'
      });
    }

    // Attach token info to request
    req.oauth = {
      clientId: accessToken.client_id,
      userId: accessToken.user_id,
      scopes: accessToken.scopes,
      operator: accessToken.oauth_clients
    };

    next();

  } catch (error) {
    console.error('OAuth verification error:', error);
    res.status(500).json({ error: 'server_error' });
  }
}

// Middleware to check specific scope
function requireScope(...requiredScopes) {
  return (req, res, next) => {
    if (!req.oauth || !req.oauth.scopes) {
      return res.status(401).json({
        error: 'unauthorized',
        error_description: 'No OAuth context'
      });
    }

    const hasScope = requiredScopes.some(scope =>
      req.oauth.scopes.includes(scope)
    );

    if (!hasScope) {
      return res.status(403).json({
        error: 'insufficient_scope',
        error_description: `Required scope: ${requiredScopes.join(' or ')}`
      });
    }

    next();
  };
}

module.exports = {
  verifyOAuthToken,
  requireScope
};
