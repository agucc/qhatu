// Los refrescos del mercado. Cada sabor tiene color y el dibujo de su ingrediente,
// para quien no distingue bien los tonos.
// En los dibujos, {t} es la tinta (el dibujo) y {c} es el color del refresco (cortes y detalles).

export const SABORES = {
  // Api: mazorca de maíz morado.
  api: {
    color: '#9a48b8',
    tinta: '#ffffff',
    simbolo: `<ellipse cx="12" cy="10" rx="4.3" ry="7.6" fill="{t}"/>
      <path d="M7.6 6.5h8.8M7.4 9h9.2M7.4 11.5h9.2M7.8 14h8.4M12 2.5v15" stroke="{c}" stroke-width="1"/>
      <path d="M12 21.5c-3.7-.4-6.6-3.6-7-8.3 2.2 1.6 4.4 3.8 5.4 6.6zM12 21.5c3.7-.4 6.6-3.6 7-8.3-2.2 1.6-4.4 3.8-5.4 6.6z" fill="{t}"/>`,
  },
  // Tumbo: partido por la mitad, con sus semillas.
  tumbo: {
    color: '#ffb520',
    tinta: '#17131f',
    simbolo: `<ellipse cx="12" cy="12.5" rx="5.6" ry="8.6" transform="rotate(-22 12 12.5)" fill="{t}"/>
      <ellipse cx="12" cy="12.5" rx="3.7" ry="6.6" transform="rotate(-22 12 12.5)" fill="{c}"/>
      <g fill="{t}"><circle cx="11" cy="9.6" r=".9"/><circle cx="13.4" cy="11.2" r=".9"/><circle cx="10.6" cy="12.8" r=".9"/><circle cx="13" cy="14.6" r=".9"/><circle cx="11.2" cy="16.2" r=".9"/></g>`,
  },
  // Frutilla con semillas y hojitas.
  frutilla: {
    color: '#ef476f',
    tinta: '#ffffff',
    simbolo: `<path d="M12 21.2c-3.9-2.6-6.6-6-6.6-9.3 0-2.3 1.7-3.5 3.6-3.5 1.2 0 2.2.4 3 .9.8-.5 1.8-.9 3-.9 1.9 0 3.6 1.2 3.6 3.5 0 3.3-2.7 6.7-6.6 9.3z" fill="{t}"/>
      <path d="M7.6 8.6c.9-.6 2.1-.6 3 .1L12 6.1l1.4 2.6c.9-.7 2.1-.7 3-.1-.5-1.9-2.3-3.1-4.4-3.1s-3.9 1.2-4.4 3.1z" fill="{t}"/>
      <path d="M12 5.6V3" stroke="{t}" stroke-width="1.4" stroke-linecap="round"/>
      <g fill="{c}"><circle cx="9.3" cy="12" r=".75"/><circle cx="14.7" cy="12" r=".75"/><circle cx="12" cy="13.9" r=".75"/><circle cx="10.3" cy="16.2" r=".75"/><circle cx="13.7" cy="16.2" r=".75"/></g>`,
  },
  // Limonada: rodaja de limón.
  limonada: {
    color: '#a6d63a',
    tinta: '#17131f',
    simbolo: `<circle cx="12" cy="12" r="8.4" fill="{t}"/>
      <circle cx="12" cy="12" r="6.6" fill="none" stroke="{c}" stroke-width="1.2"/>
      <path d="M12 5.6v12.8M6.5 8.8l11 6.4M6.5 15.2l11-6.4" stroke="{c}" stroke-width="1.1"/>`,
  },
  // Hierbabuena: un mate con su bombilla.
  hierbabuena: {
    color: '#1fb5a5',
    tinta: '#17131f',
    simbolo: `<path d="M8 10.2h8c0 1.1.9 2.1 1.6 3.4.8 1.6.7 3.6-.4 5.1-1.2 1.7-3.1 2.6-5.2 2.6s-4-.9-5.2-2.6c-1.1-1.5-1.2-3.5-.4-5.1.7-1.3 1.6-2.3 1.6-3.4z" fill="{t}"/>
      <rect x="7.2" y="8.4" width="9.6" height="2.4" rx="1.2" fill="{t}"/>
      <path d="M6.8 15.2h10.4" stroke="{c}" stroke-width="1"/>
      <path d="M13.2 9.2l4.3-6.4" stroke="{t}" stroke-width="1.7" stroke-linecap="round"/>
      <path d="M16.3 2.4l2.6 1.7" stroke="{t}" stroke-width="1.7" stroke-linecap="round"/>`,
  },
  // Somó: grano de maíz blanco.
  somo: {
    color: '#f3ead2',
    tinta: '#17131f',
    simbolo: `<path d="M5.6 8.2c0-3.1 2.9-4.9 6.4-4.9s6.4 1.8 6.4 4.9c0 4.6-3.2 10.7-6.4 12.5-3.2-1.8-6.4-7.9-6.4-12.5z" fill="{t}"/>
      <path d="M12 17.6c-1.3-1.4-2.4-3.9-2.4-6.2 0-1.8 1.1-2.9 2.4-2.9s2.4 1.1 2.4 2.9c0 2.3-1.1 4.8-2.4 6.2z" fill="{c}"/>
      <path d="M7.4 6.3c1.3-.9 2.9-1.3 4.6-1.3s3.3.4 4.6 1.3" fill="none" stroke="{c}" stroke-width=".9" stroke-linecap="round"/>`,
  },
  // Mocochinchi: durazno, que es de lo que se hace.
  mocochinchi: {
    color: '#96502a',
    tinta: '#ffffff',
    simbolo: `<path d="M12 7.6c-4.2-1.5-7.6 1.3-7.6 5.6 0 4.2 3.4 7.6 7.6 7.6s7.6-3.4 7.6-7.6c0-4.3-3.4-7.1-7.6-5.6z" fill="{t}"/>
      <path d="M12 8.6c-1.6 2.8-1.6 8 0 11.4" fill="none" stroke="{c}" stroke-width="1.1" stroke-linecap="round"/>
      <path d="M12.2 7.4c.3-2.6 2.1-4.2 5-4.3-.2 2.8-2.1 4.3-5 4.3z" fill="{t}"/>
      <path d="M11.9 7.6c-.1-1.3-.6-2.4-1.5-3.2" stroke="{t}" stroke-width="1.3" stroke-linecap="round" fill="none"/>`,
  },
  // Chicha morada: piña, que va en la receta.
  chicha: {
    color: '#3f3c9e',
    tinta: '#ffffff',
    simbolo: `<ellipse cx="12" cy="15" rx="5.2" ry="6.3" fill="{t}"/>
      <path d="M7.5 12.3l7.6 7.4M7 16l5.2 5M10.2 9.4l7.4 7.2M12.2 8.9l4.6 4.5M16.5 12.3l-7.6 7.4M17 16l-5.2 5M13.8 9.4l-7.4 7.2M11.8 8.9l-4.6 4.5" stroke="{c}" stroke-width=".9"/>
      <path d="M12 9.2L8.6 3.4l2.3 2.1L12 2.2l1.1 3.3 2.3-2.1z" fill="{t}"/>`,
  },
};

export const IDS_SABORES = Object.keys(SABORES);

/** El dibujo del símbolo (para meterlo dentro de otro SVG de 24 × 24). */
export function dibujoSimbolo(id, sabores = SABORES) {
  const s = sabores[id];
  return `<g opacity=".85">${s.simbolo.replaceAll('{t}', s.tinta).replaceAll('{c}', s.color)}</g>`;
}

export function svgSimbolo(id) {
  return `<svg viewBox="0 0 24 24" aria-hidden="true">${dibujoSimbolo(id)}</svg>`;
}
