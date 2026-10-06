import { GAME_EVENTS } from '../data/events';

export default class EventSystem {
  constructor(scene) {
    this.scene = scene;
    
    // Check event every 30 seconds
    this.eventTimer = this.scene.time.addEvent({
      delay: 15000,
      callback: this.checkRandomEvent,
      callbackScope: this,
      loop: true
    });
  }

  checkRandomEvent() {
    if (!this.scene.daySystem.isDayActive) return;

    // Filter events by probability
    const possibleEvents = GAME_EVENTS.filter(e => Math.random() < e.probability);
    
    if (possibleEvents.length > 0) {
      // Pick random event
      const event = possibleEvents[Math.floor(Math.random() * possibleEvents.length)];
      this.triggerEvent(event);
    }
  }

  triggerEvent(event) {
    this.scene.scene.pause(); // Pause game scene
    this.scene.scene.launch('EventPopup', { event: event, gameScene: this.scene });
  }

  destroy() {
    this.eventTimer.remove();
  }
}
