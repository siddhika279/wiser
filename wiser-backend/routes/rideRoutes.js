import express from 'express';
// Add requestRide to your import!
import { createRide, searchRides, requestRide } from '../controllers/rideController.js'; 
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createRide);
router.get('/search', searchRides); // Now guests can see the rides!// Add this new route! Notice the :id parameter so we know WHICH ride to book.
router.post('/:id/request', protect, requestRide); 

export default router;