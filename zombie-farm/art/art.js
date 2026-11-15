// Zombie Farm — flat 2D art kit. Every function returns a standalone <svg> string.
// Same palette everywhere so characters, props and backgrounds read as one world.

export const C = {
  sky0: "#070a14",
  sky1: "#121a30",
  sky2: "#2a1e2e",
  glow: "#ff6a2b",
  glowDeep: "#9c2f12",
  moon: "#e9e3c9",
  hill1: "#151b2b",
  hill2: "#10141f",
  ground: "#0d1119",
  wood: "#5b4330",
  woodDark: "#3a2a1e",
  woodLight: "#7a5a3e",
  stone: "#5d6170",
  stoneDark: "#3c3f4b",
  roof: "#3b1f22",
  wall: "#2c2f3d",
  wallLight: "#3a3e50",
  windowLit: "#ffc25a",
  windowDark: "#0a0d16",
  skin: "#d9a57f",
  skinShade: "#b98663",
  jacket: "#4f5d3a",
  jacketDark: "#38422a",
  jeans: "#2d3a52",
  boots: "#1c1712",
  hat: "#3d2f22",
  zSkin: "#7f8f6c",
  zSkinShade: "#5f6d4f",
  zCloth: "#3b3f4c",
  zCloth2: "#4a3434",
  eyeRed: "#ff3b2f",
  blood: "#8e1b14",
  goose: "#ece8de",
  gooseShade: "#c9c3b4",
  beak: "#f08a24",
  dogFur: "#8a5a32",
  dogSaddle: "#2a1f17",
  cow: "#e6e0d3",
  cowSpot: "#1d1d22",
  accent: "#ffb02e",
  danger: "#ff4a3d",
  ink: "#05070c",
};

const svg = (vb, body, extra = "") =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" ${extra}>${body}</svg>`;

/* ───────────── CHARACTERS ───────────── */

// The farmer — narrator's stand-in. pose: "stand" | "point" | "carry"
export function farmer(pose = "stand") {
  const armR =
    pose === "point"
      ? `<path d="M84 96 L128 78" stroke="${C.jacket}" stroke-width="14" stroke-linecap="round"/><circle cx="131" cy="77" r="7" fill="${C.skin}"/>`
      : pose === "carry"
        ? `<path d="M84 96 L96 128 L70 134" stroke="${C.jacket}" stroke-width="14" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`
        : `<path d="M84 96 L92 158" stroke="${C.jacket}" stroke-width="14" stroke-linecap="round"/><circle cx="92" cy="163" r="7" fill="${C.skin}"/>`;
  const armL =
    pose === "carry"
      ? `<path d="M36 96 L26 128 L52 134" stroke="${C.jacketDark}" stroke-width="14" stroke-linecap="round" stroke-linejoin="round" fill="none"/><rect x="34" y="118" width="54" height="34" rx="4" fill="${C.woodLight}" stroke="${C.woodDark}" stroke-width="3"/><path d="M34 130 H88" stroke="${C.woodDark}" stroke-width="3"/>`
      : `<path d="M36 96 L28 158" stroke="${C.jacketDark}" stroke-width="14" stroke-linecap="round"/><circle cx="28" cy="163" r="7" fill="${C.skinShade}"/>`;
  return svg(
    "0 0 140 260",
    `
    <ellipse cx="60" cy="254" rx="34" ry="5" fill="#000" opacity=".35"/>
    <path d="M50 168 L44 246" stroke="${C.jeans}" stroke-width="15" stroke-linecap="round"/>
    <path d="M70 168 L76 246" stroke="${C.jeans}" stroke-width="15" stroke-linecap="round"/>
    <path d="M34 246 h18 v8 h-22 z M68 246 h18 l4 8 h-22 z" fill="${C.boots}"/>
    ${pose === "carry" ? "" : armL}
    <rect x="33" y="80" width="54" height="96" rx="16" fill="${C.jacket}"/>
    <path d="M60 82 V172" stroke="${C.jacketDark}" stroke-width="3"/>
    <rect x="40" y="120" width="14" height="12" rx="2" fill="${C.jacketDark}"/>
    <rect x="66" y="120" width="14" height="12" rx="2" fill="${C.jacketDark}"/>
    <path d="M44 80 L60 98 L76 80" fill="#6b3a2a"/>
    <rect x="54" y="66" width="12" height="16" fill="${C.skinShade}"/>
    <circle cx="60" cy="52" r="23" fill="${C.skin}"/>
    <path d="M38 56 Q40 76 60 77 Q80 76 82 56 Q74 66 60 66 Q46 66 38 56Z" fill="#5a4636"/>
    <ellipse cx="51" cy="50" rx="2.6" ry="3.2" fill="${C.ink}"/>
    <ellipse cx="69" cy="50" rx="2.6" ry="3.2" fill="${C.ink}"/>
    <path d="M45 43 L56 45 M64 45 L75 43" stroke="#3a2b20" stroke-width="3" stroke-linecap="round"/>
    <ellipse cx="60" cy="34" rx="40" ry="7" fill="${C.hat}"/>
    <path d="M40 34 Q42 10 60 10 Q78 10 80 34Z" fill="${C.hat}"/>
    <path d="M41 28 H79" stroke="#6b5136" stroke-width="4"/>
    ${pose === "carry" ? armL : ""}
    ${armR}
  `,
  );
}

