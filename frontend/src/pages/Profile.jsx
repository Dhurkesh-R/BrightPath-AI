import { useEffect, useState, useRef } from "react";
import { Loader2, Edit3, Save, User, Activity, Heart, UserRound, Star, Upload, X } from "lucide-react";
// Assuming these services are defined elsewhere, we'll keep the import paths as standard strings.
import { getUserProfile, updateUserProfile } from '../services/api' 
import { getThemeClasses, useTheme } from "../contexts/ThemeContext";

export default function App() {
    const { theme, _, t } = useTheme()
    const [user, setUser] = useState(null);
    const [editing, setEditing] = useState(false);
    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState(null); // State for custom modal message
    const role = JSON.parse(localStorage.getItem("user")).role

    const { bg, text, cardBg, border, inputBg, inputBorder, textSecondary, buttonPrimary, buttonDestructive, inputFocus, inputText, disabledText, disabledBg } = getThemeClasses(theme);
    
    // Ref for the hidden file input
    const fileInputRef = useRef(null);

    // Custom non-alert modal function
    const showModalMessage = (msg) => {
        setMessage(msg);
        // Clear message after 4 seconds
        setTimeout(() => setMessage(null), 4000);
    };

    useEffect(() => {
        async function fetchProfile() {
            try {
                const res = await getUserProfile(); 
                setUser(res);
                setFormData(res);
            } catch (err) {
                console.error(err);
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
            // Check file size (e.g., limit to 1MB)
            if (file.size > 1024 * 1024) {
                // Using custom modal instead of alert()
                showModalMessage("Image size exceeds 1MB limit. Please choose a smaller file.");
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                // Store the Base64 string in the form data
                setFormData(prev => ({ 
                    ...prev, 
                    profilePicUrl: reader.result 
                }));
            };
            reader.readAsDataURL(file);
        }
    };
    
    const triggerFileInput = () => {
        // Open the native file dialog
        fileInputRef.current.click();
    };


    const handleSave = async () => {
        try {
            setSaving(true);
            const updatePayload = {
                ...formData,
                // Mocking the update process:
                lastUpdated: new Date().toISOString()
            };
            
            const res = await updateUserProfile(updatePayload); 
            
            setUser(res);
            setFormData(res); 
            setEditing(false);
            showModalMessage("Profile successfully updated!");
        } catch (err) {
            console.error(err);
            showModalMessage("Error saving profile. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    if (loading)
        return (
            <div className={`flex justify-center items-center h-screen w-screen ${bg} ${text}`}>
                <Loader2 className="w-8 h-8 animate-spin mr-3 text-blue-400" />
                Loading profile...
            </div>
        );

    // Fallback/Default image URL (a simple, generic SVG icon)
    const defaultImageUrl = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMTIiIGhlaWdodD0iMTEyIiB2aWV3Qm94PSIwIDAgMTEyIDExMiI+PHJlY3Qgd2lkdGg9IjExMiIgaGVpZ2h0PSIxMTIiIHJ4PSI1NiIgZmlsbD0iIzM2YjVhMiIvPjx0ZXh0IHg9IjU2IiB5PSI2MCIgZm9udC1zaXplPSI2MCIgZm9udC1mYW1pbHk9ImludGVyLCBzYW5zLXNlcmlmIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjZmZmZmZmIj5QPC90ZXh0Pjwvc3ZnPg==";
    
    return (
        <div className={`${bg} ${text} w-full h-full p-6 md:p-10 relative ml-16`}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
                body { font-family: 'Inter', sans-serif; }
                .full-viewport-height { min-height: 100vh; }
            `}</style>
            
            {/* Custom Message Modal */}
            {message && (
                <div className="fixed top-5 right-5 z-50">
                    <div className="flex items-center p-4 bg-green-500/90 backdrop-blur text-white rounded-xl shadow-2xl transition-all duration-300 animate-slide-in-right">
                        <span className="text-sm font-medium">{message}</span>
                        <button onClick={() => setMessage(null)} className="ml-4 p-1 rounded-full hover:bg-white/20 transition">
                            <X size={16} />
                        </button>
                    </div>
                    <style>{`
                        @keyframes slide-in-right {
                            from { transform: translateX(100%); opacity: 0; }
                            to { transform: translateX(0); opacity: 1; }
                        }
                        .animate-slide-in-right {
                            animation: slide-in-right 0.3s ease-out forwards;
                        }
                    `}</style>
                </div>
            )}

            <div className="max-w-6xl mx-auto mb-8">
                {/* Header */}
                <div className={`flex items-center justify-between mb-8 border-b ${border} pb-4`}>
                    <div className="flex items-center">
                        <UserRound className="w-10 h-10 text-blue-300" />
                        <h2 className="text-3xl font-extrabold pl-3">My Profile</h2>
                    </div>
                    
                    <div className="flex gap-4">
                        {editing && (
                            <button
                                onClick={() => setEditing(false)}
                                className={`flex items-center gap-2 bg-gray-700 text-gray-200 px-4 py-2 rounded-xl hover:bg-gray-600 transition`}
                            >
                                Cancel
                            </button>
                        )}
                        {!editing ? (
                            <button
                                onClick={() => setEditing(true)}
                                className={`flex items-center gap-2 bg-blue-500 text-gray-200 px-4 py-2 rounded-xl hover:bg-blue-600 transition`}
                            >
                                <Edit3 size={18} />
                                Edit
                            </button>
                        ) : (
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className={`flex items-center gap-2 bg-green-500 text-gray-200 px-4 py-2 rounded-xl hover:bg-green-600 transition disabled:opacity-50`}
                            >
                                {saving ? (
                                    <Loader2 size={18} className="animate-spin" />
                                ) : (
                                    <Save size={18} />
                                )}
                                Save
                            </button>
                        )}
                    </div>
                </div>

                {/* Profile Card Layout */}
                <div className={`rounded-2xl shadow-2xl p-6 ${cardBg} grid grid-cols-1 lg:grid-cols-4 gap-8 mb-8`}>
                    
                    {/* Left Section (1 column on large screens) */}
                    <div className={`flex flex-col items-center lg:items-start lg:border-r ${border} lg:pr-8 lg:col-span-1`}>
                        
                        {/* Profile Pic & Edit Button */}
                        <div className="relative w-36 h-36 mb-6 group">
                            <img
                                src={formData?.profilePicUrl || defaultImageUrl}
                                alt="Profile"
                                className="w-full h-full object-cover rounded-full border-4 border-blue-400 shadow-xl transition-all duration-300 group-hover:scale-[1.02]"
                                onError={(e) => e.currentTarget.src = defaultImageUrl}
                            />
                            {editing && (
                                <button
                                    onClick={triggerFileInput}
                                    className={`absolute inset-0 flex items-center justify-center p-2 bg-black/50 ${text} rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                                    title="Upload Profile Picture"
                                >
                                    <Upload size={32} />
                                </button>
                            )}
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                onChange={handleFileSelect} 
                                accept="image/png, image/jpeg"
                                className="hidden"
                            />
                        </div>

                        {/* Basic Info */}
                        <div className="flex flex-col items-center mb-6 w-full text-center">
                            <h2 className={`text-2xl font-bold ${text}`}>
                                {user?.name || "Unnamed User"}
                            </h2>
                            <p className="text-gray-400 text-md">{user?.email}</p>
                            <p className="text-md mt-3 bg-blue-400/20 text-blue-300 px-4 py-1.5 rounded-full font-semibold shadow-md">
                                {user?.role || "Student"}
                            </p>
                        </div>

                        {/* Bio Section */}
                        <div className={`w-full mt-4 p-4 rounded-xl border ${border} ${bg}/50`}>
                            <h3 className={`text-lg font-semibold mb-2 border-b border-gray-600 pb-1 ${text}`}>Bio</h3>
                            <textarea
                                name="bio"
                                value={formData?.bio || ""} 
                                onChange={handleChange}
                                disabled={!editing}
                                rows={4}
                                className={`
                                    w-full text-base rounded-lg outline-none resize-none transition p-2
                                    border border-transparent
                                    disabled:bg-transparent disabled:cursor-default
                                    ${inputBg} 
                                    ${inputText} 
                                    ${inputFocus} 
                                    ${disabledText}
                                    ${disabledBg ? 'border-transparent' : inputBorder}
                                  `}
                                placeholder="Tell us a little about yourself..."
                            />
                        </div>
                        
                        {/* Badges Section */}
                        <div className="w-full mt-6">
                            <h3 className={`text-lg font-semibold mb-4 ${text} flex items-center gap-2`}>
                                <Star className="w-5 h-5 text-yellow-500" />
                                Badges
                            </h3>
                            <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                                {user?.badges && user.badges.length > 0 ? (
                                    user.badges.map((badge, index) => (
                                        <Badge key={index} name={badge.name} icon={badge.icon} color={badge.color} theme={theme}/>
                                    ))
                                ) : (
                                    <p className="text-sm text-gray-500">No badges earned yet.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Section - Details (3 columns on large screens) */}
                    <div className="lg:col-span-3">
                        <h3 className={`text-2xl font-bold mb-6 ${text} border-b ${border} pb-2`}>
                            Personal Details
                        </h3>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          {/* Student Fields */}
                          {role === "student" && (
                            <>
                              <InputField
                                label="Age"
                                name="age"
                                value={formData?.age}
                                onChange={handleChange}
                                editable={editing}
                                type="number"
                                theme={{ inputBg, bg, text, border }}
                              />
                              <InputField
                                label="Class"
                                name="class"
                                value={formData?.class}
                                onChange={handleChange}
                                editable={editing}
                                theme={{ inputBg, bg, text, border }}
                              />
                              <InputField
                                label="School"
                                name="school"
                                value={formData?.school}
                                onChange={handleChange}
                                editable={editing}
                                theme={{ inputBg, bg, text, border }}
                              />
                              <InputField
                                label="City"
                                name="city"
                                value={formData?.city}
                                onChange={handleChange}
                                editable={editing}
                                theme={{ inputBg, bg, text, border }}
                              />
                              <div className="col-span-2">
                                <h3 className={`text-2xl font-bold mt-6 mb-6 ${text} flex items-center gap-3 border-b ${border} pb-2`}>
                                    <Activity className="w-6 h-6 text-green-500" />
                                    Skills & Interests
                                </h3>
                                <textarea
                                    name="interests"
                                    value={formData?.interests || ""}
                                    onChange={handleChange}
                                    disabled={!editing}
                                    className={`w-full p-4 border ${border} rounded-xl focus:ring-2 focus:ring-blue-400 outline-none min-h-[120px] disabled:bg-transparent disabled:cursor-not-allowed ${inputBg} ${text} text-base transition`}
                                    placeholder="e.g. Drawing, Robotics, Football, Piano..."
                                />
                              </div>
                              <div className="col-span-2">
                                <h3 className={`text-2xl font-bold mt-6 mb-6 ${text} flex items-center gap-3 border-b ${border} pb-2`}>
                                    <Heart className="w-6 h-6 text-red-500" />
                                    Mental & Physical Summary
                                </h3>
                                {/* This field is intentionally disabled as it's assumed to be AI-generated/admin-only */}
                                <textarea
                                    name="health_summary"
                                    value={formData?.health_summary || ""} 
                                    onChange={handleChange}
                                    disabled={true} 
                                    className={`w-full p-4 border ${border} rounded-xl outline-none min-h-[120px] disabled:bg-transparent disabled:cursor-not-allowed ${inputBg} text-gray-400 text-base`}
                                    placeholder="AI-generated summary or parent notes..."
                                />
                              </div>
                            </>
                          )}

                          {/* Teacher Fields */}
                          {role === "teacher" && (
                            <>
                              <InputField
                                label="Department"
                                name="department"
                                value={formData?.department}
                                onChange={handleChange}
                                editable={editing}
                                theme={{ inputBg, bg, text, border }}
                              />
                              <InputField
                                label="Designation"
                                name="designation"
                                value={formData?.designation}
                                onChange={handleChange}
                                editable={editing}
                                theme={{ inputBg, bg, text, border }}
                              />
                              <InputField
                                label="Age"
                                name="age"
                                value={formData?.age}
                                onChange={handleChange}
                                editable={editing}
                                theme={{ inputBg, bg, text, border }}
                              />
                              <InputField
                                label="Experience Years"
                                name="experience_years"
                                value={formData?.experience_years}
                                onChange={handleChange}
                                editable={editing}
                                theme={{ inputBg, bg, text, border }}
                              />
                              <InputField
                                label="School"
                                name="school"
                                value={formData?.school}
                                onChange={handleChange}
                                editable={editing}
                                theme={{ inputBg, bg, text, border }}
                              />
                              <InputField
                                label="City"
                                name="city"
                                value={formData?.city}
                                onChange={handleChange}
                                editable={editing}
                                theme={{ inputBg, bg, text, border }}
                              />
                              <div className="w-full col-span-2">
                                <h3 className={`text-2xl font-bold mt-10 mb-6 ${text} flex items-center gap-3 border-b ${border} pb-2`}>
                                  <Activity className="w-6 h-6 text-green-500" />
                                  Handling Classes
                                </h3>
                                <textarea
                                  name="handling_classes"
                                  value={formData?.handling_classes || ""}
                                  onChange={handleChange}
                                  disabled={!editing}
                                  className={`w-full p-4 border ${border} rounded-xl focus:ring-2 focus:ring-blue-400 outline-none min-h-[120px] disabled:bg-transparent disabled:cursor-not-allowed ${inputBg} ${text} text-base transition`}
                                  placeholder="e.g. Drawing, Robotics, Football, Piano..."
                                />
                              </div>
                            </>
                          )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* Badge Component */
function Badge({ name, icon, color, theme }) {
    // Note: The original code for Badge component had the same backtick issue and is now corrected.
    const { text } = getThemeClasses(theme);
    return (
        <div className={`flex items-center gap-2 bg-gray-700 backdrop-blur-sm ${text} px-4 py-2 rounded-full text-sm border border-gray-600 shadow-lg hover:bg-gray-700/80 transition`}>
            <span className={`text-xl ${color}`}>{icon}</span>
            <span className="font-medium text-gray-200">{name}</span>
        </div>
    );
}

/* Reusable Input Component */
function InputField({ label, name, value, onChange, editable, type = "text", theme }) {
    const { inputBg, bg, text, border } = theme;
    return (
        <div className="flex flex-col">
            <label className={`text-base ${text} mb-2 font-medium`}>{label}</label>
            <input
                type={type}
                name={name}
                value={value || ""}
                onChange={onChange}
                disabled={!editable}
                className={`p-3 border ${border} rounded-xl focus:ring-2 focus:ring-blue-400 outline-none disabled:bg-transparent disabled:cursor-not-allowed ${text} ${inputBg} transition text-base`}
            />
        </div>
    );
}