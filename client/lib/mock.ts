import { genSpark } from './utils'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface User {
  _id: string
  fullName: string
  email: string
  mobile: string
  referralCode: string
  walletBalance: number
  totalROIEarned: number
  totalLevelIncome: number
  accountStatus: 'active' | 'inactive' | 'suspended'
  rank: string
  avatar: string
}

export interface Investment {
  _id: string
  planName: string
  amount: number
  dailyROIPercent: number
  planDurationDays: number
  startDate: string
  endDate: string
  status: 'active' | 'completed' | 'cancelled'
}

export interface ROIHistory {
  _id: string
  date: string
  investmentId: string
  planName: string
  amount: number
  roiAmount: number
  status: 'credited' | 'pending' | 'failed'
}

export interface ReferralIncome {
  _id: string
  date: string
  generatorName: string
  generatorCode: string
  level: number
  amount: number
}

export interface DirectReferral {
  _id: string
  fullName: string
  email: string
  referralCode: string
  joinedAt: string
  totalInvested: number
}

export interface TreeNode {
  _id: string
  fullName: string
  referralCode: string
  depth: number
  children: TreeNode[]
}

export interface LeaderboardEntry {
  rank: number
  fullName: string
  referralCode: string
  totalReferrals: number
  totalEarned: number
}

export interface ActivityEntry {
  id: string
  type: 'roi' | 'referral' | 'investment' | 'withdrawal'
  label: string
  amount: number
  time: string
}

export interface DashboardStats {
  totalInvestments: number
  totalROIEarned: number
  totalLevelIncome: number
  walletBalance: number
}

// ─── Mock User ────────────────────────────────────────────────────────────────

export const MOCK_USER: User = {
  _id: 'usr_001',
  fullName: 'Arjun Sharma',
  email: 'arjun@nexachain.ai',
  mobile: '9876543210',
  referralCode: 'ARJN8K2X',
  walletBalance: 24_850,
  totalROIEarned: 18_420,
  totalLevelIncome: 12_600,
  accountStatus: 'active',
  rank: 'Gold',
  avatar: '#e7b84a',
}

// ─── Dashboard Stats ──────────────────────────────────────────────────────────

export const MOCK_STATS: DashboardStats = {
  totalInvestments: 1_50_000,
  totalROIEarned: 18_420,
  totalLevelIncome: 12_600,
  walletBalance: 24_850,
}

// ─── ROI Series (for chart) ───────────────────────────────────────────────────

function daysAgo(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().slice(0, 10)
}

export const MOCK_ROI_SERIES = Array.from({ length: 30 }, (_, i) => ({
  date: daysAgo(29 - i),
  roi: Math.round(300 + Math.sin(i * 0.4) * 120 + i * 8),
  levelIncome: Math.round(150 + Math.cos(i * 0.3) * 80 + i * 4),
}))

// ─── Investments ──────────────────────────────────────────────────────────────

export const MOCK_INVESTMENTS: Investment[] = [
  {
    _id: 'inv_001',
    planName: 'Starter',
    amount: 10_000,
    dailyROIPercent: 0.5,
    planDurationDays: 30,
    startDate: daysAgo(25),
    endDate: daysAgo(-5),
    status: 'active',
  },
  {
    _id: 'inv_002',
    planName: 'Growth',
    amount: 50_000,
    dailyROIPercent: 0.8,
    planDurationDays: 60,
    startDate: daysAgo(15),
    endDate: daysAgo(-45),
    status: 'active',
  },
  {
    _id: 'inv_003',
    planName: 'Elite',
    amount: 90_000,
    dailyROIPercent: 1.2,
    planDurationDays: 90,
    startDate: daysAgo(95),
    endDate: daysAgo(5),
    status: 'completed',
  },
  {
    _id: 'inv_004',
    planName: 'Starter',
    amount: 5_000,
    dailyROIPercent: 0.5,
    planDurationDays: 30,
    startDate: daysAgo(40),
    endDate: daysAgo(10),
    status: 'cancelled',
  },
]

// ─── ROI History ──────────────────────────────────────────────────────────────

export const MOCK_ROI_HISTORY: ROIHistory[] = Array.from({ length: 20 }, (_, i) => ({
  _id: `roi_${i + 1}`,
  date: daysAgo(i),
  investmentId: i % 3 === 0 ? 'inv_001' : i % 3 === 1 ? 'inv_002' : 'inv_003',
  planName: i % 3 === 0 ? 'Starter' : i % 3 === 1 ? 'Growth' : 'Elite',
  amount: i % 3 === 0 ? 10_000 : i % 3 === 1 ? 50_000 : 90_000,
  roiAmount: i % 3 === 0 ? 50 : i % 3 === 1 ? 400 : 1_080,
  status: 'credited',
}))

// ─── Referral Income ──────────────────────────────────────────────────────────

const NAMES = ['Priya Nair', 'Rohan Das', 'Kavya Reddy', 'Suresh Pillai', 'Anjali Verma']
const CODES = ['PRIY4X2K', 'ROHN3D7M', 'KAV8YR1P', 'SUR5PL2A', 'ANJ7LV3B']

