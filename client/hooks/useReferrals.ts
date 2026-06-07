'use client'

import { useState, useEffect, useCallback } from 'react'
import api from '@/lib/api'
import type { DirectReferral, ReferralIncome, TreeNode, IncomePagination } from '@/lib/types'

export function useReferrals() {
  const [directReferrals, setDirectReferrals] = useState<DirectReferral[]>([])
  const [referralIncome, setReferralIncome]   = useState<ReferralIncome[]>([])
  const [incomePagination, setIncomePagination] = useState<IncomePagination>({ page: 1, limit: 10, total: 0, pages: 1 })
  const [referralTree, setReferralTree]       = useState<TreeNode | null>(null)
  const [loading, setLoading]                 = useState(true)
  const [error, setError]                     = useState<string | null>(null)

  const loadIncome = useCallback(async (page: number) => {
    try {
      const { data } = await api.get(`/api/referrals/income?page=${page}&limit=10`)
      setReferralIncome(data.data.income)
      setIncomePagination(data.data.pagination)
    } catch (e: any) {
      setError(e.response?.data?.message ?? 'Failed to load income history')
    }
  }, [])

  const fetchAll = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [directRes, treeRes, incomeRes] = await Promise.all([
        api.get('/api/referrals/direct'),
        api.get('/api/referrals/tree'),
        api.get('/api/referrals/income?page=1&limit=10'),
      ])
      setDirectReferrals(directRes.data.data)
      setReferralTree(treeRes.data.data)
      setReferralIncome(incomeRes.data.data.income)
      setIncomePagination(incomeRes.data.data.pagination)
    } catch (e: any) {
      setError(e.response?.data?.message ?? 'Failed to load referrals')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  return { directReferrals, referralIncome, incomePagination, referralTree, loading, error, loadIncome, refresh: fetchAll }
}
