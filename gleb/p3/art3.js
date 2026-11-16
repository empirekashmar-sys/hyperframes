// Part 3 art: tank, highway with the oncoming jam, burnt bus, checkpoint, grandparents' courtyard,
// broken lift, tenth-floor corridor.
const svg = (vb, body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}">${body}</svg>`;
const O = "#0b0d14";
const ol = (w = 3) =>
  `stroke="${O}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;

// Tank, side view facing right. Groups: .tracks (wheels spin), .turret (pivot near its base),
// .hatch (lid opens up), and a slot for the commander (drawn by the scene between hull and hatch).
export function tank({ color = "#4f5a3a" } = {}) {
  const wheels = Array.from(
    { length: 6 },
    (_, i) =>
      `<g class="tw" transform="translate(${110 + i * 92} 300)"><circle r="34" fill="#2a2d24" ${ol()}/><circle r="14" fill="#5a6048"/><path d="M-12 0 H12 M0 -12 V12" stroke="#2a2d24" stroke-width="4"/></g>`,
  ).join("");
  return svg(
    "0 0 800 380",
    `<ellipse cx="400" cy="362" rx="380" ry="16" fill="#000" opacity=".4"/>
     <path d="M60 300 Q40 300 50 262 L90 246 H710 L752 262 Q762 300 740 300 Q740 344 700 344 H100 Q60 344 60 300Z" fill="#23261e" ${ol()}/>
     <g class="tracks">${wheels}</g>
     ${Array.from({ length: 22 }, (_, i) => `<rect class="tread" x="${84 + i * 30}" y="334" width="16" height="10" fill="#3a3d32"/>`).join("")}
     <path d="M40 252 L100 196 H700 L770 252Z" fill="${color}" ${ol()}/>
     <path d="M100 210 H700" stroke="#3a4228" stroke-width="5"/>
     <rect x="120" y="214" width="70" height="26" rx="4" fill="#3a4228"/><rect x="600" y="214" width="70" height="26" rx="4" fill="#3a4228"/>
     <text x="400" y="240" text-anchor="middle" font-family="Inter, sans-serif" font-weight="900" font-size="30" fill="#e9e3c9" opacity=".85">214</text>
     <g class="turret">
       <rect x="560" y="120" width="300" height="22" rx="8" fill="${color}" ${ol()}/>
       <rect x="840" y="114" width="34" height="34" rx="6" fill="#3a4228" ${ol()}/>
       <path d="M260 196 Q270 120 380 110 H520 Q600 116 610 196Z" fill="${color}" ${ol()}/>
       <path d="M300 160 H580" stroke="#3a4228" stroke-width="4"/>
       <ellipse class="hole" cx="420" cy="110" rx="46" ry="10" fill="#0a0b08"/>
       <g class="hatch"><ellipse cx="420" cy="106" rx="50" ry="12" fill="#5a6544" ${ol()}/></g>
       <path d="M300 130 h20 v-20" stroke="#2a2d24" stroke-width="4" fill="none"/>
     </g>`,
  );
}

// Highway at night: our lane empty, the opposite lanes jammed with cars fleeing the city.
export function highwayJam() {
  const car = (x, y, c) =>
    `<g transform="translate(${x} ${y})"><rect x="0" y="-26" width="90" height="26" rx="6" fill="${c}"/><path d="M14 -26 L26 -44 H64 L76 -26Z" fill="${c}"/><circle cx="20" cy="0" r="9" fill="#111"/><circle cx="70" cy="0" r="9" fill="#111"/><rect x="0" y="-20" width="8" height="8" fill="#ffe9a8"/><path d="M0 -16 L-120 -40 L-120 8Z" fill="#ffe9a8" opacity=".08"/></g>`;
  const cols = ["#4a5068", "#6a3a3a", "#3a5a4a", "#5a5a6a", "#4a4058", "#6a5a3a", "#3a4a6a"];
  let jam = "";
  for (let i = 0; i < 14; i++) jam += car(-40 + i * 96, 840, cols[i % 7]);
  return svg(
    "0 0 1080 1100",
    `<defs><linearGradient id="hj-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#05070e"/><stop offset="1" stop-color="#2a1a22"/></linearGradient></defs>
     <rect x="-600" width="2280" height="800" fill="url(#hj-sky)"/>
     <rect x="-600" y="620" width="2280" height="180" fill="#ff6a2b" opacity=".18"/>
     <g opacity=".9">${Array.from({ length: 18 }, (_, i) => `<rect x="${i * 64 - 30}" y="${700 - ((i * 41) % 110)}" width="50" height="${((i * 41) % 110) + 20}" fill="#120a10"/>`).join("")}</g>
     <rect x="-600" y="760" width="2280" height="1200" fill="#1a1c22"/>
     <rect x="-600" y="770" width="2280" height="90" fill="#24262e"/>
     <g class="jam">${jam}</g>
     <rect x="-600" y="866" width="2280" height="10" fill="#8a8d96"/>
     <rect x="-600" y="880" width="2280" height="140" fill="#2a2c34"/>
     <path d="M-600 950 H1680" stroke="#e9e3c9" stroke-width="6" stroke-dasharray="60 50" class="lane"/>
     <g class="poles">${Array.from({ length: 7 }, (_, i) => `<path d="M${i * 200} 880 V600" stroke="#2a221c" stroke-width="8"/><circle cx="${i * 200 + 20}" cy="604" r="8" fill="#ffd27a" opacity=".7"/>`).join("")}</g>`,
  );
}

// Burnt-out bus across the road (side view).
export function burntBus() {
  return svg(
    "0 0 620 260",
    `<ellipse cx="310" cy="250" rx="300" ry="10" fill="#000" opacity=".4"/>
     <path d="M20 220 V70 Q20 40 50 40 H580 Q600 40 600 70 V220Z" fill="#3a2a22" ${ol()}/>
     ${Array.from({ length: 7 }, (_, i) => `<rect x="${50 + i * 76}" y="66" width="60" height="64" fill="#0a0806"/>`).join("")}
     <path d="M60 140 q60 -20 120 6 q80 30 160 -10 q80 -30 220 10 V220 H40Z" fill="#2a1e18"/>
     <circle cx="120" cy="226" r="28" fill="#111" ${ol()}/><circle cx="500" cy="226" r="28" fill="#111" ${ol()}/>
     <path d="M200 40 q20 -30 40 -10 q10 -30 40 -6" stroke="#4a4a50" stroke-width="10" fill="none" opacity=".7"/>`,
  );
}

// Checkpoint: concrete blocks, striped barrier, sandbags, soldier silhouettes are rigs drawn by the scene.
export function checkpoint() {
  return svg(
    "0 0 1080 1100",
    `<rect x="-600" width="2280" height="800" fill="#0a0d16"/>
     <rect x="-600" y="760" width="2280" height="1200" fill="#1c1e24"/>
     <rect x="-600" y="880" width="2280" height="140" fill="#2a2c34"/>
     ${Array.from({ length: 5 }, (_, i) => `<rect x="${40 + i * 120}" y="820" width="100" height="70" fill="#7a7a72" ${ol()}/>`).join("")}
     <path d="M700 720 V900" stroke="#2a2d36" stroke-width="16"/>
     <g class="barrier"><rect x="700" y="760" width="420" height="22" fill="#e9e3c9" ${ol(2)}/>${Array.from({ length: 6 }, (_, i) => `<rect x="${720 + i * 70}" y="760" width="34" height="22" fill="#e23b2e"/>`).join("")}</g>
     ${Array.from({ length: 8 }, (_, i) => `<ellipse cx="${80 + (i % 4) * 90}" cy="${800 - Math.floor(i / 4) * 34}" rx="50" ry="20" fill="#8a7a5a" ${ol(2)}/>`).join("")}
     <path d="M940 500 V760" stroke="#2a2d36" stroke-width="8"/><circle cx="940" cy="500" r="14" fill="#ffe9a8"/><path d="M940 514 L840 880 H1040Z" fill="#ffe9a8" opacity=".1"/>`,
  );
}

// Grandparents' courtyard at night: dark block, broken windows, playground with swings and slide.
export function grannyYard() {
  let wins = "";
  for (let f = 0; f < 10; f++)
    for (let c = 0; c < 7; c++) {
      const x = 260 + c * 80;
      const y = 120 + f * 66;
      const broken = (f * 7 + c * 3) % 9 === 0;
      wins += `<rect x="${x}" y="${y}" width="44" height="40" fill="${f === 0 && c === 3 ? "#3a3020" : "#0b0f1c"}"/>${broken ? `<path d="M${x} ${y} l20 18 l-8 10 l18 12" stroke="#5a6a8a" stroke-width="2" fill="none"/>` : ""}`;
    }
  return svg(
    "0 0 1080 1100",
    `<rect x="-600" width="2280" height="1100" fill="#05070d"/>
     <rect x="230" y="90" width="620" height="760" fill="#30343f"/><rect x="220" y="80" width="640" height="16" fill="#4b4f5c"/>${wins}
     <rect x="500" y="770" width="80" height="80" fill="#1d2130"/><rect x="480" y="756" width="120" height="14" fill="#4b4f5c"/>
     <rect x="-600" y="850" width="2280" height="1100" fill="#14161c"/>
     <g class="swings"><path d="M700 980 L740 860 L860 860 L900 980" stroke="#8a4a3a" stroke-width="10" fill="none"/><path d="M740 860 H860" stroke="#8a4a3a" stroke-width="10"/>
       <g class="swing"><path d="M770 864 V940 M800 864 V940" stroke="#555" stroke-width="3"/><rect x="760" y="940" width="50" height="10" fill="#c9a24a"/></g>
       <g class="swing2"><path d="M820 864 V940 M850 864 V940" stroke="#555" stroke-width="3"/><rect x="810" y="940" width="50" height="10" fill="#3a7ad9"/></g></g>
     <path d="M100 980 L140 880 H180 L260 980" stroke="#3a6a8a" stroke-width="12" fill="none"/><path d="M140 880 V980" stroke="#3a6a8a" stroke-width="8"/>
     <rect x="300" y="950" width="140" height="30" rx="6" fill="#8a6a40" ${ol(2)}/>`,
  );
}

