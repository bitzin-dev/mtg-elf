
import React, { useState, useEffect } from 'react';
import { UserCollection } from '../../backend/services/types';
import { Layers, Plus, ArrowRight, Search, Clock, Database, Loader2, Edit2, Check, X } from 'lucide-react';
import { backendService } from '../services/honoClient';

interface WelcomeScreenProps {
    user: {
        name: string;
        avatarUrl?: string; // Optional
    };
    collections: UserCollection[];
    onSelectCollection: (id: string) => void;
    onCreateCollection: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
    user,
    collections,
    onSelectCollection,
    onCreateCollection
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    // Use a default static image for instant load, similar to LandingPage
    const [bgImage, setBgImage] = useState('https://cards.scryfall.io/art_crop/front/8/3/83ea9b2c-5723-4eff-88ac-6669975939e3.jpg?1730489067');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');

    const handleStartEdit = (e: React.MouseEvent, id: string, currentName: string) => {
        e.stopPropagation();
        setEditingId(id);
        setEditName(currentName);
    };

    const handleCancelEdit = (e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingId(null);
    };

    const handleSaveRename = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (!editName.trim()) return;

        const res = await backendService.renameCollection({ collectionId: id, newName: editName });
        if (res && res.success) {
            setEditingId(null);
            window.location.reload(); // Simple refresh to reflect changes without prop drilling
        } else {
            console.error("Rename failed:", res);
            alert(`Erro ao renomear coleção: ${(res as any)?.error || 'Erro desconhecido'}`);
        }
    };

    const filteredCollections = collections.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen w-full bg-portal-bg text-gray-200 flex flex-col items-center justify-start md:justify-center p-4 pt-32 md:p-8 relative overflow-y-auto md:overflow-hidden">
            {/* Background Image Layer (Matching LandingPage) */}
            <div className="absolute inset-0 z-0 transition-opacity duration-1000 fixed">
                <img
                    src={bgImage}
                    className="w-full h-full object-cover opacity-20 grayscale mix-blend-overlay"
                    alt="Background"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-portal-bg/90 via-portal-bg/80 to-portal-bg"></div>
            </div>

            <div className="max-w-6xl w-full z-10 flex flex-col gap-16 md:gap-16 animate-in fade-in zoom-in-95 duration-500 items-center mb-10">

                {/* Header Section - Centered */}
                <div className="text-center space-y-6 max-w-2xl px-4">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight drop-shadow-xl break-words">
                        Bem-vindo de volta, <br className="md:hidden" />
                        <span className="text-emerald-500">{user.name}</span>
                    </h1>
                    <p className="text-gray-400 text-lg md:text-xl font-medium max-w-lg mx-auto leading-relaxed">
                        Selecione uma coleção para começar.
                    </p>

                    <button
                        onClick={onCreateCollection}
                        className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-4 rounded-xl font-bold shadow-lg shadow-emerald-900/30 transition-all hover:scale-105 hover:shadow-emerald-900/50 mt-4 md:mt-2 text-base md:text-lg"
                    >
                        <Plus size={20} className="stroke-[3]" />
                        Nova Coleção
                    </button>
                </div>

                {/* Search Bar - Only if needed */}
                {collections.length > 5 && (
                    <div className="relative max-w-md w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar coleção..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-black/60 backdrop-blur-sm border border-gray-700 rounded-full py-3.5 pl-12 pr-6 text-gray-200 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all placeholder-gray-500 shadow-xl"
                        />
                    </div>
                )}

                {/* Collections Grid - Centered items */}
                <div className="w-full flex justify-center">
                    <div className="flex flex-wrap justify-center gap-6 w-full max-w-7xl">
                        {filteredCollections.map((collection) => (
                            <div
                                key={collection.id}
                                onClick={() => onSelectCollection(collection.id)}
                                className="group relative bg-[#0a0f0d]/90 backdrop-blur-md border border-gray-800 hover:border-emerald-500/50 rounded-2xl p-6 cursor-pointer transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-900/20 hover:-translate-y-2 overflow-hidden flex flex-col h-[220px] w-full sm:w-[320px]"
                            >
                                {/* Collection Cover Image (Background) */}
                                {collection.coverImage && (
                                    <div className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-700 z-0">
                                        <img src={collection.coverImage} className="w-full h-full object-cover grayscale mix-blend-luminosity scale-110 group-hover:scale-100 transition-transform duration-700" alt="" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f0d] via-[#0a0f0d]/50 to-transparent"></div>
                                    </div>
                                )}

                                <div className="relative z-10 flex flex-col h-full">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-3 bg-gray-900/80 rounded-xl border border-gray-800 text-emerald-500 group-hover:text-emerald-400 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                                            <Layers size={24} />
                                        </div>
                                        {collection.filterType && (
                                            <div className="text-[10px] font-bold tracking-wider text-gray-500 group-hover:text-emerald-400 transition-colors bg-black/60 px-2 py-1 rounded border border-gray-800/50 uppercase">
                                                {collection.filterType}
                                            </div>
                                        )}
                                    </div>

                                    {editingId === collection.id ? (
                                        <div className="flex items-center gap-2 mb-1" onClick={(e) => e.stopPropagation()}>
                                            <input
                                                type="text"
                                                value={editName}
                                                onChange={(e) => setEditName(e.target.value)}
                                                className="bg-gray-800 border border-emerald-500/50 rounded px-2 py-1 text-white text-sm w-full focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                                autoFocus
                                            />
                                            <button onClick={(e) => handleSaveRename(e, collection.id)} className="p-1 text-emerald-500 hover:text-emerald-400 bg-gray-900 rounded border border-gray-700">
                                                <Check size={14} />
                                            </button>
                                            <button onClick={handleCancelEdit} className="p-1 text-red-500 hover:text-red-400 bg-gray-900 rounded border border-gray-700">
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-between group/title mb-1">
                                            <h3 className="text-xl font-bold text-gray-200 group-hover:text-white line-clamp-1 tracking-tight">
                                                {collection.name}
                                            </h3>
                                            <button
                                                onClick={(e) => handleStartEdit(e, collection.id, collection.name)}
                                                className="opacity-0 group-hover/title:opacity-100 p-1.5 text-gray-500 hover:text-emerald-400 transition-all hover:bg-gray-800 rounded"
                                                title="Renomear coleção"
                                            >
                                                <Edit2 size={14} />
                                            </button>
                                        </div>
                                    )}

                                    {/* Subtle info line */}
                                    <div className="h-px w-12 bg-gray-800 group-hover:bg-emerald-500/50 my-3 transition-colors"></div>

                                    <div className="flex flex-col gap-1.5 mt-auto">
                                        <div className="flex items-center gap-2 text-sm text-gray-500 group-hover:text-gray-300 transition-colors">
                                            <Database size={14} className="text-emerald-500/70" />
                                            <span className="font-medium">{collection.ownedCardIds?.length || 0} cartas</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-gray-600 group-hover:text-gray-500 transition-colors">
                                            <Clock size={12} />
                                            <span>{new Date(collection.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>

                                    <div className="absolute bottom-5 right-5 opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all duration-300 delay-75">
                                        <div className="bg-emerald-500/90 p-2.5 rounded-full text-black shadow-lg shadow-emerald-500/20 backdrop-blur-sm">
                                            <ArrowRight size={20} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* New Collection Card (Empty State or Action) - Always visible if < 3 collections or explicitly requested */}
                        {/* Logic: If user has 0 collections, filteredCollections takes up space but is empty. We display this card always as the last item to encourage creation. */}
                        <button
                            onClick={onCreateCollection}
                            className="group relative flex flex-col items-center justify-center gap-6 bg-gray-900/10 border-2 border-dashed border-gray-800/60 hover:border-emerald-500/50 rounded-2xl p-6 h-[220px] text-gray-500 hover:text-emerald-500 hover:bg-emerald-900/5 transition-all duration-300 w-full sm:w-[320px]"
                        >
                            <div className="p-5 rounded-full bg-gray-900/50 border border-gray-800 group-hover:border-emerald-500/30 group-hover:bg-emerald-500/10 transition-colors duration-300">
                                <Plus size={32} className="group-hover:scale-110 transition-transform duration-300 text-gray-600 group-hover:text-emerald-500" />
                            </div>
                            <span className="font-bold text-sm tracking-wide group-hover:text-emerald-400 transition-colors">Criar Nova Coleção</span>
                        </button>
                    </div>
                </div>

                {/* Empty State Message - Redundant if we have the button above, but good for explicit "Empty" text if desired. 
            Actually, the grid above will show just the "Create" button if empty, which is cleaner. 
            Let's keep a subtle hint if strictly empty. 
        */}
                {collections.length === 0 && (
                    <div className="text-center text-gray-600 text-sm animate-pulse">
                        Comece sua jornada criando sua primeira coleção acima.
                    </div>
                )}
            </div>
        </div>
    );
};
