import Phaser from 'phaser';

export default class SummaryScene extends Phaser.Scene {
  constructor() {
    super('Summary');
  }

  init(data) {
    this.day = data.day;
    this.revenue = data.revenue ?? 0;
    this.expenses = data.expenses ?? 0;
    this.profit = data.profit ?? (this.revenue - this.expenses);
    this.reputation = data.reputation ?? 0;
    this.gameScene = data.gameScene;
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.7).setOrigin(0);

    const modalWidth = 620;
    const modalHeight = 500;
    const modalX = width / 2;
    const modalY = height / 2;

    this.modal = this.add.container(modalX, modalY - 30);
    this.modal.alpha = 0;
    this.tweens.add({ targets: this.modal, y: modalY, alpha: 1, duration: 400, ease: 'Back.easeOut' });

    const bg = this.add.nineslice(0, 0, 'ui_panel', 0, modalWidth, modalHeight, 32, 32, 32, 32);

    const title = this.add.text(0, -modalHeight / 2 + 40, `📋 TỔNG KẾT NGÀY ${this.day}`, {
      font: '900 28px Nunito', fill: '#c25953'
    }).setOrigin(0.5);

    const style = { font: 'bold 22px Nunito', fill: '#4a3b32' };
    const labelX = -220;
    const valX = 220;
    let startY = -modalHeight / 2 + 120;

    const revLabel = this.add.text(labelX, startY, '💰 Doanh thu:', style).setOrigin(0, 0.5);
    const revVal = this.add.text(valX, startY, `+ ${this.formatMoney(this.revenue)}`, { font: '900 24px Nunito', fill: '#64c48a' }).setOrigin(1, 0.5);

    startY += 50;
    const expLabel = this.add.text(labelX, startY, '💸 Chi phí:', style).setOrigin(0, 0.5);
    const expVal = this.add.text(valX, startY, `- ${this.formatMoney(this.expenses)}`, { font: '900 24px Nunito', fill: '#c25953' }).setOrigin(1, 0.5);

    startY += 50;
    const line = this.add.rectangle(0, startY, 500, 2, 0x4a3b32, 0.3);

    startY += 50;
    const profLabel = this.add.text(labelX, startY, '📊 Lợi nhuận:', { font: '900 26px Nunito', fill: '#4a3b32' }).setOrigin(0, 0.5);
    const profVal = this.add.text(valX, startY, `${this.profit >= 0 ? '+' : ''} ${this.formatMoney(this.profit)}`, {
      font: '900 28px Nunito', fill: this.profit >= 0 ? '#64c48a' : '#c25953'
    }).setOrigin(1, 0.5);

    startY += 60;
    const repLabel = this.add.text(labelX, startY, '⭐ Uy tín:', style).setOrigin(0, 0.5);
    const repVal = this.add.text(valX, startY, `${this.reputation.toFixed(1)} / 5.0`, { font: '900 24px Nunito', fill: '#e88d72' }).setOrigin(1, 0.5);

    let itemsToAdd = [bg, title, revLabel, revVal, expLabel, expVal, line, profLabel, profVal, repLabel, repVal];

    // Check Objective Rewards
    if (this.gameScene.dailyObjectives) {
      const rewards = this.gameScene.dailyObjectives.claimRewards();
      if (rewards.money > 0 || rewards.rep > 0) {
        startY += 40;
        const rewardText = this.add.text(0, startY, `🎁 Thưởng Mục Tiêu: +${this.formatMoney(rewards.money)} & +${rewards.rep.toFixed(1)}⭐`, {
          font: 'bold 18px Nunito', fill: '#64c48a'
        }).setOrigin(0.5);
        itemsToAdd.push(rewardText);
        // Add actual rewards to economy immediately
        this.gameScene.economy.addMoney(rewards.money);
        this.gameScene.reputation = Phaser.Math.Clamp(this.gameScene.reputation + rewards.rep, 0, 5);
      }
    }

    // Warn if went negative
    if (this.profit < 0) {
      startY += 40;
      const warn = this.add.text(0, startY, '⚠️ Lỗ rồi! Hãy mở thêm máy để cải thiện!', {
        font: 'bold 16px Nunito', fill: '#c25953'
      }).setOrigin(0.5);
      itemsToAdd.push(warn);
    }

    // Next Day button
    const btnBg = this.add.rectangle(0, modalHeight / 2 - 50, 240, 50, 0x64c48a).setInteractive({ useHandCursor: true });
    btnBg.setStrokeStyle(3, 0x4a3b32);
    const btnTxt = this.add.text(0, modalHeight / 2 - 50, '▶ SANG NGÀY MỚI', {
      font: '900 18px Nunito', fill: '#ffffff'
    }).setOrigin(0.5);

    btnBg.on('pointerover', () => btnBg.setAlpha(0.8));
    btnBg.on('pointerout', () => btnBg.setAlpha(1));
    btnBg.on('pointerdown', () => {
      this.tweens.add({ targets: [btnBg, btnTxt], scale: 0.9, duration: 50, yoyo: true, onComplete: () => {
        this.tweens.add({
          targets: [this.modal, overlay], alpha: 0, duration: 200,
          onComplete: () => {
            this.scene.stop();
            this.gameScene.scene.resume();
            this.gameScene.startNextDay();
          }
        });
      }});
    });

    itemsToAdd.push(btnBg, btnTxt);
    this.modal.add(itemsToAdd);
  }

  formatMoney(amount) {
    if (typeof amount !== 'number' || isNaN(amount)) return '0đ';
    return Math.round(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + 'đ';
  }
}
