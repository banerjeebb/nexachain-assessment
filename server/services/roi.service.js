/**
 * @file roi.service.js
 * @description Daily ROI crediting service.
 *
 * Called by roiCron.job.js every day at 00:00 IST.
 * Processes all active investments, calculates each one's daily ROI,
 * persists a ROIHistory record, and updates the investor's wallet —
 * all inside a Mongoose transaction so the two writes are atomic.
 *
 * Idempotency is enforced at two layers:
 *   1. Application layer  — findOne({ investmentId, date }) check before entering the transaction.
 *   2. Database layer     — unique compound index on ROIHistory(investmentId + date);
 *                          an E11000 duplicate-key error on concurrent cron overlap is caught
 *                          and treated as a skip, never an error.
 */

const mongoose   = require('mongoose');
const Investment = require('../models/Investment.model');
const ROIHistory = require('../models/ROIHistory.model');
const User       = require('../models/User.model');

/**
 * Rounds a number to 2 decimal places using "round half away from zero".
 * Avoids floating-point drift accumulating in wallet balances over many cycles.
 *
 * @param {number} value
 * @returns {number}
 */
const round2 = (value) => Math.round((value + Number.EPSILON) * 100) / 100;

/**
 * processROI()
 *
 * Iterates every active investment whose endDate has not yet passed,
 * credits the calculated daily ROI to the investor's wallet, and marks
 * investments as 'completed' on their final day.
 *
 * @returns {Promise<{ processed: number, skipped: number, errors: number }>}
 *   A summary object — useful for logging or unit-test assertions.
 */
const processROI = async () => {
  // ── 1. Compute today's midnight in UTC ──────────────────────────────────────
  // All ROIHistory records use midnight UTC as their `date` field so the
  // unique index (investmentId + date) reliably deduplicates within a calendar day.
  const now = new Date();
  const todayMidnight = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  );

  // ── 2. Fetch all investments that are still active and not yet expired ──────
  // endDate: { $gte: todayMidnight } includes the final day so the last ROI
  // credit is applied before the status flips to 'completed'.
  const activeInvestments = await Investment.find({
    status:  'active',
    endDate: { $gte: todayMidnight },
  });

  let processed = 0;
  let skipped   = 0;
  let errors    = 0;

  // ── 3. Process each investment independently ─────────────────────────────────
  // We use a per-investment session rather than one giant session so that a
  // single bad investment does not roll back credits for all others.
  for (const investment of activeInvestments) {

    // ── 3a. Application-level idempotency check ──────────────────────────────
    // If a ROIHistory record already exists for this (investmentId, date) pair
    // the cron is firing a second time for the same day — skip silently.
    const alreadyCredited = await ROIHistory.findOne({
      investmentId: investment._id,
      date:         todayMidnight,
    });

    if (alreadyCredited) {
      skipped++;
      continue;
    }

    // ── 3b. Calculate ROI amount ─────────────────────────────────────────────
    // dailyROIPercent is stored as a raw percentage value (e.g. 0.5 means 0.5%).
    const roiAmount = round2(investment.amount * (investment.dailyROIPercent / 100));

    // ── 3c. Open a Mongoose session and start a transaction ──────────────────
    // Both the ROIHistory insert and the User wallet increment must succeed
    // together or not at all; a partial credit would corrupt balances.
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Insert the ROIHistory record.
      // Array form is required by Mongoose when passing a session option.
      await ROIHistory.create(
        [{
          userId:       investment.userId,
          investmentId: investment._id,
          amount:       roiAmount,
          date:         todayMidnight,
          status:       'credited',
        }],
        { session }
      );

      // Atomically increment both wallet balance and lifetime ROI counter.
      await User.findByIdAndUpdate(
        investment.userId,
        { $inc: { walletBalance: roiAmount, totalROIEarned: roiAmount } },
        { session }
      );

      // ── 3d. Auto-complete investments on their final day ─────────────────
      // If today is at or past the endDate the plan has run its full duration.
      // We do this inside the same transaction so the status flip and the last
      // ROI credit are committed atomically.
      if (investment.endDate <= todayMidnight) {
        await Investment.findByIdAndUpdate(
          investment._id,
          { status: 'completed' },
          { session }
        );
      }

      await session.commitTransaction();
      processed++;

    } catch (err) {
      await session.abortTransaction();

      // ── 3e. DB-level idempotency guard ────────────────────────────────────
      // E11000 means the unique index on (investmentId + date) rejected a
      // duplicate insert — treat as a benign skip, not an error.
      if (err.code === 11000) {
        skipped++;
      } else {
        errors++;
        console.error(`[ROI] Transaction failed for investment ${investment._id}:`, err.message);
      }

    } finally {
      // Always end the session whether the transaction committed or aborted.
      session.endSession();
    }
  }

  // ── 4. Emit a summary log line for monitoring / alerting ────────────────────
  console.log(
    `[ROI] Cycle complete — processed: ${processed}, skipped: ${skipped}, errors: ${errors}`
  );

  return { processed, skipped, errors };
};

module.exports = { processROI };
