import type {
  FinanceState,
  FinanceMetrics,
  ForecastPoint,
  RiskLevel,
  SimDecision,
  SimResult,
  Transaction,
} from '@/types';
import { formatCurrency, uid, todayISO } from './format';

// Days since the budget cycle started, clamped to the 30-day window.
// Shared by computeMetrics and computeForecast so both agree on "today."
function getDaysElapsed(startDate: string): number {
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const diffMs = now.getTime() - start.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return Math.max(0, Math.min(30, diffDays));
}

export function computeMetrics(state: FinanceState): FinanceMetrics {
  const daysElapsed = getDaysElapsed(state.startDate);
  const daysRemaining = Math.max(1, 30 - daysElapsed);

  const totalIncome = state.transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalSavings = state.savingsGoals.reduce(
    (sum, g) => sum + g.currentAmount,
    0
  );

  const totalExpenses = state.transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const unpaidCommitments = state.commitments
    .filter((c) => !c.paid)
    .reduce((sum, c) => sum + c.amount, 0);

  const unpaidSubscriptions = state.subscriptions
    .filter((s) => !s.paid)
    .reduce((sum, s) => sum + s.amount, 0);

  const committedAmount = unpaidCommitments + unpaidSubscriptions;

  // Balance = starting budget + income - expenses.
  // Savings contributions are NOT subtracted here — they stay in the user's
  // balance but are tracked separately as progress toward goals.
  const currentBalance =
    state.startingBudget + totalIncome - totalExpenses;

  // Spendable = what's left after ring-fencing unpaid obligations.
  // This is the number the user can actually spend without missing a bill.
  const spendableBalance = currentBalance - committedAmount;

  const safeDailyAllowance = Math.max(0, spendableBalance / daysRemaining);

  const totalSavingsTarget = state.savingsGoals.reduce(
    (sum, g) => sum + g.targetAmount,
    0
  );

  const savingsProgressPercent =
    totalSavingsTarget > 0
      ? Math.min(100, (totalSavings / totalSavingsTarget) * 100)
      : 0;

  // Month-end projection assumes no new transactions beyond today.
  // Only unpaid commitments/subscriptions reduce the forward balance.
  const projectedEndBalance =
    currentBalance - committedAmount;

  const budgetUsagePercent = Math.min(
    100,
    (totalExpenses / state.startingBudget) * 100
  );

  // Health score (0-100): weighted sum of four factors.
  // Factor weights are deliberately transparent and shown in the UI.
  let healthScore = 0;

  // Factor 1: Budget remaining (0-35 points)
  const budgetRemainingRatio = Math.max(0, currentBalance / state.startingBudget);
  healthScore += budgetRemainingRatio * 35;

  // Factor 2: Committed obligations coverage (0-25 points)
  const canCoverCommitments = currentBalance >= committedAmount;
  if (canCoverCommitments) {
    const surplusAfterCommitments = currentBalance - committedAmount;
    const surplusRatio = Math.min(1, surplusAfterCommitments / (state.startingBudget * 0.3));
    healthScore += surplusRatio * 25;
  }
  // else 0 points for this factor

  // Factor 3: Savings progress (0-20 points)
  healthScore += (savingsProgressPercent / 100) * 20;

  // Factor 4: Projected end balance (0-20 points)
  if (projectedEndBalance > 0) {
    const endRatio = Math.min(1, projectedEndBalance / (state.startingBudget * 0.2));
    healthScore += endRatio * 20;
  }

  healthScore = Math.round(Math.max(0, Math.min(100, healthScore)));

  // Risk level determination
  const { riskLevel, riskReasons, riskNextSteps } = computeRisk(
    currentBalance,
    committedAmount,
    spendableBalance,
    projectedEndBalance,
    safeDailyAllowance,
    daysRemaining,
    savingsProgressPercent,
    healthScore
  );

  return {
    currentBalance,
    totalIncome,
    totalExpenses,
    totalSavings,
    committedAmount,
    spendableBalance,
    daysElapsed,
    daysRemaining,
    safeDailyAllowance,
    projectedEndBalance,
    healthScore,
    riskLevel,
    riskReasons,
    riskNextSteps,
    budgetUsagePercent,
    totalSavingsTarget,
    savingsProgressPercent,
  };
}

