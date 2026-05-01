import React, { useState, useEffect } from 'react';
import { Megaphone, Send, Clock, Trash2, Loader2 } from "lucide-react";
import { getThemeClasses, useTheme } from "../contexts/ThemeContext";
import { fetchAnnouncements, createAnnouncement } from "../services/api";

export default function AnnouncementManager() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newMsg, setNewMsg] = useState({ title: "", content: "", priority: "normal", target_role: "all" });
  
  const { theme } = useTheme();
  const { bg, text, border, inputBg, textSecondary } = getThemeClasses(theme);

  // Load Feed
  const loadAnnouncements = async () => {
    try {
      const data = await fetchAnnouncements();
      setAnnouncements(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnnouncements();
  }, []);

  // Submit Broadcast
  const handleBroadcast = async (e) => {
    e.preventDefault();
    if (!newMsg.title || !newMsg.content) return alert("Fill all fields, bro!");
    
    setSubmitting(true);
    try {
      await createAnnouncement(newMsg);
      setNewMsg({ title: "", content: "", priority: "normal", target_role: "all" }); // Reset form
      await loadAnnouncements(); // Refresh list
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={`p-6 min-h-screen ${bg} ${text} md:ml-16`}>
      <header className="mb-10">
        <h1 className="text-4xl font-black uppercase tracking-tighter flex items-center gap-3">
          <Megaphone className="text-yellow-500" size={36} /> Broadcast Center
        </h1>
        <p className={`font-bold opacity-60 ${textSecondary}`}>Inform the BrightPathAI community</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* COMPOSER */}
        <form onSubmit={handleBroadcast} className={`lg:col-span-1 p-6 border-2 border-black dark:border-white ${inputBg} shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] h-fit`}>
          <h2 className="text-xl font-black uppercase mb-6 flex items-center gap-2">
            <Send size={20} /> Create Update
          </h2>
          
          <div className="space-y-4">
            <input 
              className={`w-full p-3 border-2 border-black dark:border-white bg-transparent font-bold outline-none focus:bg-yellow-500/10`}
              placeholder="Headline..."
              value={newMsg.title}
              onChange={(e) => setNewMsg({...newMsg, title: e.target.value})}
            />
            <textarea 
              className={`w-full p-3 border-2 border-black dark:border-white bg-transparent font-medium outline-none focus:bg-yellow-500/10`}
              placeholder="What's happening?"
              rows="4"
              value={newMsg.content}
              onChange={(e) => setNewMsg({...newMsg, content: e.target.value})}
            />
            <div className="grid grid-cols-2 gap-2">
                <select 
                   className={`p-3 border-2 border-black dark:border-white bg-transparent font-bold text-xs`}
                   value={newMsg.priority}
                   onChange={(e) => setNewMsg({...newMsg, priority: e.target.value})}
                >
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
                <select 
                   className={`p-3 border-2 border-black dark:border-white bg-transparent font-bold text-xs`}
                   value={newMsg.target_role}
                   onChange={(e) => setNewMsg({...newMsg, target_role: e.target.value})}
                >
                  <option value="all">Everyone</option>
                  <option value="student">Students</option>
                  <option value="teacher">Teachers</option>
                </select>
            </div>
            <button 
              type="submit"
              disabled={submitting}
              className="w-full py-4 bg-black dark:bg-white text-white dark:text-black font-black uppercase tracking-widest hover:invert transition-all flex items-center justify-center gap-2"
            >
              {submitting ? <Loader2 className="animate-spin" /> : "Broadcast Now"}
            </button>
          </div>
        </form>

        {/* FEED */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xs font-black uppercase tracking-[0.3em] opacity-40 mb-4">Live Stream</h2>
          
          {loading ? (
            <div className="animate-pulse space-y-4">
              {[1, 2, 3].map(i => <div key={i} className={`h-32 border-2 ${border} ${inputBg}`} />)}
            </div>
          ) : announcements.length === 0 ? (
            <div className={`p-10 border-2 border-dashed ${border} rounded-3xl text-center italic opacity-30`}>
              The airwaves are silent, bro.
            </div>
          ) : (
            announcements.map((msg) => (
              <div key={msg.id} className={`p-6 border-2 border-black dark:border-white ${inputBg} relative hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all`}>
                {msg.priority === 'urgent' && (
                  <div className="absolute top-0 right-0 bg-red-600 text-white px-3 py-1 text-[10px] font-black uppercase animate-pulse">
                    Urgent
                  </div>
                )}
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-2xl font-black uppercase tracking-tighter">{msg.title}</h3>
                  <span className="text-[10px] bg-black/5 px-2 py-1 font-bold">{msg.target_role}</span>
                </div>
                <p className="text-sm leading-relaxed mb-4 opacity-80 font-medium">{msg.content}</p>
                <div className="flex items-center gap-4 text-[10px] font-black uppercase opacity-40">
                  <span className="flex items-center gap-1"><Clock size={12} /> {new Date(msg.created_at).toLocaleDateString()}</span>
                  <span>By {msg.author}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
