import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, Fab, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem, IconButton, Snackbar, Alert, Slide
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import PrintIcon from '@mui/icons-material/Print';
import CloseIcon from '@mui/icons-material/Close';

const statusColors: Record<string, 'default'|'primary'|'success'|'warning'|'error'> = {
  Draft: 'default',
  Issued: 'primary',
  Received: 'success',
  Cancelled: 'error',
};
const statusChipStyles: Record<string, any> = {
  Draft: { bgcolor: '#f5ede7', color: '#582000' },
  Issued: { bgcolor: '#582000', color: '#fff' },
  Received: { bgcolor: '#e0f2e9', color: '#388e3c' },
  Cancelled: { bgcolor: '#fbe9e7', color: '#d32f2f' },
};

interface POItem {
  product: string;
  qty: number;
  price: number;
}

interface PO {
  id: number;
  number: string;
  vendor: string;
  date: string;
  status: keyof typeof statusColors;
  total: number;
  items: POItem[];
}

const mockPOs: PO[] = [
  {
    id: 1,
    number: 'PO-1001',
    vendor: 'Acme Supplies',
    date: '2025-04-10',
    status: 'Issued',
    total: 45000,
    items: [
      { product: 'Paper Rolls', qty: 100, price: 200 },
      { product: 'Ink Cartridges', qty: 10, price: 2500 },
    ],
  },
  {
    id: 2,
    number: 'PO-1002',
    vendor: 'Bright Traders',
    date: '2025-04-12',
    status: 'Draft',
    total: 18000,
    items: [
      { product: 'Packaging Boxes', qty: 50, price: 360 },
    ],
  },
];



