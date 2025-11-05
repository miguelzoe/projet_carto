"use client"
import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MapPin, Search, Map, List, Info, Loader2, DollarSign, Calendar, Home, CheckCircle, AlertCircle, Clock, CreditCard, FileText, TrendingUp, Phone, Building2, User, Hash } from "lucide-react";

const API_BASE_URL = "https://gestion-fonciere-1.onrender.com";

const AppLayout = ({ user, children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <header className="bg-white shadow-lg border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-lg">
                <Home className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Système de Gestion Foncière
                </h2>
                <p className="text-sm text-gray-500">Commune de Biyem-Assi, Yaoundé</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-sm text-gray-600">Connecté en tant que</div>
                <div className="font-semibold text-gray-900">{user.nom}</div>
              </div>
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold">
                {user.nom.split(' ').map(n => n[0]).join('')}
              </div>
            </div>
          </div>
        </div>
      </header>
      <main className="p-6">{children}</main>
    </div>
  );
};

export default function MesParcellesPage() {
  const currentUser = { id: "1", nom: "Jean-Paul Mbarga", email: "jp.mbarga@example.cm" };
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("list");
  const [parcelles, setParcelles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedParcelle, setSelectedParcelle] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("mobile");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [paymentPlan, setPaymentPlan] = useState("total");
  const [customAmount, setCustomAmount] = useState("");
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [detailsParcelle, setDetailsParcelle] = useState(null);
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const layersRef = useRef([]);

  useEffect(() => {
    const fetchLargestParcelles = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/api/largest`);
        const data = await response.json();
        
        if (data.success && data.largest_parcels) {
          const transformedParcelles = data.largest_parcels.map((feature, index) => {
            let statut = "a_jour";
            let paiementEffectue = 0;
            
            if (index === 0) {
              statut = "impaye";
              paiementEffectue = 0;
            } else if (index === 1) {
              statut = "en_retard";
              paiementEffectue = 40;
            } else {
              statut = "a_jour";
              paiementEffectue = 100;
            }

            const superficie = feature.properties.area_ha * 10000;
            const tarifParM2 = 150;
            const impotAnnuel = Math.round(superficie * tarifParM2);
            let montantDu = 0;
            
            if (statut === "impaye") {
              montantDu = impotAnnuel;
            } else if (statut === "en_retard") {
              montantDu = Math.round(impotAnnuel * 0.6);
            }

            let coordinates = [];
            if (feature.geometry && feature.geometry.coordinates) {
              if (feature.geometry.type === "Polygon") {
                coordinates = feature.geometry.coordinates[0].map((coord) => [coord[1], coord[0]]);
              } else if (feature.geometry.type === "MultiPolygon") {
                coordinates = feature.geometry.coordinates[0][0].map((coord) => [coord[1], coord[0]]);
              }
            }
            
            return {
              id: `P${String(index + 1).padStart(3, '0')}`,
              numero: `PARC-BA-2024-${String(feature.properties.rank).padStart(3, '0')}`,
              numeroTitreFoncier: `TF-${Math.floor(Math.random() * 90000) + 10000}-YDE`,
              proprietaire: currentUser.nom,
              adresse: `Rue ${index + 1}, Bloc ${String.fromCharCode(65 + index)}`,
              quartier: "Biyem-Assi",
              secteur: `Secteur ${index + 1}`,
              superficie: Math.round(superficie),
              superficieHa: feature.properties.area_ha,
              impotAnnuel: impotAnnuel,
              valeurFiscale: impotAnnuel * 100,
              montantDu: montantDu,
              montantPaye: impotAnnuel - montantDu,
              statut: statut,
              paiementEffectue: paiementEffectue,
              coordinates: coordinates,
              properties: feature.properties,
              rank: feature.properties.rank,
              dernierPaiement: statut === "a_jour" ? "2024-10-15" : 
                               statut === "en_retard" ? "2024-06-20" : null,
              prochainPaiement: "2025-01-31",
              dateAcquisition: `201${5 + index}-03-${10 + index}`,
              usage: index === 0 ? "Résidentiel" : index === 1 ? "Commercial" : "Agricole",
              penalites: statut === "impaye" ? Math.round(montantDu * 0.1) : 
                        statut === "en_retard" ? Math.round(montantDu * 0.05) : 0
            };
          });
          
          setParcelles(transformedParcelles);
          setError(null);
        } else {
          setError("Aucune donnée disponible depuis l'API");
        }
      } catch (err) {
        console.error("Erreur:", err);
        setError("Erreur de connexion à l'API. Vérifiez que le serveur Flask est démarré.");
      } finally {
        setLoading(false);
      }
    };

    fetchLargestParcelles();
  }, []);

  const filteredParcelles = parcelles.filter(
    (parcelle) =>
      parcelle.numero.toLowerCase().includes(searchQuery.toLowerCase()) ||
      parcelle.adresse.toLowerCase().includes(searchQuery.toLowerCase()) ||
      parcelle.quartier.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatutBadge = (statut, paiementEffectue) => {
    switch (statut) {
      case "a_jour":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100 flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            À jour (100%)
          </Badge>
        );
      case "en_retard":
        return (
          <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            En retard ({paiementEffectue}% payé)
          </Badge>
        );
      case "impaye":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            Impayé (0%)
          </Badge>
        );
      default:
        return null;
    }
  };

  const getParcelleColor = (statut) => {
    switch (statut) {
      case "a_jour":
        return { color: '#16a34a', fillColor: '#22c55e' };
      case "en_retard":
        return { color: '#ea580c', fillColor: '#fb923c' };
      case "impaye":
        return { color: '#dc2626', fillColor: '#ef4444' };
      default:
        return { color: '#6b7280', fillColor: '#9ca3af' };
    }
  };

  const handlePayment = (parcelle) => {
    setSelectedParcelle(parcelle);
    setPaymentAmount(parcelle.montantDu);
    setPaymentPlan("total");
    setCustomAmount("");
    setShowPaymentModal(true);
    setPhoneNumber("");
  };

  const processPayment = () => {
    if (!phoneNumber && paymentMethod === "mobile") {
      alert("Veuillez entrer un numéro de téléphone");
      return;
    }

    if (selectedParcelle) {
      let amountToPay = paymentAmount;
      
      if (paymentPlan === "partial") {
        amountToPay = Math.round(selectedParcelle.montantDu * 0.3);
      } else if (paymentPlan === "custom" && customAmount) {
        amountToPay = parseInt(customAmount);
      }

      const newPaiementEffectue = Math.min(100, 
        Math.round(((selectedParcelle.montantPaye + amountToPay) / selectedParcelle.impotAnnuel) * 100)
      );

      const updatedParcelles = parcelles.map(p => {
        if (p.id === selectedParcelle.id) {
          const newMontantDu = Math.max(0, p.montantDu - amountToPay);
          const newMontantPaye = p.montantPaye + amountToPay;
          
          return {
            ...p,
            montantDu: newMontantDu,
            montantPaye: newMontantPaye,
            statut: newMontantDu === 0 ? "a_jour" : "en_retard",
            paiementEffectue: newPaiementEffectue,
            dernierPaiement: new Date().toISOString().split('T')[0],
            penalites: newMontantDu === 0 ? 0 : Math.round(newMontantDu * 0.05)
          };
        }
        return p;
      });
      
      setParcelles(updatedParcelles);
      setShowPaymentModal(false);
      setSelectedParcelle(null);
      
      alert(`Paiement de ${amountToPay.toLocaleString("fr-FR")} FCFA effectué avec succès pour la parcelle ${selectedParcelle.numero}`);
    }
  };

  const showParcelleDetails = (parcelle) => {
    setDetailsParcelle(parcelle);
    setShowDetailsModal(true);
  };

  const getTotalStats = () => {
    const total = parcelles.reduce((acc, p) => acc + p.impotAnnuel, 0);
    const paye = parcelles.reduce((acc, p) => acc + p.montantPaye, 0);
    const du = parcelles.reduce((acc, p) => acc + p.montantDu, 0);
    const superficieTotale = parcelles.reduce((acc, p) => acc + p.superficie, 0);
    
    return { total, paye, du, superficieTotale };
  };

  useEffect(() => {
    if (viewMode !== "map" || !mapRef.current || parcelles.length === 0) return;

    const initMap = () => {
      if (typeof window.L === 'undefined') return;

      if (map) {
        map.remove();
      }

      // Initialiser la carte avec OpenStreetMap
      const leafletMap = window.L.map(mapRef.current, {
        zoomControl: true,
        attributionControl: true
      }).setView([3.8680, 11.5211], 14);

      // Utiliser OpenStreetMap au lieu d'Esri
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
      }).addTo(leafletMap);

      setMap(leafletMap);

      layersRef.current.forEach(layer => leafletMap.removeLayer(layer));
      layersRef.current = [];

      parcelles.forEach((parcelle) => {
        if (parcelle.coordinates && parcelle.coordinates.length > 0) {
          const colors = getParcelleColor(parcelle.statut);
          const polygon = window.L.polygon(parcelle.coordinates, {
            color: colors.color,
            fillColor: colors.fillColor,
            fillOpacity: 0.6,
            weight: 3
          }).addTo(leafletMap);

          // Popup simplifiée avec les infos essentielles
          const popupContent = `
            <div style="width: 280px; font-family: system-ui, -apple-system, sans-serif;">
              <div style="background: linear-gradient(135deg, ${colors.color} 0%, ${colors.fillColor} 100%); 
                          padding: 12px; margin: -15px -20px 12px -20px; border-radius: 8px 8px 0 0;">
                <h3 style="margin: 0; color: white; font-size: 16px; font-weight: 600;">
                  ${parcelle.numero}
                </h3>
                <p style="margin: 2px 0 0 0; color: rgba(255,255,255,0.9); font-size: 12px;">
                  ${parcelle.rank}ème plus grande parcelle
                </p>
              </div>
              
              <div style="padding: 0 5px;">
                <!-- Informations principales -->
                <div style="display: grid; gap: 8px; margin-bottom: 12px;">
                  <div style="display: flex; align-items: center; gap: 8px; padding: 8px; background: #f8fafc; border-radius: 6px;">
                    <span style="color: #6b7280; font-size: 20px;">📏</span>
                    <div>
                      <div style="font-size: 11px; color: #6b7280;">Superficie</div>
                      <div style="font-size: 14px; font-weight: 600; color: #1f2937;">
                        ${parcelle.superficie.toLocaleString("fr-FR")} m²
                      </div>
                    </div>
                  </div>
                  
                  <div style="display: flex; align-items: center; gap: 8px; padding: 8px; background: #f8fafc; border-radius: 6px;">
                    <span style="color: #6b7280; font-size: 20px;">👤</span>
                    <div>
                      <div style="font-size: 11px; color: #6b7280;">Propriétaire</div>
                      <div style="font-size: 14px; font-weight: 600; color: #1f2937;">
                        ${parcelle.proprietaire}
                      </div>
                    </div>
                  </div>
                  
                  <div style="display: flex; align-items: center; gap: 8px; padding: 8px; background: #f8fafc; border-radius: 6px;">
                    <span style="color: #6b7280; font-size: 20px;">💰</span>
                    <div>
                      <div style="font-size: 11px; color: #6b7280;">Montant dû</div>
                      <div style="font-size: 14px; font-weight: 600; color: ${parcelle.montantDu > 0 ? '#dc2626' : '#16a34a'};">
                        ${parcelle.montantDu.toLocaleString("fr-FR")} FCFA
                      </div>
                    </div>
                  </div>
                  
                  <div style="display: flex; align-items: center; gap: 8px; padding: 8px; background: #f8fafc; border-radius: 6px;">
                    <span style="color: #6b7280; font-size: 20px;">📊</span>
                    <div>
                      <div style="font-size: 11px; color: #6b7280;">Statut</div>
                      <div style="font-size: 14px; font-weight: 600; color: ${colors.color};">
                        ${parcelle.paiementEffectue}% payé
                      </div>
                    </div>
                  </div>
                </div>
                
                <!-- Boutons d'action -->
                <div style="display: flex; gap: 8px;">
                  <button onclick="window.showDetails('${parcelle.id}')" 
                    style="flex: 1; background: #f3f4f6; color: #1f2937; border: 1px solid #d1d5db; 
                           padding: 8px; border-radius: 6px; font-size: 13px; font-weight: 500; cursor: pointer;">
                    ℹ️ Détails
                  </button>
                  ${parcelle.montantDu > 0 ? `
                  <button onclick="window.handleMapPayment('${parcelle.id}')" 
                    style="flex: 1; background: linear-gradient(135deg, ${colors.color} 0%, ${colors.fillColor} 100%); 
                           color: white; border: none; padding: 8px; border-radius: 6px; 
                           font-size: 13px; font-weight: 500; cursor: pointer;">
                    💳 Payer
                  </button>
                  ` : ''}
                </div>
              </div>
            </div>
          `;

          polygon.bindPopup(popupContent, { maxWidth: 300 });
          
          polygon.on('mouseover', function() {
            this.setStyle({ weight: 5, fillOpacity: 0.8 });
          });
          
          polygon.on('mouseout', function() {
            this.setStyle({ weight: 3, fillOpacity: 0.6 });
          });

          layersRef.current.push(polygon);
        }
      });

      // Exposer les fonctions au contexte global
      window.handleMapPayment = (parcelleId) => {
        const parcelle = parcelles.find(p => p.id === parcelleId);
        if (parcelle) {
          handlePayment(parcelle);
        }
      };

      window.showDetails = (parcelleId) => {
        const parcelle = parcelles.find(p => p.id === parcelleId);
        if (parcelle) {
          showParcelleDetails(parcelle);
        }
      };

      if (layersRef.current.length > 0) {
        const group = window.L.featureGroup(layersRef.current);
        leafletMap.fitBounds(group.getBounds(), { padding: [50, 50] });
      }
    };

    if (typeof window.L !== 'undefined') {
      initMap();
      return;
    }

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.async = true;
    
    script.onload = () => {
      setTimeout(initMap, 100);
    };

    document.head.appendChild(script);

    return () => {
      if (map) map.remove();
      window.handleMapPayment = undefined;
      window.showDetails = undefined;
    };
  }, [viewMode, map, parcelles]);

  const stats = getTotalStats();

  return (
    <AppLayout user={currentUser}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Gestion des Parcelles Foncières
          </h1>
          <p className="text-gray-600">
            Système de suivi et de paiement des impôts fonciers - Commune de Biyem-Assi
          </p>
        </div>

        {/* Cartes de statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 text-sm font-medium">Superficie totale</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {(stats.superficieTotale / 10000).toFixed(2)} ha
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-600 text-sm font-medium">Impôt annuel total</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {(stats.total / 1000000).toFixed(1)}M FCFA
                  </p>
                </div>
                <FileText className="h-8 w-8 text-purple-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-gradient-to-br from-green-50 to-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 text-sm font-medium">Montant payé</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {(stats.paye / 1000000).toFixed(1)}M FCFA
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-red-200 bg-gradient-to-br from-red-50 to-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-600 text-sm font-medium">Montant dû</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {(stats.du / 1000000).toFixed(1)}M FCFA
                  </p>
                </div>
                <AlertCircle className="h-8 w-8 text-red-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-xl">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">Mes Trois Plus Grandes Parcelles</CardTitle>
                <CardDescription className="mt-1">
                  {loading ? "Chargement en cours..." : `${parcelles.length} parcelles classées par superficie`}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="flex items-center gap-2"
                  disabled={loading}
                >
                  <List className="h-4 w-4" />
                  Liste
                </Button>
                <Button
                  variant={viewMode === "map" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("map")}
                  className="flex items-center gap-2"
                  disabled={loading}
                >
                  <Map className="h-4 w-4" />
                  Carte
                </Button>
              </div>
            </div>

            {viewMode === "list" && !loading && (
              <div className="relative mt-4">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Rechercher une parcelle..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            )}
          </CardHeader>
          
          <CardContent className="p-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Loader2 className="h-12 w-12 animate-spin text-blue-500 mb-4" />
                <p className="text-gray-600 text-lg">Chargement des données...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-16">
                <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
                <p className="text-gray-900 font-semibold mb-2">Erreur de connexion</p>
                <p className="text-gray-600 text-center max-w-md">{error}</p>
                <Button 
                  onClick={() => window.location.reload()} 
                  className="mt-4"
                  variant="outline"
                >
                  Réessayer
                </Button>
              </div>
            ) : viewMode === "list" ? (
              <div className="space-y-6">
                {filteredParcelles.length === 0 ? (
                  <div className="text-center py-16 text-gray-500">
                    Aucune parcelle trouvée
                  </div>
                ) : (
                  filteredParcelles.map((parcelle) => (
                    <div key={parcelle.id} className="border-2 rounded-xl p-6 hover:shadow-xl transition-all bg-white hover:border-blue-200">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-4">
                          <div className={`p-3 rounded-xl ${
                            parcelle.rank === 1 ? 'bg-gradient-to-br from-red-100 to-red-50 text-red-600' :
                            parcelle.rank === 2 ? 'bg-gradient-to-br from-orange-100 to-orange-50 text-orange-600' :
                            'bg-gradient-to-br from-green-100 to-green-50 text-green-600'
                          }`}>
                            <Home className="h-7 w-7" />
                          </div>
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-bold text-2xl text-gray-900">{parcelle.numero}</h4>
                              <Badge variant="outline" className={`border-2 ${
                                parcelle.rank === 1 ? 'border-red-300 bg-red-50 text-red-700' :
                                parcelle.rank === 2 ? 'border-orange-300 bg-orange-50 text-orange-700' :
                                'border-green-300 bg-green-50 text-green-700'
                              }`}>
                                {parcelle.rank}ème plus grande
                              </Badge>
                              {getStatutBadge(parcelle.statut, parcelle.paiementEffectue)}
                            </div>
                            <div className="space-y-1">
                              <p className="text-sm text-gray-600 flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {parcelle.adresse}
                              </p>
                              <p className="text-sm text-gray-500">
                                {parcelle.quartier}, {parcelle.secteur}
                              </p>
                              <p className="text-sm text-gray-500 flex items-center gap-1">
                                <Hash className="h-3 w-3" />
                                Titre foncier: {parcelle.numeroTitreFoncier}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Barre de progression du paiement */}
                      <div className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-700">Progression du paiement</span>
                          <span className="text-sm font-bold text-gray-900">{parcelle.paiementEffectue}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all ${
                              parcelle.statut === "a_jour" ? 'bg-gradient-to-r from-green-500 to-green-600' :
                              parcelle.statut === "en_retard" ? 'bg-gradient-to-r from-orange-500 to-orange-600' :
                              'bg-gradient-to-r from-red-500 to-red-600'
                            }`}
                            style={{ width: `${parcelle.paiementEffectue}%` }}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl">
                          <p className="text-xs text-blue-700 font-semibold uppercase tracking-wide">Superficie</p>
                          <p className="font-bold text-xl text-blue-900 mt-1">{parcelle.superficie.toLocaleString("fr-FR")} m²</p>
                          <p className="text-sm text-blue-600">{parcelle.superficieHa} hectares</p>
                        </div>
                        
                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl">
                          <p className="text-xs text-purple-700 font-semibold uppercase tracking-wide">Impôt annuel</p>
                          <p className="font-bold text-xl text-purple-900 mt-1">{(parcelle.impotAnnuel / 1000000).toFixed(2)}M</p>
                          <p className="text-sm text-purple-600">FCFA</p>
                        </div>
                        
                        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-4 rounded-xl">
                          <p className="text-xs text-indigo-700 font-semibold uppercase tracking-wide">Valeur fiscale</p>
                          <p className="font-bold text-xl text-indigo-900 mt-1">{(parcelle.valeurFiscale / 1000000).toFixed(1)}M</p>
                          <p className="text-sm text-indigo-600">FCFA</p>
                        </div>
                        
                        <div className={`p-4 rounded-xl ${
                          parcelle.montantDu > 0 
                            ? 'bg-gradient-to-br from-red-50 to-red-100' 
                            : 'bg-gradient-to-br from-green-50 to-green-100'
                        }`}>
                          <p className={`text-xs font-semibold uppercase tracking-wide ${
                            parcelle.montantDu > 0 ? 'text-red-700' : 'text-green-700'
                          }`}>
                            Montant dû
                          </p>
                          <p className={`font-bold text-xl mt-1 ${
                            parcelle.montantDu > 0 ? 'text-red-900' : 'text-green-900'
                          }`}>
                            {parcelle.montantDu > 0 ? `${(parcelle.montantDu / 1000000).toFixed(2)}M` : "0"}
                          </p>
                          <p className={`text-sm ${
                            parcelle.montantDu > 0 ? 'text-red-600' : 'text-green-600'
                          }`}>
                            {parcelle.montantDu > 0 ? "FCFA" : "Payé"}
                          </p>
                        </div>
                      </div>

                      {/* Informations supplémentaires */}
                      {parcelle.penalites > 0 && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                          <p className="text-sm text-red-800">
                            <AlertCircle className="inline h-4 w-4 mr-1" />
                            Pénalités de retard: {parcelle.penalites.toLocaleString("fr-FR")} FCFA
                          </p>
                        </div>
                      )}

                      {/* Informations de paiement */}
                      <div className="bg-gray-50 rounded-xl p-4 mb-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <p className="text-xs text-gray-500 font-semibold">Usage</p>
                            <p className="text-sm font-medium text-gray-900">{parcelle.usage}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 font-semibold">Date acquisition</p>
                            <p className="text-sm font-medium text-gray-900">
                              {new Date(parcelle.dateAcquisition).toLocaleDateString("fr-FR")}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 font-semibold">Dernier paiement</p>
                            <p className="text-sm font-medium text-gray-900">
                              {parcelle.dernierPaiement 
                                ? new Date(parcelle.dernierPaiement).toLocaleDateString("fr-FR")
                                : "Aucun"}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 font-semibold">Échéance</p>
                            <p className="text-sm font-medium text-gray-900">
                              {new Date(parcelle.prochainPaiement).toLocaleDateString("fr-FR")}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex items-center gap-2 hover:bg-gray-50"
                          onClick={() => showParcelleDetails(parcelle)}
                        >
                          <Info className="h-4 w-4" />
                          Voir détails
                        </Button>
                        
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex items-center gap-2 hover:bg-gray-50"
                        >
                          <FileText className="h-4 w-4" />
                          Historique
                        </Button>
                        
                        {parcelle.montantDu > 0 && (
                          <Button 
                            size="sm" 
                            className={`flex items-center gap-2 flex-1 ${
                              parcelle.rank === 1 ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800' :
                              parcelle.rank === 2 ? 'bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800' :
                              'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800'
                            }`}
                            onClick={() => handlePayment(parcelle)}
                          >
                            <CreditCard className="h-4 w-4" />
                            Payer {(parcelle.montantDu / 1000000).toFixed(2)}M FCFA
                          </Button>
                        )}
                        
                        {parcelle.montantDu === 0 && (
                          <Badge className="bg-gradient-to-r from-green-100 to-green-50 text-green-800 hover:bg-green-100 flex items-center gap-1 px-4 py-2">
                            <CheckCircle className="h-4 w-4" />
                            Paiement à jour
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div>
                {/* Légende de la carte */}
                <div className="mb-4 bg-gradient-to-r from-gray-50 to-white border-2 rounded-xl p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <Info className="h-5 w-5 text-blue-600" />
                    <h3 className="font-bold text-gray-900 text-lg">Légende de la carte</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-3 bg-white p-3 rounded-lg">
                      <div className="w-12 h-12 rounded-lg border-3 border-red-600 bg-red-500/50"></div>
                      <div>
                        <p className="font-semibold text-gray-900">1ère Parcelle - Rouge</p>
                        <p className="text-xs text-gray-600">Impayé (0% réglé)</p>
                        <p className="text-xs text-red-600 font-semibold">Paiement urgent requis</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 bg-white p-3 rounded-lg">
                      <div className="w-12 h-12 rounded-lg border-3 border-orange-600 bg-orange-500/50"></div>
                      <div>
                        <p className="font-semibold text-gray-900">2ème Parcelle - Orange</p>
                        <p className="text-xs text-gray-600">En retard (40% réglé)</p>
                        <p className="text-xs text-orange-600 font-semibold">Paiement partiel effectué</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 bg-white p-3 rounded-lg">
                      <div className="w-12 h-12 rounded-lg border-3 border-green-600 bg-green-500/50"></div>
                      <div>
                        <p className="font-semibold text-gray-900">3ème Parcelle - Vert</p>
                        <p className="text-xs text-gray-600">À jour (100% réglé)</p>
                        <p className="text-xs text-green-600 font-semibold">Aucun paiement dû</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <Info className="inline h-4 w-4 mr-1" />
                      Cliquez sur une parcelle pour voir les détails et effectuer un paiement
                    </p>
                  </div>
                </div>

                {/* Carte */}
                <div ref={mapRef} className="w-full h-[650px] rounded-xl border-2 shadow-lg"></div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Modal de détails de parcelle */}
        {showDetailsModal && detailsParcelle && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Détails de la parcelle</h3>
                  <p className="text-gray-600 mt-1">{detailsParcelle.numero}</p>
                </div>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Numéro titre foncier</p>
                    <p className="font-semibold text-gray-900">{detailsParcelle.numeroTitreFoncier}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Propriétaire</p>
                    <p className="font-semibold text-gray-900">{detailsParcelle.proprietaire}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Superficie</p>
                    <p className="font-semibold text-gray-900">{detailsParcelle.superficie.toLocaleString("fr-FR")} m²</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Usage</p>
                    <p className="font-semibold text-gray-900">{detailsParcelle.usage}</p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Localisation</h4>
                  <div className="space-y-2">
                    <p className="text-sm"><span className="text-gray-600">Adresse:</span> {detailsParcelle.adresse}</p>
                    <p className="text-sm"><span className="text-gray-600">Quartier:</span> {detailsParcelle.quartier}</p>
                    <p className="text-sm"><span className="text-gray-600">Secteur:</span> {detailsParcelle.secteur}</p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Informations fiscales</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Impôt annuel</p>
                      <p className="font-bold text-lg text-gray-900">{detailsParcelle.impotAnnuel.toLocaleString("fr-FR")} FCFA</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Montant dû</p>
                      <p className={`font-bold text-lg ${detailsParcelle.montantDu > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {detailsParcelle.montantDu.toLocaleString("fr-FR")} FCFA
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Montant payé</p>
                      <p className="font-bold text-lg text-green-600">{detailsParcelle.montantPaye.toLocaleString("fr-FR")} FCFA</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Pénalités</p>
                      <p className="font-bold text-lg text-orange-600">{detailsParcelle.penalites.toLocaleString("fr-FR")} FCFA</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowDetailsModal(false)}
                    className="flex-1"
                  >
                    Fermer
                  </Button>
                  {detailsParcelle.montantDu > 0 && (
                    <Button
                      onClick={() => {
                        setShowDetailsModal(false);
                        handlePayment(detailsParcelle);
                      }}
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                    >
                      <CreditCard className="h-4 w-4 mr-2" />
                      Effectuer un paiement
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de paiement amélioré avec options */}
        {showPaymentModal && selectedParcelle && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="text-center mb-6">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                  selectedParcelle.rank === 1 ? 'bg-red-100' :
                  selectedParcelle.rank === 2 ? 'bg-orange-100' :
                  'bg-green-100'
                }`}>
                  <CreditCard className={`h-8 w-8 ${
                    selectedParcelle.rank === 1 ? 'text-red-600' :
                    selectedParcelle.rank === 2 ? 'text-orange-600' :
                    'text-green-600'
                  }`} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Paiement de l'impôt foncier</h3>
                <p className="text-gray-600 mt-2">Parcelle {selectedParcelle.numero}</p>
              </div>
              
              <div className="space-y-4 mb-6">
                {/* Récapitulatif */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Parcelle:</span>
                      <span className="font-semibold text-gray-900">{selectedParcelle.numero}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Montant total dû:</span>
                      <span className="font-semibold text-gray-900">{selectedParcelle.montantDu.toLocaleString("fr-FR")} FCFA</span>
                    </div>
                    {selectedParcelle.penalites > 0 && (
                      <div className="flex justify-between items-center text-orange-600">
                        <span>Dont pénalités:</span>
                        <span className="font-semibold">{selectedParcelle.penalites.toLocaleString("fr-FR")} FCFA</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Options de paiement */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-700">Plan de paiement</label>
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        setPaymentPlan("total");
                        setPaymentAmount(selectedParcelle.montantDu);
                      }}
                      className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                        paymentPlan === "total"
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">Paiement total</p>
                          <p className="text-sm text-gray-600">Réglez la totalité maintenant</p>
                        </div>
                        <p className="font-bold">{selectedParcelle.montantDu.toLocaleString("fr-FR")} FCFA</p>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setPaymentPlan("partial");
                        setPaymentAmount(Math.round(selectedParcelle.montantDu * 0.3));
                      }}
                      className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                        paymentPlan === "partial"
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">Acompte 30%</p>
                          <p className="text-sm text-gray-600">Payez une partie maintenant</p>
                        </div>
                        <p className="font-bold">{Math.round(selectedParcelle.montantDu * 0.3).toLocaleString("fr-FR")} FCFA</p>
                      </div>
                    </button>

                    <button
                      onClick={() => setPaymentPlan("custom")}
                      className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                        paymentPlan === "custom"
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div>
                        <p className="font-medium">Montant personnalisé</p>
                        <p className="text-sm text-gray-600">Choisissez le montant à payer</p>
                      </div>
                    </button>
                  </div>

                  {paymentPlan === "custom" && (
                    <Input
                      type="number"
                      placeholder="Entrez le montant en FCFA"
                      value={customAmount}
                      onChange={(e) => {
                        setCustomAmount(e.target.value);
                        setPaymentAmount(parseInt(e.target.value) || 0);
                      }}
                      className="w-full mt-2"
                    />
                  )}
                </div>

                {/* Mode de paiement */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-700">Mode de paiement</label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={() => setPaymentMethod("mobile")}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        paymentMethod === "mobile"
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <Phone className="h-5 w-5 mx-auto mb-1" />
                      <p className="text-xs font-medium">Mobile Money</p>
                    </button>
                    <button
                      onClick={() => setPaymentMethod("bank")}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        paymentMethod === "bank"
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <Building2 className="h-5 w-5 mx-auto mb-1" />
                      <p className="text-xs font-medium">Virement</p>
                    </button>
                    <button
                      onClick={() => setPaymentMethod("cash")}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        paymentMethod === "cash"
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <DollarSign className="h-5 w-5 mx-auto mb-1" />
                      <p className="text-xs font-medium">Espèces</p>
                    </button>
                  </div>
                </div>

                {paymentMethod === "mobile" && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Numéro de téléphone</label>
                    <Input
                      type="tel"
                      placeholder="6XX XXX XXX"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full"
                    />
                  </div>
                )}

                {/* Montant final */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 font-medium">Montant à payer:</span>
                    <span className="text-2xl font-bold text-blue-600">
                      {(paymentPlan === "custom" && customAmount ? parseInt(customAmount) : paymentAmount).toLocaleString("fr-FR")} FCFA
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1"
                >
                  Annuler
                </Button>
                <Button
                  onClick={processPayment}
                  className={`flex-1 ${
                    selectedParcelle.rank === 1 ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800' :
                    selectedParcelle.rank === 2 ? 'bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800' :
                    'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800'
                  }`}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Confirmer le paiement
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}