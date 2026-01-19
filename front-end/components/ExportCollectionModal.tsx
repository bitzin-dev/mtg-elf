
import React, { useState } from 'react';
import { Card } from '../types';
import { FileSpreadsheet, FileText, Printer, AlertTriangle, X, Download, CheckCircle, Database } from 'lucide-react';

export type ExportFormat = 'csv' | 'pdf-proxies' | 'pdf-report';
export type CsvStandard = 'manabox' | 'moxfield' | 'ligamagic';
export type ContentSource = 'owned' | 'missing' | 'print-list';

interface ExportCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  collectionName: string;
  ownedCards: Card[];
  missingCards: Card[];
  printList: Card[];
}

export const ExportCollectionModal: React.FC<ExportCollectionModalProps> = ({
  isOpen,
  onClose,
  collectionName,
  ownedCards,
  missingCards,
  printList
}) => {
  const [format, setFormat] = useState<ExportFormat>('csv');
  const [csvStandard, setCsvStandard] = useState<CsvStandard>('manabox');
  const [contentSource, setContentSource] = useState<ContentSource>('owned');
  const [showWatermark, setShowWatermark] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  const getTargetList = () => {
    switch (contentSource) {
      case 'owned': return ownedCards;
      case 'missing': return missingCards;
      case 'print-list': return printList;
      default: return [];
    }
  };

  const generateCSV = (cards: Card[]) => {
    let headers = '';
    let rows: string[] = [];

    if (csvStandard === 'manabox') {
      headers = 'Name,Set code,Collector number,Foil,Language,Quantity';
      rows = cards.map(c => `"${c.name}","${c.set}","${c.collectorNumber}","false","English","1"`);
    } else if (csvStandard === 'moxfield') {
      headers = 'Count,Name,Edition,Condition,Language,Foil,Tag';
      rows = cards.map(c => `"1","${c.name}","${c.set}","NM","English","",""`);
    } else if (csvStandard === 'ligamagic') {
      headers = 'Nome,Edicao,Quantidade,Idioma,Qualidade,Foil';
      rows = cards.map(c => `"${c.name}","${c.setName}","1","Inglês","NM","0"`);
    }

    const csvContent = [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${collectionName}_${contentSource}_${csvStandard}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generatePrintWindow = (cards: Card[]) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    // Helper to chunk array into pages of 9
    const chunk = (arr: Card[], size: number) => Array.from({ length: Math.ceil(arr.length / size) }, (v, i) => arr.slice(i * size, i * size + size));
    const pages = chunk(cards, 9);

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Imprimir Proxies - ${collectionName}</title>
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

  const generateReportWindow = (cards: Card[]) => {
      const printWindow = window.open('', '_blank');
      if (!printWindow) return;

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Relatório - ${collectionName}</title>
          <style>
            body { font-family: 'Helvetica', sans-serif; padding: 40px; }
            h1 { border-bottom: 2px solid #333; padding-bottom: 10px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
            th { background-color: #f2f2f2; }
            tr:nth-child(even) { background-color: #f9f9f9; }
            .total { margin-top: 20px; font-weight: bold; }
          </style>
        </head>
        <body>
          <h1>Relatório da Coleção: ${collectionName}</h1>
          <p>Fonte: ${contentSource === 'owned' ? 'Cartas Possuídas' : contentSource === 'missing' ? 'Cartas Faltantes' : 'Lista de Impressão'}</p>
          <p>Data: ${new Date().toLocaleDateString()}</p>
          
          <div class="total">Total de Cartas: ${cards.length} | Valor Estimado (BRL): R$ ${cards.reduce((acc, c) => acc + c.priceBRL, 0).toFixed(2)}</div>

          <table>
            <thead>
              <tr>
                <th>Qtd</th>
                <th>Nome</th>
                <th>Edição</th>
                <th>Tipo</th>
                <th>Raridade</th>
                <th>Preço (Est.)</th>
              </tr>
            </thead>
            <tbody>
              ${cards.map(c => `
                <tr>
                  <td>1</td>
                  <td>${c.name}</td>
                  <td>${c.setName} (${c.set})</td>
                  <td>${c.type}</td>
                  <td>${c.rarity}</td>
                  <td>R$ ${c.priceBRL.toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <script>
             window.onload = function() { window.print(); }
          </script>
        </body>
        </html>
      `;
      printWindow.document.write(htmlContent);
      printWindow.document.close();
  };

  const handleExport = () => {
    setIsExporting(true);
    const list = getTargetList();

    if (list.length === 0) {
      alert("A lista selecionada está vazia.");
      setIsExporting(false);
      return;
    }

    setTimeout(() => {
        if (format === 'csv') {
            generateCSV(list);
        } else if (format === 'pdf-proxies') {
            generatePrintWindow(list);
        } else if (format === 'pdf-report') {
            generateReportWindow(list);
        }
        setIsExporting(false);
        onClose();
    }, 500);
  };

  const getListCount = (source: ContentSource) => {
      switch(source) {
          case 'owned': return ownedCards.length;
          case 'missing': return missingCards.length;
          case 'print-list': return printList.length;
          default: return 0;
      }
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>

      <div className="relative bg-[#020604] rounded-2xl w-full max-w-lg shadow-2xl border border-gray-800 animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
        
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-gray-800 bg-[#0a1410]">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Download className="text-purple-400" size={24} /> Exportar Coleção
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          
          {/* Format Section */}
          <div className="space-y-3">
            <label className="text-sm font-bold text-emerald-500 uppercase tracking-wider">Formato</label>
            
            {/* CSV Option */}
            <div 
                onClick={() => setFormat('csv')}
                className={`border rounded-lg p-3 cursor-pointer transition-all ${format === 'csv' ? 'bg-emerald-900/10 border-emerald-500' : 'bg-gray-900/30 border-gray-700 hover:border-gray-500'}`}
            >
                <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${format === 'csv' ? 'border-emerald-500' : 'border-gray-500'}`}>
                        {format === 'csv' && <div className="w-2 h-2 rounded-full bg-emerald-500"></div>}
                    </div>
                    <div className="flex items-center gap-2 text-gray-200 font-medium">
                        <FileSpreadsheet size={16} className="text-green-400" /> CSV (Planilha)
                    </div>
                </div>
                
                {/* Sub-options for CSV */}
                {format === 'csv' && (
                    <div className="mt-3 ml-7 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                        {(['manabox', 'moxfield', 'ligamagic'] as CsvStandard[]).map(std => (
                            <button
                                key={std}
                                onClick={(e) => { e.stopPropagation(); setCsvStandard(std); }}
                                className={`px-3 py-1.5 rounded text-xs font-bold border capitalize transition-colors ${csvStandard === std ? 'bg-emerald-500 text-black border-emerald-500' : 'bg-black text-gray-400 border-gray-700 hover:text-white'}`}
                            >
                                {std}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* PDF Proxies Option */}
            <div 
                onClick={() => setFormat('pdf-proxies')}
                className={`border rounded-lg p-3 cursor-pointer transition-all ${format === 'pdf-proxies' ? 'bg-emerald-900/10 border-emerald-500' : 'bg-gray-900/30 border-gray-700 hover:border-gray-500'}`}
            >
                <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${format === 'pdf-proxies' ? 'border-emerald-500' : 'border-gray-500'}`}>
                        {format === 'pdf-proxies' && <div className="w-2 h-2 rounded-full bg-emerald-500"></div>}
                    </div>
                    <div className="flex items-center gap-2 text-gray-200 font-medium">
                        <Printer size={16} className="text-pink-400" /> PDF (Imagens para Impressão)
                    </div>
                </div>
            </div>

            {/* PDF Report Option */}
             <div 
                onClick={() => setFormat('pdf-report')}
                className={`border rounded-lg p-3 cursor-pointer transition-all ${format === 'pdf-report' ? 'bg-emerald-900/10 border-emerald-500' : 'bg-gray-900/30 border-gray-700 hover:border-gray-500'}`}
            >
                <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${format === 'pdf-report' ? 'border-emerald-500' : 'border-gray-500'}`}>
                        {format === 'pdf-report' && <div className="w-2 h-2 rounded-full bg-emerald-500"></div>}
                    </div>
                    <div className="flex items-center gap-2 text-gray-200 font-medium">
                        <FileText size={16} className="text-blue-400" /> PDF (Relatório de Coleção)
                    </div>
                </div>
            </div>

            {/* Warning for Proxies */}
            {format === 'pdf-proxies' && (
                <div className="ml-1 bg-red-900/20 border-l-2 border-red-500 p-3 rounded-r-lg animate-in slide-in-from-top-2">
                    <label className="flex items-start gap-2 cursor-pointer">
                        <input 
                            type="checkbox" 
                            checked={showWatermark} 
                            onChange={(e) => setShowWatermark(e.target.checked)}
                            className="mt-1 rounded border-gray-600 bg-black text-red-500 focus:ring-offset-0 focus:ring-0"
                        />
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-red-400 flex items-center gap-1">
                                <AlertTriangle size={14} /> Adicionar Marca d'água "PROXY" no PDF
                            </span>
                            <span className="text-xs text-red-300/70">Marca d'água vermelha, diagonal, sobre cada carta para evitar falsificação.</span>
                        </div>
                    </label>
                </div>
            )}
          </div>

          {/* Content Section */}
          <div className="space-y-3">
            <label className="text-sm font-bold text-emerald-500 uppercase tracking-wider">Conteúdo</label>
            
            <div className="flex flex-col gap-2">
                <div 
                    onClick={() => setContentSource('owned')}
                    className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${contentSource === 'owned' ? 'bg-emerald-900/10 border-emerald-500' : 'bg-gray-900/30 border-gray-700'}`}
                >
                    <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${contentSource === 'owned' ? 'border-emerald-500' : 'border-gray-500'}`}>
                            {contentSource === 'owned' && <div className="w-2 h-2 rounded-full bg-emerald-500"></div>}
                        </div>
                        <span className="text-sm text-gray-200 font-medium flex items-center gap-2">
                            <CheckCircle size={14} className="text-emerald-500" /> Cartas Possuídas
                        </span>
                    </div>
                    <span className="text-xs font-mono bg-black/40 px-2 py-1 rounded text-gray-400">{ownedCards.length}</span>
                </div>

                <div 
                    onClick={() => setContentSource('missing')}
                    className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${contentSource === 'missing' ? 'bg-emerald-900/10 border-emerald-500' : 'bg-gray-900/30 border-gray-700'}`}
                >
                    <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${contentSource === 'missing' ? 'border-emerald-500' : 'border-gray-500'}`}>
                            {contentSource === 'missing' && <div className="w-2 h-2 rounded-full bg-emerald-500"></div>}
                        </div>
                        <span className="text-sm text-gray-200 font-medium flex items-center gap-2">
                            <X size={14} className="text-red-500" /> Cartas Faltantes
                        </span>
                    </div>
                    <span className="text-xs font-mono bg-black/40 px-2 py-1 rounded text-gray-400">{missingCards.length}</span>
                </div>

                <div 
                    onClick={() => setContentSource('print-list')}
                    className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${contentSource === 'print-list' ? 'bg-emerald-900/10 border-emerald-500' : 'bg-gray-900/30 border-gray-700'}`}
                >
                    <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${contentSource === 'print-list' ? 'border-emerald-500' : 'border-gray-500'}`}>
                            {contentSource === 'print-list' && <div className="w-2 h-2 rounded-full bg-emerald-500"></div>}
                        </div>
                        <span className="text-sm text-gray-200 font-medium flex items-center gap-2">
                            <Printer size={14} className="text-purple-500" /> Cartas para Impressão
                        </span>
                    </div>
                    <span className="text-xs font-mono bg-black/40 px-2 py-1 rounded text-gray-400">{printList.length}</span>
                </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button 
                onClick={onClose}
                className="flex-1 py-3 rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-800 font-bold transition-colors"
            >
                Cancelar
            </button>
            <button 
                onClick={handleExport}
                disabled={isExporting || getListCount(contentSource) === 0}
                className="flex-1 py-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-bold transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                {isExporting ? 'Processando...' : 'Exportar'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
