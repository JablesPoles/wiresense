import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import * as Avatar from '@radix-ui/react-avatar';
import { User, Shield, Key, Mail, Camera, Save, LogOut, Loader, Zap, Trophy, Activity, Calendar, Settings } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { updateProfile } from 'firebase/auth';
import { useAchievements } from '../contexts/AchievementsContext'; // Import Achievements
import { motion } from 'framer-motion';

const ProfilePage = () => {
    const { currentUser: user } = useAuth();
    const { t } = useLanguage();
    const { stats, unlockedBadges, getBadgeProgress } = useAchievements(); // Get stats

    const [displayName, setDisplayName] = useState(user?.displayName || '');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    if (!user) return null;

    const handleUpdateProfile = async () => {
        setLoading(true);
        setMessage('');
        try {
            await updateProfile(user, { displayName: displayName });
            setMessage(t('profile_updated'));
        } catch (error) {
            console.error("Error updating profile", error);
            setMessage(t('profile_error'));
        } finally {
            setLoading(false);
        }
    };

    // Calculate generic "Level" based on badges or stats
    const userLevel = Math.floor(unlockedBadges.length / 3) + 1;
    const progressToNextLevel = ((unlockedBadges.length % 3) / 3) * 100;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
                    <User className="text-gray-400" />
                    {t('profile')}
                    <span className="text-muted-foreground font-normal text-xl mx-2">/</span>
                    <span className="text-2xl text-emerald-400">{displayName || 'User'}</span>
                </h1>
                <p className="text-muted-foreground">
                    {t('profile_desc')}
                </p>
            </div>

            {/* Bento Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* 1. Identity Card (Left, Tall) */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="md:row-span-2 bg-card border border-border rounded-3xl p-8 flex flex-col items-center text-center shadow-lg relative overflow-hidden group"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    <div className="relative mb-6 z-10">
                        <div className="absolute -inset-4 bg-emerald-500/20 rounded-full blur-xl animate-pulse"></div>
                        <Avatar.Root className="relative h-40 w-40 rounded-full overflow-hidden border-4 border-card bg-black/40 shadow-2xl flex items-center justify-center">
                            <Avatar.Image src={user.photoURL} className="h-full w-full object-cover" />
                            <Avatar.Fallback className="text-5xl font-bold text-gray-500">
                                {user.email?.charAt(0).toUpperCase()}
                            </Avatar.Fallback>
                        </Avatar.Root>
                        <div className="absolute bottom-2 right-2 p-2 bg-emerald-500 rounded-full text-white shadow-lg border-2 border-card" title="Pro Account">
                            <Shield size={16} fill="currentColor" />
                        </div>
                    </div>

                    <h2 className="text-2xl font-bold text-white mb-1 z-10">{displayName || 'Energy Master'}</h2>
                    <p className="text-sm text-gray-400 mb-6 z-10">{user.email}</p>

                    <div className="w-full bg-muted/50 rounded-xl p-4 mb-6 z-10 border border-border/50">
                        <div className="flex justify-between items-end mb-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Level {userLevel}</span>
                            <span className="text-xs text-emerald-400 font-mono">{unlockedBadges.length} Badges</span>
                        </div>
                        <div className="h-2 bg-black/20 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${progressToNextLevel}%` }}
                                transition={{ duration: 1, delay: 0.5 }}
                                className="h-full bg-emerald-500 rounded-full"
                            />
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-2 text-left">
                            {3 - (unlockedBadges.length % 3)} more badges to Level {userLevel + 1}
                        </p>
                    </div>

                    <div className="mt-auto w-full z-10">
                        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground bg-muted/30 py-2 rounded-lg">
                            <Calendar size={12} />
                            Given access on {new Date(user.metadata.creationTime).toLocaleDateString()}
                        </div>
                    </div>
                </motion.div>

                {/* 2. Stats Overview (Top Right, Wide) */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="md:col-span-2 bg-card border border-border rounded-3xl p-6 relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 p-32 bg-emerald-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                    <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                        <Activity size={20} className="text-emerald-500" />
                        {t('performance_overview')}
                    </h3>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-4 rounded-2xl bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors">
                            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{t('savings')}</p>
                            <p className="text-2xl font-bold text-emerald-400">
                                <span className="text-sm align-top opacity-70">$</span>{stats.totalSavings.toFixed(0)}
                            </p>
                        </div>
                        <div className="p-4 rounded-2xl bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors">
                            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{t('generated')}</p>
                            <p className="text-2xl font-bold text-amber-400">
                                {stats.totalGeneration.toFixed(0)}<span className="text-sm text-muted-foreground font-normal ml-1">kWh</span>
                            </p>
                        </div>
                        <div className="p-4 rounded-2xl bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors">
                            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{t('simulations')}</p>
                            <p className="text-2xl font-bold text-cyan-400">
                                {stats.simulationsRun}
                            </p>
                        </div>
                        <div className="p-4 rounded-2xl bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors">
                            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{t('streak')}</p>
                            <p className="text-2xl font-bold text-purple-400">
                                {stats.daysActive} <span className="text-sm text-muted-foreground font-normal">{t('days')}</span>
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* 3. Edit Form (Middle Right) */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="md:col-span-2 bg-card border border-border rounded-3xl p-6 lg:p-8"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <Settings className="text-emerald-500" size={20} />
                            {t('personal_info')}
                        </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">{t('display_name')}</label>
                            <div className="relative">
                                <User className="absolute left-3 top-3 text-muted-foreground" size={16} />
                                <input
                                    type="text"
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    className="w-full bg-muted/30 border border-border rounded-xl py-2.5 pl-10 pr-4 focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all"
                                    placeholder="Enter your name"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">{t('email')}</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 text-muted-foreground" size={16} />
                                <input
                                    type="email"
                                    value={user.email}
                                    disabled
                                    className="w-full bg-muted/50 border border-border rounded-xl py-2.5 pl-10 pr-4 text-muted-foreground/70 cursor-not-allowed"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 flex items-center justify-between">
                        <div className="text-sm">
                            {message && (
                                <span className={message.includes('Erro') ? 'text-red-400' : 'text-emerald-400'}>
                                    {message}
                                </span>
                            )}
                        </div>
                        <button
                            onClick={handleUpdateProfile}
                            disabled={loading || displayName === user?.displayName}
                            className="flex items-center gap-2 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold rounded-xl transition-all shadow-lg hover:shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? <Loader className="animate-spin" size={18} /> : <Save size={18} />}
                            {t('save_changes')}
                        </button>
                    </div>
                </motion.div>

                {/* 4. Security / Footer (Bottom) */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="md:col-span-3 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4"
                >
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
                            <Shield size={20} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-emerald-400">Account Secured by Google</p>
                            <p className="text-xs text-muted-foreground">Session ID: {user.uid.slice(0, 12)}...</p>
                        </div>
                    </div>

                    <button className="text-xs text-muted-foreground hover:text-white transition-colors underline decoration-dotted">
                        Request Data Export
                    </button>
                </motion.div>

            </div>
        </div>
    );
};

export default ProfilePage;
