import React, { useState, useEffect } from 'react';
import { Box, CssBaseline, ThemeProvider, createTheme, Typography } from '@mui/material';
import { Routes, Route } from 'react-router-dom';
import Login from './Login';
import DashboardNav from './DashboardNav';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Orders from './pages/Orders';
import Shipping from './pages/Shipping';
import Purchase from './pages/Purchase';
import PurchaseOrders from './pages/purchase/PurchaseOrders';
import Vendors from './pages/purchase/Vendors';
import Expenses from './pages/purchase/Expenses';
import DeliveryChallans from './pages/purchase/DeliveryChallans';
import Invoices from './pages/purchase/Invoices';
import PaymentsMade from './pages/purchase/PaymentsMade';

const theme = createTheme();

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  useEffect(() => {
    if (sessionStorage.getItem('session_token') === 'valid-session') {
      setLoggedIn(true);
    }
  }, []);
  if (!loggedIn) return <Login onLogin={() => setLoggedIn(true)} />;
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex' }}>
        <DashboardNav />
        <Box component="main" sx={{ flexGrow: 1, width: '100%', maxWidth: 'none', minHeight: '100vh', p: 0, m: 0 }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/products" element={<Products />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/shipping" element={<Shipping />} />
            <Route path="/purchase/*" element={<Purchase />}>
              <Route path="orders" element={<PurchaseOrders />} />
              <Route path="vendors" element={<Vendors />} />
              <Route path="expenses" element={<Expenses />} />
              <Route path="delivery-challans" element={<DeliveryChallans />} />
              <Route path="invoices" element={<Invoices />} />
              <Route path="payments" element={<PaymentsMade />} />
              <Route index element={<PurchaseOrders />} />
            </Route>
            <Route path="*" element={
              <Typography variant="h4" sx={{ mt: 4, ml: 2 }}>
                Page not found
              </Typography>
            } />
          </Routes>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;
