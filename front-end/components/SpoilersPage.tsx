
import React, { useState, useEffect, useRef } from 'react';
import { Card, Rarity, CardColor } from '../types';
import { getSets, searchScryfall } from '../services/scryfallService';
import { Loader2, Calendar, Plus, Check, Trash2, Lock, Upload, Link, Image as ImageIcon, Eye, X, Clipboard, Move, ZoomIn, ZoomOut, Crop } from 'lucide-react';
import { DashboardCard } from './DashboardCard';

// --- IMAGE CROPPER COMPONENT ---

interface ImageCropperProps {
    imageSrc: string;
    onConfirm: (croppedImage: string) => void;
    onCancel: () => void;
}

const ImageCropper: React.FC<ImageCropperProps> = ({ imageSrc, onConfirm, onCancel }) => {
    const [zoom, setZoom] = useState(1);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const imgRef = useRef<HTMLImageElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Card Aspect Ratio: 63mm x 88mm ~= 0.716
    const ASPECT_RATIO = 2.5 / 3.5;
    const VIEWPORT_HEIGHT = 400;
    const VIEWPORT_WIDTH = VIEWPORT_HEIGHT * ASPECT_RATIO;

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        e.preventDefault();
        setOffset({
            x: e.clientX - dragStart.x,
            y: e.clientY - dragStart.y
        });
    };

    const handleMouseUp = () => setIsDragging(false);
    const handleMouseLeave = () => setIsDragging(false);

    const handleCrop = () => {
        const canvas = document.createElement('canvas');
        const img = imgRef.current;
        if (!img) return;

        // High resolution output (2x viewport)
        const scaleFactor = 2;
        canvas.width = VIEWPORT_WIDTH * scaleFactor;
        canvas.height = VIEWPORT_HEIGHT * scaleFactor;
        const ctx = canvas.getContext('2d');

        if (ctx) {
            // Fill background (black/transparent)
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Calculate drawing params
            // The image is displayed at `zoom` scale and translated by `offset` relative to the center
            // We need to map the viewport coordinate system to the canvas
            
            // Center of canvas
            const cx = canvas.width / 2;
            const cy = canvas.height / 2;

            ctx.translate(cx, cy);
            ctx.scale(zoom * scaleFactor, zoom * scaleFactor);
            ctx.translate(offset.x / zoom, offset.y / zoom); // Adjust offset for scale
            
            // Draw image centered at origin
            ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
            
            // Export
            onConfirm(canvas.toDataURL('image/jpeg', 0.9));
        }
    };

    return (
        <div className="fixed inset-0 z-[300] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-[#121212] border border-gray-700 rounded-2xl p-6 w-full max-w-lg shadow-2xl flex flex-col items-center">
                <div className="w-full flex justify-between items-center mb-6 border-b border-gray-800 pb-4">
                    <h3 className="text-white font-bold flex items-center gap-2">
                        <Crop size={20} className="text-emerald-500" /> Ajustar Imagem
                    </h3>
                    <button onClick={onCancel} className="text-gray-500 hover:text-white transition-colors"><X size={24} /></button>
                </div>

                <div className="relative overflow-hidden bg-black/50 border-2 border-dashed border-gray-700 rounded-lg cursor-move shadow-inner"
                     style={{ width: VIEWPORT_WIDTH, height: VIEWPORT_HEIGHT }}
                     onMouseDown={handleMouseDown}
                     onMouseMove={handleMouseMove}
                     onMouseUp={handleMouseUp}
                     onMouseLeave={handleMouseLeave}
                     ref={containerRef}
                >
                    {/* Grid Overlay for Guide */}
                    <div className="absolute inset-0 pointer-events-none z-10 opacity-30">
                        <div className="w-full h-1/3 border-b border-white/20 absolute top-0"></div>
                        <div className="w-full h-1/3 border-b border-white/20 absolute top-1/3"></div>
                        <div className="h-full w-1/3 border-r border-white/20 absolute left-0"></div>
                        <div className="h-full w-1/3 border-r border-white/20 absolute left-1/3"></div>
                    </div>

                    <div 
                        className="absolute top-1/2 left-1/2 w-full h-full flex items-center justify-center pointer-events-none"
                        style={{ 
                            transform: `translate(-50%, -50%) translate(${offset.x}px, ${offset.y}px) scale(${zoom})`
                        }}
                    >
                        <img 
                            ref={imgRef}
                            src={imageSrc} 
                            alt="Crop target" 
                            className="max-w-none pointer-events-none object-contain"
                            draggable={false}
                        />
                    </div>
                </div>

                <div className="w-full mt-6 space-y-4">
                    <div className="flex items-center gap-4">
                        <ZoomOut size={16} className="text-gray-500" />
                        <input 
                            type="range" 
                            min="0.2" 
                            max="3" 
                            step="0.05" 
                            value={zoom}
                            onChange={(e) => setZoom(parseFloat(e.target.value))}
                            className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                        />
                        <ZoomIn size={16} className="text-gray-500" />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 font-mono">
                        <span>Zoom: {Math.round(zoom * 100)}%</span>
                        <span className="flex items-center gap-1"><Move size={10} /> Arraste para mover</span>
                    </div>
                </div>

                <div className="flex gap-3 w-full mt-8">
                    <button onClick={onCancel} className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-bold transition-colors">Cancelar</button>
                    <button onClick={handleCrop} className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-colors shadow-lg shadow-emerald-900/20">Confirmar Recorte</button>
                </div>
            </div>
        </div>
    );
};