// Broken lift on the ground floor.
export function liftLobby() {
  return svg(
    "0 0 1080 1100",
    `<rect x="-600" width="2280" height="1100" fill="#2e3a3a"/>
     <rect x="-600" y="860" width="2280" height="600" fill="#2a2c32"/>
     <rect x="380" y="300" width="320" height="560" fill="#6a6f78" ${ol()}/><path d="M540 300 V860" stroke="${O}" stroke-width="4"/>
     <rect x="730" y="520" width="40" height="70" rx="6" fill="#4a4f58" ${ol(2)}/><circle cx="750" cy="545" r="8" fill="#e23b2e"/>
     <g class="sign" transform="rotate(-4 540 520)"><rect x="410" y="470" width="260" height="100" fill="#e9e3c9" ${ol(2)}/><text x="540" y="512" text-anchor="middle" font-family="Inter, sans-serif" font-weight="900" font-size="34" fill="#b3241b">ЛИФТ</text><text x="540" y="552" text-anchor="middle" font-family="Inter, sans-serif" font-weight="900" font-size="30" fill="#111">НЕ РАБОТАЕТ</text></g>
     <rect x="900" y="120" width="120" height="60" rx="10" fill="#e9e3c9" opacity=".7"/>`,
  );
}

// Tenth-floor corridor: long and dark, the grandparents' door ajar with a sliver of black.
export function corridor10() {
  return svg(
    "0 0 1080 1100",
    `<rect x="-600" width="2280" height="1100" fill="#141820"/>
     <path d="M-600 860 H1680 V1500 H-600Z" fill="#1d2027"/>
     <path d="M160 160 L460 420 V720 L160 980Z M920 160 L620 420 V720 L920 980Z" fill="#1a1e27"/>
     <rect x="460" y="420" width="160" height="300" fill="#0a0c10"/>
     <rect x="240" y="300" width="150" height="520" fill="#4a3426" ${ol()}/><text x="315" y="380" text-anchor="middle" font-family="Inter, sans-serif" font-weight="900" font-size="34" fill="#c9a24a">40</text>
     <rect x="640" y="300" width="170" height="560" fill="#030304"/>
     <g class="door"><path d="M640 300 L740 330 V830 L640 860Z" fill="#5a3a28" ${ol()}/><circle cx="728" cy="590" r="7" fill="#c9a24a"/></g>
     <text x="700" y="280" text-anchor="middle" font-family="Inter, sans-serif" font-weight="900" font-size="34" fill="#c9a24a">41</text>
     <text x="150" y="250" text-anchor="middle" font-family="Inter, sans-serif" font-weight="900" font-size="120" fill="#c9c2a8" opacity=".6">10</text>
     <rect x="500" y="80" width="80" height="34" rx="8" fill="#3a3a30"/>`,
  );
}
