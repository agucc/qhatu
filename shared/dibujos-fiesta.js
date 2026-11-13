// Dibujos de las fiestas del calendario (lámina del álbum y aviso de la portada).

const DIBUJOS = {
  // Alasitas: casita en miniatura con billetitos para el Ekeko
  alasitas: `<rect x="14" y="28" width="32" height="22" rx="2" fill="#f3ead2"/>
    <path d="M10 30L30 12l20 18z" fill="#c8102e"/>
    <rect x="26" y="36" width="8" height="14" fill="#96502a"/>
    <rect x="16" y="33" width="7" height="6" fill="#8ecae6"/><rect x="37" y="33" width="7" height="6" fill="#8ecae6"/>
    <rect x="4" y="46" width="14" height="8" rx="1" fill="#a6d63a" transform="rotate(-12 11 50)"/>
    <rect x="42" y="46" width="14" height="8" rx="1" fill="#a6d63a" transform="rotate(10 49 50)"/>`,
  // Inti Raymi: el sol
  intiraymi: `<g stroke="#ffb520" stroke-width="4" stroke-linecap="round">${Array.from({ length: 12 }, (_, i) => {
    const a = (i * Math.PI) / 6;
    return `<path d="M${(30 + Math.cos(a) * 17).toFixed(1)} ${(30 + Math.sin(a) * 17).toFixed(1)}L${(30 + Math.cos(a) * 26).toFixed(1)} ${(30 + Math.sin(a) * 26).toFixed(1)}"/>`;
  }).join('')}</g>
    <circle cx="30" cy="30" r="14" fill="#ffd23f"/>
    <path d="M24 28q2-2 4 0M32 28q2-2 4 0M24 35q6 5 12 0" stroke="#c9650a" stroke-width="2" fill="none" stroke-linecap="round"/>`,
  // Día de Muertos: flor de cempasúchil
  muertos: `${Array.from({ length: 10 }, (_, i) => {
    const a = (i * Math.PI) / 5;
    return `<circle cx="${(30 + Math.cos(a) * 12).toFixed(1)}" cy="${(28 + Math.sin(a) * 12).toFixed(1)}" r="9" fill="${i % 2 ? '#ff8a00' : '#ffa630'}"/>`;
  }).join('')}
    <circle cx="30" cy="28" r="9" fill="#ff6a00"/><circle cx="30" cy="28" r="4" fill="#c94f00"/>
    <path d="M30 40v16" stroke="#2a9d63" stroke-width="3"/><path d="M30 50q-8-2-10-8q8 0 10 8" fill="#2a9d63"/>`,
  // Feria de las Flores: silleta con flores
  flores: `<rect x="12" y="34" width="36" height="20" rx="3" fill="#96502a"/>
    <path d="M14 40h32M14 47h32" stroke="#6b3f1f" stroke-width="2"/>
    ${[[18, 26, '#ff5d8f'], [30, 22, '#ffd23f'], [42, 26, '#ff7b00'], [24, 32, '#ffd23f'], [36, 32, '#ff5d8f'], [30, 30, '#ffffff']].map(([x, y, c]) => `<circle cx="${x}" cy="${y}" r="7" fill="${c}"/><circle cx="${x}" cy="${y}" r="2.5" fill="#c9650a"/>`).join('')}`,
  // Día de la Tradición: guitarra criolla
  tradicion: `<path d="M38 8l6 6-16 16-6-6z" fill="#6b3f1f"/>
    <circle cx="22" cy="40" r="12" fill="#c8893f"/><circle cx="31" cy="31" r="8" fill="#c8893f"/>
    <circle cx="25" cy="37" r="4" fill="#3a2a22"/>
    <path d="M44 12L18 42" stroke="#f3ead2" stroke-width="1"/>
    <rect x="40" y="6" width="8" height="5" rx="1" fill="#3a2a22" transform="rotate(45 44 8)"/>`,
  // Festa Junina: bandeirinhas y fogueira
  junina: `<path d="M4 10q26 10 52 0" stroke="#3a2a22" stroke-width="1.5" fill="none"/>
    ${[[8, '#e63946'], [18, '#ffbe0b'], [28, '#3a86ff'], [38, '#2a9d8f'], [48, '#ff70a6']].map(([x, c], i) => `<path d="M${x} ${12 + (i === 2 ? 3 : i % 2 ? 2 : 0)}h8l-4 7z" fill="${c}"/>`).join('')}
    <path d="M18 54l12-8 12 8z" fill="#6b3f1f"/>
    <path d="M30 26c6 8 10 12 10 18a10 10 0 0 1-20 0c0-6 4-10 10-18z" fill="#ff7b00"/>
    <path d="M30 36c3 4 5 6 5 9a5 5 0 0 1-10 0c0-3 2-5 5-9z" fill="#ffd23f"/>`,
  // Thanksgiving: calabaza
  thanksgiving: `<ellipse cx="22" cy="36" rx="12" ry="15" fill="#e07a1f"/>
    <ellipse cx="38" cy="36" rx="12" ry="15" fill="#e07a1f"/>
    <ellipse cx="30" cy="36" rx="12" ry="16" fill="#f29130"/>
    <path d="M30 21q1-8 6-10" stroke="#3d6b4f" stroke-width="4" fill="none" stroke-linecap="round"/>
    <path d="M34 16q8-4 12 2q-8 2-12-2" fill="#3d6b4f"/>`,
};

export function dibujoFiesta(id) {
  return `<svg viewBox="0 0 60 60" aria-hidden="true">${DIBUJOS[id] || DIBUJOS.intiraymi}</svg>`;
}
