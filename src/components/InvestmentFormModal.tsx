/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { InvestmentSource } from '../types';
import { DEFAULT_CATEGORIES } from '../data';
import { X, Layers } from 'lucide-react';

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
    <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-[#181924] border border-slate-200 dark:border-slate-800/80 w-full max-w-md rounded-lg shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150 font-sans">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between bg-slate-50/50 dark:bg-[#12131A]/50">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-slate-900 dark:bg-purple-600 text-white rounded-lg">
              <Layers className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {investmentToEdit ? 'Edit Investment Source' : 'New Investment Source'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-left">
          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/60 text-rose-800 dark:text-rose-400 text-xs font-semibold rounded-2xl">
              {error}
            </div>
          )}

          {/* Source Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
              Source / Fund Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Cash Fund, Apple Stock, Savings Certificate #1..."
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#12131A] border border-slate-200 dark:border-slate-800/80 rounded-lg text-xs text-slate-900 dark:text-white font-medium focus:outline-hidden focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-slate-900 dark:focus:ring-purple-500 transition-all"
              required
            />
          </div>

          {/* Category Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
              Asset Category <span className="text-rose-500">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => {
                const val = e.target.value;
                setCategory(val);
                setIsCustomMode(val === 'custom');
              }}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#12131A] border border-slate-200 dark:border-slate-800/80 rounded-lg text-xs text-slate-900 dark:text-white font-medium focus:outline-hidden focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-slate-900 dark:focus:ring-purple-500 transition-all cursor-pointer"
            >
              {Object.keys(DEFAULT_CATEGORIES).map((catKey) => (
                <option key={catKey} value={catKey} className="dark:bg-[#181924]">
                  {DEFAULT_CATEGORIES[catKey].label}
                </option>
              ))}
              <option value="custom" className="dark:bg-[#181924]">+ Add Custom Category...</option>
            </select>
          </div>

          {/* Custom Category Input if selected */}
          {isCustomMode && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                Custom Category Name
              </label>
              <input
                type="text"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                placeholder="e.g. Venture Capital, Art, Private Bond..."
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#12131A] border border-slate-200 dark:border-slate-800/80 rounded-lg text-xs text-slate-900 dark:text-white font-medium focus:outline-hidden focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-slate-900 dark:focus:ring-purple-500 transition-all"
              />
            </div>
          )}

          {/* Initial Capital (Only on creation) */}
          {!investmentToEdit && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                Starting Invested Capital ($)
              </label>
              <input
                type="number"
                step="any"
                min="0"
                value={initialBalance}
                onChange={(e) => setInitialBalance(e.target.value)}
                placeholder="0.00"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#12131A] border border-slate-200 dark:border-slate-800/80 rounded-lg text-xs text-slate-900 dark:text-white font-medium focus:outline-hidden focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-slate-900 dark:focus:ring-purple-500 transition-all"
              />
            </div>
          )}

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
              Notes / Memo (Optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. 3-year certificate, liquidity policy, broker account..."
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#12131A] border border-slate-200 dark:border-slate-800/80 rounded-lg text-xs text-slate-900 dark:text-white font-medium focus:outline-hidden focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-slate-900 dark:focus:ring-purple-500 transition-all"
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
              {investmentToEdit ? 'Save Changes' : 'Create Source'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
