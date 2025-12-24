const Order = require('../models/Order');
const Ledger = require('../models/Ledger');
const Item = require('../models/Item');
const District = require('../models/District');

// Get dashboard statistics
const getDashboardStats = async (req, res) => {
  try {
    const [orders, ledgers, items, districts] = await Promise.all([
      Order.find().lean(),
      Ledger.countDocuments(),
      Item.countDocuments(),
      District.countDocuments()
    ]);

    const totalOrders = orders.length;
    const pendingOrders = orders.filter(o => o.status === 'Pending').length;
    const totalDispatched = orders.filter(o => o.status === 'Dispatched').length;
    
    const revenue = orders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
    const collectedRevenue = orders.reduce((sum, o) => sum + (o.paid_amount || 0), 0);
    const outstandingBalance = revenue - collectedRevenue;

    res.json({
      totalOrders,
      pendingOrders,
      totalDispatched,
      totalLedgers: ledgers,
      totalItems: items,
      totalDistricts: districts,
      revenue,
      collectedRevenue,
      outstandingBalance
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Error fetching statistics' });
  }
};

module.exports = {
  getDashboardStats
};
