import { Hono } from 'hono';
import { sign } from 'hono/jwt';
import { hashPassword, verifyPassword } from '../utils/crypto';
import type { Bindings } from '../types';

const app = new Hono<{ Bindings: Bindings }>();

app.post('/register', async (c) => {
  const { username, email, password } = await c.req.json();
  const id = crypto.randomUUID();
  const hash = await hashPassword(password);

  try {
    await c.env.DB.prepare(
      `INSERT INTO users (id, username, email, password_hash) VALUES (?, ?, ?, ?)`
    ).bind(id, username, email, hash).run();
    return c.json({ message: 'User registered successfully' }, 201);
  } catch (error) {
    return c.json({ error: 'Username or email already exists' }, 400);
  }
});

app.post('/login', async (c) => {
  const { username, password } = await c.req.json();
  const user = await c.env.DB.prepare(`SELECT * FROM users WHERE username = ?`).bind(username).first<any>();
  
  if (!user || !(await verifyPassword(password, user.password_hash))) {
    return c.json({ error: 'Invalid credentials' }, 401);
  }

  const payload = { id: user.id, username: user.username, role: user.role, exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 };
  const token = await sign(payload, c.env.JWT_SECRET || 'default-secret-key');
  
  return c.json({ token, user: { id: user.id, username: user.username, role: user.role, balance: user.balance } });
});

export default app;