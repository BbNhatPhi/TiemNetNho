const fs = require('fs');
let c = fs.readFileSync('src/scenes/GameScene.js', 'utf8');
const replacement = '    const settingsBtn = this.add.text(width / 2 + 370, 40, \'⚙️\', { font: \'900 26px Nunito\', fill: \'#5599ff\' }).setOrigin(0.5)\n' +
'      .setInteractive({ useHandCursor: true });\n' +
'    \n' +
'    settingsBtn.on(\'pointerdown\', () => {\n' +
'        this.showSettingsMenu();\n' +
'    });\n' +
'\n' +
'    this.layerUI.add([this.moneyText, this.dayText, this.timeText, this.repText, settingsBtn]);\n' +
'  }\n' +
'\n' +
'  showSettingsMenu() {\n' +
'    const width = this.cameras.main.width;\n' +
'    const height = this.cameras.main.height;\n' +
'    \n' +
'    const bg = this.add.graphics();\n' +
'    bg.fillStyle(0x000000, 0.6);\n' +
'    bg.fillRect(0, 0, width, height);\n' +
'    bg.setInteractive(new Phaser.Geom.Rectangle(0, 0, width, height), Phaser.Geom.Rectangle.Contains);\n' +
'    \n' +
'    const panel = this.add.nineslice(width/2, height/2, \'ui_panel\', 0, 300, 350, 24, 24, 24, 24);\n' +
'    \n' +
'    const title = this.add.text(width/2, height/2 - 120, \'Tùy chọn\', { font: \'900 28px Nunito\', fill: \'#c25953\' }).setOrigin(0.5);\n' +
'    \n' +
'    const elements = [bg, panel, title];\n' +
'    \n' +
'    const createMenuBtn = (y, text, callback) => {\n' +
'        const btn = this.add.image(width/2, y, \'btn_normal\').setInteractive({ useHandCursor: true });\n' +
'        const txt = this.add.text(width/2, y, text, { font: \'800 20px Nunito\', fill: \'#ffffff\' }).setOrigin(0.5);\n' +
'        \n' +
'        btn.on(\'pointerdown\', () => {\n' +
'            this.tweens.add({\n' +
'                targets: [btn, txt], scale: 0.9, duration: 50, yoyo: true, onComplete: () => {\n' +
'                    elements.forEach(e => e.destroy());\n' +
'                    callback();\n' +
'                }\n' +
'            });\n' +
'        });\n' +
'        \n' +
'        elements.push(btn, txt);\n' +
'    };\n' +
'    \n' +
'    createMenuBtn(height/2 - 40, \'☁️ Đồng bộ Cloud\', () => {\n' +
'        import(\'../ui/SyncUI\').then(({ syncUI }) => {\n' +
'            syncUI.show();\n' +
'            syncUI.setOnCloudSaveLoaded(() => {\n' +
'                window.location.reload();\n' +
'            });\n' +
'        });\n' +
'    });\n' +
'    \n' +
'    createMenuBtn(height/2 + 40, \'🚪 Thoát ra Menu\', () => {\n' +
'        this.saveGame();\n' +
'        this.cameras.main.fadeOut(500, 250, 246, 240);\n' +
'        this.cameras.main.once(\'camerafadeoutcomplete\', () => {\n' +
'            this.scene.start(\'Menu\');\n' +
'        });\n' +
'    });\n' +
'    \n' +
'    createMenuBtn(height/2 + 120, \'❌ Đóng\', () => {});\n' +
'    \n' +
'    this.layerUI.add(elements);\n' +
'  }\n';

const match = c.match(/    const cloudBtn = this\.add\.text[\s\S]+?this\.layerUI\.add\(\[this\.moneyText, this\.dayText, this\.timeText, this\.repText, cloudBtn\]\);\n  \}/);
if (match) {
    c = c.replace(match[0], replacement);
    fs.writeFileSync('src/scenes/GameScene.js', c);
    console.log('Success');
} else {
    console.log('Match failed');
}
