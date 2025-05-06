require('dotenv').config();
const express = require('express');
const session = require('express-session');
const { Issuer, generators } = require('openid-client');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Configure CORS
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));

// Configure session middleware
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Parse JSON request body
app.use(express.json());

// Initialize OpenID Client
let client;

async function initializeClient() {
  try {
    const issuer = await Issuer.discover(process.env.COGNITO_ISSUER);
    client = new issuer.Client({
      client_id: process.env.COGNITO_CLIENT_ID,
      client_secret: process.env.COGNITO_CLIENT_SECRET,
      redirect_uris: [process.env.COGNITO_REDIRECT_URI],
      response_types: ['code']
    });
  } catch (error) {
    console.error('Error initializing OpenID client:', error);
  }
}

initializeClient().catch(console.error);

// Middleware to check if user is authenticated
const checkAuth = (req, res, next) => {
  if (!req.session.userInfo) {
    req.isAuthenticated = false;
  } else {
    req.isAuthenticated = true;
  }
  next();
};

// Home route
app.get('/', checkAuth, (req, res) => {
  res.json({
    isAuthenticated: req.isAuthenticated,
    userInfo: req.session.userInfo
  });
});

// Login route
app.get('/login', (req, res) => {
  const nonce = generators.nonce();
  const state = generators.state();
  
  req.session.nonce = nonce;
  req.session.state = state;
  
  const authUrl = client.authorizationUrl({
    scope: 'openid email profile',
    nonce,
    state
  });
  
  res.json({ authUrl });
});

// Callback route
app.get('/callback', async (req, res) => {
  const { code, state } = req.query;
  const { nonce, state: sessionState } = req.session;
  
  if (state !== sessionState) {
    return res.status(400).json({ error: 'Invalid state parameter' });
  }
  
  try {
    const tokenSet = await client.callback(
      process.env.COGNITO_REDIRECT_URI,
      { code },
      { nonce }
    );
    
    const userInfo = await client.userinfo(tokenSet);
    
    // Store user info in session
    req.session.userInfo = userInfo;
    req.session.tokenSet = tokenSet;
    
    // Redirect to client application
    res.redirect(process.env.CLIENT_URL);
  } catch (error) {
    console.error('Error during callback:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

// Logout route
app.get('/logout', (req, res) => {
  // Clear session
  req.session.destroy();
  
  // Construct Cognito logout URL
  const logoutUrl = client.endSessionUrl({
    post_logout_redirect_uri: process.env.COGNITO_LOGOUT_URI
  });
  
  res.json({ logoutUrl });
});

// User info route
app.get('/userinfo', checkAuth, (req, res) => {
  if (!req.isAuthenticated) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  
  res.json(req.session.userInfo);
});

// Token refresh route
app.post('/refresh-token', checkAuth, async (req, res) => {
  if (!req.isAuthenticated) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  
  try {
    const tokenSet = await client.refresh(req.session.tokenSet.refresh_token);
    req.session.tokenSet = tokenSet;
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error refreshing token:', error);
    res.status(500).json({ error: 'Failed to refresh token' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
