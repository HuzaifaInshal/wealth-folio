"use client";

import { useState } from "react";
import type { InfoUpdateField, PoolKind, TimelineActionType } from "../types";
import { useWealthStore } from "../use-wealth-store";

export function useFlowForms(flowId: string, firstPoolId: string, secondPoolId: string) {
  const { addEvent, addPool, transfer } = useWealthStore();

  // --- timeline form ---
  const [actionType, setActionType] = useState<TimelineActionType>("cash_in");
  const [poolId, setPoolId] = useState(firstPoolId);
  const [amount, setAmount] = useState(500);
  const [field, setField] = useState<InfoUpdateField>("portfolioValue");
  const [newValue, setNewValue] = useState(0);
  const [note, setNote] = useState("");

  function submitAction(e: React.FormEvent) {
    e.preventDefault();
    if (!poolId) return;
    addEvent({
      flowId,
      poolId,
      type: actionType,
      amount: actionType !== "info_update" ? amount : undefined,
      field: actionType === "info_update" ? field : undefined,
      newValue: actionType === "info_update" ? newValue : undefined,
      note,
    });
    setNote("");
  }

  // --- add pool form ---
  const [poolName, setPoolName] = useState("");
  const [poolKind, setPoolKind] = useState<PoolKind>("investment");
  const [openingAmount, setOpeningAmount] = useState(1000);
  const [poolNotes, setPoolNotes] = useState("");

  function submitPool(e: React.FormEvent) {
    e.preventDefault();
    if (!poolName.trim()) return;
    addPool({ flowId, name: poolName.trim(), kind: poolKind, openingAmount, notes: poolNotes || "Added from flow workspace." });
    setPoolName("");
    setPoolNotes("");
  }

  // --- transfer form ---
  const [transferFrom, setTransferFrom] = useState(firstPoolId);
  const [transferTo, setTransferTo] = useState(secondPoolId);
  const [transferAmount, setTransferAmount] = useState(250);
  const [transferNote, setTransferNote] = useState("");

  function submitTransfer(e: React.FormEvent) {
    e.preventDefault();
    if (!transferFrom || !transferTo || transferFrom === transferTo) return;
    transfer({ flowId, fromPoolId: transferFrom, toPoolId: transferTo, amount: transferAmount, note: transferNote || "Internal pool transfer." });
    setTransferNote("");
  }

  return {
    timeline: { actionType, setActionType, poolId, setPoolId, amount, setAmount, field, setField, newValue, setNewValue, note, setNote, submitAction },
    pool: { poolName, setPoolName, poolKind, setPoolKind, openingAmount, setOpeningAmount, poolNotes, setPoolNotes, submitPool },
    transferForm: { transferFrom, setTransferFrom, transferTo, setTransferTo, transferAmount, setTransferAmount, transferNote, setTransferNote, submitTransfer },
  };
}
