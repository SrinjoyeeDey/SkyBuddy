import React from 'react';

const SnowWrapper = ({ children }) => {
  const snowflakes = Array.from({ length: 40 }); // number of snowflakes

  return (
    <div className="relative overflow-hidden w-full h-full flex-1 bg-gradient-to-b from-[#f0f9ff] via-[#e0f7ff] to-[#ffffff]">
      <div className="absolute inset-0 pointer-events-none -z-10">
        {snowflakes.map((_, i) => {
          const left = Math.random() * 100; // random horizontal position
          const delay = Math.random() * 5; // random delay
          const duration = 6 + Math.random() * 6; // random duration for natural look
          const size = 4 + Math.random() * 6; // varying snowflake size
          const opacity = 0.4 + Math.random() * 0.6;

          return (
            <span
              key={i}
              className="absolute rounded-full bg-white opacity-80 animate-snow"
              style={{
                left: `${left}%`,
                width: `${size}px`,
                height: `${size}px`,
                animationDelay: `${delay}s`,
                animationDuration: `${duration}s`,
                opacity,
              }}
            />
          );
        })}
      </div>
      {children}
    </div>
  );
};

export default SnowWrapper;
