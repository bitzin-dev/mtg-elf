
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { DashboardSidebar } from './components/DashboardSidebar';
import { DashboardCard } from './components/DashboardCard';
import { AdvancedFilterBar } from './components/AdvancedFilterBar';
import { CreateCollectionModal } from './components/CreateCollectionModal';
import { CardDetailsModal } from './components/CardDetailsModal';
import { ExportCollectionModal } from './components/ExportCollectionModal';
import { GlobalListModal } from './components/GlobalListModal';
import { SaveSearchModal } from './components/SaveSearchModal';
import { UserProfile } from './components/UserProfile';
import { AuthModal } from './components/AuthModal';
import { ScannerModal } from './components/ScannerModal';
import { BinderView } from './components/BinderView';
import { MobileBottomBar } from './components/MobileBottomBar';
import { WelcomeScreen } from './components/WelcomeScreen';
import { searchScryfall, getRandomCardArt, getLandingPageCards, clearSessionCache, getLigaMagicPrice, fetchCardsFromIdentifiers } from './services/scryfallService';
import { Card, CollectionFilterType, SavedSearch, AdvancedFilters, CardColor, FrontendCollection } from './types';
import { Search, Settings, RefreshCw, Save, Home, LogOut, Filter, Trash2, Scan, Database, Download, Upload, List as ListIcon, ExternalLink, X, Check, ArrowDown, Loader2, Layers, ShieldCheck, ShoppingCart, Printer, ArrowUp, Menu, AlertTriangle, ArrowLeft, Camera, DollarSign, ArrowRight, Sparkles, Shuffle, Share2, Wrench } from 'lucide-react';
import { backendService } from './services/honoClient';
import { UserCollection } from '../backend/services/types';

const Footer: React.FC = () => (
  <footer className="bg-black py-4 border-t border-gray-900 mt-auto relative z-10 shrink-0">
    <div className="max-w-7xl mx-auto px-4 text-center">
      <p className="text-[10px] text-gray-500">
        &copy; 2026 Portal de Coleções MTG. Dados por Scryfall.
      </p>
    </div>
  </footer>
);

