const express = require('express');
const cors = require('cors');
const path = require('path');

// Load .env explicitly with absolute path for cPanel compatibility
require('dotenv').config({ path: path.join(__dirname, '.env') });


const districtRoutes = require('./routes/districtRoutes');
const ledgerRoutes = require('./routes/ledgerRoutes');
const itemRoutes = require('./routes/itemRoutes');
const orderRoutes = require('./routes/orderRoutes');
const utilityRoutes = require('./routes/utilityRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Disable caching for real-time data updates
app.use((req, res, next) => {
  res.set({
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  });
  next();
});

// API Routes
app.use('/api/districts', districtRoutes);
app.use('/api/ledgers', ledgerRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/utility', utilityRoutes);

// Fallback routes for cPanel path stripping
app.use('/districts', districtRoutes);
app.use('/ledgers', ledgerRoutes);
app.use('/items', itemRoutes);
app.use('/orders', orderRoutes);
app.use('/utility', utilityRoutes);

// Health check
app.get(['/api/health', '/health'], (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Debug endpoint
app.get(['/api/debug', '/debug'], async (req, res) => {
  try {
    const db = require('./config/database');
    const [districtCount] = await db.query('SELECT COUNT(*) as count FROM districts');
    const [itemCount] = await db.query('SELECT COUNT(*) as count FROM items');
    const [ledgerCount] = await db.query('SELECT COUNT(*) as count FROM ledgers');
    const [orderCount] = await db.query('SELECT COUNT(*) as count FROM orders');

    res.json({
      success: true,
      database: process.env.DB_NAME,
      counts: {
        districts: districtCount[0].count,
        items: itemCount[0].count,
        ledgers: ledgerCount[0].count,
        orders: orderCount[0].count
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
