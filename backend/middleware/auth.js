import jwt from 'jsonwebtoken';

const protect = (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Ambil token dari header
      token = req.headers.authorization.split(' ')[1];

      // Verifikasi token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Simpan data ID user yang ada di payload token
      req.user = decoded.id;
      
      next();
    } catch (error) {
      res.status(401).json({ message: 'Tidak ada otorisasi, token gagal' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Tidak ada otorisasi, tidak ada token' });
  }
};

export { protect };
