'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import api from '@/lib/api'
import type { ApiUser, DashboardStats } from '@/lib/types'

interface UserCtx {
  user: ApiUser | null
  stats: DashboardStats | null
  loading: boolean
  error: string | null
  refresh: () => void
}

const Ctx = createContext<UserCtx>({ user: null, stats: null, loading: true, error: null, refresh: () => {} })

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser]     = useState<ApiUser | null>(null)
  const [stats, setStats]   = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [userRes, statsRes] = await Promise.all([
        api.get('/api/auth/me'),
        api.get('/api/dashboard'),
      ])
      setUser(userRes.data.data)
      setStats(statsRes.data.data)
    } catch (e: any) {
      // 401 is handled globally by the Axios interceptor (redirects to /login)
      if (e.response?.status !== 401) {
        setError(e.response?.data?.message ?? 'Failed to load your account data')
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  return (
    <Ctx.Provider value={{ user, stats, loading, error, refresh: load }}>
      {children}
    </Ctx.Provider>
  )
}

export function useUser() {
  return useContext(Ctx)
}
