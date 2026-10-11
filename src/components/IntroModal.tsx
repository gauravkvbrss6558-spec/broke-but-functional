import { Zap, ArrowRight } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

interface IntroModalProps {
  open: boolean;
  onClose: () => void;
}

export function IntroModal({ open, onClose }: IntroModalProps) {
  return (
    <Modal open={open} onClose={onClose} title="Welcome to Broke But Functional" size="lg">
      <div className="space-y-5">
        <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30">
          <div className="p-3 rounded-xl bg-emerald-600 text-white">
            <Zap size={24} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">You have ₹10,000 for 30 days.</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Can you make it to Day 30?</p>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Here's how to use this app:
          </p>

          <div className="space-y-2.5">
            <Step
              num="1"
              title="Check your dashboard"
              desc="See your balance, safe daily spending, savings progress, and financial health at a glance."
            />
            <Step
              num="2"
              title="Use the Decision Simulator"
              desc="Before you buy something, simulate it. Enter an amount and instantly see how it affects your balance, daily allowance, savings goals, and month-end projection — without actually spending anything."
            />
            <Step
              num="3"
              title="Track transactions & commitments"
              desc="Record income and expenses, manage fixed bills and subscriptions, and set savings goals."
            />
            <Step
              num="4"
              title="Watch your forecast"
              desc="See your projected balance across all 30 days, and check your financial health score to understand your risk level."
            />
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 dark:border-navy-700 p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            <span className="font-semibold text-gray-700 dark:text-gray-300">Demo data included.</span> Your budget starts with example transactions, commitments, and a savings goal — all marked "Demo". You can edit or delete any of them, and reset to the demo data anytime from the sidebar.
          </p>
        </div>

        <Button onClick={onClose} className="w-full" icon={<ArrowRight size={16} />}>
          Get started
        </Button>
      </div>
    </Modal>
  );
}

function Step({ num, title, desc }: { num: string; title: string; desc: string }) {
  return (
    <div className="flex gap-3">
      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-navy-800 dark:bg-navy-700 text-white text-xs font-bold flex items-center justify-center">
        {num}
      </div>
      <div>
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-200">{title}</h4>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{desc}</p>
      </div>
    </div>
  );
}
