import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Snackbar, Alert, Autocomplete, Grid } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { getItems, Item } from '../services/itemService';
import { createTransaction, getTransactionHistory } from '../services/transactionService';

const TransactionsPage: React.FC = () => {
  const [history, setHistory] = useState([]);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [transactionData, setTransactionData] = useState({ itemId: 0, tipe: 'MASUK' as 'MASUK' | 'KELUAR', jumlah: 0, keterangan: '' });
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' } | null>(null);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const response = await getTransactionHistory();
      setHistory(response.data);
    } catch (error) {
      console.error("Failed to fetch history", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchItems = async () => {
    try {
      const response = await getItems({});
      setItems(response.data);
    } catch (error) {
      console.error("Failed to fetch items", error);
    }
  };

  useEffect(() => {
    fetchHistory();
    fetchItems();
  }, []);

  const handleOpenDialog = (tipe: 'MASUK' | 'KELUAR') => {
    setTransactionData({ itemId: 0, tipe, jumlah: 0, keterangan: '' });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!transactionData.itemId || transactionData.jumlah <= 0) {
      setSnackbar({ open: true, message: 'Please select an item and enter a valid quantity.', severity: 'error' });
      return;
    }
    try {
      await createTransaction(transactionData);
      setSnackbar({ open: true, message: `Transaction ${transactionData.tipe} successful!`, severity: 'success' });
      fetchHistory();
      setDialogOpen(false);
    } catch (error: any) {
      setSnackbar({ open: true, message: error.response?.data?.message || 'Transaction failed', severity: 'error' });
    }
  };

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 90 },
    { field: 'tanggal', headerName: 'Date', width: 200, valueGetter: (params: any) => new Date(params.value).toLocaleString() },
    { field: 'kode_barang', headerName: 'Item Code', width: 150, valueGetter: (params: any) => params.row.item.kode_barang },
    { field: 'nama_barang', headerName: 'Item Name', width: 250, valueGetter: (params: any) => params.row.item.nama_barang },
    { field: 'tipe', headerName: 'Type', width: 120 },
    { field: 'jumlah', headerName: 'Quantity', type: 'number', width: 120 },
    { field: 'username', headerName: 'User', width: 150, valueGetter: (params: any) => params.row.user.username },
  ];

  return (
    <Box sx={{ height: '85vh', width: '100%' }}>
      <Typography variant="h4" gutterBottom>Transactions</Typography>
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item><Button variant="contained" color="success" onClick={() => handleOpenDialog('MASUK')}>New Incoming Stock</Button></Grid>
        <Grid item><Button variant="contained" color="warning" onClick={() => handleOpenDialog('KELUAR')}>New Outgoing Stock</Button></Grid>
      </Grid>
      <DataGrid rows={history} columns={columns} loading={loading} initialState={{ pagination: { pageSize: 10 } }}  />
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth>
        <DialogTitle>New Transaction: {transactionData.tipe}</DialogTitle>
        <DialogContent>
          <Autocomplete
            options={items}
            getOptionLabel={(option) => `(${option.kode_barang}) ${option.nama_barang}`}
            onChange={(e, value) => setTransactionData({ ...transactionData, itemId: value?.id || 0 })}
            renderInput={(params) => <TextField {...params} label="Select Item" margin="normal" />}
          />
          <TextField label="Quantity" type="number" fullWidth margin="normal" onChange={(e) => setTransactionData({ ...transactionData, jumlah: Number(e.target.value) })} />
          <TextField label="Notes" type="text" fullWidth margin="normal" onChange={(e) => setTransactionData({ ...transactionData, keterangan: e.target.value })} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogActions>
      </Dialog>
      {snackbar && <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar(null)}><Alert severity={snackbar.severity}>{snackbar.message}</Alert></Snackbar>}
    </Box>
  );
};

export default TransactionsPage;
