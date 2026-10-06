import fs from 'fs';
import path from 'path';

const ASSETS_DIR = path.join(process.cwd(), 'public', 'assets');
['characters', 'computers', 'furniture', 'environment', 'ui', 'effects', 'decorations', 'food', 'drinks', 'icons'].forEach(d => {
  fs.mkdirSync(path.join(ASSETS_DIR, d), { recursive: true });
});

// Helper for SVGs
function saveSVG(folder, name, width, height, content) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
    ${content}
  </svg>`;
  fs.writeFileSync(path.join(ASSETS_DIR, folder, `${name}.svg`), svg);
}

// Color Palette
const C = {
  bg: '#faf6f0',
  pri: '#c25953',
  pri_d: '#96443f',
  sec: '#e88d72',
  sec_d: '#b86d56',
  acc: '#85a98f',
  acc_d: '#64826b',
  hl: '#f4cd76',
  hl_d: '#c4a25b',
  dark: '#4a3b32',
  wood: '#e6d5c3',
  wood_d: '#c9b7a3',
  white: '#ffffff',
  offwhite: '#fff8f2',
  pc_gray: '#d5d8dc',
  pc_gray_d: '#abb2b9',
  scr: '#34495e',
  scr_gl: '#aed6f1'
};

const STROKE = `stroke="${C.dark}" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"`;

// --- UI ASSETS ---

// UI Panel (Cute, Rounded, Thick Border)
saveSVG('ui', 'panel', 128, 128, `
  <rect x="4" y="8" width="120" height="116" rx="24" fill="${C.wood_d}" />
  <rect x="4" y="4" width="120" height="116" rx="24" fill="${C.offwhite}" ${STROKE} />
  <!-- Inner subtle border -->
  <rect x="12" y="12" width="104" height="100" rx="16" fill="none" stroke="${C.wood}" stroke-width="4" />
`);

// Button Normal (Cute red/coral)
saveSVG('ui', 'btn_normal', 240, 56, `
  <rect x="4" y="8" width="232" height="44" rx="22" fill="${C.pri_d}" />
  <rect x="4" y="4" width="232" height="44" rx="22" fill="${C.pri}" ${STROKE} />
  <!-- Highlight -->
  <path d="M 20 12 L 220 12" stroke="${C.white}" stroke-width="4" stroke-linecap="round" opacity="0.4" />
`);

// Button Hover (Slightly lighter)
saveSVG('ui', 'btn_hover', 240, 56, `
  <rect x="4" y="8" width="232" height="44" rx="22" fill="${C.pri_d}" />
  <rect x="4" y="4" width="232" height="44" rx="22" fill="${C.sec}" ${STROKE} />
  <!-- Highlight -->
  <path d="M 20 12 L 220 12" stroke="${C.white}" stroke-width="4" stroke-linecap="round" opacity="0.4" />
`);

// --- ENVIRONMENT ---

// Floor (Cute wood planks)
saveSVG('environment', 'floor', 128, 128, `
  <rect width="128" height="128" fill="${C.wood}" />
  <path d="M 0 32 L 128 32 M 0 64 L 128 64 M 0 96 L 128 96" stroke="${C.wood_d}" stroke-width="3" opacity="0.5"/>
  <path d="M 40 0 L 40 32 M 90 32 L 90 64 M 20 64 L 20 96 M 70 96 L 70 128" stroke="${C.wood_d}" stroke-width="3" opacity="0.5"/>
`);

// Wall (Cream wall with soft baseboard)
saveSVG('environment', 'wall', 128, 128, `
  <rect width="128" height="128" fill="${C.bg}" />
  <rect x="0" y="96" width="128" height="32" fill="${C.wood}" />
  <path d="M 0 96 L 128 96" stroke="${C.wood_d}" stroke-width="4"/>
  <!-- Cute wall strip -->
  <rect x="0" y="40" width="128" height="8" fill="${C.acc}" />
`);

