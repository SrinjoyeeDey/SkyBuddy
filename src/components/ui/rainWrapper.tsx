import { useMemo } from 'react';


function randomInt(min: number, max: number) {
return Math.floor(Math.random() * (max - min + 1)) + min;
}


function generateDrops(isBackRow = false) {
const drops = [];
let increment = 0;
let idx = 0;


while (increment < 100) {
const randoHundo = randomInt(1, 98);
const randoFiver = randomInt(2, 5);
increment += randoFiver;


const dropStyle = {
...(isBackRow ? { right: `${increment}%` } : { left: `${increment}%` }),
bottom: `${randoFiver + randoFiver - 1 + 100}%`,
animationDelay: `0.${randoHundo}s`,
animationDuration: `0.5${randoHundo}s`,
};


const innerStyle = {
animationDelay: `0.${randoHundo}s`,
animationDuration: `0.5${randoHundo}s`,
};


drops.push(
<div
className="drop w-[15px] h-[120px] absolute bottom-[100%] pointer-events-none animate-drop"
style={dropStyle}
key={`drop-${isBackRow ? 'b' : 'f'}-${idx}`}
>
<div
className="stem w-[1px] h-[60%] ml-[7px] bg-gradient-to-b from-transparent to-white/25 animate-stem"
style={innerStyle}
/>


<div
className="splat w-[15px] h-[10px] border-t-2 border-dotted rounded-full border-white/50 transform scale-0 animate-splat"
style={innerStyle}
/>
</div>
);


idx += 1;
}


return drops;
}


export default function RainWrapper({ children } : any) {
    const frontDrops = useMemo(() => generateDrops(false), []);
    const backDrops = useMemo(() => generateDrops(true), []);


    return (
        <div className="relative overflow-hidden w-full flex-1">
            <div className="rain back-row absolute inset-0 pointer-events-none -z-10">
                {backDrops}
            </div>

            <div className="rain front-row absolute inset-0 pointer-events-none z-10">
                {frontDrops}
            </div>

            <div className="relative z-20">
                {children}
            </div>
        </div>
    )
}