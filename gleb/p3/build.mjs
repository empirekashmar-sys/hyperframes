// "Глеб — часть 3": Ded Maxim's tank, the convoy, the checkpoint, the climb to the 10th floor.
// Run from gleb/p3: node build.mjs → index.html (sfx shared via assets/sfx symlink).
import fs from "node:fs";
import * as A from "../art/art.js";
import * as R from "../art/rig.js";
import * as B from "../p2/art2.js";
import * as K from "./art3.js";

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
const CUT = r(L.l28.end + 0.9);
const TITLE = [CUT, r(CUT + 3.2)];
const CARD_START = r(TITLE[1] + 0.1);
const CARD_DUR = 3.6;
const TOTAL = r(CARD_START + CARD_DUR);
const S = {
  cab1: [0, r(L.l03.end + 0.9)],
  rear: [r(L.l03.end + 0.9), r(L.l05.start - 0.1)],
  cab2: [r(L.l05.start - 0.1), r(L.l06.start - 1.2)],
  side1: [r(L.l06.start - 1.2), r(L.l07.start - 0.1)],
  cab3: [r(L.l07.start - 0.1), r(L.l08.start - 0.1)],
  side2: [r(L.l08.start - 0.1), r(L.l09.start - 0.1)],
  cab4: [r(L.l09.start - 0.1), r(L.l12.start - 0.1)],
  side3: [r(L.l12.start - 0.1), r(L.l15.start - 0.6)],
  check: [r(L.l15.start - 0.6), r(L.l18.start - 0.5)],
  yard: [r(L.l18.start - 0.5), r(L.l20.end + 0.2)],
  lift: [r(L.l20.end + 0.2), r(L.l21.start - 0.1)],
  climb: [r(L.l21.start - 0.1), r(L.l26.start - 0.3)],
  door: [r(L.l26.start - 0.3), CUT],
};

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
    <svg viewBox="0 0 1080 1920" width="1080" height="1920"><rect x="-500" y="-500" width="2080" height="2920" fill="${bg}"/><g id="sh-${key}"><g id="zm-${key}">${world}</g></g>${overlay}</svg>
  </div>`);
}
const camSet = (key, px, py, s, at, sy = 880) =>
  T(
    `tl.set("#zm-${key}", {svgOrigin:"0 0", scale:${s}, x:${r(540 - s * px)}, y:${r(sy - s * py)}}, ${r(at)});`,
  );
const camTo = (key, px, py, s, at, dur, sy = 880, ease = "sine.inOut") =>
  T(
    `tl.to("#zm-${key}", {svgOrigin:"0 0", scale:${s}, x:${r(540 - s * px)}, y:${r(sy - s * py)}, duration:${r(dur)}, ease:"${ease}"}, ${r(at)});`,
  );
const show = (sel, at) => T(`tl.set("${sel}", {opacity:1}, ${r(at)});`);
const hide = (sel, at) => T(`tl.set("${sel}", {opacity:0}, ${r(at)});`);
const shake = (sel, at, n = 6, amp = 14) =>
  T(
    `tl.to("${sel}", {keyframes:${JSON.stringify(Array.from({ length: n }, (_, i) => ({ x: (i % 2 ? -1 : 1) * amp * (1 - i / n), y: ((i % 3) - 1) * amp * 0.6 * (1 - i / n), duration: 0.05 })).concat([{ x: 0, y: 0, duration: 0.05 }]))}}, ${r(at)});`,
  );
const rumble = (sel, t0, t1, amp = 3) =>
  T(
    `tl.to("${sel}", {keyframes:${JSON.stringify(Array.from({ length: Math.max(2, Math.round((t1 - t0) / 0.08)) }, (_, i) => ({ x: (((i * 7) % 5) - 2) * amp * 0.5, y: (((i * 3) % 3) - 1) * amp, duration: 0.08 })).concat([{ x: 0, y: 0, duration: 0.05 }]))}}, ${r(t0)});`,
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
const GLEB = (o = {}) => R.gleb({ injured: true, ...o });
const spinWheels = (sel, t0, t1, deg = 1440) =>
  T(
    `tl.to("${sel}", {rotation:"+=${deg}", transformOrigin:"50% 50%", duration:${r(t1 - t0)}, ease:"none"}, ${r(t0)});`,
  );

/* ───────────── cab (inside the car) — reused for four short scenes ───────────── */
const cabWorld = (k, { ducked = false } = {}) => `<g id="${k}-back">${room(B.cabBack())}</g>
   <g id="${k}-jam">${Array.from({ length: 10 }, (_, i) => `<circle cx="${-200 + i * 160}" cy="520" r="10" fill="#ffe9a8"/><circle cx="${-170 + i * 160}" cy="520" r="10" fill="#ffe9a8"/>`).join("")}</g>
   ${C(`${k}-o`, R.sonOld(), 470, ducked ? 840 : 735)}
   ${C(`${k}-y`, R.sonYoung(), 620, ducked ? 820 : 745)}
   ${C(`${k}-g`, GLEB(), 330, ducked ? 880 : 805)}
   ${C(`${k}-m`, R.masha(), 770, ducked ? 880 : 805)}
   ${room(B.cabFront({ lit: true }))}`;
function cabCommon(k, a, b) {
  T(
    `tl.fromTo("#${k}-jam", {x:0}, {x:600, duration:${r(b - a)}, ease:"none", immediateRender:false}, ${r(a)});`,
  );
  T(
    `tl.fromTo("#${k}-back .street", {x:0}, {x:-500, duration:${r(b - a)}, ease:"none", immediateRender:false}, ${r(a)});`,
  );
  gesture(`${k}-g`, "wheel", a, 0.01);
  [`${k}-g`, `${k}-m`, `${k}-y`, `${k}-o`].forEach((id) => blink(id, a, b));
}

/* S1 cab: why are we driving into the city? the rumble begins */
scene("cab1", cabWorld("c1"), { bg: "#05070d" });
{
  const [a, b] = S.cab1;
  camSet("cab1", 540, 560, 1.45, a, 900);
  cabCommon("c1", a, b);
  ["c1-g", "c1-m", "c1-o"].forEach((id) => expr(id, "tired", a));
  expr("c1-y", "neutral", a);
  camTo("cab1", 620, 560, 2.2, L.l01.start - 0.2, 0.5, 860, "power2.out");
  talk("c1-y", "l01");
  camTo("cab1", 340, 540, 2.1, L.l02.start - 0.15, 0.5, 860, "power2.inOut");
  talk("c1-g", "l02");
  camTo("cab1", 770, 540, 2.1, L.l03.start - 0.15, 0.5, 860, "power2.inOut");
  expr("c1-m", "scared", L.l03.start);
  talk("c1-m", "l03");
  // the ground starts to shake
  camTo("cab1", 540, 560, 1.45, L.l03.end, b - L.l03.end, 900, "power1.in");
  rumble("#sh-cab1", L.l03.end + 0.1, b, 4);
  ["c1-g", "c1-m", "c1-o", "c1-y"].forEach((id) => expr(id, "scared", L.l03.end + 0.6));
}

/* S2 rear: the tank grows in the mirror — exterior */
const tankRig = (k) => `<g id="${k}-tank">${P(`${k}-tk`, K.tank(), 0, 1000, 760)}
   <defs><clipPath id="${k}-clip"><rect x="-200" y="-400" width="1400" height="${743 + 400}"/></clipPath></defs>
   <g clip-path="url(#${k}-clip)">${C(`${k}-mx`, R.maxim({ helmet: true, prop: "vodka", brow: "happy" }), 399, 743 + 128)}</g></g>`;
scene(
  "rear",
  `${room(K.highwayJam())}
   ${tankRig("rr")}
   ${P("rr-car", B.car({ lights: true, people: true }), 620, 1030, 400)}`,
  { bg: "#05070e" },
);
{
  const [a, b] = S.rear;
  camSet("rear", 700, 820, 1.25, a, 900);
  T(`tl.set("#rr-mx", {y:320}, ${r(a)});`);
  T(
    `tl.fromTo("#rr-tank", {x:-900, y:-60}, {x:-120, y:-40, duration:${r(b - a)}, ease:"power1.out", immediateRender:false}, ${r(a)});`,
  );
  spinWheels("#rr-tk .tw", a, b, 900);
  spinWheels("#rr-car .wheel", a, b, 900);
  T(
    `tl.fromTo("#zm-rear .jam", {x:0}, {x:500, duration:${r(b - a)}, ease:"none", immediateRender:false}, ${r(a)});`,
  );
  T(
    `tl.fromTo("#zm-rear .lane", {x:0}, {x:-300, duration:${r(b - a)}, ease:"none", immediateRender:false}, ${r(a)});`,
  );
  rumble("#sh-rear", a, b, 5);
  camTo("rear", 520, 760, 1.05, a + 0.3, b - a - 0.3, 900, "power1.inOut");
}

/* S3 cab: "Все пригнулись!" — everyone ducks */
scene("cab2", cabWorld("c2"), { bg: "#05070d" });
{
  const [a, b] = S.cab2;
  camSet("cab2", 540, 560, 1.5, a, 900);
  cabCommon("c2", a, b);
  ["c2-g", "c2-m", "c2-o", "c2-y"].forEach((id) => expr(id, "scared", a));
  talk("c2-g", "l05");
  gesture("c2-g", "rest", L.l05.start, 0.15);
  T(
    `tl.to("#c2-o, #c2-y, #c2-m", {y:70, duration:.25, ease:"power3.in", stagger:.05}, ${r(L.l05.end - 0.2)});`,
  );
  ["c2-m", "c2-o", "c2-y"].forEach((id) => gesture(id, "duck", L.l05.end - 0.25, 0.25));
  rumble("#sh-cab2", a, b, 6);
}

/* S4..S6 side by side: hatch opens, Ded Maxim in a tank helmet */
const sideWorld = (k) =>
  `${room(K.highwayJam())}${tankRig(k)}${P(`${k}-car`, B.car({ lights: true, people: true }), 620, 1030, 400)}`;
function sideCommon(k, a, b) {
  T(`tl.set("#${k}-tank", {x:-60, y:-40}, ${r(a)});`);
  spinWheels(`#${k}-tk .tw`, a, b, 900);
  spinWheels(`#${k}-car .wheel`, a, b, 900);
  T(
    `tl.fromTo("#zm-${k.replace("s", "side")} .jam", {x:0}, {x:500, duration:${r(b - a)}, ease:"none", immediateRender:false}, ${r(a)});`,
  );
  rumble(`#${k}-tk`, a, b, 3);
}
scene("side1", sideWorld("s1"), { bg: "#05070e" });
{
  const [a, b] = S.side1;
  camSet("side1", 560, 780, 1.1, a, 900);
  sideCommon("s1", a, b);
  T(`tl.set("#s1-mx", {y:320}, ${r(a)});`);
  // hatch flips open, he rises with his vodka
  T(
    `tl.to("#s1-tk .hatch", {rotation:-110, svgOrigin:"370 106", duration:.35, ease:"back.out(1.6)"}, ${r(a + 0.3)});`,
  );
  T(`tl.to("#s1-mx", {y:0, duration:.6, ease:"back.out(1.4)"}, ${r(a + 0.5)});`);
  expr("s1-mx", "happy", a);
  gesture("s1-mx", "vodka", a + 0.9, 0.3);
  camTo("side1", 400, 600, 2.3, a + 0.4, 0.8, 860, "power2.inOut");
  talk("s1-mx", "l06");
  gesture("s1-mx", "pointR", L.l06.start + 0.6, 0.25);
  blink("s1-mx", a, b);
}
scene("cab3", cabWorld("c3"), { bg: "#05070d" });
{
  const [a, b] = S.cab3;
  camSet("cab3", 340, 540, 2.1, a, 860);
  cabCommon("c3", a, b);
  ["c3-m", "c3-o", "c3-y"].forEach((id) => expr(id, "shock", a));
  expr("c3-g", "shock", a);
  pose("c3-g", "head", -14, a, 0.2);
  talk("c3-g", "l07");
}
scene("side2", sideWorld("s2"), { bg: "#05070e" });
{
  const [a, b] = S.side2;
  camSet("side2", 400, 600, 2.3, a, 860);
  sideCommon("s2", a, b);
  T(`tl.set("#s2-tk .hatch", {rotation:-110, svgOrigin:"370 106"}, ${r(a)});`);
  expr("s2-mx", "happy", a);
  gesture("s2-mx", "shrug", L.l08.start + 0.1, 0.25);
  gesture("s2-mx", "fist", W("говорил") - 0.1, 0.2);
  T(
    `tl.to("${part("s2-mx", "armR-lo")}", {keyframes:[{rotation:-10,duration:.14},{rotation:-60,duration:.14},{rotation:-10,duration:.14},{rotation:-60,duration:.14}], svgOrigin:"0 0"}, ${r(W("покажу") - 0.1)});`,
  );
  T(
    `tl.to("#s2-mx .body", {keyframes:[{y:-6,duration:.12},{y:0,duration:.12},{y:-6,duration:.12},{y:0,duration:.12}]}, ${r(L.l08.start + 0.2)});`,
  );
  talk("s2-mx", "l08");
  camTo("side2", 420, 640, 1.9, L.l08.start, b - L.l08.start, 880, "none");
  blink("s2-mx", a, b);
}
scene("cab4", cabWorld("c4"), { bg: "#05070d" });
{
  const [a, b] = S.cab4;
  camSet("cab4", 620, 560, 2.2, a, 860);
  cabCommon("c4", a, b);
  expr("c4-y", "happy", a);
  gesture("c4-y", "cheer", L.l09.start, 0.2);
  T(
    `tl.to("#c4-y .body", {keyframes:[{y:-14,duration:.15},{y:0,duration:.15},{y:-14,duration:.15},{y:0,duration:.15}]}, ${r(L.l09.start)});`,
  );
  talk("c4-y", "l09");
  camTo("cab4", 470, 540, 2.2, L.l10.start - 0.15, 0.4, 860, "power2.inOut");
  expr("c4-o", "happy", L.l10.start - 0.1);
  talk("c4-o", "l10");
  camTo("cab4", 770, 540, 2.2, L.l11.start - 0.15, 0.4, 860, "power2.inOut");
  expr("c4-m", "angry", L.l11.start - 0.1);
  gesture("c4-m", "pointR", L.l11.start + 0.1, 0.2);
  talk("c4-m", "l11");
  expr("c4-g", "happy", L.l11.end - 0.2);
}

