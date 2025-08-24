import express from 'express';
import prisma from '../prisma';
import { requireAuth } from '../middleware/auth';
import { z } from 'zod';
const router = express.Router();
const schema = z.object({ rating: z.number().min(1).max(5), comment: z.string().max(1000).optional() });
router.get('/event/:eventId', async (req, res) => {
    const eventId = req.params.eventId;
    const items = await prisma.feedback.findMany({ where: { eventId }, orderBy: { createdAt: 'desc' } });
    const avg = await prisma.feedback.aggregate({ _avg: { rating: true }, where: { eventId } });
    return res.json({ items, averageRating: avg._avg.rating || 0 });
});
router.post('/event/:eventId', requireAuth, async (req, res) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ error: parsed.error.flatten() });
    const userId = req.user.userId;
    const eventId = req.params.eventId;
    try {
        const saved = await prisma.feedback.upsert({
            where: { userId_eventId: { userId, eventId } },
            create: { userId, eventId, rating: parsed.data.rating, comment: parsed.data.comment },
            update: { rating: parsed.data.rating, comment: parsed.data.comment }
        });
        return res.json(saved);
    }
    catch (e) {
        return res.status(400).json({ error: 'Unable to save feedback' });
    }
});
export default router;
