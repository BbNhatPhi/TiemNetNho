import Phaser from 'phaser';

export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super('Preload');
  }

  preload() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    // Background Warm Cream
    this.cameras.main.setBackgroundColor('#faf6f0');

    // UI Loading
    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0xfff8f2, 1);
    progressBox.fillRoundedRect(width / 2 - 160, height / 2 - 25, 320, 50, 25);
    progressBox.lineStyle(4, 0x4a3b32, 1);
    progressBox.strokeRoundedRect(width / 2 - 160, height / 2 - 25, 320, 50, 25);

    const loadingText = this.make.text({
        x: width / 2,
        y: height / 2 - 50,
        text: 'Đang tải tài nguyên...',
        style: { font: '800 24px Nunito', fill: '#4a3b32' }
    }).setOrigin(0.5, 0.5);

    this.load.on('progress', (value) => {
        progressBar.clear();
        progressBar.fillStyle(0xc25953, 1); // Warm brick red
        progressBar.fillRoundedRect(width / 2 - 150, height / 2 - 15, 300 * value, 30, 15);
    });
    
    this.load.on('complete', () => {
        progressBar.destroy();
        progressBox.destroy();
        loadingText.destroy();
    });

    this.load.setPath('assets/');
    
    // UI
    this.load.svg('ui_panel', 'ui/panel.svg', { scale: 1 });
    this.load.svg('btn_normal', 'ui/btn_normal.svg', { scale: 1 });
    this.load.svg('btn_hover', 'ui/btn_hover.svg', { scale: 1 });
    
    // Environment & Furniture
    this.load.svg('floor', 'environment/floor.svg', { scale: 1 });
    this.load.svg('wall', 'environment/wall.svg', { scale: 1 });
    this.load.svg('desk', 'furniture/desk.svg', { scale: 1 });
    this.load.svg('cashier', 'furniture/cashier.svg', { scale: 1 });
    this.load.svg('kitchen', 'furniture/kitchen.svg', { scale: 1 });
    this.load.svg('entrance_door', 'environment/entrance_door.svg', { scale: 1 });
    
    // Computers (5 tiers)
    this.load.svg('pc_1', 'computers/pc_lv1.svg', { scale: 1 });
    this.load.svg('pc_2', 'computers/pc_lv2.svg', { scale: 1 });
    this.load.svg('pc_3', 'computers/pc_lv3.svg', { scale: 1 });
    this.load.svg('pc_4', 'computers/pc_lv4.svg', { scale: 1 });
    this.load.svg('pc_5', 'computers/pc_lv3.svg', { scale: 1 }); // using lv3 for lv4 and VIP for now
    this.load.svg('pc_idle', 'computers/pc_lv1.svg', { scale: 1 }); // alias used in ShopScene preview
    
    // Characters
    this.load.svg('char_default', 'characters/default.svg', { scale: 1 });
    this.load.svg('char_player', 'characters/player.svg', { scale: 1 });
    this.load.svg('char_student', 'characters/student.svg', { scale: 1 });
    this.load.svg('char_gamer', 'characters/gamer.svg', { scale: 1 });
    this.load.svg('char_vip', 'characters/gamer.svg', { scale: 1 }); // fallback
    
    // Decorations
    this.load.svg('poster', 'decorations/poster.svg', { scale: 1 });
    this.load.svg('plant', 'decorations/plant.svg', { scale: 1 });
    this.load.svg('router', 'decorations/router.svg', { scale: 1 });
    this.load.svg('door_mat', 'decorations/door_mat.svg', { scale: 1 });
  }

  create() {
    this.scene.start('Menu');
  }
}
