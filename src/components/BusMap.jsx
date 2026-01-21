import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon in React Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Updates map center when coords change
const RecenterAutomatically = ({ lat, lng }) => {
    const map = useMap();
    useEffect(() => {
        if (lat && lng) map.setView([lat, lng]);
    }, [lat, lng, map]);
    return null;
};

const BusMap = ({ buses = [], center = [12.9716, 77.5946], zoom = 13, showUserLocation = false }) => {

    return (
        <MapContainer center={center} zoom={zoom} scrollWheelZoom={true} style={{ height: '100%', width: '100%', borderRadius: 'inherit' }}>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {buses.map(bus => (
                <Marker key={bus.id} position={[bus.lat, bus.lng]}>
                    <Popup>
                        <strong>{bus.number}</strong><br />
                        {bus.routeName}<br />
                        Status: {bus.status.toUpperCase()}
                    </Popup>
                </Marker>
            ))}

            <RecenterAutomatically lat={center[0]} lng={center[1]} />
        </MapContainer>
    );
};

export default BusMap;
