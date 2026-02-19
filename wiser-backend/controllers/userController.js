import User from '../models/User.js'; // <-- This is the line that was missing!
import generateToken from '../utils/generateToken.js';

// @desc    Register a new user
// @route   POST /api/users/signup
export const registerUser = async (req, res) => {
  try {
    // 1. Destructure the fields from the frontend
    const { name, email, password, aadharCardNumber } = req.body;

    // Check if email already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Check if Aadhar is already registered
    const aadharExists = await User.findOne({ aadharCardNumber });
    if (aadharExists) {
      return res.status(400).json({ message: 'Aadhar card already registered' });
    }

    // 2. Create the new user in the database
    const user = await User.create({
      name,
      email,
      password,
      aadharCardNumber,
    });

    // 3. Send the success response back to the frontend
    if (user) {
      const token = generateToken(res, user._id);
      
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        aadharCardNumber: user.aadharCardNumber,
        ecoScore: user.ecoScore,
        token: token
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    // This is what caught the error and sent "User is not defined" to your screen!
    res.status(500).json({ message: error.message });
  }
};

// @desc    Auth user & get token (Login)
// @route   POST /api/users/login
export const authUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Find the user by their email
    const user = await User.findOne({ email });

    // 2. Check if the user exists AND if the password matches our custom method
    if (user && (await user.matchPassword(password))) {
      const token = generateToken(res, user._id);
      
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        aadharCardNumber: user.aadharCardNumber,
        ecoScore: user.ecoScore,
        token: token,
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};