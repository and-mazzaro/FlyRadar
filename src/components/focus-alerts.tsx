'use client';

import React, { useState, useEffect } from 'react';
import { createClientSupabaseClient } from '@/lib/supabase';
import { Bell, Trash2, Plus, AlertCircle, RefreshCw } from 'lucide-react';
import { getCityName } from '@/lib/constants';

interface Alert {
  id: string;
  origin: string | null;
  destination: string | null;
  max_price: number | null;
  is_active: boolean;
  created_at: string;
}

interface FocusAlertManagerProps {
  userId: string;
}

export default function FocusAlertManager({ userId }: FocusAlertManagerProps) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const supabase = createClientSupabaseClient();

  const fetchAlerts = async () => {
    setFetching(true);
    const { data, error } = await supabase
      .from('user_alerts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setAlerts(data);
      setErrorMsg('');
    } else if (error) {
      setErrorMsg('Non è stato possibile caricare i tuoi radar. Riprova tra poco.');
    }
    setFetching(false);
  };

  useEffect(() => {
    fetchAlerts();
  }, [userId]);

  const handleCreateAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!origin && !destination && !maxPrice) {
      setErrorMsg('Inserisci almeno un parametro di ricerca per salvare l\'avviso.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    const profileResponse = await fetch('/api/profile/ensure', { method: 'POST' });
    if (!profileResponse.ok) {
      setErrorMsg('Il profilo non è ancora pronto. Esci e accedi di nuovo, poi riprova.');
      setLoading(false);
      return;
    }

    const { error } = await supabase.from('user_alerts').insert({
      user_id: userId,
      origin: origin.trim() || null,
      destination: destination.trim() || null,
      max_price: maxPrice ? parseFloat(maxPrice) : null,
      is_active: true,
    });

    if (error) {
      setErrorMsg('Non è stato possibile salvare questo radar. Controlla i dati e riprova.');
    } else {
      setOrigin('');
      setDestination('');
      setMaxPrice('');
      fetchAlerts();
    }
    setLoading(false);
  };

  const handleDeleteAlert = async (id: string) => {
    const { error } = await supabase.from('user_alerts').delete().eq('id', id);
    if (!error) {
      setAlerts(alerts.filter((a) => a.id !== id));
    }
  };

  return (
    <div className="bg-slate-800 border border-slate-700/60 rounded-2xl p-5 shadow-md space-y-6">
      <div className="flex items-center gap-2">
        <Bell className="w-5 h-5 text-indigo-400 animate-bounce-slow" />
        <h2 className="text-lg font-bold text-white tracking-tight">Focus Alerts Radar</h2>
      </div>

      {errorMsg && (
        <div className="p-3 bg-red-900/35 border border-red-500/40 rounded-xl flex items-center gap-2 text-red-200 text-xs">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* New alert form */}
      <form onSubmit={handleCreateAlert} className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-900 border border-slate-700/40 p-4 rounded-xl">
        <div>
          <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">Partenza</label>
          <input
            type="text"
            placeholder="Qualsiasi (es. Milano, MXP)"
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 text-white rounded-lg placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
          />
        </div>

        <div>
          <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">Arrivo</label>
          <input
            type="text"
            placeholder="Qualsiasi (es. Londra, BCN)"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 text-white rounded-lg placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
          />
        </div>

        <div>
          <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">Prezzo Max (€)</label>
          <input
            type="number"
            placeholder="Sotto i... (es. 40)"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 text-white rounded-lg placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
          />
        </div>

        <div className="flex items-end">
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-md"
          >
            <Plus className="w-4 h-4" />
            Crea Radar
          </button>
        </div>
      </form>

      {/* Active Alerts list */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">I Tuoi Radar Attivi</h3>

        {fetching ? (
          <div className="flex justify-center py-6 text-slate-500">
            <RefreshCw className="w-5 h-5 animate-spin" />
          </div>
        ) : alerts.length > 0 ? (
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className="flex items-center justify-between p-3.5 bg-slate-900 border border-slate-700/40 rounded-xl"
              >
                <div className="flex flex-col gap-1 text-sm">
                  <div className="flex items-center gap-1.5 text-white font-bold">
                    <span>{alert.origin ? `${alert.origin} (${getCityName(alert.origin)})` : 'Qualsiasi'}</span>
                    <span className="text-slate-500">→</span>
                    <span>{alert.destination ? `${alert.destination} (${getCityName(alert.destination)})` : 'Qualsiasi'}</span>
                  </div>
                  <div className="text-xs text-slate-400 font-medium">
                    {alert.max_price ? `Prezzo max: ${alert.max_price}€` : 'Qualsiasi prezzo'}
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteAlert(alert.id)}
                  className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                  title="Rimuovi Radar"
                >
                  <Trash2 className="w-4.5 h-4.5" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 bg-slate-900/40 border border-dashed border-slate-700 rounded-xl">
            <p className="text-slate-400 text-xs px-4">Nessun radar impostato. Ricevi email non appena troviamo l&apos;offerta perfetta.</p>
          </div>
        )}
      </div>
    </div>
  );
}

