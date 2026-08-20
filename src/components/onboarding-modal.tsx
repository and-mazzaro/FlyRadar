'use client';

import React, { useState } from 'react';
import { AIRLINES } from '@/lib/constants';
import { createClientSupabaseClient } from '@/lib/supabase';
import { Check, Globe } from 'lucide-react';

interface OnboardingModalProps {
  userId: string;
  onComplete: (preferredAirlines: string[], country: string) => void;
}

const COUNTRIES = [
  'Italia',
  'Spagna',
  'Francia',
  'Regno Unito',
  'Germania',
  'Paesi Bassi',
  'Grecia',
  'Portogallo'
];

export default function OnboardingModal({ userId, onComplete }: OnboardingModalProps) {
  const [selectedAirlines, setSelectedAirlines] = useState<string[]>([]);
  const [selectedCountry, setSelectedCountry] = useState('Italia');
  const [loading, setLoading] = useState(false);

  const toggleAirline = (name: string) => {
    if (selectedAirlines.includes(name)) {
      setSelectedAirlines(selectedAirlines.filter((item) => item !== name));
    } else {
      setSelectedAirlines([...selectedAirlines, name]);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    const supabase = createClientSupabaseClient();
    
    const { error } = await supabase
      .from('profiles')
      .update({
        preferred_airlines: selectedAirlines,
        country: selectedCountry,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    setLoading(false);
    if (!error) {
      onComplete(selectedAirlines, selectedCountry);
    } else {
      alert(`Errore nel salvataggio del profilo: ${error.message}`);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-slate-800 border border-slate-700/60 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
        <h2 className="text-2xl font-extrabold text-white tracking-tight mb-2">Benvenuto su FlyDetector!</h2>
        <p className="text-slate-300 text-sm mb-6">
          Personalizziamo la tua esperienza di viaggio. Seleziona il tuo Stato di partenza e le tue compagnie preferite.
        </p>

        {/* Passo 1: Stato di appartenenza */}
        <div className="mb-5">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
            <Globe className="w-3.5 h-3.5 text-blue-400" />
            Stato di residenza / partenza principale
          </label>
          <select
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 text-white text-sm rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {COUNTRIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Passo 2: Compagnie preferite */}
        <div className="mb-6">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Seleziona compagnie aeree preferite (Opzionale)
          </label>
          <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
            {AIRLINES.map((airline) => {
              const isSelected = selectedAirlines.includes(airline.name);
              return (
                <button
                  key={airline.code}
                  type="button"
                  onClick={() => toggleAirline(airline.name)}
                  className={`flex items-center justify-between p-2.5 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'bg-blue-600/20 border-blue-500 text-white font-bold'
                      : 'bg-slate-900 border-slate-700 hover:border-slate-600 text-slate-300'
                  }`}
                >
                  <span className="text-xs truncate">{airline.name}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-blue-400 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={loading}
          className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl transition-all disabled:opacity-50 flex justify-center items-center shadow-lg"
        >
          {loading ? (
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
          ) : (
            'Salva Preferenze ed Entra'
          )}
        </button>
      </div>
    </div>
  );
}

