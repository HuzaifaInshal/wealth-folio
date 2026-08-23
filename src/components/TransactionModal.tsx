/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { InvestmentSource, TransactionType } from '../types';
import { X, Plus, Minus, ArrowRightLeft, Scale, ArrowRight, ShieldAlert } from 'lucide-react';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialType: TransactionType;
  initialSource: InvestmentSource | null;
  investments: InvestmentSource[];
  onSubmit: (data: {
    type: TransactionType;
    sourceId: string;
    targetId?: string;
    amount: number;
    newValuation?: number;
    note: string;
  }) => void;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function TransactionModal({
  isOpen,
  onClose,
  initialType,
  initialSource,
  investments,
  onSubmit,
}: TransactionModalProps) {
  const [type, setType] = useState<TransactionType>(initialType);
  const [sourceId, setSourceId] = useState('');
  const [targetId, setTargetId] = useState('');
  const [amount, setAmount] = useState('');
  const [newValuation, setNewValuation] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setType(initialType);
    if (initialSource) {
      setSourceId(initialSource.id);
      if (initialType === 'revalue') {
        setNewValuation(initialSource.currentValuation.toString());
      } else {
        setNewValuation('');
      }
    } else if (investments.length > 0) {
      setSourceId(investments[0].id);
      setNewValuation('');
    }
    const other = investments.find((i) => i.id !== (initialSource?.id || investments[0]?.id));
    setTargetId(other ? other.id : '');
    setAmount('');
    setNote('');
    setError('');
  }, [isOpen, initialType, initialSource, investments]);

  if (!isOpen) return null;

  const currentSource = investments.find((i) => i.id === sourceId);
  const parsedAmt = parseFloat(amount) || 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!sourceId) {
      setError('Please select an investment source.');
      return;
    }

    if (type === 'transfer') {
      if (!targetId) {
        setError('Please select a target investment source.');
        return;
      }
      if (sourceId === targetId) {
        setError('Source and target investment cannot be identical.');
        return;
      }
    }

    if (type === 'revalue') {
      const parsedVal = parseFloat(newValuation);
      if (isNaN(parsedVal) || parsedVal < 0) {
        setError('Please enter a valid ending valuation balance.');
        return;
      }
      onSubmit({
        type: 'revalue',
        sourceId,
        amount: 0,
        newValuation: parsedVal,
        note: note.trim() || 'Updated current market valuation balance',
      });
    } else {
      if (parsedAmt <= 0) {
        setError('Please enter a valid positive amount.');
        return;
      }

      if ((type === 'withdraw' || type === 'transfer') && currentSource && currentSource.currentValuation < parsedAmt) {
        setError(`Insufficient funds in ${currentSource.name}. Available is ${formatCurrency(currentSource.currentValuation)}.`);
        return;
      }

      onSubmit({
        type,
        sourceId,
        targetId: type === 'transfer' ? targetId : undefined,
        amount: parsedAmt,
        note: note.trim() || `${type === 'invest' ? 'Capital deposit' : type === 'withdraw' ? 'Cash withdrawal' : 'Internal transfer'}`,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-sans">
      <div className="bg-white dark:bg-[#181924] border border-slate-200 dark:border-slate-800/80 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between bg-slate-50/50 dark:bg-[#12131A]/50">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Execute Ledger Transaction
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Segmented Tab Selector */}
        <div className="p-2 bg-slate-100/70 dark:bg-[#12131A] border-b border-slate-200/80 dark:border-slate-800/80 grid grid-cols-4 gap-1">
          <button
            type="button"
            onClick={() => { setType('invest'); setError(''); }}
            className={`py-2 px-1 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-center space-x-1 ${
              type === 'invest'
                ? 'bg-white dark:bg-[#181924] text-slate-900 dark:text-white shadow-xs font-bold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            <Plus className="w-3.5 h-3.5 text-emerald-500" />
            <span>Invest</span>
          </button>
          <button
            type="button"
            onClick={() => { setType('withdraw'); setError(''); }}
            className={`py-2 px-1 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-center space-x-1 ${
              type === 'withdraw'
                ? 'bg-white dark:bg-[#181924] text-slate-900 dark:text-white shadow-xs font-bold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            <Minus className="w-3.5 h-3.5 text-rose-500" />
            <span>Outflow</span>
          </button>
          <button
            type="button"
            onClick={() => { setType('transfer'); setError(''); }}
            className={`py-2 px-1 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-center space-x-1 ${
              type === 'transfer'
                ? 'bg-white dark:bg-[#181924] text-slate-900 dark:text-white shadow-xs font-bold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            <ArrowRightLeft className="w-3.5 h-3.5 text-blue-500" />
            <span>Transfer</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setType('revalue');
              setError('');
              if (currentSource) setNewValuation(currentSource.currentValuation.toString());
            }}
            className={`py-2 px-1 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-center space-x-1 ${
              type === 'revalue'
                ? 'bg-white dark:bg-[#181924] text-slate-900 dark:text-white shadow-xs font-bold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            <Scale className="w-3.5 h-3.5 text-amber-500" />
            <span>Revalue</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-left">
          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/60 text-rose-800 dark:text-rose-400 text-xs font-semibold rounded-2xl flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Primary Source */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
              {type === 'transfer' ? 'Source Investment (Outflow)' : 'Investment Source'}{' '}
              <span className="text-rose-500">*</span>
            </label>
            <select
              value={sourceId}
              onChange={(e) => {
                const id = e.target.value;
                setSourceId(id);
                const s = investments.find((i) => i.id === id);
                if (type === 'revalue' && s) {
                  setNewValuation(s.currentValuation.toString());
                }
              }}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#12131A] border border-slate-200 dark:border-slate-800/80 rounded-2xl text-xs text-slate-900 dark:text-white font-medium focus:outline-hidden focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-slate-900 dark:focus:ring-purple-500 transition-all cursor-pointer"
            >
              {investments.map((inv) => (
                <option key={inv.id} value={inv.id} className="dark:bg-[#181924]">
                  {inv.name} ({formatCurrency(inv.currentValuation)})
                </option>
              ))}
            </select>
          </div>

          {/* Target Source (For Transfer) */}
          {type === 'transfer' && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                Target Investment (Inflow) <span className="text-rose-500">*</span>
              </label>
              <select
                value={targetId}
                onChange={(e) => setTargetId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#12131A] border border-slate-200 dark:border-slate-800/80 rounded-2xl text-xs text-slate-900 dark:text-white font-medium focus:outline-hidden focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-slate-900 dark:focus:ring-purple-500 transition-all cursor-pointer"
              >
                {investments.map((inv) => (
                  <option key={inv.id} value={inv.id} disabled={inv.id === sourceId} className="dark:bg-[#181924]">
                    {inv.name} {inv.id === sourceId ? '(Selected Source)' : `(${formatCurrency(inv.currentValuation)})`}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Amount field (For Invest, Withdraw, Transfer) */}
          {type !== 'revalue' ? (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                Transaction Amount ($) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                step="any"
                min="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#12131A] border border-slate-200 dark:border-slate-800/80 rounded-2xl text-sm font-bold focus:outline-hidden focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-slate-900 dark:focus:ring-purple-500 transition-all text-slate-900 dark:text-white"
                required
              />
            </div>
          ) : (
            /* Valuation Override field (For Revalue) */
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                New Ending Valuation ($) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                step="any"
                min="0"
                value={newValuation}
                onChange={(e) => setNewValuation(e.target.value)}
                placeholder="Current Valuation Balance"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#12131A] border border-slate-200 dark:border-slate-800/80 rounded-2xl text-sm font-bold focus:outline-hidden focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-slate-900 dark:focus:ring-purple-500 transition-all text-slate-900 dark:text-white"
                required
              />
            </div>
          )}

          {/* Live Calculation Preview Pill */}
          {currentSource && (
            <div className="p-3 bg-slate-50 dark:bg-[#12131A] rounded-2xl border border-slate-200/70 dark:border-slate-800/80 text-xs flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Balance Preview:</span>
              <div className="flex items-center space-x-2 font-mono text-xs font-semibold">
                <span className="text-slate-500 dark:text-slate-400">{formatCurrency(currentSource.currentValuation)}</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-900 dark:text-white font-bold">
                  {type === 'invest'
                    ? formatCurrency(currentSource.currentValuation + parsedAmt)
                    : type === 'withdraw' || type === 'transfer'
                    ? formatCurrency(Math.max(0, currentSource.currentValuation - parsedAmt))
                    : formatCurrency(parseFloat(newValuation) || currentSource.currentValuation)}
                </span>
              </div>
            </div>
          )}

          {/* Note / Memo */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
              Transaction Note / Memo
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Monthly allocation, dividend reinvestment..."
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#12131A] border border-slate-200 dark:border-slate-800/80 rounded-2xl text-xs text-slate-900 dark:text-white font-medium focus:outline-hidden focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-slate-900 dark:focus:ring-purple-500 transition-all"
            />
          </div>

          {/* Buttons */}
          <div className="pt-4 flex justify-end space-x-2 border-t border-slate-100 dark:border-slate-800/80">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl text-xs font-semibold cursor-pointer transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-slate-900 dark:bg-purple-600 hover:bg-slate-800 dark:hover:bg-purple-500 text-white rounded-xl text-xs font-semibold cursor-pointer transition-all shadow-md shadow-purple-600/20"
            >
              Submit Transaction
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
