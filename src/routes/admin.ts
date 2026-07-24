import { Hono } from 'hono';
import { authMiddleware, adminMiddleware } from '../middlewares/auth';
import type { Bindings } from '../types';

const app = new Hono<{ Bindings: Bindings }>();
app.use('*', authMiddleware, adminMiddleware);

// CRUD Game Accounts
app.post('/accounts', async (c) => {
  const { title, description, price, account_username, account_password, images, tags } = await c.req.json();
  const id = crypto.randomUUID();
  
  await c.env.DB.prepare(
    `INSERT INTO game_accounts (id, title, description, price, account_username, account_password, images, tags) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(id, title, description, price, account_username, account_password, JSON.stringify(images), JSON.stringify(tags)).run();
  
  return c.json({ id, message: 'Account created' }, 201);
});

// Upload Ảnh trực tiếp qua R2 (Chuẩn Cloudflare Native thay vì Presigned URL)
app.post('/upload', async (c) => {
  const body = await c.req.parseBody();
  const file = body['file'] as File;
  if (!file) return c.json({ error: 'No file uploaded' }, 400);

  const key = `game-accounts/${crypto.randomUUID()}-${file.name}`;
  await c.env.ASSETS_BUCKET.put(key, await file.arrayBuffer(), { httpMetadata: { contentType: file.type } });
  
  return c.json({ url: `/${key}` });
});

export default app;