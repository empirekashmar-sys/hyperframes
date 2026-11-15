// "Глеб — часть 2". Run from gleb/p2: node build.mjs  → index.html (assets are shared with part 1).
import fs from "node:fs";
import * as A from "../art/art.js";
import * as R from "../art/rig.js";
import * as B from "./art2.js";

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
const CUT = r(L.l16.end + 1.0);
const TITLE = [CUT, r(CUT + 3.4)];
const CARD_START = r(TITLE[1] + 0.1);
const CARD_DUR = 3.6;
const TOTAL = r(CARD_START + CARD_DUR);
const S = {
  wake: [0, r(L.l03.start - 0.1)],
  down: [r(L.l03.start - 0.1), r(L.l04.start - 0.15)],
  maxim: [r(L.l04.start - 0.15), r(L.l07.start - 0.1)],
  base: [r(L.l07.start - 0.1), r(L.l09.start - 0.1)],
  yard: [r(L.l09.start - 0.1), r(L.l12.start - 0.1)],
  road: [r(L.l12.start - 0.1), r(W("но", 1, 40) - 0.1)],
  ruins: [r(W("но", 1, 40) - 0.1), r(L.l16.start - 0.1)],
  back: [r(L.l16.start - 0.1), CUT],
};

/* ───────────── helpers (same as part 1 v2) ───────────── */
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
const C = (id, rig, cx, footY, attrs = "") =>
  P(id, rig.svg, cx - RIG_W / 2, footY + (420 - 404) * (RIG_W / 200), RIG_W, attrs);
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
const ORG = (p) => (p === "head" ? 'transformOrigin:"50% 92%"' : 'svgOrigin:"0 0"');
const part = (id, p) => `#${id} .${p}`;
const pose = (id, p, deg, at, dur = 0.25, ease = "power2.out") =>
  T(
    `tl.to("${part(id, p)}", {rotation:${deg}, ${ORG(p)}, duration:${dur}, ease:"${ease}"}, ${r(at)});`,
  );
