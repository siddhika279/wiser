import express from 'express';
import { createRide, searchRides, requestRide, getMyRides } from '../controllers/rideController.js'; 
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createRide);
router.get('/search', searchRides); // Guest access
router.get('/my-rides', protect, getMyRides); // <-- NEW ROUTE HERE!
router.post('/:id/request', protect, requestRide);

export default router;