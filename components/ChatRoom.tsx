import React, { useState, useEffect, useRef } from 'react';
import { db, auth, storage } from '../services/firebase';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, Timestamp, deleteDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

interface ChatMessage {
    id: string;
    text?: string;
    imageUrl?: string;
    sticker?: string;
    type: 'text' | 'image' | 'sticker';
    uid: string;
    displayName: string;
    createdAt: Timestamp | null;
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

    useEffect(() => {
        const q = query(collection(db, 'chat_messages'), orderBy('createdAt'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const msgs: ChatMessage[] = [];
            snapshot.forEach((doc) => {
                msgs.push({ id: doc.id, ...doc.data() } as ChatMessage);
            });
            setMessages(msgs);
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

        try {
            await addDoc(collection(db, 'chat_messages'), {
                text: newMessage,
                type: 'text',
                createdAt: serverTimestamp(),
                uid: auth.currentUser.uid,
                displayName: auth.currentUser.displayName || auth.currentUser.email || 'Anonymous'
            });
            setNewMessage('');
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
                displayName: auth.currentUser.displayName || auth.currentUser.email || 'Anonymous'
            });
            dummy.current?.scrollIntoView({ behavior: 'smooth' });
        } catch (err: any) {
            setError(`Failed to send sticker: ${err.message}`);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !auth.currentUser) return;

        setUploading(true);
        try {
            const storageRef = ref(storage, `chat_images/${auth.currentUser.uid}_${Date.now()}_${file.name}`);
            await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(storageRef);

            await addDoc(collection(db, 'chat_messages'), {
                imageUrl: downloadURL,
                type: 'image',
                createdAt: serverTimestamp(),
                uid: auth.currentUser.uid,
                displayName: auth.currentUser.displayName || auth.currentUser.email || 'Anonymous'
            });
            dummy.current?.scrollIntoView({ behavior: 'smooth' });
        } catch (err: any) {
            console.error("Upload error:", err);
            setError(`Failed to upload image: ${err.message}`);
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

    return (
        <div className="flex flex-col h-full bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden relative">
            {/* Header */}
            <div className="bg-slate-50 border-b border-slate-100 p-4 flex items-center justify-between z-10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                        <i className="fa-solid fa-comments text-indigo-600"></i>
                    </div>
                    <div>
                        <h2 className="text-sm font-bold text-slate-900">Community Chat</h2>
                        <p className="text-[10px] text-slate-500 font-medium">Connect with other learners</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Live</span>
                </div>
            </div>

            {/* Error Message Display */}
            {error && (
                <div className="bg-red-50 p-4 border-b border-red-100 flex items-start gap-3 absolute top-[73px] w-full z-20">
                    <i className="fa-solid fa-triangle-exclamation text-red-500 mt-0.5"></i>
                    <div className="flex-1">
                        <p className="text-xs font-bold text-red-800">Connection Issue</p>
                        <p className="text-[10px] text-red-600 break-words">{error}</p>
                    </div>
                    <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-slate-50/30">
                {loading && (
                    <div className="flex justify-center py-10">
                        <i className="fa-solid fa-circle-notch fa-spin text-slate-300"></i>
                    </div>
                )}

                {!loading && messages.length === 0 && (
                    <div className="text-center py-20 opacity-50">
                        <i className="fa-regular fa-comments text-4xl mb-3 text-slate-300"></i>
                        <p className="text-xs text-slate-400">No messages yet. Start the conversation!</p>
                    </div>
                )}

                {messages.map((msg) => {
                    const isMe = msg.uid === auth.currentUser?.uid;
                    return (
                        <div key={msg.id} className={`flex group ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <div className={`flex gap-2 max-w-[85%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isMe ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-200 text-slate-600'}`}>
                                    <span className="text-xs font-bold">
                                        {msg.displayName.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <div>
                                    <div className={`flex items-baseline gap-2 mb-1 ${isMe ? 'flex-row-reverse' : ''}`}>
                                        <span className="text-[10px] font-bold text-slate-500">{msg.displayName}</span>
                                        {msg.createdAt && (
                                            <span className="text-[9px] text-slate-300">
                                                {msg.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        )}
                                        {isMe && (
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    deleteMessage(msg);
                                                }}
                                                className="text-slate-300 hover:text-red-500 p-2 transition-colors"
                                                title="Delete"
                                            >
                                                <i className="fa-solid fa-trash text-xs"></i>
                                            </button>
                                        )}
                                    </div>

                                    {msg.type === 'text' && (
                                        <div className={`px-4 py-2 rounded-2xl text-sm ${isMe
                                            ? 'bg-indigo-600 text-white rounded-tr-none'
                                            : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none shadow-sm'
                                            }`}>
                                            {msg.text}
                                        </div>
                                    )}

                                    {msg.type === 'image' && msg.imageUrl && (
                                        <div className={`rounded-2xl overflow-hidden border border-slate-200 ${isMe ? 'rounded-tr-none' : 'rounded-tl-none'}`}>
                                            <img src={msg.imageUrl} alt="Shared" className="max-w-full max-h-60 object-cover" />
                                        </div>
                                    )}

                                    {msg.type === 'sticker' && (
                                        <div className="text-6xl hover:scale-110 transition-transform cursor-pointer">
                                            {msg.sticker}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
                <span ref={dummy}></span>
            </div>

            {/* Input */}
            <form onSubmit={sendMessage} className="p-4 bg-white border-t border-slate-100 relative">
                {uploading && (
                    <div className="absolute top-0 left-0 w-full h-1 bg-indigo-100 overflow-hidden">
                        <div className="h-full bg-indigo-600 animate-progress"></div>
                    </div>
                )}

                {showStickers && (
                    <div className="absolute bottom-full left-4 mb-2 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 grid grid-cols-5 gap-2 w-64 animate-in fade-in slide-in-from-bottom-4 z-20">
                        {STICKERS.map(sticker => (
                            <button
                                key={sticker}
                                type="button"
                                onClick={() => sendSticker(sticker)}
                                className="text-2xl hover:bg-slate-50 p-2 rounded-lg transition-colors"
                            >
                                {sticker}
                            </button>
                        ))}
                    </div>
                )}

                <div className="flex gap-2 items-end">
                    <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl flex items-center p-1 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all">
                        <button
                            type="button"
                            onClick={() => setShowStickers(!showStickers)}
                            className={`p-2 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors ${showStickers ? 'text-indigo-600 bg-indigo-50' : ''}`}
                            title="Stickers"
                        >
                            <i className="fa-solid fa-face-smile text-lg"></i>
                        </button>

                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleImageUpload}
                        />
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="p-2 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                            title="Upload Image"
                            disabled={uploading}
                        >
                            <i className="fa-solid fa-paperclip text-lg"></i>
                        </button>

                        <input
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type a message..."
                            className="flex-1 bg-transparent border-none px-3 py-2 text-sm focus:outline-none placeholder:text-slate-400 font-medium"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={!newMessage.trim() && !uploading}
                        className="px-5 py-3 bg-indigo-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-indigo-200 h-[46px]"
                    >
                        <i className="fa-solid fa-paper-plane"></i>
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ChatRoom;
