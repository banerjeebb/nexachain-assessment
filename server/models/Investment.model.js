/**
 * @file Investment.model.js
 * @description Mongoose model for a user's investment in a plan. Each
 * investment accrues daily ROI (handled by the ROI cron/service) until
 * `endDate`, at which point the cron marks it `completed`.
 */

const mongoose = require('mongoose');

/**
 * @typedef {Object} InvestmentDocument
 * @property {mongoose.Types.ObjectId} userId - Owning user's `_id`.
 * @property {number} amount - Principal amount invested.
 * @property {string} planName - Name of the investment plan chosen.
 * @property {number} planDurationDays - Plan length in days; used to compute `endDate` at creation.
 * @property {number} dailyROIPercent - Daily return rate (percentage of `amount`) credited by the ROI cron.
 * @property {Date} startDate - Date the investment began (defaults to creation time).
 * @property {Date} endDate - Date the investment matures; `startDate + planDurationDays`.
 * @property {'active'|'completed'|'cancelled'} status - Lifecycle state; the cron flips `active` → `completed` once `endDate <= today`.
 */
const InvestmentSchema = new mongoose.Schema({
  userId:           { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount:           { type: Number, required: true },
  planName:         { type: String, required: true },
  planDurationDays: { type: Number, required: true },
  dailyROIPercent:  { type: Number, required: true },
  startDate:        { type: Date, default: Date.now },
  endDate:          { type: Date, required: true },
  status:           { type: String, enum: ['active', 'completed', 'cancelled'], default: 'active' },
}, { timestamps: true });

InvestmentSchema.index({ userId: 1 });
InvestmentSchema.index({ status: 1 });
InvestmentSchema.index({ userId: 1, status: 1 });

module.exports = mongoose.model('Investment', InvestmentSchema);
