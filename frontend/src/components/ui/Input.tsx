import { forwardRef, type InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className = '', id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              {icon}
            </div>
          )}
            <input
              ref={ref}
              id={inputId}
              className={`
                block w-full rounded-xl border bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md
                text-slate-900 dark:text-slate-100
                placeholder-slate-400 dark:placeholder-slate-500
                transition-all duration-300
                focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500
                disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:cursor-not-allowed
                hover:border-slate-400 dark:hover:border-slate-500
                ${icon ? 'pl-10' : 'pl-4'} pr-4 py-2.5 text-sm
                ${error
                  ? 'border-red-400 dark:border-red-500/50 focus:ring-red-500/50'
                  : 'border-slate-200 dark:border-white/10'
                }
                ${className}
              `}
            {...props}
          />
        </div>
        {error && (
          <p className="text-xs text-red-500 dark:text-red-400 mt-1 flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
