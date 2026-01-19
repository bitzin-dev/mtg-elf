
import React, { useEffect, useState } from 'react';
import { Card } from '../types';
import { X, ExternalLink, Scale, ScrollText, Palette, Globe, Box, Hash, Zap, Sword } from 'lucide-react';
import { getCardRulings } from '../services/scryfallService';

interface CardDetailsModalProps {
  card: Card | null;
  isOpen: boolean;
  onClose: () => void;
}

export const CardDetailsModal: React.FC<CardDetailsModalProps> = ({ card, isOpen, onClose }) => {
  
  const [rulings, setRulings] = useState<{published_at: string, comment: string}[]>([]);
  const [isLoadingRulings, setIsLoadingRulings] = useState(false);

  useEffect(() => {
    if (card && isOpen) {
      setRulings([]);
      setIsLoadingRulings(true);
      getCardRulings(card.id).then(data => {
        setRulings(data);
        setIsLoadingRulings(false);
      });
    }
  }, [card, isOpen]);

  if (!isOpen || !card) return null;

  // Renderiza Custo de Mana com Ícones SVG
  const renderManaCost = (cost: string) => {
     if (!cost) return null;
     
     // Extrai símbolos como {1}, {G}, {U/B}
     const symbols = cost.match(/\{[^}]+\}/g) || [];
     
     return (
       <div className="flex items-center gap-1">
         {symbols.map((rawSymbol, i) => {
            // Remove chaves e barras para formar o nome do arquivo (ex: {U/B} -> UB)
            const symbolCode = rawSymbol.replace(/[{}/]/g, '');
            return (
                <img 
                    key={i}
                    src={`https://svgs.scryfall.io/card-symbols/${symbolCode}.svg`}
                    alt={rawSymbol}
                    title={rawSymbol}
                    className="w-5 h-5 drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
            )
         })}
       </div>
     );
  };

  // Renderiza Texto de Regras com Símbolos Inline
  const formatOracleText = (text: string) => {
      if (!text) return <span className="italic text-gray-600">Sem texto de regras.</span>;
      
      // Divide o texto pelos símbolos de mana
      return text.split(/(\{[^}]+\})/g).map((part, i) => {
          if (part.match(/^\{[^}]+\}$/)) {
              const symbolCode = part.replace(/[{}/]/g, '');
              return (
                  <img 
                    key={i}
                    src={`https://svgs.scryfall.io/card-symbols/${symbolCode}.svg`}
                    alt={part}
                    className="inline-block w-4 h-4 mx-0.5 align-middle transform -translate-y-[1px] drop-shadow-sm select-none"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
              );
          }
          // Retorna o texto normal, preservando quebras de linha
          return <span key={i}>{part}</span>;
      });
  };

  const legalitiesList = Object.entries(card.legalities).filter(([_, status]) => status === 'legal');
  const ligaMagicUrl = `https://www.ligamagic.com.br/?view=cards/card&card=${encodeURIComponent(card.name)}`;

  // Prefer Art Crop for the "Art View" feel, fallback to full image
  const displayImage = card.artCropUrl || card.imageUrl;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>

      {/* Modal Container */}
      <div className="relative bg-[#0F0F0F] rounded-2xl w-full max-w-5xl h-[85vh] md:h-[80vh] flex flex-col md:flex-row overflow-hidden shadow-2xl border border-gray-800 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button 
           onClick={onClose}
           className="absolute top-4 right-4 z-20 bg-black/50 hover:bg-black/80 p-2 rounded-full text-white transition-colors backdrop-blur-md border border-white/10"
        >
           <X size={20} />
        </button>

        {/* Left: Card Art (Full Bleed) */}
        <div className="w-full md:w-[45%] bg-[#050505] relative shrink-0 overflow-hidden group h-[40vh] md:h-full">
           <img 
             src={displayImage} 
             alt={card.name} 
             className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
           />
           {/* Gradient Overlays for better text visibility if needed, or blending with the dark theme */}
           <div className="absolute inset-0 bg-gradient-to-t from-[#0F0F0F] via-transparent to-black/30 md:bg-gradient-to-r md:from-transparent md:via-transparent md:to-[#0F0F0F]"></div>
           
           {/* Mobile Title Overlay (Optional if design requires, keeping clean for now) */}
        </div>

        {/* Right: Details */}
        <div className="w-full md:w-[55%] flex flex-col bg-[#0F0F0F] min-h-0 relative z-10 -mt-6 md:mt-0 rounded-t-3xl md:rounded-none shadow-[0_-10px_40px_rgba(0,0,0,0.5)] md:shadow-none border-t border-gray-800 md:border-t-0 md:border-l">
           
           {/* Header */}
           <div className="p-6 border-b border-gray-800 shrink-0">
              <h2 className="text-2xl md:text-4xl font-black text-white mb-2 tracking-tight">{card.name}</h2>
              <div className="flex flex-wrap items-center gap-6 text-sm text-gray-400">
                 <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-200 text-xs uppercase tracking-wider">Custo</span>
                    {renderManaCost(card.manaCost)}
                 </div>
                 <div className="flex items-center gap-1">
                    <Zap size={14} className="text-orange-500" />
                    <span className="font-bold text-gray-200 text-xs uppercase tracking-wider">CMC</span>
                    <span className="font-mono text-white">{card.manaCost ? card.manaCost.replace(/[{}]/g, '').length : 0}</span>
                 </div>
              </div>
           </div>

           {/* Content Tabs */}
           <div className="flex-1 overflow-y-auto min-h-0 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
              <div className="p-6 space-y-8">
                 
                 {/* Main Info */}
                 <div className="grid grid-cols-2 gap-4 md:gap-8">
                    <div className="space-y-1">
                       <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                          <ScrollText size={12} /> Tipo
                       </div>
                       <div className="text-sm md:text-base text-white font-medium break-words leading-tight">{card.type}</div>
                    </div>
                    <div className="space-y-1">
                       <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                          <Sword size={12} /> P/R
                       </div>
                       <div className="text-sm md:text-lg text-white font-medium font-mono">
                          {card.power && card.toughness ? `${card.power}/${card.toughness}` : '-'}
                       </div>
                    </div>
                 </div>

                 {/* Oracle Text */}
                 <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-800 relative overflow-hidden group">
                     <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                     <h3 className="flex items-center gap-2 text-[10px] font-bold text-gray-400 mb-3 uppercase tracking-wider">
                        <ScrollText size={14} /> Texto de Regras
                     </h3>
                     <p className="text-gray-200 whitespace-pre-line leading-relaxed text-sm">
                        {formatOracleText(card.oracleText)}
                     </p>
                 </div>

                 {/* Additional Info Grid */}
                 <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="p-3 bg-gray-900/30 rounded-lg border border-gray-800">
                       <div className="flex items-center gap-2 text-pink-500 font-bold mb-1 text-[10px] uppercase">
                          <Box size={12} /> Raridade
                       </div>
                       <div className="text-gray-200 text-xs font-medium">{card.rarity}</div>
                    </div>
                    <div className="p-3 bg-gray-900/30 rounded-lg border border-gray-800">
                       <div className="flex items-center gap-2 text-blue-500 font-bold mb-1 text-[10px] uppercase">
                          <Hash size={12} /> Coleção
                       </div>
                       <div className="text-gray-200 text-xs font-medium uppercase flex items-center gap-1.5">
                           <span className="bg-black/50 px-1 rounded font-mono text-gray-400">{card.set}</span>
                           #{card.collectorNumber}
                       </div>
                    </div>
                 </div>

                 {/* Legalities */}
                 <div>
                    <h3 className="flex items-center gap-2 text-[10px] font-bold text-gray-500 mb-3 uppercase tracking-wider border-b border-gray-800 pb-2">
                        <Scale size={14} /> Formatos Legais
                    </h3>
                    <div className="flex flex-wrap gap-2">
                       {legalitiesList.length > 0 ? legalitiesList.map(([format]) => (
                          <span key={format} className="px-2.5 py-1 bg-emerald-900/20 text-emerald-400 border border-emerald-900/50 rounded-md text-[10px] font-bold uppercase tracking-wide">
                             {format}
                          </span>
                       )) : (
                          <span className="text-gray-500 italic text-xs">Não legal em nenhum formato principal.</span>
                       )}
                    </div>
                 </div>

                 {/* Rulings */}
                 {rulings.length > 0 && (
                    <div>
                        <h3 className="flex items-center gap-2 text-[10px] font-bold text-gray-500 mb-3 uppercase tracking-wider border-b border-gray-800 pb-2">
                            <Scale size={14} /> Regras (Rulings)
                        </h3>
                        <div className="space-y-4">
                            {rulings.map((rule, idx) => (
                                <div key={idx} className="flex flex-col gap-1 text-sm bg-black/20 p-3 rounded-lg border border-gray-800/50">
                                    <span className="text-[10px] font-bold text-gray-600 uppercase">{rule.published_at}</span>
                                    <p className="text-gray-300 leading-relaxed text-xs">{formatOracleText(rule.comment)}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                 )}

                 {/* Footer Info */}
                 <div className="grid grid-cols-2 gap-8 pt-8 border-t border-gray-800">
                     <div>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                           <Palette size={12} /> Artista
                        </div>
                        <div className="text-white font-medium text-sm">{card.artist}</div>
                     </div>
                     <div>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                           <Globe size={12} /> Idioma
                        </div>
                        <div className="text-white font-medium text-sm">Inglês</div>
                     </div>
                 </div>

                 <div className="flex gap-4 pt-4 pb-4">
                    <a 
                       href={`https://scryfall.com/card/${card.set.toLowerCase()}/${card.collectorNumber}`} 
                       target="_blank" 
                       rel="noopener noreferrer"
                       className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors border border-gray-700 text-sm"
                    >
                       <Globe size={16} /> Scryfall
                    </a>
                    <a 
                        href={ligaMagicUrl} 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 bg-orange-600 hover:bg-orange-500 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors shadow-[0_0_15px_rgba(234,88,12,0.3)] text-sm"
                    >
                        <ExternalLink size={16} /> LigaMagic
                    </a>
                 </div>

              </div>
           </div>

        </div>
      </div>
    </div>
  );
};
