'use client'

import { useState, useEffect, useCallback } from 'react'
import api from '@/lib/api'
import type { DashboardStats } from '@/lib/types'

export function useDashboard() {
  const [stats, setStats]     = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await api.get('/api/dashboard')
      setStats(data.data)
    } catch (e: any) {
      setError(e.response?.data?.message ?? 'Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  return { stats, loading, error, refresh: load }
}
