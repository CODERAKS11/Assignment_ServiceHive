import type { Lead } from '../../types';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';

interface LeadDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead | null;
}

const LeadDetailModal = ({ isOpen, onClose, lead }: LeadDetailModalProps) => {
  if (!lead) return null;

  const formatDate = (dateString: Date | string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatDateTime = (dateString: Date | string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).toLowerCase();
  };

  // Sort activities newest first
  const activities = [...(lead.activities || [])].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Lead Details" size="md">
      <div className="space-y-6">
        {/* Top Profile Area */}
        <div className="flex items-start gap-4 pb-6 border-b border-slate-200 dark:border-white/10">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-violet-500/20 shrink-0">
            {lead.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-tight tracking-tight">{lead.name}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">{lead.email}</p>
            <Badge variant="status" value={lead.status} />
          </div>
        </div>

        {/* Contact Info */}
        <div>
          <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 tracking-wider uppercase mb-4">Contact Info</h4>
          <div className="space-y-4 bg-slate-50/50 dark:bg-white/5 rounded-2xl p-5 border border-slate-100 dark:border-white/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="text-sm font-medium">Email</span>
              </div>
              <a href={`mailto:${lead.email}`} className="text-sm font-medium text-violet-600 dark:text-violet-400 hover:underline">{lead.email}</a>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span className="text-sm font-medium">Source</span>
              </div>
              <span className="text-sm font-semibold text-slate-900 dark:text-slate-200">{lead.source}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-sm font-medium">Created</span>
              </div>
              <span className="text-sm font-semibold text-slate-900 dark:text-slate-200">{formatDateTime(lead.createdAt)}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span className="text-sm font-medium">Updated</span>
              </div>
              <span className="text-sm font-semibold text-slate-900 dark:text-slate-200">{formatDate(lead.updatedAt)}</span>
            </div>
          </div>
        </div>

        {/* Activity */}
        {activities.length > 0 && (
          <div>
            <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 tracking-wider uppercase mb-5">Activity Log</h4>
            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[5px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-slate-200 before:via-slate-200 before:to-transparent dark:before:from-white/10 dark:before:via-white/10 dark:before:to-transparent">
              {activities.map((activity, index) => (
                <div key={index} className="relative flex items-start gap-4">
                  <div className={`w-3 h-3 mt-1.5 rounded-full bg-violet-500 ring-4 ring-white dark:ring-zinc-800 z-10 shrink-0 shadow-sm`} />
                  <div className="bg-slate-50 dark:bg-white/5 rounded-xl p-3 flex-1 border border-slate-100 dark:border-white/5 shadow-sm">
                    <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{activity.action}</p>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
                      {formatDateTime(activity.createdAt)} · {activity.performedBy.name}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default LeadDetailModal;