// --- FURNITURE ---

// Desk (Rounded cozy desk)
saveSVG('furniture', 'desk', 120, 80, `
  <rect x="4" y="16" width="112" height="60" rx="8" fill="${C.wood_d}" />
  <rect x="4" y="4" width="112" height="60" rx="8" fill="${C.wood}" ${STROKE} />
`);

// Cashier Desk
saveSVG('furniture', 'cashier', 160, 80, `
  <rect x="4" y="16" width="152" height="60" rx="12" fill="${C.acc_d}" />
  <rect x="4" y="4" width="152" height="60" rx="12" fill="${C.acc}" ${STROKE} />
  <!-- Cash register -->
  <rect x="60" y="-10" width="40" height="30" rx="4" fill="${C.pc_gray}" ${STROKE} />
  <rect x="66" y="-4" width="28" height="16" rx="2" fill="${C.scr}" />
`);

// Kitchen Desk
saveSVG('furniture', 'kitchen', 160, 80, `
  <rect x="4" y="16" width="152" height="60" rx="12" fill="${C.pri_d}" />
  <rect x="4" y="4" width="152" height="60" rx="12" fill="${C.pri}" ${STROKE} />
  <!-- Noodle cups -->
  <rect x="20" y="0" width="20" height="24" rx="4" fill="${C.hl}" ${STROKE} />
  <rect x="50" y="0" width="20" height="24" rx="4" fill="${C.hl}" ${STROKE} />
`);

// --- COMPUTERS ---
// We will generate LV1 to LV4 and VIP with cute details

saveSVG('computers', 'pc_lv1', 80, 80, `
  <!-- Monitor Base -->
  <path d="M 30 60 L 50 60 L 45 40 L 35 40 Z" fill="${C.pc_gray}" ${STROKE} />
  <!-- Monitor -->
  <rect x="10" y="10" width="60" height="40" rx="4" fill="${C.white}" ${STROKE} />
  <rect x="14" y="14" width="52" height="32" rx="2" fill="${C.scr}" />
  <!-- Keyboard -->
  <rect x="15" y="65" width="40" height="12" rx="2" fill="${C.pc_gray}" ${STROKE} />
  <!-- Mouse -->
  <rect x="60" y="65" width="8" height="12" rx="4" fill="${C.pc_gray}" ${STROKE} />
`);

saveSVG('computers', 'pc_lv2', 80, 80, `
  <!-- Monitor Base -->
  <path d="M 30 60 L 50 60 L 45 40 L 35 40 Z" fill="${C.dark}" ${STROKE} />
  <!-- Monitor -->
  <rect x="8" y="8" width="64" height="42" rx="4" fill="${C.dark}" ${STROKE} />
  <rect x="12" y="12" width="56" height="34" rx="2" fill="${C.scr}" />
  <!-- PC Case -->
  <rect x="68" y="20" width="10" height="30" rx="2" fill="${C.dark}" ${STROKE} />
  <!-- Keyboard -->
  <rect x="15" y="65" width="40" height="12" rx="2" fill="${C.dark}" ${STROKE} />
  <rect x="60" y="65" width="8" height="12" rx="4" fill="${C.dark}" ${STROKE} />
`);

// Add cute RGB touches to higher levels
saveSVG('computers', 'pc_lv3', 80, 80, `
  <path d="M 30 60 L 50 60 L 45 40 L 35 40 Z" fill="${C.dark}" ${STROKE} />
  <rect x="6" y="6" width="68" height="44" rx="4" fill="${C.dark}" stroke="${C.pri}" stroke-width="4" />
  <rect x="10" y="10" width="60" height="36" rx="2" fill="${C.scr}" />
  <rect x="70" y="15" width="10" height="35" rx="2" fill="${C.dark}" ${STROKE} />
  <rect x="72" y="20" width="6" height="25" rx="2" fill="${C.sec}" />
  <rect x="15" y="65" width="40" height="12" rx="2" fill="${C.dark}" ${STROKE} />
  <rect x="60" y="65" width="8" height="12" rx="4" fill="${C.dark}" ${STROKE} />
`);

