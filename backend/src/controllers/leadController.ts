import { Response } from 'express';
import Lead from '../models/Lead';
import { AuthRequest, ApiResponse, LeadFilters } from '../types';
import { asyncHandler } from '../middleware/errorHandler';
import { AppError, ForbiddenError, NotFoundError } from '../utils/AppError';
import mongoose from 'mongoose';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;

/**
 * Build a MongoDB filter query from the request query parameters,
 * applying RBAC (sales_user only sees own leads).
 */
const buildFilterQuery = (
  query: LeadFilters,
  userId: string,
  userRole: string
): mongoose.FilterQuery<typeof Lead> => {
  const filter: mongoose.FilterQuery<typeof Lead> = {};

  // RBAC: Sales users only see their own leads
  if (userRole === 'sales_user') {
    filter.createdBy = new mongoose.Types.ObjectId(userId);
  }

  // Status filter
  if (query.status) {
    filter.status = query.status;
  }

  // Source filter
  if (query.source) {
    filter.source = query.source;
  }

  // Search by name or email using regex for partial matching
  if (query.search && query.search.trim()) {
    const searchRegex = new RegExp(query.search.trim(), 'i');
    filter.$or = [{ name: searchRegex }, { email: searchRegex }];
  }

  return filter;
};

/**
 * @route   GET /api/leads
 * @desc    Get all leads with filters, search, sort, and pagination
 * @access  Private
 */
