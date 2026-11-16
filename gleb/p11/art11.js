// Part 11 art: the southern steppe road, sheep and a shepherd's crook, a tractor, a roadside
// shashlik café, the sea from the hill, the pebble beach, Petrovich's white house and its room.
const svg = (vb, body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}">${body}</svg>`;
const O = "#0b0d14";
const ol = (w = 3) =>
  `stroke="${O}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;

// Steppe with a road (wide, 2160): day or night.
export function steppe({ night = false } = {}) {
  const sky = night ? ["#04060d", "#141a30"] : ["#8fb4dc", "#e8e0c8"];
  return svg(
    "0 0 2160 1100",
    `<defs><linearGradient id="st-sky${night ? "n" : "d"}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${sky[0]}"/><stop offset="1" stop-color="${sky[1]}"/></linearGradient></defs>
     <rect x="-400" width="2960" height="900" fill="url(#st-sky${night ? "n" : "d"})"/>
     ${night ? Array.from({ length: 50 }, (_, k) => `<circle cx="${((k * 173) % 2400) - 200}" cy="${(k * 89) % 500}" r="${1 + (k % 3)}" fill="#fff" opacity=".8"/>`).join("") : `<circle cx="1700" cy="200" r="70" fill="#fff6d8"/>`}
     <path d="M-400 760 Q300 700 1000 740 Q1600 700 2560 750 V1100 H-400Z" fill="${night ? "#1a2018" : "#a8a86a"}"/>
     ${Array.from({ length: 30 }, (_, k) => `<path d="M${((k * 97) % 2400) - 200} ${790 + (k % 4) * 20} q6 -18 12 0" stroke="${night ? "#2a3020" : "#7a8a4a"}" stroke-width="3" fill="none"/>`).join("")}
     <rect x="-400" y="860" width="2960" height="140" fill="${night ? "#22242c" : "#5a5e66"}"/>
     <path class="lane" d="M-400 930 H2560" stroke="#e9e3c9" stroke-width="6" stroke-dasharray="60 50"/>
     <rect x="-400" y="1000" width="2960" height="1000" fill="${night ? "#1a2018" : "#a8a86a"}"/>`,
  );
}
// A sheep (faces left).
export const sheep = (cls, x, y, s = 1) =>
  `<g class="${cls}"><g transform="translate(${x} ${y}) scale(${s})"><ellipse cx="0" cy="-40" rx="50" ry="34" fill="#f2efe6" ${ol(2.4)}/>${[-30, -10, 10, 30].map((d) => `<circle cx="${d}" cy="-66" r="14" fill="#f2efe6" ${ol(2)}/>`).join("")}<ellipse cx="-50" cy="-48" rx="16" ry="20" fill="#3a3a40" ${ol(2)}/><circle cx="-56" cy="-52" r="3" fill="#fff"/><path d="M-30 -10 v14 M30 -10 v14 M-14 -8 v14 M14 -8 v14" stroke="#3a3a40" stroke-width="7"/></g></g>`;
// Shepherd's crook (held by the shepherd).
export const crook = (x, y) =>
  `<path d="M${x} ${y} V${y - 330} q0 -40 34 -40 q30 0 30 30" stroke="#7a5234" stroke-width="10" fill="none" stroke-linecap="round"/>`;
// Cheese wheel.
export const cheese = (cls, x, y) =>
  `<g class="${cls}" opacity="0"><g transform="translate(${x} ${y})"><ellipse cx="0" cy="0" rx="40" ry="16" fill="#f2d27a" ${ol(2)}/><rect x="-40" y="-20" width="80" height="20" fill="#f2d27a"/><ellipse cx="0" cy="-20" rx="40" ry="16" fill="#f8e29a" ${ol(2)}/></g></g>`;
// Small tractor (faces right), wheels .wheel.
export const tractor = (cls, x, y) =>
  `<g class="${cls}"><g transform="translate(${x} ${y})"><rect x="-60" y="-110" width="80" height="70" fill="#c9302c" ${ol(2.4)}/><rect x="-50" y="-100" width="50" height="40" fill="#9fc2e0" ${ol(2)}/><circle cx="-26" cy="-80" r="10" fill="#e0ae88"/><rect x="20" y="-70" width="80" height="40" fill="#c9302c" ${ol(2.4)}/><rect x="80" y="-110" width="10" height="40" fill="#3a3a40"/>
   <g class="wheel" transform="translate(-30 -20)"><circle r="40" fill="#1a1a1e" ${ol()}/><circle r="16" fill="#c9a24a"/></g><g class="wheel" transform="translate(80 -10)"><circle r="26" fill="#1a1a1e" ${ol()}/><circle r="10" fill="#c9a24a"/></g></g></g>`;