// gesture presets (upper, lower) per arm; right arm: negative = outward/up
const GEST = {
  rest: [
    [0, 0],
    [0, 0],
  ],
  headR: [null, [-150, -85]], // right hand on the head
  mouth: [
    [-18, -148],
    [18, 148],
  ], // both hands to the mouth
  fist: [null, [-170, -40]], // right fist up
  pointR: [null, [-95, -10]],
  wave: [null, [-150, 20]],
  open: [
    [50, -20],
    [-50, 20],
  ], // open palms, explaining
  shrug: [
    [60, -70],
    [-60, 70],
  ],
  carry: [
    [-25, -95],
    [25, 95],
  ], // carrying a box in front
};
function gesture(id, name, at, dur = 0.3) {
  const [L, Rr] = GEST[name];
  if (L) {
    pose(id, "armL", L[0], at, dur);
    pose(id, "armL-lo", L[1], at, dur);
  }
  if (Rr) {
    pose(id, "armR", Rr[0], at, dur);
    pose(id, "armR-lo", Rr[1], at, dur);
  }
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
    const elbow = (sg) =>
      JSON.stringify(
        Array.from({ length: n }, (_, k) => ({
          rotation: sg * (k % 2 ? swing * 0.9 : swing * 0.3),
          duration: step,
        })).concat([{ rotation: 0, duration: 0.12 }]),
      );
    T(`tl.to("${part(id, "armL-lo")}", {keyframes:${elbow(1)}, svgOrigin:"0 0"}, ${r(t0)});`);
    T(`tl.to("${part(id, "armR-lo")}", {keyframes:${elbow(-1)}, svgOrigin:"0 0"}, ${r(t0)});`);
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
function talk(id, lineId) {
  const e = lips.find((x) => x.id === lineId);
  let prev = -1;
  e.states.forEach((s, i) => {
    if (s === prev) return;
    const at = r(e.start + i / e.fps);
    T(
      `tl.set("${part(id, "m0")}", {opacity:${s === 0 ? 1 : 0}}, ${at}); tl.set("${part(id, "m1")}", {opacity:${s === 1 ? 1 : 0}}, ${at}); tl.set("${part(id, "m2")}", {opacity:${s === 2 ? 1 : 0}}, ${at});`,
    );
    prev = s;
  });
  const end = r(e.start + e.states.length / e.fps);
  T(
    `tl.set("${part(id, "m0")}", {opacity:1}, ${end}); tl.set("${part(id, "m1")}, ${part(id, "m2")}", {opacity:0}, ${end});`,
  );
  T(
    `tl.to("${part(id, "head")}", {keyframes:[{rotation:-3,duration:.35},{rotation:2,duration:.4},{rotation:-1,duration:.35},{rotation:0,duration:.3}], transformOrigin:"50% 92%"}, ${r(e.start)});`,
  );
}
let seed = 29;
const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
function blink(id, t0, t1) {
  for (let t = t0 + 0.6 + rnd() * 1.5; t < t1 - 0.2; t += 2.4 + rnd() * 2) {
    T(
      `tl.set("${part(id, "eyes-open")}", {opacity:0}, ${r(t)}); tl.set("${part(id, "eyes-closed")}", {opacity:1}, ${r(t)});`,
    );
    T(
      `tl.set("${part(id, "eyes-open")}", {opacity:1}, ${r(t + 0.12)}); tl.set("${part(id, "eyes-closed")}", {opacity:0}, ${r(t + 0.12)});`,
    );
  }
}
const eyes = (id, open, at) =>
  T(
    `tl.set("${part(id, "eyes-open")}", {opacity:${open ? 1 : 0}}, ${r(at)}); tl.set("${part(id, "eyes-closed")}", {opacity:${open ? 0 : 1}}, ${r(at)});`,
  );
const room = (s) => strip(s);
const GLEB = R.gleb({ injured: true, brow: "worried" });

/* ───────────── S1 wake on the stairs ───────────── */
scene(
  "wake",
  `${room(A.stairwell({ floor: 3 }))}
   ${C("w-g", GLEB, 470, 900)}
   <rect id="w-white" x="-500" y="-500" width="2080" height="2920" fill="#fff" opacity="1"/>
   <rect id="w-dark" x="-500" y="-500" width="2080" height="2920" fill="#000" opacity="0"/>`,
  { bg: "#2a3a3a" },
);
{
  const [a] = S.wake;
  camSet("wake", 380, 760, 1.9, a, 900);
  T(`tl.set("#w-g", {rotation:-84, svgOrigin:"470 900", y:30}, ${a});`);
  eyes("w-g", false, a);
  T(`tl.to("#w-white", {opacity:0, duration:1.0, ease:"power2.out"}, ${r(a + 0.05)});`);
  T(
    `tl.fromTo("#w-dark", {opacity:.75}, {keyframes:[{opacity:.2,duration:.5},{opacity:.6,duration:.3},{opacity:.1,duration:.6}], immediateRender:false}, ${r(a + 0.9)});`,
  );
  T(
    `tl.fromTo("#zm-wake", {rotation:-8, svgOrigin:"540 900"}, {rotation:0, duration:${r(L.l02.start - a)}, ease:"sine.inOut", immediateRender:false}, ${a});`,
  );
  // jolts up, hand to the head
  eyes("w-g", true, L.l02.start - 0.25);
  T(
    `tl.to("#w-g", {rotation:0, y:0, duration:.45, ease:"back.out(1.6)"}, ${r(L.l02.start - 0.2)});`,
  );
  gesture("w-g", "headR", L.l02.start, 0.3);
  pose("w-g", "head", 8, L.l02.start, 0.3);
  talk("w-g", "l02");
  camTo("wake", 470, 640, 1.7, L.l02.start - 0.2, 0.6, 880, "power2.out");
}

/* ───────────── S2 down to the first floor, holding his head ───────────── */
scene(
  "down",
  `<g id="d-2">${room(A.stairwell({ floor: 2 }))}</g><g id="d-1" opacity="0">${room(A.stairwell({ floor: 1 }))}</g>
   ${C("d-g", GLEB, 760, 560)}`,
  { bg: "#2a3a3a" },
);
{
  const [a, b] = S.down;
  camSet("down", 560, 620, 1.4, a, 900);
  const mid = r((a + b) / 2);
  [
    [a, mid],
    [mid, b],
  ].forEach(([t0, t1], i) => {
    if (i === 1) {
      show("#d-1", t0);
      hide("#d-2", t0);
    }
    T(`tl.set("#d-g", {x:0, y:0}, ${r(t0)});`);
    T(
      `tl.set("${part("d-g", "armR")}", {rotation:-150, svgOrigin:"0 0"}, ${r(t0)}); tl.set("${part("d-g", "armR-lo")}", {rotation:-85, svgOrigin:"0 0"}, ${r(t0)});`,
    );
    walk("d-g", t0, t1 - 0.02, -430, 330, 0.42, 16, false);
  });
  T(
    `tl.to("${part("d-g", "head")}", {keyframes:[{rotation:6,duration:.6},{rotation:-4,duration:.6},{rotation:6,duration:.6},{rotation:-2,duration:.6}], transformOrigin:"50% 92%"}, ${r(a)});`,
  );
  blink("d-g", a, b);
}

/* ───────────── S3 Ded Maxim ───────────── */
scene(
  "maxim",
  `${room(A.stairwell({ floor: 1 }))}
   <rect id="mx-doorlight" x="0" y="560" width="120" height="420" fill="#ffcf7a" opacity="0"/>
   ${C("mx", R.maxim(), 150, 975)}
   ${C("mx-g", GLEB, 560, 975)}`,
  { bg: "#2a3a3a" },
);
{
  const [a, b] = S.maxim;
  camSet("maxim", 360, 640, 1.5, a, 900);
  // door bangs open, he storms out shouting, waving the broken bottle
  T(
    `tl.fromTo("#mx-doorlight", {opacity:.5}, {opacity:0, duration:.6, immediateRender:false}, ${r(a)});`,
  );
  T(`tl.set("#mx", {x:-220}, 0);`);
  walk("mx", a, a + 0.6, 220, 0, 0.2, 26);
  gesture("mx", "fist", L.l04.start + 0.3, 0.2);
  T(
    `tl.to("${part("mx", "armR-lo")}", {keyframes:[{rotation:-10,duration:.18},{rotation:-60,duration:.18},{rotation:-10,duration:.18},{rotation:-60,duration:.18},{rotation:-30,duration:.18}], svgOrigin:"0 0"}, ${r(L.l04.start + 0.55)});`,
  );
  pose("mx", "armL", 40, L.l04.start + 0.3, 0.2);
  pose("mx", "armL-lo", 60, L.l04.start + 0.3, 0.2);
  talk("mx", "l04");
  gesture("mx-g", "headR", a, 0.01);
  camTo("maxim", 230, 600, 1.9, L.l04.start + 0.2, 0.5, 880, "power2.out");
  // Gleb tells him
  gesture("mx", "rest", L.l05.start, 0.3);
  camTo("maxim", 520, 600, 1.9, L.l05.start - 0.1, 0.5, 880, "power2.inOut");
  gesture("mx-g", "rest", L.l05.start + 0.2, 0.35);
  gesture("mx-g", "open", L.l05.start + 0.6, 0.3);
  talk("mx-g", "l05");
  // shocked, then fist up — "я им покажу!" — and off to his flat
  camTo("maxim", 260, 620, 1.75, L.l06.start - 0.1, 0.5, 880, "power2.inOut");
  T(`tl.to("#mx .body", {keyframes:[{y:-10,duration:.12},{y:0,duration:.2}]}, ${r(L.l06.start)});`);
  gesture("mx", "shrug", L.l06.start + 0.1, 0.25);
  gesture("mx", "rest", W("ничего", 1, 20) - 0.2, 0.15);
  gesture("mx", "fist", W("ничего", 1, 20), 0.2);
  T(
    `tl.to("${part("mx", "armR-lo")}", {keyframes:[{rotation:-10,duration:.14},{rotation:-60,duration:.14},{rotation:-10,duration:.14},{rotation:-60,duration:.14}], svgOrigin:"0 0"}, ${r(W("покажу") - 0.1)});`,
  );
  talk("mx", "l06");
  T(`tl.set("#mx", {scaleX:-1, svgOrigin:"150 975"}, ${r(L.l06.end + 0.1)});`);
  walk("mx", L.l06.end + 0.1, b, -320, 0, 0.24, 24);
  camTo("maxim", 360, 640, 1.5, L.l06.end, b - L.l06.end, 900);
  ["mx", "mx-g"].forEach((id) => blink(id, a, b));
}

/* ───────────── S4 basement: two boxes; Masha and the boys come down ───────────── */
scene(
  "base",
  `${room(A.basement({ lit: true }))}
   <g id="bx">${P("bx-art", B.boxes(), 560, 1000, 300)}</g>
   ${C("bs-g", GLEB, 420, 1000)}
   ${C("bs-m", R.masha({ brow: "worried", prop: "bag" }), 860, 1000)}
   ${C("bs-o", R.sonOld({ brow: "worried" }), 980, 1000)}
   ${C("bs-y", R.sonYoung({ brow: "worried" }), 760, 1000)}`,
  { bg: "#24262b" },
);
{
  const [a, b] = S.base;
  camSet("base", 520, 660, 1.55, a, 900);
  T(
    `tl.fromTo("#bx-art rect, #bx-art text, #bx-art path", {opacity:0}, {opacity:1, duration:.25, stagger:.03, immediateRender:false}, ${r(W("коробки") - 0.6)});`,
  );
  T(`tl.set("#bx-art rect, #bx-art text, #bx-art path", {opacity:0}, ${a});`);
  walk("bs-g", a + 0.2, a + 1.4, 60, 0, 0.3, 16);
  gesture("bs-g", "carry", W("сложил"), 0.3);
  hide("#bs-m, #bs-o, #bs-y", a);
  T(`tl.set("#bs-m, #bs-o, #bs-y", {opacity:1, x:360}, ${r(L.l08.start - 0.5)});`);
  walk("bs-m", L.l08.start - 0.5, L.l08.start + 0.5, -360, 0, 0.25, 20);
  walk("bs-o", L.l08.start - 0.4, L.l08.start + 0.6, -300, 0, 0.25, 20);
  walk("bs-y", L.l08.start - 0.3, L.l08.start + 0.6, -300, 0, 0.18, 28);
  talk("bs-m", "l08");
  camTo("base", 640, 640, 1.4, L.l08.start - 0.4, 0.8, 900, "power2.inOut");
  ["bs-g", "bs-m", "bs-o", "bs-y"].forEach((id) => blink(id, a, b));
}

/* ───────────── S5 courtyard: into the car, off they go ───────────── */
scene(
  "yard",
  `${room(B.courtyard())}
   <g id="car">${P("car-art", B.car({ lights: true }), 560, 1010, 470)}</g>
   <g id="car2" opacity="0">${P("car2-art", B.car({ lights: true, people: true }), 560, 1010, 470)}</g>
   ${C("y-g", GLEB, 420, 985)}
   ${C("y-y", R.sonYoung({ brow: "worried" }), 300, 985)}
   ${C("y-m", R.masha({ brow: "worried", prop: "bag" }), 190, 985)}
   ${C("y-o", R.sonOld({ brow: "worried" }), 90, 985)}`,
  { bg: "#060912" },
);
{
  const [a, b] = S.yard;
  camSet("yard", 420, 640, 1.45, a, 900);
  gesture("y-g", "pointR", L.l09.start + 0.2, 0.2);
  talk("y-g", "l09");
  gesture("y-g", "rest", L.l09.end, 0.3);
  camTo("yard", 330, 680, 1.8, L.l10.start - 0.15, 0.5, 900, "power2.out");
  talk("y-y", "l10");
  pose("y-y", "head", -10, L.l10.start, 0.2);
  camTo("yard", 400, 640, 1.8, L.l11.start - 0.1, 0.5, 900, "power2.inOut");
  gesture("y-g", "open", L.l11.start, 0.3);
  talk("y-g", "l11");
  // everyone walks to the car and is gone; doors; car pulls away
  const tg = r(L.l11.end + 0.1);
  ["y-o", "y-m", "y-y", "y-g"].forEach((id, i) => {
    walk(id, tg, tg + 0.7, 260 - i * 40, 0, 0.22, 22);
    T(`tl.to("#${id}", {opacity:0, duration:.2}, ${r(tg + 0.55 + i * 0.05)});`);
  });
  show("#car2", r(tg + 0.75));
  hide("#car", r(tg + 0.75));
  camTo("yard", 700, 760, 1.25, tg, b - tg, 900, "power1.inOut");
  T(`tl.to("#car2", {x:900, duration:${r(b - tg - 0.85)}, ease:"power2.in"}, ${r(tg + 0.85)});`);
  T(
    `tl.to("#car2-art .wheel", {rotation:720, transformOrigin:"50% 50%", duration:${r(b - tg - 0.85)}, ease:"power2.in"}, ${r(tg + 0.85)});`,
  );
  ["y-g", "y-y", "y-m", "y-o"].forEach((id) => blink(id, a, b));
}

/* ───────────── S6 the road at dawn ───────────── */
scene(
  "road",
  `${room(B.road({ dawn: true }))}<g id="rd-car">${P("rd-car-art", B.car({ lights: true, people: true }), 300, 960, 430)}</g>`,
  { bg: "#1b2342" },
);
{
  const [a, b] = S.road;
  camSet("road", 520, 860, 1.75, a, 860);
  T(
    `tl.fromTo("#zm-road .poles", {x:0}, {x:-660, duration:${r(b - a)}, ease:"none", immediateRender:false}, ${r(a)});`,
  );
  T(
    `tl.fromTo("#zm-road .far", {x:0}, {x:-120, duration:${r(b - a)}, ease:"none", immediateRender:false}, ${r(a)});`,
  );
  T(
    `tl.fromTo("#zm-road .lane", {x:0}, {x:-440, duration:${r(b - a)}, ease:"none", immediateRender:false}, ${r(a)});`,
  );
  T(
    `tl.to("#rd-car-art .wheel", {rotation:1440, transformOrigin:"50% 50%", duration:${r(b - a)}, ease:"none"}, ${r(a)});`,
  );
  T(
    `tl.to("#rd-car", {keyframes:[{y:-3,duration:.15},{y:0,duration:.15},{y:-2,duration:.2},{y:0,duration:.2}], repeat:3}, ${r(a)});`,
  );
}

/* ───────────── S7 the dacha is gone ───────────── */
scene(
  "ruins",
  `${room(B.dachaRuins())}
   ${P("ru-car", B.car({ lights: false }), -60, 1000, 380)}
   ${C("ru-m", R.masha({ brow: "worried" }), 440, 1010)}
   ${C("ru-y", R.sonYoung({ brow: "worried" }), 540, 1010)}
   ${C("ru-o", R.sonOld({ brow: "worried" }), 640, 1010)}
   ${C("ru-g", GLEB, 760, 1010)}`,
  { bg: "#2a2a36" },
);
{
  const [a, b] = S.ruins;
  camSet("ruins", 520, 560, 1.15, a, 820);
  camTo("ruins", 560, 640, 1.4, a, L.l13.start - a, 860, "sine.out");
  T(
    `tl.to("#zm-ruins .smoke circle", {y:-40, duration:${r(b - a)}, ease:"none", stagger:.05}, ${r(a)});`,
  );
  T(
    `tl.fromTo("#zm-ruins .ember", {opacity:1}, {opacity:.2, duration:.4, yoyo:true, repeat:${Math.round((b - a) / 0.8)}, stagger:.07, immediateRender:false}, ${r(a)});`,
  );
  gesture("ru-m", "mouth", L.l13.start, 0.35);
  talk("ru-m", "l13");
  camTo("ruins", 470, 620, 1.85, L.l13.start - 0.1, 0.5, 880, "power2.out");
  camTo("ruins", 640, 600, 1.85, L.l14.start - 0.1, 0.5, 880, "power2.inOut");
  pose("ru-o", "head", 10, L.l14.start, 0.3);
  gesture("ru-o", "shrug", L.l14.start + 0.2, 0.3);
  talk("ru-o", "l14");
  camTo("ruins", 760, 580, 2.0, L.l15.start - 0.1, 0.5, 860, "power2.inOut");
  pose("ru-g", "head", -6, L.l15.start, 0.4);
  gesture("ru-g", "pointR", L.l15.start + 1.2, 0.3);
  talk("ru-g", "l15");
  ["ru-m", "ru-y", "ru-o", "ru-g"].forEach((id) => blink(id, a, b));
}

/* ───────────── S8 turn around: back to the burning city ───────────── */
scene(
  "back",
  `${room(B.road({ dawn: false }))}
   <rect x="-200" y="560" width="1480" height="200" fill="#ff6a2b" opacity=".22"/>
   <g opacity=".9">${Array.from({ length: 16 }, (_, i) => `<rect x="${i * 70 - 20}" y="${700 - ((i * 37) % 90)}" width="54" height="${((i * 37) % 90) + 10}" fill="#120a10"/>`).join("")}</g>
   <g id="bk-car">${P("bk-car-art", B.car({ lights: true, people: true }), 560, 960, 430)}</g>`,
  { bg: "#05070e" },
);
{
  const [a, b] = S.back;
  camSet("back", 620, 860, 1.7, a, 860);
  T(`tl.set("#bk-car", {scaleX:-1, svgOrigin:"775 900"}, ${r(a)});`);
  T(`tl.to("#bk-car", {x:-700, duration:${r(b - a)}, ease:"power1.in"}, ${r(a + 0.4)});`);
  T(
    `tl.to("#bk-car-art .wheel", {rotation:-1440, transformOrigin:"50% 50%", duration:${r(b - a)}, ease:"power1.in"}, ${r(a + 0.4)});`,
  );
  T(
    `tl.fromTo("#zm-back .poles", {x:-660}, {x:0, duration:${r(b - a)}, ease:"none", immediateRender:false}, ${r(a)});`,
  );
  camTo("back", 360, 840, 1.8, a, b - a, 860, "none");
}

/* ───────────── overlays ───────────── */
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
};
const HOT = new Set(
  "голова первый водка война ружьё покажу подвал коробки машину дачу дачи бабушке дедушкой город обратно".split(
    " ",
  ),
);
const DANGER = new Set("шарахнуло разбилась война бежали".split(" "));
const hook = `<div id="hook" class="clip toptitle" data-start="0.2" data-duration="${r(L.l02.start - 0.2)}" data-track-index="2" style="z-index:5"><div class="tt-s">${spl("ГЛЕБ", "hs")}</div><div class="tt-a">${spl("ЧАСТЬ 2", "ha")}</div></div>`;
T(
  `tl.fromTo("#hook .hs", {opacity:0, y:-40}, {opacity:1, y:0, duration:.3, stagger:.06, ease:"back.out(2)", immediateRender:false}, 0.45);`,
);
T(
  `tl.fromTo("#hook .ha", {opacity:0, y:-160, rotation:(i)=>[-14,10,-8,12,-10,8,-12][i%7], scale:1.6}, {opacity:1, y:0, rotation:0, scale:1, duration:.45, stagger:.07, ease:"back.out(1.8)", immediateRender:false}, 0.7);`,
);
T(`tl.set("#hook .hs, #hook .ha", {opacity:0}, 0);`);
T(
  `tl.to("#hook .ha", {y:-60, opacity:0, duration:.22, stagger:.03, ease:"power2.in"}, ${r(L.l02.start - 0.55)});`,
);
T(`tl.to("#hook .hs", {opacity:0, duration:.2}, ${r(L.l02.start - 0.4)});`);
const stamp = (id, t0, t1, text, color) => {
  T(
    `tl.fromTo("#${id} .clk", {scale:2.2, rotation:-12, opacity:0}, {scale:1, rotation:-4, opacity:1, duration:.32, ease:"power4.in", immediateRender:false}, ${r(t0)});`,
  );
  T(
    `tl.to("#${id} .clk", {keyframes:[{x:-10,duration:.04},{x:8,duration:.04},{x:-4,duration:.04},{x:0,duration:.04}]}, ${r(t0 + 0.32)});`,
  );
  T(`tl.to("#${id} .clk", {opacity:0, duration:.25}, ${r(t1 - 0.25)});`);
  return `<div id="${id}" class="clip clock" data-start="${r(t0)}" data-duration="${r(t1 - t0)}" data-track-index="2" style="z-index:5"><div class="clk sm" style="color:${color}">${text}</div></div>`;
};
const stamps = stamp("st1", W("два", 1, 39), S.road[1], "+2 ЧАСА", "#ffcf7a");
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
const title = `<div id="tbc" class="clip" data-start="${TITLE[0]}" data-duration="${r(TITLE[1] - TITLE[0])}" data-track-index="4" style="z-index:8"><div id="tbc-a">${spl("ПРОДОЛЖЕНИЕ СЛЕДУЕТ…", "ta")}</div><div id="tbc-b">ЧАСТЬ 3</div></div>`;
T(`tl.set("#tbc-a", {opacity:1}, ${r(TITLE[0])}); tl.set("#tbc-a .ta", {opacity:0}, 0);`);
T(`tl.to("#tbc-a .ta", {opacity:1, duration:.01, stagger:.045}, ${r(TITLE[0] + 0.3)});`);
T(
  `tl.fromTo("#tbc-b", {opacity:0, scale:2.2}, {opacity:1, scale:1, duration:.3, ease:"power4.in", immediateRender:false}, ${r(TITLE[0] + 1.4)});`,
);
T(
  `tl.to("#tbc-b", {keyframes:[{x:-14,textShadow:"8px 0 #00e5ff, -8px 0 #ff2a6a",duration:.05},{x:10,textShadow:"-6px 0 #00e5ff, 6px 0 #ff2a6a",duration:.05},{x:-4,textShadow:"3px 0 #00e5ff, -3px 0 #ff2a6a",duration:.05},{x:0,textShadow:"0px 0 #00e5ff, 0px 0 #ff2a6a",duration:.08}]}, ${r(TITLE[0] + 1.7)});`,
);
T(
  `tl.to("#tbc-b", {keyframes:[{x:8,textShadow:"-7px 0 #00e5ff, 7px 0 #ff2a6a",duration:.04},{x:0,textShadow:"0px 0 #00e5ff, 0px 0 #ff2a6a",duration:.06}]}, ${r(TITLE[0] + 2.6)});`,
);
const card = `<div id="card" class="clip" data-start="${CARD_START}" data-duration="${CARD_DUR}" data-track-index="4" style="z-index:9"><div id="card-a">Больше таких анимаций<br/>в Telegram-канале</div><div id="card-b">${spl("@Claude306", "cb")}</div></div>`;
T(
  `tl.fromTo("#card-a", {opacity:0, y:40}, {opacity:1, y:0, duration:.45, ease:"power3.out", immediateRender:false}, ${r(CARD_START + 0.1)});`,
);
T(`tl.set("#card-b", {opacity:1}, ${r(CARD_START)});`);
T(
  `tl.fromTo("#card-b .cb", {opacity:0, y:70, scale:.6}, {opacity:1, y:0, scale:1, duration:.4, stagger:.05, ease:"back.out(2.2)", immediateRender:false}, ${r(CARD_START + 0.4)});`,
);
T(
  `tl.to("#card-b .cb", {keyframes:[{y:-14,duration:.15},{y:0,duration:.2}], stagger:.05}, ${r(CARD_START + 1.6)});`,
);
T(`tl.set("#card-a, #card-b, #tbc-a, #tbc-b", {opacity:0}, 0);`);

