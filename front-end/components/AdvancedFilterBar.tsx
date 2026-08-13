import React from 'react';
import { X } from 'lucide-react';
import { AdvancedFilters } from '../types';

interface AdvancedFilterBarProps {
  filters: AdvancedFilters;
  onFilterChange: (key: keyof AdvancedFilters, value: string) => void;
  onClear: () => void;
}

const mana = [
  ['W', 'Branco'], ['U', 'Azul'], ['B', 'Preto'], ['R', 'Vermelho'], ['G', 'Verde'], ['C', 'Incolor'], ['M', 'Multicolorida'],
] as const;

export const AdvancedFilterBar: React.FC<AdvancedFilterBarProps> = ({ filters, onFilterChange, onClear }) => {
  const activeCount = Object.values(filters).filter(Boolean).length;
  const field = 'w-full bg-portal-bg/70 rounded-xl text-xs px-3 py-2.5 text-portal-text placeholder-portal-muted focus:ring-2 focus:ring-portal-accent/35 focus:outline-none transition-colors shadow-inner';

  return (
    <div className="px-4 sm:px-8 pb-4 animate-in slide-in-from-top-2 duration-200 fade-in">
      <div className="glass-panel rounded-2xl p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3 mb-4 pb-3">
          <div>
            <div className="text-[10px] font-black text-portal-accent uppercase tracking-[0.22em]">Filtros do grimório</div>
            <div className="text-xs text-portal-muted mt-1">Refine por mana, raridade, custo e corpo.</div>
          </div>
          {activeCount > 0 && (
            <button onClick={onClear} className="shrink-0 inline-flex items-center gap-1.5 text-xs text-portal-muted hover:text-portal-danger transition-colors">
              <X size={14} /> Limpar ({activeCount})
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-2">
            <label className="block text-[10px] font-bold text-portal-muted uppercase tracking-wider mb-2">Cor</label>
            <div className="flex flex-wrap gap-2">
              {mana.map(([id, label]) => {
                const selected = filters.color === id;
                return (
                  <button
                    key={id}
                    title={label}
                    onClick={() => onFilterChange('color', selected ? '' : id)}
                    className={`h-9 min-w-9 rounded-full text-xs font-black transition-all ${selected ? 'bg-portal-accent text-black shadow-[0_0_18px_rgba(16,185,129,0.35)] scale-105' : 'bg-portal-bg/70 text-portal-muted hover:text-portal-text hover:bg-white/10'}`}
                  >
                    {id}
                  </button>
                );
              })}
            </div>
          </div>

          <label className="block">
            <span className="block text-[10px] font-bold text-portal-muted uppercase tracking-wider mb-2">Raridade</span>
            <select value={filters.rarity} onChange={(e) => onFilterChange('rarity', e.target.value)} className={field}>
              <option value="">Todas</option>
              <option value="common">Comum</option>
              <option value="uncommon">Incomum</option>
              <option value="rare">Rara</option>
              <option value="mythic">Mítica</option>
            </select>
          </label>

          <label className="block">
            <span className="block text-[10px] font-bold text-portal-muted uppercase tracking-wider mb-2">CMC</span>
            <select value={filters.cmc} onChange={(e) => onFilterChange('cmc', e.target.value)} className={field}>
              <option value="">Qualquer</option>
              {[0, 1, 2, 3, 4, 5, 6].map(v => <option key={v} value={v}>{v}</option>)}
              <option value="7+">7+</option>
            </select>
          </label>

          <div>
            <span className="block text-[10px] font-bold text-portal-muted uppercase tracking-wider mb-2">P / R</span>
            <div className="grid grid-cols-2 gap-2">
              <input type="number" placeholder="Poder" value={filters.power} onChange={(e) => onFilterChange('power', e.target.value)} className={field} />
              <input type="number" placeholder="Resist." value={filters.toughness} onChange={(e) => onFilterChange('toughness', e.target.value)} className={field} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};