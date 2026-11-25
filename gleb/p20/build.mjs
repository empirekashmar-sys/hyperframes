// "Глеб — часть 20": Masha in the box, protocol "Harvest", Omega chooses, Valkyrie's pistol.
// Run from gleb/p20: node build.mjs → index.html (sfx shared via assets/sfx symlink).
import fs from "node:fs";
import * as R from "../art/rig.js";
import * as F18 from "../p18/art18.js";
import * as F20 from "./art20.js";

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
const CUT = r(L.l40.end + 2.0);
const TITLE = [CUT, r(CUT + 3.2)];
const CARD_START = r(TITLE[1] + 0.1);
const CARD_DUR = 3.6;
const TOTAL = r(CARD_START + CARD_DUR);
const S = {};
{
  const ends = [
    ["corr", L.l01.end + 0.8],
    ["lab", L.l06.end + 0.8],
    ["office", L.l11.end + 0.9],
    ["talk", L.l19.end + 0.9],
    ["cell", L.l29.end + 0.9],
    ["dark", CUT],
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
let seed = 97;
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
const night = (id) =>
  `<rect id="${id}" x="-800" y="-800" width="2680" height="3520" fill="#05081a" opacity=".45"/>`;
const say = (k, id, lid, x, y = 700, s = 2.1) => {
  camTo(k, x, y, s, L[lid].start - 0.3, 0.5, 900, "power2.inOut");
  talk(id, lid);
};

/* S1 the corridor: Masha led in */
scene(
  "corr",
  `${room(F18.corridor())}
   <g id="cr-gw">${C("cr-g", GO(), 0, 1080)}</g>
   <g id="cr-mw">${C("cr-m", MP(), 0, 1080)}</g>
   <g id="cr-bw">${big(0, 1080, 1.12, C("cr-b", OM(0, { kit: true }), 0, 1080))}</g>
   <g id="cr-fw">${C("cr-f", OM(1, { kit: true }), 0, 1080)}</g>`,
  { bg: "#7a7e86" },
);
{
  const [a, b] = S.corr;
  camSet("corr", 540, 740, 1.05, a, 900);
  const st = [
    ["cr-gw", "cr-g", -150, 920],
    ["cr-mw", "cr-m", -420, 600],
    ["cr-bw", "cr-b", -620, 380],
    ["cr-fw", "cr-f", -800, 240],
  ];
  st.forEach(([w, id, x0, x1]) => {
    T(`tl.set("#${w}", {x:${x0}}, ${r(a)});`);
    walk(id, a + 0.2, b, 0, 0, 0.36, 15);
    T(`tl.to("#${w}", {x:${x1}, duration:${r(b - a - 0.2)}, ease:"none"}, ${r(a + 0.2)});`);
  });
  expr("cr-m", "angry", a);
  expr("cr-g", "neutral", a);
  ["cr-b", "cr-f"].forEach((id) => expr(id, "determined", a));
  camTo("corr", 560, 700, 1.6, a + 1.0, b - a - 1.0, 900, "sine.inOut");
  blink("cr-m", a, b);
}

/* S2 the lab: the sterile box */
scene(
  "lab",
  `${room(F20.lab())}
   ${C("lb-m", MP(), 900, 860)}
   ${room(F20.glass())}
   ${C("lb-d", OM(3), 110, 1080)}
   ${C("lb-p", R.professor(), 330, 1080)}
   ${C("lb-g", GO(), 560, 1080)}`,
  { bg: "#dfe6ea" },
);
{
  const [a, b] = S.lab;
  camSet("lab", 540, 640, 1.0, a, 900);
  T(
    `tl.to("#zm-lab .ecg", {x:-30, duration:.5, repeat:${Math.round((b - a) / 0.5)}, ease:"none"}, ${r(a)});`,
  );
  ["lb-d", "lb-p", "lb-g"].forEach((id) => expr(id, "neutral", a));
  expr("lb-m", "angry", a);
  expr("lb-p", "happy", L.l02.start);
  gesture("lb-p", "open", L.l02.start + 0.6, 0.3);
  say("lab", "lb-p", "l02", 330, 700, 2.0);
  gesture("lb-p", "rest", L.l02.end, 0.3);
  say("lab", "lb-m", "l03", 900, 520, 2.0);
  say("lab", "lb-p", "l04", 330, 700, 2.0);
  expr("lb-d", "sad", L.l05.start);
  say("lab", "lb-d", "l05", 140, 700, 2.0);
  expr("lb-g", "sad", L.l06.start);
  say("lab", "lb-g", "l06", 560, 700, 2.2);
  camTo("lab", 760, 600, 1.4, L.l06.end, b - L.l06.end, 900, "sine.inOut");
  ["lb-d", "lb-p", "lb-g", "lb-m"].forEach((id) => blink(id, a, b));
}

/* S3 the general's office: "Harvest", overheard by Fox */
scene(
  "office",
  `${room(F18.office())}
   ${C("of-gn", R.general(), 540, 1000)}
   ${room(F18.desk())}
   ${C("of-p", R.professor(), 200, 1090)}
   ${room(F20.doorAjar())}
   <g id="of-fw" opacity="0">${C("of-f", OM(1), 1070, 1090)}</g>`,
  { bg: "#4a3a30" },
);
{
  const [a, b] = S.office;
  camSet("office", 760, 700, 1.1, a, 900);
  expr("of-gn", "neutral", a);
  expr("of-p", "neutral", a);
  show("#of-fw", a + 0.6);
  T(
    `tl.fromTo("#of-fw", {x:160}, {x:0, duration:1.2, ease:"power1.out", immediateRender:false}, ${r(a + 0.6)});`,
  );
  expr("of-f", "neutral", a);
  camTo("office", 1000, 700, 2.0, a + 0.5, L.l07.end - a - 0.5, 900, "sine.inOut");
  say("office", "of-p", "l08", 240, 700, 2.0);
  expr("of-f", "shock", W("понадобится") - 0.2);
  camTo("office", 1060, 660, 2.6, W("понадобится") - 0.1, 0.4, 900, "power2.out");
  say("office", "of-gn", "l09", 540, 660, 2.0);
  expr("of-gn", "determined", L.l09.start);
  say("office", "of-p", "l10", 240, 700, 2.0);
  expr("of-f", "determined", L.l11.start);
  camTo("office", 1060, 680, 2.4, L.l11.start - 0.3, 0.5, 900, "power2.inOut");
  T(`tl.to("#of-fw", {x:220, duration:1.0, ease:"power1.in"}, ${r(L.l11.end - 0.6)});`);
  ["of-gn", "of-p", "of-f"].forEach((id) => blink(id, a, b));
}

/* S4 night corridor: Fox tells Gleb; Gleb already knows */
scene(
  "talk",
  `${room(F18.corridor())}
   ${night("tk-n")}
   ${C("tk-g", GO(), 400, 1080)}
   ${C("tk-f", OM(1), 690, 1080)}`,
  { bg: "#3a3e46" },
);
{
  const [a, b] = S.talk;
  camSet("talk", 550, 700, 1.4, a, 900);
  expr("tk-g", "neutral", a);
  expr("tk-f", "scared", a);
  const F = (lid, e) => {
    if (e) expr("tk-f", e, L[lid].start - 0.1);
    say("talk", "tk-f", lid, 690, 680, 2.2);
  };
  const G = (lid, e) => {
    if (e) expr("tk-g", e, L[lid].start - 0.1);
    say("talk", "tk-g", lid, 410, 680, 2.2);
  };
  F("l12");
  G("l13", "neutral");
  F("l14", "shock");
  G("l15", "determined");
  F("l16", "angry");
  gesture("tk-f", "fist", L.l16.start + 0.2, 0.2);
  gesture("tk-f", "rest", L.l16.end, 0.3);
  G("l17", "sad");
  F("l18", "sad");
  G("l19", "angry");
  gesture("tk-g", "pointR", L.l19.start + 0.3, 0.2);
  gesture("tk-g", "rest", L.l19.end, 0.3);
  camTo("talk", 550, 700, 1.4, L.l19.end, b - L.l19.end, 900, "sine.inOut");
  ["tk-g", "tk-f"].forEach((id) => blink(id, a, b));
}

/* S5 the box: Gleb and Masha */
scene(
  "cell",
  `${room(F20.lab())}
   ${C("cl-m", MP(), 900, 860)}
   ${room(F20.glass())}
   ${C("cl-g", GO(), 520, 1080)}`,
  { bg: "#dfe6ea" },
);
{
  const [a, b] = S.cell;
  camSet("cell", 700, 640, 1.2, a, 900);
  T(
    `tl.to("#zm-cell .ecg", {x:-30, duration:.5, repeat:${Math.round((b - a) / 0.5)}, ease:"none"}, ${r(a)});`,
  );
  expr("cl-m", "angry", a);
  expr("cl-g", "neutral", a);
  const M = (lid, e) => {
    if (e) expr("cl-m", e, L[lid].start - 0.1);
    say("cell", "cl-m", lid, 900, 520, 2.1);
  };
  const G = (lid, e) => {
    if (e) expr("cl-g", e, L[lid].start - 0.1);
    say("cell", "cl-g", lid, 540, 700, 2.2);
  };
  M("l21");
  G("l22");
  M("l23", "cry");
  gesture("cl-m", "fist", L.l23.start + 1.0, 0.2);
  gesture("cl-m", "rest", L.l23.end, 0.3);
  G("l24", "determined");
  M("l25", "angry");
  G("l26", "shock");
  M("l27", "neutral");
  G("l28", "angry");
  M("l29", "happy");
  camTo("cell", 700, 640, 1.2, L.l29.end, b - L.l29.end, 900, "sine.inOut");
  ["cl-m", "cl-g"].forEach((id) => blink(id, a, b));
}

/* S6 three a.m.: the lights go out, Fox at the box, Gleb in the dark */
scene(
  "dark",
  `${room(F20.lab())}
   ${C("dk-m", MP(), 900, 860)}
   ${room(F20.glass())}
   <rect id="dk-n" x="-800" y="-800" width="2680" height="3520" fill="#03050c" opacity="0"/>
   ${C("dk-q", OM(2), 210, 1080)}
   ${C("dk-d", OM(3), 380, 1080)}
   ${C("dk-f", OM(1), 580, 1080)}
   <g id="dk-gw" opacity="0">${C("dk-g", GO({ prop: "pistol" }), 1020, 1090)}</g>
   <g id="dk-vw" opacity="0">${C("dk-v", R.valkyrie(), -120, 1080)}</g>
   <path id="dk-beam" d="M1000 760 L560 520 L560 1000 Z" fill="#fff6c8" opacity="0"/>
   <circle id="dk-cam" cx="540" cy="110" r="14" fill="#ff2a2a" opacity="0"/>`,
  { bg: "#03050c" },
);
{
  const [a, b] = S.dark;
  camSet("dark", 700, 640, 1.2, a, 900);
  T(`tl.to("#dk-n", {opacity:.82, duration:.3}, ${r(a + 0.4)});`);
  ["dk-q", "dk-d", "dk-f"].forEach((id) => expr(id, "scared", a));
  expr("dk-m", "scared", a);
  expr("dk-g", "determined", a);
  show("#dk-gw", W("ждал") - 0.2);
  T(
    `tl.fromTo("#dk-gw", {opacity:0}, {opacity:.85, duration:.8, immediateRender:false}, ${r(W("ждал") - 0.2)});`,
  );
  camTo("dark", 980, 680, 2.0, W("ждал") - 0.4, 0.8, 900, "power2.inOut");
  say("dark", "dk-f", "l31", 600, 680, 2.2);
  say("dark", "dk-g", "l32", 1000, 680, 2.2);
  expr("dk-f", "shock", L.l32.start + 0.3);
  T(`tl.to("#dk-beam", {opacity:.25, duration:.1}, ${r(W("щёлкнул"))});`);
  T(`tl.to("#dk-n", {opacity:.55, duration:.1}, ${r(W("щёлкнул"))});`);
  camTo("dark", 420, 720, 1.3, L.l33.start + 0.4, 1.0, 900, "power2.inOut");
  say("dark", "dk-d", "l34", 380, 680, 2.2);
  say("dark", "dk-q", "l35", 210, 680, 2.2);
  say("dark", "dk-g", "l36", 1000, 680, 2.2);
  expr("dk-f", "determined", L.l37.start);
  say("dark", "dk-f", "l37", 580, 680, 2.2);
  pose("dk-g", "armR", -95, W("поднял"), 0.25);
  pose("dk-g", "armR-lo", 0, W("поднял"), 0.25);
  camTo("dark", 820, 640, 1.6, W("поднял"), 0.6, 900, "power2.inOut");
  show("#dk-vw", L.l39.start - 0.4);
  expr("dk-v", "happy", L.l39.start);
  T(
    `tl.fromTo("#dk-vw", {x:-120}, {x:0, duration:.5, ease:"power2.out", immediateRender:false}, ${r(L.l39.start - 0.4)});`,
  );
  say("dark", "dk-v", "l39", 0, 680, 2.0);
  yoyo("#dk-cam", "opacity:1", L.l40.start, CUT, 0.3);
  shake("#sh-dark", W("щёлкнул"), 3, 5);
  camTo("dark", 540, 160, 3.0, L.l40.start, 1.0, 900, "power2.inOut");
  camTo("dark", 1000, 680, 2.4, L.l40.end + 0.3, CUT - L.l40.end - 0.3, 900, "sine.inOut");
  ["dk-q", "dk-d", "dk-f", "dk-g", "dk-v", "dk-m"].forEach((id) => blink(id, a, b));
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
  "гранит ценный жатва знаю присягу верен цена приказ записку омега генерал смотрит".split(" "),
);
const DANGER = new Set(
  "клетке понадобится убьют опыты вирус сжечь пёс стреляй пистолет камеры".split(" "),
);
const hook = `<div id="hook" class="clip toptitle" data-start="0.2" data-duration="${r(L.l01.start - 0.1)}" data-track-index="2" style="z-index:5"><div class="tt-s">${spl("ГЛЕБ", "hs")}</div><div class="tt-a">${spl("ЧАСТЬ 20", "ha")}</div></div>`;
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
  stamp("st-know", L.l13.start, L.l13.end + 0.8, "Я ЗНАЮ", "#ff4a3d"),
  stamp("st-click", W("щёлкнул"), W("щёлкнул") + 1.0, "ЩЁЛК", "#e9eef5"),
].join("\n");
const title = `<div id="tbc" class="clip" data-start="${TITLE[0]}" data-duration="${r(TITLE[1] - TITLE[0])}" data-track-index="4" style="z-index:8"><div id="tbc-a">${spl("ПРОДОЛЖЕНИЕ СЛЕДУЕТ…", "ta")}</div><div id="tbc-b">ЧАСТЬ 21</div></div>`;
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
  ["room_day", 0, S.office[1], 0.35],
  ["buzz", S.lab[0] + 0.2, 1.2, 0.3],
  ["door", S.office[0] + 0.4, 0.35, 0.5],
  ["room_night", S.talk[0], S.talk[1] - S.talk[0], 0.45],
  ["room_day", S.cell[0], S.cell[1] - S.cell[0], 0.3],
  ["slam", S.dark[0] + 0.4, 0.4, 0.6],
  ["room_night", S.dark[0], CUT - S.dark[0], 0.5],
  ["click", W("щёлкнул"), 0.06, 1.4],
  ["click", W("поднял") + 0.2, 0.06, 1.2],
  ["buzz", L.l40.start, 1.2, 0.4],
].filter(([, , , v]) => v > 0);
const audio = [
  `<audio id="vo" class="clip" src="assets/vo.wav" data-start="0" data-duration="${r(L.l40.end + 0.1)}" data-track-index="10" data-volume="1"></audio>`,
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
<title>Глеб — часть 20</title>
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
