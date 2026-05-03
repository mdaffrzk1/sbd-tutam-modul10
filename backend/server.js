import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: 'https://ngitung-duit-frontend.vercel.app'
}));
app.use(express.json()); // Untuk memparsing JSON body

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);

// Test Route
app.get('/', (req, res) => {
  res.send('API ngitung-duit menyala');
});

// Koneksi ke MongoDB dan Jalankan Server
// const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('Berhasil terhubung ke MongoDB Atlas!');
    // app.listen(PORT, () => console.log(`Server berjalan di port ${PORT}`));
  })
  .catch((error) => console.log('Gagal terhubung ke MongoDB:', error.message));

export default app;