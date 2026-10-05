import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import type { PlacePOI, CityLocation } from '../types';

interface MapComponentProps {
  city: CityLocation;
  places: PlacePOI[];
  selectedPlace: PlacePOI | null;
  onSelectPlace: (place: PlacePOI) => void;
}

export const MapComponent: React.FC<MapComponentProps> = ({
  city,
  places,
  selectedPlace,
  onSelectPlace,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [id: string]: L.Marker }>({});

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [city.lat, city.lng],
        zoom: 12,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update center when city changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.setView([city.lat, city.lng], 12);
  }, [city]);

  // Update markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear old markers
    Object.values(markersRef.current).forEach((m) => m.remove());
    markersRef.current = {};

    places.forEach((place) => {
      const isIndoor = place.type === 'INDOOR';
      const pinColor = isIndoor ? '#8b5cf6' : '#10b981'; // Purple for Indoor, Emerald for Outdoor
      const isSelected = selectedPlace?.id === place.id;

      const customIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `
          <div style="
            background-color: ${isSelected ? '#f59e0b' : pinColor};
            width: ${isSelected ? '36px' : '28px'};
            height: ${isSelected ? '36px' : '28px'};
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 4px 10px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: ${isSelected ? '16px' : '12px'};
            font-weight: bold;
            transition: all 0.2s ease;
          ">
            ${isIndoor ? '🏛️' : '🌲'}
          </div>
        `,
        iconSize: isSelected ? [36, 36] : [28, 28],
        iconAnchor: isSelected ? [18, 18] : [14, 14],
      });

      const marker = L.marker([place.lat, place.lng], { icon: customIcon }).addTo(map);

      marker.bindPopup(`
        <div style="font-family: sans-serif; min-width: 180px;">
          <b style="font-size: 14px; color: #1e293b;">${place.name}</b>
          <div style="font-size: 11px; color: #64748b; margin-top: 2px;">${place.category}</div>
          <div style="margin-top: 6px; display: inline-block; font-size: 10px; padding: 2px 6px; border-radius: 4px; background: ${isIndoor ? '#ede9fe' : '#d1fae5'}; color: ${isIndoor ? '#6b21a8' : '#065f46'}; font-weight: 600;">
            ${place.weatherFitBadge}
          </div>
          <div style="font-size: 12px; margin-top: 6px; color: #334155;">Jarak: ${place.distanceKm ?? 0} km</div>
        </div>
      `);

      marker.on('click', () => {
        onSelectPlace(place);
      });

      markersRef.current[place.id] = marker;
    });
  }, [places, selectedPlace, onSelectPlace]);

  // Pan to selected place
  useEffect(() => {
    if (selectedPlace && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([selectedPlace.lat, selectedPlace.lng], 14, {
        duration: 0.8,
      });
      const targetMarker = markersRef.current[selectedPlace.id];
      if (targetMarker) {
        targetMarker.openPopup();
      }
    }
  }, [selectedPlace]);

  return (
    <div className="relative w-full h-[360px] md:h-[480px] rounded-2xl overflow-hidden shadow-lg border border-slate-200">
      <div ref={mapContainerRef} className="w-full h-full" />
      <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 shadow-md border border-slate-100 z-[1000] flex items-center gap-3">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
          Outdoor Spot
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block"></span>
          Indoor Spot
        </span>
      </div>
    </div>
  );
};
