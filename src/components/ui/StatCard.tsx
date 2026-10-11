interface StatCardProps {
  label: string;
  value: string;
  sublabel?: string;
  icon?: React.ReactNode;
  accent?: 'default' | 'emerald' | 'amber' | 'red';
}

const accentClasses = {
  default: 'text-gray-900 dark:text-white',
  emerald: 'text-emerald-600 dark:text-emerald-400',
  amber: 'text-amber-600 dark:text-amber-400',
  red: 'text-red-600 dark:text-red-400',
};

const iconAccentClasses = {
  default: 'text-gray-400 dark:text-gray-500',
  emerald: 'text-emerald-500',
  amber: 'text-amber-500',
  red: 'text-red-500',
};

export function StatCard({ label, value, sublabel, icon, accent = 'default' }: StatCardProps) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white px-4 py-3.5 dark:border-navy-700 dark:bg-navy-800">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
          {label}
        </span>
        {icon && <span className={iconAccentClasses[accent]}>{icon}</span>}
      </div>
      <div className={`text-xl font-bold tracking-tight ${accentClasses[accent]}`}>
        {value}
      </div>
      {sublabel && (
        <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
          {sublabel}
        </div>
      )}
    </div>
  );
}
