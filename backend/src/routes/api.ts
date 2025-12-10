import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware';
import * as expenseController from '../controllers/expenseController';
import * as exploreController from '../controllers/exploreController';
import * as journeyController from '../controllers/journeyController';
import * as wishlistController from '../controllers/wishlistController';

const router = express.Router();

// --- Public Routes ---
// 探索发现
router.get('/destinations', exploreController.getDestinations);
router.get('/destinations/:id', exploreController.getDestinationById);

// Auth
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);

// --- Protected Routes (需要登录) ---

// 消费记录 (Expenses)
router.get('/expenses', authenticateToken, expenseController.getExpenses);
router.post('/expenses', authenticateToken, expenseController.createExpense);
router.put('/expenses/:id', authenticateToken, expenseController.updateExpense);
router.delete('/expenses/:id', authenticateToken, expenseController.deleteExpense);

// 我的旅程 (Journeys / Travel Footprints)
router.get('/journeys', authenticateToken, journeyController.getJourneys);
router.post('/journeys', authenticateToken, journeyController.createJourney);
router.delete('/journeys/:id', authenticateToken, journeyController.deleteJourney);

// 愿望清单 (Wishlist)
router.get('/wishlist', authenticateToken, wishlistController.getWishlist);
router.post('/wishlist', authenticateToken, wishlistController.createWishlistItem);
router.put('/wishlist/:id', authenticateToken, wishlistController.updateWishlistItem);
router.delete('/wishlist/:id', authenticateToken, wishlistController.deleteWishlistItem);

export default router;