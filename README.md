# SkyBuddy ☁🌦

[![React](https://img.shields.io/badge/React-19.1.1-61dafb?logo=react&style=flat-square)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-7.1.7-646cff?logo=vite&style=flat-square)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.1.13-38bdf8?logo=tailwindcss&style=flat-square)](https://tailwindcss.com/)
[![OpenWeatherMap](https://img.shields.io/badge/API-OpenWeatherMap-orange?style=flat-square)](https://openweathermap.org/)

---



<p align="center">
  <img src="public/cloud.svg" alt="SkyBuddy Logo" width="180" />
</p>

> *SkyBuddy* is your beautiful, lightning-fast, and feature-rich weather dashboard. Get real-time weather, forecasts, and more—right at your fingertips!

---

## ✨ Features

### 🌍 *Location-based Weather*
- Instantly fetches your local weather using browser geolocation.
- Handles permission errors gracefully with helpful prompts.
  
<img width="1822" height="882" alt="image" src="https://github.com/user-attachments/assets/d4ff52c2-051c-492a-ad6a-6c68e43ef401" />

### 🔍 *City Search & Suggestions*
- Search any city worldwide with instant suggestions.
- Recent searches and favorites for quick access.
  
  <img width="862" height="543" alt="Screenshot 2025-09-28 101328" src="https://github.com/user-attachments/assets/87104af3-9a06-4df8-ada1-0fd138b650a2" />

### ⭐ *Favorites*
- Save your favorite cities for one-click weather checks.
- Remove favorites with a single tap.

  <img width="582" height="142" alt="image" src="https://github.com/user-attachments/assets/4e7b31ec-40d7-421b-9c86-66a5a2410dca" />


### 📊 *Detailed Weather Dashboard*
- Current weather: temperature, feels like, min/max, humidity, wind, and more.
- Beautiful weather icons and descriptions.

<img width="1719" height="727" alt="Screenshot 2025-09-28 101544" src="https://github.com/user-attachments/assets/63361e03-836b-4c7a-8395-68cdd2e91d14" />


### ⏰ *Hourly & 5-Day Forecasts*
- Interactive hourly temperature chart (Recharts powered).
- 5-day forecast with min/max, humidity, wind, and weather icons.
  
<img width="1737" height="449" alt="Screenshot 2025-09-28 101158" src="https://github.com/user-attachments/assets/ea5487cb-1882-45bc-82ab-449fa5352561" />

### 🎨 *Modern UI & Animations*
- Responsive, mobile-friendly design with Tailwind CSS.
- Smooth skeleton loaders and animated transitions.
- Dark/light mode toggle.
  

### ⚡ *Performance & Tech*
- Built with React 19, Vite, TypeScript, and Tailwind CSS.
- Uses React Query for blazing-fast, cached API calls.
- Modular, maintainable codebase.

---

## 🚀 Getting Started

1. *Clone the repo:*
   sh
   git clone https://github.com/yourusername/skybuddy.git
   cd skybuddy
   
2. *Install dependencies:*
   sh
   npm install
   
3. *Set up your OpenWeatherMap API key:*
   - Copy .env.example to .env and add your API key.

4. *(Optional)Set up Google Calendar Integration*

To test or work on the Personal Planner feature, you will need a Google OAuth Client ID.
How to get your Google OAuth Client ID? Follow the steps below
```
1. Go to the Google Cloud Console and create a new project.
2. Enable the Google Calendar API in the "Library" section.
3. Go to "Credentials" and create a new OAuth 2.0 Client ID for a Web application.
4. Add http://localhost:5173 and http://127.0.0.1:5173 (or your local dev port) as "Authorized JavaScript origins".
5. Copy the generated Client ID and paste it into your .env file as the value for VITE_GOOGLE_CLIENT_ID.
```

5. *Run the app:*
   sh
   npm run dev
   

---

## 📸 Screenshots & Animations



![skyBuddy-preview](https://github.com/user-attachments/assets/088c90b4-837e-4f26-b509-7e842d790ad9)

---

## 🛠 Tech Stack
- *React 19*
- *Vite*
- *TypeScript*
- *Tailwind CSS*
- *React Query*
- *Recharts*
- *OpenWeatherMap API*

---

## 🤝 Contributing
Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.


<p align="center">
  <img src="public/cloud.svg" alt="SkyBuddy Logo" width="100" />
</p>
