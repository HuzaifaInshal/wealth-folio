/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { signInWithFirebaseGoogle } from '../config/firebase';
import { Landmark, Key, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';

declare global {
  interface Window {
    google?: any;
  }
}

export default function AuthPage() {
  const { loginWithAccessToken, isSyncing, syncError } = useAuth();
  const [manualToken, setManualToken] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Dynamically load Google GIS script if not present
    if (!window.google?.accounts) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    }
  }, []);

  const handleGoogleLogin = async () => {
    setError(null);
    try {
      // 1. Try Firebase Google OAuth Authentication first
      const fbResult = await signInWithFirebaseGoogle();
      if (fbResult.accessToken) {
        await loginWithAccessToken(fbResult.accessToken);
        return;
      }
    } catch (err: any) {
      // Fallback to Google GIS Token Client if Firebase popup blocked or unconfigured
      try {
        if (window.google?.accounts?.oauth2) {
          const client = window.google.accounts.oauth2.initTokenClient({
            client_id: '928374829104-wealthfolio.apps.googleusercontent.com',
            scope: 'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile',
            callback: async (response: any) => {
              if (response.access_token) {
                await loginWithAccessToken(response.access_token);
              } else if (response.error) {
                setError(`Google OAuth Error: ${response.error}`);
              }
            },
          });
          client.requestAccessToken();
          return;
        }
      } catch (fallbackErr: any) {
        setShowManualInput(true);
        setError(err.message || 'Please provide a Google Access Token to connect your Google Sheet.');
      }
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualToken.trim()) return;
    try {
      setError(null);
      await loginWithAccessToken(manualToken.trim());
    } catch (err: any) {
      setError(err.message || 'Invalid or expired Google Access Token.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-4 font-sans relative overflow-hidden">
      {/* Background Decorative Blur Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full bg-[#181924]/90 backdrop-blur-md border border-slate-800 rounded-xl p-8 shadow-2xl space-y-6 relative z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Header Logo */}
        <div className="text-center space-y-3">
          <div className="inline-flex p-3 bg-slate-900 dark:bg-purple-600 text-white rounded-lg shadow-lg shadow-purple-600/20">
            <Landmark className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center justify-center">
              Wealth <span className="text-purple-400 font-semibold ml-1.5">Folio</span>
            </h1>
            <p className="text-xs font-semibold text-slate-400 mt-1">
              Personal Wealth Vault
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {(error || syncError) && (
          <div className="p-3 bg-rose-950/60 border border-rose-800/60 text-rose-300 text-xs font-semibold rounded-lg flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error || syncError}</span>
          </div>
        )}

        {/* Action Controls */}
        <div className="space-y-3 pt-2">
          <button
            onClick={handleGoogleLogin}
            disabled={isSyncing}
            className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold shadow-lg shadow-purple-600/30 flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-50"
          >
            {isSyncing ? (
              <span className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 animate-spin" />
                <span>Authorizing Google Account...</span>
              </span>
            ) : (
              <>
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Sign in with Google & Authorize Sheets</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </>
            )}
          </button>

          {!showManualInput ? (
            <button
              onClick={() => setShowManualInput(true)}
              className="w-full text-center text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors pt-2 block cursor-pointer"
            >
              Have a Google Access Token / Client Key?
            </button>
          ) : (
            <form onSubmit={handleManualSubmit} className="space-y-2 pt-2 border-t border-slate-800">
              <label className="block text-[11px] font-semibold text-slate-400">
                Google OAuth Access Token / Session Key
              </label>
              <div className="flex space-x-2">
                <div className="relative flex-1">
                  <Key className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    value={manualToken}
                    onChange={(e) => setManualToken(e.target.value)}
                    placeholder="Paste OAuth2 Token (ya29...)"
                    className="w-full pl-8 pr-3 py-1.5 bg-[#12131A] border border-slate-700 rounded-lg text-xs font-mono text-white focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSyncing}
                  className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Connect
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
