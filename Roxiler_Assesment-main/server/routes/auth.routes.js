import express from 'express';
import { login, register, updatePassword } from '../controllers/auth.controller.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/login', login);
router.post('/register', register);
router.put('/password', authenticateToken, updatePassword);

export default router;