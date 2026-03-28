import React, { useState, useEffect } from "react";
import { Users, Trash2, Search, ShieldCheck, GraduationCap, UserCircle } from "lucide-react";
import { getThemeClasses, useTheme } from "../contexts/ThemeContext";
import { fetchUsers } from "../services/api"

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const { theme } = useTheme();
  const { bg, text, border, inputBg, textSecondary } = getThemeClasses(theme);

  useEffect(() => {
    const getUsers = async () => {
      try {
        data = await fetchUsers()
        setUsers(data)
        console.log(data)
      } catch (err) {
      console.error("Failed to fetch users", err);
      };
    }
  }, []);

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={`p-6 min-h-screen ${bg} ${text} md:ml-16`}>
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <ShieldCheck className="text-red-500" size={32} /> Admin Control Center
          </h1>
          <p className={textSecondary}>Manage all institutional accounts and security</p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50" size={18} />
          <input 
            type="text"
            placeholder="Search users..."
            className={`pl-10 pr-4 py-2 rounded-xl border ${border} ${inputBg} outline-none focus:ring-2 focus:ring-red-500`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </header>

      <div className={`overflow-x-auto rounded-2xl border ${border} shadow-xl`}>
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-500/10">
            <tr>
              <th className="p-4 font-semibold">User</th>
              <th className="p-4 font-semibold">Role</th>
              <th className="p-4 font-semibold">Details</th>
              <th className="p-4 font-semibold">Joined</th>
              <th className="p-4 font-semibold text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((u) => (
              <tr key={u.id} className={`border-t ${border} hover:bg-gray-500/5 transition-colors`}>
                <td className="p-4">
                  <div className="font-bold">{u.name}</div>
                  <div className={`text-xs ${textSecondary}`}>{u.email}</div>
                </td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${
                    u.role === 'admin' ? 'bg-red-500/20 text-red-500' : 
                    u.role === 'teacher' ? 'bg-blue-500/20 text-blue-500' : 
                    'bg-green-500/20 text-green-500'
                  }`}>
                    {u.role}
                  </span>
                </td>
                <td className={`p-4 text-sm ${textSecondary}`}>
                  {u.role === 'student' && `${u.details?.grade}${u.details?.section}`}
                  {u.role === 'teacher' && u.details?.designation}
                  {u.role === 'admin' && u.details?.school}
                </td>
                <td className={`p-4 text-sm ${textSecondary}`}>{u.created_at}</td>
                <td className="p-4 text-center">
                  <button className="p-2 hover:bg-red-500/10 rounded-lg text-red-500 transition-all">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
