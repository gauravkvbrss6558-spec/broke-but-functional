export type Category =
  | 'Food'
  | 'Transport'
  | 'Education'
  | 'Shopping'
  | 'Bills'
  | 'Health'
  | 'Entertainment'
  | 'Other';

export const CATEGORIES: Category[] = [
  'Food',
  'Transport',
  'Education',
  'Shopping',
  'Bills',
  'Health',
  'Entertainment',
  'Other',
];

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: Category;
  description: string;
  date: string;
  isDemo?: boolean;
}

export interface Commitment {
  id: string;
  name: string;
  amount: number;
  dueDay: number;
  category: Category;
  paid: boolean;
  isDemo?: boolean;
}

export interface Subscription {
  id: string;
  name: string;
  amount: number;
  dueDay: number;
  paid: boolean;
  isDemo?: boolean;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadlineDay: number;
  isDemo?: boolean;
}

export interface FinanceState {
  startDate: string;
  startingBudget: number;
  transactions: Transaction[];
  commitments: Commitment[];
  subscriptions: Subscription[];
  savingsGoals: SavingsGoal[];
  hasSeenIntro: boolean;
}

export type RiskLevel = 'Low' | 'Moderate' | 'High';

export interface FinanceMetrics {
  currentBalance: number;
  totalIncome: number;
  totalExpenses: number;
  totalSavings: number;
  committedAmount: number;
  spendableBalance: number;
  daysElapsed: number;
  daysRemaining: number;
  safeDailyAllowance: number;
  projectedEndBalance: number;
  healthScore: number;
  riskLevel: RiskLevel;
  riskReasons: string[];
  riskNextSteps: string[];
  budgetUsagePercent: number;
  totalSavingsTarget: number;
  savingsProgressPercent: number;
}

export interface ForecastPoint {
  day: number;
  label: string;
  balance: number;
  isActual: boolean;
  hasCommitment: boolean;
  commitmentLabel?: string;
}

export interface SimDecision {
  type: 'expense' | 'savings';
  amount: number;
  category: Category;
  description: string;
  savingsGoalId?: string;
}

export interface SimResult {
  current: FinanceMetrics;
  projected: FinanceMetrics;
  deltas: {
    balance: number;
    dailyAllowance: number;
    projectedEnd: number;
    healthScore: number;
    savingsProgress: number;
    riskChanged: boolean;
  };
  canAfford: boolean;
  explanation: string[];
}
