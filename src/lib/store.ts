import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Flow, Pool, Action, Transfer, UserProfile, ActionType, InfoUpdateField } from './types';
import { config } from './config';

interface WealthState {
  flows: Flow[];
  profile: UserProfile;
  isLoading: boolean;
  
  // Actions
  addFlow: (name: string, description?: string) => void;
  deleteFlow: (id: string) => void;
  updateFlow: (id: string, updates: Partial<Flow>) => void;
  
  addPool: (flowId: string, name: string) => void;
  deletePool: (flowId: string, poolId: string) => void;
  
  addAction: (flowId: string, poolId: string, type: ActionType, amount: number, field?: InfoUpdateField, note?: string) => void;
  addTransfer: (flowId: string, fromPoolId: string, toPoolId: string, amount: number) => void;
  
  updateProfile: (updates: Partial<UserProfile>) => void;
}

// Initial demo data
const initialFlows: Flow[] = [
  {
    id: 'demo-flow-1',
    name: 'Stock Market Portfolio',
    description: 'Tech-heavy long term investment',
    createdAt: new Date().toISOString(),
    pools: [
      { id: 'pool-1', name: 'US Stocks', investedCapital: 5000, currentValue: 5500, flowId: 'demo-flow-1', color: '#3b82f6' },
      { id: 'pool-2', name: 'Dividend Stocks', investedCapital: 2000, currentValue: 2100, flowId: 'demo-flow-1', color: '#10b981' }
    ],
    actions: [
      { id: 'a1', type: 'cash-in', amount: 5000, timestamp: new Date().toISOString(), poolId: 'pool-1' },
      { id: 'a2', type: 'cash-in', amount: 2000, timestamp: new Date().toISOString(), poolId: 'pool-2' }
    ],
    transfers: [],
    nodes: [
      { id: 'pool-1', type: 'poolNode', position: { x: 100, y: 100 }, data: { label: 'US Stocks' } },
      { id: 'pool-2', type: 'poolNode', position: { x: 400, y: 100 }, data: { label: 'Dividend Stocks' } }
    ],
    edges: []
  }
];

export const useWealthStore = create<WealthState>()(
  persist(
    (set, get) => ({
      flows: initialFlows,
      profile: {
        id: 'user-1',
        email: 'user@example.com',
        fullName: 'Wealth Tracker',
        currency: 'USD'
      },
      isLoading: false,

      addFlow: (name, description) => {
        const newFlow: Flow = {
          id: crypto.randomUUID(),
          name,
          description,
          createdAt: new Date().toISOString(),
          pools: [],
          actions: [],
          transfers: [],
          nodes: [],
          edges: []
        };
        set((state) => ({ flows: [...state.flows, newFlow] }));
      },

      deleteFlow: (id) => {
        set((state) => ({ flows: state.flows.filter(f => f.id !== id) }));
      },

      updateFlow: (id, updates) => {
        set((state) => ({
          flows: state.flows.map(f => f.id === id ? { ...f, ...updates } : f)
        }));
      },

      addPool: (flowId, name) => {
        const poolId = crypto.randomUUID();
        const newPool: Pool = {
          id: poolId,
          name,
          investedCapital: 0,
          currentValue: 0,
          flowId
        };
        const newNode = {
          id: poolId,
          type: 'poolNode',
          position: { x: Math.random() * 400, y: Math.random() * 400 },
          data: { label: name }
        };
        
        set((state) => ({
          flows: state.flows.map(f => f.id === flowId ? {
            ...f,
            pools: [...f.pools, newPool],
            nodes: [...f.nodes, newNode]
          } : f)
        }));
      },

      deletePool: (flowId, poolId) => {
        set((state) => ({
          flows: state.flows.map(f => f.id === flowId ? {
            ...f,
            pools: f.pools.filter(p => p.id !== poolId),
            nodes: f.nodes.filter(n => n.id !== poolId),
            edges: f.edges.filter(e => e.source !== poolId && e.target !== poolId)
          } : f)
        }));
      },

      addAction: (flowId, poolId, type, amount, field, note) => {
        const action: Action = {
          id: crypto.randomUUID(),
          type,
          amount,
          timestamp: new Date().toISOString(),
          poolId,
          field,
          note
        };

        set((state) => ({
          flows: state.flows.map(f => {
            if (f.id !== flowId) return f;
            
            const updatedPools = f.pools.map(p => {
              if (p.id !== poolId) return p;
              
              if (type === 'cash-in') {
                return { ...p, investedCapital: p.investedCapital + amount, currentValue: p.currentValue + amount };
              } else if (type === 'cash-out') {
                return { ...p, investedCapital: p.investedCapital - amount, currentValue: p.currentValue - amount };
              } else if (type === 'info-update') {
                if (field === 'invested_capital') return { ...p, investedCapital: amount };
                if (field === 'current_value') return { ...p, currentValue: amount };
              }
              return p;
            });

            return {
              ...f,
              pools: updatedPools,
              actions: [...f.actions, action]
            };
          })
        }));
      },

      addTransfer: (flowId, fromPoolId, toPoolId, amount) => {
        const transfer: Transfer = {
          id: crypto.randomUUID(),
          fromPoolId,
          toPoolId,
          amount,
          timestamp: new Date().toISOString()
        };

        const edgeId = `e-${fromPoolId}-${toPoolId}`;

        set((state) => ({
          flows: state.flows.map(f => {
            if (f.id !== flowId) return f;

            const updatedPools = f.pools.map(p => {
              if (p.id === fromPoolId) {
                return { ...p, investedCapital: p.investedCapital - amount, currentValue: p.currentValue - amount };
              }
              if (p.id === toPoolId) {
                return { ...p, investedCapital: p.investedCapital + amount, currentValue: p.currentValue + amount };
              }
              return p;
            });

            const existingEdge = f.edges.find(e => e.id === edgeId);
            const newEdges = existingEdge ? f.edges : [...f.edges, {
              id: edgeId,
              source: fromPoolId,
              target: toPoolId,
              animated: true,
              label: 'Transfer'
            }];

            return {
              ...f,
              pools: updatedPools,
              transfers: [...f.transfers, transfer],
              edges: newEdges
            };
          })
        }));
      },

      updateProfile: (updates) => {
        set((state) => ({ profile: { ...state.profile, ...updates } }));
      }
    }),
    {
      name: 'wealth-folio-storage',
    }
  )
);
