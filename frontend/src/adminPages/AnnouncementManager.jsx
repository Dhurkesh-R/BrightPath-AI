import React, { useState, useEffect } from 'react';
import { Megaphone, Send, Clock, Trash2, AlertCircle } from "lucide-react";
import { getThemeClasses, useTheme } from "../contexts/ThemeContext";

export default function AnnouncementManager() {
  const [announcements, setAnnouncements] = useState([]);
  const [newMsg, setNewMsg] = useState({ title: "", content: "", priority: "normal" });
  const { theme } = useTheme();
  const { bg, text, border, inputBg, textSecondary } = getThemeClasses(theme);

  return (
    <div className={`p-6 min-h-screen ${bg} ${text} md:ml-16`}>
      <header className="mb-10">
        <h1 className="text-4xl font-black uppercase tracking-tighter flex items-center gap-3">
          <Megaphone className="text-yellow-500" size={36} /> Broadcast Center
        </h1>
        <p className={`font-bold opacity-60 ${textSecondary}`}>Send updates to the School community</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* COMPOSER */}
        <div className={`lg:col-span-1 p-6 border-2 border-black dark:border-white ${inputBg} shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] h-fit`}>
          <h2 className="text-xl font-black uppercase mb-6 flex items-center gap-2">
            <Send size={20} /> Create Update
          </h2>
          
          <div className="space-y-4">
            <input 
              type="text" 
              placeholder="Headline..."
              className={`w-full p-3 border-2 border-black dark:border-white bg-transparent font-bold outline-none focus:bg-yellow-500/10`}
              value={newMsg.title}
              onChange={(e) => setNewMsg({...newMsg, title: e.target.value})}
            />
            <textarea 
              placeholder="What's happening?"
              rows="4"
              className={`w-full p-3 border-2 border-black dark:border-white bg-transparent font-medium outline-none focus:bg-yellow-500/10`}
              value={newMsg.content}
              onChange={(e) => setNewMsg({...newMsg, content: e.target.value})}
            />
            <select 
               className={`w-full p-3 border-2 border-black dark:border-white bg-transparent font-bold`}
               value={newMsg.priority}
               onChange={(e) => setNewMsg({...newMsg, priority: e.target.value})}
            >
              <option value="normal">Normal Priority</option>
              <option value="high">High Priority</option>
              <option value="urgent">Urgent / Emergency</option>
            </select>
            <button className="w-full py-4 bg-black dark:bg-white text-white dark:text-black font-black uppercase tracking-widest hover:invert transition-all">
              Broadcast Now
            </button>
          </div>
        </div>

        {/* FEED */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xs font-black uppercase tracking-[0.3em] opacity-40 mb-4">Past Broadcasts</h2>
          
          {announcements.length === 0 ? (
            <div className={`p-10 border-2 border-dashed ${border} rounded-3xl text-center italic opacity-30`}>
              No announcements sent yet.
            </div>
          ) : (
            announcements.map((msg) => (
              <div key={msg.id} className={`p-6 border-2 border-black dark:border-white ${inputBg} relative overflow-hidden`}>
                {msg.priority === 'urgent' && (
                  <div className="absolute top-0 right-0 bg-red-600 text-white px-3 py-1 text-[10px] font-black uppercase">
                    Urgent
                  </div>
                )}
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-2xl font-black">{msg.title}</h3>
                  <button className="text-red-500 opacity-20 hover:opacity-100 transition-opacity">
                    <Trash2 size={18} />
                  </button>
                </div>
                <p className="text-sm leading-relaxed mb-4 opacity-80">{msg.content}</p>
                <div className="flex items-center gap-4 text-[10px] font-black uppercase opacity-40">
                  <span className="flex items-center gap-1"><Clock size={12} /> 2 hours ago</span>
                  <span>Target: Students</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