// Close-to-camera infected. variant 0/1 changes clothes & posture.
export function infected(variant = 0) {
  const cloth = variant ? C.zCloth2 : C.zCloth;
  const tilt = variant ? -8 : 6;
  return svg(
    "0 0 150 260",
    `
    <ellipse cx="70" cy="254" rx="34" ry="5" fill="#000" opacity=".35"/>
    <path d="M58 166 L48 246" stroke="#2a2d36" stroke-width="15" stroke-linecap="round"/>
    <path d="M80 166 L92 240" stroke="#2a2d36" stroke-width="15" stroke-linecap="round"/>
    <path d="M38 244 h18 v8 h-22z M84 238 h18 l3 8 h-22z" fill="${C.boots}"/>
    <path d="M44 92 L112 104" stroke="${cloth}" stroke-width="14" stroke-linecap="round"/>
    <path d="M112 104 L134 104" stroke="${C.zSkinShade}" stroke-width="10" stroke-linecap="round"/>
    <g transform="rotate(${tilt} 70 120)">
      <path d="M40 82 Q70 70 100 84 L96 176 L44 176Z" fill="${cloth}"/>
      <path d="M52 176 L58 160 L64 176 L72 158 L80 176 L88 162 L96 176Z" fill="${cloth}"/>
      <path d="M58 110 l10 14 l-6 4z M80 132 l8 10 l-8 2z" fill="${C.zSkinShade}"/>
      <path d="M62 140 q6 6 2 14" stroke="${C.blood}" stroke-width="4" fill="none" stroke-linecap="round"/>
      <rect x="62" y="62" width="14" height="16" fill="${C.zSkinShade}"/>
      <ellipse cx="70" cy="46" rx="22" ry="24" fill="${C.zSkin}"/>
      <path d="M48 40 Q50 18 70 20 Q92 20 92 38 Q80 30 66 34 Q56 30 48 40Z" fill="#2c2a26"/>
      <circle cx="61" cy="46" r="5" fill="${C.ink}"/><circle cx="61" cy="46" r="3" fill="${C.eyeRed}"/>
      <circle cx="80" cy="46" r="5" fill="${C.ink}"/><circle cx="80" cy="46" r="3" fill="${C.eyeRed}"/>
      <path d="M60 60 Q70 66 82 59 L80 64 Q70 70 61 64Z" fill="${C.ink}"/>
      <path d="M64 61 v3 M70 62 v4 M76 61 v3" stroke="#d9d2bf" stroke-width="1.6"/>
    </g>
    <path d="M100 96 L136 92" stroke="${cloth}" stroke-width="14" stroke-linecap="round"/>
    <path d="M136 92 L146 90" stroke="${C.zSkin}" stroke-width="10" stroke-linecap="round"/>
  `,
  );
}

