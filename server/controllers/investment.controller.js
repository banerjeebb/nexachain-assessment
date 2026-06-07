/**
 * @file investment.controller.js
 * @description Handles creating investments, listing a user's investments,
 * and paginated retrieval of ROI credit history.
 */

const Investment = require('../models/Investment.model');
const ROIHistory = require('../models/ROIHistory.model');
const { distributeReferralIncome } = require('../services/referral.service');

/**
 * POST /api/investments
 *
 * Creates a new investment for the authenticated user. `endDate` is computed
 * as `startDate + planDurationDays`. Once saved, multi-level referral income
 * is distributed up the referrer chain — this is fired-and-forgotten (not
 * awaited) so a referral-distribution failure never blocks the investment
 * response; any error is logged instead.
 *
 * @param {express.Request} req - Body: { amount, planName, planDurationDays, dailyROIPercent }
 * @param {express.Response} res
 * @returns {Promise<void>} 201 with the created investment as `data`.
 */
const createInvestment = async (req, res) => {
  try {
    const { amount, planName, planDurationDays, dailyROIPercent } = req.body;

    const startDate = new Date();
    const endDate   = new Date(startDate);
    endDate.setDate(endDate.getDate() + planDurationDays);

    const investment = await Investment.create({
      userId: req.user._id,
      amount,
      planName,
      planDurationDays,
      dailyROIPercent,
      startDate,
      endDate,
    });

    // Fire-and-forget: distribute referral income up the chain
    distributeReferralIncome(investment).catch((err) =>
      console.error('[Investment] Referral distribution error:', err.message)
    );

    return res.status(201).json({
      success: true,
      data:    investment,
      message: 'Investment created successfully',
    });
  } catch (err) {
    console.error('[Investment] Create error:', err.message);
    return res.status(500).json({ success: false, data: null, message: 'Server error' });
  }
};

/**
 * GET /api/investments
 *
 * Lists all investments belonging to the authenticated user, newest first.
 *
 * @param {express.Request} req
 * @param {express.Response} res
 * @returns {Promise<void>} 200 with an array of investments as `data`.
 */
const getInvestments = async (req, res) => {
  try {
    const investments = await Investment.find({ userId: req.user._id }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data:    investments,
      message: 'Investments fetched',
    });
  } catch (err) {
    console.error('[Investment] Fetch error:', err.message);
    return res.status(500).json({ success: false, data: null, message: 'Server error' });
  }
};

/**
 * GET /api/roi/history
 *
 * Returns a paginated, newest-first list of the authenticated user's ROI
 * credit records, with each entry's `investmentId` populated to its
 * `planName` and `amount`.
 *
 * @param {express.Request} req - Query: { page?, limit? } (limit capped at 50).
 * @param {express.Response} res
 * @returns {Promise<void>} 200 with { history, pagination } as `data`.
 */
const getROIHistory = async (req, res) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 10);
    const skip  = (page - 1) * limit;

    const [history, total] = await Promise.all([
      ROIHistory.find({ userId: req.user._id })
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit)
        .populate('investmentId', 'planName amount'),
      ROIHistory.countDocuments({ userId: req.user._id }),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        history,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      },
      message: 'ROI history fetched',
    });
  } catch (err) {
    console.error('[Investment] ROI history error:', err.message);
    return res.status(500).json({ success: false, data: null, message: 'Server error' });
  }
};

module.exports = { createInvestment, getInvestments, getROIHistory };
