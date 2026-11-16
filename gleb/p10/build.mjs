// "Глеб — часть 10": the bed gives up, a new look, a shaved grandad, the road south, a cat, a checkpoint.
// Run from gleb/p10: node build.mjs → index.html (sfx shared via assets/sfx symlink).
import fs from "node:fs";
import * as R from "../art/rig.js";
import * as F8 from "../p8/art8.js";
import * as F9 from "../p9/art9.js";
import * as F10 from "./art10.js";
import * as F2 from "../p2/art2.js";
import * as K from "../p3/art3.js";

const read = (f) => JSON.parse(fs.readFileSync(new URL(f, import.meta.url)));
const words = read("./assets/words.json");
const lines = read("./assets/timings.json").lines;
const lips = read("./assets/lips.json");
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
const CUT = r(L.l70.end + 1.6);
const TITLE = [CUT, r(CUT + 3.2)];
const CARD_START = r(TITLE[1] + 0.1);
const CARD_DUR = 3.6;
const TOTAL = r(CARD_START + CARD_DUR);
const S = {};
{
  const ends = [
    ["night", L.l05.end + 0.8],
    ["morning", L.l09.end + 0.6],
    ["dress", L.l12.end + 0.8],
    ["shaved", L.l21.end + 0.8],
    ["pack", L.l31.end + 0.8],
    ["car", L.l36.end + 1.0],
    ["road", L.l45.end + 0.8],
    ["gas", L.l52.end + 0.5],
    ["catcab", L.l56.end + 0.8],
    ["sunset", L.l63.end + 0.8],
    ["check", L.l65.end + 0.3],
    ["whisper", L.l68.end + 0.4],
    ["face", L.l69.end + 0.3],
    ["last", CUT],
  ];
  let t = 0;
  for (const [k, e] of ends) {
    S[k] = [r(t), r(e)];
    t = e;
  }
}

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
const RK = RIG_W / 200;
const C = (id, rig, cx, footY, attrs = "") =>
  P(id, rig.svg, cx - RIG_W / 2, footY + (420 - 404) * RK, RIG_W, attrs);
const tweens = [];
const T = (s) => tweens.push(s);
const scenes = [];
function scene(key, world, { bg = "#05070c", overlay = "" } = {}) {
  const [a, b] = S[key];
  scenes.push(`
  <div id="sc-${key}" class="clip scene" data-start="${a}" data-duration="${r(b - a)}" data-track-index="1" style="z-index:1;background:${bg}">
    <svg viewBox="0 0 1080 1920" width="1080" height="1920"><rect x="-500" y="-500" width="2080" height="2920" fill="${bg}"/><g id="sh-${key}"><g id="zm-${key}" transform="matrix(1 0 0 1 0 0)">${world}</g></g>${overlay}</svg>
  </div>`);
}
const camM = (px, py, s, sy) => `matrix(${s} 0 0 ${s} ${r(540 - s * px)} ${r(sy - s * py)})`;
const camSet = (key, px, py, s, at, sy = 880) =>
  T(`tl.set("#zm-${key}", {attr:{transform:"${camM(px, py, s, sy)}"}}, ${r(at)});`);
const camTo = (key, px, py, s, at, dur, sy = 880, ease = "sine.inOut") =>
  T(
    `tl.to("#zm-${key}", {attr:{transform:"${camM(px, py, s, sy)}"}, duration:${r(dur)}, ease:"${ease}"}, ${r(at)});`,
  );
