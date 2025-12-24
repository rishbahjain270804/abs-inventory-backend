const express = require('express');
const cors = require('cors');
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

// Create API Router
const apiRouter = express.Router();

apiRouter.use('/districts', districtRoutes);
apiRouter.use('/ledgers', ledgerRoutes);
apiRouter.use('/items', itemRoutes);
apiRouter.use('/orders', orderRoutes);
apiRouter.use('/utility', utilityRoutes);

// Health & Debug on Router
apiRouter.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'ABS Inventory API is running' });
});

apiRouter.get('/debug', async (req, res) => {
  try {
    const db = require('./config/database');
    const [rows] = await db.query('SHOW TABLES');
    res.json({ 
      success: true, 
      message: 'Database connection successful', 
      tables: rows,
      env: {
        db_name: process.env.DB_NAME,
        db_user: process.env.DB_USER
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Database connection failed', 
      error: error.message,
      code: error.code
    });
  }
});

// Mount Router at both paths
app.use('/api', apiRouter);
app.use('/', apiRouter); // Fallback for cPanel when path is stripped

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'ABS Inventory API is running' });
});

// Debug Route
app.get('/api/debug', async (req, res) => {
  try {
    const db = require('./config/database');
    const [rows] = await db.query('SHOW TABLES');
    res.json({ 
      success: true, 
      message: 'Database connection successful', 
      tables: rows,
      env: {
        db_name: process.env.DB_NAME,
        db_user: process.env.DB_USER
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Database connection failed', 
      error: error.message,
      code: error.code
    });
  }
});

// Start server
// For cPanel/VPS, we need to listen on the port, even in production
if (require.main === module || process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`ABS Inventory Backend running on port ${PORT}`);
  });
}

// Export for Vercel serverless
module.exports = app;
