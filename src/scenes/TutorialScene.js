import Phaser from 'phaser';

export default class TutorialScene extends Phaser.Scene {
  constructor() {
    super({ key: 'Tutorial' });
  }

  init(data) {
    this.gameScene = data.gameScene;
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    this.bg = this.add.rectangle(0, 0, width, height, 0x000000, 0.7).setOrigin(0);

    this.steps = [
      {
        title: '👋 Chào mừng đến Tiệm Net Nhỏ!',
        text: 'Bạn vừa mở một tiệm net với vài bộ PC cũ.\nHãy biến nó thành gaming center lớn nhất khu phố!',
        highlight: null
      },
      {
        title: '💻 Bật máy cho khách',
        text: 'Nhấn nút "QUẢN LÝ MÁY" ở thanh dưới để mở/tắt máy.\nMáy phải ở trạng thái "Sẵn sàng" thì khách mới ngồi được.',
        highlight: 'bottom_manage'
      },
      {
        title: '👤 Khách hàng tự đến',
        text: 'Khách sẽ tự động đến tiệm và tìm máy trống.\nMỗi loại khách có sở thích máy và độ kiên nhẫn khác nhau.',
        highlight: null
      },
      {
        title: '🍜 Phục vụ đồ ăn/uống',
        text: 'Khi khách gọi món, bong bóng sẽ hiện trên đầu.\nNhấn vào bong bóng để vào bếp nấu mì hoặc pha chế.',
        highlight: null
      },
      {
        title: '💰 Thanh toán',
        text: 'Khi khách chơi xong, họ sẽ xếp hàng tại quầy thu ngân.\nNhấn vào quầy để tính tiền và trả tiền thối chính xác.',
        highlight: null
      },
      {
        title: '🛒 Nâng cấp tiệm',
        text: 'Nhấn "CỬA HÀNG" để mua thêm máy, gear, nội thất.\nNâng cấp giúp thu hút thêm khách và tăng doanh thu.',
        highlight: 'bottom_shop'
      },
      {
        title: '🎯 Mục tiêu hằng ngày',
        text: 'Mỗi ngày sẽ có mục tiêu ngắn để hoàn thành.\nĐạt mục tiêu sẽ nhận thưởng tiền và uy tín!',
        highlight: null
      },
      {
        title: '🌙 Kết thúc ngày',
        text: 'Nhấn "KẾT THÚC NGÀY" hoặc đợi hết giờ.\nCuối ngày sẽ tổng kết doanh thu, chi phí và lợi nhuận.',
        highlight: 'bottom_endday'
      },
      {
        title: '✨ Chúc vui vẻ!',
        text: 'Bây giờ hãy bắt đầu kinh doanh thôi!\nNhớ: uy tín cao = nhiều khách hơn = nhiều tiền hơn!',
        highlight: null
      }
    ];

    this.currentStep = 0;
    this.showStep(0);
  }

  showStep(index) {
    // Clean up old elements
    if (this.stepContainer) this.stepContainer.destroy();

    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    const step = this.steps[index];

    this.stepContainer = this.add.container(width / 2, height / 2);

    const panelW = 620;
    const panelH = 300;
    const panel = this.add.nineslice(0, 0, 'ui_panel', 0, panelW, panelH, 32, 32, 32, 32);

    const title = this.add.text(0, -panelH / 2 + 45, step.title, {
      font: '900 26px Nunito', fill: '#c25953'
    }).setOrigin(0.5);

    const text = this.add.text(0, -15, step.text, {
      font: '700 18px Nunito', fill: '#4a3b32',
      align: 'center', lineSpacing: 8
    }).setOrigin(0.5);

    // Progress dots
    const dotsY = panelH / 2 - 75;
    const dotSpacing = 18;
    const startX = -(this.steps.length - 1) * dotSpacing / 2;
    for (let i = 0; i < this.steps.length; i++) {
      const dotColor = i === index ? 0xc25953 : 0xd5cbbe;
      const dot = this.add.circle(startX + i * dotSpacing, dotsY, i === index ? 6 : 4.5, dotColor);
      this.stepContainer.add(dot);
    }

    // Buttons baseline
    const btnY = panelH / 2 - 32;
    const isLast = index === this.steps.length - 1;
    const isFirst = index === 0;

    // Skip button (bottom left)
    const skipBtn = this.add.text(-panelW / 2 + 35, btnY, 'Bỏ qua ✕', {
      font: '700 15px Nunito', fill: '#8c7a6b'
    }).setOrigin(0, 0.5).setInteractive({ useHandCursor: true });
    skipBtn.on('pointerover', () => skipBtn.setColor('#c25953'));
    skipBtn.on('pointerout', () => skipBtn.setColor('#8c7a6b'));
    skipBtn.on('pointerdown', () => this.closeTutorial());

    // Next/Start button (bottom right)
    const nextBtnBg = this.add.rectangle(panelW / 2 - 95, btnY, 140, 42, isLast ? 0x64c48a : 0xc25953)
      .setInteractive({ useHandCursor: true });
    nextBtnBg.setStrokeStyle(2, 0x4a3b32);
    const nextBtnTxt = this.add.text(panelW / 2 - 95, btnY, isLast ? '▶ BẮT ĐẦU!' : 'TIẾP ▶', {
      font: '900 16px Nunito', fill: '#ffffff'
    }).setOrigin(0.5);

    nextBtnBg.on('pointerover', () => nextBtnBg.setAlpha(0.85));
    nextBtnBg.on('pointerout', () => nextBtnBg.setAlpha(1));
    nextBtnBg.on('pointerdown', () => {
      if (isLast) {
        this.closeTutorial();
      } else {
        this.currentStep++;
        this.showStep(this.currentStep);
      }
    });

    this.stepContainer.add([panel, title, text, skipBtn, nextBtnBg, nextBtnTxt]);

    // Previous button (to the left of Next button)
    if (!isFirst) {
      const prevBtnBg = this.add.rectangle(panelW / 2 - 200, btnY, 110, 42, 0xfff8f2)
        .setInteractive({ useHandCursor: true });
      prevBtnBg.setStrokeStyle(2, 0x4a3b32);
      const prevBtnTxt = this.add.text(panelW / 2 - 200, btnY, '◀ Quay lại', {
        font: '800 15px Nunito', fill: '#4a3b32'
      }).setOrigin(0.5);

      prevBtnBg.on('pointerover', () => prevBtnBg.setFillStyle(0xeaddd0));
      prevBtnBg.on('pointerout', () => prevBtnBg.setFillStyle(0xfff8f2));
      prevBtnBg.on('pointerdown', () => {
        this.currentStep--;
        this.showStep(this.currentStep);
      });
      this.stepContainer.add([prevBtnBg, prevBtnTxt]);
    }

    // Entrance animation
    this.stepContainer.alpha = 0;
    this.stepContainer.y += 20;
    this.tweens.add({
      targets: this.stepContainer,
      alpha: 1, y: height / 2,
      duration: 300, ease: 'Back.easeOut'
    });
  }

  closeTutorial() {
    // Mark tutorial as seen
    try { localStorage.setItem('tiemnetnho_tutorial_done', '1'); } catch (e) {}

    this.tweens.add({
      targets: [this.stepContainer, this.bg],
      alpha: 0, duration: 200,
      onComplete: () => {
        this.scene.resume('Game');
        this.scene.stop();
      }
    });
  }
}

