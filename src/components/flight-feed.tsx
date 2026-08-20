'use client';

import React, { useState, useEffect, useCallback } from 'react';
import FlightCard, { Flight } from './flight-card';
import { Plane, Search, Filter, RotateCw, Sparkles } from 'lucide-react';
import { AIRLINES, matchesAirportOrCity, AIRPORT_COUNTRIES } from '@/lib/constants';

interface FlightFeedProps {
  initialFlights: Flight[];
  preferredAirlines: string[];
  userCountry?: string;
}

export default function FlightFeed({ initialFlights, preferredAirlines, userCountry }: FlightFeedProps) {
  const [flights, setFlights] = useState<Flight[]>(initialFlights);
  const [searchOrigin, setSearchOrigin] = useState('');
  const [searchDestination, setSearchDestination] = useState('');
  const [selectedAirline, setSelectedAirline] = useState('');
  const [maxPrice, setMaxPrice] = useState<number>(300);
  const [sortBy, setSortBy] = useState<'price' | 'date'>('price');
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');
  
  // Auto-refresh states
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  
  // Default onlyUserCountry to true if a userCountry is configured
  const [onlyUserCountry, setOnlyUserCountry] = useState(!!userCountry);

  // Sync new flights from the cron sync-flights route
  const handleSync = useCallback(async () => {
    setSyncing(true);
    setSyncMessage('');
    try {
      const syncRes = await fetch('/api/cron/sync-flights', {
        headers: { 'Authorization': 'Bearer local-fetch' }
      });

      if (!syncRes.ok) throw new Error('Sync fallita');
      const syncData = await syncRes.json();

      const listRes = await fetch('/api/flights-list', { cache: 'no-store' });
      if (listRes.ok) {
        const newFlights = await listRes.json();
        setFlights(newFlights);
        setLastRefreshed(new Date());
        setSyncMessage(`✓ ${syncData.flightsInserted ?? newFlights.length} offerte aggiornate`);
      }
    } catch (e) {
      setSyncMessage('Errore durante la sincronizzazione');
      console.error(e);
    } finally {
      setSyncing(false);
      setTimeout(() => setSyncMessage(''), 4000);
    }
  }, []);

  // Soft fetch to update list in background without heavy cron processing
  const refreshFlightsList = useCallback(async () => {
    try {
      const listRes = await fetch('/api/flights-list', { cache: 'no-store' });
      if (listRes.ok) {
        const newFlights = await listRes.json();
        setFlights(newFlights);
        setLastRefreshed(new Date());
      }
    } catch (e) {
      console.error('Error refreshing flights list:', e);
    }
  }, []);

  // Set up periodic automatic polling every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return;
    refreshFlightsList();
    const interval = setInterval(refreshFlightsList, 30000);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshFlightsList]);

  // Refreshing the list is cheap; synchronizing the external API is deliberately slower.
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(handleSync, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [autoRefresh, handleSync]);

  // Handle incoming prop changes (e.g. from parent component initial state)
  useEffect(() => {
    setFlights(initialFlights);
  }, [initialFlights]);

  // Deduplicate: keep cheapest flight per unique origin+destination+departure_date
  const deduped = Array.from(
    flights.reduce((map, f) => {
      const key = `${f.origin}-${f.destination}-${f.departure_date.slice(0, 10)}`;
      const existing = map.get(key);
      if (!existing || f.price < existing.price) map.set(key, f);
      return map;
    }, new Map<string, typeof flights[0]>()).values()
  );

  // Client-side filtering and sorting
  const filteredFlights = deduped
    .filter((f) => {
      const matchOrigin = matchesAirportOrCity(f.origin, searchOrigin);
      const matchDest = matchesAirportOrCity(f.destination, searchDestination);

      const matchAirline = !selectedAirline || f.airline.toLowerCase() === selectedAirline.toLowerCase();
      const matchPrice = f.price <= maxPrice;

      // Filter by origin country if toggle active and user has a country set
      const airportCountry = AIRPORT_COUNTRIES[f.origin.toUpperCase()];
      const matchCountry = !onlyUserCountry || !userCountry || 
        (airportCountry && airportCountry.toLowerCase() === userCountry.toLowerCase());

      return matchOrigin && matchDest && matchAirline && matchPrice && matchCountry;
    })
    .sort((a, b) => {
      const aPreferred = preferredAirlines.includes(a.airline);
      const bPreferred = preferredAirlines.includes(b.airline);
      if (aPreferred && !bPreferred) return -1;
      if (!aPreferred && bPreferred) return 1;
      if (sortBy === 'price') return a.price - b.price;
      return new Date(a.departure_date).getTime() - new Date(b.departure_date).getTime();
    });


  return (
    <div className="space-y-5">
      {/* Auto-refresh indicator header */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-800 border border-slate-700/60 p-4 rounded-xl">
        <div className="flex items-center gap-2">
          {autoRefresh ? (
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
          ) : (
            <span className="h-2.5 w-2.5 rounded-full bg-slate-500"></span>
          )}
          <span className="text-xs text-slate-300">
            {autoRefresh 
              ? `Feed in tempo reale attivo (ultimo aggiornamento: ${lastRefreshed.toLocaleTimeString()})`
              : 'Aggiornamento automatico disattivato'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="w-3.5 h-3.5 rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-blue-500"
            />
            <span className="text-xs text-slate-300 font-medium">Aggiorna in automatico</span>
          </label>
        </div>
      </div>

      {/* Country Filter Alert banner */}
      {userCountry && (
        <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
          onlyUserCountry 
            ? 'bg-blue-950/20 border-blue-800/40 text-blue-200' 
            : 'bg-slate-800/50 border-slate-700/50 text-slate-400'
        }`}>
          <div className="flex items-start gap-2.5">
            <Sparkles className={`w-4 h-4 mt-0.5 shrink-0 ${onlyUserCountry ? 'text-blue-400' : 'text-slate-500'}`} />
            <div>
              <p className="text-xs font-semibold">
                {onlyUserCountry 
                  ? `Mostrando voli in partenza dallo stato registrato (${userCountry})` 
                  : `Tutti i voli globali nel feed (Stato registrato: ${userCountry})`}
              </p>
              <p className="text-[11px] opacity-80 mt-0.5">
                {onlyUserCountry 
                  ? 'Il feed prioritizza le tratte che partono dai tuoi aeroporti locali.' 
                  : 'Filtra per mostrare solo le partenze dal tuo stato locale.'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setOnlyUserCountry(!onlyUserCountry)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
              onlyUserCountry 
                ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-sm' 
                : 'border border-slate-600 hover:border-slate-500 text-slate-300 hover:text-white'
            }`}
          >
            {onlyUserCountry ? 'Mostra tutti i voli' : 'Filtra per il mio Stato'}
          </button>
        </div>
      )}

      {/* Pannello filtri */}
      <div className="bg-slate-800 border border-slate-700/60 p-5 rounded-2xl shadow-md space-y-4">
        <div className="flex items-center justify-between border-b border-slate-700/40 pb-3">
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
              placeholder="Partenza (es. Milano o MXP)"
              value={searchOrigin}
              onChange={(e) => setSearchOrigin(e.target.value)}
              className="w-full pl-8 pr-3 py-2.5 bg-slate-900 border border-slate-700 text-white text-sm rounded-xl placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Destinazione */}
          <div className="relative">
            <Search className="absolute left-3 top-3 w-3.5 h-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="Arrivo (es. Londra o BCN)"
              value={searchDestination}
              onChange={(e) => setSearchDestination(e.target.value)}
              className="w-full pl-8 pr-3 py-2.5 bg-slate-900 border border-slate-700 text-white text-sm rounded-xl placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Compagnia */}
          <select
            value={selectedAirline}
            onChange={(e) => setSelectedAirline(e.target.value)}
            className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 text-white text-sm rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
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
            className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 text-white text-sm rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="price">Ordina: Prezzo più basso</option>
            <option value="date">Ordina: Data di partenza</option>
          </select>
        </div>

        {/* Slider prezzo max */}
        <div className="pt-2">
          <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            <span>Prezzo Massimo</span>
            <span className="text-emerald-400 text-sm font-black">{maxPrice}€</span>
          </div>
          <input
            type="range"
            min={10}
            max={500}
            step={5}
            value={maxPrice}
            onChange={(e) => setMaxPrice(parseInt(e.target.value))}
            className="w-full accent-blue-500 h-1.5 cursor-pointer bg-slate-900 rounded-lg appearance-none"
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
        <div className="bg-slate-800 border border-slate-700/60 p-12 text-center rounded-2xl">
          <Plane className="w-12 h-12 text-slate-600 mx-auto mb-4 rotate-45" />
          <h3 className="text-lg font-bold text-white mb-1">Nessun Volo Trovato</h3>
          <p className="text-slate-400 text-sm max-w-sm mx-auto mb-4">
            {flights.length === 0
              ? 'Il database è vuoto o non sono stati caricati voli. Premi "Sincronizza Feed" per caricare le offerte.'
              : 'Nessuna offerta corrisponde ai filtri attivi. Prova ad aumentare il prezzo massimo, a cambiare aeroporto o a mostrare i voli da tutti gli Stati.'}
          </p>
          {flights.length === 0 && (
            <button
              onClick={handleSync}
              disabled={syncing}
              className="mx-auto flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl transition-colors shadow-md"
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

