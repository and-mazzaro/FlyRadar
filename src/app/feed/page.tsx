'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClientSupabaseClient } from '@/lib/supabase';
import FlightFeed from '@/components/flight-feed';
import FocusAlertManager from '@/components/focus-alerts';
import OnboardingModal from '@/components/onboarding-modal';
import { Plane, LogOut, Trash2, Shield, Info } from 'lucide-react';
import { Flight } from '@/components/flight-card';

export default function FeedPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // FIX: creare il client Supabase dentro useEffect (o con useMemo)
  // per evitare che ogni re-render crei una nuova istanza → loop infinito
  useEffect(() => {
    // Creiamo il client DENTRO l'effect così non cambia ad ogni render
    const supabase = createClientSupabaseClient();

    async function loadData() {
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (!user || userError) {
        router.push('/auth/login');
        return;
      }

      setUser(user);

      // Carica profilo utente
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileData) {
        setProfile(profileData);
        if (!profileData.preferred_airlines || profileData.preferred_airlines.length === 0) {
          setShowOnboarding(true);
        }
      }

      // Carica voli dal database
      const { data: flightsData, error: flightsError } = await supabase
        .from('flights')
        .select('*')
        .order('found_at', { ascending: false });

      if (flightsData && !flightsError) {
        setFlights(flightsData);
      }

      setLoading(false);
    }

    loadData();
    // FIX: dipendenza vuota [] → esegui SOLO al mount, non ad ogni render
  }, []);

  const handleLogout = useCallback(async () => {
    const supabase = createClientSupabaseClient();
    await supabase.auth.signOut();
    router.push('/auth/login');
  }, [router]);

  const handleDeleteAccount = useCallback(async () => {
    if (!user) return;
    if (!window.confirm('Sei assolutamente sicuro di voler eliminare definitivamente il tuo account? Questa azione è irreversibile.')) {
      return;
    }
    setDeleteLoading(true);
    try {
      const res = await fetch('/api/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });

      if (res.ok) {
        const supabase = createClientSupabaseClient();
        await supabase.auth.signOut();
        router.push('/auth/login');
      } else {
        const err = await res.json();
        alert(`Errore: ${err.error || 'Impossibile eliminare l\'account.'}`);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setDeleteLoading(false);
    }
  }, [user, router]);

  const handleToggleNotifications = useCallback(async (enabled: boolean) => {
    if (!user) return;
    const supabase = createClientSupabaseClient();
    const { error } = await supabase
      .from('profiles')
      .update({ email_notifications_enabled: enabled, updated_at: new Date().toISOString() })
      .eq('id', user.id);

    if (!error) {
      setProfile((prev: any) => ({ ...prev, email_notifications_enabled: enabled }));
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center gap-4">
        <span className="w-12 h-12 border-4 border-blue-600/30 border-t-blue-500 rounded-full animate-spin"></span>
        <p className="text-slate-400 text-sm">Caricamento radar voli...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <main className="min-h-screen bg-slate-950 text-white pb-16">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/70 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-600/20 text-blue-400 rounded-lg">
              <Plane className="w-5 h-5 rotate-45" />
            </div>
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              FlyDetector
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500 text-xs hidden sm:block">{user.email}</span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-all"
            >
              <LogOut className="w-4 h-4" />
              Esci
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Feed voli principale */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h1 className="text-2xl font-black tracking-tight mb-1 text-white">Tariffe Radar Voli</h1>
              <p className="text-slate-400 text-sm">
                {flights.length > 0
                  ? `${flights.length} offerte trovate · ordinate per prezzo`
                  : 'Nessun volo trovato. Usa il pulsante "Sincronizza" per caricare le offerte.'}
              </p>
            </div>
            <FlightFeed
              initialFlights={flights}
              preferredAirlines={profile?.preferred_airlines || []}
            />
          </div>

          {/* Sidebar destra */}
          <div className="space-y-6">
            <FocusAlertManager userId={user.id} />

            {/* Preferenze & GDPR */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-md space-y-4">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-emerald-400" />
                <h2 className="text-md font-bold text-white tracking-tight">Impostazioni & Privacy</h2>
              </div>

              <div className="space-y-3">
                {/* Toggle notifiche */}
                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={profile?.email_notifications_enabled ?? true}
                    onChange={(e) => handleToggleNotifications(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded border-slate-700 bg-slate-800 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex flex-col">
                    <span className="text-slate-300 text-xs font-semibold">Notifiche Email Attive</span>
                    <span className="text-slate-500 text-[11px] leading-normal">
                      Ricevi avvisi email quando un volo corrisponde ai tuoi Radar.
                    </span>
                  </div>
                </label>

                {/* Compagnie preferite */}
                {profile?.preferred_airlines && profile.preferred_airlines.length > 0 && (
                  <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800/60 text-xs space-y-1.5">
                    <div className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                      Compagnie Selezionate
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {profile.preferred_airlines.map((airline: string) => (
                        <span
                          key={airline}
                          className="px-2 py-0.5 bg-blue-600/10 text-blue-400 border border-blue-500/20 rounded-md font-medium text-[10px]"
                        >
                          {airline}
                        </span>
                      ))}
                    </div>
                    <button
                      onClick={() => setShowOnboarding(true)}
                      className="text-[10px] text-blue-400 hover:text-blue-300 font-semibold underline block pt-1"
                    >
                      Modifica compagnie preferite
                    </button>
                  </div>
                )}
              </div>

              {/* GDPR - Elimina account */}
              <div className="border-t border-slate-800/80 pt-4">
                <div className="flex items-start gap-2 mb-3 bg-red-950/20 border border-red-500/10 p-3 rounded-xl">
                  <Info className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-red-200/80 leading-normal">
                    Ai sensi del GDPR (Art. 17 – Diritto all&apos;Oblio), la cancellazione rimuove istantaneamente profilo, radar e log email associati.
                  </p>
                </div>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteLoading}
                  className="w-full py-2 px-3 border border-red-500/30 hover:bg-red-500/10 text-red-400 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  {deleteLoading ? 'Eliminazione...' : 'Elimina Account (GDPR)'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Onboarding modale */}
      {showOnboarding && (
        <OnboardingModal
          userId={user.id}
          onComplete={(airlines) => {
            setProfile((prev: any) => ({ ...prev, preferred_airlines: airlines }));
            setShowOnboarding(false);
          }}
        />
      )}
    </main>
  );
}
