'use client';

import { useWealthStore } from '@/lib/store';
import { Plus, ArrowRight, Wallet, TrendingUp, PiggyBank } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function Dashboard() {
  const { flows, addFlow } = useWealthStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newFlowName, setNewFlowName] = useState('');
  const [newFlowDesc, setNewFlowDesc] = useState('');

  const handleAddFlow = (e: React.FormEvent) => {
    e.preventDefault();
    if (newFlowName.trim()) {
      addFlow(newFlowName, newFlowDesc);
      setNewFlowName('');
      setNewFlowDesc('');
      setShowAddModal(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500">Manage your investment flows and savings pools.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5" />
          <span>New Flow</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {flows.map((flow) => {
          const totalInvested = flow.pools.reduce((sum, p) => sum + p.investedCapital, 0);
          const totalCurrent = flow.pools.reduce((sum, p) => sum + p.currentValue, 0);
          const roi = totalInvested > 0 ? ((totalCurrent - totalInvested) / totalInvested) * 100 : 0;

          return (
            <Link
              key={flow.id}
              href={`/flows/${flow.id}`}
              className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-md hover:border-blue-200 transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="bg-blue-50 p-3 rounded-lg text-blue-600">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div className={`text-sm font-semibold px-2 py-1 rounded ${roi >= 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                  {roi >= 0 ? '+' : ''}{roi.toFixed(1)}%
                </div>
              </div>
              <h3 className="text-xl font-bold mb-1 group-hover:text-blue-600 transition-colors">{flow.name}</h3>
              <p className="text-slate-500 text-sm mb-6 line-clamp-2">{flow.description || 'No description provided.'}</p>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Total Invested</span>
                  <span className="font-semibold">${totalInvested.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Current Value</span>
                  <span className="font-bold text-slate-900">${totalCurrent.toLocaleString()}</span>
                </div>
              </div>

              <div className="mt-6 flex items-center text-blue-600 font-medium text-sm">
                <span>View Flow Details</span>
                <ArrowRight className="w-4 h-4 ml-1 group-hover:ml-2 transition-all" />
              </div>
            </Link>
          );
        })}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-[100]">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-2xl font-bold mb-4">Create New Flow</h2>
            <form onSubmit={handleAddFlow} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Flow Name</label>
                <input
                  type="text"
                  required
                  value={newFlowName}
                  onChange={(e) => setNewFlowName(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="e.g. Retirement Fund, Crypto Bets"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea
                  value={newFlowDesc}
                  onChange={(e) => setNewFlowDesc(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none h-24 resize-none"
                  placeholder="What is this flow for?"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
