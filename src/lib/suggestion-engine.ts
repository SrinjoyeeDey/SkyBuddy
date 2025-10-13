// src/lib/suggestion-engine.ts

// 1. DEFINE THE TYPE for a single day's forecast.
export interface DailyForecast {
  dt: number;
  weather: {
    main: string;
    icon: string;
  }[];
}

const activityMap = {
    Clear: ['Go for a picnic 🧺', 'Plan a beach day 🏖️', 'Go for a hike 🌲'],
    Clouds: ['Good day for a jog 🏃‍♂️', 'Visit a local park', 'Go cycling 🚴‍♀️'],
    Rain: ['Perfect for a movie marathon 🎬', 'Visit a museum 🏛️', 'Read a book indoors 📚'],
    Snow: ['Build a snowman ⛄', 'Go skiing! ⛷️'],
    Thunderstorm: ['Stay indoors and stay safe!', 'Catch up on your favorite show 📺'],
    Drizzle: ['A great day to visit a cozy cafe ☕', 'Explore an indoor market'],
    // Add other conditions as needed
    Mist: ['Go for a mysterious walk in the park 🌫️', 'Perfect for photography'],
    Fog: ['Go for a mysterious walk in the park 🌫️', 'Perfect for photography'],
    Default: ['Enjoy your day!'],
  };
  
// This function will pick one random suggestion for a given day
export const getActivitySuggestion = (forecast: DailyForecast) => {
    const weatherCondition = forecast.weather[0].main;
    // @ts-ignore - Using ts-ignore here because activityMap keys are specific strings
    const suggestions = activityMap[weatherCondition] || activityMap.Default;
    return suggestions[Math.floor(Math.random() * suggestions.length)];
};