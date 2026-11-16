// "Глеб — часть 8": two months on, a winter dacha; Masha and Maxim, guilt, firewood, a toy hare.
// Run from gleb/p8: node build.mjs → index.html (sfx shared via assets/sfx symlink).
import fs from "node:fs";
import * as R from "../art/rig.js";
import * as F8 from "./art8.js";

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
const CUT = r(L.l35.end + 1.6);
const TITLE = [CUT, r(CUT + 3.2)];
const CARD_START = r(TITLE[1] + 0.1);
const CARD_DUR = 3.6;
const TOTAL = r(CARD_START + CARD_DUR);
const S = {};
{
  const ends = [
    ["dacha", L.l02.end + 0.5],
    ["bed", L.l12.end + 0.9],
    ["kitchen", L.l16.end + 0.5],
    ["table", L.l26.end + 0.9],
    ["wood", L.l34.end + 0.5],
    ["eyes", CUT],
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

/* S1 two months later: the dacha in the snow */
scene("dacha", `${room(F8.dacha())}${F8.snow("snowfx")}`, { bg: "#2a3a5a" });
{
  const [a, b] = S.dacha;
  camSet("dacha", 540, 600, 1.0, a, 900);
  snowFall("dacha", a, b);
  camTo("dacha", 440, 700, 1.9, a + 0.5, b - a - 0.5, 900, "sine.inOut");
}

/* S2 the bed: together, then guilt */
scene(
  "bed",
  `${room(F8.bedroom())}
   ${C("bd-mx", MXB(), 450, 985)}
   ${C("bd-m", R.masha({ outfit: "night" }), 620, 990)}
   ${room(F8.quilt())}
   <g id="bd-arm"><path d="M440 800 Q540 760 640 790" stroke="#56603e" stroke-width="30" fill="none" stroke-linecap="round"/><path d="M440 800 Q540 760 640 790" stroke="#0b0d14" stroke-width="34" fill="none" stroke-linecap="round" opacity=".25"/><circle cx="646" cy="790" r="15" fill="#d9a07c" stroke="#0b0d14" stroke-width="2.4"/></g>
   ${hearts("bd-h1", 540, 600)}${hearts("bd-h2", 540, 560)}
   <rect id="bd-fade" x="-800" y="-800" width="2680" height="3520" fill="#000" opacity="0"/>`,
  { bg: "#6a4630" },
);
{
  const [a, b] = S.bed;
  camSet("bed", 540, 640, 1.2, a, 880);
  expr("bd-mx", "neutral", a);
  expr("bd-m", "neutral", a);
  // asleep at first
  ["bd-mx", "bd-m"].forEach((id) => {
    T(
      `tl.set("#${id} .eyes-closed", {opacity:1}, ${r(a)}); tl.set("#${id} .eyes-open", {opacity:0}, ${r(a)});`,
    );
  });
  pose("bd-m", "head", -14, a, 0.01);
  pose("bd-mx", "head", 8, a, 0.01);
  T(
    `tl.to("#bd-mx .body, #bd-m .body", {keyframes:[{y:-3,duration:1.2},{y:0,duration:1.2}], repeat:1}, ${r(a)});`,
  );
  camTo("bed", 540, 720, 1.9, a + 0.3, L.l03.end - a, 880, "sine.inOut");
  // she wakes
  expr("bd-m", "happy", L.l04.start - 0.3);
  camTo("bed", 600, 720, 2.4, L.l04.start - 0.3, 0.6, 880, "power2.inOut");
  talk("bd-m", "l04");
  expr("bd-mx", "happy", L.l05.start - 0.1);
  camTo("bed", 480, 720, 2.4, L.l05.start - 0.3, 0.6, 880, "power2.inOut");
  talk("bd-mx", "l05");
  heartsUp("bd-h1", W("сердце"), L.l05.end + 0.4);
  camTo("bed", 540, 720, 2.0, L.l06.start - 0.3, 0.6, 880, "power2.inOut");
  talk("bd-m", "l06");
  T(
    `tl.to("#bd-m .head", {keyframes:[{rotation:-20,duration:.2},{rotation:-12,duration:.2},{rotation:-18,duration:.2},{rotation:-14,duration:.2}], transformOrigin:"50% 92%"}, ${r(L.l06.start + 0.2)});`,
  );
  talk("bd-mx", "l07");
  heartsUp("bd-h2", L.l07.end - 0.6, L.l08.start + 1.0);
  // she turns away
  T(`tl.to("#bd-m", {x:20, duration:.6}, ${r(W("отвернулась") - 0.2)});`);
  pose("bd-m", "head", 16, W("отвернулась") - 0.2, 0.6);
  expr("bd-m", "sad", W("отвернулась"));
  T(`tl.to("#bd-arm", {opacity:0, duration:.5}, ${r(W("отвернулась"))});`);
  camTo("bed", 620, 720, 2.5, L.l09.start - 0.4, 0.8, 880, "power2.inOut");
  talk("bd-m", "l09");
  expr("bd-mx", "sad", L.l10.start - 0.2);
  pose("bd-mx", "head", 0, L.l10.start, 0.4);
  camTo("bed", 460, 720, 2.5, L.l10.start - 0.3, 0.6, 880, "power2.inOut");
  talk("bd-mx", "l10");
  expr("bd-m", "cry", L.l11.start - 0.1);
  camTo("bed", 620, 720, 2.6, L.l11.start - 0.3, 0.6, 880, "power2.inOut");
  talk("bd-m", "l11");
  // he holds her again
  camTo("bed", 540, 720, 2.1, L.l12.start - 0.3, 0.8, 880, "power2.inOut");
  expr("bd-mx", "determined", L.l12.start);
  T(`tl.to("#bd-arm", {opacity:1, duration:.5}, ${r(W("слово") - 0.2)});`);
  T(`tl.to("#bd-m", {x:0, duration:.6}, ${r(W("пока", 1) - 0.1)});`);
  pose("bd-m", "head", -14, W("пока", 1), 0.6);
  expr("bd-mx", "happy", W("обиду") - 0.2);
  talk("bd-mx", "l12");
  camTo("bed", 540, 660, 1.3, L.l12.end, b - L.l12.end, 880, "sine.inOut");
  T(`tl.to("#bd-fade", {opacity:1, duration:.5}, ${r(b - 0.5)});`);
  blink("bd-mx", L.l04.start, b);
  blink("bd-m", L.l04.start, b);
}

/* S3 morning: the stove */
scene(
  "kitchen",
  `${room(F8.kitchen())}
   ${C("kt-m", R.masha(), 250, 1060)}
   ${C("kt-mx", MXB(), 780, 1060)}`,
  { bg: "#6a4630" },
);
{
  const [a, b] = S.kitchen;
  camSet("kitchen", 300, 640, 1.6, a, 880);
  T(
    `tl.fromTo("#zm-kitchen .stovefire", {opacity:0}, {opacity:1, duration:.6, immediateRender:false}, ${r(L.l13.start + 1.2)});`,
  );
  T(
    `tl.to("#zm-kitchen .stovefire", {keyframes:${JSON.stringify(Array.from({ length: Math.round((b - L.l13.start - 1.8) / 0.15) }, (_, i) => ({ opacity: 0.8 + ((i * 7) % 3) * 0.1, duration: 0.15 })))}}, ${r(L.l13.start + 1.8)});`,
  );
  expr("kt-m", "neutral", a);
  pose("kt-m", "armR", -40, L.l13.start + 0.6, 0.3);
  T(`tl.set("#kt-m", {scaleX:-1, svgOrigin:"250 1060"}, ${r(a)});`);
  // Maxim and his back
  camTo("kitchen", 760, 680, 2.0, L.l14.start - 0.3, 0.6, 880, "power2.inOut");
  expr("kt-mx", "pain", L.l14.start);
  pose("kt-mx", "armL", 60, L.l14.start, 0.3);
  pose("kt-mx", "armL-lo", 90, L.l14.start, 0.3);
  T(`tl.to("#kt-mx .body", {rotation:-6, svgOrigin:"100 410", duration:.4}, ${r(L.l14.start)});`);
  talk("kt-mx", "l14");
  // she teases
  camTo("kitchen", 300, 680, 2.0, L.l15.start - 0.3, 0.5, 880, "power2.inOut");
  T(`tl.set("#kt-m", {scaleX:1, svgOrigin:"250 1060"}, ${r(L.l15.start - 0.2)});`);
  pose("kt-m", "armR", 0, L.l15.start - 0.2, 0.2);
  expr("kt-m", "happy", L.l15.start);
  talk("kt-m", "l15");
  // proud
  camTo("kitchen", 760, 680, 2.0, L.l16.start - 0.3, 0.5, 880, "power2.inOut");
  T(`tl.to("#kt-mx .body", {rotation:0, svgOrigin:"100 410", duration:.3}, ${r(L.l16.start)});`);
  expr("kt-mx", "happy", L.l16.start);
  gesture("kt-mx", "cheer", L.l16.start + 0.2, 0.3);
  talk("kt-mx", "l16");
  ["kt-m", "kt-mx"].forEach((id) => blink(id, a, b));
}

/* S4 breakfast; the photo; the axe */
scene(
  "table",
  `${room(F8.kitchen())}
   ${C("tb-m", R.masha(), 380, 975)}
   <g id="tb-mx0">${C("tb-mx", MXB(), 720, 970)}</g>
   <g id="tb-mx1" opacity="0">${C("tb-mxa", MXB({ helmet: true, prop: "axe" }), 720, 970)}</g>
   <g id="tb-table">${room(F8.table())}</g>`,
  { bg: "#6a4630" },
);
{
  const [a, b] = S.table;
  camSet("table", 540, 760, 1.3, a, 900);
  T(`tl.set("#zm-table .stovefire", {opacity:1}, ${r(a)});`);
  T(
    `tl.fromTo("#zm-table .steam", {y:0, opacity:.7}, {y:-20, opacity:0, duration:1.4, repeat:${Math.round((b - a) / 1.4)}, stagger:.3, immediateRender:false}, ${r(a)});`,
  );
  expr("tb-m", "happy", a);
  expr("tb-mx", "happy", a);
  camTo("table", 560, 760, 1.6, a + 0.3, L.l17.end - a, 900, "sine.inOut");
  camTo("table", 400, 740, 2.1, L.l18.start - 0.3, 0.5, 880, "power2.inOut");
  gesture("tb-m", "pointR", L.l18.start, 0.3);
  talk("tb-m", "l18");
  gesture("tb-m", "rest", L.l18.end, 0.3);
  camTo("table", 700, 740, 2.1, L.l19.start - 0.3, 0.5, 880, "power2.inOut");
  T(
    `tl.to("#tb-mx .body", {keyframes:[{y:-6,duration:.15},{y:0,duration:.15}], repeat:3}, ${r(L.l19.start + 0.2)});`,
  );
  talk("tb-mx", "l19");
  camTo("table", 400, 740, 2.1, L.l20.start - 0.3, 0.4, 880, "power2.inOut");
  expr("tb-m", "happy", L.l20.start);
  gesture("tb-m", "headBoth", L.l20.start + 0.1, 0.3);
  talk("tb-m", "l20");
  gesture("tb-m", "rest", L.l20.end + 0.2, 0.4);
  // the photo on the shelf
  camTo("table", 675, 248, 3.4, W("фотографию") - 0.2, 1.4, 900, "power2.inOut");
  expr("tb-m", "sad", W("фотографию"));
  camTo("table", 400, 740, 2.2, L.l22.start - 0.3, 0.6, 880, "power2.inOut");
  talk("tb-m", "l22");
  expr("tb-mx", "sad", L.l23.start - 0.2);
  camTo("table", 700, 740, 2.1, L.l23.start - 0.3, 0.5, 880, "power2.inOut");
  talk("tb-mx", "l23");
  // firewood
  expr("tb-mx", "determined", L.l24.start);
  T(`tl.to("#tb-mx0", {y:-70, duration:.5, ease:"power2.out"}, ${r(L.l24.start)});`);
  talk("tb-mx", "l24");
  camTo("table", 400, 740, 2.1, L.l25.start - 0.3, 0.4, 880, "power2.inOut");
  expr("tb-m", "scared", L.l25.start);
  talk("tb-m", "l25");
  // he grabs the axe and the ear-flapped cap
  T(`tl.set("#tb-mx1", {y:-70}, ${r(a)});`);
  hide("#tb-mx0", L.l26.start - 0.2);
  show("#tb-mx1", L.l26.start - 0.2);
  expr("tb-mxa", "happy", a);
  gesture("tb-mxa", "cheer", L.l26.start, 0.3);
  camTo("table", 700, 720, 2.0, L.l26.start - 0.3, 0.4, 880, "power2.inOut");
  talk("tb-mxa", "l26");
  gesture("tb-mxa", "rest", L.l26.end, 0.3);
  T(`tl.to("#tb-mx1", {x:500, duration:.8, ease:"power1.in"}, ${r(L.l26.end + 0.1)});`);
  walk("tb-mxa", L.l26.end + 0.1, b, 0, 0, 0.25, 22);
  ["tb-m", "tb-mx", "tb-mxa"].forEach((id) => blink(id, a, b));
}

/* S5 the birch wood: chopping, then small footprints and a toy hare */
scene(
  "wood",
  `<g>${P("wd-art", F8.wood(), 0, 1100, 2160)}</g>
   ${C("wd-mx", MXB({ helmet: true, prop: "axe" }), 300, 1000)}
   <g class="chips" opacity="0">${[0, 1, 2, 3, 4].map((k) => `<rect class="chip" x="${700 + k * 6}" y="${720 + k * 8}" width="14" height="8" fill="#e9dcc0" stroke="#0b0d14" stroke-width="1.6"/>`).join("")}</g>
   ${F8.snow("snowfx")}`,
  { bg: "#e9eef5" },
);
{
  const [a, b] = S.wood;
  camSet("wood", 500, 700, 1.3, a, 900);
  snowFall("wood", a, b);
  expr("wd-mx", "happy", a);
  walk("wd-mx", a + 0.2, L.l28.start - 0.2, 320, 0, 0.3, 22, false);
  camTo("wood", 640, 680, 1.8, a + 0.3, L.l28.start - a - 0.3, 880, "sine.inOut");
  talk("wd-mx", "l28");
  // chop, chop
  [W("раз"), W("два", 1, L.l28.start)].forEach((t) => {
    pose("wd-mx", "armR", -160, t - 0.35, 0.25);
    pose("wd-mx", "armR", -40, t, 0.1, "power4.in");
    T(
      `tl.fromTo("#zm-wood .chips", {opacity:1}, {opacity:0, duration:.5, immediateRender:false}, ${r(t + 0.05)});`,
    );
    T(
      `tl.fromTo("#zm-wood .chip", {x:0, y:0}, {x:(i)=>[-60,40,-30,70,10][i], y:(i)=>[-50,-70,-30,-40,-80][i], duration:.5, immediateRender:false}, ${r(t + 0.05)});`,
    );
    shake("#sh-wood", t + 0.05, 3, 4);
  });
  pose("wd-mx", "armR", 0, L.l28.end + 0.2, 0.3);
  expr("wd-mx", "tired", L.l29.start);
  gesture("wd-mx", "headR", L.l29.start + 0.1, 0.3);
  talk("wd-mx", "l29");
  gesture("wd-mx", "rest", L.l29.end, 0.3);
  // footprints
  camTo("wood", 1350, 900, 1.6, L.l30.start + 1.0, 1.4, 900, "power2.inOut");
  expr("wd-mx", "shock", L.l31.start);
  camTo("wood", 700, 720, 2.0, L.l31.start - 0.2, 0.5, 880, "power2.inOut");
  talk("wd-mx", "l31");
  walk("wd-mx", L.l31.end, L.l33.start - 0.2, 1180, 0, 0.32, 20);
  camTo("wood", 1900, 820, 1.6, L.l31.end + 0.2, L.l32.end - L.l31.end, 900, "sine.inOut");
  // he kneels and picks up the hare
  T(`tl.to("#wd-mx", {y:80, duration:.4}, ${r(L.l33.start - 0.2)});`);
  camTo("wood", 1880, 760, 2.4, L.l33.start - 0.3, 0.5, 880, "power2.inOut");
  expr("wd-mx", "sad", L.l33.start + 0.2);
  talk("wd-mx", "l33");
  T(`tl.to("#wd-mx", {y:0, duration:.4}, ${r(L.l34.start - 0.2)});`);
  expr("wd-mx", "determined", L.l34.start);
  gesture("wd-mx", "open", L.l34.start, 0.3);
  camTo("wood", 1800, 700, 1.4, L.l34.start - 0.2, 0.6, 880, "power2.out");
  talk("wd-mx", "l34");
  blink("wd-mx", a, b);
}

/* S6 eyes in the thicket */
scene("eyes", `${room(F8.thicket())}${F8.snow("snowfx")}`, { bg: "#0a1218" });
{
  const [a, b] = S.eyes;
  camSet("eyes", 540, 660, 1.2, a, 900);
  snowFall("eyes", a, b);
  T(`tl.set("#zm-eyes .eye", {opacity:0}, ${r(a)});`);
  T(
    `tl.to("#zm-eyes .eye", {opacity:1, duration:.15, stagger:.4}, ${r(W("глаза", 1, L.l35.start) - 1.2)});`,
  );
  T(
    `tl.to("#zm-eyes .eye", {scaleY:.1, transformOrigin:"50% 50%", duration:.08, yoyo:true, repeat:1, stagger:.3}, ${r(L.l35.end + 0.3)});`,
  );
  camTo("eyes", 520, 640, 1.9, a, b - a, 880, "sine.in");
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
  "месяца обнимку машенька сердце двадцать красавец муж дети сын живы слово обиду фотографию волки танк следы детские заяц глаза".split(
    " ",
  ),
);
const DANGER = new Set("прощу пацаны".split(" "));
const hook = `<div id="hook" class="clip toptitle" data-start="0.2" data-duration="${r(L.l01.start - 0.1)}" data-track-index="2" style="z-index:5"><div class="tt-s">${spl("ГЛЕБ", "hs")}</div><div class="tt-a">${spl("ЧАСТЬ 8", "ha")}</div></div>`;
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
  stamp("st-skip", L.l01.start - 0.1, L.l02.start + 1.2, "2 МЕСЯЦА СПУСТЯ", "#9fd2ff"),
].join("\n");
const title = `<div id="tbc" class="clip" data-start="${TITLE[0]}" data-duration="${r(TITLE[1] - TITLE[0])}" data-track-index="4" style="z-index:8"><div id="tbc-a">${spl("ПРОДОЛЖЕНИЕ СЛЕДУЕТ…", "ta")}</div><div id="tbc-b">ЧАСТЬ 9</div></div>`;
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
  ["room_day", 0, S.dacha[1], 0.5],
  ["room_night", S.bed[0], 31, 0.5],
  ["room_night", S.bed[0] + 31, S.bed[1] - S.bed[0] - 31, 0.5],
  ["fire", S.kitchen[0], 20, 0.35],
  ["fire", S.kitchen[0] + 20, S.table[1] - S.kitchen[0] - 20, 0.35],
  ["click", L.l13.start + 1.1, 0.06, 1.0],
  ["door", S.table[1] - 0.3, 0.35, 0.9],
  ["room_day", S.wood[0], 26, 0.5],
  ["slam", W("раз") + 0.02, 0.5, 0.9],
  ["slam", W("два", 1, L.l28.start) + 0.02, 0.5, 0.9],
  ["room_night", S.eyes[0], CUT - S.eyes[0], 0.6],
].filter(([, , , v]) => v > 0);
const audio = [
  `<audio id="vo" class="clip" src="assets/vo.wav" data-start="0" data-duration="${r(L.l35.end + 0.1)}" data-track-index="10" data-volume="1"></audio>`,
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
<title>Глеб — часть 8</title>
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
