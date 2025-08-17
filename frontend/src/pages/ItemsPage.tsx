import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Snackbar, Alert, IconButton } from '@mui/material';
import { DataGrid, GridColDef, GridRowParams, GridRenderCellParams } from '@mui/x-data-grid';
import { Add, Edit, Delete } from '@mui/icons-material';
import { getItems, createItem, updateItem, deleteItem, Item } from '../services/itemService';
import { useAuth } from '../context/AuthContext';

const ItemsPage: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<Partial<Item> | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' } | null>(null);
  const { userRole } = useAuth();

  const fetchItems = async () => {
    setLoading(true);
    try {
      const response = await getItems({});
      setItems(response.data);
    } catch (error) {
      console.error("Failed to fetch items", error);
      setSnackbar({ open: true, message: 'Failed to fetch items', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleOpenDialog = (item?: Item) => {
    if (item) {
      setCurrentItem({ ...item });
      setIsEditMode(true);
    } else {
      setCurrentItem({ kode_barang: '', nama_barang: '', kategori: '', lokasi: '', stok: 0 });
      setIsEditMode(false);
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setCurrentItem(null);
  };

  const handleSave = async () => {
    if (!currentItem) return;

    try {
      if (isEditMode && currentItem.id) {
        await updateItem(currentItem.id, currentItem);
        setSnackbar({ open: true, message: 'Item updated successfully!', severity: 'success' });
      } else {
        await createItem(currentItem as Omit<Item, 'id'>);
        setSnackbar({ open: true, message: 'Item created successfully!', severity: 'success' });
      }
      fetchItems();
      handleCloseDialog();
    } catch (error: any) {
      console.error("Failed to save item", error);
      setSnackbar({ open: true, message: error.response?.data?.message || 'Failed to save item', severity: 'error' });
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await deleteItem(id);
        setSnackbar({ open: true, message: 'Item deleted successfully!', severity: 'success' });
        fetchItems();
      } catch (error: any) {
        console.error("Failed to delete item", error);
        setSnackbar({ open: true, message: error.response?.data?.message || 'Failed to delete item', severity: 'error' });
      }
    }
  };

  const columns: GridColDef[] = [
    { field: 'kode_barang', headerName: 'Code', width: 150 },
    { field: 'nama_barang', headerName: 'Name', width: 250 },
    { field: 'kategori', headerName: 'Category', width: 150 },
    { field: 'lokasi', headerName: 'Location', width: 150 },
    { field: 'stok', headerName: 'Stock', type: 'number', width: 100 },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 100,
      renderCell: (params: GridRenderCellParams) => (
        <Box>
          <IconButton
            color="primary"
            onClick={() => handleOpenDialog(params.row as Item)}
          >
            <Edit />
          </IconButton>
          {userRole === 'ADMIN' && (
            <IconButton
              color="secondary"
              onClick={() => handleDelete(params.row.id as number)}
            >
              <Delete />
            </IconButton>
          )}
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ height: '85vh', width: '100%' }}>
      <Typography variant="h4" gutterBottom>Items Management</Typography>
      <Button startIcon={<Add />} variant="contained" onClick={() => handleOpenDialog()} sx={{ mb: 2 }}>
        Add Item
      </Button>
      <DataGrid
        rows={items}
        columns={columns}
        loading={loading}
        initialState={{
            pagination: {
              pageSize: 10,
            },
          }}
        
        disableSelectionOnClick
      />
      <Dialog open={dialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>{isEditMode ? 'Edit Item' : 'Add New Item'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Item Code"
            type="text"
            fullWidth
            variant="standard"
            value={currentItem?.kode_barang || ''}
            onChange={(e) => setCurrentItem({ ...currentItem, kode_barang: e.target.value })}
            disabled={isEditMode}
          />
          <TextField
            margin="dense"
            label="Item Name"
            type="text"
            fullWidth
            variant="standard"
            value={currentItem?.nama_barang || ''}
            onChange={(e) => setCurrentItem({ ...currentItem, nama_barang: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Category"
            type="text"
            fullWidth
            variant="standard"
            value={currentItem?.kategori || ''}
            onChange={(e) => setCurrentItem({ ...currentItem, kategori: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Location"
            type="text"
            fullWidth
            variant="standard"
            value={currentItem?.lokasi || ''}
            onChange={(e) => setCurrentItem({ ...currentItem, lokasi: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Stock"
            type="number"
            fullWidth
            variant="standard"
            value={currentItem?.stok || 0}
            onChange={(e) => setCurrentItem({ ...currentItem, stok: Number(e.target.value) })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogActions>
      </Dialog>
      {snackbar && (
        <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
          <Alert onClose={() => setSnackbar(null)} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      )}
    </Box>
  );
};

export default ItemsPage;