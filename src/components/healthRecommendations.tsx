import React from "react";
import { ShieldCheck, Sun, Leaf } from "lucide-react";

interface HealthProps {
  aqi?: number;
  uv?: number;
  pollen?: Array<{ type: string; index: number; risk: string }>;
}

function getAQIAdvice(aqi?: number) {
  if (aqi === undefined) return null;
  const aqiLevels = [
    { max: 1, level: "Good", color: "green", advice: "Air quality is good. Enjoy outdoor activities!", emoji: "🟢" },
    { max: 2, level: "Fair", color: "yellow", advice: "Air quality is fair. Sensitive individuals should take care.", emoji: "🟡" },
    { max: 3, level: "Moderate", color: "orange", advice: "Consider limiting prolonged outdoor exertion if sensitive.", emoji: "🟠" },
    { max: 4, level: "Poor", color: "red", advice: "Wear a mask outdoors. Avoid heavy exercise outside.", emoji: "🔴" },
    { max: 5, level: "Very Poor", color: "darkred", advice: "Stay indoors. Use air purifiers if possible.", emoji: "🟥" },
  ];
  const { level, color, advice, emoji } =
    aqiLevels.find((l) => aqi <= l.max) || aqiLevels[aqiLevels.length - 1];
  return {
    title: "Air Quality",
    level,
    color,
    advice,
    emoji,
    value: aqi,
    max: 5,
    icon: <ShieldCheck className={`inline h-5 w-5 text-${color}-500`} />,
  };
}

function getUVAdvice(uv?: number) {
  if (uv === undefined) return null;
  const uvLevels = [
    { max: 2.9, level: "Low", color: "green", advice: "Low UV. Minimal protection required.", emoji: "🟢" },
    { max: 5.9, level: "Moderate", color: "yellow", advice: "Moderate UV. Wear sunglasses and use SPF 30+.", emoji: "🟡" },
    { max: 7.9, level: "High", color: "orange", advice: "High UV. Use SPF 30+, wear hat, seek shade.", emoji: "🟠" },
    { max: 10.9, level: "Very High", color: "red", advice: "Very high UV. Minimize sun exposure 10am-4pm.", emoji: "🔴" },
  ];
  const { level, color, advice, emoji } =
    uvLevels.find((l) => uv <= l.max) || { level: "Extreme", color: "darkred", advice: "Avoid going out, cover up, use strong sunscreen.", emoji: "🟥" };
  return {
    title: "UV Index",
    level,
    color,
    advice,
    emoji,
    value: uv.toFixed(1),
    max: 11,
    icon: <Sun className={`inline h-5 w-5 text-${color}-500`} />,
  };
}

function getPollenAdvice(pollen?: Array<{ type: string; index: number; risk: string }>) {
  if (!pollen) return [];
  return pollen.map((p) => {
    let advice = "";
    let color = "green";
    let emoji = "🟢";
    if (p.risk === "high") {
      advice = `High ${p.type} pollen. Wear a mask, keep windows closed.`;
      color = "red";
      emoji = "🔴";
    } else if (p.risk === "moderate") {
      advice = `Moderate ${p.type} pollen. Sensitive individuals should limit outdoor time.`;
      color = "yellow";
      emoji = "🟡";
    } else {
      advice = `Low ${p.type} pollen. Minimal risk.`;
      color = "green";
      emoji = "🟢";
    }
    return {
      title: `${p.type.charAt(0).toUpperCase() + p.type.slice(1)} Pollen`,
      level: p.risk.charAt(0).toUpperCase() + p.risk.slice(1),
      color,
      advice,
      emoji,
      value: p.index,
      max: 3,
      icon: <Leaf className={`inline h-5 w-5 text-${color}-500`} />,
    };
  });
}

// Helper for rendering progress bar
const ProgressBar = ({ value, max, color }: { value: number; max: number; color: string }) => {
  const percent = Math.min((value / max) * 100, 100);
  const barColor = {
    green: "bg-green-400",
    yellow: "bg-yellow-400",
    orange: "bg-orange-400",
    red: "bg-red-500",
    darkred: "bg-red-800",
  }[color] || "bg-gray-300";
  return (
    <div className="h-2 w-full bg-gray-200 rounded">
      <div className={`h-2 rounded ${barColor}`} style={{ width: `${percent}%` }} />
    </div>
  );
};

const MetricCard: React.FC<{
  title: string;
  icon: React.ReactNode;
  level: string;
  emoji: string;
  value: string | number;
  advice: string;
  color: string;
  max: number;
}> = ({ title, icon, level, emoji, value, advice, color, max }) => {
  // Tailwind color class fallback
  const borderColor = {
    green: "border-green-400",
    yellow: "border-yellow-400",
    orange: "border-orange-400",
    red: "border-red-500",
    darkred: "border-red-800",
  }[color] || "border-gray-300";
  return (
    <div className={`rounded-lg border ${borderColor} bg-white dark:bg-gray-900 p-4 shadow space-y-3 flex flex-col`}>
      <div className="flex items-center gap-2">
        {icon}
        <span className="font-semibold">{title}</span>
        <span className="ml-2">{emoji} {level} ({value})</span>
      </div>
      <ProgressBar value={typeof value === "number" ? value : Number(value)} max={max} color={color} />
      <div className="">{advice}</div>
    </div>
  );
};

const HealthRecommendations: React.FC<HealthProps> = ({ aqi, uv, pollen }) => {
  const aqiAdvice = getAQIAdvice(aqi);
  const uvAdvice = getUVAdvice(uv);
  const pollenAdvice = getPollenAdvice(pollen);

  const recommendations = [
    ...(aqiAdvice ? [aqiAdvice] : []),
    ...(uvAdvice ? [uvAdvice] : []),
    ...pollenAdvice,
  ];

  if (!recommendations.length) return null;

  return (
    <div className="space-y-3">
      <h3 className="font-bold text-green-700 dark:text-green-300 text-lg sm:text-xl mb-2">
        Health Recommendations
      </h3>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {recommendations.map((rec, idx) => (
          <MetricCard key={idx} {...rec} />
        ))}
      </div>
    </div>
  );
};

export default HealthRecommendations;