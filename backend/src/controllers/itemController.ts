import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/authMiddleware';

const prisma = new PrismaClient();

// @desc    Create a new item
// @route   POST /api/items
// @access  Private
export const createItem = async (req: AuthRequest, res: Response) => {
  const { kode_barang, nama_barang, kategori, lokasi, stok, foto } = req.body;

  if (!kode_barang || !nama_barang || !kategori || !lokasi || stok === undefined) {
    return res.status(400).json({ message: 'Please provide all required fields' });
  }

  try {
    const item = await prisma.item.create({
      data: { kode_barang, nama_barang, kategori, lokasi, stok: Number(stok), foto },
    });
    res.status(201).json(item);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(409).json({ message: `Item with code ${kode_barang} already exists` });
    }
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// @desc    Get all items with filtering
// @route   GET /api/items
// @access  Private
export const getItems = async (req: AuthRequest, res: Response) => {
  const { search, category } = req.query;

  try {
    const items = await prisma.item.findMany({
      where: {
        nama_barang: {
          contains: search as string,
          mode: 'insensitive',
        },
        kategori: {
          contains: category as string,
          mode: 'insensitive',
        },
      },
    });
    res.status(200).json(items);
  } catch (error: any) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// @desc    Get item by ID
// @route   GET /api/items/:id
// @access  Private
export const getItemById = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  try {
    const item = await prisma.item.findUnique({ where: { id: Number(id) } });
    if (item) {
      res.status(200).json(item);
    } else {
      res.status(404).json({ message: 'Item not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// @desc    Update an item
// @route   PUT /api/items/:id
// @access  Private
export const updateItem = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { nama_barang, kategori, lokasi, stok, foto } = req.body;

  try {
    const updatedItem = await prisma.item.update({
      where: { id: Number(id) },
      data: {
        ...(nama_barang !== undefined && { nama_barang }),
        ...(kategori !== undefined && { kategori }),
        ...(lokasi !== undefined && { lokasi }),
        ...(stok !== undefined && { stok: Number(stok) }),
        ...(foto !== undefined && { foto }),
      },
    });
    res.status(200).json(updatedItem);
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// @desc    Delete an item
// @route   DELETE /api/items/:id
// @access  Private/Admin
export const deleteItem = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.item.delete({ where: { id: Number(id) } });
    res.status(200).json({ message: 'Item deleted successfully' });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};
