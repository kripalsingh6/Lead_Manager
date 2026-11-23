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

const SAMPLE_LEADS = [
  // ── New Leads (12) ──
  { name: 'Emma Wilson', company: 'Northstar', email: 'emma@northstar.io', phone: '+1 415 555 0101', source: 'Website', status: 'New' },
  { name: 'Noah Williams', company: 'Spherule', email: 'noah@spherule.com', phone: '+1 415 555 0104', source: 'Website', status: 'New' },
  { name: 'Ethan Davis', company: 'Luminous', email: 'ethan@luminous.co', phone: '+1 415 555 0108', source: 'LinkedIn', status: 'New' },
  { name: 'Maya Patel', company: 'Brightside', email: 'maya@brightside.com', phone: '+1 415 555 0109', source: 'Referral', status: 'New' },
  { name: 'Lucas Martin', company: 'Acme Corp', email: 'lucas@acmecorp.com', phone: '+1 415 555 0110', source: 'Website', status: 'New' },
  { name: 'Isabella Rossi', company: 'Starlight', email: 'isabella@starlight.io', phone: '+1 415 555 0113', source: 'Website', status: 'New' },
  { name: 'William Vance', company: 'Strata Labs', email: 'william@strata.ai', phone: '+1 415 555 0115', source: 'LinkedIn', status: 'New' },
  { name: 'Mia Tanaka', company: 'Sakura Tech', email: 'mia@sakuratech.jp', phone: '+1 415 555 0117', source: 'Website', status: 'New' },
  { name: 'Henry Zhang', company: 'Horizon AI', email: 'henry@horizon.ai', phone: '+1 415 555 0119', source: 'Referral', status: 'New' },
  { name: 'Evelyn Scott', company: 'Catalyst Co', email: 'evelyn@catalyst.co', phone: '+1 415 555 0121', source: 'Website', status: 'New' },
  { name: 'Oliver Green', company: 'Pinecone Inc', email: 'oliver@pinecone.io', phone: '+1 415 555 0123', source: 'Other', status: 'New' },
  { name: 'Harper Bell', company: 'Echo Systems', email: 'harper@echosys.net', phone: '+1 415 555 0125', source: 'Website', status: 'New' },

  // ── Contacted Leads (10) ──
  { name: 'James Chen', company: 'Layers', email: 'james@layers.co', phone: '+1 415 555 0102', source: 'Referral', status: 'Contacted' },
  { name: 'Ava Thompson', company: 'Capsule', email: 'ava@capsule.co', phone: '+1 415 555 0105', source: 'Referral', status: 'Contacted' },
  { name: 'Daniel Foster', company: 'Novus Media', email: 'daniel@novus.com', phone: '+1 415 555 0114', source: 'Website', status: 'Contacted' },
  { name: 'Emily Clark', company: 'Peak Ventures', email: 'emily@peakventures.vc', phone: '+1 415 555 0118', source: 'LinkedIn', status: 'Contacted' },
  { name: 'Jacob Wright', company: 'Streamline', email: 'jacob@streamline.app', phone: '+1 415 555 0120', source: 'Referral', status: 'Contacted' },
  { name: 'Chloe Adams', company: 'Luminary', email: 'chloe@luminary.design', phone: '+1 415 555 0122', source: 'Website', status: 'Contacted' },
  { name: 'Alexander White', company: 'Vanguard', email: 'alex@vanguard.io', phone: '+1 415 555 0124', source: 'Website', status: 'Contacted' },
  { name: 'Grace Hall', company: 'Beacon Software', email: 'grace@beacon.dev', phone: '+1 415 555 0126', source: 'Other', status: 'Contacted' },
  { name: 'Samuel King', company: 'Nexus Health', email: 'samuel@nexushealth.org', phone: '+1 415 555 0127', source: 'Referral', status: 'Contacted' },
  { name: 'Lily Evans', company: 'BlueSky Labs', email: 'lily@blueskylabs.com', phone: '+1 415 555 0128', source: 'Website', status: 'Contacted' },

  // ── Qualified Leads (8) ──
  { name: 'Olivia Patel', company: 'Orbit', email: 'olivia@orbit.so', phone: '+1 415 555 0103', source: 'LinkedIn', status: 'Qualified' },
  { name: 'Sophia Lee', company: 'Quotient', email: 'sophia@quotient.io', phone: '+1 415 555 0107', source: 'Website', status: 'Qualified' },
  { name: 'Charlotte Brown', company: 'Veritas', email: 'charlotte@veritas.org', phone: '+1 415 555 0111', source: 'LinkedIn', status: 'Qualified' },
  { name: 'Liam O\'Connor', company: 'Emerald City', email: 'liam@emerald.io', phone: '+1 415 555 0116', source: 'Referral', status: 'Qualified' },
  { name: 'Zachary Miller', company: 'Kinetic', email: 'zach@kinetic.sh', phone: '+1 415 555 0129', source: 'Website', status: 'Qualified' },
  { name: 'Zoe Campbell', company: 'Atlas Logic', email: 'zoe@atlaslogic.com', phone: '+1 415 555 0130', source: 'Website', status: 'Qualified' },
  { name: 'Mason Rivera', company: 'Solstice', email: 'mason@solstice.cloud', phone: '+1 415 555 0131', source: 'LinkedIn', status: 'Qualified' },
  { name: 'Ella Ward', company: 'Prism Studio', email: 'ella@prismstudio.co', phone: '+1 415 555 0132', source: 'Other', status: 'Qualified' },

  // ── Lost Leads (2) ──
  { name: 'Liam Garcia', company: 'CloudWatch', email: 'liam@cloudwatch.io', phone: '+1 415 555 0106', source: 'Other', status: 'Lost' },
  { name: 'Benjamin Taylor', company: 'Apex Global', email: 'benjamin@apex.io', phone: '+1 415 555 0112', source: 'Referral', status: 'Lost' }
];

const ensureUserHasLeads = async (userId) => {
  const count = await Lead.count({ where: { userId } });
  if (count === 0) {
    const records = SAMPLE_LEADS.map((l) => ({ ...l, userId }));
    await Lead.bulkCreate(records);
  }
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
  await ensureUserHasLeads(req.user.id);
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
  await ensureUserHasLeads(req.user.id);
  const [statusCounts, sourceCounts, totalCount] = await Promise.all([
    Lead.findAll({
      where: { userId: req.user.id },
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['status'],
      raw: true
    }),
    Lead.findAll({
      where: { userId: req.user.id },
      attributes: [
        'source',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['source'],
      raw: true
    }),
    Lead.count({ where: { userId: req.user.id } })
  ]);

  // Ensure every status key is present (even if 0)
  const byStatus = { New: 0, Contacted: 0, Qualified: 0, Lost: 0 };
  for (const row of statusCounts) {
    byStatus[row.status] = parseInt(row.count, 10);
  }

  // Ensure every source key is present (even if 0)
  const bySource = { Website: 0, Referral: 0, LinkedIn: 0, Other: 0 };
  for (const row of sourceCounts) {
    bySource[row.source] = parseInt(row.count, 10);
  }

  res.status(200).json({
    success: true,
    data: { total: totalCount, byStatus, bySource }
  });
});
