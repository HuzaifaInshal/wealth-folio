/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Instrument, HoldingCategory } from '../types';
import { CATEGORY_DETAILS } from '../data';
import { X, Save, Plus, Trash2 } from 'lucide-react';

interface InstrumentFormModalProps {
  isOpen: boolean;
  instrumentToEdit: Instrument | null;
  onClose: () => void;
  onSubmit: (instrumentData: {
    name: string;
    ticker: string;
    category: HoldingCategory;
    description: string;
  }) => void;
  onDelete?: (instrument: Instrument) => void;
}

export default function InstrumentFormModal({
  isOpen,
  instrumentToEdit,
  onClose,
  onSubmit,
  onDelete,
}: InstrumentFormModalProps) {
  const [name, setName] = useState('');
  const [ticker, setTicker] = useState('');
  const [category, setCategory] = useState<HoldingCategory>('cash');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (instrumentToEdit) {
      setName(instrumentToEdit.name);
      setTicker(instrumentToEdit.ticker);
      setCategory(instrumentToEdit.category);
      setDescription(instrumentToEdit.description);
    } else {
      setName('');
      setTicker('');
      setCategory('cash');
      setDescription('');
    }
    setError('');
  }, [instrumentToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please provide a descriptive asset name.');
      return;
    }

    onSubmit({
      name: name.trim(),
      ticker: ticker.trim().toUpperCase(),
      category,
      description: description.trim(),
    });
    
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 bg-[#1A1A1A]/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 transition-all"
      id="instrument-form-modal-overlay"
    >
      <div 
        className="bg-white rounded-none border border-[#DCDAD2] w-full max-w-lg shadow-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        id="instrument-form-container"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#DCDAD2]">
          <h3 className="font-serif font-bold text-lg text-[#1A1A1A]">
            {instrumentToEdit ? 'Modify Asset / Fund Details' : 'Add Investment Asset / Fund'}
          </h3>
          <button 
            type="button"
            onClick={onClose}
            className="p-1.5 hover:bg-[#F9F8F6] text-[#8C8C85] hover:text-[#1A1A1A] rounded-none transition-colors border border-transparent hover:border-[#DCDAD2] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {error && (
            <div className="p-3.5 bg-[#FFF0F0] text-rose-800 text-xs font-serif italic border border-[#FCD2D2] rounded-none">
              {error}
            </div>
          )}

          {/* Name */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-[#8C8C85] uppercase tracking-widest block">
              Asset / Fund Name <span className="text-rose-700">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Apple Inc., S&P 500 Index Fund, Bitcoin"
              className="w-full px-4 py-2.5 bg-[#F9F8F6] border border-[#DCDAD2] rounded-none text-sm focus:outline-hidden focus:border-[#1A1A1A] focus:bg-white transition-all text-[#1A1A1A]"
              maxLength={40}
              required
            />
          </div>

          {/* Ticker / Symbol */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-[#8C8C85] uppercase tracking-widest block">
              Ticker / Symbol (Optional)
            </label>
            <input
              type="text"
              value={ticker}
              onChange={(e) => setTicker(e.target.value)}
              placeholder="e.g. AAPL, VOO, BTC"
              className="w-full px-4 py-2.5 bg-[#F9F8F6] border border-[#DCDAD2] rounded-none text-sm focus:outline-hidden focus:border-[#1A1A1A] focus:bg-white transition-all text-[#1A1A1A] font-semibold"
              maxLength={10}
            />
          </div>

          {/* Category Selector */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-[#8C8C85] uppercase tracking-widest block">
              Asset Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as HoldingCategory)}
              className="w-full px-4 py-2.5 bg-[#F9F8F6] border border-[#DCDAD2] rounded-none text-sm focus:outline-hidden focus:border-[#1A1A1A] focus:bg-white transition-all text-[#1A1A1A] font-semibold"
            >
              {(Object.keys(CATEGORY_DETAILS) as HoldingCategory[]).map((catKey) => (
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
              placeholder="Objective or notes (e.g. Fidelity Brokerage, Long-Term, Tech ETF)"
              rows={3}
              className="w-full px-4 py-2.5 bg-[#F9F8F6] border border-[#DCDAD2] rounded-none text-sm focus:outline-hidden focus:border-[#1A1A1A] focus:bg-white transition-all text-[#1A1A1A] resize-none leading-relaxed"
              maxLength={200}
            />
          </div>

          {/* Form Actions Footer buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-[#DCDAD2] mt-4">
            {instrumentToEdit && onDelete ? (
              <button
                type="button"
                onClick={() => onDelete(instrumentToEdit)}
                className="px-4 py-2.5 border border-rose-200 hover:border-rose-600 text-rose-600 hover:bg-rose-50/50 rounded-none text-[10px] uppercase tracking-widest font-bold transition-all flex items-center justify-center cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5 mr-2 text-rose-600" />
                Delete Asset
              </button>
            ) : (
              <div />
            )}
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 border border-[#DCDAD2] text-[#1A1A1A] rounded-none text-[10px] uppercase tracking-widest font-bold hover:bg-[#F9F8F6] transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-[#1A1A1A] text-white rounded-none text-[10px] uppercase tracking-widest font-bold hover:bg-[#3E3E39] shadow-xs transition-all flex items-center justify-center cursor-pointer"
              >
                {instrumentToEdit ? (
                  <>
                    <Save className="w-3.5 h-3.5 mr-1.5" />
                    Save Changes
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5 mr-1.5" />
                    Add Asset
                  </>
                )}
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
}
