import express from 'express';
import { shopify } from '../shopify';

interface ShopifyVariant {
  id: number;
  product_id: number;
  title: string;
  inventory_item_id: number;
  inventory_quantity: number;
}

interface ShopifyProduct {
  id: number;
  title: string;
  variants: ShopifyVariant[];
}

interface VariantResponse {
  variant: ShopifyVariant;
}

interface ProductsResponse {
  products: ShopifyProduct[];
}

interface ProductResponse {
  product: ShopifyProduct;
}

const router = express.Router();

// Cache for the location ID
let locationIdCache: string | null = null;

// Helper function to get the location ID
const getLocationId = async (client: any): Promise<string> => {
  if (locationIdCache) return locationIdCache;

  const response = await client.get({
    path: 'locations',
  });

  const locations = response.body.locations;
  if (!locations || locations.length === 0) {
    throw new Error('No locations found in the Shopify store');
  }

  // Use the first location (usually the main one)
  const locationId = locations[0].id.toString();
  locationIdCache = locationId;
  return locationId;
};

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

// Get all products with inventory levels
router.get('/', async (req, res) => {
  try {
    const client = createShopifyClient();
    
    // Fetch products
    const response = await client.get<ProductsResponse>({
      path: 'products',
      query: { fields: 'id,title,variants,inventory_quantity' }
    });

    const { products } = response.body as ProductsResponse;
    res.json({
      success: true,
      products
    });
  } catch (error) {
    console.error('Failed to fetch products:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch products'
    });
  }
});

// Get inventory levels for a specific product
router.get('/:productId/inventory', async (req, res) => {
  try {
    const client = createShopifyClient();
    const { productId } = req.params;
    
    // Fetch product variants (which contain inventory info)
    const response = await client.get<ProductResponse>({
      path: `products/${productId}`,
      query: { fields: 'variants' }
    });

    const { product } = response.body as ProductResponse;
    res.json({
      success: true,
      inventory: product.variants
    });
  } catch (error) {
    console.error('Failed to fetch inventory:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch inventory'
    });
  }
});

// Update inventory level for a variant
router.put('/variants/:variantId/inventory', async (req, res) => {
  try {
    const client = createShopifyClient();
    const { variantId } = req.params;
    const { quantity } = req.body;

    if (typeof quantity !== 'number') {
      return res.status(400).json({
        success: false,
        error: 'Quantity must be a number'
      });
    }

    // First, get the inventory item ID for this variant
    const variantResponse = await client.get<VariantResponse>({
      path: `variants/${variantId}`,
      query: { fields: 'inventory_item_id' }
    });

    const { variant } = variantResponse.body as VariantResponse;
    const inventoryItemId = variant.inventory_item_id;

    console.log('Updating inventory with:', { variantId, quantity });

    // Get the location ID
    const locationId = await getLocationId(client);
    console.log('Got location ID:', locationId);

    // Then adjust the inventory level
    const response = await client.post({
      path: 'inventory_levels/set',
      data: {
        location_id: locationId,
        inventory_item_id: inventoryItemId,
        available: quantity
      }
    });

    console.log('Inventory update response:', response.body);

    // After updating, fetch the latest variant data
    const updatedVariant = await client.get<VariantResponse>({
      path: `variants/${variantId}`,
      query: { fields: 'id,title,inventory_quantity,inventory_item_id' }
    });

    res.json({
      success: true,
      inventory: updatedVariant.body.variant
    });
  } catch (error) {
    console.error('Failed to update inventory:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update inventory'
    });
  }
});

export default router;
