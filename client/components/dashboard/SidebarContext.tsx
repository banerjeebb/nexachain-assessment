'use client'

import { createContext, useContext, useState } from 'react'

interface SidebarCtx {
  collapsed: boolean
  toggle: () => void
  mobileOpen: boolean
  openMobile: () => void
  closeMobile: () => void
}

const Ctx = createContext<SidebarCtx>({
  collapsed: false,
  toggle: () => {},
  mobileOpen: false,
  openMobile: () => {},
  closeMobile: () => {},
})

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  return (
    <Ctx.Provider value={{
      collapsed,
      toggle: () => setCollapsed(v => !v),
      mobileOpen,
      openMobile: () => setMobileOpen(true),
      closeMobile: () => setMobileOpen(false),
    }}>
      {children}
    </Ctx.Provider>
  )
}

export function useSidebar() {
  return useContext(Ctx)
}
