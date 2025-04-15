import React, { useState, useEffect } from 'react';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Chip,
  Snackbar,
  Alert,
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';
import { format } from 'date-fns';

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

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<ShopifyOrder[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<ShopifyOrder | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingCompany, setTrackingCompany] = useState('');

  const shippingCompanies = [
    'UPS',
    'FedEx',
    'USPS',
    'DHL',
    'Canada Post',
    'Other'
  ];

  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:4000';

  const fetchOrders = async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('Fetching orders...');
      const response = await fetch(`${API_BASE}/api/orders`);
      if (!response.ok) throw new Error('Failed to fetch orders');
      
      const data = await response.json();
      console.log('Orders API response:', data);
      if (!data.success) throw new Error(data.error);
      
      if (!Array.isArray(data.orders)) {
        throw new Error('Orders data is not an array');
      }
      
      console.log('Setting orders:', data.orders);
      setOrders(data.orders);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch orders');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleFulfillOrder = async () => {
    if (!selectedOrder) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/api/orders/${selectedOrder.id}/fulfill`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          tracking_number: trackingNumber,
          tracking_company: trackingCompany
        })
      });

      if (!response.ok) throw new Error('Failed to fulfill order');
      
      const data = await response.json();
      if (!data.success) throw new Error(data.error);
      
      setSuccess('Order fulfilled successfully');
      setIsDialogOpen(false);
      fetchOrders(); // Refresh orders list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fulfill order');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'fulfilled':
        return 'success';
      case 'partial':
        return 'warning';
      case null:
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ width: '100%', px: { xs: 1, sm: 4, md: 8 }, py: { xs: 2, md: 4 } }}>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Typography variant="h5" fontWeight={800} color="#222">Orders</Typography>
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

      {/* Success Snackbar */}
      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={() => setSuccess(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={() => setSuccess(null)} severity="success">
          {success}
        </Alert>
      </Snackbar>

      {/* Error Snackbar */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={() => setError(null)} severity="error">
          {error}
        </Alert>
      </Snackbar>

      <TableContainer component={Paper} sx={{ mx: 'auto', maxWidth: 1400, width: '100%', boxShadow: 3, borderRadius: 3, p: 0, mb: 4 }}>
        {isLoading ? (
          <Box display="flex" justifyContent="center" p={6}>
            <Box textAlign="center">
              <CircularProgress sx={{ mb: 2 }} />
              <Typography color="textSecondary">
                Loading orders...
              </Typography>
            </Box>
          </Box>
        ) : orders.length === 0 ? (
          <Box py={6} textAlign="center">
            <Typography variant="h6" color="text.secondary" mb={2}>
              {/* Optionally add an icon here for friendliness */}
              No orders found. Click Refresh to try again!
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
                <TableCell sx={{ fontWeight: 800, color: '#222', py: 1.5 }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#222', py: 1.5 }}>Customer</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#222', py: 1.5 }}>Total</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#222', py: 1.5 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#222', py: 1.5 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id} hover sx={{ cursor: 'pointer', transition: 'background 0.2s', '&:hover': { background: '#f0f4fc' } }}>
                  <TableCell>#{order.order_number}</TableCell>
                  <TableCell>
                    {format(new Date(order.created_at), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell>
                    {order.customer?.first_name || 'N/A'} {order.customer?.last_name || ''}
                  </TableCell>
                  <TableCell>
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: order.currency || 'USD'
                    }).format(Number(order.total_price) || 0)}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={order.fulfillment_status || 'Unfulfilled'}
                      color={getStatusColor(order.fulfillment_status) as any}
                      size="small"
                      sx={{ fontWeight: 700, borderRadius: 2 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      size="small"
                      disabled={order.fulfillment_status === 'fulfilled'}
                      onClick={() => {
                        setSelectedOrder(order);
                        setIsDialogOpen(true);
                      }}
                      sx={{ borderRadius: 2, fontWeight: 700, textTransform: 'none', color: '#582000', borderColor: '#582000', '&:hover': { bgcolor: '#f5ede7', borderColor: '#3d1400', color: '#3d1400' } }}
                    >
                      Fulfill
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </TableContainer>

      {/* Fulfillment Dialog */}
      <Dialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle>
          Fulfill Order #{selectedOrder?.order_number}
        </DialogTitle>
        <DialogContent>
          <Box mt={2} display="flex" flexDirection="column" gap={3}>
            <FormControl fullWidth>
              <InputLabel>Shipping Company</InputLabel>
              <Select
                value={trackingCompany}
                onChange={(e) => setTrackingCompany(e.target.value)}
                label="Shipping Company"
              >
                {shippingCompanies.map((company) => (
                  <MenuItem key={company} value={company}>
                    {company}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Tracking Number"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'space-between', px: 3, pb: 2 }}>
          <Button
            onClick={() => setIsDialogOpen(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleFulfillOrder}
            color="primary"
            variant="contained"
            disabled={isLoading || !trackingCompany || !trackingNumber}
            startIcon={isLoading ? <CircularProgress size={20} /> : null}
            sx={{ bgcolor: '#582000', color: '#fff', fontWeight: 700, borderRadius: 3, '&:hover': { bgcolor: '#3d1400' } }}
          >
            {isLoading ? 'Fulfilling...' : 'Fulfill Order'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Orders;
