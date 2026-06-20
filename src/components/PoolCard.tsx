/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { InvestmentPool } from '../types';
import { CATEGORY_DETAILS } from '../data';
import {
  PiggyBank,
  TrendingUp,
  Coins,
  Home,
  Shield,
  Sparkles,
  FileText,
  HelpCircle,
  ArrowRightLeft,
  Plus,
  Minus,
  Edit2,
  Trash2,
  LineChart,
  Scale
} from 'lucide-react';

interface PoolCardProps {
  pool: InvestmentPool;
  onDeposit: (pool: InvestmentPool) => void;
  onWithdraw: (pool: InvestmentPool) => void;
  onTransfer: (pool: InvestmentPool) => void;
  onAdjustValuation: (pool: InvestmentPool) => void;
  onEdit: (pool: InvestmentPool) => void;
  onDelete: (pool: InvestmentPool) => void;
}

export const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'cash':
      return <PiggyBank className="w-4 h-4" />;
    case 'stocks':
      return <TrendingUp className="w-4 h-4" />;
    case 'crypto':
      return <Coins className="w-4 h-4" />;
    case 'real_estate':
      return <Home className="w-4 h-4" />;
    case 'retirement':
      return <Shield className="w-4 h-4" />;
    case 'precious_metals':
      return <Sparkles className="w-4 h-4" />;
    case 'bonds':
      return <FileText className="w-4 h-4" />;
    default:
      return <HelpCircle className="w-4 h-4" />;
  }
};

