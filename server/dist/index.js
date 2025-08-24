import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import authRouter from './routes/auth';
import eventsRouter from './routes/events';
import bookmarksRouter from './routes/bookmarks';
import rsvpRouter from './routes/rsvp';
import checkinRouter from './routes/checkin';
import notificationsRouter from './routes/notifications';
const app = express();
app.use(cors());
app.use(express.json());
app.use(helmet());
app.use(morgan('dev'));
app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
});
app.use('/api/auth', authRouter);
app.use('/api/events', eventsRouter);
app.use('/api/bookmarks', bookmarksRouter);
app.use('/api/rsvps', rsvpRouter);
app.use('/api/checkin', checkinRouter);
app.use('/api/notifications', notificationsRouter);
const port = process.env.PORT ? Number(process.env.PORT) : 4000;
app.listen(port, () => {
    console.log(`API listening on http://localhost:${port}`);
});
