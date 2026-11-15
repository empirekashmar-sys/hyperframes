// Gleb — part 1. Flat 2D art kit (same style as the zombie-farm kit).
import { C, hero } from "../../zombie-farm/art/art.js";
export { C, hero };

const svg = (vb, body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}">${body}</svg>`;
const shadow = (cx, cy, rx) =>
  `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="5" fill="#000" opacity=".35"/>`;

export const P = {
  wallWarm: "#3b3330",
  wallWarm2: "#4a403b",
  floorWood: "#4b3726",
  lampGlow: "#ffcf7a",
  tile: "#5a6170",
  night0: "#060812",
  night1: "#0f1528",
  panel: "#6d7180",
  panelDark: "#4b4f5c",
  flash: "#ffb347",
  phone: "#9fd2ff",
};

/* ───────────── GLEB extra poses ───────────── */
// Gleb holding a glowing phone (face lit from below). Built on top of the hero.
export function glebPhone() {
  return hero("stand")
    .replace(/<path d="M83 94 L91 158"[^>]*\/><circle cx="91" cy="164" r="7"[^>]*\/>/, "")
    .replace(
      "</svg>",
      `<path d="M83 94 L92 124 L72 112" stroke="#2b2321" stroke-width="15" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
       <rect x="62" y="98" width="16" height="26" rx="3" fill="#111" transform="rotate(-12 70 111)"/>
       <rect x="64" y="101" width="12" height="20" rx="2" fill="${P.phone}" transform="rotate(-12 70 111)"/>
       <ellipse cx="62" cy="70" rx="26" ry="20" fill="${P.phone}" opacity=".18"/>
       <circle cx="70" cy="116" r="7" fill="#d9a882"/></svg>`,
    );
}

/* ───────────── MASHA ───────────── */
// pose: "stand" | "cook" | "scared"
export function masha(pose = "stand") {
  const M = {
    hair: "#5a3522",
    hairHi: "#7a4b30",
    dress: "#7c4f63",
    apron: "#d9d2c3",
    skin: "#e2b08e",
    skinShade: "#c48f6d",
    iris: "#3e5a3a",
  };
  const armR =
    pose === "cook"
      ? `<path d="M80 96 L104 116 L124 108" stroke="${M.dress}" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" fill="none"/><circle cx="126" cy="107" r="6" fill="${M.skin}"/><path d="M126 107 L138 86" stroke="#7a5a3e" stroke-width="5" stroke-linecap="round"/>`
      : pose === "scared"
        ? `<path d="M80 96 L84 118 L66 104" stroke="${M.dress}" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" fill="none"/><circle cx="64" cy="102" r="6" fill="${M.skin}"/>`
        : `<path d="M80 96 L86 154" stroke="${M.dress}" stroke-width="12" stroke-linecap="round"/><circle cx="86" cy="159" r="6" fill="${M.skin}"/>`;
  const armL =
    pose === "scared"
      ? `<path d="M40 96 L34 118 L54 104" stroke="${M.dress}" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" fill="none"/><circle cx="56" cy="102" r="6" fill="${M.skinShade}"/>`
      : `<path d="M40 96 L34 154" stroke="${M.dress}" stroke-width="12" stroke-linecap="round"/><circle cx="34" cy="159" r="6" fill="${M.skinShade}"/>`;
  const mouth =
    pose === "scared"
      ? `<ellipse cx="60" cy="64" rx="4" ry="3.4" fill="#5a2a2a"/>`
      : `<path d="M54 63 Q60 68 66 63" stroke="#8a3f3f" stroke-width="2.4" fill="none" stroke-linecap="round"/>`;
  return svg(
    "0 0 140 260",
    `${shadow(60, 254, 32)}
    <path d="M52 186 L50 244 M68 186 L70 244" stroke="${M.skinShade}" stroke-width="10" stroke-linecap="round"/>
    <path d="M38 244 h16 v8 h-20z M66 244 h16 l4 8 h-20z" fill="#3a2a2a"/>
    ${armL}
    <path d="M40 84 Q60 74 80 84 L92 196 L28 196Z" fill="${M.dress}"/>
    ${pose === "scared" ? "" : `<path d="M44 108 H76 L82 186 H38Z" fill="${M.apron}"/><path d="M44 108 Q60 98 76 108" stroke="${M.apron}" stroke-width="4" fill="none"/>`}
    <rect x="55" y="64" width="10" height="16" fill="${M.skinShade}"/>
    <path d="M36 52 Q34 20 60 18 Q86 20 84 52 Q84 70 78 78 L42 78 Q36 70 36 52Z" fill="${M.hair}"/>
    <ellipse cx="60" cy="50" rx="19" ry="21" fill="${M.skin}"/>
    <path d="M40 46 Q42 24 60 24 Q80 24 80 46 Q74 32 60 34 Q48 34 40 46Z" fill="${M.hair}"/>
    <path d="M78 30 Q96 30 92 56 Q90 70 84 76" stroke="${M.hair}" stroke-width="9" fill="none" stroke-linecap="round"/>
    <circle cx="84" cy="28" r="4" fill="#c25a5a"/>
    <path d="M47 42 Q52 40 56 42 M64 42 Q68 40 73 42" stroke="#3a2418" stroke-width="2.4" fill="none" stroke-linecap="round"/>
    <ellipse cx="52" cy="49" rx="4" ry="3.4" fill="#f4efe6"/><circle cx="52.5" cy="49.3" r="2.4" fill="${M.iris}"/><circle cx="52.6" cy="49.3" r="1" fill="#05070c"/>
    <ellipse cx="68" cy="49" rx="4" ry="3.4" fill="#f4efe6"/><circle cx="68.5" cy="49.3" r="2.4" fill="${M.iris}"/><circle cx="68.6" cy="49.3" r="1" fill="#05070c"/>
    <path d="M47 46 l-3 -2 M73 46 l3 -2" stroke="#3a2418" stroke-width="1.6" stroke-linecap="round"/>
    <ellipse cx="45" cy="57" rx="3.6" ry="2.2" fill="#e59a86" opacity=".4"/><ellipse cx="75" cy="57" rx="3.6" ry="2.2" fill="#e59a86" opacity=".4"/>
    ${mouth}
    ${armR}`,
  );
}

