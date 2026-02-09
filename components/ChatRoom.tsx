import React, { useState, useEffect, useRef } from 'react';
import { db, auth, storage } from '../services/firebase';
import {
    collection, addDoc, query, orderBy, onSnapshot, serverTimestamp,
    Timestamp, deleteDoc, doc, updateDoc, arrayUnion, arrayRemove, where
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useTheme } from '../context/ThemeContext';

// --- Interfaces ---
interface ReplyInfo {
    id: string;
    displayName: string;
    text: string;
}

interface ChatMessage {
    id: string;
    text?: string;
    mediaUrl?: string;
    mediaType?: 'image' | 'video';
    sticker?: string;
    type: 'text' | 'media' | 'sticker';
    uid: string;
    displayName: string;
    photoURL?: string;
    createdAt: Timestamp | null;
    replyTo?: ReplyInfo;
    likes?: string[];
    channelId: string;
}

interface ChatRoomData {
    id: string;
    name: string;
    description?: string;
    type: 'public' | 'private';
    password?: string;
    createdBy: string;
    createdAt: Timestamp;
}

// --- Constants ---
const STICKERS = ['👋', '👍', '❤️', '😂', '😮', '😢', '😡', '🎉', '🔥', '🚀', '💯', '🤔', '👀', '✨', '💪', '🤖', '👾', '💎'];

const SYSTEM_CHANNELS = [
    { id: 'general', name: 'General Grid', icon: 'fa-globe', color: 'text-indigo-400', description: 'Global public communications' },
    { id: 'career', name: 'Career Ops', icon: 'fa-briefcase', color: 'text-emerald-400', description: 'Job market intel and networking' },
    { id: 'tech', name: 'Tech Intel', icon: 'fa-microchip', color: 'text-cyan-400', description: 'Technology stack discussions' },
    { id: 'random', name: 'Off Topic', icon: 'fa-comments', color: 'text-rose-400', description: 'Random signals and noise' }
];

