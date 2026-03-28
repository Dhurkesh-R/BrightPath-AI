import React, { useState, useEffect } from "react";
import { Users, Trash2, Search, ShieldCheck, GraduationCap, UserCircle } from "lucide-react";
import { getThemeClasses, useTheme } from "../contexts/ThemeContext";
import { fetchUsers, deleteUser } from "../services/api"

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const { theme } = useTheme();
  const { bg, text, border, inputBg, textSecondary } = getThemeClasses(theme);

  useEffect(() => {
    const getUsers = async () => {
      try {
        const data = await fetchUsers()
        setUsers(data)
      } catch (err) {
      console.error("Failed to fetch users", err);
      };
    }

    getUsers();
  }, []);

  const handleDelete = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to permanentely delete ${userName}?`)) return;

    try {
        const data = await deleteUser(userId)
        setUsers(data)
      } catch (err) {
      console.error("Delete error", err);
    }
  };

  const displayedUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = activeFilter === "all" || u.role === activeFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className={`p-6 min-h-screen ${bg} ${text} md:ml-16`}>
      <header className="mb-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <ShieldCheck className="text-red-500" size={32} /> Admin Control
          </h1>
          <p className={textSecondary}>Institutional Oversight & User Management</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Role Filter Tabs */}
          <div className={`flex p-1 rounded-xl border ${border} ${inputBg}`}>
            {['all', 'teacher', 'student', 'parent'].map((role) => (
              <button
                key={role}
                onClick={() => setActiveFilter(role)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${
                  activeFilter === role 
                    ? 'bg-blue-600 text-white shadow-lg' 
                    : 'opacity-50 hover:opacity-100'
                }`}
              >
                {role}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative flex-grow md:flex-grow-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50" size={18} />
            <input 
              type="text"
              placeholder="Search by name/email..."
              className={`pl-10 pr-4 py-2 w-full md:w-64 rounded-xl border ${border} ${inputBg} outline-none focus:ring-2 focus:ring-blue-500`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </header>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-500" size={40} /></div>
      ) : (
        <div className={`overflow-x-auto rounded-2xl border ${border} shadow-xl bg-card`}>
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-500/5 text-sm uppercase tracking-wider">
              <tr>
                <th className="p-4 font-semibold">User Identity</th>
                <th className="p-4 font-semibold">Role</th>
                <th className="p-4 font-semibold">Details</th>
                <th className="p-4 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayedUsers.map((u) => (
                <tr key={u.id} className={`border-t ${border} hover:bg-gray-500/5 transition-colors`}>
                  <td className="p-4">
                    <div className="font-bold">{u.name}</div>
                    <div className={`text-xs ${textSecondary}`}>{u.email}</div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase ${
                      u.role === 'admin' ? 'bg-red-500/20 text-red-500' : 
                      u.role === 'teacher' ? 'bg-blue-500/20 text-blue-500' : 
                      'bg-green-500/20 text-green-500'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className={`p-4 text-sm ${textSecondary}`}>
                    {u.role === 'student' && <span className="flex items-center gap-1">Gr: {u.details?.grade} Sec: {u.details?.section}</span>}
                    {u.role === 'teacher' && <span>{u.details?.designation}</span>}
                  </td>
                  <td className="p-4 text-center">
                    <button 
                      onClick={() => handleDelete(u.id, u.name)}
                      className="p-2 hover:bg-red-500/10 rounded-lg text-red-500 transition-all group"
                      title="Delete User"
                    >
                      <Trash2 size={18} className="group-hover:scale-110" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {displayedUsers.length === 0 && (
            <div className="p-10 text-center opacity-50 italic">No users found matching your criteria.</div>
          )}
        </div>
      )}
    </div>
  );
}
