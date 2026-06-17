require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');

const app = express();

// ── Security & Middleware ──────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,   // allow cookies cross-origin
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Routes ─────────────────────────────────────────────────────────────────────
app.use('/api/products', productRoutes);
app.use('/products',     productRoutes);
app.use('/api/cart',     cartRoutes);
app.use('/cart',         cartRoutes);
app.use('/api/auth',     require('./routes/authRoutes'));
app.use('/auth',         require('./routes/authRoutes'));

// ── Health check ───────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// ── Database & Server ──────────────────────────────────────────────────────────
connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅  Server running on http://localhost:${PORT}`);
});
