import express from 'express';
import Transaction from '../models/Transaction.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Semua rute transaksi menggunakan middleware "protect" 
// harus login pakai token jwt
router.use(protect);

// CREATE: Tambah Transaksi
router.post('/', async (req, res) => {
  try {
    const { title, amount, type, date } = req.body;
    const transaction = await Transaction.create({
      userId: req.user, // didapat dari middleware auth
      title,
      amount,
      type,
      date: date ? new Date(date) : Date.now()
    });
    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// READ: Ambil semua transaksi milik user yg sedang login
router.get('/', async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user }).sort({ date: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// UPDATE: Edit Transaksi
router.put('/:id', async (req, res) => {
  try {
    const { title, amount, type, date } = req.body;
    
    // Cari transaksi berdasarkan ID
    const transaction = await Transaction.findById(req.params.id);
    
    if (!transaction) {
      return res.status(404).json({ message: 'Transaksi tidak ditemukan' });
    }

    // Pastikan transaksi ini milik user yg login
    if (transaction.userId.toString() !== req.user) {
      return res.status(401).json({ message: 'User tidak diizinkan' });
    }

    // Update data
    transaction.title = title || transaction.title;
    transaction.amount = amount || transaction.amount;
    transaction.type = type || transaction.type;
    transaction.date = date ? new Date(date) : transaction.date;

    const updatedTransaction = await transaction.save();
    res.json(updatedTransaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE: Hapus Transaksi
router.delete('/:id', async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    
    if (!transaction) {
      return res.status(404).json({ message: 'Transaksi tidak ditemukan' });
    }

    // Pastikan transaksi ini milik user yg login
    if (transaction.userId.toString() !== req.user) {
      return res.status(401).json({ message: 'User tidak diizinkan' });
    }

    await transaction.deleteOne();
    res.json({ id: req.params.id, message: 'Transaksi berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
