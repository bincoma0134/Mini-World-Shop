import { Hono } from 'hono';
import { authMiddleware } from '../middlewares/auth';
import type { Bindings, JWTPayload } from '../types';

const app = new Hono<{ Bindings: Bindings }>();
app.use('*', authMiddleware);

app.post('/purchase', async (c) => {
  const { account_id } = await c.req.json();
  const user = c.get('jwtPayload') as JWTPayload;

  // Lấy giá và số dư
  const account = await c.env.DB.prepare(`SELECT price, status, account_username, account_password FROM game_accounts WHERE id = ?`).bind(account_id).first<any>();
  const buyer = await c.env.DB.prepare(`SELECT balance FROM users WHERE id = ?`).bind(user.id).first<any>();

  if (!account || account.status !== 'AVAILABLE') return c.json({ error: 'Account not available' }, 400);
  if (buyer.balance < account.price) return c.json({ error: 'Insufficient balance' }, 400);

  const orderId = crypto.randomUUID();
  const auditId = crypto.randomUUID();

  // Transaction bằng D1 Batch API (Atomic)
  try {
    await c.env.DB.batch([
      c.env.DB.prepare(`UPDATE users SET balance = balance - ? WHERE id = ?`).bind(account.price, user.id),
      c.env.DB.prepare(`UPDATE game_accounts SET status = 'SOLD' WHERE id = ?`).bind(account_id),
      c.env.DB.prepare(`INSERT INTO orders (id, user_id, account_id, price_at_purchase) VALUES (?, ?, ?, ?)`).bind(orderId, user.id, account_id, account.price),
      c.env.DB.prepare(`INSERT INTO audit_logs (id, user_id, action, details) VALUES (?, ?, ?, ?)`).bind(auditId, user.id, 'PURCHASE', JSON.stringify({ account_id, price: account.price }))
    ]);

    return c.json({
      message: 'Purchase successful',
      account: { username: account.account_username, password: account.account_password }
    });
  } catch (error) {
    return c.json({ error: 'Transaction failed, rolled back' }, 500);
  }
});

export default app;