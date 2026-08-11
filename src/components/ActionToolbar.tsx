/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { TransactionType } from '../types';
import { Plus, Minus, ArrowRightLeft, Scale, Layers } from 'lucide-react';

interface ActionToolbarProps {
  onOpenTransaction: (type: TransactionType) => void;
  disabled?: boolean;
}

export default function ActionToolbar({
  onOpenTransaction,
  disabled = false,
}: ActionToolbarProps) {
  return (
    <div className="fintech-card p-4 flex items-center justify-between sm:justify-start gap-3" id="action-toolbar">
      {/* Quick Action Buttons Toolbar */}
      <div className="flex items-center space-x-2 overflow-x-auto py-0.5 scrollbar-none w-full">
        <button
          onClick={() => onOpenTransaction('invest')}
          disabled={disabled}
          className="px-3.5 py-2 bg-slate-100 dark:bg-slate-900/90 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center space-x-1.5 border border-slate-200/80 dark:border-slate-800/80 disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
          title="Deposit Capital"
        >
          <Plus className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Invest</span>
        </button>

        <button
          onClick={() => onOpenTransaction('transfer')}
          disabled={disabled}
          className="px-3.5 py-2 bg-slate-100 dark:bg-slate-900/90 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center space-x-1.5 border border-slate-200/80 dark:border-slate-800/80 disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
          title="Transfer Funds"
        >
          <ArrowRightLeft className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span>Transfer</span>
        </button>

        <button
          onClick={() => onOpenTransaction('withdraw')}
          disabled={disabled}
          className="px-3.5 py-2 bg-slate-100 dark:bg-slate-900/90 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center space-x-1.5 border border-slate-200/80 dark:border-slate-800/80 disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
          title="Withdraw Funds"
        >
          <Minus className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
          <span>Outflow</span>
        </button>

        <button
          onClick={() => onOpenTransaction('revalue')}
          disabled={disabled}
          className="px-3.5 py-2 bg-slate-100 dark:bg-slate-900/90 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center space-x-1.5 border border-slate-200/80 dark:border-slate-800/80 disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
          title="Revalue Balance"
        >
          <Scale className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          <span>Revalue</span>
        </button>
      </div>
    </div>
  );
}
