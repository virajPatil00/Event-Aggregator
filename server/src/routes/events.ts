import express from 'express';
import { z } from 'zod';
import prisma from '../prisma';
import { requireAuth } from '../middleware/auth';
import { requireRole } from '../middleware/roles';

const router = express.Router();

const baseEventSchema = z.object({
	title: z.string().min(1),
	description: z.string().min(1),
	location: z.string().min(1),
	imageUrl: z.string().url().optional(),
	startTime: z.string(),
	endTime: z.string(),
	category: z.string().min(1),
	department: z.string().optional(),
	organizer: z.string().optional(),
	isPublished: z.boolean().optional()
});

router.get('/', async (req, res) => {
	const q = (req.query.q as string) || undefined;
	const category = (req.query.category as string) || undefined;
	const department = (req.query.department as string) || undefined;
	const take = Math.min(parseInt((req.query.take as string) || '20', 10), 50);
	const cursor = (req.query.cursor as string) || undefined;

	const where: any = { isPublished: true };
	if (q) {
		where.OR = [
			{ title: { contains: q, mode: 'insensitive' } },
			{ description: { contains: q, mode: 'insensitive' } }
		];
	}
	if (category) where.category = category;
	if (department) where.department = department;

	const items = await prisma.event.findMany({
		take: take + 1,
		orderBy: { startTime: 'asc' },
		where,
		...(cursor ? { cursor: { id: cursor }, skip: 1 } : {})
	});
	const nextCursor = items.length > take ? items.pop()?.id : undefined;
	return res.json({ items, nextCursor });
});

router.get('/:id', async (req, res) => {
	const event = await prisma.event.findUnique({ where: { id: req.params.id } });
	if (!event) return res.status(404).json({ error: 'Not found' });
	return res.json(event);
});

router.post('/', requireAuth, requireRole(['ORGANIZER', 'ADMIN']), async (req, res) => {
	const parsed = baseEventSchema.safeParse(req.body);
	if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
	const data = parsed.data;

	const created = await prisma.event.create({
		data: {
			...data,
			startTime: new Date(data.startTime),
			endTime: new Date(data.endTime)
		}
	});
	return res.status(201).json(created);
});

router.put('/:id', requireAuth, requireRole(['ORGANIZER', 'ADMIN']), async (req, res) => {
	const parsed = baseEventSchema.partial().safeParse(req.body);
	if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
	const data = parsed.data as any;
	if (data.startTime) data.startTime = new Date(data.startTime);
	if (data.endTime) data.endTime = new Date(data.endTime);

	try {
		const updated = await prisma.event.update({ where: { id: req.params.id }, data });
		return res.json(updated);
	} catch (e) {
		return res.status(404).json({ error: 'Not found' });
	}
});

router.delete('/:id', requireAuth, requireRole(['ORGANIZER', 'ADMIN']), async (req, res) => {
	try {
		await prisma.event.delete({ where: { id: req.params.id } });
		return res.status(204).send();
	} catch (e) {
		return res.status(404).json({ error: 'Not found' });
	}
});

export default router;