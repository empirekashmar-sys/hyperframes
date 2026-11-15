// Gleb — part 1. Flat 2D art kit (same style as the zombie-farm kit).
import { C, hero } from "../../zombie-farm/art/art.js";
export { C, hero };

const svg = (vb, body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}">${body}</svg>`;
const shadow = (cx, cy, rx) =>
  `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="5" fill="#000" opacity=".35"/>`;
const T = (x, y, fill, text, size = 20, w = 900) =>
  `<text x="${x}" y="${y}" text-anchor="middle" font-family="Inter, sans-serif" font-weight="${w}" font-size="${size}" fill="${fill}">${text}</text>`;

export const P = {
  wallWarm: "#3b3330",
  wallWarm2: "#4a403b",
  floorWood: "#4b3726",
  lampGlow: "#ffcf7a",
  panel: "#6d7180",
  panelDark: "#4b4f5c",
  flash: "#ffb347",
  phone: "#9fd2ff",
};

/* ───────────── GLEB ───────────── */
// Gleb at home / at night: blue t-shirt, grey sweatpants, dark socks.
export function glebHome(pose = "stand") {
  return hero(pose)
    .replaceAll("#2b2321", "#4f6a8a")
    .replaceAll("#1a1514", "#425a78")
    .replaceAll("#4a3c37", "#4f6a8a")
    .replaceAll("#5b6270", "#4f6a8a")
    .replaceAll("#16181f", "#4a4d58")
    .replaceAll("#262a35", "#565a66")
    .replaceAll("#e9e7e2", "#2f3340")
    .replaceAll("#9a9ca3", "#2f3340")
    .replace(/<path d="M36 118 h12 M72 118 h12"[^>]*\/>/, "")
    .replace(/<path d="M60 104 V172"[^>]*\/>/, "");
}
// Phone in hand, face lit from below.
export function glebPhone(night = false) {
  const base = night ? glebHome("stand") : hero("stand");
  const sleeve = night ? "#4f6a8a" : "#2b2321";
  return base
    .replace(/<path d="M83 94 L91 158"[^>]*\/><circle cx="91" cy="164" r="7"[^>]*\/>/, "")
    .replace(
      "</svg>",
      `<path d="M83 94 L92 124 L72 112" stroke="${sleeve}" stroke-width="15" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
       <rect x="62" y="98" width="16" height="26" rx="3" fill="#111" transform="rotate(-12 70 111)"/>
       <rect x="64" y="101" width="12" height="20" rx="2" fill="${P.phone}" transform="rotate(-12 70 111)"/>
       <ellipse cx="62" cy="70" rx="26" ry="20" fill="${P.phone}" opacity=".18"/>
       <circle cx="70" cy="116" r="7" fill="#d9a882"/></svg>`,
    );
}

