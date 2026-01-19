import React from 'react';
import { CardColor, Rarity } from '../types';

export const FilterSidebar: React.FC = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Filtros</h3>
      
      {/* Colors */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wider">Cores</h4>
        <div className="space-y-2">
          {Object.values(CardColor).map((color) => (
            <label key={color} className="flex items-center space-x-2 cursor-pointer group">
              <input type="checkbox" className="rounded text-indigo-600 focus:ring-indigo-500 border-gray-300" />
              <span className="text-gray-700 group-hover:text-indigo-600 transition-colors">{color}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Rarity */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wider">Raridade</h4>
        <div className="space-y-2">
          {Object.values(Rarity).map((rarity) => (
            <label key={rarity} className="flex items-center space-x-2 cursor-pointer group">
              <input type="checkbox" className="rounded text-indigo-600 focus:ring-indigo-500 border-gray-300" />
              <span className="text-gray-700 group-hover:text-indigo-600 transition-colors">{rarity}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wider">Preço (R$)</h4>
        <div className="flex gap-2">
          <input type="number" placeholder="Min" className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-indigo-500" />
          <input type="number" placeholder="Max" className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-indigo-500" />
        </div>
      </div>

      <button className="w-full bg-mtg-primary hover:bg-gray-800 text-white font-bold py-2 px-4 rounded transition-colors">
        Aplicar Filtros
      </button>
    </div>
  );
};