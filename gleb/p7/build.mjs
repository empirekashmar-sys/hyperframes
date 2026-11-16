// "Глеб — часть 7": the block is bombed; Maxim finds only Masha and they escape in an old Moskvich.
// Run from gleb/p7: node build.mjs → index.html (sfx shared via assets/sfx symlink).
import fs from "node:fs";
import * as R from "../art/rig.js";
import * as K from "../p3/art3.js";
import * as A from "../art/art.js";
import * as F2 from "../p2/art2.js";
import * as F5 from "../p5/art5.js";
import * as F6 from "../p6/art6.js";
import * as F7 from "./art7.js";

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
const CUT = r(L.l33.end + 1.4);
const TITLE = [CUT, r(CUT + 3.2)];
const CARD_START = r(TITLE[1] + 0.1);
const CARD_DUR = 3.6;
const TOTAL = r(CARD_START + CARD_DUR);
const S = {};
{
  const ends = [
    ["window", L.l04.end + 0.6],
    ["bomb", L.l05.end + 1.2],
    ["ruins", L.l19.end + 0.5],
    ["run", L.l21.end + 0.4],
    ["garage", L.l23.end - 0.6],
    ["cab", L.l27.end + 0.5],
    ["escape", L.l29.end + 0.6],
    ["behind", L.l30.end + 1.0],
    ["night", L.l32.end + 0.8],
    ["cellar", CUT],
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
const spinWheels = (sel, t0, t1, deg = 1440) =>
  T(
    `tl.to("${sel}", {rotation:"+=${deg}", transformOrigin:"50% 50%", duration:${r(t1 - t0)}, ease:"none"}, ${r(t0)});`,
  );

const MASK = (o = {}) => R.soldier({ mask: true, ...o });

const flash = (sel, at, peak = 0.9, dur = 0.5) =>
  T(
    `tl.fromTo("${sel}", {opacity:${peak}}, {opacity:0, duration:${dur}, immediateRender:false}, ${r(at)});`,
  );
const MX = (o = {}) => R.maxim({ uniform: true, helmet: true, prop: "rifle", ...o });
const GA = (o = {}) => R.gleb({ injured: true, armor: true, prop: "rifle", ...o });
const fire = (sel, t0, t1, every = 0.16) => {
  for (let t = t0; t < t1; t += every) flash(sel, t, 1, every * 0.6);
};
const MOSK = (o = {}) => F2.car({ lights: false, color: "#c9b48a", ...o });

/* S1 the landing window: the shooting stops... then a plane */
scene(
  "window",
  `${room(F6.landingWindow())}
   <defs><clipPath id="wn-clip"><rect x="250" y="190" width="580" height="440"/></clipPath></defs>
   <g clip-path="url(#wn-clip)">${F7.plane("wn-plane", 120, 290, 0.9)}</g>
   ${C("wn-mx", MX(), 360, 1060)}
   ${C("wn-o", R.sonOld(), 560, 1070)}
   ${C("wn-g", GA(), 760, 1060)}
   <rect id="wn-white" x="-800" y="-800" width="2680" height="3520" fill="#fff6e0" opacity="0"/>`,
  { bg: "#3c4e4c" },
);
{
  const [a, b] = S.window;
  camSet("window", 540, 520, 1.6, a, 820);
  T(`tl.set("#zm-window .cracks", {opacity:.8}, ${r(a)});`);
  T(`tl.set("#zm-window .wn-plane", {x:-400}, ${r(a)});`);
  ["wn-mx", "wn-g"].forEach((id) => {
    expr(id, "determined", a);
    gesture(id, "pointR", a, 0.01);
  });
  expr("wn-o", "scared", a);
  // the last flashes outside, then nothing
  T(
    `tl.to("#zm-window .fx", {keyframes:[{opacity:1,duration:.05},{opacity:0,duration:.1}], repeat:2, stagger:.2}, ${r(a + 0.1)});`,
  );
  camTo("window", 540, 640, 1.3, L.l01.start + 1.4, 1.2, 900, "power2.inOut");
  ["wn-mx", "wn-g"].forEach((id) => gesture(id, "rest", L.l01.end - 0.5, 0.4));
  camTo("window", 560, 720, 2.3, L.l02.start - 0.25, 0.45, 880, "power2.inOut");
  talk("wn-o", "l02");
  camTo("window", 760, 720, 2.2, L.l03.start - 0.25, 0.45, 880, "power2.inOut");
  expr("wn-g", "scared", L.l03.start);
  talk("wn-g", "l03");
  pose("wn-g", "head", -8, L.l03.start + 0.4, 0.4);
  // the plane in the window; Maxim sees it
  camTo("window", 460, 560, 1.5, L.l03.end - 0.1, 0.6, 860, "power2.inOut");
  T(`tl.to("#zm-window .wn-plane", {x:900, duration:2.2, ease:"none"}, ${r(L.l03.end)});`);
  expr("wn-mx", "shock", L.l04.start - 0.2);
  T(`tl.set("#wn-mx", {scaleX:-1, svgOrigin:"360 1060"}, ${r(L.l04.start - 0.2)});`);
  talk("wn-mx", "l04");
  ["wn-mx", "wn-o", "wn-g"].forEach((id, i) => {
    gesture(id, "duck", W("ложись") + 0.1 + i * 0.05, 0.2);
    T(
      `tl.to("#${id}", {y:90, duration:.3, ease:"power2.in"}, ${r(W("ложись") + 0.15 + i * 0.05)});`,
    );
  });
  T(
    `tl.to("#sh-window", {keyframes:[{x:-20,y:10,duration:.05},{x:18,y:-14,duration:.05},{x:-12,y:8,duration:.05},{x:0,y:0,duration:.05}], repeat:3}, ${r(b - 0.6)});`,
  );
  T(
    `tl.fromTo("#wn-white", {opacity:0}, {opacity:1, duration:.3, immediateRender:false}, ${r(b - 0.35)});`,
  );
  ["wn-mx", "wn-o", "wn-g"].forEach((id) => blink(id, a, b));
}

/* S2 the bombing: the block folds like a house of cards */
scene(
  "bomb",
  `<g id="bm-bg">${room(K.grannyYard())}</g>
   <rect x="215" y="70" width="650" height="790" fill="#05070d"/>
   <g id="bm-ruin" opacity="0"><path d="M230 850 L250 640 L300 700 L340 560 L400 680 L470 600 L540 720 L610 580 L680 690 L740 620 L800 720 L850 660 L860 850Z" fill="#30343f" stroke="#0b0d14" stroke-width="3"/></g>
   <defs><clipPath id="bm-clip"><rect x="215" y="70" width="650" height="790"/></clipPath></defs>
   <g clip-path="url(#bm-clip)"><g id="bm-bld">${room(K.grannyYard())}</g></g>
   ${[0, 1, 2].map((k) => `<circle class="bm-boom" cx="${380 + k * 160}" cy="${360 + (k % 2) * 160}" r="200" fill="#ff8a2b" opacity="0"/><circle class="bm-boom2" cx="${380 + k * 160}" cy="${360 + (k % 2) * 160}" r="110" fill="#ffe27a" opacity="0"/>`).join("")}
   <g id="bm-dust" opacity="0">${[0, 1, 2, 3, 4, 5, 6].map((k) => `<circle cx="${200 + k * 110}" cy="${820 - (k % 3) * 60}" r="${160 + (k % 3) * 40}" fill="#6a5e56" opacity=".8"/>`).join("")}</g>
   ${F7.plane("bm-plane", -200, 160, 1.2)}
   <rect id="bm-black" x="-800" y="-800" width="2680" height="3520" fill="#000" opacity="0"/>`,
  { bg: "#05070d" },
);
{
  const [a, b] = S.bomb;
  camSet("bomb", 540, 520, 1.15, a, 860);
  T(`tl.to("#zm-bomb .bm-plane", {x:1500, duration:2.6, ease:"none"}, ${r(a)});`);
  const hit = a + 1.2;
  T(
    `tl.to("#zm-bomb .bm-boom", {keyframes:[{opacity:1,scale:1.2,duration:.12},{opacity:0,scale:1.6,duration:.6}], transformOrigin:"50% 50%", stagger:.25}, ${r(hit)});`,
  );
  T(
    `tl.to("#zm-bomb .bm-boom2", {keyframes:[{opacity:1,duration:.1},{opacity:0,duration:.4}], stagger:.25}, ${r(hit)});`,
  );
  shake("#sh-bomb", hit, 18, 26);
  // the building drops into its own dust
  T(`tl.to("#bm-bld", {y:520, duration:1.6, ease:"power2.in"}, ${r(hit + 0.3)});`);
  T(`tl.to("#bm-bld", {skewX:4, svgOrigin:"540 860", duration:1.6}, ${r(hit + 0.3)});`);
  show("#bm-ruin", hit + 0.3);
  T(
    `tl.fromTo("#bm-dust", {opacity:0, y:120}, {opacity:1, y:-120, duration:2.0, ease:"power2.out", immediateRender:false}, ${r(hit + 0.5)});`,
  );
  T(`tl.to("#bm-dust", {opacity:.5, duration:1.5}, ${r(hit + 2.6)});`);
  camTo("bomb", 540, 640, 1.0, hit, b - hit, 900, "power1.out");
  T(`tl.to("#bm-black", {opacity:1, duration:.6}, ${r(b - 0.7)});`);
}

/* S3 the ruins: Maxim rises; he finds Masha... only Masha */
scene(
  "ruins",
  `${room(F7.ruins())}
   ${F5.fire(140, 860, 0.8)}${F5.fire(900, 880, 1.0)}${F5.smoke(860, 780, 6)}
   <g id="ru-mxw">${C("ru-mx", MX(), 420, 1000)}</g>
   <g id="ru-mw">${C("ru-m", R.masha(), 640, 1005)}</g>
   <g id="ru-hand"><path d="M640 930 q-10 -40 6 -60 q14 -6 16 10 l-4 50z" fill="#e8b48e" stroke="#0b0d14" stroke-width="2.4"/></g>
   ${room(F7.rubbleFront())}
   ${[0, 1, 2].map((k) => `<g class="ru-sold" opacity="0">${C(`ru-s${k}`, MASK({ prop: "flashlight" }), 1180 + k * 120, 1060)}</g>`).join("")}
   <rect id="ru-black" x="-800" y="-800" width="2680" height="3520" fill="#000" opacity="0"/>`,
  { bg: "#0a0608" },
);
{
  const [a, b] = S.ruins;
  camSet("ruins", 540, 700, 1.1, a, 900);
  T(
    `tl.fromTo("#ru-black", {opacity:1}, {opacity:0, duration:1.2, immediateRender:false}, ${r(a)});`,
  );
  T(
    `tl.to("#zm-ruins .fire", {keyframes:${JSON.stringify(Array.from({ length: Math.round((b - a) / 0.14) }, (_, i) => ({ scaleY: 1 + ((i * 7) % 5) * 0.06, duration: 0.14 })))}, transformOrigin:"50% 100%"}, ${r(a)});`,
  );
  T(
    `tl.fromTo("#zm-ruins .puff", {y:0, scale:.8, transformOrigin:"50% 50%"}, {y:-200, scale:1.5, duration:${r(b - a)}, ease:"none", stagger:.2, immediateRender:false}, ${r(a)});`,
  );
  T(`tl.set("#ru-mxw", {y:330}, ${r(a)});`);
  T(`tl.set("#ru-mw", {y:330}, ${r(a)});`);
  T(`tl.set("#ru-hand", {opacity:0}, ${r(a)});`);
  expr("ru-mx", "pain", a);
  // out of the dust
  T(
    `tl.to("#ru-mxw", {keyframes:[{y:200,duration:.5,ease:"power2.out"},{y:220,duration:.3},{y:0,duration:.9,ease:"power2.out"}]}, ${r(L.l06.start + 0.4)});`,
  );
  camTo("ruins", 420, 680, 2.0, L.l06.start + 0.2, 1.8, 880, "power2.inOut");
  T(
    `tl.to("#ru-mx .body", {keyframes:[{rotation:8,duration:.2},{rotation:0,duration:.25},{rotation:6,duration:.2},{rotation:0,duration:.25}], svgOrigin:"100 410"}, ${r(L.l07.start)});`,
  );
  talk("ru-mx", "l07");
  expr("ru-mx", "tired", W("живой", 1) + 0.2);
  // calls out
  expr("ru-mx", "scared", L.l08.start);
  gesture("ru-mx", "open", L.l08.start, 0.3);
  T(
    `tl.to("#ru-mx .head", {keyframes:[{rotation:-12,duration:.5},{rotation:12,duration:.7},{rotation:0,duration:.4}], transformOrigin:"50% 92%"}, ${r(L.l08.start + 0.3)});`,
  );
  talk("ru-mx", "l08");
  camTo("ruins", 540, 700, 1.4, L.l08.start, 1.0, 900, "power2.inOut");
  // a hand in the rubble
  show("#ru-hand", L.l09.start - 0.3);
  T(
    `tl.to("#ru-hand", {keyframes:[{rotation:-8,duration:.3},{rotation:6,duration:.3},{rotation:0,duration:.3}], svgOrigin:"650 930"}, ${r(L.l09.start - 0.2)});`,
  );
  camTo("ruins", 640, 860, 2.6, L.l09.start - 0.4, 0.5, 900, "power2.inOut");
  // Maxim pulls her up
  walk("ru-mx", L.l09.end, L.l10.start + 0.4, 150, 0, 0.25, 18, false);
  camTo("ruins", 560, 740, 1.9, L.l10.start - 0.2, 0.6, 900, "power2.inOut");
  expr("ru-mx", "determined", L.l10.start);
  talk("ru-mx", "l10");
  gesture("ru-mx", "open", L.l10.start + 0.6, 0.3);
  const lift = W("взяли");
  hide("#ru-hand", lift);
  expr("ru-m", "pain", a);
  T(`tl.to("#ru-mw", {y:0, duration:.7, ease:"power2.out"}, ${r(lift)});`);
  gesture("ru-mx", "rest", lift + 0.3, 0.3);
  // where are they?
  camTo("ruins", 640, 720, 2.2, L.l11.start - 0.2, 0.4, 880, "power2.inOut");
  expr("ru-m", "cry", L.l11.start);
  talk("ru-m", "l11");
  camTo("ruins", 420, 700, 2.1, L.l12.start - 0.2, 0.4, 880, "power2.inOut");
  expr("ru-mx", "scared", L.l12.start);
  T(`tl.set("#ru-mx", {scaleX:-1, svgOrigin:"570 1000"}, ${r(L.l12.start)});`);
  gesture("ru-mx", "open", L.l12.start + 0.1, 0.3);
  talk("ru-mx", "l12");
  // only silence and fire
  camTo("ruins", 540, 640, 0.95, L.l12.end, L.l13.end - L.l12.end + 0.4, 900, "sine.inOut");
  T(`tl.set("#ru-mx", {scaleX:1, svgOrigin:"570 1000"}, ${r(L.l13.end)});`);
  camTo("ruins", 640, 720, 2.2, L.l14.start - 0.2, 0.4, 880, "power2.inOut");
  gesture("ru-m", "headBoth", L.l14.start + 0.1, 0.3);
  talk("ru-m", "l14");
  camTo("ruins", 520, 720, 1.8, L.l15.start - 0.2, 0.5, 880, "power2.inOut");
  expr("ru-mx", "sad", L.l15.start);
  talk("ru-mx", "l15");
  // flashlights
  T(`tl.set("#zm-ruins .ru-sold", {opacity:1}, ${r(L.l16.start - 1.0)});`);
  ["ru-s0", "ru-s1", "ru-s2"].forEach((id, k) => {
    T(`tl.set("#${id}", {scaleX:-1, svgOrigin:"${1180 + k * 120} 1060"}, ${r(a)});`);
    expr(id, "angry", a);
    walk(id, L.l16.start - 1.0, b, -260, 0, 0.3, 20);
  });
  camTo("ruins", 1100, 720, 1.6, L.l16.start - 0.4, 0.6, 880, "power2.inOut");
  gesture("ru-s1", "pointR", L.l16.start + 0.2, 0.2);
  talk("ru-s1", "l16");
  camTo("ruins", 560, 720, 2.0, L.l17.start - 0.2, 0.5, 880, "power2.inOut");
  expr("ru-mx", "determined", L.l17.start);
  talk("ru-mx", "l17");
  talk("ru-m", "l18");
  expr("ru-mx", "sad", L.l19.start);
  pose("ru-mx", "armL", -80, L.l19.start + 0.3, 0.4);
  T(`tl.to("#ru-mxw", {x:60, duration:.5}, ${r(L.l19.start)});`);
  talk("ru-mx", "l19");
  expr("ru-mx", "determined", W("вернёмся", 2) - 0.2);
  ["ru-mx", "ru-m"].forEach((id) => blink(id, a, b));
}

/* S4 running across the yard under fire */
scene(
  "run",
  `${room(F2.courtyard())}
   ${C("rn-m", R.masha(), -40, 1060)}
   ${C("rn-mx", MX(), 120, 1060)}
   ${Array.from({ length: 6 }, (_, i) => F6.muzzle("rn-spark", 260 + i * 150, 1070 - (i % 2) * 260, 0.6)).join("")}`,
  { bg: "#05070d" },
);
{
  const [a, b] = S.run;
  camSet("run", 200, 760, 1.6, a, 900);
  expr("rn-m", "cry", a);
  expr("rn-mx", "determined", a);
  walk("rn-m", a, b, 900, 0, 0.2, 32);
  walk("rn-mx", a, b, 900, 0, 0.22, 30);
  pose("rn-mx", "armL", 60, a, 0.2);
  camTo("run", 1000, 760, 1.6, a, b - a, 900, "none");
  T(
    `tl.fromTo("#zm-run .rn-spark", {opacity:1}, {opacity:0, duration:.12, stagger:.55, immediateRender:false}, ${r(a + 0.4)});`,
  );
  expr("rn-mx", "tired", L.l21.start);
  talk("rn-mx", "l21");
  ["rn-mx", "rn-m"].forEach((id) => blink(id, a, b));
}

/* S5 the garages: an old Moskvich, no keys */
scene(
  "garage",
  `${room(F7.garages())}
   <g id="gr-car">${P("gr-cart", MOSK(), 520, 1000, 520)}</g>
   ${C("gr-m", R.masha(), 0, 1060)}
   ${C("gr-mx", MX(), 120, 1060)}`,
  { bg: "#06080e" },
);
{
  const [a, b] = S.garage;
  camSet("garage", 500, 760, 1.2, a, 900);
  expr("gr-m", "scared", a);
  expr("gr-mx", "tired", a);
  walk("gr-m", a, a + 1.6, 360, 0, 0.22, 26);
  walk("gr-mx", a, a + 1.6, 380, 0, 0.24, 26);
  camTo("garage", 760, 800, 1.7, L.l22.start, 1.6, 900, "power2.inOut");
  camTo("garage", 560, 720, 2.2, L.l23.start - 0.2, 0.5, 880, "power2.inOut");
  expr("gr-mx", "determined", L.l23.start);
  gesture("gr-mx", "fist", L.l23.start + 0.4, 0.2);
  talk("gr-mx", "l23");
  T(`tl.to("#gr-m, #gr-mx", {opacity:0, duration:.25}, ${r(b - 0.3)});`);
}

/* S6 inside the car: hot-wiring it while the flashlights close in */
scene(
  "cab",
  `<g id="cab-back">${room(F2.cabBack())}</g>
   <path id="cab-beam" d="M1100 200 L300 420 L320 560Z" fill="#fff6c8" opacity="0"/>
   ${C("cb-mx", MX(), 330, 805)}
   ${C("cb-m", R.masha(), 770, 805)}
   <g id="cab-off">${room(F2.cabFront({ lit: false }))}</g>
   <g id="cab-on" opacity="0">${room(F2.cabFront({ lit: true }))}</g>
   ${F6.muzzle("cb-spark", 470, 840, 0.5)}`,
  { bg: "#05070d" },
);
{
  const [a, b] = S.cab;
  camSet("cab", 540, 600, 1.45, a, 900);
  expr("cb-mx", "determined", a);
  expr("cb-m", "scared", a);
  gesture("cb-mx", "duck", a, 0.01);
  T(`tl.set("#cb-mx", {y:120}, ${r(a)});`);
  // wires spark under the dash
  [0, 0.7, 1.3].forEach((d) => flash("#cb-spark", L.l23.end - 0.6 + d, 1, 0.12));
  camTo("cab", 770, 540, 2.2, L.l24.start - 0.2, 0.4, 860, "power2.inOut");
  T(`tl.set("#cb-m", {scaleX:-1, svgOrigin:"770 805"}, ${r(L.l24.start - 0.2)});`);
  talk("cb-m", "l24");
  T(
    `tl.fromTo("#cab-beam", {opacity:0}, {opacity:.25, duration:.6, immediateRender:false}, ${r(L.l24.start)});`,
  );
  T(
    `tl.to("#cab-beam", {rotation:6, svgOrigin:"1100 200", duration:2.0, yoyo:true, repeat:2}, ${r(L.l24.start)});`,
  );
  // first try: nothing
  camTo("cab", 400, 600, 2.0, L.l25.start - 0.2, 0.4, 880, "power2.inOut");
  T(`tl.to("#cb-mx", {y:0, duration:.3}, ${r(L.l25.start - 0.2)});`);
  gesture("cb-mx", "wheel", L.l25.start - 0.1, 0.25);
  talk("cb-mx", "l25");
  shake("#sh-cab", L.l25.start + 0.4, 10, 3);
  shake("#sh-cab", L.l25.end + 0.3, 10, 3);
  [0.4, 1.4].forEach((d) => flash("#cb-spark", L.l25.start + d, 1, 0.12));
  camTo("cab", 770, 560, 2.2, L.l26.start - 0.2, 0.3, 860, "power2.out");
  T(`tl.set("#cb-m", {scaleX:1, svgOrigin:"770 805"}, ${r(L.l26.start - 0.1)});`);
  gesture("cb-m", "headBoth", L.l26.start, 0.2);
  talk("cb-m", "l26");
  // it starts!
  show("#cab-on", L.l27.start - 0.1);
  hide("#cab-off", L.l27.start - 0.1);
  shake("#sh-cab", L.l27.start - 0.1, 16, 4);
  camTo("cab", 330, 560, 2.2, L.l27.start - 0.2, 0.3, 860, "power2.out");
  expr("cb-mx", "angry", L.l27.start);
  talk("cb-mx", "l27");
  T(
    `tl.to("#cab-back .street", {x:-900, duration:${r(b - L.l27.end)}, ease:"power2.in"}, ${r(L.l27.end)});`,
  );
  ["cb-mx", "cb-m"].forEach((id) => blink(id, a, b));
}

/* S7 out of the yard, right past the soldiers */
scene(
  "escape",
  `${room(F2.courtyard())}
   ${[0, 1, 2].map((k) => C(`es-s${k}`, MASK({ prop: k === 1 ? "rifle" : "flashlight" }), 520 + k * 160, 1000)).join("")}
   <g id="es-car">${P("es-cart", MOSK({ lights: true }), -700, 1090, 520)}</g>
   ${F6.muzzle("es-f", 700, 860, 0.8)}`,
  { bg: "#05070d" },
);
{
  const [a, b] = S.escape;
  camSet("escape", 540, 800, 1.2, a, 900);
  ["es-s0", "es-s1", "es-s2"].forEach((id) => expr(id, "angry", a));
  T(
    `tl.to("#es-car", {x:2400, duration:${r(L.l28.end - a + 0.6)}, ease:"power1.in"}, ${r(a + 0.3)});`,
  );
  spinWheels("#es-cart .wheel", a + 0.3, b, 2400);
  ["es-s0", "es-s1", "es-s2"].forEach((id, k) =>
    T(
      `tl.to("#${id}", {x:${k === 1 ? -40 : 40}, duration:.3, ease:"power2.out"}, ${r(a + 1.4 + k * 0.1)});`,
    ),
  );
  ["es-s0", "es-s2"].forEach((id) => expr(id, "shock", a + 1.3));
  camTo("escape", 680, 760, 2.0, L.l29.start - 0.2, 0.4, 880, "power2.inOut");
  gesture("es-s1", "pointR", L.l29.start, 0.2);
  talk("es-s1", "l29");
  fire("#es-f", L.l29.end, b - 0.1, 0.14);
}

/* S8 the road: behind them the block is stormed and bombed again */
scene(
  "behind",
  `${room(F7.farBlock())}
   ${F7.plane("bh-plane", -300, 260, 0.6)}
   <g id="bh-car">${P("bh-cart", MOSK({ lights: true }), 80, 1000, 300)}</g>`,
  { bg: "#05060c" },
);
{
  const [a, b] = S.behind;
  camSet("behind", 540, 700, 1.25, a, 900);
  T(`tl.to("#bh-car", {x:420, duration:${r(b - a)}, ease:"none"}, ${r(a)});`);
  spinWheels("#bh-cart .wheel", a, b, 2400);
  T(`tl.to("#zm-behind .bh-plane", {x:1200, duration:3.0, ease:"none"}, ${r(a)});`);
  T(
    `tl.to("#zm-behind .bl", {keyframes:[{opacity:.9,scale:1.2,duration:.15},{opacity:0,scale:1.6,duration:.7}], transformOrigin:"50% 50%", stagger:{each:.5, repeat:1}}, ${r(L.l30.start + 0.3)});`,
  );
  T(
    `tl.fromTo("#zm-behind .lane", {strokeDashoffset:0}, {strokeDashoffset:-${Math.round((b - a) * 500)}, duration:${r(b - a)}, ease:"none", immediateRender:false}, ${r(a)});`,
  );
  camTo("behind", 510, 620, 1.6, a + 0.5, b - a - 0.5, 900, "sine.inOut");
}

/* S9 in the car at night: Masha cries, Maxim promises */
scene(
  "night",
  `<g id="nt-back">${room(F2.cabBack())}</g>
   ${C("nt-mx", MX(), 330, 805)}
   ${C("nt-m", R.masha(), 770, 805)}
   ${room(F2.cabFront({ lit: true }))}`,
  { bg: "#05070d" },
);
{
  const [a, b] = S.night;
  camSet("night", 540, 600, 1.45, a, 900);
  T(`tl.to("#nt-back .street", {x:-1600, duration:${r(b - a)}, ease:"none"}, ${r(a)});`);
  gesture("nt-mx", "wheel", a, 0.01);
  expr("nt-mx", "sad", a);
  expr("nt-m", "cry", a);
  camTo("night", 770, 560, 2.3, L.l31.start - 0.3, 0.6, 860, "power2.inOut");
  pose("nt-m", "head", 10, L.l31.start, 0.5);
  talk("nt-m", "l31");
  camTo("night", 550, 560, 1.7, L.l32.start - 0.3, 0.6, 860, "power2.inOut");
  pose("nt-mx", "armR", -70, L.l32.start + 0.3, 0.4);
  talk("nt-mx", "l32");
  expr("nt-mx", "determined", W("клянусь") - 0.1);
  ["nt-mx", "nt-m"].forEach((id) => blink(id, a, b));
}

/* S10 the basement: a flashlight comes on */
scene(
  "cellar",
  `${room(A.basement({ lit: false }))}
   <rect id="ce-dark" x="-500" y="-500" width="2080" height="2920" fill="#000" opacity=".92"/>
   <g id="ce-light" opacity="0"><circle cx="560" cy="760" r="320" fill="#fff6c8" opacity=".14"/><circle cx="560" cy="760" r="120" fill="#fff6c8" opacity=".2"/><circle cx="560" cy="760" r="18" fill="#fff6c8"/></g>`,
  { bg: "#000" },
);
{
  const [a, b] = S.cellar;
  camSet("cellar", 560, 700, 1.6, a, 900);
  camTo("cellar", 560, 760, 2.4, a, b - a, 900, "sine.inOut");
  const on = W("фонарика") - 0.1;
  T(
    `tl.set("#ce-light", {opacity:1}, ${r(on)}); tl.set("#ce-light", {opacity:0}, ${r(on + 0.12)}); tl.set("#ce-light", {opacity:1}, ${r(on + 0.3)});`,
  );
  T(`tl.to("#ce-dark", {opacity:.6, duration:.3}, ${r(on + 0.3)});`);
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
};
const HOT = new Set(
  "самолёт карточный живой маша глеб пацаны тишина вернёмся москвич ключей держись клянусь фонарика".split(
    " ",
  ),
);
const DANGER = new Set(
  "убьют гони удар выстрел перевернулся нахуй суки быстро стреляй сука пизда ёб".split(" "),
);
const hook = `<div id="hook" class="clip toptitle" data-start="0.2" data-duration="${r(L.l01.start - 0.1)}" data-track-index="2" style="z-index:5"><div class="tt-s">${spl("ГЛЕБ", "hs")}</div><div class="tt-a">${spl("ЧАСТЬ 7", "ha")}</div></div>`;
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
const stamps = [stamp("st-boom", S.bomb[0] + 1.2, S.bomb[0] + 2.4, "БА-БАХ!", "#ff4a3d")].join(
  "\n",
);
const title = `<div id="tbc" class="clip" data-start="${TITLE[0]}" data-duration="${r(TITLE[1] - TITLE[0])}" data-track-index="4" style="z-index:8"><div id="tbc-a">${spl("ПРОДОЛЖЕНИЕ СЛЕДУЕТ…", "ta")}</div><div id="tbc-b">ЧАСТЬ 8</div></div>`;
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
  ["room_night", 0, S.window[1], 0.6],
  ["gunfire", 0.1, 1.2, 0.6],
  ["engine", L.l03.end, 3, 0.7],
  ["whistle_big", S.bomb[0] - 1.2, 2.9, 1.0],
  ["boom1", S.bomb[0] + 1.2, 3.4, 1.3],
  ["boom2", S.bomb[0] + 1.5, 4, 1.2],
  ["tinnitus", S.ruins[0], 4, 0.6],
  ["fire", S.ruins[0], S.ruins[1] - S.ruins[0], 0.5],
  ["gunfire", S.run[0] + 0.4, 1.5, 0.7],
  ["gunfire", S.run[0] + 2.0, 1.5, 0.6],
  ["buzz", L.l23.end - 0.6, 1.2, 0.4],
  ["crank", L.l25.start + 0.4, 1.4, 1.0],
  ["crank", L.l25.end + 0.3, 1.4, 1.0],
  ["engine", L.l27.start - 0.1, S.night[1] - L.l27.start, 0.8],
  ["gunfire", L.l29.end, 1.5, 0.9],
  ["boom1", L.l30.start + 0.3, 3.4, 0.6],
  ["boom2", L.l30.start + 0.8, 4, 0.5],
  ["click", W("фонарика") - 0.1, 0.06, 1.3],
].filter(([, , , v]) => v > 0);
const audio = [
  `<audio id="vo" class="clip" src="assets/vo.wav" data-start="0" data-duration="${r(L.l33.end + 0.1)}" data-track-index="10" data-volume="1"></audio>`,
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
<title>Глеб — часть 7</title>
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
