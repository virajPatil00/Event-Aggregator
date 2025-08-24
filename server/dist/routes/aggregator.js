import express from 'express';
import { requireAuth } from '../middleware/auth';
import { requireRole } from '../middleware/roles';
import { runAggregator } from '../aggregator';
const router = express.Router();
router.post('/run', requireAuth, requireRole(['ADMIN']), async (_req, res) => {
    const result = await runAggregator();
    return res.json(result);
});
export default router;
