import React, { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";
import { chatBot, sendChatData } from "../services/api";
import { useTheme, getThemeClasses } from "../contexts/ThemeContext";

const Chatbot = () => {
  const { theme } = useTheme();
  const [messages, setMessages] = useState(() => {
    // ✅ Load saved messages from localStorage
    const saved = localStorage.getItem("chat_messages");
    return saved ? JSON.parse(saved) : [];
  });
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const { bg, text, border, bgSecondary, barBg, textThird, textFourth } =
    getThemeClasses(theme);

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
  if (messages.length > 1) {
    persistChat(messages);
  }
}, [messages]);

  // ✅ Save messages to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("chat_messages", JSON.stringify(messages));
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const storedProfile = JSON.parse(localStorage.getItem("studentProfile"));
    if (storedProfile && messages.length === 0) {
      const favSubject = storedProfile?.interest || null;
      const greetText = favSubject
        ? `👋 Hey there! I remember you love ${favSubject}. Ready to explore something fun in that area today?`
        : "👋 Hey there! Ready to learn and explore something new today?";
      setMessages([{ sender: "bot", text: greetText }]);
    }
  }, []);
  

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessage = { sender: "user", text: input.trim() };
    setMessages((prev) => [...prev, newMessage]);
    setInput("");
    setLoading(true);

    try {
      const data = await chatBot(input.trim());
      console.log(data)
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: data || "⚠️ No response from AI" },
      ]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "❌ Error: Unable to reach the server." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full ml-14">
      {/* Header */}
      <div
        className={`p-4 border-b ${border} text-2xl font-semibold ${bg} ${text}`}
      >
        🔆 BrightPath AI
      </div>

      {/* Chat messages */}
      <div className={`flex-1 overflow-y-auto p-4 space-y-4 ${bg}`}>
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="text-4xl mb-4">👋</div>
            <div className="text-2xl font-semibold text-gray-400 mb-2">
              Hello!
            </div>
            <div className="text-lg text-gray-500">
              How can I help you today?
            </div>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${
              msg.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                msg.sender === "user"
                  ? `bg-blue-600 text-white rounded-br-md`
                  : `${bgSecondary} ${textFourth} rounded-bl-md`
              }`}
            >
              <div className="whitespace-pre-wrap break-words">{msg.text}</div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div
              className={`${bgSecondary} ${textThird} px-4 py-3 rounded-2xl rounded-bl-md`}
            >
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
                <span className="text-sm">Typing...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className={`p-4 border-t ${border} ${bg}`}>
        <div className="flex items-center space-x-3">
          <input
            type="text"
            className={`flex-1 px-4 py-3 rounded-xl ${barBg} border border-gray-600 ${text} placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            disabled={loading}
          />
          <button
            className={`px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:${barBg} disabled:cursor-not-allowed text-white rounded-xl transition-colors duration-200 flex items-center justify-center`}
            onClick={sendMessage}
            disabled={loading || !input.trim()}
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
