const Database = require('better-sqlite3');
const path = require('node:path');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

const DB_PATH = path.join(__dirname, 'store.db');
const db = new Database(DB_PATH);

// Enable WAL mode for better concurrent performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// ─── Schema ─────────────────────────────────────────────────────────────────

db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id          TEXT PRIMARY KEY,
    name        TEXT NOT NULL,
    style_no    TEXT NOT NULL,
    description TEXT,
    price       REAL NOT NULL,
    colorway    TEXT NOT NULL,
    stock       INTEGER DEFAULT 10,
    sizes       TEXT NOT NULL DEFAULT '["S","M","L","XL","XXL"]',
    image       TEXT,
    category    TEXT DEFAULT 'Windrunner Heritage',
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS users (
    id         TEXT PRIMARY KEY,
    name       TEXT NOT NULL,
    email      TEXT UNIQUE NOT NULL,
    password   TEXT NOT NULL,
    phone      TEXT,
    address    TEXT,
    role       TEXT NOT NULL DEFAULT 'customer',
    email_verified_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS account_tokens (
    id         TEXT PRIMARY KEY,
    user_id    TEXT NOT NULL,
    type       TEXT NOT NULL CHECK(type IN ('verify_email', 'reset_password')),
    token_hash TEXT UNIQUE NOT NULL,
    expires_at DATETIME NOT NULL,
    used_at    DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS refresh_tokens (
    id         TEXT PRIMARY KEY,
    user_id    TEXT NOT NULL,
    token_hash TEXT UNIQUE NOT NULL,
    expires_at DATETIME NOT NULL,
    revoked_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS audit_logs (
    id         TEXT PRIMARY KEY,
    user_id    TEXT,
    action     TEXT NOT NULL,
    resource   TEXT,
    ip_address TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS idempotency_keys (
    key        TEXT PRIMARY KEY,
    user_id    TEXT,
    response   TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS cart_items (
    id         TEXT PRIMARY KEY,
    user_id    TEXT,
    session_id TEXT,
    product_id TEXT NOT NULL,
    size       TEXT NOT NULL,
    quantity   INTEGER NOT NULL DEFAULT 1,
    added_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS wishlists (
    user_id    TEXT NOT NULL,
    product_id TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, product_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS coupons (
    code          TEXT PRIMARY KEY,
    discount_type TEXT NOT NULL CHECK(discount_type IN ('percent', 'fixed')),
    discount_value REAL NOT NULL,
    minimum_amount REAL DEFAULT 0,
    active        INTEGER NOT NULL DEFAULT 1,
    expires_at    DATETIME
  );

  CREATE TABLE IF NOT EXISTS orders (
    id            TEXT PRIMARY KEY,
    user_id       TEXT,
    session_id    TEXT,
    guest_email   TEXT,
    status        TEXT NOT NULL DEFAULT 'pending',
    total_amount  REAL NOT NULL,
    shipping_name    TEXT NOT NULL,
    shipping_address TEXT NOT NULL,
    shipping_city    TEXT NOT NULL,
    shipping_pin     TEXT NOT NULL,
    shipping_phone   TEXT NOT NULL,
    payment_method   TEXT DEFAULT 'cod',
    payment_status   TEXT DEFAULT 'pending',
    payment_reference TEXT,
    coupon_code     TEXT,
    discount_amount REAL DEFAULT 0,
    tracking_number TEXT,
    cancellation_reason TEXT,
    refund_status   TEXT DEFAULT 'not_requested',
    notes            TEXT,
    created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at    DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS order_items (
    id          TEXT PRIMARY KEY,
    order_id    TEXT NOT NULL,
    product_id  TEXT NOT NULL,
    product_name TEXT NOT NULL,
    size        TEXT NOT NULL,
    quantity    INTEGER NOT NULL,
    unit_price  REAL NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS reviews (
    id         TEXT PRIMARY KEY,
    product_id TEXT NOT NULL,
    user_id    TEXT,
    name       TEXT NOT NULL,
    rating     INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
    comment    TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
  );
`);

try {
  db.exec('ALTER TABLE orders ADD COLUMN session_id TEXT');
} catch {}

try {
  db.exec('ALTER TABLE orders ADD COLUMN payment_reference TEXT');
} catch {}

for (const statement of [
  'ALTER TABLE orders ADD COLUMN coupon_code TEXT',
  'ALTER TABLE orders ADD COLUMN discount_amount REAL DEFAULT 0',
  'ALTER TABLE orders ADD COLUMN tracking_number TEXT',
  'ALTER TABLE orders ADD COLUMN cancellation_reason TEXT',
  "ALTER TABLE orders ADD COLUMN refund_status TEXT DEFAULT 'not_requested'",
]) {
  try { db.exec(statement); } catch {}
}

db.prepare("INSERT OR IGNORE INTO coupons (code, discount_type, discount_value, minimum_amount) VALUES ('WELCOME10', 'percent', 10, 1000)").run();

try {
  db.exec("ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'customer'");
} catch {}

try {
  db.exec('ALTER TABLE users ADD COLUMN email_verified_at DATETIME');
} catch {}

// Ensure category column exists in case table was created previously
try {
  db.exec("ALTER TABLE products ADD COLUMN category TEXT DEFAULT 'Windrunner Heritage'");
} catch {}

// ─── Seed / Update Products at ₹1,500 with Category Images ───────────────────

const products = [
  {
    id: 'wr-prod-01',
    name: "WINDRUNNER '86 — OG Chevron",
    style_no: 'WR-0286-OG',
    description: "The authentic 1986 colorway. Scarlet Red, Pitch Black and Aged Off-White diagonal chevron panels cut in 70D crinkle ripstop nylon. Garment-washed for day-one break-in feel. Mesh lined, seam-taped at shoulders, bar-tacked at pocket welts. Two-way brushed nickel zipper.",
    price: 1500.00,
    colorway: 'Scarlet Red / Pitch Black / Aged Off-White',
    category: 'Windrunner Heritage',
    stock: 42,
    sizes: JSON.stringify(['S', 'M', 'L', 'XL', 'XXL']),
    image: '/renders/hero_assembled.jpg'
  },
  {
    id: 'wr-prod-02',
    name: "WINDRUNNER '86 — Alpine Royal",
    style_no: 'WR-0286-AR',
    description: "Original high-altitude track colorway. Olympic Royal, Deep Navy, Sail White panels with breathable poly-mesh lining and heat-sealed raglan seams. Engraved brass-nickel aglets on drawcord.",
    price: 1500.00,
    colorway: 'Olympic Royal / Deep Navy / Sail White',
    category: 'Windrunner Heritage',
    stock: 24,
    sizes: JSON.stringify(['S', 'M', 'L', 'XL', 'XXL']),
    image: '/renders/shell_separating.jpg'
  },
  {
    id: 'wr-prod-03',
    name: "WINDRUNNER '86 — Stealth Storm Shell",
    style_no: 'WR-0286-ST',
    description: "Technical all-weather storm jacket with sealed storm hood, waterproof taped zippers, and matte black/charcoal ripstop fabric. Engineered for relentless rain, wind resistance, and urban utility.",
    price: 1500.00,
    colorway: 'Triple Charcoal / Matte Black / Graphite',
    category: 'Technical Storm Shell',
    stock: 30,
    sizes: JSON.stringify(['S', 'M', 'L', 'XL', 'XXL']),
    image: '/renders/category_storm_shell.jpg'
  },
  {
    id: 'wr-prod-04',
    name: "WINDRUNNER '86 — Ripstop Thermal Puffer",
    style_no: 'WR-0286-PF',
    description: "Cold-climate athletic thermal puffer with insulated horizontal baffles. Bold two-tone scarlet red and black colorblocking with stand-up neck collar and high-loft warmth retention.",
    price: 1500.00,
    colorway: 'Scarlet Red & Obsidian Baffles',
    category: 'Thermal Puffer',
    stock: 20,
    sizes: JSON.stringify(['S', 'M', 'L', 'XL', 'XXL']),
    image: '/renders/category_thermal_puffer.jpg'
  },
  {
    id: 'wr-prod-05',
    name: "WINDRUNNER '86 — Track Varsity Bomber",
    style_no: 'WR-0286-VB',
    description: "Authentic varsity athletics bomber jacket featuring vintage striped ribbing on collar, cuffs, and hem. Metal snap-front button closures, contrast sleeve panels, and tailored athletic drape.",
    price: 1500.00,
    colorway: 'Crimson Red & Midnight Black Varsity',
    category: 'Varsity Bomber',
    stock: 18,
    sizes: JSON.stringify(['S', 'M', 'L', 'XL', 'XXL']),
    image: '/renders/category_varsity_bomber.jpg'
  },
  {
    id: 'wr-prod-06',
    name: "WINDRUNNER '86 — Studio Coach Jacket",
    style_no: 'WR-0286-CJ',
    description: "Minimalist streetwear coach windbreaker with spread folded collar, snap-button closure, and clean chest chevron banding. Relaxed silhouette with bottom hem drawstring adjustment.",
    price: 1500.00,
    colorway: 'Matte Obsidian & Minimalist Chevron',
    category: 'Coach Windbreaker',
    stock: 25,
    sizes: JSON.stringify(['S', 'M', 'L', 'XL', 'XXL']),
    image: '/renders/category_coach_jacket.jpg'
  }
];

// Clean update / upsert products so all products have price 1500 and distinct category images
const upsertProduct = db.prepare(`
  INSERT INTO products (id, name, style_no, description, price, colorway, stock, sizes, image, category)
  VALUES (@id, @name, @style_no, @description, @price, @colorway, @stock, @sizes, @image, @category)
  ON CONFLICT(id) DO UPDATE SET
    name = excluded.name,
    style_no = excluded.style_no,
    description = excluded.description,
    price = excluded.price,
    colorway = excluded.colorway,
    image = excluded.image,
    category = excluded.category
`);

// Also update any legacy products to price 1500 and proper category
db.prepare('UPDATE products SET price = 1500.00').run();

const seedAll = db.transaction(() => {
  products.forEach(p => {
    upsertProduct.run(p);
  });
});
seedAll();
console.log('✓ All 6 category jackets seeded at ₹1,500 with distinct category imagery');

  // Seed sample reviews
  const reviewInsert = db.prepare(`
    INSERT INTO reviews (id, product_id, user_id, name, rating, comment)
    VALUES (?, ?, NULL, ?, ?, ?)
  `);

  const firstProduct = db.prepare('SELECT id FROM products LIMIT 1').get();
  if (firstProduct) {
    const reviews = [
      ['Abdul R.', 5, "Bought it in L. The chevron alignment at the zipper is genuinely flawless — you can feel where the money went. Ripstop texture is exactly as described, not a cheap approximation."],
      ['Priya S.', 5, "Finally a running jacket where the hardware actually works with cold hands. The two-way zip is worth the price alone."],
      ['Vikram N.', 4, "Runs slightly large in the shoulders. Size down from your normal. Otherwise perfect construction, the taped seams are the real deal."],
      ['Fatima K.', 5, "The OG chevron colorway is better in person. Photographs warm but the red is true — not pink, not orange. Exactly 1986."],
    ];
    const seedReviews = db.transaction(() => {
      reviews.forEach(([name, rating, comment]) => {
        reviewInsert.run(uuidv4(), firstProduct.id, name, rating, comment);
      });
    });
    seedReviews();
    console.log('✓ Reviews seeded');
  }

module.exports = db;
