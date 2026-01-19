
import React, { useState, useRef } from 'react';
import { Mail, Calendar, Camera, Award, Layers, Zap, Check, Loader2, CheckCircle, Edit2 } from 'lucide-react';
import { UserCollection } from '../../backend/services/types';

interface UserProfileProps {
    user: {
        name: string;
        email: string;
        joinDate: string;
        avatarUrl?: string;
    };
    onUpdateProfile: (data: any) => void;
    collections: UserCollection[];
    totalCardsOwned: number;
}

export const UserProfile: React.FC<UserProfileProps> = ({
    user,
    onUpdateProfile,
    collections,
    totalCardsOwned
}) => {
    const [formData, setFormData] = useState({
        name: user.name,
    });

    // Update local state when user prop changes (e.g. after backend fetch)
    React.useEffect(() => {
        setFormData({ name: user.name });
        setAvatarPreview(user.avatarUrl);
    }, [user]);

    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    // Refs for hidden file inputs
    const avatarInputRef = useRef<HTMLInputElement>(null);

    // Local state for image previews (before saving)
    const [avatarPreview, setAvatarPreview] = useState(user.avatarUrl);

    const handleSave = () => {
        setIsSaving(true);
        // Simulate API call persistence
        setTimeout(() => {
            onUpdateProfile({
                ...formData,
                avatarUrl: avatarPreview,
            });
            setIsSaving(false);
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        }, 800);
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target?.result) {
                    const result = event.target.result as string;
                    setAvatarPreview(result);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-12 animate-in fade-in duration-500 pb-24">

            {/* Hidden Inputs */}
            <input type="file" ref={avatarInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />

            {/* Profile Container */}
            <div className="max-w-4xl mx-auto space-y-10">

                {/* Header Banner & Info */}
                <div className="relative bg-[#0a1410] border border-gray-800 rounded-3xl overflow-hidden shadow-2xl group">
                    {/* Banner */}
                    <div className="h-40 bg-gradient-to-r from-emerald-950 via-[#05100a] to-purple-950 relative overflow-hidden">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0a1410]/90"></div>

                        {/* Decorative Circles */}
                        <div className="absolute -top-20 -right-20 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl"></div>
                        <div className="absolute top-10 left-10 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl"></div>
                    </div>

                    {/* User Info Overlay */}
                    <div className="px-10 pb-10 relative flex flex-col md:flex-row items-end md:items-center gap-8 -mt-16">
                        <div className="relative group/avatar">
                            <div
                                onClick={() => avatarInputRef.current?.click()}
                                className="w-32 h-32 rounded-full border-[6px] border-[#0a1410] bg-gray-800 shadow-2xl overflow-hidden relative cursor-pointer"
                            >
                                <img src={avatarPreview || "https://i.pravatar.cc/300?img=11"} alt="Profile" className="w-full h-full object-cover transition-transform duration-500 group-hover/avatar:scale-110" />
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity backdrop-blur-sm">
                                    <Camera size={28} className="text-white drop-shadow-lg" />
                                </div>
                            </div>
                            <div className="absolute bottom-2 right-0 bg-emerald-500 text-black p-2 rounded-full border-[4px] border-[#0a1410] shadow-lg" title="Online">
                                <Zap size={14} fill="currentColor" />
                            </div>
                        </div>

                        <div className="flex-1 mb-2">
                            <h1 className="text-3xl font-black text-white tracking-tight mb-2">{formData.name}</h1>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                                <span className="flex items-center gap-2 px-3 py-1 bg-black/30 rounded-full border border-gray-800"><Mail size={14} className="text-emerald-500" /> {user.email}</span>
                                <span className="flex items-center gap-2 px-3 py-1 bg-black/30 rounded-full border border-gray-800"><Calendar size={14} className="text-blue-500" /> Desde {new Date(user.joinDate).getFullYear()}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* Stats Card */}
                    <div className="bg-[#0a1410] border border-gray-800 rounded-3xl p-8 shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-32 bg-emerald-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

                        <h3 className="text-sm font-bold text-emerald-500 uppercase tracking-widest mb-8 flex items-center gap-2 relative z-10">
                            <Award size={16} /> Estatísticas
                        </h3>

                        <div className="space-y-4 relative z-10">
                            <div className="flex items-center justify-between p-4 bg-black/40 rounded-2xl border border-gray-800/50 hover:border-gray-700 transition-colors group">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-purple-900/20 rounded-xl text-purple-400 group-hover:scale-110 transition-transform"><Layers size={20} /></div>
                                    <span className="text-gray-300 font-medium text-sm">Coleções</span>
                                </div>
                                <span className="text-xl font-black text-white">{collections.length}</span>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-black/40 rounded-2xl border border-gray-800/50 hover:border-gray-700 transition-colors group">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-emerald-900/20 rounded-xl text-emerald-400 group-hover:scale-110 transition-transform"><Award size={20} /></div>
                                    <span className="text-gray-300 font-medium text-sm">Cartas Possuídas</span>
                                </div>
                                <span className="text-xl font-black text-white">{totalCardsOwned}</span>
                            </div>
                        </div>
                    </div>

                    {/* Edit Username */}
                    <div className="bg-[#0a1410] border border-gray-800 rounded-3xl p-8 shadow-xl">
                        <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-800">
                            <h3 className="text-lg font-bold text-white flex items-center gap-3">
                                <Edit2 size={18} className="text-emerald-500" /> Editar Perfil
                            </h3>
                            {saveSuccess && (
                                <div className="text-emerald-500 text-sm font-bold flex items-center gap-2 animate-in fade-in slide-in-from-right">
                                    <CheckCircle size={16} /> Salvo!
                                </div>
                            )}
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-3">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Username</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    disabled
                                    onChange={(e) => handleInputChange('name', e.target.value)}
                                    className="w-full bg-black/20 border border-gray-800 rounded-xl px-5 py-4 text-gray-500 cursor-not-allowed"
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Email</label>
                                <input
                                    type="email"
                                    value={user.email}
                                    disabled
                                    className="w-full bg-black/20 border border-gray-800 rounded-xl px-5 py-4 text-gray-500 cursor-not-allowed"
                                />
                                <p className="text-xs text-gray-600">O email não pode ser alterado.</p>
                            </div>
                        </div>

                        <div className="mt-8">
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-4 rounded-xl font-bold shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(16,185,129,0.4)] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                            >
                                {isSaving ? <Loader2 size={20} className="animate-spin" /> : <Check size={20} />}
                                {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};
