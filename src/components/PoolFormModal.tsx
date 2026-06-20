/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { InvestmentPool, PoolCategory } from '../types';
import { CATEGORY_DETAILS } from '../data';
import { X, Trophy, Save, Plus } from 'lucide-react';

interface PoolFormModalProps {
  isOpen: boolean;
  poolToEdit: InvestmentPool | null;
  onClose: () => void;
  onSubmit: (poolData: {
    name: string;
    category: PoolCategory;
    description: string;
    targetAmount: number | null;
    initialBalance: number; // Only for new ones
  }) => void;
}

export default function PoolFormModal({ isOpen, poolToEdit, onClose, onSubmit }: PoolFormModalProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<PoolCategory>('cash');
  const [description, setDescription] = useState('');
  const [targetAmount, setTargetAmount] = useState<string>('');
  const [initialBalance, setInitialBalance] = useState<string>('0');
  const [error, setError] = useState('');

  // Sychronize database states if updating
  useEffect(() => {
    if (poolToEdit) {
      setName(poolToEdit.name);
      setCategory(poolToEdit.category);
      setDescription(poolToEdit.description);
      setTargetAmount(poolToEdit.targetAmount ? poolToEdit.targetAmount.toString() : '');
      setInitialBalance('0'); // Inactive during edits
    } else {
      // Clear values for new creation
      setName('');
      setCategory('cash');
      setDescription('');
      setTargetAmount('');
      setInitialBalance('0');
    }
    setError('');
  }, [poolToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please provide a descriptive pool name.');
      return;
    }

    const parsedTarget = targetAmount.trim() === '' ? null : parseFloat(targetAmount);
    if (parsedTarget !== null && (isNaN(parsedTarget) || parsedTarget < 0)) {
      setError('Target amount must be a positive number.');
      return;
    }

    const parsedInitial = parseFloat(initialBalance);
    if (isNaN(parsedInitial) || parsedInitial < 0) {
      setError('Initial capital base must be a positive amount.');
      return;
    }

    onSubmit({
      name: name.trim(),
      category,
      description: description.trim(),
      targetAmount: parsedTarget,
      initialBalance: poolToEdit ? 0 : parsedInitial,
    });
    
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 bg-[#1A1A1A]/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 transition-all"
      id="pool-form-modal-overlay"
    >
      <div 
        className="bg-white rounded-none border border-[#DCDAD2] w-full max-w-lg shadow-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        id="pool-form-container"
      >
        {/* Header Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#DCDAD2]">
          <h3 className="font-serif font-bold text-lg text-[#1A1A1A]">
            {poolToEdit ? 'Modify Pool Details' : 'Create Saving / Investment Pool'}
          </h3>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-[#F9F8F6] text-[#8C8C85] hover:text-[#1A1A1A] rounded-none transition-colors border border-transparent hover:border-[#DCDAD2] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {error && (
            <div className="p-3.5 bg-[#FFF0F0] text-rose-800 text-xs font-serif italic border border-[#FCD2D2] rounded-none">
              {error}
            </div>
          )}

          {/* Name */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-[#8C8C85] uppercase tracking-widest block">
              Pool Name <span className="text-rose-700">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Rainy Day Reserve, S&P Index, BTC Bag"
              className="w-full px-4 py-2.5 bg-[#F9F8F6] border border-[#DCDAD2] rounded-none text-sm focus:outline-hidden focus:border-[#1A1A1A] focus:bg-white transition-all text-[#1A1A1A]"
              maxLength={40}
              required
            />
          </div>

          {/* Category SELECT */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-[#8C8C85] uppercase tracking-widest block">
              Asset Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as PoolCategory)}
              className="w-full px-4 py-2.5 bg-[#F9F8F6] border border-[#DCDAD2] rounded-none text-sm focus:outline-hidden focus:border-[#1A1A1A] focus:bg-white transition-all text-[#1A1A1A] font-semibold"
            >
              {(Object.keys(CATEGORY_DETAILS) as PoolCategory[]).map((catKey) => (
                <option key={catKey} value={catKey}>
                  {CATEGORY_DETAILS[catKey].label}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-[#8C8C85] uppercase tracking-widest block">
              Description / Notes
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="State the objective, institution, fees, or strategy (e.g. Fidelity Brokerage, Long-Term, 4.5% APY)"
              rows={3}
              className="w-full px-4 py-2.5 bg-[#F9F8F6] border border-[#DCDAD2] rounded-none text-sm focus:outline-hidden focus:border-[#1A1A1A] focus:bg-white transition-all text-[#1A1A1A] resize-none leading-relaxed"
              maxLength={200}
            />
          </div>

          {/* Target Amount & Initial Capital row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Target Amount */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[#8C8C85] uppercase tracking-widest flex items-center">
                <Trophy className="w-3.5 h-3.5 mr-1 text-slate-400" />
                Target Goal (USD)
              </label>
              <input
                type="number"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                placeholder="Optional (e.g., 10000)"
                min="0"
                step="any"
                className="w-full px-4 py-2.5 bg-[#F9F8F6] border border-[#DCDAD2] rounded-none text-sm focus:outline-hidden focus:border-[#1A1A1A] focus:bg-white transition-all text-[#1A1A1A] font-serif"
              />
              <span className="text-[10px] text-[#8C8C85] font-serif italic mt-0.5 block">Leave blank for no goal</span>
            </div>

            {/* Initial Balance (Only visible if brand new creation) */}
            {!poolToEdit ? (
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#8C8C85] uppercase tracking-widest block">
                  Initial Cash Injected
                </label>
                <input
                  type="number"
                  value={initialBalance}
                  onChange={(e) => setInitialBalance(e.target.value)}
                  placeholder="e.g. 500"
                  min="0"
                  step="any"
                  className="w-full px-4 py-2.5 bg-[#F9F8F6] border border-[#DCDAD2] rounded-none text-sm focus:outline-hidden focus:border-[#1A1A1A] focus:bg-white transition-all text-[#1A1A1A] font-serif"
                />
                <span className="text-[10px] text-[#8C8C85] font-serif italic mt-0.5 block">Deposits this amount into the pool</span>
              </div>
            ) : (
              <div className="bg-[#F9F8F6] p-3 rounded-none border border-[#DCDAD2] flex flex-col justify-center">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#1A1A1A]">Edit Locked Values</p>
                <p className="text-[10px] text-[#8C8C85] font-serif italic mt-1 leading-normal">
                  To adjust current balances, use the Capital Inflow, Capital Outflow, or Update Valuation actions directly.
                </p>
              </div>
            )}
          </div>

          {/* Form Actions Footer buttons */}
          <div className="flex space-x-3 pt-4 border-t border-[#DCDAD2] mt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-[#DCDAD2] text-[#1A1A1A] rounded-none text-[10px] uppercase tracking-widest font-bold hover:bg-[#F9F8F6] transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-[#1A1A1A] text-white rounded-none text-[10px] uppercase tracking-widest font-bold hover:bg-[#3E3E39] shadow-xs transition-all flex items-center justify-center cursor-pointer"
            >
              {poolToEdit ? (
                <>
                  <Save className="w-3.5 h-3.5 mr-1.5" />
                  Save Changes
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5 mr-1.5" />
                  Create Pool
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
