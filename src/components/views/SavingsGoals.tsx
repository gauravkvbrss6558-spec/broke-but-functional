import { useState } from 'react';
import {
  Plus,
  Trash2,
  Target,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  PiggyBank,
} from 'lucide-react';
import type { FinanceState, SavingsGoal } from '@/types';
import { formatCurrency } from '@/lib/format';
import { computeMetrics } from '@/lib/calculations';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { EmptyState, DemoBadge } from '@/components/ui/Misc';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

interface SavingsProps {
  state: FinanceState;
  onAddGoal: (g: Omit<SavingsGoal, 'id'>) => void;
  onContribute: (goalId: string, amount: number) => void;
  onDeleteGoal: (id: string) => void;
}

export function SavingsGoals({ state, onAddGoal, onContribute, onDeleteGoal }: SavingsProps) {
  const [showAdd, setShowAdd] = useState(false);
  const [contributeTo, setContributeTo] = useState<SavingsGoal | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const metrics = computeMetrics(state);

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">Savings Goals</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Set targets and contribute without double-counting as expenses. Saved money stays yours.
          </p>
        </div>
        <Button icon={<Plus size={16} />} onClick={() => setShowAdd(true)}>Add Goal</Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 dark:text-gray-500 mb-1">
            <PiggyBank size={14} className="text-emerald-500" /> Saved
          </div>
          <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(metrics.totalSavings)}</div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 dark:text-gray-500 mb-1">
            <Target size={14} className="text-navy-400" /> Target
          </div>
          <div className="text-lg font-bold text-gray-900 dark:text-white">{formatCurrency(metrics.totalSavingsTarget)}</div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 dark:text-gray-500 mb-1">
            <TrendingUp size={14} className="text-emerald-500" /> Progress
          </div>
          <div className="text-lg font-bold text-gray-900 dark:text-white">{Math.round(metrics.savingsProgressPercent)}%</div>
        </Card>
      </div>

      {/* Goals */}
      {state.savingsGoals.length === 0 ? (
        <Card>
          <CardBody>
            <EmptyState
              icon={<Target size={28} />}
              title="No savings goals yet"
              description="Create a goal like 'Emergency fund' or 'New phone' to start tracking your progress."
              action={<Button size="sm" icon={<Plus size={14} />} onClick={() => setShowAdd(true)}>Add Goal</Button>}
            />
          </CardBody>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {state.savingsGoals.map((goal) => {
            const pct = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
            const remaining = goal.targetAmount - goal.currentAmount;
            const isComplete = remaining <= 0;
            const daysLeft = goal.deadlineDay - metrics.daysElapsed;
            const canAchieve = metrics.projectedEndBalance > 0 && remaining <= metrics.spendableBalance;

            return (
              <Card key={goal.id} hoverable>
                <CardBody>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-sm font-bold text-gray-700 dark:text-gray-200">{goal.name}</h3>
                        {goal.isDemo && <DemoBadge />}
                      </div>
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        Target: {formatCurrency(goal.targetAmount)} · By Day {goal.deadlineDay}
                      </span>
                    </div>
                    <button
                      onClick={() => setDeleteId(goal.id)}
                      className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 dark:hover:text-red-400 transition-colors"
                      aria-label="Delete goal"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div className="flex items-end justify-between mb-2">
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatCurrency(goal.currentAmount)}
                    </span>
                    <span className="text-sm text-gray-400 dark:text-gray-500">
                      {formatCurrency(remaining)} to go
                    </span>
                  </div>

                  <ProgressBar
                    value={pct}
                    color={isComplete ? 'emerald' : 'navy'}
                    size="md"
                    showValue
                  />

                  <div className="mt-3 flex items-center gap-2">
                    {isComplete ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 size={14} /> Goal achieved!
                      </span>
                    ) : daysLeft <= 0 ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-red-600 dark:text-red-400">
                        <AlertTriangle size={14} /> Deadline passed
                      </span>
                    ) : !canAchieve ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-600 dark:text-amber-400">
                        <AlertTriangle size={14} /> At current pace, you may not reach this goal
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                        <TrendingUp size={14} /> On track — {daysLeft} days left
                      </span>
                    )}
                    {!isComplete && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="ml-auto"
                        onClick={() => setContributeTo(goal)}
                      >
                        Contribute
                      </Button>
                    )}
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add goal modal */}
      {showAdd && (
        <GoalForm
          onClose={() => setShowAdd(false)}
          onSubmit={(g) => {
            onAddGoal(g);
            setShowAdd(false);
          }}
        />
      )}

      {/* Contribute modal */}
      {contributeTo && (
        <ContributeForm
          goal={contributeTo}
          onClose={() => setContributeTo(null)}
          onSubmit={(amount) => {
            onContribute(contributeTo.id, amount);
            setContributeTo(null);
          }}
        />
      )}

      {/* Delete confirmation */}
      <ConfirmDialog
        open={!!deleteId}
        title="Delete savings goal?"
        message="This will remove the goal. The money already saved will remain in your balance."
        confirmLabel="Delete"
        danger
        onConfirm={() => {
          if (deleteId) onDeleteGoal(deleteId);
          setDeleteId(null);
        }}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}

