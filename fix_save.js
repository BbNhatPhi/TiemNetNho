const fs = require('fs');
let content = fs.readFileSync('src/systems/SaveSystem.js', 'utf8');
const newSync = \  static syncQueue = Promise.resolve();

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
                      this.lastSyncError = "Upload failed";
                  }
              } catch (e) {
                  this.lastSyncError = e.message;
              }
          }
          this.isSyncing = false;
          resolve();
      });
      return this.syncQueue;
  }\;

content = content.replace(/static async syncToCloud\\(data\\) \\{[\\s\\S]*?if \\(this\\.pendingSyncData\\) \\{[\\s\\S]*?\\}/, newSync);

fs.writeFileSync('src/systems/SaveSystem.js', content);
