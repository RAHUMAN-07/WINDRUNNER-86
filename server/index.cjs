try {
  process.loadEnvFile();
} catch (_) {}

const express = require('express');
const cors    = require('cors');
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const crypto  = require('node:crypto');
const nodemailer = require('nodemailer');
const Razorpay = require('razorpay');
const { v4: uuidv4 } = require('uuid');
const db      = require('./db.cjs');

const app    = express();
app.disable('x-powered-by');
const PORT   = process.env.PORT || 4000;
const isProduction = process.env.NODE_ENV === 'production';
const SECRET = process.env.JWT_SECRET || (!isProduction ? 'windrunner_86_development_secret_key_super_secure_2026_jwt_token!' : undefined);
function normalizeOrigin(origin) {
  return origin.trim().replace(/\/$/, '');
}
const allowedOrigins = new Set((process.env.CORS_ORIGINS || 'http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173,http://127.0.0.1:5173')
  .split(',').map(normalizeOrigin).filter(Boolean));
function isAllowedOrigin(origin) {
  if (!origin) return true;
  const normalized = normalizeOrigin(origin);
  if (allowedOrigins.has(normalized)) return true;
  if (!isProduction) return /^http:\/\/(localhost|127\.0\.0\.1|\[::1\])(?::\d+)?$/.test(normalized);
  return false;
}
if (!SECRET || SECRET.length < 32) throw new Error('JWT_SECRET must be set to at least 32 characters');
const authCookie = 'wr86_auth';
const refreshCookie = 'wr86_refresh';
const csrfCookie = 'wr86_csrf';
const rateBuckets = new Map();
const rateLimit = (windowMs, max) => (req, res, next) => {
  const key = `${req.ip}:${req.path}`;
  const now = Date.now();
  const bucket = rateBuckets.get(key);
  if (!bucket || now - bucket.startedAt > windowMs) {
    rateBuckets.set(key, { startedAt: now, count: 1 });
    return next();
  }
  bucket.count += 1;
  if (bucket.count > max) return res.status(429).json({ error: 'Too many requests. Try again later.' });
  next();
};
function parseCookies(req) {
  return Object.fromEntries((req.headers.cookie || '').split(';').filter(Boolean).map(part => {
    const index = part.indexOf('=');
    return [part.slice(0, index).trim(), decodeURIComponent(part.slice(index + 1).trim())];
  }));
}
function appendCookie(res, value) {
  const current = res.getHeader('Set-Cookie') || [];
  res.setHeader('Set-Cookie', [...(Array.isArray(current) ? current : [current]), value]);
}
function setAuthCookie(res, token) {
  appendCookie(res, `${authCookie}=${encodeURIComponent(token)}; HttpOnly; Path=/; Max-Age=900; SameSite=Lax${isProduction ? '; Secure' : ''}`);
}
function clearCookie(res, name) {
  appendCookie(res, `${name}=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax${isProduction ? '; Secure' : ''}`);
}
function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}
function issueRefreshCookie(res, userId) {
  const refreshToken = crypto.randomBytes(48).toString('base64url');
  db.prepare('INSERT INTO refresh_tokens (id, user_id, token_hash, expires_at) VALUES (?, ?, ?, datetime(\'now\', \'+30 days\'))')
    .run(uuidv4(), userId, hashToken(refreshToken));
  appendCookie(res, `${refreshCookie}=${encodeURIComponent(refreshToken)}; HttpOnly; Path=/api/auth; Max-Age=2592000; SameSite=Lax${isProduction ? '; Secure' : ''}`);
}
function signAccessToken(user) {
  return jwt.sign({ id: user.id, role: user.role }, SECRET, { expiresIn: '15m', issuer: 'windrunner-86', audience: 'windrunner-web' });
}
function audit(req, userId, action, resource = null) {
  db.prepare('INSERT INTO audit_logs (id, user_id, action, resource, ip_address) VALUES (?, ?, ?, ?, ?)')
    .run(uuidv4(), userId || null, action, resource, req.ip);
}
function issueCsrfCookie(res) {
  const token = crypto.randomBytes(32).toString('hex');
  appendCookie(res, `${csrfCookie}=${token}; Path=/; Max-Age=86400; SameSite=Lax${isProduction ? '; Secure' : ''}`);
  return token;
}
function getToken(req) {
  const cookies = parseCookies(req);
  return cookies[authCookie] || (req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.slice(7) : null);
}
function getRefreshToken(req) {
  return parseCookies(req)[refreshCookie];
}
function validateSessionId(value) {
  return typeof value === 'string' && /^[a-zA-Z0-9_-]{16,128}$/.test(value);
}
function requireCsrf(req, res, next) {
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) return next();
  const origin = req.headers.origin;
  if (origin && !isAllowedOrigin(origin)) return res.status(403).json({ error: 'Origin not allowed' });
  const csrfExemptRoutes = [
    '/api/auth/register',
    '/api/auth/login',
    '/api/auth/refresh',
    '/api/auth/password-reset/request',
    '/api/auth/password-reset/complete',
    '/api/payments/webhook',
  ];
  if (csrfExemptRoutes.includes(req.path)) return next();
  const cookies = parseCookies(req);
  if (cookies[authCookie] && (!cookies[csrfCookie] || cookies[csrfCookie] !== req.headers['x-csrf-token'])) {
    return res.status(403).json({ error: 'CSRF validation failed' });
  }
  next();
}
app.use((req, res, next) => {
  if (isProduction && req.headers['x-forwarded-proto'] !== 'https') return res.redirect(`https://${req.headers.host}${req.originalUrl}`);
  res.setHeader('Content-Security-Policy', "default-src 'self'; img-src 'self' data:; script-src 'self' https://checkout.razorpay.com; style-src 'self' 'unsafe-inline'; connect-src 'self' https://api.razorpay.com; frame-src https://api.razorpay.com https://checkout.razorpay.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self'");
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  if (isProduction) res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});
app.use(cors({ origin: (origin, callback) => callback(null, isAllowedOrigin(origin)), credentials: true }));
app.use('/api/payments/webhook', express.raw({ type: 'application/json', limit: '64kb' }));
app.use(express.json({ limit: '32kb' }));
app.use(requireCsrf);
app.use('/api', rateLimit(60 * 1000, 300));
app.get('/api/auth/csrf', (req, res) => res.json({ token: issueCsrfCookie(res) }));
const razorpay = process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET
  ? new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET })
  : null;
