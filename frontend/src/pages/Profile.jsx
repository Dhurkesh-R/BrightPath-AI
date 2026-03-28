import { useEffect, useState, useRef } from "react";
import { Loader2, Edit3, Save, User, Activity, Heart, UserRound, Star, Upload, X } from "lucide-react";
import { getUserProfile, updateUserProfile } from '../services/api';
import { getThemeClasses, useTheme } from "../contexts/ThemeContext";

export default function Profile() {
    const { theme } = useTheme();
    const [user, setUser] = useState(null);
    const [editing, setEditing] = useState(false);
    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState(null);
    
    const getUserRole = () => {
        try {
            return JSON.parse(localStorage.getItem("user"))?.role || "student";
        } catch (e) { return "student"; }
    };
    const role = getUserRole();

    const { bg, text, cardBg, border } = getThemeClasses(theme);
    const fileInputRef = useRef(null);

    const showModalMessage = (msg) => {
        setMessage(msg);
        setTimeout(() => setMessage(null), 4000);
    };

    useEffect(() => {
        async function fetchProfile() {
            try {
                const res = await getUserProfile(); 
                setUser(res);
                setFormData(res);
            } catch (err) {
                setUser({});
                setFormData({});
            } finally {
                setLoading(false);
            }
        }
        fetchProfile();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 1024 * 1024) {
                showModalMessage("Image size exceeds 1MB limit.");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, profilePicUrl: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            const res = await updateUserProfile({ ...formData, lastUpdated: new Date().toISOString() });
            setUser(res);
            setFormData(res); 
            setEditing(false);
            showModalMessage("Profile updated!");
        } catch (err) {
            showModalMessage("Error saving profile.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className={`flex flex-col justify-center items-center h-screen w-full ${bg} ${text}`}>
            <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-4" />
            <p className="font-medium text-sm opacity-60">Loading profile details...</p>
        </div>
    );

    const defaultImageUrl = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMTIiIGhlaWdodD0iMTEyIiB2aWV3Qm94PSIwIDAgMTEyIDExMiI+PHJlY3Qgd2lkdGg9IjExMiIgaGVpZ2h0PSIxMTIiIHJ4PSI1NiIgZmlsbD0iIzM2YjVhMiIvPjx0ZXh0IHg9IjU2IiB5PSI2MCIgZm9udC1zaXplPSI2MCIgZm9udC1mYW1pbHk9ImludGVyLCBzYW5zLXNlcmlmIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjZmZmZmZmIj5QPC90ZXh0Pjwvc3ZnPg==";

    return (
        /* FIXED: Added 'flex' and 'overflow-x-hidden' to prevent the margin-left from pushing content out */
        <div className={`min-h-screen w-full ${bg} ${text} flex overflow-x-hidden transition-all duration-300`}>
            
            {/* Sidebar Spacer for Desktop */}
            <div className="hidden md:block w-16 flex-shrink-0" />

            <div className="flex-1 p-4 md:p-10 max-w-7xl mx-auto w-full">
                
                {/* Notification Toast */}
                {message && (
                    <div className="fixed top-5 left-4 right-4 md:left-auto md:right-8 z-50 animate-in fade-in slide-in-from-top-5">
                        <div className="flex items-center justify-between p-4 bg-blue-600 text-white rounded-2xl shadow-2xl border border-blue-400/30">
                            <span className="text-sm font-bold">{message}</span>
                            <button onClick={() => setMessage(null)} className="ml-4 p-1 rounded-full hover:bg-white/20">
                                <X size={18} />
                            </button>
                        </div>
                    </div>
                )}

                {/* Header Section */}
                <header className={`flex flex-col sm:flex-row items-center justify-between mb-8 gap-4 border-b ${border} pb-6`}>
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-500/10 rounded-2xl">
                            <UserRound className="w-8 h-8 text-blue-500" />
                        </div>
                        <h2 className="text-2xl md:text-3xl font-black">My Profile</h2>
                    </div>
                    
                    <div className="flex gap-2 w-full sm:w-auto">
                        {editing ? (
                            <>
                                <button onClick={() => setEditing(false)} className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-gray-500/10 hover:bg-gray-500/20 font-bold transition">
                                    Cancel
                                </button>
                                <button onClick={handleSave} disabled={saving} className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50">
                                    {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                    Save
                                </button>
                            </>
                        ) : (
                            <button onClick={() => setEditing(true)} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 text-white px-8 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-600/20">
                                <Edit3 size={18} /> Edit Profile
                            </button>
                        )}
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* Left Sidebar: Avatar & Bio */}
                    <div className="lg:col-span-4 flex flex-col gap-6">
                        <div className={`p-6 rounded-3xl ${cardBg} border ${border} flex flex-col items-center text-center shadow-sm`}>
                            <div className="relative group mb-4">
                                <img
                                    src={formData?.profilePicUrl || defaultImageUrl}
                                    alt="Profile"
                                    className="w-32 h-32 md:w-40 md:h-40 object-cover rounded-full border-4 border-blue-500/30 shadow-2xl"
                                    onError={(e) => e.currentTarget.src = defaultImageUrl}
                                />
                                {editing && (
                                    <button 
                                        onClick={() => fileInputRef.current.click()}
                                        className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                    >
                                        <Upload size={24} className="mb-1" />
                                        <span className="text-[10px] font-bold uppercase">Change</span>
                                    </button>
                                )}
                                <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="image/*" className="hidden" />
                            </div>

                            <h3 className="text-xl font-bold truncate w-full">{user?.name || "User"}</h3>
                            <p className="text-sm opacity-60 mb-4 truncate w-full">{user?.email}</p>
                            <span className="px-4 py-1 bg-blue-500/10 text-blue-500 text-xs font-black uppercase tracking-widest rounded-full">
                                {user?.role || "Student"}
                            </span>

                            <div className="w-full mt-8 text-left">
                                <label className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-2 block ml-1">Personal Bio</label>
                                <textarea
                                    name="bio"
                                    value={formData?.bio || ""}
                                    onChange={handleChange}
                                    disabled={!editing}
                                    rows={3}
                                    className={`w-full p-3 text-sm rounded-xl border ${editing ? 'border-blue-500/50 bg-blue-500/5' : 'border-transparent bg-gray-500/5'} resize-none outline-none transition-all`}
                                    placeholder="Tell us about yourself..."
                                />
                            </div>
                        </div>

                        {/* Badges */}
                        <div className={`p-6 rounded-3xl ${cardBg} border ${border} shadow-sm`}>
                            <h4 className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-4 flex items-center gap-2">
                                <Star size={14} className="text-yellow-500" /> Achievements
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {user?.badges?.length > 0 ? (
                                    user.badges.map((b, i) => (
                                        <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-gray-500/10 rounded-lg border border-gray-500/20">
                                            <span className="text-base">{b.icon}</span>
                                            <span className="text-xs font-bold">{b.name}</span>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-xs opacity-40 italic">No badges earned yet.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Content: Forms */}
                    <div className="lg:col-span-8 flex flex-col gap-6">
                        <div className={`p-6 md:p-8 rounded-3xl ${cardBg} border ${border} shadow-sm`}>
                            <h4 className="text-lg font-bold mb-6 flex items-center gap-2">
                                <User size={20} className="text-blue-500" />
                                General Information
                            </h4>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                {role === "student" ? (
                                    <>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                                            <InputField label="Age" name="age" value={formData?.age} onChange={handleChange} editable={editing} type="number" />
                                            <InputField label="Grade" name="grade" value={formData?.grade} onChange={handleChange} editable={editing} />
                                            <InputField label="Section" name="section" value={formData?.section} onChange={handleChange} editable={editing} />
                                        </div>
                                        <InputField label="School Name" name="school" value={formData?.school} onChange={handleChange} editable={editing} />
                                        <InputField label="Current City" name="city" value={formData?.city} onChange={handleChange} editable={editing} />
                                    </>
                                ) : (
                                    <>
                                        <InputField label="Department" name="department" value={formData?.department} onChange={handleChange} editable={editing} />
                                        <InputField label="Designation" name="designation" value={formData?.designation} onChange={handleChange} editable={editing} />
                                        <InputField label="Experience (Years)" name="experience_years" value={formData?.experience_years} onChange={handleChange} editable={editing} type="number" />
                                        <InputField label="City" name="city" value={formData?.city} onChange={handleChange} editable={editing} />
                                    </>
                                )}
                            </div>

                            <div className="mt-8">
                                <h4 className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-4 flex items-center gap-2">
                                    <Activity size={14} className="text-green-500" /> 
                                    {role === "student" ? "Interests & Skills" : "Handling Classes"}
                                </h4>
                                <textarea
                                    name={role === "student" ? "interests" : "handling_classes"}
                                    value={(role === "student" ? formData?.interests : formData?.handling_classes) || ""}
                                    onChange={handleChange}
                                    disabled={!editing}
                                    className={`w-full p-4 rounded-2xl border ${editing ? 'border-blue-500/50 bg-blue-500/5' : 'border-transparent bg-gray-500/5'} min-h-[100px] outline-none transition-all text-sm font-medium`}
                                    placeholder={role === "student" ? "e.g. Science, Chess, Python..." : "e.g. Grade 10 Science, Grade 12 Physics..."}
                                />
                            </div>

                            {role === "student" && (
                                <div className="mt-8 p-4 bg-red-500/5 rounded-2xl border border-red-500/10">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-red-500/60 mb-2 flex items-center gap-2">
                                        <Heart size={12} /> Health Summary
                                    </h4>
                                    <p className="text-sm opacity-70 leading-relaxed font-medium">
                                        {formData?.health_summary || "Health data will be visible once updated by your institution."}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function InputField({ label, name, value, onChange, editable, type = "text" }) {
    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">{label}</label>
            <input
                type={type}
                name={name}
                value={value || ""}
                onChange={onChange}
                disabled={!editable}
                className={`w-full p-3.5 rounded-xl border text-sm font-bold transition-all outline-none
                    ${editable 
                        ? 'border-blue-500/30 bg-blue-500/5 focus:border-blue-500' 
                        : 'border-transparent bg-gray-500/5 opacity-80 cursor-not-allowed'
                    }`}
            />
        </div>
    );
}
