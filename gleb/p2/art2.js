// Part 2 places: courtyard with the car, road, ruined dacha, cardboard boxes, the car itself.
const svg = (vb, body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}">${body}</svg>`;
const O = "#0b0d14";
const ol = (w = 3) =>
  `stroke="${O}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;

// Old family hatchback, side view (faces right). lights: headlights on. people: heads in windows.
export function car({ lights = true, people = false, color = "#6a7a5a" } = {}) {
  const heads = people
    ? `<circle cx="190" cy="92" r="17" fill="#e0ae88"/><path d="M174 88 q2 -22 18 -20 q16 0 16 18 q-8 -8 -34 2z" fill="#17181d"/>
       <circle cx="120" cy="94" r="16" fill="#ebbb98"/><path d="M104 96 q-2 -26 16 -26 q18 0 18 22 q-10 -12 -34 4z" fill="#5a3522"/>
       <circle cx="268" cy="96" r="14" fill="#efc1a0"/>${[-10, -4, 2, 8, 14].map((d) => `<circle cx="${268 + d}" cy="84" r="5" fill="#2a1d16"/>`).join("")}
       <circle cx="50" cy="96" r="15" fill="#d8a47f"/>`
    : "";
  return svg(
    "0 0 420 200",
    `<ellipse cx="210" cy="186" rx="200" ry="10" fill="#000" opacity=".4"/>
     <path d="M20 150 L24 110 Q30 96 60 92 L110 56 Q124 46 150 46 L290 46 Q318 46 334 64 L366 96 Q396 100 404 116 L408 150 Z" fill="${color}" ${ol()}/>
     <path d="M118 64 L148 54 H200 V96 H96Z" fill="#1d2433" ${ol(2.4)}/><path d="M212 54 H286 Q306 54 318 70 L340 96 H212Z" fill="#1d2433" ${ol(2.4)}/>
     <path d="M40 96 L96 96 L110 70 L64 92Z" fill="#1d2433" ${ol(2.4)}/>
     ${heads}
     <path d="M200 52 V150 M96 96 V150" stroke="${O}" stroke-width="2.4" opacity=".6"/>
     <rect x="176" y="108" width="18" height="5" rx="2" fill="#2a2a2a"/><rect x="292" y="108" width="18" height="5" rx="2" fill="#2a2a2a"/>
     <path d="M20 130 H408" stroke="#000" stroke-width="3" opacity=".2"/>
     <rect x="392" y="104" width="16" height="16" rx="4" fill="${lights ? "#ffe9a8" : "#9a9a8a"}" ${ol(2)}/>
     <rect x="16" y="112" width="12" height="16" rx="3" fill="#b3241b" ${ol(2)}/>
     ${lights ? `<path d="M408 112 L640 70 L640 170 Z" fill="#ffe9a8" opacity=".18"/>` : ""}
     <g class="wheel" transform="translate(100 150)"><circle r="34" fill="#1a1a1e" ${ol()}/><circle r="16" fill="#8a8d96"/><path d="M-14 0 H14 M0 -14 V14" stroke="#4a4d56" stroke-width="4"/></g>
     <g class="wheel" transform="translate(330 150)"><circle r="34" fill="#1a1a1e" ${ol()}/><circle r="16" fill="#8a8d96"/><path d="M-14 0 H14 M0 -14 V14" stroke="#4a4d56" stroke-width="4"/></g>`,
  );
}

// Courtyard at night between panel blocks, a lamp post, the car parked by the entrance.
export function courtyard() {
  const block = (x, w, lit, seed) => {
    let s = seed;
    let out = `<rect x="${x}" y="80" width="${w}" height="860" fill="#2c303c"/>`;
    const rnd = () => (s = (s * 9301 + 49297) % 233280) / 233280;
    for (let y = 120; y < 900; y += 70)
      for (let xx = x + 20; xx < x + w - 40; xx += 56)
        out += `<rect x="${xx}" y="${y}" width="30" height="40" fill="${rnd() < lit ? "#f2b45a" : "#0b0f1c"}"/>`;
    return out;
  };
  return svg(
    "0 0 1080 1100",
    `<rect x="-600" width="2280" height="1100" fill="#060912"/>
     ${block(-40, 420, 0.1, 3)}${block(700, 440, 0.08, 9)}
     <rect x="380" y="380" width="320" height="560" fill="#363a46"/>${Array.from({ length: 6 }, (_, i) => `<rect x="${410 + (i % 3) * 96}" y="${420 + Math.floor(i / 3) * 90}" width="40" height="50" fill="${i === 4 ? "#ffd27a" : "#0b0f1c"}"/>`).join("")}
     <rect x="490" y="800" width="100" height="140" fill="#1d2130"/><rect x="470" y="786" width="140" height="16" fill="#4b4f5c"/><circle cx="540" cy="796" r="6" fill="#ffd27a"/>
     <rect x="-600" y="930" width="2280" height="1000" fill="#16181e"/><path d="M0 940 H1080" stroke="#2a2d36" stroke-width="8"/>
     <path d="M880 940 V600" stroke="#2a2d36" stroke-width="10"/><path d="M880 600 h-40" stroke="#2a2d36" stroke-width="8"/><circle cx="836" cy="608" r="12" fill="#ffe9a8"/><path d="M836 616 L760 940 H912 Z" fill="#ffe9a8" opacity=".08"/>`,
  );
}

// Country road at dawn with fields, poles and a far city glow. Layers move for parallax.
export function road({ dawn = true } = {}) {
  return svg(
    "0 0 1080 1100",
    `<defs><linearGradient id="rd-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${dawn ? "#1b2342" : "#05070e"}"/><stop offset=".7" stop-color="${dawn ? "#8a5a6a" : "#141a2c"}"/><stop offset="1" stop-color="${dawn ? "#e8a46a" : "#2a1e2e"}"/></linearGradient></defs>
     <rect x="-600" width="2280" height="760" fill="url(#rd-sky)"/>
     <circle cx="820" cy="640" r="70" fill="#ffd39a" opacity="${dawn ? 0.8 : 0}"/>
     <path d="M0 700 Q300 650 600 690 T1080 680 V820 H0Z" fill="#2a3a2e"/>
     <g class="far">${Array.from({ length: 14 }, (_, i) => `<path d="M${i * 90} 700 l20 -60 l20 60z" fill="#1d2a22"/>`).join("")}</g>
     <rect x="-600" y="780" width="2280" height="1200" fill="#3a4a34"/>
     <rect x="-600" y="860" width="2280" height="110" fill="#2a2c32"/><path d="M0 915 H1080" stroke="#e9e3c9" stroke-width="6" stroke-dasharray="60 50" class="lane"/>
     <g class="poles">${Array.from({ length: 6 }, (_, i) => `<path d="M${i * 220} 860 V560" stroke="#2a221c" stroke-width="10"/><path d="M${i * 220 - 30} 580 h60" stroke="#2a221c" stroke-width="6"/>`).join("")}<path d="M-10 585 Q100 610 210 585 T430 585 T650 585 T870 585 T1090 585" stroke="#1a1a1a" stroke-width="2" fill="none"/></g>`,
  );
}

// The dacha after the strike: broken walls, burnt roof beams, crater, smoke, embers.
export function dachaRuins() {
  return svg(
    "0 0 1080 1100",
    `<defs><linearGradient id="dr-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a2a36"/><stop offset=".8" stop-color="#7a6a6a"/><stop offset="1" stop-color="#b08a6a"/></linearGradient></defs>
     <rect x="-600" width="2280" height="800" fill="url(#dr-sky)"/>
     <g class="smoke" opacity=".85">${[
       [380, 0.9],
       [520, 1.2],
       [640, 0.8],
     ]
       .map(
         ([x, k]) =>
           `<circle cx="${x}" cy="${380 - 60 * k}" r="${90 * k}" fill="#3a3a40"/><circle cx="${x + 40}" cy="${260 - 80 * k}" r="${110 * k}" fill="#4a4a50"/><circle cx="${x - 30}" cy="${140 - 90 * k}" r="${130 * k}" fill="#55555c"/>`,
       )
       .join("")}</g>
     <rect x="-600" y="780" width="2280" height="1200" fill="#4a4636"/>
     <path d="M0 780 Q300 760 600 790 T1080 770" stroke="#3a3628" stroke-width="10" fill="none"/>
     ${Array.from({ length: 10 }, (_, i) => `<path d="M${40 + i * 30} 790 v-120 M${30 + i * 30} 700 h20" stroke="#5a4632" stroke-width="6"/>`).join("")}
     <path d="M300 800 L300 560 L360 540 L380 600 L420 520 L470 610 L520 500 L560 590 L600 540 L640 600 L700 560 L720 800Z" fill="#5a5048" ${'stroke="#0b0d14" stroke-width="3"'}/>
     <path d="M340 800 V620 M440 800 V580 M560 800 V600 M660 800 V610" stroke="#3a3430" stroke-width="5"/>
     <rect x="380" y="640" width="70" height="70" fill="#14141a"/><rect x="560" y="650" width="70" height="60" fill="#14141a"/>
     <path d="M330 560 L470 470 M410 520 L600 440 M560 480 L700 540" stroke="#1d1a18" stroke-width="12" stroke-linecap="round"/>
     <ellipse cx="820" cy="840" rx="150" ry="36" fill="#2a2620"/><ellipse cx="820" cy="834" rx="110" ry="22" fill="#1a1814"/>
     ${Array.from({ length: 14 }, (_, i) => `<circle class="ember" cx="${330 + ((i * 37) % 380)}" cy="${700 - ((i * 53) % 160)}" r="${3 + (i % 3)}" fill="#ff8a3d"/>`).join("")}
     <path d="M320 800 q30 -40 60 0 M470 800 q20 -50 50 0 M600 800 q30 -40 50 0" fill="#ff6a2b" opacity=".7"/>
     ${Array.from({ length: 18 }, (_, i) => `<rect x="${240 + ((i * 61) % 600)}" y="${800 + ((i * 23) % 80)}" width="${14 + (i % 4) * 6}" height="${8 + (i % 3) * 4}" fill="#6a5e54" transform="rotate(${i * 23} ${240 + ((i * 61) % 600)} ${800 + ((i * 23) % 80)})"/>`).join("")}`,
  );
}

// Two packed cardboard boxes.
export function boxes() {
  const box = (x, y, w, h, label) =>
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#b08a5a" ${ol()}/><path d="M${x} ${y + 18} H${x + w}" stroke="#8a6a40" stroke-width="4"/><rect x="${x + w / 2 - 14}" y="${y}" width="28" height="${h}" fill="#d9c7a0" opacity=".6"/><text x="${x + w / 2}" y="${y + h / 2 + 14}" text-anchor="middle" font-family="Inter, sans-serif" font-weight="900" font-size="22" fill="#5a3a20">${label}</text>`;
  return svg(
    "0 0 300 240",
    `<ellipse cx="150" cy="232" rx="140" ry="8" fill="#000" opacity=".35"/>${box(10, 100, 150, 130, "ВОДА")}${box(140, 60, 150, 170, "ЕДА")}`,
  );
}
