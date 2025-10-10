const SnowWrapper = ({ children }: any) => {
  // change this number to control density
  const snowflakes = Array.from({ length: 60 });

  return (
    <div className="relative w-full h-full flex-1 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none z-0">
        {snowflakes.map((_, i) => {
          const left = Math.random() * 100;
          const delay = -(Math.random() * 20);
          const duration = 8 + Math.random() * 14;
          const size = 4 + Math.random() * 12;
          const opacity = 0.45 + Math.random() * 0.55;
          const sway = Math.round((Math.random() * 40 - 20)); 

          return (
            <span
              key={i}
              className="snowflake absolute rounded-full"
              style={{
                left: `${left}%`,
                width: `${size}px`,
                height: `${size}px`,
                animationDelay: `${delay}s`,
                animationDuration: `${duration}s`,
                opacity,
                ["--sway" as any]: `${sway}px`,
              }}
            />
          );
        })}
      </div>

      <div className="relative z-10">{children}</div>
    </div>
  );
};

export default SnowWrapper;
