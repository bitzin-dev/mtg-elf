
import React from 'react';
import { Layers, List, Share2, User, Trophy } from 'lucide-react';

interface MobileBottomBarProps {
  onOpenCollections: () => void;
  onOpenList: () => void;
  onShare: () => void;
  onOpenProfile: () => void;
  onToggleOwned: () => void;
  ownedCount: number;
  totalValue: number;
  activeTab?: string;
  isOwnedViewActive?: boolean;
}

export const MobileBottomBar: React.FC<MobileBottomBarProps> = ({
  onOpenCollections,
  onOpenList,
  onShare,
  onOpenProfile,
  onToggleOwned,
  ownedCount,
  totalValue,
  activeTab,
  isOwnedViewActive
}) => {
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 h-[80px] bg-[#020604] border-t border-gray-800 z-[90] pb-2">
      <div className="flex items-center justify-between px-2 h-full relative">
        
        {/* Center Main Action - Owned/Stats - Toggles "My Collection" View */}
        <div className="absolute left-1/2 -translate-x-1/2 -top-6">
            <button 
                onClick={onToggleOwned}
                className={`flex flex-col items-center justify-center w-16 h-16 rounded-full border-[4px] border-[#020604] shadow-[0_0_20px_rgba(16,185,129,0.4)] text-black hover:scale-105 transition-all ${isOwnedViewActive ? 'bg-white' : 'bg-emerald-600'}`}
            >
                <Trophy size={24} fill="currentColor" className={isOwnedViewActive ? 'text-emerald-600' : 'text-white'} />
                <span className={`text-[9px] font-black mt-0.5 ${isOwnedViewActive ? 'text-emerald-600' : 'text-white'}`}>{ownedCount}</span>
            </button>
            <div className="text-center mt-1">
                 <span className="text-[10px] font-bold text-emerald-500 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-900 shadow-sm whitespace-nowrap">
                    R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                 </span>
            </div>
        </div>

        <button 
            onClick={onOpenCollections}
            className="flex-1 flex flex-col items-center justify-center gap-1 h-full text-gray-500 hover:text-white active:scale-95 transition-all"
        >
            <Layers size={22} className={activeTab === 'collections' ? 'text-emerald-500' : ''} />
            <span className={`text-[10px] font-medium ${activeTab === 'collections' ? 'text-emerald-500' : ''}`}>Coleções</span>
        </button>

        <button 
            onClick={onOpenList}
            className="flex-1 flex flex-col items-center justify-center gap-1 h-full text-gray-500 hover:text-white active:scale-95 transition-all mr-8"
        >
            <List size={22} className={activeTab === 'list' ? 'text-blue-500' : ''} />
            <span className={`text-[10px] font-medium ${activeTab === 'list' ? 'text-blue-500' : ''}`}>Lista</span>
        </button>

        <button 
            onClick={onShare}
            className="flex-1 flex flex-col items-center justify-center gap-1 h-full text-gray-500 hover:text-white active:scale-95 transition-all ml-8"
        >
            <Share2 size={22} className={activeTab === 'share' ? 'text-pink-500' : ''} />
            <span className={`text-[10px] font-medium ${activeTab === 'share' ? 'text-pink-500' : ''}`}>Compartilhar</span>
        </button>

        <button 
            onClick={onOpenProfile}
            className="flex-1 flex flex-col items-center justify-center gap-1 h-full text-gray-500 hover:text-white active:scale-95 transition-all"
        >
            <User size={22} className={activeTab === 'profile' ? 'text-purple-500' : ''} />
            <span className={`text-[10px] font-medium ${activeTab === 'profile' ? 'text-purple-500' : ''}`}>Perfil</span>
        </button>

      </div>
    </div>
  );
};
