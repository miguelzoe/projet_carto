"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MapPin, LogOut, User, LayoutDashboard } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface HeaderProps {
  user?: {
    nom: string
    prenom: string
    email: string
    role: "usager" | "admin"
  } | null
}

export function Header({ user }: HeaderProps) {
  return (
    <header className="border-b bg-white sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="bg-emerald-600 p-2 rounded-lg">
            <MapPin className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-xl text-gray-900">Fisc Foncier</h1>
            <p className="text-xs text-gray-600">Yaoundé - Cameroun</p>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link href="/carte" className="text-gray-700 hover:text-emerald-600 transition-colors">
            Carte des Parcelles
          </Link>
          {user && (
            <Link href="/dashboard" className="text-gray-700 hover:text-emerald-600 transition-colors">
              Mon Espace
            </Link>
          )}
          {user?.role === "admin" && (
            <Link href="/admin" className="text-gray-700 hover:text-emerald-600 transition-colors">
              Administration
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2 bg-transparent">
                  <User className="h-4 w-4" />
                  <span className="hidden md:inline">
                    {user.prenom} {user.nom}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Mon Compte</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="cursor-pointer">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Tableau de bord
                  </Link>
                </DropdownMenuItem>
                {user.role === "admin" && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin" className="cursor-pointer">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Administration
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  Déconnexion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="outline" asChild>
                <Link href="/login">Connexion</Link>
              </Button>
              <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
                <Link href="/register">Inscription</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
