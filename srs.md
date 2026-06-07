# NexaChain AI — Software Requirements Specification
### Investment & Referral Platform · MERN Stack Technical Assessment
### Claude Code Context Document · v1.0 · June 2026

---



> **CLAUDE CODE OPERATING INSTRUCTIONS**
> This SRS is your complete specification. Do not add unlisted features. Do not skip listed features. Follow folder paths exactly. Every critical rule below is a hard constraint — not a suggestion.

---

## Critical Code Generation Rules

| Rule | Constraint |
|---|---|
| USE EXACT FIELD NAMES | Field names in schema definitions are binding — evaluators will diff against them |
| JWT ON ALL PRIVATE ROUTES | Every non-auth route must pass through `auth.middleware.js` |
| $graphLookup FOR REFERRAL TREE | Use MongoDB native aggregation — NOT recursive JavaScript loops |
| MONGOOSE TRANSACTIONS | Wallet balance updates (ROI + referral income) must use sessions/transactions |
| IDEMPOTENT CRON | Check ROIHistory for existing `(investmentId + date)` record before crediting. NEVER double-credit |
| RESPONSE ENVELOPE | All endpoints return: `{ success: Boolean, data: Any, message: String }` |
| INPUT VALIDATION | Use `express-validator` on all POST/PUT routes. Never trust raw `req.body` |
| NO HARDCODED SECRETS | All config via `process.env`. Never commit `.env` file |

---

## 1. Project Folder Structure

Generate this exact structure. File names are canonical — do not rename.

```
nexachain-assessment/
├── server/
│   ├── models/
│   │   ├── User.model.js
│   │   ├── Investment.model.js
│   │   ├── ReferralIncome.model.js
│   │   └── ROIHistory.model.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── investment.routes.js
│   │   ├── dashboard.routes.js
│   │   └── referral.routes.js
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── investment.controller.js
│   │   ├── dashboard.controller.js
│   │   └── referral.controller.js
│   ├── services/
│   │   ├── roi.service.js           ← Task 3: daily ROI logic
│   │   └── referral.service.js      ← Task 3: level income distribution
│   ├── middleware/
│   │   ├── auth.middleware.js        ← JWT verification
│   │   └── validate.middleware.js    ← express-validator runner
│   ├── jobs/
│   │   └── roiCron.job.js            ← Task 5: node-cron scheduler
│   ├── config/
│   │   ├── db.js                     ← Mongoose connect with retry
│   │   └── constants.js              ← LEVEL_PERCENTAGES, JWT config
│   └── app.js                        ← Express app init + middleware
├── client/                           ← Next.js 14 App Router project
│   ├── app/
│   │   ├── layout.tsx                ← Root layout: fonts, global CSS, providers
│   │   ├── page.tsx                  ← Redirects → /login
│   │   ├── login/
│   │   │   └── page.tsx              ← Login page (public)
│   │   ├── register/
│   │   │   └── page.tsx              ← Register page (public)
│   │   └── dashboard/
│   │       ├── layout.tsx            ← Auth guard + sidebar shell
│   │       └── page.tsx              ← Dashboard tabs: Overview · Investments · ROI · Referrals
│   ├── components/
│   │   ├── StatCard.tsx
│   │   ├── InvestmentTable.tsx
│   │   ├── ROIHistoryTable.tsx
│   │   ├── ReferralIncomeTable.tsx
│   │   ├── ReferralTree.tsx
│   │   ├── EarningsChart.tsx         ← Recharts AreaChart (client component)
│   │   └── SkeletonLoader.tsx
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useDashboard.ts
│   │   ├── useInvestments.ts
│   │   └── useReferrals.ts
│   ├── lib/
│   │   └── api.ts                    ← Axios instance + JWT interceptor
│   ├── public/
│   ├── next.config.js
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── .env.local                    ← NEXT_PUBLIC_API_BASE_URL
├── .env.example
├── README.md
└── ASSUMPTIONS.md
```

---

## 2. Database Schema Design (Task 1)

### 2.1 `server/models/User.model.js`

