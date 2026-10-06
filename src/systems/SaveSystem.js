export default class SaveSystem {
  static SAVE_KEY = 'tiemnetnho_save';
  static SAVE_VERSION = 2;

  // Validate that a save object contains minimum required fields for a game session
  static isValidGameSave(data) {
    if (!data) return false;
    if (typeof data.money !== 'number') return false;
    if (typeof data.day !== 'number') return false;
    if (typeof data.reputation !== 'number') return false;
    return true;
  }

  // Migrate older saves to current format
  static migrate(data) {
    if (!data) return null;
    // v1 saves only had achievements — not a full game save
    if (typeof data.money !== 'number') return null;
    // Ensure required arrays exist
    if (!Array.isArray(data.pcs)) data.pcs = [];
    if (!Array.isArray(data.upgrades)) data.upgrades = [];
    if (!Array.isArray(data.achievements)) data.achievements = [];
    if (typeof data.inventory !== 'object' || data.inventory === null) data.inventory = {};
    
    // Migrate PCs to have parts
    data.pcs.forEach(pc => {
      if (pc.tier && !pc.parts) {
        pc.parts = {
          cpu: pc.tier,
          gpu: pc.tier,
          ram: pc.tier,
          monitor: pc.tier,
          network: pc.tier
        };
      }
    });

    return data;
  }

  static save(gameData) {
    try {
      const serializedData = JSON.stringify({ ...gameData, _version: this.SAVE_VERSION });
      localStorage.setItem(this.SAVE_KEY, serializedData);
      console.log('Game saved successfully');
      return true;
    } catch (e) {
      console.error('Save failed', e);
      return false;
    }
  }

  static load() {
    try {
      const serializedData = localStorage.getItem(this.SAVE_KEY);
      if (serializedData === null) return null;
      const parsed = JSON.parse(serializedData);
      return parsed;
    } catch (e) {
      console.error('Load failed', e);
      return null;
    }
  }

  // Load achievements separately (always safe, never crashes)
  static loadAchievements() {
    try {
      const data = this.load();
      return Array.isArray(data?.achievements) ? data.achievements : [];
    } catch (e) {
      return [];
    }
  }

  // Save only achievements without overwriting game data
  static saveAchievements(achievements) {
    try {
      const existing = this.load() || {};
      existing.achievements = achievements;
      return this.save(existing);
    } catch (e) {
      console.error('Achievement save failed', e);
      return false;
    }
  }

  static loadMastery() {
    try {
      const data = this.load();
      return typeof data?.mastery === 'object' && data.mastery !== null ? data.mastery : {};
    } catch (e) {
      return {};
    }
  }

  static saveMastery(masteryData) {
    try {
      const existing = this.load() || {};
      existing.mastery = masteryData;
      return this.save(existing);
    } catch (e) {
      console.error('Mastery save failed', e);
      return false;
    }
  }

  static clear() {
    localStorage.removeItem(this.SAVE_KEY);
  }
}
