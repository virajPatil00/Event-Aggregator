import express from 'express';
import prisma from '../prisma';
import { requireAuth } from '../middleware/auth';
import { z } from 'zod';
const router = express.Router();
const setSchema = z.object({ status: z.enum(['GOING', 'INTERESTED', 'NOT_GOING']) });
router.get('/', requireAuth, async (req, res) => {
    const userId = req.user.userId;
    const items = await prisma.rSVP.findMany({
        where: { userId },
        include: { event: true },
        orderBy: { createdAt: 'desc' }
    });
    return res.json(items);
});
router.post('/:eventId', requireAuth, async (req, res) => {
    const parsed = setSchema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ error: parsed.error.flatten() });
    const userId = req.user.userId;
    const eventId = req.params.eventId;
    const status = parsed.data.status;
    const saved = await prisma.rSVP.upsert({
        where: { userId_eventId: { userId, eventId } },
        create: { userId, eventId, status },
        update: { status }
    });
    return res.json(saved);
});
export default router;
