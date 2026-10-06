import fs from 'fs';

let code = fs.readFileSync('src/scenes/GameScene.js', 'utf8');

// Replace createLighting
code = code.replace(
  /createLighting\(\) \{[\s\S]*?\}\n/m,
  "createLighting() {\n    // Soft vignette instead of dark room\n    this.ambientLight = this.add.rectangle(0, 0, 3000, 3000, 0x4a3b32, 0.05).setOrigin(0);\n    this.ambientLight.setBlendMode(Phaser.BlendModes.MULTIPLY);\n    this.layerEffects.add(this.ambientLight);\n  }\n"
);

// Replace createHUD
const hudCode = `createHUD() {
    const width = this.cameras.main.width;
    
    // Top HUD styling
    const panel = this.add.nineslice(width / 2, 40, 'ui_panel', 0, 800, 70, 24, 24, 24, 24);
    this.layerUI.add(panel);

    const style = { font: '700 20px Nunito', fill: '#4a3b32' };
    this.moneyText = this.add.text(width / 2 - 300, 40, \`💰 \${this.formatMoney(this.economy.money)}\`, { font: '800 22px Nunito', fill: '#c25953' }).setOrigin(0, 0.5);
    this.dayText = this.add.text(width / 2 - 50, 40, \`📅 Ngày \${this.day}\`, style).setOrigin(0.5);
    this.timeText = this.add.text(width / 2 + 120, 40, \`🕐 08:00\`, style).setOrigin(0.5);
    this.repText = this.add.text(width / 2 + 280, 40, \`⭐ \${this.reputation.toFixed(1)}\`, { font: '800 22px Nunito', fill: '#e88d72' }).setOrigin(0, 0.5);
    
    this.layerUI.add([this.moneyText, this.dayText, this.timeText, this.repText]);
  }
`;
code = code.replace(/createHUD\(\) \{[\s\S]*?\n  \}\n/m, hudCode);

// Replace createBottomUI
const bottomUICode = `createBottomUI() {
    const height = this.cameras.main.height;
    const width = this.cameras.main.width;

    const panel = this.add.nineslice(width / 2, height - 50, 'ui_panel', 0, 600, 80, 24, 24, 24, 24);
    this.layerUI.add(panel);
    
    const createBtn = (xOffset, text, callback) => {
        const btn = this.add.image(width / 2 + xOffset, height - 50, 'btn_normal').setInteractive({ useHandCursor: true });
        const txt = this.add.text(width / 2 + xOffset, height - 50, text, { font: '800 16px Nunito', fill: '#ffffff' }).setOrigin(0.5);
        
        btn.on('pointerover', () => { 
            btn.setTexture('btn_hover'); 
            this.tweens.add({targets: btn, scale: 1.05, duration: 100}); 
            this.tweens.add({targets: txt, scale: 1.05, duration: 100}); 
        });
        btn.on('pointerout', () => { 
            btn.setTexture('btn_normal'); 
            this.tweens.add({targets: btn, scale: 1, duration: 100}); 
            this.tweens.add({targets: txt, scale: 1, duration: 100}); 
        });
        btn.on('pointerdown', () => {
            this.tweens.add({targets: [btn, txt], scale: 0.95, duration: 50, yoyo: true, onComplete: callback});
        });
        this.layerUI.add([btn, txt]);
    };

    createBtn(0, '🌙 KẾT THÚC NGÀY', () => this.daySystem.endDay());
  }
`;
code = code.replace(/createBottomUI\(\) \{[\s\S]*?\n  \}\n/m, bottomUICode);

fs.writeFileSync('src/scenes/GameScene.js', code);
