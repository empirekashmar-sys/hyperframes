// Part 10 art: the broken bed's book stack, packing on the table, the map, a snow cap for the car,
// snowy fields seen through the windscreen (day or sunset), an abandoned petrol station, a ginger cat,
// passports and a jerrycan.
const svg = (vb, body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}">${body}</svg>`;
const O = "#0b0d14";
const ol = (w = 3) =>
  `stroke="${O}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;

// Stack of books propping up the broken bed corner.
export const books = (x, y) =>
  `<g transform="translate(${x} ${y})">${["#8a3a3a", "#3a5a8a", "#c9a24a", "#3a7a5a", "#6a4a7a"].map((c, i) => `<rect x="${-50 + (i % 2) * 8}" y="${-i * 26}" width="100" height="24" rx="3" fill="${c}" ${ol(2)}/>`).join("")}</g>`;

// Packing on the kitchen table: duffel bag, tins of stew, matches, the axe, a folded map.
export function packing() {
  return svg(
    "0 0 1080 1100",
    `<path d="M120 820 H960 L990 860 H90Z" fill="#c9a06a" ${ol()}/><rect x="110" y="860" width="860" height="260" fill="#8a5e3c" ${ol()}/>
     <g class="bag" transform="translate(-20 246) scale(.7)"><path d="M180 820 Q170 740 260 730 H400 Q470 740 460 820Z" fill="#3a4a5a" ${ol()}/><path d="M240 735 Q320 680 400 735" stroke="#2a3440" stroke-width="10" fill="none"/></g>
     <g class="cans">${[0, 1, 2].map((k) => `<rect x="${520 + k * 50}" y="770" width="40" height="52" rx="5" fill="#b9c0cc" ${ol(2)}/><rect x="${520 + k * 50}" y="786" width="40" height="18" fill="#c9302c"/>`).join("")}</g>
     <rect x="700" y="800" width="40" height="22" rx="3" fill="#e9c46a" ${ol(2)}/>
     <g class="map"><rect x="770" y="790" width="150" height="34" fill="#e9e3c9" ${ol(2)}/><path d="M790 800 l30 12 l30 -10 l30 14" stroke="#c9302c" stroke-width="3" fill="none"/></g>`,
  );
}
// The map, unfolded (close-up insert).
export function bigMap() {
  return svg(
    "0 0 1080 1100",
    `<rect x="-600" width="2280" height="1100" fill="#8a5e3c"/>
     <rect x="140" y="240" width="800" height="620" fill="#ece4cc" ${ol(4)}/>
     <path d="M140 450 H940 M140 650 H940 M410 240 V860 M670 240 V860" stroke="#c9bf9e" stroke-width="3"/>
     <path d="M200 300 Q300 360 260 460 Q240 560 340 600 Q460 640 520 720 Q600 800 760 790" stroke="#3a6aa8" stroke-width="10" fill="none"/>
     <path d="M140 820 Q400 760 940 810 V860 H140Z" fill="#7ab0d8"/>
     <text x="600" y="845" font-family="Inter, sans-serif" font-weight="900" font-size="34" fill="#2a4a7a">МОРЕ</text>
     <circle cx="260" cy="330" r="12" fill="#3a7a3a"/><text x="285" y="340" font-family="Inter, sans-serif" font-weight="900" font-size="28" fill="#2a2a2a">ДАЧА</text>
     <path class="route" d="M260 330 Q420 420 480 560 Q560 700 720 790" stroke="#c9302c" stroke-width="8" stroke-dasharray="20 14" fill="none"/>
     <path d="M720 760 l-14 30 h28z" fill="#c9302c"/>
     <path d="M140 560 H940" stroke="#6a4a7a" stroke-width="5" stroke-dasharray="4 10"/>`,
  );
}

// Snow piled on top of the car (drawn over the car; slides off when it starts).
export const snowCap = (x, y, w) =>
  `<path d="M${x + w * 0.1} ${y} Q${x + w * 0.3} ${y - 50} ${x + w * 0.55} ${y - 40} Q${x + w * 0.8} ${y - 46} ${x + w * 0.95} ${y + 10} Z" fill="#f2f6fa" ${ol(2.4)}/>`;

// The view through the windscreen: snowy fields (or sunset), poles sliding past (.street scrolls).
export function fields({ sunset = false, night = false } = {}) {
  const top = night ? "#05060c" : sunset ? "#3a2a5a" : "#8fb4dc";
  const bot = night ? "#141828" : sunset ? "#ff9a5a" : "#e9eef5";
  return svg(
    "0 0 1080 1100",
    `<defs><linearGradient id="fd-sky${sunset ? "s" : night ? "n" : "d"}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${top}"/><stop offset="1" stop-color="${bot}"/></linearGradient></defs>
     <rect x="-600" width="2280" height="1300" fill="url(#fd-sky${sunset ? "s" : night ? "n" : "d"})"/>
     ${sunset ? `<circle cx="760" cy="430" r="90" fill="#ffd27a"/>` : night ? "" : `<circle cx="820" cy="200" r="60" fill="#fff6d8"/>`}
     <g class="street">${Array.from({ length: 16 }, (_, i) => `<path d="M${i * 180 - 300} 470 L${i * 180 - 260} 400 L${i * 180 - 220} 470Z" fill="${night ? "#0a1018" : sunset ? "#3a2a3a" : "#5a7a6a"}"/><path d="M${i * 180 - 200} 600 V400" stroke="${night ? "#1a1a22" : "#4a3a2e"}" stroke-width="6"/>`).join("")}</g>
     <rect x="-600" y="470" width="2280" height="830" fill="${night ? "#1a1e2c" : sunset ? "#e9b8a0" : "#f2f6fa"}"/>
     <path d="M440 1300 L520 470 H560 L640 1300Z" fill="${night ? "#2a2c34" : "#6a6e78"}"/>
     <path d="M540 480 V1300" stroke="#e9e3c9" stroke-width="6" stroke-dasharray="30 40" class="lane"/>
     <path d="M60 120 Q540 60 1020 120 L1060 720 H20Z" fill="none" stroke="#1a1d26" stroke-width="40"/>
     <rect x="420" y="96" width="240" height="40" rx="10" fill="#1a1d26"/>`,
  );
}

// Abandoned petrol station by the road in the snow.
export function station() {
  return svg(
    "0 0 1080 1100",
    `<defs><linearGradient id="ps-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9fb8d8"/><stop offset="1" stop-color="#e9eef5"/></linearGradient></defs>
     <rect x="-600" width="2280" height="900" fill="url(#ps-sky)"/>
     <rect x="160" y="300" width="760" height="40" fill="#c9302c" ${ol()}/><text x="540" y="332" text-anchor="middle" font-family="Inter, sans-serif" font-weight="900" font-size="30" fill="#fff">АЗС  №17</text>
     <path d="M240 340 V760 M840 340 V760" stroke="#9aa2ae" stroke-width="18"/>
     <rect x="640" y="520" width="340" height="240" fill="#d9d2c2" ${ol()}/><rect x="680" y="560" width="120" height="90" fill="#3a4a5a" ${ol(2)}/><path d="M690 570 l40 40 M760 580 l-30 50" stroke="#9fb0c8" stroke-width="3"/>
     <rect x="840" y="600" width="80" height="160" fill="#5a3a26" ${ol(2)}/>
     <g class="pump"><rect x="440" y="560" width="110" height="200" rx="8" fill="#e9e3c9" ${ol()}/><rect x="460" y="590" width="70" height="40" fill="#2a3a2a" ${ol(2)}/><path d="M550 620 q40 0 40 60 v40" stroke="${O}" stroke-width="6" fill="none"/></g>
     <path d="M-600 760 Q0 740 540 750 Q1100 740 1680 760 V1100 H-600Z" fill="#f2f6fa"/>
     <path d="M-600 860 H1680" stroke="#b9c6d6" stroke-width="40"/>`,
  );
}
// Ginger cat, sitting (side-ish view facing the viewer).
export const cat = (cls, x, y, s = 1) =>
  `<g class="${cls}"><g transform="translate(${x} ${y}) scale(${s})"><path d="M-30 0 Q-36 -50 0 -54 Q36 -50 30 0Z" fill="#e0882e" ${ol(2.4)}/><path d="M28 -6 q40 -6 30 -40" stroke="#e0882e" stroke-width="10" fill="none" stroke-linecap="round"/><path d="M28 -6 q40 -6 30 -40" stroke="${O}" stroke-width="14" fill="none" stroke-linecap="round" opacity=".25"/>
   <circle cx="0" cy="-70" r="26" fill="#e0882e" ${ol(2.4)}/><path d="M-22 -84 L-20 -106 L-6 -92Z M22 -84 L20 -106 L6 -92Z" fill="#e0882e" ${ol(2)}/>
   <path d="M-12 -84 l6 4 M12 -84 l-6 4 M-10 -60 h20" stroke="#b05a1a" stroke-width="3"/>
   <g class="cat-eyes"><ellipse cx="-9" cy="-72" rx="4" ry="5" fill="#3a6a2a"/><ellipse cx="9" cy="-72" rx="4" ry="5" fill="#3a6a2a"/></g>
   <path d="M-4 -64 h8 l-4 4z" fill="#d06a8a"/><path d="M-30 -64 h-16 M-30 -60 h-14 M30 -64 h16 M30 -60 h14" stroke="${O}" stroke-width="1.6"/></g></g>`;
// Two old passports (held up).
export const passports = (cls, x, y) =>
  `<g class="${cls}" opacity="0"><g transform="translate(${x} ${y})"><rect x="-56" y="-36" width="50" height="70" rx="4" fill="#8a2a2a" ${ol(2)}/><rect x="6" y="-30" width="50" height="70" rx="4" fill="#8a2a2a" ${ol(2)}/><circle cx="-31" cy="-6" r="10" fill="#c9a24a"/><circle cx="31" cy="0" r="10" fill="#c9a24a"/></g></g>`;
// Jerrycan.
export const jerrycan = (cls, x, y) =>
  `<g class="${cls}" opacity="0"><g transform="translate(${x} ${y})"><rect x="-30" y="-40" width="60" height="80" rx="8" fill="#3a6a3a" ${ol(2.4)}/><path d="M-20 -40 v-14 h26 v14" stroke="${O}" stroke-width="4" fill="none"/><path d="M-22 -26 L22 30 M22 -26 L-22 30" stroke="#2a4a2a" stroke-width="4"/></g></g>`;
