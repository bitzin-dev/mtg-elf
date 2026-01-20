
import React, { useState } from 'react';
import { Layers, List, Package, Save, Plus, User, Settings, X, Search, Trash2, LogOut, Edit2, Check } from 'lucide-react';
import { backendService } from '../services/honoClient';
import { SavedSearch } from '../types';
import { UserCollection } from '../../backend/services/types';

interface DashboardSidebarProps {
  collections: UserCollection[];
  activeCollectionId: string | null;
  onSelectCollection: (id: string) => void;
  onCreateCollection: () => void;
  onDeleteCollection?: (id: string) => void;
  isOpen?: boolean; // Mobile state
  onClose?: () => void; // Mobile close trigger
  onOpenGlobalList?: (type: 'buy' | 'print') => void;
  buyListCount?: number;
  printListCount?: number;
  savedSearches?: SavedSearch[];
  onSaveSearch?: () => void;
  onLoadSearch?: (search: SavedSearch) => void;
  onDeleteSearch?: (id: string) => void;
  onProfileClick?: () => void;
  onLogout?: () => void;
  user?: {
    name: string;
    email: string;
    avatarUrl?: string;
  };
}

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  collections,
  activeCollectionId,
  onSelectCollection,
  onCreateCollection,
  onDeleteCollection,
  isOpen = false,
  onClose,
  onOpenGlobalList,
  buyListCount = 0,
  printListCount = 0,
  savedSearches = [],
  onSaveSearch,
  onLoadSearch,
  onDeleteSearch,
  onProfileClick,
  onLogout,
  user
}) => {
  const activeCollection = collections.find(c => c.id === activeCollectionId);

  console.log(activeCollection);
  console.log(collections);
  console.log(activeCollectionId);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const handleStartEdit = (e: React.MouseEvent, id: string, currentName: string) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingId(id);
    setEditName(currentName);
  };

  const handleCancelEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingId(null);
  };

  const handleSaveRename = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!editName.trim()) return;

    const res = await backendService.renameCollection({ collectionId: id, newName: editName });
    if (res && res.success) {
      setEditingId(null);
      window.location.reload();
    } else {
      console.error("Rename failed:", res);
      alert(`Erro ao renomear: ${(res as any)?.error || 'Erro desconhecido'}`);
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/80 z-40 lg:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      <aside className={`
            w-64 bg-[#020604]/95 lg:bg-black/40 border-r border-portal-border flex flex-col h-screen fixed left-0 top-0 overflow-y-auto z-50 backdrop-blur-md lg:backdrop-blur-sm
            transition-transform duration-300 ease-in-out
            ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
        <div className="p-6 flex justify-between items-start">
          <h1 className="text-white font-bold text-lg leading-tight">
            PORTAL DE COLEÇÕES <br />
            <span className="text-gray-400">MTG</span>
          </h1>
          {/* Mobile Close Button */}
          <button onClick={onClose} className="lg:hidden text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-8">
          {/* Coleção Atual */}
          {activeCollection && (
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Coleção Atual</h3>
              <div className="bg-portal-surface border border-portal-border rounded-lg p-3 flex items-center gap-3 cursor-pointer hover:border-portal-accent transition-colors group">
                <Settings className="text-portal-accent group-hover:animate-spin-slow" size={20} />
                <div className="overflow-hidden">
                  <div className="text-portal-accent font-bold text-sm truncate">{activeCollection.name}</div>
                  <div className="text-[10px] text-gray-500 truncate">{activeCollection.query}</div>
                </div>
              </div>
            </div>
          )}

          {/* Minhas Listas */}
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Minhas Listas</h3>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => onOpenGlobalList && onOpenGlobalList('buy')}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-300 rounded-md hover:bg-portal-surface hover:text-white transition-colors bg-portal-accent/10 border border-transparent hover:border-portal-border group"
                >
                  <List size={16} className="text-emerald-400" />
                  <span className="flex-1 text-left">Lista de Compras</span>
                  {buyListCount > 0 && (
                    <span className="bg-emerald-900 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-800">
                      {buyListCount}
                    </span>
                  )}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenGlobalList && onOpenGlobalList('print')}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-300 rounded-md hover:bg-portal-surface hover:text-white transition-colors bg-portal-accent/10 border border-transparent hover:border-portal-border group"
                >
                  <Package size={16} className="text-purple-400" />
                  <span className="flex-1 text-left">Lista de Impressão</span>
                  {printListCount > 0 && (
                    <span className="bg-purple-900 text-purple-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-purple-800">
                      {printListCount}
                    </span>
                  )}
                </button>
              </li>
            </ul>
          </div>

          {/* Minhas Coleções */}
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Minhas Coleções</h3>

            <div className="space-y-2">
              {collections.length === 0 && (
                <div className="text-xs text-gray-600 italic px-2">Nenhuma coleção criada.</div>
              )}
              {collections.map(col => (
                <div key={col.id} className="flex items-center gap-1 group">
                  <div
                    onClick={() => {
                      onSelectCollection(col.id);
                      if (onClose) onClose();
                    }}
                    className={`flex-1 flex items-center gap-2 p-2 border rounded text-sm transition-colors text-left min-w-0 cursor-pointer ${activeCollectionId === col.id
                      ? 'bg-portal-surface/80 border-portal-accent/50 text-white'
                      : 'bg-portal-surface/20 border-portal-border/50 text-gray-400 hover:text-white hover:border-gray-500'
                      }`}
                  >
                    <Layers size={14} className={activeCollectionId === col.id ? "text-emerald-500" : ""} />
                    <div className="flex-1 min-w-0">
                      {editingId === col.id ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-gray-800 border border-emerald-500/50 rounded px-1 py-0.5 text-white text-xs w-full focus:outline-none"
                            autoFocus
                          />
                          <button onClick={(e) => handleSaveRename(e, col.id)} className="text-emerald-500 hover:text-emerald-400">
                            <Check size={12} />
                          </button>
                          <button onClick={handleCancelEdit} className="text-red-500 hover:text-red-400">
                            <X size={12} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between group/title">
                          <div className="truncate text-xs font-bold">{col.name}</div>
                          <button
                            onClick={(e) => handleStartEdit(e, col.id, col.name)}
                            className="opacity-0 group-hover/title:opacity-100 text-gray-500 hover:text-white transition-opacity"
                            title="Renomear"
                          >
                            <Edit2 size={10} />
                          </button>
                        </div>
                      )}
                      <div className="text-[9px] opacity-60">{new Date(col.createdAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (onDeleteCollection) onDeleteCollection(col.id);
                    }}
                    className="p-2 text-gray-600 hover:text-red-500 transition-colors shrink-0"
                    title="Excluir Coleção"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}

              <button
                onClick={() => {
                  onCreateCollection();
                  if (onClose) onClose();
                }}
                className="w-full flex items-center justify-center gap-2 p-2 border border-dashed border-gray-600 rounded text-sm text-gray-400 hover:text-white hover:border-gray-400 hover:bg-gray-800 transition-colors mt-4"
              >
                <Plus size={16} /> Nova Coleção
              </button>
            </div>
          </div>

          {/* Pesquisas Salvas */}
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Pesquisas Salvas</h3>

            {savedSearches.length === 0 ? (
              <div className="text-xs text-gray-600 px-2 italic mb-3">Nenhuma pesquisa salva</div>
            ) : (
              <div className="space-y-2 mb-3">
                {savedSearches.map(search => (
                  <div
                    key={search.id}
                    className="flex items-center gap-1 group"
                  >
                    <div
                      onClick={() => {
                        if (onLoadSearch) onLoadSearch(search);
                        if (onClose) onClose();
                      }}
                      className="flex-1 flex items-center gap-2 p-2 rounded bg-gray-900/50 hover:bg-gray-800 border border-transparent hover:border-gray-700 transition-colors text-left min-w-0 cursor-pointer"
                    >
                      <Search size={12} className="text-emerald-500 shrink-0" />
                      <span className="text-xs text-gray-300 truncate">{search.name}</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (onDeleteSearch) onDeleteSearch(search.id);
                      }}
                      className="p-2 text-gray-600 hover:text-red-500 transition-colors shrink-0"
                      title="Excluir Pesquisa"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={onSaveSearch}
              className="w-full flex items-center justify-center gap-2 p-2 bg-portal-accent hover:bg-portal-accentHover text-black font-bold text-sm rounded transition-colors shadow-[0_0_10px_rgba(16,185,129,0.2)]"
            >
              <Save size={16} /> Salvar Pesquisa Atual
            </button>
          </div>
        </nav>

        {/* User Profile Footer */}
        <div className="p-4 border-t border-portal-border bg-black/20 mt-auto">
          <button
            onClick={onProfileClick}
            className="w-full flex items-center gap-3 p-2 rounded hover:bg-gray-800/50 transition-colors group text-left"
          >
            <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold border-2 border-purple-400 group-hover:border-white transition-colors overflow-hidden">
              <img src={user?.avatarUrl || "https://i.pravatar.cc/150?img=11"} alt="User" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-white truncate group-hover:text-emerald-400 transition-colors">{user?.name || 'Usuário'}</div>
              <div className="text-[10px] text-gray-500 truncate group-hover:text-gray-400">Ver Perfil</div>
            </div>
            <Settings size={14} className="text-gray-600 group-hover:text-white transition-colors" />
          </button>

          {/* Logout Button */}
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 p-2 mt-2 rounded bg-red-900/20 text-red-400 hover:bg-red-900/40 hover:text-red-300 hover:border-red-700 transition-colors text-sm font-bold"
          >
            <LogOut size={16} />
            Sair da Conta
          </button>
        </div>
        <div className="px-4 pb-2 text-[10px] text-gray-700 text-center">
          v2.4.4 Beta
        </div>
      </aside>
    </>
  );
};
