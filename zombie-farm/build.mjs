// Builds index.html for the Zombie Farm vertical video.
// Run: node build.mjs   (art from art/art.js, word timings from assets/words.json)
import fs from "node:fs";
import * as A from "./art/art.js";

const C = A.C;
const words = JSON.parse(fs.readFileSync(new URL("./assets/words.json", import.meta.url)));

/* ───────────── timing ───────────── */
const norm = (s) => s.toLowerCase().replace(/[.,:;!?…—«»"]/g, "");
// Start (s) of the n-th occurrence of a word, searching from `after`.
function W(text, n = 1, after = 0) {
  let k = 0;
  for (const w of words) {
    if (w.start < after) continue;
    if (norm(w.text) === norm(text) && ++k === n) return w.start;
  }
  throw new Error(`word not found: ${text} #${n}`);
}
const r = (x) => Math.round(x * 1000) / 1000;

const VO_END = words[words.length - 1].end; // 69.25
const CUT = r(W("а", 1, 66) - 0.08); // sound dies right before the last phrase
const CARD_START = r(VO_END + 0.3);
const CARD_DUR = 3.6;
const TOTAL = r(CARD_START + CARD_DUR);

// Scene boundaries (each starts a beat before its first word).
const S = {
  hook: [0, W("там", 1, 6)],
  city: [W("там", 1, 6), W("а", 1, 12)],
  assets: [W("а", 1, 12), W("первое") - 0.25],
  t1: [W("первое") - 0.25, W("второе") - 0.2],
  t2: [W("второе") - 0.2, W("третье") - 0.2],
  t3: [W("третье") - 0.2, W("четвёртое") - 0.2],
  t4: [W("четвёртое") - 0.2, W("пятое") - 0.2],
  t5: [W("пятое") - 0.2, W("шестое") - 0.2],
  t6: [W("шестое") - 0.2, W("и", 1, 53.5) - 0.2],
  main: [W("и", 1, 53.5) - 0.2, W("вы", 1, 61) - 0.15],
  months: [W("вы", 1, 61) - 0.15, W("но", 1, 62) - 0.15],
  geese: [W("но", 1, 62) - 0.15, CUT],
  silent: [CUT, CARD_START],
};
for (const k in S) S[k] = [r(S[k][0]), r(S[k][1])];

/* ───────────── svg helpers ───────────── */
const strip = (s) => s.replace(/^<svg[^>]*>/, "").replace(/<\/svg>$/, "");
const vb = (s) =>
  s
    .match(/viewBox="([^"]+)"/)[1]
    .split(" ")
    .map(Number);
// Place an art svg so its bottom-left sits at (x, y) and its width is w. Wrapped in an animatable <g id>.
function P(id, art, x, y, w, attrs = "") {
  const [, , vw, vh] = vb(art);
  const k = w / vw;
  return `<g id="${id}" ${attrs}><g transform="translate(${r(x)} ${r(y - vh * k)}) scale(${r(k)})">${strip(art)}</g></g>`;
}

function stars(n = 70, maxY = 700, seed = 1) {
  let s = seed,
    out = "";
  const rnd = () => (s = (s * 9301 + 49297) % 233280) / 233280;
  for (let i = 0; i < n; i++)
    out += `<circle cx="${r(rnd() * 1080)}" cy="${r(rnd() * maxY)}" r="${rnd() < 0.15 ? 2.4 : 1.3}" fill="#cfd6ff" opacity="${r(0.2 + rnd() * 0.5)}"/>`;
  return out;
}

function skyline(y, h = 1, seed = 7, fill = "#2b151a", lit = false) {
  let s = "",
    x = -10,
    k = seed;
  while (x < 1090) {
    k = (k * 37 + 11) % 97;
    const bw = 30 + (k % 50);
    const bh = (60 + ((k * 7) % 160)) * h;
    s += `<rect x="${x}" y="${r(y - bh)}" width="${bw}" height="${r(bh)}" fill="${fill}"/>`;
    if (lit)
      for (let wy = y - bh + 14; wy < y - 14; wy += 22)
        for (let wx = x + 8; wx < x + bw - 10; wx += 16)
          if ((wx * 7 + wy * 3 + k) % 5 === 0)
            s += `<rect x="${wx}" y="${r(wy)}" width="7" height="10" fill="${(wx + wy) % 3 ? "#ff8a3d" : "#ffd27a"}" opacity=".8"/>`;
    x += bw + 3;
  }
  return s;
}

// Night background with horizon at hy. Returns plain svg body (no wrapper).
function sky(id, { hy = 860, glow = 1, glowX = 0.75, moon = true, seed = 1 } = {}) {
  return `
  <defs>
    <linearGradient id="${id}-sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${C.sky0}"/><stop offset=".6" stop-color="${C.sky1}"/><stop offset="1" stop-color="${C.sky2}"/>
    </linearGradient>
    <radialGradient id="${id}-glow" cx="${glowX}" cy="1" r=".75">
      <stop offset="0" stop-color="${C.glow}" stop-opacity="${0.85 * glow}"/>
      <stop offset=".45" stop-color="${C.glowDeep}" stop-opacity="${0.4 * glow}"/>
      <stop offset="1" stop-color="${C.glowDeep}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect x="-600" width="2280" height="${hy + 60}" fill="url(#${id}-sky)"/>
  <rect y="${hy - 520}" width="1080" height="580" fill="url(#${id}-glow)"/><rect x="-600" y="${hy + 20}" width="2280" height="1400" fill="${C.ground}"/>
  ${stars(70, hy - 200, seed)}
  ${moon ? `<circle cx="200" cy="330" r="58" fill="${C.moon}"/><circle cx="224" cy="314" r="54" fill="${C.sky0}" opacity=".92"/>` : ""}
  <g opacity=".8">${skyline(hy + 4, 0.45, 7 + seed)}</g>`;
}
const ground = (hy, extra = "") =>
  `<path d="M0 ${hy} Q270 ${hy - 40} 540 ${hy - 6} T1080 ${hy - 14} V1920 H0Z" fill="${C.hill1}"/>
   <path d="M0 ${hy + 110} Q360 ${hy + 60} 720 ${hy + 100} T1080 ${hy + 84} V1920 H0Z" fill="${C.ground}"/>${extra}`;

function foreground() {
  let out = `<path d="M0 1560 Q300 1500 600 1540 T1080 1520 V1920 H0Z" fill="#080b12"/>`;
  for (let i = 0; i < 46; i++) {
    const x = ((i * 97) % 1100) - 10,
      h = 40 + ((i * 53) % 90),
      y = 1540 + ((i * 31) % 40);
    out += `<path d="M${x} ${y + 10} q6 -${h} 14 -${h + 10} q-2 ${h * 0.6} 6 ${h + 10}z" fill="#05070c"/>`;
  }
  out += `<path d="M0 1700 Q540 1640 1080 1700 V1920 H0Z" fill="#04060a"/>`;
  return out;
}
function pines(y, n = 7, seed = 2, scale = 1) {
  let s = seed,
    out = "";
  const rnd = () => (s = (s * 9301 + 49297) % 233280) / 233280;
  for (let i = 0; i < n; i++) {
    const x = i * (1080 / n) + rnd() * 60 - 20;
    const h = (180 + rnd() * 120) * scale;
    out += `<path d="M${r(x)} ${y} L${r(x + h * 0.28)} ${r(y - h)} L${r(x + h * 0.56)} ${y}Z" fill="#070a10"/>`;
  }
  return out;
}

// Sound rings centred at (x,y): animated outward by class "ring".
const rings = (id, x, y, color = C.accent, n = 3) =>
  `<g id="${id}">${Array.from({ length: n }, () => `<circle class="${id}-r" cx="${x}" cy="${y}" r="40" fill="none" stroke="${color}" stroke-width="6" opacity="0"/>`).join("")}</g>`;

const label = (id, x, y, text, size = 46, color = "#fff", extra = "") =>
  `<text id="${id}" x="${x}" y="${y}" text-anchor="middle" font-family="Inter, sans-serif" font-weight="900" font-size="${size}" fill="${color}" stroke="${C.ink}" stroke-width="${Math.round(size / 7)}" paint-order="stroke" ${extra}>${text}</text>`;

// Gate made of two independently swinging leaves (for closing animation).
function gateParts(prefix, x, y, w) {
  const k = w / 360;
  const leaf = (lx, flip) =>
    [30, 62, 94, 126]
      .map(
        (yy) => `<rect x="${lx}" y="${yy}" width="150" height="14" rx="3" fill="${C.woodLight}"/>`,
      )
      .join("") +
    (flip
      ? `<path d="M${lx + 150} 38 L${lx} 134" stroke="${C.wood}" stroke-width="12"/>`
      : `<path d="M${lx} 38 L${lx + 150} 134" stroke="${C.wood}" stroke-width="12"/>`);
  return `<g transform="translate(${x} ${r(y - 200 * k)}) scale(${r(k)})">
    <ellipse cx="180" cy="190" rx="170" ry="6" fill="#000" opacity=".35"/>
    <rect x="6" y="10" width="22" height="182" rx="4" fill="${C.woodDark}"/>
    <rect x="332" y="10" width="22" height="182" rx="4" fill="${C.woodDark}"/>
    <g id="${prefix}-L">${leaf(28, false)}</g>
    <g id="${prefix}-R">${leaf(182, true)}</g>
    <g id="${prefix}-lock" opacity="0"><rect x="168" y="80" width="26" height="22" rx="4" fill="#8b8f99" stroke="#3c3f4b" stroke-width="3"/><path d="M172 80 v-10 a9 9 0 0 1 18 0 v10" stroke="#8b8f99" stroke-width="4" fill="none"/></g>
  </g>`;
}

// House with separately animatable boards, window lights, sleeper.
function houseParts(prefix, x, y, w) {
  const k = w / 420;
  const win = (id, wx, wy) =>
    `<rect x="${wx}" y="${wy}" width="60" height="76" rx="4" fill="${C.windowDark}" stroke="${C.woodDark}" stroke-width="6"/>
     <rect id="${id}" x="${wx + 3}" y="${wy + 3}" width="54" height="70" fill="${C.windowLit}" opacity="0"/>
     <path d="M${wx + 30} ${wy} V${wy + 76} M${wx} ${wy + 38} H${wx + 60}" stroke="${C.woodDark}" stroke-width="5"/>`;
  const boards = (id, bx, by) =>
    [
      [10, -8, C.woodLight],
      [34, 7, C.wood],
      [56, -5, C.woodLight],
    ]
      .map(
        ([dy, rot, col], i) =>
          `<g class="${prefix}-board" id="${id}-${i}"><rect x="${bx - 4}" y="${by + dy}" width="68" height="12" rx="2" fill="${col}" transform="rotate(${rot} ${bx + 30} ${by + dy + 6})"/></g>`,
      )
      .join("");
  return `<g transform="translate(${x} ${r(y - 440 * k)}) scale(${r(k)})">
    <ellipse cx="210" cy="432" rx="200" ry="8" fill="#000" opacity=".4"/>
    <rect x="292" y="40" width="34" height="80" fill="#3b2e33"/>
    <path d="M20 170 L210 40 L400 170Z" fill="${C.roof}"/>
    <path d="M20 170 L210 40 L400 170" stroke="#5a2f30" stroke-width="8" fill="none" stroke-linejoin="round"/>
    <rect x="44" y="166" width="332" height="262" fill="${C.wall}"/>
    ${Array.from({ length: 12 }, (_, i) => `<path d="M44 ${186 + i * 20} H376" stroke="${C.wallLight}" stroke-width="2" opacity=".5"/>`).join("")}
    <circle cx="210" cy="118" r="20" fill="${C.windowDark}" stroke="${C.woodDark}" stroke-width="5"/>
    ${win(`${prefix}-w1`, 88, 190)} ${win(`${prefix}-w2`, 272, 190)}
    ${win(`${prefix}-w3`, 88, 312)} ${win(`${prefix}-w4`, 272, 312)}
    <rect x="182" y="318" width="56" height="110" rx="3" fill="${C.woodDark}"/>
    <circle cx="226" cy="376" r="4" fill="#b59a5a"/>
    <g id="${prefix}-boards">${boards(`${prefix}-b1`, 88, 312)}${boards(`${prefix}-b2`, 272, 312)}</g>
    <g id="${prefix}-zzz" opacity="0">${label(`${prefix}-z1`, 132, 170, "Z", 40, "#cfd6ff")}${label(`${prefix}-z2`, 160, 140, "z", 30, "#cfd6ff")}${label(`${prefix}-z3`, 182, 116, "z", 24, "#cfd6ff")}</g>
    <rect x="166" y="424" width="88" height="8" fill="${C.stoneDark}"/>
  </g>`;
}

const car = (x, y, col) =>
  `<g transform="translate(${x} ${y})"><rect x="0" y="-34" width="120" height="34" rx="8" fill="${col}"/><path d="M20 -34 L36 -58 H86 L100 -34Z" fill="${col}"/><path d="M40 -36 L50 -52 H82 L92 -36Z" fill="#0a0d16"/><circle cx="26" cy="0" r="12" fill="#111"/><circle cx="94" cy="0" r="12" fill="#111"/><rect class="brake" x="112" y="-28" width="8" height="10" rx="2" fill="#ff2a1f"/></g>`;

function shop(x, y) {
  return `<g transform="translate(${x} ${y})">
    <rect x="0" y="0" width="360" height="260" rx="8" fill="#22263a" stroke="#0a0d16" stroke-width="6"/>
    <rect x="0" y="0" width="360" height="64" fill="#3a1f24"/>
    <text id="shop-sign" x="180" y="46" text-anchor="middle" font-family="Inter, sans-serif" font-weight="900" font-size="38" fill="#ff5a4a">МАГАЗИН</text>
    <rect x="22" y="84" width="316" height="160" fill="#0c0f18"/>
    <path d="M22 134 H338 M22 188 H338" stroke="#4a4f64" stroke-width="6"/>
    <path d="M60 128 l14 -10 v10z M250 182 l18 -12 v12z" fill="#6a6f84"/>
    <path d="M200 92 l-40 70 l30 -20 l-20 60" stroke="#b9c2d8" stroke-width="3" fill="none" opacity=".6"/>
  </g>`;
}

const people = (id, x, y, n, scale, seed, eyes = false) =>
  `<g id="${id}" transform="translate(${x} ${y}) scale(${scale})">${strip(A.horde(n, seed)).replace(/fill="#ff3b2f"/g, eyes ? `fill="${C.eyeRed}"` : `class="${id}-eye" fill="${C.eyeRed}" opacity="0"`)}</g>`;

/* ───────────── scenes ───────────── */
const scenes = [];
const tweens = []; // strings of gsap code
const T = (s) => tweens.push(s);
const SHIFT = 140;
const scene = (key, body, bg = C.sky0, overlay = "", fg = true) => {
  const [a, b] = S[key];
  scenes.push(`
  <div id="sc-${key}" class="clip scene" data-start="${a}" data-duration="${r(b - a)}" data-track-index="1" style="z-index:1;background:${bg}">
    <svg class="cam" id="cam-${key}" viewBox="0 0 1080 1920" width="1080" height="1920"><rect x="-600" y="-600" width="2280" height="3120" fill="${bg}"/><g transform="translate(0 -${SHIFT})"><g id="zm-${key}">${body}</g></g>${fg ? foreground() : ""}${overlay}</svg>
  </div>`);
};
// Slow continuous camera push on every scene so the frame never freezes.
const push = (key, from = 1, to = 1.06, ox = "50%", oy = "50%") => {
  const [a, b] = S[key];
  T(
    `tl.fromTo("#cam-${key}", {scale:${from}, transformOrigin:"${ox} ${oy}"}, {scale:${to}, duration:${r(b - a)}, ease:"none"}, ${a});`,
  );
};
const zoomTo = (key, qx, qy, s, at, dur, sy = 800, ease = "power2.inOut") => {
  const tx = r(-s * (qx - 540)),
    ty = r(sy + SHIFT - 960 - s * (qy - 960));
  T(
    `tl.to("#zm-${key}", {scale:${s}, x:${tx}, y:${ty}, svgOrigin:"540 960", duration:${r(dur)}, ease:"${ease}"}, ${r(at)});`,
  );
};
const ringPulse = (id, at, count = 3, dur = 0.9) => {
  for (let i = 0; i < count; i++)
    T(
      `tl.fromTo("#${id} .${id}-r:nth-child(${(i % 3) + 1})", {attr:{r:30}, opacity:0.9}, {attr:{r:190}, opacity:0, duration:${dur}, ease:"power2.out", immediateRender:false}, ${r(at + i * 0.28)});`,
    );
};
const pop = (sel, at, from = 0.4) =>
  T(
    `tl.fromTo("${sel}", {opacity:0, scale:${from}, transformOrigin:"50% 50%"}, {opacity:1, scale:1, duration:0.32, ease:"back.out(2.2)"}, ${r(at)});`,
  );

/* S0 — hook: the farm, then the burning city */
scene(
  "hook",
  `${sky("h", { hy: 900, glowX: 0.78 })}
   ${ground(900)}
   <g id="h-horde">${P("h-hz", A.horde(8, 5), 520, 900, 520)}</g>
   ${P("h-barn", A.barn(), 20, 1000, 320)}
   ${P("h-house", A.house({ lit: true }), 610, 1010, 420)}
   ${P("h-fence", A.fence(1080), 0, 1080, 1080)}
   ${P("h-dog", A.dog("stand"), 120, 1240, 240)}
   ${P("h-farmer", A.farmer("stand"), 430, 1300, 260)}
   ${P("h-goose", A.goose("walk"), 760, 1250, 190)}`,
);
push("hook", 1.18, 1.0, "50%", "62%");
T(`tl.fromTo("#h-hz", {x:60}, {x:-20, duration:${S.hook[1]}, ease:"none"}, 0);`);
T(`tl.fromTo("#h-goose", {x:0}, {x:-70, duration:3.2, ease:"sine.inOut"}, 0.4);`);
// "В городе сейчас опаснее всего" — swing to the city glow
zoomTo("hook", 760, 830, 1.7, W("в", 1, 3), S.hook[1] - W("в", 1, 3), 700);

/* S1 — the city: millions, jammed roads, empty shops */
scene(
  "city",
  `${sky("c", { hy: 760, glow: 1.4, glowX: 0.5, moon: false, seed: 4 })}
   <g opacity=".95">${skyline(760, 1.9, 13, "#1c0e13", true)}</g>
   <path d="M120 760 q40 -120 0 -260 q70 120 40 260z M820 760 q60 -150 0 -330 q90 150 50 330z" fill="#1a0f12" opacity=".7"/>
   <rect y="756" width="1080" height="1164" fill="#120c12"/>
   ${people("c-p1", -40, 700, 9, 1.0, 11)}
   ${people("c-p2", 40, 790, 9, 1.15, 23)}
   ${people("c-p3", -60, 900, 8, 1.35, 37)}
   <g id="c-road" opacity="0"><rect y="1060" width="1080" height="120" fill="#1d1f2a"/><path d="M0 1120 H1080" stroke="#c9a23a" stroke-width="6" stroke-dasharray="40 30"/>
     ${car(30, 1112, "#4a5068")}${car(190, 1112, "#6a3a3a")}${car(350, 1112, "#3a5a4a")}${car(510, 1112, "#5a5a6a")}${car(670, 1112, "#4a4058")}${car(830, 1112, "#6a5a3a")}
     ${car(-60, 1176, "#3a4a6a")}${car(100, 1176, "#5a3a4a")}${car(260, 1176, "#4a4a4a")}${car(420, 1176, "#6a4a3a")}${car(580, 1176, "#3a5a5a")}${car(740, 1176, "#5a4a6a")}${car(900, 1176, "#4a5a3a")}</g>
   <g id="c-shop" opacity="0">${shop(360, 760)}</g>`,
  "#120c12",
);
push("city", 1.0, 1.08, "50%", "40%");
for (const [id, dx, d] of [
  ["c-p1", 30, 0],
  ["c-p2", -40, 0.1],
  ["c-p3", 50, 0.2],
])
  T(
    `tl.fromTo("#${id}", {opacity:0, x:"-=${dx * 3}"}, {opacity:1, x:"+=${dx * 3}", duration:0.6, ease:"power2.out"}, ${r(W("миллионы", 1) + d)});`,
  );
T(
  `tl.fromTo(".c-p1-eye, .c-p2-eye, .c-p3-eye", {opacity:0}, {opacity:1, duration:0.25, stagger:0.02}, ${W("заражённых", 1)});`,
);
T(
  `tl.fromTo("#c-road", {opacity:0, y:120}, {opacity:1, y:0, duration:0.45, ease:"power3.out"}, ${W("дороги")});`,
);
T(
  `tl.fromTo("#c-road .brake", {opacity:0.3}, {opacity:1, duration:0.2, stagger:{each:0.05, from:"random"}}, ${r(W("встали") - 0.05)});`,
);
pop("#c-shop", W("магазины"), 0.6);
T(
  `tl.fromTo("#shop-sign", {opacity:1}, {opacity:0.15, duration:0.06, repeat:5, yoyo:true}, ${r(W("пусты") + 0.05)});`,
);

/* S2 — what the farm has: water, food, distance */
scene(
  "assets",
  `${sky("a", { hy: 1000, glow: 0.8, glowX: 0.86, moon: true, seed: 6 })}
   ${ground(1000)}
   <g id="a-city">${`<g transform="translate(700 0) scale(.36 .5) translate(0 ${1000 - 1000 * 0.5})">${skyline(1000, 2, 9, "#2e141a", true)}</g>`}</g>
   ${P("a-farm", A.house({ lit: false }), 60, 1150, 230)}
   ${P("a-barn", A.barn(), 260, 1150, 170)}
   <path id="a-line" d="M300 1060 C 520 1000, 640 1030, 860 960" stroke="${C.accent}" stroke-width="8" fill="none" stroke-dasharray="22 16" opacity="0"/>
   <g id="a-km" opacity="0">${label("a-km-t", 600, 990, "100+ КМ", 56, C.accent)}</g>
   <g id="a-i1">${P("a-well", A.well(), 70, 780, 260)}${label("a-l1", 200, 840, "ВОДА", 50)}</g>
   <g id="a-i2">${P("a-food", A.food(), 400, 760, 280)}${label("a-l2", 540, 840, "ЕДА", 50)}</g>
   <g id="a-i3">${label("a-l3", 880, 700, "↔", 130, C.accent)}${label("a-l4", 880, 840, "ДАЛЕКО", 50)}</g>`,
);
push("assets", 1.0, 1.05);
T(
  `tl.fromTo("#a-farm, #a-barn", {opacity:0, y:40}, {opacity:1, y:0, duration:0.5, stagger:0.1, ease:"power3.out"}, ${S.assets[0]});`,
);
pop("#a-i1", W("вода"));
pop("#a-i2", W("еда"));
pop("#a-i3", W("расстояние"));
T(
  `tl.fromTo("#a-line", {opacity:1, strokeDashoffset:900}, {strokeDashoffset:0, duration:0.7, ease:"power2.out"}, ${W("расстояние")});`,
);
T(
  `tl.fromTo("#a-km", {opacity:0, y:20}, {opacity:1, y:0, duration:0.3}, ${r(W("расстояние") + 0.4)});`,
);
T(`tl.set("#a-line", {opacity:0}, ${S.assets[0]});`);

/* S3 — tip 1: close the gate, bring in the livestock */
scene(
  "t1",
  `${sky("t1", { hy: 860, seed: 8 })}
   ${ground(860)}
   <g id="t1-horde" opacity="0">${P("t1-hz", A.horde(6, 9), 560, 860, 460)}</g>
   ${rings("t1-rg", 700, 820, C.danger)}
   ${P("t1-barn", A.barn(), 10, 1000, 340)}
   ${P("t1-house", A.house(), 720, 960, 330)}
   ${P("t1-fence", A.fence(1080), 0, 1090, 1080)}
   <g id="t1-gate">${gateParts("t1g", 330, 1110, 420)}</g>
   ${P("t1-cow", A.cow(), 520, 1210, 300)}
   ${P("t1-farmer", A.farmer("point"), 110, 1300, 230)}`,
);
push("t1");
T(`tl.set("#t1g-L, #t1g-R", {scaleX:0.12}, ${S.t1[0]});`);
T(
  `tl.set("#t1g-L", {transformOrigin:"0% 50%"}, ${S.t1[0]}); tl.set("#t1g-R", {transformOrigin:"100% 50%"}, ${S.t1[0]});`,
);
T(`tl.to("#t1g-L, #t1g-R", {scaleX:1, duration:0.7, ease:"power2.inOut"}, ${W("закройте")});`);
T(`tl.to("#t1g-lock", {opacity:1, duration:0.15}, ${r(W("закройте") + 0.7)});`);
T(
  `tl.fromTo("#t1-cow", {x:0, y:0, scale:1, opacity:1}, {x:-330, y:-150, scale:0.55, duration:1.0, ease:"power1.in", transformOrigin:"50% 100%"}, ${W("загоните")});`,
);
T(`tl.to("#t1-cow", {opacity:0, duration:0.2}, ${r(W("загоните") + 0.95)});`);
T(`tl.fromTo("#t1-horde", {opacity:0}, {opacity:1, duration:0.4}, ${W("заражённые", 1)});`);
T(
  `tl.fromTo("#t1-hz", {x:0}, {x:-160, duration:${r(S.t1[1] - W("заражённые", 1))}, ease:"none"}, ${W("заражённые", 1)});`,
);
ringPulse("t1-rg", W("движение"), 2);
ringPulse("t1-rg", W("шум"), 2);

/* S4 — tip 2: the well */
scene(
  "t2",
  `${sky("t2", { hy: 900, seed: 10, moon: false })}
   ${ground(900)}
   <g id="t2-days">
     ${[0, 1, 2].map((i) => `<g id="t2-d${i}"><rect x="${150 + i * 280}" y="660" width="220" height="125" rx="16" fill="#151a28" stroke="${C.accent}" stroke-width="5"/>${label(`t2-dl${i}`, 260 + i * 280, 712, "ДЕНЬ", 34, "#cfd6ff")}${label(`t2-dn${i}`, 260 + i * 280, 772, String(i + 1), 64, C.accent)}</g>`).join("")}
     <path id="t2-x" d="M150 660 L930 785 M930 660 L150 785" stroke="${C.danger}" stroke-width="16" stroke-linecap="round" opacity="0"/>
   </g>
   ${P("t2-well", A.well(), 320, 1180, 440)}
   <g id="t2-bucket"><path d="M540 940 V1000" stroke="#8a8170" stroke-width="4"/><path d="M500 990 h80 l-10 64 h-60z" fill="${C.woodLight}" stroke="${C.woodDark}" stroke-width="5"/><ellipse id="t2-water" cx="540" cy="994" rx="36" ry="6" fill="#4f8cc9" opacity="0"/></g>
   <g id="t2-drops" opacity="0">${[0, 1, 2, 3].map((i) => `<ellipse cx="${514 + i * 18}" cy="${1070 + (i % 2) * 18}" rx="5" ry="8" fill="#6aa8e8"/>`).join("")}</g>`,
);
push("t2", 1.0, 1.07, "50%", "55%");
T(`tl.fromTo("#t2-bucket", {y:-100}, {y:120, duration:0.6, ease:"power2.in"}, ${W("проверьте")});`);
T(`tl.to("#t2-bucket", {y:-60, duration:0.8, ease:"power2.out"}, ${r(W("проверьте") + 0.75)});`);
T(`tl.to("#t2-water", {opacity:1, duration:0.1}, ${r(W("проверьте") + 0.7)});`);
T(
  `tl.fromTo("#t2-drops", {opacity:1, y:0}, {opacity:0, y:120, duration:0.7, ease:"power1.in"}, ${r(W("проверьте") + 0.9)});`,
);
pop("#t2-d0", W("без"));
pop("#t2-d1", W("протянете"));
pop("#t2-d2", W("трёх"));
T(
  `tl.fromTo("#t2-x", {opacity:1, strokeDasharray:1700, strokeDashoffset:1700}, {strokeDashoffset:0, duration:0.4, ease:"power2.in"}, ${W("дней")});`,
);
T(`tl.set("#t2-x", {opacity:0}, ${S.t2[0]});`);

/* S5 — tip 3: gather food, split into portions */
const portion = (i, x) =>
  `<g id="t3-p${i}" opacity="0"><rect x="${x}" y="1110" width="150" height="16" rx="4" fill="${C.woodDark}"/>
   <rect x="${x + 16}" y="1052" width="44" height="58" rx="4" fill="#9aa0a8"/><rect x="${x + 16}" y="1068" width="44" height="22" fill="#b23a2e"/>
   <rect x="${x + 76}" y="1046" width="50" height="64" rx="8" fill="${i % 2 ? "#d9a23a" : "#b8452e"}" stroke="#d8d2c2" stroke-width="3"/><rect x="${x + 80}" y="1034" width="42" height="14" rx="3" fill="#a8a29a"/>
   ${label(`t3-pn${i}`, x + 75, 1010, `${i + 1}`, 52, C.accent)}</g>`;
scene(
  "t3",
  `${sky("t3", { hy: 860, seed: 12 })}
   ${ground(860)}
   ${P("t3-barn", A.barn(), 640, 960, 380)}
   <g id="t3-pile">${P("t3-food", A.food(), 290, 1150, 500)}</g>
   ${portion(0, 40)}${portion(1, 300)}${portion(2, 560)}${portion(3, 820)}
   ${P("t3-farmer", A.farmer("carry"), 60, 1300, 230)}
   <g id="t3-stamp" opacity="0"><rect x="250" y="660" width="580" height="130" rx="14" fill="none" stroke="${C.danger}" stroke-width="10"/>${label("t3-st", 540, 750, "ЭКОНОМЬТЕ", 72, C.danger)}</g>`,
);
push("t3");
T(
  `tl.fromTo("#t3-farmer", {x:820}, {x:0, duration:1.0, ease:"power2.out"}, ${r(W("третье") - 0.1)});`,
);
T(
  `tl.fromTo("#t3-pile", {opacity:0, scale:0.3, transformOrigin:"50% 100%"}, {opacity:1, scale:1, duration:0.45, ease:"back.out(1.8)"}, ${W("соберите")});`,
);
T(`tl.to("#t3-pile", {opacity:0, scale:0.6, duration:0.25}, ${W("разделите")});`);
T(`tl.to("#t3-farmer", {x:-420, duration:0.6, ease:"power2.in"}, ${r(W("разделите") - 0.3)});`);
for (let i = 0; i < 4; i++)
  T(
    `tl.fromTo("#t3-p${i}", {opacity:0, x:${[400, 140, -120, -380][i]}}, {opacity:1, x:0, duration:0.5, ease:"power3.out"}, ${r(W("разделите") + 0.05 + i * 0.08)});`,
  );
T(
  `tl.fromTo("#t3-stamp", {opacity:0, scale:1.8, rotation:-8, transformOrigin:"50% 50%"}, {opacity:1, scale:1, rotation:-4, duration:0.25, ease:"power4.in"}, ${W("много")});`,
);

/* S6 — tip 4: fortify one house; fence won't hold; board up; sleep upstairs */
scene(
  "t4",
  `${sky("t4", { hy: 820, seed: 14 })}
   ${ground(820)}
   ${P("t4-barn", A.barn(), 10, 960, 250)}
   ${P("t4-well", A.well(), 40, 1110, 200)}
   <g id="t4-house">${houseParts("t4h", 360, 1050, 520)}</g>
   <rect id="t4-hl" x="372" y="500" width="496" height="560" rx="20" fill="none" stroke="${C.accent}" stroke-width="10" opacity="0"/>
   <g id="t4-yard" opacity="0"><rect x="20" y="760" width="1040" height="420" rx="24" fill="none" stroke="${C.danger}" stroke-width="8" stroke-dasharray="30 20"/>${label("t4-yx", 170, 860, "✕", 110, C.danger)}</g>
   <g id="t4-fence">${Array.from({ length: 8 }, (_, i) => `<g class="t4-plank" id="t4-pl${i}">${P(`t4-f${i}`, A.fence(140), i * 136, 1180, 140)}</g>`).join("")}</g>
   <g id="t4-horde">${P("t4-hz", A.horde(9, 17), -700, 1190, 760)}</g>`,
);
push("t4", 1.0, 1.04, "50%", "60%");
T(`tl.fromTo("#t4-yard", {opacity:0}, {opacity:1, duration:0.2}, ${W("весь")});`);
T(`tl.to("#t4-yard", {opacity:0, duration:0.2}, ${W("один", 1, 30)});`);
T(
  `tl.fromTo("#t4-hl", {opacity:0, scale:1.1, transformOrigin:"50% 50%"}, {opacity:1, scale:1, duration:0.3, ease:"back.out(2)"}, ${W("один", 1, 30)});`,
);
T(`tl.to("#t4-hl", {opacity:0, duration:0.3}, ${W("толпу")});`);
T(
  `tl.fromTo("#t4-hz", {x:0}, {x:620, duration:${r(W("удержит") - W("толпу") + 0.4)}, ease:"power1.in"}, ${W("толпу")});`,
);
T(
  `tl.to(".t4-plank", {rotation:(i)=>[-70,60,-80,75,-65,80,-72,68][i], y:60, opacity:0, transformOrigin:"50% 100%", duration:0.5, stagger:0.05, ease:"power2.in"}, ${W("удержит")});`,
);
T(`tl.to("#t4-hz", {opacity:0, duration:0.3}, ${r(W("заколотите") - 0.1)});`);
zoomTo("t4", 620, 880, 1.35, W("заколотите") - 0.2, 0.6, 930, "power3.inOut");
T(
  `tl.fromTo(".t4h-board", {opacity:0, scale:2.2, transformOrigin:"50% 50%"}, {opacity:1, scale:1, duration:0.18, ease:"power4.in", stagger:0.16}, ${W("заколотите")});`,
);
T(`tl.to("#t4h-w1", {opacity:0.85, duration:0.3}, ${W("спите")});`);
T(
  `tl.fromTo("#t4h-zzz", {opacity:0, y:20}, {opacity:1, y:-20, duration:0.9, ease:"sine.out"}, ${r(W("втором") - 0.1)});`,
);

/* S7 — tip 5: no light, no generator at night */
scene(
  "t5",
  `${sky("t5", { hy: 860, seed: 16, glow: 0.6 })}
   ${ground(860)}
   <g id="t5-horde">${P("t5-hz", A.horde(7, 21), 560, 862, 460)}</g>
   ${rings("t5-rg", 470, 640, C.windowLit)}
   <g id="t5-beam" opacity="0"><path d="M470 650 L1080 760 L1080 860 Z" fill="${C.windowLit}" opacity=".12"/></g>
   <g id="t5-house">${houseParts("t5h", 220, 1150, 500)}</g>
   <g id="t5-gen">${P("t5-g", A.generator({ on: true }), 720, 1160, 260)}</g>
   <g id="t5-genoff" opacity="0">${P("t5-g2", A.generator({ on: false }), 720, 1160, 260)}</g>
   <path id="t5-km" d="M560 640 L860 780" stroke="${C.danger}" stroke-width="7" stroke-dasharray="18 14" opacity="0"/>
   <g id="t5-kml" opacity="0">${label("t5-kmt", 800, 900, "КИЛОМЕТРЫ", 52, C.danger)}</g>`,
);
push("t5");
for (const w of ["w1", "w2", "w3", "w4"]) T(`tl.set("#t5h-${w}", {opacity:0.9}, ${S.t5[0]});`);
T(`tl.set("#t5h-boards", {opacity:0}, ${S.t5[0]});`);
T(`tl.set("#t5-beam", {opacity:1}, ${S.t5[0]});`);
ringPulse("t5-rg", r(S.t5[0] + 0.2), 3, 1.1);
T(
  `tl.fromTo("#t5-gen", {x:0}, {x:3, duration:0.05, repeat:${Math.round((W("генератора") - S.t5[0]) / 0.1)}, yoyo:true, ease:"none"}, ${S.t5[0]});`,
);
T(`tl.to("#t5h-w1", {opacity:0, duration:0.08}, ${W("света")});`);
T(`tl.to("#t5h-w2", {opacity:0, duration:0.08}, ${r(W("света") + 0.15)});`);
T(`tl.to("#t5h-w3", {opacity:0, duration:0.08}, ${r(W("света") + 0.3)});`);
T(`tl.to("#t5h-w4", {opacity:0, duration:0.08}, ${r(W("света") + 0.45)});`);
T(`tl.to("#t5-beam", {opacity:0, duration:0.2}, ${r(W("света") + 0.4)});`);
T(
  `tl.set("#t5-gen", {opacity:0}, ${W("генератора")}); tl.set("#t5-genoff", {opacity:1}, ${W("генератора")});`,
);
T(
  `tl.fromTo("#t5-km", {opacity:1, strokeDashoffset:400}, {strokeDashoffset:0, duration:0.5}, ${W("видно")});`,
);
T(`tl.set("#t5-km", {opacity:0}, ${S.t5[0]});`);
T(`tl.fromTo("#t5-kml", {opacity:0, y:20}, {opacity:1, y:0, duration:0.3}, ${W("километры")});`);
ringPulse("t5-rg", W("видно"), 3, 1.1);

/* S8 — tip 6: geese and dogs as alarm */
const goosePair = (id, x, y, w) =>
  `<g id="${id}">${P(`${id}-a`, A.goose("walk"), x, y, w)}<g id="${id}-h" opacity="0">${P(`${id}-b`, A.goose("honk"), x, y, w)}</g></g>`;
scene(
  "t6",
  `${sky("t6", { hy: 900, seed: 18, glow: 0.5 })}
   ${ground(900)}
   ${pines(930, 8, 3, 1.2)}
   <g id="t6-eyes" opacity="0">${[
     [150, 820],
     [330, 850],
     [560, 800],
     [800, 840],
   ]
     .map(
       ([x, y]) =>
         `<circle cx="${x}" cy="${y}" r="6" fill="${C.eyeRed}"/><circle cx="${x + 18}" cy="${y}" r="6" fill="${C.eyeRed}"/>`,
     )
     .join("")}</g>
   <g id="t6-z" opacity="0">${P("t6-zz", A.infected(1), 470, 1000, 150)}</g>
   ${P("t6-fence", A.fence(1080), 0, 1060, 1080)}
   ${rings("t6-rg", 540, 1080, C.accent)}
   ${goosePair("t6-g1", 90, 1250, 200)}${goosePair("t6-g2", 300, 1290, 210)}${goosePair("t6-g3", 520, 1240, 190)}
   <g id="t6-dog">${P("t6-da", A.dog("stand"), 720, 1300, 300)}<g id="t6-dh" opacity="0">${P("t6-db", A.dog("bark"), 720, 1300, 300)}</g></g>`,
);
push("t6");
T(
  `tl.fromTo("#t6-g1, #t6-g2, #t6-g3", {x:-60}, {x:40, duration:${r(W("поднимут") - S.t6[0])}, ease:"none"}, ${S.t6[0]});`,
);
T(`tl.fromTo("#t6-dog", {x:120}, {x:0, duration:1.2, ease:"power2.out"}, ${W("собаки")});`);
T(`tl.set("#t6-g1-h, #t6-g2-h, #t6-g3-h, #t6-dh", {opacity:1}, ${W("поднимут")});`);
T(`tl.set("#t6-g1-a, #t6-g2-a, #t6-g3-a, #t6-da", {opacity:0}, ${W("поднимут")});`);
T(
  `tl.fromTo("#t6-g1, #t6-g2, #t6-g3", {y:0}, {y:-14, duration:0.12, repeat:9, yoyo:true, ease:"sine.inOut", stagger:0.05}, ${W("поднимут")});`,
);
ringPulse("t6-rg", W("шум", 2), 3);
T(`tl.fromTo("#t6-eyes", {opacity:0}, {opacity:1, duration:0.4}, ${W("раньше")});`);
T(
  `tl.fromTo("#t6-z", {opacity:0, y:30}, {opacity:0.85, y:0, duration:0.8, ease:"power2.out"}, ${W("увидите")});`,
);

/* S9 — the main rule: never open the gate; watch from afar; the bitten beg too */
scene(
  "main",
  `${sky("m", { hy: 860, seed: 20 })}
   ${ground(860)}
   <g id="m-str">${P("m-bitten", A.bitten(), 450, 1090, 190)}</g>
   ${P("m-fence", A.fence(1080), 0, 1100, 1080)}
   <g id="m-gate">${gateParts("mg", 300, 1130, 480)}</g>
   ${P("m-farmer", A.farmer("stand"), 60, 1320, 230)}
   <g id="m-no" opacity="0">${label("m-not", 540, 790, "НЕ ОТКРЫВАТЬ", 84, C.danger)}</g>
   <g id="m-eyes" opacity="0"><circle cx="530" cy="868" r="5" fill="${C.eyeRed}"/><circle cx="553" cy="868" r="5" fill="${C.eyeRed}"/></g>
   `,
  C.sky0,
  `<defs><mask id="m-mask"><rect width="1080" height="1920" fill="#fff"/><circle cx="420" cy="760" r="250" fill="#000"/><circle cx="660" cy="760" r="250" fill="#000"/></mask></defs>
   <g id="m-bino" opacity="0"><rect width="1080" height="1920" fill="#020306" mask="url(#m-mask)"/><circle cx="420" cy="760" r="250" fill="none" stroke="#1a1d26" stroke-width="18"/><circle cx="660" cy="760" r="250" fill="none" stroke="#1a1d26" stroke-width="18"/></g>`,
);
T(`tl.set("#mg-lock", {opacity:1}, ${S.main[0]});`);
push("main", 1.0, 1.04);
T(`tl.fromTo("#mg-lock", {y:-14}, {y:0, duration:0.2, ease:"bounce.out"}, ${W("никому")});`);
T(
  `tl.fromTo("#m-no", {opacity:0, scale:1.6, transformOrigin:"50% 50%"}, {opacity:1, scale:1, duration:0.25, ease:"power4.in"}, ${W("открывайте")});`,
);
T(`tl.to("#m-no", {opacity:0, duration:0.2}, ${r(W("сначала") - 0.1)});`);
T(`tl.fromTo("#m-bino", {opacity:0}, {opacity:1, duration:0.3}, ${W("сначала")});`);
zoomTo("main", 540, 880, 1.6, W("сначала"), 0.9, 760);
T(
  `tl.to("#m-str", {y:-10, duration:0.4, yoyo:true, repeat:3, ease:"sine.inOut"}, ${W("укушенный")});`,
);
zoomTo("main", 520, 830, 2.3, W("укушенный"), 1.6, 740, "power1.inOut");
T(
  `tl.fromTo("#m-eyes", {opacity:0}, {opacity:1, duration:0.06, yoyo:true, repeat:3}, ${W("помощи")});`,
);

/* S10 — you'll last for months */
scene(
  "months",
  `${sky("mo", { hy: 900, seed: 22, moon: false })}
   ${ground(900)}
   <g id="mo-moon"><circle cx="0" cy="0" r="54" fill="${C.moon}"/></g>
   ${P("mo-house", A.house({ boarded: true }), 260, 1100, 560)}
   <g id="mo-cal">${[1, 2, 3].map((n) => `<g id="mo-c${n}" opacity="0"><rect x="340" y="450" width="400" height="170" rx="18" fill="#151a28" stroke="${C.accent}" stroke-width="6"/>${label(`mo-ct${n}`, 540, 565, `${n} ${n === 1 ? "МЕСЯЦ" : "МЕСЯЦА"}`, 70, C.accent)}</g>`).join("")}</g>`,
);
push("months");
const moD = S.months[1] - S.months[0];
T(
  `tl.fromTo("#mo-moon", {x:100, y:700}, {x:980, y:700, duration:${r(moD / 3)}, ease:"none", repeat:2}, ${S.months[0]});`,
);
T(
  `tl.fromTo("#mo-moon", {y:700}, {y:330, duration:${r(moD / 6)}, ease:"sine.out", yoyo:true, repeat:5}, ${S.months[0]});`,
);
for (let n = 1; n <= 3; n++) {
  const at = r(W("продержитесь") + (n - 1) * 0.55);
  T(
    `tl.fromTo("#mo-c${n}", {opacity:0, rotationX:-90, transformOrigin:"50% 0%"}, {opacity:1, rotationX:0, duration:0.25}, ${at});`,
  );
  if (n < 3) T(`tl.to("#mo-c${n}", {opacity:0, duration:0.1}, ${r(at + 0.55)});`);
}

/* S11 — one night the geese scream */
scene(
  "geese",
  `${sky("g", { hy: 880, seed: 24, glow: 0.35 })}
   ${ground(880)}
   ${pines(910, 8, 7, 1.1)}
   ${P("g-house", A.house({ boarded: true }), 640, 1000, 400)}
   ${P("g-fence", A.fence(1080), 0, 1080, 1080)}
   ${rings("g-rg", 540, 1120, C.danger)}
   ${goosePair("g-g1", 160, 1260, 230)}${goosePair("g-g2", 420, 1300, 250)}${goosePair("g-g3", 690, 1250, 220)}
   <rect id="g-flash" width="1080" height="1920" fill="${C.danger}" opacity="0"/>`,
  C.sky0,
);
push("geese", 1.0, 1.12, "50%", "62%");
T(
  `tl.set("#g-g1-h, #g-g2-h, #g-g3-h", {opacity:1}, ${W("закричат")}); tl.set("#g-g1-a, #g-g2-a, #g-g3-a", {opacity:0}, ${W("закричат")});`,
);
T(
  `tl.fromTo("#g-g1, #g-g2, #g-g3", {x:0}, {x:8, duration:0.06, repeat:${Math.round((CUT - W("закричат")) / 0.06)}, yoyo:true, ease:"none", stagger:0.02}, ${W("закричат")});`,
);
ringPulse("g-rg", r(W("закричат") - 0.15), 3, 0.7);
T(`tl.fromTo("#g-flash", {opacity:0.35}, {opacity:0, duration:0.4}, ${W("закричат")});`);
zoomTo("geese", 540, 1150, 1.25, W("закричат"), 0.5, 1010, "power3.out");

/* S12 — silence: empty yard, feathers, eyes in the dark */
scene(
  "silent",
  `${sky("s", { hy: 880, seed: 24, glow: 0.2 })}
   ${ground(880)}
   ${pines(910, 8, 7, 1.1)}
   ${P("s-house", A.house({ boarded: true }), 640, 1000, 400)}
   ${P("s-fence", A.fence(1080), 0, 1080, 1080)}
   <g id="s-feath">${Array.from({ length: 9 }, (_, i) => `<ellipse class="s-f" cx="${120 + i * 105}" cy="${700 + (i % 3) * 60}" rx="16" ry="6" fill="${C.goose}" transform="rotate(${i * 40} ${120 + i * 105} ${700 + (i % 3) * 60})"/>`).join("")}</g>
   <rect id="s-dark" width="1080" height="1920" fill="#000" opacity="0"/>
   <g id="s-eyes" opacity="0">${[
     [200, 900],
     [420, 960],
     [640, 880],
     [860, 940],
     [320, 1080],
     [760, 1060],
   ]
     .map(
       ([x, y]) =>
         `<circle cx="${x}" cy="${y}" r="7" fill="${C.eyeRed}"/><circle cx="${x + 22}" cy="${y}" r="7" fill="${C.eyeRed}"/>`,
     )
     .join("")}</g>`,
  C.sky0,
);
push("silent", 1.12, 1.18, "50%", "62%");
T(
  `tl.fromTo(".s-f", {y:-200, rotation:0}, {y:520, rotation:(i)=>i%2?220:-200, duration:${r(S.silent[1] - S.silent[0])}, ease:"none", stagger:0.08}, ${S.silent[0]});`,
);
T(
  `tl.fromTo("#s-dark", {opacity:0}, {opacity:0.85, duration:${r(VO_END - S.silent[0])}, ease:"power1.in"}, ${S.silent[0]});`,
);
T(`tl.fromTo("#s-eyes", {opacity:0}, {opacity:1, duration:0.3}, ${W("замолчат")});`);

/* ───────────── tip number badges ───────────── */
const tips = [
  ["t1", "1", "ВОРОТА"],
  ["t2", "2", "ВОДА"],
  ["t3", "3", "ЕДА"],
  ["t4", "4", "ДОМ"],
  ["t5", "5", "ТЬМА"],
  ["t6", "6", "СТОРОЖА"],
  ["main", "!", "ГЛАВНОЕ"],
];
const badges = tips
  .map(([k, n, t]) => {
    const [a, b] = S[k];
    const red = n === "!";
    T(
      `tl.fromTo("#bd-${k} .num", {scale:2.4, opacity:0, transformOrigin:"50% 60%"}, {scale:1, opacity:1, duration:0.28, ease:"power4.in"}, ${r(a + 0.05)});`,
    );
    T(
      `tl.fromTo("#bd-${k} .tag", {y:30, opacity:0}, {y:0, opacity:1, duration:0.3, ease:"power3.out"}, ${r(a + 0.3)});`,
    );
    T(
      `tl.to("#bd-${k} .num, #bd-${k} .tag", {opacity:0, y:-30, duration:0.18, ease:"power2.in"}, ${r(b - 0.2)});`,
    );
    return `<div id="bd-${k}" class="clip badge" data-start="${a}" data-duration="${r(b - a)}" data-track-index="2" style="z-index:5">
      <div class="num${red ? " red" : ""}">${n}</div><div class="tag">${t}</div></div>`;
  })
  .join("");

// Hook title on frame 0 (thumbnail).
const hookTitle = `<div id="hook-title" class="clip toptitle" data-start="0" data-duration="${r(W("в", 1, 3) + 0.4)}" data-track-index="2" style="z-index:5">
  <div class="tt-a">ЗОМБИ-АПОКАЛИПСИС</div><div class="tt-b">КАК ВЫЖИТЬ НА ФЕРМЕ</div></div>`;
T(
  `tl.to("#hook-title .tt-a, #hook-title .tt-b", {opacity:0, y:-30, duration:0.25, stagger:0.05}, ${r(W("в", 1, 3) + 0.1)});`,
);

/* ───────────── captions ───────────── */
const HOT = new Set(
  "зомби-апокалипсис ферме оставайтесь вода еда расстояние ворота скот колодец воды трёх дней еду порции один дом двор окна втором света генератора километры животные гуси собаки никому издалека месяцы".split(
    " ",
  ),
);
const DANGER = new Set(
  "опаснее миллионы заражённых заражённые движение шум укушенный помощи закричат замолчат".split(
    " ",
  ),
);
const groups = [];
{
  let cur = [];
  const flush = () => cur.length && (groups.push(cur), (cur = []));
  words.forEach((w, i) => {
    const prev = words[i - 1];
    const chars = cur.reduce((n, x) => n + x.text.length, 0);
    if (
      cur.length &&
      (cur.length >= 3 ||
        chars + w.text.length > 19 ||
        (prev && w.start - prev.end > 0.15) ||
        /[.!?…:]$/.test(prev.text))
    )
      flush();
    cur.push(w);
  });
  flush();
}
const caps = groups
  .map((g, gi) => {
    const start = r(Math.max(0.15, g[0].start - 0.06));
    const next = groups[gi + 1];
    const end = r(
      next ? Math.min(next[0].start - 0.06, g[g.length - 1].end + 0.6) : g[g.length - 1].end + 0.25,
    );
    const spans = g
      .map((w) => {
        const n = norm(w.text);
        const cls = DANGER.has(n) ? "w danger" : HOT.has(n) ? "w hot" : "w";
        T(
          `tl.fromTo("#${w.id}", {scale:1.25, color:"rgba(255,255,255,.45)"}, {scale:1, color:"${cls.includes("danger") ? C.danger : cls.includes("hot") ? C.accent : "#ffffff"}", duration:0.16, ease:"power2.out", immediateRender:false}, ${r(w.start)});`,
        );
        return `<span id="${w.id}" class="${cls}">${w.text.replace(/[,:;]$/, "").replace(/\.$/, "")}</span>`;
      })
      .join(" ");
    T(
      `tl.set("#cg${gi}", {opacity:1}, ${start}); tl.set("#cg${gi}", {opacity:0}, ${r(end - 0.01)});`,
    );
    return `<div id="cg${gi}" class="clip capgroup" data-start="${start}" data-duration="${r(end - start)}" data-track-index="3" style="z-index:6;opacity:0">${spans}</div>`;
  })
  .join("\n");

/* ───────────── final card ───────────── */
const card = `<div id="card" class="clip" data-start="${CARD_START}" data-duration="${CARD_DUR}" data-track-index="4" style="z-index:9">
  <div id="card-a">Больше таких анимаций<br/>в Telegram-канале</div>
  <div id="card-b">@Claude306</div>
</div>`;
T(
  `tl.fromTo("#card-a", {opacity:0, y:40}, {opacity:1, y:0, duration:0.45, ease:"power3.out"}, ${r(CARD_START + 0.1)});`,
);
T(
  `tl.fromTo("#card-b", {opacity:0, scale:0.8, transformOrigin:"50% 50%"}, {opacity:1, scale:1, duration:0.5, ease:"back.out(1.6)"}, ${r(CARD_START + 0.35)});`,
);

/* ───────────── audio ───────────── */
const has = (f) => fs.existsSync(new URL(`./assets/${f}`, import.meta.url));
const sfx = has("sfx.json")
  ? JSON.parse(fs.readFileSync(new URL("./assets/sfx.json", import.meta.url), "utf8"))
  : [];
const audio = [
  `<audio id="vo" class="clip" src="assets/vo.wav" data-start="0" data-duration="${r(VO_END + 0.1)}" data-track-index="10" data-volume="1"></audio>`,
  has("bed.wav") &&
    `<audio id="bed" class="clip" src="assets/bed.wav" data-start="0" data-duration="${CUT}" data-track-index="11" data-volume="1"></audio>`,
  ...sfx.map(
    (s, i) =>
      `<audio id="sfx${i}" class="clip" src="assets/${s.file}" data-start="${r(typeof s.at === "number" ? s.at : evalAt(s.at))}" data-duration="${s.dur}" data-track-index="${12 + (i % 3)}" data-volume="${s.vol ?? 1}"></audio>`,
  ),
];
function evalAt(expr) {
  // e.g. "W('закройте')+0.05"
  return Function("W", `return ${expr}`)(W);
}

/* ───────────── page ───────────── */
const html = `<!doctype html>
<html lang="ru">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=1080, height=1920" />
<title>Ферма в зомби-апокалипсис</title>
<script src="assets/gsap.min.js"></script>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { width: 1080px; height: 1920px; overflow: hidden; background: ${C.sky0}; font-family: "Inter", sans-serif; }
  #root { position: absolute; inset: 0; background: ${C.sky0}; overflow: hidden; }
  .scene { position: absolute; inset: 0; overflow: hidden; }
  .scene svg { position: absolute; left: 0; top: 0; }
  .vignette { position: absolute; inset: 0; pointer-events: none; background: radial-gradient(ellipse 75% 60% at 50% 48%, rgba(0,0,0,0) 55%, rgba(0,0,0,.65) 100%); }
  .badge { position: absolute; left: 0; right: 0; top: 190px; display: flex; flex-direction: column; align-items: center; }
  .badge .num { font-weight: 900; font-size: 250px; line-height: .9; color: ${C.accent}; -webkit-text-stroke: 10px ${C.ink}; paint-order: stroke fill; text-shadow: 0 10px 0 rgba(0,0,0,.5); }
  .badge .num.red { color: ${C.danger}; }
  .badge .tag { margin-top: 6px; font-weight: 900; font-size: 52px; letter-spacing: .12em; color: #fff; -webkit-text-stroke: 8px ${C.ink}; paint-order: stroke fill; }
  .toptitle { position: absolute; left: 0; right: 0; top: 220px; text-align: center; }
  .tt-a { font-weight: 900; font-size: 92px; color: ${C.danger}; -webkit-text-stroke: 12px ${C.ink}; paint-order: stroke fill; letter-spacing: .01em; }
  .tt-b { font-weight: 900; font-size: 68px; color: #fff; -webkit-text-stroke: 10px ${C.ink}; paint-order: stroke fill; margin-top: 8px; }
  .capgroup { position: absolute; left: 50px; right: 50px; top: 1180px; text-align: center; font-weight: 900; font-size: 88px; line-height: 1.08; text-transform: uppercase; overflow: visible; }
  .capgroup .w { display: inline-block; margin: 0 .13em; color: rgba(255,255,255,.45); -webkit-text-stroke: 12px ${C.ink}; paint-order: stroke fill; text-shadow: 0 8px 0 rgba(0,0,0,.55); }
  #card { position: absolute; inset: 0; background: #07090f; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 70px; padding: 0 30px; }
  #card-a { font-weight: 900; font-size: 84px; line-height: 1.12; color: #fff; text-align: center; }
  #card-b { font-weight: 900; font-size: 150px; line-height: 1; color: ${C.accent}; letter-spacing: -.02em; white-space: nowrap; }
</style>
</head>
<body>
<div id="root" data-composition-id="main" data-start="0" data-duration="${TOTAL}" data-width="1080" data-height="1920">
${scenes.join("\n")}
<div id="vig" class="clip vignette" data-start="0" data-duration="${CARD_START}" data-track-index="2" style="z-index:4"></div>
${hookTitle}
${badges}
${caps}
${card}
${audio.filter(Boolean).join("\n")}
</div>
<script>
  const tl = gsap.timeline({ paused: true });
  ${tweens.join("\n  ")}
  window.__timelines = window.__timelines || {};
  window.__timelines["main"] = tl;
</script>
</body>
</html>
`;
fs.writeFileSync(new URL("./index.html", import.meta.url), html);
console.log({
  TOTAL,
  CUT,
  CARD_START,
  VO_END,
  scenes: Object.keys(S).length,
  captionGroups: groups.length,
});
console.log(JSON.stringify(S));
