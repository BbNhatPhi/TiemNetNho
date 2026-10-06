import Phaser from 'phaser';

export default class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture = 'char_default') {
    super(scene, x, y, texture);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    this.setCollideWorldBounds(true);
    this.body.setSize(20, 20); // Small hitbox at the feet
    this.body.setOffset(14, 30); // Adjust based on sprite
    
    this.speed = 250;

    // Keys
    this.cursors = scene.input.keyboard.createCursorKeys();
    this.wasd = scene.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      interact: Phaser.Input.Keyboard.KeyCodes.E
    });
  }

  update(time, delta) {
    this.body.setVelocity(0);

    let moving = false;

    if (this.cursors.left.isDown || this.wasd.left.isDown) {
      this.body.setVelocityX(-this.speed);
      this.flipX = false;
      moving = true;
    } else if (this.cursors.right.isDown || this.wasd.right.isDown) {
      this.body.setVelocityX(this.speed);
      this.flipX = true; // Flips texture if moving right
      moving = true;
    }

    if (this.cursors.up.isDown || this.wasd.up.isDown) {
      this.body.setVelocityY(-this.speed);
      moving = true;
    } else if (this.cursors.down.isDown || this.wasd.down.isDown) {
      this.body.setVelocityY(this.speed);
      moving = true;
    }

    // Normalize diagonal speed
    this.body.velocity.normalize().scale(this.speed);

    // Simple bobbing animation if moving
    if (moving) {
      this.y += Math.sin(time / 100) * 1.5;
    }

    if (this.hasFood) {
      if (!this.foodSprite) {
        this.foodSprite = this.scene.add.text(this.x, this.y - 40, '🍜', { font: '16px Arial' }).setOrigin(0.5);
        this.scene.layerEffects.add(this.foodSprite);
      }
      this.foodSprite.setPosition(this.x, this.y - 40);
    } else {
      if (this.foodSprite) {
        this.foodSprite.destroy();
        this.foodSprite = null;
      }
    }
  }
}
