import Phaser from 'phaser';
import config from './config';
import BootScene from './scenes/BootScene';
import PreloadScene from './scenes/PreloadScene';
import MenuScene from './scenes/MenuScene';
import GameScene from './scenes/GameScene';
import ShopScene from './scenes/ShopScene';
import SummaryScene from './scenes/SummaryScene';
import EventPopupScene from './scenes/EventPopupScene';
import KitchenScene from './scenes/KitchenScene';
import PCManagementScene from './scenes/PCManagementScene';
import CashierScene from './scenes/CashierScene';
import PCAppScene from './scenes/PCAppScene';
import TutorialScene from './scenes/TutorialScene';
import CryptoScene from './scenes/CryptoScene';

class Game extends Phaser.Game {
  constructor() {
    super(config);
    
    // Add scenes
    this.scene.add('Boot', BootScene);
    this.scene.add('Preload', PreloadScene);
    this.scene.add('Menu', MenuScene);
    this.scene.add('Game', GameScene);
    this.scene.add('Shop', ShopScene);
    this.scene.add('Summary', SummaryScene);
    this.scene.add('EventPopup', EventPopupScene);
    this.scene.add('Kitchen', KitchenScene);
    this.scene.add('PCManagement', PCManagementScene);
    this.scene.add('Cashier', CashierScene);
    this.scene.add('PCApp', PCAppScene);
    this.scene.add('Tutorial', TutorialScene);
    this.scene.add('Crypto', CryptoScene);
    
    // Start Boot scene
    this.scene.start('Boot');
  }
}

// Start game when window loads
window.addEventListener('load', () => {
  const game = new Game();
});
