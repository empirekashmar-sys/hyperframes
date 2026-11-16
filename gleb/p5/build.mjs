// "Глеб — часть 5": the tank rams the truck; Maxim in uniform frees the family; ten tanks ahead.
// Run from gleb/p5: node build.mjs → index.html (sfx shared via assets/sfx symlink).
import fs from "node:fs";
import * as R from "../art/rig.js";
import * as K from "../p3/art3.js";
import * as F from "../p4/art4.js";
import * as F5 from "./art5.js";

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
const CUT = r(L.l27.end + 1.4);
const TITLE = [CUT, r(CUT + 3.2)];
const CARD_START = r(TITLE[1] + 0.1);
const CARD_DUR = 3.6;
const TOTAL = r(CARD_START + CARD_DUR);
const S = {};
{
  const ends = [
    ["inside", L.l05.end + 1.2],
    ["chase", L.l08.end + 0.35],
    ["flip", L.l10.end + 0.4],
    ["arm", L.l13.end + 0.45],
    ["interrog", L.l16.end + 0.6],
    ["family", L.l20.end + 0.5],
    ["decide", L.l23.end + 0.8],
    ["ride", L.l24.end + 0.4],
    ["column", CUT],
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
const hide = (sel, at) => T(`tl.set("${sel}", {opacity:0}, ${r(at)});`);
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
const GLEB = (o = {}) => R.gleb({ injured: true, ...o });
const spinWheels = (sel, t0, t1, deg = 1440) =>
  T(
    `tl.to("${sel}", {rotation:"+=${deg}", transformOrigin:"50% 50%", duration:${r(t1 - t0)}, ease:"none"}, ${r(t0)});`,
  );

/* soldiers face left: mirror them around their feet */
const faceLeft = (id, cx, foot, at) =>
  T(`tl.set("#${id}", {scaleX:-1, svgOrigin:"${cx} ${foot}"}, ${r(at)});`);
const MASK = (o = {}) => R.soldier({ mask: true, ...o });

const sway = (sel, t0, t1, amp = 6, step = 0.22) => {
  const n = Math.max(2, Math.round((t1 - t0) / step));
  T(
    `tl.to("${sel}", {keyframes:${JSON.stringify(Array.from({ length: n }, (_, i) => ({ y: (i % 3 === 0 ? -1 : i % 3 === 1 ? 1 : 0.4) * amp, rotation: ((i % 4) - 1.5) * 0.25, duration: step })).concat([{ y: 0, rotation: 0, duration: 0.1 }]))}, svgOrigin:"540 900"}, ${r(t0)});`,
  );
};
const rumble = (sel, t0, t1, amp = 3) => {
  const n = Math.max(2, Math.round((t1 - t0) / 0.08));
  T(
    `tl.to("${sel}", {keyframes:${JSON.stringify(Array.from({ length: n }, (_, i) => ({ y: i % 2 ? -amp : amp * 0.4, duration: 0.08 })).concat([{ y: 0, duration: 0.05 }]))}}, ${r(t0)});`,
  );
};
const loopX = (sel, dx, period, t0, t1) =>
  T(
    `tl.fromTo("${sel}", {x:0}, {x:${dx}, duration:${period}, ease:"none", repeat:${Math.max(0, Math.round((t1 - t0) / period) - 1)}, immediateRender:false}, ${r(t0)});`,
  );
const flash = (sel, at, peak = 0.9, dur = 0.5) =>
  T(
    `tl.fromTo("${sel}", {opacity:${peak}}, {opacity:0, duration:${dur}, immediateRender:false}, ${r(at)});`,
  );
const puffs = (k, t0, t1) =>
  T(
    `tl.fromTo("#zm-${k} .puff", {y:0, scale:.8, transformOrigin:"50% 50%"}, {y:-160, scale:1.4, duration:${r(t1 - t0)}, ease:"none", stagger:.15, immediateRender:false}, ${r(t0)});`,
  );
const flicker = (k, t0, t1) => {
  const n = Math.max(2, Math.round((t1 - t0) / 0.14));
  T(
    `tl.to("#zm-${k} .fire", {keyframes:${JSON.stringify(Array.from({ length: n }, (_, i) => ({ scaleY: 1 + ((i * 7) % 5) * 0.06, scaleX: 1 - ((i * 3) % 4) * 0.03, duration: 0.14 })))}, transformOrigin:"50% 100%"}, ${r(t0)});`,
  );
};
const MX = (o = {}) => R.maxim({ uniform: true, helmet: true, prop: "rifle", ...o });
const GA = (o = {}) => R.gleb({ injured: true, armor: true, prop: "rifle", ...o });
const LOOSE_RIFLE = `<g><rect x="-70" y="-8" width="120" height="14" rx="3" fill="#2a2a2a" stroke="#0b0d14" stroke-width="2"/><rect x="-96" y="-6" width="30" height="20" rx="4" fill="#5a4030" stroke="#0b0d14" stroke-width="2"/><rect x="-30" y="4" width="12" height="28" rx="3" fill="#2a2a2a" stroke="#0b0d14" stroke-width="2"/><rect x="48" y="-4" width="26" height="6" fill="#2a2a2a"/></g>`;
const LOOSE_VEST = `<g><path d="M-36 -60 Q0 -74 36 -60 L38 52 Q0 66 -38 52Z" fill="#3a4430" stroke="#0b0d14" stroke-width="2.4"/><rect x="-28" y="-10" width="22" height="26" rx="3" fill="#2a3022"/><rect x="6" y="-10" width="22" height="26" rx="3" fill="#2a3022"/></g>`;
const ROAD = () => room(K.highwayJam()).replace('<g class="jam">', '<g class="jam" opacity="0">');

/* tank with a hatch slot for the commander (Maxim rises out of it) */
const tankSlot = (k, x, foot, w, mx = MX()) => {
  const kk = w / 800;
  const hx = r(x + 420 * kk);
  const hy = r(foot - 270 * kk);
  return `<g id="${k}-tank">${P(`${k}-tk`, K.tank(), x, foot, w)}
   <defs><clipPath id="${k}-clip"><rect x="${x - 200}" y="-600" width="${w + 400}" height="${hy + 600}"/></clipPath></defs>
   <g clip-path="url(#${k}-clip)"><g id="${k}-mxw">${C(`${k}-mx`, mx, hx, r(hy + 128 * (kk / 0.95)))}</g></g></g>`;
};
/* the overturned truck by the road, with smoke and fire */
const wreck = (
  k,
) => `<g id="${k}-wreck"><g transform="translate(0 52) rotate(180 820 863)">${P(`${k}-tr`, F.truck(), 520, 1010, 600)}</g>
   ${F5.smoke(860, 700, 6)}${F5.fire(760, 800, 0.9)}${F5.fire(980, 790, 0.7)}</g>`;
/* sitting pose for a front-facing rig (knees out) */
const sit = (id, at) => {
  pose(id, "legL", 55, at, 0.01);
  pose(id, "legL-lo", -80, at, 0.01);
  pose(id, "legR", -55, at, 0.01);
  pose(id, "legR-lo", 80, at, 0.01);
  T(`tl.set("#${id}", {y:70}, ${r(at)});`);
};

/* S1 inside the truck: shaking, whispering; then headlights in the dark behind them */
scene(
  "inside",
  `${room(F5.truckInside())}
   ${C("in-g", GLEB(), 200, 1030)}
   ${C("in-y", R.sonYoung(), 320, 1000)}
   ${C("in-m", R.masha(), 770, 1035)}
   ${C("in-o", R.sonOld(), 895, 1040)}
   ${room(F5.benchFront())}`,
  { bg: "#2c3122" },
);
{
  const [a, b] = S.inside;
  camSet("inside", 540, 640, 1.3, a, 900);
  sway("#sh-inside", a, b, 5);
  ["in-g", "in-y", "in-m", "in-o"].forEach((id) => {
    expr(id, "scared", a);
    sway(`#${id} .body`, a + 0.1, b, 3, 0.3);
  });
  expr("in-g", "sad", a);
  T(
    `tl.fromTo("#zm-inside .lane", {strokeDashoffset:0}, {strokeDashoffset:-560, duration:${r(b - a)}, ease:"none", immediateRender:false}, ${r(a)});`,
  );
  camTo("inside", 540, 600, 1.5, a + 0.2, L.l01.end - a, 900, "sine.inOut");
  // little one asks
  camTo("inside", 270, 640, 2.1, L.l02.start - 0.25, 0.5, 880, "power2.inOut");
  expr("in-y", "cry", L.l02.start - 0.1);
  T(
    `tl.to("#in-y .body", {keyframes:[{y:-3,duration:.12},{y:0,duration:.16},{y:-3,duration:.12},{y:0,duration:.16}]}, ${r(L.l02.start)});`,
  );
  talk("in-y", "l02");
  pose("in-y", "head", 10, L.l02.start + 0.2, 0.3);
  // Gleb pulls him close
  camTo("inside", 250, 620, 2.2, L.l03.start - 0.2, 0.4, 880, "power2.inOut");
  expr("in-g", "determined", L.l03.start);
  pose("in-g", "armR", -60, L.l03.start + 0.1, 0.35);
  pose("in-g", "armR-lo", -40, L.l03.start + 0.1, 0.35);
  T(`tl.to("#in-g", {x:30, duration:.4}, ${r(L.l03.start + 0.1)});`);
  talk("in-g", "l03");
  T(
    `tl.to("#in-g .head", {rotation:8, transformOrigin:"50% 92%", duration:.3}, ${r(L.l03.end - 0.4)});`,
  );
  // Masha: where is Maxim?
  camTo("inside", 790, 640, 2.1, L.l04.start - 0.25, 0.5, 880, "power2.inOut");
  gesture("in-m", "headR", L.l04.start + 0.3, 0.35);
  talk("in-m", "l04");
  // the older one hears something
  camTo("inside", 880, 620, 2.2, L.l05.start - 0.2, 0.4, 880, "power2.inOut");
  expr("in-o", "shock", L.l05.start);
  pose("in-o", "head", -14, L.l05.start + 0.1, 0.3);
  gesture("in-o", "pointR", L.l05.start + 0.7, 0.25);
  talk("in-o", "l05");
  // headlights grow in the back opening
  T(
    `tl.fromTo("#zm-inside .lights", {opacity:0, scale:.4, svgOrigin:"540 560"}, {opacity:1, scale:1.8, svgOrigin:"540 560", duration:${r(b - L.l05.start)}, ease:"power2.in", immediateRender:false}, ${r(L.l05.start)});`,
  );
  camTo("inside", 540, 560, 2.6, L.l05.end - 0.3, b - L.l05.end + 0.3, 880, "power2.in");
  ["in-g", "in-y", "in-m", "in-o"].forEach((id) => expr(id, "shock", L.l05.end));
  ["in-g", "in-y", "in-m", "in-o"].forEach((id) => blink(id, a, b));
}

/* S2 the chase on the highway: the tank rams the truck, fires, the truck flips */
scene(
  "chase",
  `${ROAD()}
   <g id="ch-tkg">${P("ch-tk", K.tank(), -40, 1016, 560)}</g>
   <g id="ch-trg"><g id="ch-tr">${P("ch-tra", F.truck(), 360, 1010, 640)}
     <defs><clipPath id="ch-win"><rect x="830" y="840" width="82" height="51"/></clipPath></defs>
     <g clip-path="url(#ch-win)">
       <g transform="translate(852 872) scale(.45)">${C("ch-s1", MASK(), 0, 327)}</g>
       <g transform="translate(900 876) scale(.45)">${C("ch-s2", MASK(), 0, 327)}</g>
     </g></g></g>
   <circle id="ch-muzzle" cx="572" cy="842" r="60" fill="#fff2a8" opacity="0"/>
   <g id="ch-hit" opacity="0"><path d="M560 720 L600 840 L720 800 L640 890 L760 960 L620 950 L600 1080 L550 970 L430 1040 L490 920 L380 860 L510 860Z" fill="#ff8a2b"/><path d="M560 790 L585 865 L660 850 L610 900 L680 945 L600 940 L585 1010 L555 945 L490 985 L525 915 L460 880 L535 875Z" fill="#ffe27a"/></g>
   <rect id="ch-white" x="-800" y="-800" width="2680" height="3520" fill="#fff6e0" opacity="0"/>`,
  { bg: "#05070d" },
);
{
  const [a, b] = S.chase;
  const hit = W("удар");
  const shot = W("выстрел");
  const flip = W("перевернулся");
  camSet("chase", 560, 860, 1.25, a, 900);
  loopX("#zm-chase .poles", -200, 0.32, a, b);
  T(
    `tl.fromTo("#zm-chase .lane", {strokeDashoffset:0}, {strokeDashoffset:-${Math.round((b - a) * 600)}, duration:${r(b - a)}, ease:"none", immediateRender:false}, ${r(a)});`,
  );
  spinWheels("#ch-tra .wheel", a, flip, 3600);
  spinWheels("#ch-tk .tw", a, b, 3600);
  rumble("#ch-tr", a, flip, 2.5);
  rumble("#ch-tk", a, b, 2);
  T(`tl.set("#ch-tkg", {x:-700}, ${r(a)});`);
  T(`tl.to("#ch-tkg", {x:-260, duration:${r(L.l06.start - a)}, ease:"power1.out"}, ${r(a)});`);
  ["ch-s1", "ch-s2"].forEach((id) => expr(id, "scared", a));
  // the cab window: the soldiers panic
  camTo("chase", 873, 868, 7.0, L.l06.start - 0.3, 0.45, 860, "power2.inOut");
  pose("ch-s1", "head", -18, L.l06.start, 0.2);
  talk("ch-s1", "l06");
  expr("ch-s1", "shock", L.l06.start);
  T(
    `tl.to("#ch-tkg", {x:-150, duration:${r(L.l07.end - L.l06.start)}, ease:"none"}, ${r(L.l06.start)});`,
  );
  talk("ch-s2", "l07");
  pose("ch-s2", "head", 14, L.l07.start, 0.2);
  // wide: impact, shot, flip
  camTo("chase", 480, 880, 1.6, L.l07.end - 0.1, 0.4, 900, "power2.out");
  T(`tl.to("#ch-tkg", {x:20, duration:.22, ease:"power3.in"}, ${r(hit - 0.2)});`);
  T(`tl.to("#ch-tr", {x:60, duration:.18, ease:"power2.out"}, ${r(hit)});`);
  shake("#sh-chase", hit, 8, 18);
  T(`tl.to("#ch-tkg", {x:-40, duration:.4, ease:"power2.out"}, ${r(hit + 0.1)});`);
  T(`tl.to("#ch-tk .turret", {keyframes:[{x:-16,duration:.06},{x:0,duration:.4}]}, ${r(shot)});`);
  T(`tl.set("#ch-muzzle", {x:-40}, ${r(shot)});`);
  flash("#ch-muzzle", shot, 1, 0.25);
  flash("#ch-hit", shot + 0.05, 0.95, 0.6);
  shake("#sh-chase", shot + 0.05, 10, 26);
  T(
    `tl.to("#ch-trg", {rotation:200, svgOrigin:"700 880", y:-140, x:120, duration:${r(Math.max(0.5, b - flip - 0.05))}, ease:"power2.in"}, ${r(flip - 0.25)});`,
  );
  camTo("chase", 700, 860, 1.6, flip - 0.25, b - flip + 0.25, 900, "power2.in");
  T(`tl.to("#ch-white", {opacity:1, duration:.25}, ${r(b - 0.3)});`);
  ["ch-s1", "ch-s2"].forEach((id) => blink(id, a, b));
}

/* S3 the wreck: the tank stops, the hatch opens — Maxim in uniform with a rifle */
scene(
  "flip",
  `${ROAD()}
   <g id="fl-tg">${tankSlot("fl", -200, 1000, 760)}</g>
   ${wreck("fl")}
   ${C("fl-s1", MASK(), 640, 1090)}
   ${C("fl-s2", MASK(), 780, 1100)}
   <circle id="fl-gun" cx="0" cy="0" r="26" fill="#fff2a8" opacity="0"/>
   <rect id="fl-white" x="-800" y="-800" width="2680" height="3520" fill="#fff6e0" opacity="0"/>`,
  { bg: "#05070d" },
);
{
  const [a, b] = S.flip;
  flash("#fl-white", a, 1, 0.7);
  camSet("flip", 760, 820, 1.5, a, 900);
  puffs("flip", a, b);
  flicker("flip", a, b);
  T(`tl.set("#fl-mxw", {y:340}, ${r(a)});`);
  T(`tl.set("#fl-tg", {x:-260}, ${r(a)});`);
  ["fl-s1", "fl-s2"].forEach((id) => {
    faceLeft(id, id === "fl-s1" ? 640 : 780, id === "fl-s1" ? 1090 : 1100, a);
    expr(id, "pain", a);
    T(
      `tl.fromTo("#${id}", {y:60, rotation:12, transformOrigin:"50% 100%"}, {y:0, rotation:0, duration:.9, ease:"power2.out", immediateRender:false}, ${r(a + 0.4)});`,
    );
  });
  // the tank rolls up
  T(`tl.to("#fl-tg", {x:0, duration:0.9, ease:"power2.out"}, ${r(a + 0.1)});`);
  spinWheels("#fl-tk .tw", a + 0.1, a + 1.0, 500);
  camTo("flip", 300, 760, 1.2, a + 0.4, 0.8, 900, "power2.inOut");
  const hatch = L.l09.start - 1.3;
  T(
    `tl.to("#fl-tk .hatch", {rotation:-110, svgOrigin:"370 106", duration:.3, ease:"back.out(1.6)"}, ${r(hatch)});`,
  );
  T(`tl.to("#fl-mxw", {y:0, duration:.6, ease:"back.out(1.4)"}, ${r(hatch + 0.3)});`);
  camTo("flip", 199, 640, 2.3, hatch, 0.9, 880, "power2.inOut");
  expr("fl-mx", "angry", a);
  // warning burst into the air
  gesture("fl-mx", "fist", L.l09.start - 0.35, 0.2);
  T(`tl.set("#fl-gun", {x:270, y:520}, ${r(L.l09.start - 0.2)});`);
  [0, 0.12, 0.24, 0.36].forEach((d) => flash("#fl-gun", L.l09.start - 0.2 + d, 1, 0.08));
  shake("#sh-flip", L.l09.start - 0.2, 6, 8);
  talk("fl-mx", "l09");
  gesture("fl-mx", "pointR", L.l09.start + 0.5, 0.2);
  ["fl-s1", "fl-s2"].forEach((id) => {
    expr(id, "scared", L.l09.start);
    gesture(id, "handsUp", L.l09.start + 0.15, 0.2);
    gesture(id, "headBoth", W("голову") + 0.1, 0.25);
  });
  camTo("flip", 560, 760, 1.4, W("суки") - 0.1, 0.5, 900, "power2.inOut");
  camTo("flip", 680, 740, 2.0, L.l10.start - 0.2, 0.4, 880, "power2.inOut");
  T(`tl.to("#fl-s1", {y:30, duration:.25, ease:"power2.in"}, ${r(L.l10.start)});`);
  talk("fl-s1", "l10");
  ["fl-mx", "fl-s1", "fl-s2"].forEach((id) => blink(id, a, b));
}

/* S4 Maxim hands Gleb a rifle and a vest */
scene(
  "arm",
  `${ROAD()}
   <g id="ar-tg">${tankSlot("ar", -200, 1000, 760)}</g>
   ${wreck("ar")}
   ${C("ar-s1", MASK(), 700, 1090)}
   ${C("ar-s2", MASK(), 820, 1100)}
   ${C("ar-o", R.sonOld(), 1190, 1110)}
   ${C("ar-m", R.masha(), 1080, 1100)}
   ${C("ar-y", R.sonYoung(), 1270, 1120)}
   <g id="ar-g">${C("ar-gr", GLEB(), 950, 1110)}</g>
   <g id="ar-ga" opacity="0">${C("ar-gar", GA(), 950, 1110)}</g>
   ${C("ar-mx", MX(), 330, 1110)}
   <g id="ar-rifle" opacity="0"><g transform="translate(470 880)">${LOOSE_RIFLE}</g></g>
   <g id="ar-vest" opacity="0"><g transform="translate(420 840)">${LOOSE_VEST}</g></g>
   <circle id="ar-puff" cx="950" cy="880" r="150" fill="#fff" opacity="0"/>`,
  { bg: "#05070d" },
);
{
  const [a, b] = S.arm;
  camSet("arm", 660, 780, 1.05, a, 920);
  puffs("arm", a, b);
  flicker("arm", a, b);
  T(`tl.set("#ar-mxw", {y:340}, ${r(a)});`);
  T(`tl.set("#ar-tk .hatch", {rotation:-110, svgOrigin:"370 106"}, ${r(a)});`);
  [
    ["ar-s1", 700, 1090],
    ["ar-s2", 820, 1100],
  ].forEach(([id, cx, f]) => {
    faceLeft(id, cx, f, a);
    expr(id, "scared", a);
    gesture(id, "headBoth", a, 0.01);
  });
  ["ar-o", "ar-m", "ar-y"].forEach((id) => expr(id, "shock", a));
  expr("ar-gr", "shock", a);
  expr("ar-mx", "determined", a);
  // Maxim strides over to Gleb
  walk("ar-mx", a + 0.1, L.l11.start + 0.2, 70, 0, 0.3, 20, false);
  camTo("arm", 700, 760, 1.5, L.l11.start - 0.3, 0.6, 900, "power2.inOut");
  talk("ar-mx", "l11");
  // "Держи" — the rifle flies to Gleb
  const give = W("держи");
  T(`tl.set("#ar-rifle", {opacity:1, x:-50}, ${r(give - 0.1)});`);
  T(
    `tl.to("#ar-rifle", {keyframes:[{x:220, y:-120, rotation:-180, duration:.3, ease:"power1.out"},{x:470, y:0, rotation:-360, duration:.3, ease:"power1.in"}], svgOrigin:"470 880"}, ${r(give)});`,
  );
  gesture("ar-gr", "open", give + 0.45, 0.15);
  T(`tl.set("#ar-rifle", {opacity:0}, ${r(give + 0.62)});`);
  // "броник" — the vest; Gleb is suited up
  const vest = W("броник");
  T(`tl.set("#ar-vest", {opacity:1, x:0}, ${r(vest - 0.1)});`);
  T(
    `tl.to("#ar-vest", {keyframes:[{x:270, y:-120, rotation:-90, duration:.28},{x:530, y:40, rotation:0, duration:.28}], svgOrigin:"420 840"}, ${r(vest)});`,
  );
  T(`tl.set("#ar-vest", {opacity:0}, ${r(vest + 0.58)});`);
  flash("#ar-puff", vest + 0.56, 0.8, 0.4);
  hide("#ar-g", vest + 0.58);
  show("#ar-ga", vest + 0.58);
  expr("ar-gar", "shock", a);
  T(
    `tl.fromTo("#ar-ga", {scale:1.08, svgOrigin:"950 1110"}, {scale:1, svgOrigin:"950 1110", duration:.3, ease:"back.out(2)", immediateRender:false}, ${r(vest + 0.58)});`,
  );
  // Gleb: where did you get the uniform?!
  camTo("arm", 950, 760, 2.0, L.l12.start - 0.25, 0.45, 880, "power2.inOut");
  gesture("ar-gar", "shrug", L.l12.start + 0.2, 0.3);
  talk("ar-gar", "l12");
  // Maxim, proud
  camTo("arm", 420, 740, 2.0, L.l13.start - 0.25, 0.45, 880, "power2.inOut");
  expr("ar-mx", "happy", L.l13.start);
  gesture("ar-mx", "cheer", W("лежала") - 0.1, 0.3);
  gesture("ar-mx", "open", W("размеру"), 0.3);
  T(
    `tl.to("#ar-mx .body", {keyframes:[{y:-14,duration:.15},{y:0,duration:.2},{y:-10,duration:.15},{y:0,duration:.2}]}, ${r(W("шили"))});`,
  );
  talk("ar-mx", "l13");
  expr("ar-gar", "happy", L.l13.start + 1.5);
  ["ar-mx", "ar-gr", "ar-gar", "ar-o", "ar-m", "ar-s1", "ar-s2"].forEach((id) => blink(id, a, b));
}

/* S5 the interrogation */
scene(
  "interrog",
  `${ROAD()}
   <g>${tankSlot("iq", -200, 1000, 760)}</g>
   ${wreck("iq")}
   ${C("iq-s1", MASK(), 720, 1090)}
   ${C("iq-s2", MASK(), 840, 1100)}
   ${C("iq-m", R.masha(), 1130, 1100)}
   ${C("iq-o", R.sonOld(), 1240, 1110)}
   ${C("iq-g", GA(), 1010, 1110)}
   ${C("iq-mx", MX(), 380, 1110)}`,
  { bg: "#05070d" },
);
{
  const [a, b] = S.interrog;
  camSet("interrog", 600, 760, 1.5, a, 900);
  puffs("interrog", a, b);
  flicker("interrog", a, b);
  T(`tl.set("#iq-mxw", {y:340}, ${r(a)});`);
  T(`tl.set("#iq-tk .hatch", {rotation:-110, svgOrigin:"370 106"}, ${r(a)});`);
  [
    ["iq-s1", 720, 1090],
    ["iq-s2", 840, 1100],
  ].forEach(([id, cx, f]) => {
    faceLeft(id, cx, f, a);
    expr(id, "scared", a);
    gesture(id, "headBoth", a, 0.01);
  });
  expr("iq-g", "determined", a);
  expr("iq-mx", "angry", a);
  expr("iq-m", "scared", a);
  expr("iq-o", "neutral", a);
  // he walks up to them, slowly
  walk("iq-mx", a + 0.1, L.l14.start + 0.6, 150, 0, 0.36, 18, false);
  camTo("interrog", 620, 740, 1.9, a + 0.2, L.l14.start - a + 0.4, 880, "sine.inOut");
  T(
    `tl.to("#iq-mx .head", {rotation:-10, transformOrigin:"50% 92%", duration:.3}, ${r(W("сука", 1, L.l14.start))});`,
  );
  T(`tl.to("#iq-mx", {x:"+=30", duration:.15, ease:"power2.out"}, ${r(W("пизда"))});`);
  shake("#sh-interrog", W("пизда"), 4, 6);
  gesture("iq-mx", "pointR", W("откуда"), 0.2);
  talk("iq-mx", "l14");
  ["iq-s1", "iq-s2"].forEach((id) =>
    T(`tl.to("#${id}", {y:14, duration:.2, yoyo:true, repeat:1}, ${r(W("пизда"))});`),
  );
  // soldier mumbles
  camTo("interrog", 840, 740, 2.4, L.l15.start - 0.2, 0.4, 880, "power2.inOut");
  pose("iq-s2", "head", 10, L.l15.start, 0.25);
  talk("iq-s2", "l15");
  // the potato rant
  camTo("interrog", 560, 740, 2.1, L.l16.start - 0.2, 0.4, 880, "power2.inOut");
  expr("iq-mx", "shock", L.l16.start);
  expr("iq-mx", "angry", L.l16.start + 1.0);
  gesture("iq-mx", "shrug", L.l16.start + 0.1, 0.25);
  gesture("iq-mx", "fist", W("семьдесят") - 0.1, 0.25);
  gesture("iq-mx", "open", W("картошку"), 0.25);
  gesture("iq-mx", "fist", W("неблагодарные") - 0.1, 0.2);
  T(
    `tl.to("#iq-mx .body", {keyframes:[{y:-12,duration:.12},{y:0,duration:.15}]}, ${r(W("тракторе"))});`,
  );
  shake("#sh-interrog", W("неблагодарные") + 0.1, 5, 7);
  talk("iq-mx", "l16");
  // pull back: the family can't believe it
  camTo("interrog", 860, 760, 1.15, L.l16.end - 1.0, 1.4, 900, "power2.inOut");
  expr("iq-o", "happy", L.l16.end - 0.9);
  expr("iq-m", "shock", L.l16.end - 0.9);
  ["iq-mx", "iq-g", "iq-m", "iq-o", "iq-s1", "iq-s2"].forEach((id) => blink(id, a, b));
}

/* S6 the family gathers round the hero */
scene(
  "family",
  `${ROAD()}
   <g>${tankSlot("fm", -200, 1000, 760)}</g>
   ${wreck("fm")}
   ${C("fm-o", R.sonOld(), 520, 1110)}
   ${C("fm-y", R.sonYoung(), 640, 1120)}
   ${C("fm-m", R.masha(), 790, 1100)}
   ${C("fm-g", GA(), 330, 1110)}
   ${C("fm-mx", MX(), 940, 1110)}`,
  { bg: "#05070d" },
);
{
  const [a, b] = S.family;
  camSet("family", 640, 760, 1.3, a, 900);
  puffs("family", a, b);
  flicker("family", a, b);
  T(`tl.set("#fm-mxw", {y:340}, ${r(a)});`);
  T(`tl.set("#fm-tk .hatch", {rotation:-110, svgOrigin:"370 106"}, ${r(a)});`);
  expr("fm-mx", "neutral", a);
  expr("fm-g", "happy", a);
  // older son: legend!
  camTo("family", 540, 740, 2.0, L.l17.start - 0.2, 0.4, 880, "power2.out");
  expr("fm-o", "happy", L.l17.start);
  gesture("fm-o", "cheer", L.l17.start + 0.1, 0.25);
  T(
    `tl.to("#fm-o .body", {keyframes:[{y:-22,duration:.16},{y:0,duration:.18},{y:-16,duration:.16},{y:0,duration:.18}]}, ${r(L.l17.start + 0.15)});`,
  );
  talk("fm-o", "l17");
  // little one bounces
  camTo("family", 660, 780, 2.2, L.l18.start - 0.2, 0.4, 880, "power2.inOut");
  expr("fm-y", "happy", L.l18.start);
  gesture("fm-y", "cheer", L.l18.start + 0.2, 0.25);
  T(
    `tl.to("#fm-y .body", {keyframes:[{y:-20,duration:.15},{y:0,duration:.17},{y:-20,duration:.15},{y:0,duration:.17},{y:-14,duration:.15},{y:0,duration:.17}]}, ${r(L.l18.start + 0.2)});`,
  );
  talk("fm-y", "l18");
  // Masha thanks him, tearful
  camTo("family", 860, 760, 1.9, L.l19.start - 0.25, 0.45, 880, "power2.inOut");
  expr("fm-m", "cry", L.l19.start - 0.1);
  T(`tl.to("#fm-m", {x:40, duration:.6, ease:"power2.out"}, ${r(L.l19.start)});`);
  gesture("fm-m", "open", L.l19.start + 0.3, 0.4);
  talk("fm-m", "l19");
  // Maxim is embarrassed
  camTo("family", 930, 740, 2.2, L.l20.start - 0.2, 0.4, 880, "power2.inOut");
  expr("fm-mx", "happy", L.l20.start);
  gesture("fm-mx", "headR", L.l20.start + 0.1, 0.3);
  T(
    `tl.to("#fm-mx .head", {rotation:-8, transformOrigin:"50% 92%", duration:.4}, ${r(L.l20.start + 0.2)});`,
  );
  expr("fm-mx", "sad", W("водки") - 0.05);
  gesture("fm-mx", "shrug", W("водки"), 0.3);
  talk("fm-mx", "l20");
  ["fm-mx", "fm-g", "fm-m", "fm-o", "fm-y"].forEach((id) => blink(id, a, b));
}

/* S7 back to town; the prisoners stay tied by the road */
scene(
  "decide",
  `${ROAD()}
   <g>${tankSlot("dc", -200, 1000, 760)}</g>
   ${wreck("dc")}
   ${C("dc-s1", MASK(), 640, 1090)}
   ${C("dc-s2", MASK(), 760, 1090)}
   ${F5.rope(560, 840, 1110)}
   ${C("dc-m", R.masha(), 1000, 1100)}
   ${C("dc-o", R.sonOld(), 1110, 1110)}
   ${C("dc-y", R.sonYoung(), 1210, 1120)}
   ${C("dc-g", GA(), 900, 1110)}
   ${C("dc-mx", MX(), 420, 1110)}`,
  { bg: "#05070d" },
);
{
  const [a, b] = S.decide;
  camSet("decide", 900, 760, 2.0, a, 880);
  puffs("decide", a, b);
  flicker("decide", a, b);
  T(`tl.set("#dc-mxw", {y:340}, ${r(a)});`);
  T(`tl.set("#dc-tk .hatch", {rotation:-110, svgOrigin:"370 106"}, ${r(a)});`);
  ["dc-s1", "dc-s2"].forEach((id) => {
    sit(id, a);
    expr(id, "sad", a);
    gesture(id, "headBoth", a, 0.01);
  });
  ["dc-m", "dc-o", "dc-y"].forEach((id) => expr(id, "neutral", a));
  // Gleb remembers his parents
  expr("dc-g", "shock", L.l21.start);
  expr("dc-g", "determined", L.l21.start + 1.4);
  pose("dc-g", "head", -6, L.l21.start, 0.3);
  talk("dc-g", "l21");
  ["dc-m", "dc-o", "dc-y"].forEach((id) => expr(id, "scared", L.l21.start + 0.5));
  // Maxim: everyone on the armour!
  camTo("decide", 480, 740, 1.9, L.l22.start - 0.25, 0.45, 880, "power2.inOut");
  expr("dc-mx", "determined", L.l22.start);
  gesture("dc-mx", "fist", L.l22.start + 0.1, 0.2);
  T(`tl.to("#dc-mx", {scaleX:-1, svgOrigin:"420 1110", duration:.01}, ${r(W("броню") - 0.3)});`);
  gesture("dc-mx", "pointR", W("броню") - 0.2, 0.2);
  talk("dc-mx", "l22");
  ["dc-m", "dc-o", "dc-y", "dc-g"].forEach((id, i) =>
    walk(id, L.l22.end + 0.1 + i * 0.1, L.l23.start - 0.2, -700, 0, 0.25, 24),
  );
  hide("#dc-m, #dc-o, #dc-y, #dc-g", L.l23.start - 0.2);
  // to the tied soldiers, with a wave
  camTo("decide", 640, 820, 1.7, L.l23.start - 0.3, 0.5, 900, "power2.inOut");
  T(`tl.to("#dc-mx", {scaleX:1, svgOrigin:"420 1110", duration:.01}, ${r(L.l23.start - 0.3)});`);
  expr("dc-mx", "happy", L.l23.start);
  gesture("dc-mx", "wave", L.l23.start + 0.1, 0.25);
  T(
    `tl.to("#dc-mx .armR-lo", {keyframes:[{rotation:40,duration:.18},{rotation:0,duration:.18},{rotation:40,duration:.18},{rotation:0,duration:.18}], svgOrigin:"0 0"}, ${r(L.l23.start + 0.4)});`,
  );
  talk("dc-mx", "l23");
  ["dc-s1", "dc-s2"].forEach((id) => {
    expr(id, "cry", L.l23.start + 0.6);
    pose(id, "head", 10, L.l23.start + 0.6, 0.3);
  });
  ["dc-mx", "dc-g", "dc-m", "dc-o", "dc-s1", "dc-s2"].forEach((id) => blink(id, a, b));
}

/* riders on the tank deck */
const riders = (k, x, foot) => {
  const kk = 760 / 800;
  const deck = r(foot - 184 * kk);
  return `${tankSlot(k, x, foot, 760)}
   ${C(`${k}-m`, R.masha(), r(x + 150 * kk), deck)}
   ${C(`${k}-y`, R.sonYoung(), r(x + 230 * kk), r(deck + 6))}
   ${C(`${k}-o`, R.sonOld(), r(x + 660 * kk), deck)}
   ${C(`${k}-g`, GA(), r(x + 740 * kk), deck)}`;
};

/* S8 riding the armour through the night city */
scene(
  "ride",
  `<g id="rd-city">${P("rd-cityart", F5.cityNight(), -200, 1100, 3240)}</g>
   <g id="rd-tg">${riders("rd", 140, 1060)}</g>`,
  { bg: "#04060d" },
);
{
  const [a, b] = S.ride;
  camSet("ride", 520, 780, 1.7, a, 920);
  T(`tl.to("#rd-city", {x:-1500, duration:${r(b - a)}, ease:"none"}, ${r(a)});`);
  spinWheels("#rd-tk .tw", a, b, 2400);
  rumble("#rd-tg", a, b, 2);
  expr("rd-mx", "determined", a);
  ["rd-m", "rd-y", "rd-o"].forEach((id) => expr(id, "neutral", a));
  expr("rd-g", "sad", a);
  camTo(
    "ride",
    140 + 740 * 0.95,
    680,
    2.3,
    L.l24.start + 2.2,
    b - L.l24.start - 2.2,
    880,
    "sine.inOut",
  );
  expr("rd-g", "happy", W("улыбнулся") - 0.1);
  pose("rd-g", "head", -5, W("улыбнулся"), 0.4);
  ["rd-mx", "rd-g", "rd-m", "rd-o", "rd-y"].forEach((id) => blink(id, a, b));
}

/* S9 the avenue: ten tanks block the way */
const COL = [];
for (let i = 0; i < 5; i++) COL.push([1250 + i * 270, 950, 520]);
for (let i = 0; i < 5; i++) COL.push([1100 + i * 320, 1090, 660]);
scene(
  "column",
  `<g id="co-city">${P("co-ave", F5.avenue(), -300, 1100, 3200)}</g>
   ${COL.map(
     ([x, f, w], i) =>
       `<g class="ct" transform="matrix(-1 0 0 1 ${2 * x + w} 0)">${P(`co-t${i}`, K.tank({ color: "#3a4030" }).replace(/<text[^]*?<\/text>/, ""), x, f, w)}</g>
        <g class="hl" opacity="0"><path d="M${x + 20} ${f - w * 0.3} L${x - 600} ${f - w * 0.9} L${x - 600} ${f + w * 0.2}Z" fill="#fff6c8" opacity=".08"/><circle cx="${x + 18}" cy="${f - w * 0.3}" r="${w * 0.03}" fill="#fff6c8"/></g>`,
   ).join("")}
   <g id="co-tg">${riders("co", -60, 1060)}</g>`,
  { bg: "#04060d" },
);
{
  const [a, b] = S.column;
  camSet("column", 560, 700, 2.0, a, 880);
  T(
    `tl.fromTo("#co-tg", {x:-260}, {x:0, duration:1.6, ease:"power2.out", immediateRender:false}, ${r(a)});`,
  );
  spinWheels("#co-tk .tw", a, a + 1.6, 500);
  expr("co-mx", "determined", a);
  ["co-m", "co-y", "co-g"].forEach((id) => expr(id, "happy", a));
  expr("co-o", "scared", L.l25.start - 0.2);
  gesture("co-o", "pointR", L.l25.start + 0.3, 0.25);
  talk("co-o", "l25");
  // reveal: pan right along the column, headlights snap on
  camTo("column", 1700, 820, 1.0, L.l26.start - 0.2, 2.4, 900, "power2.inOut");
  T(`tl.to("#zm-column .hl", {opacity:1, duration:.08, stagger:.12}, ${r(W("колонна") - 0.2)});`);
  T(
    `tl.to("#zm-column .ct", {y:-4, duration:.08, yoyo:true, repeat:5, stagger:.05}, ${r(W("колонна"))});`,
  );
  ["co-m", "co-y", "co-g"].forEach((id) => expr(id, "shock", W("колонна")));
  camTo("column", 1500, 840, 0.75, W("десять") - 0.1, 1.0, 900, "power2.out");
  // Maxim, quietly
  camTo("column", -60 + 420 * 0.95, 620, 2.6, L.l27.start - 0.3, 0.5, 880, "power2.inOut");
  expr("co-mx", "shock", L.l27.start - 0.2);
  T(
    `tl.to("#co-mx .head", {rotation:6, transformOrigin:"50% 92%", duration:.6}, ${r(L.l27.start)});`,
  );
  talk("co-mx", "l27");
  ["co-mx", "co-g", "co-m", "co-o", "co-y"].forEach((id) => blink(id, a, b));
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
  soldier3: ["СОЛДАТ", "#c9d48a"],
  granny: ["БАБУШКА", "#e0b3ff"],
};
const HOT = new Set(
  "танк нет максим легенда спасибо водки бабушка дедушкой броню обратно улыбнулся колонна десять форму шили картошку тракторе".split(
    " ",
  ),
);
const DANGER = new Set(
  "убьют гони удар выстрел перевернулся нахуй суки быстро стреляй сука пизда ёб".split(" "),
);
const hook = `<div id="hook" class="clip toptitle" data-start="0.2" data-duration="${r(L.l01.start - 0.1)}" data-track-index="2" style="z-index:5"><div class="tt-s">${spl("ГЛЕБ", "hs")}</div><div class="tt-a">${spl("ЧАСТЬ 5", "ha")}</div></div>`;
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
  stamp("st-boom", W("удар") - 0.02, W("удар") + 0.7, "БАХ!", "#ff4a3d"),
  stamp("st-ten", W("десять"), L.l26.end + 0.5, "×10", "#ff4a3d"),
].join("\n");
const title = `<div id="tbc" class="clip" data-start="${TITLE[0]}" data-duration="${r(TITLE[1] - TITLE[0])}" data-track-index="4" style="z-index:8"><div id="tbc-a">${spl("ПРОДОЛЖЕНИЕ СЛЕДУЕТ…", "ta")}</div><div id="tbc-b">ЧАСТЬ 6</div></div>`;
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
  ["truck", 0, 14, 0.7],
  ["truck", 13.9, S.chase[1] - 13.9, 0.8],
  ["tank", L.l05.start - 0.5, S.chase[1] - L.l05.start + 0.5, 0.9],
  ["slam", W("удар"), 0.5, 1.3],
  ["boom1", W("выстрел"), 3.4, 1.2],
  ["glass", W("перевернулся"), 0.6, 1.0],
  ["boom2", S.chase[1], 4, 0.8],
  ["fire", S.flip[0], 20, 0.45],
  ["fire", S.flip[0] + 20, S.decide[1] - S.flip[0] - 20, 0.45],
  ["crank", L.l09.start - 1.3, 1.4, 0.9],
  ["gunfire", L.l09.start - 0.2, 1.5, 1.0],
  ["door", W("держи") + 0.55, 0.35, 1.0],
  ["door", W("броник") + 0.55, 0.35, 1.0],
  ["tank", S.decide[1] - 1.2, CUT - S.decide[1] + 1.2, 0.8],
  ["boom2", W("колонна") - 0.2, 4, 0.5],
].filter(([, , , v]) => v > 0);
const audio = [
  `<audio id="vo" class="clip" src="assets/vo.wav" data-start="0" data-duration="${r(L.l27.end + 0.1)}" data-track-index="10" data-volume="1"></audio>`,
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
<title>Глеб — часть 5</title>
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
