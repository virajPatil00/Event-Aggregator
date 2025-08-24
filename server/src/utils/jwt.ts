import jwt, { type SignOptions, type Secret } from 'jsonwebtoken';

const JWT_SECRET: Secret = process.env.JWT_SECRET ?? 'dev_secret_change_me';

export type JwtPayload = {
	userId: string;
	email: string;
	role: 'STUDENT' | 'ORGANIZER' | 'ADMIN';
};

export function signToken(payload: JwtPayload, expiresInSeconds: number = 7 * 24 * 60 * 60): string {
	const options: SignOptions = { expiresIn: expiresInSeconds };
	return jwt.sign(payload, JWT_SECRET, options);
}

export function verifyToken<T extends object = JwtPayload>(token: string): T {
	return jwt.verify(token, JWT_SECRET) as T;
}