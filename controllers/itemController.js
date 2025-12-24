const db = require('../config/database');

// Get all items
const getAllItems = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM items ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({ success: false, message: 'Error fetching items' });
  }
};

// Get single item
const getItem = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM items WHERE id = ?', [req.params.id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }
    
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error('Error fetching item:', error);
    res.status(500).json({ success: false, message: 'Error fetching item' });
  }
};

// Create item
const createItem = async (req, res) => {
  try {
    const { 
      item_code, item_name, item_category, stock_group, unit_of_measure,
      hsn_code, gst_rate, cgst_rate, sgst_rate, igst_rate, item_type,
      opening_quantity, opening_value, minimum_stock_level, active_status
    } = req.body;
    
    if (!item_code || !item_name) {
      return res.status(400).json({ success: false, message: 'Item code and name are required' });
    }
    
    // Set stock_quantity from opening_quantity if provided
    const stockQty = opening_quantity || 0;
    
    const [result] = await db.query(
      `INSERT INTO items (item_code, item_name, item_category, stock_group, unit_of_measure,
        hsn_code, gst_rate, cgst_rate, sgst_rate, igst_rate, item_type,
        opening_quantity, opening_value, minimum_stock_level, stock_quantity, active_status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [item_code, item_name, item_category, stock_group, unit_of_measure,
       hsn_code, gst_rate || null, cgst_rate || null, sgst_rate || null, igst_rate || null, item_type || 'Stock',
       opening_quantity || null, opening_value || null, minimum_stock_level || null, stockQty, active_status || 'Active']
    );
    
    res.status(201).json({ 
      success: true, 
      message: 'Item created successfully',
      data: { id: result.insertId, ...req.body }
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ success: false, message: 'Item code already exists' });
    }
    console.error('Error creating item:', error);
    res.status(500).json({ success: false, message: 'Error creating item' });
  }
};

// Update item
const updateItem = async (req, res) => {
  try {
    const { 
      item_code, item_name, item_category, stock_group, unit_of_measure,
      hsn_code, gst_rate, cgst_rate, sgst_rate, igst_rate, item_type,
      opening_quantity, opening_value, minimum_stock_level, active_status
    } = req.body;
    
    const [result] = await db.query(
      `UPDATE items SET item_code = ?, item_name = ?, item_category = ?, stock_group = ?, 
       unit_of_measure = ?, hsn_code = ?, gst_rate = ?, cgst_rate = ?, sgst_rate = ?, 
       igst_rate = ?, item_type = ?, opening_quantity = ?, opening_value = ?, 
       minimum_stock_level = ?, active_status = ? 
       WHERE id = ?`,
      [item_code, item_name, item_category, stock_group, unit_of_measure,
       hsn_code, gst_rate || null, cgst_rate || null, sgst_rate || null, igst_rate || null, item_type,
       opening_quantity || null, opening_value || null, minimum_stock_level || null, active_status, req.params.id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }
    
    res.json({ success: true, message: 'Item updated successfully' });
  } catch (error) {
    console.error('Error updating item:', error);
    res.status(500).json({ success: false, message: 'Error updating item' });
  }
};

// Delete item
const deleteItem = async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM items WHERE id = ?', [req.params.id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }
    
    res.json({ success: true, message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).json({ success: false, message: 'Error deleting item' });
  }
};

module.exports = {
  getAllItems,
  getItem,
  createItem,
  updateItem,
  deleteItem
};
