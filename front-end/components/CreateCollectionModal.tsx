

import React, { useState, useEffect, useRef } from 'react';
import { CollectionFilterType } from '../types';
import { X, Rocket, ArrowLeft, Key, LogOut, ChevronDown, Check, Search, Download, FileText, Upload, Loader2, AlertTriangle } from 'lucide-react';
import { getCreatureTypes, getSets, getCardTypes, fetchCardsFromIdentifiers } from '../services/scryfallService';
import { mapLigaMagicToScryfall } from '../utils/ligaMagicMapper';
import { parseImportFile } from '../utils/importUtils';

interface CreateCollectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (name: string, type: CollectionFilterType, value: string, query: string, initialCards?: { ids: string[], quantities: Record<string, number> }) => void;
    initialMode?: 'create' | 'import';
}

export const CreateCollectionModal: React.FC<CreateCollectionModalProps> = ({
    isOpen,
    onClose,
    onCreate,
    initialMode = 'create'
}) => {
    const [activeTab, setActiveTab] = useState<'create' | 'import'>(initialMode);
    const [name, setName] = useState('');

    // Create Mode State
    const [filterType, setFilterType] = useState<CollectionFilterType>('tribal');
    const [filterValue, setFilterValue] = useState('');
    const [previewQuery, setPreviewQuery] = useState('');
    const [forceDownload, setForceDownload] = useState(false);

    // Import Mode State
    const [importFormat, setImportFormat] = useState<'manabox' | 'moxfield' | 'ligamagic' | 'portal' | 'json'>('json');
    const [importedFile, setImportedFile] = useState<File | null>(null);
    const [importStats, setImportStats] = useState<{ count: number } | null>(null);
    const [importContent, setImportContent] = useState<string | null>(null);
    const [isResolving, setIsResolving] = useState(false);
    const [resolveProgress, setResolveProgress] = useState(0);

    // Dropdown State
    const [options, setOptions] = useState<string[] | { code: string, name: string }[]>([]);
    const [isLoadingOptions, setIsLoadingOptions] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Fixed Background Image logic identical to Landing Page
    const bgImage = 'https://cards.scryfall.io/art_crop/front/b/2/b2bf633e-0470-4b87-99ed-5ad1683b0954.jpg';

    useEffect(() => {
        if (isOpen) {
            setActiveTab(initialMode);
            setFilterValue('');
            setSearchTerm('');
            setName('');
            setImportedFile(null);
            setImportContent(null);
            setImportStats(null);
            setIsResolving(false);
        }
    }, [isOpen, initialMode]);

    useEffect(() => {
        const fetchOptions = async () => {
            if (filterType === 'advanced' || filterType === 'list') {
                setOptions([]);
                return;
            }

            setIsLoadingOptions(true);
            setSearchTerm('');
            setFilterValue('');

            try {
                if (filterType === 'tribal') {
                    const types = await getCreatureTypes();
                    setOptions(types);
                } else if (filterType === 'set') {
                    const sets = await getSets();
                    setOptions(sets);
                } else if (filterType === 'type') {
                    const types = await getCardTypes();
                    setOptions(types);
                } else if (filterType === 'artist') {
                    setOptions([
                        'Rebecca Guay', 'Christopher Moeller', 'Magali Villeneuve', 'John Avon',
                        'Terese Nielsen', 'Seb McKinnon', 'Kev Walker', 'Mark Tedin',
                        'Chris Rahn', 'Johannes Voss', 'Igor Kieryluk', 'Marta Nael'
                    ]);
                }
            } catch (error) {
                // Silent error to avoid console noise
            } finally {
                setIsLoadingOptions(false);
            }
        };

        if (isOpen && activeTab === 'create') {
            fetchOptions();
        }
    }, [filterType, isOpen, activeTab]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        let q = '';
        const cleanValue = filterValue.trim();

        switch (filterType) {
            case 'tribal':
                q = `t:${cleanValue || 'YOUR_TYPE'} (game:paper) unique:prints`;
                break;
            case 'set':
                q = `e:${cleanValue || 'SET_CODE'} (game:paper) unique:prints`;
                break;
            case 'artist':
                q = `a:"${cleanValue || 'ARTIST_NAME'}" (game:paper) unique:prints`;
                break;
            case 'type':
                q = `t:${cleanValue || 'CARD_TYPE'} (game:paper) unique:prints`;
                break;
            case 'advanced':
                q = `${cleanValue || 'your query'} (game:paper)`;
                break;
        }
        setPreviewQuery(q);
    }, [filterType, filterValue]);

    const parseLigaMagicCSV = (csvText: string) => {
        // Regex to split by comma but ignore commas inside quotes
        // Format: SetPT, SetEN, SetCode, NamePT, NameEN, Qty, Quality, Lang, Rarity, Color, Extras, CollectorNumber, Comment
        const regex = /,(?=(?:(?:[^"]*"){2})*[^"]*$)/;

        const lines = csvText.split('\n').filter(l => l.trim().length > 0);
        const identifiers: any[] = [];
        const quantitiesMap: Record<string, number> = {};
        // We can't use ID as key yet, so we'll store quantity by identifier index or key logic later.
        // Actually, we'll store quantities in a temporary list matching the identifiers order? 
        // No, let's just return a structure we can resolve.

        const pendingCards: { name: string, set: string, collector_number: string, quantity: number }[] = [];

        // Skip Header (check if first line contains "Edicao")
        const startIdx = lines[0].toLowerCase().includes('edicao') ? 1 : 0;

        for (let i = startIdx; i < lines.length; i++) {
            const row = lines[i].split(regex).map(cell => cell.trim().replace(/^"|"$/g, ''));

            if (row.length < 6) continue;

            // LigaMagic Columns based on sample:
            // 2: Set Code (Sigla)
            // 4: Card Name (EN) - Priority for Scryfall
            // 5: Quantity
            // 11: Collector Number (Card #)

            const setCodeRaw = row[2];
            const nameEn = row[4];
            const qtyStr = row[5];
            const collectorNum = row[11];

            if (!nameEn) continue;

            const qty = parseInt(qtyStr) || 1;
            const setCode = mapLigaMagicToScryfall(setCodeRaw);

            pendingCards.push({
                name: nameEn,
                set: setCode,
                collector_number: collectorNum,
                quantity: qty
            });
        }
        return pendingCards;
    };

    const handleFile = (file: File) => {
        setImportedFile(file);
        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result as string;
            setImportContent(text);

            if (importFormat === 'ligamagic') {
                const lines = text.split('\n').filter(l => l.trim().length > 0);
                // Basic estimation excluding header
                setImportStats({ count: Math.max(0, lines.length - 1) });
            } else {
                const lines = text.split('\n').filter(line => line.trim().length > 0);
                setImportStats({ count: lines.length });
            }

            if (!name) {
                const fileName = file.name.split('.')[0];
                setName(fileName.charAt(0).toUpperCase() + fileName.slice(1));
            }
        };
        reader.readAsText(file);
    };

    const handleCreate = async () => {
        if (activeTab === 'create') {
            if (!name || !filterValue) return;
            onCreate(name, filterType, filterValue, previewQuery);
        } else {
            // Import Logic
            if (!name || !importedFile || !importContent) return;

            // JSON Import (Direct ID mapping)
            if (importFormat === 'json') {
                setIsResolving(true);
                const result = await parseImportFile(importedFile);

                if (!result.success) {
                    alert(result.error);
                    setIsResolving(false);
                    return;
                }

                // Successfully parsed IDs from JSON
                // Create Collection directly with these IDs
                // We assume these IDs are valid Scryfall IDs as per the schema (scryfall_uri present in JSON).

                onCreate(name, filterType, filterValue, '(importado via json)', {
                    ids: result.data.ids,
                    quantities: result.data.quantities
                });

                setIsResolving(false);
                return;
            }

            setIsResolving(true);
            setResolveProgress(10);

            try {
                let identifiers: any[] = [];
                let quantitiesMap: Record<string, number> = {}; // Temporarily store qty by index if needed, but better to map by resolved ID later.
                // Wait, we need to associate Qty with the resolved card.
                // We can add a custom 'custom_id' or 'index' to the identifier and track it? Scryfall doesn't return that.
                // Scryfall returns the found card. We should probably try to match the result back or process sequentially?
                // Batch processing is unordered.
                // Actually, `fetchCardsFromIdentifiers` returns cards. If we send duplicates (same card multiple times), scryfall deduplicates response?
                // "The response will be a JSON object ... containing a data array of up to 75 cards...".

                // Strategy: We will count quantities locally.
                // Since we can't easily map the response back to the specific line quantity if we have duplicates of the same card in the list (rare but possible),
                // we will aggregate pending cards first.

                let pendingCards: { name: string, set: string, collector_number: string, quantity: number }[] = [];

                if (importFormat === 'ligamagic') {
                    pendingCards = parseLigaMagicCSV(importContent);
                } else {
                    // Fallback for simple formats (Manabox/Moxfield) logic placeholder
                    // For now assuming simple list "Qty Name"
                    const lines = importContent.split('\n');
                    lines.forEach(line => {
                        const match = line.match(/^(\d+)?\s*(.+)$/);
                        if (match) {
                            pendingCards.push({
                                name: match[2].trim(),
                                set: '', // Unknown
                                collector_number: '', // Unknown
                                quantity: match[1] ? parseInt(match[1]) : 1
                            });
                        }
                    });
                }

                // Build Identifiers for Scryfall
                // Scryfall Batch Identifier Types:
                // { id: "..." }
                // { name: "...", set: "..." }
                // { set: "...", collector_number: "..." }

                const scryfallIdentifiers = pendingCards.map(p => {
                    if (p.set && p.collector_number) {
                        return { set: p.set, collector_number: p.collector_number };
                    }
                    if (p.set && p.name) {
                        return { name: p.name, set: p.set };
                    }
                    return { name: p.name };
                });

                setResolveProgress(30);

                // Fetch Cards
                // Note: If we use {set, collector_number}, it's precise.
                const resolvedCards = await fetchCardsFromIdentifiers(scryfallIdentifiers);

                setResolveProgress(80);

                // Map quantities to resolved IDs
                // Since `fetchCardsFromIdentifiers` might return fewer cards than requested (if some not found),
                // or in different order, mapping exact quantity is tricky if we don't have a direct link.
                // However, we can try to match by name/set/cn again.

                const finalQuantities: Record<string, number> = {};
                const finalIds: string[] = [];

                resolvedCards.forEach(card => {
                    // Find matching pending entry
                    // We find the *first* pending entry that matches this card and consume it?
                    // Or sum up all matches.

                    const match = pendingCards.find(p => {
                        if (p.set && p.collector_number) {
                            return p.set.toLowerCase() === card.set.toLowerCase() && p.collector_number === card.collectorNumber;
                        }
                        if (p.name) {
                            return p.name.toLowerCase() === card.name.toLowerCase();
                        }
                        return false;
                    });

                    if (match) {
                        finalIds.push(card.id);
                        // Add quantity (accumulate if multiple lines mapped to same card)
                        finalQuantities[card.id] = (finalQuantities[card.id] || 0) + match.quantity;
                    }
                });

                setResolveProgress(100);

                // Create Collection
                onCreate(name, 'list', 'Importada', '(custom list)', {
                    ids: finalIds,
                    quantities: finalQuantities
                });

            } catch (error) {
                console.error(error);
                alert("Erro ao resolver cartas. Verifique o formato do arquivo.");
                setIsResolving(false);
            }
        }
    };

    const handleOptionSelect = (value: string, label?: string) => {
        setFilterValue(value);
        setSearchTerm(label || value);
        setIsDropdownOpen(false);

        if (!name) {
            if (filterType === 'tribal') setName(`Coleção de ${value}`);
            if (filterType === 'set') setName(`Set: ${label || value}`);
            if (filterType === 'type') setName(`Coleção de ${value}`);
            if (filterType === 'artist') setName(`Artes de ${value}`);
        }
    };

    const getFilteredOptions = () => {
        if (filterType === 'set') {
            return (options as { code: string, name: string }[]).filter(o =>
                o.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                o.code.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        return (options as string[]).filter(o => o.toLowerCase().includes(searchTerm.toLowerCase()));
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-portal-bg">
            {/* BACKGROUND IMAGE - IDENTICAL TO LANDING PAGE METHOD */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <img
                    src={bgImage}
                    className="w-full h-full object-cover opacity-40 grayscale mix-blend-overlay"
                    alt="Background"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-portal-bg/90 via-portal-bg/50 to-portal-bg"></div>
            </div>

            {/* MODAL CONTENT CONTAINER */}
            <div className="relative z-10 w-full max-w-lg mx-4 flex flex-col max-h-[90vh]">
                {/* Top Actions Overlay */}
                <div className="absolute -top-12 right-0 flex gap-2">
                    <div className="flex items-center gap-1 bg-black/80 border border-gray-700 rounded px-2 py-1 text-[10px] text-gray-400 font-bold uppercase">
                        <Key size={10} className="text-orange-500" /> LOGIN
                    </div>
                    <div className="flex items-center gap-1 bg-black/80 border border-gray-700 rounded px-2 py-1 text-[10px] text-gray-400 font-bold uppercase cursor-pointer hover:text-white transition-colors" onClick={onClose}>
                        <LogOut size={10} className="text-red-500" /> SAIR
                    </div>
                </div>

                <div className="bg-portal-panel/80 backdrop-blur-xl border border-portal-border rounded-2xl shadow-2xl flex flex-col overflow-hidden">
                    <div className="p-8 overflow-y-auto custom-scrollbar">
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-black text-white mb-1 tracking-tighter">
                                Portal de Coleções <span className="text-emerald-500">Magic</span>
                            </h2>
                            <p className="text-gray-500 text-sm">O que você deseja colecionar hoje?</p>
                        </div>

                        <div className="flex p-1 bg-black/40 rounded-xl mb-8 border border-white/5">
                            <button
                                onClick={() => setActiveTab('create')}
                                className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${activeTab === 'create' ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20' : 'text-gray-500 hover:text-gray-300'}`}
                            >
                                <Rocket size={16} /> Nova Coleção
                            </button>
                            <button
                                onClick={() => setActiveTab('import')}
                                className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${activeTab === 'import' ? 'bg-emerald-900/40 text-emerald-400 shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                            >
                                <Download size={16} /> Importar Arquivo
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Nome da Coleção</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Ex: Coleção de Elfos"
                                    className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-emerald-500 transition-all shadow-inner"
                                />
                            </div>

                            {activeTab === 'import' && (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-2">
                                        {(['json', 'manabox', 'moxfield', 'ligamagic'] as const).map(fmt => (
                                            <button
                                                key={fmt}
                                                onClick={() => setImportFormat(fmt)}
                                                className={`py-3 rounded-xl text-xs font-bold border transition-all ${importFormat === fmt ? 'bg-emerald-500 text-black border-emerald-500' : 'bg-black/40 text-gray-500 border-white/10'}`}
                                            >
                                                {fmt === 'json' ? 'JSON SCHEMA' : fmt.toUpperCase()}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="border-2 border-dashed border-white/10 rounded-2xl p-10 flex flex-col items-center justify-center text-center hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all relative">
                                        <input
                                            type="file"
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                                            accept=".csv,.txt,.json"
                                        />
                                        {importedFile ? (
                                            <div className="space-y-2">
                                                <FileText size={40} className="text-emerald-500 mx-auto" />
                                                <div className="text-white font-bold text-sm">{importedFile.name}</div>
                                                <div className="text-xs text-gray-500">~{importStats?.count} cartas detectadas</div>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                <Upload size={32} className="text-gray-700 mx-auto" />
                                                <p className="text-gray-300 font-bold text-sm">Arraste ou clique para enviar</p>
                                                <p className="text-gray-600 text-[10px] uppercase tracking-widest">JSON, CSV ou TXT</p>
                                            </div>
                                        )}
                                    </div>

                                    {importFormat === 'ligamagic' && (
                                        <div className="bg-yellow-900/10 border border-yellow-900/30 p-3 rounded-lg flex gap-2 items-start">
                                            <AlertTriangle size={14} className="text-yellow-500 shrink-0 mt-0.5" />
                                            <p className="text-xs text-yellow-500/80">
                                                O arquivo CSV da LigaMagic deve conter cabeçalho. O sistema usará as colunas de "Edicao (Sigla)" e "Card #" para identificar as cartas corretamente.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Collection Configuration - Visible for both Create and Import */}
                            <div className="space-y-5 pt-4 border-t border-white/5">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">
                                        {activeTab === 'import' ? 'Configuração da Base (Filtro)' : 'Filtro da Coleção'}
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={filterType}
                                            onChange={(e) => setFilterType(e.target.value as CollectionFilterType)}
                                            className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white appearance-none focus:outline-none focus:border-emerald-500 cursor-pointer"
                                        >
                                            <option value="tribal">Tipo de Criatura (Tribal)</option>
                                            <option value="set">Edição Completa (Set)</option>
                                            <option value="artist">Artista Específico</option>
                                            <option value="type">Tipo de Carta</option>
                                            <option value="advanced">Avançado (Query Livre)</option>
                                        </select>
                                        <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">
                                        {filterType === 'advanced' ? 'Qual a sua Query?' : 'Selecione a Opção'}
                                    </label>

                                    {filterType === 'advanced' ? (
                                        <input
                                            type="text"
                                            value={filterValue}
                                            onChange={(e) => setFilterValue(e.target.value)}
                                            placeholder="Ex: c:g t:creature r:m"
                                            className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-emerald-500"
                                        />
                                    ) : (
                                        <div className="relative" ref={dropdownRef}>
                                            <div className="relative w-full" onClick={() => setIsDropdownOpen(true)}>
                                                <input
                                                    type="text"
                                                    value={searchTerm}
                                                    onChange={(e) => {
                                                        setSearchTerm(e.target.value);
                                                        if (!isDropdownOpen) setIsDropdownOpen(true);
                                                    }}
                                                    placeholder={isLoadingOptions ? "Carregando..." : "Buscar..."}
                                                    className="w-full bg-black/50 border border-white/10 rounded-xl p-4 pr-12 text-white focus:outline-none focus:border-emerald-500"
                                                    autoComplete="off"
                                                />
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                                    {isLoadingOptions && <Loader2 size={16} className="animate-spin text-emerald-500" />}
                                                    <Search size={18} className="text-gray-500" />
                                                </div>
                                            </div>

                                            {isDropdownOpen && !isLoadingOptions && (
                                                <div className="absolute z-50 w-full mt-2 bg-[#0a1410] border border-white/10 rounded-xl shadow-2xl max-h-56 overflow-y-auto custom-scrollbar animate-in slide-in-from-top-2">
                                                    {getFilteredOptions().length === 0 ? (
                                                        <div className="p-4 text-sm text-gray-600 italic text-center">Nenhum resultado encontrado.</div>
                                                    ) : (
                                                        getFilteredOptions().map((opt, idx) => {
                                                            const isSet = filterType === 'set';
                                                            const val = isSet ? (opt as any).code : opt;
                                                            const label = isSet ? (opt as any).name : opt;
                                                            return (
                                                                <button
                                                                    key={idx}
                                                                    onClick={() => handleOptionSelect(val as string, label as string)}
                                                                    className="w-full text-left px-5 py-4 text-sm text-gray-400 hover:bg-emerald-500 hover:text-black transition-all border-b border-white/5 last:border-0"
                                                                >
                                                                    {label as string}
                                                                    {isSet && <span className="ml-2 text-[10px] font-mono text-gray-600">{(opt as any).code}</span>}
                                                                </button>
                                                            );
                                                        })
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="bg-black/40 border border-white/5 p-4 rounded-xl">
                                    <div className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest mb-1">Query Scryfall Final</div>
                                    <div className="text-xs font-mono text-gray-400 break-all">{previewQuery}</div>
                                </div>

                                <label className="flex items-center gap-3 cursor-pointer group px-1">
                                    <div className="relative">
                                        <input
                                            type="checkbox"
                                            checked={forceDownload}
                                            onChange={(e) => setForceDownload(e.target.checked)}
                                            className="peer h-5 w-5 opacity-0 absolute cursor-pointer"
                                        />
                                        <div className="h-5 w-5 border border-white/20 bg-black/40 rounded flex items-center justify-center peer-checked:bg-emerald-500 peer-checked:border-emerald-500 transition-all">
                                            <Check size={14} className="text-black stroke-[3]" />
                                        </div>
                                    </div>
                                    <span className="text-xs text-gray-500 group-hover:text-gray-300 transition-colors">Forçar novo download (limpar cache antigo)</span>
                                </label>
                            </div>

                            <div className="space-y-3 pt-6">
                                <button
                                    onClick={handleCreate}
                                    disabled={!name || !filterValue || (activeTab === 'import' && !importedFile) || isResolving}
                                    className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-black py-4 rounded-xl shadow-xl transition-all disabled:opacity-20 flex items-center justify-center gap-2"
                                >
                                    {isResolving ? (
                                        <>
                                            <Loader2 size={20} className="animate-spin" />
                                            RESOLVENDO CARTAS {resolveProgress}%
                                        </>
                                    ) : (
                                        <>
                                            {activeTab === 'create' ? <Rocket size={20} /> : <Download size={20} />}
                                            {activeTab === 'create' ? 'INICIAR COLEÇÃO' : 'IMPORTAR & CRIAR'}
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={onClose}
                                    disabled={isResolving}
                                    className="w-full py-4 text-gray-500 hover:text-white text-xs font-bold transition-colors flex items-center justify-center gap-2"
                                >
                                    <ArrowLeft size={16} /> VOLTAR PARA COLEÇÕES
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};