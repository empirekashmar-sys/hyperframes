// "Глеб — часть 4": captured; Ded Maxim slips away and gets back in his tank.
// Run from gleb/p3: node build.mjs → index.html (sfx shared via assets/sfx symlink).
import fs from "node:fs";
import * as A from "../art/art.js";
import * as R from "../art/rig.js";
import * as K from "../p3/art3.js";
import * as F from "./art4.js";

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
const CUT = r(L.l16.end + 1.0);
const TITLE = [CUT, r(CUT + 3.2)];
const CARD_START = r(TITLE[1] + 0.1);
const CARD_DUR = 3.6;
const TOTAL = r(CARD_START + CARD_DUR);
const S = {
  door: [0, r(L.l03.end + 0.6)],
  flat: [r(L.l03.end + 0.6), r(L.l06.end + 0.6)],
  stairs: [r(L.l06.end + 0.6), r(L.l09.end + 0.9)],
  yard: [r(L.l09.end + 0.9), r(L.l13.end + 0.5)],
  truck: [r(L.l13.end + 0.5), r(L.l15.end + 1.0)],
  tank: [r(L.l15.end + 1.0), CUT],
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
const GLEB = (o = {}) => R.gleb({ injured: true, ...o });
const spinWheels = (sel, t0, t1, deg = 1440) =>
  T(
    `tl.to("${sel}", {rotation:"+=${deg}", transformOrigin:"50% 50%", duration:${r(t1 - t0)}, ease:"none"}, ${r(t0)});`,
  );

/* soldiers face left: mirror them around their feet */
const faceLeft = (id, cx, foot, at) =>
  T(`tl.set("#${id}", {scaleX:-1, svgOrigin:"${cx} ${foot}"}, ${r(at)});`);
const MASK = (o = {}) => R.soldier({ mask: true, ...o });

/* S1 the door bursts open */
scene(
  "door",
  `${room(K.corridor10())}
   ${C("dr-o", R.sonOld(), 220, 1060)}
   ${C("dr-m", R.masha({ prop: "bag" }), 360, 1040)}
   ${C("dr-y", R.sonYoung(), 450, 1060)}
   ${C("dr-g", GLEB(), 570, 1000)}
   <g id="dr-s1" opacity="0">${C("dr-s1r", MASK({ prop: "flashlight" }), 760, 990)}</g>
   <g id="dr-s2" opacity="0">${C("dr-s2r", MASK(), 890, 1010)}</g>
   <rect id="dr-flash" x="-500" y="-500" width="2080" height="2920" fill="#fff6c8" opacity="0"/>`,
  { bg: "#141820" },
);
{
  const [a, b] = S.door;
  camSet("door", 620, 560, 1.6, a, 880);
  T(`tl.set("#zm-door .door", {scaleX:.35, svgOrigin:"640 580"}, ${r(a)});`);
  ["dr-g", "dr-m", "dr-o", "dr-y"].forEach((id) => expr(id, "scared", a));
  T(
    `tl.to("#zm-door .door", {scaleX:.02, svgOrigin:"640 580", duration:.12, ease:"power4.in"}, ${r(a + 0.15)});`,
  );
  T(
    `tl.fromTo("#dr-flash", {opacity:.85}, {opacity:0, duration:.5, immediateRender:false}, ${r(a + 0.27)});`,
  );
  shake("#sh-door", a + 0.27, 8, 14);
  faceLeft("dr-s1r", 760, 990, a);
  faceLeft("dr-s2r", 890, 1010, a);
  T(
    `tl.set("#dr-s1", {opacity:1, x:60}, ${r(a + 0.3)}); tl.set("#dr-s2", {opacity:1, x:60}, ${r(a + 0.45)});`,
  );
  walk("dr-s1r", a + 0.3, a + 0.9, 0, 0, 0.18, 26);
  walk("dr-s2r", a + 0.45, a + 1.05, 0, 0, 0.18, 26);
  T(`tl.to("#dr-s1, #dr-s2", {x:0, duration:.6, ease:"power2.out", stagger:.15}, ${r(a + 0.3)});`);
  ["dr-s1r", "dr-s2r"].forEach((id) => expr(id, "angry", a));
  camTo("door", 820, 560, 2.0, L.l01.start - 0.2, 0.5, 880, "power2.out");
  gesture("dr-s1r", "pointR", L.l01.start, 0.2);
  talk("dr-s1r", "l01");
  ["dr-m", "dr-o"].forEach((id) => gesture(id, "headBoth", W("руки") + 0.1, 0.3));
  // Gleb shields his family
  camTo("door", 480, 580, 1.8, L.l02.start - 0.15, 0.45, 880, "power2.inOut");
  gesture("dr-g", "open", L.l02.start, 0.25);
  T(`tl.to("#dr-g", {x:30, duration:.3}, ${r(L.l02.start)});`);
  talk("dr-g", "l02");
  camTo("door", 860, 580, 2.0, L.l03.start - 0.15, 0.4, 880, "power2.inOut");
  gesture("dr-s2r", "pointR", L.l03.start, 0.2);
  talk("dr-s2r", "l03");
  gesture("dr-g", "headBoth", L.l03.end - 0.3, 0.3);
  T(
    `tl.to("#dr-g, #dr-m, #dr-o, #dr-y", {x:"-=40", duration:.4, stagger:.05}, ${r(L.l03.end - 0.3)});`,
  );
  ["dr-g", "dr-m", "dr-o", "dr-y"].forEach((id) => blink(id, a, b));
}

/* S2 the wrecked flat: grandparents tied on the sofa */
scene(
  "flat",
  `${room(F.flatWrecked())}
   ${C("ft-gm", R.granny(), 260, 870)}
   ${C("ft-gp", R.grandpa(), 450, 870)}
   ${room(F.sofaFront())}
   <path d="M150 790 H560" stroke="#c9a24a" stroke-width="6" stroke-dasharray="10 6"/>
   ${C("ft-g", GLEB(), 700, 1010)}
   ${C("ft-s1", MASK({ prop: "flashlight" }), 900, 1000)}`,
  { bg: "#2a2430" },
);
{
  const [a, b] = S.flat;
  camSet("flat", 520, 620, 1.35, a, 900);
  faceLeft("ft-s1", 900, 1000, a);
  expr("ft-s1", "angry", a);
  gesture("ft-s1", "pointR", a, 0.01);
  ["ft-gm", "ft-gp"].forEach((id) => expr(id, "scared", a));
  expr("ft-g", "scared", a);
  gesture("ft-g", "headBoth", a, 0.01);
  camTo("flat", 300, 620, 2.0, L.l04.start - 0.2, 0.5, 880, "power2.out");
  expr("ft-gm", "cry", L.l04.start - 0.1);
  T(
    `tl.to("#ft-gm .body", {keyframes:[{y:-3,duration:.12},{y:0,duration:.16},{y:-3,duration:.12},{y:0,duration:.16},{y:-3,duration:.12},{y:0,duration:.16}]}, ${r(L.l04.start)});`,
  );
  talk("ft-gm", "l04");
  camTo("flat", 680, 600, 1.9, L.l05.start - 0.15, 0.45, 880, "power2.inOut");
  expr("ft-g", "shock", L.l05.start);
  gesture("ft-g", "open", L.l05.start, 0.25);
  T(`tl.to("#ft-g", {x:-50, duration:.3}, ${r(L.l05.start + 0.1)});`);
  talk("ft-g", "l05");
  camTo("flat", 860, 580, 2.1, L.l06.start - 0.15, 0.45, 880, "power2.inOut");
  T(`tl.to("#ft-s1", {x:-60, duration:.35, ease:"power2.out"}, ${r(L.l06.start)});`);
  talk("ft-s1", "l06");
  expr("ft-g", "scared", L.l06.start + 0.6);
  gesture("ft-g", "headBoth", L.l06.start + 0.5, 0.25);
  ["ft-gm", "ft-gp", "ft-g", "ft-s1"].forEach((id) => blink(id, a, b));
}

/* S3 meanwhile on the stairs: Maxim hides behind the chute */
scene(
  "stairs",
  `${room(A.stairwell({ floor: 8 }))}
   <g id="st-mx">${C("st-mxr", R.maxim({ prop: "vodka", brow: "worried" }), 700, 905)}</g>
   <g id="st-mx2" opacity="0">${C("st-mx2r", R.maxim({ prop: "", brow: "worried" }), 905, 905)}</g>
   <g id="st-bottle" opacity="0"><path d="M640 905 v-40 q0 -8 6 -12 v-14 h4 v14 q6 4 6 12 v40z" fill="#dff1ff" stroke="#0b0d14" stroke-width="2"/><rect x="640" y="878" width="16" height="10" fill="#e23b2e"/></g>
   ${P("st-chute", F.chute(), 820, 1000, 230)}
   <g id="st-s3" opacity="0">${C("st-s3r", MASK({ prop: "flashlight" }), 600, 620)}</g>
   <path id="st-beam" d="M640 430 L860 1000 L1060 940 Z" fill="#fff6c8" opacity="0"/>`,
  { bg: "#2a3a3a" },
);
{
  const [a, b] = S.stairs;
  camSet("stairs", 720, 640, 1.5, a, 900);
  expr("st-mxr", "tired", a);
  gesture("st-mxr", "headR", a + 0.5, 0.4);
  camTo("stairs", 720, 620, 1.8, a, L.l08.start - a, 880, "none");
  gesture("st-mxr", "rest", L.l08.start - 0.3, 0.3);
  expr("st-mxr", "angry", L.l08.start);
  talk("st-mxr", "l08");
  // footsteps above: he puts the bottle down quietly and slides behind the chute
  hide("#st-mx", L.l08.end + 0.3);
  show("#st-mx2, #st-bottle", L.l08.end + 0.3);
  expr("st-mx2r", "scared", L.l08.end + 0.3);
  T(
    `tl.fromTo("#st-mx2", {x:-200}, {x:0, duration:.5, ease:"power2.out", immediateRender:false}, ${r(L.l08.end + 0.3)});`,
  );
  T(`tl.set("#st-s3", {opacity:1}, ${r(L.l09.start - 0.6)});`);

  expr("st-s3r", "angry", a);
  walk("st-s3r", L.l09.start - 0.6, L.l09.start + 0.4, 0, 0, 0.2, 22);
  T(
    `tl.fromTo("#st-s3", {x:200, y:-120}, {x:0, y:0, duration:1.0, ease:"power1.out", immediateRender:false}, ${r(L.l09.start - 0.6)});`,
  );
  gesture("st-s3r", "pointR", L.l09.start + 0.4, 0.2);
  talk("st-s3r", "l09");
  // the beam sweeps over the chute; he holds his breath
  T(
    `tl.fromTo("#st-beam", {opacity:0, rotation:18, svgOrigin:"640 430"}, {opacity:.22, rotation:-12, duration:${r(b - L.l09.start)}, ease:"sine.inOut", immediateRender:false}, ${r(L.l09.start)});`,
  );
  camTo("stairs", 800, 640, 2.0, L.l09.start, b - L.l09.start, 880, "sine.inOut");
  ["st-mxr", "st-s3r"].forEach((id) => blink(id, a, b));
}

/* S4 led out into the yard; the soldier spots the tank */
const tankEmpty = (k) => `<g id="${k}-tank">${P(`${k}-tk`, K.tank(), 0, 1000, 760)}
   <defs><clipPath id="${k}-clip"><rect x="-200" y="-400" width="1400" height="${743 + 400}"/></clipPath></defs>
   <g clip-path="url(#${k}-clip)"><g id="${k}-mxw">${C(`${k}-mx`, R.maxim({ helmet: true, prop: "", brow: "angry" }), 399, 743 + 128)}</g></g></g>`;
scene(
  "yard",
  `${room(K.grannyYard())}
   <g id="yd-tg" transform="translate(420 60)">${tankEmpty("yd")}</g>
   ${C("yd-s1", MASK({ prop: "flashlight" }), 60, 1060)}
   ${C("yd-o", R.sonOld(), 190, 1060)}
   ${C("yd-m", R.masha(), 300, 1060)}
   ${C("yd-y", R.sonYoung(), 390, 1060)}
   ${C("yd-g", GLEB(), 490, 1060)}
   ${C("yd-s2", MASK(), 640, 1060)}`,
  { bg: "#05070d" },
);
{
  const [a, b] = S.yard;
  camSet("yard", 420, 700, 1.35, a, 900);
  T(`tl.set("#yd-mxw", {y:320}, ${r(a)});`);
  ["yd-o", "yd-m", "yd-y", "yd-g"].forEach((id) => {
    expr(id, "scared", a);
    gesture(id, "headBoth", a, 0.01);
    walk(id, a, a + 1.4, 120, 0, 0.32, 16, false);
  });
  ["yd-s1", "yd-s2"].forEach((id) => {
    expr(id, "angry", a);
    walk(id, a, a + 1.4, 120, 0, 0.32, 16);
  });
  expr("yd-y", "cry", a);
  camTo("yard", 300, 640, 2.0, L.l10.start - 0.2, 0.45, 880, "power2.out");
  talk("yd-o", "l10");
  pose("yd-o", "head", 10, L.l10.start, 0.2);
  camTo("yard", 560, 640, 2.0, L.l11.start - 0.15, 0.4, 880, "power2.inOut");
  expr("yd-g", "determined", L.l11.start);
  talk("yd-g", "l11");
  // the tank on the swings
  camTo("yard", 860, 700, 1.3, L.l12.start - 0.3, 0.6, 900, "power2.inOut");
  expr("yd-s2", "shock", L.l12.start);
  gesture("yd-s2", "pointR", L.l12.start + 0.1, 0.2);
  talk("yd-s2", "l12");
  camTo("yard", 560, 620, 2.1, L.l13.start - 0.15, 0.45, 860, "power2.inOut");
  expr("yd-g", "neutral", L.l13.start);
  talk("yd-g", "l13");
  ["yd-o", "yd-m", "yd-g", "yd-s1", "yd-s2"].forEach((id) => blink(id, a, b));
}

/* S5 into the truck; the tarp drops; it drives away */
scene(
  "truck",
  `${room(K.grannyYard())}
   <g id="tr">${P("tr-art", F.truck(), 200, 1060, 760)}
     <defs><clipPath id="tr-clip"><rect x="228" y="791" width="148" height="176"/></clipPath></defs>
     <g clip-path="url(#tr-clip)"><g transform="translate(302 980) scale(.55) translate(-302 -980)">
       ${C("tr-m", R.masha(), 220, 1200)}${C("tr-y", R.sonYoung(), 300, 1210)}${C("tr-g", GLEB(), 390, 1200)}
     </g></g>
     <g id="tr-flap">${P("tr-flap-art", F.truck(), 200, 1060, 760)}</g>
   </g>`,
  { bg: "#05070d" },
);
{
  const [a, b] = S.truck;
  camSet("truck", 302, 880, 2.8, a, 860);
  // only the tarp flap of the overlay copy shows, rolled up until he has finished speaking
  T(
    `tl.set("#tr-flap-art path, #tr-flap-art rect, #tr-flap-art ellipse, #tr-flap-art .wheel", {opacity:0}, ${r(a)});`,
  );
  T(`tl.set("#tr-flap-art .tarp-flap, #tr-flap-art .tarp-flap *", {opacity:1}, ${r(a)});`);
  T(`tl.set("#tr-art .tarp-flap", {opacity:0}, ${r(a)});`);
  T(`tl.set("#tr-flap-art .tarp-flap", {scaleY:0, svgOrigin:"30 110"}, ${r(a)});`);
  ["tr-m", "tr-y", "tr-g"].forEach((id) => expr(id, "scared", a));
  expr("tr-y", "cry", a);
  talk("tr-m", "l14");
  expr("tr-g", "sad", L.l15.start - 0.1);
  talk("tr-g", "l15");
  T(
    `tl.to("#tr-flap-art .tarp-flap", {scaleY:1, svgOrigin:"30 110", duration:.35, ease:"bounce.out"}, ${r(L.l15.end + 0.1)});`,
  );
  camTo("truck", 560, 820, 1.2, L.l15.end + 0.2, 0.5, 900, "power2.inOut");
  T(
    `tl.to("#tr", {x:1300, duration:${r(b - L.l15.end - 0.5)}, ease:"power2.in"}, ${r(L.l15.end + 0.5)});`,
  );
  spinWheels("#tr-art .wheel", L.l15.end + 0.5, b, 900);
  ["tr-m", "tr-g"].forEach((id) => blink(id, a, b));
}

/* S6 the yard is empty — then the hatch clangs open */
scene(
  "tank",
  `${room(K.grannyYard())}
   <g id="tl-tail"><circle cx="1000" cy="980" r="8" fill="#ff2a1f"/><circle cx="1040" cy="980" r="8" fill="#ff2a1f"/></g>
   <g id="tk-tg" transform="translate(220 60)">${tankEmpty("tk")}</g>
   <ellipse id="tk-glow" cx="${220 + 399}" cy="${60 + 743}" rx="60" ry="18" fill="#ffb347" opacity="0"/>
   <rect id="tk-black" x="-500" y="-500" width="2080" height="2920" fill="#000" opacity="0"/>`,
  { bg: "#05070d" },
);
{
  const [a, b] = S.tank;
  camSet("tank", 620, 720, 1.2, a, 900);
  T(`tl.set("#tk-mxw", {y:320}, ${r(a)});`);
  T(
    `tl.to("#tl-tail", {x:300, scale:.4, svgOrigin:"1020 980", opacity:0, duration:2.0, ease:"power1.in"}, ${r(a)});`,
  );
  // the hatch: lights inside, then Maxim rises
  T(
    `tl.to("#tk-tk .hatch", {rotation:-110, svgOrigin:"370 106", duration:.3, ease:"back.out(1.6)"}, ${r(L.l16.start - 1.3)});`,
  );
  T(
    `tl.fromTo("#tk-glow", {opacity:0}, {opacity:.7, duration:.3, immediateRender:false}, ${r(L.l16.start - 1.25)});`,
  );
  T(`tl.to("#tk-mxw", {y:0, duration:.6, ease:"back.out(1.4)"}, ${r(L.l16.start - 0.9)});`);
  camTo("tank", 619, 640, 2.4, L.l16.start - 1.3, 1.0, 860, "power2.inOut");
  expr("tk-mx", "angry", a);
  gesture("tk-mx", "fist", W("суки"), 0.2);
  talk("tk-mx", "l16");
  // turret swings after the truck; the tank lurches forward; black
  T(
    `tl.to("#tk-tk .turret", {rotation:-5, svgOrigin:"435 196", duration:.6, ease:"power2.inOut"}, ${r(L.l16.end - 0.2)});`,
  );
  T(
    `tl.to("#tk-tg", {x:"+=500", duration:${r(b - L.l16.end)}, ease:"power2.in"}, ${r(L.l16.end + 0.2)});`,
  );
  spinWheels("#tk-tk .tw", L.l16.end + 0.2, b, 900);
  camTo("tank", 800, 700, 1.4, L.l16.end, b - L.l16.end, 900, "power1.in");
  T(`tl.to("#tk-black", {opacity:1, duration:.25}, ${r(b - 0.3)});`);
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
  soldier3: ["СОЛДАТ", "#c9d48a"],
  granny: ["БАБУШКА", "#e0b3ff"],
};
const HOT = new Set(
  "дети мам целы восьмым девятым опоздал старик дед танк хорошо обещаю разозлили".split(" "),
);
const DANGER = new Set("пол быстро заткнись стене целых ёб хрень суки".split(" "));
const hook = `<div id="hook" class="clip toptitle" data-start="0.2" data-duration="${r(L.l01.start - 0.1)}" data-track-index="2" style="z-index:5"><div class="tt-s">${spl("ГЛЕБ", "hs")}</div><div class="tt-a">${spl("ЧАСТЬ 4", "ha")}</div></div>`;
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
const stamps = "";
void stamp;
const title = `<div id="tbc" class="clip" data-start="${TITLE[0]}" data-duration="${r(TITLE[1] - TITLE[0])}" data-track-index="4" style="z-index:8"><div id="tbc-a">${spl("ПРОДОЛЖЕНИЕ СЛЕДУЕТ…", "ta")}</div><div id="tbc-b">ЧАСТЬ 5</div></div>`;
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
  ["slam", 0.27, 0.5, 1.2],
  ["click", L.l06.start + 0.2, 0.06, 1.2],
  ["truck", L.l15.end + 0.4, 6, 0.9],
  ["tank", L.l16.start - 1.3, 6, 0.9],
].filter(([, , , v]) => v > 0);
const audio = [
  `<audio id="vo" class="clip" src="assets/vo.wav" data-start="0" data-duration="${r(L.l16.end + 0.1)}" data-track-index="10" data-volume="1"></audio>`,
  `<audio id="room" class="clip" src="${SFX}/room_night.wav" data-start="0" data-duration="${r(Math.min(31, CUT))}" data-track-index="11" data-volume="0.7"></audio>`,
  `<audio id="room2" class="clip" src="${SFX}/room_night.wav" data-start="31" data-duration="${r(CUT - 31)}" data-track-index="11" data-volume="0.7"></audio>`,
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
<title>Глеб — часть 4</title>
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
