/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Holding, TransactionType, Instrument } from '../types';
import { X, ArrowRight, DollarSign, ArrowRightLeft, Percent, Scale, TrendingUp } from 'lucide-react';

interface TransactionModalProps {
  isOpen: boolean;
  holdings: Holding[];
  instruments: Instrument[];
  initialHolding: Holding | null;
  initialTab: 'deposit' | 'withdrawal' | 'transfer' | 'valuation_adjustment';
  onClose: () => void;
  onSubmit: (txData: {
    type: TransactionType;
    holdingId: string;
    sourceHoldingId?: string;
    destinationHoldingId?: string;
    amount: number;
    newValuation?: number;
    note: string;
  }) => void;
}

export default function TransactionModal({
  isOpen,
  holdings,
  instruments,
  initialHolding,
  initialTab,
  onClose,
  onSubmit,
}: TransactionModalProps) {
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdrawal' | 'transfer' | 'valuation_adjustment'>('deposit');
  
  // Fields
  const [holdingId, setHoldingId] = useState('');
  const [sourceHoldingId, setSourceHoldingId] = useState('');
  const [destinationHoldingId, setDestinationHoldingId] = useState('');
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
    
    // Choose pre-selected holdings
    if (initialHolding) {
      if (initialTab === 'transfer') {
        setSourceHoldingId(initialHolding.id);
        const otherHolding = holdings.find((h) => h.id !== initialHolding.id);
        setDestinationHoldingId(otherHolding ? otherHolding.id : '');
      } else {
        setHoldingId(initialHolding.id);
        setNewValuation(initialHolding.currentValuation.toString());
      }
    } else {
      if (holdings.length > 0) {
        setHoldingId(holdings[0].id);
        setSourceHoldingId(holdings[0].id);
        const secondHolding = holdings.find((h) => h.id !== holdings[0].id);
        setDestinationHoldingId(secondHolding ? secondHolding.id : '');
        setNewValuation(holdings[0].currentValuation.toString());
      }
    }
  }, [isOpen, initialHolding, initialTab]);

  // Handle active holding change (re-populate valuation input)
  const handleHoldingChange = (id: string) => {
    setHoldingId(id);
    const holding = holdings.find((h) => h.id === id);
    if (holding) {
      setNewValuation(holding.currentValuation.toString());
    }
  };

  const handleSourceHoldingChange = (id: string) => {
    setSourceHoldingId(id);
    // Don't allow same source and destination holding
    if (id === destinationHoldingId) {
      const other = holdings.find((h) => h.id !== id);
      setDestinationHoldingId(other ? other.id : '');
    }
  };

  if (!isOpen || holdings.length === 0) return null;

  const currentSelectedHolding = holdings.find((h) => h.id === holdingId);
  const currentSourceHolding = holdings.find((h) => h.id === sourceHoldingId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const numericAmount = parseFloat(amount);
    const numericValuation = parseFloat(newValuation);

    // Operational validation
    if (activeTab === 'transfer') {
      if (!sourceHoldingId || !destinationHoldingId) {
        setError('Please select both origin and destination holdings.');
        return;
      }
      if (sourceHoldingId === destinationHoldingId) {
        setError('Origin and destination holdings cannot be the same.');
        return;
      }
      if (isNaN(numericAmount) || numericAmount <= 0) {
        setError('Please enter a valid transfer amount.');
        return;
      }
      if (currentSourceHolding && numericAmount > currentSourceHolding.currentValuation) {
        setError(`Insufficient funds. The origin holding only has ${formatCurrency(currentSourceHolding.currentValuation)} available.`);
        return;
      }
    } else if (activeTab === 'deposit') {
      if (!holdingId) {
        setError('Please select a target holding.');
        return;
      }
      if (isNaN(numericAmount) || numericAmount <= 0) {
        setError('Please enter a valid deposit amount.');
        return;
      }
    } else if (activeTab === 'withdrawal') {
      if (!holdingId) {
        setError('Please select a target holding.');
        return;
      }
      if (isNaN(numericAmount) || numericAmount <= 0) {
        setError('Please enter a valid withdrawal amount.');
        return;
      }
      if (currentSelectedHolding && numericAmount > currentSelectedHolding.currentValuation) {
        setError(`Insufficient funds. This holding only has ${formatCurrency(currentSelectedHolding.currentValuation)} available.`);
        return;
      }
    } else if (activeTab === 'valuation_adjustment') {
      if (!holdingId) {
        setError('Please select a target holding.');
        return;
      }
      if (isNaN(numericValuation) || numericValuation < 0) {
        setError('New valuation must be a positive number (or 0 if totally liquidated).');
        return;
      }
    }

    // Submit transaction structure
    const noteContent = note.trim() || `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1).replace('_', ' ')}`;
    
    onSubmit({
      type: activeTab,
      holdingId: activeTab === 'transfer' ? sourceHoldingId : holdingId,
      sourceHoldingId: activeTab === 'transfer' ? sourceHoldingId : undefined,
      destinationHoldingId: activeTab === 'transfer' ? destinationHoldingId : undefined,
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
            disabled={holdings.length < 2}
            className={`flex-1 py-2.5 text-center text-[10px] uppercase tracking-wider font-bold rounded-none transition-all cursor-pointer ${
              holdings.length < 2 ? 'opacity-35 cursor-not-allowed' : ''
            } ${
              activeTab === 'transfer'
                ? 'bg-white text-[#1A1A1A] border border-[#DCDAD2]'
                : 'text-[#8C8C85] hover:text-[#1A1A1A]'
            }`}
            title={holdings.length < 2 ? 'You need at least 2 holdings to perform transfers' : ''}
          >
            Transfer
          </button>
          <button
            type="button"
            onClick={() => { 
              setActiveTab('valuation_adjustment'); 
              setError(''); 
              // Refresh initial valuation field
              if (currentSelectedHolding) setNewValuation(currentSelectedHolding.currentValuation.toString());
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

          {/* Standard Target Holding (For Deposit, Withdrawal, Valuation) */}
          {activeTab !== 'transfer' && (
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[#8C8C85] uppercase tracking-widest block">
                Select Target Holding
              </label>
              <select
                value={holdingId}
                onChange={(e) => handleHoldingChange(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#F9F8F6] border border-[#DCDAD2] rounded-none text-sm font-semibold text-[#1A1A1A]"
              >
                {holdings.map((h) => {
                  const inst = instruments.find(i => i.id === h.instrumentId);
                  return (
                    <option key={h.id} value={h.id}>
                      {inst ? inst.name : 'Unknown Asset'} ({formatCurrency(h.currentValuation)} Net)
                    </option>
                  );
                })}
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
                  value={sourceHoldingId}
                  onChange={(e) => handleSourceHoldingChange(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#F9F8F6] border border-[#DCDAD2] rounded-none text-sm font-semibold text-[#1A1A1A]"
                >
                  {holdings.map((h) => {
                    const inst = instruments.find(i => i.id === h.instrumentId);
                    return (
                      <option key={h.id} value={h.id}>
                        {inst ? inst.name : 'Unknown Asset'} ({formatCurrency(h.currentValuation)})
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#8C8C85] uppercase tracking-widest block">
                  Destination (To)
                </label>
                <select
                  value={destinationHoldingId}
                  onChange={(e) => setDestinationHoldingId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#F9F8F6] border border-[#DCDAD2] rounded-none text-sm font-semibold text-[#1A1A1A]"
                >
                  {holdings
                    .filter((h) => h.id !== sourceHoldingId)
                    .map((h) => {
                      const inst = instruments.find(i => i.id === h.instrumentId);
                      return (
                        <option key={h.id} value={h.id}>
                          {inst ? inst.name : 'Unknown Asset'} ({formatCurrency(h.currentValuation)})
                        </option>
                      );
                    })}
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
              {activeTab === 'withdrawal' && currentSelectedHolding && (
                <span className="text-[10px] text-[#8C8C85] font-serif italic block mt-0.5">
                  Max withdrawable: {formatCurrency(currentSelectedHolding.currentValuation)}
                </span>
              )}
              {activeTab === 'transfer' && currentSourceHolding && (
                <span className="text-[10px] text-[#8C8C85] font-serif italic block mt-0.5">
                  Max transferable: {formatCurrency(currentSourceHolding.currentValuation)}
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

              {currentSelectedHolding && newValuation !== '' && !isNaN(parseFloat(newValuation)) && (
                <div className="columns-2 gap-4 text-[11px] pt-3 border-t border-[#DCDAD2]">
                  <div>
                    <span className="text-[#8C8C85] font-serif italic block">Previous Valuation</span>
                    <span className="font-bold text-[#1A1A1A] font-serif">
                      {formatCurrency(currentSelectedHolding.currentValuation)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#8C8C85] font-serif italic block">Revaluation Difference</span>
                    {(() => {
                      const diff = parseFloat(newValuation) - currentSelectedHolding.currentValuation;
                      const pct = currentSelectedHolding.currentValuation > 0 ? (diff / currentSelectedHolding.currentValuation) * 100 : 0;
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