// Bitten stranger at the gate — still human, bandaged arm, pleading.
export function bitten() {
  return svg(
    "0 0 140 260",
    `
    <ellipse cx="66" cy="254" rx="34" ry="5" fill="#000" opacity=".35"/>
    <path d="M56 168 L50 246" stroke="#3b3a40" stroke-width="15" stroke-linecap="round"/>
    <path d="M76 168 L82 246" stroke="#3b3a40" stroke-width="15" stroke-linecap="round"/>
    <path d="M40 246 h18 v8 h-22z M74 246 h18 l4 8 h-22z" fill="${C.boots}"/>
    <rect x="39" y="82" width="54" height="94" rx="16" fill="#6a5a7a"/>
    <path d="M42 96 L22 70" stroke="#6a5a7a" stroke-width="14" stroke-linecap="round"/>
    <circle cx="20" cy="66" r="7" fill="${C.skin}"/>
    <path d="M90 96 L104 136" stroke="#6a5a7a" stroke-width="14" stroke-linecap="round"/>
    <path d="M104 136 L112 156" stroke="#e7e1d4" stroke-width="13" stroke-linecap="round"/>
    <circle cx="108" cy="146" r="5" fill="${C.blood}"/>
    <rect x="60" y="66" width="12" height="16" fill="${C.skinShade}"/>
    <circle cx="66" cy="52" r="23" fill="#cfa489"/>
    <path d="M43 50 Q44 26 66 27 Q88 26 89 48 Q78 36 66 40 Q52 36 43 50Z" fill="#7a4b2c"/>
    <ellipse cx="57" cy="52" rx="2.6" ry="3.4" fill="${C.ink}"/>
    <ellipse cx="75" cy="52" rx="2.6" ry="3.4" fill="${C.ink}"/>
    <path d="M51 44 L59 47 M73 47 L81 44" stroke="#4a3020" stroke-width="2.6" stroke-linecap="round"/>
    <ellipse cx="66" cy="65" rx="5" ry="4" fill="${C.ink}"/>
    <path d="M52 58 q-2 6 0 9" stroke="#8fb3c9" stroke-width="2" fill="none"/>
  `,
  );
}

// Far-away infected silhouettes (horizon / road). count = how many.
export function horde(count = 7, seed = 3) {
  let s = seed;
  const rnd = () => (s = (s * 9301 + 49297) % 233280) / 233280;
  let out = "";
  for (let i = 0; i < count; i++) {
    const x = 20 + i * (560 / count) + rnd() * 30;
    const h = 70 + rnd() * 30;
    const lean = (rnd() - 0.5) * 16;
    const y = 120 - h;
    out += `<g transform="translate(${x} ${y}) rotate(${lean} 15 ${h})">
      <ellipse cx="15" cy="10" rx="9" ry="10" fill="${C.ink}"/>
      <path d="M4 22 Q15 16 26 22 L24 ${h * 0.62} L6 ${h * 0.62}Z" fill="${C.ink}"/>
      <path d="M22 26 L44 30" stroke="${C.ink}" stroke-width="6" stroke-linecap="round"/>
      <path d="M8 ${h * 0.6} L3 ${h}" stroke="${C.ink}" stroke-width="7" stroke-linecap="round"/>
      <path d="M21 ${h * 0.6} L27 ${h}" stroke="${C.ink}" stroke-width="7" stroke-linecap="round"/>
      <circle cx="12" cy="9" r="1.8" fill="${C.eyeRed}"/><circle cx="19" cy="9" r="1.8" fill="${C.eyeRed}"/>
    </g>`;
  }
  return svg("0 0 640 130", out);
}

