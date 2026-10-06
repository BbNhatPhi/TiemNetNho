
# -*- coding: utf-8 -*-
import re

with open('src/scenes/GameScene.js', 'r', encoding='utf-8') as f:
    c = f.read()

hud_func = r'''  createHUD() {
    const width = this.cameras.main.width;
    const panel = this.add.nineslice(width / 2, 40, 'ui_panel', 0, 800, 70, 24, 24, 24, 24);
    this.layerUI.add(panel);

    const style = { font: '700 20px Nunito', fill: '#4a3b32' };
    this.moneyText = this.add.text(width / 2 - 300, 40, \💰 \\, { font: '800 22px Nunito', fill: '#c25953' }).setOrigin(0, 0.5);
    this.dayText = this.add.text(width / 2 - 50, 40, \📅 Ngày \\, style).setOrigin(0.5);
    this.timeText = this.add.text(width / 2 + 120, 40, \⏰ 08:00\, style).setOrigin(0.5);
    this.repText = this.add.text(width / 2 + 280, 40, \⭐ \\, { font: '800 22px Nunito', fill: '#e88d72' }).setOrigin(0, 0.5);
    
    const settingsBtn = this.add.text(width / 2 + 370, 40, '⚙️', { font: '900 26px Nunito', fill: '#5599ff' }).setOrigin(0.5)
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
  }'''

# Replace createHUD
c = re.sub(r'  createHUD\(\) \{.*?(?=  createBottomUI\(\) \{)', hud_func + '\n\n', c, flags=re.DOTALL)

with open('src/scenes/GameScene.js', 'w', encoding='utf-8') as f:
    f.write(c)

