import React, { useRef, useState, useEffect, useCallback } from 'react';
import { X, Camera, RefreshCw, Check, AlertTriangle, Loader2, ChevronDown, Sliders, Zap, ZapOff } from 'lucide-react';
import { identifyCardFromImage } from '../services/geminiService';
import { searchScryfall, getCardPrintings } from '../services/scryfallService';
import { Card } from '../types';

interface ScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCardFound: (card: Card) => void;
}

// Extend MediaTrackCapabilities to include non-standard/newer properties like focusDistance and torch
interface ExtendedMediaTrackCapabilities extends MediaTrackCapabilities {
  focusDistance?: {
    min: number;
    max: number;
    step: number;
  };
  torch?: boolean;
}

export const ScannerModal: React.FC<ScannerModalProps> = ({ isOpen, onClose, onCardFound }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [foundCard, setFoundCard] = useState<Card | null>(null);
  
  // Edition selection state
  const [availablePrints, setAvailablePrints] = useState<Card[]>([]);
  const [isFetchingPrints, setIsFetchingPrints] = useState(false);

  // Camera Capabilities State
  const [cameraCapabilities, setCameraCapabilities] = useState<ExtendedMediaTrackCapabilities | null>(null);
  const [showControls, setShowControls] = useState(false);
  const [focusValue, setFocusValue] = useState<number>(0);
  const [isTorchOn, setIsTorchOn] = useState(false);

  // Initialize Camera
  useEffect(() => {
    let stream: MediaStream | null = null;

    if (isOpen) {
      setError(null);
      setFoundCard(null);
      setAvailablePrints([]);
      setCameraCapabilities(null);
      setShowControls(false);
      
      const constraints: MediaStreamConstraints = { 
        video: { 
            facingMode: 'environment',
            width: { ideal: 1920 },
            height: { ideal: 1080 }
        } 
      };

      navigator.mediaDevices.getUserMedia(constraints)
        .then((s) => {
          stream = s;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play();
            setIsCameraActive(true);

            // Check Capabilities (Focus & Torch)
            const track = s.getVideoTracks()[0];
            const caps = track.getCapabilities() as ExtendedMediaTrackCapabilities;
            setCameraCapabilities(caps);
            
            // Set initial focus value if available
            if (caps.focusDistance) {
                // Default to a middle-range value or min
                setFocusValue(caps.focusDistance.min || 0);
            }
          }
        })
        .catch((err) => {
          console.error("Camera error:", err);
          setError("Não foi possível acessar a câmera. Verifique as permissões.");
        });
    }

    return () => {
      if (stream) {
        const track = stream.getVideoTracks()[0];
        // Turn off torch before stopping if needed
        if (isTorchOn) {
            track.applyConstraints({ advanced: [{ torch: false } as any] }).catch(() => {});
        }
        stream.getTracks().forEach(track => track.stop());
      }
      setIsCameraActive(false);
      setIsTorchOn(false);
    };
  }, [isOpen]);

  // Auto-Scan Interval Loop
  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>;

    if (isOpen && isCameraActive && !foundCard && !isScanning && !error) {
        // Try to scan every 2 seconds
        intervalId = setInterval(() => {
            captureAndScan();
        }, 2000);
    }

    return () => {
        if (intervalId) clearInterval(intervalId);
    };
  }, [isOpen, isCameraActive, foundCard, isScanning, error]);

  // Camera Control Functions
  const handleManualFocus = async (value: number) => {
      if (!videoRef.current || !videoRef.current.srcObject) return;
      const stream = videoRef.current.srcObject as MediaStream;
      const track = stream.getVideoTracks()[0];
      
      setFocusValue(value);

      try {
          await track.applyConstraints({
              advanced: [{
                  focusMode: 'manual',
                  focusDistance: value
              } as any]
          });
      } catch (err) {
          console.warn("Manual focus not supported or failed", err);
      }
  };

  const toggleTorch = async () => {
      if (!videoRef.current || !videoRef.current.srcObject) return;
      const stream = videoRef.current.srcObject as MediaStream;
      const track = stream.getVideoTracks()[0];
      const newStatus = !isTorchOn;

      try {
          await track.applyConstraints({
              advanced: [{ torch: newStatus } as any]
          });
          setIsTorchOn(newStatus);
      } catch (err) {
          console.warn("Torch failed", err);
      }
  };

  const captureAndScan = async () => {
    if (!videoRef.current || !canvasRef.current || isScanning || foundCard) return;

    setIsScanning(true);
    
    try {
      // 1. Capture Frame
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (!context) return;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      const imageBase64 = canvas.toDataURL('image/jpeg', 0.8);

      // 2. Identify with AI
      const recognitionResult = await identifyCardFromImage(imageBase64);
      
      if (!recognitionResult || !recognitionResult.name) {
         setIsScanning(false);
         return; 
      }

      // 3. Fetch Details from Scryfall
      const query = `!"${recognitionResult.name}" e:${recognitionResult.setCode}`;
      const results = await searchScryfall(query);
      
      let matchedCard: Card | null = null;

      if (results.length > 0) {
        matchedCard = results[0];
      } else {
        // Fallback
        const fallbackResults = await searchScryfall(`!"${recognitionResult.name}"`);
        if (fallbackResults.length > 0) {
           matchedCard = fallbackResults[0];
        }
      }

      if (matchedCard) {
          setFoundCard(matchedCard);
          setIsFetchingPrints(true);
          getCardPrintings(matchedCard.name).then(prints => {
              setAvailablePrints(prints);
              setIsFetchingPrints(false);
          });
          setError(null);
      }

    } catch (err: any) {
      console.warn("Scan loop error:", err);
    } finally {
      setIsScanning(false);
    }
  };

  const handleSetChange = (newSetCode: string) => {
      const selected = availablePrints.find(c => c.set === newSetCode || c.id === newSetCode);
      if (selected) {
          setFoundCard(selected);
      }
  };

  const handleConfirm = () => {
    if (foundCard) {
      onCardFound(foundCard);
      setFoundCard(null);
      setAvailablePrints([]);
      setIsScanning(false);
    }
  };

  const handleRetake = () => {
    setFoundCard(null);
    setAvailablePrints([]);
    setError(null);
    setIsScanning(false);
  };

  const supportsFocus = cameraCapabilities && 'focusDistance' in cameraCapabilities;
  const supportsTorch = cameraCapabilities && 'torch' in cameraCapabilities;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md bg-[#020604] border border-gray-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-800 bg-[#0a1410] z-20">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Camera className="text-emerald-500" size={20} /> Scanner IA
          </h3>
          <div className="flex items-center gap-2">
             {supportsTorch && !foundCard && (
                 <button 
                    onClick={toggleTorch}
                    className={`p-2 rounded-full transition-colors ${isTorchOn ? 'bg-yellow-500/20 text-yellow-400' : 'bg-gray-800 text-gray-400'}`}
                 >
                    {isTorchOn ? <Zap size={18} fill="currentColor" /> : <ZapOff size={18} />}
                 </button>
             )}
             <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors p-2">
                <X size={20} />
             </button>
          </div>
        </div>

        {/* Camera Area */}
        <div className="relative flex-1 bg-black overflow-hidden flex items-center justify-center min-h-[350px]">
          {!isCameraActive && !error && (
             <div className="flex flex-col items-center gap-2 text-gray-500">
                <Loader2 size={32} className="animate-spin text-emerald-500" />
                <span>Iniciando câmera...</span>
             </div>
          )}

          {error && !foundCard && (
             <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/80 p-6 text-center">
                <div className="flex flex-col items-center gap-3">
                  <AlertTriangle className="text-red-500" size={40} />
                  <p className="text-red-200 font-medium">{error}</p>
                  <button onClick={() => setError(null)} className="mt-2 text-sm text-gray-400 hover:text-white underline">Tentar novamente</button>
                </div>
             </div>
          )}
          
          <video 
            ref={videoRef} 
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${foundCard ? 'opacity-0' : 'opacity-100'}`}
            playsInline 
            muted 
          />
          <canvas ref={canvasRef} className="hidden" />

          {/* Scanning Overlay (Target Box) */}
          {!foundCard && isCameraActive && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-64 h-80 border-2 border-emerald-500/50 rounded-lg relative overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)_inset]">
                  {/* Scanning Scanline Animation */}
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/20 to-transparent w-full h-2 animate-[scan_2s_linear_infinite]"></div>
                  
                  {/* Corners */}
                  <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-emerald-500"></div>
                  <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-emerald-500"></div>
                  <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-emerald-500"></div>
                  <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-emerald-500"></div>
              </div>
              
              <div className="absolute bottom-20 flex flex-col items-center gap-2">
                  <div className="bg-black/60 backdrop-blur px-4 py-2 rounded-full text-xs text-white font-medium flex items-center gap-2">
                     {isScanning ? <Loader2 size={12} className="animate-spin" /> : <Camera size={12} />}
                     {isScanning ? "Analisando..." : "Posicione a carta no centro"}
                  </div>
              </div>

              {/* Manual Focus Controls (Pointer Events enabled only for slider) */}
              {supportsFocus && (
                  <div className="absolute bottom-4 left-0 right-0 px-6 pointer-events-auto flex flex-col items-center gap-2">
                      {showControls ? (
                          <div className="bg-[#0a1410]/90 border border-gray-800 p-4 rounded-xl w-full animate-in slide-in-from-bottom-2 fade-in">
                              <div className="flex justify-between text-xs text-gray-400 mb-2 font-bold uppercase">
                                  <span>Macro</span>
                                  <span>Infinito</span>
                              </div>
                              <input 
                                type="range" 
                                min={cameraCapabilities?.focusDistance?.min || 0}
                                max={cameraCapabilities?.focusDistance?.max || 100}
                                step={cameraCapabilities?.focusDistance?.step || 0.1}
                                value={focusValue}
                                onChange={(e) => handleManualFocus(parseFloat(e.target.value))}
                                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                              />
                              <button 
                                onClick={() => setShowControls(false)}
                                className="w-full mt-3 py-2 bg-gray-800 hover:bg-gray-700 text-xs font-bold rounded text-white transition-colors"
                              >
                                Fechar Ajustes
                              </button>
                          </div>
                      ) : (
                          <button 
                            onClick={() => setShowControls(true)}
                            className="bg-black/60 backdrop-blur border border-white/10 hover:bg-black/80 text-white px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 transition-all shadow-lg"
                          >
                             <Sliders size={14} /> Ajustar Foco
                          </button>
                      )}
                  </div>
              )}
            </div>
          )}

          {/* Found Card Preview Overlay */}
          {foundCard && (
             <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#0a1410] p-6 animate-in zoom-in-95 duration-300">
                 <img 
                    src={foundCard.imageUrl} 
                    alt={foundCard.name} 
                    className="w-48 rounded-xl shadow-[0_0_30px_rgba(16,185,129,0.4)] border border-emerald-500/50 mb-4 object-contain max-h-[250px]" 
                 />
                 
                 <h4 className="text-xl font-bold text-white text-center mb-1">{foundCard.name}</h4>
                 
                 {/* Edition Selector */}
                 <div className="w-full max-w-[240px] mt-2 mb-4">
                     <label className="text-[10px] text-gray-500 uppercase font-bold mb-1 block text-center">Edição Identificada</label>
                     <div className="relative">
                         <select 
                            value={foundCard.id}
                            onChange={(e) => handleSetChange(e.target.value)}
                            disabled={isFetchingPrints}
                            className="w-full bg-gray-900 border border-gray-700 text-white text-sm rounded-lg p-2.5 pr-8 appearance-none focus:border-emerald-500 focus:outline-none"
                         >
                             <option value={foundCard.id}>{foundCard.setName} ({foundCard.set}) - R$ {foundCard.priceBRL.toFixed(2)}</option>
                             {availablePrints
                                .filter(p => p.id !== foundCard.id)
                                .map(print => (
                                    <option key={print.id} value={print.id}>
                                        {print.setName} ({print.set}) - R$ {print.priceBRL.toFixed(2)}
                                    </option>
                             ))}
                         </select>
                         <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                            {isFetchingPrints ? <Loader2 size={14} className="animate-spin text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
                         </div>
                     </div>
                 </div>
             </div>
          )}
        </div>

        {/* Actions Footer */}
        <div className="p-4 bg-[#0a1410] border-t border-gray-800 shrink-0">
           {foundCard ? (
              <div className="flex gap-3">
                  <button 
                    onClick={handleRetake}
                    className="flex-1 py-3 rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-800 font-bold transition-colors flex items-center justify-center gap-2"
                  >
                    <RefreshCw size={18} /> Cancelar
                  </button>
                  <button 
                    onClick={handleConfirm}
                    className="flex-1 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2"
                  >
                    <Check size={18} /> Confirmar
                  </button>
              </div>
           ) : (
             <div className="text-center text-xs text-gray-500 py-2">
                O modo automático está ativo. Mantenha a carta estável.
             </div>
           )}
        </div>

      </div>
      <style>{`
        @keyframes scan {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}</style>
    </div>
  );
};