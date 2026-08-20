import React from 'react';
import { Plane, Calendar, ExternalLink } from 'lucide-react';
import { getCityName, getCurrencySymbol } from '@/lib/constants';

export interface Flight {
  id: string;
  origin: string;
  destination: string;
  airline: string;
  price: number;
  currency: string;
  departure_date: string;
  return_date?: string;
  booking_url: string;
  is_last_minute: boolean;
  found_at: string;
}

interface FlightCardProps {
  flight: Flight;
  isPreferred: boolean;
}

export default function FlightCard({ flight, isPreferred }: FlightCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Europe/Rome',
    });
  };

  return (
    <div
      className={`relative group bg-slate-800 border rounded-2xl p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg ${
        isPreferred 
          ? 'border-blue-500/50 shadow-md shadow-blue-500/5' 
          : 'border-slate-700/60 hover:border-slate-600'
      }`}
    >
      {/* Preferred airline tag */}
      {isPreferred && (
        <span className="absolute -top-2.5 left-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-blue-400/20 shadow-sm z-10">
          Compagnia Preferita
        </span>
      )}

      <div className="flex flex-col gap-4">
        {/* Route header */}
        <div className={`flex items-start justify-between gap-2 ${isPreferred ? 'mt-3' : 'mt-1'}`}>
          {/* Origin */}
          <div className="flex min-w-0 w-24 flex-col">
            <span className="truncate text-3xl font-black text-white tracking-tight leading-none">{flight.origin}</span>
            <span className="truncate text-blue-400 text-xs font-semibold mt-1">{getCityName(flight.origin)}</span>
            <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider mt-0.5">Partenza</span>
          </div>
          
          {/* Flight line */}
          <div className="flex flex-col flex-1 items-center justify-center px-3 min-w-[40px] pb-4">
            <Plane className="w-4 h-4 text-blue-500 rotate-90 shrink-0 mb-1" />
            <div className="w-full border-t border-dashed border-slate-700"></div>
          </div>

          {/* Destination */}
          <div className="flex min-w-0 w-24 flex-col items-end text-right">
            <span className="truncate text-3xl font-black text-white tracking-tight leading-none">{flight.destination}</span>
            <span className="truncate text-blue-400 text-xs font-semibold mt-1">{getCityName(flight.destination)}</span>
            <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider mt-0.5">Destinazione</span>
          </div>
        </div>

        {/* Badges row — placed here to avoid colliding with destination text */}
        {(flight.is_last_minute || flight.price < 35) && (
          <div className="flex gap-1.5 flex-wrap">
            {flight.is_last_minute && (
              <span className="bg-amber-500/15 text-amber-400 border border-amber-500/30 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md">
                Last Minute
              </span>
            )}
            {flight.price < 35 && (
              <span className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md">
                Super Price
              </span>
            )}
          </div>
        )}

        {/* Departure & Return info */}
        <div className="space-y-1.5 text-sm text-slate-300 bg-slate-900/50 p-3 rounded-xl border border-slate-900">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="font-medium text-xs">Andata: {formatDate(flight.departure_date)}</span>
          </div>
          {flight.return_date && (
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="font-medium text-xs">Ritorno: {formatDate(flight.return_date)}</span>
            </div>
          )}
        </div>

        {/* Footer info (Airline & Price) */}
        <div className="flex items-center justify-between border-t border-slate-700/60 pt-3 mt-1">
          <div className="flex flex-col min-w-0 pr-2 flex-1">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Compagnia</span>
            <span className="text-slate-300 font-semibold text-xs truncate" title={flight.airline}>
              {flight.airline}
            </span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Prezzo stimato</span>
              <span className="text-2xl font-black text-emerald-400 tracking-tight">
                {flight.price.toFixed(2)}{getCurrencySymbol(flight.currency || 'EUR')}
              </span>
              <span className="text-[9px] text-slate-500 block leading-tight">Verifica al momento della prenotazione</span>
            </div>

            <a
              href={`/api/redirect?flight_id=${flight.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2 px-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-1"
            >
              Prenota
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

