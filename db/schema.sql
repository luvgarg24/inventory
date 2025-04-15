-- Basic schema for inventory, orders, users
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  role VARCHAR(32) DEFAULT 'staff',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  shopify_id VARCHAR(64) UNIQUE,
  title VARCHAR(255) NOT NULL,
  sku VARCHAR(64),
  inventory_quantity INT DEFAULT 0,
  price NUMERIC(10,2),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  shopify_id VARCHAR(64) UNIQUE,
  user_id INTEGER REFERENCES users(id),
  status VARCHAR(32),
  total NUMERIC(10,2),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id),
  product_id INTEGER REFERENCES products(id),
  quantity INT,
  price NUMERIC(10,2)
);
