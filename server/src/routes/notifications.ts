import express from 'express';
import prisma from '../prisma';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { z } from 'zod';
import { Expo } from 'expo-server-sdk';
import { requireRole } from '../middleware/roles';

const router = express.Router();

const tokenSchema = z.object({ token: z.string().min(10), platform: z.string().min(2) });

router.post('/token', requireAuth, async (req: AuthRequest, res) => {
	const parsed = tokenSchema.safeParse(req.body);
	if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
	const userId = req.user!.userId;
	const { token, platform } = parsed.data;
	const saved = await prisma.notificationToken.upsert({
		where: { token },
		create: { token, platform, userId },
		update: { platform, userId }
	});
	return res.json(saved);
});

const sendSchema = z.object({
	title: z.string().min(1),
	body: z.string().min(1),
	userIds: z.array(z.string()).optional(),
	eventId: z.string().optional()
});

router.post('/send', requireAuth, requireRole(['ADMIN', 'ORGANIZER']), async (req: AuthRequest, res) => {
	const parsed = sendSchema.safeParse(req.body);
	if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
	const { title, body, userIds, eventId } = parsed.data;

	let tokens: string[] = [];
	if (userIds && userIds.length > 0) {
		const rows = await prisma.notificationToken.findMany({ where: { userId: { in: userIds } } });
		tokens = rows.map(r => r.token);
	} else if (eventId) {
		const rows = await prisma.notificationToken.findMany({
			where: { user: { rsvps: { some: { eventId } } } }
		});
		tokens = rows.map(r => r.token);
	} else {
		const rows = await prisma.notificationToken.findMany();
		tokens = rows.map(r => r.token);
	}

	const expo = new Expo();
	const messages = tokens.filter(t => Expo.isExpoPushToken(t)).map(token => ({ to: token, sound: 'default', title, body }));

	const chunks = expo.chunkPushNotifications(messages);
	const receipts: any[] = [];
	for (const chunk of chunks) {
		try {
			const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
			receipts.push(...ticketChunk);
		} catch (error) {
			console.error('Expo push error', error);
		}
	}

	return res.json({ sent: messages.length, tickets: receipts });
});

export default router;