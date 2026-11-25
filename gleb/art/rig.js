// Rigged flat characters for "Глеб". Every body part is its own <g> so GSAP can animate it:
//   .legL .legR .armL .armR (pivot at the top centre), .head (pivot at the neck),
//   .eyes-open / .eyes-closed (blink), .m0 .m1 .m2 (mouth closed / half / wide for lip-sync),
//   .brows (expression), .body (whole figure, for bobbing).
// Coordinates: viewBox 0 0 200 420, feet on y = 410. Kids are built shorter in the same box.

const O = "#0b0d14"; // outline
const ol = (w = 2.6) =>
  `stroke="${O}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;

const RIFLE_SVG = `<g transform="translate(__X__ __Y__)"><rect x="-70" y="-8" width="120" height="14" rx="3" fill="#2a2a2a" stroke="#0b0d14" stroke-width="1.8" stroke-linejoin="round"/><rect x="-96" y="-6" width="30" height="20" rx="4" fill="#5a4030" stroke="#0b0d14" stroke-width="1.6" stroke-linejoin="round"/><rect x="-30" y="4" width="12" height="28" rx="3" transform="rotate(10 -24 18)" fill="#2a2a2a" stroke="#0b0d14" stroke-width="1.6" stroke-linejoin="round"/><rect x="4" y="4" width="10" height="22" rx="3" fill="#3a3a3a"/><rect x="48" y="-4" width="26" height="6" fill="#2a2a2a"/></g>`;
const ARMOR_SVG = `<path d="M64 150 Q100 136 136 150 L138 262 Q100 276 62 262Z" fill="#3a4430" stroke="#0b0d14" stroke-width="2" stroke-linejoin="round"/><rect x="72" y="200" width="22" height="26" rx="3" fill="#2a3022" stroke="#0b0d14" stroke-width="1.6" stroke-linejoin="round"/><rect x="106" y="200" width="22" height="26" rx="3" fill="#2a3022" stroke="#0b0d14" stroke-width="1.6" stroke-linejoin="round"/><path d="M64 180 H136" stroke="#2a3022" stroke-width="4"/>`;
// Black helmet + balaclava for a full combat kit (face open only around the eyes).
const KIT_BACK = `<path d="M__CX__ __CY__ m-44 0 q-4 -48 44 -50 q48 2 44 50 q2 34 -10 48 h-68 q-12 -14 -10 -48z" fill="#141418" stroke="#0b0d14" stroke-width="2"/>`;
const KIT_FRONT = `<path d="M__CX__ __CY__ m-41 12 q20 -6 41 -6 q21 0 41 6 q-2 30 -41 36 q-39 -6 -41 -36z" fill="#141418" stroke="#0b0d14" stroke-width="2"/><path d="M__CX__ __CY__ m-50 -6 q0 -56 50 -58 q50 2 50 58 q-20 -10 -50 -10 q-30 0 -50 10z" fill="#1d1f24" stroke="#0b0d14" stroke-width="2.4"/><path d="M__CX__ __CY__ m-52 -6 h104" stroke="#0b0d14" stroke-width="5"/><rect x="__CX__" y="__CY__" width="20" height="12" rx="3" transform="translate(-10 -60)" fill="#3a3e46"/>`;
// Omega squad armour: graphite plate carrier, a red omega patch on the chest.
const OMEGA_SVG = `<path d="M62 148 Q100 134 138 148 L140 264 Q100 278 60 264Z" fill="#3a3e46" stroke="#0b0d14" stroke-width="2" stroke-linejoin="round"/><rect x="70" y="204" width="24" height="28" rx="3" fill="#2a2d34" stroke="#0b0d14" stroke-width="1.6"/><rect x="106" y="204" width="24" height="28" rx="3" fill="#2a2d34" stroke="#0b0d14" stroke-width="1.6"/><circle cx="100" cy="174" r="15" fill="#b3241b" stroke="#0b0d14" stroke-width="1.8"/><text x="100" y="181" text-anchor="middle" font-family="Inter, sans-serif" font-weight="900" font-size="20" fill="#fff">Ω</text>`;
const VENIK = `<g transform="translate(__X__ __Y__)"><rect x="-4" y="-60" width="8" height="64" rx="3" fill="#8a5a34" stroke="#0b0d14" stroke-width="1.6"/><path d="M0 -60 q-30 -20 -24 -70 q14 10 24 40 q10 -30 24 -40 q6 50 -24 70z" fill="#5a8a3a" stroke="#0b0d14" stroke-width="1.6"/></g>`;
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
    <rect x="${-w * 0.36}" y="${w * 0.1}" width="${w * 0.14}" height="${l1 - w * 0.2}" rx="${w * 0.07}" fill="#fff" opacity=".12"/>
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
      <circle cx="${x + 0.8}" cy="${ey + 0.8}" r="${r * 0.112}" fill="${iris}" stroke="${O}" stroke-width="0.9" stroke-opacity=".55"/><path d="M${x + 0.8 - r * 0.1} ${ey + 0.8} a${r * 0.1} ${r * 0.1} 0 0 0 ${r * 0.2} 0z" fill="#000" opacity=".22"/><circle cx="${x + 1}" cy="${ey + 0.8}" r="${r * 0.05}" fill="${O}"/>
      <circle cx="${x + 3}" cy="${ey - 2}" r="${r * 0.038}" fill="#fff"/><circle cx="${x - 2}" cy="${ey + 3.4}" r="${r * 0.018}" fill="#fff" opacity=".85"/>
      <path d="M${x - r * 0.15} ${ey - r * 0.06} q${r * 0.15} -${r * 0.16} ${r * 0.3} 0" fill="none" stroke="${O}" stroke-width="${r * 0.05}" stroke-linecap="round"/>
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
    { r: 37, torso: 54, leg: 56, arm: 52, w: 48, legW: 17, armW: 14 }, // toddler ~3.5
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
    <path d="M${cx - half + 5} ${shoulder + 14} L${cx - half + 3} ${hip} " stroke="#fff" stroke-width="3" opacity=".14" stroke-linecap="round"/>
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
    <ellipse cx="${cx}" cy="${hcy + P.r * 0.86}" rx="${P.r * 0.26}" ry="${P.r * 0.12}" fill="#000" opacity=".22"/>
    <ellipse cx="${cx - P.r * 0.95}" cy="${hcy + P.r * 0.08}" rx="${P.r * 0.14}" ry="${P.r * 0.2}" fill="${shade}" ${ol(2)}/>
    <ellipse cx="${cx + P.r * 0.95}" cy="${hcy + P.r * 0.08}" rx="${P.r * 0.14}" ry="${P.r * 0.2}" fill="${shade}" ${ol(2)}/>
    <ellipse cx="${cx}" cy="${hcy}" rx="${P.r * (kid === 3 ? 0.86 : 0.92)}" ry="${P.r * (kid === 3 ? 1.06 : 1)}" fill="${skin}" ${ol()}/>
    <path d="M${cx + P.r * 0.35} ${hcy - P.r * 0.8} Q${cx + P.r * 1.0} ${hcy} ${cx + P.r * 0.4} ${hcy + P.r * 0.9} Q${cx + P.r * 0.85} ${hcy} ${cx + P.r * 0.35} ${hcy - P.r * 0.8}Z" fill="${shade}" opacity=".35"/>
    <ellipse cx="${cx - P.r * 0.32}" cy="${hcy - P.r * 0.42}" rx="${P.r * 0.3}" ry="${P.r * 0.15}" fill="#fff" opacity=".16" transform="rotate(-18 ${cx - P.r * 0.32} ${hcy - P.r * 0.42})"/>
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
export function gleb({
  outfit = "jacket",
  brow = "neutral",
  prop = "",
  injured = false,
  armor = false,
  ghoul = false,
  aged = false,
  omega = false,
  kit = false,
} = {}) {
  const jacket = outfit === "jacket";
  if (omega)
    return build({
      skin: "#e0ae88",
      shade: "#c08b66",
      iris: "#6b3d1c",
      brow,
      top: "#2a2d34",
      topDark: "#1a1c22",
      sleeve: "#4a4f58",
      bottom: "#2a2d34",
      shoes: "#1a1a1e",
      torsoExtra: OMEGA_SVG,
      hairBack: kit ? KIT_BACK : "",
      hairFront: kit ? KIT_FRONT : HAIR.glebFront(aged ? "#a3a6ae" : "#17181d"),
      accessory:
        `<path d="M__CX__ __CY__ m40 0 q8 0 8 10 v14" stroke="#2a2a2e" stroke-width="4" fill="none"/>` +
        (aged
          ? `<path d="M__CX__ __CY__ m-26 -30 l40 62" stroke="#9a4a46" stroke-width="5" stroke-linecap="round"/><path d="M__CX__ __CY__ m-24 30 q24 18 48 0 l-2 10 q-22 12 -44 0z" fill="#a3a6ae" opacity=".7"/>`
          : ""),
      handProp:
        prop === "pistol"
          ? `<g transform="translate(__X__ __Y__)"><rect x="-6" y="-4" width="40" height="12" rx="2" fill="#2a2a2e" stroke="#0b0d14" stroke-width="1.6"/><rect x="-4" y="4" width="12" height="22" rx="3" fill="#2a2a2e" stroke="#0b0d14" stroke-width="1.6"/></g>`
          : prop === "rifle"
            ? RIFLE_SVG
            : prop === "photo"
              ? `<g transform="translate(__X__ __Y__) rotate(-8)"><rect x="-26" y="-40" width="52" height="40" fill="#f2efe6" stroke="#0b0d14" stroke-width="1.6"/><rect x="-22" y="-36" width="44" height="30" fill="#9fc2e0"/><circle cx="-10" cy="-20" r="5" fill="#efc1a0"/><circle cx="6" cy="-18" r="4" fill="#e9c1a0"/></g>`
              : "",
    });
  if (ghoul)
    return build({
      skin: "#e0ae88",
      shade: "#c08b66",
      iris: "#6b3d1c",
      brow,
      top: "#141418",
      topDark: "#0a0a0c",
      sleeve: "#e0ae88",
      bottom: "#1b1e27",
      shoes: "#2a2a2e",
      torsoExtra: `<path d="M64 150 Q100 136 136 150 L138 262 Q100 276 62 262Z" fill="#1d1f24" stroke="#0b0d14" stroke-width="2"/><rect x="74" y="168" width="52" height="20" rx="3" fill="#f2efe6"/><text x="100" y="184" text-anchor="middle" font-family="Inter, sans-serif" font-weight="900" font-size="15" fill="#c9302c">ГУЛЬ</text><rect x="72" y="210" width="22" height="26" rx="3" fill="#2a2d34"/><rect x="106" y="210" width="22" height="26" rx="3" fill="#2a2d34"/>`,
      hairFront: HAIR.glebFront(aged ? "#a3a6ae" : "#17181d"),
      accessory:
        `<path d="M__CX__ __CY__ m40 0 q8 0 8 10 v14" stroke="#2a2a2e" stroke-width="4" fill="none"/><circle cx="__CX__" cy="__CY__" r="5" transform="translate(42 2)" fill="#2a2a2e"/>` +
        (aged
          ? `<path d="M__CX__ __CY__ m-26 -30 l40 62" stroke="#9a4a46" stroke-width="5" stroke-linecap="round"/><path d="M__CX__ __CY__ m-20 -22 l6 -4 m4 14 l6 -4 m4 14 l6 -4 m4 14 l6 -4" stroke="#9a4a46" stroke-width="2.4" stroke-linecap="round"/><path d="M__CX__ __CY__ m-30 20 q6 6 12 2 M__CX__ __CY__ m18 20 q6 6 12 2" stroke="#8a6a55" stroke-width="2" fill="none" opacity=".6"/><path d="M__CX__ __CY__ m-24 30 q24 18 48 0 l-2 10 q-22 12 -44 0z" fill="#a3a6ae" opacity=".7"/>`
          : ""),
      handProp:
        prop === "pistol"
          ? `<g transform="translate(__X__ __Y__)"><rect x="-6" y="-4" width="40" height="12" rx="2" fill="#2a2a2e" stroke="#0b0d14" stroke-width="1.6"/><rect x="-4" y="4" width="12" height="22" rx="3" fill="#2a2a2e" stroke="#0b0d14" stroke-width="1.6"/></g>`
          : prop === "flare"
            ? `<g transform="translate(__X__ __Y__)"><rect x="-6" y="-8" width="44" height="18" rx="8" fill="#e8641e" stroke="#0b0d14" stroke-width="1.8"/><rect x="-4" y="6" width="12" height="22" rx="3" fill="#e8641e" stroke="#0b0d14" stroke-width="1.6"/><circle cx="38" cy="1" r="6" fill="#2a2a2e"/></g>`
            : prop === "hare"
              ? `<g transform="translate(__X__ __Y__) scale(.55)"><ellipse cx="0" cy="0" rx="26" ry="22" fill="#d8d0c6" stroke="#0b0d14" stroke-width="2"/><circle cx="0" cy="-30" r="18" fill="#d8d0c6" stroke="#0b0d14" stroke-width="2"/><path d="M-8 -44 q-6 -34 4 -40 q6 6 4 40 M8 -44 q6 -34 14 -36 q2 8 -6 38" fill="#d8d0c6" stroke="#0b0d14" stroke-width="2"/><circle cx="-6" cy="-32" r="2.6" fill="#0b0d14"/><circle cx="6" cy="-32" r="2.6" fill="#0b0d14"/></g>`
              : prop === "rifle"
                ? RIFLE_SVG
                : "",
    });
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
    torsoExtra:
      (jacket
        ? `<path d="M88 130 L100 160 L112 130 L111 268 L89 268Z" fill="#5b6270" ${ol(2)}/><path d="M78 128 L92 132 L98 162 L84 150Z M122 128 L108 132 L102 162 L116 150Z" fill="#4a3c37" ${ol(2)}/><path d="M100 160 V266" stroke="#b9bcc4" stroke-width="2"/>`
        : `<path d="M88 130 Q100 142 112 130" fill="none" stroke="#344a66" stroke-width="4"/>`) +
      (armor ? ARMOR_SVG : ""),
    hairFront: HAIR.glebFront("#17181d"),
    accessory: injured
      ? `<ellipse cx="__CX__" cy="__CY__" rx="9" ry="6" transform="translate(16 -18)" fill="#8a4a6a" opacity=".75"/><path d="M__CX__ __CY__ m18 -14 q2 10 -2 22" stroke="#b3241b" stroke-width="3" fill="none" stroke-linecap="round"/>`
      : "",
    handProp:
      prop === "pistol"
        ? `<g transform="translate(__X__ __Y__)"><rect x="-6" y="-4" width="40" height="12" rx="2" fill="#2a2a2e" stroke="#0b0d14" stroke-width="1.6"/><rect x="-4" y="4" width="12" height="22" rx="3" fill="#2a2a2e" stroke="#0b0d14" stroke-width="1.6"/></g>`
        : prop === "rifle"
          ? RIFLE_SVG
          : prop === "phone"
            ? `<rect x="__X__" y="__Y__" width="16" height="26" rx="3" transform="translate(-14 -22)" fill="#111" ${ol(1.6)}/><rect x="__X__" y="__Y__" width="11" height="19" rx="2" transform="translate(-11.5 -19)" fill="#9fd2ff"/>`
            : "",
  });
}

export function masha({ outfit = "home", brow = "neutral", prop = "", pregnant = false } = {}) {
  const night = outfit === "night";
  if (outfit === "tee")
    return build({
      skin: "#ebbb98",
      shade: "#cc9773",
      iris: "#3e6a3a",
      brow,
      top: "#b9b4c8",
      topDark: "#8a8598",
      sleeve: "#ebbb98",
      bottom: "#141418",
      shoes: "#ebbb98",
      torsoExtra: `<path d="M86 130 Q100 142 114 130" fill="none" stroke="#8a8598" stroke-width="4"/>`,
      hairBack: HAIR.mashaBack("#5a3522", true),
      hairFront: HAIR.mashaFront("#5a3522"),
      faceOpts: { lash: true },
    });
  if (outfit === "nurse")
    return build({
      skin: "#ebbb98",
      shade: "#cc9773",
      iris: "#3e6a3a",
      brow,
      top: "#cfe3ea",
      topDark: "#9fbfcc",
      sleeve: "#cfe3ea",
      bottom: "#3a4a5a",
      shoes: "#e9ecf2",
      torsoExtra: `<path d="M88 130 L100 146 L112 130" fill="none" stroke="#9fbfcc" stroke-width="4"/><rect x="110" y="176" width="22" height="22" rx="3" fill="#fff" ${ol(1.6)}/><path d="M121 180 v14 M114 187 h14" stroke="#d9302c" stroke-width="4"/><rect x="72" y="226" width="26" height="22" rx="3" fill="#9fbfcc"/><path d="M78 222 v10 M84 222 v8" stroke="#f2efe6" stroke-width="4"/>`,
      hairBack: `<path d="M__CX__ __CY__ m-42 0 q-4 -44 42 -46 q46 2 42 46 q0 22 -8 34 h-68 q-8 -12 -8 -34z" fill="#5a3522" ${ol()}/>${Array.from({ length: 7 }, (_, i) => `<ellipse cx="__CX__" cy="__CY__" rx="13" ry="16" transform="translate(${36 + (i % 2) * 4} ${30 + i * 26})" fill="#5a3522" ${ol(2)}/>`).join("")}<circle cx="__CX__" cy="__CY__" r="7" transform="translate(38 212)" fill="#d9302c" ${ol(1.6)}/>`,
      hairFront: HAIR.mashaFront("#5a3522"),
      faceOpts: { lash: true },
    });
  if (outfit === "black")
    return build({
      skin: "#ebbb98",
      shade: "#cc9773",
      iris: "#3e6a3a",
      brow,
      top: "#1d1d22",
      topDark: "#0d0d10",
      sleeve: "#1d1d22",
      bottom: "#141418",
      shoes: "#2a2a2e",
      torsoExtra:
        `<path d="M100 132 V268" stroke="#8a8d96" stroke-width="3"/><path d="M80 128 L100 150 L120 128" fill="none" stroke="#3a3a42" stroke-width="6"/><rect x="70" y="210" width="20" height="4" fill="#3a3a42"/><rect x="110" y="210" width="20" height="4" fill="#3a3a42"/>` +
        (pregnant
          ? `<path d="M66 214 Q64 278 100 280 Q136 278 134 214 Q122 200 100 200 Q78 200 66 214Z" fill="#26262c" stroke="#0b0d14" stroke-width="2.4"/><path d="M80 226 Q86 214 98 212" stroke="#4a4a54" stroke-width="5" fill="none" stroke-linecap="round"/>`
          : ""),
      hairBack: HAIR.mashaBack("#5a3522", true),
      hairFront: HAIR.mashaFront("#5a3522"),
      faceOpts: { lash: true },
    });
  if (outfit === "towel")
    return build({
      skin: "#ebbb98",
      shade: "#cc9773",
      iris: "#3e6a3a",
      brow,
      top: "#f2efe6",
      topDark: "#d9d2c2",
      sleeve: "#ebbb98",
      bottom: "#ebbb98",
      shoes: "#ebbb98",
      skirt: { color: "#f2efe6", len: 60 },
      torsoExtra: `<path d="M64 150 H136" stroke="#c95a5a" stroke-width="6"/><path d="M64 250 H136" stroke="#c95a5a" stroke-width="6"/>`,
      hairBack: HAIR.mashaBack("#5a3522", true),
      hairFront: HAIR.mashaFront("#5a3522"),
      faceOpts: { lash: true },
      handProp: prop === "venik" ? VENIK : "",
    });
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

// Vanya, Masha and Maxim's son, about three and a half: striped tee, overalls, sandals.
export function vanya({ outfit = "day", brow = "neutral" } = {}) {
  const pj = outfit === "pajama";
  return build({
    kid: 4,
    skin: "#f2c6a6",
    shade: "#d4a07e",
    iris: "#4a5a6a",
    brow,
    top: pj ? "#9fd0e9" : "#f2efe6",
    topDark: pj ? "#7ab0cc" : "#c9c4b8",
    sleeve: pj ? "#9fd0e9" : "#f2efe6",
    bottom: pj ? "#9fd0e9" : "#4a7ab8",
    shoes: pj ? "#f2c6a6" : "#c9483a",
    torsoExtra: pj
      ? `<circle cx="92" cy="${404 - 56 - 30}" r="4" fill="#ffe08a"/><circle cx="108" cy="${404 - 56 - 18}" r="4" fill="#ffe08a"/>`
      : `${[0, 1, 2].map((k) => `<path d="M76 ${404 - 56 - 48 + k * 10} H124" stroke="#c9483a" stroke-width="4"/>`).join("")}<path d="M78 ${404 - 56 - 22} H122 V${404 - 56 + 2} H78Z" fill="#4a7ab8" ${ol(1.6)}/><path d="M84 ${404 - 56 - 22} L80 ${404 - 56 - 54} M116 ${404 - 56 - 22} L120 ${404 - 56 - 54}" stroke="#4a7ab8" stroke-width="6"/>`,
    hairFront: `<path d="M__CX__ __CY__ m-36 -2 q-6 -38 36 -40 q42 2 36 40 q-6 -14 -14 -16 l-4 10 l-6 -14 l-6 12 l-6 -14 l-6 12 l-6 -12 l-4 12 q-14 6 -20 20z" fill="#9a6a3e" ${ol(2)}/><path d="M__CX__ __CY__ m2 -42 q10 -10 6 -18" stroke="#9a6a3e" stroke-width="5" fill="none" stroke-linecap="round"/>`,
    faceOpts: { freckles: true },
  });
}

// General of the "Granit" base: dress uniform, peaked cap, medals, grey moustache.
export function general({ brow = "neutral" } = {}) {
  return build({
    skin: "#d9a882",
    shade: "#b8865f",
    iris: "#4a4a3a",
    brow,
    top: "#4a5636",
    topDark: "#323a24",
    sleeve: "#4a5636",
    bottom: "#3a4428",
    shoes: "#141414",
    torsoExtra: `<path d="M88 130 L100 152 L112 130" fill="#e9ecf2"/><path d="M98 134 h4 v24 h-4z" fill="#2a3a5a"/>${[0, 1, 2, 3].map((k) => `<rect x="${70 + k * 12}" y="172" width="10" height="6" fill="${["#c9302c", "#e9c46a", "#3a7ab8", "#e9c46a"][k]}"/>`).join("")}<circle cx="78" cy="190" r="6" fill="#e9c46a" stroke="#0b0d14" stroke-width="1.4"/><circle cx="94" cy="190" r="6" fill="#e9c46a" stroke="#0b0d14" stroke-width="1.4"/>${[160, 196, 232].map((y) => `<circle cx="112" cy="${y}" r="3.4" fill="#e9c46a"/>`).join("")}<path d="M64 132 h20 M116 132 h20" stroke="#e9c46a" stroke-width="6"/>`,
    hairFront: `<path d="M__CX__ __CY__ m-48 -20 q48 -26 96 0 l-6 -12 q-42 -20 -84 0z" fill="#3a4428" ${ol(2)}/><path d="M__CX__ __CY__ m-40 -30 q0 -30 40 -32 q40 2 40 32z" fill="#4a5636" ${ol(2)}/><rect x="__CX__" y="__CY__" width="44" height="10" transform="translate(-22 -32)" fill="#1a1a1e"/><path d="M__CX__ __CY__ m-6 -50 l6 -8 l6 8 l-6 6z" fill="#e9c46a"/>`,
    accessory: `<path d="M__CX__ __CY__ m-24 12 q12 -8 24 0 q12 -8 24 0 q-6 10 -24 6 q-18 4 -24 -6z" fill="#c9ccd2" ${ol(1.6)}/><path d="M__CX__ __CY__ m-36 -10 q0 -10 4 -14 M__CX__ __CY__ m36 -10 q0 -10 -4 -14" stroke="#c9ccd2" stroke-width="6" fill="none"/>`,
    faceOpts: { blush: false },
  });
}

// The Omega squad. v: 0 Bear (huge, beard, machine gun), 1 Fox (sniper, red hair),
// 2 Quiet (sapper, balaclava), 3 Doc (medic, grey crop, glasses).
export function omega({ v = 0, brow = "neutral", prop = "", kit = false } = {}) {
  const skins = [
    ["#c08a62", "#9a6a46"],
    ["#f0c8aa", "#d4a688"],
    ["#d9a882", "#b8865f"],
    ["#e4b896", "#c49472"],
  ][v];
  const hair = [
    `<path d="M__CX__ __CY__ m-40 -10 q2 -34 40 -34 q38 0 40 34 q-12 -12 -40 -12 q-28 0 -40 12z" fill="#2a1d16" ${ol(2)}/>`,
    `<path d="M__CX__ __CY__ m-40 -6 q-4 -40 40 -42 q44 2 40 42 q-16 -22 -46 -18 q-18 4 -34 18z" fill="#c9582a" ${ol(2)}/><path d="M__CX__ __CY__ m34 -20 q34 10 26 50 q-4 22 -16 32" stroke="#c9582a" stroke-width="15" fill="none" stroke-linecap="round"/>`,
    `<path d="M__CX__ __CY__ m-42 -8 q0 -40 42 -42 q42 2 42 42 q-10 -8 -42 -8 q-32 0 -42 8z" fill="#1a1a1e" ${ol(2)}/><path d="M__CX__ __CY__ m-41 12 q20 -6 41 -6 q21 0 41 6 q-2 30 -41 36 q-39 -6 -41 -36z" fill="#1a1a1e" ${ol(2)}/>`,
    `<path d="M__CX__ __CY__ m-40 -8 q0 -36 40 -36 q40 0 40 36 q-10 -14 -40 -14 q-30 0 -40 14z" fill="#b9b4b0" ${ol(2)}/>`,
  ][v];
  return build({
    skin: skins[0],
    shade: skins[1],
    iris: ["#3a2a1a", "#3e7a3a", "#4a5a6a", "#4a5a6a"][v],
    brow,
    top: "#2a2d34",
    topDark: "#1a1c22",
    sleeve: v === 0 ? skins[0] : "#4a4f58",
    bottom: "#2a2d34",
    shoes: "#1a1a1e",
    torsoExtra:
      OMEGA_SVG +
      (v === 3
        ? `<rect x="112" y="236" width="22" height="22" rx="3" fill="#fff" stroke="#0b0d14" stroke-width="1.6"/><path d="M123 240 v14 M116 247 h14" stroke="#d9302c" stroke-width="4"/>`
        : ""),
    hairFront: kit ? KIT_FRONT : hair,
    hairBack: kit
      ? KIT_BACK
      : v === 2
        ? `<path d="M__CX__ __CY__ m-44 0 q-4 -48 44 -50 q48 2 44 50 q2 34 -10 48 h-68 q-12 -14 -10 -48z" fill="#1a1a1e" ${ol(2)}/>`
        : "",
    accessory:
      v === 0 && !kit
        ? `<path d="M__CX__ __CY__ m-34 12 q2 40 34 44 q32 -4 34 -44 q-10 16 -34 16 q-24 0 -34 -16z" fill="#2a1d16" ${ol(2)}/>`
        : "",
    faceOpts: { lash: v === 1 || v === 3, glasses: v === 3, blush: false, freckles: v === 1 },
    handProp: prop === "rifle" || v === 0 || v === 1 ? RIFLE_SVG : "",
  });
}

// Professor Lanskaya: lab coat over a black turtleneck, a tight dark bun, thin glasses, a tablet.
export function professor({ brow = "neutral" } = {}) {
  return build({
    skin: "#ecc4a4",
    shade: "#cfa282",
    iris: "#3a4a5a",
    brow,
    top: "#f4f6f8",
    topDark: "#c9cdd4",
    sleeve: "#f4f6f8",
    bottom: "#2a2a30",
    shoes: "#1a1a1e",
    torsoExtra: `<path d="M88 128 L100 150 L112 128 Z" fill="#141418"/><path d="M100 150 V268" stroke="#c9cdd4" stroke-width="3"/><rect x="108" y="168" width="22" height="26" rx="3" fill="#c9cdd4"/><path d="M112 172 h14 M112 180 h10" stroke="#3a7ab8" stroke-width="2"/><rect x="66" y="226" width="34" height="8" rx="3" fill="#2a5aa8"/>`,
    hairBack: `<path d="M__CX__ __CY__ m-40 -2 q-4 -42 40 -44 q44 2 40 44 q-4 -26 -40 -28 q-36 2 -40 28z" fill="#1d1a18" stroke="#0b0d14" stroke-width="2"/><circle cx="__CX__" cy="__CY__" r="20" transform="translate(0 -52)" fill="#1d1a18" stroke="#0b0d14" stroke-width="2"/>`,
    hairFront: `<path d="M__CX__ __CY__ m-40 -6 q4 -38 40 -38 q36 0 40 38 q-14 -22 -40 -22 q-26 0 -40 22z" fill="#1d1a18" stroke="#0b0d14" stroke-width="2"/>`,
    faceOpts: { glasses: true, lash: true, blush: false },
  });
}

// Checkpoint soldier: khaki uniform, helmet, rifle across the body.
export function soldier({ brow = "angry", mask = false, prop = "" } = {}) {
  // balaclava: dark knit over the whole head with an eye slot (evenodd cut-out)
  const balaclava = `<g transform="translate(__CX__ __CY__)"><path fill-rule="evenodd" d="M-38 -2 a38 41 0 1 0 76 0 a38 41 0 1 0 -76 0z M-30 -12 h60 v20 h-60z" fill="#1a1c20" ${ol(2)}/><path d="M-36 30 q36 20 72 0" stroke="#2a2d34" stroke-width="3" fill="none"/></g>`;
  return build({
    skin: "#dcae8c",
    shade: "#bb8c6a",
    iris: "#3a3a2a",
    brow,
    top: mask ? "#3a3f36" : "#56603e",
    topDark: mask ? "#24281f" : "#3a4228",
    sleeve: mask ? "#3a3f36" : "#56603e",
    bottom: mask ? "#30342c" : "#4a5236",
    shoes: "#1d1a16",
    accessory: mask ? balaclava : "",
    handProp:
      prop === "flashlight"
        ? `<rect x="__X__" y="__Y__" width="12" height="30" rx="3" transform="translate(-6 -4)" fill="#2a2a2a" ${ol(1.6)}/><path d="M__X__ __Y__ m-8 26 l-60 240 h136 l-60 -240z" fill="#fff6c8" opacity=".16"/>`
        : prop === "radio"
          ? `<rect x="__X__" y="__Y__" width="16" height="30" rx="3" transform="translate(-8 -26)" fill="#2a2d24" ${ol(1.6)}/><path d="M__X__ __Y__ m4 -26 v-16" stroke="#111" stroke-width="3"/><circle cx="__X__" cy="__Y__" r="3" transform="translate(0 -18)" fill="#e23b2e"/>`
          : prop === "rifle"
            ? RIFLE_SVG
            : "",
    torsoExtra: `<rect x="70" y="180" width="60" height="44" rx="6" fill="#3a4228" ${ol(2)}/><path d="M74 196 h52 M74 210 h52" stroke="#2a3020" stroke-width="3"/><path d="M60 150 L140 270" stroke="#1d1a16" stroke-width="10"/><rect x="88" y="190" width="70" height="12" rx="3" transform="rotate(52 100 196)" fill="#2a2a2a"/>`,
    hairFront: `<path d="M__CX__ __CY__ m-46 0 q0 -54 46 -54 q46 0 46 54 q-10 -4 -14 -10 h-64 q-4 6 -14 10z" fill="#56603e" ${ol(2)}/><path d="M__CX__ __CY__ m-50 0 h100" stroke="${O}" stroke-width="5" stroke-linecap="round"/>`,
    faceOpts: { blush: false },
  });
}

// Baba Zina, the neighbour: pink curlers, flowered dressing gown, slippers, a cast-iron pan.
export function zina({ brow = "angry", prop = "" } = {}) {
  const curlers = [-30, -10, 10, 30]
    .map(
      (dx) =>
        `<rect x="__CX__" y="__CY__" width="16" height="12" rx="5" transform="translate(${dx - 8} -48)" fill="#ff8fb8" ${ol(1.6)}/>`,
    )
    .join("");
  return build({
    skin: "#e8bc9a",
    shade: "#c89a78",
    iris: "#4a5a3a",
    brow,
    top: "#d96a8a",
    topDark: "#b04a6a",
    sleeve: "#d96a8a",
    bottom: "#e8bc9a",
    shoes: "#ff8fb8",
    skirt: { color: "#d96a8a", len: 130 },
    torsoExtra: `${[
      [80, 160],
      [118, 176],
      [92, 214],
      [124, 236],
      [76, 248],
    ]
      .map(
        ([x, y]) =>
          `<circle cx="${x}" cy="${y}" r="7" fill="#ffe27a"/><circle cx="${x}" cy="${y}" r="3" fill="#fff"/>`,
      )
      .join("")}<path d="M66 214 H134" stroke="#8a2a4a" stroke-width="6"/>`,
    hairFront: `<path d="M__CX__ __CY__ m-40 -2 q0 -40 40 -40 q40 0 40 40 q-14 -20 -40 -20 q-26 0 -40 20z" fill="#b8865a" ${ol(2)}/>${curlers}`,
    faceOpts: { lash: true },
    handProp:
      prop === "pan"
        ? `<g transform="translate(__X__ __Y__)"><rect x="-4" y="-50" width="10" height="46" rx="4" fill="#2a2420" ${ol(1.6)}/><ellipse cx="1" cy="-78" rx="32" ry="30" fill="#2a2a2e" ${ol(2.2)}/><ellipse cx="1" cy="-78" rx="22" ry="20" fill="#3a3a40"/></g>`
        : prop === "box"
          ? `<g transform="translate(__X__ __Y__)"><rect x="-34" y="-10" width="68" height="44" rx="4" fill="#56603e" ${ol(2)}/><text x="0" y="18" text-anchor="middle" font-family="Inter, sans-serif" font-weight="900" font-size="13" fill="#e9e3c9">ПАТРОНЫ</text></g>`
          : prop === "molotov"
            ? `<g transform="translate(__X__ __Y__)"><path d="M-8 4 v-26 q0 -8 5 -12 v-12 h6 v12 q5 4 5 12 v26z" fill="#cfe9d4" opacity=".9" ${ol(1.6)}/><path d="M-1 -46 q-10 -8 -2 -20" stroke="#f2efe6" stroke-width="5" fill="none"/><g class="mflame"><path d="M-6 -62 q-6 -18 6 -30 q2 12 8 10 q4 14 -6 22z" fill="#ff8a2b"/><path d="M-2 -64 q-2 -10 4 -16 q2 8 4 8 q0 6 -6 10z" fill="#ffe27a"/></g></g>`
            : "",
  });
}

// Village medic: white coat, grey perm, glasses (.glasses can drop).
export function feldsher({ brow = "neutral" } = {}) {
  return build({
    skin: "#e4b896",
    shade: "#c49472",
    iris: "#4a5a6a",
    brow,
    top: "#f2f4f6",
    topDark: "#c9ccd2",
    sleeve: "#f2f4f6",
    bottom: "#e4b896",
    shoes: "#3a3a40",
    skirt: { color: "#5a5e6a", len: 110 },
    torsoExtra: `<path d="M100 132 V268" stroke="#c9ccd2" stroke-width="3"/><rect x="110" y="170" width="20" height="24" rx="3" fill="#c9ccd2"/><path d="M84 132 Q76 200 92 230 M92 230 a6 6 0 1 0 1 0" stroke="#3a3a40" stroke-width="3" fill="none"/>`,
    hairFront: `<path d="M__CX__ __CY__ m-42 -2 q-6 -46 42 -48 q48 2 42 48 q-8 -20 -42 -22 q-34 2 -42 22z" fill="#b9b4b0" ${ol(2)}/>${[-30, -12, 6, 24].map((d) => `<circle cx="__CX__" cy="__CY__" r="9" transform="translate(${d} -46)" fill="#b9b4b0" ${ol(1.6)}/>`).join("")}`,
    faceOpts: { glasses: true, lash: true },
  });
}

// Valkyrie: white hair, ice-blue eyes, black body armour with her callsign.
export function valkyrie({ brow = "neutral", queen = false, prop = "" } = {}) {
  if (queen)
    return build({
      skin: "#c9d2d6",
      shade: "#a8b4ba",
      iris: "#7af0ff",
      brow,
      top: "#141418",
      topDark: "#0a0a0c",
      sleeve: "#c9d2d6",
      bottom: "#141418",
      shoes: "#2a2a2e",
      torsoExtra: `<path d="M64 150 Q100 136 136 150 L138 262 Q100 276 62 262Z" fill="#1d1f24" stroke="#0b0d14" stroke-width="2"/><path d="M70 262 l8 18 l8 -14 l10 20 l8 -18 l10 16 l8 -22" fill="#141418" ${ol(1.6)}/><path d="M76 160 q10 30 -4 60 M126 170 q-12 26 2 56" stroke="#5a7ab8" stroke-width="3" fill="none" opacity=".7"/>`,
      hairBack: `<path d="M__CX__ __CY__ m-48 -8 q-10 -50 48 -52 q58 2 48 52 q14 50 0 96 l-14 -20 l-10 24 l-12 -22 l-12 24 l-12 -24 l-12 22 l-10 -24 l-14 20 q-14 -46 0 -96z" fill="#f4f6fa" ${ol()}/>`,
      hairFront: HAIR.mashaFront("#f4f6fa"),
      accessory: `<path d="M__CX__ __CY__ m-30 -4 l-10 -10 M__CX__ __CY__ m30 -4 l10 -10 M__CX__ __CY__ m-24 12 q-6 10 -2 20 M__CX__ __CY__ m24 12 q6 10 2 20" stroke="#5a7ab8" stroke-width="2.4" fill="none" opacity=".8"/><circle cx="__CX__" cy="__CY__" r="60" fill="#7af0ff" opacity=".08"/>`,
      faceOpts: { lash: true, blush: false },
    });
  return build({
    skin: "#f0d0bc",
    shade: "#d4b09a",
    iris: "#4ab8f0",
    brow,
    top: "#141418",
    topDark: "#0a0a0c",
    sleeve: "#141418",
    bottom: "#141418",
    shoes: "#2a2a2e",
    torsoExtra: `<path d="M64 150 Q100 136 136 150 L138 262 Q100 276 62 262Z" fill="#1d1f24" stroke="#0b0d14" stroke-width="2"/><rect x="66" y="222" width="68" height="20" rx="3" fill="#f2efe6"/><text x="100" y="237" text-anchor="middle" font-family="Inter, sans-serif" font-weight="900" font-size="11" fill="#2a5aa8">ВАЛЬКИРИЯ</text>`,
    handProp:
      prop === "pistol"
        ? `<g transform="translate(__X__ __Y__)"><rect x="-6" y="-4" width="40" height="12" rx="2" fill="#2a2a2e" stroke="#0b0d14" stroke-width="1.6"/><rect x="-4" y="4" width="12" height="22" rx="3" fill="#2a2a2e" stroke="#0b0d14" stroke-width="1.6"/></g>`
        : "",
    hairBack: HAIR.mashaBack("#f4f6fa", true),
    hairFront: HAIR.mashaFront("#f4f6fa"),
    faceOpts: { lash: true },
  });
}

// Infected: grey-green skin, milky eyes, torn clothes.
export function zombie({ v = 0 } = {}) {
  const tops = ["#5a6a7a", "#7a5a4a", "#4a5a3a"];
  return build({
    skin: "#a8b8a0",
    shade: "#8a9a84",
    iris: "#e9f4ff",
    brow: "angry",
    top: tops[v % 3],
    topDark: "#2a2d34",
    sleeve: tops[v % 3],
    bottom: "#3a3a42",
    shoes: "#2a2a2e",
    torsoExtra: `<path d="M70 200 l12 18 l-6 12 M120 170 l-10 16 M90 240 l14 -10" stroke="#2a2d34" stroke-width="4" fill="none"/><path d="M110 150 q6 10 0 18" stroke="#6a2a2a" stroke-width="4" fill="none" opacity=".7"/>`,
    hairFront:
      v % 2
        ? `<path d="M__CX__ __CY__ m-36 -10 q-2 -30 36 -32 q34 2 36 30 l-10 -8 l-8 10 l-10 -12 l-8 10 l-12 -10 l-8 10z" fill="#4a4a4a" ${ol(2)}/>`
        : "",
    faceOpts: { blush: false },
  });
}

// Gleb's mother: grey bun, glasses, shawl over a cardigan, long skirt.
export function granny({ brow = "worried" } = {}) {
  return build({
    skin: "#e4b896",
    shade: "#c49472",
    iris: "#5a4a3a",
    brow,
    top: "#7a5a7a",
    topDark: "#5a3e5a",
    sleeve: "#7a5a7a",
    bottom: "#d4a888",
    shoes: "#4a3a3a",
    skirt: { color: "#4a4a5a", len: 120 },
    torsoExtra: `<path d="M64 140 L100 190 L136 140 L140 170 L100 230 L60 170Z" fill="#c9a24a" ${ol(2)}/><path d="M76 150 l10 14 M124 150 l-10 14" stroke="#8a6a2a" stroke-width="3"/>`,
    hairBack: `<circle cx="__CX__" cy="__CY__" r="18" transform="translate(0 -40)" fill="#cfd2d8" ${ol(2)}/>`,
    hairFront: `<path d="M__CX__ __CY__ m-38 -4 q0 -36 38 -36 q38 0 38 36 q-12 -18 -38 -18 q-26 0 -38 18z" fill="#cfd2d8" ${ol(2)}/>`,
    faceOpts: { glasses: true, lash: true },
  });
}

// Gleb's father: grey hair, moustache, knitted vest over a shirt.
export function grandpa({ brow = "worried" } = {}) {
  return build({
    skin: "#d8a47e",
    shade: "#b8845e",
    iris: "#4a4a3a",
    brow,
    top: "#8a7a5a",
    topDark: "#6a5a3a",
    sleeve: "#cfd6e2",
    bottom: "#4a4a52",
    shoes: "#3a2a22",
    torsoExtra: `<path d="M86 128 L100 150 L114 128" fill="#cfd6e2" ${ol(2)}/>${[170, 196, 222, 248].map((y) => `<path d="M70 ${y} l10 8 l10 -8 l10 8 l10 -8 l10 8 l10 -8" stroke="#6a5a3a" stroke-width="3" fill="none"/>`).join("")}`,
    hairFront: `<path d="M__CX__ __CY__ m-38 6 q-2 -26 8 -32 M__CX__ __CY__ m38 6 q2 -26 -8 -32" stroke="#c9ccd2" stroke-width="12" fill="none" stroke-linecap="round"/>`,
    accessory: `<path d="M__CX__ __CY__ m-20 26 q10 -8 20 -2 q10 -6 20 2 q-10 8 -20 4 q-10 4 -20 -4z" fill="#c9ccd2" ${ol(1.6)}/>`,
    faceOpts: { blush: false },
  });
}

// Ded Maxim: neighbour from the first floor. Striped vest, grey beard and moustache, bald top,
// flat cap, slippers; holds a broken vodka bottle neck.
export function maxim({
  brow = "angry",
  prop = "bottle",
  helmet = false,
  uniform = false,
  banya = false,
  shaved = false,
} = {}) {
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
    top: banya ? "#d9a07c" : uniform ? "#56603e" : "#e9ecf2",
    topDark: banya ? "#b77f5c" : uniform ? "#3a4228" : "#b9c0cc",
    sleeve: banya ? "#d9a07c" : uniform ? "#56603e" : "#d9a07c",
    bottom: banya ? "#d9a07c" : uniform ? "#4a5236" : "#3a3f4a",
    shoes: banya ? "#d9a07c" : uniform ? "#1d1a16" : "#5a4a3a",
    torsoExtra: banya
      ? `<path d="M84 170 q6 -6 12 0 q6 -6 12 0 M90 186 q6 -6 12 0" stroke="#d8dbe0" stroke-width="3" fill="none"/><path d="M60 236 H140 L146 300 H54Z" fill="#f2efe6" ${ol(2)}/><path d="M58 250 H142" stroke="#c95a5a" stroke-width="6"/>`
      : uniform
        ? `<path d="M86 132 L100 150 L114 132" fill="#e9ecf2"/>${[136, 142].map((y) => `<path d="M90 ${y} H110" stroke="#2a4a8a" stroke-width="4"/>`).join("")}` +
          ARMOR_SVG
        : `${[150, 166, 182, 198, 214, 230, 246, 262].map((y) => `<path d="M66 ${y} H134" stroke="#2a4a8a" stroke-width="6"/>`).join("")}`,
    hairFront:
      shaved && !helmet
        ? `<ellipse cx="__CX__" cy="__CY__" rx="16" ry="8" transform="translate(-18 -28)" fill="#fff" opacity=".45"/>`
        : banya
          ? `<path d="M__CX__ __CY__ m-44 -6 q0 -46 44 -48 q44 2 44 48 q6 4 4 10 h-96 q-2 -6 4 -10z" fill="#e9dcc0" ${ol(2)}/><path d="M__CX__ __CY__ m-30 -30 q30 -10 60 0" stroke="#c9b48a" stroke-width="4" fill="none"/>`
          : helmet
            ? tankHelmet
            : `<path d="M__CX__ __CY__ m-36 4 q-2 -20 6 -26 M__CX__ __CY__ m36 4 q2 -20 -6 -26" stroke="#c9ccd2" stroke-width="10" fill="none" stroke-linecap="round"/>
      <path d="M__CX__ __CY__ m-40 -14 q4 -30 40 -32 q36 2 40 32 q-6 -6 -40 -8 q-34 2 -40 8z" fill="#4a4f5a" ${ol(2)}/><path d="M__CX__ __CY__ m-44 -12 q44 -14 92 2 q-4 6 -10 6 q-36 -10 -76 0 q-6 -2 -6 -8z" fill="#3a3f4a" ${ol(2)}/>`,
    accessory: shaved
      ? `<path d="M__CX__ __CY__ m-20 26 q20 10 40 0" stroke="#8a5a4a" stroke-width="2" fill="none" opacity=".5"/>`
      : `<path d="M__CX__ __CY__ m-30 16 q4 40 30 42 q26 -2 30 -42 q-8 18 -30 18 q-22 0 -30 -18z" fill="#d8dbe0" ${ol(2)}/>
      <path d="M__CX__ __CY__ m-18 18 q18 -10 36 0 q-8 8 -18 6 q-10 2 -18 -6z" fill="#c9ccd2" ${ol(1.6)}/>
      <path d="M__CX__ __CY__ m-22 -2 q4 -6 8 0 M__CX__ __CY__ m14 -2 q4 -6 8 0" stroke="#8a5a4a" stroke-width="1.6" fill="none" opacity=".6"/>`,
    faceOpts: { blush: false },
    handProp:
      prop === "bottle"
        ? `<path d="M__X__ __Y__ m-6 -4 v-26 l4 -10 h4 l4 10 v26 z" fill="#9fd1a8" opacity=".85" ${ol(1.6)}/><path d="M__X__ __Y__ m-6 -30 l3 -6 l3 4 l3 -6 l3 6" stroke="#cfe9d4" stroke-width="2" fill="none"/>`
        : prop === "vodka"
          ? `<path d="M__X__ __Y__ m-8 0 v-40 q0 -8 6 -12 v-14 h4 v14 q6 4 6 12 v40z" fill="#dff1ff" opacity=".9" ${ol(1.6)}/><rect x="__X__" y="__Y__" width="16" height="12" transform="translate(-8 -30)" fill="#e23b2e"/>`
          : prop === "rifle"
            ? RIFLE_SVG
            : prop === "axe"
              ? `<g transform="translate(__X__ __Y__)"><rect x="-4" y="-70" width="9" height="110" rx="4" fill="#8a5a34" ${ol(1.8)}/><path d="M-2 -70 L-34 -80 Q-44 -62 -34 -44 L-2 -52Z" fill="#9aa2ae" ${ol(2)}/></g>`
              : "",
  });
}
