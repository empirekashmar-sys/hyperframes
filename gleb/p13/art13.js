// Part 13 art: the refugee camp (entrance with the volunteers' table), a wide row of numbered tents,
// a lamp with trousers hanging off it, a plate of pies, a note.
const svg = (vb, body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}">${body}</svg>`;
const O = "#0b0d14";
const ol = (w = 3) =>
  `stroke="${O}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;

const tent = (x, y, s, n, c = "#5a6a4a") =>
  `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-130 0 L0 -150 L130 0Z" fill="${c}" ${ol(2.4)}/><path d="M0 -150 L-34 0 H34Z" fill="#2a3022"/>${n ? `<rect x="-36" y="-110" width="72" height="34" rx="4" fill="#f2efe6" ${ol(1.6)}/><text x="0" y="-84" text-anchor="middle" font-family="Inter, sans-serif" font-weight="900" font-size="26" fill="#2a2a2e">${n}</text>` : ""}</g>`;

// Camp entrance at dusk: rows of tents, a queue at a water tank, the volunteers' table and a banner.
export function camp() {
  return svg(
    "0 0 1080 1100",
    `<defs><linearGradient id="cp-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a3a6a"/><stop offset="1" stop-color="#e9a87a"/></linearGradient></defs>
     <rect x="-600" width="2280" height="800" fill="url(#cp-sky)"/>
     ${Array.from({ length: 14 }, (_, i) => tent(-500 + i * 170, 720 - (i % 2) * 20, 0.6, "", i % 3 ? "#5a6a4a" : "#3a5a8a")).join("")}
     ${Array.from({ length: 10 }, (_, i) => tent(-400 + i * 230, 800, 0.8, "", i % 2 ? "#6a7a5a" : "#4a6a8a")).join("")}
     <rect x="-600" y="800" width="2280" height="1200" fill="#8a7a5a"/>
     <rect x="160" y="560" width="760" height="70" fill="#f2efe6" ${ol()}/><text x="540" y="608" text-anchor="middle" font-family="Inter, sans-serif" font-weight="900" font-size="38" fill="#c9302c">ПУНКТ ВРЕМЕННОГО РАЗМЕЩЕНИЯ</text>
     <path d="M180 630 V860 M900 630 V860" ${ol(8)}/>
     <rect x="680" y="760" width="280" height="24" fill="#a87a4a" ${ol(2)}/><path d="M700 784 V860 M940 784 V860" ${ol(6)}/>
     <rect x="720" y="730" width="90" height="30" fill="#f2efe6" ${ol(1.6)}/><path d="M730 740 h70 M730 750 h60" stroke="#6a6a6a" stroke-width="3"/>
     <rect x="-80" y="700" width="140" height="160" rx="10" fill="#3a6aa8" ${ol(2)}/>
     ${Array.from({ length: 4 }, (_, i) => `<g transform="translate(${-180 - i * 60} 860)"><circle cy="-120" r="16" fill="#3a3a40"/><rect x="-16" y="-104" width="32" height="104" rx="8" fill="#3a3a40"/></g>`).join("")}`,
  );
}
// A row of numbered tents (wide: 2160) for walking along.
export function row() {
  return svg(
    "0 0 2160 1100",
    `<defs><linearGradient id="rw-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a2a5a"/><stop offset="1" stop-color="#d98a6a"/></linearGradient></defs>
     <rect x="-400" width="2960" height="800" fill="url(#rw-sky)"/>
     ${Array.from({ length: 18 }, (_, i) => tent(-300 + i * 160, 700, 0.5, "", "#4a5a4a")).join("")}
     <rect x="-400" y="760" width="2960" height="1300" fill="#8a7a5a"/>
     ${[41, 42, 43, 44, 45, 46, 47].map((n, i) => tent(-100 + i * 330, 860, 1.25, n, i === 6 ? "#3a5a8a" : i % 2 ? "#6a7a5a" : "#5a6a4a")).join("")}
     ${Array.from({ length: 8 }, (_, i) => `<path d="M${60 + i * 330} 860 l20 -40 l20 40" stroke="#3a2a1e" stroke-width="5" fill="none"/>`).join("")}
     <path d="M-400 1000 H2560" stroke="#7a6a4a" stroke-width="40"/>`,
  );
}
// Ceiling lamp with trousers hanging off it.
export const lamp = (x, y) =>
  `<g transform="translate(${x} ${y})"><path d="M0 -200 V-40" stroke="${O}" stroke-width="4"/><path d="M-60 0 Q0 -70 60 0Z" fill="#e9c46a" ${ol(2.4)}/>
   <g class="pants"><path d="M10 -20 L60 -40 L100 90 L80 96 L54 10 L40 100 L18 96Z" fill="#56603e" ${ol(2)}/></g></g>`;
export const pies = (cls, x, y) =>
  `<g class="${cls}"><g transform="translate(${x} ${y})"><ellipse cx="0" cy="0" rx="60" ry="16" fill="#f2efe6" ${ol(2)}/>${[-30, 0, 30, -15, 15].map((d, i) => `<ellipse cx="${d}" cy="${-10 - (i > 2 ? 14 : 0)}" rx="22" ry="12" fill="#d9a05a" ${ol(1.6)}/>`).join("")}</g></g>`;
export const note = (cls, x, y) =>
  `<g class="${cls}"><g transform="translate(${x} ${y}) rotate(-6)"><rect x="-50" y="-36" width="100" height="72" fill="#fffbe8" ${ol(1.6)}/><path d="M-36 -18 h70 M-36 -2 h60 M-36 14 h66" stroke="#4a4a6a" stroke-width="3"/></g></g>`;
