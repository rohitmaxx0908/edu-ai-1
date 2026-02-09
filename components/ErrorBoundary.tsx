
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null
        };
    }

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-[#050b14] text-white flex flex-col items-center justify-center relative overflow-hidden font-mono p-6">
                    {/* Noise Texture */}
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay"></div>

                    {/* Red Glow */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>

                    <div className="relative z-10 max-w-2xl w-full text-center">
                        <div className="mb-8 relative inline-block group">
                            <div className="absolute inset-0 bg-red-500 blur-2xl opacity-20 group-hover:opacity-40 transition-opacity animate-pulse"></div>
                            <i className="fa-solid fa-triangle-exclamation text-6xl text-red-500 mb-4 animate-[bounce_1s_infinite]"></i>
                        </div>

                        <h1 className="text-4xl md:text-6xl font-black text-white tracking-widest uppercase mb-2 glitch-text relative" data-text="SYSTEM FAILURE">
                            SYSTEM FAILURE
                        </h1>
                        <div className="h-1 w-24 bg-red-500 mx-auto mb-8 rounded-full"></div>

                        <div className="bg-red-950/30 border border-red-500/30 rounded-2xl p-6 md:p-8 backdrop-blur-sm shadow-2xl overflow-hidden relative text-left">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-transparent to-red-500 opacity-50"></div>

                            <p className="text-[10px] font-black text-red-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                <span className="w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
                                Exception Trace
                            </p>

                            <pre className="font-mono text-xs md:text-sm text-red-200 overflow-x-auto whitespace-pre-wrap break-all leading-relaxed bg-black/40 p-4 rounded-lg border border-red-500/10">
                                {this.state.error?.toString()}
                            </pre>

                            <div className="mt-6 flex justify-center">
                                <button
                                    onClick={() => window.location.reload()}
                                    className="px-8 py-3 bg-red-600 hover:bg-red-500 text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-lg shadow-red-500/20 active:scale-95 transition-all flex items-center gap-3 group"
                                >
                                    <i className="fa-solid fa-rotate-right group-hover:rotate-180 transition-transform duration-500"></i>
                                    Reboot System
                                </button>
                            </div>
                        </div>

                        <p className="mt-8 text-[10px] text-slate-500 uppercase tracking-[0.3em] font-bold">
                            Diagnostic Code: CRITICAL_PROCESS_DIED
                        </p>
                    </div>

                    <style>{`
                        @keyframes glitch {
                            0% { transform: translate(0) }
                            20% { transform: translate(-2px, 2px) }
                            40% { transform: translate(-2px, -2px) }
                            60% { transform: translate(2px, 2px) }
                            80% { transform: translate(2px, -2px) }
                            100% { transform: translate(0) }
                        }
                        .glitch-text {
                            animation: glitch 3s infinite linear alternate-reverse;
                        }
                    `}</style>
                </div>
            );
        }

        return this.props.children;
    }
}
