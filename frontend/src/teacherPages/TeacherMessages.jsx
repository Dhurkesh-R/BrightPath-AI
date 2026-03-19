import React, { useEffect, useState, useRef } from "react";
import { Send, UserCircle, Plus, Loader2, ChevronLeft } from "lucide-react";
import { motion } from "framer-motion";
import { useTheme, getThemeClasses } from "../contexts/ThemeContext";
import {
  getMessages,
  getMessageThread,
  sendMessage,
} from "../services/api";
import StartNewChatModal from "../components/StartNewChatT";
import { getSocket } from "../services/socket";

/* -------------------- DATE FORMATTER -------------------- */
const formatStickyDate = (dateString) => {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";

  const diffDays = Math.floor((today - date) / (1000 * 60 * 60 * 24));
  if (diffDays < 7) {
    return date.toLocaleDateString([], { weekday: 'long' });
  }

  return date.toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' });
};

/* -------------------- COMPONENT -------------------- */
export default function TeacherMessages() {
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

  /* ---------------- Socket Listener ---------------- */
  useEffect(() => {
    const socketInstance = getSocket();
    setSocket(socketInstance);

    const handleIncoming = (message) => {
      if (!activeUser) return;
      const currentUserId = user.id;
      const isFromActiveChat =
        message.senderId === activeUser.userId &&
        message.receiverId === currentUserId;

      if (isFromActiveChat) {
        setMessages((prev) => [...prev, message]);
      }
    };

    socketInstance.on("new_message", handleIncoming);
    return () => {
      socketInstance.off("new_message", handleIncoming);
    };
  }, [activeUser, user.id]);

  useEffect(() => {
    if (!activeUser || !socket) return;
    socket.emit("join_conversation", {
      otherUserId: activeUser.userId,
      auth: localStorage.getItem("token")
    });
  }, [activeUser, socket]);

  /* ---------------- Load Conversations ---------------- */
  useEffect(() => {
    async function loadConversations() {
      try {
        setLoading(true);
        const data = await getMessages();
        setConversations(data);
      } catch (err) {
        console.error("Failed to load conversations", err);
      } finally {
        setLoading(false);
      }
    }
    loadConversations();
  }, []);

  /* ---------------- Load Message Thread ---------------- */
  useEffect(() => {
    if (!activeUser) return;
    async function loadThread() {
      try {
        setLoading(true);
        const data = await getMessageThread(activeUser.userId);
        setMessages(data);
      } catch (err) {
        console.error("Failed to load messages", err);
      } finally {
        setLoading(false);
      }
    }
    loadThread();
  }, [activeUser]);

  /* ---------------- Send Message ---------------- */
  const handleSend = async () => {
    if (!input.trim() || !activeUser) return;

    const optimisticMsg = {
      senderId: user.id,
      receiverId: activeUser.userId,
      content: input,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    setInput("");

    try {
      await sendMessage(optimisticMsg);
    } catch (err) {
      console.error("Failed to send message", err);
    }
  };

  /* ---------------- Select Parent ---------------- */
  const handleSelectParent = (parent) => {
    setActiveUser({
      userId: parent.userId,
      name: parent.name,
    });
    setMessages([]);
    setShowNewChat(false);
  };

  if (loading && conversations.length === 0) {
    return (
      <div className={`flex items-center justify-center h-screen ${bg} ${textSecondary} w-full md:pl-16`}>
        <Loader2 className="animate-spin mr-2 w-6 h-6 text-blue-500" />
        <span className="text-lg">Loading conversations...</span>
      </div>
    );
  }

  return (
    <div className={`flex h-screen ${bg} ${text} md:pl-16 flex-1 min-w-0 overflow-hidden transition-all duration-300`}>
      
      {/* LEFT SIDEBAR - Responsive Logic (Hidden when chat active on mobile) */}
      <div className={`${activeUser ? 'hidden md:flex' : 'flex'} w-full md:w-80 flex-col border-r ${border} ${bgCard} flex-shrink-0`}>
        <div className="flex items-center p-4 border-b h-[73px]">
           <div className="w-12 md:hidden" /> {/* Spacer for Hamburger */}
           <h1 className="text-xl font-bold flex-1">Messages</h1>
           <button onClick={() => setShowNewChat(true)} className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors">
            <Plus size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <p className={`p-4 ${textSecondary} italic`}>No conversations yet</p>
          ) : (
            conversations.map((c) => (
              <button
                key={c.userId}
                onClick={() => setActiveUser(c)}
                className={`w-full flex items-center gap-3 px-4 py-4 border-b ${border} transition-colors
                  ${activeUser?.userId === c.userId ? "bg-blue-600/10" : "hover:bg-gray-500/5"}
                `}
              >
                <UserCircle className="w-12 h-12 text-gray-400" />
                <div className="text-left overflow-hidden">
                  <p className="font-bold truncate">{c.name}</p>
                  <p className={`text-xs uppercase tracking-widest font-semibold ${textSecondary}`}>Parent</p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* CHAT WINDOW - Responsive Logic (Visible when active on mobile) */}
      <div className={`${!activeUser ? 'hidden md:flex' : 'flex'} flex-1 flex-col h-full min-w-0`}>
        <div className={`p-4 border-b ${border} flex items-center h-[73px] sticky top-0 z-10 ${bg}`}>
          {/* Mobile Back Button */}
          <button onClick={() => setActiveUser(null)} className="md:hidden mr-3 p-1 hover:bg-gray-500/10 rounded-full">
            <ChevronLeft size={28} />
          </button>
          
          {activeUser ? (
            <div className="flex items-center gap-3">
              <UserCircle className="w-8 h-8 text-blue-500" />
              <div>
                <p className="font-bold leading-tight">{activeUser.name}</p>
                <p className={`text-[10px] uppercase font-bold ${textSecondary}`}>Active Chat</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center">
                <div className="w-12 md:hidden" />
                <p className={textSecondary}>Select a conversation to start messaging</p>
            </div>
          )}
        </div>

        {/* MESSAGES AREA */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-transparent">
          {messages.map((m, idx) => {
            const isMe = m.senderId === user.id;
            const currentDate = new Date(m.createdAt).toDateString();
            const previousDate = idx > 0 ? new Date(messages[idx - 1].createdAt).toDateString() : null;
            const showDateHeader = currentDate !== previousDate;

            return (
              <React.Fragment key={m.id || idx}>
                {showDateHeader && (
                  <div className="flex justify-center my-6">
                    <span className={`text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-tighter ${bgCard} ${textSecondary} border ${border} shadow-sm`}>
                      {formatStickyDate(m.createdAt)}
                    </span>
                  </div>
                )}
                <motion.div 
                  initial={{ opacity: 0, y: 5 }} 
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex items-end gap-2 ${isMe ? "flex-row-reverse" : "flex-row"}`}
                >
                  <div className={`relative max-w-[85%] md:max-w-[70%] px-4 py-3 shadow-sm
                    ${isMe 
                      ? "bg-blue-600 text-white rounded-2xl rounded-tr-none" 
                      : `${bgCard} ${text} border ${border} rounded-2xl rounded-tl-none`}`}>
                    <p className="text-sm leading-relaxed">{m.content}</p>
                    <div className={`flex items-center gap-1 mt-1 opacity-60 ${isMe ? "justify-end" : "justify-start"}`}>
                      <span className="text-[9px] font-bold">
                        {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </motion.div>
              </React.Fragment>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* INPUT AREA */}
        {activeUser && (
          <div className={`p-4 border-t ${border} ${bg} flex gap-3 items-center`}>
            <input
              className={`flex-1 rounded-2xl px-5 py-3 ${bgCard} ${text} outline-none border ${border} focus:border-blue-500 transition-all shadow-inner`}
              placeholder="Write your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
            />
            <button 
              onClick={handleSend} 
              disabled={!input.trim()}
              className="p-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-500/20"
            >
              <Send className="w-5 h-5 text-white" />
            </button>
          </div>
        )}
      </div>

      <StartNewChatModal 
        open={showNewChat} 
        onClose={() => setShowNewChat(false)} 
        onSelectParent={handleSelectParent} 
      />
    </div>
  );
}
