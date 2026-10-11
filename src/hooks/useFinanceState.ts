import { useState, useEffect, useCallback } from 'react';
import type {
  FinanceState,
  Transaction,
  Commitment,
  Subscription,
  SavingsGoal,
} from '@/types';
import { loadState, saveState, clearState } from '@/lib/storage';
import { createSeedState, createEmptyState } from '@/lib/seed';
import { uid } from '@/lib/format';

export function useFinanceState() {
  const [state, setState] = useState<FinanceState>(() => {
    const loaded = loadState();
    if (loaded) return loaded;
    return createSeedState();
  });

  useEffect(() => {
    saveState(state);
  }, [state]);

  const addTransaction = useCallback((tx: Omit<Transaction, 'id'>) => {
    setState((prev) => ({
      ...prev,
      transactions: [{ ...tx, id: uid() }, ...prev.transactions],
    }));
  }, []);

  const updateTransaction = useCallback((id: string, updates: Partial<Transaction>) => {
    setState((prev) => ({
      ...prev,
      transactions: prev.transactions.map((t) =>
        t.id === id ? { ...t, ...updates } : t
      ),
    }));
  }, []);

  const deleteTransaction = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      transactions: prev.transactions.filter((t) => t.id !== id),
    }));
  }, []);

  const addCommitment = useCallback((c: Omit<Commitment, 'id'>) => {
    setState((prev) => ({
      ...prev,
      commitments: [...prev.commitments, { ...c, id: uid() }],
    }));
  }, []);

  const toggleCommitmentPaid = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      commitments: prev.commitments.map((c) =>
        c.id === id ? { ...c, paid: !c.paid } : c
      ),
    }));
  }, []);

  const deleteCommitment = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      commitments: prev.commitments.filter((c) => c.id !== id),
    }));
  }, []);

  const addSubscription = useCallback((s: Omit<Subscription, 'id'>) => {
    setState((prev) => ({
      ...prev,
      subscriptions: [...prev.subscriptions, { ...s, id: uid() }],
    }));
  }, []);

  const toggleSubscriptionPaid = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      subscriptions: prev.subscriptions.map((s) =>
        s.id === id ? { ...s, paid: !s.paid } : s
      ),
    }));
  }, []);

  const deleteSubscription = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      subscriptions: prev.subscriptions.filter((s) => s.id !== id),
    }));
  }, []);

  const addSavingsGoal = useCallback((g: Omit<SavingsGoal, 'id'>) => {
    setState((prev) => ({
      ...prev,
      savingsGoals: [...prev.savingsGoals, { ...g, id: uid() }],
    }));
  }, []);

  const contributeToGoal = useCallback((goalId: string, amount: number) => {
    setState((prev) => ({
      ...prev,
      savingsGoals: prev.savingsGoals.map((g) =>
        g.id === goalId
          ? { ...g, currentAmount: Math.min(g.targetAmount, g.currentAmount + amount) }
          : g
      ),
    }));
  }, []);

  const deleteSavingsGoal = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      savingsGoals: prev.savingsGoals.filter((g) => g.id !== id),
    }));
  }, []);

  const markIntroSeen = useCallback(() => {
    setState((prev) => ({ ...prev, hasSeenIntro: true }));
  }, []);

  const resetAll = useCallback(() => {
    clearState();
    setState(createSeedState());
  }, []);

  const clearAll = useCallback(() => {
    clearState();
    setState(createEmptyState());
  }, []);

  return {
    state,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addCommitment,
    toggleCommitmentPaid,
    deleteCommitment,
    addSubscription,
    toggleSubscriptionPaid,
    deleteSubscription,
    addSavingsGoal,
    contributeToGoal,
    deleteSavingsGoal,
    markIntroSeen,
    resetAll,
    clearAll,
  };
}

export type FinanceActions = ReturnType<typeof useFinanceState>;
