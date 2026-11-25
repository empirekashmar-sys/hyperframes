// Part 18 art: inside the black helicopter, the "Granit" base hidden in a mountain, its corridor,
// the general's office, the Omega hangar with training mats, the shooting range, Gleb's quarters
// with a little stove, and the briefing room with the drone photo on the screen.
const svg = (vb, body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}">${body}</svg>`;
const O = "#0b0d14";
const ol = (w = 3) =>
  `stroke="${O}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;
const floor = (y, c) => `<rect x="-600" y="${y}" width="2280" height="1400" fill="${c}"/>`;

// Inside the black helicopter at night: ribbed walls, a red cabin light, two round windows.
export function heliIn() {
  return svg(
    "0 0 1080 1100",
    `<rect x="-600" width="2280" height="1100" fill="#22252c"/>
     ${Array.from({ length: 20 }, (_, i) => `<path d="M${-600 + i * 120} 0 V860" stroke="#1a1c22" stroke-width="10"/>`).join("")}
     ${[260, 820].map((x) => `<circle cx="${x}" cy="380" r="110" fill="#0a1430" ${ol(8)}/><circle cx="${x}" cy="380" r="110" fill="none" stroke="#4a4f58" stroke-width="4"/>`).join("")}
     <g class="clouds">${Array.from({ length: 10 }, (_, i) => `<ellipse cx="${-200 + i * 200}" cy="${360 + (i % 3) * 30}" rx="70" ry="20" fill="#3a4a6a" opacity=".7"/>`).join("")}</g>
     <rect x="440" y="60" width="200" height="30" rx="10" fill="#ff3a2a" opacity=".85"/><path d="M380 90 L200 860 H880 L700 90Z" fill="#ff3a2a" opacity=".07"/>
     <rect x="-600" y="700" width="2280" height="50" fill="#3a3e46" ${ol(2)}/>
     ${floor(860, "#1a1c22")}`,
  );
}
// Bench edge in front of the seated pair.
export function benchFront() {
  return svg(
    "0 0 1080 1100",
    `<rect x="-600" y="840" width="2280" height="70" rx="10" fill="#4a4f58" ${ol(2.4)}/>${Array.from({ length: 12 }, (_, i) => `<path d="M${-500 + i * 200} 910 V1100" ${ol(8)}/>`).join("")}`,
  );
}

// Mountains at dawn; the rock face with a giant split door (.door-l / .door-r slide apart).
export function mountain() {
  return svg(
    "0 0 1080 1100",
    `<defs><linearGradient id="mt-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a3a6a"/><stop offset="1" stop-color="#f2a87a"/></linearGradient></defs>
     <rect x="-600" width="2280" height="900" fill="url(#mt-sky)"/>
     <path d="M-600 700 L-300 300 L0 620 L300 220 L640 640 L900 260 L1300 700Z" fill="#5a5a7a"/>
     <path d="M300 220 L360 300 L330 320 L280 290Z M900 260 L960 340 L920 350 L870 320Z" fill="#f2f4f6"/>
     <path d="M-600 900 L-200 420 L200 560 L540 360 L900 540 L1680 460 V1100 H-600Z" fill="#4a4a5a" ${ol(3)}/>
     <rect x="340" y="560" width="400" height="340" fill="#0a0a10"/>
     <g class="door-l"><rect x="340" y="560" width="200" height="340" fill="#6a6a78" ${ol(3)}/><path d="M360 600 H520 M360 680 H520 M360 760 H520 M360 840 H520" stroke="#4a4a58" stroke-width="6"/></g>
     <g class="door-r"><rect x="540" y="560" width="200" height="340" fill="#6a6a78" ${ol(3)}/><path d="M560 600 H720 M560 680 H720 M560 760 H720 M560 840 H720" stroke="#4a4a58" stroke-width="6"/></g>
     <rect x="420" y="500" width="240" height="50" fill="#2a2d34" ${ol(2)}/><text x="540" y="535" text-anchor="middle" font-family="Inter, sans-serif" font-weight="900" font-size="30" fill="#e9c46a">«ГРАНИТ»</text>
     <circle class="blink" cx="350" cy="550" r="10" fill="#ff3a2a"/><circle class="blink" cx="730" cy="550" r="10" fill="#ff3a2a"/>
     <path d="M-600 900 H1680" stroke="#3a3a48" stroke-width="10"/>${floor(900, "#3a3a48")}`,
  );
}

// Concrete corridor with ceiling lamps, pipes and a painted stripe.
export function corridor() {
  return svg(
    "0 0 1080 1100",
    `<rect x="-600" width="2280" height="1100" fill="#7a7e86"/>
     <rect x="-600" y="0" width="2280" height="120" fill="#5a5e66"/><path d="M-600 150 H1680 M-600 176 H1680" stroke="#4a4e56" stroke-width="14"/>
     ${Array.from({ length: 12 }, (_, i) => `<rect x="${-560 + i * 220}" y="110" width="120" height="20" rx="6" fill="#fff6d8"/><path d="M${-560 + i * 220} 130 L${-640 + i * 220} 860 H${-320 + i * 220} L${-440 + i * 220} 130Z" fill="#fff6d8" opacity=".06"/>`).join("")}
     <rect x="-600" y="560" width="2280" height="40" fill="#b3241b" opacity=".7"/>
     ${Array.from({ length: 6 }, (_, i) => `<rect x="${-400 + i * 420}" y="340" width="150" height="520" fill="#5a5e66" ${ol(2.4)}/><circle cx="${-270 + i * 420}" cy="610" r="8" fill="#c9ccd2"/>`).join("")}
     ${floor(860, "#4a4e56")}`,
  );
}

// The general's office: dark wood, a wall map with red arrows, a heavy desk with a green lamp.
export function office() {
  return svg(
    "0 0 1080 1100",
    `<rect x="-600" width="2280" height="1100" fill="#4a3a30"/>${Array.from({ length: 30 }, (_, i) => `<path d="M${-600 + i * 80} 0 V860" stroke="#3e3028" stroke-width="5"/>`).join("")}
     <rect x="200" y="160" width="680" height="380" fill="#e9dcb0" ${ol()}/>
     <path d="M240 300 q120 -60 240 0 t300 -30 M260 460 q200 -80 560 -10" stroke="#3a7ab8" stroke-width="6" fill="none"/>
     <path d="M760 220 L560 360 M560 360 l20 -30 M560 360 l34 4" stroke="#c9302c" stroke-width="8" fill="none" stroke-linecap="round"/>
     <circle cx="760" cy="220" r="14" fill="#2a2a2e" ${ol(2)}/><text x="760" y="200" text-anchor="middle" font-family="Inter, sans-serif" font-weight="900" font-size="22" fill="#2a2a2e">УЛЕЙ</text>
     <circle cx="330" cy="420" r="12" fill="#c9302c" ${ol(2)}/><text x="330" y="404" text-anchor="middle" font-family="Inter, sans-serif" font-weight="900" font-size="22" fill="#c9302c">ГРАНИТ</text>
     <rect x="-200" y="200" width="200" height="300" fill="#6a2a2a" ${ol(2)}/><path d="M-100 260 l12 30 h32 l-26 20 l10 32 l-28 -20 l-28 20 l10 -32 l-26 -20 h32z" fill="#e9c46a"/>
     ${floor(860, "#3a2a20")}`,
  );
}
// The desk in front (hides the general below the chest), with a lamp and papers.
export function desk() {
  return svg(
    "0 0 1080 1100",
    `<rect x="160" y="760" width="760" height="40" fill="#6a4630" ${ol(2.4)}/><rect x="180" y="800" width="720" height="320" fill="#5a3a26" ${ol(2.4)}/>
     <path d="M760 760 v-70 l-40 -40" ${ol(6)}/><path d="M690 640 l60 -20 l20 50 l-60 20z" fill="#3a8a5a" ${ol(2)}/><ellipse cx="740" cy="690" rx="70" ry="20" fill="#ffe9a8" opacity=".25"/>
     <rect x="300" y="740" width="140" height="20" fill="#f2efe6" ${ol(1.6)} transform="rotate(-4 370 750)"/><rect x="460" y="744" width="120" height="16" fill="#e9c46a" ${ol(1.6)}/>`,
  );
}

// The Omega hangar: steel arches, a parked helicopter, a blue training mat (.mat), the omega flag.
export function hangar() {
  return svg(
    "0 0 1080 1100",
    `<rect x="-600" width="2280" height="1100" fill="#3a3e46"/>
     ${Array.from({ length: 8 }, (_, i) => `<path d="M${-600 + i * 320} 860 Q${-440 + i * 320} -100 ${-280 + i * 320} 860" stroke="#2a2d34" stroke-width="18" fill="none"/>`).join("")}
     ${Array.from({ length: 10 }, (_, i) => `<rect x="${-560 + i * 240}" y="60" width="140" height="18" rx="6" fill="#fff6d8"/>`).join("")}
     <rect x="380" y="120" width="320" height="200" fill="#1a1c22" ${ol(2.4)}/><circle cx="540" cy="220" r="70" fill="#b3241b" ${ol(2.4)}/><text x="540" y="252" text-anchor="middle" font-family="Inter, sans-serif" font-weight="900" font-size="96" fill="#fff">Ω</text>
     <g transform="translate(1260 760) scale(.9)"><path d="M-260 0 Q-270 -110 -100 -130 H140 Q260 -124 280 -20 Q260 40 120 50 H-200 Q-260 46 -260 0Z" fill="#4a5636" ${ol()}/><path d="M100 -110 Q220 -104 240 -24 H100Z" fill="#3a4a5a" ${ol(2)}/><path d="M-260 -30 L-560 -60 L-570 -16 L-260 14Z" fill="#4a5636" ${ol(2.4)}/><path d="M-500 160 H500" stroke="#2a2d34" stroke-width="12" stroke-linecap="round"/><path d="M-80 90 H160 M-60 50 V90 M140 50 V90" ${ol(8)}/></g>
     ${floor(860, "#2a2d34")}<path d="M-600 860 H1680" stroke="#e9c46a" stroke-width="8" stroke-dasharray="60 40"/>
     <path class="mat" d="M60 900 H1020 L1060 1000 H20Z" fill="#3a6ab8" ${ol(2.4)}/>`,
  );
}

// Shooting range: lanes, sandbags, targets (.tgt pop when hit).
export function range() {
  return svg(
    "0 0 1080 1100",
    `<rect x="-600" width="2280" height="1100" fill="#5a5e66"/>
     <rect x="-600" y="0" width="2280" height="100" fill="#3a3e46"/>${Array.from({ length: 10 }, (_, i) => `<rect x="${-560 + i * 240}" y="90" width="140" height="16" rx="6" fill="#fff6d8"/>`).join("")}
     <rect x="-600" y="480" width="2280" height="380" fill="#7a6a4a"/>
     ${[100, 330, 560, 790, 1020].map((x, i) => `<g class="tgt tgt${i}"><rect x="${x - 50}" y="300" width="100" height="160" rx="8" fill="#f2efe6" ${ol(2.4)}/><circle cx="${x}" cy="370" r="36" fill="none" stroke="#c9302c" stroke-width="6"/><circle cx="${x}" cy="370" r="14" fill="#c9302c"/><path d="M${x} 460 V500" ${ol(6)}/></g>`).join("")}
     ${[100, 330, 560, 790, 1020].map((x, i) => `<circle class="hole hole${i}" cx="${x + 2}" cy="368" r="6" fill="${O}" opacity="0"/>`).join("")}
     ${floor(860, "#4a4e56")}
     ${Array.from({ length: 14 }, (_, i) => `<ellipse cx="${-560 + i * 180}" cy="840" rx="90" ry="30" fill="#a8946a" ${ol(2)}/>`).join("")}`,
  );
}

// Gleb's quarters at night: bunk, a small iron stove (.fire glows), a lamp, a calendar.
export function quarters() {
  return svg(
    "0 0 1080 1100",
    `<rect x="-600" width="2280" height="1100" fill="#3a4048"/>${Array.from({ length: 20 }, (_, i) => `<path d="M-600 ${i * 60} H1680" stroke="#343a42" stroke-width="3"/>`).join("")}
     <rect x="620" y="200" width="160" height="200" fill="#e9e3d6" ${ol(2)}/><rect x="620" y="200" width="160" height="40" fill="#c9302c"/>${Array.from({ length: 12 }, (_, i) => `<path d="M${640 + (i % 4) * 36} ${270 + Math.floor(i / 4) * 40} l16 16 M${656 + (i % 4) * 36} ${270 + Math.floor(i / 4) * 40} l-16 16" stroke="#3a3a40" stroke-width="2"/>`).join("")}
     <path d="M200 0 V200" stroke="${O}" stroke-width="4"/><path d="M160 200 h80 l-20 40 h-40z" fill="#3a3a40" ${ol(2)}/><path d="M150 240 L60 860 H360 L260 240Z" fill="#ffe9a8" opacity=".07"/>
     <rect x="-300" y="640" width="560" height="140" rx="10" fill="#5a6a5a" ${ol(2.4)}/><rect x="-280" y="610" width="200" height="60" rx="24" fill="#e9eef5" ${ol(2)}/>
     <g transform="translate(900 860)"><rect x="-70" y="-180" width="140" height="180" rx="10" fill="#2a2a2e" ${ol(2.4)}/><path d="M-20 -180 V-420" stroke="#2a2a2e" stroke-width="30"/><rect x="-46" y="-120" width="92" height="60" rx="6" fill="#140c08" ${ol(2)}/><g class="fire"><path d="M-36 -62 Q-30 -100 -10 -90 Q0 -120 16 -96 Q30 -110 36 -62Z" fill="#ff8a2b"/><path d="M-20 -62 Q-14 -84 0 -78 Q10 -94 20 -62Z" fill="#ffe27a"/></g><ellipse cx="0" cy="-80" rx="120" ry="80" fill="#ff8a2b" opacity=".08"/></g>
     ${floor(860, "#2a2e34")}`,
  );
}

// Briefing room: a big screen (.screen) with the drone photo of the yellow bus and two figures.
export function briefing() {
  return svg(
    "0 0 1080 1100",
    `<rect x="-600" width="2280" height="1100" fill="#24282e"/>
     <rect x="140" y="140" width="800" height="480" fill="#0a0e14" ${ol(4)}/>
     <g class="screen"><rect x="160" y="160" width="760" height="440" fill="#a8a86a"/><rect x="160" y="160" width="760" height="120" fill="#8fb4dc"/>
       <rect x="160" y="380" width="760" height="90" fill="#5a5e66"/><path d="M160 425 H920" stroke="#e9e3c9" stroke-width="5" stroke-dasharray="40 30"/>
       <g transform="translate(560 452) scale(.55)"><path d="M0 -300 H560 Q640 -300 660 -240 L680 -40 H0Z" fill="#e9b82a" ${ol()}/>${Array.from({ length: 6 }, (_, i) => `<rect x="${30 + i * 90}" y="-270" width="70" height="80" rx="6" fill="#3a4a5a" ${ol(2)}/>`).join("")}<circle cx="130" cy="-20" r="44" fill="#1a1a1e"/><circle cx="540" cy="-20" r="44" fill="#1a1a1e"/></g>
       <g transform="translate(420 450)"><circle cx="0" cy="-70" r="16" fill="#ebbb98"/><path d="M-16 -74 q16 -24 32 0" fill="#5a3522"/><rect x="-14" y="-54" width="28" height="54" fill="#141418"/></g>
       <g transform="translate(470 452)"><circle cx="0" cy="-74" r="17" fill="#d9a07c"/><path d="M-12 -62 q12 14 24 0" fill="#d8dbe0"/><rect x="-16" y="-56" width="32" height="56" fill="#56603e"/></g>
       <rect class="tgtbox" x="390" y="350" width="120" height="120" fill="none" stroke="#ff3a2a" stroke-width="5"/>
       <text x="180" y="196" font-family="Inter, sans-serif" font-weight="900" font-size="24" fill="#ff3a2a">ДРОН-7 · СТЕПЬ · ЦЕЛЬ</text>
       <rect x="160" y="160" width="760" height="440" fill="url(#bf-scan)" opacity=".25"/></g>
     <defs><pattern id="bf-scan" width="8" height="8" patternUnits="userSpaceOnUse"><rect width="8" height="3" fill="#000"/></pattern></defs>
     <path d="M140 620 L-100 1100 H1180 L940 620Z" fill="#9fc2e0" opacity=".05"/>
     ${floor(860, "#1a1c22")}`,
  );
}
