/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type BuiltInCategory =
  | 'mutual_fund'
  | 'stocks'
  | 'savings_certificate'
  | 'crypto'
  | 'real_estate'
  | 'precious_metals'
  | 'cash_bank'
  | 'other';

export interface CategoryDetails {
  key: string;
  label: string;
  color: string;
  icon: string;
  bg: string;
  text: string;
}

export interface InvestmentSource {
  id: string;
  name: string;
  category: string; // Built-in key or custom string
  investedAmount: number; // Cumulative net cash invested
  currentValuation: number; // Current valuation / net market value
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type TransactionType = 'invest' | 'withdraw' | 'transfer' | 'revalue';

export interface LedgerTransaction {
  id: string;
  type: TransactionType;
  sourceId: string; // Primary investment source ID
  targetId?: string; // For 'transfer' type: target investment source ID
  amount: number;
  previousValuation?: number; // For 'revalue' type
  newValuation?: number; // For 'revalue' type
  note: string;
  timestamp: string;
  syncedToSheet?: boolean;
}

export interface GoogleSheetConfig {
  webAppUrl: string; // User's personal Google Apps Script Web App URL
  autoSync: boolean;
  lastSyncedAt?: string;
}
