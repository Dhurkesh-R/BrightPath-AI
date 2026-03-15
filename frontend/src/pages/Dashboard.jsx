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
    const { theme, _, t } = useTheme()
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState(null);
    const [skills, setSkills] = useState([]);
    const [learningStyle, setLearningStyle] = useState(null);
    const [behavior, setBehavior] = useState(null);
    const [emotions, setEmotions] = useState(null);
    const [health, setHealth] = useState(null);
    const [successPath, setSuccessPath] = useState(null);
    const user = JSON.parse(localStorage.getItem("user"))

    const { bg, text, border, textSecondary, progressBarBg } = getThemeClasses(theme);
    
    const academicRiskScore = useMemo(() => {
        if (!skills || skills.length === 0) return 0;
        const lowScoreCount = skills.filter(s => s.score < 60).length;
        return Math.min(100, lowScoreCount * (100 / skills.length) * 1.5); 
    }, [skills]);

    useEffect(() => {
        async function fetchData() {
            try {
                const dashboard = await getStudentDashboard(user.id);
                const { profile, skills, learningStyle, behavior, emotions, health, successPath } = dashboard;
        
                setProfile(profile);
                setSkills(skills);
                setLearningStyle(learningStyle);
                setBehavior(behavior);
                setEmotions(emotions);
                setHealth(health);
                setSuccessPath(successPath);
            } catch (err) {
                console.error("Error loading dashboard:", err);
            } finally {
                setLoading(false);
            }
        }        
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className={`flex items-center justify-center h-screen ${bg} ${textSecondary} w-full`}>
                <Loader2 className="animate-spin mr-2 w-6 h-6 text-blue-500" /> 
                <span className="text-lg">Loading comprehensive student data...</span>
            </div>
        );
    }

    const defaultAvatar = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMTIiIGhlaWdodD0iMTEyIiB2aWV3Qm94PSIwIDAgMTI4IDEyOCI+PHJlY3Qgd2lkdGg9IjEyOCIgaGVpZ2h0PSIxMjgiIHI9IjY0IiBmaWxsPSIjZWRlZGVkIi8+PHBhdGggZD0iTTc3LjQgMzkuOGExMy43IDEzLjcgMCAxIDAgLTE3LjMgMGwxLjYgNDMuNEg3NS44eiIgc3R5bGU9ImZpbGw6IzY2Njc3YSIgLz48Y2lyY2xlIGN4PSI2NCIgY3k9IjM5LjgiIHI9IjEzLjciIHN0eWxlPSJmaWxsOiMyYWFlOTMiIC8+PHBhdGggZD0iTTExNS42IDExNS41YzAgLTI2LjMtMjEuMy00Ny42LTQ3LjYtNDcuNlM0My4zIDg5LjIgNDMuMyAxMTUuNnoiIHN0eWxlPSJmaWxsOiMzYjhkZjIifSAvPjwvc3ZnPg==";

