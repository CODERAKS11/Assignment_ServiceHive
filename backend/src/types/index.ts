import { Request } from 'express';
import { Types } from 'mongoose';

export type UserRole = 'admin' | 'sales_user';
export type LeadStatus = 'New' | 'Contacted' | 'Qualified' | 'Lost';
export type LeadSource = 'Website' | 'Instagram' | 'Referral';
export type SortOrder = 'latest' | 'oldest';

export interface IUser {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface ILead {
  _id: Types.ObjectId;
  name: string;
  email: string;
  status: LeadStatus;
  source: LeadSource;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: UserRole;
    email: string;
  };
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  meta?: PaginationMeta;
  errors?: Record<string, string[]>;
}

export interface LeadFilters {
  status?: LeadStatus;
  source?: LeadSource;
  search?: string;
  sort?: SortOrder;
  page?: number;
  limit?: number;
}

export interface JwtPayload {
  id: string;
  role: UserRole;
  email: string;
}
