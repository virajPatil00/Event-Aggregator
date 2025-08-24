import express from 'express';
import prisma from '../prisma';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { z } from 'zod';

const router = express.Router();

const schema = z.object({ eventId: z.string().min(1) });

router.post('/', requireAuth, async (req: AuthRequest, res) => {
	const parsed = schema.safeParse(req.body);
	if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
	const userId = req.user!.userId;
	const { eventId } = parsed.data;
	try {
		const check = await prisma.checkIn.create({ data: { userId, eventId } });
		return res.status(201).json(check);
	} catch (e) {
		return res.status(400).json({ error: 'Unable to check in (invalid event or duplicate?)' });
	}
});

export default router;