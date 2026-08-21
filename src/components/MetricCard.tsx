/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, Percent, Wallet, ArrowUpRight } from 'lucide-react';

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

  const getThemeStyles = () => {
    switch (theme) {
      case 'emerald':
        return {
          iconBg: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
          accent: 'from-emerald-500/10 to-transparent',
        };
      case 'indigo':
        return {
          iconBg: 'bg-indigo-50 text-indigo-600 border border-indigo-100',
          accent: 'from-indigo-500/10 to-transparent',
        };
      case 'amber':
        return {
          iconBg: 'bg-amber-50 text-amber-600 border border-amber-100',
          accent: 'from-amber-500/10 to-transparent',
        };
      default:
        return {
          iconBg: 'bg-blue-50 text-blue-600 border border-blue-100',
          accent: 'from-blue-500/10 to-transparent',
        };
    }
  };

  const styles = getThemeStyles();
  const isPositive = change !== undefined ? change >= 0 : value >= 0;

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all duration-200 relative overflow-hidden group">
      {/* Background Accent Glow */}
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${styles.accent} rounded-bl-full pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity`} />

      <div className="relative flex flex-col justify-between h-full space-y-3">
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 tracking-wide">
            {title}
          </span>
          <div className={`p-2 rounded-xl ${styles.iconBg} transition-transform group-hover:scale-105`}>
            {icon === 'trending' ? (
              <TrendingUp className="w-4 h-4" />
            ) : icon === 'percent' ? (
              <Percent className="w-4 h-4" />
            ) : (
              <Wallet className="w-4 h-4" />
            )}
          </div>
        </div>

        {/* Main Value Display */}
        <div className="space-y-1">
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900 font-sans">
              {formatValue(value)}
            </span>
          </div>

          {/* Subtitle & Trend Micro-Badge */}
          <div className="flex items-center justify-between pt-1">
            {subtitle && (
              <span className="text-[11px] text-slate-400 font-medium truncate max-w-[170px]">
                {subtitle}
              </span>
            )}

            {change !== undefined && (
              <div className={`inline-flex items-center space-x-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                isPositive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60' : 'bg-rose-50 text-rose-700 border border-rose-200/60'
              }`}>
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
