/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useTheme } from '../context/ThemeContext';
import {
  Landmark,
  LayoutDashboard,
  Layers,
  FileSpreadsheet,
  History,
  Sun,
  Moon,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';

interface SidebarProps {
  activeTab: 'dashboard' | 'sources' | 'ledger';
  setActiveTab: (tab: 'dashboard' | 'sources' | 'ledger') => void;
}

export default function Sidebar({
  activeTab,
  setActiveTab,
}: SidebarProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <aside className="w-64 shrink-0 hidden lg:flex flex-col justify-between h-screen sticky top-0 p-5 bg-white dark:bg-[#12131A] border-r border-slate-200/80 dark:border-slate-800/80 transition-colors duration-200 font-sans z-40">
      {/* Top Branding Header */}
      <div className="space-y-6">
        <div className="flex items-center space-x-3 px-2 py-1">
          <div className="p-2.5 bg-slate-900 dark:bg-purple-600 text-white rounded-xl shadow-md shadow-slate-900/10 dark:shadow-purple-600/20">
            <Landmark className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center">
              Wealth <span className="text-slate-400 dark:text-purple-400 font-semibold ml-1">Folio</span>
            </h1>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
              Personal Vault
            </p>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3 block mb-2">
            Navigation
          </span>

          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-slate-900 text-white dark:bg-purple-600/20 dark:text-purple-400 dark:border dark:border-purple-500/30 shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-200'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard Overview</span>
            </div>
            {activeTab === 'dashboard' && <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-purple-400" />}
          </button>

          <button
            onClick={() => {
              setActiveTab('sources');
              const el = document.getElementById('investment-sources-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'sources'
                ? 'bg-slate-900 text-white dark:bg-purple-600/20 dark:text-purple-400 dark:border dark:border-purple-500/30 shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-200'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <Layers className="w-4 h-4" />
              <span>Asset Holdings</span>
            </div>
          </button>

          <button
            onClick={() => {
              setActiveTab('ledger');
              const el = document.getElementById('transaction-ledger-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'ledger'
                ? 'bg-slate-900 text-white dark:bg-purple-600/20 dark:text-purple-400 dark:border dark:border-purple-500/30 shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-200'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <History className="w-4 h-4" />
              <span>Ledger Activity</span>
            </div>
          </button>
        </div>
      </div>

      {/* Bottom Footer Controls: Theme Toggle & Security Note */}
      <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800/80">
        {/* Theme Mode Toggle Button */}
        <button
          onClick={toggleTheme}
          className="w-full flex items-center justify-between p-2.5 bg-slate-50 dark:bg-[#181924] border border-slate-200/80 dark:border-slate-800/80 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
        >
          <div className="flex items-center space-x-2">
            {theme === 'dark' ? (
              <Moon className="w-4 h-4 text-purple-400" />
            ) : (
              <Sun className="w-4 h-4 text-amber-500" />
            )}
            <span>{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
          </div>
          <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-full bg-slate-200/80 dark:bg-slate-800">
            {theme}
          </span>
        </button>

        {/* Security badge */}
        <div className="p-3 bg-slate-50 dark:bg-[#181924] rounded-xl border border-slate-200/60 dark:border-slate-800/60 text-[11px] text-slate-600 dark:text-slate-400 flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-500 shrink-0" />
          <span className="line-clamp-2">100% Private Local & Google Sheet Storage</span>
        </div>
      </div>
    </aside>
  );
}
