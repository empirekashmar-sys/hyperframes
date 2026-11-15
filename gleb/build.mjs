// Builds index.html for "Глеб — часть 1" (vertical 1080×1920).
// Run: node build.mjs   (art from art/art.js, timings from assets/words.json + assets/timings.json)
import fs from "node:fs";
import * as A from "./art/art.js";

const words = JSON.parse(fs.readFileSync(new URL("./assets/words.json", import.meta.url)));
const lines = JSON.parse(fs.readFileSync(new URL("./assets/timings.json", import.meta.url))).lines;
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
const VO_END = L.l15.end;
const CUT = r(VO_END + 0.05); // whistle ends, everything stops
const TITLE = [CUT, r(CUT + 3.4)];
const CARD_START = r(TITLE[1] + 0.1);
const CARD_DUR = 3.6;
const TOTAL = r(CARD_START + CARD_DUR);
const S = {
  ext: [0, r(L.l02.end + 0.05)],
  hall: [r(L.l02.end + 0.05), r(L.l06.start - 0.15)],
  kit: [r(L.l06.start - 0.15), r(L.l08.start - 0.6)],
  night: [r(L.l08.start - 0.6), r(L.l09.start - 0.1)],
  bed: [r(L.l09.start - 0.1), r(W("одна") - 0.05)],
  screen: [r(W("одна") - 0.05), r(L.l13.start - 0.1)],
  kids: [r(L.l13.start - 0.1), r(L.l14.start - 0.05)],
  dress: [r(L.l14.start - 0.05), r(W("всё", 1, 47) - 0.05)],
  base: [r(W("всё", 1, 47) - 0.05), r(W("пятый", 1, 47) - 0.05)],
  stairs: [r(W("пятый", 1, 47) - 0.05), CUT],
};

/* ───────────── helpers ───────────── */
const strip = (s) => s.replace(/^<svg[^>]*>/, "").replace(/<\/svg>$/, "");
const vb = (s) =>
  s
    .match(/viewBox="([^"]+)"/)[1]
    .split(" ")
    .map(Number);
// place art so its bottom-left is at (x, footY), width w (in the scene's world units)
function P(id, art, x, footY, w, attrs = "") {
  const [mx, my, vw, vh] = vb(art);
  const k = w / vw;
  return `<g id="${id}" ${attrs}><g transform="translate(${r(x - mx * k)} ${r(footY - (my + vh) * k)}) scale(${r(k)})">${strip(art)}</g></g>`;
}
const tweens = [];
const T = (s) => tweens.push(s);
const scenes = [];
// Each scene: an svg with a world group (#zm-key) the camera moves with svgOrigin "0 0".
function scene(key, world, { bg = "#05070c", overlay = "" } = {}) {
  const [a, b] = S[key];
  scenes.push(`
  <div id="sc-${key}" class="clip scene" data-start="${a}" data-duration="${r(b - a)}" data-track-index="1" style="z-index:1;background:${bg}">
    <svg viewBox="0 0 1080 1920" width="1080" height="1920"><rect x="-500" y="-500" width="2080" height="2920" fill="${bg}"/><g id="zm-${key}">${world}</g>${overlay}</svg>
  </div>`);
}
// Camera: put world point (px,py) at screen (540, sy) with scale s.
const camSet = (key, px, py, s, at, sy = 860) =>
  T(
    `tl.set("#zm-${key}", {svgOrigin:"0 0", scale:${s}, x:${r(540 - s * px)}, y:${r(sy - s * py)}}, ${r(at)});`,
  );
const camTo = (key, px, py, s, at, dur, sy = 860, ease = "sine.inOut") =>
  T(
    `tl.to("#zm-${key}", {svgOrigin:"0 0", scale:${s}, x:${r(540 - s * px)}, y:${r(sy - s * py)}, duration:${r(dur)}, ease:"${ease}"}, ${r(at)});`,
  );
const fadeIn = (sel, at, dur = 0.3) =>
  T(
    `tl.fromTo("${sel}", {opacity:0}, {opacity:1, duration:${dur}, immediateRender:false}, ${r(at)});`,
  );
