import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Drawer, List, ListItem, ListItemIcon, ListItemText, Toolbar, Divider, AppBar, IconButton, Typography, useMediaQuery, Box
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ReceiptIcon from '@mui/icons-material/Receipt';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import { useTheme } from '@mui/material/styles';

const navItems = [
  { text: 'Dashboard', icon: <TrendingUpIcon />, path: '/dashboard' },
  { text: 'Inventory', icon: <Inventory2Icon />, path: '/products' },
  { text: 'Orders', icon: <ShoppingCartIcon />, path: '/orders' },
  { text: 'Purchase', icon: <ReceiptIcon />, path: '/purchase' },
  { text: 'Shipping', icon: <LocalShippingIcon />, path: '/shipping' },
];

export default function DashboardNav() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const drawerContent = (
    <Box sx={{ width: 220 }}>
      <Toolbar />
      <Divider />
      <List>
        {navItems.map(({ text, icon, path }) => (
          <ListItem
            button
            key={text}
            onClick={() => {
              navigate(path);
              if (isMobile) setMobileOpen(false);
            }}
            selected={location.pathname === path}
          >
            <ListItemIcon>{icon}</ListItemIcon>
            <ListItemText primary={text} />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <>
      {isMobile && (
        <AppBar position="fixed" sx={{ zIndex: theme.zIndex.drawer + 1 }}>
          <Toolbar>
            <IconButton color="inherit" edge="start" onClick={() => setMobileOpen(true)} sx={{ mr: 2 }}>
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap component="div">
              Inventory Dashboard
            </Typography>
          </Toolbar>
        </AppBar>
      )}
      <Box component="nav" sx={{ width: { sm: 220 }, flexShrink: { sm: 0 } }}>
        <Drawer
          variant={isMobile ? 'temporary' : 'permanent'}
          open={isMobile ? mobileOpen : true}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'block' },
            '& .MuiDrawer-paper': { width: 220, boxSizing: 'border-box' },
          }}
        >
          {drawerContent}
        </Drawer>
      </Box>
      {isMobile && <Toolbar />}
    </>
  );
}
