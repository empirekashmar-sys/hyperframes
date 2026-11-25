// Part 21 art: three stretchers under white sheets (one with a red strand of hair), and a gold
// colonel's star for the general's office.
const O = "#0b0d14";
const ol = (w = 3) =>
  `stroke="${O}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;

// A covered stretcher seen from the side; red = a strand of red hair at the head end.
export const stretcher = (x, y, red = false) =>
  `<g transform="translate(${x} ${y})"><path d="M-170 0 H170" ${ol(8)}/><path d="M-150 0 V60 M150 0 V60" ${ol(6)}/><circle cx="-150" cy="66" r="8" fill="#2a2a2e"/><circle cx="150" cy="66" r="8" fill="#2a2a2e"/>
   <path d="M-180 -4 Q-170 -60 -110 -64 Q-60 -40 0 -48 Q80 -56 140 -40 Q186 -30 180 -4Z" fill="#f2f4f6" ${ol(3)}/>
   <path d="M-120 -50 q30 10 60 4 M20 -44 q40 8 90 0" stroke="#c9cdd4" stroke-width="4" fill="none"/>
   ${red ? `<path d="M-176 -10 q-20 10 -16 34 q4 -16 14 -22 q-4 14 2 26 q4 -18 12 -30z" fill="#c9582a" ${ol(1.6)}/>` : ""}</g>`;

// The colonel's shoulder board, held out by the general.
export const star = (id) =>
  `<g id="${id}" opacity="0"><rect x="-34" y="-14" width="68" height="28" rx="6" fill="#e9c46a" ${ol(2)}/><path d="M-20 -6 l4 8 h8 l-6 6 l2 8 l-8 -4 l-8 4 l2 -8 l-6 -6 h8z" fill="#b3241b"/><path d="M8 -6 l4 8 h8 l-6 6 l2 8 l-8 -4 l-8 4 l2 -8 l-6 -6 h8z" fill="#b3241b"/></g>`;
