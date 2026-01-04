import { useEffect, useState, useMemo } from "react";
import { 
    Loader2, Activity, Brain, Heart, Star, Compass, CircleAlert, 
    LayoutDashboardIcon, UserRound, BookOpen, Smile, Sun, Moon
} from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { RiskCard } from "../ui/riskCard";
import { useTheme, getThemeClasses } from "../contexts/ThemeContext"
import { getStudentDashboard } from "../services/api";


// --- MAIN DASHBOARD COMPONENT ---
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

    // 2. Dynamic Class Calculation
    const { bg, text, border, textSecondary, progressBarBg } = getThemeClasses(theme);
    
    // Calculated risk scores (Academic risk derived from skill scores)
    const academicRiskScore = useMemo(() => {
        if (!skills || skills.length === 0) return 0;
        const lowScoreCount = skills.filter(s => s.score < 60).length;
        return Math.min(100, lowScoreCount * (100 / skills.length) * 1.5); 
    }, [skills]);

    useEffect(() => {
        async function fetchData() {
            try {
                // call it once
                const dashboard = await getStudentDashboard(user.id);
        
                const {
                    profile,
                    skills,
                    learningStyle,
                    behavior,
                    emotions,
                    health,
                    successPath
                } = dashboard;
        
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
        <div className={`w-full min-h-screen ${bg} p-6 md:p-10 ${text} transition-colors duration-300 ml-14`}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
                body { font-family: 'Inter', sans-serif; }
            `}</style>
            
            <div className="max-w-7xl mx-auto">
                
                {/* Header */}
                <header className={`flex items-center pb-6 mb-6 border-b ${border}`}>
                    <div className="flex items-center">
                        <LayoutDashboardIcon className={`w-8 h-8 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
                        <h1 className="text-3xl font-extrabold pl-3">Student Dashboard</h1>
                    </div>
                </header>

                {/* Main Grid: 4 columns */}
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    
                    {/* Column 1: Profile & Risks (Spanning 3 rows) */}
                    <div className="md:col-span-1 flex flex-col gap-6">
                        
                        {/* Profile Card */}
                        <Card theme={theme} className="shadow-xl">
                            <CardContent>
                                <div className="flex items-center justify-center mb-6">
                                    <img
                                        src={profile?.profilePicUrl || defaultAvatar}
                                        alt="child avatar"
                                        className="w-24 h-24 object-cover rounded-full border-4 border-blue-500 shadow-md"
                                        onError={(e) => e.currentTarget.src = defaultAvatar}
                                    />
                                </div>
                                <div className="text-center">
                                    <h2 className="text-2xl font-bold mb-1">{profile?.name || "Child Profile"}</h2>
                                    <p className={`text-sm font-medium ${theme === 'dark' ? 'text-blue-300 bg-blue-900/40' : 'text-blue-600 bg-blue-50'} px-3 py-1 rounded-full inline-block`}>
                                        {profile?.grade || "N/A"}
                                    </p>
                                    <p className={`text-md ${textSecondary} mt-2`}>Age: {profile?.age}</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Risk Summary */}
                        <div className="flex flex-col gap-4">
                            <h3 className="text-xl font-semibold flex items-center gap-2">
                                <CircleAlert className="w-5 h-5 text-red-500" />
                                Risk Snapshot
                            </h3>
                            <RiskCard 
                                title="Academic Risk" 
                                riskData={{ risk_score: academicRiskScore, skills }} 
                                type="academic"
                                theme={theme}
                            />
                            <RiskCard 
                                title="Emotional Risk" 
                                riskData={{ ...emotions, risk_score: emotions?.risk_score, emotions }} 
                                type="emotional"
                                theme={theme}
                            />
                            <RiskCard 
                                title="Behavioral Trend" 
                                riskData={{ ...behavior, risk_score: behavior?.risk_score, behavior }} 
                                type="behavioral"
                                theme={theme}
                                className="mb-5"
                            />
                        </div>
                    </div>

                    {/* Column 2 & 3: Main Data Points */}
                    <div className="md:col-span-3 grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* Metric 1: Learning Style */}
                        <Card theme={theme} className="lg:col-span-1 shadow-md">
                            <CardContent>
                                <div className="flex items-center mb-4 text-indigo-500">
                                    <Brain className="w-6 h-6 mr-3" />
                                    <h3 className="text-lg font-semibold">Learning Style</h3>
                                </div>
                                {learningStyle ? (
                                    <>
                                        <p className="text-2xl font-extrabold text-indigo-400">{learningStyle.type}</p>
                                        <p className="text-sm ${textSecondary} mt-2">{learningStyle.description}</p>
                                    </>
                                ) : (<p className={textSecondary}>No data available</p>)}
                            </CardContent>
                        </Card>

                        {/* Metric 2: Emotional Health */}
                        <Card theme={theme} className="lg:col-span-1 shadow-md">
                            <CardContent>
                                <div className="flex items-center mb-4 text-red-500">
                                    <Smile className="w-6 h-6 mr-3" />
                                    <h3 className="text-lg font-semibold">Emotional State</h3>
                                </div>
                                {emotions ? (
                                    <>
                                        <p className="text-2xl font-extrabold text-red-400">{emotions?.mood}</p>
                                        <p className="text-sm ${textSecondary} mt-2">{emotions?.trendDescription}</p>
                                    </>
                                ) : (<p className={textSecondary}>No data available</p>)}
                            </CardContent>
                        </Card>

                        {/* Metric 3: Physical Health */}
                        <Card theme={theme} className="lg:col-span-1 shadow-md">
                            <CardContent>
                                <div className="flex items-center mb-4 text-green-500">
                                    <Heart className="w-6 h-6 mr-3" />
                                    <h3 className="text-lg font-semibold">Physical Health</h3>
                                </div>
                                {health ? (
                                    <>
                                        <p className="text-2xl font-extrabold text-green-400">{health?.physical}</p>
                                        <p className="text-sm ${textSecondary} mt-2">Sports score: {health?.score}</p>
                                    </>
                                ) : (<p className={textSecondary}>No data available</p>)}
                            </CardContent>
                        </Card>
                        
                        {/* Wide Card 1: Skills */}
                        <Card theme={theme} className="lg:col-span-2 shadow-md mb-5">
                            <CardContent>
                                <div className="flex items-center mb-4 text-yellow-500">
                                    <BookOpen className="w-6 h-6 mr-3" />
                                    <h3 className="text-lg font-semibold">Core Skills Proficiency</h3>
                                </div>
                                <div className="space-y-3">
                                    {skills?.length === 0 ? (
                                        <p className="text-sm text-gray-400 italic">
                                            Today's quiz is not taken.
                                        </p>
                                    ) : (
                                        skills.map((s, i) => (
                                            <div key={i}>
                                                <div className="flex justify-between items-center text-sm font-medium">
                                                    <span>{s.name} ({s.level})</span>
                                                    <span className={
                                                        `${s.score < 60 
                                                            ? 'text-red-400' 
                                                            : s.score < 80 
                                                                ? 'text-yellow-400' 
                                                                : 'text-green-400'
                                                        } font-bold`
                                                    }>
                                                        {s.score}%
                                                    </span>
                                                </div>
                                                
                                                <div className={`w-full ${progressBarBg} rounded-full h-2`}>
                                                    <div
                                                        className={`h-2 rounded-full transition-all duration-500 ${
                                                            s.score < 60
                                                                ? 'bg-red-500'
                                                                : s.score < 80
                                                                    ? 'bg-yellow-500'
                                                                    : 'bg-green-500'
                                                        }`}
                                                        style={{ width: `${s.score}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>

                            </CardContent>
                        </Card>
                        
                        {/* Wide Card 2: Success Path */}
                        <Card theme={theme} className="lg:col-span-1 shadow-md mb-5">
                            <CardContent className="h-full flex flex-col">
                                <div className="flex items-center mb-4 text-purple-500">
                                    <Compass className="w-6 h-6 mr-3" />
                                    <h3 className="text-lg font-semibold">Next Steps & Success Path</h3>
                                </div>
                                {successPath ? (
                                    <ul className={`list-decimal list-inside space-y-2 text-base flex-1 ${textSecondary}`}>
                                        {successPath.steps.map((s, i) => (
                                            <li key={i} className="pl-1">
                                                <span className="font-medium">{s}</span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (<p className={textSecondary}>No recommendations yet</p>)}
                            </CardContent>
                        </Card>
                        
                    </div>
                </div>
            </div>
        </div>
    );
}