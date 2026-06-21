/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type HoldingCategory =
  | 'cash'
  | 'stocks'
  | 'crypto'
  | 'real_estate'
  | 'retirement'
  | 'precious_metals'
  | 'bonds'
  | 'other';

export interface Pool {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  categories?: HoldingCategory[]; // tags for the pool
}

export interface Holding {
  id: string;
  poolId: string;             // Segregation parent pool ID
  name: string;
  category: HoldingCategory;
  description: string;
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
  holdingId: string;
  sourceHoldingId?: string;       // For transfers
  destinationHoldingId?: string;  // For transfers
  type: TransactionType;
  amount: number;                 // The amount transferred or deposited or withdrawn
  previousValuation?: number;     // Specifically for valuation updates
  newValuation?: number;          // Specifically for valuation updates
  note: string;
  timestamp: string;
}

export interface ValuationHistoryPoint {
  id: string;
  holdingId: string;
  value: number;
  invested: number;
  timestamp: string;
}