/* ───────────── MASHA ───────────── */
// pose: "stand" | "cook" | "scared" | "pack". outfit: "home" (cardigan + apron) | "night" (nightgown, hair down)
export function masha(pose = "stand", outfit = "home") {
  const night = outfit === "night";
  const M = {
    hair: "#5a3522",
    dress: night ? "#a9c3dc" : "#7c4f63",
    cardigan: "#d98e5a",
    apron: "#d9d2c3",
    skin: "#e2b08e",
    skinShade: "#c48f6d",
    iris: "#3e5a3a",
  };
  const sleeve = night ? M.dress : M.cardigan;
  const armR =
    pose === "cook"
      ? `<path d="M80 96 L104 116 L124 108" stroke="${sleeve}" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" fill="none"/><circle cx="126" cy="107" r="6" fill="${M.skin}"/><path d="M126 107 L138 86" stroke="#7a5a3e" stroke-width="5" stroke-linecap="round"/><ellipse cx="140" cy="83" rx="6" ry="3" fill="#7a5a3e"/>`
      : pose === "scared"
        ? `<path d="M80 96 L84 118 L66 104" stroke="${sleeve}" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" fill="none"/><circle cx="64" cy="102" r="6" fill="${M.skin}"/>`
        : pose === "pack"
          ? `<path d="M80 96 L94 132" stroke="${sleeve}" stroke-width="12" stroke-linecap="round"/><circle cx="95" cy="137" r="6" fill="${M.skin}"/><rect x="82" y="136" width="44" height="56" rx="8" fill="#3a5a8a"/><path d="M94 136 v-10 h20 v10" stroke="#2a4066" stroke-width="5" fill="none"/>`
          : `<path d="M80 96 L86 154" stroke="${sleeve}" stroke-width="12" stroke-linecap="round"/><circle cx="86" cy="159" r="6" fill="${M.skin}"/>`;
  const armL =
    pose === "scared"
      ? `<path d="M40 96 L34 118 L54 104" stroke="${sleeve}" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" fill="none"/><circle cx="56" cy="102" r="6" fill="${M.skinShade}"/>`
      : `<path d="M40 96 L34 154" stroke="${sleeve}" stroke-width="12" stroke-linecap="round"/><circle cx="34" cy="159" r="6" fill="${M.skinShade}"/>`;
  const mouth =
    pose === "scared" || pose === "pack"
      ? `<ellipse cx="60" cy="64" rx="3.6" ry="3" fill="#5a2a2a"/>`
      : `<path d="M54 63 Q60 68 66 63" stroke="#8a3f3f" stroke-width="2.4" fill="none" stroke-linecap="round"/>`;
  const apron =
    pose === "scared" || pose === "pack"
      ? ""
      : `<path d="M46 108 H74 L80 186 H40Z" fill="${M.apron}"/><path d="M46 108 Q60 98 74 108" stroke="${M.apron}" stroke-width="4" fill="none"/><rect x="54" y="140" width="12" height="10" rx="2" fill="#c9bfae"/>`;
  const body = night
    ? `<path d="M42 84 Q60 76 78 84 L90 236 L30 236Z" fill="${M.dress}"/><path d="M52 84 Q60 94 68 84" stroke="#8aa6c2" stroke-width="3" fill="none"/>`
    : `<path d="M40 84 Q60 74 80 84 L92 196 L28 196Z" fill="${M.dress}"/>
       <path d="M40 84 Q48 80 54 84 L50 190 L30 194Z M80 84 Q72 80 66 84 L70 190 L90 194Z" fill="${M.cardigan}"/>${apron}`;
  const hair = night
    ? `<path d="M36 50 Q32 18 60 16 Q88 18 84 50 Q88 86 80 110 L40 110 Q32 86 36 50Z" fill="${M.hair}"/>`
    : `<path d="M36 52 Q34 20 60 18 Q86 20 84 52 Q84 70 78 78 L42 78 Q36 70 36 52Z" fill="${M.hair}"/>`;
  const tail = night
    ? ""
    : `<path d="M78 30 Q96 30 92 56 Q90 70 84 76" stroke="${M.hair}" stroke-width="9" fill="none" stroke-linecap="round"/><circle cx="84" cy="28" r="4" fill="#c25a5a"/>`;
  const legs = night
    ? `<path d="M50 236 L50 246 M70 236 L70 246" stroke="${M.skinShade}" stroke-width="9" stroke-linecap="round"/><path d="M38 244 h18 v6 h-22z M64 244 h18 l4 6 h-22z" fill="#e8b4c4"/>`
    : `<path d="M52 186 L50 244 M68 186 L70 244" stroke="${M.skinShade}" stroke-width="10" stroke-linecap="round"/><path d="M38 244 h16 v8 h-20z M66 244 h16 l4 8 h-20z" fill="#e8b4c4"/>`;
  return svg(
    "0 0 140 260",
    `${shadow(60, 254, 32)}
    ${legs}${hair}${armL}${body}
    <rect x="55" y="64" width="10" height="16" fill="${M.skinShade}"/>
    <ellipse cx="60" cy="50" rx="19" ry="21" fill="${M.skin}"/>
    <path d="M40 46 Q42 24 60 24 Q80 24 80 46 Q74 32 60 34 Q48 34 40 46Z" fill="${M.hair}"/>
    ${tail}
    <path d="M47 42 Q52 40 56 42 M64 42 Q68 40 73 42" stroke="#3a2418" stroke-width="2.4" fill="none" stroke-linecap="round"/>
    <ellipse cx="52" cy="49" rx="4" ry="3.4" fill="#f4efe6"/><circle cx="52.5" cy="49.3" r="2.4" fill="${M.iris}"/><circle cx="52.6" cy="49.3" r="1" fill="#05070c"/>
    <ellipse cx="68" cy="49" rx="4" ry="3.4" fill="#f4efe6"/><circle cx="68.5" cy="49.3" r="2.4" fill="${M.iris}"/><circle cx="68.6" cy="49.3" r="1" fill="#05070c"/>
    <path d="M47 46 l-3 -2 M73 46 l3 -2" stroke="#3a2418" stroke-width="1.6" stroke-linecap="round"/>
    <circle cx="40" cy="56" r="2.4" fill="#e9d48a"/><circle cx="80" cy="56" r="2.4" fill="#e9d48a"/>
    <ellipse cx="45" cy="57" rx="3.6" ry="2.2" fill="#e59a86" opacity=".4"/><ellipse cx="75" cy="57" rx="3.6" ry="2.2" fill="#e59a86" opacity=".4"/>
    ${mouth}${armR}`,
  );
}

