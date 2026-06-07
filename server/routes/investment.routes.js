const express  = require('express');
const { body } = require('express-validator');
const { createInvestment, getInvestments, getROIHistory } = require('../controllers/investment.controller');
const auth     = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');

const router = express.Router();

router.post(
  '/',
  auth,
  [
    body('amount')
      .isFloat({ min: 1 })
      .withMessage('Amount must be a positive number'),
    body('planName')
      .trim()
      .notEmpty()
      .withMessage('Plan name is required'),
    body('planDurationDays')
      .isInt({ min: 1 })
      .withMessage('Plan duration must be a positive integer'),
    body('dailyROIPercent')
      .isFloat({ min: 0.01, max: 100 })
      .withMessage('Daily ROI percent must be between 0.01 and 100'),
  ],
  validate,
  createInvestment
);

router.get('/',           auth, getInvestments);
router.get('/roi-history', auth, getROIHistory);

module.exports = router;
