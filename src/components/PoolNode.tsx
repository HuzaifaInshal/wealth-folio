'use client';

import { Handle, Position } from '@xyflow/react';
import { useWealthStore } from '@/lib/store';
import { Wallet, Info } from 'lucide-react';
import { useState } from 'react';

export default function PoolNode({ data, id }: { data: any, id: string }) {
  const { flows } = useWealthStore();
  const [isHovered, setIsHovered] = useState(false);

  // Find the pool data
  const pool = flows.flatMap(f => f.pools).find(p => p.id === id);

  if (!pool) return null;

  return (
    <div 
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`p-4 rounded-xl border-2 bg-white shadow-lg min-w-[180px] transition-all ${isHovered ? 'border-blue-500 scale-105' : 'border-slate-200'}`}>
        <Handle type="target" position={Position.Top} className="w-3 h-3 bg-blue-400" />
        
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pool</div>
            <div className="font-bold text-slate-900">{pool.name}</div>
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-slate-500">Actual Amount</span>
            <span className="font-bold text-blue-600">${pool.currentValue.toLocaleString()}</span>
          </div>
          <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
            <div 
              className="bg-blue-500 h-full transition-all duration-500" 
              style={{ width: `${Math.min(100, (pool.currentValue / (pool.investedCapital || 1)) * 100)}%` }}
            />
          </div>
        </div>

        <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-blue-600" />
      </div>

      {/* Hover Info Card */}
      {isHovered && (
        <div className="absolute z-50 top-full mt-4 left-1/2 -translate-x-1/2 w-64 bg-slate-900 text-white p-4 rounded-xl shadow-2xl animate-in fade-in zoom-in-95">
          <div className="flex items-center gap-2 mb-3 border-b border-slate-700 pb-2">
            <Info className="w-4 h-4 text-blue-400" />
            <span className="font-bold text-sm">Detailed Metrics</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Invested Capital</span>
              <span className="font-medium">${pool.investedCapital.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Current Value</span>
              <span className="font-medium">${pool.currentValue.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-xs border-t border-slate-700 pt-2">
              <span className="text-slate-400">Profit/Loss</span>
              <span className={`font-bold ${pool.currentValue >= pool.investedCapital ? 'text-green-400' : 'text-red-400'}`}>
                {pool.currentValue >= pool.investedCapital ? '+' : ''}${(pool.currentValue - pool.investedCapital).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">ROI</span>
              <span className={`font-bold ${pool.currentValue >= pool.investedCapital ? 'text-green-400' : 'text-red-400'}`}>
                {pool.investedCapital > 0 ? (((pool.currentValue - pool.investedCapital) / pool.investedCapital) * 100).toFixed(2) : '0.00'}%
              </span>
            </div>
          </div>
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-slate-900 rotate-45" />
        </div>
      )}
    </div>
  );
}
