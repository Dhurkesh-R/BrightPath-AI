import React, { useState, useEffect } from "react";
import { Users, Trash2, Search, ShieldCheck, GraduationCap, UserCircle, Edit3 } from "lucide-react";
import { getThemeClasses, useTheme } from "../contexts/ThemeContext";
import { fetchUsers, deleteUser, updateStudentGrade } from "../services/api"

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const { theme } = useTheme();
  const { bg, text, border, inputBg, textSecondary } = getThemeClasses(theme);
  const [editingUser, setEditingUser] = useState(null); // Track who we are editing
  const [editData, setEditData] = useState({ grade: "", section: "" });

  const handleEditClick = (user) => {
    setEditingUser(user);
    setEditData({ 
      grade: user.details?.grade || "", 
      section: user.details?.section || "" 
    });
  };

  const handleSaveUpdate = async () => {
    try {
      const data = await updateStudentGrade(editingUser.id, editData.grade, editData.section);
      setUsers(data); // Refresh list
      setEditingUser(null); // Close modal
    } catch (err) {
      console.error("Update failed", err);
    }
  };

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

  const handleUpdateGrade = async (userId) => {

    try {
        const data = await updateStudentGrade(userId)
        setUsers(data)
      } catch (err) {
      console.error("update error", err);
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

        {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className={`${bg} p-6 rounded-2xl border ${border} w-80 shadow-2xl`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold">Promote Student</h3>
              <button onClick={() => setEditingUser(null)}><X size={18}/></button>
            </div>
            <p className="text-xs mb-4 opacity-70">Updating: {editingUser.name}</p>
            
            <div className="space-y-4">
              <div>
                <label className="text-[10px] uppercase font-bold opacity-50">Grade</label>
                <input 
                  className={`w-full p-2 rounded-lg border ${border} ${inputBg}`}
                  value={editData.grade}
                  onChange={(e) => setEditData({...editData, grade: e.target.value})}
                />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold opacity-50">Section</label>
                <input 
                  className={`w-full p-2 rounded-lg border ${border} ${inputBg}`}
                  value={editData.section}
                  onChange={(e) => setEditData({...editData, section: e.target.value})}
                />
              </div>
              <button 
                onClick={handleSaveUpdate}
                className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all"
              >
                <Check size={18}/> Update Info
              </button>
            </div>
          </div>
        </div>
      )}

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
                      u.role === 'parent' ? 'bg-yellow-500/20 text-yellow-500' :
                      'bg-green-500/20 text-green-500'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className={`p-4 text-sm ${textSecondary}`}>
                    {u.role === 'student' && <span className="flex items-center gap-1">Gr: {u.details?.grade} Sec: {u.details?.section}</span>}
                    {u.role === 'teacher' && <span>{u.details?.designation}</span>}
                    {u.role === 'admin' && <span>{u.details?.designation}</span>}
                  </td>
                  <td className="p-4 text-center flex justify-center gap-2">
                    {u.role === 'student' && (
                      <button 
                        onClick={() => handleEditClick(u)}
                        className="p-2 hover:bg-blue-500/10 rounded-lg text-blue-500 transition-all group"
                        title="Edit Grade/Section"
                      >
                        <Edit3 size={18} className="group-hover:scale-110" />
                      </button>
                    )}
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
