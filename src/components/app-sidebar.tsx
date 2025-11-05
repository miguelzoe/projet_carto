"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { MapPin, Map, LayoutDashboard, CreditCard, Settings, LogOut, Shield, FileText } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface AppSidebarProps {
  user?: {
    nom: string
    prenom: string
    email: string
    role: "usager" | "admin"
  } | null
}

export function AppSidebar({ user }: AppSidebarProps) {
  const pathname = usePathname()

  const userLinks = [
    { href: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
    { href: "/carte", label: "Carte des parcelles", icon: Map },
    { href: "/mes-parcelles", label: "Mes parcelles", icon: FileText },
    { href: "/paiements", label: "Paiements", icon: CreditCard },
  ]

  const adminLinks = [
    { href: "/admin", label: "Administration", icon: Shield },
    { href: "/admin/parcelles", label: "Toutes les parcelles", icon: Map },
    { href: "/admin/usagers", label: "Usagers", icon: LayoutDashboard },
  ]

  const links = user?.role === "admin" ? [...userLinks, ...adminLinks] : userLinks

  return (
    <aside className="w-64 bg-white border-r h-screen sticky top-0 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="bg-emerald-600 p-2 rounded-lg">
            <MapPin className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-gray-900">Fisc Foncier</h1>
            <p className="text-xs text-gray-600">Yaoundé</p>
          </div>
        </Link>
      </div>

      {/* User Info */}
      {user && (
        <div className="p-4 border-b bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
              <span className="text-emerald-700 font-semibold">
                {user.prenom[0]}
                {user.nom[0]}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user.prenom} {user.nom}
              </p>
              <p className="text-xs text-gray-600 truncate">{user.email}</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {links.map((link) => {
          const Icon = link.icon
          const isActive = pathname === link.href
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive ? "bg-emerald-50 text-emerald-700" : "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
              )}
            >
              <Icon className="h-5 w-5" />
              {link.label}
            </Link>
          )
        })}
      </nav>

      {/* Footer Actions */}
      <div className="p-4 border-t space-y-2">
        <Button variant="ghost" className="w-full justify-start gap-3" asChild>
          <Link href="/settings">
            <Settings className="h-5 w-5" />
            Paramètres
          </Link>
        </Button>
        <Button variant="ghost" className="w-full justify-start gap-3 text-red-600 hover:text-red-700 hover:bg-red-50">
          <LogOut className="h-5 w-5" />
          Déconnexion
        </Button>
      </div>
    </aside>
  )
}
