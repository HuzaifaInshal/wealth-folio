/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Pool } from '../types';
import { X, Save, Plus } from 'lucide-react';

interface PoolFormModalProps {
  isOpen: boolean;
  poolToEdit: Pool | null;
  onClose: () => void;
  onSubmit: (poolData: { title: string; description: string }) => void;
}

export default function PoolFormModal({ isOpen, poolToEdit, onClose, onSubmit }: PoolFormModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  // Synchronize field states when modal is opened/edited
  useEffect(() => {
    if (poolToEdit) {
      setTitle(poolToEdit.title);
      setDescription(poolToEdit.description);
    } else {
      setTitle('');
      setDescription('');
    }
    setError('');
  }, [poolToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Please provide a pool title.');
      return;
    }

    onSubmit({
      title: title.trim(),
      description: description.trim(),
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
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#DCDAD2]">
          <h3 className="font-serif font-bold text-lg text-[#1A1A1A]">
            {poolToEdit ? 'Modify Pool Details' : 'Create New Asset Pool'}
          </h3>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-[#F9F8F6] text-[#8C8C85] hover:text-[#1A1A1A] rounded-none transition-colors border border-transparent hover:border-[#DCDAD2] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {error && (
            <div className="p-3.5 bg-[#FFF0F0] text-rose-800 text-xs font-serif italic border border-[#FCD2D2] rounded-none">
              {error}
            </div>
          )}

          {/* Title */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-[#8C8C85] uppercase tracking-widest block">
              Pool Title <span className="text-rose-700">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Personal Accounts, Joint Ventures, Venture Capital"
              className="w-full px-4 py-2.5 bg-[#F9F8F6] border border-[#DCDAD2] rounded-none text-sm focus:outline-hidden focus:border-[#1A1A1A] focus:bg-white transition-all text-[#1A1A1A]"
              maxLength={40}
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-[#8C8C85] uppercase tracking-widest block">
              Description / Notes
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="State the core objective or fund strategy for this pool (e.g. Family savings, index tracking portfolios)"
              rows={3}
              className="w-full px-4 py-2.5 bg-[#F9F8F6] border border-[#DCDAD2] rounded-none text-sm focus:outline-hidden focus:border-[#1A1A1A] focus:bg-white transition-all text-[#1A1A1A] resize-none leading-relaxed"
              maxLength={200}
            />
          </div>

          {/* Actions */}
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
