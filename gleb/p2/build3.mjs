// "Глеб — часть 2", extended cut (~1:40): facial expressions, more dialogue and scenes.
// Run from gleb/p2: node build3.mjs → index.html
import fs from "node:fs";
import * as A from "../art/art.js";
import * as R from "../art/rig.js";
import * as B from "./art2.js";

const read = (f) => JSON.parse(fs.readFileSync(new URL(f, import.meta.url)));
const words = read("./assets/words3.json");
const lines = read("./assets/timings3.json").lines;
const lips = read("./assets/lips3.json");
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
const CUT = r(L.l29.end + 0.7);
const TITLE = [CUT, r(CUT + 3.2)];
const CARD_START = r(TITLE[1] + 0.1);
const CARD_DUR = 3.6;
const TOTAL = r(CARD_START + CARD_DUR);
const S = {
  wake: [0, r(L.l04.start - 0.1)],
  down: [r(L.l04.start - 0.1), r(L.l05.start - 0.15)],
  maxim: [r(L.l05.start - 0.15), r(L.l10.start - 0.1)],
  base: [r(L.l10.start - 0.1), r(L.l16.start - 0.1)],
  yard: [r(L.l16.start - 0.1), r(L.l17.start - 0.4)],
  cab: [r(L.l17.start - 0.4), r(L.l22.start - 0.1)],
  road: [r(L.l22.start - 0.1), r(W("но", 1, 70) - 0.1)],
  ruins: [r(W("но", 1, 70) - 0.1), r(L.l25.start - 0.1)],
  call: [r(L.l25.start - 0.1), r(L.l26.start - 0.05)],
  ruins2: [r(L.l26.start - 0.05), r(L.l29.start - 0.1)],
  back: [r(L.l29.start - 0.1), CUT],
};

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
const RIG_W = 212;
const C = (id, rig, cx, footY, attrs = "") =>
  P(id, rig.svg, cx - RIG_W / 2, footY + (420 - 404) * (RIG_W / 200), RIG_W, attrs);
