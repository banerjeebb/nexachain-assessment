# NexaChain AI

A MERN-stack investment & referral platform — Express/MongoDB API with a Next.js (App Router) client. Users invest, earn daily ROI via a cron job, and earn multi-level referral income.

## Tech Stack

- **Server:** Node.js, Express 5, MongoDB (Mongoose), JWT auth, node-cron
- **Client:** Next.js 16 (App Router), React 19, Tailwind CSS, Axios, Recharts

## Project Structure

```
nexachain-assessment/
├── server/      # Express API
├── client/      # Next.js frontend
├── API_DOCS.md  # Full API reference
└── srs.md       # Software requirements spec
```

## Project Setup

### Prerequisites

- Node.js (v18+)
- A MongoDB instance (local or Atlas)

### 1. Server

```bash
cd server
npm install
cp .env.example .env   # then fill in the values (see Environment Variables below)
npm run dev            # starts on http://localhost:5000 (nodemon)
```

### 2. Client

```bash
cd client
npm install
cp .env.example .env.local   # then fill in the values
npm run dev                  # starts on http://localhost:3000
```

Make sure the server is running before using the client — all data fetching happens client-side via Axios against the Express API.

## Environment Variables

> The full list of required environment variables for both the server and the
> client  is documented in the
> Notion link — refer there for the up-to-date values.

## Generated Code Documentation

All controllers, models, services, and the ROI cron job carry JSDoc comments. Browsable HTML reference docs can be generated from them:

```bash
cd server
npm run docs           # generates ./server/docs (open docs/index.html in a browser)
```

## API Documentation

Full endpoint reference (request/response shapes, validation rules, error codes, rate limits) lives in [API_DOCS.md](./API_DOCS.md).

Quick summary:

| Resource | Endpoints |
|---|---|
| Auth | `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me` |
| Investments | `POST /api/investments`, `GET /api/investments` |
| ROI History | `GET /api/roi/history` |
| Dashboard | `GET /api/dashboard` |
| Referrals | `GET /api/referrals/direct`, `GET /api/referrals/tree`, `GET /api/referrals/income` |

All protected routes require `Authorization: Bearer <token>`. Tokens are issued on register/login.

## Assumptions Made During Development

1. **Referral levels:** Income distributes up to 5 levels — L1=5%, L2=3%, L3=2%, L4=1%, L5=0.5% of the investment amount.
2. **Referral income trigger:** Level income is paid out once at investment creation, not on every daily ROI cycle (deliberate design decision, not a bug).
3. **ROI idempotency:** A compound unique index on `ROIHistory(investmentId + date)` is the database-level guard against duplicate payouts; an `isRunning` flag on the cron job prevents concurrent execution.
4. **Investment completion:** The cron job auto-marks an investment `completed` once `endDate <= today`.
5. **Wallet balance:** Stored as a single denormalised field on `User`, kept consistent with transaction/history records via Mongoose sessions/transactions.
6. **Referral tree:** Built with `$graphLookup`, which returns a flat array; the controller reconstructs the nested tree structure in-memory before responding.
7. **Auth:** JWT is stored in `localStorage` on the client; there is no refresh-token flow (considered out of scope for this assessment). Tokens expire after 7 days.
8. **Next.js client:** Uses the App Router (`app/` directory). All data-fetching and interactive components are Client Components (`'use client'`) — there are no Server Components calling the Express API, keeping the JWT-in-localStorage pattern consistent throughout.
9. **Routing:** Next.js file-system routing replaces React Router. Public routes: `/login`, `/register`. Protected routes (e.g. `/dashboard`) are guarded by a client-side auth check.
10. **Env var naming:** Server env vars are unprefixed (`PORT`, `MONGODB_URI`, `JWT_SECRET`, ...); client env vars exposed to the browser must be prefixed `NEXT_PUBLIC_`.
