// Types pour l'application de gestion fiscale foncière

export interface Parcelle {
  id: string
  numero: string
  superficie: number // en m²
  adresse: string
  quartier: string
  arrondissement: string
  coordinates: [number, number] // [latitude, longitude]
  proprietaireId: string
  proprietaireNom: string
  proprietaireEmail: string
  proprietaireTelephone: string
  valeurFiscale: number // en FCFA
  impotAnnuel: number // en FCFA
  statut: "a_jour" | "en_retard" | "impaye"
  dernierPaiement?: string // date ISO
  prochainePaiement: string // date ISO
  anneesImpayees: number
  montantDu: number // en FCFA
}

export interface Paiement {
  id: string
  parcelleId: string
  montant: number
  date: string
  methode: "carte" | "mobile_money" | "virement"
  statut: "en_attente" | "complete" | "echoue"
  reference: string
}

export interface User {
  id: string
  nom: string
  prenom: string
  email: string
  telephone: string
  role: "usager" | "admin"
  parcelles: string[] // IDs des parcelles
}
