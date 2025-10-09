export default function SunWrapper({ children }: any) {
return (
<div className="relative overflow-hidden">
<div className="absolute inset-0 pointer-events-none z-0">

<div className="sun-overlay absolute inset-0"></div>
<div className="absolute top-4 right-4 w-28 h-28 rounded-full sun shadow-2xl"></div>
</div>


<div className="relative z-10">
{children}
</div>
</div>
);
}