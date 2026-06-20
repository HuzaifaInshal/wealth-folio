/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { InvestmentPool, Transaction, PoolCategory, TransactionType, Group } from './types';
import { INITIAL_POOLS, INITIAL_TRANSACTIONS, CATEGORY_DETAILS, INITIAL_GROUPS } from './data';

// Import Components
import MetricCard from './components/MetricCard';
import PoolCard from './components/PoolCard';
import DistributionChart from './components/DistributionChart';
import TransactionHistory from './components/TransactionHistory';
import PoolFormModal from './components/PoolFormModal';
import TransactionModal from './components/TransactionModal';
import LedgerFlowVisualizer from './components/LedgerFlowVisualizer';
import GroupFormModal from './components/GroupFormModal';

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
  Trash2
} from 'lucide-react';

export default function App() {
  // --- Persistent States ---
  const [groups, setGroups] = useState<Group[]>(() => {
    try {
      const saved = localStorage.getItem('savings_tracker_groups');
      return saved ? JSON.parse(saved) : INITIAL_GROUPS;
    } catch {
      return INITIAL_GROUPS;
    }
  });

  const [activeGroupId, setActiveGroupId] = useState<string>(() => {
    try {
      const savedActive = localStorage.getItem('savings_tracker_active_group_id');
      if (savedActive) {
        // Verify group exists
        const savedGroups = localStorage.getItem('savings_tracker_groups');
        const parsedGroups = savedGroups ? JSON.parse(savedGroups) : INITIAL_GROUPS;
        if (parsedGroups.some((g: any) => g.id === savedActive)) {
          return savedActive;
        }
      }
    } catch {}
    return INITIAL_GROUPS[0]?.id || 'group-1';
  });

  const [pools, setPools] = useState<InvestmentPool[]>(() => {
    try {
      const saved = localStorage.getItem('savings_tracker_pools');
      const parsed = saved ? JSON.parse(saved) : INITIAL_POOLS;
      // Migration: Ensure every pool has a groupId
      return parsed.map((p: any) => {
        if (!p.groupId) {
          return { ...p, groupId: 'group-1' };
        }
        return p;
      });
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
    localStorage.setItem('savings_tracker_groups', JSON.stringify(groups));
  }, [groups]);

  useEffect(() => {
    localStorage.setItem('savings_tracker_active_group_id', activeGroupId);
  }, [activeGroupId]);

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

  // Group Switcher Modal/Dropdown state
  const [isGroupDropdownOpen, setIsGroupDropdownOpen] = useState(false);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [groupToEdit, setGroupToEdit] = useState<Group | null>(null);

  // Custom Confirmation Dialog for Pool Deletion
  const [poolToDelete, setPoolToDelete] = useState<InvestmentPool | null>(null);

  // --- Routing State & Hash Sync ---
  const [currentRoute, setCurrentRoute] = useState<string>(() => {
    return window.location.hash || '#/';
  });

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash || '#/';
      setCurrentRoute(hash);

      // Parse Group ID from route changes
      const groupMatch = hash.match(/^#\/group\/([^?\/]+)/);
      const flowMatch = hash.match(/^#\/flow\/([^?\/]+)/);
      const idFromHash = (groupMatch && groupMatch[1]) || (flowMatch && flowMatch[1]);

      if (idFromHash) {
        // Verify group exists
        if (groups.some(g => g.id === idFromHash)) {
          setActiveGroupId(idFromHash);
        }
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    // Execute immediately on mount to parse initial hash
    handleHashChange();

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [groups]);

  // --- Consolidated Core Calculations (Across all groups/pools) ---
  const consolidatedValuation = pools.reduce((sum, p) => sum + p.currentValuation, 0);
  const consolidatedInvested = pools.reduce((sum, p) => sum + p.investedAmount, 0);
  const consolidatedReturns = consolidatedValuation - consolidatedInvested;
  const consolidatedROI = consolidatedInvested > 0 ? (consolidatedReturns / consolidatedInvested) * 100 : 0;

  // --- Group Level Separation Helpers ---
  const activeGroupPools = pools.filter(p => p.groupId === activeGroupId);
  const poolIdsInGroup = activeGroupPools.map(p => p.id);
  const activeGroupTransactions = transactions.filter(t => 
    poolIdsInGroup.includes(t.poolId) ||
    (t.sourcePoolId && poolIdsInGroup.includes(t.sourcePoolId)) ||
    (t.destinationPoolId && poolIdsInGroup.includes(t.destinationPoolId))
  );

  // --- Financial Core Calculations (Scoped to active Group) ---
  const totalValuation = activeGroupPools.reduce((sum, p) => sum + p.currentValuation, 0);
  const totalInvested = activeGroupPools.reduce((sum, p) => sum + p.investedAmount, 0);
  const overallReturns = totalValuation - totalInvested;
  const overallROI = totalInvested > 0 ? (overallReturns / totalInvested) * 100 : 0;

  // --- Core Handlers ---

  const handleResetData = () => {
    if (confirm("Reset application data to original mock defaults? Any changes will be overwritten.")) {
      localStorage.removeItem('savings_tracker_groups');
      localStorage.removeItem('savings_tracker_pools');
      localStorage.removeItem('savings_tracker_transactions');
      localStorage.removeItem('savings_tracker_active_group_id');
      setGroups(INITIAL_GROUPS);
      setPools(INITIAL_POOLS);
      setTransactions(INITIAL_TRANSACTIONS);
      setActiveGroupId(INITIAL_GROUPS[0].id);
      window.location.hash = `#/`;
    }
  };

  const handleDeleteGroup = (id: string) => {
    const remainingGroups = groups.filter(g => g.id !== id);
    setGroups(remainingGroups);

    // Delete pools and transactions associated with this group
    const poolsToDelete = pools.filter(p => p.groupId === id);
    const poolIdsToDelete = poolsToDelete.map(p => p.id);

    setPools(prev => prev.filter(p => p.groupId !== id));
    setTransactions(prev => prev.filter(t => 
      !poolIdsToDelete.includes(t.poolId) &&
      !(t.sourcePoolId && poolIdsToDelete.includes(t.sourcePoolId)) &&
      !(t.destinationPoolId && poolIdsToDelete.includes(t.destinationPoolId))
    ));

    // Route back to groups listing or update active group
    if (remainingGroups.length > 0) {
      setActiveGroupId(remainingGroups[0].id);
    }
    window.location.hash = '#/';
  };

  const handleGroupSubmit = (groupData: { title: string; description: string }) => {
    const timestamp = new Date().toISOString();

    if (groupToEdit) {
      setGroups(prev =>
        prev.map(g =>
          g.id === groupToEdit.id
            ? { ...g, title: groupData.title, description: groupData.description, updatedAt: timestamp }
            : g
        )
      );
    } else {
      const newGroupId = `group-${Date.now()}`;
      const newGroup: Group = {
        id: newGroupId,
        title: groupData.title,
        description: groupData.description,
        createdAt: timestamp,
        updatedAt: timestamp,
      };
      setGroups(prev => [...prev, newGroup]);
      setActiveGroupId(newGroupId);
      window.location.hash = `#/group/${newGroupId}`;
    }
    setGroupToEdit(null);
  };

  // Create or Update Pool details
  const handlePoolSubmit = (poolData: {
    name: string;
    category: PoolCategory;
    description: string;
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
        groupId: activeGroupId,  // Auto-link with active group
        name: poolData.name,
        category: poolData.category,
        description: poolData.description,
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

    // Remove pool transaction entries
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
  const filteredPools = activeGroupPools.filter((p) => {
    const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Render standalone flow-map subpage if we are on the flow route
  if (currentRoute.startsWith('#/flow')) {
    return (
      <LedgerFlowVisualizer
        pools={activeGroupPools}
        transactions={activeGroupTransactions}
        onAddPool={(poolData) => {
          handlePoolSubmit(poolData);
        }}
        onAddTransaction={handleTransactionSubmit}
        onDeletePool={(poolId) => {
          setPools((prev) => prev.filter((p) => p.id !== poolId));
          setTransactions((prev) => prev.filter(t => t.poolId !== poolId && t.sourcePoolId !== poolId && t.destinationPoolId !== poolId));
        }}
        onClose={() => {
          window.location.hash = `#/group/${activeGroupId}`;
        }}
      />
    );
  }

  // Render empty state if there are no groups
  if (groups.length === 0) {
    return (
      <div className="min-h-screen bg-[#F9F8F6] flex items-center justify-center p-6" id="empty-groups-state">
        <div className="bg-white border border-[#DCDAD2] p-12 max-w-md w-full text-center space-y-6 shadow-xl animate-in fade-in zoom-in-95 duration-200">
          <div className="mx-auto w-12 h-12 bg-[#F9F8F6] border border-[#DCDAD2] text-[#1A1A1A] flex items-center justify-center">
            <Folder className="w-5 h-5" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-serif font-bold text-[#1A1A1A]">Create Your First Group</h2>
            <p className="text-xs text-[#8C8C85] leading-relaxed font-serif italic">
              Wealth Folio tracks assets inside segregated groups. Create an asset group (such as "Personal Finances" or "Business Holdings") to begin tracking your pools.
            </p>
          </div>
          <button
            onClick={() => {
              setGroupToEdit(null);
              setIsGroupModalOpen(true);
            }}
            className="w-full py-3 bg-[#1A1A1A] hover:bg-[#3E3E39] text-white font-bold uppercase tracking-widest text-[10px] cursor-pointer border border-[#1A1A1A]"
          >
            + Create New Group
          </button>
          <GroupFormModal
            isOpen={isGroupModalOpen}
            groupToEdit={null}
            onClose={() => setIsGroupModalOpen(false)}
            onSubmit={handleGroupSubmit}
          />
        </div>
      </div>
    );
  }

  // Render Groups List Page (Base Route `#/` or empty route)
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
                onClick={handleResetData}
                className="px-3.5 py-2 text-[10px] border border-[#DCDAD2] text-[#1A1A1A] hover:bg-[#F9F8F6] font-bold uppercase tracking-wider rounded-none transition-all flex items-center space-x-1 cursor-pointer"
                title="Reset data to defaults"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Defaults</span>
              </button>
              <button
                onClick={() => {
                  setGroupToEdit(null);
                  setIsGroupModalOpen(true);
                }}
                className="px-4.5 py-2 bg-[#1A1A1A] hover:bg-[#3E3E39] text-white rounded-none text-[10px] uppercase tracking-widest font-bold shadow-xs transition-all flex items-center space-x-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Group</span>
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

          {/* Groups Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="groups-grid">
            <AnimatePresence>
              {groups.map((group) => {
                const groupPools = pools.filter((p) => p.groupId === group.id);
                const val = groupPools.reduce((sum, p) => sum + p.currentValuation, 0);
                const inv = groupPools.reduce((sum, p) => sum + p.investedAmount, 0);
                const ret = val - inv;
                const roi = inv > 0 ? (ret / inv) * 100 : 0;
                
                const formatGroupCurrency = (amount: number) => {
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
                      setActiveGroupId(group.id);
                      window.location.hash = `#/group/${group.id}`;
                    }}
                    className="bg-white border border-[#DCDAD2] rounded-none hover:border-[#1A1A1A] hover:shadow-md cursor-pointer transition-all duration-300 p-6 flex flex-col justify-between overflow-hidden relative group/card"
                  >
                    <div className="space-y-4">
                      {/* Header */}
                      <div className="flex justify-between items-start">
                        <div className="space-y-1 pr-6 flex-1 min-w-0">
                          <h4 className="text-xl font-serif font-bold text-[#1A1A1A] tracking-tight group-hover/card:text-[#8C8C85] transition-colors truncate">
                            {group.title}
                          </h4>
                          <span className="inline-flex items-center text-[9px] font-bold tracking-widest uppercase text-[#8C8C85] border border-[#DCDAD2] px-2 py-0.5 bg-[#F9F8F6]">
                            {groupPools.length} {groupPools.length === 1 ? 'Pool' : 'Pools'}
                          </span>
                        </div>

                        {/* Quick controls */}
                        <div className="flex items-center space-x-1 relative z-25">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setGroupToEdit(group);
                              setIsGroupModalOpen(true);
                            }}
                            className="p-1.5 text-[#8C8C85] hover:text-[#1A1A1A] hover:bg-[#F9F8F6] border border-transparent hover:border-[#DCDAD2] transition-colors"
                            title="Edit group details"
                          >
                            <Settings className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm(`Permanently delete group "${group.title}"?\n\nWARNING: This will permanently delete all Pools in this group and their full transaction history.`)) {
                                handleDeleteGroup(group.id);
                              }
                            }}
                            className="p-1.5 text-[#8C8C85] hover:text-rose-750 hover:bg-rose-50/50 border border-transparent hover:border-rose-250 transition-colors"
                            title="Delete group"
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
                            {formatGroupCurrency(val)}
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
              })}
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
        <GroupFormModal
          isOpen={isGroupModalOpen}
          groupToEdit={groupToEdit}
          onClose={() => { setIsGroupModalOpen(false); setGroupToEdit(null); }}
          onSubmit={handleGroupSubmit}
        />
      </div>
    );
  }

  // Render Group Detail Dashboard
  const activeGroup = groups.find((g) => g.id === activeGroupId) || groups[0];

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

            {/* Premium Group Switcher dropdown */}
            <div className="relative border-l border-[#DCDAD2] pl-6 flex items-center">
              <button
                onClick={() => setIsGroupDropdownOpen(!isGroupDropdownOpen)}
                className="flex items-center space-x-2 text-[#1A1A1A] hover:text-[#8C8C85] transition-colors cursor-pointer text-left focus:outline-hidden"
                title="Switch or manage active finance group"
              >
                <Folder className="w-4 h-4 text-[#8C8C85]" />
                <span className="font-serif font-bold text-sm tracking-tight border-b border-dashed border-[#8C8C85] pb-0.5 select-none">
                  {activeGroup?.title || 'Select Group'}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-[#8C8C85]" />
              </button>

              {isGroupDropdownOpen && (
                <div className="absolute left-6 top-8 mt-1 bg-white border border-[#1A1A1A] w-64 shadow-2xl z-50 flex flex-col divide-y divide-[#F1EFEA] animate-in fade-in slide-in-from-top-1 duration-100">
                  <div className="max-h-60 overflow-y-auto">
                    {groups.map((group) => {
                      const isSelected = group.id === activeGroupId;
                      return (
                        <div
                          key={group.id}
                          className={`p-3.5 flex items-start justify-between group/item cursor-pointer transition-colors ${
                            isSelected ? 'bg-[#F9F8F6]' : 'hover:bg-[#F9F8F6]/60'
                          }`}
                          onClick={() => {
                            setActiveGroupId(group.id);
                            setIsGroupDropdownOpen(false);
                            window.location.hash = `#/group/${group.id}`;
                          }}
                        >
                          <div className="flex-1 min-w-0 pr-2">
                            <span className={`text-xs font-serif block truncate ${isSelected ? 'font-bold text-[#1A1A1A]' : 'text-[#6B6B66] group-hover/item:text-[#1A1A1A]'}`}>
                              {group.title}
                            </span>
                            {group.description && (
                              <span className="text-[10px] text-[#8C8C85] font-serif italic block truncate mt-0.5">
                                {group.description}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setGroupToEdit(group);
                                setIsGroupModalOpen(true);
                                setIsGroupDropdownOpen(false);
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
                        setGroupToEdit(null);
                        setIsGroupModalOpen(true);
                        setIsGroupDropdownOpen(false);
                      }}
                      className="flex-1 text-center py-1.5 border border-[#DCDAD2] hover:border-[#1A1A1A] bg-white text-[#1A1A1A] font-bold uppercase tracking-wider cursor-pointer"
                    >
                      + Create Group
                    </button>
                    {groups.length > 1 && (
                      <button
                        onClick={() => {
                          if (confirm(`Are you sure you want to permanently delete group "${activeGroup.title}"?\n\nWARNING: This will permanently delete all Pools in this group and their full transaction history.`)) {
                            handleDeleteGroup(activeGroupId);
                          }
                          setIsGroupDropdownOpen(false);
                        }}
                        className="px-2 text-center py-1.5 bg-rose-850 hover:bg-rose-950 text-white font-bold uppercase tracking-wider cursor-pointer flex items-center justify-center"
                        title="Delete active group and all its pools"
                      >
                        Delete Active
                      </button>
                    )}
                  </div>
                </div>
              )}
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
              onClick={() => { window.location.hash = `#/flow/${activeGroupId}`; }}
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
        
        {/* Active Group Description Header banner */}
        <div className="bg-white border border-[#DCDAD2] p-6 rounded-none relative overflow-hidden flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#8C8C85]">Active segregation group</span>
            <h2 className="text-2xl font-serif font-bold text-[#1A1A1A] mt-0.5">{activeGroup.title}</h2>
            {activeGroup.description && (
              <p className="text-xs text-[#6B6B66] font-serif italic leading-relaxed mt-1.5 max-w-xl text-balance">
                &ldquo;{activeGroup.description}&rdquo;
              </p>
            )}
          </div>
          <div className="flex gap-2 self-stretch sm:self-auto">
            <button
              onClick={() => {
                setGroupToEdit(activeGroup);
                setIsGroupModalOpen(true);
              }}
              className="px-3.5 py-2 text-[10px] border border-[#DCDAD2] hover:border-[#1A1A1A] text-[#1A1A1A] font-bold uppercase tracking-wider rounded-none bg-[#F9F8F6] hover:bg-white transition-all cursor-pointer flex-1 sm:flex-none text-center"
            >
              Edit Group Details
            </button>
            <button
              onClick={() => { window.location.hash = '#/'; }}
              className="px-3.5 py-2 text-[10px] border border-[#1A1A1A] hover:bg-black text-white font-bold uppercase tracking-wider rounded-none bg-[#1A1A1A] transition-all cursor-pointer flex-1 sm:flex-none text-center"
            >
              ← Back to Groups
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
                  <h3 className="font-serif text-xl font-bold text-[#1A1A1A] tracking-tight">Your Asset Pools</h3>
                  <p className="text-xs text-[#8C8C85] font-serif italic mt-0.5">Manage individual savings vaults and investments</p>
                </div>

                {/* Explorer Quick triggers */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => triggerTxForm('deposit')}
                    disabled={activeGroupPools.length === 0}
                    className="px-3 py-2 bg-[#F9F8F6] hover:bg-[#F3F1EC] text-[#1A1A1A] border border-[#DCDAD2] text-[10px] uppercase tracking-wider font-bold transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  >
                    + Capital Inflow
                  </button>
                  <button
                    onClick={() => triggerTxForm('transfer')}
                    disabled={activeGroupPools.length < 2}
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
              <DistributionChart pools={activeGroupPools} />
            </section>

            {/* Historical ledgers listing */}
            <section id="ledger-history-card">
              <TransactionHistory
                transactions={activeGroupTransactions}
                pools={activeGroupPools}
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
        pools={activeGroupPools}
        initialPool={txSelectedPool}
        initialTab={txModalTab}
        onClose={() => { setIsTxModalOpen(false); setTxSelectedPool(null); }}
        onSubmit={handleTransactionSubmit}
      />

      {/* 3. Group Form Modal */}
      <GroupFormModal
        isOpen={isGroupModalOpen}
        groupToEdit={groupToEdit}
        onClose={() => { setIsGroupModalOpen(false); setGroupToEdit(null); }}
        onSubmit={handleGroupSubmit}
      />

      {/* 4. Custom Deletion verification modal */}
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
