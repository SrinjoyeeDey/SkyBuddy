import { useState, useEffect, useRef } from "react";
import { MessageCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { weatherAPI } from "@/api/weather"; // your frontend weather API module

interface ChatBotProps {
  weatherData: any; // current location weather
  forecastData: any; // current location forecast
}

const ChatBot: React.FC<ChatBotProps> = ({ weatherData, forecastData }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([{ sender: "bot", text: "Hi! I’m SkyBuddy, your weather assistant ☀️" }]);
  const [input, setInput] = useState("");

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = { sender: "user", text: input };
    const loadingMsg = { sender: "bot", text: "Fetching response..." };
    setMessages((prev) => [...prev, userMsg, loadingMsg]);
    setInput("");

    try {
      // Try to detect city name from user query (e.g. “weather in Paris”)
      const cityMatch = input.match(/in\s+([a-zA-Z\s]+)/i);
      const cityName = cityMatch ? cityMatch[1].trim() : null;

      let weatherJSON = weatherData;
      let forecastJSON = forecastData;
      let locationName = weatherData?.name ?? "current location";

      if (cityName) {
        const locs = await weatherAPI.searchLocations(cityName);
        if (!locs || locs.length === 0) {
          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = {
              sender: "bot",
              text: `Sorry, I couldn't find weather data for "${cityName}".`,
            };
            return updated;
          });
          return;
        }

        const { lat, lon, name } = locs[0];
        locationName = name;
        weatherJSON = await weatherAPI.getCurrentWeather({ lat, lon });
        try {
          forecastJSON = await weatherAPI.getForecast({ lat, lon });
        } catch {
          forecastJSON = forecastJSON ?? null;
        }
      }

      // 🧠 Build final prompt HERE in frontend
      const prompt = `
You are SkyBuddy, a friendly and conversational weather chatbot.

Use the following data to answer user questions:
Location: ${locationName}
Current Weather: ${JSON.stringify(weatherJSON)}
Forecast: ${JSON.stringify(forecastJSON)}

Guidelines:
- If the user says "hi", "hello", "hey", "who are you", or similar greetings, respond briefly with a friendly introduction (e.g., "Hi! I'm SkyBuddy, your friendly weather assistant.").
- If the user asks about the weather, forecast, temperature, or outdoor suggestions, respond naturally using the provided data.
- Keep answers short, warm, and human-like — avoid repeating your name unless greeting.
- Answer only questions related to the weather, temperature, forecasts, or outdoor activity suggestions (for example, whether it’s a good time for a walk, picnic, or what kind of music might fit the weather mood).
- ⚠️ IMPORTANT: Respond in plain text only. Do NOT use Markdown, HTML, or any special formatting. Just write normal sentences.
User asked: "${input}"
      `;
      // Send the full prompt as `query` to backend
      const url = BACKEND_URL ? `${BACKEND_URL}/api/chat` : `/api/chat`;
      const botRes = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: prompt }),
      });

      const json = await botRes.json();

      // Replace “Fetching response...” with bot reply
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          sender: "bot",
          text: json.reply || "Sorry, I couldn’t get that.",
        };
        return updated;
      });
    } catch (err) {
      console.error("Chat error:", err);
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          sender: "bot",
          text: "⚠️ Something went wrong. Try again.",
        };
        return updated;
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-20 right-2 z-50 flex flex-col items-end">
      {!isOpen && (
        <Button size="iconLg" variant="default" onClick={() => setIsOpen(true)} className="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-4 shadow-lg transition-transform hover:scale-105 flex items-center justify-center">
          <MessageCircle size={50} />
        </Button>
      )}

      {isOpen && (
        <div className="bg-gray-100 dark:bg-gray-900 rounded-2xl shadow-2xl w-80 sm:w-96 h-[26rem] flex flex-col">
          <div className="flex justify-between items-center p-3 border-b border-border">
            <h2 className="font-semibold">SkyBuddy Chat</h2>
            <Button size="icon" variant="ghost" onClick={() => setIsOpen(false)} aria-label="Close Chatbot">
              <X size={18} />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {messages.map((msg, i) => (
              <div key={i} className={`p-2 rounded-xl text-sm ${msg.sender === "user" ? "bg-blue-500 text-white ml-auto w-fit" : "bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-white mr-auto w-fit"}`}>
                {msg.text}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-3 border-t dark:border-gray-700 flex gap-2">
            <Input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown} placeholder="Ask SkyBuddy something..." />
            <Button onClick={handleSend} variant="default" className="bg-blue-500 hover:bg-blue-600 text-white dark:bg-blue-600 dark:hover:bg-blue-700">
              Send
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBot;