/* S7 convoy: "Езжайте за мной!" — the tank shoves a burnt bus off the road */
scene(
  "side3",
  `${room(K.highwayJam())}
   <g id="bus">${P("bus-art", K.burntBus(), 1180, 1010, 520)}</g>
   ${tankRig("s3")}
   ${P("s3-car", B.car({ lights: true, people: true }), 620, 1030, 400)}`,
  { bg: "#05070e" },
);
{
  const [a, b] = S.side3;
  camSet("side3", 400, 640, 2.0, a, 880);
  T(`tl.set("#s3-tank", {x:-60, y:-40}, ${r(a)});`);
  T(`tl.set("#s3-tk .hatch", {rotation:-110, svgOrigin:"370 106"}, ${r(a)});`);
  expr("s3-mx", "happy", a);
  gesture("s3-mx", "wave", L.l12.start + 0.1, 0.25);
  talk("s3-mx", "l12");
  spinWheels("#s3-tk .tw", a, b, 2400);
  spinWheels("#s3-car .wheel", a, b, 1800);
  // tank pulls ahead, the camera follows to the bus
  T(
    `tl.to("#s3-tank", {x:420, y:30, duration:${r(L.l13.start - L.l12.end + 0.6)}, ease:"power1.in"}, ${r(L.l12.end - 0.3)});`,
  );
  T(`tl.to("#s3-car", {x:300, duration:${r(b - L.l12.end)}, ease:"none"}, ${r(L.l12.end)});`);
  camTo(
    "side3",
    1180,
    760,
    1.05,
    L.l12.end - 0.3,
    L.l13.start - L.l12.end + 0.4,
    900,
    "power2.inOut",
  );
  expr("s3-mx", "angry", L.l13.start - 0.2);
  talk("s3-mx", "l13");
  // impact
  T(
    `tl.to("#bus", {x:260, y:70, rotation:24, svgOrigin:"1440 1010", duration:.6, ease:"power2.out"}, ${r(W("металлолом") + 0.2)});`,
  );
  shake("#sh-side3", W("металлолом") + 0.2, 10, 18);
  rumble("#s3-tk", a, b, 3);
}

