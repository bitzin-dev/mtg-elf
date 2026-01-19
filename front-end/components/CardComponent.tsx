import React from 'react';
import { Card, Rarity } from '../types';
import { ShoppingCart, Eye } from 'lucide-react';

interface CardComponentProps {
  card: Card;
}

const getRarityColor = (rarity: Rarity): string => {
  switch (rarity) {
    case Rarity.MYTHIC: return 'text-orange-600';
    case Rarity.RARE: return 'text-yellow-600';
    case Rarity.UNCOMMON: return 'text-gray-400';
    default: return 'text-black';
  }
};

export const CardComponent: React.FC<CardComponentProps> = ({ card }) => {
  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-gray-200 flex flex-col h-full">
      <div className="relative group">
        <img 
          src={card.imageUrl} 
          alt={card.name} 
          className="w-full h-64 object-cover object-top transition-transform duration-500 group-hover:scale-105" 
        />
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
           <button className="bg-white text-gray-900 px-4 py-2 rounded-full font-bold shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all">
             Ver Detalhes
           </button>
        </div>
      </div>
      
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-gray-900 leading-tight">{card.name}</h3>
          <span className="text-sm font-mono text-gray-500 bg-gray-100 px-1 rounded">{card.manaCost}</span>
        </div>
        
        <div className="flex justify-between items-center text-xs mb-2">
          <span className="flex items-center gap-1 text-gray-600">
             <i className={`fas fa-star ${getRarityColor(card.rarity)}`}></i>
             {card.set}
          </span>
          <span className={`font-semibold ${getRarityColor(card.rarity)}`}>
            {card.rarity}
          </span>
        </div>

        <p className="text-xs text-gray-600 italic line-clamp-3 mb-4 flex-grow">
          {card.oracleText}
        </p>

        <div className="mt-auto pt-3 border-t border-gray-100 flex justify-between items-center">
          <div className="flex flex-col">
            <span className="text-xs text-gray-500">Preço Médio</span>
            <span className="text-lg font-bold text-green-700">
              R$ {card.priceBRL.toFixed(2).replace('.', ',')}
            </span>
          </div>
          <div className="flex gap-2">
            <button className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors" title="Adicionar à Wishlist">
              <Eye size={20} />
            </button>
            <button className="p-2 text-white bg-green-600 hover:bg-green-700 rounded-full shadow transition-colors" title="Adicionar ao Carrinho">
              <ShoppingCart size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};