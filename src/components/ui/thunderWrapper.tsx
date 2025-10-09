import React, { useEffect, useState } from "react";

type Props = {
  children: React.ReactNode;
  // optional: tweak intensity (number of drops) and darkness
  intensity?: number; // default 70
  darkness?: number; // 0..1 opacity of the dark cloud overlay
};

const ThunderWrapper: React.FC<Props> = ({
  children,
  intensity = 70,
  darkness = 0.55,
}) => {
  const drops = Array.from({ length: intensity });

  // lightning state toggles the flash + bolt + brief shake of children
  const [lightning, setLightning] = useState(false);
  const [boltKey, setBoltKey] = useState(0);
  const [boltPos, setBoltPos] = useState({ left: "50%", top: "5%", scale: 1 });

  useEffect(() => {
    let alive = true;
    let timer: number | undefined;

    function scheduleNextLightning() {
      if (!alive) return;
      // random between 2s and 12s (you can tweak)
      const wait = 1500; // 1500ms = 1.5s between lightning events
      timer = window.setTimeout(() => {
        if (!alive) return;
        // position bolt randomly near top
        const left = Math.random() * 75 + 10; // 10% - 85%
        const top = Math.random() * 18 - 2; // around top -2%..16%
        const scale = Math.random() * 0.6 + 0.8; // 0.8 - 1.4
        setBoltPos({ left: `${left}%`, top: `${top}%`, scale });
        setBoltKey((k) => k + 1);
        // quick multi-flash to feel realistic
        setLightning(true);
        // sequence of flashes (200ms, 80ms, 220ms) to feel like real lightning
        setTimeout(() => setLightning(false), 200);
        setTimeout(() => setLightning(true), 300);
        setTimeout(() => setLightning(false), 380);
        setTimeout(() => setLightning(true), 550);
        setTimeout(() => setLightning(false), 760);
        scheduleNextLightning();
      }, wait);
    }

    scheduleNextLightning();
    return () => {
      alive = false;
      if (timer) clearTimeout(timer);
    };
  }, []);

  return (
    <div className="relative overflow-hidden w-full h-full flex-1">
      {/* background clouds + dark overlay */}
      <div
        className="absolute inset-0 -z-20 bg-gradient-to-b from-[#0b1220] via-[#0b1630] to-[#122033]"
        aria-hidden
      />

      {/* subtle dark overlay to tune storm darkness */}
      <div
        className="absolute inset-0 -z-10 pointer-events-none"
        style={{ background: `rgba(6, 10, 18, ${darkness})` }}
      />

      {/* rain layer */}
      <div className="absolute inset-0 pointer-events-none -z-5">
        {drops.map((_, i) => {
          // produce random values per drop for natural look
          const left = Math.random() * 100;
          const delay = Math.random() * 3; // seconds
          const duration = 0.9 + Math.random() * 1.6; // fall speed
          const length = 60 + Math.random() * 140; // px length of drop streak
          const opacity = 0.25 + Math.random() * 0.6;
          const tilt = -10 + Math.random() * 20; // degree tilt to simulate wind
          const scaleX = 0.8 + Math.random() * 0.6;

          return (
            <span
              key={i}
              className="rain-drop"
              style={{
                left: `${left}%`,
                top: `-10%`,
                width: `${2 * scaleX}px`,
                height: `${length}px`,
                opacity,
                transform: `rotate(${tilt}deg)`,
                animationDelay: `${delay}s`,
                animationDuration: `${duration}s`,
              }}
            />
          );
        })}
      </div>

      {/* lightning flash overlay */}
      <div
        className={`absolute inset-0 pointer-events-none z-30 transition-opacity duration-200 ${
          lightning ? "opacity-100" : "opacity-0"
        }`}
        aria-hidden
      >
        <div className="lightning-flash" />
      </div>

      {/* bolt svg (positioned absolutely, shows briefly on lightning true) */}
      <div
        key={boltKey}
        className={`absolute z-40 pointer-events-none`}
        style={{
          left: boltPos.left,
          top: boltPos.top,
          transform: `translate(-50%, 0) scale(${boltPos.scale})`,
          opacity: lightning ? 1 : 0,
        }}
        aria-hidden
      >
        {/* simple stylized bolt path - CSS animates stroke/opacity */}
        <svg
          width="110"
          height="220"
          viewBox="0 0 110 220"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="bolt-svg"
        >
          <path
            d="M30 10 L80 90 L50 90 L90 210 L20 120 L45 120 L30 10 Z"
            className="bolt-path"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="3"
            fill="none"
          />
        </svg>
      </div>

      {/* optional small flash ripple near top-left for dramatic effect */}
      <div
        className={`absolute inset-0 z-35 pointer-events-none ${
          lightning ? "bolt-glow-on" : ""
        }`}
      />

      {/* content (children) - gets a tiny shake during strong flashes */}
      <div
        className={`relative z-10 transition-transform duration-150 ${
          lightning ? "shake-on" : ""
        }`}
      >
        {children}
      </div>
    </div>
  );
};

export default ThunderWrapper;
