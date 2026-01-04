import React, { useEffect, useState } from "react";
import { X, UserCircle, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme, getThemeClasses } from "../contexts/ThemeContext";
import { getParentsForTeacher } from "../services/api";

export default function StartNewChatModal({
  open,
  onClose,
  onSelectParent,
}) {
  const { theme } = useTheme();
  const {
    cardBg,
    border,
    text,
    textSecondary,
    primary,
  } = getThemeClasses(theme);

  const [parents, setParents] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;

    async function loadParents() {
      try {
        setLoading(true);
        const data = await getParentsForTeacher();
        setParents(data);
      } catch (err) {
        console.error("Failed to load parents", err);
      } finally {
        setLoading(false);
      }
    }

    loadParents();
  }, [open]);

  const filteredParents = parents.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.email.toLowerCase().includes(search.toLowerCase())
  );

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className={`w-full max-w-md rounded-2xl shadow-xl ${cardBg} border ${border}`}
        >
          {/* Header */}
          <div className={`flex items-center justify-between p-4 border-b ${border}`}>
            <h2 className="text-lg font-semibold">Start New Chat</h2>
            <button onClick={onClose}>
              <X className="w-5 h-5 text-gray-400 hover:text-white" />
            </button>
          </div>

          {/* Search */}
          <div className="p-4 border-b border-gray-700">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search parents..."
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-gray-700 text-white focus:outline-none"
              />
            </div>
          </div>

          {/* List */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <p className={`p-4 ${textSecondary}`}>Loading parents…</p>
            ) : filteredParents.length === 0 ? (
              <p className={`p-4 ${textSecondary}`}>
                No parents found
              </p>
            ) : (
              filteredParents.map((parent) => (
                <button
                  key={parent.userId}
                  onClick={() => {
                    onSelectParent(parent);
                    onClose();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-700/40 transition"
                >
                  <UserCircle className="w-10 h-10 text-gray-400" />
                  <div className="text-left">
                    <p className="font-semibold">{parent.name}</p>
                    <p className={`text-sm ${textSecondary}`}>
                      Parent of {parent.childName}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
