import React from 'react';
import { motion } from 'framer-motion';

const LoadingScreen = () => {
    return (
        <div className="fixed inset-0 bg-background flex flex-col items-center justify-center z-[9999]">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-grid-white/[0.02]" style={{ backgroundSize: '30px 30px' }} />
            <div className="absolute inset-0 bg-gradient-radial from-violet-500/10 via-transparent to-transparent opacity-50" />

            {/* Logo/Spinner Container */}
            <div className="relative flex flex-col items-center gap-8">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="relative"
                >
                    {/* Hexagon Pulse Effect */}
                    <motion.div
                        className="absolute inset-0 bg-primary rounded-full blur-xl opacity-20"
                        animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    />

                    {/* Logo Text/Icon */}
                    <div className="bg-card w-24 h-24 rounded-2xl border border-primary/50 flex items-center justify-center shadow-[0_0_30px_-5px_hsl(var(--primary))] relative overflow-hidden backdrop-blur-xl">
                        <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent" />
                        <span className="text-4xl font-bold bg-gradient-to-br from-white to-primary bg-clip-text text-transparent">W</span>
                    </div>
                </motion.div>

                {/* Loading Bar */}
                <div className="w-64 space-y-2">
                    <div className="h-1 w-full bg-muted/20 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-gradient-to-r from-primary via-purple-500 to-indigo-500"
                            initial={{ x: '-100%' }}
                            animate={{ x: '100%' }}
                            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                        />
                    </div>
                    <p className="text-center text-xs font-mono text-primary/70 animate-pulse tracking-widest">INITIALIZING_SYSTEM...</p>
                </div>
            </div>
        </div>
    );
};

export default LoadingScreen;
