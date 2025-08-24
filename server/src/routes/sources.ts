import express from 'express';
import prisma from '../prisma';
import { requireAuth } from '../middleware/auth';
import { requireRole } from '../middleware/roles';
import { z } from 'zod';
import { runAggregator } from '../aggregator';

const router = express.Router();

const schema = z.object({
	type: z.enum(['ics', 'rss']),
	url: z.string().url().optional(),
	category: z.string().optional(),
	department: z.string().optional(),
	organizer: z.string().optional(),
	institution: z.string().optional(),
	isEnabled: z.boolean().optional()
});

router.get('/', requireAuth, requireRole(['ADMIN']), async (_req, res) => {
	const items = await prisma.source.findMany({ orderBy: { createdAt: 'desc' } });
	return res.json(items);
});

router.post('/', requireAuth, requireRole(['ADMIN']), async (req, res) => {
	const parsed = schema.safeParse(req.body);
	if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
	const created = await prisma.source.create({ data: parsed.data });
	return res.status(201).json(created);
});

router.put('/:id', requireAuth, requireRole(['ADMIN']), async (req, res) => {
	const parsed = schema.partial().safeParse(req.body);
	if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
	try {
		const updated = await prisma.source.update({ where: { id: req.params.id }, data: parsed.data });
		return res.json(updated);
	} catch {
		return res.status(404).json({ error: 'Not found' });
	}
});

router.delete('/:id', requireAuth, requireRole(['ADMIN']), async (req, res) => {
	try {
		await prisma.source.delete({ where: { id: req.params.id } });
		return res.status(204).send();
	} catch {
		return res.status(404).json({ error: 'Not found' });
	}
});

router.post('/run', requireAuth, requireRole(['ADMIN']), async (_req, res) => {
	const result = await runAggregator();
	return res.json(result);
});

export default router;