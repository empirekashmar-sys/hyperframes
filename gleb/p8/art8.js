// Part 8 art: a log dacha in the snow, its bedroom, kitchen with a stove, the breakfast table,
// a snowy birch wood, footprints and a toy hare, eyes in the dark.
const svg = (vb, body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}">${body}</svg>`;
const O = "#0b0d14";
const ol = (w = 3) =>
  `stroke="${O}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;

const fir = (x, y, s = 1, c = "#1e3a2e") =>
  `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-10" y="-30" width="20" height="40" fill="#3a2a1e"/><path d="M0 -300 L-70 -180 H-40 L-110 -80 H-70 L-140 0 H140 L70 -80 H110 L40 -180 H70Z" fill="${c}" ${ol(2.4)}/><path d="M0 -300 L-40 -232 H40Z M-60 -170 L60 -170 L44 -150 H-44Z M-90 -70 H90 L70 -52 H-70Z" fill="#f2f6fa"/></g>`;
const logs = (x, y, w, h, n) =>
  Array.from(
    { length: n },
    (_, i) =>
      `<rect x="${x}" y="${y + i * h}" width="${w}" height="${h - 4}" rx="${h / 2}" fill="${i % 2 ? "#7a5234" : "#8a5e3c"}" ${ol(2)}/>`,
  ).join("");

// The dacha in the snow at dawn: log house, snowy roof, a chimney (smoke drawn by the scene), firs.
export function dacha() {
  return svg(
    "0 0 1080 1100",
    `<defs><linearGradient id="dc-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a3a5a"/><stop offset="1" stop-color="#c9a0a8"/></linearGradient></defs>
     <rect x="-600" width="2280" height="900" fill="url(#dc-sky)"/>
     ${fir(-40, 860, 1.1, "#1a2e26")}${fir(1040, 860, 1.2, "#1a2e26")}${fir(120, 840, 0.7)}${fir(930, 830, 0.75)}
     <rect x="290" y="560" width="500" height="300" fill="#7a5234"/>${logs(290, 560, 500, 30, 10)}
     <path d="M250 570 L540 360 L830 570Z" fill="#5a3a26" ${ol()}/><path d="M240 575 L540 350 L840 575 L800 590 L540 400 L280 590Z" fill="#f2f6fa" ${ol(2.4)}/>
     <rect x="650" y="390" width="50" height="110" fill="#6a4a3a" ${ol(2.4)}/><rect x="642" y="380" width="66" height="18" fill="#f2f6fa" ${ol(2)}/>
     <rect x="380" y="640" width="120" height="110" fill="#2a3448" ${ol()}/><path d="M440 640 V750 M380 695 H500" stroke="#5a3a26" stroke-width="8"/>
     <rect x="600" y="680" width="110" height="180" fill="#5a3a26" ${ol()}/><circle cx="690" cy="770" r="6" fill="#c9a24a"/>
     <path d="M-600 860 Q0 830 540 850 Q1100 830 1680 860 V1100 H-600Z" fill="#eef3f8"/>
     <path d="M560 860 L600 1100 H700 L700 860" fill="#dfe7f0" opacity=".6"/>`,
  );
}