const tweens = [];
const T = (s) => tweens.push(s);
const scenes = [];
function scene(key, world, { bg = "#05070c", overlay = "" } = {}) {
  const [a, b] = S[key];
  scenes.push(`
  <div id="sc-${key}" class="clip scene" data-start="${a}" data-duration="${r(b - a)}" data-track-index="1" style="z-index:1;background:${bg}">
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
const shake = (sel, at, n = 6, amp = 14) =>
  T(
    `tl.to("${sel}", {keyframes:${JSON.stringify(Array.from({ length: n }, (_, i) => ({ x: (i % 2 ? -1 : 1) * amp * (1 - i / n), y: ((i % 3) - 1) * amp * 0.6 * (1 - i / n), duration: 0.05 })).concat([{ x: 0, y: 0, duration: 0.05 }]))}}, ${r(at)});`,
  );
const ORG = (p) => (p === "head" ? 'transformOrigin:"50% 92%"' : 'svgOrigin:"0 0"');
const part = (id, p) => `#${id} .${p}`;
const pose = (id, p, deg, at, dur = 0.25, ease = "power2.out") =>
  T(
    `tl.to("${part(id, p)}", {rotation:${deg}, ${ORG(p)}, duration:${dur}, ease:"${ease}"}, ${r(at)});`,
  );
const GEST = {
  rest: [
    [0, 0],
    [0, 0],
  ],
  headR: [null, [-150, -85]],
  hand: [null, [-30, -120]], // looking at his right hand
  mouth: [
    [-18, -148],
    [18, 148],
  ],
  fist: [null, [-170, -40]],
  pointR: [null, [-95, -10]],
  open: [
    [50, -20],
    [-50, 20],
  ],
  shrug: [
    [60, -70],
    [-60, 70],
  ],
  carry: [
    [-25, -95],
    [25, 95],
  ],
  hug: [[-60, -80], null], // left arm around someone on her right
  pat: [null, [-60, 20]],
  phoneEar: [null, [-140, -110]],
  wheel: [
    [-45, -70],
    [45, 70],
  ], // hands on the steering wheel
  wipe: [null, [-110, -95]], // wiping a tear
};
function gesture(id, name, at, dur = 0.3) {
  const [l, rr] = GEST[name];
  if (l) {
    pose(id, "armL", l[0], at, dur);
    pose(id, "armL-lo", l[1], at, dur);
  }
  if (rr) {
    pose(id, "armR", rr[0], at, dur);
    pose(id, "armR-lo", rr[1], at, dur);
  }
}
/* ── facial expressions ── each sets eyes, brows, idle mouth and extras; talk() respects the idle mouth */
const EXPR = {
  neutral: { eyes: "eyes-open", brow: "neutral", mouth: "m0" },
  pain: { eyes: "eyes-squint", brow: "worried", mouth: "mo-grimace", sweat: 1 },
  shock: { eyes: "eyes-wide", brow: "shock", mouth: "mo-o" },
  scared: { eyes: "eyes-wide", brow: "worried", mouth: "mo-frown", sweat: 1 },
  sad: { eyes: "eyes-open", brow: "sad", mouth: "mo-frown", tear: 1 },
  cry: { eyes: "eyes-squint", brow: "sad", mouth: "mo-frown", tear: 1 },
  angry: { eyes: "eyes-open", brow: "angry", mouth: "mo-frown" },
  determined: { eyes: "eyes-squint", brow: "angry", mouth: "m0" },
  happy: { eyes: "eyes-open", brow: "happy", mouth: "mo-smile" },
  tired: { eyes: "eyes-squint", brow: "worried", mouth: "m0" },
  nervous: { eyes: "eyes-wide", brow: "worried", mouth: "mo-grimace", sweat: 1 },
};
const EYES = ["eyes-open", "eyes-wide", "eyes-squint", "eyes-closed"];
const BROWS = ["neutral", "worried", "angry", "happy", "sad", "shock"];
const MOUTHS = ["m0", "mo-smile", "mo-frown", "mo-grimace", "mo-o"];
const exprLog = {}; // id -> [[t, name]]
function expr(id, name, at) {
  const e = EXPR[name];
  (exprLog[id] = exprLog[id] || []).push([at, name]);
  exprLog[id].sort((x, y) => x[0] - y[0]);
  const t = r(at);
  EYES.forEach((c) => T(`tl.set("${part(id, c)}", {opacity:${c === e.eyes ? 1 : 0}}, ${t});`));
  BROWS.forEach((b) =>
    T(`tl.set("${part(id, "b-" + b)}", {opacity:${b === e.brow ? 1 : 0}}, ${t});`),
  );
  MOUTHS.forEach((m) => T(`tl.set("${part(id, m)}", {opacity:${m === e.mouth ? 1 : 0}}, ${t});`));
  T(
    `tl.set("${part(id, "tear")}", {opacity:${e.tear ? 1 : 0}}, ${t}); tl.set("${part(id, "sweat")}", {opacity:${e.sweat ? 1 : 0}}, ${t});`,
  );
  if (e.tear)
    T(
      `tl.fromTo("${part(id, "tear")}", {y:-4}, {y:10, duration:1.2, ease:"power1.in", immediateRender:false}, ${t});`,
    );
}
const idleMouth = (id, t) => {
  const log = exprLog[id] || [];
  let name = "neutral";
  for (const [tt, n] of log) if (tt <= t + 1e-6) name = n;
  return EXPR[name].mouth;
};
function talk(id, lineId) {
  const e = lips.find((x) => x.id === lineId);
  let prev = -1;
  const setMouth = (s, at) => {
    const idle = idleMouth(id, at);
    const on = s === 0 ? idle : s === 1 ? "m1" : "m2";
    [...MOUTHS, "m1", "m2"].forEach((m) =>
      T(`tl.set("${part(id, m)}", {opacity:${m === on ? 1 : 0}}, ${r(at)});`),
    );
  };
  e.states.forEach((s, i) => {
    if (s === prev) return;
    setMouth(s, e.start + i / e.fps);
    prev = s;
  });
  setMouth(0, e.start + e.states.length / e.fps);
  T(
    `tl.to("${part(id, "head")}", {keyframes:[{rotation:-3,duration:.35},{rotation:2,duration:.4},{rotation:-1,duration:.35},{rotation:0,duration:.3}], transformOrigin:"50% 92%"}, ${r(e.start)});`,
  );
}
function walk(id, t0, t1, dx, dy = 0, step = 0.3, swing = 22, arms = true) {
  const n = Math.max(2, Math.round((t1 - t0) / step));
  const kf = (a) =>
    JSON.stringify(
      Array.from({ length: n }, (_, i) => ({ rotation: i % 2 ? -a : a, duration: step })).concat([
        { rotation: 0, duration: 0.12 },
      ]),
    );
  const knee = (ph) =>
    JSON.stringify(
      Array.from({ length: n }, (_, i) => ({
        rotation: (i + ph) % 2 ? swing * 1.3 : 0,
        duration: step,
      })).concat([{ rotation: 0, duration: 0.12 }]),
    );
  T(`tl.to("${part(id, "legL")}", {keyframes:${kf(swing)}, svgOrigin:"0 0"}, ${r(t0)});`);
  T(`tl.to("${part(id, "legR")}", {keyframes:${kf(-swing)}, svgOrigin:"0 0"}, ${r(t0)});`);
  T(`tl.to("${part(id, "legL-lo")}", {keyframes:${knee(1)}, svgOrigin:"0 0"}, ${r(t0)});`);
  T(`tl.to("${part(id, "legR-lo")}", {keyframes:${knee(0)}, svgOrigin:"0 0"}, ${r(t0)});`);
  if (arms) {
    const elbow = (sg) =>
      JSON.stringify(
        Array.from({ length: n }, (_, k) => ({
          rotation: sg * (k % 2 ? swing * 0.9 : swing * 0.3),
          duration: step,
        })).concat([{ rotation: 0, duration: 0.12 }]),
      );
    T(`tl.to("${part(id, "armL")}", {keyframes:${kf(-swing * 0.8)}, svgOrigin:"0 0"}, ${r(t0)});`);
    T(`tl.to("${part(id, "armR")}", {keyframes:${kf(swing * 0.8)}, svgOrigin:"0 0"}, ${r(t0)});`);
    T(`tl.to("${part(id, "armL-lo")}", {keyframes:${elbow(1)}, svgOrigin:"0 0"}, ${r(t0)});`);
    T(`tl.to("${part(id, "armR-lo")}", {keyframes:${elbow(-1)}, svgOrigin:"0 0"}, ${r(t0)});`);
  }
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
let seed = 41;
const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
function blink(id, t0, t1) {
  for (let t = t0 + 0.6 + rnd() * 1.5; t < t1 - 0.2; t += 2.4 + rnd() * 2) {
    // a blink only replaces open eyes, so squints and wide eyes keep reading
    T(
      `tl.set("${part(id, "eyes-closed")}", {opacity:1}, ${r(t)}); tl.set("${part(id, "eyes-closed")}", {opacity:0}, ${r(t + 0.12)});`,
    );
    T(
      `tl.set("${part(id, "eyes-open")}", {visibility:"hidden"}, ${r(t)}); tl.set("${part(id, "eyes-open")}", {visibility:"visible"}, ${r(t + 0.12)});`,
    );
  }
}
const sob = (id, at, n = 4) =>
  T(
    `tl.to("#${id} .body", {keyframes:${JSON.stringify(
      Array.from({ length: n }, () => [
        { y: -4, duration: 0.12 },
        { y: 0, duration: 0.16 },
      ]).flat(),
    )}}, ${r(at)});`,
  );
const room = (s) => strip(s);
const GLEB = (o = {}) => R.gleb({ injured: true, ...o });

/* ───────────── S1 wake: pain, blood on the hand ───────────── */
scene(
  "wake",
  `${room(A.stairwell({ floor: 3 }))}
   ${C("w-g", GLEB(), 470, 900)}
   <rect id="w-white" x="-500" y="-500" width="2080" height="2920" fill="#fff" opacity="1"/>
   <rect id="w-dark" x="-500" y="-500" width="2080" height="2920" fill="#000" opacity="0"/>`,
  { bg: "#2a3a3a" },
);
{
  const [a, b] = S.wake;
  camSet("wake", 380, 760, 1.9, a, 900);
  T(`tl.set("#w-g", {rotation:-84, svgOrigin:"470 900", y:30}, ${a});`);
  expr("w-g", "neutral", a);
  T(
    `tl.set("${part("w-g", "eyes-open")}", {opacity:0}, ${a}); tl.set("${part("w-g", "eyes-closed")}", {opacity:1}, ${a});`,
  );
  T(`tl.to("#w-white", {opacity:0, duration:1.0, ease:"power2.out"}, ${r(a + 0.05)});`);
  T(
    `tl.fromTo("#w-dark", {opacity:.75}, {keyframes:[{opacity:.2,duration:.5},{opacity:.6,duration:.3},{opacity:.1,duration:.6}], immediateRender:false}, ${r(a + 0.9)});`,
  );
  T(
    `tl.fromTo("#zm-wake", {rotation:-8, svgOrigin:"540 900"}, {rotation:0, duration:${r(L.l02.start - a)}, ease:"sine.inOut", immediateRender:false}, ${a});`,
  );
  T(`tl.set("${part("w-g", "eyes-closed")}", {opacity:0}, ${r(L.l02.start - 0.25)});`);
  expr("w-g", "pain", L.l02.start - 0.25);
  T(
    `tl.to("#w-g", {rotation:0, y:0, duration:.45, ease:"back.out(1.6)"}, ${r(L.l02.start - 0.2)});`,
  );
  gesture("w-g", "headR", L.l02.start, 0.3);
  talk("w-g", "l02");
  camTo("wake", 470, 640, 1.7, L.l02.start - 0.2, 0.6, 880, "power2.out");
  // looks at his palm: blood
  gesture("w-g", "hand", L.l03.start - 0.35, 0.3);
  expr("w-g", "shock", L.l03.start - 0.1);
  camTo("wake", 500, 600, 2.4, L.l03.start - 0.3, 0.5, 860, "power2.out");
  talk("w-g", "l03");
  gesture("w-g", "headR", L.l03.end + 0.3, 0.3);
  expr("w-g", "pain", L.l03.end + 0.3);
  camTo("wake", 470, 640, 1.7, L.l03.end + 0.2, b - L.l03.end - 0.2, 880);
}

/* ───────────── S2 down to the first floor ───────────── */
scene(
  "down",
  `<g id="d-2">${room(A.stairwell({ floor: 2 }))}</g><g id="d-1" opacity="0">${room(A.stairwell({ floor: 1 }))}</g>${C("d-g", GLEB(), 760, 560)}`,
  { bg: "#2a3a3a" },
);
{
  const [a, b] = S.down;
  camSet("down", 560, 620, 1.4, a, 900);
  expr("d-g", "pain", a);
  const mid = r((a + b) / 2);
  [
    [a, mid],
    [mid, b],
  ].forEach(([t0, t1], i) => {
    if (i === 1) {
      show("#d-1", t0);
      hide("#d-2", t0);
    }
    T(`tl.set("#d-g", {x:0, y:0}, ${r(t0)});`);
    T(
      `tl.set("${part("d-g", "armR")}", {rotation:-150, svgOrigin:"0 0"}, ${r(t0)}); tl.set("${part("d-g", "armR-lo")}", {rotation:-85, svgOrigin:"0 0"}, ${r(t0)});`,
    );
    walk("d-g", t0, t1 - 0.02, -430, 330, 0.42, 16, false);
  });
  T(
    `tl.to("${part("d-g", "head")}", {keyframes:[{rotation:6,duration:.6},{rotation:-4,duration:.6},{rotation:6,duration:.6},{rotation:-2,duration:.6}], transformOrigin:"50% 92%"}, ${r(a)});`,
  );
  expr("d-g", "tired", r(mid));
}

/* ───────────── S3 Ded Maxim (uncensored) + the rifle argument ───────────── */
scene(
  "maxim",
  `${room(A.stairwell({ floor: 1 }))}
   <rect id="mx-doorlight" x="0" y="560" width="120" height="420" fill="#ffcf7a" opacity="0"/>
   ${C("mx", R.maxim(), 150, 975)}
   ${C("mx-g", GLEB(), 560, 975)}`,
  { bg: "#2a3a3a" },
);
{
  const [a, b] = S.maxim;
  camSet("maxim", 360, 640, 1.5, a, 900);
  expr("mx", "angry", a);
  expr("mx-g", "pain", a);
  T(
    `tl.fromTo("#mx-doorlight", {opacity:.5}, {opacity:0, duration:.6, immediateRender:false}, ${r(a)});`,
  );
  T(`tl.set("#mx", {x:-220}, 0);`);
  walk("mx", a, a + 0.6, 220, 0, 0.2, 26);
  gesture("mx", "fist", L.l05.start + 0.3, 0.2);
  T(
    `tl.to("${part("mx", "armR-lo")}", {keyframes:[{rotation:-10,duration:.18},{rotation:-60,duration:.18},{rotation:-10,duration:.18},{rotation:-60,duration:.18},{rotation:-30,duration:.18}], svgOrigin:"0 0"}, ${r(L.l05.start + 0.55)});`,
  );
  pose("mx", "armL", 40, L.l05.start + 0.3, 0.2);
  pose("mx", "armL-lo", 60, L.l05.start + 0.3, 0.2);
  talk("mx", "l05");
  gesture("mx-g", "headR", a, 0.01);
  camTo("maxim", 230, 600, 1.9, L.l05.start + 0.2, 0.5, 880, "power2.out");
  // Gleb tells him
  gesture("mx", "rest", L.l06.start, 0.3);
  camTo("maxim", 520, 600, 1.9, L.l06.start - 0.1, 0.5, 880, "power2.inOut");
  gesture("mx-g", "rest", L.l06.start + 0.2, 0.35);
  expr("mx-g", "tired", L.l06.start);
  gesture("mx-g", "open", L.l06.start + 0.6, 0.3);
  talk("mx-g", "l06");
  // shock, then rage
  expr("mx", "shock", L.l07.start);
  camTo("maxim", 250, 600, 1.85, L.l07.start - 0.1, 0.5, 880, "power2.inOut");
  T(`tl.to("#mx .body", {keyframes:[{y:-10,duration:.12},{y:0,duration:.2}]}, ${r(L.l07.start)});`);
  gesture("mx", "shrug", L.l07.start + 0.1, 0.25);
  expr("mx", "angry", W("ну", 1, 21) - 0.1);
  gesture("mx", "rest", W("ну", 1, 21) - 0.15, 0.12);
  gesture("mx", "fist", W("ну", 1, 21), 0.2);
  T(
    `tl.to("${part("mx", "armR-lo")}", {keyframes:[{rotation:-10,duration:.14},{rotation:-60,duration:.14},{rotation:-10,duration:.14},{rotation:-60,duration:.14}], svgOrigin:"0 0"}, ${r(W("покажу") - 0.1)});`,
  );
  talk("mx", "l07");
  // "Тебе восемьдесят лет!" — Gleb half-laughs; two-shot
  camTo("maxim", 380, 620, 1.55, L.l08.start - 0.1, 0.6, 880, "power2.inOut");
  expr("mx-g", "happy", L.l08.start);
  gesture("mx-g", "shrug", L.l08.start + 0.3, 0.3);
  talk("mx-g", "l08");
  // "Я в армии снайпером был!" — he jabs a finger, then marches off
  expr("mx", "angry", L.l09.start);
  gesture("mx", "pointR", L.l09.start + 0.1, 0.2);
  T(
    `tl.to("${part("mx", "armR-lo")}", {keyframes:[{rotation:-30,duration:.15},{rotation:0,duration:.15},{rotation:-30,duration:.15},{rotation:0,duration:.15}], svgOrigin:"0 0"}, ${r(L.l09.start + 0.4)});`,
  );
  talk("mx", "l09");
  expr("mx-g", "tired", L.l09.start + 0.5);
  T(`tl.set("#mx", {scaleX:-1, svgOrigin:"150 975"}, ${r(L.l09.end + 0.1)});`);
  gesture("mx", "rest", L.l09.end, 0.15);
  walk("mx", L.l09.end + 0.1, b, -320, 0, 0.24, 24);
  ["mx", "mx-g"].forEach((id) => blink(id, a, b));
}

/* ───────────── S4 basement: boxes, the family, crying, the teen's first-aid kit ───────────── */
scene(
  "base",
  `${room(A.basement({ lit: true }))}
   <g id="bx">${P("bx-art", B.boxes(), 560, 1000, 300)}</g>
   ${C("bs-g", GLEB(), 420, 1000)}
   ${C("bs-m", R.masha({ prop: "bag" }), 760, 1000)}
   ${C("bs-y", R.sonYoung(), 660, 1000)}
   ${C("bs-o", R.sonOld(), 900, 1000)}
   <g id="kit" opacity="0"><rect x="860" y="760" width="70" height="52" rx="8" fill="#e9ecf2" stroke="#0b0d14" stroke-width="3"/><path d="M895 772 v28 M881 786 h28" stroke="#e23b2e" stroke-width="8"/></g>`,
  { bg: "#24262b" },
);
{
  const [a, b] = S.base;
  camSet("base", 520, 660, 1.55, a, 900);
  expr("bs-g", "determined", a);
  T(`tl.set("#bx-art rect, #bx-art text, #bx-art path", {opacity:0}, ${a});`);
  T(
    `tl.fromTo("#bx-art rect, #bx-art text, #bx-art path", {opacity:0}, {opacity:1, duration:.25, stagger:.03, immediateRender:false}, ${r(W("коробки") - 0.6)});`,
  );
  walk("bs-g", a + 0.2, a + 1.4, 60, 0, 0.3, 16);
  gesture("bs-g", "carry", W("сложил"), 0.3);
  hide("#bs-m, #bs-o, #bs-y", a);
  ["bs-m", "bs-y", "bs-o"].forEach((id) => expr(id, "scared", a));
  T(`tl.set("#bs-m, #bs-o, #bs-y", {opacity:1, x:420}, ${r(L.l11.start - 0.5)});`);
  walk("bs-m", L.l11.start - 0.5, L.l11.start + 0.5, -420, 0, 0.25, 20);
  walk("bs-y", L.l11.start - 0.35, L.l11.start + 0.55, -420, 0, 0.18, 28);
  walk("bs-o", L.l11.start - 0.4, L.l11.start + 0.6, -420, 0, 0.25, 20);
  gesture("bs-g", "rest", L.l11.start, 0.3);
  expr("bs-g", "tired", L.l11.start);
  talk("bs-m", "l11");
  camTo("base", 560, 640, 1.4, L.l11.start - 0.4, 0.8, 900, "power2.inOut");
  // little one cries; mum hugs him
  camTo("base", 700, 660, 1.9, L.l12.start - 0.15, 0.5, 900, "power2.out");
  expr("bs-y", "cry", L.l12.start - 0.1);
  sob("bs-y", L.l12.start, 5);
  talk("bs-y", "l12");
  expr("bs-m", "sad", L.l13.start);
  gesture("bs-m", "hug", L.l13.start, 0.35);
  talk("bs-m", "l13");
  // teen with the kit
  camTo("base", 840, 640, 1.8, L.l14.start - 0.15, 0.5, 900, "power2.inOut");
  expr("bs-o", "determined", L.l14.start);
  gesture("bs-o", "carry", L.l14.start, 0.3);
  T(
    `tl.set("#kit", {x:-10, y:20}, ${r(L.l14.start)}); tl.fromTo("#kit", {opacity:0, y:20}, {opacity:1, y:0, duration:.25, immediateRender:false}, ${r(L.l14.start + 0.2)});`,
  );
  talk("bs-o", "l14");
  // "Молодец, сын." proud smile + pat; camera on father and son
  camTo("base", 640, 640, 1.6, L.l15.start - 0.15, 0.4, 900, "power2.inOut");
  expr("bs-g", "happy", L.l15.start - 0.1);
  gesture("bs-g", "pat", L.l15.start, 0.3);
  talk("bs-g", "l15");
  expr("bs-o", "happy", L.l15.end);
  ["bs-g", "bs-m", "bs-o"].forEach((id) => blink(id, a, b));
}

/* ───────────── S5 courtyard: "Все в машину" ───────────── */
scene(
  "yard",
  `${room(B.courtyard())}
   <g id="car">${P("car-art", B.car({ lights: false }), 560, 1010, 470)}</g>
   ${C("y-g", GLEB(), 420, 985)}
   ${C("y-y", R.sonYoung(), 300, 985)}
   ${C("y-m", R.masha({ prop: "bag" }), 190, 985)}
   ${C("y-o", R.sonOld(), 90, 985)}`,
  { bg: "#060912" },
);
{
  const [a, b] = S.yard;
  camSet("yard", 420, 640, 1.45, a, 900);
  expr("y-g", "determined", a);
  ["y-y", "y-m", "y-o"].forEach((id) => expr(id, "scared", a));
  gesture("y-g", "pointR", L.l16.start + 0.2, 0.2);
  talk("y-g", "l16");
  ["y-o", "y-m", "y-y", "y-g"].forEach((id, i) => {
    walk(id, L.l16.end + 0.1, b, 300 - i * 40, 0, 0.22, 22);
    T(`tl.to("#${id}", {opacity:0, duration:.2}, ${r(b - 0.25 + i * 0.03)});`);
  });
  camTo("yard", 640, 720, 1.3, L.l16.end, b - L.l16.end, 900);
}

/* ───────────── S6 inside the car: engine won't start… starts; the radio; "куда?" ───────────── */
scene(
  "cab",
  `<g id="cab-back">${room(B.cabBack())}</g>
   ${C("c-y", R.sonYoung(), 545, 745)}
   ${C("c-g", GLEB(), 330, 805)}
   ${C("c-m", R.masha(), 770, 805)}
   <g id="cab-off">${room(B.cabFront({ lit: false }))}</g>
   <g id="cab-on" opacity="0">${room(B.cabFront({ lit: true }))}</g>`,
  { bg: "#05070d" },
);
{
  const [a, b] = S.cab;
  camSet("cab", 540, 560, 1.45, a, 900);
  expr("c-g", "nervous", a);
  expr("c-m", "scared", a);
  expr("c-y", "scared", a);
  gesture("c-g", "wheel", a, 0.01);
  // turn the key: crank fails, Gleb sweats
  T(`tl.to("#key", {rotation:50, svgOrigin:"470 820", duration:.15}, ${r(L.l17.start - 0.3)});`);
  shake("#sh-cab", L.l17.start - 0.25, 10, 3);
  T(`tl.to("#key", {rotation:0, svgOrigin:"470 820", duration:.15}, ${r(L.l17.start + 0.9)});`);
  camTo("cab", 330, 520, 2.3, L.l17.start - 0.2, 0.6, 860, "power2.out");
  talk("c-g", "l17");
  // second try: it starts — dashboard lights, relieved grin
  T(`tl.to("#key", {rotation:50, svgOrigin:"470 820", duration:.15}, ${r(L.l17.end + 0.1)});`);
  shake("#sh-cab", L.l17.end + 0.15, 14, 3);
  show("#cab-on", L.l18.start - 0.1);
  hide("#cab-off", L.l18.start - 0.1);
  expr("c-g", "happy", L.l18.start - 0.1);
  talk("c-g", "l18");
  // driving: street lights slide past; radio
  T(
    `tl.to("#cab-back .street", {x:-900, duration:${r(b - L.l18.end)}, ease:"none"}, ${r(L.l18.end)});`,
  );
  T(
    `tl.to("#zm-cab", {keyframes:[{y:"+=3",duration:.2},{y:"-=3",duration:.2}], repeat:${Math.round((b - L.l18.end) / 0.4)}}, ${r(L.l18.end)});`,
  );
  camTo("cab", 735, 760, 2.6, L.l19.start - 0.3, 0.6, 880, "power2.inOut");
  T(
    `tl.fromTo("#radio", {opacity:1}, {keyframes:[{opacity:.7,duration:.3},{opacity:1,duration:.3}], repeat:6, immediateRender:false}, ${r(L.l19.start)});`,
  );
  expr("c-g", "determined", L.l19.start);
  expr("c-m", "sad", L.l19.start + 1.2);
  // the little one asks from the back
  camTo("cab", 545, 560, 2.2, L.l20.start - 0.2, 0.5, 860, "power2.inOut");
  talk("c-y", "l20");
  camTo("cab", 340, 540, 2.1, L.l21.start - 0.1, 0.5, 860, "power2.inOut");
  expr("c-g", "tired", L.l21.start);
  talk("c-g", "l21");
  ["c-g", "c-m", "c-y"].forEach((id) => blink(id, a, b));
}

/* ───────────── S7 road at dawn ───────────── */
scene(
  "road",
  `${room(B.road({ dawn: true }))}<g id="rd-car">${P("rd-car-art", B.car({ lights: true, people: true }), 300, 960, 430)}</g>`,
  { bg: "#1b2342" },
);
{
  const [a, b] = S.road;
  camSet("road", 520, 860, 1.75, a, 860);
  T(
    `tl.fromTo("#zm-road .poles", {x:0}, {x:-660, duration:${r(b - a)}, ease:"none", immediateRender:false}, ${r(a)});`,
  );
  T(
    `tl.fromTo("#zm-road .far", {x:0}, {x:-120, duration:${r(b - a)}, ease:"none", immediateRender:false}, ${r(a)});`,
  );
  T(
    `tl.fromTo("#zm-road .lane", {x:0}, {x:-440, duration:${r(b - a)}, ease:"none", immediateRender:false}, ${r(a)});`,
  );
  T(
    `tl.to("#rd-car-art .wheel", {rotation:1440, transformOrigin:"50% 50%", duration:${r(b - a)}, ease:"none"}, ${r(a)});`,
  );
}

/* ───────────── S8 ruins ───────────── */
const ruinsWorld = (k) => `${room(B.dachaRuins())}
   ${P(`${k}-car`, B.car({ lights: false }), -60, 1000, 380)}
   ${C(`${k}-m`, R.masha(), 440, 1010)}
   ${C(`${k}-y`, R.sonYoung(), 540, 1010)}
   ${C(`${k}-o`, R.sonOld(), 640, 1010)}
   ${C(`${k}-g`, GLEB({ prop: "phone" }), 760, 1010)}`;
scene("ruins", ruinsWorld("ru"), { bg: "#2a2a36" });
{
  const [a, b] = S.ruins;
  camSet("ruins", 520, 560, 1.15, a, 820);
  camTo("ruins", 560, 640, 1.4, a, L.l23.start - a, 860, "sine.out");
  ["ru-m", "ru-y", "ru-o", "ru-g"].forEach((id) => expr(id, "shock", a + 0.4));
  T(
    `tl.to("#zm-ruins .smoke circle", {y:-40, duration:${r(b - a)}, ease:"none", stagger:.05}, ${r(a)});`,
  );
  gesture("ru-m", "mouth", L.l23.start, 0.35);
  talk("ru-m", "l23");
  expr("ru-m", "cry", L.l23.end);
  camTo("ruins", 470, 620, 1.85, L.l23.start - 0.1, 0.5, 880, "power2.out");
  camTo("ruins", 640, 600, 1.85, L.l24.start - 0.1, 0.5, 880, "power2.inOut");
  expr("ru-o", "scared", L.l24.start);
  gesture("ru-o", "shrug", L.l24.start + 0.2, 0.3);
  talk("ru-o", "l24");
  // Gleb dials grandma
  camTo("ruins", 760, 580, 2.0, L.l24.end, 0.6, 860, "power2.inOut");
  expr("ru-g", "nervous", L.l24.end);
  gesture("ru-g", "phoneEar", L.l24.end + 0.1, 0.35);
  ["ru-m", "ru-y", "ru-o", "ru-g"].forEach((id) => blink(id, a, b));
}
scene(
  "call",
  `${P("call-ph", B.callScreen({ state: "calling" }), 175, 1460, 730)}<g id="call-off" opacity="0">${P("call-ph2", B.callScreen({ state: "off" }), 175, 1460, 730)}</g>`,
  { bg: "#020308" },
);
{
  const [a, b] = S.call;
  camSet("call", 540, 960, 1.0, a, 960);
  T(
    `tl.fromTo("#call-ph", {scale:1.2, svgOrigin:"540 960", opacity:0}, {scale:1, opacity:1, duration:.3, ease:"power3.out", immediateRender:false}, ${r(a)});`,
  );
  show("#call-off", W("абонент"));
  shake("#sh-call", W("абонент"), 6, 8);
  camTo("call", 540, 760, 1.25, a + 0.3, b - a - 0.3, 900, "none");
}
scene("ruins2", ruinsWorld("r2"), { bg: "#2a2a36" });
{
  const [a, b] = S.ruins2;
  camSet("ruins2", 760, 580, 2.0, a, 860);
  ["r2-m", "r2-y", "r2-o"].forEach((id) => expr(id, "sad", a));
  expr("r2-g", "sad", a);
  gesture("r2-g", "phoneEar", a, 0.01);
  gesture("r2-g", "rest", a + 0.2, 0.4);
  expr("r2-g", "determined", L.l26.start + 0.4);
  talk("r2-g", "l26");
  // Masha: "там же бомбят!"
  camTo("ruins2", 470, 600, 1.9, L.l27.start - 0.15, 0.45, 880, "power2.inOut");
  expr("r2-m", "scared", L.l27.start);
  gesture("r2-m", "open", L.l27.start + 0.1, 0.25);
  talk("r2-m", "l27");
  // "Они там одни, Маш. Мы их не бросим." — wet eyes but firm
  camTo("ruins2", 700, 570, 2.1, L.l28.start - 0.15, 0.5, 860, "power2.inOut");
  expr("r2-g", "sad", L.l28.start);
  gesture("r2-g", "wipe", L.l28.start + 0.2, 0.3);
  gesture("r2-g", "rest", L.l28.start + 1.3, 0.3);
  expr("r2-g", "determined", W("мы", 1, 84) - 0.1);
  talk("r2-g", "l28");
  T(
    `tl.to("#zm-ruins2 .smoke circle", {y:-40, duration:${r(b - a)}, ease:"none", stagger:.05}, ${r(a)});`,
  );
  ["r2-m", "r2-g"].forEach((id) => blink(id, a, b));
}

/* ───────────── S9 back to the burning city ───────────── */
scene(
  "back",
  `${room(B.road({ dawn: false }))}
   <rect x="-200" y="560" width="1480" height="200" fill="#ff6a2b" opacity=".22"/>
   <g opacity=".9">${Array.from({ length: 16 }, (_, i) => `<rect x="${i * 70 - 20}" y="${700 - ((i * 37) % 90)}" width="54" height="${((i * 37) % 90) + 10}" fill="#120a10"/>`).join("")}</g>
   <g id="bk-car">${P("bk-car-art", B.car({ lights: true, people: true }), 560, 960, 430)}</g>`,
  { bg: "#05070e" },
);
{
  const [a, b] = S.back;
  camSet("back", 620, 860, 1.7, a, 860);
  T(`tl.set("#bk-car", {scaleX:-1, svgOrigin:"775 900"}, ${r(a)});`);
  T(`tl.to("#bk-car", {x:-700, duration:${r(b - a)}, ease:"power1.in"}, ${r(a + 0.4)});`);
  T(
    `tl.to("#bk-car-art .wheel", {rotation:-1440, transformOrigin:"50% 50%", duration:${r(b - a)}, ease:"power1.in"}, ${r(a + 0.4)});`,
  );
  T(
    `tl.fromTo("#zm-back .poles", {x:-660}, {x:0, duration:${r(b - a)}, ease:"none", immediateRender:false}, ${r(a)});`,
  );
  camTo("back", 360, 840, 1.8, a, b - a, 860, "none");
}

/* ───────────── overlays: kinetic text ───────────── */
const spl = (text, cls) =>
  [...text]
    .map((ch) =>
      ch === " " ? `<span class="${cls} sp">&nbsp;</span>` : `<span class="${cls}">${ch}</span>`,
    )
    .join("");
const ROLE = {
  narrator: null,
  gleb: ["ГЛЕБ", "#9fc2ff"],
  masha: ["МАША", "#ffb3c7"],
  son_old: ["СТАРШИЙ", "#8be0a4"],
  son_young: ["МЛАДШИЙ", "#ffd25a"],
  maxim: ["ДЕД МАКСИМ", "#ffa86a"],
  radio: ["РАДИО", "#c9ccd2"],
  robot: ["ТЕЛЕФОН", "#c9ccd2"],
};
const HOT = new Set(
  "голова кровь первый водка война ружьё покажу восемьдесят снайпером подвал коробки страшно аптечку молодец машину есть укрытиях дачу дачи бабушке дедушкой город одни обратно".split(
    " ",
  ),
);
const DANGER = new Set(
  "ебануло разбилась сука блядь бля хуй война бомбят бежали недоступен".split(" "),
);
const hook = `<div id="hook" class="clip toptitle" data-start="0.2" data-duration="${r(L.l02.start - 0.2)}" data-track-index="2" style="z-index:5"><div class="tt-s">${spl("ГЛЕБ", "hs")}</div><div class="tt-a">${spl("ЧАСТЬ 2", "ha")}</div></div>`;
T(
  `tl.fromTo("#hook .hs", {opacity:0, y:-40}, {opacity:1, y:0, duration:.3, stagger:.06, ease:"back.out(2)", immediateRender:false}, 0.45);`,
);
T(
  `tl.fromTo("#hook .ha", {opacity:0, y:-160, rotation:(i)=>[-14,10,-8,12,-10,8,-12][i%7], scale:1.6}, {opacity:1, y:0, rotation:0, scale:1, duration:.45, stagger:.07, ease:"back.out(1.8)", immediateRender:false}, 0.7);`,
);
T(`tl.set("#hook .hs, #hook .ha", {opacity:0}, 0);`);
T(
  `tl.to("#hook .ha", {y:-60, opacity:0, duration:.22, stagger:.03, ease:"power2.in"}, ${r(L.l02.start - 0.55)});`,
);
T(`tl.to("#hook .hs", {opacity:0, duration:.2}, ${r(L.l02.start - 0.4)});`);
const stamp = (id, t0, t1, text, color) => {
  T(
    `tl.fromTo("#${id} .clk", {scale:2.2, rotation:-12, opacity:0}, {scale:1, rotation:-4, opacity:1, duration:.32, ease:"power4.in", immediateRender:false}, ${r(t0)});`,
  );
  T(
    `tl.to("#${id} .clk", {keyframes:[{x:-10,duration:.04},{x:8,duration:.04},{x:-4,duration:.04},{x:0,duration:.04}]}, ${r(t0 + 0.32)});`,
  );
  T(`tl.to("#${id} .clk", {opacity:0, duration:.25}, ${r(t1 - 0.25)});`);
  return `<div id="${id}" class="clip clock" data-start="${r(t0)}" data-duration="${r(t1 - t0)}" data-track-index="2" style="z-index:5"><div class="clk sm" style="color:${color}">${text}</div></div>`;
};
const stamps = stamp("st1", W("два", 1, 70), S.road[1], "+2 ЧАСА", "#ffcf7a");
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
        const rot = ((gi * 7 + w.text.length * 3) % 13) - 6;
        T(
          `tl.fromTo("#${w.id}", {opacity:0, scale:.35, rotation:${rot}, y:28}, {opacity:1, scale:1, rotation:0, y:0, duration:.3, ease:"back.out(2.6)", immediateRender:false}, ${r(w.start - 0.04)});`,
        );
        if (DANGER.has(n))
          T(
            `tl.to("#${w.id}", {keyframes:[{x:-9,duration:.04},{x:9,duration:.04},{x:-7,duration:.04},{x:7,duration:.04},{x:-3,duration:.04},{x:0,duration:.04}]}, ${r(w.start + 0.26)});`,
          );
        else if (HOT.has(n))
          T(
            `tl.to("#${w.id}", {keyframes:[{scale:1.18,duration:.12,ease:"power2.out"},{scale:1,duration:.22,ease:"power2.inOut"}]}, ${r(w.start + 0.28)});`,
          );
        const cls = DANGER.has(n) ? "w danger" : HOT.has(n) ? "w hot" : "w";
        return `<span id="${w.id}" class="${cls}" style="color:${col}">${w.text.replace(/[,:;]$/, "").replace(/\.$/, "")}</span>`;
      })
      .join(" ");
    T(
      `tl.set("#cg${gi}", {opacity:1}, ${start}); tl.to("#cg${gi}", {opacity:0, duration:.1}, ${r(end - 0.11)}); tl.set("#cg${gi}", {opacity:0}, ${r(end - 0.005)});`,
    );
    T(
      `tl.fromTo("#cg${gi} .line", {y:26}, {y:0, duration:.28, ease:"back.out(2)", immediateRender:false}, ${start});`,
    );
    if (role && (gi === 0 || groups[gi - 1][0].line !== g[0].line))
      T(
        `tl.fromTo("#cg${gi} .who", {x:-80, opacity:0}, {x:0, opacity:1, duration:.25, ease:"power3.out", immediateRender:false}, ${start});`,
      );
    return `<div id="cg${gi}" class="clip capgroup" data-start="${start}" data-duration="${r(end - start)}" data-track-index="3" style="z-index:6;opacity:0">${tag}<div class="line">${spans}</div></div>`;
  })
  .join("\n");
