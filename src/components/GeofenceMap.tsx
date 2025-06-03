import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface IconDefault extends L.Icon.Default {
  _getIconUrl?: string;
}

// Fix Leaflet's icon finding problems
delete (L.Icon.Default.prototype as IconDefault)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface GeofenceMapProps {
  coordinates: string;
  tipogeo: 'Circular' | 'Poligonal';
  editable?: boolean;
  radius?: number;
  onCoordinatesChange?: (coordinates: string, radius?: number) => void;
  onCenterUpdate?: (center: [number, number]) => void;
}

export const GeofenceMap: React.FC<GeofenceMapProps> = ({ 
  coordinates, 
  tipogeo,
  editable = false,
  radius = 500,
  onCoordinatesChange,
  onCenterUpdate
}) => {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerId = useRef(`map-${Math.random().toString(36).substr(2, 9)}`);
  const circleRef = useRef<L.Circle | null>(null);
  const polygonRef = useRef<L.Polygon | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const [currentCenter, setCurrentCenter] = useState<[number, number] | null>(null);

  const parseCoordinates = (coords: string): [number, number][] => {
    if (!coords) return [];
    const pairs = coords.split('|').filter(Boolean);
    const coordinates: [number, number][] = [];
    
    for (let i = 0; i < pairs.length; i += 2) {
      if (pairs[i] && pairs[i + 1]) {
        coordinates.push([parseFloat(pairs[i]), parseFloat(pairs[i + 1])]);
      }
    }
    
    return coordinates;
  };

  const formatCoordinates = (points: [number, number][]): string => {
    return points.map(point => `${point[0]}|${point[1]}`).join('|');
  };

  const clearGeofence = () => {
    if (circleRef.current) {
      circleRef.current.remove();
      circleRef.current = null;
    }
    if (polygonRef.current) {
      polygonRef.current.remove();
      polygonRef.current = null;
    }
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];
  };

  const createCircle = (center: [number, number], radius: number) => {
    if (!mapRef.current) return;

    clearGeofence();
    
    const circle = L.circle(center, {
      radius,
      color: '#2563eb',
      fillColor: '#3b82f6',
      fillOpacity: 0.2,
      weight: 2
    }).addTo(mapRef.current);

    // Hacer el círculo redimensionable si está en modo editable
    if (editable) {
      circle.on('mousedown', function(e) {
        if (!mapRef.current) return;
        
        function onMouseMove(e: L.LeafletMouseEvent) {
          const newRadius = mapRef.current!.distance(circle.getLatLng(), e.latlng);
          circle.setRadius(newRadius);
          onCoordinatesChange?.(formatCoordinates([center]), newRadius);
        }
        
        function onMouseUp() {
          mapRef.current?.off('mousemove', onMouseMove);
          document.removeEventListener('mouseup', onMouseUp);
        }
        
        mapRef.current.on('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
      });
    }

    circleRef.current = circle;
    const marker = L.marker(center).addTo(mapRef.current);
    markersRef.current = [marker];

    return circle;
  };

  const handleMapClick = (e: L.LeafletMouseEvent) => {
    if (!editable || !mapRef.current) return;

    const clickedPoint: [number, number] = [e.latlng.lat, e.latlng.lng];

    if (tipogeo === 'Circular') {
      setCurrentCenter(clickedPoint);
      onCenterUpdate?.(clickedPoint);
      createCircle(clickedPoint, radius);
      onCoordinatesChange?.(formatCoordinates([clickedPoint]));
    } else {
      const points = parseCoordinates(coordinates);
      const newPoints = [...points, clickedPoint];
      
      clearGeofence();
      
      if (newPoints.length >= 3) {
        const polygon = L.polygon(newPoints, {
          color: '#2563eb',
          fillColor: '#3b82f6',
          fillOpacity: 0.2,
          weight: 2
        }).addTo(mapRef.current);

        polygonRef.current = polygon;
      }
      
      // Actualizar marcadores
      markersRef.current = newPoints.map(point => 
        L.marker(point).addTo(mapRef.current!)
      );

      onCoordinatesChange?.(formatCoordinates(newPoints));
    }
  };

  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    const container = document.getElementById(mapContainerId.current);
    if (!container) return;

    const parsedCoordinates = parseCoordinates(coordinates);
    const defaultCenter: [number, number] = [19.4326, -99.1332]; // Ciudad de México como centro por defecto
    
    let mapCenter: L.LatLng;
    if (parsedCoordinates.length > 0) {
      const bounds = L.latLngBounds(parsedCoordinates.map(coord => L.latLng(coord[0], coord[1])));
      mapCenter = bounds.getCenter();
    } else {
      mapCenter = L.latLng(defaultCenter[0], defaultCenter[1]);
    }

    const map = L.map(mapContainerId.current, {
      center: [mapCenter.lat, mapCenter.lng],
      zoom: 1000,
      layers: [
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        })
      ]
    });

    if (editable) {
      map.on('click', handleMapClick);
    }

    mapRef.current = map;

    if (parsedCoordinates.length > 0) {
      if (tipogeo === 'Circular') {
        const center = parsedCoordinates[0];
        createCircle(center, radius);
        setCurrentCenter(center);
      } else {
        const polygon = L.polygon(parsedCoordinates, {
          color: '#2563eb',
          fillColor: '#3b82f6',
          fillOpacity: 0.2,
          weight: 2
        }).addTo(map);

        polygonRef.current = polygon;
        markersRef.current = parsedCoordinates.map(coord => 
          L.marker(coord).addTo(map)
        );
      }

      map.fitBounds(L.latLngBounds(parsedCoordinates.map(coord => L.latLng(coord[0], coord[1]))), {
        padding: [50, 50]
      });
    }

    requestAnimationFrame(() => {
      if (mapRef.current) {
        mapRef.current.invalidateSize();
      }
    });

    return () => {
      setCurrentCenter(null);
      clearGeofence();
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [coordinates, tipogeo, editable, radius, onCoordinatesChange]);

  return (
    <div 
      id={mapContainerId.current} 
      style={{ 
        width: '100%', 
        height: '400px',
        position: 'relative',
        zIndex: 1
      }} 
    />
  );
}; 