/* ───────────── SONS ───────────── */
// age: "young" (≈6) | "old" (≈12). pose: "stand" | "run" | "wave" | "sleepy"
export function son(age = "young", pose = "stand") {
  const young = age === "young";
  const S = young
    ? { top: "#c9483a", bottom: "#33507a", hair: "#2a1d16", shoe: "#3a7ad9" }
    : { top: "#3f6b4f", bottom: "#23283a", hair: "#3b2a1e", shoe: "#e9e7e2" };
  const skin = "#e0ae8a",
    shade = "#c38f6b";
  const legs =
    pose === "run"
      ? `<path d="M52 180 L40 240 M68 180 L84 236" stroke="${S.bottom}" stroke-width="15" stroke-linecap="round"/>`
      : `<path d="M52 180 L50 242 M68 180 L70 242" stroke="${young ? skin : S.bottom}" stroke-width="13" stroke-linecap="round"/>${young ? `<path d="M44 178 H76 L78 204 H42Z" fill="${S.bottom}"/>` : ""}`;
  const feet =
    pose === "run"
      ? `<path d="M28 236 h20 v8 h-24z M76 232 h20 l4 8 h-24z" fill="${S.shoe}"/>`
      : `<path d="M38 240 h18 v8 h-22z M64 240 h18 l4 8 h-22z" fill="${S.shoe}"/>`;
  const armR =
    pose === "wave"
      ? `<path d="M80 108 L102 74" stroke="${S.top}" stroke-width="13" stroke-linecap="round"/><circle cx="104" cy="70" r="7" fill="${skin}"/>`
      : pose === "run"
        ? `<path d="M80 108 L100 136" stroke="${S.top}" stroke-width="13" stroke-linecap="round"/><circle cx="102" cy="140" r="7" fill="${skin}"/>`
        : pose === "sleepy"
          ? `<path d="M80 108 L76 86" stroke="${S.top}" stroke-width="13" stroke-linecap="round"/><circle cx="72" cy="80" r="7" fill="${skin}"/>`
          : `<path d="M80 108 L86 160" stroke="${S.top}" stroke-width="13" stroke-linecap="round"/><circle cx="86" cy="165" r="7" fill="${skin}"/>`;
  const armL =
    pose === "run"
      ? `<path d="M40 108 L22 136" stroke="${S.top}" stroke-width="13" stroke-linecap="round"/><circle cx="20" cy="140" r="7" fill="${shade}"/>`
      : `<path d="M40 108 L34 160" stroke="${S.top}" stroke-width="13" stroke-linecap="round"/><circle cx="34" cy="165" r="7" fill="${shade}"/>`;
  const eyes =
    pose === "sleepy"
      ? `<path d="M48 62 q4 3 8 0 M64 62 q4 3 8 0" stroke="#05070c" stroke-width="2.4" fill="none" stroke-linecap="round"/>`
      : `<ellipse cx="52" cy="62" rx="4.4" ry="4" fill="#f4efe6"/><circle cx="52.6" cy="62.4" r="2.6" fill="#5a3a22"/><circle cx="52.8" cy="62.4" r="1.1" fill="#05070c"/>
         <ellipse cx="68" cy="62" rx="4.4" ry="4" fill="#f4efe6"/><circle cx="68.6" cy="62.4" r="2.6" fill="#5a3a22"/><circle cx="68.8" cy="62.4" r="1.1" fill="#05070c"/>`;
  const mouth =
    pose === "wave" || pose === "run"
      ? `<path d="M53 74 Q60 82 67 74Z" fill="#7a2f2f"/>`
      : `<path d="M55 75 Q60 78 65 75" stroke="#8a3f3f" stroke-width="2.2" fill="none" stroke-linecap="round"/>`;
  // Kid proportions: big head, short body; place them smaller than adults.
  return svg(
    "0 20 140 240",
    `${shadow(60, 254, 30)}
    ${legs}${feet}
    ${armL}
    <path d="M40 96 Q60 88 80 96 L82 184 L38 184Z" fill="${S.top}"/>
    ${young ? `<circle cx="60" cy="130" r="9" fill="#ffd25a"/><path d="M56 128 l3 4 l6 -7" stroke="${S.top}" stroke-width="2.4" fill="none"/>` : `<path d="M50 96 Q60 112 70 96" stroke="#2f533c" stroke-width="5" fill="none"/><path d="M50 150 H70" stroke="#2f533c" stroke-width="4"/>`}
    <rect x="55" y="80" width="10" height="16" fill="${shade}"/>
    <ellipse cx="60" cy="60" rx="${young ? 24 : 22}" ry="${young ? 25 : 24}" fill="${skin}"/>
    <path d="M36 56 Q34 30 60 30 Q86 30 84 56 Q78 42 66 44 Q64 38 56 42 Q44 42 36 56Z" fill="${S.hair}"/>
    <ellipse cx="44" cy="70" rx="4" ry="2.4" fill="#e59a86" opacity=".45"/><ellipse cx="76" cy="70" rx="4" ry="2.4" fill="#e59a86" opacity=".45"/>
    ${eyes}${mouth}
    ${armR}`,
  );
}

