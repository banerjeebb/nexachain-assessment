# NexaChain AI — API Documentation

> **Base URL (development):** `http://localhost:5000`
> **Base URL (production):** set via environment
>
> All endpoints return a consistent JSON envelope:
> ```json
> { "success": true | false, "data": <any>, "message": "<string>" }
> ```
> On validation errors, `data` is an array of field-level error objects.

---

## Table of Contents

1. [Authentication](#1-authentication)
   - [POST /api/auth/register](#11-register)
   - [POST /api/auth/login](#12-login)
   - [GET /api/auth/me](#13-get-current-user)
2. [Investments](#2-investments)
   - [POST /api/investments](#21-create-investment)
   - [GET /api/investments](#22-list-investments)
3. [ROI History](#3-roi-history)
   - [GET /api/roi/history](#31-get-roi-history)
4. [Dashboard](#4-dashboard)
   - [GET /api/dashboard](#41-get-dashboard-stats)
5. [Referrals](#5-referrals)
   - [GET /api/referrals/direct](#51-get-direct-referrals)
   - [GET /api/referrals/tree](#52-get-referral-tree)
   - [GET /api/referrals/income](#53-get-referral-income-history)
6. [Error Reference](#6-error-reference)
7. [Rate Limits](#7-rate-limits)

---

## Authentication

All protected endpoints require a JWT bearer token in the `Authorization` header:

```
Authorization: Bearer <token>
```

Tokens are issued on register/login and expire in **7 days**.

---

## 1. Authentication

### 1.1 Register

```
POST /api/auth/register
```

Creates a new user account. Optionally links to a referrer via their `referralCode`. A unique 8-character referral code is auto-generated for the new user.

**Auth required:** No

**Rate limit:** 20 requests / 15 minutes

#### Request Body

| Field | Type | Required | Constraints |
|---|---|---|---|
| `fullName` | string | ✔ | Non-empty, trimmed |
| `email` | string | ✔ | Valid email format, unique |
| `mobile` | string | ✔ | Valid mobile number |
| `password` | string | ✔ | Minimum 8 characters |
| `referralCode` | string | ✗ | Exactly 8 chars — must match an existing user's code |

```json
{
  "fullName":     "Bishwayan Banerjee",
  "email":        "bishwayan@example.com",
  "mobile":       "9876543210",
  "password":     "SecurePass123",
  "referralCode": "ABC12345"
}
```

#### Response `201 Created`

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "_id":           "64a1f2b3c4d5e6f7a8b9c0d1",
      "fullName":      "Bishwayan Banerjee",
      "email":         "bishwayan@example.com",
      "referralCode":  "XK9PLMQ2",
      "walletBalance": 0
    }
  },
  "message": "Registration successful"
}
```

#### Error Responses

| Status | Condition |
|---|---|
| `409 Conflict` | Email already registered |
| `400 Bad Request` | `referralCode` provided but does not match any user |
| `422 Unprocessable Entity` | Validation failed — `data` contains field errors |

---

### 1.2 Login

```
POST /api/auth/login
```

Authenticates a user and returns a JWT.

**Auth required:** No

**Rate limit:** 20 requests / 15 minutes

#### Request Body

| Field | Type | Required |
|---|---|---|
| `email` | string | ✔ |
| `password` | string | ✔ |

```json
{
  "email":    "bishwayan@example.com",
  "password": "SecurePass123"
}
```

#### Response `200 OK`

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "_id":           "64a1f2b3c4d5e6f7a8b9c0d1",
      "fullName":      "Bishwayan Banerjee",
      "email":         "bishwayan@example.com",
      "referralCode":  "XK9PLMQ2",
      "walletBalance": 1600.50
    }
  },
  "message": "Login successful"
}
```

#### Error Responses

| Status | Condition |
|---|---|
| `401 Unauthorized` | Email not found or password incorrect |
| `403 Forbidden` | Account status is `inactive` or `suspended` |
| `422 Unprocessable Entity` | Validation failed |

---

### 1.3 Get Current User

```
GET /api/auth/me
```

Returns the full profile of the authenticated user (password excluded).

**Auth required:** Yes

#### Response `200 OK`

```json
{
  "success": true,
  "data": {
    "_id":              "64a1f2b3c4d5e6f7a8b9c0d1",
    "fullName":         "Bishwayan Banerjee",
    "email":            "bishwayan@example.com",
    "mobile":           "9876543210",
    "referralCode":     "XK9PLMQ2",
    "referredBy":       "64a1f2b3c4d5e6f7a8b9c0d0",
    "walletBalance":    1600.50,
    "totalROIEarned":   1250.50,
    "totalLevelIncome": 350.00,
    "accountStatus":    "active",
    "createdAt":        "2026-06-01T10:30:00.000Z",
    "updatedAt":        "2026-06-06T00:00:05.000Z"
  },
  "message": "User profile fetched"
}
```

---

## 2. Investments

### 2.1 Create Investment

```
POST /api/investments
```

Creates a new investment plan for the authenticated user. Immediately triggers multi-level referral income distribution up the referral chain (up to 5 levels). The referral distribution runs asynchronously and does not block the response.

**Auth required:** Yes

#### Referral Income Triggered (example for ₹10,000)

| Level | Beneficiary | Percentage | Amount |
|---|---|---|---|
| 1 | Direct referrer | 5% | ₹500 |
| 2 | Referrer's referrer | 3% | ₹300 |
| 3 | Level 3 ancestor | 2% | ₹200 |
| 4 | Level 4 ancestor | 1% | ₹100 |
| 5 | Level 5 ancestor | 0.5% | ₹50 |

#### Request Body

| Field | Type | Required | Constraints |
|---|---|---|---|
| `amount` | number | ✔ | Positive number (> 0) |
| `planName` | string | ✔ | Non-empty |
| `planDurationDays` | integer | ✔ | Positive integer (≥ 1) |
| `dailyROIPercent` | number | ✔ | Between 0.01 and 100 |

```json
{
  "amount":           10000,
  "planName":         "Gold Plan",
  "planDurationDays": 30,
  "dailyROIPercent":  0.5
}
```

#### Response `201 Created`

```json
{
  "success": true,
  "data": {
    "_id":              "64b2a3c4d5e6f7a8b9c0d1e2",
    "userId":           "64a1f2b3c4d5e6f7a8b9c0d1",
    "amount":           10000,
    "planName":         "Gold Plan",
    "planDurationDays": 30,
    "dailyROIPercent":  0.5,
    "startDate":        "2026-06-06T10:30:00.000Z",
    "endDate":          "2026-07-06T10:30:00.000Z",
    "status":           "active",
    "createdAt":        "2026-06-06T10:30:00.000Z",
    "updatedAt":        "2026-06-06T10:30:00.000Z"
  },
  "message": "Investment created successfully"
}
```

#### Error Responses

| Status | Condition |
|---|---|
| `401 Unauthorized` | Missing or invalid JWT |
| `422 Unprocessable Entity` | Validation failed |

---

### 2.2 List Investments

```
GET /api/investments
```

Returns all investments belonging to the authenticated user, sorted by creation date descending.

**Auth required:** Yes

#### Response `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "_id":              "64b2a3c4d5e6f7a8b9c0d1e2",
      "userId":           "64a1f2b3c4d5e6f7a8b9c0d1",
      "amount":           10000,
      "planName":         "Gold Plan",
      "planDurationDays": 30,
      "dailyROIPercent":  0.5,
      "startDate":        "2026-06-06T10:30:00.000Z",
      "endDate":          "2026-07-06T10:30:00.000Z",
      "status":           "active",
      "createdAt":        "2026-06-06T10:30:00.000Z",
      "updatedAt":        "2026-06-06T10:30:00.000Z"
    },
    {
      "_id":    "64b2a3c4d5e6f7a8b9c0d1e3",
      "amount": 5000,
      "planName": "Silver Plan",
      "status": "completed"
    }
  ],
  "message": "Investments fetched"
}
```

---

## 3. ROI History

### 3.1 Get ROI History

```
GET /api/roi/history
```

Returns a paginated log of daily ROI credits for the authenticated user. Records are sorted by date descending (most recent first). Each record is populated with the parent investment's plan name and amount.

**Auth required:** Yes

#### Query Parameters

| Parameter | Type | Default | Description |
|---|---|---|---|
| `page` | integer | `1` | Page number (1-indexed) |
| `limit` | integer | `10` | Records per page (max 50) |

```
GET /api/roi/history?page=1&limit=10
```

#### Response `200 OK`

```json
{
  "success": true,
  "data": {
    "history": [
      {
        "_id":    "64c3b4d5e6f7a8b9c0d1e2f3",
        "userId": "64a1f2b3c4d5e6f7a8b9c0d1",
        "investmentId": {
          "_id":      "64b2a3c4d5e6f7a8b9c0d1e2",
          "planName": "Gold Plan",
          "amount":   10000
        },
        "amount": 50.00,
        "date":   "2026-06-06T00:00:00.000Z",
        "status": "credited"
      }
    ],
    "pagination": {
      "page":  1,
      "limit": 10,
      "total": 6,
      "pages": 1
    }
  },
  "message": "ROI history fetched"
}
```

#### ROI Calculation

```
dailyROI = investmentAmount × (dailyROIPercent / 100)
```

Example: ₹10,000 at 0.5% daily = **₹50/day**

> **Idempotency guarantee:** The cron job checks for an existing `ROIHistory` record with the same `investmentId + date` before crediting. A unique compound index on the collection enforces this at the database level.

---

## 4. Dashboard

### 4.1 Get Dashboard Stats

```
GET /api/dashboard
```

Returns aggregated financial statistics for the authenticated user in a single request. Designed for the dashboard overview panel — no pagination needed.

**Auth required:** Yes

#### Response `200 OK`

```json
{
  "success": true,
  "data": {
    "totalInvestments": 25000,
    "totalROIEarned":   1250.50,
    "totalLevelIncome": 350.00,
    "walletBalance":    1600.50
  },
  "message": "Dashboard data fetched"
}
```

#### Field Descriptions

| Field | Description |
|---|---|
| `totalInvestments` | Sum of `amount` across all `active` and `completed` investments |
| `totalROIEarned` | Lifetime cumulative ROI credited to the user (denormalised on User document) |
| `totalLevelIncome` | Lifetime cumulative referral level income received (denormalised on User document) |
| `walletBalance` | Current spendable balance — incremented by ROI credits and referral income |

---

## 5. Referrals

### 5.1 Get Direct Referrals

```
GET /api/referrals/direct
```

Returns all Level-1 (direct) referrals — users who registered using the authenticated user's referral code.

**Auth required:** Yes

#### Response `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "_id":           "64a1f2b3c4d5e6f7a8b9c0d2",
      "fullName":      "Rahul Sharma",
      "email":         "rahul@example.com",
      "referralCode":  "PQ7RSTU8",
      "accountStatus": "active",
      "createdAt":     "2026-06-02T08:15:00.000Z"
    }
  ],
  "message": "Direct referrals fetched"
}
```

---

### 5.2 Get Referral Tree

```
GET /api/referrals/tree
```

Returns the complete referral hierarchy rooted at the authenticated user, up to **5 levels deep**. Uses MongoDB's native `$graphLookup` aggregation — no recursive JavaScript.

**Auth required:** Yes

#### Response `200 OK`

```json
{
  "success": true,
  "data": {
    "_id":          "64a1f2b3c4d5e6f7a8b9c0d1",
    "fullName":     "Bishwayan Banerjee",
    "referralCode": "XK9PLMQ2",
    "children": [
      {
        "_id":          "64a1f2b3c4d5e6f7a8b9c0d2",
        "fullName":     "Rahul Sharma",
        "referralCode": "PQ7RSTU8",
        "depth":        0,
        "children": [
          {
            "_id":          "64a1f2b3c4d5e6f7a8b9c0d3",
            "fullName":     "Priya Das",
            "referralCode": "MN4OPQR5",
            "depth":        1,
            "children": []
          }
        ]
      }
    ]
  },
  "message": "Referral tree fetched"
}
```

#### Notes

- `depth` is 0-indexed (`depth: 0` = Level 1, `depth: 4` = Level 5)
- The tree is reconstructed in-memory from the flat `$graphLookup` result
- Suspended users appear in the tree but do not receive referral income

---

### 5.3 Get Referral Income History

```
GET /api/referrals/income
```

Returns a paginated log of referral commissions received by the authenticated user across all levels. Each record is populated with the generator's profile details.

**Auth required:** Yes

#### Query Parameters

| Parameter | Type | Default | Description |
|---|---|---|---|
| `page` | integer | `1` | Page number |
| `limit` | integer | `10` | Records per page (max 50) |

#### Response `200 OK`

```json
{
  "success": true,
  "data": {
    "income": [
      {
        "_id":   "64d4c5d6e7f8a9b0c1d2e3f4",
        "receiverId":  "64a1f2b3c4d5e6f7a8b9c0d1",
        "generatorId": {
          "_id":          "64a1f2b3c4d5e6f7a8b9c0d2",
          "fullName":     "Rahul Sharma",
          "email":        "rahul@example.com",
          "referralCode": "PQ7RSTU8"
        },
        "level":  1,
        "amount": 500.00,
        "date":   "2026-06-03T14:22:00.000Z"
      },
      {
        "_id":   "64d4c5d6e7f8a9b0c1d2e3f5",
        "level":  2,
        "amount": 150.00,
        "date":   "2026-06-04T09:10:00.000Z"
      }
    ],
    "pagination": {
      "page":  1,
      "limit": 10,
      "total": 2,
      "pages": 1
    }
  },
  "message": "Referral income fetched"
}
```

#### Level → Percentage Mapping

| Level | Trigger | Percentage of Investment |
|---|---|---|
| 1 | Direct referrer of investor | 5% |
| 2 | Level 2 ancestor | 3% |
| 3 | Level 3 ancestor | 2% |
| 4 | Level 4 ancestor | 1% |
| 5 | Level 5 ancestor | 0.5% |

> Income is distributed **once at investment creation**, not on each daily ROI cycle.

---

## 6. Error Reference

### Standard Error Shape

```json
{
  "success": false,
  "data":    null,
  "message": "Human-readable error description"
}
```

### Validation Error Shape (422)

```json
{
  "success": false,
  "data": [
    {
      "type":     "field",
      "msg":      "Valid email is required",
      "path":     "email",
      "location": "body"
    }
  ],
  "message": "Validation failed"
}
```

### HTTP Status Code Reference

| Code | Meaning | When |
|---|---|---|
| `200` | OK | Successful GET |
| `201` | Created | Successful POST creating a resource |
| `400` | Bad Request | Invalid referral code, business rule violation |
| `401` | Unauthorized | Missing JWT, invalid JWT, user not found |
| `403` | Forbidden | Account suspended or inactive |
| `404` | Not Found | Route does not exist |
| `409` | Conflict | Email already registered |
| `422` | Unprocessable Entity | express-validator field errors |
| `500` | Internal Server Error | Unexpected server or database error |

---

## 7. Rate Limits

| Route group | Limit | Window |
|---|---|---|
| `POST /api/auth/*` | 20 requests | 15 minutes |
| All other `/api/*` routes | 200 requests | 15 minutes |

When exceeded, the server returns HTTP `429 Too Many Requests`.

---

## Cron Job — Daily ROI Processing

The ROI crediting is not triggered via an API call. It runs automatically on a server-side cron schedule.

| Property | Value |
|---|---|
| Schedule | Daily at **00:00 IST** (Asia/Kolkata) |
| Expression | `0 0 * * *` |
| Idempotency | 3-layer guard (lock flag + app pre-check + DB unique index) |
| Completion trigger | Investment `status` auto-set to `completed` when `endDate ≤ today` |

### ROI Idempotency Layers

```
Layer 1 — isRunning flag
  Prevents a second cron tick from spawning while the first is still running.

Layer 2 — Application pre-check
  ROIHistory.findOne({ investmentId, date: todayMidnight })
  Skips investments already credited today before opening any transaction.

Layer 3 — DB unique index
  { investmentId: 1, date: 1 } unique: true
  Rejects duplicate inserts with E11000 — caught and counted as a skip.
```

---

*Generated: 2026-06-06 · NexaChain AI v1.0*
