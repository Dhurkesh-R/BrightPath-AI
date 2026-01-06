import React, { useEffect, useState, useRef } from "react";
import { Send, UserCircle, Plus, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useTheme, getThemeClasses } from "../contexts/ThemeContext";
import {
  getMessages,
  getMessageThread,
  sendMessage,
} from "../services/api";
import StartNewChatModal from "../components/StartNewChatP";
import { getSocket } from "../services/socket";

export default function ParentMessages() {
  const { theme } = useTheme();
  const { bg, text, border, bgCard, textSecondary } =
    getThemeClasses(theme);

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

  /* ---------------- Socket Listener (ONCE) ---------------- */
  useEffect(() => {
    const socket = getSocket();
    setSocket(socket)

    const handleIncoming = (message) => {
      if (!activeUser) return;

      const currentUserId = user.id; // logged-in user

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
  }, [activeUser]);

    useEffect(() => {
      if (!activeUser || !socket) return;

      socket.emit("join_conversation", {
        otherUserId: activeUser.userId,
        auth: localStorage.getItem("token")
      });

    }, [activeUser]);
  /* ---------------- Load Conversations ---------------- */
  useEffect(() => {
    async function loadConversations() {
      try {
        setLoading(true)
        const data = await getMessages();
        setConversations(data);
      } catch (err) {
        console.error("Failed to load conversations", err);
      } finally {
        setLoading(false)
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
      await sendMessage(activeUser.userId, input);
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

  if (loading) {
      return (
          <div className={`flex items-center justify-center h-screen ${bg} ${textSecondary} w-full`}>
              <Loader2 className="animate-spin mr-2 w-6 h-6 text-blue-500" /> 
              <span className="text-lg">Loading conversations...</span>
          </div>
      );
  }

  return (
    <div className={`flex h-screen ${bg} ${text} ml-14 w-full`}>

      {/* LEFT SIDEBAR */}
      <div className={`w-80 border-r ${border} ${bgCard} overflow-y-auto`}>
        <div className="flex items-center justify-between p-4 text-xl font-bold border-b">
          Messages
          <button
            onClick={() => setShowNewChat(true)}
            className="text-blue-500 hover:text-blue-400"
          >
            <Plus />
          </button>
        </div>

        {conversations.length === 0 ? (
          <p className={`p-4 ${textSecondary}`}>No conversations yet</p>
        ) : (
          conversations.map((c) => (
            <button
              key={c.userId}
              onClick={() => setActiveUser(c)}
              className={`w-full flex items-center gap-3 px-4 py-3 transition
                hover:bg-gray-700/20
                ${activeUser?.userId === c.userId ? "bg-gray-700/30" : ""}
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

      {/* CHAT WINDOW */}
      <div className="flex-1 flex flex-col">
        <div className={`p-4 border-b ${border}`}>
          {activeUser ? (
            <p className="font-semibold">{activeUser.name}</p>
          ) : (
            <p className={textSecondary}>Select a conversation</p>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          {loading ? (
            // Modern Skeleton Loader
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
                  <div className="w-48 h-12 bg-gray-200 animate-pulse rounded-2xl" />
                </div>
              ))}
            </div>
          ) : (
            messages.map((m, idx) => {
              const isMe = m.senderId === user.id;
        
              return (
                <motion.div
                  key={m.id || idx}
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  className={`flex items-end gap-2 ${isMe ? "flex-row-reverse" : "flex-row"}`}
                >
                  <div
                    className={`relative max-w-[80%] md:max-w-[70%] px-4 py-2.5 shadow-sm
                      ${isMe
                        ? "bg-blue-600 text-white rounded-2xl rounded-tr-none"
                        : "bg-white text-slate-800 border border-slate-100 rounded-2xl rounded-tl-none"
                      }
                    `}
                  >
                    <p className="text-sm leading-relaxed">{m.content}</p>
                    
                    <div className={`flex items-center gap-1 mt-1 opacity-70 ${isMe ? "justify-end" : "justify-start"}`}>
                       <span className="text-[10px] font-medium uppercase tracking-wider">
                        {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {isMe && <span className="text-[10px]">✓✓</span>}
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {activeUser && (
          <div className={`p-4 border-t ${border} flex gap-3`}>
            <input
              className="flex-1 rounded-xl px-4 py-2 bg-gray-700 text-white"
              placeholder="Type a message…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
            />
            <button
              onClick={handleSend}
              className="px-4 rounded-xl bg-blue-600 hover:bg-blue-500"
            >
              <Send className="w-5 h-5 text-white" />
            </button>
          </div>
        )}
      </div>

      <StartNewChatModal
        open={showNewChat}
        onClose={() => setShowNewChat(false)}
        onSelectTeacher={handleSelectTeacher}
      />
    </div>
  );
}
