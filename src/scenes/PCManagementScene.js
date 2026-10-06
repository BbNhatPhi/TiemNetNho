import Phaser from 'phaser';
import { PC_STATES } from '../utils/constants';
import { PC_PARTS, calculatePCStats } from '../data/computers';

export default class PCManagementScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PCManagement' });
  }

  init(data) {
    this.gameScene = data.gameScene;
    this.currentPage = data.page || 0;
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Dim background overlay
    const bg = this.add.rectangle(0, 0, width, height, 0x000000, 0.65).setOrigin(0);
    bg.setInteractive();
    bg.on('pointerdown', () => {
      this.scene.resume('Game');
      this.scene.stop();
    });

    const panelW = 900;
    const panelH = 540;
    this.panelW = panelW;
    this.panelH = panelH;
    this.mainPanel = this.add.container(width / 2, height / 2);

    const panelBg = this.add.nineslice(0, 0, 'ui_panel', 0, panelW, panelH, 32, 32, 32, 32).setInteractive();
    this.mainPanel.add(panelBg);

    // Title
    const title = this.add.text(0, -panelH / 2 + 40, '💻 PHẦN MỀM QUẢN LÝ TIỆM NET', {
      font: '900 26px Nunito', fill: '#c25953'
    }).setOrigin(0.5);
    this.mainPanel.add(title);

    // Close button
    const closeBtn = this.add.text(panelW / 2 - 35, -panelH / 2 + 35, '✖', {
      font: '900 24px Arial', fill: '#c25953'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    closeBtn.on('pointerover', () => closeBtn.setScale(1.2));
    closeBtn.on('pointerout', () => closeBtn.setScale(1.0));
    closeBtn.on('pointerdown', () => {
      this.scene.resume('Game');
      this.scene.stop();
    });
    this.mainPanel.add(closeBtn);

    this.renderPCList();
  }

  renderPCList() {
    if (this.listContainer) {
      this.listContainer.destroy();
    }
    this.listContainer = this.add.container(0, 0);
    this.mainPanel.add(this.listContainer);

    const pcs = this.gameScene.pcs || [];
    const pageSize = 8;
    const totalPages = Math.max(1, Math.ceil(pcs.length / pageSize));
    if (this.currentPage >= totalPages) this.currentPage = totalPages - 1;
    if (this.currentPage < 0) this.currentPage = 0;

    const pagePcs = pcs.slice(this.currentPage * pageSize, (this.currentPage + 1) * pageSize);

    const colCenters = [-215, 215];
    const startY = -140;
    const rowHeight = 72;

    const stateMap = {
      [PC_STATES.OFF]: { label: '🔴 Tắt', color: '#c25953' },
      [PC_STATES.READY]: { label: '🟢 Sẵn sàng', color: '#2e7d32' },
      [PC_STATES.OCCUPIED]: { label: '🔵 Đang chơi', color: '#1976d2' },
      [PC_STATES.DIRTY]: { label: '🟡 Cần dọn', color: '#b45309' },
      [PC_STATES.BOOTING]: { label: '⚡ Khởi động', color: '#d97706' },
      [PC_STATES.ERROR]: { label: '❌ Lỗi mạng', color: '#c25953' },
      [PC_STATES.BROKEN]: { label: '🔨 Hỏng', color: '#c25953' },
    };

    pagePcs.forEach((pc, idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const cx = colCenters[col];
      const cy = startY + row * rowHeight;

      // Card background
      const cardBg = this.add.rectangle(cx, cy, 400, 62, 0xfff8f2, 1);
      cardBg.setStrokeStyle(2, 0x4a3b32);
      this.listContainer.add(cardBg);

      // PC info (left)
      const nameTxt = this.add.text(cx - 185, cy - 14, `🖥️ Máy ${pc.id + 1}`, {
        font: '800 17px Nunito', fill: '#4a3b32'
      }).setOrigin(0, 0.5);

      const stats = pc.data || calculatePCStats(pc.parts || {});
      const rateStr = this.formatMoney(stats.hourlyRate || 5000);
      const specTxt = this.add.text(cx - 185, cy + 12, `Cấp ${pc.tier || 1} • ${rateStr}/h`, {
        font: '700 13px Nunito', fill: '#7d6b5e'
      }).setOrigin(0, 0.5);

      // Status badge (middle)
      const st = stateMap[pc.state] || { label: pc.state, color: '#4a3b32' };
      const statusTxt = this.add.text(cx - 20, cy, st.label, {
        font: '800 14px Nunito', fill: st.color
      }).setOrigin(0.5);

      // Upgrade button (small orange pill)
      const upgBtn = this.add.rectangle(cx + 62, cy, 74, 32, 0xe88d72).setInteractive({ useHandCursor: true });
      upgBtn.setStrokeStyle(1.5, 0x4a3b32);
      const upgTxt = this.add.text(cx + 62, cy, '⚙️ CẤU HÌNH', {
        font: '800 10.5px Nunito', fill: '#ffffff'
      }).setOrigin(0.5);

      upgBtn.on('pointerover', () => upgBtn.setFillStyle(0xd47358));
      upgBtn.on('pointerout', () => upgBtn.setFillStyle(0xe88d72));
      upgBtn.on('pointerdown', () => this.openUpgradePanel(pc));

      // Action button (right)
      const actBtn = this.add.rectangle(cx + 145, cy, 80, 32, 0x64c48a).setInteractive({ useHandCursor: true });
      actBtn.setStrokeStyle(1.5, 0x4a3b32);
      const actTxt = this.add.text(cx + 145, cy, 'BẬT MÁY', {
        font: '800 11px Nunito', fill: '#ffffff'
      }).setOrigin(0.5);

      const setupAction = (label, color, hoverColor, onClick) => {
        actTxt.setText(label);
        actBtn.setFillStyle(color);
        actBtn.off('pointerover');
        actBtn.off('pointerout');
        actBtn.off('pointerdown');
        actBtn.on('pointerover', () => actBtn.setFillStyle(hoverColor));
        actBtn.on('pointerout', () => actBtn.setFillStyle(color));
        actBtn.on('pointerdown', () => {
          this.tweens.add({
            targets: [actBtn, actTxt], scale: 0.9, duration: 50, yoyo: true,
            onComplete: () => {
              onClick();
              this.renderPCList();
            }
          });
        });
      };

      if (pc.state === PC_STATES.OFF) {
        setupAction('BẬT MÁY', 0x64c48a, 0x51ab75, () => {
          pc.state = PC_STATES.READY;
          if (pc.monitor) pc.monitor.clearTint();
          if (pc.glow) pc.glow.fillAlpha = 0.4;
          this.gameScene.showFloatText(pc.x, pc.y - 40, '✓ Đã bật máy', '#64c48a');
        });
      } else if (pc.state === PC_STATES.READY) {
        setupAction('TẮT MÁY', 0xc25953, 0xa6433e, () => {
          pc.state = PC_STATES.OFF;
          if (pc.monitor) pc.monitor.setTint(0x555555);
          if (pc.glow) pc.glow.fillAlpha = 0;
          this.gameScene.showFloatText(pc.x, pc.y - 40, 'Đã tắt máy');
        });
      } else if (pc.state === PC_STATES.DIRTY) {
        setupAction('DỌN DẸP', 0xf1c40f, 0xd4ac0d, () => {
          pc.state = PC_STATES.READY;
          if (pc.monitor) pc.monitor.clearTint();
          if (pc.glow) pc.glow.fillAlpha = 0.4;
          this.gameScene.showFloatText(pc.x, pc.y - 40, '✓ Đã dọn dẹp', '#64c48a');
          if (this.gameScene.dailyObjectives) this.gameScene.dailyObjectives.trackProgress('pcs_cleaned', 1);
        });
      } else if (pc.state === PC_STATES.ERROR || pc.state === PC_STATES.BROKEN) {
        setupAction('SỬA CHỮA', 0xe88d72, 0xd47358, () => {
          pc.state = PC_STATES.READY;
          if (pc.monitor) pc.monitor.clearTint();
          if (pc.glow) pc.glow.fillAlpha = 0.4;
          this.gameScene.showFloatText(pc.x, pc.y - 40, '✓ Đã sửa máy', '#64c48a');
        });
      } else if (pc.state === PC_STATES.OCCUPIED) {
        actTxt.setText('ĐANG DÙNG');
        actBtn.setFillStyle(0xc5bcb5);
        actBtn.disableInteractive();
        actTxt.setColor('#ffffff');
      }

      this.listContainer.add([nameTxt, specTxt, statusTxt, upgBtn, upgTxt, actBtn, actTxt]);
    });

    // Pagination controls at bottom
    const bottomY = 175;

    // Previous Page Button
    const prevDisabled = this.currentPage <= 0;
    const prevBtn = this.add.rectangle(-140, bottomY, 120, 38, prevDisabled ? 0xdddddd : 0xfff8f2)
      .setStrokeStyle(2, 0x4a3b32);
    const prevTxt = this.add.text(-140, bottomY, '◀ TRƯỚC', {
      font: '800 13px Nunito', fill: prevDisabled ? '#999999' : '#4a3b32'
    }).setOrigin(0.5);

    if (!prevDisabled) {
      prevBtn.setInteractive({ useHandCursor: true });
      prevBtn.on('pointerover', () => prevBtn.setFillStyle(0xeaddd0));
      prevBtn.on('pointerout', () => prevBtn.setFillStyle(0xfff8f2));
      prevBtn.on('pointerdown', () => {
        this.currentPage--;
        this.renderPCList();
      });
    }

    // Page indicator
    const pageTxt = this.add.text(0, bottomY, `Trang ${this.currentPage + 1} / ${totalPages} (${pcs.length} máy)`, {
      font: '800 15px Nunito', fill: '#4a3b32'
    }).setOrigin(0.5);

    // Next Page Button
    const nextDisabled = this.currentPage >= totalPages - 1;
    const nextBtn = this.add.rectangle(140, bottomY, 120, 38, nextDisabled ? 0xdddddd : 0xfff8f2)
      .setStrokeStyle(2, 0x4a3b32);
    const nextTxt = this.add.text(140, bottomY, 'SAU ▶', {
      font: '800 13px Nunito', fill: nextDisabled ? '#999999' : '#4a3b32'
    }).setOrigin(0.5);

    if (!nextDisabled) {
      nextBtn.setInteractive({ useHandCursor: true });
      nextBtn.on('pointerover', () => nextBtn.setFillStyle(0xeaddd0));
      nextBtn.on('pointerout', () => nextBtn.setFillStyle(0xfff8f2));
      nextBtn.on('pointerdown', () => {
        this.currentPage++;
        this.renderPCList();
      });
    }

    this.listContainer.add([prevBtn, prevTxt, pageTxt, nextBtn, nextTxt]);
  }

  openUpgradePanel(pc) {
    this.mainPanel.setVisible(false);

    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    this.upgradePanel = this.add.container(width / 2, height / 2);

    const panelBg = this.add.nineslice(0, 0, 'ui_panel', 0, 780, 520, 32, 32, 32, 32).setInteractive();
    this.upgradePanel.add(panelBg);

    // Title & Info
    const title = this.add.text(-340, -215, `⚙️ NÂNG CẤP LINH KIỆN - MÁY ${pc.id + 1}`, {
      font: '900 24px Nunito', fill: '#c25953'
    }).setOrigin(0, 0.5);

    const currentStats = pc.data || calculatePCStats(pc.parts || {});
    const subTitle = this.add.text(-340, -185, `Cấp hiện tại: ${pc.tier || 1} • Doanh thu: ${this.formatMoney(currentStats.hourlyRate || 5000)}/h`, {
      font: '700 14px Nunito', fill: '#7d6b5e'
    }).setOrigin(0, 0.5);

    // Balance
    const moneyText = this.add.text(280, -200, `💰 ${this.formatMoney(this.gameScene.economy.money)}`, {
      font: '900 18px Nunito', fill: '#2e7d32'
    }).setOrigin(1, 0.5);

    // Close button
    const closeBtn = this.add.text(340, -200, '✖', {
      font: '900 24px Arial', fill: '#c25953'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    closeBtn.on('pointerover', () => closeBtn.setScale(1.2));
    closeBtn.on('pointerout', () => closeBtn.setScale(1.0));
    closeBtn.on('pointerdown', () => {
      this.upgradePanel.destroy();
      this.mainPanel.setVisible(true);
      this.renderPCList();
    });

    this.upgradePanel.add([title, subTitle, moneyText, closeBtn]);

    const categories = [
      { id: 'cpu', icon: '🔲', name: 'CPU' },
      { id: 'gpu', icon: '🎮', name: 'GPU' },
      { id: 'ram', icon: '⚡', name: 'RAM' },
      { id: 'monitor', icon: '🖥️', name: 'Màn hình' },
      { id: 'network', icon: '🌐', name: 'Mạng' }
    ];

    let startY = -125;
    const rowStep = 68;

    categories.forEach((cat, idx) => {
      const y = startY + idx * rowStep;
      const currentLevel = (pc.parts && pc.parts[cat.id]) ? pc.parts[cat.id] : 1;
      const currentPart = PC_PARTS[cat.id][currentLevel];
      const nextPart = PC_PARTS[cat.id][currentLevel + 1];

      // Row Card BG
      const rowBg = this.add.rectangle(0, y, 700, 58, 0xfff8f2, 1);
      rowBg.setStrokeStyle(2, 0x4a3b32);
      this.upgradePanel.add(rowBg);

      // Part label
      const nameTxt = this.add.text(-330, y, `${cat.icon} ${cat.name}`, {
        font: '800 17px Nunito', fill: '#4a3b32'
      }).setOrigin(0, 0.5);

      // Current level
      const curTxt = this.add.text(-190, y, `Lv${currentLevel}: ${currentPart.name}`, {
        font: '700 14px Nunito', fill: '#7d6b5e'
      }).setOrigin(0, 0.5);

      this.upgradePanel.add([nameTxt, curTxt]);

      if (nextPart) {
        // Next level preview
        const bonusStr = `+${this.formatMoney(nextPart.hourlyRateBonus - currentPart.hourlyRateBonus)}/h`;
        const nextTxt = this.add.text(0, y, `➔ Lv${currentLevel + 1}: ${nextPart.name} (${bonusStr})`, {
          font: '800 13.5px Nunito', fill: '#2e7d32'
        }).setOrigin(0, 0.5);

        // Upgrade button
        const canAfford = this.gameScene.economy.money >= nextPart.cost;
        const btnBg = this.add.rectangle(265, y, 130, 40, canAfford ? 0x64c48a : 0xdddddd)
          .setInteractive({ useHandCursor: canAfford });
        btnBg.setStrokeStyle(2, 0x4a3b32);

        const btnTxt = this.add.text(265, y, `NÂNG CẤP\n${this.formatMoney(nextPart.cost)}`, {
          font: '800 12px Nunito', fill: canAfford ? '#ffffff' : '#888888', align: 'center'
        }).setOrigin(0.5);

        if (canAfford) {
          btnBg.on('pointerover', () => btnBg.setFillStyle(0x51ab75));
          btnBg.on('pointerout', () => btnBg.setFillStyle(0x64c48a));
          btnBg.on('pointerdown', () => {
            if (this.gameScene.economy.spendMoney(nextPart.cost)) {
              if (!pc.parts) pc.parts = {};
              pc.parts[cat.id] = currentLevel + 1;

              // Recalculate stats
              const newStats = calculatePCStats(pc.parts);
              pc.tier = newStats.tier;
              pc.data = newStats;
              pc.spriteKey = pc.tier > 4 ? 'pc_5' : `pc_${pc.tier}`;

              if (pc.monitor) pc.monitor.setTexture(pc.spriteKey);
              const glowColor = pc.tier >= 3 ? (pc.tier === 4 ? 0xff00ff : 0xff3366) : 0x00ffcc;
              if (pc.glow) pc.glow.setFillStyle(glowColor, pc.glow.fillAlpha);

              this.gameScene.saveGame();
              this.gameScene.updateHUD();

              // Refresh upgrade panel
              this.upgradePanel.destroy();
              this.openUpgradePanel(pc);
            }
          });
        }

        this.upgradePanel.add([nextTxt, btnBg, btnTxt]);
      } else {
        // Max level badge
        const maxBg = this.add.rectangle(265, y, 130, 36, 0xeaddd0);
        maxBg.setStrokeStyle(1.5, 0x4a3b32);
        const maxTxt = this.add.text(265, y, '⭐ ĐÃ TỐI ĐA', {
          font: '800 13px Nunito', fill: '#c25953'
        }).setOrigin(0.5);
        this.upgradePanel.add([maxBg, maxTxt]);
      }
    });

    // Back button at bottom
    const backBtn = this.add.rectangle(0, 205, 160, 42, 0xfff8f2).setInteractive({ useHandCursor: true });
    backBtn.setStrokeStyle(2, 0x4a3b32);
    const backTxt = this.add.text(0, 205, '◀ QUAY LẠI', {
      font: '800 15px Nunito', fill: '#4a3b32'
    }).setOrigin(0.5);

    backBtn.on('pointerover', () => backBtn.setFillStyle(0xeaddd0));
    backBtn.on('pointerout', () => backBtn.setFillStyle(0xfff8f2));
    backBtn.on('pointerdown', () => {
      this.upgradePanel.destroy();
      this.mainPanel.setVisible(true);
      this.renderPCList();
    });

    this.upgradePanel.add([backBtn, backTxt]);
  }

  formatMoney(amount) {
    if (typeof amount !== 'number' || isNaN(amount)) return '0đ';
    return Math.round(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + 'đ';
  }
}
