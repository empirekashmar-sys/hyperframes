// "Глеб — часть 13": a sleepless night by the sea, the road to Rostov, the refugee camp, tent 47.
// Run from gleb/p13: node build.mjs → index.html (sfx shared via assets/sfx symlink).
import fs from "node:fs";
import * as R from "../art/rig.js";
import * as F10 from "../p10/art10.js";
import * as F11 from "../p11/art11.js";
import * as F12 from "../p12/art12.js";
import * as F13 from "./art13.js";
import * as F2 from "../p2/art2.js";

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
const CUT = r(L.l57.end + 1.8);
const TITLE = [CUT, r(CUT + 3.2)];
const CARD_START = r(TITLE[1] + 0.1);
const CARD_DUR = 3.6;
const TOTAL = r(CARD_START + CARD_DUR);
const S = {};
{
  const ends = [
    ["window", L.l09.end + 0.6],
    ["night", L.l13.end + 0.4],
    ["valya", L.l14.end + 0.6],
    ["morning", L.l19.end + 0.6],
    ["pack", L.l25.end + 0.6],
    ["gate", L.l31.end + 0.6],
    ["road", L.l42.end + 0.8],
    ["camp", L.l49.end + 0.6],
    ["tents", CUT],
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
const MT = (o = {}) => R.masha({ outfit: "tee", ...o });
const NIGHT = `<rect x="-800" y="-800" width="2680" height="3520" fill="#060a20" opacity=".55"/>`;
const hug = (aId, bId, at, ax = 70, bx = -70) => {
  T(`tl.to("#${aId}", {x:"+=${ax}", duration:.5, ease:"power2.out"}, ${r(at)});`);
  T(`tl.to("#${bId}", {x:"+=${bx}", duration:.5, ease:"power2.out"}, ${r(at)});`);
  pose(aId, "head", 12, at + 0.2, 0.4);
  pose(bId, "head", -10, at + 0.2, 0.4);
  pose(aId, "armR", -70, at + 0.3, 0.4);
  pose(bId, "armL", 70, at + 0.3, 0.4);
};

/* S1 the window at night: she can't sleep */
scene(
  "window",
  `${room(F11.room())}${NIGHT}
   ${C("wn-m", MT(), 760, 1060)}
   <g id="wn-mxg">${C("wn-mx", MXS(), 200, 1060)}</g>
   ${hearts("wn-h", 600, 600)}
   <rect id="wn-fade" x="-800" y="-800" width="2680" height="3520" fill="#000" opacity="0"/>`,
  { bg: "#0a0c18" },
);
{
  const [a, b] = S.window;
  camSet("window", 790, 500, 1.6, a, 880);
  expr("wn-m", "sad", a);
  expr("wn-mx", "tired", a);
  camTo("window", 640, 720, 1.5, L.l01.start + 1.6, 1.4, 900, "power2.inOut");
  walk("wn-mx", L.l02.start - 0.8, L.l02.start + 0.6, 0, 0, 0.3, 18);
  T(`tl.to("#wn-mxg", {x:380, duration:1.4, ease:"power1.out"}, ${r(L.l02.start - 0.8)});`);
  talk("wn-mx", "l02");
  camTo("window", 760, 700, 2.3, L.l03.start - 0.2, 0.4, 880, "power2.inOut");
  expr("wn-m", "cry", L.l03.start);
  talk("wn-m", "l03");
  camTo("window", 580, 700, 2.3, L.l04.start - 0.2, 0.4, 880, "power2.inOut");
  expr("wn-mx", "neutral", L.l04.start);
  talk("wn-mx", "l04");
  camTo("window", 760, 700, 2.3, L.l05.start - 0.2, 0.4, 880, "power2.inOut");
  talk("wn-m", "l05");
  camTo("window", 580, 700, 2.3, L.l06.start - 0.2, 0.4, 880, "power2.inOut");
  expr("wn-mx", "determined", L.l06.start);
  talk("wn-mx", "l06");
  camTo("window", 680, 680, 2.2, L.l07.start, 0.8, 880, "power2.inOut");
  hug("wn-mx", "wn-m", L.l07.start + 0.3, 50, -50);
  expr("wn-m", "sad", L.l07.start + 0.5);
  talk("wn-m", "l08");
  expr("wn-mx", "happy", L.l09.start);
  talk("wn-mx", "l09");
  heartsUp("wn-h", L.l09.end, b - 0.1);
  T(`tl.to("#wn-fade", {opacity:1, duration:.5}, ${r(b - 0.5)});`);
  ["wn-m", "wn-mx"].forEach((id) => blink(id, a, b));
}

/* S2 the night, from outside (and from baba Valya's) */
scene(
  "night",
  `${room(F11.house())}
   <rect x="-800" y="-800" width="2680" height="3520" fill="#060a20" opacity=".65"/>
   <rect id="nt-win" x="680" y="520" width="100" height="110" fill="#ffcf7a" opacity=".9"/>
   ${F10.cat("nt-cat", 400, 1040, 0.7)}
   ${hearts("nt-h", 540, 300)}
   <rect id="wn-fade2" x="-800" y="-800" width="2680" height="3520" fill="#000" opacity="0"/>`,
  { bg: "#05081a" },
);
{
  const [a, b] = S.night;
  camSet("night", 540, 600, 1.1, a, 900);
  T(
    `tl.fromTo("#wn-fade2", {opacity:1}, {opacity:0, duration:.5, immediateRender:false}, ${r(a)});`,
  );
  T(
    `tl.to("#sh-night", {keyframes:${JSON.stringify(Array.from({ length: Math.round((b - a - 0.6) / 0.3) }, (_, i) => ({ y: i % 2 ? 0 : -5, rotation: i % 2 ? 0 : 0.4, duration: 0.15 })))}, svgOrigin:"540 860"}, ${r(a + 0.5)});`,
  );
  T(
    `tl.to("#nt-win", {keyframes:${JSON.stringify(Array.from({ length: Math.round((b - a - 0.6) / 0.3) }, (_, i) => ({ opacity: i % 2 ? 0.9 : 0.7, duration: 0.15 })))}}, ${r(a + 0.5)});`,
  );
  heartsUp("nt-h", a + 0.8, L.l11.end);
  camTo("night", 540, 500, 1.6, L.l11.start, 1.4, 900, "power2.inOut");
  // the cat leaves for the boat
  camTo("night", 400, 900, 2.0, L.l12.start - 0.2, 0.6, 900, "power2.inOut");
  T(`tl.to("#zm-night .nt-cat", {x:-220, duration:2.2, ease:"none"}, ${r(L.l12.start + 0.6)});`);
  camTo("night", 260, 900, 2.0, L.l12.start + 0.6, 2.2, 900, "none");
}
scene(
  "valya",
  `${room(F12.village())}
   <rect x="640" y="640" width="100" height="90" fill="#ffcf7a" opacity=".9"/>
   <defs><clipPath id="vy-clip"><rect x="640" y="640" width="100" height="90"/></clipPath></defs>
   <g clip-path="url(#vy-clip)"><g transform="translate(690 690) scale(.42)">${C("vy-n", R.granny({ brow: "angry" }), 0, 330)}</g></g>`,
  { bg: "#05081a" },
);
{
  const [a, b] = S.valya;
  camSet("valya", 690, 690, 2.6, a, 880);
  T(
    `tl.to("#sh-valya", {keyframes:${JSON.stringify(Array.from({ length: Math.round((b - a) / 0.3) }, (_, i) => ({ x: i % 2 ? 0 : 3, duration: 0.15 })))}}, ${r(a)});`,
  );
  expr("vy-n", "tired", a);
  camTo("valya", 690, 690, 5.0, L.l14.start - 0.3, 0.6, 880, "power2.inOut");
  talk("vy-n", "l14");
}

/* S3 morning: "we're going to Rostov"; trousers on the lamp */
scene(
  "morning",
  `${room(F11.room())}
   ${F13.lamp(540, 220)}
   ${C("mn-mx", MXS(), 520, 945)}
   ${room(F11.sofaFront())}
   ${C("mn-m", MB(), 860, 1060)}`,
  { bg: "#ece6d8" },
);
{
  const [a, b] = S.morning;
  camSet("morning", 640, 700, 1.4, a, 900);
  T(
    `tl.set("#mn-mx .eyes-closed", {opacity:1}, ${r(a)}); tl.set("#mn-mx .eyes-open", {opacity:0}, ${r(a)});`,
  );
  pose("mn-mx", "head", 12, a, 0.01);
  expr("mn-m", "sad", a);
  camTo("morning", 860, 700, 2.2, L.l16.start - 0.3, 0.5, 880, "power2.inOut");
  expr("mn-m", "determined", L.l16.start);
  talk("mn-m", "l16");
  T(
    `tl.set("#mn-mx .eyes-closed", {opacity:0}, ${r(L.l17.start - 0.2)}); tl.set("#mn-mx .eyes-open", {opacity:1}, ${r(L.l17.start - 0.2)});`,
  );
  pose("mn-mx", "head", 0, L.l17.start - 0.2, 0.3);
  expr("mn-mx", "tired", L.l17.start - 0.2);
  camTo("morning", 520, 680, 2.3, L.l17.start - 0.2, 0.4, 880, "power2.inOut");
  talk("mn-mx", "l17");
  camTo("morning", 560, 260, 2.4, L.l18.start - 0.2, 0.5, 880, "power2.inOut");
  T(
    `tl.to("#zm-morning .pants", {rotation:8, svgOrigin:"10 -20", duration:.5, yoyo:true, repeat:3}, ${r(L.l18.start)});`,
  );
  camTo("morning", 520, 680, 2.3, L.l19.start - 0.2, 0.4, 880, "power2.inOut");
  expr("mn-mx", "happy", L.l19.start);
  talk("mn-mx", "l19");
  ["mn-m", "mn-mx"].forEach((id) => blink(id, L.l17.start, b));
}

/* S4 packing: "I'll tell him myself" */
scene(
  "pack",
  `${room(F11.room())}
   ${C("pk-m", MB({ prop: "bag" }), 380, 1060)}
   ${C("pk-mx", MXS({ helmet: true }), 720, 1060)}
   ${F13.note("pk-note", 540, 1020)}`,
  { bg: "#ece6d8" },
);
{
  const [a, b] = S.pack;
  camSet("pack", 540, 740, 1.4, a, 900);
  T(`tl.set("#zm-pack .pk-note", {opacity:0}, ${r(a)});`);
  expr("pk-m", "sad", a);
  expr("pk-mx", "neutral", a);
  camTo("pack", 380, 720, 2.2, L.l21.start - 0.2, 0.5, 880, "power2.inOut");
  talk("pk-m", "l21");
  camTo("pack", 720, 720, 2.2, L.l22.start - 0.2, 0.4, 880, "power2.inOut");
  expr("pk-mx", "determined", L.l22.start);
  talk("pk-mx", "l22");
  camTo("pack", 380, 720, 2.2, L.l23.start - 0.2, 0.4, 880, "power2.inOut");
  expr("pk-m", "scared", L.l23.start);
  talk("pk-m", "l23");
  camTo("pack", 720, 720, 2.2, L.l24.start - 0.2, 0.4, 880, "power2.inOut");
  expr("pk-mx", "sad", L.l24.start);
  talk("pk-mx", "l24");
  T(`tl.set("#zm-pack .pk-note", {opacity:1}, ${r(L.l25.start)});`);
  camTo("pack", 540, 1010, 3.0, L.l25.start, 0.6, 900, "power2.inOut");
  ["pk-m", "pk-mx"].forEach((id) => blink(id, a, b));
}

/* S5 the gate: baba Valya and her pies */
scene(
  "gate",
  `${room(F11.house())}
   ${P("gt-cart", MOSK(), -300, 1000, 420)}
   ${C("gt-m", MB(), 240, 1070)}
   ${C("gt-mx", MXS({ helmet: true }), 400, 1070)}
   ${C("gt-n", R.granny({ brow: "neutral" }), 760, 1070)}
   ${F13.pies("gt-pies", 700, 900)}`,
  { bg: "#e9a87a" },
);
{
  const [a, b] = S.gate;
  camSet("gate", 520, 760, 1.3, a, 900);
  T(`tl.set("#gt-n", {scaleX:-1, svgOrigin:"760 1070"}, ${r(a)});`);
  expr("gt-n", "neutral", a);
  expr("gt-m", "happy", a);
  expr("gt-mx", "happy", a);
  camTo("gate", 760, 720, 2.2, L.l27.start - 0.2, 0.5, 880, "power2.inOut");
  talk("gt-n", "l27");
  camTo("gate", 400, 720, 2.2, L.l28.start - 0.2, 0.4, 880, "power2.inOut");
  expr("gt-mx", "sad", L.l28.start);
  talk("gt-mx", "l28");
  camTo("gate", 640, 760, 1.8, L.l29.start - 0.2, 0.4, 880, "power2.inOut");
  expr("gt-n", "happy", L.l29.start);
  T(`tl.to("#zm-gate .gt-pies", {x:-260, y:-20, duration:.6}, ${r(L.l29.start + 0.6)});`);
  talk("gt-n", "l29");
  camTo("gate", 240, 720, 2.2, L.l30.start - 0.2, 0.4, 880, "power2.inOut");
  talk("gt-m", "l30");
  camTo("gate", 760, 720, 2.2, L.l31.start - 0.2, 0.4, 880, "power2.inOut");
  expr("gt-n", "sad", L.l31.start);
  talk("gt-n", "l31");
  ["gt-m", "gt-mx", "gt-n"].forEach((id) => blink(id, a, b));
}

/* S6 the road north: Masha rehearses */
scene("road", cabH("rd", {}, F10.cat("rd-cat", 545, 705, 1.3), true), { bg: "#8fb4dc" });
{
  const [a, b] = S.road;
  camSet("road", 540, 600, 1.4, a, 900);
  scroll("#rd-back .street", a, b, -2600);
  bump("road", a, b);
  gesture("rd-mx", "wheel", a, 0.01);
  T(`tl.set("#zm-road .cat-eyes", {scaleY:.15, transformOrigin:"50% 50%"}, ${r(a)});`);
  expr("rd-m", "scared", a);
  expr("rd-mx", "neutral", a);
  camTo("road", 770, 560, 2.2, L.l33.start, 0.6, 860, "power2.inOut");
  T(
    `tl.to("#rd-m .head", {keyframes:[{rotation:-4,duration:.4},{rotation:4,duration:.4}], transformOrigin:"50% 92%", repeat:3}, ${r(L.l33.start)});`,
  );
  camTo("road", 400, 560, 2.2, L.l34.start - 0.2, 0.4, 860, "power2.inOut");
  talk("rd-mx", "l34");
  camTo("road", 770, 560, 2.2, L.l35.start - 0.2, 0.4, 860, "power2.inOut");
  talk("rd-m", "l35");
  camTo("road", 400, 560, 2.2, L.l36.start - 0.2, 0.4, 860, "power2.inOut");
  expr("rd-mx", "happy", L.l36.start);
  talk("rd-mx", "l36");
  camTo("road", 770, 560, 2.2, L.l37.start - 0.2, 0.4, 860, "power2.inOut");
  expr("rd-m", "neutral", L.l37.start);
  talk("rd-m", "l37");
  camTo("road", 400, 560, 2.4, L.l38.start - 0.2, 0.3, 860, "power2.out");
  expr("rd-mx", "shock", L.l38.start);
  gesture("rd-mx", "open", L.l38.start, 0.2);
  talk("rd-mx", "l38");
  gesture("rd-mx", "wheel", L.l38.end, 0.3);
  camTo("road", 770, 560, 2.3, L.l39.start - 0.2, 0.3, 860, "power2.out");
  expr("rd-m", "angry", L.l39.start);
  talk("rd-m", "l39");
  camTo("road", 400, 560, 2.2, L.l40.start - 0.2, 0.4, 860, "power2.inOut");
  expr("rd-mx", "determined", L.l40.start);
  talk("rd-mx", "l40");
  camTo("road", 770, 560, 2.2, L.l41.start - 0.2, 0.4, 860, "power2.inOut");
  expr("rd-m", "cry", L.l41.start);
  talk("rd-m", "l41");
  camTo("road", 540, 580, 1.6, L.l42.start - 0.2, 0.6, 880, "power2.inOut");
  expr("rd-mx", "sad", L.l42.start);
  talk("rd-mx", "l42");
  ["rd-m", "rd-mx"].forEach((id) => blink(id, a, b));
}

/* S7 the camp: the volunteers' list */
scene(
  "camp",
  `${room(F13.camp())}
   ${C("cp-v", R.feldsher(), 820, 1000)}
   ${C("cp-m", MB(), 420, 1070)}
   ${C("cp-mx", MXS({ helmet: true }), 580, 1070)}`,
  { bg: "#3a3a6a" },
);
{
  const [a, b] = S.camp;
  camSet("camp", 540, 600, 1.0, a, 900);
  T(`tl.set("#cp-v", {scaleX:-1, svgOrigin:"820 1000"}, ${r(a)});`);
  expr("cp-v", "tired", a);
  expr("cp-m", "scared", a);
  expr("cp-mx", "shock", a);
  camTo("camp", 540, 720, 1.4, a + 0.5, L.l43.end - a, 900, "sine.inOut");
  camTo("camp", 580, 720, 2.2, L.l44.start - 0.2, 0.4, 880, "power2.inOut");
  talk("cp-mx", "l44");
  camTo("camp", 820, 680, 2.2, L.l46.start - 0.3, 0.5, 880, "power2.inOut");
  talk("cp-v", "l46");
  camTo("camp", 420, 720, 2.2, L.l47.start - 0.2, 0.4, 880, "power2.inOut");
  talk("cp-m", "l47");
  camTo("camp", 820, 680, 2.2, L.l48.start - 0.2, 0.4, 880, "power2.inOut");
  expr("cp-v", "sad", L.l48.start);
  gesture("cp-v", "pointR", L.l48.start + 1.0, 0.3);
  talk("cp-v", "l48");
  camTo("camp", 420, 700, 2.6, L.l49.start - 0.2, 0.5, 880, "power2.inOut");
  expr("cp-m", "shock", L.l49.start);
  expr("cp-m", "cry", L.l49.start + 1.2);
  gesture("cp-m", "headBoth", L.l49.start + 0.2, 0.3);
  talk("cp-m", "l49");
  ["cp-v", "cp-m", "cp-mx"].forEach((id) => blink(id, a, b));
}

/* S8 tent 47: he turns round */
scene(
  "tents",
  `<g>${P("tn-art", F13.row(), -200, 1100, 2160)}</g>
   <g id="tn-fam">
     <g id="tn-g0">${C("tn-gs", R.gleb({}), 2000, 1080)}<ellipse cx="2000" cy="744" rx="50" ry="53" fill="#17181d" stroke="#0b0d14" stroke-width="3"/><path d="M1960 730 q40 -30 80 0" stroke="#2a2b33" stroke-width="5" fill="none"/></g>
     <g id="tn-hat"><path d="M2040 900 q20 -40 50 -10 q6 22 -16 30 q-24 6 -34 -20z" fill="#d94a3a" stroke="#0b0d14" stroke-width="2.4"/><circle cx="2072" cy="886" r="8" fill="#f2efe6" stroke="#0b0d14" stroke-width="2"/></g>
     <g id="tn-g1" opacity="0">${C("tn-g", R.gleb({}), 2000, 1080)}</g>
   </g>
   <g id="tn-pp">${C("tn-m", MB(), 120, 1080)}${C("tn-mx", MXS({ helmet: true }), 260, 1080)}</g>`,
  { bg: "#2a2a5a" },
);
{
  const [a, b] = S.tents;
  camSet("tents", 300, 760, 1.3, a, 900);
  ["tn-m", "tn-mx"].forEach((id) => {
    expr(id, "scared", a);
    walk(id, a + 0.2, L.l53.end, 0, 0, 0.34, 18);
  });
  T(`tl.to("#tn-pp", {x:1340, duration:${r(L.l53.end - a - 0.2)}, ease:"none"}, ${r(a + 0.2)});`);
  camTo("tents", 1500, 760, 1.3, a + 0.2, L.l53.end - a - 0.2, 900, "none");
  camTo("tents", 600, 720, 2.2, L.l51.start - 0.2, 0.01, 880, "none");
  camTo("tents", 1300, 720, 2.2, L.l51.start, L.l52.end - L.l51.start, 880, "none");
  camTo("tents", 1700, 760, 1.4, L.l52.end + 0.1, 0.6, 900, "power2.inOut");
  talk("tn-mx", "l51");
  talk("tn-m", "l52");
  // the man in the leather jacket, and two boys
  camTo("tents", 2000, 760, 1.6, L.l54.start + 0.5, 1.5, 900, "power2.inOut");
  camTo("tents", 2060, 880, 3.0, W("шапка") - 0.4, 0.6, 900, "power2.inOut");
  camTo("tents", 1600, 720, 2.2, L.l55.start - 0.2, 0.4, 880, "power2.inOut");
  expr("tn-mx", "sad", L.l55.start);
  talk("tn-mx", "l55");
  // he turns
  camTo("tents", 2000, 700, 2.6, L.l56.start, 0.8, 880, "power2.inOut");
  T(`tl.to("#tn-g0", {opacity:0, duration:.4}, ${r(W("обернулся") - 0.1)});`);
  T(`tl.to("#tn-g1", {opacity:1, duration:.4}, ${r(W("обернулся") - 0.1)});`);
  expr("tn-g", "shock", a);
  camTo("tents", 2000, 680, 3.2, L.l57.start - 0.3, 0.6, 880, "power2.in");
  talk("tn-g", "l57");
  ["tn-m", "tn-mx", "tn-g"].forEach((id) => blink(id, a, b));
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
};
const HOT = new Set(
  "живой один потерял шапка рядом скрипела такт лодку рюмки силы-то ростов люстре молодец скажу пирожками высплюсь жених беременна главного люблю перемешала сердце палатка сорок седьмой меня мама маша".split(
    " ",
  ),
);
const DANGER = new Set("убьёт стоп-стоп-стоп".split(" "));
const hook = `<div id="hook" class="clip toptitle" data-start="0.2" data-duration="${r(L.l01.start - 0.1)}" data-track-index="2" style="z-index:5"><div class="tt-s">${spl("ГЛЕБ", "hs")}</div><div class="tt-a">${spl("ЧАСТЬ 13", "ha")}</div></div>`;
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
  stamp("st-sk", L.l10.start + 0.8, L.l11.end + 0.4, "СКРИП-СКРИП!", "#ffcf7a"),
  stamp("st-dz", L.l13.start + 1.0, L.l13.end + 0.4, "ДЗЫНЬ-ДЗЫНЬ!", "#ffcf7a"),
  stamp("st-47", W("сорок", 1, L.l53.start), L.l53.end + 0.4, "45… 46…", "#ffffff"),
].join("\n");
const title = `<div id="tbc" class="clip" data-start="${TITLE[0]}" data-duration="${r(TITLE[1] - TITLE[0])}" data-track-index="4" style="z-index:8"><div id="tbc-a">${spl("ПРОДОЛЖЕНИЕ СЛЕДУЕТ…", "ta")}</div><div id="tbc-b">ЧАСТЬ 14</div></div>`;
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
  ["room_night", 0, S.valya[1], 0.55],
  ["crank", L.l10.start + 0.6, 1.4, 0.3],
  ["crank", L.l10.start + 2.4, 1.4, 0.3],
  ["crank", L.l11.start + 1.0, 1.4, 0.3],
  ["glass", L.l13.start + 1.0, 0.6, 0.6],
  ["glass", L.l13.start + 1.8, 0.6, 0.6],
  ["room_day", S.morning[0], S.gate[1] - S.morning[0] > 26 ? 26 : S.gate[1] - S.morning[0], 0.35],
  ["room_day", S.morning[0] + 26, Math.max(0.5, S.gate[1] - S.morning[0] - 26), 0.35],
  ["engine", S.road[0], S.road[1] - S.road[0] > 24 ? 24 : S.road[1] - S.road[0], 0.6],
  ["engine", S.road[0] + 24, Math.max(0.5, S.road[1] - S.road[0] - 24), 0.6],
  ["room_day", S.camp[0], CUT - S.camp[0] > 26 ? 26 : CUT - S.camp[0], 0.5],
  ["room_day", S.camp[0] + 26, Math.max(0.5, CUT - S.camp[0] - 26), 0.5],
].filter(([, , , v]) => v > 0);
const audio = [
  `<audio id="vo" class="clip" src="assets/vo.wav" data-start="0" data-duration="${r(L.l57.end + 0.1)}" data-track-index="10" data-volume="1"></audio>`,
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
<title>Глеб — часть 13</title>
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
