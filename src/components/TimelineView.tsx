'use client';

import { Flow, ActionType, InfoUpdateField } from '@/lib/types';
import { useWealthStore } from '@/lib/store';
import { useState } from 'react';
import { format } from 'date-fns';
import { 
  Plus, 
  ArrowDownLeft, 
  ArrowUpRight, 
  RefreshCw, 
  MoveHorizontal, 
  Info,
  ChevronDown,
  History as HistoryIcon
} from 'lucide-react';

export default function TimelineView({ flow }: { flow: Flow }) {
  const { addAction, addPool, addTransfer } = useWealthStore();
  const [showActionForm, setShowActionForm] = useState(false);
  const [showPoolForm, setShowPoolForm] = useState(false);
  const [showTransferForm, setShowTransferForm] = useState(false);

  // Action Form State
  const [actionType, setActionType] = useState<ActionType>('cash-in');
  const [poolId, setPoolId] = useState(flow.pools[0]?.id || '');
  const [amount, setAmount] = useState('');
  const [field, setField] = useState<InfoUpdateField>('current_value');
  const [note, setNote] = useState('');

  // Pool Form State
  const [poolName, setPoolName] = useState('');

  // Transfer Form State
  const [fromPoolId, setFromPoolId] = useState(flow.pools[0]?.id || '');
  const [toPoolId, setToPoolId] = useState(flow.pools[1]?.id || '');
  const [transferAmount, setTransferAmount] = useState('');

  const handleAddAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (poolId && amount) {
      addAction(flow.id, poolId, actionType, parseFloat(amount), field, note);
      setAmount('');
      setNote('');
      setShowActionForm(false);
    }
  };

  const handleAddPool = (e: React.FormEvent) => {
    e.preventDefault();
    if (poolName.trim()) {
      addPool(flow.id, poolName);
      setPoolName('');
      setShowPoolForm(false);
    }
  };

  const handleAddTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (fromPoolId && toPoolId && transferAmount) {
      addTransfer(flow.id, fromPoolId, toPoolId, parseFloat(transferAmount));
      setTransferAmount('');
      setShowTransferForm(false);
    }
  };

  const sortedActions = [...flow.actions].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <div className="flex flex-col h-full lg:flex-row">
      {/* Sidebar - Forms */}
      <div className="w-full lg:w-80 border-b lg:border-b-0 lg:border-r border-slate-200 p-6 space-y-4 bg-slate-50/50">
        <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
          <ChevronDown className="w-4 h-4" />
          Actions & Pools
        </h3>
        
        <button
          onClick={() => setShowActionForm(!showActionForm)}
          className="w-full flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg hover:border-blue-300 transition-colors shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-blue-50 text-blue-600 rounded">
              <Plus className="w-4 h-4" />
            </div>
            <span className="font-medium text-sm">Add Action</span>
          </div>
        </button>

        {showActionForm && (
          <form onSubmit={handleAddAction} className="p-4 bg-white border border-blue-100 rounded-lg space-y-3 shadow-sm animate-in fade-in slide-in-from-top-2">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Type</label>
              <select 
                value={actionType}
                onChange={(e) => setActionType(e.target.value as ActionType)}
                className="w-full text-sm border border-slate-200 rounded p-2 outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="cash-in">Cash In (+)</option>
                <option value="cash-out">Cash Out (-)</option>
                <option value="info-update">Info Update</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Pool</label>
              <select 
                value={poolId}
                onChange={(e) => setPoolId(e.target.value)}
                className="w-full text-sm border border-slate-200 rounded p-2 outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="" disabled>Select Pool</option>
                {flow.pools.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            {actionType === 'info-update' && (
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Field to Update</label>
                <select 
                  value={field}
                  onChange={(e) => setField(e.target.value as InfoUpdateField)}
                  className="w-full text-sm border border-slate-200 rounded p-2 outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="current_value">Actual Amount (Current Value)</option>
                  <option value="invested_capital">Overall Amount (Invested Capital)</option>
                </select>
              </div>
            )}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Amount</label>
              <input 
                type="number"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full text-sm border border-slate-200 rounded p-2 outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Note (Optional)</label>
              <input 
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. Dividend payment"
                className="w-full text-sm border border-slate-200 rounded p-2 outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <button type="submit" className="w-full bg-blue-600 text-white text-sm font-bold py-2 rounded hover:bg-blue-700 transition-colors">
              Submit
            </button>
          </form>
        )}

        <button
          onClick={() => setShowTransferForm(!showTransferForm)}
          className="w-full flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg hover:border-indigo-300 transition-colors shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded">
              <MoveHorizontal className="w-4 h-4" />
            </div>
            <span className="font-medium text-sm">Transfer Amount</span>
          </div>
        </button>

        {showTransferForm && (
          <form onSubmit={handleAddTransfer} className="p-4 bg-white border border-indigo-100 rounded-lg space-y-3 shadow-sm animate-in fade-in slide-in-from-top-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">From</label>
                <select 
                  value={fromPoolId}
                  onChange={(e) => setFromPoolId(e.target.value)}
                  className="w-full text-sm border border-slate-200 rounded p-2 outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  {flow.pools.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">To</label>
                <select 
                  value={toPoolId}
                  onChange={(e) => setToPoolId(e.target.value)}
                  className="w-full text-sm border border-slate-200 rounded p-2 outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  {flow.pools.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Amount</label>
              <input 
                type="number"
                required
                value={transferAmount}
                onChange={(e) => setTransferAmount(e.target.value)}
                placeholder="0.00"
                className="w-full text-sm border border-slate-200 rounded p-2 outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <button type="submit" className="w-full bg-indigo-600 text-white text-sm font-bold py-2 rounded hover:bg-indigo-700 transition-colors">
              Confirm Transfer
            </button>
          </form>
        )}

        <button
          onClick={() => setShowPoolForm(!showPoolForm)}
          className="w-full flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg hover:border-green-300 transition-colors shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-green-50 text-green-600 rounded">
              <Plus className="w-4 h-4" />
            </div>
            <span className="font-medium text-sm">Create New Pool</span>
          </div>
        </button>

        {showPoolForm && (
          <form onSubmit={handleAddPool} className="p-4 bg-white border border-green-100 rounded-lg space-y-3 shadow-sm animate-in fade-in slide-in-from-top-2">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Pool Name</label>
              <input 
                type="text"
                required
                value={poolName}
                onChange={(e) => setPoolName(e.target.value)}
                placeholder="e.g. Robinhood Account"
                className="w-full text-sm border border-slate-200 rounded p-2 outline-none focus:ring-1 focus:ring-green-500"
              />
            </div>
            <button type="submit" className="w-full bg-green-600 text-white text-sm font-bold py-2 rounded hover:bg-green-700 transition-colors">
              Create Pool
            </button>
          </form>
        )}
      </div>

      {/* Main Content - Timeline */}
      <div className="flex-1 p-8 overflow-y-auto max-h-[700px]">
        <h3 className="font-bold text-slate-900 mb-8 flex items-center gap-2">
          <HistoryIcon className="w-5 h-5 text-blue-600" />
          Activity History
        </h3>

        {sortedActions.length === 0 && flow.transfers.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <Info className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>No activity yet. Start by adding a pool or an action.</p>
          </div>
        ) : (
          <div className="relative border-l-2 border-slate-100 ml-4 space-y-10 pb-10">
            {sortedActions.map((action) => {
              const pool = flow.pools.find(p => p.id === action.poolId);
              return (
                <div key={action.id} className="relative pl-10">
                  <div className={`absolute -left-[11px] top-0 p-1 rounded-full border-4 border-white shadow-sm ${
                    action.type === 'cash-in' ? 'bg-green-500' :
                    action.type === 'cash-out' ? 'bg-red-500' :
                    'bg-blue-500'
                  }`}>
                    {action.type === 'cash-in' ? <ArrowDownLeft className="w-3 h-3 text-white" /> :
                     action.type === 'cash-out' ? <ArrowUpRight className="w-3 h-3 text-white" /> :
                     <RefreshCw className="w-3 h-3 text-white" />}
                  </div>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-slate-900">
                        {action.type === 'cash-in' ? 'Cash In' :
                         action.type === 'cash-out' ? 'Cash Out' :
                         `Info Update: ${action.field === 'current_value' ? 'Actual Amount' : 'Overall Amount'}`}
                        <span className="mx-2 text-slate-300">|</span>
                        <span className="text-blue-600 font-medium">{pool?.name}</span>
                      </h4>
                      {action.note && <p className="text-slate-500 text-sm mt-1">{action.note}</p>}
                      <p className="text-slate-400 text-xs mt-1">{format(new Date(action.timestamp), 'MMM d, yyyy • h:mm a')}</p>
                    </div>
                    <div className={`text-lg font-bold ${
                      action.type === 'cash-in' ? 'text-green-600' :
                      action.type === 'cash-out' ? 'text-red-600' :
                      'text-blue-600'
                    }`}>
                      {action.type === 'cash-in' ? '+' : action.type === 'cash-out' ? '-' : ''}
                      ${action.amount.toLocaleString()}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Transfers can also be shown here if needed, but actions cover most moves */}
          </div>
        )}
      </div>
    </div>
  );
}
