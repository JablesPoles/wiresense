import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import * as Avatar from '@radix-ui/react-avatar';
import { User, Mail, Shield, Camera, Save, Loader } from 'lucide-react';
import { updateProfile } from 'firebase/auth';

const ProfilePage = () => {
    const { currentUser } = useAuth();
    const [name, setName] = useState(currentUser?.displayName || '');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    if (!currentUser) return null;

    const handleUpdateProfile = async () => {
        setLoading(true);
        setMessage('');
        try {
            await updateProfile(currentUser, { displayName: name });
            setMessage('Perfil atualizado com sucesso!');
        } catch (error) {
            console.error("Error updating profile", error);
            setMessage('Erro ao atualizar perfil.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                Meu Perfil
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Avatar & Overview */}
                <div className="col-span-1 space-y-6">
                    <div className="bg-card/50 border border-border/50 rounded-2xl p-8 flex flex-col items-center text-center shadow-lg backdrop-blur-sm relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                        <div className="relative mb-4">
                            <Avatar.Root className="h-32 w-32 rounded-full overflow-hidden border-4 border-white/10 bg-black/40 shadow-2xl flex items-center justify-center">
                                <Avatar.Image src={currentUser.photoURL} className="h-full w-full object-cover" />
                                <Avatar.Fallback className="text-4xl font-bold text-gray-500">
                                    {currentUser.email?.charAt(0).toUpperCase()}
                                </Avatar.Fallback>
                            </Avatar.Root>
                            <button className="absolute bottom-0 right-0 p-2 bg-emerald-500 rounded-full text-white shadow-lg hover:bg-emerald-400 transition-colors" title="Alterar Foto (Gerenciado pelo Google)">
                                <Camera size={16} />
                            </button>
                        </div>

                        <h2 className="text-xl font-bold text-white mb-1">{name || 'Usuário'}</h2>
                        <p className="text-sm text-gray-400 bg-white/5 px-3 py-1 rounded-full">{currentUser.email}</p>
                    </div>
                </div>

                {/* Right Column: Edit Form */}
                <div className="col-span-1 lg:col-span-2 space-y-6">
                    <div className="bg-card border border-border rounded-xl p-6 lg:p-8 shadow-sm">
                        <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                            <User size={20} className="text-emerald-400" />
                            Informações Pessoais
                        </h3>

                        <div className="space-y-6 max-w-xl">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-400">Nome de Exibição</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-[#09090b] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                                    placeholder="Seu nome"
                                />
                                <p className="text-xs text-muted-foreground">Este nome será visível no dashboard e relatórios.</p>
                            </div>

                            <div className="space-y-2 opacity-60">
                                <label className="text-sm font-medium text-gray-400">Email (Gerenciado pelo Google)</label>
                                <div className="flex items-center gap-3 w-full bg-[#09090b] border border-white/5 rounded-lg px-4 py-3 text-gray-500 cursor-not-allowed">
                                    <Mail size={16} />
                                    <span>{currentUser.email}</span>
                                </div>
                            </div>

                            <div className="pt-4 flex items-center gap-4">
                                <button
                                    onClick={handleUpdateProfile}
                                    disabled={loading || name === currentUser.displayName}
                                    className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold px-6 py-2.5 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
                                >
                                    {loading ? <Loader size={18} className="animate-spin" /> : <Save size={18} />}
                                    <span>Salvar Alterações</span>
                                </button>
                                {message && (
                                    <span className={`text-sm ${message.includes('Erro') ? 'text-red-400' : 'text-emerald-400'}`}>
                                        {message}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Security Badge */}
                    <div className="bg-blue-500/5 border border-blue-500/10 rounded-xl p-6 flex items-start gap-4">
                        <div className="p-3 bg-blue-500/10 rounded-lg text-blue-400">
                            <Shield size={24} />
                        </div>
                        <div>
                            <h4 className="text-base font-medium text-blue-100 mb-1">Conta Segura</h4>
                            <p className="text-sm text-blue-200/60 leading-relaxed">
                                Você está autenticado via <strong>Google Secure Login</strong> (UID: {currentUser.uid.slice(0, 8)}...).
                                Sua senha e métodos de recuperação são gerenciados diretamente pelo Google para máxima segurança.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
