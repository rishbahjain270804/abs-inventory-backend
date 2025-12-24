const db = require('../config/database');

// Create bulk order with multiple items
const createBulkOrder = async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    const { order_header, order_items } = req.body;
    
    // Validation
    if (!order_header.order_number || !order_header.ledger_id) {
      return res.status(400).json({ 
        success: false, 
        message: 'Order number and party are required' 
      });
    }
    
    if (!order_items || order_items.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'At least one item is required' 
      });
    }
    
    await connection.beginTransaction();
    
    // Calculate total amount from all items
    const totalAmount = order_items.reduce((sum, item) => 
      sum + (parseFloat(item.amount) || 0), 0
    );
    
    const paymentStatus = order_header.payment_status || 'Unpaid';
    const balanceDue = paymentStatus === 'Unpaid' ? totalAmount : 0;
    
    // Insert main order
    const [orderResult] = await connection.query(
      `INSERT INTO orders (
        order_number, ledger_id, total_amount, order_date, 
        delivery_date, status, remarks, created_by,
        payment_method, payment_status, paid_amount, balance_due
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        order_header.order_number,
        order_header.ledger_id,
        totalAmount,
        order_header.order_date || new Date(),
        order_header.delivery_date || null,
        order_header.status || 'Pending',
        order_header.remarks || null,
        req.user ? req.user.id : null,
        order_header.payment_method || 'Pending',
        paymentStatus,
        order_header.paid_amount || 0,
        balanceDue
      ]
    );
    
    const orderId = orderResult.insertId;
    
    // Insert all order items
    for (const item of order_items) {
      if (!item.item_id || (!item.qty_mt && !item.qty_pcs)) {
        continue; // Skip invalid items
      }
      
      await connection.query(
        `INSERT INTO order_items (
          order_id, item_id, qty_mt, qty_pcs, rate, amount
        ) VALUES (?, ?, ?, ?, ?, ?)`,
        [
          orderId,
          item.item_id,
          item.qty_mt || 0,
          item.qty_pcs || 0,
          item.rate || 0,
          item.amount || 0
        ]
      );
    }
    
    await connection.commit();
    
    res.status(201).json({ 
      success: true, 
      message: 'Order created successfully',
      data: { 
        id: orderId, 
        order_number: order_header.order_number,
        total_amount: totalAmount,
        items_count: order_items.length
      }
    });
    
  } catch (error) {
    await connection.rollback();
    
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ 
        success: false, 
        message: 'Order number already exists' 
      });
    }
    
    console.error('Error creating bulk order:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error creating order',
      error: error.message 
    });
  } finally {
    connection.release();
  }
};

// Get order with all items
const getOrderWithItems = async (req, res) => {
  try {
    // Get main order
    const [orders] = await db.query(`
      SELECT o.*, 
             l.party_name, l.address, l.mobile_number,
             u.username as created_by_name
      FROM orders o 
      LEFT JOIN ledgers l ON o.ledger_id = l.id 
      LEFT JOIN users u ON o.created_by = u.id
      WHERE o.id = ?
    `, [req.params.id]);
    
    if (orders.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
      });
    }
    
    // Get order items
    const [items] = await db.query(`
      SELECT oi.*, i.item_name, i.item_code, i.hsn_code, i.gst_rate
      FROM order_items oi
      LEFT JOIN items i ON oi.item_id = i.id
      WHERE oi.order_id = ?
    `, [req.params.id]);
    
    const order = orders[0];
    order.items = items;
    
    res.json({ 
      success: true, 
      data: order 
    });
    
  } catch (error) {
    console.error('Error fetching order with items:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching order' 
    });
  }
};

// Get all orders (for listing)
const getAllOrdersWithItemCount = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT o.*, 
             l.party_name,
             u.username as created_by_name,
             COUNT(oi.id) as items_count
      FROM orders o 
      LEFT JOIN ledgers l ON o.ledger_id = l.id 
      LEFT JOIN users u ON o.created_by = u.id
      LEFT JOIN order_items oi ON o.id = oi.order_id
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching orders' 
    });
  }
};

// Update bulk order with multiple items
const updateBulkOrder = async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    const { order_header, order_items } = req.body;
    const orderId = req.params.id;
    
    // Validation
    if (!order_header.order_number || !order_header.ledger_id) {
      return res.status(400).json({ 
        success: false, 
        message: 'Order number and party are required' 
      });
    }
    
    if (!order_items || order_items.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'At least one item is required' 
      });
    }
    
    await connection.beginTransaction();
    
    // Calculate total amount from all items
    const totalAmount = order_items.reduce((sum, item) => 
      sum + (parseFloat(item.amount) || 0), 0
    );
    
    // Update main order
    const [updateResult] = await connection.query(
      `UPDATE orders SET 
        order_number = ?, ledger_id = ?, total_amount = ?, order_date = ?, 
        delivery_date = ?, status = ?, remarks = ?,
        payment_method = ?, payment_status = ?, paid_amount = ?, balance_due = ?
       WHERE id = ?`,
      [
        order_header.order_number,
        order_header.ledger_id,
        totalAmount,
        order_header.order_date || new Date(),
        order_header.delivery_date || null,
        order_header.status || 'Pending',
        order_header.remarks || null,
        order_header.payment_method || 'Pending',
        order_header.payment_status || 'Unpaid',
        order_header.paid_amount || 0,
        order_header.balance_due || totalAmount,
        orderId
      ]
    );
    
    if (updateResult.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
      });
    }
    
    // Delete existing order items
    await connection.query('DELETE FROM order_items WHERE order_id = ?', [orderId]);
    
    // Insert new order items
    for (const item of order_items) {
      if (!item.item_id || (!item.qty_mt && !item.qty_pcs)) {
        continue; // Skip invalid items
      }
      
      await connection.query(
        `INSERT INTO order_items (
          order_id, item_id, qty_mt, qty_pcs, rate, amount
        ) VALUES (?, ?, ?, ?, ?, ?)`,
        [
          orderId,
          item.item_id,
          item.qty_mt || 0,
          item.qty_pcs || 0,
          item.rate || 0,
          item.amount || 0
        ]
      );
    }
    
    await connection.commit();
    
    res.json({ 
      success: true, 
      message: 'Order updated successfully',
      data: { 
        id: orderId, 
        order_number: order_header.order_number,
        total_amount: totalAmount,
        items_count: order_items.length
      }
    });
    
  } catch (error) {
    await connection.rollback();
    
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ 
        success: false, 
        message: 'Order number already exists' 
      });
    }
    
    console.error('Error updating bulk order:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error updating order',
      error: error.message 
    });
  } finally {
    connection.release();
  }
};

// Delete order with cascade (deletes order_items automatically via FK)
const deleteBulkOrder = async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    const orderId = req.params.id;
    
    await connection.beginTransaction();
    
    // Delete order items first (in case FK cascade is not set)
    await connection.query('DELETE FROM order_items WHERE order_id = ?', [orderId]);
    
    // Delete the order
    const [result] = await connection.query('DELETE FROM orders WHERE id = ?', [orderId]);
    
    if (result.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
      });
    }
    
    await connection.commit();
    
    res.json({ 
      success: true, 
      message: 'Order deleted successfully' 
    });
    
  } catch (error) {
    await connection.rollback();
    console.error('Error deleting order:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting order' 
    });
  } finally {
    connection.release();
  }
};

module.exports = {
  createBulkOrder,
  getOrderWithItems,
  getAllOrdersWithItemCount,
  updateBulkOrder,
  deleteBulkOrder
};

