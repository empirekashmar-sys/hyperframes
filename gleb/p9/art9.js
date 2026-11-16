// Part 9 art: the banya (steam room), the changing room with the sheepskin coat, an owl, firewood,
// a night tint for the dacha.
const svg = (vb, body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}">${body}</svg>`;
const O = "#0b0d14";
const ol = (w = 3) =>
  `stroke="${O}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;
const planks = (x, y, w, h, n, c1, c2) =>
  Array.from(
    { length: n },
    (_, i) =>
      `<rect x="${x}" y="${y + i * h}" width="${w}" height="${h - 3}" fill="${i % 2 ? c1 : c2}"/>`,
  ).join("");

// Steam room: plank walls, the shelf bench (полок), stove with stones (.stones), bucket and ladle.
export function banya() {
  return svg(
    "0 0 1080 1100",
    `<rect x="-600" width="2280" height="1100" fill="#b07a4a"/>${planks(-600, 0, 2280, 40, 28, "#a8703f", "#b98450")}
     <rect x="680" y="180" width="120" height="90" fill="#e9eef5" ${ol(2.4)}/><path d="M740 180 V270" stroke="#7a4a26" stroke-width="6"/>
     <path d="M-600 700 H600 V740 H-600Z" fill="#c9965e" ${ol(2.4)}/><path d="M-600 740 H600 V760 H-600Z" fill="#8a5a34"/>
     ${[0, 1, 2, 3].map((k) => `<rect x="${-100 + k * 200}" y="760" width="20" height="100" fill="#8a5a34"/>`).join("")}
     <rect x="720" y="560" width="230" height="300" rx="10" fill="#3a3a40" ${ol()}/>
     <g class="stones">${Array.from({ length: 9 }, (_, k) => `<ellipse cx="${745 + (k % 5) * 44}" cy="${560 - Math.floor(k / 5) * 26}" rx="24" ry="16" fill="#6a6e76" ${ol(1.8)}/>`).join("")}</g>
     <rect x="760" y="700" width="150" height="80" fill="#1a1410" ${ol(2)}/><path d="M780 780 Q800 730 830 750 Q850 710 880 780Z" fill="#ff8a2b"/>
     <path d="M560 860 L580 780 H660 L680 860Z" fill="#8a5a34" ${ol(2.4)}/><path d="M575 800 H665" stroke="#3a3a40" stroke-width="6"/>
     <rect x="-600" y="860" width="2280" height="600" fill="#7a4a26"/>
     ${planks(-600, 860, 2280, 30, 8, "#6a3e1e", "#7a4a26")}`,
  );
}
// Changing room: bench, the sheepskin coat on a hook with a pocket (.pocket), boots, a small window.
export function changing() {
  return svg(
    "0 0 1080 1100",
    `<rect x="-600" width="2280" height="1100" fill="#8a5a34"/>${planks(-600, 0, 2280, 44, 26, "#7a4e2c", "#8a5a34")}
     <rect x="120" y="200" width="140" height="120" fill="#2a3a5a" ${ol(2.4)}/><path d="M190 200 V320 M120 260 H260" stroke="#5a3a26" stroke-width="6"/>
     <rect x="560" y="250" width="16" height="30" fill="#3a3a40"/>
     <g class="coat"><path d="M568 270 L470 330 L450 760 H690 L670 330Z" fill="#c9a06a" ${ol()}/><path d="M568 270 L540 760 M568 270 L600 760" stroke="#a8804a" stroke-width="5"/><path d="M470 330 Q568 300 670 330 L660 380 Q568 350 480 380Z" fill="#f2efe6" ${ol(2)}/>
       <rect class="pocket" x="600" y="560" width="70" height="70" rx="8" fill="#b98a54" ${ol(2)}/></g>
     <path d="M-600 760 H1680 V800 H-600Z" fill="#c9965e" ${ol(2)}/>
     <path d="M780 860 v-70 q0 -10 10 -10 h30 v80z M840 860 v-70 q0 -10 10 -10 h30 v80z" fill="#2a2a2e" ${ol(2)}/>
     <rect x="-600" y="860" width="2280" height="600" fill="#6a3e1e"/>`,
  );
}
// Owl on a branch; .owl-eyes widen.
export const owl = (x, y) =>
  `<g class="owl" transform="translate(${x} ${y})"><path d="M-80 30 H90" stroke="#3a2a1e" stroke-width="10"/><ellipse cx="0" cy="0" rx="30" ry="38" fill="#8a6a4a" ${ol(2)}/><path d="M-26 -30 l6 -16 l10 12 M26 -30 l-6 -16 l-10 12" fill="#8a6a4a" ${ol(2)}/>
   <g class="owl-eyes"><circle cx="-12" cy="-10" r="10" fill="#ffe27a" ${ol(1.6)}/><circle cx="12" cy="-10" r="10" fill="#ffe27a" ${ol(1.6)}/><circle cx="-12" cy="-10" r="4" fill="${O}"/><circle cx="12" cy="-10" r="4" fill="${O}"/></g>
   <path d="M-4 2 L0 10 L4 2Z" fill="#e9a03a"/></g>`;
// Small toy hare (held / in the pocket).
export const hare = (cls, x, y, s = 1) =>
  `<g class="${cls}"><g transform="translate(${x} ${y}) scale(${s})"><ellipse cx="0" cy="0" rx="26" ry="22" fill="#d8d0c6" ${ol(2)}/><circle cx="0" cy="-30" r="18" fill="#d8d0c6" ${ol(2)}/><path d="M-8 -44 q-6 -34 4 -40 q6 6 4 40 M8 -44 q6 -34 14 -36 q2 8 -6 38" fill="#d8d0c6" ${ol(2)}/><circle cx="-6" cy="-32" r="2.6" fill="${O}"/><circle cx="6" cy="-32" r="2.6" fill="${O}"/></g></g>`;
// A bundle of firewood carried under the arm.
export const firewood = (x, y) =>
  `<g transform="translate(${x} ${y})">${[0, 1, 2, 3].map((k) => `<rect x="-50" y="${k * 16 - 30}" width="100" height="16" rx="8" fill="#e9dcc0" ${ol(1.8)}/><circle cx="${-50 + (k % 2) * 100}" cy="${k * 16 - 22}" r="7" fill="#c9a06a" ${ol(1.4)}/>`).join("")}</g>`;
// Steam clouds (.puff animate up).
export const steam = (cls, x, y, n = 6) =>
  `<g class="${cls}">${Array.from({ length: n }, (_, i) => `<circle class="puff" cx="${x + ((i * 53) % 260) - 130}" cy="${y - (i % 3) * 60}" r="${70 + (i % 3) * 30}" fill="#fff" opacity=".35"/>`).join("")}</g>`;

// Porch at night: a huge moon over the wood, the log wall with a lit doorway, the porch rail.
export function moonPorch() {
  return svg(
    "0 0 1080 1100",
    `<defs><radialGradient id="mp-sky" cx=".6" cy=".25" r=".9"><stop offset="0" stop-color="#2a3a6a"/><stop offset="1" stop-color="#05081a"/></radialGradient></defs>
     <rect x="-600" width="2280" height="1100" fill="url(#mp-sky)"/>
     ${Array.from({ length: 40 }, (_, k) => `<circle cx="${((k * 173) % 1680) - 300}" cy="${(k * 89) % 520}" r="${1 + (k % 3)}" fill="#fff" opacity=".7"/>`).join("")}
     <circle cx="700" cy="300" r="260" fill="#f3ecd2" opacity=".08"/><circle class="moon" cx="700" cy="300" r="170" fill="#f3ecd2"/>
     <circle cx="640" cy="260" r="30" fill="#e0d8bc"/><circle cx="760" cy="350" r="22" fill="#e0d8bc"/><circle cx="730" cy="230" r="14" fill="#e0d8bc"/>
     ${Array.from({ length: 12 }, (_, k) => `<path d="M${-300 + k * 170} 760 L${-240 + k * 170} ${560 - (k % 3) * 50} L${-180 + k * 170} 760Z" fill="#0a1424"/>`).join("")}
     <rect x="-600" y="740" width="2280" height="400" fill="#c9d4e4"/>
     <rect x="-600" y="0" width="400" height="900" fill="#3a2a1e"/>${Array.from({ length: 18 }, (_, i) => `<rect x="-600" y="${i * 50}" width="400" height="46" rx="20" fill="${i % 2 ? "#4a3424" : "#3e2c1e"}"/>`).join("")}
     <rect x="-120" y="440" width="140" height="420" fill="#ffcf7a" opacity=".85"/>
     <rect x="-200" y="860" width="1400" height="40" fill="#5a3a26" stroke="${O}" stroke-width="3"/>`,
  );
}
// Porch rail in front (hides legs).
export function porchRail() {
  return svg(
    "0 0 1080 1100",
    `<rect x="-200" y="900" width="1400" height="300" fill="#4a3020"/>
     <rect x="-200" y="900" width="1400" height="24" fill="#6a4630" stroke="${O}" stroke-width="3"/>
     ${Array.from({ length: 16 }, (_, i) => `<rect x="${-180 + i * 90}" y="924" width="22" height="200" fill="#6a4630" stroke="${O}" stroke-width="2"/>`).join("")}
     <path d="M-200 900 q60 -14 140 -6 q80 -12 160 0 q100 -14 200 -2 q140 -10 300 0 q160 -12 400 -4" fill="#f2f6fa"/>`,
  );
}
