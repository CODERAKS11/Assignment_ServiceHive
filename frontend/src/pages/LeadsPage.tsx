import { useState, useEffect, useCallback } from 'react';
import { leadService } from '../services/leadService';
import { useAuth } from '../context/AuthContext';
import { useDebounce } from '../hooks/useDebounce';
import type { Lead, LeadFilters, PaginationMeta, CreateLeadPayload, UpdateLeadPayload, LeadStatus, LeadSource, SortOrder } from '../types';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Select from '../components/ui/Select';
import Spinner from '../components/ui/Spinner';
import EmptyState from '../components/ui/EmptyState';
import LeadFormModal from '../components/leads/LeadFormModal';
import LeadDetailModal from '../components/leads/LeadDetailModal';
import DeleteConfirmModal from '../components/leads/DeleteConfirmModal';
import toast from 'react-hot-toast';

const LeadsPage = () => {
  const { user } = useAuth();

  // Data state
  const [leads, setLeads] = useState<Lead[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Filter state
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState<LeadStatus | ''>('');
  const [sourceFilter, setSourceFilter] = useState<LeadSource | ''>('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('latest');
  const [currentPage, setCurrentPage] = useState(1);

  // Debounced search (300ms)
  const debouncedSearch = useDebounce(searchInput, 300);

  // Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [viewingLead, setViewingLead] = useState<Lead | null>(null);
  const [deletingLead, setDeletingLead] = useState<Lead | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch leads
  const fetchLeads = useCallback(async () => {
    setIsLoading(true);
    setError('');

    const filters: LeadFilters = {
      page: currentPage,
      limit: 10,
      sort: sortOrder,
    };

    if (statusFilter) filters.status = statusFilter;
    if (sourceFilter) filters.source = sourceFilter;
    if (debouncedSearch.trim()) filters.search = debouncedSearch.trim();

    try {
      const res = await leadService.getLeads(filters);
      if (res.data.success) {
        setLeads(res.data.data || []);
        setMeta(res.data.meta || null);
      }
    } catch {
      setError('Failed to load leads');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, sortOrder, statusFilter, sourceFilter, debouncedSearch]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, statusFilter, sourceFilter, sortOrder]);

  // Create lead
  const handleCreate = async (data: CreateLeadPayload | UpdateLeadPayload) => {
    setIsSubmitting(true);
    try {
      await leadService.createLead(data as CreateLeadPayload);
      toast.success('Lead created successfully');
      setShowCreateModal(false);
      fetchLeads();
    } catch {
      toast.error('Failed to create lead');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update lead
  const handleUpdate = async (data: CreateLeadPayload | UpdateLeadPayload) => {
    if (!editingLead) return;
    setIsSubmitting(true);
    try {
      await leadService.updateLead(editingLead._id, data as UpdateLeadPayload);
      toast.success('Lead updated successfully');
      setEditingLead(null);
      fetchLeads();
    } catch {
      toast.error('Failed to update lead');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete lead
  const handleDelete = async () => {
    if (!deletingLead) return;
    setIsDeleting(true);
    try {
      await leadService.deleteLead(deletingLead._id);
      toast.success('Lead deleted successfully');
      setDeletingLead(null);
      fetchLeads();
    } catch {
      toast.error('Failed to delete lead');
    } finally {
      setIsDeleting(false);
    }
  };

  // CSV Export
  const handleExportCsv = async () => {
    try {
      const filters: LeadFilters = { sort: sortOrder };
      if (statusFilter) filters.status = statusFilter;
      if (sourceFilter) filters.source = sourceFilter;
      if (debouncedSearch.trim()) filters.search = debouncedSearch.trim();

      const res = await leadService.exportCsv(filters);
      const blob = new Blob([res.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `leads_export_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('CSV exported successfully');
    } catch {
      toast.error('Failed to export CSV');
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchInput('');
    setStatusFilter('');
    setSourceFilter('');
    setSortOrder('latest');
    setCurrentPage(1);
  };

  const hasActiveFilters = searchInput || statusFilter || sourceFilter || sortOrder !== 'latest';

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Leads</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
            Manage and track your sales leads
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={handleExportCsv} size="sm">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export CSV
          </Button>
          <Button onClick={() => setShowCreateModal(true)}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Lead
          </Button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white/70 dark:bg-zinc-900/40 backdrop-blur-2xl rounded-3xl border border-slate-200/50 dark:border-white/5 p-5 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="block w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white/50 dark:bg-black/20 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all shadow-inner hover:border-slate-300 dark:hover:border-white/20"
            />
          </div>

          {/* Status filter */}
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as LeadStatus | '')}
            options={[
              { value: 'New', label: 'New' },
              { value: 'Contacted', label: 'Contacted' },
              { value: 'Qualified', label: 'Qualified' },
              { value: 'Lost', label: 'Lost' },
            ]}
            placeholder="All Status"
            className="md:w-44 py-3"
          />

          {/* Source filter */}
          <Select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value as LeadSource | '')}
            options={[
              { value: 'Website', label: 'Website' },
              { value: 'Instagram', label: 'Instagram' },
              { value: 'Referral', label: 'Referral' },
            ]}
            placeholder="All Sources"
            className="md:w-44 py-3"
          />

          {/* Sort */}
          <Select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as SortOrder)}
            options={[
              { value: 'latest', label: 'Latest first' },
              { value: 'oldest', label: 'Oldest first' },
            ]}
            className="md:w-44 py-3"
          />

          {/* Clear filters */}
          {hasActiveFilters && (
            <Button variant="ghost" size="md" onClick={clearFilters} className="shrink-0 h-11">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Table / Content */}
      <div className="bg-white/70 dark:bg-zinc-900/40 backdrop-blur-2xl rounded-3xl border border-slate-200/50 dark:border-white/5 overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Spinner size="lg" />
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-red-500 mb-3">{error}</p>
              <Button variant="secondary" onClick={fetchLeads} size="sm">Retry</Button>
            </div>
          </div>
        ) : leads.length === 0 ? (
          <EmptyState
            title="No leads found"
            description={
              hasActiveFilters
                ? 'Try adjusting your filters or search query'
                : 'Get started by adding your first lead'
            }
            action={
              !hasActiveFilters ? (
                <Button onClick={() => setShowCreateModal(true)} size="sm">
                  Add Your First Lead
                </Button>
              ) : (
                <Button variant="secondary" onClick={clearFilters} size="sm">
                  Clear Filters
                </Button>
              )
            }
          />
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                    <th className="text-left px-6 py-3.5 font-medium text-slate-500 dark:text-slate-400">Name</th>
                    <th className="text-left px-6 py-3.5 font-medium text-slate-500 dark:text-slate-400">Email</th>
                    <th className="text-left px-6 py-3.5 font-medium text-slate-500 dark:text-slate-400">Status</th>
                    <th className="text-left px-6 py-3.5 font-medium text-slate-500 dark:text-slate-400">Source</th>
                    <th className="text-left px-6 py-3.5 font-medium text-slate-500 dark:text-slate-400">Created</th>
                    <th className="text-right px-6 py-3.5 font-medium text-slate-500 dark:text-slate-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {leads.map((lead) => (
                    <tr
                      key={lead._id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                            {lead.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-slate-900 dark:text-white">{lead.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{lead.email}</td>
                      <td className="px-6 py-4">
                        <Badge variant="status" value={lead.status} />
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="source" value={lead.source} />
                      </td>
                      <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-xs">
                        {new Date(lead.createdAt).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => setViewingLead(lead)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors"
                            title="View details"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => setEditingLead(lead)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-colors"
                            title="Edit"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          {(user?.role === 'admin' || (lead.createdBy && typeof lead.createdBy === 'object' && lead.createdBy._id === user?.id)) && (
                            <button
                              onClick={() => setDeletingLead(lead)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                              title="Delete"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800">
              {leads.map((lead) => (
                <div key={lead._id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                        {lead.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">{lead.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{lead.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => setViewingLead(lead)} className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      <button onClick={() => setEditingLead(lead)} className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button onClick={() => setDeletingLead(lead)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-600">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="status" value={lead.status} />
                    <Badge variant="source" value={lead.source} />
                    <span className="text-xs text-slate-400 ml-auto">
                      {new Date(lead.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {meta && meta.totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-700">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Showing{' '}
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {(meta.page - 1) * meta.limit + 1}
                  </span>
                  {' '}-{' '}
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {Math.min(meta.page * meta.limit, meta.total)}
                  </span>
                  {' '}of{' '}
                  <span className="font-medium text-slate-700 dark:text-slate-300">{meta.total}</span>
                  {' '}leads
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={!meta.hasPrevPage}
                    onClick={() => setCurrentPage((p) => p - 1)}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Prev
                  </Button>
                  <span className="px-3 py-1.5 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-lg">
                    {meta.page} / {meta.totalPages}
                  </span>
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={!meta.hasNextPage}
                    onClick={() => setCurrentPage((p) => p + 1)}
                  >
                    Next
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      <LeadFormModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreate}
        isSubmitting={isSubmitting}
      />

      <LeadFormModal
        isOpen={!!editingLead}
        onClose={() => setEditingLead(null)}
        onSubmit={handleUpdate}
        lead={editingLead}
        isSubmitting={isSubmitting}
      />

      <LeadDetailModal
        isOpen={!!viewingLead}
        onClose={() => setViewingLead(null)}
        lead={viewingLead}
      />

      <DeleteConfirmModal
        isOpen={!!deletingLead}
        onClose={() => setDeletingLead(null)}
        onConfirm={handleDelete}
        leadName={deletingLead?.name || ''}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default LeadsPage;
