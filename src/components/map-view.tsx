"use client"

import { useEffect, useRef, useState } from "react"
import type { Parcelle } from "@/lib/types"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { X, MapPin, Home, DollarSign } from "lucide-react"
import Link from "next/link"

interface MapViewProps {
  parcelles: Parcelle[]
  selectedParcelleId?: string
  onParcelleSelect?: (parcelle: Parcelle) => void
}

export function MapView({ parcelles, selectedParcelleId, onParcelleSelect }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<any>(null)
  const [selectedParcelle, setSelectedParcelle] = useState<Parcelle | null>(null)
  const markersRef = useRef<any[]>([])

  useEffect(() => {
    if (typeof window === "undefined") return

    // Dynamically import Leaflet
    import("leaflet").then((L) => {
      if (!mapRef.current || map) return

      // Initialize map centered on Yaoundé
      const newMap = L.map(mapRef.current).setView([3.8667, 11.5167], 13)

      // Add OpenStreetMap tiles
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(newMap)

      setMap(newMap)

      // Add markers for each parcelle
      parcelles.forEach((parcelle) => {
        const color = parcelle.statut === "a_jour" ? "green" : parcelle.statut === "en_retard" ? "orange" : "red"

        const icon = L.divIcon({
          className: "custom-marker",
          html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        })

        const marker = L.marker(parcelle.coordinates, { icon })
          .addTo(newMap)
          .on("click", () => {
            setSelectedParcelle(parcelle)
            if (onParcelleSelect) {
              onParcelleSelect(parcelle)
            }
          })

        markersRef.current.push(marker)
      })

      return () => {
        newMap.remove()
      }
    })
  }, [])

  useEffect(() => {
    if (selectedParcelleId && map) {
      const parcelle = parcelles.find((p) => p.id === selectedParcelleId)
      if (parcelle) {
        setSelectedParcelle(parcelle)
        map.setView(parcelle.coordinates, 16)
      }
    }
  }, [selectedParcelleId, map, parcelles])

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
    <div className="relative w-full h-full">
      <div ref={mapRef} className="w-full h-full rounded-lg" />

      {selectedParcelle && (
        <Card className="absolute bottom-4 left-4 right-4 md:left-4 md:right-auto md:w-96 p-4 shadow-lg z-[1000]">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-bold text-lg">{selectedParcelle.numero}</h3>
              <p className="text-sm text-muted-foreground">{selectedParcelle.adresse}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setSelectedParcelle(null)}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Statut</span>
              {getStatutBadge(selectedParcelle.statut)}
            </div>

            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>
                {selectedParcelle.quartier}, {selectedParcelle.arrondissement}
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <Home className="h-4 w-4 text-muted-foreground" />
              <span>{selectedParcelle.superficie} m²</span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="font-semibold">{selectedParcelle.impotAnnuel.toLocaleString("fr-FR")} FCFA/an</span>
            </div>

            {selectedParcelle.montantDu > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm font-semibold text-red-800">
                  Montant dû: {selectedParcelle.montantDu.toLocaleString("fr-FR")} FCFA
                </p>
                <p className="text-xs text-red-600 mt-1">{selectedParcelle.anneesImpayees} année(s) impayée(s)</p>
              </div>
            )}

            <Button asChild className="w-full bg-emerald-600 hover:bg-emerald-700">
              <Link href={`/parcelle/${selectedParcelle.id}`}>Voir les détails</Link>
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}
