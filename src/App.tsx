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
} from 'lucide-react';

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
    <div className="min-h-screen bg-[#F9F8F6] flex flex-col font-sans" id="app-root-container">
      {/* Navigation Header */}
      <header className="bg-white border-b border-[#DCDAD2] sticky top-0 z-40" id="header-navigation">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3 self-start sm:self-auto">
            <div className="p-2.5 bg-[#1A1A1A] text-white rounded-none border border-[#1A1A1A]">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-serif font-bold text-[#1A1A1A] tracking-tight flex items-center">
                Wealth <span className="font-serif italic font-normal text-[#8C8C85] ml-1.5">Folio</span>
              </h1>
              <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-[#8C8C85] mt-0.5">
                Personal Investment Ledger & Asset Vault
              </p>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center space-x-2 self-end sm:self-auto">
            {/* Google Sheets Sync Badge */}
            <button
              onClick={() => setIsSheetsModalOpen(true)}
              className={`px-3 py-1.5 text-[10px] border font-bold uppercase tracking-wider rounded-none transition-all flex items-center space-x-1.5 cursor-pointer ${
                sheetConfig.webAppUrl
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900 hover:bg-emerald-100'
                  : 'bg-white border-[#DCDAD2] text-[#8C8C85] hover:text-[#1A1A1A] hover:bg-[#F9F8F6]'
              }`}
              title="Configure Personal Google Sheets Sync"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>{sheetConfig.webAppUrl ? 'Google Sheet Synced' : 'Connect Google Sheet'}</span>
              {sheetConfig.webAppUrl ? (
                <CheckCircle2 className="w-3 h-3 text-emerald-600 ml-0.5" />
              ) : (
                <AlertCircle className="w-3 h-3 text-amber-500 ml-0.5" />
              )}
            </button>

            <button
              onClick={handleResetDefaults}
              className="px-3 py-1.5 text-[10px] border border-[#DCDAD2] text-[#1A1A1A] hover:bg-[#F9F8F6] font-bold uppercase tracking-wider rounded-none transition-all flex items-center space-x-1 cursor-pointer"
              title="Reset data to mock defaults"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#8C8C85]" />
              <span>Reset</span>
            </button>

            <button
              onClick={openNewInvestmentForm}
              className="px-4 py-1.5 bg-[#1A1A1A] hover:bg-[#3E3E39] text-white rounded-none text-[10px] uppercase tracking-widest font-bold shadow-xs transition-all flex items-center space-x-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Add Source</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Financial Overview Metrics Bar */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5" id="portfolio-metrics-grid">
          <MetricCard
            title="Total Net Worth"
            value={totalValuation}
            type="currency"
            theme="blue"
            subtitle="Current total valuation of all assets"
          />
          <MetricCard
            title="Total Invested Capital"
            value={totalInvested}
            type="currency"
            theme="indigo"
            subtitle="Net cash deposited across sources"
          />
          <MetricCard
            title="Total Profit / Growth"
            value={totalProfit}
            type="currency"
            theme="emerald"
            change={overallROI}
            subtitle="Cumulative market gains"
          />
          <MetricCard
            title="Overall Return (ROI)"
            value={overallROI}
            type="percent"
            theme="amber"
            subtitle="Return on invested capital"
          />
        </section>

        {/* Toolbar: Category Filters & Search */}
        <div className="bg-white border border-[#DCDAD2] p-4 rounded-none space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-[#8C8C85] absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search investment sources (Mutual funds, stocks, certificates)..."
                className="w-full pl-10 pr-4 py-2.5 bg-[#F9F8F6] border border-[#DCDAD2] rounded-none text-xs font-semibold focus:outline-hidden focus:bg-white focus:border-[#1A1A1A] text-[#1A1A1A] transition-all"
              />
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => {
                  setTxInitialSource(investments[0] || null);
                  setTxInitialType('invest');
                  setIsTxModalOpen(true);
                }}
                disabled={investments.length === 0}
                className="px-3.5 py-2 bg-[#1A1A1A] hover:bg-[#3E3E39] text-white text-[10px] uppercase tracking-wider font-bold rounded-none flex items-center space-x-1 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Execute Transaction</span>
              </button>
              <button
                onClick={() => {
                  setTxInitialSource(investments[0] || null);
                  setTxInitialType('transfer');
                  setIsTxModalOpen(true);
                }}
                disabled={investments.length < 2}
                className="px-3.5 py-2 bg-[#F9F8F6] hover:bg-[#F3F1EC] text-[#1A1A1A] border border-[#DCDAD2] text-[10px] uppercase tracking-wider font-bold rounded-none flex items-center space-x-1 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ArrowRightLeft className="w-3.5 h-3.5 text-blue-700" />
                <span>Transfer Funds</span>
              </button>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none border-t border-[#F1EFEA] pt-3">
            <ListFilter className="w-3.5 h-3.5 text-[#8C8C85] flex-shrink-0" />
            <button
              onClick={() => setCategoryFilter('all')}
              className={`text-[10px] px-3 py-1.5 font-bold tracking-wider uppercase transition-all whitespace-nowrap rounded-none border cursor-pointer ${
                categoryFilter === 'all'
                  ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
                  : 'bg-white text-[#8C8C85] border-[#DCDAD2] hover:text-[#1A1A1A] hover:border-[#1A1A1A]'
              }`}
            >
              All Sources ({investments.length})
            </button>
            {Object.keys(DEFAULT_CATEGORIES).map((catKey) => {
              const count = investments.filter((i) => i.category === catKey).length;
              if (count === 0 && categoryFilter !== catKey) return null;
              const details = DEFAULT_CATEGORIES[catKey];
              const isActive = categoryFilter === catKey;

              return (
                <button
                  key={catKey}
                  onClick={() => setCategoryFilter(catKey)}
                  className={`text-[10px] px-3 py-1.5 font-bold tracking-wider uppercase transition-all whitespace-nowrap rounded-none border cursor-pointer ${
                    isActive
                      ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
                      : 'bg-white text-[#8C8C85] border-[#DCDAD2] hover:text-[#1A1A1A] hover:border-[#1A1A1A]'
                  }`}
                >
                  {details.label} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Investment Sources Grid */}
        <section id="investment-sources-section">
          {filteredInvestments.length === 0 ? (
            <div className="bg-white border border-dashed border-[#DCDAD2] p-12 text-center max-w-lg mx-auto space-y-4">
              <Landmark className="w-8 h-8 text-[#8C8C85] mx-auto" />
              <div>
                <h4 className="text-base font-serif font-bold text-[#1A1A1A]">No investment sources found</h4>
                <p className="text-xs text-[#8C8C85] font-serif italic mt-1">
                  Add your mutual funds, stock market holdings, or savings certificates to start tracking.
                </p>
              </div>
              <button
                onClick={openNewInvestmentForm}
                className="px-4 py-2 bg-[#1A1A1A] text-white text-[10px] uppercase font-bold tracking-wider cursor-pointer"
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

      {/* App Footer */}
      <footer className="bg-white border-t border-[#DCDAD2] mt-16 py-8 text-center text-xs text-[#8C8C85]">
        <div className="max-w-7xl mx-auto px-4 font-serif italic space-y-1">
          <p>© 2026 Wealth Folio • Private Personal Investment Ledger</p>
          <p className="text-[10px] font-sans not-italic uppercase tracking-widest text-[#B5B3AC]">
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
