import { verify } from 'hono/jwt';
import type { Context, Next } from 'hono';
import type { JWTPayload } from '../types';

export const authMiddleware = async (c: Context, next: Next) => {
  const token = c.req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return c.json({ error: 'UNAUTHORIZED' }, 401);

  try {
    const payload = await verify(token, c.env.JWT_SECRET || 'default-secret-key', 'HS256') as JWTPayload;
    c.set('jwtPayload', payload);
    await next();
  } catch (err) {
    return c.json({ error: 'INVALID_TOKEN' }, 401);
  }
};

export const adminMiddleware = async (c: Context, next: Next) => {
  const user = c.get('user') as JWTPayload;
  if (user.role !== 'ADMIN') {
    return c.json({ error: 'FORBIDDEN' }, 403);
  }
  await next();
};