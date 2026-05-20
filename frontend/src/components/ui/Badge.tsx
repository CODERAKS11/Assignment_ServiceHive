import type { LeadStatus, LeadSource, UserRole } from '../../types';

interface BadgeProps {
  variant: 'status' | 'source' | 'role';
  value: LeadStatus | LeadSource | UserRole;
}

const statusColors: Record<LeadStatus, string> = {
  New: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 ring-blue-600/20',
  Contacted: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 ring-amber-600/20',
  Qualified: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 ring-emerald-600/20',
  Lost: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 ring-red-600/20',
};

const sourceColors: Record<LeadSource, string> = {
  Website: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300 ring-violet-600/20',
  Instagram: 'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300 ring-pink-600/20',
  Referral: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300 ring-cyan-600/20',
};

const roleColors: Record<UserRole, string> = {
  admin: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 ring-purple-600/20',
  sales_user: 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300 ring-teal-600/20',
};

const Badge = ({ variant, value }: BadgeProps) => {
  let colorClass = '';

  switch (variant) {
    case 'status':
      colorClass = statusColors[value as LeadStatus] || '';
      break;
    case 'source':
      colorClass = sourceColors[value as LeadSource] || '';
      break;
    case 'role':
      colorClass = roleColors[value as UserRole] || '';
      break;
  }

  const displayValue = variant === 'role' && value === 'sales_user' ? 'Sales' : value;

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold tracking-wide uppercase
        ring-1 ring-inset ${colorClass} shadow-sm
      `}
    >
      {variant === 'status' && (
        <span className="relative flex h-1.5 w-1.5">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${colorClass.split(' ')[0].replace('bg-', 'bg-').replace('-100', '-400')}`}></span>
          <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${colorClass.split(' ')[1].replace('text-', 'bg-')}`}></span>
        </span>
      )}
      {displayValue}
    </span>
  );
};

export default Badge;