function computeRisk(
  balance: number,
  committed: number,
  spendable: number,
  projectedEnd: number,
  dailyAllowance: number,
  daysRemaining: number,
  savingsProgress: number,
  healthScore: number
): {
  riskLevel: RiskLevel;
  riskReasons: string[];
  riskNextSteps: string[];
} {
  const reasons: string[] = [];
  const nextSteps: string[] = [];

  if (balance < committed) {
    reasons.push(
      `Your balance (${formatCurrency(balance)}) cannot cover upcoming commitments (${formatCurrency(committed)}).`
    );
    nextSteps.push('Prioritise paying essential commitments first and cut discretionary spending entirely.');
  }

  if (spendable < 0) {
    reasons.push(
      `After commitments, you have ${formatCurrency(spendable)} left — that's a shortfall.`
    );
    nextSteps.push('You need additional income or must reduce a commitment to stay solvent.');
  }

  if (dailyAllowance < 100 && daysRemaining > 1) {
    reasons.push(
      `Your safe daily allowance is only ${formatCurrency(dailyAllowance)}/day for the remaining ${daysRemaining} days.`
    );
    nextSteps.push('Try to keep daily spending under ' + formatCurrency(Math.max(50, dailyAllowance)) + ' to avoid running out.');
  }

  if (projectedEnd < 0) {
    reasons.push(
      `You're projected to end the month ${formatCurrency(Math.abs(projectedEnd))} in the red.`
    );
    nextSteps.push('Reduce non-essential expenses or find a small income source to break even.');
  }

  if (savingsProgress < 30 && daysRemaining < 15) {
    reasons.push(
      `Savings goals are only ${Math.round(savingsProgress)}% funded with ${daysRemaining} days left.`
    );
    nextSteps.push('Automate a small daily contribution to stay on track with your savings target.');
  }

  let riskLevel: RiskLevel;
  if (reasons.length === 0 && healthScore >= 70) {
    riskLevel = 'Low';
    reasons.push('Your finances are on track. Balance covers all commitments with room to spare.');
    nextSteps.push("Keep your daily spending around " + formatCurrency(dailyAllowance) + " and you'll finish the month comfortably.");
  } else if (reasons.length <= 2 && healthScore >= 40) {
    riskLevel = 'Moderate';
    if (reasons.length === 0) {
      reasons.push("You're managing but have limited buffer — careful spending is needed.");
    }
    if (nextSteps.length === 0) {
      nextSteps.push('Monitor your daily spending and avoid large unplanned purchases.');
    }
  } else {
    riskLevel = 'High';
    if (reasons.length === 0) {
      reasons.push('Multiple financial pressures are straining your budget.');
    }
    if (nextSteps.length === 0) {
      nextSteps.push('Cut all non-essential spending and focus on essentials until your balance recovers.');
    }
  }

  return { riskLevel, riskReasons: reasons, riskNextSteps: nextSteps };
}

export function computeForecast(state: FinanceState): ForecastPoint[] {
  const daysElapsed = getDaysElapsed(state.startDate);
  const points: ForecastPoint[] = [];

  // Reuse the same balance formula as computeMetrics so forecast and
  // dashboard always agree on the starting point.
  const totalIncome = state.transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = state.transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const baseBalance =
    state.startingBudget + totalIncome - totalExpenses;

  // Build a map of day -> total deduction amount + label for upcoming
  // commitments and subscriptions that fall after today.
  const futureDeductions: Record<number, { amount: number; label: string }> = {};
  for (const c of state.commitments) {
    if (!c.paid && c.dueDay > daysElapsed) {
      futureDeductions[c.dueDay] = {
        amount: (futureDeductions[c.dueDay]?.amount || 0) + c.amount,
        label: c.name,
      };
    }
  }
  for (const s of state.subscriptions) {
    if (!s.paid && s.dueDay > daysElapsed) {
      futureDeductions[s.dueDay] = {
        amount: (futureDeductions[s.dueDay]?.amount || 0) + s.amount,
        label: s.name,
      };
    }
  }

  let runningBalance = baseBalance;
  for (let day = 1; day <= 30; day++) {
    const isActual = day <= daysElapsed;
    if (!isActual) {
      const deduction = futureDeductions[day];
      if (deduction) {
        runningBalance -= deduction.amount;
      }
    }

    points.push({
      day,
      label: `Day ${day}`,
      balance: Math.round(runningBalance),
      isActual,
      hasCommitment: !!futureDeductions[day],
      commitmentLabel: futureDeductions[day]?.label,
    });
  }

  return points;
}

