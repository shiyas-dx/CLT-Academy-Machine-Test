const express = require('express');
const router  = express.Router();
const {
  register,
  login,
  logout,
  refreshToken,
  sendOtp,
  resetPassword,
} = require('../controllers/authController');

router.post('/register',      register);
router.post('/login',         login);
router.post('/logout',        logout);
router.post('/refresh-token', refreshToken);
router.post('/send-otp',      sendOtp);
router.post('/reset-password', resetPassword);

module.exports = router;
