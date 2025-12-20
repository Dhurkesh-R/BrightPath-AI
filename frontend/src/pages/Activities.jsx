import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Activity, Book, Dumbbell, Music, Palette, Plus, PersonStanding, ChevronDown, ChevronUp, X } from "lucide-react";
import { fetchActivities, addActivity, updateActivity, deleteActivity } from "../services/api";
import { motion } from "framer-motion";
import { useTheme, getThemeClasses } from '../contexts/ThemeContext.jsx'; // 1. Theme Imports

export default function Activities() {
    // 2. Get theme context
    const { theme,_,t } = useTheme(); 
    const { bg, text, cardBg, border, inputBg, inputBorder, textSecondary, buttonPrimary, buttonDestructive } = getThemeClasses(theme);

    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [selected, setSelected] = useState(null);
    const [showStats, setShowStats] = useState(true);

    // Replaced the static 'isGradient' logic with dynamic theme class properties.

    const [form, setForm] = useState({
        title: "",
        category: "",
        timeSpent: "",
        description: "",
    });

    const loadActivities = async () => {
        try {
            const data = await fetchActivities();
            const normalized = data.map((a) => ({
                ...a,
                timeSpent: a.timeSpent || a.time_spent || 0,
                date: a.date || a.created_at || new Date().toISOString(),
            })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            setActivities(normalized);
        } catch (err) {
            console.error("Error fetching activities:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadActivities();
    }, []);

    const resetForm = () => {
        setForm({ title: "", category: "", timeSpent: "", description: ""});
    };

    const activityIcons = {
        sports: <Dumbbell className="w-6 h-6 text-blue-400" />,
        academics: <Book className="w-6 h-6 text-green-400" />,
        music: <Music className="w-6 h-6 text-purple-400" />,
        art: <Palette className="w-6 h-6 text-pink-400" />,
        general: <Activity className="w-6 h-6 text-yellow-400" />,
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = { ...form, timeSpent: Number(form.timeSpent), date: new Date().toISOString() };
            await addActivity(payload);
            await loadActivities(); // Reload to ensure correct sorting and ID mapping
            resetForm();
            setOpen(false);
        } catch (err) {
            console.error("Error adding activity:", err);
        }
    };

    const openDetails = (activity) => {
        setSelected(activity);
        setForm({
            title: activity.title,
            category: activity.category,
            timeSpent: String(activity.timeSpent),
            description: activity.description,
            date: activity.date || activity.created_at || "",
        });
        setEditMode(false);
    };

    const handleUpdate = async () => {
        try {
            const payload = { ...form, timeSpent: Number(form.timeSpent) };
            const updated = await updateActivity(selected.id, payload);
            setActivities((prev) => prev.map((a) => (a.id === selected.id ? updated : a)));
            setSelected(updated);
            setEditMode(false);
            loadActivities();
        } catch (err) {
            console.error("Error updating activity:", err);
        }
    };

    const handleDelete = async () => {
        try {
            await deleteActivity(selected.id);
            setSelected(null);
            loadActivities();
        } catch (err) {
            console.error("Error deleting activity:", err);
        }
    };

    // Stats calculations
    const mostTime = activities.length
        ? [...activities].sort((a, b) => b.timeSpent - a.timeSpent)[0]
        : null;
    const totalTime = activities.reduce((sum, a) => sum + (a.timeSpent || 0), 0);

    if (loading) {
        return (
            // Use dynamic theme classes here
            <div className={`flex items-center justify-center h-[100vh] ${bg} ${textSecondary} w-full`}>
                <p className="text-lg animate-pulse">Loading activities...</p>
            </div>
        );
    }

    return (
        // Use dynamic theme classes for the main container
        <div className={`py-4 w-full ${bg} ${text} min-h-screen`}>
            {/* Header */}
            <div className={`flex justify-between items-center pb-4 border-b ${border}`}>
                <div className="flex pl-4 items-center">
                    <PersonStanding className="w-8 h-8 text-indigo-400" />
                    <h2 className="text-2xl font-extrabold pl-2">Activity Log</h2>
                </div>
                <div className="pr-4">
                    <Button
                        className={`flex gap-2 ${buttonPrimary}`}
                        theme={theme}
                        onClick={() => setOpen(true)}
                    >
                        <Plus className="w-4 h-6" />
                        Add Activity
                    </Button>

                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogContent
                            theme={theme}
                            className={`sm:max-w-md ${cardBg} ${text} ${border}`}
                        >
                            <DialogHeader className="flex items-center justify-between">
                                <DialogTitle>Add New Activity</DialogTitle>
                                <Button
                                    variant="secondary"
                                    className="bg-transparent shadow-none"
                                    theme={theme}
                                    onClick={() => setOpen(false)}
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4 mt-2">      <div>
                        <Label htmlFor="title">Title</Label>
                        <Input
                          id="title"
                          value={form.title}
                          onChange={(e) => setForm({ ...form, title: e.target.value })}
                          required
                          className={`${inputBg} ${inputBorder} ${text}`} // Themed Input
                          theme={theme}
                        />
                    </div>
                    <div>
                        <Label htmlFor="category">Category</Label>
                        {/* Themed Select */}
                        <Select
                          value={form.category}
                          onValueChange={(val) => setForm({ ...form, category: val })}
                        >
                          <SelectTrigger className={`${inputBg} ${inputBorder} ${text}`} theme={theme}>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent className={`${cardBg} ${text} ${border}`} theme={theme}>
                            <SelectItem value="sports" theme={theme}>Sports</SelectItem>
                            <SelectItem value="academics" theme={theme}>Academics</SelectItem>
                            <SelectItem value="music" theme={theme}>Music</SelectItem>
                            <SelectItem value="art" theme={theme}>Art</SelectItem>
                            <SelectItem value="general" theme={theme}>General</SelectItem>
                          </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label htmlFor="description">Description</Label>
                        <Input
                          id="description"
                          value={form.description}
                          onChange={(e) => setForm({ ...form, description: e.target.value })}
                          className={`${inputBg} ${inputBorder} ${text}`} // Themed Input
                          theme={theme}
                        />
                    </div>
                    <div>
                        <Label htmlFor="timeSpent">Time Spent (minutes)</Label>
                        <Input
                          type="number"
                          min="1"
                          value={form.timeSpent}
                          onChange={(e) => setForm({ ...form, timeSpent: e.target.value })}
                          className={`${inputBg} ${inputBorder} ${text}`} // Themed Input
                          theme={theme}
                        />
                    </div>
                    <Button type="submit" className={`w-full ${buttonPrimary}`}>Save Activity</Button>
                    </form>
                    </DialogContent>
                </Dialog>
                </div>
            </div>

            {/* Stats */}
            <div className={`border-b ${border} pb-4`}>
                <div
                    className="flex pt-6 w-full justify-center items-center cursor-pointer mb-4"
                    onClick={() => setShowStats(!showStats)}
                >
                    <h2 className="text-xl font-bold pr-1 transition-colors">Quick Stats</h2>
                    {showStats ? (
                        <ChevronUp className="w-6 h-6 transition-transform duration-300" />
                    ) : (
                        <ChevronDown className="w-6 h-6 transition-transform duration-300" />
                    )}
                </div>
                
                {/* Collapsible content */}
                <div
                    className={`
                        grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mx-4 p-0
                        transition-all duration-500 ease-in-out overflow-hidden
                        ${showStats ? "max-h-96" : "max-h-0"}
                    `}
                >
                    <div 
                        // Use cardBg and border for stat cards
                        className={`p-4 rounded-xl shadow-lg border ${cardBg} ${border}`}
                    >
                        <h3 className={`text-lg font-semibold text-indigo-400`}>
                            🎯 Recent Activity
                        </h3>
                        <p className={`${textSecondary} text-sm`}>
                            {activities.length > 0 ? activities[0].title : "N/A"}
                        </p>
                        <p className={`text-xs ${textSecondary} mt-1`}>
                             {activities.length > 0 ? `${activities[0].timeSpent} mins` : ""}
                        </p>
                    </div>

                    {mostTime && (
                        <div className={`p-4 rounded-xl shadow-lg border ${cardBg} ${border}`}>
                            <h3 className={`text-lg font-semibold text-blue-400`}>
                                ⏱️ Longest Session
                            </h3>
                            <p className={`${textSecondary} text-sm`}>
                                {mostTime.title}
                            </p>
                            <p className={`text-xs ${textSecondary} mt-1`}>
                                {mostTime.timeSpent} mins
                            </p>
                        </div>
                    )}
                    
                    <div className={`p-4 rounded-xl shadow-lg border ${cardBg} ${border}`}>
                        <h3 className={`text-lg font-semibold text-green-400`}>
                            🔢 Total Activities
                        </h3>
                        <p className="text-2xl font-bold text-green-400">{activities.length}</p>
                    </div>
                    
                    <div className={`p-4 rounded-xl shadow-lg border ${cardBg} ${border}`}>
                        <h3 className={`text-lg font-semibold text-red-400`}>
                            ⏳ Total Time Spent
                        </h3>
                        <p className="text-2xl font-bold text-red-400">{totalTime} mins</p>
                    </div>
                </div>
            </div>

                {/* Activity Grid */}
                <motion.div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 p-6 mx-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
                {activities.map((activity, idx) => (              
                    <motion.div key={activity.id || idx} whileHover={{ scale: 1.03 }} transition={{ type: "spring", stiffness: 200 }}>               
                        {/* Apply cardBg and border to individual activity cards */}
                        <Card className={`rounded-2xl shadow-md border hover:border-gray-200 hover:shadow-xl transition-all ${cardBg} ${border}`} theme={theme}>               
                            <CardHeader className="flex items-center justify-between">               
                                <CardTitle className="text-lg font-semibold">{activity.title}</CardTitle>               
                                {activityIcons[activity.category] || activityIcons.general}               
                            </CardHeader>                
                            <CardContent>                
                                {/* Use textSecondary for less prominent text */}
                                <p className={`text-sm ${textSecondary} mb-3`}>{activity.description}</p>                
                                <div className="flex items-center justify-between text-sm">                
                                    <span className={`font-medium ${textSecondary}`}>{new Date(activity.date || activity.created_at).toLocaleDateString()}</span>               
                                    <Button variant="outline" size="sm" onClick={() => openDetails(activity)}>View Details</Button>                
                                </div>               
                            </CardContent>                
                        </Card>
                    </motion.div>
                ))}


                {activities.length === 0 && (
                    <div className="col-span-full flex justify-center items-center h-[50vh]">
                        <p className={textSecondary}>No activities logged yet. Try adding some!</p>
                    </div>
                )}

                {/* Details Dialog */}
                <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
                    {/* Themed Dialog Content */}
                    <DialogContent theme={theme} className={`sm:max-w-lg ${cardBg} ${text} ${border}`}>
                        <DialogHeader className="flex items-center justify-between">
                            <DialogTitle className={text}>{editMode ? "Edit Activity" : "Activity Details"}</DialogTitle>
                            <Button
                                    variant="secondary"
                                    className="bg-transparent shadow-none"
                                    theme={theme}
                                    onClick={() => setSelected(false)}
                                >
                                    <X className="w-4 h-4" />
                            </Button>
                        </DialogHeader>

                        {selected && !editMode && (
                            <div className={`space-y-3 ${textSecondary}`}>
                                <p><strong>Title:</strong> {selected.title}</p>
                                <p><strong>Description:</strong> {selected.description || "N/A"}</p>
                                <p><strong>Time spent:</strong> {selected.timeSpent} mins</p>
                                <p><strong>Type:</strong> {selected.category}</p>
                                <p><strong>Date:</strong> {new Date(selected.date).toLocaleDateString()}</p>
                                <div className="flex justify-between pt-4">
                                    <Button onClick={() => setEditMode(true)} className={buttonPrimary}>Edit</Button>
                                    <Button onClick={handleDelete} className={buttonDestructive}>Delete</Button>
                                </div>
                            </div>
                        )}

                        {editMode && (
                        <div className="space-y-4">
                            <div>
                                <Label>Title</Label>
                                <Input 
                                    value={form.title} 
                                    onChange={(e) => setForm({ ...form, title: e.target.value })} 
                                    className={`${inputBg} ${inputBorder} ${text}`} // Themed Input
                                />
                            </div>
                            <div>
                                <Label>Description</Label>
                                <Input 
                                    value={form.description} 
                                    onChange={(e) => setForm({ ...form, description: e.target.value })} 
                                    className={`${inputBg} ${inputBorder} ${text}`} // Themed Input
                                />
                            </div>
                            <div>
                                <Label>Time Spent (minutes)</Label>
                                <Input 
                                    type="number" 
                                    min="1" 
                                    value={form.timeSpent} 
                                    onChange={(e) => setForm({ ...form, timeSpent: e.target.value })} 
                                    className={`${inputBg} ${inputBorder} ${text}`} // Themed Input
                                />
                            </div>
                            <div>
                                <Label>Type</Label>
                                <Select value={form.category} onValueChange={(val) => setForm({ ...form, category: val })}>
                                    <SelectTrigger className={`${inputBg} ${inputBorder} ${text}`}>
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent className={`${cardBg} ${text} ${border}`}>
                                        <SelectItem value="sports">Sports</SelectItem>
                                        <SelectItem value="academics">Academics</SelectItem>
                                        <SelectItem value="music">Music</SelectItem>
                                        <SelectItem value="art">Art</SelectItem>
                                        <SelectItem value="general">General</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex justify-end gap-2 pt-4">
                                <Button variant="outline" onClick={() => setEditMode(false)}>Cancel</Button>
                                <Button onClick={handleUpdate} className={buttonPrimary}>Save</Button>
                            </div>
                        </div>
                        )}
                    </DialogContent>
                </Dialog>
                </motion.div>
        </div>
    );
}