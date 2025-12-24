const Order = require('../models/Order');
const Ledger = require('../models/Ledger');
const Item = require('../models/Item');

// Create bulk order (multi-item)
const createBulkOrder = async (req, res) => {
  try {
    const { ledger_id, items, order_date, delivery_date, status, payment_status, payment_method, paid_amount, remarks } = req.body;

    // Calculate total
    const total_amount = items.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
    const balance_due = total_amount - (parseFloat(paid_amount) || 0);

    // Generate order number
    const count = await Order.countDocuments();
    const order_number = `ORD-${String(count + 1).padStart(5, '0')}`;

    const order = new Order({
      order_number,
      ledger_id,
      items,
      total_amount,
      order_date,
      delivery_date,
      status: status || 'Pending',
      payment_status: payment_status || 'Unpaid',
      payment_method: payment_method || 'Pending',
      paid_amount: paid_amount || 0,
      balance_due,
      remarks
    });

    await order.save();
    const populated = await Order.findById(order._id)
      .populate('ledger_id', 'party_name')
      .populate('items.item_id', 'item_name');

    res.status(201).json(populated);
  } catch (error) {
    console.error('Error creating bulk order:', error);
    res.status(500).json({ message: 'Error creating order', error: error.message });
  }
};

// Get all orders with item count
const getAllOrdersWithItemCount = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('ledger_id', 'party_name')
      .sort({ createdAt: -1 })
      .lean();

    // Add items_count for frontend compatibility
    const ordersWithCount = orders.map(order => ({
      ...order,
      id: order._id,
      items_count: order.items.length,
      party_name: order.ledger_id?.party_name
    }));

    res.json(ordersWithCount);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Error fetching orders' });
  }
};

// Get single order with items
const getOrderWithItems = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('ledger_id', 'party_name mobile_number address')
      .populate('items.item_id', 'item_name item_code unit');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const orderData = order.toObject();
    orderData.id = orderData._id;
    orderData.party_name = orderData.ledger_id?.party_name;

    res.json(orderData);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ message: 'Error fetching order' });
  }
};

// Update bulk order
const updateBulkOrder = async (req, res) => {
  try {
    const { ledger_id, items, order_date, delivery_date, status, payment_status, payment_method, paid_amount, remarks } = req.body;

    // Calculate total
    const total_amount = items.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
    const balance_due = total_amount - (parseFloat(paid_amount) || 0);

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      {
        ledger_id,
        items,
        total_amount,
        order_date,
        delivery_date,
        status,
        payment_status,
        payment_method,
        paid_amount,
        balance_due,
        remarks
      },
      { new: true, runValidators: true }
    ).populate('ledger_id', 'party_name')
     .populate('items.item_id', 'item_name');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ message: 'Error updating order', error: error.message });
  }
};

// Delete bulk order
const deleteBulkOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ message: 'Error deleting order' });
  }
};

// Update payment
const updatePayment = async (req, res) => {
  try {
    const { paid_amount, payment_method, payment_status } = req.body;
    
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.paid_amount = paid_amount;
    order.payment_method = payment_method;
    order.payment_status = payment_status;
    order.balance_due = order.total_amount - paid_amount;

    await order.save();
    res.json(order);
  } catch (error) {
    console.error('Error updating payment:', error);
    res.status(500).json({ message: 'Error updating payment' });
  }
};

module.exports = {
  createBulkOrder,
  getAllOrdersWithItemCount,
  getOrderWithItems,
  updateBulkOrder,
  deleteBulkOrder,
  updatePayment
};
