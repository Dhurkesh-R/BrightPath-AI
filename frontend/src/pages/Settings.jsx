import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Settings2, Sun, Moon, User, Trash2, Lock } from 'lucide-react';
import { useTheme, getThemeClasses } from '../contexts/ThemeContext.jsx'; 
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card.jsx';
import { Label } from '../ui/label.jsx';
import { Input } from '../ui/input.jsx';
import { Button } from '../ui/button.jsx';

// Mock components (you would replace these with your actual components)
const Switch = ({ checked, onCheckedChange, theme }) => {
    const baseClass = "w-10 h-6 flex items-center rounded-full p-1 transition-colors duration-200 cursor-pointer";
    const knobClass = "w-4 h-4 rounded-full shadow-md transform transition-transform duration-200";

    return (
        <div
            className={`${baseClass} ${checked ? 'bg-blue-500' : 'bg-gray-400'}`}
            onClick={() => onCheckedChange(!checked)}
        >
            <div
                className={`${knobClass} ${checked ? 'translate-x-4 bg-white' : 'translate-x-0 bg-white'}`}
            ></div>
        </div>
    );
};


const Settings = () => {
    const { theme, setTheme, getThemeClasses } = useTheme();
    const { border, cardBg, text } = getThemeClasses(theme);

    // Local states 
    const [name, setName] = useState("John Doe");
    const [email, setEmail] = useState("john.doe@example.com");
    const [notifications, setNotifications] = useState(true);
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    // Connect Dark Mode switch to Theme Context
    const handleThemeChange = (isDark) => {
        setTheme(isDark ? 'dark' : 'light');
    };

    return (
        <div className="p-6 grid gap-6 max-w-4xl mx-auto">
            <h1 className={`text-4xl font-extrabold mb-4 flex items-center ${text}`}>
                <SettingsIcon className="w-8 h-8 mr-3" />
                Account Settings
            </h1>

            {/* 1. Profile Section  */}
            <Card className="shadow-2xl" theme={theme}>
                <CardHeader>
                    <CardTitle className={`flex items-center ${text}`}>
                        <User className="w-5 h-5 mr-2" />
                        Profile Information
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label>Full Name</Label>
                        <Input theme={theme} value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                    <div>
                        <Label>Email Address</Label>
                        <Input theme={theme} type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                    <Button className="mt-2">Save Profile</Button>
                </CardContent>
            </Card>

            {/* 2. Preferences/Theme Section */}
            <Card className="shadow-2xl" theme={theme}>
                <CardHeader>
                    <CardTitle className={`flex items-center ${text}`}>
                        <Settings2 className="w-5 h-5 mr-2" />
                        App Preferences
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    
                    {/* Dark Mode Toggle*/}
                    <div className={`flex items-center justify-between p-3 rounded-xl ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100/50'} border ${border} transition-colors duration-300`}>
                        <div className="flex items-center">
                            {theme === 'dark' 
                                ? <Moon className="w-5 h-5 mr-3 text-yellow-400" /> 
                                : <Sun className="w-5 h-5 mr-3 text-yellow-500" />}
                            <Label className="block text-base font-medium">Dark Mode</Label>
                        </div>
                        <Switch 
                            checked={theme === 'dark'} 
                            onCheckedChange={handleThemeChange} 
                        />
                    </div>
                    
                    {/* Notifications  */}
                    <div className="flex items-center justify-between p-3">
                        <Label className="block text-base font-medium">Receive Email Notifications</Label>
                        <Switch checked={notifications} onCheckedChange={setNotifications} />
                    </div>
                    <Button className="mt-2">Save Preferences</Button>
                </CardContent>
            </Card>

            {/* 3. Security Section  */}
            <Card className="shadow-2xl" theme={theme}>
                <CardHeader>
                    <CardTitle className={`flex items-center ${text}`}>
                        <Lock className="w-5 h-5 mr-2" />
                        Security & Password
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label>New Password</Label>
                        <Input theme={theme} type="password" placeholder="••••••••" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                    </div>
                    <div>
                        <Label>Confirm Password</Label>
                        <Input theme={theme} type="password" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                    </div>
                    <Button className="mt-2">Update Password</Button>
                </CardContent>
            </Card>

            {/* 4. Danger Zone  */}
            <Card className="shadow-2xl border-2 border-red-500/50" theme={theme}>
                <CardHeader>
                    <CardTitle className="flex items-center text-red-600">
                        <Trash2 className="w-5 h-5 mr-2" />
                        Danger Zone
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                    <div className={getThemeClasses(theme).textSecondary}>
                        <p className="text-sm">
                            Permanently delete your account and all associated data. This action cannot be undone.
                        </p>
                    </div>
                    <Button variant="destructive" className="w-fit">Delete Account</Button>
                </CardContent>
            </Card>
        </div>
    );
};

export default Settings