import Phaser from 'phaser';

export default class InteractionSystem {
  constructor(scene, player) {
    this.scene = scene;
    this.player = player; // keep this reference in case someone checks it
    this.interactiveObjects = [];
    
    // UI Prompt
    this.promptContainer = this.scene.add.container(0, 0).setDepth(200);
    this.promptContainer.setAlpha(0);
    
    const bg = this.scene.add.nineslice(0, 0, 'ui_panel', 0, 160, 40, 16, 16, 16, 16);
    this.promptTextObj = this.scene.add.text(0, 0, 'CLICK', { font: 'bold 16px Nunito', fill: '#4a3b32' }).setOrigin(0.5);
    this.promptContainer.add([bg, this.promptTextObj]);
  }

  addObject(object) {
    this.interactiveObjects.push(object);
    
    object.setInteractive({ useHandCursor: true, pixelPerfect: true });
    
    object.on('pointerdown', () => {
        if (object.canInteract && object.onInteract) {
            object.onInteract(this.player);
            this.promptContainer.setAlpha(0);
            object.clearTint();
        }
    });

    object.on('pointerover', () => {
        if (object.canInteract) {
            this.promptContainer.setPosition(object.x, object.y - 60);
            this.promptContainer.setAlpha(1);
            let pText = object.promptText || 'TƯƠNG TÁC';
            pText = pText.replace('[E] ', ''); // Remove [E] since it's click now
            this.promptTextObj.setText(pText);
            object.setTint(0xdddddd);
        }
    });

    object.on('pointerout', () => {
        this.promptContainer.setAlpha(0);
        object.clearTint();
    });
  }

  removeObject(object) {
    this.interactiveObjects = this.interactiveObjects.filter(o => o !== object);
    object.disableInteractive();
  }

  update() {
    // Distance checking is no longer needed
  }
}