/* S8 checkpoint: "Чей танк?!" — "Мой, блядь!" */
scene(
  "check",
  `${room(K.checkpoint())}
   ${C("ck-s1", R.soldier(), 820, 900)}
   ${C("ck-s2", R.soldier({ brow: "worried" }), 960, 905)}
   ${tankRig("ck")}`,
  { bg: "#0a0d16" },
);
{
  const [a, b] = S.check;
  camSet("check", 880, 640, 1.6, a, 880);
  T(`tl.set("#ck-tank", {x:-500, y:-40}, ${r(a)});`);
  T(`tl.set("#ck-tk .hatch", {rotation:-110, svgOrigin:"370 106"}, ${r(a)});`);
  ["ck-s1", "ck-s2"].forEach((id) => expr(id, "angry", a));
  gesture("ck-s1", "pointR", L.l15.start, 0.2);
  talk("ck-s1", "l15");
  T(`tl.to("#ck-tank", {x:-60, duration:${r(L.l16.start - a)}, ease:"power2.out"}, ${r(a)});`);
  spinWheels("#ck-tk .tw", a, L.l16.start, 700);
  camTo("check", 560, 620, 1.35, L.l15.end, 0.5, 880, "power2.inOut");
  expr("ck-mx", "angry", a);
  gesture("ck-mx", "fist", L.l16.start + 0.1, 0.2);
  talk("ck-mx", "l16");
  ["ck-s1", "ck-s2"].forEach((id) => {
    expr(id, "shock", L.l16.start + 0.5);
    gesture(id, "handsUp", L.l16.start + 0.5, 0.25);
  });
  // barrier swings up, tank rolls through; soldier scratches his head
  T(
    `tl.to("#zm-check .barrier", {rotation:-80, svgOrigin:"700 770", duration:.5, ease:"power2.out"}, ${r(L.l16.end + 0.05)});`,
  );
  T(
    `tl.to("#ck-tank", {x:900, duration:${r(b - L.l16.end)}, ease:"power1.in"}, ${r(L.l16.end + 0.1)});`,
  );
  spinWheels("#ck-tk .tw", L.l16.end + 0.1, b, 1200);
  camTo("check", 900, 620, 1.9, L.l17.start - 0.2, 0.5, 880, "power2.inOut");
  gesture("ck-s2", "rest", L.l17.start - 0.2, 0.2);
  gesture("ck-s2", "headR", L.l17.start, 0.3);
  expr("ck-s2", "shock", L.l17.start);
  talk("ck-s2", "l17");
  ["ck-s1", "ck-s2"].forEach((id) => blink(id, a, b));
}

