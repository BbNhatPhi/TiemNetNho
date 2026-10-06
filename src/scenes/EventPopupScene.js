import Phaser from 'phaser';

export default class EventPopupScene extends Phaser.Scene {
  constructor() {
    super('EventPopup');
  }

  init(data) {
    this.event = data.event;
    this.gameScene = data.gameScene;
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    const overlay = this.add.rectangle(0, 0, width, height, 0x4a3b32, 0).setOrigin(0);
    this.tweens.add({ targets: overlay, fillAlpha: 0.6, duration: 200 });

    const modalWidth = 600;
    const modalHeight = 420;
    const modalX = width / 2 - modalWidth / 2;
    const modalY = height / 2 - modalHeight / 2;

    this.modal = this.add.container(modalX, modalY - 50);
    this.modal.alpha = 0;
    this.tweens.add({ targets: this.modal, y: modalY, alpha: 1, duration: 300, ease: 'Back.easeOut' });

    // BG
    const bg = this.add.nineslice(0, 0, 'ui_panel', 0, modalWidth, modalHeight, 32, 32, 32, 32).setOrigin(0).setInteractive();

    const eventName = this.event?.name || 'Sự kiện';
    const eventDesc = this.event?.description || '';

    const title = this.add.text(modalWidth / 2, 40, `⚠️ ${eventName}`, {
      font: '900 28px Nunito', fill: '#c25953'
    }).setOrigin(0.5);

    const desc = this.add.text(modalWidth / 2, 120, eventDesc, {
      font: '20px Nunito', fill: '#4a3b32', align: 'center',
      wordWrap: { width: modalWidth - 40 }
    }).setOrigin(0.5);

    this.modal.add([bg, title, desc]);

    const btnWidth = 450;
    const btnHeight = 55;
    let startY = 200;

    const choices = this.event?.choices || [];

    choices.forEach((choice, index) => {
      const btnY = startY + (index * (btnHeight + 12));

      const btnBg = this.add.rectangle(modalWidth / 2, btnY + btnHeight / 2, btnWidth, btnHeight, 0xfff8f2, 1).setInteractive({ useHandCursor: true });
      btnBg.setStrokeStyle(2.5, 0x4a3b32);

      const text = this.add.text(modalWidth / 2, btnY + btnHeight / 2, choice.text, {
        font: '800 16px Nunito', fill: '#4a3b32'
      }).setOrigin(0.5);

      btnBg.on('pointerover', () => {
        btnBg.setFillStyle(0xeaddd0);
      });
      btnBg.on('pointerout', () => {
        btnBg.setFillStyle(0xfff8f2);
      });

      btnBg.on('pointerdown', () => {
        let canAfford = true;
        if (choice.cost > 0) {
          canAfford = this.gameScene.economy.spendMoney(choice.cost);
        }

        if (canAfford) {
          try {
            if (choice.effect) choice.effect(this.gameScene);
          } catch (err) {
            console.error('Event effect error:', err);
          }

          // Clamp reputation
          if (typeof this.gameScene.reputation === 'number') {
            this.gameScene.reputation = Phaser.Math.Clamp(this.gameScene.reputation, 0, 5);
          }

          if (this.gameScene.updateHUD) this.gameScene.updateHUD();

          this.tweens.add({
            targets: [this.modal, overlay], alpha: 0, duration: 200,
            onComplete: () => {
              this.scene.stop();
              this.gameScene.scene.resume();
            }
          });
        } else {
          text.setText('⚠️ Không đủ tiền!');
          text.setColor('#c25953');
          this.time.delayedCall(1200, () => {
            text.setText(choice.text);
            text.setColor('#4a3b32');
          });
        }
      });

      this.modal.add([btnBg, text]);
    });
  }

  formatMoney(amount) {
    if (typeof amount !== 'number' || isNaN(amount)) return '0đ';
    return Math.round(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + 'đ';
  }
}
