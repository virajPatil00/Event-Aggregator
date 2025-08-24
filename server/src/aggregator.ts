import * as icalLib from 'ical';
import Parser from 'rss-parser';
import prisma from './prisma';

export type AggregatorSource =
	| { type: 'ics'; url: string; category?: string; department?: string; organizer?: string; institution?: string }
	| { type: 'rss'; url: string; category?: string; department?: string; organizer?: string; institution?: string };

export async function runAggregator(customSources?: AggregatorSource[]): Promise<{ upserted: number }>{
	let usedSources = customSources;
	if (!usedSources) {
		const dbSources = await prisma.source.findMany({ where: { isEnabled: true } });
		usedSources = dbSources.map(s => ({ type: s.type as 'ics' | 'rss', url: s.url || '', category: s.category || undefined, department: s.department || undefined, organizer: s.organizer || undefined, institution: s.institution || undefined }));
	}
	let upserted = 0;

	for (const src of usedSources) {
		if (src.type === 'ics' && src.url) {
			try {
				const data: Record<string, any> = await new Promise((resolve, reject) => {
					(icalLib as any).fromURL(src.url, {}, (err: any, data: any) => {
						if (err) reject(err);
						else resolve(data);
					});
				});
				for (const key of Object.keys(data)) {
					const ev = data[key] as any;
					if (!ev || ev.type !== 'VEVENT') continue;
					const sourceId = ev.uid || String(ev.summary) + String(ev.start);
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
							institution: src.institution,
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
		} else if (src.type === 'rss' && src.url) {
			try {
				const parser = new Parser();
				const feed = await parser.parseURL(src.url);
				for (const item of feed.items) {
					const sourceId = (item as any).guid || (item as any).link || item.title || String(item.pubDate);
					const start = (item as any).isoDate ? new Date((item as any).isoDate as string) : new Date();
					await prisma.event.upsert({
						where: { source_sourceId: { source: src.url, sourceId: String(sourceId) } },
						create: {
							title: item.title || 'Untitled',
							description: item.contentSnippet || (item as any).content || '',
							location: 'TBA',
							startTime: start,
							endTime: new Date(start.getTime() + 60 * 60 * 1000),
							category: src.category || 'General',
							department: src.department,
							organizer: src.organizer,
							institution: src.institution,
							source: src.url,
							sourceId: String(sourceId),
							isPublished: true
						},
						update: {
							title: item.title || 'Untitled',
							description: item.contentSnippet || (item as any).content || ''
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