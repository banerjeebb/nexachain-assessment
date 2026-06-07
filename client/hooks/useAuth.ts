'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { useToast } from '@/components/ui/Toast'

interface LoginPayload {
  email: string
  password: string
}

interface RegisterPayload {
  fullName: string
  email: string
  mobile: string
  password: string
  referralCode?: string
}

function extractErrorMessage(err: any, fallback: string): string {
  const data = err.response?.data
  if (!data) return fallback
  if (Array.isArray(data.data) && data.data.length > 0 && data.data[0]?.msg) {
    return data.data[0].msg
  }
  return data.message ?? fallback
}

export function useAuth() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function login(payload: LoginPayload) {
    setLoading(true)
    setError(null)
    try {
      const { data } = await api.post('/api/auth/login', payload)
      if (data.success) {
        localStorage.setItem('nexa_token', data.data.token)
        router.push('/dashboard')
      }
    } catch (err: any) {
      const message = extractErrorMessage(err, 'Login failed')
      setError(message)
      toast(message, 'error')
    } finally {
      setLoading(false)
    }
  }

  async function register(payload: RegisterPayload) {
    setLoading(true)
    setError(null)
    try {
      const { data } = await api.post('/api/auth/register', payload)
      if (data.success) {
        localStorage.setItem('nexa_token', data.data.token)
        router.push('/dashboard')
      }
    } catch (err: any) {
      const message = extractErrorMessage(err, 'Registration failed')
      setError(message)
      toast(message, 'error')
    } finally {
      setLoading(false)
    }
  }

  function logout() {
    localStorage.removeItem('nexa_token')
    router.push('/login')
  }

  return { login, register, logout, loading, error }
}
