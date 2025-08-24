import 'dotenv/config';
import prisma from '../src/prisma';
import bcrypt from 'bcryptjs';

async function main() {
	const adminEmail = 'admin@campusconnect.local';
	const existing = await prisma.user.findUnique({ where: { email: adminEmail } });
	if (!existing) {
		const passwordHash = await bcrypt.hash('admin123', 10);
		await prisma.user.create({ data: { email: adminEmail, name: 'Admin', role: 'ADMIN', passwordHash } });
		console.log('Created admin user admin@campusconnect.local / admin123');
	}

	const now = new Date();
	const e1 = await prisma.event.upsert({
		where: { id: 'seed1' },
		update: {},
		create: {
			id: 'seed1',
			title: 'Welcome Orientation',
			description: 'Orientation for new students',
			location: 'Main Auditorium',
			startTime: new Date(now.getTime() + 24*60*60*1000),
			endTime: new Date(now.getTime() + 26*60*60*1000),
			category: 'General',
			department: 'Student Affairs'
		}
	});
	const e2 = await prisma.event.upsert({
		where: { id: 'seed2' },
		update: {},
		create: {
			id: 'seed2',
			title: 'Hackathon 2025',
			description: '24-hour coding challenge',
			location: 'Innovation Lab',
			startTime: new Date(now.getTime() + 3*24*60*60*1000),
			endTime: new Date(now.getTime() + 3*24*60*60*1000 + 4*60*60*1000),
			category: 'Tech',
			department: 'CSE'
		}
	});
	console.log('Seeded events', e1.id, e2.id);
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });