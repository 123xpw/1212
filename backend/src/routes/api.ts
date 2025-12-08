import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware';
import * as expenseController from '../controllers/expenseController';
import * as exploreController from '../controllers/exploreController';

const router = express.Router();

// --- Public Routes ---
// 探索发现 (不需要登录即可查看，或者部分功能开放)
router.get('/destinations', exploreController.getDestinations);
router.get('/destinations/:id', exploreController.getDestinationById);

// Auth (Login/Register placeholders)
router.post('/auth/login', (req, res) => res.send('Login endpoint')); 
router.post('/auth/register', (req, res) => res.send('Register endpoint')); 

// --- Protected Routes (需要登录) ---
// 消费记录
router.get('/expenses', authenticateToken, expenseController.getExpenses);
router.post('/expenses', authenticateToken, expenseController.createExpense);
router.put('/expenses/:id', authenticateToken, expenseController.updateExpense);
router.delete('/expenses/:id', authenticateToken, expenseController.deleteExpense);

// 待实现: Journeys, Wishlist 路由...

export default router;