// Goose. pose: "walk" | "honk"
export function goose(pose = "walk") {
  const neck =
    pose === "honk"
      ? `<path d="M100 74 Q108 40 112 18" stroke="${C.goose}" stroke-width="16" stroke-linecap="round" fill="none"/>
         <circle cx="113" cy="16" r="11" fill="${C.goose}"/>
         <path d="M120 10 L146 2 L124 14Z" fill="${C.beak}"/><path d="M121 18 L146 24 L122 21Z" fill="#c9661a"/>
         <circle cx="115" cy="12" r="2.4" fill="${C.ink}"/>`
      : `<path d="M100 74 Q116 50 110 30" stroke="${C.goose}" stroke-width="16" stroke-linecap="round" fill="none"/>
         <circle cx="112" cy="28" r="11" fill="${C.goose}"/>
         <path d="M120 26 L142 32 L120 33Z" fill="${C.beak}"/>
         <circle cx="114" cy="24" r="2.4" fill="${C.ink}"/>`;
  return svg(
    "0 0 160 140",
    `
    <ellipse cx="74" cy="134" rx="40" ry="4" fill="#000" opacity=".35"/>
    <path d="M66 108 L62 130 M82 108 L86 130" stroke="${C.beak}" stroke-width="5" stroke-linecap="round"/>
    <path d="M54 131 h14 M80 131 h14" stroke="${C.beak}" stroke-width="5" stroke-linecap="round"/>
    <path d="M18 76 Q30 60 70 64 Q108 68 106 92 Q100 114 66 112 Q34 110 22 96 Q10 84 18 76Z" fill="${C.goose}"/>
    <path d="M30 82 Q60 74 92 90 Q76 104 46 100Z" fill="${C.gooseShade}"/>
    <path d="M18 76 L4 70 L16 86Z" fill="${C.gooseShade}"/>
    ${neck}
  `,
  );
}

// Dog. pose: "stand" | "bark"
export function dog(pose = "stand") {
  const head =
    pose === "bark"
      ? `<g transform="rotate(-14 140 46)">
          <path d="M120 30 L126 8 L136 28Z M140 26 L150 6 L154 28Z" fill="${C.dogSaddle}"/>
          <ellipse cx="140" cy="44" rx="22" ry="18" fill="${C.dogFur}"/>
          <path d="M152 38 L178 40 L176 48 L154 50Z" fill="${C.dogFur}"/>
          <path d="M156 54 L176 62 L174 54Z" fill="#5a1d1d"/>
          <circle cx="178" cy="42" r="4" fill="${C.ink}"/>
          <circle cx="142" cy="38" r="3" fill="${C.ink}"/>
        </g>
        <path d="M184 22 l10 -6 M188 34 l12 -2 M186 46 l10 4" stroke="${C.accent}" stroke-width="3" stroke-linecap="round"/>`
      : `<path d="M120 34 L126 10 L136 30Z M140 30 L150 8 L154 32Z" fill="${C.dogSaddle}"/>
         <ellipse cx="140" cy="48" rx="22" ry="18" fill="${C.dogFur}"/>
         <path d="M152 44 L176 48 L174 58 L152 58Z" fill="${C.dogFur}"/>
         <circle cx="176" cy="51" r="4" fill="${C.ink}"/>
         <circle cx="142" cy="42" r="3" fill="${C.ink}"/>`;
  return svg(
    "0 0 200 140",
    `
    <ellipse cx="96" cy="134" rx="64" ry="5" fill="#000" opacity=".35"/>
    <path d="M30 60 Q14 40 22 22" stroke="${C.dogFur}" stroke-width="10" stroke-linecap="round" fill="none"/>
    <path d="M50 96 L46 130 M70 98 L72 130 M118 96 L114 130 M134 92 L138 130" stroke="${C.dogFur}" stroke-width="11" stroke-linecap="round"/>
    <path d="M28 66 Q40 52 90 54 Q130 54 138 66 Q144 96 120 102 L44 104 Q24 96 28 66Z" fill="${C.dogFur}"/>
    <path d="M40 60 Q80 48 124 58 Q118 76 80 78 Q50 78 40 60Z" fill="${C.dogSaddle}"/>
    ${head}
  `,
  );
}

