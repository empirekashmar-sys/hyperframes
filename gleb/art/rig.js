// Rigged flat characters for "Глеб". Every body part is its own <g> so GSAP can animate it:
//   .legL .legR .armL .armR (pivot at the top centre), .head (pivot at the neck),
//   .eyes-open / .eyes-closed (blink), .m0 .m1 .m2 (mouth closed / half / wide for lip-sync),
//   .brows (expression), .body (whole figure, for bobbing).
// Coordinates: viewBox 0 0 200 420, feet on y = 410. Kids are built shorter in the same box.

const O = "#0b0d14"; // outline
const ol = (w = 2.6) =>
  `stroke="${O}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;

function limb(x, y, len, w, color, end, endColor, cls) {
  // Two-segment limb hanging from the joint (x, y). The outer <g class=cls> pivots at the shoulder/hip,
  // the inner <g class=cls-lo> at the elbow/knee. Each group's parent space has its joint at 0,0,
  // so GSAP can rotate them with svgOrigin "0 0".
  const l1 = len * 0.5;
  const l2 = len - l1;
  const w2 = w * 0.86;
  return `<g transform="translate(${x} ${y})"><g class="${cls}">
    <rect x="${-w / 2}" y="${-w / 2}" width="${w}" height="${l1 + w / 2 + w2 / 2}" rx="${w / 2}" fill="${color}" ${ol()}/>
    <rect x="${w * 0.08}" y="0" width="${w * 0.28}" height="${l1}" rx="${w * 0.14}" fill="#000" opacity=".14"/>
    <g transform="translate(0 ${l1})"><g class="${cls}-lo">
      <rect x="${-w2 / 2}" y="${-w2 / 2}" width="${w2}" height="${l2 + w2 / 2}" rx="${w2 / 2}" fill="${color}" ${ol()}/>
      <rect x="${w2 * 0.08}" y="0" width="${w2 * 0.28}" height="${l2 - 4}" rx="${w2 * 0.14}" fill="#000" opacity=".14"/>
      ${end(0, l2, endColor)}
    </g></g>
  </g></g>`;
}
const hand = (x, y, c) =>
  `<path d="M${x - 8} ${y - 2} q-2 14 8 15 q10 -1 9 -14 q0 -6 -9 -6 q-8 0 -8 5z" fill="${c}" ${ol(2.2)}/><path d="M${x - 8} ${y + 2} q-6 -2 -6 4 q2 4 6 3" fill="${c}" ${ol(1.8)}/>`;
const shoe = (side) => (x, y, c) =>
  `<path d="M${x - 13} ${y - 6} h${side > 0 ? 30 : 24} q${side > 0 ? 8 : 4} 0 ${side > 0 ? 8 : 4} 8 v6 h-${side > 0 ? 42 : 32} q-3 0 -3 -6z" transform="translate(${side > 0 ? 0 : -6} 0)" fill="${c}" ${ol(2.2)}/>
   <path d="M${x - 15 + (side > 0 ? 0 : -6)} ${y + 6} h${side > 0 ? 42 : 34}" stroke="#8a8d96" stroke-width="3"/>`;

function face({
  cx,
  cy,
  r,
  shade,
  iris,
  brow,
  blush = true,
  freckles = false,
  glasses = false,
  lash = false,
}) {
  const ex = r * 0.38;
  const ey = cy + r * 0.05;
  const eye = (
    x,
  ) => `<ellipse cx="${x}" cy="${ey}" rx="${r * 0.15}" ry="${r * 0.17}" fill="#f6f1e8" ${ol(1.6)}/>
      <circle cx="${x + 0.8}" cy="${ey + 0.8}" r="${r * 0.1}" fill="${iris}"/><circle cx="${x + 1}" cy="${ey + 0.8}" r="${r * 0.045}" fill="${O}"/>
      <circle cx="${x + 2.6}" cy="${ey - 1.8}" r="${r * 0.03}" fill="#fff"/>
      ${lash ? `<path d="M${x - r * 0.16} ${ey - r * 0.12} l-4 -3 M${x + r * 0.16} ${ey - r * 0.12} l4 -3" ${ol(1.6)}/>` : ""}`;
  const closed = (x) =>
    `<path d="M${x - r * 0.15} ${ey + 1} q${r * 0.15} ${r * 0.1} ${r * 0.3} 0" fill="none" ${ol(2.4)}/>`;
  const browY = ey - r * 0.32;
  const brows = {
    neutral: `M${cx - ex - r * 0.17} ${browY} h${r * 0.34} M${cx + ex - r * 0.17} ${browY} h${r * 0.34}`,
    worried: `M${cx - ex - r * 0.17} ${browY} l${r * 0.34} -${r * 0.1} M${cx + ex - r * 0.17} ${browY - r * 0.1} l${r * 0.34} ${r * 0.1}`,
    angry: `M${cx - ex - r * 0.17} ${browY - r * 0.08} l${r * 0.34} ${r * 0.12} M${cx + ex - r * 0.17} ${browY + r * 0.04} l${r * 0.34} -${r * 0.12}`,
    happy: `M${cx - ex - r * 0.17} ${browY + 2} q${r * 0.17} -${r * 0.12} ${r * 0.34} 0 M${cx + ex - r * 0.17} ${browY + 2} q${r * 0.17} -${r * 0.12} ${r * 0.34} 0`,
    sad: `M${cx - ex - r * 0.17} ${browY - r * 0.02} l${r * 0.34} -${r * 0.16} M${cx + ex - r * 0.17} ${browY - r * 0.18} l${r * 0.34} ${r * 0.16}`,
    shock: `M${cx - ex - r * 0.17} ${browY - r * 0.12} q${r * 0.17} -${r * 0.12} ${r * 0.34} 0 M${cx + ex - r * 0.17} ${browY - r * 0.12} q${r * 0.17} -${r * 0.12} ${r * 0.34} 0`,
  };
  // wide eyes (shock/fear): bigger whites, tiny pupils; squint (pain/determination): lids half down
  const wide = (x) =>
    `<ellipse cx="${x}" cy="${ey}" rx="${r * 0.18}" ry="${r * 0.21}" fill="#f6f1e8" ${ol(1.6)}/><circle cx="${x}" cy="${ey}" r="${r * 0.06}" fill="${iris}"/><circle cx="${x}" cy="${ey}" r="${r * 0.03}" fill="${O}"/>`;
  const squint = (x) =>
    `<ellipse cx="${x}" cy="${ey + 1}" rx="${r * 0.15}" ry="${r * 0.08}" fill="#f6f1e8" ${ol(1.6)}/><circle cx="${x + 0.8}" cy="${ey + 1.5}" r="${r * 0.07}" fill="${iris}"/><path d="M${x - r * 0.18} ${ey - r * 0.04} h${r * 0.36}" ${ol(2.8)}/>`;
  const my = cy + r * 0.52;
  return `
    ${blush ? `<ellipse cx="${cx - r * 0.55}" cy="${cy + r * 0.32}" rx="${r * 0.16}" ry="${r * 0.09}" fill="#e88f7c" opacity=".35"/><ellipse cx="${cx + r * 0.55}" cy="${cy + r * 0.32}" rx="${r * 0.16}" ry="${r * 0.09}" fill="#e88f7c" opacity=".35"/>` : ""}
    ${freckles ? [-0.5, -0.38, 0.38, 0.5].map((k, i) => `<circle cx="${cx + r * k}" cy="${cy + r * (0.22 + (i % 2) * 0.08)}" r="1.3" fill="#a8704f"/>`).join("") : ""}
    <g class="eyes-open">${eye(cx - ex)}${eye(cx + ex)}</g>
    <g class="eyes-closed" opacity="0">${closed(cx - ex)}${closed(cx + ex)}</g>
    <g class="eyes-wide" opacity="0">${wide(cx - ex)}${wide(cx + ex)}</g>
    <g class="eyes-squint" opacity="0">${squint(cx - ex)}${squint(cx + ex)}</g>
    <g class="tear" opacity="0"><path d="M${cx - ex + 2} ${ey + r * 0.2} q-5 9 0 13 q5 -4 0 -13z" fill="#8fd0ff" ${ol(1.2)}/><path d="M${cx + ex - 2} ${ey + r * 0.2} q-5 9 0 13 q5 -4 0 -13z" fill="#8fd0ff" ${ol(1.2)}/></g>
    <g class="sweat" opacity="0"><path d="M${cx + r * 0.72} ${cy - r * 0.42} q-6 10 0 15 q6 -5 0 -15z" fill="#bfe6ff" ${ol(1.2)}/></g>
    ${glasses ? `<circle cx="${cx - ex}" cy="${ey}" r="${r * 0.27}" fill="none" ${ol(2.6)}/><circle cx="${cx + ex}" cy="${ey}" r="${r * 0.27}" fill="none" ${ol(2.6)}/><path d="M${cx - ex + r * 0.27} ${ey} h${2 * ex - r * 0.54}" ${ol(2.6)}/>` : ""}
    <g class="brows">${Object.entries(brows)
      .map(
        ([k, d]) =>
          `<path class="b-${k}" d="${d}" fill="none" stroke="${O}" stroke-width="${r * 0.09}" stroke-linecap="round" opacity="${k === (brows[brow] ? brow : "neutral") ? 1 : 0}"/>`,
      )
      .join("")}</g>
    <path d="M${cx - 1} ${cy + r * 0.08} q${r * 0.1} ${r * 0.2} -${r * 0.04} ${r * 0.24}" fill="none" stroke="${shade}" stroke-width="2.2" stroke-linecap="round"/>
    <g class="m0"><path d="M${cx - r * 0.2} ${my} q${r * 0.2} ${r * 0.1} ${r * 0.4} 0" fill="none" stroke="#6a2c2c" stroke-width="2.6" stroke-linecap="round"/></g>
    <g class="m1" opacity="0"><ellipse cx="${cx}" cy="${my + 1}" rx="${r * 0.17}" ry="${r * 0.1}" fill="#5a1f22" ${ol(1.8)}/></g>
    <g class="m2" opacity="0"><ellipse cx="${cx}" cy="${my + 3}" rx="${r * 0.2}" ry="${r * 0.2}" fill="#5a1f22" ${ol(1.8)}/><ellipse cx="${cx}" cy="${my + 9}" rx="${r * 0.12}" ry="${r * 0.07}" fill="#d9707a"/></g>
    <g class="mo-smile" opacity="0"><path d="M${cx - r * 0.26} ${my - 2} q${r * 0.26} ${r * 0.26} ${r * 0.52} 0 q-${r * 0.26} ${r * 0.1} -${r * 0.52} 0z" fill="#5a1f22" ${ol(1.8)}/><path d="M${cx - r * 0.2} ${my} h${r * 0.4}" stroke="#fff" stroke-width="3"/></g>
    <g class="mo-frown" opacity="0"><path d="M${cx - r * 0.2} ${my + 4} q${r * 0.2} -${r * 0.14} ${r * 0.4} 0" fill="none" stroke="#6a2c2c" stroke-width="2.8" stroke-linecap="round"/></g>
    <g class="mo-grimace" opacity="0"><rect x="${cx - r * 0.24}" y="${my - 3}" width="${r * 0.48}" height="${r * 0.16}" rx="3" fill="#fff" ${ol(1.8)}/><path d="M${cx - r * 0.24} ${my + r * 0.05} h${r * 0.48} M${cx - r * 0.08} ${my - 3} v${r * 0.16} M${cx + r * 0.08} ${my - 3} v${r * 0.16}" stroke="${O}" stroke-width="1.4"/></g>
    <g class="mo-o" opacity="0"><ellipse cx="${cx}" cy="${my + 2}" rx="${r * 0.08}" ry="${r * 0.11}" fill="#5a1f22" ${ol(1.8)}/></g>`;
}

/* ───────────── generic humanoid ───────────── */
function build(spec) {
  const {
    kid = 0, // 0 adult, 1 tween (~12), 2 little (~6)
    skin,
    shade,
    iris,
    brow = "neutral",
    top,
    topDark,
    sleeve = top,
    bottom,
    shoes,
    hairBack = "",
    hairFront,
    torsoExtra = "",
    skirt = null, // {color, len}
    shorts = false,
    faceOpts = {},
    accessory = "",
    handProp = "", // drawn inside the right arm group at the hand
  } = spec;
  const P = [
    { r: 40, torso: 118, leg: 140, arm: 112, w: 72, legW: 24, armW: 19 },
    { r: 38, torso: 92, leg: 104, arm: 90, w: 60, legW: 21, armW: 17 },
    { r: 40, torso: 70, leg: 76, arm: 70, w: 54, legW: 19, armW: 16 },
    { r: 36, torso: 110, leg: 130, arm: 106, w: 64, legW: 22, armW: 18 }, // teen ~16
  ][kid];
  const feet = 404;
  const hip = feet - P.leg;
  const shoulder = hip - P.torso;
  const neck = shoulder - 4;
  const hcy = neck - P.r * 0.9;
  const cx = 100;
  const half = P.w / 2;
  const legX = [cx - half * 0.45, cx + half * 0.45];
  const armX = [cx - half - P.armW * 0.15, cx + half + P.armW * 0.15];
  const legColor = shorts ? skin : bottom;
  const legs =
    limb(legX[0], hip, P.leg, P.legW, legColor, shoe(-1), shoes, "legL") +
    limb(legX[1], hip, P.leg, P.legW, legColor, shoe(1), shoes, "legR");
  const shortsSvg = shorts
    ? `<path d="M${cx - half + 4} ${hip - 8} H${cx + half - 4} L${cx + half} ${hip + P.leg * 0.38} H${cx + 4} L${cx} ${hip + 10} L${cx - 4} ${hip + P.leg * 0.38} H${cx - half}Z" fill="${bottom}" ${ol()}/>`
    : "";
  const skirtSvg = skirt
    ? `<path d="M${cx - half + 2} ${hip - 14} H${cx + half - 2} L${cx + half + 14} ${hip + skirt.len} H${cx - half - 14}Z" fill="${skirt.color}" ${ol()}/>`
    : "";
  const torso = `
    <path d="M${cx - half + 6} ${shoulder} Q${cx} ${shoulder - 10} ${cx + half - 6} ${shoulder} L${cx + half} ${shoulder + 16} L${cx + half - 2} ${hip + 6} Q${cx} ${hip + 14} ${cx - half + 2} ${hip + 6} L${cx - half} ${shoulder + 16}Z" fill="${top}" ${ol()}/>
    <path d="M${cx + half * 0.35} ${shoulder + 4} L${cx + half - 1} ${shoulder + 18} L${cx + half - 3} ${hip + 4} L${cx + half * 0.35} ${hip + 8}Z" fill="${topDark}" opacity=".55"/>
    ${torsoExtra}`;
  const armL = limb(armX[0], shoulder + 8, P.arm, P.armW, sleeve, hand, shade, "armL");
  const armR = limb(
    armX[1],
    shoulder + 8,
    P.arm,
    P.armW,
    sleeve,
    (x, y, c) => hand(x, y, c) + handProp.replace(/__X__/g, x).replace(/__Y__/g, y + 4),
    skin,
    "armR",
  );
  const head = `<g class="head">
    ${hairBack
      .replace(/__CX__/g, cx)
      .replace(/__CY__/g, hcy)
      .replace(/__R__/g, P.r)}
    <rect x="${cx - P.r * 0.24}" y="${hcy + P.r * 0.6}" width="${P.r * 0.48}" height="${P.r * 0.5}" fill="${shade}" ${ol(2)}/>
    <ellipse cx="${cx - P.r * 0.95}" cy="${hcy + P.r * 0.08}" rx="${P.r * 0.14}" ry="${P.r * 0.2}" fill="${shade}" ${ol(2)}/>
    <ellipse cx="${cx + P.r * 0.95}" cy="${hcy + P.r * 0.08}" rx="${P.r * 0.14}" ry="${P.r * 0.2}" fill="${shade}" ${ol(2)}/>
    <ellipse cx="${cx}" cy="${hcy}" rx="${P.r * (kid === 3 ? 0.86 : 0.92)}" ry="${P.r * (kid === 3 ? 1.06 : 1)}" fill="${skin}" ${ol()}/>
    <path d="M${cx + P.r * 0.35} ${hcy - P.r * 0.8} Q${cx + P.r * 1.0} ${hcy} ${cx + P.r * 0.4} ${hcy + P.r * 0.9} Q${cx + P.r * 0.85} ${hcy} ${cx + P.r * 0.35} ${hcy - P.r * 0.8}Z" fill="${shade}" opacity=".35"/>
    ${face({ cx, cy: hcy, r: P.r, skin, shade, iris, brow, ...faceOpts })}
    ${hairFront
      .replace(/__CX__/g, cx)
      .replace(/__CY__/g, hcy)
      .replace(/__R__/g, P.r)}
    ${accessory
      .replace(/__CX__/g, cx)
      .replace(/__CY__/g, hcy)
      .replace(/__R__/g, P.r)}
  </g>`;
  return {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 420"><g class="body">
      <ellipse cx="100" cy="412" rx="${half + 12}" ry="6" fill="#000" opacity=".3"/>
      ${armL}${legs}${shortsSvg}${skirtSvg}${torso}${head}${armR}</g></svg>`,
    joints: { hip, shoulder, neck, feet },
  };
}