/* ───────────── audio (shared sfx folder from part 1) ───────────── */
const SFX = "assets/sfx";
const sfx = [
  ["tinnitus", 0.05, 4, 0.8],
  ["door", S.maxim[0], 0.35, 1.0],
  ["glass", W("разбилась") + 0.1, 0.6, 0.6],
  ["boom1", L.l06.end + 0.4, 3.4, 0.3],
  ["door", r(L.l11.end + 0.9), 0.35, 0.9],
  ["door", r(L.l11.end + 1.1), 0.35, 0.7],
  ["fire", S.ruins[0], 20, 1.0],
  ["boom2", S.back[0] + 1.0, 4.1, 0.35],
];
const audio = [
  `<audio id="vo" class="clip" src="assets/vo.wav" data-start="0" data-duration="${r(L.l16.end + 0.1)}" data-track-index="10" data-volume="1"></audio>`,
  `<audio id="room" class="clip" src="${SFX}/room_night.wav" data-start="1" data-duration="${r(S.yard[0] - 1)}" data-track-index="11" data-volume="0.8"></audio>`,
  `<audio id="eng" class="clip" src="${SFX}/engine.wav" data-start="${r(L.l11.end + 1.2)}" data-duration="${r(Math.min(24, S.ruins[0] - L.l11.end - 1.2))}" data-track-index="11" data-volume="0.6"></audio>`,
  `<audio id="eng2" class="clip" src="${SFX}/engine.wav" data-start="${S.back[0]}" data-duration="${r(CUT - S.back[0])}" data-track-index="11" data-volume="0.6"></audio>`,
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
<title>Глеб — часть 2</title>
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
  .clk { display: inline-block; font-weight: 900; font-size: 200px; line-height: 1; -webkit-text-stroke: 14px #05070c; paint-order: stroke fill; text-shadow: 0 10px 0 rgba(0,0,0,.5); }
  .clk.sm { font-size: 140px; }
  .capgroup { position: absolute; left: 50px; right: 50px; top: 1170px; text-align: center; overflow: visible; }
  .capgroup .who { font-weight: 900; font-size: 40px; letter-spacing: .14em; -webkit-text-stroke: 8px #05070c; paint-order: stroke fill; margin-bottom: 4px; }
  .capgroup .line { font-weight: 900; font-size: 86px; line-height: 1.08; text-transform: uppercase; }
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
