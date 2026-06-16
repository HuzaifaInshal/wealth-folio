export type TimelineActionType = "cash_in" | "cash_out" | "info_update";

export type PoolKind = "investment" | "savings" | "cash";

export type InfoUpdateField = "portfolioValue" | "netContributions";

export type UserProfile = {
  name: string;
  baseCurrency: string;
  targetMonthlySavings: number;
  riskStyle: "Conservative" | "Balanced" | "Growth";
};

export type Pool = {
  id: string;
  flowId: string;
  name: string;
  kind: PoolKind;
  netContributions: number;
  portfolioValue: number;
  notes: string;
};

export type TimelineEvent = {
  id: string;
  flowId: string;
  poolId: string;
  type: TimelineActionType;
  amount?: number;
  field?: InfoUpdateField;
  newValue?: number;
  note: string;
  happenedAt: string;
};

export type Transfer = {
  id: string;
  flowId: string;
  fromPoolId: string;
  toPoolId: string;
  amount: number;
  note: string;
  happenedAt: string;
};

export type WealthFlow = {
  id: string;
  name: string;
  category: "Savings" | "Stocks" | "Real Estate" | "Retirement" | "Crypto";
  description: string;
};

export type WealthData = {
  profile: UserProfile;
  flows: WealthFlow[];
  pools: Pool[];
  events: TimelineEvent[];
  transfers: Transfer[];
};
