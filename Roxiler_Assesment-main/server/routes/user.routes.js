import express from 'express';
import { getCurrentUser, getAllUsers,updateUser,deleteUser } from '../controllers/user.controller.js';
import { authenticateToken, checkRole } from '../middleware/auth.js';

const router = express.Router();

router.get('/me', authenticateToken, getCurrentUser);
router.get('/', authenticateToken, checkRole(['admin']), getAllUsers);
router.put('/:id', authenticateToken, checkRole(['admin']), updateUser);
router.delete('/:id', authenticateToken, checkRole(['admin']), deleteUser);


export default router;