/* S9 grandparents' yard: parks on the swings */
scene(
  "yard",
  `${room(K.grannyYard())}
   ${P("yd-car", B.car({ lights: true }), -40, 1040, 380)}
   ${C("yd-m", R.masha(), 340, 1040)}
   ${C("yd-y", R.sonYoung(), 250, 1040)}
   ${tankRig("yd")}`,
  { bg: "#05070d" },
);
{
  const [a, b] = S.yard;
  camSet("yard", 620, 760, 1.05, a, 900);
  T(`tl.set("#yd-tank", {x:-700, y:60}, ${r(a)});`);
  T(`tl.set("#yd-tk .hatch", {rotation:-110, svgOrigin:"370 106"}, ${r(a)});`);
  T(
    `tl.to("#yd-tank", {x:380, duration:${r(L.l18.start - a + 0.2)}, ease:"power2.out"}, ${r(a)});`,
  );
  spinWheels("#yd-tk .tw", a, L.l18.start + 0.2, 700);
  T(
    `tl.to("#zm-yard .swings", {scaleY:.15, svgOrigin:"800 980", duration:.25, ease:"power3.in"}, ${r(L.l18.start - 0.25)});`,
  );
  shake("#sh-yard", L.l18.start - 0.1, 8, 10);
  expr("yd-mx", "happy", a);
  gesture("yd-mx", "vodka", L.l18.start + 0.2, 0.25);
  talk("yd-mx", "l18");
  camTo("yard", 620, 700, 1.6, L.l18.start, 0.6, 880, "power2.inOut");
  camTo("yard", 320, 700, 1.9, L.l19.start - 0.15, 0.45, 880, "power2.inOut");
  expr("yd-m", "angry", L.l19.start);
  gesture("yd-m", "pointR", L.l19.start + 0.1, 0.2);
  talk("yd-m", "l19");
  expr("yd-y", "scared", a);
  camTo("yard", 780, 640, 2.2, L.l20.start - 0.15, 0.5, 860, "power2.inOut");
  expr("yd-mx", "sad", L.l20.start - 0.1);
  gesture("yd-mx", "rest", L.l20.start, 0.4);
  talk("yd-mx", "l20");
  ["yd-m", "yd-y", "yd-mx"].forEach((id) => blink(id, a, b));
}

