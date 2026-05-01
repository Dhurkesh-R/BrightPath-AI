import React, { useState, useEffect } from 'react';
import { Bell, Clock, Info, AlertTriangle, ShieldAlert } from "lucide-react";
import { fetchPublicAnnouncements } from "../services/api"; // Same API helper

const PriorityBadge = ({ level }) => {
  const styles = {
    urgent: "bg-red-600 text-white animate-pulse",
    high: "bg-orange-500 text-white",
    normal: "bg-blue-600 text-white"
  };
  const icons = {
    urgent: <ShieldAlert size={12} />,
    high: <AlertTriangle size={12} />,
    normal: <Info size={12} />
  };

  return (
    <div className={`flex items-center gap-1 px-2 py-1 text-[10px] font-black uppercase tracking-tighter ${styles[level]}`}>
      {icons[level]} {level}
    </div>
  );
};

export default function Announcements() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchPublicAnnouncements(); // Now filtered by backend
        setNews(data);
      } catch (err) {
        console.error("News fetch error", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto min-h-screen">
      <header className="mb-10 border-b-4 border-black pb-4 flex justify-between items-end">
        <div>
          <h1 className="text-5xl font-black italic uppercase tracking-tighter">The Bulletin</h1>
          <p className="font-bold opacity-50 uppercase text-xs tracking-widest">BrightPathAI // Official Updates</p>
        </div>
        <Bell className="opacity-20" size={40} />
      </header>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-32 bg-gray-100 dark:bg-white/5 animate-pulse" />)}
        </div>
      ) : (
        <div className="space-y-8">
          {news.map((item) => (
            <article 
              key={item.id} 
              className="group relative border-2 border-black dark:border-white p-6 transition-all hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.1)]"
            >
              <div className="flex justify-between items-start mb-4">
                <PriorityBadge level={item.priority} />
                <div className="flex items-center gap-2 text-[10px] font-bold opacity-40 uppercase">
                  <Clock size={12} /> {new Date(item.created_at).toLocaleDateString()}
                </div>
              </div>

              <h2 className="text-3xl font-black mb-3 group-hover:text-blue-600 transition-colors uppercase leading-none">
                {item.title}
              </h2>
              
              <p className="text-lg font-medium leading-relaxed opacity-80 mb-6">
                {item.content}
              </p>

              <div className="flex items-center gap-2 pt-4 border-t border-black/10 dark:border-white/10">
                <div className="w-6 h-6 bg-black dark:bg-white rounded-full" />
                <span className="text-[10px] font-black uppercase tracking-widest">
                  Issued by: {item.author}
                </span>
              </div>
            </article>
          ))}
          
          {news.length === 0 && (
            <div className="py-20 text-center font-bold opacity-30 italic">
              All quiet on the school front. Check back later!
            </div>
          )}
        </div>
      )}
    </div>
  );
}
