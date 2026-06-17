const User     = require('../models/User');
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const nodemailer = require('nodemailer');

// ── JWT helpers ───────────────────────────────────────────────────────────────
const ACCESS_SECRET  = process.env.JWT_SECRET  || 'access_secret';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'refresh_secret';
const ACCESS_EXPIRY  = '15m';
const REFRESH_EXPIRY = '7d';

const signAccess  = (payload) => jwt.sign(payload, ACCESS_SECRET,  { expiresIn: ACCESS_EXPIRY  });
const signRefresh = (payload) => jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRY });

const COOKIE_OPTS = {
  httpOnly: true,
  secure:   process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  path:     '/',
};

// ── Brevo SMTP transporter ────────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  host: process.env.BREVO_SMTP_HOST || 'smtp-relay.brevo.com',
  port: parseInt(process.env.BREVO_SMTP_PORT || '587', 10),
  auth: {
    user: process.env.BREVO_SMTP_USER,
    pass: process.env.BREVO_SMTP_PASS,
  },
});

// ────────────────────────────────────────────────────────────────────────────
//  POST /auth/register
// ────────────────────────────────────────────────────────────────────────────
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: 'Email and password are required' });

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(409).json({ message: 'Email already registered' });

    const salt   = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    const user = await User.create({ name, email, password: hashed });

    const accessToken  = signAccess ({ id: user._id });
    const refreshToken = signRefresh({ id: user._id });

    res
      .cookie('accessToken',  accessToken,  { ...COOKIE_OPTS, maxAge: 15 * 60 * 1000 })
      .cookie('refreshToken', refreshToken, { ...COOKIE_OPTS, maxAge: 7 * 24 * 60 * 60 * 1000 })
      .status(201)
      .json({ message: 'Registered successfully', user: { id: user._id, name: user.name, email: user.email } });
  } catch (error) {
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
};

// ────────────────────────────────────────────────────────────────────────────
//  POST /auth/login
// ────────────────────────────────────────────────────────────────────────────
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: 'Email and password are required' });

    const user = await User.findOne({ email });
    if (!user || !user.password)
      return res.status(401).json({ message: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid)
      return res.status(401).json({ message: 'Invalid credentials' });

    const accessToken  = signAccess ({ id: user._id });
    const refreshToken = signRefresh({ id: user._id });

    res
      .cookie('accessToken',  accessToken,  { ...COOKIE_OPTS, maxAge: 15 * 60 * 1000 })
      .cookie('refreshToken', refreshToken, { ...COOKIE_OPTS, maxAge: 7 * 24 * 60 * 60 * 1000 })
      .json({
        message: 'Login successful',
        user:    { id: user._id, name: user.name, email: user.email },
        accessToken,   // also returned in body so NextAuth can store it
      });
  } catch (error) {
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
};

// ────────────────────────────────────────────────────────────────────────────
//  POST /auth/logout
// ────────────────────────────────────────────────────────────────────────────
exports.logout = (_req, res) => {
  res
    .cookie('accessToken',  '', { ...COOKIE_OPTS, maxAge: 0 })
    .cookie('refreshToken', '', { ...COOKIE_OPTS, maxAge: 0 })
    .json({ message: 'Logged out successfully' });
};

// ────────────────────────────────────────────────────────────────────────────
//  POST /auth/refresh-token
// ────────────────────────────────────────────────────────────────────────────
exports.refreshToken = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token)
      return res.status(401).json({ message: 'No refresh token provided' });

    const decoded = jwt.verify(token, REFRESH_SECRET);
    const user    = await User.findById(decoded.id).select('-password');
    if (!user)
      return res.status(401).json({ message: 'User not found' });

    const newAccessToken = signAccess({ id: user._id });

    res
      .cookie('accessToken', newAccessToken, { ...COOKIE_OPTS, maxAge: 15 * 60 * 1000 })
      .json({ accessToken: newAccessToken });
  } catch {
    res.status(401).json({ message: 'Invalid or expired refresh token' });
  }
};

// ────────────────────────────────────────────────────────────────────────────
//  POST /auth/send-otp
// ────────────────────────────────────────────────────────────────────────────
exports.sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: 'User not found' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp        = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    await transporter.sendMail({
      from:    '"CLT Academy" <noreply@cltacademytest.com>',
      to:      email,
      subject: 'Your Password Reset OTP',
      html: `
        <div style="font-family:sans-serif;max-width:400px;margin:auto;padding:32px;background:#0f172a;color:#e2e8f0;border-radius:12px">
          <h2 style="color:#818cf8;margin:0 0 8px">Password Reset</h2>
          <p style="color:#94a3b8;margin:0 0 24px">Use the OTP below to reset your password. It expires in 10 minutes.</p>
          <div style="background:#1e293b;border:1px solid #334155;border-radius:8px;padding:20px;text-align:center;font-size:32px;letter-spacing:12px;font-weight:bold;color:#a5b4fc">${otp}</div>
          <p style="color:#64748b;font-size:12px;margin-top:24px">If you didn't request this, ignore this email.</p>
        </div>
      `,
    });

    res.json({ message: 'OTP sent to your email' });
  } catch (error) {
    res.status(500).json({ message: 'Error sending OTP', error: error.message });
  }
};

// ────────────────────────────────────────────────────────────────────────────
//  POST /auth/reset-password
// ────────────────────────────────────────────────────────────────────────────
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({ email, otp, otpExpires: { $gt: Date.now() } });

    if (!user)
      return res.status(400).json({ message: 'Invalid or expired OTP' });

    const salt = await bcrypt.genSalt(10);
    user.password   = await bcrypt.hash(newPassword, salt);
    user.otp        = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error resetting password', error: error.message });
  }
};

// ────────────────────────────────────────────────────────────────────────────
//  POST /auth/google-login
// ────────────────────────────────────────────────────────────────────────────
exports.googleLogin = async (req, res) => {
  try {
    const { email, name } = req.body;
    if (!email)
      return res.status(400).json({ message: 'Email is required' });

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({ email, name });
    }

    const accessToken  = signAccess ({ id: user._id });
    const refreshToken = signRefresh({ id: user._id });

    res
      .cookie('accessToken',  accessToken,  { ...COOKIE_OPTS, maxAge: 15 * 60 * 1000 })
      .cookie('refreshToken', refreshToken, { ...COOKIE_OPTS, maxAge: 7 * 24 * 60 * 60 * 1000 })
      .json({
        message: 'Google login successful',
        user:    { id: user._id, name: user.name, email: user.email },
        accessToken,
      });
  } catch (error) {
    res.status(500).json({ message: 'Google login failed', error: error.message });
  }
};
