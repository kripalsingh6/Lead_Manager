// ─────────────────────────────────────────────
// Lead Routes  —  /api/leads/*
//
// All routes require a valid JWT (protect).
// Dashboard stats route is defined BEFORE /:id
// to avoid Express treating "dashboard" as an id.
// ─────────────────────────────────────────────
import express from 'express';
import {
  getAllLeads,
  getLeadById,
  createLead,
  updateLead,
  deleteLead,
  getDashboardStats
} from '../controllers/leadController.js';
import protect from '../middlewares/auth.js';
import validate from '../middlewares/validate.js';
import {
  createLeadSchema,
  updateLeadSchema,
  queryLeadsSchema
} from '../validators/leadValidator.js';

const router = express.Router();

// ── All lead routes require authentication ────
router.use(protect);

// Dashboard (must precede /:id)
router.get('/dashboard/stats', getDashboardStats);

// CRUD
router.route('/')
  .get(validate(queryLeadsSchema, 'query'), getAllLeads)
  .post(validate(createLeadSchema), createLead);

router.route('/:id')
  .get(getLeadById)
  .put(validate(updateLeadSchema), updateLead)
  .delete(deleteLead);

export default router;
