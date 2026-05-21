import api from './api';
import type {
  ApiResponse,
  AuthData,
  Lead,
  LeadFilters,
  LeadStats,
  CreateLeadPayload,
  UpdateLeadPayload,
} from '../types';

// ========================================
// AUTH SERVICES
// ========================================

export const authService = {
  register: (data: { name: string; email: string; password: string; role?: string }) =>
    api.post<ApiResponse<AuthData>>('/auth/register', data),

  login: (data: { email: string; password: string }) =>
    api.post<ApiResponse<AuthData>>('/auth/login', data),

  getMe: () => api.get<ApiResponse<{ user: AuthData['user'] }>>('/auth/me'),
};

// ========================================
// LEAD SERVICES
// ========================================

export const leadService = {
  getLeads: (filters: LeadFilters) => {
    const params = new URLSearchParams();
    if (filters.status) params.set('status', filters.status);
    if (filters.source) params.set('source', filters.source);
    if (filters.search) params.set('search', filters.search);
    if (filters.sort) params.set('sort', filters.sort);
    if (filters.page) params.set('page', String(filters.page));
    if (filters.limit) params.set('limit', String(filters.limit));

    return api.get<ApiResponse<Lead[]>>(`/leads?${params.toString()}`);
  },

  getLead: (id: string) => api.get<ApiResponse<Lead>>(`/leads/${id}`),

  createLead: (data: CreateLeadPayload) =>
    api.post<ApiResponse<Lead>>('/leads', data),

  updateLead: (id: string, data: UpdateLeadPayload) =>
    api.patch<ApiResponse<Lead>>(`/leads/${id}`, data),

  deleteLead: (id: string) => api.delete<ApiResponse<null>>(`/leads/${id}`),

  getStats: () => api.get<ApiResponse<LeadStats>>('/leads/stats'),

  exportCsv: (filters: LeadFilters) => {
    const params = new URLSearchParams();
    if (filters.status) params.set('status', filters.status);
    if (filters.source) params.set('source', filters.source);
    if (filters.search) params.set('search', filters.search);
    if (filters.sort) params.set('sort', filters.sort);

    return api.get(`/leads/export?${params.toString()}`, {
      responseType: 'blob',
    });
  },
};
