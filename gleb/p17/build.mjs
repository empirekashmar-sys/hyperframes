// "Глеб — часть 17": the shop, Zina's yellow bus, the Hive on the old chemical plant, a tracker.
// Run from gleb/p17: node build.mjs → index.html (sfx shared via assets/sfx symlink).
import fs from "node:fs";
import * as R from "../art/rig.js";
import * as F16 from "../p16/art16.js";
import * as F17 from "./art17.js";
import * as F11 from "../p11/art11.js";
import * as F15 from "../p15/art15.js";
import * as F2 from "../p2/art2.js";
import * as F10 from "../p10/art10.js";

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
const CUT = r(L.l42.end + 2.0);
const TITLE = [CUT, r(CUT + 3.2)];
const CARD_START = r(TITLE[1] + 0.1);
const CARD_DUR = 3.6;
const TOTAL = r(CARD_START + CARD_DUR);
const S = {};
{
  const ends = [
    ["dawn", L.l02.end + 0.4],
    ["shop", L.l04.end + 1.4],
    ["inside", L.l12.end + 0.5],
    ["bus", L.l17.end + 0.6],
    ["busin", L.l39.end + 0.4],
    ["pass", L.l41.end + 0.4],
    ["horizon", CUT],
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
    <div class="cam" id="cam-${key}"><svg viewBox="0 0 1080 1920" width="1080" height="1920"><rect x="-500" y="-500" width="2080" height="2920" fill="${bg}"/><g id="sh-${key}"><g id="zm-${key}" transform="matrix(1 0 0 1 0 0)">${world}</g></g>${overlay}</svg></div>
    <div class="grade"></div>
  </div>`);
  // living camera: a soft push-in on every cut and a slow hand-held drift (HTML layer, never the SVG camera)
  T(
    `tl.fromTo("#cam-${key}", {scale:1.07}, {scale:1, duration:.7, ease:"power3.out", immediateRender:false}, ${r(a)});`,
  );
  const n = Math.max(1, Math.floor((b - a) / 2.2));
  T(
    `tl.to("#cam-${key}", {keyframes:${JSON.stringify(Array.from({ length: n }, (_, i) => ({ x: [3, -2, 2, -3][i % 4], y: [-2, 3, -3, 2][i % 4], rotation: [0.15, -0.1, 0.1, -0.15][i % 4], duration: (b - a) / n, ease: "sine.inOut" })))}}, ${r(a)});`,
  );
}
const camM = (px, py, s, sy) => `matrix(${s} 0 0 ${s} ${r(540 - s * px)} ${r(sy - s * py)})`;
const camSet = (key, px, py, s, at, sy = 880) =>
  T(`tl.set("#zm-${key}", {attr:{transform:"${camM(px, py, s, sy)}"}}, ${r(at)});`);
const camTo = (key, px, py, s, at, dur, sy = 880, ease = "sine.inOut") =>
  T(
    `tl.to("#zm-${key}", {attr:{transform:"${camM(px, py, s, sy)}"}, duration:${r(dur)}, ease:"${ease}"}, ${r(at)});`,
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
const MXS = (o = {}) => R.maxim({ uniform: true, shaved: true, prop: "", brow: "neutral", ...o });
const MB = (o = {}) => R.masha({ outfit: "black", ...o });
const shake = (sel, at, n = 6, amp = 14) =>
  T(
    `tl.to("${sel}", {keyframes:${JSON.stringify(Array.from({ length: n }, (_, i) => ({ x: (i % 2 ? -1 : 1) * amp * (1 - i / n), y: ((i % 3) - 1) * amp * 0.6 * (1 - i / n), duration: 0.05 })).concat([{ x: 0, y: 0, duration: 0.05 }]))}}, ${r(at)});`,
  );

const scroll = (sel, t0, t1, dx = -1600) =>
  T(`tl.to("${sel}", {x:${dx}, duration:${r(t1 - t0)}, ease:"none"}, ${r(t0)});`);
const bump = (k, t0, t1) =>
  T(
    `tl.to("#sh-${k}", {keyframes:[{y:3,duration:.2},{y:0,duration:.2}], repeat:${Math.max(0, Math.round((t1 - t0) / 0.4) - 1)}}, ${r(t0)});`,
  );
const MXH = (o = {}) => MXS({ helmet: true, ...o });
const cabH = (k, opts, extra = "", south = false) =>
  `<g id="${k}-back">${south ? SOUTH(room(F10.fields(opts))) : room(F10.fields(opts))}</g>
   ${extra}
   ${C(`${k}-mx`, MXH(), 330, 805)}
   ${C(`${k}-m`, MB(), 770, 805)}
   ${room(F2.cabFront({ lit: true }))}`;
const spinWheels = (sel, t0, t1, deg = 1440) =>
  T(
    `tl.to("${sel}", {rotation:"+=${deg}", transformOrigin:"50% 50%", duration:${r(t1 - t0)}, ease:"none"}, ${r(t0)});`,
  );
const room = (x) => strip(x);
const MXR = (o = {}) => MXS({ helmet: true, ...o });
const zarms = (id, at) => {
  pose(id, "armL", 40, at, 0.01);
  pose(id, "armL-lo", 50, at, 0.01);
  pose(id, "armR", -40, at, 0.01);
  pose(id, "armR-lo", -50, at, 0.01);
};
const show = (sel, at) => T(`tl.set("${sel}", {opacity:1}, ${r(at)});`);
const ZN = (o = {}) => R.zina({ brow: "neutral", ...o });

/* S1 dawn on an empty road */
scene("dawn", cabH("dw", { sunset: true }, F10.cat("dw-cat", 545, 705, 1.3)), { bg: "#3a2a5a" });
{
  const [a, b] = S.dawn;
  camSet("dawn", 540, 600, 1.4, a, 900);
  scroll("#dw-back .street", a, b, -1400);
  bump("dawn", a, b);
  gesture("dw-mx", "wheel", a, 0.01);
  expr("dw-mx", "tired", a);
  T(
    `tl.set("#dw-m .eyes-closed", {opacity:1}, ${r(a)}); tl.set("#dw-m .eyes-open", {opacity:0}, ${r(a)});`,
  );
  pose("dw-m", "head", -14, a, 0.01);
  T(`tl.set("#zm-dawn .cat-eyes", {scaleY:.15, transformOrigin:"50% 50%"}, ${r(a)});`);
  camTo("dawn", 700, 580, 2.0, a + 1.0, 2.4, 860, "sine.inOut");
  camTo("dawn", 330, 560, 2.2, L.l02.start - 0.3, 0.5, 860, "power2.inOut");
  talk("dw-mx", "l02");
  blink("dw-mx", a, b);
}

/* S2 the shop by the road */
scene(
  "shop",
  `${room(F17.shop())}
   ${P("sp-cart", F2.car({ lights: false, color: "#c9b48a" }), -260, 1000, 420)}
   <g id="sp-mxw">${C("sp-mx", MXR({ prop: "rifle" }), 200, 1060)}</g>`,
  { bg: "#5a6a9a" },
);
{
  const [a, b] = S.shop;
  camSet("shop", 540, 620, 1.1, a, 900);
  expr("sp-mx", "tired", a);
  camTo("shop", 300, 720, 2.0, L.l04.start - 0.2, 0.5, 880, "power2.inOut");
  talk("sp-mx", "l04");
  walk("sp-mx", L.l04.end, b, 0, 0, 0.36, 16);
  T(`tl.to("#sp-mxw", {x:560, duration:${r(b - L.l04.end)}, ease:"none"}, ${r(L.l04.end)});`);
  camTo("shop", 680, 720, 1.6, L.l04.end, b - L.l04.end, 880, "none");
  blink("sp-mx", a, b);
}

/* S3 inside: three of them, and an empty magazine */
scene(
  "inside",
  `${room(F17.shopIn())}
   <g id="in-mxw">${C("in-mx", MXR({ prop: "rifle" }), 300, 1060)}</g>
   ${[0, 1, 2].map((i) => `<g id="in-z${i}" opacity="0">${C(`in-zr${i}`, R.zombie({ v: i }), 640 + i * 150, 1070 + (i % 2) * 20)}</g>`).join("")}`,
  { bg: "#2a2a30" },
);
{
  const [a, b] = S.inside;
  camSet("inside", 400, 700, 1.6, a, 900);
  expr("in-mx", "scared", a);
  walk("in-mx", a + 0.2, L.l06.start, 0, 0, 0.4, 14);
  T(`tl.to("#in-mxw", {x:120, duration:${r(L.l06.start - a - 0.2)}, ease:"none"}, ${r(a + 0.2)});`);
  camTo("inside", 420, 720, 2.2, L.l06.start - 0.2, 0.5, 880, "power2.inOut");
  expr("in-mx", "happy", W("сгущёнка") - 0.2);
  talk("in-mx", "l06");
  camTo("inside", 780, 720, 1.6, L.l07.start, 0.8, 880, "power2.inOut");
  expr("in-mx", "scared", L.l08.start);
  camTo("inside", 420, 720, 2.2, L.l08.start - 0.2, 0.4, 880, "power2.inOut");
  talk("in-mx", "l08");
  [0, 1, 2].forEach((i) => {
    expr(`in-zr${i}`, "angry", a);
    zarms(`in-zr${i}`, a);
    T(`tl.to("#in-z${i}", {opacity:1, duration:.4}, ${r(L.l09.start + 0.6 + i * 0.4)});`);
    walk(`in-zr${i}`, L.l09.start + 0.6, b, 0, 0, 0.6, 12, false);
    T(
      `tl.to("#in-z${i}", {x:-110, duration:${r(b - L.l09.start - 0.6)}, ease:"none"}, ${r(L.l09.start + 0.6)});`,
    );
  });
  camTo("inside", 760, 760, 1.4, L.l09.start + 0.4, 0.6, 900, "power2.inOut");
  camTo("inside", 420, 720, 2.2, L.l10.start - 0.2, 0.4, 880, "power2.inOut");
  expr("in-mx", "angry", L.l10.start);
  gesture("in-mx", "pointR", L.l10.start + 0.3, 0.2);
  talk("in-mx", "l10");
  camTo("inside", 440, 760, 2.8, W("щёлкнул") - 0.3, 0.4, 880, "power2.out");
  expr("in-mx", "shock", L.l12.start);
  camTo("inside", 560, 720, 1.8, L.l12.start - 0.2, 0.4, 880, "power2.inOut");
  talk("in-mx", "l12");
  blink("in-mx", a, b);
}

/* S4 the yellow bus through the window — Zina! */
scene(
  "bus",
  `${room(F17.shop())}
   ${[0, 1].map((i) => `<g id="bs-z${i}">${C(`bs-zr${i}`, R.zombie({ v: i + 1 }), 760 + i * 130, 1060)}</g>`).join("")}
   <g id="bs-bw">${F17.bus("bs-bus", -900, 1040, 1.0)}</g>
   <g id="bs-zw" opacity="0">${C("bs-zn", ZN(), 660, 1060)}</g>
   <g id="bs-mxw" opacity="0">${C("bs-mx", MXR({ prop: "rifle" }), 300, 1060)}</g>
   <g id="bs-shards" opacity="0">${Array.from({ length: 8 }, (_, i) => `<path transform="translate(${300 + i * 40} ${700 + (i % 3) * 30}) rotate(${i * 40})" d="M-10 -8 L12 -4 L4 10Z" fill="#9fb0c8" stroke="#0b0d14" stroke-width="1.4"/>`).join("")}</g>`,
  { bg: "#5a6a9a" },
);
{
  const [a, b] = S.bus;
  camSet("bus", 540, 700, 1.1, a, 900);
  [0, 1].forEach((i) => {
    expr(`bs-zr${i}`, "angry", a);
    zarms(`bs-zr${i}`, a);
  });
  const hit = W("снёс") + 0.2;
  T(`tl.to("#bs-bw", {x:1000, duration:${r(hit - a)}, ease:"power2.in"}, ${r(a)});`);
  spinWheels("#zm-bus .wheel", a, hit, 1080);
  shake("#sh-bus", hit, 10, 18);
  T(`tl.to("#zm-bus .glass", {opacity:0, duration:.05}, ${r(hit)});`);
  T(
    `tl.fromTo("#bs-shards", {opacity:1, y:0}, {opacity:0, y:120, duration:.8, immediateRender:false}, ${r(hit)});`,
  );
  T(
    `tl.to("#bs-z0, #bs-z1", {x:400, rotation:-60, svgOrigin:"760 1060", opacity:0, duration:.5, ease:"power2.out", stagger:.1}, ${r(hit)});`,
  );
  show("#bs-zw", L.l15.start - 0.3);
  expr("bs-zn", "angry", a);
  gesture("bs-zn", "fist", L.l15.start, 0.2);
  camTo("bus", 660, 720, 2.2, L.l15.start - 0.3, 0.4, 880, "power2.out");
  talk("bs-zn", "l15");
  show("#bs-mxw", L.l16.start - 0.3);
  expr("bs-mx", "shock", a);
  camTo("bus", 460, 720, 1.7, L.l16.start - 0.3, 0.4, 880, "power2.inOut");
  talk("bs-mx", "l16");
  expr("bs-zn", "happy", L.l17.start);
  gesture("bs-zn", "pointR", L.l17.start + 0.3, 0.2);
  talk("bs-zn", "l17");
  ["bs-zn", "bs-mx"].forEach((id) => blink(id, a, b));
}

/* S5 inside the bus: Zina, Masha, the soldier */
scene(
  "busin",
  `${room(F17.busIn())}
   ${C("bi-m", MB(), 200, 960)}
   ${C("bi-s", R.soldier({ brow: "worried" }), 920, 960)}
   ${room(F17.seatsFront())}
   ${C("bi-zn", ZN(), 470, 1060)}
   ${C("bi-mx", MXR(), 640, 1060)}
   ${F10.cat("bi-cat", 40, 790, 0.6)}
   <g id="bi-bag" opacity="0"><path d="M520 860 q30 -40 60 0 v40 h-60z" fill="#8a3a4a" stroke="#0b0d14" stroke-width="2"/></g>`,
  { bg: "#c9b48a" },
);
{
  const [a, b] = S.busin;
  camSet("busin", 560, 700, 1.25, a, 900);
  T(`tl.to("#zm-busin .street", {x:-900, duration:${r(b - a)}, ease:"none"}, ${r(a)});`);
  bump("busin", a, b);
  expr("bi-zn", "happy", a);
  expr("bi-mx", "happy", a);
  expr("bi-s", "pain", a);
  T(`tl.set("#bi-m", {opacity:0}, ${r(a)});`);
  camTo("busin", 470, 720, 2.2, L.l19.start - 0.2, 0.4, 880, "power2.inOut");
  talk("bi-zn", "l19");
  camTo("busin", 640, 720, 2.2, L.l20.start - 0.2, 0.4, 880, "power2.inOut");
  talk("bi-mx", "l20");
  expr("bi-mx", "scared", L.l21.start);
  talk("bi-mx", "l21");
  // Masha is carried in
  T(`tl.to("#bi-m", {opacity:1, duration:.5}, ${r(L.l22.start + 0.4)});`);
  expr("bi-m", "pain", a);
  camTo("busin", 200, 720, 2.0, L.l22.start + 0.2, 0.6, 880, "power2.inOut");
  // Zina notices
  camTo("busin", 470, 720, 2.2, L.l23.start - 0.2, 0.4, 880, "power2.inOut");
  expr("bi-zn", "neutral", L.l23.start);
  pose("bi-zn", "head", -10, L.l23.start + 0.4, 0.3);
  talk("bi-zn", "l23");
  camTo("busin", 640, 720, 2.2, L.l24.start - 0.2, 0.4, 880, "power2.inOut");
  expr("bi-mx", "scared", L.l24.start);
  gesture("bi-mx", "headR", L.l24.start, 0.3);
  talk("bi-mx", "l24");
  gesture("bi-mx", "rest", L.l24.end, 0.3);
  camTo("busin", 200, 720, 2.2, L.l25.start - 0.2, 0.4, 880, "power2.inOut");
  expr("bi-m", "sad", L.l25.start);
  talk("bi-m", "l25");
  // the handbag
  camTo("busin", 560, 720, 1.8, L.l26.start - 0.2, 0.3, 880, "power2.out");
  expr("bi-zn", "angry", L.l26.start);
  gesture("bi-zn", "fist", L.l26.start + 0.2, 0.2);
  talk("bi-zn", "l26");
  show("#bi-bag", L.l27.start);
  [0, 0.7].forEach((d) => {
    T(
      `tl.fromTo("#bi-bag", {x:0, rotation:0}, {x:90, rotation:40, svgOrigin:"550 860", duration:.18, yoyo:true, repeat:1, immediateRender:false}, ${r(W("огрела") + d)});`,
    );
    shake("#bi-mx", W("огрела") + d + 0.18, 4, 6);
  });
  expr("bi-mx", "pain", W("огрела") + 0.2);
  talk("bi-mx", "l28");
  expr("bi-zn", "cry", L.l29.start);
  talk("bi-zn", "l29");
  T(`tl.set("#bi-bag", {opacity:0}, ${r(L.l30.start)});`);
  expr("bi-zn", "sad", L.l30.start);
  talk("bi-zn", "l30");
  // the soldier saw the helicopter
  camTo("busin", 920, 700, 2.2, L.l31.start - 0.2, 0.5, 880, "power2.inOut");
  talk("bi-s", "l31");
  camTo("busin", 640, 720, 2.2, L.l32.start - 0.2, 0.4, 880, "power2.inOut");
  expr("bi-mx", "determined", L.l32.start);
  talk("bi-mx", "l32");
  camTo("busin", 920, 700, 2.2, L.l33.start - 0.2, 0.4, 880, "power2.inOut");
  expr("bi-s", "scared", L.l33.start);
  talk("bi-s", "l33");
  talk("bi-s", "l34");
  camTo("busin", 640, 720, 2.4, L.l35.start - 0.2, 0.4, 880, "power2.inOut");
  expr("bi-mx", "angry", L.l35.start);
  talk("bi-mx", "l35");
  camTo("busin", 200, 720, 2.2, L.l36.start - 0.2, 0.4, 880, "power2.inOut");
  expr("bi-m", "scared", L.l36.start);
  talk("bi-m", "l36");
  camTo("busin", 470, 720, 2.2, L.l37.start - 0.2, 0.4, 880, "power2.inOut");
  expr("bi-zn", "determined", L.l37.start);
  talk("bi-zn", "l37");
  // the beeping
  camTo("busin", 640, 820, 2.6, L.l38.start, 0.6, 900, "power2.inOut");
  expr("bi-mx", "shock", L.l39.start);
  talk("bi-mx", "l39");
  ["bi-zn", "bi-mx", "bi-m", "bi-s"].forEach((id) => blink(id, a, b));
}

/* S6 the pass with a blinking red dot */
scene(
  "pass",
  `${room(F16.pass())}<circle id="ps-dot" cx="820" cy="420" r="16" fill="#ff2a1f"/><circle id="ps-ring" cx="820" cy="420" r="16" fill="none" stroke="#ff2a1f" stroke-width="4"/>`,
  { bg: "#141820" },
);
{
  const [a, b] = S.pass;
  camSet("pass", 700, 480, 1.6, a, 900);
  T(
    `tl.to("#ps-dot", {opacity:.2, duration:.25, yoyo:true, repeat:${Math.round((b - a) / 0.25)}}, ${r(a)});`,
  );
  T(
    `tl.fromTo("#ps-ring", {scale:1, opacity:1, svgOrigin:"820 420"}, {scale:4, opacity:0, svgOrigin:"820 420", duration:.8, repeat:${Math.round((b - a) / 0.8)}, immediateRender:false}, ${r(a)});`,
  );
  camTo("pass", 780, 440, 2.6, a + 0.4, b - a - 0.4, 900, "power1.in");
}

/* S7 the bus on the road; a black dot on the horizon */
scene(
  "horizon",
  `<g>${P("hz-art", F11.steppe(), -540, 1100, 2160)}</g>
   <g id="hz-bw">${F17.bus("hz-bus", 180, 1010, 0.9)}</g>
   <g id="hz-hw">${F15.heli("hz-heli", 900, 420, 0.25)}</g>`,
  { bg: "#8fb4dc" },
);
{
  const [a, b] = S.horizon;
  camSet("horizon", 540, 760, 1.15, a, 900);
  spinWheels("#zm-horizon .wheel", a, b, 1440);
  T(`tl.to("#zm-horizon .lane", {x:-300, duration:${r(b - a)}, ease:"none"}, ${r(a)});`);
  T(
    `tl.to("#hz-hw", {scale:3, svgOrigin:"900 420", x:-200, y:80, duration:${r(b - a)}, ease:"power2.in"}, ${r(a)});`,
  );
  T(
    `tl.to("#zm-horizon .rotor", {scaleX:.1, svgOrigin:"0 -102", duration:.06, yoyo:true, repeat:${Math.round((b - a) / 0.06)}}, ${r(a)});`,
  );
  camTo("horizon", 760, 560, 1.6, L.l42.start + 0.8, b - L.l42.start - 0.8, 900, "power1.in");
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
  feldsher: ["ФЕЛЬДШЕР", "#9fe0d0"],
  neighbor: ["БАБА ВАЛЯ", "#e0b3ff"],
  volunteer: ["ВОЛОНТЁР", "#9fe0d0"],
  valkyrie: ["ВАЛЬКИРИЯ", "#9fd8ff"],
  medic: ["ВРАЧ", "#9fe0d0"],
};
const HOT = new Set(
  "сгущёнка зина живая жених автобус женщина беременна сердце береги вертолёт химзавод улей дорога маячок".split(
    " ",
  ),
);
const DANGER = new Set("пусто ёб нечисть кобель".split(" "));
const hook = `<div id="hook" class="clip toptitle" data-start="0.2" data-duration="${r(L.l01.start - 0.1)}" data-track-index="2" style="z-index:5"><div class="tt-s">${spl("ГЛЕБ", "hs")}</div><div class="tt-a">${spl("ЧАСТЬ 17", "ha")}</div></div>`;
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
  stamp("st-click", W("щёлкнул"), W("щёлкнул") + 1.0, "ЩЁЛК", "#e9eef5"),
  stamp("st-beep", L.l38.start + 0.6, L.l39.end, "ПИ-ПИ-ПИ", "#ff4a3d"),
  stamp("st-bonk", W("огрела"), W("огрела") + 1.4, "БАЦ!", "#ffb02e"),
].join("\n");
const title = `<div id="tbc" class="clip" data-start="${TITLE[0]}" data-duration="${r(TITLE[1] - TITLE[0])}" data-track-index="4" style="z-index:8"><div id="tbc-a">${spl("ПРОДОЛЖЕНИЕ СЛЕДУЕТ…", "ta")}</div><div id="tbc-b">ЧАСТЬ 18</div></div>`;
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
  ["engine", 0, S.dawn[1], 0.55],
  ["room_day", S.shop[0], S.inside[1] - S.shop[0], 0.35],
  ["door", S.inside[0] + 0.1, 0.35, 0.8],
  ["click", W("щёлкнул"), 0.06, 1.4],
  ["click", W("щёлкнул") + 0.25, 0.06, 1.4],
  ["truck", L.l13.start, 6, 0.8],
  ["glass", W("снёс") + 0.2, 0.6, 1.3],
  ["slam", W("снёс") + 0.2, 0.5, 1.2],
  ["engine", S.busin[0], 24, 0.45],
  ["engine", S.busin[0] + 24, 24, 0.45],
  ["engine", S.busin[0] + 48, 24, 0.45],
  ["engine", S.busin[0] + 72, Math.max(0.5, S.busin[1] - S.busin[0] - 72), 0.45],
  ["slam", W("огрела"), 0.5, 0.9],
  ["slam", W("огрела") + 0.7, 0.5, 0.9],
  ["buzz", L.l38.start + 0.5, 1.2, 0.6],
  ["buzz", S.pass[0], 1.2, 0.6],
  ["tank", S.horizon[0], CUT - S.horizon[0], 0.5],
].filter(([, , , v]) => v > 0);
const audio = [
  `<audio id="vo" class="clip" src="assets/vo.wav" data-start="0" data-duration="${r(L.l42.end + 0.1)}" data-track-index="10" data-volume="1"></audio>`,
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
<title>Глеб — часть 17</title>
<script src="assets/gsap.min.js"></script>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { width: 1080px; height: 1920px; overflow: hidden; background: #05070c; font-family: "Inter", sans-serif; }
  #root { position: absolute; inset: 0; background: #05070c; overflow: hidden; }
  .scene { position: absolute; inset: 0; overflow: hidden; }
  .scene svg { position: absolute; left: 0; top: 0; }
  .scene .cam { position: absolute; inset: -30px; transform-origin: 50% 46%; }
  .scene .cam svg { left: 30px; top: 30px; }
  .scene .grade { position: absolute; inset: 0; pointer-events: none; background:
      radial-gradient(ellipse 70% 45% at 30% 18%, rgba(255,214,160,.16), rgba(255,214,160,0) 70%),
      linear-gradient(180deg, rgba(10,12,30,.0) 55%, rgba(10,12,30,.28) 100%); mix-blend-mode: normal; }
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
