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

  // Update markers with Neubrutalist style
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear old markers
    Object.values(markersRef.current).forEach((m) => m.remove());
    markersRef.current = {};

    places.forEach((place) => {
      const isIndoor = place.type === 'INDOOR';
      // Neubrutalism colors: Mint for Outdoor, Purple for Indoor, Yellow for Selected
      const pinColor = isIndoor ? '#C084FC' : '#A3E635';
      const isSelected = selectedPlace?.id === place.id;

      const customIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `
          <div style="
            background-color: ${isSelected ? '#FFE600' : pinColor};
            width: ${isSelected ? '40px' : '32px'};
            height: ${isSelected ? '40px' : '32px'};
            border-radius: 8px;
            border: 3px solid #000;
            box-shadow: ${isSelected ? '4px 4px 0px #000' : '2px 2px 0px #000'};
            display: flex;
            align-items: center;
            justify-content: center;
            color: #000;
            font-size: ${isSelected ? '18px' : '14px'};
            font-weight: 900;
            cursor: pointer;
            transition: transform 0.15s ease;
          ">
            ${isIndoor ? '🏛️' : '🌲'}
          </div>
        `,
        iconSize: isSelected ? [40, 40] : [32, 32],
        iconAnchor: isSelected ? [20, 20] : [16, 16],
      });

      const marker = L.marker([place.lat, place.lng], { icon: customIcon }).addTo(map);

      marker.bindPopup(`
        <div style="font-family: monospace, sans-serif; min-width: 200px; padding: 4px;">
          <div style="display: inline-block; background: #000; color: #FFE600; font-size: 10px; font-weight: 900; padding: 2px 6px; text-transform: uppercase; margin-bottom: 4px;">
            ${place.type} SPOT
          </div>
          <b style="font-size: 14px; color: #000; display: block;">${place.name}</b>
          <div style="font-size: 11px; color: #475569; margin-top: 2px;">${place.category}</div>
          <div style="margin-top: 6px; display: inline-block; font-size: 11px; padding: 2px 6px; border: 2px solid #000; background: ${isIndoor ? '#C084FC' : '#A3E635'}; color: #000; font-weight: 800;">
            ${place.weatherFitBadge}
          </div>
          <div style="font-size: 12px; margin-top: 6px; font-weight: 700; color: #000;">Jarak: ${place.distanceKm ?? 0} km</div>
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
    <div className="relative w-full h-[360px] md:h-[480px] rounded-xl overflow-hidden border-[3px] border-black shadow-[6px_6px_0px_0px_#000] bg-white">
      <div ref={mapContainerRef} className="w-full h-full" />
      <div className="absolute top-3 right-3 bg-white px-3 py-1.5 rounded-lg border-2 border-black shadow-[3px_3px_0px_0px_#000] z-[1000] flex items-center gap-3 font-mono font-bold text-xs">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 border border-black bg-[#A3E635] inline-block"></span>
          OUTDOOR
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 border border-black bg-[#C084FC] inline-block"></span>
          INDOOR
        </span>
      </div>
    </div>
  );
};
