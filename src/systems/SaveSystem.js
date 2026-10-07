import { supabaseService } from '../services/SupabaseService';

export default class SaveSystem {
  static SAVE_KEY = 'tiemnetnho_save';
  static SAVE_VERSION = 2;
  static isSyncing = false;
  static pendingSyncData = null;
  static lastSyncError = null;

  static async initCloud(onAuthStateChangeCallback) {
      supabaseService.onAuthStateChange = async (event, user) => {
          if (onAuthStateChangeCallback) onAuthStateChangeCallback(event, user);
      };
      return await supabaseService.init();
  }

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
    // v1 saves only had achievements ?" not a full game save
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

  static save(gameData, triggerCloudSync = true) {
    try {
      const now = Date.now();
      const serializedData = JSON.stringify({ ...gameData, _version: this.SAVE_VERSION, updated_at: now });
      localStorage.setItem(this.SAVE_KEY, serializedData);
      
      if (triggerCloudSync && supabaseService.user) {
          this.syncToCloud({ ...gameData, _version: this.SAVE_VERSION, updated_at: now });
      }
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

  static syncQueue = Promise.resolve();

  static async syncToCloud(data) {
      if (!supabaseService.user) return;
      
      this.pendingSyncData = data;
      if (this.isSyncing) return this.syncQueue;
      
      this.isSyncing = true;
      this.syncQueue = new Promise(async (resolve) => {
          while (this.pendingSyncData) {
              const dataToUpload = this.pendingSyncData;
              this.pendingSyncData = null;
              try {
                  const success = await supabaseService.uploadSaveData(dataToUpload);
                  if (success) {
                      this.lastSyncError = null;
                  } else {
                      this.lastSyncError = "Network error";
                  }
              } catch (e) {
                  this.lastSyncError = e.message;
              }
          }
          this.isSyncing = false;
          resolve();
      });
      return this.syncQueue;
  }

  static async fetchCloudSave() {
      if (!supabaseService.user) return null;
      try {
          const result = await supabaseService.getSaveData();
          if (result && result.save_data) {
              return result.save_data;
          }
          return null;
      } catch (e) {
          console.error(e);
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
