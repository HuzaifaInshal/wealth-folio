/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, Percent, Wallet } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: number;
  type: 'currency' | 'percent' | 'number';
  subtitle?: string;
  change?: number;
  icon?: 'wallet' | 'trending' | 'dollar' | 'percent';
  theme?: 'blue' | 'indigo' | 'emerald' | 'amber';
}

export default function MetricCard({
  title,
  value,
  type,
  subtitle,
  change,
  icon = 'wallet',
  theme = 'blue',
}: MetricCardProps) {
  const formatValue = (val: number) => {
    if (type === 'currency') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
      }).format(val);
    }
    if (type === 'percent') {
      return `${val >= 0 ? '+' : ''}${val.toFixed(1)}%`;
    }
    return val.toLocaleString();
  };

  const getMeshClass = () => {
    switch (theme) {
      case 'indigo':
        return 'bg-mesh-cyan-orange border-cyan-200/80 dark:border-slate-800/80';
      case 'emerald':
        return 'bg-mesh-violet-pink border-purple-200/80 dark:border-slate-800/80';
      case 'amber':
        return 'bg-mesh-emerald-gold border-emerald-200/80 dark:border-slate-800/80';
      default:
        return 'bg-mesh-blue border-blue-200/80 dark:border-slate-800/80';
    }
  };

  const isPositive = change !== undefined ? change >= 0 : value >= 0;

  return (
    <div
      className={`rounded-xl p-6 border shadow-xs hover:shadow-lg transition-all duration-200 relative overflow-hidden group ${getMeshClass()}`}
    >
      <div className="relative flex flex-col justify-between h-full space-y-4">
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 tracking-wider uppercase">
            {title}
          </span>
          <div className="p-2.5 rounded-xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-slate-900 dark:text-slate-100 border border-white/80 dark:border-slate-700/80 shadow-xs transition-transform group-hover:scale-105">
            {icon === 'trending' ? (
              <TrendingUp className="w-4 h-4 text-purple-700 dark:text-purple-400" />
            ) : icon === 'percent' ? (
              <Percent className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
            ) : icon === 'dollar' ? (
              <DollarSign className="w-4 h-4 text-amber-700 dark:text-amber-400" />
            ) : (
              <Wallet className="w-4 h-4 text-blue-700 dark:text-blue-400" />
            )}
          </div>
        </div>

        {/* Main Value Display */}
        <div className="space-y-1">
          <span className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white font-sans block">
            {formatValue(value)}
          </span>

          {/* Subtitle & Trend Micro-Badge */}
          <div className="flex items-center justify-between pt-1">
            {subtitle && (
              <span className="text-[11px] text-slate-600 dark:text-slate-400 font-semibold truncate max-w-[170px]">
                {subtitle}
              </span>
            )}

            {change !== undefined && (
              <div
                className={`inline-flex items-center space-x-0.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold backdrop-blur-md ${
                  isPositive
                    ? 'bg-emerald-600/15 text-emerald-800 dark:text-emerald-400 border border-emerald-600/30'
                    : 'bg-rose-600/15 text-rose-800 dark:text-rose-400 border border-rose-600/30'
                }`}
              >
                {isPositive ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                <span>{isPositive ? '+' : ''}{change.toFixed(1)}%</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
