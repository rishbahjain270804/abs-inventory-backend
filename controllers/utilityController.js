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

module.exports = {
  getNextOrderNumber
};
