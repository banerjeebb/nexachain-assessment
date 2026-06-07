// ─── API Response Types ────────────────────────────────────────────────────────
// These match the exact shapes returned by the Express API.

export interface ApiUser {
  _id: string
  fullName: string
  email: string
  mobile: string
  referralCode: string
  referredBy?: string
  walletBalance: number
  totalROIEarned: number
  totalLevelIncome: number
  accountStatus: 'active' | 'inactive' | 'suspended'
  createdAt: string
  updatedAt: string
}

export interface DashboardStats {
  totalInvestments: number
  totalROIEarned: number
  totalLevelIncome: number
  walletBalance: number
}

export interface Investment {
  _id: string
  userId: string
  amount: number
  planName: string
  planDurationDays: number
  dailyROIPercent: number
  startDate: string
  endDate: string
  status: 'active' | 'completed' | 'cancelled'
  createdAt: string
  updatedAt: string
}

// investmentId is populated by the API (not just an ObjectId string)
export interface ROIHistory {
  _id: string
  userId: string
  investmentId: {
    _id: string
    planName: string
    amount: number
  }
  amount: number   // the ROI credit amount
  date: string
  status: 'credited' | 'pending' | 'failed'
}

export interface ROIPagination {
  page: number
  limit: number
  total: number
  pages: number
}

// accountStatus + createdAt from the API (no totalInvested)
export interface DirectReferral {
  _id: string
  fullName: string
  email: string
  referralCode: string
  accountStatus: 'active' | 'inactive' | 'suspended'
  createdAt: string
}

// generatorId is populated by the API
export interface ReferralIncome {
  _id: string
  receiverId: string
  generatorId: {
    _id: string
    fullName: string
    email: string
    referralCode: string
  }
  level: number
  amount: number
  date: string
}

export interface IncomePagination {
  page: number
  limit: number
  total: number
  pages: number
}

export interface TreeNode {
  _id: string
  fullName: string
  referralCode: string
  depth?: number
  children: TreeNode[]
}

// Derived types (not from API directly)
export interface ChartPoint {
  date: string
  roi: number
  levelIncome: number
}

export interface ActivityEntry {
  id: string
  type: 'roi' | 'referral' | 'investment'
  label: string
  amount: number
  time: string
}
