const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.SITE_URL || '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// OAuth Routes
app.use('/oauth', require('./routes/oauth'));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'Africa Railways OAuth Server',
    timestamp: new Date().toISOString() 
  });
});

// API info
app.get('/', (req, res) => {
  res.json({
    name: 'Africa Railways OAuth Server',
    version: '1.0.0',
    endpoints: {
      authorize: '/oauth/authorize',
      token: '/oauth/token',
      userinfo: '/oauth/userinfo',
      revoke: '/oauth/revoke'
    },
    documentation: 'https://github.com/mpolobe/scroll-waitlist-exchange-1/blob/main/docs/OAUTH_INTEGRATION.md'
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚂 Africa Railways OAuth Server running on port ${PORT}`);
  console.log(`📍 OAuth Authorization: http://localhost:${PORT}/oauth/authorize`);
  console.log(`📍 OAuth Token: http://localhost:${PORT}/oauth/token`);
  console.log(`📍 Health Check: http://localhost:${PORT}/health`);
});
