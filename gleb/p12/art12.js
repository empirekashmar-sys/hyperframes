// Part 12 art: a crooked home-made crib, a ladder and hammer, fishing rod with a boot and a fish,
// the village medic's room, a night village street, a jar of pickles, the nut-ring, an old radio,
// a cup that breaks.
const svg = (vb, body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}">${body}</svg>`;
const O = "#0b0d14";
const ol = (w = 3) =>
  `stroke="${O}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;

export const crib = (cls, x, y) =>
  `<g class="${cls}"><g transform="translate(${x} ${y}) rotate(-3)"><rect x="-120" y="-120" width="240" height="18" fill="#c9a06a" ${ol(2.4)}/><rect x="-128" y="-10" width="250" height="20" fill="#c9a06a" ${ol(2.4)} transform="rotate(4)"/>
   ${Array.from({ length: 9 }, (_, i) => `<rect x="${-110 + i * 26}" y="-104" width="10" height="${96 + (i % 3) * 6}" fill="#b98a54" ${ol(1.6)} transform="rotate(${(i % 3) - 1} ${-105 + i * 26} -50)"/>`).join("")}
   <rect x="-130" y="-140" width="20" height="170" fill="#a87a44" ${ol(2)}/><rect x="112" y="-136" width="20" height="160" fill="#a87a44" ${ol(2)} transform="rotate(5 122 -50)"/></g></g>`;
export const ladder = (x, y, h = 420) =>
  `<g transform="translate(${x} ${y}) rotate(12)"><path d="M0 0 V-${h} M60 0 V-${h}" ${ol(8)}/>${Array.from({ length: Math.floor(h / 60) }, (_, i) => `<path d="M0 ${-30 - i * 60} H60" ${ol(6)}/>`).join("")}</g>`;
export const hammer = (cls, x, y) =>
  `<g class="${cls}"><g transform="translate(${x} ${y})"><rect x="-4" y="-50" width="8" height="56" rx="3" fill="#8a5a34" ${ol(1.6)}/><rect x="-18" y="-64" width="36" height="16" rx="3" fill="#6a6e76" ${ol(1.6)}/></g></g>`;
export const rod = (x, y) =>
  `<g><path d="M${x} ${y} Q${x + 160} ${y - 260} ${x + 340} ${y - 300}" stroke="#7a5234" stroke-width="7" fill="none"/><path class="line" d="M${x + 340} ${y - 300} V${y + 60}" stroke="#2a2a2e" stroke-width="2"/></g>`;
export const boot = (cls, x, y) =>
  `<g class="${cls}" opacity="0"><g transform="translate(${x} ${y})"><path d="M-20 -50 h30 v40 h30 q10 0 10 14 v10 h-70z" fill="#3a2a1e" ${ol(2)}/><path d="M-10 -40 h12" stroke="#7a6a5a" stroke-width="3"/><path d="M0 14 q4 10 0 20 M20 14 q4 12 -2 22" stroke="#6a8aa8" stroke-width="3" fill="none"/></g></g>`;
export const fish = (cls, x, y) =>
  `<g class="${cls}" opacity="0"><g transform="translate(${x} ${y})"><path d="M-30 0 q30 -26 60 0 q-30 26 -60 0z" fill="#9ab0c0" ${ol(2)}/><path d="M30 0 l20 -14 v28z" fill="#9ab0c0" ${ol(2)}/><circle cx="-16" cy="-4" r="3" fill="${O}"/></g></g>`;

// The medic's room: white tiles, an eye chart, a cabinet with bottles, a couch.
export function medic() {
  return svg(
    "0 0 1080 1100",
    `<rect x="-600" width="2280" height="1100" fill="#e9f0f2"/>
     ${Array.from({ length: 30 }, (_, i) => `<path d="M${-600 + i * 80} 500 V860" stroke="#d2dce0" stroke-width="3"/>`).join("")}<rect x="-600" y="500" width="2280" height="6" fill="#b9c6cc"/>
     <rect x="120" y="140" width="200" height="280" fill="#fff" ${ol(2.4)}/>${["Ш Б", "М Н К", "Ы М Б Ш", "Б Ы Н К М"].map((t, i) => `<text x="220" y="${200 + i * 56}" text-anchor="middle" font-family="Inter, sans-serif" font-weight="900" font-size="${44 - i * 8}" fill="#2a2a2e">${t}</text>`).join("")}
     <rect x="700" y="260" width="240" height="420" fill="#f8fafa" ${ol()}/><path d="M820 260 V680 M700 470 H940" stroke="${O}" stroke-width="3"/>${[0, 1, 2, 3, 4].map((k) => `<rect x="${720 + k * 40}" y="${400 - (k % 2) * 14}" width="24" height="${50 + (k % 2) * 14}" rx="4" fill="${["#c95a5a", "#5a8ac9", "#e9c46a"][k % 3]}" opacity=".8"/>`).join("")}
     <path d="M760 160 h40 v-40 h40 v40 h40 v40 h-40 v40 h-40 v-40 h-40z" fill="#e23b2e"/>
     <rect x="-600" y="860" width="2280" height="600" fill="#c9d4d8"/>
     <rect x="360" y="720" width="280" height="40" rx="10" fill="#7a9aa8" ${ol(2)}/><path d="M380 760 V860 M620 760 V860" ${ol(6)}/>`,
  );
}
// Night village street: low houses, one lit window (.vwin), a fence, a lamp.
export function village() {
  return svg(
    "0 0 1080 1100",
    `<rect x="-600" width="2280" height="1100" fill="#05081a"/>
     ${Array.from({ length: 40 }, (_, k) => `<circle cx="${((k * 173) % 1680) - 300}" cy="${(k * 89) % 520}" r="${1 + (k % 3)}" fill="#fff" opacity=".7"/>`).join("")}
     ${[-200, 160, 540, 900].map((x, i) => `<rect x="${x}" y="560" width="300" height="300" fill="${i % 2 ? "#1a1e2c" : "#22263a"}" ${ol()}/><path d="M${x - 20} 570 L${x + 150} 440 L${x + 320} 570Z" fill="#2a1a1a" ${ol()}/><rect class="${i === 2 ? "vwin" : ""}" x="${x + 100}" y="640" width="100" height="90" fill="${i === 2 ? "#0a0c14" : "#0a0c14"}" ${ol(2)}/>`).join("")}
     ${Array.from({ length: 30 }, (_, i) => `<rect x="${-600 + i * 80}" y="800" width="14" height="80" fill="#3a2a1e"/>`).join("")}<rect x="-600" y="820" width="2280" height="10" fill="#3a2a1e"/>
     <rect x="-600" y="880" width="2280" height="600" fill="#14161c"/>`,
  );
}
export const jar = (cls, x, y) =>
  `<g class="${cls}" opacity="0"><g transform="translate(${x} ${y})"><rect x="-24" y="-60" width="48" height="64" rx="10" fill="#9fd1a8" opacity=".85" ${ol(2)}/>${[0, 1, 2].map((k) => `<ellipse cx="${-8 + k * 8}" cy="${-30 + (k % 2) * 10}" rx="6" ry="16" fill="#5a8a3a"/>`).join("")}<rect x="-26" y="-68" width="52" height="12" rx="3" fill="#c9a24a" ${ol(1.6)}/></g></g>`;
export const nut = (cls, x, y) =>
  `<g class="${cls}" opacity="0"><g transform="translate(${x} ${y})"><path d="M-14 -8 L0 -16 L14 -8 V8 L0 16 L-14 8Z" fill="#b9c0cc" ${ol(2)}/><circle r="6" fill="#ffcf7a" ${ol(1.6)}/><circle r="22" fill="none" stroke="#ffe27a" stroke-width="2" opacity=".6"/></g></g>`;
export const radio = (x, y) =>
  `<g class="oldradio" transform="translate(${x} ${y})"><rect x="-80" y="-50" width="160" height="100" rx="14" fill="#6a4a3a" ${ol(2.4)}/><circle cx="-36" cy="0" r="30" fill="#3a2a1e" ${ol(2)}/><rect x="10" y="-24" width="56" height="20" fill="#f2d27a" ${ol(1.6)}/><circle cx="24" cy="24" r="8" fill="#2a2a2e"/><circle cx="54" cy="24" r="8" fill="#2a2a2e"/><path d="M40 -50 l30 -50" stroke="${O}" stroke-width="4"/></g>`;
export const cup = (cls, x, y) =>
  `<g class="${cls}"><g transform="translate(${x} ${y})"><rect x="-18" y="-22" width="36" height="30" rx="5" fill="#f2efe6" ${ol(2)}/><path d="M18 -14 q14 0 14 10 q0 10 -14 10" stroke="${O}" stroke-width="3" fill="none"/></g></g>`;
export const shards = (cls, x, y) =>
  `<g class="${cls}" opacity="0">${[0, 1, 2, 3, 4].map((k) => `<path transform="translate(${x + (k - 2) * 30} ${y + (k % 2) * 8}) rotate(${k * 40})" d="M-8 -6 L10 -4 L4 8Z" fill="#f2efe6" ${ol(1.4)}/>`).join("")}<path d="M${x - 40} ${y + 14} q40 -10 80 0" stroke="#8a5a3a" stroke-width="5" fill="none" opacity=".6"/></g>`;
