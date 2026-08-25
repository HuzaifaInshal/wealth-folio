/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { InvestmentSource } from '../types';
import { DEFAULT_CATEGORIES } from '../data';
import { X, Plus, Layers } from 'lucide-react';

interface InvestmentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  investmentToEdit: InvestmentSource | null;
  onSubmit: (data: {
    name: string;
    category: string;
    initialBalance: number;
    notes?: string;
  }) => void;
}

export default function InvestmentFormModal({
  isOpen,
  onClose,
  investmentToEdit,
  onSubmit,
}: InvestmentFormModalProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('mutual_fund');
  const [customCategory, setCustomCategory] = useState('');
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [initialBalance, setInitialBalance] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (investmentToEdit) {
      setName(investmentToEdit.name);
      if (DEFAULT_CATEGORIES[investmentToEdit.category]) {
        setCategory(investmentToEdit.category);
        setIsCustomMode(false);
      } else {
        setCategory('custom');
        setCustomCategory(investmentToEdit.category);
        setIsCustomMode(true);
      }
      setInitialBalance(investmentToEdit.investedAmount.toString());
      setNotes(investmentToEdit.notes || '');
    } else {
      setName('');
      setCategory('mutual_fund');
      setCustomCategory('');
      setIsCustomMode(false);
      setInitialBalance('');
      setNotes('');
    }
    setError('');
  }, [investmentToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter an investment source name.');
      return;
    }

    const selectedCategory = isCustomMode ? customCategory.trim() : category;
    if (!selectedCategory) {
      setError('Please select or specify a category.');
      return;
    }

    const parsedBalance = parseFloat(initialBalance) || 0;
    if (parsedBalance < 0) {
      setError('Initial capital cannot be negative.');
      return;
    }

    onSubmit({
      name: name.trim(),
      category: selectedCategory,
      initialBalance: parsedBalance,
      notes: notes.trim(),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-[#1A1A1A]/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white border border-[#DCDAD2] w-full max-w-md rounded-none shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-[#DCDAD2] flex items-center justify-between bg-[#F9F8F6]">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-[#1A1A1A] text-white rounded-none">
              <Layers className="w-4 h-4" />
            </div>
            <h3 className="font-serif text-base font-bold text-[#1A1A1A]">
              {investmentToEdit ? 'Edit Investment Source' : 'New Investment Source'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#8C8C85] hover:text-[#1A1A1A] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-left">
          {error && (
            <div className="p-3 bg-[#FFF0F0] border border-rose-200 text-rose-800 text-xs font-serif italic">
              {error}
            </div>
          )}

          {/* Source Name */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-[#1A1A1A] uppercase tracking-wider block">
              Source / Fund Name <span className="text-rose-700">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Cash Fund, Apple Stock, National Certificate #1..."
              className="w-full px-3 py-2 bg-white border border-[#DCDAD2] text-xs focus:outline-hidden focus:border-[#1A1A1A] text-[#1A1A1A]"
              required
            />
          </div>

          {/* Category Selection */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-[#1A1A1A] uppercase tracking-wider block">
              Asset Category <span className="text-rose-700">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => {
                const val = e.target.value;
                setCategory(val);
                setIsCustomMode(val === 'custom');
              }}
              className="w-full px-3 py-2 bg-white border border-[#DCDAD2] text-xs focus:outline-hidden focus:border-[#1A1A1A] text-[#1A1A1A] cursor-pointer"
            >
              {Object.keys(DEFAULT_CATEGORIES).map((catKey) => (
                <option key={catKey} value={catKey}>
                  {DEFAULT_CATEGORIES[catKey].label}
                </option>
              ))}
              <option value="custom">+ Add Custom Category...</option>
            </select>
          </div>

          {/* Custom Category Input if selected */}
          {isCustomMode && (
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[#1A1A1A] uppercase tracking-wider block">
                Custom Category Name
              </label>
              <input
                type="text"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                placeholder="e.g. Venture Capital, Art, Private Bond..."
                className="w-full px-3 py-2 bg-[#F9F8F6] border border-[#DCDAD2] text-xs focus:outline-hidden focus:border-[#1A1A1A] text-[#1A1A1A]"
              />
            </div>
          )}

          {/* Initial Capital (Only on creation) */}
          {!investmentToEdit && (
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[#1A1A1A] uppercase tracking-wider block">
                Initial Invested Capital ($)
              </label>
              <input
                type="number"
                step="any"
                min="0"
                value={initialBalance}
                onChange={(e) => setInitialBalance(e.target.value)}
                placeholder="0.00"
                className="w-full px-3 py-2 bg-white border border-[#DCDAD2] text-xs font-serif focus:outline-hidden focus:border-[#1A1A1A] text-[#1A1A1A]"
              />
              <p className="text-[10px] text-[#8C8C85] font-serif italic">
                Starting money deposited into this source. Can be updated anytime later.
              </p>
            </div>
          )}

          {/* Notes */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-[#1A1A1A] uppercase tracking-wider block">
              Notes / Memo (Optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. 3-year term, liquidity policy, broker account..."
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
              {investmentToEdit ? 'Save Changes' : 'Create Source'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