interface SpoilersPageProps {
    onAddCard: (card: Card) => void;
    ownedIds: string[];
    onToggleBuyList: (card: Card) => void;
    onTogglePrintList: (card: Card) => void;
    buyList: Card[];
    printList: Card[];
}

export const SpoilersPage: React.FC<SpoilersPageProps> = ({ 
    onAddCard, 
    ownedIds,
    onToggleBuyList,
    onTogglePrintList,
    buyList,
    printList
}) => {
    const ADMIN_PANEL_ENABLED = false;

    // --- Tabs State ---
    const [activeTab, setActiveTab] = useState<'official' | 'recent'>('official');

    // --- Official Sets State ---
    const [recentSets, setRecentSets] = useState<{code: string, name: string}[]>([]);
    const [selectedSet, setSelectedSet] = useState<string | null>(null);
    const [cards, setCards] = useState<Card[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // --- Admin / Recent Spoilers State ---
    const [showAdminPanel, setShowAdminPanel] = useState(false);
    const [customSpoilers, setCustomSpoilers] = useState<Card[]>(() => {
        try {
            const saved = localStorage.getItem('portal_mtg_custom_spoilers');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            return [];
        }
    });
    
    // Admin Form State
    const [adminForm, setAdminForm] = useState({
        name: '',
        set: 'SPOILER',
        imageUrl: '',
        type: 'Creature',
        rarity: 'Mythic' as string
    });

    // Cropping State
    const [croppingImage, setCroppingImage] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // --- Effects ---

    useEffect(() => {
        const loadSets = async () => {
            const sets = await getSets();
            setRecentSets(sets.slice(0, 8)); // Top 8 recent
            if (sets.length > 0) setSelectedSet(sets[0].code);
        };
        loadSets();
    }, []);

    useEffect(() => {
        const loadCards = async () => {
            if (activeTab !== 'official' || !selectedSet) return;
            setIsLoading(true);
            setCards([]);
            const result = await searchScryfall(`e:${selectedSet} (game:paper) order:rarity`);
            setCards(result);
            setIsLoading(false);
        };
        loadCards();
    }, [selectedSet, activeTab]);

    useEffect(() => {
        localStorage.setItem('portal_mtg_custom_spoilers', JSON.stringify(customSpoilers));
    }, [customSpoilers]);

    // --- Handlers ---

    const handleAdminSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!ADMIN_PANEL_ENABLED) return;
        if (!adminForm.name || !adminForm.imageUrl) return;

        const newCard: Card = {
            id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            name: adminForm.name,
            manaCost: '',
            type: adminForm.type,
            rarity: adminForm.rarity === 'Mythic' ? Rarity.MYTHIC : adminForm.rarity === 'Rare' ? Rarity.RARE : Rarity.UNCOMMON,
            set: adminForm.set.toUpperCase(),
            setName: 'Spoiler Season',
            releaseYear: new Date().getFullYear().toString(),
            priceBRL: 0,
            imageUrl: adminForm.imageUrl,
            artCropUrl: adminForm.imageUrl,
            colors: [CardColor.COLORLESS], // Simplified for spoiler
            oracleText: 'Spoiler text not available yet.',
            artist: 'Unknown',
            collectorNumber: '000',
            legalities: {}
        };

        setCustomSpoilers(prev => [newCard, ...prev]);
        setAdminForm({ name: '', set: 'SPOILER', imageUrl: '', type: 'Creature', rarity: 'Mythic' });
    };

    const handleDeleteCustom = (id: string) => {
        if (!ADMIN_PANEL_ENABLED) return;
        setCustomSpoilers(prev => prev.filter(c => c.id !== id));
    };

    // --- Image Paste & Upload Handlers ---

    const processImageFile = (file: File) => {
        if (!file.type.startsWith('image/')) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            if (e.target?.result) {
                // Open Cropper instead of setting directly
                setCroppingImage(e.target.result as string);
            }
        };
        reader.readAsDataURL(file);
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        const items = e.clipboardData.items;
        for (const item of items) {
            if (item.type.indexOf('image') !== -1) {
                const blob = item.getAsFile();
                if (blob) processImageFile(blob);
            }
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) processImageFile(file);
    };

    const handleCropConfirm = (croppedUrl: string) => {
        setAdminForm(prev => ({ ...prev, imageUrl: croppedUrl }));
        setCroppingImage(null);
    };

    return (
        <div className="h-full flex flex-col bg-portal-bg">
            
            {/* Image Cropper Modal */}
            {croppingImage && (
                <ImageCropper 
                    imageSrc={croppingImage} 
                    onConfirm={handleCropConfirm} 
                    onCancel={() => setCroppingImage(null)} 
                />
            )}

            <div className="p-6 border-b border-gray-800 bg-[#0a1410] shrink-0">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                            <Calendar className="text-pink-500" /> Spoilers & Novas Edições
                        </h2>
                        <p className="text-gray-500 text-sm mt-1">Acompanhe as últimas revelações do multiverso.</p>
                    </div>
                    
                    {/* Tab Switcher */}
                    <div className="flex bg-black/40 p-1 rounded-lg border border-gray-700">
                        <button 
                            onClick={() => setActiveTab('official')}
                            className={`px-4 py-2 text-xs font-bold rounded-md transition-all ${activeTab === 'official' ? 'bg-gray-800 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            Sets Oficiais
                        </button>
                        <button 
                            onClick={() => setActiveTab('recent')}
                            className={`px-4 py-2 text-xs font-bold rounded-md transition-all flex items-center gap-2 ${activeTab === 'recent' ? 'bg-pink-900/30 text-pink-400 shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            <ImageIcon size={14} /> Mais Recentes
                        </button>
                    </div>
                </div>
                
                {/* Official Sets Filters */}
                {activeTab === 'official' && (
                    <div className="flex gap-2 overflow-x-auto mt-4 pb-2 scrollbar-thin scrollbar-thumb-gray-800 animate-in fade-in slide-in-from-top-2">
                        {recentSets.map(set => (
                            <button
                                key={set.code}
                                onClick={() => setSelectedSet(set.code)}
                                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                                    selectedSet === set.code 
                                    ? 'bg-pink-600 text-white border-pink-500' 
                                    : 'bg-gray-900 text-gray-400 border-gray-700 hover:border-gray-500'
                                }`}
                            >
                                {set.name}
                            </button>
                        ))}
                    </div>
                )}

                                {/* Admin Toggle for Recent Tab */}
                {activeTab === 'recent' && (
                    <div className="mt-4 flex justify-end animate-in fade-in slide-in-from-top-2">
                        {ADMIN_PANEL_ENABLED ? (
                            <button 
                                onClick={() => setShowAdminPanel(!showAdminPanel)}
                                className={`text-xs flex items-center gap-2 px-3 py-1.5 rounded border transition-colors ${showAdminPanel ? 'bg-emerald-900/20 text-emerald-400 border-emerald-500/50' : 'bg-transparent text-gray-500 border-gray-700 hover:text-white'}`}
                            >
                                <Lock size={12} /> Area do Administrador
                            </button>
                        ) : (
                            <div className="text-xs flex items-center gap-2 px-3 py-1.5 rounded border border-gray-700 bg-gray-900/40 text-gray-500 cursor-not-allowed">
                                <Lock size={12} /> Area do Administrador temporariamente desativada
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-gray-800">
                
                {/* ADMIN PANEL */}
                {activeTab === 'recent' && ADMIN_PANEL_ENABLED && showAdminPanel && (
                    <div className="mb-8 bg-[#121212] border border-gray-700 rounded-xl p-6 shadow-2xl animate-in slide-in-from-top-4">
                        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                            <Upload size={18} className="text-emerald-500" /> Adicionar Novo Spoiler
                        </h3>
                        <form onSubmit={handleAdminSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            
                            {/* Card Name */}
                            <div className="col-span-1 md:col-span-2">
                                <label className="block text-[10px] text-gray-500 font-bold uppercase mb-1">Nome da Carta</label>
                                <input 
                                    type="text" 
                                    value={adminForm.name}
                                    onChange={e => setAdminForm({...adminForm, name: e.target.value})}
                                    className="w-full bg-black/50 border border-gray-700 rounded px-3 py-2 text-white focus:border-emerald-500 outline-none text-sm"
                                    placeholder="Ex: Novo Planeswalker"
                                    required
                                />
                            </div>

                            {/* Image Input Area */}
                            <div className="col-span-1 md:col-span-2 row-span-3">
                                <label className="block text-[10px] text-gray-500 font-bold uppercase mb-1">Imagem da Carta</label>
                                
                                {/* Paste / Drop Zone */}
                                <div 
                                    onPaste={handlePaste}
                                    className="relative w-full h-full min-h-[160px] bg-black/30 border-2 border-dashed border-gray-700 rounded-xl flex flex-col items-center justify-center text-center overflow-hidden hover:border-emerald-500/50 transition-colors group"
                                >
                                    {adminForm.imageUrl ? (
                                        <>
                                            <img src={adminForm.imageUrl} alt="Preview" className="h-full w-full object-contain p-2" />
                                            
                                            {/* Reset Image Button */}
                                            <button 
                                                type="button"
                                                onClick={() => setAdminForm(prev => ({...prev, imageUrl: ''}))}
                                                className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-full hover:bg-red-500 transition-colors"
                                                title="Remover Imagem"
                                            >
                                                <X size={14} />
                                            </button>

                                            {/* Edit/Crop Button Overlay */}
                                            <button
                                                type="button"
                                                onClick={() => setCroppingImage(adminForm.imageUrl)}
                                                className="absolute bottom-2 right-2 p-2 bg-emerald-600 text-white rounded-full hover:bg-emerald-500 transition-colors shadow-lg opacity-0 group-hover:opacity-100"
                                                title="Ajustar / Cortar"
                                            >
                                                <Crop size={16} />
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <input 
                                                type="file" 
                                                ref={fileInputRef}
                                                className="hidden" 
                                                accept="image/*"
                                                onChange={handleFileUpload}
                                            />
                                            <div className="flex flex-col items-center gap-2 p-4 text-gray-500 pointer-events-none">
                                                <div className="flex gap-2">
                                                    <div className="p-3 bg-gray-800 rounded-full text-emerald-600">
                                                        <Upload size={20} />
                                                    </div>
                                                    <div className="p-3 bg-gray-800 rounded-full text-blue-400">
                                                        <Clipboard size={20} />
                                                    </div>
                                                </div>
                                                <div className="text-xs font-medium">
                                                    Cole a imagem (Ctrl+V)<br/>
                                                    ou clique para fazer upload
                                                </div>
                                            </div>
                                            
                                            {/* Click Trigger */}
                                            <div 
                                                className="absolute inset-0 cursor-pointer" 
                                                onClick={() => fileInputRef.current?.click()}
                                            ></div>
                                            
                                            {/* URL Fallback */}
                                            <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                                <input 
                                                    type="url"
                                                    value={adminForm.imageUrl}
                                                    onChange={e => setAdminForm(prev => ({...prev, imageUrl: e.target.value}))}
                                                    placeholder="Ou cole a URL direta..."
                                                    className="w-full bg-transparent text-xs text-white placeholder-gray-400 outline-none text-center"
                                                    onKeyDown={(e) => e.stopPropagation()}
                                                />
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Type */}
                            <div>
                                <label className="block text-[10px] text-gray-500 font-bold uppercase mb-1">Tipo</label>
                                <select 
                                    value={adminForm.type}
                                    onChange={e => setAdminForm({...adminForm, type: e.target.value})}
                                    className="w-full bg-black/50 border border-gray-700 rounded px-3 py-2 text-white focus:border-emerald-500 outline-none text-sm"
                                >
                                    <option>Creature</option>
                                    <option>Instant</option>
                                    <option>Sorcery</option>
                                    <option>Enchantment</option>
                                    <option>Artifact</option>
                                    <option>Planeswalker</option>
                                    <option>Land</option>
                                </select>
                            </div>

                            {/* Rarity */}
                            <div>
                                <label className="block text-[10px] text-gray-500 font-bold uppercase mb-1">Raridade</label>
                                <select 
                                    value={adminForm.rarity}
                                    onChange={e => setAdminForm({...adminForm, rarity: e.target.value})}
                                    className="w-full bg-black/50 border border-gray-700 rounded px-3 py-2 text-white focus:border-emerald-500 outline-none text-sm"
                                >
                                    <option>Mythic</option>
                                    <option>Rare</option>
                                    <option>Uncommon</option>
                                    <option>Common</option>
                                </select>
                            </div>

                            {/* Submit Button */}
                            <div className="col-span-1 md:col-span-4 flex justify-end mt-4">
                                <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-lg font-bold text-sm transition-colors flex items-center gap-2">
                                    <Plus size={16} /> Adicionar Carta
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* CONTENT AREA */}
                {activeTab === 'official' ? (
                    isLoading ? (
                        <div className="flex items-center justify-center h-64 text-pink-500 gap-2">
                            <Loader2 className="animate-spin" size={32} />
                            <span className="font-bold">Carregando Spoilers...</span>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                            {cards.map(card => (
                                <div key={card.id} className="relative group">
                                    <DashboardCard 
                                        card={card}
                                        status={ownedIds.includes(card.id) ? 'owned' : 'missing'}
                                        viewMode="grid"
                                        onClick={() => onAddCard(card)}
                                        onToggleBuyList={onToggleBuyList}
                                        onTogglePrintList={onTogglePrintList}
                                        isInBuyList={buyList.some(c => c.id === card.id)}
                                        isInPrintList={printList.some(c => c.id === card.id)}
                                    />
                                    {!ownedIds.includes(card.id) && (
                                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button 
                                                onClick={(e) => { 
                                                    e.preventDefault();
                                                    e.stopPropagation(); 
                                                    onAddCard(card); 
                                                }}
                                                className="bg-emerald-500 hover:bg-emerald-400 text-black p-2 rounded-full shadow-lg"
                                            >
                                                <Plus size={16} strokeWidth={3} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )
                ) : (
                    // RECENT / CUSTOM SPOILERS GRID
                    customSpoilers.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                            <ImageIcon size={48} className="mb-4 opacity-20" />
                            <p className="font-bold">Nenhum spoiler recente adicionado.</p>
                            <p className="text-sm">Novos spoilers customizados serao liberados em breve.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                            {customSpoilers.map(card => (
                                <div key={card.id} className="relative group">
                                    <DashboardCard 
                                        card={card}
                                        status={ownedIds.includes(card.id) ? 'owned' : 'missing'}
                                        viewMode="grid"
                                        onClick={() => onAddCard(card)}
                                        onToggleBuyList={onToggleBuyList}
                                        onTogglePrintList={onTogglePrintList}
                                        isInBuyList={buyList.some(c => c.id === card.id)}
                                        isInPrintList={printList.some(c => c.id === card.id)}
                                    />
                                    
                                    {/* Admin Delete Action - Top Right Corner - HIGH Z-INDEX FIX */}
                                    {ADMIN_PANEL_ENABLED && showAdminPanel && (
                                        <div 
                                            className="absolute -top-3 -right-3 z-[200] cursor-pointer animate-in zoom-in duration-200"
                                            onClick={(e) => { 
                                                e.preventDefault();
                                                e.stopPropagation(); 
                                                handleDeleteCustom(card.id); 
                                            }}
                                        >
                                            <div className="bg-red-600 hover:bg-red-500 text-white p-2 rounded-full shadow-lg border-2 border-[#121212] transition-transform hover:scale-110 flex items-center justify-center">
                                                <Trash2 size={16} />
                                            </div>
                                        </div>
                                    )}

                                    {/* User Add Action - Centered Overlay */}
                                    {!ownedIds.includes(card.id) && (
                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button 
                                                onClick={(e) => { 
                                                    e.preventDefault();
                                                    e.stopPropagation(); 
                                                    onAddCard(card); 
                                                }}
                                                className="bg-emerald-500 hover:bg-emerald-400 text-black p-3 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.5)] transform hover:scale-110 transition-transform"
                                                title="Adicionar à coleção"
                                            >
                                                <Plus size={24} strokeWidth={3} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )
                )}
            </div>
        </div>
    );
};