const ChatRoom: React.FC = () => {
    // --- State: Message & Room Data ---
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [userRooms, setUserRooms] = useState<ChatRoomData[]>([]);

    // --- State: UI & Actions ---
    const [activeChannel, setActiveChannel] = useState('general');
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // --- State: Advanced Interaction ---
    const [showStickers, setShowStickers] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
    const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
    const [unlockedRooms, setUnlockedRooms] = useState<Set<string>>(new Set());

    // --- Theme Context ---
    const { theme, t } = useTheme();

    // --- State: Modals ---
    const [showCreateRoom, setShowCreateRoom] = useState(false);
    const [showPasswordPrompt, setShowPasswordPrompt] = useState<string | null>(null); // "roomId" or null

    // --- State: Form Inputs ---
    const [newRoomName, setNewRoomName] = useState('');
    const [newRoomDesc, setNewRoomDesc] = useState('');
    const [newRoomType, setNewRoomType] = useState<'public' | 'private'>('public');
    const [newRoomPassword, setNewRoomPassword] = useState('');
    const [roomPasswordInput, setRoomPasswordInput] = useState('');

    // --- Refs ---
    const dummy = useRef<HTMLSpanElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // --- Initial Effect: Close menus on click outside ---
    useEffect(() => {
        const handleClickOutside = () => setActiveMenuId(null);
        window.addEventListener('click', handleClickOutside);
        return () => window.removeEventListener('click', handleClickOutside);
    }, []);

    // --- Effect: Fetch User Created Rooms ---
    useEffect(() => {
        const q = query(collection(db, 'chat_rooms'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const rooms: ChatRoomData[] = [];
            snapshot.forEach((doc) => rooms.push({ id: doc.id, ...doc.data() } as ChatRoomData));
            setUserRooms(rooms);
        });
        return () => unsubscribe();
    }, []);

    // --- Effect: Fetch Messages for Active Channel ---
    useEffect(() => {
        setLoading(true);
        // Switched to Client-Side sorting to avoid "Missing Index" errors for the user
        const q = query(
            collection(db, 'chat_messages'),
            where('channelId', '==', activeChannel)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const msgs: ChatMessage[] = [];
            snapshot.forEach((doc) => msgs.push({ id: doc.id, ...doc.data() } as ChatMessage));

            // Client-side Sort: Descending (Newest First)
            msgs.sort((a, b) => {
                const tA = a.createdAt?.toMillis() || Date.now();
                const tB = b.createdAt?.toMillis() || Date.now();
                return tB - tA; // Descending
            });

            setMessages(msgs.reverse()); // Reverse to show Oldest -> Newest (Bottom)
            setLoading(false);
            setTimeout(() => dummy.current?.scrollIntoView({ behavior: 'smooth' }), 100);
        }, (err) => {
            console.error("Chat Query Error:", err);
            setError(`Connection Error: ${err.message}`);
            setLoading(false);
        });
        return () => unsubscribe();
    }, [activeChannel]);

    // --- Actions: Room Management ---
    const handleCreateRoom = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newRoomName.trim() || !auth.currentUser) return;

        try {
            await addDoc(collection(db, 'chat_rooms'), {
                name: newRoomName.trim(),
                description: newRoomDesc.trim(),
                type: newRoomType,
                password: newRoomPassword, // Stored plain for this specific request context
                createdBy: auth.currentUser.uid,
                createdAt: serverTimestamp()
            });
            setShowCreateRoom(false);
            setNewRoomName(''); setNewRoomDesc(''); setNewRoomType('public'); setNewRoomPassword('');
        } catch (err: any) {
            setError("Failed to initialize node: " + err.message);
        }
    };

    const handleJoinRoom = (room: ChatRoomData) => {
        const isOwner = auth.currentUser && room.createdBy === auth.currentUser.uid;
        if (room.type === 'private' && !isOwner && !unlockedRooms.has(room.id)) {
            setShowPasswordPrompt(room.id);
            setRoomPasswordInput('');
        } else {
            setActiveChannel(room.id);
            setSidebarOpen(false);
        }
    };

    const handleDeleteRoom = async (e: React.MouseEvent, roomId: string, roomName: string) => {
        e.stopPropagation(); // Prevent joining the room when clicking delete
        if (!window.confirm(`Destroy node "${roomName}"? This cannot be undone.`)) return;
        try {
            await deleteDoc(doc(db, 'chat_rooms', roomId));
            if (activeChannel === roomId) setActiveChannel('general');
        } catch (err: any) {
            setError("Failed to destroy node: " + err.message);
        }
    };

    const submitPassword = () => {
        const room = userRooms.find(r => r.id === showPasswordPrompt);
        if (room && room.password === roomPasswordInput) {
            setUnlockedRooms(prev => new Set(prev).add(room.id));
            setActiveChannel(room.id);
            setShowPasswordPrompt(null);
            setSidebarOpen(false);
        } else {
            alert("Access Denied: Invalid Security Key");
        }
    };

    // --- Actions: Messaging ---
    const sendMessage = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setError(null);
        if (!newMessage.trim() || !auth.currentUser) return;

        const messageData: any = {
            text: newMessage,
            type: 'text',
            createdAt: serverTimestamp(),
            uid: auth.currentUser.uid,
            displayName: auth.currentUser.displayName || 'Anonymous',
            photoURL: auth.currentUser.photoURL || null,
            likes: [],
            channelId: activeChannel
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
        } catch (err: any) { setError(`Failed to send: ${err.message}`); }
    };

    const sendSticker = async (sticker: string) => {
        if (!auth.currentUser) return;
        setShowStickers(false);
        try {
            await addDoc(collection(db, 'chat_messages'), {
                sticker,
                type: 'sticker',
                createdAt: serverTimestamp(),
                uid: auth.currentUser.uid,
                displayName: auth.currentUser.displayName || 'Anonymous',
                photoURL: auth.currentUser.photoURL || null,
                likes: [],
                channelId: activeChannel
            });
            dummy.current?.scrollIntoView({ behavior: 'smooth' });
        } catch (err: any) { setError(`Transmission failed: ${err.message}`); }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !auth.currentUser) return;

        const isVideo = file.type.startsWith('video/');
        const isImage = file.type.startsWith('image/');
        if (!isVideo && !isImage) { setError("Unsupported media format."); return; }

        setUploading(true);
        try {
            // Unique path to prevent overwrites
            const storageRef = ref(storage, `chat_media/${activeChannel}/${auth.currentUser.uid}_${Date.now()}_${file.name}`);
            await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(storageRef);

            await addDoc(collection(db, 'chat_messages'), {
                mediaUrl: downloadURL,
                mediaType: isVideo ? 'video' : 'image',
                type: 'media',
                createdAt: serverTimestamp(),
                uid: auth.currentUser.uid,
                displayName: auth.currentUser.displayName || 'Anonymous',
                photoURL: auth.currentUser.photoURL || null,
                likes: [],
                channelId: activeChannel
            });
            dummy.current?.scrollIntoView({ behavior: 'smooth' });
        } catch (err: any) {
            console.error(err);
            setError(`Upload failed: ${err.message}`);
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const deleteMessage = async (msg: ChatMessage) => {
        if (!auth.currentUser || msg.uid !== auth.currentUser.uid) return;
        // Simple confirm dialog
        if (!window.confirm("Delete this message completely?")) return;

        try {
            await deleteDoc(doc(db, 'chat_messages', msg.id));
            // Close menu if open
            if (activeMenuId === msg.id) setActiveMenuId(null);
        } catch (err: any) {
            console.error("Delete Error:", err);
            setError(`Deletion failed: ${err.message}`);
        }
    };

    const toggleLike = async (msg: ChatMessage) => {
        if (!auth.currentUser) return;
        try {
            await updateDoc(doc(db, 'chat_messages', msg.id), {
                likes: msg.likes?.includes(auth.currentUser.uid) ? arrayRemove(auth.currentUser.uid) : arrayUnion(auth.currentUser.uid)
            });
        } catch (err) { console.error(err); }
    };

    const copyToClipboard = async (text: string) => {
        try { await navigator.clipboard.writeText(text); setActiveMenuId(null); }
        catch (err) { console.error('Failed to copy', err); }
    };

    const renderTextWithMentions = (text: string) => {
        const parts = text.split(/(@\w+)/g);
        return parts.map((part, i) => part.match(/(@\w+)/) ? <span key={i} className="text-indigo-400 font-bold bg-indigo-500/10 px-1 rounded-md mx-0.5 border border-indigo-500/20">{part}</span> : part);
    };

    // --- Helpers ---
    const currentChannelName =
        SYSTEM_CHANNELS.find(c => c.id === activeChannel)?.name ||
        userRooms.find(r => r.id === activeChannel)?.name ||
        'Unknown Grid';

    return (
        <div className={`flex w-full h-full ${t.bg} overflow-hidden relative transition-colors duration-500`}>

            {/* Background Atmosphere */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className={`absolute top-0 left-0 w-full h-[300px] bg-gradient-to-b ${theme === 'dark' ? 'from-cyan-900/10' : 'from-indigo-50/50'} to-transparent transition-colors duration-1000`}></div>
                <div className={`absolute -left-20 top-20 w-96 h-96 ${theme === 'dark' ? 'bg-cyan-500/5' : 'bg-indigo-500/5'} rounded-full blur-3xl transition-colors duration-1000`}></div>
                <div className={`absolute -right-20 bottom-20 w-96 h-96 ${theme === 'dark' ? 'bg-purple-500/5' : 'bg-purple-500/5'} rounded-full blur-3xl transition-colors duration-1000`}></div>
            </div>

            {/* --- SIDEBAR --- */}
            <div className={`fixed inset-y-0 left-0 z-40 w-72 ${t.sidebar} transform transition-all duration-300 lg:translate-x-0 lg:stationary lg:relative lg:flex lg:flex-col ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                {/* Sidebar Header */}
                <div className={`p-6 border-b ${t.divider} flex items-center justify-between`}>
                    <div>
                        <h2 className={`text-xl font-black ${t.sidebarText} tracking-tighter flex items-center gap-2`}>
                            <i className={`fa-solid fa-layer-group ${theme === 'dark' ? 'text-cyan-500' : 'text-indigo-600'}`}></i> NEXUS
                        </h2>
                        <p className={`text-[9px] font-bold ${t.sidebarSub} uppercase tracking-widest mt-1`}>Encrypted Network</p>
                    </div>
                </div>

                {/* Channels List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    {/* System Channels */}
                    <div className="space-y-1">
                        <p className={`px-4 text-[9px] font-black ${t.sidebarSub} uppercase tracking-widest mb-2 flex items-center gap-2`}>
                            <i className="fa-solid fa-server text-[8px]"></i> Core Uplinks
                        </p>
                        {SYSTEM_CHANNELS.map(ch => (
                            <button
                                key={ch.id}
                                onClick={() => { setActiveChannel(ch.id); setSidebarOpen(false); }}
                                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all group relative overflow-hidden ${activeChannel === ch.id ? t.activeChannel : t.inactiveChannel}`}
                            >
                                <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors text-xs ${activeChannel === ch.id ? t.channelIconActive : t.channelIconInactive + ' ' + ch.color}`}>
                                    <i className={`fa-solid ${ch.icon}`}></i>
                                </div>
                                <div className="text-left flex-1 min-w-0">
                                    <span className="text-xs font-bold uppercase tracking-wide block">{ch.name}</span>
                                    {activeChannel === ch.id && <span className="text-[8px] opacity-80 truncate block font-mono">SIGNAL_ACTIVE</span>}
                                </div>
                                {activeChannel === ch.id && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>}
                            </button>
                        ))}
                    </div>

                    {/* Community Rooms */}
                    <div className="space-y-1">
                        <div className="flex items-center justify-between px-4 mb-2">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <i className="fa-solid fa-users-rays text-[8px]"></i> User Nodes
                            </p>
                            <button onClick={() => setShowCreateRoom(true)} className="w-5 h-5 rounded hover:bg-indigo-50 text-indigo-500 flex items-center justify-center transition-colors">
                                <i className="fa-solid fa-plus text-xs"></i>
                            </button>
                        </div>

                        {userRooms.length === 0 && <p className="px-4 text-[10px] text-slate-400 italic opacity-50">No signals found.</p>}

                        {userRooms.map(room => (
                            <button
                                key={room.id}
                                onClick={() => handleJoinRoom(room)}
                                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all group ${activeChannel === room.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'text-slate-500 hover:bg-white hover:shadow-sm'}`}
                            >
                                <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors text-xs ${activeChannel === room.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                    <i className={`fa-solid ${room.type === 'private' ? 'fa-lock' : 'fa-hashtag'}`}></i>
                                </div>
                                <div className="text-left flex-1 min-w-0">
                                    <span className="text-xs font-bold uppercase tracking-wide block truncate">{room.name}</span>
                                    <span className="text-[8px] opacity-60 block truncate">{room.type}</span>
                                </div>
                                {room.type === 'private' && room.id !== activeChannel && <i className="fa-solid fa-key text-[8px] opacity-40"></i>}

                                {/* Delete Button for Owner */}
                                {auth.currentUser && room.createdBy === auth.currentUser.uid && (
                                    <div
                                        role="button"
                                        tabIndex={0}
                                        onClick={(e) => handleDeleteRoom(e, room.id, room.name)}
                                        className={`opacity-0 group-hover:opacity-100 p-1.5 rounded-lg transition-all ${activeChannel === room.id ? 'text-white/70 hover:text-white hover:bg-white/20' : 'text-slate-400 hover:text-red-500 hover:bg-red-50'}`}
                                    >
                                        <i className="fa-solid fa-trash-can text-[10px]"></i>
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* User Profile Footer */}
                <div className={`p-4 border-t ${t.divider} ${theme === 'dark' ? 'bg-black/20' : 'bg-white/40'}`}>
                    <div className={`flex items-center gap-3 p-2 rounded-xl ${t.userProfile}`}>
                        {auth.currentUser?.photoURL ?
                            <img src={auth.currentUser.photoURL} className="w-8 h-8 rounded-lg object-cover border border-white/20" alt="" /> :
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${theme === 'dark' ? 'bg-cyan-700' : 'bg-indigo-500'}`}>{auth.currentUser?.displayName?.[0]}</div>
                        }
                        <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-black uppercase tracking-wider truncate text-white">{auth.currentUser?.displayName || 'Anonymous'}</p>
                            <p className="text-[8px] font-bold text-emerald-400 flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse"></span> ONLINE</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- MAIN CHAT AREA --- */}
            <div className="flex-1 flex flex-col h-full relative z-10 w-full min-w-0">
                {/* Header */}
                <div className={`h-16 px-6 ${t.header} flex items-center justify-between sticky top-0 z-30 shadow-sm transition-colors`}>
                    <div className="flex items-center gap-4 min-w-0">
                        <button onClick={() => setSidebarOpen(!sidebarOpen)} className={`lg:hidden w-8 h-8 rounded-full border flex items-center justify-center shadow-sm ${t.iconBtn} border-transparent`}><i className="fa-solid fa-bars"></i></button>
                        <div className="min-w-0">
                            <h2 className={`text-sm font-black ${t.headerText} uppercase tracking-widest flex items-center gap-2 truncate`}>
                                <span className="w-2 h-2 shrink-0 rounded-full bg-emerald-500 animate-pulse"></span>
                                {currentChannelName}
                            </h2>
                            <p className={`text-[9px] font-bold ${t.sidebarSub} uppercase tracking-widest hidden sm:block truncate`}>
                                {SYSTEM_CHANNELS.find(c => c.id === activeChannel)?.description || 'Encrypted Channel'}
                            </p>
                        </div>
                    </div>

                    {/* Participants & Theme Toggle */}
                    <div className="flex items-center gap-4">
                        {/* Participants */}
                        <div className="flex -space-x-2 shrink-0">
                            {[1, 2, 3].map(i => (
                                <div key={i} className={`w-7 h-7 rounded-full ring-2 ring-white flex items-center justify-center text-[8px] font-bold border ${theme === 'dark' ? 'bg-slate-800 text-slate-400 border-slate-700 ring-slate-900' : 'bg-slate-200 text-slate-500 border-slate-300'}`}>
                                    <i className="fa-solid fa-user"></i>
                                </div>
                            ))}
                            <div className={`w-7 h-7 rounded-full ring-2 ${theme === 'dark' ? 'bg-cyan-600 ring-slate-900' : 'bg-slate-900 ring-white'} flex items-center justify-center text-[8px] font-bold text-white shadow-lg`}>+</div>
                        </div>
                    </div>
                </div>

                {/* Messages Feed */}
                <div className={`flex-1 overflow-y-auto p-4 lg:p-6 space-y-6 scroll-smooth ${t.chatBg}`}>
                    {/* Error Toast */}
                    {error && (
                        <div className="sticky top-4 left-0 right-0 mx-auto w-max bg-red-500 text-white px-4 py-2 rounded-full shadow-2xl flex items-center gap-2 z-50 animate-bounce">
                            <i className="fa-solid fa-triangle-exclamation"></i> <span className="text-xs font-bold max-w-xs md:max-w-md truncate">{error}</span>
                            <button onClick={() => setError(null)} className="ml-2 hover:text-red-200"><i className="fa-solid fa-xmark"></i></button>
                        </div>
                    )}

                    {loading && <div className="flex justify-center py-20"><i className="fa-solid fa-circle-notch fa-spin text-indigo-500 text-2xl"></i></div>}

                    {!loading && messages.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
                            <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-4 animate-pulse">
                                <i className="fa-solid fa-satellite-dish text-3xl text-indigo-300"></i>
                            </div>
                            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest px-4">Frequency Clear</h3>
                            <p className="text-xs text-slate-400 mt-1">Be the first to transmit on this node.</p>
                        </div>
                    )}

                    {messages.map((msg, index) => {
                        const isMe = msg.uid === auth.currentUser?.uid;
                        const showAvatar = index === 0 || messages[index - 1].uid !== msg.uid;
                        const isLiked = msg.likes?.includes(auth.currentUser?.uid || '');

                        return (
                            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} ${!showAvatar ? 'mt-1' : 'mt-6'} group animate-in slide-in-up fill-mode-backwards`} style={{ animationDelay: '50ms' }}>
                                <div className={`flex gap-3 max-w-[90%] md:max-w-[70%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                                    {/* Avatar */}
                                    <div className={`w-8 h-8 rounded-xl shrink-0 overflow-hidden shadow-sm transition-all border border-black/5 ${!showAvatar ? 'opacity-0 h-0' : 'opacity-100'}`}>
                                        {msg.photoURL ? <img src={msg.photoURL} alt="" className="w-full h-full object-cover" /> :
                                            <div className={`w-full h-full flex items-center justify-center text-[10px] font-black ${theme === 'dark' ? 'bg-gradient-to-br from-slate-700 to-slate-800 text-slate-400' : 'bg-gradient-to-br from-slate-100 to-slate-200 text-slate-500'}`}>{msg.displayName?.[0]}</div>}
                                    </div>

                                    {/* Content Bubble */}
                                    <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                        {showAvatar && <span className={`text-[9px] font-bold ${t.sidebarSub} mb-1 px-1 uppercase tracking-wide`}>{msg.displayName}</span>}

                                        <div className="relative group/bubble">
                                            {msg.replyTo && (
                                                <div className={`mb-1 px-3 py-1.5 rounded-lg text-[9px] backdrop-blur-sm border-l-2 ${isMe ? 'bg-black/10 border-white/40 text-white' : (theme === 'dark' ? 'bg-black/20 border-slate-600 text-slate-400' : 'bg-slate-200/50 border-slate-400 text-slate-600')}`}>
                                                    <span className="font-bold block opacity-75">Replying to {msg.replyTo.displayName}</span>
                                                    <span className="truncate block max-w-[150px] opacity-60 italic">{msg.replyTo.text}</span>
                                                </div>
                                            )}

                                            <div className={`px-4 py-2.5 shadow-sm relative transition-all duration-300 ${isMe ? `bg-gradient-to-br ${t.sentBubble} text-white rounded-[1.2rem] rounded-tr-sm hover:shadow-lg` : `${t.receivedBubble} backdrop-blur-sm rounded-[1.2rem] rounded-tl-sm border shadow-sm hover:shadow-md`}`}>
                                                {msg.type === 'text' && <div className="text-sm font-medium leading-relaxed whitespace-pre-wrap">{renderTextWithMentions(msg.text || '')}</div>}
                                                {msg.type === 'media' && msg.mediaUrl && (
                                                    <div className="mt-1 rounded-xl overflow-hidden max-w-xs border border-white/10 shadow-lg">
                                                        {msg.mediaType === 'video' ? <video src={msg.mediaUrl} controls className="w-full" /> :
                                                            <img src={msg.mediaUrl} alt="" className="w-full hover:scale-105 transition-transform duration-500 cursor-pointer object-cover" onClick={() => window.open(msg.mediaUrl, '_blank')} />}
                                                    </div>
                                                )}
                                                {msg.type === 'sticker' && <div className="text-5xl hover:scale-110 transition-transform cursor-pointer drop-shadow-xl filter">{msg.sticker}</div>}
                                                {msg.likes && msg.likes.length > 0 && <div className={`absolute -bottom-2 ${isMe ? '-left-2' : '-right-2'} bg-white rounded-full px-1.5 py-0.5 shadow-md border border-slate-50 flex items-center gap-1 scale-90 z-10`}><i className="fa-solid fa-heart text-[8px] text-red-500 animate-pulse"></i><span className="text-[8px] font-black text-slate-600">{msg.likes.length}</span></div>}
                                            </div>

                                            {/* Hover Actions */}
                                            <div className={`absolute top-1/2 -translate-y-1/2 ${isMe ? '-left-20' : '-right-20'} opacity-0 group-hover/bubble:opacity-100 transition-all duration-300 flex items-center gap-1`}>
                                                <button onClick={() => toggleLike(msg)} className={`w-6 h-6 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'} ${isLiked ? 'text-red-500' : 'text-slate-400 hover:text-red-500'}`}><i className={`${isLiked ? 'fa-solid' : 'fa-regular'} fa-heart text-[10px]`}></i></button>
                                                <button onClick={() => setReplyingTo(msg)} className={`w-6 h-6 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all ${theme === 'dark' ? 'bg-slate-800 text-slate-400 hover:text-cyan-500' : 'bg-white text-slate-300 hover:text-indigo-500'}`}><i className="fa-solid fa-reply text-[10px]"></i></button>
                                                {isMe && (
                                                    <button onClick={() => deleteMessage(msg)} className={`w-6 h-6 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all ${theme === 'dark' ? 'bg-slate-800 text-slate-400' : 'bg-white text-slate-300'} hover:text-red-500 hover:bg-red-500/10`} title="Delete Message">
                                                        <i className="fa-solid fa-trash-can text-[10px]"></i>
                                                    </button>
                                                )}
                                                <div className="relative">
                                                    <button onClick={() => setActiveMenuId(activeMenuId === msg.id ? null : msg.id)} className={`w-6 h-6 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all ${theme === 'dark' ? 'bg-slate-800 text-slate-400 hover:text-white' : 'bg-white text-slate-300 hover:text-slate-900'}`}><i className="fa-solid fa-ellipsis-vertical text-[10px]"></i></button>
                                                    {activeMenuId === msg.id && (
                                                        <div className={`absolute top-full left-0 mt-2 w-28 rounded-xl shadow-xl border p-1 z-50 animate-in zoom-in-95 origin-top-left ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
                                                            {msg.text && <button onClick={() => copyToClipboard(msg.text!)} className={`w-full text-left px-3 py-2 text-[10px] font-bold rounded-lg transition-colors ${theme === 'dark' ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-50'}`}>Copy Text</button>}
                                                            {isMe && <button onClick={() => deleteMessage(msg)} className="w-full text-left px-3 py-2 text-[10px] font-bold text-red-500 hover:bg-red-50 rounded-lg transition-colors">Delete</button>}
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
                <div className={`p-4 md:p-6 backdrop-blur-xl border-t relative z-30 ${t.inputBg} ${t.divider}`}>
                    <div className="max-w-4xl mx-auto">
                        {/* Reply Preview */}
                        {replyingTo && (
                            <div className={`flex items-center justify-between border rounded-2xl p-3 mb-3 shadow-lg animate-in slide-in-from-bottom-2 ${theme === 'dark' ? 'bg-slate-800 border-cyan-500/30 shadow-cyan-900/20' : 'bg-white border-indigo-100 shadow-indigo-100/50'}`}>
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className={`w-1 h-8 rounded-full ${theme === 'dark' ? 'bg-cyan-500' : 'bg-indigo-500'}`}></div>
                                    <div>
                                        <p className={`text-[10px] font-bold uppercase tracking-wide ${theme === 'dark' ? 'text-cyan-400' : 'text-indigo-500'}`}>Replying to {replyingTo.displayName}</p>
                                        <p className={`text-xs truncate max-w-[200px] border-l-2 pl-2 ${theme === 'dark' ? 'text-slate-400 border-slate-600' : 'text-slate-500 border-slate-200'}`}>{replyingTo.text || 'Media Attachment'}</p>
                                    </div>
                                </div>
                                <button onClick={() => setReplyingTo(null)} className="w-6 h-6 rounded-full bg-slate-100/10 text-slate-400 hover:bg-red-500/20 hover:text-red-500 transition-colors flex items-center justify-center"><i className="fa-solid fa-xmark text-xs"></i></button>
                            </div>
                        )}

                        {/* Sticker Picker */}
                        {showStickers && (
                            <div className={`absolute bottom-24 left-6 md:left-20 backdrop-blur-2xl rounded-[2rem] shadow-2xl border p-6 grid grid-cols-6 gap-3 w-80 animate-in zoom-in-95 z-50 origin-bottom-left ${theme === 'dark' ? 'bg-slate-900/90 border-slate-700' : 'bg-white/90 border-white/50'}`}>
                                {STICKERS.map(s => <button key={s} onClick={() => sendSticker(s)} className="text-2xl hover:bg-black/5 p-2 rounded-xl transition-all hover:scale-125">{s}</button>)}
                            </div>
                        )}

                        {/* Capsule Input */}
                        <div className={`flex gap-2 items-end rounded-[2rem] p-2 shadow-2xl border transition-all ring-1 focus-within:ring-4 ${theme === 'dark' ? 'bg-slate-900 border-slate-700 ring-slate-800 focus-within:ring-cyan-500/10' : 'bg-white border-slate-100 ring-slate-50 focus-within:ring-indigo-500/10'}`}>
                            <button onClick={() => setShowStickers(!showStickers)} className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${showStickers ? (theme === 'dark' ? 'bg-cyan-900/30 text-cyan-400 rotate-180' : 'bg-indigo-100 text-indigo-600 rotate-180') : (theme === 'dark' ? 'bg-slate-800 text-slate-500 hover:bg-cyan-900/20 hover:text-cyan-400' : 'bg-slate-50 text-slate-400 hover:bg-indigo-50 hover:text-indigo-500')}`}><i className="fa-solid fa-face-smile text-lg"></i></button>

                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*,video/*" onChange={handleFileUpload} />
                            <button onClick={() => fileInputRef.current?.click()} className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${t.iconBtn}`}><i className="fa-solid fa-paperclip text-lg"></i></button>

                            <textarea
                                value={newMessage} onChange={(e) => setNewMessage(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                                placeholder={`Signal to #${currentChannelName.split(' ')[0]}...`}
                                className={`flex-1 bg-transparent border-none outline-none text-sm py-2.5 px-2 max-h-32 resize-none font-medium font-sans ${t.inputText}`}
                                rows={1}
                            />

                            <button onClick={() => sendMessage()} disabled={!newMessage.trim() && !uploading} className={`w-10 h-10 rounded-full text-white flex items-center justify-center shadow-lg disabled:opacity-50 disabled:shadow-none transition-all transform active:scale-90 hover:rotate-12 ${theme === 'dark' ? 'bg-cyan-600 hover:bg-cyan-500' : 'bg-slate-900 hover:bg-indigo-600'}`}>
                                {uploading ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-paper-plane text-xs"></i>}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- MODAL: CREATE ROOM --- */}
            {showCreateRoom && (
                <div className={`fixed inset-0 z-50 flex items-center justify-center animate-in fade-in ${t.modalOverlay}`}>
                    <div className={`rounded-3xl shadow-2xl w-full max-w-md p-6 border animate-in zoom-in-95 scale-100 ${t.modalBg}`}>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className={`text-xl font-black ${theme === 'dark' ? 'text-slate-100' : 'text-slate-800'}`}>Initialize Node</h3>
                            <button onClick={() => setShowCreateRoom(false)} className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${theme === 'dark' ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}><i className="fa-solid fa-xmark"></i></button>
                        </div>

                        <form onSubmit={handleCreateRoom} className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">Node Identification</label>
                                <input required type="text" value={newRoomName} onChange={e => setNewRoomName(e.target.value)} placeholder="e.g. Design Team" className={`w-full rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 transition-all placeholder:font-normal ${t.modalInput} ${theme === 'dark' ? 'focus:ring-cyan-500/20' : 'focus:ring-indigo-500/20 focus:border-indigo-500'}`} />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <button type="button" onClick={() => setNewRoomType('public')} className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${newRoomType === 'public' ? (theme === 'dark' ? 'border-cyan-500 bg-cyan-900/20 text-cyan-400' : 'border-indigo-500 bg-indigo-50 text-indigo-600') : (theme === 'dark' ? 'border-slate-700 hover:border-slate-600 text-slate-500' : 'border-slate-200 hover:border-slate-300 text-slate-400')}`}>
                                    <i className="fa-solid fa-globe text-xl"></i>
                                    <span className="text-xs font-bold uppercase">Public</span>
                                </button>
                                <button type="button" onClick={() => setNewRoomType('private')} className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${newRoomType === 'private' ? (theme === 'dark' ? 'border-cyan-500 bg-cyan-900/20 text-cyan-400' : 'border-indigo-500 bg-indigo-50 text-indigo-600') : (theme === 'dark' ? 'border-slate-700 hover:border-slate-600 text-slate-500' : 'border-slate-200 hover:border-slate-300 text-slate-400')}`}>
                                    <i className="fa-solid fa-lock text-xl"></i>
                                    <span className="text-xs font-bold uppercase">Private</span>
                                </button>
                            </div>

                            {newRoomType === 'private' && (
                                <div className="animate-in slide-in-from-top-2">
                                    <label className={`text-xs font-bold uppercase tracking-widest block mb-1 ${theme === 'dark' ? 'text-cyan-400' : 'text-indigo-400'}`}>Security Key (Password)</label>
                                    <input required type="text" value={newRoomPassword} onChange={e => setNewRoomPassword(e.target.value)} placeholder="Enter access code..." className={`w-full rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 transition-all ${theme === 'dark' ? 'bg-cyan-900/10 border border-cyan-500/30 text-cyan-200 focus:ring-cyan-500/20' : 'bg-indigo-50/50 border border-indigo-200 text-indigo-900 focus:ring-indigo-500/20'}`} />
                                </div>
                            )}

                            <button type="submit" className={`w-full font-bold py-4 rounded-xl shadow-lg transition-all transform active:scale-95 flex items-center justify-center gap-2 mt-2 ${t.primaryBtn}`}>
                                <i className="fa-solid fa-bolt"></i> Establish Uplink
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* --- MODAL: PASSWORD PROMPT --- */}
            {showPasswordPrompt && (
                <div className={`fixed inset-0 z-50 flex items-center justify-center animate-in fade-in ${t.modalOverlay}`}>
                    <div className={`rounded-2xl shadow-2xl w-full max-w-sm p-8 text-center animate-in zoom-in-95 border-2 ${t.modalBg} ${theme === 'dark' ? 'border-cyan-900/50' : 'border-indigo-100'}`}>
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl shadow-inner ${theme === 'dark' ? 'bg-cyan-900/30 text-cyan-400' : 'bg-indigo-100 text-indigo-600'}`}>
                            <i className="fa-solid fa-shield-halved"></i>
                        </div>
                        <h3 className={`text-xl font-black mb-2 ${theme === 'dark' ? 'text-slate-100' : 'text-slate-800'}`}>Restricted Access</h3>
                        <p className={`text-xs mb-6 px-4 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>This node is encrypted. Please authenticate to proceed.</p>

                        <input
                            autoFocus
                            type="password"
                            value={roomPasswordInput}
                            onChange={e => setRoomPasswordInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && submitPassword()}
                            placeholder="Enter Security Key"
                            className={`w-full border-2 rounded-xl px-4 py-3 text-center font-bold mb-4 focus:outline-none transition-colors ${theme === 'dark' ? 'bg-slate-900 border-slate-700 text-white focus:border-cyan-500' : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-indigo-500'}`}
                        />

                        <div className="grid grid-cols-2 gap-3">
                            <button onClick={() => setShowPasswordPrompt(null)} className={`py-3 rounded-xl font-bold transition-colors ${theme === 'dark' ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-500 hover:bg-slate-100'}`}>Cancel</button>
                            <button onClick={submitPassword} className={`py-3 rounded-xl font-bold shadow-lg transition-all ${t.primaryBtn}`}>Unlock</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatRoom;
