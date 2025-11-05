"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { User, Mail, Lock, Phone, MapPin, CheckCircle } from "lucide-react"

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    prenom: "",
    nom: "",
    email: "",
    telephone: "",
    password: "",
    confirmPassword: "",
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setLoading(true)
    setSuccess(false)

    // Simulation d’un délai pour le traitement
    setTimeout(() => {
      console.log("[v0] Tentative d'inscription :", formData)
      setLoading(false)
      setSuccess(true)

      // Redirection automatique après 2 secondes
      setTimeout(() => {
        router.push("/login")
      }, 2000)
    }, 1000)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-emerald-100 py-12 px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="bg-emerald-600 p-3 rounded-lg">
              <MapPin className="h-8 w-8 text-white" />
            </div>
            <div className="text-left">
              <h1 className="font-bold text-2xl text-gray-900">Fisc Foncier</h1>
              <p className="text-sm text-gray-600">Yaoundé - Cameroun</p>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Créer un Compte</CardTitle>
            <CardDescription className="text-center">Inscrivez-vous pour accéder à vos parcelles</CardDescription>
          </CardHeader>

          <CardContent>
            {/* ✅ Message de succès */}
            {success && (
              <div className="mb-4 p-3 bg-green-100 text-green-800 border border-green-300 rounded-lg flex items-center gap-2 animate-fade-in">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span>Inscription réussie ! Redirection en cours...</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="prenom">Prénom</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="prenom"
                      name="prenom"
                      placeholder="Jean"
                      value={formData.prenom}
                      onChange={handleChange}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nom">Nom</Label>
                  <Input
                    id="nom"
                    name="nom"
                    placeholder="Mbarga"
                    value={formData.nom}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Adresse Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="votre.email@example.cm"
                    value={formData.email}
                    onChange={handleChange}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="telephone">Téléphone</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="telephone"
                    name="telephone"
                    type="tel"
                    placeholder="+237 6 XX XX XX XX"
                    value={formData.telephone}
                    onChange={handleChange}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Mot de Passe</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmer le Mot de Passe</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700"
                disabled={loading || success}
              >
                {loading ? "Création..." : success ? "Succès 🎉" : "Créer mon Compte"}
              </Button>

              <div className="text-center text-sm text-gray-600">
                Déjà un compte?{" "}
                <Link href="/login" className="text-emerald-600 hover:underline font-semibold">
                  Se connecter
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
