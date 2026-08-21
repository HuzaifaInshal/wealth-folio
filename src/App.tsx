/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { InvestmentSource, LedgerTransaction, TransactionType, GoogleSheetConfig } from './types';
import { INITIAL_INVESTMENTS, INITIAL_TRANSACTIONS, DEFAULT_SHEET_CONFIG, DEFAULT_CATEGORIES, getCategoryDetails } from './data';
import { syncTransactionToSheet, syncFullLedgerToSheet } from './services/googleSheets';

// Import Components
import MetricCard from './components/MetricCard';
import InvestmentCard from './components/InvestmentCard';
import InvestmentFormModal from './components/InvestmentFormModal';
import TransactionModal from './components/TransactionModal';
import GoogleSheetsModal from './components/GoogleSheetsModal';
import LedgerTable from './components/LedgerTable';
import QuickActionDock from './components/QuickActionDock';

// Import Icons
import {
  Landmark,
  Plus,
  ArrowRightLeft,
  Search,
  ListFilter,
  RefreshCw,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function App() {
  // --- Persistent State ---
  const [investments, setInvestments] = useState<InvestmentSource[]>(() => {
    try {
      const saved = localStorage.getItem('wealthfolio_investments_v3');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_INVESTMENTS;
  });

  const [transactions, setTransactions] = useState<LedgerTransaction[]>(() => {
    try {
      const saved = localStorage.getItem('wealthfolio_transactions_v3');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_TRANSACTIONS;
  });

  const [sheetConfig, setSheetConfig] = useState<GoogleSheetConfig>(() => {
    try {
      const saved = localStorage.getItem('wealthfolio_sheet_config_v3');
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_SHEET_CONFIG;
  });

  // --- Local Storage Sync ---
  useEffect(() => {
    localStorage.setItem('wealthfolio_investments_v3', JSON.stringify(investments));
  }, [investments]);

  useEffect(() => {
    localStorage.setItem('wealthfolio_transactions_v3', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('wealthfolio_sheet_config_v3', JSON.stringify(sheetConfig));
  }, [sheetConfig]);

  // --- UI & Filter States ---
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [isInvestmentModalOpen, setIsInvestmentModalOpen] = useState(false);
  const [investmentToEdit, setInvestmentToEdit] = useState<InvestmentSource | null>(null);

  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [txInitialType, setTxInitialType] = useState<TransactionType>('invest');
  const [txInitialSource, setTxInitialSource] = useState<InvestmentSource | null>(null);

  const [isSheetsModalOpen, setIsSheetsModalOpen] = useState(false);

  // --- Financial Calculations ---
  const totalValuation = investments.reduce((sum, i) => sum + i.currentValuation, 0);
  const totalInvested = investments.reduce((sum, i) => sum + i.investedAmount, 0);
  const totalProfit = totalValuation - totalInvested;
  const overallROI = totalInvested > 0 ? (totalProfit / totalInvested) * 100 : 0;

  // --- Handlers ---

  const handleResetDefaults = () => {
    if (confirm('Reset portfolio data to default mock records? Any unsaved changes will be replaced.')) {
      setInvestments(INITIAL_INVESTMENTS);
      setTransactions(INITIAL_TRANSACTIONS);
    }
  };

  const handleSaveInvestmentSource = (data: {
    name: string;
    category: string;
    initialBalance: number;
    notes?: string;
  }) => {
    const timestamp = new Date().toISOString();

    if (investmentToEdit) {
      // Edit existing source
      setInvestments((prev) =>
        prev.map((i) =>
          i.id === investmentToEdit.id
            ? {
                ...i,
                name: data.name,
                category: data.category,
                notes: data.notes,
                updatedAt: timestamp,
              }
            : i
        )
      );
    } else {
      // Create new source
      const newId = `inv-${Date.now()}`;
      const newSource: InvestmentSource = {
        id: newId,
        name: data.name,
        category: data.category,
        investedAmount: data.initialBalance,
        currentValuation: data.initialBalance,
        notes: data.notes,
        createdAt: timestamp,
        updatedAt: timestamp,
      };

      setInvestments((prev) => [...prev, newSource]);

      // If starting capital is injected, record transaction
      if (data.initialBalance > 0) {
        const newTx: LedgerTransaction = {
          id: `tx-${Date.now()}`,
          type: 'invest',
          sourceId: newId,
          amount: data.initialBalance,
          note: `Initial capital allocation for ${data.name}`,
          timestamp,
        };
        setTransactions((prev) => [newTx, ...prev]);

        // Google Sheets Auto-Sync
        if (sheetConfig.webAppUrl && sheetConfig.autoSync) {
          syncTransactionToSheet(sheetConfig.webAppUrl, newTx, data.name);
        }
      }
    }
    setInvestmentToEdit(null);
  };

  const handleDeleteInvestmentSource = (id: string) => {
    const target = investments.find((i) => i.id === id);
    if (!target) return;

    if (
      confirm(
        `Permanently delete "${target.name}"?\n\nThis will remove this investment source and its associated transaction logs.`
      )
    ) {
      setInvestments((prev) => prev.filter((i) => i.id !== id));
      setTransactions((prev) => prev.filter((t) => t.sourceId !== id && t.targetId !== id));
    }
  };

  const handleExecuteTransaction = (data: {
    type: TransactionType;
    sourceId: string;
    targetId?: string;
    amount: number;
    newValuation?: number;
    note: string;
  }) => {
    const timestamp = new Date().toISOString();
    const newTxId = `tx-${Date.now()}`;

    const newTx: LedgerTransaction = {
      id: newTxId,
      type: data.type,
      sourceId: data.sourceId,
      targetId: data.targetId,
      amount: data.amount,
      newValuation: data.newValuation,
      note: data.note,
      timestamp,
    };

    setInvestments((prev) => {
      return prev.map((inv) => {
        // Revalue action
        if (data.type === 'revalue' && inv.id === data.sourceId && data.newValuation !== undefined) {
          newTx.previousValuation = inv.currentValuation;
          return {
            ...inv,
            currentValuation: data.newValuation,
            updatedAt: timestamp,
          };
        }

        // Deposit / Invest
        if (data.type === 'invest' && inv.id === data.sourceId) {
          return {
            ...inv,
            investedAmount: inv.investedAmount + data.amount,
            currentValuation: inv.currentValuation + data.amount,
            updatedAt: timestamp,
          };
        }

        // Withdraw
        if (data.type === 'withdraw' && inv.id === data.sourceId) {
          return {
            ...inv,
            investedAmount: Math.max(0, inv.investedAmount - data.amount),
            currentValuation: Math.max(0, inv.currentValuation - data.amount),
            updatedAt: timestamp,
          };
        }

        // Transfer Outflow from Source
        if (data.type === 'transfer' && inv.id === data.sourceId) {
          return {
            ...inv,
            investedAmount: Math.max(0, inv.investedAmount - data.amount),
            currentValuation: Math.max(0, inv.currentValuation - data.amount),
            updatedAt: timestamp,
          };
        }

        // Transfer Inflow to Target
        if (data.type === 'transfer' && inv.id === data.targetId) {
          return {
            ...inv,
            investedAmount: inv.investedAmount + data.amount,
            currentValuation: inv.currentValuation + data.amount,
            updatedAt: timestamp,
          };
        }

        return inv;
      });
    });

    setTransactions((prev) => [newTx, ...prev]);

    // Google Sheets Auto-Sync
    if (sheetConfig.webAppUrl && sheetConfig.autoSync) {
      const srcName = investments.find((i) => i.id === data.sourceId)?.name || data.sourceId;
      const tgtName = data.targetId ? investments.find((i) => i.id === data.targetId)?.name : undefined;
      syncTransactionToSheet(sheetConfig.webAppUrl, newTx, srcName, tgtName);
    }
  };

  const handleDeleteTransaction = (id: string) => {
    if (confirm('Delete this transaction record from the ledger?')) {
      setTransactions((prev) => prev.filter((t) => t.id !== id));
    }
  };

  // Helper shortcuts
  const openActionForInvestment = (inv: InvestmentSource, type: TransactionType) => {
    setTxInitialSource(inv);
    setTxInitialType(type);
    setIsTxModalOpen(true);
  };

  const openNewInvestmentForm = () => {
    setInvestmentToEdit(null);
    setIsInvestmentModalOpen(true);
  };

  const openEditInvestmentForm = (inv: InvestmentSource) => {
    setInvestmentToEdit(inv);
    setIsInvestmentModalOpen(true);
  };

  // Filtered investments list
  const filteredInvestments = investments.filter((inv) => {
    const matchesCategory = categoryFilter === 'all' || inv.category === categoryFilter;
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      inv.name.toLowerCase().includes(query) || (inv.notes && inv.notes.toLowerCase().includes(query));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans pb-24" id="app-root-container">
      {/* Top Glassmorphic Navigation Header */}
      <header className="bg-white/85 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30" id="header-navigation">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5 self-start sm:self-auto">
            <div className="p-2.5 bg-slate-900 text-white rounded-2xl shadow-md shadow-slate-900/10">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center">
                Wealth <span className="font-semibold text-slate-400 ml-1">Folio</span>
              </h1>
              <p className="text-[11px] font-semibold text-slate-400 tracking-wide mt-0.5">
                Personal Investment Ledger & Asset Vault
              </p>
            </div>
          </div>

          {/* Header Controls */}
          <div className="flex items-center space-x-2.5 self-end sm:self-auto">
            {/* Google Sheets Sync Pill */}
            <button
              onClick={() => setIsSheetsModalOpen(true)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center space-x-2 cursor-pointer shadow-xs ${
                sheetConfig.webAppUrl
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100'
                  : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
              title="Configure Personal Google Sheets Sync"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>{sheetConfig.webAppUrl ? 'Google Sheet Synced' : 'Connect Google Sheet'}</span>
              {sheetConfig.webAppUrl ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
              )}
            </button>

            <button
              onClick={handleResetDefaults}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all cursor-pointer"
              title="Reset data to mock defaults"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <button
              onClick={openNewInvestmentForm}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-md shadow-slate-900/10 transition-all flex items-center space-x-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Source</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Financial Overview Metrics Bar */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5" id="portfolio-metrics-grid">
          <MetricCard
            title="Total Net Worth"
            value={totalValuation}
            type="currency"
            theme="blue"
            icon="wallet"
            subtitle="Current total valuation of all assets"
          />
          <MetricCard
            title="Total Invested Capital"
            value={totalInvested}
            type="currency"
            theme="indigo"
            icon="dollar"
            subtitle="Net cash deposited across sources"
          />
          <MetricCard
            title="Total Growth / Profit"
            value={totalProfit}
            type="currency"
            theme="emerald"
            icon="trending"
            change={overallROI}
            subtitle="Cumulative market gains"
          />
          <MetricCard
            title="Overall Return (ROI)"
            value={overallROI}
            type="percent"
            theme="amber"
            icon="percent"
            subtitle="Return on invested capital"
          />
        </section>

        {/* Toolbar: Search & Segmented Category Tabs */}
        <div className="fintech-card p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search investment sources (Mutual funds, stocks, certificates)..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-slate-900 transition-all"
              />
            </div>
          </div>

          {/* Segmented Category Pills */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none border-t border-slate-100 pt-3">
            <ListFilter className="w-4 h-4 text-slate-400 shrink-0" />
            <button
              onClick={() => setCategoryFilter('all')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap border cursor-pointer ${
                categoryFilter === 'all'
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              All Sources ({investments.length}) • {formatCurrency(totalValuation)}
            </button>
            {Object.keys(DEFAULT_CATEGORIES).map((catKey) => {
              const catHoldings = investments.filter((i) => i.category === catKey);
              if (catHoldings.length === 0 && categoryFilter !== catKey) return null;
              const subtotal = catHoldings.reduce((s, i) => s + i.currentValuation, 0);
              const details = DEFAULT_CATEGORIES[catKey];
              const isActive = categoryFilter === catKey;

              return (
                <button
                  key={catKey}
                  onClick={() => setCategoryFilter(catKey)}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap border cursor-pointer ${
                    isActive
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {details.label} ({catHoldings.length}) • {formatCurrency(subtotal)}
                </button>
              );
            })}
          </div>
        </div>

        {/* Investment Sources Grid */}
        <section id="investment-sources-section">
          {filteredInvestments.length === 0 ? (
            <div className="fintech-card p-12 text-center max-w-lg mx-auto space-y-4">
              <Landmark className="w-10 h-10 text-slate-300 mx-auto" />
              <div>
                <h4 className="text-base font-bold text-slate-900">No investment sources found</h4>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  Add your mutual funds, stock market holdings, or savings certificates to start tracking.
                </p>
              </div>
              <button
                onClick={openNewInvestmentForm}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold cursor-pointer transition-all shadow-md shadow-slate-900/10"
              >
                + Add Investment Source
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <AnimatePresence mode="popLayout">
                {filteredInvestments.map((inv) => (
                  <motion.div key={inv.id} layout>
                    <InvestmentCard
                      investment={inv}
                      onAction={openActionForInvestment}
                      onEdit={openEditInvestmentForm}
                      onDelete={handleDeleteInvestmentSource}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </section>

        {/* Transaction Ledger Table Section */}
        <section id="transaction-ledger-section">
          <LedgerTable
            transactions={transactions}
            investments={investments}
            onDeleteTransaction={handleDeleteTransaction}
            onClearAll={() => {
              if (confirm('Clear all transaction history from the ledger?')) {
                setTransactions([]);
              }
            }}
          />
        </section>
      </main>

      {/* Floating Bottom Quick Action Dock */}
      <QuickActionDock
        onOpenTransaction={(type) => {
          setTxInitialSource(investments[0] || null);
          setTxInitialType(type);
          setIsTxModalOpen(true);
        }}
        onOpenNewSource={openNewInvestmentForm}
        disabled={investments.length === 0}
      />

      {/* App Footer */}
      <footer className="bg-white border-t border-slate-200 mt-16 py-8 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 font-medium space-y-1">
          <p>© 2026 Wealth Folio • Private Personal Investment Ledger</p>
          <p className="text-[11px] text-slate-400">
            Local Google Sheet Database Persistence & Pure Data Ownership
          </p>
        </div>
      </footer>

      {/* Modal Dialogs */}
      <InvestmentFormModal
        isOpen={isInvestmentModalOpen}
        onClose={() => setIsInvestmentModalOpen(false)}
        investmentToEdit={investmentToEdit}
        onSubmit={handleSaveInvestmentSource}
      />

      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => setIsTxModalOpen(false)}
        initialType={txInitialType}
        initialSource={txInitialSource}
        investments={investments}
        onSubmit={handleExecuteTransaction}
      />

      <GoogleSheetsModal
        isOpen={isSheetsModalOpen}
        onClose={() => setIsSheetsModalOpen(false)}
        config={sheetConfig}
        onSaveConfig={setSheetConfig}
        investments={investments}
        transactions={transactions}
      />
    </div>
  );
}
