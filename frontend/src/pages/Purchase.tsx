import React from 'react';
import { Box, Tabs, Tab } from '@mui/material';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';

const purchaseTabs = [
  { label: 'Purchase Orders', path: '/purchase/orders' },
  { label: 'Vendors', path: '/purchase/vendors' },
  { label: 'Expenses', path: '/purchase/expenses' },
  { label: 'Delivery Challans', path: '/purchase/delivery-challans' },
  { label: 'Invoices', path: '/purchase/invoices' },
  { label: 'Payments Made', path: '/purchase/payments' },
];

const Purchase: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentTab = purchaseTabs.findIndex(tab => location.pathname.startsWith(tab.path));

  return (
    <Box sx={{ width: '100%', minHeight: 'calc(100vh - 80px)', bgcolor: '#f8fafb', px: { xs: 0.5, sm: 2, md: 4 }, py: 2 }}>
      <Box mb={2}>
        <Box display="flex" flexDirection="column" alignItems="flex-start" mb={1}>
          <Box display="flex" alignItems="center" gap={1}>
            <Box sx={{ width: 8, height: 32, bgcolor: '#582000', borderRadius: 2, mr: 1 }} />
            <Box>
              <span style={{ fontSize: 28, fontWeight: 800, color: '#222' }}>Purchase Management</span>
              <div style={{ fontSize: 16, color: '#6b7280', fontWeight: 400, marginTop: 2 }}>Manage all your purchase-related operations in one place</div>
            </Box>
          </Box>
        </Box>
        <Tabs
          value={currentTab === -1 ? 0 : currentTab}
          onChange={(_, idx) => navigate(purchaseTabs[idx].path)}
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            background: '#fff',
            '.MuiTabs-indicator': {
              backgroundColor: '#582000',
              height: 4,
              borderRadius: 2,
            },
            '.Mui-selected': { color: '#582000 !important', fontWeight: 700 },
            minHeight: 48
          }}
          TabIndicatorProps={{ style: { background: '#582000', height: 4, borderRadius: 2 } }}
        >
          {purchaseTabs.map(tab => (
            <Tab key={tab.path} label={tab.label} sx={{ fontWeight: 700, minWidth: 140, fontSize: 16, color: '#222', textTransform: 'none', '&.Mui-selected': { color: '#582000' } }} />
          ))}
        </Tabs>
      </Box>
      <Box sx={{ width: '100%', mt: 2 }}>
        <Outlet />
      </Box>
    </Box>
  );
};

export default Purchase;
