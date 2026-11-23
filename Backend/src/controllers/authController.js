// ─────────────────────────────────────────────
// Auth Controller
//
// Local Auth:
//   POST /api/auth/register — create account
//   POST /api/auth/login    — authenticate
//   GET  /api/auth/me       — current user profile
//
// Google OAuth:
//   POST /api/auth/google          — authenticate via idToken or code
//   GET  /api/auth/google          — generate OAuth authorization URL
//   GET  /api/auth/google/callback — OAuth redirect callback
// ─────────────────────────────────────────────
import { Op } from 'sequelize';
import { OAuth2Client } from 'google-auth-library';
import { User } from '../models/index.js';
import { generateToken } from '../utils/generateToken.js';
import { config } from '../config/environment.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * Creates an OAuth2 client configured with environment settings.
 */
const getOAuth2Client = () => {
  return new OAuth2Client(
    config.google.clientId,
    config.google.clientSecret,
    config.google.callbackUrl
  );
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // Check for existing account
  const existing = await User.findOne({ where: { email } });
  if (existing) {
    throw ApiError.conflict('An account with this email already exists');
  }

  // Create user — password is automatically hashed by model hook
  const user = await User.scope('withPassword').create({ name, email, password });
  const token = generateToken(user.id);

  res.status(201).json({
    success: true,
    message: 'Account created successfully',
    data: { user: user.toSafeObject(), token }
  });
});

/**
 * @desc    Log in an existing user
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Fetch user WITH password (excluded by default scope)
  const user = await User.scope('withPassword').findOne({ where: { email } });
  if (!user) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  if (!user.password) {
    throw ApiError.badRequest('This account uses Google Sign-In. Please sign in with Google.');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  const token = generateToken(user.id);

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: { user: user.toSafeObject(), token }
  });
});

/**
 * @desc    Get the currently authenticated user
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getMe = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    data: req.user
  });
});

/**
 * @desc    Authenticate with Google via idToken (from Google Login button) or authorization code
 * @route   POST /api/auth/google
 * @access  Public
 */
export const googleAuth = asyncHandler(async (req, res) => {
  const { idToken, code } = req.body;

  if (!config.google.clientId) {
    throw ApiError.internal('Google OAuth is not configured on the server. Please set GOOGLE_CLIENT_ID in .env.');
  }

  let googleId;
  let email;
  let name;
  let picture;

  const oAuth2Client = getOAuth2Client();

  if (idToken) {
    // 1. Verify Google ID token
    try {
      const ticket = await oAuth2Client.verifyIdToken({
        idToken,
        audience: config.google.clientId
      });
      const payload = ticket.getPayload();
      googleId = payload.sub;
      email = payload.email;
      name = payload.name;
      picture = payload.picture;
    } catch (err) {
      throw ApiError.unauthorized(`Invalid Google ID Token: ${err.message}`);
    }
  } else if (code) {
    // 2. Exchange authorization code for tokens
    try {
      const { tokens } = await oAuth2Client.getToken(code);
      const ticket = await oAuth2Client.verifyIdToken({
        idToken: tokens.id_token,
        audience: config.google.clientId
      });
      const payload = ticket.getPayload();
      googleId = payload.sub;
      email = payload.email;
      name = payload.name;
      picture = payload.picture;
    } catch (err) {
      throw ApiError.unauthorized(`Failed to exchange Google code: ${err.message}`);
    }
  }

  if (!email) {
    throw ApiError.badRequest('Unable to obtain email from Google account');
  }

  // 3. Find existing user by googleId or email
  let user = await User.findOne({
    where: {
      [Op.or]: [
        { googleId },
        { email: email.toLowerCase().trim() }
      ]
    }
  });

  if (user) {
    // Link googleId if user previously registered with email/password
    if (!user.googleId) {
      user.googleId = googleId;
      if (picture && !user.avatar) user.avatar = picture;
      await user.save();
    }
  } else {
    // Create new user via Google
    user = await User.create({
      name: name || email.split('@')[0],
      email: email.toLowerCase().trim(),
      googleId,
      avatar: picture || null,
      authProvider: 'google',
      password: null
    });
  }

  // 4. Generate JWT application token
  const token = generateToken(user.id);

  res.status(200).json({
    success: true,
    message: 'Google authentication successful',
    data: {
      user: user.toSafeObject(),
      token
    }
  });
});

/**
 * @desc    Generate Google OAuth authorization redirect URL
 * @route   GET /api/auth/google
 * @access  Public
 */
export const getGoogleAuthUrl = (req, res) => {
  if (!config.google.clientId) {
    throw ApiError.internal('Google OAuth is not configured on the server. Please set GOOGLE_CLIENT_ID in .env.');
  }

  const oAuth2Client = getOAuth2Client();
  const url = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email'
    ],
    prompt: 'select_account'
  });

  res.status(200).json({
    success: true,
    data: { url }
  });
};

/**
 * @desc    OAuth Callback from Google redirect flow
 * @route   GET /api/auth/google/callback
 * @access  Public
 */
export const googleAuthCallback = asyncHandler(async (req, res) => {
  const { code, error } = req.query;

  if (error) {
    return res.redirect(`${config.clientUrl}/login?error=${encodeURIComponent(error)}`);
  }

  if (!code) {
    return res.redirect(`${config.clientUrl}/login?error=MissingAuthorizationCode`);
  }

  try {
    const oAuth2Client = getOAuth2Client();
    const { tokens } = await oAuth2Client.getToken(code);
    const ticket = await oAuth2Client.verifyIdToken({
      idToken: tokens.id_token,
      audience: config.google.clientId
    });
    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    let user = await User.findOne({
      where: {
        [Op.or]: [
          { googleId },
          { email: email.toLowerCase().trim() }
        ]
      }
    });

    if (user) {
      if (!user.googleId) {
        user.googleId = googleId;
        if (picture && !user.avatar) user.avatar = picture;
        await user.save();
      }
    } else {
      user = await User.create({
        name: name || email.split('@')[0],
        email: email.toLowerCase().trim(),
        googleId,
        avatar: picture || null,
        authProvider: 'google',
        password: null
      });
    }

    const token = generateToken(user.id);

    // Redirect user back to frontend with the auth token
    return res.redirect(`${config.clientUrl}/auth/callback?token=${token}`);
  } catch (err) {
    return res.redirect(`${config.clientUrl}/login?error=${encodeURIComponent(err.message)}`);
  }
});
