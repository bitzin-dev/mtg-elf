
import React, { useEffect, useState } from 'react';
import { Card } from '../types';
import { Check, Info, ShoppingCart, Printer, Loader2, Plus, Minus, MoreVertical } from 'lucide-react';
import { getLigaMagicPrice } from '../services/scryfallService';

interface DashboardCardProps {
    card: Card;
    status: 'owned' | 'missing';
    quantity?: number;
    onClick?: (card: Card) => void;
    onToggleBuyList?: (card: Card) => void;
    onTogglePrintList?: (card: Card) => void;
    onInfoClick?: (card: Card) => void;
    isInBuyList?: boolean;
    isInPrintList?: boolean;
    onPriceUpdate?: (cardId: string, newPrice: number) => void;
    onUpdateQuantity?: (card: Card, newQty: number) => void;
    viewMode?: 'list' | 'grid'; // Control layout mode (default: list for mobile, grid for desktop implied)
}

const LazyImage: React.FC<{ src: string; alt: string; className?: string }> = ({ src, alt, className }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const imgRef = React.useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            });
        }, { rootMargin: '50px' });

        if (imgRef.current) {
            observer.observe(imgRef.current);
        }

        return () => observer.disconnect();
    }, []);

    return (
        <div ref={imgRef} className="w-full h-full bg-gray-900/50 relative overflow-hidden">
            {!isLoaded && isVisible && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-full h-full bg-gray-800 animate-pulse"></div>
                </div>
            )}
            {isVisible && (
                <img
                    src={src}
                    alt={alt}
                    className={`${className} ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-500`}
                    onLoad={() => setIsLoaded(true)}
                />
            )}
        </div>
    );
};

