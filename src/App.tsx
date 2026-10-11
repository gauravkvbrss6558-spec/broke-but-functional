import { useState, useMemo } from 'react';
import { useFinanceState } from '@/hooks/useFinanceState';
import { useTheme } from '@/hooks/useTheme';
import { computeMetrics } from '@/lib/calculations';
import { Sidebar, type ViewKey } from '@/components/Sidebar';
import { IntroModal } from '@/components/IntroModal';
import { Dashboard } from '@/components/views/Dashboard';
import { DecisionSimulator } from '@/components/views/DecisionSimulator';
import { Transactions } from '@/components/views/Transactions';
import { Commitments } from '@/components/views/Commitments';
import { SavingsGoals } from '@/components/views/SavingsGoals';
import { Forecast } from '@/components/views/Forecast';
import { FinancialHealth } from '@/components/views/FinancialHealth';
import type { SimDecision } from '@/types';

function App() {
  const {
    state,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addCommitment,
    toggleCommitmentPaid,
    deleteCommitment,
    addSubscription,
    toggleSubscriptionPaid,
    deleteSubscription,
    addSavingsGoal,
    contributeToGoal,
    deleteSavingsGoal,
    markIntroSeen,
    resetAll,
  } = useFinanceState();

  const { theme, toggleTheme } = useTheme();
  const [view, setView] = useState<ViewKey>('dashboard');

  const metrics = useMemo(() => computeMetrics(state), [state]);

  const handleApplyDecision = (decision: SimDecision) => {
    if (decision.type === 'expense') {
      addTransaction({
        type: 'expense',
        amount: decision.amount,
        category: decision.category,
        description: decision.description,
        date: new Date().toISOString().split('T')[0],
      });
    } else if (decision.type === 'savings' && decision.savingsGoalId) {
      contributeToGoal(decision.savingsGoalId, decision.amount);
    }
  };

  return (
    <div className="min-h-screen bg-cream-50 dark:bg-navy-950 theme-transition">
      <Sidebar
        current={view}
        onNavigate={setView}
        theme={theme}
        onToggleTheme={toggleTheme}
        onReset={resetAll}
      />

      <main className="lg:ml-64 pt-14 lg:pt-0 min-h-screen">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          {view === 'dashboard' && (
            <Dashboard state={state} metrics={metrics} onNavigate={setView} />
          )}
          {view === 'simulator' && (
            <DecisionSimulator state={state} onApplyDecision={handleApplyDecision} />
          )}
          {view === 'transactions' && (
            <Transactions
              state={state}
              onAdd={addTransaction}
              onUpdate={updateTransaction}
              onDelete={deleteTransaction}
            />
          )}
          {view === 'commitments' && (
            <Commitments
              state={state}
              onAddCommitment={addCommitment}
              onToggleCommitment={toggleCommitmentPaid}
              onDeleteCommitment={deleteCommitment}
              onAddSubscription={addSubscription}
              onToggleSubscription={toggleSubscriptionPaid}
              onDeleteSubscription={deleteSubscription}
            />
          )}
          {view === 'savings' && (
            <SavingsGoals
              state={state}
              onAddGoal={addSavingsGoal}
              onContribute={contributeToGoal}
              onDeleteGoal={deleteSavingsGoal}
            />
          )}
          {view === 'forecast' && <Forecast state={state} />}
          {view === 'health' && <FinancialHealth state={state} metrics={metrics} />}
        </div>
      </main>

      <IntroModal open={!state.hasSeenIntro} onClose={markIntroSeen} />
    </div>
  );
}

export default App;
