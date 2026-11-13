// La comida de cada país para el puesto de comida, y las dos cocinas: horno de barro y parrilla.
// Las comidas se dibujan en un lienzo de -26..26 × -20..16.

export const COMIDAS = {
  saltena:
    '<path d="M-22 6c0-14 10-22 22-22s22 8 22 22c0 4-4 6-22 6s-22-2-22-6z" fill="#d98a2b"/><path d="M-18-6q4-6 8 0t8 0 8 0 8 0 8 0" stroke="#f2b45a" stroke-width="3" fill="none" stroke-linecap="round"/>',
  anticucho:
    '<path d="M-24 10L24-12" stroke="#c9a46a" stroke-width="2.6" stroke-linecap="round"/><g fill="#7a2e1a" stroke="#4a160b" stroke-width="1.2"><rect x="-17" y="-1" width="11" height="10" rx="3" transform="rotate(-25 -11.5 4)"/><rect x="-4" y="-7" width="11" height="10" rx="3" transform="rotate(-25 1.5 -2)"/><rect x="9" y="-13" width="11" height="10" rx="3" transform="rotate(-25 14.5 -8)"/></g><g fill="#c24a2a" opacity=".7"><circle cx="-12" cy="2" r="1.6"/><circle cx="1" cy="-4" r="1.6"/><circle cx="14" cy="-10" r="1.6"/></g>',
  taco:
    '<path d="M-23 9a23 21 0 0 1 46 0z" fill="#e8c26a" stroke="#b8862f" stroke-width="1.6"/><path d="M-17 2c4-3 8-4 12-1 4-3 9-3 13 0 3-2 6-2 9 0" stroke="#3f9a4a" stroke-width="4" fill="none" stroke-linecap="round"/><g fill="#c0392b"><circle cx="-9" cy="-1" r="2.4"/><circle cx="4" cy="-2" r="2.4"/></g><g fill="#f3ead2"><circle cx="-3" cy="-3" r="1.6"/><circle cx="10" cy="0" r="1.6"/></g><path d="M-20 6a20 18 0 0 1 40 0" stroke="#f2d48a" stroke-width="1.6" fill="none"/>',
  arepa:
    '<ellipse cx="0" cy="2" rx="22" ry="13" fill="#e9d29a" stroke="#b9954c" stroke-width="1.6"/><ellipse cx="0" cy="0" rx="22" ry="12" fill="#f2dfae"/><g stroke="#a8742c" stroke-width="2.2" stroke-linecap="round" opacity=".75"><path d="M-12-5l6 10M-2-7l6 13M8-6l6 10"/></g><ellipse cx="-6" cy="-4" rx="6" ry="2" fill="#fff" opacity=".35"/>',
  empanada:
    '<path d="M-23 8c0-13 10-21 23-21s23 8 23 21z" fill="#e3a64a" stroke="#b5762a" stroke-width="1.6"/><path d="M-23 8c4 3 8-3 11 0s7-3 11 0 7-3 11 0 7-3 12 0" stroke="#c98a36" stroke-width="3.2" fill="none" stroke-linecap="round"/><ellipse cx="-6" cy="-5" rx="8" ry="3" fill="#fff" opacity=".25"/>',
  paodequeijo:
    '<g><circle cx="-10" cy="2" r="10" fill="#f0c66e" stroke="#c9963c" stroke-width="1.4"/><circle cx="10" cy="2" r="10" fill="#f0c66e" stroke="#c9963c" stroke-width="1.4"/><circle cx="0" cy="-6" r="10" fill="#f5d184" stroke="#c9963c" stroke-width="1.4"/></g><g fill="#fff" opacity=".35"><ellipse cx="-3" cy="-10" rx="4" ry="2"/><ellipse cx="-13" cy="-2" rx="3" ry="1.6"/></g><g fill="#c9963c" opacity=".6"><circle cx="4" cy="-4" r="1"/><circle cx="-12" cy="5" r="1"/><circle cx="12" cy="6" r="1"/></g>',
  hotdog:
    '<path d="M-24 2c0-6 4-9 9-9h30c5 0 9 3 9 9s-4 9-9 9h-30c-5 0-9-3-9-9z" fill="#e8b45a" stroke="#b5832f" stroke-width="1.4"/><rect x="-25" y="-5" width="50" height="9" rx="4.5" fill="#b0402a" stroke="#7d2a1a" stroke-width="1.2"/><path d="M-19 -1q3-3 6 0t6 0 6 0 6 0 6 0 6 0" stroke="#ffd23f" stroke-width="2" fill="none" stroke-linecap="round"/>',
};

export function svgComida(id, extra = '') {
  return `<svg viewBox="-26 -20 52 36" aria-hidden="true" ${extra}>${COMIDAS[id] || COMIDAS.saltena}</svg>`;
}

/** Parrilla con brasas: para los países donde la comida sale de la plancha o el carbón. */
export const PARRILLA = `<svg viewBox="0 0 220 170" aria-hidden="true">
  <ellipse cx="110" cy="160" rx="96" ry="9" fill="#00000055"/>
  <path d="M60 118l-14 40M160 118l14 40M110 118v40" stroke="#3a3440" stroke-width="7" stroke-linecap="round"/>
  <path d="M18 70h184l-14 52H32z" fill="#2f2a36" stroke="#4a4354" stroke-width="4" stroke-linejoin="round"/>
  <g class="fuego">
    <ellipse cx="68" cy="88" rx="22" ry="9" fill="#ef476f"/>
    <ellipse cx="112" cy="90" rx="26" ry="10" fill="#ff7a2b"/>
    <ellipse cx="156" cy="88" rx="22" ry="9" fill="#ef476f"/>
    <ellipse cx="90" cy="86" rx="12" ry="5" fill="#ffb520"/>
    <ellipse cx="136" cy="86" rx="12" ry="5" fill="#ffb520"/>
  </g>
  <path d="M24 70h172" stroke="#8a8394" stroke-width="5" stroke-linecap="round"/>
  <path d="M40 66V74M62 66V74M84 66V74M106 66V74M128 66V74M150 66V74M172 66V74" stroke="#8a8394" stroke-width="3"/>
  <path d="M30 62h160" stroke="#b3acbd" stroke-width="3" stroke-linecap="round"/>
  <path d="M84 50c-6-8 4-12-2-20M110 46c-6-8 4-12-2-20M136 50c-6-8 4-12-2-20" stroke="#ffffff55" stroke-width="3" fill="none" stroke-linecap="round"/>
</svg>`;
