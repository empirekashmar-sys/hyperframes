// Part 20 art: the sterile box in the lab (glass front drawn separately so Masha sits inside), the
// monitors with her heartbeat, a door ajar for eavesdropping, and the archive screen with "Harvest".
const svg = (vb, body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}">${body}</svg>`;
const O = "#0b0d14";
const ol = (w = 3) =>
  `stroke="${O}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;
const floor = (y, c) => `<rect x="-600" y="${y}" width="2280" height="1400" fill="${c}"/>`;

// The lab: white tiles, the box on the right (inside lit), monitors on the left.
export function lab() {
  return svg(
    "0 0 1080 1100",
    `<rect x="-600" width="2280" height="1100" fill="#dfe6ea"/>
     ${Array.from({ length: 40 }, (_, i) => `<path d="M${-600 + i * 60} 0 V860" stroke="#cfd8de" stroke-width="2"/>`).join("")}${Array.from({ length: 15 }, (_, i) => `<path d="M-600 ${i * 60} H1680" stroke="#cfd8de" stroke-width="2"/>`).join("")}
     <rect x="-600" y="0" width="2280" height="80" fill="#b9c4cc"/>${Array.from({ length: 8 }, (_, i) => `<rect x="${-500 + i * 300}" y="70" width="180" height="16" rx="6" fill="#ffffff"/>`).join("")}
     <rect x="480" y="200" width="620" height="660" fill="#eef6fa" ${ol(4)}/><rect x="480" y="200" width="620" height="40" fill="#b9c4cc" ${ol(2)}/>
     <text x="790" y="228" text-anchor="middle" font-family="Inter, sans-serif" font-weight="900" font-size="22" fill="#c9302c">БОКС 1 · ОБЪЕКТ «МАТЬ»</text>
     <rect x="780" y="640" width="280" height="80" rx="12" fill="#c9d8e4" ${ol(2)}/><rect x="780" y="720" width="280" height="140" fill="#9aa8b4" ${ol(2)}/>
     <g transform="translate(-160 0)"><rect x="40" y="360" width="300" height="200" rx="10" fill="#1a2a2e" ${ol(3)}/>
       <path class="ecg" d="M60 470 h50 l10 -40 l14 80 l12 -60 l10 20 h60 l10 -40 l14 80 l12 -60 l10 20 h46" stroke="#7aff8a" stroke-width="4" fill="none"/>
       <text x="70" y="398" font-family="Inter, sans-serif" font-weight="900" font-size="22" fill="#7aff8a">МАТЬ 96</text><text x="220" y="398" font-family="Inter, sans-serif" font-weight="900" font-size="22" fill="#ffd25a">ПЛОД 142</text>
       <path d="M190 560 V860" ${ol(10)}/></g>
     ${floor(860, "#b9c4cc")}`,
  );
}
// Glass front of the box (over Masha), with reflections.
export function glass() {
  return svg(
    "0 0 1080 1100",
    `<rect x="480" y="240" width="620" height="620" fill="#bfe6ff" opacity=".18" ${ol(4)}/>
     <path d="M520 300 l120 -40 M540 380 l200 -70 M900 820 l150 -60" stroke="#ffffff" stroke-width="10" opacity=".5"/>
     <path d="M700 240 V860" stroke="${O}" stroke-width="5"/><rect x="680" y="500" width="40" height="80" rx="6" fill="#8a96a0" ${ol(2)}/>`,
  );
}

// The archive: a dark room, server racks, one big terminal screen showing protocol "Harvest".
export function archive() {
  return svg(
    "0 0 1080 1100",
    `<rect x="-600" width="2280" height="1100" fill="#10141a"/>
     ${Array.from({ length: 8 }, (_, i) => `<rect x="${-560 + i * 300}" y="160" width="180" height="700" fill="#1e242c" ${ol(2)}/>${Array.from({ length: 12 }, (_, k) => `<circle class="led" cx="${-530 + i * 300 + (k % 3) * 50}" cy="${200 + Math.floor(k / 3) * 160}" r="5" fill="${["#7aff8a", "#ff3a2a", "#ffd25a"][(i + k) % 3]}"/>`).join("")}`).join("")}
     <rect x="120" y="160" width="840" height="560" fill="#05080c" ${ol(4)}/>
     <g class="doc" opacity="0"><rect x="140" y="180" width="800" height="520" fill="#0a1a10"/>
       <text x="170" y="232" font-family="Inter, sans-serif" font-weight="900" font-size="34" fill="#ff4a3d">ПРОТОКОЛ «ЖАТВА»</text>
       <text x="170" y="270" font-family="Inter, sans-serif" font-weight="700" font-size="22" fill="#7aff8a">СОВЕРШЕННО СЕКРЕТНО · ОБЪЕКТ «ГРАНИТ»</text>
       <path d="M170 320 q120 -60 260 0 t300 -20 q80 10 160 -10 M180 520 q200 -70 560 -10" stroke="#3a7ab8" stroke-width="4" fill="none"/>
       <circle class="city" cx="430" cy="410" r="18" fill="#ff3a2a"/><circle cx="430" cy="410" r="40" fill="none" stroke="#ff3a2a" stroke-width="3" class="ring"/>
       <text x="470" y="404" font-family="Inter, sans-serif" font-weight="900" font-size="22" fill="#ff4a3d">ГОРОД № 1 · ИСПЫТАНИЕ</text>
       <text x="470" y="434" font-family="Inter, sans-serif" font-weight="700" font-size="20" fill="#7aff8a">НАСЕЛЕНИЕ: 200 000</text>
       <text x="170" y="640" font-family="Inter, sans-serif" font-weight="700" font-size="20" fill="#7aff8a">УТВЕРЖДАЮ: ГЕНЕРАЛ ___________</text></g>
     <path d="M120 720 L-80 1100 H1160 L960 720Z" fill="#7aff8a" opacity=".05"/>
     ${floor(860, "#0c1014")}`,
  );
}

// A door ajar on the right of the office (the eavesdropper stands in its light).
export function doorAjar() {
  return svg(
    "0 0 1080 1100",
    `<rect x="960" y="300" width="260" height="560" fill="#7a7e86" ${ol(3)}/><path d="M960 300 L1040 330 V880 L960 860Z" fill="#5a3a26" ${ol(3)}/><rect x="1040" y="300" width="20" height="580" fill="#fff6d8" opacity=".5"/>`,
  );
}
