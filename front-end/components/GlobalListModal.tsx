
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Card } from '../types';
import { X, Copy, Check, ShoppingCart, Printer, Trash2, Filter, ExternalLink, Calculator, Grid3X3, List, ZoomIn, ZoomOut, Maximize, Plus, Minus } from 'lucide-react';
import { mapScryfallToLigaMagic } from '../utils/ligaMagicMapper';

interface GlobalListModalProps {
  isOpen: boolean;
  onClose: () => void;
  list: Card[];
  type: 'buy' | 'print';
  initialExportMode?: 'standard' | 'ligamagic';
  onClearList: () => void;
  onRemoveItem: (card: Card) => void;
}

export const GlobalListModal: React.FC<GlobalListModalProps> = ({ 
    isOpen, 
    onClose, 
    list, 
    type,
    initialExportMode = 'standard',
    onClearList,
    onRemoveItem
}) => {
  const [selectedCards, setSelectedCards] = useState<Set<string>>(new Set());
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  
  // State for BUY mode (standard vs liga)
  const [buyExportMode, setBuyExportMode] = useState<'standard' | 'ligamagic'>('standard');
  
  // State for PRINT mode (text list vs visual grid proxies)
  const [printMode, setPrintMode] = useState<'text' | 'proxies'>('text');
  
  // Zoom State
  const [zoomLevel, setZoomLevel] = useState(1);
  const previewContainerRef = useRef<HTMLDivElement>(null);

  const [copied, setCopied] = useState(false);
  
  // Hover Preview State
  const [previewImg, setPreviewImg] = useState<string | null>(null);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });

  // Initialize selection and mode when modal opens
  React.useEffect(() => {
    if (isOpen) {
        // Select all by default
        setSelectedCards(new Set(list.map(c => c.id)));
        
        // Initialize quantities to 1 if not set
        const initialQ: Record<string, number> = {};
        list.forEach(c => {
             initialQ[c.id] = 1;
        });
        setQuantities(initialQ);

        // Set initial buy mode based on prop
        setBuyExportMode(initialExportMode);
        // Default print mode to text usually, or proxies if preferred.
        setPrintMode('text');
    }
  }, [isOpen, list, initialExportMode]);

  // Auto-fit Zoom when entering Proxies mode
  useEffect(() => {
      if (type === 'print' && printMode === 'proxies') {
          // Delay to ensure ref is attached and layout is computed
          const timer = setTimeout(() => {
            if (previewContainerRef.current) {
                const { clientWidth, clientHeight } = previewContainerRef.current;
                
                // A4 Dimensions in CSS pixels (approx 96 DPI)
                const a4WidthPx = 794;   // 210mm
                const a4HeightPx = 1123; // 297mm
                
                // Padding to ensure it doesn't touch edges
                const padding = 40;

                const scaleX = (clientWidth - padding) / a4WidthPx;
                const scaleY = (clientHeight - padding) / a4HeightPx;

                // Fit entire page (min of width/height ratios)
                const targetZoom = Math.min(scaleX, scaleY);
                
                // Clamp reasonable values
                setZoomLevel(Math.max(0.2, Math.min(1.5, targetZoom)));
            }
          }, 50);
          return () => clearTimeout(timer);
      }
  }, [printMode, type, isOpen]);

  const toggleCard = (id: string) => {
      const newSet = new Set(selectedCards);
      if (newSet.has(id)) {
          newSet.delete(id);
      } else {
          newSet.add(id);
      }
      setSelectedCards(newSet);
  };

  const toggleAll = () => {
      if (selectedCards.size === list.length) {
          setSelectedCards(new Set());
      } else {
          setSelectedCards(new Set(list.map(c => c.id)));
      }
  };

  const updateQuantity = (id: string, delta: number) => {
      setQuantities(prev => {
          const current = prev[id] || 1;
          const newValue = Math.max(1, current + delta);
          return { ...prev, [id]: newValue };
      });
  };

  const handleZoomIn = () => setZoomLevel(prev => Math.min(2.0, prev + 0.1));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(0.2, prev - 0.1));
  const handleFitScreen = () => {
      if (previewContainerRef.current) {
          const { clientWidth, clientHeight } = previewContainerRef.current;
          const a4WidthPx = 794; 
          const a4HeightPx = 1123; 
          const padding = 40;

          const scaleX = (clientWidth - padding) / a4WidthPx;
          const scaleY = (clientHeight - padding) / a4HeightPx;
          
          const targetZoom = Math.min(scaleX, scaleY);
          setZoomLevel(Math.max(0.2, Math.min(1.5, targetZoom)));
      }
  };

  const title = type === 'buy' ? 'Lista de Compras' : 'Lista de Impressão';
  const icon = type === 'buy' ? <ShoppingCart className="text-blue-400" /> : <Printer className="text-purple-400" />;
  const colorClass = type === 'buy' ? 'blue' : 'purple';

  // Filter list based on selection
  const exportList = useMemo(() => {
      return list.filter(c => selectedCards.has(c.id));
  }, [list, selectedCards]);

  // Expand list based on quantities (for Proxies view)
  const expandedList = useMemo(() => {
      let expanded: Card[] = [];
      exportList.forEach(card => {
          const qty = quantities[card.id] || 1;
          for (let i = 0; i < qty; i++) {
              expanded.push(card);
          }
      });
      return expanded;
  }, [exportList, quantities]);

  // Calculate Total Price
  const totalPrice = useMemo(() => {
      return exportList.reduce((acc, card) => {
          const qty = quantities[card.id] || 1;
          return acc + (card.priceBRL * qty);
      }, 0);
  }, [exportList, quantities]);

  // Helper to chunk array for pages (9 cards per page)
  const chunk = (arr: Card[], size: number): Card[][] => 
      Array.from({ length: Math.ceil(arr.length / size) }, (v, i) => arr.slice(i * size, i * size + size));

  const generateText = () => {
      // For Text mode, we want to group by line (e.g. "4 Card Name").
      // So we iterate exportList (unique cards) and prefix the quantity.
      
      const BLOCK_SIZE = 110; // LigaMagic limitation block size
      const totalBlocks = Math.ceil(exportList.length / BLOCK_SIZE);
      let output = '';

      const useLigaFormat = (type === 'buy' && buyExportMode === 'ligamagic') || (type === 'print');

      for (let i = 0; i < totalBlocks; i++) {
          const start = i * BLOCK_SIZE;
          const chunkList = exportList.slice(start, start + BLOCK_SIZE);
          
          chunkList.forEach(card => {
              const qty = quantities[card.id] || 1;
              if (useLigaFormat) {
                  // Format: QTY Card Name [SET_CODE]
                  const ligaSet = mapScryfallToLigaMagic(card.set);
                  output += `${qty} ${card.name} [${ligaSet}]\n`;
              } else {
                  // Format: QTY card name [edicao = set_code]
                  output += `${qty} ${card.name.toLowerCase()} [edicao = ${card.set.toLowerCase()}]\n`;
              }
          });
          
          if (i < totalBlocks - 1) {
              output += '\n'; 
          }
      }
      
      return output;
  };

  const copyToClipboard = () => {
      const text = generateText();
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
  };

  const handleBuyNow = () => {
      copyToClipboard();
      window.open('https://www.ligamagic.com.br/?view=cards/lista', '_blank');
  };

  // Generate Print Window (Using expanded list for proxies)
  const handlePrintProxies = () => {
      const printWindow = window.open('', '_blank');
      if (!printWindow) return;

      const pages = chunk(expandedList, 9);
      const showWatermark = true;

      const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Imprimir Proxies - ${title}</title>
        <style>
          @page { 
            size: A4; 
            margin: 0; 
          }
          body { 
            margin: 0; 
            padding: 0; 
            background: #fff; 
            -webkit-print-color-adjust: exact; 
            font-family: sans-serif;
          }
          .page {
            width: 210mm;
            height: 297mm;
            display: flex;
            align-items: center;
            justify-content: center;
            page-break-after: always;
            position: relative;
          }
          .grid { 
            display: grid; 
            grid-template-columns: repeat(3, 63mm); 
            grid-template-rows: repeat(3, 88mm); 
            gap: 0; 
          }
          .card-container { 
            position: relative; 
            width: 63mm; 
            height: 88mm; 
            overflow: hidden; 
            /* High visibility cut marks (dashed line) */
            outline: 1px dashed #444; 
            outline-offset: -1px;
            z-index: 1;
          }
          .card-img { 
            width: 100%; 
            height: 100%; 
            object-fit: fill; 
            position: relative;
            z-index: 0;
          }
          .watermark { 
            position: absolute; 
            top: 50%; 
            left: 50%; 
            transform: translate(-50%, -50%) rotate(-45deg); 
            
            /* Enhanced Visibility */
            font-size: 56px; 
            font-family: 'Arial', sans-serif;
            color: rgba(220, 20, 60, 0.6); 
            font-weight: 900; 
            letter-spacing: 2px;
            
            /* Border box */
            border: 6px solid rgba(220, 20, 60, 0.6); 
            padding: 5px 30px; 
            
            text-transform: uppercase; 
            pointer-events: none; 
            z-index: 20;
            display: ${showWatermark ? 'block' : 'none'};
            white-space: nowrap;
            
            /* Blending for "printed on top" effect */
            mix-blend-mode: multiply;
          }
          .page:last-child {
            page-break-after: auto;
          }
          .loading-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(255,255,255,0.9);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            font-size: 24px;
            font-weight: bold;
            color: #333;
          }
          @media print {
             body { -webkit-print-color-adjust: exact; }
             .loading-overlay { display: none !important; }
          }
        </style>
      </head>
      <body>
        <div id="loader" class="loading-overlay">
            <div>Carregando Imagens...</div>
            <div style="font-size: 16px; margin-top: 10px; font-weight: normal;">Aguarde a janela de impressão abrir automaticamente.</div>
        </div>
        ${pages.map(pageCards => `
          <div class="page">
            <div class="grid">
              ${pageCards.map(c => `
                <div class="card-container">
                   <img src="${c.imageUrl}" class="card-img" crossorigin="anonymous" loading="eager" />
                   <div class="watermark">PROXY</div>
                </div>
              `).join('')}
            </div>
          </div>
        `).join('')}
        <script>
           function runPrint() {
             const loader = document.getElementById('loader');
             const imgs = document.images;
             let len = imgs.length;
             let counter = 0;
             
             if (len === 0) {
                 if(loader) loader.style.display = 'none';
                 window.print();
                 return;
             }

             function increment() {
                 counter++;
                 if (counter === len) {
                     // All images loaded
                     setTimeout(() => {
                         if(loader) loader.style.display = 'none';
                         window.print();
                     }, 500); // Small buffer for rendering
                 }
             }

             [].forEach.call(imgs, function(img) {
                 if (img.complete) increment();
                 else {
                     img.addEventListener('load', increment);
                     img.addEventListener('error', increment);
                 }
             });
           }

           if (document.readyState === 'complete') {
               runPrint();
           } else {
               window.addEventListener('load', runPrint);
           }
        </script>
      </body>
      </html>
    `;
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  if (!isOpen) return null;

  return (
    <>
        {/* Floating Image Preview (Desktop Only) */}
        {previewImg && (
            <div 
                className="fixed z-[100] pointer-events-none animate-in fade-in duration-150 hidden md:block"
                style={{ 
                    top: Math.min(cursorPos.y - 100, window.innerHeight - 350), 
                    left: cursorPos.x + 20 
                }}
            >
                <img 
                    src={previewImg} 
                    alt="Preview" 
                    className="w-64 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] border border-gray-600 bg-[#0F0F0F]" 
                />
            </div>
        )}

        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>

        <div className="relative bg-[#020604] rounded-2xl w-full max-w-6xl h-[90vh] md:h-[85vh] flex flex-col shadow-2xl border border-gray-800 animate-in fade-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="flex justify-between items-center p-4 md:p-5 border-b border-gray-800 bg-[#0a1410] shrink-0">
            <div className="flex items-center gap-3 min-w-0">
                <div className={`p-2 bg-${colorClass}-900/20 rounded-lg border border-${colorClass}-500/30 shrink-0`}>
                    {icon}
                </div>
                <div className="min-w-0">
                    <h2 className="text-lg md:text-xl font-bold text-white truncate">{title}</h2>
                    <p className="text-[10px] md:text-xs text-gray-500 truncate">Gerencie e exporte suas cartas</p>
                </div>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors shrink-0">
                <X size={24} />
            </button>
            </div>

            {/* Content Body - Responsive Flex */}
            {/* Updated layout: Vertical scroll on mobile, flex row on desktop */}
            <div className="flex flex-col lg:flex-row flex-1 overflow-y-auto lg:overflow-hidden scrollbar-thin scrollbar-thumb-gray-800">
                
                {/* Left: List Management (40% width on Desktop) - Order 2 on Mobile so it sits below Preview */}
                <div className="w-full lg:w-2/5 flex flex-col border-b lg:border-b-0 lg:border-r border-gray-800 h-auto min-h-[500px] lg:h-full lg:min-h-0 order-2 lg:order-1">
                    
                    {/* Controls */}
                    <div className="p-3 bg-black/20 border-b border-gray-800 flex justify-between items-center shrink-0">
                        <label className="flex items-center gap-2 cursor-pointer text-xs md:text-sm text-gray-300 hover:text-white">
                            <input 
                                type="checkbox" 
                                checked={selectedCards.size === list.length && list.length > 0}
                                onChange={toggleAll}
                                className={`rounded bg-black border-gray-600 text-${colorClass}-500 focus:ring-0`}
                            />
                            Sel. Todas ({list.length})
                        </label>
                        <button 
                            onClick={onClearList}
                            className="text-[10px] md:text-xs text-red-500 hover:text-red-400 flex items-center gap-1 px-2 py-1 hover:bg-red-900/20 rounded transition-colors"
                        >
                            <Trash2 size={12} /> Limpar
                        </button>
                    </div>

                    {/* Scrollable List */}
                    <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin scrollbar-thumb-gray-800">
                        {list.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-gray-500 italic text-sm">
                                Lista vazia.
                            </div>
                        ) : (
                            list.map(card => (
                                <div 
                                    key={card.id} 
                                    className={`flex items-center justify-between p-2 rounded border transition-colors ${selectedCards.has(card.id) ? 'bg-gray-800/50 border-gray-700' : 'bg-transparent border-transparent hover:bg-gray-900'}`}
                                >
                                    <div className="flex items-center gap-2 md:gap-3 overflow-hidden flex-1">
                                        <input 
                                            type="checkbox" 
                                            checked={selectedCards.has(card.id)}
                                            onChange={() => toggleCard(card.id)}
                                            className={`rounded bg-black border-gray-600 text-${colorClass}-500 focus:ring-0 shrink-0`}
                                        />
                                        {/* Hide image on very small screens if needed, keeping for now */}
                                        <img 
                                            src={card.imageUrl} 
                                            alt="" 
                                            className="w-8 h-11 rounded object-cover border border-gray-700 shrink-0 hidden sm:block"
                                            onMouseEnter={(e) => {
                                                setPreviewImg(card.imageUrl);
                                                setCursorPos({ x: e.clientX, y: e.clientY });
                                            }}
                                            onMouseMove={(e) => {
                                                setCursorPos({ x: e.clientX, y: e.clientY });
                                            }}
                                            onMouseLeave={() => setPreviewImg(null)}
                                        />
                                        <div className="min-w-0 flex-1">
                                            <div className="text-xs md:text-sm font-medium text-gray-200 truncate">{card.name}</div>
                                            <div className="text-[9px] md:text-[10px] text-gray-500 flex items-center gap-1 truncate">
                                                <span className="uppercase">{card.set}</span> • R$ {card.priceBRL.toFixed(2)}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-2 shrink-0">
                                        {/* Quantity Controls */}
                                        <div className="flex items-center border border-gray-700 rounded bg-black/40 h-6 md:h-7">
                                            <button 
                                                onClick={() => updateQuantity(card.id, -1)} 
                                                className="px-1.5 md:px-2 h-full text-gray-400 hover:text-white hover:bg-gray-800 rounded-l transition-colors"
                                            >
                                                <Minus size={10} />
                                            </button>
                                            <span className="text-[10px] md:text-xs font-mono font-bold w-5 md:w-6 text-center text-gray-200 select-none">
                                                {quantities[card.id] || 1}
                                            </span>
                                            <button 
                                                onClick={() => updateQuantity(card.id, 1)} 
                                                className="px-1.5 md:px-2 h-full text-gray-400 hover:text-white hover:bg-gray-800 rounded-r transition-colors"
                                            >
                                                <Plus size={10} />
                                            </button>
                                        </div>

                                        <button 
                                            onClick={() => onRemoveItem(card)}
                                            className="text-gray-600 hover:text-red-500 p-1.5 hover:bg-red-900/10 rounded transition-colors"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    
                    {/* Total Footer */}
                    <div className="p-3 bg-black/40 border-t border-gray-800 flex justify-between items-center shrink-0">
                        <div className="flex items-center gap-2 text-gray-400 text-xs">
                            <Calculator size={14} /> Total Estimado
                        </div>
                        <div className="text-emerald-400 font-bold font-mono text-base md:text-lg">
                            R$ {totalPrice.toFixed(2)}
                        </div>
                    </div>

                </div>

                {/* Right: Export Preview (60% width on Desktop, Taller on Mobile) */}
                <div className="w-full lg:w-3/5 flex flex-col bg-[#050505] h-[65vh] lg:h-full lg:min-h-0 shrink-0 order-1 lg:order-2 border-b lg:border-b-0 border-gray-800">
                    
                    {/* Export Options (Tabs) */}
                    <div className="p-3 md:p-4 border-b border-gray-800 space-y-3 md:space-y-4 shrink-0">
                        <div className="flex items-center gap-2 text-xs md:text-sm font-bold text-gray-400 uppercase tracking-wider">
                            <Filter size={14} /> {type === 'buy' ? 'Opções de Exportação' : 'Modo de Visualização'}
                        </div>
                        
                        <div className="flex gap-2">
                            {type === 'buy' ? (
                                <>
                                    <button 
                                        onClick={() => setBuyExportMode('standard')}
                                        className={`flex-1 py-1.5 md:py-2 rounded-md text-xs md:text-sm font-bold border transition-all ${buyExportMode === 'standard' ? `bg-${colorClass}-900/20 text-${colorClass}-400 border-${colorClass}-500/50` : 'bg-gray-900 text-gray-500 border-gray-800 hover:text-gray-300'}`}
                                    >
                                        TXT Padrão
                                    </button>
                                    <button 
                                        onClick={() => setBuyExportMode('ligamagic')}
                                        className={`flex-1 py-1.5 md:py-2 rounded-md text-xs md:text-sm font-bold border transition-all ${buyExportMode === 'ligamagic' ? 'bg-orange-900/20 text-orange-400 border-orange-500/50' : 'bg-gray-900 text-gray-500 border-gray-800 hover:text-gray-300'}`}
                                    >
                                        Comprar na Liga
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button 
                                        onClick={() => setPrintMode('text')}
                                        className={`flex-1 py-1.5 md:py-2 rounded-md text-xs md:text-sm font-bold border transition-all flex items-center justify-center gap-2 ${printMode === 'text' ? `bg-${colorClass}-900/20 text-${colorClass}-400 border-${colorClass}-500/50` : 'bg-gray-900 text-gray-500 border-gray-800 hover:text-gray-300'}`}
                                    >
                                       <List size={14} /> <span className="hidden sm:inline">Lista Texto</span>
                                    </button>
                                    <button 
                                        onClick={() => setPrintMode('proxies')}
                                        className={`flex-1 py-1.5 md:py-2 rounded-md text-xs md:text-sm font-bold border transition-all flex items-center justify-center gap-2 ${printMode === 'proxies' ? 'bg-purple-900/20 text-purple-400 border-purple-500/50' : 'bg-gray-900 text-gray-500 border-gray-800 hover:text-gray-300'}`}
                                    >
                                       <Grid3X3 size={14} /> <span className="hidden sm:inline">Preview Grade</span>
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Info Text - Hidden on very small screens to save space if needed, or kept small */}
                        {type === 'buy' && buyExportMode === 'standard' && (
                            <div className="text-[10px] md:text-xs text-gray-500 bg-gray-900/50 p-2 rounded border border-gray-800">
                                Gera blocos de até 110 cartas. Formato: <span className="text-gray-400 font-mono">QTD nome [edicao = set]</span>
                            </div>
                        )}
                        {type === 'buy' && buyExportMode === 'ligamagic' && (
                            <div className="text-[10px] md:text-xs text-gray-500 bg-gray-900/50 p-2 rounded border border-gray-800">
                                Gera blocos de até 110 cartas. Copie e cole na LigaMagic. Formato: <span className="text-gray-400 font-mono">QTD Nome [SET]</span>
                            </div>
                        )}
                        {type === 'print' && printMode === 'text' && (
                            <div className="text-[10px] md:text-xs text-gray-500 bg-gray-900/50 p-2 rounded border border-gray-800">
                                Lista de texto simples formatada para cotação. Formato: <span className="text-gray-400 font-mono">QTD Nome [SET]</span>
                            </div>
                        )}
                         {type === 'print' && printMode === 'proxies' && (
                            <div className="text-[10px] md:text-xs text-gray-500 bg-gray-900/50 p-2 rounded border border-gray-800">
                                Visualização exata de impressão A4.
                            </div>
                        )}
                    </div>

                    {/* Content Preview */}
                    <div className="flex-1 overflow-hidden flex flex-col bg-black/20 relative">
                        {type === 'print' && printMode === 'proxies' ? (
                            // GRID PREVIEW (SIMULATING A4 PAGE EXACTLY)
                            <>
                                <div 
                                    ref={previewContainerRef}
                                    className="flex-1 overflow-auto scrollbar-thin scrollbar-thumb-gray-800 bg-gray-900/50 flex flex-col items-center gap-4 md:gap-8 relative p-4 md:p-8"
                                >
                                    {expandedList.length === 0 ? (
                                        <div className="text-gray-500 text-center mt-10">Nenhuma carta selecionada</div>
                                    ) : (
                                        // Wrap pages in a scaler div
                                        <div 
                                            style={{ 
                                                transform: `scale(${zoomLevel})`, 
                                                transformOrigin: 'top center',
                                                transition: 'transform 0.2s ease-out'
                                            }}
                                            className="flex flex-col items-center gap-8"
                                        >
                                            {chunk(expandedList, 9).map((pageCards, pageIndex) => (
                                                <div 
                                                    key={pageIndex} 
                                                    className="bg-white shadow-[0_0_50px_rgba(0,0,0,0.5)] shrink-0 relative" 
                                                    style={{ 
                                                        width: '210mm', 
                                                        height: '297mm', 
                                                        display: 'flex', 
                                                        alignItems: 'center', 
                                                        justifyContent: 'center',
                                                        padding: 0
                                                    }}
                                                >
                                                    {/* Grid Container (Matches print CSS exactly) */}
                                                    <div style={{ 
                                                        display: 'grid', 
                                                        gridTemplateColumns: 'repeat(3, 63mm)', 
                                                        gridTemplateRows: 'repeat(3, 88mm)', 
                                                        gap: 0 
                                                    }}>
                                                        {pageCards.map((card, idx) => (
                                                            <div key={`${card.id}-${idx}`} style={{ 
                                                                width: '63mm', 
                                                                height: '88mm', 
                                                                position: 'relative', 
                                                                outline: '1px dashed #444', 
                                                                outlineOffset: '-1px',
                                                                overflow: 'hidden'
                                                            }}>
                                                                <img src={card.imageUrl} style={{ width: '100%', height: '100%', objectFit: 'fill' }} alt="" />
                                                                <div style={{
                                                                    position: 'absolute',
                                                                    top: '50%',
                                                                    left: '50%',
                                                                    transform: 'translate(-50%, -50%) rotate(-45deg)',
                                                                    fontSize: '56px',
                                                                    fontFamily: 'Arial, sans-serif',
                                                                    color: 'rgba(220, 20, 60, 0.6)',
                                                                    fontWeight: 900,
                                                                    letterSpacing: '2px',
                                                                    border: '6px solid rgba(220, 20, 60, 0.6)',
                                                                    padding: '5px 30px',
                                                                    textTransform: 'uppercase',
                                                                    pointerEvents: 'none',
                                                                    zIndex: 20,
                                                                    whiteSpace: 'nowrap',
                                                                    mixBlendMode: 'multiply'
                                                                }}>
                                                                    PROXY
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    
                                                    {/* Page Number Helper */}
                                                    <div className="absolute bottom-4 right-4 text-xs text-gray-400 font-sans">
                                                        Página {pageIndex + 1}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Floating Zoom Controls */}
                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-[#0F0F0F] border border-gray-700 rounded-full shadow-xl flex items-center gap-1 p-1 z-10 animate-in slide-in-from-bottom-2">
                                    <button 
                                        onClick={handleZoomOut}
                                        className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-full transition-colors"
                                        title="Diminuir Zoom"
                                    >
                                        <ZoomOut size={16} />
                                    </button>
                                    <div className="w-px h-4 bg-gray-700"></div>
                                    <span className="text-xs font-mono font-bold text-emerald-500 w-12 text-center select-none">
                                        {Math.round(zoomLevel * 100)}%
                                    </span>
                                    <div className="w-px h-4 bg-gray-700"></div>
                                    <button 
                                        onClick={handleZoomIn}
                                        className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-full transition-colors"
                                        title="Aumentar Zoom"
                                    >
                                        <ZoomIn size={16} />
                                    </button>
                                    <div className="w-px h-4 bg-gray-700"></div>
                                    <button 
                                        onClick={handleFitScreen}
                                        className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-full transition-colors"
                                        title="Ajustar à Tela"
                                    >
                                        <Maximize size={16} />
                                    </button>
                                </div>
                            </>
                        ) : (
                            // TEXT AREA PREVIEW
                            <div className="flex-1 p-3 md:p-4 flex flex-col">
                                <label className="text-xs font-bold text-gray-500 mb-2 flex justify-between">
                                    <span>Pré-visualização ({exportList.reduce((acc, c) => acc + (quantities[c.id] || 1), 0)} cartas)</span>
                                </label>
                                <textarea 
                                    readOnly
                                    value={generateText()}
                                    className="w-full flex-1 bg-black border border-gray-800 rounded-lg p-3 text-xs font-mono text-emerald-500 focus:outline-none resize-none scrollbar-thin scrollbar-thumb-gray-800"
                                />
                            </div>
                        )}
                    </div>

                    {/* Action Footer */}
                    <div className="p-3 md:p-4 border-t border-gray-800 bg-[#0a1410] flex gap-3 shrink-0">
                        {type === 'print' && printMode === 'proxies' ? (
                             <button 
                                onClick={handlePrintProxies}
                                disabled={exportList.length === 0}
                                className="w-full py-2.5 md:py-3 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-purple-900/20 text-xs md:text-sm"
                            >
                                <Printer size={18} /> Gerar PDF
                            </button>
                        ) : (
                            <>
                                <button 
                                    onClick={copyToClipboard}
                                    disabled={exportList.length === 0}
                                    className={`flex-1 py-2.5 md:py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all text-xs md:text-sm ${copied ? 'bg-green-500 text-black' : `bg-${colorClass}-600 hover:bg-${colorClass}-500 text-white`} disabled:opacity-50 disabled:cursor-not-allowed`}
                                >
                                    {copied ? <Check size={18} /> : <Copy size={18} />}
                                    {copied ? 'Copiado!' : 'Copiar Texto'}
                                </button>
                                
                                {type === 'buy' && buyExportMode === 'ligamagic' && (
                                    <button 
                                        onClick={handleBuyNow}
                                        disabled={exportList.length === 0}
                                        className="px-4 md:px-6 py-2.5 md:py-3 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-bold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-orange-900/20 text-xs md:text-sm"
                                        title="Copiar lista e abrir LigaMagic"
                                    >
                                        <ExternalLink size={18} /> Compre Agora
                                    </button>
                                )}
                            </>
                        )}
                    </div>

                </div>

            </div>
        </div>
        </div>
    </>
  );
};