```js
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
const { nanoid } = require('nanoid');

const UserSchema = new mongoose.Schema({
  fullName:         { type: String, required: true, trim: true },
  email:            { type: String, required: true, unique: true, lowercase: true },
  mobile:           { type: String, required: true },
  password:         { type: String, required: true },         // bcrypt hashed
  referralCode:     { type: String, unique: true },           // nanoid(8) auto-gen
  referredBy:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  walletBalance:    { type: Number, default: 0 },
  totalROIEarned:   { type: Number, default: 0 },
  totalLevelIncome: { type: Number, default: 0 },
  accountStatus:    { type: String, enum: ['active','inactive','suspended'], default: 'active' },
}, { timestamps: true });

// Indexes
UserSchema.index({ email: 1 });
UserSchema.index({ referralCode: 1 });
UserSchema.index({ referredBy: 1 });

// Pre-save hooks
UserSchema.pre('save', async function (next) {
  if (this.isModified('password'))
    this.password = await bcrypt.hash(this.password, 12);
  if (!this.referralCode)
    this.referralCode = nanoid(8).toUpperCase();
  next();
});

UserSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

module.exports = mongoose.model('User', UserSchema);
```

### 2.2 `server/models/Investment.model.js`

```js
const InvestmentSchema = new mongoose.Schema({
  userId:           { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount:           { type: Number, required: true },
  planName:         { type: String, required: true },
  planDurationDays: { type: Number, required: true },
  dailyROIPercent:  { type: Number, required: true },   // e.g. 0.5 means 0.5%
  startDate:        { type: Date, default: Date.now },
  endDate:          { type: Date, required: true },     // startDate + planDurationDays
  status:           { type: String, enum: ['active','completed','cancelled'], default: 'active' },
}, { timestamps: true });

InvestmentSchema.index({ userId: 1 });
InvestmentSchema.index({ status: 1 });
InvestmentSchema.index({ userId: 1, status: 1 });

module.exports = mongoose.model('Investment', InvestmentSchema);
```

### 2.3 `server/models/ReferralIncome.model.js`

```js
const ReferralIncomeSchema = new mongoose.Schema({
  receiverId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  generatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  level:       { type: Number, required: true },   // 1 = direct, 2 = grandparent, etc.
  amount:      { type: Number, required: true },
  date:        { type: Date, default: Date.now },
}, { timestamps: true });

ReferralIncomeSchema.index({ receiverId: 1 });
ReferralIncomeSchema.index({ receiverId: 1, date: -1 });

module.exports = mongoose.model('ReferralIncome', ReferralIncomeSchema);
```

### 2.4 `server/models/ROIHistory.model.js`

```js
const ROIHistorySchema = new mongoose.Schema({
  userId:       { type: mongoose.Schema.Types.ObjectId, ref: 'User',       required: true },
  investmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Investment', required: true },
  amount:       { type: Number, required: true },
  date:         { type: Date,   required: true },   // midnight UTC — used as dedup key
  status:       { type: String, enum: ['credited','pending','failed'], default: 'credited' },
}, { timestamps: true });

// CRITICAL: prevents double-crediting if cron fires twice
ROIHistorySchema.index({ investmentId: 1, date: 1 }, { unique: true });
ROIHistorySchema.index({ userId: 1, date: -1 });

module.exports = mongoose.model('ROIHistory', ROIHistorySchema);
```

---

## 3. API Specification (Task 2)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | — | Register. Accepts optional `referralCode` of referrer |
| POST | `/api/auth/login` | — | Login. Returns JWT token |
| GET | `/api/auth/me` | JWT | Current user profile |
| POST | `/api/investments` | JWT | Create investment. Triggers referral income distribution |
| GET | `/api/investments` | JWT | All investments for logged-in user |
| GET | `/api/dashboard` | JWT | Aggregated: totalInvestments, totalROI, levelIncome, walletBalance |
| GET | `/api/referrals/direct` | JWT | Level-1 referrals of current user |
| GET | `/api/referrals/tree` | JWT | Full tree via `$graphLookup` (max 5 levels) |
| GET | `/api/referrals/income` | JWT | Referral income history |
| GET | `/api/roi/history` | JWT | ROI history for current user |

### 3.1 Request / Response Contracts

**POST `/api/auth/register`**
```json
// Request Body
{
  "fullName":     "Bishwayan Banerjee",
  "email":        "user@example.com",
  "mobile":       "9876543210",
  "password":     "SecurePass123",
  "referralCode": "ABC12345"
}

// Response 201
{
  "success": true,
  "data": {
    "token": "<jwt>",
    "user": { "_id", "fullName", "email", "referralCode", "walletBalance" }
  },
  "message": "Registration successful"
}
```

**POST `/api/investments`**
```json
// Request Body
{
  "amount": 10000,
  "planName": "Gold Plan",
  "planDurationDays": 30,
  "dailyROIPercent": 0.5
}
// Response 201 — Investment document + triggers referralService.distributeReferralIncome()
```