const PurchaseOrders: React.FC = () => {
  const getVendors = () => {
    const stored = localStorage.getItem('vendors');
    if (stored) {
      try {
        return JSON.parse(stored).map((v: any) => v.name);
      } catch {
        return [];
      }
    }
    return [];
  };
  const [vendors, setVendors] = useState<string[]>(getVendors());
  const [pos, setPOs] = useState<PO[]>(mockPOs);
  const [open, setOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<{open: boolean, message: string, severity: 'success'|'error'}>({open: false, message: '', severity: 'success'});
  const [form, setForm] = useState<Partial<PO>>({ vendor: '', date: '', status: 'Draft', items: [] });
  const [item, setItem] = useState<POItem>({ product: '', qty: 1, price: 0 });
  const [printPO, setPrintPO] = useState<PO|null>(null);

  const handleOpen = () => setOpen(true);
  useEffect(() => {
    setVendors(getVendors());
  }, [open]);
  const handleClose = () => { setOpen(false); setForm({ vendor: '', date: '', status: 'Draft', items: [] }); setItem({ product: '', qty: 1, price: 0 }); };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleItemChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setItem({ ...item, [e.target.name]: e.target.value });
  };
  const handleAddItem = () => {
    if (!item.product || !item.qty || !item.price) return;
    setForm({ ...form, items: [...(form.items || []), { ...item, qty: Number(item.qty), price: Number(item.price) }] });
    setItem({ product: '', qty: 1, price: 0 });
  };
  const handleRemoveItem = (idx: number) => {
    setForm({ ...form, items: (form.items || []).filter((_, i) => i !== idx) });
  };
  const handleSavePO = () => {
    if (!form.vendor || !form.date || !(form.items && form.items.length > 0)) {
      setSnackbar({ open: true, message: 'Fill all fields and add at least one item.', severity: 'error' });
      return;
    }
    const total = form.items.reduce((sum, i) => sum + i.qty * i.price, 0);
    setPOs([
      ...pos,
      {
        id: Date.now(),
        number: `PO-${1000 + pos.length + 1}`,
        vendor: form.vendor,
        date: form.date,
        status: form.status as keyof typeof statusColors,
        total,
        items: form.items,
      },
    ]);
    setSnackbar({ open: true, message: 'PO created!', severity: 'success' });
    handleClose();
  };
  const handlePrint = (po: PO) => setPrintPO(po);
  const handleClosePrint = () => setPrintPO(null);

  return (
    <React.Fragment>
      <Box px={{ xs: 1, sm: 2, md: 4 }} py={2}>
        {/* Main content container for Purchase Orders */}
        <Box position="relative" width="100%">
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <Typography variant="h5" fontWeight={800} color="#222">Purchase Orders</Typography>
          </Box>
          <Fab aria-label="add" title="New Purchase Order" onClick={handleOpen} sx={{ position: 'fixed', bottom: 40, right: 40, bgcolor: '#582000', color: '#fff', boxShadow: 4, '&:hover': { bgcolor: '#3d1400' }, zIndex: 1201 }}>
            <AddIcon />
          </Fab>
          {/* Table or empty state, wrapped in a parent Box for valid JSX */}
          <Box>
            {pos.length === 0 ? (
              <Box py={6} textAlign="center">
                <Typography variant="body1" color="text.secondary">No purchase orders yet. Click the + to create your first PO!</Typography>
              </Box>
            ) : (
              <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 2 }}>
                <Table sx={{ minWidth: 700 }} size="medium">
                  <TableHead>
                    <TableRow sx={{ background: '#f5f7fa', borderBottom: '2px solid #e0e7ef' }}>
                      <TableCell sx={{ fontWeight: 800, color: '#222', py: 1.5 }}>PO #</TableCell>
                      <TableCell sx={{ fontWeight: 800, color: '#222', py: 1.5 }}>Vendor</TableCell>
                      <TableCell sx={{ fontWeight: 800, color: '#222', py: 1.5 }}>Date</TableCell>
                      <TableCell sx={{ fontWeight: 800, color: '#222', py: 1.5 }}>Status</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 800, color: '#222', py: 1.5 }}>Total (₹)</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 800, color: '#222', py: 1.5 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {pos.map(po => (
                      <TableRow key={po.id} hover sx={{ cursor: 'pointer', transition: 'background 0.2s', '&:hover': { background: '#f0f4fc' } }}>
                        <TableCell>{po.number}</TableCell>
                        <TableCell>{po.vendor}</TableCell>
                        <TableCell>{po.date}</TableCell>
                        <TableCell><Chip label={po.status} sx={statusChipStyles[po.status]} /></TableCell>
                        <TableCell align="right">{po.total.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</TableCell>
                        <TableCell align="center">
                          <IconButton sx={{ color: '#582000', '&:hover': { bgcolor: '#f5ede7' } }} onClick={() => handlePrint(po)}><PrintIcon /></IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        </Box>
        {/* Create PO Dialog */}
        <Dialog open={open} onClose={handleClose} fullScreen TransitionComponent={Slide}>
          <DialogTitle>
            Create Purchase Order
            <IconButton aria-label="close" onClick={handleClose} sx={{ position: 'absolute', right: 8, top: 8 }}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <Box mt={2} mb={2} display="flex" gap={2}>
              <TextField select label="Vendor" name="vendor" value={form.vendor || ''} onChange={handleFormChange} fullWidth required>
                {vendors.map(v => <MenuItem key={v} value={v}>{v}</MenuItem>)}
              </TextField>
              <TextField label="Date" name="date" type="date" value={form.date || ''} onChange={handleFormChange} fullWidth required InputLabelProps={{ shrink: true }} />
              <TextField select label="Status" name="status" value={form.status || 'Draft'} onChange={handleFormChange} fullWidth>
                {Object.keys(statusColors).map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
              </TextField>
            </Box>
            <Typography variant="subtitle1" fontWeight={600} mt={2}>Line Items</Typography>
            <Box display="flex" gap={2} alignItems="center" mt={1}>
              <TextField label="Product" name="product" value={item.product} onChange={handleItemChange} sx={{ flex: 2 }} />
              <TextField label="Qty" name="qty" type="number" value={item.qty} onChange={handleItemChange} sx={{ flex: 1 }} />
              <TextField label="Price" name="price" type="number" value={item.price} onChange={handleItemChange} sx={{ flex: 1 }} />
              <Button variant="outlined" onClick={handleAddItem}>Add</Button>
            </Box>
            <Table size="small" sx={{ mt: 2 }}>
              <TableHead><TableRow><TableCell>Product</TableCell><TableCell>Qty</TableCell><TableCell>Price</TableCell><TableCell></TableCell></TableRow></TableHead>
              <TableBody>
                {(form.items || []).map((li, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{li.product}</TableCell>
                    <TableCell>{li.qty}</TableCell>
                    <TableCell>{li.price.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</TableCell>
                    <TableCell><Button color="error" onClick={() => handleRemoveItem(idx)}>Remove</Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </DialogContent>
          <DialogActions sx={{ justifyContent: 'space-between', px: 3, pb: 2 }}>
            <Button onClick={handleClose} sx={{ bgcolor: '#fff', color: '#582000', fontWeight: 700, borderRadius: 3, border: '1px solid #582000', '&:hover': { bgcolor: '#f5ede7', color: '#3d1400', borderColor: '#3d1400' } }}>Cancel</Button>
            <Button variant="contained" onClick={handleSavePO} sx={{ bgcolor: '#582000', color: '#fff', fontWeight: 700, borderRadius: 3, boxShadow: 1, textTransform: 'none', '&:hover': { bgcolor: '#3d1400' } }}>Save PO</Button>
          </DialogActions>
        </Dialog>
        {/* Print PO Dialog */}
        <Dialog open={!!printPO} onClose={handleClosePrint} maxWidth="md" fullWidth>
          <DialogTitle>
            Print Purchase Order
            <IconButton aria-label="close" onClick={handleClosePrint} sx={{ position: 'absolute', right: 8, top: 8 }}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            {printPO && (
              <Box p={2}>
                <Typography variant="h6" fontWeight={700}>Purchase Order: {printPO.number}</Typography>
                <Typography>Vendor: {printPO.vendor}</Typography>
                <Typography>Date: {printPO.date}</Typography>
                <Typography>Status: <Chip label={printPO.status} color={statusColors[printPO.status]} /></Typography>
                <Table size="small" sx={{ mt: 2 }}>
                  <TableHead><TableRow><TableCell>Product</TableCell><TableCell>Qty</TableCell><TableCell>Price</TableCell></TableRow></TableHead>
                  <TableBody>
                    {printPO.items.map((li, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{li.product}</TableCell>
                        <TableCell>{li.qty}</TableCell>
                        <TableCell>{li.price.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <Typography align="right" mt={2} fontWeight={700}>Total: {printPO.total.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</Typography>
                <Box mt={2} textAlign="right">
                  <Button variant="outlined" startIcon={<PrintIcon />} onClick={() => window.print()} sx={{ borderColor: '#582000', color: '#582000', fontWeight: 700, '&:hover': { borderColor: '#3d1400', color: '#3d1400', bgcolor: '#f5ede7' } }}>Print</Button>
                </Box>
              </Box>
            )}
          </DialogContent>
        </Dialog>
        <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
        </Snackbar>
      </Box>
    </React.Fragment>
  );
};

export default PurchaseOrders;
