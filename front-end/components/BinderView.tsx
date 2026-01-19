
import React, { useState, useEffect, useMemo, useRef, forwardRef } from 'react';
import { Card } from '../types';
import { X, ChevronLeft, ChevronRight, RefreshCw, Loader2, Edit2, Image as ImageIcon, Search, Check } from 'lucide-react';
import HTMLFlipBook from 'react-pageflip';
import { getRandomCardArt } from '../services/scryfallService';

interface BinderViewProps {
  cards: Card[];
  collectionName: string;
  onClose: () => void;
  isSharedMode?: boolean;
  onCardContextMenu?: (card: Card) => void;
  coverImage?: string;
  onUpdateCover?: (url: string) => void;
}

const CARDS_PER_PAGE = 9;

// Componente de Página (Folha) encapsulado para o HTMLFlipBook
// Usa forwardRef conforme exigido pela biblioteca.
// CRUCIAL: ...rest deve ser passado para a div para receber styles e eventos do HTMLFlipBook
const BinderPage = forwardRef<HTMLDivElement, any>((props, ref) => {
    const { children, className, density, ...rest } = props;
    
    return (
        <div 
            className={`${className || ''} relative bg-[#fdfbf7] overflow-hidden h-full select-none`} 
            ref={ref} 
            data-density={density || 'soft'}
            {...rest}
        >
            {/* Efeito Plástico (Gloss/Reflexo) para simular folha de fichário */}
            {density !== 'hard' && (
                <div className="absolute inset-0 pointer-events-none z-20 bg-gradient-to-br from-white/30 via-transparent to-black/10 mix-blend-overlay"></div>
            )}
            {/* Sombra interna da lombada */}
            <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-black/20 to-transparent pointer-events-none z-10"></div>
            
            {children}
        </div>
    );
});

BinderPage.displayName = 'BinderPage';

