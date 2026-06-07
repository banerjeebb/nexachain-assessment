/**
 * @file referral.controller.js
 * @description Endpoints for inspecting a user's referral network: direct
 * referrals, the full multi-level referral tree, and paginated referral
 * income history.
 */

const mongoose      = require('mongoose');
const User           = require('../models/User.model');
const ReferralIncome = require('../models/ReferralIncome.model');

/**
 * GET /api/referrals/direct
 *
 * Lists users directly referred by the authenticated user (i.e. those whose
 * `referredBy` points at them — level 1 only), newest first.
 *
 * @param {express.Request} req
 * @param {express.Response} res
 * @returns {Promise<void>} 200 with an array of referred users as `data`.
 */
const getDirectReferrals = async (req, res) => {
  try {
    const referrals = await User.find({ referredBy: req.user._id })
      .select('fullName email referralCode accountStatus createdAt')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data:    referrals,
      message: 'Direct referrals fetched',
    });
  } catch (err) {
    console.error('[Referral] Direct error:', err.message);
    return res.status(500).json({ success: false, data: null, message: 'Server error' });
  }
};

/**
 * GET /api/referrals/tree
 *
 * Builds the authenticated user's full downline tree (up to 5 levels deep,
 * `maxDepth: 4` is 0-indexed) using `$graphLookup`, which returns a flat
 * array of descendants annotated with `depth`. That flat array is then
 * reconstructed into a nested `children` structure by {@link buildNestedTree}
 * before being returned.
 *
 * @param {express.Request} req
 * @param {express.Response} res
 * @returns {Promise<void>} 200 with { _id, fullName, referralCode, children } as `data`;
 *   404 if the authenticated user can no longer be found.
 */
const getReferralTree = async (req, res) => {
  try {
    const result = await User.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(req.user._id) } },
      {
        $graphLookup: {
          from:             'users',
          startWith:        '$_id',
          connectFromField: '_id',
          connectToField:   'referredBy',
          as:               'tree',
          maxDepth:         4,       // 0-indexed → 5 levels
          depthField:       'depth',
          restrictSearchWithMatch: {},
        },
      },
      {
        $project: {
          fullName:     1,
          referralCode: 1,
          tree: {
            $map: {
              input: '$tree',
              as:    'node',
              in: {
                _id:          '$$node._id',
                fullName:     '$$node.fullName',
                referralCode: '$$node.referralCode',
                referredBy:   '$$node.referredBy',
                depth:        '$$node.depth',
              },
            },
          },
        },
      },
    ]);

    const root = result[0];
    if (!root) return res.status(404).json({ success: false, data: null, message: 'User not found' });

    // Reconstruct nested tree from flat $graphLookup result
    const nested = buildNestedTree(req.user._id.toString(), root.tree);

    return res.status(200).json({
      success: true,
      data: {
        _id:          req.user._id,
        fullName:     req.user.fullName,
        referralCode: req.user.referralCode,
        children:     nested,
      },
      message: 'Referral tree fetched',
    });
  } catch (err) {
    console.error('[Referral] Tree error:', err.message);
    return res.status(500).json({ success: false, data: null, message: 'Server error' });
  }
};

/**
 * Recursively reconstructs a nested referral tree from the flat array
 * produced by `$graphLookup` (each node only knows its direct `referredBy`).
 *
 * @param {string} parentId - String form of the parent user's `_id` to collect children for.
 * @param {Array<Object>} flatNodes - Flat list of descendant nodes, each with `_id`, `referredBy`, `depth`, etc.
 * @returns {Array<Object>} Nested array where each node has a `children` array of the same shape.
 */
const buildNestedTree = (parentId, flatNodes) => {
  return flatNodes
    .filter((n) => n.referredBy?.toString() === parentId)
    .map((n) => ({
      _id:          n._id,
      fullName:     n.fullName,
      referralCode: n.referralCode,
      depth:        n.depth,
      children:     buildNestedTree(n._id.toString(), flatNodes),
    }));
};

/**
 * GET /api/referrals/income
 *
 * Returns a paginated, newest-first list of referral/level income records
 * credited to the authenticated user, with `generatorId` populated to the
 * downline user who generated each payout.
 *
 * @param {express.Request} req - Query: { page?, limit? } (limit capped at 50).
 * @param {express.Response} res
 * @returns {Promise<void>} 200 with { income, pagination } as `data`.
 */
const getReferralIncome = async (req, res) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 10);
    const skip  = (page - 1) * limit;

    const [income, total] = await Promise.all([
      ReferralIncome.find({ receiverId: req.user._id })
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit)
        .populate('generatorId', 'fullName email referralCode'),
      ReferralIncome.countDocuments({ receiverId: req.user._id }),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        income,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      },
      message: 'Referral income fetched',
    });
  } catch (err) {
    console.error('[Referral] Income error:', err.message);
    return res.status(500).json({ success: false, data: null, message: 'Server error' });
  }
};

module.exports = { getDirectReferrals, getReferralTree, getReferralIncome };
