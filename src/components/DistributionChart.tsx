/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion } from 'motion/react';
import { Holding, HoldingCategory } from '../types';
import { CATEGORY_DETAILS } from '../data';
import { PieChart, List, TrendingUp, Info } from 'lucide-react';

interface DistributionChartProps {
  holdings: Holding[];
}

export default function DistributionChart({ holdings }: DistributionChartProps) {
  const [hoveredCategory, setHoveredCategory] = useState<HoldingCategory | null>(null);
  const [viewType, setViewType] = useState<'chart' | 'grid'>('chart');

  // Group holdings by category
  const categoryTotals = holdings.reduce<Record<HoldingCategory, { valuation: number; invested: number }>>(
    (acc, holding) => {
      if (!acc[holding.category]) {
        acc[holding.category] = { valuation: 0, invested: 0 };
      }
      acc[holding.category].valuation += holding.currentValuation;
      acc[holding.category].invested += holding.investedAmount;
      return acc;
    },
    {} as any
  );

  const totalValuation = Object.values(categoryTotals).reduce((sum, item) => sum + item.valuation, 0);

  // Convert to array and calculate allocation %
  const currentCategories = (Object.keys(CATEGORY_DETAILS) as HoldingCategory[])
    .map((catKey) => {
      const data = categoryTotals[catKey] || { valuation: 0, invested: 0 };
      const percentage = totalValuation > 0 ? (data.valuation / totalValuation) * 100 : 0;
      const profit = data.valuation - data.invested;
      const roi = data.invested > 0 ? (profit / data.invested) * 100 : 0;
      
      return {
        key: catKey,
        ...CATEGORY_DETAILS[catKey],
        valuation: data.valuation,
        invested: data.invested,
        percentage,
        profit,
        roi,
      };
    })
    .filter((cat) => cat.valuation > 0)
    .sort((a, b) => b.valuation - a.valuation);

  // SVG circular Donut Calculations
  const radius = 60;
  const strokeWidth = 14;
  const circumference = 2 * Math.PI * radius; // Approx 376.99
  
  let cumulativePercentage = 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div 
      className="bg-white border border-[#DCDAD2] rounded-none p-6 flex flex-col h-full"
      id="distribution-analyzer"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-serif text-xl font-bold text-[#1A1A1A] tracking-tight">Asset Allocation</h3>
          <p className="text-xs text-[#8C8C85] font-serif italic mt-0.5">Asset metrics sorted by weight</p>
        </div>
        
        <div className="flex border border-[#DCDAD2] rounded-none overflow-hidden">
          <button
            onClick={() => setViewType('chart')}
            className={`p-2 transition-all rounded-none cursor-pointer ${
              viewType === 'chart' 
                ? 'bg-[#1A1A1A] text-white' 
                : 'bg-white text-[#8C8C85] hover:text-[#1A1A1A]'
            }`}
            title="Chart View"
          >
            <PieChart className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setViewType('grid')}
            className={`p-2 transition-all rounded-none cursor-pointer border-l border-[#DCDAD2] ${
              viewType === 'grid' 
                ? 'bg-[#1A1A1A] text-white' 
                : 'bg-white text-[#8C8C85] hover:text-[#1A1A1A]'
            }`}
            title="Details View"
          >
            <List className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {currentCategories.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-12 text-center">
          <div className="p-3 bg-[#F9F8F6] border border-[#DCDAD2] rounded-none text-[#8C8C85] mb-3">
            <Info className="w-5 h-5" />
          </div>
          <p className="text-sm font-medium text-[#1A1A1A]">No assets tracked yet</p>
          <p className="text-xs text-[#8C8C85] max-w-xs mt-1.5 leading-relaxed font-serif italic">
            Create an investment or savings holding and deposit funds to see your asset distribution.
          </p>
        </div>
      ) : (
        <div className="flex-1 flex flex-col lg:flex-row items-center justify-center lg:space-x-8 space-y-6 lg:space-y-0">
          
          {/* Chart Graphic panel */}
          {viewType === 'chart' && (
            <div className="relative flex items-center justify-center w-48 h-48">
              <svg 
                className="w-full h-full transform -rotate-90 select-none"
                viewBox="0 0 160 160"
              >
                {/* Background base Ring */}
                <circle
                  cx="80"
                  cy="80"
                  r={radius}
                  fill="transparent"
                  stroke="#F3F1EC"
                  strokeWidth={strokeWidth}
                />

                {currentCategories.map((cat) => {
                  const strokeLength = (cat.percentage / 100) * circumference;
                  const strokeOffset = circumference - ((cumulativePercentage / 100) * circumference);
                  
                  // Update cumulative percentage for next segment
                  cumulativePercentage += cat.percentage;

                  const isHovered = hoveredCategory === cat.key;

                  return (
                    <circle
                      key={cat.key}
                      cx="80"
                      cy="80"
                      r={radius}
                      fill="transparent"
                      stroke={cat.color}
                      strokeWidth={isHovered ? strokeWidth + 3 : strokeWidth}
                      strokeDasharray={`${strokeLength} ${circumference - strokeLength}`}
                      strokeDashoffset={strokeOffset}
                      strokeLinecap="butt"
                      className="cursor-pointer transition-all duration-300 origin-center"
                      style={{
                        transformOrigin: '50% 50%',
                        opacity: hoveredCategory && !isHovered ? 0.35 : 1,
                      }}
                      onMouseEnter={() => setHoveredCategory(cat.key)}
                      onMouseLeave={() => setHoveredCategory(null)}
                    />
                  );
                })}
              </svg>

              {/* Central Information Widget */}
              <div className="absolute flex flex-col items-center justify-center text-center px-4">
                <span className="text-[9px] font-bold text-[#8C8C85] tracking-widest uppercase">
                  {hoveredCategory 
                    ? currentCategories.find((c) => c.key === hoveredCategory)?.label 
                    : 'Total Valuation'}
                </span>
                <span className="text-lg font-serif text-[#1A1A1A] mt-1 pr-1 truncate max-w-[120px]">
                  {hoveredCategory
                    ? formatCurrency(currentCategories.find((c) => c.key === hoveredCategory)?.valuation || 0)
                    : formatCurrency(totalValuation)}
                </span>
                <span className="text-[10px] uppercase font-bold text-[#6B6B66] tracking-wide mt-0.5">
                  {hoveredCategory
                    ? `${(currentCategories.find((c) => c.key === hoveredCategory)?.percentage || 0).toFixed(1)}%`
                    : '100%'}
                </span>
              </div>
            </div>
          )}

          {/* Allocation Breakdown Rows */}
          <div className="flex-1 w-full space-y-2 max-h-[240px] overflow-y-auto pr-1">
            {currentCategories.map((cat) => {
              const isHovered = hoveredCategory === cat.key;
              const isPositive = cat.roi >= 0;

              return (
                <div
                  key={cat.key}
                  onMouseEnter={() => setHoveredCategory(cat.key)}
                  onMouseLeave={() => setHoveredCategory(null)}
                  className={`flex items-center justify-between p-2.5 rounded-none border border-transparent transition-all ${
                    isHovered ? 'bg-[#F9F8F6] border-[#DCDAD2]' : 'hover:bg-[#F9F8F6]/40'
                  }`}
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <span 
                      className="w-3.5 h-3 rounded-none flex-shrink-0 transition-transform border border-[#1A1A1A]/10" 
                      style={{ 
                        backgroundColor: cat.color,
                        transform: isHovered ? 'scale(1.15)' : 'scale(1)'
                      }} 
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#1A1A1A] truncate">{cat.label}</p>
                      {viewType === 'grid' ? (
                        <p className="text-[10px] text-[#8C8C85] font-serif italic">
                          Invested: {formatCurrency(cat.invested)}
                        </p>
                      ) : (
                        <p className="text-[10px] text-[#8C8C85] font-serif italic">
                          {cat.percentage.toFixed(1)}% weight
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <p className="text-xs font-bold text-[#1A1A1A] font-serif">
                      {formatCurrency(cat.valuation)}
                    </p>
                    {viewType === 'grid' ? (
                      <span className={`inline-flex items-center text-[10px] font-serif italic ${
                        isPositive ? 'text-emerald-700' : 'text-rose-700'
                      }`}>
                        <TrendingUp className="w-2.5 h-2.5 mr-0.5" />
                        {isPositive ? '+' : ''}{cat.roi.toFixed(1)}%
                      </span>
                    ) : (
                      <span className={`text-[10px] font-serif italic ${isPositive ? 'text-emerald-700' : 'text-rose-700'}`}>
                        {isPositive ? '+' : ''}{formatCurrency(cat.profit)}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