// Bedroom: log walls, frosted window, the bed seen from its foot (headboard + pillows).
export function bedroom() {
  return svg(
    "0 0 1080 1100",
    `<rect x="-600" width="2280" height="1100" fill="#6a4630"/>${logs(-600, 0, 2280, 46, 24)}
     <rect x="740" y="180" width="220" height="240" fill="#9fb8d8" ${ol()}/><path d="M850 180 V420 M740 300 H960" stroke="#5a3a26" stroke-width="10"/>
     <path d="M740 380 q30 -30 60 0 q30 -40 70 0 q30 -30 90 -10 V420 H740Z M740 180 q40 30 90 0 q50 30 130 0" fill="#f2f6fa" opacity=".8"/>
     <rect x="100" y="260" width="120" height="150" fill="#d9c79a" ${ol(2.4)}/><path d="M110 380 l30 -50 l30 30 l20 -20 l20 40Z" fill="#6a8a5a"/>
     <path d="M260 560 Q260 470 540 470 Q820 470 820 560 V860 H260Z" fill="#5a3a26" ${ol()}/>
     <path d="M290 560 Q290 500 540 500 Q790 500 790 560" stroke="#4a2e1e" stroke-width="10" fill="none"/>
     <rect x="310" y="640" width="210" height="110" rx="40" fill="#f2efe6" ${ol(2.4)}/><rect x="560" y="640" width="210" height="110" rx="40" fill="#f2efe6" ${ol(2.4)}/>
     <rect x="-600" y="860" width="2280" height="600" fill="#4a3020"/>`,
  );
}
// Quilt over the sleepers (patchwork), Maxim's arm across her shoulders is drawn by the scene.
export function quilt() {
  return svg(
    "0 0 1080 1100",
    `<path d="M220 770 Q540 740 860 770 L900 1100 H180Z" fill="#a83a4a" ${ol()}/>
     ${Array.from({ length: 12 }, (_, i) => `<rect x="${230 + (i % 6) * 104}" y="${800 + Math.floor(i / 6) * 120}" width="96" height="110" fill="${["#c95a5a", "#e9c46a", "#5a8ac9", "#8ac95a"][i % 4]}" opacity=".55"/>`).join("")}
     <path d="M220 770 Q540 740 860 770" stroke="#f2efe6" stroke-width="14" fill="none"/>
     <rect x="160" y="1000" width="760" height="140" fill="#5a3a26" ${ol()}/>`,
  );
}

// Kitchen: Russian stove (.stovefire glows when lit), shelf with the family photo, window, kettle.
export function kitchen() {
  return svg(
    "0 0 1080 1100",
    `<rect x="-600" width="2280" height="1100" fill="#6a4630"/>${logs(-600, 0, 2280, 46, 24)}
     <rect x="40" y="300" width="360" height="560" fill="#e9e3d6" ${ol()}/><rect x="20" y="280" width="400" height="40" fill="#d9d2c2" ${ol(2.4)}/>
     <path d="M120 560 H320 V640 Q220 600 120 640Z" fill="#1a1410" ${ol(2.4)}/>
     <g class="stovefire" opacity="0"><path d="M140 640 Q160 590 190 610 Q210 560 240 600 Q270 570 300 640Z" fill="#ff8a2b"/><path d="M170 640 Q190 610 220 625 Q240 600 270 640Z" fill="#ffe27a"/><ellipse cx="220" cy="640" rx="180" ry="80" fill="#ff8a2b" opacity=".12"/></g>
     <rect x="110" y="380" width="80" height="50" rx="10" fill="#3a3a40" ${ol(2)}/><path d="M190 395 q30 -6 30 18" stroke="${O}" stroke-width="5" fill="none"/>
     <rect x="560" y="300" width="380" height="20" fill="#5a3a26" ${ol(2)}/>
     <g class="photo"><rect x="610" y="196" width="130" height="104" fill="#f2efe6" ${ol(2.4)}/><rect x="620" y="206" width="110" height="84" fill="#9fc2e0"/>
       <circle cx="645" cy="240" r="11" fill="#e0ae88"/><path d="M634 236 q11 -14 22 0" fill="#17181d"/><rect x="636" y="252" width="18" height="34" fill="#2b2321"/>
       <circle cx="670" cy="244" r="10" fill="#ebbb98"/><path d="M660 242 q10 -16 20 0" fill="#5a3522"/><rect x="662" y="255" width="16" height="31" fill="#d98a4a"/>
       <circle cx="695" cy="250" r="9" fill="#e9c1a0"/><rect x="687" y="260" width="16" height="26" fill="#3a8a5a"/>
       <circle cx="716" cy="258" r="7" fill="#efc1a0"/><path d="M709 254 q7 -10 14 0" fill="#2a1d16"/><rect x="710" y="266" width="12" height="20" fill="#d94a3a"/></g>
     <rect x="780" y="240" width="40" height="60" rx="6" fill="#c9a24a" opacity=".8"/><rect x="840" y="250" width="50" height="50" rx="6" fill="#8a3a4a" opacity=".8"/>
     <rect x="560" y="420" width="220" height="220" fill="#9fb8d8" ${ol()}/><path d="M670 420 V640 M560 530 H780" stroke="#5a3a26" stroke-width="10"/>
     <rect x="-600" y="860" width="2280" height="600" fill="#4a3020"/>`,
  );
}
// Table front with breakfast: jacket potatoes, bread, jam, two steaming cups.
export function table() {
  return svg(
    "0 0 1080 1100",
    `<path d="M120 820 H960 L990 860 H90Z" fill="#c9a06a" ${ol()}/><rect x="110" y="860" width="860" height="260" fill="#8a5e3c" ${ol()}/>
     <path d="M140 828 H940" stroke="#f2efe6" stroke-width="6" stroke-dasharray="30 20" opacity=".6"/>
     <ellipse cx="420" cy="822" rx="90" ry="22" fill="#f2efe6" ${ol(2)}/>${[0, 1, 2, 3].map((k) => `<ellipse cx="${380 + k * 26}" cy="${808 - (k % 2) * 8}" rx="20" ry="14" fill="#b07a4a" ${ol(1.6)}/>`).join("")}
     <path d="M560 820 q40 -40 110 0z" fill="#c98a4a" ${ol(2)}/>
     <rect x="720" y="776" width="40" height="46" rx="6" fill="#b3241b" ${ol(2)}/><rect x="716" y="770" width="48" height="12" fill="#e9e3c9" ${ol(1.6)}/>
     <g class="cup"><rect x="280" y="790" width="40" height="34" rx="6" fill="#f2efe6" ${ol(2)}/><path d="M300 780 q-10 -20 0 -40 M310 776 q10 -20 0 -36" stroke="#f2efe6" stroke-width="4" fill="none" opacity=".7" class="steam"/></g>
     <g class="cup"><rect x="820" y="790" width="40" height="34" rx="6" fill="#f2efe6" ${ol(2)}/><path d="M840 780 q-10 -20 0 -40 M850 776 q10 -20 0 -36" stroke="#f2efe6" stroke-width="4" fill="none" opacity=".7" class="steam"/></g>`,
  );
}

// Snowy birch wood (wide, 2160) with a chopping log and footprints leading off into the firs.
export function wood() {
  const birch = (x, h) =>
    `<rect x="${x}" y="${860 - h}" width="34" height="${h}" fill="#f2efe6" ${ol(2)}/>${Array.from({ length: Math.floor(h / 60) }, (_, k) => `<rect x="${x + 4 + (k % 2) * 10}" y="${870 - h + k * 60}" width="16" height="6" fill="#2a2a2e"/>`).join("")}`;
  return svg(
    "0 0 2160 1100",
    `<defs><linearGradient id="wd-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9fb8d8"/><stop offset="1" stop-color="#e9eef5"/></linearGradient></defs>
     <rect x="-400" width="2960" height="900" fill="url(#wd-sky)"/>
     ${[-100, 180, 1250, 1500, 1800, 2050].map((x, i) => fir(x, 860, 0.9 + (i % 3) * 0.15)).join("")}
     ${[60, 300, 420, 700, 980, 1120].map((x, i) => birch(x, 520 + (i % 3) * 120)).join("")}
     <path d="M-400 860 Q300 830 1080 850 Q1700 830 2560 860 V1100 H-400Z" fill="#eef3f8"/>
     <g class="prints">${Array.from({ length: 12 }, (_, k) => `<ellipse cx="${1100 + k * 70}" cy="${960 - k * 8 + (k % 2) * 16}" rx="12" ry="7" fill="#b9c6d6"/>`).join("")}</g>
     <g class="hare"><g transform="translate(1900 900)"><ellipse cx="0" cy="0" rx="26" ry="22" fill="#d8d0c6" ${ol(2)}/><circle cx="0" cy="-30" r="18" fill="#d8d0c6" ${ol(2)}/><path d="M-8 -44 q-6 -34 4 -40 q6 6 4 40 M8 -44 q6 -34 14 -36 q2 8 -6 38" fill="#d8d0c6" ${ol(2)}/><circle cx="-6" cy="-32" r="2.6" fill="${O}"/><circle cx="6" cy="-32" r="2.6" fill="${O}"/></g></g>`,
  );
}

// Dark fir thicket with pairs of eyes (.eye blinks).
export function thicket() {
  return svg(
    "0 0 1080 1100",
    `<rect x="-600" width="2280" height="1100" fill="#0a1218"/>
     ${[-80, 160, 400, 640, 880, 1120].map((x, i) => fir(x, 900 + (i % 2) * 40, 1.3, "#0f2018")).join("")}
     ${[
       [300, 600],
       [520, 560],
       [760, 640],
       [430, 760],
     ]
       .map(
         ([x, y], i) =>
           `<g class="eye" transform="translate(${x} ${y})"><circle cx="-14" r="${i === 1 ? 9 : 6}" fill="#ffe27a"/><circle cx="14" r="${i === 1 ? 9 : 6}" fill="#ffe27a"/></g>`,
       )
       .join("")}
     <path d="M-600 900 H1680 V1100 H-600Z" fill="#1a2630"/>`,
  );
}

// Falling snow overlay (the scene loops it downward).
export const snow = (cls) =>
  `<g class="${cls}">${Array.from({ length: 60 }, (_, k) => `<circle cx="${((k * 97) % 1400) - 160}" cy="${((k * 151) % 2200) - 300}" r="${2 + (k % 3)}" fill="#fff" opacity=".85"/>`).join("")}</g>`;