const title = `<div id="tbc" class="clip" data-start="${TITLE[0]}" data-duration="${r(TITLE[1] - TITLE[0])}" data-track-index="4" style="z-index:8"><div id="tbc-a">${spl("ПРОДОЛЖЕНИЕ СЛЕДУЕТ…", "ta")}</div><div id="tbc-b">ЧАСТЬ 3</div></div>`;
T(`tl.set("#tbc-a .ta", {opacity:0}, 0);`);
T(`tl.to("#tbc-a .ta", {opacity:1, duration:.01, stagger:.045}, ${r(TITLE[0] + 0.3)});`);
T(
  `tl.fromTo("#tbc-b", {opacity:0, scale:2.2}, {opacity:1, scale:1, duration:.3, ease:"power4.in", immediateRender:false}, ${r(TITLE[0] + 1.4)});`,
);
T(
  `tl.to("#tbc-b", {keyframes:[{x:-14,textShadow:"8px 0 #00e5ff, -8px 0 #ff2a6a",duration:.05},{x:10,textShadow:"-6px 0 #00e5ff, 6px 0 #ff2a6a",duration:.05},{x:-4,textShadow:"3px 0 #00e5ff, -3px 0 #ff2a6a",duration:.05},{x:0,textShadow:"0px 0 #00e5ff, 0px 0 #ff2a6a",duration:.08}]}, ${r(TITLE[0] + 1.7)});`,
);
const card = `<div id="card" class="clip" data-start="${CARD_START}" data-duration="${CARD_DUR}" data-track-index="4" style="z-index:9"><div id="card-a">Больше таких анимаций<br/>в Telegram-канале</div><div id="card-b">${spl("@Claude306", "cb")}</div></div>`;
T(`tl.set("#card-a, #tbc-b", {opacity:0}, 0);`);
T(
  `tl.fromTo("#card-a", {opacity:0, y:40}, {opacity:1, y:0, duration:.45, ease:"power3.out", immediateRender:false}, ${r(CARD_START + 0.1)});`,
);
T(`tl.set("#card-b .cb", {opacity:0}, 0);`);
T(
  `tl.fromTo("#card-b .cb", {opacity:0, y:70, scale:.6}, {opacity:1, y:0, scale:1, duration:.4, stagger:.05, ease:"back.out(2.2)", immediateRender:false}, ${r(CARD_START + 0.4)});`,
);
T(
  `tl.to("#card-b .cb", {keyframes:[{y:-14,duration:.15},{y:0,duration:.2}], stagger:.05}, ${r(CARD_START + 1.6)});`,
);

