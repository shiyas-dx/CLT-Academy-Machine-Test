const jwt  = require('jsonwebtoken');
const User = require('../models/User');

const ACCESS_SECRET = process.env.JWT_SECRET || 'access_secret';
const MOCK_TOKENS   = new Set(['mock-jwt-token', 'google-mock-token']);

const protect = async (req, res, next) => {
  try {
    // 1. Try httpOnly cookie first, then fall back to Authorization header
    let token =
      req.cookies?.accessToken ||
      (req.headers.authorization?.startsWith('Bearer ')
        ? req.headers.authorization.split(' ')[1]
        : null);

    if (!token)
      return res.status(401).json({ message: 'Not authorized — no token provided' });

    // 2. Mock-token bypass for NextAuth credential/google sessions
    if (MOCK_TOKENS.has(token)) {
      let mockUser = await User.findOne({ email: 'test@example.com' });
      if (!mockUser) {
        mockUser = await User.create({
          name:     'Test User',
          email:    'test@example.com',
          password: 'mockpassword123',
        });
      }
      req.user = { id: mockUser._id.toString() };
      return next();
    }

    // 3. Verify real JWT
    const decoded = jwt.verify(token, ACCESS_SECRET);
    req.user = { id: decoded.id };
    return next();
  } catch (error) {
    if (error.name === 'TokenExpiredError')
      return res.status(401).json({ message: 'Token expired', code: 'TOKEN_EXPIRED' });
    return res.status(401).json({ message: 'Not authorized — invalid token' });
  }
};

module.exports = { protect };