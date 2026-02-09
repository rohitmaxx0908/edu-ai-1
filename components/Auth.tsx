
import React, { useState, useEffect, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';
import {
    signInWithPopup,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithCredential,
    signInWithPhoneNumber,
    RecaptchaVerifier,
    GoogleAuthProvider,
    GithubAuthProvider,
    auth,
    googleProvider,
    githubProvider
} from '../services/firebase';

const Auth: React.FC = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');

    // Phone Auth State
    const [isPhoneMode, setIsPhoneMode] = useState(false);
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [showOtpInput, setShowOtpInput] = useState(false);
    const [confirmationResult, setConfirmationResult] = useState<any>(null);

    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const recaptchaVerifier = useRef<RecaptchaVerifier | null>(null);

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

    const setupRecaptcha = () => {
        if (!recaptchaVerifier.current && !Capacitor.isNativePlatform()) {
            recaptchaVerifier.current = new RecaptchaVerifier(auth, 'recaptcha-container', {
                'size': 'invisible',
                'callback': () => {
                    // reCAPTCHA solved, allow signInWithPhoneNumber.
                }
            });
        }
    };

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setupRecaptcha();

        const appVerifier = recaptchaVerifier.current;
        if (!appVerifier && !Capacitor.isNativePlatform()) {
            setError("Recaptcha verification failed.");
            setLoading(false);
            return;
        }

        try {
            // Format phone number if needed, simple validation
            if (phone.length < 10) throw new Error("Invalid phone number");

            // In a real app, ensure +CountryCode is present. Assuming user types it or we default.
            // For now, let's assume the user enters +[CountryCode][Number]
            const formattedPhone = phone.startsWith('+') ? phone : `+1${phone}`;

            const confirmation = await signInWithPhoneNumber(auth, formattedPhone, appVerifier!);
            setConfirmationResult(confirmation);
            setShowOtpInput(true);
        } catch (err: any) {
            console.error(err);
            if (err.code === 'auth/billing-not-enabled') {
                setError('Billing Required: Enable Blaze Plan or use Test Numbers in Firebase Console.');
            } else if (err.code === 'auth/quota-exceeded') {
                setError('SMS Quota Exceeded: Use Test Numbers.');
            } else {
                setError(err.message || 'Failed to send OTP');
            }
            if (recaptchaVerifier.current) {
                recaptchaVerifier.current.clear();
                recaptchaVerifier.current = null;
            }
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            await confirmationResult.confirm(otp);
        } catch (err: any) {
            console.error(err);
            setError("Invalid OTP");
        } finally {
            setLoading(false);
        }
    };

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

    const handleSocialSignIn = async (provider: typeof GoogleAuthProvider | typeof GithubAuthProvider) => {
        setLoading(true);
        setError(null);
        try {
            const isNative = Capacitor.isNativePlatform();
            if (isNative) {
                // Native flow (simplified, assumes setup)
                // For production, specific Native SDK logic is needed.
                setError("Native Social Auth requires updated SDK configuration.");
            } else {
                await signInWithPopup(auth, provider === GoogleAuthProvider ? googleProvider : githubProvider);
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
            <div id="recaptcha-container"></div>
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
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-transparent pointer-events-none z-20 opacity-50"></div>

                    {/* Inner Content Container */}
                    <div className="bg-gradient-to-br from-slate-900/90 to-slate-950/90 p-8 md:p-12 rounded-[2.5rem] h-full relative overflow-hidden z-10">

                        {/* Header Section */}
                        <div className="text-center mb-10 relative">
                            <div className="relative inline-block mb-6 group-hover:scale-110 transition-transform duration-700 ease-out">
                                <div className="absolute inset-0 bg-indigo-500 blur-3xl opacity-30 group-hover:opacity-60 transition-opacity duration-700"></div>
                                <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-slate-800 to-black border border-slate-700 flex items-center justify-center relative shadow-2xl ring-1 ring-white/10 overflow-hidden">
                                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.2),transparent_70%)]"></div>
                                    <i className={`fa-solid ${isPhoneMode ? 'fa-mobile-screen' : (isLogin ? 'fa-fingerprint' : 'fa-dna')} text-4xl bg-clip-text text-transparent bg-gradient-to-br from-indigo-400 via-purple-400 to-cyan-400 drop-shadow-[0_0_15px_rgba(99,102,241,0.5)] transition-all duration-500 ${isLogin ? 'scale-100' : 'scale-110 rotate-12'}`}></i>
                                </div>
                                <div className="absolute -bottom-3 -right-3 w-10 h-10 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center shadow-lg animate-bounce delay-1000">
                                    <i className="fa-solid fa-shield-halved text-xs text-emerald-400"></i>
                                </div>
                            </div>

                            <h1 className="text-4xl font-black text-white tracking-tighter mb-2 animate-in slide-in-from-bottom-2 fade-in duration-700 bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-400">
                                {isPhoneMode ? (showOtpInput ? 'Verify Code' : 'Mobile Access') : (isLogin ? 'Welcome Back' : 'Join NeuralNet')}
                            </h1>
                            <p className="text-slate-400 text-xs font-bold tracking-[0.2em] uppercase opacity-70">
                                {isPhoneMode ? 'Secure SMS Uplink' : (isLogin ? 'Authenticate to Access Core' : 'Initialize New Identity')}
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

                        {isPhoneMode ? (
                            <form onSubmit={showOtpInput ? handleVerifyOtp : handleSendOtp} className="space-y-4">
                                {showOtpInput ? (
                                    <div className="group/input relative">
                                        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within/input:text-indigo-400 transition-colors">
                                            <i className="fa-solid fa-key text-sm"></i>
                                        </div>
                                        <input
                                            type="text"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value)}
                                            placeholder="Enter 6-digit Code"
                                            className="w-full bg-slate-800/80 border border-slate-700/50 rounded-2xl px-12 py-4 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500/50 focus:bg-slate-800 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium shadow-inner tracking-[0.5em] text-center"
                                            maxLength={6}
                                        />
                                    </div>
                                ) : (
                                    <div className="group/input relative">
                                        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within/input:text-indigo-400 transition-colors">
                                            <i className="fa-solid fa-phone text-sm"></i>
                                        </div>
                                        <input
                                            type="tel"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            placeholder="+1 (555) 000-0000"
                                            className="w-full bg-slate-800/80 border border-slate-700/50 rounded-2xl px-12 py-4 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500/50 focus:bg-slate-800 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium shadow-inner"
                                        />
                                    </div>
                                )}

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
                                                <span className="font-black text-sm tracking-widest uppercase">{showOtpInput ? 'Verify' : 'Send Code'}</span>
                                                <i className="fa-solid fa-arrow-right-long text-indigo-600 group-hover/btn:translate-x-1 transition-transform"></i>
                                            </>
                                        )}
                                    </div>
                                </button>

                                <button type="button" onClick={() => { setIsPhoneMode(false); setShowOtpInput(false); }} className="w-full text-center text-xs text-slate-500 hover:text-white mt-4 font-bold">
                                    Cancel
                                </button>
                            </form>
                        ) : (
                            <>
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

                                <div className="my-6 flex items-center gap-4 opacity-30">
                                    <div className="h-px bg-gradient-to-r from-transparent via-slate-400 to-transparent flex-1"></div>
                                    <span className="text-[8px] text-slate-400 font-black uppercase tracking-[0.2em]">or connect with</span>
                                    <div className="h-px bg-gradient-to-r from-transparent via-slate-400 to-transparent flex-1"></div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => handleSocialSignIn(GoogleAuthProvider)}
                                        disabled={loading}
                                        className="py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 group/social hover:shadow-lg hover:-translate-y-0.5"
                                    >
                                        <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-4 h-4" />
                                        <span className="opacity-80 group-hover/social:opacity-100">Google</span>
                                    </button>

                                    <button
                                        onClick={() => handleSocialSignIn(GithubAuthProvider)}
                                        disabled={loading}
                                        className="py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 group/social hover:shadow-lg hover:-translate-y-0.5"
                                    >
                                        <i className="fa-brands fa-github text-white text-sm"></i>
                                        <span className="opacity-80 group-hover/social:opacity-100">GitHub</span>
                                    </button>
                                </div>

                                <button
                                    onClick={() => setIsPhoneMode(true)}
                                    className="w-full mt-3 py-3 bg-transparent border border-white/5 hover:bg-white/5 text-slate-400 hover:text-white rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 hover:border-indigo-500/30"
                                >
                                    <i className="fa-solid fa-mobile-screen"></i>
                                    Continue with Phone
                                </button>

                                <div className="mt-6 text-center">
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
                            </>
                        )}
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
                </div>
            </div>
        </div>
    );
};

export default Auth;
