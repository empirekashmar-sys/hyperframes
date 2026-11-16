// "Глеб — часть 11": through the checkpoint, a night on the roadside, the south, a café, the sea, Petrovich's house.
// Run from gleb/p11: node build.mjs → index.html (sfx shared via assets/sfx symlink).
import fs from "node:fs";
import * as R from "../art/rig.js";
import * as F10 from "../p10/art10.js";
import * as F11 from "./art11.js";
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
const CUT = r(L.l110.end + 1.8);
const TITLE = [CUT, r(CUT + 3.2)];
const CARD_START = r(TITLE[1] + 0.1);
const CARD_DUR = 3.6;
const TOTAL = r(CARD_START + CARD_DUR);
const S = {};
{
  const ends = [
    ["ck1", L.l03.end + 0.3],
    ["cab1", L.l07.end + 0.3],
    ["ck2", L.l11.end + 0.8],
    ["cab2", L.l23.end + 0.6],
    ["rock", L.l26.end + 0.8],
    ["morning", L.l30.end + 0.6],
    ["hood", L.l34.end + 0.6],
    ["south", L.l37.end + 0.5],
    ["sheep", L.l49.end + 0.8],
    ["steam", L.l59.end + 0.6],
    ["cafe", L.l79.end + 0.8],
    ["sea", L.l83.end + 0.6],
    ["beach", L.l92.end + 0.8],
    ["house", L.l97.end + 0.6],
    ["room", CUT],
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
const hearts = (id, x, y) =>
  `<g id="${id}" opacity="0">${[0, 1, 2].map((i) => `<path class="hrt" transform="translate(${x + i * 46 - 46} ${y - i * 24}) scale(${0.8 + i * 0.2})" d="M0 10 C-20 -10 -30 10 0 30 C30 10 20 -10 0 10Z" fill="#ff4a7a" stroke="#0b0d14" stroke-width="2"/>`).join("")}</g>`;
const heartsUp = (id, t0, t1) => {
  show(`#${id}`, t0);
  T(
    `tl.fromTo("#${id} .hrt", {y:20, opacity:0}, {y:-70, opacity:1, duration:1.2, stagger:.3, ease:"sine.out", immediateRender:false}, ${r(t0)});`,
  );
  T(`tl.to("#${id}", {opacity:0, duration:.4}, ${r(t1)});`);
};

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
const MXH = (o = {}) => MXS({ helmet: true, ...o });
const SOUTH = (s) => s.replace(/#f2f6fa/g, "#b8b078");
const cabH = (k, opts, extra = "", south = false) =>
  `<g id="${k}-back">${south ? SOUTH(room(F10.fields(opts))) : room(F10.fields(opts))}</g>
   ${extra}
   ${C(`${k}-mx`, MXH(), 330, 805)}
   ${C(`${k}-m`, MB(), 770, 805)}
   ${room(F2.cabFront({ lit: true }))}`;
const rock = (sel, t0, t1, deg = 1.6, step = 0.22) =>
  T(
    `tl.to("${sel}", {keyframes:${JSON.stringify(Array.from({ length: Math.max(2, Math.round((t1 - t0) / step)) }, (_, i) => ({ rotation: i % 2 ? -deg : deg, y: i % 2 ? 0 : -4, duration: step })).concat([{ rotation: 0, y: 0, duration: 0.2 }]))}, transformOrigin:"50% 100%"}, ${r(t0)});`,
  );

/* S1 the checkpoint, outside */
scene(
  "ck1",
  `${room(K.checkpoint())}
   ${P("c1-cart", MOSK({ lights: true }), 220, 1010, 420)}
   ${C("c1-s", MASK({ prop: "flashlight" }), 760, 1020)}`,
  { bg: "#0a0d16" },
);
{
  const [a] = S.ck1;
  camSet("ck1", 700, 720, 2.2, a, 880);
  expr("c1-s", "angry", a);
  T(`tl.set("#c1-s", {scaleX:-1, svgOrigin:"760 1020"}, ${r(a)});`);
  talk("c1-s", "l01");
  camTo("ck1", 560, 760, 1.5, L.l02.start, 0.6, 900, "power2.inOut");
  camTo("ck1", 760, 720, 2.3, L.l03.start - 0.2, 0.4, 880, "power2.out");
  gesture("c1-s", "pointR", L.l03.start, 0.2);
  talk("c1-s", "l03");
}

/* S2 inside: the cat hisses */
scene(
  "cab1",
  cabH("cb1", { night: true }, F10.cat("cb1-cat", 545, 705, 1.4)) +
    `<path id="cb1-beam" d="M-200 300 L500 520 L520 700Z" fill="#fff6c8" opacity=".25"/>`,
  { bg: "#05060c" },
);
{
  const [a, b] = S.cab1;
  camSet("cab1", 400, 560, 2.2, a, 860);
  gesture("cb1-mx", "wheel", a, 0.01);
  expr("cb1-mx", "scared", a);
  expr("cb1-m", "scared", a);
  T(`tl.set("#cb1-mx", {x:0}, ${r(a)});`);
  talk("cb1-mx", "l02");
  camTo("cab1", 545, 560, 2.6, L.l04.start - 0.2, 0.5, 860, "power2.inOut");
  T(
    `tl.to("#zm-cab1 .cb1-cat", {scale:1.25, transformOrigin:"50% 100%", duration:.25, ease:"back.out(3)"}, ${r(L.l04.start + 0.8)});`,
  );
  T(
    `tl.to("#zm-cab1 .cat-eyes", {scaleY:.4, transformOrigin:"50% 50%", duration:.2}, ${r(L.l04.start + 0.9)});`,
  );
  shake("#zm-cab1 .cb1-cat", L.l04.start + 1.1, 8, 4);
  camTo("cab1", 700, 560, 2.3, L.l07.start - 0.2, 0.4, 860, "power2.inOut");
  expr("cb1-m", "determined", L.l07.start);
  talk("cb1-m", "l07");
  ["cb1-m", "cb1-mx"].forEach((id) => blink(id, a, b));
}

/* S3 outside again: the radio call; the barrier lifts */
scene(
  "ck2",
  `${room(K.checkpoint())}
   <g id="c2-car">${P("c2-cart", MOSK({ lights: true }), 220, 1010, 420)}</g>
   ${C("c2-s", MASK({ prop: "flashlight" }), 760, 1020)}
   <g id="c2-s2w" opacity="0">${C("c2-s2", MASK({ prop: "radio" }), 980, 960)}</g>`,
  { bg: "#0a0d16" },
);
{
  const [a, b] = S.ck2;
  camSet("ck2", 760, 720, 2.2, a, 880);
  expr("c2-s", "shock", a);
  T(`tl.set("#c2-s", {scaleX:-1, svgOrigin:"760 1020"}, ${r(a)});`);
  show("#c2-s2w", L.l08.start - 0.3);
  expr("c2-s2", "angry", a);
  T(`tl.set("#c2-s2", {scaleX:-1, svgOrigin:"980 960"}, ${r(a)});`);
  gesture("c2-s2", "headR", L.l08.start, 0.2);
  camTo("ck2", 880, 700, 1.7, L.l08.start - 0.3, 0.5, 880, "power2.inOut");
  talk("c2-s2", "l08");
  camTo("ck2", 760, 720, 2.2, L.l09.start - 0.3, 0.4, 880, "power2.inOut");
  expr("c2-s", "angry", L.l09.start);
  gesture("c2-s", "wave", L.l09.start + 1.0, 0.3);
  talk("c2-s", "l09");
  camTo("ck2", 640, 760, 1.4, L.l10.start - 0.2, 0.6, 900, "power2.inOut");
  T(
    `tl.to("#zm-ck2 .barrier", {rotation:-80, svgOrigin:"700 771", duration:.8, ease:"power2.inOut"}, ${r(L.l11.start + 0.3)});`,
  );
  T(
    `tl.to("#c2-car", {x:1100, duration:${r(b - L.l11.start - 1.0)}, ease:"power1.in"}, ${r(L.l11.start + 1.0)});`,
  );
  spinWheels("#c2-cart .wheel", L.l11.start + 1.0, b, 900);
}

/* S4 night road: laughter, then the shoulder */
scene(
  "cab2",
  cabH("cb2", { night: true }, F10.cat("cb2-cat", 545, 705, 1.3)) +
    `<rect id="cb2-fade" x="-800" y="-800" width="2680" height="3520" fill="#000" opacity="0"/>`,
  { bg: "#05060c" },
);
{
  const [a, b] = S.cab2;
  camSet("cab2", 540, 600, 1.5, a, 900);
  const stop = W("заглушил") + 0.2;
  scroll("#cb2-back .street", a, stop, -1600);
  T(
    `tl.to("#sh-cab2", {keyframes:[{y:3,duration:.2},{y:0,duration:.2}], repeat:${Math.round((stop - a) / 0.4)}}, ${r(a)});`,
  );
  T(`tl.set("#zm-cab2 .cat-eyes", {scaleY:.15, transformOrigin:"50% 50%"}, ${r(a)});`);
  gesture("cb2-mx", "wheel", a, 0.01);
  expr("cb2-m", "happy", a);
  expr("cb2-mx", "happy", a);
  camTo("cab2", 700, 560, 2.2, L.l12.start - 0.2, 0.4, 860, "power2.inOut");
  talk("cb2-m", "l12");
  camTo("cab2", 400, 560, 2.2, L.l13.start - 0.2, 0.4, 860, "power2.inOut");
  talk("cb2-mx", "l13");
  camTo("cab2", 540, 600, 1.5, L.l14.start, 1.2, 900, "sine.inOut");
  // he pulls over
  gesture("cb2-mx", "rest", stop, 0.3);
  camTo("cab2", 700, 560, 2.2, L.l16.start - 0.2, 0.4, 860, "power2.inOut");
  expr("cb2-m", "neutral", L.l16.start);
  talk("cb2-m", "l16");
  camTo("cab2", 450, 560, 2.2, L.l17.start - 0.2, 0.4, 860, "power2.inOut");
  expr("cb2-mx", "happy", L.l17.start);
  talk("cb2-mx", "l17");
  camTo("cab2", 560, 560, 2.0, L.l18.start - 0.2, 0.4, 860, "power2.inOut");
  T(`tl.to("#cb2-mx", {x:150, duration:.5, ease:"power2.out"}, ${r(L.l18.start + 0.3)});`);
  pose("cb2-mx", "head", 12, L.l18.start + 0.3, 0.4);
  // "куда?!"
  expr("cb2-m", "angry", L.l19.start);
  gesture("cb2-m", "open", L.l19.start, 0.15);
  T(`tl.to("#cb2-mx", {x:40, duration:.25, ease:"power3.out"}, ${r(L.l19.start + 0.1)});`);
  talk("cb2-m", "l19");
  talk("cb2-mx", "l20");
  expr("cb2-m", "happy", L.l21.start);
  gesture("cb2-m", "rest", L.l21.start, 0.3);
  talk("cb2-m", "l21");
  T(
    `tl.to("#cb2-m .body", {keyframes:[{y:-4,duration:.12},{y:0,duration:.12}], repeat:3}, ${r(W("засмеялась"))});`,
  );
  camTo("cab2", 600, 560, 2.4, L.l23.start - 0.2, 0.5, 860, "power2.inOut");
  talk("cb2-m", "l23");
  T(`tl.to("#cb2-mx", {x:120, duration:.5}, ${r(L.l23.end)});`);
  T(`tl.to("#cb2-fade", {opacity:1, duration:.5}, ${r(b - 0.5)});`);
  ["cb2-m", "cb2-mx"].forEach((id) => blink(id, a, b));
}

/* S5 the night: the car rocks; the cat on the roof; a tractor */
scene(
  "rock",
  `<g>${P("rk-art", F11.steppe({ night: true }), -540, 1100, 2160)}</g>
   <g id="rk-car">${P("rk-cart", MOSK({ lights: false }), 330, 1000, 420)}
     <g class="rk-fog" opacity="0"><path d="M470 865 L496 840 H540 V880 H460Z M552 840 H600 L622 880 H552Z" fill="#e9eef5"/></g></g>
   ${F10.cat("rk-cat", 140, 1000, 0.8)}
   ${F11.tractor("rk-tr", -300, 1010)}
   ${hearts("rk-h", 540, 720)}
   <rect id="cb2-fade2" x="-800" y="-800" width="2680" height="3520" fill="#000" opacity="0"/>`,
  { bg: "#04060d" },
);
{
  const [a, b] = S.rock;
  camSet("rock", 540, 800, 1.3, a, 900);
  T(
    `tl.fromTo("#cb2-fade2", {opacity:1}, {opacity:0, duration:.5, immediateRender:false}, ${r(a)});`,
  );
  rock("#rk-car", a + 0.4, b - 0.3, 1.8, 0.22);
  T(`tl.to("#zm-rock .rk-fog", {opacity:.85, duration:3}, ${r(a + 1)});`);
  heartsUp("rk-h", a + 1.2, L.l24.end + 1.0);
  // the cat leaves for the roof
  T(
    `tl.to("#zm-rock .rk-cat", {keyframes:[{x:200, y:-40, duration:.6},{x:380, y:-180, duration:.5, ease:"power2.out"}]}, ${r(L.l25.start + 0.4)});`,
  );
  camTo("rock", 520, 760, 1.9, L.l25.start, 1.4, 880, "power2.inOut");
  // tractor, the driver crosses himself
  camTo("rock", 400, 800, 1.1, L.l26.start - 0.2, 0.8, 900, "power2.inOut");
  T(
    `tl.to("#zm-rock .rk-tr", {x:1500, duration:${r(b - L.l26.start)}, ease:"none"}, ${r(L.l26.start)});`,
  );
  spinWheels("#zm-rock .rk-tr .wheel", L.l26.start, b, 1080);
}

/* S6 morning: the misted windscreen */
scene("morning", cabH("mn", {}, F10.cat("mn-cat", 545, 705, 1.3), true) + F11.fog("mn-fog"), {
  bg: "#8fb4dc",
});
{
  const [a, b] = S.morning;
  camSet("morning", 540, 600, 1.4, a, 900);
  gesture("mn-mx", "rest", a, 0.01);
  expr("mn-mx", "tired", a);
  expr("mn-m", "happy", a);
  T(`tl.to("#zm-morning .mn-fog", {opacity:.25, duration:3}, ${r(L.l28.start)});`);
  camTo("morning", 400, 560, 2.2, L.l28.start - 0.2, 0.5, 860, "power2.inOut");
  talk("mn-mx", "l28");
  camTo("morning", 700, 560, 2.2, L.l29.start - 0.2, 0.4, 860, "power2.inOut");
  talk("mn-m", "l29");
  camTo("morning", 545, 560, 2.4, L.l29.end - 0.1, 0.4, 860, "power2.inOut");
  camTo("morning", 400, 560, 2.2, L.l30.start - 0.1, 0.4, 860, "power2.inOut");
  expr("mn-mx", "happy", L.l30.start);
  talk("mn-mx", "l30");
  ["mn-m", "mn-mx"].forEach((id) => blink(id, a, b));
}

/* S7 breakfast on the bonnet */
scene(
  "hood",
  `<g>${P("hd-art", F11.steppe(), -540, 1100, 2160)}</g>
   ${P("hd-cart", MOSK(), 300, 1000, 460)}
   ${C("hd-m", MB(), 300, 1060)}
   ${C("hd-mx", MXH(), 470, 1060)}
   ${F10.cat("hd-cat", 760, 1050, 0.7)}`,
  { bg: "#8fb4dc" },
);
{
  const [a, b] = S.hood;
  camSet("hood", 460, 800, 1.5, a, 900);
  expr("hd-m", "happy", a);
  expr("hd-mx", "happy", a);
  gesture("hd-m", "pointR", a, 0.01);
  camTo("hood", 300, 740, 2.2, L.l32.start - 0.2, 0.5, 880, "power2.inOut");
  talk("hd-m", "l32");
  camTo("hood", 470, 740, 2.2, L.l33.start - 0.2, 0.5, 880, "power2.inOut");
  talk("hd-mx", "l33");
  camTo("hood", 760, 900, 2.6, L.l34.start - 0.2, 0.5, 880, "power2.inOut");
  T(
    `tl.to("#zm-hood .hd-cat", {keyframes:[{y:6,duration:.2},{y:0,duration:.2}], repeat:6}, ${r(L.l34.start + 0.6)});`,
  );
  ["hd-m", "hd-mx"].forEach((id) => blink(id, a, b));
}

/* S8 south: no snow */
scene("south", cabH("so", {}, F10.cat("so-cat", 545, 705, 1.3), true), { bg: "#8fb4dc" });
{
  const [a, b] = S.south;
  camSet("south", 540, 600, 1.4, a, 900);
  scroll("#so-back .street", a, b, -1800);
  bump("south", a, b);
  gesture("so-mx", "wheel", a, 0.01);
  expr("so-m", "happy", a);
  expr("so-mx", "happy", a);
  camTo("south", 700, 560, 2.2, L.l36.start - 0.2, 0.4, 860, "power2.inOut");
  gesture("so-m", "pointR", L.l36.start + 0.2, 0.3);
  talk("so-m", "l36");
  camTo("south", 400, 560, 2.2, L.l37.start - 0.2, 0.4, 860, "power2.inOut");
  talk("so-mx", "l37");
  ["so-m", "so-mx"].forEach((id) => blink(id, a, b));
}

/* S9 a flock of sheep and a shepherd */
const SH = Array.from({ length: 9 }, (_, i) => [200 + i * 130 + (i % 2) * 30, 990 + (i % 3) * 20]);
scene(
  "sheep",
  `<g>${P("sp-art", F11.steppe(), -540, 1100, 2160)}</g>
   ${P("sp-cart", MOSK(), -80, 1000, 420)}
   ${C("sp-m", MB(), 120, 1070)}
   ${C("sp-mx", MXH(), 260, 1070)}
   <g id="sp-flock">${SH.map(([x, y], i) => F11.sheep(`sp-s${i % 3}`, x, y, 0.9)).join("")}</g>
   <g id="sp-shw">${F11.crook(930, 1060)}${C("sp-sh", R.grandpa({ brow: "neutral" }), 880, 1070)}</g>
   ${F11.cheese("sp-cheese", 760, 900)}
   ${F10.cat("sp-cat", 40, 860, 0.7)}`,
  { bg: "#8fb4dc" },
);
{
  const [a, b] = S.sheep;
  camSet("sheep", 540, 780, 1.1, a, 900);
  T(
    `tl.fromTo("#sp-flock", {x:-300}, {x:100, duration:${r(b - a)}, ease:"none", immediateRender:false}, ${r(a)});`,
  );
  T(
    `tl.to("#zm-sheep .sp-s0", {y:-6, duration:.25, yoyo:true, repeat:${Math.round((b - a) / 0.5)}}, ${r(a)});`,
  );
  T(
    `tl.to("#zm-sheep .sp-s1", {y:-6, duration:.3, yoyo:true, repeat:${Math.round((b - a) / 0.6)}}, ${r(a + 0.1)});`,
  );
  expr("sp-m", "neutral", a);
  expr("sp-mx", "angry", a);
  expr("sp-sh", "neutral", a);
  camTo("sheep", 260, 740, 2.0, L.l39.start - 0.2, 0.5, 880, "power2.inOut");
  gesture("sp-mx", "shrug", L.l39.start, 0.3);
  talk("sp-mx", "l39");
  gesture("sp-mx", "rest", L.l39.end, 0.3);
  camTo("sheep", 880, 720, 2.0, L.l40.start + 0.3, 0.8, 880, "power2.inOut");
  talk("sp-sh", "l41");
  camTo("sheep", 260, 740, 2.0, L.l42.start - 0.2, 0.4, 880, "power2.inOut");
  expr("sp-mx", "happy", L.l42.start);
  talk("sp-mx", "l42");
  camTo("sheep", 880, 720, 2.0, L.l43.start - 0.2, 0.4, 880, "power2.inOut");
  gesture("sp-sh", "pointR", L.l43.start + 0.3, 0.3);
  talk("sp-sh", "l43");
  camTo("sheep", 120, 740, 2.2, L.l44.start - 0.2, 0.4, 880, "power2.inOut");
  expr("sp-m", "happy", L.l44.start);
  gesture("sp-m", "cheer", L.l44.start + 0.1, 0.3);
  talk("sp-m", "l44");
  gesture("sp-m", "rest", L.l44.end, 0.3);
  camTo("sheep", 560, 740, 1.4, L.l45.start - 0.2, 0.5, 880, "power2.inOut");
  expr("sp-sh", "happy", L.l45.start);
  talk("sp-sh", "l45");
  talk("sp-mx", "l46");
  expr("sp-m", "happy", L.l47.start);
  talk("sp-m", "l47");
  T(`tl.set("#zm-sheep .sp-cheese", {opacity:1}, ${r(L.l48.start + 0.8)});`);
  T(
    `tl.fromTo("#zm-sheep .sp-cheese", {x:100}, {x:-450, duration:.8, ease:"power2.inOut", immediateRender:false}, ${r(L.l48.start + 0.8)});`,
  );
  talk("sp-sh", "l48");
  // the cat glares; the sheep scatter
  camTo("sheep", 300, 820, 1.3, L.l49.start + 1.0, 0.6, 900, "power2.inOut");
  T(
    `tl.to("#zm-sheep .sp-cat", {scale:1.2, transformOrigin:"50% 100%", duration:.2, ease:"back.out(3)"}, ${r(W("взглядом") - 0.2)});`,
  );
  T(
    `tl.to("#sp-flock", {y:-60, opacity:0, duration:.8, ease:"power2.in"}, ${r(W("разбежались"))});`,
  );
  ["sp-m", "sp-mx", "sp-sh"].forEach((id) => blink(id, a, b));
}

/* S10 steam from the radiator: scarf, chewing gum and an honest word */
scene(
  "steam",
  `<g>${P("sm-art", F11.steppe(), -540, 1100, 2160)}</g>
   ${P("sm-cart", MOSK(), 260, 1000, 460)}
   <g id="sm-steam">${[0, 1, 2, 3].map((k) => `<circle class="puff" cx="${660 + (k % 2) * 30}" cy="${860 - k * 30}" r="${30 + k * 10}" fill="#f2f6fa" opacity=".8"/>`).join("")}</g>
   ${C("sm-m", MB(), 220, 1070)}
   ${C("sm-mx", MXH(), 780, 1070)}`,
  { bg: "#8fb4dc" },
);
{
  const [a, b] = S.steam;
  camSet("steam", 600, 800, 1.3, a, 900);
  T(
    `tl.fromTo("#zm-steam .puff", {y:0, scale:.8, opacity:.8, transformOrigin:"50% 50%"}, {y:-260, scale:1.6, opacity:0, duration:1.6, stagger:{each:.4, repeat:${Math.round((W("честным") - a) / 1.6)}}, immediateRender:false}, ${r(a)});`,
  );
  expr("sm-mx", "shock", a);
  expr("sm-m", "scared", a);
  camTo("steam", 780, 740, 2.2, L.l51.start - 0.2, 0.4, 880, "power2.out");
  talk("sm-mx", "l51");
  camTo("steam", 220, 740, 2.2, L.l52.start - 0.2, 0.4, 880, "power2.inOut");
  talk("sm-m", "l52");
  camTo("steam", 780, 740, 2.2, L.l53.start - 0.2, 0.4, 880, "power2.inOut");
  expr("sm-mx", "determined", L.l53.start);
  talk("sm-mx", "l53");
  camTo("steam", 220, 740, 2.4, L.l54.start - 0.2, 0.3, 880, "power2.out");
  expr("sm-m", "angry", L.l54.start);
  gesture("sm-m", "fist", L.l54.start, 0.2);
  talk("sm-m", "l54");
  camTo("steam", 780, 740, 2.2, L.l55.start - 0.2, 0.4, 880, "power2.inOut");
  expr("sm-mx", "happy", L.l55.start);
  gesture("sm-mx", "open", L.l55.start, 0.3);
  talk("sm-mx", "l55");
  gesture("sm-m", "rest", L.l55.start, 0.3);
  camTo("steam", 600, 800, 1.4, L.l56.start - 0.2, 0.6, 900, "power2.inOut");
  T(`tl.to("#sm-steam", {opacity:0, duration:.5}, ${r(W("честным") + 0.4)});`);
  camTo("steam", 780, 740, 2.2, L.l57.start - 0.2, 0.4, 880, "power2.inOut");
  expr("sm-mx", "happy", L.l57.start);
  talk("sm-mx", "l57");
  camTo("steam", 220, 740, 2.2, L.l58.start - 0.2, 0.4, 880, "power2.inOut");
  expr("sm-m", "happy", L.l58.start);
  talk("sm-m", "l58");
  camTo("steam", 780, 740, 2.2, L.l59.start - 0.2, 0.4, 880, "power2.inOut");
  expr("sm-mx", "sad", L.l59.start);
  gesture("sm-mx", "shrug", L.l59.start, 0.3);
  talk("sm-mx", "l59");
  ["sm-m", "sm-mx"].forEach((id) => blink(id, a, b));
}

/* S11 the shashlik café: a dance to a crackling radio */
scene(
  "cafe",
  `${room(F11.cafe())}
   ${F11.grill(940, 700)}
   ${C("cf-o", R.grandpa({ brow: "happy" }), 860, 1060)}
   <g id="cf-mw">${C("cf-m", MB(), 300, 1060)}</g>
   <g id="cf-mxw">${C("cf-mx", MXH(), 480, 1060)}</g>
   <g id="cf-cat" opacity="0">${F10.cat("cf-catg", 0, 1060, 0.7)}<path d="M50 990 q20 -10 30 10 q-10 10 -30 0z" fill="#e9b87a" stroke="#0b0d14" stroke-width="2"/></g>
   ${hearts("cf-h", 400, 600)}`,
  { bg: "#c97a4a" },
);
{
  const [a, b] = S.cafe;
  camSet("cafe", 560, 740, 1.3, a, 900);
  T(
    `tl.fromTo("#zm-cafe .gsmoke", {y:0, opacity:.6}, {y:-120, opacity:0, duration:1.4, stagger:{each:.4, repeat:${Math.round((b - a) / 1.4)}}, immediateRender:false}, ${r(a)});`,
  );
  expr("cf-o", "happy", a);
  expr("cf-m", "happy", a);
  expr("cf-mx", "happy", a);
  camTo("cafe", 860, 720, 2.0, L.l61.start - 0.2, 0.5, 880, "power2.inOut");
  gesture("cf-o", "open", L.l61.start, 0.3);
  talk("cf-o", "l61");
  camTo("cafe", 300, 720, 2.2, L.l62.start - 0.2, 0.4, 880, "power2.inOut");
  talk("cf-m", "l62");
  camTo("cafe", 860, 720, 2.2, L.l63.start - 0.2, 0.4, 880, "power2.inOut");
  talk("cf-o", "l63");
  camTo("cafe", 480, 720, 2.2, L.l64.start - 0.2, 0.4, 880, "power2.inOut");
  expr("cf-mx", "shock", L.l64.start);
  talk("cf-mx", "l64");
  camTo("cafe", 860, 720, 2.2, L.l65.start - 0.2, 0.4, 880, "power2.inOut");
  talk("cf-o", "l65");
  expr("cf-mx", "happy", L.l65.end);
  // the radio plays
  camTo("cafe", 800, 300, 2.0, L.l66.start + 1.2, 1.2, 880, "power2.inOut");
  T(`tl.to("#zm-cafe .notes", {opacity:1, duration:.3}, ${r(L.l66.start + 2.0)});`);
  T(
    `tl.to("#zm-cafe .notes", {y:-20, duration:.6, yoyo:true, repeat:${Math.round((L.l76.end - L.l66.start) / 0.6)}}, ${r(L.l66.start + 2.0)});`,
  );
  camTo("cafe", 390, 720, 2.0, L.l67.start - 0.3, 0.6, 880, "power2.inOut");
  talk("cf-m", "l67");
  expr("cf-mx", "shock", L.l68.start);
  talk("cf-mx", "l68");
  expr("cf-m", "happy", L.l69.start);
  talk("cf-m", "l69");
  expr("cf-mx", "sad", L.l70.start);
  talk("cf-mx", "l70");
  talk("cf-m", "l71");
  // the dance
  T(`tl.to("#cf-mw", {x:60, duration:.6}, ${r(L.l72.start)});`);
  T(`tl.to("#cf-mxw", {x:-60, duration:.6}, ${r(L.l72.start)});`);
  ["cf-m", "cf-mx"].forEach((id) => {
    expr(id, "happy", L.l72.start);
    pose(id, "armL", id === "cf-m" ? 0 : -70, L.l72.start + 0.4, 0.4);
    pose(id, "armR", id === "cf-m" ? 70 : 0, L.l72.start + 0.4, 0.4);
  });
  T(
    `tl.to("#cf-mw, #cf-mxw", {keyframes:${JSON.stringify(Array.from({ length: 12 }, (_, i) => ({ rotation: i % 2 ? -4 : 4, x: i % 2 ? "-=14" : "+=14", duration: 0.42 })))}, transformOrigin:"50% 100%"}, ${r(L.l72.start + 0.8)});`,
  );
  camTo("cafe", 390, 720, 1.6, L.l72.start, 1.2, 880, "power2.inOut");
  heartsUp("cf-h", L.l72.end + 0.5, L.l76.end);
  camTo("cafe", 860, 720, 2.0, L.l73.start - 0.2, 0.4, 880, "power2.inOut");
  talk("cf-o", "l73");
  camTo("cafe", 390, 700, 2.4, L.l74.start - 0.2, 0.5, 880, "power2.inOut");
  talk("cf-mx", "l74");
  talk("cf-m", "l75");
  talk("cf-mx", "l76");
  // the cat steals a chicken
  show("#cf-cat", L.l77.start + 2.0);
  T(
    `tl.fromTo("#cf-cat", {x:1100}, {x:-300, duration:1.6, ease:"none", immediateRender:false}, ${r(L.l77.start + 2.0)});`,
  );
  camTo("cafe", 560, 860, 1.3, L.l77.start + 1.8, 0.5, 900, "power2.inOut");
  camTo("cafe", 860, 720, 2.2, L.l78.start - 0.2, 0.3, 880, "power2.out");
  expr("cf-o", "angry", L.l78.start);
  gesture("cf-o", "fist", L.l78.start, 0.2);
  talk("cf-o", "l78");
  camTo("cafe", 420, 720, 1.8, L.l79.start - 0.2, 0.3, 880, "power2.out");
  expr("cf-mx", "happy", L.l79.start);
  talk("cf-mx", "l79");
  T(`tl.to("#cf-mw, #cf-mxw", {x:-900, duration:.8, ease:"power2.in"}, ${r(L.l79.end)});`);
  ["cf-m", "cf-mx", "cf-o"].forEach((id) => blink(id, a, b));
}

/* S12 the sea from the hill */
scene(
  "sea",
  `${room(F11.seaHill())}
   ${C("se-m", MB(), 420, 1060)}
   ${C("se-mx", MXH(), 620, 1060)}`,
  { bg: "#9fb8d8" },
);
{
  const [a, b] = S.sea;
  camSet("sea", 540, 1000, 1.6, a, 900);
  camTo("sea", 540, 560, 1.1, L.l81.start - 0.5, 2.4, 900, "power2.inOut");
  T(
    `tl.to("#zm-sea .wave", {x:20, duration:1.2, yoyo:true, repeat:${Math.round((b - a) / 1.2)}}, ${r(a)});`,
  );
  expr("se-m", "cry", L.l82.start - 0.2);
  expr("se-mx", "happy", a);
  camTo("sea", 420, 720, 2.2, L.l82.start - 0.2, 0.6, 880, "power2.inOut");
  talk("se-m", "l82");
  camTo("sea", 620, 720, 2.2, L.l83.start - 0.2, 0.4, 880, "power2.inOut");
  talk("se-mx", "l83");
  ["se-m", "se-mx"].forEach((id) => blink(id, a, b));
}

/* S13 the pebble beach */
scene(
  "beach",
  `${room(F11.beach())}
   ${C("bh-m", MB(), 380, 1060)}
   ${C("bh-mx", MXH(), 620, 1060)}
   <circle id="bh-stone" cx="680" cy="860" r="8" fill="#6a6458" opacity="0"/>
   <g id="bh-splash" opacity="0"><path d="M820 640 l-14 -30 M830 638 l0 -36 M840 640 l14 -30" stroke="#f2f6fa" stroke-width="6"/></g>`,
  { bg: "#9fb8d8" },
);
{
  const [a, b] = S.beach;
  camSet("beach", 540, 760, 1.3, a, 900);
  T(
    `tl.to("#zm-beach .wave", {x:30, duration:1.5, yoyo:true, repeat:${Math.round((b - a) / 1.5)}}, ${r(a)});`,
  );
  T(
    `tl.to("#zm-beach .surf", {y:12, duration:1.8, yoyo:true, repeat:${Math.round((b - a) / 1.8)}}, ${r(a)});`,
  );
  expr("bh-m", "happy", a);
  expr("bh-mx", "happy", a);
  camTo("beach", 620, 720, 2.0, L.l85.start - 0.2, 0.5, 880, "power2.inOut");
  talk("bh-mx", "l85");
  const throwT = W("три", 1, L.l85.start);
  pose("bh-mx", "armR", -150, throwT - 0.4, 0.3);
  pose("bh-mx", "armR", -20, throwT, 0.15, "power4.in");
  T(`tl.set("#bh-stone", {opacity:1}, ${r(throwT)});`);
  T(
    `tl.to("#bh-stone", {keyframes:[{x:80, y:-140, duration:.35, ease:"power1.out"},{x:150, y:-220, duration:.35, ease:"power1.in"}]}, ${r(throwT)});`,
  );
  T(`tl.set("#bh-stone", {opacity:0}, ${r(throwT + 0.7)});`);
  T(
    `tl.fromTo("#bh-splash", {opacity:1, y:0}, {opacity:0, y:-20, duration:.5, immediateRender:false}, ${r(throwT + 0.7)});`,
  );
  camTo("beach", 700, 680, 1.6, throwT, 0.6, 880, "power2.out");
  camTo("beach", 380, 720, 2.2, L.l87.start - 0.2, 0.3, 880, "power2.out");
  talk("bh-m", "l87");
  camTo("beach", 620, 720, 2.2, L.l88.start - 0.2, 0.3, 880, "power2.out");
  expr("bh-mx", "sad", L.l88.start);
  talk("bh-mx", "l88");
  // she stands in the wind
  camTo("beach", 400, 700, 1.8, L.l89.start, 2.0, 880, "sine.inOut");
  T(
    `tl.to("#bh-m .body", {rotation:2, svgOrigin:"100 410", duration:1, yoyo:true, repeat:5}, ${r(L.l89.start)});`,
  );
  expr("bh-m", "sad", L.l90.start);
  camTo("beach", 380, 720, 2.3, L.l90.start - 0.2, 0.5, 880, "power2.inOut");
  talk("bh-m", "l90");
  camTo("beach", 620, 720, 2.3, L.l91.start - 0.2, 0.4, 880, "power2.inOut");
  expr("bh-mx", "sad", L.l91.start);
  talk("bh-mx", "l91");
  camTo("beach", 380, 720, 2.3, L.l92.start - 0.2, 0.4, 880, "power2.inOut");
  talk("bh-m", "l92");
  ["bh-m", "bh-mx"].forEach((id) => blink(id, a, b));
}

/* S14 Petrovich's house and the note */
scene(
  "house",
  `${room(F11.house())}
   <g id="hs-car">${P("hs-cart", MOSK(), -600, 1000, 420)}</g>
   <g id="hs-pp" opacity="0">${C("hs-m", MB(), 340, 1060)}${C("hs-mx", MXH(), 720, 1060)}</g>`,
  { bg: "#e9a87a" },
);
{
  const [a, b] = S.house;
  camSet("house", 540, 640, 1.1, a, 900);
  T(`tl.to("#hs-car", {x:500, duration:2.0, ease:"power2.out"}, ${r(a)});`);
  spinWheels("#hs-cart .wheel", a, a + 2.0, 720);
  T(`tl.to("#hs-car", {opacity:0, duration:.4}, ${r(L.l94.start - 0.6)});`);
  show("#hs-pp", L.l94.start - 0.4);
  expr("hs-m", "neutral", a);
  expr("hs-mx", "neutral", a);
  camTo("house", 540, 705, 3.2, L.l94.start + 1.0, 0.8, 880, "power2.inOut");
  camTo("house", 720, 720, 2.2, L.l95.start + 1.0, 0.6, 880, "power2.inOut");
  talk("hs-mx", "l95");
  expr("hs-mx", "happy", L.l96.start);
  gesture("hs-mx", "cheer", L.l96.start + 0.2, 0.3);
  talk("hs-mx", "l96");
  gesture("hs-mx", "rest", L.l96.end, 0.3);
  camTo("house", 340, 720, 2.2, L.l97.start - 0.2, 0.4, 880, "power2.inOut");
  expr("hs-m", "happy", L.l97.start);
  talk("hs-m", "l97");
  walk("hs-m", L.l97.end, b, 120, -30, 0.3, 20);
  walk("hs-mx", L.l97.end, b, -150, -30, 0.3, 20);
  ["hs-m", "hs-mx"].forEach((id) => blink(id, a, b));
}

/* S15 inside: the question */
scene(
  "room",
  `${room(F11.room())}
   <g id="rm-m0">${C("rm-mb", MB(), 160, 1060)}</g>
   <g id="rm-m1" opacity="0">${C("rm-mt", R.masha({ outfit: "tee" }), 540, 850)}</g>
   <g id="rm-mx0">${C("rm-mxh", MXH(), 860, 1060)}</g>
   <g id="rm-mx1" opacity="0">${C("rm-mxs", MXS(), 860, 1060)}</g>
   ${room(F11.sofaFront())}
   ${F10.cat("rm-cat", 980, 1060, 0.7)}
   <rect id="rm-jacket" x="40" y="840" width="90" height="40" rx="8" fill="#1d1d22" stroke="#0b0d14" stroke-width="2" opacity="0"/>`,
  { bg: "#ece6d8" },
);
{
  const [a, b] = S.room;
  camSet("room", 540, 620, 1.1, a, 900);
  camTo("room", 300, 500, 1.5, a + 0.4, L.l98.end - a, 900, "sine.inOut");
  expr("rm-mb", "neutral", a);
  expr("rm-mxh", "happy", a);
  camTo("room", 860, 720, 2.0, L.l99.start - 0.2, 0.5, 880, "power2.inOut");
  gesture("rm-mxh", "pointR", L.l99.start + 0.3, 0.3);
  T(`tl.set("#rm-mx0", {scaleX:-1, svgOrigin:"860 1060"}, ${r(L.l99.start + 0.2)});`);
  talk("rm-mxh", "l99");
  T(`tl.set("#rm-mx0", {scaleX:1, svgOrigin:"860 1060"}, ${r(L.l99.end)});`);
  gesture("rm-mxh", "rest", L.l99.end, 0.3);
  camTo("room", 160, 720, 2.0, L.l100.start - 0.2, 0.4, 880, "power2.inOut");
  expr("rm-mb", "tired", L.l100.start);
  talk("rm-mb", "l100");
  // she takes off the jacket and boots and sits down
  T(`tl.set("#rm-jacket", {opacity:1}, ${r(W("куртку", 1, L.l101.start))});`);
  hide("#rm-m0", W("куртку", 1, L.l101.start));
  show("#rm-m1", W("куртку", 1, L.l101.start));
  T(
    `tl.fromTo("#rm-m1", {x:-380, y:160}, {x:0, y:0, duration:1.4, ease:"power2.inOut", immediateRender:false}, ${r(W("куртку", 1, L.l101.start))});`,
  );
  expr("rm-mt", "tired", a);
  camTo("room", 540, 700, 1.7, L.l101.start + 0.6, 1.4, 880, "power2.inOut");
  // the cat on her lap
  T(
    `tl.to("#zm-room .rm-cat", {keyframes:[{x:-200, y:-60, duration:.4},{x:-420, y:-250, duration:.4, ease:"power2.out"}]}, ${r(L.l102.start + 0.4)});`,
  );
  expr("rm-mt", "happy", L.l102.start + 1.0);
  camTo("room", 860, 720, 2.0, L.l103.start - 0.2, 0.4, 880, "power2.inOut");
  talk("rm-mxh", "l103");
  // silence... the question
  camTo("room", 540, 700, 2.4, L.l104.start, 1.4, 880, "sine.inOut");
  expr("rm-mt", "sad", L.l104.start + 1.0);
  talk("rm-mt", "l105");
  camTo("room", 860, 720, 2.4, L.l106.start - 0.2, 0.3, 880, "power2.out");
  expr("rm-mxh", "shock", L.l106.start);
  talk("rm-mxh", "l106");
  camTo("room", 540, 700, 2.4, L.l107.start - 0.2, 0.4, 880, "power2.inOut");
  talk("rm-mt", "l107");
  expr("rm-mt", "cry", L.l108.start);
  talk("rm-mt", "l108");
  // he freezes, takes off the cap, rubs his bald head
  camTo("room", 860, 700, 2.6, L.l109.start - 0.2, 0.6, 880, "power2.inOut");
  hide("#rm-mx0", W("шапку") - 0.1);
  show("#rm-mx1", W("шапку") - 0.1);
  expr("rm-mxs", "scared", a);
  gesture("rm-mxs", "headR", W("потёр") - 0.1, 0.3);
  T(
    `tl.to("#rm-mxs .armR-lo", {keyframes:[{rotation:-70,duration:.2},{rotation:-100,duration:.2},{rotation:-70,duration:.2},{rotation:-100,duration:.2}], svgOrigin:"0 0"}, ${r(W("потёр") + 0.2)});`,
  );
  gesture("rm-mxs", "rest", L.l110.start, 0.3);
  camTo("room", 860, 690, 3.0, L.l110.start - 0.2, b - L.l110.start, 880, "sine.in");
  talk("rm-mxs", "l110");
  ["rm-mb", "rm-mt", "rm-mxh", "rm-mxs"].forEach((id) => blink(id, a, b));
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
  shepherd: ["ПАСТУХ", "#e0c98a"],
  owner: ["ХОЗЯИН КАФЕ", "#ffb38a"],
};
const HOT = new Set(
  "сериал ветеран кот проезжайте сосиска насладиться жизнью давай туда-сюда крышу перекрестился подвеска учится капоте приключение юг овец сыр радиатор лосины шарф жвачкой танцевали зиной любовь лучшее танка курицу газуем море обещал мастер петровича записка дома между нами вместе сказать".split(
    " ",
  ),
);
const DANGER = new Set("блять бешеный ёб взорвался".split(" "));
const hook = `<div id="hook" class="clip toptitle" data-start="0.2" data-duration="${r(L.l01.start - 0.1)}" data-track-index="2" style="z-index:5"><div class="tt-s">${spl("ГЛЕБ", "hs")}</div><div class="tt-a">${spl("ЧАСТЬ 11", "ha")}</div></div>`;
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
  stamp("st-hiss", L.l04.start + 0.8, L.l05.end, "ШШШ!", "#ffb02e"),
  stamp("st-rock", L.l24.start + 0.8, L.l24.end + 0.8, "СКРИП-СКРИП!", "#ffcf7a"),
  stamp("st-sea", W("море", 1, L.l81.start) - 0.1, L.l81.end + 0.6, "МОРЕ!", "#9fd2ff"),
].join("\n");
const title = `<div id="tbc" class="clip" data-start="${TITLE[0]}" data-duration="${r(TITLE[1] - TITLE[0])}" data-track-index="4" style="z-index:8"><div id="tbc-a">${spl("ПРОДОЛЖЕНИЕ СЛЕДУЕТ…", "ta")}</div><div id="tbc-b">ЧАСТЬ 12</div></div>`;
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
  ["room_night", 0, S.cab1[1], 0.5],
  ["buzz", L.l04.start + 0.8, 1.2, 0.6],
  ["buzz", L.l08.start - 0.3, 1.2, 0.4],
  ["engine", L.l11.start + 0.6, S.cab2[0] + (W("заглушил") - S.cab2[0]) - L.l11.start, 0.6],
  ["room_night", S.cab2[0], S.rock[1] - S.cab2[0], 0.5],
  ["crank", L.l24.start + 0.5, 1.4, 0.3],
  ["crank", L.l24.start + 2.2, 1.4, 0.3],
  ["crank", L.l25.start + 1.0, 1.4, 0.3],
  ["truck", L.l26.start, 6, 0.5],
  ["room_day", S.morning[0], 26, 0.4],
  ["engine", S.south[0], S.south[1] - S.south[0], 0.6],
  ["room_day", S.sheep[0], 26, 0.4],
  ["buzz", S.steam[0], 1.2, 0.8],
  ["fire", S.cafe[0], 20, 0.3],
  ["waltz", L.l66.start + 1.6, 9.7, 0.55],
  ["waltz", L.l66.start + 11.3, 9.7, 0.55],
  ["waltz", L.l66.start + 21.0, Math.max(0.5, L.l76.end - L.l66.start - 21.0), 0.45],
  ["engine", S.sea[0], 3, 0.5],
  ["room_day", S.beach[0], S.beach[1] - S.beach[0], 0.5],
  ["pop", W("три", 1, L.l85.start) + 0.7, 0.09, 1.0],
  ["engine", S.house[0], 2.2, 0.5],
  ["door", S.room[0] + 0.1, 0.35, 0.9],
  ["room_day", S.room[0], CUT - S.room[0], 0.35],
].filter(([, , , v]) => v > 0);
const audio = [
  `<audio id="vo" class="clip" src="assets/vo.wav" data-start="0" data-duration="${r(L.l110.end + 0.1)}" data-track-index="10" data-volume="1"></audio>`,
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
<title>Глеб — часть 11</title>
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
