import type { FinanceState, Transaction, Commitment, Subscription, SavingsGoal } from '@/types';
import { uid, todayISO } from './format';

export function createSeedState(): FinanceState {
  const today = new Date();
  // Seed start date as 5 days ago to have some elapsed days
  const start = new Date(today);
  start.setDate(start.getDate() - 4);

  const startDate = start.toISOString().split('T')[0];

  const d = (offset: number) => {
    const dt = new Date(start);
    dt.setDate(dt.getDate() + offset);
    return dt.toISOString().split('T')[0];
  };

  const transactions: Transaction[] = [
    {
      id: uid(),
      type: 'expense',
      amount: 250,
      category: 'Food',
      description: 'Groceries — week 1',
      date: d(1),
      isDemo: true,
    },
    {
      id: uid(),
      type: 'expense',
      amount: 120,
      category: 'Transport',
      description: 'Metro card top-up',
      date: d(2),
      isDemo: true,
    },
    {
      id: uid(),
      type: 'expense',
      amount: 80,
      category: 'Entertainment',
      description: 'Movie with friends',
      date: d(3),
      isDemo: true,
    },
    {
      id: uid(),
      type: 'expense',
      amount: 200,
      category: 'Shopping',
      description: 'Clothes for interview',
      date: d(4),
      isDemo: true,
    },
    {
      id: uid(),
      type: 'expense',
      amount: 45,
      category: 'Food',
      description: 'Lunch out',
      date: d(4),
      isDemo: true,
    },
  ];

  const commitments: Commitment[] = [
    {
      id: uid(),
      name: 'Phone bill',
      amount: 299,
      dueDay: 15,
      category: 'Bills',
      paid: false,
      isDemo: true,
    },
    {
      id: uid(),
      name: 'Course fee installment',
      amount: 1200,
      dueDay: 20,
      category: 'Education',
      paid: false,
      isDemo: true,
    },
  ];

  const subscriptions: Subscription[] = [
    {
      id: uid(),
      name: 'Music streaming',
      amount: 119,
      dueDay: 10,
      paid: false,
      isDemo: true,
    },
    {
      id: uid(),
      name: 'Cloud storage',
      amount: 75,
      dueDay: 25,
      paid: false,
      isDemo: true,
    },
  ];

  const savingsGoals: SavingsGoal[] = [
    {
      id: uid(),
      name: 'Emergency fund',
      targetAmount: 1500,
      currentAmount: 300,
      deadlineDay: 30,
      isDemo: true,
    },
  ];

  return {
    startDate,
    startingBudget: 10000,
    transactions,
    commitments,
    subscriptions,
    savingsGoals,
    hasSeenIntro: false,
  };
}

export function createEmptyState(): FinanceState {
  return {
    startDate: todayISO(),
    startingBudget: 10000,
    transactions: [],
    commitments: [],
    subscriptions: [],
    savingsGoals: [],
    hasSeenIntro: false,
  };
}
