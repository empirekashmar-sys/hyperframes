// "Глеб — часть 18": four years later. The Chaika settlement, Vanya, the Hive on the radio, Gleb at the gate.
// Run from gleb/p18: node build.mjs → index.html (sfx shared via assets/sfx symlink).
import fs from "node:fs";
import * as R from "../art/rig.js";
import * as F18 from "./art18.js";
import * as F11 from "../p11/art11.js";
import * as F15 from "../p15/art15.js";
import * as F10 from "../p10/art10.js";
import * as F8 from "../p8/art8.js";
import * as F9 from "../p9/art9.js";

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
const CUT = r(L.l54.end + 2.0);
const TITLE = [CUT, r(CUT + 3.2)];
const CARD_START = r(TITLE[1] + 0.1);
const CARD_DUR = 3.6;
const TOTAL = r(CARD_START + CARD_DUR);
const S = {};
{
  const ends = [
    ["dog", L.l02.end + 0.5],
    ["chaika", L.l04.end + 1.0],
    ["bed", L.l10.end + 0.6],
    ["kitchen", L.l17.end + 0.9],
    ["tower", L.l24.end + 0.9],
    ["radio", L.l29.end + 0.9],
    ["beach", L.l29g.end + 0.8],
    ["hall", L.l35.end + 0.9],
    ["kid", L.l39.end + 0.9],
    ["porch", L.l45.end + 0.6],
    ["gate", CUT],
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
let seed = 61;
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
const MX = (o = {}) => R.maxim({ prop: "", brow: "neutral", ...o });
const MN = (o = {}) => R.masha({ outfit: "nurse", ...o });
const V = (o = {}) => R.vanya(o);
const ZN = (o = {}) => R.zina({ brow: "neutral", ...o });
const SOL = (o = {}) => R.soldier({ brow: "worried", ...o });
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
const sleep = (id, at) =>
  T(
    `tl.set("#${id} .eyes-closed", {opacity:1}, ${r(at)}); tl.set("#${id} .eyes-open, #${id} .eyes-wide, #${id} .eyes-squint", {opacity:0}, ${r(at)});`,
  );
const wake = (id, at, e = "neutral") => {
  T(`tl.set("#${id} .eyes-closed", {opacity:0}, ${r(at)});`);
  expr(id, e, at);
};
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
  T(`tl.to("#${aId}", {x:"+=${ax}", y:-14, duration:.4, ease:"power2.out"}, ${r(at)});`);
  T(`tl.to("#${bId}", {x:"+=${bx}", duration:.4, ease:"power2.out"}, ${r(at)});`);
  pose(aId, "head", 14, at, 0.4);
  pose(bId, "head", -14, at, 0.4);
  [aId, bId].forEach((id) => {
    sleep(id, at + 0.35);
    T(
      `tl.set("#${id} .eyes-closed", {opacity:0}, ${r(at + dur)}); tl.set("#${id} .eyes-open", {opacity:1}, ${r(at + dur)});`,
    );
  });
  T(`tl.to("#${aId}", {x:"-=${ax / 2}", y:0, duration:.4, ease:"power2.inOut"}, ${r(at + dur)});`);
  T(`tl.to("#${bId}", {x:"-=${bx / 2}", duration:.4, ease:"power2.inOut"}, ${r(at + dur)});`);
  pose(aId, "head", 0, at + dur, 0.4);
  pose(bId, "head", 0, at + dur, 0.4);
};
const sirenFlash = (sel, t0, t1) =>
  T(
    `tl.to("${sel}", {opacity:.28, duration:.45, yoyo:true, repeat:${Math.max(1, Math.round((t1 - t0) / 0.45) | 1)}, ease:"sine.inOut"}, ${r(t0)});`,
  );
// sitting on the shoulders / standing on a chair: shorten the legs from the hip
const shortLegs = (id, at, k = 0.5) =>
  T(`tl.set("#${id} .legL, #${id} .legR", {scaleY:${k}, svgOrigin:"0 0"}, ${r(at)});`);

/* S1 four years ago: the tracker on a stray dog, the helicopter chasing it */
scene(
  "dog",
  `${room(F11.steppe())}
   <g id="dg-hw">${F15.heli("dg-heli", 0, 420, 0.6)}</g>
   <g id="dg-dw">${F18.dog("dg-dog", 0, 960, 1.6)}</g>`,
  { bg: "#8fb4dc" },
);
{
  const [a, b] = S.dog;
  const t0 = L.l02.start - 0.4;
  camSet("dog", 540, 760, 1.25, a, 900);
  T(`tl.set("#dg-dw", {x:-300}, ${r(a)}); tl.set("#dg-hw", {x:-700}, ${r(a)});`);
  T(`tl.to("#dg-dw", {x:2300, duration:${r(b - t0)}, ease:"none"}, ${r(t0)});`);
  T(`tl.to("#dg-hw", {x:1900, duration:${r(b - t0)}, ease:"none"}, ${r(t0 + 0.6)});`);
  camTo("dog", 1500, 760, 1.25, t0 + 0.4, b - t0 - 0.4, 900, "none");
  yoyo("#zm-dog .dlegs", 'scaleX:-1, transformOrigin:"50% 0%"', a, b, 0.12);
  yoyo("#dg-dog", "y:-14", a, b, 0.12);
  yoyo("#zm-dog .tdot", "opacity:.1", a, b, 0.25);
  T(
    `tl.to("#zm-dog .rotor", {scaleX:.1, svgOrigin:"0 -102", duration:.06, yoyo:true, repeat:${Math.round((b - a) / 0.06)}}, ${r(a)});`,
  );
}

/* S2 the "Chaika" settlement by the sea */
scene(
  "chaika",
  `${room(F18.chaika())}
   <g id="ch-catw" opacity="0">${F10.cat("ch-cat", 640, 1010, 2.4)}</g>`,
  { bg: "#7fb2e0" },
);
{
  const [a, b] = S.chaika;
  camSet("chaika", 540, 480, 1.05, a, 820);
  camTo("chaika", 480, 640, 1.2, a + 0.3, L.l03.end - a, 860, "sine.inOut");
  T(
    `tl.to("#zm-chaika .blades", {rotation:${Math.round((b - a) * 70)}, svgOrigin:"0 0", duration:${r(b - a)}, ease:"none"}, ${r(a)});`,
  );
  yoyo("#zm-chaika .waves", "x:-60", a, b, 2.2);
  yoyo("#zm-chaika .hen", "rotation:22", a, b, 0.35);
  camTo("chaika", 620, 800, 1.5, L.l04.start - 0.2, 1.4, 900, "power2.inOut");
  show("#ch-catw", W("петрович") - 0.6);
  T(
    `tl.fromTo("#ch-catw", {y:60}, {y:0, duration:.4, ease:"back.out(2)", immediateRender:false}, ${r(W("петрович") - 0.6)});`,
  );
  camTo("chaika", 640, 940, 2.4, W("петрович") - 0.4, 0.6, 900, "power2.out");
  T(
    `tl.to("#ch-catw", {scaleX:1.12, transformOrigin:"640px 1010px", duration:.3, yoyo:true, repeat:1}, ${r(W("самовар") - 0.1)});`,
  );
}

/* S3 morning: Vanya jumps on the bed, Masha in her nurse's tunic */
scene(
  "bed",
  `${room(F8.bedroom())}
   ${C("bd-mx", MX(), 430, 985)}
   ${room(F8.quilt())}
   <g id="bd-vw">${C("bd-v", V({ outfit: "pajama" }), 650, 870)}</g>
   <g id="bd-mw" opacity="0">${C("bd-m", MN(), 920, 1080)}</g>`,
  { bg: "#6a4630" },
);
{
  const [a, b] = S.bed;
  camSet("bed", 540, 700, 1.3, a, 900);
  sleep("bd-mx", a);
  pose("bd-mx", "head", 10, a, 0.01);
  expr("bd-v", "happy", a);
  camTo("bed", 620, 720, 2.0, L.l05.start - 0.3, 0.5, 900, "power2.inOut");
  T(
    `tl.to("#bd-vw", {keyframes:[{y:-90,duration:.22,ease:"power2.out"},{y:0,duration:.22,ease:"power2.in"}], repeat:${Math.max(1, Math.round((L.l05.end - L.l05.start) / 0.44))}}, ${r(L.l05.start)});`,
  );
  gesture("bd-v", "cheer", L.l05.start, 0.2);
  talk("bd-v", "l05");
  T(
    `tl.to("#bd-mx .body", {keyframes:[{y:-6,duration:.1},{y:0,duration:.1}], repeat:${Math.max(1, Math.round((L.l05.end - L.l05.start) / 0.44))}}, ${r(L.l05.start + 0.2)});`,
  );
  gesture("bd-v", "rest", L.l05.end, 0.3);
  wake("bd-mx", L.l06.start - 0.2, "tired");
  camTo("bed", 440, 700, 2.2, L.l06.start - 0.3, 0.5, 900, "power2.inOut");
  talk("bd-mx", "l06");
  expr("bd-v", "neutral", L.l07.start);
  pose("bd-v", "head", 10, L.l07.start, 0.3);
  camTo("bed", 620, 720, 2.2, L.l07.start - 0.3, 0.5, 900, "power2.inOut");
  talk("bd-v", "l07");
  expr("bd-mx", "neutral", L.l08.start);
  camTo("bed", 460, 700, 2.0, L.l08.start - 0.3, 0.5, 900, "power2.inOut");
  gesture("bd-mx", "shrug", L.l08.start + 0.5, 0.3);
  talk("bd-mx", "l08");
  show("#bd-mw", L.l09.start - 0.6);
  walk("bd-m", L.l09.start - 0.6, L.l09.start + 0.3, -120, 0, 0.3, 16);
  expr("bd-m", "happy", L.l09.start - 0.6);
  camTo("bed", 660, 760, 1.35, L.l09.start - 0.5, 0.6, 900, "power2.inOut");
  talk("bd-m", "l09");
  expr("bd-v", "happy", L.l09.start);
  camTo("bed", 800, 720, 2.2, L.l10.start, 1.2, 900, "power2.inOut");
  gesture("bd-m", "open", L.l10.start + 1.4, 0.3);
  expr("bd-m", "determined", W("взгляд") - 0.2);
  camTo("bed", 800, 640, 3.0, W("взгляд") - 0.2, 0.5, 900, "power2.out");
  ["bd-v", "bd-m"].forEach((id) => blink(id, a, b));
  blink("bd-mx", L.l06.start, b);
}

/* S4 breakfast: Zina's pancakes */
const pancakes = (id, x, y, n = 6) =>
  `<g id="${id}">${Array.from({ length: n }, (_, i) => `<ellipse cx="${x}" cy="${y - i * 9}" rx="62" ry="14" fill="${i % 2 ? "#e9b05a" : "#d9963e"}" stroke="#0b0d14" stroke-width="2"/>`).join("")}<path d="M${x - 14} ${y - n * 9 - 4} q14 -10 28 0" fill="#ffe27a" stroke="#0b0d14" stroke-width="1.6"/></g>`;
scene(
  "kitchen",
  `${room(F8.kitchen())}
   ${C("kt-mx", MX(), 470, 970)}
   ${C("kt-m", MN(), 830, 970)}
   ${C("kt-v", V(), 650, 905)}
   ${room(F8.table())}
   ${pancakes("kt-pc", 560, 812)}
   <g id="kt-fly" opacity="0"><ellipse cx="0" cy="0" rx="58" ry="13" fill="#d9963e" stroke="#0b0d14" stroke-width="2"/></g>
   <g id="kt-zw">${C("kt-zn", ZN({ prop: "pan" }), 170, 1090)}</g>`,
  { bg: "#6a4630" },
);
{
  const [a, b] = S.kitchen;
  camSet("kitchen", 540, 720, 1.2, a, 900);
  expr("kt-zn", "happy", a);
  camTo("kitchen", 240, 740, 1.8, L.l11.start - 0.3, 0.5, 900, "power2.inOut");
  gesture("kt-zn", "fist", L.l11.start + 0.2, 0.2);
  talk("kt-zn", "l11");
  gesture("kt-zn", "rest", L.l11.end, 0.3);
  expr("kt-v", "happy", L.l12.start);
  camTo("kitchen", 640, 760, 2.2, L.l12.start - 0.3, 0.5, 900, "power2.inOut");
  gesture("kt-v", "handsUp", L.l12.start + 0.1, 0.2);
  talk("kt-v", "l12");
  gesture("kt-v", "rest", W("почти") + 0.3, 0.3);
  expr("kt-v", "tired", W("почти"));
  expr("kt-zn", "neutral", L.l13.start);
  camTo("kitchen", 360, 740, 1.5, L.l13.start - 0.3, 0.5, 900, "power2.inOut");
  gesture("kt-zn", "pointR", L.l13.start + 0.4, 0.2);
  talk("kt-zn", "l13");
  expr("kt-mx", "scared", L.l14.start - 0.2);
  camTo("kitchen", 470, 700, 2.4, L.l14.start - 0.3, 0.4, 900, "power2.inOut");
  gesture("kt-mx", "open", L.l14.start, 0.2);
  talk("kt-mx", "l14");
  gesture("kt-mx", "rest", L.l14.end, 0.3);
  expr("kt-zn", "angry", L.l15.start);
  camTo("kitchen", 300, 740, 1.6, L.l15.start - 0.3, 0.4, 900, "power2.inOut");
  talk("kt-zn", "l15");
  expr("kt-m", "happy", L.l16.start - 0.2);
  expr("kt-v", "happy", L.l16.start);
  camTo("kitchen", 760, 700, 2.0, L.l16.start - 0.3, 0.4, 900, "power2.inOut");
  gesture("kt-m", "shrug", L.l16.start, 0.2);
  talk("kt-m", "l16");
  // the thickest pancake flies to Maxim's plate
  camTo("kitchen", 420, 740, 1.4, L.l17.start, 0.8, 900, "power2.inOut");
  expr("kt-zn", "determined", L.l17.start);
  const fly = W("толстые") - 1.2;
  show("#kt-fly", fly);
  T(
    `tl.fromTo("#kt-fly", {x:220, y:740}, {keyframes:[{x:340, y:560, duration:.4, ease:"power1.out"},{x:470, y:790, duration:.45, ease:"power1.in"}], immediateRender:false}, ${r(fly)});`,
  );
  T(
    `tl.fromTo("#kt-fly", {rotation:0}, {rotation:720, svgOrigin:"0 0", duration:.85, immediateRender:false}, ${r(fly)});`,
  );
  expr("kt-mx", "happy", fly + 0.9);
  ["kt-zn", "kt-mx", "kt-m", "kt-v"].forEach((id) => blink(id, a, b));
}

/* S5 on the watchtower: Vanya on his father's shoulders, the toy hare */
scene(
  "tower",
  `${room(F18.towerTop())}
   ${C("tw-v", V(), 560, 786)}
   ${C("tw-mx", MX({ prop: "rifle" }), 560, 1070)}
   ${F9.hare("tw-hare", 618, 728, 0.55)}
   ${room(F18.towerRail())}`,
  { bg: "#6aa2d8" },
);
{
  const [a, b] = S.tower;
  camSet("tower", 560, 720, 1.25, a, 900);
  shortLegs("tw-v", a, 0.5);
  pose("tw-v", "armL", 70, a, 0.01);
  pose("tw-v", "armL-lo", 60, a, 0.01);
  pose("tw-mx", "armL", -150, a, 0.01);
  pose("tw-mx", "armL-lo", -40, a, 0.01);
  expr("tw-v", "happy", a);
  camTo("tower", 580, 660, 1.9, L.l19.start - 0.3, 0.5, 900, "power2.inOut");
  pose("tw-v", "head", -8, L.l19.start, 0.3);
  T(
    `tl.to("#zm-tower .tw-hare", {y:-30, duration:.3, yoyo:true, repeat:1}, ${r(L.l19.start + 0.2)});`,
  );
  talk("tw-v", "l19");
  expr("tw-mx", "happy", L.l20.start);
  camTo("tower", 560, 800, 2.0, L.l20.start - 0.3, 0.5, 900, "power2.inOut");
  talk("tw-mx", "l20");
  expr("tw-v", "neutral", L.l21.start);
  camTo("tower", 580, 640, 2.2, L.l21.start - 0.3, 0.4, 900, "power2.inOut");
  talk("tw-v", "l21");
  expr("tw-mx", "tired", L.l22.start);
  camTo("tower", 560, 820, 2.2, L.l22.start - 0.3, 0.4, 900, "power2.inOut");
  talk("tw-mx", "l22");
  // a car on the steppe road
  T(
    `tl.to("#zm-tower .far-car", {x:1500, duration:${r(b - L.l22.end)}, ease:"none"}, ${r(L.l22.end)});`,
  );
  expr("tw-v", "shock", L.l23.start);
  pose("tw-v", "armR", -100, L.l23.start + 0.1, 0.2);
  pose("tw-v", "armR-lo", -10, L.l23.start + 0.1, 0.2);
  camTo("tower", 400, 700, 1.3, L.l23.start - 0.2, 0.6, 900, "power2.inOut");
  talk("tw-v", "l23");
  expr("tw-mx", "determined", L.l24.start);
  camTo("tower", 560, 780, 1.8, L.l24.start - 0.2, 0.5, 900, "power2.inOut");
  talk("tw-mx", "l24");
  ["tw-v", "tw-mx"].forEach((id) => blink(id, a, b));
}

/* S6 the radio room: "This is the Hive" */
scene(
  "radio",
  `${room(F18.radioRoom())}
   ${C("rd-s", SOL(), 720, 1070)}
   <g id="rd-mxw">${C("rd-mx", MX({ prop: "rifle" }), 1260, 1070)}</g>`,
  { bg: "#4a5a52" },
);
{
  const [a, b] = S.radio;
  camSet("radio", 700, 720, 1.3, a, 900);
  expr("rd-s", "scared", a);
  gesture("rd-s", "wave", L.l25.start, 0.3);
  talk("rd-s", "l25");
  gesture("rd-s", "rest", L.l25.end, 0.3);
  walk("rd-mx", L.l25.start + 0.4, L.l25.end, -340, 0, 0.3, 18);
  expr("rd-mx", "neutral", a);
  // the broadcast
  camTo("radio", 290, 640, 2.6, L.l26.start - 0.5, 0.8, 900, "power2.inOut");
  yoyo("#zm-radio .rwave", 'scaleY:-1, transformOrigin:"50% 50%"', L.l26.start, L.l26.end, 0.09);
  yoyo("#zm-radio .rlamp", "opacity:.15", a, b, 0.3);
  camTo(
    "radio",
    340,
    680,
    2.0,
    L.l26.start + 3.0,
    L.l26.end - L.l26.start - 3.0,
    900,
    "sine.inOut",
  );
  expr("rd-mx", "angry", L.l27.start - 0.2);
  camTo("radio", 920, 720, 2.2, L.l27.start - 0.3, 0.5, 900, "power2.inOut");
  talk("rd-mx", "l27");
  camTo("radio", 720, 720, 2.2, L.l28.start - 0.3, 0.5, 900, "power2.inOut");
  expr("rd-s", "sad", L.l28.start);
  talk("rd-s", "l28");
  expr("rd-mx", "determined", L.l29.start);
  camTo("radio", 840, 740, 1.6, L.l29.start - 0.3, 0.5, 900, "power2.inOut");
  gesture("rd-mx", "fist", L.l29.start + 0.4, 0.2);
  talk("rd-mx", "l29");
  ["rd-s", "rd-mx"].forEach((id) => blink(id, a, b));
}

/* S7 the beach: skipping stones */
scene(
  "beach",
  `<rect x="-800" y="-800" width="2680" height="1000" fill="#9fb8d8"/>${room(F11.beach())}
   ${C("bh-mx", MX(), 360, 1070)}
   ${C("bh-v", V(), 560, 1070)}
   <g id="bh-mw" opacity="0">${C("bh-m", MN(), 860, 1070)}</g>
   <circle id="bh-stone" cx="0" cy="0" r="9" fill="#6a6458" stroke="#0b0d14" stroke-width="2" opacity="0"/>
   ${[0, 1, 2].map((i) => `<g id="bh-sp${i}" opacity="0"><path d="M${700 + i * 120} ${700 - i * 40} l-12 -26 M${708 + i * 120} ${698 - i * 40} l0 -30 M${716 + i * 120} ${700 - i * 40} l12 -26" stroke="#f2f6fa" stroke-width="5" stroke-linecap="round"/></g>`).join("")}`,
  { bg: "#b9b0a0" },
);
{
  const [a, b] = S.beach;
  camSet("beach", 520, 640, 1.1, a, 880);
  yoyo("#zm-beach .wave", "x:-30", a, b, 1.8);
  expr("bh-v", "happy", a);
  expr("bh-mx", "happy", a);
  // the throw
  const th = L.l29b.start - 0.2;
  pose("bh-v", "armR", -150, th - 0.4, 0.25);
  pose("bh-v", "armR", 40, th, 0.15);
  show("#bh-stone", th);
  T(
    `tl.fromTo("#bh-stone", {x:600, y:900}, {keyframes:[{x:700, y:700, duration:.35},{x:780, y:660, duration:.25},{x:820, y:660, duration:.2},{x:880, y:620, duration:.25},{x:940, y:620, duration:.2},{x:1100, y:580, duration:.3}], immediateRender:false}, ${r(th)});`,
  );
  [0, 1, 2].forEach((i) =>
    T(
      `tl.fromTo("#bh-sp${i}", {opacity:1, scale:.4, svgOrigin:"${708 + i * 120} ${700 - i * 40}"}, {opacity:0, scale:1.2, duration:.5, immediateRender:false}, ${r(th + 0.35 + i * 0.45)});`,
    ),
  );
  T(`tl.set("#bh-stone", {opacity:0}, ${r(th + 1.6)});`);
  camTo("beach", 560, 720, 1.9, L.l29b.start, 0.5, 880, "power2.inOut");
  gesture("bh-v", "cheer", L.l29b.start + 0.6, 0.2);
  T(
    `tl.to("#bh-v", {keyframes:[{y:-40,duration:.18},{y:0,duration:.18}], repeat:2}, ${r(L.l29b.start + 0.6)});`,
  );
  talk("bh-v", "l29b");
  gesture("bh-v", "rest", L.l29b.end, 0.3);
  camTo("beach", 400, 720, 2.0, L.l29c.start - 0.3, 0.5, 880, "power2.inOut");
  gesture("bh-mx", "open", L.l29c.start + 0.3, 0.3);
  talk("bh-mx", "l29c");
  show("#bh-mw", L.l29d.start - 0.8);
  walk("bh-m", L.l29d.start - 0.8, L.l29d.start + 0.2, -120, 0, 0.3, 16);
  expr("bh-m", "happy", L.l29d.start - 0.8);
  camTo("beach", 640, 720, 1.4, L.l29d.start - 0.5, 0.6, 880, "power2.inOut");
  talk("bh-m", "l29d");
  expr("bh-v", "shock", L.l29e.start);
  pose("bh-v", "head", 10, L.l29e.start, 0.3);
  camTo("beach", 620, 760, 2.0, L.l29e.start - 0.3, 0.4, 880, "power2.inOut");
  talk("bh-v", "l29e");
  camTo("beach", 800, 720, 2.0, L.l29f.start - 0.3, 0.4, 880, "power2.inOut");
  talk("bh-m", "l29f");
  expr("bh-v", "happy", L.l29f.end);
  expr("bh-mx", "tired", L.l29g.start);
  camTo("beach", 400, 700, 2.2, L.l29g.start - 0.3, 0.4, 880, "power2.inOut");
  gesture("bh-mx", "shrug", L.l29g.start + 0.6, 0.3);
  talk("bh-mx", "l29g");
  expr("bh-m", "happy", L.l29g.end);
  camTo("beach", 600, 700, 1.2, L.l29g.end, b - L.l29g.end, 880, "sine.inOut");
  ["bh-v", "bh-mx", "bh-m"].forEach((id) => blink(id, a, b));
}

/* S8 the council in the dining hall */
scene(
  "hall",
  `${room(F18.hall())}
   ${C("hl-m", MN(), 190, 985)}
   ${C("hl-mx", MX(), 430, 985)}
   ${C("hl-zn", ZN(), 670, 985)}
   ${C("hl-s", SOL(), 905, 985)}
   ${room(F18.crowd())}`,
  { bg: "#c9a87a" },
);
{
  const [a, b] = S.hall;
  camSet("hall", 540, 700, 1.0, a, 900);
  yoyo("#zm-hall .bulb", "opacity:.55", a, b, 0.7);
  ["hl-m", "hl-mx", "hl-zn", "hl-s"].forEach((id) => expr(id, "neutral", a));
  camTo("hall", 540, 700, 1.15, a + 0.2, L.l30.end - a, 900, "sine.inOut");
  expr("hl-m", "sad", L.l31.start);
  camTo("hall", 230, 700, 2.0, L.l31.start - 0.3, 0.5, 900, "power2.inOut");
  gesture("hl-m", "open", L.l31.start + 0.3, 0.3);
  talk("hl-m", "l31");
  gesture("hl-m", "rest", L.l31.end, 0.3);
  expr("hl-mx", "determined", L.l32.start);
  camTo("hall", 430, 700, 2.0, L.l32.start - 0.3, 0.5, 900, "power2.inOut");
  gesture("hl-mx", "fist", W("пущу") - 0.2, 0.2);
  talk("hl-mx", "l32");
  gesture("hl-mx", "rest", L.l32.end, 0.3);
  expr("hl-zn", "determined", L.l33.start);
  camTo("hall", 660, 700, 2.0, L.l33.start - 0.3, 0.5, 900, "power2.inOut");
  gesture("hl-zn", "pointR", W("запишите") - 0.2, 0.2);
  talk("hl-zn", "l33");
  expr("hl-mx", "shock", W("первый"));
  expr("hl-s", "scared", L.l34.start);
  camTo("hall", 880, 700, 2.0, L.l34.start - 0.3, 0.5, 900, "power2.inOut");
  talk("hl-s", "l34");
  camTo("hall", 540, 720, 1.1, L.l35.start, 1.0, 900, "power2.inOut");
  ["hl-m", "hl-mx", "hl-zn", "hl-s"].forEach((id) => blink(id, a, b));
}

/* S9 night: Vanya asleep with the wooden hare */
scene(
  "kid",
  `${room(F18.kidRoom())}
   <g transform="rotate(-90 690 792)">${C("kd-v", V({ outfit: "pajama" }), 690, 792)}</g>
   ${F9.hare("kd-hare", 590, 770, 0.6)}
   ${room(F18.cribFront())}
   ${C("kd-mx", MX(), 940, 1090)}`,
  { bg: "#2a3050" },
);
{
  const [a, b] = S.kid;
  camSet("kid", 600, 760, 1.4, a, 900);
  yoyo("#zm-kid .nlight", "opacity:.7", a, b, 1.2);
  sleep("kd-v", a);
  expr("kd-mx", "happy", a);
  camTo("kid", 560, 780, 2.0, a + 0.3, L.l36.end - a, 900, "sine.inOut");
  wake("kd-v", L.l37.start - 0.3, "scared");
  talk("kd-v", "l37");
  camTo("kid", 860, 740, 1.8, L.l38.start - 0.3, 0.5, 900, "power2.inOut");
  gesture("kd-mx", "fist", W("сильнее") - 0.1, 0.2);
  talk("kd-mx", "l38");
  gesture("kd-mx", "rest", L.l38.end, 0.3);
  expr("kd-v", "happy", L.l39.start);
  camTo("kid", 520, 790, 2.4, L.l39.start - 0.3, 0.5, 900, "power2.inOut");
  talk("kd-v", "l39");
  sleep("kd-v", L.l39.end + 0.2);
  camTo("kid", 600, 780, 1.6, L.l39.end, b - L.l39.end, 900, "sine.inOut");
  blink("kd-mx", a, b);
}

/* S10 the porch under the moon, then the siren */
scene(
  "porch",
  `${room(F9.moonPorch())}
   ${C("pc-m", MN(), 430, 990)}
   ${C("pc-mx", MX(), 650, 990)}
   ${room(F9.porchRail())}
   ${hearts("pc-h", 540, 540)}
   ${F18.flood("pc-flood")}`,
  { bg: "#05081a" },
);
{
  const [a, b] = S.porch;
  camSet("porch", 600, 500, 1.1, a, 900);
  expr("pc-m", "happy", a);
  expr("pc-mx", "happy", a);
  camTo("porch", 540, 740, 1.7, a + 0.3, L.l40.start - a, 900, "sine.inOut");
  pose("pc-m", "head", 8, L.l40.start, 0.4);
  talk("pc-m", "l40");
  camTo("porch", 600, 740, 2.0, L.l41.start - 0.3, 0.5, 900, "power2.inOut");
  talk("pc-mx", "l41");
  camTo("porch", 470, 740, 2.0, L.l42.start - 0.3, 0.5, 900, "power2.inOut");
  gesture("pc-m", "shrug", L.l42.start + 0.4, 0.3);
  talk("pc-m", "l42");
  gesture("pc-m", "rest", L.l42.end, 0.3);
  expr("pc-mx", "sad", L.l43.start);
  camTo("porch", 620, 740, 2.2, L.l43.start - 0.3, 0.5, 900, "power2.inOut");
  talk("pc-mx", "l43");
  expr("pc-m", "happy", L.l44.start);
  camTo("porch", 470, 740, 2.2, L.l44.start - 0.3, 0.5, 900, "power2.inOut");
  talk("pc-m", "l44");
  camTo("porch", 540, 740, 1.9, L.l44.end, 0.5, 900, "power2.inOut");
  kiss("pc-m", "pc-mx", L.l44.end + 0.1, 2.0, 45, -45);
  heartsUp("pc-h", L.l44.end + 0.4, L.l45.end);
  camTo("porch", 600, 560, 1.1, L.l45.start + 0.4, 2.0, 900, "sine.inOut");
  const sir = W("сирена") - 0.1;
  sirenFlash("#pc-flood", sir, b);
  expr("pc-m", "shock", sir);
  expr("pc-mx", "shock", sir);
  shake("#sh-porch", sir, 6, 10);
  ["pc-m", "pc-mx"].forEach((id) => blink(id, a, b));
}

/* S11 the gate: a man in black armour, grey, a scar across the face */
scene(
  "gate",
  `${room(F18.gateNight())}
   <g id="gt-gw" opacity="0"><g transform="translate(540 905) scale(.8) translate(-540 -905)">${C("gt-g", R.gleb({ ghoul: true, aged: true, brow: "sad" }), 540, 905)}</g></g>
   ${room(F18.gateBars())}
   ${C("gt-mx", MX({ prop: "rifle" }), 250, 1090)}
   ${C("gt-m", MN(), 790, 1090)}
   <g id="gt-vw" opacity="0">${C("gt-v", V({ outfit: "pajama" }), 960, 1090)}</g>
   ${F18.flood("gt-flood")}`,
  { bg: "#0a1020" },
);
{
  const [a, b] = S.gate;
  camSet("gate", 540, 760, 1.0, a, 900);
  T(`tl.set("#gt-flood", {opacity:.25}, ${r(a)});`);
  sirenFlash("#gt-flood", a, L.l47.start);
  T(`tl.to("#gt-flood", {opacity:0, duration:.6}, ${r(L.l47.start)});`);
  T(
    `tl.to("#zm-gate .beam", {rotation:-14, svgOrigin:"160 340", duration:1.6, yoyo:true, repeat:3, ease:"sine.inOut"}, ${r(a)});`,
  );
  expr("gt-mx", "determined", a);
  expr("gt-m", "scared", a);
  T(`tl.to("#gt-gw", {opacity:1, duration:1.2}, ${r(L.l47.start)});`);
  camTo("gate", 540, 700, 1.8, L.l47.start, 2.5, 900, "sine.inOut");
  camTo("gate", 540, 650, 3.4, W("шрамом") - 0.4, 0.6, 900, "power2.out");
  expr("gt-g", "tired", a);
  // Maxim aims
  pose("gt-mx", "armR", -90, L.l48.start - 0.2, 0.2);
  pose("gt-mx", "armR-lo", 0, L.l48.start - 0.2, 0.2);
  pose("gt-mx", "armL", -70, L.l48.start - 0.2, 0.2);
  pose("gt-mx", "armL-lo", -30, L.l48.start - 0.2, 0.2);
  expr("gt-mx", "angry", L.l48.start);
  camTo("gate", 330, 760, 2.0, L.l48.start - 0.3, 0.4, 900, "power2.inOut");
  talk("gt-mx", "l48");
  camTo("gate", 540, 660, 2.8, L.l49.start - 0.3, 0.5, 900, "power2.inOut");
  talk("gt-g", "l49");
  expr("gt-m", "shock", L.l50.start - 0.2);
  camTo("gate", 790, 760, 2.4, L.l50.start - 0.3, 0.4, 900, "power2.inOut");
  talk("gt-m", "l50");
  expr("gt-g", "sad", L.l51.start);
  camTo("gate", 540, 660, 2.6, L.l51.start - 0.3, 0.5, 900, "power2.inOut");
  talk("gt-g", "l51");
  expr("gt-mx", "angry", L.l52.start);
  camTo("gate", 300, 760, 2.2, L.l52.start - 0.3, 0.4, 900, "power2.inOut");
  talk("gt-mx", "l52");
  expr("gt-g", "determined", L.l53.start);
  camTo("gate", 540, 650, 3.2, L.l53.start - 0.3, 0.5, 900, "power2.inOut");
  talk("gt-g", "l53");
  show("#gt-vw", L.l54.start - 0.6);
  T(
    `tl.fromTo("#gt-vw", {x:120}, {x:0, duration:.5, ease:"power2.out", immediateRender:false}, ${r(L.l54.start - 0.6)});`,
  );
  expr("gt-v", "neutral", a);
  camTo("gate", 900, 900, 2.4, L.l54.start - 0.5, 0.5, 900, "power2.inOut");
  pose("gt-v", "head", -8, L.l54.start, 0.3);
  talk("gt-v", "l54");
  camTo("gate", 540, 700, 1.3, L.l54.end + 0.2, CUT - L.l54.end - 0.2, 900, "sine.inOut");
  ["gt-mx", "gt-m", "gt-g", "gt-v"].forEach((id) => blink(id, a, b));
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
  soldier1: ["СЕРЁГА", "#c9d48a"],
  vanya: ["ВАНЯ", "#8fe0ff"],
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
  "четыре маячок собаки чайка ваня зайца улей вакцина валькирия мышеловка танке луну сбежим спасибо любимый глеб".split(
    " ",
  ),
);
const DANGER = new Set("кобель сирена шрамом умрёте курок пал".split(" "));
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
const yrs = `<div id="yrs" class="clip" data-start="${r(L.l01.start - 0.15)}" data-duration="${r(L.l01.end + 0.5 - L.l01.start + 0.15)}" data-track-index="4" style="z-index:7"><div id="yrs-a">${spl("4 ГОДА", "ya")}</div><div id="yrs-b">СПУСТЯ</div></div>`;
T(
  `tl.fromTo("#yrs .ya", {opacity:0, scale:2.4}, {opacity:1, scale:1, duration:.3, stagger:.08, ease:"power4.in", immediateRender:false}, ${r(L.l01.start - 0.1)});`,
);
T(
  `tl.fromTo("#yrs-b", {opacity:0, y:40}, {opacity:1, y:0, duration:.4, ease:"power3.out", immediateRender:false}, ${r(L.l01.start + 0.5)});`,
);
T(`tl.to("#yrs", {opacity:0, duration:.3}, ${r(L.l01.end + 0.2)});`);
const stamps = [
  yrs,
  stamp("st-hop", L.l05.start, L.l05.start + 1.2, "ХОП-ХОП!", "#ffd25a"),
  stamp("st-psh", L.l26.start - 0.6, L.l26.start + 0.6, "ПШШ…", "#7aff8a"),
  stamp("st-siren", W("сирена"), W("сирена") + 1.6, "ВИУ-ВИУ!", "#ff4a3d"),
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
  ["tank", L.l02.start, S.dog[1] - L.l02.start, 0.45],
  ["sea", S.chaika[0], S.chaika[1] - S.chaika[0], 0.45],
  ["room_day", S.chaika[0], S.chaika[1] - S.chaika[0], 0.3],
  ["room_day", S.bed[0], S.kitchen[1] - S.bed[0], 0.35],
  ["pop", W("толстые") - 0.35, 0.3, 0.9],
  ["sea", S.tower[0], S.tower[1] - S.tower[0], 0.3],
  ["truck", L.l23.start - 0.4, Math.min(6, S.tower[1] - L.l23.start + 0.4), 0.3],
  ["buzz", L.l25.end, 1.2, 0.5],
  ["buzz", L.l26.start, 1.2, 0.35],
  ["buzz", L.l26.start + 3, 1.2, 0.3],
  ["buzz", L.l26.end - 1, 1.2, 0.35],
  ["sea", S.beach[0], S.beach[1] - S.beach[0], 0.6],
  ["pop", L.l29b.start + 0.15, 0.3, 0.8],
  ["pop", L.l29b.start + 0.6, 0.3, 0.7],
  ["pop", L.l29b.start + 1.05, 0.3, 0.6],
  ["room_day", S.hall[0], S.hall[1] - S.hall[0], 0.45],
  ["room_night", S.kid[0], S.porch[1] - S.kid[0], 0.45],
  ["siren", W("сирена") - 0.1, 8, 0.7],
  ["siren", W("сирена") + 7.6, 8, 0.6],
  ["room_night", S.gate[0], CUT - S.gate[0], 0.5],
].filter(([, , , v]) => v > 0);
const audio = [
  `<audio id="vo" class="clip" src="assets/vo.wav" data-start="0" data-duration="${r(L.l54.end + 0.1)}" data-track-index="10" data-volume="1"></audio>`,
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
  #yrs { position: absolute; inset: 0; background: #05070c; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; }
  #yrs-a { font-weight: 900; font-size: 200px; line-height: 1; color: #ffb02e; -webkit-text-stroke: 14px #05070c; paint-order: stroke fill; }
  .ya { display: inline-block; }
  #yrs-b { font-weight: 900; font-size: 110px; letter-spacing: .2em; color: #fff; }
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
