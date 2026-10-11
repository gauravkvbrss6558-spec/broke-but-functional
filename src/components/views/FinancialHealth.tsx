import { useMemo } from 'react';
import {
  Activity,
  Shield,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Lightbulb,
  Wallet,
  Lock,
  Target,
  Calendar,
} from 'lucide-react';
import type { FinanceState, FinanceMetrics, RiskLevel } from '@/types';
import { computeMetrics } from '@/lib/calculations';
import { formatCurrency } from '@/lib/format';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { RiskBadge } from '@/components/ui/Misc';

interface HealthProps {
  state: FinanceState;
  metrics: FinanceMetrics;
}

export function FinancialHealth({ state, metrics }: HealthProps) {
  const factors = useMemo(() => {
    const budgetRemainingRatio = Math.max(0, metrics.currentBalance / state.startingBudget);
    const canCoverCommitments = metrics.currentBalance >= metrics.committedAmount;
    const surplusAfterCommitments = metrics.currentBalance - metrics.committedAmount;
    const surplusRatio = Math.min(1, surplusAfterCommitments / (state.startingBudget * 0.3));
    const endRatio = metrics.projectedEndBalance > 0 ? Math.min(1, metrics.projectedEndBalance / (state.startingBudget * 0.2)) : 0;

    return [
      {
        name: 'Budget Remaining',
        icon: Wallet,
        score: Math.round(budgetRemainingRatio * 35),
        max: 35,
        description: `You have ${formatCurrency(metrics.currentBalance)} of your starting ${formatCurrency(state.startingBudget)} left.`,
        detail: `${Math.round(budgetRemainingRatio * 100)}% of starting budget remains`,
      },
      {
        name: 'Commitment Coverage',
        icon: Lock,
        score: canCoverCommitments ? Math.round(surplusRatio * 25) : 0,
        max: 25,
        description: canCoverCommitments
          ? `After paying ${formatCurrency(metrics.committedAmount)} in commitments, you have ${formatCurrency(surplusAfterCommitments)} surplus.`
          : `Your balance can't cover ${formatCurrency(metrics.committedAmount)} in upcoming commitments.`,
        detail: canCoverCommitments ? 'All commitments covered' : 'Shortfall detected',
      },
      {
        name: 'Savings Progress',
        icon: Target,
        score: Math.round((metrics.savingsProgressPercent / 100) * 20),
        max: 20,
        description: `You've saved ${formatCurrency(metrics.totalSavings)} of ${formatCurrency(metrics.totalSavingsTarget)} target.`,
        detail: `${Math.round(metrics.savingsProgressPercent)}% of target reached`,
      },
      {
        name: 'Projected Month-End',
        icon: Calendar,
        score: Math.round(endRatio * 20),
        max: 20,
        description: `You're projected to end the month with ${formatCurrency(metrics.projectedEndBalance)}.`,
        detail: metrics.projectedEndBalance >= 0 ? 'Ending in positive territory' : 'Projected to go negative',
      },
    ];
  }, [state, metrics]);

  const scoreColor =
    metrics.healthScore >= 70 ? 'text-emerald-600 dark:text-emerald-400'
    : metrics.healthScore >= 40 ? 'text-amber-600 dark:text-amber-400'
    : 'text-red-600 dark:text-red-400';

  const scoreBarColor =
    metrics.healthScore >= 70 ? 'emerald'
    : metrics.healthScore >= 40 ? 'amber'
    : 'red' as const;

  const riskConfig: Record<RiskLevel, { icon: typeof Shield; color: string; bg: string }> = {
    Low: { icon: Shield, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
    Moderate: { icon: AlertTriangle, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/30' },
    High: { icon: AlertTriangle, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-950/30' },
  };

  const rCfg = riskConfig[metrics.riskLevel];

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">Financial Health</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          A transparent, explainable score based on your budget, obligations, savings, and month-end projection.
        </p>
      </div>

      {/* Score hero */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardBody className="pt-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Activity size={18} className="text-emerald-500" />
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Health Score</span>
            </div>
            <div className={`text-6xl font-bold tracking-tight ${scoreColor} mb-2`}>
              {metrics.healthScore}
            </div>
            <div className="text-sm text-gray-400 dark:text-gray-500 mb-4">out of 100</div>
            <ProgressBar value={metrics.healthScore} color={scoreBarColor} size="lg" />
            <div className="mt-4 flex justify-center">
              <RiskBadge level={metrics.riskLevel} />
            </div>
          </CardBody>
        </Card>

        {/* Risk explanation */}
        <Card className="lg:col-span-2">
          <CardHeader title="Risk Assessment" icon={<rCfg.icon size={16} />} />
          <CardBody>
            <div className={`rounded-xl ${rCfg.bg} p-4 mb-4`}>
              <div className="flex items-center gap-2 mb-2">
                <rCfg.icon size={20} className={rCfg.color} />
                <span className={`text-sm font-bold ${rCfg.color}`}>
                  {metrics.riskLevel} Risk
                </span>
              </div>
              <div className="space-y-1.5">
                {metrics.riskReasons.map((reason, i) => (
                  <div key={i} className={`text-sm ${rCfg.color} flex items-start gap-2`}>
                    <span className="mt-1.5 w-1 h-1 rounded-full bg-current flex-shrink-0" />
                    {reason}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2 flex items-center gap-1.5">
                <Lightbulb size={14} /> Recommended Next Steps
              </h4>
              <div className="space-y-2">
                {metrics.riskNextSteps.map((step, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <CheckCircle2 size={14} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                    {step}
                  </div>
                ))}
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Score breakdown */}
      <Card>
        <CardHeader title="Score Breakdown" icon={<TrendingUp size={16} />} />
        <CardBody>
          <div className="space-y-5">
            {factors.map((factor) => (
              <div key={factor.name}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-gray-50 dark:bg-navy-700 text-gray-400 dark:text-gray-500">
                      <factor.icon size={16} />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-700 dark:text-gray-200">{factor.name}</div>
                      <div className="text-xs text-gray-400 dark:text-gray-500">{factor.detail}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-gray-700 dark:text-gray-200">{factor.score}</span>
                    <span className="text-xs text-gray-400 dark:text-gray-500">/{factor.max}</span>
                  </div>
                </div>
                <ProgressBar
                  value={factor.score}
                  max={factor.max}
                  color={factor.score / factor.max >= 0.6 ? 'emerald' : factor.score / factor.max >= 0.3 ? 'amber' : 'red'}
                  size="sm"
                />
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5">{factor.description}</p>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Methodology */}
      <div className="rounded-xl bg-gray-50 dark:bg-navy-800/50 border border-gray-100 dark:border-navy-700 p-4">
        <div className="flex items-start gap-2.5">
          <Activity size={16} className="text-gray-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
            <p className="font-semibold text-gray-600 dark:text-gray-300">How the score works</p>
            <p>The health score is the sum of four weighted factors (max 100):</p>
            <p>• Budget Remaining (35 pts) — how much of your starting ₹10,000 is left.</p>
            <p>• Commitment Coverage (25 pts) — whether you can cover upcoming obligations with surplus.</p>
            <p>• Savings Progress (20 pts) — how close you are to your total savings target.</p>
            <p>• Projected Month-End (20 pts) — whether you're projected to end the month positive.</p>
            <p>Risk level is determined by the number and severity of financial pressures detected.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
