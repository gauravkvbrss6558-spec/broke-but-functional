import { useState, useMemo } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  Receipt,
  TrendingUp,
  TrendingDown,
  Filter,
} from 'lucide-react';
import type { FinanceState, Transaction, Category } from '@/types';
import { CATEGORIES } from '@/types';
import { formatCurrency, formatDate, todayISO } from '@/lib/format';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input, CategorySelect, Select } from '@/components/ui/Input';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import { EmptyState, DemoBadge } from '@/components/ui/Misc';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

interface TransactionsProps {
  state: FinanceState;
  onAdd: (tx: Omit<Transaction, 'id'>) => void;
  onUpdate: (id: string, updates: Partial<Transaction>) => void;
  onDelete: (id: string) => void;
}

type FilterType = 'all' | 'income' | 'expense';
type CatFilter = Category | 'all';

export function Transactions({ state, onAdd, onUpdate, onDelete }: TransactionsProps) {
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<FilterType>('all');
  const [catFilter, setCatFilter] = useState<CatFilter>('all');

  const filtered = useMemo(() => {
    return [...state.transactions]
      .filter((t) => typeFilter === 'all' || t.type === typeFilter)
      .filter((t) => catFilter === 'all' || t.category === catFilter)
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [state.transactions, typeFilter, catFilter]);

  const totalIncome = filtered.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = filtered.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">Transactions</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Track every income and expense. Changes recalculate your entire budget automatically.
          </p>
        </div>
        <Button icon={<Plus size={16} />} onClick={() => setShowAdd(true)}>
          Add Transaction
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 dark:text-gray-500 mb-1">
            <TrendingUp size={14} className="text-emerald-500" /> Income
          </div>
          <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(totalIncome)}</div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 dark:text-gray-500 mb-1">
            <TrendingDown size={14} className="text-red-500" /> Expenses
          </div>
          <div className="text-lg font-bold text-gray-900 dark:text-white">{formatCurrency(totalExpense)}</div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 dark:text-gray-500 mb-1">
            <Receipt size={14} className="text-gray-400" /> Net
          </div>
          <div className={`text-lg font-bold ${totalIncome - totalExpense >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
            {formatCurrency(totalIncome - totalExpense)}
          </div>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 dark:text-gray-500">
          <Filter size={14} /> Filter:
        </div>
        <div className="flex gap-1 p-1 bg-gray-50 dark:bg-navy-700 rounded-lg">
          {(['all', 'income', 'expense'] as FilterType[]).map((f) => (
            <button
              key={f}
              onClick={() => setTypeFilter(f)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all capitalize ${
                typeFilter === f ? 'bg-white dark:bg-navy-800 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="w-40">
          <Select value={catFilter} onChange={(e) => setCatFilter(e.target.value as CatFilter)}>
            <option value="all">All categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </Select>
        </div>
      </div>

      {/* Transaction list */}
      <Card>
        <CardBody className="pt-2">
          {filtered.length === 0 ? (
            <EmptyState
              icon={<Receipt size={28} />}
              title="No transactions found"
              description="Add your first transaction or change your filters."
              action={<Button size="sm" icon={<Plus size={14} />} onClick={() => setShowAdd(true)}>Add Transaction</Button>}
            />
          ) : (
            <div className="divide-y divide-gray-50 dark:divide-navy-700">
              {filtered.map((tx) => (
                <div key={tx.id} className="flex items-center gap-3 py-3 group">
                  <div className={`p-2.5 rounded-xl flex-shrink-0 ${tx.type === 'income' ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400' : 'bg-gray-50 dark:bg-navy-700 text-gray-500 dark:text-gray-400'}`}>
                    <CategoryIcon category={tx.category} size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-200 truncate">
                        {tx.description}
                      </span>
                      {tx.isDemo && <DemoBadge />}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
                      <span>{tx.category}</span>
                      <span>·</span>
                      <span>{formatDate(tx.date)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-bold ${tx.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-700 dark:text-gray-300'}`}>
                      {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                    </span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setEditing(tx)}
                        className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-navy-700 dark:hover:text-gray-200 transition-colors"
                        aria-label="Edit"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => setDeleteId(tx.id)}
                        className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 dark:hover:text-red-400 transition-colors"
                        aria-label="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Add modal */}
      {showAdd && (
        <TransactionForm
          title="Add Transaction"
          onClose={() => setShowAdd(false)}
          onSubmit={(tx) => {
            onAdd(tx);
            setShowAdd(false);
          }}
        />
      )}

      {/* Edit modal */}
      {editing && (
        <TransactionForm
          title="Edit Transaction"
          transaction={editing}
          onClose={() => setEditing(null)}
          onSubmit={(tx) => {
            onUpdate(editing.id, tx);
            setEditing(null);
          }}
        />
      )}

      {/* Delete confirmation */}
      <ConfirmDialog
        open={!!deleteId}
        title="Delete transaction?"
        message="This will permanently remove the transaction and recalculate your budget."
        confirmLabel="Delete"
        danger
        onConfirm={() => {
          if (deleteId) onDelete(deleteId);
          setDeleteId(null);
        }}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}

interface FormProps {
  title: string;
  transaction?: Transaction;
  onClose: () => void;
  onSubmit: (tx: Omit<Transaction, 'id'>) => void;
}

function TransactionForm({ title, transaction, onClose, onSubmit }: FormProps) {
  const [type, setType] = useState<'income' | 'expense'>(transaction?.type || 'expense');
  const [amount, setAmount] = useState(transaction ? String(transaction.amount) : '');
  const [category, setCategory] = useState<Category>(transaction?.category || 'Food');
  const [description, setDescription] = useState(transaction?.description || '');
  const [date, setDate] = useState(transaction?.date || todayISO());
  const [error, setError] = useState('');

  const handleSubmit = () => {
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      setError('Enter a valid amount greater than zero.');
      return;
    }
    if (numAmount > 10000000) {
      setError('Amount is unreasonably large.');
      return;
    }
    if (!description.trim()) {
      setError('Please add a description.');
      return;
    }
    onSubmit({
      type,
      amount: numAmount,
      category,
      description: description.trim(),
      date,
    });
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={title}
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit}>Save</Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-2 p-1 bg-gray-50 dark:bg-navy-700 rounded-xl">
          <button
            onClick={() => setType('expense')}
            className={`py-2 text-sm font-semibold rounded-lg transition-all ${type === 'expense' ? 'bg-white dark:bg-navy-800 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500'}`}
          >
            Expense
          </button>
          <button
            onClick={() => setType('income')}
            className={`py-2 text-sm font-semibold rounded-lg transition-all ${type === 'income' ? 'bg-white dark:bg-navy-800 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500'}`}
          >
            Income
          </button>
        </div>
        <Input
          label="Amount (₹)"
          type="number"
          value={amount}
          onChange={(e) => { setAmount(e.target.value); setError(''); }}
          placeholder="0"
          min="0"
          error={error || undefined}
        />
        <CategorySelect label="Category" value={category} onChange={setCategory} />
        <Input
          label="Description"
          type="text"
          value={description}
          onChange={(e) => { setDescription(e.target.value); setError(''); }}
          placeholder="e.g. Lunch at cafeteria"
        />
        <Input
          label="Date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>
    </Modal>
  );
}
