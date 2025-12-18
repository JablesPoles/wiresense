import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAchievements, BADGES } from '../contexts/AchievementsContext';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Check, Lock, Award, Shield } from 'lucide-react';

import { useLocation } from 'react-router-dom';

const AchievementsPage = () => {
    const { unlockedBadges, equippedBadgeId, equipBadge, unequipBadge, getBadgeProgress } = useAchievements();
    const { theme } = useTheme();
    const { t } = useLanguage();
    const location = useLocation();
    const [highlightedId, setHighlightedId] = useState(null);

    // Auto-scroll to badge if navigated from notification
    React.useEffect(() => {
        if (location.state?.highlightBadgeId) {
            const badgeId = location.state.highlightBadgeId;
            setHighlightedId(badgeId);

            // Wait a small tick for render
            setTimeout(() => {
                const element = document.getElementById(`badge-${badgeId}`);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 100);

            // Clear highlight after animation
            const timer = setTimeout(() => setHighlightedId(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [location.state]);

    // Group badges by Tier
    const tiers = ['bronze', 'silver', 'gold', 'legendary'];
    const groupedBadges = tiers.reduce((acc, tier) => {
        acc[tier] = BADGES.filter(b => b.tier === tier);
        return acc;
    }, {});

    const tierColors = {
        bronze: { border: 'border-orange-700/50', bg: 'bg-orange-900/10', text: 'text-orange-400', name: t('tier_bronze') },
        silver: { border: 'border-slate-400/50', bg: 'bg-slate-800/20', text: 'text-slate-300', name: t('tier_silver') },
        gold: { border: 'border-yellow-500/50', bg: 'bg-yellow-900/20', text: 'text-yellow-400', name: t('tier_gold') },
        legendary: { border: 'border-purple-500/50', bg: 'bg-purple-900/20', text: 'text-purple-400', name: t('tier_legendary') }
    };

    const handleBadgeClick = (badge, isUnlocked) => {
        if (!isUnlocked) return;
        if (equippedBadgeId === badge.id) {
            unequipBadge();
        } else {
            equipBadge(badge.id);
        }
    };

    return (
        <div className="space-y-12 animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
                        <Award className="text-yellow-500" size={32} />
                        {t('achievements')}
                        <span className="text-sm px-3 py-1 rounded-full border bg-primary/10 border-primary/20 text-primary font-mono">
                            {unlockedBadges.length}/{BADGES.length}
                        </span>
                    </h1>
                    <p className="text-muted-foreground mt-2 max-w-xl">
                        {t('achievements_desc')}
                    </p>
                </div>
            </div>

            {/* Tiers Grid */}
            <div className="space-y-12">
                {tiers.map((tier) => {
                    const badges = groupedBadges[tier];
                    if (badges.length === 0) return null;
                    const style = tierColors[tier];

                    return (
                        <div key={tier} className="space-y-6">
                            <h2 className={`text-xl font-bold uppercase tracking-widest flex items-center gap-2 ${style.text} border-b border-white/5 pb-2`}>
                                <Shield size={18} className={style.text} />
                                {t('level')} {style.name}
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {badges.map((badge) => {
                                    const isUnlocked = unlockedBadges.includes(badge.id);
                                    const isEquipped = equippedBadgeId === badge.id;
                                    const progress = getBadgeProgress(badge.id);
                                    const Icon = badge.icon;

                                    return (
                                        <motion.div
                                            key={badge.id}
                                            id={`badge-${badge.id}`}
                                            layout
                                            onClick={() => handleBadgeClick(badge, isUnlocked)}
                                            whileHover={isUnlocked ? { scale: 1.02, y: -2 } : {}}
                                            animate={highlightedId === badge.id ? {
                                                scale: [1, 1.05, 1],
                                                boxShadow: "0 0 20px rgba(234, 179, 8, 0.5)",
                                                borderColor: "rgba(234, 179, 8, 0.8)"
                                            } : {}}
                                            transition={{ duration: 0.5 }}
                                            className={`
                                                relative p-6 rounded-xl border flex flex-col gap-4 transition-all duration-300
                                                ${isUnlocked
                                                    ? `cursor-pointer ${style.bg} ${style.border} hover:shadow-lg hover:shadow-${style.text.split('-')[1]}-500/10`
                                                    : 'bg-card/30 border-white/5 opacity-60 grayscale cursor-not-allowed'
                                                }
                                                ${isEquipped ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''}
                                                ${highlightedId === badge.id ? 'ring-2 ring-yellow-500 ring-offset-2 ring-offset-background z-10' : ''}
                                            `}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div className={`p-3 rounded-xl ${isUnlocked ? 'bg-black/20 text-white' : 'bg-white/5 text-white/20'}`}>
                                                    <Icon size={28} />
                                                </div>
                                                {isEquipped && (
                                                    <div className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full font-bold flex items-center gap-1 shadow-lg">
                                                        <Check size={12} /> {t('equipped')}
                                                    </div>
                                                )}
                                                {!isUnlocked && (
                                                    <Lock size={18} className="text-white/20" />
                                                )}
                                            </div>

                                            <div>
                                                <h3 className={`font-bold text-lg ${isUnlocked ? 'text-white' : 'text-white/50'}`}>
                                                    {t(badge.nameKey)}
                                                </h3>
                                                <p className="text-sm text-muted-foreground mt-1 min-h-[40px]">
                                                    {t(badge.descKey)}
                                                </p>
                                            </div>

                                            {/* Progress Bar */}
                                            <div className="space-y-1.5 pt-2 border-t border-white/5">
                                                <div className="flex justify-between text-xs font-mono opacity-80">
                                                    <span>{t('progress')}</span>
                                                    <span>{Math.floor(progress.current)} / {progress.max}</span>
                                                </div>
                                                <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${progress.percent}%` }}
                                                        className={`h-full rounded-full ${isUnlocked ? style.text.replace('text', 'bg') : 'bg-white/20'}`}
                                                    />
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default AchievementsPage;
