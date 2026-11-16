// "Глеб — часть 16": the medical tent, the outbreak, Petrovich the cat, the "Hive" pass.
// Run from gleb/p16: node build.mjs → index.html (sfx shared via assets/sfx symlink).
import fs from "node:fs";
import * as R from "../art/rig.js";
import * as F13 from "../p13/art13.js";
import * as F6 from "../p6/art6.js";
import * as F16 from "./art16.js";
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
const CUT = r(L.l44.end + 2.0);
const TITLE = [CUT, r(CUT + 3.2)];
const CARD_START = r(TITLE[1] + 0.1);
const CARD_DUR = 3.6;
const TOTAL = r(CARD_START + CARD_DUR);
const S = {};
{
  const ends = [
    ["drag", L.l03.end + 0.5],
    ["tent", L.l15.end + 0.6],
    ["outbreak", L.l19.end + 0.6],
    ["tent2", L.l24.end + 0.5],
    ["escape", L.l34.end + 0.6],
    ["drive", L.l37.end + 0.5],
    ["cab", L.l41.end + 0.4],
    ["pass", CUT],
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
const NIGHTC = `<rect x="-800" y="-800" width="4000" height="3520" fill="#060a20" opacity=".55"/>`;
const lie = (id, fx, fy, dx = 0, dy = 0) =>
  `<g id="${id}w" transform="translate(${dx} ${dy}) rotate(-90 ${fx} ${fy})">`;
const zarms = (id, at) => {
  pose(id, "armL", 40, at, 0.01);
  pose(id, "armL-lo", 50, at, 0.01);
  pose(id, "armR", -40, at, 0.01);
  pose(id, "armR-lo", -50, at, 0.01);
};
const flick = (k, t0, t1) =>
  T(
    `tl.to("#zm-${k} .flame", {keyframes:${JSON.stringify(Array.from({ length: Math.max(2, Math.round((t1 - t0) / 0.14)) }, (_, i) => ({ scaleY: 1 + ((i * 7) % 5) * 0.06, duration: 0.14 })))}, transformOrigin:"50% 100%"}, ${r(t0)});`,
  );
const kneel = (id, at) =>
  T(`tl.set("#${id} .legL, #${id} .legR", {scaleY:.45, svgOrigin:"0 0"}, ${r(at)});`);

/* S1 he drags her to the medical tent */
scene(
  "drag",
  `<g>${P("dg-art", F13.row(), -200, 1100, 2160)}</g>
   <g id="dg-all">
   ${lie("dg-m", 1500, 1080, -40, 0)}${C("dg-m", MB(), 1500, 1080)}</g>
   <g id="dg-xw" transform="translate(110 115)">${C("dg-mx", MXR(), 1330, 1080)}</g></g>`,
  { bg: "#2a2a5a" },
);
{
  const [a, b] = S.drag;
  camSet("drag", 1440, 880, 2.2, a, 900);
  kneel("dg-mx", a);
  expr("dg-mx", "cry", a);
  expr("dg-m", "pain", a);
  T(
    `tl.set("#dg-m .eyes-closed", {opacity:1}, ${r(a)}); tl.set("#dg-m .eyes-open", {opacity:0}, ${r(a)});`,
  );
  gesture("dg-mx", "duck", a, 0.01);
  gesture("dg-mx", "open", L.l02.start, 0.2);
  talk("dg-mx", "l02");
  camTo("drag", 1200, 860, 1.4, L.l03.start, L.l03.end - L.l03.start, 900, "sine.inOut");
  T(
    `tl.to("#dg-all", {x:-500, duration:${r(b - L.l03.start)}, ease:"power1.inOut"}, ${r(L.l03.start)});`,
  );
  blink("dg-mx", a, b);
}

/* S2 the operating table; an hour later */
scene(
  "tent",
  `${room(F16.medtent())}
   ${lie("tn-m", 760, 1060, 0, -275)}${C("tn-m", MB(), 760, 1060)}</g>
   ${C("tn-md", R.feldsher(), 880, 1060)}
   <g id="tn-xw">${C("tn-mx", MXR(), 180, 1060)}</g>
   <rect id="tn-black" x="-800" y="-800" width="2680" height="3520" fill="#000" opacity="0"/>`,
  { bg: "#d8d4c4" },
);
{
  const [a, b] = S.tent;
  camSet("tent", 540, 720, 1.3, a, 900);
  T(
    `tl.set("#tn-m .eyes-closed", {opacity:1}, ${r(a)}); tl.set("#tn-m .eyes-open", {opacity:0}, ${r(a)});`,
  );
  expr("tn-m", "pain", a);
  expr("tn-md", "determined", a);
  T(`tl.set("#tn-md", {scaleX:-1, svgOrigin:"880 1060"}, ${r(a)});`);
  expr("tn-mx", "cry", a);
  camTo("tent", 860, 700, 2.2, L.l04.start - 0.2, 0.4, 880, "power2.inOut");
  gesture("tn-md", "pointR", L.l04.start, 0.2);
  talk("tn-md", "l04");
  gesture("tn-md", "rest", L.l04.end, 0.3);
  camTo("tent", 200, 720, 2.2, L.l05.start - 0.2, 0.4, 880, "power2.inOut");
  talk("tn-mx", "l05");
  camTo("tent", 860, 700, 2.2, L.l06.start - 0.2, 0.4, 880, "power2.inOut");
  talk("tn-md", "l06");
  // an hour later
  T(
    `tl.to("#tn-black", {opacity:1, duration:.5, yoyo:true, repeat:1, repeatDelay:1.2}, ${r(L.l07.start)});`,
  );
  T(`tl.set("#tn-xw", {x:520}, ${r(L.l07.start + 0.6)});`);
  camTo("tent", 760, 720, 1.8, L.l08.start - 0.3, 0.5, 880, "power2.inOut");
  expr("tn-md", "tired", L.l08.start);
  talk("tn-md", "l08");
  camTo("tent", 700, 720, 2.4, L.l09.start - 0.2, 0.4, 880, "power2.inOut");
  talk("tn-mx", "l09");
  camTo("tent", 860, 700, 2.2, L.l10.start - 0.2, 0.4, 880, "power2.inOut");
  expr("tn-md", "happy", L.l10.start);
  talk("tn-md", "l10");
  camTo("tent", 700, 720, 2.2, L.l11.start - 0.2, 0.4, 880, "power2.inOut");
  expr("tn-mx", "happy", L.l11.start);
  T(
    `tl.to("#tn-mx .body", {keyframes:[{y:-4,duration:.12},{y:0,duration:.12}], repeat:3}, ${r(L.l11.start)});`,
  );
  talk("tn-mx", "l11");
  // she wakes
  camTo("tent", 480, 760, 2.6, L.l12.start - 0.3, 0.5, 880, "power2.inOut");
  T(
    `tl.set("#tn-m .eyes-closed", {opacity:0}, ${r(L.l12.start - 0.2)}); tl.set("#tn-m .eyes-squint", {opacity:1}, ${r(L.l12.start - 0.2)});`,
  );
  talk("tn-m", "l12");
  camTo("tent", 600, 740, 2.0, L.l13.start - 0.2, 0.4, 880, "power2.inOut");
  talk("tn-mx", "l13");
  camTo("tent", 480, 760, 2.6, L.l14.start - 0.2, 0.4, 880, "power2.inOut");
  expr("tn-m", "cry", L.l14.start);
  talk("tn-m", "l14");
  camTo("tent", 700, 720, 2.4, L.l15.start - 0.2, 0.4, 880, "power2.inOut");
  expr("tn-mx", "determined", L.l15.start);
  talk("tn-mx", "l15");
  ["tn-md", "tn-mx"].forEach((id) => blink(id, a, b));
}

/* S3 the outbreak */
const ZS = [
  [300, 1080, 0],
  [520, 1100, 1],
  [760, 1070, 2],
  [980, 1090, 0],
  [1200, 1080, 1],
];
scene(
  "outbreak",
  `<g>${P("ob-art", F13.row(), -200, 1100, 2160)}</g>${NIGHTC}
   ${F16.flames(200, 860, 1.4)}${F16.flames(1300, 850, 1.2)}${F16.flames(1800, 870, 1.5)}
   ${ZS.map(([x, f, v], i) => `<g id="ob-z${i}">${C(`ob-zr${i}`, R.zombie({ v }), x, f)}</g>`).join("")}
   ${C("ob-s1", R.soldier({ prop: "rifle" }), 1600, 1090)}
   ${C("ob-s2", R.soldier({ prop: "rifle" }), 1760, 1080)}
   ${F6.muzzle("ob-f1", 1480, 900, 0.6)}${F6.muzzle("ob-f2", 1640, 890, 0.6)}`,
  { bg: "#0a0c18" },
);
{
  const [a, b] = S.outbreak;
  camSet("outbreak", 1000, 760, 0.9, a, 900);
  flick("outbreak", a, b);
  ZS.forEach((_, i) => {
    expr(`ob-zr${i}`, "angry", a);
    zarms(`ob-zr${i}`, a);
    walk(`ob-zr${i}`, a + i * 0.2, b, 0, 0, 0.6, 12, false);
    T(`tl.to("#ob-z${i}", {x:220, duration:${r(b - a)}, ease:"none"}, ${r(a)});`);
  });
  ["ob-s1", "ob-s2"].forEach((id) => {
    expr(id, "scared", a);
    T(`tl.set("#${id}", {scaleX:-1, svgOrigin:"${id === "ob-s1" ? 1600 : 1760} 1080"}, ${r(a)});`);
  });
  camTo("outbreak", 1680, 720, 2.0, L.l17.start - 0.3, 0.5, 880, "power2.inOut");
  gesture("ob-s1", "pointR", L.l17.start, 0.2);
  talk("ob-s1", "l17");
  talk("ob-s2", "l18");
  for (let t = L.l18.start + 0.6; t < L.l19.end; t += 0.2)
    T(
      `tl.fromTo("#zm-outbreak .ob-f${Math.round(t * 5) % 2 ? 1 : 2}", {opacity:1}, {opacity:0, duration:.1, immediateRender:false}, ${r(t)});`,
    );
  camTo("outbreak", 700, 760, 1.4, L.l19.start, 1.2, 900, "power2.inOut");
  camTo("outbreak", 760, 740, 2.6, L.l19.start + 2.6, b - L.l19.start - 2.6, 880, "sine.in");
  ZS.forEach((_, i) => blink(`ob-zr${i}`, a, b));
}

/* S4 the medic gives them supplies */
scene(
  "tent2",
  `${room(F16.medtent())}${NIGHTC}
   ${F16.trolley(540, 960)}
   ${lie("t2-m", 700, 960, 0, 0)}${C("t2-m", MB(), 700, 960)}</g>
   ${C("t2-md", R.feldsher(), 880, 1060)}
   ${C("t2-mx", MXR(), 220, 1060)}`,
  { bg: "#0a0c18" },
);
{
  const [a, b] = S.tent2;
  camSet("tent2", 860, 700, 2.2, a, 880);
  T(`tl.set("#t2-md", {scaleX:-1, svgOrigin:"880 1060"}, ${r(a)});`);
  expr("t2-md", "scared", a);
  expr("t2-m", "pain", a);
  expr("t2-mx", "determined", a);
  talk("t2-md", "l20");
  camTo("tent2", 300, 720, 2.0, L.l21.start - 0.2, 0.4, 880, "power2.inOut");
  talk("t2-mx", "l21");
  camTo("tent2", 860, 700, 2.2, L.l22.start - 0.2, 0.4, 880, "power2.inOut");
  expr("t2-md", "determined", L.l22.start);
  gesture("t2-md", "pointR", L.l22.start + 0.3, 0.2);
  talk("t2-md", "l22");
  camTo("tent2", 300, 720, 2.2, L.l23.start - 0.2, 0.4, 880, "power2.inOut");
  talk("t2-mx", "l23");
  camTo("tent2", 860, 700, 2.2, L.l24.start - 0.2, 0.4, 880, "power2.inOut");
  expr("t2-md", "sad", L.l24.start);
  talk("t2-md", "l24");
  ["t2-md", "t2-mx"].forEach((id) => blink(id, a, b));
}

/* S5 the escape through the burning camp; the rifle; Petrovich the cat */
scene(
  "escape",
  `<g>${P("es-art", F13.row(), -200, 1100, 2160)}</g>${NIGHTC}
   ${F16.flames(500, 860, 1.3)}${F16.flames(1500, 850, 1.4)}
   <g id="es-sold">${lie("es-sd", 1100, 1090, 0, 0)}${C("es-sd", R.soldier({ prop: "rifle" }), 1100, 1090)}</g></g>
   <g id="es-grp">
     ${F16.trolley(400, 1000)}
     ${lie("es-m", 560, 1000, 0, 0)}${C("es-m", MB(), 560, 1000)}</g>
     <g id="es-x0">${C("es-mx", MXR(), 200, 1080)}</g>
     <g id="es-x1" opacity="0">${C("es-mxr", MXR({ prop: "rifle" }), 200, 1080)}</g>
   </g>
   ${[0, 1, 2, 3].map((i) => `<g id="es-z${i}" opacity="0">${C(`es-zr${i}`, R.zombie({ v: i }), 1500 + i * 140, 1080 + (i % 2) * 20)}</g>`).join("")}
   ${F10.cat("es-cat", 1300, 700, 0.8)}
   ${F6.muzzle("es-f", 1060, 900, 0.7)}`,
  { bg: "#0a0c18" },
);
{
  const [a, b] = S.escape;
  camSet("escape", 400, 800, 1.3, a, 900);
  flick("escape", a, b);
  T(`tl.set("#zm-escape .es-cat", {opacity:0}, ${r(a)});`);
  expr("es-mx", "pain", a);
  expr("es-m", "pain", a);
  T(
    `tl.set("#es-m .eyes-closed", {opacity:1}, ${r(a)}); tl.set("#es-m .eyes-open", {opacity:0}, ${r(a)});`,
  );
  walk("es-mx", a, L.l26.end, 0, 0, 0.4, 14);
  T(`tl.to("#es-grp", {x:700, duration:${r(L.l26.end - a)}, ease:"none"}, ${r(a)});`);
  camTo("escape", 1100, 820, 1.3, a, L.l26.end - a, 900, "none");
  camTo("escape", 1100, 1000, 2.2, L.l26.start + 1.0, 0.8, 900, "power2.inOut");
  // he takes the rifle
  camTo("escape", 900, 760, 2.2, L.l27.start - 0.2, 0.5, 880, "power2.inOut");
  expr("es-mx", "determined", L.l27.start);
  talk("es-mx", "l27");
  T(
    `tl.set("#es-x0", {opacity:0}, ${r(L.l27.end)}); tl.set("#es-x1", {opacity:1}, ${r(L.l27.end)});`,
  );
  T(`tl.set("#es-sd", {opacity:0}, ${r(L.l27.end)});`);
  expr("es-mxr", "determined", a);
  // a zombie lurches out
  [0, 1, 2, 3].forEach((i) => {
    expr(`es-zr${i}`, "angry", a);
    zarms(`es-zr${i}`, a);
    T(
      `tl.set("#es-z${i}", {opacity:1}, ${r(i === 0 ? L.l28.start : L.l30.start + 0.6 + i * 0.3)});`,
    );
    walk(`es-zr${i}`, L.l28.start, b, 0, 0, 0.55, 12, false);
    T(
      `tl.to("#es-z${i}", {x:-260, duration:${r(b - L.l28.start)}, ease:"none"}, ${r(L.l28.start)});`,
    );
  });
  camTo("escape", 1200, 780, 1.4, L.l28.start, 0.5, 900, "power2.out");
  gesture("es-mxr", "pointR", L.l29.start, 0.2);
  talk("es-mxr", "l29");
  const burst = W("очередь");
  [0, 0.12, 0.24, 0.36].forEach((d) =>
    T(
      `tl.fromTo("#zm-escape .es-f", {opacity:1}, {opacity:0, duration:.08, immediateRender:false}, ${r(burst + d)});`,
    ),
  );
  T(`tl.to("#es-z0", {opacity:0, y:40, duration:.4}, ${r(burst + 0.4)});`);
  shake("#sh-escape", burst, 6, 6);
  T(
    `tl.set("#es-m .eyes-closed", {opacity:0}, ${r(L.l31.start - 0.2)}); tl.set("#es-m .eyes-wide", {opacity:1}, ${r(L.l31.start - 0.2)});`,
  );
  expr("es-m", "shock", L.l31.start - 0.2);
  camTo("escape", 1260, 820, 1.8, L.l31.start - 0.2, 0.4, 900, "power2.inOut");
  talk("es-m", "l31");
  // Petrovich!
  T(`tl.set("#zm-escape .es-cat", {opacity:1}, ${r(L.l32.start + 0.8)});`);
  T(
    `tl.fromTo("#zm-escape .es-cat", {x:-300, y:200}, {keyframes:[{x:100, y:-80, duration:.35, ease:"power1.out"},{x:390, y:20, duration:.35, ease:"power1.in"}], immediateRender:false}, ${r(L.l32.start + 0.8)});`,
  );
  camTo("escape", 1640, 760, 2.2, L.l33.start - 0.3, 0.4, 880, "power2.out");
  T(
    `tl.to("#zm-escape .es-cat", {keyframes:[{rotation:-12,duration:.08},{rotation:12,duration:.08}], svgOrigin:"1690 720", repeat:8}, ${r(L.l33.start)});`,
  );
  T(
    `tl.to("#es-z1", {rotation:-80, svgOrigin:"1640 1100", y:40, duration:.5, ease:"power2.in"}, ${r(W("рухнул", 1, L.l33.start))});`,
  );
  camTo("escape", 1100, 780, 2.0, L.l34.start - 0.2, 0.4, 880, "power2.inOut");
  expr("es-mxr", "happy", L.l34.start);
  talk("es-mxr", "l34");
  ["es-mx", "es-mxr"].forEach((id) => blink(id, a, b));
}

/* S6 the Moskvich out of the burning camp */
scene(
  "drive",
  `<g>${P("dv-art", F13.row(), -200, 1100, 2160)}</g>${NIGHTC}
   ${F16.flames(700, 860, 1.3)}${F16.flames(1700, 850, 1.4)}
   <g id="dv-car">${P("dv-cart", F2.car({ lights: true, color: "#c9b48a" }), 400, 1060, 480)}</g>`,
  { bg: "#0a0c18" },
);
{
  const [a, b] = S.drive;
  camSet("drive", 640, 860, 1.3, a, 900);
  flick("drive", a, b);
  shake("#dv-car", L.l37.start, 8, 3);
  T(
    `tl.to("#dv-car", {x:1400, duration:${r(b - L.l37.start - 0.6)}, ease:"power2.in"}, ${r(L.l37.start + 0.6)});`,
  );
  spinWheels("#dv-cart .wheel", L.l37.start + 0.6, b, 1440);
  camTo("drive", 1300, 860, 1.1, L.l37.start + 0.6, b - L.l37.start - 0.6, 900, "power1.in");
}

/* S7 the road: the radio; she hands him the jacket */
scene("cab", cabH("cb", { night: true }, F10.cat("cb-cat", 545, 705, 1.3)), { bg: "#05060c" });
{
  const [a, b] = S.cab;
  camSet("cab", 540, 600, 1.4, a, 900);
  scroll("#cb-back .street", a, b, -1800);
  bump("cab", a, b);
  gesture("cb-mx", "wheel", a, 0.01);
  expr("cb-mx", "determined", a);
  expr("cb-m", "pain", a);
  T(`tl.set("#cb-m", {y:60}, ${r(a)});`);
  camTo("cab", 735, 760, 2.6, L.l38.start - 0.3, 0.6, 880, "power2.inOut");
  T(
    `tl.fromTo("#radio", {opacity:1}, {keyframes:[{opacity:.6,duration:.3},{opacity:1,duration:.3}], repeat:10, immediateRender:false}, ${r(L.l38.start)});`,
  );
  camTo("cab", 770, 600, 2.2, L.l39.start - 0.3, 0.5, 860, "power2.inOut");
  talk("cb-m", "l39");
  camTo("cab", 330, 560, 2.2, L.l40.start - 0.3, 0.5, 860, "power2.inOut");
  expr("cb-mx", "angry", L.l40.start);
  talk("cb-mx", "l40");
  camTo("cab", 770, 600, 2.2, L.l41.start - 0.3, 0.5, 860, "power2.inOut");
  talk("cb-m", "l41");
  ["cb-m", "cb-mx"].forEach((id) => blink(id, a, b));
}

/* S8 the pass */
scene("pass", room(F16.pass()), { bg: "#141820" });
{
  const [a, b] = S.pass;
  camSet("pass", 540, 560, 1.0, a, 900);
  camTo("pass", 540, 560, 1.45, a, L.l43.end - a, 900, "sine.inOut");
  camTo("pass", 560, 580, 1.65, L.l44.start - 0.2, b - L.l44.start, 900, "power1.in");
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
  "врача беременна жить сердце бьётся папу живы гуль вирус каталку петрович зверь карантин улей соколов".split(
    " ",
  ),
);
const DANGER = new Set("кусаются стреляй голову урод сзади".split(" "));
const hook = `<div id="hook" class="clip toptitle" data-start="0.2" data-duration="${r(L.l01.start - 0.1)}" data-track-index="2" style="z-index:5"><div class="tt-s">${spl("ГЛЕБ", "hs")}</div><div class="tt-a">${spl("ЧАСТЬ 16", "ha")}</div></div>`;
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
  stamp("st-hour", L.l07.start + 0.3, L.l07.end + 0.4, "1 ЧАС СПУСТЯ", "#9fd2ff"),
  stamp("st-cat", L.l32.start + 0.9, L.l33.end, "МЯУ!!!", "#ffb02e"),
].join("\n");
const title = `<div id="tbc" class="clip" data-start="${TITLE[0]}" data-duration="${r(TITLE[1] - TITLE[0])}" data-track-index="4" style="z-index:8"><div id="tbc-a">${spl("ПРОДОЛЖЕНИЕ СЛЕДУЕТ…", "ta")}</div><div id="tbc-b">ЧАСТЬ 17</div></div>`;
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
  ["room_night", 0, S.tent[1] > 31 ? 31 : S.tent[1], 0.4],
  ["room_night", 31, Math.max(0.5, S.tent[1] - 31), 0.4],
  ["fire", S.outbreak[0], S.outbreak[1] - S.outbreak[0], 0.6],
  ["gunfire", L.l18.start + 0.6, 1.5, 0.9],
  ["gunfire", L.l18.end + 0.2, 1.5, 0.8],
  ["fire", S.escape[0], S.drive[1] - S.escape[0] > 20 ? 20 : S.drive[1] - S.escape[0], 0.55],
  ["fire", S.escape[0] + 20, Math.max(0.5, S.drive[1] - S.escape[0] - 20), 0.55],
  ["gunfire", W("очередь"), 0.6, 1.2],
  ["buzz", L.l32.start + 0.8, 1.2, 0.7],
  ["engine", L.l37.start, S.cab[1] - L.l37.start, 0.7],
  ["buzz", L.l38.start - 0.2, 1.2, 0.4],
  ["room_night", S.pass[0], CUT - S.pass[0], 0.5],
].filter(([, , , v]) => v > 0);
const audio = [
  `<audio id="vo" class="clip" src="assets/vo.wav" data-start="0" data-duration="${r(L.l44.end + 0.1)}" data-track-index="10" data-volume="1"></audio>`,
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
<title>Глеб — часть 16</title>
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