/* ───────────── hair styles (use __CX__ __CY__ __R__) ───────────── */
const HAIR = {
  glebFront: (
    c,
  ) => `<path d="M__CX__ __CY__ m-38 -6 q-4 -40 34 -44 q22 -4 36 10 q10 12 4 34 l-6 -10 l-4 12 l-8 -14 l-6 12 l-8 -14 l-6 12 l-8 -14 l-6 12 l-8 -12 q-6 6 -4 20z" fill="${c}" ${ol()}/>
     <path d="M__CX__ __CY__ m-10 -44 q8 8 6 22 M__CX__ __CY__ m14 -42 q6 10 2 24" stroke="#3b3f4a" stroke-width="2.4" fill="none"/>`,
  mashaBack: (c, loose) =>
    loose
      ? `<path d="M__CX__ __CY__ m-44 -4 q-6 -46 44 -48 q50 2 44 48 q4 40 -4 70 h-80 q-8 -30 -4 -70z" fill="${c}" ${ol()}/>`
      : `<path d="M__CX__ __CY__ m30 -34 q30 4 26 40 q-2 24 -12 38" stroke="${c}" stroke-width="16" fill="none" stroke-linecap="round"/><path d="M__CX__ __CY__ m-42 0 q-4 -44 42 -46 q46 2 42 46 q0 22 -8 34 h-68 q-8 -12 -8 -34z" fill="${c}" ${ol()}/>`,
  mashaFront: (c) =>
    `<path d="M__CX__ __CY__ m-38 -8 q2 -34 38 -34 q36 0 38 34 q-12 -18 -38 -16 q-22 -2 -38 16z" fill="${c}" ${ol(2)}/><path d="M__CX__ __CY__ m4 -42 q-10 12 -26 16" stroke="#7a4b30" stroke-width="2.4" fill="none"/>`,
  shaved:
    () => `<path d="M__CX__ __CY__ m-29 -8 q0 -28 29 -28 q29 0 29 28 q-10 -14 -29 -14 q-19 0 -29 14z" fill="#8a6a55" opacity=".22"/>
     <g transform="translate(__CX__ __CY__)">${Array.from({ length: 21 }, (_, i) => `<circle cx="${-18 + (i % 7) * 6}" cy="${-30 + Math.floor(i / 7) * 6 + (i % 2) * 2 + Math.abs(3 - (i % 7)) * 1.5}" r=".9" fill="#5a4436" opacity=".45"/>`).join("")}
     <ellipse cx="0" cy="0" rx="10" ry="5" transform="translate(-10 -26) rotate(-22)" fill="#fff" opacity=".4"/></g>`,
  oldFront: (c) =>
    `<path d="M__CX__ __CY__ m-36 4 q-6 -46 36 -46 q42 0 36 38 l-4 -6 q-20 -18 -46 2 q-12 -2 -22 12z" fill="${c}" ${ol()}/><path d="M__CX__ __CY__ m-4 -26 q12 -14 32 -10" stroke="#5a4232" stroke-width="2.4" fill="none"/>`,
  curls: (c) =>
    [-34, -24, -12, 0, 12, 24, 34]
      .map(
        (dx, i) =>
          `<circle cx="__CX__" cy="__CY__" r="13" transform="translate(${dx} ${-34 + Math.abs(3 - i) * 4})" fill="${c}" ${ol(2)}/>`,
      )
      .join("") +
    `<circle cx="__CX__" cy="__CY__" r="10" transform="translate(-38 -12)" fill="${c}" ${ol(2)}/><circle cx="__CX__" cy="__CY__" r="10" transform="translate(38 -12)" fill="${c}" ${ol(2)}/>`,
};

