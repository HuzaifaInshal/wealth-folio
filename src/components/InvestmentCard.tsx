/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { InvestmentSource, TransactionType } from '../types';
import { getCategoryDetails } from '../data';
import {
  TrendingUp,
  Plus,
  Minus,
  ArrowRightLeft,
  Scale,
  Edit3,
  Trash2,
  Layers,
  Award,
  Coins,
  Home,
  Sparkles,
  Landmark,
  Folder,
} from 'lucide-react';

interface InvestmentCardProps {
  investment: InvestmentSource;
  onAction: (investment: InvestmentSource, type: TransactionType) => void;
  onEdit: (investment: InvestmentSource) => void;
  onDelete: (id: string) => void;
}

const getCategoryIconComponent = (iconName: string) => {
  switch (iconName) {
    case 'Layers':
      return <Layers className="w-3.5 h-3.5" />;
    case 'TrendingUp':
      return <TrendingUp className="w-3.5 h-3.5" />;
    case 'Award':
      return <Award className="w-3.5 h-3.5" />;
    case 'Coins':
      return <Coins className="w-3.5 h-3.5" />;
    case 'Home':
      return <Home className="w-3.5 h-3.5" />;
    case 'Sparkles':
      return <Sparkles className="w-3.5 h-3.5" />;
    case 'Landmark':
      return <Landmark className="w-3.5 h-3.5" />;
    default:
      return <Folder className="w-3.5 h-3.5" />;
  }
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function InvestmentCard({
  investment,
  onAction,
  onEdit,
  onDelete,
}: InvestmentCardProps) {
  const catDetails = getCategoryDetails(investment.category);
  const profit = investment.currentValuation - investment.investedAmount;
  const roi = investment.investedAmount > 0 ? (profit / investment.investedAmount) * 100 : 0;
  const isPositive = profit >= 0;

  return (
    <div className="fintech-card p-6 flex flex-col justify-between space-y-5 relative group rounded-xl">
      {/* Top Bar: Category Pill & Edit Actions */}
      <div className="flex items-start justify-between">
        <span className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[11px] font-semibold tracking-wide ${catDetails.bg} ${catDetails.text} border border-slate-200/80 dark:border-slate-700/60`}>
          {getCategoryIconComponent(catDetails.icon)}
          <span>{catDetails.label}</span>
        </span>

        <div className="flex items-center space-x-1 opacity-80 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(investment)}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            title="Edit Investment Details"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(investment.id)}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
            title="Delete Investment Source"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Asset Name & Note */}
      <div className="space-y-1">
        <h4 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
          {investment.name}
        </h4>
        {investment.notes && (
          <p className="text-xs text-slate-600 dark:text-slate-400 font-medium line-clamp-1">
            {investment.notes}
          </p>
        )}
      </div>

      {/* Main Balances Grid */}
      <div className="bg-slate-100/90 dark:bg-[#12131A] rounded-xl p-4 border border-slate-200/80 dark:border-slate-800/80 grid grid-cols-2 gap-4">
        <div>
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            Current Value
          </span>
          <span className="text-xl font-extrabold text-slate-900 dark:text-white block mt-0.5 font-sans">
            {formatCurrency(investment.currentValuation)}
          </span>
        </div>
        <div>
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            Capital Invested
          </span>
          <span className="text-sm font-bold text-slate-700 dark:text-slate-300 block mt-1.5 font-sans">
            {formatCurrency(investment.investedAmount)}
          </span>
        </div>
      </div>

      {/* Growth Status Pill */}
      <div className="flex items-center justify-between text-xs pt-0.5">
        <span className="text-slate-600 dark:text-slate-400 font-semibold">Accumulated Growth</span>
        <div className="flex items-center space-x-1.5">
          <span className={`font-bold ${isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
            {isPositive ? '+' : ''}{formatCurrency(profit)}
          </span>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
            isPositive ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40' : 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400 border border-rose-200/60 dark:border-rose-800/40'
          }`}>
            {isPositive ? '+' : ''}{roi.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Quick Action Grid Toolbar */}
      <div className="grid grid-cols-4 gap-1.5 pt-1 border-t border-slate-100 dark:border-slate-800/80">
        <button
          onClick={() => onAction(investment, 'invest')}
          className="py-2 bg-slate-50 dark:bg-slate-900/60 hover:bg-slate-900 hover:text-white dark:hover:bg-purple-600 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center space-x-1 border border-slate-200/80 dark:border-slate-800/60"
          title="Deposit/Invest capital"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Invest</span>
        </button>
        <button
          onClick={() => onAction(investment, 'withdraw')}
          className="py-2 bg-slate-50 dark:bg-slate-900/60 hover:bg-slate-900 hover:text-white dark:hover:bg-purple-600 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center space-x-1 border border-slate-200/80 dark:border-slate-800/60"
          title="Withdraw funds"
        >
          <Minus className="w-3.5 h-3.5" />
          <span>Outflow</span>
        </button>
        <button
          onClick={() => onAction(investment, 'transfer')}
          className="py-2 bg-slate-50 dark:bg-slate-900/60 hover:bg-slate-900 hover:text-white dark:hover:bg-purple-600 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center space-x-1 border border-slate-200/80 dark:border-slate-800/60"
          title="Transfer funds to another source"
        >
          <ArrowRightLeft className="w-3.5 h-3.5" />
          <span>Transfer</span>
        </button>
        <button
          onClick={() => onAction(investment, 'revalue')}
          className="py-2 bg-slate-50 dark:bg-slate-900/60 hover:bg-slate-900 hover:text-white dark:hover:bg-purple-600 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center space-x-1 border border-slate-200/80 dark:border-slate-800/60"
          title="Update valuation balance"
        >
          <Scale className="w-3.5 h-3.5" />
          <span>Revalue</span>
        </button>
      </div>
    </div>
  );
}
