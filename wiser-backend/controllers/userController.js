import User from '../models/User.js'; // <-- This is the line that was missing!
import generateToken from '../utils/generateToken.js';

// @desc    Register a new user
// @route   POST /api/users/register
export const registerUser = async (req, res) => {
  try {
    // 1. Extract the new fields from the frontend request
    const { name, email, password, phoneNumber, gender } = req.body;

    // 2. Check if user already exists (by email OR phone)
    const userExists = await User.findOne({ 
      $or: [{ email }, { phoneNumber }] 
    });

    if (userExists) {
      return res.status(400).json({ message: 'User with this email or phone number already exists' });
    }

    // 3. Create the user with all the new required fields
    const user = await User.create({
      name,
      email,
      password,
      phoneNumber,
      gender,
    });

    // 4. Send back the success response
    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        gender: user.gender,
        ecoScore: user.ecoScore,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
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
        phoneNumber: user.phomeNumber,
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