"use client"

import type React from "react"
import { use, useState } from "react"
import { AppLayout } from "@/components/app-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { mockParcelles, mockUsers } from "@/lib/mock-data"
import { CreditCard, Smartphone, Building, ArrowLeft, CheckCircle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function PaiementPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const parcelle = mockParcelles.find((p) => p.id === id)
  const currentUser = mockUsers[0]

  const [paymentMethod, setPaymentMethod] = useState<"carte" | "mobile_money" | "virement">("carte")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  if (!parcelle) {
    return (
      <AppLayout user={currentUser}>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Parcelle non trouvée</h1>
            <Button asChild>
              <Link href="/dashboard">Retour au tableau de bord</Link>
            </Button>
          </div>
        </div>
      </AppLayout>
    )
  }

  const montantAPayer = parcelle.montantDu > 0 ? parcelle.montantDu : parcelle.impotAnnuel

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    setTimeout(() => {
      setLoading(false)
      setSuccess(true)

      // Redirection après 2 secondes
      setTimeout(() => {
        router.push("/dashboard")
      }, 2000)
    }, 2000)
  }

  if (success) {
    return (
      <AppLayout user={currentUser}>
        <div className="flex items-center justify-center h-full">
          <Card className="max-w-md w-full mx-4">
            <CardContent className="pt-6 text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Paiement Réussi!</h2>
              <p className="text-gray-600 mb-6">
                Votre paiement de {montantAPayer.toLocaleString("fr-FR")} FCFA a été effectué avec succès.
              </p>
              <Button asChild className="w-full bg-emerald-600 hover:bg-emerald-700">
                <Link href="/dashboard">Retour au tableau de bord</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout user={currentUser}>
      <div className="p-6">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Payment Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Paiement de l'Impôt Foncier</CardTitle>
                <CardDescription>Choisissez votre méthode de paiement et complétez la transaction</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Payment Method Selection */}
                  <div className="space-y-3">
                    <Label>Méthode de Paiement</Label>
                    <RadioGroup value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)}>
                      <div className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-gray-50">
                        <RadioGroupItem value="carte" id="carte" />
                        <Label htmlFor="carte" className="flex items-center gap-3 cursor-pointer flex-1">
                          <CreditCard className="h-5 w-5 text-gray-600" />
                          <div>
                            <p className="font-semibold">Carte Bancaire</p>
                            <p className="text-sm text-gray-600">Visa, Mastercard</p>
                          </div>
                        </Label>
                      </div>

                      <div className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-gray-50">
                        <RadioGroupItem value="mobile_money" id="mobile_money" />
                        <Label htmlFor="mobile_money" className="flex items-center gap-3 cursor-pointer flex-1">
                          <Smartphone className="h-5 w-5 text-gray-600" />
                          <div>
                            <p className="font-semibold">Mobile Money</p>
                            <p className="text-sm text-gray-600">MTN, Orange Money</p>
                          </div>
                        </Label>
                      </div>

                      <div className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-gray-50">
                        <RadioGroupItem value="virement" id="virement" />
                        <Label htmlFor="virement" className="flex items-center gap-3 cursor-pointer flex-1">
                          <Building className="h-5 w-5 text-gray-600" />
                          <div>
                            <p className="font-semibold">Virement Bancaire</p>
                            <p className="text-sm text-gray-600">Transfert direct</p>
                          </div>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Payment Details */}
                  {paymentMethod === "carte" && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="cardNumber">Numéro de Carte</Label>
                        <Input id="cardNumber" placeholder="1234 5678 9012 3456" required />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="expiry">Date d'Expiration</Label>
                          <Input id="expiry" placeholder="MM/AA" required />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="cvv">CVV</Label>
                          <Input id="cvv" placeholder="123" maxLength={3} required />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="cardName">Nom sur la Carte</Label>
                        <Input id="cardName" placeholder="JEAN MBARGA" required />
                      </div>
                    </div>
                  )}

                  {paymentMethod === "mobile_money" && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="mobileNumber">Numéro de Téléphone</Label>
                        <Input id="mobileNumber" placeholder="+237 6 XX XX XX XX" required />
                      </div>

                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm text-blue-800">
                          Vous recevrez une notification sur votre téléphone pour confirmer le paiement.
                        </p>
                      </div>
                    </div>
                  )}

                  {paymentMethod === "virement" && (
                    <div className="bg-gray-50 border rounded-lg p-4 space-y-2">
                      <p className="font-semibold">Informations Bancaires</p>
                      <p className="text-sm text-gray-600">Banque: Banque Centrale du Cameroun</p>
                      <p className="text-sm text-gray-600">IBAN: CM21 1234 5678 9012 3456 7890 12</p>
                      <p className="text-sm text-gray-600">Référence: {parcelle.numero}</p>
                    </div>
                  )}

                  <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={loading}>
                    {loading ? "Traitement en cours..." : `Payer ${montantAPayer.toLocaleString("fr-FR")} FCFA`}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Récapitulatif</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Parcelle</p>
                  <p className="font-semibold">{parcelle.numero}</p>
                  <p className="text-sm text-gray-600">{parcelle.adresse}</p>
                </div>

                <div className="border-t pt-4">
                  <p className="text-sm text-gray-600 mb-1">Impôt Annuel</p>
                  <p className="font-semibold">{parcelle.impotAnnuel.toLocaleString("fr-FR")} FCFA</p>
                </div>

                {parcelle.montantDu > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm text-red-600 mb-1">Arriérés</p>
                    <p className="font-semibold text-red-800">
                      {(parcelle.montantDu - parcelle.impotAnnuel).toLocaleString("fr-FR")} FCFA
                    </p>
                    <p className="text-xs text-red-600 mt-1">{parcelle.anneesImpayees - 1} année(s) précédente(s)</p>
                  </div>
                )}

                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">Total à Payer</span>
                    <span className="text-2xl font-bold text-emerald-600">
                      {montantAPayer.toLocaleString("fr-FR")} FCFA
                    </span>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-600">
                  <p>Paiement sécurisé par cryptage SSL</p>
                  <p className="mt-1">Vos données sont protégées</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