// --- CHARACTERS ---
// Cute chibi characters. Round head, simple body.

function genChar(headColor, bodyColor, hasGlasses) {
  let glasses = hasGlasses ? `<rect x="16" y="24" width="12" height="8" rx="2" fill="none" ${STROKE}/> <rect x="36" y="24" width="12" height="8" rx="2" fill="none" ${STROKE}/>` : '';
  return `
    <!-- shadow -->
    <ellipse cx="32" cy="60" rx="16" ry="6" fill="${C.dark}" opacity="0.2" />
    <!-- body -->
    <rect x="20" y="36" width="24" height="24" rx="8" fill="${bodyColor}" ${STROKE} />
    <!-- head -->
    <circle cx="32" cy="24" r="16" fill="${headColor}" ${STROKE} />
    <!-- face -->
    <circle cx="24" cy="24" r="2" fill="${C.dark}" />
    <circle cx="40" cy="24" r="2" fill="${C.dark}" />
    <!-- hair/acc -->
    ${glasses}
  `;
}

saveSVG('characters', 'default', 64, 64, genChar(C.white, C.sec, false));
saveSVG('characters', 'player', 64, 64, genChar(C.offwhite, C.acc, false) + `
  <!-- Player cap -->
  <path d="M 12 16 Q 32 0 52 16 Z" fill="${C.pri}" ${STROKE} />
`);
saveSVG('characters', 'student', 64, 64, genChar(C.offwhite, C.white, true));
saveSVG('characters', 'gamer', 64, 64, genChar(C.offwhite, C.dark, false) + `
  <!-- Headset -->
  <path d="M 12 24 A 20 20 0 0 1 52 24" fill="none" ${STROKE} />
  <rect x="8" y="20" width="8" height="12" rx="4" fill="${C.pri}" ${STROKE} />
  <rect x="48" y="20" width="8" height="12" rx="4" fill="${C.pri}" ${STROKE} />
`);

// --- ICONS & DECOR ---
saveSVG('decorations', 'poster', 40, 60, `
  <rect x="4" y="4" width="32" height="52" rx="4" fill="${C.offwhite}" ${STROKE} />
  <rect x="8" y="8" width="24" height="32" rx="2" fill="${C.pri}" />
  <circle cx="20" cy="24" r="8" fill="${C.hl}" />
`);

saveSVG('decorations', 'plant', 48, 64, `
  <path d="M 24 40 Q 4 20 16 4 Q 32 16 24 40" fill="${C.acc}" ${STROKE} />
  <path d="M 24 40 Q 44 20 32 4 Q 16 16 24 40" fill="${C.acc_d}" ${STROKE} />
  <rect x="16" y="40" width="16" height="20" rx="4" fill="${C.pri}" ${STROKE} />
`);

saveSVG('decorations', 'router', 40, 24, `
  <rect x="4" y="8" width="32" height="12" rx="4" fill="${C.offwhite}" ${STROKE} />
  <!-- Antennas -->
  <line x1="10" y1="8" x2="6" y2="2" ${STROKE} />
  <line x1="30" y1="8" x2="34" y2="2" ${STROKE} />
`);

saveSVG('decorations', 'door_mat', 120, 60, `
  <rect x="4" y="4" width="112" height="52" rx="12" fill="${C.pri_d}" />
  <rect x="4" y="4" width="112" height="48" rx="12" fill="${C.pri}" ${STROKE} />
  <text x="60" y="32" font-family="sans-serif" font-weight="bold" font-size="16" fill="${C.white}" text-anchor="middle">WELCOME</text>
`);

console.log("Cute Co-zy High-Res Vector Assets generated!");
