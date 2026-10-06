import Phaser from 'phaser';
import { CUSTOMER_STATES, PC_STATES } from '../utils/constants';

export default class PCAppScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PCApp' });
  }

  init(data) {
    this.gameScene = data.gameScene;
    this.pc = data.pc;
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Dim background
    const bg = this.add.rectangle(0, 0, width, height, 0x000000, 0.4).setOrigin(0);
    bg.setInteractive();
    bg.on('pointerdown', () => {
      this.scene.resume('Game');
      this.scene.stop();
    });

    // Panel
    const panelW = 420;
    const panelH = 320;
    const panel = this.add.nineslice(width / 2, height / 2, 'ui_panel', 0, panelW, panelH, 32, 32, 32, 32).setInteractive();

    const title = this.add.text(width / 2, height / 2 - 130, `💻 MÁY PC #${this.pc.id + 1}`, {
      font: '800 24px Nunito', fill: '#4a3b32'
    }).setOrigin(0.5);

    const stateTextMap = {
      [PC_STATES.OFF]: '🔴 ĐANG TẮT',
      [PC_STATES.READY]: '🟢 SẴN SÀNG',
      [PC_STATES.OCCUPIED]: '🔵 CÓ KHÁCH',
      [PC_STATES.DIRTY]: '🟡 CẦN DỌN DẸP',
      [PC_STATES.BOOTING]: '⚡ ĐANG KHỞI ĐỘNG',
      [PC_STATES.ERROR]: '❌ LỖI',
      [PC_STATES.BROKEN]: '🔨 HỎNG',
    };

    const stateTxt = this.add.text(width / 2, height / 2 - 80, `Trạng thái: ${stateTextMap[this.pc.state] || this.pc.state}`, {
      font: '700 20px Nunito', fill: '#e88d72'
    }).setOrigin(0.5);

    const createBtn = (y, text, callback) => {
      const btn = this.add.image(width / 2, height / 2 + y, 'btn_normal').setInteractive({ useHandCursor: true });
      btn.setScale(0.85);
      const txt = this.add.text(width / 2, height / 2 + y, text, { font: '800 18px Nunito', fill: '#ffffff' }).setOrigin(0.5);

      btn.on('pointerover', () => { btn.setTexture('btn_hover'); });
      btn.on('pointerout', () => { btn.setTexture('btn_normal'); });
      btn.on('pointerdown', () => {
        this.tweens.add({
          targets: [btn, txt], scale: 0.8, duration: 50, yoyo: true, onComplete: () => {
            callback();
            this.scene.resume('Game');
            this.scene.stop();
          }
        });
      });
      return { btn, txt };
    };

    const pc = this.pc;
    const gs = this.gameScene;

    if (pc.state === PC_STATES.OFF) {
      createBtn(-10, '🚀 BẬT MÁY', () => {
        pc.state = PC_STATES.READY;
        if (pc.monitor) pc.monitor.clearTint();
        if (pc.glow) pc.glow.fillAlpha = 0.4;
        if (pc.desk) pc.desk.promptText = 'MÁY TÍNH';
        gs.showFloatText(pc.x, pc.y - 40, '✓ Máy đã sẵn sàng', '#64c48a');
      });
    } else if (pc.state === PC_STATES.READY) {
      createBtn(-30, '🛑 TẮT MÁY', () => {
        pc.state = PC_STATES.OFF;
        if (pc.monitor) pc.monitor.setTint(0x555555);
        if (pc.glow) pc.glow.fillAlpha = 0;
        if (pc.desk) pc.desk.promptText = 'BẬT MÁY';
        gs.showFloatText(pc.x, pc.y - 40, 'Đã tắt máy');
      });
    } else if (pc.state === PC_STATES.DIRTY) {
      createBtn(-10, '🧹 DỌN DẸP', () => {
        pc.state = PC_STATES.OFF;
        if (pc.monitor) pc.monitor.setTint(0x555555);
        if (pc.glow) pc.glow.fillAlpha = 0;
        if (pc.desk) {
          pc.desk.canInteract = true;
          pc.desk.promptText = 'BẬT MÁY';
          pc.desk.onInteract = () => {
            gs.scene.launch('PCApp', { gameScene: gs, pc });
            gs.scene.pause();
          };
        }
        gs.showFloatText(pc.x, pc.y - 40, '✓ Đã dọn dẹp', '#64c48a');
        if (gs.dailyObjectives) gs.dailyObjectives.trackProgress('pcs_cleaned', 1);
      });
    } else if (pc.state === PC_STATES.OCCUPIED) {
      const cust = pc.customer;
      if (cust && cust.state === CUSTOMER_STATES.REQUESTING && gs.player.hasFood) {
        createBtn(-30, '🍲 GIAO ĐỒ ĂN', () => {
          gs.player.hasFood = false;
          if (cust.foodBubble) {
            cust.foodBubble.bg?.destroy();
            cust.foodBubble.txt?.destroy();
            cust.foodBubble = null;
          }
          const earn = 15000;
          gs.economy.addMoney(earn);
          gs.showFloatText(pc.x, pc.y, `+${gs.formatMoney(earn)}`);
          // Reset desk prompt
          if (pc.desk) pc.desk.promptText = 'MÁY TÍNH';
          // Restore PLAYING state
          cust.state = CUSTOMER_STATES.PLAYING;
          // Deactivate kitchen if no more requesters
          const anyRequesting = gs.customers.some(c => c.state === CUSTOMER_STATES.REQUESTING);
          if (!anyRequesting && gs.kitchenDesk) {
            gs.kitchenDesk.canInteract = false;
            gs.kitchenDesk.promptText = '';
          }
        });
        createBtn(40, '❌ CHƯA CÓ ĐỒ ĂN', () => {
          gs.showFloatText(640, 300, 'Hãy nấu đồ ăn trước!', '#e88d72');
        });
      } else if (cust && cust.state === CUSTOMER_STATES.REQUESTING) {
        this.add.text(width / 2, height / 2, 'Khách đang chờ đồ ăn!\nHãy vào bếp nấu trước.', {
          font: '700 18px Nunito', fill: '#e88d72', align: 'center'
        }).setOrigin(0.5);
      } else {
        createBtn(-10, '⚠️ NHẮC NHẠO KHÁCH', () => {
          gs.showFloatText(pc.x, pc.y - 40, 'Nhắc nhạo khách...', '#aaaaaa');
        });
      }
    } else if (pc.state === PC_STATES.ERROR || pc.state === PC_STATES.BROKEN) {
      createBtn(-10, '🔧 SỬA MÁY', () => {
        pc.state = PC_STATES.OFF;
        if (pc.monitor) pc.monitor.setTint(0x555555);
        if (pc.glow) pc.glow.fillAlpha = 0;
        if (pc.desk) pc.desk.promptText = 'BẬT MÁY';
        gs.showFloatText(pc.x, pc.y - 40, '✓ Đã sửa máy', '#64c48a');
      });
    } else {
      // Unknown/IDLE state — fall back to OFF behavior so it's usable
      createBtn(-10, '🚀 BẬT MÁY', () => {
        pc.state = PC_STATES.READY;
        if (pc.monitor) pc.monitor.clearTint();
        if (pc.glow) pc.glow.fillAlpha = 0.4;
        if (pc.desk) pc.desk.promptText = 'MÁY TÍNH';
        gs.showFloatText(pc.x, pc.y - 40, '✓ Máy đã sẵn sàng', '#64c48a');
      });
    }

    // Close button
    const closeBtn = this.add.text(width / 2 + panelW / 2 - 30, height / 2 - panelH / 2 + 30, '✖', {
      font: '900 22px Arial', fill: '#e88d72'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', () => {
      this.scene.resume('Game');
      this.scene.stop();
    });
  }
}
