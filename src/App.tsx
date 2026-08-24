/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { InvestmentSource, LedgerTransaction, TransactionType, GoogleSheetConfig } from './types';
import { INITIAL_INVESTMENTS, INITIAL_TRANSACTIONS, DEFAULT_SHEET_CONFIG, DEFAULT_CATEGORIES } from './data';
import { syncTransactionToSheet } from './services/googleSheets';
import { ThemeProvider, useTheme } from './context/ThemeContext';

// Import Components
import Sidebar from './components/Sidebar';
import MetricCard from './components/MetricCard';
import InvestmentCard from './components/InvestmentCard';
import InvestmentFormModal from './components/InvestmentFormModal';
import TransactionModal from './components/TransactionModal';
import LedgerTable from './components/LedgerTable';
import ActionToolbar from './components/ActionToolbar';

// Import Icons
import {
  Landmark,
  Plus,
  Search,
  ListFilter,
  RefreshCw,
  Sun,
  Moon,
} from 'lucide-react';

function DashboardContent() {
  const { theme, toggleTheme } = useTheme();

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

  // --- URL Parameter & Filter Persistence ---
  const getInitialCategoryFromUrl = () => {
    try {
      const params = new URLSearchParams(window.location.search);
      return params.get('category') || 'all';
    } catch {
      return 'all';
    }
  };

  const getInitialTabFromUrl = () => {
    try {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab');
      if (tab === 'ledger') return 'ledger';
      return 'dashboard';
    } catch {
      return 'dashboard';
    }
  };

  const [categoryFilter, setCategoryFilterState] = useState<string>(getInitialCategoryFromUrl);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTabState] = useState<'dashboard' | 'sources' | 'ledger'>(getInitialTabFromUrl);

  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const cat = params.get('category') || 'all';
      const tab = params.get('tab') === 'ledger' ? 'ledger' : 'dashboard';
      setCategoryFilterState(cat);
      setActiveTabState(tab);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const setCategoryFilter = (cat: string) => {
    setCategoryFilterState(cat);
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('category', cat);
      window.history.pushState({}, '', url.toString());
    } catch {}
  };

  const setActiveTab = (tab: 'dashboard' | 'sources' | 'ledger') => {
    setActiveTabState(tab);
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('tab', tab);
      window.history.pushState({}, '', url.toString());
    } catch {}
  };

  // Modals
  const [isInvestmentModalOpen, setIsInvestmentModalOpen] = useState(false);
  const [investmentToEdit, setInvestmentToEdit] = useState<InvestmentSource | null>(null);

  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [txInitialType, setTxInitialType] = useState<TransactionType>('invest');
  const [txInitialSource, setTxInitialSource] = useState<InvestmentSource | null>(null);

  const [isSheetsModalOpen, setIsSheetsModalOpen] = useState(false);

  // --- Financial Calculations (Scoped to Selected Category Tab) ---
  const scopedInvestments = investments.filter(
    (inv) => categoryFilter === 'all' || inv.category === categoryFilter
  );

  const totalValuation = scopedInvestments.reduce((sum, i) => sum + i.currentValuation, 0);
  const totalInvested = scopedInvestments.reduce((sum, i) => sum + i.investedAmount, 0);
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
        if (data.type === 'revalue' && inv.id === data.sourceId && data.newValuation !== undefined) {
          newTx.previousValuation = inv.currentValuation;
          return {
            ...inv,
            currentValuation: data.newValuation,
            updatedAt: timestamp,
          };
        }

        if (data.type === 'invest' && inv.id === data.sourceId) {
          return {
            ...inv,
            investedAmount: inv.investedAmount + data.amount,
            currentValuation: inv.currentValuation + data.amount,
            updatedAt: timestamp,
          };
        }

        if (data.type === 'withdraw' && inv.id === data.sourceId) {
          return {
            ...inv,
            investedAmount: Math.max(0, inv.investedAmount - data.amount),
            currentValuation: Math.max(0, inv.currentValuation - data.amount),
            updatedAt: timestamp,
          };
        }

        if (data.type === 'transfer' && inv.id === data.sourceId) {
          return {
            ...inv,
            investedAmount: Math.max(0, inv.investedAmount - data.amount),
            currentValuation: Math.max(0, inv.currentValuation - data.amount),
            updatedAt: timestamp,
          };
        }

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

    if (sheetConfig.webAppUrl && sheetConfig.autoSync) {
      const srcName = investments.find((i) => i.id === data.sourceId)?.name || data.sourceId;
      const tgtName = data.targetId ? investments.find((i) => i.id === data.targetId)?.name : undefined;
      syncTransactionToSheet(sheetConfig.webAppUrl, newTx, srcName, tgtName);
    }
  };

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

  const filteredInvestments = investments.filter((inv) => {
    const matchesCategory = categoryFilter === 'all' || inv.category === categoryFilter;
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      inv.name.toLowerCase().includes(query) || (inv.notes && inv.notes.toLowerCase().includes(query));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex min-h-screen bg-[#F4F5F8] dark:bg-[#0D0E15] transition-colors duration-200" id="app-root-container">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Right Content Panel */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar with Category Filters */}
        <header className="bg-white/85 dark:bg-[#12131A]/85 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 sticky top-0 z-30 transition-colors">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
            {/* Mobile Brand & Search */}
            <div className="flex items-center space-x-3 shrink-0">
              <div className="lg:hidden p-2 bg-slate-900 dark:bg-purple-600 text-white rounded-xl">
                <Landmark className="w-5 h-5" />
              </div>
              <div className="relative hidden lg:block w-48 xl:w-56">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search assets..."
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-100 dark:bg-[#181924] border border-slate-200/80 dark:border-slate-800/80 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-purple-500 transition-all"
                />
              </div>
            </div>

            {/* Category Filter Pills (Main Header Centerpiece) */}
            <div className="flex items-center space-x-1.5 overflow-x-auto py-1 scrollbar-none max-w-full">
              <ListFilter className="w-3.5 h-3.5 text-slate-400 shrink-0 mr-1 hidden sm:inline-block" />
              <button
                onClick={() => setCategoryFilter('all')}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap border cursor-pointer ${
                  categoryFilter === 'all'
                    ? 'bg-slate-900 text-white border-slate-900 dark:bg-purple-600 dark:border-purple-500 shadow-xs'
                    : 'bg-white dark:bg-[#181924] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                All Sources
              </button>
              {Object.keys(DEFAULT_CATEGORIES).map((catKey) => {
                const catHoldings = investments.filter((i) => i.category === catKey);
                if (catHoldings.length === 0 && categoryFilter !== catKey) return null;
                const details = DEFAULT_CATEGORIES[catKey];
                const isActive = categoryFilter === catKey;

                return (
                  <button
                    key={catKey}
                    onClick={() => setCategoryFilter(catKey)}
                    className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap border cursor-pointer ${
                      isActive
                        ? 'bg-slate-900 text-white border-slate-900 dark:bg-purple-600 dark:border-purple-500 shadow-xs'
                        : 'bg-white dark:bg-[#181924] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    {details.label}
                  </button>
                );
              })}
            </div>

            {/* Right Controls */}
            <div className="flex items-center space-x-2 shrink-0">
              <button
                onClick={toggleTheme}
                className="lg:hidden p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer border border-slate-200/80 dark:border-slate-800/80"
                title="Toggle Light/Dark Theme"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-purple-600" />}
              </button>

              {/* Google Sheets Sync Pill */}
              <button
                onClick={() => setIsSheetsModalOpen(true)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center space-x-2 cursor-pointer shadow-xs ${
                  sheetConfig.webAppUrl
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100'
                    : 'bg-white dark:bg-[#181924] border-slate-200 dark:border-slate-800/80 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Configure Personal Google Sheets Sync"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
                <span className="hidden sm:inline">{sheetConfig.webAppUrl ? 'Google Sheet Synced' : 'Connect Google Sheet'}</span>
                {sheetConfig.webAppUrl ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                )}
              </button>

              <button
                onClick={handleResetDefaults}
                className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-800/80 rounded-xl transition-all cursor-pointer bg-white dark:bg-[#181924]"
                title="Reset data to mock defaults"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Main Dashboard Container */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20 space-y-6">
          {/* Top Quick Action Toolbar Bar */}
          <ActionToolbar
            onOpenTransaction={(type) => {
              setTxInitialSource(scopedInvestments[0] || investments[0] || null);
              setTxInitialType(type);
              setIsTxModalOpen(true);
            }}
            onOpenNewSource={openNewInvestmentForm}
            disabled={investments.length === 0}
          />

          {/* Financial Overview Metrics Bar (Orbix/Nuance Aurora Mesh Cards) */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5" id="portfolio-metrics-grid">
            <MetricCard
              title="Total Net Worth"
              value={totalValuation}
              type="currency"
              theme="blue"
              icon="wallet"
              subtitle="Current total valuation of assets"
            />
            <MetricCard
              title="Total Invested Capital"
              value={totalInvested}
              type="currency"
              theme="indigo"
              icon="dollar"
              subtitle="Net capital deposited"
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

          {/* Investment Sources Grid */}
          <section id="investment-sources-section">
            {filteredInvestments.length === 0 ? (
              <div className="fintech-card p-12 text-center max-w-lg mx-auto space-y-4 rounded-3xl">
                <Landmark className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
                <div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">No investment sources found</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
                    Add your mutual funds, stock market holdings, or savings certificates to start tracking.
                  </p>
                </div>
                <button
                  onClick={openNewInvestmentForm}
                  className="px-4 py-2 bg-slate-900 dark:bg-purple-600 hover:bg-slate-800 dark:hover:bg-purple-500 text-white rounded-xl text-xs font-semibold cursor-pointer transition-all shadow-md shadow-purple-600/20"
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
            />
          </section>
        </main>



        {/* App Footer */}
        <footer className="bg-white dark:bg-[#12131A] border-t border-slate-200 dark:border-slate-800/80 py-8 text-center text-xs text-slate-400 dark:text-slate-500 transition-colors">
          <div className="max-w-7xl mx-auto px-4 font-medium space-y-1">
            <p>© 2026 Wealth Folio • Private Personal Investment Ledger</p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
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
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <DashboardContent />
    </ThemeProvider>
  );
}
