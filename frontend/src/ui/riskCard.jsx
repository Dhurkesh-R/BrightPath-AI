import { getThemeClasses } from "../contexts/ThemeContext"
import { Card, CardContent } from "./card";
import { CircleAlert } from "lucide-react";

// --- RISK MAPPING ---
const getRiskLevel = (score) => {
    if (score > 60) return { level: "High", color: "text-red-500", bg: "bg-red-900/20" };
    if (score > 30) return { level: "Moderate", color: "text-yellow-500", bg: "bg-yellow-900/20" };
    return { level: "Low", color: "text-green-500", bg: "bg-green-900/20" };
};


// --- RISK CARD COMPONENT ---
export const RiskCard = ({ title, riskData, type, theme, className }) => {
    const risk = getRiskLevel(riskData?.risk_score || 0);
    const { textSecondary } = getThemeClasses(theme);

    // Dynamic risk background based on theme
    const riskBgClass = theme === 'dark' ? risk.bg.replace('/20', '/30') : risk.bg.replace('900/20', '100');

    return (
        <Card theme={theme} className={`flex flex-col h-full border-2 ${className}`}>
            <CardContent className="flex-1">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">{title}</h3>
                    <CircleAlert className={`w-6 h-6 ${risk.color}`} />
                </div>
                
                <div className={`inline-flex items-center text-sm font-bold px-3 py-1.5 rounded-full ${risk.color} ${riskBgClass}`}>
                    {risk.level} Risk
                </div>
                
                <p className={`mt-3 text-sm ${textSecondary}`}>
                    {type === 'academic' && (riskData?.skills?.find(s => s.score < 50) ? `Key concern in ${riskData.skills.find(s => s.score < 50).name}. Immediate intervention needed.` : 'Overall academic standing is solid.')}
                    {type === 'emotional' && riskData?.emotions?.trendDescription}
                    {type === 'behavioral' && (riskData?.behavior?.traits.includes("Occasional distraction during long lectures.") ? 'Focus on attention span exercises during study periods.' : 'Behavior is within positive range.')}
                </p>
            </CardContent>
        </Card>
    );
};