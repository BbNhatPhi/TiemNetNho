const fs = require('fs');
const path = 'src/scenes/KitchenScene.js';
let content = fs.readFileSync(path, 'utf8');

// Replace createBaguetteItem
content = content.replace(/createBaguetteItem\(x, y, scale = 1\) \{[\s\S]*?return container;\s*\}/, `createBaguetteItem(x, y, scale = 1) {
    const container = this.add.container(x, y);
    const w = 70 * scale;
    const h = 30 * scale;
    const g = this.add.graphics();

    // Baguette base
    g.fillStyle(0xc06915, 0.95);
    g.fillRoundedRect(-w/2, -h/2, w, h, 15 * scale);
    g.fillStyle(0xd97e1c, 1.0);
    g.fillRoundedRect(-w/2 + 2*scale, -h/2 + 2*scale, w - 4*scale, h - 4*scale, 13 * scale);

    // Diagonal slash cuts
    g.lineStyle(4 * scale, 0xfcf3cf, 0.9);
    g.beginPath();
    g.moveTo(-15 * scale, -5 * scale);
    g.lineTo(-5 * scale, 5 * scale);
    g.moveTo(5 * scale, -5 * scale);
    g.lineTo(15 * scale, 5 * scale);
    g.strokePath();

    container.add(g);
    return container;
  }`);

// Replace createSausageItem
content = content.replace(/createSausageItem\(x, y, scale = 1\) \{[\s\S]*?return container;\s*\}/, `createSausageItem(x, y, scale = 1) {
    const container = this.add.container(x, y);
    const g = this.add.graphics();
    const w = 50 * scale;
    const h = 20 * scale;

    g.fillStyle(0x801e14, 0.95);
    g.fillRoundedRect(-w/2, -h/2, w, h, 10 * scale);
    g.fillStyle(0xa93226, 1.0);
    g.fillRoundedRect(-w/2 + 2*scale, -h/2 + 2*scale, w - 4*scale, h - 4*scale, 8 * scale);

    // Diagonal cut marks
    g.lineStyle(2 * scale, 0x4a1508, 0.8);
    for (let cx = -15; cx <= 15; cx += 10) {
        g.beginPath();
        g.moveTo((cx - 3) * scale, -5 * scale);
        g.lineTo((cx + 3) * scale, 5 * scale);
        g.strokePath();
    }

    container.add(g);
    return container;
  }`);

// Replace createBeefItem
content = content.replace(/createBeefItem\(x, y, scale = 1\) \{[\s\S]*?return container;\s*\}/, `createBeefItem(x, y, scale = 1) {
    const container = this.add.container(x, y);
    const g = this.add.graphics();
    
    // Slices of beef
    g.fillStyle(0x4a2311, 0.9);
    g.fillRoundedRect(-20 * scale, -10 * scale, 30 * scale, 20 * scale, 5 * scale);
    g.fillStyle(0x78281f, 1.0);
    g.fillRoundedRect(-18 * scale, -8 * scale, 26 * scale, 16 * scale, 4 * scale);

    g.fillStyle(0x4a2311, 0.9);
    g.fillRoundedRect(-5 * scale, -5 * scale, 30 * scale, 20 * scale, 5 * scale);
    g.fillStyle(0x78281f, 1.0);
    g.fillRoundedRect(-3 * scale, -3 * scale, 26 * scale, 16 * scale, 4 * scale);

    // Texture lines (grains)
    g.lineStyle(1 * scale, 0x4a2311, 0.6);
    g.beginPath();
    g.moveTo(-10 * scale, -5 * scale); g.lineTo(-5 * scale, 5 * scale);
    g.moveTo(10 * scale, 0); g.lineTo(15 * scale, 10 * scale);
    g.strokePath();

    container.add(g);
    return container;
  }`);

fs.writeFileSync(path, content, 'utf8');
console.log('Done others!');

