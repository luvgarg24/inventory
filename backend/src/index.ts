import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import shopifyRoutes from './routes/shopify';
import productsRoutes from './routes/products';
import ordersRoutes from './routes/orders';
import shippingRoutes from './routes/shipping';
import dashboardRoutes from './routes/dashboard';
import authRoutes from './routes/auth';
import path from 'path';

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

app.use(cors({
  origin: [
    'https://inventory.thegrainghar.in',
    'https://inventory-front-c1we.onrender.com',
    'http://localhost:3000'
  ],
  credentials: true
}));
app.use(express.json());

// Auth middleware
app.use((req, res, next) => {
  if (req.path === '/api/login') return next();
  const token = req.headers['authorization'];
  if (token === 'valid-session') {
    return next();
  }
  res.status(401).json({ success: false, error: 'Unauthorized' });
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'running' });
});

app.use('/shopify', shopifyRoutes);
app.use('/api', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/shipping', shippingRoutes);

// Serve generated labels statically
app.use('/labels', express.static(path.join(__dirname, '../public/labels')));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Backend listening on port ${PORT}`);
});
