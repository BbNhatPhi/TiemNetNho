import { supabaseService } from '../services/SupabaseService';
import SaveSystem from '../systems/SaveSystem';

export class SyncUI {
    constructor() {
        this.overlay = document.getElementById('auth-overlay');
        this.conflictOverlay = document.getElementById('conflict-overlay');
        
        // Panels
        this.loginPanel = document.getElementById('auth-login-panel');
        this.statusPanel = document.getElementById('auth-status-panel');
        this.loadingPanel = document.getElementById('auth-loading');
        
        // Inputs & Text
        this.emailInput = document.getElementById('auth-email');
        this.passwordInput = document.getElementById('auth-password');
        this.errorText = document.getElementById('auth-error');
        this.loggedInText = document.getElementById('auth-logged-in-text');
        this.syncStatusText = document.getElementById('auth-sync-status');
        
        // Conflict fields
        this.localDay = document.getElementById('conflict-local-day');
        this.localMoney = document.getElementById('conflict-local-money');
        this.localTime = document.getElementById('conflict-local-time');
        this.cloudDay = document.getElementById('conflict-cloud-day');
        this.cloudMoney = document.getElementById('conflict-cloud-money');
        this.cloudTime = document.getElementById('conflict-cloud-time');
        
        this.setupEventListeners();
        this.onCloudSaveLoadedCallback = null;
        
        // Handle returning online
        window.addEventListener('online', () => {
            if (supabaseService.user) {
                const localData = SaveSystem.load();
                if (localData) {
                    SaveSystem.syncToCloud(localData).then(() => {
                        this.updateUI();
                    });
                }
            }
        });
        
        // Handle returning to game tab
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible' && supabaseService.user) {
                const localData = SaveSystem.load();
                if (localData) {
                    SaveSystem.syncToCloud(localData).then(() => {
                        this.updateUI();
                    });
                }
            }
        });
    }

    setupEventListeners() {
        document.getElementById('btn-auth-login').addEventListener('click', () => this.handleLogin());
        document.getElementById('btn-auth-register').addEventListener('click', () => this.handleRegister());
        document.getElementById('btn-auth-cancel').addEventListener('click', () => this.hide());
        document.getElementById('btn-auth-close').addEventListener('click', () => this.hide());
        document.getElementById('btn-auth-logout').addEventListener('click', () => this.handleLogout());
        document.getElementById('btn-auth-sync').addEventListener('click', () => this.handleManualSync());
    }

    setOnCloudSaveLoaded(callback) {
        this.onCloudSaveLoadedCallback = callback;
    }

    show() {
        this.overlay.style.display = 'flex';
        this.updateUI();
    }

    hide() {
        this.overlay.style.display = 'none';
        this.errorText.innerText = '';
        this.emailInput.value = '';
        this.passwordInput.value = '';
    }

    updateUI() {
        if (supabaseService.user) {
            this.loginPanel.style.display = 'none';
            this.statusPanel.style.display = 'flex';
            this.loggedInText.innerText = `Đã đăng nhập: ${supabaseService.user.email}`;
            this.syncStatusText.innerText = SaveSystem.lastSyncError ? `Lỗi: ${SaveSystem.lastSyncError}` : `Trạng thái: Đã đồng bộ`;
        } else {
            this.loginPanel.style.display = 'flex';
            this.statusPanel.style.display = 'none';
            this.errorText.innerText = '';
        }
        this.loadingPanel.style.display = 'none';
    }

    async handleLogin() {
        const email = this.emailInput.value.trim();
        const password = this.passwordInput.value;
        if (!email || !password) {
            this.errorText.innerText = "Vui lòng nhập đủ email và mật khẩu";
            return;
        }

        this.loadingPanel.style.display = 'flex';
        const { error } = await supabaseService.signIn(email, password);
        
        if (error) {
            this.loadingPanel.style.display = 'none';
            this.errorText.innerText = error.message;
        } else {
            // Check for conflict
            await this.checkForConflicts();
        }
    }

    async handleRegister() {
        const email = this.emailInput.value.trim();
        const password = this.passwordInput.value;
        if (!email || !password) {
            this.errorText.innerText = "Vui lòng nhập đủ email và mật khẩu";
            return;
        }

        this.loadingPanel.style.display = 'flex';
        const { error } = await supabaseService.signUp(email, password);
        
        if (error) {
            this.loadingPanel.style.display = 'none';
            this.errorText.innerText = error.message;
        } else {
            const localData = SaveSystem.load();
            if (localData) {
                await SaveSystem.syncToCloud(localData);
            }
            this.updateUI();
        }
    }

    async handleLogout() {
        this.loadingPanel.style.display = 'flex';
        await supabaseService.signOut();
        this.updateUI();
    }

    async handleManualSync() {
        this.loadingPanel.style.display = 'flex';
        const localData = SaveSystem.load();
        if (localData) {
            await SaveSystem.syncToCloud(localData);
            this.syncStatusText.innerText = SaveSystem.lastSyncError ? `Lỗi: ${SaveSystem.lastSyncError}` : `Trạng thái: Đã đồng bộ thủ công`;
        }
        this.loadingPanel.style.display = 'none';
    }

    async checkForConflicts() {
        return new Promise(async (resolve) => {
        const localData = SaveSystem.load();
        const cloudData = await SaveSystem.fetchCloudSave();

        const isLocalValid = SaveSystem.isValidGameSave(localData);
        const isCloudValid = SaveSystem.isValidGameSave(cloudData);

        if (isLocalValid && isCloudValid) {
            if (localData.updated_at === cloudData.updated_at) {
                this.updateUI();
                return resolve();
            }

            this.overlay.style.display = 'none';
            this.conflictOverlay.style.display = 'flex';

            this.localDay.innerText = `Ngày ${localData.day || 0}`;
            this.localMoney.innerText = `${(localData.money || 0).toLocaleString()}đ`;
            this.localTime.innerText = new Date(localData.updated_at).toLocaleString();

            this.cloudDay.innerText = `Ngày ${cloudData.day || 0}`;
            this.cloudMoney.innerText = `${(cloudData.money || 0).toLocaleString()}đ`;
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
                
                // Merge achievements if local had any
                let cloudToSave = cloudData;
                if (localData && localData.achievements) {
                    const mergedAch = new Set([...(cloudData.achievements || []), ...localData.achievements]);
                    cloudToSave.achievements = Array.from(mergedAch);
                }
                SaveSystem.save(cloudToSave, false);
                
                if (this.onCloudSaveLoadedCallback) {
                    this.onCloudSaveLoadedCallback(cloudToSave);
                }

                this.show();
                this.updateUI();
                resolve();
            });

        } else if (isCloudValid && !isLocalValid) {
            // Local is missing or just achievements. We should merge achievements before overwriting local!
            let cloudToSave = cloudData;
            if (localData && localData.achievements) {
                const mergedAch = new Set([...(cloudData.achievements || []), ...localData.achievements]);
                cloudToSave.achievements = Array.from(mergedAch);
            }
            SaveSystem.save(cloudToSave, false);
            if (this.onCloudSaveLoadedCallback) {
                this.onCloudSaveLoadedCallback(cloudToSave);
            }
            this.updateUI();
            resolve();
        } else if (isLocalValid && !isCloudValid) {
            await SaveSystem.syncToCloud(localData);
            this.updateUI();
            resolve();
        } else {
            this.updateUI();
            resolve();
        }
        });
    }
}

export const syncUI = new SyncUI();
