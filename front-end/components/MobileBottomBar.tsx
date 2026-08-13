
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
  const itemClass = 'flex-1 flex flex-col items-center justify-center gap-1 h-full text-portal-muted hover:text-portal-text active:scale-95 transition-all';
  const activeClass = 'text-portal-accent';

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 h-[84px] glass-panel z-[90] pb-[env(safe-area-inset-bottom)]">
      <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-portal-accent/70 to-transparent" />
      <div className="flex items-center justify-between px-2 h-full relative">
        
        {/* Center Main Action - Owned/Stats - Toggles "My Collection" View */}
        <div className="absolute left-1/2 -translate-x-1/2 -top-7">
            <button 
                onClick={onToggleOwned}
                className={`flex flex-col items-center justify-center w-[68px] h-[68px] rounded-2xl shadow-[0_20px_38px_rgba(0,0,0,0.45),0_0_28px_rgba(16,185,129,0.24)] hover:scale-105 active:scale-95 transition-all ${isOwnedViewActive ? 'bg-portal-text text-portal-bg' : 'bg-portal-accent text-black'}`}
            >
                <Trophy size={24} fill="currentColor" />
                <span className="text-[9px] font-black mt-0.5">{ownedCount}</span>
            </button>
            <div className="text-center mt-1">
                 <span className="text-[10px] font-mono font-bold text-portal-gold bg-black/70 px-2 py-0.5 rounded-full shadow-sm whitespace-nowrap">
                    R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                 </span>
            </div>
        </div>

        <button 
            onClick={onOpenCollections}
            className={itemClass}
        >
            <Layers size={22} className={activeTab === 'collections' ? activeClass : ''} />
            <span className={`text-[10px] font-semibold ${activeTab === 'collections' ? activeClass : ''}`}>Coleções</span>
        </button>

        <button 
            onClick={onOpenList}
            className={`${itemClass} mr-9`}
        >
            <List size={22} className={activeTab === 'list' ? activeClass : ''} />
            <span className={`text-[10px] font-semibold ${activeTab === 'list' ? activeClass : ''}`}>Lista</span>
        </button>

        <button 
            onClick={onShare}
            className={`${itemClass} ml-9`}
        >
            <Share2 size={22} className={activeTab === 'share' ? activeClass : ''} />
            <span className={`text-[10px] font-semibold ${activeTab === 'share' ? activeClass : ''}`}>Enviar</span>
        </button>

        <button 
            onClick={onOpenProfile}
            className={itemClass}
        >
            <User size={22} className={activeTab === 'profile' ? activeClass : ''} />
            <span className={`text-[10px] font-semibold ${activeTab === 'profile' ? activeClass : ''}`}>Perfil</span>
        </button>

      </div>
    </div>
  );
};


