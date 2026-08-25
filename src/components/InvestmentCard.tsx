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
  Settings,
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
    <div className="bg-white border border-[#DCDAD2] hover:border-[#1A1A1A] rounded-none p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4">
      {/* Top Header */}
      <div className="space-y-2">
        <div className="flex items-start justify-between">
          <span className={`inline-flex items-center space-x-1 text-[9px] font-bold tracking-widest uppercase border border-[#DCDAD2] px-2 py-0.5 ${catDetails.bg} ${catDetails.text}`}>
            {getCategoryIconComponent(catDetails.icon)}
            <span>{catDetails.label}</span>
          </span>

          <div className="flex items-center space-x-1">
            <button
              onClick={() => onEdit(investment)}
              className="p-1 text-[#8C8C85] hover:text-[#1A1A1A] hover:bg-[#F9F8F6] border border-transparent hover:border-[#DCDAD2] transition-colors cursor-pointer"
              title="Edit investment source details"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onDelete(investment.id)}
              className="p-1 text-[#8C8C85] hover:text-rose-700 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors cursor-pointer"
              title="Delete investment source"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <h4 className="text-lg font-serif font-bold text-[#1A1A1A] tracking-tight truncate">
          {investment.name}
        </h4>

        {investment.notes && (
          <p className="text-xs text-[#6B6B66] font-serif italic line-clamp-1">
            &ldquo;{investment.notes}&rdquo;
          </p>
        )}
      </div>

      {/* Main Stats Grid */}
      <div className="border-t border-b border-[#F1EFEA] py-3 grid grid-cols-2 gap-3">
        <div>
          <span className="text-[9px] font-bold text-[#8C8C85] uppercase tracking-wider block">
            Current Valuation
          </span>
          <span className="text-lg font-serif font-bold text-[#1A1A1A] block mt-0.5">
            {formatCurrency(investment.currentValuation)}
          </span>
        </div>
        <div>
          <span className="text-[9px] font-bold text-[#8C8C85] uppercase tracking-wider block">
            Net Invested Capital
          </span>
          <span className="text-sm font-serif text-[#6B6B66] block mt-1">
            {formatCurrency(investment.investedAmount)}
          </span>
        </div>
      </div>

      {/* Gain / Loss Pill */}
      <div className="flex items-center justify-between text-xs pt-0.5">
        <span className="text-[10px] text-[#8C8C85] uppercase font-bold tracking-wider">
          Total Growth
        </span>
        <div className="flex items-center space-x-1 font-serif">
          <span className={`font-bold ${isPositive ? 'text-emerald-700' : 'text-rose-700'}`}>
            {isPositive ? '+' : ''}{formatCurrency(profit)}
          </span>
          <span className={`text-[10px] font-mono px-1.5 py-0.5 font-bold ${
            isPositive ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'
          }`}>
            {isPositive ? '+' : ''}{roi.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Quick Action Toolbar */}
      <div className="grid grid-cols-4 gap-1.5 pt-1">
        <button
          onClick={() => onAction(investment, 'invest')}
          className="px-2 py-1.5 bg-[#F9F8F6] hover:bg-[#1A1A1A] hover:text-white text-[#1A1A1A] border border-[#DCDAD2] text-[9px] uppercase tracking-wider font-bold transition-all cursor-pointer flex items-center justify-center space-x-1"
          title="Deposit/Invest capital"
        >
          <Plus className="w-3 h-3" />
          <span>Invest</span>
        </button>
        <button
          onClick={() => onAction(investment, 'withdraw')}
          className="px-2 py-1.5 bg-[#F9F8F6] hover:bg-[#1A1A1A] hover:text-white text-[#1A1A1A] border border-[#DCDAD2] text-[9px] uppercase tracking-wider font-bold transition-all cursor-pointer flex items-center justify-center space-x-1"
          title="Withdraw funds"
        >
          <Minus className="w-3 h-3" />
          <span>Outflow</span>
        </button>
        <button
          onClick={() => onAction(investment, 'transfer')}
          className="px-2 py-1.5 bg-[#F9F8F6] hover:bg-[#1A1A1A] hover:text-white text-[#1A1A1A] border border-[#DCDAD2] text-[9px] uppercase tracking-wider font-bold transition-all cursor-pointer flex items-center justify-center space-x-1"
          title="Transfer funds to another source"
        >
          <ArrowRightLeft className="w-3 h-3" />
          <span>Transfer</span>
        </button>
        <button
          onClick={() => onAction(investment, 'revalue')}
          className="px-2 py-1.5 bg-[#F9F8F6] hover:bg-[#1A1A1A] hover:text-white text-[#1A1A1A] border border-[#DCDAD2] text-[9px] uppercase tracking-wider font-bold transition-all cursor-pointer flex items-center justify-center space-x-1"
          title="Update valuation balance"
        >
          <Scale className="w-3 h-3" />
          <span>Value</span>
        </button>
      </div>
    </div>
  );
}
