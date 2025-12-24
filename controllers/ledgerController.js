const db = require('../config/database');

const getAllLedgers = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT l.*, d.district_name 
      FROM ledgers l 
      LEFT JOIN districts d ON l.district_id = d.id 
      ORDER BY l.created_at DESC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching ledgers' });
  }
};

const getLedger = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT l.*, d.district_name 
      FROM ledgers l 
      LEFT JOIN districts d ON l.district_id = d.id 
      WHERE l.id = ?
    `, [req.params.id]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Ledger not found' });
    }
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching ledger' });
  }
};

const createLedger = async (req, res) => {
  try {
    const {
      party_code, party_name, party_type, address, district_id, state,
      gstin, pan, contact_person, mobile_number, email, ledger_mapping, active_status
    } = req.body;

    if (!party_code || !party_name) {
      return res.status(400).json({ success: false, message: 'Party code and name are required' });
    }

    const [result] = await db.query(
      `INSERT INTO ledgers (party_code, party_name, party_type, address, district_id, state, 
        gstin, pan, contact_person, mobile_number, email, ledger_mapping, active_status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [party_code, party_name, party_type, address, district_id || null, state,
        gstin, pan, contact_person, mobile_number, email, ledger_mapping, active_status || 'Active']
    );

    res.status(201).json({
      success: true,
      message: 'Ledger created successfully',
      data: { id: result.insertId, ...req.body }
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ success: false, message: 'Party code already exists' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateLedger = async (req, res) => {
  try {
    const {
      party_code, party_name, party_type, address, district_id, state,
      gstin, pan, contact_person, mobile_number, email, ledger_mapping, active_status
    } = req.body;

    const [result] = await db.query(
      `UPDATE ledgers SET party_code = ?, party_name = ?, party_type = ?, address = ?, 
       district_id = ?, state = ?, gstin = ?, pan = ?, contact_person = ?, 
       mobile_number = ?, email = ?, ledger_mapping = ?, active_status = ?, updated_at = NOW() 
       WHERE id = ?`,
      [party_code, party_name, party_type, address, district_id || null, state,
        gstin, pan, contact_person, mobile_number, email, ledger_mapping, active_status, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Ledger not found' });
    }
    res.json({ success: true, message: 'Ledger updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating ledger' });
  }
};

const deleteLedger = async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM ledgers WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Ledger not found' });
    }
    res.json({ success: true, message: 'Ledger deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting ledger' });
  }
};

module.exports = { getAllLedgers, getLedger, createLedger, updateLedger, deleteLedger };
