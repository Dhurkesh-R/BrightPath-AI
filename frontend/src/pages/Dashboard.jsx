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
        // FIX 1: Responsive Margin (ml-0 on mobile, ml-14 on desktop to accommodate sidebar)
        <div className={`w-full min-h-screen ${bg} p-4 md:p-8 ${text} transition-colors duration-300 ml-0 md:ml-14`}>
            <div className="max-w-7xl mx-auto">
                
                {/* Header - Stacked on mobile, row on desktop */}
                <header className={`flex flex-col md:flex-row md:items-center justify-between pb-6 mb-6 border-b ${border} gap-4`}>
                    <div className="flex items-center">
                        <LayoutDashboardIcon className={`w-7 h-7 md:w-8 md:h-8 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
                        <h1 className="text-2xl md:text-3xl font-extrabold pl-3">Student Dashboard</h1>
                    </div>
                    {/* Optional: Add a date or "Welcome back" here for mobile filler */}
                </header>

                {/* Main Content Grid */}
                {/* FIX 2: Changed from rigid grid to responsive grid-cols-1 */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    
                    {/* LEFT COLUMN: Profile & Risks */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Profile Card */}
                        <Card theme={theme} className="shadow-lg">
                            <CardContent className="pt-6">
                                <div className="flex flex-row lg:flex-col items-center gap-4 lg:gap-0">
                                    <img
                                        src={profile?.profilePicUrl || defaultAvatar}
                                        alt="avatar"
                                        className="w-20 h-20 lg:w-24 lg:h-24 object-cover rounded-full border-4 border-blue-500 shadow-md"
                                        onError={(e) => e.currentTarget.src = defaultAvatar}
                                    />
                                    <div className="text-left lg:text-center lg:mt-4">
                                        <h2 className="text-xl font-bold">{profile?.name || "Student"}</h2>
                                        <span className={`text-xs font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-blue-300' : 'text-blue-600'}`}>
                                            Grade {profile?.grade || "N/A"}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Risk Snapshot - Becomes horizontal scroll or stack on mobile */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold flex items-center gap-2 px-1">
                                <CircleAlert className="w-5 h-5 text-red-500" />
                                Critical Insights
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-1 gap-4">
                                <RiskCard title="Academic" riskData={{ risk_score: academicRiskScore, skills }} type="academic" theme={theme} />
                                <RiskCard title="Emotional" riskData={{ ...emotions, risk_score: emotions?.risk_score }} type="emotional" theme={theme} />
                                <RiskCard title="Behavioral" riskData={{ ...behavior, risk_score: behavior?.risk_score }} type="behavioral" theme={theme} />
                            </div>
                        </div>
                    </div>

                    {/* RIGHT CONTENT AREA: Stats & Success Path */}
                    <div className="lg:col-span-3 space-y-6">
                        {/* Top Stats Row: Learning Style, Emotion, Health */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <StatCard icon={<Brain/>} title="Learning Style" value={learningStyle?.type} sub={learningStyle?.description} color="text-indigo-400" theme={theme} />
                            <StatCard icon={<Smile/>} title="Mood" value={emotions?.mood} sub={emotions?.trendDescription} color="text-red-400" theme={theme} />
                            <StatCard icon={<Heart/>} title="Physical" value={health?.physical} sub={`Score: ${health?.score}`} color="text-green-400" theme={theme} />
                        </div>

                        {/* Skills and Success Path */}
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                            {/* Skills Card */}
                            <Card theme={theme} className="shadow-md">
                                <CardContent className="pt-6">
                                    <div className="flex items-center mb-6 text-yellow-500">
                                        <BookOpen className="w-6 h-6 mr-3" />
                                        <h3 className="text-lg font-semibold">Skills Proficiency</h3>
                                    </div>
                                    <div className="space-y-5">
                                        {skills?.length > 0 ? skills.map((s, i) => (
                                            <div key={i} className="space-y-2">
                                                <div className="flex justify-between text-sm">
                                                    <span className="font-medium">{s.name}</span>
                                                    <span className="font-bold">{s.score}%</span>
                                                </div>
                                                <div className={`w-full ${progressBarBg} rounded-full h-2`}>
                                                    <div 
                                                        className={`h-2 rounded-full transition-all duration-1000 ${s.score < 60 ? 'bg-red-500' : s.score < 80 ? 'bg-yellow-500' : 'bg-green-500'}`}
                                                        style={{ width: `${s.score}%` }}
                                                    />
                                                </div>
                                            </div>
                                        )) : <p className="text-gray-500 italic">No skill data recorded.</p>}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Success Path Card */}
                            <Card theme={theme} className="shadow-md">
                                <CardContent className="pt-6">
                                    <div className="flex items-center mb-4 text-purple-500">
                                        <Compass className="w-6 h-6 mr-3" />
                                        <h3 className="text-lg font-semibold">Success Roadmap</h3>
                                    </div>
                                    {successPath ? (
                                        <ul className="space-y-4">
                                            {successPath.steps.map((step, i) => (
                                                <li key={i} className="flex gap-3 items-start">
                                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-500/20 text-purple-500 flex items-center justify-center text-xs font-bold">
                                                        {i + 1}
                                                    </span>
                                                    <p className={`${textSecondary} text-sm leading-relaxed`}>{step}</p>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : <p className={textSecondary}>Generating your path...</p>}
                                </CardContent>
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
