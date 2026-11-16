// Part 4 art: the grandparents' wrecked flat, a sofa overlay, the garbage chute, the army truck.
const svg = (vb, body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}">${body}</svg>`;
const O = "#0b0d14";
const ol = (w = 3) =>
  `stroke="${O}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;

// Wrecked living room at night: torn wallpaper, broken window, overturned chair, papers, old wall clock.
export function flatWrecked() {
  return svg(
    "0 0 1080 1100",
    `<rect x="-600" width="2280" height="1100" fill="#2a2430"/>
     ${Array.from({ length: 20 }, (_, i) => `<rect x="${i * 56}" y="0" width="26" height="860" fill="#352e3a" opacity=".6"/>`).join("")}
     <path d="M120 200 l40 60 l-30 80 l50 40 M820 160 l-30 70 l40 50" stroke="#1d1820" stroke-width="10" fill="none"/>
     <rect x="640" y="160" width="320" height="300" fill="#05070d" stroke="#4a3e3a" stroke-width="14"/>
     <path d="M640 160 L760 300 L700 460 M960 160 L860 320 L960 400" stroke="#9fb0c8" stroke-width="3" fill="none" opacity=".7"/>
     <path d="M800 160 V460 M640 310 H960" stroke="#4a3e3a" stroke-width="8"/>
     <circle cx="300" cy="200" r="46" fill="#e9e3d0" ${ol()}/><path d="M300 200 V170 M300 200 L316 214" ${ol(4)}/>
     <rect x="-600" y="860" width="2280" height="600" fill="#3a2c22"/>
     ${Array.from({ length: 10 }, (_, i) => `<path d="M${i * 120} 860 L${i * 120 - 70} 1100" stroke="#2a2018" stroke-width="3"/>`).join("")}
     ${Array.from({ length: 12 }, (_, i) => `<rect x="${60 + ((i * 83) % 960)}" y="${900 + ((i * 37) % 160)}" width="44" height="30" fill="#e9e5dc" opacity=".8" transform="rotate(${i * 31} ${80 + ((i * 83) % 960)} ${915 + ((i * 37) % 160)})"/>`).join("")}
     <g transform="translate(860 840) rotate(-80)"><rect width="110" height="16" fill="#6a4a33"/><rect x="0" y="16" width="16" height="90" fill="#6a4a33"/><rect x="94" y="16" width="16" height="90" fill="#6a4a33"/></g>
     <path d="M140 800 h300 v-160 q0 -30 -30 -30 h-240 q-30 0 -30 30z" fill="#5a3a4a" ${ol()}/>`,
  );
}
// Sofa front (drawn over the grandparents so they read as seated).
export function sofaFront() {
  return svg(
    "0 0 1080 1100",
    `<rect x="120" y="760" width="460" height="110" rx="24" fill="#6a4a5a" ${ol()}/>
     <rect x="100" y="700" width="60" height="170" rx="20" fill="#5a3a4a" ${ol()}/><rect x="540" y="700" width="60" height="170" rx="20" fill="#5a3a4a" ${ol()}/>
     <path d="M150 870 v20 M560 870 v20" ${ol(8)}/>`,
  );
}

// Garbage chute on the stairwell wall (Maxim hides behind it).
export function chute() {
  return svg(
    "0 0 260 760",
    `<rect x="40" y="0" width="180" height="760" fill="#4a4f58" ${ol()}/>
     <path d="M40 120 H220 M40 380 H220 M40 640 H220" stroke="#2a2d34" stroke-width="6"/>
     <rect x="70" y="420" width="120" height="80" rx="6" fill="#3a3d44" ${ol()}/><rect x="90" y="440" width="80" height="20" fill="#2a2d34"/>
     <path d="M60 200 q30 20 20 60 M180 560 q-20 30 0 60" stroke="#6a5a4a" stroke-width="4" fill="none" opacity=".6"/>`,
  );
}

// Military truck with a canvas tarp, side view facing right. .tarp-flap drops over the back opening;
// the scene draws the prisoners in the opening.
export function truck() {
  return svg(
    "0 0 820 400",
    `<ellipse cx="410" cy="384" rx="390" ry="14" fill="#000" opacity=".4"/>
     <path d="M560 160 h140 q40 0 60 40 l40 60 v80 h-240z" fill="#3a4430" ${ol()}/>
     <rect x="600" y="180" width="110" height="70" rx="6" fill="#1d2433" ${ol(2.4)}/>
     <rect x="790" y="270" width="16" height="22" rx="4" fill="#ffe9a8" ${ol(2)}/>
     <rect x="20" y="300" width="760" height="50" fill="#2a3022" ${ol()}/>
     <path d="M20 300 V110 Q20 70 70 70 H540 Q560 70 560 110 V300Z" fill="#5a6040" ${ol()}/>
     ${Array.from({ length: 6 }, (_, i) => `<path d="M${100 + i * 80} 72 V300" stroke="#4a5034" stroke-width="5"/>`).join("")}
     <rect x="30" y="110" width="160" height="190" fill="#0a0b08"/>
     <g class="tarp-flap"><rect x="30" y="110" width="160" height="190" fill="#4f5638" ${ol(2)}/><path d="M40 130 h140 M40 200 h140 M40 270 h140" stroke="#3a4028" stroke-width="4"/></g>
     <g class="wheel" transform="translate(150 350)"><circle r="42" fill="#1a1a1e" ${ol()}/><circle r="18" fill="#6a6d74"/></g>
     <g class="wheel" transform="translate(440 350)"><circle r="42" fill="#1a1a1e" ${ol()}/><circle r="18" fill="#6a6d74"/></g>
     <g class="wheel" transform="translate(680 350)"><circle r="42" fill="#1a1a1e" ${ol()}/><circle r="18" fill="#6a6d74"/></g>`,
  );
}