const hide = (sel, at) => T(`tl.set("${sel}", {opacity:0}, ${r(at)});`);
const show = (sel, at) => T(`tl.set("${sel}", {opacity:1}, ${r(at)});`);
const shake = (sel, at, n = 6, amp = 14) =>
  T(
    `tl.fromTo("${sel}", {x:0, y:0}, {keyframes:${JSON.stringify(Array.from({ length: n }, (_, i) => ({ x: (i % 2 ? -1 : 1) * amp * (1 - i / n), y: ((i % 3) - 1) * amp * 0.6 * (1 - i / n), duration: 0.05 })).concat([{ x: 0, y: 0, duration: 0.05 }]))}, immediateRender:false}, ${r(at)});`,
  );
const flash = (sel, at, peak = 1, dur = 0.6) =>
  T(
    `tl.fromTo("${sel}", {opacity:${peak}}, {opacity:0, duration:${dur}, ease:"power2.out", immediateRender:false}, ${r(at)});`,
  );

const sky = (id, night) => `
  <defs><linearGradient id="${id}-g" x1="0" y1="0" x2="0" y2="1">${
    night
      ? `<stop offset="0" stop-color="#03050c"/><stop offset=".7" stop-color="#0b1022"/><stop offset="1" stop-color="#151a2e"/>`
      : `<stop offset="0" stop-color="#1b2140"/><stop offset=".55" stop-color="#6a3a52"/><stop offset="1" stop-color="#e0844e"/>`
  }</linearGradient></defs>
  <rect x="-200" y="-200" width="1480" height="1700" fill="url(#${id}-g)"/>
  ${Array.from({ length: 40 }, (_, i) => `<circle cx="${(i * 197) % 1080}" cy="${(i * 113) % 700}" r="${i % 6 ? 1.3 : 2.2}" fill="#dfe6ff" opacity="${night ? 0.55 : 0.18}"/>`).join("")}`;
const neighbor = (x, w, h, lit, seed) => {
  let s = seed,
    out = `<rect x="${x}" y="${1380 - h}" width="${w}" height="${h}" fill="#2a2e3a"/>`;
  const rnd = () => (s = (s * 9301 + 49297) % 233280) / 233280;
  for (let yy = 1380 - h + 20; yy < 1360; yy += 46)
    for (let xx = x + 14; xx < x + w - 24; xx += 36)
      if (rnd() < lit)
        out += `<rect x="${xx}" y="${yy}" width="18" height="24" fill="#f2b45a" opacity=".8"/>`;
  return out;
};

/* ───────────── S1: exterior, evening ───────────── */
scene(
  "ext",
  `${sky("ext", false)}
   ${neighbor(-60, 300, 900, 0.35, 3)}${neighbor(820, 320, 1000, 0.3, 7)}
   ${P("ext-block", A.panelBlock({ floor5: true, lit: 0.42 }), 140, 1420, 800)}
   <rect x="-200" y="1400" width="1480" height="700" fill="#1d1f26"/><path d="M-200 1400 H1280" stroke="#3a3d48" stroke-width="10"/>
   ${Array.from({ length: 7 }, (_, i) => `<path d="M${-100 + i * 200} 1500 h120" stroke="#e9e3c9" stroke-width="10" opacity=".5"/>`).join("")}
   <g id="ext-glow" opacity="0"><rect x="${140 + (30 + 3 * 66) * (800 / 560) - 12}" y="${1420 - 900 * (800 / 560) + (60 + 4 * 92) * (800 / 560) - 12}" width="${40 * (800 / 560) + 24}" height="${50 * (800 / 560) + 24}" rx="8" fill="none" stroke="#ffb02e" stroke-width="8"/></g>
   ${P("ext-gleb", A.hero("walk"), 700, 1440, 70)}`,
  { bg: "#1b2140" },
);
camSet("ext", 540, 760, 1.0, 0, 900);
camTo("ext", 540, 820, 1.08, 0, 4.0, 900, "none");
T(`tl.fromTo("#ext-gleb", {x:220}, {x:-240, duration:${S.ext[1]}, ease:"none"}, 0);`);
// "пятый этаж" — push to Gleb's window and ring it
{
  const wx = 140 + (30 + 3 * 66 + 20) * (800 / 560);
  const wy = 1420 - 900 * (800 / 560) + (60 + 4 * 92 + 25) * (800 / 560);
  camTo("ext", wx, wy, 2.2, W("пятый"), 1.2, 820, "power2.inOut");
  fadeIn("#ext-glow", r(W("этаж") - 0.1), 0.25);
}

