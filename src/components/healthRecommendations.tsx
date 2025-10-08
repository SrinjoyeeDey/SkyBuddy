import React from "react";
import { ShieldCheck, Sun, Leaf, AlertTriangle } from "lucide-react";

interface HealthProps {
  aqi?: number;
  uv?: number;
  pollen?: Array<{ type: string; index: number; risk: string }>;
}

function getAQIAdvice(aqi?: number) {
  if (aqi === undefined) return null;

  const aqiLevels = [
    { max: 1, level: "Good", color: "text-green-500", advice: "Air quality is good. Enjoy outdoor activities!", icon: ShieldCheck },
    { max: 2, level: "Fair", color: "text-yellow-500", advice: "Air quality is fair. Sensitive individuals should take care.", icon: ShieldCheck },
    { max: 3, level: "Moderate", color: "text-orange-500", advice: "Consider limiting prolonged outdoor exertion if sensitive.", icon: AlertTriangle },
    { max: 4, level: "Poor", color: "text-red-500", advice: "Wear a mask outdoors. Avoid heavy exercise outside.", icon: AlertTriangle },
    { max: 5, level: "Very Poor", color: "text-red-700", advice: "Stay indoors. Use air purifiers if possible.", icon: AlertTriangle },
  ];

  const { level, color, advice, icon: Icon } =
    aqiLevels.find((l) => aqi <= l.max) || aqiLevels[aqiLevels.length - 1];

  return {
    title: "Air Quality",
    level,
    color,
    advice,
    value: aqi,
    icon: <Icon className={`inline h-5 w-5 ${color}`} />,
  };
}

function getUVAdvice(uv?: number) {
  if (uv === undefined) return null;

  const uvLevels = [
    { max: 2.9, level: "Low", color: "text-green-500", advice: "Low UV. Minimal protection required." },
    { max: 5.9, level: "Moderate", color: "text-yellow-500", advice: "Moderate UV. Wear sunglasses and use SPF 30+ sunscreen." },
    { max: 7.9, level: "High", color: "text-orange-500", advice: "High UV. Use SPF 30+, wear a hat, and seek shade." },
    { max: 10.9, level: "Very High", color: "text-red-500", advice: "Very high UV. Minimize sun exposure between 10am-4pm." },
  ];

  const { level, color, advice } =
    uvLevels.find((l) => uv <= l.max) || { level: "Extreme", color: "text-red-700", advice: "Avoid going out, cover up, and use strong sunscreen." };

  return {
    title: "UV Index",
    level,
    color,
    advice,
    value: uv.toFixed(1),
    icon: <Sun className={`inline h-5 w-5 ${color}`} />,
  };
}

function getPollenAdvice(pollen?: Array<{ type: string; index: number; risk: string }>) {
  if (!pollen) return [];

  return pollen.map((p) => {
    let advice = "";
    let color = "text-green-500";

    if (p.risk === "high") {
      advice = `High ${p.type} pollen. Consider wearing a mask and keeping windows closed.`;
      color = "text-red-500";
    } else if (p.risk === "moderate") {
      advice = `Moderate ${p.type} pollen. Sensitive individuals should limit outdoor time.`;
      color = "text-yellow-500";
    } else {
      advice = `Low ${p.type} pollen. Minimal risk.`;
      color = "text-green-500";
    }

    return {
      title: `Pollen (${p.type})`,
      level: p.risk,
      color,
      advice,
      value: p.index,
      icon: <Leaf className={`inline h-5 w-5 ${color}`} />,
    };
  });
}

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
    <div
      className="rounded-lg border border-green-200 bg-green-50 dark:bg-green-950/60 p-4 sm:p-5 space-y-3"
      aria-label="Health Recommendations"
    >
      <h3 className="font-bold text-green-700 dark:text-green-300 text-lg sm:text-xl">
        Health Recommendations
      </h3>

      <ul className="space-y-2">
        {recommendations.map((rec, idx) => (
          <li
            key={idx}
            className="flex flex-col sm:flex-row sm:items-center sm:gap-2 text-green-900 dark:text-green-100 text-sm sm:text-base"
          >
            <div className="flex items-center gap-2">
              {rec.icon}
              <span className="font-semibold">
                {idx + 1}. {rec.title} ({rec.level}, {rec.value})
              </span>
            </div>
            <span className="sm:ml-1 text-green-900 dark:text-green-100">
              {rec.advice}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default HealthRecommendations;
