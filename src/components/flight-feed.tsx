'use client';

import React, { useState, useEffect } from 'react';
import FlightCard, { Flight } from './flight-card';
import { Plane, Search, ArrowUpDown, Filter, RotateCw } from 'lucide-react';
import { AIRPORTS, AIRLINES } from '@/lib/constants';

interface FlightFeedProps {
  initialFlights: Flight[];
  preferredAirlines: string[];
}

export default function FlightFeed({ initialFlights, preferredAirlines }: FlightFeedProps) {
  const [flights, setFlights] = useState<Flight[]>(initialFlights);
  const [searchOrigin, setSearchOrigin] = useState('');
  const [searchDestination, setSearchDestination] = useState('');
  const [selectedAirline, setSelectedAirline] = useState('');
  const [maxPrice, setMaxPrice] = useState<number>(100);
  const [sortBy, setSortBy] = useState<'price' | 'date'>('price');
  const [loading, setLoading] = useState(false);

  // Function to reload/fetch newest flights from client database client
  const refreshFeed = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/cron/sync-flights', {
        headers: {
          // Triggering sync bypass via client fetch simulation
          'Authorization': 'Bearer local-fetch'
        }
      });
      // Try reloading location or fetching directly via component trigger
      window.location.reload();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Client filtering & sorting logic
  const filteredFlights = flights
    .filter((f) => {
      const matchOrigin = !searchOrigin || f.origin.toLowerCase().includes(searchOrigin.toLowerCase());
      const matchDest = !searchDestination || f.destination.toLowerCase().includes(searchDestination.toLowerCase());
      const matchAirline = !selectedAirline || f.airline.toLowerCase() === selectedAirline.toLowerCase();
      const matchPrice = f.price <= maxPrice;
      return matchOrigin && matchDest && matchAirline && matchPrice;
    })
    .sort((a, b) => {
      // Sort priority rule: Always place preferred airlines at the top of the list!
      const aPreferred = preferredAirlines.includes(a.airline);
      const bPreferred = preferredAirlines.includes(b.airline);

      if (aPreferred && !bPreferred) return -1;
      if (!aPreferred && bPreferred) return 1;

      // Secondary sorting choice
      if (sortBy === 'price') {
        return a.price - b.price;
      } else {
        return new Date(a.departure_date).getTime() - new Date(b.departure_date).getTime();
      }
    });

  return (
    <div className="space-y-6">
      {/* Search and Filters panel */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-md space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">Cerca & Filtra Voli</h2>
          </div>
          <button
            onClick={refreshFeed}
            disabled={loading}
            className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 font-semibold transition-colors disabled:opacity-50"
          >
            <RotateCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Aggiorna Feed
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Origin filter input */}
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Origine (es. MXP o FCO)"
              value={searchOrigin}
              onChange={(e) => setSearchOrigin(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-800 border border-slate-700 text-white rounded-xl placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>

          {/* Destination filter input */}
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Destinazione (es. BCN o CDG)"
              value={searchDestination}
              onChange={(e) => setSearchDestination(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-800 border border-slate-700 text-white rounded-xl placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>

          {/* Airline select dropdown */}
          <div>
            <select
              value={selectedAirline}
              onChange={(e) => setSelectedAirline(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none cursor-pointer"
            >
              <option value="">Tutte le Compagnie</option>
              {AIRLINES.map((airline) => (
                <option key={airline.code} value={airline.name}>
                  {airline.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sorting Option */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'price' | 'date')}
              className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none cursor-pointer"
            >
              <option value="price">Ordina per Prezzo Minore</option>
              <option value="date">Ordina per Data di Partenza</option>
            </select>
          </div>
        </div>

        {/* Max Price slider */}
        <div className="pt-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            <span>Prezzo Massimo</span>
            <span className="text-emerald-400 font-bold text-sm">{maxPrice}€</span>
          </div>
          <input
            type="range"
            min="10"
            max="150"
            step="5"
            value={maxPrice}
            onChange={(e) => setMaxPrice(parseInt(e.target.value))}
            className="w-full accent-blue-500 bg-slate-800 rounded-lg cursor-pointer h-1.5"
          />
        </div>
      </div>

      {/* Flight deals lists */}
      {filteredFlights.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredFlights.map((flight) => (
            <FlightCard
              key={flight.id}
              flight={flight}
              isPreferred={preferredAirlines.includes(flight.airline)}
            />
          ))}
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 p-12 text-center rounded-2xl">
          <Plane className="w-12 h-12 text-slate-600 mx-auto mb-4 rotate-45" />
          <h3 className="text-lg font-bold text-white mb-1">Nessun Volo Trovato</h3>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            Nessuna offerta corrisponde ai tuoi filtri di ricerca in questo momento. Prova a incrementare la soglia di prezzo o a cambiare scalo.
          </p>
        </div>
      )}
    </div>
  );
}
