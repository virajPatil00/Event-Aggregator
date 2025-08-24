import { NextFunction, Response } from 'express';
import { verifyToken, JwtPayload } from '../utils/jwt';
import type { Request } from 'express';

export interface AuthRequest extends Request {
	user?: JwtPayload;
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
	const authHeader = req.headers.authorization;
	if (!authHeader || !authHeader.startsWith('Bearer ')) {
		return res.status(401).json({ error: 'Unauthorized' });
	}
	const token = authHeader.slice(7);
	try {
		const payload = verifyToken<JwtPayload>(token);
		req.user = payload;
		next();
	} catch (err) {
		return res.status(401).json({ error: 'Unauthorized' });
	}
}