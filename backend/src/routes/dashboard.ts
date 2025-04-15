import express from 'express';
import { shopify } from '../shopify';

const router = express.Router();

const createShopifyClient = () => {
  return new shopify.clients.Rest({
    session: {
      shop: process.env.SHOPIFY_SHOP_NAME!,
      accessToken: process.env.SHOPIFY_ACCESS_TOKEN!,
      id: '1',
      state: 'active',
      isOnline: false,
      isActive: () => true,
      toObject: () => ({
        id: '1',
        shop: process.env.SHOPIFY_SHOP_NAME!,
        state: 'active',
        isOnline: false,
        accessToken: process.env.SHOPIFY_ACCESS_TOKEN!
      }),
      equals: (other: any) => other?.id === '1',
      toPropertyArray: () => Object.entries({
        id: '1',
        shop: process.env.SHOPIFY_SHOP_NAME!,
        state: 'active',
        isOnline: false,
        accessToken: process.env.SHOPIFY_ACCESS_TOKEN!
      })
    }
  });
};

router.get('/stats', async (req, res) => {
  try {
    const client = createShopifyClient();

    // Get all orders (limit to 250, Shopify's max per call)
    const ordersResp = await client.get<{orders: any[]}>({
      path: 'orders.json',
      query: {
        status: 'any',
        limit: '250',
        fields: 'id,created_at,total_price,financial_status,fulfillment_status,line_items'
      }
    });
    const orders = ordersResp.body.orders;

    // Get all products
    const productsResp = await client.get<{products: any[]}>({
      path: 'products.json',
      query: { fields: 'id,title,variants' }
    });
    const products = productsResp.body.products;

    // Today's date in YYYY-MM-DD
    const todayStr = new Date().toISOString().slice(0, 10);

    // Stats calculations
    const todaysOrders = orders.filter(o => o.created_at.slice(0, 10) === todayStr);
    const unfulfilledOrders = orders.filter(o => o.fulfillment_status !== 'fulfilled');
    const totalProducts = products.length;
    const totalInventory = products.reduce((sum: number, p: any) => sum + p.variants.reduce((s: number, v: any) => s + (v.inventory_quantity || 0), 0), 0);
    const lowStock: { product: string; variant: string; qty: number }[] = [];
    products.forEach((p: any) => p.variants.forEach((v: any) => {
      if ((v.inventory_quantity || 0) <= 5) lowStock.push({
        product: p.title,
        variant: v.title,
        qty: v.inventory_quantity || 0
      });
    }));
    const salesToday = todaysOrders.reduce((sum, o) => sum + parseFloat(o.total_price), 0);
    const salesMonth = orders.filter(o => o.created_at.slice(0,7) === todayStr.slice(0,7)).reduce((sum, o) => sum + parseFloat(o.total_price), 0);

    // Recent activity (last 10 orders)
    const recentOrders = orders
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 10)
      .map(o => ({
        id: o.id,
        created_at: o.created_at,
        total_price: o.total_price,
        fulfillment_status: o.fulfillment_status
      }));

    res.json({
      success: true,
      stats: {
        todaysOrders: todaysOrders.length,
        unfulfilledOrders: unfulfilledOrders.length,
        totalProducts,
        totalInventory,
        lowStock,
        salesToday,
        salesMonth,
        recentOrders
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ success: false, error: 'Failed to get dashboard stats' });
  }
});

export default router;
