// Part 19 art: the steppe seen from the air, the roadside gas station (Maxim and Zina on its roof,
// the yellow bus by the pumps), the hill behind which the helicopters land, the horde's dust cloud.
const svg = (vb, body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}">${body}</svg>`;
const O = "#0b0d14";
const ol = (w = 3) =>
  `stroke="${O}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;

// Dawn steppe from a low-flying helicopter: the ground strip scrolls (.ground).
export function skyRun() {
  return svg(
    "0 0 1080 1100",
    `<defs><linearGradient id="sr-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a4a7a"/><stop offset="1" stop-color="#f2b88a"/></linearGradient></defs>
     <rect x="-600" width="2280" height="900" fill="url(#sr-sky)"/>
     <circle cx="200" cy="640" r="80" fill="#ffd27a"/><circle cx="200" cy="640" r="150" fill="#ffd27a" opacity=".2"/>
     <g class="ground"><path d="M-600 760 Q0 720 600 750 Q1200 720 1800 750 Q2400 720 3000 750 V1400 H-600Z" fill="#a8a86a"/>
       ${Array.from({ length: 40 }, (_, k) => `<path d="M${-600 + k * 90} ${800 + (k % 4) * 30} q8 -20 16 0" stroke="#7a8a4a" stroke-width="3" fill="none"/>`).join("")}
       <path d="M-600 900 H3000" stroke="#5a5e66" stroke-width="40"/><path d="M-600 900 H3000" stroke="#e9e3c9" stroke-width="4" stroke-dasharray="40 40"/></g>
     <rect x="-600" y="1100" width="2280" height="1000" fill="#a8a86a"/>`,
  );
}

// Roadside gas station, back layer: sky, the steppe hill, the dust cloud (horde runs between layers).
export function stationBack() {
  return svg(
    "0 0 1080 1100",
    `<defs><linearGradient id="gs-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8fb4dc"/><stop offset="1" stop-color="#f2dcb8"/></linearGradient></defs>
     <rect x="-600" width="2280" height="760" fill="url(#gs-sky)"/>
     <path d="M-600 740 Q200 660 900 700 Q1300 680 1680 720 V1100 H-600Z" fill="#b8b06a"/>
     <g class="dust" opacity="0">${Array.from({ length: 10 }, (_, i) => `<ellipse cx="${-200 + i * 160}" cy="${690 - (i % 3) * 20}" rx="${120 + (i % 3) * 30}" ry="${50 + (i % 2) * 20}" fill="#d9c79a" opacity=".85"/>`).join("")}</g>
`,
  );
}
// Gas station, front layer: canopy, pumps, a shop with a flat roof (people stand on it), the road.
export function stationFront() {
  return svg(
    "0 0 1080 1100",
    `<rect x="560" y="430" width="440" height="430" fill="#e9e3d6" ${ol()}/><rect x="540" y="410" width="480" height="30" fill="#8a8d96" ${ol(2)}/>
     <rect x="620" y="520" width="160" height="120" fill="#3a4a5a" ${ol(2)}/><rect x="840" y="560" width="100" height="300" fill="#5a3a26" ${ol(2)}/>
     <rect x="640" y="460" width="300" height="44" fill="#c9302c" ${ol(2)}/><text x="790" y="492" text-anchor="middle" font-family="Inter, sans-serif" font-weight="900" font-size="28" fill="#fff">АЗС 24</text>
     <rect x="-300" y="440" width="760" height="30" fill="#e9b82a" ${ol(2.4)}/><path d="M-240 470 V860 M380 470 V860" ${ol(14)}/><path d="M-240 470 V860 M380 470 V860" stroke="#c9ccd2" stroke-width="10"/>
     ${[-60, 200].map((x) => `<rect x="${x}" y="660" width="70" height="200" rx="8" fill="#c9302c" ${ol(2.4)}/><rect x="${x + 12}" y="690" width="46" height="40" fill="#3a4a5a"/>`).join("")}
     <rect x="-600" y="860" width="2280" height="1300" fill="#7a7e86"/><path d="M-600 960 H1680" stroke="#e9e3c9" stroke-width="6" stroke-dasharray="60 50"/>`,
  );
}

// One infected silhouette, arms forward.
const fig = (x, y, s, c) =>
  `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-16 0 l4 -50 h24 l4 50 M-14 -48 l-6 -44 h40 l-6 44 M-20 -84 l-22 18 M20 -84 l22 18" fill="${c}" stroke="${c}" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/><circle cx="0" cy="-106" r="16" fill="${c}"/><circle cx="-6" cy="-108" r="3" fill="#cfe9ff"/><circle cx="6" cy="-108" r="3" fill="#cfe9ff"/></g>`;
// A row of the horde running over the hill.
export const hordeRow = (cls, y, n, s, c, x0 = -500, dx = 90) =>
  `<g class="${cls}" opacity="0">${Array.from({ length: n }, (_, i) => fig(x0 + i * dx + ((i * 37) % 30), y + ((i * 53) % 18), s * (0.9 + ((i * 7) % 3) * 0.08), c)).join("")}</g>`;
