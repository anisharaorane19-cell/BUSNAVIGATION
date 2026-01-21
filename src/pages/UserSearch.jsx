import React, { useState, useEffect } from 'react';
import { db, realDb } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { ref, onValue, off } from 'firebase/database';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Link } from 'react-router-dom';

// Fix Leaflet marker icon issue
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

export default function UserSearch() {
    const [startSearch, setStartSearch] = useState('');
    const [destSearch, setDestSearch] = useState('');
    const [buses, setBuses] = useState([]);
    const [filteredBuses, setFilteredBuses] = useState([]);
    const [selectedBus, setSelectedBus] = useState(null);
    const [busLocation, setBusLocation] = useState(null);

    // Fetch all buses on load
    useEffect(() => {
        async function fetchBuses() {
            const querySnapshot = await getDocs(collection(db, "buses"));
            const busList = [];
            querySnapshot.forEach((doc) => {
                busList.push({ id: doc.id, ...doc.data() });
            });
            setBuses(busList);
            setFilteredBuses(busList);
        }
        fetchBuses();
    }, []);

    // Filter buses based on search
    useEffect(() => {
        const results = buses.filter(bus =>
            bus.startPoint.toLowerCase().includes(startSearch.toLowerCase()) &&
            bus.destination.toLowerCase().includes(destSearch.toLowerCase())
        );
        setFilteredBuses(results);
    }, [startSearch, destSearch, buses]);

    // Subscribe to live location when a bus is selected
    useEffect(() => {
        if (selectedBus) {
            const locationRef = ref(realDb, 'locations/' + selectedBus.id);
            const unsubscribe = onValue(locationRef, (snapshot) => {
                const data = snapshot.val();
                if (data) {
                    setBusLocation([data.lat, data.lng]);
                }
            });
            return () => off(locationRef);
        }
    }, [selectedBus]);

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            <nav className="bg-blue-600 p-4 text-white flex justify-between items-center shadow-md">
                <h1 className="text-2xl font-bold">Bus Tracker</h1>
                <Link to="/login" className="bg-white text-blue-600 px-4 py-2 rounded font-bold hover:bg-gray-100">Login/Admin</Link>
            </nav>

            <div className="p-6 flex-grow flex flex-col md:flex-row gap-6">
                {/* Search Sidebar */}
                <div className="md:w-1/3 bg-white p-6 rounded-lg shadow-md h-fit">
                    <h2 className="text-xl font-bold mb-4 text-gray-800">Find a Bus</h2>
                    <div className="space-y-4 mb-6">
                        <input
                            type="text"
                            placeholder="From (Start Point)"
                            className="w-full border p-3 rounded-lg"
                            value={startSearch}
                            onChange={e => setStartSearch(e.target.value)}
                        />
                        <input
                            type="text"
                            placeholder="To (Destination)"
                            className="w-full border p-3 rounded-lg"
                            value={destSearch}
                            onChange={e => setDestSearch(e.target.value)}
                        />
                    </div>

                    <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                        {filteredBuses.map(bus => (
                            <div
                                key={bus.id}
                                onClick={() => setSelectedBus(bus)}
                                className={`p-4 border rounded-lg cursor-pointer transition ${selectedBus?.id === bus.id ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500' : 'hover:bg-gray-50'}`}
                            >
                                <h3 className="font-bold text-lg text-blue-800">{bus.busNumber}</h3>
                                <p className="text-gray-600 font-medium">{bus.startPoint} ➝ {bus.destination}</p>
                                <div className="mt-2 text-sm text-gray-500">
                                    <p>Stops:</p>
                                    <ul className="list-disc pl-5">
                                        {bus.stops.map((stop, idx) => (
                                            <li key={idx}>{stop.name} - ${stop.price}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        ))}
                        {filteredBuses.length === 0 && <p className="text-gray-500 text-center">No buses found.</p>}
                    </div>
                </div>

                {/* Map Area */}
                <div className="md:w-2/3 bg-white rounded-lg shadow-md overflow-hidden relative">
                    {!selectedBus ? (
                        <div className="h-full flex items-center justify-center bg-gray-200 text-gray-500">
                            <p className="text-xl">Select a bus to see live location</p>
                        </div>
                    ) : (
                        <div className="h-full w-full">
                            {busLocation ? (
                                <MapContainer center={busLocation} zoom={15} style={{ height: "100%", width: "100%" }}>
                                    <TileLayer
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                    />
                                    <Marker position={busLocation}>
                                        <Popup>
                                            <b>{selectedBus.busNumber}</b><br />
                                            Live Location
                                        </Popup>
                                    </Marker>
                                </MapContainer>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center bg-gray-100 p-8 text-center">
                                    <div className="animate-pulse text-blue-600 mb-4">
                                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-700">Waiting for GPS signal...</h3>
                                    <p className="text-gray-500 mt-2">The driver hasn't started the trip or initialized GPS yet.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
