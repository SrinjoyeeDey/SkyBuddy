import React from "react";
import type { ForecastData, WeatherData } from "@/api/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { Umbrella, Sun, Wind, Thermometer, Snowflake, Cloud, Clock } from "lucide-react";

type Props = {
  weather: WeatherData;
  forecast?: ForecastData | null;
  aqi?: number | null;
  uv?: number | null;
};

function hasPrecip(desc: string) {
  const d = desc.toLowerCase();
  return d.includes("rain") || d.includes("drizzle") || d.includes("thunder") || d.includes("storm");
}

function isSnow(desc: string) {
  return desc.toLowerCase().includes("snow");
}

function tempBand(t: number) {
  if (t <= 0) return "freezing";
  if (t <= 10) return "cold";
  if (t <= 18) return "cool";
  if (t <= 24) return "mild";
  if (t <= 30) return "warm";
  return "hot";
}

function buildWearSuggestions(weather: WeatherData, aqi?: number | null, uv?: number | null) {
  const { main, wind } = weather;
  const desc = weather.weather?.[0]?.description ?? "";
  const t = Math.round(main?.temp ?? 0);
  const band = tempBand(t);
  const items: Array<{ icon: React.ReactNode; label: string; reason?: string }> = [];

  // Base clothing by temperature
  if (band === "freezing") {
    items.push({ icon: <Thermometer className="h-4 w-4 text-blue-500" />, label: "Heavy coat, gloves, scarf", reason: "Freezing temps" });
  } else if (band === "cold") {
    items.push({ icon: <Thermometer className="h-4 w-4 text-blue-500" />, label: "Coat or insulated jacket", reason: "Cold weather" });
  } else if (band === "cool") {
    items.push({ icon: <Thermometer className="h-4 w-4 text-sky-500" />, label: "Light jacket or hoodie", reason: "Cool breeze" });
  } else if (band === "mild") {
    items.push({ icon: <Thermometer className="h-4 w-4 text-emerald-500" />, label: "T‑shirt + light layer", reason: "Comfortable" });
  } else if (band === "warm") {
    items.push({ icon: <Thermometer className="h-4 w-4 text-orange-500" />, label: "Light, breathable clothes", reason: "Warm temps" });
  } else {
    items.push({ icon: <Thermometer className="h-4 w-4 text-red-500" />, label: "Very light, breathable, hydrate", reason: "Hot weather" });
  }

  // Precipitation
  if (hasPrecip(desc)) {
    items.push({ icon: <Umbrella className="h-4 w-4 text-blue-600" />, label: "Umbrella / rain jacket", reason: "Rain expected" });
  }
  if (isSnow(desc)) {
    items.push({ icon: <Snowflake className="h-4 w-4 text-cyan-400" />, label: "Thermals, boots", reason: "Snowy conditions" });
  }

  // UV
  if ((uv ?? 0) >= 6) {
    items.push({ icon: <Sun className="h-4 w-4 text-yellow-500" />, label: "SPF 30+, hat & sunglasses", reason: "High UV" });
  }

  // Wind
  if ((wind?.speed ?? 0) >= 8) {
    items.push({ icon: <Wind className="h-4 w-4 text-sky-600" />, label: "Windbreaker", reason: "Gusty winds" });
  }

  // Air quality
  if ((aqi ?? 0) >= 4) {
    items.push({ icon: <Cloud className="h-4 w-4 text-gray-500" />, label: "Mask (outdoors)", reason: "Poor AQI" });
  }

  return { temp: t, description: desc, items };
}

type Scored = { dt: number; temp: number; desc: string; score: number };

function scoreForecastSlot(dt: number, temp: number, desc: string, wind: number, uv?: number | null): number {
  let score = 1.0;
  // Ideal temperature around 22C
  const tempScore = Math.max(0, 1 - Math.abs(temp - 22) / 20);
  score *= 0.6 + 0.4 * tempScore;
  // Penalties
  if (hasPrecip(desc) || isSnow(desc)) score *= 0.6;
  if (wind > 8) score *= 0.85;

  const hour = new Date(dt * 1000).getHours();
  // Mild bonus for morning/evening
  if ((hour >= 6 && hour <= 10) || (hour >= 17 && hour <= 20)) score *= 1.05;
  // UV rough penalty midday if currently high
  if ((uv ?? 0) >= 7 && hour >= 11 && hour <= 15) score *= 0.85;
  return score;
}