export function applyDecisionToState(
  state: FinanceState,
  decision: SimDecision
): FinanceState {
  const newState: FinanceState = JSON.parse(JSON.stringify(state));

  if (decision.type === 'expense') {
    const tx: Transaction = {
      id: uid(),
      type: 'expense',
      amount: decision.amount,
      category: decision.category,
      description: decision.description,
      date: todayISO(),
    };
    newState.transactions.push(tx);
  } else if (decision.type === 'savings' && decision.savingsGoalId) {
    const goal = newState.savingsGoals.find((g) => g.id === decision.savingsGoalId);
    if (goal) {
      goal.currentAmount = Math.min(goal.targetAmount, goal.currentAmount + decision.amount);
    }
  }

  return newState;
}

export function simulateDecision(
  state: FinanceState,
  decision: SimDecision
): SimResult {
  const current = computeMetrics(state);
  const projectedState = applyDecisionToState(state, decision);
  const projected = computeMetrics(projectedState);

  const canAfford = decision.type === 'savings' || projected.currentBalance >= 0;

  const deltas = {
    balance: projected.currentBalance - current.currentBalance,
    dailyAllowance: projected.safeDailyAllowance - current.safeDailyAllowance,
    projectedEnd: projected.projectedEndBalance - current.projectedEndBalance,
    healthScore: projected.healthScore - current.healthScore,
    savingsProgress: projected.savingsProgressPercent - current.savingsProgressPercent,
    riskChanged: projected.riskLevel !== current.riskLevel,
  };

  const explanation: string[] = [];

  if (decision.type === 'expense') {
    explanation.push(
      `Spending ${formatCurrency(decision.amount)} on ${decision.category.toLowerCase()} will reduce your balance from ${formatCurrency(current.currentBalance)} to ${formatCurrency(projected.currentBalance)}.`
    );

    explanation.push(
      `Your safe daily allowance will ${deltas.dailyAllowance < 0 ? 'drop' : 'change'} from ${formatCurrency(current.safeDailyAllowance)}/day to ${formatCurrency(projected.safeDailyAllowance)}/day.`
    );

    explanation.push(
      `Projected month-end balance: ${formatCurrency(projected.projectedEndBalance)} (was ${formatCurrency(current.projectedEndBalance)}).`
    );

    if (deltas.healthScore < 0) {
      explanation.push(
        `Financial health score drops by ${Math.abs(deltas.healthScore)} points to ${projected.healthScore}/100.`
      );
    } else if (deltas.healthScore > 0) {
      explanation.push(
        `Financial health score improves by ${deltas.healthScore} points to ${projected.healthScore}/100.`
      );
    }

    if (riskChangedMessage(current.riskLevel, projected.riskLevel)) {
      explanation.push(riskChangedMessage(current.riskLevel, projected.riskLevel)!);
    }

    if (!canAfford) {
      explanation.push(
        `Warning: This purchase exceeds your available balance. Consider a smaller amount or delay this expense.`
      );
    }

    if (projected.projectedEndBalance < 0) {
      explanation.push(
        `After this purchase, you'll end the month ${formatCurrency(Math.abs(projected.projectedEndBalance))} short. Your savings target may be at risk.`
      );
    }
  } else {
    explanation.push(
      `Saving ${formatCurrency(decision.amount)} toward your goal brings your savings from ${formatCurrency(current.totalSavings)} to ${formatCurrency(projected.totalSavings)}.`
    );
    explanation.push(
      `This contribution is earmarked for your goal — it stays in your balance (${formatCurrency(projected.currentBalance)}) but is tracked separately as savings, not spent.`
    );
    explanation.push(
      `Savings progress moves from ${Math.round(current.savingsProgressPercent)}% to ${Math.round(projected.savingsProgressPercent)}%.`
    );
    if (deltas.healthScore > 0) {
      explanation.push(
        `Financial health score improves by ${deltas.healthScore} points to ${projected.healthScore}/100.`
      );
    }
  }

  return {
    current,
    projected,
    deltas,
    canAfford,
    explanation,
  };
}

function riskChangedMessage(
  current: RiskLevel,
  projected: RiskLevel
): string | null {
  const order = { Low: 0, Moderate: 1, High: 2 };
  const cur = order[current];
  const proj = order[projected];
  if (proj > cur) {
    return `Risk level increases from ${current} to ${projected}.`;
  } else if (proj < cur) {
    return `Risk level improves from ${current} to ${projected}.`;
  }
  return null;
}


