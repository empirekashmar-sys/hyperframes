// Builds index.html for "Глеб — часть 1" v2: rigged characters (walk cycles, lip-sync, blinks,
// gestures), livelier dialogue, more shots. Run: node build2.mjs
import fs from "node:fs";
import * as A from "./art/art.js";
import * as R from "./art/rig.js";

const read = (f) => JSON.parse(fs.readFileSync(new URL(f, import.meta.url)));
const words = read("./assets/words2.json");
const lines = read("./assets/timings2.json").lines;
const lips = read("./assets/lips2.json");
const r = (x) => Math.round(x * 1000) / 1000;
const norm = (s) => s.toLowerCase().replace(/[.,:;!?…—«»"]/g, "");
function W(text, n = 1, after = 0) {
  let k = 0;
  for (const w of words)
    if (w.start >= after && norm(w.text) === norm(text) && ++k === n) return w.start;
  throw new Error(`word not found: ${text} #${n}`);
}
const L = Object.fromEntries(lines.map((l) => [l.id, l]));

/* ───────────── timeline ───────────── */
const CUT = r(L.l24.end + 1.8);
const TITLE = [CUT, r(CUT + 3.4)];
const CARD_START = r(TITLE[1] + 0.1);
const CARD_DUR = 3.6;
const TOTAL = r(CARD_START + CARD_DUR);
const S = {
  ext: [0, r(L.l02.end + 0.15)],
  hall: [r(L.l02.end + 0.15), r(L.l08.start - 0.1)],
  kit: [r(L.l08.start - 0.1), r(L.l12.start - 0.1)],
  dinner: [r(L.l12.start - 0.1), r(L.l13.start - 0.3)],
  night: [r(L.l13.start - 0.3), r(L.l14.start - 0.9)],
  bed: [r(L.l14.start - 0.9), r(L.l17.end + 0.06)],
  screen: [r(L.l17.end + 0.06), r(L.l18.start - 0.05)],
  bed2: [r(L.l18.start - 0.05), r(L.l19.start - 0.25)],
  kids: [r(L.l19.start - 0.25), r(L.l23.start - 0.1)],
  stairs: [r(L.l23.start - 0.1), CUT],
};
const BASE = [r(W("подвал") - 0.05), r(W("пятый", 1, 58) - 0.1)];

/* ───────────── helpers ───────────── */
const strip = (s) => s.replace(/^<svg[^>]*>/, "").replace(/<\/svg>$/, "");
const vb = (s) =>
  s
    .match(/viewBox="([^"]+)"/)[1]
    .split(" ")
    .map(Number);
function P(id, art, x, footY, w, attrs = "") {
  const [mx, my, vw, vh] = vb(art);
  const k = w / vw;
  return `<g id="${id}" ${attrs}><g transform="translate(${r(x - mx * k)} ${r(footY - (my + vh) * k)}) scale(${r(k)})">${strip(art)}</g></g>`;
}
const RIG_W = 212; // one scale for every rig so heights stay true
// rig placement: x = centre of the figure
const C = (id, rig, cx, footY, attrs = "") =>
  P(id, rig.svg, cx - RIG_W / 2, footY + (420 - 404) * (RIG_W / 200), RIG_W, attrs);

const tweens = [];
const T = (s) => tweens.push(s);
const scenes = [];
function scene(key, world, { bg = "#05070c", overlay = "", z = 1, range = S[key] } = {}) {
  const [a, b] = range;
  scenes.push(`
  <div id="sc-${key}" class="clip scene" data-start="${a}" data-duration="${r(b - a)}" data-track-index="1" style="z-index:${z};background:${bg}">
    <svg viewBox="0 0 1080 1920" width="1080" height="1920"><rect x="-500" y="-500" width="2080" height="2920" fill="${bg}"/><g id="sh-${key}"><g id="zm-${key}">${world}</g></g>${overlay}</svg>
  </div>`);
}
const camSet = (key, px, py, s, at, sy = 880) =>
  T(
    `tl.set("#zm-${key}", {svgOrigin:"0 0", scale:${s}, x:${r(540 - s * px)}, y:${r(sy - s * py)}}, ${r(at)});`,
  );
const camTo = (key, px, py, s, at, dur, sy = 880, ease = "sine.inOut") =>
  T(
    `tl.to("#zm-${key}", {svgOrigin:"0 0", scale:${s}, x:${r(540 - s * px)}, y:${r(sy - s * py)}, duration:${r(dur)}, ease:"${ease}"}, ${r(at)});`,
  );
const show = (sel, at) => T(`tl.set("${sel}", {opacity:1}, ${r(at)});`);
const hide = (sel, at) => T(`tl.set("${sel}", {opacity:0}, ${r(at)});`);
const flash = (sel, at, peak = 1, dur = 0.6) =>
  T(
    `tl.fromTo("${sel}", {opacity:${peak}}, {opacity:0, duration:${dur}, ease:"power2.out", immediateRender:false}, ${r(at)});`,
  );
const shake = (sel, at, n = 6, amp = 14) =>
  T(
    `tl.to("${sel}", {keyframes:${JSON.stringify(Array.from({ length: n }, (_, i) => ({ x: (i % 2 ? -1 : 1) * amp * (1 - i / n), y: ((i % 3) - 1) * amp * 0.6 * (1 - i / n), duration: 0.05 })).concat([{ x: 0, y: 0, duration: 0.05 }]))}}, ${r(at)});`,
  );

/* ───────────── rig animation ───────────── */
const PIV = { armL: "50% 4%", armR: "50% 4%", legL: "50% 2%", legR: "50% 2%", head: "50% 92%" };
const part = (id, p) => `#${id} .${p}`;
// rotate a limb to an angle (deg; arms: negative raises the right arm outward)
const pose = (id, p, deg, at, dur = 0.25, ease = "power2.out") =>
  T(
    `tl.to("${part(id, p)}", {rotation:${deg}, transformOrigin:"${PIV[p]}", duration:${dur}, ease:"${ease}"}, ${r(at)});`,
  );
// walk / run cycle between t0 and t1, moving the whole figure by dx,dy (world units)
function walk(id, t0, t1, dx, dy = 0, step = 0.3, swing = 22) {
  const n = Math.max(2, Math.round((t1 - t0) / step));
  const kf = (a) =>
    JSON.stringify(
      Array.from({ length: n }, (_, i) => ({ rotation: i % 2 ? -a : a, duration: step })).concat([
        { rotation: 0, duration: 0.12 },
      ]),
    );
  T(
    `tl.to("${part(id, "legL")}", {keyframes:${kf(swing)}, transformOrigin:"${PIV.legL}"}, ${r(t0)});`,
  );
  T(
    `tl.to("${part(id, "legR")}", {keyframes:${kf(-swing)}, transformOrigin:"${PIV.legR}"}, ${r(t0)});`,
  );
  T(
    `tl.to("${part(id, "armL")}", {keyframes:${kf(-swing * 0.8)}, transformOrigin:"${PIV.armL}"}, ${r(t0)});`,
  );
  T(
    `tl.to("${part(id, "armR")}", {keyframes:${kf(swing * 0.8)}, transformOrigin:"${PIV.armR}"}, ${r(t0)});`,
  );
  T(
    `tl.to("#${id} .body", {keyframes:${JSON.stringify(
      Array.from({ length: n }, () => [
        { y: -5, duration: step / 2 },
        { y: 0, duration: step / 2 },
      ]).flat(),
    )}}, ${r(t0)});`,
  );
  if (dx || dy)
    T(
      `tl.to("#${id}", {x:"+=${dx}", y:"+=${dy}", duration:${r(t1 - t0)}, ease:"none"}, ${r(t0)});`,
    );
}
// lip-sync one line on a character; head nods a little on loud frames
function talk(id, lineId) {
  const e = lips.find((x) => x.id === lineId);
  let prev = -1;
  e.states.forEach((s, i) => {
    if (s === prev) return;
    const at = r(e.start + i / e.fps);
    T(
      `tl.set("${part(id, "m0")}", {opacity:${s === 0 ? 1 : 0}}, ${at}); tl.set("${part(id, "m1")}", {opacity:${s === 1 ? 1 : 0}}, ${at}); tl.set("${part(id, "m2")}", {opacity:${s === 2 ? 1 : 0}}, ${at});`,
    );
    prev = s;
  });
  const end = r(e.start + e.states.length / e.fps);
  T(
    `tl.set("${part(id, "m0")}", {opacity:1}, ${end}); tl.set("${part(id, "m1")}, ${part(id, "m2")}", {opacity:0}, ${end});`,
  );
  T(
    `tl.to("${part(id, "head")}", {keyframes:[{rotation:-3,duration:.35},{rotation:2,duration:.4},{rotation:-1,duration:.35},{rotation:0,duration:.3}], transformOrigin:"${PIV.head}"}, ${r(e.start)});`,
  );
}
// blinks every ~3 s (seeded) inside [t0, t1]
let seed = 11;
const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
function blink(id, t0, t1) {
  for (let t = t0 + 0.6 + rnd() * 1.5; t < t1 - 0.2; t += 2.4 + rnd() * 2) {
    T(
      `tl.set("${part(id, "eyes-open")}", {opacity:0}, ${r(t)}); tl.set("${part(id, "eyes-closed")}", {opacity:1}, ${r(t)});`,
    );
    T(
      `tl.set("${part(id, "eyes-open")}", {opacity:1}, ${r(t + 0.12)}); tl.set("${part(id, "eyes-closed")}", {opacity:0}, ${r(t + 0.12)});`,
    );
  }
}
const closeEyes = (id, at) =>
  T(
    `tl.set("${part(id, "eyes-open")}", {opacity:0}, ${r(at)}); tl.set("${part(id, "eyes-closed")}", {opacity:1}, ${r(at)});`,
  );
const openEyes = (id, at) =>
  T(
    `tl.set("${part(id, "eyes-open")}", {opacity:1}, ${r(at)}); tl.set("${part(id, "eyes-closed")}", {opacity:0}, ${r(at)});`,
  );

/* ───────────── backgrounds ───────────── */
const sky = (id, night) => `
  <defs><linearGradient id="${id}-g" x1="0" y1="0" x2="0" y2="1">${
    night
      ? `<stop offset="0" stop-color="#03050c"/><stop offset=".7" stop-color="#0b1022"/><stop offset="1" stop-color="#151a2e"/>`
      : `<stop offset="0" stop-color="#1b2140"/><stop offset=".55" stop-color="#6a3a52"/><stop offset="1" stop-color="#e0844e"/>`
  }</linearGradient></defs>
  <rect x="-200" y="-200" width="1480" height="1700" fill="url(#${id}-g)"/>
  ${Array.from({ length: 40 }, (_, i) => `<circle cx="${(i * 197) % 1080}" cy="${(i * 113) % 700}" r="${i % 6 ? 1.3 : 2.2}" fill="#dfe6ff" opacity="${night ? 0.55 : 0.18}"/>`).join("")}`;
const neighbor = (x, w, h, lit, sd, col = "#2a2e3a") => {
  let s = sd;
  let out = `<rect x="${x}" y="${1380 - h}" width="${w}" height="${h}" fill="${col}"/>`;
  const rr = () => (s = (s * 9301 + 49297) % 233280) / 233280;
  for (let yy = 1380 - h + 20; yy < 1360; yy += 46)
    for (let xx = x + 14; xx < x + w - 24; xx += 36)
      if (rr() < lit)
        out += `<rect x="${xx}" y="${yy}" width="18" height="24" fill="#f2b45a" opacity=".8"/>`;
  return out;
};
const room = (svgArt) => strip(svgArt);

/* ───────────── S1 exterior ───────────── */
{
  const k = 800 / 560;
  const wx = 140 + (30 + 3 * 66 + 20) * k;
  const wy = 1420 - 900 * k + (60 + 4 * 92 + 25) * k;
  scene(
    "ext",
    `${sky("ext", false)}${neighbor(-60, 300, 900, 0.35, 3)}${neighbor(820, 320, 1000, 0.3, 7)}
     ${P("ext-block", A.panelBlock({ floor5: true, lit: 0.42 }), 140, 1420, 800)}
     <rect x="-200" y="1400" width="1480" height="700" fill="#1d1f26"/><path d="M-200 1400 H1280" stroke="#3a3d48" stroke-width="10"/>
     ${Array.from({ length: 7 }, (_, i) => `<path d="M${-100 + i * 200} 1500 h120" stroke="#e9e3c9" stroke-width="10" opacity=".5"/>`).join("")}
     <rect id="ext-glow" x="${wx - 20 * k - 12}" y="${wy - 25 * k - 12}" width="${40 * k + 24}" height="${50 * k + 24}" rx="8" fill="none" stroke="#ffb02e" stroke-width="8" opacity="0"/>
     ${P("ext-g", R.gleb().svg, 830, 1452, 80)}`,
    { bg: "#1b2140" },
  );
  walk("ext-g", 0, S.ext[1], -520, 0, 0.32, 20);
  camSet("ext", 540, 760, 1.0, 0, 900);
  camTo("ext", 540, 820, 1.08, 0, 4.0, 900, "none");
  camTo("ext", wx, wy, 2.3, W("пятый"), 1.1, 820, "power2.inOut");
  T(
    `tl.fromTo("#ext-glow", {opacity:0}, {opacity:1, duration:.25, immediateRender:false}, ${r(W("этаж") - 0.1)});`,
  );
}

/* ───────────── S2 hallway: Gleb home, sons ───────────── */
scene(
  "hall",
  `<g id="hall-closed">${room(A.hallway({ open: 0 }))}</g><g id="hall-open" opacity="0">${room(A.hallway({ open: 1 }))}</g>
   ${C("h-gleb", R.gleb(), 540, 905)}
   ${C("h-young", R.sonYoung({ brow: "happy" }), 260, 925)}
   ${C("h-old", R.sonOld(), 800, 915)}`,
  { bg: "#3b3330" },
);
{
  const [a] = S.hall;
  camSet("hall", 540, 600, 1.7, a, 880);
  show("#hall-open", a + 0.12);
  hide("#hall-closed", a + 0.12);
  T(
    `tl.fromTo("#h-gleb", {opacity:0, scale:.82, svgOrigin:"540 905"}, {opacity:1, scale:1, duration:.6, ease:"power2.out", immediateRender:false}, ${r(a + 0.2)});`,
  );
  hide("#h-gleb", a);
  walk("h-gleb", a + 0.2, a + 0.8, 0, 0, 0.3, 14);
  // little one runs in shouting, arms up
  T(`tl.set("#h-young", {x:-460}, 0);`);
  walk("h-young", L.l03.start - 0.35, L.l03.start + 0.25, 460, 0, 0.15, 34);
  pose("h-young", "armL", 150, L.l03.start + 0.3, 0.2);
  pose("h-young", "armR", -150, L.l03.start + 0.3, 0.2);
  talk("h-young", "l03");
  pose("h-young", "armL", 10, L.l04.start + 0.3, 0.3);
  pose("h-young", "armR", -10, L.l04.start + 0.3, 0.3);
  // teen strolls in, waves
  T(`tl.set("#h-old", {x:420}, 0);`);
  walk("h-old", L.l04.start - 0.5, L.l04.start + 0.4, -420, 0, 0.3, 18);
  pose("h-old", "armR", -150, L.l04.start + 0.4, 0.25);
  pose("h-old", "armR", -8, L.l04.end, 0.3);
  talk("h-old", "l04");
  camTo("hall", 540, 620, 1.42, L.l03.start - 0.3, 0.9, 900, "power2.inOut");
  // Gleb answers, rubs his neck (tired), looks at the teen
  pose("h-gleb", "armR", -165, L.l05.start + 0.2, 0.35);
  pose("h-gleb", "head", 5, L.l05.start + 0.1, 0.3);
  pose("h-gleb", "armR", 0, L.l05.start + 2.2, 0.35);
  talk("h-gleb", "l05");
  // dinosaur: little one jumps, arms spread wide; camera to the two of them
  camTo("hall", 380, 640, 1.85, L.l06.start - 0.1, 0.6, 900, "power2.out");
  pose("h-young", "armL", 95, L.l06.start + 0.6, 0.18);
  pose("h-young", "armR", -95, L.l06.start + 0.6, 0.18);
  T(
    `tl.to("#h-young .body", {keyframes:[{y:-28,duration:.18},{y:0,duration:.18},{y:-22,duration:.18},{y:0,duration:.18}]}, ${r(W("вот") - 0.1)});`,
  );
  talk("h-young", "l06");
  pose("h-young", "armL", 8, L.l07.start + 0.4, 0.3);
  pose("h-young", "armR", -8, L.l07.start + 0.4, 0.3);
  // Gleb laughs, points at him
  T(
    `tl.to("#h-gleb .body", {keyframes:[{y:-6,duration:.12},{y:0,duration:.12},{y:-6,duration:.12},{y:0,duration:.12}]}, ${r(L.l07.start)});`,
  );
  pose("h-gleb", "armL", 70, L.l07.start + 0.5, 0.25);
  pose("h-gleb", "head", -6, L.l07.start + 0.3, 0.3);
  talk("h-gleb", "l07");
  ["h-gleb", "h-young", "h-old"].forEach((id) => blink(id, a, S.hall[1]));
}

/* ───────────── S3 kitchen: Masha calls, the bread joke ───────────── */
scene(
  "kit",
  `${room(A.kitchen({ steam: true }))}
   ${C("k-masha", R.masha({ prop: "spatula" }), 700, 905)}
   ${C("k-gleb", R.gleb({ outfit: "home" }), 330, 905)}`,
  { bg: "#4a403b" },
);
{
  const [a, b] = S.kit;
  camSet("kit", 700, 600, 1.75, a, 880);
  T(
    `tl.fromTo("#steam .st", {y:0, opacity:.9}, {y:-50, opacity:0, duration:1.6, ease:"none", repeat:3, stagger:.5, immediateRender:false}, ${r(a)});`,
  );
  pose("k-masha", "armR", -70, a, 0.01);
  T(
    `tl.to("${part("k-masha", "armR")}", {keyframes:[{rotation:-55,duration:.25},{rotation:-75,duration:.25},{rotation:-55,duration:.25},{rotation:-75,duration:.25},{rotation:-60,duration:.25}], transformOrigin:"${PIV.armR}"}, ${r(a + 0.05)});`,
  );
  pose("k-masha", "head", -10, L.l08.start + 0.1, 0.3); // calls over her shoulder
  talk("k-masha", "l08");
  // Gleb walks in from the left
  hide("#k-gleb", a);
  T(`tl.set("#k-gleb", {opacity:1, x:-420}, ${r(L.l08.end)});`);
  walk("k-gleb", L.l08.end, L.l09.start + 0.1, 420, 0, 0.3, 18);
  camTo("kit", 520, 620, 1.5, L.l08.end, 0.8, 880, "power2.inOut");
  // "Хлеб купил?" she turns to him
  pose("k-masha", "armR", -10, L.l09.start, 0.3);
  pose("k-masha", "head", 8, L.l09.start, 0.25);
  talk("k-masha", "l09");
  // "Ой…" hand to the head
  pose("k-gleb", "armR", -170, L.l10.start, 0.25);
  talk("k-gleb", "l10");
  camTo("kit", 420, 560, 1.95, L.l10.start - 0.1, 0.4, 860, "power2.out");
  // she laughs
  T(
    `tl.to("#k-masha .body", {keyframes:[{y:-6,duration:.12},{y:0,duration:.12},{y:-6,duration:.12},{y:0,duration:.12},{y:-4,duration:.12},{y:0,duration:.12}]}, ${r(L.l11.start)});`,
  );
  talk("k-masha", "l11");
  camTo("kit", 520, 610, 1.45, L.l11.start, b - L.l11.start, 880, "none");
  pose("k-gleb", "armR", 0, L.l11.end, 0.3);
  ["k-masha", "k-gleb"].forEach((id) => blink(id, a, b));
}

/* ───────────── S4 dinner ───────────── */
const tableOverlay = `<rect x="100" y="740" width="440" height="22" rx="6" fill="#7a5a3e"/><path d="M130 762 V900 M510 762 V900" stroke="#5b4330" stroke-width="16"/><rect x="100" y="728" width="440" height="14" fill="#c9d6e6" opacity=".6"/>${[180, 280, 380, 470].map((x) => `<ellipse cx="${x}" cy="726" rx="34" ry="9" fill="#e9e5dc"/><ellipse cx="${x}" cy="722" rx="18" ry="4" fill="#d9903a"/>`).join("")}`;
scene(
  "dinner",
  `${room(A.kitchen({ steam: false }))}
   ${C("d-gleb", R.gleb({ outfit: "home", brow: "happy" }), 150, 905)}
   ${C("d-old", R.sonOld({ brow: "happy" }), 260, 905)}
   ${C("d-young", R.sonYoung({ brow: "happy" }), 370, 905)}
   ${C("d-masha", R.masha({ brow: "happy" }), 470, 905)}
   ${tableOverlay}
   <rect id="d-dim" x="-500" y="-500" width="2080" height="2920" fill="#0a1024" opacity="0"/>`,
  { bg: "#4a403b" },
);
{
  const [a, b] = S.dinner;
  camSet("dinner", 310, 640, 1.6, a, 880);
  ["d-gleb", "d-old", "d-young", "d-masha"].forEach((id, i) => {
    T(
      `tl.to("#${id} .body", {keyframes:[{y:-8,duration:.14},{y:0,duration:.14},{y:-6,duration:.14},{y:0,duration:.14},{y:-8,duration:.14},{y:0,duration:.14}]}, ${r(a + 0.3 + i * 0.12)});`,
    );
    T(
      `tl.set("${part(id, "m2")}", {opacity:1}, ${r(a + 0.3 + i * 0.12)}); tl.set("${part(id, "m0")}", {opacity:0}, ${r(a + 0.3 + i * 0.12)});`,
    );
    T(
      `tl.set("${part(id, "m2")}", {opacity:0}, ${r(a + 1.4)}); tl.set("${part(id, "m0")}", {opacity:1}, ${r(a + 1.4)});`,
    );
    blink(id, a, b);
  });
  pose("d-gleb", "armR", -60, a + 0.4, 0.3);
  pose("d-gleb", "armR", -10, a + 1.6, 0.3);
  camTo("dinner", 310, 600, 2.0, W("никто"), b - W("никто"), 860, "none");
  T(
    `tl.to("#d-dim", {opacity:1, duration:${r(b - W("никто"))}, ease:"power1.in"}, ${r(W("никто"))});`,
  );
}

/* ───────────── S5 night exterior ───────────── */
scene(
  "night",
  `${sky("nt", true)}${neighbor(-60, 300, 900, 0.04, 3, "#15181f")}${neighbor(820, 320, 1000, 0.03, 7, "#15181f")}
   ${P("nt-block", A.panelBlock({ night: true, lit: 0.06 }), 140, 1420, 800)}
   <rect x="-200" y="1400" width="1480" height="700" fill="#0b0d12"/>
   <rect id="nt-horizon" x="-200" y="900" width="1480" height="520" fill="#ff8a3d" opacity="0"/>`,
  { bg: "#03050c" },
);
camSet("night", 540, 820, 1.15, S.night[0], 900);
camTo("night", 540, 900, 1.28, S.night[0], S.night[1] - S.night[0], 900, "none");
flash("#nt-horizon", r(L.l13.end + 0.3), 0.45, 0.9);

/* ───────────── S6 bedroom: whispers, "это гроза?", the phone ───────────── */
const blanket = `<path d="M60 676 Q460 636 820 686 L820 840 L60 840Z" fill="#3c4a72"/>${Array.from({ length: 7 }, (_, i) => `<circle cx="${120 + i * 100}" cy="${750 + (i % 2) * 40}" r="8" fill="#56649a"/>`).join("")}<rect x="60" y="600" width="40" height="260" rx="8" fill="#3a2a2a"/>`;
scene(
  "bed",
  `${room(A.bedroom())}
   <defs><clipPath id="bed-clip"><rect x="-200" y="-200" width="1400" height="1040"/></clipPath></defs>
   <g clip-path="url(#bed-clip)">
     ${C("b-masha", R.masha({ outfit: "night", brow: "worried" }), 220, 880)}
     ${C("b-gleb", R.gleb({ outfit: "home", brow: "worried" }), 420, 870)}
     <g id="b-phone" opacity="0">${C("b-gleb2", R.gleb({ outfit: "home", brow: "worried", prop: "phone" }), 420, 870)}</g>
   </g>
   ${blanket}
   <rect id="b-glow" x="-500" y="-500" width="2080" height="2920" fill="#ffb347" opacity="0"/>
   <ellipse id="b-pglow" cx="420" cy="560" rx="160" ry="120" fill="#9fd2ff" opacity="0"/>`,
  { bg: "#141826" },
);
{
  const [a, b] = S.bed;
  camSet("bed", 360, 600, 1.6, a, 900);
  T(`tl.set("#b-masha, #b-gleb", {y:120}, ${r(a)});`);
  closeEyes("b-masha", a);
  closeEyes("b-gleb", a);
  // boom: window flash, shake; Masha jolts up
  flash("#bed-flash", r(a + 0.1), 1, 0.8);
  flash("#b-glow", r(a + 0.1), 0.25, 0.5);
  shake("#sh-bed", r(a + 0.1), 8, 16);
  openEyes("b-masha", r(a + 0.3));
  T(`tl.to("#b-masha", {y:0, duration:.4, ease:"power3.out"}, ${r(a + 0.35)});`);
  // she shakes his shoulder while whispering
  pose("b-masha", "armR", -70, L.l14.start, 0.2);
  T(
    `tl.to("${part("b-masha", "armR")}", {keyframes:[{rotation:-60,duration:.12},{rotation:-75,duration:.12},{rotation:-60,duration:.12},{rotation:-75,duration:.12}], transformOrigin:"${PIV.armR}"}, ${r(L.l14.start + 0.2)});`,
  );
  talk("b-masha", "l14");
  openEyes("b-gleb", W("проснись"));
  T(`tl.to("#b-gleb", {y:0, duration:.35, ease:"power3.out"}, ${r(W("проснись") + 0.1)});`);
  pose("b-masha", "armR", -5, L.l14.end, 0.3);
  camTo("bed", 330, 560, 1.95, L.l14.start, 2.5, 880);
  // "Тихо. Не включай свет." — he raises a hand
  pose("b-gleb", "armL", 120, L.l15.start, 0.25);
  talk("b-gleb", "l15");
  flash("#bed-flash", r(L.l15.end - 0.2), 0.7, 0.6);
  shake("#sh-bed", r(L.l15.end - 0.2), 5, 8);
  pose("b-gleb", "armL", 5, L.l15.end + 0.1, 0.3);
  talk("b-masha", "l16");
  pose("b-masha", "head", 8, L.l16.start, 0.2);
  // phone
  hide("#b-gleb", r(L.l16.end + 0.1));
  show("#b-phone", r(L.l16.end + 0.1));
  T(
    `tl.set("${part("b-gleb2", "armR")}", {rotation:-150, transformOrigin:"${PIV.armR}"}, ${r(a)});`,
  );
  T(
    `tl.fromTo("#b-pglow", {opacity:0}, {opacity:.14, duration:.3, immediateRender:false}, ${r(L.l16.end + 0.1)});`,
  );
  camTo("bed", 420, 520, 2.6, L.l16.end, 0.8, 860, "power2.inOut");
  talk("b-gleb2", "l17");
  ["b-masha", "b-gleb", "b-gleb2"].forEach((id) => blink(id, a + 1.2, b));
}

/* ───────────── S7 phone screen ───────────── */
scene(
  "screen",
  `${P("scr-phone", A.phoneScreen(), 175, 1460, 730)}<circle cx="540" cy="960" r="700" fill="#9fd2ff" opacity=".06"/>`,
  { bg: "#020308" },
);
camSet("screen", 540, 960, 1.0, S.screen[0], 960);
T(
  `tl.fromTo("#scr-phone", {scale:1.25, svgOrigin:"540 960", opacity:0}, {scale:1, opacity:1, duration:.3, ease:"power3.out", immediateRender:false}, ${S.screen[0]});`,
);
camTo("screen", 540, 760, 1.3, r(S.screen[0] + 0.3), S.screen[1] - S.screen[0] - 0.3, 900, "none");

/* ───────────── S8 bedroom: "Буди детей" (he is up) ───────────── */
scene(
  "bed2",
  `${room(A.bedroom())}
   ${C("b2-gleb", R.gleb({ outfit: "home", brow: "angry" }), 560, 960)}
   ${C("b2-masha", R.masha({ outfit: "night", brow: "worried" }), 260, 960)}`,
  { bg: "#141826" },
);
{
  const [a, b] = S.bed2;
  camSet("bed2", 470, 600, 1.75, a, 880);
  pose("b2-gleb", "armR", -100, L.l18.start + 0.3, 0.2);
  pose("b2-gleb", "armR", -40, W("собирайте"), 0.2);
  pose("b2-gleb", "armR", -110, W("быстро"), 0.15);
  talk("b2-gleb", "l18");
  camTo("bed2", 540, 560, 2.1, L.l18.start, b - L.l18.start, 860, "power1.in");
  walk("b2-masha", W("быстро") + 0.2, b, -260, 0, 0.22, 24);
  blink("b2-gleb", a, b);
}

/* ───────────── S9 kids' room ───────────── */
scene(
  "kids",
  `${room(A.kidsRoom())}
   ${C("kd-young", R.sonYoung({ outfit: "pajama" }), 300, 940)}
   ${C("kd-old", R.sonOld({ outfit: "pajama", brow: "worried" }), 760, 960)}
   ${C("kd-masha", R.masha({ outfit: "night", brow: "worried" }), 520, 975)}
   <g id="kd-bag" opacity="0">${C("kd-masha2", R.masha({ outfit: "night", brow: "angry", prop: "bag" }), 520, 975)}</g>`,
  { bg: "#1a2030" },
);
{
  const [a, b] = S.kids;
  camSet("kids", 520, 640, 1.5, a, 900);
  // sleepy little one rubs his eyes, yawns
  closeEyes("kd-young", a);
  pose("kd-young", "armR", -165, a + 0.1, 0.3);
  talk("kd-young", "l19");
  T(`tl.set("#kd-masha", {x:420}, 0);`);
  walk("kd-masha", a, a + 0.7, -420, 0, 0.25, 20);
  camTo("kids", 420, 620, 1.85, L.l20.start - 0.2, 0.5, 900, "power2.out");
  pose("kd-masha", "armL", 60, L.l20.start, 0.3); // hand on his shoulder
  pose("kd-masha", "head", -8, L.l20.start, 0.3);
  talk("kd-masha", "l20");
  openEyes("kd-young", L.l20.end);
  pose("kd-young", "armR", -5, L.l20.end, 0.3);
  camTo("kids", 650, 600, 1.85, L.l21.start - 0.15, 0.45, 900, "power2.inOut");
  talk("kd-old", "l21");
  pose("kd-old", "armR", -40, L.l21.start + 0.2, 0.3);
  // "Потом. Всё потом." — she grabs the bag
  hide("#kd-masha", L.l22.start);
  show("#kd-bag", L.l22.start);
  T(`tl.set("#kd-bag", {x:0}, ${r(a)});`);
  pose("kd-masha2", "head", 6, L.l22.start, 0.2);
  talk("kd-masha2", "l22");
  camTo("kids", 540, 600, 1.6, L.l22.start, b - L.l22.start, 900, "none");
  flash("#kid-flash", r(L.l19.end), 0.7, 0.6);
  flash("#kid-flash", r(L.l22.end), 0.9, 0.5);
  shake("#sh-kids", r(L.l22.end), 5, 8);
  ["kd-old", "kd-masha", "kd-masha2"].forEach((id) => blink(id, a, b));
}

/* ───────────── S10 stairwell (+ basement flash) ───────────── */
scene(
  "stairs",
  `<g id="st-5">${room(A.stairwell({ floor: 5 }))}</g><g id="st-4" opacity="0">${room(A.stairwell({ floor: 4 }))}</g><g id="st-3" opacity="0">${room(A.stairwell({ floor: 3 }))}</g>
   ${C("st-g", R.gleb({ brow: "angry" }), 760, 560)}
   <rect id="st-dark" x="-500" y="-500" width="2080" height="2920" fill="#000" opacity="0"/>
   <rect id="st-white" x="-500" y="-500" width="2080" height="2920" fill="#fff" opacity="0"/>`,
  { bg: "#2a3a3a" },
);
scene("base", `${room(A.basement({ lit: true }))}`, { bg: "#24262b", z: 2, range: BASE });
camSet("base", 640, 640, 1.6, BASE[0], 900);
camTo("base", 700, 660, 1.8, BASE[0], BASE[1] - BASE[0], 900, "none");
{
  const [a] = S.stairs;
  camSet("stairs", 560, 620, 1.4, a, 900);
  const floors = [a, W("пятый", 1, 58), W("четвёртый"), W("третий"), L.l24.start];
  floors.slice(0, 4).forEach((t0, i) => {
    const t1 = floors[i + 1];
    if (i >= 2) {
      show(`#st-${6 - i}`, t0);
      hide(`#st-${7 - i}`, t0);
    }
    T(`tl.set("#st-g", {x:0, y:0}, ${r(t0)});`);
    walk("st-g", t0, t1 - 0.02, -430, 330, 0.18, 30);
  });
  // the whistle: he freezes, looks up; light flickers; shake grows; white flash; cut
  T(`tl.set("#st-g", {x:-260, y:200}, ${r(L.l24.start)});`);
  pose("st-g", "head", -12, L.l24.start + 0.4, 0.4);
  pose("st-g", "armL", 40, L.l24.start + 0.4, 0.3);
  pose("st-g", "armR", -40, L.l24.start + 0.4, 0.3);
  T(
    `tl.set("${part("st-g", "m1")}", {opacity:1}, ${r(L.l24.end)}); tl.set("${part("st-g", "m0")}", {opacity:0}, ${r(L.l24.end)});`,
  );
  camTo("stairs", 500, 480, 2.5, L.l24.start, CUT - L.l24.start, 820, "power1.in");
  T(
    `tl.fromTo("#st-dark", {opacity:0}, {keyframes:[{opacity:.5,duration:.06},{opacity:0,duration:.1},{opacity:.6,duration:.05},{opacity:.1,duration:.3},{opacity:.7,duration:.05},{opacity:.2,duration:.2}], immediateRender:false}, ${r(L.l24.start + 0.6)});`,
  );
  shake("#sh-stairs", r(CUT - 1.3), 10, 6);
  shake("#sh-stairs", r(CUT - 0.55), 10, 14);
  T(
    `tl.fromTo("#st-white", {opacity:0}, {opacity:1, duration:.12, ease:"power4.in", immediateRender:false}, ${r(CUT - 0.12)});`,
  );
  blink("st-g", a, L.l24.start);
}

/* ───────────── overlays ───────────── */
const hook = `<div id="hook" class="clip toptitle" data-start="0" data-duration="${r(W("седьмого") - 0.2)}" data-track-index="2" style="z-index:5">
  <div class="tt-s">ЧАСТЬ 1</div><div class="tt-a">ПОСЛЕДНИЙ</div><div class="tt-b">ОБЫЧНЫЙ ВЕЧЕР</div></div>`;
T(`tl.set("#hook .tt-s, #hook .tt-a, #hook .tt-b", {opacity:1}, 0);`);
T(
  `tl.to("#hook .tt-s, #hook .tt-a, #hook .tt-b", {opacity:0, y:-30, duration:.25, stagger:.05}, ${r(W("седьмого") - 0.5)});`,
);
const clock = (id, t0, t1, text, color) => {
  T(
    `tl.fromTo("#${id} .clk", {scale:1.6, opacity:0}, {scale:1, opacity:1, duration:.3, ease:"power4.in", immediateRender:false}, ${r(t0)});`,
  );
  T(`tl.to("#${id} .clk", {opacity:0, duration:.25}, ${r(t1 - 0.25)});`);
  return `<div id="${id}" class="clip clock" data-start="${r(t0)}" data-duration="${r(t1 - t0)}" data-track-index="2" style="z-index:5"><div class="clk" style="color:${color}">${text}</div></div>`;
};
const clocks =
  clock("clk1", W("половине"), r(W("пятый") - 0.1), "18:30", "#ffcf7a") +
  clock("clk2", W("два"), S.night[1], "02:30", "#ff5a4a");

const ROLE = {
  narrator: null,
  gleb: ["ГЛЕБ", "#9fc2ff"],
  masha: ["МАША", "#ffb3c7"],
  son_old: ["СТАРШИЙ", "#8be0a4"],
  son_young: ["МЛАДШИЙ", "#ffd25a"],
};
const HOT = new Set(
  "обычный последний пятый этаж папа динозавра ужин хлеб смеялись последний спокойный два тридцать ночи гроза детей вещи утро подвал четвёртый третий".split(
    " ",
  ),
);
const DANGER = new Set("свист быстро свет случилось".split(" "));
const groups = [];
{
  let cur = [];
  const flush = () => cur.length && (groups.push(cur), (cur = []));
  words.forEach((w, i) => {
    const prev = words[i - 1];
    const chars = cur.reduce((n, x) => n + x.text.length, 0);
    if (
      cur.length &&
      (prev.line !== w.line ||
        cur.length >= 3 ||
        chars + w.text.length > 18 ||
        w.start - prev.end > 0.15 ||
        /[.!?…:]$/.test(prev.text))
    )
      flush();
    cur.push(w);
  });
  flush();
}
const caps = groups
  .map((g, gi) => {
    const start = r(Math.max(0.15, g[0].start - 0.05));
    const next = groups[gi + 1];
    const end = r(
      next ? Math.min(next[0].start - 0.05, g[g.length - 1].end + 0.6) : g[g.length - 1].end + 0.3,
    );
    const role = ROLE[g[0].role];
    const tag = role ? `<div class="who" style="color:${role[1]}">${role[0]}</div>` : "";
    const spans = g
      .map((w) => {
        const n = norm(w.text);
        const col = DANGER.has(n) ? "#ff4a3d" : HOT.has(n) ? "#ffb02e" : role ? role[1] : "#ffffff";
        T(
          `tl.fromTo("#${w.id}", {scale:1.22, color:"rgba(255,255,255,.45)"}, {scale:1, color:"${col}", duration:.16, ease:"power2.out", immediateRender:false}, ${r(w.start)});`,
        );
        return `<span id="${w.id}" class="w">${w.text.replace(/[,:;]$/, "").replace(/\.$/, "")}</span>`;
      })
      .join(" ");
    T(
      `tl.set("#cg${gi}", {opacity:1}, ${start}); tl.set("#cg${gi}", {opacity:0}, ${r(end - 0.01)});`,
    );
    return `<div id="cg${gi}" class="clip capgroup" data-start="${start}" data-duration="${r(end - start)}" data-track-index="3" style="z-index:6;opacity:0">${tag}<div class="line">${spans}</div></div>`;
  })
  .join("\n");

const title = `<div id="tbc" class="clip" data-start="${TITLE[0]}" data-duration="${r(TITLE[1] - TITLE[0])}" data-track-index="4" style="z-index:8">
  <div id="tbc-a">ПРОДОЛЖЕНИЕ СЛЕДУЕТ…</div><div id="tbc-b">ЧАСТЬ 2</div></div>`;
T(
  `tl.fromTo("#tbc-a", {opacity:0, y:30}, {opacity:1, y:0, duration:.6, ease:"power2.out", immediateRender:false}, ${r(TITLE[0] + 0.5)});`,
);
T(
  `tl.fromTo("#tbc-b", {opacity:0, scale:1.4}, {opacity:1, scale:1, duration:.35, ease:"power4.in", immediateRender:false}, ${r(TITLE[0] + 1.3)});`,
);
const card = `<div id="card" class="clip" data-start="${CARD_START}" data-duration="${CARD_DUR}" data-track-index="4" style="z-index:9">
  <div id="card-a">Больше таких анимаций<br/>в Telegram-канале</div><div id="card-b">@Claude306</div></div>`;
T(
  `tl.fromTo("#card-a", {opacity:0, y:40}, {opacity:1, y:0, duration:.45, ease:"power3.out", immediateRender:false}, ${r(CARD_START + 0.1)});`,
);
T(
  `tl.fromTo("#card-b", {opacity:0, scale:.8}, {opacity:1, scale:1, duration:.5, ease:"back.out(1.6)", immediateRender:false}, ${r(CARD_START + 0.35)});`,
);
T(`tl.set("#card-a, #card-b, #tbc-a, #tbc-b", {opacity:0}, 0);`);

/* ───────────── audio ───────────── */
const sfx = [
  ["click", S.hall[0] + 0.05, 0.06, 1.2],
  ["boom1", L.l13.end + 0.3, 3.4, 0.35],
  ["boom1", S.bed[0] + 0.1, 3.4, 1.0],
  ["gunfire", L.l14.end + 0.05, 1.54, 0.45],
  ["boom2", L.l15.end - 0.2, 4.1, 0.75],
  ["whistle_short", L.l16.end + 0.2, 1.39, 0.4],
  ["buzz", L.l16.end, 1.3, 0.8],
  ["boom1", L.l19.end, 3.4, 0.45],
  ["boom2", L.l22.end, 4.1, 0.6],
  ["whistle_big", CUT - 2.95, 2.95, 1.0],
];
const audio = [
  `<audio id="vo" class="clip" src="assets/vo2.wav" data-start="0" data-duration="${r(L.l24.end + 0.1)}" data-track-index="10" data-volume="1"></audio>`,
  `<audio id="room-day" class="clip" src="assets/sfx/room_day.wav" data-start="0" data-duration="${Math.min(26, S.night[0])}" data-track-index="11" data-volume="1"></audio>`,
  `<audio id="room-day2" class="clip" src="assets/sfx/room_day.wav" data-start="26" data-duration="${r(S.night[0] - 26)}" data-track-index="11" data-volume="1"></audio>`,
  `<audio id="room-night" class="clip" src="assets/sfx/room_night.wav" data-start="${S.night[0]}" data-duration="${r(Math.min(31, CUT - S.night[0]))}" data-track-index="11" data-volume="1"></audio>`,
  ...sfx.map(
    ([f, at, d, v], i) =>
      `<audio id="sfx${i}" class="clip" src="assets/sfx/${f}.wav" data-start="${r(at)}" data-duration="${r(Math.min(d, CUT - at))}" data-track-index="${12 + (i % 3)}" data-volume="${v}"></audio>`,
  ),
];

/* ───────────── page ───────────── */
const html = `<!doctype html>
<html lang="ru">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=1080, height=1920" />
<title>Глеб — часть 1</title>
<script src="assets/gsap.min.js"></script>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { width: 1080px; height: 1920px; overflow: hidden; background: #05070c; font-family: "Inter", sans-serif; }
  #root { position: absolute; inset: 0; background: #05070c; overflow: hidden; }
  .scene { position: absolute; inset: 0; overflow: hidden; }
  .scene svg { position: absolute; left: 0; top: 0; }
  .vignette { position: absolute; inset: 0; pointer-events: none; background: radial-gradient(ellipse 80% 62% at 50% 46%, rgba(0,0,0,0) 55%, rgba(0,0,0,.6) 100%); }
  .toptitle { position: absolute; left: 0; right: 0; top: 230px; text-align: center; }
  .tt-s { font-weight: 900; font-size: 44px; letter-spacing: .3em; color: #ffb02e; -webkit-text-stroke: 8px #05070c; paint-order: stroke fill; }
  .tt-a { font-weight: 900; font-size: 112px; line-height: 1; color: #fff; -webkit-text-stroke: 14px #05070c; paint-order: stroke fill; margin-top: 10px; }
  .tt-b { font-weight: 900; font-size: 84px; line-height: 1.05; color: #ffcf7a; -webkit-text-stroke: 12px #05070c; paint-order: stroke fill; }
  .clock { position: absolute; left: 0; right: 0; top: 230px; text-align: center; }
  .clk { display: inline-block; font-weight: 900; font-size: 200px; line-height: 1; -webkit-text-stroke: 14px #05070c; paint-order: stroke fill; text-shadow: 0 10px 0 rgba(0,0,0,.5); }
  .capgroup { position: absolute; left: 50px; right: 50px; top: 1170px; text-align: center; overflow: visible; }
  .capgroup .who { font-weight: 900; font-size: 40px; letter-spacing: .14em; -webkit-text-stroke: 8px #05070c; paint-order: stroke fill; margin-bottom: 4px; }
  .capgroup .line { font-weight: 900; font-size: 86px; line-height: 1.08; text-transform: uppercase; }
  .capgroup .w { display: inline-block; margin: 0 .13em; color: rgba(255,255,255,.45); -webkit-text-stroke: 12px #05070c; paint-order: stroke fill; text-shadow: 0 8px 0 rgba(0,0,0,.55); }
  #tbc { position: absolute; inset: 0; background: #000; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 40px; }
  #tbc-a { font-weight: 900; font-size: 70px; color: #fff; text-align: center; white-space: nowrap; }
  #tbc-b { font-weight: 900; font-size: 190px; color: #ff4a3d; line-height: 1; }
  #card { position: absolute; inset: 0; background: #07090f; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 70px; padding: 0 30px; }
  #card-a { font-weight: 900; font-size: 84px; line-height: 1.12; color: #fff; text-align: center; }
  #card-b { font-weight: 900; font-size: 150px; line-height: 1; color: #ffb02e; letter-spacing: -.02em; white-space: nowrap; }
</style>
</head>
<body>
<div id="root" data-composition-id="main" data-start="0" data-duration="${TOTAL}" data-width="1080" data-height="1920">
${scenes.join("\n")}
<div id="vig" class="clip vignette" data-start="0" data-duration="${CUT}" data-track-index="2" style="z-index:4"></div>
${hook}
${clocks}
${caps}
${title}
${card}
${audio.join("\n")}
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
console.log({ TOTAL, CUT, CARD_START, tweens: tweens.length, captionGroups: groups.length });
console.log(JSON.stringify(S), JSON.stringify(BASE));
