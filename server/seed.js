import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';

const config = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Lera@2019',
  multipleStatements: true,
  charset: 'utf8mb4',
};

async function seed() {
  const conn = await mysql.createConnection(config);
  console.log('Connected to MySQL...');

  // Create database
  await conn.query('DROP DATABASE IF EXISTS cosmetic_shop');
  await conn.query('CREATE DATABASE IF NOT EXISTS cosmetic_shop CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
  await conn.query('USE cosmetic_shop');
  console.log('Database created...');

  // Create tables
  await conn.query(`
    CREATE TABLE profiles (
      id VARCHAR(36) PRIMARY KEY,
      username VARCHAR(50) UNIQUE NOT NULL,
      email VARCHAR(255),
      phone VARCHAR(20),
      password_hash VARCHAR(255) NOT NULL,
      role ENUM('admin', 'staff') DEFAULT 'staff',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  await conn.query(`
    CREATE TABLE suppliers (
      id VARCHAR(36) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      contact_person VARCHAR(255),
      email VARCHAR(255),
      phone VARCHAR(20),
      address TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  await conn.query(`
    CREATE TABLE products (
      id VARCHAR(36) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      brand VARCHAR(100) NOT NULL,
      category VARCHAR(100) NOT NULL,
      price DECIMAL(10, 2) NOT NULL,
      stock_quantity INT NOT NULL DEFAULT 0,
      low_stock_threshold INT NOT NULL DEFAULT 10,
      expiry_date DATE,
      supplier_id VARCHAR(36),
      description TEXT,
      image_url VARCHAR(500),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL
    )
  `);

  await conn.query(`
    CREATE TABLE customers (
      id VARCHAR(36) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE,
      phone VARCHAR(20),
      password_hash VARCHAR(255) NULL,
      address TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  await conn.query(`
    CREATE TABLE orders (
      id VARCHAR(36) PRIMARY KEY,
      order_number VARCHAR(50) UNIQUE NOT NULL,
      customer_id VARCHAR(36),
      total_amount DECIMAL(10, 2) NOT NULL,
      status ENUM('pending', 'completed', 'cancelled') DEFAULT 'pending',
      created_by VARCHAR(36),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL,
      FOREIGN KEY (created_by) REFERENCES profiles(id) ON DELETE SET NULL
    )
  `);

  await conn.query(`
    CREATE TABLE order_details (
      id VARCHAR(36) PRIMARY KEY,
      order_id VARCHAR(36) NOT NULL,
      product_id VARCHAR(36),
      product_name VARCHAR(255) NOT NULL,
      quantity INT NOT NULL,
      unit_price DECIMAL(10, 2) NOT NULL,
      subtotal DECIMAL(10, 2) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
    )
  `);

  await conn.query(`
    CREATE TABLE payments (
      id VARCHAR(36) PRIMARY KEY,
      order_id VARCHAR(36) NOT NULL,
      amount DECIMAL(10, 2) NOT NULL,
      payment_method ENUM('cash', 'card', 'upi') NOT NULL,
      payment_status ENUM('pending', 'completed', 'failed') DEFAULT 'completed',
      transaction_id VARCHAR(100),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
    )
  `);

  console.log('Tables created...');

  // Add constraints from R2_Chap3
  await conn.query('ALTER TABLE products ADD CONSTRAINT chk_price_positive CHECK (price > 0)');
  await conn.query('ALTER TABLE customers ADD CONSTRAINT unique_customer_phone UNIQUE (phone)');
  await conn.query('ALTER TABLE products ALTER stock_quantity SET DEFAULT 10');

  // Create Views
  await conn.query(`
    CREATE VIEW Low_Stock_Alert AS
    SELECT name, brand, stock_quantity, low_stock_threshold
    FROM products WHERE stock_quantity <= low_stock_threshold
  `);

  await conn.query(`
    CREATE VIEW Order_Receipt_View AS
    SELECT od.order_id, p.name AS Product_Name, od.quantity, od.subtotal
    FROM order_details od JOIN products p ON od.product_id = p.id
  `);

  await conn.query(`
    CREATE VIEW Staff_Sales_Performance AS
    SELECT p.username, COUNT(o.id) AS Total_Orders, SUM(o.total_amount) AS Total_Sales
    FROM profiles p JOIN orders o ON p.id = o.created_by GROUP BY p.username
  `);

  console.log('Views created...');

  // Create Triggers
  await conn.query(`
    CREATE TRIGGER After_Order_Detail_Insert
    AFTER INSERT ON order_details
    FOR EACH ROW
    BEGIN
        UPDATE products SET stock_quantity = stock_quantity - NEW.quantity WHERE id = NEW.product_id;
    END
  `);

  await conn.query(`
    CREATE TRIGGER Before_Customer_Update
    BEFORE UPDATE ON customers
    FOR EACH ROW
    BEGIN
        SET NEW.updated_at = CURRENT_TIMESTAMP;
    END
  `);

  await conn.query(`
    CREATE TRIGGER After_Payment_Insert
    AFTER INSERT ON payments
    FOR EACH ROW
    BEGIN
        IF NEW.payment_status = 'completed' THEN
            UPDATE orders SET status = 'completed' WHERE id = NEW.order_id;
        END IF;
    END
  `);

  await conn.query(`
    CREATE TRIGGER Prevent_Over_Order
    BEFORE INSERT ON order_details
    FOR EACH ROW
    BEGIN
        DECLARE current_stock INT;
        SELECT stock_quantity INTO current_stock FROM products WHERE id = NEW.product_id;
        IF NEW.quantity > current_stock THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error: Requested quantity exceeds available stock.';
        END IF;
    END
  `);

  console.log('Triggers created...');

  // Seed data
  const adminHash = await bcrypt.hash('admin123', 10);
  const staffHash = await bcrypt.hash('staff123', 10);

  await conn.query(`INSERT INTO profiles (id, username, email, phone, password_hash, role) VALUES
    ('admin-001', 'admin', 'admin@glamour.local', '9999999999', ?, 'admin'),
    ('staff-001', 'sara_staff', 'sara@glamour.local', '9999999998', ?, 'staff')
  `, [adminHash, staffHash]);

  await conn.query(`INSERT INTO suppliers (id, name, contact_person, email, phone, address) VALUES
    ('supp-1', 'Beauty Supplies Co.', 'John Doe', 'john@beauty.com', '9876543210', 'Mumbai, Maharashtra'),
    ('supp-2', 'Cosmetic Dist Ltd.', 'Jane Smith', 'jane@cosmetic.com', '9876543211', 'Delhi, NCR'),
    ('supp-3', 'Luxe Beauty House', 'Ankit Verma', 'ankit@luxebeauty.com', '9876543212', 'Bangalore, Karnataka'),
    ('supp-4', 'Glow Essentials', 'Priya Nair', 'priya@glow.com', '9876543213', 'Pune, Maharashtra')
  `);

  const products = [
    ['prod-1', 'Moisturizing Cream', 'Lakme', 'Skincare', 599.00, 50, '/images/products/prod-12.jpg', 'supp-1', 'Deep moisturizing cream for all skin types. Keeps skin hydrated for 24 hours.'],
    ['prod-2', 'Lipstick - Ruby Red', 'Maybelline', 'Makeup', 399.00, 100, '/images/products/prod-11.jpg', 'supp-2', 'Bold ruby red lipstick with satin finish. Long-lasting color that stays all day.'],
    ['prod-3', 'Face Wash - Clear Skin', 'Neutrogena', 'Skincare', 299.00, 75, '/images/products/prod-6.jpg', 'supp-1', 'Oil-free face wash that deeply cleanses pores for clear, radiant skin.'],
    ['prod-4', 'Charcoal Face Mask', 'Clinique', 'Skincare', 799.00, 40, '/images/products/prod-2.jpg', 'supp-3', 'Activated charcoal mask that draws out impurities and toxins for a refreshed complexion.'],
    ['prod-5', 'Anti-Aging Serum', 'Olay', 'Skincare', 1299.00, 30, '/images/products/prod-1.jpg', 'supp-1', 'Advanced anti-aging serum with retinol and vitamin C. Reduces wrinkles visibly in 4 weeks.'],
    ['prod-6', 'Rose Body Mist', 'Bath & Body Works', 'Fragrance', 899.00, 60, '/images/products/prod-15.jpg', 'supp-4', 'A delicate rose-infused body mist for a fresh, floral scent that lasts.'],
    ['prod-7', 'Foundation - Ivory', 'MAC', 'Makeup', 1599.00, 45, '/images/products/prod-7.jpg', 'supp-2', 'Full-coverage foundation in Ivory shade. Flawless matte finish that lasts 12 hours.'],
    ['prod-8', 'Hair Serum', 'TRESemmé', 'Haircare', 449.00, 80, '/images/products/prod-8.jpg', 'supp-3', 'Keratin-infused hair serum for smooth, frizz-free hair with radiant shine.'],
    ['prod-9', 'Nail Polish - Blush', 'OPI', 'Makeup', 349.00, 120, '/images/products/prod-14.jpg', 'supp-4', 'Premium nail lacquer in Blush Pink. Chip-resistant formula that lasts up to 7 days.'],
    ['prod-10', 'Hydrating Body Lotion', 'Vaseline', 'Skincare', 249.00, 90, '/images/products/prod-9.jpg', 'supp-1', 'Deep hydration body lotion enriched with shea butter and vitamin E.'],
    ['prod-11', 'Perfume - Midnight Rose', 'Dior', 'Fragrance', 3999.00, 20, '/images/products/prod-13.jpg', 'supp-3', 'An intoxicating blend of Damascus rose and oud. A signature fragrance for evenings.'],
    ['prod-12', 'Eye Shadow Palette', 'Urban Decay', 'Makeup', 1899.00, 35, '/images/products/prod-5.jpg', 'supp-2', '12-shade palette with matte and shimmer finishes. Highly pigmented and blendable.'],
    ['prod-13', 'Sunscreen SPF 50', 'La Roche-Posay', 'Skincare', 699.00, 55, '/images/products/prod-17.jpg', 'supp-1', 'Lightweight sunscreen with broad-spectrum SPF 50 protection. Non-greasy formula.'],
    ['prod-14', 'Volume Shampoo', 'Pantene', 'Haircare', 399.00, 70, '/images/products/prod-18.jpg', 'supp-3', 'Pro-V volume boost shampoo for fine, flat hair. Gives incredible body and bounce.'],
    ['prod-15', 'Lip Gloss - Peach', 'NYX', 'Makeup', 299.00, 110, '/images/products/prod-10.jpg', 'supp-4', 'High-shine lip gloss in Peach Sorbet. Non-sticky formula with sweet scent.'],
    ['prod-16', 'Cleanser Cream', 'Cetaphil', 'Skincare', 549.00, 65, '/images/products/prod-3.jpg', 'supp-1', 'Gentle daily cleanser cream for sensitive skin. Dermatologist recommended.'],
    ['prod-17', 'Setting Spray', 'e.l.f.', 'Makeup', 499.00, 8, '/images/products/prod-16.jpg', 'supp-2', 'Makeup setting spray that locks in your look for up to 16 hours. Micro-fine mist.'],
    ['prod-18', 'Coconut Hair Oil', 'Parachute', 'Haircare', 199.00, 150, '/images/products/prod-4.jpg', 'supp-4', '100% pure coconut oil for deep hair nourishment. Strengthens roots and adds shine.'],
  ];

  for (const p of products) {
    await conn.query(
      `INSERT INTO products (id, name, brand, category, price, stock_quantity, image_url, supplier_id, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      p
    );
  }

  console.log('Products seeded...');

  // Customers
  const customerHash = await bcrypt.hash('password123', 10);
  await conn.query(`INSERT INTO customers (id, name, email, phone, address, password_hash) VALUES
    ('cust-1', 'Priya Sharma', 'priya@example.com', '9876543220', 'Koramangala, Bangalore', ?),
    ('cust-2', 'Rahul Kumar', 'rahul@example.com', '9876543221', 'Andheri, Mumbai', ?),
    ('cust-3', 'Sneha Reddy', 'sneha@example.com', '9876543222', 'Banjara Hills, Hyderabad', ?),
    ('cust-4', 'Arjun Mehta', 'arjun@example.com', '9876543223', 'Connaught Place, Delhi', ?)
  `, [customerHash, customerHash, customerHash, customerHash]);

  // Orders
  await conn.query(`INSERT INTO orders (id, order_number, customer_id, total_amount, status, created_by) VALUES
    ('ord-1', 'ORD-1001', 'cust-1', 998.00, 'completed', 'admin-001'),
    ('ord-2', 'ORD-1002', 'cust-2', 299.00, 'pending', 'staff-001'),
    ('ord-3', 'ORD-1003', 'cust-3', 2498.00, 'completed', 'admin-001'),
    ('ord-4', 'ORD-1004', 'cust-4', 1598.00, 'pending', 'staff-001')
  `);

  // Order Details
  await conn.query(`INSERT INTO order_details (id, order_id, product_id, product_name, quantity, unit_price, subtotal) VALUES
    ('det-1', 'ord-1', 'prod-1', 'Moisturizing Cream', 1, 599.00, 599.00),
    ('det-2', 'ord-1', 'prod-2', 'Lipstick - Ruby Red', 1, 399.00, 399.00),
    ('det-3', 'ord-2', 'prod-3', 'Face Wash - Clear Skin', 1, 299.00, 299.00),
    ('det-4', 'ord-3', 'prod-5', 'Anti-Aging Serum', 1, 1299.00, 1299.00),
    ('det-5', 'ord-3', 'prod-4', 'Charcoal Face Mask', 1, 799.00, 799.00),
    ('det-6', 'ord-3', 'prod-15', 'Lip Gloss - Peach', 1, 299.00, 299.00),
    ('det-7', 'ord-4', 'prod-7', 'Foundation - Ivory', 1, 1599.00, 1599.00)
  `);

  // Payments
  await conn.query(`INSERT INTO payments (id, order_id, amount, payment_method, payment_status, transaction_id) VALUES
    ('pay-1', 'ord-1', 998.00, 'upi', 'completed', 'TXN123456789'),
    ('pay-2', 'ord-2', 299.00, 'cash', 'pending', NULL),
    ('pay-3', 'ord-3', 2498.00, 'card', 'completed', 'TXN987654321')
  `);

  console.log('All data seeded successfully!');
  await conn.end();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
