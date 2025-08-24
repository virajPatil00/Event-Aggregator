import express from 'express';
import prisma from '../prisma';
import { requireAuth } from '../middleware/auth';
import { z } from 'zod';
const router = express.Router();
router.get('/', requireAuth, async (req, res) => {
    const pref = await prisma.preference.findUnique({ where: { userId: req.user.userId } });
    return res.json(pref || {});
});
const updateSchema = z.object({
    categories: z.array(z.string()).optional(),
    departments: z.array(z.string()).optional()
});
router.put('/', requireAuth, async (req, res) => {
    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ error: parsed.error.flatten() });
    const { categories, departments } = parsed.data;
    const saved = await prisma.preference.upsert({
        where: { userId: req.user.userId },
        create: { userId: req.user.userId, categories, departments },
        update: { categories, departments }
    });
    return res.json(saved);
});
router.get('/recommendations', requireAuth, async (req, res) => {
    const pref = await prisma.preference.findUnique({ where: { userId: req.user.userId } });
    const where = { isPublished: true, startTime: { gte: new Date() } };
    if (pref?.categories)
        where.category = { in: pref.categories };
    if (pref?.departments)
        where.department = { in: pref.departments };
    const items = await prisma.event.findMany({
        where,
        orderBy: [{ startTime: 'asc' }],
        take: 20
    });
    return res.json(items);
});
export default router;
