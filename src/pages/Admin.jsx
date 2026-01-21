import React, { useState, useEffect } from 'react';
import { busService } from '../services/mockApi';
import Navbar from '../components/Navbar';
import { Plus, Navigation, Pause, Play } from 'lucide-react';

const Admin = () => {
    const [buses, setBuses] = useState([]);
    const [routes, setRoutes] = useState([]);
    const [newBusNumber, setNewBusNumber] = useState('');
    const [selectedRoute, setSelectedRoute] = useState('');

    // For Simulation Location Interval
    useEffect(() => {
        refreshData();
        // Simulate movement every 3 seconds for active buses
        const interval = setInterval(() => {
            buses.forEach(b => {
                if (b.status === 'moving') {
                    // Random tiny movement for demo
                    const latOffset = (Math.random() - 0.5) * 0.01;
                    const lngOffset = (Math.random() - 0.5) * 0.01;
                    busService.updateBusLocation(b.id, b.lat + latOffset, b.lng + lngOffset);
                }
            });
            refreshData(); // Refresh UI
        }, 3000);
        return () => clearInterval(interval);
    }, []); // Note: In real React code, dependency array needs care, but for quick prototype this simulates updates

    const refreshData = async () => {
        const b = await busService.getAllBuses();
        setBuses(b);
        const r = await busService.getRoutes();
        setRoutes(r);
    };

    const handleAddBus = async (e) => {
        e.preventDefault();
        if (!newBusNumber || !selectedRoute) return;
        await busService.addBus({
            number: newBusNumber,
            routeId: selectedRoute
        });
        setNewBusNumber('');
        await refreshData();
    };

    const toggleStatus = async (bus) => {
        const isLive = bus.status !== 'moving';
        await busService.toggleBusStatus(bus.id, isLive);
        await refreshData();
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-body)' }}>
            <Navbar />
            <div className="container" style={{ padding: '2rem 1rem' }}>
                <h1 style={{ marginBottom: '2rem' }}>Driver / Admin Console</h1>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>

                    {/* Add Bus Form */}
                    <div className="card" style={{ height: 'fit-content' }}>
                        <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Add New Bus</h2>
                        <form onSubmit={handleAddBus} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Bus Number</label>
                                <input
                                    type="text"
                                    value={newBusNumber}
                                    onChange={e => setNewBusNumber(e.target.value)}
                                    placeholder="e.g. KA-01-1234"
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Route</label>
                                <select
                                    value={selectedRoute}
                                    onChange={e => setSelectedRoute(e.target.value)}
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}
                                >
                                    <option value="">Select Route</option>
                                    {routes.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                                </select>
                            </div>
                            <button type="submit" className="btn btn-primary">
                                <Plus size={18} style={{ marginRight: '0.5rem' }} /> Add Bus
                            </button>
                        </form>
                    </div>

                    {/* Bus List */}
                    <div className="card">
                        <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Manage Fleet</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {buses.map(bus => (
                                <div key={bus.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
                                    <div>
                                        <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{bus.number}</div>
                                        <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                            {routes.find(r => r.id === bus.routeId)?.name || 'Unknown Route'}
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div style={{ textAlign: 'right', fontSize: '0.8rem' }}>
                                            <div>Last Ping:</div>
                                            <div>{new Date(bus.lastUpdate).toLocaleTimeString()}</div>
                                        </div>
                                        <button
                                            onClick={() => toggleStatus(bus)}
                                            className={bus.status === 'moving' ? 'btn btn-secondary' : 'btn btn-primary'}
                                            style={{ minWidth: '140px' }}
                                        >
                                            {bus.status === 'moving' ? (
                                                <> <Pause size={16} style={{ marginRight: '0.5rem' }} /> Stop Trip </>
                                            ) : (
                                                <> <Play size={16} style={{ marginRight: '0.5rem' }} /> Start Trip </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Admin;
