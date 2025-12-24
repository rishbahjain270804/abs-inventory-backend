const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
require('dotenv').config();

async function initDatabase() {
  let connection;
  
  try {
    // Connect without database first
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || ''
    });

    console.log('Connected to MySQL server');

    // Create database
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
    console.log(`✓ Database '${process.env.DB_NAME}' created/verified`);

    // Use the database
    await connection.query(`USE ${process.env.DB_NAME}`);

    // Drop existing tables (order matters due to foreign key constraints)
    const tables = ['order_items', 'orders', 'items', 'ledgers', 'users', 'districts'];
    for (const table of tables) {
      await connection.query(`DROP TABLE IF EXISTS ${table}`);
      console.log(`✓ Dropped table '${table}' if existed`);
    }

    // Create districts table
    await connection.query(`
      CREATE TABLE districts (
        id INT PRIMARY KEY AUTO_INCREMENT,
        district_code VARCHAR(50) UNIQUE NOT NULL,
        district_name VARCHAR(100) NOT NULL,
        state VARCHAR(100),
        postal_code VARCHAR(20),
        zone_region VARCHAR(100),
        active_status VARCHAR(20) DEFAULT 'Active',
        remarks TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_district_code (district_code),
        INDEX idx_district_name (district_name),
        INDEX idx_state (state),
        INDEX idx_postal_code (postal_code)
      )
    `);
    console.log('✓ Created districts table');

    // Create users table
    await connection.query(`
      CREATE TABLE users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        full_name VARCHAR(100),
        role VARCHAR(20) DEFAULT 'user',
        district_id INT,
        active_status VARCHAR(20) DEFAULT 'Active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (district_id) REFERENCES districts(id) ON DELETE SET NULL,
        INDEX idx_username (username),
        INDEX idx_email (email),
        INDEX idx_district_id (district_id)
      )
    `);
    console.log('✓ Created users table');

    // Create ledgers table (Customer/Party Master)
    await connection.query(`
      CREATE TABLE ledgers (
        id INT PRIMARY KEY AUTO_INCREMENT,
        party_code VARCHAR(50) UNIQUE NOT NULL,
        party_name VARCHAR(100) NOT NULL,
        party_type VARCHAR(50),
        address TEXT,
        district_id INT,
        state VARCHAR(100),
        gstin VARCHAR(20),
        pan VARCHAR(20),
        contact_person VARCHAR(100),
        mobile_number VARCHAR(20),
        email VARCHAR(100),
        ledger_mapping VARCHAR(100),
        active_status VARCHAR(20) DEFAULT 'Active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (district_id) REFERENCES districts(id) ON DELETE SET NULL,
        INDEX idx_party_code (party_code),
        INDEX idx_party_name (party_name),
        INDEX idx_district_id (district_id),
        INDEX idx_gstin (gstin)
      )
    `);
    console.log('✓ Created ledgers table');

    // Create items table (Product Master)
    await connection.query(`
      CREATE TABLE items (
        id INT PRIMARY KEY AUTO_INCREMENT,
        item_code VARCHAR(50) UNIQUE NOT NULL,
        item_name VARCHAR(100) NOT NULL,
        item_category VARCHAR(50),
        stock_group VARCHAR(50),
        unit_of_measure VARCHAR(20),
        hsn_code VARCHAR(20),
        gst_rate DECIMAL(5,2),
        cgst_rate DECIMAL(5,2),
        sgst_rate DECIMAL(5,2),
        igst_rate DECIMAL(5,2),
        item_type VARCHAR(20),
        opening_quantity DECIMAL(10,2),
        opening_value DECIMAL(10,2),
        minimum_stock_level DECIMAL(10,2),
        stock_quantity DECIMAL(10,2) DEFAULT 0,
        active_status VARCHAR(20) DEFAULT 'Active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_item_code (item_code),
        INDEX idx_item_name (item_name),
        INDEX idx_hsn_code (hsn_code)
      )
    `);
    console.log('✓ Created items table');

    // Create orders table
    await connection.query(`
      CREATE TABLE orders (
        id INT PRIMARY KEY AUTO_INCREMENT,
        order_number VARCHAR(50) UNIQUE NOT NULL,
        ledger_id INT,
        item_id INT,
        quantity INT,
        unit_price DECIMAL(10,2),
        total_amount DECIMAL(10,2),
        order_date DATE,
        delivery_date DATE,
        status VARCHAR(20) DEFAULT 'Pending',
        payment_method VARCHAR(50) DEFAULT 'Pending',
        payment_status VARCHAR(20) DEFAULT 'Unpaid',
        paid_amount DECIMAL(10,2) DEFAULT 0,
        balance_due DECIMAL(10,2) DEFAULT 0,
        remarks TEXT,
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (ledger_id) REFERENCES ledgers(id) ON DELETE SET NULL,
        FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE SET NULL,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_order_number (order_number),
        INDEX idx_status (status),
        INDEX idx_order_date (order_date),
        INDEX idx_payment_status (payment_status)
      )
    `);
    console.log('✓ Created orders table');

    // Create order_items table (for bulk orders with multiple items)
    await connection.query(`
      CREATE TABLE order_items (
        id INT PRIMARY KEY AUTO_INCREMENT,
        order_id INT NOT NULL,
        item_id INT NOT NULL,
        qty_mt DECIMAL(10,3) DEFAULT 0,
        qty_pcs INT DEFAULT 0,
        rate DECIMAL(10,2) DEFAULT 0,
        amount DECIMAL(10,2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE,
        INDEX idx_order_id (order_id),
        INDEX idx_item_id (item_id)
      )
    `);
    console.log('✓ Created order_items table');

    // Create default admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await connection.query(`
      INSERT INTO users (username, password, email, full_name, role, active_status)
      VALUES ('admin', ?, 'admin@abs.com', 'System Administrator', 'admin', 'Active')
    `, [hashedPassword]);
    console.log('✓ Created default admin user (username: admin, password: admin123)');

    console.log('\n✅ Database initialization completed successfully!');
    console.log('You can now start the backend server with: npm run dev');

  } catch (error) {
    console.error('❌ Error initializing database:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

initDatabase();
