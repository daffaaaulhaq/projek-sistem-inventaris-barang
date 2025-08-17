import { Response } from 'express';
import { PrismaClient, TransactionType } from '@prisma/client';
import { AuthRequest } from '../middleware/authMiddleware';

const prisma = new PrismaClient();

// @desc    Create a new transaction (in/out)
// @route   POST /api/transactions
// @access  Private
export const createTransaction = async (req: AuthRequest, res: Response) => {
  const { itemId, tipe, jumlah, keterangan } = req.body;
  const userId = req.user?.userId;

  if (!userId || !itemId || !tipe || !jumlah) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  if (tipe !== 'MASUK' && tipe !== 'KELUAR') {
    return res.status(400).json({ message: "Invalid transaction type. Must be 'MASUK' or 'KELUAR'." });
  }

  if (Number(jumlah) <= 0) {
    return res.status(400).json({ message: 'Quantity must be a positive number' });
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const item = await tx.item.findUnique({ where: { id: Number(itemId) } });

      if (!item) {
        throw new Error('Item not found');
      }

      let newStok;
      if (tipe === 'MASUK') {
        newStok = item.stok + Number(jumlah);
      } else { // KELUAR
        if (item.stok < Number(jumlah)) {
          throw new Error('Insufficient stock');
        }
        newStok = item.stok - Number(jumlah);
      }

      // Update item stock
      await tx.item.update({
        where: { id: Number(itemId) },
        data: { stok: newStok },
      });

      // Create transaction record
      const transaction = await tx.transaction.create({
        data: {
          itemId: Number(itemId),
          userId,
          tipe: tipe as TransactionType,
          jumlah: Number(jumlah),
          keterangan,
        },
      });

      return transaction;
    });

    res.status(201).json({ message: 'Transaction successful', data: result });

  } catch (error: any) {
    // Prisma transaction automatically rolls back on error
    res.status(400).json({ message: error.message || 'Transaction failed' });
  }
};

// @desc    Get transaction history
// @route   GET /api/transactions/history
// @access  Private
export const getTransactionHistory = async (req: AuthRequest, res: Response) => {
  try {
    const history = await prisma.transaction.findMany({
      orderBy: { tanggal: 'desc' },
      include: {
        item: { select: { nama_barang: true, kode_barang: true } },
        user: { select: { username: true } },
      },
    });
    res.status(200).json(history);
  } catch (error: any) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};