// Fog on the windscreen.
export const fog = (cls) =>
  `<g class="${cls}"><path d="M60 120 Q540 60 1020 120 L1060 720 H20Z" fill="#e9eef5" opacity=".7"/>${[0, 1, 2, 3].map((k) => `<path d="M${200 + k * 200} 300 q-10 60 0 120" stroke="#cfd8e4" stroke-width="6" fill="none"/>`).join("")}<path d="M480 360 C450 330 430 360 480 400 C530 360 510 330 480 360Z" fill="none" stroke="#b9c6d6" stroke-width="6"/></g>`;

// Shashlik café: counter with menu, a radio on the shelf, tables, a grill with smoke.
export function cafe() {
  return svg(
    "0 0 1080 1100",
    `<rect x="-600" width="2280" height="1100" fill="#c97a4a"/>
     <rect x="-600" y="0" width="2280" height="520" fill="#d98a5a"/>${Array.from({ length: 30 }, (_, i) => `<rect x="${-600 + i * 80}" y="520" width="40" height="340" fill="#b96a3a" opacity=".5"/>`).join("")}
     <rect x="160" y="140" width="420" height="200" fill="#2a2a2e" ${ol()}/><text x="370" y="190" text-anchor="middle" font-family="Inter, sans-serif" font-weight="900" font-size="34" fill="#f2d27a">МЕНЮ</text>
     <text x="190" y="240" font-family="Inter, sans-serif" font-weight="700" font-size="24" fill="#f2efe6">ШАШЛЫК ........ 300</text><text x="190" y="280" font-family="Inter, sans-serif" font-weight="700" font-size="24" fill="#f2efe6">ЛАВАШ .......... 50</text><text x="190" y="320" font-family="Inter, sans-serif" font-weight="700" font-size="24" fill="#f2efe6">ЧАЙ ............. 30</text>
     <rect x="700" y="260" width="260" height="20" fill="#7a4a26" ${ol(2)}/><g class="radio"><rect x="740" y="190" width="120" height="70" rx="10" fill="#6a4a3a" ${ol(2)}/><circle cx="770" cy="225" r="18" fill="#3a2a1e"/><rect x="800" y="208" width="46" height="14" fill="#f2d27a"/></g>
     <g class="notes" opacity="0"><text x="880" y="200" font-size="40" fill="#fff">♪</text><text x="920" y="160" font-size="34" fill="#fff">♫</text></g>
     <rect x="-600" y="860" width="2280" height="600" fill="#8a5a3a"/>${Array.from({ length: 20 }, (_, i) => `<path d="M${-600 + i * 120} 860 L${-660 + i * 120} 1100" stroke="#7a4a2a" stroke-width="3"/>`).join("")}
     <rect x="760" y="780" width="220" height="16" fill="#a86a3a" ${ol(2)}/><path d="M780 796 V860 M960 796 V860" ${ol(6)}/>
     <rect x="-120" y="760" width="240" height="100" fill="#a86a3a" ${ol(2)}/>`,
  );
}

