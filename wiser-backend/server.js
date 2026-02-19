import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';
import userRoutes from './routes/userRoutes.js'; // <-- Import your new routes

dotenv.config();

const app = express();

app.use(express.json()); 
app.use(cors()); 

// -- NEW API ROUTES --
app.use('/api/users', userRoutes); // <-- Connect the routes to the URL

app.get('/', (req, res) => {
  res.send('Wiser API is running...');
});

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error.message);
  });