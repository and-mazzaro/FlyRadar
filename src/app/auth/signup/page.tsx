'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { createClientSupabaseClient } from '@/lib/supabase';
import { Plane, AlertCircle } from 'lucide-react';

const COUNTRIES = ['Italia', 'Spagna', 'Francia', 'Regno Unito', 'Germania', 'Paesi Bassi', 'Grecia', 'Portogallo', 'Svizzera', 'Austria', 'Belgio', 'Polonia', 'Turchia', 'Altro'];

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [country, setCountry] = useState('Italia');
  const [loading, setLoading] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptNotifications, setAcceptNotifications] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!acceptTerms) {
      setErrorMsg('Devi accettare i Termini di Servizio per proseguire.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    const supabase = createClientSupabaseClient();
    
    // Pass user preferences as options.data so that profiles trigger picks them up or they can be adjusted on onboarding
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
          data: { country, email_notifications_enabled: acceptNotifications },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
      // Supposing auto-login is active, or email confirmation is required.
      // Supabase is configured to create the profile table record on signup hook.
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-xl z-10 backdrop-blur-md">
        <div className="flex flex-col items-center mb-8">
          <div className="p-3 bg-blue-600/20 text-blue-400 rounded-xl mb-4">
            <Plane className="w-8 h-8 rotate-45" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Crea Account</h1>
          <p className="text-slate-400 text-sm mt-2 text-center">Inizia a monitorare i tuoi voli aerei a basso costo preferiti</p>
        </div>

        {success ? (
          <div className="text-center py-6">
            <div className="inline-flex p-3 bg-emerald-950 border border-emerald-500/30 text-emerald-400 rounded-full mb-4">
              <Plane className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Registrazione avviata!</h2>
            <p className="text-slate-300 text-sm mb-6">
              Controlla la tua casella email per confermare l&apos;indirizzo ed effettuare il primo accesso.
            </p>
            <Link
              href="/auth/login"
              className="inline-block py-3 px-6 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-colors"
            >
              Vai alla pagina di Login
            </Link>
          </div>
        ) : (
          <>
            {errorMsg && (
              <div className="mb-6 p-4 bg-red-900/30 border border-red-500/50 rounded-xl flex items-start gap-3 text-red-200 text-sm">
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSignup} className="space-y-5">
              <div>
                <label className="block text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2">Stato di partenza principale</label>
                <select
                  required
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                >
                  {COUNTRIES.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2">Indirizzo Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 text-white rounded-xl placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="•••••••• (min. 6 caratteri)"
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 text-white rounded-xl placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                />
              </div>

              {/* GDPR Compliance & Terms of Service */}
              <div className="space-y-3 pt-2">
                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded border-slate-700 bg-slate-800 text-blue-600 focus:ring-blue-500 focus:ring-offset-slate-900"
                  />
                  <span className="text-slate-400 text-xs leading-normal">
                    Accetto i <span className="text-blue-400 underline">Termini di Servizio</span> e la <span className="text-blue-400 underline">Privacy Policy</span> (GDPR).
                  </span>
                </label>

                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={acceptNotifications}
                    onChange={(e) => setAcceptNotifications(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded border-slate-700 bg-slate-800 text-blue-600 focus:ring-blue-500 focus:ring-offset-slate-900"
                  />
                  <span className="text-slate-400 text-xs leading-normal">
                    Desidero ricevere avvisi via email quando vengono trovati voli idonei (Focus Alerts).
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all disabled:opacity-50 flex justify-center items-center"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                ) : (
                  'Registrati'
                )}
              </button>
            </form>

            <div className="mt-8 text-center border-t border-slate-800 pt-6">
              <p className="text-slate-400 text-sm">
                Hai già un account?{' '}
                <Link href="/auth/login" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">
                  Accedi
                </Link>
              </p>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
