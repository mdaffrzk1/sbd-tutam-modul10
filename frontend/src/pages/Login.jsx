import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const { data } = await axios.post(`https://ngitung-duit-backend.vercel.app${endpoint}`, { username, password });
      
      // Simpan token & username ke localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('username', data.username);
      navigate('/dashboard'); // Pindah ke halaman dashboard
    } catch (err) {
      setError(err.response?.data?.message || 'Terjadi kesalahan pada server');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-second p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-sm border border-prime/20">
        
        <h2 className="text-3xl font-bold text-center text-prime mb-6">
          {isLogin ? 'Login' : 'Daftar Akun'}
        </h2>
        
        {error && <p className="text-red-500 text-sm mb-4 text-center bg-red-50 p-2 rounded">{error}</p>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Username</label>
            <input 
              type="text" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-prime focus:ring-1 focus:ring-prime" 
              //placeholder="Masukkan username"
              required 
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Password</label>
            <div className="relative">
              <input 
                type={showPassword ? 'text' : 'password'} 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-prime focus:ring-1 focus:ring-prime pr-10" 
                placeholder="********"
                required 
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)} 
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-prime"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          <button type="submit" className="w-full bg-white text-black border-2 border-green-600 hover:bg-green-700 hover:text-white font-bold py-2 rounded-lg transition duration-200 mt-2">
            {isLogin ? 'Login' : 'Bikin Akun'}
          </button>
        </form>

        <p className="mt-6 text-sm text-center text-gray-600">
          {isLogin ? 'Belum punya akun? ' : 'Sudah punya akun? '}
          <button onClick={() => setIsLogin(!isLogin)} className="text-prime hover:underline font-bold">
            {isLogin ? 'Daftar di sini' : 'Masuk di sini'}
          </button>
        </p>

      </div>
    </div>
  );
}