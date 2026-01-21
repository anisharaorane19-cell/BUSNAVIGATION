import React, { useState, useEffect } from 'react';
import { busService } from '../services/mockApi';
import Navbar from '../components/Navbar';
import { Search, MapPin, ArrowRight, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const [stations, setStations] = useState([]);
    const [from, setFrom] = useState('');
    const [to, setTo] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        busService.getStations().then(setStations);
    }, []);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!from || !to) return;
        setLoading(true);
        const buses = await busService.searchBuses(from, to);
        setResults(buses);
        setLoading(false);
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Navbar />

            {/* Hero / Search Section */}
            <div style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))', padding: '4rem 1rem', color: 'white', textAlign: 'center' }}>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Find Your Bus Route</h1>
                <p style={{ opacity: 0.9, marginBottom: '2rem' }}>Live tracking and schedule for local government buses.</p>

                <form onSubmit={handleSearch} className="card" style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', gap: '1rem', flexDirection: 'row', alignItems: 'flex-end', paddingTop: '2rem', paddingBottom: '2rem' }}>

                    <div style={{ flex: 1, textAlign: 'left' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600 }}>From</label>
                        <div style={{ position: 'relative' }}>
                            <MapPin size={18} style={{ position: 'absolute', top: '12px', left: '12px', color: 'var(--primary)' }} />
                            <select
                                value={from}
                                onChange={(e) => setFrom(e.target.value)}
                                style={{ width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', fontSize: '1rem' }}
                            >
                                <option value="">Select Origin</option>
                                {stations.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                    </div>

                    <div style={{ paddingBottom: '0.8rem', color: 'var(--text-muted)' }}>
                        <ArrowRight />
                    </div>

                    <div style={{ flex: 1, textAlign: 'left' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600 }}>To</label>
                        <div style={{ position: 'relative' }}>
                            <MapPin size={18} style={{ position: 'absolute', top: '12px', left: '12px', color: 'var(--accent)' }} />
                            <select
                                value={to}
                                onChange={(e) => setTo(e.target.value)}
                                style={{ width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', fontSize: '1rem' }}
                            >
                                <option value="">Select Destination</option>
                                {stations.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ height: '48px', padding: '0 2rem' }}>
                        <Search size={20} style={{ marginRight: '0.5rem' }} /> Search
                    </button>
                </form>
            </div>

            {/* Results Section */}
            <div className="container" style={{ padding: '2rem 1rem', flex: 1 }}>
                {loading && <p className="flex-center">Searching...</p>}
                {!loading && results.length === 0 && from && to && <p className="flex-center" style={{ color: 'var(--text-muted)' }}>No buses found on this route.</p>}

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    {results.map(bus => (
                        <div key={bus.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div className="flex-between">
                                <span style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{bus.number}</span>
                                <span style={{ padding: '0.25rem 0.75rem', borderRadius: 'var(--radius-full)', background: bus.status === 'moving' ? '#DCFCE7' : '#F3F4F6', color: bus.status === 'moving' ? 'var(--success)' : 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>
                                    {bus.status === 'moving' ? 'LIVE' : 'IDLE'}
                                </span>
                            </div>
                            <p style={{ color: 'var(--text-muted)' }}>{bus.routeName}</p>
                            <div className="flex-between" style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                                <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--primary)' }}>₹{bus.price}</span>
                                <button onClick={() => navigate(`/track/${bus.id}`)} className="btn btn-secondary" style={{ fontSize: '0.9rem' }}>Track Bus</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Home;
