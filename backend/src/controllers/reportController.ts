import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/authMiddleware';

const prisma = new PrismaClient();
const LOW_STOCK_THRESHOLD = 5;

// @desc    Get current stock report
// @route   GET /api/reports/stock
// @access  Private/Admin
export const getStockReport = async (req: AuthRequest, res: Response) => {
  try {
    const stockReport = await prisma.item.findMany({
      orderBy: { nama_barang: 'asc' },
      select: { kode_barang: true, nama_barang: true, kategori: true, lokasi: true, stok: true },
    });
    res.status(200).json(stockReport);
  } catch (error: any) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// @desc    Get low stock report
// @route   GET /api/reports/low-stock
// @access  Private/Admin
export const getLowStockReport = async (req: AuthRequest, res: Response) => {
  try {
    const lowStockItems = await prisma.item.findMany({
      where: { stok: { lt: LOW_STOCK_THRESHOLD } },
      orderBy: { stok: 'asc' },
    });
    res.status(200).json(lowStockItems);
  } catch (error: any) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// @desc    Export current stock report as CSV
// @route   GET /api/reports/export/csv
// @access  Private/Admin
export const exportStockAsCsv = async (req: AuthRequest, res: Response) => {
  try {
    const items = await prisma.item.findMany({
      orderBy: { nama_barang: 'asc' },
    });

    const fields = ['kode_barang', 'nama_barang', 'kategori', 'lokasi', 'stok'];
    const csvHeader = fields.join(',') + '\n';
    const csvRows = items.map(item => {
      return [
        item.kode_barang,
        `"${item.nama_barang}"`,
        `"${item.kategori}"`,
        `"${item.lokasi}"`,
        item.stok
      ].join(',') + '\n';
    }).join('');

    const csv = csvHeader + csvRows;

    res.header('Content-Type', 'text/csv');
    res.attachment('stock_report.csv');
    res.status(200).send(csv);

  } catch (error: any) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};
