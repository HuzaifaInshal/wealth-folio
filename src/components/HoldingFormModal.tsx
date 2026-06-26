/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Holding, HoldingCategory } from '../types';
import { CATEGORY_DETAILS } from '../data';
import { X, Save, Plus, Trash2 } from 'lucide-react';

interface HoldingFormModalProps {
  isOpen: boolean;
  holdingToEdit: Holding | null;
  onClose: () => void;
  onSubmit: (holdingData: {
    name: string;
    category: HoldingCategory;
    description: string;
    initialBalance: number; // Only for new ones
  }) => void;
  onDelete?: (holding: Holding) => void;
}

export default function HoldingFormModal({ isOpen, holdingToEdit, onClose, onSubmit, onDelete }: HoldingFormModalProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<HoldingCategory>('cash');
  const [description, setDescription] = useState('');
  const [initialBalance, setInitialBalance] = useState<string>('0');
  const [error, setError] = useState('');

  // Sychronize database states if updating
  useEffect(() => {
    if (holdingToEdit) {
      setName(holdingToEdit.name);
      setCategory(holdingToEdit.category);
      setDescription(holdingToEdit.description);
      setInitialBalance('0'); // Inactive during edits
    } else {
      // Clear values for new creation
      setName('');
      setCategory('cash');
      setDescription('');
      setInitialBalance('0');
    }
    setError('');
  }, [holdingToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please provide a descriptive holding name.');
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
      initialBalance: holdingToEdit ? 0 : parsedInitial,
    });
    
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 bg-[#1A1A1A]/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 transition-all"
      id="holding-form-modal-overlay"
    >
      <div 
        className="bg-white rounded-none border border-[#DCDAD2] w-full max-w-lg shadow-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        id="holding-form-container"
      >
        {/* Header Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#DCDAD2]">
          <h3 className="font-serif font-bold text-lg text-[#1A1A1A]">
            {holdingToEdit ? 'Modify Holding Details' : 'Create Saving / Investment Holding'}
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
              Holding Name <span className="text-rose-700">*</span>
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
              placeholder="State the objective, institution, fees, or strategy (e.g. Fidelity Brokerage, Long-Term, 4.5% APY)"
              rows={3}
              className="w-full px-4 py-2.5 bg-[#F9F8F6] border border-[#DCDAD2] rounded-none text-sm focus:outline-hidden focus:border-[#1A1A1A] focus:bg-white transition-all text-[#1A1A1A] resize-none leading-relaxed"
              maxLength={200}
            />
          </div>

          {/* Initial Capital / Locked Values Message */}
          {!holdingToEdit ? (
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
              <span className="text-[10px] text-[#8C8C85] font-serif italic mt-0.5 block">Deposits this amount into the holding</span>
            </div>
          ) : (
            <div className="bg-[#F9F8F6] p-3 rounded-none border border-[#DCDAD2] flex flex-col justify-center">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#1A1A1A]">Edit Locked Values</p>
              <p className="text-[10px] text-[#8C8C85] font-serif italic mt-1 leading-normal">
                To adjust current balances, use the Capital Inflow, Capital Outflow, or Update Valuation actions directly.
              </p>
            </div>
          )}

          {/* Form Actions Footer buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-[#DCDAD2] mt-4">
            {holdingToEdit && onDelete ? (
              <button
                type="button"
                onClick={() => onDelete(holdingToEdit)}
                className="px-4 py-2.5 border border-rose-200 hover:border-rose-600 text-rose-600 hover:bg-rose-50/50 rounded-none text-[10px] uppercase tracking-widest font-bold transition-all flex items-center justify-center cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5 mr-2 text-rose-600" />
                Delete Holding
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
                {holdingToEdit ? (
                  <>
                    <Save className="w-3.5 h-3.5 mr-1.5" />
                    Save Changes
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5 mr-1.5" />
                    Create Holding
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
