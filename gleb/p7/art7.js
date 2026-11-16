// Part 7 art: the ruins of the block, a rubble overlay to bury people in, a row of garages,
// a bomber silhouette, a far view of the block under bombardment.
const svg = (vb, body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}">${body}</svg>`;
const O = "#0b0d14";
const ol = (w = 3) =>
  `stroke="${O}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;

const slab = (x, y, w, h, rot, c = "#5a5e66") =>
  `<g transform="rotate(${rot} ${x + w / 2} ${y + h / 2})"><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}" ${ol(2.4)}/><path d="M${x + w * 0.2} ${y} l6 -18 M${x + w * 0.7} ${y} l-4 -22" stroke="#6a4a3a" stroke-width="3"/></g>`;

// Ruins at night: broken wall stubs with window holes, smoke, fires, dust in the air.
export function ruins() {
  return svg(
    "0 0 1080 1100",
    `<defs><linearGradient id="ru-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0a0608"/><stop offset="1" stop-color="#4a2418"/></linearGradient></defs>
     <rect x="-600" width="2280" height="1100" fill="url(#ru-sky)"/>
     <path d="M80 860 V300 L140 260 L170 330 L220 240 V860Z" fill="#3a3e48" ${ol()}/>
     ${[0, 1, 2, 3].map((k) => `<rect x="110" y="${360 + k * 110}" width="40" height="50" fill="#120c0c"/>`).join("")}
     <path d="M760 860 V420 L820 380 L850 450 L900 360 L960 420 V860Z" fill="#3a3e48" ${ol()}/>
     ${[0, 1, 2].map((k) => `<rect x="${800 + (k % 2) * 80}" y="${470 + k * 110}" width="44" height="54" fill="#120c0c"/>`).join("")}
     <path d="M-600 860 H1680 V1100 H-600Z" fill="#2a2a30"/>
     ${slab(240, 760, 260, 50, -12)}${slab(520, 740, 220, 46, 18, "#4a4e56")}${slab(330, 690, 200, 40, 6, "#6a6e76")}
     ${slab(-80, 800, 300, 60, 8, "#4a4e56")}${slab(700, 800, 340, 60, -6)}
     <path d="M300 700 l-20 -70 M560 720 l30 -80 M420 680 l4 -60" stroke="#6a4a3a" stroke-width="5"/>
     <ellipse cx="540" cy="200" rx="700" ry="160" fill="#2a1a18" opacity=".6"/>
     <g class="haze"><rect x="-600" width="2280" height="1100" fill="#c9a888" opacity=".08"/></g>`,
  );
}
// Rubble heap in front (the buried rise out from behind it).
export function rubbleFront() {
  return svg(
    "0 0 1080 1100",
    `<rect x="-600" y="1000" width="2280" height="900" fill="#45464e"/><path d="M-600 1100 V990 Q-300 900 0 950 Q160 880 300 930 Q460 860 620 920 Q800 870 960 940 Q1200 900 1680 960 V1100Z" fill="#45464e" ${ol()}/>
     ${slab(100, 930, 160, 34, -10, "#5a5e66")}${slab(560, 900, 180, 36, 14, "#6a6e76")}${slab(840, 940, 150, 30, -4, "#5a5e66")}
     ${Array.from({ length: 22 }, (_, i) => `<rect x="${-100 + i * 60}" y="${980 + ((i * 37) % 60)}" width="${18 + (i % 4) * 8}" height="${14 + (i % 3) * 6}" fill="#6a6a72" transform="rotate(${i * 29} ${-90 + i * 60} ${990 + ((i * 37) % 60)})"/>`).join("")}`,
  );
}

// Garages behind the block, the old car parked by the last one.
export function garages() {
  return svg(
    "0 0 1080 1100",
    `<rect x="-600" width="2280" height="1100" fill="#06080e"/>
     ${Array.from({ length: 30 }, (_, k) => `<circle cx="${((k * 173) % 1680) - 300}" cy="${(k * 71) % 360}" r="${1 + (k % 2)}" fill="#fff" opacity=".5"/>`).join("")}
     <rect x="-600" y="480" width="2280" height="380" fill="#22252e"/>
     ${Array.from({ length: 9 }, (_, i) => `<rect x="${-420 + i * 230}" y="560" width="200" height="300" fill="${i % 2 ? "#4a5a6a" : "#5a4a3a"}" ${ol()}/><path d="M${-410 + i * 230} 600 H${-230 + i * 230} M${-410 + i * 230} 660 H${-230 + i * 230} M${-410 + i * 230} 720 H${-230 + i * 230} M${-410 + i * 230} 780 H${-230 + i * 230}" stroke="#2a2d34" stroke-width="4"/><text x="${-320 + i * 230}" y="540" text-anchor="middle" font-family="Inter, sans-serif" font-weight="900" font-size="26" fill="#8a8d96">${12 + i}</text>`).join("")}
     <rect x="-600" y="470" width="2280" height="20" fill="#3a3d46"/>
     <rect x="-600" y="860" width="2280" height="600" fill="#14161c"/>
     <circle cx="900" cy="300" r="10" fill="#ffd27a"/><path d="M900 310 L760 860 H1040Z" fill="#ffd27a" opacity=".06"/><path d="M900 300 V860" stroke="#2a221c" stroke-width="8"/>`,
  );
}

// Bomber silhouette (flies left to right).
export const plane = (cls, x, y, s = 1) =>
  `<g class="${cls}" transform="translate(${x} ${y}) scale(${s})"><path d="M-120 0 Q-60 -14 80 -8 L130 0 L80 8 Q-60 14 -120 0Z M-10 -6 L-60 -70 H-30 L40 -6Z M-10 6 L-60 70 H-30 L40 6Z M-110 -2 L-140 -36 H-120 L-90 -2Z" fill="#0a0a0e"/><circle cx="110" cy="0" r="4" fill="#ff3a2a"/></g>`;

// Distant block on the skyline seen from the road (bombed as they drive off).
export function farBlock() {
  return svg(
    "0 0 1080 1100",
    `<defs><linearGradient id="fb-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#05060c"/><stop offset="1" stop-color="#3a1a14"/></linearGradient></defs>
     <rect x="-600" width="2280" height="900" fill="url(#fb-sky)"/>
     ${Array.from({ length: 14 }, (_, i) => `<rect x="${-200 + i * 110}" y="${640 - ((i * 47) % 120)}" width="90" height="${((i * 47) % 120) + 200}" fill="#0e0a10"/>`).join("")}
     <path d="M420 840 V480 L470 450 L500 500 L540 430 L600 470 V840Z" fill="#1a1418" ${ol(2)}/>
     <g class="blasts">${[0, 1, 2, 3].map((k) => `<circle class="bl" cx="${450 + k * 40}" cy="${520 + (k % 2) * 60}" r="40" fill="#ff8a2b" opacity="0"/>`).join("")}</g>
     <rect x="-600" y="820" width="2280" height="400" fill="#16181e"/>
     <path class="lane" d="M-600 960 H1680" stroke="#e9e3c9" stroke-width="6" stroke-dasharray="60 50"/>`,
  );
}
