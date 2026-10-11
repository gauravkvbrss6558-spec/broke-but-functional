import { useMemo } from 'react';
import {
  Wallet,
  TrendingDown,
  Calendar,
  Target,
  Activity,
  AlertTriangle,
  ArrowRight,
  Zap,
  Receipt,
  CircleDollarSign,
} from 'lucide-react';
import type { FinanceState, FinanceMetrics } from '@/types';
import { computeForecast } from '@/lib/calculations';
import { formatCurrency } from '@/lib/format';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { RiskBadge, DemoBadge } from '@/components/ui/Misc';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import type { ViewKey } from '@/components/Sidebar';

interface DashboardProps {
  state: FinanceState;
  metrics: FinanceMetrics;
  onNavigate: (view: ViewKey) => void;
}

export function Dashboard({ state, metrics, onNavigate }: DashboardProps) {
  const forecast = useMemo(() => computeForecast(state), [state]);

  const recentTransactions = useMemo(
    () =>
      [...state.transactions]
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, 6),
    [state.transactions]
  );

  const upcomingCommitments = useMemo(() => {
    const items = [
      ...state.commitments.filter((c) => !c.paid).map((c) => ({ ...c, kind: 'commitment' as const })),
      ...state.subscriptions.filter((s) => !s.paid).map((s) => ({ ...s, kind: 'subscription' as const })),
    ];
    return items.sort((a, b) => a.dueDay - b.dueDay).slice(0, 5);
  }, [state.commitments, state.subscriptions]);

  const healthScoreColor =
    metrics.healthScore >= 70 ? 'text-emerald-600 dark:text-emerald-400'
    : metrics.healthScore >= 40 ? 'text-amber-600 dark:text-amber-400'
    : 'text-red-600 dark:text-red-400';

  const healthBarColor =
    metrics.healthScore >= 70 ? 'emerald'
    : metrics.healthScore >= 40 ? 'amber'
    : 'red' as const;

  return (
    <div className="space-y-6">
      {/* Hero balance card */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Main balance */}
        <Card className="lg:col-span-2 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full -translate-y-16 translate-x-16" />
          <CardBody className="pt-6">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                Current Balance
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-400 dark:text-gray-500">
                <Wallet size={14} />
                Starting: {formatCurrency(state.startingBudget)}
              </span>
            </div>
            <div className="flex items-end gap-3 mb-4">
              <span className={`text-4xl font-bold tracking-tight ${metrics.currentBalance < 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
                {formatCurrency(metrics.currentBalance)}
              </span>
              {metrics.currentBalance >= 0 ? (
                <span className="text-sm text-emerald-600 dark:text-emerald-400 font-medium mb-1.5">
                  In the clear
                </span>
              ) : (
                <span className="text-sm text-red-600 dark:text-red-400 font-medium mb-1.5">
                  Overdrawn
                </span>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500 mb-0.5">
                  <TrendingDown size={12} />
                  Total Spent
                </div>
                <div className="text-sm font-bold text-gray-700 dark:text-gray-200">
                  {formatCurrency(metrics.totalExpenses)}
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500 mb-0.5">
                  <CircleDollarSign size={12} />
                  Committed
                </div>
                <div className="text-sm font-bold text-gray-700 dark:text-gray-200">
                  {formatCurrency(metrics.committedAmount)}
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500 mb-0.5">
                  <Calendar size={12} />
                  Days Left
                </div>
                <div className="text-sm font-bold text-gray-700 dark:text-gray-200">
                  {metrics.daysRemaining} / 30
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Budget Usage</span>
                  <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                    {Math.round(metrics.budgetUsagePercent)}%
                  </span>
                </div>
                <ProgressBar
                  value={metrics.budgetUsagePercent}
                  color={metrics.budgetUsagePercent > 80 ? 'red' : metrics.budgetUsagePercent > 60 ? 'amber' : 'emerald'}
                  size="md"
                />
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-gray-50 dark:border-navy-700">
                <div>
                  <span className="text-xs text-gray-400 dark:text-gray-500">Safe daily spending: </span>
                  <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(metrics.safeDailyAllowance)}/day
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-gray-400 dark:text-gray-500">Day-30 projected: </span>
                  <span className={`text-sm font-bold ${metrics.projectedEndBalance < 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-700 dark:text-gray-200'}`}>
                    {formatCurrency(metrics.projectedEndBalance)}
                  </span>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Health Score */}
        <Card hoverable onClick={() => onNavigate('health')}>
          <CardBody className="pt-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                Financial Health
              </span>
              <Activity size={16} className="text-emerald-500" />
            </div>
            <div className={`text-5xl font-bold tracking-tight ${healthScoreColor}`}>
              {metrics.healthScore}
            </div>
            <div className="text-xs text-gray-400 dark:text-gray-500 mt-1 mb-3">out of 100</div>
            <ProgressBar value={metrics.healthScore} color={healthBarColor} size="md" />
            <div className="mt-3 flex items-center justify-between">
              <RiskBadge level={metrics.riskLevel} />
              <span className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-emerald-500 transition-colors">
                Details <ArrowRight size={12} />
              </span>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Quick stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400">
              <CircleDollarSign size={16} />
            </div>
            <span className="text-xs font-semibold text-gray-400 dark:text-gray-500">Spendable</span>
          </div>
          <div className="text-lg font-bold text-gray-900 dark:text-white">
            {formatCurrency(metrics.spendableBalance)}
          </div>
          <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
            After commitments
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 rounded-lg bg-navy-100 dark:bg-navy-700 text-navy-700 dark:text-navy-300">
              <Receipt size={16} />
            </div>
            <span className="text-xs font-semibold text-gray-400 dark:text-gray-500">Transactions</span>
          </div>
          <div className="text-lg font-bold text-gray-900 dark:text-white">
            {state.transactions.length}
          </div>
          <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
            {state.transactions.filter((t) => t.type === 'expense').length} expenses,{' '}
            {state.transactions.filter((t) => t.type === 'income').length} income
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400">
              <Target size={16} />
            </div>
            <span className="text-xs font-semibold text-gray-400 dark:text-gray-500">Savings</span>
          </div>
          <div className="text-lg font-bold text-gray-900 dark:text-white">
            {formatCurrency(metrics.totalSavings)}
          </div>
          <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
            {Math.round(metrics.savingsProgressPercent)}% of {formatCurrency(metrics.totalSavingsTarget)}
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 rounded-lg bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400">
              <AlertTriangle size={16} />
            </div>
            <span className="text-xs font-semibold text-gray-400 dark:text-gray-500">Obligations</span>
          </div>
          <div className="text-lg font-bold text-gray-900 dark:text-white">
            {formatCurrency(metrics.committedAmount)}
          </div>
          <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
            {state.commitments.filter((c) => !c.paid).length + state.subscriptions.filter((s) => !s.paid).length} upcoming
          </div>
        </Card>
      </div>

      {/* Decision Simulator CTA */}
      <Card
        className="bg-gradient-to-r from-navy-900 to-navy-800 dark:from-navy-800 dark:to-navy-700 border-navy-700 dark:border-navy-600 cursor-pointer overflow-hidden relative"
        onClick={() => onNavigate('simulator')}
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full -translate-y-20 translate-x-20" />
        <CardBody className="py-5 flex items-center justify-between relative">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400">
              <Zap size={24} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Decision Simulator</h3>
              <p className="text-sm text-gray-400 mt-0.5">
                Test a purchase before you make it — see the impact on your balance, daily allowance, and goals.
              </p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2 text-emerald-400 font-semibold text-sm">
            Try it now <ArrowRight size={16} />
          </div>
        </CardBody>
      </Card>

      {/* Savings progress + Forecast preview */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Savings Goals" icon={<Target size={16} />} />
          <CardBody>
            {state.savingsGoals.length === 0 ? (
              <p className="text-sm text-gray-400 dark:text-gray-500 py-4 text-center">
                No savings goals yet. Add one to start tracking progress.
              </p>
            ) : (
              <div className="space-y-4">
                {state.savingsGoals.map((goal) => {
                  const pct = (goal.currentAmount / goal.targetAmount) * 100;
                  return (
                    <div key={goal.id}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {goal.name} {goal.isDemo && <DemoBadge />}
                        </span>
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                          {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
                        </span>
                      </div>
                      <ProgressBar
                        value={pct}
                        color={pct >= 100 ? 'emerald' : 'navy'}
                        size="sm"
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="30-Day Forecast"
            icon={<Calendar size={16} />}
            action={
              <button
                onClick={() => onNavigate('forecast')}
                className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1"
              >
                Full view <ArrowRight size={12} />
              </button>
            }
          />
          <CardBody>
            <ForecastSparkline forecast={forecast} currentDay={metrics.daysElapsed} />
          </CardBody>
        </Card>
      </div>

      {/* Recent transactions + upcoming commitments */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Recent Transactions"
            icon={<Receipt size={16} />}
            action={
              <button
                onClick={() => onNavigate('transactions')}
                className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1"
              >
                View all <ArrowRight size={12} />
              </button>
            }
          />
          <CardBody className="pt-0">
            {recentTransactions.length === 0 ? (
              <p className="text-sm text-gray-400 dark:text-gray-500 py-4 text-center">
                No transactions yet.
              </p>
            ) : (
              <div className="divide-y divide-gray-50 dark:divide-navy-700">
                {recentTransactions.map((tx) => (
                  <div key={tx.id} className="flex items-center gap-3 py-2.5">
                    <div className={`p-2 rounded-lg ${tx.type === 'income' ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400' : 'bg-gray-50 dark:bg-navy-700 text-gray-500 dark:text-gray-400'}`}>
                      <CategoryIcon category={tx.category} size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate">
                          {tx.description}
                        </span>
                        {tx.isDemo && <DemoBadge />}
                      </div>
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        {tx.category} · {tx.date}
                      </span>
                    </div>
                    <span className={`text-sm font-bold ${tx.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-700 dark:text-gray-300'}`}>
                      {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Upcoming Commitments"
            icon={<AlertTriangle size={16} />}
            action={
              <button
                onClick={() => onNavigate('commitments')}
                className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1"
              >
                Manage <ArrowRight size={12} />
              </button>
            }
          />
          <CardBody className="pt-0">
            {upcomingCommitments.length === 0 ? (
              <p className="text-sm text-gray-400 dark:text-gray-500 py-4 text-center">
                No upcoming commitments.
              </p>
            ) : (
              <div className="divide-y divide-gray-50 dark:divide-navy-700">
                {upcomingCommitments.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 py-2.5">
                    <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400">
                      <Calendar size={16} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                          {item.name}
                        </span>
                        {item.isDemo && <DemoBadge />}
                      </div>
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        Day {item.dueDay} · {item.kind === 'subscription' ? 'Subscription' : 'Commitment'}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                      {formatCurrency(item.amount)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

function ForecastSparkline({ forecast, currentDay }: { forecast: { day: number; balance: number }[]; currentDay: number }) {
  const maxBalance = Math.max(...forecast.map((f) => f.balance), 1);
  const minBalance = Math.min(...forecast.map((f) => f.balance), 0);
  const range = maxBalance - minBalance || 1;
  const width = 100;
  const height = 40;

  const points = forecast
    .map((f, i) => {
      const x = (i / (forecast.length - 1)) * width;
      const y = height - ((f.balance - minBalance) / range) * height;
      return `${x},${y}`;
    })
    .join(' ');

  const actualPoints = forecast
    .filter((f) => f.day <= currentDay)
    .map((f) => {
      const idx = f.day - 1;
      const x = (idx / (forecast.length - 1)) * width;
      const y = height - ((f.balance - minBalance) / range) * height;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-24" preserveAspectRatio="none" role="img" aria-label="30-day balance forecast sparkline showing actual and projected balance">
        <defs>
          <linearGradient id="forecastGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon
          points={`0,${height} ${points} ${width},${height}`}
          fill="url(#forecastGrad)"
        />
        <polyline
          points={actualPoints}
          fill="none"
          stroke="#10b981"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <polyline
          points={points}
          fill="none"
          stroke="#94a3b8"
          strokeWidth="0.8"
          strokeDasharray="2,2"
          strokeLinecap="round"
        />
        {currentDay > 0 && currentDay < 30 && (
          <line
            x1={(currentDay / 29) * width}
            y1="0"
            x2={(currentDay / 29) * width}
            y2={height}
            stroke="#64748b"
            strokeWidth="0.5"
            strokeDasharray="1,1"
          />
        )}
      </svg>
      <div className="flex items-center justify-between mt-2 text-xs">
        <span className="text-gray-400 dark:text-gray-500">Day 1</span>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-gray-400 dark:text-gray-500">
            <span className="w-2 h-0.5 bg-emerald-500" /> Actual
          </span>
          <span className="flex items-center gap-1 text-gray-400 dark:text-gray-500">
            <span className="w-2 h-0.5 bg-gray-400" /> Projected
          </span>
        </div>
        <span className="text-gray-400 dark:text-gray-500">Day 30</span>
      </div>
    </div>
  );
}
