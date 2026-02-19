import express from 'express';
import { registerUser, authUser } from '../controllers/userController.js'; // <-- Import authUser

const router = express.Router();

router.post('/signup', registerUser);
router.post('/login', authUser); // <-- Add the login route

export default router;