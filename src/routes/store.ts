import { Hono } from 'hono';
import type { Bindings } from '../types';

const app = new Hono<{ Bindings: Bindings }>();

app.get('/accounts', async (c) => {
  const { results } = await c.env.DB.prepare(
    `SELECT id, title, description, price, images, tags, created_at FROM game_accounts WHERE status = 'AVAILABLE'`
  ).all();
  return c.json(results);
});

app.get('/accounts/:id', async (c) => {
  const account = await c.env.DB.prepare(
    `SELECT id, title, description, price, images, tags, status FROM game_accounts WHERE id = ? AND status = 'AVAILABLE'`
  ).bind(c.req.param('id')).first();
  
  if (!account) return c.json({ error: 'NOT_FOUND' }, 404);
  return c.json(account);
});

export default app;