/* ───────────── cast ───────────── */
export function gleb({ outfit = "jacket", brow = "neutral", prop = "", injured = false } = {}) {
  const jacket = outfit === "jacket";
  return build({
    skin: "#e0ae88",
    shade: "#c08b66",
    iris: "#6b3d1c",
    brow,
    top: jacket ? "#2b2321" : "#4f6a8a",
    topDark: jacket ? "#120e0d" : "#344a66",
    sleeve: jacket ? "#2b2321" : "#4f6a8a",
    bottom: jacket ? "#1b1e27" : "#5a5e6a",
    shoes: jacket ? "#ecebe6" : "#2f3340",
    torsoExtra: jacket
      ? `<path d="M88 130 L100 160 L112 130 L111 268 L89 268Z" fill="#5b6270" ${ol(2)}/><path d="M78 128 L92 132 L98 162 L84 150Z M122 128 L108 132 L102 162 L116 150Z" fill="#4a3c37" ${ol(2)}/><path d="M100 160 V266" stroke="#b9bcc4" stroke-width="2"/>`
      : `<path d="M88 130 Q100 142 112 130" fill="none" stroke="#344a66" stroke-width="4"/>`,
    hairFront: HAIR.glebFront("#17181d"),
    accessory: injured
      ? `<ellipse cx="__CX__" cy="__CY__" rx="9" ry="6" transform="translate(16 -18)" fill="#8a4a6a" opacity=".75"/><path d="M__CX__ __CY__ m18 -14 q2 10 -2 22" stroke="#b3241b" stroke-width="3" fill="none" stroke-linecap="round"/>`
      : "",
    handProp:
      prop === "phone"
        ? `<rect x="__X__" y="__Y__" width="16" height="26" rx="3" transform="translate(-14 -22)" fill="#111" ${ol(1.6)}/><rect x="__X__" y="__Y__" width="11" height="19" rx="2" transform="translate(-11.5 -19)" fill="#9fd2ff"/>`
        : "",
  });
}

