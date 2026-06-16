"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { appConfig } from "./config";
import { demoData } from "./demo-data";
import type {
  InfoUpdateField,
  Pool,
  PoolKind,
  TimelineActionType,
  TimelineEvent,
  Transfer,
  UserProfile,
  WealthData,
  WealthFlow,
} from "./types";

type AddEventInput = {
  flowId: string;
  poolId: string;
  type: TimelineActionType;
  amount?: number;
  field?: InfoUpdateField;
  newValue?: number;
  note: string;
};

type AddPoolInput = {
  flowId: string;
  name: string;
  kind: PoolKind;
  openingAmount: number;
  notes: string;
};

type TransferInput = {
  flowId: string;
  fromPoolId: string;
  toPoolId: string;
  amount: number;
  note: string;
};

type WealthStore = {
  data: WealthData;
  backend: typeof appConfig.dataBackend;
  updateProfile: (profile: UserProfile) => void;
  addFlow: (flow: Omit<WealthFlow, "id">) => void;
  addPool: (pool: AddPoolInput) => void;
  addEvent: (event: AddEventInput) => void;
  transfer: (transfer: TransferInput) => void;
};

const WealthStoreContext = createContext<WealthStore | null>(null);

const id = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;

function applyEvent(pool: Pool, event: AddEventInput): Pool {
  if (event.type === "cash_in") {
    const amount = event.amount ?? 0;
    return {
      ...pool,
      netContributions: pool.netContributions + amount,
      portfolioValue: pool.portfolioValue + amount,
    };
  }

  if (event.type === "cash_out") {
    const amount = event.amount ?? 0;
    return {
      ...pool,
      netContributions: Math.max(0, pool.netContributions - amount),
      portfolioValue: Math.max(0, pool.portfolioValue - amount),
    };
  }

  if (event.field === "portfolioValue") {
    return { ...pool, portfolioValue: event.newValue ?? pool.portfolioValue };
  }

  if (event.field === "netContributions") {
    return { ...pool, netContributions: event.newValue ?? pool.netContributions };
  }

  return pool;
}

export function WealthStoreProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<WealthData>(demoData);

  const updateProfile = useCallback((profile: UserProfile) => {
    setData((current) => ({ ...current, profile }));
  }, []);

  const addFlow = useCallback((flow: Omit<WealthFlow, "id">) => {
    setData((current) => ({
      ...current,
      flows: [...current.flows, { ...flow, id: id("flow") }],
    }));
  }, []);

  const addPool = useCallback((pool: AddPoolInput) => {
    const newPool: Pool = {
      id: id("pool"),
      flowId: pool.flowId,
      name: pool.name,
      kind: pool.kind,
      netContributions: pool.openingAmount,
      portfolioValue: pool.openingAmount,
      notes: pool.notes,
    };

    setData((current) => ({
      ...current,
      pools: [...current.pools, newPool],
    }));
  }, []);

  const addEvent = useCallback((event: AddEventInput) => {
    const timelineEvent: TimelineEvent = {
      ...event,
      id: id("event"),
      happenedAt: new Date().toISOString().slice(0, 10),
    };

    setData((current) => ({
      ...current,
      pools: current.pools.map((pool) => (pool.id === event.poolId ? applyEvent(pool, event) : pool)),
      events: [timelineEvent, ...current.events],
    }));
  }, []);

  const transfer = useCallback((input: TransferInput) => {
    const transferEvent: Transfer = {
      ...input,
      id: id("transfer"),
      happenedAt: new Date().toISOString().slice(0, 10),
    };

    setData((current) => ({
      ...current,
      pools: current.pools.map((pool) => {
        if (pool.id === input.fromPoolId) {
          return {
            ...pool,
            netContributions: Math.max(0, pool.netContributions - input.amount),
            portfolioValue: Math.max(0, pool.portfolioValue - input.amount),
          };
        }

        if (pool.id === input.toPoolId) {
          return {
            ...pool,
            netContributions: pool.netContributions + input.amount,
            portfolioValue: pool.portfolioValue + input.amount,
          };
        }

        return pool;
      }),
      transfers: [transferEvent, ...current.transfers],
    }));
  }, []);

  const value = useMemo<WealthStore>(() => {
    if (appConfig.dataBackend === "supabase") {
      // Keep the call surface stable; wire these methods to Supabase tables when credentials are added.
      console.info("Wealth Folio is configured for Supabase. Local state is used until table queries are implemented.");
    }

    return {
      data,
      backend: appConfig.dataBackend,
      updateProfile,
      addFlow,
      addPool,
      addEvent,
      transfer,
    };
  }, [addEvent, addFlow, addPool, data, transfer, updateProfile]);

  return <WealthStoreContext.Provider value={value}>{children}</WealthStoreContext.Provider>;
}

export function useWealthStore() {
  const store = useContext(WealthStoreContext);

  if (!store) {
    throw new Error("useWealthStore must be used within WealthStoreProvider.");
  }

  return store;
}
