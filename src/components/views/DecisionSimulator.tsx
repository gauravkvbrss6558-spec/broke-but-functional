import { useState, useMemo, useCallback } from 'react';
import {
  Zap,
  Check,
  X,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  Shield,
  ArrowRight,
  Sparkles,
  Info,
} from 'lucide-react';
import type { FinanceState, Category, SimDecision } from '@/types';
import { simulateDecision } from '@/lib/calculations';
import { formatCurrency } from '@/lib/format';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, CategorySelect } from '@/components/ui/Input';
import { RiskBadge } from '@/components/ui/Misc';

interface SimulatorProps {
  state: FinanceState;
  onApplyDecision: (decision: SimDecision) => void;
}

type SimMode = 'expense' | 'savings';

export function DecisionSimulator({ state, onApplyDecision }: SimulatorProps) {
  const [mode, setMode] = useState<SimMode>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<Category>('Shopping');
  const [description, setDescription] = useState('');
  const [savingsGoalId, setSavingsGoalId] = useState(state.savingsGoals[0]?.id || '');
  const [applied, setApplied] = useState(false);
  const [error, setError] = useState('');

  const numericAmount = parseFloat(amount);

  const decision: SimDecision | null = useMemo(() => {
    if (!numericAmount || numericAmount <= 0 || isNaN(numericAmount)) return null;
    if (mode === 'savings' && !savingsGoalId) return null;
    return {
      type: mode,
      amount: numericAmount,
      category: mode === 'expense' ? category : 'Other',
      description: mode === 'expense'
        ? description || `${category} purchase`
        : `Savings contribution`,
      savingsGoalId: mode === 'savings' ? savingsGoalId : undefined,
    };
  }, [mode, numericAmount, category, description, savingsGoalId]);

  const simResult = useMemo(() => {
    if (!decision) return null;
    return simulateDecision(state, decision);
  }, [state, decision]);

  const validate = useCallback((): boolean => {
    setError('');
    if (isNaN(numericAmount) || amount.trim() === '') {
      setError('Please enter a valid amount.');
      return false;
    }
    if (numericAmount <= 0) {
      setError('Amount must be greater than zero.');
      return false;
    }
    if (numericAmount > 1000000) {
      setError('That amount seems unrealistic. Please enter a valid amount.');
      return false;
    }
    if (mode === 'savings' && !savingsGoalId) {
      setError('Please select a savings goal to contribute to.');
      return false;
    }
    if (mode === 'savings') {
      const goal = state.savingsGoals.find((g) => g.id === savingsGoalId);
      if (goal && goal.currentAmount + numericAmount > goal.targetAmount) {
        setError(
          `This contribution exceeds your goal target. Remaining: ${formatCurrency(goal.targetAmount - goal.currentAmount)}.`
        );
        return false;
      }
    }
    return true;
  }, [numericAmount, amount, mode, savingsGoalId, state.savingsGoals]);

  const handleApply = useCallback(() => {
    if (!decision || !validate()) return;
    onApplyDecision(decision);
    setApplied(true);
    setTimeout(() => {
      setApplied(false);
      setAmount('');
      setDescription('');
    }, 2500);
  }, [decision, validate, onApplyDecision]);

  const handleCancel = useCallback(() => {
    setAmount('');
    setDescription('');
    setError('');
  }, []);

  const presets = [
    { label: 'Shoes', amount: 1500, category: 'Shopping' as Category, desc: 'New sneakers' },
    { label: 'Phone repair', amount: 800, category: 'Bills' as Category, desc: 'Screen replacement' },
    { label: 'Concert ticket', amount: 1200, category: 'Entertainment' as Category, desc: 'Live concert' },
    { label: 'Medical', amount: 500, category: 'Health' as Category, desc: 'Doctor visit' },
    { label: 'Weekend trip', amount: 2000, category: 'Transport' as Category, desc: 'Outstation travel' },
    { label: 'New course', amount: 999, category: 'Education' as Category, desc: 'Online certification' },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
            <Zap size={20} className="text-emerald-500" />
            Decision Simulator
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Test a financial decision before committing — see exactly how it affects your money.
          </p>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-5">
        {/* Left: Input panel */}
        <div className="lg:col-span-2 space-y-4">
          {/* Mode toggle */}
          <Card>
            <CardBody>
              <div className="grid grid-cols-2 gap-2 p-1 bg-gray-50 dark:bg-navy-700 rounded-xl">
                <button
                  onClick={() => { setMode('expense'); setError(''); }}
                  aria-pressed={mode === 'expense'}
                  className={`py-2 text-sm font-semibold rounded-lg transition-all ${
                    mode === 'expense'
                      ? 'bg-white dark:bg-navy-800 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  Simulate Purchase
                </button>
                <button
                  onClick={() => { setMode('savings'); setError(''); }}
                  aria-pressed={mode === 'savings'}
                  className={`py-2 text-sm font-semibold rounded-lg transition-all ${
                    mode === 'savings'
                      ? 'bg-white dark:bg-navy-800 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  Simulate Savings
                </button>
              </div>
            </CardBody>
          </Card>

          {/* Input form */}
          <Card>
            <CardHeader title={mode === 'expense' ? 'Purchase Details' : 'Savings Contribution'} icon={<Sparkles size={16} />} />
            <CardBody className="space-y-4">
              <Input
                label={mode === 'expense' ? 'Amount (₹)' : 'Contribution Amount (₹)'}
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => { setAmount(e.target.value); setError(''); setApplied(false); }}
                min="0"
                step="1"
                error={error || undefined}
              />

              {mode === 'expense' ? (
                <>
                  <CategorySelect
                    label="Category"
                    value={category}
                    onChange={(v) => { setCategory(v); setApplied(false); }}
                  />
                  <Input
                    label="Description (optional)"
                    type="text"
                    placeholder="e.g. New running shoes"
                    value={description}
                    onChange={(e) => { setDescription(e.target.value); setApplied(false); }}
                  />
                </>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
                    Savings Goal
                  </label>
                  {state.savingsGoals.length === 0 ? (
                    <p className="text-sm text-gray-400 dark:text-gray-500 py-2">
                      No savings goals yet. Create one in the Savings tab first.
                    </p>
                  ) : (
                    <select
                      className="w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-gray-900 border-gray-200 transition-colors focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:bg-navy-800 dark:text-white dark:border-navy-600"
                      value={savingsGoalId}
                      onChange={(e) => { setSavingsGoalId(e.target.value); setApplied(false); }}
                    >
                      {state.savingsGoals.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.name} — {formatCurrency(g.targetAmount - g.currentAmount)} remaining
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )}

              {/* Quick presets */}
              {mode === 'expense' && (
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
                    Quick scenarios
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {presets.map((p) => (
                      <button
                        key={p.label}
                        onClick={() => {
                          setAmount(String(p.amount));
                          setCategory(p.category);
                          setDescription(p.desc);
                          setError('');
                          setApplied(false);
                        }}
                        className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 dark:border-navy-600 text-gray-600 dark:text-gray-400 hover:border-emerald-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                      >
                        {p.label} · {formatCurrency(p.amount)}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Simulation notice */}
              {simResult && !applied && (
                <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-800/50 px-3 py-2 flex items-start gap-2">
                  <Info size={14} className="text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-emerald-700 dark:text-emerald-400">
                    This is a simulation only — your actual balance is unchanged. Press "Confirm" to record this as a real transaction.
                  </p>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex gap-3 pt-2">
                <Button
                  variant="primary"
                  size="md"
                  icon={applied ? <Check size={16} /> : undefined}
                  onClick={handleApply}
                  disabled={!decision || !simResult?.canAfford || applied}
                  className="flex-1"
                >
                  {applied
                    ? (mode === 'expense' ? 'Purchase Recorded!' : 'Contribution Recorded!')
                    : (mode === 'expense' ? 'Confirm Purchase' : 'Confirm Contribution')}
                </Button>
                <Button
                  variant="outline"
                  size="md"
                  icon={<X size={16} />}
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
              </div>
              {applied && (
                <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-800/50 px-3 py-2 flex items-start gap-2">
                  <Check size={14} className="text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-emerald-700 dark:text-emerald-400">
                    {mode === 'expense'
                      ? `Added ${formatCurrency(numericAmount)} to your transactions. Check the Transactions tab to see it.`
                      : `Contributed ${formatCurrency(numericAmount)} to your savings goal.`}
                  </p>
                </div>
              )}
              {!simResult?.canAfford && simResult && !applied && (
                <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1.5">
                  <AlertTriangle size={12} />
                  This expense exceeds your available balance.
                </p>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Right: Results panel */}
        <div className="lg:col-span-3 space-y-4">
          {simResult ? (
            <>
              {/* Before/After comparison */}
              <Card>
                <CardHeader title="Impact Comparison" icon={<TrendingDown size={16} />} />
                <CardBody className="pt-0">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="py-3">
                      <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 mb-1">Current</div>
                      <ComparisonColumn metrics={simResult.current} />
                    </div>
                    <div className="py-3 border-x border-gray-50 dark:border-navy-700">
                      <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 mb-1">Change</div>
                      <ChangeColumn deltas={simResult.deltas} />
                    </div>
                    <div className="py-3">
                      <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-1">Projected</div>
                      <ComparisonColumn metrics={simResult.projected} />
                    </div>
                  </div>
                </CardBody>
              </Card>

              {/* Risk comparison */}
              <Card>
                <CardBody className="py-4">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                      <Shield size={18} className="text-gray-400" />
                      <div>
                        <div className="text-xs text-gray-400 dark:text-gray-500">Risk Level</div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <RiskBadge level={simResult.current.riskLevel} />
                          <ArrowRight size={14} className="text-gray-300 dark:text-gray-600" />
                          <RiskBadge level={simResult.projected.riskLevel} />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div>
                        <div className="text-xs text-gray-400 dark:text-gray-500">Health Score</div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{simResult.current.healthScore}</span>
                          <ArrowRight size={14} className="text-gray-300 dark:text-gray-600" />
                          <span className={`text-sm font-bold ${simResult.deltas.healthScore < 0 ? 'text-red-600 dark:text-red-400' : simResult.deltas.healthScore > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-700 dark:text-gray-300'}`}>
                            {simResult.projected.healthScore}
                          </span>
                          {simResult.deltas.healthScore !== 0 && (
                            <span className={`text-xs ${simResult.deltas.healthScore < 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                              ({simResult.deltas.healthScore > 0 ? '+' : ''}{simResult.deltas.healthScore})
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>

              {/* Explanation */}
              <Card className="bg-navy-900 dark:bg-navy-950 border-navy-700 dark:border-navy-800">
                <CardHeader title="What This Means" icon={<Info size={16} />} />
                <CardBody>
                  <div className="space-y-2.5">
                    {simResult.explanation.map((line, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-sm text-gray-300">
                        <span className={`mt-0.5 flex-shrink-0 ${line.startsWith('Warning') ? 'text-red-400' : 'text-emerald-400'}`}>
                          {line.startsWith('Warning') ? <AlertTriangle size={14} /> : <Check size={14} />}
                        </span>
                        <span>{line}</span>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
            </>
          ) : (
            <Card className="h-full flex items-center justify-center min-h-[300px]">
              <CardBody className="text-center py-12">
                <div className="inline-flex p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-500 mb-4">
                  <Zap size={32} />
                </div>
                <h3 className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Enter an amount to simulate
                </h3>
                <p className="text-sm text-gray-400 dark:text-gray-500 max-w-sm mx-auto">
                  Type a purchase amount or savings contribution on the left. You'll see a side-by-side comparison of your finances before and after — without actually changing anything.
                </p>
                <div className="mt-5 flex flex-wrap justify-center gap-2">
                  {presets.slice(0, 3).map((p) => (
                    <button
                      key={p.label}
                      onClick={() => {
                        setAmount(String(p.amount));
                        setCategory(p.category);
                        setDescription(p.desc);
                      }}
                      className="px-3 py-2 text-xs font-medium rounded-lg bg-gray-50 dark:bg-navy-700 text-gray-600 dark:text-gray-400 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-950/30 dark:hover:text-emerald-400 transition-colors"
                    >
                      Try: {p.label} ({formatCurrency(p.amount)})
                    </button>
                  ))}
                </div>
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function ComparisonColumn({ metrics }: { metrics: { currentBalance: number; safeDailyAllowance: number; projectedEndBalance: number; savingsProgressPercent: number } }) {
  return (
    <div className="space-y-2 text-left">
      <ComparisonRow label="Balance" value={formatCurrency(metrics.currentBalance)} />
      <ComparisonRow label="Daily Allowance" value={`${formatCurrency(metrics.safeDailyAllowance)}/d`} />
      <ComparisonRow label="Day-30 Projected" value={formatCurrency(metrics.projectedEndBalance)} />
      <ComparisonRow label="Savings Progress" value={`${Math.round(metrics.savingsProgressPercent)}%`} />
    </div>
  );
}

function ComparisonRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wide">{label}</div>
      <div className="text-xs font-bold text-gray-700 dark:text-gray-200">{value}</div>
    </div>
  );
}

function ChangeColumn({ deltas }: { deltas: { balance: number; dailyAllowance: number; projectedEnd: number; healthScore: number; savingsProgress: number } }) {
  return (
    <div className="space-y-2">
      <ChangeRow value={deltas.balance} />
      <ChangeRow value={deltas.dailyAllowance} suffix="/d" />
      <ChangeRow value={deltas.projectedEnd} />
      <ChangeRow value={deltas.savingsProgress} suffix="%" />
    </div>
  );
}

function ChangeRow({ value, suffix = '' }: { value: number; suffix?: string }) {
  if (value === 0) {
    return <div className="text-xs font-medium text-gray-400">—</div>;
  }
  const isNegative = value < 0;
  const isGoodChange = suffix === '%' ? !isNegative : !isNegative; // savings increase is good
  const Icon = isNegative ? TrendingDown : TrendingUp;

  return (
    <div className={`text-xs font-bold flex items-center justify-center gap-0.5 ${isGoodChange ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
      <Icon size={10} />
      {isNegative ? '-' : '+'}{formatCurrency(Math.abs(value))}{suffix && !suffix.includes('/d') && suffix.includes('%') ? '%' : suffix}
    </div>
  );
}