const show = (sel, at) => T(`tl.set("${sel}", {opacity:1}, ${r(at)});`);
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
  headBoth: [
    [150, 85],
    [-150, -85],
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
  handsUp: [
    [160, 20],
    [-160, -20],
  ],
  cheer: [
    [150, 30],
    [-150, -30],
  ],
  wheel: [
    [-45, -70],
    [45, 70],
  ],
  vodka: [null, [-120, -60]],
  wave: [null, [-150, 20]],
  duck: [
    [-60, -100],
    [60, 100],
  ], // arms over the head
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
const EXPR = {
  neutral: { eyes: "eyes-open", brow: "neutral", mouth: "m0" },
  shock: { eyes: "eyes-wide", brow: "shock", mouth: "mo-o" },
  scared: { eyes: "eyes-wide", brow: "worried", mouth: "mo-frown", sweat: 1 },
  sad: { eyes: "eyes-open", brow: "sad", mouth: "mo-frown" },
  cry: { eyes: "eyes-squint", brow: "sad", mouth: "mo-frown", tear: 1 },
  angry: { eyes: "eyes-open", brow: "angry", mouth: "mo-frown" },
  determined: { eyes: "eyes-squint", brow: "angry", mouth: "m0" },
  happy: { eyes: "eyes-open", brow: "happy", mouth: "mo-smile" },
  tired: { eyes: "eyes-squint", brow: "worried", mouth: "m0", sweat: 1 },
  pain: { eyes: "eyes-squint", brow: "worried", mouth: "mo-grimace", sweat: 1 },
};
const EYES = ["eyes-open", "eyes-wide", "eyes-squint", "eyes-closed"];
const BROWS = ["neutral", "worried", "angry", "happy", "sad", "shock"];
const MOUTHS = ["m0", "mo-smile", "mo-frown", "mo-grimace", "mo-o"];
const exprLog = {};
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
}
const idleMouth = (id, t) => {
  let name = "neutral";
  for (const [tt, n] of exprLog[id] || []) if (tt <= t + 1e-6) name = n;
  return EXPR[name].mouth;
};
function talk(id, lineId) {
  const e = lips.find((x) => x.id === lineId);
  let prev = -1;
  const setMouth = (s, at) => {
    const on = s === 0 ? idleMouth(id, at) : s === 1 ? "m1" : "m2";
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
    T(`tl.to("${part(id, "armL")}", {keyframes:${kf(-swing * 0.8)}, svgOrigin:"0 0"}, ${r(t0)});`);
    T(`tl.to("${part(id, "armR")}", {keyframes:${kf(swing * 0.8)}, svgOrigin:"0 0"}, ${r(t0)});`);
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
let seed = 53;
const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
function blink(id, t0, t1) {
  for (let t = t0 + 0.6 + rnd() * 1.5; t < t1 - 0.2; t += 2.4 + rnd() * 2) {
    T(
      `tl.set("${part(id, "eyes-closed")}", {opacity:1}, ${r(t)}); tl.set("${part(id, "eyes-closed")}", {opacity:0}, ${r(t + 0.12)});`,
    );
    T(
      `tl.set("${part(id, "eyes-open")}", {visibility:"hidden"}, ${r(t)}); tl.set("${part(id, "eyes-open")}", {visibility:"visible"}, ${r(t + 0.12)});`,
    );
  }
}
const room = (s) => strip(s);
const snowFall = (k, t0, t1) =>
  T(
    `tl.fromTo("#zm-${k} .snowfx", {y:0, x:0}, {y:420, x:-60, duration:3, ease:"none", repeat:${Math.max(0, Math.round((t1 - t0) / 3) - 1)}, immediateRender:false}, ${r(t0)});`,
  );
const hearts = (id, x, y) =>
  `<g id="${id}" opacity="0">${[0, 1, 2].map((i) => `<path class="hrt" transform="translate(${x + i * 46 - 46} ${y - i * 24}) scale(${0.8 + i * 0.2})" d="M0 10 C-20 -10 -30 10 0 30 C30 10 20 -10 0 10Z" fill="#ff4a7a" stroke="#0b0d14" stroke-width="2"/>`).join("")}</g>`;
const heartsUp = (id, t0, t1) => {
  show(`#${id}`, t0);
  T(
    `tl.fromTo("#${id} .hrt", {y:20, opacity:0}, {y:-70, opacity:1, duration:1.2, stagger:.3, ease:"sine.out", immediateRender:false}, ${r(t0)});`,
  );
  T(`tl.to("#${id}", {opacity:0, duration:.4}, ${r(t1)});`);
};

const flash = (sel, at, peak = 0.9, dur = 0.5) =>
  T(
    `tl.fromTo("${sel}", {opacity:${peak}}, {opacity:0, duration:${dur}, immediateRender:false}, ${r(at)});`,
  );
const hide = (sel, at) => T(`tl.set("${sel}", {opacity:0}, ${r(at)});`);
const MASK = (o = {}) => R.soldier({ mask: true, ...o });
const spinWheels = (sel, t0, t1, deg = 1440) =>
  T(
    `tl.to("${sel}", {rotation:"+=${deg}", transformOrigin:"50% 50%", duration:${r(t1 - t0)}, ease:"none"}, ${r(t0)});`,
  );
const MXS = (o = {}) => R.maxim({ uniform: true, shaved: true, prop: "", brow: "neutral", ...o });
const MB = (o = {}) => R.masha({ outfit: "black", ...o });
const MOSK = (o = {}) => F2.car({ lights: false, color: "#c9b48a", ...o });
const scroll = (sel, t0, t1, dx = -1600) =>
  T(`tl.to("${sel}", {x:${dx}, duration:${r(t1 - t0)}, ease:"none"}, ${r(t0)});`);
const bump = (k, t0, t1) =>
  T(
    `tl.to("#sh-${k}", {keyframes:[{y:3,duration:.2},{y:0,duration:.2}], repeat:${Math.max(0, Math.round((t1 - t0) / 0.4) - 1)}}, ${r(t0)});`,
  );
const cab = (k, opts, extra = "") =>
  `<g id="${k}-back">${room(F10.fields(opts))}</g>
   ${extra}
   ${C(`${k}-mx`, MXS(), 330, 805)}
   ${C(`${k}-m`, MB(), 770, 805)}
   ${room(F2.cabFront({ lit: true }))}`;

/* S1 the night again: the house creaks... then the bed gives up */
scene(
  "night",
  `${room(F8.dacha())}
   <rect x="-800" y="-800" width="2680" height="3520" fill="#060a20" opacity=".7"/>
   <rect id="nt-win" x="380" y="640" width="120" height="110" fill="#ffcf7a" opacity=".9"/>
   ${F9.owl(900, 600)}
   ${hearts("nt-h", 675, 340)}
   ${F8.snow("snowfx")}`,
  { bg: "#0a1030" },
);
{
  const [a, b] = S.night;
  camSet("night", 540, 640, 1.2, a, 900);
  snowFall("night", a, b);
  const crash = W("сдалась");
  T(
    `tl.to("#sh-night", {keyframes:${JSON.stringify(Array.from({ length: Math.round((crash - a - 1) / 0.3) }, (_, i) => ({ y: i % 2 ? 0 : -5, rotation: i % 2 ? 0 : 0.4, duration: 0.15 })))}, svgOrigin:"540 860"}, ${r(a + 1)});`,
  );
  heartsUp("nt-h", L.l02.start, L.l03.end);
  camTo("night", 440, 700, 2.0, L.l02.start - 0.3, 1.5, 880, "sine.inOut");
  // CRASH
  shake("#sh-night", crash, 12, 22);
  T(
    `tl.set("#nt-win", {opacity:0}, ${r(crash + 0.1)}); tl.set("#nt-win", {opacity:.9}, ${r(crash + 0.5)});`,
  );
  // the owl leaves
  camTo("night", 900, 600, 2.4, L.l05.start - 0.3, 0.6, 880, "power2.inOut");
  T(
    `tl.to("#zm-night .owl-eyes", {scale:1.6, transformOrigin:"50% 50%", duration:.2}, ${r(L.l05.start)});`,
  );
  T(
    `tl.to("#zm-night .owl", {x:600, y:-300, rotation:20, duration:1.4, ease:"power2.in"}, ${r(L.l05.start + 0.8)});`,
  );
}

/* S2 morning: the bed on three legs and a stack of books */
scene(
  "morning",
  `${room(F8.bedroom())}
   <g transform="rotate(5 540 860)">
   ${C("mn-mx", MXS({ uniform: false }), 450, 985)}
   ${C("mn-m", R.masha({ outfit: "night" }), 620, 990)}
   ${room(F8.quilt())}</g>
   ${F10.books(860, 1030)}`,
  { bg: "#6a4630" },
);
{
  const [a, b] = S.morning;
  camSet("morning", 600, 760, 1.25, a, 900);
  T(`tl.set("#mn-mx .head", {opacity:1}, ${r(a)});`);
  camTo("morning", 860, 980, 2.0, L.l06.start + 1.5, 1.0, 900, "power2.inOut");
  expr("mn-m", "tired", a);
  expr("mn-mx", "happy", a);
  camTo("morning", 620, 720, 2.4, L.l07.start - 0.3, 0.6, 880, "power2.inOut");
  talk("mn-m", "l07");
  camTo("morning", 460, 720, 2.4, L.l08.start - 0.3, 0.5, 880, "power2.inOut");
  talk("mn-mx", "l08");
  camTo("morning", 620, 720, 2.4, L.l09.start - 0.3, 0.5, 880, "power2.inOut");
  expr("mn-m", "happy", L.l09.start);
  talk("mn-m", "l09");
  ["mn-m", "mn-mx"].forEach((id) => blink(id, a, b));
}

/* S3 the black jacket */
scene(
  "dress",
  `${room(F8.kitchen())}
   <g id="dr-m0">${C("dr-m", R.masha({ outfit: "night" }), 480, 1060)}</g>
   <g id="dr-m1" opacity="0">${C("dr-mb", MB(), 480, 1060)}</g>
   <circle id="dr-puff" cx="480" cy="860" r="220" fill="#fff" opacity="0"/>`,
  { bg: "#6a4630" },
);
{
  const [a, b] = S.dress;
  camSet("dress", 520, 720, 1.5, a, 900);
  T(`tl.set("#zm-dress .stovefire", {opacity:1}, ${r(a)});`);
  expr("dr-m", "sad", a);
  camTo("dress", 675, 248, 3.2, W("глеб", 1, L.l10.start) - 0.6, 1.0, 900, "power2.inOut");
  camTo("dress", 480, 720, 2.3, L.l11.start - 0.4, 0.6, 880, "power2.inOut");
  pose("dr-m", "head", 8, L.l11.start, 0.4);
  talk("dr-m", "l11");
  // the transformation
  const t = W("чёрная", 1, L.l12.start);
  flash("#dr-puff", t - 0.05, 0.9, 0.5);
  hide("#dr-m0", t);
  show("#dr-m1", t);
  expr("dr-mb", "neutral", a);
  camTo("dress", 480, 1000, 2.4, t, 0.01, 900, "none");
  camTo("dress", 480, 720, 2.2, t + 0.1, 2.2, 880, "sine.inOut");
  T(
    `tl.to("#dr-mb .head", {keyframes:[{rotation:-8,duration:.3},{rotation:6,duration:.4},{rotation:0,duration:.3}], transformOrigin:"50% 92%"}, ${r(W("распущены") - 0.2)});`,
  );
  expr("dr-mb", "happy", W("распущены"));
  blink("dr-m", a, t);
  blink("dr-mb", t, b);
}

/* S4 the shaved grandad */
scene(
  "shaved",
  `${room(F8.kitchen())}
   ${C("sv-m", MB(), 380, 1060)}
   <g id="sv-mxg">${C("sv-mx", MXS(), 1300, 1060)}</g>
   ${hearts("sv-h", 560, 560)}`,
  { bg: "#6a4630" },
);
{
  const [a, b] = S.shaved;
  camSet("shaved", 560, 720, 1.4, a, 900);
  T(`tl.set("#zm-shaved .stovefire", {opacity:1}, ${r(a)});`);
  expr("sv-m", "neutral", a);
  expr("sv-mx", "happy", a);
  T(`tl.to("#sv-mxg", {x:-560, duration:1.2, ease:"power2.out"}, ${r(L.l13.start - 0.6)});`);
  walk("sv-mx", L.l13.start - 0.6, L.l13.start + 0.6, 0, 0, 0.3, 20);
  gesture("sv-mx", "cheer", L.l13.start + 0.8, 0.3);
  talk("sv-mx", "l13");
  gesture("sv-mx", "rest", L.l13.end, 0.3);
  camTo("shaved", 380, 720, 2.4, L.l14.start - 0.3, 0.4, 880, "power2.out");
  expr("sv-m", "shock", L.l14.start);
  gesture("sv-m", "headBoth", L.l14.start + 0.2, 0.25);
  talk("sv-m", "l14");
  gesture("sv-m", "rest", L.l14.end, 0.3);
  camTo("shaved", 740, 720, 2.4, L.l15.start - 0.3, 0.5, 880, "power2.inOut");
  T(
    `tl.to("#sv-mx .body", {keyframes:[{y:-6,duration:.15},{y:0,duration:.15}], repeat:5}, ${r(L.l15.start + 1.5)});`,
  );
  talk("sv-mx", "l15");
  camTo("shaved", 380, 720, 2.4, L.l16.start - 0.3, 0.4, 880, "power2.inOut");
  expr("sv-m", "happy", L.l16.start);
  talk("sv-m", "l16");
  camTo("shaved", 740, 720, 2.2, L.l17.start - 0.3, 0.5, 880, "power2.inOut");
  expr("sv-mx", "determined", L.l17.start);
  gesture("sv-mx", "pointR", W("танк", 1, L.l17.start) - 0.2, 0.2);
  gesture("sv-mx", "rest", L.l17.end, 0.3);
  talk("sv-mx", "l17");
  camTo("shaved", 380, 720, 2.4, L.l18.start - 0.3, 0.4, 880, "power2.inOut");
  talk("sv-m", "l18");
  camTo("shaved", 740, 720, 2.4, L.l19.start - 0.3, 0.4, 880, "power2.inOut");
  expr("sv-mx", "happy", L.l19.start);
  gesture("sv-mx", "cheer", L.l19.start + 0.3, 0.3);
  talk("sv-mx", "l19");
  gesture("sv-mx", "rest", L.l19.end, 0.3);
  camTo("shaved", 560, 720, 1.9, L.l20.start - 0.3, 0.5, 880, "power2.inOut");
  expr("sv-m", "happy", L.l20.start);
  heartsUp("sv-h", L.l20.start + 0.5, L.l21.end);
  talk("sv-m", "l20");
  expr("sv-mx", "happy", L.l21.start);
  gesture("sv-mx", "headR", L.l21.start, 0.3);
  talk("sv-mx", "l21");
  ["sv-m", "sv-mx"].forEach((id) => blink(id, a, b));
}

/* S5 packing; the photo; the map */
scene(
  "pack",
  `${room(F8.kitchen())}
   ${C("pk-m", MB(), 380, 975)}
   ${C("pk-mx", MXS(), 720, 970)}
   ${room(F10.packing())}
   <g id="pk-photo" opacity="0"><rect x="320" y="760" width="80" height="64" fill="#f2efe6" stroke="#0b0d14" stroke-width="2"/><rect x="326" y="766" width="68" height="52" fill="#9fc2e0"/></g>
   <g id="pk-map" opacity="0">${room(F10.bigMap())}</g>`,
  { bg: "#6a4630" },
);
{
  const [a, b] = S.pack;
  camSet("pack", 540, 760, 1.3, a, 900);
  T(`tl.set("#zm-pack .stovefire", {opacity:1}, ${r(a)});`);
  expr("pk-m", "neutral", a);
  expr("pk-mx", "determined", a);
  camTo("pack", 680, 780, 1.8, L.l22.start, L.l22.end - L.l22.start, 900, "sine.inOut");
  // the checklist
  camTo("pack", 700, 740, 2.2, L.l23.start - 0.3, 0.5, 880, "power2.inOut");
  ["тушёнка", "спички", "топор"].forEach((w, i) =>
    gesture("pk-mx", i % 2 ? "rest" : "pointR", W(w, 1, L.l23.start) - 0.1, 0.2),
  );
  expr("pk-mx", "sad", W("водки", 1, L.l23.start));
  gesture("pk-mx", "shrug", W("водки", 1, L.l23.start), 0.3);
  talk("pk-mx", "l23");
  camTo("pack", 400, 740, 2.2, L.l24.start - 0.3, 0.4, 880, "power2.inOut");
  expr("pk-m", "happy", L.l24.start);
  talk("pk-m", "l24");
  camTo("pack", 700, 740, 2.4, L.l25.start - 0.2, 0.3, 880, "power2.out");
  talk("pk-mx", "l25");
  gesture("pk-mx", "rest", L.l25.end, 0.3);
  // the photo
  camTo("pack", 500, 600, 1.6, L.l26.start - 0.3, 0.5, 880, "power2.inOut");
  expr("pk-m", "sad", L.l26.start);
  talk("pk-m", "l26");
  expr("pk-mx", "sad", L.l27.start);
  talk("pk-mx", "l27");
  T(`tl.set("#zm-pack .photo", {opacity:0}, ${r(L.l27.end + 0.2)});`);
  show("#pk-photo", L.l27.end + 0.2);
  T(
    `tl.fromTo("#pk-photo", {x:290, y:-540}, {x:0, y:0, duration:.6, ease:"power2.inOut", immediateRender:false}, ${r(L.l27.end + 0.2)});`,
  );
  camTo("pack", 380, 760, 2.4, L.l28.start - 0.2, 0.5, 880, "power2.inOut");
  T(
    `tl.to("#pk-photo", {x:30, y:-150, scale:.5, svgOrigin:"360 790", opacity:0, duration:.6}, ${r(W("карман") - 0.2)});`,
  );
  // the map
  show("#pk-map", L.l29.start - 0.2);
  camTo("pack", 540, 560, 1.2, L.l29.start - 0.2, 0.01, 900, "none");
  camTo("pack", 500, 540, 1.6, L.l29.start, L.l29.end - L.l29.start, 900, "sine.inOut");
  T(
    `tl.fromTo("#zm-pack .route", {strokeDashoffset:600}, {strokeDashoffset:0, duration:3, ease:"power1.inOut", immediateRender:false}, ${r(W("граница") - 0.3)});`,
  );
  talk("pk-mx", "l29");
  hide("#pk-map", L.l30.start - 0.2);
  camTo("pack", 400, 740, 2.2, L.l30.start - 0.2, 0.01, 880, "none");
  expr("pk-m", "neutral", L.l30.start - 0.2);
  talk("pk-m", "l30");
  camTo("pack", 700, 740, 2.2, L.l31.start - 0.3, 0.4, 880, "power2.inOut");
  gesture("pk-mx", "shrug", L.l31.start + 0.2, 0.3);
  talk("pk-mx", "l31");
  ["pk-m", "pk-mx"].forEach((id) => blink(id, a, b));
}

/* S6 the snowed-in Moskvich; goodbye, dacha */
scene(
  "car",
  `${room(F8.dacha())}
   <g id="cr-car">${P("cr-cart", MOSK({ lights: true }), 560, 1000, 420)}<g id="cr-snow">${F10.snowCap(560, 860, 420)}</g></g>
   <g id="cr-puffs" opacity="0">${[0, 1, 2].map((k) => `<circle cx="${540 - k * 30}" cy="${950 - k * 20}" r="${20 + k * 10}" fill="#d8dee8"/>`).join("")}</g>
   ${C("cr-m", MB({ prop: "bag" }), 200, 1060)}
   ${C("cr-mx", MXS(), 380, 1060)}
   ${F8.snow("snowfx")}`,
  { bg: "#2a3a5a" },
);
{
  const [a, b] = S.car;
  camSet("car", 560, 760, 1.2, a, 900);
  snowFall("car", a, b);
  expr("cr-m", "neutral", a);
  expr("cr-mx", "tired", a);
  camTo("car", 700, 800, 1.7, L.l32.start + 0.5, 2.0, 900, "power2.inOut");
  camTo("car", 400, 740, 2.2, L.l33.start - 0.3, 0.5, 880, "power2.inOut");
  gesture("cr-mx", "headR", L.l33.start, 0.3);
  talk("cr-mx", "l33");
  T(`tl.to("#cr-m, #cr-mx", {opacity:0, duration:.3}, ${r(L.l33.end + 0.2)});`);
  // first try!
  camTo("car", 760, 800, 1.6, L.l33.end + 0.2, 0.6, 900, "power2.inOut");
  shake("#cr-car", L.l33.end + 0.5, 8, 3);
  T(
    `tl.to("#cr-snow", {x:-200, y:120, rotation:-20, svgOrigin:"760 860", opacity:0, duration:.8, ease:"power2.in"}, ${r(L.l33.end + 0.7)});`,
  );
  T(
    `tl.fromTo("#cr-puffs", {opacity:.9, x:0}, {opacity:0, x:-120, duration:1.2, immediateRender:false}, ${r(L.l33.end + 0.7)});`,
  );
  T(
    `tl.fromTo("#cr-puffs", {opacity:.9, x:0}, {opacity:0, x:-120, duration:1.2, immediateRender:false}, ${r(L.l34.start + 1.2)});`,
  );
  // goodbye
  camTo("car", 560, 640, 1.2, L.l35.start - 0.2, 1.0, 900, "power2.inOut");
  T(
    `tl.to("#cr-car", {x:1100, duration:${r(b - L.l36.end + 0.6)}, ease:"power2.in"}, ${r(L.l36.end - 0.6)});`,
  );
  spinWheels("#cr-cart .wheel", L.l36.end - 0.6, b, 900);
}

/* S7 the road: fields, the radio, the passports */
scene("road", cab("rd", {}, `<g id="rd-pp">${F10.passports("pp", 400, 640)}</g>`), {
  bg: "#8fb4dc",
});
{
  const [a, b] = S.road;
  camSet("road", 540, 600, 1.4, a, 900);
  scroll("#rd-back .street", a, b, -2400);
  bump("road", a, b);
  gesture("rd-mx", "wheel", a, 0.01);
  expr("rd-mx", "neutral", a);
  expr("rd-m", "neutral", a);
  camTo("road", 735, 760, 2.6, L.l38.start - 0.3, 0.6, 880, "power2.inOut");
  T(
    `tl.fromTo("#radio", {opacity:1}, {keyframes:[{opacity:.6,duration:.3},{opacity:1,duration:.3}], repeat:8, immediateRender:false}, ${r(L.l38.start)});`,
  );
  camTo("road", 770, 560, 2.2, L.l39.start - 0.3, 0.5, 860, "power2.inOut");
  expr("rd-m", "scared", L.l39.start);
  talk("rd-m", "l39");
  camTo("road", 330, 560, 2.2, L.l40.start - 0.3, 0.5, 860, "power2.inOut");
  expr("rd-mx", "happy", L.l40.start);
  talk("rd-mx", "l40");
  // passports
  T(`tl.set("#zm-road .pp", {opacity:1}, ${r(W("паспорт") - 0.3)});`);
  T(
    `tl.fromTo("#zm-road .pp", {y:120}, {y:0, duration:.4, ease:"back.out(2)", immediateRender:false}, ${r(W("паспорт") - 0.3)});`,
  );
  camTo("road", 380, 600, 2.2, W("паспорт") - 0.3, 0.4, 860, "power2.out");
  talk("rd-mx", "l41");
  camTo("road", 770, 560, 2.3, L.l42.start - 0.2, 0.3, 860, "power2.out");
  expr("rd-m", "shock", L.l42.start);
  talk("rd-m", "l42");
  camTo("road", 330, 560, 2.2, L.l43.start - 0.3, 0.5, 860, "power2.inOut");
  T(`tl.to("#zm-road .pp", {opacity:0, duration:.3}, ${r(L.l43.end)});`);
  talk("rd-mx", "l43");
  camTo("road", 770, 560, 2.2, L.l44.start - 0.3, 0.5, 860, "power2.inOut");
  expr("rd-m", "happy", L.l44.start);
  talk("rd-m", "l44");
  camTo("road", 330, 560, 2.2, L.l45.start - 0.3, 0.5, 860, "power2.inOut");
  expr("rd-mx", "happy", L.l45.start);
  talk("rd-mx", "l45");
  camTo("road", 540, 600, 1.4, L.l45.end, b - L.l45.end, 900, "sine.inOut");
  ["rd-m", "rd-mx"].forEach((id) => blink(id, a, b));
}

/* S8 the abandoned petrol station and a ginger cat */
scene(
  "gas",
  `${room(F10.station())}
   <g id="gs-car">${P("gs-cart", MOSK(), -500, 1000, 420)}</g>
   ${F10.cat("gs-cat", 495, 560, 1.0)}
   <g id="gs-pp" opacity="0">${C("gs-m", MB(), 300, 1060)}${C("gs-mx", MXS(), 600, 1060)}</g>
   ${F10.jerrycan("gs-can", 690, 900)}`,
  { bg: "#9fb8d8" },
);
{
  const [a, b] = S.gas;
  camSet("gas", 540, 680, 1.15, a, 900);
  T(`tl.to("#gs-car", {x:420, duration:2.0, ease:"power2.out"}, ${r(a)});`);
  spinWheels("#gs-cart .wheel", a, a + 2.0, 720);
  show("#gs-pp", L.l47.start - 0.5);
  T(
    `tl.fromTo("#gs-pp", {opacity:0}, {opacity:1, duration:.4, immediateRender:false}, ${r(L.l47.start - 0.5)});`,
  );
  expr("gs-m", "scared", a);
  expr("gs-mx", "neutral", a);
  camTo("gas", 300, 720, 2.2, L.l47.start - 0.3, 0.5, 880, "power2.inOut");
  talk("gs-m", "l47");
  camTo("gas", 520, 600, 2.4, L.l48.start + 1.4, 0.8, 880, "power2.inOut");
  camTo("gas", 560, 640, 1.9, L.l49.start - 0.3, 0.5, 880, "power2.inOut");
  expr("gs-mx", "happy", L.l49.start);
  gesture("gs-mx", "wave", L.l49.start, 0.3);
  talk("gs-mx", "l49");
  gesture("gs-mx", "rest", L.l49.end, 0.3);
  // the cat is not impressed
  camTo("gas", 500, 520, 2.8, L.l50.start - 0.2, 0.4, 880, "power2.inOut");
  T(
    `tl.to("#zm-gas .cat-eyes", {scaleY:.3, transformOrigin:"50% 50%", duration:.3}, ${r(W("дурака") - 0.4)});`,
  );
  T(
    `tl.to("#zm-gas .gs-cat", {x:400, opacity:0, duration:.9, ease:"power1.in"}, ${r(W("ушёл") - 0.1)});`,
  );
  camTo("gas", 300, 720, 2.2, L.l51.start - 0.3, 0.5, 880, "power2.inOut");
  expr("gs-m", "happy", L.l51.start);
  talk("gs-m", "l51");
  camTo("gas", 620, 720, 2.0, L.l52.start - 0.3, 0.5, 880, "power2.inOut");
  T(`tl.set("#zm-gas .gs-can", {opacity:1}, ${r(L.l52.start)});`);
  gesture("gs-mx", "pointR", L.l52.start + 0.2, 0.3);
  talk("gs-mx", "l52");
  ["gs-m", "gs-mx"].forEach((id) => blink(id, a, b));
}

/* S9 a passenger: the cat jumps in */
scene("catcab", cab("cc", {}, F10.cat("cc-cat", 545, 705, 1.4)), { bg: "#8fb4dc" });
{
  const [a, b] = S.catcab;
  camSet("catcab", 540, 600, 1.4, a, 900);
  scroll("#cc-back .street", a, b, -2000);
  bump("catcab", a, b);
  gesture("cc-mx", "wheel", a, 0.01);
  T(`tl.set("#zm-catcab .cc-cat", {opacity:0}, ${r(a)});`);
  T(
    `tl.fromTo("#zm-catcab .cc-cat", {opacity:0, y:120}, {opacity:1, y:0, duration:.4, ease:"back.out(2)", immediateRender:false}, ${r(W("кот", 1, L.l53.start) + 0.6)});`,
  );
  camTo("catcab", 545, 560, 2.2, L.l53.start + 1.0, 0.6, 860, "power2.inOut");
  camTo("catcab", 400, 580, 2.0, L.l54.start - 0.3, 0.4, 860, "power2.inOut");
  expr("cc-mx", "shock", L.l54.start);
  pose("cc-mx", "head", 14, L.l54.start, 0.2);
  talk("cc-mx", "l54");
  camTo("catcab", 700, 580, 2.0, L.l55.start - 0.3, 0.4, 860, "power2.inOut");
  expr("cc-m", "happy", L.l55.start);
  talk("cc-m", "l55");
  camTo("catcab", 540, 600, 1.5, L.l56.start - 0.3, 0.5, 880, "power2.inOut");
  expr("cc-mx", "happy", L.l56.start);
  pose("cc-mx", "head", 0, L.l56.start, 0.3);
  talk("cc-mx", "l56");
  ["cc-m", "cc-mx"].forEach((id) => blink(id, a, b));
}

/* S10 sunset: her head on his shoulder */
scene("sunset", cab("ss", { sunset: true }, F10.cat("ss-cat", 545, 710, 1.3)), { bg: "#3a2a5a" });
{
  const [a, b] = S.sunset;
  camSet("sunset", 540, 600, 1.4, a, 900);
  scroll("#ss-back .street", a, b, -2400);
  bump("sunset", a, b);
  gesture("ss-mx", "wheel", a, 0.01);
  T(`tl.set("#zm-sunset .cat-eyes", {scaleY:.15, transformOrigin:"50% 50%"}, ${r(a)});`);
  expr("ss-m", "happy", a);
  expr("ss-mx", "happy", a);
  T(`tl.to("#ss-m", {x:-260, duration:1.2, ease:"power2.inOut"}, ${r(W("голову") - 0.4)});`);
  pose("ss-m", "head", -18, W("голову"), 0.6);
  camTo("sunset", 460, 560, 2.0, L.l57.start + 1.0, 1.2, 860, "power2.inOut");
  talk("ss-m", "l58");
  talk("ss-mx", "l59");
  talk("ss-m", "l60");
  T(
    `tl.to("#ss-mx .body", {keyframes:[{y:-4,duration:.15},{y:0,duration:.15}], repeat:3}, ${r(L.l61.start)});`,
  );
  talk("ss-mx", "l61");
  expr("ss-m", "sad", L.l62.start);
  talk("ss-m", "l62");
  expr("ss-mx", "determined", L.l63.start);
  camTo("sunset", 400, 560, 2.3, L.l63.start, 1.5, 860, "sine.inOut");
  talk("ss-mx", "l63");
  camTo("sunset", 540, 560, 1.3, L.l63.end, b - L.l63.end, 880, "sine.inOut");
  ["ss-m", "ss-mx"].forEach((id) => blink(id, a, b));
}

/* S11 night: the checkpoint */
scene(
  "check",
  `${room(K.checkpoint())}
   <g id="ck-car">${P("ck-cart", MOSK({ lights: true }), -400, 1010, 420)}</g>
   ${C("ck-s", MASK({ prop: "flashlight" }), 760, 1020)}`,
  { bg: "#0a0d16" },
);
{
  const [a] = S.check;
  camSet("check", 540, 760, 1.2, a, 900);
  T(`tl.to("#ck-car", {x:620, duration:2.4, ease:"power2.out"}, ${r(a)});`);
  spinWheels("#ck-cart .wheel", a, a + 2.4, 900);
  expr("ck-s", "angry", a);
  T(`tl.set("#ck-s", {scaleX:-1, svgOrigin:"760 1020"}, ${r(a)});`);
  camTo("check", 760, 720, 2.0, L.l65.start - 0.3, 0.5, 880, "power2.inOut");
  gesture("ck-s", "pointR", L.l65.start, 0.2);
  talk("ck-s", "l65");
}
scene(
  "whisper",
  cab("wh", { night: true }, F10.cat("wh-cat", 545, 710, 1.3)) +
    `<path id="wh-beam" d="M-200 300 L500 520 L520 700Z" fill="#fff6c8" opacity="0"/>`,
  { bg: "#05060c" },
);
{
  const [a, b] = S.whisper;
  camSet("whisper", 540, 600, 1.6, a, 900);
  gesture("wh-mx", "wheel", a, 0.01);
  expr("wh-mx", "scared", a);
  expr("wh-m", "scared", a);
  T(
    `tl.fromTo("#wh-beam", {opacity:0}, {opacity:.3, duration:.4, immediateRender:false}, ${r(a)});`,
  );
  T(
    `tl.to("#wh-beam", {rotation:4, svgOrigin:"-200 300", duration:1.5, yoyo:true, repeat:3}, ${r(a)});`,
  );
  camTo("whisper", 400, 560, 2.3, L.l66.start - 0.2, 0.5, 860, "power2.inOut");
  pose("wh-mx", "head", 12, L.l66.start, 0.3);
  talk("wh-mx", "l66");
  camTo("whisper", 700, 560, 2.3, L.l67.start - 0.2, 0.3, 860, "power2.inOut");
  talk("wh-m", "l67");
  camTo("whisper", 400, 560, 2.3, L.l68.start - 0.2, 0.3, 860, "power2.inOut");
  expr("wh-mx", "happy", W("улыбайся") - 0.1);
  expr("wh-m", "happy", W("улыбайся") + 0.1);
  talk("wh-mx", "l68");
  ["wh-m", "wh-mx"].forEach((id) => blink(id, a, b));
}
scene(
  "face",
  `${room(K.checkpoint())}
   ${P("fc-cart", MOSK({ lights: true }), 220, 1010, 420)}
   ${C("fc-s", MASK({ prop: "flashlight" }), 760, 1020)}`,
  { bg: "#0a0d16" },
);
{
  const [a] = S.face;
  camSet("face", 760, 700, 2.4, a, 880);
  expr("fc-s", "angry", a);
  T(`tl.set("#fc-s", {scaleX:-1, svgOrigin:"760 1020"}, ${r(a)});`);
  T(
    `tl.to("#fc-s .head", {rotation:-12, transformOrigin:"50% 92%", duration:.5}, ${r(W("знакомое") - 0.2)});`,
  );
  talk("fc-s", "l69");
  expr("fc-s", "shock", W("танк", 1, L.l69.start));
}
scene("last", cab("ls", { night: true }, F10.cat("ls-cat", 545, 710, 1.3)), { bg: "#05060c" });
{
  const [a] = S.last;
  camSet("last", 360, 560, 2.6, a, 860);
  gesture("ls-mx", "wheel", a, 0.01);
  expr("ls-mx", "shock", a);
  expr("ls-m", "shock", a);
  T(`tl.set("#zm-last .cat-eyes", {scale:1.5, transformOrigin:"50% 50%"}, ${r(a)});`);
  talk("ls-mx", "l70");
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
  soldier1: ["СОЛДАТ", "#c9d48a"],
  soldier2: ["СОЛДАТ", "#c9d48a"],
  soldier3: ["КОМАНДИР (РАЦИЯ)", "#c9d48a"],
  granny: ["БАБУШКА", "#e0b3ff"],
  zina: ["БАБА ЗИНА", "#ff8fb8"],
  voice: ["РАДИО", "#9fd2ff"],
};
const HOT = new Set(
  "сладкая сдалась сова книг прогресс чёрная распущены побрился борода целоваться яйцо жених нравишься тушёнка водки тиран семья сердцу петровича морю москвич документы паспорт людмилы кот петрович коллектив плечо сказка найдут блокпост людмила улыбайся".split(
    " ",
  ),
);
const DANGER = new Set("сломаешь стоять танк ёб".split(" "));
const hook = `<div id="hook" class="clip toptitle" data-start="0.2" data-duration="${r(L.l01.start - 0.1)}" data-track-index="2" style="z-index:5"><div class="tt-s">${spl("ГЛЕБ", "hs")}</div><div class="tt-a">${spl("ЧАСТЬ 10", "ha")}</div></div>`;
T(`tl.set("#hook .hs, #hook .ha", {opacity:0}, 0);`);
T(
  `tl.fromTo("#hook .hs", {opacity:0, y:-40}, {opacity:1, y:0, duration:.3, stagger:.06, ease:"back.out(2)", immediateRender:false}, 0.25);`,
);
T(
  `tl.fromTo("#hook .ha", {opacity:0, y:-160, rotation:(i)=>[-14,10,-8,12,-10,8,-12][i%7], scale:1.6}, {opacity:1, y:0, rotation:0, scale:1, duration:.45, stagger:.07, ease:"back.out(1.8)", immediateRender:false}, 0.45);`,
);
T(
  `tl.to("#hook .ha, #hook .hs", {y:-60, opacity:0, duration:.22, stagger:.02, ease:"power2.in"}, ${r(L.l01.start - 0.35)});`,
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
const stamp = (id, t0, t1, text, color) => {
  T(
    `tl.fromTo("#${id} .clk", {scale:2.2, rotation:-12, opacity:0}, {scale:1, rotation:-4, opacity:1, duration:.32, ease:"power4.in", immediateRender:false}, ${r(t0)});`,
  );
  T(`tl.to("#${id} .clk", {opacity:0, duration:.25}, ${r(t1 - 0.25)});`);
  return `<div id="${id}" class="clip clock" data-start="${r(t0)}" data-duration="${r(t1 - t0)}" data-track-index="2" style="z-index:5"><div class="clk" style="color:${color}">${text}</div></div>`;
};
const stamps = [
  stamp("st-sk", L.l01.end, L.l02.start + 1.5, "СКРИП-СКРИП!", "#ffcf7a"),
  stamp("st-crash", W("сдалась"), W("сдалась") + 1.4, "ХРЯСЬ!", "#ff4a3d"),
  stamp("st-egg", W("яйцо") - 0.1, W("яйцо") + 1.2, "🥚", "#ffffff"),
].join("\n");
const title = `<div id="tbc" class="clip" data-start="${TITLE[0]}" data-duration="${r(TITLE[1] - TITLE[0])}" data-track-index="4" style="z-index:8"><div id="tbc-a">${spl("ПРОДОЛЖЕНИЕ СЛЕДУЕТ…", "ta")}</div><div id="tbc-b">ЧАСТЬ 11</div></div>`;
T(`tl.set("#tbc-a .ta", {opacity:0}, 0); tl.set("#tbc-b", {opacity:0}, 0);`);
T(`tl.to("#tbc-a .ta", {opacity:1, duration:.01, stagger:.045}, ${r(TITLE[0] + 0.3)});`);
T(
  `tl.fromTo("#tbc-b", {opacity:0, scale:2.2}, {opacity:1, scale:1, duration:.3, ease:"power4.in", immediateRender:false}, ${r(TITLE[0] + 1.4)});`,
);
T(
  `tl.to("#tbc-b", {keyframes:[{x:-14,textShadow:"8px 0 #00e5ff, -8px 0 #ff2a6a",duration:.05},{x:10,textShadow:"-6px 0 #00e5ff, 6px 0 #ff2a6a",duration:.05},{x:-4,textShadow:"3px 0 #00e5ff, -3px 0 #ff2a6a",duration:.05},{x:0,textShadow:"0px 0 #00e5ff, 0px 0 #ff2a6a",duration:.08}]}, ${r(TITLE[0] + 1.7)});`,
);
const card = `<div id="card" class="clip" data-start="${CARD_START}" data-duration="${CARD_DUR}" data-track-index="4" style="z-index:9"><div id="card-a">Больше таких анимаций<br/>в Telegram-канале</div><div id="card-b">${spl("@Claude306", "cb")}</div></div>`;
T(`tl.set("#card-a", {opacity:0}, 0); tl.set("#card-b .cb", {opacity:0}, 0);`);
T(
  `tl.fromTo("#card-a", {opacity:0, y:40}, {opacity:1, y:0, duration:.45, ease:"power3.out", immediateRender:false}, ${r(CARD_START + 0.1)});`,
);
T(
  `tl.fromTo("#card-b .cb", {opacity:0, y:70, scale:.6}, {opacity:1, y:0, scale:1, duration:.4, stagger:.05, ease:"back.out(2.2)", immediateRender:false}, ${r(CARD_START + 0.4)});`,
);
T(
  `tl.to("#card-b .cb", {keyframes:[{y:-14,duration:.15},{y:0,duration:.2}], stagger:.05}, ${r(CARD_START + 1.6)});`,
);

/* ───────────── audio ───────────── */
const SFX = "assets/sfx";
const sfx = [
  ["room_night", 0, S.night[1], 0.6],
  ["crank", 1.2, 1.4, 0.3],
  ["crank", 3.0, 1.4, 0.3],
  ["crank", L.l03.end, 1.4, 0.3],
  ["slam", W("сдалась"), 0.5, 1.3],
  ["room_day", S.morning[0], S.pack[1] - S.morning[0] > 26 ? 26 : S.pack[1] - S.morning[0], 0.4],
  ["fire", S.dress[0], 20, 0.3],
  ["fire", S.dress[0] + 20, 20, 0.3],
  ["fire", S.dress[0] + 40, S.pack[1] - S.dress[0] - 40, 0.3],
  ["pop", W("чёрная", 1, L.l12.start), 0.09, 1.0],
  ["room_day", S.car[0], S.car[1] - S.car[0], 0.5],
  ["engine", L.l33.end + 0.5, 24, 0.7],
  [
    "engine",
    L.l33.end + 24.5,
    S.sunset[1] - L.l33.end - 24.5 > 24 ? 24 : S.sunset[1] - L.l33.end - 24.5,
    0.7,
  ],
  [
    "engine",
    L.l33.end + 48.5,
    S.sunset[1] - L.l33.end - 48.5 > 24 ? 24 : S.sunset[1] - L.l33.end - 48.5,
    0.7,
  ],
  ["engine", L.l33.end + 72.5, S.sunset[1] - L.l33.end - 72.5, 0.7],
  ["buzz", L.l38.start - 0.2, 1.2, 0.4],
  ["door", S.gas[0] + 2.2, 0.35, 0.9],
  ["door", S.catcab[0] + 0.1, 0.35, 0.9],
  ["room_night", S.check[0], CUT - S.check[0], 0.6],
  ["engine", S.check[0], 3, 0.6],
].filter(([, , , v]) => v > 0);
const audio = [
  `<audio id="vo" class="clip" src="assets/vo.wav" data-start="0" data-duration="${r(L.l70.end + 0.1)}" data-track-index="10" data-volume="1"></audio>`,
  ...sfx.map(
    ([f, at, d, v], i) =>
      `<audio id="sfx${i}" class="clip" src="${SFX}/${f}.wav" data-start="${r(at)}" data-duration="${r(Math.min(d, CUT - at))}" data-track-index="${11 + i}" data-volume="${v}"></audio>`,
  ),
];

const html = `<!doctype html>
<html lang="ru">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=1080, height=1920" />
<title>Глеб — часть 10</title>
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
