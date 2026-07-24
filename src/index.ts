import { Hono } from 'hono';
import { cors } from 'hono/cors';
import type { Bindings } from './types';

import authRoutes from './routes/auth';
import adminRoutes from './routes/admin';
import storeRoutes from './routes/store';
import checkoutRoutes from './routes/checkout';

const app = new Hono<{ Bindings: Bindings }>();

app.use('*', cors());

// Health Check
app.get('/health', (c) => c.json({ status: 'ok', env: c.env.ENVIRONMENT, time: new Date().toISOString() }));

// Đăng ký các Module
app.route('/api/auth', authRoutes);
app.route('/api/admin', adminRoutes);
app.route('/api/store', storeRoutes);
app.route('/api/checkout', checkoutRoutes);
// app.route('/api/payment', paymentRoutes); // Sẽ mở ở Phase Tích hợp API Bên thứ 3 (PayOS/Thesieure)

export default app;