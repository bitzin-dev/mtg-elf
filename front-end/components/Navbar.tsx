
import React, { useState } from 'react';
import { Menu, Search, User, ShoppingCart, X, TreeDeciduous } from 'lucide-react';

interface NavbarProps {
  onAuth?: (mode: 'login' | 'register') => void;
  isAppMode?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onAuth, isAppMode = false }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Layout for the inner App (Dashboard)
  if (isAppMode) {
    return (
      <nav className="bg-portal-card border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center cursor-pointer" onClick={() => window.location.reload()}>
                <span className="text-xl font-bold text-white flex items-center gap-2">
                  Portal MTG <TreeDeciduous className="text-emerald-500" size={20} />
                </span>
              </div>
              <div className="hidden md:ml-6 md:flex md:space-x-8">
                <a href="#" className="text-white bg-gray-800 px-3 py-2 rounded-md text-sm font-medium">Dashboard</a>
                <a href="#" className="text-gray-300 hover:text-white hover:bg-gray-800 px-3 py-2 rounded-md text-sm font-medium transition-colors">Coleção</a>
                <a href="#" className="text-gray-300 hover:text-white hover:bg-gray-800 px-3 py-2 rounded-md text-sm font-medium transition-colors">Decks</a>
              </div>
            </div>
            <div className="hidden md:flex flex-1 items-center justify-center px-8">
              <div className="w-full max-w-md relative">
                <input
                  type="text"
                  className="w-full bg-gray-900 text-gray-200 border border-gray-700 rounded-lg py-1.5 pl-4 pr-10 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-sm placeholder-gray-500"
                  placeholder="Buscar cartas..."
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <Search size={16} className="text-gray-500" />
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="text-gray-400 hover:text-white relative">
                <ShoppingCart size={20} />
              </button>
              <button className="text-gray-400 hover:text-white">
                <User size={20} />
              </button>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  // Layout for Landing Page
  return (
    <nav className="bg-transparent py-4 relative z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center cursor-pointer">
            <span className="text-lg font-bold text-white flex items-center gap-2">
              Portal MTG <TreeDeciduous className="text-emerald-500" size={18} />
            </span>
          </div>

          {/* Right Links */}
          <div className="hidden md:flex items-center space-x-8">
            <button 
              onClick={() => onAuth && onAuth('login')} 
              className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
            >
              Entrar
            </button>
            <button 
              onClick={() => onAuth && onAuth('register')} 
              className="text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-500 px-4 py-2 rounded-full transition-all shadow-lg shadow-emerald-900/20"
            >
              Criar Conta
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-300 hover:text-white focus:outline-none"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-[#020604] border-b border-gray-800 p-4 shadow-xl flex flex-col gap-2">
           <button 
             onClick={() => { setIsMenuOpen(false); onAuth && onAuth('login'); }} 
             className="w-full text-left py-3 px-4 text-gray-300 hover:text-white hover:bg-gray-900 rounded-lg"
           >
             Entrar
           </button>
           <button 
             onClick={() => { setIsMenuOpen(false); onAuth && onAuth('register'); }} 
             className="w-full text-left py-3 px-4 text-emerald-500 font-bold hover:bg-emerald-900/20 rounded-lg"
           >
             Criar Conta
           </button>
        </div>
      )}
    </nav>
  );
};
