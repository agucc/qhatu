// Los refrescos del mercado. Cada sabor tiene color y símbolo propio,
// para quien no distingue bien los tonos.

export const SABORES = {
  api: { color: '#9a48b8', tinta: '#ffffff', simbolo: '<circle cx="12" cy="12" r="6.5"/>' },
  tumbo: { color: '#ffb520', tinta: '#17131f', simbolo: '<path d="M12 4.5l7.5 14H4.5z"/>' },
  frutilla: {
    color: '#ef476f',
    tinta: '#ffffff',
    simbolo: '<path d="M12 19.5l-1-.9C7 15 4.5 12.7 4.5 9.9 4.5 7.6 6.3 5.8 8.6 5.8c1.3 0 2.6.6 3.4 1.6.8-1 2.1-1.6 3.4-1.6 2.3 0 4.1 1.8 4.1 4.1 0 2.8-2.5 5.1-6.5 8.7z"/>',
  },
  limonada: { color: '#a6d63a', tinta: '#17131f', simbolo: '<path d="M5 19C5 10.5 10.5 5 19 5c0 8.5-5.5 14-14 14z"/>' },
  hierbabuena: { color: '#1fb5a5', tinta: '#17131f', simbolo: '<path d="M12 3.5c3.2 4.2 6.2 7.7 6.2 10.8a6.2 6.2 0 0 1-12.4 0C5.8 11.2 8.8 7.7 12 3.5z"/>' },
  somo: {
    color: '#f3ead2',
    tinta: '#17131f',
    simbolo: '<path d="M12 3.5l2.6 5.4 5.9.7-4.4 4 1.2 5.9L12 16.6l-5.3 2.9 1.2-5.9-4.4-4 5.9-.7z"/>',
  },
  mocochinchi: { color: '#96502a', tinta: '#ffffff', simbolo: '<rect x="6" y="6" width="12" height="12" rx="2"/>' },
  chicha: { color: '#3f3c9e', tinta: '#ffffff', simbolo: '<path d="M12 3.5l7.5 8.5-7.5 8.5-7.5-8.5z"/>' },
};

export const IDS_SABORES = Object.keys(SABORES);

export function svgSimbolo(id) {
  const s = SABORES[id];
  return `<svg viewBox="0 0 24 24" fill="${s.tinta}" fill-opacity=".72" aria-hidden="true">${s.simbolo}</svg>`;
}
