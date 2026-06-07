'use client'

import { useState, useEffect, useCallback } from 'react'
import api from '@/lib/api'
import type { Investment } from '@/lib/types'

interface CreatePayload {
  amount: number
  planName: string
  planDurationDays: number
  dailyROIPercent: number
}

export function useInvestments() {
  const [investments, setInvestments] = useState<Investment[]>([])
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState<string | null>(null)
  const [creating, setCreating]       = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await api.get('/api/investments')
      setInvestments(data.data)
    } catch (e: any) {
      setError(e.response?.data?.message ?? 'Failed to load investments')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  async function createInvestment(payload: CreatePayload): Promise<Investment> {
    setCreating(true)
    try {
      const { data } = await api.post('/api/investments', payload)
      await load()
      return data.data
    } finally {
      setCreating(false)
    }
  }

  return { investments, loading, error, creating, createInvestment, refresh: load }
}