export const MOCK_REFERRAL_INCOME: ReferralIncome[] = Array.from({ length: 15 }, (_, i) => ({
  _id: `refi_${i + 1}`,
  date: daysAgo(i * 2),
  generatorName: NAMES[i % 5],
  generatorCode: CODES[i % 5],
  level: (i % 5) + 1,
  amount: [500, 300, 200, 100, 50][(i % 5)],
}))

// ─── Direct Referrals ─────────────────────────────────────────────────────────

export const MOCK_DIRECT_REFERRALS: DirectReferral[] = NAMES.map((name, i) => ({
  _id: `usr_10${i + 1}`,
  fullName: name,
  email: `${name.split(' ')[0].toLowerCase()}@mail.com`,
  referralCode: CODES[i],
  joinedAt: daysAgo(i * 5 + 3),
  totalInvested: [25_000, 10_000, 50_000, 0, 15_000][i],
}))

// ─── Referral Tree ────────────────────────────────────────────────────────────

export const MOCK_REFERRAL_TREE: TreeNode = {
  _id: 'usr_001',
  fullName: 'Arjun Sharma',
  referralCode: 'ARJN8K2X',
  depth: 0,
  children: [
    {
      _id: 'usr_101',
      fullName: 'Priya Nair',
      referralCode: 'PRIY4X2K',
      depth: 1,
      children: [
        {
          _id: 'usr_201',
          fullName: 'Vikram Singh',
          referralCode: 'VIK7SN3Q',
          depth: 2,
          children: [
            {
              _id: 'usr_301',
              fullName: 'Neha Joshi',
              referralCode: 'NEH5JO9W',
              depth: 3,
              children: [],
            },
          ],
        },
        {
          _id: 'usr_202',
          fullName: 'Divya Menon',
          referralCode: 'DIV3MN6R',
          depth: 2,
          children: [],
        },
      ],
    },
    {
      _id: 'usr_102',
      fullName: 'Rohan Das',
      referralCode: 'ROHN3D7M',
      depth: 1,
      children: [
        {
          _id: 'usr_203',
          fullName: 'Amit Kumar',
          referralCode: 'AMT2KU8L',
          depth: 2,
          children: [],
        },
      ],
    },
    {
      _id: 'usr_103',
      fullName: 'Kavya Reddy',
      referralCode: 'KAV8YR1P',
      depth: 1,
      children: [],
    },
    {
      _id: 'usr_104',
      fullName: 'Suresh Pillai',
      referralCode: 'SUR5PL2A',
      depth: 1,
      children: [],
    },
    {
      _id: 'usr_105',
      fullName: 'Anjali Verma',
      referralCode: 'ANJ7LV3B',
      depth: 1,
      children: [],
    },
  ],
}

// ─── Leaderboard ──────────────────────────────────────────────────────────────

export const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, fullName: 'Arjun Sharma', referralCode: 'ARJN8K2X', totalReferrals: 47, totalEarned: 31_050 },
  { rank: 2, fullName: 'Priya Nair', referralCode: 'PRIY4X2K', totalReferrals: 32, totalEarned: 22_400 },
  { rank: 3, fullName: 'Rohan Das', referralCode: 'ROHN3D7M', totalReferrals: 28, totalEarned: 19_600 },
  { rank: 4, fullName: 'Kavya Reddy', referralCode: 'KAV8YR1P', totalReferrals: 21, totalEarned: 14_700 },
  { rank: 5, fullName: 'Suresh Pillai', referralCode: 'SUR5PL2A', totalReferrals: 18, totalEarned: 12_600 },
]

// ─── Activity Feed ────────────────────────────────────────────────────────────

export const MOCK_ACTIVITY: ActivityEntry[] = [
  { id: 'a1', type: 'roi',        label: 'ROI credited — Growth Plan',     amount: 400,   time: '2 min ago' },
  { id: 'a2', type: 'referral',   label: 'Level 1 income from Priya Nair', amount: 500,   time: '1 hr ago' },
  { id: 'a3', type: 'investment', label: 'Investment activated — Elite',   amount: 90_000, time: '3 hr ago' },
  { id: 'a4', type: 'roi',        label: 'ROI credited — Starter Plan',   amount: 50,    time: '1 day ago' },
  { id: 'a5', type: 'referral',   label: 'Level 2 income from Vikram',    amount: 300,   time: '2 days ago' },
  { id: 'a6', type: 'investment', label: 'Investment activated — Growth',  amount: 50_000, time: '15 days ago' },
]

// ─── Stat sparks ──────────────────────────────────────────────────────────────

export const STAT_SPARKS = {
  totalInvestments: genSpark(20, 1, 60, 100),
  totalROIEarned:   genSpark(20, 2, 40, 90),
  totalLevelIncome: genSpark(20, 3, 30, 80),
  walletBalance:    genSpark(20, 4, 50, 95),
}

// ─── Investment Plans ────────────────────────────────────────────────────────

export const PLANS = [
  { name: 'Starter', minAmount: 1_000,  maxAmount: 25_000, dailyROI: 0.5, duration: 30 },
  { name: 'Growth',  minAmount: 25_001, maxAmount: 1_00_000, dailyROI: 0.8, duration: 60 },
  { name: 'Elite',   minAmount: 1_00_001, maxAmount: 10_00_000, dailyROI: 1.2, duration: 90 },
]
