import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, Paper, Grid, TableContainer, Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material';
import { Download } from '@mui/icons-material';
import { getStockReport, getLowStockReport, exportStockCsv } from '../services/reportService';
import { useAuth } from '../context/AuthContext';

const ReportsPage: React.FC = () => {
  const [stock, setStock] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const { userRole } = useAuth();

  const fetchReports = async () => {
    try {
      const stockRes = await getStockReport();
      setStock(stockRes.data);
      const lowStockRes = await getLowStockReport();
      setLowStock(lowStockRes.data);
    } catch (error) {
      console.error("Failed to fetch reports", error);
    }
  };

  useEffect(() => {
    if (userRole === 'ADMIN') {
      fetchReports();
    }
  }, [userRole]);

  const handleExport = async () => {
    try {
      const response = await exportStockCsv();
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'stock_report.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Failed to export CSV", error);
    }
  };

  if (userRole !== 'ADMIN') {
    return <Typography variant="h5" color="error">Access Denied. This page is for Admins only.</Typography>;
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Reports</Typography>
      <Button variant="contained" startIcon={<Download />} onClick={handleExport} sx={{ mb: 3 }}>
        Export Stock as CSV
      </Button>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6} component="div">
          <Typography variant="h6" gutterBottom>Low Stock Items (&lt;5)</Typography>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead><TableRow><TableCell>Code</TableCell><TableCell>Name</TableCell><TableCell align="right">Stock</TableCell></TableRow></TableHead>
              <TableBody>
                {lowStock.map((item: any) => (
                  <TableRow key={item.kode_barang}><TableCell>{item.kode_barang}</TableCell><TableCell>{item.nama_barang}</TableCell><TableCell align="right">{item.stok}</TableCell></TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
        <Grid item xs={12} md={6} component="div">
          <Typography variant="h6" gutterBottom>Full Stock Report</Typography>
          <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
            <Table stickyHeader size="small">
              <TableHead><TableRow><TableCell>Code</TableCell><TableCell>Name</TableCell><TableCell>Category</TableCell><TableCell align="right">Stock</TableCell></TableRow></TableHead>
              <TableBody>
                {stock.map((item: any) => (
                  <TableRow key={item.kode_barang}><TableCell>{item.kode_barang}</TableCell><TableCell>{item.nama_barang}</TableCell><TableCell>{item.kategori}</TableCell><TableCell align="right">{item.stok}</TableCell></TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ReportsPage;
