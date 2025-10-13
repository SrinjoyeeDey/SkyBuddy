import React from "react";
import { useTheme } from "@/context/theme-provider";

const CloudWrapper = ({ children }: any) => {
  const { theme } = useTheme();
  const isLight = theme === "light";

  // increase for denser sky
  const clouds = Array.from({ length: 12 });

  return (
    <div className="relative w-full h-full flex-1 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none z-0">
        {clouds.map((_, i) => {
          const top = Math.random() * 80;
          const duration = 60 + Math.random() * 40;
          const delay = -Math.random() * duration; // ensures staggered continuous flow
          const scale = 0.6 + Math.random() * 1.2;
          const opacity = 0.35 + Math.random() * 0.25;

          return (
            <div
              key={i}
              className="cloud absolute"
              style={{
                top: `${top}%`,
                left: "-200px",
                animationDuration: `${duration}s`,
                animationDelay: `${delay}s`,
                opacity,
                transform: `scale(${scale})`,
                background: isLight ? "#d9d9d9" : "#b0b0b0",
              }}
            />
          );
        })}
      </div>

      <div className="relative z-10">{children}</div>
    </div>
  );
};

export default CloudWrapper;
