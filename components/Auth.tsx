
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
        <div className="min-h-screen flex items-center justify-center bg-[#050b14] overflow-hidden relative font-['Outfit'] selection:bg-indigo-500/30">
            {/* Dynamic Background */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-30 mix-blend-overlay pointer-events-none"></div>

            {/* Animated Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)]"></div>

            {/* Ambient Orbs */}
            <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-indigo-600/20 rounded-full blur-[120px] animate-[pulse_8s_ease-in-out_infinite]"
                style={{ transform: `translate(${mousePosition.x * -2}px, ${mousePosition.y * -2}px)` }}></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[100px] animate-[pulse_10s_ease-in-out_infinite_reverse]"
                style={{ transform: `translate(${mousePosition.x * -2}px, ${mousePosition.y * -2}px)` }}></div>
            <div className="absolute top-[40%] left-[50%] w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[100px] animate-pulse delay-700"
                style={{ transform: `translate(-50%, -50%) translate(${mousePosition.x * 1}px, ${mousePosition.y * 1}px)` }}></div>

            <div className="w-full max-w-[420px] p-6 relative z-10 perspective-[2000px]">
                {/* Main Glass Card */}
                <div
                    className="backdrop-blur-3xl bg-slate-900/40 border border-white/10 rounded-[3rem] p-1.5 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8),0_0_0_1px_rgba(255,255,255,0.05)_inset] overflow-hidden transition-all duration-500 group relative"
                    style={{ transform: `rotateX(${mousePosition.y * 0.2}deg) rotateY(${mousePosition.x * 0.2}deg)` }}
                >
                    {/* Glossy sheen overlay */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-transparent pointer-events-none z-20 opacity-50"></div>

                    {/* Inner Content Container */}
                    <div className="bg-gradient-to-br from-slate-900/90 to-slate-950/90 p-8 md:p-12 rounded-[2.5rem] h-full relative overflow-hidden z-10">

                        {/* Header Section */}
                        <div className="text-center mb-10 relative">
                            <div className="relative inline-block mb-6 group-hover:scale-110 transition-transform duration-700 ease-out">
                                <div className="absolute inset-0 bg-indigo-500 blur-3xl opacity-30 group-hover:opacity-60 transition-opacity duration-700"></div>
                                <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-slate-800 to-black border border-slate-700 flex items-center justify-center relative shadow-2xl ring-1 ring-white/10 overflow-hidden">
                                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.2),transparent_70%)]"></div>
                                    <i className={`fa-solid ${isLogin ? 'fa-fingerprint' : 'fa-dna'} text-4xl bg-clip-text text-transparent bg-gradient-to-br from-indigo-400 via-purple-400 to-cyan-400 drop-shadow-[0_0_15px_rgba(99,102,241,0.5)] transition-all duration-500 ${isLogin ? 'scale-100' : 'scale-110 rotate-12'}`}></i>
                                </div>
                                <div className="absolute -bottom-3 -right-3 w-10 h-10 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center shadow-lg animate-bounce delay-1000">
                                    <i className="fa-solid fa-shield-halved text-xs text-emerald-400"></i>
                                </div>
                            </div>

                            <h1 className="text-4xl font-black text-white tracking-tighter mb-2 animate-in slide-in-from-bottom-2 fade-in duration-700 bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-400">
                                {isLogin ? 'Welcome Back' : 'Join NeuralNet'}
                            </h1>
                            <p className="text-slate-400 text-xs font-bold tracking-[0.2em] uppercase opacity-70">
                                {isLogin ? 'Authenticate to Access Core' : 'Initialize New Identity'}
                            </p>
                        </div>

                        {/* Error Notification */}
                        {error && (
                            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-4 animate-in shake zoom-in duration-300 backdrop-blur-md">
                                <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center shrink-0 border border-red-500/30">
                                    <i className="fa-solid fa-triangle-exclamation text-red-400 text-xs"></i>
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[9px] font-black text-red-500 uppercase tracking-widest mb-0.5">Access Denied</p>
                                    <p className="text-xs text-red-200/80 font-medium truncate">{error}</p>
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleEmailAuth} className="space-y-4">
                            {!isLogin && (
                                <div className="group/input relative">
                                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within/input:text-indigo-400 transition-colors">
                                        <i className="fa-regular fa-user text-sm"></i>
                                    </div>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Identity Name"
                                        className="w-full bg-slate-800/80 border border-slate-700/50 rounded-2xl px-12 py-4 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500/50 focus:bg-slate-800 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium shadow-inner"
                                    />
                                </div>
                            )}

                            <div className="group/input relative">
                                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within/input:text-indigo-400 transition-colors">
                                    <i className="fa-regular fa-envelope text-sm"></i>
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Access ID (Email)"
                                    className="w-full bg-slate-800/80 border border-slate-700/50 rounded-2xl px-12 py-4 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500/50 focus:bg-slate-800 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium shadow-inner"
                                />
                            </div>

                            <div className="group/input relative">
                                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within/input:text-indigo-400 transition-colors">
                                    <i className="fa-solid fa-lock text-sm"></i>
                                </div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Security Key"
                                    className="w-full bg-slate-800/80 border border-slate-700/50 rounded-2xl px-12 py-4 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500/50 focus:bg-slate-800 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium shadow-inner"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full mt-4 relative overflow-hidden group/btn bg-white text-slate-950 rounded-2xl p-[1px] shadow-[0_0_30px_-10px_rgba(255,255,255,0.3)] hover:shadow-[0_0_50px_-10px_rgba(99,102,241,0.6)] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 animate-[shimmer_2s_linear_infinite] opacity-0 group-hover/btn:opacity-100 transition-opacity"></div>
                                <div className="relative bg-white hover:bg-opacity-90 rounded-[14px] py-4 transition-all flex items-center justify-center gap-3">
                                    {loading ? (
                                        <i className="fa-solid fa-circle-notch fa-spin text-indigo-600"></i>
                                    ) : (
                                        <>
                                            <span className="font-black text-sm tracking-widest uppercase">{isLogin ? 'Authorize Entry' : 'Initialize System'}</span>
                                            <i className="fa-solid fa-arrow-right-long text-indigo-600 group-hover/btn:translate-x-1 transition-transform"></i>
                                        </>
                                    )}
                                </div>
                            </button>
                        </form>

                        <div className="my-8 flex items-center gap-4 opacity-30">
                            <div className="h-px bg-gradient-to-r from-transparent via-slate-400 to-transparent flex-1"></div>
                            <span className="text-[8px] text-slate-400 font-black uppercase tracking-[0.2em]">Key Exchange</span>
                            <div className="h-px bg-gradient-to-r from-transparent via-slate-400 to-transparent flex-1"></div>
                        </div>

                        <button
                            onClick={handleGoogleSignIn}
                            disabled={loading}
                            className="w-full py-4 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-3 group/google disabled:opacity-50 hover:shadow-lg hover:-translate-y-0.5"
                        >
                            <div className="p-1.5 bg-white rounded-full">
                                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-4 h-4" />
                            </div>
                            <span className="group-hover/google:text-white transition-colors">Continue with Google</span>
                        </button>

                        <div className="mt-8 text-center">
                            <button
                                onClick={() => setIsLogin(!isLogin)}
                                className="text-xs text-slate-500 hover:text-white transition-colors font-medium group/toggle"
                            >
                                <span className="opacity-70">{isLogin ? "New user? " : "Existing user? "}</span>
                                <span className="text-indigo-400 group-hover/toggle:text-indigo-300 font-bold ml-1 relative">
                                    {isLogin ? "Generate Access ID" : "Login to Terminal"}
                                    <span className="absolute -bottom-1 left-0 w-0 h-px bg-indigo-400 group-hover/toggle:w-full transition-all duration-300"></span>
                                </span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer Status */}
                <div className="mt-8 text-center space-y-3 opacity-40 hover:opacity-100 transition-opacity duration-500">
                    <div className="flex justify-center items-center gap-2">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.3em]">
                            Neural Backbone: Online
                        </p>
                    </div>
                    {(Capacitor.isNativePlatform() || import.meta.env.DEV) && (
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-900/80 rounded-full border border-slate-800">
                            <i className={`fa-brands ${Capacitor.getPlatform() === 'web' ? 'fa-chrome' : 'fa-android'} text-[10px] text-slate-500`}></i>
                            <p className="text-[8px] text-slate-500 font-mono tracking-wider">
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
