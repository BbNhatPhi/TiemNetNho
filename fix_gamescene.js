const fs = require('fs');
let c = fs.readFileSync('src/scenes/GameScene.js', 'utf8');

c = c.replace(/const cloudBtn = this\.add\.text[\s\S]+?this\.layerUI\.add\(\[this\.moneyText, this\.dayText, this\.timeText, this\.repText, cloudBtn\]\);\n  \}/, \const settingsBtn = this.add.text(width / 2 + 370, 40, '⚙️', { font: '900 26px Nunito', fill: '#5599ff' }).setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    
    settingsBtn.on('pointerdown', () => {
        this.showSettingsMenu();
    });

    this.layerUI.add([this.moneyText, this.dayText, this.timeText, this.repText, settingsBtn]);
  }

  showSettingsMenu() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    const bg = this.add.graphics();
    bg.fillStyle(0x000000, 0.6);
    bg.fillRect(0, 0, width, height);
    bg.setInteractive(new Phaser.Geom.Rectangle(0, 0, width, height), Phaser.Geom.Rectangle.Contains);
    
    const panel = this.add.nineslice(width/2, height/2, 'ui_panel', 0, 300, 350, 24, 24, 24, 24);
    
    const title = this.add.text(width/2, height/2 - 120, 'Tùy chọn', { font: '900 28px Nunito', fill: '#c25953' }).setOrigin(0.5);
    
    const elements = [bg, panel, title];
    
    const createMenuBtn = (y, text, callback) => {
        const btn = this.add.image(width/2, y, 'btn_normal').setInteractive({ useHandCursor: true });
        const txt = this.add.text(width/2, y, text, { font: '800 20px Nunito', fill: '#ffffff' }).setOrigin(0.5);
        
        btn.on('pointerdown', () => {
            this.tweens.add({
                targets: [btn, txt], scale: 0.9, duration: 50, yoyo: true, onComplete: () => {
                    elements.forEach(e => e.destroy());
                    callback();
                }
            });
        });
        
        elements.push(btn, txt);
    };
    
    createMenuBtn(height/2 - 40, '☁️ Đồng bộ Cloud', () => {
        import('../ui/SyncUI').then(({ syncUI }) => {
            syncUI.show();
            syncUI.setOnCloudSaveLoaded(() => {
                window.location.reload();
            });
        });
    });
    
    createMenuBtn(height/2 + 40, '🚪 Thoát ra Menu', () => {
        this.saveGame();
        this.cameras.main.fadeOut(500, 250, 246, 240);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start('Menu');
        });
    });
    
    createMenuBtn(height/2 + 120, '❌ Đóng', () => {});
    
    this.layerUI.add(elements);
  }\);
fs.writeFileSync('src/scenes/GameScene.js', c);
