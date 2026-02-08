
import React, { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';
import {
    signInWithPopup,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithCredential,
    GoogleAuthProvider,
    auth,
    googleProvider
} from '../services/firebase';

const Auth: React.FC = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePosition({
                x: (e.clientX / window.innerWidth) * 20 - 10,
                y: (e.clientY / window.innerHeight) * 20 - 10,
            });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isLogin) {
                await signInWithEmailAndPassword(auth, email, password);
            } else {
                await createUserWithEmailAndPassword(auth, email, password);
            }
        } catch (err: any) {
            console.error(err);
            if (err.code === 'auth/api-key-not-valid-please-pass-a-valid-api-key') {
                setError('System Error: Invalid API Configuration');
            } else {
                setError(err.message || 'Authentication Failed');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setLoading(true);
        setError(null);
        try {
            const isNative = Capacitor.isNativePlatform();
            let userCredential;

            if (isNative) {
                const result = await FirebaseAuthentication.signInWithGoogle();
                const idToken = result.credential?.idToken;
                if (!idToken) throw new Error('Security Compliance Failed: No Token');

                const credential = GoogleAuthProvider.credential(idToken);
                userCredential = await signInWithCredential(auth, credential);
            } else {
                userCredential = await signInWithPopup(auth, googleProvider);
            }
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Security Handshake Failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0f172a] overflow-hidden relative font-['Outfit'] selection:bg-indigo-500/30">
            {/* Dynamic Background */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>

            {/* Ambient Orbs */}
            <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-indigo-600/30 rounded-full blur-[120px] animate-[pulse_8s_ease-in-out_infinite]"
                style={{ transform: `translate(${mousePosition.x * -2}px, ${mousePosition.y * -2}px)` }}></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-cyan-500/20 rounded-full blur-[100px] animate-[pulse_10s_ease-in-out_infinite_reverse]"
                style={{ transform: `translate(${mousePosition.x * -2}px, ${mousePosition.y * -2}px)` }}></div>

            <div className="w-full max-w-[420px] p-6 relative z-10 perspective-1000">
                {/* Main Glass Card */}
                <div
                    className="backdrop-blur-2xl bg-slate-900/60 border border-white/10 rounded-[2.5rem] p-1 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] overflow-hidden transition-all duration-500 group"
                    style={{ transform: `rotateX(${mousePosition.y * 0.1}deg) rotateY(${mousePosition.x * 0.1}deg)` }}
                >
                    {/* Inner Content Container */}
                    <div className="bg-gradient-to-br from-white/[0.03] to-transparent p-8 md:p-10 rounded-[2.3rem] h-full relative overflow-hidden">

                        {/* Decorative Top Line */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50 blur-[1px]"></div>

                        {/* Header Section */}
                        <div className="text-center mb-10 relative">
                            <div className="relative inline-block mb-6 group-hover:scale-105 transition-transform duration-500">
                                <div className="absolute inset-0 bg-indigo-500 blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
                                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 flex items-center justify-center relative shadow-2xl">
                                    <i className={`fa-solid ${isLogin ? 'fa-fingerprint' : 'fa-dna'} text-3xl bg-clip-text text-transparent bg-gradient-to-br from-indigo-400 to-cyan-400 drop-shadow-[0_0_10px_rgba(99,102,241,0.5)]`}></i>
                                </div>
                                <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center">
                                    <i className="fa-solid fa-shield-halved text-[10px] text-emerald-400"></i>
                                </div>
                            </div>

                            <h1 className="text-3xl font-black text-white tracking-tight mb-2 animate-in slide-in-from-bottom-2 fade-in duration-500">
                                {isLogin ? 'Welcome Back' : 'Join NeuralNet'}
                            </h1>
                            <p className="text-slate-400 text-xs font-medium tracking-wide uppercase opacity-70">
                                {isLogin ? 'Authenticate to Access Core' : 'Initialize New Identity'}
                            </p>
                        </div>

                        {/* Error Notification */}
                        {error && (
                            <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-4 animate-in shake zoom-in duration-300">
                                <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
                                    <i className="fa-solid fa-triangle-exclamation text-red-400 text-xs"></i>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-0.5">Access Denied</p>
                                    <p className="text-xs text-red-200/80 font-medium">{error}</p>
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleEmailAuth} className="space-y-5">
                            {!isLogin && (
                                <div className="group/input relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within/input:text-indigo-400 transition-colors">
                                        <i className="fa-regular fa-user text-sm"></i>
                                    </div>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Identity Name"
                                        className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-12 py-4 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-indigo-500/50 focus:bg-slate-900/80 focus:ring-1 focus:ring-indigo-500/50 transition-all font-medium"
                                    />
                                </div>
                            )}

                            <div className="group/input relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within/input:text-indigo-400 transition-colors">
                                    <i className="fa-regular fa-envelope text-sm"></i>
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Access ID (Email)"
                                    className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-12 py-4 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-indigo-500/50 focus:bg-slate-900/80 focus:ring-1 focus:ring-indigo-500/50 transition-all font-medium"
                                />
                            </div>

                            <div className="group/input relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within/input:text-indigo-400 transition-colors">
                                    <i className="fa-solid fa-lock text-sm"></i>
                                </div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Security Key"
                                    className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-12 py-4 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-indigo-500/50 focus:bg-slate-900/80 focus:ring-1 focus:ring-indigo-500/50 transition-all font-medium"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full relative overflow-hidden group/btn bg-white text-slate-900 rounded-xl p-[1px] shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_-5px_rgba(99,102,241,0.5)] transition-shadow duration-300"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 animate-[shimmer_2s_linear_infinite] opacity-0 group-hover/btn:opacity-100 transition-opacity"></div>
                                <div className="relative bg-white hover:bg-opacity-95 rounded-[11px] py-4 transition-all flex items-center justify-center gap-3">
                                    {loading ? (
                                        <i className="fa-solid fa-circle-notch fa-spin text-indigo-600"></i>
                                    ) : (
                                        <>
                                            <span className="font-bold text-sm tracking-wide">{isLogin ? 'Authorize Entry' : 'Initialize System'}</span>
                                            <i className="fa-solid fa-arrow-right-long text-indigo-600 group-hover/btn:translate-x-1 transition-transform"></i>
                                        </>
                                    )}
                                </div>
                            </button>
                        </form>

                        <div className="my-8 flex items-center gap-4 opacity-50">
                            <div className="h-px bg-gradient-to-r from-transparent via-slate-500 to-transparent flex-1"></div>
                            <span className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">Biometric Alt</span>
                            <div className="h-px bg-gradient-to-r from-transparent via-slate-500 to-transparent flex-1"></div>
                        </div>

                        <button
                            onClick={handleGoogleSignIn}
                            disabled={loading}
                            className="w-full py-4 bg-slate-800/50 border border-slate-700 hover:bg-slate-800 hover:border-slate-600 text-white rounded-xl font-bold text-sm transition-all shadow-lg flex items-center justify-center gap-3 group/google disabled:opacity-50"
                        >
                            <div className="p-1 bg-white rounded-full">
                                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-4 h-4" />
                            </div>
                            <span className="group-hover/google:text-white transition-colors">Continue with Google</span>
                        </button>

                        <div className="mt-8 text-center">
                            <button
                                onClick={() => setIsLogin(!isLogin)}
                                className="text-xs text-slate-500 hover:text-white transition-colors font-medium group/toggle"
                            >
                                {isLogin ? "New user? " : "Existing user? "}
                                <span className="text-indigo-400 group-hover/toggle:text-indigo-300 underline underline-offset-4 decoration-indigo-400/30">
                                    {isLogin ? "Generate Access ID" : "Login to Terminal"}
                                </span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer Status */}
                <div className="mt-8 text-center space-y-2 opacity-60 hover:opacity-100 transition-opacity duration-500">
                    <div className="flex justify-center items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                        <p className="text-[9px] text-slate-500 font-black uppercase tracking-[0.3em]">
                            System Status: Online
                        </p>
                    </div>
                    {(Capacitor.isNativePlatform() || import.meta.env.DEV) && (
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-800/50 rounded-full border border-slate-700/50">
                            <i className="fa-brands fa-android text-[10px] text-slate-400"></i>
                            <p className="text-[8px] text-slate-400 font-mono">
                                {Capacitor.getPlatform() === 'web' ? 'WEB EMULATION' : 'NATIVE KERNEL'}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Auth;