/* ───────────── S2: hallway — Gleb comes home, sons run to him ───────────── */
scene(
  "hall",
  `<g id="hall-closed">${strip(A.hallway({ open: 0 }))}</g>
   <g id="hall-open" opacity="0">${strip(A.hallway({ open: 1 }))}</g>
   ${P("hall-gleb", A.hero("stand"), 440, 905, 200)}
   ${P("hall-young", A.son("young", "run"), 180, 935, 150)}
   ${P("hall-old", A.son("old", "wave"), 700, 925, 170)}`,
  { bg: P_BG() },
);
function P_BG() {
  return "#3b3330";
}
camSet("hall", 540, 560, 1.75, S.hall[0], 860);
show("#hall-open", r(S.hall[0] + 0.15));
hide("#hall-closed", r(S.hall[0] + 0.15));
T(
  `tl.fromTo("#hall-gleb", {opacity:0, scale:.85, transformOrigin:"50% 100%"}, {opacity:1, scale:1, duration:.5, ease:"power2.out", immediateRender:false}, ${r(S.hall[0] + 0.3)});`,
);
hide("#hall-gleb", S.hall[0]);
hide("#hall-young", S.hall[0]);
hide("#hall-old", S.hall[0]);
camTo("hall", 540, 600, 1.45, r(L.l03.start - 0.3), 0.8, 880, "power2.inOut");
T(
  `tl.fromTo("#hall-young", {opacity:1, x:-420}, {x:0, duration:.55, ease:"power3.out", immediateRender:false}, ${r(L.l03.start - 0.2)});`,
);
T(
  `tl.fromTo("#hall-old", {opacity:1, x:420}, {x:0, duration:.6, ease:"power3.out", immediateRender:false}, ${r(L.l04.start - 0.35)});`,
);
T(
  `tl.to("#hall-gleb", {y:-10, duration:.18, yoyo:true, repeat:3, ease:"sine.inOut"}, ${r(L.l05.start)});`,
);
camTo("hall", 520, 640, 1.6, L.l05.start, 3.4, 880, "none");

/* ───────────── S3: kitchen — Masha cooks; family dinner; last calm evening ───────────── */
const tableOverlay = `<rect x="100" y="740" width="440" height="22" rx="6" fill="#7a5a3e"/><path d="M130 762 V900 M510 762 V900" stroke="#5b4330" stroke-width="16"/><rect x="100" y="728" width="440" height="14" fill="#c9d6e6" opacity=".6"/>${[180, 280, 380, 470].map((x) => `<ellipse cx="${x}" cy="726" rx="34" ry="9" fill="#e9e5dc"/><ellipse cx="${x}" cy="722" rx="18" ry="4" fill="#d9903a"/>`).join("")}`;
scene(
  "kit",
  `${strip(A.kitchen({ steam: true }))}
   ${P("kit-masha", A.masha("cook"), 600, 905, 215)}
   <g id="kit-family" opacity="0">
     ${P("kit-gleb", A.glebHome("stand"), 60, 905, 190)}
     ${P("kit-old", A.son("old", "stand"), 210, 905, 150)}
     ${P("kit-young", A.son("young", "stand"), 330, 905, 125)}
     ${P("kit-masha2", A.masha("stand"), 420, 905, 190)}
     ${tableOverlay}
   </g>
   <rect id="kit-dim" x="-500" y="-500" width="2080" height="2920" fill="#0a1024" opacity="0"/>`,
  { bg: "#4a403b" },
);
camSet("kit", 680, 600, 1.7, S.kit[0], 860);
T(
  `tl.fromTo("#steam .st", {y:0, opacity:.9}, {y:-50, opacity:0, duration:1.6, ease:"none", repeat:5, stagger:.5, immediateRender:false}, ${S.kit[0]});`,
);
T(
  `tl.fromTo("#kit-masha", {rotation:0, svgOrigin:"700 905"}, {rotation:2, duration:.35, yoyo:true, repeat:5, ease:"sine.inOut", immediateRender:false}, ${S.kit[0]});`,
);
// "Они ужинали вместе" — cut to the table
hide("#kit-masha", W("они"));
show("#kit-family", W("они"));
camSet("kit", 300, 640, 1.65, W("они"), 880);
T(
  `tl.to("#kit-gleb, #kit-old, #kit-young, #kit-masha2", {y:-12, duration:.16, yoyo:true, repeat:5, ease:"sine.inOut", stagger:.07}, ${W("смеялись")});`,
);
camTo("kit", 300, 600, 2.0, W("никто"), S.kit[1] - W("никто"), 860, "none");
T(
  `tl.to("#kit-dim", {opacity:1, duration:${r(S.kit[1] - W("никто"))}, ease:"power1.in"}, ${W("никто")});`,
);