export default function PoolCard({
  pool,
  onDeposit,
  onWithdraw,
  onTransfer,
  onAdjustValuation,
  onEdit,
  onDelete,
}: PoolCardProps) {
  const catDetails = CATEGORY_DETAILS[pool.category];
  
  // Calculations
  const totalProfit = pool.currentValuation - pool.investedAmount;
  const roi = pool.investedAmount > 0 ? (totalProfit / pool.investedAmount) * 100 : 0;
  const isPositiveReturn = totalProfit >= 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.25 }}
      className="bg-white border border-[#DCDAD2] rounded-none hover:border-[#1A1A1A] transition-colors duration-300 flex flex-col justify-between overflow-hidden"
      id={`pool-card-${pool.id}`}
    >
      {/* Upper color accent bar */}
      <div 
        className="h-1 w-full" 
        style={{ backgroundColor: catDetails.color }}
      />
      
      {/* Pool Header Header */}
      <div className="p-6 flex-1">
        <div className="flex items-start justify-between">
          <div className="space-y-1 min-w-0">
            <span className="inline-flex items-center text-[9px] font-bold tracking-widest uppercase text-[#8C8C85] border border-[#DCDAD2] px-2 py-0.5 rounded-none bg-[#F9F8F6]">
              <span className="mr-1.5">{getCategoryIcon(pool.category)}</span>
              {catDetails.label}
            </span>
            <h4 className="text-xl font-serif text-[#1A1A1A] tracking-tight truncate mt-3 hover:text-[#8C8C85] transition-colors">
              {pool.name}
            </h4>
          </div>

          <div className="flex items-center space-x-1">
            <button
              onClick={() => onEdit(pool)}
              className="p-1.5 text-[#8C8C85] hover:text-[#1A1A1A] hover:bg-[#F9F8F6] rounded-none transition-colors border border-transparent hover:border-[#DCDAD2]"
              title="Edit Pool Info"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onDelete(pool)}
              className="p-1.5 text-[#8C8C85] hover:text-rose-750 hover:bg-rose-50/50 rounded-none transition-colors border border-transparent hover:border-rose-250"
              title="Delete Pool"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <p className="text-xs text-[#6B6B66] line-clamp-2 mt-2 leading-relaxed min-h-[32px] font-serif italic text-pretty">
          {pool.description || 'No description provided.'}
        </p>

        {/* Current status display values */}
        <div className="mt-5 grid grid-cols-2 gap-4 border-t border-b border-[#DCDAD2] py-4 my-4">
          <div>
            <span className="text-[9px] font-bold text-[#8C8C85] uppercase tracking-[0.15em] block">
              Current Valuation
            </span>
            <span className="text-xl font-serif text-[#1A1A1A] block mt-0.5">
              {formatCurrency(pool.currentValuation)}
            </span>
            {pool.investedAmount > 0 ? (
              <span className={`inline-flex items-center text-[10px] font-serif italic font-medium mt-1 ${
                isPositiveReturn ? 'text-emerald-700' : 'text-rose-700'
              }`}>
                {isPositiveReturn ? '+' : ''}{roi.toFixed(1)}% ({isPositiveReturn ? '+' : ''}{formatCurrency(totalProfit)})
              </span>
            ) : (
              <span className="text-[10px] text-[#8C8C85] font-medium block mt-1">No returns trackable</span>
            )}
          </div>

          <div>
            <span className="text-[9px] font-bold text-[#8C8C85] uppercase tracking-[0.15em] block">
              Invested Capital
            </span>
            <span className="text-xl font-serif text-[#6B6B66] block mt-0.5">
              {formatCurrency(pool.investedAmount)}
            </span>
            <span className="text-[9px] text-[#8C8C85] block mt-1">
              Net contributions
            </span>
          </div>
        </div>
      </div>

      {/* Primary Pool Operations */}
      <div className="bg-[#FDFDFD] border-t border-[#DCDAD2] px-4 py-4 flex flex-col gap-2">
        <div className="grid grid-cols-3 gap-1.5">
          {/* Deposit Trigger */}
          <button
            onClick={() => onDeposit(pool)}
            className="inline-flex items-center justify-center px-1.5 py-1.5 bg-white border border-[#DCDAD2] hover:border-[#1A1A1A] hover:bg-[#F9F8F6] text-[#1A1A1A] text-[10px] uppercase tracking-wider font-bold transition-all rounded-none cursor-pointer"
            title="Deposit"
          >
            <Plus className="w-3 h-3 mr-1 text-emerald-600" />
            Deposit
          </button>

          {/* Withdraw Trigger */}
          <button
            onClick={() => onWithdraw(pool)}
            className="inline-flex items-center justify-center px-1.5 py-1.5 bg-white border border-[#DCDAD2] hover:border-[#1A1A1A] hover:bg-[#F9F8F6] text-[#1A1A1A] text-[10px] uppercase tracking-wider font-bold transition-all rounded-none cursor-pointer"
            title="Withdraw"
          >
            <Minus className="w-3 h-3 mr-1 text-[#8C8C85]" />
            Withdraw
          </button>

          {/* Transfer Funds Trigger */}
          <button
            onClick={() => onTransfer(pool)}
            className="inline-flex items-center justify-center px-1.5 py-1.5 bg-white border border-[#DCDAD2] hover:border-[#1A1A1A] hover:bg-[#F9F8F6] text-[#1A1A1A] text-[10px] uppercase tracking-wider font-bold transition-all rounded-none cursor-pointer"
            title="Transfer Funds"
          >
            <ArrowRightLeft className="w-3 h-3 mr-1 text-blue-500" />
            Transfer
          </button>
        </div>

        {/* Update Valuation Status (Net amount manual tracker override) */}
        <button
          onClick={() => onAdjustValuation(pool)}
          className="w-full inline-flex items-center justify-center px-3 py-2.5 bg-[#1A1A1A] hover:bg-[#3E3E39] text-[#F9F8F6] text-[10px] uppercase tracking-widest font-bold transition-all rounded-none cursor-pointer"
          title="Adjust Valuation Status"
        >
          <Scale className="w-3.5 h-3.5 mr-2 text-[#DCDAD2]" />
          Update Valuation
        </button>
      </div>
    </motion.div>
  );
}
