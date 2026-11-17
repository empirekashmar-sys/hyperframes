// Part 18 art: four years later. The "Chaika" settlement by the sea (fence, tower, windmill, hens,
// a cow), the stray dog with the tracker, the watchtower platform, the radio room, the dining hall,
// a toddler's bed, and the floodlit gate at night.
const svg = (vb, body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}">${body}</svg>`;
const O = "#0b0d14";
const ol = (w = 3) =>
  `stroke="${O}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;

// Stray dog running right; the tracker on its collar blinks (.tdot).
export const dog = (cls, x, y, s = 1) =>
  `<g class="${cls}"><g transform="translate(${x} ${y}) scale(${s})">
   <g class="dlegs"><path d="M-50 10 l-14 40 M-30 10 l6 42 M40 10 l-10 40 M58 6 l14 40" ${ol(9)}/><path d="M-50 10 l-14 40 M-30 10 l6 42 M40 10 l-10 40 M58 6 l14 40" stroke="#b08a5a" stroke-width="5" stroke-linecap="round"/></g>
   <path d="M-70 -10 q-30 -20 -40 -50" stroke="#b08a5a" stroke-width="10" fill="none" stroke-linecap="round"/>
   <ellipse cx="0" cy="0" rx="78" ry="30" fill="#b08a5a" ${ol()}/><ellipse cx="-10" cy="-8" rx="30" ry="14" fill="#8a6a42" opacity=".6"/>
   <path d="M60 -10 q10 -50 50 -46 q30 4 30 30 q-4 22 -30 22 q-30 0 -50 -6z" fill="#b08a5a" ${ol()}/>
   <path d="M96 -54 l-6 -26 l20 18z" fill="#8a6a42" ${ol(2)}/><circle cx="126" cy="-30" r="5" fill="${O}"/><circle cx="140" cy="-18" r="6" fill="${O}"/>
   <path d="M118 -6 q8 18 16 4" fill="#e85a6a" ${ol(1.6)}/>
   <path d="M66 -24 q14 18 30 26" stroke="#c9302c" stroke-width="8" fill="none"/>
   <rect x="74" y="-10" width="18" height="14" rx="3" fill="#2a2a2e" ${ol(1.6)}/><circle class="tdot" cx="83" cy="-3" r="4" fill="#ff3a2a"/></g></g>`;

// Windmill blades (.blades spin around the hub).
const windmill = (x, y, s = 1) =>
  `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-14 0 L-30 300 H30 L14 0Z" fill="#d9d2c2" ${ol(2.4)}/>
   <g class="blades">${[0, 90, 180, 270].map((a) => `<path transform="rotate(${a})" d="M-6 0 L-14 -150 H14 L6 0Z" fill="#f2efe6" ${ol(2)}/>`).join("")}</g>
   <circle r="12" fill="#8a8d96" ${ol(2)}/></g>`;
const hen = (x, y, s = 1, f = 1) =>
  `<g class="hen" transform="translate(${x} ${y}) scale(${s * f} ${s})"><ellipse cx="0" cy="0" rx="20" ry="16" fill="#f2efe6" ${ol(2)}/><circle cx="16" cy="-14" r="9" fill="#f2efe6" ${ol(2)}/><path d="M14 -24 l4 -6 l4 6" fill="#d9302c"/><path d="M24 -14 l8 2 l-8 3z" fill="#e9a03a"/><path d="M-4 16 v8 M4 16 v8" stroke="#e9a03a" stroke-width="3"/></g>`;
const cow = (x, y, s = 1) =>
  `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-60 10 v40 M-36 14 v38 M40 14 v38 M60 10 v40" ${ol(10)}/><path d="M-60 10 v40 M-36 14 v38 M40 14 v38 M60 10 v40" stroke="#f2efe6" stroke-width="6"/>
   <rect x="-80" y="-36" width="160" height="66" rx="30" fill="#f2efe6" ${ol()}/><path d="M-50 -30 q20 10 10 30 q-20 4 -30 -10z M20 -20 q24 -4 30 16 q-14 14 -30 4z" fill="#2a2a2e"/>
   <ellipse cx="96" cy="-30" rx="28" ry="24" fill="#f2efe6" ${ol()}/><ellipse cx="110" cy="-20" rx="16" ry="12" fill="#e9a0a8" ${ol(2)}/><circle cx="92" cy="-38" r="4" fill="${O}"/>
   <path d="M80 -52 l-12 -12 M108 -52 l10 -14" stroke="#c9b48a" stroke-width="6" stroke-linecap="round"/></g>`;
const tower = (x, y, s = 1) =>
  `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-50 0 L-30 -300 M50 0 L30 -300 M-46 -60 L40 -140 M46 -60 L-40 -140 M-40 -160 L34 -240 M40 -160 L-34 -240" ${ol(8)}/>
   <path d="M-50 0 L-30 -300 M50 0 L30 -300" stroke="#8a6a42" stroke-width="5"/>
   <rect x="-60" y="-340" width="120" height="50" fill="#8a6a42" ${ol(2.4)}/><path d="M-70 -340 L0 -400 L70 -340Z" fill="#5a3a26" ${ol(2.4)}/></g>`;

// The settlement at morning: sea, sanatorium "ЧАЙКА", fence, tower, windmill, beds, hens, cow.
export function chaika() {
  return svg(
    "0 0 1080 1100",
    `<defs><linearGradient id="ch-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7fb2e0"/><stop offset="1" stop-color="#f2dcb8"/></linearGradient></defs>
     <rect x="-600" width="2280" height="520" fill="url(#ch-sky)"/>
     <circle cx="860" cy="170" r="70" fill="#fff4c8"/><circle cx="860" cy="170" r="110" fill="#fff4c8" opacity=".25"/>
     <path d="M200 120 q14 -12 28 0 q14 -12 28 0 M300 180 q10 -8 20 0 q10 -8 20 0" stroke="#3a4a5a" stroke-width="4" fill="none"/>
     <rect x="-600" y="420" width="2280" height="140" fill="#3a7ab8"/>
     <g class="waves">${Array.from({ length: 14 }, (_, i) => `<path d="M${-600 + i * 180} ${450 + (i % 3) * 30} q20 -10 40 0 q20 10 40 0" stroke="#bfe0f5" stroke-width="5" fill="none"/>`).join("")}</g>
     <rect x="-600" y="540" width="2280" height="40" fill="#e9d8a8"/>
     <rect x="220" y="330" width="520" height="230" fill="#e9e3d6" ${ol()}/><rect x="200" y="310" width="560" height="30" fill="#c95a4a" ${ol(2.4)}/>
     ${Array.from({ length: 10 }, (_, i) => `<rect x="${250 + (i % 5) * 96}" y="${370 + Math.floor(i / 5) * 90}" width="56" height="60" fill="#3a5a7a" ${ol(2)}/>`).join("")}
     <rect x="380" y="270" width="200" height="44" fill="#2a5a8a" ${ol(2)}/><text x="480" y="302" text-anchor="middle" font-family="Inter, sans-serif" font-weight="900" font-size="30" fill="#fff">ЧАЙКА</text>
     <path d="M440 470 h80 v90 h-80z" fill="#5a3a26" ${ol(2)}/>
     ${windmill(900, 300, 0.9)}
     <rect x="-600" y="560" width="2280" height="600" fill="#8ab05a"/>
     ${Array.from({ length: 5 }, (_, i) => `<rect x="${60 + i * 120}" y="${640 + (i % 2) * 6}" width="96" height="40" rx="8" fill="#6a4a2e"/>${[0, 1, 2].map((k) => `<path d="M${76 + i * 120 + k * 30} ${646 + (i % 2) * 6} q-8 -18 0 -26 q8 8 0 26" fill="#4aa04a"/>`).join("")}`).join("")}
     ${tower(-60, 760, 1)}
     ${cow(760, 740, 0.9)}
     ${hen(380, 760, 1)}${hen(450, 780, 1, -1)}${hen(520, 750, 0.9)}${hen(300, 790, 1.1, -1)}
     <path d="M-600 860 H1680" stroke="#7a5a3a" stroke-width="10"/>
     ${Array.from({ length: 30 }, (_, i) => `<path d="M${-600 + i * 80} 820 V920" stroke="#7a5a3a" stroke-width="12" stroke-linecap="round"/><path d="M${-600 + i * 80} 816 l-8 -12 l8 -6 l8 6z" fill="#9aa2ae"/>`).join("")}
     <path d="M-600 840 H1680 M-600 890 H1680" stroke="#9aa2ae" stroke-width="3" stroke-dasharray="10 8"/>
     <rect x="-600" y="920" width="2280" height="1200" fill="#7aa04a"/>`,
  );
}

// From the top of the watchtower: plank floor, rail, the sea and the steppe road below.
export function towerTop() {
  return svg(
    "0 0 1080 1100",
    `<defs><linearGradient id="tt-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6aa2d8"/><stop offset="1" stop-color="#e9e0c8"/></linearGradient></defs>
     <rect x="-600" width="2280" height="640" fill="url(#tt-sky)"/>
     <rect x="-600" y="520" width="2280" height="120" fill="#3a7ab8"/>
     <rect x="-600" y="620" width="2280" height="400" fill="#b8b06a"/>
     <path d="M-600 760 Q300 700 1680 720" stroke="#8a8d96" stroke-width="40" fill="none"/>
     <g class="far-car"><g transform="translate(-200 715)"><rect x="-30" y="-16" width="60" height="18" rx="6" fill="#3a6a4a" ${ol(1.6)}/><rect x="-16" y="-28" width="30" height="14" rx="4" fill="#3a6a4a" ${ol(1.6)}/><circle cx="-18" cy="4" r="6" fill="${O}"/><circle cx="18" cy="4" r="6" fill="${O}"/><g class="dust">${[0, 1, 2].map((k) => `<circle cx="${-50 - k * 26}" cy="${-4 - k * 4}" r="${12 + k * 6}" fill="#e9dcb0" opacity=".6"/>`).join("")}</g></g></g>
     <path d="M-600 80 H1680" stroke="#5a3a26" stroke-width="24"/><path d="M-600 80 L-600 -40 H1680 V80" fill="#5a3a26"/>
     <rect x="-600" y="860" width="2280" height="1300" fill="#8a6a42"/>${Array.from({ length: 30 }, (_, i) => `<path d="M${-600 + i * 80} 860 V1160" stroke="#6a4a2e" stroke-width="3"/>`).join("")}
     <path d="M-120 100 V860 M1200 100 V860" stroke="#5a3a26" stroke-width="30"/>`,
  );
}
// Tower rail in front (hides legs below the knee).
export function towerRail() {
  return svg(
    "0 0 1080 1100",
    `<rect x="-600" y="900" width="2280" height="40" fill="#8a6a42" ${ol(2.4)}/>
     ${Array.from({ length: 24 }, (_, i) => `<rect x="${-560 + i * 100}" y="940" width="20" height="160" fill="#8a6a42" ${ol(2)}/>`).join("")}
     <rect x="-600" y="1040" width="2280" height="1100" fill="#6a4a2e"/>`,
  );
}

// Radio room: plank walls, a map with pins, a desk with the radio set (.rlamp blinks), a lamp.
export function radioRoom() {
  return svg(
    "0 0 1080 1100",
    `<rect x="-600" width="2280" height="1100" fill="#4a5a52"/>${Array.from({ length: 30 }, (_, i) => `<path d="M${-600 + i * 80} 0 V860" stroke="#3e4c45" stroke-width="4"/>`).join("")}
     <rect x="560" y="200" width="380" height="280" fill="#e9dcb0" ${ol()}/><path d="M580 300 q80 -40 160 0 t180 -20 M600 420 q120 -60 300 -10" stroke="#3a7ab8" stroke-width="6" fill="none"/>
     <circle cx="660" cy="300" r="9" fill="#d9302c" ${ol(1.6)}/><circle cx="860" cy="260" r="9" fill="#2a2a2e" ${ol(1.6)}/><text x="860" y="244" text-anchor="middle" font-family="Inter, sans-serif" font-weight="900" font-size="20" fill="#2a2a2e">УЛЕЙ</text><text x="660" y="336" text-anchor="middle" font-family="Inter, sans-serif" font-weight="900" font-size="20" fill="#d9302c">МЫ</text>
     <path d="M100 -20 V140" stroke="${O}" stroke-width="4"/><path d="M60 140 h80 l-20 40 h-40z" fill="#3a3a40" ${ol(2)}/><ellipse cx="100" cy="186" rx="26" ry="8" fill="#ffe9a8"/>
     <path d="M30 186 L-60 860 H260 L170 186Z" fill="#ffe9a8" opacity=".08"/>
     <rect x="-600" y="860" width="2280" height="400" fill="#3a3028"/>
     <rect x="80" y="700" width="560" height="30" fill="#8a6a42" ${ol(2.4)}/><path d="M110 730 V860 M610 730 V860" ${ol(10)}/>
     <rect x="140" y="560" width="300" height="140" rx="10" fill="#5a6a5a" ${ol(2.4)}/><rect x="160" y="580" width="140" height="70" rx="6" fill="#1a2a1e" ${ol(2)}/>
     <path class="rwave" d="M170 615 l14 -14 l14 24 l14 -30 l14 36 l14 -20 l14 10 l14 -6 l14 4" stroke="#7aff8a" stroke-width="3" fill="none"/>
     ${[0, 1, 2].map((k) => `<circle cx="${330 + k * 34}" cy="610" r="12" fill="#2a2a2e" ${ol(1.6)}/>`).join("")}<circle class="rlamp" cx="410" cy="666" r="8" fill="#ff3a2a"/>
     <path d="M420 560 L470 380" stroke="${O}" stroke-width="5"/><circle cx="470" cy="378" r="6" fill="#2a2a2e"/>
     <rect x="480" y="650" width="90" height="50" rx="8" fill="#2a2a2e" ${ol(2)}/>`,
  );
}

// Dining hall in the old sanatorium: tall windows at dusk, a long table, garlands of bulbs.
export function hall() {
  return svg(
    "0 0 1080 1100",
    `<rect x="-600" width="2280" height="1100" fill="#c9a87a"/>
     <rect x="-600" y="0" width="2280" height="60" fill="#a8885a"/>
     ${[-300, 60, 420, 780, 1140].map((x) => `<rect x="${x}" y="140" width="200" height="420" rx="100" fill="#3a3a6a" ${ol(2.4)}/><path d="M${x + 100} 140 V560 M${x} 360 H${x + 200}" stroke="#a8885a" stroke-width="8"/>`).join("")}
     <path d="M-600 120 Q-300 200 0 120 T600 120 T1200 120 T1800 120" stroke="${O}" stroke-width="3" fill="none"/>
     ${Array.from({ length: 22 }, (_, i) => `<circle class="bulb" cx="${-560 + i * 110}" cy="${140 + (i % 2) * 22}" r="10" fill="#ffe27a"/>`).join("")}
     <rect x="-600" y="860" width="2280" height="400" fill="#6a4a2e"/>
     <path d="M-600 880 H1680" stroke="#5a3a1e" stroke-width="4"/>`,
  );
}
// A crowd of villagers seen from behind (heads and shoulders), drawn in front of the speakers' feet.
export function crowd() {
  const cols = ["#5a6a7a", "#7a5a4a", "#4a6a4a", "#8a6a8a", "#6a6a3a", "#3a4a6a"];
  const hairs = ["#2a1d16", "#8a8d96", "#5a3522", "#c9a06a", "#17181d", "#e9e3d6"];
  return svg(
    "0 0 1080 1100",
    `${Array.from({ length: 16 }, (_, i) => {
      const x = -320 + i * 110 + (i % 2) * 30;
      const y = 1000 + (i % 3) * 24;
      return `<path d="M${x - 60} ${y + 160} Q${x - 60} ${y + 40} ${x} ${y + 40} Q${x + 60} ${y + 40} ${x + 60} ${y + 160}Z" fill="${cols[i % 6]}" ${ol(2.4)}/><circle cx="${x}" cy="${y}" r="38" fill="${hairs[(i * 5) % 6]}" ${ol(2.4)}/>`;
    }).join("")}`,
  );
}

// Toddler bed with a rail, a night light; drawn in front of the sleeping boy (hides his legs).
export function cribFront() {
  return svg(
    "0 0 1080 1100",
    `<rect x="300" y="820" width="520" height="70" rx="20" fill="#9fc8e0" ${ol(2.4)}/>
     ${Array.from({ length: 9 }, (_, i) => `<rect x="${310 + i * 60}" y="${720}" width="14" height="110" rx="6" fill="#e9dcc0" ${ol(1.6)}/>`).join("")}
     <rect x="290" y="706" width="540" height="22" rx="10" fill="#e9dcc0" ${ol(2)}/><rect x="280" y="880" width="560" height="60" fill="#8a6a42" ${ol(2.4)}/>`,
  );
}
// Night kids' room: dark wall with stars painted on it, window with the moon, a night light.
export function kidRoom() {
  return svg(
    "0 0 1080 1100",
    `<rect x="-600" width="2280" height="1100" fill="#2a3050"/>
     ${Array.from({ length: 24 }, (_, k) => `<path transform="translate(${((k * 157) % 1600) - 300} ${80 + ((k * 71) % 500)}) scale(${0.6 + (k % 3) * 0.3})" d="M0 -12 L3 -4 L12 -4 L5 2 L8 11 L0 6 L-8 11 L-5 2 L-12 -4 L-3 -4Z" fill="#ffe27a" opacity=".35"/>`).join("")}
     <rect x="740" y="180" width="220" height="240" fill="#0a1430" ${ol()}/><circle cx="880" cy="250" r="40" fill="#f3ecd2"/><path d="M850 180 V420 M740 300 H960" stroke="#3a2a1e" stroke-width="10"/>
     <path d="M760 420 L640 860 H1080 L960 420Z" fill="#c9d8ff" opacity=".07"/>
     <rect x="120" y="700" width="70" height="160" fill="#5a4a3a" ${ol(2)}/><circle class="nlight" cx="155" cy="680" r="26" fill="#ffcf7a"/><circle cx="155" cy="680" r="80" fill="#ffcf7a" opacity=".15"/>
     <rect x="360" y="736" width="200" height="80" rx="34" fill="#e9eef5" ${ol(2.4)}/>
     <rect x="-600" y="860" width="2280" height="400" fill="#1e2238"/>`,
  );
}

// The gate at night: fence, a floodlight on the tower (.beam), the gate (.gate), the empty road.
export function gateNight() {
  return svg(
    "0 0 1080 1100",
    `<rect x="-600" width="2280" height="1100" fill="#0a1020"/>
     ${Array.from({ length: 36 }, (_, k) => `<circle cx="${((k * 173) % 2000) - 400}" cy="${(k * 89) % 480}" r="${1 + (k % 3)}" fill="#fff" opacity=".6"/>`).join("")}
     <rect x="-600" y="700" width="2280" height="600" fill="#1e2a22"/>
     <path d="M340 700 L200 1100 H880 L740 700Z" fill="#2a2a2e"/>
     ${tower(140, 760, 1.1)}
     <path class="beam" d="M150 340 L380 1100 H900 L180 330Z" fill="#fff6c8" opacity=".14"/><circle cx="160" cy="340" r="18" fill="#fff6c8"/>
     ${Array.from({ length: 30 }, (_, i) => (i > 14 && i < 18 ? "" : `<path d="M${-600 + i * 80} 640 V900" stroke="#4a3a2a" stroke-width="14" stroke-linecap="round"/>`)).join("")}
     <path d="M-600 680 H340 M740 680 H1680 M-600 760 H340 M740 760 H1680" stroke="#7a828e" stroke-width="3" stroke-dasharray="10 8"/>
     <rect x="-600" y="900" width="2280" height="400" fill="#16201a"/>`,
  );
}
// The gate bars, drawn over whoever stands behind the gate.
export function gateBars() {
  return svg(
    "0 0 1080 1100",
    `<g class="gate"><rect x="340" y="620" width="400" height="280" fill="none" ${ol(10)}/><rect x="340" y="620" width="400" height="280" fill="none" stroke="#5a6470" stroke-width="5"/><path d="M340 620 L740 900 M740 620 L340 900 M540 620 V900" stroke="#5a6470" stroke-width="5"/>${[390, 440, 490, 590, 640, 690].map((x) => `<path d="M${x} 620 V900" stroke="#5a6470" stroke-width="3"/>`).join("")}</g>`,
  );
}
// Red siren flash over the whole frame.
export const flood = (cls) =>
  `<rect class="${cls}" x="-800" y="-800" width="2680" height="3520" fill="#ff2a2a" opacity="0"/>`;
