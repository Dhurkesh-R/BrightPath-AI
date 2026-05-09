import React, { useState, useEffect } from 'react';
import { Megaphone, Send, Clock, Trash2, Loader2, Edit3, XCircle } from "lucide-react";
import { getThemeClasses, useTheme } from "../contexts/ThemeContext";
import { fetchAnnouncements, createAnnouncement, deleteAnnouncement, updateAnnouncement } from "../services/api";

export default function AnnouncementManager() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null); // Track if we are editing
  const [newMsg, setNewMsg] = useState({ title: "", content: "", priority: "normal", target_role: "all" });
  
  const { theme } = useTheme();
  const { bg, text, border, inputBg, textSecondary } = getThemeClasses(theme);

  const loadAnnouncements = async () => {
    try {
      const data = await fetchAnnouncements();
      setAnnouncements(data);
    } catch (err) { console.error(err); } 
    finally { setLoading(false); }
  };

  useEffect(() => { loadAnnouncements(); }, []);

  const handleBroadcast = async (e) => {
    e.preventDefault();
    if (!newMsg.title || !newMsg.content) return alert("Fill all fields, bro!");
    
    setSubmitting(true);
    try {
      if (editingId) {
        await updateAnnouncement(editingId, newMsg);
      } else {
        await createAnnouncement(newMsg);
      }
      resetForm();
      await loadAnnouncements();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this broadcast forever?")) return;
    try {
      await deleteAnnouncement(id);
      setAnnouncements(announcements.filter(a => a.id !== id));
    } catch (err) { alert("Failed to delete"); }
  };

  const startEdit = (msg) => {
    setEditingId(msg.id);
    setNewMsg({
      title: msg.title,
      content: msg.content,
      priority: msg.priority,
      target_role: msg.target_role
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setEditingId(null);
    setNewMsg({ title: "", content: "", priority: "normal", target_role: "all" });
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
        <form onSubmit={handleBroadcast} className={`lg:col-span-1 p-6 border-2 border-black dark:border-white ${editingId ? 'bg-yellow-500/10' : inputBg} shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] h-fit sticky top-6`}>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-black uppercase flex items-center gap-2">
              {editingId ? <Edit3 size={20} /> : <Send size={20} />} 
              {editingId ? "Edit Update" : "Create Update"}
            </h2>
            {editingId && (
              <button onClick={resetForm} className="text-red-500 hover:scale-110 transition">
                <XCircle size={20} />
              </button>
            )}
          </div>
          
          <div className="space-y-4">
            <input 
              className="w-full p-3 border-2 border-black dark:border-white bg-transparent font-bold outline-none focus:bg-yellow-500/20"
              placeholder="Headline..."
              value={newMsg.title}
              onChange={(e) => setNewMsg({...newMsg, title: e.target.value})}
            />
            <textarea 
              className="w-full p-3 border-2 border-black dark:border-white bg-transparent font-medium outline-none focus:bg-yellow-500/20"
              placeholder="What's happening?"
              rows="4"
              value={newMsg.content}
              onChange={(e) => setNewMsg({...newMsg, content: e.target.value})}
            />
            <div className="grid grid-cols-2 gap-2">
                <select 
                   className="p-3 border-2 border-black dark:border-white bg-transparent font-bold text-xs"
                   value={newMsg.priority}
                   onChange={(e) => setNewMsg({...newMsg, priority: e.target.value})}
                >
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
                <select 
                   className="p-3 border-2 border-black dark:border-white bg-transparent font-bold text-xs"
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
              className={`w-full py-4 ${editingId ? 'bg-yellow-500 text-black' : 'bg-black dark:bg-white text-white dark:text-black'} font-black uppercase tracking-widest hover:invert transition-all flex items-center justify-center gap-2`}
            >
              {submitting ? <Loader2 className="animate-spin" /> : editingId ? "Update Post" : "Broadcast Now"}
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
          ) : (
            announcements.map((msg) => (
              <div key={msg.id} className={`p-6 border-2 border-black dark:border-white ${inputBg} relative hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all group`}>
                <div className="flex justify-between items-start mb-2">
                  <div className="flex flex-col gap-1">
                    {msg.priority === 'urgent' && (
                      <span className="w-fit bg-red-600 text-white px-2 py-0.5 text-[8px] font-black uppercase animate-pulse">Urgent</span>
                    )}
                    <h3 className="text-2xl font-black uppercase tracking-tighter">{msg.title}</h3>
                  </div>
                  
                  {/* Actions Container */}
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => startEdit(msg)} className="p-2 bg-blue-500 text-white hover:invert"><Edit3 size={14}/></button>
                    <button onClick={() => handleDelete(msg.id)} className="p-2 bg-red-600 text-white hover:invert"><Trash2 size={14}/></button>
                  </div>
                </div>

                <p className="text-sm leading-relaxed mb-4 opacity-80 font-medium">{msg.content}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-[10px] font-black uppercase opacity-40">
                    <span className="flex items-center gap-1"><Clock size={12} /> {new Date(msg.created_at).toLocaleDateString()}</span>
                    <span>By {msg.author}</span>
                  </div>
                  <span className="text-[10px] border border-black dark:border-white px-2 py-1 font-bold uppercase">{msg.target_role}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
