
import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';

interface SaveSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
  defaultName?: string;
}

export const SaveSearchModal: React.FC<SaveSearchModalProps> = ({ isOpen, onClose, onSave, defaultName = '' }) => {
  const [name, setName] = useState(defaultName);

  useEffect(() => {
    if (isOpen) {
      setName(defaultName);
    }
  }, [isOpen, defaultName]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
      
      {/* Modal Content */}
      <div className="relative bg-[#020604] border border-gray-700 rounded-xl p-6 w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Save size={18} className="text-emerald-500" />
            Salvar Pesquisa
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="space-y-4">
          <p className="text-sm text-gray-400">
            Dê um nome para esta configuração de filtros para acessá-la rapidamente depois.
          </p>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Nome da Pesquisa</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-black/50 border border-gray-600 rounded-lg p-3 text-white focus:outline-none focus:border-emerald-500 transition-colors placeholder-gray-600"
              placeholder="Ex: Elfos Raros, Terrenos Azul/Preto..."
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && name && onSave(name)}
            />
          </div>
          
          <div className="flex gap-3 pt-2">
            <button 
              onClick={onClose}
              className="flex-1 py-3 rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-800 font-bold transition-colors"
            >
              Cancelar
            </button>
            <button 
              onClick={() => onSave(name)}
              disabled={!name.trim()}
              className="flex-1 py-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-bold transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)] hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2"
            >
              Salvar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
