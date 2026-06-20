/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { InvestmentPool, TransactionType } from '../types';
import { X, ArrowRight, DollarSign, ArrowRightLeft, Percent, Scale, TrendingUp } from 'lucide-react';

interface TransactionModalProps {
  isOpen: boolean;
  pools: InvestmentPool[];
  initialPool: InvestmentPool | null;
  initialTab: 'deposit' | 'withdrawal' | 'transfer' | 'valuation_adjustment';
  onClose: () => void;
  onSubmit: (txData: {
    type: TransactionType;
    poolId: string;
    sourcePoolId?: string;
    destinationPoolId?: string;
    amount: number;
    newValuation?: number;
    note: string;
  }) => void;
}

export default function TransactionModal({
  isOpen,
  pools,
  initialPool,
  initialTab,
  onClose,
  onSubmit,
}: TransactionModalProps) {
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdrawal' | 'transfer' | 'valuation_adjustment'>('deposit');
  
  // Fields
  const [poolId, setPoolId] = useState('');
  const [sourcePoolId, setSourcePoolId] = useState('');
  const [destinationPoolId, setDestinationPoolId] = useState('');
  const [amount, setAmount] = useState('');
  const [newValuation, setNewValuation] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  // Sync state with props when modal opens/changes
  useEffect(() => {
    setActiveTab(initialTab);
    setError('');
    setAmount('');
    setNote('');
    
    // Choose pre-selected pools
    if (initialPool) {
      if (initialTab === 'transfer') {
        setSourcePoolId(initialPool.id);
        const otherPool = pools.find((p) => p.id !== initialPool.id);
        setDestinationPoolId(otherPool ? otherPool.id : '');
      } else {
        setPoolId(initialPool.id);
        setNewValuation(initialPool.currentValuation.toString());
      }
    } else {
      if (pools.length > 0) {
        setPoolId(pools[0].id);
        setSourcePoolId(pools[0].id);
        const secondPool = pools.find((p) => p.id !== pools[0].id);
        setDestinationPoolId(secondPool ? secondPool.id : '');
        setNewValuation(pools[0].currentValuation.toString());
      }
    }
  }, [isOpen, initialPool, initialTab]);

  // Handle active pool change (re-populate valuation input)
  const handlePoolChange = (id: string) => {
    setPoolId(id);
    const pool = pools.find((p) => p.id === id);
    if (pool) {
      setNewValuation(pool.currentValuation.toString());
    }
  };

  const handleSourcePoolChange = (id: string) => {
    setSourcePoolId(id);
    // Don't allow same source and destination pool
    if (id === destinationPoolId) {
      const other = pools.find((p) => p.id !== id);
      setDestinationPoolId(other ? other.id : '');
    }
  };

  if (!isOpen || pools.length === 0) return null;

  const currentSelectedPool = pools.find((p) => p.id === poolId);
  const currentSourcePool = pools.find((p) => p.id === sourcePoolId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const numericAmount = parseFloat(amount);
    const numericValuation = parseFloat(newValuation);

    // Operational validaiton
    if (activeTab === 'transfer') {
      if (!sourcePoolId || !destinationPoolId) {
        setError('Please select both origin and destination pools.');
        return;
      }
      if (sourcePoolId === destinationPoolId) {
        setError('Origin and destination pools cannot be the same file.');
        return;
      }
      if (isNaN(numericAmount) || numericAmount <= 0) {
        setError('Please enter a valid transfer amount.');
        return;
      }
      if (currentSourcePool && numericAmount > currentSourcePool.currentValuation) {
        setError(`Insufficient funds. The origin pool only has ${formatCurrency(currentSourcePool.currentValuation)} available.`);
        return;
      }
    } else if (activeTab === 'deposit') {
      if (!poolId) {
        setError('Please select a target pool.');
        return;
      }
      if (isNaN(numericAmount) || numericAmount <= 0) {
        setError('Please enter a valid deposit amount.');
        return;
      }
    } else if (activeTab === 'withdrawal') {
      if (!poolId) {
        setError('Please select a target pool.');
        return;
      }
      if (isNaN(numericAmount) || numericAmount <= 0) {
        setError('Please enter a valid withdrawal amount.');
        return;
      }
      if (currentSelectedPool && numericAmount > currentSelectedPool.currentValuation) {
        setError(`Insufficient funds. This pool only has ${formatCurrency(currentSelectedPool.currentValuation)} available.`);
        return;
      }
    } else if (activeTab === 'valuation_adjustment') {
      if (!poolId) {
        setError('Please select a target pool.');
        return;
      }
      if (isNaN(numericValuation) || numericValuation < 0) {
        setError('New valuation must be a positive number (or 0 if totally liqudated).');
        return;
      }
    }

    // Submit transaction structure
    const noteContent = note.trim() || `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1).replace('_', ' ')}`;
    
    onSubmit({
      type: activeTab,
      poolId: activeTab === 'transfer' ? sourcePoolId : poolId,
      sourcePoolId: activeTab === 'transfer' ? sourcePoolId : undefined,
      destinationPoolId: activeTab === 'transfer' ? destinationPoolId : undefined,
      amount: activeTab === 'valuation_adjustment' ? 0 : numericAmount,
      newValuation: activeTab === 'valuation_adjustment' ? numericValuation : undefined,
      note: noteContent,
    });

    onClose();
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div 
      className="fixed inset-0 bg-[#1A1A1A]/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 transition-all"
      id="tx-modal-overlay"
    >
      <div 
        className="bg-white rounded-none border border-[#DCDAD2] w-full max-w-lg shadow-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        id="transaction-container"
      >
        {/* Tab Headers selector slider */}
        <div className="flex border-b border-[#DCDAD2] bg-[#F9F8F6] p-1.5">
          <button
            type="button"
            onClick={() => { setActiveTab('deposit'); setError(''); }}
            className={`flex-1 py-2.5 text-center text-[10px] uppercase tracking-wider font-bold rounded-none transition-all cursor-pointer ${
              activeTab === 'deposit'
                ? 'bg-white text-[#1A1A1A] border border-[#DCDAD2]'
                : 'text-[#8C8C85] hover:text-[#1A1A1A]'
            }`}
          >
            Inflow (+)
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('withdrawal'); setError(''); }}
            className={`flex-1 py-2.5 text-center text-[10px] uppercase tracking-wider font-bold rounded-none transition-all cursor-pointer ${
              activeTab === 'withdrawal'
                ? 'bg-white text-[#1A1A1A] border border-[#DCDAD2]'
                : 'text-[#8C8C85] hover:text-[#1A1A1A]'
            }`}
          >
            Outflow (-)
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('transfer'); setError(''); }}
            disabled={pools.length < 2}
            className={`flex-1 py-2.5 text-center text-[10px] uppercase tracking-wider font-bold rounded-none transition-all cursor-pointer ${
              pools.length < 2 ? 'opacity-35 cursor-not-allowed' : ''
            } ${
              activeTab === 'transfer'
                ? 'bg-white text-[#1A1A1A] border border-[#DCDAD2]'
                : 'text-[#8C8C85] hover:text-[#1A1A1A]'
            }`}
            title={pools.length < 2 ? 'You need at least 2 pools to perform transfers' : ''}
          >
            Transfer
          </button>
          <button
            type="button"
            onClick={() => { 
              setActiveTab('valuation_adjustment'); 
              setError(''); 
              // Refresh initial valuation field
              if (currentSelectedPool) setNewValuation(currentSelectedPool.currentValuation.toString());
            }}
            className={`flex-1 py-2.5 text-center text-[10px] uppercase tracking-wider font-bold rounded-none transition-all cursor-pointer ${
              activeTab === 'valuation_adjustment'
                ? 'bg-white text-[#1A1A1A] border border-[#DCDAD2]'
                : 'text-[#8C8C85] hover:text-[#1A1A1A]'
            }`}
          >
            Status / Value
          </button>
        </div>

        {/* Modal Title and Cancel Handle */}
        <div className="px-6 pt-5 pb-1 flex items-center justify-between">
          <h3 className="font-serif font-bold text-[#1A1A1A] text-base leading-tight">
            {activeTab === 'deposit' && 'Inflow capital contribution (Deposit)'}
            {activeTab === 'withdrawal' && 'Outflow capital withdrawal'}
            {activeTab === 'transfer' && 'Transfer funds internally'}
            {activeTab === 'valuation_adjustment' && 'Change Investment Market Net Amount'}
          </h3>
          <button 
            onClick={onClose}
            className="p-1 px-1.5 hover:bg-[#F9F8F6] rounded-none text-[#8C8C85] hover:text-[#1A1A1A] transition-colors border border-transparent hover:border-[#DCDAD2] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Transaction submission Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {error && (
            <div className="p-3.5 bg-[#FFF0F0] text-rose-800 text-xs font-serif italic border border-[#FCD2D2] rounded-none">
              {error}
            </div>
          )}

          {/* Standard Target Pool (For Deposit, Withdrawal, Valuation) */}
          {activeTab !== 'transfer' && (
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[#8C8C85] uppercase tracking-widest block">
                Select Target Pool
              </label>
              <select
                value={poolId}
                onChange={(e) => handlePoolChange(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#F9F8F6] border border-[#DCDAD2] rounded-none text-sm font-semibold text-[#1A1A1A]"
              >
                {pools.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({formatCurrency(p.currentValuation)} Net)
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Transfer Source & Destination Selector Block */}
          {activeTab === 'transfer' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#8C8C85] uppercase tracking-widest block">
                  Origin (From)
                </label>
                <select
                  value={sourcePoolId}
                  onChange={(e) => handleSourcePoolChange(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#F9F8F6] border border-[#DCDAD2] rounded-none text-sm font-semibold text-[#1A1A1A]"
                >
                  {pools.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({formatCurrency(p.currentValuation)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#8C8C85] uppercase tracking-widest block">
                  Destination (To)
                </label>
                <select
                  value={destinationPoolId}
                  onChange={(e) => setDestinationPoolId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#F9F8F6] border border-[#DCDAD2] rounded-none text-sm font-semibold text-[#1A1A1A]"
                >
                  {pools
                    .filter((p) => p.id !== sourcePoolId)
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({formatCurrency(p.currentValuation)})
                      </option>
                    ))}
                </select>
              </div>
            </div>
          )}

          {/* Transaction Amount Input field (For Deposits, Withdrawals, Transfers) */}
          {activeTab !== 'valuation_adjustment' ? (
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[#8C8C85] uppercase tracking-widest block">
                Transaction Amount (USD)
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[#8C8C85] font-serif font-bold">
                  $
                </span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  min="0.01"
                  step="any"
                  className="w-full pl-8 pr-4 py-2.5 bg-[#F9F8F6] border border-[#DCDAD2] rounded-none text-sm font-serif font-bold text-[#1A1A1A] focus:outline-hidden focus:bg-white focus:border-[#1A1A1A]"
                  required
                />
              </div>
              {activeTab === 'withdrawal' && currentSelectedPool && (
                <span className="text-[10px] text-[#8C8C85] font-serif italic block mt-0.5">
                  Max withdrawable: {formatCurrency(currentSelectedPool.currentValuation)}
                </span>
              )}
              {activeTab === 'transfer' && currentSourcePool && (
                <span className="text-[10px] text-[#8C8C85] font-serif italic block mt-0.5">
                  Max transferable: {formatCurrency(currentSourcePool.currentValuation)}
                </span>
              )}
            </div>
          ) : (
            /* Market Valuation Update Fields (Update investment status overrides) */
            <div className="space-y-3.5 bg-[#F9F8F6] p-4 border border-[#DCDAD2] rounded-none">
              <div className="flex items-center space-x-2 text-[#1A1A1A]">
                <Scale className="w-4 h-4 text-[#8C8C85]" />
                <span className="text-[10px] font-bold uppercase tracking-widest">
                  Update Valuation (Net Value)
                </span>
              </div>

              <p className="text-[11px] text-[#6B6B66] leading-relaxed font-serif italic">
                Add the current investment status. Type the actual net account balance right now. Your physical Cash Invested stays the same, but the portfolio will reflect total market gains or interest differences.
              </p>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#8C8C85] uppercase tracking-widest block">
                  Current Net Balance (USD)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[#8C8C85] font-bold font-serif">
                    $
                  </span>
                  <input
                    type="number"
                    value={newValuation}
                    onChange={(e) => setNewValuation(e.target.value)}
                    placeholder="e.g. 12500"
                    min="0"
                    step="any"
                    className="w-full pl-8 pr-4 py-2.5 bg-white border border-[#DCDAD2] rounded-none text-sm font-serif font-bold text-[#1A1A1A] focus:outline-hidden focus:border-[#1A1A1A]"
                    required
                  />
                </div>
              </div>

              {currentSelectedPool && newValuation !== '' && !isNaN(parseFloat(newValuation)) && (
                <div className="columns-2 gap-4 text-[11px] pt-3 border-t border-[#DCDAD2]">
                  <div>
                    <span className="text-[#8C8C85] font-serif italic block">Previous Valuation</span>
                    <span className="font-bold text-[#1A1A1A] font-serif">
                      {formatCurrency(currentSelectedPool.currentValuation)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#8C8C85] font-serif italic block">Revaluation Difference</span>
                    {(() => {
                      const diff = parseFloat(newValuation) - currentSelectedPool.currentValuation;
                      const pct = currentSelectedPool.currentValuation > 0 ? (diff / currentSelectedPool.currentValuation) * 100 : 0;
                      return (
                        <span className={`font-bold font-serif flex items-center ${
                          diff >= 0 ? 'text-emerald-700' : 'text-rose-700'
                        }`}>
                          <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
                          {diff >= 0 ? '+' : ''}{formatCurrency(diff)} ({diff >= 0 ? '+' : ''}{pct.toFixed(1)}%)
                        </span>
                      );
                    })()}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Core Notes details input */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-[#8C8C85] uppercase tracking-widest block">
              Notes / Transaction Description
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={
                activeTab === 'deposit' ? 'Monthly paycheck save, dividends injection...' :
                activeTab === 'withdrawal' ? 'Atm cash draft, bill coverage...' :
                activeTab === 'transfer' ? 'Rebalancing assets to stocks...' :
                'Mark-to-market status update'
              }
              className="w-full px-4 py-2.5 bg-[#F9F8F6] border border-[#DCDAD2] rounded-none text-sm text-[#1A1A1A]"
              maxLength={60}
            />
          </div>

          {/* Form Actions footer */}
          <div className="flex space-x-3 pt-4 border-t border-[#DCDAD2] mt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-[#DCDAD2] text-[#1A1A1A] rounded-none text-[10px] uppercase tracking-widest font-bold hover:bg-[#F9F8F6] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-[#1A1A1A] hover:bg-[#3E3E39] text-white rounded-none text-[10px] uppercase tracking-widest font-bold transition-all flex items-center justify-center cursor-pointer"
            >
              Confirm {
                activeTab === 'deposit' ? 'Inflow' :
                activeTab === 'withdrawal' ? 'Outflow' :
                activeTab === 'transfer' ? 'Transfer' :
                'Adjustment'
              }
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
