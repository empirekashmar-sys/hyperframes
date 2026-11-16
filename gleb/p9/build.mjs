// "Глеб — часть 9": the hidden hare, a night, the banya, kisses, and a plan to run away together.
// Run from gleb/p9: node build.mjs → index.html (sfx shared via assets/sfx symlink).
import fs from "node:fs";
import * as R from "../art/rig.js";
import * as F8 from "../p8/art8.js";
import * as F9 from "./art9.js";

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
const CUT = r(L.l39.end + 1.8);
const TITLE = [CUT, r(CUT + 3.2)];
const CARD_START = r(TITLE[1] + 0.1);
const CARD_DUR = 3.6;
const TOTAL = r(CARD_START + CARD_DUR);
const S = {};
{
  const ends = [
    ["arrive", L.l03.end + 0.6],
    ["stove", L.l08.end + 0.6],
    ["night", L.l10.end + 0.6],
    ["morning", L.l14.end + 0.5],
    ["banya", L.l23.end + 0.5],
    ["coat", L.l30.end + 0.8],
    ["moon", CUT],
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
const MXB = (o = {}) => R.maxim({ uniform: true, helmet: false, prop: "", brow: "neutral", ...o });
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

const kiss = (aId, bId, at, dur = 1.6, ax = 60, bx = -60) => {
  // aId stands left of bId: they lean in, heads tilt, eyes close, a heart pops
  T(`tl.to("#${aId}", {x:"+=${ax}", y:-14, duration:.4, ease:"power2.out"}, ${r(at)});`);
  T(`tl.to("#${bId}", {x:"+=${bx}", duration:.4, ease:"power2.out"}, ${r(at)});`);
  pose(aId, "head", 14, at, 0.4);
  pose(bId, "head", -14, at, 0.4);
  [aId, bId].forEach((id) => {
    T(
      `tl.set("#${id} .eyes-closed", {opacity:1}, ${r(at + 0.35)}); tl.set("#${id} .eyes-open, #${id} .eyes-wide, #${id} .eyes-squint", {opacity:0}, ${r(at + 0.35)});`,
    );
    T(
      `tl.set("#${id} .eyes-closed", {opacity:0}, ${r(at + dur)}); tl.set("#${id} .eyes-open", {opacity:1}, ${r(at + dur)});`,
    );
  });
  T(`tl.to("#${aId}", {x:"-=${ax / 2}", y:0, duration:.4, ease:"power2.inOut"}, ${r(at + dur)});`);
  T(`tl.to("#${bId}", {x:"-=${bx / 2}", duration:.4, ease:"power2.inOut"}, ${r(at + dur)});`);
  pose(aId, "head", 0, at + dur, 0.4);
  pose(bId, "head", 0, at + dur, 0.4);
};

/* S1 back at dusk, firewood under one arm, the hare inside his coat */
scene(
  "arrive",
  `${room(F8.dacha())}
   <rect x="-800" y="-800" width="2680" height="3520" fill="#0a1030" opacity=".55"/>
   <rect x="380" y="640" width="120" height="110" fill="#ffcf7a" opacity=".85"/>
   <g id="ar-mxg">${C("ar-mx", MXB({ helmet: true }), 120, 1000)}
   ${F9.firewood(70, 830)}<g id="ar-hare">${F9.hare("h", 132, 830, 0.7)}</g></g>
   ${F8.snow("snowfx")}`,
  { bg: "#1a2440" },
);
{
  const [a, b] = S.arrive;
  camSet("arrive", 400, 760, 1.2, a, 900);
  snowFall("arrive", a, b);
  expr("ar-mx", "tired", a);
  walk("ar-mx", a + 0.2, L.l02.end, 0, 0, 0.32, 18, false);
  T(`tl.to("#ar-mxg", {x:420, duration:${r(L.l02.end - a - 0.2)}, ease:"none"}, ${r(a + 0.2)});`);
  camTo("arrive", 560, 760, 1.5, a + 0.3, L.l02.end - a, 900, "sine.inOut");
  // close-up: he tucks the hare away
  camTo("arrive", 540, 700, 2.6, L.l03.start - 0.3, 0.5, 880, "power2.inOut");
  expr("ar-mx", "sad", L.l03.start);
  talk("ar-mx", "l03");
  T(`tl.to("#ar-hare", {y:40, opacity:0, duration:.5}, ${r(L.l03.start + 0.8)});`);
  blink("ar-mx", a, b);
}

/* S2 by the stove: warming up, the first real kiss */
scene(
  "stove",
  `${room(F8.kitchen())}
   ${C("st-m", R.masha(), 300, 1060)}
   ${C("st-mx", MXB(), 900, 1060)}
   ${hearts("st-h", 600, 560)}
   <rect id="st-fade" x="-800" y="-800" width="2680" height="3520" fill="#000" opacity="0"/>`,
  { bg: "#6a4630" },
);
{
  const [a, b] = S.stove;
  camSet("stove", 560, 700, 1.4, a, 900);
  T(`tl.set("#zm-stove .stovefire", {opacity:1}, ${r(a)});`);
  expr("st-m", "happy", a);
  expr("st-mx", "tired", a);
  walk("st-mx", a, L.l04.start, -260, 0, 0.3, 20);
  gesture("st-m", "open", L.l04.start, 0.3);
  talk("st-m", "l04");
  walk("st-m", L.l04.end - 0.4, L.l05.start + 0.2, 160, 0, 0.3, 18);
  camTo("stove", 560, 700, 2.0, L.l05.start - 0.3, 0.6, 880, "power2.inOut");
  expr("st-mx", "happy", L.l05.start);
  gesture("st-mx", "fist", W("топором") - 0.1, 0.2);
  gesture("st-mx", "rest", L.l05.end, 0.3);
  talk("st-mx", "l05");
  expr("st-m", "happy", L.l06.start);
  talk("st-m", "l06");
  // the kiss
  camTo("stove", 550, 730, 2.6, L.l07.start, 1.2, 860, "power2.inOut");
  kiss("st-m", "st-mx", W("поцеловала") - 0.3, 2.0, 50, -50);
  heartsUp("st-h", W("поцеловала") + 0.2, L.l07.end + 0.6);
  // his beard curls up
  camTo("stove", 640, 640, 2.4, L.l08.start - 0.3, 0.5, 860, "power2.inOut");
  expr("st-mx", "shock", L.l08.start);
  T(
    `tl.to("#st-mx .head", {keyframes:[{rotation:-6,duration:.12},{rotation:6,duration:.12},{rotation:-4,duration:.12},{rotation:0,duration:.12}], transformOrigin:"50% 92%"}, ${r(W("борода"))});`,
  );
  expr("st-mx", "happy", W("закурчавилась"));
  talk("st-mx", "l08");
  T(`tl.to("#st-fade", {opacity:1, duration:.5}, ${r(b - 0.5)});`);
  ["st-m", "st-mx"].forEach((id) => blink(id, a, W("поцеловала") - 0.4));
}

/* S3 the night: the house creaks (seen from outside) */
const WOLF = [
  [40, 800],
  [150, 830],
];
scene(
  "night",
  `${room(F8.dacha())}
   <rect x="-800" y="-800" width="2680" height="3520" fill="#060a20" opacity=".7"/>
   <rect id="nt-win" x="380" y="640" width="120" height="110" fill="#ffcf7a" opacity=".9"/>
   <path id="nt-snow" d="M560 410 L820 575 L780 590 L560 450Z" fill="#f2f6fa" stroke="#0b0d14" stroke-width="2"/>
   ${F9.owl(900, 600)}
   ${WOLF.map(([x, y]) => `<g class="wolf"><circle cx="${x - 12}" cy="${y}" r="5" fill="#ffe27a"/><circle cx="${x + 12}" cy="${y}" r="5" fill="#ffe27a"/></g>`).join("")}
   ${hearts("nt-h", 675, 340)}
   ${F8.snow("snowfx")}
   <rect id="nt-fade" x="-800" y="-800" width="2680" height="3520" fill="#000" opacity="0"/>`,
  { bg: "#0a1030" },
);
{
  const [a, b] = S.night;
  camSet("night", 560, 640, 1.3, a, 900);
  T(
    `tl.fromTo("#nt-fade", {opacity:1}, {opacity:0, duration:.6, immediateRender:false}, ${r(a)});`,
  );
  snowFall("night", a, b);
  const t0 = L.l09.start + 0.6;
  // creak, creak: the whole house rocks
  T(
    `tl.to("#sh-night", {keyframes:${JSON.stringify(Array.from({ length: Math.round((b - t0) / 0.32) }, (_, i) => ({ y: i % 2 ? 0 : -5, rotation: i % 2 ? 0 : 0.4, duration: 0.16 })))}, svgOrigin:"540 860"}, ${r(t0)});`,
  );
  T(
    `tl.to("#nt-win", {keyframes:${JSON.stringify(Array.from({ length: Math.round((b - t0) / 0.32) }, (_, i) => ({ opacity: i % 2 ? 0.9 : 0.7, duration: 0.16 })))}}, ${r(t0)});`,
  );
  T(
    `tl.to("#nt-snow", {x:120, y:140, rotation:20, svgOrigin:"700 500", opacity:0, duration:1.2, ease:"power2.in"}, ${r(t0 + 1.2)});`,
  );
  heartsUp("nt-h", t0 + 0.5, b - 0.3);
  // the owl is shocked, the wolves leave
  T(
    `tl.to("#zm-night .owl-eyes", {scale:1.5, transformOrigin:"50% 50%", duration:.2, ease:"back.out(3)"}, ${r(t0 + 1.0)});`,
  );
  camTo("night", 900, 620, 2.4, t0 + 0.8, 1.2, 880, "power2.inOut");
  camTo("night", 120, 800, 2.2, L.l10.start - 0.2, 0.6, 900, "power2.inOut");
  T(
    `tl.to("#zm-night .wolf", {x:-200, opacity:0, duration:1.2, stagger:.3, ease:"power1.in"}, ${r(L.l10.start + 0.8)});`,
  );
  camTo("night", 540, 640, 1.2, L.l10.end - 0.2, b - L.l10.end + 0.2, 900, "sine.inOut");
}

/* S4 morning in bed */
scene(
  "morning",
  `${room(F8.bedroom())}
   ${C("mn-mx", MXB(), 450, 985)}
   ${C("mn-m", R.masha({ outfit: "night" }), 620, 990)}
   ${room(F8.quilt())}
   <g id="mn-arm"><path d="M440 800 Q540 760 640 790" stroke="#56603e" stroke-width="30" fill="none" stroke-linecap="round"/><circle cx="646" cy="790" r="15" fill="#d9a07c" stroke="#0b0d14" stroke-width="2.4"/></g>
   ${hearts("mn-h", 540, 580)}`,
  { bg: "#6a4630" },
);
{
  const [a, b] = S.morning;
  camSet("morning", 540, 700, 1.6, a, 880);
  expr("mn-mx", "tired", a);
  expr("mn-m", "happy", a);
  pose("mn-m", "head", -14, a, 0.01);
  camTo("morning", 470, 720, 2.4, L.l11.start - 0.2, 0.6, 880, "power2.inOut");
  talk("mn-mx", "l11");
  camTo("morning", 620, 720, 2.4, L.l12.start - 0.2, 0.5, 880, "power2.inOut");
  expr("mn-m", "happy", L.l12.start);
  T(
    `tl.to("#mn-m .body", {keyframes:[{y:-4,duration:.12},{y:0,duration:.12}], repeat:3}, ${r(L.l12.start)});`,
  );
  talk("mn-m", "l12");
  camTo("morning", 470, 720, 2.4, L.l13.start - 0.2, 0.5, 880, "power2.inOut");
  expr("mn-mx", "happy", L.l13.start);
  talk("mn-mx", "l13");
  // a kiss on the cheek
  camTo("morning", 540, 720, 2.2, L.l13.end - 0.2, 0.5, 880, "power2.inOut");
  T(`tl.to("#mn-m", {x:-70, duration:.35, yoyo:true, repeat:1, repeatDelay:.5}, ${r(L.l13.end)});`);
  heartsUp("mn-h", L.l13.end + 0.3, L.l14.start + 1.0);
  expr("mn-m", "happy", L.l14.start);
  talk("mn-m", "l14");
  blink("mn-mx", a, b);
  blink("mn-m", a, b);
}

/* S5 the banya: steam, birch broom, another kiss */
scene(
  "banya",
  `${room(F9.banya())}
   <g id="bn-mxg" transform="translate(0 0) rotate(0 420 1060)">${C("bn-mx", R.maxim({ banya: true, prop: "", brow: "neutral" }), 420, 1060)}</g>
   ${C("bn-m", R.masha({ outfit: "towel", prop: "venik" }), 640, 1060)}
   ${F9.steam("bn-steam", 830, 480, 6)}
   ${F9.steam("bn-haze", 400, 500, 7)}
   ${hearts("bn-h", 540, 560)}`,
  { bg: "#b07a4a" },
);
{
  const [a, b] = S.banya;
  camSet("banya", 560, 700, 1.3, a, 900);
  T(
    `tl.fromTo("#zm-banya .bn-haze .puff", {y:0, opacity:.2}, {y:-140, opacity:.35, duration:${r(b - a)}, ease:"none", stagger:.4, immediateRender:false}, ${r(a)});`,
  );
  T(`tl.set("#zm-banya .bn-steam", {opacity:0}, ${r(a)});`);
  expr("bn-mx", "happy", a);
  expr("bn-m", "happy", a);
  camTo("banya", 420, 700, 2.0, L.l16.start - 0.3, 0.5, 880, "power2.inOut");
  gesture("bn-mx", "cheer", L.l16.start, 0.25);
  talk("bn-mx", "l16");
  // a ladle on the stones: a burst of steam
  T(
    `tl.fromTo("#zm-banya .bn-steam", {opacity:0, scale:.6, transformOrigin:"50% 100%"}, {opacity:1, scale:1.6, duration:1.0, ease:"power2.out", immediateRender:false}, ${r(W("поддай", 2) + 0.1)});`,
  );
  T(`tl.to("#zm-banya .bn-steam", {opacity:.2, duration:2}, ${r(W("поддай", 2) + 1.2)});`);
  camTo("banya", 640, 700, 2.0, L.l17.start - 0.3, 0.5, 880, "power2.inOut");
  talk("bn-m", "l17");
  gesture("bn-mx", "rest", L.l17.start, 0.3);
  camTo("banya", 420, 700, 2.0, L.l18.start - 0.3, 0.5, 880, "power2.inOut");
  talk("bn-mx", "l18");
  // he lies down on the shelf; the broom
  camTo("banya", 600, 700, 1.5, L.l19.start - 0.3, 0.6, 900, "power2.inOut");
  talk("bn-m", "l19");
  gesture("bn-m", "pointR", L.l19.start + 0.2, 0.25);
  T(
    `tl.to("#bn-mxg", {attr:{transform:"translate(-40 -330) rotate(-90 420 1060)"}, duration:.6, ease:"power2.inOut"}, ${r(L.l19.end - 0.2)});`,
  );
  gesture("bn-m", "rest", L.l19.end, 0.2);
  T(`tl.to("#bn-m", {x:-120, duration:.5}, ${r(L.l19.end)});`);
  for (let t = L.l19.end + 0.6; t < L.l20.end; t += 0.5) {
    pose("bn-m", "armR", -150, t, 0.2);
    pose("bn-m", "armR", -40, t + 0.22, 0.12, "power4.in");
  }
  expr("bn-mx", "happy", L.l20.start);
  talk("bn-mx", "l20");
  camTo("banya", 300, 700, 1.7, L.l20.start - 0.2, 0.6, 880, "power2.inOut");
  // he sits back up
  pose("bn-m", "armR", 0, L.l20.end + 0.1, 0.3);
  T(
    `tl.to("#bn-mxg", {attr:{transform:"translate(0 0) rotate(0 420 1060)"}, duration:.6, ease:"power2.inOut"}, ${r(L.l20.end + 0.1)});`,
  );
  T(`tl.to("#bn-m", {x:0, duration:.5}, ${r(L.l20.end + 0.1)});`);
  camTo("banya", 640, 700, 2.0, L.l21.start - 0.3, 0.5, 880, "power2.inOut");
  expr("bn-m", "sad", L.l21.start);
  talk("bn-m", "l21");
  camTo("banya", 420, 700, 2.0, L.l22.start - 0.3, 0.5, 880, "power2.inOut");
  expr("bn-mx", "happy", L.l22.start);
  talk("bn-mx", "l22");
  // and the second kiss, in the steam
  camTo("banya", 530, 730, 2.5, L.l23.start - 0.2, 0.8, 860, "power2.inOut");
  expr("bn-m", "happy", L.l23.start);
  T(`tl.set("#bn-m", {scaleX:1}, ${r(a)});`);
  kiss("bn-mx", "bn-m", W("поцеловала", 2) - 0.2, 2.2, 75, -75);
  heartsUp("bn-h", W("поцеловала", 2) + 0.2, b - 0.3);
  ["bn-mx", "bn-m"].forEach((id) => blink(id, a, W("поцеловала", 2) - 0.3));
}

/* S6 the changing room: the hare in his coat pocket */
scene(
  "coat",
  `${room(F9.changing())}
   ${C("ct-m", R.masha(), 380, 1060)}
   <g id="ct-mxg">${C("ct-mx", MXB(), 1260, 1060)}</g>
   ${F9.hare("ct-hare", 635, 600, 0.8)}`,
  { bg: "#8a5a34" },
);
{
  const [a, b] = S.coat;
  camSet("coat", 520, 680, 1.6, a, 900);
  T(`tl.set("#zm-coat .ct-hare", {opacity:0}, ${r(a)});`);
  expr("ct-m", "neutral", a);
  walk("ct-m", a + 0.2, a + 1.4, 150, 0, 0.3, 18);
  pose("ct-m", "armR", -70, L.l24.start + 2.0, 0.4);
  // she pulls it out
  T(`tl.set("#zm-coat .ct-hare", {opacity:1}, ${r(L.l25.start - 0.4)});`);
  T(`tl.to("#zm-coat .ct-hare", {x:-105, y:230, duration:.5}, ${r(L.l25.start - 0.4)});`);
  pose("ct-m", "armR", -30, L.l25.start - 0.4, 0.5);
  camTo("coat", 520, 660, 2.4, L.l25.start - 0.5, 0.6, 880, "power2.inOut");
  expr("ct-m", "shock", L.l25.start);
  talk("ct-m", "l25");
  // Maxim walks in
  T(`tl.to("#ct-mxg", {x:-460, duration:1.0, ease:"power2.out"}, ${r(L.l26.start - 0.8)});`);
  walk("ct-mx", L.l26.start - 0.8, L.l26.start + 0.2, 0, 0, 0.25, 20);
  expr("ct-mx", "happy", a);
  camTo("coat", 620, 680, 1.8, L.l26.start - 0.3, 0.5, 880, "power2.inOut");
  expr("ct-m", "angry", L.l26.start);
  T(`tl.set("#ct-m", {scaleX:-1, svgOrigin:"530 1060"}, ${r(L.l26.start)});`);
  talk("ct-m", "l26");
  expr("ct-mx", "scared", L.l26.start + 0.4);
  camTo("coat", 800, 680, 2.3, L.l27.start - 0.3, 0.5, 880, "power2.inOut");
  gesture("ct-mx", "open", L.l27.start + 0.2, 0.3);
  talk("ct-mx", "l27");
  camTo("coat", 540, 680, 2.3, L.l28.start - 0.3, 0.5, 880, "power2.inOut");
  gesture("ct-m", "fist", L.l28.start + 0.1, 0.2);
  shake("#sh-coat", L.l28.start + 0.2, 5, 6);
  talk("ct-m", "l28");
  camTo("coat", 800, 680, 2.3, L.l29.start - 0.3, 0.5, 880, "power2.inOut");
  expr("ct-mx", "sad", L.l29.start);
  gesture("ct-mx", "rest", L.l29.start, 0.3);
  talk("ct-mx", "l29");
  camTo("coat", 640, 680, 1.9, L.l30.start - 0.3, 0.5, 880, "power2.inOut");
  expr("ct-m", "cry", L.l30.start);
  talk("ct-m", "l30");
  T(`tl.to("#ct-m", {x:-600, duration:.6, ease:"power2.in"}, ${r(L.l30.end + 0.1)});`);
  T(`tl.to("#zm-coat .ct-hare", {x:-690, duration:.6, ease:"power2.in"}, ${r(L.l30.end + 0.1)});`);
  ["ct-m", "ct-mx"].forEach((id) => blink(id, a, b));
}

/* S7 the porch under the moon: run away together */
scene(
  "moon",
  `${room(F9.moonPorch())}
   ${C("mo-m", R.masha(), 420, 990)}
   <g id="mo-mxg">${C("mo-mx", MXB(), -60, 990)}</g>
   ${room(F9.porchRail())}
   <g id="mo-hands" opacity="0"><circle cx="540" cy="880" r="16" fill="#ebbb98" stroke="#0b0d14" stroke-width="2.4"/><path d="M528 880 C510 862 498 880 528 900 C558 880 546 862 528 880Z" fill="#ff4a7a" stroke="#0b0d14" stroke-width="2" transform="translate(12 -60)"/></g>
   ${hearts("mo-h", 560, 560)}
   ${F8.snow("snowfx")}`,
  { bg: "#05081a" },
);
{
  const [a, b] = S.moon;
  camSet("moon", 600, 500, 1.1, a, 900);
  snowFall("moon", a, b);
  expr("mo-m", "sad", a);
  pose("mo-m", "head", -6, a, 0.01);
  camTo("moon", 520, 700, 1.6, a + 0.5, L.l31.end - a, 900, "sine.inOut");
  // he comes out of the door and stands beside her
  walk("mo-mx", L.l31.end - 0.6, L.l32.start + 0.6, 0, 0, 0.3, 18);
  T(
    `tl.to("#mo-mxg", {x:680, duration:${r(L.l32.start + 0.6 - (L.l31.end - 0.6))}, ease:"power1.out"}, ${r(L.l31.end - 0.6)});`,
  );
  expr("mo-mx", "sad", a);
  camTo("moon", 560, 720, 2.0, L.l32.start, 0.8, 880, "power2.inOut");
  talk("mo-mx", "l32");
  camTo("moon", 430, 720, 2.4, L.l33.start - 0.3, 0.5, 880, "power2.inOut");
  talk("mo-m", "l33");
  camTo("moon", 620, 720, 2.4, L.l34.start - 0.3, 0.5, 880, "power2.inOut");
  expr("mo-mx", "happy", L.l34.start);
  gesture("mo-mx", "open", W("сбежим") - 0.1, 0.3);
  T(
    `tl.to("#zm-moon .moon", {scale:1.05, transformOrigin:"50% 50%", duration:2, yoyo:true, repeat:1}, ${r(W("морю"))});`,
  );
  talk("mo-mx", "l34");
  gesture("mo-mx", "rest", L.l34.end, 0.3);
  camTo("moon", 430, 720, 2.4, L.l35.start - 0.3, 0.5, 880, "power2.inOut");
  expr("mo-m", "scared", L.l35.start);
  talk("mo-m", "l35");
  camTo("moon", 620, 720, 2.4, L.l36.start - 0.3, 0.5, 880, "power2.inOut");
  expr("mo-mx", "determined", L.l36.start);
  gesture("mo-mx", "fist", L.l36.start + 0.2, 0.3);
  talk("mo-mx", "l36");
  gesture("mo-mx", "rest", L.l36.end, 0.3);
  // she looks at the moon... and takes his hand
  camTo("moon", 640, 420, 1.4, L.l37.start, 1.8, 900, "sine.inOut");
  pose("mo-m", "head", -12, L.l37.start + 0.3, 0.8);
  camTo("moon", 540, 760, 2.3, W("взяла") - 0.4, 0.8, 880, "power2.inOut");
  pose("mo-m", "head", 0, W("взяла") - 0.4, 0.4);
  T(`tl.to("#mo-m", {x:40, duration:.5}, ${r(W("взяла") - 0.2)});`);
  T(`tl.to("#mo-mxg", {x:"-=40", duration:.5}, ${r(W("взяла") - 0.2)});`);
  T(`tl.to("#mo-hands", {opacity:1, duration:.3}, ${r(W("взяла") + 0.2)});`);
  expr("mo-mx", "happy", W("взяла") + 0.2);
  expr("mo-m", "happy", L.l38.start - 0.2);
  camTo("moon", 470, 720, 2.4, L.l38.start - 0.3, 0.5, 880, "power2.inOut");
  talk("mo-m", "l38");
  // a kiss under the moon; pull back
  camTo("moon", 560, 720, 2.2, L.l38.end, 0.6, 880, "power2.inOut");
  kiss("mo-m", "mo-mx", L.l38.end + 0.4, 2.6, 18, -18);
  heartsUp("mo-h", L.l38.end + 0.8, b - 0.2);
  camTo("moon", 620, 480, 1.0, L.l39.start + 0.6, b - L.l39.start - 0.6, 900, "sine.inOut");
  ["mo-m", "mo-mx"].forEach((id) => blink(id, a, L.l38.end + 0.3));
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
  "зайцем заяц поцеловала по-настоящему борода кипела скрипела волки опытный луна луну сбежим морю рядом руку баню поддай веничком женюсь только мягкое сына поцеловались".split(
    " ",
  ),
);
const DANGER = new Set("знал молчал мои стой".split(" "));
const hook = `<div id="hook" class="clip toptitle" data-start="0.2" data-duration="${r(L.l01.start - 0.1)}" data-track-index="2" style="z-index:5"><div class="tt-s">${spl("ГЛЕБ", "hs")}</div><div class="tt-a">${spl("ЧАСТЬ 9", "ha")}</div></div>`;
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
  stamp("st-kiss", W("поцеловала") + 0.2, W("поцеловала") + 1.4, "ЧМОК!", "#ff6a9a"),
  stamp("st-sk1", L.l09.start + 0.8, L.l09.start + 1.8, "СКРИП!", "#ffcf7a"),
  stamp("st-sk2", L.l09.start + 2.0, L.l09.end + 0.6, "СКРИП-СКРИП!", "#ffcf7a"),
  stamp("st-kiss2", W("поцеловала", 2) + 0.2, W("поцеловала", 2) + 1.4, "ЧМОК!", "#ff6a9a"),
].join("\n");
const title = `<div id="tbc" class="clip" data-start="${TITLE[0]}" data-duration="${r(TITLE[1] - TITLE[0])}" data-track-index="4" style="z-index:8"><div id="tbc-a">${spl("ПРОДОЛЖЕНИЕ СЛЕДУЕТ…", "ta")}</div><div id="tbc-b">ЧАСТЬ 10</div></div>`;
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
  ["room_night", 0, S.arrive[1], 0.6],
  ["door", S.arrive[1] - 0.3, 0.35, 0.9],
  ["fire", S.stove[0], S.stove[1] - S.stove[0], 0.4],
  ["room_night", S.night[0], S.night[1] - S.night[0], 0.6],
  ["crank", L.l09.start + 0.8, 1.4, 0.35],
  ["crank", L.l09.start + 2.2, 1.4, 0.35],
  ["room_day", S.morning[0], S.morning[1] - S.morning[0], 0.4],
  ["fire", S.banya[0], S.banya[1] - S.banya[0], 0.45],
  ["buzz", W("поддай", 2) + 0.1, 1.2, 0.6],
  ["pop", L.l19.end + 0.6, 0.09, 1.0],
  ["pop", L.l19.end + 1.1, 0.09, 1.0],
  ["pop", L.l19.end + 1.6, 0.09, 1.0],
  ["door", S.coat[1] - 0.4, 0.35, 1.0],
  ["room_night", S.moon[0], CUT - S.moon[0], 0.6],
].filter(([, , , v]) => v > 0);
const audio = [
  `<audio id="vo" class="clip" src="assets/vo.wav" data-start="0" data-duration="${r(L.l39.end + 0.1)}" data-track-index="10" data-volume="1"></audio>`,
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
<title>Глеб — часть 9</title>
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
