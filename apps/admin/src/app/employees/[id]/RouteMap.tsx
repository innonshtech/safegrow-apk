'use client';
import React, { useMemo } from 'react';
import { GoogleMap, useJsApiLoader, Marker, Polyline } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '100%',
  borderRadius: '12px'
};

interface LocationPoint {
  lat: number;
  lng: number;
  time?: Date;
}

export default function RouteMap({ 
  apiKey, 
  pings, 
  visits,
  checkInLocation,
  checkOutLocation
}: { 
  apiKey: string, 
  pings: LocationPoint[], 
  visits: any[],
  checkInLocation?: LocationPoint,
  checkOutLocation?: LocationPoint
}) {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey
  });

  const path = useMemo(() => {
    if (pings.length > 0) {
      return pings.map(p => ({ lat: p.lat, lng: p.lng }));
    }
    
    // Fallback: connect checkIn, visits, and checkOut if no pings
    const fallbackPath: LocationPoint[] = [];
    if (checkInLocation) fallbackPath.push(checkInLocation);
    
    // Sort visits by time to connect them in order
    const sortedVisits = [...visits].sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
    sortedVisits.forEach(v => fallbackPath.push({ lat: v.lat, lng: v.lng }));
    
    if (checkOutLocation) fallbackPath.push(checkOutLocation);
    
    return fallbackPath;
  }, [pings, visits, checkInLocation, checkOutLocation]);
  
  const center = useMemo(() => {
    if (path.length > 0) return path[Math.floor(path.length / 2)];
    if (checkInLocation) return { lat: checkInLocation.lat, lng: checkInLocation.lng };
    return { lat: 18.5204, lng: 73.8567 }; // Default Pune
  }, [path, checkInLocation]);

  return isLoaded ? (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={13}
      options={{ disableDefaultUI: true, zoomControl: true }}
    >
      {path.length > 0 && (
        <Polyline
          path={path}
          options={{ strokeColor: '#2c7a3f', strokeOpacity: 1, strokeWeight: 4 }}
        />
      )}
      
      {checkInLocation && (
        <Marker 
          position={{ lat: checkInLocation.lat, lng: checkInLocation.lng }} 
          title="Check In"
          label={{ text: 'L', color: 'white', fontWeight: 'bold' }}
        />
      )}

      {visits.map((v, i) => (
        <Marker 
          key={v.id} 
          position={{ lat: v.lat, lng: v.lng }} 
          title={v.vendorName}
          label={{ text: String(visits.length - i), color: 'white', fontWeight: 'bold' }}
        />
      ))}
      
      {checkOutLocation && (
        <Marker 
          position={{ lat: checkOutLocation.lat, lng: checkOutLocation.lng }} 
          title="Check Out"
          label={{ text: 'E', color: 'white', fontWeight: 'bold' }}
        />
      )}
    </GoogleMap>
  ) : <div style={{ width: '100%', height: '100%', backgroundColor: '#f0f0f0', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading Map...</div>;
}
