const { z } = require('zod');
const authService = require('../services/authService');

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['CITIZEN', 'ADMIN', 'DRIVER']).optional().default('CITIZEN'),
  phone: z.string().optional().default(''),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

function setAuthCookie(res, token) {
  const isProduction = process.env.NODE_ENV === 'production';
  res.cookie('token', token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
}

async function signup(req, res, next) {
  try {
    const validatedData = signupSchema.parse(req.body);
    const { user, token } = await authService.registerUser(validatedData);

    setAuthCookie(res, token);

    return res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: { user, token },
    });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const validatedData = loginSchema.parse(req.body);
    const { user, token } = await authService.authenticateUser(validatedData);

    setAuthCookie(res, token);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: { user, token },
    });
  } catch (err) {
    next(err);
  }
}

async function logout(req, res) {
  const isProduction = process.env.NODE_ENV === 'production';
  res.clearCookie('token', {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
  });
  return res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
}

async function getMe(req, res) {
  return res.status(200).json({
    success: true,
    data: { user: req.user },
  });
}

module.exports = {
  signupSchema,
  loginSchema,
  signup,
  login,
  logout,
  getMe,
};

