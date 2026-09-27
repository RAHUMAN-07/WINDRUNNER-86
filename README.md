# WINDRUNNER '86

An editorial e-commerce and interactive archival experience celebrating the iconic **1986 Chevron Running Windbreaker**, curated and crafted by **Abdul Rahuman**.

![WINDRUNNER '86 Hero](/public/renders/hero_assembled.jpg)

---

## ✦ Key Highlights & Features

- **Interactive 6-Stage Deconstruction Canvas**: Scroll and scrub through exploded engineering views — from the assembled chevron shell to lining seam-tape, trims, flat-lay patterns, and reassembly stitching.
- **Fabric Loupe Micro-Zoom**: High-magnification fabric inspection tool with crosshairs to inspect ripstop weaves, brass aglets, and taped seams.
- **Dynamic Product Catalogue**:
  - WINDRUNNER '86 — Original Chevron
  - WINDRUNNER '86 — Alpine Royal
  - WINDRUNNER '86 — Stealth Storm Shell
  - WINDRUNNER '86 — Ripstop Thermal Puffer
  - WINDRUNNER '86 — Track Varsity Bomber
  - WINDRUNNER '86 — Studio Coach Jacket
- **Complete Shopping Cart & Checkout**:
  - Persistent guest cart and authenticated user sync
  - Size selection (`S`, `M`, `L`, `XL`, `XXL`) and inventory decrement
  - Discount coupon engine (e.g., `HERITAGE10`, `ARCHIVE20`)
  - Integrated **Razorpay** payment gateway + Cash on Delivery fallback
- **User Authentication & Profiles**:
  - JWT-based authentication with bcrypt password hashing
  - Order tracking and purchase history
  - Wishlist management
  - Admin dashboard with order management and status updates
- **Editorial Design System**:
  - Deep archival palette (Bespoke Red `#d5222b`, Matte Carbon `#141312`, Vintage Cream `#f7f4ee`)
  - Fluid typography, chalk leader lines, and bespoke micro-interactions

---

## 🛠 Tech Stack

- **Frontend**: React 18, Vite, Framer Motion, React Router v7, Vanilla CSS
- **Backend API**: Node.js, Express 5
- **Database**: SQLite (via `better-sqlite3` in WAL mode)
- **Payments**: Razorpay Node SDK
- **Security & Utilities**: JWT (`jsonwebtoken`), `bcryptjs`, `cors`, `uuid`, `nodemailer`

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** (v18 or higher recommended)
- **npm** (v9 or higher)

### 2. Installation

Clone the repository and install the dependencies:

```bash
git clone https://github.com/RAHUMAN-07/WINDRUNNER-86.git
cd WINDRUNNER-86
npm install
```

### 3. Environment Configuration

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Configure your environment variables:
```env
PORT=4000
JWT_SECRET=your_super_secret_jwt_key
CORS_ORIGINS=http://localhost:3000
PUBLIC_APP_URL=http://localhost:3000

# Optional: Razorpay Test Credentials
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

### 4. Running the Development Server

Start both the React frontend and the Express backend simultaneously:

```bash
npm run dev
```

- **Frontend Client**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:4000](http://localhost:4000)
- **Health Check**: [http://localhost:4000/api/health](http://localhost:4000/api/health)

### 5. Production Build

To build the static frontend for deployment:

```bash
npm run build
npm run preview
```

---

## 📁 Project Structure

```text
jacket/
├── public/               # Static assets & jacket render photography
│   └── renders/          # High-resolution exploded views & category jackets
├── server/               # Express backend & SQLite database
│   ├── db.cjs            # Database schema, migrations, and seed data
│   ├── index.cjs         # Express API routes (products, cart, orders, auth)
│   └── store.db          # Local SQLite database (auto-generated)
├── src/
│   ├── components/       # UI components (DeconstructionCanvas, FabricLoupe, ShopDrawer, etc.)
│   ├── contexts/         # React Contexts (AuthContext, CartContext)
│   ├── pages/            # Page views (Home, Store, ProductDetail, Orders, Admin, Auth)
│   ├── App.jsx           # Root layout & route configuration
│   ├── index.css         # Design tokens, typography & animations
│   └── main.jsx          # React DOM entry point
├── package.json          # Dependencies & execution scripts
└── vite.config.js        # Vite config with API proxy to port 4000
```

---

## 🏪 Store Information

- **Owner**: Abdul Rahuman
- **Location**: Thuvarankurichy, Trichy dist-621314, India
- **Repository**: [https://github.com/RAHUMAN-07/WINDRUNNER-86](https://github.com/RAHUMAN-07/WINDRUNNER-86)