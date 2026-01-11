
import React from 'react';
import { User, UserRole } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  user: User | null;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, user, onLogout }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-violet-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.location.hash = '#'}>
            <div className="w-10 h-10 bg-violet-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-md">
              V
            </div>
            <div>
              <h1 className="text-lg font-bold text-violet-900 leading-none">Página Violeta</h1>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">San Pedro de los Milagros</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-semibold text-gray-700">{user.name}</p>
                  <p className="text-[10px] text-violet-600 font-bold uppercase">{user.role}</p>
                </div>
                <button 
                  onClick={onLogout}
                  className="px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-100"
                >
                  Salir
                </button>
              </div>
            ) : (
              <button 
                onClick={() => window.location.hash = '#login'}
                className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-sm transition-all"
              >
                Acceso Institucional
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-8 max-w-7xl">
        {children}
      </main>

      <footer className="bg-white border-t border-violet-100 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm text-gray-500">© 2026 Municipio de San Pedro de los Milagros - Equidad de Género</p>
          <div className="mt-4 flex justify-center gap-6 text-xs text-violet-400 font-medium">
            <a href="#" className="hover:text-violet-600 transition-colors">Protección de Datos</a>
            <a href="#" className="hover:text-violet-600 transition-colors">Rutas de Atención</a>
            <a href="#" className="hover:text-violet-600 transition-colors">Contacto</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
