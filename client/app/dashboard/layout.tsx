'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { SidebarProvider, useSidebar } from '@/components/dashboard/SidebarContext'
import { UserProvider } from '@/components/dashboard/UserContext'
import Sidebar from '@/components/dashboard/Sidebar'
import Topbar from '@/components/dashboard/Topbar'
import BottomNav from '@/components/dashboard/BottomNav'

function Shell({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebar()
  const sideW = collapsed ? 64 : 240

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      <Sidebar />
      <div className="dash-shell-content" style={{
        marginLeft: sideW,
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        minWidth: 0,
        transition: 'margin-left 0.25s ease',
      }}>
        <Topbar />
        <div className="dash-main" style={{ flex: 1, padding: '28px', overflowY: 'auto' }}>
          {children}
        </div>
      </div>
      <BottomNav />
    </div>
  )
}

function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  useEffect(() => {
    if (!localStorage.getItem('nexa_token')) router.replace('/login')
  }, [router])
  return <>{children}</>
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <SidebarProvider>
        <UserProvider>
          <Shell>{children}</Shell>
        </UserProvider>
      </SidebarProvider>
    </AuthGuard>
  )
}
