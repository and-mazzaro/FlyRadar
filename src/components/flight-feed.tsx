'use client';

import React, { useState, useCallback } from 'react';
import FlightCard, { Flight } from './flight-card';
import { Plane, Search, Filter, RotateCw } from 'lucide-react';
import { AIRLINES } from '@/lib/constants';

interface FlightFeedProps {
  initialFlights: Flight[];
  preferredAirlines: string[];
}

export default function FlightFeed({ initialFlights, preferredAirlines }: FlightFeedProps) {
  const [flights, setFlights] = useState<Flight[]>(initialFlights);
  const [searchOrigin, setSearchOrigin] = useState('');
  const [searchDestination, setSearchDestination] = useState('');
  const [selectedAirline, setSelectedAirline] = useState('');
  const [maxPrice, setMaxPrice] = useState<number>(300);
  const [sortBy, setSortBy] = useState<'price' | 'date'>('price');
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');

  // Sincronizza nuovi voli e aggiorna il feed senza ricarica completa della pagina
  const handleSync = useCallback(async () => {
    setSyncing(true);
    setSyncMessage('');
    try {
      // 1. Lancia il worker di sincronizzazione
      const syncRes = await fetch('/api/cron/sync-flights', {
        headers: { 'Authorization': 'Bearer local-fetch' }
      });

      if (!syncRes.ok) throw new Error('Sync fallita');
      const syncData = await syncRes.json();

      // 2. Ricarica la lista voli aggiornata
      const listRes = await fetch('/api/flights-list');
      if (listRes.ok) {
        const newFlights = await listRes.json();
        setFlights(newFlights);
        setSyncMessage(`✓ ${syncData.flightsInserted ?? newFlights.length} offerte aggiornate`);
      }
    } catch (e) {
      setSyncMessage('Errore durante la sincronizzazione');
      console.error(e);
    } finally {
      setSyncing(false);
      // Cancella il messaggio dopo 4 secondi
      setTimeout(() => setSyncMessage(''), 4000);
    }
  }, []);

  // Filtro e ordinamento lato client
  const filteredFlights = flights
    .filter((f) => {
      const matchOrigin = !searchOrigin || f.origin.toLowerCase().includes(searchOrigin.toLowerCase());
      const matchDest = !searchDestination || f.destination.toLowerCase().includes(searchDestination.toLowerCase());
      const matchAirline = !selectedAirline || f.airline.toLowerCase() === selectedAirline.toLowerCase();
      const matchPrice = f.price <= maxPrice;
      return matchOrigin && matchDest && matchAirline && matchPrice;
    })
    .sort((a, b) => {
      // Le compagnie preferite vengono sempre in cima
      const aPreferred = preferredAirlines.includes(a.airline);
      const bPreferred = preferredAirlines.includes(b.airline);
      if (aPreferred && !bPreferred) return -1;
      if (!aPreferred && bPreferred) return 1;
      if (sortBy === 'price') return a.price - b.price;
      return new Date(a.departure_date).getTime() - new Date(b.departure_date).getTime();
    });

  return (
    <div className="space-y-5">
      {/* Pannello filtri */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-md space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-blue-400" />
            <h2 className="text-sm font-bold text-white">Filtra Voli</h2>
          </div>
          <div className="flex items-center gap-3">
            {syncMessage && (
              <span className="text-xs text-emerald-400 font-medium">{syncMessage}</span>
            )}
            <button
              onClick={handleSync}
              disabled={syncing}
              className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 font-semibold transition-colors disabled:opacity-50"
            >
              <RotateCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Sincronizzando...' : 'Sincronizza Feed'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Origine */}
          <div className="relative">
            <Search className="absolute left-3 top-3 w-3.5 h-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="Partenza (es. MXP)"
              value={searchOrigin}
              onChange={(e) => setSearchOrigin(e.target.value)}
              className="w-full pl-8 pr-3 py-2.5 bg-slate-800 border border-slate-700 text-white text-sm rounded-xl placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Destinazione */}
          <div className="relative">
            <Search className="absolute left-3 top-3 w-3.5 h-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="Arrivo (es. BCN)"
              value={searchDestination}
              onChange={(e) => setSearchDestination(e.target.value)}
              className="w-full pl-8 pr-3 py-2.5 bg-slate-800 border border-slate-700 text-white text-sm rounded-xl placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Compagnia */}
          <select
            value={selectedAirline}
            onChange={(e) => setSelectedAirline(e.target.value)}
            className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 text-white text-sm rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">Tutte le compagnie</option>
            {AIRLINES.map((a) => (
              <option key={a.code} value={a.name}>{a.name}</option>
            ))}
          </select>

          {/* Ordinamento */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'price' | 'date')}
            className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 text-white text-sm rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="price">Ordina: Prezzo più basso</option>
            <option value="date">Ordina: Data di partenza</option>
          </select>
        </div>

        {/* Slider prezzo max */}
        <div>
          <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            <span>Prezzo Massimo</span>
            <span className="text-emerald-400 text-sm">{maxPrice}€</span>
          </div>
          <input
            type="range"
            min={10}
            max={500}
            step={5}
            value={maxPrice}
            onChange={(e) => setMaxPrice(parseInt(e.target.value))}
            className="w-full accent-blue-500 h-1.5 cursor-pointer"
          />
        </div>
      </div>

      {/* Cards voli */}
      {filteredFlights.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
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
          <Plane className="w-12 h-12 text-slate-700 mx-auto mb-4 rotate-45" />
          <h3 className="text-lg font-bold text-white mb-1">Nessun Volo Trovato</h3>
          <p className="text-slate-500 text-sm max-w-sm mx-auto mb-4">
            {flights.length === 0
              ? 'Il database è vuoto. Premi "Sincronizza Feed" per caricare le offerte.'
              : 'Nessuna offerta corrisponde ai filtri attivi. Prova ad aumentare il prezzo massimo o a cambiare aeroporto.'}
          </p>
          {flights.length === 0 && (
            <button
              onClick={handleSync}
              disabled={syncing}
              className="mx-auto flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl transition-colors"
            >
              <RotateCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Sincronizzando...' : 'Carica Voli Ora'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
