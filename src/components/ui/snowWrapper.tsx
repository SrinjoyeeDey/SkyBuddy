const SnowWrapper = ({ children }: any) => {
  const snowflakes = Array.from({ length: 40 });

  return (
    <div className="relative overflow-hidden w-full h-full flex-1 bg-gradient-to-b from-[#f0f9ff] via-[#e0f7ff] to-[#ffffff]">
      <div className="absolute inset-0 pointer-events-none -z-10">
        {snowflakes.map((_, i) => {
          const left = Math.random() * 100;
          const delay = Math.random() * 5;
          const duration = 6 + Math.random() * 6;
          const size = 4 + Math.random() * 6;
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