export const getLeads = asyncHandler(async (req: AuthRequest, res: Response<ApiResponse>) => {
  if (!req.user) {
    throw new AppError('Authentication required', 401);
  }

  const {
    status,
    source,
    search,
    sort = 'latest',
    page: pageStr,
    limit: limitStr,
  } = req.query as Record<string, string | undefined>;

  const page = Math.max(1, parseInt(pageStr || String(DEFAULT_PAGE), 10) || DEFAULT_PAGE);
  const limit = Math.max(1, Math.min(100, parseInt(limitStr || String(DEFAULT_LIMIT), 10) || DEFAULT_LIMIT));
  const skip = (page - 1) * limit;

  const filters: LeadFilters = { status, source, search } as LeadFilters;
  const filter = buildFilterQuery(filters, req.user.id, req.user.role);

  // Sort order
  const sortOrder = sort === 'oldest' ? 1 : -1;

  const [leads, total] = await Promise.all([
    Lead.find(filter)
      .sort({ createdAt: sortOrder })
      .skip(skip)
      .limit(limit)
      .populate('createdBy', 'name email')
      .lean(),
    Lead.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(total / limit);

  res.status(200).json({
    success: true,
    data: leads,
    meta: {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  });
});

/**
 * @route   GET /api/leads/:id
 * @desc    Get a single lead by ID
 * @access  Private
 */
export const getLead = asyncHandler(async (req: AuthRequest, res: Response<ApiResponse>) => {
  if (!req.user) {
    throw new AppError('Authentication required', 401);
  }

  const lead = await Lead.findById(req.params.id)
    .populate('createdBy', 'name email')
    .populate('activities.performedBy', 'name email')
    .lean();

  if (!lead) {
    throw new NotFoundError('Lead');
  }

  // RBAC: Sales users can only view their own leads
  if (
    req.user.role === 'sales_user' &&
    lead.createdBy &&
    typeof lead.createdBy === 'object' &&
    '_id' in lead.createdBy &&
    lead.createdBy._id.toString() !== req.user.id
  ) {
    throw new ForbiddenError('You can only view your own leads');
  }

  res.status(200).json({
    success: true,
    data: lead,
  });
});

/**
 * @route   POST /api/leads
 * @desc    Create a new lead
 * @access  Private
 */
export const createLead = asyncHandler(async (req: AuthRequest, res: Response<ApiResponse>) => {
  if (!req.user) {
    throw new AppError('Authentication required', 401);
  }

  const leadData = {
    ...req.body,
    createdBy: req.user.id,
    activities: [
      {
        action: `Lead created via ${req.body.source || 'Unknown'}`,
        performedBy: req.user.id,
      },
    ],
  };

  const lead = await Lead.create(leadData);

  const populated = await Lead.findById(lead._id)
    .populate('createdBy', 'name email')
    .populate('activities.performedBy', 'name email')
    .lean();

  res.status(201).json({
    success: true,
    message: 'Lead created successfully',
    data: populated,
  });
});

/**
 * @route   PATCH /api/leads/:id
 * @desc    Update a lead
 * @access  Private
 */
export const updateLead = asyncHandler(async (req: AuthRequest, res: Response<ApiResponse>) => {
  if (!req.user) {
    throw new AppError('Authentication required', 401);
  }

  const lead = await Lead.findById(req.params.id);

  if (!lead) {
    throw new NotFoundError('Lead');
  }

  // RBAC: Sales users can only update their own leads
  if (req.user.role === 'sales_user' && lead.createdBy.toString() !== req.user.id) {
    throw new ForbiddenError('You can only update your own leads');
  }

  // Check what changed
  const updates: any = { ...req.body };
  const newActivities = [];
  
  if (req.body.status && req.body.status !== lead.status) {
    newActivities.push({
      action: `Status changed to ${req.body.status}`,
      performedBy: req.user.id,
    });
  } else if (Object.keys(req.body).length > 0) {
    newActivities.push({
      action: 'Lead details updated',
      performedBy: req.user.id,
    });
  }

  const updateQuery: any = { $set: updates };
  if (newActivities.length > 0) {
    updateQuery.$push = { activities: { $each: newActivities } };
  }

  const updated = await Lead.findByIdAndUpdate(req.params.id, updateQuery, {
    new: true,
    runValidators: true,
  })
    .populate('createdBy', 'name email')
    .populate('activities.performedBy', 'name email')
    .lean();

  res.status(200).json({
    success: true,
    message: 'Lead updated successfully',
    data: updated,
  });
});

/**
 * @route   DELETE /api/leads/:id
 * @desc    Delete a lead
 * @access  Private (Admin: any lead, Sales: own leads only)
 */
export const deleteLead = asyncHandler(async (req: AuthRequest, res: Response<ApiResponse>) => {
  if (!req.user) {
    throw new AppError('Authentication required', 401);
  }

  const lead = await Lead.findById(req.params.id);

  if (!lead) {
    throw new NotFoundError('Lead');
  }

  // RBAC: Sales users can only delete their own leads
  if (req.user.role === 'sales_user' && lead.createdBy.toString() !== req.user.id) {
    throw new ForbiddenError('You can only delete your own leads');
  }

  await Lead.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Lead deleted successfully',
  });
});

/**
 * @route   GET /api/leads/export
 * @desc    Export leads as CSV based on current filters
 * @access  Private
 */
export const exportLeads = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('Authentication required', 401);
  }

  const { status, source, search, sort = 'latest' } = req.query as Record<string, string | undefined>;

  const filters: LeadFilters = { status, source, search } as LeadFilters;
  const filter = buildFilterQuery(filters, req.user.id, req.user.role);

  const sortOrder = sort === 'oldest' ? 1 : -1;

  const leads = await Lead.find(filter)
    .sort({ createdAt: sortOrder })
    .populate('createdBy', 'name email')
    .lean();

  // Build CSV content
  const csvHeaders = ['Name', 'Email', 'Status', 'Source', 'Created By', 'Created At'];
  const csvRows = leads.map((lead) => {
    const createdByName =
      lead.createdBy && typeof lead.createdBy === 'object' && 'name' in lead.createdBy
        ? (lead.createdBy as { name: string }).name
        : 'N/A';
    return [
      `"${lead.name}"`,
      `"${lead.email}"`,
      `"${lead.status}"`,
      `"${lead.source}"`,
      `"${createdByName}"`,
      `"${new Date(lead.createdAt).toISOString()}"`,
    ].join(',');
  });

  const csv = [csvHeaders.join(','), ...csvRows].join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename=leads_export_${Date.now()}.csv`);
  res.status(200).send(csv);
});

/**
 * @route   GET /api/leads/stats
 * @desc    Get lead statistics for dashboard
 * @access  Private (Admin sees all, Sales sees own)
 */
export const getLeadStats = asyncHandler(async (req: AuthRequest, res: Response<ApiResponse>) => {
  if (!req.user) {
    throw new AppError('Authentication required', 401);
  }

  const matchStage: mongoose.PipelineStage.Match['$match'] = {};
  if (req.user.role === 'sales_user') {
    matchStage.createdBy = new mongoose.Types.ObjectId(req.user.id);
  }

  const [statusStats, sourceStats, totalCount] = await Promise.all([
    Lead.aggregate([
      { $match: matchStage },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    Lead.aggregate([
      { $match: matchStage },
      { $group: { _id: '$source', count: { $sum: 1 } } },
    ]),
    Lead.countDocuments(matchStage),
  ]);

  const statusMap: Record<string, number> = { New: 0, Contacted: 0, Qualified: 0, Lost: 0 };
  statusStats.forEach((s: { _id: string; count: number }) => {
    statusMap[s._id] = s.count;
  });

  const sourceMap: Record<string, number> = { Website: 0, Instagram: 0, Referral: 0 };
  sourceStats.forEach((s: { _id: string; count: number }) => {
    sourceMap[s._id] = s.count;
  });

  res.status(200).json({
    success: true,
    data: {
      total: totalCount,
      byStatus: statusMap,
      bySource: sourceMap,
    },
  });
});
