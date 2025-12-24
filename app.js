require('dotenv').config({ path: __dirname + '/.env' });

console.log('🔍 Environment check - MONGODB_URI exists:', !!process.env.MONGODB_URI);

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/mongodb');

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

// Connect to MongoDB
connectDB();

// Routes
app.use('/api/districts', districtRoutes);
app.use('/api/ledgers', ledgerRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/utility', utilityRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'ABS Inventory API is running', database: 'MongoDB' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 ABS Inventory Backend running on port ${PORT}`);
  console.log(`📊 Database: MongoDB Atlas`);
});

module.exports = app;
