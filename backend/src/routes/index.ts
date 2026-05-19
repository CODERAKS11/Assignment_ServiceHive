import { Router } from 'express';
import authRoutes from './authRoutes';
import leadRoutes from './leadRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/leads', leadRoutes);

export default router;
