const fs = require('fs');
let c = fs.readFileSync('src/ui/SyncUI.js', 'utf8');
const start = c.indexOf('    async checkForConflicts() {');
const end = c.indexOf('    }\n}\n\nexport const syncUI = new SyncUI();');
const newFunc =     async checkForConflicts() {
        return new Promise(async (resolve) => {
            const localData = SaveSystem.load();
            const cloudData = await SaveSystem.fetchCloudSave();

            if (localData && cloudData && localData.updated_at && cloudData.updated_at) {
                if (localData.updated_at === cloudData.updated_at) {
                    this.updateUI();
                    return resolve();
                }

                this.overlay.style.display = 'none';
                this.conflictOverlay.style.display = 'flex';

                this.localDay.innerText = \Ngày \\;
                this.localMoney.innerText = \\d\;
                this.localTime.innerText = new Date(localData.updated_at).toLocaleString();

                this.cloudDay.innerText = \Ngày \\;
                this.cloudMoney.innerText = \\d\;
                this.cloudTime.innerText = new Date(cloudData.updated_at).toLocaleString();

                const keepLocalBtn = document.getElementById('btn-keep-local');
                const keepCloudBtn = document.getElementById('btn-keep-cloud');

                const newKeepLocal = keepLocalBtn.cloneNode(true);
                const newKeepCloud = keepCloudBtn.cloneNode(true);
                keepLocalBtn.parentNode.replaceChild(newKeepLocal, keepLocalBtn);
                keepCloudBtn.parentNode.replaceChild(newKeepCloud, keepCloudBtn);

                newKeepLocal.addEventListener('click', async () => {
                    this.conflictOverlay.style.display = 'none';
                    this.show();
                    this.loadingPanel.style.display = 'flex';
                    await SaveSystem.syncToCloud(localData);
                    this.updateUI();
                    resolve();
                });

                newKeepCloud.addEventListener('click', () => {
                    this.conflictOverlay.style.display = 'none';
                    
                    localStorage.setItem(SaveSystem.SAVE_KEY + '_backup', JSON.stringify(localData));
                    SaveSystem.save(cloudData, false);
                    
                    if (this.onCloudSaveLoadedCallback) {
                        this.onCloudSaveLoadedCallback(cloudData);
                    }

                    this.show();
                    this.updateUI();
                    resolve();
                });

            } else if (cloudData && !localData) {
                SaveSystem.save(cloudData, false);
                if (this.onCloudSaveLoadedCallback) {
                    this.onCloudSaveLoadedCallback(cloudData);
                }
                this.updateUI();
                resolve();
            } else if (localData && !cloudData) {
                await SaveSystem.syncToCloud(localData);
                this.updateUI();
                resolve();
            } else {
                this.updateUI();
                resolve();
            }
        });
;
c = c.slice(0, start) + newFunc + c.slice(end);
fs.writeFileSync('src/ui/SyncUI.js', c);
