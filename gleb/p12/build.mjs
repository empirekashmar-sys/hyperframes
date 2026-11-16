// "Глеб — часть 12": the confession, the pregnancy, a crooked crib, pickles at 3 a.m., a nut-ring, the radio lists.
// Run from gleb/p12: node build.mjs → index.html (sfx shared via assets/sfx symlink).
import fs from "node:fs";
import * as R from "../art/rig.js";
import * as F10 from "../p10/art10.js";
import * as F11 from "../p11/art11.js";
import * as F12 from "./art12.js";

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
const CUT = r(L.l80.end + 1.8);
const TITLE = [CUT, r(CUT + 3.2)];
const CARD_START = r(TITLE[1] + 0.1);
const CARD_DUR = 3.6;
const TOTAL = r(CARD_START + CARD_DUR);
const S = {};
{
  const ends = [
    ["confess", L.l26.end + 0.8],
    ["roof", L.l29.end + 0.6],
    ["crib", L.l33.end + 0.6],
    ["fish", L.l37.end + 0.6],
    ["crave", L.l41.end + 0.4],
    ["village", L.l44.end + 0.5],
    ["pickles", L.l46.end + 0.6],
    ["medic", L.l58.end + 0.8],
    ["propose", L.l72.end + 0.8],
    ["radio", CUT],
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
const MT = (o = {}) => R.masha({ outfit: "tee", ...o });
const NIGHT = `<rect x="-800" y="-800" width="2680" height="3520" fill="#060a20" opacity=".55"/>`;
const sofaRoom = (extra = "", night = false) =>
  `${room(F11.room())}${night ? NIGHT : ""}
   ${extra}`;

/* S1 the confession, and the news */
scene(
  "confess",
  `${sofaRoom()}
   ${C("cf-m", MT(), 520, 945)}
   ${room(F11.sofaFront())}
   <g id="cf-mxg" transform="translate(0 0) rotate(0 800 1060)">${C("cf-mx", MXS(), 800, 1060)}</g>
   ${F10.cat("cf-cat", 980, 1060, 0.7)}
   ${hearts("cf-h", 640, 560)}${hearts("cf-h2", 640, 560)}`,
  { bg: "#ece6d8" },
);
{
  const [a, b] = S.confess;
  camSet("confess", 800, 700, 2.3, a, 880);
  expr("cf-mx", "scared", a);
  expr("cf-m", "sad", a);
  talk("cf-mx", "l01");
  expr("cf-mx", "happy", L.l02.start);
  heartsUp("cf-h", W("люблю") + 0.2, L.l02.end + 0.6);
  talk("cf-mx", "l02");
  camTo("confess", 520, 680, 2.3, L.l03.start - 0.2, 0.5, 880, "power2.inOut");
  expr("cf-m", "cry", L.l03.start);
  camTo("confess", 800, 700, 2.3, L.l04.start - 0.2, 0.4, 880, "power2.inOut");
  expr("cf-mx", "scared", L.l04.start);
  talk("cf-mx", "l04");
  camTo("confess", 520, 680, 2.3, L.l05.start - 0.2, 0.4, 880, "power2.inOut");
  expr("cf-m", "happy", L.l05.start);
  talk("cf-m", "l05");
  expr("cf-m", "neutral", L.l06.start);
  talk("cf-m", "l06");
  camTo("confess", 800, 700, 2.4, L.l07.start - 0.2, 0.3, 880, "power2.out");
  talk("cf-mx", "l07");
  camTo("confess", 520, 680, 2.6, L.l08.start - 0.2, 0.6, 880, "power2.inOut");
  expr("cf-m", "happy", L.l08.start);
  talk("cf-m", "l08");
  // "how did that happen?"
  camTo("confess", 800, 700, 2.4, L.l09.start - 0.2, 0.3, 880, "power2.out");
  expr("cf-mx", "shock", L.l09.start);
  gesture("cf-mx", "shrug", L.l09.start + 0.3, 0.3);
  talk("cf-mx", "l09");
  gesture("cf-mx", "rest", L.l09.end, 0.3);
  camTo("confess", 520, 680, 2.3, L.l10.start - 0.2, 0.4, 880, "power2.inOut");
  expr("cf-m", "happy", L.l10.start);
  T(
    `tl.to("#cf-m .body", {keyframes:[{y:-4,duration:.12},{y:0,duration:.12}], repeat:3}, ${r(L.l10.start + 0.3)});`,
  );
  talk("cf-m", "l10");
  // he faints
  camTo("confess", 700, 760, 1.6, L.l11.start - 0.2, 0.6, 900, "power2.inOut");
  T(
    `tl.to("#cf-mx .head", {keyframes:[{rotation:-4,duration:.3},{rotation:4,duration:.3},{rotation:0,duration:.3}], transformOrigin:"50% 92%"}, ${r(L.l11.start + 0.2)});`,
  );
  T(
    `tl.to("#cf-mxg", {attr:{transform:"translate(40 0) rotate(-90 800 1060)"}, duration:.5, ease:"power3.in"}, ${r(W("рухнул") + 0.1)});`,
  );
  T(
    `tl.set("#cf-mx .eyes-closed", {opacity:1}, ${r(W("рухнул") + 0.4)}); tl.set("#cf-mx .eyes-open, #cf-mx .eyes-wide", {opacity:0}, ${r(W("рухнул") + 0.4)});`,
  );
  shake("#sh-confess", W("рухнул") + 0.6, 6, 10);
  expr("cf-m", "shock", L.l13.start - 0.2);
  T(`tl.to("#cf-m", {y:-60, duration:.3}, ${r(L.l13.start - 0.2)});`);
  talk("cf-m", "l13");
  // the cat licks his bald head
  camTo("confess", 520, 980, 2.2, L.l14.start - 0.2, 0.6, 900, "power2.inOut");
  T(
    `tl.to("#zm-confess .cf-cat", {x:-560, y:20, duration:1.0, ease:"power1.inOut"}, ${r(L.l14.start + 0.2)});`,
  );
  T(
    `tl.set("#cf-mx .eyes-closed", {opacity:0}, ${r(L.l15.start)}); tl.set("#cf-mx .eyes-open", {opacity:1}, ${r(L.l15.start)});`,
  );
  expr("cf-mx", "tired", L.l15.start);
  talk("cf-mx", "l15");
  T(
    `tl.to("#cf-mxg", {attr:{transform:"translate(0 0) rotate(0 800 1060)"}, duration:.6, ease:"power2.out"}, ${r(L.l15.end + 0.1)});`,
  );
  T(`tl.to("#zm-confess .cf-cat", {x:0, y:0, duration:.6}, ${r(L.l15.end + 0.1)});`);
  camTo("confess", 640, 700, 1.8, L.l16.start - 0.2, 0.5, 880, "power2.inOut");
  talk("cf-m", "l16");
  T(`tl.to("#cf-m", {y:0, duration:.3}, ${r(L.l16.start)});`);
  // "Papa?!"
  camTo("confess", 800, 700, 2.3, L.l17.start - 0.2, 0.3, 880, "power2.out");
  expr("cf-mx", "shock", L.l17.start);
  talk("cf-mx", "l17");
  expr("cf-mx", "happy", L.l18.start);
  gesture("cf-mx", "cheer", L.l18.start, 0.3);
  T(
    `tl.to("#cf-mx .body", {keyframes:[{y:-30,duration:.18},{y:0,duration:.2},{y:-26,duration:.18},{y:0,duration:.2},{y:-20,duration:.18},{y:0,duration:.2}]}, ${r(L.l18.start + 0.2)});`,
  );
  talk("cf-mx", "l18");
  T(`tl.to("#zm-confess .cf-cat", {x:400, opacity:0, duration:1.0}, ${r(L.l19.start + 1.0)});`);
  gesture("cf-mx", "rest", L.l19.start, 0.3);
  camTo("confess", 800, 700, 2.3, L.l20.start - 0.2, 0.3, 880, "power2.out");
  gesture("cf-mx", "fist", L.l20.start + 0.4, 0.3);
  talk("cf-mx", "l20");
  gesture("cf-mx", "rest", L.l20.end, 0.3);
  camTo("confess", 520, 680, 2.3, L.l21.start - 0.2, 0.4, 880, "power2.inOut");
  talk("cf-m", "l21");
  expr("cf-m", "sad", L.l22.start + 0.6);
  talk("cf-m", "l23");
  camTo("confess", 800, 700, 2.3, L.l24.start - 0.2, 0.4, 880, "power2.inOut");
  expr("cf-mx", "determined", L.l24.start);
  talk("cf-mx", "l24");
  // he sits beside her and holds her
  T(
    `tl.to("#cf-mxg", {attr:{transform:"translate(-170 -115) rotate(0 800 1060)"}, duration:.8, ease:"power2.inOut"}, ${r(L.l25.start - 0.2)});`,
  );
  camTo("confess", 580, 680, 2.0, L.l25.start - 0.2, 0.8, 880, "power2.inOut");
  expr("cf-mx", "happy", L.l25.start);
  talk("cf-mx", "l25");
  pose("cf-m", "head", 12, L.l26.start, 0.5);
  expr("cf-m", "happy", L.l26.start + 0.5);
  heartsUp("cf-h2", L.l26.start + 0.5, b - 0.2);
  ["cf-m", "cf-mx"].forEach((id) => blink(id, a, W("рухнул")));
  blink("cf-m", W("рухнул"), b);
  blink("cf-mx", L.l15.end, b);
}

/* S2 fixing the roof (and falling off it) */
scene(
  "roof",
  `${room(F11.house())}
   ${F12.ladder(760, 860, 420)}
   <g id="rf-mxg">${C("rf-mx", MXS(), 700, 470)}</g>
   ${F12.hammer("rf-ham", 740, 380)}
   <g id="rf-dust" opacity="0">${[0, 1, 2].map((k) => `<circle cx="${640 + k * 50}" cy="${1040 - (k % 2) * 20}" r="${40 + k * 10}" fill="#d8ccb8"/>`).join("")}</g>`,
  { bg: "#e9a87a" },
);
{
  const [a] = S.roof;
  camSet("roof", 620, 600, 1.2, a, 900);
  expr("rf-mx", "happy", a);
  T(
    `tl.to("#zm-roof .rf-ham", {keyframes:[{rotation:-40,duration:.15},{rotation:0,duration:.12}], svgOrigin:"740 380", repeat:${Math.round((W("упал") - a) / 0.27)}}, ${r(a)});`,
  );
  camTo("roof", 700, 420, 2.0, L.l28.start, 2.0, 880, "power2.inOut");
  const fall = W("упал");
  T(`tl.set("#zm-roof .rf-ham", {opacity:0}, ${r(fall)});`);
  expr("rf-mx", "shock", fall - 0.2);
  T(`tl.to("#rf-mxg", {y:590, duration:.5, ease:"power2.in"}, ${r(fall)});`);
  camTo("roof", 700, 900, 1.6, fall, 0.5, 900, "power2.in");
  shake("#sh-roof", fall + 0.5, 8, 14);
  T(
    `tl.fromTo("#rf-dust", {opacity:.9}, {opacity:0, duration:1.0, immediateRender:false}, ${r(fall + 0.5)});`,
  );
  expr("rf-mx", "pain", fall + 0.5);
  camTo("roof", 700, 800, 2.2, L.l29.start - 0.2, 0.4, 880, "power2.out");
  gesture("rf-mx", "cheer", L.l29.start + 0.2, 0.3);
  talk("rf-mx", "l29");
}

/* S3 the crib */
scene(
  "crib",
  `${room(F11.house())}
   ${F12.crib("cr-crib", 540, 1040)}
   ${C("cr-m", MB(), 260, 1070)}
   ${C("cr-mx", MXS(), 800, 1070)}`,
  { bg: "#e9a87a" },
);
{
  const [a, b] = S.crib;
  camSet("crib", 540, 860, 1.3, a, 900);
  expr("cr-mx", "happy", a);
  expr("cr-m", "neutral", a);
  camTo("crib", 540, 940, 2.0, L.l30.start, L.l30.end - L.l30.start, 900, "sine.inOut");
  camTo("crib", 800, 740, 2.2, L.l31.start - 0.2, 0.4, 880, "power2.inOut");
  gesture("cr-mx", "open", L.l31.start, 0.3);
  talk("cr-mx", "l31");
  camTo("crib", 260, 740, 2.2, L.l32.start - 0.2, 0.4, 880, "power2.inOut");
  expr("cr-m", "happy", L.l32.start);
  talk("cr-m", "l32");
  camTo("crib", 800, 740, 2.2, L.l33.start - 0.2, 0.4, 880, "power2.inOut");
  expr("cr-mx", "sad", L.l33.start);
  gesture("cr-mx", "shrug", L.l33.start + 0.2, 0.3);
  talk("cr-mx", "l33");
  T(
    `tl.to("#zm-crib .cr-crib", {rotation:-6, svgOrigin:"540 1040", duration:.3, yoyo:true, repeat:1}, ${r(L.l33.end - 0.3)});`,
  );
  ["cr-m", "cr-mx"].forEach((id) => blink(id, a, b));
}

/* S4 fishing: the cat catches a fish, Maxim a boot */
scene(
  "fish",
  `${room(F11.beach())}
   ${C("fs-mx", MXS({ helmet: true }), 420, 1060)}
   ${F12.rod(480, 880)}
   ${F10.cat("fs-cat", 660, 1060, 0.8)}
   ${F12.fish("fs-fish", 640, 990)}
   ${F12.boot("fs-boot", 820, 900)}`,
  { bg: "#9fb8d8" },
);
{
  const [a, b] = S.fish;
  camSet("fish", 560, 760, 1.4, a, 900);
  T(
    `tl.to("#zm-fish .wave", {x:30, duration:1.5, yoyo:true, repeat:${Math.round((b - a) / 1.5)}}, ${r(a)});`,
  );
  expr("fs-mx", "determined", a);
  pose("fs-mx", "armR", -60, a, 0.01);
  camTo("fish", 500, 720, 2.0, L.l35.start - 0.2, 0.4, 880, "power2.inOut");
  talk("fs-mx", "l35");
  T(
    `tl.fromTo("#zm-fish .fs-cat", {x:0}, {x:60, y:-40, duration:.25, yoyo:true, repeat:1, immediateRender:false}, ${r(W("кот", 1, L.l36.start))});`,
  );
  T(`tl.set("#zm-fish .fs-fish", {opacity:1}, ${r(W("кот", 1, L.l36.start) + 0.4)});`);
  camTo("fish", 660, 900, 2.4, W("кот", 1, L.l36.start) - 0.2, 0.4, 880, "power2.out");
  T(`tl.set("#zm-fish .fs-boot", {opacity:1}, ${r(W("ботинок") - 0.1)});`);
  camTo("fish", 760, 700, 1.8, W("ботинок") - 0.2, 0.4, 880, "power2.out");
  camTo("fish", 480, 720, 2.2, L.l37.start - 0.2, 0.4, 880, "power2.inOut");
  expr("fs-mx", "angry", L.l37.start);
  gesture("fs-mx", "fist", L.l37.start + 0.1, 0.2);
  talk("fs-mx", "l37");
  blink("fs-mx", a, b);
}

/* S5 three a.m.: pickles with jam */
scene(
  "crave",
  `${sofaRoom("", true)}
   ${C("cv-mx", MXS(), 520, 945)}
   ${room(F11.sofaFront())}
   ${C("cv-m", MT(), 800, 1060)}`,
  { bg: "#0a0c18" },
);
{
  const [a, b] = S.crave;
  camSet("crave", 640, 720, 1.6, a, 900);
  T(
    `tl.set("#cv-mx .eyes-closed", {opacity:1}, ${r(a)}); tl.set("#cv-mx .eyes-open", {opacity:0}, ${r(a)});`,
  );
  pose("cv-mx", "head", 14, a, 0.01);
  expr("cv-m", "neutral", a);
  camTo("crave", 800, 700, 2.2, L.l39.start - 0.2, 0.4, 880, "power2.inOut");
  gesture("cv-m", "pointR", L.l39.start, 0.2);
  talk("cv-m", "l39");
  T(
    `tl.set("#cv-mx .eyes-closed", {opacity:0}, ${r(L.l40.start - 0.2)}); tl.set("#cv-mx .eyes-open", {opacity:1}, ${r(L.l40.start - 0.2)});`,
  );
  expr("cv-mx", "tired", L.l40.start - 0.2);
  pose("cv-mx", "head", 0, L.l40.start - 0.2, 0.3);
  camTo("crave", 520, 680, 2.3, L.l40.start - 0.2, 0.4, 880, "power2.inOut");
  talk("cv-mx", "l40");
  camTo("crave", 800, 700, 2.2, L.l41.start - 0.2, 0.4, 880, "power2.inOut");
  expr("cv-m", "happy", L.l41.start);
  talk("cv-m", "l41");
  blink("cv-m", a, b);
}
scene(
  "village",
  `${room(F12.village())}
   <rect id="vl-light" x="640" y="640" width="100" height="90" fill="#ffcf7a" opacity="0"/>
   <g id="vl-n" opacity="0">${C("vl-nr", R.granny({ brow: "angry" }), 690, 990)}</g>
   <g id="vl-mxg">${C("vl-mx", MXS({ helmet: true }), -200, 1060)}<path id="vl-beam" d="M-160 860 L120 760 L120 960Z" fill="#fff6c8" opacity=".25"/></g>
   ${F12.jar("vl-jar", 600, 880)}`,
  { bg: "#05081a" },
);
{
  const [a, b] = S.village;
  camSet("village", 300, 760, 1.3, a, 900);
  expr("vl-mx", "determined", a);
  walk("vl-mx", a, L.l43.start, 0, 0, 0.18, 32);
  T(`tl.to("#vl-mxg", {x:640, duration:${r(L.l43.start - a)}, ease:"none"}, ${r(a)});`);
  camTo("village", 560, 760, 1.6, a, L.l43.start - a, 900, "none");
  T(`tl.set("#vl-light", {opacity:.9}, ${r(L.l43.start + 1.0)});`);
  camTo("village", 560, 720, 2.2, L.l43.start - 0.2, 0.4, 880, "power2.inOut");
  talk("vl-mx", "l43");
  show("#vl-n", L.l44.start - 0.3);
  expr("vl-nr", "angry", a);
  camTo("village", 640, 720, 2.0, L.l44.start - 0.3, 0.4, 880, "power2.inOut");
  talk("vl-nr", "l44");
  T(`tl.set("#zm-village .vl-jar", {opacity:1}, ${r(W("на", 1, L.l44.start) - 0.1)});`);
  expr("vl-mx", "happy", L.l44.end - 0.5);
  ["vl-mx", "vl-nr"].forEach((id) => blink(id, a, b));
}
scene(
  "pickles",
  `${sofaRoom("", true)}
   ${C("pk-m", MT(), 520, 945)}
   ${room(F11.sofaFront())}
   ${F12.jar("pk-jar", 520, 860)}
   ${C("pk-mx", MXS(), 820, 1060)}`,
  { bg: "#0a0c18" },
);
{
  const [a, b] = S.pickles;
  camSet("pickles", 640, 700, 1.7, a, 900);
  T(`tl.set("#zm-pickles .pk-jar", {opacity:1}, ${r(a)});`);
  expr("pk-m", "happy", a);
  T(
    `tl.to("#pk-m .head", {keyframes:[{rotation:-6,duration:.2},{rotation:0,duration:.2}], transformOrigin:"50% 92%", repeat:6}, ${r(a + 0.4)});`,
  );
  expr("pk-mx", "cry", L.l45.start + 2.0);
  camTo("pickles", 820, 700, 2.3, L.l46.start - 0.3, 0.5, 880, "power2.inOut");
  talk("pk-mx", "l46");
  ["pk-m", "pk-mx"].forEach((id) => blink(id, a, b));
}

/* S6 the village medic */
scene(
  "medic",
  `${room(F12.medic())}
   ${C("md-f", R.feldsher(), 820, 1060)}
   ${C("md-m", MB(), 380, 1060)}
   ${C("md-mx", MXS(), 560, 1060)}
   <g id="md-gl" opacity="0"><circle cx="806" cy="740" r="10" fill="none" stroke="#0b0d14" stroke-width="3"/><circle cx="834" cy="740" r="10" fill="none" stroke="#0b0d14" stroke-width="3"/><path d="M816 740 h8" stroke="#0b0d14" stroke-width="3"/></g>`,
  { bg: "#e9f0f2" },
);
{
  const [a, b] = S.medic;
  camSet("medic", 600, 740, 1.4, a, 900);
  expr("md-f", "neutral", a);
  expr("md-m", "neutral", a);
  expr("md-mx", "scared", a);
  T(`tl.set("#md-f", {scaleX:-1, svgOrigin:"820 1060"}, ${r(a)});`);
  camTo("medic", 820, 720, 2.2, L.l48.start - 0.2, 0.4, 880, "power2.inOut");
  talk("md-f", "l48");
  camTo("medic", 380, 720, 2.2, L.l49.start - 0.2, 0.4, 880, "power2.inOut");
  expr("md-m", "happy", L.l49.start);
  talk("md-m", "l49");
  camTo("medic", 820, 720, 2.2, L.l50.start - 0.2, 0.4, 880, "power2.inOut");
  talk("md-f", "l50");
  camTo("medic", 560, 720, 2.4, L.l51.start - 0.2, 0.3, 880, "power2.out");
  expr("md-mx", "happy", L.l51.start);
  gesture("md-mx", "cheer", L.l51.start, 0.2);
  talk("md-mx", "l51");
  camTo("medic", 820, 720, 2.4, L.l52.start - 0.1, 0.3, 880, "power2.out");
  expr("md-f", "shock", L.l52.start);
  show("#md-gl", W("уронила"));
  T(
    `tl.to("#md-gl", {y:300, rotation:60, svgOrigin:"820 740", duration:.5, ease:"power2.in"}, ${r(W("уронила"))});`,
  );
  talk("md-f", "l53");
  camTo("medic", 560, 720, 2.3, L.l54.start - 0.2, 0.4, 880, "power2.inOut");
  gesture("md-mx", "fist", L.l54.start + 0.4, 0.2);
  talk("md-mx", "l54");
  gesture("md-mx", "rest", L.l54.end, 0.3);
  camTo("medic", 820, 720, 2.2, L.l55.start - 0.2, 0.4, 880, "power2.inOut");
  expr("md-f", "happy", L.l55.start);
  talk("md-f", "l55");
  talk("md-f", "l56");
  camTo("medic", 560, 720, 2.4, L.l57.start - 0.2, 0.4, 880, "power2.inOut");
  expr("md-mx", "shock", L.l57.start);
  talk("md-mx", "l57");
  camTo("medic", 380, 720, 2.2, L.l58.start - 0.2, 0.4, 880, "power2.inOut");
  expr("md-m", "happy", L.l58.start);
  talk("md-m", "l58");
  ["md-f", "md-m", "md-mx"].forEach((id) => blink(id, a, b));
}

/* S7 the proposal at sunset (a ring made from a nut) */
scene(
  "propose",
  `${room(F11.beach())}
   <rect x="-800" y="-800" width="2680" height="3520" fill="#ff7a3a" opacity=".28"/>
   <circle cx="760" cy="520" r="80" fill="#ffd27a"/>
   <g id="pp-gulls">${[0, 1, 2].map((k) => `<path d="M${560 + k * 70} ${300 - k * 20} q12 -12 24 0 q12 -12 24 0" stroke="#2a2a2e" stroke-width="4" fill="none"/>`).join("")}</g>
   ${C("pp-m", MB(), 380, 1060)}
   <g id="pp-mxg">${C("pp-mx", MXS(), 640, 1060)}</g>
   ${F12.nut("pp-nut", 560, 840)}
   ${hearts("pp-h", 500, 560)}`,
  { bg: "#e9a87a" },
);
{
  const [a, b] = S.propose;
  camSet("propose", 540, 680, 1.2, a, 900);
  expr("pp-m", "happy", a);
  expr("pp-mx", "scared", a);
  camTo("propose", 640, 720, 2.2, L.l60.start - 0.2, 0.4, 880, "power2.inOut");
  talk("pp-mx", "l60");
  // down on one knee — crack!
  const knee = W("одно");
  T(`tl.to("#pp-mxg", {y:115, duration:.4}, ${r(knee)});`);
  T(`tl.to("#pp-mx .legL, #pp-mx .legR", {scaleY:.45, svgOrigin:"0 0", duration:.4}, ${r(knee)});`);
  shake("#sh-propose", W("хрустнуло"), 5, 6);
  T(`tl.to("#pp-gulls", {y:-200, x:200, opacity:0, duration:1.0}, ${r(W("хрустнуло") + 0.1)});`);
  camTo("propose", 520, 760, 1.8, L.l62.start - 0.2, 0.5, 880, "power2.inOut");
  expr("pp-mx", "pain", L.l62.start);
  expr("pp-mx", "happy", W("выходи") - 0.2);
  talk("pp-mx", "l62");
  gesture("pp-mx", "pointR", W("выходи") - 0.1, 0.3);
  T(`tl.set("#zm-propose .pp-nut", {opacity:1}, ${r(L.l63.start + 0.3)});`);
  camTo("propose", 560, 840, 3.0, W("гайки") - 0.4, 0.5, 900, "power2.inOut");
  camTo("propose", 380, 720, 2.2, L.l64.start - 0.2, 0.4, 880, "power2.inOut");
  expr("pp-m", "cry", L.l64.start);
  talk("pp-m", "l64");
  camTo("propose", 600, 760, 2.2, L.l65.start - 0.2, 0.4, 880, "power2.inOut");
  talk("pp-mx", "l65");
  camTo("propose", 380, 720, 2.2, L.l66.start - 0.2, 0.4, 880, "power2.inOut");
  expr("pp-m", "sad", L.l66.start);
  talk("pp-m", "l66");
  camTo("propose", 600, 760, 2.2, L.l67.start - 0.2, 0.4, 880, "power2.inOut");
  expr("pp-mx", "happy", L.l67.start);
  talk("pp-mx", "l67");
  expr("pp-mx", "shock", L.l68.start);
  talk("pp-mx", "l68");
  camTo("propose", 380, 720, 2.2, L.l69.start - 0.2, 0.4, 880, "power2.inOut");
  expr("pp-m", "happy", L.l69.start);
  talk("pp-m", "l69");
  talk("pp-m", "l70");
  // the nut on her finger
  T(`tl.to("#zm-propose .pp-nut", {x:-150, y:20, duration:.6}, ${r(L.l71.start)});`);
  camTo("propose", 480, 720, 1.8, L.l71.start, 0.8, 880, "power2.inOut");
  T(`tl.to("#pp-mxg", {y:0, x:-60, duration:.5}, ${r(L.l71.start + 0.8)});`);
  T(
    `tl.to("#pp-mx .legL, #pp-mx .legR", {scaleY:1, svgOrigin:"0 0", duration:.4}, ${r(L.l71.start + 0.8)});`,
  );
  heartsUp("pp-h", L.l71.start + 1.0, b - 0.2);
  talk("pp-mx", "l72");
  ["pp-m", "pp-mx"].forEach((id) => blink(id, a, b));
}

/* S8 night: the refugee lists on the radio */
scene(
  "radio",
  `${sofaRoom(F12.radio(110, 430), true)}
   ${C("rd-m", MT(), 470, 945)}
   ${C("rd-mx", MXS(), 640, 945)}
   ${room(F11.sofaFront())}
   ${F12.cup("rd-cup", 420, 890)}
   ${F12.shards("rd-shards", 430, 1000)}
   <g id="rd-wave" opacity="0"><path d="M200 380 q20 20 0 40 M220 365 q34 35 0 70" stroke="#ffe27a" stroke-width="5" fill="none"/></g>`,
  { bg: "#0a0c18" },
);
{
  const [a, b] = S.radio;
  camSet("radio", 400, 640, 1.3, a, 900);
  expr("rd-m", "happy", a);
  expr("rd-mx", "happy", a);
  pose("rd-m", "head", 10, a, 0.01);
  T(
    `tl.to("#rd-wave", {opacity:1, duration:.2, yoyo:true, repeat:${Math.round((L.l77.end - L.l74.start) / 0.4)}}, ${r(L.l74.start)});`,
  );
  camTo("radio", 160, 440, 2.6, L.l74.start - 0.3, 0.6, 880, "power2.inOut");
  camTo("radio", 560, 700, 2.0, L.l76.start - 0.3, 0.5, 880, "power2.inOut");
  expr("rd-m", "tired", L.l76.start);
  talk("rd-m", "l76");
  camTo("radio", 160, 440, 3.0, L.l77.start - 0.2, 0.4, 880, "power2.out");
  // the cup falls
  camTo("radio", 460, 800, 2.0, L.l78.start - 0.2, 0.4, 880, "power2.out");
  T(
    `tl.to("#zm-radio .rd-cup", {y:200, rotation:60, svgOrigin:"420 890", duration:.4, ease:"power2.in"}, ${r(W("выпала"))});`,
  );
  T(
    `tl.set("#zm-radio .rd-cup", {opacity:0}, ${r(W("выпала") + 0.4)}); tl.set("#zm-radio .rd-shards", {opacity:1}, ${r(W("выпала") + 0.4)});`,
  );
  expr("rd-m", "shock", L.l78.start);
  pose("rd-m", "head", 0, L.l78.start, 0.2);
  camTo("radio", 470, 680, 2.6, L.l79.start - 0.2, 0.5, 880, "power2.inOut");
  talk("rd-m", "l79");
  expr("rd-m", "cry", L.l79.end - 0.4);
  camTo("radio", 640, 680, 2.8, L.l80.start - 0.3, 0.5, 880, "power2.inOut");
  expr("rd-mx", "shock", L.l78.start + 0.4);
  expr("rd-mx", "sad", L.l80.start);
  talk("rd-mx", "l80");
  ["rd-m", "rd-mx"].forEach((id) => blink(id, a, b));
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
};
const HOT = new Set(
  "люблю беременна получилось-то папой папа правду никуда кроватку дизайн авторский ботинок огурцов вареньем трое здоровенький я порох институт выходи гайки гайка согласна счастливый глеб живой мальчики".split(
    " ",
  ),
);
const DANGER = new Set("рухнул упал сдурел разбилась".split(" "));
const hook = `<div id="hook" class="clip toptitle" data-start="0.2" data-duration="${r(L.l01.start - 0.1)}" data-track-index="2" style="z-index:5"><div class="tt-s">${spl("ГЛЕБ", "hs")}</div><div class="tt-a">${spl("ЧАСТЬ 12", "ha")}</div></div>`;
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
  stamp("st-faint", W("рухнул") + 0.4, W("рухнул") + 1.6, "БУМ!", "#ff4a3d"),
  stamp("st-fall", W("упал") + 0.5, W("упал") + 1.6, "БАЦ!", "#ff4a3d"),
  stamp("st-knee", W("хрустнуло"), W("хрустнуло") + 1.1, "ХРУСТЬ!", "#ffcf7a"),
].join("\n");
const title = `<div id="tbc" class="clip" data-start="${TITLE[0]}" data-duration="${r(TITLE[1] - TITLE[0])}" data-track-index="4" style="z-index:8"><div id="tbc-a">${spl("ПРОДОЛЖЕНИЕ СЛЕДУЕТ…", "ta")}</div><div id="tbc-b">ЧАСТЬ 13</div></div>`;
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
  ["room_day", 0, S.confess[1], 0.35],
  ["slam", W("рухнул") + 0.55, 0.5, 1.2],
  ["room_day", S.roof[0], S.fish[1] - S.roof[0], 0.45],
  ["pop", S.roof[0] + 0.3, 0.09, 0.8],
  ["pop", S.roof[0] + 0.6, 0.09, 0.8],
  ["pop", S.roof[0] + 0.9, 0.09, 0.8],
  ["slam", W("упал") + 0.5, 0.5, 1.3],
  ["room_night", S.crave[0], S.pickles[1] - S.crave[0], 0.55],
  ["door", L.l44.start - 0.3, 0.35, 0.9],
  ["room_day", S.medic[0], S.medic[1] - S.medic[0], 0.35],
  ["glass", W("уронила") + 0.5, 0.6, 0.5],
  ["room_day", S.propose[0], S.propose[1] - S.propose[0], 0.45],
  ["click", W("хрустнуло"), 0.06, 1.4],
  ["room_night", S.radio[0], CUT - S.radio[0], 0.5],
  ["buzz", L.l74.start - 0.3, 1.2, 0.4],
  ["glass", W("выпала") + 0.4, 0.6, 1.2],
].filter(([, , , v]) => v > 0);
const audio = [
  `<audio id="vo" class="clip" src="assets/vo.wav" data-start="0" data-duration="${r(L.l80.end + 0.1)}" data-track-index="10" data-volume="1"></audio>`,
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
<title>Глеб — часть 12</title>
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
