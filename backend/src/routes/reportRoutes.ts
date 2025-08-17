import { Router } from 'express';
import { getStockReport, getLowStockReport, exportStockAsCsv } from '../controllers/reportController';
import { protect, admin } from '../middleware/authMiddleware';

const router = Router();

// All routes in this file are protected and for admins only
router.use(protect, admin);

router.get('/stock', getStockReport);
router.get('/low-stock', getLowStockReport);
router.get('/export/csv', exportStockAsCsv);

export default router;
