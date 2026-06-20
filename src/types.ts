/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type PoolCategory =
  | 'cash'
  | 'stocks'
  | 'crypto'
  | 'real_estate'
  | 'retirement'
  | 'precious_metals'
  | 'bonds'
  | 'other';

export interface InvestmentPool {
  id: string;
  name: string;
  category: PoolCategory;
  description: string;
  targetAmount: number | null; // Optional target for savings goal
  investedAmount: number;     // The net cash capital injected (Deposits - Withdrawals)
  currentValuation: number;   // The latest net market value (can be direct sum or user-updated value)
  createdAt: string;
  updatedAt: string;
}

export type TransactionType =
  | 'creation'
  | 'deposit'
  | 'withdrawal'
  | 'transfer'
  | 'valuation_adjustment';

export interface Transaction {
  id: string;
  poolId: string;
  sourcePoolId?: string;       // For transfers
  destinationPoolId?: string;  // For transfers
  type: TransactionType;
  amount: number;              // The amount transferred or deposited or withdrawn
  previousValuation?: number;  // Specifically for valuation updates
  newValuation?: number;       // Specifically for valuation updates
  note: string;
  timestamp: string;
}

export interface ValuationHistoryPoint {
  id: string;
  poolId: string;
  value: number;
  invested: number;
  timestamp: string;
}
