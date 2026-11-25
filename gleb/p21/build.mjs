// "Глеб — часть 21": three shots, three stretchers, a colonel, and the contractions.
// Run from gleb/p21: node build.mjs → index.html (sfx shared via assets/sfx symlink).
import fs from "node:fs";
import * as R from "../art/rig.js";
import * as F18 from "../p18/art18.js";
import * as F20 from "../p20/art20.js";
import * as F21 from "./art21.js";

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
const CUT = r(L.l30.end + 2.0);
const TITLE = [CUT, r(CUT + 3.2)];
const CARD_START = r(TITLE[1] + 0.1);
const CARD_DUR = 3.6;
const TOTAL = r(CARD_START + CARD_DUR);
const S = {};
{
  const ends = [
    ["dark", L.l09.end + 0.9],
    ["hangar", L.l16.end + 0.9],
    ["office", L.l21.end + 0.9],
    ["box", CUT],
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
let seed = 101;
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
const MP = (o = {}) => R.masha({ outfit: "black", pregnant: true, ...o });
const room = (x) => strip(x);
const show = (sel, at) => T(`tl.set("${sel}", {opacity:1}, ${r(at)});`);
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
const say = (k, id, lid, x, y = 700, s = 2.1) => {
  camTo(k, x, y, s, L[lid].start - 0.3, 0.5, 900, "power2.inOut");
  talk(id, lid);
};

/* S1 three a.m. in the lab: three shots */
scene(
  "dark",
  `${room(F20.lab())}
   ${C("dk-m", MP(), 900, 860)}
   ${room(F20.glass())}
   <rect id="dk-n" x="-800" y="-800" width="2680" height="3520" fill="#03050c" opacity=".55"/>
   <g id="dk-qw">${C("dk-q", OM(2), 210, 1080)}</g>
   <g id="dk-dw">${C("dk-d", OM(3), 380, 1080)}</g>
   <g id="dk-fw">${C("dk-f", OM(1), 580, 1080)}</g>
   ${C("dk-g", GO({ prop: "pistol" }), 1020, 1090)}
   ${C("dk-v", R.valkyrie(), -120, 1080)}
   <path id="dk-beam" d="M1000 760 L560 520 L560 1000 Z" fill="#fff6c8" opacity=".25"/>
   <circle id="dk-cam" cx="540" cy="110" r="14" fill="#ff2a2a" opacity="0"/>
   <g id="dk-flash" opacity="0"><path d="M0 -26 L8 -8 L26 -10 L12 4 L20 22 L0 12 L-20 22 L-12 4 L-26 -10 L-8 -8Z" fill="#ffe27a" stroke="#ff8a2b" stroke-width="3"/></g>
   <rect id="dk-black" x="-800" y="-800" width="2680" height="3520" fill="#000" opacity="0"/>`,
  { bg: "#03050c" },
);
{
  const [a, b] = S.dark;
  camSet("dark", 540, 140, 2.6, a, 900);
  yoyo("#dk-cam", "opacity:1", a, b, 0.3);
  ["dk-q", "dk-d", "dk-f"].forEach((id) => expr(id, "scared", a));
  expr("dk-m", "scared", a);
  expr("dk-g", "determined", a);
  expr("dk-v", "happy", a);
  pose("dk-g", "armR", -95, a, 0.01);
  pose("dk-g", "armR-lo", 0, a, 0.01);
  camTo("dark", 640, 700, 1.3, a + 1.2, 2.0, 900, "power2.inOut");
  expr("dk-f", "determined", L.l02.start);
  say("dark", "dk-f", "l02", 580, 680, 2.2);
  expr("dk-d", "sad", L.l03.start);
  say("dark", "dk-d", "l03", 380, 680, 2.2);
  expr("dk-q", "determined", L.l04.start);
  say("dark", "dk-q", "l04", 210, 680, 2.2);
  say("dark", "dk-g", "l05", 1000, 680, 2.4);
  // three shots (no gore: a flash, darkness, falls)
  const sh = [L.l06.start + 0.05, L.l06.start + 0.45, L.l06.start + 0.85];
  T(`tl.set("#dk-flash", {x:1120, y:850}, ${r(sh[0] - 0.05)});`);
  camTo("dark", 640, 760, 1.2, L.l05.end, 0.4, 900, "power2.out");
  [
    ["dk-fw", 580],
    ["dk-dw", 380],
    ["dk-qw", 210],
  ].forEach(([w, x], i) => {
    T(
      `tl.fromTo("#dk-flash", {opacity:1, scale:1.3, svgOrigin:"0 0"}, {opacity:0, scale:.6, duration:.12, immediateRender:false}, ${r(sh[i])});`,
    );
    shake("#sh-dark", sh[i], 3, 8);
    T(
      `tl.to("#${w}", {rotation:-85, svgOrigin:"${x} 1080", duration:.4, ease:"power2.in"}, ${r(sh[i] + 0.05)});`,
    );
  });
  T(`tl.to("#dk-black", {opacity:.85, duration:.3}, ${r(sh[2] + 0.3)});`);
  T(`tl.to("#dk-black", {opacity:0, duration:.6}, ${r(L.l07.start - 0.4)});`);
  expr("dk-m", "cry", L.l07.start);
  gesture("dk-m", "headBoth", L.l07.start, 0.3);
  say("dark", "dk-m", "l07", 900, 520, 2.0);
  say("dark", "dk-v", "l08", -100, 680, 2.0);
  pose("dk-g", "armR", 0, L.l09.start - 0.3, 0.3);
  pose("dk-g", "armR-lo", 0, L.l09.start - 0.3, 0.3);
  expr("dk-g", "neutral", L.l09.start);
  say("dark", "dk-g", "l09", 1000, 680, 2.2);
  ["dk-m", "dk-g", "dk-v"].forEach((id) => blink(id, a, b));
}

/* S2 morning in the hangar: three stretchers */
scene(
  "hangar",
  `${room(F18.hangar())}
   ${F21.stretcher(300, 960, true)}
   ${F21.stretcher(620, 980)}
   ${F21.stretcher(920, 960)}
   ${big(560, 1090, 1.12, C("hg-b", OM(0), 560, 1090))}
   ${C("hg-g", GO(), 900, 1090)}`,
  { bg: "#3a3e46" },
);
{
  const [a, b] = S.hangar;
  camSet("hangar", 600, 760, 1.0, a, 900);
  expr("hg-b", "neutral", a);
  expr("hg-g", "neutral", a);
  camTo("hangar", 600, 860, 1.4, a + 0.4, L.l10.end - a, 900, "sine.inOut");
  expr("hg-b", "shock", L.l11.start);
  say("hangar", "hg-b", "l11", 560, 700, 1.9);
  say("hangar", "hg-g", "l12", 880, 700, 2.2);
  expr("hg-b", "sad", L.l13.start);
  say("hangar", "hg-b", "l13", 560, 700, 1.9);
  expr("hg-g", "determined", L.l14.start);
  say("hangar", "hg-g", "l14", 880, 700, 2.2);
  camTo("hangar", 170, 930, 2.8, L.l15.start + 0.3, 1.2, 900, "power2.inOut");
  pose("hg-b", "head", 12, L.l15.start, 0.5);
  expr("hg-b", "cry", W("рыжую"));
  camTo("hangar", 560, 700, 2.0, L.l16.start - 0.3, 0.6, 900, "power2.inOut");
  pose("hg-b", "head", 0, L.l16.start, 0.4);
  pose("hg-b", "armR", -150, L.l16.start + 0.4, 0.3);
  pose("hg-b", "armR-lo", -100, L.l16.start + 0.4, 0.3);
  talk("hg-b", "l16");
  ["hg-b", "hg-g"].forEach((id) => blink(id, a, b));
}

/* S3 the general's office: the last test, a colonel */
scene(
  "office",
  `${room(F18.office())}
   ${C("of-gn", R.general(), 540, 1000)}
   ${room(F18.desk())}
   ${C("of-g", GO(), 160, 1090)}
   ${C("of-v", R.valkyrie(), 960, 1090)}
   ${F21.star("of-star")}`,
  { bg: "#4a3a30" },
);
{
  const [a, b] = S.office;
  camSet("office", 540, 700, 1.1, a, 900);
  expr("of-gn", "happy", a);
  expr("of-g", "determined", a);
  expr("of-v", "neutral", a);
  say("office", "of-gn", "l17", 540, 660, 1.8);
  say("office", "of-gn", "l18", 540, 660, 2.2);
  show("#of-star", L.l19.start + 1.0);
  T(
    `tl.fromTo("#of-star", {x:540, y:760, scale:.4}, {x:300, y:640, scale:1, duration:.6, ease:"back.out(2)", immediateRender:false}, ${r(L.l19.start + 1.0)});`,
  );
  say("office", "of-gn", "l19", 440, 660, 1.8);
  pose("of-g", "armR", -150, L.l20.start, 0.2);
  pose("of-g", "armR-lo", -100, L.l20.start, 0.2);
  say("office", "of-g", "l20", 180, 700, 2.3);
  expr("of-v", "determined", L.l21.start);
  say("office", "of-v", "l21", 940, 700, 2.2);
  ["of-gn", "of-g", "of-v"].forEach((id) => blink(id, a, b));
}

/* S4 the box: "I am a soldier", and then the contractions */
scene(
  "box",
  `${room(F20.lab())}
   <g id="bx-mw">${C("bx-m", MP(), 900, 860)}</g>
   ${room(F20.glass())}
   ${C("bx-g", GO(), 520, 1080)}
   <g id="bx-pw" opacity="0">${C("bx-p", R.professor(), 140, 1080)}</g>
   <rect id="bx-alarm" x="-800" y="-800" width="2680" height="3520" fill="#ff2a2a" opacity="0"/>`,
  { bg: "#dfe6ea" },
);
{
  const [a, b] = S.box;
  camSet("box", 700, 640, 1.2, a, 900);
  T(
    `tl.to("#zm-box .ecg", {x:-30, duration:.5, repeat:${Math.round((b - a) / 0.5)}, ease:"none"}, ${r(a)});`,
  );
  expr("bx-m", "angry", a);
  expr("bx-g", "neutral", a);
  say("box", "bx-m", "l23", 900, 520, 2.1);
  say("box", "bx-g", "l24", 540, 700, 2.2);
  expr("bx-m", "cry", L.l25.start);
  say("box", "bx-m", "l25", 900, 520, 2.1);
  say("box", "bx-g", "l26", 540, 700, 2.4);
  expr("bx-m", "pain", L.l27.start + 0.4);
  gesture("bx-m", "duck", L.l27.start + 0.4, 0.3);
  T(`tl.to("#bx-mw", {y:20, duration:.4}, ${r(L.l27.start + 0.4)});`);
  camTo("box", 900, 560, 1.8, L.l27.start, 0.6, 900, "power2.inOut");
  say("box", "bx-m", "l28", 900, 540, 2.2);
  expr("bx-g", "shock", L.l28.start + 0.4);
  show("#bx-pw", L.l29.start - 0.5);
  T(
    `tl.fromTo("#bx-pw", {x:-200}, {x:0, duration:.5, ease:"power2.out", immediateRender:false}, ${r(L.l29.start - 0.5)});`,
  );
  walk("bx-p", L.l29.start - 0.5, L.l29.start, 0, 0, 0.25, 14);
  expr("bx-p", "happy", L.l29.start);
  yoyo("#bx-alarm", "opacity:.2", L.l29.start, b, 0.4);
  say("box", "bx-p", "l29", 160, 700, 2.0);
  expr("bx-g", "determined", L.l30.start);
  say("box", "bx-g", "l30", 540, 700, 2.3);
  camTo("box", 700, 640, 1.1, L.l30.end + 0.2, CUT - L.l30.end - 0.2, 900, "sine.inOut");
  ["bx-m", "bx-g", "bx-p"].forEach((id) => blink(id, a, b));
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
  prof: ["ПРОФЕССОР", "#c9d8ff"],
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
  "присягу омегу полковник заместитель генералу солдат будущее началось схватки гранита".split(" "),
);
const DANGER = new Set(
  "клетке понадобится убьют опыты вирус сжечь пёс стреляй пистолет камеры".split(" "),
);
const hook = `<div id="hook" class="clip toptitle" data-start="0.2" data-duration="${r(L.l01.start - 0.1)}" data-track-index="2" style="z-index:5"><div class="tt-s">${spl("ГЛЕБ", "hs")}</div><div class="tt-a">${spl("ЧАСТЬ 21", "ha")}</div></div>`;
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
  stamp("st-bang", L.l06.start, L.l06.start + 1.4, "БАХ! БАХ! БАХ!", "#ff4a3d"),
  stamp("st-col", L.l19.start + 1.2, L.l19.end + 0.6, "ПОЛКОВНИК", "#ffb02e"),
  stamp("st-alarm", L.l29.start, L.l29.end + 0.4, "ТРЕВОГА", "#ff4a3d"),
].join("\n");
const title = `<div id="tbc" class="clip" data-start="${TITLE[0]}" data-duration="${r(TITLE[1] - TITLE[0])}" data-track-index="4" style="z-index:8"><div id="tbc-a">${spl("ПРОДОЛЖЕНИЕ СЛЕДУЕТ…", "ta")}</div><div id="tbc-b">ЧАСТЬ 22</div></div>`;
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
  ["room_night", 0, S.dark[1], 0.5],
  ["gunfire", L.l06.start + 0.05, 0.35, 1.0],
  ["gunfire", L.l06.start + 0.45, 0.35, 1.0],
  ["gunfire", L.l06.start + 0.85, 0.35, 1.0],
  ["room_day", S.hangar[0], S.office[1] - S.hangar[0], 0.35],
  ["room_day", S.box[0], CUT - S.box[0], 0.3],
  ["buzz", L.l29.start, 1.2, 0.6],
  ["buzz", L.l29.start + 1.2, 1.2, 0.6],
  ["buzz", L.l30.start, 1.2, 0.5],
].filter(([, , , v]) => v > 0);
const audio = [
  `<audio id="vo" class="clip" src="assets/vo.wav" data-start="0" data-duration="${r(L.l30.end + 0.1)}" data-track-index="10" data-volume="1"></audio>`,
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
<title>Глеб — часть 21</title>
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
