"use client"

import { AppLayout } from "@/components/app-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { 
  CreditCard, 
  Download, 
  Search, 
  Filter, 
  User, 
  MapPin, 
  Calendar,
  DollarSign,
  TrendingUp,
  Users,
  Eye,
  MoreHorizontal
} from "lucide-react"
import { useState, useMemo } from "react"
import { mockUsers, mockParcelles, mockPaiements } from "@/lib/mock-data"

interface PaiementEtendu {
  id: string
  parcelleId: string
  userId: string
  montant: number
  date: string
  methode: string
  reference: string
  statut: "success" | "pending" | "failed"
  parcelle?: {
    id: string
    numero: string
    adresse: string
    proprietaireNom: string
  }
  utilisateur?: {
    id: string
    nom: string
    email: string
    telephone: string
  }
}

// Génération de données de transactions réalistes pour l'admin
const generateAdminPaiements = (): PaiementEtendu[] => {
  const paiements: PaiementEtendu[] = []
  
  // Générer des transactions pour les 30 derniers jours
  const aujourdHui = new Date()
  const statuts: Array<"success" | "pending" | "failed"> = ["success", "success", "success", "pending", "failed"]
  const methodes = ["mobile_money", "carte_credit", "virement_bancaire", "especes"]

  for (let i = 0; i < 150; i++) {
    const joursDansLePasse = Math.floor(Math.random() * 30)
    const date = new Date(aujourdHui)
    date.setDate(aujourdHui.getDate() - joursDansLePasse)
    
    const user = mockUsers[Math.floor(Math.random() * mockUsers.length)]
    const parcelle = mockParcelles[Math.floor(Math.random() * mockParcelles.length)]
    const statut = statuts[Math.floor(Math.random() * statuts.length)]
    const methode = methodes[Math.floor(Math.random() * methodes.length)]
    
    // Montant réaliste basé sur l'impôt de la parcelle avec variation
    const montantBase = parcelle.impotAnnuel / 12
    const montant = Math.round(montantBase * (0.8 + Math.random() * 0.4)) // Variation de 80% à 120%
    
    paiements.push({
      id: `paiement_${i}`,
      parcelleId: parcelle.id,
      userId: user.id,
      montant,
      date: date.toISOString(),
      methode,
      reference: `REF${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(i).padStart(4, '0')}`,
      statut,
      parcelle: {
        id: parcelle.id,
        numero: parcelle.numero,
        adresse: parcelle.adresse,
        proprietaireNom: parcelle.proprietaireNom
      },
      utilisateur: {
        id: user.id,
        nom: user.nom,
        email: user.email,
        telephone: user.telephone || "+237 6XX XX XX XX"
      }
    })
  }
  
  // Trier par date décroissante
  return paiements.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export default function AdminPaiementsPage() {
  const adminUser = mockUsers.find((u) => u.role === "admin")
  const [searchQuery, setSearchQuery] = useState("")
  const [statutFilter, setStatutFilter] = useState<string>("all")
  const [methodeFilter, setMethodeFilter] = useState<string>("all")
  const [dateRange, setDateRange] = useState<string>("30j")

  const paiementsAdmin = useMemo(() => generateAdminPaiements(), [])

  // Filtrage des transactions
  const filteredPaiements = useMemo(() => {
    let filtered = paiementsAdmin

    // Filtre par recherche
    if (searchQuery) {
      filtered = filtered.filter(paiement =>
        paiement.utilisateur?.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
        paiement.parcelle?.numero.toLowerCase().includes(searchQuery.toLowerCase()) ||
        paiement.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
        paiement.utilisateur?.email.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Filtre par statut
    if (statutFilter !== "all") {
      filtered = filtered.filter(paiement => paiement.statut === statutFilter)
    }

    // Filtre par méthode
    if (methodeFilter !== "all") {
      filtered = filtered.filter(paiement => paiement.methode === methodeFilter)
    }

    // Filtre par date
    const aujourdHui = new Date()
    let dateDebut = new Date()

    switch (dateRange) {
      case "7j":
        dateDebut.setDate(aujourdHui.getDate() - 7)
        break
      case "30j":
        dateDebut.setDate(aujourdHui.getDate() - 30)
        break
      case "90j":
        dateDebut.setDate(aujourdHui.getDate() - 90)
        break
      case "1an":
        dateDebut.setFullYear(aujourdHui.getFullYear() - 1)
        break
      default:
        dateDebut = new Date(0) // Toutes les dates
    }

    filtered = filtered.filter(paiement => new Date(paiement.date) >= dateDebut)

    return filtered
  }, [paiementsAdmin, searchQuery, statutFilter, methodeFilter, dateRange])

  // Statistiques
  const stats = useMemo(() => {
    const total = filteredPaiements.length
    const totalMontant = filteredPaiements.reduce((sum, p) => sum + p.montant, 0)
    const successCount = filteredPaiements.filter(p => p.statut === "success").length
    const pendingCount = filteredPaiements.filter(p => p.statut === "pending").length
    const failedCount = filteredPaiements.filter(p => p.statut === "failed").length
    
    return {
      total,
      totalMontant,
      successCount,
      pendingCount,
      failedCount,
      tauxSuccess: total > 0 ? (successCount / total) * 100 : 0
    }
  }, [filteredPaiements])

  const getStatutBadge = (statut: string) => {
    switch (statut) {
      case "success":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Réussi</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">En attente</Badge>
      case "failed":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Échoué</Badge>
      default:
        return null
    }
  }

  const getMethodeText = (methode: string) => {
    switch (methode) {
      case "mobile_money":
        return "Mobile Money"
      case "carte_credit":
        return "Carte de crédit"
      case "virement_bancaire":
        return "Virement bancaire"
      case "especes":
        return "Espèces"
      default:
        return methode
    }
  }

  const getMethodeIcon = (methode: string) => {
    switch (methode) {
      case "mobile_money":
        return "📱"
      case "carte_credit":
        return "💳"
      case "virement_bancaire":
        return "🏦"
      case "especes":
        return "💵"
      default:
        return "💰"
    }
  }

  const exportTransactions = () => {
    const csvContent = [
      ["Date", "Référence", "Utilisateur", "Parcelle", "Montant (FCFA)", "Méthode", "Statut"],
      ...filteredPaiements.map(p => [
        new Date(p.date).toLocaleDateString("fr-FR"),
        p.reference,
        p.utilisateur?.nom,
        p.parcelle?.numero,
        p.montant.toLocaleString("fr-FR"),
        getMethodeText(p.methode),
        p.statut === "success" ? "Réussi" : p.statut === "pending" ? "En attente" : "Échoué"
      ])
    ].map(row => row.join(",")).join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <AppLayout user={adminUser}>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Administration des Paiements</h1>
          <p className="text-sm text-gray-600">Surveillance et gestion de toutes les transactions</p>
        </div>

        {/* Cartes de statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Transactions totales</p>
                  <p className="text-3xl font-bold">{stats.total}</p>
                  <div className="flex gap-2 mt-2">
                    <span className="text-xs text-green-600">{stats.successCount} réussies</span>
                    <span className="text-xs text-yellow-600">{stats.pendingCount} en attente</span>
                  </div>
                </div>
                <div className="bg-blue-100 p-3 rounded-lg">
                  <CreditCard className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Volume total</p>
                  <p className="text-2xl font-bold text-green-600">{(stats.totalMontant / 1000000).toFixed(1)}M</p>
                  <p className="text-xs text-gray-600 mt-1">FCFA</p>
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
                  <p className="text-sm text-gray-600 mb-1">Taux de réussite</p>
                  <p className="text-3xl font-bold text-green-600">{Math.round(stats.tauxSuccess)}%</p>
                  <p className="text-xs text-gray-600 mt-1">
                    {stats.failedCount > 0 && `${stats.failedCount} échecs`}
                  </p>
                </div>
                <div className="bg-emerald-100 p-3 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Utilisateurs actifs</p>
                  <p className="text-3xl font-bold">{new Set(filteredPaiements.map(p => p.userId)).size}</p>
                  <p className="text-xs text-green-600 mt-1">Ce mois</p>
                </div>
                <div className="bg-purple-100 p-3 rounded-lg">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tableau des transactions */}
        <Card>
          <CardHeader>
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <CardTitle>Transactions des Utilisateurs</CardTitle>
                <CardDescription>
                  {filteredPaiements.length} transaction(s) trouvée(s) sur {paiementsAdmin.length} au total
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={exportTransactions}>
                  <Download className="h-4 w-4 mr-2" />
                  Exporter CSV
                </Button>
              </div>
            </div>

            {/* Filtres */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Rechercher utilisateur, parcelle, référence..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <select
                value={statutFilter}
                onChange={(e) => setStatutFilter(e.target.value)}
                className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="all">Tous les statuts</option>
                <option value="success">Réussi</option>
                <option value="pending">En attente</option>
                <option value="failed">Échoué</option>
              </select>

              <select
                value={methodeFilter}
                onChange={(e) => setMethodeFilter(e.target.value)}
                className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="all">Toutes les méthodes</option>
                <option value="mobile_money">Mobile Money</option>
                <option value="carte_credit">Carte de crédit</option>
                <option value="virement_bancaire">Virement bancaire</option>
                <option value="especes">Espèces</option>
              </select>

              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="7j">7 derniers jours</option>
                <option value="30j">30 derniers jours</option>
                <option value="90j">3 derniers mois</option>
                <option value="1an">Cette année</option>
                <option value="all">Toutes les dates</option>
              </select>
            </div>
          </CardHeader>
          <CardContent>
            {filteredPaiements.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date & Heure</TableHead>
                      <TableHead>Utilisateur</TableHead>
                      <TableHead>Parcelle</TableHead>
                      <TableHead className="text-right">Montant</TableHead>
                      <TableHead>Méthode</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Référence</TableHead>
                      <TableHead className="text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPaiements.map((paiement) => (
                      <TableRow key={paiement.id} className={
                        paiement.statut === "failed" ? "bg-red-50 hover:bg-red-100" :
                        paiement.statut === "pending" ? "bg-yellow-50 hover:bg-yellow-100" :
                        "hover:bg-gray-50"
                      }>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <div>
                              <div className="font-medium text-sm">
                                {new Date(paiement.date).toLocaleDateString("fr-FR")}
                              </div>
                              <div className="text-xs text-gray-500">
                                {new Date(paiement.date).toLocaleTimeString("fr-FR", { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-400" />
                            <div>
                              <div className="font-medium">{paiement.utilisateur?.nom}</div>
                              <div className="text-xs text-gray-500">{paiement.utilisateur?.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <div>
                              <div className="font-medium">{paiement.parcelle?.numero}</div>
                              <div className="text-xs text-gray-500 max-w-[150px] truncate">
                                {paiement.parcelle?.adresse}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="font-bold text-green-600">
                            {paiement.montant.toLocaleString("fr-FR")} FCFA
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{getMethodeIcon(paiement.methode)}</span>
                            <span className="text-sm">{getMethodeText(paiement.methode)}</span>
                          </div>
                        </TableCell>
                        <TableCell>{getStatutBadge(paiement.statut)}</TableCell>
                        <TableCell>
                          <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                            {paiement.reference}
                          </code>
                        </TableCell>
                        <TableCell className="text-center">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <CreditCard className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <p className="text-lg font-semibold mb-2">Aucune transaction trouvée</p>
                <p className="text-sm">Aucune transaction ne correspond à vos critères de recherche</p>
              </div>
            )}

            {/* Résumé des filtres */}
            {filteredPaiements.length > 0 && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-gray-600">
                  <div>
                    <strong>Volume total filtré :</strong> {(stats.totalMontant / 1000000).toFixed(2)}M FCFA
                  </div>
                  <div className="flex gap-4">
                    <span>✅ {stats.successCount} réussies</span>
                    <span>⏳ {stats.pendingCount} en attente</span>
                    <span>❌ {stats.failedCount} échecs</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}