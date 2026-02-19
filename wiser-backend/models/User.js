import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true, // Prevents duplicate accounts
    },
    password: {
      type: String,
      required: true,
    },
    aadharCardNumber: {
      type: String,
      required: true,
      unique: true, // Prevents the same Aadhar from being used twice
      minlength: 12,
      maxlength: 12,
    },
    ecoScore: {
      type: Number,
      default: 0, // Starts at 0 points
    },
    savedCO2: {
      type: Number,
      default: 0, // Starts at 0 kg of CO2 saved
    }
  },
  {
    timestamps: true, // Automatically adds 'createdAt' and 'updatedAt' dates
  }
);

// This runs automatically BEFORE a user is saved to the database
userSchema.pre('save', async function (next) {
  // If the password wasn't changed, skip this step
  if (!this.isModified('password')) {
    next();
  }
  // Encrypt (hash) the password so we never store raw passwords
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// A custom method to check if a user's login password matches the database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;