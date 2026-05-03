import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';

dotenv.config();

const app = express();

// Middleware CORS
app.use(cors({
  origin: 'https://ngitung-duit-frontend.vercel.app'
}));
app.use(express.json()); // Untuk memparsing JSON body

// Memastikan koneksi DB tersedia sebelum request diproses
const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000, // Menyerah setelah 5 detik jika gagal konek
    });
    console.log('Berhasil terhubung ke MongoDB Atlas!');
  } catch (error) {
    console.error('Gagal terhubung ke MongoDB:', error.message);
    throw new Error('Database connection failed');
  }
};

// Middleware untuk menjalankan koneksi DB di setiap request
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    res.status(500).json({ message: 'Database connection error' });
  }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);

// Test Route
app.get('/', (req, res) => {
  res.send('API ngitung-duit menyala');
});

export default app;