export function masha({ outfit = "home", brow = "neutral", prop = "" } = {}) {
  const night = outfit === "night";
  return build({
    skin: "#ebbb98",
    shade: "#cc9773",
    iris: "#3e6a3a",
    brow,
    top: night ? "#a9c3dc" : "#d98e5a",
    topDark: night ? "#7f9cb8" : "#a8643a",
    sleeve: night ? "#a9c3dc" : "#d98e5a",
    bottom: "#d8a283",
    shoes: night ? "#e8b4c4" : "#e8b4c4",
    skirt: night ? { color: "#a9c3dc", len: 120 } : { color: "#7c4f63", len: 70 },
    torsoExtra: night
      ? `<path d="M90 130 Q100 140 110 130" fill="none" stroke="#7f9cb8" stroke-width="3"/>`
      : `<path d="M86 128 L100 146 L114 128 L112 266 L88 266Z" fill="#7c4f63" ${ol(2)}/>${prop === "apron" ? `<path d="M80 168 H120 L128 300 H72Z" fill="#e7e0d2" ${ol(2)}/><path d="M80 168 Q100 156 120 168" stroke="#e7e0d2" stroke-width="5" fill="none"/>` : ""}`,
    hairBack: HAIR.mashaBack("#5a3522", night),
    hairFront: HAIR.mashaFront("#5a3522"),
    faceOpts: { lash: true },
    accessory: night
      ? ""
      : `<circle cx="__CX__" cy="__CY__" r="3" transform="translate(-38 14)" fill="#e9d48a"/><circle cx="__CX__" cy="__CY__" r="3" transform="translate(38 14)" fill="#e9d48a"/>`,
    handProp:
      prop === "spatula"
        ? `<path d="M__X__ __Y__ l14 -30" stroke="#7a5a3e" stroke-width="5" stroke-linecap="round"/><ellipse cx="__X__" cy="__Y__" rx="7" ry="4" transform="translate(16 -34)" fill="#7a5a3e"/>`
        : prop === "bag"
          ? `<rect x="__X__" y="__Y__" width="46" height="56" rx="8" transform="translate(-22 0)" fill="#3a5a8a" ${ol(2)}/><path d="M__X__ __Y__ m-10 2 v-10 h20 v10" stroke="#2a4066" stroke-width="5" fill="none"/>`
          : "",
  });
}

