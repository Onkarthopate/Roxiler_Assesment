import express from 'express';
import { submitRating } from '../controllers/rating.controller.js';
import { authenticateToken, checkRole } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authenticateToken, checkRole(['user']), submitRating);

export default router;