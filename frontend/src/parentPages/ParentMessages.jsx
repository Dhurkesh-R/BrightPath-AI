import React, { useEffect, useState, useRef } from "react";
import { Send, UserCircle, Plus, Loader2, ChevronLeft } from "lucide-react"; // Added ChevronLeft
import { motion, AnimatePresence } from "framer-motion";
import { useTheme, getThemeClasses } from "../contexts/ThemeContext";
import {
  getMessages,
  getMessageThread,
  sendMessage,
} from "../services/api";
import StartNewChatModal from "../components/StartNewChatP";
import { getSocket } from "../services/socket";

// ... keep formatStickyDate function same ...

export default function ParentMessages() {
  const { theme } = useTheme();
  const { bg, text, border, bgCard, textSecondary } = getThemeClasses(theme);

  const [conversations, setConversations] = useState([]);
  const [activeUser, setActiveUser] = useState(null);
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showNewChat, setShowNewChat] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));
  const messagesEndRef = useRef(null);

  /* ---------------- Auto Scroll ---------------- */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ---------------- Socket & Load logic (Keep exactly as is) ---------------- */
  useEffect(() => {
    const socket = getSocket();
    setSocket(socket);
    const handleIncoming = (message) => {
      if (!activeUser) return;
      const isFromActiveChat = message.senderId === activeUser.userId && message.receiverId === user.id;
      if (isFromActiveChat) setMessages((prev) => [...prev, message]);
    };
    socket.on("new_message", handleIncoming);
    return () => socket.off("new_message", handleIncoming);
  }, [activeUser]);

  useEffect(() => {
    if (!activeUser || !socket) return;
    socket.emit("join_conversation", { otherUserId: activeUser.userId, auth: localStorage.getItem("token") });
  }, [activeUser, socket]);

  useEffect(() => {
    async function loadConversations() {
      try {
        setLoading(true);
        const data = await getMessages();
        setConversations(data);
      } catch (err) { console.error(err); } finally { setLoading(false); }
    }
    loadConversations();
  }, []);

  useEffect(() => {
    if (!activeUser) return;
    async function loadThread() {
      try {
        setLoading(true);
        const data = await getMessageThread(activeUser.userId);
        setMessages(data);
      } catch (err) { console.error(err); } finally { setLoading(false); }
    }
    loadThread();
  }, [activeUser]);

  const handleSend = async () => {
    if (!input.trim() || !activeUser) return;
    const optimisticMsg = { senderId: user.id, receiverId: activeUser.userId, content: input, createdAt: new Date().toISOString() };
    setMessages((prev) => [...prev, optimisticMsg]);
    setInput("");
    try { await sendMessage(optimisticMsg); } catch (err) { console.error(err); }
  };

  const handleSelectTeacher = (teacher) => {
    setActiveUser({ userId: teacher.userId, name: teacher.name });
    setMessages([]);
    setShowNewChat(false);
  };

  if (loading && conversations.length === 0) {
    return (
      <div className={`flex items-center justify-center h-screen ${bg} ${textSecondary} w-full md:ml-16`}>
        <Loader2 className="animate-spin mr-2 w-6 h-6 text-blue-500" />
        <span className="text-lg">Loading conversations...</span>
      </div>
    );
  }

  return (
    <div className={`flex h-screen ${bg} ${text} md:ml-16 w-full overflow-hidden transition-all duration-300`}>
      
      {/* LEFT SIDEBAR - Responsive: Hidden on mobile if a chat is active */}
      <div className={`${activeUser ? 'hidden md:flex' : 'flex'} w-full md:w-80 flex-col border-r ${border} ${bgCard}`}>
        <div className="flex items-center p-4 border-b h-[73px]">
           {/* Header Spacer for Hamburger */}
           <div className="w-12 md:hidden" /> 
           <h1 className="text-xl font-bold flex-1">Messages</h1>
           <button onClick={() => setShowNewChat(true)} className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-full transition-colors">
            <Plus size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <p className={`p-6 text-center ${textSecondary} text-sm`}>No conversations yet</p>
          ) : (
            conversations.map((c) => (
              <button
                key={c.userId}
                onClick={() => setActiveUser(c)}
                className={`w-full flex items-center gap-3 px-4 py-4 transition border-b ${border} last:border-0
                  ${activeUser?.userId === c.userId ? "bg-blue-600/10 border-r-4 border-r-blue-500" : "hover:bg-gray-700/10"}
                `}
              >
                <UserCircle className="w-12 h-12 text-gray-400" />
                <div className="text-left overflow-hidden">
                  <p className="font-semibold truncate">{c.name}</p>
                  <p className={`text-xs ${textSecondary}`}>Teacher</p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* CHAT WINDOW - Responsive: Hidden on mobile if no chat selected */}
      <div className={`${!activeUser ? 'hidden md:flex' : 'flex'} flex-1 flex-col h-full`}>
        <div className={`p-4 border-b ${border} flex items-center h-[73px]`}>
          {/* Back button for Mobile */}
          <button 
            onClick={() => setActiveUser(null)} 
            className="md:hidden mr-3 p-1 hover:bg-gray-700/20 rounded-lg"
          >
            <ChevronLeft size={24} />
          </button>
          
          {activeUser ? (
            <div className="flex items-center gap-2">
              <UserCircle className="w-8 h-8 text-blue-500" />
              <p className="font-bold">{activeUser.name}</p>
            </div>
          ) : (
            <div className="flex items-center gap-2">
                <div className="w-12 md:hidden" /> {/* Spacer if nothing selected */}
                <p className={textSecondary}>Select a conversation</p>
            </div>
          )}
        </div>

        {/* MESSAGES AREA */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-black/5">
          {activeUser ? (
             messages.map((m, idx) => {
                const isMe = m.senderId === user.id;
                const currentDate = new Date(m.createdAt).toDateString();
                const previousDate = idx > 0 ? new Date(messages[idx - 1].createdAt).toDateString() : null;
                const showDateHeader = currentDate !== previousDate;
                
                return (
                  <React.Fragment key={m.id || idx}>
                    {showDateHeader && (
                      <div className="flex justify-center my-6">
                        <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-tighter ${bgCard} ${textSecondary} border ${border}`}>
                          {formatStickyDate(m.createdAt)}
                        </span>
                      </div>
                    )}
                    <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                      className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[85%] md:max-w-[70%] px-4 py-2 rounded-2xl shadow-sm
                        ${isMe ? "bg-blue-600 text-white rounded-tr-none" : `${bgCard} border ${border} rounded-tl-none`}`}>
                        <p className="text-sm whitespace-pre-wrap">{m.content}</p>
                        <p className={`text-[9px] mt-1 opacity-60 text-right uppercase`}>
                          {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </motion.div>
                  </React.Fragment>
                );
              })
          ) : (
            <div className="h-full flex flex-col items-center justify-center opacity-30">
                <UserCircle size={64} />
                <p className="mt-4">Pick a teacher to start chatting</p>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* INPUT AREA */}
        {activeUser && (
          <div className={`p-4 bg-transparent`}>
            <div className={`flex gap-2 p-1.5 rounded-2xl border ${border} ${bgCard} shadow-lg`}>
                <input
                  className="flex-1 bg-transparent px-3 py-2 text-sm focus:outline-none"
                  placeholder="Type a message…"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                />
                <button onClick={handleSend} className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-transform active:scale-95">
                  <Send size={18} />
                </button>
            </div>
          </div>
        )}
      </div>

      <StartNewChatModal open={showNewChat} onClose={() => setShowNewChat(false)} onSelectTeacher={handleSelectTeacher} />
    </div>
  );
}