export function sonOld({ outfit = "day", brow = "neutral" } = {}) {
  // 16-year-old, shaved head, lanky, hoodie with headphones
  const pj = outfit === "pajama";
  return build({
    kid: 3,
    skin: "#d8a47f",
    shade: "#b8855f",
    iris: "#4a3a2a",
    brow,
    top: pj ? "#4a4a5a" : "#3f6b4f",
    topDark: pj ? "#33333f" : "#2a4a36",
    sleeve: pj ? "#4a4a5a" : "#3f6b4f",
    bottom: pj ? "#4a4a5a" : "#23283a",
    shoes: pj ? "#2f3340" : "#ecebe6",
    torsoExtra: pj
      ? `<path d="M90 158 Q100 166 110 158" fill="none" stroke="#33333f" stroke-width="3"/>`
      : `<path d="M84 154 Q100 174 116 154" fill="none" stroke="#2a4a36" stroke-width="6"/><path d="M95 164 v28 M105 164 v28" stroke="#cfd6e2" stroke-width="2.4"/><rect x="78" y="226" width="44" height="24" rx="6" fill="#2a4a36" opacity=".6"/>`,
    hairFront: HAIR.shaved(),
    faceOpts: { blush: false },
    accessory: pj
      ? ""
      : `<path d="M__CX__ __CY__ m-26 48 q26 18 52 0" stroke="${O}" stroke-width="6" fill="none"/><rect x="__CX__" y="__CY__" width="12" height="18" rx="5" transform="translate(-36 38)" fill="#e23b2e" ${ol(2)}/><rect x="__CX__" y="__CY__" width="12" height="18" rx="5" transform="translate(24 38)" fill="#e23b2e" ${ol(2)}/>`,
  });
}

