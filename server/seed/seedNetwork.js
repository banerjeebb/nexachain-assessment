/**
 * @file seedNetwork.js
 * @description One-off seed script that builds a realistic, fully-populated
 * downline referral network (up to 5 levels deep) under a given root user,
 * gives every user investments, and backfills daily ROI history + one-time
 * multi-level referral income — so dashboards, charts and the network tree
 * all render with real-looking data instead of empty states.
 *
 * Usage:
 *   cd server
 *   node seed/seedNetwork.js bishwayanofficial@gmail.com
 *
 * Safe to re-run: it skips creating the tree if the root user already has
 * downline referrals, and ROIHistory writes rely on the same unique
 * (investmentId, date) index the cron uses, so duplicates are skipped.
 */

require('dotenv').config();
const mongoose = require('mongoose');

const User           = require('../models/User.model');
const Investment     = require('../models/Investment.model');
const ROIHistory     = require('../models/ROIHistory.model');
const ReferralIncome = require('../models/ReferralIncome.model');
const { LEVEL_PERCENTAGES, MAX_REFERRAL_LEVELS } = require('../config/constants');

const round2 = (value) => Math.round((value + Number.EPSILON) * 100) / 100;
const utcMidnight = (d) => new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
const daysAgo = (n) => { const d = new Date(); d.setUTCDate(d.getUTCDate() - n); return d; };
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const FIRST_NAMES = ['Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Reyansh', 'Krishna',
  'Ishaan', 'Rohan', 'Ananya', 'Diya', 'Saanvi', 'Myra', 'Aadhya', 'Kiara', 'Riya', 'Anika',
  'Priya', 'Neha', 'Karan', 'Rahul', 'Amit', 'Sanya', 'Tara', 'Dev', 'Nisha', 'Varun'];
const LAST_NAMES = ['Sharma', 'Verma', 'Gupta', 'Mehta', 'Patel', 'Singh', 'Kumar', 'Das',
  'Reddy', 'Nair', 'Iyer', 'Joshi', 'Rao', 'Bose', 'Chatterjee', 'Bhatt', 'Malhotra', 'Kapoor'];

const PLANS = [
  { planName: 'Starter Plan',  amount: [5_000, 15_000],  dailyROIPercent: 0.5, planDurationDays: 30 },
  { planName: 'Growth Plan',   amount: [15_000, 40_000], dailyROIPercent: 0.8, planDurationDays: 60 },
  { planName: 'Premium Plan',  amount: [40_000, 100_000], dailyROIPercent: 1.2, planDurationDays: 90 },
];

// userId (string) -> accumulated $inc deltas, flushed to the DB at the end via bulkWrite.
// Crediting a counter (totalROIEarned / totalLevelIncome) always also credits walletBalance,
// mirroring the $inc pairs that roi.service.js / referral.service.js apply inside their transactions.
const walletDeltas = new Map();
const credit = (userId, counterField, amount) => {
  const key = userId.toString();
  const entry = walletDeltas.get(key) || { walletBalance: 0, totalROIEarned: 0, totalLevelIncome: 0 };
  entry.walletBalance += amount;
  entry[counterField] += amount;
  walletDeltas.set(key, entry);
};

let userSeq = 0;
const makeUser = async (referredBy) => {
  userSeq += 1;
  const fullName = `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`;
  const email = `seed.user${userSeq}.${Date.now()}@nexachain.test`;
  const user = await User.create({
    fullName,
    email,
    mobile: `9${randInt(100000000, 999999999)}`,
    password: 'Seed@12345',
    referredBy: referredBy ? referredBy._id : null,
    accountStatus: 'active',
  });
  return user;
};

/**
 * Recursively builds a downline tree under `parent`.
 * `branching[depth]` = number of direct children to create at that depth.
 * Returns the flat list of all created users.
 */
const buildTree = async (parent, branching, depth, all) => {
  if (depth >= branching.length) return;
  const childCount = branching[depth];
  for (let i = 0; i < childCount; i++) {
    const child = await makeUser(parent);
    all.push(child);
    await buildTree(child, branching, depth + 1, all);
  }
};

/**
 * Creates 1-2 investments for `user`, each backdated between 20-150 days ago,
 * and backfills:
 *   - one ReferralIncome record per ancestor (up to 5 levels, walking `referredBy`)
 *   - one ROIHistory record per elapsed day since the investment started
 * mirroring exactly what referral.service.js / roi.service.js would have produced
 * had these investments really been made on those historical dates.
 */
