import React, { useEffect, useState } from 'react';
import { Alert, CircularProgress, Snackbar } from '@mui/material';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  IconButton,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';

interface Variant {
  id: number;
  title: string;
  inventory_quantity: number;
  inventory_item_id: number;
}

interface Product {
  id: number;
  title: string;
  variants: Variant[];
}

export default function Products() {
  console.log('Products component rendering');
  const [products, setProducts] = useState<Product[]>([]);
  const [editingVariant, setEditingVariant] = useState<Variant | null>(null);
  const [newQuantity, setNewQuantity] = useState<number>(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:4000'}/api/products`);
      const data = await response.json();
      if (data.success) {
        setProducts(data.products);
      } else {
        setError('Failed to fetch products');
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
      setError('Failed to fetch products. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditInventory = (variant: Variant) => {
    setEditingVariant(variant);
    setNewQuantity(variant.inventory_quantity);
    setIsDialogOpen(true);
  };

  const handleUpdateInventory = async () => {
    if (!editingVariant) return;

    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `http://localhost:4000/api/products/variants/${editingVariant.id}/inventory`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ quantity: newQuantity }),
        }
      );

      const data = await response.json();
      if (data.success) {
        setSuccessMessage('Inventory updated successfully');
        fetchProducts();
        setIsDialogOpen(false);
      } else {
        setError('Failed to update inventory');
      }
    } catch (error) {
      console.error('Failed to update inventory:', error);
      setError('Failed to update inventory. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ width: '100%', minHeight: 'calc(100vh - 80px)', py: 2, px: { xs: 0.5, sm: 2, md: 4 }, bgcolor: '#f8fafb' }}>
      <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between" mb={2} gap={2}>
        <Box>
          <Typography variant="h4" fontWeight={800} color="#222">Products</Typography>
          <Typography variant="subtitle1" color="#6b7280">Track and update your Shopify inventory</Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: { xs: 'center', sm: 'flex-end' }, alignItems: 'center', width: { xs: '100%', sm: 'auto' }, mt: { xs: 2, sm: 0 } }}>
          <TextField
            placeholder="Search products..."
            size="small"
            sx={{ bgcolor: '#fff', borderRadius: 2, minWidth: 220, boxShadow: 0, input: { fontSize: 15 } }}
            disabled
          />
          <Button
            variant="contained"
            sx={{
              bgcolor: '#582000',
              color: '#fff',
              fontWeight: 700,
              borderRadius: 3,
              boxShadow: 1,
              textTransform: 'none',
              '&:hover': { bgcolor: '#3d1400' },
              minWidth: 140,
              ml: 2
            }}
            startIcon={<CircularProgress size={20} color="inherit" sx={{ display: isLoading ? 'inline-flex' : 'none' }} />} 
            onClick={fetchProducts}
            disabled={isLoading}
          >
            Refresh
          </Button>
          <Button
            variant="outlined"
            sx={{
              borderColor: '#582000',
              color: '#582000',
              fontWeight: 700,
              borderRadius: 3,
              minWidth: 140,
              textTransform: 'none',
              '&:hover': { borderColor: '#3d1400', color: '#3d1400', bgcolor: '#f5ede7' },
            }}
            disabled={isLoading}
          >
            Add Product
          </Button>
        </Box>
      </Box>

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

      {/* Success Snackbar */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={3000}
        onClose={() => setSuccessMessage(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={() => setSuccessMessage(null)} severity="success">
          {successMessage}
        </Alert>
      </Snackbar>

      <Box sx={{ width: '100%', overflowX: 'auto' }}>
        <TableContainer component={Paper} sx={{ mt: 3, boxShadow: 1, borderRadius: 3, minWidth: 360 }}>
          {isLoading ? (
            <Box display="flex" justifyContent="center" p={6}>
              <CircularProgress />
            </Box>
          ) : products.length === 0 ? (
            <Box textAlign="center" p={6}>
              <Typography variant="h6" color="#6b7280" mb={2}>
                No products found
              </Typography>
              <Button variant="outlined" onClick={fetchProducts} sx={{ borderColor: '#582000', color: '#582000', fontWeight: 700 }}>
                Refresh
              </Button>
            </Box>
          ) : (
            <Table stickyHeader sx={{ minWidth: 900, bgcolor: '#fff' }}>
              <TableHead>
                <TableRow sx={{ background: '#f5f7fa', borderBottom: '2px solid #e0e7ef' }}>
                  <TableCell sx={{ fontWeight: 800, color: '#222', py: 1.5 }}>Product</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#222', py: 1.5 }}>Variant</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 800, color: '#222', py: 1.5 }}>Inventory</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 800, color: '#222', py: 1.5 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {products.map((product) =>
                  product.variants.map((variant) => (
                    <TableRow key={variant.id} hover sx={{ transition: 'background 0.2s', '&:hover': { background: '#f5ede7' } }}>
                      <TableCell>{product.title}</TableCell>
                      <TableCell>{variant.title}</TableCell>
                      <TableCell align="right">{variant.inventory_quantity}</TableCell>
                      <TableCell align="center">
                        <IconButton
                          sx={{ borderRadius: 2, color: '#582000', '&:hover': { bgcolor: '#f5ede7' } }}
                          onClick={() => handleEditInventory(variant)}
                          title="Edit Inventory"
                        >
                          <EditIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </TableContainer>
      </Box>
    {/* Modern Dialog for Inventory Update */}
    <Dialog 
        open={isDialogOpen} 
        onClose={() => setIsDialogOpen(false)}
        maxWidth="xs"
        fullWidth={true}
        PaperProps={{ sx: { borderRadius: 3, p: 2 } }}
      >
        <DialogTitle sx={{ fontWeight: 700, pb: 0 }}>
          Update Inventory
        </DialogTitle>
        <DialogContent>
          <Box mt={2}>
            <Typography variant="subtitle2" color="#582000" mb={1}>
              {editingVariant?.title}
            </Typography>
            <TextField
              label="New Quantity"
              type="number"
              value={newQuantity}
              onChange={(e) => setNewQuantity(Number(e.target.value))}
              fullWidth
              autoFocus
              InputProps={{
                startAdornment: (
                  <Typography color="#582000" sx={{ mr: 1 }}>
                    Qty:
                  </Typography>
                ),
              }}
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
            onClick={handleUpdateInventory} 
            sx={{ bgcolor: '#582000', color: '#fff', fontWeight: 700, borderRadius: 2, '&:hover': { bgcolor: '#3d1400' } }}
            variant="contained"
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={20} /> : null}
          >
            {isLoading ? 'Updating...' : 'Update Inventory'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
