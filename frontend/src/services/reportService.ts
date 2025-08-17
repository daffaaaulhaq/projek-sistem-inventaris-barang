import api from './api';

export const getStockReport = () => api.get('/reports/stock');

export const getLowStockReport = () => api.get('/reports/low-stock');

export const exportStockCsv = () => api.get('/reports/export/csv', {
  responseType: 'blob', // Important for file downloads
});
