"use client"

import { use } from "react"
import { AppLayout } from "@/components/app-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { mockParcelles, mockUsers } from "@/lib/mock-data"
import { MapPin, Home, DollarSign, Calendar, User, Phone, Mail, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function ParcellePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const parcelle = mockParcelles.find((p) => p.id === id)
  const currentUser = mockUsers[0]

  if (!parcelle) {
    return (
      <AppLayout user={currentUser}>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Parcelle non trouvée</h1>
            <Button asChild>
              <Link href="/carte">Retour à la carte</Link>
            </Button>
          </div>
        </div>
      </AppLayout>
    )
  }

  const getStatutBadge = (statut: string) => {
    switch (statut) {
      case "a_jour":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100 text-base px-3 py-1">À jour</Badge>
      case "en_retard":
        return (
          <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100 text-base px-3 py-1">En retard</Badge>
        )
      case "impaye":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100 text-base px-3 py-1">Impayé</Badge>
      default:
        return null
    }
  }

  return (
    <AppLayout user={currentUser}>
      <div className="p-6">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl">{parcelle.numero}</CardTitle>
                    <CardDescription className="text-base mt-2">{parcelle.adresse}</CardDescription>
                  </div>
                  {getStatutBadge(parcelle.statut)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-emerald-100 p-2 rounded-lg">
                      <MapPin className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Quartier</p>
                      <p className="font-semibold">{parcelle.quartier}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <MapPin className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Arrondissement</p>
                      <p className="font-semibold">{parcelle.arrondissement}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="bg-purple-100 p-2 rounded-lg">
                      <Home className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Superficie</p>
                      <p className="font-semibold">{parcelle.superficie} m²</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="bg-orange-100 p-2 rounded-lg">
                      <DollarSign className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Valeur Fiscale</p>
                      <p className="font-semibold">{parcelle.valeurFiscale.toLocaleString("fr-FR")} FCFA</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Propriétaire */}
            <Card>
              <CardHeader>
                <CardTitle>Informations du Propriétaire</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Nom complet</p>
                    <p className="font-semibold">{parcelle.proprietaireNom}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-semibold">{parcelle.proprietaireEmail}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Téléphone</p>
                    <p className="font-semibold">{parcelle.proprietaireTelephone}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Fiscal Info */}
            <Card>
              <CardHeader>
                <CardTitle>Informations Fiscales</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Impôt Annuel</p>
                  <p className="text-2xl font-bold text-emerald-600">
                    {parcelle.impotAnnuel.toLocaleString("fr-FR")} FCFA
                  </p>
                </div>

                {parcelle.dernierPaiement && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-gray-600">Dernier paiement</p>
                      <p className="font-semibold">{new Date(parcelle.dernierPaiement).toLocaleDateString("fr-FR")}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-gray-600">Prochaine échéance</p>
                    <p className="font-semibold">{new Date(parcelle.prochainePaiement).toLocaleDateString("fr-FR")}</p>
                  </div>
                </div>

                {parcelle.montantDu > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
                    <p className="text-sm text-red-600 mb-1">Montant dû</p>
                    <p className="text-2xl font-bold text-red-800">{parcelle.montantDu.toLocaleString("fr-FR")} FCFA</p>
                    <p className="text-xs text-red-600 mt-2">{parcelle.anneesImpayees} année(s) impayée(s)</p>
                  </div>
                )}

                <Button className="w-full bg-emerald-600 hover:bg-emerald-700 mt-4" asChild>
                  <Link href={`/paiement/${parcelle.id}`}>
                    {parcelle.montantDu > 0 ? "Payer Maintenant" : "Effectuer un Paiement"}
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Map Preview */}
            <Card>
              <CardHeader>
                <CardTitle>Localisation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
                  <MapPin className="h-12 w-12 text-gray-400" />
                </div>
                <p className="text-sm text-gray-600 mt-3">
                  Coordonnées: {parcelle.coordinates[0].toFixed(4)}, {parcelle.coordinates[1].toFixed(4)}
                </p>
                <Button variant="outline" className="w-full mt-3 bg-transparent" asChild>
                  <Link href={`/carte?parcelle=${parcelle.id}`}>Voir sur la carte</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
