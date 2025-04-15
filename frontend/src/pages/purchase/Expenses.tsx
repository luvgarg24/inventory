import React, { useState } from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Fab, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

const mockExpenses: any[] = [];

const Expenses: React.FC = () => {
  const [expenses, setExpenses] = useState(mockExpenses);
  const handleOpen = () => {};

  return (
    <Box sx={{ width: '100%', minHeight: 'calc(100vh - 80px)', py: 2, px: { xs: 0.5, sm: 2, md: 4 }, bgcolor: '#f8fafb' }}>
      <Box position="relative" width="100%">
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h5" fontWeight={800} color="#222">Expenses</Typography>
          <Fab aria-label="add" title="Add Expense" onClick={handleOpen} sx={{ bgcolor: '#582000', color: '#fff', boxShadow: 4, '&:hover': { bgcolor: '#3d1400' }, zIndex: 1201 }}>
            <AddIcon />
          </Fab>
        </Box>
        <TableContainer component={Paper} sx={{ mt: 2, mb: 4, boxShadow: 1, borderRadius: 3, width: '100%', px: 0 }}>
          <Table stickyHeader sx={{ minWidth: 700, bgcolor: '#fff' }}>
            <TableHead>
              <TableRow sx={{ background: '#f5f7fa', borderBottom: '2px solid #e0e7ef' }}>
                <TableCell sx={{ fontWeight: 800, color: '#222', py: 1.5 }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#222', py: 1.5 }}>Category</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#222', py: 1.5 }}>Amount (₹)</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#222', py: 1.5 }}>Note</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {expenses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ color: '#888', py: 6 }}>
                    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" py={4}>
                      <AddIcon sx={{ fontSize: 48, color: '#f5ede7', mb: 2 }} />
                      <Typography variant="h6" color="#6b7280" mb={2}>No expenses yet</Typography>
                      <Typography color="#6b7280" mb={2}>Add your first expense to see it here.</Typography>
                      <Button variant="contained" sx={{ bgcolor: '#582000', color: '#fff', fontWeight: 700, borderRadius: 3, boxShadow: 1, textTransform: 'none', '&:hover': { bgcolor: '#3d1400' } }} onClick={handleOpen}>Add Expense</Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
};

export default Expenses;