export function cow() {
  return svg(
    "0 0 220 150",
    `
    <ellipse cx="104" cy="144" rx="80" ry="5" fill="#000" opacity=".35"/>
    <path d="M50 100 L48 140 M74 102 L74 140 M140 102 L140 140 M162 100 L164 140" stroke="${C.cow}" stroke-width="13" stroke-linecap="round"/>
    <path d="M42 136 h12 M68 136 h12 M134 136 h12 M158 136 h12" stroke="${C.cowSpot}" stroke-width="8"/>
    <rect x="36" y="44" width="140" height="66" rx="30" fill="${C.cow}"/>
    <path d="M60 46 Q80 60 70 84 Q50 80 46 60Z M120 50 Q144 46 150 70 Q130 82 118 66Z M96 86 Q110 80 120 100 Q100 106 92 98Z" fill="${C.cowSpot}"/>
    <path d="M36 70 Q22 80 26 100" stroke="${C.cow}" stroke-width="5" fill="none"/>
    <path d="M168 50 L184 34 L210 46 L208 82 Q196 92 182 84 Z" fill="${C.cow}"/>
    <ellipse cx="200" cy="80" rx="14" ry="10" fill="#d99a8f"/>
    <circle cx="194" cy="56" r="3.4" fill="${C.ink}"/>
    <path d="M180 36 L172 22 M200 38 L204 22" stroke="#cfc6b0" stroke-width="5" stroke-linecap="round"/>
  `,
  );
}

/* ───────────── PROPS & BUILDINGS ───────────── */

// Gate. open: 0 (closed) .. 1 (wide open) — draws the right leaf skewed.
export function gate(open = 0) {
  const leaf = (x, flip) => {
    const bars = [30, 62, 94, 126]
      .map((y) => `<rect x="${x}" y="${y}" width="150" height="14" rx="3" fill="${C.woodLight}"/>`)
      .join("");
    const diag = flip
      ? `<path d="M${x + 150} 38 L${x} 134" stroke="${C.wood}" stroke-width="12"/>`
      : `<path d="M${x} 38 L${x + 150} 134" stroke="${C.wood}" stroke-width="12"/>`;
    return bars + diag;
  };
  const sx = 1 - open * 0.85;
  return svg(
    "0 0 360 200",
    `
    <ellipse cx="180" cy="190" rx="170" ry="6" fill="#000" opacity=".35"/>
    <rect x="6" y="10" width="22" height="182" rx="4" fill="${C.woodDark}"/>
    <rect x="332" y="10" width="22" height="182" rx="4" fill="${C.woodDark}"/>
    <rect x="0" y="4" width="34" height="12" rx="3" fill="${C.wood}"/>
    <rect x="326" y="4" width="34" height="12" rx="3" fill="${C.wood}"/>
    <g transform="translate(28 0) scale(${sx} 1) translate(-28 0)">${leaf(28, false)}</g>
    <g transform="translate(332 0) scale(${sx} 1) translate(-332 0)">${leaf(182, true)}</g>
    ${open === 0 ? `<rect x="168" y="80" width="26" height="22" rx="4" fill="#8b8f99" stroke="#3c3f4b" stroke-width="3"/><path d="M172 80 v-10 a9 9 0 0 1 18 0 v10" stroke="#8b8f99" stroke-width="4" fill="none"/>` : ""}
  `,
  );
}

export function fence(width = 600) {
  let posts = "";
  for (let x = 10; x < width; x += 70)
    posts += `<rect x="${x}" y="14" width="14" height="92" rx="3" fill="${C.woodDark}"/>`;
  return svg(
    `0 0 ${width} 110`,
    `<rect x="0" y="34" width="${width}" height="10" rx="3" fill="${C.wood}"/>
     <rect x="0" y="70" width="${width}" height="10" rx="3" fill="${C.wood}"/>${posts}`,
  );
}

