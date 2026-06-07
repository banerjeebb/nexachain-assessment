/**
 * @file dashboard.controller.js
 * @description Aggregates a user's headline financial figures for the
 * dashboard summary view (wallet balance, ROI earned, referral income,
 * total invested capital).
 */

const User = require('../models/User.model');

/**
 * GET /api/dashboard
 *
 * Returns the authenticated user's dashboard summary: total amount currently
 * invested (across `active`/`completed` investments), lifetime ROI earned,
 * lifetime referral/level income, and current wallet balance.
 *
 * @param {express.Request} req
 * @param {express.Response} res
 * @returns {Promise<void>} 200 with
 *   { totalInvestments, totalROIEarned, totalLevelIncome, walletBalance } as `data`.
 */
const getDashboard = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select(
      'walletBalance totalROIEarned totalLevelIncome'
    );

    // totalInvestments = sum of all active/completed investment amounts
    const Investment = require('../models/Investment.model');
    const agg = await Investment.aggregate([
      { $match: { userId: req.user._id, status: { $in: ['active', 'completed'] } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    return res.status(200).json({
      success: true,
      data: {
        totalInvestments: agg[0]?.total         ?? 0,
        totalROIEarned:   user.totalROIEarned   ?? 0,
        totalLevelIncome: user.totalLevelIncome ?? 0,
        walletBalance:    user.walletBalance    ?? 0,
      },
      message: 'Dashboard data fetched',
    });
  } catch (err) {
    console.error('[Dashboard] Error:', err.message);
    return res.status(500).json({ success: false, data: null, message: 'Server error' });
  }
};

module.exports = { getDashboard };
