'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClientSupabaseClient } from '@/lib/supabase';
import FlightFeed from '@/components/flight-feed';
import FocusAlertManager from '@/components/focus-alerts';
import OnboardingModal from '@/components/onboarding-modal';
import { Plane, LogOut, Trash2, Shield, Info, User, Bell, Sliders, Globe, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';
import { Flight } from '@/components/flight-card';

const COUNTRIES = [
  'Italia',
  'Spagna',
  'Francia',
  'Regno Unito',
  'Germania',
  'Paesi Bassi',
  'Grecia',
  'Portogallo',
  'Svizzera',
  'Austria',
  'Belgio',
  'Polonia',
  'Turchia',
  'Altro',
];

// IATA guide data for the guide section
const IATA_GUIDE = [
  { group: '🇮🇹 Italia', airports: [
    { code: 'FCO / CIA', city: 'Roma' },
    { code: 'MXP / LIN / BGY', city: 'Milano / Bergamo' },
    { code: 'NAP', city: 'Napoli' },
    { code: 'VCE', city: 'Venezia' },
    { code: 'FLR', city: 'Firenze' },
    { code: 'BLQ', city: 'Bologna' },
    { code: 'TRN', city: 'Torino' },
    { code: 'CTA', city: 'Catania' },
    { code: 'PMO', city: 'Palermo' },
    { code: 'BRI', city: 'Bari' },
  ]},
  { group: '🇪🇺 Europa', airports: [
    { code: 'LHR / LGW / STN / LTN', city: 'Londra' },
    { code: 'CDG / ORY', city: 'Parigi' },
    { code: 'FRA', city: 'Francoforte' },
    { code: 'MUC', city: 'Monaco di Baviera' },
    { code: 'BER', city: 'Berlino' },
    { code: 'AMS', city: 'Amsterdam' },
    { code: 'MAD', city: 'Madrid' },
    { code: 'BCN', city: 'Barcellona' },
    { code: 'ATH', city: 'Atene' },
    { code: 'LIS', city: 'Lisbona' },
    { code: 'VIE', city: 'Vienna' },
    { code: 'PRG', city: 'Praga' },
    { code: 'WAW', city: 'Varsavia' },
    { code: 'BUD', city: 'Budapest' },
    { code: 'DUB', city: 'Dublino' },
    { code: 'TIA', city: 'Tirana' },
    { code: 'IST / SAW', city: 'Istanbul' },
    { code: 'ZRH', city: 'Zurigo' },
    { code: 'BRU', city: 'Bruxelles' },
  ]},
  { group: '🌍 Resto del Mondo', airports: [
    { code: 'DXB', city: 'Dubai' },
    { code: 'TLV', city: 'Tel Aviv' },
    { code: 'CAI', city: 'Il Cairo' },
    { code: 'JFK / EWR', city: 'New York' },
    { code: 'LAX', city: 'Los Angeles' },
    { code: 'NRT / HND', city: 'Tokyo' },
    { code: 'BKK', city: 'Bangkok' },
    { code: 'SIN', city: 'Singapore' },
    { code: 'HKG', city: 'Hong Kong' },
    { code: 'SYD', city: 'Sydney' },
  ]},
];

export default function FeedPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  // Navigation active tab
  const [activeSection, setActiveSection] = useState<'feed' | 'search' | 'account'>('feed');

  useEffect(() => {
    const supabase = createClientSupabaseClient();

    async function loadData() {
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (!user || userError) {
        router.push('/auth/login');
        return;
      }

      setUser(user);

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileData) {
        setProfile(profileData);
        if (!profileData.preferred_airlines || profileData.preferred_airlines.length === 0 || !profileData.country) {
          setShowOnboarding(true);
        }
      }

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
  }, [router]);

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

  const handleUpdateCountry = useCallback(async (newCountry: string) => {
    if (!user) return;
    const supabase = createClientSupabaseClient();
    const { error } = await supabase
      .from('profiles')
      .update({ country: newCountry, updated_at: new Date().toISOString() })
      .eq('id', user.id);

    if (!error) {
      setProfile((prev: any) => ({ ...prev, country: newCountry }));
    } else {
      alert(`Errore nell'aggiornare lo Stato: ${error.message}`);
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center gap-4">
        <span className="w-12 h-12 border-4 border-blue-600/30 border-t-blue-500 rounded-full animate-spin"></span>
        <p className="text-slate-400 text-sm">Caricamento radar voli...</p>
      </div>
    );
  }

  if (!user) return null;

  const navItems = [
    { key: 'feed', label: 'Feed', icon: <Plane className="w-5 h-5 rotate-45" /> },
    { key: 'search', label: 'Radar', icon: <Sliders className="w-5 h-5" /> },
    { key: 'account', label: 'Account', icon: <User className="w-5 h-5" /> },
  ] as const;

  return (
    <main className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-blue-600/20 text-blue-400 rounded-lg">
              <Plane className="w-5 h-5 rotate-45" />
            </div>
            <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              FlyDetector
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Email only visible on desktop */}
            <span className="text-slate-400 text-xs hidden md:block bg-slate-800 px-3 py-1.5 rounded-full border border-slate-700/40">
              {user.email}
            </span>
            {/* Logout visible on desktop only; on mobile it's in Account tab */}
            <button
              onClick={handleLogout}
              className="hidden md:flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700/60 transition-all"
            >
              <LogOut className="w-4 h-4" />
              Esci
            </button>
          </div>
        </div>

        {/* Desktop tab bar — hidden on mobile */}
        <nav className="hidden md:block border-t border-slate-700/50 bg-slate-800/60">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex gap-6">
              {navItems.map(({ key, label, icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveSection(key)}
                  className={`py-3.5 px-1 font-bold text-sm border-b-2 transition-all flex items-center gap-2 shrink-0 ${
                    activeSection === key
                      ? 'border-blue-500 text-blue-400'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {icon}
                  {key === 'search' ? 'Focus & Radar' : key === 'account' ? 'Account & GDPR' : label}
                </button>
              ))}
            </div>
          </div>
        </nav>
      </header>

      {/* Content wrapper — extra bottom padding on mobile for fixed bottom nav */}
      <div className="max-w-7xl mx-auto px-4 py-6 pb-24 md:pb-8">
        {activeSection === 'feed' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight mb-1 text-white">Tariffe Radar Voli</h1>
              <p className="text-slate-400 text-sm">
                {flights.length > 0
                  ? `${flights.length} offerte trovate · ordinate per prezzo`
                  : 'Nessun volo trovato. Sincronizza il feed per caricare offerte in tempo reale.'}
              </p>
            </div>
            <FlightFeed
              initialFlights={flights}
              preferredAirlines={profile?.preferred_airlines || []}
              userCountry={profile?.country}
            />
          </div>
        )}

        {activeSection === 'search' && (
          <div className="space-y-6 max-w-4xl mx-auto">
            <div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight mb-1 text-white">Focus Alerts & Radar</h1>
              <p className="text-slate-400 text-sm">
                Crea filtri personalizzati per monitorare rotte specifiche e ricevere notifiche email all&apos;istante.
              </p>
            </div>

            {/* IATA Guide panel */}
            <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl overflow-hidden">
              <button
                onClick={() => setShowGuide((v) => !v)}
                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-700/30 transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <BookOpen className="w-4 h-4 text-blue-400 shrink-0" />
                  <div>
                    <p className="font-bold text-sm text-white">Guida ai codici IATA</p>
                    <p className="text-[11px] text-slate-400">Usa questi codici nei campi Origine e Destinazione del Radar</p>
                  </div>
                </div>
                {showGuide
                  ? <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                  : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                }
              </button>

              {showGuide && (
                <div className="px-5 pb-5 space-y-5 border-t border-slate-700/40 pt-4">
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Il sistema utilizza i codici aeroportuali IATA a 3 lettere. Puoi inserire il codice del singolo aeroporto 
                    (es. <code className="bg-slate-700 px-1 rounded text-blue-300">FCO</code>) oppure il codice città 
                    (es. <code className="bg-slate-700 px-1 rounded text-blue-300">ROM</code>) che includerà tutti gli aeroporti di quella città.
                    La ricerca testuale nel feed supporta anche il nome italiano (es. &quot;Roma&quot;, &quot;Londra&quot;).
                  </p>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {IATA_GUIDE.map((section) => (
                      <div key={section.group} className="space-y-2">
                        <p className="text-xs font-bold text-slate-300 uppercase tracking-wider">{section.group}</p>
                        <div className="space-y-1">
                          {section.airports.map((a) => (
                            <div key={a.code} className="flex items-center justify-between gap-2 py-1 border-b border-slate-700/30">
                              <code className="text-blue-300 font-mono text-[11px] font-bold">{a.code}</code>
                              <span className="text-slate-400 text-[11px] text-right">{a.city}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <FocusAlertManager userId={user.id} />
          </div>
        )}

        {activeSection === 'account' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight mb-1 text-white">Impostazioni & Privacy</h1>
              <p className="text-slate-400 text-sm">
                Gestisci le tue preferenze geografiche, notifiche email e diritti sulla privacy.
              </p>
            </div>

            {/* Account info card on mobile */}
            <div className="md:hidden bg-slate-800 border border-slate-700/60 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Account attivo</p>
                <p className="text-sm font-semibold text-white truncate max-w-[200px]">{user.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold text-xs rounded-xl border border-slate-600 transition-all"
              >
                <LogOut className="w-4 h-4" />
                Esci
              </button>
            </div>

            <div className="bg-slate-800 border border-slate-700/60 rounded-2xl p-6 shadow-md space-y-6">
              {/* Geographical preferences */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-700/40 pb-3">
                  <Globe className="w-5 h-5 text-blue-400" />
                  <h2 className="text-lg font-bold text-white tracking-tight">Preferenze Geografiche</h2>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Stato di residenza / partenza principale
                  </label>
                  <p className="text-[11px] text-slate-400 mb-1">
                    Il feed principale mostrerà preferibilmente i voli in partenza da questo Stato.
                  </p>
                  <select
                    value={profile?.country || 'Italia'}
                    onChange={(e) => handleUpdateCountry(e.target.value)}
                    className="px-3.5 py-2.5 bg-slate-900 border border-slate-700 text-white rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm max-w-xs"
                  >
                    {COUNTRIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Notification toggle */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-2 border-b border-slate-700/40 pb-3">
                  <Bell className="w-5 h-5 text-indigo-400" />
                  <h2 className="text-lg font-bold text-white tracking-tight">Notifiche</h2>
                </div>

                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={profile?.email_notifications_enabled ?? true}
                    onChange={(e) => handleToggleNotifications(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex flex-col">
                    <span className="text-slate-200 text-sm font-semibold">Notifiche Email Attive</span>
                    <span className="text-slate-400 text-xs mt-0.5 leading-relaxed">
                      Ricevi avvisi email immediati quando un volo corrisponde ai tuoi Radar attivi.
                    </span>
                  </div>
                </label>
              </div>

              {/* Preferred airlines list */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-2 border-b border-slate-700/40 pb-3">
                  <Plane className="w-5 h-5 text-emerald-400 rotate-45" />
                  <h2 className="text-lg font-bold text-white tracking-tight">Compagnie Preferite</h2>
                </div>

                {profile?.preferred_airlines && profile.preferred_airlines.length > 0 ? (
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {profile.preferred_airlines.map((airline: string) => (
                        <span
                          key={airline}
                          className="px-3 py-1 bg-blue-600/10 text-blue-400 border border-blue-500/20 rounded-lg font-bold text-xs"
                        >
                          {airline}
                        </span>
                      ))}
                    </div>
                    <button
                      onClick={() => setShowOnboarding(true)}
                      className="text-xs text-blue-400 hover:text-blue-300 font-semibold underline block pt-1"
                    >
                      Modifica compagnie preferite
                    </button>
                  </div>
                ) : (
                  <div className="text-slate-400 text-xs">
                    Nessuna compagnia aerea preferita selezionata.{' '}
                    <button
                      onClick={() => setShowOnboarding(true)}
                      className="text-blue-400 hover:text-blue-300 underline font-semibold ml-1"
                    >
                      Configura ora
                    </button>
                  </div>
                )}
              </div>

              {/* GDPR - Elimina account */}
              <div className="border-t border-slate-700/60 pt-6">
                <div className="flex items-start gap-3 bg-red-950/20 border border-red-500/10 p-4 rounded-xl mb-4">
                  <Info className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-red-200">Diritto all&apos;Oblio (Art. 17 GDPR)</p>
                    <p className="text-[11px] text-red-200/70 leading-relaxed mt-1">
                      Ai sensi del Regolamento Generale sulla Protezione dei Dati, la cancellazione dell&apos;account comporterà la rimozione immediata e definitiva di tutte le tue informazioni personali dal nostro database, inclusi profilo utente, preferenze, radar registrati e log storici delle email.
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteLoading}
                  className="w-full py-3 px-4 border border-red-500/30 hover:bg-red-500/10 text-red-400 font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                  {deleteLoading ? 'Eliminazione in corso...' : 'Elimina Definitivamente Account (GDPR)'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Mobile bottom navigation bar (hidden on md+) ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 shadow-xl">
        <div className="flex items-stretch h-16">
          {navItems.map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => setActiveSection(key)}
              className={`flex-1 flex flex-col items-center justify-center gap-1 text-[10px] font-bold uppercase tracking-wider transition-all ${
                activeSection === key
                  ? 'text-blue-400 bg-blue-500/10'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <span className={`transition-transform ${activeSection === key ? 'scale-110' : ''}`}>
                {icon}
              </span>
              {label}
            </button>
          ))}
        </div>
      </nav>

      {/* Onboarding modal */}
      {showOnboarding && (
        <OnboardingModal
          userId={user.id}
          onComplete={(airlines, country) => {
            setProfile((prev: any) => ({ ...prev, preferred_airlines: airlines, country }));
            setShowOnboarding(false);
          }}
        />
      )}
    </main>
  );
}


const LEGACY_COUNTRIES = [
  'Italia',
  'Spagna',
  'Francia',
  'Regno Unito',
  'Germania',
  'Paesi Bassi',
  'Grecia',
  'Portogallo'
];

function LegacyFeedPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  // Navigation active tab
  const [activeSection, setActiveSection] = useState<'feed' | 'search' | 'account'>('feed');

  useEffect(() => {
    const supabase = createClientSupabaseClient();

    async function loadData() {
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (!user || userError) {
        router.push('/auth/login');
        return;
      }

      setUser(user);

      // Load user profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileData) {
        setProfile(profileData);
        // Show onboarding if preferred airlines or country is not set
        if (!profileData.preferred_airlines || profileData.preferred_airlines.length === 0 || !profileData.country) {
          setShowOnboarding(true);
        }
      }

      // Load flights
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
  }, [router]);

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

  const handleUpdateCountry = useCallback(async (newCountry: string) => {
    if (!user) return;
    const supabase = createClientSupabaseClient();
    const { error } = await supabase
      .from('profiles')
      .update({ country: newCountry, updated_at: new Date().toISOString() })
      .eq('id', user.id);

    if (!error) {
      setProfile((prev: any) => ({ ...prev, country: newCountry }));
    } else {
      alert(`Errore nell'aggiornare lo Stato: ${error.message}`);
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center gap-4">
        <span className="w-12 h-12 border-4 border-blue-600/30 border-t-blue-500 rounded-full animate-spin"></span>
        <p className="text-slate-400 text-sm">Caricamento radar voli...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <main className="min-h-screen bg-slate-900 text-white pb-16">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-600/20 text-blue-400 rounded-lg">
              <Plane className="w-5 h-5 rotate-45" />
            </div>
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              FlyDetector
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-slate-400 text-xs hidden sm:block bg-slate-800 px-3 py-1.5 rounded-full border border-slate-700/40">
              {user.email}
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700/60 transition-all shadow-sm"
            >
              <LogOut className="w-4 h-4" />
              Esci
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Bar */}
      <nav className="bg-slate-800 border-b border-slate-700/50 sticky top-[69px] z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-6 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveSection('feed')}
              className={`py-4 px-1 font-bold text-sm border-b-2 transition-all flex items-center gap-2 shrink-0 ${
                activeSection === 'feed'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Plane className="w-4 h-4 rotate-45" />
              Feed Voli
            </button>
            <button
              onClick={() => setActiveSection('search')}
              className={`py-4 px-1 font-bold text-sm border-b-2 transition-all flex items-center gap-2 shrink-0 ${
                activeSection === 'search'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sliders className="w-4 h-4" />
              Focus & Radar
            </button>
            <button
              onClick={() => setActiveSection('account')}
              className={`py-4 px-1 font-bold text-sm border-b-2 transition-all flex items-center gap-2 shrink-0 ${
                activeSection === 'account'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <User className="w-4 h-4" />
              Account & GDPR
            </button>
          </div>
        </div>
      </nav>

      {/* Content wrapper */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {activeSection === 'feed' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-black tracking-tight mb-1 text-white">Tariffe Radar Voli</h1>
              <p className="text-slate-400 text-sm">
                {flights.length > 0
                  ? `${flights.length} offerte trovate · ordinate per prezzo`
                  : 'Nessun volo trovato. Sincronizza il feed per caricare offerte in tempo reale.'}
              </p>
            </div>
            <FlightFeed
              initialFlights={flights}
              preferredAirlines={profile?.preferred_airlines || []}
              userCountry={profile?.country}
            />
          </div>
        )}

        {activeSection === 'search' && (
          <div className="space-y-6 max-w-4xl mx-auto">
            <div>
              <h1 className="text-3xl font-black tracking-tight mb-1 text-white">Focus Alerts & Radar</h1>
              <p className="text-slate-400 text-sm">
                Crea filtri personalizzati per monitorare rotte specifiche e ricevere notifiche email all&apos;istante.
              </p>
            </div>
            <FocusAlertManager userId={user.id} />
          </div>
        )}

        {activeSection === 'account' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div>
              <h1 className="text-3xl font-black tracking-tight mb-1 text-white">Impostazioni & Privacy</h1>
              <p className="text-slate-400 text-sm">
                Gestisci le tue preferenze geografiche, notifiche email e diritti sulla privacy.
              </p>
            </div>

            <div className="bg-slate-800 border border-slate-700/60 rounded-2xl p-6 shadow-md space-y-6">
              {/* Account info & Geographical preferences */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-700/40 pb-3">
                  <Globe className="w-5 h-5 text-blue-400" />
                  <h2 className="text-lg font-bold text-white tracking-tight">Preferenze Geografiche</h2>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Stato di residenza / partenza principale
                  </label>
                  <p className="text-[11px] text-slate-400 mb-1">
                    Il feed principale mostrerà preferibilmente i voli in partenza da questo Stato.
                  </p>
                  <select
                    value={profile?.country || 'Italia'}
                    onChange={(e) => handleUpdateCountry(e.target.value)}
                    className="px-3.5 py-2.5 bg-slate-900 border border-slate-700 text-white rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm max-w-xs"
                  >
                    {COUNTRIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Notification toggle */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-2 border-b border-slate-700/40 pb-3">
                  <Bell className="w-5 h-5 text-indigo-400" />
                  <h2 className="text-lg font-bold text-white tracking-tight">Notifiche</h2>
                </div>

                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={profile?.email_notifications_enabled ?? true}
                    onChange={(e) => handleToggleNotifications(e.target.checked)}
                    className="mt-1 w-4.5 h-4.5 rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex flex-col">
                    <span className="text-slate-200 text-sm font-semibold">Notifiche Email Attive</span>
                    <span className="text-slate-400 text-xs mt-0.5 leading-relaxed">
                      Ricevi avvisi email immediati quando un volo corrisponde ai tuoi Radar attivi.
                    </span>
                  </div>
                </label>
              </div>

              {/* Preferred airlines list */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-2 border-b border-slate-700/40 pb-3">
                  <Plane className="w-5 h-5 text-emerald-400 rotate-45" />
                  <h2 className="text-lg font-bold text-white tracking-tight">Compagnie Preferite</h2>
                </div>

                {profile?.preferred_airlines && profile.preferred_airlines.length > 0 ? (
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {profile.preferred_airlines.map((airline: string) => (
                        <span
                          key={airline}
                          className="px-3 py-1 bg-blue-600/10 text-blue-400 border border-blue-500/20 rounded-lg font-bold text-xs"
                        >
                          {airline}
                        </span>
                      ))}
                    </div>
                    <button
                      onClick={() => setShowOnboarding(true)}
                      className="text-xs text-blue-400 hover:text-blue-300 font-semibold underline block pt-1"
                    >
                      Modifica compagnie preferite
                    </button>
                  </div>
                ) : (
                  <div className="text-slate-400 text-xs">
                    Nessuna compagnia aerea preferita selezionata.{' '}
                    <button
                      onClick={() => setShowOnboarding(true)}
                      className="text-blue-400 hover:text-blue-300 underline font-semibold ml-1"
                    >
                      Configura ora
                    </button>
                  </div>
                )}
              </div>

              {/* GDPR - Elimina account */}
              <div className="border-t border-slate-700/60 pt-6">
                <div className="flex items-start gap-3 bg-red-950/20 border border-red-500/10 p-4 rounded-xl mb-4">
                  <Info className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-red-200">Diritto all&apos;Oblio (Art. 17 GDPR)</p>
                    <p className="text-[11px] text-red-200/70 leading-relaxed mt-1">
                      Ai sensi del Regolamento Generale sulla Protezione dei Dati, la cancellazione dell&apos;account comporterà la rimozione immediata e definitiva di tutte le tue informazioni personali dal nostro database, inclusi profilo utente, preferenze, radar registrati e log storici delle email.
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteLoading}
                  className="w-full py-3 px-4 border border-red-500/30 hover:bg-red-500/10 text-red-400 font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm"
                >
                  <Trash2 className="w-4.5 h-4.5" />
                  {deleteLoading ? 'Eliminazione in corso...' : 'Elimina Definitivamente Account (GDPR)'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Onboarding modal */}
      {showOnboarding && (
        <OnboardingModal
          userId={user.id}
          onComplete={(airlines, country) => {
            setProfile((prev: any) => ({ ...prev, preferred_airlines: airlines, country }));
            setShowOnboarding(false);
          }}
        />
      )}
    </main>
  );
}

