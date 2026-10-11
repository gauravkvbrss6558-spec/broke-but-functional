import type { FinanceState } from '@/types';

const STORAGE_KEY = 'bbf_finance_state_v1';

export function loadState(): FinanceState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as FinanceState;
    return migrateState(parsed);
  } catch {
    return null;
  }
}

function migrateState(state: FinanceState): FinanceState {
  let dirty = false;
  const filtered = state.transactions.filter((t) => {
    if (
      t.isDemo &&
      t.type === 'income' &&
      t.amount === 10000 &&
      (t.description === 'Monthly allowance' || t.description === 'Monthly budget')
    ) {
      dirty = true;
      return false;
    }
    return true;
  });
  if (dirty) {
    state.transactions = filtered;
  }
  return state;
}

export function saveState(state: FinanceState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage might be full or unavailable; silently fail
  }
}

export function clearState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