const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
const mailer = process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD
  ? nodemailer.createTransport({ host: process.env.SMTP_HOST, port: Number(process.env.SMTP_PORT || 587), secure: process.env.SMTP_SECURE === 'true', auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD } })
  : null;
const publicAppUrl = process.env.PUBLIC_APP_URL || 'http://localhost:3000';

async function sendAccountEmail(to, subject, text) {
  if (!mailer) {
    if (isProduction) return false;
    console.log(`[development email] ${to} | ${subject}\n${text}`);
    return true;
  }
  await mailer.sendMail({ from: process.env.SMTP_FROM || process.env.SMTP_USER, to, subject, text });
  return true;
}

function createAccountToken(userId, type, days) {
  const token = crypto.randomBytes(32).toString('base64url');
  db.prepare('INSERT INTO account_tokens (id, user_id, type, token_hash, expires_at) VALUES (?, ?, ?, ?, datetime(\'now\', ?))')
    .run(uuidv4(), userId, type, hashToken(token), `+${days} days`);
  return token;
}

// ─── Auth Middleware ─────────────────────────────────────────────────────────
function authMiddleware(req, res, next) {
  const token = getToken(req);
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    req.user = jwt.verify(token, SECRET, { issuer: 'windrunner-86', audience: 'windrunner-web' });
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// ─── Root Status Page ────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>WINDRUNNER '86 API Server</title>
  <style>
    body { background: #141312; color: #f1ede6; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
    .box { background: rgba(255,255,255,0.04); border: 1px solid rgba(241,237,230,0.15); border-radius: 8px; padding: 2.5rem; max-width: 520px; text-align: center; }
    h1 { color: #d5222b; margin: 0 0 0.5rem; font-size: 1.8rem; letter-spacing: 0.05em; }
    p { color: rgba(241,237,230,0.8); line-height: 1.6; font-size: 0.95rem; }
    .badge { display: inline-block; background: rgba(64, 145, 108, 0.2); color: #52b788; border: 1px solid #40916c; padding: 0.3rem 0.8rem; border-radius: 999px; font-weight: bold; font-size: 0.85rem; margin-bottom: 1.5rem; }
    .btn { display: inline-block; background: #d5222b; color: #fff; padding: 0.75rem 1.4rem; text-decoration: none; font-weight: bold; border-radius: 4px; margin: 0.4rem; font-size: 0.9rem; }
    .btn-outline { background: transparent; border: 1px solid rgba(241,237,230,0.3); color: #f1ede6; }
    .btn:hover { opacity: 0.9; }
  </style>
</head>
<body>
  <div class="box">
    <h1>WINDRUNNER '86</h1>
    <div class="badge">● BACKEND API &amp; DATABASE ONLINE</div>
    <p>This is the Express &amp; SQLite backend API server (Port 4000).</p>
    <p>To browse and interact with the store, open the React frontend:</p>
    <div style="margin-top: 1.5rem;">
      <a class="btn" href="http://localhost:3000">Open Store Frontend (Port 3000)</a>
      <br/>
      <a class="btn btn-outline" href="/api/products">View Products API</a>
      <a class="btn btn-outline" href="/api/health">API Health Check</a>
    </div>
  </div>
</body>
</html>`);
});

// ─── Health ──────────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', store: "WINDRUNNER '86", owner: 'Abdul Rahuman', location: 'Thuvarankurichy, Trichy dist-621314, India' });
});

// ─── PRODUCTS ────────────────────────────────────────────────────────────────
app.get('/api/products', (req, res) => {
  const { colorway, category, search } = req.query;
  let query = 'SELECT *, (SELECT COUNT(*) FROM reviews WHERE product_id = products.id) as review_count, (SELECT AVG(rating) FROM reviews WHERE product_id = products.id) as avg_rating FROM products WHERE 1=1';
  const params = [];
  if (colorway) { query += ' AND colorway LIKE ?'; params.push(`%${colorway}%`); }
  if (category && category !== 'All') { query += ' AND category = ?'; params.push(category); }
  if (search)   { query += ' AND (name LIKE ? OR description LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
  query += ' ORDER BY created_at ASC';
  const products = db.prepare(query).all(...params);
  res.json(products.map(p => ({ ...p, sizes: JSON.parse(p.sizes) })));
});

app.get('/api/products/:id', (req, res) => {
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  const reviews = db.prepare('SELECT * FROM reviews WHERE product_id = ? ORDER BY created_at DESC').all(product.id);
  const avgRating = db.prepare('SELECT AVG(rating) as avg FROM reviews WHERE product_id = ?').get(product.id);
  res.json({ ...product, sizes: JSON.parse(product.sizes), reviews, avg_rating: avgRating.avg || 0 });
});

app.get('/api/wishlist', authMiddleware, (req, res) => {
  res.json(db.prepare('SELECT p.* FROM wishlists w JOIN products p ON p.id = w.product_id WHERE w.user_id = ? ORDER BY w.created_at DESC').all(req.user.id).map(product => ({ ...product, sizes: JSON.parse(product.sizes) })));
});

app.post('/api/wishlist/:productId', authMiddleware, (req, res) => {
  if (!db.prepare('SELECT id FROM products WHERE id = ?').get(req.params.productId)) return res.status(404).json({ error: 'Product not found' });
  db.prepare('INSERT OR IGNORE INTO wishlists (user_id, product_id) VALUES (?, ?)').run(req.user.id, req.params.productId);
  res.status(201).json({ saved: true });
});

app.delete('/api/wishlist/:productId', authMiddleware, (req, res) => {
  db.prepare('DELETE FROM wishlists WHERE user_id = ? AND product_id = ?').run(req.user.id, req.params.productId);
  res.json({ saved: false });
});

app.post('/api/coupons/validate', authMiddleware, (req, res) => {
  const code = typeof req.body.code === 'string' ? req.body.code.trim().toUpperCase() : '';
  const subtotal = Number(req.body.subtotal);
  const coupon = db.prepare("SELECT * FROM coupons WHERE code = ? AND active = 1 AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)").get(code);
  if (!coupon || !Number.isFinite(subtotal) || subtotal < coupon.minimum_amount) return res.status(400).json({ error: 'Coupon is invalid or minimum order value is not met' });
  const discount = coupon.discount_type === 'percent' ? subtotal * coupon.discount_value / 100 : coupon.discount_value;
  res.json({ code: coupon.code, discount: +Math.min(discount, subtotal).toFixed(2), total: +(subtotal - Math.min(discount, subtotal)).toFixed(2) });
});

app.get('/api/admin/orders', authMiddleware, requireRole('admin'), (req, res) => {
  const orders = db.prepare('SELECT * FROM orders ORDER BY created_at DESC LIMIT 200').all();
  res.json(orders);
});

app.patch('/api/admin/orders/:id', authMiddleware, requireRole('admin'), (req, res) => {
  const allowedStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
  if (!allowedStatuses.includes(req.body.status)) return res.status(400).json({ error: 'Invalid order status' });
  const result = db.prepare('UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(req.body.status, req.params.id);
  if (!result.changes) return res.status(404).json({ error: 'Order not found' });
  audit(req, req.user.id, 'order.status.update', req.params.id);
  res.json(db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id));
});

app.patch('/api/admin/orders/:id/tracking', authMiddleware, requireRole('admin'), (req, res) => {
  const trackingNumber = typeof req.body.tracking_number === 'string' ? req.body.tracking_number.trim().slice(0, 100) : '';
  if (!trackingNumber) return res.status(400).json({ error: 'Tracking number required' });
  const result = db.prepare('UPDATE orders SET tracking_number = ?, status = CASE WHEN status = \'pending\' THEN \'processing\' ELSE status END, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(trackingNumber, req.params.id);
  if (!result.changes) return res.status(404).json({ error: 'Order not found' });
  audit(req, req.user.id, 'order.tracking.update', req.params.id);
  res.json(db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id));
});

app.patch('/api/admin/orders/:id/refund', authMiddleware, requireRole('admin'), (req, res) => {
  const refundStatus = req.body.refund_status === 'refunded' ? 'refunded' : 'approved';
  const result = db.prepare('UPDATE orders SET refund_status = ?, status = CASE WHEN ? = \'refunded\' THEN \'cancelled\' ELSE status END, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(refundStatus, refundStatus, req.params.id);
  if (!result.changes) return res.status(404).json({ error: 'Order not found' });
  audit(req, req.user.id, `order.refund.${refundStatus}`, req.params.id);
  res.json(db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id));
});

app.post('/api/admin/products', authMiddleware, requireRole('admin'), (req, res) => {
  const { name, style_no, description = '', price, colorway, stock = 0, sizes, image, category } = req.body;
  if (typeof name !== 'string' || !name.trim() || typeof style_no !== 'string' || !style_no.trim() || !Number.isFinite(price) || price < 0 || !Number.isInteger(stock) || stock < 0 || typeof colorway !== 'string' || !Array.isArray(sizes) || sizes.length === 0) return res.status(400).json({ error: 'Invalid product details' });
  const id = uuidv4();
  db.prepare('INSERT INTO products (id, name, style_no, description, price, colorway, stock, sizes, image, category) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').run(id, name.trim(), style_no.trim(), String(description).slice(0, 2000), price, colorway.trim(), stock, JSON.stringify(sizes.slice(0, 12)), typeof image === 'string' ? image.slice(0, 500) : null, typeof category === 'string' ? category.slice(0, 100) : 'Windrunner Heritage');
  audit(req, req.user.id, 'product.create', id);
  res.status(201).json(db.prepare('SELECT * FROM products WHERE id = ?').get(id));
});

app.patch('/api/admin/products/:id', authMiddleware, requireRole('admin'), (req, res) => {
  const { price, stock, name, description, category } = req.body;
  if ((price !== undefined && (!Number.isFinite(price) || price < 0)) || (stock !== undefined && (!Number.isInteger(stock) || stock < 0))) return res.status(400).json({ error: 'Invalid product update' });
  const result = db.prepare('UPDATE products SET price = COALESCE(?, price), stock = COALESCE(?, stock), name = COALESCE(?, name), description = COALESCE(?, description), category = COALESCE(?, category) WHERE id = ?').run(price ?? null, stock ?? null, name ?? null, description ?? null, category ?? null, req.params.id);
  if (!result.changes) return res.status(404).json({ error: 'Product not found' });
  audit(req, req.user.id, 'product.update', req.params.id);
  res.json(db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id));
});

// ─── AUTH ────────────────────────────────────────────────────────────────────
app.post('/api/auth/register', rateLimit(15 * 60 * 1000, 5), async (req, res) => {
  const { name, email, password, phone, address } = req.body;
  const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
  if (typeof name !== 'string' || name.length < 1 || name.length > 100 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail) || typeof password !== 'string' || password.length < 12 || password.length > 128) {
    return res.status(400).json({ error: 'Use a valid name, email, and password of 12–128 characters' });
  }
  const exists = db.prepare('SELECT id FROM users WHERE email = ?').get(normalizedEmail);
  if (exists) return res.status(409).json({ error: 'Email already registered' });
  const hashed = bcrypt.hashSync(password, 12);
  const id = uuidv4();
  db.prepare('INSERT INTO users (id, name, email, password, phone, address) VALUES (?, ?, ?, ?, ?, ?)').run(id, name.trim(), normalizedEmail, hashed, typeof phone === 'string' ? phone.slice(0, 30) : '', typeof address === 'string' ? address.slice(0, 500) : '');
  const token = signAccessToken({ id, role: 'customer' });
  setAuthCookie(res, token);
  issueRefreshCookie(res, id);
  issueCsrfCookie(res);
  const verificationToken = createAccountToken(id, 'verify_email', 1);
  await sendAccountEmail(normalizedEmail, "Verify your WINDRUNNER '86 account", `Verify your email: ${publicAppUrl}/verify-email?token=${verificationToken}`);
  audit(req, id, 'register', 'user');
  res.status(201).json({ user: { id, name: name.trim(), email: normalizedEmail } });
});

app.post('/api/auth/login', rateLimit(15 * 60 * 1000, 10), (req, res) => {
  const { email, password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(typeof email === 'string' ? email.trim().toLowerCase() : '');
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }
  const token = signAccessToken(user);
  setAuthCookie(res, token);
  issueRefreshCookie(res, user.id);
  issueCsrfCookie(res);
  audit(req, user.id, 'login', 'user');
  res.json({ user: { id: user.id, name: user.name, email: user.email, phone: user.phone, address: user.address } });
});

app.get('/api/auth/verify-email', rateLimit(15 * 60 * 1000, 30), (req, res) => {
  const token = typeof req.query.token === 'string' ? req.query.token : '';
  const stored = db.prepare(`SELECT * FROM account_tokens WHERE token_hash = ? AND type = 'verify_email' AND used_at IS NULL AND expires_at > CURRENT_TIMESTAMP`).get(hashToken(token));
  if (!stored) return res.status(400).json({ error: 'Verification link is invalid or expired' });
  db.transaction(() => {
    db.prepare('UPDATE account_tokens SET used_at = CURRENT_TIMESTAMP WHERE id = ?').run(stored.id);
    db.prepare('UPDATE users SET email_verified_at = CURRENT_TIMESTAMP WHERE id = ?').run(stored.user_id);
  })();
  res.json({ verified: true });
});

app.post('/api/auth/password-reset/request', rateLimit(15 * 60 * 1000, 5), async (req, res) => {
  const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const user = db.prepare('SELECT id, email FROM users WHERE email = ?').get(email);
  if (user) {
    const token = createAccountToken(user.id, 'reset_password', 1);
    await sendAccountEmail(user.email, "Reset your WINDRUNNER '86 password", `Reset your password: ${publicAppUrl}/reset-password?token=${token}`);
    audit(req, user.id, 'password.reset.request', 'user');
  }
  res.json({ message: 'If that email is registered, a reset link has been sent.' });
});

app.post('/api/auth/password-reset/complete', rateLimit(15 * 60 * 1000, 10), (req, res) => {
  const { token, password } = req.body;
  if (typeof token !== 'string' || typeof password !== 'string' || password.length < 12 || password.length > 128) return res.status(400).json({ error: 'Invalid reset request' });
  const stored = db.prepare(`SELECT * FROM account_tokens WHERE token_hash = ? AND type = 'reset_password' AND used_at IS NULL AND expires_at > CURRENT_TIMESTAMP`).get(hashToken(token));
  if (!stored) return res.status(400).json({ error: 'Reset link is invalid or expired' });
  db.transaction(() => {
    db.prepare('UPDATE users SET password = ? WHERE id = ?').run(bcrypt.hashSync(password, 12), stored.user_id);
    db.prepare('UPDATE account_tokens SET used_at = CURRENT_TIMESTAMP WHERE id = ?').run(stored.id);
    db.prepare('UPDATE refresh_tokens SET revoked_at = CURRENT_TIMESTAMP WHERE user_id = ? AND revoked_at IS NULL').run(stored.user_id);
  })();
  audit(req, stored.user_id, 'password.reset.complete', 'user');
  res.json({ message: 'Password reset successfully. Please sign in again.' });
});

app.post('/api/auth/refresh', rateLimit(15 * 60 * 1000, 30), (req, res) => {
  const refreshToken = getRefreshToken(req);
  if (!refreshToken) return res.status(401).json({ error: 'Session expired' });
  const stored = db.prepare(`SELECT rt.*, u.role FROM refresh_tokens rt JOIN users u ON u.id = rt.user_id WHERE rt.token_hash = ? AND rt.revoked_at IS NULL AND rt.expires_at > CURRENT_TIMESTAMP`).get(hashToken(refreshToken));
  if (!stored) return res.status(401).json({ error: 'Session expired' });
  db.prepare('UPDATE refresh_tokens SET revoked_at = CURRENT_TIMESTAMP WHERE id = ?').run(stored.id);
  setAuthCookie(res, signAccessToken({ id: stored.user_id, role: stored.role }));
  issueRefreshCookie(res, stored.user_id);
  issueCsrfCookie(res);
  res.json({ ok: true });
});

app.post('/api/auth/logout', authMiddleware, (req, res) => {
  const refreshToken = getRefreshToken(req);
  if (refreshToken) db.prepare('UPDATE refresh_tokens SET revoked_at = CURRENT_TIMESTAMP WHERE token_hash = ?').run(hashToken(refreshToken));
  clearCookie(res, authCookie);
  clearCookie(res, refreshCookie);
  clearCookie(res, csrfCookie);
  audit(req, req.user.id, 'logout', 'user');
  res.status(204).end();
});

app.get('/api/auth/me', authMiddleware, (req, res) => {
  const user = db.prepare('SELECT id, name, email, phone, address, role, created_at FROM users WHERE id = ?').get(req.user.id);
  res.json(user);
});

app.patch('/api/auth/me', authMiddleware, (req, res) => {
  const { name, phone, address } = req.body;
  if (typeof name !== 'string' || name.trim().length < 1 || name.length > 100 || typeof phone !== 'string' || phone.length > 30 || typeof address !== 'string' || address.length > 500) return res.status(400).json({ error: 'Invalid profile details' });
  db.prepare('UPDATE users SET name = ?, phone = ?, address = ? WHERE id = ?').run(name.trim(), phone, address, req.user.id);
  audit(req, req.user.id, 'profile.update', 'user');
  res.json(db.prepare('SELECT id, name, email, phone, address, role, created_at FROM users WHERE id = ?').get(req.user.id));
});

function requireRole(...roles) {
  return (req, res, next) => roles.includes(req.user.role) ? next() : res.status(403).json({ error: 'Forbidden' });
}

// ─── CART ────────────────────────────────────────────────────────────────────
function getCartItems(userId, sessionId) {
  const where = userId ? 'user_id = ?' : 'session_id = ?';
  const param = userId || sessionId;
  return db.prepare(`
    SELECT ci.*, p.name, p.price, p.colorway, p.image, p.stock
    FROM cart_items ci JOIN products p ON ci.product_id = p.id
    WHERE ci.${where}
  `).all(param);
}

app.get('/api/cart', (req, res) => {
  const token = getToken(req);
  const session = req.headers['x-session-id'];
  let userId = null;
  try { if (token) userId = jwt.verify(token, SECRET, { issuer: 'windrunner-86', audience: 'windrunner-web' }).id; } catch {}
  if (!userId && !validateSessionId(session)) return res.status(400).json({ error: 'Valid session required' });
  const items = getCartItems(userId, session);
  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);
  res.json({ items, total: +total.toFixed(2), count: items.reduce((s, i) => s + i.quantity, 0) });
});

app.post('/api/cart', (req, res) => {
  const { product_id, size, quantity = 1 } = req.body;
  const token = getToken(req);
  const session = req.headers['x-session-id'];
  let userId = null;
  try { if (token) userId = jwt.verify(token, SECRET, { issuer: 'windrunner-86', audience: 'windrunner-web' }).id; } catch {}
  if (!userId && !validateSessionId(session)) return res.status(400).json({ error: 'Valid session required' });
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 20 || typeof size !== 'string' || size.length > 10) return res.status(400).json({ error: 'Invalid cart item' });

  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(product_id);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  if (product.stock < 1) return res.status(400).json({ error: 'Out of stock' });

  const where = userId ? 'user_id = ? AND' : 'session_id = ? AND';
  const param = userId || session;
  const existing = db.prepare(`SELECT * FROM cart_items WHERE ${where} product_id = ? AND size = ?`).get(param, product_id, size);

  if (existing) {
    if (existing.quantity + quantity > product.stock) return res.status(400).json({ error: 'Requested quantity exceeds stock' });
    db.prepare('UPDATE cart_items SET quantity = quantity + ? WHERE id = ?').run(quantity, existing.id);
  } else {
    const item = { id: uuidv4(), product_id, size, quantity };
    if (userId) item.user_id = userId;
    else item.session_id = session;
    db.prepare('INSERT INTO cart_items (id, user_id, session_id, product_id, size, quantity) VALUES (?, ?, ?, ?, ?, ?)')
      .run(item.id, item.user_id || null, item.session_id || null, product_id, size, quantity);
  }

  const items = getCartItems(userId, session);
  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);
  res.json({ items, total: +total.toFixed(2), count: items.reduce((s, i) => s + i.quantity, 0) });
});

app.patch('/api/cart/:itemId', (req, res) => {
  const { quantity } = req.body;
  const token = getToken(req);
  const session = req.headers['x-session-id'];
  let userId = null;
  try { if (token) userId = jwt.verify(token, SECRET, { issuer: 'windrunner-86', audience: 'windrunner-web' }).id; } catch {}
  if (!userId && !validateSessionId(session)) return res.status(400).json({ error: 'Valid session required' });
  const owner = userId ? 'user_id = ?' : 'session_id = ?';
  const ownerId = userId || session;
  if (!Number.isInteger(quantity) || quantity > 20) return res.status(400).json({ error: 'Invalid quantity' });
  if (quantity < 1) {
    db.prepare(`DELETE FROM cart_items WHERE id = ? AND ${owner}`).run(req.params.itemId, ownerId);
  } else {
    db.prepare(`UPDATE cart_items SET quantity = ? WHERE id = ? AND ${owner}`).run(quantity, req.params.itemId, ownerId);
  }
  res.json({ ok: true });
});

app.delete('/api/cart/:itemId', (req, res) => {
  const token = getToken(req);
  const session = req.headers['x-session-id'];
  let userId = null;
  try { if (token) userId = jwt.verify(token, SECRET, { issuer: 'windrunner-86', audience: 'windrunner-web' }).id; } catch {}
  if (!userId && !validateSessionId(session)) return res.status(400).json({ error: 'Valid session required' });
  const owner = userId ? 'user_id = ?' : 'session_id = ?';
  db.prepare(`DELETE FROM cart_items WHERE id = ? AND ${owner}`).run(req.params.itemId, userId || session);
  res.json({ ok: true });
});

// ─── ORDERS ──────────────────────────────────────────────────────────────────
app.post('/api/payments/create', async (req, res) => {
  if (!razorpay) return res.status(503).json({ error: 'Online payments are not configured yet' });

  const token = getToken(req);
  const session = req.headers['x-session-id'];
  let userId = null;
  try { if (token) userId = jwt.verify(token, SECRET, { issuer: 'windrunner-86', audience: 'windrunner-web' }).id; } catch {}
  if (!userId && !validateSessionId(session)) return res.status(400).json({ error: 'Valid session required' });
  const cartItems = getCartItems(userId, session);
  if (!cartItems.length) return res.status(400).json({ error: 'Cart is empty' });
  let paymentTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  if (req.body.coupon_code) {
    const coupon = db.prepare("SELECT * FROM coupons WHERE code = ? AND active = 1 AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)").get(String(req.body.coupon_code).trim().toUpperCase());
    if (!coupon || paymentTotal < coupon.minimum_amount) return res.status(400).json({ error: 'Coupon is invalid or minimum order value is not met' });
    paymentTotal -= Math.min(paymentTotal, coupon.discount_type === 'percent' ? paymentTotal * coupon.discount_value / 100 : coupon.discount_value);
  }

  try {
    const paymentOrder = await razorpay.orders.create({
      amount: Math.round(paymentTotal * 100),
      currency: 'INR',
      receipt: `wr86_${Date.now()}`,
    });
    res.json({ order_id: paymentOrder.id, amount: paymentOrder.amount, currency: paymentOrder.currency, key_id: process.env.RAZORPAY_KEY_ID });
  } catch (error) {
    console.error('Razorpay order creation failed:', error.message);
    res.status(502).json({ error: 'Unable to start online payment' });
  }
});

app.post('/api/payments/webhook', (req, res) => {
  if (!webhookSecret || !Buffer.isBuffer(req.body)) return res.status(503).json({ error: 'Webhook is not configured' });
  const signature = req.headers['x-razorpay-signature'];
  const expected = crypto.createHmac('sha256', webhookSecret).update(req.body).digest('hex');
  if (typeof signature !== 'string' || signature.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return res.status(400).json({ error: 'Invalid webhook signature' });
  let event;
  try { event = JSON.parse(req.body.toString('utf8')); } catch { return res.status(400).json({ error: 'Invalid webhook payload' }); }
  const payment = event.payload?.payment?.entity;
  if (payment?.order_id && ['payment.captured', 'order.paid'].includes(event.event)) {
    db.prepare('UPDATE orders SET payment_status = ?, updated_at = CURRENT_TIMESTAMP WHERE payment_reference = ?').run('paid', payment.order_id);
  }
  res.json({ received: true });
});

app.post('/api/orders', async (req, res) => {
  const { shipping, payment_method = 'cod', guest_email, notes, payment, coupon_code } = req.body;
  const paymentMethods = ['cod', 'upi', 'card', 'netbanking', 'wallet'];
  if (!paymentMethods.includes(payment_method)) {
    return res.status(400).json({ error: 'Unsupported payment method' });
  }
  if (payment_method !== 'cod') {
    if (!payment?.razorpay_order_id || !payment?.razorpay_payment_id || !payment?.razorpay_signature) {
      return res.status(400).json({ error: 'Online payment has not been completed' });
    }
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
      .update(`${payment.razorpay_order_id}|${payment.razorpay_payment_id}`)
      .digest('hex');
    if (!process.env.RAZORPAY_KEY_SECRET || expectedSignature !== payment.razorpay_signature) {
      return res.status(400).json({ error: 'Payment verification failed' });
    }
  }
  if (!shipping || ['name', 'address', 'city', 'pin', 'phone'].some(field => typeof shipping[field] !== 'string' || shipping[field].trim().length === 0 || shipping[field].length > 200)) return res.status(400).json({ error: 'Complete shipping details are required' });
  const token = getToken(req);
  const session = req.headers['x-session-id'];
  let userId = null;
  try { if (token) userId = jwt.verify(token, SECRET, { issuer: 'windrunner-86', audience: 'windrunner-web' }).id; } catch {}
  if (!userId && !validateSessionId(session)) return res.status(400).json({ error: 'Valid session required' });
  const idempotencyKey = req.headers['idempotency-key'];
  if (idempotencyKey !== undefined && (typeof idempotencyKey !== 'string' || !/^[a-zA-Z0-9_-]{16,100}$/.test(idempotencyKey))) return res.status(400).json({ error: 'Invalid idempotency key' });
  const scopedIdempotencyKey = idempotencyKey ? `${userId || session}:${idempotencyKey}` : null;
  if (scopedIdempotencyKey) {
    const previous = db.prepare('SELECT response FROM idempotency_keys WHERE key = ?').get(scopedIdempotencyKey);
    if (previous) return res.json(JSON.parse(previous.response));
  }

  const cartItems = getCartItems(userId, session);
  if (!cartItems.length) return res.status(400).json({ error: 'Cart is empty' });

  const total = cartItems.reduce((s, i) => s + i.price * i.quantity, 0);
  let discountAmount = 0;
  let appliedCoupon = null;
  if (coupon_code) {
    appliedCoupon = db.prepare("SELECT * FROM coupons WHERE code = ? AND active = 1 AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)").get(String(coupon_code).trim().toUpperCase());
    if (!appliedCoupon || total < appliedCoupon.minimum_amount) return res.status(400).json({ error: 'Coupon is invalid or minimum order value is not met' });
    discountAmount = Math.min(total, appliedCoupon.discount_type === 'percent' ? total * appliedCoupon.discount_value / 100 : appliedCoupon.discount_value);
  }
  const payableTotal = total - discountAmount;
  if (payment_method !== 'cod') {
    try {
      const paymentOrder = await razorpay.orders.fetch(payment.razorpay_order_id);
      if (paymentOrder.currency !== 'INR' || paymentOrder.amount !== Math.round(payableTotal * 100)) return res.status(400).json({ error: 'Payment amount verification failed' });
    } catch {
      return res.status(400).json({ error: 'Payment order could not be verified' });
    }
  }
  const orderId = uuidv4();

  const createOrder = db.transaction(() => {
    db.prepare(`
      INSERT INTO orders (id, user_id, session_id, guest_email, total_amount, shipping_name, shipping_address, shipping_city, shipping_pin, shipping_phone, payment_method, payment_reference, coupon_code, discount_amount, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(orderId, userId, userId ? null : session, guest_email || null, +payableTotal.toFixed(2),
       shipping.name, shipping.address, shipping.city, shipping.pin, shipping.phone,
       payment_method, payment?.razorpay_order_id || null, appliedCoupon?.code || null, +discountAmount.toFixed(2), notes || null);

    cartItems.forEach(item => {
      db.prepare(`
        INSERT INTO order_items (id, order_id, product_id, product_name, size, quantity, unit_price)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(uuidv4(), orderId, item.product_id, item.name, item.size, item.quantity, item.price);

      const stockUpdate = db.prepare('UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?').run(item.quantity, item.product_id, item.quantity);
      if (!stockUpdate.changes) throw new Error('Stock changed while placing order');
    });

    // Clear cart
    const where = userId ? 'user_id = ?' : 'session_id = ?';
    db.prepare(`DELETE FROM cart_items WHERE ${where}`).run(userId || session);
  });

  createOrder();
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
  const orderItems = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(orderId);
  const response = { order, items: orderItems, message: 'Order placed successfully' };
  if (scopedIdempotencyKey) db.prepare('INSERT INTO idempotency_keys (key, user_id, response) VALUES (?, ?, ?)').run(scopedIdempotencyKey, userId, JSON.stringify(response));
  audit(req, userId, 'order.create', orderId);
  const notificationEmail = userId ? db.prepare('SELECT email FROM users WHERE id = ?').get(userId)?.email : guest_email;
  if (notificationEmail) await sendAccountEmail(notificationEmail, `Order ${orderId.slice(0, 8)} confirmed`, `Your WINDRUNNER '86 order has been received. Total: INR ${payableTotal.toFixed(2)}. We will update you when it ships.`);
  res.json(response);
});

app.get('/api/orders', authMiddleware, (req, res) => {
  const orders = db.prepare(`
    SELECT o.*, (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as item_count
    FROM orders WHERE user_id = ? ORDER BY created_at DESC
  `).all(req.user.id);
  res.json(orders);
});

app.get('/api/orders/:id', (req, res) => {
  const token = getToken(req);
  const session = req.headers['x-session-id'];
  let userId = null;
  try { if (token) userId = jwt.verify(token, SECRET, { issuer: 'windrunner-86', audience: 'windrunner-web' }).id; } catch {}
  if (!userId && !validateSessionId(session)) return res.status(401).json({ error: 'Unauthorized' });
  const order = db.prepare(`SELECT * FROM orders WHERE id = ? AND ${userId ? 'user_id = ?' : 'session_id = ?'}`).get(req.params.id, userId || session);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  const items = db.prepare('SELECT oi.*, p.image FROM order_items oi LEFT JOIN products p ON oi.product_id = p.id WHERE order_id = ?').all(req.params.id);
  res.json({ ...order, items });
});

app.post('/api/orders/:id/cancel', authMiddleware, async (req, res) => {
  const reason = typeof req.body.reason === 'string' ? req.body.reason.trim().slice(0, 500) : '';
  const order = db.prepare("SELECT * FROM orders WHERE id = ? AND user_id = ? AND status IN ('pending', 'processing')").get(req.params.id, req.user.id);
  if (!order) return res.status(404).json({ error: 'Order cannot be cancelled' });
  db.prepare("UPDATE orders SET status = 'cancelled', cancellation_reason = ?, refund_status = CASE WHEN payment_status = 'paid' THEN 'requested' ELSE refund_status END, updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(reason, order.id);
  audit(req, req.user.id, 'order.cancel', order.id);
  const customer = db.prepare('SELECT email FROM users WHERE id = ?').get(req.user.id);
  if (customer) await sendAccountEmail(customer.email, `Order ${order.id.slice(0, 8)} cancelled`, `Your order has been cancelled. Refund status: ${order.payment_status === 'paid' ? 'requested' : 'not applicable'}.`);
  res.json(db.prepare('SELECT * FROM orders WHERE id = ?').get(order.id));
});

// ─── REVIEWS ─────────────────────────────────────────────────────────────────
app.get('/api/products/:id/reviews', (req, res) => {
  const reviews = db.prepare('SELECT * FROM reviews WHERE product_id = ? ORDER BY created_at DESC').all(req.params.id);
  res.json(reviews);
});

app.post('/api/products/:id/reviews', (req, res) => {
  const { name, rating, comment } = req.body;
  const token = getToken(req);
  let userId = null;
  try { if (token) userId = jwt.verify(token, SECRET, { issuer: 'windrunner-86', audience: 'windrunner-web' }).id; } catch {}

  if (typeof name !== 'string' || name.trim().length < 1 || name.length > 100 || !Number.isInteger(rating) || rating < 1 || rating > 5 || (comment !== undefined && (typeof comment !== 'string' || comment.length > 2000))) return res.status(400).json({ error: 'Invalid review' });
  if (!db.prepare('SELECT id FROM products WHERE id = ?').get(req.params.id)) return res.status(404).json({ error: 'Product not found' });

  const id = uuidv4();
  db.prepare('INSERT INTO reviews (id, product_id, user_id, name, rating, comment) VALUES (?, ?, ?, ?, ?, ?)')
    .run(id, req.params.id, userId, name.trim(), rating, comment || '');

  res.json(db.prepare('SELECT * FROM reviews WHERE id = ?').get(id));
});

// ─── STORE INFO ──────────────────────────────────────────────────────────────
app.get('/api/store', (req, res) => {
  res.json({
    name: "WINDRUNNER '86",
    owner: 'Abdul Rahuman',
    address: 'Thuvarankurichy, Trichy dist-621314, India',
    email: 'rahumanabdul0306@gmail.com',
    phone: '+91-XXXXX-XXXXX',
    gst: 'GSTIN: 33AXXXX0000X1Z5',
    currency: 'INR',
    shipping_zones: ['Tamil Nadu', 'PAN India'],
    return_policy: '14 days — unworn, tags attached',
    about: "Built in Thuvarankurichy, Tamil Nadu. Every jacket is inspected by hand before shipping. We ship within 2 business days."
  });
});

app.use((error, req, res, next) => {
  console.error('Unhandled request error:', error.message);
  if (res.headersSent) return next(error);
  res.status(500).json({ error: 'Internal server error' });
});

// ─── Start ───────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n  ┌─────────────────────────────────────────────┐`);
  console.log(`  │  WINDRUNNER '86 — Abdul Rahuman's Store API  │`);
  console.log(`  │  Running at http://127.0.0.1:${PORT}             │`);
  console.log(`  │  SQLite DB: server/store.db                 │`);
  console.log(`  └─────────────────────────────────────────────┘\n`);
});
