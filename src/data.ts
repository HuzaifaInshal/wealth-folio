/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { InvestmentPool, Transaction, PoolCategory } from './types';

export const CATEGORY_DETAILS: Record<
  PoolCategory,
  { label: string; color: string; icon: string; bg: string; text: string }
> = {
  cash: {
    label: 'Cash Savings',
    color: '#10b981', // emerald-500
    icon: 'PiggyBank',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
  },
  stocks: {
    label: 'Stocks & ETFs',
    color: '#3b82f6', // blue-500
    icon: 'TrendingUp',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
  },
  crypto: {
    label: 'Crypto Assets',
    color: '#f59e0b', // amber-500
    icon: 'Coins',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
  },
  real_estate: {
    label: 'Real Estate',
    color: '#8b5cf6', // violet-500
    icon: 'Home',
    bg: 'bg-violet-50',
    text: 'text-violet-700',
  },
  retirement: {
    label: 'Retirement Account',
    color: '#06b6d4', // cyan-500
    icon: 'Shield',
    bg: 'bg-cyan-50',
    text: 'text-cyan-700',
  },
  precious_metals: {
    label: 'Precious Metals',
    color: '#eab308', // yellow-500
    icon: 'Sparkles',
    bg: 'bg-yellow-50',
    text: 'text-yellow-700',
  },
  bonds: {
    label: 'Bonds & Fixed Income',
    color: '#ec4899', // pink-500
    icon: 'FileText',
    bg: 'bg-pink-50',
    text: 'text-pink-700',
  },
  other: {
    label: 'Other Investments',
    color: '#64748b', // slate-500
    icon: 'HelpCircle',
    bg: 'bg-slate-50',
    text: 'text-slate-700',
  },
};

const dateXDaysAgo = (days: number): string => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
};

export const INITIAL_POOLS: InvestmentPool[] = [
  {
    id: 'pool-1',
    name: 'Emergency Fund',
    category: 'cash',
    description: 'High-Yield Savings Account (4.5% APY) for unexpected personal emergencies.',
    investedAmount: 10000,
    currentValuation: 10180, // Accrued interest
    createdAt: dateXDaysAgo(120),
    updatedAt: dateXDaysAgo(5),
  },
  {
    id: 'pool-2',
    name: 'Tech Growth S&P Basket',
    category: 'stocks',
    description: 'Self-directed index and growth stocks (AAPL, GOOGL, MSFT, VGT).',
    investedAmount: 18000,
    currentValuation: 21450, // Capital appreciation
    createdAt: dateXDaysAgo(90),
    updatedAt: dateXDaysAgo(2),
  },
  {
    id: 'pool-3',
    name: 'Long-term Crypto Vault',
    category: 'crypto',
    description: 'Hardware wallet holding BTC and ETH for long term digital standard reservation.',
    investedAmount: 6000,
    currentValuation: 8650, // High ROI
    createdAt: dateXDaysAgo(60),
    updatedAt: dateXDaysAgo(1),
  },
  {
    id: 'pool-4',
    name: 'Roth IRA (Index Funds)',
    category: 'retirement',
    description: 'Tax-advantaged Vanguard target retirement index fund.',
    investedAmount: 25000,
    currentValuation: 26800,
    createdAt: dateXDaysAgo(150),
    updatedAt: dateXDaysAgo(10),
  }
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-1',
    poolId: 'pool-1',
    type: 'creation',
    amount: 8000,
    note: 'Initial emergency fund allocation',
    timestamp: dateXDaysAgo(120),
  },
  {
    id: 'tx-2',
    poolId: 'pool-4',
    type: 'creation',
    amount: 25000,
    note: 'Lump-sum Roth IRA deposit',
    timestamp: dateXDaysAgo(110),
  },
  {
    id: 'tx-3',
    poolId: 'pool-2',
    type: 'creation',
    amount: 15000,
    note: 'Starting tech portfolio',
    timestamp: dateXDaysAgo(90),
  },
  {
    id: 'tx-4',
    poolId: 'pool-1',
    type: 'deposit',
    amount: 2000,
    note: 'Transfer from checking (monthly savings)',
    timestamp: dateXDaysAgo(60),
  },
  {
    id: 'tx-5',
    poolId: 'pool-3',
    type: 'creation',
    amount: 6000,
    note: 'Injected 0.1 BTC + 1 ETH core holdings',
    timestamp: dateXDaysAgo(60),
  },
  {
    id: 'tx-6',
    poolId: 'pool-2',
    type: 'deposit',
    amount: 3000,
    note: 'Purchased extra MSFT shares on dip',
    timestamp: dateXDaysAgo(30),
  },
  {
    id: 'tx-7',
    poolId: 'pool-1',
    type: 'withdrawal',
    amount: 500,
    note: 'Car repairs cost coverage',
    timestamp: dateXDaysAgo(20),
  },
  {
    id: 'tx-8',
    poolId: 'pool-1',
    type: 'valuation_adjustment',
    amount: 0,
    previousValuation: 9500,
    newValuation: 10180,
    note: 'Quarterly yield compounding & adjustment',
    timestamp: dateXDaysAgo(5),
  },
  {
    id: 'tx-9',
    poolId: 'pool-2',
    type: 'valuation_adjustment',
    amount: 0,
    previousValuation: 21000,
    newValuation: 21450,
    note: 'Weekly portfolio mark-to-market revaluation',
    timestamp: dateXDaysAgo(2),
  },
  {
    id: 'tx-10',
    poolId: 'pool-3',
    type: 'valuation_adjustment',
    amount: 0,
    previousValuation: 8520,
    newValuation: 8650,
    note: 'Crypto market spot rate update',
    timestamp: dateXDaysAgo(1),
  },
];
