
import React from 'react';
import { AdvancedFilters } from '../types';

interface AdvancedFilterBarProps {
  filters: AdvancedFilters;
  onFilterChange: (key: keyof AdvancedFilters, value: string) => void;
  onClear: () => void;
}

export const AdvancedFilterBar: React.FC<AdvancedFilterBarProps> = ({ filters, onFilterChange, onClear }) => {
  return (
    <div className="px-8 pb-6 animate-in slide-in-from-top-2 duration-200 fade-in">
      <div className="bg-[#050a07] border border-gray-800/60 rounded-xl p-5 shadow-inner">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          
          {/* Raridade */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Raridade</label>
            <select 
              value={filters.rarity}
              onChange={(e) => onFilterChange('rarity', e.target.value)}
              className="w-full bg-black/40 border border-gray-700 rounded-lg text-sm px-3 py-2 text-gray-300 focus:border-portal-accent focus:outline-none transition-colors appearance-none cursor-pointer"
            >
              <option value="">Todas</option>
              <option value="common">Comum</option>
              <option value="uncommon">Incomum</option>
              <option value="rare">Rara</option>
              <option value="mythic">Mítica</option>
            </select>
          </div>

          {/* Cor */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Cor</label>
            <select 
              value={filters.color}
              onChange={(e) => onFilterChange('color', e.target.value)}
              className="w-full bg-black/40 border border-gray-700 rounded-lg text-sm px-3 py-2 text-gray-300 focus:border-portal-accent focus:outline-none transition-colors appearance-none cursor-pointer"
            >
              <option value="">Todas</option>
              <option value="W">Branco</option>
              <option value="U">Azul</option>
              <option value="B">Preto</option>
              <option value="R">Vermelho</option>
              <option value="G">Verde</option>
              <option value="C">Incolor</option>
              <option value="M">Multicolorida</option>
            </select>
          </div>

          {/* Custo de Mana */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Custo de Mana (CMC)</label>
            <select 
              value={filters.cmc}
              onChange={(e) => onFilterChange('cmc', e.target.value)}
              className="w-full bg-black/40 border border-gray-700 rounded-lg text-sm px-3 py-2 text-gray-300 focus:border-portal-accent focus:outline-none transition-colors appearance-none cursor-pointer"
            >
              <option value="">Todos</option>
              <option value="0">0</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
              <option value="6">6</option>
              <option value="7+">7+</option>
            </select>
          </div>

          {/* Poder */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Poder</label>
            <input 
              type="number" 
              placeholder="Ex: 2"
              value={filters.power}
              onChange={(e) => onFilterChange('power', e.target.value)}
              className="w-full bg-black/40 border border-gray-700 rounded-lg text-sm px-3 py-2 text-gray-300 placeholder-gray-600 focus:border-portal-accent focus:outline-none transition-colors"
            />
          </div>

          {/* Resistência */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Resistência</label>
            <input 
              type="number" 
              placeholder="Ex: 2" 
              value={filters.toughness}
              onChange={(e) => onFilterChange('toughness', e.target.value)}
              className="w-full bg-black/40 border border-gray-700 rounded-lg text-sm px-3 py-2 text-gray-300 placeholder-gray-600 focus:border-portal-accent focus:outline-none transition-colors"
            />
          </div>

        </div>
      </div>
    </div>
  );
};
