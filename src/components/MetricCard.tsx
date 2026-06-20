/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { ArrowUpRight, ArrowDownRight, DollarSign, Wallet, TrendingUp, Percent } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: number;
  type: 'currency' | 'percent';
  change?: number; // percentage change or absolute returns
  subtitle?: string;
  theme: 'blue' | 'emerald' | 'amber' | 'indigo';
}

export default function MetricCard({ title, value, type, change, subtitle, theme }: MetricCardProps) {
  const getThemeColor = () => {
    switch (theme) {
      case 'emerald':
        return {
          bg: 'bg-emerald-50 border-emerald-100',
          iconBg: 'bg-emerald-500/10 text-emerald-600',
          accent: 'text-emerald-600',
        };
      case 'amber':
        return {
          bg: 'bg-amber-50 border-amber-100',
          iconBg: 'bg-amber-500/10 text-amber-600',
          accent: 'text-amber-600',
        };
      case 'indigo':
        return {
          bg: 'bg-indigo-50 border-indigo-100',
          iconBg: 'bg-indigo-500/10 text-indigo-600',
          accent: 'text-indigo-600',
        };
      default: // blue
        return {
          bg: 'bg-blue-50 border-blue-100',
          iconBg: 'bg-blue-500/10 text-blue-600',
          accent: 'text-blue-600',
        };
    }
  };

  const getIcon = () => {
    switch (title.toLowerCase()) {
      case 'net worth':
      case 'net value':
        return <Wallet className="w-5 h-5" />;
      case 'total invested':
        return <DollarSign className="w-5 h-5" />;
      case 'net returns':
      case 'total profit':
        return <TrendingUp className="w-5 h-5" />;
      default:
        return <Percent className="w-5 h-5" />;
    }
  };

  const colors = getThemeColor();

  const formatValue = (val: number) => {
    if (type === 'percent') {
      return `${val >= 0 ? '+' : ''}${val.toFixed(2)}%`;
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(val);
  };

  const isPositive = change !== undefined ? change >= 0 : value >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="bg-white border border-[#DCDAD2] rounded-none p-6 flex flex-col justify-between"
      id={`metric-card-${title.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-[10px] uppercase tracking-[0.25em] font-bold text-[#6B6B66]">{title}</span>
        <div className="text-[#8C8C85]">
          {getIcon()}
        </div>
      </div>

      <div>
        <h3 className="text-3xl font-serif tracking-tight text-[#1A1A1A]">
          {formatValue(value)}
        </h3>

        <div className="flex flex-wrap items-center mt-3 gap-2">
          {change !== undefined && (
            <span
              className={`inline-flex items-center text-xs font-serif italic font-bold px-1.5 py-0.5 rounded-none ${
                isPositive
                  ? 'bg-emerald-50 text-emerald-800'
                  : 'bg-rose-50 text-rose-800'
              }`}
            >
              {isPositive ? (
                <ArrowUpRight className="w-3 h-3 mr-0.5 inline" />
              ) : (
                <ArrowDownRight className="w-3 h-3 mr-0.5 inline" />
              )}
              {type === 'percent' ? '' : `${isPositive ? '+' : ''}${change.toFixed(1)}%`}
            </span>
          )}
          {subtitle && (
            <span className="text-[11px] text-[#8C8C85] tracking-tight font-medium">
              {subtitle}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
