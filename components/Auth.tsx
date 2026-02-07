
import React, { useState } from 'react';
import {
    signInWithPopup,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
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

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isLogin) {
                await signInWithEmailAndPassword(auth, email, password);
            } else {
                await createUserWithEmailAndPassword(auth, email, password);
                // Additional user setup (like profile name) can go here if needed
            }
        } catch (err: any) {
            console.error(err);
            if (err.code === 'auth/api-key-not-valid-please-pass-a-valid-api-key') {
                setError('Firebase API Key is missing. Please check .env or firebase.ts');
            } else {
                setError(err.message || 'Authentication failed');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setLoading(true);
        setError(null);
        try {
            await signInWithPopup(auth, googleProvider);
        } catch (err: any) {
            console.error(err);
            if (err.code === 'auth/api-key-not-valid-please-pass-a-valid-api-key') {
                setError('Firebase API Key is missing. Please check .env or firebase.ts');
            } else {
                setError(err.message || 'Google Sign-In failed');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 overflow-hidden relative">
            {/* Background Ambience */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[100px] -mr-32 -mt-32 animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-600/10 rounded-full blur-[80px] -ml-32 -mb-32"></div>

            <div className="w-full max-w-md p-8 relative z-10 animate-in fade-in zoom-in duration-500">
                {/* Card */}
                <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl overflow-hidden relative">

                    {isLogin ? (
                        <div className="text-center mb-8">
                            <div className="bg-slate-900 w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg border border-slate-700">
                                <i className="fa-solid fa-fingerprint text-white text-2xl"></i>
                            </div>
                            <h1 className="text-2xl font-black text-white tracking-tight mb-2">Welcome Back</h1>
                            <p className="text-indigo-200 text-xs font-medium">Authenticate to access your Neural Twin.</p>
                        </div>
                    ) : (
                        <div className="text-center mb-8">
                            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg">
                                <i className="fa-solid fa-user-plus text-white text-2xl"></i>
                            </div>
                            <h1 className="text-2xl font-black text-white tracking-tight mb-2">Create Core Identity</h1>
                            <p className="text-indigo-200 text-xs font-medium">Initialize your career growth engine.</p>
                        </div>
                    )}

                    {error && (
                        <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl flex items-center gap-3 animate-in shake">
                            <i className="fa-solid fa-circle-exclamation text-red-400"></i>
                            <p className="text-xs text-red-200 font-bold">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleEmailAuth} className="space-y-4">
                        {!isLogin && (
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Full Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Enter your name"
                                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 focus:bg-slate-900 transition-all"
                                />
                            </div>
                        )}

                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Email Address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@example.com"
                                className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 focus:bg-slate-900 transition-all"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 focus:bg-slate-900 transition-all"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 bg-white text-slate-900 rounded-xl font-bold text-sm hover:bg-indigo-50 active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <i className="fa-solid fa-spinner fa-spin"></i>
                            ) : (
                                <>
                                    <span>{isLogin ? 'Grant Access' : 'Initialize Account'}</span>
                                    <i className="fa-solid fa-arrow-right group-hover:translate-x-1 transition-transform text-xs"></i>
                                </>
                            )}
                        </button>
                    </form>

                    <div className="my-6 flex items-center gap-4">
                        <div className="h-px bg-white/10 flex-1"></div>
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Or Continue With</span>
                        <div className="h-px bg-white/10 flex-1"></div>
                    </div>

                    <button
                        onClick={handleGoogleSignIn}
                        disabled={loading}
                        className="w-full py-3 bg-slate-900 border border-slate-700 hover:bg-slate-800 text-white rounded-xl font-bold text-sm transition-all shadow-md flex items-center justify-center gap-3 group disabled:opacity-70"
                    >
                        <i className="fa-brands fa-google text-lg group-hover:text-red-400 transition-colors"></i>
                        <span>Google Account</span>
                    </button>

                    <div className="mt-8 text-center">
                        <p className="text-xs text-slate-400 font-medium">
                            {isLogin ? "Need a new identity? " : "Already initialized? "}
                            <button
                                onClick={() => setIsLogin(!isLogin)}
                                className="text-indigo-400 hover:text-white font-bold underline decoration-indigo-400/30 underline-offset-4 transition-colors"
                            >
                                {isLogin ? "Create Account" : "Access Login"}
                            </button>
                        </p>
                    </div>
                </div>

                <div className="text-center mt-8 opacity-40 hover:opacity-100 transition-opacity">
                    <p className="text-[9px] text-slate-500 font-black uppercase tracking-[0.3em]">
                        Secured by Firebase Auth
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Auth;
