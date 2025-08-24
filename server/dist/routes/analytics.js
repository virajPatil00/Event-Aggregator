import express from 'express';
import prisma from '../prisma';
import { requireAuth } from '../middleware/auth';
import { requireRole } from '../middleware/roles';
const router = express.Router();
router.get('/overview', requireAuth, requireRole(['ORGANIZER', 'ADMIN']), async (_req, res) => {
    const [events, users, rsvps, checkins] = await Promise.all([
        prisma.event.count(),
        prisma.user.count(),
        prisma.rSVP.count(),
        prisma.checkIn.count()
    ]);
    return res.json({ events, users, rsvps, checkins });
});
router.get('/event/:eventId', requireAuth, requireRole(['ORGANIZER', 'ADMIN']), async (req, res) => {
    const eventId = req.params.eventId;
    const [rsvps, checkins, avgRating] = await Promise.all([
        prisma.rSVP.count({ where: { eventId } }),
        prisma.checkIn.count({ where: { eventId } }),
        prisma.feedback.aggregate({ _avg: { rating: true }, where: { eventId } })
    ]);
    return res.json({ rsvps, checkins, averageRating: avgRating._avg.rating || 0 });
});
export default router;