/* ───────────── PLACES ───────────── */
// Soviet-style 9-storey panel block. lit: fraction of lit windows; floor5: highlight Gleb's flat.
export function panelBlock({ lit = 0.45, night = false, floor5 = false, seed = 5 } = {}) {
  let s = seed,
    wins = "";
  const rnd = () => (s = (s * 9301 + 49297) % 233280) / 233280;
  for (let f = 0; f < 9; f++)
    for (let c = 0; c < 8; c++) {
      const x = 30 + c * 66,
        y = 60 + (8 - f) * 92;
      const isGleb = floor5 && f === 4 && c === 3;
      const on = isGleb || rnd() < lit;
      wins += `<rect x="${x}" y="${y}" width="40" height="50" rx="2" fill="${on ? (isGleb ? "#ffd27a" : rnd() < 0.7 ? "#f2b45a" : "#bfd8ff") : night ? "#0b0f1c" : "#2a2f40"}" ${on && !isGleb ? `opacity="${0.75 + rnd() * 0.25}"` : ""}/>`;
      if (c % 2 === 0)
        wins += `<rect x="${x - 6}" y="${y + 50}" width="52" height="8" fill="${P.panelDark}"/>`;
    }
  let seams = "";
  for (let f = 0; f <= 9; f++)
    seams += `<path d="M0 ${48 + f * 92} H560" stroke="${P.panelDark}" stroke-width="3"/>`;
  for (let c = 0; c <= 4; c++)
    seams += `<path d="M${c * 140} 48 V876" stroke="${P.panelDark}" stroke-width="3"/>`;
  return svg(
    "0 0 560 900",
    `<rect x="0" y="40" width="560" height="860" fill="${night ? "#3d414d" : P.panel}"/>
     <rect x="-10" y="28" width="580" height="20" fill="${P.panelDark}"/>
     ${seams}${wins}
     <rect x="220" y="820" width="120" height="80" fill="#1d2130"/><rect x="200" y="806" width="160" height="14" fill="${P.panelDark}"/>
     <rect x="260" y="836" width="40" height="64" fill="#2c3245"/>`,
  );
}

