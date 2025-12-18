import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Zap, Mail, Lock, Loader2, ArrowRight, CheckCircle2 } from 'lucide-react';

const LoginPage = () => {
    const { loginGoogle } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('google'); // 'google' | 'email'
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const canvasRef = React.useRef(null);

    // Particle Network Animation
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let animationFrameId;
        let particles = [];

        // Mouse state for interaction
        const mouse = { x: null, y: null, radius: 150 };

        const handleMouseMove = (event) => {
            mouse.x = event.clientX;
            mouse.y = event.clientY;
        };
        window.addEventListener('mousemove', handleMouseMove);

        // Colors: Cyan, Purple, Pink, Emerald, Amber (RGB)
        const colors = [
            '6, 182, 212',   // Cyan
            '168, 85, 247',  // Purple
            '236, 72, 153',  // Pink
            '16, 185, 129',  // Emerald
            '245, 158, 11'   // Amber
        ];

        const init = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            particles = [];
            const particleCount = window.innerWidth < 768 ? 30 : 80; // Mobile: 30, Desktop: 80

            for (let i = 0; i < particleCount; i++) {
                particles.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    vx: (Math.random() - 0.5) * 0.5, // Slow velocity
                    vy: (Math.random() - 0.5) * 0.5,
                    size: Math.random() * 2 + 2, // 2px - 4px
                    color: colors[Math.floor(Math.random() * colors.length)]
                });
            }
        };

        const render = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Update and Draw Particles
            particles.forEach((p, i) => {
                // Mouse Repulsion logic
                if (mouse.x != null) {
                    const dx = mouse.x - p.x;
                    const dy = mouse.y - p.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < mouse.radius) {
                        const forceDirectionX = dx / distance;
                        const forceDirectionY = dy / distance;
                        const force = (mouse.radius - distance) / mouse.radius;
                        const directionX = forceDirectionX * force * 0.6; // Push strength
                        const directionY = forceDirectionY * force * 0.6;

                        p.vx -= directionX;
                        p.vy -= directionY;
                    }
                }

                p.x += p.vx;
                p.y += p.vy;

                // Friction to stabilize movement
                const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
                if (speed > 1) {
                    p.vx *= 0.95;
                    p.vy *= 0.95;
                }

                // Bounce
                if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
                if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

                // Draw Particle
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${p.color}, 0.8)`; // Bright dots
                ctx.fill();

                // Draw Connections
                for (let j = i + 1; j < particles.length; j++) {
                    const p2 = particles[j];
                    const dx = p.x - p2.x;
                    const dy = p.y - p2.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    const maxDist = 250; // Connection range

                    if (distance < maxDist) {
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(${p.color}, ${0.5 * (1 - distance / maxDist)})`; // Brighter lines (0.5 opacity)
                        ctx.lineWidth = 1;
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.stroke();
                    }
                }
            });

            animationFrameId = requestAnimationFrame(render);
        };

        init();
        render();

        const handleResize = () => {
            init();
        };

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

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
            setError('Fail to authenticate with Google.');
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
            // Email login simulation
            await new Promise(r => setTimeout(r, 1000));
            setError('Email login temporarily disabled. Please use Google.');
        } catch (err) {
            setError('Error logging in.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-[#050505] text-white selection:bg-cyan-500/30">
            {/* Dynamic Background: Canvas Network */}
            <canvas
                ref={canvasRef}
                className="absolute inset-0 z-0 opacity-80"
            />

            {/* Grid Overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

            {/* Main Card */}
            <div className="w-full max-w-[420px] relative z-10 perspective-1000">
                <div className="relative bg-black/40 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden ring-1 ring-white/5 animate-in fade-in zoom-in-95 duration-500 p-8">

                    {/* Header */}
                    <div className="flex flex-col items-center mb-10 text-center space-y-4">
                        <div className="relative group cursor-default">
                            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-2xl blur-lg opacity-20 group-hover:opacity-40 transition-opacity duration-500" />
                            <div className="relative p-4 bg-background/50 border border-white/10 rounded-2xl backdrop-blur-md shadow-xl">
                                <Zap className="w-8 h-8 text-transparent bg-clip-text bg-gradient-to-br from-cyan-400 to-emerald-400 fill-cyan-400/10" />
                            </div>
                        </div>

                        <div>
                            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-br from-white via-white/90 to-white/50 bg-clip-text text-transparent mb-2">
                                Wiresense
                            </h1>
                            <p className="text-sm font-medium tracking-widest text-cyan-500/80 uppercase mb-1">
                                Monitor • Manage • Master
                            </p>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="grid grid-cols-2 p-1 mb-8 bg-black/20 rounded-xl border border-white/5">
                        <button
                            onClick={() => setActiveTab('google')}
                            className={`flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all duration-300 ${activeTab === 'google'
                                ? 'bg-white/10 text-white shadow-sm ring-1 ring-white/5'
                                : 'text-gray-500 hover:text-gray-300'
                                }`}
                        >
                            Google
                        </button>
                        <button
                            onClick={() => setActiveTab('email')}
                            className={`flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all duration-300 ${activeTab === 'email'
                                ? 'bg-white/10 text-white shadow-sm ring-1 ring-white/5'
                                : 'text-gray-500 hover:text-gray-300'
                                }`}
                        >
                            Email
                        </button>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 text-sm animate-in slide-in-from-top-2">
                            <CheckCircle2 className="w-4 h-4 shrink-0" />
                            {error}
                        </div>
                    )}

                    {/* Forms */}
                    <div className="relative min-h-[160px]">
                        {activeTab === 'google' ? (
                            <div className="animate-in fade-in slide-in-from-left-4 duration-300 space-y-6">
                                <div className="space-y-2 text-center">
                                    <h3 className="text-lg font-semibold text-white">Welcome Back</h3>
                                    <p className="text-sm text-gray-400 max-w-[280px] mx-auto leading-relaxed">
                                        Use your Google account to access your dashboard securely and instantly.
                                    </p>
                                </div>

                                <button
                                    onClick={handleGoogleLogin}
                                    disabled={loading}
                                    className="w-full group relative flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-black font-semibold py-3.5 px-4 rounded-xl transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)] hover:shadow-[0_0_25px_-5px_rgba(255,255,255,0.4)]"
                                >
                                    {loading ? (
                                        <Loader2 className="w-5 h-5 animate-spin text-black" />
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                                <path d="M5.84 14.17c-.22-.66-.35-1.36-.35-2.17s.13-1.51.35-2.17V7.01H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.99l3.66-2.82z" fill="#FBBC05" />
                                                <path d="M12 4.63c1.61 0 3.1.56 4.28 1.69l3.22-3.21C17.45 1.18 14.96 0 12 0 7.7 0 3.99 2.47 2.18 7.01l3.66 2.82c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                            </svg>
                                            <span className="tracking-wide">Continue with Google</span>
                                            <ArrowRight className="w-4 h-4 opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300 text-black/50" />
                                        </>
                                    )}
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleEmailLogin} className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">Email Address</label>
                                    <div className="relative group">
                                        <Mail className="absolute left-3 top-3.5 text-gray-500 group-focus-within:text-cyan-400 transition-colors" size={18} />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 focus:bg-white/10 transition-all"
                                            placeholder="name@example.com"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">Password</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-3 top-3.5 text-gray-500 group-focus-within:text-cyan-400 transition-colors" size={18} />
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 focus:bg-white/10 transition-all"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full mt-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold py-3.5 px-4 rounded-xl transition-all duration-300 shadow-lg shadow-cyan-900/20 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Sign In'}
                                </button>
                            </form>
                        )}
                    </div>
                </div>

                {/* Footer simple link */}
                <div className="text-center mt-8">
                    <p className="text-xs text-gray-500 hover:text-gray-400 transition-colors cursor-pointer">
                        Secure Enterprise Access • v2.4.0
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
