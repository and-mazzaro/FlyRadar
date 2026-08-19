'use client';

import React, { useState } from 'react';
import { AIRLINES } from '@/lib/constants';
import { createClientSupabaseClient } from '@/lib/supabase';
import { Check } from 'lucide-react';

interface OnboardingModalProps {
  userId: string;
  onComplete: (preferredAirlines: string[]) => void;
}

export default function OnboardingModal({ userId, onComplete }: OnboardingModalProps) {
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const toggleAirline = (code: string) => {
    if (selected.includes(code)) {
      setSelected(selected.filter((item) => item !== code));
    } else {
      setSelected([...selected, code]);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    const supabase = createClientSupabaseClient();
    
    const { error } = await supabase
      .from('profiles')
      .update({
        preferred_airlines: selected,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    setLoading(false);
    if (!error) {
      onComplete(selected);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
        <h2 className="text-2xl font-extrabold text-white tracking-tight mb-2">Benvenuto su FlyDetector!</h2>
        <p className="text-slate-400 text-sm mb-6">
          Seleziona le tue compagnie aeree preferite. Daremo priorità a queste compagnie nel tuo feed voli e nei risultati di ricerca.
        </p>

        <div className="grid grid-cols-2 gap-3 mb-6 max-h-60 overflow-y-auto pr-1">
          {AIRLINES.map((airline) => {
            const isSelected = selected.includes(airline.name);
            return (
              <button
                key={airline.code}
                onClick={() => toggleAirline(airline.name)}
                className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'bg-blue-600/20 border-blue-500 text-white'
                    : 'bg-slate-800 border-slate-700 hover:border-slate-600 text-slate-300'
                }`}
              >
                <span className="text-sm font-medium">{airline.name}</span>
                {isSelected && <Check className="w-4 h-4 text-blue-400 shrink-0" />}
              </button>
            );
          })}
        </div>

        <button
          onClick={handleSave}
          disabled={loading}
          className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl transition-all disabled:opacity-50 flex justify-center items-center"
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
