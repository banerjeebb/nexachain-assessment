const express = require('express');
const { getDirectReferrals, getReferralTree, getReferralIncome } = require('../controllers/referral.controller');
const auth    = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/direct', auth, getDirectReferrals);
router.get('/tree',   auth, getReferralTree);
router.get('/income', auth, getReferralIncome);

module.exports = router;
