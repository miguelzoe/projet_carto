"use client"

import { AppSidebar } from "./app-sidebar"
import type { ReactNode } from "react"

interface AppLayoutProps {
  children: ReactNode
  user?: {
    nom: string
    prenom: string
    email: string
    role: "usager" | "admin"
  } | null
}

export function AppLayout({ children, user }: AppLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden">
      <AppSidebar user={user} />
      <main className="flex-1 overflow-y-auto bg-gray-50">{children}</main>
    </div>
  )
}
