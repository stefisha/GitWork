import express from 'express';
import passport from 'passport';
import { Strategy as GitHubStrategy } from 'passport-github2';

const router = express.Router();

// GitHub OAuth configuration
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const CALLBACK_URL = process.env.AUTH_CALLBACK_URL || 'http://localhost:3000/auth/github/callback';

if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
  console.warn('⚠️  GitHub OAuth not configured. Set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET in .env');
}

// Configure passport
passport.use(new GitHubStrategy({
  clientID: GITHUB_CLIENT_ID,
  clientSecret: GITHUB_CLIENT_SECRET,
  callbackURL: CALLBACK_URL
},
function(accessToken, refreshToken, profile, done) {
  // In a real app, you'd save the user to database
  return done(null, profile);
}));

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

/**
 * Initiate GitHub OAuth flow
 */
router.get('/github', (req, res, next) => {
  const returnTo = req.query.returnTo || '/';
  console.log('🔐 GitHub OAuth initiated');
  console.log('   Return URL:', returnTo);
  
  // Store returnTo in the OAuth state parameter instead of session
  const state = Buffer.from(JSON.stringify({ returnTo })).toString('base64');
  
  passport.authenticate('github', { 
    scope: ['user:email'],
    state: state
  })(req, res, next);
});

/**
 * GitHub OAuth callback
 */
router.get('/github/callback',
  passport.authenticate('github', { failureRedirect: '/' }),
  (req, res) => {
    console.log('🔐 GitHub OAuth callback received');
    console.log('   User:', req.user?.username);
    
    // Extract returnTo from OAuth state parameter
    let returnTo = '/';
    try {
      const state = req.query.state;
      if (state) {
        const decodedState = JSON.parse(Buffer.from(state, 'base64').toString());
        returnTo = decodedState.returnTo || '/';
      }
    } catch (error) {
      console.log('   Error parsing state:', error.message);
    }
    
    console.log('   Return URL from state:', returnTo);
    
    // Store user in session
    req.session.githubUser = {
      login: req.user.username,
      name: req.user.displayName,
      avatar: req.user.photos?.[0]?.value
    };
    
    console.log('   Redirecting to:', returnTo);
    res.redirect(returnTo);
  }
);

/**
 * Logout
 */
router.get('/logout', (req, res) => {
  const returnTo = req.query.returnTo || '/';
  req.logout((err) => {
    if (err) {
      console.error('Logout error:', err);
    }
    req.session.destroy();
    res.redirect(returnTo);
  });
});

/**
 * Get current user
 */
router.get('/user', (req, res) => {
  if (req.session && req.session.githubUser) {
    res.json(req.session.githubUser);
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
});

/**
 * POST /auth/logout
 * Logout user and clear session
 */
router.post('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error('❌ Logout error:', err);
      return res.status(500).json({ success: false, error: 'Logout failed' });
    }
    
    req.session.destroy((err) => {
      if (err) {
        console.error('❌ Session destroy error:', err);
        return res.status(500).json({ success: false, error: 'Session destroy failed' });
      }
      
      res.clearCookie('connect.sid');
      res.json({ success: true, message: 'Logged out successfully' });
    });
  });
});

export default router;

