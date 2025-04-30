import express from 'express';
import { getAllStores, getStoreOwnerStore, getStoreOwnerRatings } from '../controllers/store.controller.js';
import { authenticateToken, checkRole } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticateToken, getAllStores);
router.get('/owner/store', authenticateToken, checkRole(['store_owner']), getStoreOwnerStore);
router.get('/owner/ratings', authenticateToken, checkRole(['store_owner']), getStoreOwnerRatings);

export default router;