/* ───────────── S4: night exterior, 2:30 ───────────── */
scene(
  "night",
  `${sky("nt", true)}
   ${neighbor(-60, 300, 900, 0.04, 3).replaceAll("#2a2e3a", "#15181f")}${neighbor(820, 320, 1000, 0.03, 7).replaceAll("#2a2e3a", "#15181f")}
   ${P("nt-block", A.panelBlock({ night: true, lit: 0.06 }), 140, 1420, 800)}
   <rect x="-200" y="1400" width="1480" height="700" fill="#0b0d12"/>
   <rect id="nt-horizon" x="-200" y="900" width="1480" height="520" fill="#ff8a3d" opacity="0"/>`,
  { bg: "#03050c" },
);
camSet("night", 540, 820, 1.15, S.night[0], 900);
camTo("night", 540, 900, 1.25, S.night[0], S.night[1] - S.night[0], 900, "none");
flash("#nt-horizon", r(W("ночи") + 0.35), 0.35, 0.9);

/* ───────────── S5: bedroom — explosions, waking up, the phone ───────────── */
const blanket = `<rect x="100" y="640" width="720" height="200" rx="20" fill="#2c3550" opacity="0"/><path d="M60 676 Q460 636 820 686 L820 840 L60 840Z" fill="#3c4a72"/>${Array.from({ length: 7 }, (_, i) => `<circle cx="${120 + i * 100}" cy="${750 + (i % 2) * 40}" r="8" fill="#56649a"/>`).join("")}<rect x="60" y="600" width="40" height="260" rx="8" fill="#3a2a2a"/>`;
scene(
  "bed",
  `${strip(A.bedroom())}
   <defs><clipPath id="bed-clip"><rect x="-200" y="-200" width="1400" height="1040"/></clipPath></defs>
   <g clip-path="url(#bed-clip)"><g id="bed-masha">${P("bed-m", A.masha("scared", "night"), 120, 870, 190)}</g>
   <g id="bed-gleb">${P("bed-g", A.glebHome("alert"), 320, 860, 200)}</g>
   <g id="bed-gphone" opacity="0">${P("bed-gp", A.glebPhone(true), 320, 860, 200)}</g></g>
   ${blanket}
   <rect id="bed-glow" x="-500" y="-500" width="2080" height="2920" fill="#ffb347" opacity="0"/>`,
  { bg: "#141826" },
);
camSet("bed", 520, 600, 1.55, S.bed[0], 880);
T(`tl.set("#bed-masha, #bed-gleb", {y:115}, ${S.bed[0]});`);
// first explosion: window flash, room shakes, Gleb sits up
flash("#bed-flash", W("взрыв"), 1, 0.7);
flash("#bed-glow", W("взрыв"), 0.25, 0.5);
shake("#zm-bed", W("взрыв"), 8, 18);
T(`tl.to("#bed-gleb", {y:0, duration:.35, ease:"power3.out"}, ${r(W("взрыв") + 0.15)});`);
flash("#bed-flash", W("ещё"), 0.8, 0.6);
shake("#zm-bed", W("ещё"), 6, 10);
T(
  `tl.fromTo("#bed-flash", {opacity:0}, {keyframes:[{opacity:.35,duration:.04},{opacity:0,duration:.06},{opacity:.25,duration:.04},{opacity:0,duration:.08},{opacity:.3,duration:.04},{opacity:0,duration:.1}], immediateRender:false}, ${W("выстрелы")});`,
);
T(`tl.to("#bed-masha", {y:0, duration:.4, ease:"power3.out"}, ${r(L.l10.start - 0.2)});`);
camTo("bed", 360, 560, 1.85, L.l10.start, 2.6, 880, "sine.inOut");
// phone
hide("#bed-gleb", L.l12.start);
show("#bed-gphone", L.l12.start);
camTo("bed", 440, 540, 2.6, L.l12.start, S.bed[1] - L.l12.start, 860, "power1.inOut");