// Interior: apartment entry with door. open: door swung.
export function hallway({ open = 0 } = {}) {
  return svg(
    "0 0 1080 1100",
    `<rect width="1080" height="1100" fill="${P.wallWarm}"/>
     <rect y="860" width="1080" height="240" fill="${P.floorWood}"/>
     ${Array.from({ length: 9 }, (_, i) => `<path d="M${i * 130} 860 L${i * 130 - 80} 1100" stroke="#3a2a1c" stroke-width="3"/>`).join("")}
     <rect x="0" y="840" width="1080" height="20" fill="#2c2420"/>
     <rect x="380" y="300" width="320" height="560" fill="#1a1512"/>
     <g transform="translate(380 300) scale(${1 - open * 0.8} 1)"><rect width="320" height="560" fill="#6b4a33"/><rect x="24" y="24" width="272" height="512" fill="none" stroke="#5a3d2a" stroke-width="8"/><circle cx="280" cy="300" r="12" fill="#c9a24a"/></g>
     <rect x="370" y="290" width="340" height="14" fill="#2c2420"/>
     <path d="M130 360 h120 v6 h-120z" fill="#2c2420"/><path d="M150 366 v60 M190 366 v80 M230 366 v50" stroke="#2c2420" stroke-width="4"/>
     <rect x="140" y="420" width="24" height="80" rx="8" fill="#5a6c8a"/><rect x="176" y="446" width="28" height="90" rx="8" fill="#8a4a3a"/>
     <rect x="800" y="380" width="160" height="220" rx="10" fill="#cfd6e2" opacity=".18"/><rect x="814" y="394" width="132" height="192" rx="6" fill="#1a1d26" opacity=".6"/>
     <circle cx="540" cy="120" r="34" fill="${P.lampGlow}"/><circle cx="540" cy="120" r="140" fill="${P.lampGlow}" opacity=".12"/>`,
  );
}

