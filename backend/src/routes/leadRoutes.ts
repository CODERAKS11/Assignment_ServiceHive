import { Router } from 'express';
import {
  getLeads,
  getLead,
  createLead,
  updateLead,
  deleteLead,
  exportLeads,
  getLeadStats,
} from '../controllers/leadController';
import { validate } from '../middleware/validate';
import { createLeadSchema, updateLeadSchema } from '../validators/lead';
import { authenticate } from '../middleware/auth';

const router = Router();

// All lead routes require authentication
router.use(authenticate);

// Special routes (must be defined before /:id to avoid conflicts)
router.get('/export', exportLeads);
router.get('/stats', getLeadStats);

// CRUD routes
router.route('/').get(getLeads).post(validate(createLeadSchema), createLead);

router
  .route('/:id')
  .get(getLead)
  .patch(validate(updateLeadSchema), updateLead)
  .delete(deleteLead);

export default router;
