import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import shopifyRoutes from './routes/shopify';
import productsRoutes from './routes/products';
import ordersRoutes from './routes/orders';
import shippingRoutes from './routes/shipping';
import dashboardRoutes from './routes/dashboard';
import path from 'path';

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

app.use(cors({
  origin: '*',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  preflightContinue: false,
  optionsSuccessStatus: 204
}));
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'running' });
});

app.use('/shopify', shopifyRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/shipping', shippingRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Serve generated labels statically
app.use('/labels', express.static(path.join(__dirname, '../public/labels')));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Backend listening on port ${PORT}`);
});
