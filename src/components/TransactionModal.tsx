/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { InvestmentSource, TransactionType } from '../types';
import { X, Plus, Minus, ArrowRightLeft, Scale } from 'lucide-react';

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
      const parsedAmt = parseFloat(amount);
      if (isNaN(parsedAmt) || parsedAmt <= 0) {
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
    <div className="fixed inset-0 bg-[#1A1A1A]/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white border border-[#DCDAD2] w-full max-w-lg rounded-none shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-[#DCDAD2] flex items-center justify-between bg-[#F9F8F6]">
          <h3 className="font-serif text-base font-bold text-[#1A1A1A]">
            Execute Ledger Transaction
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-[#8C8C85] hover:text-[#1A1A1A] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="grid grid-cols-4 border-b border-[#DCDAD2] bg-white">
          <button
            type="button"
            onClick={() => { setType('invest'); setError(''); }}
            className={`py-3 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center space-x-1 border-b-2 ${
              type === 'invest'
                ? 'border-[#1A1A1A] text-[#1A1A1A] bg-[#F9F8F6]'
                : 'border-transparent text-[#8C8C85] hover:text-[#1A1A1A]'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Invest</span>
          </button>
          <button
            type="button"
            onClick={() => { setType('withdraw'); setError(''); }}
            className={`py-3 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center space-x-1 border-b-2 ${
              type === 'withdraw'
                ? 'border-[#1A1A1A] text-[#1A1A1A] bg-[#F9F8F6]'
                : 'border-transparent text-[#8C8C85] hover:text-[#1A1A1A]'
            }`}
          >
            <Minus className="w-3.5 h-3.5" />
            <span>Outflow</span>
          </button>
          <button
            type="button"
            onClick={() => { setType('transfer'); setError(''); }}
            className={`py-3 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center space-x-1 border-b-2 ${
              type === 'transfer'
                ? 'border-[#1A1A1A] text-[#1A1A1A] bg-[#F9F8F6]'
                : 'border-transparent text-[#8C8C85] hover:text-[#1A1A1A]'
            }`}
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>Transfer</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setType('revalue');
              setError('');
              if (currentSource) setNewValuation(currentSource.currentValuation.toString());
            }}
            className={`py-3 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center space-x-1 border-b-2 ${
              type === 'revalue'
                ? 'border-[#1A1A1A] text-[#1A1A1A] bg-[#F9F8F6]'
                : 'border-transparent text-[#8C8C85] hover:text-[#1A1A1A]'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>Revalue</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-left">
          {error && (
            <div className="p-3 bg-[#FFF0F0] border border-rose-200 text-rose-800 text-xs font-serif italic">
              {error}
            </div>
          )}

          {/* Primary Source */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-[#1A1A1A] uppercase tracking-wider block">
              {type === 'transfer' ? 'Source Investment (Outflow)' : 'Investment Source'}{' '}
              <span className="text-rose-700">*</span>
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
              className="w-full px-3 py-2 bg-white border border-[#DCDAD2] text-xs focus:outline-hidden focus:border-[#1A1A1A] text-[#1A1A1A] cursor-pointer"
            >
              {investments.map((inv) => (
                <option key={inv.id} value={inv.id}>
                  {inv.name} ({formatCurrency(inv.currentValuation)})
                </option>
              ))}
            </select>
          </div>

          {/* Target Source (For Transfer) */}
          {type === 'transfer' && (
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[#1A1A1A] uppercase tracking-wider block">
                Target Investment (Inflow) <span className="text-rose-700">*</span>
              </label>
              <select
                value={targetId}
                onChange={(e) => setTargetId(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#DCDAD2] text-xs focus:outline-hidden focus:border-[#1A1A1A] text-[#1A1A1A] cursor-pointer"
              >
                {investments.map((inv) => (
                  <option key={inv.id} value={inv.id} disabled={inv.id === sourceId}>
                    {inv.name} {inv.id === sourceId ? '(Selected Source)' : `(${formatCurrency(inv.currentValuation)})`}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Amount field (For Invest, Withdraw, Transfer) */}
          {type !== 'revalue' ? (
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[#1A1A1A] uppercase tracking-wider block">
                Transaction Amount ($) <span className="text-rose-700">*</span>
              </label>
              <input
                type="number"
                step="any"
                min="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full px-3 py-2.5 bg-white border border-[#DCDAD2] text-sm font-serif focus:outline-hidden focus:border-[#1A1A1A] text-[#1A1A1A]"
                required
              />
            </div>
          ) : (
            /* Valuation Override field (For Revalue) */
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[#1A1A1A] uppercase tracking-wider block">
                New Ending Valuation ($) <span className="text-rose-700">*</span>
              </label>
              <input
                type="number"
                step="any"
                min="0"
                value={newValuation}
                onChange={(e) => setNewValuation(e.target.value)}
                placeholder="Current Valuation Balance"
                className="w-full px-3 py-2.5 bg-white border border-[#DCDAD2] text-sm font-serif focus:outline-hidden focus:border-[#1A1A1A] text-[#1A1A1A]"
                required
              />
              {currentSource && (
                <p className="text-[10px] text-[#8C8C85] font-serif italic">
                  Previous valuation was {formatCurrency(currentSource.currentValuation)}
                </p>
              )}
            </div>
          )}

          {/* Note / Memo */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-[#1A1A1A] uppercase tracking-wider block">
              Transaction Note / Memo
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Monthly allocation, profit reinvestment..."
              className="w-full px-3 py-2 bg-white border border-[#DCDAD2] text-xs font-serif focus:outline-hidden focus:border-[#1A1A1A] text-[#1A1A1A]"
            />
          </div>

          {/* Buttons */}
          <div className="pt-4 flex justify-end space-x-2 border-t border-[#F1EFEA]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-[#DCDAD2] bg-white text-[#8C8C85] hover:text-[#1A1A1A] text-[10px] font-bold uppercase tracking-wider cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#1A1A1A] hover:bg-[#3E3E39] text-white text-[10px] font-bold uppercase tracking-wider cursor-pointer"
            >
              Submit Transaction
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
