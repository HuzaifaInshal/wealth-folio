/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CategoryDetails, InvestmentSource, LedgerTransaction, GoogleSheetConfig } from './types';

export const DEFAULT_CATEGORIES: Record<string, CategoryDetails> = {
  mutual_fund: {
    key: 'mutual_fund',
    label: 'Mutual Funds',
    color: '#06b6d4',
    icon: 'Layers',
    bg: 'bg-cyan-50',
    text: 'text-cyan-800',
  },
  stocks: {
    key: 'stocks',
    label: 'Stock Market',
    color: '#3b82f6',
    icon: 'TrendingUp',
    bg: 'bg-blue-50',
    text: 'text-blue-800',
  },
  savings_certificate: {
    key: 'savings_certificate',
    label: 'Savings Certificates',
    color: '#8b5cf6',
    icon: 'Award',
    bg: 'bg-violet-50',
    text: 'text-violet-800',
  },
  crypto: {
    key: 'crypto',
    label: 'Crypto Assets',
    color: '#f59e0b',
    icon: 'Coins',
    bg: 'bg-amber-50',
    text: 'text-amber-800',
  },
  real_estate: {
    key: 'real_estate',
    label: 'Real Estate',
    color: '#10b981',
    icon: 'Home',
    bg: 'bg-emerald-50',
    text: 'text-emerald-800',
  },
  precious_metals: {
    key: 'precious_metals',
    label: 'Precious Metals',
    color: '#eab308',
    icon: 'Sparkles',
    bg: 'bg-yellow-50',
    text: 'text-yellow-800',
  },
  cash_bank: {
    key: 'cash_bank',
    label: 'Cash & Bank Accounts',
    color: '#059669',
    icon: 'Landmark',
    bg: 'bg-emerald-50',
    text: 'text-emerald-900',
  },
  other: {
    key: 'other',
    label: 'Other Investments',
    color: '#64748b',
    icon: 'Folder',
    bg: 'bg-slate-50',
    text: 'text-slate-800',
  },
};

export const getCategoryDetails = (categoryKey: string): CategoryDetails => {
  if (DEFAULT_CATEGORIES[categoryKey]) {
    return DEFAULT_CATEGORIES[categoryKey];
  }
  return {
    key: categoryKey,
    label: categoryKey,
    color: '#475569',
    icon: 'Folder',
    bg: 'bg-slate-50',
    text: 'text-slate-800',
  };
};

const dateXDaysAgo = (days: number): string => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
};

export const INITIAL_INVESTMENTS: InvestmentSource[] = [
  {
    id: 'inv-1',
    name: 'Cash Fund (Money Market)',
    category: 'mutual_fund',
    investedAmount: 15000,
    currentValuation: 15450,
    notes: 'Low risk liquidity fund',
    createdAt: dateXDaysAgo(90),
    updatedAt: dateXDaysAgo(5),
  },
  {
    id: 'inv-2',
    name: 'Tech Equity Stock Fund',
    category: 'mutual_fund',
    investedAmount: 20000,
    currentValuation: 23800,
    notes: 'High growth index fund',
    createdAt: dateXDaysAgo(120),
    updatedAt: dateXDaysAgo(2),
  },
  {
    id: 'inv-3',
    name: 'Bluechip Dividend Stocks Portfolio',
    category: 'stocks',
    investedAmount: 30000,
    currentValuation: 32400,
    notes: 'Quarterly dividend reinvestment',
    createdAt: dateXDaysAgo(150),
    updatedAt: dateXDaysAgo(1),
  },
  {
    id: 'inv-4',
    name: 'National Savings Certificate #1',
    category: 'savings_certificate',
    investedAmount: 10000,
    currentValuation: 10800,
    notes: '3-Year fixed certificate',
    createdAt: dateXDaysAgo(200),
    updatedAt: dateXDaysAgo(10),
  },
];

export const INITIAL_TRANSACTIONS: LedgerTransaction[] = [
  {
    id: 'tx-1',
    type: 'invest',
    sourceId: 'inv-1',
    amount: 15000,
    note: 'Initial cash fund capital contribution',
    timestamp: dateXDaysAgo(90),
  },
  {
    id: 'tx-2',
    type: 'invest',
    sourceId: 'inv-2',
    amount: 20000,
    note: 'Lump-sum stock fund deposit',
    timestamp: dateXDaysAgo(120),
  },
  {
    id: 'tx-3',
    type: 'invest',
    sourceId: 'inv-3',
    amount: 30000,
    note: 'Purchased dividend portfolio',
    timestamp: dateXDaysAgo(150),
  },
  {
    id: 'tx-4',
    type: 'invest',
    sourceId: 'inv-4',
    amount: 10000,
    note: 'Purchased 3-year savings certificate',
    timestamp: dateXDaysAgo(200),
  },
  {
    id: 'tx-5',
    type: 'transfer',
    sourceId: 'inv-1',
    targetId: 'inv-2',
    amount: 2000,
    note: 'Reallocated capital from cash fund into stock fund',
    timestamp: dateXDaysAgo(30),
  },
  {
    id: 'tx-6',
    type: 'revalue',
    sourceId: 'inv-3',
    amount: 0,
    previousValuation: 31000,
    newValuation: 32400,
    note: 'Updated market closing balance',
    timestamp: dateXDaysAgo(1),
  },
];

export const DEFAULT_SHEET_CONFIG: GoogleSheetConfig = {
  webAppUrl: '',
  autoSync: true,
};
