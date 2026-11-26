/* ============================================================================
   CHAT HUB ORIGINAL VFX IDENTITY & LIVE CHAT-BUBBLE STORY ENGINE
   - Preserves finktheartist/sakuga-vfx while adding CHAT HUB's own selectable
     VFX skins (Sakuga Classic, Hunter System, Shonen Clash, Kawaii Pop),
     original comic/manhwa vector stamps & shapes, and live emotion-synced
     chat-bubble, sticker, quest, and cinema playback VFX.
   ============================================================================ */
(() => {
  'use strict';

  const fx = window.SakugaFX;
  if (!fx || typeof fx.add !== 'function') {
    console.warn('ChatHubVfx: SakugaFX core not available.');
    return;
  }

  const SKIN_STORAGE_KEY = 'chathub_vfx_skin';
  const CHAT_VFX_STORAGE_KEY = 'chathub_chat_vfx';

  const VFX_SKINS = {
    sakuga: {
      id: 'sakuga',
      label: 'Sakuga Classic',
      icon: '🌸',
      fill: '#ffffff',
      shade: '#b8b3ff',
      line: '#5a4fd8',
      accent: '#ff5fa8',
      ink: '#1d1a4a',
      sfx: ['#1d1a4a', '#ffffff']
    },
    hunter: {
      id: 'hunter',
      label: 'Hunter System',
      icon: '💠',
      fill: '#e0f2fe',
      shade: '#38bdf8',
      line: '#0284c7',
      accent: '#facc15',
      ink: '#0f172a',
      sfx: ['#0f172a', '#38bdf8']
    },
    shonen: {
      id: 'shonen',
      label: 'Shonen Clash',
      icon: '🔥',
      fill: '#fef9c3',
      shade: '#facc15',
      line: '#dc2626',
      accent: '#fb7185',
      ink: '#111827',
      sfx: ['#111827', '#facc15']
    },
    kawaii: {
      id: 'kawaii',
      label: 'Kawaii Pop',
      icon: '💖',
      fill: '#fff1f2',
      shade: '#fda4af',
      line: '#db2777',
      accent: '#34d399',
      ink: '#3b0764',
      sfx: ['#3b0764', '#fff1f2']
    }
  };

  function readStorage(key, fallback) {
    try {
      const v = localStorage.getItem(key);
      return v === null ? fallback : v;
    } catch (_) {
      return fallback;
    }
  }

  function writeStorage(key, val) {
    try {
      localStorage.setItem(key, String(val));
    } catch (_) {}
  }

  let currentSkinId = readStorage(SKIN_STORAGE_KEY, 'sakuga');
  if (!VFX_SKINS[currentSkinId]) currentSkinId = 'sakuga';
  let chatVfxEnabled = readStorage(CHAT_VFX_STORAGE_KEY, 'true') !== 'false';

  const out = (t) => 1 - (1 - t) ** 3;
  const inn = (t) => t * t * t;
  const back = (t) => 1 + 2.70158 * (t - 1) ** 3 + 1.70158 * (t - 1) ** 2;

  /* ------------------------------------------------------------------------
     1. SKIN & PALETTE SYNC (Updates SakugaFX.P & CSS --sk-* variables live)
     ------------------------------------------------------------------------ */
  function applyVfxSkin(skinId, silent = true) {
    const skin = VFX_SKINS[skinId] || VFX_SKINS.sakuga;
    currentSkinId = skin.id;
    writeStorage(SKIN_STORAGE_KEY, skin.id);

    Object.assign(fx.P, {
      fill: skin.fill,
      shade: skin.shade,
      line: skin.line,
      accent: skin.accent,
      ink: skin.ink,
      sfx: skin.sfx.slice()
    });

    const root = document.documentElement;
    root.style.setProperty('--sk-card', skin.fill);
    root.style.setProperty('--sk-ink', skin.ink);
    root.style.setProperty('--sk-soft', skin.shade);
    root.style.setProperty('--sk-pri', skin.line);
    root.style.setProperty('--sk-acc', skin.accent);
    root.style.setProperty('--sk-btn-line', skin.ink);
    root.style.setProperty('--sk-alt-line', skin.ink);
    root.style.setProperty('--sk-tick', skin.ink);
    root.style.setProperty('--sk-fill', skin.accent);
    root.style.setProperty('--sk-sh', `5px 6px 0 ${skin.shade}`);
    root.style.setProperty('--sk-btn-sh', `5px 6px 0 ${skin.shade}`);
    root.style.setProperty('--sk-alt-sh', `5px 6px 0 ${skin.shade}`);

    document.body.dataset.vfxSkin = skin.id;
    updateChatHubVfxUi();

    if (!silent && typeof window.showToast === 'function') {
      window.showToast(`${skin.icon} VFX Skin: ${skin.label}`);
    }
    return skin;
  }

  function cycleVfxSkin() {
    const keys = Object.keys(VFX_SKINS);
    const next = keys[(keys.indexOf(currentSkinId) + 1) % keys.length];
    return applyVfxSkin(next, false);
  }

  function toggleChatBubbleVfx() {
    chatVfxEnabled = !chatVfxEnabled;
    writeStorage(CHAT_VFX_STORAGE_KEY, chatVfxEnabled ? 'true' : 'false');
    updateChatHubVfxUi();
    if (typeof window.showToast === 'function') {
      window.showToast(chatVfxEnabled ? '💬 Chat Story VFX: ON' : '💬 Chat Story VFX: OFF');
    }
    return chatVfxEnabled;
  }

  function updateChatHubVfxUi() {
    const skin = VFX_SKINS[currentSkinId] || VFX_SKINS.sakuga;

    const menuChatVfx = document.getElementById('menuChatVfxToggleItem');
    if (menuChatVfx) {
      menuChatVfx.innerHTML = `✨ Chat Story VFX: <b style="color:${chatVfxEnabled ? skin.accent : '#94a3b8'};">${chatVfxEnabled ? 'ON' : 'OFF'}</b>`;
    }

    const menuSkinItem = document.getElementById('menuVfxSkinItem');
    if (menuSkinItem) {
      menuSkinItem.innerHTML = `${skin.icon} VFX Skin: <b style="color:${skin.shade};">${skin.label}</b>`;
    }

    const chatBtn = document.getElementById('globalChatVfxToggleBtn');
    const chatIcon = document.getElementById('globalChatVfxIcon');
    const chatLabel = document.getElementById('globalChatVfxLabel');
    if (chatIcon) chatIcon.textContent = chatVfxEnabled ? '✨' : '💬';
    if (chatLabel) chatLabel.textContent = `Chat VFX: ${chatVfxEnabled ? 'ON' : 'OFF'}`;
    if (chatBtn) chatBtn.style.borderColor = chatVfxEnabled ? skin.accent : '#334155';

    document.querySelectorAll('.vfx-skin-pill').forEach((btn) => {
      const active = btn.getAttribute('data-skin') === skin.id;
      btn.classList.toggle('active', active);
      btn.style.borderColor = active ? skin.accent : '#334155';
    });
  }

  /* ------------------------------------------------------------------------
     2. PHONE FRAME CLIP HELPER (Keeps Chat VFX Crisp Inside Chat Frame)
     ------------------------------------------------------------------------ */
  let chatBoundsCache = { now: -1, rect: null };

  function getChatBoundsRect() {
    if (chatBoundsCache.now === fx.now && chatBoundsCache.rect) return chatBoundsCache.rect;
    const wrapper = document.getElementById('phoneWrapper');
    const stream = document.getElementById('chatStream');
    const target = stream || wrapper;
    if (!target || !target.isConnected) {
      chatBoundsCache = { now: fx.now, rect: null };
      return null;
    }
    const r = fx.rectOf ? fx.rectOf(target) : target.getBoundingClientRect();
    chatBoundsCache = { now: fx.now, rect: (r && r.width > 0 && r.height > 0) ? r : null };
    return chatBoundsCache.rect;
  }

  function clipToChatBounds() {
    const r = getChatBoundsRect();
    if (!r) return;
    const g = fx.g;
    const path = new Path2D();
    path.rect(r.left + window.scrollX - 6, r.top + window.scrollY - 6, r.width + 12, r.height + 12);
    g.clip(path);
  }

  /* ------------------------------------------------------------------------
     3. ORIGINAL CHAT HUB CEL-SHADED CANVAS VECTOR PRIMITIVES
     ------------------------------------------------------------------------ */
  function lightning(x, y, { len = 46, dir = -Math.PI / 2, life = 0.42, col, clipChat = true } = {}) {
    const segs = 5;
    const pts = [[0, 0]];
    for (let i = 1; i <= segs; i++) {
      const u = i / segs;
      const jitter = i === segs ? 0 : fx.rnd(-11, 11);
      pts.push([u * len, jitter]);
    }
    fx.add(life, (k) => {
      if (clipChat) clipToChatBounds();
      const g = fx.g;
      const head = out(fx.clamp(k / 0.35));
      const tail = inn(fx.clamp((k - 0.3) / 0.7));
      const w = (1 - tail) * 6.5;
      if (w < 0.4) return;
      g.translate(x, y);
      g.rotate(dir);
      g.beginPath();
      const maxIdx = Math.max(1, Math.floor(head * segs));
      g.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i <= maxIdx; i++) g.lineTo(pts[i][0], pts[i][1]);
      g.lineCap = 'round';
      g.lineJoin = 'round';
      g.strokeStyle = fx.P.ink;
      g.lineWidth = w + 3.2;
      g.stroke();
      g.strokeStyle = col || fx.P.accent;
      g.lineWidth = w + 1.1;
      g.stroke();
      g.strokeStyle = fx.P.fill;
      g.lineWidth = Math.max(1, w * 0.48);
      g.stroke();
    });
  }

  function hearts(x, y, { n = 4, life = 0.85, col, clipChat = true } = {}) {
    for (let i = 0; i < n; i++) {
      const vx = fx.rnd(-34, 34);
      const vy = -fx.rnd(42, 76);
      const r0 = fx.rnd(7, 11);
      const tilt = fx.rnd(-0.35, 0.35);
      const delay = i * 0.08;
      fx.add(life + delay, (k, t) => {
        if (t < delay) return;
        const kt = (t - delay) / life;
        if (clipChat) clipToChatBounds();
        const g = fx.g;
        const sc = back(fx.clamp((t - delay) / 0.18)) * (1 - inn(fx.clamp((kt - 0.58) / 0.42)));
        if (sc < 0.05) return;
        const px = x + vx * out(kt) + Math.sin(t * 7 + i) * 4;
        const py = y + vy * out(kt);
        const s = r0 * sc;
        const p = new Path2D();
        p.moveTo(0, s * 0.35);
        p.bezierCurveTo(-s * 1.15, -s * 0.45, -s * 0.65, -s * 1.25, 0, -s * 0.45);
        p.bezierCurveTo(s * 0.65, -s * 1.25, s * 1.15, -s * 0.45, 0, s * 0.35);
        p.closePath();
        g.translate(px, py);
        g.rotate(tilt);
        fx.shape(p, 1.3, s * 0.25, col || fx.P.accent);
      });
    }
  }

  function tears(x, y, { dir = 1, n = 3, life = 0.72, clipChat = true } = {}) {
    for (let i = 0; i < n; i++) {
      const vx = dir * fx.rnd(28, 64);
      const vy = -fx.rnd(26, 56);
      const r0 = fx.rnd(3.2, 5.2);
      const delay = i * 0.07;
      fx.add(life + delay, (k, t) => {
        if (t < delay) return;
        const dt = t - delay;
        const kt = dt / life;
        if (clipChat) clipToChatBounds();
        const g = fx.g;
        const r = r0 * (1 - inn(fx.clamp((kt - 0.6) / 0.4)));
        if (r < 0.4) return;
        const px = x + vx * dt;
        const py = y + vy * dt + 220 * dt * dt;
        const ang = Math.atan2(vy + 440 * dt, vx);
        const p = new Path2D();
        p.moveTo(-r * 2.2, 0);
        p.quadraticCurveTo(-r * 0.5, -r, r * 0.5, -r * 0.85);
        p.arc(r * 0.4, 0, r * 0.9, -1.4, 1.4);
        p.quadraticCurveTo(-r * 0.5, r, -r * 2.2, 0);
        g.translate(px, py);
        g.rotate(ang);
        fx.shape(p, 1.1, r * 0.45, fx.P.shade);
      });
    }
  }

  function angerVein(x, y, { size = 14, life = 0.9, clipChat = true } = {}) {
    fx.add(life, (k, t) => {
      if (clipChat) clipToChatBounds();
      const g = fx.g;
      const pulse = 1 + Math.sin(t * 22) * 0.14;
      const sc = back(fx.clamp(t / 0.18)) * (1 - inn(fx.clamp((k - 0.72) / 0.28))) * pulse;
      if (sc < 0.06) return;
      const s = size * sc;
      const drawBranches = (lw, col) => {
        g.strokeStyle = col;
        g.lineWidth = lw;
        g.lineCap = 'round';
        g.beginPath();
        for (let a = 0; a < 4; a++) {
          const ang = a * (Math.PI / 2) + 0.35;
          const cx = Math.cos(ang) * s * 0.32;
          const cy = Math.sin(ang) * s * 0.32;
          const ax = Math.cos(ang - 0.52) * s * 0.95;
          const ay = Math.sin(ang - 0.52) * s * 0.95;
          const bx = Math.cos(ang + 0.52) * s * 0.95;
          const by = Math.sin(ang + 0.52) * s * 0.95;
          g.moveTo(ax, ay);
          g.quadraticCurveTo(cx, cy, bx, by);
        }
        g.stroke();
      };
      g.translate(x, y);
      drawBranches(4.8, fx.P.ink);
      drawBranches(2.4, fx.P.accent);
    });
  }

  function halftoneBurst(x, y, { rx = 74, ry = 46, life = 0.46, clipOutEl, clipChat = true } = {}) {
    const dots = Array.from({ length: 14 }, (_, i) => ({
      a: (i / 14) * fx.TAU + fx.rnd(-0.12, 0.12),
      dist: fx.rnd(0.95, 1.38),
      r: fx.rnd(3.2, 6.2)
    }));
    const spikes = Array.from({ length: 10 }, (_, i) => ({
      a: (i / 10) * fx.TAU + fx.rnd(-0.14, 0.14),
      l: fx.rnd(1.15, 1.55)
    }));
    fx.add(life, (k) => {
      const g = fx.g;
      if (clipChat) clipToChatBounds();
      if (clipOutEl) {
        const b = fx.rectOf ? fx.rectOf(clipOutEl) : (clipOutEl.isConnected ? clipOutEl.getBoundingClientRect() : null);
        if (b && b.width > 0 && b.height > 0) {
          const cr = b.cr !== undefined ? b.cr : Math.min(b.width / 2, b.height / 2, parseFloat(getComputedStyle(clipOutEl).borderRadius) || 10);
          const mask = new Path2D();
          mask.rect(window.scrollX - 40, window.scrollY - 40, innerWidth + 80, innerHeight + 80);
          if (typeof mask.roundRect === 'function') {
            mask.roundRect(b.left + window.scrollX + 1, b.top + window.scrollY + 1, Math.max(0, b.width - 2), Math.max(0, b.height - 2), Math.max(0, cr - 1));
          } else {
            mask.rect(b.left + window.scrollX + 1, b.top + window.scrollY + 1, Math.max(0, b.width - 2), Math.max(0, b.height - 2));
          }
          g.clip(mask, 'evenodd');
        }
      }
      const expand = out(fx.clamp(k / 0.35));
      const die = 1 - inn(fx.clamp((k - 0.45) / 0.55));
      // Radial ink & accent spikes
      for (const s of spikes) {
        const r0 = 0.72 * expand;
        const r1 = s.l * expand;
        const sx0 = x + Math.cos(s.a) * rx * r0;
        const sy0 = y + Math.sin(s.a) * ry * r0;
        const sx1 = x + Math.cos(s.a) * rx * r1;
        const sy1 = y + Math.sin(s.a) * ry * r1;
        g.strokeStyle = fx.P.ink;
        g.lineWidth = Math.max(0.5, 4.5 * die);
        g.beginPath();
        g.moveTo(sx0, sy0);
        g.lineTo(sx1, sy1);
        g.stroke();
        g.strokeStyle = fx.P.accent;
        g.lineWidth = Math.max(0.3, 2.2 * die);
        g.stroke();
      }
      // Halftone comic dots
      for (const d of dots) {
        const r = d.r * die;
        if (r < 0.5) continue;
        const dx = x + Math.cos(d.a) * rx * d.dist * expand;
        const dy = y + Math.sin(d.a) * ry * d.dist * expand;
        g.fillStyle = fx.P.shade;
        g.strokeStyle = fx.P.ink;
        g.lineWidth = 1.4;
        g.beginPath();
        g.arc(dx, dy, r, 0, fx.TAU);
        g.fill();
        g.stroke();
      }
    });
  }

  function squareRing(x, y, { w = 120, h = 120, cr = 18, life = 0.44, strokeW = 3.8, expand = 30, clipChat = true } = {}) {
    fx.add(life, (k) => {
      if (clipChat) clipToChatBounds();
      const g = fx.g;
      const e = out(k);
      const die = 1 - inn(fx.clamp((k - 0.35) / 0.65));
      const lw = strokeW * die;
      if (lw < 0.25) return;
      const pad = expand * e;
      const cw = w + pad * 2;
      const ch = h + pad * 2;
      const rad = Math.min(cw / 2, ch / 2, cr + pad * 0.32);
      const p = new Path2D();
      if (typeof p.roundRect === 'function') {
        p.roundRect(x - cw / 2, y - ch / 2, cw, ch, rad);
      } else {
        p.rect(x - cw / 2, y - ch / 2, cw, ch);
      }
      g.strokeStyle = fx.P.ink;
      g.lineWidth = lw + 2.4;
      g.stroke(p);
      g.strokeStyle = fx.P.accent;
      g.lineWidth = Math.max(0.8, lw);
      g.stroke(p);
    });
  }

  function comicStamp(text, x, y, { fontSize = 15, rot = -0.1, life = 0.85, bg, fg, clipChat = true } = {}) {
    const label = String(text || 'WHAM!').toUpperCase();
    const s = new fx.Spring(0.25, 560, 16);
    s.to = 1;
    let lastT = 0;

    fx.add(life, (k, t) => {
      if (clipChat) clipToChatBounds();
      const g = fx.g;
      const sc = Math.max(0, s.step(t - lastT) * (1 - inn(fx.clamp((k - 0.8) / 0.2))));
      lastT = t;
      if (sc < 0.05) return;

      g.font = `italic 900 ${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif`;
      const tw = g.measureText(label).width;
      const pw = tw + 18;
      const ph = fontSize + 12;

      const jx = Math.sin(t * 36) * (k < 0.25 ? 1.6 : 0.4);
      const jy = Math.cos(t * 29) * (k < 0.25 ? 1.4 : 0.4);
      g.translate(x + jx, y + jy);
      g.rotate(rot + Math.sin(t * 7) * 0.025);
      g.scale(sc, sc);

      const plate = new Path2D();
      const hw = pw / 2, hh = ph / 2;
      plate.moveTo(-hw + 4, -hh);
      plate.lineTo(hw, -hh - 2);
      plate.lineTo(hw - 4, hh);
      plate.lineTo(-hw, hh + 2);
      plate.closePath();

      // Offset shadow
      g.save();
      g.translate(3.5, 4);
      g.fillStyle = fx.P.shade;
      g.fill(plate);
      g.restore();

      g.fillStyle = bg || fx.P.fill;
      g.fill(plate);
      g.lineWidth = 2.6;
      g.strokeStyle = fx.P.ink;
      g.stroke(plate);

      g.textAlign = 'center';
      g.textBaseline = 'middle';
      g.fillStyle = fg || fx.P.ink;
      g.fillText(label, 0, 1);
    });
  }

  /* ------------------------------------------------------------------------
     4. LIVE CHAT-BUBBLE & STORY PLAYBACK VFX ENGINE
     ------------------------------------------------------------------------ */
  let lastStampAt = -1;
  let lastHeavySfxAt = -1;

  function canSpawnStamp() {
    const now = fx.now;
    if (lastStampAt >= 0 && now - lastStampAt < 0.26) return false;
    lastStampAt = now;
    return true;
  }

  function canSpawnHeavySfx() {
    const now = fx.now;
    if (lastHeavySfxAt >= 0 && now - lastHeavySfxAt < 0.09) return false;
    lastHeavySfxAt = now;
    return true;
  }

  function getBubbleMetrics(el) {
    if (!el || !el.isConnected) return null;
    const stream = document.getElementById('chatStream');
    const b = el.getBoundingClientRect();
    if (b.width <= 0 || b.height <= 0) return null;
    if (stream) {
      const sr = stream.getBoundingClientRect();
      if (sr && (b.bottom < sr.top - 12 || b.top > sr.bottom + 24)) return null;
    }
    const row = el.closest('.msg-row');
    const isRight = row ? row.classList.contains('right') : false;
    const cx = b.left + window.scrollX + b.width * 0.5;
    const cy = b.top + window.scrollY + b.height * 0.5;
    const innerEdgeX = isRight ? b.left + window.scrollX + 10 : b.right + window.scrollX - 10;
    const outerEdgeX = isRight ? b.right + window.scrollX - 10 : b.left + window.scrollX + 10;
    const topY = b.top + window.scrollY + 6;
    const bottomY = b.bottom + window.scrollY - 6;
    return {
      b, cx, cy, w: b.width, h: b.height, isRight,
      innerEdgeX, outerEdgeX, topY, bottomY,
      inwardDir: isRight ? -1 : 1
    };
  }

  const STICKER_STAMP_MAP = {
    ROFL: 'HAHA!!',
    WAAH: 'WAAAH!',
    RAGE: 'RAGE!!',
    SHOCK: 'NANI?!',
    LOVE: 'UWU!',
    SALUTE: 'RESPECT!',
    DEAD: 'R.I.P!!',
    PARTY: 'HYPE!!',
    CLOWN: 'BRUH...',
    CHAD: 'GIGA CHAD',
    FIRE: 'LIT!!',
    STARE: 'STARE...',
    PLEASE: 'PLSSS!',
    COLD: 'BRRR!',
    BLOWN: 'WOAH!!',
    SLAY: 'SLAY!!',
    COOL: 'CLEAN!',
    SECRET: 'SHHH!',
    SLEEPY: 'ZZZ...',
    DROOL: 'YUM!!',
    CRINGE: 'OOF!',
    MELT: 'DED...',
    HYPE: "LET'S GO!",
    THINK: 'HMM...?',
    DEVIL: 'EVIL!!',
    SPOOKY: 'BOO!!',
    BOLT: 'ZAP!!',
    HEART: 'DOKI!',
    CAKE: 'SWEET!',
    BOMB: 'BOOM!!',
    CROWN: 'KING!!',
    PUNCH: 'SMASH!!'
  };

  function formatStickerStampLabel(rawLabel, exprLower) {
    const clean = String(rawLabel || '').trim();
    const upper = clean.toUpperCase();
    if (upper && STICKER_STAMP_MAP[upper]) return STICKER_STAMP_MAP[upper];

    const looksLikeFilename =
      !clean ||
      clean.length <= 1 ||
      /\.(png|jpe?g|gif|webp|mp4|webm|svg)$/i.test(clean) ||
      /^(img|vid|dsc|pxl|screenshot|sticker|media|image)[_\-\s]?\d*/i.test(clean);

    if (!looksLikeFilename) {
      const trimmed = upper.slice(0, 12);
      return /[!?\.]$/.test(trimmed) ? trimmed : `${trimmed}!`;
    }

    if (exprLower === 'love' || exprLower === 'blush') return 'DOKI!';
    if (exprLower === 'angry' || exprLower === 'rage' || exprLower === 'mad') return 'RAGE!!';
    if (exprLower === 'shock' || exprLower === 'scared' || exprLower === 'surprised') return 'NANI?!';
    if (exprLower === 'cry' || exprLower === 'sad') return 'WAAAH!';
    if (exprLower === 'laugh') return 'HAHA!!';
    if (exprLower === 'cool' || exprLower === 'smug') return 'CLEAN!';
    return 'NICE!!';
  }

  function formatSfxStampLabel(rawText) {
    const cleaned = String(rawText || 'BOOM!')
      .replace(/^[\s\p{Extended_Pictographic}\u2600-\u27BF\uFE0F\u200D]+/gu, '')
      .trim();
    return (cleaned || String(rawText || 'BOOM!')).slice(0, 18).toUpperCase();
  }

  function clampChatStampX(x, halfW = 48) {
    const stream = document.getElementById('chatStream');
    const r = stream ? stream.getBoundingClientRect() : { left: 0, right: innerWidth };
    return fx.clamp(x, r.left + window.scrollX + halfW, r.right + window.scrollX - halfW);
  }

  function clampChatStampY(y) {
    const stream = document.getElementById('chatStream');
    const r = stream ? stream.getBoundingClientRect() : { top: 0, bottom: innerHeight };
    return fx.clamp(y, r.top + window.scrollY + 22, r.bottom + window.scrollY - 22);
  }

  function playBubbleVfx(kind, expr, bubbleEl, meta = {}) {
    if (!chatVfxEnabled || fx.calm) return;
    if (window.SakugaStudio && !window.SakugaStudio.isEnabled()) return;

    const m = getBubbleMetrics(bubbleEl);
    if (!m) return;

    const e = String(expr || 'normal').toLowerCase();
    const stampX = clampChatStampX(m.cx + m.inwardDir * Math.min(36, m.w * 0.35), 48);
    const stampY = clampChatStampY(m.topY - 12);

    if (kind === 'quest') {
      lightning(m.b.left + window.scrollX + 8, m.cy + 14, { len: Math.min(54, m.h * 0.7), dir: -Math.PI / 2, life: 0.48 });
      lightning(m.b.right + window.scrollX - 8, m.cy - 14, { len: Math.min(54, m.h * 0.7), dir: Math.PI / 2, life: 0.48 });
      fx.kira(m.b.left + window.scrollX + 18, m.topY + 6, { r: 10, life: 0.65 });
      fx.kira(m.b.right + window.scrollX - 18, m.topY + 6, { r: 10, life: 0.65 });
      comicStamp('SYSTEM!', clampChatStampX(m.cx, 52), clampChatStampY(m.topY - 10), { fontSize: 14, bg: fx.P.accent, fg: fx.P.ink });
      return;
    }

    if (kind === 'choice') {
      fx.kira(m.innerEdgeX, m.topY + 8, { r: 10, life: 0.55 });
      fx.ticks(m.cx, m.topY - 4, { dir: -Math.PI / 2, n: 4, r: 6, len: 13, fan: 0.5, life: 0.4 });
      if (canSpawnStamp()) {
        comicStamp('CHOOSE!', clampChatStampX(m.cx, 48), stampY, { fontSize: 13 });
      }
      return;
    }

    if (kind === 'sfx') {
      if (window.SakugaStudio) window.SakugaStudio.onControlSpringPop(bubbleEl, 1.24);
      const label = formatSfxStampLabel(meta.text || 'BOOM!');
      const lower = label.toLowerCase();
      const stampHalfW = Math.min(82, Math.max(44, label.length * 4.5 + 14));
      const sfxStampX = clampChatStampX(m.cx, stampHalfW);
      const sfxStampY = clampChatStampY(m.topY - 16);

      // Spam guard: keep crisp spring + ticks + stamp when spamming rapidly
      if (!canSpawnHeavySfx()) {
        fx.ticks(m.cx, m.topY - 2, { dir: -Math.PI / 2, n: 3, r: 5, len: 12, fan: 0.48, life: 0.34 });
        comicStamp(label, sfxStampX, sfxStampY, {
          fontSize: label.length > 12 ? 12 : 14,
          bg: /nani|arise|level|bam|pow|critical|k\.o|emotional|awaken|domain/.test(lower) ? fx.P.accent : fx.P.fill
        });
        return;
      }

      if (/clash|slash|cut|blade|blocked/.test(lower)) {
        fx.slash(m.cx, m.cy, { len: Math.max(82, m.w * 0.85), ang: -0.45, thick: 11, life: 0.42 });
        fx.slash(m.cx, m.cy, { len: Math.max(72, m.w * 0.72), ang: 2.65, thick: 8, life: 0.42 });
        fx.shards(m.cx, m.cy, { n: 5, speed: 190, size: 5.5, arc: 6.28, grav: 250, life: 0.62 });
        fx.sfx('zuza', clampChatStampX(m.innerEdgeX, 46), clampChatStampY(m.topY - 24), { size: 76, rot: -0.1, life: 0.72, ...fx.dotted() });
      } else if (/bruh|chad|boing|bwahaha|sheesh|cap|rip/.test(lower)) {
        fx.wob(m.innerEdgeX, m.cy, { dir: m.inwardDir, r: 11, life: 0.42 });
        fx.puff(m.cx - m.w * 0.32, m.bottomY, { size: 7, n: 2, vx: -16, vy: -10, life: 0.48 });
        fx.puff(m.cx + m.w * 0.32, m.bottomY, { size: 7, n: 2, vx: 16, vy: -10, life: 0.48 });
        fx.kira(m.innerEdgeX, m.topY + 4, { r: 10, life: 0.56 });
        fx.ticks(m.cx, m.topY - 4, { dir: -Math.PI / 2, n: 4, r: 6, len: 12, fan: 0.55, life: 0.38 });
        fx.sfx('pon', clampChatStampX(m.innerEdgeX, 44), clampChatStampY(m.topY - 22), { size: 74, rot: -0.08, life: 0.7, ...fx.hollow() });
      } else if (/waaahh|emotional|heartbreak|shiver/.test(lower)) {
        tears(m.b.left + window.scrollX + 10, m.bottomY - 6, { dir: -1, n: 2, life: 0.65 });
        tears(m.b.right + window.scrollX - 10, m.bottomY - 6, { dir: 1, n: 2, life: 0.65 });
        halftoneBurst(m.cx, m.cy, { rx: Math.max(52, m.w * 0.66), ry: Math.max(38, m.h * 0.85), life: 0.42, clipOutEl: bubbleEl });
      } else if (/whoosh|yeet|nigerundayo/.test(lower)) {
        fx.lines(m.outerEdgeX, m.cy, { n: 7, dir: m.isRight ? 0 : Math.PI, len: 54, spread: 14, life: 0.36 });
        fx.puff(m.outerEdgeX, m.cy + 4, { size: 8, n: 3, vx: m.inwardDir * 24, vy: -8, life: 0.48 });
        fx.sfx('shu', clampChatStampX(m.innerEdgeX, 44), clampChatStampY(m.topY - 22), { size: 76, rot: -0.1, life: 0.68, ...fx.hollow() });
      } else if (/nani|wait what|gulp|omae|panic|plot twist|stare|menacing|ゴゴゴ/.test(lower)) {
        halftoneBurst(m.cx, m.cy, { rx: Math.max(54, m.w * 0.7), ry: Math.max(40, m.h * 0.9), life: 0.44, clipOutEl: bubbleEl });
        lightning(m.innerEdgeX, m.cy, { len: 40, dir: -Math.PI / 2, life: 0.4 });
        fx.shards(m.cx, m.cy, { n: 4, speed: 165, size: 5, arc: 6.28, grav: 230, life: 0.58 });
        if (/menacing|ゴゴゴ/.test(lower)) {
          angerVein(clampChatStampX(m.innerEdgeX, 18), clampChatStampY(m.topY + 4), { size: 13, life: 0.85 });
          fx.sfx('gogo', clampChatStampX(m.cx, 50), clampChatStampY(m.topY - 26), { size: 86, rot: -0.08, life: 0.82, ...fx.hollow() });
        } else {
          fx.sfx('kachi', clampChatStampX(m.innerEdgeX, 44), clampChatStampY(m.topY - 22), { size: 74, rot: -0.08, life: 0.68, ...fx.hollow() });
        }
      } else if (/awaken|domain|100%|sharingan|system|arise|level up|bankai|plus ultra/.test(lower)) {
        lightning(m.b.left + window.scrollX + 10, m.cy + 12, { len: 44, dir: -Math.PI / 2, life: 0.44 });
        lightning(m.b.right + window.scrollX - 10, m.cy - 12, { len: 44, dir: Math.PI / 2, life: 0.44 });
        halftoneBurst(m.cx, m.cy, { rx: Math.max(56, m.w * 0.72), ry: Math.max(40, m.h * 0.9), life: 0.44, clipOutEl: bubbleEl });
        fx.kira(m.innerEdgeX, m.topY + 4, { r: 11, life: 0.62 });
        fx.sfx('don', clampChatStampX(m.innerEdgeX, 46), clampChatStampY(m.topY - 22), { size: 78, rot: -0.1, life: 0.75 });
      } else {
        // Combat / Impact default (BAM!!, POW!!, ORA ORA!!, SMACK!!, BONK!!, CRITICAL HIT!!, K.O.!!)
        fx.burst(m.cx, m.cy, { rx: Math.max(56, m.w * 0.74), ry: Math.max(44, m.h * 0.9), spikes: 13, life: 0.4, clipOutEl: bubbleEl });
        fx.shards(m.cx, m.cy, { n: 5, speed: 190, size: 6, arc: 6.28, grav: 250, life: 0.62 });
        fx.ticks(m.cx, m.topY - 2, { dir: -Math.PI / 2, n: 4, r: 6, len: 13, fan: 0.55, life: 0.36 });
        fx.sfx('don', clampChatStampX(m.innerEdgeX, 46), clampChatStampY(m.topY - 22), { size: 78, rot: -0.1, life: 0.74 });
      }

      comicStamp(label, sfxStampX, sfxStampY, {
        fontSize: label.length > 12 ? 12 : 14,
        bg: /nani|arise|level|bam|pow|critical|k\.o|emotional|awaken|domain/.test(lower) ? fx.P.accent : fx.P.fill
      });
      return;
    }

    if (kind === 'sticker') {
      if (window.SakugaStudio) window.SakugaStudio.onControlSpringPop(bubbleEl, 1.18);
      // Expanding rounded-square shockwave hugging the square sticker card shape (no round circle!)
      const cr = parseFloat(getComputedStyle(bubbleEl).borderRadius) || 18;
      squareRing(m.cx, m.cy, { w: m.w, h: m.h, cr, life: 0.44, strokeW: 3.6, expand: 28 });
      fx.kira(m.b.left + window.scrollX + 12, m.topY + 4, { r: 9, life: 0.54 });
      fx.kira(m.b.right + window.scrollX - 12, m.topY + 4, { r: 9, life: 0.54 });
      fx.ticks(m.innerEdgeX, m.topY - 2, { dir: m.isRight ? -2.2 : -0.9, n: 3, r: 6, len: 12, fan: 0.48, life: 0.36 });
      if (e === 'angry' || e === 'shock') {
        lightning(m.innerEdgeX, m.cy, { len: 36, dir: m.inwardDir > 0 ? -0.35 : Math.PI + 0.35, life: 0.38 });
      } else if (e === 'love' || e === 'blush') {
        hearts(m.innerEdgeX, m.topY + 8, { n: 3, life: 0.8 });
      } else if (e === 'cry' || e === 'sad') {
        tears(m.b.left + window.scrollX + 10, m.bottomY - 6, { dir: -1, n: 2, life: 0.65 });
        tears(m.b.right + window.scrollX - 10, m.bottomY - 6, { dir: 1, n: 2, life: 0.65 });
      }
      if (canSpawnStamp()) {
        const stickerStamp = formatStickerStampLabel(meta.stickerLabel, e);
        const stHalfW = Math.min(68, Math.max(38, stickerStamp.length * 4.2 + 12));
        comicStamp(stickerStamp, clampChatStampX(m.cx + m.inwardDir * Math.min(28, m.w * 0.25), stHalfW), stampY, {
          fontSize: stickerStamp.length > 8 ? 11.5 : 13,
          bg: (e === 'angry' || e === 'shock' || e === 'love') ? fx.P.accent : fx.P.fill
        });
      }
      return;
    }

    // Standard Dialogue Bubble Expressions (Auto-Play + Avatar Click)
    if (e === 'angry' || e === 'rage' || e === 'mad') {
      angerVein(clampChatStampX(m.innerEdgeX, 18), clampChatStampY(m.topY + 4), { size: 13, life: 0.9 });
      lightning(m.outerEdgeX, m.cy, { len: 36, dir: m.isRight ? -0.25 : Math.PI + 0.25, life: 0.36 });
      fx.ticks(m.innerEdgeX, m.topY, { dir: -Math.PI / 2, n: 3, r: 5, len: 12, fan: 0.45, life: 0.38 });
      if (canSpawnStamp()) {
        comicStamp(Math.random() > 0.5 ? 'WHAM!' : 'GRRR!', stampX, stampY, { fontSize: 13, bg: fx.P.accent });
      }
    } else if (e === 'shock' || e === 'scared' || e === 'surprised') {
      halftoneBurst(m.cx, m.cy, { rx: Math.min(125, Math.max(58, m.w * 0.62)), ry: Math.max(40, m.h * 0.95), life: 0.44, clipOutEl: bubbleEl });
      fx.shards(m.innerEdgeX, m.topY + 10, { n: 5, speed: 150, size: 5, arc: 2.6, dir: -Math.PI / 2, life: 0.6 });
      if (canSpawnStamp()) {
        comicStamp(Math.random() > 0.5 ? 'NANI?!' : 'GASP!', stampX, stampY, { fontSize: 13 });
      }
    } else if (e === 'love' || e === 'blush') {
      hearts(m.innerEdgeX, m.topY + 8, { n: 4, life: 0.85 });
      fx.kira(m.outerEdgeX, m.topY + 4, { r: 9, life: 0.55 });
    } else if (e === 'cry' || e === 'sad' || e === 'sweat') {
      tears(m.b.left + window.scrollX + 10, m.bottomY - 6, { dir: -1, n: 2, life: 0.65 });
      tears(m.b.right + window.scrollX - 10, m.bottomY - 6, { dir: 1, n: 2, life: 0.65 });
      fx.wob(m.innerEdgeX, m.cy, { dir: m.inwardDir, r: 9, life: 0.35 });
    } else if (e === 'smug' || e === 'laugh' || e === 'cool' || e === 'happy' || e === 'bliss') {
      if (window.SakugaStudio) window.SakugaStudio.onControlSpringPop(bubbleEl, 1.09);
      fx.kira(m.innerEdgeX, m.topY + 4, { r: 10, life: 0.6 });
      fx.ticks(m.innerEdgeX, m.topY - 2, { dir: m.isRight ? -2.2 : -0.9, n: 3, r: 5, len: 11, fan: 0.42, life: 0.36 });
      if ((e === 'smug' || e === 'laugh') && canSpawnStamp()) {
        comicStamp(e === 'laugh' ? 'HAHA!' : 'FLEX!', stampX, stampY, { fontSize: 12 });
      }
    } else if (meta.fromAvatarClick) {
      // Clicking a character avatar on a normal line still gives crisp tactile feedback
      fx.kira(m.innerEdgeX, m.topY + 2, { r: 8, life: 0.45 });
      fx.ticks(m.innerEdgeX, m.topY + 2, { dir: m.isRight ? -2.3 : -0.8, n: 2, r: 4, len: 9, fan: 0.4, life: 0.28 });
    }
  }

  /* ------------------------------------------------------------------------
     5. INITIALIZE & EXPORT PUBLIC API
     ------------------------------------------------------------------------ */
  applyVfxSkin(currentSkinId, true);

  window.ChatHubVfx = {
    getSkin: () => currentSkinId,
    getSkins: () => Object.values(VFX_SKINS),
    setSkin: (id, silent = false) => applyVfxSkin(id, silent),
    cycleSkin: cycleVfxSkin,
    isChatVfxEnabled: () => chatVfxEnabled,
    toggleChatVfx: toggleChatBubbleVfx,
    updateUi: updateChatHubVfxUi,
    playBubbleVfx,
    lightning,
    hearts,
    tears,
    angerVein,
    halftoneBurst,
    squareRing,
    comicStamp
  };
  window.setChatHubVfxSkin = (id) => applyVfxSkin(id, false);
  window.cycleChatHubVfxSkin = cycleVfxSkin;
  window.toggleChatBubbleVfx = toggleChatBubbleVfx;
})();
