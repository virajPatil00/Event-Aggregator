import express from 'express';
import prisma from '../prisma';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = express.Router();

router.get('/', requireAuth, async (req: AuthRequest, res) => {
	const userId = req.user!.userId;
	const items = await prisma.bookmark.findMany({
		where: { userId },
		include: { event: true },
		orderBy: { createdAt: 'desc' }
	});
	return res.json(items.map(b => b.event));
});

router.post('/:eventId', requireAuth, async (req: AuthRequest, res) => {
	const userId = req.user!.userId;
	const eventId = req.params.eventId;
	try {
		const created = await prisma.bookmark.create({ data: { userId, eventId } });
		return res.status(201).json(created);
	} catch (e) {
		return res.status(400).json({ error: 'Could not bookmark (maybe duplicate or invalid event)' });
	}
});

router.delete('/:eventId', requireAuth, async (req: AuthRequest, res) => {
	const userId = req.user!.userId;
	const eventId = req.params.eventId;
	try {
		await prisma.bookmark.delete({ where: { userId_eventId: { userId, eventId } } });
		return res.status(204).send();
	} catch (e) {
		return res.status(404).json({ error: 'Not found' });
	}
});

export default router;