
import React, { useState, useEffect } from 'react';
import { X, Mail, Lock, User, ArrowRight, ShieldCheck, Github, Loader2, AlertTriangle } from 'lucide-react';
import { backendService } from '@/services/honoClient';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode: 'login' | 'register';
  onAuthSuccess: (userData: any) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialMode, onAuthSuccess }) => {
  
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [auth, setAuth] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  useEffect(() => {
    setMode(initialMode);

    if (!auth){
      setAuth(localStorage.getItem('portal_auth_token'));
    }

  }, [initialMode, auth, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    localStorage.removeItem('portal_auth_token');

    let completed = false;

    if (mode === 'login') {
      const login = await backendService.login({ email: formData.email, password: formData.password });
      if (login.success) {
        localStorage.setItem('portal_auth_token', login.authorization);
        setAuth(login.authorization);
        completed = true;
      } else {
        setError(login.error);
      }
    }

    if (mode === 'register') {
      const register = await backendService.register({ name: formData.name, email: formData.email, password: formData.password });
      if (register.success) {
        completed = true;
        setAuth(register.authorization);
        localStorage.setItem('portal_auth_token', register.authorization);
      } 
      else {
        setError(register.error);
      }
    }

    setIsLoading(false);

    if (completed) {

      const me = await backendService.me();

      if (!me.success){
        setError(me.error);
        setMode('login');
        return;
      }

      onClose();

      const mockUser = {
        name: me.name,
        email: me.email,
        avatarUrl: me.avatarUrl,
        joinDate: me.joinDate
      };

      onAuthSuccess(mockUser);

    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop com desfoque pesado */}
      <div
        className="absolute inset-0 bg-black/90 backdrop-blur-md animate-in fade-in duration-300"
        onClick={onClose}
      ></div>

      {/* Container do Modal */}
      <div className="relative w-full max-w-md bg-[#0a1410] border border-gray-800 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(16,185,129,0.1)] animate-in zoom-in-95 duration-300">

        {/* Banner de topo decorativo */}
        <div className="h-2 bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-600"></div>

        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors z-10"
        >
          <X size={24} />
        </button>

        <div className="p-8 pt-10">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-black text-white tracking-tighter">
              {mode === 'login' ? 'BEM-VINDO DE ' : 'CRIAR SUA '}
              <span className="text-emerald-500">{mode === 'login' ? 'VOLTA' : 'CONTA'}</span>
            </h2>
            <p className="text-gray-500 text-sm mt-2">
              {mode === 'login'
                ? 'Acesse sua coleção de qualquer lugar do multiverso.'
                : 'Junte-se a milhares de planeswalkers agora mesmo.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Username</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="sabóór_username"
                    className="w-full bg-black/40 border border-white/5 rounded-xl py-4 pl-12 pr-4 text-white focus:border-emerald-500 outline-none transition-all placeholder:text-gray-700"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Email Principal</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="seu@email.com"
                  className="w-full bg-black/40 border border-white/5 rounded-xl py-4 pl-12 pr-4 text-white focus:border-emerald-500 outline-none transition-all placeholder:text-gray-700"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Senha Élfica</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                <input
                  type="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  className="w-full bg-black/40 border border-white/5 rounded-xl py-4 pl-12 pr-4 text-white focus:border-emerald-500 outline-none transition-all placeholder:text-gray-700"
                />
              </div>
            </div>

            {mode === 'login' && (
              <div className="flex justify-end">
                <button type="button" className="text-xs text-gray-500 hover:text-emerald-500 transition-colors">Esqueceu a senha?</button>
              </div>
            )}

            {/* Error Badge Inline */}
            {error && (
              <div className="animate-in slide-in-from-top-2 fade-in duration-300">
                <div className="relative bg-gradient-to-r from-red-950/80 to-red-900/60 rounded-xl p-4 overflow-hidden">
                  {/* Glow line on left */}
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-red-500 via-red-400 to-orange-500" />

                  <div className="flex items-start gap-3 pl-2">
                    {/* Icon */}
                    <div className="shrink-0 w-8 h-8 bg-red-900/50 rounded-lg flex items-center justify-center border border-red-700/30">
                      <AlertTriangle className="text-red-400" size={16} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-red-300 mb-0.5">
                        {mode === 'login' ? 'Falha no login' : 'Falha no registro'}
                      </p>
                      <p className="text-xs text-red-400/80 leading-relaxed">
                        {error}
                      </p>
                    </div>

                    {/* Close button */}
                    <button
                      type="button"
                      onClick={() => setError(null)}
                      className="shrink-0 p-1 text-red-500/60 hover:text-red-300 hover:bg-red-800/30 rounded-md transition-all"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-black py-4 rounded-xl shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 group mt-4"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  {mode === 'login' ? 'ENTRAR NO PORTAL' : 'CRIAR MINHA CONTA'}
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 text-center">
            <button
              onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
              className="text-sm text-gray-500 hover:text-white transition-colors"
            >
              {mode === 'login' ? 'Não tem uma conta?' : 'Já possui uma conta?'}
              <span className="text-emerald-500 font-bold ml-1 hover:underline">
                {mode === 'login' ? 'Crie agora' : 'Faça login'}
              </span>
            </button>
          </div>

          <div className="mt-8 flex items-center justify-center gap-2 text-gray-700">
            <ShieldCheck size={14} />
            <span className="text-[10px] font-bold uppercase tracking-tighter">Conexão Segura AES-256</span>
          </div>
        </div>
      </div>
    </div>
  );
};
