import { Router } from 'express';
import {
  createItem,
  getItems,
  getItemById,
  updateItem,
  deleteItem,
} from '../controllers/itemController';
import { protect, admin } from '../middleware/authMiddleware';

const router = Router();

router.route('/').post(protect, createItem).get(protect, getItems);
router
  .route('/:id')
  .get(protect, getItemById)
  .put(protect, updateItem)
  .delete(protect, admin, deleteItem);

export default router;
