/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { InvestmentPool, Transaction, PoolCategory, TransactionType } from './types';
import { INITIAL_POOLS, INITIAL_TRANSACTIONS, CATEGORY_DETAILS } from './data';

// Import Components
import MetricCard from './components/MetricCard';
import PoolCard from './components/PoolCard';
import DistributionChart from './components/DistributionChart';
import TransactionHistory from './components/TransactionHistory';
import PoolFormModal from './components/PoolFormModal';
import TransactionModal from './components/TransactionModal';
import LedgerFlowVisualizer from './components/LedgerFlowVisualizer';

// Import Icons
import {
  Wallet,
  Coins,
  TrendingUp,
  Plus,
  Scale,
  Search,
  ListFilter,
  RefreshCw,
  AlertTriangle,
  Info,
  ArrowRightLeft
} from 'lucide-react';

export default function App() {
  // --- Persistent States ---
  const [pools, setPools] = useState<InvestmentPool[]>(() => {
    try {
      const saved = localStorage.getItem('savings_tracker_pools');
      return saved ? JSON.parse(saved) : INITIAL_POOLS;
    } catch {
      return INITIAL_POOLS;
    }
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem('savings_tracker_transactions');
      return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
    } catch {
      return INITIAL_TRANSACTIONS;
    }
  });

  // Sync to Storage
  useEffect(() => {
    localStorage.setItem('savings_tracker_pools', JSON.stringify(pools));
  }, [pools]);

  useEffect(() => {
    localStorage.setItem('savings_tracker_transactions', JSON.stringify(transactions));
  }, [transactions]);

  // --- Filtering & UI States ---
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals ControllerStates
  const [isPoolModalOpen, setIsPoolModalOpen] = useState(false);
  const [poolToEdit, setPoolToEdit] = useState<InvestmentPool | null>(null);

  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [txModalTab, setTxModalTab] = useState<'deposit' | 'withdrawal' | 'transfer' | 'valuation_adjustment'>('deposit');
  const [txSelectedPool, setTxSelectedPool] = useState<InvestmentPool | null>(null);

  // Custom Confirmation Dialog for Pool Deletion
  const [poolToDelete, setPoolToDelete] = useState<InvestmentPool | null>(null);

  // --- Routing State & Hash Sync ---
  const [currentRoute, setCurrentRoute] = useState<string>(() => {
    return window.location.hash || '#/';
  });

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentRoute(window.location.hash || '#/');
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  // --- Financial Core Calculations ---
  const totalValuation = pools.reduce((sum, p) => sum + p.currentValuation, 0);
  const totalInvested = pools.reduce((sum, p) => sum + p.investedAmount, 0);
  const overallReturns = totalValuation - totalInvested;
  const overallROI = totalInvested > 0 ? (overallReturns / totalInvested) * 100 : 0;

  // --- Core Handlers ---

  const handleResetData = () => {
    if (confirm("Reset application data to original mock defaults? Any changes will be overwritten.")) {
      setPools(INITIAL_POOLS);
      setTransactions(INITIAL_TRANSACTIONS);
    }
  };

  // Create or Update Pool details
  const handlePoolSubmit = (poolData: {
    name: string;
    category: PoolCategory;
    description: string;
    targetAmount: number | null;
    initialBalance: number;
  }) => {
    const timestamp = new Date().toISOString();

    if (poolToEdit) {
      // Edit mode
      setPools((prev) =>
        prev.map((p) =>
          p.id === poolToEdit.id
            ? {
                ...p,
                name: poolData.name,
                category: poolData.category,
                description: poolData.description,
                targetAmount: poolData.targetAmount,
                updatedAt: timestamp,
              }
            : p
        )
      );
    } else {
      // Create mode
      const newPoolId = `pool-${Date.now()}`;
      const newPool: InvestmentPool = {
        id: newPoolId,
        name: poolData.name,
        category: poolData.category,
        description: poolData.description,
        targetAmount: poolData.targetAmount,
        investedAmount: poolData.initialBalance,
        currentValuation: poolData.initialBalance,
        createdAt: timestamp,
        updatedAt: timestamp,
      };

      setPools((prev) => [...prev, newPool]);

      // If initial balance is injected, log transaction automatically
      if (poolData.initialBalance > 0) {
        const newTx: Transaction = {
          id: `tx-${Date.now()}`,
          poolId: newPoolId,
          type: 'creation',
          amount: poolData.initialBalance,
          note: `Initial capital allocation for ${poolData.name}`,
          timestamp,
        };
        setTransactions((prev) => [newTx, ...prev]);
      }
    }
    setPoolToEdit(null);
  };

  // Perform transaction (Deposit, Withdraw, Transfer, Valuation Adjustment)
  const handleTransactionSubmit = (txData: {
    type: TransactionType;
    poolId: string;
    sourcePoolId?: string;
    destinationPoolId?: string;
    amount: number;
    newValuation?: number;
    note: string;
  }) => {
    const timestamp = new Date().toISOString();
    const newTxId = `tx-${Date.now()}`;

    const newTx: Transaction = {
      id: newTxId,
      poolId: txData.poolId,
      sourcePoolId: txData.sourcePoolId,
      destinationPoolId: txData.destinationPoolId,
      type: txData.type,
      amount: txData.amount,
      newValuation: txData.newValuation,
      note: txData.note,
      timestamp,
    };

    setPools((prevPools) => {
      return prevPools.map((p) => {
        // Valuation Overrides (Manually inputs current net valuation)
        if (txData.type === 'valuation_adjustment' && p.id === txData.poolId && txData.newValuation !== undefined) {
          newTx.previousValuation = p.currentValuation;
          return {
            ...p,
            currentValuation: txData.newValuation,
            updatedAt: timestamp,
          };
        }

        // Standard Deposit
        if (txData.type === 'deposit' && p.id === txData.poolId) {
          return {
            ...p,
            investedAmount: p.investedAmount + txData.amount,
            currentValuation: p.currentValuation + txData.amount,
            updatedAt: timestamp,
          };
        }

        // Standard Withdrawal
        if (txData.type === 'withdrawal' && p.id === txData.poolId) {
          return {
            ...p,
            investedAmount: Math.max(0, p.investedAmount - txData.amount),
            currentValuation: Math.max(0, p.currentValuation - txData.amount),
            updatedAt: timestamp,
          };
        }

        // Transfer Outflow from Source Pool
        if (txData.type === 'transfer' && p.id === txData.sourcePoolId) {
          return {
            ...p,
            investedAmount: Math.max(0, p.investedAmount - txData.amount),
            currentValuation: Math.max(0, p.currentValuation - txData.amount),
            updatedAt: timestamp,
          };
        }

        // Transfer Inflow to Destination Pool
        if (txData.type === 'transfer' && p.id === txData.destinationPoolId) {
          return {
            ...p,
            investedAmount: p.investedAmount + txData.amount,
            currentValuation: p.currentValuation + txData.amount,
            updatedAt: timestamp,
          };
        }

        return p;
      });
    });

    setTransactions((prev) => [newTx, ...prev]);
  };

  // Permanent Pool Erasure
  const handleConfirmDeletePool = () => {
    if (!poolToDelete) return;

    // Remove pool
    setPools((prev) => prev.filter((p) => p.id !== poolToDelete.id));

    // Remove pool transaction entries as well to keep ledger clean (optional, keeping history makes it trace correct, but removing prevents errors)
    setTransactions((prev) =>
      prev.filter(
        (t) =>
          t.poolId !== poolToDelete.id &&
          t.sourcePoolId !== poolToDelete.id &&
          t.destinationPoolId !== poolToDelete.id
      )
    );

    setPoolToDelete(null);
  };

  // --- Trigger Shortcuts Helpers ---
  const triggerPoolForm = (pool: InvestmentPool | null = null) => {
    setPoolToEdit(pool);
    setIsPoolModalOpen(true);
  };

  const triggerTxForm = (
    tab: 'deposit' | 'withdrawal' | 'transfer' | 'valuation_adjustment',
    pool: InvestmentPool | null = null
  ) => {
    setTxModalTab(tab);
    setTxSelectedPool(pool);
    setIsTxModalOpen(true);
  };

  // --- Filter Pool Results ---
  const filteredPools = pools.filter((p) => {
    const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Render standalone flow-map subpage if we are on the separate #/flow route
  if (currentRoute === '#/flow') {
    return (
      <LedgerFlowVisualizer
        pools={pools}
        transactions={transactions}
        onAddPool={(poolData) => {
          // If we have an edit or creation, handlePoolSubmit expects a state setting for poolToEdit inside App.tsx
          // But on flow visualizer, we can just pass new parameters or let handlePoolSubmit take care of it.
          // Since poolToEdit might be null, handlePoolSubmit creates a new pool.
          // Let's pass helper wrapper:
          handlePoolSubmit(poolData);
        }}
        onAddTransaction={handleTransactionSubmit}
        onDeletePool={(poolId) => {
          const poolObj = pools.find(p => p.id === poolId);
          if (poolObj) {
            setPoolToDelete(poolObj);
            handleConfirmDeletePool(); // Direct execution
            // Alternatively let's do direct state updates inline to guarantee clean delete
            setPools((prev) => prev.filter((p) => p.id !== poolId));
            setTransactions((prev) => prev.filter(t => t.poolId !== poolId && t.sourcePoolId !== poolId && t.destinationPoolId !== poolId));
          }
        }}
        onClose={() => {
          window.location.hash = '#/';
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#F9F8F6] flex flex-col font-sans" id="app-root-container">
      
      {/* Visual Navigation Bar */}
      <header className="bg-white border-b border-[#DCDAD2] sticky top-0 z-40" id="header-navigation">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5 self-start sm:self-auto">
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

          <div className="flex items-center space-x-2.5 self-end sm:self-auto">
            <button
              onClick={handleResetData}
              className="px-3.5 py-2 text-[10px] border border-[#DCDAD2] text-[#1A1A1A] hover:bg-[#F9F8F6] font-bold uppercase tracking-wider rounded-none transition-all flex items-center space-x-1 cursor-pointer"
              title="Reset data to mock defaults"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Defaults</span>
            </button>
            <button
              onClick={() => { window.location.hash = '#/flow'; }}
              className="px-3.5 py-2 text-[10px] border border-[#DCDAD2] text-[#1A1A1A] hover:bg-[#F9F8F6] font-bold uppercase tracking-wider rounded-none transition-all flex items-center space-x-1 cursor-pointer"
              title="Visualize entire transactions & timelines flow map"
            >
              <ArrowRightLeft className="w-3.5 h-3.5 text-blue-700" />
              <span>Flow Map</span>
            </button>
            <button
              onClick={() => triggerPoolForm(null)}
              className="px-4.5 py-2 bg-[#1A1A1A] hover:bg-[#3E3E39] text-white rounded-none text-[10px] uppercase tracking-widest font-bold shadow-xs transition-all flex items-center space-x-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Pool</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Core Overview metrics */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5" id="overview-metrics-grid">
          <MetricCard
            title="Total Net Worth"
            value={totalValuation}
            type="currency"
            theme="blue"
            subtitle="Combined asset current valuation"
          />
          <MetricCard
            title="Total Invested"
            value={totalInvested}
            type="currency"
            theme="indigo"
            subtitle="Raw net cash contributions injected"
          />
          <MetricCard
            title="Total Profit"
            value={overallReturns}
            type="currency"
            theme="emerald"
            change={overallROI}
            subtitle="Accumulated appreciation"
          />
          <MetricCard
            title="Portfolio ROI"
            value={overallROI}
            type="percent"
            theme="amber"
            subtitle="Return on invested capital"
          />
        </section>

        {/* Double Column content (Analytics and Pool selection) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* LEFT PANEL: Pools Explorer Selector */}
          <div className="lg:col-span-2 space-y-5">
            
            <div className="bg-white border border-[#DCDAD2] rounded-none p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="font-serif text-xl font-bold text-[#1A1A1A] tracking-tight">Your Asset Pools</h3>
                  <p className="text-xs text-[#8C8C85] font-serif italic mt-0.5">Manage individual savings vaults and investments</p>
                </div>

                {/* Explorer Quick triggers */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => triggerTxForm('deposit')}
                    className="px-3 py-2 bg-[#F9F8F6] hover:bg-[#F3F1EC] text-[#1A1A1A] border border-[#DCDAD2] text-[10px] uppercase tracking-wider font-bold transition-colors cursor-pointer"
                  >
                    + Capital Inflow
                  </button>
                  <button
                    onClick={() => triggerTxForm('transfer')}
                    disabled={pools.length < 2}
                    className="px-3 py-2 bg-[#F9F8F6] hover:bg-[#F3F1EC] text-[#1A1A1A] border border-[#DCDAD2] text-[10px] uppercase tracking-wider font-bold transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Transfer Funds
                  </button>
                </div>
              </div>

              {/* Pool Search and category quick filters */}
              <div className="mt-5 flex flex-col sm:flex-row sm:items-center gap-4">
                
                {/* Search */}
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 text-[#8C8C85] absolute left-3 top-3" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search vaults model, asset types..."
                    className="w-full pl-9 pr-3 py-2.5 bg-[#F9F8F6] border border-[#DCDAD2] rounded-none text-xs font-semibold focus:outline-hidden focus:bg-white focus:border-[#1A1A1A] transition-all text-[#1A1A1A]"
                  />
                </div>

                {/* Filters */}
                <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                  <ListFilter className="w-3.5 h-3.5 text-[#8C8C85] flex-shrink-0 hidden sm:block" />
                  
                  {['all', ...Object.keys(CATEGORY_DETAILS)].map((cat) => {
                    const label = cat === 'all' ? 'All Asset' : CATEGORY_DETAILS[cat as PoolCategory].label.split(' ')[0];
                    const isActive = categoryFilter === cat;
                    return (
                      <button
                        key={cat}
                        onClick={() => setCategoryFilter(cat)}
                        className={`text-[10px] px-3.5 py-1.5 font-bold tracking-widest uppercase transition-all whitespace-nowrap rounded-none border cursor-pointer ${
                          isActive 
                            ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]' 
                            : 'bg-white text-[#8C8C85] border-[#DCDAD2] hover:text-[#1A1A1A] hover:border-[#1A1A1A]'
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Pools cards grid */}
            {filteredPools.length === 0 ? (
              <div className="bg-white border border-dashed border-[#DCDAD2] rounded-none p-12 text-center max-w-lg mx-auto">
                <div className="w-12 h-12 bg-[#F9F8F6] border border-[#DCDAD2] flex items-center justify-center mx-auto text-[#8C8C85] mb-4">
                  <Info className="w-5 h-5" />
                </div>
                <h4 className="text-base font-serif font-bold text-[#1A1A1A]">No vaults match your criteria</h4>
                <p className="text-xs text-[#8C8C85] mt-1.5 max-w-sm mx-auto font-serif italic">
                  Try clearing your search query or asset category filter. Click Create Pool to append a brand-new asset ledger container.
                </p>
                <button
                  onClick={() => { setSearchQuery(''); setCategoryFilter('all'); }}
                  className="mt-4 text-[10px] uppercase tracking-wider font-bold px-4 py-2 bg-white border border-[#DCDAD2] text-[#1A1A1A] hover:bg-[#F9F8F6] transition-colors cursor-pointer"
                >
                  Clear Selection Filter
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5" id="asset-pools-grid">
                <AnimatePresence mode="popLayout">
                  {filteredPools.map((pool) => (
                    <motion.div key={pool.id} layout>
                      <PoolCard
                        pool={pool}
                        onDeposit={(p) => triggerTxForm('deposit', p)}
                        onWithdraw={(p) => triggerTxForm('withdrawal', p)}
                        onTransfer={(p) => triggerTxForm('transfer', p)}
                        onAdjustValuation={(p) => triggerTxForm('valuation_adjustment', p)}
                        onEdit={(p) => triggerPoolForm(p)}
                        onDelete={(p) => setPoolToDelete(p)}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* RIGHT PANEL: Side Charts and ledger stream */}
          <div className="space-y-6">
            
            {/* Asset Donut distribution */}
            <section id="allocation-card">
              <DistributionChart pools={pools} />
            </section>

            {/* Historical ledgers listing */}
            <section id="ledger-history-card">
              <TransactionHistory
                transactions={transactions}
                pools={pools}
              />
            </section>

          </div>

        </div>
      </main>

      {/* FOOTER credit and context */}
      <footer className="bg-white border-t border-[#DCDAD2] mt-16 py-8 text-center text-xs text-[#8C8C85]">
        <div className="max-w-7xl mx-auto px-4 font-serif italic space-y-1">
          <p>© 2026 Savings and Investment Tracker • Secured Locally via State Persistence Engine</p>
          <p className="text-[10px] font-sans not-italic uppercase tracking-widest text-[#B5B3AC]">Designed with desktop density and micro-animations for clean wealth overview</p>
        </div>
      </footer>

      {/* --- MODAL POPUPS --- */}

      {/* 1. Pool Form Creator */}
      <PoolFormModal
        isOpen={isPoolModalOpen}
        poolToEdit={poolToEdit}
        onClose={() => { setIsPoolModalOpen(false); setPoolToEdit(null); }}
        onSubmit={handlePoolSubmit}
      />

      {/* 2. Operational Transactions tabbed sheets */}
      <TransactionModal
        isOpen={isTxModalOpen}
        pools={pools}
        initialPool={txSelectedPool}
        initialTab={txModalTab}
        onClose={() => { setIsTxModalOpen(false); setTxSelectedPool(null); }}
        onSubmit={handleTransactionSubmit}
      />

      {/* 3. Custom beautiful Deletion verification modal to avoid blocking window.confirm */}
      <AnimatePresence>
        {poolToDelete && (
          <div className="fixed inset-0 bg-[#1A1A1A]/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-none border border-[#DCDAD2] w-full max-w-md shadow-lg overflow-hidden p-8 text-center space-y-4"
              id="confirm-deletion-dialog"
            >
              <div className="mx-auto w-12 h-12 bg-[#F9F8F6] border border-[#DCDAD2] text-rose-700 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>

              <div className="space-y-2">
                <h4 className="text-lg font-serif font-bold text-[#1A1A1A]">
                  Delete &quot;{poolToDelete.name}&quot;?
                </h4>
                <p className="text-xs text-[#6B6B66] leading-relaxed font-serif italic">
                  You are permanently removing this assets container. This erases the physical ledger entries for this pool and returns all capital to unallocated state. This event is irreversible.
                </p>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setPoolToDelete(null)}
                  className="flex-1 px-4 py-3 border border-[#DCDAD2] text-[#1A1A1A] hover:bg-[#F9F8F6] rounded-none text-[10px] uppercase tracking-wider font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDeletePool}
                  className="flex-1 px-4 py-3 bg-rose-800 hover:bg-rose-950 text-white rounded-none text-[10px] uppercase tracking-wider font-bold transition-colors cursor-pointer"
                >
                  Permanently Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
