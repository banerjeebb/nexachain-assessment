/**
 * @file User.model.js
 * @description Mongoose model for platform users. Tracks identity/auth fields,
 * the referral relationship (`referredBy` + auto-generated `referralCode`),
 * and denormalised lifetime earning/balance totals that are kept in sync by
 * the ROI cron job and referral distribution service.
 */

const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
const { nanoid } = require('nanoid');

/**
 * @typedef {Object} UserDocument
 * @property {string} fullName - User's display name.
 * @property {string} email - Unique, lowercased login identifier.
 * @property {string} mobile - Contact number.
 * @property {string} password - Bcrypt-hashed password (never returned to clients in plaintext).
 * @property {string} referralCode - Unique 8-character code others use to refer this user; auto-generated if absent.
 * @property {?mongoose.Types.ObjectId} referredBy - `_id` of the user who referred this account, or `null`.
 * @property {number} walletBalance - Current spendable balance, denormalised for fast reads; kept consistent via transactions.
 * @property {number} totalROIEarned - Lifetime sum of ROI credited to this user.
 * @property {number} totalLevelIncome - Lifetime sum of multi-level referral income credited to this user.
 * @property {'active'|'inactive'|'suspended'} accountStatus - Gate for login; only `active` accounts may authenticate.
 */
const UserSchema = new mongoose.Schema({
  fullName:         { type: String, required: true, trim: true },
  email:            { type: String, required: true, unique: true, lowercase: true },
  mobile:           { type: String, required: true },
  password:         { type: String, required: true },
  referralCode:     { type: String, unique: true },
  referredBy:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  walletBalance:    { type: Number, default: 0 },
  totalROIEarned:   { type: Number, default: 0 },
  totalLevelIncome: { type: Number, default: 0 },
  accountStatus:    { type: String, enum: ['active', 'inactive', 'suspended'], default: 'active' },
}, { timestamps: true });

UserSchema.index({ referredBy: 1 });

/**
 * Pre-save hook that:
 *  1. Hashes `password` with bcrypt (cost factor 12) whenever it changes —
 *     covers both initial creation and future password-reset flows.
 *  2. Generates a unique 8-character uppercase `referralCode` for new users
 *     that don't already have one.
 */
UserSchema.pre('save', async function () {
  if (this.isModified('password'))
    this.password = await bcrypt.hash(this.password, 12);
  if (!this.referralCode)
    this.referralCode = nanoid(8).toUpperCase();
});

/**
 * Compares a plaintext password against this user's stored bcrypt hash.
 *
 * @param {string} plain - Plaintext password supplied at login.
 * @returns {Promise<boolean>} `true` if the password matches.
 */
UserSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

module.exports = mongoose.model('User', UserSchema);
