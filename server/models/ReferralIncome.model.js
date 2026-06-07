/**
 * @file ReferralIncome.model.js
 * @description Mongoose model recording a single multi-level referral income
 * payout — i.e. the commission an upline `receiver` earns when a downline
 * `generator` makes an investment. One record is written per level (up to 5)
 * at investment-creation time; see referral.service.js for the distribution logic.
 */

const mongoose = require('mongoose');

/**
 * @typedef {Object} ReferralIncomeDocument
 * @property {mongoose.Types.ObjectId} receiverId - `_id` of the upline user credited with this income.
 * @property {mongoose.Types.ObjectId} generatorId - `_id` of the downline user whose investment generated this income.
 * @property {number} level - Referral depth between generator and receiver (1 = direct referral, up to 5).
 * @property {number} amount - Income amount credited, computed as a percentage of the generator's investment (L1=5%, L2=3%, L3=2%, L4=1%, L5=0.5%).
 * @property {Date} date - Timestamp the income was generated/credited (defaults to creation time).
 */
const ReferralIncomeSchema = new mongoose.Schema({
  receiverId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  generatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  level:       { type: Number, required: true },
  amount:      { type: Number, required: true },
  date:        { type: Date, default: Date.now },
}, { timestamps: true });

ReferralIncomeSchema.index({ receiverId: 1 });
ReferralIncomeSchema.index({ receiverId: 1, date: -1 });

module.exports = mongoose.model('ReferralIncome', ReferralIncomeSchema);
