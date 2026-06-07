const express              = require('express');
const { body }             = require('express-validator');
const { register, login, getMe } = require('../controllers/auth.controller');
const auth                 = require('../middleware/auth.middleware');
const validate             = require('../middleware/validate.middleware');

const router = express.Router();

router.post(
  '/register',
  [
    body('fullName').trim().notEmpty().withMessage('Full name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('mobile')
      .trim()
      .notEmpty()
      .isMobilePhone()
      .withMessage('Valid mobile number is required'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters'),
    body('referralCode').optional().trim().isLength({ min: 8, max: 8 }).withMessage('Invalid referral code format'),
  ],
  validate,
  register
);

router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  login
);

router.get('/me', auth, getMe);

module.exports = router;
