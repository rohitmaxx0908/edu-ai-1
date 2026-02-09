import React, { useState, useEffect, useRef } from 'react';
import { db, auth, storage } from '../services/firebase';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, Timestamp, deleteDoc, doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

interface ReplyInfo {
    id: string;
    displayName: string;
    text: string;
}

interface ChatMessage {
    id: string;
    text?: string;
    mediaUrl?: string; // Unified field for image/video
    mediaType?: 'image' | 'video';
    sticker?: string;
    type: 'text' | 'media' | 'sticker';
    uid: string;
    displayName: string;
    photoURL?: string;
    createdAt: Timestamp | null;
    replyTo?: ReplyInfo;
    likes?: string[];
}

const STICKERS = ['👋', '👍', '❤️', '😂', '😮', '😢', '😡', '🎉', '🔥', '🚀', '💯', '🤔', '👀', '✨', '💪'];

const ChatRoom: React.FC = () => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const dummy = useRef<HTMLSpanElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showStickers, setShowStickers] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
    const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = () => setActiveMenuId(null);
        window.addEventListener('click', handleClickOutside);
        return () => window.removeEventListener('click', handleClickOutside);
    }, []);

    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setActiveMenuId(null);
        } catch (err) {
            console.error('Failed to copy', err);
        }
    };

    useEffect(() => {
        const q = query(collection(db, 'chat_messages'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const msgs: ChatMessage[] = [];
            snapshot.forEach((doc) => {
                msgs.push({ id: doc.id, ...doc.data() } as ChatMessage);
            });
            setMessages(msgs.reverse());
            setLoading(false);
            setTimeout(() => dummy.current?.scrollIntoView({ behavior: 'smooth' }), 100);
        }, (err) => {
            console.error("Chat error:", err);
            setError(`Error: ${err.message}`);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const sendMessage = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setError(null);
        if (!newMessage.trim() || !auth.currentUser) return;

        const messageData: any = {
            text: newMessage,
            type: 'text',
            createdAt: serverTimestamp(),
            uid: auth.currentUser.uid,
            displayName: auth.currentUser.displayName || auth.currentUser.email || 'Anonymous',
            photoURL: auth.currentUser.photoURL || null,
            likes: []
        };

        if (replyingTo) {
            messageData.replyTo = {
                id: replyingTo.id,
                displayName: replyingTo.displayName,
                text: replyingTo.text || (replyingTo.type === 'media' ? `[${replyingTo.mediaType}]` : '[Sticker]')
            };
        }

        try {
            await addDoc(collection(db, 'chat_messages'), messageData);
            setNewMessage('');
            setReplyingTo(null);
            dummy.current?.scrollIntoView({ behavior: 'smooth' });
        } catch (err: any) {
            console.error("Error sending message:", err);
            setError(`Failed to send: ${err.message}`);
        }
    };

    const sendSticker = async (sticker: string) => {
        if (!auth.currentUser) return;
        setShowStickers(false);
        try {
            await addDoc(collection(db, 'chat_messages'), {
                sticker: sticker,
                type: 'sticker',
                createdAt: serverTimestamp(),
                uid: auth.currentUser.uid,
                displayName: auth.currentUser.displayName || auth.currentUser.email || 'Anonymous',
                photoURL: auth.currentUser.photoURL || null,
                likes: []
            });
            dummy.current?.scrollIntoView({ behavior: 'smooth' });
        } catch (err: any) {
            setError(`Failed to send sticker: ${err.message}`);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !auth.currentUser) return;

        const isVideo = file.type.startsWith('video/');
        const isImage = file.type.startsWith('image/');

        if (!isVideo && !isImage) {
            setError("Only images and videos are supported.");
            return;
        }

        setUploading(true);
        try {
            const storageRef = ref(storage, `chat_media/${auth.currentUser.uid}_${Date.now()}_${file.name}`);
            await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(storageRef);

            await addDoc(collection(db, 'chat_messages'), {
                mediaUrl: downloadURL,
                mediaType: isVideo ? 'video' : 'image',
                type: 'media',
                createdAt: serverTimestamp(),
                uid: auth.currentUser.uid,
                displayName: auth.currentUser.displayName || auth.currentUser.email || 'Anonymous',
                photoURL: auth.currentUser.photoURL || null,
                likes: []
            });
            dummy.current?.scrollIntoView({ behavior: 'smooth' });
        } catch (err: any) {
            console.error("Upload error:", err);
            setError(`Failed to upload media: ${err.message}`);
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const deleteMessage = async (msg: ChatMessage) => {
        if (!auth.currentUser || msg.uid !== auth.currentUser.uid) return;
        if (!window.confirm("Delete this message?")) return;

        try {
            await deleteDoc(doc(db, 'chat_messages', msg.id));
        } catch (err: any) {
            setError(`Failed to delete: ${err.message}`);
        }
    };

    const toggleLike = async (msg: ChatMessage) => {
        if (!auth.currentUser) return;
        const msgRef = doc(db, 'chat_messages', msg.id);
        const isLiked = msg.likes?.includes(auth.currentUser.uid);

        try {
            await updateDoc(msgRef, {
                likes: isLiked ? arrayRemove(auth.currentUser.uid) : arrayUnion(auth.currentUser.uid)
            });
        } catch (err: any) {
            console.error("Like error:", err);
        }
    };

    // Helper to render mentions
    const renderTextWithMentions = (text: string) => {
        const mentionRegex = /(@\w+)/g;
        const parts = text.split(mentionRegex);

        return parts.map((part, i) => {
            if (part.match(mentionRegex)) {
                return <span key={i} className="text-indigo-400 font-bold bg-indigo-500/10 px-1 rounded mx-0.5 shadow-sm border border-indigo-500/20">{part}</span>;
            }
            return part;
        });
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 relative group">

            {/* Header */}
            <div className="bg-white/70 backdrop-blur-2xl border-b border-indigo-50/50 p-4 md:p-6 flex items-center justify-between z-10 sticky top-0 shadow-sm transition-all duration-300">
                <div className="flex items-center gap-4">
                    <div className="relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-500"></div>
                        <div className="relative w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-lg transition-transform hover:scale-105">
                            <i className="fa-solid fa-comments text-transparent bg-clip-text bg-gradient-to-tr from-indigo-600 to-purple-600 text-xl"></i>
                        </div>
                    </div>
                    <div>
                        <h2 className="text-lg font-black text-slate-800 tracking-tight">Community Grid</h2>
                        <div className="flex items-center gap-2">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">Global Neural Link</p>
                        </div>
                    </div>
                </div>
                <div className="hidden sm:flex items-center gap-3 bg-white/50 backdrop-blur-sm px-4 py-2 rounded-full border border-slate-100 shadow-sm">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Encrypted Channel</span>
                    <i className="fa-solid fa-shield-halved text-emerald-500 text-xs shadow-emerald-500/20 drop-shadow-sm"></i>
                </div>
            </div>

            {/* Error Message Display */}
            {error && (
                <div className="bg-red-50 p-4 border-b border-red-100 flex items-start gap-3 absolute top-[88px] w-full z-30 animate-in slide-in-from-top-2">
                    <i className="fa-solid fa-triangle-exclamation text-red-500 mt-0.5"></i>
                    <div className="flex-1">
                        <p className="text-xs font-bold text-red-800">Connection Issue</p>
                        <p className="text-[10px] text-red-600 break-words">{error}</p>
                    </div>
                    <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600">
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-slate-50/50">
                {loading && (
                    <div className="flex justify-center py-20">
                        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                    </div>
                )}

                {!loading && messages.length === 0 && (
                    <div className="text-center py-32 opacity-50">
                        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <i className="fa-regular fa-comments text-4xl text-slate-300"></i>
                        </div>
                        <h3 className="text-slate-900 font-bold text-lg mb-2">No messages yet</h3>
                        <p className="text-sm font-medium text-slate-400 uppercase tracking-widest">Initialize Protocol</p>
                    </div>
                )}

                {messages.map((msg, index) => {
                    const isMe = msg.uid === auth.currentUser?.uid;
                    const showAvatar = index === 0 || messages[index - 1].uid !== msg.uid || (msg.createdAt && messages[index - 1].createdAt && (msg.createdAt.toMillis() - messages[index - 1].createdAt!.toMillis() > 60000));
                    const isLiked = msg.likes?.includes(auth.currentUser?.uid || '');

                    return (
                        <div key={msg.id} className={`flex group ${isMe ? 'justify-end' : 'justify-start'} ${!showAvatar ? 'mt-1' : 'mt-8'} animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-backwards`}>
                            <div className={`flex gap-3 max-w-[85%] md:max-w-[70%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                                {/* Avatar */}
                                <div className={`w-10 h-10 rounded-full shrink-0 flex items-center justify-center overflow-hidden ring-4 ring-white shadow-lg ${!showAvatar ? 'opacity-0 h-0 w-0 overflow-hidden' : ''} transition-all duration-300`}>
                                    {msg.photoURL ? (
                                        <img src={msg.photoURL} alt={msg.displayName} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${isMe ? 'from-indigo-500 via-indigo-600 to-purple-600' : 'from-slate-100 to-slate-200'}`}>
                                            <span className={`text-sm font-black ${isMe ? 'text-white' : 'text-slate-400'}`}>
                                                {msg.displayName.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                    {/* Name and Time */}
                                    {showAvatar && (
                                        <div className={`flex items-baseline gap-2 mb-1.5 ${isMe ? 'flex-row-reverse' : ''} px-1`}>
                                            <span className="text-xs font-black text-slate-700 tracking-tight">{msg.displayName}</span>
                                            {msg.createdAt && (
                                                <span className="text-[10px] text-slate-400 font-medium opacity-70">
                                                    {msg.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    <div className="relative group/bubble">
                                        {/* Reply Quote */}
                                        {msg.replyTo && (
                                            <div className={`mb-1 p-2.5 rounded-xl text-[10px] bg-slate-100/80 backdrop-blur-sm border-l-4 border-indigo-400 max-w-full truncate opacity-80 hover:opacity-100 transition-all cursor-pointer shadow-sm hover:shadow-md ${isMe ? 'text-right' : 'text-left'}`}>
                                                <span className="font-bold text-indigo-600 block mb-0.5 flex items-center gap-1.5">
                                                    <i className="fa-solid fa-reply text-[8px]"></i> {msg.replyTo.displayName}
                                                </span>
                                                <span className="text-slate-500 font-medium truncate block">{msg.replyTo.text}</span>
                                            </div>
                                        )}

                                        {/* Message Bubble */}
                                        <div className={`px-6 py-3.5 rounded-2xl shadow-sm relative transition-all duration-300 hover:shadow-md ${isMe
                                            ? 'bg-gradient-to-br from-indigo-600 via-indigo-600 to-indigo-700 text-white rounded-tr-sm shadow-indigo-500/20'
                                            : 'bg-white text-slate-700 border border-slate-100 rounded-tl-sm shadow-slate-200/50'
                                            }`}>

                                            {msg.type === 'text' && (
                                                <div className="text-sm leading-relaxed whitespace-pre-wrap font-medium tracking-wide">
                                                    {renderTextWithMentions(msg.text || '')}
                                                </div>
                                            )}

                                            {msg.type === 'media' && msg.mediaUrl && (
                                                <div className="rounded-xl overflow-hidden mt-1 max-w-sm border border-black/5 shadow-sm group-hover/bubble:shadow-lg transition-all pt-1">
                                                    {msg.mediaType === 'video' ? (
                                                        <video src={msg.mediaUrl} controls className="max-w-full max-h-72 object-cover bg-black rounded-lg" />
                                                    ) : (
                                                        <img src={msg.mediaUrl} alt="Shared" className="max-w-full max-h-72 object-cover hover:scale-105 transition-transform duration-700 cursor-pointer rounded-lg" onClick={() => window.open(msg.mediaUrl, '_blank')} />
                                                    )}
                                                </div>
                                            )}

                                            {msg.type === 'sticker' && (
                                                <div className="text-7xl hover:scale-110 transition-transform cursor-pointer drop-shadow-2xl filter hover:brightness-110 duration-300 p-2">
                                                    {msg.sticker}
                                                </div>
                                            )}

                                            {/* Likes Count */}
                                            {msg.likes && msg.likes.length > 0 && (
                                                <div className={`absolute -bottom-3 ${isMe ? '-left-3' : '-right-3'} bg-white border border-red-100 rounded-full px-2 py-0.5 shadow-lg shadow-red-100/50 flex items-center gap-1 animate-in zoom-in-50`}>
                                                    <i className="fa-solid fa-heart text-[9px] text-red-500 drop-shadow-sm"></i>
                                                    <span className="text-[9px] font-bold text-slate-600">{msg.likes.length}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Message Actions (Hover) */}
                                        <div className={`absolute top-1/2 -translate-y-1/2 ${isMe ? '-left-32' : '-right-32'} opacity-0 group-hover/bubble:opacity-100 transition-all duration-300 flex items-center gap-1.5 p-2 backdrop-blur-sm rounded-full`}>
                                            <button
                                                onClick={() => toggleLike(msg)}
                                                className={`w-9 h-9 rounded-full bg-white flex items-center justify-center transition-all shadow-lg hover:-translate-y-1 border border-slate-100 ${isLiked ? 'text-red-500 bg-red-50 border-red-100' : 'text-slate-400 hover:text-red-500'}`}
                                                title="Like"
                                            >
                                                <i className={`${isLiked ? 'fa-solid' : 'fa-regular'} fa-heart text-sm transform transition-transform active:scale-125`}></i>
                                            </button>

                                            <button
                                                onClick={() => setReplyingTo(msg)}
                                                className="w-9 h-9 rounded-full bg-white text-slate-400 hover:text-white hover:bg-indigo-600 flex items-center justify-center transition-all shadow-lg hover:-translate-y-1 border border-slate-100"
                                                title="Reply"
                                            >
                                                <i className="fa-solid fa-reply text-sm"></i>
                                            </button>

                                            <div className="relative">
                                                <button
                                                    onClick={() => setActiveMenuId(activeMenuId === msg.id ? null : msg.id)}
                                                    className={`w-9 h-9 rounded-full bg-white text-slate-400 hover:text-slate-900 border border-slate-100 flex items-center justify-center transition-all shadow-lg hover:-translate-y-1 ${activeMenuId === msg.id ? 'bg-slate-100 text-slate-900' : ''}`}
                                                >
                                                    <i className="fa-solid fa-ellipsis text-sm"></i>
                                                </button>


                                                {activeMenuId === msg.id && (
                                                    <div className="absolute top-full left-0 mt-2 w-36 bg-white/95 backdrop-blur-xl border border-slate-100 rounded-2xl shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 origin-top-left ring-1 ring-black/5">
                                                        {msg.text && (
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    copyToClipboard(msg.text!);
                                                                }}
                                                                className="w-full text-left px-3 py-2.5 text-[11px] font-bold text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl flex items-center gap-3 transition-colors"
                                                            >
                                                                <i className="fa-regular fa-copy"></i> Copy Text
                                                            </button>
                                                        )}
                                                        {isMe && (
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    deleteMessage(msg);
                                                                }}
                                                                className="w-full text-left px-3 py-2.5 text-[11px] font-bold text-red-500 hover:bg-red-50 rounded-xl flex items-center gap-3 border-t border-slate-100/50 mt-1"
                                                            >
                                                                <i className="fa-solid fa-trash"></i> Delete
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
                <span ref={dummy}></span>
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white/60 backdrop-blur-xl border-t border-indigo-50 relative z-30 pb-6 shadow-[0_-5px_20px_rgba(0,0,0,0.02)]">
                {uploading && (
                    <div className="absolute top-0 left-0 w-full h-1 bg-indigo-50 overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 animate-[progress_1s_ease-in-out_infinite]"></div>
                    </div>
                )}

                {replyingTo && (
                    <div className="flex items-center justify-between bg-white border border-indigo-100 rounded-2xl p-3 text-xs -mt-16 mb-4 mx-2 shadow-lg animate-in slide-in-from-bottom-5 z-0">
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100">
                                <i className="fa-solid fa-reply"></i>
                            </div>
                            <div>
                                <span className="text-indigo-900 font-bold block">Replying to {replyingTo.displayName}</span>
                                <span className="text-indigo-600/70 truncate block max-w-xs">{replyingTo.text || '[Media]'}</span>
                            </div>
                        </div>
                        <button onClick={() => setReplyingTo(null)} className="w-7 h-7 rounded-full hover:bg-indigo-50 flex items-center justify-center text-indigo-400 hover:text-indigo-700 transition-colors">
                            <i className="fa-solid fa-xmark"></i>
                        </button>
                    </div>
                )}

                {showStickers && (
                    <div className="absolute bottom-28 left-6 bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-slate-100 p-5 grid grid-cols-5 gap-3 w-80 animate-in fade-in slide-in-from-bottom-8 z-50 ring-1 ring-black/5">
                        {STICKERS.map(sticker => (
                            <button
                                key={sticker}
                                type="button"
                                onClick={() => sendSticker(sticker)}
                                className="text-4xl hover:bg-indigo-50 p-3 rounded-2xl transition-all hover:scale-110 hover:shadow-sm"
                            >
                                {sticker}
                            </button>
                        ))}
                    </div>
                )}

                <div className="max-w-5xl mx-auto bg-white p-2 rounded-[2rem] border border-slate-200/60 shadow-xl shadow-indigo-100/40 flex gap-2 items-end transition-all focus-within:ring-4 focus-within:ring-indigo-100 focus-within:border-indigo-400 hover:shadow-2xl hover:shadow-indigo-100/60 duration-300">
                    {/* Tools */}
                    <div className="flex gap-1 pb-1 pl-1">
                        <button
                            type="button"
                            onClick={() => setShowStickers(!showStickers)}
                            className={`w-11 h-11 rounded-full flex items-center justify-center transition-all active:scale-95 ${showStickers ? 'bg-indigo-100 text-indigo-600 rotate-12' : 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 border border-transparent hover:border-indigo-100'}`}
                            title="Stickers"
                        >
                            <i className="fa-solid fa-face-smile text-xl"></i>
                        </button>

                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*,video/*"
                            onChange={handleFileUpload}
                        />
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="w-11 h-11 rounded-full flex items-center justify-center text-slate-400 hover:text-purple-600 hover:bg-purple-50 border border-transparent hover:border-purple-100 transition-all active:scale-95"
                            title="Upload Media"
                            disabled={uploading}
                        >
                            <i className="fa-solid fa-paperclip text-lg"></i>
                        </button>
                    </div>

                    {/* Text Input */}
                    <div className="flex-1 py-3 px-2">
                        <textarea
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    sendMessage();
                                }
                            }}
                            placeholder="Type your message..."
                            className="w-full bg-transparent border-none text-slate-800 focus:outline-none placeholder:text-slate-400 font-medium resize-none text-sm max-h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 px-2"
                            rows={1}
                            style={{ minHeight: '24px' }}
                        />
                    </div>

                    {/* Send Button */}
                    <button
                        type="button"
                        onClick={() => sendMessage()}
                        disabled={!newMessage.trim() && !uploading}
                        className="w-12 h-12 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full flex items-center justify-center hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-105 active:scale-95 mb-0.5"
                    >
                        {uploading ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-paper-plane text-sm ml-0.5"></i>}
                    </button>
                </div>
            </div>

            <style>{`
                /* Thin Scrollbar for chat area */
                ::-webkit-scrollbar {
                  width: 6px;
                }
                ::-webkit-scrollbar-track {
                  background: transparent; 
                }
                ::-webkit-scrollbar-thumb {
                  background: rgba(148, 163, 184, 0.5); 
                  border-radius: 10px;
                }
                ::-webkit-scrollbar-thumb:hover {
                  background: rgba(99, 102, 241, 0.5); 
                }
            `}</style>
        </div>
    );
};

export default ChatRoom;
