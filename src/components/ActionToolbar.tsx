/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { TransactionType } from '../types';
import { Plus, Minus, ArrowRightLeft, Scale, Layers } from 'lucide-react';

interface ActionToolbarProps {
  onOpenTransaction: (type: TransactionType) => void;
  onOpenNewSource: () => void;
  disabled?: boolean;
  activeCategoryLabel?: string;
}

export default function ActionToolbar({
  onOpenTransaction,
  onOpenNewSource,
  disabled = false,
  activeCategoryLabel = 'All Sources',
}: ActionToolbarProps) {
  return (
    <div className="fintech-card p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3" id="action-toolbar">
      {/* Left: Add Source & Active Category Pill */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onOpenNewSource}
          className="px-4 py-2 bg-slate-900 dark:bg-purple-600 hover:bg-slate-800 dark:hover:bg-purple-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-purple-600/20 transition-all flex items-center justify-center space-x-1.5 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Source</span>
        </button>

        {activeCategoryLabel && (
          <div className="hidden sm:flex items-center space-x-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-800/60">
            <span className="text-[10px] uppercase font-bold text-slate-400">Category:</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">{activeCategoryLabel}</span>
          </div>
        )}
      </div>

      {/* Quick Action Buttons Toolbar */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
        <button
          onClick={() => onOpenTransaction('invest')}
          disabled={disabled}
          className="px-3.5 py-2 bg-slate-100 dark:bg-slate-900/90 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center space-x-1.5 border border-slate-200/80 dark:border-slate-800/80 disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
          title="Deposit Capital"
        >
          <Plus className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Invest</span>
        </button>

        <button
          onClick={() => onOpenTransaction('transfer')}
          disabled={disabled}
          className="px-3.5 py-2 bg-slate-100 dark:bg-slate-900/90 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center space-x-1.5 border border-slate-200/80 dark:border-slate-800/80 disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
          title="Transfer Funds"
        >
          <ArrowRightLeft className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span>Transfer</span>
        </button>

        <button
          onClick={() => onOpenTransaction('withdraw')}
          disabled={disabled}
          className="px-3.5 py-2 bg-slate-100 dark:bg-slate-900/90 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center space-x-1.5 border border-slate-200/80 dark:border-slate-800/80 disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
          title="Withdraw Funds"
        >
          <Minus className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
          <span>Outflow</span>
        </button>

        <button
          onClick={() => onOpenTransaction('revalue')}
          disabled={disabled}
          className="px-3.5 py-2 bg-slate-100 dark:bg-slate-900/90 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center space-x-1.5 border border-slate-200/80 dark:border-slate-800/80 disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
          title="Revalue Balance"
        >
          <Scale className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          <span>Revalue</span>
        </button>
      </div>
    </div>
  );
}
