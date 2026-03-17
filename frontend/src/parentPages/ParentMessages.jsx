import React, { useEffect, useState, useRef } from "react";
import { Send, UserCircle, Plus, Loader2, ChevronLeft } from "lucide-react";
import { motion } from "framer-motion";
import { useTheme, getThemeClasses } from "../contexts/ThemeContext";
import {
  getMessages,
  getMessageThread,
  sendMessage,
} from "../services/api";
import StartNewChatModal from "../components/StartNewChatP";
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

export default function ParentMessages() {
  const { theme } = useTheme();
  const { bg, text, border, cardBg , textSecondary } = getThemeClasses(theme);

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
    const socket = getSocket();
    setSocket(socket);

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

    socket.on("new_message", handleIncoming);
    return () => {
      socket.off("new_message", handleIncoming);
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

  /* ---------------- Select Teacher ---------------- */
  const handleSelectTeacher = (teacher) => {
    setActiveUser({
      userId: teacher.userId,
      name: teacher.name,
    });
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
    <div className={`flex h-screen ${bg} ${text} md:ml-16 flex-1 min-w-0 overflow-hidden transition-all duration-300`}>
      
      {/* LEFT SIDEBAR - Responsive Toggle */}
      <div className={`${activeUser ? 'hidden md:flex' : 'flex'} w-full md:w-80 flex-col border-r ${border} ${bgCard} flex-shrink-0`}>
        <div className="flex items-center p-4 border-b h-[73px]">
           <div className="w-12 md:hidden" /> {/* Hamburger Spacer */}
           <h1 className="text-xl font-bold flex-1">Messages</h1>
           <button onClick={() => setShowNewChat(true)} className="p-2 text-blue-500">
            <Plus size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <p className={`p-4 ${textSecondary}`}>No conversations yet</p>
          ) : (
            conversations.map((c) => (
              <button
                key={c.userId}
                onClick={() => setActiveUser(c)}
                className={`w-full flex items-center gap-3 px-4 py-3 border-b ${border}
                  ${activeUser?.userId === c.userId ? "bg-blue-600/10" : "hover:bg-gray-700/20"}
                `}
              >
                <UserCircle className="w-10 h-10 text-gray-400" />
                <div className="text-left">
                  <p className="font-semibold">{c.name}</p>
                  <p className={`text-sm ${textSecondary}`}>Teacher</p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* CHAT WINDOW */}
      <div className={`${!activeUser ? 'hidden md:flex' : 'flex'} flex-1 flex-col h-full min-w-0`}>
        <div className={`p-4 border-b ${border} flex items-center h-[73px]`}>
          <div className="w-12 h-10 md:hidden" />
          <button onClick={() => setActiveUser(null)} className="md:hidden mr-3">
            <ChevronLeft size={24} />
          </button>
          {activeUser ? (
            <p className="font-semibold">{activeUser.name}</p>
          ) : (
            <div className="flex items-center">
                <div className="w-12 md:hidden" />
                <p className={textSecondary}>Select a conversation</p>
            </div>
          )}
        </div>

        {/* MESSAGES */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          {messages.map((m, idx) => {
            const isMe = m.senderId === user.id;
            const currentDate = new Date(m.createdAt).toDateString();
            const previousDate = idx > 0 ? new Date(messages[idx - 1].createdAt).toDateString() : null;
            const showDateHeader = currentDate !== previousDate;

            return (
              <React.Fragment key={m.id || idx}>
                {showDateHeader && (
                  <div className="flex justify-center my-4">
                    <span className={`text-xs font-bold px-3 py-1 rounded-lg uppercase tracking-wider ${bgCard} ${textSecondary} border ${border}`}>
                      {formatStickyDate(m.createdAt)}
                    </span>
                  </div>
                )}
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  className={`flex items-end gap-2 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                  <div className={`relative max-w-[80%] md:max-w-[70%] px-4 py-2.5 shadow-sm
                    ${isMe ? "bg-blue-600 text-white rounded-2xl rounded-tr-none" : `${bgCard} ${textSecondary} border border-slate-700 rounded-2xl rounded-tl-none`}`}>
                    <p className="text-sm leading-relaxed">{m.content}</p>
                    <div className={`flex items-center gap-1 mt-1 opacity-70 ${isMe ? "justify-end" : "justify-start"}`}>
                      <span className="text-[10px] uppercase tracking-wider">
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

        {/* INPUT */}
        {activeUser && (
          <div className={`p-4 border-t ${border} flex gap-3`}>
            <input
              className={`flex-1 rounded-xl px-4 py-2 ${cardBg} ${text} outline-none border focus:border-blue-500`}
              placeholder="Type a message…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
            />
            <button onClick={handleSend} className="px-4 rounded-xl bg-blue-600 hover:bg-blue-500 transition-colors">
              <Send className="w-5 h-5 text-white" />
            </button>
          </div>
        )}
      </div>

      <StartNewChatModal open={showNewChat} onClose={() => setShowNewChat(false)} onSelectTeacher={handleSelectTeacher} />
    </div>
  );
}
