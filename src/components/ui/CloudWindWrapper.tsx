import React, { useEffect, useMemo, useState } from "react";

type Props = {
  children: React.ReactNode;
  cloudCount?: number; // total cloud elements (default 8)
  speedRange?: [number, number]; // seconds for a cloud to cross; [min, max]
  gustInterval?: number; // how often gusts happen (ms)
  gustLength?: number; // how long a gust lasts (ms)
  opacity?: number; // overlay darkness 0..1
};

const CloudWindWrapper: React.FC<Props> = ({
  children,
  cloudCount = 8,
  speedRange = [28, 60],
  gustInterval = 1000,
  gustLength = 1400,
}) => {
  const [gusting, setGusting] = useState(false);
  const [pattern, setPattern] = useState(0); // 0..2

  // precompute cloud properties once per mount for stability
  const clouds = useMemo(() => {
    return Array.from({ length: cloudCount }).map((_, i) => {
      // layer: 0 back, 1 middle, 2 front
      const layer = Math.floor(Math.random() * 3);
      // start left slightly offscreen to the left
      const left = -20 - Math.random() * 20; // -20% .. -40%
      // vertical position - near top half
      const top = 6 + Math.random() * 38; // 6%..44%
      // scale based on layer (front larger)
      const scale = 0.6 + layer * 0.35 + Math.random() * 0.25;
      // crossing duration based on layer + random, in seconds
      const base = speedRange[0] + Math.random() * (speedRange[1] - speedRange[0]);
      const duration = Math.max(8, base - layer * 10 - Math.random() * 10); // front is faster
      const delay = Math.random() * 10; // seconds
      const opacity = 0.12 + layer * 0.15 + Math.random() * 0.12;

      return { key: `cloud-${i}`, layer, left, top, scale, duration, delay, opacity };
    });
  }, [cloudCount, speedRange]);

  useEffect(() => {
    let alive = true;
    let tid: number | undefined;
  
    function schedule() {
      if (!alive) return;
      tid = window.setTimeout(() => {
        if (!alive) return;
        setPattern((p) => (p + 1) % 3); // rotate pattern each gust
        setGusting(true);
        window.setTimeout(() => setGusting(false), gustLength);
        schedule();
      }, gustInterval);
    }
  
    schedule();
    return () => {
      alive = false;
      if (tid) clearTimeout(tid);
    };
  }, [gustInterval, gustLength]);
  

  return (
    <div className="relative overflow-hidden w-full h-full flex-1">
      {/* subtle sky gradient background */}
      <div
        className="absolute inset-0 -z-30 pointer-events-none animate-sky-shift"
        aria-hidden
        style={{ opacity: 1 }}
      />

      {/* tint overlay to tune mood */}
      {/* tint overlay to tune mood */}
    <div
    className="absolute inset-0 -z-20 pointer-events-none"
    style={{ background: `rgba(12, 24, 40, ${0.12})` }} // lower value
    />


      {/* wind lines indicator (front) */}
      <div
        className={`absolute inset-0 -z-5 pointer-events-none overflow-hidden ${gusting ? "gusting" : ""}`}
        aria-hidden
      >
        <div className="wind-lines" />
      </div>

      {/* cloud layers */}
      <div className={`absolute inset-0 pointer-events-none -z-10 ${gusting ? "gusting" : ""}`}>
        {clouds.map((c) => {
          const layerClass = c.layer === 0 ? "cloud-back" : c.layer === 1 ? "cloud-mid" : "cloud-front";
          return (
            <div
              key={c.key}
              className={`cloud ${layerClass}`}
              style={{
                left: `${c.left}%`,
                top: `${c.top}%`,
                transform: `translateX(0) scale(${c.scale})`,
                // put the base duration as a css variable so gusting can alter it
                // include s unit
                ["--cloud-duration" as any]: `${c.duration}s`,
                ["--cloud-delay" as any]: `${c.delay}s`,
                opacity: c.opacity,
              }}
            />
          );
        })}
      </div>

      {/* content gets a tiny sway while gusting */}
      <div
        className={`relative z-10 transition-transform duration-300 ${gusting ? `wind-sway wind-sway-${pattern + 1}` : ""}`}
      >
        {children}
      </div>

    </div>
  );
};

export default CloudWindWrapper;