const LandingPage: React.FC<{ onAuth: (mode: 'login' | 'register') => void }> = ({ onAuth }) => {

  // Use specific image as default
  const [bgImage, setBgImage] = useState('https://cards.scryfall.io/art_crop/front/8/3/83ea9b2c-5723-4eff-88ac-6669975939e3.jpg?1730489067');
  const [isLoadingBg, setIsLoadingBg] = useState(false);
  const [featuredCards, setFeaturedCards] = useState<Card[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const cards = await getLandingPageCards();
        setFeaturedCards(cards);
      } catch (e) {
        console.warn("Landing assets load failed");
      }
    };
    load();
  }, []);

  const handleRandomizeBg = async () => {
    if (isLoadingBg) return;
    setIsLoadingBg(true);
    try {
      const art = await getRandomCardArt();
      if (art) setBgImage(art);
    } catch (error) {
      // ignore
    } finally {
      setIsLoadingBg(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-portal-bg text-white overflow-hidden relative">
      {/* Background Image Layer */}
      {bgImage && (
        <div className="absolute inset-0 z-0 transition-opacity duration-1000">
          <img
            src={bgImage}
            className="w-full h-full object-cover opacity-40 grayscale mix-blend-overlay transition-all duration-1000"
            alt="Background"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-portal-bg/90 via-portal-bg/50 to-portal-bg"></div>
        </div>
      )}

      {/* Random Background Button */}
      <button
        onClick={handleRandomizeBg}
        disabled={isLoadingBg}
        className="fixed bottom-6 left-6 z-50 p-3 bg-black/40 hover:bg-black/80 backdrop-blur-md border border-white/10 rounded-full text-white/50 hover:text-white transition-all duration-300 hover:rotate-180 disabled:opacity-50"
        title="Trocar Arte de Fundo"
      >
        {isLoadingBg ? <Loader2 size={20} className="animate-spin" /> : <Shuffle size={20} />}
      </button>

      <Navbar onAuth={onAuth} />

      <main className="flex-grow flex items-center justify-center relative z-10 px-4 sm:px-6 lg:px-8 w-full pt-16 md:pt-0">
        <div className="max-w-7xl w-full h-full md:h-auto flex flex-col justify-center">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-12 items-center">

            {/* Text Content */}
            <div className="space-y-6 md:space-y-8 z-20 flex flex-col items-center md:items-start text-center md:text-left pt-8 md:pt-0">
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight text-white drop-shadow-xl">
                Gerencie suas<br />
                <span className="text-emerald-500">Coleções de Magic</span>
              </h1>
              <p className="text-base md:text-lg text-gray-400 max-w-lg leading-relaxed drop-shadow-md">
                Organize, rastreie preços e complete seus sets favoritos com a ajuda de inteligência artificial.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-4 pt-2 w-full md:w-auto">
                <button
                  onClick={() => onAuth('register')}
                  className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-400 text-black font-black py-3 md:py-4 px-8 md:px-10 rounded-xl shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  Começar Agora <ArrowRight size={20} />
                </button>
                <button
                  onClick={() => onAuth('login')}
                  className="w-full sm:w-auto text-gray-400 hover:text-white text-sm font-bold flex items-center justify-center gap-2 px-6 py-4 rounded-xl hover:bg-white/5 transition-colors"
                >
                  Já tenho uma conta
                </button>
              </div>
            </div>

            {/* Featured Image (3 Cards Fan Layout) */}
            <div className="flex justify-center md:justify-end relative h-[350px] md:h-[400px] w-full items-center perspective-1000 scale-[0.85] md:scale-100 mt-12 md:mt-0">
              {featuredCards.length >= 3 ? (
                <div className="relative w-64 h-96 flex items-center justify-center">
                  {/* Right/Back Card */}
                  <div className="absolute transform -translate-x-24 -rotate-[15deg] transition-transform duration-700 ease-out z-0 hover:z-40 hover:scale-110 hover:rotate-0 top-8">
                    <img src={featuredCards[2].imageUrl} alt="Back Card" className="w-64 rounded-xl shadow-2xl border border-gray-800 brightness-75 hover:brightness-100" />
                  </div>

                  {/* Left/Middle Card */}
                  <div className="absolute transform translate-x-24 rotate-[15deg] transition-transform duration-700 ease-out z-10 hover:z-40 hover:scale-110 hover:rotate-0 top-8">
                    <img src={featuredCards[1].imageUrl} alt="Middle Card" className="w-64 rounded-xl shadow-2xl border border-gray-800 brightness-90 hover:brightness-100" />
                  </div>

                  {/* Center/Front Card */}
                  <div className="absolute transform z-20 hover:scale-105 transition-transform duration-500">
                    <img src={featuredCards[0].imageUrl} alt="Main Card" className="w-72 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.9)] border border-gray-600" />
                  </div>
                </div>
              ) : (
                <div className="w-72 h-96 bg-gray-900/50 rounded-2xl border border-gray-800 animate-pulse flex items-center justify-center">
                  <Loader2 className="text-gray-700 animate-spin" size={48} />
                </div>
              )}
            </div>

          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

const StatsCounter: React.FC<{ label: string; count: number }> = ({ label, count }) => (
  <div className="flex flex-col items-center">
    <span className="text-2xl font-bold text-portal-accent leading-none">{count}</span>
    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{label}</span>
  </div>
);

const ToolbarButton: React.FC<{ icon: React.ReactNode; label: string; onClick?: () => void; disabled?: boolean; progress?: number }> = ({ icon, label, onClick, disabled, progress }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`relative overflow-hidden flex items-center gap-2 bg-gray-900 hover:bg-gray-800 border border-gray-700 px-3 py-1.5 rounded text-xs font-bold text-gray-300 transition-colors uppercase tracking-wide shadow-sm whitespace-nowrap ${disabled ? 'cursor-not-allowed' : ''}`}
  >
    {progress !== undefined && progress > 0 && (
      <div
        className="absolute left-0 top-0 bottom-0 bg-emerald-900/60 transition-all duration-300 ease-out"
        style={{ width: `${progress}%` }}
      />
    )}
    <div className="relative z-10 flex items-center gap-2">
      {icon} {label}
    </div>
  </button>
);

const Dashboard: React.FC<{ user: any, onExit: () => void, sharedId?: string }> = ({ user, onExit, sharedId }) => {

  console.log(user);

  const [currentView, setCurrentView] = useState<'dashboard' | 'profile'>('dashboard');
  const importInputRef = useRef<HTMLInputElement>(null);
  const [isLoadingCollections, setIsLoadingCollections] = useState(true);

  // userProfile usa os dados reais do backend
  const [userProfile, setUserProfile] = useState({
    name: user.name || '',
    email: user.email || '',
    joinDate: user.joinDate || new Date().toISOString(),
    avatarUrl: user.avatarUrl || '',
  });

  // Atualizar userProfile quando user mudar (dados do backend)
  useEffect(() => {
    setUserProfile({
      name: user.name || '',
      email: user.email || '',
      joinDate: user.joinDate || new Date().toISOString(),
      avatarUrl: user.avatarUrl || '',
    });
  }, [user]);

  // Estado das coleções - inicializa vazio e carrega do backend
  const [collections, setCollections] = useState<FrontendCollection[]>([]);

  // Carregar coleções do backend ao montar o componente
  useEffect(() => {
    const loadCollections = async () => {
      setIsLoadingCollections(true);
      try {
        if (sharedId) {
          const result = await backendService.getPublicCollection(sharedId);
          if (result && result.success && (result as any).collection) {
            const colRaw = (result as any).collection;
            const col: FrontendCollection = {
              id: colRaw._id.toString(),
              name: colRaw.name,
              filterType: colRaw.filterType,
              filterValue: colRaw.filterValue,
              query: colRaw.query,
              createdAt: colRaw.createdAt,
              ownedCardIds: colRaw.ownedCardIds || [],
              quantities: colRaw.quantities || {},
              coverImage: colRaw.coverImage,
              buyListIds: [],
              printListIds: [],
              email_user: ''
            };
            setCollections([col]);
            setActiveCollectionId(col.id);
            setIsBinderOpen(true);
          }
        } else {
          const result = await backendService.getCollections();
          if (result && result.success && (result as any).collections) {
            // Mapear os dados do backend para o formato do frontend
            const mappedCollections: FrontendCollection[] = (result as any).collections.map((col: any) => ({
              id: col._id?.toString() || col.id,
              name: col.name,
              filterType: col.filterType,
              filterValue: col.filterValue,
              query: col.query,
              createdAt: col.createdAt,
              ownedCardIds: col.ownedCardIds || [],
              quantities: col.quantities || {},
              coverImage: col.coverImage,
              buyListIds: col.buyListIds || [],
              printListIds: col.printListIds || []
            }));
            setCollections(mappedCollections);
            // REMOVED (OLD): Selecionar a primeira coleção se existir
            // if (mappedCollections.length > 0) {
            //   setActiveCollectionId(mappedCollections[0]._id);
            // }

            // NEW LOGIC: Se não houver coleções, abrir create modal. Se houver, não faz nada (Welcome Screen é mostrada).
            if (mappedCollections.length === 0) {
              setIsModalOpen(true);
              setCreateModalMode('create');
            }
          } else {
            // Fallback para localStorage se o backend falhar
            const saved = localStorage.getItem('portal_mtg_collections');
            if (saved) {
              const parsed = JSON.parse(saved);
              setCollections(parsed);
              if (parsed.length === 0) {
                setIsModalOpen(true);
                setCreateModalMode('create');
              }
            }
          }
        }
      } catch (error) {
        console.error('Erro ao carregar coleções:', error);
        // Fallback para localStorage
        const saved = localStorage.getItem('portal_mtg_collections');
        if (saved) {
          const parsed = JSON.parse(saved);
          setCollections(parsed);
        }
      } finally {
        setIsLoadingCollections(false);
      }
    };
    loadCollections();
  }, []);

  // Verificação periódica de autenticação (a cada 30 segundos)
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const result = await backendService.me();
        if (!result || !result.success) {
          console.warn('Sessão expirada ou inválida');
          onExit(); // Desloga o usuário
        }
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
      }
    };

    // Verificar imediatamente ao montar
    checkAuth();

    // Configurar intervalo de verificação
    const interval = setInterval(checkAuth, 30000); // 30 segundos

    return () => clearInterval(interval);
  }, [onExit]);

  // Calculate total cards owned across all collections for the profile view
  const totalCardsOwned = useMemo(() => {
    return collections.reduce((acc, col) => acc + (col.ownedCardIds?.length || 0), 0);
  }, [collections]);

  // Estado das pesquisas salvas - inicializa vazio e carrega do backend
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);

  // Carregar pesquisas salvas do backend ao montar o componente
  useEffect(() => {
    const loadSearches = async () => {
      try {
        const result = await backendService.getSearches();
        if (result && result.success && (result as any).searches) {
          // Mapear os dados do backend para o formato do frontend
          const mappedSearches: SavedSearch[] = (result as any).searches.map((s: any) => ({
            id: s._id?.toString() || s.id,
            name: s.name,
            timestamp: s.timestamp,
            criteria: s.criteria
          }));
          setSavedSearches(mappedSearches);
        } else {
          // Fallback para localStorage se o backend falhar
          const saved = localStorage.getItem('portal_mtg_saved_searches');
          if (saved) {
            setSavedSearches(JSON.parse(saved));
          }
        }
      } catch (error) {
        console.error('Erro ao carregar pesquisas salvas:', error);
        // Fallback para localStorage
        const saved = localStorage.getItem('portal_mtg_saved_searches');
        if (saved) {
          setSavedSearches(JSON.parse(saved));
        }
      }
    };
    loadSearches();
  }, []);

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => { }
  });

  // Salvar coleções no localStorage como backup
  useEffect(() => {
    if (collections.length > 0) {
      localStorage.setItem('portal_mtg_collections', JSON.stringify(collections));
    }
  }, [collections]);

  // Salvar pesquisas no localStorage como backup
  useEffect(() => {
    if (savedSearches.length > 0) {
      localStorage.setItem('portal_mtg_saved_searches', JSON.stringify(savedSearches));
    }
  }, [savedSearches]);

  const [activeCollectionId, setActiveCollectionId] = useState<string | null>(null);

  // Start with Welcome View if no active collection
  // const [currentView, setCurrentView] = useState<'dashboard' | 'profile'>('dashboard'); // Replaced below to handle conditional rendering properly within the return statement, using activeCollectionId as the driver.
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [createModalMode, setCreateModalMode] = useState<'create' | 'import'>('create');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isUpdatingPrices, setIsUpdatingPrices] = useState(false);
  const [updateProgress, setUpdateProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Mobile specific state
  const [showMobileOwned, setShowMobileOwned] = useState(false);
  const [isMobileToolsOpen, setIsMobileToolsOpen] = useState(false);

  // Scanner Modal State
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  // Binder View State
  const [isBinderOpen, setIsBinderOpen] = useState(false);

  const [isSaveSearchModalOpen, setIsSaveSearchModalOpen] = useState(false);
  const [isGlobalListModalOpen, setIsGlobalListModalOpen] = useState(false);
  const [globalListType, setGlobalListType] = useState<'buy' | 'print'>('buy');
  const [globalListInitialMode, setGlobalListInitialMode] = useState<'standard' | 'ligamagic'>('standard');
  const [selectedCardDetails, setSelectedCardDetails] = useState<Card | null>(null);

  const [activeLeftTab, setActiveLeftTab] = useState<'missing' | 'buy'>('missing');
  const [activeRightTab, setActiveRightTab] = useState<'owned' | 'print'>('owned');
  const [setsSortOrder, setSetsSortOrder] = useState<'desc' | 'asc'>('desc');
  const [rangeStartSet, setRangeStartSet] = useState<string>('');
  const [rangeEndSet, setRangeEndSet] = useState<string>('');
  const [isRangeFilterActive, setIsRangeFilterActive] = useState(false);
  const [collectionCards, setCollectionCards] = useState<Card[]>([]);
  const [filteredCollectionCards, setFilteredCollectionCards] = useState<Card[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSet, setSelectedSet] = useState<string | null>(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilters>({
    rarity: '',
    color: '',
    cmc: '',
    power: '',
    toughness: ''
  });

  const [setColumnBg, setSetColumnBg] = useState('https://cards.scryfall.io/art_crop/front/8/3/83ea9b2c-5723-4eff-88ac-6669975939e3.jpg?1730489067');

  const activeCollection = collections.find(c => c.id === activeCollectionId);

  const currentOwnedCards = useMemo(() => {
    if (!activeCollection) return [];
    return filteredCollectionCards.filter(c => activeCollection.ownedCardIds?.includes(c.id));
  }, [filteredCollectionCards, activeCollection]);

  const missingCards = useMemo(() => {
    if (!activeCollection) return [];
    return filteredCollectionCards.filter(c => !activeCollection.ownedCardIds?.includes(c.id));
  }, [filteredCollectionCards, activeCollection]);

  // buyList e printList computados da coleção ativa
  const buyList = useMemo(() => {
    if (!activeCollection) return [];
    const ids = activeCollection.buyListIds || [];
    return collectionCards.filter(c => ids.includes(c.id));
  }, [activeCollection, collectionCards]);

  const printList = useMemo(() => {
    if (!activeCollection) return [];
    const ids = activeCollection.printListIds || [];
    return collectionCards.filter(c => ids.includes(c.id));
  }, [activeCollection, collectionCards]);

  useEffect(() => {
    const fetch = async () => {
      if (!activeCollection) {
        setCollectionCards([]);
        setFilteredCollectionCards([]);
        return;
      }
      setIsLoading(true);
      if (refreshTrigger === 0) {
        handleClearAdvancedFilters();
      }

      // Handle special 'list' type collection (imported lists)
      if (activeCollection.filterType === 'list') {
        // Resolve only the owned cards
        const identifiers = activeCollection.ownedCardIds.map(id => ({ id }));
        const cards = await fetchCardsFromIdentifiers(identifiers);
        setCollectionCards(cards);
        setFilteredCollectionCards(cards);

        // Auto-update prices for 'checklist' type collections
        if (cards.length > 0) {
          setIsUpdatingPrices(true);
          setUpdateProgress(0);
          let processed = 0;
          // Process in background without awaiting the whole batch to block UI
          (async () => {
            const promises = cards.map(c => getLigaMagicPrice(c.name, c.setName, true).then(price => {
              processed++;
              setUpdateProgress(Math.round((processed / cards.length) * 100));
              if (price > 0) {
                setCollectionCards(prev => {
                  const idx = prev.findIndex(p => p.id === c.id);
                  if (idx === -1) return prev;
                  if (Math.abs(prev[idx].priceBRL - price) < 0.01) return prev;
                  const next = [...prev];
                  next[idx] = { ...next[idx], priceBRL: price };
                  return next;
                });
              }
            }));
            await Promise.all(promises);
            setIsUpdatingPrices(false);
            setUpdateProgress(0);
          })();
        }

      } else {
        // Standard Scryfall Search with Incremental Loading
        const cards = await searchScryfall(activeCollection.query, (partialCards) => {
          setCollectionCards(partialCards);
          setFilteredCollectionCards(partialCards);
          // Unlock UI immediately after first batch
          setIsLoading(false);
        });
        setCollectionCards(cards);
        setFilteredCollectionCards(cards);
      }
      setIsLoading(false);
    };
    fetch();
  }, [activeCollectionId, refreshTrigger]);

  const derivedSets = useMemo(() => {
    const setsMap = new Map<string, { code: string, name: string, year: string, total: number, owned: number }>();

    collectionCards.forEach(card => {
      if (!setsMap.has(card.set)) {
        setsMap.set(card.set, {
          code: card.set,
          name: card.setName,
          year: card.releaseYear,
          total: 0,
          owned: 0
        });
      }
      const setInfo = setsMap.get(card.set)!;
      setInfo.total += 1;
      if (activeCollection?.ownedCardIds?.includes(card.id)) {
        setInfo.owned += 1;
      }
    });

    return Array.from(setsMap.values()).sort((a, b) => {
      if (setsSortOrder === 'desc') {
        return b.year.localeCompare(a.year);
      }
      return a.year.localeCompare(b.year);
    });
  }, [collectionCards, activeCollection, setsSortOrder]);

  useEffect(() => {
    let result = collectionCards;
    if (selectedSet) {
      result = result.filter(card => card.set === selectedSet);
    }
    if (searchTerm) {
      result = result.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    if (advancedFilters.rarity) {
      result = result.filter(c => c.rarity.toLowerCase() === advancedFilters.rarity.toLowerCase() || (advancedFilters.rarity === 'mythic' && c.rarity === 'Mythic Rare'));
    }
    if (advancedFilters.color) {
      if (advancedFilters.color === 'M') {
        result = result.filter(c => c.colors.length > 1);
      } else if (advancedFilters.color === 'C') {
        result = result.filter(c => c.colors.length === 0 || c.colors[0] === 'Colorless');
      } else {
        const colorMap: Record<string, string> = { 'W': 'White', 'U': 'Blue', 'B': 'Black', 'R': 'Red', 'G': 'Green' };
        const targetColor = colorMap[advancedFilters.color];
        if (targetColor) result = result.filter(c => c.colors.includes(targetColor as any));
      }
    }
    if (advancedFilters.cmc) {
      if (advancedFilters.cmc === '7+') {
        result = result.filter(c => {
          const estCmc = c.manaCost.replace(/[{}]/g, '').length;
          return estCmc >= 7;
        });
      } else {
        const targetCmc = parseInt(advancedFilters.cmc);
        result = result.filter(c => {
          const estCmc = c.manaCost.replace(/[{}]/g, '').length;
          return estCmc === targetCmc;
        });
      }
    }
    if (advancedFilters.power) result = result.filter(c => c.power === advancedFilters.power);
    if (advancedFilters.toughness) result = result.filter(c => c.toughness === advancedFilters.toughness);
    setFilteredCollectionCards(result);
  }, [selectedSet, collectionCards, searchTerm, advancedFilters]);

  const toggleSet = (setCode: string) => {
    setSelectedSet(selectedSet === setCode ? null : setCode);
  };

  const handleCreateCollection = useCallback(async (
    name: string,
    type: CollectionFilterType,
    value: string,
    query: string,
    initialCards?: { ids: string[], quantities: Record<string, number> }
  ) => {

    // Criar no backend primeiro
    const result = await backendService.crateCollection({
      name,
      filterType: type,
      filterValue: value,
      query,
      quantities: initialCards?.quantities || {},
      ownedCardIds: initialCards?.ids || []
    });

    // Se falhou, não adiciona localmente
    if (!result || !result.success || !result.uuid) {
      setError((result as any)?.error || 'Erro ao criar coleção. Tente novamente.');
      return;
    }

    // Criar objeto local com os dados
    const newCol: UserCollection = {
      _id: result.uuid,
      name,
      email_user: '',
      filterType: type,
      filterValue: value,
      query,
      createdAt: new Date(),
      updatedAt: new Date(),
      ownedCardIds: initialCards?.ids || [],
      quantities: initialCards?.quantities || {},
      buyListIds: [],
      printListIds: [],
    };

    setCollections(prev => [...prev, newCol]);
    // setActiveCollectionId(newCol._id); // REMOVE AUTO-SELECT NEW COLLECTION (User request: "ele seleciona qual coleção ele quer iniciar")
    // Actually, user said "Caso ele não tenha nenhuma coleção, abre a tela de criação de coleção."
    // He didn't explicitly say NOT to select it after creation, but generally after creation you want to go to it.
    // However, the prompt says "mostra as coleções que ele tem e ele seleciona qual coleção ele quer iniciar."
    // If I auto-select, I skip the welcome screen.
    // Let's AUTO-SELECT if it's the FIRST one (created from empty state).
    if (collections.length === 0) {
      setActiveCollectionId(newCol._id);
    }
    // Else, we can stay on Welcome Screen or go to the new one. Usually creating = intent to use.
    // Let's decide to go to the new collection for better UX, as "Create" implies intent to use.
    setActiveCollectionId(newCol._id);
    setIsModalOpen(false);
    setCurrentView('dashboard');

  }, []);

  const handleUpdateProfile = useCallback((updatedUser: any) => {
    setUserProfile((prev: any) => ({ ...prev, ...updatedUser }));
  }, []);

  const handleDeleteCollection = useCallback((id: string) => {
    setConfirmModal({
      isOpen: true,
      title: "Excluir Coleção",
      message: "Deseja realmente excluir esta coleção? Todos os dados marcados serão perdidos permanentemente.",
      onConfirm: async () => {
        // Optimistic update - remove localmente primeiro
        setCollections(prev => {
          const newCollections = prev.filter(c => c.id !== id);
          if (activeCollectionId === id) {
            const nextId = newCollections.length > 0 ? newCollections[0].id : null;
            setActiveCollectionId(nextId);
          }
          return newCollections;
        });
        setConfirmModal(prev => ({ ...prev, isOpen: false }));

        // Sincronizar com backend
        const result = await backendService.deleteCollection({ collectionId: id });
        if (!result || !result.success) {
          setError((result as any)?.error || 'Erro ao excluir coleção. Tente novamente.');
        }
      }
    });
  }, [activeCollectionId]);

  const handleAddCard = useCallback(async (card: Card) => {
    if (!activeCollectionId) return;

    // Atualizar localmente primeiro (otimistic update)
    setCollections(prev => prev.map(c => {
      if (c.id === activeCollectionId) {
        if (c.ownedCardIds.includes(card.id)) return c;
        const newQuantities = { ...(c.quantities || {}), [card.id]: 1 };
        return { ...c, ownedCardIds: [...c.ownedCardIds, card.id], quantities: newQuantities };
      }
      return c;
    }));

    // Sincronizar com backend
    const result = await backendService.UpdateCollection({
      action: 'add',
      collectionId: activeCollectionId,
      cardId: card.id,
      quantity: 1
    });

    if (!result || !result.success) {
      console.error('Erro ao sincronizar com backend:', (result as any)?.error);
    }
  }, [activeCollectionId]);

  const handleUpdateQuantity = useCallback(async (card: Card, newQty: number) => {
    if (!activeCollectionId) return;

    // Atualizar localmente primeiro
    setCollections(prev => prev.map(c => {
      if (c.id === activeCollectionId) {
        const newQuantities = { ...(c.quantities || {}), [card.id]: newQty };
        return { ...c, quantities: newQuantities };
      }
      return c;
    }));

    // Sincronizar com backend
    const result = await backendService.UpdateCollection({
      action: 'update',
      collectionId: activeCollectionId,
      cardId: card.id,
      quantity: newQty
    });

    if (!result || !result.success) {
      console.error('Erro ao sincronizar com backend:', (result as any)?.error);
    }
  }, [activeCollectionId]);

  const handleRemoveCard = useCallback(async (card: Card) => {
    if (!activeCollectionId) return;

    // Atualizar localmente primeiro
    setCollections(prev => prev.map(c => {
      if (c.id === activeCollectionId) {
        const newOwnedIds = c.ownedCardIds.filter(id => id !== card.id);
        const newQuantities = { ...(c.quantities || {}) };
        delete newQuantities[card.id];
        return { ...c, ownedCardIds: newOwnedIds, quantities: newQuantities };
      }
      return c;
    }));

    // Sincronizar com backend
    const result = await backendService.UpdateCollection({
      action: 'remove',
      collectionId: activeCollectionId,
      cardId: card.id
    });

    if (!result || !result.success) {
      console.error('Erro ao sincronizar com backend:', (result as any)?.error);
    }
  }, [activeCollectionId]);

  const handleMarkAll = useCallback(() => {
    if (!activeCollectionId) return;
    setCollections(prev => {
      return prev.map(c => {
        if (c.id === activeCollectionId) {
          const visibleIds = filteredCollectionCards.map(fc => fc.id);
          const newOwnedIds = Array.from(new Set([...c.ownedCardIds, ...visibleIds]));
          const newQuantities = { ...(c.quantities || {}) };
          visibleIds.forEach(id => {
            if (!newQuantities[id]) newQuantities[id] = 1;
          });
          return { ...c, ownedCardIds: newOwnedIds, quantities: newQuantities };
        }
        return c;
      });
    });
  }, [activeCollectionId, filteredCollectionCards]);

  const handleUnmarkAll = useCallback(() => {
    if (!activeCollectionId) return;

    if (activeRightTab === 'owned') {
      setCollections(prev => prev.map(c => {
        if (c.id === activeCollectionId) {
          let idsToRemove: string[] = [];

          // Safe dependency usage
          if (isRangeFilterActive && rangeStartSet && rangeEndSet) {
            idsToRemove = currentOwnedCards.map(card => card.id);
          } else {
            idsToRemove = currentOwnedCards.map(card => card.id);
          }

          const newOwnedIds = c.ownedCardIds.filter(id => !idsToRemove.includes(id));
          const newQuantities = { ...(c.quantities || {}) };
          idsToRemove.forEach(id => delete newQuantities[id]);
          return { ...c, ownedCardIds: newOwnedIds, quantities: newQuantities };
        }
        return c;
      }));
    } else if (activeRightTab === 'print') {
      // Limpar printList da coleção ativa
      setCollections(prev => prev.map(c => {
        if (c.id === activeCollectionId) {
          return { ...c, printListIds: [] };
        }
        return c;
      }));
    }
  }, [activeCollectionId, activeRightTab, isRangeFilterActive, rangeStartSet, rangeEndSet, currentOwnedCards]);

  const handleUpdateCollectionCover = useCallback((collectionId: string, newCoverUrl: string) => {
    setCollections(prev => prev.map(c => {
      if (c.id === collectionId) {
        return { ...c, coverImage: newCoverUrl };
      }
      return c;
    }));
  }, []);

  const handleApplyRangeFilter = () => {
    if (!rangeStartSet || !rangeEndSet) return;
    setIsRangeFilterActive(true);
  };

  const clearRangeFilter = () => {
    setIsRangeFilterActive(false);
    setRangeStartSet('');
    setRangeEndSet('');
  };

  const toggleBuyList = useCallback(async (card: Card) => {
    if (!activeCollectionId) return;

    const isInList = activeCollection?.buyListIds?.includes(card.id);
    const action = isInList ? 'removeFromBuy' : 'addToBuy';

    // Optimistic update
    setCollections(prev => prev.map(c => {
      if (c.id === activeCollectionId) {
        const currentIds = c.buyListIds || [];
        const newIds = isInList
          ? currentIds.filter(id => id !== card.id)
          : [...currentIds, card.id];
        return { ...c, buyListIds: newIds };
      }
      return c;
    }));

    // Sync with backend
    await backendService.UpdateCollection({
      action: action as any,
      collectionId: activeCollectionId,
      cardId: card.id
    });
  }, [activeCollectionId, activeCollection]);

  const togglePrintList = useCallback(async (card: Card) => {
    if (!activeCollectionId) return;

    const isInList = activeCollection?.printListIds?.includes(card.id);
    const action = isInList ? 'removeFromPrint' : 'addToPrint';

    // Optimistic update
    setCollections(prev => prev.map(c => {
      if (c.id === activeCollectionId) {
        const currentIds = c.printListIds || [];
        const newIds = isInList
          ? currentIds.filter(id => id !== card.id)
          : [...currentIds, card.id];
        return { ...c, printListIds: newIds };
      }
      return c;
    }));

    // Sync with backend
    await backendService.UpdateCollection({
      action: action as any,
      collectionId: activeCollectionId,
      cardId: card.id
    });
  }, [activeCollectionId, activeCollection]);

  const handleManualReload = () => {
    clearSessionCache();
    setCollectionCards([]);
    setFilteredCollectionCards([]);
    setRefreshTrigger(prev => prev + 1);
  };

  const handlePriceUpdate = useCallback((cardId: string, newPrice: number) => {
    setCollectionCards(prev => {
      const index = prev.findIndex(c => c.id === cardId);
      if (index === -1) return prev;
      if (Math.abs(prev[index].priceBRL - newPrice) < 0.01) return prev;
      const newCards = [...prev];
      newCards[index] = { ...newCards[index], priceBRL: newPrice };
      return newCards;
    });
  }, []);

  const handleForceUpdatePrices = async () => {
    if (isUpdatingPrices || filteredCollectionCards.length === 0) return;
    setIsUpdatingPrices(true);
    setUpdateProgress(0);

    const cardsToUpdate = filteredCollectionCards;
    let processedCount = 0;

    const promises = cardsToUpdate.map(card =>
      getLigaMagicPrice(card.name, card.setName, true).then(newPrice => {
        processedCount++;
        setUpdateProgress(Math.round((processedCount / cardsToUpdate.length) * 100));
        if (newPrice > 0) handlePriceUpdate(card.id, newPrice);
      })
    );

    await Promise.all(promises);
    setTimeout(() => {
      setIsUpdatingPrices(false);
      setUpdateProgress(0);
    }, 500);
  };

  const handleDashboardImportClick = () => {
    importInputRef.current?.click();
  };

  const handleDashboardFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeCollectionId) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      if (!text) return;
      const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      const validCardMap = new Map<string, string>();
      filteredCollectionCards.forEach(c => validCardMap.set(c.name.toLowerCase(), c.id));

      let addedCount = 0;
      setCollections(prev => prev.map(col => {
        if (col.id === activeCollectionId) {
          const newOwnedIds = new Set(col.ownedCardIds);
          const newQuantities = { ...(col.quantities || {}), };
          lines.forEach(line => {
            const match = line.match(/^(\d+)?\s*(.+)$/);
            if (match) {
              const qty = match[1] ? parseInt(match[1]) : 1;
              const cardName = match[2].trim().toLowerCase();
              let targetId = validCardMap.get(cardName);
              if (targetId) {
                newOwnedIds.add(targetId);
                newQuantities[targetId] = (newQuantities[targetId] || 0) + qty;
                addedCount++;
              }
            }
          });
          return { ...col, ownedCardIds: Array.from(newOwnedIds), quantities: newQuantities };
        }
        return col;
      }));
      alert(`${addedCount} cartas importadas.`);
      if (importInputRef.current) importInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  const handleOpenGlobalList = (type: 'buy' | 'print', mode: 'standard' | 'ligamagic' = 'standard') => {
    setGlobalListType(type);
    setGlobalListInitialMode(mode);
    setIsGlobalListModalOpen(true);
    if (isMobileSidebarOpen) setIsMobileSidebarOpen(false);
  };

  const handleGlobalListRemove = (card: Card) => {
    if (globalListType === 'buy') toggleBuyList(card);
    else togglePrintList(card);
  };

  const handleGlobalListClear = () => {
    if (!activeCollectionId) return;

    if (globalListType === 'buy') {
      setCollections(prev => prev.map(c => {
        if (c.id === activeCollectionId) {
          return { ...c, buyListIds: [] };
        }
        return c;
      }));
    } else {
      setCollections(prev => prev.map(c => {
        if (c.id === activeCollectionId) {
          return { ...c, printListIds: [] };
        }
        return c;
      }));
    }
  }

  const openCreateModal = (mode: 'create' | 'import') => {
    setCreateModalMode(mode);
    setIsModalOpen(true);
  };

  const handleAdvancedFilterChange = (key: keyof AdvancedFilters, value: string) => {
    setAdvancedFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleClearAdvancedFilters = () => {
    setAdvancedFilters({ rarity: '', color: '', cmc: '', power: '', toughness: '' });
    setSearchTerm('');
    setSelectedSet(null);
    setIsRangeFilterActive(false);
    setRangeStartSet('');
    setRangeEndSet('');
    setShowAdvancedFilters(false);
  };

  const handleSaveSearch = () => setIsSaveSearchModalOpen(true);

  const confirmSaveSearch = async (name: string) => {
    const criteria = { searchTerm, selectedSet, advancedFilters: { ...advancedFilters } };

    // Criar pesquisa no backend
    const result = await backendService.createSearch({
      name,
      criteria
    });

    if (result && result.success) {
      const newSearch: SavedSearch = {
        id: (result as any).uuid?.toString() || Date.now().toString(),
        name,
        timestamp: Date.now(),
        criteria
      };
      setSavedSearches([...savedSearches, newSearch]);
    } else {
      setError((result as any)?.error || 'Erro ao salvar pesquisa');
    }

    setIsSaveSearchModalOpen(false);
  };

  const handleLoadSearch = (search: SavedSearch) => {
    setSearchTerm(search.criteria.searchTerm);
    setSelectedSet(search.criteria.selectedSet);
    setAdvancedFilters(search.criteria.advancedFilters);
    const hasAdvanced = Object.values(search.criteria.advancedFilters).some(v => v !== '');
    setShowAdvancedFilters(hasAdvanced);
    setActiveLeftTab('missing');
    setIsRangeFilterActive(false);
    setRangeStartSet('');
    setRangeEndSet('');
    setCurrentView('dashboard');
  };

  const handleDeleteSearch = (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: "Excluir Pesquisa",
      message: "Excluir esta pesquisa salva?",
      onConfirm: async () => {
        // Optimistic update
        setSavedSearches(savedSearches.filter(s => s.id !== id));
        handleClearAdvancedFilters();
        setConfirmModal(prev => ({ ...prev, isOpen: false }));

        // Sincronizar com backend
        const result = await backendService.deleteSearch({ searchId: id });
        if (!result || !result.success) {
          setError((result as any)?.error || 'Erro ao excluir pesquisa');
        }
      }
    });
  };

  const handleScanClick = () => {
    setIsScannerOpen(true);
  };

  const handleCardFound = (card: Card) => {
    handleAddCard(card);
    const isVisible = filteredCollectionCards.some(c => c.id === card.id);
    if (!isVisible) {
      alert(`Carta "${card.name}" (${card.set}) adicionada à coleção!`);
    }
  };

  const handleShareClick = () => {
    setIsBinderOpen(true);
  };

  // Logic to handle mobile bottom bar "Collections" button click
  const handleMobileCollectionsClick = () => {
    // If we are in profile, go back to dashboard
    if (currentView === 'profile') {
      setCurrentView('dashboard');
      return;
    }

    // If we are in "Owned" view (Trophy active), go back to "Checklist" (Add) view
    if (showMobileOwned) {
      setShowMobileOwned(false);
      return;
    }

    // Default: Open Sidebar
    setIsMobileSidebarOpen(true);
  };

  const middlePanelCards = activeLeftTab === 'missing' ? filteredCollectionCards : buyList;

  const rightPanelCards = useMemo(() => {
    if (activeRightTab === 'print') return printList;
    let cards = currentOwnedCards;
    if (isRangeFilterActive && rangeStartSet && rangeEndSet) {
      const startIdx = derivedSets.findIndex(s => s.code === rangeStartSet);
      const endIdx = derivedSets.findIndex(s => s.code === rangeEndSet);
      if (startIdx !== -1 && endIdx !== -1) {
        const min = Math.min(startIdx, endIdx);
        const max = Math.max(startIdx, endIdx);
        const allowedSets = new Set(derivedSets.slice(min, max + 1).map(s => s.code));
        cards = cards.filter(c => allowedSets.has(c.set));
      }
    }
    return cards;
  }, [activeRightTab, currentOwnedCards, printList, isRangeFilterActive, rangeStartSet, rangeEndSet, derivedSets]);

  const totalValue = useMemo(() => {
    if (activeRightTab === 'print') return 0;
    return rightPanelCards.reduce((acc, card) => {
      const qty = (activeCollection?.quantities || {})[card.id] || 1;
      return acc + (card.priceBRL * qty);
    }, 0);
  }, [rightPanelCards, activeCollection, activeRightTab]);



  // Render Welcome Screen if no active collection and not loading and not in profile view
  if (!activeCollectionId && currentView !== 'profile') {
    if (isLoadingCollections) {
      return (
        <div className="flex h-screen w-full bg-portal-bg text-gray-200 font-sans overflow-hidden items-center justify-center flex-col gap-4">
          <Loader2 size={48} className="animate-spin text-emerald-500" />
          {sharedId && <div className="text-emerald-500 font-bold">Carregando coleção compartilhada...</div>}
        </div>
      );
    }

    // Error state for shared link
    if (sharedId) {
      return (
        <div className="flex h-screen w-full bg-portal-bg text-gray-200 font-sans items-center justify-center p-4">
          <div className="bg-red-900/20 border border-red-500/50 p-8 rounded-xl max-w-md text-center">
            <AlertTriangle size={48} className="text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Coleção não encontrada</h2>
            <p className="text-gray-400 mb-6">O link de compartilhamento pode estar expirado ou incorreto.</p>
            <button onClick={() => { window.location.href = '/'; }} className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-colors">
              Ir para Início
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="flex h-screen w-full bg-portal-bg text-gray-200 font-sans overflow-hidden">
        <CreateCollectionModal isOpen={isModalOpen} initialMode={createModalMode} onClose={() => setIsModalOpen(false)} onCreate={handleCreateCollection} />

        {/* Only show Welcome Screen if modal is not the primary interaction (e.g. if we have collections) OR if existing collections are 0 but we want to show the background behind modal */}
        {/* Force Update Trigger */}
        <WelcomeScreen
          user={userProfile}
          collections={collections}
          onSelectCollection={(id) => setActiveCollectionId(id)}
          onCreateCollection={() => openCreateModal('create')}
        />

        <div className="absolute top-4 right-4 z-50">
          <button onClick={onExit} className="flex items-center gap-2 px-4 py-2 bg-black/60 hover:bg-red-900/40 text-gray-400 hover:text-red-400 rounded-lg border border-gray-800 transition-colors">
            <LogOut size={16} /> <span className="text-sm font-bold">Sair</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-portal-bg text-gray-200 font-sans overflow-hidden">
      <DashboardSidebar
        collections={collections}
        activeCollectionId={activeCollectionId}
        onSelectCollection={(id) => { setActiveCollectionId(id); setCurrentView('dashboard'); }}
        onDeleteCollection={handleDeleteCollection}
        onCreateCollection={() => openCreateModal('create')}
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
        onOpenGlobalList={(type) => handleOpenGlobalList(type)}
        buyListCount={buyList.length}
        printListCount={printList.length}
        savedSearches={savedSearches}
        onSaveSearch={handleSaveSearch}
        onLoadSearch={handleLoadSearch}
        onDeleteSearch={handleDeleteSearch}
        onProfileClick={() => { setCurrentView('profile'); setIsMobileSidebarOpen(false); }}
        onLogout={onExit}
        user={userProfile}
      />

      <input type="file" ref={importInputRef} onChange={handleDashboardFileChange} style={{ display: 'none' }} accept=".txt,.csv" />

      {/* Modals */}
      <ScannerModal isOpen={isScannerOpen} onClose={() => setIsScannerOpen(false)} onCardFound={handleCardFound} />

      {/* Binder View Modal/Page */}
      {isBinderOpen && activeCollection && (
        <BinderView
          cards={currentOwnedCards}
          collectionName={activeCollection.name}
          onClose={() => setIsBinderOpen(false)}
          onCardContextMenu={(card) => setSelectedCardDetails(card)}
          coverImage={activeCollection.coverImage}
          onUpdateCover={(url) => handleUpdateCollectionCover(activeCollection.id, url)}
          collectionId={activeCollection.id}
          isSharedMode={!!sharedId}
        />
      )}

      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}></div>
          <div className="relative bg-[#020604] border border-red-900/50 rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="bg-red-900/20 p-4 rounded-full border border-red-500/30">
                <AlertTriangle className="text-red-500" size={32} />
              </div>
              <h3 className="text-xl font-bold text-white">{confirmModal.title}</h3>
              <p className="text-sm text-gray-400">{confirmModal.message}</p>
              <div className="flex gap-3 w-full pt-4">
                <button
                  onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                  className="flex-1 py-3 rounded-lg border border-gray-800 text-gray-400 hover:text-white hover:bg-gray-800 font-bold transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmModal.onConfirm}
                  className="flex-1 py-3 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold transition-all shadow-lg shadow-red-900/20"
                >
                  Excluir
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <SaveSearchModal isOpen={isSaveSearchModalOpen} onClose={() => setIsSaveSearchModalOpen(false)} onSave={confirmSaveSearch} defaultName={`Pesquisa ${savedSearches.length + 1}`} />
      <CreateCollectionModal isOpen={isModalOpen} initialMode={createModalMode} onClose={() => setIsModalOpen(false)} onCreate={handleCreateCollection} />
      <CardDetailsModal card={selectedCardDetails} isOpen={!!selectedCardDetails} onClose={() => setSelectedCardDetails(null)} />
      <ExportCollectionModal isOpen={isExportModalOpen} onClose={() => setIsExportModalOpen(false)} collectionName={activeCollection?.name || 'Minha Coleção'} ownedCards={currentOwnedCards} missingCards={missingCards} printList={printList} />
      <GlobalListModal isOpen={isGlobalListModalOpen} onClose={() => setIsGlobalListModalOpen(false)} list={globalListType === 'buy' ? buyList : printList} type={globalListType} initialExportMode={globalListInitialMode} onClearList={handleGlobalListClear} onRemoveItem={handleGlobalListRemove} />

      {/* Error Modal Global */}
      {error && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 animate-in fade-in duration-200">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/85 backdrop-blur-md"
            onClick={() => setError(null)}
          />

          {/* Error Card */}
          <div className="relative w-full max-w-md animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
            {/* Glow Effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-red-600 via-red-500 to-orange-500 rounded-3xl blur-xl opacity-30 animate-pulse" />

            <div className="relative bg-gradient-to-br from-[#0d0505] via-[#100707] to-[#0a0404] border border-red-900/40 rounded-2xl overflow-hidden shadow-2xl">
              {/* Top Glow Line */}
              <div className="h-1 bg-gradient-to-r from-red-600 via-orange-500 to-red-600" />

              {/* Close Button */}
              <button
                onClick={() => setError(null)}
                className="absolute top-5 right-5 p-2 text-red-400/50 hover:text-white hover:bg-red-500/20 rounded-xl transition-all duration-200 group z-10"
              >
                <X size={20} className="group-hover:rotate-90 transition-transform duration-200" />
              </button>

              <div className="p-8 pt-10">
                {/* Icon Container */}
                <div className="flex justify-center mb-6">
                  <div className="relative">
                    <div className="absolute inset-0 bg-red-500 rounded-full blur-2xl opacity-25 animate-pulse" />
                    <div className="relative w-20 h-20 bg-gradient-to-br from-red-900/60 to-red-950/80 rounded-2xl flex items-center justify-center border border-red-700/40 shadow-xl shadow-red-900/20 rotate-3">
                      <AlertTriangle className="text-red-400" size={36} strokeWidth={2} />
                    </div>
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-2xl font-black text-center text-white mb-3 tracking-tight">
                  Ops! Algo deu errado
                </h3>

                {/* Subtitle */}
                <p className="text-sm text-gray-500 text-center mb-5">
                  Encontramos um problema ao processar sua solicitação
                </p>

                {/* Error Message Box */}
                <div className="relative bg-red-950/40 border border-red-900/30 rounded-xl p-5 mb-6 overflow-hidden">
                  {/* Left accent line */}
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-red-500 via-orange-500 to-red-600" />
                  <p className="text-sm text-red-200/90 text-center leading-relaxed pl-3">
                    {error}
                  </p>
                </div>

                {/* Action Button */}
                <button
                  onClick={() => setError(null)}
                  className="w-full py-4 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-bold rounded-xl shadow-lg shadow-red-900/30 transition-all duration-200 hover:shadow-red-800/50 hover:-translate-y-0.5 flex items-center justify-center gap-2 group"
                >
                  <span>Entendi</span>
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation */}
      <MobileBottomBar
        onOpenCollections={handleMobileCollectionsClick}
        onOpenList={() => handleOpenGlobalList('buy')}
        onShare={handleShareClick}
        onOpenProfile={() => { setCurrentView('profile'); setIsMobileSidebarOpen(false); }}
        onToggleOwned={() => setShowMobileOwned(!showMobileOwned)}
        ownedCount={currentOwnedCards.length}
        totalValue={totalValue}
        activeTab={currentView === 'profile' ? 'profile' : (showAdvancedFilters ? undefined : undefined)}
        isOwnedViewActive={showMobileOwned}
      />

      {/* Floating Scanner Button - Bottom Right */}
      {currentView === 'dashboard' && (
        <button
          onClick={handleScanClick}
          className="fixed bottom-24 sm:bottom-6 right-4 sm:right-6 z-[160] bg-emerald-600 hover:bg-emerald-500 text-white p-4 rounded-full shadow-lg shadow-emerald-900/30 transition-transform hover:scale-105"
          title="Escanear Carta"
        >
          <Camera size={24} />
        </button>
      )}

      <main className="flex-1 lg:ml-64 h-screen flex flex-col bg-portal-bg overflow-hidden relative w-full pb-20 lg:pb-0">
        <header className="h-auto py-4 lg:py-0 lg:h-24 bg-black/20 border-b border-portal-border flex flex-col md:flex-row items-start md:items-center justify-between px-4 lg:px-8 shrink-0 gap-4">
          <div className="flex items-center gap-4 lg:gap-6 w-full md:w-auto">
            {/* Mobile Header: Burger + Title + Actions */}
            <div className="flex md:hidden items-center justify-between w-full">
              <div className="flex items-center gap-3">
                <button onClick={() => setIsMobileSidebarOpen(true)} className="p-2 text-gray-400 hover:text-white bg-gray-800 rounded-lg"><Menu size={20} /></button>
                <div>
                  <div className="font-bold text-white text-lg leading-tight uppercase tracking-tight">Portal de Coleções</div>
                  <div className="text-[10px] text-gray-500 font-bold">MTG</div>
                </div>
              </div>
              <div className="relative">
                <button onClick={() => setIsMobileToolsOpen(!isMobileToolsOpen)} className="p-2 text-gray-300 bg-gray-800 rounded-lg border border-gray-700 hover:text-white flex items-center gap-2">
                  <Wrench size={18} />
                </button>

                {/* Tools Dropdown for Mobile */}
                {isMobileToolsOpen && (
                  <>
                    <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setIsMobileToolsOpen(false)}></div>
                    <div className="absolute right-0 top-12 z-50 w-48 bg-[#0a1410] border border-gray-700 rounded-lg shadow-xl p-2 flex flex-col gap-1 animate-in fade-in zoom-in-95">
                      <button onClick={() => { setIsMobileToolsOpen(false); handleManualReload(); }} className="flex items-center gap-2 p-2 text-sm text-blue-400 hover:bg-gray-800 rounded text-left"><RefreshCw size={14} /> Recarregar</button>
                      <button onClick={() => { setIsMobileToolsOpen(false); handleShareClick(); }} className="flex items-center gap-2 p-2 text-sm text-amber-500 hover:bg-gray-800 rounded text-left"><Share2 size={14} /> Compartilhar</button>
                      <button onClick={() => { setIsMobileToolsOpen(false); handleSaveSearch(); }} className="flex items-center gap-2 p-2 text-sm text-emerald-500 hover:bg-gray-800 rounded text-left"><Save size={14} /> Salvar Pesquisa</button>
                      <div className="h-px bg-gray-800 my-1"></div>
                      <button onClick={() => { setIsMobileToolsOpen(false); handleDashboardImportClick(); }} className="flex items-center gap-2 p-2 text-sm text-gray-300 hover:bg-gray-800 rounded text-left"><Download size={14} /> Importar</button>
                      <button onClick={() => { setIsMobileToolsOpen(false); setIsExportModalOpen(true); }} className="flex items-center gap-2 p-2 text-sm text-gray-300 hover:bg-gray-800 rounded text-left"><Upload size={14} /> Exportar</button>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="hidden md:block p-3 bg-portal-surface rounded-full border border-gray-800 shadow-md"><Settings className="text-portal-accent" size={28} /></div>

            <div className="hidden md:block flex-1 md:flex-none">
              {currentView === 'profile' ? (
                <>
                  <h2 className="text-xl lg:text-2xl font-bold text-white leading-tight truncate">Meu Perfil</h2>
                  <div className="text-xs lg:text-sm text-gray-500 mt-1">Gerencie sua conta e assinatura</div>
                </>
              ) : (
                <>
                  <h2 className="text-xl lg:text-2xl font-bold text-white leading-tight truncate">{activeCollection?.name || "Selecione uma Coleção"}</h2>
                  <div className="text-xs lg:text-sm text-gray-500 mt-1 truncate max-w-[200px] lg:max-w-none">
                    Criado: {activeCollection ? new Date(activeCollection.createdAt).toLocaleDateString() : "-"} •
                    Query: <span className="text-gray-600 font-mono text-xs hidden lg:inline">{activeCollection?.filterValue || "-"}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {currentView === 'dashboard' && (
            <div className="hidden xl:flex gap-10">
              <StatsCounter label="Míticas" count={currentOwnedCards.filter(c => c.rarity === 'Mythic Rare').length} />
              <StatsCounter label="Raras" count={currentOwnedCards.filter(c => c.rarity === 'Rare').length} />
              <StatsCounter label="Incomuns" count={currentOwnedCards.filter(c => c.rarity === 'Uncommon').length} />
              <StatsCounter label="Comuns" count={currentOwnedCards.filter(c => c.rarity === 'Common').length} />
            </div>
          )}

          <div className="hidden md:flex gap-2 lg:gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
            {currentView === 'profile' ? (
              <>
                <button onClick={() => setCurrentView('dashboard')} className="flex items-center gap-1 bg-gray-800 text-gray-300 border border-gray-700 px-3 py-2 lg:px-4 rounded-md text-xs font-bold hover:text-white hover:bg-gray-700 transition-colors whitespace-nowrap"><ArrowLeft size={14} /> <span className="hidden sm:inline">VOLTAR</span></button>
                <button className="flex items-center gap-1 bg-red-900/30 text-red-400 border border-red-800/50 px-3 py-2 lg:px-4 rounded-md text-xs font-bold hover:bg-red-900/50 transition-colors whitespace-nowrap" onClick={onExit}><LogOut size={14} /> <span className="hidden sm:inline">SAIR</span></button>
              </>
            ) : (
              <>
                <button onClick={handleManualReload} className="flex items-center gap-1 bg-blue-900/30 text-blue-400 border border-blue-800/50 px-3 py-2 lg:px-4 rounded-md text-xs font-bold hover:bg-blue-900/50 transition-colors whitespace-nowrap"><RefreshCw size={14} /> <span className="hidden sm:inline">RECARREGAR</span></button>
                <button onClick={handleShareClick} className="flex items-center gap-1 bg-amber-900/40 text-amber-500 border border-amber-800/50 px-3 py-2 lg:px-4 rounded-md text-xs font-bold hover:bg-amber-900/60 hover:text-amber-400 transition-colors whitespace-nowrap"><Share2 size={14} /> <span className="hidden sm:inline">COMPARTILHAR</span></button>
                <button onClick={handleSaveSearch} className="flex items-center gap-1 bg-portal-accent text-black px-3 py-2 lg:px-4 rounded-md text-xs font-bold hover:bg-portal-accentHover shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all whitespace-nowrap"><Save size={14} /> <span className="hidden sm:inline">SALVAR</span></button>
                <button onClick={() => setIsExportModalOpen(true)} className="flex items-center gap-1 bg-gray-800 text-gray-400 border border-gray-700 px-3 py-2 lg:px-4 rounded-md text-xs font-bold hover:text-white transition-colors whitespace-nowrap"><Upload size={14} className="text-blue-400" /> <span className="hidden sm:inline">EXPORTAR</span></button>
                <button onClick={handleDashboardImportClick} className="flex items-center gap-1 bg-gray-800 text-gray-400 border border-gray-700 px-3 py-2 lg:px-4 rounded-md text-xs font-bold hover:text-white transition-colors whitespace-nowrap"><Download size={14} className="text-red-400" /> <span className="hidden sm:inline">IMPORTAR</span></button>
                <button className="flex items-center gap-1 bg-gray-800 text-gray-400 border border-gray-700 px-3 py-2 lg:px-4 rounded-md text-xs font-bold hover:text-white transition-colors whitespace-nowrap" onClick={onExit}><Home size={14} /> <span className="hidden sm:inline">INÍCIO</span></button>
              </>
            )}
          </div>
        </header>

        {currentView === 'profile' ? (
          <UserProfile
            user={userProfile}
            onUpdateProfile={handleUpdateProfile}
            collections={collections}
            totalCardsOwned={totalCardsOwned}
          />
        ) : (
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            <div className="px-4 lg:px-8 py-4 lg:py-6 bg-portal-bg shrink-0">
              <div className="flex justify-between items-end mb-2">
                <h3 className="flex items-center gap-3 font-bold text-sm lg:text-base text-white">
                  <div className="w-5 h-5 rounded-full border-2 border-pink-500 flex items-center justify-center shadow-[0_0_10px_rgba(236,72,153,0.4)]"><div className="w-2 h-2 bg-pink-500 rounded-full"></div></div>
                  Progresso <span className="hidden sm:inline">da Coleção</span> {selectedSet ? <span className="text-gray-400 text-xs font-normal ml-1">(Filtrado)</span> : ''}
                </h3>
                <span className="text-emerald-500 font-bold text-sm lg:text-base">{currentOwnedCards.length}/{filteredCollectionCards.length}<span className="ml-2 text-gray-500 font-normal text-xs lg:text-sm">({filteredCollectionCards.length > 0 ? Math.round((currentOwnedCards.length / filteredCollectionCards.length) * 100) : 0}%)</span></span>
              </div>
              <div className="h-3 lg:h-5 bg-gray-900 rounded-full border border-gray-800 overflow-hidden relative shadow-inner">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/10 to-emerald-900/30 w-full h-full"></div>
                <div className="h-full bg-emerald-500 shadow-[0_0_15px_#10b981] transition-all duration-500 ease-out" style={{ width: `${filteredCollectionCards.length > 0 ? (currentOwnedCards.length / filteredCollectionCards.length) * 100 : 0}%` }}></div>
              </div>
            </div>
            <div className={`px-4 lg:px-8 ${showAdvancedFilters ? 'pb-2' : 'pb-6'} shrink-0 transition-all duration-300`}>
              <div className="bg-portal-panel border border-portal-border rounded-xl p-3 lg:p-4 flex flex-col md:flex-row flex-wrap items-center gap-3 lg:gap-4 shadow-lg">
                <div className="flex gap-2 w-full md:w-auto flex-1">
                  <div className="relative flex-1 w-full md:min-w-[240px]">
                    <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-portal-accent" />
                    <input type="text" placeholder="Filtrar nesta lista..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-black/50 border border-gray-700 rounded-lg text-sm py-2.5 pl-11 pr-4 focus:border-portal-accent focus:ring-1 focus:ring-portal-accent focus:outline-none text-white placeholder-gray-600 transition-all" />

                    {/* Mobile Filter Toggle inside search bar area */}
                    <button onClick={() => setShowAdvancedFilters(!showAdvancedFilters)} className="md:hidden absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 bg-gray-800 rounded-md border border-gray-700">
                      <Filter size={16} />
                    </button>
                  </div>
                  {/* Mobile Print Button */}
                  <button onClick={() => handleOpenGlobalList('print')} className="md:hidden p-2.5 text-purple-400 bg-gray-900/50 border border-gray-700 rounded-lg hover:text-white hover:bg-gray-800 transition-colors">
                    <Printer size={20} />
                  </button>
                </div>

                <div className="relative w-full md:w-48 hidden md:block">
                  <select className="w-full bg-black/50 border border-gray-700 rounded-lg text-sm py-2.5 px-4 text-white appearance-none focus:border-portal-accent outline-none cursor-pointer hover:border-gray-600 transition-colors"><option>Todos os Sets</option></select>
                  <ArrowDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                </div>
                <div className="hidden md:block h-8 w-px bg-gray-700 mx-2"></div>
                <div className="hidden md:flex gap-2 w-full md:w-auto">
                  <button onClick={() => setShowAdvancedFilters(!showAdvancedFilters)} className={`flex-1 md:flex-none flex items-center justify-center gap-2 text-xs font-bold px-4 py-2.5 rounded-lg transition-colors border ${showAdvancedFilters ? 'bg-pink-900/20 text-pink-400 border-pink-900/50' : 'bg-gray-800/50 hover:bg-gray-700 text-pink-400 border-gray-700/50'}`}><Filter size={14} /> Filtros</button>
                  <button onClick={handleClearAdvancedFilters} className="flex-1 md:flex-none flex items-center justify-center gap-2 text-xs font-bold bg-gray-800/50 hover:bg-gray-700 text-gray-400 border border-gray-700/50 px-4 py-2.5 rounded-lg transition-colors"><Trash2 size={14} /> Limpar</button>
                </div>
                <div className="hidden md:block ml-auto text-sm font-bold text-gray-500 w-full md:w-auto text-right">Total: <span className="text-white ml-1">{filteredCollectionCards.length}</span></div>
              </div>
            </div>
            {showAdvancedFilters && <AdvancedFilterBar filters={advancedFilters} onFilterChange={handleAdvancedFilterChange} onClear={handleClearAdvancedFilters} />}
            <div className="px-4 lg:px-8 pb-6 shrink-0 gap-3 overflow-x-auto scrollbar-hide hidden md:flex">
              <ToolbarButton icon={<Scan size={16} />} label="ESCANEAR" onClick={handleScanClick} />
              <ToolbarButton icon={<ListIcon size={16} />} label="LISTA" onClick={() => handleOpenGlobalList('buy', 'standard')} />
              <ToolbarButton icon={<ExternalLink size={16} className="text-orange-400" />} label="COMPRAR NA LIGA" onClick={() => handleOpenGlobalList('buy', 'ligamagic')} />
              <ToolbarButton icon={isUpdatingPrices ? <Loader2 size={16} className="animate-spin text-white" /> : <RefreshCw size={16} className="text-emerald-400" />} label={isUpdatingPrices ? `ATUALIZANDO ${updateProgress}%` : "ATUALIZAR PREÇOS"} onClick={handleForceUpdatePrices} disabled={isUpdatingPrices} progress={updateProgress} />
            </div>

            {/* Main Content Area */}
            <div className="flex-1 px-4 lg:px-8 pb-8 flex flex-col lg:flex-row gap-8 min-h-0 overflow-y-auto lg:overflow-hidden">

              {/* Set List (Sidebar) - Hidden on Mobile */}
              <div className="hidden lg:flex w-full lg:w-64 h-64 lg:h-full bg-portal-panel border border-portal-border rounded-xl flex-col overflow-hidden shadow-2xl shrink-0 relative">
                {setColumnBg && <div className="absolute inset-0 z-0"><img src={setColumnBg} alt="Set BG" className="w-full h-full object-cover opacity-10 grayscale mix-blend-luminosity" /><div className="absolute inset-0 bg-gradient-to-b from-portal-panel/80 via-portal-panel/50 to-portal-panel"></div></div>}
                <div className="h-12 bg-black/40 border-b border-gray-800 flex items-center px-4 justify-between shrink-0 relative z-10"><div className="flex items-center gap-2 text-sm font-bold text-gray-200"><Layers size={16} /> Coleções <span className="bg-gray-800 text-gray-400 px-1.5 py-0.5 rounded text-[10px]">{derivedSets.length} sets</span></div><button onClick={() => setSetsSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')} className="text-gray-500 hover:text-white transition-colors">{setsSortOrder === 'desc' ? <ArrowDown size={16} /> : <ArrowUp size={16} />}</button></div>
                <div className="flex-1 overflow-y-auto p-2 space-y-2 scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent relative z-10">{derivedSets.length === 0 && !isLoading && <div className="text-center p-4 text-xs text-gray-500 italic">Nenhum set encontrado.</div>}{derivedSets.map((set) => (<button key={set.code} onClick={() => toggleSet(set.code)} className={`w-full text-left p-2.5 rounded-lg border transition-all duration-200 flex flex-col gap-1.5 group ${selectedSet === set.code ? 'bg-emerald-900/20 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'bg-black/40 border-gray-800/50 hover:bg-black/60 hover:border-gray-700'}`}><div className="flex items-center gap-3"><div className={`w-6 h-6 rounded-full flex items-center justify-center border shrink-0 ${selectedSet === set.code ? 'border-emerald-500 bg-emerald-950' : 'border-gray-700 bg-gray-900 group-hover:border-gray-500'}`}><img src={`https://svgs.scryfall.io/sets/${set.code.toLowerCase()}.svg`} alt={set.code} className={`w-3.5 h-3.5 ${selectedSet === set.code ? 'invert-[.5] sepia-[1] saturate-[30] hue-rotate-[100deg] brightness-[1.2]' : 'invert opacity-60 group-hover:opacity-100'}`} onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement?.classList.add('fallback-icon'); }} /></div><div className="flex-1 min-w-0"><div className={`text-xs font-bold truncate ${selectedSet === set.code ? 'text-white' : 'text-gray-400 group-hover:text-gray-200'}`}>{set.name}</div><div className="flex justify-between items-center mt-1"><span className="text-[10px] text-gray-600 font-mono">{set.year !== '????' ? set.year : ''}</span><span className="text-[10px] text-gray-500">{set.owned}/{set.total}</span></div></div></div></button>))}</div>
              </div>

              {/* Middle Panel - Checklist/Main List (Visible on Mobile) */}
              <div className="flex-1 h-full bg-transparent lg:bg-portal-panel lg:border lg:border-portal-border lg:rounded-xl flex flex-col overflow-hidden lg:shadow-2xl shrink-0">
                <div className="hidden lg:flex h-12 bg-black/40 border-b border-gray-800 items-center px-5 justify-between shrink-0"><div className="flex items-center gap-4 h-full overflow-x-auto scrollbar-hide"><button onClick={() => setActiveLeftTab('missing')} className={`h-full flex items-center gap-2.5 text-sm font-bold border-b-2 px-3 transition-colors whitespace-nowrap ${activeLeftTab === 'missing' ? 'text-red-500 border-red-500 bg-red-500/5' : 'text-gray-500 border-transparent hover:text-gray-300 hover:border-gray-700'}`}><X size={16} /> Checklist / Faltantes <span className={`px-2 py-0.5 rounded text-[10px] ml-1 ${activeLeftTab === 'missing' ? 'bg-red-900/50 text-red-300' : 'bg-gray-800 text-gray-500'}`}>{filteredCollectionCards.length}</span></button><button onClick={() => setActiveLeftTab('buy')} className={`h-full flex items-center gap-2.5 text-sm font-bold border-b-2 px-3 transition-colors whitespace-nowrap ${activeLeftTab === 'buy' ? 'text-blue-500 border-blue-500 bg-blue-500/5' : 'text-gray-500 border-transparent hover:text-gray-300 hover:border-gray-700'}`}><ShoppingCart size={16} /> Listada <span className={`px-2 py-0.5 rounded text-[10px] ml-1 ${activeLeftTab === 'buy' ? 'bg-blue-900/50 text-blue-300' : 'bg-gray-800 text-gray-500'}`}>{buyList.length}</span></button></div><div className="flex gap-2.5">{activeLeftTab === 'missing' && (<button onClick={handleMarkAll} className="text-[10px] bg-emerald-900/30 text-emerald-500 border border-emerald-900 hover:bg-emerald-900/50 px-3 py-1 rounded flex items-center gap-1.5 transition-colors font-bold whitespace-nowrap"><Check size={12} /> MARCAR TODAS</button>)}</div></div>

                {/* Mobile View Title for this section */}
                <div className="lg:hidden pb-2 px-1 flex justify-between items-center">
                  <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                    {showMobileOwned ? 'Minha Coleção (Possuídas)' : (activeLeftTab === 'missing' ? 'Cartas da Coleção' : 'Lista de Compras')}
                  </div>
                  <div className="text-xs text-emerald-500 font-mono">
                    {(showMobileOwned ? rightPanelCards : middlePanelCards).length} items
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-0 lg:p-6 scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent">
                  {isLoading ? (
                    <div className="flex items-center justify-center h-full text-gray-500 gap-2"><Loader2 className="animate-spin" /> Carregando...</div>
                  ) : (showMobileOwned ? rightPanelCards : middlePanelCards).length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-500 flex-col gap-2">
                      {showMobileOwned ? (
                        <><Check size={40} className="text-gray-700" /><p className="text-sm font-medium text-gray-400 mt-2">Você ainda não marcou nenhuma carta.</p></>
                      ) : (
                        activeLeftTab === 'missing' ? <Search size={40} className="text-gray-700" /> : <ShoppingCart size={40} className="text-gray-700" />
                      )}
                      {!showMobileOwned && <p className="text-sm font-medium text-gray-400 mt-2">Nenhuma carta aparece aqui</p>}
                    </div>
                  ) : (
                    <div className={`grid ${showMobileOwned ? 'grid-cols-2 gap-2' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 lg:gap-6'} pb-20 lg:pb-0`}>
                      {(showMobileOwned ? rightPanelCards : middlePanelCards).map(card => (
                        <DashboardCard
                          key={card.id}
                          card={card}
                          status={activeCollection?.ownedCardIds?.includes(card.id) ? 'owned' : 'missing'}
                          quantity={showMobileOwned ? ((activeCollection?.quantities || {})[card.id] || 1) : 1}
                          onClick={showMobileOwned ? handleRemoveCard : handleAddCard}
                          onUpdateQuantity={handleUpdateQuantity}
                          onToggleBuyList={toggleBuyList}
                          onTogglePrintList={togglePrintList}
                          onInfoClick={(c) => setSelectedCardDetails(c)}
                          isInBuyList={buyList.some(c => c.id === card.id)}
                          isInPrintList={printList.some(c => c.id === card.id)}
                          onPriceUpdate={handlePriceUpdate}
                          viewMode={showMobileOwned ? 'grid' : 'list'}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Panel (Owned) - Hidden on Mobile unless navigated? Actually, we'll keep it hidden on mobile and rely on bottom stats */}
              <div className="hidden lg:flex flex-1 h-full bg-portal-panel border border-portal-border rounded-xl flex-col overflow-hidden shadow-2xl shrink-0">
                <div className="h-12 bg-black/40 border-b border-gray-800 flex items-center px-5 justify-between shrink-0"><div className="flex items-center gap-4 h-full overflow-x-auto scrollbar-hide"><button onClick={() => setActiveRightTab('owned')} className={`h-full flex items-center gap-2.5 text-sm font-bold border-b-2 px-3 transition-colors whitespace-nowrap ${activeRightTab === 'owned' ? 'text-emerald-500 border-emerald-500 bg-emerald-500/5' : 'text-gray-500 border-transparent hover:text-gray-300 hover:border-gray-700'}`}><Check size={16} /> Possuídas <span className={`px-2 py-0.5 rounded text-[10px] ml-1 ${activeRightTab === 'owned' ? 'bg-emerald-900/50 text-emerald-300' : 'bg-gray-800 text-gray-500'}`}>{rightPanelCards.length}</span></button><button onClick={() => setActiveRightTab('print')} className={`h-full flex items-center gap-2.5 text-sm font-bold border-b-2 px-3 transition-colors whitespace-nowrap ${activeRightTab === 'print' ? 'text-purple-500 border-purple-500 bg-purple-500/5' : 'text-gray-500 border-transparent hover:text-gray-300 hover:border-gray-700'}`}><Printer size={16} /> Impressão <span className={`px-2 py-0.5 rounded text-[10px] ml-1 ${activeRightTab === 'print' ? 'bg-purple-900/50 text-purple-300' : 'bg-gray-800 text-gray-500'}`}>{printList.length}</span></button></div><div className="flex gap-2.5">{activeRightTab === 'owned' && (<button onClick={handleUnmarkAll} className="text-[10px] bg-red-900/30 text-red-500 border border-red-900 hover:bg-red-900/50 px-3 py-1 rounded flex items-center gap-1.5 transition-colors font-bold whitespace-nowrap"><X size={12} /> LIMPAR</button>)}</div></div>
                {activeRightTab === 'owned' && (<div className="bg-black/20 border-b border-gray-800 px-5 py-3 flex flex-wrap items-center justify-between gap-3 relative"><div className="flex items-center gap-2 lg:gap-3 text-xs w-full sm:w-auto overflow-x-auto scrollbar-hide"><span className="text-gray-400 whitespace-nowrap hidden sm:inline">Marcar Edições:</span><select value={rangeStartSet} onChange={(e) => setRangeStartSet(e.target.value)} className="bg-black border border-gray-700 text-gray-300 rounded px-2 py-1 text-xs outline-none focus:border-emerald-500 max-w-[100px] lg:max-w-[120px]"><option value="">Início</option>{derivedSets.map(set => (<option key={set.code} value={set.code}>{set.name} ({set.code})</option>))}</select><span className="text-gray-500">até</span><select value={rangeEndSet} onChange={(e) => setRangeEndSet(e.target.value)} className="bg-black border border-gray-700 text-gray-300 rounded px-2 py-1 text-xs outline-none focus:border-emerald-500 max-w-[100px] lg:max-w-[120px]"><option value="">Fim</option>{derivedSets.map(set => (<option key={set.code} value={set.code}>{set.name} ({set.code})</option>))}</select></div><div className="flex items-center gap-4 ml-auto sm:ml-0"><div className="text-right hidden sm:block"><div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Valor Total</div><div className="text-emerald-400 font-mono font-bold text-sm">R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div></div><div className="flex items-center gap-2">{isRangeFilterActive && (<button onClick={clearRangeFilter} className="text-[10px] bg-gray-800 text-gray-400 border border-gray-700 px-2 py-1 rounded hover:bg-gray-700 hover:text-white transition-colors whitespace-nowrap">Limpar</button>)}<button onClick={handleApplyRangeFilter} className={`text-[10px] px-3 py-1 rounded flex items-center gap-1.5 font-bold transition-colors whitespace-nowrap ${isRangeFilterActive ? 'bg-pink-900/50 text-pink-300 border border-pink-500' : 'bg-pink-900/20 text-pink-400 border-pink-900/50 hover:bg-pink-900/40'}`}><div className="w-2 h-2 rounded-full bg-pink-500"></div> MARCAR</button></div></div></div>)}
                <div className="flex-1 overflow-y-auto p-4 lg:p-6 scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent"><div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">{rightPanelCards.length === 0 ? (<div className="col-span-full flex flex-col items-center justify-center text-gray-500 h-40 gap-2">{activeRightTab === 'owned' ? <div className="p-3 bg-gray-900 rounded-full"><Check size={24} className="text-gray-700" /></div> : <div className="p-3 bg-gray-900 rounded-full"><Printer size={24} className="text-gray-700" /></div>}<p className="text-sm">{activeRightTab === 'owned' ? "Vazio." : "Lista vazia."}</p></div>) : (rightPanelCards.map(card => (<DashboardCard key={card.id} card={card} status={activeCollection?.ownedCardIds?.includes(card.id) ? 'owned' : 'missing'} quantity={(activeCollection?.quantities || {})[card.id] || 1} onUpdateQuantity={handleUpdateQuantity} onClick={handleRemoveCard} onToggleBuyList={toggleBuyList} onTogglePrintList={togglePrintList} onInfoClick={(c) => setSelectedCardDetails(c)} isInBuyList={buyList.some(c => c.id === card.id)} isInPrintList={printList.some(c => c.id === card.id)} onPriceUpdate={handlePriceUpdate} />)))}</div></div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

const App: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [sharedCollectionId, setSharedCollectionId] = useState<string | null>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('share');
  });

  useEffect(() => {
    const savedUser = localStorage.getItem('portal_mtg_user_session');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('portal_mtg_user_session');
      }
    }
  }, []);

  const handleAuth = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const handleAuthSuccess = (userData: any) => {
    setUser(userData);
    localStorage.setItem('portal_mtg_user_session', JSON.stringify(userData));
    setAuthModalOpen(false);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('portal_mtg_user_session');
  };

  return (
    <>
      {user ? (
        <Dashboard user={user} onExit={handleLogout} />
      ) : sharedCollectionId ? (
        <Dashboard
          user={{ name: 'Visitante', email: '', isGuest: true }}
          onExit={() => { setSharedCollectionId(null); window.history.pushState({}, '', window.location.pathname); }}
          sharedId={sharedCollectionId}
        />
      ) : (
        <LandingPage onAuth={handleAuth} />
      )}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authMode}
        onAuthSuccess={handleAuthSuccess}
      />
    </>
  );
};

export default App;
