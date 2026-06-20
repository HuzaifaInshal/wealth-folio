/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { Coins, Shield, ArrowRightLeft, Folder, Scale, ChevronRight } from 'lucide-react';

interface LandingPageProps {
  onEnterApp: () => void;
}

export default function LandingPage({ onEnterApp }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-[#F9F8F6] text-[#1A1A1A] font-sans flex flex-col selection:bg-[#1A1A1A] selection:text-white overflow-x-hidden">
      
      {/* Premium Header */}
      <header className="bg-white border-b border-[#DCDAD2] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between">
          <div className="flex items-center space-x-3.5">
            <div className="p-2.5 bg-[#1A1A1A] text-white rounded-none border border-[#1A1A1A]">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-serif font-bold text-[#1A1A1A] tracking-tight flex items-center">
                Wealth <span className="font-serif italic font-normal text-[#8C8C85] ml-1.5">Folio</span>
              </h1>
              <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-[#8C8C85] mt-0.5">
                Oikos Financial Ledger & Vaults
              </p>
            </div>
          </div>
          <div>
            <button
              onClick={onEnterApp}
              className="px-5 py-2.5 bg-[#1A1A1A] hover:bg-[#3E3E39] text-white text-[10px] uppercase tracking-widest font-bold transition-all cursor-pointer flex items-center space-x-1.5"
            >
              <span>Launch Dashboard</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Sections */}
      <main className="flex-1">
        
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Text Column */}
          <div className="lg:col-span-7 space-y-8 text-left">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-4"
            >
              <span className="inline-flex items-center text-[10px] font-bold tracking-widest uppercase text-[#8C8C85] border border-[#DCDAD2] px-3 py-1 bg-white">
                Personal Capital Management
              </span>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-[#1A1A1A] tracking-tight leading-[1.08] text-balance">
                A beautifully segregated, visual ledger for <span className="italic font-normal text-[#8C8C85]">your wealth.</span>
              </h2>
              <p className="text-base sm:text-lg text-[#6B6B66] font-serif italic leading-relaxed max-w-2xl text-pretty pt-2">
                Wealth Folio structure empowers you to manage discrete asset groups, visualize internal capital rebalancing, and track performance indicators from a single unified local dashboard.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <button
                onClick={onEnterApp}
                className="px-8 py-4 bg-[#1A1A1A] hover:bg-[#3E3E39] text-white font-bold uppercase tracking-widest text-xs transition-all cursor-pointer border border-[#1A1A1A] shadow-md flex items-center justify-center space-x-2"
              >
                <span>Enter Your Vaults</span>
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => { window.location.hash = '#/'; }}
                className="px-8 py-4 bg-white border border-[#DCDAD2] hover:border-[#1A1A1A] text-[#1A1A1A] font-bold uppercase tracking-widest text-xs transition-all cursor-pointer flex items-center justify-center"
              >
                Explore Active Groups
              </button>
            </motion.div>

            {/* Micro Stats Banner */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="border-t border-[#DCDAD2] pt-8 grid grid-cols-3 gap-6 max-w-lg"
            >
              <div>
                <span className="text-[9px] font-bold text-[#8C8C85] uppercase tracking-[0.12em] block">Data Privacy</span>
                <span className="text-base font-serif text-[#1A1A1A] font-bold block mt-1">100% Local</span>
              </div>
              <div>
                <span className="text-[9px] font-bold text-[#8C8C85] uppercase tracking-[0.12em] block">Interface</span>
                <span className="text-base font-serif text-[#1A1A1A] font-bold block mt-1">High-Density</span>
              </div>
              <div>
                <span className="text-[9px] font-bold text-[#8C8C85] uppercase tracking-[0.12em] block">Engine</span>
                <span className="text-base font-serif text-[#1A1A1A] font-bold block mt-1">State Sync</span>
              </div>
            </motion.div>
          </div>

          {/* Right Image/Illustration Column */}
          <div className="lg:col-span-5 flex justify-center items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.65, ease: 'easeOut' }}
              className="relative p-2 bg-white border border-[#DCDAD2] shadow-2xl max-w-md w-full aspect-square overflow-hidden"
            >
              <img
                src="/home/huzaifai/.gemini/antigravity-ide/brain/9953650e-a44c-4da1-bd2b-3127fff7a37b/landing_hero_illustration_1781988113229.png"
                alt="Wealth Folio Abstract Ledger Visual"
                className="w-full h-full object-cover select-none pointer-events-none"
              />
            </motion.div>
          </div>

        </section>

        {/* Core Features Grid */}
        <section className="bg-white border-t border-b border-[#DCDAD2] py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            
            <div className="text-center space-y-3 max-w-3xl mx-auto">
              <span className="text-[10px] font-bold text-[#8C8C85] uppercase tracking-[0.25em] block">Engineered for Transparency</span>
              <h3 className="text-3xl font-serif font-bold text-[#1A1A1A] tracking-tight">Key Capabilities & Features</h3>
              <p className="text-xs text-[#6B6B66] font-serif italic max-w-xl mx-auto leading-relaxed">
                Take full control of your asset structure without relying on external cloud integrations or database compromises.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
              
              {/* Feature 1 */}
              <div className="border border-[#DCDAD2] p-6 hover:border-[#1A1A1A] transition-colors flex flex-col space-y-4">
                <div className="p-3 bg-[#F9F8F6] text-[#1A1A1A] border border-[#DCDAD2] self-start">
                  <Folder className="w-5 h-5" />
                </div>
                <div className="space-y-1.5">
                  <h4 className="text-base font-serif font-bold text-[#1A1A1A]">Asset Segregation</h4>
                  <p className="text-xs text-[#6B6B66] leading-relaxed font-serif italic">
                    Group assets by context (e.g. personal expenses, business, retirement accounts) to maintain strict barrier isolations.
                  </p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="border border-[#DCDAD2] p-6 hover:border-[#1A1A1A] transition-colors flex flex-col space-y-4">
                <div className="p-3 bg-[#F9F8F6] text-[#1A1A1A] border border-[#DCDAD2] self-start">
                  <ArrowRightLeft className="w-5 h-5 text-blue-700" />
                </div>
                <div className="space-y-1.5">
                  <h4 className="text-base font-serif font-bold text-[#1A1A1A]">Visual Flow Maps</h4>
                  <p className="text-xs text-[#6B6B66] leading-relaxed font-serif italic">
                    Trace transactions, deposits, and outflows visually via node connection lines and directional paths.
                  </p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="border border-[#DCDAD2] p-6 hover:border-[#1A1A1A] transition-colors flex flex-col space-y-4">
                <div className="p-3 bg-[#F9F8F6] text-[#1A1A1A] border border-[#DCDAD2] self-start">
                  <Shield className="w-5 h-5 text-emerald-700" />
                </div>
                <div className="space-y-1.5">
                  <h4 className="text-base font-serif font-bold text-[#1A1A1A]">Local Storage Engine</h4>
                  <p className="text-xs text-[#6B6B66] leading-relaxed font-serif italic">
                    Your financial statement balances are secured entirely on your machine. Data persistence with zero cloud risk.
                  </p>
                </div>
              </div>

              {/* Feature 4 */}
              <div className="border border-[#DCDAD2] p-6 hover:border-[#1A1A1A] transition-colors flex flex-col space-y-4">
                <div className="p-3 bg-[#F9F8F6] text-[#1A1A1A] border border-[#DCDAD2] self-start">
                  <Scale className="w-5 h-5 text-amber-700" />
                </div>
                <div className="space-y-1.5">
                  <h4 className="text-base font-serif font-bold text-[#1A1A1A]">High Information Density</h4>
                  <p className="text-xs text-[#6B6B66] leading-relaxed font-serif italic">
                    Premium typography layout and analytical details give you a comprehensive overview at first glance.
                  </p>
                </div>
              </div>

            </div>

          </div>
        </section>

        {/* Data Security Callout */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center space-y-6">
          <div className="inline-flex p-3.5 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-full">
            <Shield className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-serif font-bold text-[#1A1A1A] tracking-tight">Your Financial Ledger, Fully Offline</h3>
            <p className="text-xs text-[#6B6B66] font-serif italic max-w-lg mx-auto leading-relaxed">
              We believe your net worth is confidential. Wealth Folio doesn't make API calls to bank accounts or upload credentials to servers. Everything runs entirely locally in your browser state engine.
            </p>
          </div>
          <div className="pt-2">
            <button
              onClick={onEnterApp}
              className="px-6 py-3 bg-[#1A1A1A] hover:bg-[#3E3E39] text-white font-bold uppercase tracking-widest text-[10px] transition-all cursor-pointer border border-[#1A1A1A]"
            >
              Start Tracking Now
            </button>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-[#DCDAD2] py-8 text-center text-xs text-[#8C8C85] mt-auto">
        <div className="max-w-7xl mx-auto px-4 font-serif italic space-y-1">
          <p>© 2026 Savings and Investment Tracker • Secured Locally via State Persistence Engine</p>
          <p className="text-[10px] font-sans not-italic uppercase tracking-widest text-[#B5B3AC]">Designed with desktop density and micro-animations for clean wealth overview</p>
        </div>
      </footer>

    </div>
  );
}
