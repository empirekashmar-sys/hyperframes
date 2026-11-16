// "Глеб — часть 14": baba Valya's question (a flashback), the meeting, the truth; Gleb walks away and turns round.
// Run from gleb/p14: node build.mjs → index.html (sfx shared via assets/sfx symlink).
import fs from "node:fs";
import * as R from "../art/rig.js";
import * as F11 from "../p11/art11.js";
import * as F13 from "../p13/art13.js";
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
const CUT = r(L.l41.end + 2.0);
const TITLE = [CUT, r(CUT + 3.2)];
const CARD_START = r(TITLE[1] + 0.1);
const CARD_DUR = 3.6;
const TOTAL = r(CARD_START + CARD_DUR);
const S = {};
{
  const ends = [
    ["look", L.l01.end + 0.5],
    ["flash", L.l09.end + 0.8],
    ["meet", CUT],
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
const MXS = (o = {}) => R.maxim({ uniform: true, shaved: true, prop: "", brow: "neutral", ...o });
const MB = (o = {}) => R.masha({ outfit: "black", ...o });
const MOSK = (o = {}) => F2.car({ lights: false, color: "#c9b48a", ...o });
const HAT = (x, y) =>
  `<g class="hat"><path d="M${x} ${y} q20 -40 50 -10 q6 22 -16 30 q-24 6 -34 -20z" fill="#d94a3a" stroke="#0b0d14" stroke-width="2.4"/><circle cx="${x + 32}" cy="${y - 14}" r="8" fill="#f2efe6" stroke="#0b0d14" stroke-width="2"/></g>`;
const rowWorld = (k) =>
  `<g>${P(`${k}-art`, F13.row(), -200, 1100, 2160)}</g>
   <g id="${k}-gw">${C(`${k}-g`, R.gleb({}), 1760, 1080)}${HAT(1800, 900)}<g class="back" opacity="0"><ellipse cx="1760" cy="744" rx="50" ry="53" fill="#17181d" stroke="#0b0d14" stroke-width="3"/></g></g>
   <g id="${k}-mw">${C(`${k}-m`, MB(), 1500, 1080)}</g>
   <g id="${k}-xw">${C(`${k}-mx`, MXS({ helmet: true }), 1330, 1080)}</g>`;

/* S1 Gleb looks at them; Maxim remembers */
scene(
  "look",
  `${rowWorld("lk")}<rect id="lk-white" x="-800" y="-800" width="4000" height="3520" fill="#fff6e0" opacity="0"/>`,
  { bg: "#2a2a5a" },
);
{
  const [a, b] = S.look;
  camSet("look", 1760, 700, 2.6, a, 880);
  expr("lk-g", "shock", a);
  expr("lk-m", "scared", a);
  expr("lk-mx", "sad", a);
  camTo("look", 1500, 700, 2.4, W("машу", 1) - 0.2, 0.5, 880, "power2.inOut");
  camTo("look", 1330, 700, 2.6, W("деда", 1) - 0.2, 0.5, 880, "power2.inOut");
  camTo("look", 1330, 690, 3.6, W("вспомнил") - 0.2, b - W("вспомнил"), 880, "power1.in");
  T(`tl.to("#lk-white", {opacity:1, duration:.4}, ${r(b - 0.4)});`);
  ["lk-g", "lk-m", "lk-mx"].forEach((id) => blink(id, a, b));
}

/* S2 FLASHBACK: baba Valya at the gate */
scene(
  "flash",
  `${room(F11.house())}
   ${P("fl-cart", MOSK(), -300, 1000, 420)}
   ${C("fl-m", MB({ prop: "bag" }), 120, 1070)}
   ${C("fl-mx", MXS({ helmet: true }), 560, 1070)}
   ${C("fl-n", R.granny({ brow: "neutral" }), 780, 1070)}
   ${F13.pies("fl-pies", 720, 900)}
   <rect x="-800" y="-800" width="2680" height="3520" fill="#8a6a3a" opacity=".38"/>
   <rect id="fl-white" x="-800" y="-800" width="2680" height="3520" fill="#fff6e0" opacity="0"/>`,
  { bg: "#c9a87a" },
);
{
  const [a, b] = S.flash;
  T(
    `tl.fromTo("#fl-white", {opacity:1}, {opacity:0, duration:.6, immediateRender:false}, ${r(a)});`,
  );
  camSet("flash", 540, 760, 1.2, a, 900);
  T(`tl.set("#fl-n", {scaleX:-1, svgOrigin:"780 1070"}, ${r(a)});`);
  expr("fl-n", "happy", a);
  expr("fl-mx", "neutral", a);
  expr("fl-m", "neutral", a);
  walk("fl-m", a + 0.4, a + 2.4, -80, 0, 0.3, 16);
  camTo("flash", 700, 720, 2.2, L.l02.start - 0.2, 0.5, 880, "power2.inOut");
  gesture("fl-n", "shrug", L.l02.start + 0.2, 0.3);
  talk("fl-n", "l02");
  expr("fl-mx", "shock", L.l03.start);
  camTo("flash", 600, 720, 2.4, L.l03.start - 0.2, 0.4, 880, "power2.inOut");
  T(`tl.set("#fl-mx", {scaleX:-1, svgOrigin:"560 1070"}, ${r(L.l03.start)});`);
  talk("fl-mx", "l03");
  T(`tl.set("#fl-mx", {scaleX:1, svgOrigin:"560 1070"}, ${r(L.l03.end + 0.1)});`);
  camTo("flash", 760, 720, 2.4, L.l04.start - 0.2, 0.4, 880, "power2.inOut");
  expr("fl-n", "neutral", L.l04.start);
  talk("fl-n", "l04");
  camTo("flash", 560, 720, 2.6, L.l05.start - 0.2, 0.5, 880, "power2.inOut");
  expr("fl-mx", "sad", L.l05.start);
  talk("fl-mx", "l05");
  camTo("flash", 760, 720, 2.4, L.l06.start - 0.2, 0.3, 880, "power2.out");
  expr("fl-n", "shock", L.l06.start);
  gesture("fl-n", "headBoth", L.l06.start + 0.1, 0.3);
  talk("fl-n", "l06");
  expr("fl-n", "sad", L.l07.start);
  gesture("fl-n", "rest", L.l07.start, 0.3);
  talk("fl-n", "l07");
  camTo("flash", 560, 720, 2.6, L.l08.start - 0.2, 0.4, 880, "power2.inOut");
  expr("fl-mx", "determined", L.l08.start);
  talk("fl-mx", "l08");
  camTo("flash", 680, 740, 1.9, L.l09.start - 0.2, 0.5, 880, "power2.inOut");
  expr("fl-n", "neutral", L.l09.start);
  T(`tl.to("#zm-flash .fl-pies", {x:-150, duration:.6}, ${r(L.l09.start + 0.4)});`);
  talk("fl-n", "l09");
  T(`tl.to("#fl-white", {opacity:1, duration:.4}, ${r(b - 0.4)});`);
  ["fl-m", "fl-mx", "fl-n"].forEach((id) => blink(id, a, b));
}

/* S3 back in the camp: the meeting, the truth, and he walks away... then turns round */
scene(
  "meet",
  `${rowWorld("mt")}<rect id="mt-white" x="-800" y="-800" width="4000" height="3520" fill="#fff6e0" opacity="0"/>`,
  { bg: "#2a2a5a" },
);
{
  const [a, b] = S.meet;
  T(
    `tl.fromTo("#mt-white", {opacity:1}, {opacity:0, duration:.6, immediateRender:false}, ${r(a)});`,
  );
  camSet("meet", 1760, 700, 2.4, a, 880);
  expr("mt-g", "shock", a);
  expr("mt-m", "cry", a);
  expr("mt-mx", "sad", a);
  talk("mt-g", "l11");
  camTo("meet", 1500, 700, 2.4, L.l12.start - 0.2, 0.4, 880, "power2.inOut");
  talk("mt-m", "l12");
  // the embrace
  camTo("meet", 1640, 720, 2.0, L.l13.start, 0.6, 880, "power2.inOut");
  T(`tl.to("#mt-gw", {x:-150, duration:.5, ease:"power2.out"}, ${r(L.l13.start + 0.3)});`);
  T(`tl.to("#mt-mw", {x:50, duration:.5, ease:"power2.out"}, ${r(L.l13.start + 0.3)});`);
  pose("mt-g", "armL", 70, L.l13.start + 0.6, 0.4);
  pose("mt-m", "armR", -70, L.l13.start + 0.6, 0.4);
  pose("mt-m", "head", 12, L.l13.start + 0.6, 0.4);
  expr("mt-g", "cry", L.l14.start);
  talk("mt-g", "l14");
  talk("mt-m", "l15");
  // to Maxim
  pose("mt-g", "armL", 0, L.l16.start - 0.3, 0.3);
  pose("mt-m", "armR", 0, L.l16.start - 0.3, 0.3);
  pose("mt-m", "head", 0, L.l16.start - 0.3, 0.3);
  T(`tl.to("#mt-gw", {x:-40, duration:.4}, ${r(L.l16.start - 0.3)});`);
  T(`tl.to("#mt-mw", {x:60, duration:.4}, ${r(L.l16.start - 0.3)});`);
  camTo("meet", 1520, 720, 1.7, L.l16.start - 0.3, 0.5, 880, "power2.inOut");
  expr("mt-g", "happy", L.l16.start);
  talk("mt-g", "l16");
  // the handshake; he can't look him in the eye
  gesture("mt-g", "pointR", L.l17.start + 0.3, 0.3);
  T(`tl.set("#mt-g", {scaleX:-1, svgOrigin:"1760 1080"}, ${r(L.l17.start + 0.2)});`);
  T(`tl.to("#mt-xw", {x:80, duration:.4}, ${r(L.l17.start + 0.4)});`);
  gesture("mt-mx", "pointR", L.l17.start + 0.6, 0.3);
  pose("mt-mx", "head", 14, W("глаза", 1, L.l17.start) - 0.2, 0.4);
  T(`tl.set("#mt-g", {scaleX:1, svgOrigin:"1760 1080"}, ${r(L.l18.start - 0.2)});`);
  gesture("mt-g", "rest", L.l18.start - 0.2, 0.3);
  gesture("mt-mx", "rest", L.l18.start - 0.2, 0.3);
  T(`tl.to("#mt-xw", {x:0, duration:.4}, ${r(L.l18.start - 0.2)});`);
  // the boys
  camTo("meet", 1560, 700, 2.4, L.l18.start - 0.2, 0.4, 880, "power2.inOut");
  expr("mt-m", "sad", L.l18.start);
  talk("mt-m", "l18");
  camTo("meet", 1720, 700, 2.4, L.l19.start - 0.2, 0.4, 880, "power2.inOut");
  expr("mt-g", "cry", L.l19.start);
  talk("mt-g", "l19");
  T(`tl.to("#mt-gw .hat", {y:-40, duration:.4}, ${r(L.l20.start)});`);
  talk("mt-g", "l20");
  camTo("meet", 1560, 700, 2.4, L.l21.start - 0.2, 0.4, 880, "power2.inOut");
  expr("mt-m", "determined", L.l21.start);
  talk("mt-m", "l21");
  // the nut-ring
  camTo("meet", 1720, 700, 2.4, L.l22.start - 0.2, 0.4, 880, "power2.inOut");
  expr("mt-g", "neutral", L.l22.start);
  talk("mt-g", "l22");
  camTo("meet", 1520, 720, 1.8, L.l23.start - 0.2, 0.4, 880, "power2.inOut");
  expr("mt-m", "scared", L.l23.start);
  // the talk
  camTo("meet", 1330, 700, 2.4, L.l24.start - 0.2, 0.4, 880, "power2.inOut");
  expr("mt-mx", "determined", L.l24.start);
  talk("mt-mx", "l24");
  camTo("meet", 1720, 700, 2.4, L.l25.start - 0.2, 0.4, 880, "power2.inOut");
  expr("mt-g", "happy", L.l25.start);
  talk("mt-g", "l25");
  camTo("meet", 1330, 700, 2.4, L.l26.start - 0.2, 0.4, 880, "power2.inOut");
  expr("mt-mx", "sad", L.l26.start);
  talk("mt-mx", "l26");
  camTo("meet", 1720, 700, 2.4, L.l27.start - 0.2, 0.4, 880, "power2.inOut");
  expr("mt-g", "neutral", L.l27.start);
  talk("mt-g", "l27");
  camTo("meet", 1560, 700, 2.4, L.l28.start - 0.2, 0.4, 880, "power2.inOut");
  expr("mt-m", "cry", L.l28.start);
  talk("mt-m", "l28");
  camTo("meet", 1720, 700, 2.6, L.l29.start - 0.2, 0.4, 880, "power2.out");
  expr("mt-g", "shock", L.l29.start);
  talk("mt-g", "l29");
  camTo("meet", 1330, 700, 2.4, L.l30.start - 0.2, 0.4, 880, "power2.inOut");
  gesture("mt-mx", "open", L.l30.start + 0.5, 0.3);
  talk("mt-mx", "l30");
  camTo("meet", 1560, 700, 2.6, L.l31.start - 0.2, 0.5, 880, "power2.inOut");
  talk("mt-m", "l31");
  // silence
  camTo("meet", 1540, 760, 1.3, L.l32.start, 1.4, 900, "sine.inOut");
  camTo("meet", 1720, 700, 3.0, L.l33.start - 0.2, 0.5, 880, "power2.inOut");
  talk("mt-g", "l33");
  camTo("meet", 1560, 700, 2.8, L.l34.start - 0.2, 0.4, 880, "power2.inOut");
  talk("mt-m", "l34");
  camTo("meet", 1720, 700, 2.4, L.l35.start, 0.5, 880, "power2.inOut");
  T(
    `tl.to("#mt-g .head", {keyframes:[{rotation:-10,duration:.6},{rotation:10,duration:.8},{rotation:6,duration:.6}], transformOrigin:"50% 92%"}, ${r(L.l35.start + 0.3)});`,
  );
  expr("mt-g", "sad", L.l35.start + 2.0);
  talk("mt-g", "l36");
  camTo("meet", 1330, 700, 2.4, L.l37.start - 0.2, 0.3, 880, "power2.out");
  talk("mt-mx", "l37");
  camTo("meet", 1720, 700, 2.6, L.l38.start - 0.1, 0.3, 880, "power2.out");
  expr("mt-g", "angry", L.l38.start);
  talk("mt-g", "l38");
  // he walks away
  camTo("meet", 1700, 760, 1.4, L.l39.start, 1.0, 900, "power2.inOut");
  T(`tl.set("#mt-gw .back", {opacity:1}, ${r(L.l39.start + 0.3)});`);
  walk("mt-g", L.l39.start + 0.4, L.l40.start + 0.4, 0, 0, 0.36, 18);
  T(
    `tl.to("#mt-gw", {x:380, duration:${r(L.l40.start - L.l39.start)}, ease:"none"}, ${r(L.l39.start + 0.4)});`,
  );
  expr("mt-m", "cry", L.l40.start);
  gesture("mt-m", "open", L.l40.start, 0.2);
  camTo("meet", 1800, 740, 1.6, L.l40.start - 0.2, 0.6, 900, "power2.inOut");
  talk("mt-m", "l40");
  // ...stops, and slowly turns round
  camTo("meet", 2180, 700, 2.8, L.l41.start, b - L.l41.start, 880, "power2.inOut");
  expr("mt-g", "sad", W("обернулся") - 0.2);
  T(`tl.to("#mt-gw .back", {opacity:0, duration:.5}, ${r(W("обернулся") - 0.2)});`);
  ["mt-g", "mt-m", "mt-mx"].forEach((id) => blink(id, a, b));
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
  "молодую обрюхатил соседа друга глеба натворил простит глаза живая обнял спасибо мальчики найдём гайка вместе прости беременна него да детей молчи подожди обернулся".split(
    " ",
  ),
);
const DANGER = new Set("бей".split(" "));
const hook = `<div id="hook" class="clip toptitle" data-start="0.2" data-duration="${r(L.l01.start - 0.1)}" data-track-index="2" style="z-index:5"><div class="tt-s">${spl("ГЛЕБ", "hs")}</div><div class="tt-a">${spl("ЧАСТЬ 14", "ha")}</div></div>`;
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
const stamps = [stamp("st-fb", S.flash[0] + 0.3, S.flash[0] + 2.2, "ФЛЕШБЕК", "#ffcf7a")].join(
  "\n",
);
const title = `<div id="tbc" class="clip" data-start="${TITLE[0]}" data-duration="${r(TITLE[1] - TITLE[0])}" data-track-index="4" style="z-index:8"><div id="tbc-a">${spl("ПРОДОЛЖЕНИЕ СЛЕДУЕТ…", "ta")}</div><div id="tbc-b">ЧАСТЬ 15</div></div>`;
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
  ["room_day", 0, S.look[1], 0.45],
  ["buzz", S.flash[0] - 0.4, 1.2, 0.4],
  ["room_day", S.flash[0], S.flash[1] - S.flash[0], 0.4],
  ["buzz", S.meet[0] - 0.4, 1.2, 0.4],
  ["room_day", S.meet[0], 26, 0.45],
  ["room_day", S.meet[0] + 26, 26, 0.45],
  ["room_day", S.meet[0] + 52, 26, 0.45],
  ["room_day", S.meet[0] + 78, 26, 0.45],
  ["room_day", S.meet[0] + 104, 26, 0.45],
  ["room_day", S.meet[0] + 130, Math.max(0.5, CUT - S.meet[0] - 130), 0.45],
].filter(([, , , v]) => v > 0);
const audio = [
  `<audio id="vo" class="clip" src="assets/vo.wav" data-start="0" data-duration="${r(L.l41.end + 0.1)}" data-track-index="10" data-volume="1"></audio>`,
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
<title>Глеб — часть 14</title>
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
