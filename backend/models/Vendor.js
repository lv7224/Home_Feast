import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';    

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));

const Vendor = mongoose.model('Vendor', new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  kitchenName: String,
  chefName: String,
}));

// 3. Vendor Login Route (called by your React frontend)
app.post('/api/vendor/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const vendor = await Vendor.findOne({ email });
    
    if (!vendor) {
      return res.status(400).json({ message: 'Vendor kitchen not found' });
    }

    // Direct match for simplicity (Use bcrypt.compare in production)
    if (vendor.password !== password) {
      return res.status(400).json({ message: 'Invalid password' });
    }

    res.status(200).json({ 
      message: 'Login successful', 
      vendor: { id: vendor._id, email: vendor.email, kitchenName: vendor.kitchenName } 
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// 4. Start Server
const PORT = 5000; // Ensure this matches your vite.config.js proxy target port
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});