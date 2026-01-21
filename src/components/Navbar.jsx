import React from 'react';
import { Link } from 'react-router-dom';
import { Bus, MapPin, User, Shield } from 'lucide-react';

const Navbar = () => {
    return (
        <nav style={{ background: 'white', padding: '1rem', boxShadow: 'var(--shadow-sm)' }}>
            <div className="container flex-between">
                <Link to="/" className="flex-center" style={{ gap: '0.5rem', fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                    <Bus size={28} />
                    <span>CityBus<span style={{ color: 'var(--accent)' }}>Live</span></span>
                </Link>
                <div className="flex-center" style={{ gap: '2rem' }}>
                    <Link to="/" style={{ fontWeight: 500 }}>Find Bus</Link>
                    <Link to="/admin" className="btn btn-secondary" style={{ gap: '0.5rem', padding: '0.5rem 1rem' }}>
                        <Shield size={16} />
                        Driver/Admin
                    </Link>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
