import { useState, useEffect } from 'react';
import { leadService } from '../services/leadService';
import { useAuth } from '../context/AuthContext';
import type { LeadStats } from '../types';
import Spinner from '../components/ui/Spinner';

const DashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<LeadStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await leadService.getStats();
        if (res.data.success && res.data.data) {
          setStats(res.data.data);
        }
      } catch {
        setError('Failed to load dashboard statistics');
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <svg className="w-12 h-12 text-red-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <p className="text-slate-600 dark:text-slate-400">{error}</p>
        </div>
      </div>
    );
  }

  const statusCards = [
    {
      label: 'Total Leads',
      value: stats?.total || 0,
      icon: '📊',
      gradient: 'from-indigo-500 to-purple-600',
      bgLight: 'bg-indigo-50 dark:bg-indigo-500/10',
    },
    {
      label: 'New',
      value: stats?.byStatus.New || 0,
      icon: '🆕',
      gradient: 'from-blue-500 to-cyan-500',
      bgLight: 'bg-blue-50 dark:bg-blue-500/10',
    },
    {
      label: 'Contacted',
      value: stats?.byStatus.Contacted || 0,
      icon: '📞',
      gradient: 'from-amber-500 to-orange-500',
      bgLight: 'bg-amber-50 dark:bg-amber-500/10',
    },
    {
      label: 'Qualified',
      value: stats?.byStatus.Qualified || 0,
      icon: '✅',
      gradient: 'from-emerald-500 to-green-500',
      bgLight: 'bg-emerald-50 dark:bg-emerald-500/10',
    },
    {
      label: 'Lost',
      value: stats?.byStatus.Lost || 0,
      icon: '❌',
      gradient: 'from-red-500 to-rose-500',
      bgLight: 'bg-red-50 dark:bg-red-500/10',
    },
  ];

  const sourceData = [
    { label: 'Website', value: stats?.bySource.Website || 0, color: 'bg-violet-500' },
    { label: 'Instagram', value: stats?.bySource.Instagram || 0, color: 'bg-pink-500' },
    { label: 'Referral', value: stats?.bySource.Referral || 0, color: 'bg-cyan-500' },
  ];

  const totalSourceLeads = sourceData.reduce((sum, s) => sum + s.value, 0);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Welcome back, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Here&apos;s what&apos;s happening with your leads today
        </p>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {statusCards.map((card, i) => (
          <div
            key={card.label}
            className="group relative bg-white/70 dark:bg-zinc-900/40 backdrop-blur-2xl rounded-3xl border border-slate-200/50 dark:border-white/5 p-6 hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-black/20 transition-all duration-300 hover:-translate-y-1"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className={`w-12 h-12 rounded-2xl ${card.bgLight} flex items-center justify-center text-xl mb-4 shadow-inner`}>
              {card.icon}
            </div>
            <p className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{card.value}</p>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">{card.label}</p>
            <div className={`absolute inset-x-0 bottom-0 h-1.5 rounded-b-3xl bg-gradient-to-r ${card.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
          </div>
        ))}
      </div>

      {/* Source Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/70 dark:bg-zinc-900/40 backdrop-blur-2xl rounded-3xl border border-slate-200/50 dark:border-white/5 p-7">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 tracking-tight">
            Leads by Source
          </h2>
          <div className="space-y-5">
            {sourceData.map((source) => {
              const percentage = totalSourceLeads > 0 ? Math.round((source.value / totalSourceLeads) * 100) : 0;
              return (
                <div key={source.label} className="group">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{source.label}</span>
                    <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                      {source.value} ({percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-3 bg-slate-100/50 dark:bg-black/20 rounded-full overflow-hidden shadow-inner">
                    <div
                      className={`h-full ${source.color} rounded-full transition-all duration-1000 ease-out group-hover:brightness-110`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Info Card */}
        <div className="bg-white/70 dark:bg-zinc-900/40 backdrop-blur-2xl rounded-3xl border border-slate-200/50 dark:border-white/5 p-7">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 tracking-tight">
            Leads by Status
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {statusCards.slice(1).map((card) => {
              const percentage = stats && stats.total > 0
                ? Math.round((card.value / stats.total) * 100)
                : 0;
              return (
                <div key={card.label} className={`rounded-2xl ${card.bgLight} p-5 transition-transform duration-300 hover:scale-[1.02]`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{card.icon}</span>
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{card.label}</span>
                  </div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{card.value}</p>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">{percentage}% of pipeline</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
