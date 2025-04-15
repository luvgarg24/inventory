import express from 'express';
import { shopify } from '../shopify';

const router = express.Router();

// Test endpoint to verify Shopify connection
router.get('/test', async (req, res) => {
  try {
    // Try to fetch shop information to test the connection
    const client = new shopify.clients.Rest({
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

    const response = await client.get({
      path: 'shop'
    });

    res.json({
      success: true,
      shop: response.body
    });
  } catch (error) {
    console.error('Shopify API error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to connect to Shopify'
    });
  }
});

export default router;
