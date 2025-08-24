import ical from 'ical';
import Parser from 'rss-parser';
import prisma from './prisma';

export type AggregatorSource =
	| { type: 'ics'; url: string; category?: string; department?: string; organizer?: string }
	| { type: 'rss'; url: string; category?: string; department?: string; organizer?: string };

const sources: AggregatorSource[] = [
	// Example placeholders; replace with real campus feeds
	// { type: 'ics', url: 'https://example.edu/calendar.ics', category: 'General' },
	// { type: 'rss', url: 'https://example.edu/events.rss', category: 'General' },
];

export async function runAggregator(customSources?: AggregatorSource[]): Promise<{ upserted: number }>{
	const usedSources = customSources ?? sources;
	let upserted = 0;

	for (const src of usedSources) {
		if (src.type === 'ics') {
			try {
				const data = await new Promise<Record<string, ical.VEvent>>((resolve, reject) => {
					ical.fromURL(src.url, {}, (err, data) => {
						if (err) reject(err);
						else resolve(data);
					});
				});
				for (const key of Object.keys(data)) {
					const ev = data[key] as any;
					if (!ev || ev.type !== 'VEVENT') continue;
					const sourceId = ev.uid || ev.summary + String(ev.start);
					await prisma.event.upsert({
						where: { source_sourceId: { source: src.url, sourceId } },
						create: {
							title: ev.summary || 'Untitled',
							description: ev.description || '',
							location: ev.location || 'TBA',
							startTime: new Date(ev.start),
							endTime: new Date(ev.end || ev.start),
							category: src.category || 'General',
							department: src.department,
							organizer: src.organizer,
							source: src.url,
							sourceId,
							isPublished: true
						},
						update: {
							title: ev.summary || 'Untitled',
							description: ev.description || '',
							location: ev.location || 'TBA',
							startTime: new Date(ev.start),
							endTime: new Date(ev.end || ev.start)
						}
					});
					upserted++;
				}
			} catch (e) {
				console.error('ICS fetch error', src.url, e);
			}
		} else if (src.type === 'rss') {
			try {
				const parser = new Parser();
				const feed = await parser.parseURL(src.url);
				for (const item of feed.items) {
					const sourceId = item.guid || item.link || item.title || String(item.pubDate);
					const start = item.isoDate ? new Date(item.isoDate) : new Date();
					await prisma.event.upsert({
						where: { source_sourceId: { source: src.url, sourceId: String(sourceId) } },
						create: {
							title: item.title || 'Untitled',
							description: item.contentSnippet || item.content || '',
							location: 'TBA',
							startTime: start,
							endTime: new Date(start.getTime() + 60 * 60 * 1000),
							category: src.category || 'General',
							department: src.department,
							organizer: src.organizer,
							source: src.url,
							sourceId: String(sourceId),
							isPublished: true
						},
						update: {
							title: item.title || 'Untitled',
							description: item.contentSnippet || item.content || ''
						}
					});
					upserted++;
				}
			} catch (e) {
				console.error('RSS fetch error', src.url, e);
			}
		}
	}

	return { upserted };
}