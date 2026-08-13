/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  User,
  Mail,
  FileSpreadsheet,
  ExternalLink,
  RefreshCw,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Link,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

export default function SettingsPage() {
  const { user, spreadsheetId, spreadsheetUrl, isSyncing, syncError, updateSpreadsheetDetails, logout } = useAuth();

  const [inputUrlOrId, setInputUrlOrId] = useState(spreadsheetId || '');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const extractSpreadsheetId = (str: string): string => {
    const trimmed = str.trim();
    if (trimmed.includes('/spreadsheets/d/')) {
      const match = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
      if (match && match[1]) return match[1];
    }
    return trimmed;
  };

  const handleUpdateSheet = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(null);
    const extractedId = extractSpreadsheetId(inputUrlOrId);
    if (!extractedId) return;

    updateSpreadsheetDetails(extractedId);
    setSuccessMsg('Google Sheet path updated successfully!');
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto font-sans pb-12">
      {/* Header */}
      <div className="border-b border-slate-200/80 dark:border-slate-800/80 pb-4">
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Vault & Account Settings
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
          Manage your Google Account session, live Google Sheets connection, and Drive storage paths.
        </p>
      </div>

      {/* Connection Status Banner */}
      <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-lg flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <div>
            <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
              Live Google Sheets Auto-Sync Active
            </h4>
            <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
              Every investment source and ledger transaction is synchronized instantly to Google Drive.
            </p>
          </div>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-200/80 dark:bg-emerald-900/80 text-emerald-800 dark:text-emerald-200 shrink-0">
          Connected
        </span>
      </div>

      {/* Google User Profile Card */}
      <div className="fintech-card p-5 rounded-lg space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-4">
          <div className="flex items-center space-x-3">
            {user?.picture ? (
              <img
                src={user.picture}
                alt={user.name}
                className="w-10 h-10 rounded-full border border-purple-500/40"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-sm">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'G'}
              </div>
            )}
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">{user?.name || 'Google User'}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center space-x-1.5 mt-0.5">
                <Mail className="w-3.5 h-3.5" />
                <span>{user?.email || 'N/A'}</span>
              </p>
            </div>
          </div>

          <button
            onClick={logout}
            className="px-3 py-1.5 border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/60 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-3 bg-slate-50 dark:bg-[#12131A] rounded-lg border border-slate-200/80 dark:border-slate-800/80">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Authentication Method
            </span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-purple-500" />
              <span>Google OAuth2 Identity Services</span>
            </span>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-[#12131A] rounded-lg border border-slate-200/80 dark:border-slate-800/80">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Drive Scope
            </span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center space-x-1.5">
              <FileSpreadsheet className="w-4 h-4 text-blue-500" />
              <span>https://www.googleapis.com/auth/spreadsheets</span>
            </span>
          </div>
        </div>
      </div>

      {/* Google Sheet Connection & Relink Card */}
      <div className="fintech-card p-5 rounded-lg space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-slate-900 dark:bg-purple-600 text-white rounded-lg">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Connected Google Sheet Vault
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                Live Google Drive spreadsheet path storing portfolio holdings & ledger logs
              </p>
            </div>
          </div>

          {spreadsheetUrl && (
            <a
              href={spreadsheetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <span>Open in Google Drive</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>

        {/* Current Sheet Path Info */}
        <div className="p-3 bg-slate-50 dark:bg-[#12131A] rounded-lg border border-slate-200/80 dark:border-slate-800/80 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Spreadsheet ID
            </span>
            <span className="font-mono text-[11px] text-purple-600 dark:text-purple-400 font-bold">
              {spreadsheetId || 'None connected'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Google Drive URL Path
            </span>
            <span className="font-mono text-[11px] text-slate-600 dark:text-slate-300 truncate max-w-xs sm:max-w-md">
              {spreadsheetUrl || 'N/A'}
            </span>
          </div>
        </div>

        {/* Form to Update/Relink Custom Google Sheet Path */}
        <form onSubmit={handleUpdateSheet} className="space-y-3 pt-2">
          <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
            Relink Custom Google Sheet Path / ID
          </label>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Paste a custom Google Sheet Drive URL or Spreadsheet ID to switch or connect a different spreadsheet.
          </p>

          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Link className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={inputUrlOrId}
                onChange={(e) => setInputUrlOrId(e.target.value)}
                placeholder="https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit"
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-[#12131A] border border-slate-200 dark:border-slate-800/80 rounded-lg text-xs text-slate-900 dark:text-white font-medium focus:outline-hidden focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-purple-500 transition-all"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-slate-900 dark:bg-purple-600 hover:bg-slate-800 dark:hover:bg-purple-500 text-white rounded-lg text-xs font-semibold cursor-pointer transition-all shrink-0"
            >
              Update & Relink Sheet
            </button>
          </div>

          {successMsg && (
            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-xs font-semibold rounded-lg flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
