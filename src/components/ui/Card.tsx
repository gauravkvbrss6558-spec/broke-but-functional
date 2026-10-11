import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

export function Card({ children, className = '', onClick, hoverable = false }: CardProps) {
  if (onClick) {
    return (
      <div
        className={[
          'rounded-2xl border bg-white border-gray-200',
          'dark:bg-navy-800 dark:border-navy-700',
          hoverable ? 'transition-all duration-200 hover:border-emerald-400/50 dark:hover:border-emerald-500/40 hover:shadow-lg dark:hover:shadow-emerald-500/5' : '',
          'cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500',
          className,
        ].join(' ')}
        onClick={onClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick();
          }
        }}
        role="button"
        tabIndex={0}
      >
        {children}
      </div>
    );
  }

  return (
    <div
      className={[
        'rounded-2xl border bg-white border-gray-200',
        'dark:bg-navy-800 dark:border-navy-700',
        hoverable ? 'transition-all duration-200 hover:border-emerald-400/50 dark:hover:border-emerald-500/40 hover:shadow-lg dark:hover:shadow-emerald-500/5' : '',
        className,
      ].join(' ')}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  title: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function CardHeader({ title, icon, action, className = '' }: CardHeaderProps) {
  return (
    <div className={`flex items-center justify-between px-5 pt-5 pb-3 ${className}`}>
      <div className="flex items-center gap-2">
        {icon && <span className="text-emerald-600 dark:text-emerald-400">{icon}</span>}
        <h3 className="text-sm font-semibold tracking-tight text-gray-700 dark:text-gray-200">
          {title}
        </h3>
      </div>
      {action}
    </div>
  );
}

export function CardBody({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`px-5 pb-5 ${className}`}>{children}</div>;
}
