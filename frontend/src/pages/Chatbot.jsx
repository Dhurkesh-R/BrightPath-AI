import React, { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";
import { chatBot, sendChatData } from "../services/api";
import { useTheme, getThemeClasses } from "../contexts/ThemeContext";

const Chatbot = () => {
  const { theme } = useTheme();
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem("chat_messages");
    return saved ? JSON.parse(saved) : [];
  });
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const { bg, text, border, bgSecondary, barBg, textThird, textFourth } = getThemeClasses(theme);

  // Sync with Backend
  const persistChat = async (chatHistory) => {
    try {
      await sendChatData(
        chatHistory.map(m => ({
          user_message: m.sender === "user" ? m.text : null,
          bot_response: m.sender === "bot" ? m.text : null
        }))
      );
    } catch (err) {
      console.error("Chat sync failed:", err);
    }
  };

  useEffect(() => {
    if (messages.length > 1) persistChat(messages);
  }, [messages]);

  useEffect(() => {
    localStorage.setItem("chat_messages", JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    const storedProfile = JSON.parse(localStorage.getItem("studentProfile"));
    if (storedProfile && messages.length === 0) {
      const favSubject = storedProfile?.interest || null;
      const greetText = favSubject
        ? `👋 Hey there! I remember you love ${favSubject}. Ready to explore something fun today?`
        : "👋 Hey there! Ready to learn and explore something new today?";
      setMessages([{ sender: "bot", text: greetText }]);
    }
  }, []);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userText = input.trim();
    setMessages((prev) => [...prev, { sender: "user", text: userText }]);
    setInput("");
    setLoading(true);

    try {
      const data = await chatBot(userText);
      setMessages((prev) => [...prev, { sender: "bot", text: data || "⚠️ No response from AI" }]);
    } catch (error) {
      setMessages((prev) => [...prev, { sender: "bot", text: "❌ Error: Unable to reach server." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    // FIX 1: Responsive margin-left (ml-0 for mobile, ml-14 for desktop)
    // FIX 2: Fixed height for mobile viewport (h-[calc(100dvh)] handles mobile address bars better)

    <div className={`flex-1 flex flex-col h-screen md:h-full md:ml-64 ${bg} transition-all duration-300`}>
      
      {/* Header - Scaled text for smaller screens */}
      <div className={`p-4 border-b ${border} text-xl md:text-2xl font-semibold sticky top-0 z-10 ${bg} ${text} flex items-center`}>
        <div className="w-12 h-10 md:hidden" />
        🔆 BrightPath AI
      </div>

      {/* Chat messages Area */}
      <div className="flex-1 overflow-y-auto p-3 md:p-6 space-y-4 custom-scrollbar">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="text-4xl mb-4 animate-bounce">👋</div>
            <div className="text-xl md:text-2xl font-semibold text-gray-400">Hello!</div>
            <div className="text-sm md:text-lg text-gray-500">How can I help you today?</div>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
            {/* FIX 3: Dynamic width (85% on mobile, max-md on desktop) */}
            <div className={`max-w-[85%] md:max-w-md px-4 py-3 rounded-2xl shadow-sm ${
              msg.sender === "user"
                ? `bg-blue-600 text-white rounded-tr-none`
                : `${bgSecondary} ${textFourth} rounded-tl-none`
            }`}>
              <div className="text-sm md:text-base whitespace-pre-wrap break-words leading-relaxed">
                {msg.text}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className={`${bgSecondary} ${textThird} px-4 py-3 rounded-2xl rounded-tl-none`}>
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area - Floating bar feel on mobile */}
      <div className={`p-3 md:p-4 border-t ${border} ${bg} pb-safe`}>
        <div className="max-w-4xl mx-auto flex items-center space-x-2 md:space-x-3">
          <input
            type="text"
            className={`flex-1 px-4 py-2.5 md:py-3 text-sm md:text-base rounded-xl ${barBg} border ${border} ${text} focus:ring-2 focus:ring-blue-500 outline-none transition-all`}
            placeholder="Ask me anything..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            disabled={loading}
          />
          <button
            className="p-2.5 md:p-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center"
            onClick={sendMessage}
            disabled={loading || !input.trim()}
          >
            <Send size={18} className="md:w-5 md:h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
