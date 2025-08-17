import api from './api';

export interface Item {
  id: number;
  kode_barang: string;
  nama_barang: string;
  kategori: string;
  lokasi: string;
  stok: number;
  foto?: string;
}

export const getItems = (params: { search?: string; category?: string }) => api.get<Item[]>('/items', { params });

export const createItem = (item: Omit<Item, 'id'>) => api.post<Item>('/items', item);

export const updateItem = (id: number, item: Partial<Omit<Item, 'id' | 'kode_barang'>>) => api.put<Item>(`/items/${id}`, item);

export const deleteItem = (id: number) => api.delete(`/items/${id}`);