**GET `/api/dashboard`**
```json
// Response 200
{
  "success": true,
  "data": {
    "totalInvestments": 25000,
    "totalROIEarned":   1250.50,
    "totalLevelIncome": 350.00,
    "walletBalance":    1600.50
  }
}
```

**GET `/api/referrals/tree` — CRITICAL IMPLEMENTATION**
```js
// Use $graphLookup — NOT recursive JS
db.users.aggregate([
  { $match: { _id: currentUserId } },
  {
    $graphLookup: {
      from: "users",
      startWith: "$_id",
      connectFromField: "_id",
      connectToField: "referredBy",
      as: "tree",
      maxDepth: 4,          // 0-indexed → 5 levels
      depthField: "depth"
    }
  }
])
// Controller reconstructs nested tree from flat $graphLookup result in-memory
```

---

## 4. Business Logic Services (Task 3)

### 4.1 `server/config/constants.js`

```js
module.exports = {
  LEVEL_PERCENTAGES:    [5, 3, 2, 1, 0.5],  // index 0 = Level 1 (direct referrer)
  MAX_REFERRAL_LEVELS:  5,
  JWT_EXPIRES_IN:       '7d',
  BCRYPT_ROUNDS:        12,
};
```

### 4.2 `server/services/roi.service.js` — `processROI()`

```js
/**
 * processROI()
 * Called by cron. MUST be idempotent.
 *
 * Algorithm:
 *  1. Fetch investments: { status: 'active', endDate: { $gte: today } }
 *  2. For each investment:
 *     a. todayMidnight = new Date with hours/min/sec set to 0 (UTC)
 *     b. existing = await ROIHistory.findOne({ investmentId, date: todayMidnight })
 *        → if (existing) { skippedCount++; continue; }   ← IDEMPOTENCY CHECK
 *     c. roiAmount = investment.amount * (investment.dailyROIPercent / 100)
 *     d. Open Mongoose session + transaction:
 *        - ROIHistory.create([{ userId, investmentId, amount: roiAmount, date: todayMidnight }], { session })
 *        - User.findByIdAndUpdate(userId, { $inc: { walletBalance: roiAmount, totalROIEarned: roiAmount } }, { session })
 *        - session.commitTransaction()
 *     e. if (investment.endDate <= today) → set status = 'completed'
 *  3. console.log(`ROI done: processed=${n}, skipped=${s}, errors=${e}`)
 */
```

### 4.3 `server/services/referral.service.js` — `distributeReferralIncome()`

```js
/**
 * distributeReferralIncome(investment)
 * Called immediately after a new investment is created.
 *
 * Algorithm:
 *  1. currentUser = investment.userId
 *  2. For level i = 1 to MAX_REFERRAL_LEVELS:
 *     a. ancestor = await User.findById(currentUser.referredBy)
 *        → if (!ancestor) break;         ← chain ends
 *     b. incomeAmount = investment.amount * (LEVEL_PERCENTAGES[i-1] / 100)
 *     c. Open transaction:
 *        - ReferralIncome.create({ receiverId: ancestor._id, generatorId: investment.userId, level: i, amount: incomeAmount })
 *        - User.findByIdAndUpdate(ancestor._id, { $inc: { walletBalance: incomeAmount, totalLevelIncome: incomeAmount } })
 *        - session.commitTransaction()
 *     d. currentUser = ancestor          ← move up one level
 *
 * Example for ₹10,000 investment:
 *   Level 1 ancestor → +₹500  (5%)
 *   Level 2 ancestor → +₹300  (3%)
 *   Level 3 ancestor → +₹200  (2%)
 *   Level 4 ancestor → +₹100  (1%)
 *   Level 5 ancestor → +₹50   (0.5%)
 */
```

---

## 5. Cron Job Scheduler (Task 5)

### `server/jobs/roiCron.job.js`

```js
const cron           = require('node-cron');
const { processROI } = require('../services/roi.service');

let isRunning = false;  // in-process lock — prevents concurrent execution

/**
 * Idempotency layers:
 *   Layer 1 — isRunning flag: prevents overlap if previous run is still executing
 *   Layer 2 — ROIHistory unique index (investmentId + date):
 *              DB-level guard; duplicate insert throws E11000 → caught and skipped
 */
cron.schedule('0 0 * * *', async () => {
  if (isRunning) {
    console.warn('[ROI CRON] Already running — skipping duplicate trigger');
    return;
  }
  isRunning = true;
  try {
    console.log('[ROI CRON] Starting:', new Date().toISOString());
    await processROI();
    console.log('[ROI CRON] Completed successfully');
  } catch (err) {
    console.error('[ROI CRON] Fatal error:', err.message);
  } finally {
    isRunning = false;
  }
}, { timezone: 'Asia/Kolkata' });

console.log('[ROI CRON] Registered — fires daily 00:00 IST');
```

