// "Глеб — часть 19": Omega in full kit, Valkyrie aboard, the gas station, Masha, the horde.
// Run from gleb/p19: node build.mjs → index.html (sfx shared via assets/sfx symlink).
import fs from "node:fs";
import * as R from "../art/rig.js";
import * as F18 from "../p18/art18.js";
import * as F19 from "./art19.js";
import * as F17 from "../p17/art17.js";
import * as F15 from "../p15/art15.js";

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
const CUT = r(L.l41.end + 2.0);
const TITLE = [CUT, r(CUT + 3.2)];
const CARD_START = r(TITLE[1] + 0.1);
const CARD_DUR = 3.6;
const TOTAL = r(CARD_START + CARD_DUR);
const S = {};
{
  const ends = [
    ["brief", L.l02.end + 0.6],
    ["hangar", L.l12.end + 0.7],
    ["fly", L.l13.end + 0.6],
    ["cabin", L.l16.end + 0.6],
    ["station", CUT],
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
let seed = 83;
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
const GO = (o = {}) => R.gleb({ omega: true, brow: "neutral", ...o });
const OM = (v, o = {}) => R.omega({ v, ...o });
const room = (x) => strip(x);
const show = (sel, at) => T(`tl.set("${sel}", {opacity:1}, ${r(at)});`);
const hide = (sel, at) => T(`tl.set("${sel}", {opacity:0}, ${r(at)});`);
const shake = (sel, at, n = 6, amp = 14) =>
  T(
    `tl.to("${sel}", {keyframes:${JSON.stringify(Array.from({ length: n }, (_, i) => ({ x: (i % 2 ? -1 : 1) * amp * (1 - i / n), y: ((i % 3) - 1) * amp * 0.6 * (1 - i / n), duration: 0.05 })).concat([{ x: 0, y: 0, duration: 0.05 }]))}}, ${r(at)});`,
  );
const yoyo = (sel, props, at, t1, d) =>
  T(
    `tl.to("${sel}", {${props}, duration:${d}, yoyo:true, repeat:${Math.max(1, Math.round((t1 - at) / d) | 1)}, ease:"sine.inOut"}, ${r(at)});`,
  );
const big = (x, footY, k, inner) =>
  `<g transform="translate(${x} ${footY}) scale(${k}) translate(${-x} ${-footY})">${inner}</g>`;
const salute = (id, at) => {
  pose(id, "armR", -150, at, 0.2);
  pose(id, "armR-lo", -100, at, 0.2);
};
const aim = (id, at) => {
  pose(id, "armR", -50, at, 0.2);
  pose(id, "armR-lo", -30, at, 0.2);
  pose(id, "armL", -40, at, 0.2);
  pose(id, "armL-lo", -40, at, 0.2);
};
const rotor = (k, a, b) =>
  T(
    `tl.to("#zm-${k} .rotor", {scaleX:.1, svgOrigin:"0 -102", duration:.06, yoyo:true, repeat:${Math.round((b - a) / 0.06)}}, ${r(a)});`,
  );
// twelve reserve fighters in two rows, smaller (further back)
const reserves = (pre, x0, y0, k = 0.74) =>
  `<g id="${pre}-res">${Array.from({ length: 12 }, (_, i) => {
    const x = x0 + (i % 6) * 120 + (i >= 6 ? 60 : 0);
    const y = y0 + (i >= 6 ? 50 : 0);
    return big(
      x,
      y,
      k + (i >= 6 ? 0.04 : 0),
      C(`${pre}-r${i}`, OM(i % 4, { kit: true, prop: "rifle" }), x, y),
    );
  }).join("")}</g>`;
const RES = (pre) => Array.from({ length: 12 }, (_, i) => `${pre}-r${i}`);

/* S1 the briefing: the order */
scene(
  "brief",
  `${room(F18.briefing())}
   ${C("bf-gn", R.general(), 980, 1080)}
   ${big(380, 1090, 1.12, C("bf-b", OM(0), 380, 1090))}
   ${C("bf-f", OM(1), 600, 1090)}
   ${C("bf-g", GO(), 160, 1090)}`,
  { bg: "#24282e" },
);
{
  const [a, b] = S.brief;
  camSet("brief", 300, 640, 1.6, a, 900);
  yoyo("#zm-brief .tgtbox", "opacity:.2", a, b, 0.35);
  ["bf-gn", "bf-b", "bf-f"].forEach((id) => expr(id, "neutral", a));
  expr("bf-g", "determined", a);
  camTo("brief", 220, 680, 2.2, L.l01.start, 1.2, 900, "power2.inOut");
  gesture("bf-g", "pointR", W("двенадцать") - 0.2, 0.2);
  talk("bf-g", "l01");
  gesture("bf-g", "rest", L.l01.end, 0.3);
  expr("bf-b", "determined", L.l02.start - 0.2);
  expr("bf-f", "determined", L.l02.start - 0.2);
  camTo("brief", 420, 700, 1.4, L.l02.start - 0.3, 0.5, 900, "power2.inOut");
  ["bf-b", "bf-f"].forEach((id) => salute(id, L.l02.start));
  talk("bf-b", "l02");
  ["bf-gn", "bf-b", "bf-f", "bf-g"].forEach((id) => blink(id, a, b));
}

/* S2 the hangar at five a.m.: seventeen in black, and Valkyrie */
scene(
  "hangar",
  `${room(F18.hangar())}
   ${reserves("hg", 300, 900)}
   ${big(420, 1010, 1.12, C("hg-b", OM(0, { kit: true }), 420, 1010))}
   ${C("hg-f", OM(1, { kit: true }), 600, 1010)}
   ${C("hg-q", OM(2, { kit: true }), 770, 1010)}
   ${C("hg-d", OM(3, { kit: true }), 940, 1010)}
   ${C("hg-g", GO({ kit: true }), 170, 1020)}
   <g id="hg-vw">${C("hg-v", R.valkyrie(), 1350, 1020)}</g>`,
  { bg: "#3a3e46" },
);
{
  const [a, b] = S.hangar;
  camSet("hangar", 600, 700, 0.95, a, 900);
  ["hg-b", "hg-f", "hg-q", "hg-d", "hg-g", ...RES("hg")].forEach((id) => expr(id, "determined", a));
  camTo("hangar", 600, 740, 1.1, a + 0.2, L.l03.end - a, 900, "sine.inOut");
  camTo("hangar", 220, 700, 2.0, L.l04.start - 0.3, 0.5, 900, "power2.inOut");
  gesture("hg-g", "pointR", L.l04.start + 0.3, 0.2);
  talk("hg-g", "l04");
  gesture("hg-g", "rest", L.l04.end, 0.3);
  expr("hg-f", "happy", L.l05.start);
  camTo("hangar", 600, 700, 2.1, L.l05.start - 0.3, 0.5, 900, "power2.inOut");
  gesture("hg-f", "shrug", L.l05.start + 0.4, 0.3);
  talk("hg-f", "l05");
  gesture("hg-f", "rest", L.l05.end, 0.3);
  camTo("hangar", 220, 700, 2.1, L.l06.start - 0.3, 0.5, 900, "power2.inOut");
  talk("hg-g", "l06");
  // Valkyrie walks in
  expr("hg-v", "determined", a);
  walk("hg-v", L.l07.start, L.l08.start, 0, 0, 0.32, 16);
  T(
    `tl.to("#hg-vw", {x:-250, duration:${r(L.l08.start - L.l07.start)}, ease:"none"}, ${r(L.l07.start)});`,
  );
  camTo("hangar", 900, 720, 1.4, L.l07.start, L.l08.start - L.l07.start, 900, "sine.inOut");
  camTo("hangar", 1080, 680, 2.0, L.l08.start - 0.2, 0.5, 900, "power2.inOut");
  talk("hg-v", "l08");
  expr("hg-g", "angry", L.l09.start);
  camTo("hangar", 220, 700, 2.0, L.l09.start - 0.3, 0.5, 900, "power2.inOut");
  talk("hg-g", "l09");
  expr("hg-v", "happy", L.l10.start);
  camTo("hangar", 1080, 680, 2.0, L.l10.start - 0.3, 0.5, 900, "power2.inOut");
  talk("hg-v", "l10");
  camTo("hangar", 380, 680, 2.0, L.l11.start - 0.3, 0.5, 900, "power2.inOut");
  talk("hg-b", "l11");
  camTo("hangar", 220, 700, 2.2, L.l12.start - 0.3, 0.5, 900, "power2.inOut");
  talk("hg-g", "l12");
  ["hg-b", "hg-f", "hg-q", "hg-d", "hg-g", "hg-v"].forEach((id) => blink(id, a, b));
}

/* S3 two helicopters low over the steppe */
scene(
  "fly",
  `<rect x="-800" y="-800" width="2680" height="1000" fill="#3a4a7a"/>${room(F19.skyRun())}
   <g id="fl-h1">${F15.heli("fl-a", 640, 420, 0.75)}</g>
   <g id="fl-h2">${F15.heli("fl-b", 300, 560, 0.5)}</g>`,
  { bg: "#a8a86a" },
);
{
  const [a, b] = S.fly;
  camSet("fly", 540, 600, 1.0, a, 900);
  T(`tl.to("#zm-fly .ground", {x:-1800, duration:${r(b - a)}, ease:"none"}, ${r(a)});`);
  rotor("fly", a, b);
  yoyo("#fl-h1", "y:-14", a, b, 0.9);
  yoyo("#fl-h2", "y:10", a, b, 1.1);
  camTo("fly", 560, 560, 1.15, a, b - a, 900, "sine.inOut");
}

/* S4 in the cabin: the pulse, the target */
scene(
  "cabin",
  `${room(F18.heliIn())}
   ${C("cb-g", GO({ kit: true }), 360, 965)}
   ${C("cb-d", OM(3, { kit: true }), 720, 965)}
   ${room(F18.benchFront())}
   <rect id="cb-red" x="-800" y="-800" width="2680" height="3520" fill="#ff2a2a" opacity="0"/>`,
  { bg: "#22252c" },
);
{
  const [a, b] = S.cabin;
  camSet("cabin", 540, 640, 1.3, a, 900);
  T(`tl.to("#zm-cabin .clouds", {x:-900, duration:${r(b - a)}, ease:"none"}, ${r(a)});`);
  T(
    `tl.to("#sh-cabin", {keyframes:[{y:2,duration:.12},{y:-1,duration:.12}], repeat:${Math.round((b - a) / 0.24)}}, ${r(a)});`,
  );
  expr("cb-g", "sad", a);
  expr("cb-d", "neutral", a);
  pose("cb-g", "head", 10, a, 0.01);
  camTo("cabin", 700, 640, 2.0, L.l14.start - 0.3, 0.5, 900, "power2.inOut");
  talk("cb-d", "l14");
  pose("cb-g", "head", 0, L.l15.start - 0.2, 0.3);
  camTo("cabin", 380, 640, 2.3, L.l15.start - 0.3, 0.5, 900, "power2.inOut");
  talk("cb-g", "l15");
  T(`tl.to("#cb-red", {opacity:.18, duration:.25, yoyo:true, repeat:5}, ${r(L.l16.start)});`);
  expr("cb-g", "determined", L.l16.start + 0.3);
  camTo("cabin", 540, 640, 1.4, L.l16.start - 0.2, 0.5, 900, "power2.out");
  ["cb-g", "cb-d"].forEach((id) => blink(id, a, b));
}

/* S5 the gas station: an empty bus, a roof, a frying pan, and Masha */
scene(
  "station",
  `${room(F19.stationBack())}
   ${F19.hordeRow("gs-h1", 700, 22, 0.5, "#3a4a3a", -560, 100)}
   ${F19.hordeRow("gs-h2", 730, 18, 0.62, "#2a3a2a", -500, 120)}
   ${room(F19.stationFront())}
   ${F17.bus("gs-bus", -760, 1000, 0.85)}
   ${C("gs-mx", R.maxim({ prop: "rifle" }), 700, 412)}
   ${C("gs-zn", R.zina({ prop: "pan" }), 880, 412)}
   <g id="gs-mw" opacity="0">${C("gs-m", R.masha({ outfit: "black", pregnant: true }), 890, 870)}</g>
   ${reserves("gs", -560, 905, 0.7)}
   <g id="gs-qw">${C("gs-q", OM(2, { kit: true }), -60, 1080)}</g>
   ${big(130, 1080, 1.12, C("gs-b", OM(0, { kit: true }), 130, 1080))}
   <g id="gs-gw">${C("gs-g", GO({ kit: true }), 310, 1080)}</g>
   <g id="gs-gfw" opacity="0">${C("gs-gf", GO(), 310, 1080)}</g>
   ${C("gs-f", OM(1, { kit: true }), 480, 1080)}
   ${C("gs-v", R.valkyrie(), 640, 1080)}
   ${C("gs-d", OM(3, { kit: true }), -230, 1080)}`,
  { bg: "#8fb4dc" },
);
{
  const [a, b] = S.station;
  const all = ["gs-q", "gs-b", "gs-g", "gs-f", "gs-d"];
  camSet("station", 400, 640, 0.95, a, 900);
  [...all, ...RES("gs")].forEach((id) => expr(id, "determined", a));
  expr("gs-v", "determined", a);
  expr("gs-mx", "angry", a);
  expr("gs-zn", "angry", a);
  camTo("station", 320, 700, 2.0, L.l17.start - 0.2, 0.5, 900, "power2.inOut");
  gesture("gs-g", "pointR", L.l17.start + 0.4, 0.2);
  talk("gs-g", "l17");
  gesture("gs-g", "rest", L.l17.end, 0.3);
  // Quiet checks the bus
  walk("gs-q", L.l18.start + 1.2, L.l18.end, 0, 0, 0.36, 14);
  T(
    `tl.to("#gs-qw", {x:-260, duration:${r(L.l18.end - L.l18.start - 1.2)}, ease:"none"}, ${r(L.l18.start + 1.2)});`,
  );
  camTo("station", -200, 760, 1.4, L.l18.start + 0.5, L.l18.end - L.l18.start, 900, "sine.inOut");
  camTo("station", -300, 720, 2.2, L.l19.start - 0.3, 0.4, 900, "power2.inOut");
  talk("gs-q", "l19");
  // the roof
  camTo("station", 760, 280, 1.8, L.l20.start - 0.4, 0.6, 900, "power2.inOut");
  aim("gs-mx", L.l20.start - 0.2);
  talk("gs-mx", "l20");
  ["gs-b", "gs-f", "gs-g"].forEach((id) => aim(id, L.l20.start + 0.4));
  camTo("station", 790, 300, 1.4, L.l21.start, 1.0, 900, "power2.inOut");
  gesture("gs-zn", "fist", W("сковородкой") - 0.2, 0.2);
  camTo("station", 880, 280, 2.2, L.l22.start - 0.3, 0.4, 900, "power2.inOut");
  talk("gs-zn", "l22");
  expr("gs-b", "scared", L.l23.start);
  camTo("station", 160, 700, 2.0, L.l23.start - 0.3, 0.4, 900, "power2.inOut");
  talk("gs-b", "l23");
  camTo("station", 330, 700, 2.2, L.l24.start - 0.3, 0.4, 900, "power2.inOut");
  talk("gs-g", "l24");
  // the helmet comes off
  ["gs-g"].forEach((id) => {
    pose(id, "armR", 0, L.l25.start - 0.4, 0.3);
    pose(id, "armR-lo", 0, L.l25.start - 0.4, 0.3);
    pose(id, "armL", 0, L.l25.start - 0.4, 0.3);
    pose(id, "armL-lo", 0, L.l25.start - 0.4, 0.3);
  });
  gesture("gs-g", "headBoth", W("каску") - 0.2, 0.3);
  const off = W("балаклаву") + 0.2;
  hide("#gs-gw", off);
  show("#gs-gfw", off);
  expr("gs-gf", "sad", off);
  camTo("station", 320, 660, 2.6, L.l25.start, 0.8, 900, "power2.out");
  expr("gs-mx", "shock", L.l26.start - 0.2);
  pose("gs-mx", "armR", 0, L.l26.start, 0.3);
  pose("gs-mx", "armR-lo", 0, L.l26.start, 0.3);
  pose("gs-mx", "armL", 0, L.l26.start, 0.3);
  pose("gs-mx", "armL-lo", 0, L.l26.start, 0.3);
  camTo("station", 720, 280, 2.4, L.l26.start - 0.3, 0.4, 900, "power2.out");
  talk("gs-mx", "l26");
  // Masha comes out
  show("#gs-mw", L.l27.start + 0.3);
  T(
    `tl.fromTo("#gs-mw", {x:40}, {x:0, duration:.6, ease:"power2.out", immediateRender:false}, ${r(L.l27.start + 0.3)});`,
  );
  expr("gs-m", "shock", L.l27.start);
  camTo("station", 880, 640, 1.8, L.l27.start, 0.8, 900, "power2.inOut");
  talk("gs-m", "l28");
  camTo("station", 330, 680, 2.4, L.l29.start - 0.3, 0.4, 900, "power2.inOut");
  talk("gs-gf", "l29");
  expr("gs-m", "angry", L.l30.start);
  camTo("station", 880, 640, 2.2, L.l30.start - 0.3, 0.4, 900, "power2.inOut");
  talk("gs-m", "l30");
  camTo("station", 330, 680, 2.6, L.l31.start - 0.3, 0.4, 900, "power2.inOut");
  talk("gs-gf", "l31");
  // Valkyrie's order, Gleb's counter-order
  expr("gs-v", "angry", L.l32.start);
  camTo("station", 640, 680, 2.2, L.l32.start - 0.3, 0.4, 900, "power2.inOut");
  gesture("gs-v", "pointR", L.l32.start + 0.8, 0.2);
  talk("gs-v", "l32");
  expr("gs-gf", "angry", L.l33.start);
  camTo("station", 400, 690, 1.8, L.l33.start - 0.2, 0.3, 900, "power2.out");
  gesture("gs-gf", "handsUp", L.l33.start, 0.2);
  talk("gs-gf", "l33");
  shake("#sh-station", L.l33.start + 0.2, 4, 6);
  gesture("gs-gf", "rest", L.l33.end, 0.3);
  camTo("station", 640, 680, 2.2, L.l34.start - 0.3, 0.4, 900, "power2.inOut");
  talk("gs-v", "l34");
  expr("gs-gf", "determined", L.l35.start);
  camTo("station", 330, 680, 2.4, L.l35.start - 0.3, 0.4, 900, "power2.inOut");
  talk("gs-gf", "l35");
  // reserves raise their rifles
  camTo("station", 0, 760, 1.2, L.l36.start, 1.0, 900, "power2.inOut");
  RES("gs").forEach((id, i) => aim(id, L.l36.start + 0.6 + i * 0.08));
  // the horde
  expr("gs-f", "scared", L.l37.start);
  camTo("station", 480, 700, 2.2, L.l37.start - 0.3, 0.3, 900, "power2.out");
  talk("gs-f", "l37");
  T(`tl.to("#zm-station .dust", {opacity:1, duration:1.5}, ${r(L.l38.start)});`);
  ["gs-h1", "gs-h2"].forEach((h, i) => {
    show(`#zm-station .${h}`, L.l38.start + 1.0 + i * 0.6);
    T(
      `tl.fromTo("#zm-station .${h}", {y:-60, x:-200}, {y:${10 + i * 10}, x:300, duration:${r(b - L.l38.start - 1)}, ease:"none", immediateRender:false}, ${r(L.l38.start + 1.0 + i * 0.6)});`,
    );
    yoyo(`#zm-station .${h}`, "scaleY:1.04", L.l38.start + 1, b, 0.18);
  });
  camTo("station", 300, 520, 1.0, L.l38.start, 2.0, 900, "power2.inOut");
  expr("gs-mx", "determined", L.l39.start);
  aim("gs-mx", L.l39.start);
  camTo("station", 760, 300, 2.0, L.l39.start - 0.3, 0.4, 900, "power2.inOut");
  talk("gs-mx", "l39");
  camTo("station", 330, 680, 2.2, L.l40.start - 0.3, 0.4, 900, "power2.inOut");
  gesture("gs-gf", "fist", L.l40.start + 0.4, 0.2);
  talk("gs-gf", "l40");
  ["gs-b", "gs-f", "gs-q", "gs-d"].forEach((id) => aim(id, L.l40.end));
  expr("gs-zn", "angry", L.l41.start);
  camTo("station", 880, 280, 2.2, L.l41.start - 0.3, 0.4, 900, "power2.inOut");
  gesture("gs-zn", "fist", L.l41.start + 0.2, 0.2);
  talk("gs-zn", "l41");
  camTo("station", 400, 600, 0.95, L.l41.end + 0.2, CUT - L.l41.end - 0.2, 900, "power2.inOut");
  ["gs-mx", "gs-zn", "gs-m", "gs-gf", "gs-v", ...all].forEach((id) => blink(id, a, b));
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
  general: ["ГЕНЕРАЛ", "#e9c46a"],
  pilot: ["ПИЛОТ", "#c9d48a"],
  bear: ["МЕДВЕДЬ", "#ff9a6a"],
  fox: ["ЛИСА", "#ff7a4a"],
  quiet: ["ТИХИЙ", "#b9c0cc"],
  soldier2: ["СОЛДАТ", "#c9d48a"],
  soldier3: ["КОМАНДИР (РАЦИЯ)", "#c9d48a"],
  granny: ["БАБУШКА", "#e0b3ff"],
  zina: ["БАБА ЗИНА", "#ff8fb8"],
  voice: ["РАДИО", "#9fd2ff"],
  shepherd: ["ПАСТУХ", "#e0c98a"],
  owner: ["ХОЗЯИН КАФЕ", "#ffb38a"],
  feldsher: ["ДОК", "#9fe0d0"],
  neighbor: ["БАБА ВАЛЯ", "#e0b3ff"],
  volunteer: ["ВОЛОНТЁР", "#9fe0d0"],
  valkyrie: ["ВАЛЬКИРИЯ", "#9fd8ff"],
  medic: ["ВРАЧ", "#9fe0d0"],
};
const HOT = new Set(
  "омега каски балаклавы двенадцать ясно генерал командир пусто сковородкой глеб маша живая прости отставить все степь".split(
    " ",
  ),
);
const DANGER = new Set("орду нечисть прицел стрелял".split(" "));
const hook = `<div id="hook" class="clip toptitle" data-start="0.2" data-duration="${r(L.l01.start - 0.1)}" data-track-index="2" style="z-index:5"><div class="tt-s">${spl("ГЛЕБ", "hs")}</div><div class="tt-a">${spl("ЧАСТЬ 19", "ha")}</div></div>`;
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
  stamp("st-tak", L.l02.start, L.l02.end + 0.6, "ТАК ТОЧНО!", "#ffb02e"),
  stamp("st-pulse", L.l14.start + 1.4, L.l14.end + 0.2, "120", "#ff4a3d"),
  stamp("st-stop", L.l33.start, L.l33.end + 0.4, "ОТСТАВИТЬ!", "#ff4a3d"),
].join("\n");
const title = `<div id="tbc" class="clip" data-start="${TITLE[0]}" data-duration="${r(TITLE[1] - TITLE[0])}" data-track-index="4" style="z-index:8"><div id="tbc-a">${spl("ПРОДОЛЖЕНИЕ СЛЕДУЕТ…", "ta")}</div><div id="tbc-b">ЧАСТЬ 20</div></div>`;
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
  ["buzz", 0.2, 1.2, 0.4],
  ["room_day", S.hangar[0], S.hangar[1] - S.hangar[0], 0.35],
  ["slam", L.l07.start, 0.5, 0.6],
  ["tank", S.fly[0], S.cabin[1] - S.fly[0], 0.5],
  ["buzz", L.l16.start, 1.2, 0.5],
  ["room_day", S.station[0], CUT - S.station[0], 0.4],
  ["click", L.l20.start + 0.4, 0.06, 1.2],
  ["click", L.l20.start + 0.6, 0.06, 1.2],
  ["click", L.l36.start + 0.7, 0.06, 1.2],
  ["click", L.l36.start + 1.0, 0.06, 1.2],
  ["truck", L.l38.start, CUT - L.l38.start, 0.45],
  ["tank", L.l38.start + 1, CUT - L.l38.start - 1, 0.25],
].filter(([, , , v]) => v > 0);
const audio = [
  `<audio id="vo" class="clip" src="assets/vo.wav" data-start="0" data-duration="${r(L.l41.end + 0.1)}" data-track-index="10" data-volume="1"></audio>`,
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
<title>Глеб — часть 19</title>
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
