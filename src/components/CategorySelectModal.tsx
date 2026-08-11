/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { InvestmentSource } from '../types';
import { DEFAULT_CATEGORIES, getCategoryDetails } from '../data';
import { X, Layers, Check, Plus } from 'lucide-react';

interface CategorySelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCategory: string;
  onSelectCategory: (categoryKey: string) => void;
  investments: InvestmentSource[];
  onOpenNewSource: () => void;
}

export default function CategorySelectModal({
  isOpen,
  onClose,
  selectedCategory,
  onSelectCategory,
  investments,
  onOpenNewSource,
}: CategorySelectModalProps) {
  if (!isOpen) return null;

  // Gather all unique categories (default + custom from investments)
  const categoryKeys = Array.from(
    new Set([
      ...Object.keys(DEFAULT_CATEGORIES),
      ...investments.map((inv) => inv.category),
    ])
  );

  return (
    <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4 font-sans">
      <div className="bg-white dark:bg-[#181924] border border-slate-200 dark:border-slate-800/80 w-full max-w-md rounded-xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between bg-slate-50/50 dark:bg-[#12131A]/50">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-slate-900 dark:bg-purple-600 text-white rounded-lg">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Select Asset Category
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                Filter portfolio sources and ledger logs by category
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Categories List */}
        <div className="p-4 space-y-2 max-h-[60vh] overflow-y-auto">
          {/* All Sources Pill Option */}
          <button
            onClick={() => {
              onSelectCategory('all');
              onClose();
            }}
            className={`w-full flex items-center justify-between p-3 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-slate-900 text-white border-slate-900 dark:bg-purple-600 dark:border-purple-500 shadow-xs'
                : 'bg-slate-50 dark:bg-[#12131A] text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <span className="w-2 h-2 rounded-full bg-purple-500" />
              <span>All Sources ({investments.length})</span>
            </div>
            {selectedCategory === 'all' && <Check className="w-4 h-4 text-white" />}
          </button>

          {/* Specific Categories */}
          {categoryKeys.map((catKey) => {
            const count = investments.filter((i) => i.category === catKey).length;
            const details = getCategoryDetails(catKey);
            const isSelected = selectedCategory === catKey;

            return (
              <button
                key={catKey}
                onClick={() => {
                  onSelectCategory(catKey);
                  onClose();
                }}
                className={`w-full flex items-center justify-between p-3 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 text-white border-slate-900 dark:bg-purple-600 dark:border-purple-500 shadow-xs'
                    : 'bg-white dark:bg-[#12131A] text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: details.color }}
                  />
                  <span>{details.label}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                    {count} {count === 1 ? 'source' : 'sources'}
                  </span>
                </div>
                {isSelected && <Check className="w-4 h-4 text-white" />}
              </button>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="p-3 bg-slate-50 dark:bg-[#12131A] border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
          <button
            onClick={() => {
              onClose();
              onOpenNewSource();
            }}
            className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline flex items-center space-x-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add New Source</span>
          </button>

          <button
            onClick={onClose}
            className="px-3.5 py-1.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg text-xs font-semibold cursor-pointer transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
