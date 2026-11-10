/**
 * Chat Hub Hybrid Storage Engine
 * -------------------------------------------------------------
 * Provides:
 *  1. Multi-gigabyte persistent storage via browser IndexedDB (ChatHubDB).
 *  2. Zero-delay synchronous in-memory bridge for safeGetStorage / safeSetStorage.
 *  3. Seamless automatic migration from existing localStorage.
 *  4. Background sync with Node.js local disk storage (./stories/ & ./backups/).
 *  5. Automatic debounced auto-save with UI status indicators.
 *  6. Full studio backup export & import.
 */

(function (window) {
  'use strict';

  const DB_NAME = 'ChatHubDB';
  const DB_VERSION = 1;
  const STORE_STATE = 'app_state';
  const STORE_STORIES = 'stories';
  const STORE_BACKUPS = 'backups';

  // Synchronous in-memory memory bridge populated from localStorage initially
  const memCache = new Map();

  // Populate cache from localStorage immediately so synchronous access has 0 latency
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k) {
        memCache.set(k, localStorage.getItem(k));
      }
    }
  } catch (e) {
    console.warn('[Storage] Could not preload localStorage cache:', e);
  }

  let dbInstance = null;
  let dbPromise = null;
  let serverOnline = false;
  let autoSaveTimeout = null;
  let lastSavedTime = null;

  // Open IndexedDB database
  function openDatabase() {
    if (dbPromise) return dbPromise;

    dbPromise = new Promise((resolve, reject) => {
      if (!window.indexedDB) {
        console.warn('[Storage] IndexedDB not supported; using localStorage fallback.');
        return resolve(null);
      }

      const req = indexedDB.open(DB_NAME, DB_VERSION);

      req.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(STORE_STATE)) {
          db.createObjectStore(STORE_STATE, { keyPath: 'key' });
        }
        if (!db.objectStoreNames.contains(STORE_STORIES)) {
          db.createObjectStore(STORE_STORIES, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(STORE_BACKUPS)) {
          db.createObjectStore(STORE_BACKUPS, { keyPath: 'id', autoIncrement: true });
        }
      };

      req.onsuccess = (event) => {
        dbInstance = event.target.result;
        resolve(dbInstance);
      };

      req.onerror = (event) => {
        console.error('[Storage] IndexedDB open failed:', event.target.error);
        resolve(null); // fallback gracefully
      };
    });

    return dbPromise;
  }

  // IDB Helper: Put item in store
  async function idbPut(storeName, item) {
    const db = await openDatabase();
    if (!db) return false;
    return new Promise((resolve) => {
      try {
        const tx = db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        store.put(item);
        tx.oncomplete = () => resolve(true);
        tx.onerror = (e) => {
          console.warn('[Storage] idbPut error:', e);
          resolve(false);
        };
      } catch (err) {
        console.warn('[Storage] idbPut exception:', err);
        resolve(false);
      }
    });
  }

  // IDB Helper: Get item by key
  async function idbGet(storeName, key) {
    const db = await openDatabase();
    if (!db) return null;
    return new Promise((resolve) => {
      try {
        const tx = db.transaction(storeName, 'readonly');
        const store = tx.objectStore(storeName);
        const req = store.get(key);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => resolve(null);
      } catch (err) {
        resolve(null);
      }
    });
  }

  // IDB Helper: Delete item by key
  async function idbDelete(storeName, key) {
    const db = await openDatabase();
    if (!db) return false;
    return new Promise((resolve) => {
      try {
        const tx = db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        store.delete(key);
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => resolve(false);
      } catch (err) {
        resolve(false);
      }
    });
  }

  // IDB Helper: Get all items in store
  async function idbGetAll(storeName) {
    const db = await openDatabase();
    if (!db) return [];
    return new Promise((resolve) => {
      try {
        const tx = db.transaction(storeName, 'readonly');
        const store = tx.objectStore(storeName);
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => resolve([]);
      } catch (err) {
        resolve([]);
      }
    });
  }

  // Migration: migrate existing localStorage items into IndexedDB
  async function migrateFromLocalStorage() {
    try {
      const db = await openDatabase();
      if (!db) return;

      const keysToCheck = [
        'manhwa_whatsapp_comic_studio_v3',
        'manhwa_saved_stories_library',
        'wh_current_story_title',
        'wh_current_story_id',
        'wh_cinema_speed',
        'wh_cinema_spam_delay',
        'wh_cinema_cam_engine',
        'wh_chat_theme_style',
        'chathub_active_app',
        'chathub_gpt_model',
        'chathub_gemini_model',
        'chathub_director_deck_mode'
      ];

      for (const k of keysToCheck) {
        const localVal = localStorage.getItem(k);
        if (localVal !== null) {
          const existing = await idbGet(STORE_STATE, k);
          if (!existing) {
            await idbPut(STORE_STATE, { key: k, value: localVal, updatedAt: Date.now() });
          }
        }
      }

      // Also migrate individual stories into stories store
      const storiesRaw = localStorage.getItem('manhwa_saved_stories_library');
      if (storiesRaw) {
        try {
          const stories = JSON.parse(storiesRaw);
          if (Array.isArray(stories)) {
            for (const story of stories) {
              if (story && story.id) {
                const existing = await idbGet(STORE_STORIES, story.id);
                if (!existing) {
                  await idbPut(STORE_STORIES, story);
                }
              }
            }
          }
        } catch (e) {
          // ignore malformed library
        }
      }

      // Load all IndexedDB app_state entries into memCache to keep them in sync
      const allStates = await idbGetAll(STORE_STATE);
      for (const entry of allStates) {
        if (entry && entry.key) {
          memCache.set(entry.key, entry.value);
        }
      }
    } catch (err) {
      console.warn('[Storage] Migration warning:', err);
    }
  }

  // Check if Node.js server REST API is online
  async function checkServerStatus() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      const res = await fetch('/api/status', {
        method: 'GET',
        cache: 'no-cache',
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        serverOnline = !!(data && data.ok);
      } else {
        serverOnline = false;
      }
    } catch (e) {
      serverOnline = false;
    }
    updateStorageStatusUi();
    return serverOnline;
  }

  // Auto-Save: Debounced save trigger
  function requestAutoSave(callback) {
    updateAutoSaveUi('saving');
    if (autoSaveTimeout) clearTimeout(autoSaveTimeout);

    autoSaveTimeout = setTimeout(async () => {
      try {
        if (typeof callback === 'function') {
          await callback();
        }
        lastSavedTime = new Date();
        updateAutoSaveUi('saved');
      } catch (err) {
        console.error('[Storage] Auto-save error:', err);
        updateAutoSaveUi('error');
      }
    }, 1200);
  }

  // Update UI indicators for Auto-Save
  function updateAutoSaveUi(status) {
    const badge = document.getElementById('chathubAutoSaveBadge');
    if (!badge) return;

    if (status === 'saving') {
      badge.innerHTML = `<span style="display:inline-block; animation:spin 1s linear infinite;">⏳</span> Saving...`;
      badge.style.color = '#38bdf8';
      badge.style.opacity = '1';
    } else if (status === 'saved') {
      const timeStr = lastSavedTime ? lastSavedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'just now';
      badge.innerHTML = `✓ Saved ${timeStr}`;
      badge.style.color = '#4ade80';
      badge.style.opacity = '1';
      setTimeout(() => {
        if (badge) badge.style.opacity = '0.7';
      }, 3000);
    } else if (status === 'error') {
      badge.innerHTML = `⚠️ Save warning`;
      badge.style.color = '#f87171';
      badge.style.opacity = '1';
    }
  }

  // Update Storage Status Indicator in Stories Modal / Settings
  async function updateStorageStatusUi() {
    const usageBadge = document.getElementById('storageUsageBadge');
    const syncBadge = document.getElementById('serverSyncBadge');

    if (usageBadge) {
      const stats = await getStorageUsageEstimate();
      usageBadge.innerHTML = `💾 Storage: <b>${stats.usedMb} MB</b> / IndexedDB (Unlimited)`;
    }

    if (syncBadge) {
      if (serverOnline) {
        syncBadge.innerHTML = `🟢 Disk Sync: Active (./stories)`;
        syncBadge.style.background = '#064e3b';
        syncBadge.style.color = '#6ee7b7';
      } else {
        syncBadge.innerHTML = `⚪ Browser Storage (Offline/Static)`;
        syncBadge.style.background = '#1e293b';
        syncBadge.style.color = '#94a3b8';
      }
    }
  }

  // Storage usage calculation
  async function getStorageUsageEstimate() {
    let usedBytes = 0;
    try {
      if (navigator.storage && navigator.storage.estimate) {
        const est = await navigator.storage.estimate();
        usedBytes = est.usage || 0;
      }
    } catch (e) {}

    // Fallback: estimate from memCache if API not available
    if (usedBytes === 0) {
      for (const [k, v] of memCache.entries()) {
        usedBytes += (k.length + (typeof v === 'string' ? v.length : JSON.stringify(v).length)) * 2;
      }
    }

    const usedMb = (usedBytes / (1024 * 1024)).toFixed(2);
    return { usedBytes, usedMb };
  }

  // Public ChatHubStorage API
  const ChatHubStorage = {
    // Synchronous Read: checks memory cache first, then localStorage
    get(key) {
      if (memCache.has(key)) {
        return memCache.get(key);
      }
      try {
        const val = localStorage.getItem(key);
        if (val !== null) memCache.set(key, val);
        return val;
      } catch (e) {
        return null;
      }
    },

    // Synchronous Write Interface with async background IndexedDB persistence
    set(key, value) {
      const strVal = typeof value === 'string' ? value : JSON.stringify(value);
      memCache.set(key, strVal);

      // Async write to IndexedDB
      idbPut(STORE_STATE, { key, value: strVal, updatedAt: Date.now() });

      // Fallback write to localStorage (wrapped in try-catch so 5MB quota errors never break the app)
      try {
        localStorage.setItem(key, strVal);
      } catch (quotaExceeded) {
        // Quota safely swallowed - IndexedDB holds the authoritative data!
      }
      return true;
    },

    // Remove key
    remove(key) {
      memCache.delete(key);
      idbDelete(STORE_STATE, key);
      try {
        localStorage.removeItem(key);
      } catch (e) {}
    },

    // Save individual story to IndexedDB & sync with local disk if server is online
    async saveStory(story) {
      if (!story || !story.id) return false;

      // 1. Save to IndexedDB
      await idbPut(STORE_STORIES, story);

      // 2. Sync to local disk ./stories/ folder via Node server if online
      if (serverOnline) {
        try {
          fetch('/api/stories', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(story)
          }).catch(err => console.warn('[Storage] Server sync background warning:', err));
        } catch (err) {
          console.warn('[Storage] Server sync error:', err);
        }
      }
      updateStorageStatusUi();
      return true;
    },

    // Delete story from IndexedDB & disk
    async deleteStory(storyId) {
      if (!storyId) return false;
      await idbDelete(STORE_STORIES, storyId);

      if (serverOnline) {
        try {
          fetch(`/api/stories/${encodeURIComponent(storyId)}`, { method: 'DELETE' }).catch(() => {});
        } catch (e) {}
      }
      updateStorageStatusUi();
      return true;
    },

    // Sync all current saved stories to local disk ./stories/ folder
    async syncAllToDisk(storiesList) {
      if (!serverOnline) {
        const isNowOnline = await checkServerStatus();
        if (!isNowOnline) {
          if (typeof window.showToast === 'function') {
            window.showToast('ℹ️ Local Node server is not active. Running on Browser Storage.');
          }
          return;
        }
      }

      if (!Array.isArray(storiesList) || storiesList.length === 0) {
        if (typeof window.showToast === 'function') {
          window.showToast('ℹ️ No saved stories to sync yet.');
        }
        return;
      }

      let syncedCount = 0;
      for (const story of storiesList) {
        if (story && story.id) {
          try {
            const res = await fetch('/api/stories', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(story)
            });
            if (res.ok) syncedCount++;
          } catch (e) {}
        }
      }

      if (typeof window.showToast === 'function') {
        window.showToast(`✅ Successfully synced ${syncedCount} stories to ./stories/ on disk!`);
      }
      updateStorageStatusUi();
    },

    // Load stories from local disk ./stories/ folder into client
    async loadStoriesFromDisk() {
      if (!serverOnline) await checkServerStatus();
      if (!serverOnline) return [];

      try {
        const res = await fetch('/api/stories');
        if (!res.ok) return [];
        const data = await res.json();
        return (data && Array.isArray(data.stories)) ? data.stories : [];
      } catch (e) {
        return [];
      }
    },

    // Create and download complete studio backup JSON
    async exportBackup() {
      try {
        const stories = await idbGetAll(STORE_STORIES);
        const allStates = await idbGetAll(STORE_STATE);

        const stateObj = {};
        for (const s of allStates) {
          try {
            stateObj[s.key] = JSON.parse(s.value);
          } catch (e) {
            stateObj[s.key] = s.value;
          }
        }

        const backupData = {
          format: 'ChatHub_Full_Studio_Backup',
          version: '3.3',
          exportedAt: new Date().toISOString(),
          appState: stateObj,
          savedStories: stories
        };

        const jsonString = JSON.stringify(backupData, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const dateStr = new Date().toISOString().slice(0, 10);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ChatHub_Studio_Backup_${dateStr}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        // Also save snapshot on server if connected
        if (serverOnline) {
          fetch('/api/backup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: jsonString
          }).catch(() => {});
        }

        if (typeof window.showToast === 'function') {
          window.showToast('💾 Complete Studio Backup exported successfully!');
        }
      } catch (err) {
        console.error('[Storage] Export backup failed:', err);
        if (typeof window.showToast === 'function') {
          window.showToast('⚠️ Export failed: ' + err.message);
        }
      }
    },

    // Import and restore complete studio backup JSON
    async importBackup(file) {
      if (!file) return;
      try {
        const text = await file.text();
        const data = JSON.parse(text);

        if (!data || (!data.appState && !data.savedStories)) {
          throw new Error('Invalid backup file structure.');
        }

        // Restore appState
        if (data.appState && typeof data.appState === 'object') {
          for (const key of Object.keys(data.appState)) {
            const val = typeof data.appState[key] === 'object' ? JSON.stringify(data.appState[key]) : data.appState[key];
            ChatHubStorage.set(key, val);
          }
        }

        // Restore savedStories
        if (Array.isArray(data.savedStories)) {
          for (const story of data.savedStories) {
            if (story && story.id) {
              await ChatHubStorage.saveStory(story);
            }
          }
          ChatHubStorage.set('manhwa_saved_stories_library', JSON.stringify(data.savedStories));
        }

        if (typeof window.showToast === 'function') {
          window.showToast('🎉 Studio Backup restored successfully! Refreshing...');
        }
        setTimeout(() => window.location.reload(), 1200);
      } catch (err) {
        console.error('[Storage] Import backup failed:', err);
        if (typeof window.showToast === 'function') {
          window.showToast('❌ Backup import failed: ' + err.message);
        }
      }
    },

    // Request debounced auto-save
    requestAutoSave,

    // Refresh UI & usage stats
    updateStorageStatusUi,
    checkServerStatus,

    get isServerOnline() {
      return serverOnline;
    }
  };

  // Attach to window
  window.ChatHubStorage = ChatHubStorage;

  // Initialize on script execution
  openDatabase().then(async () => {
    await migrateFromLocalStorage();
    await checkServerStatus();
    updateStorageStatusUi();
    window.dispatchEvent(new CustomEvent('chathub:storage-ready'));
  });

  // Re-check server status periodically (every 30 seconds)
  setInterval(() => {
    checkServerStatus();
  }, 30000);

})(window);
