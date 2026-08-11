/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useTheme } from '../context/ThemeContext';
import {
  Landmark,
  LayoutDashboard,
  History,
  Sun,
  Moon,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';

import React from 'react';
import { useTheme } from '../context/ThemeContext';
import {
  Landmark,
  LayoutDashboard,
  History,
  Sun,
  Moon,
  ShieldCheck,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  X,
} from 'lucide-react';

interface SidebarProps {
  activeTab: 'dashboard' | 'ledger';
  setActiveTab: (tab: 'dashboard' | 'ledger') => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  isCollapsed,
  onToggleCollapse,
  isMobileOpen = false,
  onCloseMobile,
}: SidebarProps) {
  const { theme, toggleTheme } = useTheme();

  const sidebarContent = (
    <div className="flex flex-col justify-between h-full p-4 font-sans">
      {/* Top Branding & Nav */}
      <div className="space-y-5">
        {/* Brand Header */}
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} px-1 py-1`}>
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-slate-900 dark:bg-purple-600 text-white rounded-lg shadow-xs">
              <Landmark className="w-5 h-5" />
            </div>
            {!isCollapsed && (
              <div>
                <h1 className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center">
                  Wealth <span className="text-slate-400 dark:text-purple-400 font-semibold ml-1">Folio</span>
                </h1>
                <p className="text-[9px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                  Personal Vault
                </p>
              </div>
            )}
          </div>

          {/* Desktop Collapse Toggle */}
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
          </button>

          {/* Mobile Close Button */}
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Nav Items */}
        <div className="space-y-1 pt-2">
          {!isCollapsed && (
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-2 block mb-1.5">
              Navigation
            </span>
          )}

          <button
            onClick={() => {
              setActiveTab('dashboard');
              if (onCloseMobile) onCloseMobile();
            }}
            title="Dashboard Overview"
            className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-slate-900 text-white dark:bg-purple-600/20 dark:text-purple-400 dark:border dark:border-purple-500/30 shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-200'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <LayoutDashboard className="w-4 h-4 shrink-0" />
              {!isCollapsed && <span>Dashboard</span>}
            </div>
            {!isCollapsed && activeTab === 'dashboard' && (
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-purple-400" />
            )}
          </button>

          <button
            onClick={() => {
              setActiveTab('ledger');
              if (onCloseMobile) onCloseMobile();
            }}
            title="Ledger Activity"
            className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'ledger'
                ? 'bg-slate-900 text-white dark:bg-purple-600/20 dark:text-purple-400 dark:border dark:border-purple-500/30 shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-200'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <History className="w-4 h-4 shrink-0" />
              {!isCollapsed && <span>Ledger</span>}
            </div>
            {!isCollapsed && activeTab === 'ledger' && (
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-purple-400" />
            )}
          </button>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800/80">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} p-2 bg-slate-50 dark:bg-[#181924] border border-slate-200/80 dark:border-slate-800/80 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer`}
        >
          <div className="flex items-center space-x-2">
            {theme === 'dark' ? (
              <Moon className="w-4 h-4 text-purple-400 shrink-0" />
            ) : (
              <Sun className="w-4 h-4 text-amber-500 shrink-0" />
            )}
            {!isCollapsed && <span>{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>}
          </div>
          {!isCollapsed && (
            <span className="text-[9px] uppercase font-bold text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded-md bg-slate-200/80 dark:bg-slate-800">
              {theme}
            </span>
          )}
        </button>

        {/* Security badge */}
        {!isCollapsed && (
          <div className="p-2.5 bg-slate-50 dark:bg-[#181924] rounded-lg border border-slate-200/60 dark:border-slate-800/60 text-[10px] text-slate-600 dark:text-slate-400 flex items-center space-x-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-500 shrink-0" />
            <span className="line-clamp-1">100% Private Local Storage</span>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sticky Sidebar */}
      <aside
        className={`${
          isCollapsed ? 'w-20' : 'w-60'
        } shrink-0 hidden lg:flex flex-col h-screen sticky top-0 bg-white dark:bg-[#12131A] border-r border-slate-200/80 dark:border-slate-800/80 transition-all duration-200 z-40`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs"
            onClick={onCloseMobile}
          />
          <aside className="relative w-64 bg-white dark:bg-[#12131A] h-full shadow-2xl z-10 flex flex-col">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
