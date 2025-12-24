const db = require('../config/database');

// Get next order number for today
const getNextOrderNumber = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0].replace(/-/g, ''); // Format: YYYYMMDD
    const prefix = `ORD-${today}-`;
    
    // Get the latest order number for today
    const [rows] = await db.query(
      `SELECT order_number FROM orders 
       WHERE order_number LIKE ? 
       ORDER BY order_number DESC 
       LIMIT 1`,
      [`${prefix}%`]
    );
    
    let nextSequence = 1;
    
    if (rows.length > 0) {
      // Extract the sequence number from the last order
      const lastOrderNumber = rows[0].order_number;
      const lastSequence = parseInt(lastOrderNumber.split('-')[2]) || 0;
      nextSequence = lastSequence + 1;
    }
    
    // Format sequence as 3-digit number (001, 002, etc.)
    const sequenceStr = nextSequence.toString().padStart(3, '0');
    const newOrderNumber = `${prefix}${sequenceStr}`;
    
    res.json({ 
      success: true, 
      order_number: newOrderNumber,
      date: today,
      sequence: nextSequence
    });
  } catch (error) {
    console.error('Error generating order number:', error);
    res.status(500).json({ success: false, message: 'Error generating order number' });
  }
};

// Get dashboard statistics
const getDashboardStats = async (req, res) => {
  try {
    const [orderStats] = await db.query(`
      SELECT 
        COUNT(*) as totalOrders,
        SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) as pendingOrders,
        SUM(CASE WHEN status = 'Dispatched' THEN 1 ELSE 0 END) as totalDispatched,
        SUM(total_amount) as revenue,
        SUM(paid_amount) as collectedRevenue,
        SUM(balance_due) as outstandingBalance
      FROM orders
    `);

    const [ledgerCount] = await db.query('SELECT COUNT(*) as count FROM ledgers');
    const [itemCount] = await db.query('SELECT COUNT(*) as count FROM items');
    const [districtCount] = await db.query('SELECT COUNT(*) as count FROM districts');

    res.json({
      totalOrders: orderStats[0].totalOrders || 0,
      pendingOrders: orderStats[0].pendingOrders || 0,
      totalDispatched: orderStats[0].totalDispatched || 0,
      totalLedgers: ledgerCount[0].count || 0,
      totalItems: itemCount[0].count || 0,
      totalDistricts: districtCount[0].count || 0,
      revenue: parseFloat(orderStats[0].revenue) || 0,
      collectedRevenue: parseFloat(orderStats[0].collectedRevenue) || 0,
      outstandingBalance: parseFloat(orderStats[0].outstandingBalance) || 0
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Error fetching dashboard statistics' });
  }
};

module.exports = {
  getNextOrderNumber,
  getDashboardStats
};
