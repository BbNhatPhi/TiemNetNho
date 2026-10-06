import Phaser from 'phaser';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  preload() {
    // Load loading bar assets here if needed
  }

  create() {
    WebFont.load({
      google: {
        families: ['Nunito:400,600,700,800,900', 'Mali:400,600,700']
      },
      active: () => {
        this.scene.start('Preload');
      },
      inactive: () => {
        console.warn("Fonts failed to load");
        this.scene.start('Preload');
      }
    });
  }
}
