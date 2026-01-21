import React, { useState, useEffect } from 'react';
import { db, realDb } from '../firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { ref, set } from 'firebase/database';
import { useAuth } from '../context/AuthContext';

export default function AdminDashboard() {
    const { currentUser, logout } = useAuth();
    const [buses, setBuses] = useState([]);
    const [busNumber, setBusNumber] = useState('');
    const [startPoint, setStartPoint] = useState('');
    const [destination, setDestination] = useState('');
    const [stops, setStops] = useState([{ name: '', price: 0 }]);
    const [isTracking, setIsTracking] = useState(false);
    const [loading, setLoading] = useState(false);

    // Fetch existing buses
    useEffect(() => {
        async function fetchBuses() {
            const querySnapshot = await getDocs(collection(db, "buses"));
            const busList = [];
            querySnapshot.forEach((doc) => {
                busList.push({ id: doc.id, ...doc.data() });
            });
            setBuses(busList);
        }
        fetchBuses();
    }, [loading]); // Refresh when a new bus is added

    // Handle adding a new stop field
    const addStopField = () => {
        setStops([...stops, { name: '', price: 0 }]);
    };

    // Handle changing stop values
    const handleStopChange = (index, field, value) => {
        const newStops = [...stops];
        newStops[index][field] = value;
        setStops(newStops);
    };

    // Submit new bus route
    const handleAddBus = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await addDoc(collection(db, "buses"), {
                busNumber,
                startPoint,
                destination,
                stops,
                driverId: currentUser.uid,
                createdAt: new Date().toISOString()
            });
            alert('Bus Route Added Successfully!');
            // Reset form
            setBusNumber('');
            setStartPoint('');
            setDestination('');
            setStops([{ name: '', price: 0 }]);
        } catch (error) {
            console.error("Error adding bus: ", error);
            alert("Error adding bus");
        }
        setLoading(false);
    };

    // Start GPS Tracking
    const startTrip = (busId) => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser");
            return;
        }

        setIsTracking(true);
        alert("Starting Trip! Location is being shared.");

        const locationRef = ref(realDb, 'locations/' + busId);

        // Watch position
        navigator.geolocation.watchPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                set(locationRef, {
                    lat: latitude,
                    lng: longitude,
                    timestamp: Date.now()
                });
            },
            (error) => {
                console.error("Error getting location:", error);
                alert("Error accessing GPS. Please allow location permissions.");
                setIsTracking(false);
            },
            { enableHighAccuracy: true }
        );
    };

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
                    <button onClick={logout} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">Logout</button>
                </div>

                {/* Add New Bus Section */}
                <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                    <h2 className="text-xl font-bold mb-4">Add New Bus Route</h2>
                    <form onSubmit={handleAddBus}>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <input type="text" placeholder="Bus Number" className="border p-2 rounded" value={busNumber} onChange={e => setBusNumber(e.target.value)} required />
                            <input type="text" placeholder="Start Point" className="border p-2 rounded" value={startPoint} onChange={e => setStartPoint(e.target.value)} required />
                            <input type="text" placeholder="Destination" className="border p-2 rounded" value={destination} onChange={e => setDestination(e.target.value)} required />
                        </div>

                        <div className="mb-4">
                            <label className="block font-bold mb-2">Stops & Prices (from Start)</label>
                            {stops.map((stop, index) => (
                                <div key={index} className="flex gap-2 mb-2">
                                    <input
                                        type="text"
                                        placeholder="Stop Name"
                                        className="border p-2 rounded flex-grow"
                                        value={stop.name}
                                        onChange={e => handleStopChange(index, 'name', e.target.value)}
                                        required
                                    />
                                    <input
                                        type="number"
                                        placeholder="Price"
                                        className="border p-2 rounded w-24"
                                        value={stop.price}
                                        onChange={e => handleStopChange(index, 'price', e.target.value)}
                                        required
                                    />
                                </div>
                            ))}
                            <button type="button" onClick={addStopField} className="text-blue-600 text-sm hover:underline">+ Add Stop</button>
                        </div>

                        <button type="submit" disabled={loading} className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 w-full md:w-auto">
                            {loading ? 'Adding...' : 'Save Route'}
                        </button>
                    </form>
                </div>

                {/* Existing Buses List */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-bold mb-4">Your Buses</h2>
                    {buses.length === 0 ? <p className="text-gray-500">No buses added yet.</p> : (
                        <div className="space-y-4">
                            {buses.map(bus => (
                                <div key={bus.id} className="border p-4 rounded-lg flex justify-between items-center">
                                    <div>
                                        <h3 className="font-bold text-lg">{bus.busNumber}</h3>
                                        <p className="text-gray-600">{bus.startPoint} ➝ {bus.destination}</p>
                                        <p className="text-sm text-gray-500">{bus.stops.length} stops</p>
                                    </div>
                                    <button
                                        onClick={() => startTrip(bus.id)}
                                        className={`px-4 py-2 rounded font-bold ${isTracking ? 'bg-yellow-500' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                                    >
                                        {isTracking ? 'Trip in Progress (GPS On)' : 'Start Trip'}
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
