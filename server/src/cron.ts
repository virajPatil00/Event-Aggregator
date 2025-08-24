import cron from 'node-cron';
import { runAggregator } from './aggregator';

export function startCron() {
	cron.schedule('*/30 * * * *', async () => {
		try {
			const result = await runAggregator();
			console.log(`[cron] aggregator upserted`, result.upserted);
		} catch (e) {
			console.error('[cron] aggregator error', e);
		}
	});
}