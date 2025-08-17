import api from './api';

export const createTransaction = (data: { itemId: number; tipe: 'MASUK' | 'KELUAR'; jumlah: number; keterangan?: string }) => 
  api.post('/transactions', data);

export const getTransactionHistory = () => api.get('/transactions/history');
