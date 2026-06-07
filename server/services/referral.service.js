/**
 * @file referral.service.js
 * @description Multi-level referral income distribution service.
 *
 * Triggered once when a new investment is created — NOT on every daily ROI cycle.
 * This is a deliberate design decision: level income is a one-time commission
 * on the investment event, analogous to a sales referral fee.
 *
 * Distribution walks UP the referral chain from the investor to their referrer,
 * then their referrer's referrer, and so on — up to MAX_REFERRAL_LEVELS deep.
 * Each ancestor is credited a percentage of the investment amount defined by
 * LEVEL_PERCENTAGES (index 0 = direct referrer = Level 1).
 *
 * Example for a ₹10,000 investment with LEVEL_PERCENTAGES = [5, 3, 2, 1, 0.5]:
 *   Level 1 (direct referrer)  → ₹500   (5%)
 *   Level 2 (referrer's ref.)  → ₹300   (3%)
 *   Level 3                    → ₹200   (2%)
 *   Level 4                    → ₹100   (1%)
 *   Level 5                    → ₹50    (0.5%)
 *
 * Each level credit is wrapped in its own Mongoose transaction so a failure
 * at level 3 does NOT roll back the already-committed credits at levels 1 and 2.
 */

const mongoose       = require('mongoose');
const User           = require('../models/User.model');
const ReferralIncome = require('../models/ReferralIncome.model');
const { LEVEL_PERCENTAGES, MAX_REFERRAL_LEVELS } = require('../config/constants');

/**
 * Rounds a number to 2 decimal places.
 * Prevents floating-point dust (e.g. 0.1 + 0.2 = 0.30000000000000004)
 * from corrupting wallet balances across thousands of referral credits.
 *
 * @param {number} value
 * @returns {number}
 */
const round2 = (value) => Math.round((value + Number.EPSILON) * 100) / 100;

/**
 * distributeReferralIncome()
 *
 * Traverses the referral hierarchy upward from the investor, crediting each
 * eligible ancestor with their level-based commission on this investment.
 *
 * @param {mongoose.Document} investment - The newly created Investment document.
 *   Must contain at minimum: `userId` (the investor's ObjectId), `amount`
 *   (principal being invested, a number), and `_id` (used as `generatorId`
 *   in each ReferralIncome record).
 *
 * @returns {Promise<Object>} Summary object: `credited` (number of ancestors
 *   successfully credited) and `stopped` (reason the chain walk ended —
 *   one of `max_levels`, `no_referrer`, `ancestor_not_found`, `suspended`).
 */
const distributeReferralIncome = async (investment) => {
  // ── 1. Fetch the investor document to access their referredBy field ──────────
  // We need referredBy to know who to credit at Level 1.
  let currentUser = await User.findById(investment.userId).select('referredBy');

  let credited = 0;
  let stopped  = 'max_levels'; // default: chain ran the full allowed depth

  // ── 2. Walk up the referral hierarchy, one level per iteration ───────────────
  for (let level = 1; level <= MAX_REFERRAL_LEVELS; level++) {

    // ── 2a. Guard: current node has no referrer — chain ends here ────────────
    if (!currentUser?.referredBy) {
      stopped = 'no_referrer';
      break;
    }

    // ── 2b. Fetch the ancestor at this level ─────────────────────────────────
    // select only the fields we need; avoids loading the full user document
    // in every iteration for potentially long chains.
    const ancestor = await User.findById(currentUser.referredBy)
      .select('_id referredBy accountStatus walletBalance totalLevelIncome');

    if (!ancestor) {
      // Referrer was deleted or the referredBy ObjectId is dangling — stop walking.
      stopped = 'ancestor_not_found';
      break;
    }

    // ── 2c. Skip suspended ancestors but continue walking up ─────────────────
    // A suspended account cannot receive income, but their referrer chain is
    // still valid — we do NOT break here, we continue to the next level.
    if (ancestor.accountStatus === 'suspended') {
      console.warn(
        `[Referral] Level ${level} ancestor ${ancestor._id} is suspended — skipping credit, chain continues`
      );
      // Move pointer up so the next iteration checks ancestor's referredBy
      currentUser = ancestor;
      continue;
    }

    // ── 2d. Compute income for this level ────────────────────────────────────
    // LEVEL_PERCENTAGES[level - 1] maps level 1→index 0, level 2→index 1, etc.
    // round2 prevents floating-point drift over time.
    const incomeAmount = round2(
      investment.amount * (LEVEL_PERCENTAGES[level - 1] / 100)
    );

    // ── 2e. Open a per-level transaction ─────────────────────────────────────
    // Each level has its own session so an error at level 3 does not undo
    // the already-committed credits at levels 1 and 2.
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Persist the income event for auditing and UI display.
      // Array form is required by Mongoose when a session option is provided.
      await ReferralIncome.create(
        [{
          receiverId:  ancestor._id,
          generatorId: investment.userId,  // the investor who triggered this income
          level,
          amount:      incomeAmount,
          date:        new Date(),
        }],
        { session }
      );

      // Atomically bump both the running wallet balance and the lifetime counter.
      await User.findByIdAndUpdate(
        ancestor._id,
        { $inc: { walletBalance: incomeAmount, totalLevelIncome: incomeAmount } },
        { session }
      );

      await session.commitTransaction();
      credited++;

      console.log(
        `[Referral] Level ${level} credited — ancestor: ${ancestor._id}, ` +
        `amount: ${incomeAmount}, investment: ${investment._id}`
      );

    } catch (err) {
      await session.abortTransaction();
      // Log and continue walking — a DB error on one level should not block
      // the remaining ancestors from receiving their commission.
      console.error(
        `[Referral] Level ${level} transaction failed for ancestor ${ancestor._id}:`,
        err.message
      );

    } finally {
      // Always release the session regardless of commit/abort outcome.
      session.endSession();
    }

    // ── 2f. Advance pointer one step up the chain ────────────────────────────
    // The next iteration will credit ancestor's referrer (Level level+1).
    currentUser = ancestor;
  }

  console.log(
    `[Referral] Distribution complete — investment: ${investment._id}, ` +
    `credited: ${credited}/${MAX_REFERRAL_LEVELS} levels, stopped: ${stopped}`
  );

  return { credited, stopped };
};

module.exports = { distributeReferralIncome };
