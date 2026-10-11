import { useState } from 'react';
import {
  Plus,
  Trash2,
  Calendar,
  Repeat,
  Lock,
  CheckCircle2,
  Circle,
  Receipt,
} from 'lucide-react';
import type { FinanceState, Commitment, Subscription, Category } from '@/types';
import { formatCurrency } from '@/lib/format';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input, CategorySelect } from '@/components/ui/Input';
import { EmptyState, DemoBadge } from '@/components/ui/Misc';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

interface CommitmentsProps {
  state: FinanceState;
  onAddCommitment: (c: Omit<Commitment, 'id'>) => void;
  onToggleCommitment: (id: string) => void;
  onDeleteCommitment: (id: string) => void;
  onAddSubscription: (s: Omit<Subscription, 'id'>) => void;
  onToggleSubscription: (id: string) => void;
  onDeleteSubscription: (id: string) => void;
}

export function Commitments({
  state,
  onAddCommitment,
  onToggleCommitment,
  onDeleteCommitment,
  onAddSubscription,
  onToggleSubscription,
  onDeleteSubscription,
}: CommitmentsProps) {
  const [showCommitment, setShowCommitment] = useState(false);
  const [showSubscription, setShowSubscription] = useState(false);
  const [deleteItem, setDeleteItem] = useState<{ id: string; kind: 'commitment' | 'subscription' } | null>(null);

  const totalCommitted =
    state.commitments.filter((c) => !c.paid).reduce((s, c) => s + c.amount, 0) +
    state.subscriptions.filter((s) => !s.paid).reduce((s, sub) => s + sub.amount, 0);

  const paidAmount =
    state.commitments.filter((c) => c.paid).reduce((s, c) => s + c.amount, 0) +
    state.subscriptions.filter((s) => s.paid).reduce((s, sub) => s + sub.amount, 0);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">Budget & Commitments</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Fixed obligations and recurring subscriptions, tracked separately from your spendable money.
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 dark:text-gray-500 mb-1">
            <Lock size={14} className="text-amber-500" /> Upcoming
          </div>
          <div className="text-lg font-bold text-amber-600 dark:text-amber-400">{formatCurrency(totalCommitted)}</div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 dark:text-gray-500 mb-1">
            <CheckCircle2 size={14} className="text-emerald-500" /> Paid
          </div>
          <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(paidAmount)}</div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 dark:text-gray-500 mb-1">
            <Receipt size={14} className="text-gray-400" /> Total
          </div>
          <div className="text-lg font-bold text-gray-900 dark:text-white">{formatCurrency(totalCommitted + paidAmount)}</div>
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Commitments */}
        <Card>
          <CardHeader
            title="Fixed Commitments"
            icon={<Calendar size={16} />}
            action={<Button size="sm" variant="outline" icon={<Plus size={14} />} onClick={() => setShowCommitment(true)}>Add</Button>}
          />
          <CardBody className="pt-0">
            {state.commitments.length === 0 ? (
              <EmptyState
                icon={<Calendar size={24} />}
                title="No commitments"
                description="Add rent, bills, or other fixed obligations."
              />
            ) : (
              <div className="divide-y divide-gray-50 dark:divide-navy-700">
                {[...state.commitments].sort((a, b) => a.dueDay - b.dueDay).map((c) => (
                  <div key={c.id} className="flex items-center gap-3 py-3 group">
                    <button
                      onClick={() => onToggleCommitment(c.id)}
                      className="flex-shrink-0"
                      aria-label={c.paid ? 'Mark as unpaid' : 'Mark as paid'}
                    >
                      {c.paid ? (
                        <CheckCircle2 size={20} className="text-emerald-500" />
                      ) : (
                        <Circle size={20} className="text-gray-300 dark:text-gray-600" />
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-sm font-semibold ${c.paid ? 'text-gray-400 line-through dark:text-gray-600' : 'text-gray-700 dark:text-gray-200'}`}>
                          {c.name}
                        </span>
                        {c.isDemo && <DemoBadge />}
                      </div>
                      <div className="text-xs text-gray-400 dark:text-gray-500">
                        {c.category} · Day {c.dueDay}
                      </div>
                    </div>
                    <span className={`text-sm font-bold ${c.paid ? 'text-gray-400 dark:text-gray-600' : 'text-gray-700 dark:text-gray-300'}`}>
                      {formatCurrency(c.amount)}
                    </span>
                    <button
                      onClick={() => setDeleteItem({ id: c.id, kind: 'commitment' })}
                      className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 dark:hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                      aria-label="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>

        {/* Subscriptions */}
        <Card>
          <CardHeader
            title="Subscriptions"
            icon={<Repeat size={16} />}
            action={<Button size="sm" variant="outline" icon={<Plus size={14} />} onClick={() => setShowSubscription(true)}>Add</Button>}
          />
          <CardBody className="pt-0">
            {state.subscriptions.length === 0 ? (
              <EmptyState
                icon={<Repeat size={24} />}
                title="No subscriptions"
                description="Track monthly recurring payments like streaming or apps."
              />
            ) : (
              <div className="divide-y divide-gray-50 dark:divide-navy-700">
                {[...state.subscriptions].sort((a, b) => a.dueDay - b.dueDay).map((s) => (
                  <div key={s.id} className="flex items-center gap-3 py-3 group">
                    <button
                      onClick={() => onToggleSubscription(s.id)}
                      className="flex-shrink-0"
                      aria-label={s.paid ? 'Mark as unpaid' : 'Mark as paid'}
                    >
                      {s.paid ? (
                        <CheckCircle2 size={20} className="text-emerald-500" />
                      ) : (
                        <Circle size={20} className="text-gray-300 dark:text-gray-600" />
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-sm font-semibold ${s.paid ? 'text-gray-400 line-through dark:text-gray-600' : 'text-gray-700 dark:text-gray-200'}`}>
                          {s.name}
                        </span>
                        {s.isDemo && <DemoBadge />}
                      </div>
                      <div className="text-xs text-gray-400 dark:text-gray-500">
                        Monthly · Day {s.dueDay}
                      </div>
                    </div>
                    <span className={`text-sm font-bold ${s.paid ? 'text-gray-400 dark:text-gray-600' : 'text-gray-700 dark:text-gray-300'}`}>
                      {formatCurrency(s.amount)}
                    </span>
                    <button
                      onClick={() => setDeleteItem({ id: s.id, kind: 'subscription' })}
                      className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 dark:hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                      aria-label="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Add commitment modal */}
      {showCommitment && (
        <CommitmentForm
          onClose={() => setShowCommitment(false)}
          onSubmit={(c) => {
            onAddCommitment(c);
            setShowCommitment(false);
          }}
        />
      )}

      {/* Add subscription modal */}
      {showSubscription && (
        <SubscriptionForm
          onClose={() => setShowSubscription(false)}
          onSubmit={(s) => {
            onAddSubscription(s);
            setShowSubscription(false);
          }}
        />
      )}

      {/* Delete confirmation */}
      <ConfirmDialog
        open={!!deleteItem}
        title="Delete this item?"
        message="This will remove the item from your commitments. Your budget will recalculate automatically."
        confirmLabel="Delete"
        danger
        onConfirm={() => {
          if (deleteItem) {
            if (deleteItem.kind === 'commitment') onDeleteCommitment(deleteItem.id);
            else onDeleteSubscription(deleteItem.id);
          }
          setDeleteItem(null);
        }}
        onCancel={() => setDeleteItem(null)}
      />
    </div>
  );
}

function CommitmentForm({ onClose, onSubmit }: { onClose: () => void; onSubmit: (c: Omit<Commitment, 'id'>) => void }) {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDay, setDueDay] = useState('15');
  const [category, setCategory] = useState<Category>('Bills');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    const numAmount = parseFloat(amount);
    const day = parseInt(dueDay);
    if (!name.trim()) { setError('Enter a name.'); return; }
    if (!numAmount || numAmount <= 0) { setError('Enter a valid amount.'); return; }
    if (day < 1 || day > 30) { setError('Due day must be between 1 and 30.'); return; }
    onSubmit({ name: name.trim(), amount: numAmount, dueDay: day, category, paid: false });
  };

  return (
    <Modal
      open
      onClose={onClose}
      title="Add Commitment"
      footer={<><Button variant="ghost" onClick={onClose}>Cancel</Button><Button onClick={handleSubmit}>Add</Button></>}
    >
      <div className="space-y-4">
        <Input label="Name" type="text" value={name} onChange={(e) => { setName(e.target.value); setError(''); }} placeholder="e.g. Rent" error={error || undefined} />
        <Input label="Amount (₹)" type="number" value={amount} onChange={(e) => { setAmount(e.target.value); setError(''); }} placeholder="0" min="0" />
        <Input label="Due Day (1-30)" type="number" value={dueDay} onChange={(e) => { setDueDay(e.target.value); setError(''); }} min="1" max="30" />
        <CategorySelect label="Category" value={category} onChange={setCategory} />
      </div>
    </Modal>
  );
}

function SubscriptionForm({ onClose, onSubmit }: { onClose: () => void; onSubmit: (s: Omit<Subscription, 'id'>) => void }) {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDay, setDueDay] = useState('10');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    const numAmount = parseFloat(amount);
    const day = parseInt(dueDay);
    if (!name.trim()) { setError('Enter a name.'); return; }
    if (!numAmount || numAmount <= 0) { setError('Enter a valid amount.'); return; }
    if (day < 1 || day > 30) { setError('Due day must be between 1 and 30.'); return; }
    onSubmit({ name: name.trim(), amount: numAmount, dueDay: day, paid: false });
  };

  return (
    <Modal
      open
      onClose={onClose}
      title="Add Subscription"
      footer={<><Button variant="ghost" onClick={onClose}>Cancel</Button><Button onClick={handleSubmit}>Add</Button></>}
    >
      <div className="space-y-4">
        <Input label="Name" type="text" value={name} onChange={(e) => { setName(e.target.value); setError(''); }} placeholder="e.g. Netflix" error={error || undefined} />
        <Input label="Monthly Amount (₹)" type="number" value={amount} onChange={(e) => { setAmount(e.target.value); setError(''); }} placeholder="0" min="0" />
        <Input label="Billing Day (1-30)" type="number" value={dueDay} onChange={(e) => { setDueDay(e.target.value); setError(''); }} min="1" max="30" />
      </div>
    </Modal>
  );
}
