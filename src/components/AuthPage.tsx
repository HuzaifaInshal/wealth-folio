/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Coins, Lock, Key, AlertTriangle, ArrowRight, Eye, EyeOff } from 'lucide-react';

interface AuthPageProps {
  onAuthenticate: (passcode: string) => string | void;
  savedPasscodeExists: boolean;
}

export default function AuthPage({ onAuthenticate, savedPasscodeExists }: AuthPageProps) {
  const [passcode, setPasscode] = useState('');
  const [confirmPasscode, setConfirmPasscode] = useState('');
  const [showPasscode, setShowPasscode] = useState(false);
  const [error, setError] = useState('');

  const isSignUp = !savedPasscodeExists;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmedPasscode = passcode.trim();
    if (!trimmedPasscode) {
      setError('Passcode cannot be empty.');
      return;
    }

    if (trimmedPasscode.length < 4) {
      setError('Passcode must be at least 4 characters long.');
      return;
    }

    if (isSignUp) {
      if (trimmedPasscode !== confirmPasscode.trim()) {
        setError('Passcodes do not match.');
        return;
      }
    }

    const authError = onAuthenticate(trimmedPasscode);
    if (authError) {
      setError(authError);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F8F6] text-[#1A1A1A] font-sans flex flex-col items-center justify-center p-4 selection:bg-[#1A1A1A] selection:text-white relative overflow-hidden">
      
      {/* Dot Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#EAE9E2_1px,transparent_1px),linear-gradient(to_bottom,#EAE9E2_1px,transparent_1px)] bg-[size:20px_20px] opacity-40 pointer-events-none"></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-md bg-white border border-[#DCDAD2] shadow-2xl p-8 z-10 space-y-8 relative"
      >
        {/* Header Logo */}
        <div className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 bg-[#1A1A1A] text-white flex items-center justify-center border border-[#1A1A1A]">
            <Coins className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h2 className="text-2xl font-serif font-bold text-[#1A1A1A] tracking-tight">
              Wealth <span className="font-serif italic font-normal text-[#8C8C85]">Folio</span>
            </h2>
            <p className="text-[9px] uppercase tracking-[0.25em] font-bold text-[#8C8C85]">
              Local Access Encryption
            </p>
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-[#FAF9F5] border border-[#DCDAD2] p-4 text-xs font-serif italic text-[#6B6B66] text-center leading-relaxed">
          {isSignUp ? (
            <span>Initialize your ledger access passcode. This password secures and unlocks your local ledger database on this browser session.</span>
          ) : (
            <span>Enter your secure access passcode to unlock your financial portfolios and rebalancing flow maps.</span>
          )}
        </div>

        {/* Error Alert */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-3.5 bg-rose-50 text-rose-800 border border-rose-100 text-xs font-serif italic flex items-center space-x-2"
            >
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-700" />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Unified Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            
            {/* Passcode Input */}
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-[#8C8C85] uppercase tracking-widest block">
                {isSignUp ? 'Create Passcode / Secret Pin' : 'Secret Access Passcode'}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-[#8C8C85]">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type={showPasscode ? 'text' : 'password'}
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder={isSignUp ? 'At least 4 characters...' : 'Enter passcode...'}
                  autoFocus
                  required
                  className="w-full pl-10 pr-10 py-3 bg-[#F9F8F6] border border-[#DCDAD2] rounded-none text-sm font-semibold focus:outline-hidden focus:bg-white focus:border-[#1A1A1A] transition-all text-[#1A1A1A]"
                />
                <button
                  type="button"
                  onClick={() => setShowPasscode(!showPasscode)}
                  className="absolute right-3 top-3 text-[#8C8C85] hover:text-[#1A1A1A]"
                >
                  {showPasscode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Passcode Input (Sign Up mode only) */}
            {isSignUp && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-1 overflow-hidden"
              >
                <label className="text-[9px] font-bold text-[#8C8C85] uppercase tracking-widest block">
                  Verify Passcode
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-[#8C8C85]">
                    <Key className="w-4 h-4" />
                  </span>
                  <input
                    type={showPasscode ? 'text' : 'password'}
                    value={confirmPasscode}
                    onChange={(e) => setConfirmPasscode(e.target.value)}
                    placeholder="Repeat passcode..."
                    required={isSignUp}
                    className="w-full pl-10 pr-4 py-3 bg-[#F9F8F6] border border-[#DCDAD2] rounded-none text-sm font-semibold focus:outline-hidden focus:bg-white focus:border-[#1A1A1A] transition-all text-[#1A1A1A]"
                  />
                </div>
              </motion.div>
            )}

          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-[#1A1A1A] hover:bg-[#3E3E39] text-white font-bold uppercase tracking-widest text-xs cursor-pointer border border-[#1A1A1A] flex items-center justify-center space-x-1.5 transition-all shadow-md"
          >
            <span>{isSignUp ? 'Create Access Signature' : 'Unlock Vault Database'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-2">
          <p className="text-[9px] text-[#8C8C85] uppercase tracking-wider font-mono">
            Secured via local storage state persistence
          </p>
        </div>
      </motion.div>
    </div>
  );
}
