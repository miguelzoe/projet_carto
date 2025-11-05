"use client"

import { AppLayout } from "@/components/app-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Home, DollarSign, TrendingUp, Users, Search, Download, Filter, Map } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useState, useMemo } from "react"
import dynamic from "next/dynamic"

const MapView = dynamic(() => import("./MapView"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[600px] flex items-center justify-center bg-gray-100 rounded-lg">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Chargement de la carte...</p>
      </div>
    </div>
  ),
})

interface Parcelle {
  id: string
  numero: string
  proprietaireNom: string
  adresse: string
  superficie: number
  impotAnnuel: number
  montantDu: number
  statut: "a_jour" | "en_retard" | "impaye"
  latitude: number
  longitude: number
}

// --- Génération de données simulées réalistes ---
const generateFakeParcelles = (): Parcelle[] => {
  const parcelles: Parcelle[] = []
  let id = 1

  const proprietaires = ["M. Tchoua", "Mme Etoundi", "M. Mbarga", "Mme Ngo", "M. Essomba", "M. Ndongo", "Mme Nguimke"]
  const rues = ["Rue 101", "Rue des Palmiers", "Avenue Melen", "Rue de la Paix", "Entrée Biyem-Assi", "Carrefour Obama"]

  // 37 à jour
  for (let i = 0; i < 37; i++) {
    parcelles.push({
      id: String(id++),
      numero: `P-${1000 + i}`,
      proprietaireNom: proprietaires[Math.floor(Math.random() * proprietaires.length)],
      adresse: rues[Math.floor(Math.random() * rues.length)],
      superficie: Math.floor(Math.random() * 300) + 150,
      impotAnnuel: 100000,
      montantDu: 0,
      statut: "a_jour",
      latitude: 3.85 + Math.random() * 0.02,
      longitude: 11.48 + Math.random() * 0.02,
    })
  }

  // 52 en retard
  for (let i = 0; i < 52; i++) {
    parcelles.push({
      id: String(id++),
      numero: `P-${1100 + i}`,
      proprietaireNom: proprietaires[Math.floor(Math.random() * proprietaires.length)],
      adresse: rues[Math.floor(Math.random() * rues.length)],
      superficie: Math.floor(Math.random() * 300) + 150,
      impotAnnuel: 100000,
      montantDu: Math.floor(Math.random() * 20000) + 30000, // entre 30k et 50k
      statut: "en_retard",
      latitude: 3.85 + Math.random() * 0.02,
      longitude: 11.48 + Math.random() * 0.02,
    })
  }

  // 119 impayées
  for (let i = 0; i < 119; i++) {
    parcelles.push({
      id: String(id++),
      numero: `P-${1200 + i}`,
      proprietaireNom: proprietaires[Math.floor(Math.random() * proprietaires.length)],
      adresse: rues[Math.floor(Math.random() * rues.length)],
      superficie: Math.floor(Math.random() * 300) + 150,
      impotAnnuel: 100000,
      montantDu: Math.floor(Math.random() * 30000) + 90000, // entre 90k et 120k
      statut: "impaye",
      latitude: 3.85 + Math.random() * 0.02,
      longitude: 11.48 + Math.random() * 0.02,
    })
  }

  return parcelles
}