/* ───────────── S6: phone screen ───────────── */
scene(
  "screen",
  `${P("scr-phone", A.phoneScreen(), 175, 1460, 730)}
   <circle cx="540" cy="960" r="700" fill="#9fd2ff" opacity=".06"/>`,
  { bg: "#020308" },
);
camSet("screen", 540, 960, 1.0, S.screen[0], 960);
T(
  `tl.fromTo("#scr-phone", {scale:1.25, svgOrigin:"540 960", opacity:0}, {scale:1, opacity:1, duration:.35, ease:"power3.out", immediateRender:false}, ${S.screen[0]});`,
);
camTo("screen", 540, 760, 1.35, r(S.screen[0] + 0.5), S.screen[1] - S.screen[0] - 0.5, 900, "none");

/* ───────────── S7: kids' room — wake the kids, pack ───────────── */
scene(
  "kids",
  `${strip(A.kidsRoom())}
   <g id="kd-old">${P("kd-o", A.son("old", "sleepy", "pajama"), 640, 960, 150)}</g>
   <g id="kd-young">${P("kd-y", A.son("young", "sleepy", "pajama"), 820, 960, 125)}</g>
   <g id="kd-masha">${P("kd-m", A.masha("scared", "night"), 330, 965, 200)}</g>
   <g id="kd-pack" opacity="0">${P("kd-p", A.masha("pack", "night"), 330, 965, 215)}</g>`,
  { bg: "#1a2030" },
);
hide("#kd-old", S.kids[0]);
hide("#kd-young", S.kids[0]);
camSet("kids", 540, 640, 1.5, S.kids[0], 880);
T(
  `tl.fromTo("#kd-masha", {x:-380}, {x:0, duration:.6, ease:"power2.out", immediateRender:false}, ${S.kids[0]});`,
);
fadeIn("#kd-old", W("буди"), 0.4);
fadeIn("#kd-young", r(W("буди") + 0.35), 0.4);
hide("#kd-masha", W("собирайте"));
show("#kd-pack", W("собирайте"));
flash("#kid-flash", r(S.kids[0] + 0.8), 0.7, 0.6);
flash("#kid-flash", W("быстро"), 0.9, 0.5);
shake("#zm-kids", W("быстро"), 5, 8);
camTo("kids", 560, 640, 1.65, W("быстро"), 0.6, 880, "power2.out");

/* ───────────── S8: dressing in a minute ───────────── */
scene(
  "dress",
  `${strip(A.hallway({ open: 0 }))}
   <g id="dr-home">${P("dr-h", A.glebHome("stand"), 440, 905, 200)}</g>
   <g id="dr-jacket" opacity="0">${P("dr-j", A.hero("alert"), 440, 905, 200)}</g>`,
  { bg: "#3b3330" },
);
camSet("dress", 540, 620, 1.6, S.dress[0], 880);
T(
  `tl.to("#dr-home", {scaleX:.2, svgOrigin:"540 905", duration:.14, ease:"power2.in"}, ${r(W("оделся") + 0.1)});`,
);
hide("#dr-home", r(W("оделся") + 0.24));
T(
  `tl.fromTo("#dr-jacket", {opacity:1, scaleX:.2, svgOrigin:"540 905"}, {scaleX:1, duration:.18, ease:"back.out(2)", immediateRender:false}, ${r(W("оделся") + 0.24)});`,
);
camTo("dress", 540, 600, 1.85, r(W("минуту")), 0.5, 860, "power2.out");

/* ───────────── S9: basement insert ───────────── */
scene("base", `${strip(A.basement({ lit: true }))}`, { bg: "#24262b" });
camSet("base", 620, 640, 1.55, S.base[0], 900);
camTo("base", 700, 660, 1.75, S.base[0], S.base[1] - S.base[0], 900, "none");

