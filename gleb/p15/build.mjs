// "Глеб — часть 15": Gleb is GHOUL; Valkyrie; the virus; the helicopter; the shot.
// Run from gleb/p15: node build.mjs → index.html (sfx shared via assets/sfx symlink).
import fs from "node:fs";
import * as R from "../art/rig.js";
import * as F13 from "../p13/art13.js";
import * as F6 from "../p6/art6.js";
import * as F15 from "./art15.js";

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
const CUT = r(L.l32.end + 2.0);
const TITLE = [CUT, r(CUT + 3.2)];
const CARD_START = r(TITLE[1] + 0.1);
const CARD_DUR = 3.6;
const TOTAL = r(CARD_START + CARD_DUR);
const S = {};
{
  const ends = [
    ["reveal", L.l19.end + 0.5],
    ["heli", L.l29.end + 0.6],
    ["hold", L.l31.end + 0.8],
    ["zombie", CUT],
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
const show = (sel, at) => T(`tl.set("${sel}", {opacity:1}, ${r(at)});`);
const shake = (sel, at, n = 6, amp = 14) =>
  T(
    `tl.to("${sel}", {keyframes:${JSON.stringify(Array.from({ length: n }, (_, i) => ({ x: (i % 2 ? -1 : 1) * amp * (1 - i / n), y: ((i % 3) - 1) * amp * 0.6 * (1 - i / n), duration: 0.05 })).concat([{ x: 0, y: 0, duration: 0.05 }]))}}, ${r(at)});`,
  );
const GX = 2140;
const GLABEL = (x) =>
  `<g><rect x="${x - 28}" y="830" width="56" height="22" rx="3" fill="#f2efe6"/><text x="${x}" y="847" text-anchor="middle" font-family="Inter, sans-serif" font-weight="900" font-size="16" fill="#c9302c">ГУЛЬ</text></g>`;
const world = (k, extra = "") =>
  `<g>${P(`${k}-art`, F13.row(), -200, 1100, 2160)}</g>
   <g id="${k}-xw" transform="translate(0 0) rotate(0 1330 1080)">${C(`${k}-mx`, MXS({ helmet: true }), 1330, 1080)}</g>
   <g id="${k}-mw" transform="translate(0 0) rotate(0 1500 1080)">${C(`${k}-m`, MB(), 1500, 1080)}</g>
   ${extra}`;

/* S1 he turns round — and draws a pistol */
scene(
  "reveal",
  world(
    "rv",
    `<g id="rv-g0">${C("rv-g", R.gleb({ prop: "pistol" }), GX, 1080)}</g>
     <g id="rv-g1w" opacity="0"><g id="rv-g1">${C("rv-gh", R.gleb({ ghoul: true, prop: "pistol" }), GX, 1080)}</g>${GLABEL(GX)}</g>
     ${F15.jacket("rv-jacket", GX, 1050)}
     ${F15.cigarette("rv-cig", GX - 40, 792)}
     ${F6.muzzle("rv-flash", 1975, 838, 0.7)}
     <path id="rv-ear" d="M${GX - 40} 740 q-10 0 -10 12" stroke="#ffe27a" stroke-width="4" fill="none" opacity="0"/>`,
  ),
  { bg: "#2a2a5a" },
);
{
  const [a, b] = S.reveal;
  camSet("reveal", GX, 700, 2.6, a, 880);
  T(
    `tl.set("#rv-g0", {scaleX:-1, svgOrigin:"${GX} 1080"}, ${r(a)}); tl.set("#rv-g1", {scaleX:-1, svgOrigin:"${GX} 1080"}, ${r(a)});`,
  );
  T(`tl.set("#zm-reveal .rv-cig", {scaleX:-1, svgOrigin:"${GX - 40} 792"}, ${r(a)});`);
  expr("rv-g", "neutral", a);
  expr("rv-m", "scared", a);
  expr("rv-mx", "sad", a);
  pose("rv-g", "armR", 0, a, 0.01);
  talk("rv-g", "l02");
  // the pistol, the shot at Maxim's legs
  gesture("rv-g", "pointR", W("выхватил") - 0.1, 0.15);
  camTo("reveal", 1740, 760, 1.3, W("выхватил"), 0.5, 900, "power2.out");
  const shot1 = W("выстрел", 1);
  T(
    `tl.fromTo("#zm-reveal .rv-flash", {opacity:1}, {opacity:0, duration:.12, immediateRender:false}, ${r(shot1)});`,
  );
  shake("#sh-reveal", shot1, 8, 12);
  expr("rv-mx", "pain", shot1 + 0.1);
  T(
    `tl.to("#rv-mx .legL, #rv-mx .legR", {scaleY:.45, svgOrigin:"0 0", duration:.3}, ${r(shot1 + 0.1)});`,
  );
  T(
    `tl.to("#rv-xw", {attr:{transform:"translate(0 115) rotate(0 1330 1080)"}, duration:.3}, ${r(shot1 + 0.1)});`,
  );
  gesture("rv-mx", "duck", shot1 + 0.2, 0.2);
  camTo("reveal", 1330, 760, 2.4, L.l05.start - 0.2, 0.3, 880, "power2.out");
  talk("rv-mx", "l05");
  camTo("reveal", 1500, 700, 2.4, L.l06.start - 0.2, 0.3, 880, "power2.out");
  expr("rv-m", "shock", L.l06.start);
  gesture("rv-m", "headBoth", L.l06.start, 0.2);
  talk("rv-m", "l06");
  // the jacket comes off: GHOUL
  camTo("reveal", GX, 760, 2.0, L.l07.start, 0.6, 880, "power2.inOut");
  const off = W("скинул") + 0.2;
  T(`tl.set("#rv-g0", {opacity:0}, ${r(off)}); tl.set("#rv-g1w", {opacity:1}, ${r(off)});`);
  T(`tl.set("#zm-reveal .rv-jacket", {opacity:1}, ${r(off)});`);
  T(
    `tl.fromTo("#zm-reveal .rv-jacket", {y:-200, rotation:0}, {y:0, rotation:-20, svgOrigin:"${GX} 1050", duration:.5, ease:"power2.in", immediateRender:false}, ${r(off)});`,
  );
  expr("rv-gh", "neutral", a);
  camTo("reveal", GX, 860, 3.2, W("гуль", 1) - 0.3, 0.6, 900, "power2.inOut");
  camTo("reveal", GX, 700, 2.6, L.l08.start - 0.2, 0.5, 880, "power2.inOut");
  expr("rv-gh", "angry", L.l08.start);
  talk("rv-gh", "l08");
  talk("rv-gh", "l09");
  camTo("reveal", 1500, 700, 2.4, L.l10.start - 0.2, 0.4, 880, "power2.inOut");
  expr("rv-m", "cry", L.l10.start);
  gesture("rv-m", "rest", L.l10.start, 0.3);
  talk("rv-m", "l10");
  // the earpiece: Valkyrie
  camTo("reveal", GX - 40, 740, 4.0, L.l11.start, 0.6, 880, "power2.inOut");
  T(
    `tl.to("#rv-ear", {opacity:1, duration:.15, yoyo:true, repeat:${Math.round((L.l12.end - L.l11.start) / 0.3)}}, ${r(L.l11.start + 0.5)});`,
  );
  camTo("reveal", GX, 700, 2.6, L.l13.start - 0.2, 0.4, 880, "power2.inOut");
  expr("rv-gh", "neutral", L.l13.start);
  pose("rv-gh", "head", -8, L.l13.start, 0.3);
  talk("rv-gh", "l13");
  pose("rv-gh", "head", 0, L.l13.end, 0.3);
  // the virus
  expr("rv-gh", "angry", L.l14.start);
  talk("rv-gh", "l14");
  camTo("reveal", 1820, 740, 1.6, L.l15.start, 1.0, 880, "power2.inOut");
  talk("rv-gh", "l15");
  // a cigarette
  camTo("reveal", GX, 720, 3.0, L.l16.start - 0.2, 0.5, 880, "power2.inOut");
  T(`tl.set("#zm-reveal .rv-cig", {opacity:1}, ${r(W("закурил") - 0.2)});`);
  T(
    `tl.fromTo("#zm-reveal .cig-smoke", {y:0, opacity:.5}, {y:-40, opacity:0, duration:1.4, stagger:{each:.4, repeat:${Math.round((b - L.l16.start) / 1.4)}}, immediateRender:false}, ${r(W("закурил"))});`,
  );
  gesture("rv-gh", "rest", L.l16.start, 0.3);
  expr("rv-gh", "neutral", L.l17.start);
  camTo("reveal", GX, 700, 2.4, L.l17.start - 0.2, 0.5, 880, "power2.inOut");
  talk("rv-gh", "l17");
  camTo("reveal", 1330, 820, 2.4, L.l18.start - 0.2, 0.4, 880, "power2.inOut");
  talk("rv-mx", "l18");
  camTo("reveal", GX, 700, 2.6, L.l19.start - 0.2, 0.4, 880, "power2.out");
  expr("rv-gh", "angry", L.l19.start);
  gesture("rv-gh", "pointR", L.l19.start + 0.3, 0.2);
  talk("rv-gh", "l19");
  ["rv-g", "rv-gh", "rv-m", "rv-mx"].forEach((id) => blink(id, a, b));
}

/* S2 the helicopter, Valkyrie, and the shot */
scene(
  "heli",
  world(
    "hl",
    `<g id="hl-gw2"><g id="hl-gw">${C("hl-g", R.gleb({ ghoul: true, prop: "pistol" }), GX, 1080)}${F15.cigarette("hl-cig", GX - 40, 792)}</g>${GLABEL(GX)}</g>
     <g id="hl-vw" opacity="0">${C("hl-v", R.valkyrie(), 1900, 1080)}</g>
     <g id="hl-hw">${F15.heli("hl-heli", 1980, 380, 1.2)}</g>
     ${F6.muzzle("hl-flash", 1975, 838, 0.7)}`,
  ),
  { bg: "#2a2a5a" },
);
{
  const [a, b] = S.heli;
  camSet("heli", 1800, 640, 1.0, a, 900);
  T(`tl.set("#hl-gw", {scaleX:-1, svgOrigin:"${GX} 1080"}, ${r(a)});`);
  T(`tl.set("#hl-xw", {attr:{transform:"translate(0 115) rotate(0 1330 1080)"}}, ${r(a)});`);
  T(`tl.set("#hl-mx .legL, #hl-mx .legR", {scaleY:.45, svgOrigin:"0 0"}, ${r(a)});`);
  T(`tl.set("#zm-heli .hl-cig", {opacity:1}, ${r(a)});`);
  T(
    `tl.to("#zm-heli .rotor", {scaleX:.1, svgOrigin:"0 -102", duration:.06, yoyo:true, repeat:${Math.round((b - a) / 0.06)}}, ${r(a)});`,
  );
  expr("hl-g", "neutral", a);
  expr("hl-m", "cry", a);
  expr("hl-mx", "pain", a);
  gesture("hl-mx", "duck", a, 0.01);
  T(
    `tl.fromTo("#hl-hw", {x:1400, y:-300}, {x:0, y:0, duration:${r(L.l21.start - a)}, ease:"power2.out", immediateRender:false}, ${r(a)});`,
  );
  // she jumps down
  show("#hl-vw", W("спрыгнула") - 0.1);
  T(
    `tl.fromTo("#hl-vw", {y:-560}, {y:0, duration:.6, ease:"bounce.out", immediateRender:false}, ${r(W("спрыгнула") - 0.1)});`,
  );
  expr("hl-v", "neutral", a);
  camTo("heli", 1900, 700, 2.6, W("спрыгнула") + 0.6, 1.0, 880, "power2.inOut");
  camTo("heli", 1900, 880, 3.2, W("валькирия", 1, L.l21.start) - 0.5, 0.6, 900, "power2.inOut");
  camTo("heli", 1900, 700, 2.4, L.l22.start - 0.2, 0.5, 880, "power2.inOut");
  expr("hl-v", "happy", L.l22.start);
  talk("hl-v", "l22");
  camTo("heli", GX, 700, 2.4, L.l23.start - 0.2, 0.4, 880, "power2.inOut");
  talk("hl-g", "l23");
  camTo("heli", 1500, 700, 2.4, L.l24.start - 0.2, 0.4, 880, "power2.inOut");
  gesture("hl-m", "open", L.l24.start, 0.2);
  talk("hl-m", "l24");
  // he raises the pistol
  camTo("heli", 1820, 740, 1.6, L.l25.start, 0.8, 880, "power2.inOut");
  gesture("hl-g", "pointR", W("поднял") - 0.1, 0.3);
  camTo("heli", GX, 700, 3.0, L.l26.start - 0.3, 0.4, 880, "power2.out");
  expr("hl-g", "angry", L.l26.start - 0.2);
  talk("hl-g", "l26");
  const shot = W("выстрел", 1, L.l27.start);
  camTo("heli", 1700, 760, 1.4, shot - 0.1, 0.3, 900, "power2.out");
  T(
    `tl.fromTo("#zm-heli .hl-flash", {opacity:1}, {opacity:0, duration:.12, immediateRender:false}, ${r(shot)});`,
  );
  shake("#sh-heli", shot, 8, 14);
  expr("hl-m", "pain", shot + 0.1);
  T(
    `tl.to("#hl-mw", {attr:{transform:"translate(-40 0) rotate(-90 1500 1080)"}, duration:.7, ease:"power2.in"}, ${r(shot + 0.2)});`,
  );
  T(
    `tl.set("#hl-m .eyes-closed", {opacity:1}, ${r(shot + 0.9)}); tl.set("#hl-m .eyes-open, #hl-m .eyes-wide, #hl-m .eyes-squint", {opacity:0}, ${r(shot + 0.9)});`,
  );
  camTo("heli", 1330, 820, 2.4, L.l28.start - 0.2, 0.3, 880, "power2.out");
  expr("hl-mx", "cry", L.l28.start);
  gesture("hl-mx", "open", L.l28.start, 0.2);
  talk("hl-mx", "l28");
  // they board and fly off
  camTo("heli", 1800, 560, 1.0, L.l29.start, 0.8, 900, "power2.inOut");
  T(
    `tl.to("#hl-gw2, #hl-vw", {y:-560, opacity:0, duration:1.0, ease:"power2.in", stagger:.2}, ${r(L.l29.start + 0.6)});`,
  );
  T(
    `tl.to("#hl-hw", {x:-1600, y:-600, duration:${r(b - L.l29.start - 2.2)}, ease:"power2.in"}, ${r(L.l29.start + 2.2)});`,
  );
  ["hl-g", "hl-v", "hl-mx"].forEach((id) => blink(id, a, b));
  blink("hl-m", a, shot);
}

/* S3 Maxim holds her */
scene("hold", world("hd"), { bg: "#2a2a5a" });
{
  const [a, b] = S.hold;
  camSet("hold", 1440, 900, 2.4, a, 900);
  T(`tl.set("#hd-xw", {attr:{transform:"translate(110 115) rotate(0 1330 1080)"}}, ${r(a)});`);
  T(`tl.set("#hd-mx .legL, #hd-mx .legR", {scaleY:.45, svgOrigin:"0 0"}, ${r(a)});`);
  T(`tl.set("#hd-mw", {attr:{transform:"translate(-40 0) rotate(-90 1500 1080)"}}, ${r(a)});`);
  expr("hd-mx", "cry", a);
  expr("hd-m", "pain", a);
  gesture("hd-mx", "duck", a, 0.01);
  pose("hd-mx", "head", 16, a, 0.01);
  T(
    `tl.set("#hd-m .eyes-closed", {opacity:1}, ${r(a)}); tl.set("#hd-m .eyes-open", {opacity:0}, ${r(a)});`,
  );
  talk("hd-mx", "l30");
  T(
    `tl.set("#hd-m .eyes-closed", {opacity:0}, ${r(L.l31.start - 0.3)}); tl.set("#hd-m .eyes-squint", {opacity:1}, ${r(L.l31.start - 0.3)});`,
  );
  camTo("hold", 1250, 1000, 3.0, L.l31.start - 0.3, 0.5, 900, "power2.inOut");
  talk("hd-m", "l31");
  T(
    `tl.set("#hd-m .eyes-squint", {opacity:0}, ${r(L.l31.end + 0.4)}); tl.set("#hd-m .eyes-closed", {opacity:1}, ${r(L.l31.end + 0.4)});`,
  );
  blink("hd-mx", a, b);
}

/* S4 at the edge of the camp: glowing eyes */
scene(
  "zombie",
  `<g>${P("zb-art", F13.row(), -200, 1100, 2160)}</g>
   <rect x="-800" y="-800" width="4000" height="3520" fill="#05060c" opacity=".7"/>
   <g id="zb-z" opacity="0" style="filter:brightness(.35)">${C("zb-zr", R.grandpa({ brow: "angry" }), 700, 1080)}</g>
   <g id="zb-eyes" opacity="0"><circle cx="684" cy="744" r="9" fill="#e9f4ff"/><circle cx="716" cy="744" r="9" fill="#e9f4ff"/><circle cx="700" cy="744" r="60" fill="#e9f4ff" opacity=".12"/></g>`,
  { bg: "#05060c" },
);
{
  const [a, b] = S.zombie;
  camSet("zombie", 700, 760, 1.6, a, 900);
  T(
    `tl.fromTo("#zb-z", {opacity:0, x:60}, {opacity:1, x:0, duration:1.0, immediateRender:false}, ${r(L.l32.start + 1.0)});`,
  );
  walk("zb-zr", L.l32.start + 1.0, b, 0, 0, 0.5, 10);
  T(`tl.to("#zb-eyes", {opacity:1, duration:.3}, ${r(W("глаза", 1, L.l32.start) - 0.1)});`);
  camTo(
    "zombie",
    700,
    744,
    4.0,
    W("глаза", 1, L.l32.start) - 0.4,
    b - W("глаза", 1, L.l32.start) + 0.4,
    880,
    "power1.in",
  );
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
};
const HOT = new Set(
  "всё гуль валькирия вирус зомби прикрытие предан вертолёт летим беременна машенька мутно-белым".split(
    " ",
  ),
);
const DANGER = new Set("пистолет выстрел жалко сдохни молчи".split(" "));
const hook = `<div id="hook" class="clip toptitle" data-start="0.2" data-duration="${r(L.l01.start - 0.1)}" data-track-index="2" style="z-index:5"><div class="tt-s">${spl("ГЛЕБ", "hs")}</div><div class="tt-a">${spl("ЧАСТЬ 15", "ha")}</div></div>`;
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
  stamp("st-bang1", W("выстрел", 1), W("выстрел", 1) + 1.0, "БАХ!", "#ff4a3d"),
  stamp(
    "st-bang2",
    W("выстрел", 1, L.l27.start),
    W("выстрел", 1, L.l27.start) + 1.0,
    "БАХ!",
    "#ff4a3d",
  ),
].join("\n");
const title = `<div id="tbc" class="clip" data-start="${TITLE[0]}" data-duration="${r(TITLE[1] - TITLE[0])}" data-track-index="4" style="z-index:8"><div id="tbc-a">${spl("ПРОДОЛЖЕНИЕ СЛЕДУЕТ…", "ta")}</div><div id="tbc-b">ЧАСТЬ 16</div></div>`;
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
  ["room_day", 0, S.reveal[1] > 26 ? 26 : S.reveal[1], 0.4],
  ["room_day", 26, Math.max(0.5, S.reveal[1] - 26), 0.4],
  ["gunfire", W("выстрел", 1), 0.4, 1.3],
  ["slam", W("выстрел", 1) + 0.15, 0.5, 0.9],
  ["click", L.l11.start + 0.4, 0.06, 1.0],
  ["buzz", L.l12.start - 0.2, 1.2, 0.3],
  ["pop", W("закурил") - 0.2, 0.09, 0.8],
  ["tank", S.heli[0], S.heli[1] - S.heli[0], 0.55],
  ["gunfire", W("выстрел", 1, L.l27.start), 0.4, 1.3],
  ["room_night", S.hold[0], CUT - S.hold[0], 0.5],
].filter(([, , , v]) => v > 0);
const audio = [
  `<audio id="vo" class="clip" src="assets/vo.wav" data-start="0" data-duration="${r(L.l32.end + 0.1)}" data-track-index="10" data-volume="1"></audio>`,
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
<title>Глеб — часть 15</title>
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
