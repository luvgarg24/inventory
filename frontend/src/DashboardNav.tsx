import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Drawer, List, ListItem, ListItemIcon, ListItemText, Toolbar, Divider } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ReceiptIcon from '@mui/icons-material/Receipt';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import SyncAltIcon from '@mui/icons-material/SyncAlt';

const menuItems = [
  { text: 'Products', path: '/products' },
  { text: 'Orders', path: '/orders' },
];

const navItems = [
  { text: 'Dashboard', icon: <TrendingUpIcon />, path: '/dashboard' },
  { text: 'Inventory', icon: <Inventory2Icon />, path: '/products' },
  { text: 'Orders', icon: <ShoppingCartIcon />, path: '/orders' },
  { text: 'Purchase', icon: <ReceiptIcon />, path: '/purchase' },
  { text: 'Shipping', icon: <LocalShippingIcon />, path: '/shipping' },
];

export default function DashboardNav() {
  console.log('DashboardNav rendering');
  const navigate = useNavigate();
  const location = useLocation();
  console.log('Current location:', location.pathname);

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 220,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: { width: 220, boxSizing: 'border-box' },
      }}
    >
      <Toolbar />
      <Divider />
      <List>
        {navItems.map(({ text, icon, path }) => (
          <ListItem
            button
            key={text}
            onClick={() => navigate(path)}
            selected={location.pathname === path}
          >
            <ListItemIcon>{icon}</ListItemIcon>
            <ListItemText primary={text} />
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
}
