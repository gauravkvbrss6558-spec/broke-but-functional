import type { ReactNode } from 'react';
import { Wallet, TrendingUp, TrendingDown, Target, AlertTriangle, Shield } from 'lucide-react';
import type { RiskLevel } from '@/types';

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {icon && (
        <div className="mb-3 p-3 rounded-2xl bg-gray-50 dark:bg-navy-700 text-gray-300 dark:text-gray-500">
          {icon}
        </div>
      )}
      <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-300">{title}</h4>
      {description && (
        <p className="mt-1 text-xs text-gray-400 dark:text-gray-500 max-w-xs">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function RiskBadge({ level }: { level: RiskLevel }) {
  const config = {
    Low: {
      icon: Shield,
      bg: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400',
      border: 'border-emerald-200 dark:border-emerald-800/50',
    },
    Moderate: {
      icon: AlertTriangle,
      bg: 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400',
      border: 'border-amber-200 dark:border-amber-800/50',
    },
    High: {
      icon: AlertTriangle,
      bg: 'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400',
      border: 'border-red-200 dark:border-red-800/50',
    },
  };

  const { icon: Icon, bg, border } = config[level];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${bg} ${border}`}
    >
      <Icon size={12} />
      {level} Risk
    </span>
  );
}

export function ChangeBadge({ value, suffix = '' }: { value: number; suffix?: string }) {
  if (value === 0) return null;
  const isPositive = value > 0;
  const Icon = isPositive ? TrendingUp : TrendingDown;

  return (
    <span
      className={`inline-flex items-center gap-0.5 text-xs font-semibold ${
        isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
      }`}
    >
      <Icon size={12} />
      {isPositive ? '+' : ''}{suffix}{Math.abs(value)}
    </span>
  );
}

export function DemoBadge() {
  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-gray-500 dark:bg-navy-700 dark:text-gray-400">
      Demo
    </span>
  );
}

export { Wallet, Target };