/* ───────────── S10: stairwell — 5, 4, 3… the whistle ───────────── */
scene(
  "stairs",
  `<g id="st-5">${strip(A.stairwell({ floor: 5 }))}</g>
   <g id="st-4" opacity="0">${strip(A.stairwell({ floor: 4 }))}</g>
   <g id="st-3" opacity="0">${strip(A.stairwell({ floor: 3 }))}</g>
   <g id="st-run">${P("st-r", A.hero("walk"), 0, 0, 170)}</g>
   <g id="st-stop" opacity="0">${P("st-s", A.hero("alert"), 0, 0, 190)}</g>
   <rect id="st-dark" x="-500" y="-500" width="2080" height="2920" fill="#000" opacity="0"/>
   <rect id="st-white" x="-500" y="-500" width="2080" height="2920" fill="#fff" opacity="0"/>`,
  { bg: "#2a3a3a" },
);
camSet("stairs", 560, 640, 1.45, S.stairs[0], 900);
const floors = [W("пятый", 1, 47), W("четвёртый"), W("третий"), L.l15.start];
floors.slice(0, 3).forEach((t0, i) => {
  const t1 = floors[i + 1];
  if (i > 0) {
    show(`#st-${5 - i}`, t0);
    hide(`#st-${6 - i}`, t0);
  }
  T(
    `tl.fromTo("#st-run", {x:780, y:560}, {x:330, y:880, duration:${r(Math.max(0.5, t1 - t0 - 0.05))}, ease:"none", immediateRender:false}, ${r(t0)});`,
  );
});
T(`tl.set("#st-run", {x:780, y:560}, ${S.stairs[0]});`);
// the whistle: he stops, looks up; light flickers; shake grows; white flash; cut.
hide("#st-run", L.l15.start);
T(`tl.set("#st-stop", {opacity:1, x:420, y:820}, ${L.l15.start});`);
camTo("stairs", 520, 640, 2.4, L.l15.start, CUT - L.l15.start, 840, "power1.in");
T(
  `tl.fromTo("#st-dark", {opacity:0}, {keyframes:[{opacity:.5,duration:.06},{opacity:0,duration:.1},{opacity:.6,duration:.05},{opacity:.1,duration:.3},{opacity:.7,duration:.05},{opacity:.2,duration:.2}], immediateRender:false}, ${r(L.l15.start + 0.6)});`,
);
shake("#zm-stairs", r(CUT - 1.2), 10, 6);
shake("#zm-stairs", r(CUT - 0.5), 10, 14);
T(
  `tl.fromTo("#st-white", {opacity:0}, {opacity:1, duration:.12, ease:"power4.in", immediateRender:false}, ${r(CUT - 0.12)});`,
);

/* ───────────── overlays: hook title, clocks, speaker tags, captions ───────────── */
const hook = `<div id="hook" class="clip toptitle" data-start="0" data-duration="${r(W("седьмого") - 0.2)}" data-track-index="2" style="z-index:5">
  <div class="tt-s">ЧАСТЬ 1</div><div class="tt-a">ПОСЛЕДНИЙ</div><div class="tt-b">ОБЫЧНЫЙ ВЕЧЕР</div></div>`;
T(
  `tl.fromTo("#hook .tt-s, #hook .tt-a, #hook .tt-b", {opacity:0, y:30}, {opacity:1, y:0, duration:.35, stagger:.12, ease:"power3.out", immediateRender:false}, 0.05);`,
);
T(`tl.set("#hook .tt-s, #hook .tt-a, #hook .tt-b", {opacity:1}, 0);`);
T(
  `tl.to("#hook .tt-s, #hook .tt-a, #hook .tt-b", {opacity:0, y:-30, duration:.25, stagger:.05}, ${r(W("седьмого") - 0.5)});`,
);
const clock = (id, t0, t1, text, color) => {
  T(
    `tl.fromTo("#${id} .clk", {scale:1.6, opacity:0}, {scale:1, opacity:1, duration:.3, ease:"power4.in", immediateRender:false}, ${r(t0)});`,
  );
  T(`tl.to("#${id} .clk", {opacity:0, duration:.25}, ${r(t1 - 0.25)});`);
  return `<div id="${id}" class="clip clock" data-start="${r(t0)}" data-duration="${r(t1 - t0)}" data-track-index="2" style="z-index:5"><div class="clk" style="color:${color}">${text}</div></div>`;
};
const clocks =
  clock("clk1", W("половине"), r(W("панельная") + 0.2), "18:30", "#ffcf7a") +
  clock("clk2", W("два"), S.night[1], "02:30", "#ff5a4a");

