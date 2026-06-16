export type ActionType = 'cash-in' | 'cash-out' | 'info-update';

export type InfoUpdateField = 'invested_capital' | 'current_value';

export interface Action {
  id: string;
  type: ActionType;
  amount: number;
  timestamp: string;
  poolId: string;
  field?: InfoUpdateField; // Only for info-update
  note?: string;
}

export interface Pool {
  id: string;
  name: string;
  investedCapital: number;
  currentValue: number;
  flowId: string;
  color?: string;
}

export interface Transfer {
  id: string;
  fromPoolId: string;
  toPoolId: string;
  amount: number;
  timestamp: string;
}

export interface Flow {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  pools: Pool[];
  actions: Action[];
  transfers: Transfer[];
  nodes: any[]; // React Flow nodes
  edges: any[]; // React Flow edges
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  currency: string;
}
