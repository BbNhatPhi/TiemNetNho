import Phaser from 'phaser';

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super('Menu');
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Background ambiance (Warm Cream)
    this.cameras.main.setBackgroundColor('#faf6f0');

    // Add cute atmospheric background elements (floating items)
    this.decorGroup = this.add.group();
    const decors = ['pc_1', 'desk', 'poster', 'plant', 'char_player']; 
    // Wait, char_player isn't loaded, let's just use what's loaded.
    const items = ['desk', 'poster', 'plant', 'floor'];
    for (let i = 0; i < 15; i++) {
        const x = Phaser.Math.Between(100, width - 100);
        const y = Phaser.Math.Between(100, height - 100);
        const texture = items[Phaser.Math.Between(0, items.length - 1)];
        const item = this.add.image(x, y, texture).setAlpha(0.15).setScale(Phaser.Math.FloatBetween(0.5, 1.2));
        item.rotation = Phaser.Math.FloatBetween(0, Math.PI * 2);
        
        this.tweens.add({
            targets: item,
            y: y - Phaser.Math.Between(20, 50),
            rotation: item.rotation + Phaser.Math.FloatBetween(-0.2, 0.2),
            duration: Phaser.Math.Between(3000, 6000),
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    // Main Illustration / Centerpiece
    const centerContainer = this.add.container(width / 2, height / 2 - 140);
    
    // Draw a cute background shape for the logo
    const bgShape = this.add.graphics();
    bgShape.fillStyle(0xfff8f2, 1);
    bgShape.fillRoundedRect(-250, -150, 500, 300, 40);
    bgShape.lineStyle(4, 0x4a3b32, 1);
    bgShape.strokeRoundedRect(-250, -150, 500, 300, 40);
    
    // Add cute elements inside the shape
    const centerPc = this.add.image(0, 50, 'pc_3').setScale(1.5);
    const centerPlant = this.add.image(150, 80, 'plant').setScale(1.2);
    const centerPoster = this.add.image(-150, -20, 'poster').setScale(1.5);
    
    centerContainer.add([bgShape, centerPoster, centerPlant, centerPc]);
    
    // Slight float animation for the center container
    this.tweens.add({
        targets: centerContainer,
        y: height / 2 - 150,
        duration: 3000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
    });

    // Title
    const title = this.add.text(width / 2, height / 2 - 250, 'TIỆM NET NHỎ', {
      font: '900 64px Nunito',
      fill: '#c25953', // Warm brick red
      stroke: '#4a3b32', // Dark outline
      strokeThickness: 8
    }).setOrigin(0.5);

    const subTitle = this.add.text(width / 2, height / 2 + 50, 'Từ 2 bộ PC cũ đến ông chủ gaming center', {
      font: '700 24px Nunito',
      fill: '#4a3b32'
    }).setOrigin(0.5);

    // UI Panel for buttons
    // The panel texture is 'ui_panel'. Make it 400x180 to fit the buttons.
    // However, nineslice usage might be tricky if not loaded.
    // Instead of nineslice which might be missing, let's just use graphics or simply buttons if no panel is needed.
    // Actually, nineslice takes x, y, texture, frame, width, height, left, right, top, bottom.
    // We'll place it at y = height / 2 + 180
    const panelY = height / 2 + 180;
    
    const createBtn = (yOffset, text, callback) => {
        const btn = this.add.image(width / 2, panelY + yOffset, 'btn_normal').setInteractive({ useHandCursor: true });
        // Since button image 'btn_normal' might not be large enough for long text, let's scale the text down or wrap it if needed.
        const txt = this.add.text(width / 2, panelY + yOffset, text, { font: '800 20px Nunito', fill: '#ffffff' }).setOrigin(0.5);
        
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
    };

    createBtn(-40, '🎮 BẮT ĐẦU CHƠI', () => {
        this.cameras.main.fadeOut(500, 250, 246, 240); // Fade out to warm cream
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start('Game');
        });
    });

    // Validate save has actual game data (not just achievements)
    const rawSave = (() => { try { return JSON.parse(localStorage.getItem('tiemnetnho_save')); } catch(e){ return null; } })();
    const hasSave = rawSave && typeof rawSave.money === 'number' && typeof rawSave.day === 'number';
    if (hasSave) {
        createBtn(40, '▶ TIẾP TỤC', () => {
            this.cameras.main.fadeOut(500, 250, 246, 240);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start('Game', { loadSave: true });
            });
        });
    } else {
        const btn = this.add.image(width / 2, panelY + 40, 'btn_normal').setTint(0x887e77).setAlpha(0.6);
        this.add.text(width / 2, panelY + 40, '▶ TIẾP TỤC (Chưa có save)', { font: '800 17px Nunito', fill: '#ffffff' }).setOrigin(0.5).setAlpha(0.7);
    }
  }
}