---

## 6. Next.js Dashboard Spec (Task 4)

### 6.1 Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Charts | Recharts — AreaChart for earnings over time |
| HTTP Client | Axios with JWT bearer token interceptor |
| Routing | Next.js App Router — file-system based (`app/` directory) |
| State | Custom hooks only — no logic inside components |
| Client boundary | `'use client'` directive on all interactive components and hooks |

### 6.2 Design Tokens

```js
// Dark fintech aesthetic
bg:          '#0F172A'   // page background
surface:     '#1E293B'   // cards, panels
border:      '#334155'
accent:      '#10B981'   // emerald green — positive numbers, CTA
accentBlue:  '#3B82F6'   // chart line, links
textPrimary: '#F1F5F9'
textMuted:   '#94A3B8'
warning:     '#F59E0B'   // pending badge
danger:      '#EF4444'   // cancelled / negative
```

### 6.3 Page & Route Structure (App Router)

| Route file | Access | Behaviour |
|---|---|---|
| `app/page.tsx` | Public | Immediately redirects to `/login` via `next/navigation` `redirect()` |
| `app/login/page.tsx` | Public | Email + password form. On success: store JWT in `localStorage`, call `router.push('/dashboard')` |
| `app/register/page.tsx` | Public | fullName, email, mobile, password, optional referralCode. On success: store JWT, redirect `/dashboard` |
| `app/dashboard/layout.tsx` | Auth-guarded | Reads JWT from `localStorage` on mount. If missing/expired → `router.replace('/login')`. Renders sidebar shell wrapping `{children}` |
| `app/dashboard/page.tsx` | Auth-guarded | Tab switcher: Overview · Investments · ROI · Referrals. Each tab renders the relevant component |

### 6.4 Component Specifications

| Component | Directive | Specification |
|---|---|---|
| `components/StatCard.tsx` | `'use client'` | Props: `label, value, icon, delta`. 4 instances: Total Invested, Daily ROI, Level Income, Wallet |
| `components/EarningsChart.tsx` | `'use client'` | Recharts AreaChart. X=date, Y=amount. Two areas: ROI earned vs Level income. Must be `'use client'` — Recharts uses browser APIs |
| `components/InvestmentTable.tsx` | `'use client'` | Cols: Plan · Amount · Daily ROI% · Start Date · End Date · Status badge |
| `components/ROIHistoryTable.tsx` | `'use client'` | Cols: Date · Investment · ROI Amount · Status. Paginated |
| `components/ReferralIncomeTable.tsx` | `'use client'` | Cols: Date · From User · Level · Amount |
| `components/ReferralTree.tsx` | `'use client'` | Nested accordion. Each node: fullName + referralCode. Expandable children |
| `components/SkeletonLoader.tsx` | `'use client'` | Animated pulse placeholder shown during all data fetching states |
| `lib/api.ts` | — | Axios instance. baseURL from `NEXT_PUBLIC_API_BASE_URL` env var. Request interceptor reads JWT from `localStorage` and adds `Authorization: Bearer` |

### 6.5 Custom Hooks (all `'use client'`)

| Hook | Location | Responsibility |
|---|---|---|
| `useAuth` | `hooks/useAuth.ts` | login(), register(), logout(), reads/writes JWT in localStorage |
| `useDashboard` | `hooks/useDashboard.ts` | Fetches `GET /api/dashboard` aggregated stats |
| `useInvestments` | `hooks/useInvestments.ts` | Fetches investments list + ROI history; exposes createInvestment() |
| `useReferrals` | `hooks/useReferrals.ts` | Fetches direct referrals, tree, and income history |

### 6.6 Auth Guard Pattern

```tsx
// app/dashboard/layout.tsx
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) router.replace('/login');
  }, [router]);
  return <>{children}</>;
}
```

### 6.7 Axios Instance

```ts
// lib/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
```

---

## 7. Environment & Security

### 7.1 Environment Files

