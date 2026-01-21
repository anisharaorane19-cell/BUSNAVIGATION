// mockApi.js

// Initial Database Simulation
const STATIONS = [
  "Central Bus Stand", "City Market", "Railway Station", "Civic Center", "Science Park", "Airport", "Grand Mall"
];

// Some Mock Routes
const ROUTES = [
  {
    id: "R1",
    name: "Central -> Airport",
    stops: ["Central Bus Stand", "City Market", "Civic Center", "Airport"],
    basePrice: 50
  },
  {
    id: "R2",
    name: "Railway -> Science Park",
    stops: ["Railway Station", "City Market", "Science Park"],
    basePrice: 30
  }
];

// Initial Buses
let BUSES = [
  {
    id: "B101",
    number: "KA-01-F-1234",
    routeId: "R1",
    status: "idle", // 'idle' | 'moving'
    currentStopIndex: 0,
    lat: 12.9716, // Example: Bangalore coordinates
    lng: 77.5946,
    lastUpdate: Date.now()
  },
  {
    id: "B102",
    number: "KA-05-A-9876",
    routeId: "R2",
    status: "moving",
    currentStopIndex: 1,
    lat: 12.9780,
    lng: 77.6000,
    lastUpdate: Date.now()
  }
];

// Helper to simulate storage
const save = () => {
  localStorage.setItem('BUS_APP_DATA', JSON.stringify({ BUSES, ROUTES }));
};

const load = () => {
  const data = localStorage.getItem('BUS_APP_DATA');
  if (data) {
    const parsed = JSON.parse(data);
    BUSES = parsed.BUSES;
    // We keep routes static for now or load them too if editable
  }
};

// Load on start
load();

export const busService = {
  getAllBuses: () => Promise.resolve([...BUSES]),
  
  getRoutes: () => Promise.resolve([...ROUTES]),
  
  getStations: () => Promise.resolve([...STATIONS]),

  addBus: (busData) => {
    const newBus = {
      id: "B" + Date.now(),
      status: 'idle',
      currentStopIndex: 0,
      lat: 12.9716, // Default start
      lng: 77.5946,
      lastUpdate: Date.now(),
      ...busData
    };
    BUSES.push(newBus);
    save();
    return Promise.resolve(newBus);
  },

  updateBusLocation: (busId, lat, lng) => {
    const bus = BUSES.find(b => b.id === busId);
    if (bus) {
      bus.lat = lat;
      bus.lng = lng;
      bus.lastUpdate = Date.now();
      save();
    }
    return Promise.resolve(true);
  },

  toggleBusStatus: (busId, isLive) => {
    const bus = BUSES.find(b => b.id === busId);
    if (bus) {
      bus.status = isLive ? 'moving' : 'idle';
      save();
    }
    return Promise.resolve(bus);
  },

  searchBuses: (from, to) => {
    // detailed search logic: find routes that contain both From and To, 
    // and where From index < To index
    const validRoutes = ROUTES.filter(r => {
      const startIdx = r.stops.indexOf(from);
      const endIdx = r.stops.indexOf(to);
      return startIdx !== -1 && endIdx !== -1 && startIdx < endIdx;
    });

    const routeIds = validRoutes.map(r => r.id);
    const resultBuses = BUSES.filter(b => routeIds.includes(b.routeId));

    return Promise.resolve(resultBuses.map(b => {
      const route = ROUTES.find(r => r.id === b.routeId);
      return { ...b, routeName: route.name, price: route.basePrice };
    }));
  }
};