function GoalForm({ onClose, onSubmit }: { onClose: () => void; onSubmit: (g: Omit<SavingsGoal, 'id'>) => void }) {
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [deadlineDay, setDeadlineDay] = useState('30');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    const target = parseFloat(targetAmount);
    const day = parseInt(deadlineDay);
    if (!name.trim()) { setError('Enter a goal name.'); return; }
    if (!target || target <= 0) { setError('Enter a valid target amount.'); return; }
    if (day < 1 || day > 30) { setError('Deadline must be between day 1 and 30.'); return; }
    onSubmit({ name: name.trim(), targetAmount: target, currentAmount: 0, deadlineDay: day });
  };

  return (
    <Modal
      open
      onClose={onClose}
      title="Add Savings Goal"
      footer={<><Button variant="ghost" onClick={onClose}>Cancel</Button><Button onClick={handleSubmit}>Add</Button></>}
    >
      <div className="space-y-4">
        <Input label="Goal Name" type="text" value={name} onChange={(e) => { setName(e.target.value); setError(''); }} placeholder="e.g. Emergency fund" error={error || undefined} />
        <Input label="Target Amount (₹)" type="number" value={targetAmount} onChange={(e) => { setTargetAmount(e.target.value); setError(''); }} placeholder="0" min="0" />
        <Input label="Deadline Day (1-30)" type="number" value={deadlineDay} onChange={(e) => { setDeadlineDay(e.target.value); setError(''); }} min="1" max="30" />
      </div>
    </Modal>
  );
}

function ContributeForm({ goal, onClose, onSubmit }: { goal: SavingsGoal; onClose: () => void; onSubmit: (amount: number) => void }) {
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const remaining = goal.targetAmount - goal.currentAmount;

  const handleSubmit = () => {
    const num = parseFloat(amount);
    if (!num || num <= 0) { setError('Enter a valid amount.'); return; }
    if (num > remaining) { setError(`Maximum contribution is ${formatCurrency(remaining)}.`); return; }
    onSubmit(num);
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={`Contribute to ${goal.name}`}
      footer={<><Button variant="ghost" onClick={onClose}>Cancel</Button><Button onClick={handleSubmit}>Contribute</Button></>}
    >
      <div className="space-y-4">
        <div className="rounded-xl bg-gray-50 dark:bg-navy-700 p-3 text-sm">
          <div className="flex justify-between mb-1">
            <span className="text-gray-500 dark:text-gray-400">Current</span>
            <span className="font-semibold text-gray-700 dark:text-gray-200">{formatCurrency(goal.currentAmount)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">Remaining</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">{formatCurrency(remaining)}</span>
          </div>
        </div>
        <Input
          label="Contribution Amount (₹)"
          type="number"
          value={amount}
          onChange={(e) => { setAmount(e.target.value); setError(''); }}
          placeholder="0"
          min="0"
          error={error || undefined}
        />
        <p className="text-xs text-gray-400 dark:text-gray-500">
          This contribution reduces your available balance but doesn't count as an expense — the money is set aside, not spent.
        </p>
      </div>
    </Modal>
  );
}
