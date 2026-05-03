import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { LogOut, Pencil, Trash2, Search } from 'lucide-react';

export default function Dashboard() {
  const [transactions, setTransactions] = useState([]);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('pengeluaran');
  const [editId, setEditId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const username = localStorage.getItem('username');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }
    fetchTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchTransactions = async () => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get('http://localhost:5000/api/transactions', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTransactions(data);
    } catch (err) {
      if (err.response?.status === 401) handleLogout();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      if (editId) {
        await axios.put(`http://localhost:5000/api/transactions/${editId}`, { title, amount, type }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setEditId(null);
      } else {
        await axios.post('http://localhost:5000/api/transactions', { title, amount, type }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      // Reset Form
      setTitle('');
      setAmount('');
      fetchTransactions();
    } catch (err) {
      alert('Gagal menyimpan transaksi.');
    }
  };

  const handleEdit = (trx) => {
    setEditId(trx._id);
    setTitle(trx.title);
    setAmount(trx.amount);
    setType(trx.type);
    
    // Auto scroll ke atas (opsional utk kemudahan view)
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus data ini?')) return;
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`http://localhost:5000/api/transactions/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchTransactions();
    } catch (err) {
      alert('Gagal menghapus transaksi.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    navigate('/');
  };

  // Mekanisme Filter Pencarian Data
  const filteredTransactions = transactions.filter(trx => 
    trx.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Kalkulasi Total untuk ringkasan Pemasukan, Pengeluaran & Saldo
  const totalPemasukan = transactions
    .filter(t => t.type === 'pemasukan')
    .reduce((acc, curr) => acc + curr.amount, 0);
  const totalPengeluaran = transactions
    .filter(t => t.type === 'pengeluaran')
    .reduce((acc, curr) => acc + curr.amount, 0);
  const saldo = totalPemasukan - totalPengeluaran;

  return (
    <div className="min-h-screen bg-second text-gray-800 font-sans pb-10">
      
      {/* Topbar / Navbar */}
      <nav className="bg-white p-4 shadow-sm sticky top-0 z-50 border-b border-gray-200">
        <div className="max-w-5xl mx-auto flex justify-between items-center gap-4">
          
          {/* Sisi Kiri: Profil & Avatar */}
          <div className="flex items-center gap-3">
            <img 
              src="/default-avatar.png" 
              alt="Avatar Profile" 
              className="w-10 h-10 md:w-11 md:h-11 rounded-full object-cover bg-white p-0.5 border-2 border-gray-200 shrink-0" 
              onError={(e) => e.target.src = `https://ui-avatars.com/api/?name=${username}&background=random`} 
            />
            <div className="overflow-hidden">
              <h1 className="text-lg md:text-xl font-bold leading-tight text-gray-700 truncate max-w-[140px] sm:max-w-sm">Halo, {username}</h1>
            </div>
          </div>
          
          {/* Sisi Kanan: Logout */}
          <button 
            onClick={handleLogout} 
            className="flex items-center gap-2 bg-white text-gray-700 border border-gray-200 px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-sm md:text-base font-bold hover:bg-red-700 hover:text-white shadow-sm transition shrink-0"
          >
            <LogOut size={18} className="text-gray-600 hidden sm:block"/> Keluar
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto p-4 mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Kolom Kiri: Ringkasan & Form */}
        <div className="md:col-span-1 space-y-6">
          
          {/* Widget Ringkasan Keluar/Masuk */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-green-100">
            <h2 className="text-lg font-bold text-gray-700 mb-3 flex items-center gap-2">
                Ringkasan Keuangan
            </h2>
            <div className="flex justify-between mb-2">
              <span className="text-gray-500">Pemasukan</span>
              <span className="text-green-600 font-bold">+ Rp {totalPemasukan.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between mb-4 border-b border-gray-100 pb-3">
              <span className="text-gray-500">Pengeluaran</span>
              <span className="text-red-500 font-bold">- Rp {totalPengeluaran.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between items-center text-lg bg-gray-50 p-3 rounded-lg">
              <span className="font-bold text-gray-600 text-sm">Saldo</span>
              <span className={`font-bold text-xl ${saldo >= 0 ? 'text-prime' : 'text-red-500'}`}>
                Rp {saldo.toLocaleString('id-ID')}
              </span>
            </div>
          </div>

          {/* Form Input/Edit Transaksi */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-green-100">
            <h2 className="text-xl font-bold text-prime mb-4 border-b pb-2 text-gray-700">
              {editId ? 'Ubah Data' : 'Catat Transaksi'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-600 mb-1">Keterangan</label>
                <input 
                  type="text" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-prime outline-none transition" 
                  placeholder="Jajan, Gaji, dll."
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-600 mb-1">Total (Rp)</label>
                <input 
                  type="number" 
                  value={amount} 
                  onChange={(e) => setAmount(e.target.value)} 
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-prime outline-none transition" 
                  placeholder="50000"
                  required 
                  min="1" 
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-600 mb-1">Jenis</label>
                <select 
                  value={type} 
                  onChange={(e) => setType(e.target.value)} 
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-prime outline-none transition bg-white"
                >
                  <option value="pengeluaran">Pengeluaran (-)</option>
                  <option value="pemasukan">Pemasukan (+)</option>
                </select>
              </div>
              
              <button type="submit" className="w-full bg-white text-gray-700 border-2 border-green-600 hover:bg-green-700 hover:text-white font-bold py-2.5 rounded-lg shadow transition mt-2">
                {editId ? 'Simpan Perubahan' : 'Catat Sekarang'}
              </button>
              
              {editId && (
                <button 
                  type="button" 
                  onClick={() => { setEditId(null); setTitle(''); setAmount(''); }} 
                  className="w-full bg-white text-gray-700 border-2 border-red-600 hover:bg-red-700 hover:text-white font-bold py-2 rounded-lg transition duration-200 mt-2"
                >
                  Batal Edit
                </button>
              )}
            </form>
          </div>
        </div>

        {/* Kolom Kanan: Daftar Riwayat Transaksi (Read & Delete) */}
        <div className="md:col-span-2">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-green-100 min-h-full">
            
            {/* Header Riwayat & Filter */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <h2 className="text-xl font-bold text-gray-700">Riwayat Terakhir</h2>
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Cari keterangan..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-full text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-prime outline-none transition"
                />
              </div>
            </div>
            
            {/* List Data */}
            <div className="space-y-3">
              {filteredTransactions.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-gray-400 font-medium">Belum ada jejak transaksi ditemukan.</p>
                </div>
              ) : (
                filteredTransactions.map(trx => (
                  <div 
                    key={trx._id} 
                    className="flex justify-between items-center p-4 border border-gray-100 rounded-xl hover:border-prime/50 hover:shadow-sm transition group"
                  >
                    <div>
                      <p className="font-bold text-gray-800 text-base md:text-lg mb-0.5">{trx.title}</p>
                      <p className="text-xs md:text-sm text-gray-500 flex gap-2 items-center">
                        <span>{new Date(trx.date).toLocaleDateString('id-ID', { day:'numeric', month:'short', year:'numeric'})}</span> 
                        • 
                        <span className={`text-xs font-bold ${trx.type === 'pemasukan' ? 'text-green-600' : 'text-red-500'}`}>
                          {trx.type === 'pemasukan' ? 'Pemasukan' : 'Pengeluaran'}
                        </span>
                      </p>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3 sm:gap-4">
                      {/* Nilai Uang */}
                      <span className={`font-bold text-base md:text-lg whitespace-nowrap ${trx.type === 'pemasukan' ? 'text-green-600' : 'text-red-500'}`}>
                        {trx.type === 'pemasukan' ? '+' : '-'} Rp{trx.amount.toLocaleString('id-ID')}
                      </span>
                      
                      {/* Action Buttons (sembunyi di mobile bisa, tapi kita tampilkan ikon) */}
                      <div className="flex gap-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleEdit(trx)} 
                          className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition" 
                          title="Edit"
                        >
                          <Pencil size={18}/>
                        </button>
                        <button 
                          onClick={() => handleDelete(trx._id)} 
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition" 
                          title="Hapus"
                        >
                          <Trash2 size={18}/>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

          </div>
        </div>

      </main>
    </div>
  );
}