const ROLE = {
  narrator: null,
  gleb: ["ГЛЕБ", "#9fc2ff"],
  masha: ["МАША", "#ffb3c7"],
  son_old: ["СТАРШИЙ", "#8be0a4"],
  son_young: ["МЛАДШИЙ", "#ffd25a"],
};
const HOT = new Set(
  "обычный последний глеб пятый этаж папа ужин ужинали последний два тридцать ночи взрыв выстрелы свист телефон строчка детей вещи быстро подвале пятый четвёртый третий громче".split(
    " ",
  ),
);
const DANGER = new Set("взрыв выстрелы свист громче быстро".split(" "));
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
        T(
          `tl.fromTo("#${w.id}", {scale:1.22, color:"rgba(255,255,255,.45)"}, {scale:1, color:"${col}", duration:.16, ease:"power2.out", immediateRender:false}, ${r(w.start)});`,
        );
        return `<span id="${w.id}" class="w">${w.text.replace(/[,:;]$/, "").replace(/\.$/, "")}</span>`;
      })
      .join(" ");
    T(
      `tl.set("#cg${gi}", {opacity:1}, ${start}); tl.set("#cg${gi}", {opacity:0}, ${r(end - 0.01)});`,
    );
    return `<div id="cg${gi}" class="clip capgroup" data-start="${start}" data-duration="${r(end - start)}" data-track-index="3" style="z-index:6;opacity:0">${tag}<div class="line">${spans}</div></div>`;
  })
  .join("\n");

/* ───────────── ending: to be continued + card ───────────── */
const title = `<div id="tbc" class="clip" data-start="${TITLE[0]}" data-duration="${r(TITLE[1] - TITLE[0])}" data-track-index="4" style="z-index:8">
  <div id="tbc-a">ПРОДОЛЖЕНИЕ СЛЕДУЕТ…</div><div id="tbc-b">ЧАСТЬ 2</div></div>`;
T(
  `tl.fromTo("#tbc-a", {opacity:0, y:30}, {opacity:1, y:0, duration:.6, ease:"power2.out", immediateRender:false}, ${r(TITLE[0] + 0.5)});`,
);
T(
  `tl.fromTo("#tbc-b", {opacity:0, scale:1.4}, {opacity:1, scale:1, duration:.35, ease:"power4.in", immediateRender:false}, ${r(TITLE[0] + 1.3)});`,
);
const card = `<div id="card" class="clip" data-start="${CARD_START}" data-duration="${CARD_DUR}" data-track-index="4" style="z-index:9">
  <div id="card-a">Больше таких анимаций<br/>в Telegram-канале</div><div id="card-b">@Claude306</div></div>`;
T(
  `tl.fromTo("#card-a", {opacity:0, y:40}, {opacity:1, y:0, duration:.45, ease:"power3.out", immediateRender:false}, ${r(CARD_START + 0.1)});`,
);
T(
  `tl.fromTo("#card-b", {opacity:0, scale:.8}, {opacity:1, scale:1, duration:.5, ease:"back.out(1.6)", immediateRender:false}, ${r(CARD_START + 0.35)});`,
);
T(`tl.set("#card-a, #card-b, #tbc-a, #tbc-b", {opacity:0}, 0);`);

