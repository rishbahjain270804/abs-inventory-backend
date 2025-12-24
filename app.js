const express = require('express');
const cors = require('cors');
const db = require('./config/database');
require('dotenv').config();

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

// Auto-initialize database on first run (Railway deployment)
const initializeDatabase = async () => {
  try {
    // Check if tables exist
    const [tables] = await db.query("SHOW TABLES LIKE 'users'");
    
    if (tables.length === 0) {
      console.log('🔧 First deployment detected - Initializing database...');
      
      // Run initialization script
      const initDb = require('./scripts/initDatabase');
      await initDb();
      
      console.log('✅ Database initialized successfully!');
      
      // Optionally seed data
      if (process.env.AUTO_SEED === 'true') {
        console.log('🌱 Seeding sample data...');
        const seedData = require('./scripts/seedData');
        await seedData();
        console.log('✅ Sample data seeded!');
      }
    } else {
      console.log('✅ Database already initialized');
    }
  } catch (error) {
    console.error('⚠️ Database initialization check failed:', error.message);
    // Continue anyway - tables might exist
  }
};

// Initialize database before starting server
initializeDatabase().then(() => {
  // Routes
  app.use('/api/districts', districtRoutes);
  app.use('/api/ledgers', ledgerRoutes);
  app.use('/api/items', itemRoutes);
  app.use('/api/orders', orderRoutes);
  app.use('/api/utility', utilityRoutes);

  // Health check route
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'ABS Inventory API is running' });
  });

  // Start server
  app.listen(PORT, () => {
    console.log(`🚀 ABS Inventory Backend running on port ${PORT}`);
  });
});

// Export for serverless
module.exports = app;
