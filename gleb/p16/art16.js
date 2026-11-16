// Part 16 art: the medical tent, a hospital trolley, flames for the burning camp, the "Hive" pass.
const svg = (vb, body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}">${body}</svg>`;
const O = "#0b0d14";
const ol = (w = 3) =>
  `stroke="${O}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;

// Inside the medical tent: canvas walls, a red cross, a lamp, an IV stand, boxes of supplies.
export function medtent() {
  return svg(
    "0 0 1080 1100",
    `<rect x="-600" width="2280" height="1100" fill="#d8d4c4"/>
     <path d="M-600 0 L540 -80 L1680 0 V860 H-600Z" fill="#e2dece"/>${Array.from({ length: 9 }, (_, i) => `<path d="M${-400 + i * 260} 860 L540 -60" stroke="#c4c0ae" stroke-width="6"/>`).join("")}
     <path d="M460 200 h40 v-40 h40 v40 h40 v40 h-40 v40 h-40 v-40 h-40z" fill="#c9302c"/>
     <path d="M540 -60 V120" stroke="${O}" stroke-width="3"/><path class="lamp" d="M500 120 h80 l-14 30 h-52z" fill="#3a3a40" ${ol(2)}/><ellipse cx="540" cy="160" rx="260" ry="90" fill="#fff6d8" opacity=".25"/>
     <path d="M840 860 V420 M800 420 h80" ${ol(6)}/><rect x="820" y="430" width="40" height="70" rx="10" fill="#cfe8ff" opacity=".85" ${ol(2)}/><path d="M840 500 q-60 120 -180 200" stroke="#cfe8ff" stroke-width="4" fill="none"/>
     <rect x="60" y="720" width="160" height="140" fill="#a87a4a" ${ol(2)}/><rect x="80" y="660" width="120" height="60" fill="#c9a06a" ${ol(2)}/><path d="M120 680 h40 M140 664 v32" stroke="#c9302c" stroke-width="8"/>
     <rect x="-600" y="860" width="2280" height="600" fill="#8a8470"/>
     <rect x="300" y="760" width="460" height="40" rx="10" fill="#f2efe6" ${ol(2)}/><path d="M330 800 V860 M730 800 V860" ${ol(6)}/>`,
  );
}
// Hospital trolley (Masha lies on it; drawn under her).
export const trolley = (x, y) =>
  `<g transform="translate(${x} ${y})"><rect x="-200" y="-20" width="400" height="30" rx="8" fill="#f2efe6" ${ol(2)}/><path d="M-170 10 V70 M170 10 V70" ${ol(6)}/><circle cx="-170" cy="80" r="12" fill="#2a2a2e"/><circle cx="170" cy="80" r="12" fill="#2a2a2e"/><path d="M200 -20 l30 -40" ${ol(5)}/></g>`;
// A flame cluster for the burning camp (.flame flickers).
export const flames = (x, y, s = 1) =>
  `<g class="flame" transform="translate(${x} ${y}) scale(${s})"><path d="M-60 0 Q-70 -70 -24 -120 Q-24 -60 0 -80 Q12 -150 46 -170 Q36 -90 70 -66 Q80 -30 60 0Z" fill="#ff6a1b"/><path d="M-34 0 Q-34 -46 -6 -80 Q0 -46 16 -56 Q24 -92 40 -100 Q34 -46 46 0Z" fill="#ffd25a"/><ellipse cx="0" cy="-40" rx="140" ry="90" fill="#ff8a2b" opacity=".15"/></g>`;
// The "Hive" lab pass (close-up insert).
export function pass() {
  return svg(
    "0 0 1080 1100",
    `<rect x="-600" width="2280" height="1100" fill="#141820"/>
     <g transform="rotate(-4 540 550)"><rect x="200" y="360" width="680" height="420" rx="30" fill="#e9eef5" ${ol(4)}/>
     <rect x="200" y="360" width="680" height="90" rx="30" fill="#c9a02a"/><rect x="200" y="420" width="680" height="30" fill="#c9a02a"/>
     <path d="M250 405 l20 -12 l20 12 v24 l-20 12 l-20 -12z M290 405 l20 -12 l20 12 v24 l-20 12 l-20 -12z" fill="#2a2a2e"/>
     <text x="360" y="420" font-family="Inter, sans-serif" font-weight="900" font-size="40" fill="#2a2a2e">ЛАБОРАТОРИЯ «УЛЕЙ»</text>
     <rect x="240" y="490" width="170" height="220" fill="#9aa2ae" ${ol(2)}/><circle cx="325" cy="570" r="44" fill="#e0ae88"/><path d="M281 560 q44 -60 88 0" fill="#17181d"/><rect x="275" y="620" width="100" height="90" fill="#141418"/>
     <text x="440" y="540" font-family="Inter, sans-serif" font-weight="900" font-size="36" fill="#2a2a2e">СОКОЛОВ Г.</text>
     <text x="440" y="600" font-family="Inter, sans-serif" font-weight="700" font-size="30" fill="#5a5e66">ПОЗЫВНОЙ: ГУЛЬ</text>
     <text x="440" y="660" font-family="Inter, sans-serif" font-weight="900" font-size="34" fill="#c9302c">ДОСТУП: 3</text>
     <rect x="440" y="690" width="380" height="40" fill="#2a2a2e"/>${Array.from({ length: 30 }, (_, i) => `<rect x="${448 + i * 12}" y="694" width="${i % 3 ? 4 : 8}" height="32" fill="#e9eef5"/>`).join("")}</g>`,
  );
}