// Kitchen: table, stove with pot and steam, window with evening city, fridge, hanging lamp.
export function kitchen({ night = false, steam = true } = {}) {
  return svg(
    "0 0 1080 1100",
    `<rect width="1080" height="1100" fill="${night ? "#1a1820" : P.wallWarm2}"/>
     <rect y="520" width="1080" height="260" fill="${night ? "#22212b" : "#5a6170"}"/>
     ${Array.from({ length: 14 }, (_, i) => `<path d="M${i * 80} 520 V780" stroke="#4a505d" stroke-width="2" opacity=".6"/>`).join("")}
     ${Array.from({ length: 4 }, (_, i) => `<path d="M0 ${520 + i * 65} H1080" stroke="#4a505d" stroke-width="2" opacity=".6"/>`).join("")}
     <rect y="860" width="1080" height="240" fill="${P.floorWood}"/>
     <rect x="80" y="160" width="340" height="300" fill="${night ? "#05070d" : "#1d2340"}" stroke="#d8d2c4" stroke-width="14"/>
     <path d="M250 160 V460 M80 310 H420" stroke="#d8d2c4" stroke-width="10"/>
     ${night ? "" : `<rect x="96" y="380" width="308" height="66" fill="#ff8a3d" opacity=".25"/>${Array.from({ length: 7 }, (_, i) => `<rect x="${100 + i * 44}" y="${330 - (i % 3) * 28}" width="34" height="${130 + (i % 3) * 28}" fill="#2a2f48"/>`).join("")}`}
     <rect x="80" y="460" width="340" height="18" fill="#d8d2c4"/>
     <rect x="560" y="560" width="300" height="300" fill="#e7e3da"/><rect x="560" y="540" width="300" height="24" fill="#3a3a44"/>
     <circle cx="640" cy="552" r="0" fill="none"/>
     <rect x="590" y="640" width="240" height="180" rx="8" fill="#2a2a30"/><rect x="604" y="654" width="212" height="40" fill="#3a3a44"/>
     <path d="M650 540 h120 v-60 a10 10 0 0 0 -10 -10 h-100 a10 10 0 0 0 -10 10z" fill="#9a9ea8"/><rect x="636" y="476" width="148" height="12" rx="6" fill="#7a7e88"/>
     ${steam ? `<g id="steam" opacity=".55"><path class="st" d="M680 460 q-16 -30 0 -60 q16 -30 0 -60" stroke="#e8e6ef" stroke-width="10" fill="none" stroke-linecap="round"/><path class="st" d="M730 460 q16 -30 0 -60 q-16 -30 0 -60" stroke="#e8e6ef" stroke-width="10" fill="none" stroke-linecap="round"/></g>` : ""}
     <rect x="900" y="300" width="160" height="560" rx="10" fill="#d9dde4"/><path d="M900 520 H1060" stroke="#aab0bb" stroke-width="4"/><rect x="1030" y="360" width="10" height="100" rx="5" fill="#9aa0aa"/>
     <path d="M540 0 V120" stroke="#222" stroke-width="4"/><path d="M490 120 h100 l-20 40 h-60z" fill="#c25a3a"/>
     ${night ? "" : `<circle cx="540" cy="170" r="200" fill="${P.lampGlow}" opacity=".12"/>`}
     <rect x="120" y="740" width="420" height="22" rx="6" fill="#7a5a3e"/><path d="M150 762 V900 M510 762 V900" stroke="#5b4330" stroke-width="16"/>
     <ellipse cx="230" cy="732" rx="40" ry="10" fill="#e9e5dc"/><ellipse cx="330" cy="732" rx="40" ry="10" fill="#e9e5dc"/><ellipse cx="430" cy="732" rx="40" ry="10" fill="#e9e5dc"/>
     <ellipse cx="230" cy="728" rx="22" ry="5" fill="#d9903a"/><ellipse cx="330" cy="728" rx="22" ry="5" fill="#d9903a"/><ellipse cx="430" cy="728" rx="22" ry="5" fill="#d9903a"/>`,
  );
}

