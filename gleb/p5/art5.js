// Part 5 art: inside the army truck, bench overlay, the night city (wide, for scrolling),
// the avenue blocked by a tank column, smoke and fire, a rope.
const svg = (vb, body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}">${body}</svg>`;
const O = "#0b0d14";
const ol = (w = 3) =>
  `stroke="${O}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;

// Inside the covered truck bed, looking back through the open tail at the night road.
// .lights = the tank's headlights far behind (the scene fades and grows them).
export function truckInside() {
  return svg(
    "0 0 1080 1100",
    `<rect x="-600" width="2280" height="1100" fill="#2c3122"/>
     ${Array.from({ length: 9 }, (_, i) => `<path d="M${-260 + i * 200} 1100 Q${-200 + i * 200} 120 ${540 + (i - 4) * 60} 60" stroke="#20251a" stroke-width="16" fill="none"/>`).join("")}
     <path d="M-600 0 H1680 V90 Q540 40 -600 90Z" fill="#20251a"/>
     <defs><linearGradient id="ti-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#05070e"/><stop offset="1" stop-color="#1c1420"/></linearGradient>
       <clipPath id="ti-open"><rect x="350" y="260" width="380" height="520" rx="10"/></clipPath></defs>
     <g clip-path="url(#ti-open)">
       <rect x="350" y="260" width="380" height="520" fill="url(#ti-sky)"/>
       <rect x="350" y="500" width="380" height="40" fill="#ff6a2b" opacity=".12"/>
       ${Array.from({ length: 8 }, (_, i) => `<rect x="${352 + i * 48}" y="${470 - ((i * 37) % 60)}" width="40" height="${((i * 37) % 60) + 50}" fill="#0c0a10"/>`).join("")}
       <path d="M350 780 L520 540 H560 L730 780Z" fill="#1d1f26"/>
       <path class="lane" d="M540 548 V780" stroke="#e9e3c9" stroke-width="5" stroke-dasharray="26 30"/>
       <g class="lights" opacity="0">
         <ellipse cx="540" cy="560" rx="150" ry="60" fill="#fff6c8" opacity=".18"/>
         <circle cx="508" cy="560" r="12" fill="#fff6c8"/><circle cx="572" cy="560" r="12" fill="#fff6c8"/>
       </g>
     </g>
     <rect x="350" y="260" width="380" height="520" rx="10" fill="none" stroke="#141810" stroke-width="18"/>
     <path d="M330 250 Q540 220 750 250" stroke="#4f5638" stroke-width="22" fill="none"/>
     <path d="M-600 780 H1680 V1100 H-600Z" fill="#1b1e15"/>
     ${Array.from({ length: 8 }, (_, i) => `<path d="M${350 + i * 54} 780 L${-200 + i * 210} 1100" stroke="#24281c" stroke-width="5"/>`).join("")}
     <path d="M-600 690 L330 760 V800 L-600 760Z M1680 690 L750 760 V800 L1680 760Z" fill="#5a4a33" ${ol(2)}/>`,
  );
}
// Bench fronts that hide the seated passengers' legs.
export function benchFront() {
  return svg(
    "0 0 1080 1100",
    `<path d="M-600 905 H330 V1100 H-600Z" fill="#6a5338" ${ol()}/><path d="M-600 905 H330 V930 H-600Z" fill="#7a6244"/>
     <path d="M760 905 H1680 V1100 H760Z" fill="#6a5338" ${ol()}/><path d="M760 905 H1680 V930 H760Z" fill="#7a6244"/>
     <path d="M-600 1000 H330 M760 1000 H1680" stroke="#4a3a26" stroke-width="5"/>`,
  );
}

// Night city, 3240 wide so it can scroll by: blocks with lit windows, distant fires, a road.
export function cityNight() {
  let blocks = "";
  let x = -40;
  let i = 0;
  while (x < 3300) {
    const w = 150 + ((i * 53) % 120);
    const h = 260 + ((i * 97) % 300);
    const top = 860 - h;
    let win = "";
    for (let wy = top + 26; wy < 830; wy += 40)
      for (let wx = x + 16; wx < x + w - 24; wx += 34)
        if ((wx * 7 + wy * 3 + i) % 11 < 3)
          win += `<rect x="${wx}" y="${wy}" width="16" height="20" fill="#ffd27a" opacity=".75"/>`;
    const burnt = i % 5 === 2;
    blocks += `<rect x="${x}" y="${top}" width="${w}" height="${h}" fill="${i % 2 ? "#141824" : "#1a1e2c"}" ${ol(2)}/>${win}${
      burnt
        ? `<path d="M${x + 20} ${top} l20 -30 l16 18 l22 -40 l18 30 l20 -16 l10 38z" fill="#ff7a2b" opacity=".85"/><ellipse cx="${x + w / 2}" cy="${top}" rx="${w}" ry="80" fill="#ff6a2b" opacity=".15"/>`
        : ""
    }`;
    x += w + 10;
    i++;
  }
  return svg(
    "0 0 3240 1100",
    `<defs><linearGradient id="cn-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#04060d"/><stop offset="1" stop-color="#2a1824"/></linearGradient></defs>
     <rect x="-200" width="3640" height="900" fill="url(#cn-sky)"/>
     ${Array.from({ length: 40 }, (_, k) => `<circle cx="${(k * 211) % 3240}" cy="${(k * 89) % 380}" r="${1 + (k % 3)}" fill="#fff" opacity=".6"/>`).join("")}
     <circle cx="2600" cy="160" r="50" fill="#f3ecd2" opacity=".9"/>
     <g class="blocks">${blocks}</g>
     <rect x="-200" y="860" width="3640" height="300" fill="#1a1c22"/>
     <rect x="-200" y="860" width="3640" height="12" fill="#8a8d96"/>
     <path d="M-200 990 H3440" stroke="#e9e3c9" stroke-width="6" stroke-dasharray="60 50"/>`,
  );
}

// Avenue at night: buildings on both sides, the road running into the distance.
export function avenue() {
  return svg(
    "0 0 2160 1100",
    `<defs><linearGradient id="av-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#04060d"/><stop offset="1" stop-color="#1e1626"/></linearGradient></defs>
     <rect x="-400" width="2960" height="900" fill="url(#av-sky)"/>
     ${Array.from({ length: 16 }, (_, k) => `<rect x="${-300 + k * 170}" y="${420 - ((k * 61) % 180)}" width="150" height="${480 + ((k * 61) % 180)}" fill="${k % 2 ? "#121622" : "#171b28"}" ${ol(2)}/>${Array.from({ length: 6 }, (_, j) => `<rect x="${-280 + k * 170 + (j % 3) * 44}" y="${470 - ((k * 61) % 180) + Math.floor(j / 3) * 90}" width="20" height="24" fill="#ffd27a" opacity="${(k + j) % 3 ? 0.1 : 0.6}"/>`).join("")}`).join("")}
     <rect x="-400" y="820" width="2960" height="400" fill="#1d1f26"/>
     <rect x="-400" y="820" width="2960" height="10" fill="#8a8d96"/>
     <path d="M-400 960 H2560" stroke="#e9e3c9" stroke-width="6" stroke-dasharray="60 50"/>`,
  );
}

// Smoke column (puffs animate up) and a fire.
export const smoke = (x, y, n = 6) =>
  `<g class="smoke">${Array.from({ length: n }, (_, i) => `<circle class="puff" cx="${x + ((i * 23) % 40) - 20}" cy="${y - i * 50}" r="${36 + i * 8}" fill="#2a2a30" opacity="${0.75 - i * 0.09}"/>`).join("")}</g>`;
export const fire = (x, y, s = 1) =>
  `<g class="fire" transform="translate(${x} ${y}) scale(${s})"><path d="M-50 0 Q-60 -60 -20 -110 Q-20 -60 0 -70 Q10 -130 40 -150 Q30 -80 60 -60 Q70 -30 50 0Z" fill="#ff6a1b"/><path d="M-30 0 Q-30 -40 -6 -70 Q0 -40 14 -50 Q20 -80 34 -90 Q30 -40 40 0Z" fill="#ffd25a"/></g>`;
export const rope = (x1, x2, y) =>
  `<path d="M${x1} ${y} Q${(x1 + x2) / 2} ${y + 24} ${x2} ${y}" stroke="#c9a24a" stroke-width="7" fill="none" stroke-dasharray="12 6"/>`;
