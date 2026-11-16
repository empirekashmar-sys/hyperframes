// Part 17 art: the roadside shop (outside and in), the yellow bus (side view and inside),
// a blinking tracker dot for the pass.
const svg = (vb, body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}">${body}</svg>`;
const O = "#0b0d14";
const ol = (w = 3) =>
  `stroke="${O}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;

// Shop by the road at dawn: sign, big window (.glass breaks), door, a car park.
export function shop() {
  return svg(
    "0 0 1080 1100",
    `<defs><linearGradient id="sp-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5a6a9a"/><stop offset="1" stop-color="#f2b88a"/></linearGradient></defs>
     <rect x="-600" width="2280" height="860" fill="url(#sp-sky)"/>
     <rect x="160" y="440" width="760" height="420" fill="#d9d2c2" ${ol()}/><rect x="140" y="420" width="800" height="30" fill="#8a8d96" ${ol(2)}/>
     <rect x="240" y="470" width="600" height="70" fill="#c9302c" ${ol(2)}/><text x="540" y="518" text-anchor="middle" font-family="Inter, sans-serif" font-weight="900" font-size="40" fill="#fff">ПРОДУКТЫ 24</text>
     <g class="glass"><rect x="200" y="580" width="420" height="230" fill="#3a4a5a" ${ol(2.4)}/><path d="M410 580 V810" stroke="${O}" stroke-width="3"/><path d="M220 600 l60 50 M480 600 l-40 70" stroke="#9fb0c8" stroke-width="3"/></g>
     <rect x="680" y="600" width="140" height="260" fill="#5a3a26" ${ol()}/><circle cx="800" cy="730" r="7" fill="#c9a24a"/>
     <rect x="-600" y="860" width="2280" height="1200" fill="#5a5e66"/>
     ${Array.from({ length: 8 }, (_, i) => `<path d="M${-200 + i * 220} 980 h120" stroke="#e9e3c9" stroke-width="8"/>`).join("")}`,
  );
}
// Inside the dark shop: shelves with tins, a fridge, a till.
export function shopIn() {
  const shelf = (x) =>
    `<rect x="${x}" y="380" width="220" height="480" fill="#6a5a4a" ${ol(2.4)}/>${[0, 1, 2, 3].map((k) => `<rect x="${x}" y="${470 + k * 100}" width="220" height="12" fill="#4a3a2a"/>${Array.from({ length: 5 }, (_, j) => `<rect x="${x + 12 + j * 42}" y="${430 + k * 100}" width="30" height="40" rx="4" fill="${["#c9302c", "#e9c46a", "#5a8ac9", "#8ac95a"][(j + k) % 4]}" opacity=".8"/>`).join("")}`).join("")}`;
  return svg(
    "0 0 1080 1100",
    `<rect x="-600" width="2280" height="1100" fill="#2a2a30"/>
     <rect x="-600" y="0" width="2280" height="80" fill="#1a1a1e"/><rect x="440" y="60" width="200" height="20" fill="#e9eef5" opacity=".25"/>
     ${shelf(-180)}${shelf(120)}${shelf(700)}${shelf(1000)}
     <rect x="420" y="420" width="220" height="440" fill="#9aa2ae" ${ol(2.4)}/><rect x="440" y="440" width="180" height="400" fill="#3a4a5a" opacity=".8"/>
     <rect x="-600" y="860" width="2280" height="600" fill="#3a3a40"/>
     <path d="M440 120 L300 860 H780 L640 120Z" fill="#fff6d8" opacity=".06"/>`,
  );
}
// The yellow bus, side view facing right (wheels .wheel, door .bdoor).
export const bus = (cls, x, y, s = 1) =>
  `<g class="${cls}"><g transform="translate(${x} ${y}) scale(${s})">
   <path d="M0 -300 H560 Q640 -300 660 -240 L680 -40 H0Z" fill="#e9b82a" ${ol()}/>
   <rect x="0" y="-60" width="680" height="30" fill="#2a2a2e"/>
   ${Array.from({ length: 6 }, (_, i) => `<rect x="${30 + i * 90}" y="-270" width="70" height="80" rx="6" fill="#3a4a5a" ${ol(2)}/>`).join("")}
   <path d="M580 -280 Q640 -276 652 -200 H580Z" fill="#3a4a5a" ${ol(2)}/>
   <g class="bdoor"><rect x="580" y="-190" width="60" height="140" fill="#3a4a5a" ${ol(2)}/></g>
   <path d="M20 -150 H560" stroke="#2a2a2e" stroke-width="6"/>
   <rect x="660" y="-120" width="24" height="22" rx="4" fill="#ffe9a8" ${ol(1.6)}/>
   <g class="wheel" transform="translate(130 -20)"><circle r="44" fill="#1a1a1e" ${ol()}/><circle r="18" fill="#8a8d96"/></g>
   <g class="wheel" transform="translate(540 -20)"><circle r="44" fill="#1a1a1e" ${ol()}/><circle r="18" fill="#8a8d96"/></g></g></g>`;
// Inside the bus: seats in rows, windows with the passing steppe.
export function busIn() {
  return svg(
    "0 0 1080 1100",
    `<rect x="-600" width="2280" height="1100" fill="#c9b48a"/>
     <rect x="-600" y="180" width="2280" height="300" fill="#2a2a30"/>
     <g class="street">${Array.from({ length: 14 }, (_, i) => `<rect x="${-600 + i * 180}" y="200" width="160" height="260" fill="#9ab0c8"/><path d="M${-600 + i * 180} 400 h160" stroke="#a8a86a" stroke-width="60"/>`).join("")}</g>
     ${Array.from({ length: 12 }, (_, i) => `<rect x="${-600 + i * 180 - 10}" y="180" width="20" height="300" fill="#c9b48a"/>`).join("")}
     <path d="M-600 480 H1680" stroke="#8a7a5a" stroke-width="10"/>
     <rect x="-600" y="860" width="2280" height="600" fill="#5a5048"/>
     ${[-300, 100, 820, 1220].map((x) => `<rect x="${x}" y="700" width="220" height="40" rx="10" fill="#8a3a3a" ${ol(2)}/><rect x="${x + 180}" y="560" width="40" height="180" rx="10" fill="#8a3a3a" ${ol(2)}/><path d="M${x + 20} 740 V860 M${x + 200} 740 V860" ${ol(5)}/>`).join("")}`,
  );
}
// Seat backs in front (drawn over passengers sitting in a row).
export function seatsFront() {
  return svg(
    "0 0 1080 1100",
    `${[-300, 100, 820, 1220].map((x) => `<rect x="${x - 10}" y="780" width="240" height="120" rx="12" fill="#9a4a4a" ${ol(2)}/>`).join("")}`,
  );
}
