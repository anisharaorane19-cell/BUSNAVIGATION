import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { busService } from '../services/mockApi';
import Navbar from '../components/Navbar';
import BusMap from '../components/BusMap';

const Track = () => {
    const { busId } = useParams();
    const [bus, setBus] = useState(null);
    const [route, setRoute] = useState(null);

    useEffect(() => {
        // Poll for location updates
        const fetchBus = async () => {
            const allBuses = await busService.getAllBuses();
            const found = allBuses.find(b => b.id === busId);
            if (found) {
                setBus(found);
                const routes = await busService.getRoutes();
                const r = routes.find(rt => rt.id === found.routeId);
                setRoute(r);
            }
        };

        fetchBus();
        const interval = setInterval(fetchBus, 2000);
        return () => clearInterval(interval);
    }, [busId]);

    if (!bus) return <div>Loading...</div>;

    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Navbar />
            <div style={{ flex: 1, position: 'relative' }}>
                <BusMap
                    buses={[bus]}
                    center={[bus.lat, bus.lng]}
                    zoom={15}
                />

                <div className="card" style={{ position: 'absolute', bottom: '2rem', left: '2rem', zIndex: 999, width: '300px' }}>
                    <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{bus.number}</h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>{route ? route.name : 'Unknown Route'}</p>
                    <div className="flex-between">
                        <span>Speed</span>
                        <strong>{bus.status === 'moving' ? '45 km/h' : '0 km/h'}</strong>
                    </div>
                    <div className="flex-between" style={{ marginTop: '0.5rem' }}>
                        <span>Next Stop</span>
                        <strong>{route && route.stops[bus.currentStopIndex + 1] || 'Arriving'}</strong>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Track;
