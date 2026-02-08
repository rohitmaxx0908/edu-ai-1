
import React from 'react';

interface UpdateModalProps {
    isOpen: boolean;
    onClose: () => void;
    updateUrl: string;
    latestVersion: string;
    forceUpdate: boolean;
    releaseNotes?: string;
}

const UpdateModal: React.FC<UpdateModalProps> = ({
    isOpen,
    onClose,
    updateUrl,
    latestVersion,
    forceUpdate,
    releaseNotes
}) => {
    if (!isOpen) return null;

    const handleUpdate = () => {
        window.open(updateUrl, '_system');
        if (!forceUpdate) {
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-indigo-500/30 rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden relative">
                {/* Header Decoration */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500"></div>

                <div className="p-6 text-center">
                    <div className="w-16 h-16 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                        <i className="fa-solid fa-cloud-arrow-down text-2xl text-indigo-400"></i>
                    </div>

                    <h2 className="text-xl font-bold text-white mb-2">New Update Available!</h2>
                    <p className="text-slate-400 text-sm mb-4">
                        Version <span className="text-emerald-400 font-mono font-bold">v{latestVersion}</span> is now available.
                    </p>

                    {releaseNotes && (
                        <div className="bg-slate-800/50 rounded-lg p-3 mb-6 text-left">
                            <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">What's New</p>
                            <p className="text-slate-300 text-xs leading-relaxed whitespace-pre-wrap">{releaseNotes}</p>
                        </div>
                    )}

                    <div className="flex flex-col gap-3">
                        <button
                            onClick={handleUpdate}
                            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-sm transition-all shadow-lg hover:shadow-indigo-500/25 active:scale-95"
                        >
                            Update Now
                        </button>

                        {!forceUpdate && (
                            <button
                                onClick={onClose}
                                className="w-full py-2 text-slate-500 hover:text-white text-xs font-medium transition-colors"
                            >
                                Remind Me Later
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UpdateModal;
