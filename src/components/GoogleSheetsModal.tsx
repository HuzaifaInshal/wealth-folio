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
  ExternalLink,
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
    <div className="fixed inset-0 bg-[#1A1A1A]/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white border border-[#DCDAD2] w-full max-w-2xl rounded-none shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-[#DCDAD2] flex items-center justify-between bg-[#F9F8F6]">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-700 text-white rounded-none">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-[#1A1A1A]">
                Google Sheets Local Database Sync
              </h3>
              <p className="text-xs text-[#8C8C85] font-serif italic">
                Store your financial records in your personal Google Sheet for 100% privacy and ownership
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#8C8C85] hover:text-[#1A1A1A] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-left">
          {/* Privacy badge */}
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center space-x-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-700 flex-shrink-0" />
            <span>
              <strong>Zero third-party access:</strong> Data is sent directly from your browser to your own Google Sheet. No intermediate servers touch your financials.
            </span>
          </div>

          {/* Web App URL Input */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-[#1A1A1A] uppercase tracking-wider block">
              Google Apps Script Web App URL
            </label>
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://script.google.com/macros/s/AKfycbx.../exec"
              className="w-full px-3.5 py-2.5 bg-white border border-[#DCDAD2] text-xs font-mono focus:outline-hidden focus:border-[#1A1A1A] text-[#1A1A1A]"
            />
            <p className="text-[10px] text-[#8C8C85] font-serif italic">
              Paste the Web App deployment URL generated from your Google Sheet&apos;s Apps Script.
            </p>
          </div>

          {/* Sync Options */}
          <div className="flex items-center justify-between border-t border-b border-[#F1EFEA] py-3">
            <div>
              <span className="text-xs font-bold text-[#1A1A1A] block">Auto-Sync Transactions</span>
              <span className="text-[10px] text-[#8C8C85] font-serif italic">
                Automatically post deposits, withdrawals, and revaluations to your Sheet
              </span>
            </div>
            <input
              type="checkbox"
              checked={autoSyncInput}
              onChange={(e) => setAutoSyncInput(e.target.checked)}
              className="w-4 h-4 accent-[#1A1A1A] cursor-pointer"
            />
          </div>

          {/* Status message */}
          {syncStatusMsg && (
            <div className="p-3 bg-[#F9F8F6] border border-[#DCDAD2] text-xs font-serif italic text-[#1A1A1A]">
              {syncStatusMsg}
            </div>
          )}

          {/* Step-by-Step Setup Guide */}
          <div className="border border-[#DCDAD2] p-4 bg-[#F9F8F6] space-y-3">
            <div className="flex items-center justify-between border-b border-[#DCDAD2] pb-2">
              <h4 className="font-serif font-bold text-xs text-[#1A1A1A] uppercase tracking-wider">
                1-Minute Setup Instructions
              </h4>
              <button
                onClick={handleCopyScript}
                className="px-2.5 py-1 bg-[#1A1A1A] text-white text-[10px] font-bold uppercase tracking-wider flex items-center space-x-1 hover:bg-[#3E3E39] cursor-pointer"
              >
                {isCopied ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span>Copied Code!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy Apps Script</span>
                  </>
                )}
              </button>
            </div>
            <ol className="text-xs text-[#6B6B66] font-serif italic space-y-1.5 list-decimal pl-4 leading-relaxed">
              <li>Open your Google Sheet (or create a new blank Google Sheet).</li>
              <li>Click <strong>Extensions $\rightarrow$ Apps Script</strong> in top menu.</li>
              <li>Delete any code in the editor and click <strong>Copy Apps Script</strong> above, then paste into the editor.</li>
              <li>Click <strong>Deploy $\rightarrow$ New Deployment</strong>. Select type <strong>Web app</strong>.</li>
              <li>Set <em>Execute as</em>: <strong>Me</strong> and <em>Who has access</em>: <strong>Anyone</strong>.</li>
              <li>Click <strong>Deploy</strong>, authorize permissions, copy the Web App URL, and paste it above!</li>
            </ol>
          </div>

          {/* Offline CSV Backups */}
          <div className="border-t border-[#DCDAD2] pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-[#1A1A1A] block">Offline File Backups</span>
              <span className="text-[10px] text-[#8C8C85] font-serif italic">
                Download raw CSV files anytime to inspect or import into Excel / Google Sheets
              </span>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => exportInvestmentsCSV(investments)}
                className="px-3 py-1.5 border border-[#DCDAD2] bg-white text-[#1A1A1A] hover:bg-[#F9F8F6] text-[10px] font-bold uppercase tracking-wider flex items-center space-x-1 cursor-pointer"
              >
                <Download className="w-3 h-3" />
                <span>Investments CSV</span>
              </button>
              <button
                onClick={() => exportTransactionsCSV(transactions, investments)}
                className="px-3 py-1.5 border border-[#DCDAD2] bg-white text-[#1A1A1A] hover:bg-[#F9F8F6] text-[10px] font-bold uppercase tracking-wider flex items-center space-x-1 cursor-pointer"
              >
                <Download className="w-3 h-3" />
                <span>Transactions CSV</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-[#F9F8F6] border-t border-[#DCDAD2] flex justify-between items-center">
          <button
            onClick={handleSyncNow}
            disabled={isTesting || !urlInput.trim()}
            className="px-4 py-2 bg-white border border-[#DCDAD2] hover:bg-[#F3F1EC] text-[#1A1A1A] text-[10px] font-bold uppercase tracking-wider flex items-center space-x-1.5 disabled:opacity-40 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
            <span>Sync Portfolio Now</span>
          </button>
          <div className="flex space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-[#DCDAD2] bg-white text-[#8C8C85] hover:text-[#1A1A1A] text-[10px] font-bold uppercase tracking-wider cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isTesting}
              className="px-5 py-2 bg-[#1A1A1A] hover:bg-[#3E3E39] text-white text-[10px] font-bold uppercase tracking-wider cursor-pointer"
            >
              {isTesting ? 'Connecting...' : 'Save Settings'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
