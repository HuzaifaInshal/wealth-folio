/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Holding, Instrument } from '../types';
import { X, Save, Plus, Trash2 } from 'lucide-react';

interface HoldingFormModalProps {
  isOpen: boolean;
  holdingToEdit: Holding | null;
  instruments: Instrument[];
  initialInstrumentId?: string;
  onClose: () => void;
  onSubmit: (holdingData: {
    instrumentId: string;
    quantity?: number;
    initialBalance: number; // Only for new ones
  }) => void;
  onDelete?: (holding: Holding) => void;
  onAddInstrument?: () => void;
}

export default function HoldingFormModal({
  isOpen,
  holdingToEdit,
  instruments,
  initialInstrumentId,
  onClose,
  onSubmit,
  onDelete,
  onAddInstrument,
}: HoldingFormModalProps) {
  const [instrumentId, setInstrumentId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [initialBalance, setInitialBalance] = useState<string>('0');
  const [error, setError] = useState('');

  // Synchronize state when open or editing changes
  useEffect(() => {
    if (holdingToEdit) {
      setInstrumentId(holdingToEdit.instrumentId);
      setQuantity(holdingToEdit.quantity !== undefined ? holdingToEdit.quantity.toString() : '');
      setInitialBalance('0'); // Inactive during edits
    } else {
      // Clear values for new creation
      setInstrumentId(initialInstrumentId || (instruments.length > 0 ? instruments[0].id : ''));
      setQuantity('');
      setInitialBalance('0');
    }
    setError('');
  }, [holdingToEdit, isOpen, instruments, initialInstrumentId]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!instrumentId) {
      setError('Please select a target Fund / Asset. Create one first if none exist.');
      return;
    }

    const parsedInitial = parseFloat(initialBalance);
    if (isNaN(parsedInitial) || parsedInitial < 0) {
      setError('Initial capital base must be a positive amount.');
      return;
    }

    const parsedQuantity = quantity.trim() ? parseFloat(quantity) : undefined;
    if (parsedQuantity !== undefined && (isNaN(parsedQuantity) || parsedQuantity < 0)) {
      setError('Quantity must be a positive number if specified.');
      return;
    }

    onSubmit({
      instrumentId,
      quantity: parsedQuantity,
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
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#DCDAD2]">
          <h3 className="font-serif font-bold text-lg text-[#1A1A1A]">
            {holdingToEdit ? 'Modify Holding Details' : 'Create Investment Holding'}
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

          {/* Instrument SELECT */}
          <div className="space-y-1">
            <div className="flex justify-between items-center mb-1">
              <label className="text-[10px] font-bold text-[#8C8C85] uppercase tracking-widest block">
                Underlying Asset / Fund <span className="text-rose-700">*</span>
              </label>
              {!holdingToEdit && onAddInstrument && (
                <button
                  type="button"
                  onClick={onAddInstrument}
                  className="text-[10px] font-bold text-[#1A1A1A] hover:text-[#8C8C85] transition-colors uppercase tracking-wider flex items-center cursor-pointer"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Create New Asset/Fund
                </button>
              )}
            </div>
            {instruments.length === 0 ? (
              <div className="p-3.5 bg-[#FFF0F0] text-rose-800 text-xs font-serif italic border border-[#FCD2D2] rounded-none flex items-center justify-between">
                <span>No Assets or Funds available in this pool.</span>
                {onAddInstrument && (
                  <button
                    type="button"
                    onClick={onAddInstrument}
                    className="text-[10px] font-bold text-rose-800 hover:text-rose-950 underline uppercase tracking-wider cursor-pointer"
                  >
                    + Create One
                  </button>
                )}
              </div>
            ) : (
              <select
                value={instrumentId}
                onChange={(e) => {
                  if (e.target.value === 'CREATE_NEW') {
                    if (onAddInstrument) onAddInstrument();
                  } else {
                    setInstrumentId(e.target.value);
                  }
                }}
                className="w-full px-4 py-2.5 bg-[#F9F8F6] border border-[#DCDAD2] rounded-none text-sm focus:outline-hidden focus:border-[#1A1A1A] focus:bg-white transition-all text-[#1A1A1A] font-semibold cursor-pointer"
                disabled={!!holdingToEdit}
              >
                {instruments.map((inst) => (
                  <option key={inst.id} value={inst.id}>
                    {inst.name} {inst.ticker ? `(${inst.ticker})` : ''}
                  </option>
                ))}
                {!holdingToEdit && onAddInstrument && (
                  <option value="CREATE_NEW" className="font-bold text-[#1a1a1a]">
                    + Create New Asset / Fund...
                  </option>
                )}
              </select>
            )}
          </div>

          {/* Quantity / Units */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-[#8C8C85] uppercase tracking-widest block">
              Quantity / Units (Optional)
            </label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="e.g. 10 shares, 0.25 BTC (leave empty if not applicable)"
              className="w-full px-4 py-2.5 bg-[#F9F8F6] border border-[#DCDAD2] rounded-none text-sm focus:outline-hidden focus:border-[#1A1A1A] focus:bg-white transition-all text-[#1A1A1A] font-serif"
              min="0"
              step="any"
            />
          </div>

          {/* Initial Capital */}
          {!holdingToEdit ? (
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[#8C8C85] uppercase tracking-widest block">
                Initial Cash Invested (USD)
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
                disabled={instruments.length === 0 && !holdingToEdit}
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
