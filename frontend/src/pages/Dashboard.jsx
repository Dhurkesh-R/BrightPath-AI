import { useEffect, useState, useMemo } from "react";
import { 
    Loader2, Activity, Brain, Heart, Star, Compass, CircleAlert, 
    LayoutDashboardIcon, UserRound, BookOpen, Smile, Sun, Moon
} from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { RiskCard } from "../ui/riskCard";
import { useTheme, getThemeClasses } from "../contexts/ThemeContext"
import { getStudentDashboard } from "../services/api";

export default function App() {
    const { theme } = useTheme()
    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState({
        profile: null, skills: [], learningStyle: null, 
        behavior: null, emotions: null, health: null, successPath: null
    });
    
    const user = JSON.parse(localStorage.getItem("user"));
    const { bg, text, border, textSecondary, progressBarBg } = getThemeClasses(theme);
    
    // Academic risk derived from skill scores
    const academicRiskScore = useMemo(() => {
        const skills = dashboardData.skills || [];
        if (skills.length === 0) return 0;
        const lowScoreCount = skills.filter(s => s.score < 60).length;
        return Math.min(100, lowScoreCount * (100 / skills.length) * 1.5); 
    }, [dashboardData.skills]);

    useEffect(() => {
        async function fetchData() {
            try {
                const data = await getStudentDashboard(user.id);
                setDashboardData(data);
            } catch (err) {
                console.error("Error loading dashboard:", err);
            } finally {
                setLoading(false);
            }
        }        
        if (user?.id) fetchData();
    }, [user?.id]);

    if (loading) {
        return (
            <div className={`flex flex-col items-center justify-center h-screen ${bg} ${textSecondary} w-full`}>
                <Loader2 className="animate-spin mb-4 w-10 h-10 text-blue-500" /> 
                <span className="text-lg font-medium">Loading Student Insights...</span>
            </div>
        );
    }

    const { profile, skills, learningStyle, emotions, health, successPath, behavior } = dashboardData;
    const defaultAvatar = "data:image/svg+xml;base64,..."; // Keep your existing avatar string

    return (
        <div className={`min-h-screen ${bg} ${text} transition-all duration-300 ml-16 md:ml-64`}>
            <div className="max-w-[1600px] mx-auto p-4 md:p-10">
                
                <header className={`flex flex-col md:flex-row md:items-center justify-between pb-6 mb-6 border-b ${border} gap-4`}>
                    <div className="flex items-center">
                        <LayoutDashboardIcon className={`w-7 h-7 md:w-8 md:h-8 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
                        <h1 className="text-2xl md:text-3xl font-extrabold pl-3">Student Dashboard</h1>
                    </div>
                </header>
    
                {/* Main Content Grid - Optimized for large screens */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    
                    {/* LEFT COLUMN: Profile & Risks (Span 3 of 12) */}
                    <div className="lg:col-span-3 space-y-6">
                        <Card theme={theme} className="shadow-lg border-none bg-opacity-50 backdrop-blur-md">
                            <CardContent className="pt-6">
                                <div className="flex flex-row lg:flex-col items-center gap-4 lg:gap-0">
                                    <img
                                        src={profile?.profilePicUrl || defaultAvatar}
                                        className="w-20 h-20 lg:w-32 lg:h-32 object-cover rounded-2xl border-4 border-blue-500/30 shadow-xl"
                                        alt="Profile"
                                    />
                                    <div className="text-left lg:text-center lg:mt-4">
                                        <h2 className="text-xl lg:text-2xl font-black">{profile?.name || "Student"}</h2>
                                        <p className={`${textSecondary} text-sm font-medium`}>ID: {user?.id}</p>
                                        <div className="mt-2 inline-block px-3 py-1 rounded-full bg-blue-500/10 text-blue-500 text-xs font-bold uppercase">
                                            Grade {profile?.grade || "N/A"}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
    
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold flex items-center gap-2 px-1">
                                <CircleAlert className="w-5 h-5 text-red-500" />
                                Risk Analysis
                            </h3>
                            <div className="grid grid-cols-1 gap-4">
                                <RiskCard title="Academic" riskData={{ risk_score: academicRiskScore, skills }} type="academic" theme={theme} />
                                <RiskCard title="Emotional" riskData={{ ...emotions, risk_score: emotions?.risk_score }} type="emotional" theme={theme} />
                            </div>
                        </div>
                    </div>
    
                    {/* RIGHT CONTENT AREA: Stats & Success Path (Span 9 of 12) */}
                    <div className="lg:col-span-9 space-y-6">
                        {/* Stat Cards - 3 columns on desktop */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <StatCard icon={<Brain className="w-5 h-5"/>} title="Learning Style" value={learningStyle?.type} sub={learningStyle?.description} color="text-indigo-400" theme={theme} />
                            <StatCard icon={<Smile className="w-5 h-5"/>} title="Current Mood" value={emotions?.mood} sub={emotions?.trendDescription} color="text-rose-400" theme={theme} />
                            <StatCard icon={<Heart className="w-5 h-5"/>} title="Health Status" value={health?.physical} sub={`Score: ${health?.score}/100`} color="text-emerald-400" theme={theme} />
                        </div>
    
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                            {/* Skills - Takes half width on XL screens */}
                            <Card theme={theme} className="shadow-md border-none">
                                <CardContent className="pt-6">
                                    <div className="flex items-center justify-between mb-8">
                                        <div className="flex items-center text-yellow-500">
                                            <BookOpen className="w-6 h-6 mr-3" />
                                            <h3 className="text-lg font-bold">Skills Proficiency</h3>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 gap-6">
                                        {skills?.map((s, i) => (
                                            <div key={i} className="group">
                                                <div className="flex justify-between mb-2">
                                                    <span className="font-bold text-sm">{s.name}</span>
                                                    <span className={`text-sm font-black ${s.score < 60 ? 'text-red-500' : 'text-green-500'}`}>{s.score}%</span>
                                                </div>
                                                <div className={`w-full ${progressBarBg} rounded-full h-3 overflow-hidden`}>
                                                    <div 
                                                        className={`h-full rounded-full transition-all duration-1000 ${s.score < 60 ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]'}`}
                                                        style={{ width: `${s.score}%` }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
    
                            {/* Success Path */}
                            <Card theme={theme} className="shadow-md border-none">
                                 {/* ... same as your current SuccessPath content ... */}
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Helper Sub-component for small stat cards
function StatCard({ icon, title, value, sub, color, theme }) {
    return (
        <Card theme={theme} className="shadow-sm">
            <CardContent className="pt-6">
                <div className={`flex items-center mb-2 ${color}`}>
                    {icon}
                    <h3 className="ml-2 text-sm font-semibold uppercase tracking-wider opacity-70">{title}</h3>
                </div>
                <p className={`text-xl font-bold ${color}`}>{value || "N/A"}</p>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{sub}</p>
            </CardContent>
        </Card>
    );
}
