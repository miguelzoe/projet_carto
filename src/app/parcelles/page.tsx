"use client"

import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { MapPin, Layers, Search, Download, Info, RefreshCw, Globe } from 'lucide-react';

interface ShapefileInfo {
  name: string;
  total_features: number;
  crs: string;
  geometry_type: string[];
  columns: string[];
  bounds: {
    minx: number;
    miny: number;
    maxx: number;
    maxy: number;
  };
}

interface Feature {
  type: string;
  geometry: Record<string, unknown>;
  properties: Record<string, string | number | boolean | null>;
}

// Types Leaflet basés sur l'API réelle
interface LeafletMap {
  remove: () => void;
  removeLayer: (layer: unknown) => void;
  fitBounds: (bounds: unknown, options?: { padding: number[] }) => void;
  setView: (center: [number, number], zoom: number) => LeafletMap;
  addLayer: (layer: unknown) => void;
}

interface LeafletTileLayer {
  addTo: (map: LeafletMap) => LeafletTileLayer;
  setZIndex: (zIndex: number) => void;
}

interface LeafletGeoJSON {
  addTo: (map: LeafletMap) => LeafletGeoJSON;
  getBounds: () => { isValid: () => boolean };
  setZIndex: (zIndex: number) => void;
}

interface LeafletLayer {
  bindPopup: (content: string, options: { maxWidth: number; className: string }) => void;
  on: (event: string, callback: () => void) => void;
  setStyle: (style: { weight: number; fillOpacity: number }) => void;
}

interface LeafletBounds {
  isValid: () => boolean;
}

interface LeafletLib {
  map: (element: HTMLDivElement, options?: { zoomControl: boolean; attributionControl: boolean }) => LeafletMap;
  tileLayer: (url: string, options: { attribution: string; maxZoom: number }) => LeafletTileLayer;
  geoJSON: (geojson: Feature[], options: GeoJSONOptions) => LeafletGeoJSON;
  LatLngBounds: new (southWest: [number, number], northEast: [number, number]) => LeafletBounds;
}

interface GeoJSONOptions {
  onEachFeature: (feature: Feature, layer: LeafletLayer) => void;
  style?: (() => StyleOptions) | StyleOptions;
}

interface StyleOptions {
  color: string;
  weight: number;
  fillOpacity: number;
  fillColor: string;
}

const BASE_MAPS = {
  satellite: {
    name: 'Satellite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Esri, DigitalGlobe, GeoEye'
  },
  terrain: {
    name: 'Terrain',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Esri, DeLorme, NAVTEQ'
  },
  streets: {
    name: 'Rues',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Esri, TomTom'
  },
  dark: {
    name: 'Sombre',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: 'CARTO'
  },
  light: {
    name: 'Clair',
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution: 'CARTO'
  }
};

type BaseMapKey = keyof typeof BASE_MAPS;

