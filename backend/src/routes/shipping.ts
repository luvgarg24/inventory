import express from 'express';
import axios from 'axios';
import path from 'path';
import fs from 'fs';

const router = express.Router();

const DELHIVERY_API_URL = process.env.DELHIVERY_API_URL;
const DELHIVERY_API_TOKEN = process.env.DELHIVERY_API_TOKEN;
const DELHIVERY_PICKUP_ADDRESS = process.env.DELHIVERY_PICKUP_ADDRESS;

// POST /api/shipping/label
router.post('/label', async (req, res) => {
  try {
    const { order_number, shipping_address, customer, weight, order_items, payment_mode, total_amount, length, breadth, height, invoice_number, invoice_value } = req.body;

    // Validate required fields
    if (!order_number || !shipping_address || !customer) {
      return res.status(400).json({ success: false, error: 'Missing order or address info' });
    }
    if (!weight || !length || !breadth || !height) {
      return res.status(400).json({ success: false, error: 'Missing package dimensions or weight' });
    }
    if (!shipping_address.city || !shipping_address.zip || !shipping_address.province || !shipping_address.address1) {
      return res.status(400).json({ success: false, error: 'Incomplete shipping address' });
    }
    if (!invoice_number || !invoice_value) {
      return res.status(400).json({ success: false, error: 'Invoice number and value are required' });
    }

    // Prepare payload for Delhivery API
    // Prepare Delhivery-compliant payload
    const shipmentData = {
      pickup_location: DELHIVERY_PICKUP_ADDRESS,
      shipments: [
        {
          order: String(order_number),
          waybill: '', // Let Delhivery auto-generate
          consignee: customer.first_name + ' ' + customer.last_name,
          consignee_address: (shipping_address.address1 || '') + (shipping_address.address2 ? ' ' + shipping_address.address2 : ''),
          consignee_city: shipping_address.city,
          consignee_pincode: shipping_address.zip,
          consignee_state: shipping_address.province,
          consignee_phone: shipping_address.phone || '',
          payment_mode: payment_mode || 'Prepaid',
          total_amount: Number(total_amount),
          cod_amount: (payment_mode === 'COD' ? Number(total_amount) : 0),
          weight: Number(weight),
          length: Number(length),
          breadth: Number(breadth),
          height: Number(height),
          pieces: 1,
          product_details: order_items ? order_items.map((i: { name: string }) => i.name).join(', ') : 'General',
          invoice_number: String(invoice_number),
          invoice_value: Number(invoice_value),
        }
      ]
    };
    const headers = {
      Authorization: 'Token ' + DELHIVERY_API_TOKEN,
      'Content-Type': 'application/x-www-form-urlencoded'
    };

    // Call Delhivery API (form-encoded)
    if (!DELHIVERY_API_URL) {
      throw new Error('DELHIVERY_API_URL is not defined in environment variables');
    }
    const params = new URLSearchParams();
    params.append('format', 'json');
    params.append('data', JSON.stringify(shipmentData));
    const response = await axios.post(DELHIVERY_API_URL, params, { headers });
    const result = response.data;
    if (!result.success) {
      // Log and show Delhivery's full error response for debugging
      console.error('Delhivery API error:', JSON.stringify(result, null, 2));
      return res.status(400).json({ success: false, error: result.error || result.packages?.[0]?.remarks || 'Delhivery API error', delhivery_response: result });
    }
    const shipment = result.packages && result.packages[0];
    if (!shipment) {
      return res.status(400).json({ success: false, error: 'No shipment created' });
    }

    // Get tracking number and label
    const tracking_number = shipment.waybill;
    let label_url = shipment.label;
    if (shipment.label && shipment.label.startsWith('data:application/pdf;base64,')) {
      // Save base64 PDF to file
      const fileName = `delhivery_label_${order_number}_${Date.now()}.pdf`;
      const filePath = path.join(__dirname, '../../public/labels', fileName);
      const publicUrl = `/labels/${fileName}`;
      const base64Data = shipment.label.replace(/^data:application\/pdf;base64,/, '');
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      fs.writeFileSync(filePath, base64Data, 'base64');
      label_url = publicUrl;
    }

    res.json({ success: true, tracking_number, label_url });
  } catch (err: any) {
    if (err.response && err.response.data) {
      console.error('Delhivery API error:', err.response.data);
      res.status(500).json({ success: false, error: err.response.data });
    } else {
      console.error('Delhivery API error:', err);
      res.status(500).json({ success: false, error: 'Delhivery API integration failed' });
    }
  }
});

export default router;