const DashboardCardComponent: React.FC<DashboardCardProps> = ({
    card,
    status,
    quantity = 1,
    onClick,
    onToggleBuyList,
    onTogglePrintList,
    onInfoClick,
    isInBuyList,
    isInPrintList,
    onPriceUpdate,
    onUpdateQuantity,
    viewMode = 'list'
}) => {
    const isOwned = status === 'owned';
    const [isLoadingPrice, setIsLoadingPrice] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);

    // Effect to fetch LigaMagic Price
    useEffect(() => {
        let isMounted = true;

        const fetchPrice = async () => {
            setIsLoadingPrice(true);
            const realPrice = await getLigaMagicPrice(card.name, card.set || "");
            if (isMounted) {
                setIsLoadingPrice(false);
                if (realPrice > 0 && onPriceUpdate) {
                    onPriceUpdate(card.id, realPrice);
                }
            }
        };

        fetchPrice();

        return () => { isMounted = false; };
    }, [card.name, card.id, onPriceUpdate]);

    const handleQuantityChange = (e: React.MouseEvent, delta: number) => {
        e.stopPropagation();
        if (onUpdateQuantity) {
            const newQty = Math.max(1, quantity + delta);
            onUpdateQuantity(card, newQty);
        }
    };

    // Determine layout classes based on viewMode
    // viewMode 'grid' forces vertical layout (image top, text bottom) even on mobile
    // viewMode 'list' allows horizontal layout on mobile
    const isGridMode = viewMode === 'grid';

    return (
        <div
            onClick={() => onClick && onClick(card)}
            onContextMenu={(e) => {
                e.preventDefault();
                if (onInfoClick) onInfoClick(card);
            }}
            className={`relative group rounded-xl border transition-all duration-200 cursor-pointer 
        flex ${isGridMode ? 'flex-col' : 'flex-row md:flex-col'} items-center ${isGridMode ? 'items-stretch' : 'md:items-stretch'} 
        ${isGridMode ? 'h-auto' : 'h-24 md:h-auto'} overflow-hidden
        ${isOwned
                    ? 'border-emerald-900/50 bg-emerald-950/10 hover:border-emerald-500/50'
                    : 'border-gray-800 bg-gray-900/40 hover:border-gray-600 hover:bg-gray-800/50'
                }`}
        >
            {/* --- DESKTOP ACTIONS (Hidden on Mobile unless grid mode logic required customization, keeping mostly hidden for clean mobile UI) --- */}
            <div className="hidden md:block absolute top-2 left-2 z-20" onClick={(e) => e.stopPropagation()}>
                <button
                    onClick={() => onInfoClick && onInfoClick(card)}
                    className="bg-black/80 rounded p-1 text-gray-400 hover:text-white cursor-pointer border border-gray-700 hover:border-emerald-500 transition-colors block"
                >
                    <Info size={12} />
                </button>
            </div>

            <div className="hidden md:flex absolute top-8 left-2 z-20 flex-col gap-1" onClick={(e) => e.stopPropagation()}>
                <button
                    onClick={() => onToggleBuyList && onToggleBuyList(card)}
                    className={`p-1 rounded border transition-colors ${isInBuyList ? 'bg-blue-600 text-white border-blue-500' : 'bg-black/80 text-gray-500 border-gray-700 hover:text-blue-400 hover:border-blue-500'}`}
                    title="Adicionar à Lista de Compras"
                >
                    <ShoppingCart size={12} />
                </button>
                <button
                    onClick={() => onTogglePrintList && onTogglePrintList(card)}
                    className={`p-1 rounded border transition-colors ${isInPrintList ? 'bg-purple-600 text-white border-purple-500' : 'bg-black/80 text-gray-500 border-gray-700 hover:text-purple-400 hover:border-purple-500'}`}
                    title="Adicionar à Lista de Impressão"
                >
                    <Printer size={12} />
                </button>
            </div>

            {/* --- RIGHT CONTROLS (Desktop Only) --- */}
            <div className="hidden md:flex absolute top-2 right-2 z-10 flex-col gap-1 items-end">
                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${isOwned
                    ? 'bg-emerald-500 border-emerald-400 scale-100'
                    : 'bg-black/50 border-gray-500 group-hover:border-gray-300'
                    }`}>
                    {isOwned && <Check size={14} className="text-black stroke-[3]" />}
                </div>
                {isOwned && (
                    <div
                        className="flex items-center bg-black/80 border border-gray-700 rounded overflow-hidden shadow-lg mt-1"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={(e) => handleQuantityChange(e, -1)}
                            className="px-1.5 py-0.5 text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
                        >
                            <Minus size={10} />
                        </button>
                        <span className="text-[10px] font-bold text-white px-1 min-w-[16px] text-center font-mono">
                            {quantity}
                        </span>
                        <button
                            onClick={(e) => handleQuantityChange(e, 1)}
                            className="px-1.5 py-0.5 text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
                        >
                            <Plus size={10} />
                        </button>
                    </div>
                )}
            </div>

            {/* --- IMAGE --- */}
            <div className={`
          relative shrink-0 border-gray-800/50
          ${isGridMode
                    ? 'w-full aspect-[2.5/3.5] h-auto border-b'
                    : 'w-[70px] h-full border-r md:w-full md:aspect-[2.5/3.5] md:h-auto md:border-r-0 md:border-b'
                }
      `}>
                <LazyImage
                    src={card.imageUrl}
                    alt={card.name}
                    className={`w-full h-full object-cover transition-all duration-500 ${isOwned
                        ? 'grayscale-0'
                        : 'grayscale opacity-60 group-hover:opacity-90 group-hover:grayscale-[0.5]'
                        }`}
                />
                {/* Mobile Set Code Badge - Visible on Grid Mode or Desktop */}
                <div className={`absolute bottom-1 right-1 text-white drop-shadow-md text-[10px] font-bold bg-black/60 px-1 rounded backdrop-blur-sm ${isGridMode ? 'block' : 'hidden md:block'}`}>
                    {card.set.substring(0, 3).toUpperCase()}
                </div>

                {/* Mobile View Set Badge / Checkmark - Layout Dependent */}
                <div className={`absolute top-1 left-1 ${isGridMode ? 'block' : 'md:hidden'}`}>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isOwned ? 'bg-emerald-500 border-emerald-400' : 'bg-black/50 border-gray-500'}`}>
                        {isOwned && <Check size={10} className="text-black stroke-[3]" />}
                    </div>
                </div>
            </div>

            {/* --- CONTENT --- */}
            <div className="flex-1 flex flex-col justify-between p-3 md:p-1 h-full md:h-auto min-w-0">

                {/* Top Section */}
                <div className="flex justify-between items-start w-full">
                    <div className="flex flex-col min-w-0 pr-6 md:pr-0">
                        <span className={`leading-tight font-bold truncate w-full ${isOwned ? 'text-white' : 'text-gray-400'} ${isGridMode ? 'text-[10px]' : 'text-sm md:text-[10px]'}`}>
                            {card.name}
                        </span>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] font-mono text-gray-500 bg-gray-800/50 px-1 rounded uppercase">
                                {card.set}
                            </span>
                            <span className="text-[10px] font-mono text-gray-500 bg-gray-800/50 px-1 rounded">
                                #{card.collectorNumber}
                            </span>
                        </div>
                    </div>

                    {/* Mobile Actions Menu Trigger - Only in List Mode */}
                    {!isGridMode && (
                        <div className="md:hidden">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowMobileMenu(!showMobileMenu);
                                }}
                                className="text-gray-500 p-1"
                            >
                                {/* Placeholder */}
                            </button>
                        </div>
                    )}
                </div>

                {/* Bottom Section */}
                <div className="flex items-end justify-between mt-1 md:mt-0">
                    <div className="flex items-center gap-1.5">
                        <span className={`text-[9px] font-bold ${isOwned ? 'text-emerald-400' : 'text-gray-500'} ${!isGridMode && 'text-xs md:text-[9px]'}`}>
                            R$ {card.priceBRL.toFixed(2)}
                        </span>
                        {isLoadingPrice && <Loader2 size={10} className="animate-spin text-emerald-500" />}
                    </div>

                    {/* Mobile Quantity Control (List Mode Only) */}
                    {!isGridMode && (
                        <div className="flex flex-col items-end gap-1 md:hidden" onClick={(e) => e.stopPropagation()}>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => onToggleBuyList && onToggleBuyList(card)}
                                    className={`p-1.5 rounded-full ${isInBuyList ? 'text-blue-400 bg-blue-900/30' : 'text-gray-600 hover:text-gray-400'}`}
                                >
                                    <ShoppingCart size={14} />
                                </button>
                                <button
                                    onClick={() => onTogglePrintList && onTogglePrintList(card)}
                                    className={`p-1.5 rounded-full ${isInPrintList ? 'text-purple-400 bg-purple-900/30' : 'text-gray-600 hover:text-gray-400'}`}
                                >
                                    <Printer size={14} />
                                </button>
                                <button
                                    onClick={() => onInfoClick && onInfoClick(card)}
                                    className="p-1.5 rounded-full text-gray-600 hover:text-gray-400"
                                >
                                    <Info size={14} />
                                </button>
                            </div>

                            {isOwned && (
                                <div className="flex items-center bg-gray-800 rounded-lg border border-gray-700 h-7">
                                    <button onClick={(e) => handleQuantityChange(e, -1)} className="px-2 text-gray-400 hover:text-white"><Minus size={12} /></button>
                                    <span className="text-xs font-bold text-white px-1 min-w-[16px] text-center">{quantity}</span>
                                    <button onClick={(e) => handleQuantityChange(e, 1)} className="px-2 text-gray-400 hover:text-white"><Plus size={12} /></button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Grid Mode Quantity Control (Mobile Owned View) */}
                    {isGridMode && isOwned && (
                        <div className="flex items-center bg-gray-900 border border-gray-700 rounded-md h-6" onClick={(e) => e.stopPropagation()}>
                            <button onClick={(e) => handleQuantityChange(e, -1)} className="px-1.5 text-gray-400 hover:text-white"><Minus size={10} /></button>
                            <span className="text-[10px] font-bold text-white px-0.5 min-w-[12px] text-center">{quantity}</span>
                            <button onClick={(e) => handleQuantityChange(e, 1)} className="px-1.5 text-gray-400 hover:text-white"><Plus size={10} /></button>
                        </div>
                    )}

                    {/* Desktop Quantity Indicator */}
                    <div className="hidden md:flex items-center gap-1 shrink-0">
                        <div className={`text-[10px] font-mono ${isOwned ? 'text-emerald-500 font-bold' : 'text-gray-600'}`}>
                            {isOwned ? `${quantity}/1` : '0/1'}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const DashboardCard = React.memo(DashboardCardComponent);
