"use client"

import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { MapPin, Layers, Search, Download, Info, RefreshCw, Globe, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

interface Parcelle {
  id: string;
  numero: string;
  proprietaireNom: string;
  adresse: string;
  superficie: number;
  impotAnnuel: number;
  montantDu: number;
  statut: "a_jour" | "en_retard" | "impaye";
  latitude: number;
  longitude: number;
  geometry?: any;
  // Nouveaux champs pour correspondre aux données shapefile
  properties?: any;
}

interface MapViewProps {
  parcelles: Parcelle[];
  searchQuery: string;
}

const BASE_MAPS = {
  satellite: {
    name: 'Satellite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Esri, DigitalGlobe, GeoEye'
  },
  streets: {
    name: 'Rues',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Esri, TomTom'
  },
  light: {
    name: 'Clair',
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution: 'CARTO'
  }
};

const MapView: React.FC<MapViewProps> = ({ parcelles, searchQuery }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedParcelle, setSelectedParcelle] = useState<Parcelle | null>(null);
  const [currentBaseMap, setCurrentBaseMap] = useState<keyof typeof BASE_MAPS>('streets');
  const [showBaseMapSelector, setShowBaseMapSelector] = useState(false);
  const markerLayerRef = useRef<any>(null);
  const [shapefileInfo, setShapefileInfo] = useState<any>(null);
  const [attributes, setAttributes] = useState<any>(null);

  const API_BASE_URL = 'https://gestion-fonciere-1.onrender.com/api';

  // Fonction pour obtenir la couleur selon le statut
  const getColorByStatut = (statut: string) => {
    switch (statut) {
      case "a_jour":
        return "#22c55e"; // Vert
      case "en_retard":
        return "#f97316"; // Orange
      case "impaye":
        return "#ef4444"; // Rouge
      default:
        return "#6b7280"; // Gris
    }
  };

  const getStatusText = (statut: string) => {
    switch (statut) {
      case "a_jour":
        return "À jour - Conforme";
      case "en_retard":
        return "En retard - Partiellement conforme";
      case "impaye":
        return "Impayé - Non conforme";
      default:
        return "Inconnu";
    }
  };

  const getStatusIcon = (statut: string) => {
    switch (statut) {
      case "a_jour":
        return <CheckCircle className="w-4 h-4" />;
      case "en_retard":
        return <Clock className="w-4 h-4" />;
      case "impaye":
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  // Charger les informations shapefile
  const loadShapefileInfo = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/info`);
      const data = await response.json();
      if (data.success) {
        setShapefileInfo(data.data);
      }
    } catch (err) {
      console.error('Erreur infos:', err);
    }
  }, []);

  // Charger les attributs
  const loadAttributes = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/attributes`);
      const data = await response.json();
      if (data.success) {
        setAttributes(data.attributes);
      }
    } catch (err) {
      console.error('Erreur attributs:', err);
    }
  }, []);

  const createMarkers = useCallback(() => {
    if (!map || !parcelles.length) return;

    // Supprimer les marqueurs existants
    if (markerLayerRef.current) {
      map.removeLayer(markerLayerRef.current);
    }

    const markerGroup = window.L.featureGroup();

    parcelles.forEach((parcelle) => {
      const color = getColorByStatut(parcelle.statut);

      // Créer un marqueur circulaire coloré
      const marker = window.L.circleMarker([parcelle.latitude, parcelle.longitude], {
        radius: parcelle.statut === "impaye" ? 10 : 
                parcelle.statut === "en_retard" ? 8 : 6,
        fillColor: color,
        color: color,
        weight: 2,
        opacity: 1,
        fillOpacity: 0.7
      });

      // Créer les propriétés au format similaire au composant Parcelles
      const featureProperties = {
        ...parcelle.properties, // Propriétés shapefile existantes
        NUMERO: parcelle.numero,
        NOM: parcelle.proprietaireNom,
        ADRESSE: parcelle.adresse,
        SUPERFICIE: parcelle.superficie,
        IMPOT_ANNUEL: parcelle.impotAnnuel,
        MONTANT_DU: parcelle.montantDu,
        STATUT: parcelle.statut
      };

      // Sélectionner les 5 premiers attributs comme dans le composant Parcelles
      const entries = Object.entries(featureProperties).slice(0, 5);
      
      const popupContent = `
        <div style="min-width: 280px; font-family: system-ui, -apple-system, sans-serif;">
          <div style="background: linear-gradient(135deg, #16a34a 0%, #22c55e 100%); padding: 12px; margin: -15px -20px 12px -20px; border-radius: 8px 8px 0 0;">
            <h3 style="margin: 0; color: white; font-size: 16px; font-weight: 600; display: flex; align-items: center; gap: 8px;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              Informations Parcelle
            </h3>
          </div>
          <div style="display: flex; flex-direction: column; gap: 8px;">
            ${entries.map(([key, value]) => `
              <div style="background: linear-gradient(to right, #f0fdf4, #ffffff); border-left: 3px solid #22c55e; padding: 10px 12px; border-radius: 6px;">
                <div style="font-size: 11px; color: #16a34a; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">
                  ${key}
                </div>
                <div style="font-size: 14px; color: #1f2937; font-weight: 500;">
                  ${value || 'N/A'}
                </div>
              </div>
            `).join('')}
          </div>
          ${Object.keys(featureProperties).length > 5 ? `
            <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #e5e7eb; text-align: center;">
              <span style="font-size: 12px; color: #6b7280; font-style: italic;">
                +${Object.keys(featureProperties).length - 5} autres attributs
              </span>
            </div>
          ` : ''}
        </div>
      `;

      marker.bindPopup(popupContent, { maxWidth: 350, className: 'custom-popup' });
      
      // Stocker toutes les propriétés pour l'affichage détaillé
      const parcelleWithProperties = {
        ...parcelle,
        properties: featureProperties
      };
      
      marker.on('click', () => setSelectedParcelle(parcelleWithProperties));
      marker.on('mouseover', function() {
        this.setStyle({
          fillOpacity: 0.9,
          weight: 3
        });
      });
      marker.on('mouseout', function() {
        this.setStyle({
          fillOpacity: 0.7,
          weight: 2
        });
      });
      
      marker.addTo(markerGroup);
    });

    markerGroup.addTo(map);
    
    // Ajuster la vue pour montrer tous les marqueurs
    if (parcelles.length > 0) {
      map.fitBounds(markerGroup.getBounds(), { padding: [50, 50] });
    }
    
    markerLayerRef.current = markerGroup;
  }, [map, parcelles]);

  const changeBaseMap = useCallback((mapType: keyof typeof BASE_MAPS) => {
    if (!map) return;

    // Recréer la carte avec le nouveau fond
    const baseMapConfig = BASE_MAPS[mapType];
    const newMap = window.L.map(mapRef.current, {
      zoomControl: true,
      attributionControl: true
    }).setView(map.getCenter(), map.getZoom());

    window.L.tileLayer(baseMapConfig.url, {
      attribution: baseMapConfig.attribution,
      maxZoom: 19
    }).addTo(newMap);

    setMap(newMap);
    setCurrentBaseMap(mapType);
    setShowBaseMapSelector(false);
    
    // Recréer les marqueurs sur la nouvelle carte
    setTimeout(() => {
      createMarkers();
    }, 100);
  }, [map, createMarkers]);

  const initializeMap = useCallback(() => {
    if (!mapRef.current || typeof window.L === 'undefined') return;

    try {
      const leafletMap = window.L.map(mapRef.current, {
        zoomControl: true,
        attributionControl: true
      }).setView([3.8480, 11.5021], 13);
      
      const baseMapConfig = BASE_MAPS[currentBaseMap];
      window.L.tileLayer(baseMapConfig.url, {
        attribution: baseMapConfig.attribution,
        maxZoom: 19
      }).addTo(leafletMap);

      setMap(leafletMap);
      setIsLoading(false);
      return leafletMap;
    } catch (err) {
      setError('Erreur initialisation carte');
      setIsLoading(false);
    }
  }, [currentBaseMap]);

  useEffect(() => {
    if (typeof window.L !== 'undefined') {
      const newMap = initializeMap();
      if (newMap) setMap(newMap);
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
      setTimeout(() => {
        const newMap = initializeMap();
        if (newMap) setMap(newMap);
      }, 100);
    };
    
    script.onerror = () => {
      setError('Échec chargement Leaflet');
      setIsLoading(false);
    };

    document.head.appendChild(script);

    return () => {
      if (map) map.remove();
    };
  }, [initializeMap]);

  useEffect(() => {
    if (map && parcelles.length > 0) {
      createMarkers();
    }
  }, [map, parcelles, createMarkers]);

  useEffect(() => {
    loadShapefileInfo();
    loadAttributes();
  }, [loadShapefileInfo, loadAttributes]);

  const stats = useMemo(() => ({
    total: parcelles.length,
    aJour: parcelles.filter(p => p.statut === "a_jour").length,
    enRetard: parcelles.filter(p => p.statut === "en_retard").length,
    impaye: parcelles.filter(p => p.statut === "impaye").length
  }), [parcelles]);

  return (
    <div className="flex flex-col w-full h-[600px] bg-gray-50 rounded-lg overflow-hidden border">
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Carte des Parcelles - Biyem-Assi
            </h2>
            <p className="text-green-100 text-sm">
              Visualisation des statuts de conformité fiscale - Données réelles
            </p>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2 bg-green-500/20 px-3 py-1 rounded">
              <CheckCircle className="w-4 h-4" />
              <span>{stats.aJour} à jour</span>
            </div>
            <div className="flex items-center gap-2 bg-orange-500/20 px-3 py-1 rounded">
              <Clock className="w-4 h-4" />
              <span>{stats.enRetard} en retard</span>
            </div>
            <div className="flex items-center gap-2 bg-red-500/20 px-3 py-1 rounded">
              <AlertTriangle className="w-4 h-4" />
              <span>{stats.impaye} impayé</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Panneau latéral - Identique au composant Parcelles */}
        <div className="w-full md:w-80 bg-white border-r border-gray-200 overflow-y-auto shadow-lg">
          <div className="p-4 border-b border-gray-200 bg-gradient-to-br from-gray-50 to-white">
            <div className="relative">
              <input
                type="text"
                placeholder="Rechercher une parcelle..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                readOnly
              />
              <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
            </div>
            <div className="w-full mt-2 bg-gray-400 text-white py-2 rounded-lg text-center text-sm">
              Utilisez la recherche du tableau
            </div>
          </div>

          {shapefileInfo && (
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2 text-gray-800">
                <Info className="w-5 h-5 text-green-600" />
                Informations
              </h2>
              <div className="space-y-2 text-sm text-gray-700">
                <div className="flex justify-between items-center bg-gray-50 p-2 rounded">
                  <span className="font-medium">Total parcelles:</span>
                  <span className="font-bold text-green-600">{shapefileInfo.total_features}</span>
                </div>
                <div className="flex justify-between items-center bg-gray-50 p-2 rounded">
                  <span className="font-medium">Type géométrie:</span>
                  <span className="text-xs">{shapefileInfo.geometry_type.join(', ')}</span>
                </div>
                <div className="flex justify-between items-center bg-gray-50 p-2 rounded">
                  <span className="font-medium">Système coord.:</span>
                  <span className="text-xs">{shapefileInfo.crs}</span>
                </div>
                <div className="flex justify-between items-center bg-gray-50 p-2 rounded">
                  <span className="font-medium">Attributs:</span>
                  <span className="font-bold text-green-600">{shapefileInfo.columns.length}</span>
                </div>
              </div>
            </div>
          )}

          {selectedParcelle ? (
            <div className="p-4 border-b border-gray-200 bg-gradient-to-br from-green-50 to-white">
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2 text-gray-800">
                <Layers className="w-5 h-5 text-green-600" />
                Détails de la parcelle
              </h2>
              <div className="space-y-2 text-sm max-h-64 overflow-y-auto">
                {selectedParcelle.properties && Object.entries(selectedParcelle.properties).map(([key, value]) => (
                  <div key={key} className="flex justify-between bg-white p-2 rounded border border-green-100">
                    <strong className="text-gray-700">{key}:</strong>
                    <span className="text-gray-900">{String(value)}</span>
                  </div>
                ))}
                {/* Informations fiscales supplémentaires */}
                <div className="flex justify-between bg-white p-2 rounded border border-green-100">
                  <strong className="text-gray-700">Statut fiscal:</strong>
                  <span className={`font-semibold ${
                    selectedParcelle.statut === "a_jour" ? "text-green-600" :
                    selectedParcelle.statut === "en_retard" ? "text-orange-600" :
                    "text-red-600"
                  }`}>
                    {getStatusText(selectedParcelle.statut)}
                  </span>
                </div>
                <div className="flex justify-between bg-white p-2 rounded border border-green-100">
                  <strong className="text-gray-700">Impôt annuel:</strong>
                  <span className="text-gray-900">{selectedParcelle.impotAnnuel.toLocaleString()} FCFA</span>
                </div>
                <div className="flex justify-between bg-white p-2 rounded border border-green-100">
                  <strong className="text-gray-700">Montant dû:</strong>
                  <span className={
                    selectedParcelle.montantDu > 0 ? "text-red-600 font-semibold" : "text-green-600"
                  }>
                    {selectedParcelle.montantDu > 0 ? 
                      `${selectedParcelle.montantDu.toLocaleString()} FCFA` : 
                      "Aucun"
                    }
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedParcelle(null)}
                className="mt-3 w-full bg-white text-gray-700 py-2 rounded-lg hover:bg-gray-100 transition-colors border border-gray-300"
              >
                Fermer
              </button>
            </div>
          ) : (
            <div className="p-4">
              <h3 className="font-semibold mb-2 text-gray-800">Légende des statuts</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded border border-green-200">
                  <div className="w-4 h-4 rounded-full bg-green-500"></div>
                  <div>
                    <div className="font-medium text-green-800">À jour</div>
                    <div className="text-xs text-green-600">Paiements à jour - Conforme</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-orange-50 rounded border border-orange-200">
                  <div className="w-4 h-4 rounded-full bg-orange-500"></div>
                  <div>
                    <div className="font-medium text-orange-800">En retard</div>
                    <div className="text-xs text-orange-600">Retard de paiement - Partiellement conforme</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-red-50 rounded border border-red-200">
                  <div className="w-4 h-4 rounded-full bg-red-500"></div>
                  <div>
                    <div className="font-medium text-red-800">Impayé</div>
                    <div className="text-xs text-red-600">Impayé total - Non conforme</div>
                  </div>
                </div>
              </div>

              {attributes && (
                <div className="mt-6">
                  <h3 className="font-semibold mb-2 text-gray-800">Attributs disponibles</h3>
                  <div className="space-y-1 text-xs">
                    {Object.keys(attributes).map((attr) => (
                      <div key={attr} className="bg-gradient-to-r from-gray-100 to-gray-50 p-2 rounded border border-gray-200">
                        <strong className="text-gray-700">{attr}</strong>
                        <span className="text-gray-500 ml-2">({attributes[attr].type})</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Carte */}
        <div className="flex-1 relative">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
              <div className="text-center">
                <RefreshCw className="w-8 h-8 animate-spin text-green-600 mx-auto" />
                <p className="mt-2 text-gray-600 font-medium text-sm">Chargement de la carte...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg text-sm">
              {error}
            </div>
          )}

          <div ref={mapRef} className="w-full h-full" />

          {/* Contrôles de la carte */}
          <div className="absolute bottom-4 right-4 z-[1000] flex flex-col gap-2">
            <div className="relative">
              <button
                onClick={() => setShowBaseMapSelector(!showBaseMapSelector)}
                className="bg-white p-2 rounded-lg shadow-lg hover:bg-gray-50 transition-colors"
                title="Changer le fond de carte"
              >
                <Globe className="w-4 h-4 text-gray-700" />
              </button>
              
              {showBaseMapSelector && (
                <div className="absolute bottom-full right-0 mb-2 bg-white rounded-lg shadow-xl p-2 min-w-[160px]">
                  {Object.entries(BASE_MAPS).map(([key, config]) => (
                    <button
                      key={key}
                      onClick={() => changeBaseMap(key as keyof typeof BASE_MAPS)}
                      className={`w-full text-left px-3 py-1.5 rounded hover:bg-gray-100 transition-colors text-sm ${
                        currentBaseMap === key ? 'bg-green-100 font-semibold text-green-700' : 'text-gray-700'
                      }`}
                    >
                      {config.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="absolute top-4 right-4 z-[999] bg-white px-3 py-1.5 rounded-lg shadow-md text-xs font-medium text-gray-700">
            <span>Fond: {BASE_MAPS[currentBaseMap].name}</span>
          </div>
        </div>
      </div>

      <div className="bg-gray-800 text-white p-3 text-center text-sm">
        <p>
          API Flask + {BASE_MAPS[currentBaseMap].name} © 2025 | 
          <span className="font-semibold ml-2">{stats.total} parcelles chargées</span>
        </p>
      </div>
    </div>
  );
};

declare global {
  interface Window {
    L: any;
  }
}

export default MapView;