export default function AdminPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<"table" | "map">("table")

  // Données locales (pas d'appel API)
  const parcelles = useMemo(() => generateFakeParcelles(), [])
  
  // Calcul automatique des statistiques
  const stats = useMemo(() => {
    const totalParcelles = parcelles.length
    const parcellesAJour = parcelles.filter((p) => p.statut === "a_jour").length
    const parcellesEnRetard = parcelles.filter((p) => p.statut === "en_retard").length
    const parcellesImpayees = parcelles.filter((p) => p.statut === "impaye").length
    const totalRevenu = parcelles.reduce((sum, p) => sum + p.impotAnnuel, 0)
    const totalDu = parcelles.reduce((sum, p) => sum + p.montantDu, 0)
    const tauxConformite = (parcellesAJour / totalParcelles) * 100

    return {
      totalParcelles,
      parcellesAJour,
      parcellesEnRetard,
      parcellesImpayees,
      totalRevenu,
      totalDu,
      tauxConformite,
    }
  }, [parcelles])

  const filteredParcelles = useMemo(() => {
    return parcelles.filter(
      (p) =>
        p.numero.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.proprietaireNom.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.adresse.toLowerCase().includes(searchQuery.toLowerCase()),
    )
  }, [parcelles, searchQuery])

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

  const getStatutDescription = (statut: string) => {
    switch (statut) {
      case "a_jour":
        return "Paiements à jour - Conforme"
      case "en_retard":
        return "Retard partiel - Partiellement conforme"
      case "impaye":
        return "Aucun paiement - Non conforme"
      default:
        return ""
    }
  }

  return (
    <AppLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Administration - Biyem-Assi</h1>
          <p className="text-sm text-gray-600">Gestion fiscale foncière des 208 parcelles</p>
        </div>

        {/* Cartes statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Parcelles</p>
                  <p className="text-3xl font-bold">{stats.totalParcelles}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">{stats.parcellesAJour} à jour</span>
                    <span className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded">{stats.parcellesEnRetard} retard</span>
                    <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">{stats.parcellesImpayees} impayé</span>
                  </div>
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
                  <p className="text-sm text-gray-600 mb-1">Revenus Potentiels</p>
                  <p className="text-2xl font-bold text-green-600">{(stats.totalRevenu / 1000000).toFixed(1)}M</p>
                  <p className="text-xs text-gray-600 mt-1">FCFA/an</p>
                </div>
                <div className="bg-green-100 p-3 rounded-lg">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Montants Dus</p>
                  <p className="text-2xl font-bold text-red-600">{(stats.totalDu / 1000000).toFixed(1)}M</p>
                  <p className="text-xs text-gray-600 mt-1">FCFA</p>
                  <p className="text-xs text-orange-600 mt-1">
                    {stats.parcellesEnRetard + stats.parcellesImpayees} parcelles concernées
                  </p>
                </div>
                <div className="bg-red-100 p-3 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Taux de Conformité</p>
                  <p className="text-3xl font-bold text-green-600">{Math.round(stats.tauxConformite)}%</p>
                  <p className="text-xs text-gray-600 mt-1">
                    {stats.parcellesAJour}/{stats.totalParcelles} conformes
                  </p>
                </div>
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Table ou Carte */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Gestion des Parcelles - Biyem-Assi</CardTitle>
                <CardDescription>
                  {viewMode === "table"
                    ? `Liste des ${stats.totalParcelles} parcelles cadastrales`
                    : "Visualisation cartographique des parcelles"}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={viewMode === "map" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode(viewMode === "table" ? "map" : "table")}
                >
                  <Map className="h-4 w-4 mr-2" />
                  {viewMode === "table" ? "Afficher la carte" : "Afficher le tableau"}
                </Button>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filtrer
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Exporter
                </Button>
              </div>
            </div>

            <div className="relative mt-4">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher par numéro, propriétaire ou adresse..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>

          <CardContent>
            {viewMode === "table" ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Numéro</TableHead>
                      <TableHead>Propriétaire</TableHead>
                      <TableHead>Adresse</TableHead>
                      <TableHead>Superficie</TableHead>
                      <TableHead>Impôt Annuel</TableHead>
                      <TableHead>Montant Dû</TableHead>
                      <TableHead>Statut</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredParcelles.map((p) => (
                      <TableRow
                        key={p.id}
                        className={
                          p.statut === "impaye"
                            ? "bg-red-50 hover:bg-red-100"
                            : p.statut === "en_retard"
                            ? "bg-orange-50 hover:bg-orange-100"
                            : "hover:bg-gray-50"
                        }
                      >
                        <TableCell className="font-medium">{p.numero}</TableCell>
                        <TableCell>{p.proprietaireNom}</TableCell>
                        <TableCell className="max-w-[200px] truncate">{p.adresse}</TableCell>
                        <TableCell>{p.superficie.toLocaleString("fr-FR")} m²</TableCell>
                        <TableCell>{p.impotAnnuel.toLocaleString("fr-FR")} FCFA</TableCell>
                        <TableCell
                          className={
                            p.statut === "impaye"
                              ? "text-red-600 font-semibold"
                              : p.statut === "en_retard"
                              ? "text-orange-600 font-semibold"
                              : "text-gray-600"
                          }
                        >
                          {p.montantDu > 0 ? `${p.montantDu.toLocaleString("fr-FR")} FCFA` : "-"}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            {getStatutBadge(p.statut)}
                            <span className="text-xs text-gray-500">{getStatutDescription(p.statut)}</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {filteredParcelles.length === 0 && (
                  <div className="text-center py-8 text-gray-500">Aucune parcelle trouvée</div>
                )}
              </div>
            ) : (
              <MapView parcelles={filteredParcelles} searchQuery={searchQuery} />
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