/* S10 the lift is dead */
scene("lift", `${room(K.liftLobby())}`, { bg: "#2e3a3a" });
camSet("lift", 540, 520, 1.6, S.lift[0], 880);
camTo("lift", 540, 520, 2.1, S.lift[0], S.lift[1] - S.lift[0], 880, "power2.out");
T(
  `tl.fromTo("#zm-lift .sign", {rotation:-4, svgOrigin:"540 470"}, {keyframes:[{rotation:3,duration:.3},{rotation:-3,duration:.3},{rotation:-4,duration:.3}], immediateRender:false}, ${r(S.lift[0])});`,
);

/* S11 the climb: floors tick 2 → 9, Gleb carries the little one, Maxim wheezes */
const floors = [2, 3, 4, 5, 6, 7, 8, 9];
scene(
  "climb",
  `${floors.map((f, i) => `<g id="cl-${f}" opacity="${i ? 0 : 1}">${room(A.stairwell({ floor: f }))}</g>`).join("")}
   <g id="cl-grp">
     ${C("cl-mx", R.maxim({ brow: "worried", prop: "" }), 520, 665)}
     ${C("cl-o", R.sonOld(), 620, 606)}
     ${C("cl-m", R.masha({ prop: "bag" }), 720, 547)}
     <g id="cl-gy">${C("cl-g", GLEB(), 820, 488)}<g id="cl-yw">${C("cl-y", R.sonYoung(), 820, 333)}</g></g>
   </g>`,
  { bg: "#2a3a3a" },
);
{
  const [a, b] = S.climb;
  camSet("climb", 680, 470, 1.3, a, 900);
  const step = (b - a) / floors.length;
  floors.forEach((f, i) => {
    const t0 = a + i * step;
    if (i) {
      show(`#cl-${f}`, t0);
      hide(`#cl-${floors[i - 1]}`, t0);
    }
    T(
      `tl.fromTo("#cl-grp", {x:-150, y:115}, {x:110, y:-85, duration:${r(step)}, ease:"none", immediateRender:false}, ${r(t0)});`,
    );
  });
  ["cl-mx", "cl-o", "cl-m", "cl-g"].forEach((id) => walk(id, a, b - 0.1, 0, 0, 0.36, 18));
  T(
    `tl.set("${part("cl-y", "legL")}", {rotation:-70, svgOrigin:"0 0"}, ${r(a)}); tl.set("${part("cl-y", "legR")}", {rotation:70, svgOrigin:"0 0"}, ${r(a)});`,
  );
  gesture("cl-g", "headR", a, 0.01); // hand steadying the boy
  expr("cl-y", "cry", a);
  expr("cl-g", "tired", a);
  expr("cl-mx", "pain", a);
  expr("cl-o", "tired", a);
  expr("cl-m", "tired", a);
  // little one gets lifted onto the shoulders when he gives up
  T(`tl.set("#cl-yw", {y:150}, ${r(a)});`);
  T(`tl.to("#cl-yw", {y:0, duration:.4, ease:"back.out(1.5)"}, ${r(L.l22.start - 0.2)});`);
  talk("cl-y", "l21");
  expr("cl-g", "happy", L.l22.start);
  talk("cl-g", "l22");
  expr("cl-y", "happy", L.l22.end);
  camTo("climb", 520, 520, 1.9, L.l23.start - 0.2, 0.5, 880, "power2.inOut");
  gesture("cl-mx", "shrug", L.l23.start + 0.3, 0.3);
  talk("cl-mx", "l23");
  camTo("climb", 620, 470, 1.9, L.l24.start - 0.15, 0.4, 880, "power2.inOut");
  expr("cl-o", "happy", L.l24.start);
  talk("cl-o", "l24");
  camTo("climb", 530, 520, 1.9, L.l25.start - 0.15, 0.4, 880, "power2.inOut");
  expr("cl-mx", "angry", L.l25.start);
  gesture("cl-mx", "pointR", L.l25.start + 0.1, 0.2);
  talk("cl-mx", "l25");
  ["cl-o", "cl-m", "cl-g"].forEach((id) => blink(id, a, b));
}