const Parcelles: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<LeafletMap | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [shapefileInfo, setShapefileInfo] = useState<ShapefileInfo | null>(null);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [attributes, setAttributes] = useState<Record<string, { type: string }> | null>(null);
  const [currentBaseMap, setCurrentBaseMap] = useState<BaseMapKey>('satellite');
  const [showBaseMapSelector, setShowBaseMapSelector] = useState(false);
  const geoJsonLayerRef = useRef<LeafletGeoJSON | null>(null);
  const baseLayerRef = useRef<LeafletTileLayer | null>(null);

  const API_BASE_URL = 'https://gestion-fonciere-1.onrender.com/api';

  const loadShapefileInfo = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/info`);
      const data = await response.json();
      if (data.success) {
        setShapefileInfo(data.data);
      }
    } catch {
      console.error('Erreur infos:');
    }
  }, []);

  const loadAttributes = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/attributes`);
      const data = await response.json();
      if (data.success) {
        setAttributes(data.attributes);
      }
    } catch {
      console.error('Erreur attributs:');
    }
  }, []);

  const loadGeoJSON = useCallback(async () => {
    if (!map || !window.L) return;

    try {
      const response = await fetch(`${API_BASE_URL}/geojson`);
      const data = await response.json();
      
      if (data.success) {
        if (geoJsonLayerRef.current) {
          map.removeLayer(geoJsonLayerRef.current);
        }

        const L = window.L as LeafletLib;
        geoJsonLayerRef.current = L.geoJSON(data.features, {
          onEachFeature: (feature: Feature, layer: LeafletLayer) => {
            const entries = Object.entries(feature.properties).slice(0, 5);
            
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
                ${Object.keys(feature.properties).length > 5 ? `
                  <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #e5e7eb; text-align: center;">
                    <span style="font-size: 12px; color: #6b7280; font-style: italic;">
                      +${Object.keys(feature.properties).length - 5} autres attributs (cliquez pour voir tous)
                    </span>
                  </div>
                ` : ''}
              </div>
            `;
            
            layer.bindPopup(popupContent, { maxWidth: 350, className: 'custom-popup' });
            layer.on('click', () => setSelectedFeature(feature));
            layer.on('mouseover', function(this: LeafletLayer) {
              this.setStyle({ weight: 4, fillOpacity: 0.7 });
            });
            layer.on('mouseout', function(this: LeafletLayer) {
              this.setStyle({ weight: 2, fillOpacity: 0.4 });
            });
          },
          style: () => ({
            color: '#16a34a',
            weight: 2,
            fillOpacity: 0.4,
            fillColor: '#22c55e'
          })
        });

        geoJsonLayerRef.current.addTo(map);

        const bounds = geoJsonLayerRef.current.getBounds();
        if (bounds && bounds.isValid()) {
          map.fitBounds(bounds, { padding: [50, 50] });
        }
        
        setFeatures(data.features);
        setErrorMessage(null);
      }
    } catch {
      console.error('Erreur GeoJSON:');
      setErrorMessage('Impossible de charger les données');
    }
  }, [map]);

  const searchFeatures = useCallback(async (query: string) => {
    if (!map || !window.L) return;

    if (!query.trim()) {
      loadGeoJSON();
      return;
    }

    try {
      const searchParams = new URLSearchParams();
      if (attributes) {
        Object.keys(attributes).forEach(attr => {
          searchParams.append(attr, query);
        });
      }

      const response = await fetch(`${API_BASE_URL}/search?${searchParams.toString()}`);
      const data = await response.json();
      
      if (data.success) {
        if (geoJsonLayerRef.current) {
          map.removeLayer(geoJsonLayerRef.current);
        }

        if (data.features.length > 0) {
          const L = window.L as LeafletLib;
          geoJsonLayerRef.current = L.geoJSON(data.features, {
            onEachFeature: (feature: Feature, layer: LeafletLayer) => {
              const entries = Object.entries(feature.properties).slice(0, 5);
              
              const popupContent = `
                <div style="min-width: 280px; font-family: system-ui, -apple-system, sans-serif;">
                  <div style="background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%); padding: 12px; margin: -15px -20px 12px -20px; border-radius: 8px 8px 0 0;">
                    <h3 style="margin: 0; color: white; font-size: 16px; font-weight: 600; display: flex; align-items: center; gap: 8px;">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="11" cy="11" r="8"></circle>
                        <path d="m21 21-4.35-4.35"></path>
                      </svg>
                      Résultat de recherche
                    </h3>
                  </div>
                  <div style="display: flex; flex-direction: column; gap: 8px;">
                    ${entries.map(([key, value]) => `
                      <div style="background: linear-gradient(to right, #fef2f2, #ffffff); border-left: 3px solid #ef4444; padding: 10px 12px; border-radius: 6px;">
                        <div style="font-size: 11px; color: #dc2626; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">
                          ${key}
                        </div>
                        <div style="font-size: 14px; color: #1f2937; font-weight: 500;">
                          ${value || 'N/A'}
                        </div>
                      </div>
                    `).join('')}
                  </div>
                  ${Object.keys(feature.properties).length > 5 ? `
                    <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #e5e7eb; text-align: center;">
                      <span style="font-size: 12px; color: #6b7280; font-style: italic;">
                        +${Object.keys(feature.properties).length - 5} autres attributs (cliquez pour voir tous)
                      </span>
                    </div>
                  ` : ''}
                </div>
              `;
              layer.bindPopup(popupContent, { maxWidth: 350, className: 'custom-popup' });
              layer.on('click', () => setSelectedFeature(feature));
            },
            style: {
              color: '#dc2626',
              weight: 3,
              fillOpacity: 0.5,
              fillColor: '#ef4444'
            }
          });

          geoJsonLayerRef.current.addTo(map);

          const bounds = geoJsonLayerRef.current.getBounds();
          if (bounds && bounds.isValid()) {
            map.fitBounds(bounds, { padding: [50, 50] });
          }
          
          setFeatures(data.features);
          setErrorMessage(null);
        } else {
          setErrorMessage('Aucun résultat trouvé');
          setTimeout(() => setErrorMessage(null), 3000);
        }
      }
    } catch {
      console.error('Erreur recherche:');
      setErrorMessage('Erreur lors de la recherche');
    }
  }, [map, attributes, loadGeoJSON]);

  const changeBaseMap = useCallback((mapType: BaseMapKey) => {
    if (!map || !window.L) return;

    if (baseLayerRef.current) {
      map.removeLayer(baseLayerRef.current);
    }

    const baseMapConfig = BASE_MAPS[mapType];
    const L = window.L as LeafletLib;
    baseLayerRef.current = L.tileLayer(baseMapConfig.url, {
      attribution: baseMapConfig.attribution,
      maxZoom: 19
    });

    baseLayerRef.current.addTo(map);
    baseLayerRef.current.setZIndex(1);
    
    if (geoJsonLayerRef.current) {
      geoJsonLayerRef.current.setZIndex(1000);
    }

    setCurrentBaseMap(mapType);
    setShowBaseMapSelector(false);
  }, [map]);

  const exportGeoJSON = useCallback(() => {
    window.open(`${API_BASE_URL}/export/geojson`, '_blank');
  }, []);

  const initializeMap = useCallback(() => {
    if (!mapRef.current || typeof window.L === 'undefined') return;

    try {
      const L = window.L as LeafletLib;
      const leafletMap = L.map(mapRef.current, {
        zoomControl: true,
        attributionControl: true
      });
      
      leafletMap.setView([3.8480, 11.5021], 13);
      
      const baseMapConfig = BASE_MAPS[currentBaseMap];
      const tileLayer = L.tileLayer(baseMapConfig.url, {
        attribution: baseMapConfig.attribution,
        maxZoom: 19
      });
      
      baseLayerRef.current = tileLayer;
      tileLayer.addTo(leafletMap);

      setMap(leafletMap);
      setIsLoading(false);
      return leafletMap;
    } catch {
      setErrorMessage('Erreur initialisation carte');
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
      setErrorMessage('Échec chargement Leaflet');
      setIsLoading(false);
    };

    document.head.appendChild(script);

    return () => {
      if (map) map.remove();
    };
  }, [initializeMap, map]);

  useEffect(() => {
    if (map && window.L) {
      loadShapefileInfo();
      loadAttributes();
      loadGeoJSON();
    }
  }, [map, loadShapefileInfo, loadAttributes, loadGeoJSON]);

  const stats = useMemo(() => ({
    totalFeatures: features.length,
    selectedAttributes: attributes ? Object.keys(attributes).length : 0
  }), [features, attributes]);

  return (
    <div className="flex flex-col w-full h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <MapPin className="w-6 h-6" />
              Carte des Parcelles - {shapefileInfo?.name || 'FINBiyemassi'}
            </h1>
            <p className="text-green-100 text-sm">
              {shapefileInfo ? `${shapefileInfo.total_features} parcelles cadastrales` : 'Chargement...'}
            </p>
          </div>
          <button
            onClick={exportGeoJSON}
            className="flex items-center gap-2 bg-white text-green-700 px-4 py-2 rounded-lg hover:bg-green-50 transition-colors shadow-md"
          >
            <Download className="w-4 h-4" />
            Exporter
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        <div className="w-full md:w-80 bg-white border-r border-gray-200 overflow-y-auto shadow-lg">
          <div className="p-4 border-b border-gray-200 bg-gradient-to-br from-gray-50 to-white">
            <div className="relative">
              <input
                type="text"
                placeholder="Rechercher une parcelle..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchFeatures(searchQuery)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
            </div>
            <button
              onClick={() => searchFeatures(searchQuery)}
              className="w-full mt-2 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors shadow-sm"
            >
              Rechercher
            </button>
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

          {selectedFeature && (
            <div className="p-4 border-b border-gray-200 bg-gradient-to-br from-green-50 to-white">
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2 text-gray-800">
                <Layers className="w-5 h-5 text-green-600" />
                Détails de la parcelle
              </h2>
              <div className="space-y-2 text-sm max-h-64 overflow-y-auto">
                {Object.entries(selectedFeature.properties).map(([key, value]) => (
                  <div key={key} className="flex justify-between bg-white p-2 rounded border border-green-100">
                    <strong className="text-gray-700">{key}:</strong>
                    <span className="text-gray-900">{String(value)}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setSelectedFeature(null)}
                className="mt-3 w-full bg-white text-gray-700 py-2 rounded-lg hover:bg-gray-100 transition-colors border border-gray-300"
              >
                Fermer
              </button>
            </div>
          )}

          {attributes && (
            <div className="p-4">
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

        <div className="flex-1 relative">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
              <div className="text-center">
                <RefreshCw className="w-12 h-12 animate-spin text-green-600 mx-auto" />
                <p className="mt-2 text-gray-600 font-medium">Chargement de la carte...</p>
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg">
              {errorMessage}
            </div>
          )}

          <div ref={mapRef} className="w-full h-full" />

          <div className="absolute bottom-4 right-4 z-[1000] flex flex-col gap-2">
            <div className="relative">
              <button
                onClick={() => setShowBaseMapSelector(!showBaseMapSelector)}
                className="bg-white p-3 rounded-lg shadow-lg hover:bg-gray-50 transition-colors"
                title="Changer le fond de carte"
              >
                <Globe className="w-5 h-5 text-gray-700" />
              </button>
              
              {showBaseMapSelector && (
                <div className="absolute bottom-full right-0 mb-2 bg-white rounded-lg shadow-xl p-2 min-w-[180px]">
                  {Object.entries(BASE_MAPS).map(([key, config]) => (
                    <button
                      key={key}
                      onClick={() => changeBaseMap(key as BaseMapKey)}
                      className={`w-full text-left px-3 py-2 rounded hover:bg-gray-100 transition-colors ${
                        currentBaseMap === key ? 'bg-green-100 font-semibold text-green-700' : 'text-gray-700'
                      }`}
                    >
                      <span>{config.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={loadGeoJSON}
              className="bg-white p-3 rounded-lg shadow-lg hover:bg-gray-50 transition-colors"
              title="Rafraîchir les données"
            >
              <RefreshCw className="w-5 h-5 text-gray-700" />
            </button>
          </div>

          <div className="absolute top-4 right-4 z-[999] bg-white px-3 py-2 rounded-lg shadow-md text-sm font-medium text-gray-700">
            <span>Fond: {BASE_MAPS[currentBaseMap].name}</span>
          </div>
        </div>
      </div>

      <div className="bg-gray-800 text-white p-3 text-center text-sm">
        <p>
          API Flask + {BASE_MAPS[currentBaseMap].name} © 2025 | 
          <span className="font-semibold ml-2">{stats.totalFeatures} parcelles chargées</span>
        </p>
      </div>
    </div>
  );
};

declare global {
  interface Window {
    L: unknown; // Nous utilisons unknown au lieu de LeafletLib pour plus de flexibilité
  }
}

export default Parcelles;