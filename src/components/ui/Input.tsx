import { useId } from 'react';
import type { InputHTMLAttributes, SelectHTMLAttributes } from 'react';
import { CATEGORIES } from '@/types';
import type { Category } from '@/types';

const inputBase =
  'w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 ' +
  'border-gray-200 transition-colors focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 ' +
  'dark:bg-navy-800 dark:text-white dark:border-navy-600 dark:placeholder-gray-500 ' +
  'dark:focus:border-emerald-500 dark:focus:ring-emerald-500/20';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className = '', id, ...props }: InputProps) {
  const autoId = useId();
  const inputId = id || autoId;
  return (
    <div>
      {label && (
        <label htmlFor={inputId} className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
          {label}
        </label>
      )}
      <input id={inputId} className={`${inputBase} ${error ? 'border-red-400 dark:border-red-500' : ''} ${className}`} {...props} />
      {error && <p className="mt-1 text-xs text-red-600 dark:text-red-400" role="alert">{error}</p>}
    </div>
  );
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export function Select({ label, error, className = '', children, id, ...props }: SelectProps) {
  const autoId = useId();
  const selectId = id || autoId;
  return (
    <div>
      {label && (
        <label htmlFor={selectId} className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
          {label}
        </label>
      )}
      <select id={selectId} className={`${inputBase} ${error ? 'border-red-400' : ''} ${className}`} {...props}>
        {children}
      </select>
      {error && <p className="mt-1 text-xs text-red-600 dark:text-red-400" role="alert">{error}</p>}
    </div>
  );
}

interface CategorySelectProps {
  label?: string;
  value: Category;
  onChange: (value: Category) => void;
  error?: string;
}

export function CategorySelect({ label, value, onChange, error }: CategorySelectProps) {
  return (
    <Select label={label} error={error} value={value} onChange={(e) => onChange(e.target.value as Category)}>
      {CATEGORIES.map((cat) => (
        <option key={cat} value={cat}>
          {cat}
        </option>
      ))}
    </Select>
  );
}
