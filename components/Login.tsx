
import React, { useState } from 'react';
import { storage } from '../services/storage';
import { User } from '../types';

interface LoginProps {
  onLoginSuccess: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const users = storage.getUsers();
  const [username, setUsername] = useState(users[0]?.username || '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = users.find(u => u.username === username);
    
    if (user && user.password === password) {
      onLoginSuccess(user);
    } else {
      setError('Credenciales incorrectas o usuario no autorizado.');
    }
  };

  return (
    <div className="max-w-md mx-auto py-12">
      <div className="bg-white rounded-3xl shadow-2xl p-10 border border-violet-100 animate-in slide-in-from-bottom-8">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-violet-700 rounded-2xl flex items-center justify-center text-white text-3xl font-black mx-auto mb-4 shadow-xl">V</div>
          <h2 className="text-2xl font-bold text-gray-800">Panel Administrativo</h2>
          <p className="text-gray-500 mt-2 text-sm uppercase font-black tracking-widest">Página Violeta (2026)</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <div className="p-4 bg-red-50 text-red-700 text-[10px] font-black rounded-xl border border-red-100 text-center uppercase tracking-wide">
              {error}
            </div>
          )}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Entidad Institucional</label>
            <div className="relative">
              <select 
                required
                className="w-full px-4 py-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-violet-600 transition-all font-bold text-violet-900 appearance-none"
                value={username}
                onChange={e => setUsername(e.target.value)}
              >
                {users.map(u => (
                  <option key={u.username} value={u.username}>{u.username}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                <svg className="w-4 h-4 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">PIN Secreto (6 dígitos)</label>
            <input 
              required
              type="password"
              placeholder="••••••"
              maxLength={6}
              className="w-full px-4 py-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-violet-600 transition-all font-mono text-center text-2xl tracking-[0.5em]"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>
          <button 
            type="submit"
            className="w-full bg-violet-700 hover:bg-violet-800 text-white font-black py-4 rounded-xl shadow-lg transition-all transform active:scale-95 text-xs uppercase tracking-widest"
          >
            Validar Identidad
          </button>
        </form>
        
        <p className="text-center text-[10px] text-gray-400 mt-8 leading-relaxed font-bold">
          Acceso exclusivo para funcionarios del<br/>
          Municipio de San Pedro de los Milagros.
        </p>
      </div>
    </div>
  );
};

export default Login;
