'use client';

import { useParams, useRouter } from 'next/navigation';
import { useWealthStore } from '@/lib/store';
import { useState, useMemo } from 'react';
import { 
  ArrowLeft, 
  History as HistoryIcon, 
  Network, 
  TrendingUp, 
  DollarSign, 
  BarChart3,
  Plus
} from 'lucide-react';
import TimelineView from '@/components/TimelineView';
import BuilderView from '@/components/BuilderView';
import Link from 'next/link';

export default function FlowDetail() {
  const { id } = useParams();
  const router = useRouter();
  const { flows } = useWealthStore();
  
  const flow = useMemo(() => flows.find(f => f.id === id), [flows, id]);
  const [activeTab, setActiveTab] = useState<'timeline' | 'builder'>('timeline');

  if (!flow) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <h2 className="text-2xl font-bold text-slate-900">Flow not found</h2>
        <Link href="/" className="text-blue-600 hover:underline">Return to Dashboard</Link>
      </div>
    );
  }

  const totalInvested = flow.pools.reduce((sum, p) => sum + p.investedCapital, 0);
  const totalCurrent = flow.pools.reduce((sum, p) => sum + p.currentValue, 0);
  const totalProfit = totalCurrent - totalInvested;
  const roi = totalInvested > 0 ? (totalProfit / totalInvested) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/" className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{flow.name}</h1>
            <p className="text-slate-500 text-sm">{flow.description}</p>
          </div>
        </div>

        <div className="flex bg-white border border-slate-200 rounded-lg p-1 self-start">
          <button
            onClick={() => setActiveTab('timeline')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-all ${
              activeTab === 'timeline' 
                ? 'bg-blue-600 text-white shadow-sm' 
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            <HistoryIcon className="w-4 h-4" />
            <span>Timeline</span>
          </button>
          <button
            onClick={() => setActiveTab('builder')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-all ${
              activeTab === 'builder' 
                ? 'bg-blue-600 text-white shadow-sm' 
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Network className="w-4 h-4" />
            <span>Flow Builder</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <DollarSign className="w-5 h-5" />
            </div>
            <span className="text-slate-500 text-sm font-medium">Invested Capital</span>
          </div>
          <div className="text-2xl font-bold">${totalInvested.toLocaleString()}</div>
        </div>
        
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className="text-slate-500 text-sm font-medium">Current Value</span>
          </div>
          <div className="text-2xl font-bold">${totalCurrent.toLocaleString()}</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 rounded-lg ${totalProfit >= 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
              <BarChart3 className="w-5 h-5" />
            </div>
            <span className="text-slate-500 text-sm font-medium">Total Profit/Loss</span>
          </div>
          <div className={`text-2xl font-bold ${totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {totalProfit >= 0 ? '+' : ''}${totalProfit.toLocaleString()}
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 rounded-lg ${roi >= 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className="text-slate-500 text-sm font-medium">ROI</span>
          </div>
          <div className={`text-2xl font-bold ${roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {roi >= 0 ? '+' : ''}{roi.toFixed(2)}%
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm h-[700px] w-full flex flex-col overflow-hidden">
        {activeTab === 'timeline' ? (
          <TimelineView flow={flow} />
        ) : (
          <BuilderView flow={flow} />
        )}
      </div>
    </div>
  );
}
