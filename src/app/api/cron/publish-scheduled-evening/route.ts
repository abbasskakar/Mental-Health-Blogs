// Second daily run of publish-scheduled, for the evening queue slot. Hobby
// cron jobs may run only once a day each, so the evening run is its own job
// (see vercel.json) pointing at the same handler.
export const dynamic = 'force-dynamic';

export { GET } from '../publish-scheduled/route';