return (
        <div className={`min-h-screen ${bg} md:p-10 ${text} transition-colors duration-300 md:ml-16 w-full md:w-[calc(100%-4rem)]`}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
                body { font-family: 'Inter', sans-serif; }
            `}</style>
            
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <header className={`flex items-center pb-6 mb-6 border-b ${border} md:relative fixed md:transparent ${bg} md:w-auto w-full top-4`}>
                    <div className="flex items-center">
                        <div className="w-12 h-10 md:hidden" />
                        <LayoutDashboardIcon className={`w-8 h-8 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
                        <h1 className="text-3xl font-extrabold pl-3">Dashboard</h1>
                    </div>
                </header>

                {/* FIXED GRID ALIGNMENT */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start md:mt-0 mt-6">
                    
                    {/* LEFT Column: Profile & Risks */}
                    <div className="lg:col-span-1 space-y-6">
                        <Card theme={theme} className="shadow-xl">
                            <CardContent className="pt-6">
                                <div className="flex flex-col items-center text-center">
                                    <img
                                        src={profile?.profilePicUrl || defaultAvatar}
                                        alt="avatar"
                                        className="w-24 h-24 object-cover rounded-full border-4 border-blue-500 shadow-md mb-4"
                                    />
                                    <h2 className="text-2xl font-bold mb-1">{profile?.name || "Student"}</h2>
                                    <p className={`text-sm font-medium ${theme === 'dark' ? 'text-blue-300 bg-blue-900/40' : 'text-blue-600 bg-blue-50'} px-3 py-1 rounded-full inline-block`}>
                                        Grade {profile?.grade || "N/A"}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="space-y-4">
                            <h3 className="text-xl font-semibold flex items-center gap-2 px-1">
                                <CircleAlert className="w-5 h-5 text-red-500" />
                                Risk Snapshot
                            </h3>
                            <RiskCard title="Academic" riskData={{ risk_score: academicRiskScore, skills }} type="academic" theme={theme} />
                            <RiskCard title="Emotional" riskData={{ ...emotions, risk_score: emotions?.risk_score }} type="emotional" theme={theme} />
                            <RiskCard title="Behavioral" riskData={{ ...behavior, risk_score: behavior?.risk_score }} type="behavioral" theme={theme} />
                        </div>
                    </div>

                    {/* RIGHT Column: Metrics & Success Path */}
                    <div className="lg:col-span-3 flex flex-col gap-6">
                        
                        {/* Top Stats Row - Always 3 columns on big screens */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <Card theme={theme} className="shadow-md">
                                <CardContent className="pt-6">
                                    <div className="flex items-center mb-2 text-indigo-500"><Brain className="w-5 h-5 mr-2"/> <span className="text-sm font-bold uppercase">Learning</span></div>
                                    <p className="text-xl font-extrabold text-indigo-400">{learningStyle?.type || "N/A"}</p>
                                    <p className={`text-xs ${textSecondary} mt-1`}>{learningStyle?.description}</p>
                                </CardContent>
                            </Card>
                            <Card theme={theme} className="shadow-md">
                                <CardContent className="pt-6">
                                    <div className="flex items-center mb-2 text-red-500"><Smile className="w-5 h-5 mr-2"/> <span className="text-sm font-bold uppercase">Mood</span></div>
                                    <p className="text-xl font-extrabold text-red-400">{emotions?.mood || "N/A"}</p>
                                    <p className={`text-xs ${textSecondary} mt-1`}>{emotions?.trendDescription}</p>
                                </CardContent>
                            </Card>
                            <Card theme={theme} className="shadow-md">
                                <CardContent className="pt-6">
                                    <div className="flex items-center mb-2 text-green-500"><Heart className="w-5 h-5 mr-2"/> <span className="text-sm font-bold uppercase">Physical</span></div>
                                    <p className="text-xl font-extrabold text-green-400">{health?.physical || "N/A"}</p>
                                    <p className={`text-xs ${textSecondary} mt-1`}>Score: {health?.score}</p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Skills and Roadmap Row */}
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-stretch">
                            <Card theme={theme} className="shadow-md">
                                <CardContent className="pt-6">
                                    <div className="flex items-center mb-6 text-yellow-500">
                                        <BookOpen className="w-6 h-6 mr-3" />
                                        <h3 className="text-lg font-semibold">Core Skills</h3>
                                    </div>
                                    <div className="space-y-4">
                                        {skills?.map((s, i) => (
                                            <div key={i} className="space-y-1">
                                                <div className="flex justify-between text-sm font-medium">
                                                    <span>{s.name}</span>
                                                    <span>{s.score}%</span>
                                                </div>
                                                <div className={`w-full ${progressBarBg} rounded-full h-2`}>
                                                    <div className={`h-2 rounded-full transition-all duration-500 ${s.score < 60 ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: `${s.score}%` }}></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card theme={theme} className="shadow-md">
                                <CardContent className="pt-6">
                                    <div className="flex items-center mb-4 text-purple-500">
                                        <Compass className="w-6 h-6 mr-3" />
                                        <h3 className="text-lg font-semibold">Success Path</h3>
                                    </div>
                                    <ul className="space-y-3">
                                        {successPath?.steps.map((step, i) => (
                                            <li key={i} className="flex gap-2 items-start text-sm">
                                                <span className="text-purple-500 font-bold">{i+1}.</span>
                                                <span className={textSecondary}>{step}</span>
                                            </li>
                                        ))}
                                    </ul>
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
