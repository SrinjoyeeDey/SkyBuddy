export default function SunWrapper({ children }) {
return (
<div className="relative overflow-hidden"> {/* wrapper uses parent size */}
{/* visual layers (pointer-events-none so content remains interactive) */}
<div className="absolute inset-0 pointer-events-none z-0">


{/* gradient wash that drifts slightly (CSS in app.css) */}
<div className="sun-overlay absolute inset-0"></div>


{/* sun circle in top-right (Tailwind for layout, CSS for gradient+animation) */}
<div className="absolute top-4 right-4 w-28 h-28 rounded-full sun shadow-2xl"></div>
</div>


<div className="relative z-10">
{children}
</div>
</div>
);
}