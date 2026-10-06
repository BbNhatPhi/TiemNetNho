import Phaser from 'phaser';
import { CUSTOMER_STATES } from '../utils/constants';

export default class CashierScene extends Phaser.Scene {
  constructor() {
    super({ key: 'Cashier' });
  }

  init(data) {
    this.gameScene = data.gameScene;
    this.customer = data.customer;
    this.billAmount = this.customer.amountToPay || 0;
    
    // Generate realistic given amount (e.g. rounded to next 10k, 50k, 100k, etc)
    const bill = this.billAmount;
    if (bill === 0) {
      this.givenAmount = 0;
    } else {
      const options = [];
      // Always round up to next 5k, 10k, 20k, 50k, 100k, 200k, 500k
      const possibleNotes = [10000, 20000, 50000, 100000, 200000, 500000];
      for (const note of possibleNotes) {
        if (note >= bill) options.push(note);
        const multiples = Math.ceil(bill / note) * note;
        if (multiples > bill) options.push(multiples);
      }
      
      // Pick a random realistic option, or just exact change with low probability
      if (Math.random() < 0.1) {
        this.givenAmount = bill;
      } else {
        const uniqueOptions = [...new Set(options)].sort((a,b) => a-b);
        // Pick one of the smallest 3 valid notes that are larger than the bill
        const validOptions = uniqueOptions.filter(x => x > bill);
        if (validOptions.length > 0) {
            this.givenAmount = validOptions[Math.floor(Math.random() * Math.min(3, validOptions.length))];
        } else {
            this.givenAmount = bill;
        }
      }
    }
    
    this.changeRequired = this.givenAmount - this.billAmount;
    this.currentChange = 0;
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Dim background
    const bg = this.add.rectangle(0, 0, width, height, 0x000000, 0.7).setOrigin(0).setInteractive();

    const panelW = 700;
    const panelH = 500;
    const panel = this.add.nineslice(width/2, height/2, 'ui_panel', 0, panelW, panelH, 32, 32, 32, 32).setInteractive();

    this.add.text(width/2, height/2 - 210, '💰 MÁY TÍNH TIỀN', {
        font: '900 28px Nunito', fill: '#c25953'
    }).setOrigin(0.5);

    // Bill info
    const infoStyle = { font: 'bold 22px Nunito', fill: '#4a3b32' };
    const numStyle = { font: '800 24px Nunito', fill: '#c25953' };

    this.add.text(width/2 - 250, height/2 - 140, 'Hóa đơn:', infoStyle);
    this.add.text(width/2 + 250, height/2 - 140, this.formatMoney(this.billAmount), numStyle).setOrigin(1, 0);

    this.add.text(width/2 - 250, height/2 - 100, 'Khách đưa:', infoStyle);
    this.add.text(width/2 + 250, height/2 - 100, this.formatMoney(this.givenAmount), numStyle).setOrigin(1, 0);

    const line = this.add.rectangle(width/2, height/2 - 60, 500, 2, 0x4a3b32, 0.3);

    this.add.text(width/2 - 250, height/2 - 40, 'CẦN THỐI:', { font: '900 24px Nunito', fill: '#e88d72' });
    this.add.text(width/2 + 250, height/2 - 40, this.formatMoney(this.changeRequired), { font: '900 26px Nunito', fill: '#e88d72' }).setOrigin(1, 0);

    // Current change selected
    this.add.text(width/2 - 250, height/2 + 20, 'Đã chọn:', infoStyle);
    this.selectedText = this.add.text(width/2 + 250, height/2 + 20, this.formatMoney(this.currentChange), { font: '900 26px Nunito', fill: '#64c48a' }).setOrigin(1, 0);

    // Message text
    this.msgText = this.add.text(width/2, height/2 + 65, '', { font: 'bold 18px Nunito', fill: '#c25953' }).setOrigin(0.5);

    // Denomination buttons
    const denominations = [1000, 2000, 5000, 10000, 20000, 50000, 100000, 200000, 500000];
    const btnStartX = width/2 - 220;
    const btnY1 = height/2 + 100;
    const btnY2 = height/2 + 160;
    const btnSpaceX = 88;

    denominations.forEach((denom, i) => {
        const row = Math.floor(i / 5);
        const col = i % 5;
        // Center the second row (which has 4 buttons instead of 5)
        const offsetX = (row === 1) ? btnSpaceX / 2 : 0;
        const btnX = btnStartX + col * btnSpaceX + offsetX;
        const btnY = row === 0 ? btnY1 : btnY2;

        const dBtn = this.add.rectangle(btnX, btnY, 80, 50, 0xfff8f2).setInteractive({ useHandCursor: true });
        dBtn.setStrokeStyle(3, 0x4a3b32);
        
        const dTxt = this.add.text(btnX, btnY, (denom/1000) + 'k', { font: '800 20px Nunito', fill: '#4a3b32' }).setOrigin(0.5);
        
        dBtn.on('pointerdown', () => {
            this.currentChange += denom;
            this.selectedText.setText(this.formatMoney(this.currentChange));
            this.msgText.setText('');
            this.tweens.add({ targets: [dBtn, dTxt], scale: 0.9, duration: 50, yoyo: true });
        });
        dBtn.on('pointerover', () => dBtn.setFillStyle(0xeaddd0));
        dBtn.on('pointerout', () => dBtn.setFillStyle(0xfff8f2));
    });

    // Action buttons
    const createActionBtn = (x, y, w, h, text, color, callback) => {
        const btn = this.add.rectangle(x, y, w, h, color).setInteractive({ useHandCursor: true });
        btn.setStrokeStyle(3, 0x4a3b32);
        const txt = this.add.text(x, y, text, { font: '800 20px Nunito', fill: '#ffffff' }).setOrigin(0.5);
        
        btn.on('pointerdown', () => {
            this.tweens.add({ targets: [btn, txt], scale: 0.9, duration: 50, yoyo: true, onComplete: callback });
        });
        btn.on('pointerover', () => btn.setAlpha(0.8));
        btn.on('pointerout', () => btn.setAlpha(1));
    };

    createActionBtn(width/2 - 120, height/2 + 220, 200, 50, '❌ XÓA TRẮNG', 0xc25953, () => {
        this.currentChange = 0;
        this.selectedText.setText(this.formatMoney(this.currentChange));
        this.msgText.setText('');
    });

    createActionBtn(width/2 + 120, height/2 + 220, 200, 50, '✅ HOÀN TẤT', 0x64c48a, () => {
        if (this.currentChange === this.changeRequired) {
            this.completePayment();
        } else if (this.currentChange > this.changeRequired) {
            this.msgText.setText(`⚠️ Thừa ${this.formatMoney(this.currentChange - this.changeRequired)} rồi!`);
        } else {
            this.msgText.setText(`⚠️ Còn thiếu ${this.formatMoney(this.changeRequired - this.currentChange)}!`);
        }
    });

    // Close Button
    const closeBtn = this.add.text(width/2 + panelW/2 - 40, height/2 - panelH/2 + 40, '✖', {
        font: '900 26px Arial', fill: '#c25953'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    
    closeBtn.on('pointerover', () => closeBtn.setScale(1.2));
    closeBtn.on('pointerout', () => closeBtn.setScale(1.0));
    closeBtn.on('pointerdown', () => {
        this.scene.resume('Game');
        this.scene.stop();
    });
  }

  formatMoney(amount) {
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + 'đ';
  }

  completePayment() {
    // Process success
    const gs = this.gameScene;
    gs.economy.addMoney(this.billAmount);
    gs.showFloatText(gs.cashierDesk.x, gs.cashierDesk.y, `+${this.formatMoney(this.billAmount)}`, '#64c48a');
    gs.reputation = Phaser.Math.Clamp((gs.reputation ?? 0) + 0.05, 0, 5); // Boost rep on perfect change
    
    if (gs.dailyObjectives) {
        gs.dailyObjectives.trackProgress('customers_served', 1);
        if (this.changeRequired > 0) gs.dailyObjectives.trackProgress('perfect_payments', 1);
    }
    
    if (this.customer.payBubble) {
        this.customer.payBubble.bg?.destroy();
        this.customer.payBubble.txt?.destroy();
        this.customer.payBubble = null;
    }

    this.customer.state = CUSTOMER_STATES.LEAVING;
    
    const idx = gs.cashierQueue.indexOf(this.customer);
    if (idx >= 0) gs.cashierQueue.splice(idx, 1);

    // Move remaining up
    gs.cashierQueue.forEach((c, i) => {
        gs.tweens.add({ targets: [c.sprite, c.shadow], y: 250 + (i * 40), duration: 500 });
        if (c.payBubble) {
            gs.tweens.add({ targets: [c.payBubble.bg, c.payBubble.txt], y: 250 + (i * 40) - 40, duration: 500 });
        }
    });

    gs.cashierDesk.promptText = gs.cashierQueue.length > 0 ? 'TÍNH TIỀN' : 'CỬA HÀNG';
    
    // Resume
    this.scene.resume('Game');
    this.scene.stop();
  }
}