// The sea from the hill: the road over the brow, grey sea, the town far off.
export function seaHill() {
  return svg(
    "0 0 1080 1100",
    `<defs><linearGradient id="sh-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9fb8d8"/><stop offset="1" stop-color="#f2e8d8"/></linearGradient></defs>
     <rect x="-600" width="2280" height="700" fill="url(#sh-sky)"/>
     <rect x="-600" y="480" width="2280" height="300" fill="#6a8aa8"/>
     ${Array.from({ length: 14 }, (_, k) => `<path class="wave" d="M${-500 + k * 160} ${520 + (k % 3) * 60} q20 -10 40 0 q20 10 40 0" stroke="#dfe8f0" stroke-width="4" fill="none"/>`).join("")}
     <path d="M-600 700 Q0 620 540 660 Q1100 620 1680 700 V1100 H-600Z" fill="#a8a86a"/>
     <path d="M480 1100 L520 660 H560 L600 1100Z" fill="#5a5e66"/>`,
  );
}
// Pebble beach with waves (.wave) and Petrovich's house further along.
export function beach() {
  return svg(
    "0 0 1080 1100",
    `<defs><linearGradient id="bc-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9fb8d8"/><stop offset="1" stop-color="#f2e8d8"/></linearGradient></defs>
     <rect x="-600" width="2280" height="600" fill="url(#bc-sky)"/>
     <rect x="-600" y="520" width="2280" height="300" fill="#6a8aa8"/>
     ${Array.from({ length: 12 }, (_, k) => `<path class="wave" d="M${-500 + k * 200} ${560 + (k % 3) * 70} q30 -14 60 0 q30 14 60 0" stroke="#dfe8f0" stroke-width="5" fill="none"/>`).join("")}
     <path class="surf" d="M-600 800 Q0 780 540 800 Q1100 780 1680 800 V830 Q1100 810 540 830 Q0 810 -600 830Z" fill="#f2f6fa"/>
     <rect x="-600" y="820" width="2280" height="400" fill="#b9b0a0"/>
     ${Array.from({ length: 60 }, (_, k) => `<ellipse cx="${((k * 83) % 2200) - 600}" cy="${840 + ((k * 37) % 240)}" rx="${10 + (k % 4) * 4}" ry="${7 + (k % 3) * 3}" fill="${["#8a8478", "#a8a090", "#6a6458"][k % 3]}"/>`).join("")}`,
  );
}
// Petrovich's white house with blue shutters, the note pinned to the door (.note).
export function house() {
  return svg(
    "0 0 1080 1100",
    `<defs><linearGradient id="hs-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e9a87a"/><stop offset="1" stop-color="#f2e0c8"/></linearGradient></defs>
     <rect x="-600" width="2280" height="800" fill="url(#hs-sky)"/>
     <rect x="-600" y="560" width="2280" height="200" fill="#6a8aa8"/>
     <rect x="240" y="440" width="600" height="420" fill="#f2efe6" ${ol()}/>
     <path d="M200 450 L540 260 L880 450Z" fill="#b9503a" ${ol()}/>
     ${[300, 680].map((x) => `<rect x="${x}" y="520" width="100" height="110" fill="#5a7a9a" ${ol(2.4)}/><rect x="${x - 34}" y="520" width="30" height="110" fill="#3a6aa8" ${ol(2)}/><rect x="${x + 104}" y="520" width="30" height="110" fill="#3a6aa8" ${ol(2)}/>`).join("")}
     <rect x="480" y="640" width="120" height="220" fill="#3a6aa8" ${ol()}/><circle cx="580" cy="750" r="6" fill="#c9a24a"/>
     <g class="note"><rect x="510" y="670" width="60" height="70" fill="#fffbe8" ${ol(1.6)} transform="rotate(-4 540 705)"/><path d="M520 686 h40 M520 700 h36 M520 714 h40" stroke="#6a6a6a" stroke-width="3"/></g>
     <rect x="-600" y="860" width="2280" height="400" fill="#c9b89a"/>
     <path d="M440 860 h200 v20 h-200z" fill="#8a3a4a"/>`,
  );
}
// Inside: whitewashed room, window onto the sea, a guitar on the wall, an old sofa (front drawn separately).
export function room() {
  return svg(
    "0 0 1080 1100",
    `<rect x="-600" width="2280" height="1100" fill="#ece6d8"/>
     <rect x="-600" y="0" width="2280" height="60" fill="#8a6a4a"/>
     <rect x="640" y="220" width="300" height="260" fill="#6a8aa8" ${ol()}/><rect x="640" y="380" width="300" height="100" fill="#4a6a88"/><path d="M790 220 V480 M640 350 H940" stroke="#f2efe6" stroke-width="12"/>
     <g transform="translate(260 260) rotate(-14)"><ellipse cx="0" cy="120" rx="60" ry="74" fill="#c98a4a" ${ol(2.4)}/><ellipse cx="0" cy="40" rx="44" ry="52" fill="#c98a4a" ${ol(2.4)}/><circle cx="0" cy="110" r="18" fill="#3a2a1e"/><rect x="-8" y="-160" width="16" height="190" fill="#6a4a2a" ${ol(2)}/></g>
     <rect x="40" y="480" width="140" height="200" fill="#a8805a" ${ol(2)}/>${[0, 1, 2].map((k) => `<rect x="54" y="${494 + k * 62}" width="112" height="50" fill="#8a6a4a"/>`).join("")}
     <rect x="-600" y="860" width="2280" height="600" fill="#a8805a"/>${Array.from({ length: 12 }, (_, i) => `<rect x="${-600 + i * 200}" y="860" width="196" height="600" fill="${i % 2 ? "#9a7450" : "#a8805a"}"/>`).join("")}
     <path d="M330 700 h420 v-120 q0 -30 -30 -30 h-360 q-30 0 -30 30z" fill="#6a8a6a" ${ol()}/>`,
  );
}
export function sofaFront() {
  return svg(
    "0 0 1080 1100",
    `<rect x="320" y="740" width="440" height="120" rx="24" fill="#7a9a7a" ${ol()}/>
     <rect x="290" y="680" width="60" height="180" rx="20" fill="#6a8a6a" ${ol()}/><rect x="730" y="680" width="60" height="180" rx="20" fill="#6a8a6a" ${ol()}/>
     <path d="M340 860 v20 M740 860 v20" ${ol(8)}/>`,
  );
}
// Grill smoke.
export const grill = (x, y) =>
  `<g transform="translate(${x} ${y})"><rect x="-80" y="-20" width="160" height="40" fill="#3a3a40" ${ol(2)}/><path d="M-60 -20 l120 0" stroke="#ff8a2b" stroke-width="6"/>${[0, 1, 2].map((k) => `<circle class="gsmoke" cx="${-30 + k * 30}" cy="${-50 - k * 20}" r="${20 + k * 6}" fill="#d8d0c8" opacity=".6"/>`).join("")}</g>`;