// Bedroom at night: bed with two sleepers, window that can flash.
export function bedroom() {
  return svg(
    "0 0 1080 1100",
    `<rect width="1080" height="1100" fill="#141826"/>
     <rect x="600" y="140" width="380" height="360" fill="#05070d" stroke="#3a3f52" stroke-width="14"/>
     <path d="M790 140 V500 M600 320 H980" stroke="#3a3f52" stroke-width="10"/>
     <g id="bed-flash" opacity="0"><rect x="607" y="147" width="366" height="346" fill="${P.flash}" opacity=".55"/></g>
     ${Array.from({ length: 6 }, (_, i) => `<rect x="${614 + i * 60}" y="${400 - (i % 3) * 40}" width="46" height="${100 + (i % 3) * 40}" fill="#0c0f1a"/>`).join("")}
     <path d="M560 120 Q540 320 570 520 L600 520 L600 130Z M1000 120 Q1020 320 990 520 L980 520 L980 130Z" fill="#2a2440"/>
     <rect y="860" width="1080" height="240" fill="#1d1a1a"/>
     <rect x="60" y="600" width="760" height="40" rx="10" fill="#3a2a2a"/>
     <rect x="60" y="560" width="40" height="300" rx="8" fill="#3a2a2a"/>
     <rect x="100" y="640" width="720" height="200" rx="20" fill="#2c3550"/>
     <rect x="110" y="600" width="170" height="70" rx="30" fill="#c9cfdc"/><rect x="290" y="600" width="170" height="70" rx="30" fill="#c9cfdc"/>
     <path d="M240 680 Q460 640 820 690 L820 840 L240 840Z" fill="#3c4a72"/>
     <rect x="840" y="700" width="140" height="160" rx="6" fill="#2a2222"/><rect x="880" y="660" width="60" height="40" rx="4" fill="#111"/><text x="910" y="688" text-anchor="middle" font-family="Inter, sans-serif" font-weight="900" font-size="20" fill="#ff5a4a">2:30</text>`,
  );
}

// Phone close-up with a news screen.
export function phoneScreen({ headline = "НАЧАЛАСЬ ВОЙНА" } = {}) {
  return svg(
    "0 0 520 980",
    `<rect x="0" y="0" width="520" height="980" rx="70" fill="#0b0c10"/>
     <rect x="24" y="24" width="472" height="932" rx="54" fill="#121620"/>
     <rect x="200" y="44" width="120" height="30" rx="15" fill="#0b0c10"/>
     <text x="60" y="120" font-family="Inter, sans-serif" font-weight="700" font-size="28" fill="#cfd6e2">2:31</text>
     <rect x="50" y="200" width="420" height="300" rx="24" fill="#2a1418"/>
     <rect x="50" y="200" width="160" height="44" rx="12" fill="#e23b2e"/><text x="130" y="230" text-anchor="middle" font-family="Inter, sans-serif" font-weight="900" font-size="24" fill="#fff">СРОЧНО</text>
     <text x="260" y="350" text-anchor="middle" font-family="Inter, sans-serif" font-weight="900" font-size="52" fill="#fff">${headline.split(" ")[0]}</text>
     <text x="260" y="420" text-anchor="middle" font-family="Inter, sans-serif" font-weight="900" font-size="52" fill="#ff5a4a">${headline.split(" ").slice(1).join(" ")}</text>
     ${[560, 640, 720, 800].map((y, i) => `<rect x="50" y="${y}" width="${380 - i * 50}" height="22" rx="11" fill="#2a3040"/>`).join("")}`,
  );
}

// Stairwell with painted floor number.
export function stairwell({ floor = 5 } = {}) {
  return svg(
    "0 0 1080 1100",
    `<rect width="1080" height="1100" fill="#2a3a3a"/>
     <rect y="0" width="1080" height="520" fill="#3c5250"/>
     <path d="M0 520 H1080" stroke="#1e2a2a" stroke-width="8"/>
     ${Array.from({ length: 9 }, (_, i) => `<rect x="${120 + i * 90}" y="${980 - i * 60}" width="${1080}" height="16" fill="#4a4f58"/><rect x="${120 + i * 90}" y="${996 - i * 60}" width="1080" height="44" fill="#363a44"/>`).join("")}
     <path d="M120 900 L930 420" stroke="#222" stroke-width="10"/>${Array.from({ length: 10 }, (_, i) => `<path d="M${160 + i * 80} ${876 - i * 47} V${960 - i * 47}" stroke="#222" stroke-width="6"/>`).join("")}
     <text x="240" y="360" text-anchor="middle" font-family="Inter, sans-serif" font-weight="900" font-size="220" fill="#d9d2b8" opacity=".85">${floor}</text>
     <rect x="760" y="120" width="120" height="60" rx="10" fill="#e9e3c9" opacity=".8"/><circle cx="820" cy="150" r="200" fill="#e9e3c9" opacity=".07"/>`,
  );
}