**`server/.env`** (never committed — copied from `.env.example`)
```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/nexachain?retryWrites=true&w=majority

# JWT
JWT_SECRET=replace_with_long_random_string_min_32_chars
JWT_EXPIRES_IN=7d

# CORS — must match Next.js dev server port
CLIENT_URL=http://localhost:3000
```

**`client/.env.local`** (Next.js convention — never committed)
```env
# Must be prefixed NEXT_PUBLIC_ to be available in the browser bundle
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
```

**`.env.example`** (committed — safe template)
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/nexachain
JWT_SECRET=replace_with_long_random_string_min_32_chars
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:3000
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
```

### 7.2 Security Middleware Stack (`app.js`)

```js
const helmet    = require('helmet');
const rateLimit = require('express-rate-limit');
const cors      = require('cors');
const morgan    = require('morgan');

app.use(helmet());
app.use(morgan('dev'));
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000' }));
app.use(express.json({ limit: '10kb' }));

// Strict rate limit on auth routes
app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, max: 20 }));

// General API rate limit
app.use('/api', rateLimit({ windowMs: 15 * 60 * 1000, max: 200 }));
```

### 7.3 `server/middleware/auth.middleware.js`

```js
const jwt  = require('jsonwebtoken');
const User = require('../models/User.model');

module.exports = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token)
    return res.status(401).json({ success: false, message: 'No token provided' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user)
      return res.status(401).json({ success: false, message: 'User not found' });
    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};
```

---

## 8. README.md Content

```md
# NexaChain AI — Investment & Referral Platform

## Tech Stack
| Layer    | Technology                                        |
|----------|---------------------------------------------------|
| Backend  | Node.js 20, Express.js 4                          |
| Database | MongoDB Atlas + Mongoose 8                        |
| Auth     | JWT (jsonwebtoken + bcryptjs)                     |
| Frontend | Next.js 14 (App Router) + TypeScript + Tailwind CSS 3 |
| Charts   | Recharts 2                                        |
| Cron     | node-cron 3                                       |
| Security | helmet, express-rate-limit, cors                  |

## Setup
  git clone <repo-url> && cd nexachain-assessment

  # Backend
  cd server
  cp ../.env.example .env      # then fill in MONGODB_URI and JWT_SECRET
  npm install
  npm run dev                  # http://localhost:5000

  # Frontend
  cd ../client
  echo "NEXT_PUBLIC_API_BASE_URL=http://localhost:5000" > .env.local
  npm install
  npm run dev                  # http://localhost:3000

## Environment Variables — see .env.example and client/.env.local
## API Documentation — see Section 3 of SRS or Postman collection
## Assumptions — see ASSUMPTIONS.md
```

---

## 9. ASSUMPTIONS.md Content

```md
1. REFERRAL LEVELS: Income distributes up to 5 levels.
   Percentages: L1=5%, L2=3%, L3=2%, L4=1%, L5=0.5% of investment amount.

2. REFERRAL INCOME TRIGGER: Level income is distributed once at investment creation,
   not on each daily ROI cycle. Deliberate design decision.

3. ROI IDEMPOTENCY: Compound unique index ROIHistory(investmentId + date) is the
   database-level guard. isRunning flag prevents concurrent execution.

4. INVESTMENT COMPLETION: Cron auto-sets status='completed' when endDate <= today.

5. WALLET BALANCE: Single denormalised field on User, updated via Mongoose transactions
   to ensure consistency between balance and history records.

6. REFERRAL TREE: $graphLookup returns a flat array. Controller reconstructs the
   nested structure in-memory before responding.

7. AUTH: JWT stored in localStorage. No refresh token flow (out of scope).
   Token expiry: 7 days.

8. NEXT.JS CLIENT: App Router is used (app/ directory). All data-fetching hooks
   and interactive components carry the 'use client' directive. There are no
   Next.js Server Components that call the Express API — all API calls go through
   Axios in client components, consistent with the JWT-in-localStorage pattern.

9. ROUTING: Next.js file-system routing replaces React Router v6.
   Public routes: /login, /register.
   Protected routes: /dashboard — guarded by a useEffect check in dashboard/layout.tsx.

10. ENV VARS: Server env vars are unprefixed (PORT, MONGODB_URI, JWT_SECRET).
    Client env vars must be prefixed NEXT_PUBLIC_ to be embedded in the browser
    bundle by the Next.js compiler (e.g. NEXT_PUBLIC_API_BASE_URL).
```

---

*END OF SRS — Feed this file to Claude Code as complete project context.*