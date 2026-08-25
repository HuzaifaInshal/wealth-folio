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
  FileSpreadsheet,
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
        <span className="inline-flex items-center space-x-1 text-[9px] font-bold uppercase tracking-widest bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5">
          <Plus className="w-2.5 h-2.5" />
          <span>Invest</span>
        </span>
      );
    case 'withdraw':
      return (
        <span className="inline-flex items-center space-x-1 text-[9px] font-bold uppercase tracking-widest bg-rose-50 text-rose-800 border border-rose-200 px-2 py-0.5">
          <Minus className="w-2.5 h-2.5" />
          <span>Withdraw</span>
        </span>
      );
    case 'transfer':
      return (
        <span className="inline-flex items-center space-x-1 text-[9px] font-bold uppercase tracking-widest bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5">
          <ArrowRightLeft className="w-2.5 h-2.5" />
          <span>Transfer</span>
        </span>
      );
    case 'revalue':
      return (
        <span className="inline-flex items-center space-x-1 text-[9px] font-bold uppercase tracking-widest bg-slate-100 text-slate-800 border border-slate-300 px-2 py-0.5">
          <Scale className="w-2.5 h-2.5" />
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
    <div className="bg-white border border-[#DCDAD2] rounded-none p-6 space-y-4 text-left">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#DCDAD2] pb-4">
        <div>
          <h3 className="font-serif text-lg font-bold text-[#1A1A1A]">
            Transaction Ledger ({filtered.length})
          </h3>
          <p className="text-xs text-[#8C8C85] font-serif italic mt-0.5">
            Chronological record of deposits, withdrawals, transfers, and valuation adjustments
          </p>
        </div>

        {/* Clear All button */}
        {transactions.length > 0 && onClearAll && (
          <button
            onClick={onClearAll}
            className="text-[10px] uppercase tracking-wider font-bold text-[#8C8C85] hover:text-rose-700 transition-colors cursor-pointer self-start sm:self-auto"
          >
            Clear Ledger Log
          </button>
        )}
      </div>

      {/* Filter & Search Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-[#8C8C85] absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search transaction log by source, target, or note..."
            className="w-full pl-9 pr-3 py-2 bg-[#F9F8F6] border border-[#DCDAD2] text-xs focus:outline-hidden focus:bg-white focus:border-[#1A1A1A] text-[#1A1A1A]"
          />
        </div>

        {/* Type Filter dropdown */}
        <div className="flex items-center space-x-1.5 border border-[#DCDAD2] px-2 py-1.5 bg-white">
          <ListFilter className="w-3.5 h-3.5 text-[#8C8C85]" />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="text-[10px] font-bold uppercase tracking-wider text-[#1A1A1A] bg-transparent focus:outline-hidden cursor-pointer"
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
        <div className="py-12 border border-dashed border-[#DCDAD2] text-center text-xs text-[#8C8C85] font-serif italic">
          No transaction entries found.
        </div>
      ) : (
        <div className="overflow-x-auto border border-[#DCDAD2]">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F9F8F6] border-b border-[#DCDAD2] text-[9px] font-bold uppercase tracking-wider text-[#8C8C85]">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Investment Source</th>
                <th className="py-3 px-4 text-right">Amount ($)</th>
                <th className="py-3 px-4">Note / Memo</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1EFEA]">
              {filtered.map((tx) => {
                const sourceName = invMap.get(tx.sourceId) || tx.sourceId;
                const targetName = tx.targetId ? invMap.get(tx.targetId) || tx.targetId : null;

                const isRevalue = tx.type === 'revalue';
                const delta = isRevalue && tx.newValuation !== undefined && tx.previousValuation !== undefined
                  ? tx.newValuation - tx.previousValuation
                  : tx.amount;

                return (
                  <tr key={tx.id} className="hover:bg-[#F9F8F6]/60 transition-colors">
                    <td className="py-3 px-4 font-mono text-[11px] text-[#8C8C85]">
                      {formatDate(tx.timestamp)}
                    </td>
                    <td className="py-3 px-4">{getTypeBadge(tx.type)}</td>
                    <td className="py-3 px-4 font-semibold text-[#1A1A1A]">
                      {sourceName}
                      {targetName && (
                        <span className="text-[10px] text-[#8C8C85] block font-serif italic">
                          $\rightarrow$ Transferred to: {targetName}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right font-serif font-bold text-[#1A1A1A]">
                      {isRevalue ? (
                        <span className={delta >= 0 ? 'text-emerald-700' : 'text-rose-700'}>
                          {delta >= 0 ? '+' : ''}{formatCurrency(delta)}
                        </span>
                      ) : (
                        <span>
                          {tx.type === 'withdraw' ? '-' : '+'}{formatCurrency(tx.amount)}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-[#6B6B66] font-serif italic max-w-xs truncate">
                      {tx.note || '-'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => onDeleteTransaction(tx.id)}
                        className="p-1 text-[#8C8C85] hover:text-rose-700 transition-colors cursor-pointer"
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
