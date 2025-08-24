import express from 'express';
import prisma from '../prisma';
import { requireAuth } from '../middleware/auth';
import { z } from 'zod';
const router = express.Router();
const tokenSchema = z.object({ token: z.string().min(10), platform: z.string().min(2) });
router.post('/token', requireAuth, async (req, res) => {
    const parsed = tokenSchema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ error: parsed.error.flatten() });
    const userId = req.user.userId;
    const { token, platform } = parsed.data;
    const saved = await prisma.notificationToken.upsert({
        where: { token },
        create: { token, platform, userId },
        update: { platform, userId }
    });
    return res.json(saved);
});
export default router;
