// "Глеб — часть 18": meanwhile. Gleb and Valkyrie fly to the hidden base "Granit"; Gleb takes command of Omega.
// Run from gleb/p18: node build.mjs → index.html (sfx shared via assets/sfx symlink).
import fs from "node:fs";
import * as R from "../art/rig.js";
import * as F18 from "./art18.js";
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
const CUT = r(L.l53.end + 2.0);
const TITLE = [CUT, r(CUT + 3.2)];
const CARD_START = r(TITLE[1] + 0.1);
const CARD_DUR = 3.6;
const TOTAL = r(CARD_START + CARD_DUR);
const S = {};
{
  const ends = [
    ["heli", L.l06.end + 0.7],
    ["base", L.l07.end + 0.4],
    ["corr", L.l10.end + 0.8],
    ["office", L.l21.end + 0.8],
    ["hangar", L.l36.end + 0.8],
    ["range", L.l40.end + 0.6],
    ["quart", L.l45.end + 0.9],
    ["brief", CUT],
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
let seed = 71;
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
const GG = (o = {}) => R.gleb({ ghoul: true, brow: "neutral", ...o });
const GO = (o = {}) => R.gleb({ omega: true, brow: "neutral", ...o });
const VK = (o = {}) => R.valkyrie(o);
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
// scale a character group about its feet (Bear is bigger than everyone)
const big = (x, footY, k, inner) =>
  `<g transform="translate(${x} ${footY}) scale(${k}) translate(${-x} ${-footY})">${inner}</g>`;
const salute = (id, at) => {
  pose(id, "armR", -150, at, 0.2);
  pose(id, "armR-lo", -100, at, 0.2);
};
const aim = (id, at) => {
  pose(id, "armR", -85, at, 0.2);
  pose(id, "armR-lo", 0, at, 0.2);
  pose(id, "armL", -75, at, 0.2);
  pose(id, "armL-lo", -20, at, 0.2);
};

/* S1 inside the black helicopter */
scene(
  "heli",
  `${room(F18.heliIn())}
   ${C("hl-g", GG({ brow: "sad" }), 360, 965)}
   ${C("hl-v", VK(), 730, 965)}
   ${room(F18.benchFront())}`,
  { bg: "#22252c" },
);
{
  const [a, b] = S.heli;
  camSet("heli", 540, 640, 1.2, a, 900);
  T(`tl.to("#zm-heli .clouds", {x:-900, duration:${r(b - a)}, ease:"none"}, ${r(a)});`);
  T(
    `tl.to("#sh-heli", {keyframes:[{y:2,duration:.12},{y:-1,duration:.12}], repeat:${Math.round((b - a) / 0.24)}}, ${r(a)});`,
  );
  expr("hl-g", "sad", a);
  pose("hl-g", "head", 12, a, 0.01);
  pose("hl-g", "armL", 18, a, 0.01);
  pose("hl-g", "armL-lo", 45, a, 0.01);
  pose("hl-g", "armR", -18, a, 0.01);
  pose("hl-g", "armR-lo", -45, a, 0.01);
  camTo("heli", 400, 640, 1.9, a + 0.3, L.l01.end - a, 900, "sine.inOut");
  expr("hl-v", "neutral", a);
  camTo("heli", 700, 640, 2.0, L.l02.start - 0.3, 0.5, 900, "power2.inOut");
  talk("hl-v", "l02");
  camTo("heli", 380, 640, 2.2, L.l03.start - 0.3, 0.5, 900, "power2.inOut");
  talk("hl-g", "l03");
  expr("hl-v", "happy", L.l04.start);
  camTo("heli", 700, 640, 2.0, L.l04.start - 0.3, 0.5, 900, "power2.inOut");
  talk("hl-v", "l04");
  pose("hl-g", "head", 0, L.l05.start - 0.3, 0.3);
  expr("hl-g", "tired", L.l05.start);
  camTo("heli", 400, 640, 2.0, L.l05.start - 0.3, 0.5, 900, "power2.inOut");
  talk("hl-g", "l05");
  expr("hl-v", "determined", L.l06.start);
  camTo("heli", 560, 640, 1.5, L.l06.start - 0.3, 0.6, 900, "power2.inOut");
  talk("hl-v", "l06");
  expr("hl-g", "shock", W("лично"));
  ["hl-g", "hl-v"].forEach((id) => blink(id, a, b));
}

/* S2 the mountain opens: base "Granit" */
scene(
  "base",
  `${room(F18.mountain())}
   <g id="bs-hw">${F15.heli("bs-heli", 0, 0, 0.45)}</g>`,
  { bg: "#2a3a6a" },
);
{
  const [a, b] = S.base;
  camSet("base", 540, 560, 1.0, a, 880);
  T(
    `tl.fromTo("#bs-hw", {x:-300, y:300, scale:1}, {x:540, y:640, duration:${r(b - a - 0.6)}, ease:"power1.inOut", immediateRender:false}, ${r(a)});`,
  );
  T(`tl.to("#bs-hw", {scale:.4, svgOrigin:"540 640", opacity:0, duration:.8}, ${r(b - 1.2)});`);
  T(
    `tl.to("#zm-base .rotor", {scaleX:.1, svgOrigin:"0 -102", duration:.06, yoyo:true, repeat:${Math.round((b - a) / 0.06)}}, ${r(a)});`,
  );
  const op = W("раскрылась") - 0.2;
  T(`tl.to("#zm-base .door-l", {x:-200, duration:2.0, ease:"power2.inOut"}, ${r(op)});`);
  T(`tl.to("#zm-base .door-r", {x:200, duration:2.0, ease:"power2.inOut"}, ${r(op)});`);
  yoyo("#zm-base .blink", "opacity:.1", a, b, 0.4);
  camTo("base", 540, 700, 1.4, a + 0.5, b - a - 0.5, 880, "sine.inOut");
}

/* S3 the corridor: salutes for Valkyrie, stares for Gleb */
scene(
  "corr",
  `${room(F18.corridor())}
   ${C("cr-s1", R.soldier({ brow: "neutral" }), 130, 1070)}
   ${C("cr-s2", R.soldier({ brow: "worried" }), 960, 1070)}
   <g id="cr-vw">${C("cr-v", VK(), 0, 1080)}</g>
   <g id="cr-gw">${C("cr-g", GG(), 0, 1080)}</g>`,
  { bg: "#7a7e86" },
);
{
  const [a, b] = S.corr;
  camSet("corr", 540, 740, 1.1, a, 900);
  T(`tl.set("#cr-vw", {x:-200}, ${r(a)}); tl.set("#cr-gw", {x:-460}, ${r(a)});`);
  const wEnd = L.l09.start;
  walk("cr-v", a + 0.2, wEnd, 0, 0, 0.34, 16);
  walk("cr-g", a + 0.2, wEnd, 0, 0, 0.34, 16);
  T(`tl.to("#cr-vw", {x:640, duration:${r(wEnd - a - 0.2)}, ease:"none"}, ${r(a + 0.2)});`);
  T(`tl.to("#cr-gw", {x:400, duration:${r(wEnd - a - 0.2)}, ease:"none"}, ${r(a + 0.2)});`);
  camTo("corr", 520, 740, 1.3, a + 0.2, wEnd - a, 900, "none");
  expr("cr-v", "determined", a);
  expr("cr-g", "neutral", a);
  salute("cr-s1", L.l08.start + 0.6);
  salute("cr-s2", L.l08.start + 1.2);
  pose("cr-s1", "armR", 0, W("взглядом") + 0.2, 0.3);
  pose("cr-s1", "armR-lo", 0, W("взглядом") + 0.2, 0.3);
  pose("cr-s2", "armR", 0, W("взглядом") + 0.2, 0.3);
  pose("cr-s2", "armR-lo", 0, W("взглядом") + 0.2, 0.3);
  camTo("corr", 200, 720, 2.2, L.l09.start - 0.3, 0.4, 900, "power2.inOut");
  talk("cr-s1", "l09");
  camTo("corr", 880, 720, 2.2, L.l10.start - 0.3, 0.4, 900, "power2.inOut");
  talk("cr-s2", "l10");
  camTo("corr", 440, 720, 1.8, L.l10.end, b - L.l10.end, 900, "power2.inOut");
  expr("cr-g", "angry", L.l10.end);
  ["cr-s1", "cr-s2", "cr-v", "cr-g"].forEach((id) => blink(id, a, b));
}

/* S4 the general's office: the test, the offer, the threat */
scene(
  "office",
  `${room(F18.office())}
   ${C("of-gn", R.general(), 540, 1000)}
   ${room(F18.desk())}
   ${C("of-g", GG(), 130, 1090)}
   ${C("of-v", VK(), 960, 1090)}`,
  { bg: "#4a3a30" },
);
{
  const [a, b] = S.office;
  camSet("office", 540, 700, 1.1, a, 900);
  expr("of-gn", "neutral", a);
  expr("of-g", "neutral", a);
  expr("of-v", "neutral", a);
  const gn = (lid, s = 2.0) => {
    camTo("office", 540, 660, s, L[lid].start - 0.3, 0.5, 900, "power2.inOut");
    talk("of-gn", lid);
  };
  const gl = (lid, e) => {
    if (e) expr("of-g", e, L[lid].start);
    camTo("office", 200, 720, 2.0, L[lid].start - 0.3, 0.5, 900, "power2.inOut");
    talk("of-g", lid);
  };
  gn("l11", 1.6);
  gl("l12", "shock");
  gn("l13");
  gl("l14", "angry");
  gesture("of-g", "fist", L.l14.start + 0.2, 0.2);
  gesture("of-g", "rest", L.l14.end + 0.2, 0.3);
  gn("l15", 1.6);
  gesture("of-gn", "open", L.l15.start + 1.5, 0.3);
  gn("l16", 2.2);
  gesture("of-gn", "rest", L.l16.end, 0.3);
  gl("l17", "determined");
  expr("of-gn", "happy", L.l18.start);
  gn("l18", 2.0);
  gesture("of-gn", "pointR", W("валькирия") - 0.2, 0.2);
  expr("of-v", "happy", L.l19.start);
  camTo("office", 900, 700, 2.0, L.l19.start - 0.3, 0.5, 900, "power2.inOut");
  gesture("of-v", "shrug", L.l19.start + 0.2, 0.3);
  talk("of-v", "l19");
  gesture("of-v", "rest", L.l19.end, 0.3);
  gl("l20", "determined");
  gesture("of-g", "pointR", L.l20.start + 1.6, 0.2);
  gesture("of-g", "rest", L.l20.end, 0.3);
  expr("of-gn", "happy", L.l21.start);
  camTo("office", 540, 700, 1.3, L.l21.start - 0.3, 0.6, 900, "power2.inOut");
  talk("of-gn", "l21");
  ["of-gn", "of-g", "of-v"].forEach((id) => blink(id, a, b));
}

/* S5 the hangar: Omega, and Bear on the mat */
scene(
  "hangar",
  `${room(F18.hangar())}
   <g id="hg-bw">${big(420, 1000, 1.12, C("hg-b", OM(0, { brow: "angry" }), 420, 1000))}</g>
   ${C("hg-f", OM(1), 620, 1000)}
   ${C("hg-q", OM(2), 800, 1000)}
   ${C("hg-d", OM(3), 970, 1000)}
   <g id="hg-gw">${C("hg-g", GG(), 160, 1010)}</g>`,
  { bg: "#3a3e46" },
);
{
  const [a, b] = S.hangar;
  camSet("hangar", 560, 680, 1.0, a, 900);
  ["hg-f", "hg-q", "hg-d", "hg-g"].forEach((id) => expr(id, "neutral", a));
  expr("hg-b", "angry", a);
  camTo("hangar", 560, 740, 1.1, a + 0.2, L.l22.end - a, 900, "sine.inOut");
  const intro = (id, lid, x, s = 2.1) => {
    camTo("hangar", x, 700, s, L[lid].start - 0.3, 0.5, 900, "power2.inOut");
    talk(id, lid);
  };
  intro("hg-b", "l23", 420, 1.9);
  expr("hg-f", "happy", L.l24.start);
  intro("hg-f", "l24", 620);
  intro("hg-q", "l25", 800);
  intro("hg-d", "l26", 960);
  gesture("hg-b", "fist", L.l27.start + 0.4, 0.2);
  intro("hg-b", "l27", 440, 1.9);
  expr("hg-g", "determined", L.l28.start);
  intro("hg-g", "l28", 180);
  expr("hg-b", "shock", L.l29.start);
  intro("hg-b", "l29", 440, 1.9);
  intro("hg-g", "l30", 180);
  // the punch, the dodge, the throw
  camTo("hangar", 320, 760, 1.5, L.l31.start, 0.6, 900, "power2.inOut");
  expr("hg-b", "angry", L.l31.start);
  walk("hg-b", L.l31.start + 0.2, L.l31.start + 1.0, 0, 0, 0.25, 18);
  T(`tl.to("#hg-bw", {x:-150, duration:.8, ease:"power2.in"}, ${r(L.l31.start + 0.2)});`);
  const pun = W("ударил");
  pose("hg-b", "armR", -90, pun, 0.12);
  pose("hg-b", "armR-lo", 0, pun, 0.12);
  T(`tl.to("#hg-gw", {x:-60, duration:.15, ease:"power2.out"}, ${r(pun + 0.05)});`);
  const thr = W("полетели") - 0.1;
  pose("hg-g", "armR", -100, thr - 0.3, 0.15);
  T(
    `tl.to("#hg-bw", {rotation:-90, svgOrigin:"420 1000", y:20, duration:.4, ease:"power2.in"}, ${r(thr)});`,
  );
  shake("#sh-hangar", thr + 0.4, 8, 16);
  expr("hg-b", "pain", thr + 0.4);
  expr("hg-f", "shock", thr + 0.4);
  expr("hg-q", "shock", thr + 0.4);
  expr("hg-d", "shock", thr + 0.4);
  pose("hg-g", "armR", 0, thr + 0.6, 0.3);
  camTo("hangar", 380, 800, 1.4, thr + 0.2, 0.5, 900, "power2.out");
  expr("hg-f", "happy", L.l32.start);
  intro("hg-f", "l32", 620, 1.9);
  intro("hg-b", "l33", 360, 1.4);
  T(
    `tl.to("#hg-bw", {rotation:0, y:0, svgOrigin:"420 1000", duration:.6, ease:"power2.out"}, ${r(L.l33.end + 0.1)});`,
  );
  expr("hg-b", "neutral", L.l33.end + 0.2);
  intro("hg-g", "l34", 200, 1.8);
  gesture("hg-g", "pointR", L.l34.start + 0.5, 0.2);
  gesture("hg-g", "rest", L.l34.end, 0.3);
  expr("hg-f", "neutral", L.l35.start);
  intro("hg-f", "l35", 620);
  intro("hg-g", "l36", 200, 2.2);
  camTo("hangar", 560, 720, 1.0, L.l36.end, b - L.l36.end, 900, "sine.inOut");
  ["hg-b", "hg-f", "hg-q", "hg-d", "hg-g"].forEach((id) => blink(id, a, b));
}

/* S6 the shooting range: five of five */
scene(
  "range",
  `${room(F18.range())}
   ${C("rg-f", OM(1), 260, 1080)}
   ${C("rg-g", GG({ prop: "rifle" }), 760, 1080)}`,
  { bg: "#5a5e66" },
);
{
  const [a, b] = S.range;
  camSet("range", 540, 640, 1.0, a, 880);
  expr("rg-g", "determined", a);
  expr("rg-f", "neutral", a);
  aim("rg-g", a + 0.4);
  const shots = [0, 1, 2, 3, 4].map((i) => L.l37.start + 1.0 + i * 0.9);
  shots.forEach((t, i) => {
    show(`#zm-range .hole${i}`, t);
    shake("#sh-range", t, 3, 4);
    T(
      `tl.fromTo("#zm-range .tgt${i}", {rotation:0}, {rotation:-8, svgOrigin:"${100 + i * 230} 460", duration:.08, yoyo:true, repeat:1, immediateRender:false}, ${r(t)});`,
    );
  });
  camTo("range", 560, 480, 1.4, a + 0.6, shots[4] - a, 880, "sine.inOut");
  expr("rg-f", "happy", L.l38.start);
  camTo("range", 300, 720, 2.0, L.l38.start - 0.3, 0.5, 880, "power2.inOut");
  talk("rg-f", "l38");
  pose("rg-g", "armR", 0, L.l38.start, 0.3);
  pose("rg-g", "armL", 0, L.l38.start, 0.3);
  pose("rg-g", "armR-lo", 0, L.l38.start, 0.3);
  pose("rg-g", "armL-lo", 0, L.l38.start, 0.3);
  expr("rg-g", "angry", L.l39.start);
  camTo("range", 740, 720, 2.0, L.l39.start - 0.3, 0.4, 880, "power2.inOut");
  talk("rg-g", "l39");
  camTo("range", 300, 720, 2.0, L.l40.start - 0.3, 0.4, 880, "power2.inOut");
  talk("rg-f", "l40");
  camTo("range", 520, 720, 1.2, L.l40.end, b - L.l40.end, 880, "sine.inOut");
  expr("rg-g", "happy", L.l40.end + 0.2);
  ["rg-f", "rg-g"].forEach((id) => blink(id, a, b));
}

/* S7 quarters: the patch in the stove, the photo, Valkyrie at the door */
scene(
  "quart",
  `${room(F18.quarters())}
   <g id="qt-gw">${C("qt-g", GG(), 560, 1070)}</g>
   <g id="qt-ow" opacity="0">${C("qt-o", GO({ prop: "photo" }), 560, 1070)}</g>
   <g id="qt-patch" opacity="0"><rect x="-34" y="-12" width="68" height="24" rx="3" fill="#f2efe6" stroke="#0b0d14" stroke-width="2"/><text x="0" y="7" text-anchor="middle" font-family="Inter, sans-serif" font-weight="900" font-size="16" fill="#c9302c">ГУЛЬ</text></g>
   <rect id="qt-night" x="-800" y="-800" width="2680" height="3520" fill="#05081a" opacity="0"/>
   <rect id="qt-flash" x="-800" y="-800" width="2680" height="3520" fill="#fff" opacity="0"/>
   <g id="qt-vw">${C("qt-v", VK(), 1300, 1070)}</g>`,
  { bg: "#3a4048" },
);
{
  const [a, b] = S.quart;
  camSet("quart", 640, 700, 1.4, a, 900);
  yoyo("#zm-quart .fire", 'scaleY:1.25, transformOrigin:"50% 100%"', a, b, 0.25);
  expr("qt-g", "determined", a);
  const rip = W("снял") + 0.1;
  pose("qt-g", "armR", -140, rip, 0.2);
  pose("qt-g", "armR-lo", -60, rip, 0.2);
  show("#qt-patch", rip + 0.3);
  const toss = W("печь") - 0.5;
  T(
    `tl.fromTo("#qt-patch", {x:600, y:860}, {keyframes:[{x:760, y:700, duration:.35, ease:"power1.out"},{x:900, y:760, duration:.35, ease:"power1.in"}], immediateRender:false}, ${r(toss)});`,
  );
  T(`tl.to("#qt-patch", {rotation:540, svgOrigin:"0 0", duration:.7}, ${r(toss)});`);
  hide("#qt-patch", toss + 0.72);
  T(
    `tl.to("#zm-quart .fire", {scale:1.8, transformOrigin:"50% 100%", duration:.2, yoyo:true, repeat:1}, ${r(toss + 0.7)});`,
  );
  pose("qt-g", "armR", 0, toss + 0.4, 0.3);
  pose("qt-g", "armR-lo", 0, toss + 0.4, 0.3);
  camTo("quart", 800, 720, 1.8, toss - 0.4, 0.6, 900, "power2.inOut");
  // rebirth: the omega armour
  const re = W("родился") - 0.1;
  T(
    `tl.fromTo("#qt-flash", {opacity:.9}, {opacity:0, duration:.6, immediateRender:false}, ${r(re)});`,
  );
  hide("#qt-gw", re);
  show("#qt-ow", re);
  expr("qt-o", "determined", re);
  camTo("quart", 560, 640, 2.0, re, 0.7, 900, "power2.out");
  // night, the photo
  T(`tl.to("#qt-night", {opacity:.45, duration:1.0}, ${r(L.l42.start - 0.6)});`);
  expr("qt-o", "sad", L.l42.start);
  pose("qt-o", "armR", -40, L.l42.start + 0.4, 0.4);
  pose("qt-o", "armR-lo", -110, L.l42.start + 0.4, 0.4);
  pose("qt-o", "head", 10, L.l42.start + 0.4, 0.4);
  camTo("quart", 580, 700, 2.4, L.l42.start, L.l42.end - L.l42.start, 900, "sine.inOut");
  walk("qt-v", L.l43.start - 1.0, L.l43.start, 0, 0, 0.3, 16);
  T(`tl.to("#qt-vw", {x:-450, duration:1.0, ease:"none"}, ${r(L.l43.start - 1.0)});`);
  expr("qt-v", "neutral", a);
  camTo("quart", 720, 700, 1.6, L.l43.start - 0.5, 0.6, 900, "power2.inOut");
  talk("qt-v", "l43");
  pose("qt-o", "head", 0, L.l44.start - 0.2, 0.3);
  pose("qt-o", "armR", 0, L.l44.start - 0.2, 0.3);
  pose("qt-o", "armR-lo", 0, L.l44.start - 0.2, 0.3);
  expr("qt-o", "determined", L.l44.start);
  camTo("quart", 560, 680, 2.2, L.l44.start - 0.3, 0.5, 900, "power2.inOut");
  talk("qt-o", "l44");
  expr("qt-v", "determined", L.l45.start);
  camTo("quart", 860, 680, 2.2, L.l45.start - 0.3, 0.5, 900, "power2.inOut");
  talk("qt-v", "l45");
  walk("qt-v", L.l45.end + 0.2, b, 0, 0, 0.3, 16);
  T(
    `tl.to("#qt-vw", {x:0, duration:${r(b - L.l45.end - 0.2)}, ease:"none"}, ${r(L.l45.end + 0.2)});`,
  );
  camTo("quart", 600, 680, 1.6, L.l45.end, b - L.l45.end, 900, "sine.inOut");
  ["qt-g", "qt-o", "qt-v"].forEach((id) => blink(id, a, b));
}

/* S8 the briefing: the drone photo */
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
  camSet("brief", 540, 620, 1.0, a, 880);
  T(
    `tl.fromTo("#zm-brief .screen", {opacity:0}, {opacity:1, duration:.4, immediateRender:false}, ${r(a + 0.3)});`,
  );
  yoyo("#zm-brief .tgtbox", "opacity:.2", a, b, 0.35);
  ["bf-gn", "bf-b", "bf-f"].forEach((id) => expr(id, "neutral", a));
  expr("bf-g", "determined", a);
  camTo("brief", 900, 680, 1.8, L.l46.start - 0.3, 0.6, 900, "power2.inOut");
  gesture("bf-gn", "pointR", L.l46.start + 1.0, 0.3);
  talk("bf-gn", "l46");
  expr("bf-g", "shock", L.l47.start - 0.2);
  camTo("brief", 200, 700, 2.3, L.l47.start - 0.3, 0.4, 900, "power2.out");
  talk("bf-g", "l47");
  camTo("brief", 900, 680, 1.8, L.l48.start - 0.3, 0.5, 900, "power2.inOut");
  talk("bf-gn", "l48");
  gesture("bf-gn", "rest", L.l48.end, 0.3);
  camTo("brief", 640, 520, 1.4, L.l49.start - 0.2, 0.6, 900, "power2.inOut");
  talk("bf-gn", "l49");
  expr("bf-b", "scared", L.l50.start);
  camTo("brief", 400, 680, 2.0, L.l50.start - 0.3, 0.5, 900, "power2.inOut");
  talk("bf-b", "l50");
  expr("bf-g", "sad", L.l51.start);
  camTo("brief", 180, 680, 2.6, L.l51.start - 0.3, 0.5, 900, "power2.inOut");
  talk("bf-g", "l51");
  camTo("brief", 450, 420, 2.4, L.l52.start, 1.6, 900, "power2.inOut");
  expr("bf-g", "determined", L.l53.start - 0.2);
  camTo("brief", 220, 680, 2.0, L.l53.start - 0.3, 0.5, 900, "power2.out");
  gesture("bf-g", "fist", L.l53.start + 0.4, 0.2);
  talk("bf-g", "l53");
  camTo("brief", 540, 620, 1.0, L.l53.end + 0.2, CUT - L.l53.end - 0.2, 900, "sine.inOut");
  ["bf-gn", "bf-b", "bf-f", "bf-g"].forEach((id) => blink(id, a, b));
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
  "генерал гранит проверку омега командир четвёртый условием командир пятеро гуль родился жива вакцине автобус вертолёт".split(
    " ",
  ),
);
const DANGER = new Set("беременную погибли выстрелит оружие".split(" "));
const hook = `<div id="hook" class="clip toptitle" data-start="0.2" data-duration="${r(L.l01.start - 0.1)}" data-track-index="2" style="z-index:5"><div class="tt-s">${spl("ГЛЕБ", "hs")}</div><div class="tt-a">${spl("ЧАСТЬ 18", "ha")}</div></div>`;
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
  stamp("st-boom", W("полетели") + 0.3, W("полетели") + 1.5, "БУМ!", "#ffb02e"),
  stamp("st-five", L.l37.start + 4.8, L.l38.start + 0.4, "5 ИЗ 5", "#7aff8a"),
  stamp("st-tgt", L.l52.start + 0.2, L.l52.end + 0.4, "ЦЕЛЬ НАЙДЕНА", "#ff4a3d"),
].join("\n");
const title = `<div id="tbc" class="clip" data-start="${TITLE[0]}" data-duration="${r(TITLE[1] - TITLE[0])}" data-track-index="4" style="z-index:8"><div id="tbc-a">${spl("ПРОДОЛЖЕНИЕ СЛЕДУЕТ…", "ta")}</div><div id="tbc-b">ЧАСТЬ 19</div></div>`;
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
  ["tank", 0, S.base[1], 0.4],
  ["crank", W("раскрылась") - 0.2, 2.2, 0.8],
  ["slam", W("раскрылась") + 1.8, 0.5, 0.7],
  ["room_day", S.corr[0], S.range[0] - S.corr[0], 0.35],
  ["slam", W("ударил"), 0.4, 0.6],
  ["slam", W("полетели") + 0.3, 0.6, 1.2],
  ...[0, 1, 2, 3, 4].map((i) => ["gunfire", L.l37.start + 1.0 + i * 0.9, 0.35, 0.8]),
  ["room_night", S.quart[0], S.quart[1] - S.quart[0], 0.4],
  ["fire", W("печь") + 0.1, 2.5, 0.6],
  ["buzz", S.brief[0] + 0.3, 1.2, 0.5],
  ["click", L.l52.start + 0.2, 0.06, 1.2],
  ["room_night", S.brief[0], CUT - S.brief[0], 0.35],
].filter(([, , , v]) => v > 0);
const audio = [
  `<audio id="vo" class="clip" src="assets/vo.wav" data-start="0" data-duration="${r(L.l53.end + 0.1)}" data-track-index="10" data-volume="1"></audio>`,
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
<title>Глеб — часть 18</title>
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