const seedInvestmentsFor = async (user) => {
  const investmentCount = randInt(1, 2);

  for (let i = 0; i < investmentCount; i++) {
    const plan = pick(PLANS);
    const amount = round2(randInt(plan.amount[0], plan.amount[1]));
    const startedDaysAgo = randInt(20, 150);
    const startDate = daysAgo(startedDaysAgo);
    const endDate = new Date(startDate);
    endDate.setUTCDate(endDate.getUTCDate() + plan.planDurationDays);

    const today = utcMidnight(new Date());
    const matured = endDate <= today;

    const investment = await Investment.create({
      userId: user._id,
      amount,
      planName: plan.planName,
      planDurationDays: plan.planDurationDays,
      dailyROIPercent: plan.dailyROIPercent,
      startDate,
      endDate,
      status: matured ? 'completed' : 'active',
    });

    // ── Backfill daily ROI history (Stream A) ──────────────────────────────
    const roiAmount = round2(amount * (plan.dailyROIPercent / 100));
    const lastCreditDay = matured ? endDate : today;
    const cursor = utcMidnight(startDate);
    cursor.setUTCDate(cursor.getUTCDate() + 1); // ROI accrues from the day AFTER investment starts

    const roiDocs = [];
    while (cursor <= lastCreditDay) {
      roiDocs.push({
        userId: user._id,
        investmentId: investment._id,
        amount: roiAmount,
        date: new Date(cursor),
        status: 'credited',
      });
      credit(user._id, 'totalROIEarned', roiAmount);
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }
    if (roiDocs.length) {
      await ROIHistory.insertMany(roiDocs, { ordered: false }).catch((err) => {
        if (err.code !== 11000) throw err; // duplicates (re-run) are fine, mirrors roi.service.js
      });
    }

    // ── Backfill one-time multi-level referral income (Stream B) ───────────
    let currentUser = user;
    for (let level = 1; level <= MAX_REFERRAL_LEVELS; level++) {
      if (!currentUser.referredBy) break;
      const ancestor = await User.findById(currentUser.referredBy).select('_id referredBy accountStatus');
      if (!ancestor) break;

      if (ancestor.accountStatus !== 'suspended') {
        const incomeAmount = round2(amount * (LEVEL_PERCENTAGES[level - 1] / 100));
        await ReferralIncome.create({
          receiverId: ancestor._id,
          generatorId: user._id,
          level,
          amount: incomeAmount,
          date: startDate,
        });
        credit(ancestor._id, 'totalLevelIncome', incomeAmount);
      }
      currentUser = ancestor;
    }
  }
};

const flushWalletDeltas = async () => {
  const ops = [...walletDeltas.entries()].map(([userId, delta]) => ({
    updateOne: {
      filter: { _id: new mongoose.Types.ObjectId(userId) },
      update: {
        $inc: {
          walletBalance: round2(delta.walletBalance),
          totalROIEarned: round2(delta.totalROIEarned),
          totalLevelIncome: round2(delta.totalLevelIncome),
        },
      },
    },
  }));
  if (ops.length) await User.bulkWrite(ops);
  return ops.length;
};

const run = async () => {
  const email = (process.argv[2] || '').toLowerCase().trim();
  if (!email) {
    console.error('Usage: node seed/seedNetwork.js <root-user-email>');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log(`[Seed] Connected to MongoDB`);

  const root = await User.findOne({ email });
  if (!root) {
    console.error(`[Seed] No user found with email "${email}". Register the account first, then re-run.`);
    process.exit(1);
  }
  console.log(`[Seed] Root user: ${root.fullName} <${root.email}> (referralCode: ${root.referralCode})`);

  // ── Walk the EXISTING downline (BFS) so we extend it rather than duplicate it ──
  const TARGET_DEPTH = 5; // levels below the root
  const FILL_BRANCHING = [3, 2, 2, 1, 1]; // branching to apply from a leaf, by remaining-depth

  const existing = []; // { user, depth }
  let frontier = [{ user: root, depth: 0 }];
  while (frontier.length) {
    const ids = frontier.map((f) => f.user._id);
    const children = await User.find({ referredBy: { $in: ids } });
    const next = [];
    for (const child of children) {
      const parentDepth = frontier.find((f) => f.user._id.equals(child.referredBy)).depth;
      const node = { user: child, depth: parentDepth + 1 };
      existing.push(node);
      next.push(node);
    }
    frontier = next;
  }

  const leaves = existing.filter((node) => node.depth < TARGET_DEPTH
    && !existing.some((other) => other.user.referredBy && other.user.referredBy.equals(node.user._id)));
  // root itself counts as a leaf if it has no downline at all
  if (existing.length === 0) leaves.push({ user: root, depth: 0 });

  console.log(`[Seed] Existing downline: ${existing.length} user(s). Extending ${leaves.length} leaf branch(es) down to ${TARGET_DEPTH} levels...`);

  const newDownline = [];
  for (const leaf of leaves) {
    const remaining = TARGET_DEPTH - leaf.depth;
    if (remaining <= 0) continue;
    const branching = FILL_BRANCHING.slice(0, remaining);
    await buildTree(leaf.user, branching, 0, newDownline);
  }
  console.log(`[Seed] Created ${newDownline.length} new downline user(s).`);

  if (newDownline.length) {
    console.log('[Seed] Seeding investments + backdated ROI history + referral income for the new downline...');
    for (const u of newDownline) {
      await seedInvestmentsFor(u);
    }
  }

  console.log('[Seed] Seeding investments for the root user...');
  await seedInvestmentsFor(root);

  console.log('[Seed] Flushing wallet/earning balances (atomic $inc)...');
  const updated = await flushWalletDeltas();
  console.log(`[Seed] Updated balances for ${updated} user(s).`);

  const refreshedRoot = await User.findById(root._id);
  const directReferrals = await User.countDocuments({ referredBy: root._id });
  const totalInvestments = await Investment.countDocuments({ userId: root._id });
  const roiCount = await ROIHistory.countDocuments({ userId: root._id });
  const incomeCount = await ReferralIncome.countDocuments({ receiverId: root._id });

  console.log('─'.repeat(60));
  console.log('[Seed] ✔ Done. Root user snapshot:');
  console.log(`        walletBalance     : ₹${refreshedRoot.walletBalance}`);
  console.log(`        totalROIEarned    : ₹${refreshedRoot.totalROIEarned}`);
  console.log(`        totalLevelIncome  : ₹${refreshedRoot.totalLevelIncome}`);
  console.log(`        direct referrals  : ${directReferrals}`);
  console.log(`        own investments   : ${totalInvestments}`);
  console.log(`        ROI history rows  : ${roiCount}`);
  console.log(`        referral incomes  : ${incomeCount}`);
  console.log('─'.repeat(60));

  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  console.error('[Seed] ✖ Fatal error:', err);
  process.exit(1);
});
