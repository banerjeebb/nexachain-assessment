'use client'

import { useState, useEffect, useCallback } from 'react'
import api from '@/lib/api'
import type { ROIHistory, ROIPagination } from '@/lib/types'

export function useROI(initialPage = 1, limit = 10) {
  const [history, setHistory]           = useState<ROIHistory[]>([])
  const [pagination, setPagination]     = useState<ROIPagination>({ page: 1, limit, total: 0, pages: 1 })
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState<string | null>(null)

  const goToPage = useCallback(async (page: number) => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await api.get(`/api/roi/history?page=${page}&limit=${limit}`)
      setHistory(data.data.history)
      setPagination(data.data.pagination)
    } catch (e: any) {
      setError(e.response?.data?.message ?? 'Failed to load ROI history')
    } finally {
      setLoading(false)
    }
  }, [limit])

  useEffect(() => { goToPage(initialPage) }, [])  // eslint-disable-line react-hooks/exhaustive-deps

  return { history, pagination, loading, error, goToPage }
}
