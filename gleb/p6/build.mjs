// "Глеб — часть 6": a battalion out of one Kalina, the run, the shootout in the stairwell, baba Zina.
// Run from gleb/p6: node build.mjs → index.html (sfx shared via assets/sfx symlink).
import fs from "node:fs";
import * as R from "../art/rig.js";
import * as K from "../p3/art3.js";
import * as A from "../art/art.js";
import * as F2 from "../p2/art2.js";
import * as F5 from "../p5/art5.js";
import * as F6 from "./art6.js";

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
const CUT = r(L.l45.end + 1.4);
const TITLE = [CUT, r(CUT + 3.2)];
const CARD_START = r(TITLE[1] + 0.1);
const CARD_DUR = 3.6;
const TOTAL = r(CARD_START + CARD_DUR);
const S = {};
{
  const ends = [
    ["column", L.l01.end + 0.5],
    ["kalina", L.l08.end + 0.6],
    ["run", L.l12.end + 0.4],
    ["door", L.l13.end + 1.0],
    ["lobby", L.l17.end + 0.3],
    ["outside", L.l18.end + 0.3],
    ["window", L.l20.end + 1.8],
    ["zina", L.l30.end + 0.6],
    ["radio", L.l33.end + 0.4],
    ["bonk", L.l36.end + 0.6],
    ["ammo", L.l41.end + 0.6],
    ["roof", CUT],
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
const spinWheels = (sel, t0, t1, deg = 1440) =>
  T(
    `tl.to("${sel}", {rotation:"+=${deg}", transformOrigin:"50% 50%", duration:${r(t1 - t0)}, ease:"none"}, ${r(t0)});`,
  );

const MASK = (o = {}) => R.soldier({ mask: true, ...o });

const flash = (sel, at, peak = 0.9, dur = 0.5) =>
  T(
    `tl.fromTo("${sel}", {opacity:${peak}}, {opacity:0, duration:${dur}, immediateRender:false}, ${r(at)});`,
  );
const MX = (o = {}) => R.maxim({ uniform: true, helmet: true, prop: "rifle", ...o });
const GA = (o = {}) => R.gleb({ injured: true, armor: true, prop: "rifle", ...o });
/* tank with a hatch slot for the commander (Maxim rises out of it) */
const tankSlot = (k, x, foot, w, mx = MX()) => {
  const kk = w / 800;
  const hx = r(x + 420 * kk);
  const hy = r(foot - 270 * kk);
  return `<g id="${k}-tank">${P(`${k}-tk`, K.tank(), x, foot, w)}
   <defs><clipPath id="${k}-clip"><rect x="${x - 200}" y="-600" width="${w + 400}" height="${hy + 600}"/></clipPath></defs>
   <g clip-path="url(#${k}-clip)"><g id="${k}-mxw">${C(`${k}-mx`, mx, hx, r(hy + 128 * (kk / 0.95)))}</g></g></g>`;
};
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
const COL = [];
for (let i = 0; i < 5; i++) COL.push([1250 + i * 270, 950, 520]);
for (let i = 0; i < 5; i++) COL.push([1100 + i * 320, 1090, 660]);
const column = (k) =>
  COL.map(
    ([x, f, w], i) =>
      `<g transform="matrix(-1 0 0 1 ${2 * x + w} 0)">${P(`${k}-t${i}`, K.tank({ color: "#3a4030" }).replace(/<text[^]*?<\/text>/, ""), x, f, w)}</g>
        <g><path d="M${x + 20} ${f - w * 0.3} L${x - 600} ${f - w * 0.9} L${x - 600} ${f + w * 0.2}Z" fill="#fff6c8" opacity=".08"/><circle cx="${x + 18}" cy="${f - w * 0.3}" r="${w * 0.03}" fill="#fff6c8"/></g>`,
  ).join("");
const fire = (sel, t0, t1, every = 0.16) => {
  for (let t = t0; t < t1; t += every) flash(sel, t, 1, every * 0.6);
};
const HAND_R = (id) => `#${id} .armR-lo`;
void HAND_R;

/* S1 the column. Maxim: that's it. */
scene(
  "column",
  `<g>${P("co-ave", F5.avenue(), -300, 1100, 3200)}</g>${column("co")}
   <g id="co-tg">${riders("co", -60, 1060)}</g>`,
  { bg: "#04060d" },
);
{
  const [a, b] = S.column;
  camSet("column", -60 + 420 * 0.95, 620, 2.6, a, 880);
  ["co-m", "co-y", "co-g", "co-o"].forEach((id) => expr(id, "shock", a));
  expr("co-mx", "shock", a);
  T(
    `tl.to("#co-mx .head", {rotation:6, transformOrigin:"50% 92%", duration:.6}, ${r(L.l01.start)});`,
  );
  talk("co-mx", "l01");
  camTo("column", 700, 760, 1.0, L.l01.end - 0.6, b - L.l01.end + 0.6, 900, "power2.inOut");
  ["co-mx", "co-g", "co-m", "co-o", "co-y"].forEach((id) => blink(id, a, b));
}

/* S2 a white Kalina rolls up and a whole battalion climbs out of it */
const BAT = Array.from({ length: 20 }, (_, i) => [
  640 + (i % 10) * 105 + (i >= 10 ? 50 : 0),
  i >= 10 ? 1120 : 1060,
]);
const KX = 1080;
const KDOOR = r(KX + 380 * (360 / 520));
scene(
  "kalina",
  `<g>${P("ka-ave", F5.avenue(), -300, 1100, 3200)}</g>${column("ka")}
   <g id="ka-car">${P("ka-cart", F6.kalina(), KX, 1010, 360)}</g>
   ${BAT.slice(0, 10)
     .map(
       ([x, f], i) =>
         `<g id="ka-b${i}" opacity="0">${C(`ka-br${i}`, MASK({ prop: "rifle" }), x, f)}</g>`,
     )
     .join("")}
   ${BAT.slice(10)
     .map(
       ([x, f], i) =>
         `<g id="ka-b${i + 10}" opacity="0">${C(`ka-br${i + 10}`, MASK({ prop: "rifle" }), x, f)}</g>`,
     )
     .join("")}
   <g id="ka-tg">${riders("kr", -60, 1060)}</g>`,
  { bg: "#04060d" },
);
{
  const [a, b] = S.kalina;
  camSet("kalina", 1250, 820, 1.3, a, 900);
  // the car rolls in from the right and stops
  T(
    `tl.fromTo("#ka-car", {x:900}, {x:0, duration:2.4, ease:"power2.out", immediateRender:false}, ${r(a)});`,
  );
  spinWheels("#ka-cart .wheel", a, a + 2.4, -900);
  ["kr-m", "kr-y", "kr-g", "kr-o"].forEach((id) => expr(id, "scared", a));
  expr("kr-mx", "shock", a);
  // the little one asks
  camTo("kalina", 160, 640, 2.4, L.l03.start - 0.3, 0.5, 880, "power2.inOut");
  expr("kr-y", "neutral", L.l03.start);
  gesture("kr-y", "pointR", L.l03.start + 0.2, 0.25);
  talk("kr-y", "l03");
  // the door: one, two, five, twenty...
  camTo("kalina", KDOOR, 840, 1.9, L.l04.start - 0.3, 0.6, 900, "power2.inOut");
  T(
    `tl.to("#ka-cart .rdoor", {scaleX:-.25, svgOrigin:"${r(KX + 452 * (360 / 520))} 900", duration:.3, ease:"power2.out"}, ${r(W("дверь") + 0.1)});`,
  );
  const t0 = W("один");
  const times = BAT.map((_, i) =>
    i < 1
      ? t0
      : i < 2
        ? W("второй")
        : i < 5
          ? W("второй") + (i - 1) * 0.35
          : W("пятый") + (i - 4) * ((L.l06.end - W("пятый")) / 16),
  );
  BAT.forEach(([x], i) => {
    const id = `ka-br${i}`;
    const t = times[i];
    T(`tl.set("#ka-b${i}", {opacity:1, x:${r(KDOOR - x)}}, ${r(t)});`);
    T(`tl.to("#ka-b${i}", {x:0, duration:.8, ease:"power1.out"}, ${r(t + 0.02)});`);
    walk(id, t, t + 0.8, 0, 0, 0.2, 22, false);
    expr(id, "angry", a);
  });
  camTo("kalina", 1150, 860, 1.4, W("пятый") - 0.2, 0.8, 900, "power2.inOut");
  // the older one can't believe it
  camTo("kalina", -60 + 660 * 0.95, 640, 2.3, L.l05.start - 0.25, 0.45, 880, "power2.inOut");
  expr("kr-o", "shock", L.l05.start);
  gesture("kr-o", "headBoth", L.l05.start + 0.2, 0.3);
  talk("kr-o", "l05");
  // wide: a battalion
  camTo("kalina", 1000, 860, 0.85, L.l06.start - 0.2, 1.4, 940, "power2.inOut");
  // Maxim, baffled
  camTo("kalina", -60 + 420 * 0.95, 620, 2.5, L.l07.start - 0.25, 0.5, 880, "power2.inOut");
  expr("kr-mx", "shock", L.l07.start);
  gesture("kr-mx", "shrug", W("сидели"), 0.3);
  talk("kr-mx", "l07");
  // they all raise their rifles; Gleb yells
  BAT.forEach((_, i) => gesture(`ka-br${i}`, "pointR", L.l08.start - 0.4 + (i % 5) * 0.03, 0.2));
  camTo("kalina", -60 + 740 * 0.95, 640, 2.4, L.l08.start - 0.3, 0.35, 880, "power2.out");
  expr("kr-g", "scared", L.l08.start - 0.1);
  gesture("kr-g", "open", L.l08.start, 0.15);
  talk("kr-g", "l08");
  shake("#sh-kalina", L.l08.start + 0.1, 6, 10);
  ["kr-mx", "kr-g", "kr-m", "kr-o", "kr-y"].forEach((id) => blink(id, a, b));
}

/* S3 running through the yards; Maxim lags behind */
scene(
  "run",
  `${room(F2.courtyard())}
   ${C("rn-g", GA(), 120, 1060)}
   ${C("rn-m", R.masha(), 0, 1060)}
   ${C("rn-y", R.sonYoung(), -90, 1070)}
   ${C("rn-o", R.sonOld(), -200, 1060)}
   ${C("rn-mx", MX(), -420, 1060)}
   ${Array.from({ length: 6 }, (_, i) => F6.muzzle("rn-spark", 200 + i * 150, 1060 - (i % 2) * 300, 0.6)).join("")}`,
  { bg: "#05070d" },
);
{
  const [a, b] = S.run;
  camSet("run", 300, 760, 1.2, a, 900);
  ["rn-g", "rn-m", "rn-y", "rn-o"].forEach((id, i) => {
    expr(id, "scared", a);
    walk(id, a + i * 0.05, L.l11.start - 0.2, 900, 0, 0.18, 34);
  });
  expr("rn-y", "cry", a);
  gesture("rn-m", "open", a, 0.01);
  camTo("run", 900, 760, 1.4, a + 0.4, L.l11.start - a - 0.6, 900, "none");
  talk("rn-m", "l10");
  // bullets snap into the walls
  [0, 1, 2, 3, 4, 5].forEach((i) =>
    T(
      `tl.fromTo("#zm-run .rn-spark:nth-of-type(${i + 1})", {opacity:1}, {opacity:0, duration:.12, immediateRender:false}, ${r(L.l09.start + 0.4 + i * 0.7)});`,
    ),
  );
  // Maxim, out of breath
  walk("rn-mx", a + 0.3, L.l12.end, 1150, 0, 0.32, 18);
  expr("rn-mx", "tired", a);
  T(`tl.to("#rn-mx .body", {rotation:12, svgOrigin:"100 410", duration:.4}, ${r(L.l11.start)});`);
  camTo("run", 70, 700, 2.2, L.l11.start - 0.3, 0.5, 880, "power2.inOut");
  camTo("run", 560, 700, 2.2, L.l11.start + 0.2, L.l11.end - L.l11.start, 880, "none");
  talk("rn-mx", "l11");
  // the older one runs back for him
  T(`tl.to("#rn-o", {x:"-=360", duration:.6, ease:"power2.out"}, ${r(L.l12.start - 0.6)});`);
  T(`tl.set("#rn-o", {scaleX:-1, svgOrigin:"-200 1060"}, ${r(L.l12.start - 0.6)});`);
  expr("rn-o", "angry", L.l12.start - 0.2);
  gesture("rn-o", "pointR", L.l12.start, 0.2);
  talk("rn-o", "l12");
  ["rn-mx", "rn-g", "rn-m", "rn-o"].forEach((id) => blink(id, a, b));
}

/* S4 the grandparents' block: into the entrance */
scene(
  "door",
  `${room(K.grannyYard())}
   <g id="dr-fam">
   ${C("dd-o", R.sonOld(), 250, 1070)}
   ${C("dd-y", R.sonYoung(), 330, 1080)}
   ${C("dd-m", R.masha(), 420, 1070)}
   ${C("dd-mx", MX(), 120, 1070)}
   ${C("dd-g", GA(), 640, 1060)}</g>
   ${F6.muzzle("dd-spark", 760, 900, 0.6)}${F6.muzzle("dd-spark", 360, 820, 0.5)}`,
  { bg: "#05070d" },
);
{
  const [a, b] = S.door;
  camSet("door", 540, 820, 1.5, a, 900);
  ["dd-o", "dd-y", "dd-m"].forEach((id) => {
    expr(id, "scared", a);
    walk(id, a, L.l13.end, 140, 0, 0.18, 30);
  });
  walk("dd-mx", a, L.l13.end + 0.3, 300, 0, 0.26, 22);
  expr("dd-mx", "tired", a);
  expr("dd-g", "determined", a);
  gesture("dd-g", "pointR", L.l13.start, 0.2);
  T(`tl.set("#dd-g", {scaleX:-1, svgOrigin:"640 1060"}, ${r(a)});`);
  talk("dd-g", "l13");
  T(
    `tl.fromTo("#zm-door .dd-spark", {opacity:1}, {opacity:0, duration:.12, stagger:.5, immediateRender:false}, ${r(L.l13.start + 0.3)});`,
  );
  // everyone squeezes into the dark doorway
  T(
    `tl.to("#dr-fam", {scale:.25, svgOrigin:"540 850", opacity:0, duration:.7, ease:"power2.in"}, ${r(L.l13.end + 0.2)});`,
  );
  camTo("door", 540, 800, 2.6, L.l13.end, b - L.l13.end, 880, "power2.in");
  ["dd-g", "dd-m", "dd-o"].forEach((id) => blink(id, a, b));
}

/* S5 the lobby: barricade, comfort, orders */
scene(
  "lobby",
  `${room(F6.lobby())}
   ${C("lb-m", R.masha(), 560, 1060)}
   ${C("lb-y", R.sonYoung(), 650, 1070)}
   ${C("lb-o", R.sonOld(), 760, 1060)}
   ${C("lb-mx", MX(), 900, 1060)}
   <g id="lb-pram">${P("lb-pramart", F6.pram(), 520, 1060, 200)}</g>
   ${C("lb-g", GA(), 360, 1060)}`,
  { bg: "#3a4a48" },
);
{
  const [a, b] = S.lobby;
  camSet("lobby", 480, 760, 1.4, a, 900);
  T(
    `tl.fromTo("#zm-lobby .edoor", {scaleX:.3, svgOrigin:"80 580"}, {scaleX:1, svgOrigin:"80 580", duration:.2, ease:"power4.in", immediateRender:false}, ${r(a + 0.1)});`,
  );
  shake("#sh-lobby", a + 0.3, 6, 12);
  ["lb-m", "lb-y", "lb-o", "lb-g"].forEach((id) => expr(id, "scared", a));
  expr("lb-mx", "tired", a);
  // the pram goes against the door
  camTo("lobby", 320, 740, 2.0, L.l14.start - 0.3, 0.5, 880, "power2.inOut");
  expr("lb-g", "determined", L.l14.start);
  talk("lb-g", "l14");
  T(`tl.set("#lb-g", {scaleX:-1, svgOrigin:"360 1060"}, ${r(L.l14.start + 0.6)});`);
  T(`tl.to("#lb-pram", {x:-300, duration:.6, ease:"power2.in"}, ${r(L.l14.start + 0.7)});`);
  T(`tl.to("#lb-g", {x:-120, duration:.6, ease:"power2.in"}, ${r(L.l14.start + 0.7)});`);
  gesture("lb-g", "open", L.l14.start + 0.7, 0.2);
  // banging on the door
  [0, 0.5, 1.0].forEach((d) => shake("#zm-lobby .edoor", L.l15.start + d, 3, 5));
  camTo("lobby", 610, 760, 2.2, L.l15.start - 0.25, 0.45, 880, "power2.inOut");
  expr("lb-y", "cry", L.l15.start - 0.1);
  talk("lb-y", "l15");
  expr("lb-m", "sad", L.l16.start - 0.1);
  T(`tl.to("#lb-m", {x:40, duration:.4}, ${r(L.l16.start)});`);
  pose("lb-m", "armR", -50, L.l16.start + 0.1, 0.4);
  pose("lb-m", "armR-lo", -50, L.l16.start + 0.1, 0.4);
  pose("lb-m", "head", 10, L.l16.start + 0.2, 0.4);
  talk("lb-m", "l16");
  // Maxim takes charge
  camTo("lobby", 860, 740, 2.1, L.l17.start - 0.3, 0.5, 880, "power2.inOut");
  expr("lb-mx", "determined", L.l17.start);
  gesture("lb-mx", "pointR", W("окно") - 0.2, 0.2);
  gesture("lb-mx", "fist", W("прикурить") - 0.2, 0.2);
  talk("lb-mx", "l17");
  ["lb-mx", "lb-g", "lb-m", "lb-o", "lb-y"].forEach((id) => blink(id, a, b));
}

/* S6 outside: the battalion surrounds the block */
scene(
  "outside",
  `${room(K.grannyYard())}
   ${Array.from({ length: 7 }, (_, i) => `<g id="os-b${i}">${C(`os-br${i}`, MASK({ prop: "rifle" }), 120 + i * 140, 1060 + (i % 2) * 40)}</g>`).join("")}`,
  { bg: "#05070d" },
);
{
  const [a, b] = S.outside;
  camSet("outside", 540, 820, 1.25, a, 900);
  Array.from({ length: 7 }).forEach((_, i) => {
    expr(`os-br${i}`, "angry", a);
    walk(`os-br${i}`, a, b, 0, -40, 0.24, 22, false);
  });
  camTo("outside", 400, 760, 1.9, a, L.l18.start - a + 0.3, 880, "power2.out");
  gesture("os-br2", "pointR", L.l18.start, 0.2);
  talk("os-br2", "l18");
}

/* S7 the landing window: the shootout */
scene(
  "window",
  `${room(F6.landingWindow())}
   ${C("wn-mx", MX(), 380, 1060)}
   ${C("wn-g", GA(), 760, 1060)}
   ${F6.muzzle("wn-f1", 540, 830, 1.0)}${F6.muzzle("wn-f2", 900, 830, 1.0)}`,
  { bg: "#3c4e4c" },
);
{
  const [a, b] = S.window;
  camSet("window", 380, 700, 2.1, a, 880);
  expr("wn-mx", "angry", a);
  expr("wn-g", "determined", a);
  gesture("wn-mx", "pointR", a, 0.01);
  gesture("wn-g", "pointR", a, 0.01);
  talk("wn-mx", "l19");
  fire("#wn-f1", L.l19.end + 0.1, L.l19.end + 1.3, 0.12);
  fire("#wn-f2", L.l19.end + 0.4, L.l19.end + 1.6, 0.12);
  shake("#sh-window", L.l19.end + 0.1, 12, 6);
  camTo("window", 560, 600, 1.3, L.l19.end, 0.6, 900, "power2.out");
  T(
    `tl.to("#zm-window .fx", {keyframes:[{opacity:1,duration:.05},{opacity:0,duration:.1}], repeat:6, stagger:.13}, ${r(L.l19.end + 0.6)});`,
  );
  T(`tl.set("#zm-window .cracks", {opacity:.8}, ${r(L.l20.start)});`);
  fire("#wn-f1", L.l20.start + 0.2, b - 0.1, 0.15);
  fire("#wn-f2", L.l20.start + 0.5, b - 0.1, 0.17);
  shake("#sh-window", L.l20.start, 14, 5);
  ["wn-mx", "wn-g"].forEach((id) => blink(id, a, b));
}

/* S8 Zina */
scene(
  "zina",
  `${room(F6.zinaLanding())}
   <g id="zn-z0" opacity="0">${C("zn-z", R.zina(), 290, 1060)}</g>
   <g id="zn-z1" opacity="0">${C("zn-zb", R.zina({ prop: "box" }), 290, 1060)}</g>
   <g id="zn-z2" opacity="0">${C("zn-zp", R.zina({ prop: "pan" }), 290, 1060)}</g>
   ${C("zn-mx", MX(), 600, 1060)}
   ${C("zn-o", R.sonOld(), 760, 1060)}
   <g id="zn-kids">${C("zn-y", R.sonYoung(), 860, 1070)}${C("zn-m", R.masha(), 960, 1060)}</g>
   <g id="zn-hearts" opacity="0">${[0, 1, 2].map((i) => `<path class="hrt" transform="translate(${560 + i * 50} ${640 - i * 30}) scale(${0.8 + i * 0.2})" d="M0 10 C-20 -10 -30 10 0 30 C30 10 20 -10 0 10Z" fill="#ff4a7a" stroke="#0b0d14" stroke-width="2"/>`).join("")}</g>`,
  { bg: "#3c4e4c" },
);
{
  const [a, b] = S.zina;
  camSet("zina", 560, 760, 1.35, a, 900);
  T(`tl.set("#zm-zina .zdoor", {scaleX:1, svgOrigin:"160 580"}, ${r(a)});`);
  ["zn-mx", "zn-o", "zn-y", "zn-m"].forEach((id) => expr(id, "scared", a));
  expr("zn-mx", "determined", a);
  T(`tl.set("#zn-mx", {scaleX:-1, svgOrigin:"600 1060"}, ${r(a)});`);
  gesture("zn-mx", "pointR", a, 0.01);
  // the door flies open
  T(
    `tl.to("#zm-zina .zdoor", {scaleX:-.15, svgOrigin:"160 580", duration:.25, ease:"power3.out"}, ${r(L.l21.start - 0.35)});`,
  );
  show("#zn-z0", L.l21.start - 0.25);
  expr("zn-z", "angry", a);
  camTo("zina", 300, 720, 2.2, L.l21.start - 0.35, 0.4, 880, "power2.out");
  gesture("zn-z", "headBoth", L.l21.start + 0.1, 0.01);
  gesture("zn-z", "fist", L.l21.start + 0.2, 0.25);
  talk("zn-z", "l21");
  // he turns round
  camTo("zina", 450, 720, 1.8, L.l22.start - 0.3, 0.5, 880, "power2.inOut");
  T(`tl.set("#zn-mx", {scaleX:1, svgOrigin:"600 1060"}, ${r(L.l22.start - 0.2)});`);
  gesture("zn-mx", "rest", L.l22.start - 0.2, 0.2);
  expr("zn-mx", "shock", L.l22.start);
  talk("zn-mx", "l22");
  expr("zn-z", "shock", L.l23.start);
  gesture("zn-z", "open", L.l23.start + 0.2, 0.3);
  camTo("zina", 300, 720, 2.2, L.l23.start - 0.2, 0.4, 880, "power2.inOut");
  expr("zn-z", "angry", W("стреляешь") - 0.2);
  talk("zn-z", "l23");
  camTo("zina", 600, 720, 2.2, L.l24.start - 0.2, 0.4, 880, "power2.inOut");
  expr("zn-mx", "happy", L.l24.start);
  gesture("zn-mx", "shrug", L.l24.start + 0.1, 0.3);
  gesture("zn-mx", "rest", L.l25.start, 0.3);
  talk("zn-mx", "l24");
  // the grandson whispers
  camTo("zina", 700, 720, 2.2, L.l25.start - 0.2, 0.4, 880, "power2.inOut");
  expr("zn-o", "happy", L.l25.start);
  T(`tl.to("#zn-o", {x:-60, duration:.3}, ${r(L.l25.start)});`);
  talk("zn-o", "l25");
  // first love, 1978
  expr("zn-mx", "happy", L.l26.start);
  show("#zn-hearts", L.l26.start + 0.4);
  T(
    `tl.fromTo("#zn-hearts .hrt", {y:20, opacity:0}, {y:-60, opacity:1, duration:1.2, stagger:.3, ease:"sine.out", immediateRender:false}, ${r(L.l26.start + 0.4)});`,
  );
  hide("#zn-hearts", L.l26.end + 0.2);
  talk("zn-mx", "l26");
  // the children go inside; the box of rounds
  camTo("zina", 420, 740, 1.5, L.l27.start - 0.2, 0.5, 900, "power2.inOut");
  expr("zn-z", "determined", L.l27.start);
  gesture("zn-z", "pointR", L.l27.start + 0.1, 0.2);
  talk("zn-z", "l27");
  walk("zn-y", W("живо"), W("живо") + 1.6, -560, 0, 0.2, 24);
  walk("zn-m", W("живо") + 0.2, W("живо") + 1.8, -660, 0, 0.22, 24);
  T(`tl.to("#zn-kids", {opacity:0, duration:.3}, ${r(W("живо") + 1.6)});`);
  hide("#zn-z0", W("вот") - 0.1);
  show("#zn-z1", W("вот") - 0.1);
  expr("zn-zb", "determined", a);
  gesture("zn-zb", "pointR", W("вот") - 0.1, 0.2);
  talk("zn-zb", "l27");
  // ...and a frying pan
  hide("#zn-z1", W("сковородку") - 0.1);
  show("#zn-z2", W("сковородку") - 0.1);
  expr("zn-zp", "determined", a);
  gesture("zn-zp", "cheer", W("сковородку") - 0.1, 0.25);
  camTo("zina", 300, 700, 2.0, W("сковородку") - 0.3, 0.4, 880, "power2.out");
  // the proposal
  camTo("zina", 450, 720, 1.8, L.l29.start - 0.2, 0.5, 880, "power2.inOut");
  expr("zn-mx", "happy", L.l29.start);
  gesture("zn-mx", "open", L.l29.start + 0.1, 0.3);
  T(`tl.to("#zn-mx", {x:-80, duration:.5}, ${r(W("выходи") - 0.4)});`);
  T(`tl.to("#zn-mx .body", {y:40, duration:.3}, ${r(W("выходи") - 0.1)});`);
  talk("zn-mx", "l29");
  expr("zn-zp", "angry", L.l30.start);
  gesture("zn-zp", "pointR", L.l30.start + 0.1, 0.2);
  T(`tl.to("#zn-mx .body", {y:0, duration:.3}, ${r(L.l30.end)});`);
  talk("zn-zp", "l30");
  ["zn-mx", "zn-z", "zn-zb", "zn-zp", "zn-o", "zn-m"].forEach((id) => blink(id, a, b));
}

/* S9 the radio */
scene(
  "radio",
  `${room(K.grannyYard())}
   ${C("rd-s1", MASK({ prop: "rifle" }), 300, 1070)}
   ${C("rd-s2", MASK({ prop: "radio" }), 520, 1060)}
   ${C("rd-s3", MASK({ prop: "rifle" }), 740, 1070)}
   <g id="rd-wave" opacity="0"><path d="M600 690 q20 20 0 40 M620 675 q34 35 0 70 M640 660 q48 50 0 100" stroke="#ffe27a" stroke-width="6" fill="none"/></g>`,
  { bg: "#05070d" },
);
{
  const [a, b] = S.radio;
  camSet("radio", 520, 740, 2.0, a, 880);
  ["rd-s1", "rd-s2", "rd-s3"].forEach((id) => expr(id, "scared", a));
  gesture("rd-s2", "headR", a, 0.01);
  talk("rd-s2", "l31");
  show("#rd-wave", L.l32.start);
  T(`tl.to("#rd-wave", {opacity:.2, duration:.12, yoyo:true, repeat:5}, ${r(L.l32.start)});`);
  hide("#rd-wave", L.l32.end + 0.1);
  T(
    `tl.to("#rd-s2 .head", {rotation:-10, transformOrigin:"50% 92%", duration:.2}, ${r(L.l32.start)});`,
  );
  camTo("radio", 520, 700, 2.6, L.l33.start - 0.3, 0.6, 880, "power2.inOut");
  expr("rd-s2", "shock", L.l33.start);
  talk("rd-s2", "l33");
  ["rd-s1", "rd-s2", "rd-s3"].forEach((id) => blink(id, a, b));
}

/* S10 the stairs: Zina and her frying pan */
scene(
  "bonk",
  `${room(A.stairwell({ floor: 1 }))}
   ${C("bk-s", MASK({ prop: "rifle" }), 260, 960)}
   ${C("bk-z", R.zina({ prop: "pan" }), 690, 720)}
   <g id="bk-o" opacity="0">${C("bk-or", R.sonOld(), 900, 600)}</g>
   ${F6.stars("bk-stars", 420, 640)}`,
  { bg: "#2a3a3a" },
);
{
  const [a, b] = S.bonk;
  camSet("bonk", 460, 700, 1.4, a, 900);
  expr("bk-s", "angry", a);
  expr("bk-z", "angry", a);
  T(`tl.set("#bk-z", {scaleX:-1, svgOrigin:"690 720"}, ${r(a)});`);
  T(`tl.set("#bk-z", {x:240, opacity:0}, ${r(a)});`);
  walk("bk-s", a + 0.2, L.l35.start + 0.4, 220, -140, 0.24, 24);
  camTo("bonk", 520, 640, 1.8, a + 0.2, L.l35.start - a, 880, "sine.inOut");
  T(`tl.to("#bk-z", {x:0, opacity:1, duration:.4, ease:"power2.out"}, ${r(L.l35.start - 0.3)});`);
  gesture("bk-z", "cheer", L.l35.start, 0.25);
  talk("bk-z", "l35");
  // BONK
  const hit = W("подъезда") + 0.2;
  pose("bk-z", "armR", -60, hit - 0.12, 0.12, "power4.in");
  expr("bk-s", "shock", hit - 0.4);
  T(
    `tl.to("#bk-s", {rotation:-80, svgOrigin:"480 820", y:"+=150", x:"-=140", duration:.5, ease:"power2.in"}, ${r(hit)});`,
  );
  T(`tl.set("#zm-bonk .bk-stars", {opacity:1}, ${r(hit + 0.5)});`);
  T(
    `tl.to("#zm-bonk .bk-stars", {rotation:360, svgOrigin:"420 640", duration:1.2, ease:"none"}, ${r(hit + 0.5)});`,
  );
  T(`tl.set("#zm-bonk .bk-stars", {x:-100, y:220}, ${r(hit + 0.5)});`);
  shake("#sh-bonk", hit, 6, 12);
  expr("bk-z", "happy", hit + 0.6);
  // the older boy peeks out
  show("#bk-o", L.l36.start - 0.3);
  T(
    `tl.fromTo("#bk-o", {x:120}, {x:0, duration:.3, immediateRender:false}, ${r(L.l36.start - 0.3)});`,
  );
  expr("bk-or", "happy", L.l36.start);
  gesture("bk-or", "cheer", L.l36.start + 0.4, 0.25);
  camTo("bonk", 760, 560, 1.7, L.l36.start - 0.3, 0.5, 880, "power2.inOut");
  talk("bk-or", "l36");
  ["bk-s", "bk-z", "bk-or"].forEach((id) => blink(id, a, b));
}

/* S11 the last magazine */
scene(
  "ammo",
  `${room(F6.landingWindow())}
   ${C("am-mx", MX(), 380, 1060)}
   ${C("am-g", GA(), 720, 1060)}
   ${C("am-m", R.masha(), 960, 1060)}
   ${F6.muzzle("am-f1", 540, 830, 1.0)}`,
  { bg: "#3c4e4c" },
);
{
  const [a, b] = S.ammo;
  camSet("ammo", 560, 740, 1.3, a, 900);
  T(`tl.set("#zm-ammo .cracks", {opacity:.8}, ${r(a)});`);
  expr("am-mx", "determined", a);
  expr("am-g", "scared", a);
  expr("am-m", "scared", a);
  gesture("am-mx", "pointR", a, 0.01);
  fire("#am-f1", a + 0.1, L.l37.start - 0.2, 0.2);
  camTo("ammo", 720, 720, 2.1, L.l37.start - 0.3, 0.5, 880, "power2.inOut");
  gesture("am-g", "shrug", L.l37.start + 0.1, 0.3);
  talk("am-g", "l37");
  camTo("ammo", 400, 720, 2.1, L.l38.start - 0.3, 0.5, 880, "power2.inOut");
  expr("am-mx", "sad", L.l38.start);
  gesture("am-mx", "rest", L.l38.start, 0.3);
  talk("am-mx", "l38");
  camTo("ammo", 940, 720, 2.1, L.l39.start - 0.3, 0.5, 880, "power2.inOut");
  talk("am-m", "l39");
  camTo("ammo", 840, 720, 1.8, L.l40.start - 0.3, 0.5, 880, "power2.inOut");
  expr("am-g", "sad", L.l40.start);
  T(`tl.set("#am-g", {scaleX:-1, svgOrigin:"720 1060"}, ${r(L.l40.start)});`);
  talk("am-g", "l40");
  expr("am-m", "cry", L.l40.start + 1.0);
  camTo("ammo", 560, 720, 1.6, L.l41.start - 0.3, 0.6, 880, "power2.inOut");
  T(`tl.set("#am-g", {scaleX:1, svgOrigin:"720 1060"}, ${r(L.l41.start)});`);
  expr("am-mx", "happy", L.l41.start);
  T(`tl.to("#am-mx", {x:160, duration:.5}, ${r(L.l41.start)});`);
  pose("am-mx", "armL", -100, L.l41.start + 0.4, 0.3);
  talk("am-mx", "l41");
  expr("am-g", "neutral", L.l41.start + 1.5);
  ["am-mx", "am-g", "am-m"].forEach((id) => blink(id, a, b));
}

/* S12 knocking from the roof hatch */
scene(
  "roof",
  `${room(F6.roofHatch()).replace(/<text[^]*?<\/text>/, "")}
   <defs><clipPath id="rf-clip"><rect x="420" y="-400" width="240" height="730"/></clipPath></defs>
   <g clip-path="url(#rf-clip)"><g id="rf-gm" transform="translate(0 -520)">${C("rf-g", R.granny(), 540, 600)}</g></g>
   ${C("rf-mx", MX(), 300, 1060)}
   ${C("rf-gl", GA(), 780, 1060)}`,
  { bg: "#26302f" },
);
{
  const [a, b] = S.roof;
  camSet("roof", 540, 820, 1.4, a, 900);
  ["rf-mx", "rf-gl"].forEach((id) => expr(id, "scared", a));
  [0.5, 0.8, 1.1].forEach((d) => shake("#zm-roof .rhatch", W("постучал") + d, 3, 4));
  camTo("roof", 540, 300, 2.0, W("постучал"), 1.4, 900, "power2.inOut");
  T(
    `tl.to("#zm-roof .rhatch", {y:-80, x:120, rotation:20, svgOrigin:"670 150", duration:.4, ease:"power2.out"}, ${r(L.l43.start - 0.6)});`,
  );
  T(`tl.to("#zm-roof .beam", {opacity:.18, duration:.4}, ${r(L.l43.start - 0.6)});`);
  T(`tl.to("#rf-gm", {y:0, duration:.4, ease:"power2.out"}, ${r(L.l43.start - 0.3)});`);
  expr("rf-g", "scared", a);
  gesture("rf-g", "wave", L.l43.start, 0.3);
  talk("rf-g", "l43");
  camTo("roof", 780, 720, 2.2, L.l44.start - 0.25, 0.35, 880, "power2.out");
  expr("rf-gl", "shock", L.l44.start);
  talk("rf-gl", "l44");
  camTo("roof", 300, 720, 2.3, L.l45.start - 0.25, 0.45, 880, "power2.inOut");
  expr("rf-mx", "shock", L.l45.start);
  talk("rf-mx", "l45");
  ["rf-mx", "rf-gl", "rf-g"].forEach((id) => blink(id, a, b));
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
  "калина батальон двадцатый бежим подъезд коляску рядом окно прикурить перестрелка зина любовь патронов сковородку женщина жених бабка страшнее вырубила магазин свадьбе крыши мама".split(
    " ",
  ),
);
const DANGER = new Set(
  "убьют гони удар выстрел перевернулся нахуй суки быстро стреляй сука пизда ёб".split(" "),
);
const hook = `<div id="hook" class="clip toptitle" data-start="0.2" data-duration="${r(L.l01.start - 0.1)}" data-track-index="2" style="z-index:5"><div class="tt-s">${spl("ГЛЕБ", "hs")}</div><div class="tt-a">${spl("ЧАСТЬ 6", "ha")}</div></div>`;
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
  stamp("st-1", W("один"), W("второй") - 0.05, "1", "#ffffff"),
  stamp("st-2", W("второй"), W("пятый") - 0.05, "2", "#ffffff"),
  stamp("st-5", W("пятый"), W("двадцатый") - 0.05, "5", "#ffb02e"),
  stamp("st-20", W("двадцатый"), L.l04.end + 0.4, "20!", "#ff4a3d"),
  stamp("st-bat", W("батальон"), L.l06.end + 0.4, "БАТАЛЬОН", "#ff4a3d"),
  stamp("st-bonk", W("подъезда") + 0.2, W("подъезда") + 1.2, "БДЫЩ!", "#ffe27a"),
].join("\n");
const title = `<div id="tbc" class="clip" data-start="${TITLE[0]}" data-duration="${r(TITLE[1] - TITLE[0])}" data-track-index="4" style="z-index:8"><div id="tbc-a">${spl("ПРОДОЛЖЕНИЕ СЛЕДУЕТ…", "ta")}</div><div id="tbc-b">ЧАСТЬ 7</div></div>`;
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
  ["tank", 0, S.kalina[1], 0.6],
  ["engine", S.kalina[0], 3, 0.8],
  ["door", W("дверь") + 0.1, 0.35, 1.0],
  ["gunfire", L.l08.end + 0.2, 1.5, 0.8],
  ["whistle_short", L.l09.start + 0.4, 1.4, 0.6],
  ["gunfire", L.l11.start + 1.0, 1.5, 0.6],
  ["gunfire", L.l13.start + 0.3, 1.5, 0.7],
  ["slam", S.lobby[0] + 0.3, 0.5, 1.3],
  ["slam", L.l15.start, 0.5, 0.9],
  ["slam", L.l15.start + 0.5, 0.5, 0.9],
  ["slam", L.l15.start + 1.0, 0.5, 0.9],
  ["gunfire", L.l19.end + 0.1, 1.5, 1.1],
  ["glass", L.l20.start, 0.6, 1.0],
  ["gunfire", L.l20.start + 0.2, 1.5, 1.1],
  ["gunfire", L.l20.start + 1.6, 1.5, 0.9],
  ["door", L.l21.start - 0.35, 0.35, 1.2],
  ["buzz", L.l32.start - 0.1, 1.2, 0.5],
  ["slam", W("подъезда") + 0.2, 0.5, 1.4],
  ["pop", W("подъезда") + 0.25, 0.09, 1.4],
  ["gunfire", S.ammo[0] + 0.1, 1.5, 0.8],
  ["click", L.l38.start + 0.3, 0.06, 1.3],
  ["click", L.l38.start + 0.6, 0.06, 1.3],
  ["door", W("постучал") + 0.5, 0.35, 1.0],
  ["door", W("постучал") + 0.8, 0.35, 1.0],
  ["door", W("постучал") + 1.1, 0.35, 1.0],
  ["crank", L.l43.start - 0.6, 1.4, 0.8],
].filter(([, , , v]) => v > 0);
const audio = [
  `<audio id="vo" class="clip" src="assets/vo.wav" data-start="0" data-duration="${r(L.l45.end + 0.1)}" data-track-index="10" data-volume="1"></audio>`,
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
<title>Глеб — часть 6</title>
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
