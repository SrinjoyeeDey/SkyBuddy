import React from "react";

export default function SunWrapper({ children }: any) {
  const gradients = [
    "linear-gradient(120deg, #fff59d 0%, #ffc107 50%, #ff3b30 100%)", // Y O R
    "linear-gradient(120deg, #fff59d 0%, #ff3b30 50%, #ffc107 100%)", // Y R O
    "linear-gradient(120deg, #ffc107 0%, #fff59d 50%, #ff3b30 100%)", // O Y R
    "linear-gradient(120deg, #ffc107 0%, #ff3b30 50%, #fff59d 100%)", // O R Y
    "linear-gradient(120deg, #ff3b30 0%, #fff59d 50%, #ffc107 100%)", // R Y O
    "linear-gradient(120deg, #ff3b30 0%, #ffc107 50%, #fff59d 100%)", // R O Y
  ];

  return (
    <div className="sun-wrapper relative w-full h-full overflow-hidden">
      <div className="gradients absolute inset-0 z-0 pointer-events-none">
        {gradients.map((g, i) => (
          <div
            key={i}
            className="grad-layer absolute inset-0"
            style={{ background: g }}
          />
        ))}
      </div>

      <div className="absolute inset-0 pointer-events-none z-10">
        <div className="sun-overlay absolute inset-0" />
        <div className="sun-outer absolute top-4 right-4 z-20">
          <div className="sun-core" aria-hidden="true" />
        </div>
      </div>

      <div className="relative z-30">{children}</div>
    </div>
  );
}
