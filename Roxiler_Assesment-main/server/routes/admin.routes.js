import express from 'express';
import { getDashboardStats, getAllStores, createStore } from '../controllers/admin.controller.js';
import { authenticateToken, checkRole } from '../middleware/auth.js';
import {createUser,getUserDetails} from '../controllers/user.controller.js';

const router = express.Router();

router.get('/dashboard', authenticateToken, checkRole(['admin']), getDashboardStats);
router.get('/stores', authenticateToken, checkRole(['admin']), getAllStores);
router.post('/stores', authenticateToken, checkRole(['admin']), createStore);

router.post('/create-user', authenticateToken, checkRole(['admin']), createUser);
router.get('/create-user/:id', authenticateToken, checkRole(['admin']), getUserDetails);

export default router;