const fs = require('fs');
const path = 'src/scenes/KitchenScene.js';
let content = fs.readFileSync(path, 'utf8');

// Replace createFriedEggItem
content = content.replace(/createFriedEggItem\(x, y, scale = 1\) \{[\s\S]*?return container;\s*\}/, `createFriedEggItem(x, y, scale = 1) {
    const container = this.add.container(x, y);
    const g = this.add.graphics();

    // 1. Crispy caramelized fried edge (Viền xém giòn)
    g.fillStyle(0x8d4915, 0.6);
    g.fillEllipse(0, 3 * scale, 64 * scale, 48 * scale);
    g.fillStyle(0xc87d1e, 0.88);
    g.fillEllipse(0, 1 * scale, 60 * scale, 44 * scale);

    // 2. Cooked egg white
    g.fillStyle(0xffffff, 1.0);
    g.fillEllipse(0, -1 * scale, 56 * scale, 40 * scale);
    g.fillEllipse(-12 * scale, 6 * scale, 24 * scale, 18 * scale);
    g.fillEllipse(14 * scale, -4 * scale, 26 * scale, 16 * scale);

    // 3. Sunny-side up plump egg yolk
    g.fillStyle(0xd35400, 0.95);
    g.fillEllipse(-4 * scale, 1 * scale, 24 * scale, 20 * scale);
    g.fillStyle(0xf39c12, 1.0);
    g.fillEllipse(-4 * scale, -1 * scale, 22 * scale, 18 * scale);
    g.fillStyle(0xf1c40f, 1.0);
    g.fillEllipse(-4 * scale, -2 * scale, 18 * scale, 14 * scale);
    
    // Highlight
    g.fillStyle(0xffffff, 0.8);
    g.fillEllipse(-8 * scale, -5 * scale, 6 * scale, 3 * scale);

    container.add(g);
    return container;
  }`);

// Replace createNoodleItem
content = content.replace(/createNoodleItem\(x, y, scale = 1\) \{[\s\S]*?return container;\s*\}/, `createNoodleItem(x, y, scale = 1) {
    const container = this.add.container(x, y);
    const w = 70 * scale;
    const h = 56 * scale;
    const g = this.add.graphics();

    // Base square block (Vắt mì vuông)
    g.fillStyle(0xd68910, 0.95);
    g.fillRoundedRect(-w/2, -h/2 + 2 * scale, w, h, 6 * scale);
    g.fillStyle(0xf5b041, 1.0);
    g.fillRoundedRect(-w/2, -h/2, w, h, 6 * scale);

    // Draw grid of wavy lines
    g.lineStyle(2 * scale, 0xb9770e, 0.7);
    for (let iy = -h/2 + 6 * scale; iy < h/2 - 4 * scale; iy += 6 * scale) {
        g.beginPath();
        g.moveTo(-w/2 + 4 * scale, iy);
        for (let ix = -w/2 + 4 * scale; ix <= w/2 - 4 * scale; ix += 6 * scale) {
            g.lineTo(ix, iy + ((ix + iy) % 12 === 0 ? 3 * scale : -3 * scale));
        }
        g.strokePath();
    }
    
    g.lineStyle(2 * scale, 0xf7dc6f, 0.8);
    for (let ix = -w/2 + 6 * scale; ix < w/2 - 4 * scale; ix += 6 * scale) {
        g.beginPath();
        g.moveTo(ix, -h/2 + 4 * scale);
        for (let iy = -h/2 + 4 * scale; iy <= h/2 - 4 * scale; iy += 6 * scale) {
            g.lineTo(ix + ((ix + iy) % 12 === 0 ? 3 * scale : -3 * scale), iy);
        }
        g.strokePath();
    }

    container.add(g);
    return container;
  }`);

// Replace createLadleItem
content = content.replace(/createLadleItem\(x, y, scale = 1\) \{[\s\S]*?return container;\s*\}/, `createLadleItem(x, y, scale = 1) {
    const container = this.add.container(x, y);
    const g = this.add.graphics();

    // Splash of golden broth (Giọt nước dùng vàng óng)
    g.fillStyle(0xd35400, 0.8);
    g.fillCircle(0, 6 * scale, 24 * scale);
    g.fillStyle(0xf39c12, 1.0);
    g.fillCircle(0, 4 * scale, 22 * scale);
    
    // Top peak of the drop
    g.beginPath();
    g.moveTo(-20 * scale, 2 * scale);
    g.lineTo(0, -32 * scale);
    g.lineTo(20 * scale, 2 * scale);
    g.fillPath();

    // Core highlight
    g.fillStyle(0xffffff, 0.5);
    g.fillEllipse(-8 * scale, 4 * scale, 6 * scale, 14 * scale);

    container.add(g);
    return container;
  }`);

fs.writeFileSync(path, content, 'utf8');
console.log('Done!');