/* ───────────── audio ───────────── */
const SFX = "assets/sfx";
const sfx = [
  ["tinnitus", 0.05, 4, 0.8],
  ["door", S.maxim[0], 0.35, 1.0],
  ["glass", W("разбилась") + 0.1, 0.6, 0.6],
  ["boom1", L.l07.end + 0.3, 3.4, 0.3],
  ["boom2", L.l13.end, 4.1, 0.35],
  ["door", S.cab[0] + 0.05, 0.35, 0.9],
  ["crank", L.l17.start - 0.3, 1.4, 0.9],
  ["crank", L.l17.end + 0.1, 1.0, 0.9],
  ["fire", S.ruins[0], 12, 1.0],
  ["boom2", S.back[0] + 1.0, 4.1, 0.35],
];
const audio = [
  `<audio id="vo" class="clip" src="assets/vo3.wav" data-start="0" data-duration="${r(L.l29.end + 0.1)}" data-track-index="10" data-volume="1"></audio>`,
  `<audio id="room" class="clip" src="${SFX}/room_night.wav" data-start="1" data-duration="${r(Math.min(31, S.cab[0] - 1))}" data-track-index="11" data-volume="0.8"></audio>`,
  `<audio id="room2" class="clip" src="${SFX}/room_night.wav" data-start="32" data-duration="${r(S.cab[0] - 32)}" data-track-index="11" data-volume="0.8"></audio>`,
  `<audio id="eng" class="clip" src="${SFX}/engine.wav" data-start="${r(L.l18.start - 0.1)}" data-duration="${r(Math.min(24, S.ruins[0] - L.l18.start + 0.1))}" data-track-index="11" data-volume="0.55"></audio>`,
  `<audio id="eng2" class="clip" src="${SFX}/engine.wav" data-start="${S.back[0]}" data-duration="${r(CUT - S.back[0])}" data-track-index="11" data-volume="0.6"></audio>`,
  ...sfx.map(
    ([f, at, d, v], i) =>
      `<audio id="sfx${i}" class="clip" src="${SFX}/${f}.wav" data-start="${r(at)}" data-duration="${r(Math.min(d, CUT - at))}" data-track-index="${12 + (i % 3)}" data-volume="${v}"></audio>`,
  ),
];

