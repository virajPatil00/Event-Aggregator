import { NextFunction, Response } from 'express';
import { AuthRequest } from './auth';

export function requireRole(allowed: Array<'STUDENT' | 'ORGANIZER' | 'ADMIN'>) {
	return (req: AuthRequest, res: Response, next: NextFunction) => {
		if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
		if (!allowed.includes(req.user.role)) return res.status(403).json({ error: 'Forbidden' });
		next();
	};
}