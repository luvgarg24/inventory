import express from 'express';
import { shopify } from '../shopify';

interface ShopifyAddress {
  first_name: string;
  last_name: string;
  address1: string;
  address2?: string;
  city: string;
  province: string;
  country: string;
  zip: string;
  phone?: string;
}

interface ShopifyLineItem {
  id: number;
  title: string;
  quantity: number;
  price: string;
  sku?: string;
  variant_id: number;
}

interface ShopifyOrder {
  id: number;
  order_number: number;
  created_at: string;
  total_price: string;
  currency: string;
  financial_status: string;
  fulfillment_status: string | null;
  customer: {
    first_name: string;
    last_name: string;
    email: string;
  };
  shipping_address: ShopifyAddress;
  line_items: ShopifyLineItem[];
}

interface OrdersResponse {
  orders: ShopifyOrder[];
}

const router = express.Router();

// Helper function to create a Shopify REST client
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

// Get all orders
router.get('/', async (req, res) => {
  try {
    console.log('Fetching orders...');
    const client = createShopifyClient();
    
    // Fetch orders, sorted by created_at in descending order (newest first)
    console.log('Making request to Shopify API...');
    // Fetch orders
    const response = await client.get<{ orders: ShopifyOrder[] }>({
      path: 'orders.json',
      query: {
        status: 'any',
        fields: 'id,order_number,created_at,total_price,currency,financial_status,fulfillment_status,customer,shipping_address,line_items',
        limit: '50', // Adjust this as needed
        order: 'created_at DESC'
      }
    });

    console.log('Shopify API Response:', response.body);
    const { orders } = response.body;
    console.log(`Found ${orders?.length || 0} orders`);

    // Transform orders to match frontend expectations
    const transformedOrders = (orders || []).map(order => ({
      id: order.id,
      order_number: order.order_number,
      created_at: order.created_at,
      total_price: order.total_price,
      currency: order.currency,
      financial_status: order.financial_status,
      fulfillment_status: order.fulfillment_status,
      customer: {
        first_name: order.customer?.first_name || '',
        last_name: order.customer?.last_name || '',
        email: order.customer?.email || ''
      },
      shipping_address: order.shipping_address || {},
      line_items: order.line_items || []
    }));

    console.log('Transformed orders:', transformedOrders);

    res.json({
      success: true,
      orders: transformedOrders
    });
  } catch (error) {
    console.error('Failed to fetch orders:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch orders';
    res.status(500).json({
      success: false,
      error: errorMessage
    });
  }
});

// Get a specific order
router.get('/:orderId', async (req, res) => {
  try {
    const client = createShopifyClient();
    const { orderId } = req.params;
    
    const response = await client.get<{ order: ShopifyOrder }>({
      path: `orders/${orderId}`,
      query: {
        fields: 'id,order_number,created_at,total_price,currency,financial_status,fulfillment_status,customer,shipping_address,line_items'
      }
    });

    const { order } = response.body;
    res.json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Failed to fetch order:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch order'
    });
  }
});

// Create fulfillment for an order
router.post('/:orderId/fulfill', async (req, res) => {
  try {
    const client = createShopifyClient();
    const { orderId } = req.params;
    const { tracking_number, tracking_company } = req.body;

    // First, get the line items to fulfill
    const orderResponse = await client.get<{ order: ShopifyOrder }>({
      path: `orders/${orderId}`,
      query: { fields: 'line_items' }
    });

    const lineItems = orderResponse.body.order.line_items.map(item => ({
      id: item.id,
      quantity: item.quantity
    }));

    // Create the fulfillment
    interface FulfillmentResponse {
      fulfillment: {
        id: number;
        order_id: number;
        status: string;
        tracking_number?: string;
        tracking_company?: string;
        created_at: string;
      };
    }

    const response = await client.post<FulfillmentResponse>({
      path: `orders/${orderId}/fulfillments.json`,
      data: {
        fulfillment: {
          line_items: lineItems,
          tracking_number,
          tracking_company,
          notify_customer: true
        }
      }
    });

    res.json({
      success: true,
      fulfillment: response.body.fulfillment
    });
  } catch (error) {
    console.error('Failed to create fulfillment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create fulfillment'
    });
  }
});

export default router;
