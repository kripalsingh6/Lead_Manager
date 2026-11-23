// ─────────────────────────────────────────────
// Auth Controller
//
// Implements Layer 4: Sets secure HttpOnly SameSite
// cookies alongside JSON response.
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
 * Cookie options for HttpOnly session defense:
 * Pure session cookie (no maxAge/expires) so the cookie is destroyed
 * automatically when the browser or tab is closed.
 */
const getCookieOptions = () => ({
  httpOnly: true,
  secure: config.nodeEnv === 'production',
  sameSite: config.nodeEnv === 'production' ? 'none' : 'lax'
});

/**
 * Format a human-readable name from an email prefix
 * e.g. "kripal@gmail.com" -> "Kripal"
 */
const formatNameFromEmail = (email) => {
  if (!email) return 'User';
  const prefix = email.split('@')[0];
  const cleaned = prefix.replace(/[._-]+/g, ' ').replace(/\d+/g, '').trim();
  if (!cleaned) return prefix;
  return cleaned
    .split(' ')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
};

/**
 * Sends token via HttpOnly cookie AND JSON payload for dual defense
 */
const sendAuthResponse = (res, statusCode, message, user) => {
  const token = generateToken(user.id);
  res.cookie('token', token, getCookieOptions());

  res.status(statusCode).json({
    success: true,
    message,
    data: {
      user: user.toSafeObject(),
      token
    }
  });
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const existing = await User.findOne({ where: { email: email.toLowerCase().trim() } });
  if (existing) {
    throw ApiError.conflict('An account with this email already exists');
  }

  const isDemo = email.toLowerCase().trim() === 'alex@leadmanager.io' || email.toLowerCase().trim() === 'demo@leadmanager.io';
  const finalName = name && name.trim() && (isDemo || name.trim() !== 'Alex Morgan')
    ? name.trim()
    : (isDemo ? 'Alex Morgan' : formatNameFromEmail(email));

  const user = await User.scope('withPassword').create({
    name: finalName,
    email: email.toLowerCase().trim(),
    password,
    onboardingCompleted: false
  });
  sendAuthResponse(res, 201, 'Account created successfully', user);
});

/**
 * @desc    Log in an existing user
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.scope('withPassword').findOne({ where: { email: email.toLowerCase().trim() } });
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

  // If this is another email whose name was previously stored as "Alex Morgan" or "User", fix it
  const isDemo = user.email === 'alex@leadmanager.io' || user.email === 'demo@leadmanager.io';
  if (!isDemo && (user.name === 'Alex Morgan' || user.name === 'User' || !user.name)) {
    user.name = formatNameFromEmail(user.email);
    await user.save();
  }

  sendAuthResponse(res, 200, 'Login successful', user);
});

/**
 * @desc    Log out user & clear HttpOnly cookie
 * @route   POST /api/auth/logout
 * @access  Public
 */
export const logout = (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: config.nodeEnv === 'production',
    sameSite: config.nodeEnv === 'production' ? 'strict' : 'lax'
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
};

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
 * @desc    Authenticate with Google via idToken or authorization code
 * @route   POST /api/auth/google
 * @access  Public
 */
export const googleAuth = asyncHandler(async (req, res) => {
  const { idToken, accessToken, code } = req.body;

  if (!config.google.clientId) {
    throw ApiError.internal('Google OAuth is not configured on the server. Please set GOOGLE_CLIENT_ID in .env.');
  }

  let googleId;
  let email;
  let name;
  let picture;

  const oAuth2Client = getOAuth2Client();

  if (accessToken) {
    try {
      const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      if (!userInfoRes.ok) {
        throw new Error(`Google API returned status ${userInfoRes.status}`);
      }
      const profile = await userInfoRes.json();
      googleId = profile.sub;
      email = profile.email;
      name = profile.name;
      picture = profile.picture;
    } catch (err) {
      throw ApiError.unauthorized(`Invalid Google Access Token: ${err.message}`);
    }
  } else if (idToken) {
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

  let user = await User.findOne({
    where: {
      [Op.or]: [
        { googleId },
        { email: email.toLowerCase().trim() }
      ]
    }
  });

  if (user) {
    let changed = false;
    // Always sync the user's latest name and avatar from Google
    if (name && user.name !== name) {
      user.name = name;
      changed = true;
    }
    if (picture && user.avatar !== picture) {
      user.avatar = picture;
      changed = true;
    }
    if (!user.googleId) {
      user.googleId = googleId;
      changed = true;
    }
    if (changed) await user.save();
  } else {
    user = await User.create({
      name: name || formatNameFromEmail(email),
      email: email.toLowerCase().trim(),
      googleId,
      avatar: picture || null,
      authProvider: 'google',
      password: null,
      onboardingCompleted: true
    });
  }

  sendAuthResponse(res, 200, 'Google authentication successful', user);
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
    return res.redirect(`${config.clientUrl}/?error=${encodeURIComponent(error)}`);
  }

  if (!code) {
    return res.redirect(`${config.clientUrl}/?error=MissingAuthorizationCode`);
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
      let changed = false;
      if (name && user.name !== name) {
        user.name = name;
        changed = true;
      }
      if (picture && user.avatar !== picture) {
        user.avatar = picture;
        changed = true;
      }
      if (!user.googleId) {
        user.googleId = googleId;
        changed = true;
      }
      if (changed) await user.save();
    } else {
      user = await User.create({
        name: name || formatNameFromEmail(email),
        email: email.toLowerCase().trim(),
        googleId,
        avatar: picture || null,
        authProvider: 'google',
        password: null,
        onboardingCompleted: true
      });
    }

    const token = generateToken(user.id);
    res.cookie('token', token, getCookieOptions());

    return res.redirect(`${config.clientUrl}/?token=${token}`);
  } catch (err) {
    return res.redirect(`${config.clientUrl}/?error=${encodeURIComponent(err.message)}`);
  }
});

/**
 * @desc    Update user profile & complete onboarding
 * @route   PUT /api/auth/profile
 * @access  Private
 */
export const updateProfile = asyncHandler(async (req, res) => {
  const { name, role, domain, onboardingCompleted } = req.body;
  const user = req.user;

  if (name !== undefined && name.trim()) user.name = name.trim();
  if (role !== undefined) user.role = role.trim();
  if (domain !== undefined) user.domain = domain.trim();
  if (onboardingCompleted !== undefined) user.onboardingCompleted = Boolean(onboardingCompleted);

  await user.save();

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: user.toSafeObject()
  });
});
