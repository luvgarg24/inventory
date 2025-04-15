import React, { useState } from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Fab, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Snackbar, Alert } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

const mockPayments = [
  { id: 1, date: '2025-04-10', vendor: 'Acme Supplies', amount: 12000, mode: 'NEFT', note: 'Advance' },
  { id: 2, date: '2025-04-12', vendor: 'Bright Traders', amount: 8000, mode: 'UPI', note: 'Balance' },
];

const vendors = ['Acme Supplies', 'Bright Traders', 'Sharma Traders'];

type AlertColor = 'success' | 'info' | 'warning' | 'error';

const PaymentsMade: React.FC = () => {
  const [payments, setPayments] = useState(mockPayments);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ vendor: '', amount: '', mode: '', date: '', note: '' });
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: AlertColor }>({ open: false, message: '', severity: 'success' });

  const handleOpen = () => setOpen(true);
  const handleClose = () => { setOpen(false); setForm({ vendor: '', amount: '', mode: '', date: '', note: '' }); };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleAdd = () => {
    if (!form.vendor || !form.amount || !form.mode || !form.date) {
      setSnackbar({ open: true, message: 'Fill all fields', severity: 'error' });
      return;
    }
    setPayments([
      ...payments,
      { id: Date.now(), vendor: form.vendor, amount: Number(form.amount), mode: form.mode, date: form.date, note: form.note },
    ]);
    setSnackbar({ open: true, message: 'Payment added!', severity: 'success' });
    handleClose();
  };

  return (
    <Box sx={{ width: '100%', minHeight: 'calc(100vh - 80px)', py: 2, px: { xs: 0.5, sm: 2, md: 4 }, bgcolor: '#f8fafb' }}>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="h5" fontWeight={800} color="#222">Payments Made</Typography>
        <Fab aria-label="add" title="Add Payment" onClick={handleOpen} sx={{ position: 'fixed', bottom: 40, right: 40, bgcolor: '#582000', color: '#fff', boxShadow: 4, '&:hover': { bgcolor: '#3d1400' }, zIndex: 1201 }}>
          <AddIcon />
        </Fab>
      </Box>
      <TableContainer component={Paper} sx={{ mt: 2, mb: 4, boxShadow: 1, borderRadius: 3, width: '100%', px: 0 }}>
        <Table stickyHeader sx={{ minWidth: 800, bgcolor: '#fff' }}>
          <TableHead>
            <TableRow sx={{ background: '#f5f7fa', borderBottom: '2px solid #e0e7ef' }}>
              <TableCell sx={{ fontWeight: 800, color: '#222', py: 1.5 }}>Date</TableCell>
              <TableCell sx={{ fontWeight: 800, color: '#222', py: 1.5 }}>Vendor</TableCell>
              <TableCell align="right" sx={{ fontWeight: 800, color: '#222', py: 1.5 }}>Amount (₹)</TableCell>
              <TableCell sx={{ fontWeight: 800, color: '#222', py: 1.5 }}>Mode</TableCell>
              <TableCell sx={{ fontWeight: 800, color: '#222', py: 1.5 }}>Note</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {payments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ color: '#888', py: 6 }}>
                  <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" py={4}>
                    <AddIcon sx={{ fontSize: 48, color: '#f5ede7', mb: 2 }} />
                    <Typography variant="h6" color="#6b7280" mb={2}>No payments yet</Typography>
                    <Typography color="#6b7280" mb={2}>Add your first payment to see it here.</Typography>
                    <Button variant="contained" sx={{ bgcolor: '#582000', color: '#fff', fontWeight: 700, borderRadius: 3, boxShadow: 1, textTransform: 'none', '&:hover': { bgcolor: '#3d1400' } }} onClick={handleOpen}>Add Payment</Button>
                  </Box>
                </TableCell>
              </TableRow>
            ) : payments.map(row => (
              <TableRow key={row.id} hover sx={{ transition: 'background 0.2s', '&:hover': { background: '#f5ede7' } }}>
                <TableCell>{row.date}</TableCell>
                <TableCell>{row.vendor}</TableCell>
                <TableCell align="right">{row.amount.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</TableCell>
                <TableCell>{row.mode}</TableCell>
                <TableCell>{row.note}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3, p: 2 } }}>
        <DialogTitle sx={{ fontWeight: 700, pb: 0 }}>Add Payment</DialogTitle>
        <DialogContent>
          <Box mt={2} display="flex" flexDirection="column" gap={2}>
            <TextField select label="Vendor" name="vendor" value={form.vendor} onChange={handleChange} fullWidth required>
              {vendors.map(v => <option key={v} value={v}>{v}</option>)}
            </TextField>
            <TextField label="Amount" name="amount" type="number" value={form.amount} onChange={handleChange} fullWidth required />
            <TextField label="Date" name="date" type="date" value={form.date} onChange={handleChange} fullWidth required InputLabelProps={{ shrink: true }} />
            <TextField label="Mode" name="mode" value={form.mode} onChange={handleChange} fullWidth required />
            <TextField label="Note" name="note" value={form.note} onChange={handleChange} fullWidth />
          </Box>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'space-between', px: 3, pb: 2 }}>
          <Button onClick={handleClose}>Cancel</Button>
          <Button variant="contained" sx={{ bgcolor: '#582000', color: '#fff', fontWeight: 700, borderRadius: 2, '&:hover': { bgcolor: '#3d1400' } }} onClick={handleAdd}>Save Payment</Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default PaymentsMade;
