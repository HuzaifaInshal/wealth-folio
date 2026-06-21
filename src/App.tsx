/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Holding, Transaction, HoldingCategory, TransactionType, Pool } from './types';
import { INITIAL_HOLDINGS, INITIAL_TRANSACTIONS, CATEGORY_DETAILS, INITIAL_POOLS } from './data';

// Import Components
import MetricCard from './components/MetricCard';
import HoldingCard from './components/HoldingCard';
import DistributionChart from './components/DistributionChart';
import TransactionHistory from './components/TransactionHistory';
import HoldingFormModal from './components/HoldingFormModal';
import TransactionModal from './components/TransactionModal';
import LedgerFlowVisualizer from './components/LedgerFlowVisualizer';
import PoolFormModal from './components/PoolFormModal';
import LandingPage from './components/LandingPage';
import AuthPage from './components/AuthPage';
import PoolTimeline from './components/PoolTimeline';

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
  ArrowRightLeft,
  Folder,
  ChevronDown,
  Settings,
  Trash2,
  Lock,
  History
} from 'lucide-react';

export default function App() {
  // --- Persistent States & Migrations ---
  const [pools, setPools] = useState<Pool[]>(() => {
    try {
      const savedV2 = localStorage.getItem('savings_tracker_pools_v2');
      if (savedV2) return JSON.parse(savedV2);

      const legacyGroups = localStorage.getItem('savings_tracker_groups');
      if (legacyGroups) {
        const parsed = JSON.parse(legacyGroups);
        return parsed.map((g: any) => ({
          id: g.id.replace('group-', 'pool-'),
          title: g.title,
          description: g.description,
          createdAt: g.createdAt,
          updatedAt: g.updatedAt
        }));
      }
      return INITIAL_POOLS;
    } catch {
      return INITIAL_POOLS;
    }
  });

  const [activePoolId, setActivePoolId] = useState<string>(() => {
    try {
      const savedActiveV2 = localStorage.getItem('savings_tracker_active_pool_id');
      if (savedActiveV2) return savedActiveV2;

      const legacyActive = localStorage.getItem('savings_tracker_active_group_id');
      if (legacyActive) {
        return legacyActive.replace('group-', 'pool-');
      }
    } catch {}
    return INITIAL_POOLS[0]?.id || 'pool-1';
  });

  const [holdings, setHoldings] = useState<Holding[]>(() => {
    try {
      const savedV2 = localStorage.getItem('savings_tracker_holdings_v2');
      if (savedV2) return JSON.parse(savedV2);

      const legacyPools = localStorage.getItem('savings_tracker_pools');
      if (legacyPools) {
        const parsed = JSON.parse(legacyPools);
        return parsed.map((p: any) => {
          const pid = p.poolId || p.groupId || 'pool-1';
          return {
            id: p.id.replace('pool-', 'holding-'),
            poolId: pid.replace('group-', 'pool-'),
            name: p.name || p.title || 'Untitled',
            category: (p.category || 'cash') as HoldingCategory,
            description: p.description || '',
            investedAmount: p.investedAmount || 0,
            currentValuation: p.currentValuation || 0,
            createdAt: p.createdAt,
            updatedAt: p.updatedAt
          };
        });
      }
      return INITIAL_HOLDINGS;
    } catch {
      return INITIAL_HOLDINGS;
    }
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem('savings_tracker_transactions');
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.map((t: any) => {
          const updated: any = {
            id: t.id,
            type: t.type,
            amount: t.amount,
            note: t.note,
            timestamp: t.timestamp
          };
          if (t.previousValuation !== undefined) updated.previousValuation = t.previousValuation;
          if (t.newValuation !== undefined) updated.newValuation = t.newValuation;

          const originalPoolId = t.holdingId || t.poolId;
          const originalSourcePoolId = t.sourceHoldingId || t.sourcePoolId;
          const originalDestinationPoolId = t.destinationHoldingId || t.destinationPoolId;

          if (originalPoolId) updated.holdingId = originalPoolId.replace('pool-', 'holding-');
          if (originalSourcePoolId) updated.sourceHoldingId = originalSourcePoolId.replace('pool-', 'holding-');
          if (originalDestinationPoolId) updated.destinationHoldingId = originalDestinationPoolId.replace('pool-', 'holding-');

          return updated as Transaction;
        });
      }
      return INITIAL_TRANSACTIONS;
    } catch {
      return INITIAL_TRANSACTIONS;
    }
  });

  // Sync to Storage
  useEffect(() => {
    localStorage.setItem('savings_tracker_pools_v2', JSON.stringify(pools));
  }, [pools]);

  useEffect(() => {
    localStorage.setItem('savings_tracker_active_pool_id', activePoolId);
  }, [activePoolId]);

  useEffect(() => {
    localStorage.setItem('savings_tracker_holdings_v2', JSON.stringify(holdings));
  }, [holdings]);

  useEffect(() => {
    localStorage.setItem('savings_tracker_transactions', JSON.stringify(transactions));
  }, [transactions]);

  // --- Filtering & UI States ---
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [poolSearchQuery, setPoolSearchQuery] = useState('');

  // --- Authentication States ---
  const [savedPasscode, setSavedPasscode] = useState<string>(() => {
    return localStorage.getItem('savings_tracker_passcode') || '';
  });

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return sessionStorage.getItem('savings_tracker_is_logged_in') === 'true';
  });

  const handleAuthenticate = (passcode: string): string | void => {
    if (!savedPasscode) {
      // Sign Up
      localStorage.setItem('savings_tracker_passcode', passcode);
      setSavedPasscode(passcode);
      sessionStorage.setItem('savings_tracker_is_logged_in', 'true');
      setIsLoggedIn(true);
      window.location.hash = '#/';
      return;
    } else {
      // Sign In
      if (passcode === savedPasscode) {
        sessionStorage.setItem('savings_tracker_is_logged_in', 'true');
        setIsLoggedIn(true);
        window.location.hash = '#/';
        return;
      } else {
        return 'Invalid access passcode.';
      }
    }
  };
  
  // Modals ControllerStates
  const [isHoldingModalOpen, setIsHoldingModalOpen] = useState(false);
  const [holdingToEdit, setHoldingToEdit] = useState<Holding | null>(null);

  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [txModalTab, setTxModalTab] = useState<'deposit' | 'withdrawal' | 'transfer' | 'valuation_adjustment'>('deposit');
  const [txSelectedHolding, setTxSelectedHolding] = useState<Holding | null>(null);

  // Pool Switcher Modal/Dropdown state
  const [isPoolDropdownOpen, setIsPoolDropdownOpen] = useState(false);
  const [isPoolModalOpen, setIsPoolModalOpen] = useState(false);
  const [poolToEdit, setPoolToEdit] = useState<Pool | null>(null);

  // Custom Confirmation Dialog for Pool Deletion
  const [holdingToDelete, setHoldingToDelete] = useState<Holding | null>(null);

  // --- Routing State & Hash Sync ---
  const [currentRoute, setCurrentRoute] = useState<string>(() => {
    return window.location.hash || '#/';
  });

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash || '#/';
      setCurrentRoute(hash);

      // Routing Guard Redirect logic
      if (!isLoggedIn && hash !== '#/auth' && hash !== '#/landing-page') {
        window.location.hash = '#/auth';
        return;
      }

      if (isLoggedIn && hash === '#/auth') {
        window.location.hash = '#/';
        return;
      }

      // Parse Pool ID from route changes
      const poolMatch = hash.match(/^#\/pool\/([^?\/]+)/);
      const flowMatch = hash.match(/^#\/flow\/([^?\/]+)/);
      const timelineMatch = hash.match(/^#\/timeline\/([^?\/]+)/);
      const idFromHash = (poolMatch && poolMatch[1]) || (flowMatch && flowMatch[1]) || (timelineMatch && timelineMatch[1]);

      if (idFromHash) {
        // Verify group exists
        if (pools.some(g => g.id === idFromHash)) {
          setActivePoolId(idFromHash);
        }
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    // Execute immediately on mount to parse initial hash
    handleHashChange();

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [pools, isLoggedIn]);

  // --- Consolidated Core Calculations (Across all pools/holdings) ---
  const consolidatedValuation = holdings.reduce((sum, p) => sum + p.currentValuation, 0);
  const consolidatedInvested = holdings.reduce((sum, p) => sum + p.investedAmount, 0);
  const consolidatedReturns = consolidatedValuation - consolidatedInvested;
  const consolidatedROI = consolidatedInvested > 0 ? (consolidatedReturns / consolidatedInvested) * 100 : 0;

  // --- Pool Level Separation Helpers ---
  const activePool = pools.find((g) => g.id === activePoolId) || pools[0];
  const activePoolHoldings = holdings.filter(p => p.poolId === activePoolId);
  const holdingIdsInPool = activePoolHoldings.map(p => p.id);
  const activePoolTransactions = transactions.filter(t => 
    holdingIdsInPool.includes(t.holdingId) ||
    (t.sourceHoldingId && holdingIdsInPool.includes(t.sourceHoldingId)) ||
    (t.destinationHoldingId && holdingIdsInPool.includes(t.destinationHoldingId))
  );

  // --- Financial Core Calculations (Scoped to active Pool) ---
  const totalValuation = activePoolHoldings.reduce((sum, p) => sum + p.currentValuation, 0);
  const totalInvested = activePoolHoldings.reduce((sum, p) => sum + p.investedAmount, 0);
  const overallReturns = totalValuation - totalInvested;
  const overallROI = totalInvested > 0 ? (overallReturns / totalInvested) * 100 : 0;

  // --- Core Handlers ---

  const handleResetData = () => {
    if (confirm("Reset application data to original mock defaults? Any changes will be overwritten.")) {
      localStorage.removeItem('savings_tracker_pools_v2');
      localStorage.removeItem('savings_tracker_holdings_v2');
      localStorage.removeItem('savings_tracker_groups');
      localStorage.removeItem('savings_tracker_pools');
      localStorage.removeItem('savings_tracker_transactions');
      localStorage.removeItem('savings_tracker_active_pool_id');
      localStorage.removeItem('savings_tracker_active_group_id');
      setPools(INITIAL_POOLS);
      setHoldings(INITIAL_HOLDINGS);
      setTransactions(INITIAL_TRANSACTIONS);
      setActivePoolId(INITIAL_POOLS[0].id);
      window.location.hash = `#/`;
    }
  };

  const handleDeletePool = (id: string) => {
    const remainingPools = pools.filter(g => g.id !== id);
    setPools(remainingPools);

    // Delete holdings and transactions associated with this group
    const holdingsToDelete = holdings.filter(p => p.poolId === id);
    const holdingIdsToDelete = holdingsToDelete.map(p => p.id);

    setHoldings(prev => prev.filter(p => p.poolId !== id));
    setTransactions(prev => prev.filter(t => 
      !holdingIdsToDelete.includes(t.holdingId) &&
      !(t.sourceHoldingId && holdingIdsToDelete.includes(t.sourceHoldingId)) &&
      !(t.destinationHoldingId && holdingIdsToDelete.includes(t.destinationHoldingId))
    ));

    // Route back to pools listing or update active group
    if (remainingPools.length > 0) {
      setActivePoolId(remainingPools[0].id);
    }
    window.location.hash = '#/';
  };

  const handlePoolSubmit = (groupData: { title: string; description: string; categories: HoldingCategory[] }) => {
    const timestamp = new Date().toISOString();

    if (poolToEdit) {
      setPools(prev =>
        prev.map(g =>
          g.id === poolToEdit.id
            ? { ...g, title: groupData.title, description: groupData.description, categories: groupData.categories, updatedAt: timestamp }
            : g
        )
      );
    } else {
      const newPoolId = `pool-${Date.now()}`;
      const newPool: Pool = {
        id: newPoolId,
        title: groupData.title,
        description: groupData.description,
        categories: groupData.categories,
        createdAt: timestamp,
        updatedAt: timestamp,
      };
      setPools(prev => [...prev, newPool]);
      setActivePoolId(newPoolId);
      window.location.hash = `#/pool/${newPoolId}`;
    }
    setPoolToEdit(null);
  };

  // Create or Update Pool details
  const handleHoldingSubmit = (poolData: {
    name: string;
    category: HoldingCategory;
    description: string;
    initialBalance: number;
  }) => {
    const timestamp = new Date().toISOString();

    if (holdingToEdit) {
      // Edit mode
      setHoldings((prev) =>
        prev.map((p) =>
          p.id === holdingToEdit.id
            ? {
                ...p,
                name: poolData.name,
                category: poolData.category,
                description: poolData.description,
                updatedAt: timestamp,
              }
            : p
        )
      );
    } else {
      // Create mode
      const newPoolId = `holding-${Date.now()}`;
      const newPool: Holding = {
        id: newPoolId,
        poolId: activePoolId,  // Auto-link with active group
        name: poolData.name,
        category: poolData.category,
        description: poolData.description,
        investedAmount: poolData.initialBalance,
        currentValuation: poolData.initialBalance,
        createdAt: timestamp,
        updatedAt: timestamp,
      };

      setHoldings((prev) => [...prev, newPool]);

      // If initial balance is injected, log transaction automatically
      if (poolData.initialBalance > 0) {
        const newTx: Transaction = {
          id: `tx-${Date.now()}`,
          holdingId: newPoolId,
          type: 'creation',
          amount: poolData.initialBalance,
          note: `Initial capital allocation for ${poolData.name}`,
          timestamp,
        };
        setTransactions((prev) => [newTx, ...prev]);
      }
    }
    setHoldingToEdit(null);
  };

  // Perform transaction (Deposit, Withdraw, Transfer, Valuation Adjustment)
  const handleTransactionSubmit = (txData: {
    type: TransactionType;
    holdingId: string;
    sourceHoldingId?: string;
    destinationHoldingId?: string;
    amount: number;
    newValuation?: number;
    note: string;
  }) => {
    const timestamp = new Date().toISOString();
    const newTxId = `tx-${Date.now()}`;

    const newTx: Transaction = {
      id: newTxId,
      holdingId: txData.holdingId,
      sourceHoldingId: txData.sourceHoldingId,
      destinationHoldingId: txData.destinationHoldingId,
      type: txData.type,
      amount: txData.amount,
      newValuation: txData.newValuation,
      note: txData.note,
      timestamp,
    };

    setHoldings((prevPools) => {
      return prevPools.map((p) => {
        // Valuation Overrides (Manually inputs current net valuation)
        if (txData.type === 'valuation_adjustment' && p.id === txData.holdingId && txData.newValuation !== undefined) {
          newTx.previousValuation = p.currentValuation;
          return {
            ...p,
            currentValuation: txData.newValuation,
            updatedAt: timestamp,
          };
        }

        // Standard Deposit
        if (txData.type === 'deposit' && p.id === txData.holdingId) {
          return {
            ...p,
            investedAmount: p.investedAmount + txData.amount,
            currentValuation: p.currentValuation + txData.amount,
            updatedAt: timestamp,
          };
        }

        // Standard Withdrawal
        if (txData.type === 'withdrawal' && p.id === txData.holdingId) {
          return {
            ...p,
            investedAmount: Math.max(0, p.investedAmount - txData.amount),
            currentValuation: Math.max(0, p.currentValuation - txData.amount),
            updatedAt: timestamp,
          };
        }

        // Transfer Outflow from Source Pool
        if (txData.type === 'transfer' && p.id === txData.sourceHoldingId) {
          return {
            ...p,
            investedAmount: Math.max(0, p.investedAmount - txData.amount),
            currentValuation: Math.max(0, p.currentValuation - txData.amount),
            updatedAt: timestamp,
          };
        }

        // Transfer Inflow to Destination Pool
        if (txData.type === 'transfer' && p.id === txData.destinationHoldingId) {
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
  const handleConfirmDeleteHolding = () => {
    if (!holdingToDelete) return;

    // Remove pool
    setHoldings((prev) => prev.filter((p) => p.id !== holdingToDelete.id));

    // Remove pool transaction entries
    setTransactions((prev) =>
      prev.filter(
        (t) =>
          t.holdingId !== holdingToDelete.id &&
          t.sourceHoldingId !== holdingToDelete.id &&
          t.destinationHoldingId !== holdingToDelete.id
      )
    );

    setHoldingToDelete(null);
  };

  // --- Trigger Shortcuts Helpers ---
  const triggerHoldingForm = (pool: Holding | null = null) => {
    setHoldingToEdit(pool);
    setIsHoldingModalOpen(true);
  };

  const triggerTxForm = (
    tab: 'deposit' | 'withdrawal' | 'transfer' | 'valuation_adjustment',
    pool: Holding | null = null
  ) => {
    setTxModalTab(tab);
    setTxSelectedHolding(pool);
    setIsTxModalOpen(true);
  };

  // --- Filter Pool Results ---
  const filteredHoldings = activePoolHoldings.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  // Render landing page
  if (currentRoute === '#/landing-page') {
    return (
      <LandingPage
        onEnterApp={() => {
          window.location.hash = '#/';
        }}
      />
    );
  }

  // Render authentication page
  if (currentRoute === '#/auth') {
    return (
      <AuthPage
        onAuthenticate={handleAuthenticate}
        savedPasscodeExists={!!savedPasscode}
      />
    );
  }

  // Render standalone flow-map subpage if we are on the flow route
  if (currentRoute.startsWith('#/flow')) {
    return (
      <LedgerFlowVisualizer
        holdings={activePoolHoldings}
        transactions={activePoolTransactions}
        onAddHolding={(holdingData) => {
          handleHoldingSubmit(holdingData);
        }}
        onAddTransaction={handleTransactionSubmit}
        onDeleteHolding={(holdingId) => {
          setHoldings((prev) => prev.filter((p) => p.id !== holdingId));
          setTransactions((prev) => prev.filter(t => t.holdingId !== holdingId && t.sourceHoldingId !== holdingId && t.destinationHoldingId !== holdingId));
        }}
        onClose={() => {
          window.location.hash = `#/pool/${activePoolId}`;
        }}
      />
    );
  }

  // Render standalone timeline subpage if we are on the timeline route
  if (currentRoute.startsWith('#/timeline')) {
    return (
      <PoolTimeline
        pool={activePool}
        holdings={activePoolHoldings}
        transactions={activePoolTransactions}
        onClose={() => {
          window.location.hash = `#/pool/${activePoolId}`;
        }}
      />
    );
  }

  // Render empty state if there are no pools
  if (pools.length === 0) {
    return (
      <div className="min-h-screen bg-[#F9F8F6] flex items-center justify-center p-6" id="empty-pools-state">
        <div className="bg-white border border-[#DCDAD2] p-12 max-w-md w-full text-center space-y-6 shadow-xl animate-in fade-in zoom-in-95 duration-200">
          <div className="mx-auto w-12 h-12 bg-[#F9F8F6] border border-[#DCDAD2] text-[#1A1A1A] flex items-center justify-center">
            <Folder className="w-5 h-5" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-serif font-bold text-[#1A1A1A]">Create Your First Pool</h2>
            <p className="text-xs text-[#8C8C85] leading-relaxed font-serif italic">
              Wealth Folio tracks assets inside segregated pools. Create an asset group (such as "Personal Finances" or "Business Holdings") to begin tracking your holdings.
            </p>
          </div>
          <button
            onClick={() => {
              setPoolToEdit(null);
              setIsPoolModalOpen(true);
            }}
            className="w-full py-3 bg-[#1A1A1A] hover:bg-[#3E3E39] text-white font-bold uppercase tracking-widest text-[10px] cursor-pointer border border-[#1A1A1A]"
          >
            + Create New Pool
          </button>
          <PoolFormModal
            isOpen={isPoolModalOpen}
            poolToEdit={null}
            onClose={() => setIsPoolModalOpen(false)}
            onSubmit={handlePoolSubmit}
          />
        </div>
      </div>
    );
  }

  // Render Pools List Page (Base Route `#/` or empty route)
  if (currentRoute === '#/' || currentRoute === '' || currentRoute === '#') {
    return (
      <div className="min-h-screen bg-[#F9F8F6] flex flex-col font-sans" id="app-root-container">
        {/* Navigation Bar */}
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
                onClick={() => { window.location.hash = '#/landing-page'; }}
                className="px-3.5 py-2 text-[10px] border border-[#DCDAD2] text-[#8C8C85] hover:text-[#1A1A1A] hover:bg-[#F9F8F6] font-bold uppercase tracking-wider rounded-none transition-all flex items-center space-x-1 cursor-pointer"
                title="View product info & capabilities landing page"
              >
                <Info className="w-3 h-3 text-[#8C8C85]" />
                <span>Info</span>
              </button>
              <button
                onClick={() => {
                  sessionStorage.removeItem('savings_tracker_is_logged_in');
                  setIsLoggedIn(false);
                  window.location.hash = '#/auth';
                }}
                className="px-3.5 py-2 text-[10px] border border-[#DCDAD2] text-[#8C8C85] hover:text-rose-700 hover:bg-rose-50/50 hover:border-rose-250 font-bold uppercase tracking-wider rounded-none transition-all flex items-center space-x-1 cursor-pointer"
                title="Lock ledger vaults and log out"
              >
                <Lock className="w-3.5 h-3.5 text-[#8C8C85] hover:text-rose-700" />
                <span>Lock</span>
              </button>
              <button
                onClick={handleResetData}
                className="px-3.5 py-2 text-[10px] border border-[#DCDAD2] text-[#1A1A1A] hover:bg-[#F9F8F6] font-bold uppercase tracking-wider rounded-none transition-all flex items-center space-x-1 cursor-pointer"
                title="Reset data to defaults"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Defaults</span>
              </button>
              <button
                onClick={() => {
                  setPoolToEdit(null);
                  setIsPoolModalOpen(true);
                }}
                className="px-4.5 py-2 bg-[#1A1A1A] hover:bg-[#3E3E39] text-white rounded-none text-[10px] uppercase tracking-widest font-bold shadow-xs transition-all flex items-center space-x-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Pool</span>
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

          {/* Pool Search Bar & Category Filters */}
          <div className="space-y-4">
            <div className="relative w-full">
              <Search className="w-3.5 h-3.5 text-[#8C8C85] absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={poolSearchQuery}
                onChange={(e) => setPoolSearchQuery(e.target.value)}
                placeholder="Search segregation pools by title or description..."
                className="w-full pl-10 pr-4 py-3 bg-white border border-[#DCDAD2] rounded-none text-xs font-semibold focus:outline-hidden focus:border-[#1A1A1A] transition-all text-[#1A1A1A]"
              />
            </div>

            {/* Category quick filters */}
            <div className="flex items-center space-x-1.5 overflow-x-auto pb-2 scrollbar-none border-t border-[#F1EFEA] pt-3.5">
              <ListFilter className="w-3.5 h-3.5 text-[#8C8C85] flex-shrink-0" />
              
              {['all', ...Object.keys(CATEGORY_DETAILS)].map((cat) => {
                const label = cat === 'all' ? 'All Pools' : CATEGORY_DETAILS[cat as HoldingCategory].label;
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

          {/* Pools Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="pools-grid">
            <AnimatePresence>
              {(() => {
                const filteredPools = pools.filter((group) => {
                  const query = poolSearchQuery.toLowerCase().trim();
                  const matchesSearch = group.title.toLowerCase().includes(query) || 
                         (group.description && group.description.toLowerCase().includes(query));
                  
                  const poolCategories = group.categories || [];
                  const matchesCategory = categoryFilter === 'all' || poolCategories.includes(categoryFilter as HoldingCategory);
                  return matchesSearch && matchesCategory;
                });

                if (filteredPools.length === 0) {
                  return (
                    <div className="bg-white border border-dashed border-[#DCDAD2] rounded-none p-12 text-center max-w-lg mx-auto w-full col-span-full">
                      <div className="w-12 h-12 bg-[#F9F8F6] border border-[#DCDAD2] flex items-center justify-center mx-auto text-[#8C8C85] mb-4">
                        <Info className="w-5 h-5" />
                      </div>
                      <h4 className="text-base font-serif font-bold text-[#1A1A1A]">No pools match your query</h4>
                      <p className="text-xs text-[#8C8C85] mt-1.5 max-w-sm mx-auto font-serif italic">
                        Try clearing your search query or category filter.
                      </p>
                      <button
                        onClick={() => { setPoolSearchQuery(''); setCategoryFilter('all'); }}
                        className="mt-4 text-[10px] uppercase tracking-wider font-bold px-4 py-2 bg-white border border-[#DCDAD2] text-[#1A1A1A] hover:bg-[#F9F8F6] transition-colors cursor-pointer"
                      >
                        Clear Pool Filters
                      </button>
                    </div>
                  );
                }

                return filteredPools.map((group) => {
                  const poolHoldings = holdings.filter((p) => p.poolId === group.id);
                  const val = poolHoldings.reduce((sum, p) => sum + p.currentValuation, 0);
                  const inv = poolHoldings.reduce((sum, p) => sum + p.investedAmount, 0);
                  const ret = val - inv;
                  const roi = inv > 0 ? (ret / inv) * 100 : 0;
                  
                  const formatPoolCurrency = (amount: number) => {
                    return new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'USD',
                      maximumFractionDigits: 0,
                    }).format(amount);
                  };

                  return (
                    <motion.div
                      key={group.id}
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      onClick={() => {
                        setActivePoolId(group.id);
                        window.location.hash = `#/pool/${group.id}`;
                      }}
                      className="bg-white border border-[#DCDAD2] rounded-none hover:border-[#1A1A1A] hover:shadow-md cursor-pointer transition-all duration-300 p-6 flex flex-col justify-between overflow-hidden relative group/card"
                    >
                      <div className="space-y-4">
                        {/* Header */}
                        <div className="flex justify-between items-start">
                          <div className="space-y-1 pr-6 flex-1 min-w-0">
                            <h4 className="text-xl font-serif font-bold text-[#1A1A1A] tracking-tight holding-hover/card:text-[#8C8C85] transition-colors truncate">
                              {group.title}
                            </h4>
                            <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                              <span className="inline-flex items-center text-[9px] font-bold tracking-widest uppercase text-[#8C8C85] border border-[#DCDAD2] px-2 py-0.5 bg-[#F9F8F6]">
                                {poolHoldings.length} {poolHoldings.length === 1 ? 'Holding' : 'Holdings'}
                              </span>
                              {(group.categories || []).map((cat) => {
                                const details = CATEGORY_DETAILS[cat];
                                if (!details) return null;
                                return (
                                  <span 
                                    key={cat} 
                                    className="inline-flex items-center text-[8px] font-bold tracking-widest uppercase text-[#8C8C85] border border-[#DCDAD2] px-1.5 py-0.5 bg-white"
                                  >
                                    {details.label}
                                  </span>
                                );
                              })}
                            </div>
                          </div>

                          {/* Quick controls */}
                          <div className="flex items-center space-x-1 relative z-25">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setPoolToEdit(group);
                                setIsPoolModalOpen(true);
                              }}
                              className="p-1.5 text-[#8C8C85] hover:text-[#1A1A1A] hover:bg-[#F9F8F6] border border-transparent hover:border-[#DCDAD2] transition-colors"
                              title="Edit group details"
                            >
                              <Settings className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (confirm(`Permanently delete pool "${group.title}"?\n\nWARNING: This will permanently delete all Holdings in this pool and their full transaction history.`)) {
                                  handleDeletePool(group.id);
                                }
                              }}
                              className="p-1.5 text-[#8C8C85] hover:text-rose-750 hover:bg-rose-50/50 border border-transparent hover:border-rose-250 transition-colors"
                              title="Delete pool"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Description */}
                        <p className="text-xs text-[#6B6B66] line-clamp-2 leading-relaxed font-serif italic text-pretty min-h-[32px]">
                          {group.description || 'No description provided.'}
                        </p>

                        {/* Stats */}
                        <div className="border-t border-[#DCDAD2] pt-4 grid grid-cols-2 gap-4 mt-2">
                          <div>
                            <span className="text-[9px] font-bold text-[#8C8C85] uppercase tracking-[0.12em] block">
                              Net Valuation
                            </span>
                            <span className="text-lg font-serif text-[#1A1A1A] block mt-0.5">
                              {formatPoolCurrency(val)}
                            </span>
                          </div>
                          <div>
                            <span className="text-[9px] font-bold text-[#8C8C85] uppercase tracking-[0.12em] block">
                              ROI / Yield
                            </span>
                            {inv > 0 ? (
                              <span className={`text-xs font-serif font-bold mt-1.5 block ${ret >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                                {ret >= 0 ? '+' : ''}{roi.toFixed(1)}%
                              </span>
                            ) : (
                              <span className="text-xs text-[#8C8C85] mt-1.5 block">0%</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                });
              })()}
            </AnimatePresence>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-[#DCDAD2] mt-16 py-8 text-center text-xs text-[#8C8C85]">
          <div className="max-w-7xl mx-auto px-4 font-serif italic space-y-1">
            <p>© 2026 Savings and Investment Tracker • Secured Locally via State Persistence Engine</p>
            <p className="text-[10px] font-sans not-italic uppercase tracking-widest text-[#B5B3AC]">Designed with desktop density and micro-animations for clean wealth overview</p>
          </div>
        </footer>

        {/* Modal Popups */}
        <PoolFormModal
          isOpen={isPoolModalOpen}
          poolToEdit={poolToEdit}
          onClose={() => { setIsPoolModalOpen(false); setPoolToEdit(null); }}
          onSubmit={handlePoolSubmit}
        />
      </div>
    );
  }

  // Render Pool Detail Dashboard

  return (
    <div className="min-h-screen bg-[#F9F8F6] flex flex-col font-sans" id="app-root-container">
      
      {/* Visual Navigation Bar */}
      <header className="bg-white border-b border-[#DCDAD2] sticky top-0 z-40" id="header-navigation">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center space-x-6 self-start sm:self-auto">
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

            {/* Premium Pool Switcher dropdown */}
            <div className="relative border-l border-[#DCDAD2] pl-6 flex items-center">
              <button
                onClick={() => setIsPoolDropdownOpen(!isPoolDropdownOpen)}
                className="flex items-center space-x-2 text-[#1A1A1A] hover:text-[#8C8C85] transition-colors cursor-pointer text-left focus:outline-hidden"
                title="Switch or manage active finance pool"
              >
                <Folder className="w-4 h-4 text-[#8C8C85]" />
                <span className="font-serif font-bold text-sm tracking-tight border-b border-dashed border-[#8C8C85] pb-0.5 select-none">
                  {activePool?.title || 'Select Pool'}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-[#8C8C85]" />
              </button>

              {isPoolDropdownOpen && (
                <div className="absolute left-6 top-8 mt-1 bg-white border border-[#1A1A1A] w-64 shadow-2xl z-50 flex flex-col divide-y divide-[#F1EFEA] animate-in fade-in slide-in-from-top-1 duration-100">
                  <div className="max-h-60 overflow-y-auto">
                    {pools.map((group) => {
                      const isSelected = group.id === activePoolId;
                      return (
                        <div
                          key={group.id}
                          className={`p-3.5 flex items-start justify-between group/item cursor-pointer transition-colors ${
                            isSelected ? 'bg-[#F9F8F6]' : 'hover:bg-[#F9F8F6]/60'
                          }`}
                          onClick={() => {
                            setActivePoolId(group.id);
                            setIsPoolDropdownOpen(false);
                            window.location.hash = `#/pool/${group.id}`;
                          }}
                        >
                          <div className="flex-1 min-w-0 pr-2">
                            <span className={`text-xs font-serif block truncate ${isSelected ? 'font-bold text-[#1A1A1A]' : 'text-[#6B6B66] holding-hover/item:text-[#1A1A1A]'}`}>
                              {group.title}
                            </span>
                            {group.description && (
                              <span className="text-[10px] text-[#8C8C85] font-serif italic block truncate mt-0.5">
                                {group.description}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-1 opacity-0 holding-hover/item:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setPoolToEdit(group);
                                setIsPoolModalOpen(true);
                                setIsPoolDropdownOpen(false);
                              }}
                              className="p-1 hover:bg-[#DCDAD2]/50 text-[#8C8C85] hover:text-[#1A1A1A] transition-colors"
                              title="Edit group title and description"
                            >
                              <Settings className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="p-2 bg-[#F9F8F6]/85 flex justify-between gap-1 text-[10px]">
                    <button
                      onClick={() => {
                        setPoolToEdit(null);
                        setIsPoolModalOpen(true);
                        setIsPoolDropdownOpen(false);
                      }}
                      className="flex-1 text-center py-1.5 border border-[#DCDAD2] hover:border-[#1A1A1A] bg-white text-[#1A1A1A] font-bold uppercase tracking-wider cursor-pointer"
                    >
                      + Create Pool
                    </button>
                    {pools.length > 1 && (
                      <button
                        onClick={() => {
                          if (confirm(`Are you sure you want to permanently delete pool "${activePool.title}"?\n\nWARNING: This will permanently delete all Holdings in this pool and their full transaction history.`)) {
                            handleDeletePool(activePoolId);
                          }
                          setIsPoolDropdownOpen(false);
                        }}
                        className="px-2 text-center py-1.5 bg-rose-850 hover:bg-rose-950 text-white font-bold uppercase tracking-wider cursor-pointer flex items-center justify-center"
                        title="Delete active group and all its holdings"
                      >
                        Delete Active Pool
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2.5 self-end sm:self-auto">
            <button
              onClick={() => {
                sessionStorage.removeItem('savings_tracker_is_logged_in');
                setIsLoggedIn(false);
                window.location.hash = '#/auth';
              }}
              className="px-3.5 py-2 text-[10px] border border-[#DCDAD2] text-[#8C8C85] hover:text-rose-700 hover:bg-rose-50/50 hover:border-rose-250 font-bold uppercase tracking-wider rounded-none transition-all flex items-center space-x-1 cursor-pointer"
              title="Lock ledger vaults and log out"
            >
              <Lock className="w-3.5 h-3.5 text-[#8C8C85] hover:text-rose-700" />
              <span>Lock</span>
            </button>
            <button
              onClick={handleResetData}
              className="px-3.5 py-2 text-[10px] border border-[#DCDAD2] text-[#1A1A1A] hover:bg-[#F9F8F6] font-bold uppercase tracking-wider rounded-none transition-all flex items-center space-x-1 cursor-pointer"
              title="Reset data to mock defaults"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Defaults</span>
            </button>
            <button
              onClick={() => { window.location.hash = `#/flow/${activePoolId}`; }}
              className="px-3.5 py-2 text-[10px] border border-[#DCDAD2] text-[#1A1A1A] hover:bg-[#F9F8F6] font-bold uppercase tracking-wider rounded-none transition-all flex items-center space-x-1 cursor-pointer"
              title="Visualize entire transactions & timelines flow map"
            >
              <ArrowRightLeft className="w-3.5 h-3.5 text-blue-700" />
              <span>Flow Map</span>
            </button>
            <button
              onClick={() => { window.location.hash = `#/timeline/${activePoolId}`; }}
              className="px-3.5 py-2 text-[10px] border border-[#DCDAD2] text-[#1A1A1A] hover:bg-[#F9F8F6] font-bold uppercase tracking-wider rounded-none transition-all flex items-center space-x-1 cursor-pointer"
              title="View chronological timeline of transactions in this pool"
            >
              <History className="w-3.5 h-3.5 text-amber-700" />
              <span>Show timeline</span>
            </button>
            <button
              onClick={() => triggerHoldingForm(null)}
              className="px-4.5 py-2 bg-[#1A1A1A] hover:bg-[#3E3E39] text-white rounded-none text-[10px] uppercase tracking-widest font-bold shadow-xs transition-all flex items-center space-x-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Holding</span>
            </button>
          </div>

        </div>
      </header>

      {/* Main Container Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Active Pool Description Header banner */}
        <div className="bg-white border border-[#DCDAD2] p-6 rounded-none relative overflow-hidden flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#8C8C85]">Active segregation group</span>
            <h2 className="text-2xl font-serif font-bold text-[#1A1A1A] mt-0.5">{activePool.title}</h2>
            {activePool.description && (
              <p className="text-xs text-[#6B6B66] font-serif italic leading-relaxed mt-1.5 max-w-xl text-balance">
                &ldquo;{activePool.description}&rdquo;
              </p>
            )}
          </div>
          <div className="flex gap-2 self-stretch sm:self-auto">
            <button
              onClick={() => {
                setPoolToEdit(activePool);
                setIsPoolModalOpen(true);
              }}
              className="px-3.5 py-2 text-[10px] border border-[#DCDAD2] hover:border-[#1A1A1A] text-[#1A1A1A] font-bold uppercase tracking-wider rounded-none bg-[#F9F8F6] hover:bg-white transition-all cursor-pointer flex-1 sm:flex-none text-center"
            >
              Edit Pool Details
            </button>
            <button
              onClick={() => { window.location.hash = '#/'; }}
              className="px-3.5 py-2 text-[10px] border border-[#1A1A1A] hover:bg-black text-white font-bold uppercase tracking-wider rounded-none bg-[#1A1A1A] transition-all cursor-pointer flex-1 sm:flex-none text-center"
            >
              ← Back to Pools
            </button>
          </div>
        </div>

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
                  <h3 className="font-serif text-xl font-bold text-[#1A1A1A] tracking-tight">Your Asset Holdings</h3>
                  <p className="text-xs text-[#8C8C85] font-serif italic mt-0.5">Manage individual savings vaults and investments</p>
                </div>

                {/* Explorer Quick triggers */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => triggerTxForm('deposit')}
                    disabled={activePoolHoldings.length === 0}
                    className="px-3 py-2 bg-[#F9F8F6] hover:bg-[#F3F1EC] text-[#1A1A1A] border border-[#DCDAD2] text-[10px] uppercase tracking-wider font-bold transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  >
                    + Capital Inflow
                  </button>
                  <button
                    onClick={() => triggerTxForm('transfer')}
                    disabled={activePoolHoldings.length < 2}
                    className="px-3 py-2 bg-[#F9F8F6] hover:bg-[#F3F1EC] text-[#1A1A1A] border border-[#DCDAD2] text-[10px] uppercase tracking-wider font-bold transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Transfer Funds
                  </button>
                </div>
              </div>

              {/* Pool Search */}
              <div className="mt-5">
                <div className="relative w-full">
                  <Search className="w-3.5 h-3.5 text-[#8C8C85] absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search vaults model, asset types..."
                    className="w-full pl-10 pr-4 py-3 bg-[#F9F8F6] border border-[#DCDAD2] rounded-none text-xs font-semibold focus:outline-hidden focus:bg-white focus:border-[#1A1A1A] transition-all text-[#1A1A1A]"
                  />
                </div>
              </div>
            </div>

            {/* Pools cards grid */}
            {filteredHoldings.length === 0 ? (
              <div className="bg-white border border-dashed border-[#DCDAD2] rounded-none p-12 text-center max-w-lg mx-auto">
                <div className="w-12 h-12 bg-[#F9F8F6] border border-[#DCDAD2] flex items-center justify-center mx-auto text-[#8C8C85] mb-4">
                  <Info className="w-5 h-5" />
                </div>
                <h4 className="text-base font-serif font-bold text-[#1A1A1A]">No vaults match your criteria</h4>
                <p className="text-xs text-[#8C8C85] mt-1.5 max-w-sm mx-auto font-serif italic">
                  Try clearing your search query or asset category filter. Click Create Holding to append a brand-new asset ledger container.
                </p>
                <button
                  onClick={() => { setSearchQuery(''); }}
                  className="mt-4 text-[10px] uppercase tracking-wider font-bold px-4 py-2 bg-white border border-[#DCDAD2] text-[#1A1A1A] hover:bg-[#F9F8F6] transition-colors cursor-pointer"
                >
                  Clear Selection Filter
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5" id="asset-holdings-grid">
                <AnimatePresence mode="popLayout">
                  {filteredHoldings.map((holding) => (
                    <motion.div key={holding.id} layout>
                      <HoldingCard
                        holding={holding}
                        onDeposit={(h) => triggerTxForm('deposit', h)}
                        onWithdraw={(h) => triggerTxForm('withdrawal', h)}
                        onTransfer={(h) => triggerTxForm('transfer', h)}
                        onAdjustValuation={(h) => triggerTxForm('valuation_adjustment', h)}
                        onEdit={(h) => triggerHoldingForm(h)}
                        onDelete={(h) => setHoldingToDelete(h)}
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
              <DistributionChart holdings={activePoolHoldings} />
            </section>

            {/* Historical ledgers listing */}
            <section id="ledger-history-card">
              <TransactionHistory
                transactions={activePoolTransactions}
                holdings={activePoolHoldings}
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
      <HoldingFormModal
        isOpen={isHoldingModalOpen}
        holdingToEdit={holdingToEdit}
        onClose={() => { setIsHoldingModalOpen(false); setHoldingToEdit(null); }}
        onSubmit={handleHoldingSubmit}
      />

      {/* 2. Operational Transactions tabbed sheets */}
      <TransactionModal
        isOpen={isTxModalOpen}
        holdings={activePoolHoldings}
        initialHolding={txSelectedHolding}
        initialTab={txModalTab}
        onClose={() => { setIsTxModalOpen(false); setTxSelectedHolding(null); }}
        onSubmit={handleTransactionSubmit}
      />

      {/* 3. Pool Form Modal */}
      <PoolFormModal
        isOpen={isPoolModalOpen}
        poolToEdit={poolToEdit}
        onClose={() => { setIsPoolModalOpen(false); setPoolToEdit(null); }}
        onSubmit={handlePoolSubmit}
      />

      {/* 4. Custom Deletion verification modal */}
      <AnimatePresence>
        {holdingToDelete && (
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
                  Delete &quot;{holdingToDelete.name}&quot;?
                </h4>
                <p className="text-xs text-[#6B6B66] leading-relaxed font-serif italic">
                  You are permanently removing this assets container. This erases the physical ledger entries for this pool and returns all capital to unallocated state. This event is irreversible.
                </p>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setHoldingToDelete(null)}
                  className="flex-1 px-4 py-3 border border-[#DCDAD2] text-[#1A1A1A] hover:bg-[#F9F8F6] rounded-none text-[10px] uppercase tracking-wider font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDeleteHolding}
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
