/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { InvestmentSource, LedgerTransaction, TransactionType } from '../types';
import {
  Search,
  Plus,
  Minus,
  ArrowRightLeft,
  Scale,
  Trash2,
  ListFilter,
  ArrowRight,
} from 'lucide-react';

interface LedgerTableProps {
  transactions: LedgerTransaction[];
  investments: InvestmentSource[];
  onDeleteTransaction: (id: string) => void;
  onClearAll?: () => void;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (isoStr: string) => {
  const date = new Date(isoStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const getTypeBadge = (type: TransactionType) => {
  switch (type) {
    case 'invest':
      return (
        <span className="inline-flex items-center space-x-1 text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60 px-2.5 py-0.5 rounded-full">
          <Plus className="w-3 h-3" />
          <span>Invest</span>
        </span>
      );
    case 'withdraw':
      return (
        <span className="inline-flex items-center space-x-1 text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200/60 px-2.5 py-0.5 rounded-full">
          <Minus className="w-3 h-3" />
          <span>Withdraw</span>
        </span>
      );
    case 'transfer':
      return (
        <span className="inline-flex items-center space-x-1 text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200/60 px-2.5 py-0.5 rounded-full">
          <ArrowRightLeft className="w-3 h-3" />
          <span>Transfer</span>
        </span>
      );
    case 'revalue':
      return (
        <span className="inline-flex items-center space-x-1 text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200/60 px-2.5 py-0.5 rounded-full">
          <Scale className="w-3 h-3" />
          <span>Revalue</span>
        </span>
      );
  }
};

export default function LedgerTable({
  transactions,
  investments,
  onDeleteTransaction,
  onClearAll,
}: LedgerTableProps) {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const invMap = new Map(investments.map((i) => [i.id, i.name]));

  const filtered = transactions.filter((tx) => {
    const matchesType = typeFilter === 'all' || tx.type === typeFilter;
    const sourceName = (invMap.get(tx.sourceId) || tx.sourceId).toLowerCase();
    const targetName = (tx.targetId ? invMap.get(tx.targetId) || tx.targetId : '').toLowerCase();
    const noteText = (tx.note || '').toLowerCase();
    const query = search.toLowerCase().trim();

    const matchesSearch =
      sourceName.includes(query) || targetName.includes(query) || noteText.includes(query);

    return matchesType && matchesSearch;
  });

  return (
    <div className="fintech-card p-6 space-y-5 text-left">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 tracking-tight">
            Transaction Activity Ledger ({filtered.length})
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Chronological audit trail of deposits, withdrawals, transfers, and valuation updates
          </p>
        </div>

        {/* Clear All button */}
        {transactions.length > 0 && onClearAll && (
          <button
            onClick={onClearAll}
            className="text-xs font-semibold text-slate-400 hover:text-rose-600 transition-colors cursor-pointer self-start sm:self-auto"
          >
            Clear History Log
          </button>
        )}
      </div>

      {/* Filter & Search Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search ledger entries by source, target, or note..."
            className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-slate-900 transition-all"
          />
        </div>

        {/* Type Filter dropdown */}
        <div className="flex items-center space-x-2 border border-slate-200 px-3 py-2 bg-slate-50 rounded-xl">
          <ListFilter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="text-xs font-semibold text-slate-700 bg-transparent focus:outline-hidden cursor-pointer"
          >
            <option value="all">All Types</option>
            <option value="invest">Investments (+)</option>
            <option value="withdraw">Withdrawals (-)</option>
            <option value="transfer">Transfers ($\rightarrow$)</option>
            <option value="revalue">Revaluations (=)</option>
          </select>
        </div>
      </div>

      {/* Table listing */}
      {filtered.length === 0 ? (
        <div className="py-12 border border-dashed border-slate-200 rounded-xl text-center text-xs text-slate-400 font-medium">
          No ledger activity matches your filter.
        </div>
      ) : (
        <div className="overflow-x-auto border border-slate-100 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200/80 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Investment Source</th>
                <th className="py-3 px-4 text-right">Amount ($)</th>
                <th className="py-3 px-4">Note / Memo</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {filtered.map((tx) => {
                const sourceName = invMap.get(tx.sourceId) || tx.sourceId;
                const targetName = tx.targetId ? invMap.get(tx.targetId) || tx.targetId : null;

                const isRevalue = tx.type === 'revalue';
                const delta = isRevalue && tx.newValuation !== undefined && tx.previousValuation !== undefined
                  ? tx.newValuation - tx.previousValuation
                  : tx.amount;

                return (
                  <tr key={tx.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500 font-medium">
                      {formatDate(tx.timestamp)}
                    </td>
                    <td className="py-3.5 px-4">{getTypeBadge(tx.type)}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {sourceName}
                      {targetName && (
                        <div className="text-[11px] text-slate-500 font-medium flex items-center space-x-1 mt-0.5">
                          <ArrowRight className="w-3 h-3 text-blue-500" />
                          <span>Transferred to: {targetName}</span>
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                      {isRevalue ? (
                        <span className={delta >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                          {delta >= 0 ? '+' : ''}{formatCurrency(delta)}
                        </span>
                      ) : (
                        <span>
                          {tx.type === 'withdraw' ? '-' : '+'}{formatCurrency(tx.amount)}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-medium max-w-xs truncate">
                      {tx.note || '-'}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => onDeleteTransaction(tx.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete transaction record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