function findBestOutdoorTimes(forecast?: ForecastData | null, uv?: number | null): Scored[] {
  if (!forecast?.list?.length) return [];
  const next = forecast.list.slice(0, 8); // next ~24h (3h steps)
  const scored: Scored[] = next.map((slot) => {
    const temp = Math.round(slot.main.temp);
    const desc = slot.weather?.[0]?.description ?? "";
    const score = scoreForecastSlot(slot.dt, temp, desc, slot.wind?.speed ?? 0, uv);
    return { dt: slot.dt, temp, desc, score };
  });
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
}

function buildActivitySuggestions(current: WeatherData, aqi?: number | null) {
  const t = Math.round(current.main.temp);
  const desc = current.weather?.[0]?.main?.toLowerCase() || "";
  const windy = (current.wind?.speed ?? 0) > 8;
  const badAir = (aqi ?? 0) >= 4;
  const ideas: { title: string; why: string }[] = [];

  if (badAir) {
    ideas.push({ title: "Indoor yoga or gym", why: "Poor air quality outside" });
  }

  if (desc.includes("clear") || desc.includes("cloud")) {
    if (t >= 15 && t <= 28) {
      ideas.push({ title: "Jogging or brisk walk", why: "Comfortable temps and clear skies" });
      ideas.push({ title: "Picnic or casual outdoor hangout", why: "Mild and pleasant" });
    }
  }

  if (hasPrecip(desc)) {
    ideas.push({ title: "Museum or café visit", why: "Stay dry during rain" });
  }

  if (isSnow(desc) || t < 5) {
    ideas.push({ title: "Cozy indoor activities", why: "Very cold outside" });
  }

  if (t > 30) {
    ideas.push({ title: "Early-morning walk or indoor swim", why: "Beat the heat" });
  }

  if (windy) {
    ideas.push({ title: "Light wind-friendly stroll", why: "Gusty conditions—avoid strenuous outdoor workouts" });
  }

  // Deduplicate by title and keep top 3
  const seen = new Set<string>();
  return ideas.filter((i) => (seen.has(i.title) ? false : (seen.add(i.title), true))).slice(0, 3);
}

const PersonalizedRecommendations: React.FC<Props> = ({ weather, forecast, aqi, uv }) => {
  if (!weather) return null;

  const wear = buildWearSuggestions(weather, aqi, uv);
  const bestTimes = findBestOutdoorTimes(forecast, uv);
  const activities = buildActivitySuggestions(weather, aqi);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Personalized Recommendations</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-3">
          {/* Wear & carry */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-muted-foreground">What to wear or carry</h3>
            <ul className="space-y-2">
              {wear.items.map((it, i) => (
                <li key={i} className="flex items-start gap-2">
                  <div className="mt-0.5">{it.icon}</div>
                  <div>
                    <p className="text-sm font-medium">{it.label}</p>
                    {it.reason && <p className="text-xs text-muted-foreground">{it.reason}</p>}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Best outdoor times */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-muted-foreground">Best times to be outside (next 24h)</h3>
            {bestTimes.length === 0 ? (
              <p className="text-sm text-muted-foreground">No forecast data available.</p>
            ) : (
              <div className="space-y-2">
                {bestTimes.map((t) => (
                  <div key={t.dt} className="flex items-center justify-between rounded-lg border p-3">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-blue-500" />
                      <div>
                        <p className="text-sm font-medium">{format(new Date(t.dt * 1000), "EEE, h a")}</p>
                        <p className="text-xs text-muted-foreground capitalize">{t.desc || "Good conditions"}</p>
                      </div>
                    </div>
                    <span className="text-sm font-semibold">{t.temp}°</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Suggested activities */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-muted-foreground">Suggested activities</h3>
            {activities.length === 0 ? (
              <p className="text-sm text-muted-foreground">We’ll suggest activities when conditions improve.</p>
            ) : (
              <ul className="space-y-2">
                {activities.map((a, idx) => (
                  <li key={idx} className="rounded-lg border p-3">
                    <p className="text-sm font-medium">{a.title}</p>
                    <p className="text-xs text-muted-foreground">{a.why}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PersonalizedRecommendations;
