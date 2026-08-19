import React from 'react';
import { Plane, Calendar, ExternalLink } from 'lucide-react';

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
    });
  };

  return (
    <div
      className={`relative group bg-slate-900 border rounded-2xl p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg ${
        isPreferred 
          ? 'border-blue-500/50 shadow-md shadow-blue-500/5' 
          : 'border-slate-800 hover:border-slate-700'
      }`}
    >
      {/* Preferred airline tag */}
      {isPreferred && (
        <span className="absolute -top-2.5 left-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-blue-400/20 shadow-sm">
          Compagnia Preferita
        </span>
      )}

      {/* Badges top right */}
      <div className="absolute top-4 right-4 flex gap-1.5">
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

      <div className="flex flex-col gap-4">
        {/* Route header */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <span className="text-2xl font-black text-white tracking-tight">{flight.origin}</span>
            <span className="text-slate-500 text-xs font-medium">Partenza</span>
          </div>
          
          <div className="flex flex-col flex-1 items-center justify-center relative px-2">
            <div className="w-full border-t-2 border-dashed border-slate-800"></div>
            <Plane className="w-5 h-5 text-blue-500 rotate-90 absolute bg-slate-900 px-0.5" />
          </div>

          <div className="flex flex-col items-end">
            <span className="text-2xl font-black text-white tracking-tight">{flight.destination}</span>
            <span className="text-slate-500 text-xs font-medium">Destinazione</span>
          </div>
        </div>

        {/* Departure & Return info */}
        <div className="space-y-1.5 text-sm text-slate-300 bg-slate-950/40 p-3 rounded-xl border border-slate-950">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-500 shrink-0" />
            <span className="font-medium text-xs">Andata: {formatDate(flight.departure_date)}</span>
          </div>
          {flight.return_date && (
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-500 shrink-0" />
              <span className="font-medium text-xs">Ritorno: {formatDate(flight.return_date)}</span>
            </div>
          )}
        </div>

        {/* Footer info (Airline & Price) */}
        <div className="flex items-center justify-between border-t border-slate-800/80 pt-3 mt-1">
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Compagnia</span>
            <span className="text-slate-300 font-semibold text-sm">{flight.airline}</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Prezzo</span>
              <span className="text-2xl font-black text-emerald-400 tracking-tight">
                {flight.price.toFixed(2)}€
              </span>
            </div>

            <a
              href={`/api/redirect?flight_id=${flight.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 shrink-0"
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
