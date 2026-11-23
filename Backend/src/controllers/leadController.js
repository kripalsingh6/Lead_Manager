// ─────────────────────────────────────────────
// Lead Controller
//
// Every query is scoped to req.user.id so users
// can only access their own leads.
//
// GET    /api/leads              — paginated list with search, filter, sort
// POST   /api/leads              — create lead
// GET    /api/leads/:id          — single lead
// PUT    /api/leads/:id          — update lead
// DELETE /api/leads/:id          — delete lead
// GET    /api/leads/dashboard/stats — count per status
// ─────────────────────────────────────────────
import { Op } from 'sequelize';
import { Lead, sequelize } from '../models/index.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

// ── Column map — translates API sort fields to DB columns ──
const SORT_MAP = {
  createdAt: 'created_at',
  name: 'name',
  email: 'email',
  company: 'company',
  status: 'status',
  source: 'source'
};

/**
 * Escapes PostgreSQL LIKE/ILIKE special wildcard characters
 * @param {string} str
 * @returns {string}
 */
const escapeLikeString = (str) => {
  return str.replace(/[%_\\]/g, '\\$&');
};

/**
 * @desc    List leads with pagination, search, filter, sort
 * @route   GET /api/leads
 * @access  Private
 */
export const getAllLeads = asyncHandler(async (req, res) => {
  const { page, limit, search, status, source, sortBy, order } = req.query;

  // ── Build WHERE clause (always user-scoped) ─
  const where = { userId: req.user.id };

  if (status) where.status = status;
  if (source) where.source = source;

  if (search) {
    const safeSearch = escapeLikeString(search);
    // PostgreSQL ILIKE — case-insensitive pattern match with escaped wildcards
    where[Op.or] = [
      { name: { [Op.iLike]: `%${safeSearch}%` } },
      { email: { [Op.iLike]: `%${safeSearch}%` } },
      { company: { [Op.iLike]: `%${safeSearch}%` } }
    ];
  }

  const offset = (page - 1) * limit;
  const dbSortCol = SORT_MAP[sortBy] || 'created_at';

  // ── Run data + count in parallel for speed ──
  const [leads, totalItems] = await Promise.all([
    Lead.findAll({
      where,
      order: [[dbSortCol, order.toUpperCase()]],
      limit,
      offset
    }),
    Lead.count({ where })
  ]);

  const totalPages = Math.ceil(totalItems / limit) || 1;

  res.status(200).json({
    success: true,
    count: leads.length,
    pagination: {
      currentPage: page,
      totalPages,
      totalItems,
      limit,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    },
    data: leads
  });
});

/**
 * @desc    Get a single lead by ID
 * @route   GET /api/leads/:id
 * @access  Private
 */
export const getLeadById = asyncHandler(async (req, res) => {
  const lead = await Lead.findOne({
    where: { id: req.params.id, userId: req.user.id }
  });

  if (!lead) throw ApiError.notFound('Lead not found');

  res.status(200).json({ success: true, data: lead });
});

/**
 * @desc    Create a new lead
 * @route   POST /api/leads
 * @access  Private
 */
export const createLead = asyncHandler(async (req, res) => {
  const lead = await Lead.create({
    ...req.body,
    userId: req.user.id
  });

  res.status(201).json({
    success: true,
    message: 'Lead created successfully',
    data: lead
  });
});

/**
 * @desc    Update an existing lead
 * @route   PUT /api/leads/:id
 * @access  Private
 */
export const updateLead = asyncHandler(async (req, res) => {
  const lead = await Lead.findOne({
    where: { id: req.params.id, userId: req.user.id }
  });

  if (!lead) throw ApiError.notFound('Lead not found');

  await lead.update(req.body);

  res.status(200).json({
    success: true,
    message: 'Lead updated successfully',
    data: lead
  });
});

/**
 * @desc    Delete a lead
 * @route   DELETE /api/leads/:id
 * @access  Private
 */
export const deleteLead = asyncHandler(async (req, res) => {
  const lead = await Lead.findOne({
    where: { id: req.params.id, userId: req.user.id }
  });

  if (!lead) throw ApiError.notFound('Lead not found');

  await lead.destroy();

  res.status(200).json({
    success: true,
    message: 'Lead deleted successfully',
    data: lead
  });
});

/**
 * @desc    Dashboard — lead count grouped by status
 * @route   GET /api/leads/dashboard/stats
 * @access  Private
 *
 * Uses a SQL aggregation so the DB does the work,
 * returning only the small summary (not all rows).
 */
export const getDashboardStats = asyncHandler(async (req, res) => {
  const [statusCounts, totalCount] = await Promise.all([
    Lead.findAll({
      where: { userId: req.user.id },
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['status'],
      raw: true
    }),
    Lead.count({ where: { userId: req.user.id } })
  ]);

  // Ensure every status key is present (even if 0)
  const byStatus = { New: 0, Contacted: 0, Qualified: 0, Lost: 0 };
  for (const row of statusCounts) {
    byStatus[row.status] = parseInt(row.count, 10);
  }

  res.status(200).json({
    success: true,
    data: { total: totalCount, byStatus }
  });
});
