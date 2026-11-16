// Part 6 art: the white "Kalina", the entrance lobby with its steel door, a pram, the landing window,
// Zina's door, the roof hatch.
const svg = (vb, body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}">${body}</svg>`;
const O = "#0b0d14";
const ol = (w = 3) =>
  `stroke="${O}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;

// Small white hatchback, side view facing left (towards our heroes). .rdoor swings open (scaleX).
export function kalina() {
  return svg(
    "0 0 520 260",
    `<ellipse cx="260" cy="248" rx="250" ry="10" fill="#000" opacity=".4"/>
     <path d="M20 200 Q14 150 60 140 L130 132 L190 76 Q206 64 236 64 H400 Q440 66 460 110 L496 150 Q506 170 500 200 Z" fill="#eceff2" ${ol()}/>
     <path d="M200 84 L150 132 H300 V84Z" fill="#3a4a5a" ${ol(2.4)}/>
     <path d="M316 84 V132 H448 L420 92 Q412 84 396 84Z" fill="#3a4a5a" ${ol(2.4)}/>
     <rect x="20" y="164" width="34" height="16" rx="4" fill="#ffe9a8" ${ol(2)}/>
     <rect x="486" y="156" width="14" height="22" rx="3" fill="#e23b2e" ${ol(2)}/>
     <path d="M60 196 H480" stroke="#b9c0cc" stroke-width="6"/>
     <text x="240" y="186" text-anchor="middle" font-family="Inter, sans-serif" font-weight="900" font-size="18" fill="#9aa2b0">KALINA</text>
     <rect x="304" y="84" width="10" height="110" fill="#0a0c10"/>
     <g class="rdoor"><path d="M308 84 V192 H452 L448 110 L420 92 Q412 84 396 84Z" fill="#e2e6ea" ${ol(2.4)}/><path d="M316 92 V132 H440 L416 98Z" fill="#3a4a5a" ${ol(2)}/><rect x="330" y="146" width="26" height="8" rx="3" fill="#8a929e"/></g>
     <g class="wheel" transform="translate(110 206)"><circle r="34" fill="#1a1a1e" ${ol()}/><circle r="14" fill="#b9c0cc"/></g>
     <g class="wheel" transform="translate(410 206)"><circle r="34" fill="#1a1a1e" ${ol()}/><circle r="14" fill="#b9c0cc"/></g>`,
  );
}

// Ground-floor lobby: steel entrance door with a peephole window, mailboxes, stairs going up right.
// .edoor = the door leaf (swings around its left hinge).
export function lobby() {
  return svg(
    "0 0 1080 1100",
    `<rect x="-600" width="2280" height="1100" fill="#3a4a48"/>
     <rect x="-600" y="0" width="2280" height="540" fill="#4a5e5a"/><path d="M-600 540 H1680" stroke="#2a3434" stroke-width="8"/>
     <rect x="-600" y="860" width="2280" height="600" fill="#2a2c32"/>
     <rect x="80" y="300" width="300" height="560" fill="#05070d"/>
     <g class="edoor"><rect x="80" y="300" width="300" height="560" fill="#5a3a2a" ${ol()}/><rect x="190" y="360" width="80" height="60" fill="#0b0f1c" ${ol(2)}/><rect x="320" y="560" width="40" height="16" rx="4" fill="#c9a24a"/><path d="M100 640 H360 M100 760 H360" stroke="#4a2e20" stroke-width="5"/></g>
     <g transform="translate(470 360)">${Array.from({ length: 12 }, (_, i) => `<rect x="${(i % 4) * 56}" y="${Math.floor(i / 4) * 52}" width="50" height="46" fill="#5a6f88" ${ol(2)}/><rect x="${(i % 4) * 56 + 10}" y="${Math.floor(i / 4) * 52 + 8}" width="30" height="5" fill="#2a3448"/>`).join("")}</g>
     ${Array.from({ length: 6 }, (_, i) => `<rect x="${760 + i * 60}" y="${840 - i * 50}" width="400" height="14" fill="#5a5f66"/><rect x="${760 + i * 60}" y="${854 - i * 50}" width="400" height="36" fill="#3a3e46"/>`).join("")}
     <path d="M760 790 L1120 490" stroke="#222" stroke-width="9"/>
     <path d="M520 220 q40 30 10 70 M640 150 q-20 40 20 60" stroke="#2a3434" stroke-width="5" fill="none" opacity=".6"/>
     <circle cx="540" cy="120" r="26" fill="#e9e3c9" opacity=".8"/><circle cx="540" cy="120" r="220" fill="#e9e3c9" opacity=".05"/>`,
  );
}
// A pram (for the barricade).
export function pram() {
  return svg(
    "0 0 220 200",
    `<path d="M30 40 Q30 120 110 120 H190 V70 Q190 40 160 40Z" fill="#3a6aa8" ${ol()}/>
     <path d="M30 40 Q60 10 110 20 L110 120 Q30 120 30 40Z" fill="#2a4a7a" ${ol()}/>
     <path d="M190 70 L216 30" ${ol(5)}/>
     <circle cx="60" cy="172" r="22" fill="#1a1a1e" ${ol()}/><circle cx="170" cy="172" r="22" fill="#1a1a1e" ${ol()}/>
     <path d="M60 172 L110 120 L170 172" stroke="#8a929e" stroke-width="5" fill="none"/>`,
  );
}

// Second-floor landing with a big window onto the yard. .flashes = muzzle flashes outside.
export function landingWindow() {
  return svg(
    "0 0 1080 1100",
    `<rect x="-600" width="2280" height="1100" fill="#3c4e4c"/>
     <rect x="-600" y="0" width="2280" height="520" fill="#4a5e5a"/>
     <rect x="-600" y="860" width="2280" height="600" fill="#2a2c32"/>
     <rect x="250" y="190" width="580" height="440" fill="#070a14"/>
     <g class="yardview">
       <rect x="250" y="520" width="580" height="110" fill="#14161c"/>
       ${Array.from({ length: 9 }, (_, i) => `<g transform="translate(${280 + i * 62} ${560 + (i % 3) * 14})"><circle r="11" fill="#1d2016"/><rect x="-10" y="8" width="20" height="40" fill="#1d2016"/></g>`).join("")}
       <path d="M250 470 H830" stroke="#20242e" stroke-width="40"/>
       <g class="flashes">${Array.from({ length: 6 }, (_, i) => `<circle class="fx" cx="${300 + i * 92}" cy="${556 + (i % 2) * 18}" r="12" fill="#ffe27a" opacity="0"/>`).join("")}</g>
     </g>
     <g class="glass"><path d="M250 190 H830 V630 H250Z M540 190 V630 M250 410 H830" fill="none" stroke="#c9ccd2" stroke-width="12"/></g>
     <path d="M300 240 l60 70 l-20 40 M700 260 l-40 50 l30 30" stroke="#9fb0c8" stroke-width="3" fill="none" class="cracks" opacity="0"/>
     <rect x="220" y="630" width="640" height="34" fill="#c9ccd2" ${ol(2)}/>
     <rect x="330" y="720" width="420" height="110" rx="8" fill="#8a929e" ${ol(2)}/>${Array.from({ length: 9 }, (_, i) => `<path d="M${360 + i * 44} 730 V820" stroke="#5a6068" stroke-width="6"/>`).join("")}
     <text x="140" y="300" text-anchor="middle" font-family="Inter, sans-serif" font-weight="900" font-size="200" fill="#d9d2b8" opacity=".8">2</text>`,
  );
}

// Landing with Zina's flat door; .zdoor opens (scaleX) onto warm light.
export function zinaLanding() {
  return svg(
    "0 0 1080 1100",
    `<rect x="-600" width="2280" height="1100" fill="#3c4e4c"/>
     <rect x="-600" y="0" width="2280" height="520" fill="#4a5e5a"/><path d="M-600 520 H1680" stroke="#2a3434" stroke-width="8"/>
     <rect x="-600" y="860" width="2280" height="600" fill="#2a2c32"/>
     <rect x="160" y="300" width="250" height="560" fill="#ffcf7a"/>
     <path d="M160 860 L-80 1100 H650 L410 860Z" fill="#ffcf7a" opacity=".25"/>
     <g class="zdoor"><rect x="160" y="300" width="250" height="560" fill="#7a3a2a" ${ol()}/>${[0, 1, 2, 3].map((k) => `<rect x="${180 + (k % 2) * 112}" y="${330 + Math.floor(k / 2) * 260}" width="96" height="230" fill="#8a4a36" ${ol(1.6)}/>`).join("")}<circle cx="380" cy="590" r="9" fill="#c9a24a"/><rect x="262" y="270" width="46" height="24" rx="4" fill="#c9a24a"/><text x="285" y="290" text-anchor="middle" font-family="Inter, sans-serif" font-weight="900" font-size="20" fill="#3a2a1a">7</text></g>
     <rect x="150" y="860" width="270" height="20" rx="6" fill="#8a3a4a"/>
     <rect x="560" y="300" width="230" height="560" fill="#4a3426" ${ol()}/><circle cx="580" cy="590" r="8" fill="#c9a24a"/>
     ${Array.from({ length: 5 }, (_, i) => `<rect x="${860 + i * 50}" y="${840 - i * 46}" width="300" height="14" fill="#5a5f66"/><rect x="${860 + i * 50}" y="${854 - i * 46}" width="300" height="32" fill="#3a3e46"/>`).join("")}
     <circle cx="540" cy="120" r="24" fill="#e9e3c9" opacity=".8"/>`,
  );
}

// Top landing: an iron ladder up to the roof hatch. .rhatch lifts open onto moonlight.
export function roofHatch() {
  return svg(
    "0 0 1080 1100",
    `<rect x="-600" width="2280" height="1100" fill="#26302f"/>
     <rect x="-600" y="0" width="2280" height="200" fill="#1a2120"/>
     <rect x="-600" y="860" width="2280" height="600" fill="#22242a"/>
     <rect x="420" y="160" width="240" height="44" fill="#9fb0d8"/>
     <path class="beam" d="M420 204 L300 860 H780 L660 204Z" fill="#cfe0ff" opacity="0"/>
     <g class="rhatch"><rect x="410" y="150" width="260" height="54" fill="#4a4f58" ${ol()}/><path d="M430 176 H650" stroke="#2a2d34" stroke-width="5"/></g>
     <path d="M470 204 V860 M610 204 V860" ${ol(10)}/>${Array.from({ length: 9 }, (_, i) => `<path d="M470 ${270 + i * 66} H610" stroke="${O}" stroke-width="7"/>`).join("")}
     <rect x="80" y="320" width="220" height="540" fill="#3a2a22" ${ol()}/><rect x="820" y="320" width="220" height="540" fill="#3a2a22" ${ol()}/>
     <text x="190" y="290" text-anchor="middle" font-family="Inter, sans-serif" font-weight="900" font-size="120" fill="#d9d2b8" opacity=".6">10</text>`,
  );
}

// Muzzle-flash star.
export const muzzle = (cls, x, y, s = 1) =>
  `<g class="${cls}" opacity="0" transform="translate(${x} ${y}) scale(${s})"><path d="M0 -40 L10 -12 L40 -16 L16 4 L34 30 L4 16 L-10 42 L-12 12 L-40 14 L-18 -6 L-34 -30 L-6 -14Z" fill="#ffe27a"/><circle r="12" fill="#fff"/></g>`;
// Cartoon "bonk" stars.
export const stars = (cls, x, y) =>
  `<g class="${cls}" opacity="0">${[0, 1, 2, 3, 4].map((i) => `<path transform="translate(${x + Math.cos(i * 1.256) * 60} ${y + Math.sin(i * 1.256) * 22})" d="M0 -14 L4 -4 L14 -4 L6 3 L9 14 L0 7 L-9 14 L-6 3 L-14 -4 L-4 -4Z" fill="#ffe27a" ${ol(1.6)}/>`).join("")}</g>`;
