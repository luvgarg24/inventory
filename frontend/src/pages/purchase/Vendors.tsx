import React, { useState } from 'react';
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Snackbar, Alert, Fab
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

interface Vendor {
  id: number;
  name: string;
  contact: string;
  gstin: string;
  address: string;
}

const initialVendors: Vendor[] = [
  { id: 1, name: 'Acme Supplies', contact: 'Ravi Kumar', gstin: '27AAEPM1234C1Z1', address: 'Mumbai, Maharashtra' },
  { id: 2, name: 'Bright Traders', contact: 'Sunita Patel', gstin: '07AAACB1234E1Z2', address: 'Delhi' },
];

import { useEffect } from 'react';

const Vendors: React.FC = () => {
  const [vendors, setVendors] = useState<Vendor[]>(() => {
  const stored = localStorage.getItem('vendors');
  return stored ? JSON.parse(stored) : initialVendors;
});
  const [open, setOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<{open: boolean, message: string, severity: 'success'|'error'}>({open: false, message: '', severity: 'success'});
  const [form, setForm] = useState<Omit<Vendor, 'id'>>({ name: '', contact: '', gstin: '', address: '' });

  const handleOpen = () => setOpen(true);
  const handleClose = () => { setOpen(false); setForm({ name: '', contact: '', gstin: '', address: '' }); };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAdd = () => {
    if (!form.name || !form.contact || !form.gstin) {
      setSnackbar({ open: true, message: 'Please fill all required fields.', severity: 'error' });
      return;
    }
    const newVendors = [...vendors, { id: Date.now(), ...form }];
    setVendors(newVendors);
    localStorage.setItem('vendors', JSON.stringify(newVendors));
    setSnackbar({ open: true, message: 'Vendor added!', severity: 'success' });
    handleClose();
  };

  useEffect(() => {
    localStorage.setItem('vendors', JSON.stringify(vendors));
  }, [vendors]);

  return (
    <Box sx={{ width: '100%', px: { xs: 1, sm: 2, md: 3 }, py: 2 }}>
      <Box position="relative" width="100%">
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h5" fontWeight={800} color="#222">Vendors</Typography>
        </Box>
        <TableContainer component={Paper} sx={{ mt: 3, boxShadow: 1, borderRadius: 3, width: '100%' }}>
          {/* Table and empty state will go here */}
        </TableContainer>
        <Fab aria-label="add" title="Add Vendor" onClick={handleOpen} sx={{ position: 'fixed', bottom: 40, right: 40, bgcolor: '#582000', color: '#fff', boxShadow: 4, '&:hover': { bgcolor: '#3d1400' }, zIndex: 1201 }}>
          <AddIcon />
        </Fab>
      </Box>
      {vendors.length === 0 ? (
        <Typography variant="body1" color="text.secondary">No vendors yet. Add your first vendor!</Typography>
      ) : (
        <TableContainer component={Paper} sx={{ mt: 3, boxShadow: 1, borderRadius: 3, width: '100%' }}>
          <Table stickyHeader sx={{ bgcolor: '#fff' }}>
            <TableHead>
              <TableRow sx={{ background: '#f5f7fa', borderBottom: '2px solid #e0e7ef' }}>
                <TableCell sx={{ fontWeight: 800, color: '#222', py: 1.5 }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#222', py: 1.5 }}>Contact</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#222', py: 1.5 }}>GSTIN</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#222', py: 1.5 }}>Address</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {vendors.map(vendor => (
                <TableRow key={vendor.id}>
                  <TableCell>{vendor.name}</TableCell>
                  <TableCell>{vendor.contact}</TableCell>
                  <TableCell>{vendor.gstin}</TableCell>
                  <TableCell>{vendor.address}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>Add Vendor</DialogTitle>
        <DialogContent>
          <TextField margin="dense" name="name" label="Vendor Name" fullWidth required value={form.name} onChange={handleChange} />
          <TextField margin="dense" name="contact" label="Contact Person" fullWidth required value={form.contact} onChange={handleChange} />
          <TextField margin="dense" name="gstin" label="GSTIN" fullWidth required value={form.gstin} onChange={handleChange} />
          <TextField margin="dense" name="address" label="Address" fullWidth value={form.address} onChange={handleChange} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleAdd} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default Vendors;
