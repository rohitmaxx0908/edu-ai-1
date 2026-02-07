import React, { useState, useEffect, useRef } from 'react';
import { db, auth } from '../services/firebase';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, Timestamp } from 'firebase/firestore';

interface ChatMessage {
    id: string;
    text: string;
    uid: string;
    displayName: string;
    createdAt: Timestamp | null;
}

const ChatRoom: React.FC = () => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const dummy = useRef<HTMLSpanElement>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const q = query(collection(db, 'chat_messages'), orderBy('createdAt'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const msgs: ChatMessage[] = [];
            snapshot.forEach((doc) => {
                msgs.push({ id: doc.id, ...doc.data() } as ChatMessage);
            });
            setMessages(msgs);
            setLoading(false);
            dummy.current?.scrollIntoView({ behavior: 'smooth' });
        }, (err) => {
            console.error("Chat error:", err);
            setError(`Error: ${err.message}`);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (!newMessage.trim() || !auth.currentUser) return;

        try {
            await addDoc(collection(db, 'chat_messages'), {
                text: newMessage,
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

    return (
        <div className="flex flex-col h-[calc(100vh-140px)] bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Header */}
            <div className="bg-slate-50 border-b border-slate-100 p-4 flex items-center justify-between">
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
                <div className="bg-red-50 p-4 border-b border-red-100 flex items-start gap-3">
                    <i className="fa-solid fa-triangle-exclamation text-red-500 mt-0.5"></i>
                    <div className="flex-1">
                        <p className="text-xs font-bold text-red-800">Connection Issue</p>
                        <p className="text-[10px] text-red-600 break-words">{error}</p>
                        {error.includes("permission-denied") && (
                            <p className="text-[10px] text-red-600 mt-1 font-bold">Tip: Check if Firestore Rules allow read/write.</p>
                        )}
                        {error.includes("project-not-found") || error.includes("not found") ? (
                            <p className="text-[10px] text-red-600 mt-1 font-bold">Tip: You must CREATE the Firestore Database in Firebase Console first!</p>
                        ) : null}
                    </div>
                </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30">
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
                        <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <div className={`flex gap-2 max-w-[80%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
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
                                    </div>
                                    <div className={`px-4 py-2 rounded-2xl text-sm ${isMe
                                        ? 'bg-indigo-600 text-white rounded-tr-none'
                                        : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none shadow-sm'
                                        }`}>
                                        {msg.text}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
                <span ref={dummy}></span>
            </div>

            {/* Input */}
            <form onSubmit={sendMessage} className="p-4 bg-white border-t border-slate-100">
                <div className="flex gap-2">
                    <input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400 font-medium"
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className="px-6 bg-indigo-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-indigo-200"
                    >
                        Send
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ChatRoom;
