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
            <div className="bg-white/80 backdrop-blur-xl border-b border-slate-100 p-6 flex items-center justify-between z-10 sticky top-0 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 transition-transform hover:scale-105">
                        <i className="fa-solid fa-comments text-white text-lg"></i>
                    </div>
                    <div>
                        <h2 className="text-lg font-black text-slate-900 tracking-tight">Community Grid</h2>
                        <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Global Neural Link</p>
                        </div>
                    </div>
                </div>
                <div className="hidden sm:flex items-center gap-3 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Encrypted Channel</span>
                    <i className="fa-solid fa-shield-halved text-emerald-500 text-xs"></i>
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
                        <div key={msg.id} className={`flex group ${isMe ? 'justify-end' : 'justify-start'} ${!showAvatar ? 'mt-1' : 'mt-6'}`}>
                            <div className={`flex gap-3 max-w-[85%] md:max-w-[70%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                                {/* Avatar */}
                                <div className={`w-9 h-9 rounded-full shrink-0 flex items-center justify-center overflow-hidden ring-2 ring-white shadow-md ${!showAvatar ? 'opacity-0 h-0' : ''}`}>
                                    {msg.photoURL ? (
                                        <img src={msg.photoURL} alt={msg.displayName} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${isMe ? 'from-indigo-500 to-purple-600' : 'from-slate-200 to-slate-300'}`}>
                                            <span className={`text-xs font-black ${isMe ? 'text-white' : 'text-slate-500'}`}>
                                                {msg.displayName.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                    {/* Name and Time */}
                                    {showAvatar && (
                                        <div className={`flex items-baseline gap-2 mb-1 ${isMe ? 'flex-row-reverse' : ''} px-1`}>
                                            <span className="text-[11px] font-black text-slate-700">{msg.displayName}</span>
                                            {msg.createdAt && (
                                                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                                                    {msg.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    <div className="relative group/bubble">
                                        {/* Reply Quote */}
                                        {msg.replyTo && (
                                            <div className={`mb-1 p-2 rounded-xl text-[10px] bg-slate-100 border-l-2 border-indigo-400 max-w-full truncate opacity-70 hover:opacity-100 transition-opacity cursor-pointer ${isMe ? 'text-right' : 'text-left'}`}>
                                                <span className="font-bold text-indigo-600 block mb-0.5 flex items-center gap-1">
                                                    <i className="fa-solid fa-reply text-[8px]"></i> {msg.replyTo.displayName}
                                                </span>
                                                <span className="text-slate-500 truncate block">{msg.replyTo.text}</span>
                                            </div>
                                        )}

                                        {/* Message Bubble */}
                                        <div className={`px-5 py-3 rounded-[1.2rem] shadow-sm relative transition-all ${isMe
                                            ? 'bg-indigo-600 text-white rounded-tr-sm shadow-indigo-600/20'
                                            : 'bg-white text-slate-700 border border-slate-100 rounded-tl-sm shadow-slate-200/50'
                                            }`}>

                                            {msg.type === 'text' && (
                                                <div className="text-sm leading-relaxed whitespace-pre-wrap font-medium">
                                                    {renderTextWithMentions(msg.text || '')}
                                                </div>
                                            )}

                                            {msg.type === 'media' && msg.mediaUrl && (
                                                <div className="rounded-xl overflow-hidden mt-1 max-w-sm border border-black/5">
                                                    {msg.mediaType === 'video' ? (
                                                        <video src={msg.mediaUrl} controls className="max-w-full max-h-60 object-cover bg-black" />
                                                    ) : (
                                                        <img src={msg.mediaUrl} alt="Shared" className="max-w-full max-h-60 object-cover hover:scale-105 transition-transform duration-500 cursor-pointer" onClick={() => window.open(msg.mediaUrl, '_blank')} />
                                                    )}
                                                </div>
                                            )}

                                            {msg.type === 'sticker' && (
                                                <div className="text-6xl hover:scale-110 transition-transform cursor-pointer drop-shadow-lg p-1">
                                                    {msg.sticker}
                                                </div>
                                            )}

                                            {/* Likes Count */}
                                            {msg.likes && msg.likes.length > 0 && (
                                                <div className={`absolute -bottom-2 ${isMe ? '-left-2' : '-right-2'} bg-white border border-slate-100 rounded-full px-1.5 py-0.5 shadow-sm flex items-center gap-1 animate-in zoom-in-50`}>
                                                    <i className="fa-solid fa-heart text-[8px] text-red-500"></i>
                                                    <span className="text-[8px] font-bold text-slate-600">{msg.likes.length}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Message Actions (Hover) */}
                                        <div className={`absolute top-1/2 -translate-y-1/2 ${isMe ? '-left-28' : '-right-28'} opacity-0 group-hover/bubble:opacity-100 transition-opacity flex items-center gap-1 p-2`}>
                                            <button
                                                onClick={() => toggleLike(msg)}
                                                className={`w-8 h-8 rounded-full bg-white flex items-center justify-center transition-all shadow-md hover:-translate-y-0.5 border border-slate-100 ${isLiked ? 'text-red-500' : 'text-slate-400 hover:text-red-500'}`}
                                                title="Like"
                                            >
                                                <i className={`${isLiked ? 'fa-solid' : 'fa-regular'} fa-heart text-xs`}></i>
                                            </button>

                                            <button
                                                onClick={() => setReplyingTo(msg)}
                                                className="w-8 h-8 rounded-full bg-white text-slate-400 hover:text-white hover:bg-indigo-600 flex items-center justify-center transition-all shadow-md hover:-translate-y-0.5 border border-slate-100"
                                                title="Reply"
                                            >
                                                <i className="fa-solid fa-reply text-xs"></i>
                                            </button>

                                            <div className="relative">
                                                <button
                                                    onClick={() => setActiveMenuId(activeMenuId === msg.id ? null : msg.id)}
                                                    className={`w-8 h-8 rounded-full bg-white text-slate-400 hover:text-slate-900 border border-slate-100 flex items-center justify-center transition-all shadow-md hover:-translate-y-0.5 ${activeMenuId === msg.id ? 'bg-slate-100 text-slate-900' : ''}`}
                                                >
                                                    <i className="fa-solid fa-ellipsis text-xs"></i>
                                                </button>


                                                {activeMenuId === msg.id && (
                                                    <div className="absolute top-full left-0 mt-2 w-32 bg-white border border-slate-100 rounded-xl shadow-xl p-1 z-50 animate-in fade-in zoom-in-95">
                                                        {msg.text && (
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    copyToClipboard(msg.text!);
                                                                }}
                                                                className="w-full text-left px-3 py-2 text-[10px] font-bold text-slate-600 hover:bg-slate-50 rounded-lg flex items-center gap-2"
                                                            >
                                                                <i className="fa-regular fa-copy text-indigo-500"></i> Copy
                                                            </button>
                                                        )}
                                                        {isMe && (
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    deleteMessage(msg);
                                                                }}
                                                                className="w-full text-left px-3 py-2 text-[10px] font-bold text-red-500 hover:bg-red-50 rounded-lg flex items-center gap-2 border-t border-slate-50 mt-1 pt-2"
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
            <div className="p-4 bg-white border-t border-slate-100 relative z-20">
                {uploading && (
                    <div className="absolute top-0 left-0 w-full h-1 bg-indigo-50 overflow-hidden">
                        <div className="h-full bg-indigo-500 animate-[progress_1s_ease-in-out_infinite]"></div>
                    </div>
                )}

                {replyingTo && (
                    <div className="flex items-center justify-between bg-indigo-50 border border-indigo-100 rounded-t-2xl p-3 text-xs -mt-4 mb-2 mx-1 animate-in slide-in-from-bottom-2">
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600">
                                <i className="fa-solid fa-reply"></i>
                            </div>
                            <div>
                                <span className="text-indigo-900 font-bold block">Replying to {replyingTo.displayName}</span>
                                <span className="text-indigo-600/70 truncate block max-w-xs">{replyingTo.text || '[Media]'}</span>
                            </div>
                        </div>
                        <button onClick={() => setReplyingTo(null)} className="w-6 h-6 rounded-full hover:bg-indigo-100 flex items-center justify-center text-indigo-400 hover:text-indigo-700 transition-colors">
                            <i className="fa-solid fa-xmark"></i>
                        </button>
                    </div>
                )}

                {showStickers && (
                    <div className="absolute bottom-24 left-4 bg-white rounded-2xl shadow-2xl border border-slate-100 p-4 grid grid-cols-5 gap-2 w-72 animate-in fade-in slide-in-from-bottom-4 z-50">
                        {STICKERS.map(sticker => (
                            <button
                                key={sticker}
                                type="button"
                                onClick={() => sendSticker(sticker)}
                                className="text-3xl hover:bg-slate-50 p-2 rounded-xl transition-all hover:scale-110"
                            >
                                {sticker}
                            </button>
                        ))}
                    </div>
                )}

                <div className="bg-slate-50 p-1.5 rounded-[1.5rem] border border-slate-200 shadow-inner flex gap-2 items-end hover:border-indigo-300 transition-colors focus-within:ring-2 focus-within:ring-indigo-100 focus-within:border-indigo-400">
                    {/* Tools */}
                    <div className="flex gap-1 pb-1 pl-1">
                        <button
                            type="button"
                            onClick={() => setShowStickers(!showStickers)}
                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${showStickers ? 'bg-indigo-100 text-indigo-600' : 'text-slate-400 hover:text-indigo-600 hover:bg-white border border-transparent hover:border-slate-200 hover:shadow-sm'}`}
                            title="Stickers"
                        >
                            <i className="fa-solid fa-face-smile text-lg"></i>
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
                            className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-white border border-transparent hover:border-slate-200 hover:shadow-sm transition-all"
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
                            placeholder="Message @someone..."
                            className="w-full bg-transparent border-none text-slate-800 focus:outline-none placeholder:text-slate-400 font-medium resize-none text-sm max-h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300"
                            rows={1}
                            style={{ minHeight: '24px' }}
                        />
                    </div>

                    {/* Send Button */}
                    <button
                        type="button"
                        onClick={() => sendMessage()}
                        disabled={!newMessage.trim() && !uploading}
                        className="w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-600/20 hover:scale-105 active:scale-95 mb-0.5"
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
