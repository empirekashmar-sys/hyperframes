// Part 15 art: a black helicopter (rotor .rotor spins), a dropped leather jacket, a cigarette with smoke.
const O = "#0b0d14";
const ol = (w = 3) =>
  `stroke="${O}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;

export const heli = (cls, x, y, s = 1) =>
  `<g class="${cls}"><g transform="translate(${x} ${y}) scale(${s})">
   <path d="M-160 0 Q-170 -70 -60 -80 H80 Q150 -76 160 -10 Q150 30 60 34 H-120 Q-160 30 -160 0Z" fill="#1a1c22" ${ol()}/>
   <path d="M60 -70 Q130 -66 140 -14 H60Z" fill="#3a4a5a" ${ol(2)}/>
   <path d="M-160 -20 L-380 -40 L-390 -10 L-160 10Z" fill="#1a1c22" ${ol(2.4)}/><path d="M-380 -80 L-370 30" ${ol(6)}/>
   <path d="M-60 60 H100 M-40 34 V60 M80 34 V60" ${ol(6)}/>
   <rect x="-10" y="-100" width="20" height="22" fill="#2a2d34" ${ol(2)}/>
   <g class="rotor"><path d="M-300 -102 H300" stroke="#2a2d34" stroke-width="10" stroke-linecap="round"/></g>
   <circle cx="150" cy="10" r="6" fill="#ff3a2a"/></g></g>`;
export const jacket = (cls, x, y) =>
  `<g class="${cls}" opacity="0"><g transform="translate(${x} ${y})"><path d="M-60 -40 L60 -40 L80 30 L-80 30Z" fill="#2b2321" ${ol(2.4)}/><path d="M-60 -40 L-110 10 L-90 30 M60 -40 L110 10 L90 30" fill="#2b2321" ${ol(2.4)}/><path d="M0 -40 V30" stroke="#5b6270" stroke-width="3"/></g></g>`;
export const cigarette = (cls, x, y) =>
  `<g class="${cls}" opacity="0"><g transform="translate(${x} ${y})"><rect x="0" y="-3" width="30" height="6" rx="2" fill="#f2efe6" ${ol(1.2)}/><rect x="26" y="-3" width="6" height="6" fill="#ff6a2a"/>${[0, 1, 2].map((k) => `<circle class="cig-smoke" cx="${44 + k * 12}" cy="${-30 - k * 26}" r="${5 + k * 3}" fill="#c9ccd2" opacity=".35"/>`).join("")}</g></g>`;
