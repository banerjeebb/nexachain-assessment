/**
 * @file ROIHistory.model.js
 * @description Mongoose model recording each daily ROI credit for an
 * investment. Acts as both an audit trail (for the dashboard / history API)
 * and the database-level idempotency guard for the ROI cron job — see the
 * unique compound index below.
 */

const mongoose = require('mongoose');

/**
 * @typedef {Object} ROIHistoryDocument
 * @property {mongoose.Types.ObjectId} userId - `_id` of the investment owner (denormalised for fast per-user queries).
 * @property {mongoose.Types.ObjectId} investmentId - `_id` of the investment this credit belongs to.
 * @property {number} amount - ROI amount credited for this cycle (`investment.amount * dailyROIPercent / 100`).
 * @property {Date} date - Midnight-UTC date this credit applies to; combined with `investmentId` it must be unique.
 * @property {'credited'|'pending'|'failed'} status - Outcome of the credit attempt.
 */
const ROIHistorySchema = new mongoose.Schema({
  userId:       { type: mongoose.Schema.Types.ObjectId, ref: 'User',       required: true },
  investmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Investment', required: true },
  amount:       { type: Number, required: true },
  date:         { type: Date,   required: true },
  status:       { type: String, enum: ['credited', 'pending', 'failed'], default: 'credited' },
}, { timestamps: true });

/**
 * CRITICAL: compound unique index on (investmentId, date).
 * This is the last line of defence against double-crediting — even if the
 * cron's in-process lock and pre-check both fail (e.g. two server instances
 * running the job), MongoDB rejects the second insert with E11000, which
 * roi.service.js catches and counts as a skip. See roiCron.job.js for the
 * full idempotency-layer breakdown.
 */
ROIHistorySchema.index({ investmentId: 1, date: 1 }, { unique: true });
ROIHistorySchema.index({ userId: 1, date: -1 });

module.exports = mongoose.model('ROIHistory', ROIHistorySchema);
