import { GAME_CONSTANTS } from '../utils/constants';

export default class DaySystem {
  constructor(scene, onDayEnd) {
    this.scene = scene;
    this.timeRemaining = GAME_CONSTANTS.DAY_DURATION_MS;
    this.isDayActive = true;
    this.onDayEnd = onDayEnd;
    this.timeScale = 1; // For fast forward if needed
  }

  update(delta) {
    if (!this.isDayActive) return;

    this.timeRemaining -= delta * this.timeScale;
    
    if (this.timeRemaining <= 0) {
      this.endDay();
    }
  }

  endDay() {
    this.isDayActive = false;
    this.timeRemaining = 0;
    if (this.onDayEnd) {
      this.onDayEnd();
    }
  }

  getFormattedTime() {
    // Convert remaining ms to an in-game clock (e.g. 08:00 to 22:00)
    // 14 hours duration total (14 * 60 = 840 minutes)
    const elapsedRatio = 1 - (this.timeRemaining / GAME_CONSTANTS.DAY_DURATION_MS);
    const totalGameMinutes = 14 * 60;
    const currentMins = elapsedRatio * totalGameMinutes;
    
    const hours = Math.floor(8 + currentMins / 60);
    const mins = Math.floor(currentMins % 60);
    
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }
}