const html = `<!doctype html>
<html lang="ru">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=1080, height=1920" />
<title>Глеб — часть 2</title>
<script src="assets/gsap.min.js"></script>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { width: 1080px; height: 1920px; overflow: hidden; background: #05070c; font-family: "Inter", sans-serif; }
  #root { position: absolute; inset: 0; background: #05070c; overflow: hidden; }
  .scene { position: absolute; inset: 0; overflow: hidden; }
  .scene svg { position: absolute; left: 0; top: 0; }
  .vignette { position: absolute; inset: 0; pointer-events: none; background: radial-gradient(ellipse 80% 62% at 50% 46%, rgba(0,0,0,0) 55%, rgba(0,0,0,.6) 100%); }
  .toptitle { position: absolute; left: 0; right: 0; top: 260px; text-align: center; }
  .tt-s { font-weight: 900; font-size: 54px; letter-spacing: .3em; color: #ffb02e; -webkit-text-stroke: 8px #05070c; paint-order: stroke fill; }
  .tt-a { font-weight: 900; font-size: 150px; line-height: 1; color: #fff; -webkit-text-stroke: 14px #05070c; paint-order: stroke fill; margin-top: 10px; }
  .clock { position: absolute; left: 0; right: 0; top: 240px; text-align: center; }
  .clk { display: inline-block; font-weight: 900; font-size: 140px; line-height: 1; -webkit-text-stroke: 14px #05070c; paint-order: stroke fill; text-shadow: 0 10px 0 rgba(0,0,0,.5); }
  .capgroup { position: absolute; left: 50px; right: 50px; top: 1170px; text-align: center; overflow: visible; }
  .capgroup .who { font-weight: 900; font-size: 40px; letter-spacing: .14em; -webkit-text-stroke: 8px #05070c; paint-order: stroke fill; margin-bottom: 4px; }
  .capgroup .line { font-weight: 900; font-size: 84px; line-height: 1.08; text-transform: uppercase; }
  .capgroup .w { display: inline-block; margin: 0 .13em; -webkit-text-stroke: 12px #05070c; paint-order: stroke fill; text-shadow: 0 8px 0 rgba(0,0,0,.55); opacity: 0; }
  .capgroup .w.hot { text-shadow: 0 8px 0 rgba(0,0,0,.55), 0 0 28px rgba(255,176,46,.55); }
  .capgroup .w.danger { text-shadow: 0 8px 0 rgba(0,0,0,.55), 0 0 30px rgba(255,74,61,.6); }
  .hs, .ha, .ta, .cb { display: inline-block; }
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
${stamps}
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
console.log({ TOTAL, CUT, tweens: tweens.length, groups: groups.length });
console.log(JSON.stringify(S));