export function sonYoung({ outfit = "day", brow = "neutral", bunny = true } = {}) {
  const pj = outfit === "pajama";
  return build({
    kid: 2,
    skin: "#efc1a0",
    shade: "#cf9c78",
    iris: "#5a3a22",
    brow,
    top: pj ? "#7fb6d9" : "#c9483a",
    topDark: pj ? "#5e94b8" : "#9a3026",
    sleeve: pj ? "#7fb6d9" : "#c9483a",
    bottom: pj ? "#7fb6d9" : "#33507a",
    shoes: pj ? "#ecebe6" : "#3a7ad9",
    shorts: !pj,
    torsoExtra: pj
      ? `<path d="M86 262 l5 -10 l5 10 l5 -10 l5 10" stroke="#ffe08a" stroke-width="3" fill="none"/>`
      : `<path d="M80 280 q4 -18 20 -16 q8 -12 16 -2 l-4 4 q-4 -2 -6 2 q8 6 2 20 l-4 -6 l-6 6 l-2 -8 q-10 4 -16 0z" fill="#6ad18a" ${ol(1.6)}/>`,
    hairFront: HAIR.curls("#2a1d16"),
    faceOpts: { freckles: true },
    handProp: bunny ? "" : "",
  });
}

// Checkpoint soldier: khaki uniform, helmet, rifle across the body.
export function soldier({ brow = "angry" } = {}) {
  return build({
    skin: "#dcae8c",
    shade: "#bb8c6a",
    iris: "#3a3a2a",
    brow,
    top: "#56603e",
    topDark: "#3a4228",
    sleeve: "#56603e",
    bottom: "#4a5236",
    shoes: "#1d1a16",
    torsoExtra: `<rect x="70" y="180" width="60" height="44" rx="6" fill="#3a4228" ${ol(2)}/><path d="M74 196 h52 M74 210 h52" stroke="#2a3020" stroke-width="3"/><path d="M60 150 L140 270" stroke="#1d1a16" stroke-width="10"/><rect x="88" y="190" width="70" height="12" rx="3" transform="rotate(52 100 196)" fill="#2a2a2a"/>`,
    hairFront: `<path d="M__CX__ __CY__ m-46 0 q0 -54 46 -54 q46 0 46 54 q-10 -4 -14 -10 h-64 q-4 6 -14 10z" fill="#56603e" ${ol(2)}/><path d="M__CX__ __CY__ m-50 0 h100" stroke="${O}" stroke-width="5" stroke-linecap="round"/>`,
    faceOpts: { blush: false },
  });
}

