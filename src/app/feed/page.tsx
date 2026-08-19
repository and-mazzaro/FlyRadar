'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientSupabaseClient } from '@/lib/supabase';
import FlightFeed from '@/components/flight-feed';
import FocusAlertManager from '@/components/focus-alerts';
import OnboardingModal from '@/components/onboarding-modal';
import { Plane, LogOut, Trash2, Bell, Shield, Info } from 'lucide-react';
import { Flight } from '@/components/flight-card';

export default function FeedPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const supabase = createClientSupabaseClient();

  useEffect(() => {
    async function loadData() {
      // 1. Get current auth user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth/login');
        return;
      }
      setUser(user);

      // 2. Get user profile details
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileData) {
        setProfile(profileData);
        // Show onboarding automatically if preferred airlines is empty
        if (!profileData.preferred_airlines || profileData.preferred_airlines.length === 0) {
          setShowOnboarding(true);
        }
      }

      // 3. Get flight offers stored in database
      const { data: flightsData } = await supabase
        .from('flights')
        .select('*')
        .order('found_at', { ascending: false });

      if (flightsData) {
        setFlights(flightsData);
      }

      setLoading(false);
    }

    loadData();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
    router.push('/auth/login');
  };

  // Right to be forgotten account deletion handler (GDPR policy compliance)
  const handleDeleteAccount = async () => {
    if (!window.confirm('Sei assolutamente sicuro di voler eliminare definitivamente il tuo account? Questa azione rimuoverà tutti i tuoi radar salvati e le tue impostazioni.')) {
      return;
    }
    setDeleteLoading(true);
    
    try {
      // Call standard trigger or auth endpoint logic. Supabase RLS CASCADE does the database cleanup.
      const { error } = await supabase.auth.updateUser({
        data: { delete_requested: true } // We simulate metadata flagging or handle direct delete via api
      });

      // Standard project delete trigger or call an admin endpoint to bypass Supabase limitation of client side user self-delete
      const res = await fetch('/api/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });

      if (res.ok) {
        await supabase.auth.signOut();
        router.refresh();
        router.push('/auth/login?error=Account%20eliminato%20con%20successo');
      } else {
        alert('Errore durante l\'eliminazione del profilo. Riprova più tardi.');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setDeleteLoading(false);
    }
  };

  // Toggle GDPR Notification preference state
  const handleToggleNotifications = async (enabled: boolean) => {
    const { error } = await supabase
      .from('profiles')
      .update({ email_notifications_enabled: enabled })
      .eq('id', user.id);

    if (!error) {
      setProfile({ ...profile, email_notifications_enabled: enabled });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center">
        <span className="w-10 h-10 border-4 border-blue-600/30 border-t-blue-500 rounded-full animate-spin mb-4"></span>
        <p className="text-slate-400 text-sm">Caricamento radar voli in corso...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white pb-16">
      {/* Top navigation header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-600/20 text-blue-400 rounded-lg">
              <Plane className="w-5 h-5 rotate-45" />
            </div>
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              FlyDetector
            </span>
          </div>

          <div className="flex items-center gap-3">
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

      {/* Main dashboard content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left / Flight feed listings */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h1 className="text-2xl font-black tracking-tight mb-1 text-white">Tariffe Radar Voli</h1>
              <p className="text-slate-400 text-sm">Le ultime offerte last-minute estratte e pronte per la prenotazione diretta.</p>
            </div>
            <FlightFeed
              initialFlights={flights}
              preferredAirlines={profile?.preferred_airlines || []}
            />
          </div>

          {/* Right sidebar settings, notifications and alerts */}
          <div className="space-y-6">
            <FocusAlertManager userId={user.id} />

            {/* User preferences & Privacy (GDPR Compliance Area) */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-md space-y-4">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-emerald-400" />
                <h2 className="text-md font-bold text-white tracking-tight">Impostazioni & GDPR Compliance</h2>
              </div>

              {/* Notification toggle */}
              <div className="space-y-3">
                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={profile?.email_notifications_enabled}
                    onChange={(e) => handleToggleNotifications(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded border-slate-700 bg-slate-800 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex flex-col">
                    <span className="text-slate-300 text-xs font-semibold">Notifiche Radar Attive</span>
                    <span className="text-slate-500 text-[11px] leading-normal">
                      Autorizza l&apos;invio di avvisi email in caso di match con i tuoi Focus Alerts.
                    </span>
                  </div>
                </label>

                {profile?.preferred_airlines && profile.preferred_airlines.length > 0 && (
                  <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-950 text-xs space-y-1.5">
                    <div className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Compagnie Selezionate</div>
                    <div className="flex flex-wrap gap-1.5">
                      {profile.preferred_airlines.map((airline: string) => (
                        <span key={airline} className="px-2 py-0.5 bg-blue-600/10 text-blue-400 border border-blue-500/20 rounded-md font-medium text-[10px]">
                          {airline}
                        </span>
                      ))}
                    </div>
                    <button
                      onClick={() => setShowOnboarding(true)}
                      className="text-[10px] text-blue-400 hover:text-blue-300 font-semibold underline block pt-1"
                    >
                      Modifica compagnie aeree preferite
                    </button>
                  </div>
                )}
              </div>

              {/* Right to be forgotten (Delete Account button) */}
              <div className="border-t border-slate-800/80 pt-4">
                <div className="flex items-center gap-2 mb-3 bg-red-950/20 border border-red-500/10 p-3 rounded-xl">
                  <Info className="w-4 h-4 text-red-400 shrink-0" />
                  <p className="text-[10px] text-red-200/80 leading-normal">
                    Conformemente al Regolamento GDPR (Diritto all&apos;Oblio), la cancellazione eliminerà istantaneamente il tuo profilo, i log associati ed i tuoi alert.
                  </p>
                </div>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteLoading}
                  className="w-full py-2 px-3 border border-red-500/30 hover:bg-red-500/10 text-red-400 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  {deleteLoading ? 'Eliminazione in corso...' : 'Elimina Profilo ed Account'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Preferences onboarding modal */}
      {showOnboarding && (
        <OnboardingModal
          userId={user.id}
          onComplete={(airlines) => {
            setProfile({ ...profile, preferred_airlines: airlines });
            setShowOnboarding(false);
          }}
        />
      )}
    </main>
  );
}
