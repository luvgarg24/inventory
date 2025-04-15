import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  CircularProgress,
  Snackbar,
  Alert,
  Link
} from '@mui/material';

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

interface ShopifyOrder {
  id: number;
  order_number: number;
  created_at: string;
  fulfillment_status: string | null;
  customer: {
    first_name: string;
    last_name: string;
    email: string;
  };
  shipping_address: ShopifyAddress;
  total_price: string; // Added for Delhivery integration
  line_items: { name: string }[]; // Added for Delhivery integration
}

const Shipping: React.FC = () => {
  const [orders, setOrders] = useState<ShopifyOrder[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [labelLoadingId, setLabelLoadingId] = useState<number | null>(null);
  const [labelUrl, setLabelUrl] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:4000';

  const fetchOrders = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/api/orders`);
      const data = await response.json();
      if (!data.success) throw new Error(data.error);
      setOrders(data.orders.filter((o: ShopifyOrder) => o.fulfillment_status !== 'fulfilled'));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch orders');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // New: state for weight, payment mode, tracking number
  const [weightInputs, setWeightInputs] = useState<{ [orderId: number]: number }>({});
  const [paymentModes, setPaymentModes] = useState<{ [orderId: number]: string }>({});
  const [trackingNumber, setTrackingNumber] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState<{ [orderId: number]: { length: number; breadth: number; height: number } }>({});
  const [invoiceInputs, setInvoiceInputs] = useState<{ [orderId: number]: { invoice_number: string; invoice_value: number } }>({});

  const handleGenerateLabel = async (order: ShopifyOrder) => {
    setLabelLoadingId(order.id);
    setLabelUrl(null);
    setError(null);
    setSuccess(null);
    setTrackingNumber(null);
    try {
      const response = await fetch(`${API_BASE}/api/shipping/label`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_number: order.order_number,
          shipping_address: order.shipping_address,
          customer: order.customer,
          weight: weightInputs[order.id] || 0.5,
          payment_mode: paymentModes[order.id] || 'Prepaid',
          total_amount: Number(order.total_price || 0),
          order_items: order.line_items || [],
          length: dimensions[order.id]?.length || 10,
          breadth: dimensions[order.id]?.breadth || 10,
          height: dimensions[order.id]?.height || 10,
          invoice_number: invoiceInputs[order.id]?.invoice_number || '',
          invoice_value: invoiceInputs[order.id]?.invoice_value || 0,
        })
      });
      const data = await response.json();
      if (!data.success) throw new Error(data.error);
      setLabelUrl(data.label_url.startsWith('http') ? data.label_url : `http://localhost:4000${data.label_url}`);
      setTrackingNumber(data.tracking_number || null);
      setSuccess('Shipment created and label generated!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate label');
    } finally {
      setLabelLoadingId(null);
    }
  };

  return (
    <Box sx={{ width: '100%', px: { xs: 1, sm: 4, md: 8 }, py: { xs: 2, md: 4 } }}>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Typography variant="h5" fontWeight={800} color="#222">Shipping Labels</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={fetchOrders}
          startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null}
          disabled={isLoading}
          sx={{ boxShadow: 2, borderRadius: 3, fontWeight: 700, textTransform: 'none', bgcolor: '#582000', '&:hover': { bgcolor: '#3d1400' } }}
        >
          Refresh Orders
        </Button>
      </Box>

      <Snackbar open={!!success} autoHideDuration={6000} onClose={() => setSuccess(null)} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <Alert onClose={() => setSuccess(null)} severity="success">{success}</Alert>
      </Snackbar>
      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError(null)} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <Alert onClose={() => setError(null)} severity="error">{error}</Alert>
      </Snackbar>

      <TableContainer component={Paper} sx={{ mx: 'auto', maxWidth: 1400, width: '100%', boxShadow: 3, borderRadius: 3, p: 0, mb: 4 }}>
        {isLoading ? (
          <Box display="flex" justifyContent="center" p={6}>
            <CircularProgress />
          </Box>
        ) : orders.length === 0 ? (
          <Box py={6} textAlign="center">
            <Typography variant="h6" color="text.secondary" mb={2}>
              {/* Optionally add an icon here for friendliness */}
              No unfulfilled orders found. Click Refresh to try again!
            </Typography>
            <Button variant="contained" sx={{ bgcolor: '#582000', color: '#fff', fontWeight: 700, borderRadius: 3, boxShadow: 1, textTransform: 'none', '&:hover': { bgcolor: '#3d1400' } }} onClick={fetchOrders}>
              Refresh Orders
            </Button>
          </Box>
        ) : (
          <Table sx={{ width: '100%', minWidth: 700, maxWidth: 'none' }} size="medium">
            <TableHead>
              <TableRow sx={{ background: '#f5f7fa', borderBottom: '2px solid #e0e7ef' }}>
                <TableCell sx={{ fontWeight: 800, color: '#222', py: 1.5 }}>Order #</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#222', py: 1.5 }}>Customer</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#222', py: 1.5 }}>Shipping Address</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#222', py: 1.5 }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id} hover sx={{ cursor: 'pointer', transition: 'background 0.2s', '&:hover': { background: '#f0f4fc' } }}>
                  <TableCell>#{order.order_number}</TableCell>
                  <TableCell>{order.customer.first_name} {order.customer.last_name}</TableCell>
                  <TableCell>
                    {order.shipping_address.address1}<br/>
                    {order.shipping_address.address2 && (<>{order.shipping_address.address2}<br/></>)}
                    {order.shipping_address.city}, {order.shipping_address.province} {order.shipping_address.zip}<br/>
                    {order.shipping_address.country}
                  </TableCell>
                  <TableCell>
                    <Box display="flex" flexDirection="column" gap={1}>
                      <Box display="flex" gap={1} alignItems="center">
                        <input
                          type="number"
                          min="0.1"
                          step="0.1"
                          placeholder="Weight (kg)"
                          value={weightInputs[order.id] || ''}
                          onChange={e => setWeightInputs({ ...weightInputs, [order.id]: Number(e.target.value) })}
                          style={{ width: 90, padding: 4, fontSize: 14, borderRadius: 4, border: '1px solid #ccc' }}
                          disabled={labelLoadingId === order.id}
                        />
                        <input
                          type="number"
                          min="1"
                          step="1"
                          placeholder="Length (cm)"
                          value={dimensions[order.id]?.length || ''}
                          onChange={e => setDimensions({ ...dimensions, [order.id]: { ...dimensions[order.id], length: Number(e.target.value) } })}
                          style={{ width: 80, padding: 4, fontSize: 14, borderRadius: 4, border: '1px solid #ccc' }}
                          disabled={labelLoadingId === order.id}
                        />
                        <input
                          type="number"
                          min="1"
                          step="1"
                          placeholder="Breadth (cm)"
                          value={dimensions[order.id]?.breadth || ''}
                          onChange={e => setDimensions({ ...dimensions, [order.id]: { ...dimensions[order.id], breadth: Number(e.target.value) } })}
                          style={{ width: 80, padding: 4, fontSize: 14, borderRadius: 4, border: '1px solid #ccc' }}
                          disabled={labelLoadingId === order.id}
                        />
                        <input
                          type="number"
                          min="1"
                          step="1"
                          placeholder="Height (cm)"
                          value={dimensions[order.id]?.height || ''}
                          onChange={e => setDimensions({ ...dimensions, [order.id]: { ...dimensions[order.id], height: Number(e.target.value) } })}
                          style={{ width: 80, padding: 4, fontSize: 14, borderRadius: 4, border: '1px solid #ccc' }}
                          disabled={labelLoadingId === order.id}
                        />
                        <select
                          value={paymentModes[order.id] || 'Prepaid'}
                          onChange={e => setPaymentModes({ ...paymentModes, [order.id]: e.target.value })}
                          style={{ padding: 4, fontSize: 14, borderRadius: 4, border: '1px solid #ccc' }}
                          disabled={labelLoadingId === order.id}
                        >
                          <option value="Prepaid">Prepaid</option>
                          <option value="COD">COD</option>
                        </select>
                      </Box>
                      <Box display="flex" gap={1} alignItems="center" mt={1}>
                        <input
                          type="text"
                          placeholder="Invoice Number"
                          value={invoiceInputs[order.id]?.invoice_number || ''}
                          onChange={e => setInvoiceInputs({ ...invoiceInputs, [order.id]: { ...invoiceInputs[order.id], invoice_number: e.target.value } })}
                          style={{ width: 120, padding: 4, fontSize: 14, borderRadius: 4, border: '1px solid #ccc' }}
                          disabled={labelLoadingId === order.id}
                        />
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="Invoice Value"
                          value={invoiceInputs[order.id]?.invoice_value || ''}
                          onChange={e => setInvoiceInputs({ ...invoiceInputs, [order.id]: { ...invoiceInputs[order.id], invoice_value: Number(e.target.value) } })}
                          style={{ width: 120, padding: 4, fontSize: 14, borderRadius: 4, border: '1px solid #ccc' }}
                          disabled={labelLoadingId === order.id}
                        />
                      </Box>
                      <Button
                        variant="contained"
                        color="primary"
                        disabled={labelLoadingId === order.id}
                        onClick={() => handleGenerateLabel(order)}
                        sx={{ bgcolor: '#582000', color: '#fff', fontWeight: 700, borderRadius: 3, textTransform: 'none', boxShadow: 1, '&:hover': { bgcolor: '#3d1400' } }}
                      >
                        {labelLoadingId === order.id ? <CircularProgress size={20} color="inherit" /> : 'Generate Label'}
                      </Button>
                      {trackingNumber && labelLoadingId === null && (
                        <Box mt={1}>
                          <Typography variant="body2" fontWeight={700} color="#582000">Tracking #: {trackingNumber}</Typography>
                        </Box>
                      )}
                      {labelUrl && labelLoadingId === null && (
                        <Box mt={1}>
                          <Link href={labelUrl} target="_blank" rel="noopener" sx={{ fontWeight: 700, color: '#582000' }}>
                            Download Label
                          </Link>
                        </Box>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </TableContainer>
    </Box>
  );
};

export default Shipping;
