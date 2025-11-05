"use client"

import { AppLayout } from "@/components/app-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { mockParcelles, mockPaiements, mockUsers } from "@/lib/mock-data"
import { MapPin, CreditCard, AlertCircle, CheckCircle, Home } from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  const currentUser = mockUsers[0]
  const userParcelles = mockParcelles.filter((p) => currentUser.parcelles.includes(p.id))
  const userPaiements = mockPaiements.filter((p) => userParcelles.some((parcelle) => parcelle.id === p.parcelleId))

  const totalMontantDu = userParcelles.reduce((sum, p) => sum + p.montantDu, 0)
  const parcellesAJour = userParcelles.filter((p) => p.statut === "a_jour").length
  const parcellesEnRetard = userParcelles.filter((p) => p.statut !== "a_jour").length

  const getStatutBadge = (statut: string) => {
    switch (statut) {
      case "a_jour":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">À jour</Badge>
      case "en_retard":
        return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">En retard</Badge>
      case "impaye":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Impayé</Badge>
      default:
        return null
    }
  }

  return (
    <AppLayout user={currentUser}>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Tableau de bord</h1>
          <p className="text-sm text-gray-600">Vue d'ensemble de vos parcelles et paiements</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Mes Parcelles</p>
                  <p className="text-3xl font-bold">{userParcelles.length}</p>
                </div>
                <div className="bg-emerald-100 p-3 rounded-lg">
                  <Home className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">À Jour</p>
                  <p className="text-3xl font-bold text-green-600">{parcellesAJour}</p>
                </div>
                <div className="bg-green-100 p-3 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">En Retard</p>
                  <p className="text-3xl font-bold text-orange-600">{parcellesEnRetard}</p>
                </div>
                <div className="bg-orange-100 p-3 rounded-lg">
                  <AlertCircle className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Montant Dû</p>
                  <p className="text-xl font-bold text-red-600">{totalMontantDu.toLocaleString("fr-FR")} FCFA</p>
                </div>
                <div className="bg-red-100 p-3 rounded-lg">
                  <CreditCard className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Mes Parcelles */}
          <Card>
            <CardHeader>
              <CardTitle>Mes Parcelles</CardTitle>
              <CardDescription>Liste de toutes vos parcelles enregistrées</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {userParcelles.map((parcelle) => (
                  <div key={parcelle.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-sm">{parcelle.numero}</h4>
                        <p className="text-xs text-gray-600 flex items-center gap-1 mt-1">
                          <MapPin className="h-3 w-3" />
                          {parcelle.adresse}, {parcelle.quartier}
                        </p>
                      </div>
                      {getStatutBadge(parcelle.statut)}
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <div className="text-xs">
                        <span className="text-gray-600">Impôt annuel: </span>
                        <span className="font-semibold">{parcelle.impotAnnuel.toLocaleString("fr-FR")} FCFA</span>
                      </div>
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/parcelle/${parcelle.id}`}>Détails</Link>
                      </Button>
                    </div>

                    {parcelle.montantDu > 0 && (
                      <div className="mt-3 bg-red-50 border border-red-200 rounded p-2">
                        <p className="text-xs text-red-800 font-semibold">
                          Montant dû: {parcelle.montantDu.toLocaleString("fr-FR")} FCFA
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Historique des Paiements */}
          <Card>
            <CardHeader>
              <CardTitle>Historique des Paiements</CardTitle>
              <CardDescription>Vos derniers paiements effectués</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {userPaiements.length > 0 ? (
                  userPaiements.map((paiement) => {
                    const parcelle = userParcelles.find((p) => p.id === paiement.parcelleId)
                    return (
                      <div key={paiement.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-semibold text-sm">{parcelle?.numero}</h4>
                            <p className="text-xs text-gray-600">{parcelle?.adresse}</p>
                          </div>
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Payé</Badge>
                        </div>

                        <div className="flex items-center justify-between mt-3 text-xs">
                          <div>
                            <p className="text-gray-600">Montant</p>
                            <p className="font-semibold">{paiement.montant.toLocaleString("fr-FR")} FCFA</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Date</p>
                            <p className="font-semibold">{new Date(paiement.date).toLocaleDateString("fr-FR")}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Référence</p>
                            <p className="font-semibold text-xs">{paiement.reference}</p>
                          </div>
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <CreditCard className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                    <p className="text-sm">Aucun paiement enregistré</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  )
}
