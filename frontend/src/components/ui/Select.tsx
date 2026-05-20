import type { SelectHTMLAttributes } from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  error?: string;
  placeholder?: string;
}

const Select = ({
  label,
  options,
  error,
  placeholder,
  className = '',
  id,
  ...props
}: SelectProps) => {
  const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="space-y-1.5">
      {label && (
        <label
          htmlFor={selectId}
          className="block text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={`
          block w-full rounded-xl border bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md
          text-slate-900 dark:text-slate-100
          transition-all duration-300
          focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500
          disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:cursor-not-allowed
          hover:border-slate-400 dark:hover:border-slate-500
          px-4 py-2.5 text-sm appearance-none
          bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2012%2012%22%3E%3Cpath%20fill%3D%22%23475569%22%20d%3D%22M3.5%204.5L6%207l2.5-2.5%22%2F%3E%3C%2Fsvg%3E')]
          bg-[length:12px] bg-[right_16px_center] bg-no-repeat
          ${error
            ? 'border-red-400 dark:border-red-500/50 focus:ring-red-500/50'
            : 'border-slate-200 dark:border-white/10'
          }
          ${className}
        `}
        {...props}
      >
        {placeholder && (
          <option value="">{placeholder}</option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="text-xs text-red-500 dark:text-red-400">{error}</p>
      )}
    </div>
  );
};

export default Select;