export const BinderView: React.FC<BinderViewProps> = ({ 
    cards, 
    collectionName, 
    onClose, 
    isSharedMode = false, 
    onCardContextMenu, 
    coverImage,
    onUpdateCover 
}) => {
  const flipBook = useRef<any>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  
  // Cover Art State
  // Default leather cover fallback
  const DEFAULT_COVER = 'https://locallegends.store/cdn/shop/files/2506a60d-709c-59d0-aa2f-1a5c32c999e6.png?v=1731735100';
  const [coverArt, setCoverArt] = useState(coverImage || DEFAULT_COVER);
  const [isCoverSelectionOpen, setIsCoverSelectionOpen] = useState(false);
  const [coverSearchTerm, setCoverSearchTerm] = useState('');

  // Update local state if prop changes
  useEffect(() => {
      if (coverImage) setCoverArt(coverImage);
  }, [coverImage]);

  // Background Setup - Wrapped in try/catch to avoid SecurityError in restricted iframes/blobs
  useEffect(() => {
      if (!isSharedMode) {
          try {
              const newUrl = new URL(window.location.href);
              newUrl.searchParams.set('view', 'binder');
              newUrl.searchParams.set('collection', encodeURIComponent(collectionName));
              window.history.pushState({}, '', newUrl);
          } catch (e) {
              console.warn("Could not update URL state (likely sandboxed):", e);
          }
      }
      return () => {
          if (!isSharedMode) {
              try {
                  const newUrl = new URL(window.location.href);
                  newUrl.searchParams.delete('view');
                  newUrl.searchParams.delete('collection');
                  window.history.pushState({}, '', newUrl);
              } catch (e) {
                  // ignore
              }
          }
      }
  }, [collectionName, isSharedMode]);

  // Divide cards into groups of 9
  const cardPages = useMemo(() => {
    if (!cards) return [];
    const pgs = [];
    for (let i = 0; i < cards.length; i += CARDS_PER_PAGE) {
      pgs.push(cards.slice(i, i + CARDS_PER_PAGE));
    }
    return pgs;
  }, [cards]);

  const handleNext = () => {
    if (flipBook.current) {
        flipBook.current.pageFlip().flipNext();
    }
  };

  const handlePrev = () => {
    if (flipBook.current) {
        flipBook.current.pageFlip().flipPrev();
    }
  };

  const onFlip = (e: { data: number }) => {
      setCurrentPage(e.data);
  };

  const handleUpdateCover = (imageUrl: string) => {
      setCoverArt(imageUrl);
      if (onUpdateCover) onUpdateCover(imageUrl);
      setIsCoverSelectionOpen(false);
  };

  // Keyboard
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isCoverSelectionOpen) {
          if (e.key === 'Escape') setIsCoverSelectionOpen(false);
          return;
      }
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCoverSelectionOpen]);

  // Use useMemo to ensure the array of pages is stable and doesn't cause unnecessary re-renders
  const pages = useMemo(() => {
      const elements = [];

      // --- FRONT COVER (HARD) ---
      elements.push(
        <BinderPage key="cover-front" density="hard" className="bg-[#2a1a15]">
            <div className="relative w-full h-full overflow-hidden border-r-4 border-[#1a120b] shadow-2xl group">
                <img 
                    src={coverArt} 
                    alt="Cover" 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                
                {/* Texture (Noise) Overlay for realism */}
                <div 
                    className="absolute inset-0 opacity-20 mix-blend-multiply pointer-events-none z-10"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E")`,
                        filter: 'contrast(120%) brightness(100%)'
                    }}
                ></div>

                {/* Plastic Gloss Overlay - High Shine */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-white/5 to-black/20 mix-blend-overlay pointer-events-none z-20"></div>
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent opacity-40 mix-blend-color-dodge pointer-events-none z-20"></div>

                {/* Spine Shadow */}
                <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-black/60 to-transparent pointer-events-none z-30"></div>

                {/* Edit Cover Button - Subtle */}
                <button 
                    onClick={(e) => {
                        e.stopPropagation(); // Prevent page flip
                        e.preventDefault();
                        setIsCoverSelectionOpen(true);
                    }}
                    className="absolute top-4 right-4 z-[40] p-2 bg-black/40 hover:bg-black/70 text-white/70 hover:text-white rounded-full backdrop-blur-md border border-white/10 transition-all opacity-0 group-hover:opacity-100 hover:scale-110"
                    title="Alterar Capa"
                >
                    <Edit2 size={16} />
                </button>
            </div>
        </BinderPage>
      );

      // --- INSIDE FRONT COVER ---
      elements.push(
        <BinderPage key="cover-inside-front" density="hard" className="bg-[#e8e8e8]">
            <div className="w-full h-full flex items-center justify-center p-10 bg-[url('https://www.transparenttextures.com/patterns/black-paper.png')] opacity-100 relative">
                <div className="absolute inset-0 bg-[#333] opacity-10"></div>
                <div className="text-center font-serif text-gray-500 italic">
                    <p className="mb-4 text-2xl opacity-20">Ex Libris</p>
                    <div className="w-32 border-b border-gray-400 mx-auto"></div>
                </div>
            </div>
        </BinderPage>
      );

      // --- CARD PAGES ---
      cardPages.forEach((pageCards, idx) => {
          elements.push(
            <BinderPage key={`page-${idx}`} density="soft">
                <BinderPageContent cards={pageCards} pageNum={idx + 1} onContextMenu={onCardContextMenu} />
            </BinderPage>
          );
      });

      // --- PADDING PAGE (if odd number of content pages) ---
      if (cardPages.length % 2 !== 0) {
          elements.push(
            <BinderPage key="page-padding" density="soft">
                <div className="w-full h-full bg-transparent flex items-center justify-center opacity-10">
                    <div className="w-32 h-32 rounded-full border-4 border-dashed border-gray-400"></div>
                </div>
            </BinderPage>
          );
      }

      // --- INSIDE BACK COVER ---
      elements.push(
        <BinderPage key="cover-inside-back" density="hard" className="bg-[#e8e8e8]">
             <div className="w-full h-full bg-[#333] relative">
                <div className="absolute inset-0 opacity-50 bg-[url('https://www.transparenttextures.com/patterns/black-paper.png')]"></div>
             </div>
        </BinderPage>
      );

      // --- BACK COVER ---
      elements.push(
        <BinderPage key="cover-back" density="hard" className="bg-[#2a1a15]">
            <div className="w-full h-full border-l-4 border-[#1a120b] relative">
                <div className="absolute inset-0 opacity-40 bg-[url('https://www.transparenttextures.com/patterns/leather.png')]"></div>
                <div className="absolute bottom-8 left-0 right-0 text-center text-[#c5a059] opacity-30 text-xs font-serif tracking-widest">
                    PORTAL MTG 2026
                </div>
            </div>
        </BinderPage>
      );

      return elements;
  }, [cardPages, coverArt, onCardContextMenu]);

  // Filter cards for cover selection
  const filteredCoverCards = useMemo(() => {
      if (!coverSearchTerm) return cards;
      return cards.filter(c => c.name.toLowerCase().includes(coverSearchTerm.toLowerCase()));
  }, [cards, coverSearchTerm]);

  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-[#1a1a1a] overflow-hidden font-sans">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 z-0">
         <div 
            className="w-full h-full opacity-40 blur-md scale-105 transition-all duration-1000"
            style={{
                backgroundImage: `url('https://cards.scryfall.io/art_crop/front/8/3/83ea9b2c-5723-4eff-88ac-6669975939e3.jpg?1730489067')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
            }}
         ></div>
         <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-[#05100a]/70 to-black/90"></div>
      </div>

      {/* Header UI */}
      <div className="absolute top-0 left-0 right-0 p-6 z-50 flex justify-between items-center pointer-events-none">
        <div className="text-white drop-shadow-lg pointer-events-auto">
            <h2 className="text-2xl md:text-3xl font-serif font-bold tracking-wide text-[#f0e6d2]">{collectionName}</h2>
            <div className="h-1 w-20 bg-emerald-600 mt-2 rounded-full shadow-[0_0_10px_#059669]"></div>
        </div>
        <button 
            onClick={onClose}
            className="pointer-events-auto bg-black/40 hover:bg-white/10 text-white p-3 rounded-full backdrop-blur-md border border-white/10 transition-all hover:scale-110 active:scale-95 shadow-2xl"
        >
            <X size={24} />
        </button>
      </div>

      {/* Main Flipbook Container */}
      <div className="relative z-10 flex items-center justify-center w-full h-full p-4 lg:p-8 perspective-1000">
        
        {/* The FlipBook */}
        <HTMLFlipBook 
            width={450} 
            height={630} 
            size="stretch"
            minWidth={300}
            maxWidth={600}
            minHeight={420}
            maxHeight={800}
            maxShadowOpacity={0.5}
            showCover={true}
            mobileScrollSupport={true}
            className="shadow-2xl"
            ref={flipBook}
            onFlip={onFlip}
            onInit={(e: any) => setTotalPages(e.object.pages.length)}
            style={{}}
            startPage={0}
            drawShadow={true}
            flippingTime={1000}
            usePortrait={true}
            startZIndex={0}
            autoSize={true}
            clickEventForward={true}
            useMouseEvents={true}
            swipeDistance={30}
            showPageCorners={true}
            disableFlipByClick={true}
        >
            {/* React.Children.toArray is critical here to ensure valid React children keys and prevent null issues in react-pageflip */}
            {React.Children.toArray(pages)}
        </HTMLFlipBook>

        {/* Controls */}
        <div className="absolute bottom-6 left-0 right-0 flex justify-center items-center gap-8 z-50 pointer-events-none">
            <button 
                onClick={handlePrev}
                className="pointer-events-auto bg-black/60 hover:bg-emerald-600/80 text-white p-3 rounded-full backdrop-blur-xl border border-white/10 transition-all hover:scale-110 shadow-xl"
            >
                <ChevronLeft size={24} />
            </button>
            
            <div className="bg-black/60 backdrop-blur-xl px-4 py-1.5 rounded-full border border-white/10 text-[#f0e6d2] font-mono text-xs shadow-xl pointer-events-auto">
               Página {currentPage}
            </div>

            <button 
                onClick={handleNext}
                className="pointer-events-auto bg-black/60 hover:bg-emerald-600/80 text-white p-3 rounded-full backdrop-blur-xl border border-white/10 transition-all hover:scale-110 shadow-xl"
            >
                <ChevronRight size={24} />
            </button>
        </div>
      </div>

      {/* Cover Selection Modal */}
      {isCoverSelectionOpen && (
        <div className="absolute inset-0 z-[300] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-[#0f0f0f] border border-gray-800 rounded-2xl w-full max-w-3xl h-[80vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-[#151515]">
                    <h3 className="text-white font-bold flex items-center gap-2">
                        <ImageIcon size={18} className="text-emerald-500" /> Selecionar Capa
                    </h3>
                    <button onClick={() => setIsCoverSelectionOpen(false)} className="text-gray-400 hover:text-white">
                        <X size={20} />
                    </button>
                </div>
                
                <div className="p-4 border-b border-gray-800 bg-[#151515]">
                    <div className="relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input 
                            type="text" 
                            placeholder="Buscar carta na lista..." 
                            value={coverSearchTerm}
                            onChange={(e) => setCoverSearchTerm(e.target.value)}
                            className="w-full bg-black border border-gray-700 rounded-lg py-2 pl-9 pr-4 text-sm text-white focus:border-emerald-500 outline-none"
                            autoFocus
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                        <div 
                            onClick={() => handleUpdateCover('https://locallegends.store/cdn/shop/files/2506a60d-709c-59d0-aa2f-1a5c32c999e6.png?v=1731735100')}
                            className="aspect-[2.5/3.5] rounded-lg border-2 border-dashed border-gray-700 hover:border-emerald-500 cursor-pointer flex flex-col items-center justify-center text-gray-500 hover:text-emerald-500 transition-colors gap-2 bg-black/20"
                        >
                             <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center"><RefreshCw size={14} /></div>
                             <span className="text-[10px] font-bold">Padrão</span>
                        </div>

                        {filteredCoverCards.map(card => (
                            <div 
                                key={card.id} 
                                onClick={() => handleUpdateCover(card.artCropUrl || card.imageUrl)}
                                className="relative aspect-[2.5/3.5] group cursor-pointer"
                            >
                                <img 
                                    src={card.artCropUrl || card.imageUrl} 
                                    alt={card.name} 
                                    className="w-full h-full object-cover rounded-lg border border-gray-800 group-hover:border-emerald-500 transition-all group-hover:scale-105"
                                    loading="lazy"
                                />
                                {coverArt === (card.artCropUrl || card.imageUrl) && (
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-lg">
                                        <div className="bg-emerald-500 text-black p-1 rounded-full">
                                            <Check size={16} strokeWidth={3} />
                                        </div>
                                    </div>
                                )}
                                <div className="absolute bottom-0 left-0 right-0 bg-black/80 text-white text-[9px] p-1 truncate text-center rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                    {card.name}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                
                <div className="p-3 bg-[#151515] border-t border-gray-800 text-center text-xs text-gray-500">
                    Selecione uma imagem para ser a capa do seu fichário.
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

const BinderPageContent: React.FC<{ cards: Card[], pageNum: number, onContextMenu?: (card: Card) => void }> = ({ cards, pageNum, onContextMenu }) => {
    // Grid 3x3 Fixo
    const slots = Array.from({ length: CARDS_PER_PAGE });

    return (
        <div className="w-full h-full p-4 sm:p-6 flex flex-col relative bg-transparent">
            {/* Page Number */}
            <div className="absolute bottom-3 left-0 right-0 text-center text-gray-400 font-serif text-[10px] italic opacity-60">
                — {pageNum} —
            </div>

            <div className="flex-1 grid grid-cols-3 grid-rows-3 gap-2 sm:gap-4">
                {slots.map((_, i) => {
                    const card = cards[i];
                    return (
                        <div key={i} className="relative group">
                            {/* Pocket Outline (Plastic seam) */}
                            <div className="absolute -inset-[2px] border border-white/20 rounded-sm pointer-events-none"></div>
                            
                            {card ? (
                                <div 
                                    className="relative w-full h-full shadow-sm rounded-[2px] overflow-hidden bg-[#151515] transition-transform hover:scale-[1.02] cursor-pointer"
                                    onContextMenu={(e) => {
                                        if (onContextMenu) {
                                            e.preventDefault();
                                            e.stopPropagation(); // Stop propagation to prevent page flip
                                            onContextMenu(card);
                                        }
                                    }}
                                    onMouseDown={(e) => {
                                        // Prevent flip on right click down
                                        if (e.button === 2) e.stopPropagation();
                                    }}
                                >
                                    <img 
                                        src={card.imageUrl} 
                                        alt={card.name} 
                                        className="w-full h-full object-cover" 
                                        loading="lazy"
                                    />
                                    {/* Foil Reflection Effect on Hover */}
                                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity"></div>
                                </div>
                            ) : (
                                // Empty Slot
                                <div className="w-full h-full flex items-center justify-center bg-black/5 rounded-[2px]">
                                    <div className="w-full h-full opacity-[0.05] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-black via-transparent to-transparent"></div>
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    );
};