export function well() {
  let bricks = "";
  for (let r = 0; r < 4; r++)
    for (let c = 0; c < 5; c++)
      bricks += `<rect x="${32 + c * 38 + (r % 2) * 18}" y="${132 + r * 22}" width="34" height="18" rx="3" fill="${r % 2 ? C.stone : C.stoneDark}"/>`;
  return svg(
    "0 0 260 240",
    `
    <ellipse cx="130" cy="232" rx="110" ry="7" fill="#000" opacity=".35"/>
    <path d="M30 30 L130 0 L230 30 L222 44 L38 44Z" fill="${C.roof}"/>
    <path d="M30 30 L130 0 L230 30" stroke="#5a2f30" stroke-width="5" fill="none"/>
    <rect x="44" y="40" width="12" height="96" fill="${C.woodDark}"/>
    <rect x="204" y="40" width="12" height="96" fill="${C.woodDark}"/>
    <rect x="50" y="62" width="160" height="10" rx="5" fill="${C.wood}"/>
    <path d="M210 67 h22 v20" stroke="${C.wood}" stroke-width="6" fill="none" stroke-linecap="round"/>
    <path d="M130 72 V104" stroke="#8a8170" stroke-width="2.5"/>
    <path d="M114 104 h32 l-4 26 h-24z" fill="${C.woodLight}" stroke="${C.woodDark}" stroke-width="3"/>
    <rect x="24" y="124" width="212" height="100" rx="10" fill="${C.stoneDark}"/>
    ${bricks}
    <ellipse cx="130" cy="126" rx="106" ry="14" fill="${C.stone}"/>
    <ellipse cx="130" cy="126" rx="88" ry="9" fill="#05080f"/>
    <ellipse cx="130" cy="127" rx="50" ry="4" fill="#3a6ea0" opacity=".55"/>
  `,
  );
}

// House. boarded: lower windows boarded up. lit: upper window lit.
export function house({ boarded = false, lit = false } = {}) {
  const board = (x, y) =>
    `<g><rect x="${x - 4}" y="${y + 10}" width="68" height="12" rx="2" fill="${C.woodLight}" transform="rotate(-8 ${x + 30} ${y + 16})"/>
      <rect x="${x - 4}" y="${y + 34}" width="68" height="12" rx="2" fill="${C.wood}" transform="rotate(7 ${x + 30} ${y + 40})"/>
      <rect x="${x - 4}" y="${y + 56}" width="68" height="12" rx="2" fill="${C.woodLight}" transform="rotate(-5 ${x + 30} ${y + 62})"/></g>`;
  const win = (x, y, on) =>
    `<rect x="${x}" y="${y}" width="60" height="76" rx="4" fill="${on ? C.windowLit : C.windowDark}" stroke="${C.woodDark}" stroke-width="6"/>
     <path d="M${x + 30} ${y} V${y + 76} M${x} ${y + 38} H${x + 60}" stroke="${C.woodDark}" stroke-width="5"/>`;
  return svg(
    "0 0 420 440",
    `
    <ellipse cx="210" cy="432" rx="200" ry="8" fill="#000" opacity=".4"/>
    <rect x="292" y="40" width="34" height="80" fill="#3b2e33"/>
    <path d="M20 170 L210 40 L400 170Z" fill="${C.roof}"/>
    <path d="M20 170 L210 40 L400 170" stroke="#5a2f30" stroke-width="8" fill="none" stroke-linejoin="round"/>
    <rect x="44" y="166" width="332" height="262" fill="${C.wall}"/>
    ${Array.from({ length: 12 }, (_, i) => `<path d="M44 ${186 + i * 20} H376" stroke="${C.wallLight}" stroke-width="2" opacity=".5"/>`).join("")}
    <circle cx="210" cy="118" r="20" fill="${C.windowDark}" stroke="${C.woodDark}" stroke-width="5"/>
    ${win(88, 190, lit)} ${win(272, 190, false)}
    ${win(88, 312, false)} ${win(272, 312, false)}
    ${boarded ? board(88, 312) + board(272, 312) : ""}
    <rect x="182" y="318" width="56" height="110" rx="3" fill="${C.woodDark}"/>
    <circle cx="226" cy="376" r="4" fill="#b59a5a"/>
    ${boarded ? `<rect x="176" y="340" width="68" height="12" fill="${C.woodLight}" transform="rotate(-6 210 346)"/><rect x="176" y="384" width="68" height="12" fill="${C.wood}" transform="rotate(5 210 390)"/>` : ""}
    <rect x="166" y="424" width="88" height="8" fill="${C.stoneDark}"/>
  `,
  );
}

export function barn() {
  return svg(
    "0 0 340 300",
    `
    <path d="M10 120 L60 50 L170 20 L280 50 L330 120 L330 296 L10 296Z" fill="#4a1e1c"/>
    <path d="M10 120 L60 50 L170 20 L280 50 L330 120" stroke="#2a1110" stroke-width="10" fill="none" stroke-linejoin="round"/>
    <rect x="110" y="150" width="120" height="146" fill="#2a1110"/>
    <path d="M110 150 L230 296 M230 150 L110 296" stroke="#5e2a26" stroke-width="10"/>
    <rect x="140" y="70" width="60" height="44" fill="#2a1110"/>
  `,
  );
}