// Ded Maxim: neighbour from the first floor. Striped vest, grey beard and moustache, bald top,
// flat cap, slippers; holds a broken vodka bottle neck.
export function maxim({ brow = "angry", prop = "bottle", helmet = false } = {}) {
  // tank crew helmet: padded leather cap with ear flaps and goggles pushed up
  const tankHelmet = `<path d="M__CX__ __CY__ m-42 6 q-4 -50 42 -52 q46 2 42 52 q-6 -8 -8 -22 q-34 -14 -68 0 q-2 14 -8 22z" fill="#2a2420" ${ol(2)}/>
      <path d="M__CX__ __CY__ m-30 -40 v34 M__CX__ __CY__ m-10 -46 v40 M__CX__ __CY__ m10 -46 v40 M__CX__ __CY__ m30 -40 v34" stroke="#4a3e34" stroke-width="5"/>
      <rect x="__CX__" y="__CY__" width="20" height="40" rx="8" transform="translate(-50 -4)" fill="#2a2420" ${ol(2)}/><rect x="__CX__" y="__CY__" width="20" height="40" rx="8" transform="translate(30 -4)" fill="#2a2420" ${ol(2)}/>
      <g transform="translate(__CX__ __CY__)"><circle cx="-14" cy="-34" r="11" fill="#7ab8c9" ${ol(2)}/><circle cx="14" cy="-34" r="11" fill="#7ab8c9" ${ol(2)}/><path d="M-3 -34 h6" ${ol(3)}/></g>`;
  return build({
    skin: "#d9a07c",
    shade: "#b77f5c",
    iris: "#4a5a6a",
    brow,
    top: "#e9ecf2",
    topDark: "#b9c0cc",
    sleeve: "#d9a07c",
    bottom: "#3a3f4a",
    shoes: "#5a4a3a",
    torsoExtra: `${[150, 166, 182, 198, 214, 230, 246, 262].map((y) => `<path d="M66 ${y} H134" stroke="#2a4a8a" stroke-width="6"/>`).join("")}<path d="M66 266 Q100 282 134 266" fill="#e9ecf2" opacity=".0"/>`,
    hairFront: helmet
      ? tankHelmet
      : `<path d="M__CX__ __CY__ m-36 4 q-2 -20 6 -26 M__CX__ __CY__ m36 4 q2 -20 -6 -26" stroke="#c9ccd2" stroke-width="10" fill="none" stroke-linecap="round"/>
      <path d="M__CX__ __CY__ m-40 -14 q4 -30 40 -32 q36 2 40 32 q-6 -6 -40 -8 q-34 2 -40 8z" fill="#4a4f5a" ${ol(2)}/><path d="M__CX__ __CY__ m-44 -12 q44 -14 92 2 q-4 6 -10 6 q-36 -10 -76 0 q-6 -2 -6 -8z" fill="#3a3f4a" ${ol(2)}/>`,
    accessory: `<path d="M__CX__ __CY__ m-30 16 q4 40 30 42 q26 -2 30 -42 q-8 18 -30 18 q-22 0 -30 -18z" fill="#d8dbe0" ${ol(2)}/>
      <path d="M__CX__ __CY__ m-18 18 q18 -10 36 0 q-8 8 -18 6 q-10 2 -18 -6z" fill="#c9ccd2" ${ol(1.6)}/>
      <path d="M__CX__ __CY__ m-22 -2 q4 -6 8 0 M__CX__ __CY__ m14 -2 q4 -6 8 0" stroke="#8a5a4a" stroke-width="1.6" fill="none" opacity=".6"/>`,
    faceOpts: { blush: false },
    handProp:
      prop === "bottle"
        ? `<path d="M__X__ __Y__ m-6 -4 v-26 l4 -10 h4 l4 10 v26 z" fill="#9fd1a8" opacity=".85" ${ol(1.6)}/><path d="M__X__ __Y__ m-6 -30 l3 -6 l3 4 l3 -6 l3 6" stroke="#cfe9d4" stroke-width="2" fill="none"/>`
        : prop === "vodka"
          ? `<path d="M__X__ __Y__ m-8 0 v-40 q0 -8 6 -12 v-14 h4 v14 q6 4 6 12 v40z" fill="#dff1ff" opacity=".9" ${ol(1.6)}/><rect x="__X__" y="__Y__" width="16" height="12" transform="translate(-8 -30)" fill="#e23b2e"/>`
          : "",
  });
}
