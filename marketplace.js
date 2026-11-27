/* ============================================================================
   MANHWA CHAT HUB — CREATOR MARKETPLACE ENGINE (Launch Mode: 100% Free)
   - Browse & Live-Preview Character, Sticker, Theme/VFX, Audio & Story Packs
   - Create & Publish custom packs directly from Studio items or uploaded files
   - Export/Import portable .chubpack.json bundles for sharing between creators
   - Future-ready Creator Split & Commission Estimator (80% Creator / 20% Hub)
   ============================================================================ */
(() => {
  'use strict';

  const MARKETPLACE_STORAGE_KEY = 'chathub_marketplace_v1';
  const COMMISSION_RATE = 0.20; // Future default: 20% platform commission, 80% creator payout

  function api() {
    return window.ChatHubStudioApi || null;
  }

  function esc(str) {
    if (api() && typeof api().escapeHtml === 'function') return api().escapeHtml(str);
    return String(str ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function toast(msg) {
    if (api() && typeof api().showToast === 'function') {
      api().showToast(msg);
    } else if (typeof window.showToast === 'function') {
      window.showToast(msg);
    }
  }

  function isSafeMediaUrl(url) {
    if (!url || typeof url !== 'string') return false;
    const u = url.trim();
    if (!u) return false;
    if (/^(assets\/|\.\/assets\/)/i.test(u) && !u.includes('..')) return true;
    if (/^https?:\/\//i.test(u)) return true;
    if (/^blob:/i.test(u)) return true;
    if (/^data:image\/(png|jpeg|jpg|webp|gif|svg\+xml);/i.test(u)) return true;
    if (/^data:audio\/(mpeg|mp3|wav|ogg|webm|aac);/i.test(u)) return true;
    return false;
  }

  function sanitizeUrl(url, fallback = '') {
    return isSafeMediaUrl(url) ? url.trim() : fallback;
  }

  function makeStickerSvgDataUri(title, sub, bg1, bg2, badgeColor) {
    if (window.ChatHubMarketplaceArt && typeof window.ChatHubMarketplaceArt.makeStickerSvgDataUri === 'function') {
      return window.ChatHubMarketplaceArt.makeStickerSvgDataUri(title, sub, bg1, bg2, badgeColor);
    }
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240" viewBox="0 0 240 240"><rect x="10" y="10" width="220" height="220" rx="28" fill="${bg1 || '#1e293b'}" stroke="#0f172a" stroke-width="8"/><text x="120" y="120" font-family="Arial Black, sans-serif" font-size="22" fill="#fff" text-anchor="middle">${esc(String(title || 'PACK').slice(0, 14))}</text></svg>`;
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
  }

  /* --------------------------------------------------------------------------
     CURATED CATALOG SOURCE (Loaded from marketplace-catalog.js)
     -------------------------------------------------------------------------- */
  const BUILTIN_MARKETPLACE_PACKS = Array.isArray(window.CHAT_HUB_MARKETPLACE_CATALOG)
    ? window.CHAT_HUB_MARKETPLACE_CATALOG
    : [];

  /* --------------------------------------------------------------------------
     STATE PERSISTENCE (IndexedDB Bridge via ChatHubStorage + localStorage)
     -------------------------------------------------------------------------- */
  let state = {
    creatorProfile: {
      name: 'Indie Creator',
      handle: '@my_studio',
      bio: 'Making original manhwa & chat stories in Chat Hub!'
    },
    userPacks: [],
    installedPackIds: [],
    installCounts: {},
    ledger: [] // Tracks install / future simulated commission history
  };

  let activeTab = 'browse'; // 'browse' | 'create' | 'myshop'
  let filterCategory = 'all';
  let searchQuery = '';
  let sortMode = 'featured';
  let browseVisibleLimit = 24;
  const BROWSE_PAGE_STEP = 24;
  let previewPackId = null;
  let previewExpr = 'normal';

  // Draft builder state for "Create & Publish Pack"
  let draftState = {
    editingPackId: null,
    uploadedStickers: [],
    uploadedCharacters: [],
    uploadedAudio: [],
    uploadedWallpaper: null
  };

  function readMarketplaceStorage() {
    try {
      let raw = null;
      if (window.ChatHubStorage && typeof window.ChatHubStorage.get === 'function') {
        raw = window.ChatHubStorage.get(MARKETPLACE_STORAGE_KEY);
      }
      if (!raw) raw = localStorage.getItem(MARKETPLACE_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          state = {
            creatorProfile: { ...state.creatorProfile, ...(parsed.creatorProfile || {}) },
            userPacks: Array.isArray(parsed.userPacks) ? parsed.userPacks : [],
            installedPackIds: Array.isArray(parsed.installedPackIds) ? parsed.installedPackIds : [],
            installCounts: (parsed.installCounts && typeof parsed.installCounts === 'object') ? parsed.installCounts : {},
            ledger: Array.isArray(parsed.ledger) ? parsed.ledger : []
          };
        }
      }
    } catch (err) {
      console.warn('[Marketplace] Failed to load state:', err);
    }
  }

  function saveMarketplaceStorage() {
    try {
      const serialized = JSON.stringify(state);
      if (window.ChatHubStorage && typeof window.ChatHubStorage.set === 'function') {
        window.ChatHubStorage.set(MARKETPLACE_STORAGE_KEY, serialized);
      } else {
        localStorage.setItem(MARKETPLACE_STORAGE_KEY, serialized);
      }
    } catch (err) {
      console.warn('[Marketplace] Save failed:', err);
    }
  }

  readMarketplaceStorage();
  window.addEventListener('chathub:storage-ready', () => {
    readMarketplaceStorage();
    renderAllMarketplaceViews();
  });

  /* --------------------------------------------------------------------------
     CATALOG HELPERS
     -------------------------------------------------------------------------- */
  function getAllPacks() {
    const userFormatted = (state.userPacks || []).map(p => ({
      ...p,
      isOfficial: false,
      priceUsd: 0
    }));
    return [...userFormatted, ...BUILTIN_MARKETPLACE_PACKS];
  }

  function getPackById(packId) {
    return getAllPacks().find(p => p.id === packId) || null;
  }

  function isPackInstalled(packId) {
    return state.installedPackIds.includes(packId);
  }

  function getInstallCount(pack) {
    if (!pack) return 0;
    const base = Number(pack.baseInstalls || 0);
    const localExtra = Number(state.installCounts[pack.id] || 0);
    return base + localExtra;
  }

  function categoryLabel(cat) {
    return {
      characters: '🎭 Character',
      syspacks: '🖥️ System UI',
      stickers: '🖼️ Stickers',
      themes: '🎨 Theme & VFX',
      audio: '🔊 Audio & SFX',
      stories: '📜 Story Pack'
    }[cat] || '📦 Pack';
  }

  /* --------------------------------------------------------------------------
     OPEN / CLOSE / TAB NAVIGATION
     -------------------------------------------------------------------------- */
  function openMarketplaceModal(parentModalId = null, initialTab = 'browse') {
    if (parentModalId && typeof window.pushModalHistory === 'function') {
      window.pushModalHistory(parentModalId);
    }
    const modal = document.getElementById('marketplaceModal');
    if (!modal) return;
    modal.classList.add('open');
    switchMarketplaceTab(initialTab || activeTab || 'browse');
    renderAllMarketplaceViews();
  }

  function closeMarketplaceModal() {
    const modal = document.getElementById('marketplaceModal');
    if (modal) modal.classList.remove('open');
    if (typeof window.dismissLingeringModals === 'function') {
      window.dismissLingeringModals();
    }
  }

  function switchMarketplaceTab(tabName) {
    activeTab = tabName || 'browse';
    ['browse', 'create', 'myshop'].forEach(t => {
      const btn = document.getElementById(`mktTabBtn_${t}`);
      const panel = document.getElementById(`mktPanel_${t}`);
      if (btn) btn.classList.toggle('active', t === activeTab);
      if (panel) panel.classList.toggle('active', t === activeTab);
    });
    renderAllMarketplaceViews();
  }

  function renderAllMarketplaceViews() {
    if (activeTab === 'browse') renderBrowseGrid();
    else if (activeTab === 'create') renderCreateBuilder();
    else if (activeTab === 'myshop') renderMyShopDashboard();
  }

  /* --------------------------------------------------------------------------
     TAB 1: BROWSE & DISCOVER CATALOG
     -------------------------------------------------------------------------- */
  function setMarketplaceCategory(cat) {
    filterCategory = cat || 'all';
    browseVisibleLimit = BROWSE_PAGE_STEP;
    document.querySelectorAll('.mkt-cat-pill').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.cat === filterCategory);
    });
    renderBrowseGrid();
  }

  function setMarketplaceSearch(q) {
    searchQuery = (q || '').trim().toLowerCase();
    browseVisibleLimit = BROWSE_PAGE_STEP;
    renderBrowseGrid();
  }

  function setMarketplaceSort(mode) {
    sortMode = mode || 'featured';
    browseVisibleLimit = BROWSE_PAGE_STEP;
    renderBrowseGrid();
  }

  function loadMoreMarketplacePacks() {
    browseVisibleLimit += BROWSE_PAGE_STEP;
    renderBrowseGrid();
  }

  function showAllMarketplacePacks() {
    browseVisibleLimit = 99999;
    renderBrowseGrid();
  }

  function updateCategoryCounts(allPacks) {
    const counts = { all: allPacks.length, user: 0, characters: 0, syspacks: 0, stickers: 0, themes: 0, audio: 0, stories: 0 };
    allPacks.forEach(p => {
      if (!p.isOfficial) counts.user++;
      if (counts[p.category] !== undefined) counts[p.category]++;
    });
    const labels = {
      all: '✨ All',
      characters: '🎭 Characters',
      syspacks: '🖥️ System UI',
      stickers: '🖼️ Stickers',
      themes: '🎨 Themes & VFX',
      audio: '🔊 Audio & SFX',
      stories: '📜 Scripts',
      user: '🧑‍🎨 Creator Made'
    };
    document.querySelectorAll('.mkt-cat-pill').forEach(btn => {
      const cat = btn.dataset.cat;
      if (labels[cat] && counts[cat] !== undefined) {
        btn.textContent = `${labels[cat]} (${counts[cat]})`;
      }
    });
  }

  function renderBrowseGrid() {
    const grid = document.getElementById('mktBrowseGrid');
    const countLabel = document.getElementById('mktCatalogCountLabel');
    const paginationEl = document.getElementById('mktBrowsePagination');
    if (!grid) return;

    const allPacks = getAllPacks();
    updateCategoryCounts(allPacks);

    let list = allPacks.filter(pack => {
      if (filterCategory === 'user') {
        if (pack.isOfficial) return false;
      } else if (filterCategory !== 'all') {
        if (pack.category !== filterCategory) return false;
      }
      if (!searchQuery) return true;
      const hay = `${pack.title} ${pack.description} ${pack.author} ${(pack.tags || []).join(' ')}`.toLowerCase();
      return hay.includes(searchQuery);
    });

    if (sortMode === 'popular') {
      list = [...list].sort((a, b) => getInstallCount(b) - getInstallCount(a));
    } else if (sortMode === 'newest') {
      list = [...list].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    }

    if (countLabel) {
      countLabel.textContent = `${list.length} Free Pack${list.length === 1 ? '' : 's'} Available`;
    }

    if (list.length === 0) {
      if (paginationEl) paginationEl.innerHTML = '';
      grid.innerHTML = `
        <div style="grid-column:1 / -1; text-align:center; padding:34px 16px; color:#94a3b8; background:#0b1120; border:1px dashed #334155; border-radius:14px;">
          <div style="font-size:34px; margin-bottom:6px;">🏪</div>
          <div style="font-size:14px; font-weight:800; color:#f8fafc;">No matching marketplace packs found</div>
          <p style="font-size:12px; margin:4px 0 12px 0;">Try clearing your search/vibe filter or publish the first pack in this style!</p>
          <button type="button" class="btn-primary-comic" style="padding:8px 16px; font-size:12px;" onclick="switchMarketplaceTab('create')">✨ Create & Publish Pack</button>
        </div>
      `;
      return;
    }

    const visibleList = list.slice(0, browseVisibleLimit);
    grid.innerHTML = visibleList.map(pack => {
      const installed = isPackInstalled(pack.id);
      const coverUrl = sanitizeUrl(pack.coverImage, makeStickerSvgDataUri(pack.title, 'PACK', '#1e293b', '#0f172a', '#38bdf8'));
      const installs = getInstallCount(pack);
      const planned = Number(pack.plannedPriceUsd || 0);
      const tagsHtml = (pack.tags || []).slice(0, 3).map(t => `<span class="mkt-tag-chip">#${esc(t)}</span>`).join('');

      return `
        <div class="mkt-pack-card ${installed ? 'installed' : ''}">
          <div class="mkt-pack-cover" onclick="openMarketplacePreview('${esc(pack.id)}')" title="Click to preview pack">
            <span class="mkt-pack-badge-tl">${categoryLabel(pack.category)}</span>
            <span class="mkt-pack-badge-tr ${pack.isOfficial ? '' : 'user-made'}">${pack.isOfficial ? '★ Official' : '✨ Creator'}</span>
            <img src="${esc(coverUrl)}" alt="${esc(pack.title)}" loading="lazy" decoding="async">
          </div>
          <div class="mkt-pack-body">
            <div class="mkt-pack-title">${esc(pack.title)}</div>
            <div class="mkt-pack-author">
              <span>by <b style="color:#e2e8f0;">${esc(pack.author)}</b> ${pack.verified ? '☑️' : ''}</span>
              <span>⬇️ ${installs.toLocaleString()}</span>
            </div>
            <div class="mkt-pack-desc">${esc(pack.description)}</div>
            <div class="mkt-pack-tags">${tagsHtml}</div>
            <div class="mkt-pack-footer">
              <div class="mkt-price-group">
                <span class="mkt-price-free">FREE</span>
                ${planned > 0 ? `<span class="mkt-price-future">Future: \$${planned.toFixed(2)}</span>` : '<span style="font-size:9.5px; color:#64748b;">Community Free</span>'}
              </div>
              <div class="mkt-card-actions">
                <button type="button" class="icon-btn" style="padding:5px 9px; font-size:11px; background:#1e293b; color:#e2e8f0;" onclick="openMarketplacePreview('${esc(pack.id)}')">👁️ Preview</button>
                ${installed
                  ? `<button type="button" class="icon-btn" style="padding:5px 10px; font-size:11px; background:#065f46; color:#6ee7b7; border:1px solid #10b981;" onclick="installMarketplacePack('${esc(pack.id)}')" title="Re-apply / Sync to studio">✓ Installed</button>`
                  : `<button type="button" class="icon-btn" style="padding:5px 11px; font-size:11px; background:linear-gradient(135deg,#10b981 0%,#059669 100%); color:#fff; font-weight:800;" onclick="installMarketplacePack('${esc(pack.id)}')">+ Get Free</button>`}
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');

    if (paginationEl) {
      if (visibleList.length < list.length) {
        const remaining = list.length - visibleList.length;
        const nextBatch = Math.min(BROWSE_PAGE_STEP, remaining);
        paginationEl.innerHTML = `
          <span style="font-size:11.5px; color:#94a3b8;">Showing <b style="color:#f8fafc;">${visibleList.length}</b> of <b style="color:#38bdf8;">${list.length}</b> Free Packs</span>
          <div style="display:flex; gap:8px; flex-wrap:wrap; justify-content:center;">
            <button type="button" class="btn-primary-comic" style="padding:7px 16px; font-size:12px;" onclick="loadMoreMarketplacePacks()">+ Load ${nextBatch} More (${remaining} left)</button>
            <button type="button" class="btn-secondary-comic" style="padding:7px 14px; font-size:12px;" onclick="showAllMarketplacePacks()">Show All (${list.length})</button>
          </div>
        `;
      } else {
        paginationEl.innerHTML = `<span style="font-size:11px; color:#64748b;">Showing all ${list.length} matching pack${list.length === 1 ? '' : 's'}</span>`;
      }
    }
  }

  /* --------------------------------------------------------------------------
     LIVE PREVIEW MODAL ("TRY BEFORE INSTALL")
     -------------------------------------------------------------------------- */
  function openMarketplacePreview(packId) {
    const pack = getPackById(packId);
    if (!pack) return;
    previewPackId = packId;
    previewExpr = 'normal';

    if (typeof window.pushModalHistory === 'function') {
      window.pushModalHistory('marketplaceModal');
    }

    const modal = document.getElementById('marketplacePreviewModal');
    if (modal) modal.classList.add('open');
    renderMarketplacePreview();
  }

  function closeMarketplacePreview() {
    const modal = document.getElementById('marketplacePreviewModal');
    if (modal) modal.classList.remove('open');
    previewPackId = null;
  }

  function setPreviewCharExpr(exprKey, pitch) {
    previewExpr = exprKey;
    if (api() && typeof api().triggerExpressionEffects === 'function') {
      api().triggerExpressionEffects(exprKey, pitch || 1.05);
    } else if (api() && typeof api().playPopSound === 'function') {
      api().playPopSound(pitch || 1.05);
    }
    renderMarketplacePreview();
  }

  function previewStickerSound(sfxName, customAudioData) {
    if (!api()) return;
    if (customAudioData && typeof api().playCustomAudio === 'function') {
      api().playCustomAudio(customAudioData);
    } else if (sfxName && typeof api().triggerSfxByName === 'function') {
      api().triggerSfxByName(sfxName, 1.05);
    } else if (typeof api().playPopSound === 'function') {
      api().playPopSound(1.05);
    }
  }

  function renderMarketplacePreview() {
    const pack = getPackById(previewPackId);
    const titleEl = document.getElementById('mktPreviewTitle');
    const bodyEl = document.getElementById('mktPreviewBody');
    const installBtn = document.getElementById('mktPreviewInstallBtn');
    const uninstallBtn = document.getElementById('mktPreviewUninstallBtn');
    if (!pack || !bodyEl) return;

    if (titleEl) titleEl.textContent = `${categoryLabel(pack.category)} • ${pack.title}`;
    const installed = isPackInstalled(pack.id);

    if (installBtn) {
      installBtn.textContent = installed ? '✓ Re-Apply / Sync Pack' : '+ Install Free to Studio';
      installBtn.onclick = () => {
        installMarketplacePack(pack.id);
        renderMarketplacePreview();
      };
    }
    if (uninstallBtn) {
      uninstallBtn.style.display = installed ? 'inline-flex' : 'none';
      uninstallBtn.onclick = () => {
        uninstallMarketplacePack(pack.id);
        renderMarketplacePreview();
      };
    }

    const items = pack.items || {};
    let interactiveHtml = '';

    // 1. Character preview
    if (Array.isArray(items.characters) && items.characters.length > 0) {
      const charBlocks = items.characters.map(ch => {
        const exprs = ch.expressions || { normal: ch.avatar };
        const exprKeys = Object.keys(exprs);
        const activeKey = exprs[previewExpr] ? previewExpr : (exprKeys[0] || 'normal');
        const activeImg = sanitizeUrl(exprs[activeKey] || ch.avatar);

        const pills = exprKeys.map(k => `
          <button type="button" class="mkt-expr-pill ${k === activeKey ? 'active' : ''}" onclick="setMarketplacePreviewExpr('${esc(k)}', ${Number(ch.pitch || 1.05)})">${esc(k)}</button>
        `).join('');

        return `
          <div class="mkt-preview-hero">
            <img class="mkt-preview-img" src="${esc(activeImg)}" alt="${esc(ch.name)}">
            <div>
              <strong style="font-size:15px; color:#f8fafc;">${esc(ch.name)}</strong>
              <span class="mkt-tag-chip" style="margin-left:6px;">Pitch ${Number(ch.pitch || 1.05).toFixed(2)}x</span>
            </div>
            <div style="font-size:11px; color:#94a3b8;">Tap any expression below to test live face & voice pitch:</div>
            <div class="mkt-expr-btn-row">${pills}</div>
          </div>
        `;
      }).join('');
      interactiveHtml += charBlocks;
    }

    // 2. Stickers / Images preview
    if (Array.isArray(items.stickers) && items.stickers.length > 0) {
      const cards = items.stickers.map(st => {
        const src = sanitizeUrl(st.imageUrl || st.data || st.url);
        const sfxArg = esc(st.sfx || '');
        return `
          <div class="mkt-preview-mini-card" onclick="previewMarketplaceStickerSound('${sfxArg}')" title="Tap to preview sound effect">
            ${src ? `<img src="${esc(src)}" alt="${esc(st.label)}">` : `<div style="font-size:32px;">${esc(st.emoji || '🎭')}</div>`}
            <strong style="font-size:11px; color:#f8fafc;">${esc(st.label || 'Sticker')}</strong>
            <span style="font-size:9.5px; color:#38bdf8;">${st.sfx ? `🔊 :${esc(st.sfx)}:` : 'Tap preview'}</span>
          </div>
        `;
      }).join('');
      interactiveHtml += `
        <div>
          <div style="font-size:11.5px; font-weight:800; color:#94a3b8; margin-bottom:6px; text-transform:uppercase;">Stickers & Media (Tap to test SFX)</div>
          <div class="mkt-preview-items-grid">${cards}</div>
        </div>
      `;
    }

    // 3. Theme & Wallpaper preview
    if (items.theme) {
      const wallSrc = sanitizeUrl(items.theme.customWallpaperData || pack.coverImage);
      interactiveHtml += `
        <div class="mkt-preview-hero">
          ${wallSrc ? `<img class="mkt-preview-img" src="${esc(wallSrc)}" alt="Theme Preview" style="border:2px solid #38bdf8;">` : ''}
          <div style="font-size:12.5px; color:#e2e8f0;">
            Equips VFX Skin: <b style="color:#facc15;">${esc((items.theme.vfxSkin || 'sakuga').toUpperCase())}</b> • Style: <b>${esc((items.theme.chatStyle || 'comic').toUpperCase())}</b>
          </div>
        </div>
      `;
    }

    // 4. Audio preview
    if (Array.isArray(items.audio) && items.audio.length > 0) {
      const audioRows = items.audio.map((aud, i) => `
        <div class="mkt-pick-row" style="justify-content:space-between;">
          <span>🎵 <b>${esc(aud.label || 'Audio Clip')}</b></span>
          <button type="button" class="icon-btn" style="padding:4px 10px; font-size:11px; background:#0284c7; color:#fff;" onclick="playMarketplacePreviewAudio('${esc(pack.id)}', ${i})">▶ Play</button>
        </div>
      `).join('');
      interactiveHtml += `<div style="display:flex; flex-direction:column; gap:6px;">${audioRows}</div>`;
    }

    // 5. Story Scripts preview
    if (Array.isArray(items.templates) && items.templates.length > 0) {
      const tplBlocks = items.templates.map((tpl, idx) => `
        <div style="background:#0b1120; border:1px solid #334155; border-radius:12px; padding:10px 12px; display:flex; flex-direction:column; gap:6px;">
          <div style="display:flex; justify-content:space-between; align-items:center; gap:8px; flex-wrap:wrap;">
            <strong style="font-size:13px; color:#facc15;">📜 ${esc(tpl.title)}</strong>
            <button type="button" class="icon-btn" style="padding:4px 10px; font-size:11px; background:#e11d48; color:#fff;" onclick="playMarketplaceTemplateDemo('${esc(pack.id)}', ${idx})">▶ Load & Auto-Play</button>
          </div>
          <div style="font-size:11.5px; color:#94a3b8;">${esc(tpl.desc || '')}</div>
          <pre style="margin:0; font-size:10.5px; color:#cbd5e1; background:#090d16; padding:8px; border-radius:8px; max-height:110px; overflow:auto; white-space:pre-wrap;">${esc((tpl.script || '').split('\n').slice(0, 7).join('\n'))}</pre>
        </div>
      `).join('');
      interactiveHtml += `<div style="display:flex; flex-direction:column; gap:8px;">${tplBlocks}</div>`;
    }

    // 6. System UI Cards & Neon Vector Icons preview
    if (Array.isArray(items.sysIcons) && items.sysIcons.length > 0) {
      const iconTiles = items.sysIcons.map(ic => `
        <div class="mkt-preview-mini-card" style="background:#071029; border-color:#1e3a5f;">
          <div style="width:42px; height:42px; display:flex; align-items:center; justify-content:center; color:#38bdf8;">${ic.svg || '✨'}</div>
          <strong style="font-size:10.5px; color:#fde047;">${esc(ic.label || 'Vector Icon')}</strong>
        </div>
      `).join('');
      interactiveHtml += `
        <div>
          <div style="font-size:11.5px; font-weight:800; color:#38bdf8; margin-bottom:6px; text-transform:uppercase;">⚡ Neon Vector Icons (${items.sysIcons.length})</div>
          <div class="mkt-preview-items-grid">${iconTiles}</div>
        </div>
      `;
    }
    if (Array.isArray(items.sysPresets) && items.sysPresets.length > 0) {
      const cardsHtml = items.sysPresets.map(sp => {
        if (window.ChatHubSystemWindows && typeof window.ChatHubSystemWindows.renderSystemWindowElement === 'function') {
          try {
            const el = window.ChatHubSystemWindows.renderSystemWindowElement({ systemConfig: sp.config }, { previewMode: true });
            return `<div style="display:flex; justify-content:center;">${el.outerHTML}</div>`;
          } catch (e) {}
        }
        return `<div style="background:#0b1120; border:1px solid #38bdf8; border-radius:8px; padding:8px;"><b>${esc(sp.name || sp.config?.headerTitle || 'System Card')}</b></div>`;
      }).join('');
      interactiveHtml += `
        <div style="display:flex; flex-direction:column; gap:10px;">
          <div style="font-size:11.5px; font-weight:800; color:#facc15; text-transform:uppercase;">🖥️ Included System Cards & Frames (${items.sysPresets.length})</div>
          ${cardsHtml}
        </div>
      `;
    }

    const planned = Number(pack.plannedPriceUsd || 0);
    const futureCreatorShare = (planned * (1 - COMMISSION_RATE)).toFixed(2);
    const futureHubFee = (planned * COMMISSION_RATE).toFixed(2);

    bodyEl.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:10px; flex-wrap:wrap; background:#090d16; border:1px solid #1e293b; border-radius:12px; padding:10px 12px;">
        <div>
          <div style="font-size:12px; color:#94a3b8;">Creator: <b style="color:#f8fafc;">${esc(pack.author)}</b> (${esc(pack.authorHandle || '@creator')})</div>
          <div style="font-size:11px; color:#34d399; margin-top:2px;">📄 License: ${esc(pack.license || 'Free Creator Use')}</div>
        </div>
        <div style="text-align:right;">
          <div style="font-size:14px; font-weight:900; color:#4ade80;">FREE NOW</div>
          ${planned > 0 ? `<div style="font-size:10px; color:#94a3b8;">Planned Future Price: \$${planned.toFixed(2)} (80%: \$${futureCreatorShare} / 20%: \$${futureHubFee})</div>` : ''}
        </div>
      </div>
      <p style="margin:0; font-size:12.5px; color:#cbd5e1; line-height:1.45;">${esc(pack.description)}</p>
      ${interactiveHtml}
      <div style="display:flex; justify-content:flex-end; gap:8px;">
        <button type="button" class="btn-secondary-comic" style="padding:7px 12px; font-size:11.5px;" onclick="exportMarketplacePackFile('${esc(pack.id)}')">📤 Export .chubpack.json</button>
      </div>
    `;
  }

  /* --------------------------------------------------------------------------
     INSTALL / UNINSTALL PACK INTO LIVE STUDIO
     -------------------------------------------------------------------------- */
  function installMarketplacePack(packId) {
    const pack = getPackById(packId);
    const bridge = api();
    if (!pack || !bridge) {
      toast('⚠️ Studio bridge not ready yet.');
      return;
    }

    const items = pack.items || {};
    let installedSummary = [];

    if (Array.isArray(items.characters) && items.characters.length > 0) {
      const count = bridge.installCharacters(pack.id, items.characters);
      installedSummary.push(`${count} character${count === 1 ? '' : 's'}`);
    }
    if (Array.isArray(items.stickers) && items.stickers.length > 0) {
      const count = bridge.installStickers(pack.id, items.stickers);
      installedSummary.push(`${count} sticker${count === 1 ? '' : 's'}`);
    }
    if (Array.isArray(items.audio) && items.audio.length > 0) {
      const count = bridge.installAudioClips(pack.id, items.audio);
      installedSummary.push(`${count} audio clip${count === 1 ? '' : 's'}`);
    }
    if (items.theme) {
      bridge.applyThemePack(items.theme);
      installedSummary.push('theme & VFX skin');
    }
    if (Array.isArray(items.templates) && items.templates.length > 0) {
      const count = bridge.installTemplates(pack.id, items.templates);
      installedSummary.push(`${count} story template${count === 1 ? '' : 's'}`);
    }
    if (Array.isArray(items.sysIcons) && items.sysIcons.length > 0 && typeof bridge.installSystemIcons === 'function') {
      const count = bridge.installSystemIcons(pack.id, items.sysIcons);
      installedSummary.push(`${count} vector icon${count === 1 ? '' : 's'}`);
    }
    if (Array.isArray(items.sysPresets) && items.sysPresets.length > 0 && typeof bridge.installSystemPresets === 'function') {
      const count = bridge.installSystemPresets(pack.id, items.sysPresets);
      installedSummary.push(`${count} system style${count === 1 ? '' : 's'}`);
    }

    if (!state.installedPackIds.includes(pack.id)) {
      state.installedPackIds.push(pack.id);
      state.installCounts[pack.id] = Number(state.installCounts[pack.id] || 0) + 1;
      state.ledger.unshift({
        id: 'tx_' + Date.now(),
        packId: pack.id,
        packTitle: pack.title,
        author: pack.author,
        isOwnPack: !pack.isOfficial,
        grossUsd: 0,
        plannedPriceUsd: Number(pack.plannedPriceUsd || 0),
        timestamp: new Date().toISOString()
      });
      if (state.ledger.length > 60) state.ledger.length = 60;
    }

    saveMarketplaceStorage();
    renderAllMarketplaceViews();
    toast(`🎉 Installed "${pack.title}" (${installedSummary.join(', ') || 'ready'})!`);
  }

  function uninstallMarketplacePack(packId) {
    const pack = getPackById(packId);
    const bridge = api();
    if (!bridge) return;
    bridge.uninstallPack(packId);
    state.installedPackIds = state.installedPackIds.filter(id => id !== packId);
    saveMarketplaceStorage();
    renderAllMarketplaceViews();
    toast(`🗑️ Removed "${pack ? pack.title : 'Pack'}" items from studio`);
  }

  /* --------------------------------------------------------------------------
     TAB 2: CREATE & PUBLISH YOUR OWN PACK ("MAKE, ADD & SELL")
     -------------------------------------------------------------------------- */
  function renderCreateBuilder() {
    const bridge = api();
    if (!bridge) return;

    const chars = bridge.getCharacters() || [];
    const stickers = bridge.getStickers() || [];
    const audios = bridge.getAudioClips() || [];
    const groupProf = bridge.getGroupProfile() || {};
    const messages = bridge.getMessages() || [];

    const nameEl = document.getElementById('mktAuthorNameInput');
    const handleEl = document.getElementById('mktAuthorHandleInput');
    if (nameEl && !nameEl.value) nameEl.value = state.creatorProfile.name || 'Indie Creator';
    if (handleEl && !handleEl.value) handleEl.value = state.creatorProfile.handle || '@my_studio';

    const charListEl = document.getElementById('mktPickCharsList');
    if (charListEl) {
      charListEl.innerHTML = chars.length === 0
        ? '<div style="font-size:11.5px; color:#64748b;">No characters in studio yet.</div>'
        : chars.map(c => `
            <label class="mkt-pick-row">
              <input type="checkbox" class="mkt-pick-char-cb" value="${esc(c.id)}">
              <img src="${esc(sanitizeUrl(c.avatar))}" alt="${esc(c.name)}">
              <div style="flex:1; min-width:0;">
                <div style="font-weight:800; color:#f8fafc;">${esc(c.name)}</div>
                <div style="font-size:10.5px; color:#94a3b8;">${Object.keys(c.expressions || {}).length} expressions • ${esc(c.side)}</div>
              </div>
            </label>
          `).join('');
    }

    const stkListEl = document.getElementById('mktPickStickersList');
    if (stkListEl) {
      stkListEl.innerHTML = stickers.length === 0
        ? '<div style="font-size:11.5px; color:#64748b;">No custom stickers/photos uploaded in Studio yet (or upload below).</div>'
        : stickers.map(s => `
            <label class="mkt-pick-row">
              <input type="checkbox" class="mkt-pick-stk-cb" value="${esc(s.id)}">
              ${s.imageUrl ? `<img src="${esc(sanitizeUrl(s.imageUrl))}" alt="${esc(s.label)}" style="border-radius:6px;">` : '<span>🖼️</span>'}
              <div style="flex:1; min-width:0;">
                <div style="font-weight:800; color:#f8fafc;">${esc(s.label || 'Sticker')}</div>
                <div style="font-size:10.5px; color:#94a3b8;">${esc(s.mediaType || (s.isSticker ? 'sticker' : 'image'))}</div>
              </div>
            </label>
          `).join('');
    }

    const audListEl = document.getElementById('mktPickAudioList');
    if (audListEl) {
      audListEl.innerHTML = audios.length === 0
        ? '<div style="font-size:11.5px; color:#64748b;">No custom audio clips uploaded in Studio yet.</div>'
        : audios.map(a => `
            <label class="mkt-pick-row">
              <input type="checkbox" class="mkt-pick-aud-cb" value="${esc(a.id)}">
              <span>🎵</span>
              <div style="flex:1; min-width:0;">
                <div style="font-weight:800; color:#f8fafc;">${esc(a.label || 'Audio')}</div>
              </div>
            </label>
          `).join('');
    }

    const extrasEl = document.getElementById('mktPickExtrasList');
    if (extrasEl) {
      const hasCustomWall = groupProf.wallpaper === 'wall-custom' && groupProf.customWallpaperData;
      const curScriptTitle = bridge.getCurrentStoryTitle() || 'Current Chat Story';
      const sysStyles = typeof bridge.getSystemPresets === 'function' ? bridge.getSystemPresets() : [];
      const sysIcons = typeof bridge.getSystemIcons === 'function' ? bridge.getSystemIcons() : [];
      extrasEl.innerHTML = `
        <label class="mkt-pick-row">
          <input type="checkbox" id="mktIncludeCurrentScriptCb">
          <span>📜</span>
          <div style="flex:1;">
            <div style="font-weight:800; color:#f8fafc;">Include Current Story Script (${messages.length} lines)</div>
            <div style="font-size:10.5px; color:#94a3b8;">"${esc(curScriptTitle)}"</div>
          </div>
        </label>
        <label class="mkt-pick-row">
          <input type="checkbox" id="mktIncludeCurrentThemeCb">
          <span>🎨</span>
          <div style="flex:1;">
            <div style="font-weight:800; color:#f8fafc;">Include Active VFX Skin & ${hasCustomWall ? 'Custom Wallpaper' : 'Theme Style'}</div>
            <div style="font-size:10.5px; color:#94a3b8;">VFX: ${esc(bridge.getVfxSkin())} • Chat: ${esc(bridge.getChatStyle())}</div>
          </div>
        </label>
        ${sysStyles.length > 0 || sysIcons.length > 0 ? `
          <label class="mkt-pick-row">
            <input type="checkbox" id="mktIncludeSystemAssetsCb">
            <span>🖥️</span>
            <div style="flex:1;">
              <div style="font-weight:800; color:#f8fafc;">Include My Saved System Cards & Custom Icons</div>
              <div style="font-size:10.5px; color:#38bdf8;">${sysStyles.length} saved style${sysStyles.length === 1 ? '' : 's'} • ${sysIcons.length} custom icon${sysIcons.length === 1 ? '' : 's'}</div>
            </div>
          </label>
        ` : ''}
      `;
    }

    renderDraftInlineUploads();
    updateCommissionPreview();
  }

  function renderDraftInlineUploads() {
    const box = document.getElementById('mktDraftUploadsPreview');
    if (!box) return;
    const chips = [];
    draftState.uploadedCharacters.forEach((c, idx) => {
      chips.push(`<span class="mkt-draft-chip"><img src="${esc(c.avatar)}"><span>🎭 ${esc(c.name)}</span><button type="button" style="background:none;border:none;color:#f87171;cursor:pointer;" onclick="removeMarketplaceDraftUpload('char', ${idx})">✕</button></span>`);
    });
    draftState.uploadedStickers.forEach((s, idx) => {
      chips.push(`<span class="mkt-draft-chip"><img src="${esc(s.imageUrl)}"><span>🖼️ ${esc(s.label)}</span><button type="button" style="background:none;border:none;color:#f87171;cursor:pointer;" onclick="removeMarketplaceDraftUpload('stk', ${idx})">✕</button></span>`);
    });
    draftState.uploadedAudio.forEach((a, idx) => {
      chips.push(`<span class="mkt-draft-chip"><span>🎵 ${esc(a.label)}</span><button type="button" style="background:none;border:none;color:#f87171;cursor:pointer;" onclick="removeMarketplaceDraftUpload('aud', ${idx})">✕</button></span>`);
    });
    if (draftState.uploadedWallpaper) {
      chips.push(`<span class="mkt-draft-chip"><img src="${esc(draftState.uploadedWallpaper)}"><span>🖼️ Custom Wallpaper</span><button type="button" style="background:none;border:none;color:#f87171;cursor:pointer;" onclick="removeMarketplaceDraftUpload('wall', 0)">✕</button></span>`);
    }
    box.innerHTML = chips.length > 0
      ? chips.join('')
      : '<span style="font-size:11px; color:#64748b;">No direct files added yet (pick from Studio on the left or upload art/audio below).</span>';
  }

  function removeMarketplaceDraftUpload(kind, idx) {
    if (kind === 'char') draftState.uploadedCharacters.splice(idx, 1);
    else if (kind === 'stk') draftState.uploadedStickers.splice(idx, 1);
    else if (kind === 'aud') draftState.uploadedAudio.splice(idx, 1);
    else if (kind === 'wall') draftState.uploadedWallpaper = null;
    renderDraftInlineUploads();
  }

  function handleMarketplaceQuickUpload(event, uploadKind) {
    const files = Array.from((event.target && event.target.files) || []);
    if (files.length === 0) return;

    files.forEach((file, i) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const dataUrl = ev.target.result;
        if (!isSafeMediaUrl(dataUrl)) {
          toast('⚠️ Unsupported or unsafe file format.');
          return;
        }
        const label = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]+/g, ' ').trim().slice(0, 22) || 'Asset';
        if (uploadKind === 'character') {
          draftState.uploadedCharacters.push({
            sourceId: 'u_char_' + Date.now() + '_' + i,
            name: label,
            side: 'left',
            color: '#38bdf8',
            pitch: 1.05,
            avatar: dataUrl,
            expressions: { normal: dataUrl }
          });
        } else if (uploadKind === 'sticker') {
          draftState.uploadedStickers.push({
            sourceId: 'u_stk_' + Date.now() + '_' + i,
            label: label.toUpperCase(),
            imageUrl: dataUrl,
            expr: 'normal',
            sfx: 'pop'
          });
        } else if (uploadKind === 'audio') {
          draftState.uploadedAudio.push({
            sourceId: 'u_aud_' + Date.now() + '_' + i,
            label: label.toUpperCase(),
            data: dataUrl
          });
        } else if (uploadKind === 'wallpaper') {
          draftState.uploadedWallpaper = dataUrl;
        }
        renderDraftInlineUploads();
        toast(`✅ Added "${label}" to pack draft!`);
      };
      reader.readAsDataURL(file);
    });
    event.target.value = '';
  }

  function updateCommissionPreview() {
    const sel = document.getElementById('mktPlannedPriceSelect');
    const outEl = document.getElementById('mktCommissionBreakdown');
    if (!sel || !outEl) return;

    const planned = parseFloat(sel.value || '0') || 0;
    if (planned <= 0) {
      outEl.innerHTML = `
        <div class="mkt-commission-row"><span>Launch Price (Now):</span><strong style="color:#4ade80;">FREE (\$0.00)</strong></div>
        <div class="mkt-commission-row"><span>Future Tier:</span><strong>Free Community Pack (0% Fee)</strong></div>
      `;
      return;
    }

    const platformFee = planned * COMMISSION_RATE;
    const creatorNet = planned - platformFee;
    outEl.innerHTML = `
      <div class="mkt-commission-row"><span>Launch Price (Now):</span><strong style="color:#4ade80;">FREE (\$0.00)</strong></div>
      <div class="mkt-commission-row"><span>Planned Future Price:</span><strong>\$${planned.toFixed(2)}</strong></div>
      <div class="mkt-commission-row"><span>Your Earnings (80%):</span><strong style="color:#34d399;">\$${creatorNet.toFixed(2)} / sale</strong></div>
      <div class="mkt-commission-row"><span>Platform Commission (20%):</span><strong style="color:#38bdf8;">\$${platformFee.toFixed(2)} / sale</strong></div>
    `;
  }

  function buildPackObjectFromBuilder() {
    const bridge = api();
    if (!bridge) return null;

    const title = (document.getElementById('mktPackTitleInput')?.value || '').trim();
    const category = document.getElementById('mktPackCategorySelect')?.value || 'characters';
    const desc = (document.getElementById('mktPackDescInput')?.value || '').trim();
    const tagsRaw = (document.getElementById('mktPackTagsInput')?.value || '').trim();
    const author = (document.getElementById('mktAuthorNameInput')?.value || '').trim() || 'Indie Creator';
    const authorHandle = (document.getElementById('mktAuthorHandleInput')?.value || '').trim() || '@creator';
    const plannedPriceUsd = parseFloat(document.getElementById('mktPlannedPriceSelect')?.value || '0') || 0;
    const attestCb = document.getElementById('mktAttestOriginalCb');

    if (!title) {
      toast('⚠️ Enter a Pack Title before publishing!');
      return null;
    }
    if (attestCb && !attestCb.checked) {
      toast('⚠️ Please confirm your pack contains original / authorized assets.');
      return null;
    }

    state.creatorProfile = { ...state.creatorProfile, name: author, handle: authorHandle };

    const items = {};
    const studioChars = bridge.getCharacters() || [];
    const studioStickers = bridge.getStickers() || [];
    const studioAudio = bridge.getAudioClips() || [];

    // Characters
    const selectedCharIds = Array.from(document.querySelectorAll('.mkt-pick-char-cb:checked')).map(cb => cb.value);
    const pickedChars = studioChars
      .filter(c => selectedCharIds.includes(c.id))
      .map(c => ({
        sourceId: c.id,
        name: c.name,
        side: c.side || 'left',
        color: c.color || '#38bdf8',
        pitch: c.pitch || 1.05,
        role: c.role || '',
        avatar: sanitizeUrl(c.avatar),
        expressions: Object.fromEntries(
          Object.entries(c.expressions || {}).filter(([, v]) => isSafeMediaUrl(v))
        )
      }));
    const allChars = [...pickedChars, ...draftState.uploadedCharacters];
    if (allChars.length > 0) items.characters = allChars;

    // Stickers
    const selectedStkIds = Array.from(document.querySelectorAll('.mkt-pick-stk-cb:checked')).map(cb => cb.value);
    const pickedStks = studioStickers
      .filter(s => selectedStkIds.includes(s.id))
      .map(s => ({
        sourceId: s.id,
        label: s.label || 'STICKER',
        imageUrl: sanitizeUrl(s.imageUrl || s.data || s.url),
        expr: s.expr || 'normal',
        sfx: s.sfx || 'pop'
      }))
      .filter(s => s.imageUrl);
    const allStks = [...pickedStks, ...draftState.uploadedStickers];
    if (allStks.length > 0) items.stickers = allStks;

    // Audio
    const selectedAudIds = Array.from(document.querySelectorAll('.mkt-pick-aud-cb:checked')).map(cb => cb.value);
    const pickedAuds = studioAudio
      .filter(a => selectedAudIds.includes(a.id))
      .map(a => ({
        sourceId: a.id,
        label: a.label || 'Audio',
        data: sanitizeUrl(a.data)
      }))
      .filter(a => a.data);
    const allAuds = [...pickedAuds, ...draftState.uploadedAudio];
    if (allAuds.length > 0) items.audio = allAuds;

    // Story script
    if (document.getElementById('mktIncludeCurrentScriptCb')?.checked) {
      const scriptText = bridge.exportCurrentChatAsScript();
      if (scriptText && scriptText.trim()) {
        items.templates = [{
          sourceId: 'tpl_' + Date.now(),
          title: bridge.getCurrentStoryTitle() || title,
          desc: desc || 'Creator story script template',
          cast: studioChars.map(c => c.name),
          script: scriptText
        }];
      }
    }

    // Theme / Wallpaper
    const includeTheme = document.getElementById('mktIncludeCurrentThemeCb')?.checked;
    if (draftState.uploadedWallpaper || includeTheme) {
      const gp = bridge.getGroupProfile() || {};
      items.theme = {
        wallpaper: draftState.uploadedWallpaper ? 'wall-custom' : (gp.wallpaper || 'wall-doodle'),
        customWallpaperData: draftState.uploadedWallpaper || (gp.wallpaper === 'wall-custom' ? sanitizeUrl(gp.customWallpaperData) : null),
        vfxSkin: bridge.getVfxSkin(),
        chatStyle: bridge.getChatStyle()
      };
    }

    // System UI Presets & Custom Vector Icons
    if (document.getElementById('mktIncludeSystemAssetsCb')?.checked) {
      const sysStyles = typeof bridge.getSystemPresets === 'function' ? bridge.getSystemPresets() : [];
      const sysIcons = typeof bridge.getSystemIcons === 'function' ? bridge.getSystemIcons() : [];
      if (sysStyles.length > 0) {
        items.sysPresets = sysStyles.map((p, idx) => ({ sourceId: 'sp_' + idx, name: p.name, config: p.config }));
      }
      if (sysIcons.length > 0) {
        items.sysIcons = sysIcons.map(ci => ({ id: ci.id, label: ci.label, svg: ci.svg, imageUrl: ci.imageUrl }));
      }
    }

    const totalItems =
      (items.characters ? items.characters.length : 0) +
      (items.stickers ? items.stickers.length : 0) +
      (items.audio ? items.audio.length : 0) +
      (items.templates ? items.templates.length : 0) +
      (items.sysPresets ? items.sysPresets.length : 0) +
      (items.sysIcons ? items.sysIcons.length : 0) +
      (items.theme ? 1 : 0);

    if (totalItems === 0) {
      toast('⚠️ Select at least 1 Studio asset or upload a file to package!');
      return null;
    }

    const coverImage =
      (allChars[0] && allChars[0].avatar) ||
      (allStks[0] && allStks[0].imageUrl) ||
      (items.theme && items.theme.customWallpaperData) ||
      makeStickerSvgDataUri(title.slice(0, 10).toUpperCase(), 'CREATOR', '#1e293b', '#312e81', '#facc15');

    const tags = tagsRaw
      ? tagsRaw.split(',').map(t => t.trim()).filter(Boolean).slice(0, 5)
      : [category, 'Original', 'Free'];

    return {
      format: 'ChatHub_Marketplace_Pack',
      version: '1.0',
      id: draftState.editingPackId || ('mkt_user_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6)),
      title,
      category,
      author,
      authorHandle: authorHandle.startsWith('@') ? authorHandle : '@' + authorHandle,
      verified: false,
      isOfficial: false,
      priceUsd: 0,
      plannedPriceUsd,
      license: 'Free Creator Launch License',
      description: desc || `Custom ${category} pack created by ${author}.`,
      tags,
      coverImage,
      baseInstalls: 0,
      createdAt: Date.now(),
      items
    };
  }

  function publishMarketplacePack(alsoDownloadFile = false) {
    const pack = buildPackObjectFromBuilder();
    if (!pack) return;

    const existingIdx = state.userPacks.findIndex(p => p.id === pack.id);
    if (existingIdx >= 0) {
      state.userPacks[existingIdx] = pack;
    } else {
      state.userPacks.unshift(pack);
    }

    draftState = {
      editingPackId: null,
      uploadedStickers: [],
      uploadedCharacters: [],
      uploadedAudio: [],
      uploadedWallpaper: null
    };

    const titleInp = document.getElementById('mktPackTitleInput');
    const descInp = document.getElementById('mktPackDescInput');
    const tagsInp = document.getElementById('mktPackTagsInput');
    if (titleInp) titleInp.value = '';
    if (descInp) descInp.value = '';
    if (tagsInp) tagsInp.value = '';

    saveMarketplaceStorage();
    if (alsoDownloadFile) {
      downloadPackJson(pack);
    }
    toast(`🎉 Published "${pack.title}" to the Marketplace (FREE)!`);
    switchMarketplaceTab('browse');
  }

  /* --------------------------------------------------------------------------
     PORTABLE .CHUBPACK.JSON EXPORT & IMPORT
     -------------------------------------------------------------------------- */
  function downloadPackJson(pack) {
    if (!pack) return;
    const payload = {
      format: 'ChatHub_Marketplace_Pack',
      version: '1.0',
      ...pack
    };
    const jsonStr = JSON.stringify(payload, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const safeName = (pack.title || 'chathub_pack').toLowerCase().replace(/[^a-z0-9]+/g, '_');
    a.href = url;
    a.download = `${safeName}.chubpack.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function exportMarketplacePackFile(packId) {
    const pack = getPackById(packId);
    if (!pack) return;
    downloadPackJson(pack);
    toast(`📤 Exported "${pack.title}.chubpack.json"!`);
  }

  function sanitizeImportedPack(raw) {
    if (!raw || typeof raw !== 'object' || !raw.items || typeof raw.items !== 'object') {
      throw new Error('Invalid .chubpack.json structure');
    }
    const items = {};
    if (Array.isArray(raw.items.characters)) {
      items.characters = raw.items.characters.map((c, idx) => {
        const cleanExprs = {};
        Object.entries(c.expressions || {}).forEach(([k, v]) => {
          const cleanKey = String(k).toLowerCase().replace(/[^a-z0-9_]/g, '');
          if (cleanKey && isSafeMediaUrl(v)) cleanExprs[cleanKey] = v.trim();
        });
        const avatar = sanitizeUrl(c.avatar) || Object.values(cleanExprs)[0] || '';
        return {
          sourceId: String(c.sourceId || c.id || ('imp_c_' + idx)),
          name: String(c.name || 'Character').slice(0, 32),
          side: c.side === 'right' ? 'right' : 'left',
          color: /^#[0-9a-fA-F]{3,8}$/.test(c.color || '') ? c.color : '#38bdf8',
          pitch: Math.max(0.5, Math.min(2.0, Number(c.pitch) || 1.05)),
          role: String(c.role || '').slice(0, 32),
          avatar,
          expressions: cleanExprs
        };
      });
    }
    if (Array.isArray(raw.items.stickers)) {
      items.stickers = raw.items.stickers
        .map((s, idx) => ({
          sourceId: String(s.sourceId || s.id || ('imp_s_' + idx)),
          label: String(s.label || 'STICKER').slice(0, 24),
          imageUrl: sanitizeUrl(s.imageUrl || s.data || s.url),
          expr: String(s.expr || 'normal').slice(0, 16),
          sfx: s.sfx ? String(s.sfx).slice(0, 20) : 'pop'
        }))
        .filter(s => s.imageUrl);
    }
    if (Array.isArray(raw.items.audio)) {
      items.audio = raw.items.audio
        .map((a, idx) => ({
          sourceId: String(a.sourceId || a.id || ('imp_a_' + idx)),
          label: String(a.label || 'Audio').slice(0, 24),
          data: sanitizeUrl(a.data)
        }))
        .filter(a => a.data);
    }
    if (Array.isArray(raw.items.templates)) {
      items.templates = raw.items.templates
        .map((t, idx) => ({
          sourceId: String(t.sourceId || t.id || ('imp_t_' + idx)),
          title: String(t.title || 'Imported Script').slice(0, 80),
          desc: String(t.desc || '').slice(0, 200),
          cast: Array.isArray(t.cast) ? t.cast.map(n => String(n).slice(0, 28)) : [],
          script: String(t.script || '')
        }))
        .filter(t => t.script.trim());
    }
    if (raw.items.theme && typeof raw.items.theme === 'object') {
      items.theme = {
        wallpaper: String(raw.items.theme.wallpaper || 'wall-doodle'),
        customWallpaperData: sanitizeUrl(raw.items.theme.customWallpaperData) || null,
        vfxSkin: String(raw.items.theme.vfxSkin || 'sakuga'),
        chatStyle: raw.items.theme.chatStyle === 'realistic' ? 'realistic' : 'comic'
      };
    }
    if (Array.isArray(raw.items.sysIcons)) {
      items.sysIcons = raw.items.sysIcons.map((ic, idx) => {
        let svg = typeof ic.svg === 'string' ? ic.svg.trim() : '';
        svg = svg.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<foreignObject[\s\S]*?<\/foreignObject>/gi, '').replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '').replace(/javascript\s*:/gi, '');
        return {
          id: String(ic.id || ('imp_ico_' + idx)).replace(/[^a-zA-Z0-9_-]/g, ''),
          label: String(ic.label || 'Icon').slice(0, 18),
          svg: /^<svg[\s>]/i.test(svg) ? svg : '',
          imageUrl: sanitizeUrl(ic.imageUrl)
        };
      }).filter(ic => ic.svg || ic.imageUrl);
    }
    if (Array.isArray(raw.items.sysPresets)) {
      items.sysPresets = raw.items.sysPresets.filter(sp => sp && sp.config && typeof sp.config === 'object').map((sp, idx) => ({
        sourceId: String(sp.sourceId || ('imp_sp_' + idx)),
        name: String(sp.name || sp.config.headerTitle || 'System Card').slice(0, 32),
        config: sp.config
      }));
    }

    const allowedCats = ['characters', 'syspacks', 'stickers', 'themes', 'audio', 'stories'];
    const category = allowedCats.includes(raw.category) ? raw.category : 'characters';
    return {
      format: 'ChatHub_Marketplace_Pack',
      version: '1.0',
      id: 'mkt_imp_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
      title: String(raw.title || 'Imported Creator Pack').slice(0, 64),
      category,
      author: String(raw.author || 'Community Creator').slice(0, 32),
      authorHandle: String(raw.authorHandle || '@community').slice(0, 32),
      verified: false,
      isOfficial: false,
      priceUsd: 0,
      plannedPriceUsd: Math.max(0, Number(raw.plannedPriceUsd) || 0),
      license: String(raw.license || 'Creator Shared Pack').slice(0, 64),
      description: String(raw.description || 'Imported community pack.').slice(0, 240),
      tags: Array.isArray(raw.tags) ? raw.tags.map(t => String(t).slice(0, 20)).slice(0, 5) : ['Imported'],
      coverImage: sanitizeUrl(raw.coverImage),
      baseInstalls: 0,
      createdAt: Date.now(),
      items
    };
  }

  function handleMarketplacePackFileImport(event) {
    const file = event.target && event.target.files && event.target.files[0];
    if (!file) return;
    file.text().then(text => {
      const raw = JSON.parse(text);
      const cleanPack = sanitizeImportedPack(raw);
      state.userPacks.unshift(cleanPack);
      saveMarketplaceStorage();
      installMarketplacePack(cleanPack.id);
      switchMarketplaceTab('browse');
      toast(`📥 Imported & installed "${cleanPack.title}"!`);
    }).catch(err => {
      toast('⚠️ Failed to import pack: ' + (err.message || 'Invalid JSON'));
    }).finally(() => {
      event.target.value = '';
    });
  }

  /* --------------------------------------------------------------------------
     TAB 3: MY SHOP, INSTALLED PACKS & COMMISSION PROJECTION
     -------------------------------------------------------------------------- */
  function saveCreatorProfileFromShop() {
    const name = (document.getElementById('mktShopProfileName')?.value || '').trim() || 'Indie Creator';
    const handle = (document.getElementById('mktShopProfileHandle')?.value || '').trim() || '@my_studio';
    const bio = (document.getElementById('mktShopProfileBio')?.value || '').trim();
    state.creatorProfile = {
      name,
      handle: handle.startsWith('@') ? handle : '@' + handle,
      bio
    };
    saveMarketplaceStorage();
    toast('💾 Creator shop profile saved!');
    renderMyShopDashboard();
  }

  function deleteUserPublishedPack(packId) {
    const target = state.userPacks.find(p => p.id === packId);
    state.userPacks = state.userPacks.filter(p => p.id !== packId);
    saveMarketplaceStorage();
    renderAllMarketplaceViews();
    toast(`🗑️ Deleted "${target ? target.title : 'Pack'}" from your shop`);
  }

  function renderMyShopDashboard() {
    const profileBox = document.getElementById('mktShopProfileCard');
    const statsBox = document.getElementById('mktShopStatsStrip');
    const publishedBox = document.getElementById('mktMyPublishedList');
    const installedBox = document.getElementById('mktInstalledPacksList');

    if (profileBox) {
      profileBox.innerHTML = `
        <div class="mkt-section-head">
          <span>👤 Creator Seller Profile</span>
          <span class="mkt-header-badge">Launch Mode: 0% Platform Fee</span>
        </div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
          <div>
            <label class="form-label" style="font-size:10.5px;">Display Name</label>
            <input type="text" class="form-input" id="mktShopProfileName" value="${esc(state.creatorProfile.name)}">
          </div>
          <div>
            <label class="form-label" style="font-size:10.5px;">Creator Handle</label>
            <input type="text" class="form-input" id="mktShopProfileHandle" value="${esc(state.creatorProfile.handle)}">
          </div>
        </div>
        <div>
          <label class="form-label" style="font-size:10.5px;">Shop Bio</label>
          <input type="text" class="form-input" id="mktShopProfileBio" value="${esc(state.creatorProfile.bio)}">
        </div>
        <div style="display:flex; justify-content:flex-end;">
          <button type="button" class="btn-primary-comic" style="padding:7px 16px; font-size:12px;" onclick="saveMarketplaceShopProfile()">💾 Save Seller Profile</button>
        </div>
      `;
    }

    const totalMyInstalls = state.userPacks.reduce((acc, p) => acc + Number(state.installCounts[p.id] || 0), 0);
    const projectedGross = state.userPacks.reduce((acc, p) => {
      const cnt = Number(state.installCounts[p.id] || 0);
      return acc + cnt * Number(p.plannedPriceUsd || 0);
    }, 0);
    const projectedCreatorNet = projectedGross * (1 - COMMISSION_RATE);

    if (statsBox) {
      statsBox.innerHTML = `
        <div class="mkt-stat-card">
          <span class="mkt-stat-label">Published Packs</span>
          <span class="mkt-stat-val" style="color:#38bdf8;">${state.userPacks.length}</span>
        </div>
        <div class="mkt-stat-card">
          <span class="mkt-stat-label">Installed Packs</span>
          <span class="mkt-stat-val" style="color:#4ade80;">${state.installedPackIds.length}</span>
        </div>
        <div class="mkt-stat-card">
          <span class="mkt-stat-label">My Pack Installs</span>
          <span class="mkt-stat-val">${totalMyInstalls}</span>
        </div>
        <div class="mkt-stat-card">
          <span class="mkt-stat-label">Est. Future Payout (80%)</span>
          <span class="mkt-stat-val" style="color:#facc15;">\$${projectedCreatorNet.toFixed(2)}</span>
        </div>
      `;
    }

    if (publishedBox) {
      publishedBox.innerHTML = state.userPacks.length === 0
        ? `
          <div style="text-align:center; padding:18px; color:#94a3b8; font-size:12px; border:1px dashed #334155; border-radius:12px;">
            You haven't published any packs yet. Package your characters, stickers, or scripts in <b>Create Pack</b>!
            <div style="margin-top:8px;">
              <button type="button" class="btn-primary-comic" style="padding:6px 14px; font-size:11.5px;" onclick="switchMarketplaceTab('create')">✨ Create Your First Pack</button>
            </div>
          </div>
        `
        : state.userPacks.map(p => {
            const cnt = Number(state.installCounts[p.id] || 0);
            const futurePrice = Number(p.plannedPriceUsd || 0);
            return `
              <div class="asset-item-card">
                <div class="asset-thumb-wrap" style="width:48px; height:48px; min-width:48px;">
                  <img src="${esc(sanitizeUrl(p.coverImage))}" alt="${esc(p.title)}">
                </div>
                <div class="asset-info-col">
                  <div class="asset-title-row">
                    <span class="asset-item-title">${esc(p.title)}</span>
                    <span class="asset-badge" style="background:#065f46; color:#6ee7b7;">FREE NOW</span>
                    ${futurePrice > 0 ? `<span class="asset-badge" style="background:#1e293b; color:#facc15;">Future \$${futurePrice.toFixed(2)}</span>` : ''}
                  </div>
                  <div style="font-size:11px; color:#94a3b8;">${categoryLabel(p.category)} • ${cnt} local install${cnt === 1 ? '' : 's'}</div>
                </div>
                <div class="asset-actions-row">
                  <button type="button" class="icon-btn" style="padding:4px 8px; font-size:11px;" onclick="openMarketplacePreview('${esc(p.id)}')">👁️ View</button>
                  <button type="button" class="icon-btn" style="padding:4px 8px; font-size:11px; background:#0284c7; color:#fff;" onclick="exportMarketplacePackFile('${esc(p.id)}')">📤 Share</button>
                  <button type="button" class="icon-btn danger" style="padding:4px 8px; font-size:11px;" onclick="deleteMarketplaceUserPack('${esc(p.id)}')">🗑️</button>
                </div>
              </div>
            `;
          }).join('');
    }

    if (installedBox) {
      const installedPacks = state.installedPackIds.map(id => getPackById(id)).filter(Boolean);
      installedBox.innerHTML = installedPacks.length === 0
        ? '<div style="font-size:12px; color:#64748b;">No Marketplace packs installed yet. Browse the Discover tab to add free characters, stickers, themes, and scripts!</div>'
        : installedPacks.map(p => `
            <div class="asset-item-card">
              <div class="asset-thumb-wrap" style="width:44px; height:44px; min-width:44px;">
                <img src="${esc(sanitizeUrl(p.coverImage))}" alt="${esc(p.title)}">
              </div>
              <div class="asset-info-col">
                <div class="asset-title-row">
                  <span class="asset-item-title">${esc(p.title)}</span>
                  <span class="asset-badge" style="background:#1e293b; color:#38bdf8;">${categoryLabel(p.category)}</span>
                </div>
                <div style="font-size:11px; color:#94a3b8;">by ${esc(p.author)}</div>
              </div>
              <div class="asset-actions-row">
                <button type="button" class="icon-btn" style="padding:4px 8px; font-size:11px; background:#00a884; color:#fff;" onclick="installMarketplacePack('${esc(p.id)}')">🔄 Sync</button>
                <button type="button" class="icon-btn danger" style="padding:4px 8px; font-size:11px;" onclick="uninstallMarketplacePack('${esc(p.id)}')">Uninstall</button>
              </div>
            </div>
          `).join('');
    }
  }

  /* --------------------------------------------------------------------------
     GLOBAL EXPORTS
     -------------------------------------------------------------------------- */
  window.ChatHubMarketplace = {
    open: openMarketplaceModal,
    close: closeMarketplaceModal,
    refresh: renderAllMarketplaceViews,
    getAllPacks,
    getPackById,
    installPack: installMarketplacePack,
    uninstallPack: uninstallMarketplacePack
  };

  window.openMarketplaceModal = openMarketplaceModal;
  window.closeMarketplaceModal = closeMarketplaceModal;
  window.switchMarketplaceTab = switchMarketplaceTab;
  window.setMarketplaceCategory = setMarketplaceCategory;
  window.setMarketplaceSearch = setMarketplaceSearch;
  window.setMarketplaceSort = setMarketplaceSort;
  window.loadMoreMarketplacePacks = loadMoreMarketplacePacks;
  window.showAllMarketplacePacks = showAllMarketplacePacks;
  window.openMarketplacePreview = openMarketplacePreview;
  window.closeMarketplacePreview = closeMarketplacePreview;
  window.setMarketplacePreviewExpr = setPreviewCharExpr;
  window.previewMarketplaceStickerSound = previewStickerSound;
  window.playMarketplacePreviewAudio = (packId, idx) => {
    const p = getPackById(packId);
    const clip = p && p.items && p.items.audio && p.items.audio[idx];
    if (clip && clip.data && api()) api().playCustomAudio(clip.data);
  };
  window.playMarketplaceTemplateDemo = (packId, idx) => {
    const p = getPackById(packId);
    const tpl = p && p.items && p.items.templates && p.items.templates[idx];
    if (!tpl || !api()) return;
    if (!isPackInstalled(packId)) installMarketplacePack(packId);
    closeMarketplacePreview();
    closeMarketplaceModal();
    api().loadAndPlayScript(tpl.script, tpl.title, true);
  };
  window.installMarketplacePack = installMarketplacePack;
  window.uninstallMarketplacePack = uninstallMarketplacePack;
  window.handleMarketplaceQuickUpload = handleMarketplaceQuickUpload;
  window.removeMarketplaceDraftUpload = removeMarketplaceDraftUpload;
  window.updateMarketplaceCommissionPreview = updateCommissionPreview;
  window.publishMarketplacePack = publishMarketplacePack;
  window.exportMarketplacePackFile = exportMarketplacePackFile;
  window.handleMarketplacePackFileImport = handleMarketplacePackFileImport;
  window.saveMarketplaceShopProfile = saveCreatorProfileFromShop;
  window.deleteMarketplaceUserPack = deleteUserPublishedPack;
})();