export function generator({ on = false } = {}) {
  return svg(
    "0 0 200 150",
    `
    <ellipse cx="100" cy="144" rx="90" ry="5" fill="#000" opacity=".35"/>
    <rect x="20" y="40" width="150" height="96" rx="10" fill="#b8892a"/>
    <rect x="34" y="54" width="80" height="60" rx="6" fill="#2a2a30"/>
    ${Array.from({ length: 5 }, (_, i) => `<rect x="42" y="${62 + i * 10}" width="64" height="5" rx="2" fill="#4a4a54"/>`).join("")}
    <circle cx="142" cy="72" r="12" fill="#2a2a30"/><circle cx="142" cy="72" r="5" fill="${on ? "#7cff6b" : "#552"}"/>
    <rect x="128" y="96" width="30" height="16" rx="3" fill="#2a2a30"/>
    <rect x="160" y="24" width="12" height="22" fill="#555"/>
    <path d="M30 40 V26 H150 V40" stroke="#2a2a30" stroke-width="8" fill="none"/>
    ${on ? `<circle cx="168" cy="12" r="8" fill="#888" opacity=".5"/><circle cx="180" cy="2" r="6" fill="#888" opacity=".35"/>` : ""}
  `,
  );
}

export function lantern({ on = true } = {}) {
  return svg(
    "0 0 80 120",
    `
    ${on ? `<circle cx="40" cy="70" r="40" fill="${C.windowLit}" opacity=".18"/>` : ""}
    <path d="M28 20 a12 12 0 0 1 24 0" stroke="#444" stroke-width="4" fill="none"/>
    <rect x="24" y="24" width="32" height="10" rx="3" fill="#333"/>
    <rect x="26" y="34" width="28" height="62" rx="6" fill="${on ? C.windowLit : "#2a2f3a"}" stroke="#333" stroke-width="4"/>
    ${on ? `<path d="M40 52 q8 12 0 26 q-8 -14 0 -26z" fill="#fff4cf"/>` : ""}
    <rect x="22" y="96" width="36" height="10" rx="3" fill="#333"/>
  `,
  );
}

// Food supplies; portions=true splits them into small labeled piles.
export function food({ portions = false } = {}) {
  const jar = (x, y, c) =>
    `<rect x="${x}" y="${y}" width="30" height="40" rx="6" fill="${c}" stroke="#d8d2c2" stroke-width="2" opacity=".95"/><rect x="${x + 2}" y="${y - 8}" width="26" height="10" rx="2" fill="#a8a29a"/>`;
  const can = (x, y) =>
    `<rect x="${x}" y="${y}" width="26" height="34" rx="3" fill="#9aa0a8"/><rect x="${x}" y="${y + 10}" width="26" height="14" fill="#b23a2e"/>`;
  const sack = (x, y) =>
    `<path d="M${x} ${y + 60} Q${x - 6} ${y + 20} ${x + 14} ${y + 6} L${x + 40} ${y + 6} Q${x + 60} ${y + 20} ${x + 54} ${y + 60}Z" fill="#c8b189"/><path d="M${x + 14} ${y + 6} q13 -10 26 0" stroke="#8a7550" stroke-width="4" fill="none"/>`;
  if (!portions)
    return svg(
      "0 0 300 160",
      `
      <ellipse cx="150" cy="152" rx="140" ry="6" fill="#000" opacity=".35"/>
      ${sack(10, 86)} ${sack(64, 80)}
      <rect x="130" y="96" width="90" height="54" rx="4" fill="${C.woodLight}" stroke="${C.woodDark}" stroke-width="4"/>
      <path d="M130 114 H220 M130 132 H220" stroke="${C.woodDark}" stroke-width="3"/>
      ${jar(140, 52, "#b8452e")} ${jar(176, 52, "#d9a23a")} ${can(232, 116)} ${can(262, 116)} ${can(246, 82)}
    `,
    );
  let piles = "";
  for (let i = 0; i < 4; i++) {
    const x = 10 + i * 74;
    piles += `<rect x="${x}" y="132" width="64" height="10" rx="3" fill="${C.woodDark}"/>
      ${can(x + 6, 98)} ${jar(x + 30, 92, i % 2 ? "#d9a23a" : "#b8452e")}
      <text x="${x + 32}" y="76" text-anchor="middle" font-family="Inter Display, Inter, sans-serif" font-weight="900" font-size="22" fill="${C.accent}">${i + 1}</text>`;
  }
  return svg(
    "0 0 310 160",
    `<ellipse cx="155" cy="152" rx="150" ry="6" fill="#000" opacity=".35"/>${piles}`,
  );
}