/* ───────────── audio ───────────── */
const sfx = [
  ["click", S.hall[0] + 0.1, 0.06, 1.2],
  ["boom1", W("ночи") + 0.35, 3.4, 0.35],
  ["boom1", W("взрыв"), 3.4, 1.0],
  ["boom2", W("ещё"), 4.1, 0.85],
  ["gunfire", W("выстрелы"), 1.54, 0.6],
  ["whistle_short", W("свист", 1), 1.39, 0.5],
  ["buzz", L.l12.start - 0.4, 1.3, 0.8],
  ["boom2", S.kids[0] + 0.8, 4.1, 0.35],
  ["boom1", W("быстро"), 3.4, 0.6],
  ["whistle_big", CUT - 2.95, 2.95, 1.0],
];
const audio = [
  `<audio id="vo" class="clip" src="assets/vo.wav" data-start="0" data-duration="${r(VO_END + 0.1)}" data-track-index="10" data-volume="1"></audio>`,
  `<audio id="room-day" class="clip" src="assets/sfx/room_day.wav" data-start="0" data-duration="${S.night[0]}" data-track-index="11" data-volume="1"></audio>`,
  `<audio id="room-night" class="clip" src="assets/sfx/room_night.wav" data-start="${S.night[0]}" data-duration="${r(CUT - S.night[0])}" data-track-index="11" data-volume="1"></audio>`,
  ...sfx.map(
    ([f, at, d, v], i) =>
      `<audio id="sfx${i}" class="clip" src="assets/sfx/${f}.wav" data-start="${r(at)}" data-duration="${r(Math.min(d, CUT - at))}" data-track-index="${12 + (i % 3)}" data-volume="${v}"></audio>`,
  ),
];

/* ───────────── page ───────────── */
const html = `<!doctype html>
<html lang="ru">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=1080, height=1920" />
<title>Глеб — часть 1</title>
<script src="assets/gsap.min.js"></script>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { width: 1080px; height: 1920px; overflow: hidden; background: #05070c; font-family: "Inter", sans-serif; }
  #root { position: absolute; inset: 0; background: #05070c; overflow: hidden; }
  .scene { position: absolute; inset: 0; overflow: hidden; }
  .scene svg { position: absolute; left: 0; top: 0; }
  .vignette { position: absolute; inset: 0; pointer-events: none; background: radial-gradient(ellipse 80% 62% at 50% 46%, rgba(0,0,0,0) 55%, rgba(0,0,0,.6) 100%); }
  .toptitle { position: absolute; left: 0; right: 0; top: 230px; text-align: center; }
  .tt-s { font-weight: 900; font-size: 44px; letter-spacing: .3em; color: #ffb02e; -webkit-text-stroke: 8px #05070c; paint-order: stroke fill; }
  .tt-a { font-weight: 900; font-size: 112px; line-height: 1; color: #fff; -webkit-text-stroke: 14px #05070c; paint-order: stroke fill; margin-top: 10px; }
  .tt-b { font-weight: 900; font-size: 84px; line-height: 1.05; color: #ffcf7a; -webkit-text-stroke: 12px #05070c; paint-order: stroke fill; }
  .clock { position: absolute; left: 0; right: 0; top: 230px; text-align: center; }
  .clk { display: inline-block; font-weight: 900; font-size: 200px; line-height: 1; letter-spacing: .02em; -webkit-text-stroke: 14px #05070c; paint-order: stroke fill; text-shadow: 0 10px 0 rgba(0,0,0,.5); }
  .capgroup { position: absolute; left: 50px; right: 50px; top: 1170px; text-align: center; overflow: visible; }
  .capgroup .who { font-weight: 900; font-size: 40px; letter-spacing: .14em; -webkit-text-stroke: 8px #05070c; paint-order: stroke fill; margin-bottom: 4px; }
  .capgroup .line { font-weight: 900; font-size: 86px; line-height: 1.08; text-transform: uppercase; }
  .capgroup .w { display: inline-block; margin: 0 .13em; color: rgba(255,255,255,.45); -webkit-text-stroke: 12px #05070c; paint-order: stroke fill; text-shadow: 0 8px 0 rgba(0,0,0,.55); }
  #tbc { position: absolute; inset: 0; background: #000; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 40px; }
  #tbc-a { font-weight: 900; font-size: 70px; color: #fff; letter-spacing: .02em; text-align: center; white-space: nowrap; }
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
${clocks}
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
console.log({
  TOTAL,
  CUT,
  CARD_START,
  scenes: Object.keys(S).length,
  captionGroups: groups.length,
});
console.log(JSON.stringify(S));
