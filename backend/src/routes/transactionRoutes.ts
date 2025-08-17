import { Router } from 'express';
import { createTransaction, getTransactionHistory } from '../controllers/transactionController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.post('/', protect, createTransaction);
router.get('/history', protect, getTransactionHistory);

export default router;
