import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Avatar
} from '@mui/material';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import WarningIcon from '@mui/icons-material/Warning';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';

interface DashboardStats {
  todaysOrders: number;
  unfulfilledOrders: number;
  totalProducts: number;
  totalInventory: number;
  lowStock: Array<{ product: string; variant: string; qty: number }>;
  salesToday: number;
  salesMonth: number;
  recentOrders: Array<{
    id: number;
    created_at: string;
    total_price: string;
    fulfillment_status: string;
  }>;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:4000';
const fetchStats = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_BASE}/api/dashboard/stats`, {
          headers: { 'Authorization': sessionStorage.getItem('session_token') || '' }
        });
        const data = await response.json();
        if (!data.success) throw new Error(data.error);
        setStats(data.stats);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch dashboard stats');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  // Prepare chart data (orders over time)
  const chartData = stats?.recentOrders.map(o => ({
    date: new Date(o.created_at).toLocaleDateString(),
    orders: 1,
    total: parseFloat(o.total_price)
  })) || [];

  return (
    <Box p={{ xs: 1, md: 4 }}>
      <Box mb={4} display="flex" flexDirection={{ xs: 'column', md: 'row' }} alignItems={{ md: 'center' }} justifyContent="space-between" gap={2}>
        <Typography variant="h4" fontWeight={700} color="primary.main">Dashboard</Typography>
        <Box display="flex" gap={2} flexDirection={{ xs: 'column', sm: 'row' }}>
          <Button variant="contained" color="primary" sx={{ width: { xs: '100%', sm: 'auto' } }}>+ Add Product</Button>
          <Button variant="outlined" color="secondary" sx={{ width: { xs: '100%', sm: 'auto' } }}>Sync Shopify</Button>
        </Box>
      </Box>
      <Grid container spacing={3}>
        {/* Stat Cards */}
        {[
          {
            label: "Today's Orders",
            value: stats?.todaysOrders ?? 0,
            icon: <ShoppingCartIcon fontSize="large" color="primary" />, route: '/orders', isCurrency: false
          },
          {
            label: 'Total Products',
            value: stats?.totalProducts ?? 0,
            icon: <Inventory2Icon fontSize="large" color="action" />, route: '/products', isCurrency: false
          },
          {
            label: 'Total Inventory',
            value: stats?.totalInventory ?? 0,
            icon: <LocalShippingIcon fontSize="large" color="success" />, route: '/products', isCurrency: false
          },
          {
            label: 'Unfulfilled Orders',
            value: stats?.unfulfilledOrders ?? 0,
            icon: <WarningIcon fontSize="large" color="warning" />, route: '/orders', isCurrency: false
          },
        ].map((card, idx) => (
          <Grid item xs={12} sm={6} md={3} key={card.label}>
            <Card
              sx={{
                background: '#fff',
                color: '#222',
                borderRadius: 3,
                minHeight: 120,
                boxShadow: 2,
                border: '1px solid #e5e7eb',
                cursor: 'pointer',
                transition: 'box-shadow 0.2s',
                '&:hover': { boxShadow: 8, background: '#f3f4f6' }
              }}
              onClick={() => card.route && navigate(card.route)}
            >
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  {card.icon}
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.7 }}>{card.label}</Typography>
                    <Typography variant="h4" fontWeight={700}>{card.isCurrency ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(card.value) : card.value}</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      {/* Chart and Sales Summary */}
      <Grid container spacing={3} mt={2}>
        <Grid item xs={12} md={7}>
          <Card sx={{ borderRadius: 3, boxShadow: 5 }}>
            <CardContent>
              <Typography variant="h6" mb={2} fontWeight={600}>Orders (Recent)</Typography>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <CartesianGrid strokeDasharray="3 3" />
                  <Tooltip />
                  <Area type="monotone" dataKey="total" stroke="#3B82F6" fillOpacity={1} fill="url(#colorTotal)" name="Total Sales" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={5}>
          <Card sx={{ borderRadius: 3, boxShadow: 5, height: '100%' }}>
            <CardContent>
              <Typography variant="h6" mb={2} fontWeight={600}>Sales Summary</Typography>
              <Typography variant="body1" fontWeight={500} mb={1}>
                <b>Today's Sales:</b> <span style={{ color: '#16a34a' }}>${stats?.salesToday.toFixed(2) ?? '0.00'}</span>
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                <b>This Month:</b> <span style={{ color: '#0ea5e9' }}>${stats?.salesMonth.toFixed(2) ?? '0.00'}</span>
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      {/* Low Stock & Recent Orders */}
      <Grid container spacing={3} mt={1}>
        <Grid item xs={12} md={5}>
          <Card sx={{ borderRadius: 3, boxShadow: 5 }}>
            <CardContent>
              <Typography variant="h6" mb={2} fontWeight={600}>Low Stock Alerts</Typography>
              {stats?.lowStock.length ? (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Product</TableCell>
                      <TableCell>Variant</TableCell>
                      <TableCell>Qty</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {stats.lowStock.map((item, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{item.product}</TableCell>
                        <TableCell>{item.variant}</TableCell>
                        <TableCell>
                          <Chip label={item.qty} color={item.qty === 0 ? 'error' : 'warning'} size="small" />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <Typography color="textSecondary">No low stock products.</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={7}>
          <Card sx={{ borderRadius: 3, boxShadow: 5 }}>
            <CardContent>
              <Typography variant="h6" mb={2} fontWeight={600}>Recent Orders</Typography>
              {stats?.recentOrders.length ? (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Order ID</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {stats.recentOrders.map((order) => (
                      <TableRow key={order.id} hover>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Avatar sx={{ bgcolor: '#3B82F6', width: 28, height: 28, fontSize: 14 }}>
                              {String(order.id).slice(-2)}
                            </Avatar>
                            <span>#{order.id}</span>
                          </Box>
                        </TableCell>
                        <TableCell>{new Date(order.created_at).toLocaleString()}</TableCell>
                        <TableCell>
                          <Chip label={`$${Number(order.total_price).toFixed(2)}`} color="info" size="small" />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <Typography color="textSecondary">No recent orders.</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