/* S12 tenth floor: the door is open… */
scene(
  "door",
  `${room(K.corridor10())}
   ${C("dr-m", R.masha({ prop: "bag" }), 360, 1040)}
   ${C("dr-g", GLEB(), 560, 1000)}
   <g id="dr-eyes" opacity="0"><circle cx="700" cy="560" r="4" fill="#ffe9a8"/><circle cx="720" cy="560" r="4" fill="#ffe9a8"/></g>
   <rect id="dr-black" x="-500" y="-500" width="2080" height="2920" fill="#000" opacity="0"/>`,
  { bg: "#141820" },
);
{
  const [a] = S.door;
  camSet("door", 540, 560, 1.3, a, 880);
  expr("dr-g", "scared", a);
  expr("dr-m", "scared", a);
  walk("dr-g", a, L.l26.start + 0.3, 80, -40, 0.4, 12);
  walk("dr-m", a + 0.2, L.l26.start + 0.5, 60, -30, 0.4, 12);
  camTo("door", 620, 560, 1.8, a, L.l27.end - a, 880, "power1.inOut");
  talk("dr-g", "l26");
  talk("dr-m", "l27");
  // he pushes the door; a click in the dark; two glints
  gesture("dr-g", "pointR", L.l27.end + 0.1, 0.4);
  T(
    `tl.to("#zm-door .door", {scaleX:.35, svgOrigin:"640 580", duration:1.0, ease:"power1.inOut"}, ${r(L.l27.end + 0.3)});`,
  );
  T(
    `tl.fromTo("#dr-eyes", {opacity:0}, {opacity:1, duration:.15, immediateRender:false}, ${r(L.l28.start - 0.2)});`,
  );
  camTo("door", 710, 560, 3.2, L.l27.end + 0.4, L.l28.end - L.l27.end - 0.2, 860, "power2.in");
  expr("dr-g", "shock", L.l28.start);
  T(`tl.to("#dr-black", {opacity:1, duration:.08}, ${r(CUT - 0.1)});`);
  ["dr-g", "dr-m"].forEach((id) => blink(id, a, L.l28.start));
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
  soldier: ["СОЛДАТ", "#c9d48a"],
  voice: ["???", "#ff4a3d"],
};
const HOT = new Set(
  "бабушка дедушкой танк танк?! взял военкомата покажу прокати лучший колонной ветерком металлолом выкупил паркуюсь дети десятый лестница сам".split(
    " ",
  ),
);
const DANGER = new Set("ёб блядь сука стреляю открыта стоять".split(" "));
const hook = `<div id="hook" class="clip toptitle" data-start="0.2" data-duration="${r(L.l01.start - 0.1)}" data-track-index="2" style="z-index:5"><div class="tt-s">${spl("ГЛЕБ", "hs")}</div><div class="tt-a">${spl("ЧАСТЬ 3", "ha")}</div></div>`;
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
const stamps = stamp("fl10", r(L.l25.end + 0.2), S.climb[1], "10 ЭТАЖ", "#ffcf7a");
const title = `<div id="tbc" class="clip" data-start="${TITLE[0]}" data-duration="${r(TITLE[1] - TITLE[0])}" data-track-index="4" style="z-index:8"><div id="tbc-a">${spl("ПРОДОЛЖЕНИЕ СЛЕДУЕТ…", "ta")}</div><div id="tbc-b">ЧАСТЬ 4</div></div>`;
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
const tankOn = [L.l03.end + 0.1, S.check[1]];
const sfx = [
  ["boom1", W("металлолом") + 0.2, 3.4, 0.7],
  ["glass", W("металлолом") + 0.25, 0.6, 0.8],
  ["boom2", L.l18.start - 0.15, 4.1, 0.5],
  ["door", S.door[1] - 1.2, 0.35, 0.6],
  ["click", L.l28.start - 0.25, 0.06, 1.4],
];
const audio = [
  `<audio id="vo" class="clip" src="assets/vo.wav" data-start="0" data-duration="${r(L.l28.end + 0.1)}" data-track-index="10" data-volume="1"></audio>`,
  `<audio id="eng" class="clip" src="${SFX}/engine.wav" data-start="0" data-duration="${r(Math.min(24, S.check[1]))}" data-track-index="11" data-volume="0.45"></audio>`,
  `<audio id="tank" class="clip" src="${SFX}/tank.wav" data-start="${r(tankOn[0])}" data-duration="${r(Math.min(40, tankOn[1] - tankOn[0]))}" data-track-index="11" data-volume="0.8"></audio>`,
  `<audio id="room" class="clip" src="${SFX}/room_night.wav" data-start="${S.yard[0]}" data-duration="${r(Math.min(31, CUT - S.yard[0]))}" data-track-index="11" data-volume="0.7"></audio>`,
  ...sfx.map(
    ([f, at, d, v], i) =>
      `<audio id="sfx${i}" class="clip" src="${SFX}/${f}.wav" data-start="${r(at)}" data-duration="${r(Math.min(d, CUT - at))}" data-track-index="${12 + (i % 3)}" data-volume="${v}"></audio>`,
  ),
];

const html = `<!doctype html>
<html lang="ru">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=1080, height=1920" />
<title>Глеб — часть 3</title>
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