/* ───────────── SONS ───────────── */
// age: "young" (≈6, curly, dino tee, plush bunny) | "old" (≈12, glasses, hoodie, headphones)
// pose: "stand" | "run" | "wave" | "sleepy". outfit: "day" | "pajama"
export function son(age = "young", pose = "stand", outfit = "day") {
  const young = age === "young";
  const pj = outfit === "pajama";
  const S = pj
    ? young
      ? { top: "#7fb6d9", bottom: "#7fb6d9", hair: "#2a1d16", shoe: "#e9e7e2" }
      : { top: "#5d5a8a", bottom: "#5d5a8a", hair: "#3b2a1e", shoe: "#2f3340" }
    : young
      ? { top: "#c9483a", bottom: "#33507a", hair: "#2a1d16", shoe: "#3a7ad9" }
      : { top: "#3f6b4f", bottom: "#23283a", hair: "#3b2a1e", shoe: "#e9e7e2" };
  const skin = young ? "#e8b896" : "#d9a37f";
  const shade = young ? "#c9966f" : "#ba8762";
  const iris = young ? "#5a3a22" : "#3a4a6a";
  const stripes = pj
    ? [110, 130, 150, 170]
        .map((y) => `<path d="M40 ${y} H82" stroke="#fff" stroke-width="3" opacity=".35"/>`)
        .join("")
    : "";
  const legs =
    pose === "run"
      ? `<path d="M52 180 L40 240 M68 180 L84 236" stroke="${S.bottom}" stroke-width="15" stroke-linecap="round"/>`
      : young && !pj
        ? `<path d="M52 180 L50 242 M68 180 L70 242" stroke="${skin}" stroke-width="12" stroke-linecap="round"/><path d="M44 178 H76 L78 204 H42Z" fill="${S.bottom}"/>`
        : `<path d="M52 180 L50 242 M68 180 L70 242" stroke="${S.bottom}" stroke-width="14" stroke-linecap="round"/>`;
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
  const bunny = `<g transform="translate(14 140)"><ellipse cx="14" cy="22" rx="12" ry="14" fill="#e9dccd"/><circle cx="14" cy="4" r="9" fill="#e9dccd"/><path d="M9 -2 q-4 -16 2 -18 q3 6 1 18z M19 -2 q4 -16 -2 -18 q-3 6 -1 18z" fill="#e9dccd"/><circle cx="11" cy="3" r="1.4" fill="#222"/><circle cx="17" cy="3" r="1.4" fill="#222"/></g>`;
  const armL =
    pose === "run"
      ? `<path d="M40 108 L22 136" stroke="${S.top}" stroke-width="13" stroke-linecap="round"/><circle cx="20" cy="140" r="7" fill="${shade}"/>`
      : `${young ? bunny : ""}<path d="M40 108 L34 160" stroke="${S.top}" stroke-width="13" stroke-linecap="round"/><circle cx="34" cy="165" r="7" fill="${shade}"/>`;
  const eyes =
    pose === "sleepy"
      ? `<path d="M48 62 q4 3 8 0 M64 62 q4 3 8 0" stroke="#05070c" stroke-width="2.4" fill="none" stroke-linecap="round"/>`
      : `<ellipse cx="52" cy="62" rx="4.4" ry="4" fill="#f4efe6"/><circle cx="52.6" cy="62.4" r="2.6" fill="${iris}"/><circle cx="52.8" cy="62.4" r="1.1" fill="#05070c"/>
         <ellipse cx="68" cy="62" rx="4.4" ry="4" fill="#f4efe6"/><circle cx="68.6" cy="62.4" r="2.6" fill="${iris}"/><circle cx="68.8" cy="62.4" r="1.1" fill="#05070c"/>`;
  const glasses = young
    ? ""
    : `<circle cx="52" cy="62" r="7.5" fill="none" stroke="#1d1f26" stroke-width="2.4"/><circle cx="68" cy="62" r="7.5" fill="none" stroke="#1d1f26" stroke-width="2.4"/><path d="M59.5 62 h1" stroke="#1d1f26" stroke-width="2.4"/>`;
  const mouth =
    pose === "wave" || pose === "run"
      ? `<path d="M53 74 Q60 82 67 74Z" fill="#7a2f2f"/>`
      : pose === "sleepy"
        ? `<ellipse cx="60" cy="76" rx="3" ry="4" fill="#7a2f2f"/>`
        : `<path d="M55 75 Q60 78 65 75" stroke="#8a3f3f" stroke-width="2.2" fill="none" stroke-linecap="round"/>`;
  const hair = young
    ? [36, 44, 52, 60, 68, 76, 84]
        .map(
          (x, i) => `<circle cx="${x}" cy="${40 + Math.abs(3 - i) * 3}" r="9" fill="${S.hair}"/>`,
        )
        .join("") +
      `<circle cx="40" cy="52" r="7" fill="${S.hair}"/><circle cx="80" cy="52" r="7" fill="${S.hair}"/>`
    : `<path d="M36 58 Q34 30 60 30 Q86 30 84 54 L82 50 Q70 40 54 52 Q46 48 38 60Z" fill="${S.hair}"/><path d="M54 52 Q62 40 76 42" stroke="#5a4232" stroke-width="2" fill="none"/>`;
  const chest = pj
    ? young
      ? `<path d="M54 128 l4 -8 l4 8 l4 -8 l4 8" stroke="#ffe08a" stroke-width="2.4" fill="none"/>`
      : `<circle cx="70" cy="122" r="5" fill="#ffe08a"/><circle cx="72" cy="120" r="4" fill="${S.top}"/>`
    : young
      ? `<path d="M48 140 q4 -16 18 -14 q8 -10 14 -2 l-4 4 q-4 -2 -6 2 q8 6 2 18 l-4 -6 l-6 6 l-2 -8 q-8 4 -12 0z" fill="#6ad18a"/><circle cx="74" cy="126" r="1.4" fill="#222"/>`
      : `<path d="M50 96 Q60 112 70 96" stroke="#2f533c" stroke-width="5" fill="none"/><path d="M50 150 H70" stroke="#2f533c" stroke-width="4"/><path d="M58 104 v20 M62 104 v20" stroke="#cfd6e2" stroke-width="2"/>`;
  const headphones =
    young || pj
      ? ""
      : `<path d="M44 92 Q60 104 76 92" stroke="#1d1f26" stroke-width="5" fill="none"/><rect x="38" y="86" width="10" height="14" rx="4" fill="#e23b2e"/><rect x="72" y="86" width="10" height="14" rx="4" fill="#e23b2e"/>`;
  const freckles = young
    ? `<circle cx="66" cy="72" r=".9" fill="#a8704f"/><circle cx="54" cy="73" r=".9" fill="#a8704f"/><circle cx="60" cy="71" r=".9" fill="#a8704f"/>`
    : "";
  return svg(
    "0 20 140 240",
    `${shadow(60, 254, 30)}
    ${legs}${feet}${armL}
    <path d="M40 96 Q60 88 80 96 L82 184 L38 184Z" fill="${S.top}"/>
    ${stripes}${chest}
    <rect x="55" y="80" width="10" height="16" fill="${shade}"/>
    ${headphones}
    <ellipse cx="60" cy="60" rx="${young ? 24 : 21}" ry="25" fill="${skin}"/>
    ${hair}
    <ellipse cx="44" cy="70" rx="4" ry="2.4" fill="#e59a86" opacity=".45"/><ellipse cx="76" cy="70" rx="4" ry="2.4" fill="#e59a86" opacity=".45"/>
    ${freckles}${eyes}${glasses}${mouth}${armR}`,
  );
}

