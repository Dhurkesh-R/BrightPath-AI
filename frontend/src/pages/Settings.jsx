import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Settings2, Sun, Moon, User, Trash2, Lock, LogOut, X, CheckCircle } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext.jsx'; 
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card.jsx';
import { Label } from '../ui/label.jsx';
import { Input } from '../ui/input.jsx';
import { Button } from '../ui/button.jsx';
import { getUserProfile, updateUserProfile, changePassword } from '../services/api.js';
import { useNavigate } from 'react-router-dom';

// Modern Switch Component
const Switch = ({ checked, onCheckedChange }) => (
    <div
        className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-300 cursor-pointer ${checked ? 'bg-blue-600' : 'bg-gray-400 dark:bg-gray-600'}`}
        onClick={() => onCheckedChange(!checked)}
    >
        <div className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform duration-300 ${checked ? 'translate-x-6' : 'translate-x-0'}`} />
    </div>
);

const Settings = () => {
    const { theme, setTheme, getThemeClasses } = useTheme();
    const { border, cardBg, text, textSecondary, bg } = getThemeClasses(theme);
    const navigate = useNavigate();

    // States 
    const [user, setUser] = useState({ name: '', email: '' });
    const [notifications, setNotifications] = useState(true);
    const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
    const [status, setStatus] = useState(null); // For custom alerts

    useEffect(() => {
        async function fetchProfile() {
            try {
                const res = await getUserProfile(); 
                setUser(res);
            } catch (err) {
                console.error("Failed to fetch profile", err);
            }
        }
        fetchProfile();
    }, []);

    const showToast = (msg, type = 'success') => {
        setStatus({ msg, type });
        setTimeout(() => setStatus(null), 4000);
    };

    const handleLogOut = () => {
        localStorage.clear();
        navigate("/login");
    };

    const handlePasswordUpdate = async () => {
        if (!passwords.current || !passwords.new || !passwords.confirm) {
            showToast("All password fields are required", "error");
            return;
        }
        if (passwords.new !== passwords.confirm) {
            showToast("New passwords do not match", "error");
            return;
        }
        try {
            await changePassword({
                currentPassword: passwords.current,
                newPassword: passwords.new,
            });
            showToast("Password updated successfully!");
            setPasswords({ current: '', new: '', confirm: '' });
        } catch (err) {
            showToast(err.message || "Failed to update password", "error");
        }
    };

    const handleSaveProfile = async () => {
        try {
            const res = await updateUserProfile({ ...user, lastUpdated: new Date().toISOString() });
            setUser(res);
            showToast("Profile saved!");
        } catch (err) {
            showToast("Error updating profile", "error");
        } 
    };

    return (
        <div className={`min-h-screen ${bg} ${text} transition-all duration-300 p-4 md:p-10 ml-16 md:ml-64`}>
            
            {/* Custom Toast Notification */}
            {status && (
                <div className="fixed top-6 right-6 z-50 animate-in slide-in-from-right-10">
                    <div className={`flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl border ${status.type === 'error' ? 'bg-red-500 border-red-400' : 'bg-green-600 border-green-500'} text-white`}>
                        {status.type === 'error' ? <X size={18} /> : <CheckCircle size={18} />}
                        <span className="font-bold text-sm">{status.msg}</span>
                    </div>
                </div>
            )}

            <div className="max-w-3xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex justify-between items-center border-b pb-6 border-gray-500/20">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-500/10 rounded-2xl">
                            <SettingsIcon className="w-8 h-8 text-blue-500" />
                        </div>
                        <h1 className="text-3xl font-black tracking-tight">Settings</h1>
                    </div>
                    <Button 
                        variant="ghost" 
                        onClick={handleLogOut}
                        className="flex items-center gap-2 text-red-500 hover:bg-red-500/10 rounded-xl"
                    >
                        <LogOut size={20} />
                        <span className="hidden sm:inline">Logout</span>
                    </Button>
                </div>

                {/* 1. Account Section */}
                <Card className={`border ${border} ${cardBg} rounded-3xl overflow-hidden shadow-xl`}>
                    <CardHeader className="border-b border-gray-500/10 pb-4">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <User size={18} className="text-blue-500" /> Account Info
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] uppercase font-black opacity-50 ml-1">Full Name</Label>
                                <Input 
                                    className="rounded-xl bg-gray-500/5 border-gray-500/20" 
                                    value={user.name} 
                                    onChange={(e) => setUser({...user, name: e.target.value})} 
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] uppercase font-black opacity-50 ml-1">Email</Label>
                                <Input 
                                    className="rounded-xl bg-gray-500/5 border-gray-500/20" 
                                    value={user.email} 
                                    onChange={(e) => setUser({...user, email: e.target.value})} 
                                />
                            </div>
                        </div>
                        <Button onClick={handleSaveProfile} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6 font-bold">
                            Save Changes
                        </Button>
                    </CardContent>
                </Card>

                {/* 2. Appearance & Prefs */}
                <Card className={`border ${border} ${cardBg} rounded-3xl shadow-xl`}>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Settings2 size={18} className="text-purple-500" /> Preferences
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-500/5 rounded-2xl border border-gray-500/10">
                            <div className="flex items-center gap-3">
                                {theme === 'dark' ? <Moon className="text-yellow-400" size={20}/> : <Sun className="text-orange-500" size={20}/>}
                                <div>
                                    <p className="font-bold text-sm">Dark Mode</p>
                                    <p className={`text-xs ${textSecondary}`}>Adjust the app's visual theme</p>
                                </div>
                            </div>
                            <Switch checked={theme === 'dark'} onCheckedChange={(isDark) => setTheme(isDark ? 'dark' : 'light')} />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-500/5 rounded-2xl border border-gray-500/10">
                            <div>
                                <p className="font-bold text-sm">Email Notifications</p>
                                <p className={`text-xs ${textSecondary}`}>Get updates about your progress</p>
                            </div>
                            <Switch checked={notifications} onCheckedChange={setNotifications} />
                        </div>
                    </CardContent>
                </Card>

                {/* 3. Security Section */}
                <Card className={`border ${border} ${cardBg} rounded-3xl shadow-xl`}>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Lock size={18} className="text-green-500" /> Security
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-2">
                        <div className="space-y-3">
                            <Input 
                                type="password" 
                                placeholder="Current Password" 
                                className="rounded-xl" 
                                value={passwords.current}
                                onChange={(e) => setPasswords({...passwords, current: e.target.value})}
                            />
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <Input 
                                    type="password" 
                                    placeholder="New Password" 
                                    className="rounded-xl" 
                                    value={passwords.new}
                                    onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                                />
                                <Input 
                                    type="password" 
                                    placeholder="Confirm New Password" 
                                    className="rounded-xl" 
                                    value={passwords.confirm}
                                    onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
                                />
                            </div>
                        </div>
                        <Button onClick={handlePasswordUpdate} className="w-full sm:w-auto bg-gray-800 dark:bg-white dark:text-black text-white rounded-xl px-8 font-bold">
                            Update Password
                        </Button>
                    </CardContent>
                </Card>

                {/* 4. Danger Zone */}
                <div className="p-6 rounded-3xl border-2 border-red-500/20 bg-red-500/5 space-y-4">
                    <div className="flex items-center gap-2 text-red-500">
                        <Trash2 size={20} />
                        <h3 className="font-black uppercase tracking-widest text-sm">Danger Zone</h3>
                    </div>
                    <p className={`text-sm ${textSecondary}`}>
                        Once you delete your account, there is no going back. Please be certain.
                    </p>
                    <Button variant="destructive" className="rounded-xl font-bold px-6">
                        Delete Account
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default Settings;
