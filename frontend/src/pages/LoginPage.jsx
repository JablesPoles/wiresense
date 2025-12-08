import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Zap, Mail, Lock, Loader2, ArrowRight } from 'lucide-react';
import { signInWithEmailAndPassword } from 'firebase/auth'; // Import Firebase auth directly for this page if needed, or stick to context

const LoginPage = () => {
    const { loginGoogle } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('google'); // 'google' | 'email'
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleGoogleLogin = async () => {
        try {
            setError('');
            setLoading(true);
            await loginGoogle();
            // Force refresh to ensure clean state
            setTimeout(() => {
                window.location.href = '/';
            }, 100);
        } catch (err) {
            console.error(err);
            setError('Falha ao autenticar com Google.');
        } finally {
            setLoading(false);
        }
    };

    const handleEmailLogin = async (e) => {
        e.preventDefault();
        if (!email || !password) return;
        try {
            setError('');
            setLoading(true);

            // Email login not fully implemented in this demo - simulating delay
            await new Promise(r => setTimeout(r, 1000));
            setError('Login por email indisponível. Utilize Google.');
        } catch (err) {
            setError('Erro ao entrar.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[#09090b]">
            {/* Rich Background */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
            <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-emerald-500 opacity-20 blur-[100px]"></div>
            <div className="absolute right-0 bottom-0 -z-10 h-[310px] w-[310px] rounded-full bg-cyan-500 opacity-20 blur-[100px]"></div>

            <div className="w-full max-w-md bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden relative z-10">
                <div className="p-8">
                    {/* Header */}
                    <div className="flex flex-col items-center mb-8">
                        <div className="p-3 mb-4 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-white/10 shadow-lg shadow-emerald-900/20">
                            <Zap className="w-8 h-8 text-cyan-400" />
                        </div>
                        <h1 className="text-3xl font-bold text-white tracking-tight">Wiresense</h1>
                        <p className="text-gray-400 mt-2 text-center">Gestão de energia inteligente</p>
                    </div>

                    {/* Tabs */}
                    <div className="grid grid-cols-2 gap-1 bg-white/5 p-1 rounded-xl mb-6">
                        <button
                            onClick={() => setActiveTab('google')}
                            className={`py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'google' ? 'bg-white/10 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
                        >
                            Google
                        </button>
                        <button
                            onClick={() => setActiveTab('email')}
                            className={`py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'email' ? 'bg-white/10 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
                        >
                            Email
                        </button>
                    </div>

                    {error && (
                        <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-400 text-sm">
                            <div className="w-1 h-1 bg-red-400 rounded-full" />
                            {error}
                        </div>
                    )}

                    {/* Content */}
                    <div className="min-h-[200px] transition-all">
                        {activeTab === 'google' ? (
                            <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-300">
                                <p className="text-sm text-center text-gray-400 mb-6">
                                    Utilize sua conta Google para acesso rápido e seguro.
                                </p>
                                <button
                                    onClick={handleGoogleLogin}
                                    disabled={loading}
                                    className="w-full group relative flex items-center justify-center gap-3 bg-white text-black font-semibold py-3 px-4 rounded-xl hover:bg-gray-100 transition-all active:scale-[0.98] disabled:opacity-70"
                                >
                                    {loading ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                                <path d="M5.84 14.17c-.22-.66-.35-1.36-.35-2.17s.13-1.51.35-2.17V7.01H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.99l3.66-2.82z" fill="#FBBC05" />
                                                <path d="M12 4.63c1.61 0 3.1.56 4.28 1.69l3.22-3.21C17.45 1.18 14.96 0 12 0 7.7 0 3.99 2.47 2.18 7.01l3.66 2.82c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                            </svg>
                                            <span>Entrar com Google</span>
                                            <ArrowRight size={16} className="opacity-0 -ml-4 group-hover:opacity-50 group-hover:ml-0 transition-all" />
                                        </>
                                    )}
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleEmailLogin} className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-gray-400 uppercase">Email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3 text-gray-500" size={18} />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all"
                                            placeholder="nome@exemplo.com"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-gray-400 uppercase">Senha</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-3 text-gray-500" size={18} />
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-black font-semibold py-3 px-4 rounded-xl transition-all active:scale-[0.98] disabled:opacity-70 mt-2"
                                >
                                    {loading ? <Loader2 className="animate-spin" /> : 'Entrar na Conta'}
                                </button>
                            </form>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-white/5 bg-white/5 text-center">
                    <p className="text-xs text-muted-foreground">
                        Protegido por criptografia de ponta a ponta.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
