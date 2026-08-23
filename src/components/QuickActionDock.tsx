/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { TransactionType } from '../types';
import { Plus, Minus, ArrowRightLeft, Scale, Layers } from 'lucide-react';

interface QuickActionDockProps {
  onOpenTransaction: (type: TransactionType) => void;
  onOpenNewSource: () => void;
  disabled?: boolean;
}

export default function QuickActionDock({
  onOpenTransaction,
  onOpenNewSource,
  disabled = false,
}: QuickActionDockProps) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 max-w-xl w-[92%] sm:w-auto">
      <div className="bg-white/95 dark:bg-[#181924]/90 text-slate-900 dark:text-white backdrop-blur-xl border border-slate-200/90 dark:border-purple-500/30 p-2 rounded-2xl shadow-xl flex items-center justify-between sm:justify-center gap-1.5 sm:gap-3 px-3 sm:px-4">
        {/* New Source */}
        <button
          onClick={onOpenNewSource}
          className="px-3.5 py-2 bg-slate-900 dark:bg-purple-600 hover:bg-slate-800 dark:hover:bg-purple-500 text-white rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer flex items-center space-x-1.5 shadow-md shadow-purple-600/20 whitespace-nowrap"
        >
          <Layers className="w-4 h-4" />
          <span className="hidden sm:inline">+ Add Source</span>
        </button>

        <div className="w-px h-6 bg-slate-200 dark:bg-slate-700/80 mx-0.5 hidden sm:block" />

        {/* Action Buttons */}
        <button
          onClick={() => onOpenTransaction('invest')}
          disabled={disabled}
          className="px-2.5 sm:px-3.5 py-2 bg-slate-100 dark:bg-slate-900/90 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center space-x-1.5 border border-slate-200/80 dark:border-slate-800/80 disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
          title="Deposit Capital"
        >
          <Plus className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Invest</span>
        </button>

        <button
          onClick={() => onOpenTransaction('transfer')}
          disabled={disabled}
          className="px-2.5 sm:px-3.5 py-2 bg-slate-100 dark:bg-slate-900/90 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center space-x-1.5 border border-slate-200/80 dark:border-slate-800/80 disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
          title="Transfer Funds"
        >
          <ArrowRightLeft className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span>Transfer</span>
        </button>

        <button
          onClick={() => onOpenTransaction('withdraw')}
          disabled={disabled}
          className="px-2.5 sm:px-3.5 py-2 bg-slate-100 dark:bg-slate-900/90 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center space-x-1.5 border border-slate-200/80 dark:border-slate-800/80 disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
          title="Withdraw Funds"
        >
          <Minus className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
          <span className="hidden sm:inline">Withdraw</span>
        </button>

        <button
          onClick={() => onOpenTransaction('revalue')}
          disabled={disabled}
          className="px-2.5 sm:px-3.5 py-2 bg-slate-100 dark:bg-slate-900/90 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center space-x-1.5 border border-slate-200/80 dark:border-slate-800/80 disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
          title="Revalue Balance"
        >
          <Scale className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          <span className="hidden sm:inline">Revalue</span>
        </button>
      </div>
    </div>
  );
}