/* ───────────── PLACES ───────────── */
// Soviet-style 9-storey panel block: glazed balconies, AC units, antennas.
export function panelBlock({ lit = 0.45, night = false, floor5 = false, seed = 5 } = {}) {
  let s = seed;
  let wins = "";
  const rnd = () => (s = (s * 9301 + 49297) % 233280) / 233280;
  for (let f = 0; f < 9; f++)
    for (let c = 0; c < 8; c++) {
      const x = 30 + c * 66;
      const y = 60 + (8 - f) * 92;
      const isGleb = floor5 && f === 4 && c === 3;
      const on = isGleb || rnd() < lit;
      const col = on
        ? isGleb
          ? "#ffd27a"
          : rnd() < 0.7
            ? "#f2b45a"
            : "#bfd8ff"
        : night
          ? "#0b0f1c"
          : "#2a2f40";
      wins += `<rect x="${x}" y="${y}" width="40" height="50" rx="2" fill="${col}"/>`;
      if (on && rnd() < 0.5)
        wins += `<path d="M${x} ${y} h14 v50 h-14z" fill="#000" opacity=".18"/>`;
      if (c % 2 === 0) {
        wins += `<rect x="${x - 6}" y="${y + 50}" width="52" height="8" fill="${P.panelDark}"/>`;
        if (rnd() < 0.3)
          wins += `<rect x="${x - 6}" y="${y + 30}" width="52" height="20" fill="${night ? "#2c303c" : "#7a7f8e"}"/>`;
      }
      if (rnd() < 0.08)
        wins += `<rect x="${x + 28}" y="${y + 2}" width="10" height="16" rx="2" fill="#cfd6e2"/>`;
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
     <path d="M420 28 v-26 M440 28 v-18 M412 6 h36 M120 28 v-20 M108 10 h24" stroke="#2a2d36" stroke-width="3"/>
     ${seams}${wins}
     <rect x="220" y="820" width="120" height="80" fill="#1d2130"/><rect x="200" y="806" width="160" height="14" fill="${P.panelDark}"/>
     <rect x="260" y="836" width="40" height="64" fill="#2c3245"/><circle cx="280" cy="814" r="5" fill="${night ? "#ffd27a" : "#888"}"/>
     <rect x="10" y="860" width="60" height="40" fill="#2a2f3a"/><rect x="490" y="870" width="60" height="30" fill="#2a2f3a"/>`,
  );
}

const rug = (x, y, w, h, c1, c2) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" fill="${c1}"/><rect x="${x + 14}" y="${y + 10}" width="${w - 28}" height="${h - 20}" rx="6" fill="none" stroke="${c2}" stroke-width="5"/>`;

// Entry hall: striped wallpaper, coats on hooks, shoe rack with shoes, mirror, switch, rug, cat.
export function hallway({ open = 0 } = {}) {
  const coats = [
    [150, "#3a5a8a"],
    [200, "#8a3a3a"],
    [250, "#c9a24a"],
  ]
    .map(([x, c]) => `<path d="M${x} 366 l-26 30 l6 120 h40 l6 -120z" fill="${c}"/>`)
    .join("");
  return svg(
    "0 0 1080 1100",
    `<rect width="1080" height="1100" fill="${P.wallWarm}"/>
     ${Array.from({ length: 22 }, (_, i) => `<rect x="${i * 50}" y="0" width="22" height="840" fill="#463c37" opacity=".5"/>`).join("")}
     <rect y="700" width="1080" height="140" fill="#2f2825"/><path d="M0 700 H1080" stroke="#5a4a40" stroke-width="6"/>
     <rect y="860" width="1080" height="240" fill="${P.floorWood}"/>
     ${Array.from({ length: 9 }, (_, i) => `<path d="M${i * 130} 860 L${i * 130 - 80} 1100" stroke="#3a2a1c" stroke-width="3"/>`).join("")}
     <rect x="0" y="840" width="1080" height="20" fill="#2c2420"/>
     <rect x="380" y="300" width="320" height="560" fill="#0e0c0b"/><rect x="390" y="310" width="300" height="550" fill="#26303a" opacity=".6"/>
     <g transform="translate(380 300) scale(${1 - open * 0.8} 1)"><rect width="320" height="560" fill="#6b4a33"/><rect x="24" y="24" width="272" height="512" fill="none" stroke="#5a3d2a" stroke-width="8"/><circle cx="280" cy="300" r="12" fill="#c9a24a"/><rect x="150" y="150" width="20" height="14" rx="3" fill="#2a2a2a"/><circle cx="160" cy="80" r="8" fill="#9a9a9a"/></g>
     <rect x="370" y="290" width="340" height="14" fill="#2c2420"/>
     <path d="M110 366 h180" stroke="#2c2420" stroke-width="8"/>${coats}
     <rect x="100" y="760" width="230" height="90" rx="6" fill="#5b4330"/><path d="M100 805 H330" stroke="#3a2a1e" stroke-width="5"/>
     <path d="M120 790 q10 -18 40 -10 v10z M180 790 q10 -18 40 -10 v10z M250 838 q10 -18 40 -10 v10z M130 838 q8 -14 30 -8 v8z" fill="#1d1f26"/>
     <path d="M250 790 q8 -14 30 -8 v8z" fill="#3a7ad9"/>
     <rect x="790" y="340" width="190" height="300" rx="90" fill="#8a7a5a"/><rect x="804" y="354" width="162" height="272" rx="80" fill="#2b3346"/><path d="M830 400 l40 -30 M840 440 l70 -50" stroke="#5a6a8a" stroke-width="6" opacity=".6"/>
     <rect x="730" y="520" width="20" height="30" rx="4" fill="#d9d2c3"/>
     ${rug(380, 900, 320, 120, "#7a3a3a", "#c9a24a")}
     <g transform="translate(820 790)"><ellipse cx="40" cy="60" rx="46" ry="22" fill="#3a3a3a"/><circle cx="84" cy="34" r="20" fill="#3a3a3a"/><path d="M70 20 l4 -18 l10 14z M90 18 l8 -16 l4 18z" fill="#3a3a3a"/><circle cx="80" cy="32" r="3" fill="#ffd25a"/><circle cx="92" cy="32" r="3" fill="#ffd25a"/><path d="M-4 60 q-20 -30 6 -40" stroke="#3a3a3a" stroke-width="9" fill="none" stroke-linecap="round"/></g>
     <circle cx="540" cy="120" r="34" fill="${P.lampGlow}"/><circle cx="540" cy="120" r="160" fill="${P.lampGlow}" opacity=".1"/>`,
  );
}

// Kitchen: curtains, plant, upper cabinets, kettle, clock, fridge magnets, set table.
export function kitchen({ night = false, steam = true } = {}) {
  return svg(
    "0 0 1080 1100",
    `<rect width="1080" height="1100" fill="${night ? "#1a1820" : P.wallWarm2}"/>
     <rect y="520" width="1080" height="260" fill="${night ? "#22212b" : "#5a6170"}"/>
     ${Array.from({ length: 14 }, (_, i) => `<path d="M${i * 80} 520 V780" stroke="#4a505d" stroke-width="2" opacity=".6"/>`).join("")}
     ${Array.from({ length: 4 }, (_, i) => `<path d="M0 ${520 + i * 65} H1080" stroke="#4a505d" stroke-width="2" opacity=".6"/>`).join("")}
     <rect y="860" width="1080" height="240" fill="${P.floorWood}"/>
     ${Array.from({ length: 6 }, (_, i) => `<rect x="${i * 180}" y="${860 + (i % 2) * 120}" width="180" height="120" fill="#000" opacity=".06"/>`).join("")}
     <rect x="80" y="160" width="340" height="300" fill="${night ? "#05070d" : "#1d2340"}" stroke="#d8d2c4" stroke-width="14"/>
     <path d="M250 160 V460 M80 310 H420" stroke="#d8d2c4" stroke-width="10"/>
     ${night ? "" : `<rect x="96" y="380" width="308" height="66" fill="#ff8a3d" opacity=".25"/>${Array.from({ length: 7 }, (_, i) => `<rect x="${100 + i * 44}" y="${330 - (i % 3) * 28}" width="34" height="${130 + (i % 3) * 28}" fill="#2a2f48"/>`).join("")}`}
     <path d="M60 140 Q90 300 70 480 L110 480 Q100 300 110 150Z M440 140 Q410 300 430 480 L390 480 Q400 300 390 150Z" fill="#a8544a"/>
     <path d="M50 140 H450" stroke="#2a2420" stroke-width="8"/>
     <rect x="80" y="460" width="340" height="18" fill="#d8d2c4"/>
     <g transform="translate(150 420)"><rect x="0" y="10" width="34" height="30" rx="4" fill="#c25a3a"/><path d="M17 10 q-14 -26 -4 -36 M17 10 q4 -30 16 -34 M17 10 q-24 -10 -26 -24" stroke="#4a8a4a" stroke-width="7" fill="none" stroke-linecap="round"/></g>
     <rect x="520" y="200" width="360" height="170" fill="#c9bfae"/><path d="M700 200 V370" stroke="#a89e8e" stroke-width="5"/><circle cx="684" cy="290" r="5" fill="#6a6050"/><circle cx="716" cy="290" r="5" fill="#6a6050"/>
     <rect x="520" y="560" width="360" height="300" fill="#e7e3da"/><rect x="520" y="540" width="360" height="24" fill="#3a3a44"/>
     <rect x="590" y="640" width="240" height="180" rx="8" fill="#2a2a30"/><rect x="604" y="654" width="212" height="40" fill="#3a3a44"/>
     <path d="M610 540 h120 v-60 a10 10 0 0 0 -10 -10 h-100 a10 10 0 0 0 -10 10z" fill="#9a9ea8"/><rect x="596" y="476" width="148" height="12" rx="6" fill="#7a7e88"/>
     <path d="M780 540 q-4 -50 20 -56 h30 q24 6 20 56z" fill="#d9d2c3"/><path d="M850 500 q20 4 12 24" stroke="#d9d2c3" stroke-width="6" fill="none"/>
     ${steam ? `<g id="steam" opacity=".55"><path class="st" d="M640 460 q-16 -30 0 -60 q16 -30 0 -60" stroke="#e8e6ef" stroke-width="10" fill="none" stroke-linecap="round"/><path class="st" d="M690 460 q16 -30 0 -60 q-16 -30 0 -60" stroke="#e8e6ef" stroke-width="10" fill="none" stroke-linecap="round"/></g>` : ""}
     <rect x="900" y="300" width="160" height="560" rx="10" fill="#d9dde4"/><path d="M900 520 H1060" stroke="#aab0bb" stroke-width="4"/><rect x="1030" y="360" width="10" height="100" rx="5" fill="#9aa0aa"/>
     <rect x="920" y="340" width="30" height="22" fill="#e9c46a"/><circle cx="975" cy="400" r="12" fill="#d9534f"/><rect x="930" y="560" width="50" height="36" fill="#fff" opacity=".9"/><path d="M936 572 h36 M936 582 h26" stroke="#5b8bd9" stroke-width="3"/>
     <circle cx="470" cy="90" r="40" fill="#e9e3d0" stroke="#3a3330" stroke-width="6"/><path d="M470 90 V64 M470 90 L488 98" stroke="#3a3330" stroke-width="5" stroke-linecap="round"/>
     <path d="M560 0 V120" stroke="#222" stroke-width="4"/><path d="M510 120 h100 l-20 40 h-60z" fill="#c25a3a"/>
     ${night ? "" : `<circle cx="560" cy="170" r="220" fill="${P.lampGlow}" opacity=".12"/>`}
     <rect x="100" y="740" width="440" height="22" rx="6" fill="#7a5a3e"/><path d="M130 762 V900 M510 762 V900" stroke="#5b4330" stroke-width="16"/>
     <rect x="100" y="728" width="440" height="14" fill="#c9d6e6" opacity=".6"/>
     ${[180, 280, 380, 470].map((x) => `<ellipse cx="${x}" cy="726" rx="34" ry="9" fill="#e9e5dc"/><ellipse cx="${x}" cy="722" rx="18" ry="4" fill="#d9903a"/>`).join("")}
     <rect x="320" y="690" width="16" height="30" rx="3" fill="#8a5a3a"/><ellipse cx="230" cy="716" rx="20" ry="8" fill="#a83a2a"/>`,
  );
}

// Parents' bedroom at night: wall carpet, nightstand lamp, clock 2:30, flashing window.
export function bedroom() {
  return svg(
    "0 0 1080 1100",
    `<rect width="1080" height="1100" fill="#141826"/>
     <rect x="60" y="180" width="460" height="300" rx="10" fill="#4a1e28" opacity=".85"/>
     <rect x="80" y="200" width="420" height="260" rx="6" fill="none" stroke="#8a5a3a" stroke-width="6"/>
     ${Array.from({ length: 5 }, (_, i) => `<path d="M${130 + i * 80} 230 l30 40 l-30 40 l-30 -40z" fill="none" stroke="#8a5a3a" stroke-width="4"/>`).join("")}
     <rect x="600" y="140" width="380" height="360" fill="#05070d" stroke="#3a3f52" stroke-width="14"/>
     <path d="M790 140 V500 M600 320 H980" stroke="#3a3f52" stroke-width="10"/>
     ${Array.from({ length: 6 }, (_, i) => `<rect x="${614 + i * 60}" y="${400 - (i % 3) * 40}" width="46" height="${100 + (i % 3) * 40}" fill="#0c0f1a"/>`).join("")}
     <g id="bed-flash" opacity="0"><rect x="607" y="147" width="366" height="346" fill="${P.flash}" opacity=".55"/></g>
     <path d="M560 120 Q540 320 570 520 L600 520 L600 130Z M1000 120 Q1020 320 990 520 L980 520 L980 130Z" fill="#2a2440"/>
     <rect y="860" width="1080" height="240" fill="#1d1a1a"/>
     ${rug(140, 900, 600, 140, "#2e2a3c", "#4a4260")}
     <rect x="60" y="600" width="760" height="40" rx="10" fill="#3a2a2a"/>
     <rect x="60" y="560" width="40" height="300" rx="8" fill="#3a2a2a"/>
     <rect x="100" y="640" width="720" height="200" rx="20" fill="#2c3550"/>
     <rect x="110" y="600" width="170" height="70" rx="30" fill="#c9cfdc"/><rect x="290" y="600" width="170" height="70" rx="30" fill="#c9cfdc"/>
     <path d="M240 680 Q460 640 820 690 L820 840 L240 840Z" fill="#3c4a72"/>${Array.from({ length: 6 }, (_, i) => `<circle cx="${320 + i * 90}" cy="${740 + (i % 2) * 40}" r="8" fill="#56649a"/>`).join("")}
     <rect x="840" y="700" width="140" height="160" rx="6" fill="#2a2222"/><rect x="880" y="660" width="60" height="40" rx="4" fill="#111"/>${T(910, 688, "#ff5a4a", "2:30", 20)}
     <path d="M856 700 v-40 h24" stroke="#555" stroke-width="4" fill="none"/><path d="M840 660 l20 -40 h20 l20 40z" fill="#6a5a3a"/>
     <rect x="955" y="690" width="16" height="10" rx="2" fill="#9fd2ff" opacity=".7"/>`,
  );
}

// Kids' room at night: bunk bed, posters, toys, nightlight, flashing window.
export function kidsRoom() {
  return svg(
    "0 0 1080 1100",
    `<rect width="1080" height="1100" fill="#1a2030"/>
     ${Array.from({ length: 30 }, (_, i) => `<path d="M${(i * 137) % 1080} ${(i * 89) % 520} l6 0 l-3 6z" fill="#2a3450"/>`).join("")}
     <rect x="640" y="160" width="320" height="300" fill="#05070d" stroke="#3a4258" stroke-width="12"/><path d="M800 160 V460" stroke="#3a4258" stroke-width="8"/>
     <g id="kid-flash" opacity="0"><rect x="646" y="166" width="308" height="288" fill="${P.flash}" opacity=".5"/></g>
     <rect x="120" y="170" width="150" height="200" fill="#2a4a6a"/><path d="M150 330 l40 -90 l40 90z" fill="#d9a23a"/><circle cx="195" cy="220" r="14" fill="#ffd25a"/>
     <rect x="300" y="200" width="130" height="170" fill="#4a2a5a"/><circle cx="365" cy="270" r="34" fill="#6ad18a"/><circle cx="355" cy="262" r="5" fill="#222"/>
     <rect y="860" width="1080" height="240" fill="#2a2420"/>
     ${rug(560, 920, 420, 130, "#2a5a4a", "#e9c46a")}
     <rect x="80" y="420" width="24" height="460" fill="#6a4a33"/><rect x="480" y="420" width="24" height="460" fill="#6a4a33"/>
     <rect x="80" y="560" width="424" height="26" fill="#6a4a33"/><rect x="80" y="800" width="424" height="26" fill="#6a4a33"/>
     <rect x="104" y="520" width="376" height="44" rx="10" fill="#3a5a8a"/><rect x="110" y="506" width="100" height="30" rx="12" fill="#c9cfdc"/>
     <rect x="104" y="760" width="376" height="44" rx="10" fill="#8a3a3a"/><rect x="110" y="746" width="100" height="30" rx="12" fill="#c9cfdc"/>
     ${Array.from({ length: 6 }, (_, i) => `<path d="M504 ${600 + i * 36} h40" stroke="#6a4a33" stroke-width="8"/>`).join("")}<path d="M540 586 V820" stroke="#6a4a33" stroke-width="8"/>
     <g transform="translate(620 830)"><rect width="70" height="50" rx="6" fill="#d9534f"/><rect x="80" y="10" width="50" height="40" rx="6" fill="#5b8bd9"/><rect x="20" y="-30" width="40" height="30" rx="6" fill="#e9c46a"/><circle cx="160" cy="34" r="18" fill="#f2f2f2"/><path d="M146 30 h28 M160 16 v36" stroke="#d9534f" stroke-width="3"/></g>
     <rect x="900" y="780" width="50" height="40" rx="10" fill="#ffe08a"/><circle cx="925" cy="800" r="90" fill="#ffe08a" opacity=".1"/>`,
  );
}

// Phone close-up with a news screen.
export function phoneScreen({ headline = "НАЧАЛАСЬ ВОЙНА" } = {}) {
  const [first, ...rest] = headline.split(" ");
  return svg(
    "0 0 520 980",
    `<rect x="0" y="0" width="520" height="980" rx="70" fill="#0b0c10"/>
     <rect x="24" y="24" width="472" height="932" rx="54" fill="#121620"/>
     <rect x="200" y="44" width="120" height="30" rx="15" fill="#0b0c10"/>
     <text x="60" y="120" font-family="Inter, sans-serif" font-weight="700" font-size="28" fill="#cfd6e2">2:31</text>
     <rect x="380" y="100" width="40" height="20" rx="4" fill="none" stroke="#cfd6e2" stroke-width="3"/><rect x="384" y="104" width="12" height="12" fill="#e23b2e"/>
     <rect x="50" y="200" width="420" height="300" rx="24" fill="#2a1418"/>
     <rect x="50" y="200" width="160" height="44" rx="12" fill="#e23b2e"/>${T(130, 230, "#fff", "СРОЧНО", 24)}
     ${T(260, 350, "#fff", first, 52)}${T(260, 420, "#ff5a4a", rest.join(" "), 52)}
     ${[560, 640, 720, 800].map((y, i) => `<rect x="50" y="${y}" width="${380 - i * 50}" height="22" rx="11" fill="#2a3040"/>`).join("")}
     <rect x="50" y="860" width="420" height="60" rx="16" fill="#1d2433"/>${T(260, 898, "#9fb0c8", "12 пропущенных", 22, 700)}`,
  );
}

// Stairwell: painted floor number, mailboxes, a neighbour's door, peeling paint, graffiti, lamp.
export function stairwell({ floor = 5 } = {}) {
  return svg(
    "0 0 1080 1100",
    `<rect width="1080" height="1100" fill="#2a3a3a"/>
     <rect y="0" width="1080" height="520" fill="#3c5250"/>
     <path d="M0 520 H1080" stroke="#1e2a2a" stroke-width="8"/>
     <path d="M560 140 q30 10 20 40 q-30 0 -20 -40z M120 460 q40 -6 50 30 q-40 10 -50 -30z M900 300 q20 30 -10 50 q-20 -30 10 -50z" fill="#5a6e6a"/>
     <rect x="420" y="160" width="260" height="140" fill="#5a5f66"/>${Array.from({ length: 8 }, (_, i) => `<rect x="${430 + (i % 4) * 62}" y="${172 + Math.floor(i / 4) * 64}" width="52" height="54" fill="#6e747c"/><rect x="${444 + (i % 4) * 62}" y="${186 + Math.floor(i / 4) * 64}" width="24" height="6" fill="#2a2d33"/>`).join("")}
     <path d="M700 380 l30 -10 l10 30 M730 370 q20 30 60 10" stroke="#c94a4a" stroke-width="5" fill="none" opacity=".7"/>
     ${Array.from({ length: 9 }, (_, i) => `<rect x="${120 + i * 90}" y="${980 - i * 60}" width="1080" height="16" fill="#4a4f58"/><rect x="${120 + i * 90}" y="${996 - i * 60}" width="1080" height="44" fill="#363a44"/>`).join("")}
     <path d="M120 900 L930 420" stroke="#222" stroke-width="10"/>${Array.from({ length: 10 }, (_, i) => `<path d="M${160 + i * 80} ${876 - i * 47} V${960 - i * 47}" stroke="#222" stroke-width="6"/>`).join("")}
     <rect x="0" y="560" width="120" height="420" fill="#6a3a2a"/><circle cx="100" cy="760" r="8" fill="#c9a24a"/><rect x="20" y="600" width="80" height="18" fill="#c9a24a" opacity=".6"/>
     <text x="240" y="380" text-anchor="middle" font-family="Inter, sans-serif" font-weight="900" font-size="220" fill="#d9d2b8" opacity=".85">${floor}</text>
     <rect x="820" y="100" width="120" height="60" rx="10" fill="#e9e3c9" opacity=".8"/><circle cx="880" cy="130" r="220" fill="#e9e3c9" opacity=".07"/>`,
  );
}

// Basement: concrete, ceiling pipes, one bulb, wooden storage stalls, shelves with jars,
// water canisters, bicycle, sled; stairs and door Gleb comes down through. lit: bulb on/off.
export function basement({ lit = true } = {}) {
  const stall = (x, n) =>
    `<g transform="translate(${x} 470)"><rect width="230" height="390" fill="#3a2e24"/>
     ${Array.from({ length: 9 }, (_, i) => `<rect x="${i * 26}" y="0" width="20" height="390" fill="#5a4632"/>`).join("")}
     <rect x="0" y="120" width="230" height="14" fill="#4a3826"/><rect x="0" y="280" width="230" height="14" fill="#4a3826"/>
     <rect x="180" y="190" width="28" height="22" rx="4" fill="#8b8f99"/>
     <text x="40" y="70" font-family="Inter, sans-serif" font-weight="900" font-size="40" fill="#e9e3c9" opacity=".7">${n}</text></g>`;
  const glow = lit
    ? `<circle cx="560" cy="150" r="380" fill="#ffcf7a" opacity=".1"/><circle cx="560" cy="150" r="180" fill="#ffcf7a" opacity=".12"/>`
    : "";
  return svg(
    "0 0 1080 1100",
    `<rect width="1080" height="1100" fill="#24262b"/>
     <rect y="0" width="1080" height="860" fill="#33363c"/>
     ${Array.from({ length: 5 }, (_, i) => `<path d="M0 ${150 + i * 150} H1080" stroke="#2a2c31" stroke-width="4"/>`).join("")}
     <path d="M120 300 q30 -20 60 6 q-20 30 -60 -6z M760 220 q40 -10 50 20 q-30 20 -50 -20z" fill="#3e4148"/>
     <path d="M0 60 H1080" stroke="#5a5f66" stroke-width="26"/><path d="M0 104 H1080" stroke="#6a4a3a" stroke-width="16"/>
     ${[200, 520, 860].map((x) => `<rect x="${x}" y="44" width="16" height="78" fill="#4a4f56"/>`).join("")}
     <path d="M900 60 V420" stroke="#5a5f66" stroke-width="20"/><circle cx="900" cy="300" r="22" fill="#b23a2e"/><path d="M886 300 h28" stroke="#5a1a14" stroke-width="5"/>
     <path d="M560 60 V130" stroke="#222" stroke-width="4"/>
     <circle cx="560" cy="150" r="22" fill="${lit ? "#ffe9a8" : "#555"}"/>${glow}
     <rect y="860" width="1080" height="240" fill="#2c2e33"/>
     <path d="M200 900 q60 20 140 6 q40 -6 80 10 M640 960 q80 -10 160 8" stroke="#3a3d43" stroke-width="10" fill="none" stroke-linecap="round"/>
     ${stall(40, "12")}${stall(300, "15")}
     <rect x="560" y="540" width="280" height="16" fill="#5a4632"/><rect x="560" y="660" width="280" height="16" fill="#5a4632"/><rect x="560" y="780" width="280" height="16" fill="#5a4632"/>
     <path d="M566 540 V860 M834 540 V860" stroke="#4a3826" stroke-width="10"/>
     ${[0, 1, 2, 3, 4, 5].map((i) => `<rect x="${580 + i * 42}" y="500" width="30" height="40" rx="5" fill="${i % 2 ? "#b8452e" : "#d9a23a"}" opacity=".9"/><rect x="${582 + i * 42}" y="492" width="26" height="10" rx="2" fill="#a8a29a"/>`).join("")}
     ${[0, 1, 2].map((i) => `<rect x="${590 + i * 80}" y="600" width="60" height="60" rx="6" fill="#8a7050"/><path d="M${590 + i * 80} 622 h60" stroke="#6a5038" stroke-width="3"/>`).join("")}
     ${[0, 1, 2, 3].map((i) => `<rect x="${580 + i * 62}" y="710" width="48" height="70" rx="8" fill="#5b8bd9" opacity=".75"/><rect x="${596 + i * 62}" y="700" width="16" height="12" fill="#2a4a8a"/>`).join("")}
     <g transform="translate(300 880)"><circle cx="0" cy="60" r="56" fill="none" stroke="#1d1f26" stroke-width="10"/><circle cx="210" cy="60" r="56" fill="none" stroke="#1d1f26" stroke-width="10"/><path d="M0 60 L70 -10 H170 L210 60 M70 -10 L110 60 L170 -10 M110 60 L0 60" stroke="#3a6a8a" stroke-width="10" fill="none"/></g>
     <g transform="translate(40 960)"><rect width="200" height="16" rx="8" fill="#b23a2e"/><path d="M10 16 v30 h180 v-30 M0 46 q-10 0 -10 -14" stroke="#555" stroke-width="6" fill="none"/></g>
     <rect x="870" y="480" width="190" height="380" fill="#1a1c20"/>
     ${Array.from({ length: 6 }, (_, i) => `<rect x="${870 + i * 32}" y="${480 + i * 64}" width="${190 - i * 32}" height="14" fill="#3a3d43"/>`).join("")}
     <rect x="870" y="380" width="190" height="100" fill="#141518"/><rect x="884" y="392" width="162" height="88" fill="${lit ? "#4a4030" : "#202226"}" opacity=".7"/>`,
  );
}
