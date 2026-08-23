/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { GoogleSheetConfig, InvestmentSource, LedgerTransaction } from '../types';
import {
  APPS_SCRIPT_TEMPLATE,
  testSheetConnection,
  syncFullLedgerToSheet,
  exportInvestmentsCSV,
  exportTransactionsCSV,
} from '../services/googleSheets';
import {
  FileSpreadsheet,
  X,
  Copy,
  Check,
  RefreshCw,
  Download,
  ShieldCheck,
} from 'lucide-react';

interface GoogleSheetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: GoogleSheetConfig;
  onSaveConfig: (newConfig: GoogleSheetConfig) => void;
  investments: InvestmentSource[];
  transactions: LedgerTransaction[];
}

export default function GoogleSheetsModal({
  isOpen,
  onClose,
  config,
  onSaveConfig,
  investments,
  transactions,
}: GoogleSheetsModalProps) {
  const [urlInput, setUrlInput] = useState(config.webAppUrl);
  const [autoSyncInput, setAutoSyncInput] = useState(config.autoSync);
  const [isCopied, setIsCopied] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState('');

  if (!isOpen) return null;

  const handleCopyScript = () => {
    navigator.clipboard.writeText(APPS_SCRIPT_TEMPLATE);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  const handleSave = async () => {
    setIsTesting(true);
    setSyncStatusMsg('');
    const trimmed = urlInput.trim();

    if (trimmed) {
      const ok = await testSheetConnection(trimmed);
      if (ok) {
        setSyncStatusMsg('Connected successfully to your Google Sheet App!');
        await syncFullLedgerToSheet(trimmed, investments);
      } else {
        setSyncStatusMsg('Could not verify endpoint URL. Config saved.');
      }
    } else {
      setSyncStatusMsg('Saved without Google Sheet sync URL.');
    }

    setIsTesting(false);
    onSaveConfig({
      webAppUrl: trimmed,
      autoSync: autoSyncInput,
      lastSyncedAt: new Date().toISOString(),
    });
  };

  const handleSyncNow = async () => {
    if (!urlInput.trim()) {
      setSyncStatusMsg('Please enter a Google Apps Script Web App URL first.');
      return;
    }
    setIsTesting(true);
    setSyncStatusMsg('Syncing full portfolio to Google Sheet...');
    const ok = await syncFullLedgerToSheet(urlInput.trim(), investments);
    setIsTesting(false);
    if (ok) {
      setSyncStatusMsg('Full portfolio successfully synced to Google Sheet!');
      onSaveConfig({
        ...config,
        lastSyncedAt: new Date().toISOString(),
      });
    } else {
      setSyncStatusMsg('Failed to sync. Please check Web App URL permissions.');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-sans">
      <div className="bg-white dark:bg-[#181924] border border-slate-200 dark:border-slate-800/80 w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between bg-slate-50/50 dark:bg-[#12131A]/50">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-emerald-600 text-white rounded-2xl shadow-md shadow-emerald-600/20">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Google Sheets Local Database Sync
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Store your financial records in your personal Google Sheet for 100% privacy
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-left">
          {/* Privacy badge */}
          <div className="p-3.5 bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 rounded-2xl text-emerald-900 dark:text-emerald-300 text-xs flex items-center space-x-3">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="font-medium leading-relaxed">
              <strong>100% Data Privacy:</strong> Financial data is sent directly from your browser to your personal Google Sheet. No third-party servers have access.
            </span>
          </div>

          {/* Web App URL Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
              Google Apps Script Web App URL
            </label>
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://script.google.com/macros/s/AKfycbx.../exec"
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#12131A] border border-slate-200 dark:border-slate-800/80 rounded-2xl text-xs font-mono font-medium focus:outline-hidden focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-slate-900 dark:focus:ring-purple-500 transition-all text-slate-900 dark:text-white"
            />
          </div>

          {/* Sync Options */}
          <div className="flex items-center justify-between border-t border-b border-slate-100 dark:border-slate-800/80 py-3">
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-white block">Auto-Sync Transactions</span>
              <span className="text-[11px] text-slate-400 font-medium">
                Automatically post deposits, withdrawals, and revaluations to your Sheet
              </span>
            </div>
            <input
              type="checkbox"
              checked={autoSyncInput}
              onChange={(e) => setAutoSyncInput(e.target.checked)}
              className="w-4 h-4 accent-purple-600 cursor-pointer rounded-md"
            />
          </div>

          {/* Status message */}
          {syncStatusMsg && (
            <div className="p-3 bg-slate-50 dark:bg-[#12131A] border border-slate-200 dark:border-slate-800/80 text-xs font-medium text-slate-800 dark:text-slate-200 rounded-2xl">
              {syncStatusMsg}
            </div>
          )}

          {/* Step-by-Step Setup Guide */}
          <div className="border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 bg-slate-50/50 dark:bg-[#12131A]/50 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800/60 pb-2">
              <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                1-Minute Setup Instructions
              </h4>
              <button
                onClick={handleCopyScript}
                className="px-3 py-1 bg-slate-900 dark:bg-purple-600 hover:bg-slate-800 dark:hover:bg-purple-500 text-white rounded-xl text-[11px] font-semibold flex items-center space-x-1 transition-all cursor-pointer shadow-xs"
              >
                {isCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied Code!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Apps Script</span>
                  </>
                )}
              </button>
            </div>
            <ol className="text-xs text-slate-600 dark:text-slate-400 font-medium space-y-1.5 list-decimal pl-4 leading-relaxed">
              <li>Open your Google Sheet (or create a new blank Google Sheet).</li>
              <li>Click <strong>Extensions $\rightarrow$ Apps Script</strong> in top menu.</li>
              <li>Delete any code in the editor and click <strong>Copy Apps Script</strong> above, then paste into the editor.</li>
              <li>Click <strong>Deploy $\rightarrow$ New Deployment</strong>. Select type <strong>Web app</strong>.</li>
              <li>Set <em>Execute as</em>: <strong>Me</strong> and <em>Who has access</em>: <strong>Anyone</strong>.</li>
              <li>Click <strong>Deploy</strong>, authorize permissions, copy the Web App URL, and paste it above!</li>
            </ol>
          </div>

          {/* Offline CSV Backups */}
          <div className="border-t border-slate-100 dark:border-slate-800/80 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-white block">Offline File Backups</span>
              <span className="text-[11px] text-slate-400 font-medium">
                Download raw CSV files anytime to inspect or import into Excel / Google Sheets
              </span>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => exportInvestmentsCSV(investments)}
                className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold flex items-center space-x-1 cursor-pointer transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Investments CSV</span>
              </button>
              <button
                onClick={() => exportTransactionsCSV(transactions, investments)}
                className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold flex items-center space-x-1 cursor-pointer transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Transactions CSV</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50/80 dark:bg-[#12131A]/80 border-t border-slate-100 dark:border-slate-800/80 flex justify-between items-center">
          <button
            onClick={handleSyncNow}
            disabled={isTesting || !urlInput.trim()}
            className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-semibold flex items-center space-x-1.5 disabled:opacity-40 cursor-pointer transition-all shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
            <span>Sync Portfolio Now</span>
          </button>
          <div className="flex space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl text-xs font-semibold cursor-pointer transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isTesting}
              className="px-5 py-2 bg-slate-900 dark:bg-purple-600 hover:bg-slate-800 dark:hover:bg-purple-500 text-white rounded-xl text-xs font-semibold cursor-pointer transition-all shadow-md shadow-purple-600/20"
            >
              {isTesting ? 'Connecting...' : 'Save Settings'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