/* ───────────── BACKGROUNDS ───────────── */

function skylineCity(y, w) {
  let s = "";
  let x = 0;
  let k = 7;
  while (x < w) {
    k = (k * 37 + 11) % 97;
    const bw = 18 + (k % 30);
    const bh = 30 + ((k * 3) % 70);
    s += `<rect x="${x}" y="${y - bh}" width="${bw}" height="${bh}" fill="#2b151a"/>`;
    x += bw + 2;
  }
  return s;
}

// Full 1080×1920 establishing night shot: farm foreground, burning city on horizon.
export function bgFarmNight({ horizonHorde = true, cityGlow = 1 } = {}) {
  const hy = 1060;
  return svg(
    "0 0 1080 1920",
    `
    <defs>
      <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${C.sky0}"/><stop offset=".55" stop-color="${C.sky1}"/><stop offset="1" stop-color="${C.sky2}"/>
      </linearGradient>
      <radialGradient id="glow" cx=".72" cy="1" r=".6">
        <stop offset="0" stop-color="${C.glow}" stop-opacity="${0.85 * cityGlow}"/>
        <stop offset=".4" stop-color="${C.glowDeep}" stop-opacity="${0.45 * cityGlow}"/>
        <stop offset="1" stop-color="${C.glowDeep}" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="field" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${C.hill1}"/><stop offset="1" stop-color="${C.ground}"/>
      </linearGradient>
    </defs>
    <rect width="1080" height="${hy + 40}" fill="url(#sky)"/>
    <rect y="300" width="1080" height="${hy - 260}" fill="url(#glow)"/>
    ${Array.from({ length: 60 }, (_, i) => {
      const x = (i * 197) % 1080;
      const y = (i * 131) % 620;
      return `<circle cx="${x}" cy="${y + 20}" r="${i % 5 ? 1.4 : 2.4}" fill="#cfd6ff" opacity="${0.25 + (i % 4) * 0.15}"/>`;
    }).join("")}
    <circle cx="230" cy="300" r="70" fill="${C.moon}"/>
    <circle cx="258" cy="282" r="66" fill="${C.sky0}" opacity=".9"/>
    <g opacity=".75" transform="translate(0 ${hy - 40}) scale(1 .6) translate(0 ${-hy + 40})">${skylineCity(hy - 40, 1080)}</g>
    <path d="M640 ${hy - 140} q30 -60 10 -120 q40 50 20 120z" fill="#2a1a1a" opacity=".6"/>
    <path d="M820 ${hy - 110} q40 -70 0 -160 q60 70 30 160z" fill="#2a1a1a" opacity=".5"/>
    <path d="M0 ${hy} Q270 ${hy - 50} 540 ${hy - 10} T1080 ${hy - 20} V1920 H0Z" fill="${C.hill1}"/>
    ${horizonHorde ? `<g transform="translate(430 ${hy - 150}) scale(.95)">${horde(8, 5).replace(/<\/?svg[^>]*>/g, "")}</g>` : ""}
    <path d="M0 ${hy + 120} Q360 ${hy + 60} 720 ${hy + 110} T1080 ${hy + 90} V1920 H0Z" fill="url(#field)"/>
    <path d="M540 ${hy + 10} Q600 ${hy + 300} 470 1920 L760 1920 Q640 ${hy + 300} 560 ${hy + 10}Z" fill="#1a1f2c"/>
  `,
  );
}
