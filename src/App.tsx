import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { InvestmentSource, Transaction, TransactionType } from './types';
import { DEFAULT_CATEGORIES } from './data';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';

// Import Components & Views
import Sidebar from './components/Sidebar';
import MetricCard from './components/MetricCard';
import InvestmentCard from './components/InvestmentCard';
import InvestmentFormModal from './components/InvestmentFormModal';
import TransactionModal from './components/TransactionModal';
import LedgerTable from './components/LedgerTable';
import ActionToolbar from './components/ActionToolbar';
import CategorySelectModal from './components/CategorySelectModal';
import AuthPage from './components/AuthPage';
import SettingsPage from './components/SettingsPage';

// Import Google Sheets API Services
import {
  fetchSheetInvestments,
  fetchSheetTransactions,
  saveSheetInvestment,
  deleteSheetInvestment,
  appendSheetTransaction,
} from './services/googleSheets';

// Import Icons
import {
  Landmark,
  Plus,
  Sun,
  Moon,
  Menu,
} from 'lucide-react';

function DashboardContent() {
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated, isInitializing, accessToken, spreadsheetId, setIsSyncing, setSyncError } = useAuth();

  // If unauthenticated, gate with AuthPage
  if (isInitializing) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-4">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-slate-400">Loading WealthFolio Vault...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  // --- Live Google Sheets State ---
  const [investments, setInvestments] = useState<InvestmentSource[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoadingSheetsData, setIsLoadingSheetsData] = useState(false);

  // Live Read from Google Sheets
  useEffect(() => {
    if (!accessToken || !spreadsheetId) return;

    let isMounted = true;
    const loadLiveSheetsData = async () => {
      setIsLoadingSheetsData(true);
      setIsSyncing(true);
      try {
        const [liveInvs, liveTxs] = await Promise.all([
          fetchSheetInvestments(accessToken, spreadsheetId),
          fetchSheetTransactions(accessToken, spreadsheetId),
        ]);
        if (isMounted) {
          setInvestments(liveInvs);
          setTransactions(liveTxs);
          setSyncError(null);
        }
      } catch (err: any) {
        if (isMounted) {
          setSyncError(err.message || 'Failed to fetch live data from Google Sheets');
        }
      } finally {
        if (isMounted) {
          setIsLoadingSheetsData(false);
          setIsSyncing(false);
        }
      }
    };

    loadLiveSheetsData();
    return () => {
      isMounted = false;
    };
  }, [accessToken, spreadsheetId]);

  // --- URL Parameter & Filter Persistence ---
  const getInitialCategoryFromUrl = () => {
    try {
      const params = new URLSearchParams(window.location.search);
      return params.get('category') || 'all';
    } catch {
      return 'all';
    }
  };

  const getInitialTabFromUrl = (): 'dashboard' | 'ledger' | 'settings' => {
    try {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab');
      if (tab === 'ledger') return 'ledger';
      if (tab === 'settings') return 'settings';
      return 'dashboard';
    } catch {
      return 'dashboard';
    }
  };

  const [categoryFilter, setCategoryFilterState] = useState<string>(getInitialCategoryFromUrl);
  const [activeTab, setActiveTabState] = useState<'dashboard' | 'ledger' | 'settings'>(getInitialTabFromUrl);

  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const cat = params.get('category') || 'all';
      const tabParam = params.get('tab');
      const tab = tabParam === 'ledger' ? 'ledger' : tabParam === 'settings' ? 'settings' : 'dashboard';
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

  const setActiveTab = (tab: 'dashboard' | 'ledger' | 'settings') => {
    setActiveTabState(tab);
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('tab', tab);
      window.history.pushState({}, '', url.toString());
    } catch {}
  };

  // Modals & Layout States
  const [isInvestmentModalOpen, setIsInvestmentModalOpen] = useState(false);
  const [investmentToEdit, setInvestmentToEdit] = useState<InvestmentSource | null>(null);

  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [txInitialType, setTxInitialType] = useState<TransactionType>('invest');
  const [txInitialSource, setTxInitialSource] = useState<InvestmentSource | null>(null);

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('wealthfolio_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const toggleSidebarCollapsed = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('wealthfolio_sidebar_collapsed', String(next));
      } catch {}
      return next;
    });
  };

  // --- Financial Calculations (Scoped to Selected Category Tab) ---
  const scopedInvestments = investments.filter(
    (inv) => categoryFilter === 'all' || inv.category === categoryFilter
  );

  const totalValuation = scopedInvestments.reduce((sum, i) => sum + i.currentValuation, 0);
  const totalInvested = scopedInvestments.reduce((sum, i) => sum + i.investedAmount, 0);
  const totalProfit = totalValuation - totalInvested;
  const overallROI = totalInvested > 0 ? (totalProfit / totalInvested) * 100 : 0;

  // --- Handlers ---

  const handleSaveInvestmentSource = async (data: {
    name: string;
    category: string;
    initialBalance: number;
    notes?: string;
  }) => {
    let savedSource: InvestmentSource;
    if (investmentToEdit) {
      savedSource = {
        ...investmentToEdit,
        name: data.name,
        category: data.category,
        notes: data.notes,
      };
      setInvestments((prev) => prev.map((inv) => (inv.id === savedSource.id ? savedSource : inv)));
    } else {
      savedSource = {
        id: `inv_${Date.now()}`,
        name: data.name,
        category: data.category,
        investedAmount: data.initialBalance,
        currentValuation: data.initialBalance,
        notes: data.notes,
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
    return categoryFilter === 'all' || inv.category === categoryFilter;
  });

  return (
    <div className="flex min-h-screen bg-[#F4F5F8] dark:bg-[#0D0E15] transition-colors duration-200" id="app-root-container">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={toggleSidebarCollapsed}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Right Content Panel */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar with Category Filters */}
        <header className="bg-white/85 dark:bg-[#12131A]/85 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 sticky top-0 z-30 transition-colors">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-3">
            {/* Mobile Brand & Menu Hamburger (Hidden on desktop for clean justify-between alignment) */}
            <div className="lg:hidden flex items-center space-x-2 shrink-0">
              <button
                onClick={() => setIsMobileSidebarOpen(true)}
                className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer border border-slate-200/80 dark:border-slate-800/80"
                title="Open Navigation Menu"
              >
                <Menu className="w-4 h-4" />
              </button>
              <div className="p-2 bg-slate-900 dark:bg-purple-600 text-white rounded-lg">
                <Landmark className="w-4 h-4" />
              </div>
            </div>

            {/* Category Filter Pills (Main Header Centerpiece - Max 3 + X more) */}
            <div className="flex items-center space-x-1.5 overflow-x-auto py-1 scrollbar-none max-w-full">
              <button
                onClick={() => setCategoryFilter('all')}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap border cursor-pointer ${
                  categoryFilter === 'all'
                    ? 'bg-slate-900 text-white border-slate-900 dark:bg-purple-600 dark:border-purple-500 shadow-xs'
                    : 'bg-white dark:bg-[#181924] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                All Sources
              </button>
              {(() => {
                const allCatKeys = Object.keys(DEFAULT_CATEGORIES);
                const top3 = allCatKeys.slice(0, 3);
                const displayKeys = [...top3];
                if (categoryFilter !== 'all' && !top3.includes(categoryFilter) && DEFAULT_CATEGORIES[categoryFilter]) {
                  displayKeys.push(categoryFilter);
                }
                const remainingCount = Math.max(0, allCatKeys.length - 3);

                return (
                  <>
                    {displayKeys.map((catKey) => {
                      const details = DEFAULT_CATEGORIES[catKey];
                      if (!details) return null;
                      const isActive = categoryFilter === catKey;

                      return (
                        <button
                          key={catKey}
                          onClick={() => setCategoryFilter(catKey)}
                          className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap border cursor-pointer ${
                            isActive
                              ? 'bg-slate-900 text-white border-slate-900 dark:bg-purple-600 dark:border-purple-500 shadow-xs'
                              : 'bg-white dark:bg-[#181924] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                          }`}
                        >
                          {details.label}
                        </button>
                      );
                    })}

                    {remainingCount > 0 && (
                      <button
                        onClick={() => setIsCategoryModalOpen(true)}
                        className="px-3 py-1.5 text-xs font-bold rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer whitespace-nowrap"
                      >
                        {remainingCount} more
                      </button>
                    )}
                  </>
                );
              })()}
            </div>

            {/* Right Controls */}
            <div className="flex items-center space-x-2 shrink-0">
              <button
                onClick={openNewInvestmentForm}
                className="px-3 py-1.5 bg-slate-900 dark:bg-purple-600 hover:bg-slate-800 dark:hover:bg-purple-500 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center space-x-1 cursor-pointer shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Source</span>
              </button>

              <button
                onClick={toggleTheme}
                className="lg:hidden p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all cursor-pointer border border-slate-200/80 dark:border-slate-800/80"
                title="Toggle Light/Dark Theme"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-purple-600" />}
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
            disabled={investments.length === 0}
          />

          {/* Dashboard Tab Content */}
          {activeTab === 'dashboard' && (
            <>
              {/* Financial Overview Metrics Bar */}
              <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4" id="portfolio-metrics-grid">
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
                  <div className="fintech-card p-8 text-center max-w-lg mx-auto space-y-3 rounded-lg">
                    <Landmark className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">No investment sources found</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
                        Add your mutual funds, stock market holdings, or savings certificates to start tracking.
                      </p>
                    </div>
                    <button
                      onClick={openNewInvestmentForm}
                      className="px-3.5 py-1.5 bg-slate-900 dark:bg-purple-600 hover:bg-slate-800 dark:hover:bg-purple-500 text-white rounded-lg text-xs font-semibold cursor-pointer transition-all shadow-xs"
                    >
                      + Add Investment Source
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
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
            </>
          )}

          {/* Transaction Ledger Table Section */}
          {activeTab === 'ledger' && (
            <section id="transaction-ledger-section">
              <LedgerTable
                transactions={transactions}
                investments={investments}
                categoryFilter={categoryFilter}
              />
            </section>
          )}

          {/* Settings Tab Section */}
          {activeTab === 'settings' && (
            <section id="settings-section">
              <SettingsPage />
            </section>
          )}
        </main>

        {/* App Footer */}
        <footer className="bg-white dark:bg-[#12131A] border-t border-slate-200 dark:border-slate-800/80 py-8 text-center text-xs text-slate-400 dark:text-slate-500 transition-colors">
          <div className="max-w-7xl mx-auto px-4 font-medium space-y-1">
            <p>© 2026 Wealth Folio • Private Personal Investment Ledger</p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              Live Google Sheets Database Persistence & Pure Data Ownership
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

        <CategorySelectModal
          isOpen={isCategoryModalOpen}
          onClose={() => setIsCategoryModalOpen(false)}
          selectedCategory={categoryFilter}
          onSelectCategory={(catKey) => setCategoryFilter(catKey)}
          investments={investments}
          onOpenNewSource={openNewInvestmentForm}
        />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <DashboardContent />
      </AuthProvider>
    </ThemeProvider>
  );
}
