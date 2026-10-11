interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  color?: 'emerald' | 'amber' | 'red' | 'navy';
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
}

const colorClasses = {
  emerald: 'bg-emerald-500',
  amber: 'bg-amber-500',
  red: 'bg-red-500',
  navy: 'bg-navy-700 dark:bg-navy-600',
};

const sizeClasses = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-3.5',
};

export function ProgressBar({
  value,
  max = 100,
  label,
  color = 'emerald',
  size = 'md',
  showValue = false,
}: ProgressBarProps) {
  const percent = Math.max(0, Math.min(100, (value / max) * 100));

  return (
    <div className="w-full">
      {label && (
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{label}</span>
          {showValue && (
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              {Math.round(percent)}%
            </span>
          )}
        </div>
      )}
      <div
        className={`w-full ${sizeClasses[size]} rounded-full bg-gray-100 dark:bg-navy-700 overflow-hidden`}
        role="progressbar"
        aria-valuenow={Math.round(percent)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label || undefined}
      >
        <div
          className={`h-full ${colorClasses[color]} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
