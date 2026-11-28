/* ============================================================================
   MANHWA CHAT HUB — MODULAR MANHWA SYSTEM WINDOW STUDIO
   17 Presets • Inventory & Coin Shop • Level-Up +Stats • Dynamic Penalty Climax
   ============================================================================ */
(() => {
  'use strict';

  const PRESETS_STORAGE_KEY = 'chathub_sys_presets_v1';
  const CUSTOM_ICONS_STORAGE_KEY = 'chathub_sys_custom_icons_v1';
  const CUSTOM_FRAMES_STORAGE_KEY = 'chathub_sys_custom_frames_v1';
  const CUSTOM_FONTS_STORAGE_KEY = 'chathub_sys_custom_fonts_v1';

  const PRESET_FONT_STACKS = {
    hud: "'Segoe UI', 'Rajdhani', system-ui, -apple-system, sans-serif",
    manhwa: "system-ui, -apple-system, 'Nunito', sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    mono: "ui-monospace, 'Cascadia Code', Consolas, monospace",
    cinzel: "'Cinzel', 'Palatino Linotype', 'Book Antiqua', Georgia, serif",
    impact: "'Impact', 'Arial Black', 'Segoe UI', sans-serif",
    gothic: "'Trebuchet MS', 'Segoe UI Black', sans-serif",
    runic: "'Copperplate', 'Papyrus', Georgia, serif"
  };

  function loadCustomFonts() {
    try {
      let raw = null;
      if (window.ChatHubStorage && typeof window.ChatHubStorage.get === 'function') {
        raw = window.ChatHubStorage.get(CUSTOM_FONTS_STORAGE_KEY);
      } else {
        raw = localStorage.getItem(CUSTOM_FONTS_STORAGE_KEY);
      }
      const arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr : [];
    } catch (e) {
      return [];
    }
  }

  function saveCustomFonts(list) {
    try {
      const json = JSON.stringify(list || []);
      if (window.ChatHubStorage && typeof window.ChatHubStorage.set === 'function') {
        window.ChatHubStorage.set(CUSTOM_FONTS_STORAGE_KEY, json);
      } else {
        localStorage.setItem(CUSTOM_FONTS_STORAGE_KEY, json);
      }
    } catch (e) {}
  }

  function isSafeFontDataUrl(url) {
    if (!url || typeof url !== 'string') return false;
    return /^data:(?:font\/[a-z0-9.+-]+|application\/[a-z0-9.+-]+|octet-stream)(?:;[a-z0-9.=+-]+)*;base64,[A-Za-z0-9+/=]+$/i.test(url.trim());
  }

  function sanitizeCssColor(val) {
    if (!val || typeof val !== 'string') return '';
    const s = val.trim();
    if (/^#[0-9a-fA-F]{3,8}$/.test(s)) return s;
    if (/^rgba?\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}(?:\s*,\s*(?:0|1|0?\.\d+))?\s*\)$/i.test(s)) return s;
    return '';
  }

  function toHex6(color, fallback = '#00f0ff') {
    const s = String(color || '').trim();
    if (/^#[0-9a-fA-F]{6}$/.test(s)) return s.toLowerCase();
    if (/^#[0-9a-fA-F]{3}$/.test(s)) {
      return ('#' + s[1] + s[1] + s[2] + s[2] + s[3] + s[3]).toLowerCase();
    }
    if (/^#[0-9a-fA-F]{8}$/.test(s)) return s.slice(0, 7).toLowerCase();
    return fallback;
  }

  function injectCustomFontFaces() {
    try {
      if (typeof document === 'undefined' || !document.head) return;
      const fonts = loadCustomFonts();
      let styleEl = document.getElementById('mswCustomFontsStyle');
      if (!fonts.length) {
        if (styleEl) styleEl.textContent = '';
        return;
      }
      if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.id = 'mswCustomFontsStyle';
        document.head.appendChild(styleEl);
      }
      styleEl.textContent = fonts.map(f => {
        if (!f || !f.id || !isSafeFontDataUrl(f.dataUrl)) return '';
        const fam = String(f.id).replace(/[^a-zA-Z0-9_-]/g, '');
        if (!fam) return '';
        return `@font-face { font-family: 'MswFont_${fam}'; src: url('${f.dataUrl.trim()}'); font-display: swap; }`;
      }).filter(Boolean).join('\n');
    } catch (e) {}
  }

  function resolveFontFamilyCss(fontKey) {
    if (!fontKey) return '';
    if (PRESET_FONT_STACKS[fontKey]) return PRESET_FONT_STACKS[fontKey];
    if (String(fontKey).startsWith('custom:')) {
      const fam = String(fontKey).slice(7).replace(/[^a-zA-Z0-9_-]/g, '');
      if (fam) return `'MswFont_${fam}', system-ui, sans-serif`;
    }
    return '';
  }

  function esc(str) {
    return String(str ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function isSafeUrl(url) {
    if (!url || typeof url !== 'string') return false;
    const u = url.trim();
    if (!u) return false;
    if (u.startsWith('data:image/') || u.startsWith('blob:') || u.startsWith('assets/') || u.startsWith('./assets/')) {
      return true;
    }
    try {
      const parsed = new URL(u, window.location.href);
      return parsed.protocol === 'https:' || parsed.protocol === 'http:';
    } catch (e) {
      return false;
    }
  }

  function hexToRgba(hex, alpha = 0.94, minAlpha = 0.2) {
    const clean = String(hex || '#041226').replace('#', '').trim();
    let r = 4, g = 18, b = 38;
    if (clean.length === 3) {
      r = parseInt(clean[0] + clean[0], 16) || 0;
      g = parseInt(clean[1] + clean[1], 16) || 0;
      b = parseInt(clean[2] + clean[2], 16) || 0;
    } else if (clean.length >= 6) {
      r = parseInt(clean.slice(0, 2), 16) || 0;
      g = parseInt(clean.slice(2, 4), 16) || 0;
      b = parseInt(clean.slice(4, 6), 16) || 0;
    }
    const numAlpha = Number(alpha);
    const a = Math.max(minAlpha, Math.min(1, Number.isFinite(numAlpha) ? numAlpha : 0.94));
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  }

  function clampPct(v, fallback = 50) {
    const n = Number(v);
    if (!Number.isFinite(n)) return fallback;
    return Math.max(0, Math.min(100, Math.round(n)));
  }

  function formatTimerSeconds(sec) {
    const s = Math.max(0, Math.floor(Number(sec) || 0));
    const hrs = Math.floor(s / 3600);
    const mins = Math.floor((s % 3600) / 60);
    const rem = s % 60;
    const pad = (x) => String(x).padStart(2, '0');
    return hrs > 0 ? `${pad(hrs)}:${pad(mins)}:${pad(rem)}` : `${pad(mins)}:${pad(rem)}`;
  }

  function cloneObj(o) {
    return JSON.parse(JSON.stringify(o));
  }

  function api() {
    return window.ChatHubStudioApi || null;
  }

  /* --------------------------------------------------------------------------
     16 NEON VECTOR & RELIC EMBLEM SVG ICONS (Recolorable & Sharp at Any Size)
     -------------------------------------------------------------------------- */
  const NEON_SVG_ICONS = {
    demonic_eye: {
      cat: 'relic',
      label: 'Devour Eye',
      svg: `<svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="mswEyeGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#fef08a"/>
            <stop offset="55%" stop-color="#ef4444"/>
            <stop offset="100%" stop-color="#450a0a"/>
          </radialGradient>
        </defs>
        <path d="M18 16L36 30L50 10L60 28L70 10L84 30L102 16L90 38L110 52L90 64L108 82L84 90L72 110L60 92L48 110L36 90L12 82L30 64L10 52L30 38Z" fill="url(#mswEyeGlow)" stroke="#fde047" stroke-width="2.5"/>
        <circle cx="60" cy="60" r="34" fill="#450a0a" stroke="#facc15" stroke-width="2.2"/>
        <path d="M36 42L44 50L50 38L60 48L70 38L76 50L84 42M36 78L44 70L50 82L60 72L70 82L76 70L84 78" stroke="#fca5a5" stroke-width="2" stroke-linecap="round"/>
        <path d="M60 33C73 44 76 60 60 87C44 60 47 44 60 33Z" fill="#fef08a" stroke="#ef4444" stroke-width="2"/>
        <ellipse cx="60" cy="60" rx="5.5" ry="15" fill="#7f1d1d" stroke="#fde047" stroke-width="1.5"/>
        <circle cx="60" cy="60" r="3" fill="#fef08a"/>
      </svg>`
    },
    gold_exchange: {
      cat: 'codex',
      label: 'Coin Exchange',
      svg: `<svg viewBox="0 0 160 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M24 30L46 30L41 20L29 20Z" stroke="#fb923c" stroke-width="2.6" stroke-linejoin="round"/>
        <path d="M24 30C12 40 10 74 20 82H46" stroke="#fb923c" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>
        <text x="27" y="64" fill="#fdba74" font-family="sans-serif" font-weight="900" font-size="22">G</text>
        <rect x="44" y="64" width="22" height="6" rx="1.5" stroke="#fdba74" stroke-width="2.2" fill="#07122e"/>
        <rect x="44" y="71" width="22" height="6" rx="1.5" stroke="#fdba74" stroke-width="2.2" fill="#07122e"/>
        <rect x="44" y="78" width="22" height="6" rx="1.5" stroke="#fdba74" stroke-width="2.2" fill="#07122e"/>
        <path d="M74 52H88M83 47L89 52L83 57" stroke="#e0f2fe" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>
        <rect x="97" y="34" width="42" height="36" rx="2" stroke="#4ade80" stroke-width="2.6"/>
        <path d="M101 75H142V40M105 80H146V45" stroke="#4ade80" stroke-width="2" stroke-linecap="round"/>
        <circle cx="118" cy="52" r="8" stroke="#86efac" stroke-width="2.4"/>
        <text x="114" y="56" fill="#86efac" font-size="11" font-weight="900">$</text>
      </svg>`
    },
    neon_miners: {
      cat: 'codex',
      label: 'Guild Miners',
      svg: `<svg viewBox="0 0 160 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g stroke="#bae6fd" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="42" cy="24" r="6" fill="rgba(56,189,248,0.28)"/>
          <path d="M35 34L44 34L54 55L44 82M42 54L30 82M37 42L24 55"/>
          <path d="M15 44C20 34 32 34 38 40M26 39L14 68" stroke="#7dd3fc" stroke-width="2.6"/>
          <circle cx="80" cy="24" r="6" fill="rgba(56,189,248,0.28)"/>
          <path d="M73 34L82 34L92 55L82 82M80 54L68 82M75 42L62 55"/>
          <path d="M53 44C58 34 70 34 76 40M64 39L52 68" stroke="#7dd3fc" stroke-width="2.6"/>
          <circle cx="118" cy="24" r="6" fill="rgba(56,189,248,0.28)"/>
          <path d="M111 34L120 34L130 55L120 82M118 54L106 82M113 42L100 55"/>
          <path d="M91 44C96 34 108 34 114 40M102 39L90 68" stroke="#7dd3fc" stroke-width="2.6"/>
        </g>
        <path d="M16 74L20 71M56 76L60 72M96 74L100 71M24 81L28 79" stroke="#facc15" stroke-width="2" stroke-linecap="round"/>
      </svg>`
    },
    death_skull: {
      cat: 'codex',
      label: 'Death Penalty',
      svg: `<svg viewBox="0 0 160 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M80 12C65 12 56 21 56 34C56 42 60 47 64 51V58H96V51C100 47 104 42 104 34C104 21 95 12 80 12Z" fill="#ef4444" stroke="#fca5a5" stroke-width="2"/>
        <circle cx="71" cy="35" r="5" fill="#07122e"/><circle cx="89" cy="35" r="5" fill="#07122e"/>
        <path d="M77 45L80 40L83 45H77Z" fill="#07122e"/>
        <path d="M70 53V58M77 53V58M83 53V58M90 53V58" stroke="#07122e" stroke-width="2"/>
        <circle cx="32" cy="79" r="9" stroke="#93c5fd" stroke-width="2.6"/>
        <path d="M44 74H128C134 74 134 83 128 83H86L84 86H44C40 86 40 74 44 74Z" stroke="#93c5fd" stroke-width="2.6" fill="rgba(56,189,248,0.12)"/>
      </svg>`
    },
    cursed_spear: {
      label: 'Cursed Spear',
      svg: `<svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M60 10L74 42L66 46V106L60 112L54 106V46L46 42Z" fill="rgba(239,68,68,0.35)" stroke="#fde047" stroke-width="2.5" stroke-linejoin="round"/>
        <path d="M36 46L60 28L84 46L60 64Z" stroke="#ef4444" stroke-width="2.4"/>
        <circle cx="60" cy="46" r="5" fill="#fef08a"/>
      </svg>`
    },
    shadow_crown: {
      label: 'Monarch Crown',
      svg: `<svg viewBox="0 0 120 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M18 76L26 30L46 50L60 18L74 50L94 30L102 76H18Z" stroke="currentColor" stroke-width="3" fill="rgba(168,85,247,0.22)" stroke-linejoin="round"/>
        <rect x="20" y="80" width="80" height="8" rx="3" stroke="currentColor" stroke-width="2.5"/>
        <circle cx="60" cy="54" r="5" fill="#fde047"/>
      </svg>`
    },
    crimson_fangs: {
      label: 'Twin Daggers',
      svg: `<svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M22 96L42 74L32 66L86 16L74 52L96 96" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M98 96L78 74L88 66L34 16L46 52L24 96" stroke="#ef4444" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`
    },
    void_gate: {
      label: 'Dungeon Gate',
      svg: `<svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="60" cy="60" rx="34" ry="46" stroke="currentColor" stroke-width="3"/>
        <ellipse cx="60" cy="60" rx="22" ry="34" stroke="#a855f7" stroke-width="2.2" stroke-dasharray="6 4"/>
        <path d="M60 28C72 44 72 76 60 92C48 76 48 44 60 28Z" fill="rgba(56,189,248,0.25)" stroke="#fde047" stroke-width="1.8"/>
      </svg>`
    },
    broken_chains: {
      label: 'Seal Broken',
      svg: `<svg viewBox="0 0 120 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="12" y="38" width="32" height="20" rx="9" transform="rotate(-18 28 48)" stroke="currentColor" stroke-width="3"/>
        <rect x="76" y="42" width="32" height="20" rx="9" transform="rotate(18 92 52)" stroke="currentColor" stroke-width="3"/>
        <path d="M54 20L60 44L70 30M50 82L58 58L66 74" stroke="#fde047" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`
    },
    aegis_shield: {
      label: 'Aegis Shield',
      svg: `<svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M60 14L98 30V58C98 82 78 99 60 108C42 99 22 82 22 58V30L60 14Z" fill="rgba(0,240,255,0.16)" stroke="currentColor" stroke-width="3"/>
        <path d="M60 28V92M36 52H84" stroke="currentColor" stroke-width="2.2" stroke-opacity="0.7"/>
      </svg>`
    },
    soul_flame: {
      label: 'Soul Flame',
      svg: `<svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M60 14C76 34 92 50 92 72C92 92 78 106 60 106C42 106 28 92 28 72C28 54 42 40 48 32C48 44 54 48 58 46C54 32 56 22 60 14Z" fill="rgba(239,68,68,0.28)" stroke="#facc15" stroke-width="2.8"/>
        <path d="M60 54C68 64 72 72 72 80C72 88 66 94 60 94C54 94 48 88 48 80C48 70 54 62 60 54Z" fill="#ef4444" stroke="#fef08a" stroke-width="1.8"/>
      </svg>`
    },
    constellation_orb: {
      label: 'Constellation',
      svg: `<svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="60" cy="60" r="38" stroke="currentColor" stroke-width="2" stroke-dasharray="5 5"/>
        <path d="M60 16L68 50L102 58L68 66L60 100L52 66L18 58L52 50Z" fill="rgba(250,204,21,0.24)" stroke="#fde047" stroke-width="2.4"/>
      </svg>`
    },
    hourglass_doom: {
      cat: 'codex',
      label: 'Doom Timer',
      svg: `<svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M30 18H90M30 102H90M38 18C38 44 56 54 60 60C64 54 82 44 82 18M38 102C38 76 56 66 60 60C64 66 82 76 82 102" stroke="#ef4444" stroke-width="3" stroke-linecap="round"/>
        <path d="M46 96L60 76L74 96H46Z" fill="rgba(239,68,68,0.55)"/>
      </svg>`
    },
    guild_crest: {
      cat: 'relic',
      label: 'Guild Crest',
      svg: `<svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M60 14V104M46 82H74M20 34C28 54 42 62 56 64M100 34C92 54 78 62 64 64M28 56C36 72 46 78 56 80M92 56C84 72 74 78 64 80" stroke="currentColor" stroke-width="2.8" stroke-linecap="round"/>
      </svg>`
    },
    heart_lock: {
      cat: 'relic',
      label: 'Soul Pact',
      svg: `<svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M60 98C60 98 20 74 20 44C20 28 32 20 44 20C52 20 57 25 60 30C63 25 68 20 76 20C88 20 100 28 100 44C100 74 60 98 60 98Z" fill="rgba(236,72,153,0.22)" stroke="#f472b6" stroke-width="3"/>
        <rect x="49" y="54" width="22" height="18" rx="3" stroke="#fde047" stroke-width="2.4"/>
        <path d="M53 54V48C53 43 67 43 67 48V54" stroke="#fde047" stroke-width="2.4"/>
      </svg>`
    },
    level_wings: {
      cat: 'relic',
      label: 'Ascension',
      svg: `<svg viewBox="0 0 120 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M60 76V18M48 30L60 16L72 30M14 26C24 44 40 52 54 54M106 26C96 44 80 52 66 54M22 48C32 62 44 68 54 70M98 48C88 62 76 68 66 70" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`
    },
    quest_scroll: {
      cat: 'codex',
      label: 'Quest Scroll',
      svg: `<svg viewBox="0 0 140 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="28" y="16" width="84" height="68" rx="6" fill="rgba(56,189,248,0.12)" stroke="#38bdf8" stroke-width="2.5"/>
        <path d="M44 38L51 45L64 31M72 38H98M44 56L51 63L64 49M72 56H98M44 72H94" stroke="#bae6fd" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`
    },
    debt_ledger: {
      cat: 'codex',
      label: 'Debt Penalty',
      svg: `<svg viewBox="0 0 140 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="48" cy="52" r="24" stroke="#facc15" stroke-width="2.6" fill="rgba(250,204,21,0.14)"/>
        <text x="48" y="60" fill="#fde047" font-size="24" font-weight="900" text-anchor="middle">$</text>
        <path d="M98 24L122 72H74Z" stroke="#ef4444" stroke-width="2.8" fill="rgba(239,68,68,0.22)" stroke-linejoin="round"/>
        <path d="M98 40V54M98 62V64" stroke="#fef2f2" stroke-width="3" stroke-linecap="round"/>
      </svg>`
    },
    portal_rank: {
      cat: 'codex',
      label: 'S-Rank Gate',
      svg: `<svg viewBox="0 0 140 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M36 88V44C36 22 104 22 104 44V88" stroke="#38bdf8" stroke-width="3" stroke-linecap="round"/>
        <ellipse cx="70" cy="56" rx="22" ry="28" fill="rgba(56,189,248,0.2)" stroke="#a855f7" stroke-width="2.4"/>
        <text x="70" y="65" fill="#fde047" font-size="26" font-weight="900" text-anchor="middle">S</text>
      </svg>`
    },
    level_tower: {
      cat: 'codex',
      label: 'Trial Tower',
      svg: `<svg viewBox="0 0 140 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M52 86L58 24L70 12L82 24L88 86Z" stroke="#38bdf8" stroke-width="2.5" fill="rgba(56,189,248,0.12)"/>
        <path d="M56 42H84M55 58H85M53 74H87M22 66L36 52M118 66L104 52" stroke="#bae6fd" stroke-width="2.2" stroke-linecap="round"/>
        <circle cx="70" cy="27" r="4" fill="#fde047"/>
      </svg>`
    },
    guild_contract: {
      cat: 'codex',
      label: 'Guild Pact',
      svg: `<svg viewBox="0 0 140 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="42" cy="30" r="10" stroke="#38bdf8" stroke-width="2.4"/>
        <path d="M26 78C26 54 58 54 58 78" stroke="#38bdf8" stroke-width="2.4" fill="rgba(56,189,248,0.14)"/>
        <circle cx="98" cy="30" r="10" stroke="#4ade80" stroke-width="2.4"/>
        <path d="M82 78C82 54 114 54 114 78" stroke="#4ade80" stroke-width="2.4" fill="rgba(74,222,128,0.14)"/>
        <path d="M58 48H82M64 42L58 48L64 54M76 42L82 48L76 54" stroke="#facc15" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`
    },
    warning_siren: {
      cat: 'codex',
      label: 'Critical Alert',
      svg: `<svg viewBox="0 0 140 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M50 76V46C50 32 90 32 90 46V76Z" fill="rgba(239,68,68,0.3)" stroke="#ef4444" stroke-width="2.8"/>
        <rect x="42" y="76" width="56" height="10" rx="3" stroke="#fca5a5" stroke-width="2.4"/>
        <path d="M70 12V24M36 24L44 34M104 24L96 34M22 48H34M118 48H106" stroke="#fde047" stroke-width="2.6" stroke-linecap="round"/>
      </svg>`
    },
    brain_sync: {
      cat: 'codex',
      label: 'System Sync',
      svg: `<svg viewBox="0 0 140 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="70" cy="50" r="28" stroke="#00f0ff" stroke-width="2.4" fill="rgba(0,240,255,0.1)"/>
        <circle cx="70" cy="50" r="10" stroke="#a855f7" stroke-width="2.4"/>
        <path d="M70 22V38M70 62V78M42 50H58M82 50H98M50 30L60 40M90 70L80 60M90 30L80 40M50 70L60 60" stroke="#7dd3fc" stroke-width="2" stroke-linecap="round"/>
      </svg>`
    },
    key_artifact: {
      cat: 'codex',
      label: 'Dungeon Key',
      svg: `<svg viewBox="0 0 140 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="42" cy="50" r="18" stroke="#facc15" stroke-width="3" fill="rgba(250,204,21,0.16)"/>
        <circle cx="42" cy="50" r="7" stroke="#fef08a" stroke-width="2"/>
        <path d="M60 50H116M96 50V66M110 50V62" stroke="#facc15" stroke-width="3.2" stroke-linecap="round"/>
      </svg>`
    },
    trade_scale: {
      cat: 'codex',
      label: 'Market Balance',
      svg: `<svg viewBox="0 0 140 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M70 18V84M46 84H94M34 34L70 26L106 34" stroke="#38bdf8" stroke-width="2.6" stroke-linecap="round"/>
        <path d="M22 60C22 68 46 68 46 60L34 34Z" stroke="#facc15" stroke-width="2.2" fill="rgba(250,204,21,0.16)"/>
        <path d="M94 60C94 68 118 68 118 60L106 34Z" stroke="#4ade80" stroke-width="2.2" fill="rgba(74,222,128,0.16)"/>
      </svg>`
    },
    prison_bars: {
      cat: 'codex',
      label: 'Penalty Zone',
      svg: `<svg viewBox="0 0 140 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="26" y="16" width="88" height="68" rx="4" stroke="#93c5fd" stroke-width="2.6" fill="rgba(15,23,42,0.7)"/>
        <path d="M48 16V84M70 16V84M92 16V84M26 50H114" stroke="#ef4444" stroke-width="3"/>
      </svg>`
    },
    abyss_reaper: {
      cat: 'relic',
      label: 'Abyss Scythe',
      svg: `<svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M26 98L84 22C94 34 102 52 96 72C90 50 76 38 62 36" stroke="#ef4444" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M84 22C58 14 34 26 24 44C44 34 62 36 74 44Z" fill="rgba(239,68,68,0.32)" stroke="#fde047" stroke-width="2.4"/>
      </svg>`
    },
    dragon_fang: {
      cat: 'relic',
      label: 'Dragon Maw',
      svg: `<svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M18 42L44 26L60 40L76 26L102 42L84 62L100 84L60 104L20 84L36 62Z" fill="rgba(239,68,68,0.22)" stroke="#facc15" stroke-width="2.6" stroke-linejoin="round"/>
        <path d="M40 56L50 76L60 58L70 76L80 56" stroke="#fef08a" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`
    },
    phoenix_crest: {
      cat: 'relic',
      label: 'Phoenix Aura',
      svg: `<svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M60 18L70 46L106 32L82 64L102 92L60 76L18 92L38 64L14 32L50 46Z" fill="rgba(251,146,60,0.26)" stroke="#fde047" stroke-width="2.4" stroke-linejoin="round"/>
        <circle cx="60" cy="56" r="10" fill="#ef4444" stroke="#fef08a" stroke-width="2"/>
      </svg>`
    },
    lightning_bolt: {
      cat: 'relic',
      label: 'Storm Rune',
      svg: `<svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        <polygon points="60,10 102,34 102,86 60,110 18,86 18,34" stroke="#38bdf8" stroke-width="2.5" fill="rgba(56,189,248,0.12)"/>
        <path d="M68 20L40 62H58L50 100L82 54H62Z" fill="#fde047" stroke="#00f0ff" stroke-width="2" stroke-linejoin="round"/>
      </svg>`
    },
    venom_serpent: {
      cat: 'relic',
      label: 'Venom Viper',
      svg: `<svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M60 98C34 94 24 72 34 52C44 34 78 34 86 52C94 70 80 86 60 80C46 76 46 58 60 54" stroke="#a855f7" stroke-width="4" stroke-linecap="round"/>
        <path d="M52 46L44 20L60 34L76 20L68 46" fill="rgba(16,185,129,0.35)" stroke="#4ade80" stroke-width="2.4"/>
        <circle cx="52" cy="40" r="2.5" fill="#fef08a"/><circle cx="68" cy="40" r="2.5" fill="#fef08a"/>
      </svg>`
    },
    necromancer_hand: {
      cat: 'relic',
      label: 'Arise Grasp',
      svg: `<svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="60" cy="36" r="18" fill="rgba(168,85,247,0.32)" stroke="#d8b4fe" stroke-width="2.4"/>
        <path d="M40 102V72L32 48M50 102V66L48 40M60 102V64L60 38M70 102V66L72 40M80 102V72L88 50" stroke="#c084fc" stroke-width="3.2" stroke-linecap="round"/>
      </svg>`
    },
    magic_circle: {
      cat: 'relic',
      label: 'Arcane Seal',
      svg: `<svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="60" cy="60" r="46" stroke="#fde047" stroke-width="2.4"/>
        <circle cx="60" cy="60" r="34" stroke="currentColor" stroke-width="1.8" stroke-dasharray="6 4"/>
        <polygon points="60,16 98,82 22,82" stroke="#fde047" stroke-width="2.2" fill="none"/>
        <polygon points="60,104 98,38 22,38" stroke="currentColor" stroke-width="2.2" fill="none"/>
        <circle cx="60" cy="60" r="8" fill="#fde047"/>
      </svg>`
    },
    blood_moon: {
      cat: 'relic',
      label: 'Blood Eclipse',
      svg: `<svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="56" cy="60" r="36" fill="rgba(220,38,38,0.36)" stroke="#ef4444" stroke-width="2.8"/>
        <circle cx="72" cy="54" r="28" fill="#180408"/>
        <path d="M78 30L83 42L95 47L83 52L78 64L73 52L61 47L73 42Z" fill="#fde047"/>
      </svg>`
    },
    crystal_core: {
      cat: 'relic',
      label: 'Mana Core',
      svg: `<svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        <polygon points="60,12 94,48 76,106 44,106 26,48" fill="rgba(56,189,248,0.22)" stroke="#00f0ff" stroke-width="2.8"/>
        <path d="M60 12V106M26 48H94M44 106L60 48L76 106" stroke="#bae6fd" stroke-width="1.8"/>
      </svg>`
    },
    cursed_grimoire: {
      cat: 'relic',
      label: 'Forbidden Tome',
      svg: `<svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M18 32C34 26 50 28 60 38C70 28 86 26 102 32V94C86 88 70 90 60 100C50 90 34 88 18 94Z" fill="rgba(168,85,247,0.2)" stroke="#fde047" stroke-width="2.6" stroke-linejoin="round"/>
        <path d="M60 38V100M30 48H48M30 62H48M72 48H90M72 62H90" stroke="#e9d5ff" stroke-width="2.2" stroke-linecap="round"/>
      </svg>`
    }
  };

  function sanitizeCustomSvg(raw) {
    if (!raw || typeof raw !== 'string') return '';
    let s = raw.trim()
      .replace(/^<\?xml[\s\S]*?\?>\s*/i, '')
      .replace(/^<!DOCTYPE[\s\S]*?>\s*/i, '')
      .replace(/<!--[\s\S]*?-->/g, '')
      .trim();
    const svgStart = s.search(/<svg[\s>]/i);
    const svgEnd = s.toLowerCase().lastIndexOf('</svg>');
    if (svgStart > 0 && svgEnd > svgStart) {
      s = s.slice(svgStart, svgEnd + 6).trim();
    }
    if (!/^<svg[\s>]/i.test(s) || !/<\/svg>$/i.test(s)) return '';
    s = s.replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<foreignObject[\s\S]*?<\/foreignObject>/gi, '')
      .replace(/<iframe[\s\S]*?<\/iframe>/gi, '')
      .replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
      .replace(/javascript\s*:/gi, '');
    return s.length <= 24000 ? s : '';
  }

  function stripImageBackgroundDataUrl(dataUrl, opts = {}) {
    if (!dataUrl || typeof dataUrl !== 'string') return Promise.resolve('');
    if (typeof document === 'undefined' || typeof Image === 'undefined') return Promise.resolve(dataUrl);
    if (/^data:image\/svg\+xml/i.test(dataUrl)) return Promise.resolve(dataUrl);
    if (/^data:image\/gif/i.test(dataUrl) && !opts.forceGif) return Promise.resolve(dataUrl);
    const maxSize = Number(opts.maxSize) || 256;
    const removeBg = opts.removeBg !== false;

    return new Promise((resolve) => {
      try {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          try {
            const natW = img.naturalWidth || img.width || 128;
            const natH = img.naturalHeight || img.height || 128;
            const scale = Math.min(1, maxSize / Math.max(1, natW, natH));
            const w = Math.max(1, Math.round(natW * scale));
            const h = Math.max(1, Math.round(natH * scale));
            const canvas = document.createElement('canvas');
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext('2d');
            if (!ctx) { resolve(dataUrl); return; }
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, 0, 0, w, h);

            if (!removeBg) {
              resolve(canvas.toDataURL('image/png'));
              return;
            }

            const imgData = ctx.getImageData(0, 0, w, h);
            const d = imgData.data;
            const border = [];
            let transCount = 0;
            const addSample = (x, y) => {
              const p = (y * w + x) * 4;
              if (d[p + 3] < 32) transCount++;
              border.push([d[p], d[p + 1], d[p + 2], d[p + 3]]);
            };
            for (let x = 0; x < w; x++) {
              addSample(x, 0);
              if (h > 1) addSample(x, h - 1);
            }
            for (let y = 1; y < h - 1; y++) {
              addSample(0, y);
              if (w > 1) addSample(w - 1, y);
            }

            if (border.length === 0 || (transCount / border.length) >= 0.12) {
              resolve(canvas.toDataURL('image/png'));
              return;
            }

            const rs = border.map(b => b[0]).sort((a, b) => a - b);
            const gs = border.map(b => b[1]).sort((a, b) => a - b);
            const bs = border.map(b => b[2]).sort((a, b) => a - b);
            const mid = Math.floor(border.length / 2);
            const bgR = rs[mid], bgG = gs[mid], bgB = bs[mid];
            const bgLuma = 0.299 * bgR + 0.587 * bgG + 0.114 * bgB;

            let nearBgCount = 0;
            for (let i = 0; i < border.length; i++) {
              const [r, g, b] = border[i];
              const dist = Math.hypot(r - bgR, g - bgG, b - bgB);
              if (dist <= 45) nearBgCount++;
            }
            const uniformRatio = nearBgCount / border.length;

            if (bgLuma <= 76 && uniformRatio >= 0.55) {
              // Dark / black neon icon background knockout with smooth glow feather & de-darkening
              const low = 14;
              const high = 88;
              for (let i = 0; i < d.length; i += 4) {
                const a = d[i + 3];
                if (a === 0) continue;
                const r = d[i], g = d[i + 1], b = d[i + 2];
                const dr = Math.max(0, r - bgR);
                const dg = Math.max(0, g - bgG);
                const db = Math.max(0, b - bgB);
                const dist = Math.hypot(r - bgR, g - bgG, b - bgB);
                const chroma = Math.max(r, g, b) - Math.min(r, g, b);
                const signal = Math.max(dr, dg, db, dist * 0.62) + chroma * 0.28;
                if (signal <= low) {
                  d[i + 3] = 0;
                } else if (signal < high) {
                  const t = Math.pow((signal - low) / (high - low), 0.78);
                  const inv = 1 / Math.max(0.22, t);
                  d[i] = Math.min(255, Math.max(0, Math.round(bgR + (r - bgR) * inv)));
                  d[i + 1] = Math.min(255, Math.max(0, Math.round(bgG + (g - bgG) * inv)));
                  d[i + 2] = Math.min(255, Math.max(0, Math.round(bgB + (b - bgB) * inv)));
                  d[i + 3] = Math.min(a, Math.round(t * 255));
                }
              }
              ctx.putImageData(imgData, 0, 0);
              resolve(canvas.toDataURL('image/png'));
              return;
            }

            if (uniformRatio >= 0.65) {
              // White / light / solid outer rectangle: 4-edge BFS flood-fill keeps interior highlights intact
              const visited = new Uint8Array(w * h);
              const removed = new Uint8Array(w * h);
              const queue = new Int32Array(w * h);
              let head = 0, tail = 0;
              const hardDist = 52;
              const tryPush = (x, y) => {
                const idx = y * w + x;
                if (visited[idx]) return;
                const p = idx * 4;
                const dist = Math.hypot(d[p] - bgR, d[p + 1] - bgG, d[p + 2] - bgB);
                if (dist <= hardDist) {
                  visited[idx] = 1;
                  queue[tail++] = idx;
                }
              };
              for (let x = 0; x < w; x++) { tryPush(x, 0); tryPush(x, h - 1); }
              for (let y = 1; y < h - 1; y++) { tryPush(0, y); tryPush(w - 1, y); }
              while (head < tail) {
                const idx = queue[head++];
                removed[idx] = 1;
                d[idx * 4 + 3] = 0;
                const cx = idx % w;
                const cy = (idx - cx) / w;
                if (cx > 0) tryPush(cx - 1, cy);
                if (cx < w - 1) tryPush(cx + 1, cy);
                if (cy > 0) tryPush(cx, cy - 1);
                if (cy < h - 1) tryPush(cx, cy + 1);
              }
              // Smooth 1px edge feathering next to flood-filled region
              for (let y = 1; y < h - 1; y++) {
                for (let x = 1; x < w - 1; x++) {
                  const idx = y * w + x;
                  if (removed[idx]) continue;
                  if (removed[idx - 1] || removed[idx + 1] || removed[idx - w] || removed[idx + w]) {
                    const p = idx * 4;
                    const dist = Math.hypot(d[p] - bgR, d[p + 1] - bgG, d[p + 2] - bgB);
                    if (dist <= 84) {
                      const ratio = Math.max(0, Math.min(1, (dist - 36) / 48));
                      d[p + 3] = Math.min(d[p + 3], Math.round(ratio * 255));
                    }
                  }
                }
              }
              ctx.putImageData(imgData, 0, 0);
              resolve(canvas.toDataURL('image/png'));
              return;
            }

            resolve(canvas.toDataURL('image/png'));
          } catch (innerErr) {
            resolve(dataUrl);
          }
        };
        img.onerror = () => resolve(dataUrl);
        img.src = dataUrl;
      } catch (e) {
        resolve(dataUrl);
      }
    });
  }

  function generateNeonBadgeSvg(glyph = '⚡', shape = 'hex', glow = '#00f0ff') {
    const cleanGlyph = esc(String(glyph || '⚡').trim().slice(0, 4) || '⚡');
    const c = /^#[0-9a-f]{3,8}$/i.test(String(glow || '')) ? glow : '#00f0ff';
    let bgShape = '';
    if (shape === 'circle') {
      bgShape = `<circle cx="60" cy="60" r="44" fill="rgba(7,16,41,0.75)" stroke="${c}" stroke-width="3.2"/><circle cx="60" cy="60" r="35" stroke="${c}" stroke-width="1.4" stroke-dasharray="5 4" stroke-opacity="0.7"/>`;
    } else if (shape === 'diamond') {
      bgShape = `<polygon points="60,10 110,60 60,110 10,60" fill="rgba(7,16,41,0.75)" stroke="${c}" stroke-width="3.2" stroke-linejoin="round"/><polygon points="60,22 98,60 60,98 22,60" stroke="${c}" stroke-width="1.5" stroke-opacity="0.7"/>`;
    } else if (shape === 'shield') {
      bgShape = `<path d="M60 12L100 28V58C100 84 80 101 60 110C40 101 20 84 20 58V28Z" fill="rgba(7,16,41,0.75)" stroke="${c}" stroke-width="3.2" stroke-linejoin="round"/>`;
    } else {
      bgShape = `<polygon points="60,10 104,35 104,85 60,110 16,85 16,35" fill="rgba(7,16,41,0.75)" stroke="${c}" stroke-width="3.2" stroke-linejoin="round"/><polygon points="60,20 95,40 95,80 60,100 25,80 25,40" stroke="${c}" stroke-width="1.4" stroke-opacity="0.65"/>`;
    }
    const fontSize = cleanGlyph.length >= 3 ? 28 : 40;
    return `<svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">${bgShape}<text x="60" y="72" fill="#f8fafc" font-family="sans-serif" font-weight="900" font-size="${fontSize}" text-anchor="middle">${cleanGlyph}</text></svg>`;
  }

  function loadCustomIcons() {
    try {
      let raw = null;
      if (window.ChatHubStorage && typeof window.ChatHubStorage.get === 'function') {
        raw = window.ChatHubStorage.get(CUSTOM_ICONS_STORAGE_KEY);
      } else {
        raw = localStorage.getItem(CUSTOM_ICONS_STORAGE_KEY);
      }
      const arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr : [];
    } catch (e) {
      return [];
    }
  }

  function saveCustomIcons(list) {
    try {
      const json = JSON.stringify(list || []);
      if (window.ChatHubStorage && typeof window.ChatHubStorage.set === 'function') {
        window.ChatHubStorage.set(CUSTOM_ICONS_STORAGE_KEY, json);
        if (json.length > 1500000) {
          try { localStorage.removeItem(CUSTOM_ICONS_STORAGE_KEY); } catch (e) {}
        }
      } else {
        localStorage.setItem(CUSTOM_ICONS_STORAGE_KEY, json);
      }
    } catch (e) {}
  }

  function getAllSvgIcons() {
    const map = { ...NEON_SVG_ICONS };
    loadCustomIcons().forEach(ci => {
      if (!ci || !ci.id) return;
      const cleanSvg = ci.svg ? sanitizeCustomSvg(ci.svg) : '';
      const cleanImg = (!cleanSvg && isSafeUrl(ci.imageUrl)) ? ci.imageUrl : '';
      if (!cleanSvg && !cleanImg) return;
      map[ci.id] = {
        cat: 'custom',
        isCustom: true,
        marketplacePackId: ci.marketplacePackId || null,
        label: String(ci.label || 'Custom').slice(0, 18),
        svg: cleanSvg || `<img src="${esc(cleanImg)}" alt="${esc(ci.label || 'Icon')}">`,
        imageUrl: cleanImg,
        rawSvg: cleanSvg
      };
    });
    return map;
  }

  function getSvgIconEntry(key, fallbackCustomData = '') {
    const all = getAllSvgIcons();
    if (key && all[key]) return all[key];
    if (fallbackCustomData) {
      const s = sanitizeCustomSvg(fallbackCustomData);
      if (s) return { label: 'Custom', svg: s, rawSvg: s };
      if (isSafeUrl(fallbackCustomData)) return { label: 'Custom', svg: `<img src="${esc(fallbackCustomData)}" alt="Icon">`, imageUrl: fallbackCustomData };
    }
    return null;
  }

  const BUILT_IN_FRAMES = [
    { id: 'none', label: 'None (No Border)', icon: '⬜', isOrnate: false },
    { id: 'tech_brackets', label: 'Tech Brackets', icon: '⌜⌟', isOrnate: false },
    { id: 'cyber_bevel', label: 'Cyber Bevel', icon: '▱', isOrnate: false },
    { id: 'imperial_ornate', label: 'Ornate Murim', icon: '❖', isOrnate: true },
    { id: 'demonic_thorn', label: 'DEVOUR Thorn', icon: '🔥', isOrnate: true },
    { id: 'void_seraph', label: 'Seraph Wings', icon: '🪽', isOrnate: true },
    { id: 'abyssal_crown', label: 'Monarch Crown', icon: '👑', isOrnate: true },
    { id: 'frost_monarch', label: 'Frost Crystal', icon: '❄️', isOrnate: true },
    { id: 'necromancer_rib', label: 'Bone Scythe', icon: '💀', isOrnate: true },
    { id: 'divine_lotus', label: 'Murim Lotus', icon: '🪷', isOrnate: true },
    { id: 'blueprint_double', label: 'Blueprint Box', icon: '📐', isOrnate: false },
    { id: 'celestial_arcane', label: 'Celestial Halo', icon: '⚜️', isOrnate: true },
    { id: 'cursed_chains', label: 'Blood Chains', icon: '⛓️', isOrnate: true },
    { id: 'cyber_circuit', label: 'Holo Circuit', icon: '🧬', isOrnate: true },
    { id: 'dragon_scroll', label: 'Dragon Scroll', icon: '🐉', isOrnate: true },
    { id: 'glitch_corrupted', label: 'Glitch Error', icon: '⚡', isOrnate: false },
    { id: 'glass_hud', label: 'Glass HUD', icon: '💎', isOrnate: false },
    { id: 'comic_ink', label: 'Comic Ink', icon: '💥', isOrnate: false }
  ];

  function loadCustomFrames() {
    try {
      let raw = null;
      if (window.ChatHubStorage && typeof window.ChatHubStorage.get === 'function') {
        raw = window.ChatHubStorage.get(CUSTOM_FRAMES_STORAGE_KEY);
      } else {
        raw = localStorage.getItem(CUSTOM_FRAMES_STORAGE_KEY);
      }
      const arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr : [];
    } catch (e) {
      return [];
    }
  }

  function saveCustomFrames(list) {
    try {
      const json = JSON.stringify(list || []);
      if (window.ChatHubStorage && typeof window.ChatHubStorage.set === 'function') {
        window.ChatHubStorage.set(CUSTOM_FRAMES_STORAGE_KEY, json);
      } else {
        localStorage.setItem(CUSTOM_FRAMES_STORAGE_KEY, json);
      }
    } catch (e) {}
  }

  function normalizeSvgFrameMarkup(rawSvg, clsName = 'msw-thorn-svg-frame') {
    const clean = sanitizeCustomSvg(rawSvg);
    if (!clean) return '';
    return clean.replace(/^<svg\b([^>]*)>/i, (_, attrs) => {
      let a = attrs || '';
      if (!/\bclass\s*=/i.test(a)) a += ` class="${clsName}"`;
      if (!/\bpreserveAspectRatio\s*=/i.test(a)) a += ' preserveAspectRatio="none"';
      if (!/\baria-hidden\s*=/i.test(a)) a += ' aria-hidden="true"';
      return `<svg${a}>`;
    });
  }

  function getThornFrameSvg() {
    // Organic spiky DEVOUR vine + razor thorns + corner feathered wing flare using reactive theme colors
    return `<svg class="msw-thorn-svg-frame" viewBox="0 0 320 400" preserveAspectRatio="none" aria-hidden="true">
      <path d="M18 14 C36 2 58 18 82 10 C108 2 132 16 160 10 C188 16 212 2 238 10 C264 16 286 2 304 16 C318 32 304 58 312 86 C318 118 304 150 312 186 C318 222 304 256 312 292 C318 328 304 358 304 384 C286 398 260 384 234 391 C206 398 182 384 160 390 C138 384 114 398 86 391 C60 384 34 398 16 384 C4 366 16 336 8 302 C2 268 16 232 8 196 C2 160 16 124 8 88 C2 54 14 28 18 14 Z"
        fill="none" stroke="var(--sys-accent-2)" stroke-width="8" stroke-opacity="0.45" stroke-linejoin="round"/>
      <path d="M14 14 L22 2 L32 12 L46 2 L58 12 L74 2 L88 12 L104 2 L118 12 L134 2 L148 11 L160 2 L172 11 L186 2 L202 12 L216 2 L232 12 L246 2 L262 12 L276 2 L290 12 L308 4 L318 18 L307 34 L318 50 L307 68 L318 86 L307 104 L318 124 L307 144 L318 164 L307 184 L318 206 L307 228 L318 250 L307 272 L318 294 L307 316 L318 338 L307 360 L316 382 L298 397 L282 386 L264 397 L246 386 L228 397 L210 386 L192 397 L174 386 L160 396 L146 386 L128 397 L110 386 L92 397 L74 386 L56 397 L38 386 L22 397 L6 382 L14 360 L3 338 L14 316 L3 294 L14 272 L3 250 L14 228 L3 206 L14 184 L3 164 L14 144 L3 124 L14 104 L3 86 L14 68 L3 50 L14 34 L4 18 Z"
        fill="none" stroke="var(--sys-accent)" stroke-width="3.4" stroke-linejoin="round"/>
      <path d="M14 16 C40 6 70 22 100 11 C130 22 160 6 190 15 C220 6 260 10 306 20 M14 384 C45 372 78 392 114 381 C150 392 184 374 218 384 C254 392 282 376 306 384"
        fill="none" stroke="var(--sys-accent-2)" stroke-width="2.6" stroke-linecap="round"/>
      <path d="M16 18 C24 68 8 118 16 170 C24 222 8 282 16 380 M304 18 C296 74 312 130 304 188 C296 244 312 310 304 380"
        fill="none" stroke="var(--sys-accent-2)" stroke-width="2.6" stroke-linecap="round"/>
      <path d="M268 12 Q298 6 312 36 M280 20 Q302 22 308 50 M10 36 Q20 12 48 14 M10 364 Q22 388 50 386 M270 386 Q298 388 310 362"
        fill="none" stroke="var(--sys-accent)" stroke-width="2.4" stroke-linecap="round"/>
      <rect x="13" y="13" width="294" height="374" rx="16" fill="none" stroke="var(--sys-accent-2)" stroke-width="1.6" stroke-opacity="0.72" stroke-dasharray="10 5"/>
    </svg>`;
  }

  function getEmblemFrameSvg(frameStyle = 'demonic_thorn', cfg = null) {
    if (cfg && cfg.customFrameSvg) {
      return `<svg class="msw-emblem-frame-svg" viewBox="0 0 120 120" preserveAspectRatio="none" aria-hidden="true">
        <rect x="4" y="4" width="112" height="112" rx="12" fill="none" stroke="var(--sys-accent)" stroke-width="2.4"/>
        <rect x="9" y="9" width="102" height="102" rx="9" fill="none" stroke="var(--sys-accent-2)" stroke-width="1.5" stroke-dasharray="6 4"/>
      </svg>`;
    }
    if (frameStyle === 'demonic_thorn') {
      return `<svg class="msw-emblem-frame-svg" viewBox="0 0 120 120" preserveAspectRatio="none" aria-hidden="true">
        <path d="M9 11 L20 3 L32 10 L46 3 L60 10 L74 3 L88 10 L100 3 L111 11 L117 22 L110 36 L117 50 L110 64 L117 78 L110 92 L117 108 L109 112 L98 117 L86 110 L72 117 L60 110 L48 117 L34 110 L22 117 L9 110 L3 94 L10 80 L3 66 L10 52 L3 38 L10 24 Z"
          fill="none" stroke="var(--sys-accent)" stroke-width="2.8" stroke-linejoin="round"/>
        <path d="M12 14 C34 6 58 14 82 8 C96 5 106 10 110 20 M10 106 C36 114 64 106 90 113 M11 16 C6 46 14 78 9 104 M109 16 C114 48 106 80 111 104"
          fill="none" stroke="var(--sys-accent-2)" stroke-width="2.1" stroke-linecap="round"/>
        <rect x="7" y="7" width="106" height="106" rx="10" fill="none" stroke="var(--sys-accent-2)" stroke-width="1.6" stroke-dasharray="7 3"/>
      </svg>`;
    }
    if (frameStyle === 'void_seraph' || frameStyle === 'celestial_arcane') {
      return `<svg class="msw-emblem-frame-svg" viewBox="0 0 120 120" preserveAspectRatio="none" aria-hidden="true">
        <rect x="6" y="6" width="108" height="108" rx="14" fill="none" stroke="var(--sys-accent)" stroke-width="2.2"/>
        <path d="M4 34 Q14 12 36 6 M116 34 Q106 12 84 6 M4 86 Q14 108 36 114 M116 86 Q106 108 84 114" fill="none" stroke="var(--sys-accent-2)" stroke-width="2.6" stroke-linecap="round"/>
        <polygon points="60,2 65,9 60,16 55,9" fill="var(--sys-accent)"/>
        <polygon points="60,104 65,111 60,118 55,111" fill="var(--sys-accent)"/>
      </svg>`;
    }
    if (frameStyle === 'abyssal_crown' || frameStyle === 'necromancer_rib') {
      return `<svg class="msw-emblem-frame-svg" viewBox="0 0 120 120" preserveAspectRatio="none" aria-hidden="true">
        <path d="M10 14 L24 4 L40 12 L60 2 L80 12 L96 4 L110 14 L115 36 L108 60 L115 84 L110 108 L94 116 L60 110 L26 116 L10 108 L5 84 L12 60 L5 36 Z"
          fill="none" stroke="var(--sys-accent)" stroke-width="2.4" stroke-linejoin="round"/>
        <rect x="10" y="10" width="100" height="100" rx="8" fill="none" stroke="var(--sys-accent-2)" stroke-width="1.4" stroke-dasharray="5 3"/>
      </svg>`;
    }
    if (frameStyle === 'frost_monarch' || frameStyle === 'cyber_circuit') {
      return `<svg class="msw-emblem-frame-svg" viewBox="0 0 120 120" preserveAspectRatio="none" aria-hidden="true">
        <polygon points="18,4 102,4 116,18 116,102 102,116 18,116 4,102 4,18" fill="none" stroke="var(--sys-accent)" stroke-width="2.3"/>
        <path d="M4 26 L26 4 M94 4 L116 26 M4 94 L26 116 M94 116 L116 94" stroke="var(--sys-accent-2)" stroke-width="2.2"/>
      </svg>`;
    }
    if (frameStyle === 'cursed_chains' || frameStyle === 'dragon_scroll' || frameStyle === 'divine_lotus' || frameStyle === 'imperial_ornate') {
      return `<svg class="msw-emblem-frame-svg" viewBox="0 0 120 120" preserveAspectRatio="none" aria-hidden="true">
        <rect x="6" y="6" width="108" height="108" rx="10" fill="none" stroke="var(--sys-accent)" stroke-width="2.2" stroke-dasharray="${frameStyle === 'cursed_chains' ? '10 4' : 'none'}"/>
        <circle cx="14" cy="14" r="4.5" fill="none" stroke="var(--sys-accent-2)" stroke-width="2"/>
        <circle cx="106" cy="14" r="4.5" fill="none" stroke="var(--sys-accent-2)" stroke-width="2"/>
        <circle cx="14" cy="106" r="4.5" fill="none" stroke="var(--sys-accent-2)" stroke-width="2"/>
        <circle cx="106" cy="106" r="4.5" fill="none" stroke="var(--sys-accent-2)" stroke-width="2"/>
      </svg>`;
    }
    return '';
  }

  function generateCustomOrnateFrameSvg(motif = 'thorn', density = 'medium', colorMode = 'theme', colorA = '#fde047', colorB = '#ef4444') {
    const c1 = colorMode === 'custom' && /^#[0-9a-f]{3,8}$/i.test(colorA) ? colorA : 'var(--sys-accent)';
    const c2 = colorMode === 'custom' && /^#[0-9a-f]{3,8}$/i.test(colorB) ? colorB : 'var(--sys-accent-2)';
    const stepsX = density === 'high' ? 14 : (density === 'low' ? 6 : 10);
    const stepsY = density === 'high' ? 18 : (density === 'low' ? 8 : 12);
    let paths = `<rect x="11" y="11" width="298" height="378" rx="14" fill="none" stroke="${c2}" stroke-width="2" stroke-opacity="0.75"/>`;

    if (motif === 'wings') {
      paths += `<path d="M6 74 C12 28 38 10 92 8 M314 74 C308 28 282 10 228 8 M6 326 C12 372 38 390 92 392 M314 326 C308 372 282 390 228 392" fill="none" stroke="${c1}" stroke-width="3.2" stroke-linecap="round"/>
        <path d="M10 96 Q24 52 56 26 M310 96 Q296 52 264 26 M10 304 Q24 348 56 374 M310 304 Q296 348 264 374" fill="none" stroke="${c2}" stroke-width="2.4" stroke-linecap="round"/>
        <polygon points="160,2 169,12 160,22 151,12" fill="${c1}"/><polygon points="160,378 169,388 160,398 151,388" fill="${c1}"/>`;
    } else if (motif === 'crystal') {
      paths += `<polygon points="18,6 302,6 314,18 314,382 302,394 18,394 6,382 6,18" fill="none" stroke="${c1}" stroke-width="3"/>
        <polygon points="160,2 174,14 160,24 146,14" fill="none" stroke="${c1}" stroke-width="2.2"/><polygon points="160,376 174,386 160,398 146,386" fill="none" stroke="${c1}" stroke-width="2.2"/>
        <path d="M4 46 L26 24 L46 4 M274 4 L294 24 L316 46 M4 354 L26 376 L46 396 M274 396 L294 376 L316 354" fill="none" stroke="${c2}" stroke-width="2.4"/>`;
    } else if (motif === 'chains') {
      paths += `<rect x="7" y="7" width="306" height="386" rx="8" fill="none" stroke="${c1}" stroke-width="3" stroke-dasharray="14 6"/>
        <rect x="15" y="15" width="290" height="370" rx="6" fill="none" stroke="${c2}" stroke-width="2" stroke-dasharray="6 8"/>
        <circle cx="16" cy="16" r="7" fill="none" stroke="${c1}" stroke-width="2.5"/><circle cx="304" cy="16" r="7" fill="none" stroke="${c1}" stroke-width="2.5"/>
        <circle cx="16" cy="384" r="7" fill="none" stroke="${c1}" stroke-width="2.5"/><circle cx="304" cy="384" r="7" fill="none" stroke="${c1}" stroke-width="2.5"/>`;
    } else if (motif === 'lotus') {
      paths += `<path d="M160 3 Q174 16 188 10 Q176 22 160 22 Q144 22 132 10 Q146 16 160 3 Z" fill="none" stroke="${c1}" stroke-width="2.2"/>
        <path d="M160 397 Q174 384 188 390 Q176 378 160 378 Q144 378 132 390 Q146 384 160 397 Z" fill="none" stroke="${c1}" stroke-width="2.2"/>
        <path d="M10 38 Q12 12 38 10 L76 10 M310 38 Q308 12 282 10 L244 10 M10 362 Q12 388 38 390 L76 390 M310 362 Q308 388 282 390 L244 390" fill="none" stroke="${c1}" stroke-width="2.8" stroke-linecap="round"/>`;
    } else {
      // Procedural spiky thorns or demon crown spikes around full perimeter
      let pts = [];
      for (let i = 0; i < stepsX; i++) {
        const x1 = 14 + (292 * i) / stepsX;
        const xMid = 14 + (292 * (i + 0.5)) / stepsX;
        pts.push(`${i === 0 ? 'M' : 'L'}${x1.toFixed(1)} 14 L${xMid.toFixed(1)} ${motif === 'crown' && i === Math.floor(stepsX / 2) ? 1 : 3}`);
      }
      for (let j = 0; j < stepsY; j++) {
        const y1 = 14 + (372 * j) / stepsY;
        const yMid = 14 + (372 * (j + 0.5)) / stepsY;
        pts.push(`L306 ${y1.toFixed(1)} L317 ${yMid.toFixed(1)}`);
      }
      for (let i = stepsX; i > 0; i--) {
        const x1 = 14 + (292 * i) / stepsX;
        const xMid = 14 + (292 * (i - 0.5)) / stepsX;
        pts.push(`L${x1.toFixed(1)} 386 L${xMid.toFixed(1)} 397`);
      }
      for (let j = stepsY; j > 0; j--) {
        const y1 = 14 + (372 * j) / stepsY;
        const yMid = 14 + (372 * (j - 0.5)) / stepsY;
        pts.push(`L14 ${y1.toFixed(1)} L3 ${yMid.toFixed(1)}`);
      }
      pts.push('Z');
      paths += `<path d="${pts.join(' ')}" fill="none" stroke="${c1}" stroke-width="3.2" stroke-linejoin="round"/>
        <path d="M12 18 Q40 6 70 16 M250 16 Q280 6 308 18 M12 382 Q40 394 70 384 M250 384 Q280 394 308 382" fill="none" stroke="${c2}" stroke-width="2.4" stroke-linecap="round"/>`;
    }
    return `<svg class="msw-thorn-svg-frame" viewBox="0 0 320 400" preserveAspectRatio="none" aria-hidden="true">${paths}</svg>`;
  }

  function getAllFrames() {
    const customList = loadCustomFrames().map(cf => ({
      id: String(cf.id),
      label: String(cf.label || 'Custom Frame').slice(0, 18),
      icon: '✨',
      isCustom: true,
      isOrnate: true,
      svg: normalizeSvgFrameMarkup(cf.svg, 'msw-thorn-svg-frame')
    })).filter(cf => cf.id && cf.svg);
    return [...BUILT_IN_FRAMES, ...customList];
  }

  function getFrameSvgOverlay(frameStyle, customFrameSvg = '') {
    if (customFrameSvg) {
      const normalized = normalizeSvgFrameMarkup(customFrameSvg, 'msw-thorn-svg-frame');
      if (normalized) return normalized;
    }
    const customSaved = loadCustomFrames().find(cf => String(cf.id) === String(frameStyle));
    if (customSaved && customSaved.svg) {
      return normalizeSvgFrameMarkup(customSaved.svg, 'msw-thorn-svg-frame');
    }
    if (frameStyle === 'demonic_thorn') return getThornFrameSvg();
    if (frameStyle === 'void_seraph') {
      return `<svg class="msw-thorn-svg-frame" viewBox="0 0 320 400" preserveAspectRatio="none" aria-hidden="true">
        <rect x="11" y="11" width="298" height="378" rx="18" fill="none" stroke="var(--sys-accent)" stroke-width="2.2"/>
        <rect x="17" y="17" width="286" height="366" rx="13" fill="none" stroke="var(--sys-accent-2)" stroke-width="1.2" stroke-dasharray="8 4"/>
        <path d="M4 84 C8 34 38 10 104 8 M316 84 C312 34 282 10 216 8 M6 108 Q24 58 66 24 M314 108 Q296 58 254 24 M6 132 Q20 88 46 54 M314 132 Q300 88 274 54" fill="none" stroke="var(--sys-accent)" stroke-width="2.8" stroke-linecap="round"/>
        <path d="M4 316 C8 366 38 390 104 392 M316 316 C312 366 282 390 216 392 M6 292 Q24 342 66 376 M314 292 Q296 342 254 376" fill="none" stroke="var(--sys-accent-2)" stroke-width="2.4" stroke-linecap="round"/>
        <circle cx="160" cy="10" r="6" fill="none" stroke="var(--sys-accent)" stroke-width="2"/>
        <polygon points="160,378 167,388 160,398 153,388" fill="var(--sys-accent)"/>
      </svg>`;
    }
    if (frameStyle === 'abyssal_crown') {
      return `<svg class="msw-thorn-svg-frame" viewBox="0 0 320 400" preserveAspectRatio="none" aria-hidden="true">
        <path d="M16 26 L44 6 L78 18 L118 4 L144 16 L160 2 L176 16 L202 4 L242 18 L276 6 L304 26 L316 62 L306 104 L316 154 L306 200 L316 246 L306 296 L316 338 L304 374 L274 394 L238 384 L198 396 L160 384 L122 396 L82 384 L46 394 L16 374 L4 338 L14 296 L4 246 L14 200 L4 154 L14 104 L4 62 Z"
          fill="none" stroke="var(--sys-accent)" stroke-width="3" stroke-linejoin="round"/>
        <rect x="14" y="16" width="292" height="368" rx="14" fill="none" stroke="var(--sys-accent-2)" stroke-width="1.8" stroke-dasharray="10 4"/>
      </svg>`;
    }
    if (frameStyle === 'frost_monarch') {
      return `<svg class="msw-thorn-svg-frame" viewBox="0 0 320 400" preserveAspectRatio="none" aria-hidden="true">
        <polygon points="28,6 292,6 314,28 314,372 292,394 28,394 6,372 6,28" fill="none" stroke="var(--sys-accent)" stroke-width="2.6"/>
        <polygon points="36,14 284,14 306,36 306,364 284,386 36,386 14,364 14,36" fill="none" stroke="var(--sys-accent-2)" stroke-width="1.3" stroke-dasharray="12 5"/>
        <path d="M6 52 L52 6 M268 6 L314 52 M6 348 L52 394 M268 394 L314 348 M148 6 L160 18 L172 6 M148 394 L160 382 L172 394" fill="none" stroke="var(--sys-accent)" stroke-width="2.4" stroke-linejoin="round"/>
      </svg>`;
    }
    if (frameStyle === 'necromancer_rib') {
      return `<svg class="msw-thorn-svg-frame" viewBox="0 0 320 400" preserveAspectRatio="none" aria-hidden="true">
        <path d="M12 18 C52 2 98 22 146 10 M174 10 C222 22 268 2 308 18 M12 382 C52 398 98 378 146 390 M174 390 C222 378 268 398 308 382" fill="none" stroke="var(--sys-accent)" stroke-width="3" stroke-linecap="round"/>
        <path d="M16 42 C2 64 24 84 12 108 C2 132 24 152 12 178 C2 204 24 228 12 254 C2 280 24 306 12 332 L20 368 M304 42 C318 64 296 84 308 108 C318 132 296 152 308 178 C318 204 296 228 308 254 C318 280 296 306 308 332 L300 368" fill="none" stroke="var(--sys-accent-2)" stroke-width="2.5" stroke-linecap="round"/>
        <polygon points="160,4 166,14 160,24 154,14" fill="var(--sys-accent)"/>
        <polygon points="160,376 166,386 160,396 154,386" fill="var(--sys-accent)"/>
      </svg>`;
    }
    if (frameStyle === 'divine_lotus') {
      return `<svg class="msw-thorn-svg-frame" viewBox="0 0 320 400" preserveAspectRatio="none" aria-hidden="true">
        <rect x="12" y="12" width="296" height="376" rx="14" fill="none" stroke="var(--sys-accent)" stroke-width="2"/>
        <path d="M160 2 Q176 18 194 12 Q178 26 160 26 Q142 26 126 12 Q144 18 160 2 Z M160 398 Q176 382 194 388 Q178 374 160 374 Q142 374 126 388 Q144 382 160 398 Z" fill="none" stroke="var(--sys-accent)" stroke-width="2.4"/>
        <path d="M12 50 C14 20 26 12 62 12 M308 50 C306 20 294 12 258 12 M12 350 C14 380 26 388 62 388 M308 350 C306 380 294 388 258 388" fill="none" stroke="var(--sys-accent-2)" stroke-width="2.8" stroke-linecap="round"/>
      </svg>`;
    }
    if (frameStyle === 'celestial_arcane') {
      return `<svg class="msw-thorn-svg-frame" viewBox="0 0 320 400" preserveAspectRatio="none" aria-hidden="true">
        <rect x="8" y="8" width="304" height="384" rx="14" fill="none" stroke="var(--sys-accent)" stroke-width="2.2"/>
        <rect x="14" y="14" width="292" height="372" rx="10" fill="none" stroke="var(--sys-accent-2)" stroke-width="1.2" stroke-dasharray="6 4"/>
        <path d="M10 48 C18 22 36 16 64 10 M310 48 C302 22 284 16 256 10 M10 352 C18 378 36 384 64 390 M310 352 C302 378 284 384 256 390" fill="none" stroke="var(--sys-accent)" stroke-width="2.8" stroke-linecap="round"/>
        <polygon points="160,3 166,11 160,19 154,11" fill="var(--sys-accent)"/>
        <polygon points="160,381 166,389 160,397 154,389" fill="var(--sys-accent)"/>
      </svg>`;
    }
    if (frameStyle === 'cursed_chains') {
      return `<svg class="msw-thorn-svg-frame" viewBox="0 0 320 400" preserveAspectRatio="none" aria-hidden="true">
        <rect x="9" y="9" width="302" height="382" rx="8" fill="none" stroke="var(--sys-accent-2)" stroke-width="2.6" stroke-dasharray="14 6"/>
        <path d="M4 34 L34 4 M286 4 L316 34 M4 366 L34 396 M286 396 L316 366" stroke="var(--sys-accent)" stroke-width="3.2" stroke-linecap="round"/>
        <circle cx="16" cy="16" r="5" fill="none" stroke="var(--sys-accent)" stroke-width="2.2"/>
        <circle cx="304" cy="16" r="5" fill="none" stroke="var(--sys-accent)" stroke-width="2.2"/>
        <circle cx="16" cy="384" r="5" fill="none" stroke="var(--sys-accent)" stroke-width="2.2"/>
        <circle cx="304" cy="384" r="5" fill="none" stroke="var(--sys-accent)" stroke-width="2.2"/>
      </svg>`;
    }
    if (frameStyle === 'cyber_circuit') {
      return `<svg class="msw-thorn-svg-frame" viewBox="0 0 320 400" preserveAspectRatio="none" aria-hidden="true">
        <path d="M12 40 V12 H66 L80 20 H130 M308 40 V12 H254 L240 20 H190 M12 360 V388 H66 L80 380 H130 M308 360 V388 H254 L240 380 H190" fill="none" stroke="var(--sys-accent)" stroke-width="2.4" stroke-linejoin="round"/>
        <circle cx="130" cy="20" r="3" fill="var(--sys-accent)"/><circle cx="190" cy="20" r="3" fill="var(--sys-accent)"/>
        <circle cx="130" cy="380" r="3" fill="var(--sys-accent)"/><circle cx="190" cy="380" r="3" fill="var(--sys-accent)"/>
      </svg>`;
    }
    if (frameStyle === 'dragon_scroll') {
      return `<svg class="msw-thorn-svg-frame" viewBox="0 0 320 400" preserveAspectRatio="none" aria-hidden="true">
        <path d="M10 38 H28 V16 H52 M310 38 H292 V16 H268 M10 362 H28 V384 H52 M310 362 H292 V384 H268" fill="none" stroke="var(--sys-accent)" stroke-width="2.8" stroke-linejoin="round"/>
        <rect x="14" y="14" width="292" height="372" rx="4" fill="none" stroke="var(--sys-accent-2)" stroke-width="1.4" stroke-opacity="0.65"/>
      </svg>`;
    }
    return '';
  }

  /* --------------------------------------------------------------------------
     7 CURATED MANHWA SYSTEM THEMES (Clean helpers prevent id/label leakage)
     -------------------------------------------------------------------------- */
  const THEMES = {
    hunter_blue: {
      id: 'hunter_blue',
      label: '🟦 Hunter Blue',
      accentColor: '#00f0ff',
      secondaryColor: '#38bdf8',
      bgColor: '#041226',
      bgOpacity: 0.94,
      frameStyle: 'tech_brackets',
      fontStyle: 'hud',
      scanlines: true,
      gridPattern: true,
      sparkles: false,
      glowIntensity: 'high'
    },
    shadow_violet: {
      id: 'shadow_violet',
      label: '🟪 Shadow Monarch',
      accentColor: '#a855f7',
      secondaryColor: '#d8b4fe',
      bgColor: '#0f0624',
      bgOpacity: 0.95,
      frameStyle: 'cyber_bevel',
      fontStyle: 'hud',
      scanlines: true,
      gridPattern: true,
      sparkles: false,
      glowIntensity: 'high'
    },
    crimson_danger: {
      id: 'crimson_danger',
      label: '🟥 Penalty Crimson',
      accentColor: '#ef4444',
      secondaryColor: '#fb7185',
      bgColor: '#1f060c',
      bgOpacity: 0.95,
      frameStyle: 'glitch_corrupted',
      fontStyle: 'mono',
      scanlines: true,
      gridPattern: false,
      sparkles: false,
      glowIntensity: 'high'
    },
    murim_gold: {
      id: 'murim_gold',
      label: '🟨 Murim Gold',
      accentColor: '#facc15',
      secondaryColor: '#fde68a',
      bgColor: '#1a1204',
      bgOpacity: 0.95,
      frameStyle: 'imperial_ornate',
      fontStyle: 'serif',
      scanlines: false,
      gridPattern: false,
      sparkles: true,
      glowIntensity: 'medium'
    },
    cyber_green: {
      id: 'cyber_green',
      label: '🟩 Cyber Terminal',
      accentColor: '#10b981',
      secondaryColor: '#6ee7b7',
      bgColor: '#031912',
      bgOpacity: 0.94,
      frameStyle: 'cyber_bevel',
      fontStyle: 'mono',
      scanlines: true,
      gridPattern: true,
      sparkles: false,
      glowIntensity: 'medium'
    },
    otome_rose: {
      id: 'otome_rose',
      label: '🩷 Otome Love OS',
      accentColor: '#ec4899',
      secondaryColor: '#fbcfe8',
      bgColor: '#25091d',
      bgOpacity: 0.92,
      frameStyle: 'glass_hud',
      fontStyle: 'serif',
      scanlines: false,
      gridPattern: false,
      sparkles: true,
      glowIntensity: 'medium'
    },
    comic_pop: {
      id: 'comic_pop',
      label: '🗯️ Comic Pop Box',
      accentColor: '#facc15',
      secondaryColor: '#38bdf8',
      bgColor: '#1e293b',
      bgOpacity: 0.98,
      frameStyle: 'comic_ink',
      fontStyle: 'manhwa',
      scanlines: false,
      gridPattern: false,
      sparkles: false,
      glowIntensity: 'low'
    }
  };

  function themeProps(themeId) {
    const t = THEMES[themeId] || THEMES.hunter_blue;
    return {
      themeId: t.id,
      accentColor: t.accentColor,
      secondaryColor: t.secondaryColor,
      bgColor: t.bgColor,
      bgOpacity: t.bgOpacity,
      frameStyle: t.frameStyle,
      fontStyle: t.fontStyle,
      scanlines: t.scanlines,
      gridPattern: t.gridPattern,
      sparkles: t.sparkles,
      glowIntensity: t.glowIntensity
    };
  }

  /* --------------------------------------------------------------------------
     17 MANHWA SYSTEM ARCHETYPE PRESETS
     -------------------------------------------------------------------------- */
  const PRESETS = [
    {
      id: 'notification',
      icon: '🔔',
      name: 'Quest / Alert',
      desc: 'Urgent mission & system prompt',
      config: {
        presetId: 'notification',
        ...themeProps('hunter_blue'),
        animation: 'hologram',
        sfx: 'scifi',
        headerIcon: '❖',
        headerTitle: 'SYSTEM QUEST ALERT',
        headerBadge: '[URGENT]',
        currencyText: '',
        subtitle: 'Secret Quest: Courage of the Weak',
        mediaUrl: '',
        mediaLayout: 'none',
        mediaCaption: '',
        bodyText: 'Prepare to become a Player.\nWill you accept the System Awakening contract before time runs out?',
        levelTransition: '',
        unlockedAbility: '',
        statBoosts: [],
        inventoryItems: [],
        shopItems: [],
        bars: [],
        statsCols: 2,
        stats: [
          { label: 'REWARD', value: 'Hidden Class Awakening' },
          { label: 'PENALTY', value: 'Heart Stops in 10m' }
        ],
        pills: ['Do or Die', 'Daily Quest'],
        timerEnabled: false,
        timerSeconds: 600,
        timerLabel: 'TIME LEFT',
        buttons: [
          { label: '✔ ACCEPT', style: 'neutral' },
          { label: '✖ DECLINE', style: 'neutral' }
        ],
        stampText: '',
        stampColor: '#00f0ff',
        footerText: 'Player System Notification • [Click to Edit]',
        rpgLink: {
          enabled: true,
          passBtnIndex: 0,
          failBtnIndex: 1,
          timerExpirePenalty: true,
          autoHideAfterResolve: true,
          autoHideDelaySec: 1.8,
          passReward: { coins: 150, exp: 50, hp: 15, mp: 10 },
          failPenalty: { coins: 0, hp: 30, mp: 0 }
        }
      }
    },
    {
      id: 'status',
      icon: '📊',
      name: 'Profile & Status',
      desc: 'RPG stats, HP/MP bars & portrait',
      config: {
        presetId: 'status',
        ...themeProps('hunter_blue'),
        animation: 'hologram',
        sfx: 'scifi',
        headerIcon: '💠',
        headerTitle: 'PLAYER STATUS WINDOW',
        headerBadge: 'LV. 42',
        currencyText: '',
        subtitle: 'Class: Shadow Hunter • Title: One Who Overcame',
        mediaUrl: 'assets/characters/anime_boy_body.png',
        mediaLayout: 'portrait_left',
        mediaCaption: 'KAITO [S-RANK]',
        bodyText: '',
        levelTransition: '',
        unlockedAbility: '',
        statBoosts: [],
        inventoryItems: [],
        shopItems: [],
        bars: [
          { label: 'HP', value: 100, fromValue: 35, displayText: '4,820 / 4,820', color: '#ef4444', animated: true },
          { label: 'MP', value: 84, fromValue: 84, displayText: '2,100 / 2,500', color: '#38bdf8', animated: false }
        ],
        statsCols: 3,
        statusLayout: 'sheet',
        stats: [
          { label: 'STR', value: '142' },
          { label: 'AGI', value: '168' },
          { label: 'INT', value: '130' },
          { label: 'VIT', value: '115' },
          { label: 'PER', value: '154' },
          { label: 'POINTS', value: '+15' }
        ],
        pills: ['Passive: Shadow Step Lv.3', 'Immunity: Fear'],
        timerEnabled: false,
        timerSeconds: 0,
        timerLabel: '',
        buttons: [],
        stampText: '',
        stampColor: '#00f0ff',
        footerText: 'Status Synced with Soul Core',
        syncWithStoryRpg: true
      }
    },
    {
      id: 'levelup',
      icon: '📈',
      name: 'Level-Up +Stats',
      desc: 'Level jump, new skill & +ATK%/STR',
      config: {
        presetId: 'levelup',
        ...themeProps('hunter_blue'),
        animation: 'pop',
        sfx: 'sparkle',
        headerIcon: '🎉',
        headerTitle: 'LEVEL UP! POWER AWAKENING',
        headerBadge: 'LV. +1',
        currencyText: '',
        subtitle: 'All Fatigue Cleared • Full HP/MP Recovery',
        mediaUrl: 'assets/characters/anime_boy_happy.png',
        mediaLayout: 'icon_title',
        mediaCaption: '',
        bodyText: 'You defeated the Red Gate Guardian solo! Hidden potential unlocked.',
        levelTransition: 'LV. 12 ➔ LV. 13',
        unlockedAbility: '⚡ NEW ABILITY: Shadow Extraction (Rank S)',
        statBoosts: [
          { label: 'STR', delta: '+15' },
          { label: 'AGI', delta: '+12' },
          { label: 'ATK POWER', delta: '+20%' },
          { label: 'CRIT DMG', delta: '+10%' }
        ],
        inventoryItems: [],
        shopItems: [],
        bars: [
          { label: 'EXP', value: 100, fromValue: 20, displayText: '100% LEVEL UP!', color: '#facc15', animated: true }
        ],
        statsCols: 2,
        stats: [],
        pills: ['HP/MP 100% Restored', '+5 Bonus Stat Points'],
        timerEnabled: false,
        timerSeconds: 0,
        timerLabel: '',
        buttons: [],
        stampText: 'LEVEL UP!',
        stampColor: '#4ade80',
        footerText: 'System Stat Progression Engine'
      }
    },
    {
      id: 'inventory',
      icon: '🎒',
      name: 'Inventory Vault',
      desc: 'Rarity slots, xQty stacks & EQP',
      config: {
        presetId: 'inventory',
        ...themeProps('hunter_blue'),
        animation: 'hologram',
        sfx: 'scifi',
        headerIcon: '🎒',
        headerTitle: 'PLAYER INVENTORY VAULT',
        headerBadge: '6/20 SLOTS',
        currencyText: '🪙 125,400 G',
        subtitle: 'Sub-Space Storage • Tap any item to inspect',
        mediaUrl: '',
        mediaLayout: 'none',
        mediaCaption: '',
        bodyText: '',
        levelTransition: '',
        unlockedAbility: '',
        statBoosts: [],
        inventoryItems: [
          { icon: '🗡️', name: "Kasaka's Fang", rarity: 'mythic', qty: '1', equipped: true, locked: false },
          { icon: '⚔️', name: 'Knight Killer', rarity: 'legendary', qty: '1', equipped: false, locked: false },
          { icon: '🧪', name: 'Elixir of Life', rarity: 'epic', qty: '3', equipped: false, locked: false },
          { icon: '💎', name: 'Mana Crystal', rarity: 'rare', qty: '14', equipped: false, locked: false },
          { icon: '📜', name: 'Return Stone', rarity: 'rare', qty: '2', equipped: false, locked: false },
          { icon: '🗝️', name: 'Monarch Key', rarity: 'mythic', qty: '1', equipped: false, locked: true }
        ],
        shopItems: [],
        bars: [],
        statsCols: 2,
        shopLayout: 'rows',
        stats: [],
        pills: ['Soul-Bound Vault', 'Zero Weight Limit'],
        timerEnabled: false,
        timerSeconds: 0,
        timerLabel: '',
        buttons: [],
        stampText: '',
        stampColor: '#00f0ff',
        footerText: 'Tap item slot to Equip / Use',
        syncWithStoryRpg: true
      }
    },
    {
      id: 'shop',
      icon: '🪙',
      name: 'Coin Shop',
      desc: 'System store with prices & locks',
      config: {
        presetId: 'shop',
        ...themeProps('murim_gold'),
        frameStyle: 'cyber_bevel',
        fontStyle: 'hud',
        animation: 'hologram',
        sfx: 'sparkle',
        headerIcon: '🪙',
        headerTitle: 'SYSTEM COIN SHOP',
        headerBadge: 'OPEN 24H',
        currencyText: '🪙 120,000 G',
        subtitle: 'Exclusive Hunter Exchange • Tap BUY to purchase',
        mediaUrl: '',
        mediaLayout: 'none',
        mediaCaption: '',
        bodyText: '',
        levelTransition: '',
        unlockedAbility: '',
        statBoosts: [],
        inventoryItems: [],
        shopItems: [
          { icon: '🗡️', name: "Demon King's Daggers", rarity: 'legendary', meta: 'ATK +240 • Twin Blades', price: '80,000 G', locked: false, owned: false },
          { icon: '🧪', name: 'Full Recovery Potion', rarity: 'epic', meta: 'Instant 100% HP & Mana', price: '5,000 G', locked: false, owned: false },
          { icon: '🧥', name: 'Shadow Monarch Cloak', rarity: 'rare', meta: 'Stealth +35% • DEF +90', price: '28,000 G', locked: false, owned: false },
          { icon: '👑', name: 'Crown of Abyss', rarity: 'mythic', meta: 'REQ: LV.50 OR MONARCH', price: 'LOCKED LV.50', locked: true, owned: false }
        ],
        bars: [],
        statsCols: 2,
        shopLayout: 'rows',
        stats: [],
        pills: ['Discount Active: -10%'],
        timerEnabled: false,
        timerSeconds: 0,
        timerLabel: '',
        buttons: [],
        stampText: '',
        stampColor: '#facc15',
        footerText: 'Non-Refundable System Transaction'
      }
    },
    {
      id: 'timer',
      icon: '⏱️',
      name: 'Penalty Timer',
      desc: 'Dynamic urgent countdown & impact',
      config: {
        presetId: 'timer',
        ...themeProps('crimson_danger'),
        animation: 'impact',
        sfx: 'sting',
        headerIcon: '☠️',
        headerTitle: 'PENALTY QUEST: SURVIVE',
        headerBadge: 'DANGER',
        currencyText: '',
        subtitle: 'Failure triggers immediate Punishment Zone',
        mediaUrl: '',
        mediaLayout: 'none',
        mediaCaption: '',
        bodyText: 'WARNING: You ignored your Daily Objective!\nHold out until 00:00 or face Automatic System Penalty.',
        levelTransition: '',
        unlockedAbility: '',
        statBoosts: [],
        inventoryItems: [],
        shopItems: [],
        bars: [
          { label: 'HEARTBEAT PANIC', value: 92, fromValue: 45, displayText: 'CRITICAL 178 BPM', color: '#ef4444', animated: true }
        ],
        statsCols: 2,
        stats: [
          { label: 'PENALTY ZONE', value: 'Crimson Desert' },
          { label: 'ESCAPE', value: 'LOCKED' }
        ],
        pills: ['Live Drain Active', 'No Healing Items'],
        timerEnabled: true,
        timerSeconds: 12,
        timerLabel: 'SURVIVAL COUNTDOWN',
        buttons: [],
        stampText: '',
        stampColor: '#ef4444',
        footerText: 'DO NOT STOP RUNNING',
        rpgLink: {
          enabled: true,
          passBtnIndex: 0,
          failBtnIndex: 1,
          timerExpirePenalty: true,
          autoHideAfterResolve: true,
          autoHideDelaySec: 1.8,
          passReward: { coins: 200, exp: 80, hp: 20, mp: 10 },
          failPenalty: { coins: 50, hp: 50, mp: 0 }
        }
      }
    },
    {
      id: 'questboard',
      icon: '📋',
      name: 'Daily Quests',
      desc: 'Checklist tasks & streak tracker',
      config: {
        presetId: 'questboard',
        ...themeProps('hunter_blue'),
        animation: 'hologram',
        sfx: 'scifi',
        headerIcon: '📋',
        headerTitle: 'DAILY QUEST: PATH TO POWER',
        headerBadge: '🔥 7-DAY STREAK',
        currencyText: '',
        subtitle: 'Complete all objectives before midnight',
        mediaUrl: '',
        mediaLayout: 'none',
        mediaCaption: '',
        bodyText: '',
        levelTransition: '',
        unlockedAbility: '',
        statBoosts: [],
        inventoryItems: [],
        shopItems: [],
        bars: [
          { label: 'PUSH-UPS [COMPLETE]', value: 100, fromValue: 100, displayText: '100 / 100', color: '#4ade80', animated: false },
          { label: 'SQUATS [COMPLETE]', value: 100, fromValue: 100, displayText: '100 / 100', color: '#4ade80', animated: false },
          { label: '10KM RUN [IN PROGRESS]', value: 80, fromValue: 40, displayText: '8.0 / 10.0 km', color: '#00f0ff', animated: true }
        ],
        statsCols: 2,
        stats: [
          { label: 'REWARD', value: 'Full Recovery + Random Box' },
          { label: 'STREAK BONUS', value: '+20% EXP Gain' }
        ],
        pills: ['2/3 Completed'],
        timerEnabled: true,
        timerSeconds: 300,
        timerLabel: 'RESET IN',
        buttons: [
          { label: '🎁 CLAIM REWARD', style: 'neutral' }
        ],
        stampText: '',
        stampColor: '#4ade80',
        footerText: 'Unfinished quests trigger Penalty Quest'
      }
    },
    {
      id: 'shadowarmy',
      icon: '👥',
      name: 'Shadow Army',
      desc: 'Monarch roster & leaderboard',
      config: {
        presetId: 'shadowarmy',
        ...themeProps('shadow_violet'),
        animation: 'glitch',
        sfx: 'vineboom',
        headerIcon: '🌑',
        headerTitle: 'SHADOW SOLDIER ROSTER',
        headerBadge: 'MONARCH',
        currencyText: '🌑 MANA 9,400',
        subtitle: 'Extracted Shadows Ready for Summon [3/20 Slots]',
        mediaUrl: '',
        mediaLayout: 'none',
        mediaCaption: '',
        bodyText: '',
        levelTransition: '',
        unlockedAbility: '',
        statBoosts: [],
        inventoryItems: [
          { icon: '⚔️', name: 'IGRIS [KNIGHT]', rarity: 'legendary', qty: 'S', equipped: true, locked: false },
          { icon: '🐜', name: 'BERU [MARSHAL]', rarity: 'mythic', qty: 'SSS', equipped: true, locked: false },
          { icon: '🐻', name: 'TANK [ALPHA]', rarity: 'epic', qty: 'A', equipped: false, locked: false },
          { icon: '🛡️', name: 'IRON [VANGUARD]', rarity: 'rare', qty: 'A', equipped: false, locked: false },
          { icon: '⚡', name: 'KAISAR [WYVERN]', rarity: 'epic', qty: 'A+', equipped: false, locked: false },
          { icon: '❔', name: 'EMPTY SLOT', rarity: 'common', qty: '-', equipped: false, locked: true }
        ],
        shopItems: [],
        bars: [],
        statsCols: 2,
        stats: [
          { label: 'TOTAL SOLDIERS', value: '1,240 Shadows' },
          { label: 'REGEN SPEED', value: 'Instant (Mana)' }
        ],
        pills: ['Command: ARISE'],
        timerEnabled: false,
        timerSeconds: 0,
        timerLabel: '',
        buttons: [
          { label: '🌑 SUMMON ALL', style: 'neutral' },
          { label: '⚔️ EXTRACT MORE', style: 'neutral' }
        ],
        stampText: '',
        stampColor: '#a855f7',
        footerText: 'Shadow Extraction Storage'
      }
    },
    {
      id: 'item',
      icon: '🗡️',
      name: 'Item / Artifact',
      desc: 'Weapon drop, rarity & passives',
      config: {
        presetId: 'item',
        ...themeProps('shadow_violet'),
        animation: 'pop',
        sfx: 'sparkle',
        headerIcon: '🗡️',
        headerTitle: "KASAKA'S VENOM FANG",
        headerBadge: 'S-RANK DAGGER',
        currencyText: '',
        subtitle: 'Artifact Drop • Category: Mythic Weapon',
        mediaUrl: 'assets/characters/anime_boy_shadow.png',
        mediaLayout: 'icon_title',
        mediaCaption: '',
        bodyText: 'A deadly blade carved from the Shadow Serpent. Inflicts Paralyze and Bleed on every critical strike.',
        levelTransition: '',
        unlockedAbility: '',
        statBoosts: [],
        inventoryItems: [],
        shopItems: [],
        bars: [],
        statsCols: 2,
        stats: [
          { label: 'ATTACK POWER', value: '+185 ATK' },
          { label: 'CRIT RATE', value: '+35%' },
          { label: 'DURABILITY', value: '∞ (Bound)' },
          { label: 'MARKET VALUE', value: '850,000 G' }
        ],
        pills: ['Effect: Bleed (-2% HP/s)', 'Effect: Stun 1.5s', 'Untradable'],
        timerEnabled: false,
        timerSeconds: 0,
        timerLabel: '',
        buttons: [
          { label: '⚔️ EQUIP ITEM', style: 'neutral' },
          { label: '📦 STORE IN INVENTORY', style: 'neutral' }
        ],
        stampText: '',
        stampColor: '#facc15',
        footerText: 'Obtained from Boss Chest'
      }
    },
    {
      id: 'loading',
      icon: '⏳',
      name: 'Loading / Sync',
      desc: 'Animated boot or 99% glitch bar',
      config: {
        presetId: 'loading',
        ...themeProps('cyber_green'),
        animation: 'glitch',
        sfx: 'scifi',
        headerIcon: '⚡',
        headerTitle: 'SYSTEM INITIALIZING...',
        headerBadge: 'SYNCING',
        currencyText: '',
        subtitle: 'Protocol v9.4 // Awakening Soul Matrix',
        mediaUrl: '',
        mediaLayout: 'none',
        mediaCaption: '',
        bodyText: 'Verifying Vessel Compatibility...\nUnlocking Locked Mana Circuits... Please do not lose consciousness.',
        levelTransition: '',
        unlockedAbility: '',
        statBoosts: [],
        inventoryItems: [],
        shopItems: [],
        bars: [
          { label: 'AWAKENING SYNC', value: 100, fromValue: 0, displayText: '100% COMPLETE', color: '#10b981', animated: true }
        ],
        statsCols: 2,
        stats: [
          { label: 'VESSEL', value: '100% Match' },
          { label: 'AUTHORITY', value: 'ADMIN_OVERRIDE' }
        ],
        pills: ['Downloading Skills...', 'Firewall Bypassed'],
        timerEnabled: false,
        timerSeconds: 0,
        timerLabel: '',
        buttons: [],
        stampText: '',
        stampColor: '#10b981',
        footerText: 'Welcome back, Player.'
      }
    },
    {
      id: 'affection',
      icon: '💗',
      name: 'Affection Meter',
      desc: 'Otome Isekai love/suspicion bar',
      config: {
        presetId: 'affection',
        ...themeProps('otome_rose'),
        animation: 'pop',
        sfx: 'sparkle',
        headerIcon: '💘',
        headerTitle: 'TARGET AFFECTION UPDATED',
        headerBadge: '+28% BOOST',
        currencyText: '',
        subtitle: 'Otome Capture Target Monitor',
        mediaUrl: 'assets/characters/anime_girl_happy.png',
        mediaLayout: 'circle_halo',
        mediaCaption: 'HANA',
        bodyText: 'Your unexpected sincerity caught her completely off-guard!\nUnlockable Event: Rooftop Confession Route.',
        levelTransition: '',
        unlockedAbility: '',
        statBoosts: [],
        inventoryItems: [],
        shopItems: [],
        bars: [
          { label: 'AFFECTION LEVEL', value: 78, fromValue: 50, displayText: '50% ➔ 78% (+28%)', color: '#ec4899', animated: true },
          { label: 'SUSPICION METER', value: 12, fromValue: 40, displayText: '40% ➔ 12% (DROPPED)', color: '#a855f7', animated: true }
        ],
        statsCols: 2,
        stats: [
          { label: 'MOOD', value: 'Flustered 😳' },
          { label: 'ROUTE', value: 'True Ending' }
        ],
        pills: ['Bond Rank B', 'Heart Fluttering'],
        timerEnabled: false,
        timerSeconds: 0,
        timerLabel: '',
        buttons: [],
        stampText: '',
        stampColor: '#ec4899',
        footerText: 'System Tip: Stay honest for Bonus CG!'
      }
    },
    {
      id: 'showcase',
      icon: '🖼️',
      name: 'Image Showcase',
      desc: 'Show any map, photo, meme or CG',
      config: {
        presetId: 'showcase',
        ...themeProps('hunter_blue'),
        frameStyle: 'glass_hud',
        animation: 'unroll',
        sfx: 'pop',
        headerIcon: '📷',
        headerTitle: 'CLASSIFIED EVIDENCE FILE',
        headerBadge: 'VERIFIED',
        currencyText: '',
        subtitle: 'Attached Image Data • Encrypted Archive',
        mediaUrl: 'assets/characters/sample_anime_vn_scene.png',
        mediaLayout: 'banner_top',
        mediaCaption: 'CAPTURED AT SECTOR 04 — 01:14 AM',
        bodyText: 'Visual confirmation uploaded directly to your System Log. Inspect the image closely before answering.',
        levelTransition: '',
        unlockedAbility: '',
        statBoosts: [],
        inventoryItems: [],
        shopItems: [],
        bars: [],
        statsCols: 2,
        stats: [
          { label: 'LOCATION', value: 'Old School Roof' },
          { label: 'STATUS', value: 'Top Secret' }
        ],
        pills: ['Photo Evidence'],
        timerEnabled: false,
        timerSeconds: 0,
        timerLabel: '',
        buttons: [],
        stampText: '',
        stampColor: '#38bdf8',
        footerText: 'Tap window to swap image or customize layout'
      }
    },
    {
      id: 'constellation',
      icon: '🌌',
      name: 'Constellation',
      desc: 'Omniscient Reader sponsor message',
      config: {
        presetId: 'constellation',
        ...themeProps('shadow_violet'),
        frameStyle: 'glass_hud',
        sparkles: true,
        animation: 'unroll',
        sfx: 'sparkle',
        headerIcon: '✨',
        headerTitle: 'STAR STREAM CHANNEL #704',
        headerBadge: '+1,000 COINS',
        currencyText: '🪙 +1,000 C',
        subtitle: '[Indirect Message from Constellation]',
        mediaUrl: 'assets/characters/anime_boy_happy.png',
        mediaLayout: 'circle_halo',
        mediaCaption: 'SPONSOR',
        bodyText: 'The Constellation "Demon-like Judge of Fire" is cheering wildly at your dramatic comeback!\n1,000 Coins have been sponsored.',
        levelTransition: '',
        unlockedAbility: '',
        statBoosts: [],
        inventoryItems: [],
        shopItems: [],
        bars: [],
        statsCols: 2,
        stats: [
          { label: 'SPONSORED', value: '+1,000 Coins' },
          { label: 'VIEWERS', value: '14,820 Live' }
        ],
        pills: ['Channel Fever', 'Star Stream Boost'],
        timerEnabled: false,
        timerSeconds: 0,
        timerLabel: '',
        buttons: [
          { label: '🙏 THANK SPONSOR', style: 'neutral' }
        ],
        stampText: '',
        stampColor: '#facc15',
        footerText: 'Constellation Favorability +10'
      }
    },
    {
      id: 'skill',
      icon: '⚔️',
      name: 'Skill Evolution',
      desc: 'Before/After skill awakening card',
      config: {
        presetId: 'skill',
        ...themeProps('murim_gold'),
        animation: 'impact',
        sfx: 'sword',
        headerIcon: '⚔️',
        headerTitle: 'SKILL AWAKENING ACHIEVED!',
        headerBadge: 'EVOLVED',
        currencyText: '',
        subtitle: 'Unique Trait Resonance Detected',
        mediaUrl: 'assets/characters/clean_knight.png',
        mediaLayout: 'icon_title',
        mediaCaption: '',
        bodyText: 'Your survival instinct broke past mortal limits. Your basic passive skill has awakened into an Ultimate Art!',
        levelTransition: '',
        unlockedAbility: '⚔️ EVOLVED: [F] Quick Step ➔ [SS] Void Flash',
        statBoosts: [
          { label: 'SPEED', delta: '+45%' },
          { label: 'CRIT CHANCE', delta: '+25%' }
        ],
        inventoryItems: [],
        shopItems: [],
        bars: [
          { label: 'SKILL MASTERY', value: 100, fromValue: 45, displayText: 'MAX AWAKENED', color: '#facc15', animated: true }
        ],
        statsCols: 2,
        stats: [
          { label: 'MANA COST', value: '30 MP' },
          { label: 'COOLDOWN', value: '2.0 Sec' }
        ],
        pills: ['Ignores Armor', 'Invulnerable 0.5s'],
        timerEnabled: false,
        timerSeconds: 0,
        timerLabel: '',
        buttons: [],
        stampText: 'AWAKENED',
        stampColor: '#facc15',
        footerText: 'Added to Active Skill Slots'
      }
    },
    {
      id: 'contract',
      icon: '📜',
      name: 'Devil Contract',
      desc: 'Royal oath, deal or guild pact',
      config: {
        presetId: 'contract',
        ...themeProps('murim_gold'),
        animation: 'unroll',
        sfx: 'vineboom',
        headerIcon: '📜',
        headerTitle: 'IMPERIAL BLOOD CONTRACT',
        headerBadge: 'BINDING',
        currencyText: '',
        subtitle: 'Between Party A & Shadow Architect',
        mediaUrl: '',
        mediaLayout: 'none',
        mediaCaption: '',
        bodyText: '1. Signatory receives S-Rank Authority immediately.\n2. Betrayal voids all mortal protections.\n3. Both parties swear upon their True Names.',
        levelTransition: '',
        unlockedAbility: '',
        statBoosts: [],
        inventoryItems: [],
        shopItems: [],
        bars: [],
        statsCols: 2,
        stats: [
          { label: 'WITNESS', value: 'Absolute System' },
          { label: 'TERM', value: 'Eternal' }
        ],
        pills: ['Irreversible', 'Soul Seal'],
        timerEnabled: false,
        timerSeconds: 0,
        timerLabel: '',
        buttons: [
          { label: '✒️ SIGN CONTRACT', style: 'neutral' },
          { label: '🔥 BURN PACT', style: 'neutral' }
        ],
        stampText: '',
        stampColor: '#ef4444',
        footerText: 'Pressing Sign seals the pact permanently'
      }
    },
    {
      id: 'boss',
      icon: '🐉',
      name: 'Boss / Gate',
      desc: 'Red Gate raid boss HP scanner',
      config: {
        presetId: 'boss',
        ...themeProps('crimson_danger'),
        frameStyle: 'cyber_bevel',
        animation: 'impact',
        sfx: 'vineboom',
        headerIcon: '🐉',
        headerTitle: 'RED GATE BOSS DETECTED',
        headerBadge: 'DISASTER LVL',
        currencyText: '',
        subtitle: 'Gate Class: S-Rank Anomaly • Exit Sealed',
        mediaUrl: 'assets/characters/clean_barbarian.png',
        mediaLayout: 'portrait_left',
        mediaCaption: 'OVERLORD',
        bodyText: 'An Ancient Monarch Guard blocks the dungeon core. Conventional weapons have zero effect.',
        levelTransition: '',
        unlockedAbility: '',
        statBoosts: [],
        inventoryItems: [],
        shopItems: [],
        bars: [
          { label: 'BOSS HP', value: 100, fromValue: 100, displayText: '250,000 / 250,000', color: '#ef4444', animated: false },
          { label: 'MANA SHIELD', value: 100, fromValue: 0, displayText: 'ACTIVE (INVULNERABLE)', color: '#a855f7', animated: true }
        ],
        statsCols: 2,
        stats: [
          { label: 'WEAKNESS', value: 'Shadow Magic' },
          { label: 'REC. PARTY', value: '5+ S-Ranks' }
        ],
        pills: ['Berserk Phase', 'Arena Locked'],
        timerEnabled: false,
        timerSeconds: 0,
        timerLabel: '',
        buttons: [],
        stampText: '',
        stampColor: '#ef4444',
        footerText: 'Scanner Locked On Target'
      }
    },
    {
      id: 'gacha',
      icon: '🎰',
      name: 'Loot / Gacha',
      desc: 'SSR Mystery pull or comic troll',
      config: {
        presetId: 'gacha',
        ...themeProps('comic_pop'),
        animation: 'pop',
        sfx: 'boing',
        headerIcon: '🎰',
        headerTitle: 'MYSTERY RANDOM BOX PULL!',
        headerBadge: '0.01% SSR?!',
        currencyText: '💎 -10,000',
        subtitle: 'System Gacha Draw #99 — Guaranteed Jackpot?',
        mediaUrl: 'assets/characters/anime_girl_shock.png',
        mediaLayout: 'icon_title',
        mediaCaption: '',
        bodyText: 'CONGRATULATIONS!! You pulled: [Golden Wooden Spoon of Slightly Warm Soup]!\nWait... why did I spend 10,000 Gems on this?!',
        levelTransition: '',
        unlockedAbility: '',
        statBoosts: [],
        inventoryItems: [],
        shopItems: [],
        bars: [
          { label: 'LUCK STAT', value: 5, fromValue: 99, displayText: '99% ➔ ERROR 5%', color: '#facc15', animated: true }
        ],
        statsCols: 2,
        stats: [
          { label: 'RARITY', value: '★ Mythic Trash' },
          { label: 'REFUND', value: 'NO REFUNDS' }
        ],
        pills: ['Scammed by System', '+1 Soup Flavor'],
        timerEnabled: false,
        timerSeconds: 0,
        timerLabel: '',
        buttons: [
          { label: '😭 CRY', style: 'neutral' },
          { label: '💸 PULL AGAIN', style: 'neutral' }
        ],
        stampText: 'SCAMMED!',
        stampColor: '#facc15',
        footerText: 'Thank you for your patronage!'
      }
    },
    {
      id: 'relic',
      icon: '🔮',
      name: 'Relic / Ability',
      desc: 'Ornate DEVOUR-style skill card',
      config: {
        presetId: 'relic',
        ...themeProps('crimson_danger'),
        accentColor: '#fde047',
        secondaryColor: '#ef4444',
        bgColor: '#2d0407',
        bgOpacity: 0.98,
        frameStyle: 'demonic_thorn',
        fontStyle: 'serif',
        scanlines: false,
        gridPattern: false,
        sparkles: true,
        starburst: true,
        hideHeader: true,
        cardStyle: 'relic',
        svgIcon: 'demonic_eye',
        customFrameUrl: '',
        transparentBg: false,
        animation: 'impact',
        sfx: 'vineboom',
        headerIcon: '👁️',
        headerTitle: 'DEVOUR',
        headerBadge: '',
        currencyText: '',
        subtitle: 'UNIQUE ABILITY OF THE SPEAR OF LIFE',
        mediaUrl: '',
        mediaLayout: 'none',
        mediaCaption: '',
        bodyText: 'WHEN ALL VITALITY IS LOST, IT INDISCRIMINATELY ABSORBS ALL SURROUNDING AURA.',
        levelTransition: '',
        unlockedAbility: '',
        statBoosts: [],
        inventoryItems: [],
        shopItems: [],
        bars: [],
        statsCols: 2,
        shopLayout: 'rows',
        stats: [],
        pills: [],
        timerEnabled: false,
        timerSeconds: 0,
        timerLabel: '',
        buttons: [],
        stampText: '',
        stampColor: '#fde047',
        footerText: ''
      }
    },
    {
      id: 'codex',
      icon: '📘',
      name: 'Codex / Rule',
      desc: 'Blueprint diagram & bullet lore',
      config: {
        presetId: 'codex',
        ...themeProps('hunter_blue'),
        accentColor: '#38bdf8',
        secondaryColor: '#60a5fa',
        bgColor: '#07122e',
        bgOpacity: 0.98,
        frameStyle: 'blueprint_double',
        fontStyle: 'hud',
        scanlines: false,
        gridPattern: false,
        sparkles: false,
        starburst: false,
        hideHeader: true,
        cardStyle: 'codex',
        svgIcon: 'gold_exchange',
        customFrameUrl: '',
        transparentBg: false,
        animation: 'hologram',
        sfx: 'scifi',
        headerIcon: '📘',
        headerTitle: '[INTERVERSE MONEY EXCHANGE]',
        headerBadge: '',
        currencyText: '',
        subtitle: '',
        mediaUrl: '',
        mediaLayout: 'none',
        mediaCaption: '',
        bodyText: "- ALL THE WORLDS IN INTERVERSE USE A CURRENCY CALLED 'GOLD'.\n- ONE CAN EXCHANGE THE GOLD INTO CASH BY PAYING A CERTAIN FEE.\n- ONLY AFTER CONFIRMING ONE'S AGE AND PROVING ONESELF AN ADULT MAY SOMEONE USE THE EXCHANGE SYSTEM.",
        levelTransition: '',
        unlockedAbility: '',
        statBoosts: [],
        inventoryItems: [],
        shopItems: [],
        bars: [],
        statsCols: 2,
        shopLayout: 'rows',
        stats: [],
        pills: [],
        timerEnabled: false,
        timerSeconds: 0,
        timerLabel: '',
        buttons: [],
        stampText: '',
        stampColor: '#38bdf8',
        footerText: ''
      }
    },
    {
      id: 'relic_seraph',
      icon: '👼',
      name: 'Divine Relic',
      desc: 'Archangel Seraph Wing blessing card',
      config: {
        presetId: 'relic_seraph',
        ...themeProps('murim_gold'),
        accentColor: '#fde047',
        secondaryColor: '#38bdf8',
        bgColor: '#120f24',
        bgOpacity: 0.98,
        frameStyle: 'void_seraph',
        fontStyle: 'serif',
        scanlines: false,
        gridPattern: false,
        sparkles: true,
        starburst: true,
        hideHeader: true,
        cardStyle: 'relic',
        svgIcon: 'magic_circle',
        animation: 'unroll',
        sfx: 'sparkle',
        headerIcon: '⚜️',
        headerTitle: 'SERAPHIM GRACE',
        subtitle: 'DIVINE AUTHORITY OF THE FIRST HEAVEN',
        bodyText: 'PURIFIES ALL CURSES IN RANGE AND RESTORES LOST VITALITY UNDER SACRED LIGHT.',
        buttons: [], stats: [], bars: [], pills: [], footerText: '', stampText: '', stampColor: '#fde047'
      }
    },
    {
      id: 'relic_crown',
      icon: '👑',
      name: 'Monarch Relic',
      desc: 'Sovereign Crown & Violet Aura card',
      config: {
        presetId: 'relic_crown',
        ...themeProps('shadow_violet'),
        accentColor: '#e879f9',
        secondaryColor: '#9333ea',
        bgColor: '#120526',
        bgOpacity: 0.98,
        frameStyle: 'abyssal_crown',
        fontStyle: 'serif',
        scanlines: false,
        gridPattern: false,
        sparkles: true,
        starburst: true,
        hideHeader: true,
        cardStyle: 'relic',
        svgIcon: 'shadow_crown',
        animation: 'impact',
        sfx: 'vineboom',
        headerIcon: '👑',
        headerTitle: "MONARCH'S DOMAIN",
        subtitle: 'EXCLUSIVE AUTHORITY OF THE ABYSS KING',
        bodyText: 'ALL SHADOW SOLDIERS WITHIN THE TERRITORY GAIN +100% ALL STATS AND INSTANT REGENERATION.',
        buttons: [], stats: [], bars: [], pills: [], footerText: '', stampText: '', stampColor: '#e879f9'
      }
    },
    {
      id: 'relic_chains',
      icon: '⛓️',
      name: 'Cursed Seal',
      desc: 'Blood Chains Forbidden Art card',
      config: {
        presetId: 'relic_chains',
        ...themeProps('crimson_danger'),
        accentColor: '#fb7185',
        secondaryColor: '#dc2626',
        bgColor: '#22040a',
        bgOpacity: 0.98,
        frameStyle: 'cursed_chains',
        fontStyle: 'serif',
        scanlines: false,
        gridPattern: false,
        sparkles: true,
        starburst: true,
        hideHeader: true,
        cardStyle: 'relic',
        svgIcon: 'broken_chains',
        animation: 'glitch',
        sfx: 'sting',
        headerIcon: '⛓️',
        headerTitle: 'SOUL SHACKLES',
        subtitle: 'FORBIDDEN SEAL OF THE CRIMSON PACT',
        bodyText: 'BINDS THE TARGET’S MANA CIRCUIT FOR 30 SECONDS. ESCAPING CONVERTS PAIN INTO PURE DAMAGE.',
        buttons: [], stats: [], bars: [], pills: [], footerText: '', stampText: '', stampColor: '#ef4444'
      }
    },
    {
      id: 'relic_frost',
      icon: '❄️',
      name: 'Frost Core',
      desc: 'Ice Monarch Crystal Relic card',
      config: {
        presetId: 'relic_frost',
        ...themeProps('hunter_blue'),
        accentColor: '#7dd3fc',
        secondaryColor: '#0284c7',
        bgColor: '#041428',
        bgOpacity: 0.98,
        frameStyle: 'frost_monarch',
        fontStyle: 'serif',
        scanlines: false,
        gridPattern: false,
        sparkles: true,
        starburst: true,
        hideHeader: true,
        cardStyle: 'relic',
        svgIcon: 'crystal_core',
        animation: 'hologram',
        sfx: 'scifi',
        headerIcon: '❄️',
        headerTitle: 'ABSOLUTE ZERO',
        subtitle: 'ETERNAL HEART OF THE FROST EMPEROR',
        bodyText: 'FREEZES SPACE, SPELLS, AND TIME ITSELF INSIDE A FIVE-METER GLACIAL SPHERE.',
        buttons: [], stats: [], bars: [], pills: [], footerText: '', stampText: '', stampColor: '#7dd3fc'
      }
    },
    {
      id: 'relic_lotus',
      icon: '🪷',
      name: 'Murim Lotus',
      desc: 'Immortal Sect Enlightenment card',
      config: {
        presetId: 'relic_lotus',
        ...themeProps('cyber_green'),
        accentColor: '#fcd34d',
        secondaryColor: '#10b981',
        bgColor: '#041a13',
        bgOpacity: 0.98,
        frameStyle: 'divine_lotus',
        fontStyle: 'serif',
        scanlines: false,
        gridPattern: false,
        sparkles: true,
        starburst: true,
        hideHeader: true,
        cardStyle: 'relic',
        svgIcon: 'constellation_orb',
        animation: 'unroll',
        sfx: 'sparkle',
        headerIcon: '🪷',
        headerTitle: 'HEAVENLY QI LOTUS',
        subtitle: 'TRANSCENDENT SUTRA OF MOUNT HUA',
        bodyText: 'BLOOMS UPON BREAKING THE MORTAL WALL. SWORD INTENT MANIFESTS AS PURE GOLDEN PETALS.',
        buttons: [], stats: [], bars: [], pills: [], footerText: '', stampText: '', stampColor: '#fcd34d'
      }
    }
  ];

  function getDefaultConfig() {
    return cloneObj(PRESETS[0].config);
  }

  function getEmptyElementStyle() {
    return {
      color: '',
      glowColor: '',
      glowBlur: 0,
      strokeColor: '',
      strokeWidth: 0,
      fontSize: 0,
      fontFamily: ''
    };
  }

  function normalizeElementStyles(rawStyles) {
    const out = {};
    const src = (rawStyles && typeof rawStyles === 'object') ? rawStyles : {};
    ['title', 'subtitle', 'body', 'icons'].forEach(k => {
      const s = (src[k] && typeof src[k] === 'object') ? src[k] : {};
      out[k] = {
        color: sanitizeCssColor(s.color),
        glowColor: sanitizeCssColor(s.glowColor),
        glowBlur: Math.max(0, Math.min(32, Number(s.glowBlur) || 0)),
        strokeColor: sanitizeCssColor(s.strokeColor),
        strokeWidth: Math.max(0, Math.min(4, Number(s.strokeWidth) || 0)),
        fontSize: Math.max(0, Math.min(64, Number(s.fontSize) || 0)),
        fontFamily: s.fontFamily ? String(s.fontFamily).trim() : ''
      };
    });
    return out;
  }

  function buildTextElementStyle(st, accentFallback) {
    if (!st) return '';
    const parts = [];
    if (st.color) parts.push(`color:${esc(st.color)}`);
    if (st.fontSize > 0) parts.push(`font-size:${st.fontSize}px`);
    const ff = resolveFontFamilyCss(st.fontFamily);
    if (ff) parts.push(`font-family:${ff}`);
    if (st.glowBlur > 0 || st.glowColor) {
      const gc = st.glowColor || sanitizeCssColor(accentFallback) || '#00f0ff';
      const gb = st.glowBlur > 0 ? st.glowBlur : 10;
      parts.push(`text-shadow:0 0 ${gb}px ${esc(gc)}, 0 0 ${Math.round(gb * 1.8)}px ${esc(gc)}`);
    }
    if (st.strokeWidth > 0) {
      const sc = st.strokeColor || '#020617';
      parts.push(`-webkit-text-stroke:${st.strokeWidth}px ${esc(sc)}`);
      parts.push(`paint-order:stroke fill`);
    }
    return parts.join('; ');
  }

  function buildIconElementStyle(st, accentFallback, mode = 'text') {
    if (!st) return '';
    const parts = [];
    if (st.color) {
      parts.push(`color:${esc(st.color)}`);
      parts.push(`--sys-accent:${esc(st.color)}`);
    }
    const filters = [];
    if (st.strokeWidth > 0 && mode !== 'text') {
      const sc = st.strokeColor || '#020617';
      filters.push(`drop-shadow(0 0 ${Math.max(1, st.strokeWidth)}px ${esc(sc)})`);
    }
    if (st.glowBlur > 0 || st.glowColor) {
      const gc = st.glowColor || sanitizeCssColor(accentFallback) || '#00f0ff';
      const gb = st.glowBlur > 0 ? st.glowBlur : 8;
      filters.push(`drop-shadow(0 0 ${gb}px ${esc(gc)})`);
    }
    if (filters.length) parts.push(`filter:${filters.join(' ')}`);
    if (mode === 'text' && st.strokeWidth > 0) {
      const sc = st.strokeColor || '#020617';
      parts.push(`-webkit-text-stroke:${st.strokeWidth}px ${esc(sc)}`);
      parts.push(`paint-order:stroke fill`);
    }
    if (st.fontSize > 0) {
      if (mode === 'relic') {
        const boxPx = Math.max(44, Math.min(180, Math.round(st.fontSize * 3.2)));
        parts.push(`width:${boxPx}px; height:${boxPx}px`);
      } else if (mode === 'slot') {
        const slotPx = Math.max(24, Math.min(128, Math.round(st.fontSize * 1.8)));
        parts.push(`width:${slotPx}px; height:${slotPx}px`);
      } else if (mode === 'codex') {
        const codexPx = Math.max(72, Math.min(240, Math.round(st.fontSize * 4.2)));
        parts.push(`min-height:${codexPx}px; max-height:${codexPx + 24}px`);
      } else {
        parts.push(`font-size:${st.fontSize}px`);
      }
    }
    return parts.join('; ');
  }

  let builderSelectedLayerId = '';

  function makeCanvasLayerId() {
    return 'lay_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 6);
  }

  function clampNum(val, min, max, fallback) {
    const n = Number(val);
    if (!Number.isFinite(n)) return fallback;
    return Math.max(min, Math.min(max, n));
  }

  function createDefaultCanvasLayer(type, overrides = {}) {
    const t = ['background', 'sparkles', 'image', 'icon', 'text', 'border'].includes(type) ? type : 'text';
    const base = {
      id: overrides.id || makeCanvasLayerId(),
      type: t,
      name: overrides.name || (t === 'background' ? 'Background' : t === 'border' ? 'Vector Border' : t === 'sparkles' ? 'Sparkles & FX' : t === 'icon' ? 'Neon Icon' : t === 'image' ? 'Image / Sticker' : 'Text Layer'),
      visible: overrides.visible !== false,
      locked: Boolean(overrides.locked),
      x: t === 'background' || t === 'border' || t === 'sparkles' ? 0 : (t === 'text' ? 10 : 30),
      y: t === 'background' || t === 'border' || t === 'sparkles' ? 0 : (t === 'text' ? 42 : 22),
      w: t === 'background' || t === 'border' || t === 'sparkles' ? 100 : (t === 'text' ? 80 : 40),
      h: t === 'background' || t === 'border' || t === 'sparkles' ? 100 : (t === 'text' ? 16 : 36),
      rotation: 0,
      opacity: 1
    };
    if (t === 'background') {
      Object.assign(base, {
        imageUrl: '',
        color: '#041226',
        color2: '#0f172a',
        blur: 0,
        brightness: 1,
        tintColor: '#041226',
        tintOpacity: 0.35
      });
    } else if (t === 'border') {
      Object.assign(base, {
        frameStyle: 'demonic_thorn',
        customFrameSvg: '',
        color: '#00f0ff',
        secondaryColor: '#38bdf8',
        glowBlur: 8
      });
    } else if (t === 'sparkles') {
      Object.assign(base, {
        pattern: 'sparkles',
        color: '#fde047',
        secondaryColor: '#ef4444'
      });
    } else if (t === 'icon') {
      Object.assign(base, {
        svgIcon: 'soul_flame',
        customIconData: '',
        emoji: '',
        color: '#00f0ff',
        glowColor: '#38bdf8',
        glowBlur: 10,
        blendDark: false
      });
    } else if (t === 'image') {
      Object.assign(base, {
        imageUrl: 'assets/characters/anime_boy_body.png',
        fit: 'contain',
        rounded: 10,
        blendDark: false,
        glowColor: '#00f0ff',
        glowBlur: 0
      });
    } else if (t === 'text') {
      Object.assign(base, {
        text: 'SYSTEM ALERT',
        fontFamily: 'hud',
        fontSize: 18,
        fontWeight: '900',
        textAlign: 'center',
        letterSpacing: 1,
        color: '#f8fafc',
        glowColor: '#00f0ff',
        glowBlur: 10,
        strokeColor: '#020617',
        strokeWidth: 0,
        bgColor: '#020617',
        bgOpacity: 0,
        borderRadius: 6
      });
    }
    return { ...base, ...overrides, type: t };
  }

  function normalizeCanvasLayer(raw, idx = 0) {
    const src = (raw && typeof raw === 'object') ? raw : {};
    const def = createDefaultCanvasLayer(src.type, { id: src.id ? String(src.id).replace(/[^a-zA-Z0-9_-]/g, '') : `lay_${idx}` });
    const out = {
      ...def,
      name: String(src.name || def.name).slice(0, 32),
      visible: src.visible !== false,
      locked: Boolean(src.locked),
      x: clampNum(src.x, -50, 100, def.x),
      y: clampNum(src.y, -50, 100, def.y),
      w: clampNum(src.w, 4, 150, def.w),
      h: clampNum(src.h, 4, 150, def.h),
      rotation: clampNum(src.rotation, -180, 180, 0),
      opacity: clampNum(src.opacity, 0, 1, 1)
    };
    if (out.type === 'background') {
      out.imageUrl = isSafeUrl(src.imageUrl) ? String(src.imageUrl).trim() : '';
      out.color = sanitizeCssColor(src.color) || def.color;
      out.color2 = sanitizeCssColor(src.color2) || def.color2;
      out.blur = clampNum(src.blur, 0, 24, 0);
      out.brightness = clampNum(src.brightness, 0.2, 1.6, 1);
      out.tintColor = sanitizeCssColor(src.tintColor) || '#041226';
      out.tintOpacity = clampNum(src.tintOpacity, 0, 0.95, 0.35);
    } else if (out.type === 'border') {
      out.frameStyle = String(src.frameStyle || def.frameStyle);
      out.customFrameSvg = src.customFrameSvg ? sanitizeCustomSvg(src.customFrameSvg) : '';
      if (!out.customFrameSvg && out.frameStyle) {
        const cf = loadCustomFrames().find(f => String(f.id) === String(out.frameStyle));
        if (cf && cf.svg) out.customFrameSvg = sanitizeCustomSvg(cf.svg);
      }
      out.color = sanitizeCssColor(src.color) || def.color;
      out.secondaryColor = sanitizeCssColor(src.secondaryColor) || def.secondaryColor;
      out.glowBlur = clampNum(src.glowBlur, 0, 28, 8);
    } else if (out.type === 'sparkles') {
      out.pattern = ['sparkles', 'starburst', 'scanlines', 'grid'].includes(src.pattern) ? src.pattern : 'sparkles';
      out.color = sanitizeCssColor(src.color) || def.color;
      out.secondaryColor = sanitizeCssColor(src.secondaryColor) || def.secondaryColor;
    } else if (out.type === 'icon') {
      const allSvg = getAllSvgIcons();
      out.customIconData = src.customIconData ? (sanitizeCustomSvg(src.customIconData) || (isSafeUrl(src.customIconData) ? String(src.customIconData).trim() : '')) : '';
      out.svgIcon = (src.svgIcon && (allSvg[src.svgIcon] || out.customIconData)) ? String(src.svgIcon) : (out.customIconData ? '' : def.svgIcon);
      if (out.svgIcon && allSvg[out.svgIcon] && allSvg[out.svgIcon].isCustom && !out.customIconData) {
        out.customIconData = allSvg[out.svgIcon].rawSvg || allSvg[out.svgIcon].imageUrl || '';
      }
      out.emoji = String(src.emoji || '').slice(0, 6);
      out.color = sanitizeCssColor(src.color) || '';
      out.glowColor = sanitizeCssColor(src.glowColor) || '';
      out.glowBlur = clampNum(src.glowBlur, 0, 32, def.glowBlur);
      out.blendDark = Boolean(src.blendDark);
    } else if (out.type === 'image') {
      out.imageUrl = isSafeUrl(src.imageUrl) ? String(src.imageUrl).trim() : '';
      out.fit = src.fit === 'cover' ? 'cover' : 'contain';
      out.rounded = clampNum(src.rounded, 0, 64, 10);
      out.blendDark = Boolean(src.blendDark);
      out.glowColor = sanitizeCssColor(src.glowColor) || '';
      out.glowBlur = clampNum(src.glowBlur, 0, 32, 0);
    } else if (out.type === 'text') {
      out.text = String(src.text ?? def.text);
      out.fontFamily = src.fontFamily ? String(src.fontFamily).trim() : 'hud';
      out.fontSize = clampNum(src.fontSize, 8, 72, 18);
      out.fontWeight = ['600', '700', '800', '900'].includes(String(src.fontWeight)) ? String(src.fontWeight) : '900';
      out.textAlign = ['left', 'center', 'right'].includes(src.textAlign) ? src.textAlign : 'center';
      out.letterSpacing = clampNum(src.letterSpacing, 0, 10, 0.8);
      out.color = sanitizeCssColor(src.color) || def.color;
      out.glowColor = sanitizeCssColor(src.glowColor) || '';
      out.glowBlur = clampNum(src.glowBlur, 0, 32, def.glowBlur);
      out.strokeColor = sanitizeCssColor(src.strokeColor) || '#020617';
      out.strokeWidth = clampNum(src.strokeWidth, 0, 4, 0);
      out.bgColor = sanitizeCssColor(src.bgColor) || '#020617';
      out.bgOpacity = clampNum(src.bgOpacity, 0, 1, 0);
      out.borderRadius = clampNum(src.borderRadius, 0, 32, 6);
    }
    return out;
  }

  function buildLayersFromCardConfig(cfg) {
    const c = normalizeConfig({ systemConfig: cfg });
    const layers = [];
    const accent = c.accentColor || '#00f0ff';
    const sec = c.secondaryColor || accent;
    const bg = c.bgColor || '#041226';
    const elSt = c.elementStyles || {};

    layers.push(createDefaultCanvasLayer('background', {
      name: 'Card Background',
      locked: true,
      imageUrl: c.cardBgImage || '',
      color: bg,
      color2: sec,
      blur: c.cardBgBlur || 0,
      brightness: c.cardBgBrightness ?? 1,
      tintColor: c.cardBgTint || bg,
      tintOpacity: c.cardBgImage ? (c.cardBgTintOpacity ?? 0.35) : 0
    }));

    if (c.starburst) {
      layers.push(createDefaultCanvasLayer('sparkles', { name: 'Starburst Rays', pattern: 'starburst', color: accent, secondaryColor: sec, opacity: 0.9 }));
    }
    if (c.scanlines) {
      layers.push(createDefaultCanvasLayer('sparkles', { name: 'HUD Scanlines', pattern: 'scanlines', color: accent, secondaryColor: sec, opacity: 0.85 }));
    }
    if (c.gridPattern) {
      layers.push(createDefaultCanvasLayer('sparkles', { name: 'Tactical Grid', pattern: 'grid', color: accent, secondaryColor: sec, opacity: 0.8 }));
    }
    if (c.sparkles) {
      layers.push(createDefaultCanvasLayer('sparkles', { name: 'Sparkles FX', pattern: 'sparkles', color: accent, secondaryColor: sec, opacity: 0.95 }));
    }

    if (isSafeUrl(c.mediaUrl)) {
      layers.push(createDefaultCanvasLayer('image', {
        name: c.mediaCaption || 'Card Visual',
        x: 28, y: 12, w: 44, h: 36,
        imageUrl: c.mediaUrl,
        blendDark: Boolean(c.iconBlendDark),
        glowColor: accent,
        glowBlur: 8
      }));
    } else if (c.svgIcon || c.customIconData) {
      layers.push(createDefaultCanvasLayer('icon', {
        name: 'Emblem Icon',
        x: 32, y: 12, w: 36, h: 32,
        svgIcon: c.svgIcon || '',
        customIconData: c.customIconData || '',
        color: (elSt.icons && elSt.icons.color) || accent,
        glowColor: (elSt.icons && elSt.icons.glowColor) || sec,
        glowBlur: (elSt.icons && elSt.icons.glowBlur) || 10,
        blendDark: Boolean(c.iconBlendDark)
      }));
    }

    const hasTopVisual = isSafeUrl(c.mediaUrl) || c.svgIcon || c.customIconData;
    if (c.headerTitle) {
      const ts = elSt.title || {};
      layers.push(createDefaultCanvasLayer('text', {
        name: 'Title Text',
        x: 8, y: hasTopVisual ? 47 : 12, w: 84, h: 14,
        text: c.headerTitle,
        fontFamily: ts.fontFamily || c.fontStyle || 'hud',
        fontSize: ts.fontSize > 0 ? ts.fontSize : (c.cardStyle === 'relic' ? 22 : 17),
        color: ts.color || accent,
        glowColor: ts.glowColor || sec,
        glowBlur: ts.glowBlur > 0 ? ts.glowBlur : 10,
        strokeColor: ts.strokeColor || '#020617',
        strokeWidth: ts.strokeWidth || 0
      }));
    }
    if (c.subtitle) {
      const ss = elSt.subtitle || {};
      layers.push(createDefaultCanvasLayer('text', {
        name: 'Subtitle Text',
        x: 10, y: hasTopVisual ? 61 : 28, w: 80, h: 10,
        text: c.subtitle,
        fontFamily: ss.fontFamily || c.fontStyle || 'hud',
        fontSize: ss.fontSize > 0 ? ss.fontSize : 11,
        color: ss.color || '#cbd5e1',
        glowColor: ss.glowColor || accent,
        glowBlur: ss.glowBlur || 0,
        strokeColor: ss.strokeColor || '#020617',
        strokeWidth: ss.strokeWidth || 0
      }));
    }
    if (c.bodyText) {
      const bs = elSt.body || {};
      layers.push(createDefaultCanvasLayer('text', {
        name: 'Body Narrative',
        x: 10, y: hasTopVisual ? 71 : 42, w: 80, h: 22,
        text: c.bodyText,
        fontFamily: bs.fontFamily || c.fontStyle || 'hud',
        fontSize: bs.fontSize > 0 ? bs.fontSize : 12,
        color: bs.color || '#f8fafc',
        glowColor: bs.glowColor || accent,
        glowBlur: bs.glowBlur || 0,
        strokeColor: bs.strokeColor || '#020617',
        strokeWidth: bs.strokeWidth || 0
      }));
    }

    if (c.frameStyle && c.frameStyle !== 'none') {
      layers.push(createDefaultCanvasLayer('border', {
        name: 'Card Frame',
        locked: true,
        frameStyle: c.frameStyle,
        customFrameSvg: c.customFrameSvg || '',
        color: accent,
        secondaryColor: sec,
        glowBlur: 8
      }));
    }
    return layers;
  }

  function createBlankCanvasConfig() {
    const base = getEmptyBaseConfig();
    base.presetId = 'custom_canvas';
    base.cardStyle = 'canvas';
    base.canvasHeight = 380;
    base.headerTitle = 'CANVA LAYER CARD';
    base.layers = [
      createDefaultCanvasLayer('background', { name: 'Background', locked: true, color: '#041226', color2: '#0f172a' }),
      createDefaultCanvasLayer('sparkles', { name: 'Starburst FX', pattern: 'starburst', color: '#00f0ff', secondaryColor: '#38bdf8', opacity: 0.75 }),
      createDefaultCanvasLayer('icon', { name: 'Relic Emblem', x: 32, y: 14, w: 36, h: 32, svgIcon: 'soul_flame', color: '#00f0ff', glowColor: '#38bdf8', glowBlur: 12 }),
      createDefaultCanvasLayer('text', { name: 'Headline', x: 10, y: 50, w: 80, h: 15, text: 'SYSTEM AWAKENED', fontFamily: 'cinzel', fontSize: 22, color: '#f8fafc', glowColor: '#00f0ff', glowBlur: 12 }),
      createDefaultCanvasLayer('text', { name: 'Lore Body', x: 12, y: 66, w: 76, h: 18, text: 'Drag, resize, rotate & reorder any layer.', fontFamily: 'manhwa', fontSize: 12, color: '#bae6fd', glowBlur: 0 }),
      createDefaultCanvasLayer('border', { name: 'Outer Frame', locked: true, frameStyle: 'tech_brackets', color: '#00f0ff', secondaryColor: '#38bdf8' })
    ];
    return base;
  }

  /* --------------------------------------------------------------------------
     PHASE 3: SHARED STORY RPG STATE & TREE-BRANCHING LOGIC
     -------------------------------------------------------------------------- */
  let fallbackRpgState = null;

  function parseItemEffects(name = '', meta = '') {
    const combined = `${name} ${meta}`.trim();
    const isWeaponOrArmor = /\b(daggers?|blades?|swords?|fangs?|cloaks?|armors?|shields?|crowns?|helms?|helmets?|rings?|staffs?|staves|spears?|bows?|axes?|scythes?|gloves|boots|robes?)\b/i.test(combined);
    const isConsumable = !isWeaponOrArmor && /\b(potions?|elixirs?|recovery|heal|serums?|medkits?|antidotes?|tonics?)\b/i.test(combined);
    const bonuses = [];
    let consumable = null;

    if (isConsumable) {
      const fullRestore = /\b(full\s*recovery|100%\s*(?:hp|mana|mp)|all\s*hp|max\s*heal)\b/i.test(combined);
      const hpM = combined.match(/\+(\d+)\s*HP\b|\bHP\s*\+\s*(\d+)/i);
      const mpM = combined.match(/\+(\d+)\s*(?:MP|MANA)\b|\b(?:MP|MANA)\s*\+\s*(\d+)/i);
      const hpVal = hpM ? parseInt(hpM[1] || hpM[2], 10) || 0 : (fullRestore ? 0 : 50);
      const mpVal = mpM ? parseInt(mpM[1] || mpM[2], 10) || 0 : (fullRestore ? 0 : 25);
      consumable = { fullRestore, hp: hpVal, mp: mpVal };
    } else if (meta) {
      const re = /\b([A-Za-z][A-Za-z\s]{1,12}?)\s*[: ]?\+\s*(\d+)\s*(%?)/g;
      let m;
      while ((m = re.exec(meta)) !== null) {
        const stat = m[1].trim().toUpperCase().replace(/\s+/g, ' ');
        const amt = parseInt(m[2], 10) || 0;
        const suffix = m[3] || '';
        if (stat && amt > 0 && !/^(LV|LEVEL|QTY|STAGE|CHAPTER)$/i.test(stat)) {
          bonuses.push({ stat, amount: amt, suffix });
        }
      }
    }

    const bonusSummary = consumable
      ? (consumable.fullRestore ? 'Full 100% HP & MP (Revives!)' : `+${consumable.hp} HP${consumable.mp ? `, +${consumable.mp} MP` : ''}`)
      : bonuses.map(b => `+${b.amount}${b.suffix} ${b.stat}`).join(', ');

    return { bonuses, consumable, bonusSummary };
  }

  function getDefaultBaseStats() {
    return { STR: 25, AGI: 25, INT: 20, VIT: 20, PER: 20, ATK: 100, DEF: 50 };
  }

  function getDefaultRpgState() {
    return {
      active: false,
      lv: 1,
      hp: 100,
      maxHp: 100,
      mp: 50,
      maxMp: 50,
      exp: 0,
      nextExp: 100,
      coins: 0,
      baseStats: getDefaultBaseStats(),
      inventory: [],
      flags: []
    };
  }

  function normalizeRpgState(raw) {
    const def = getDefaultRpgState();
    const s = (raw && typeof raw === 'object') ? raw : {};
    const maxHp = Math.max(1, Math.round(Number(s.maxHp) || def.maxHp));
    const maxMp = Math.max(0, Math.round(Number.isFinite(Number(s.maxMp)) ? Number(s.maxMp) : def.maxMp));
    const rawStats = (s.baseStats && typeof s.baseStats === 'object') ? s.baseStats : {};
    const baseStats = { ...getDefaultBaseStats() };
    Object.keys(baseStats).forEach(k => {
      if (Number.isFinite(Number(rawStats[k]))) baseStats[k] = Math.max(0, Math.round(Number(rawStats[k])));
    });
    return {
      active: Boolean(s.active),
      lv: Math.max(1, Math.round(Number(s.lv) || 1)),
      maxHp,
      hp: Math.max(0, Math.min(maxHp, Math.round(Number.isFinite(Number(s.hp)) ? Number(s.hp) : maxHp))),
      maxMp,
      mp: Math.max(0, Math.min(maxMp, Math.round(Number.isFinite(Number(s.mp)) ? Number(s.mp) : maxMp))),
      exp: Math.max(0, Math.round(Number(s.exp) || 0)),
      nextExp: Math.max(10, Math.round(Number(s.nextExp) || 100)),
      coins: Math.max(0, Math.round(Number(s.coins) || 0)),
      baseStats,
      inventory: Array.isArray(s.inventory) ? s.inventory.filter(x => x && x.name).map(x => {
        const eff = parseItemEffects(x.name, x.meta || '');
        const bonuses = Array.isArray(x.bonuses) && x.bonuses.length > 0 ? x.bonuses.map(b => ({
          stat: String(b.stat || '').toUpperCase(),
          amount: Math.round(Number(b.amount) || 0),
          suffix: String(b.suffix || '')
        })).filter(b => b.stat && b.amount) : eff.bonuses;
        const consumable = (x.consumable && typeof x.consumable === 'object') ? x.consumable : eff.consumable;
        return {
          icon: String(x.icon || '📦'),
          iconImage: isExplicitItemImageUrl(x.iconImage) ? String(x.iconImage).trim() : '',
          name: String(x.name || 'Item'),
          rarity: normalizeRarity(x.rarity),
          qty: Math.max(1, Math.round(Number(x.qty) || 1)),
          equipped: !consumable && Boolean(x.equipped),
          meta: String(x.meta || ''),
          bonuses,
          consumable: consumable || null,
          unlockReq: String(x.unlockReq || ''),
          locked: Boolean(x.locked)
        };
      }) : [],
      flags: Array.isArray(s.flags) ? Array.from(new Set(s.flags.map(f => String(f || '').trim()).filter(Boolean))) : []
    };
  }

  function computeEquippedGearStats(rpg) {
    const st = rpg || getRpgState();
    const bonusMap = {};
    const equippedItems = [];
    (st.inventory || []).forEach(it => {
      if (!it || !it.equipped || it.consumable || Number(it.qty || 1) <= 0) return;
      const ev = evaluateUnlockReq(it.unlockReq, st);
      if (ev.hasReq && !ev.unlocked) return;
      equippedItems.push(it);
      (it.bonuses || []).forEach(b => {
        const key = String(b.stat || '').toUpperCase();
        if (!key || !b.amount) return;
        if (!bonusMap[key]) bonusMap[key] = { stat: key, amount: 0, suffix: b.suffix || '', sources: [] };
        bonusMap[key].amount += Number(b.amount) || 0;
        if (b.suffix && !bonusMap[key].suffix) bonusMap[key].suffix = b.suffix;
        if (!bonusMap[key].sources.includes(it.name)) bonusMap[key].sources.push(it.name);
      });
    });
    return { bonusMap, bonusList: Object.values(bonusMap), equippedItems };
  }

  function isExplicitItemImageUrl(url) {
    if (!url || typeof url !== 'string') return false;
    const u = url.trim();
    if (!u || !isSafeUrl(u)) return false;
    if (/^(?:data:image\/|blob:|https?:\/\/|\.?\/?assets\/|\/)/i.test(u)) return true;
    return /\.(?:png|jpe?g|webp|gif|svg|avif)(?:\?.*)?$/i.test(u);
  }

  function getItemImageSrc(item) {
    if (!item || typeof item !== 'object') return '';
    if (isExplicitItemImageUrl(item.iconImage)) return String(item.iconImage).trim();
    if (isExplicitItemImageUrl(item.imageUrl)) return String(item.imageUrl).trim();
    if (isExplicitItemImageUrl(item.icon)) return String(item.icon).trim();
    return '';
  }

  function renderItemIconVisual(item, fallbackEmoji = '📦', sizeCls = '') {
    const imgSrc = getItemImageSrc(item);
    const rarity = normalizeRarity(item && item.rarity);
    const sz = sizeCls ? ` ${sizeCls}` : '';
    const inner = imgSrc
      ? `<img class="msw-item-icon-img" src="${esc(imgSrc)}" alt="${esc((item && item.name) || 'Item')}">`
      : `<span class="msw-item-icon-emoji">${esc((item && item.icon) || fallbackEmoji)}</span>`;
    return `<div class="msw-item-pedestal rarity-${esc(rarity)}${sz}">${inner}</div>`;
  }

  function inferItemCategory(item) {
    const txt = `${(item && item.name) || ''} ${(item && item.meta) || ''}`;
    if (/\b(potions?|elixirs?|recovery|heal|serums?|medkits?|antidotes?|tonics?)\b/i.test(txt)) return 'CONSUMABLE';
    if (/\b(daggers?|blades?|swords?|fangs?|spears?|bows?|axes?|staffs?|staves|scythes?)\b/i.test(txt)) return 'WEAPON';
    if (/\b(cloaks?|armors?|shields?|crowns?|helms?|helmets?|rings?|gloves|boots|robes?)\b/i.test(txt)) return 'ARMOR';
    if (/\b(skills?|scrolls?|runes?|books?|manuals?)\b/i.test(txt)) return 'SKILL';
    return 'RELIC';
  }

  function buildItemEffectChipsHtml(item) {
    const meta = String((item && item.meta) || '').trim();
    const eff = parseItemEffects((item && item.name) || '', meta);
    const chips = [];
    if (eff.consumable) {
      chips.push(`<span class="msw-shop-chip is-heal">💚 ${esc(eff.bonusSummary)}</span>`);
    } else if (eff.bonuses && eff.bonuses.length > 0) {
      eff.bonuses.forEach(b => {
        const cls = /DEF|VIT|HP/i.test(b.stat) ? 'is-def' : (/ATK|STR|CRIT/i.test(b.stat) ? 'is-atk' : '');
        chips.push(`<span class="msw-shop-chip ${cls}">${/ATK|STR/i.test(b.stat) ? '⚔️' : (/DEF|VIT/i.test(b.stat) ? '🛡️' : '⚡')} +${esc(b.amount + b.suffix)} ${esc(b.stat)}</span>`);
      });
    }
    const extraParts = meta.split('•').map(p => p.trim()).filter(p => p && !/^(?:ATK|DEF|STR|AGI|INT|VIT|PER|STEALTH)\s*\+|Instant\s*100%/i.test(p));
    extraParts.slice(0, 2).forEach(part => {
      if (!/^REQ:/i.test(part)) chips.push(`<span class="msw-shop-chip">${esc(part)}</span>`);
    });
    if (chips.length === 0 && meta) chips.push(`<span class="msw-shop-chip">${esc(meta)}</span>`);
    return chips.length > 0 ? `<div class="msw-shop-chips">${chips.join('')}</div>` : '';
  }

  function renderManhwaStatusSections(cfg, gear) {
    const pills = Array.isArray(cfg.pills) ? cfg.pills : [];
    const equippedList = [];
    const seenEqp = new Set();
    if (gear && Array.isArray(gear.equippedItems)) {
      gear.equippedItems.forEach((it, idx) => {
        seenEqp.add(String(it.name || '').toLowerCase());
        equippedList.push({ ...it, _eqIdx: idx });
      });
    }
    const passives = [];
    const traits = [];

    pills.forEach(raw => {
      const p = String(raw || '').trim();
      if (!p) return;
      if (/^⚔️?\s*Equipped:/i.test(p)) {
        const names = p.replace(/^⚔️?\s*Equipped:\s*/i, '').split(',').map(s => s.trim()).filter(Boolean);
        names.forEach(n => {
          const clean = n.replace(/^[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\s]+/u, '').trim() || n;
          if (!seenEqp.has(clean.toLowerCase())) {
            seenEqp.add(clean.toLowerCase());
            equippedList.push({ icon: '⚔️', name: n, rarity: 'rare', meta: '' });
          }
        });
        return;
      }
      const pasMatch = p.match(/^Passive:\s*(.+)$/i);
      if (pasMatch) {
        const body = pasMatch[1].trim();
        const lvMatch = body.match(/^(.*?)\s*(Lv\.?\s*\d+|[SABCD]-?Rank|MAX)$/i);
        const skillName = lvMatch ? lvMatch[1].trim() : body;
        const lvTag = lvMatch ? lvMatch[2].toUpperCase().replace(/\s+/g, '') : 'PASSIVE';
        passives.push({ name: skillName, lv: lvTag, kind: 'PASSIVE' });
        return;
      }
      const trMatch = p.match(/^(Immunity|Resistance|Blessing|Curse|Trait|Title):\s*(.+)$/i);
      if (trMatch) {
        traits.push({ kind: trMatch[1].toUpperCase(), name: trMatch[2].trim() });
        return;
      }
      if (/\bLv\.?\s*\d+/i.test(p)) {
        const lvM = p.match(/^(.*?)\s*(Lv\.?\s*\d+)$/i);
        passives.push({ name: lvM ? lvM[1].trim() : p, lv: lvM ? lvM[2].toUpperCase() : 'SKILL', kind: 'SKILL' });
      } else {
        traits.push({ kind: 'TRAIT', name: p });
      }
    });

    if (equippedList.length === 0 && passives.length === 0 && traits.length === 0) return '';
    const isCompact = cfg.statusLayout === 'compact';

    const eqpHtml = equippedList.length > 0 ? `
      <div class="msw-sys-section">
        <div class="msw-sys-sec-title"><span>⚔️</span><span>[EQUIPPED GEAR]</span></div>
        ${equippedList.map((it, idx) => {
          const eff = parseItemEffects(it.name, it.meta || '');
          const bTxt = eff.bonusSummary || (Array.isArray(it.bonuses) ? it.bonuses.map(b => `+${b.amount}${b.suffix} ${b.stat}`).join(', ') : '');
          return `
            <div class="msw-gear-row" data-inspect-eqp-idx="${idx}">
              <div class="msw-skill-left">
                ${renderItemIconVisual(it, '⚔️', 'sm')}
                <div style="min-width:0;">
                  <div class="msw-skill-name">${esc(it.name)}</div>
                  ${bTxt ? `<div style="font-size:9.5px; font-weight:800; color:#4ade80;">${esc(bTxt)}</div>` : ''}
                </div>
              </div>
              <span class="msw-rarity-pill rarity-${esc(normalizeRarity(it.rarity))}">${esc(normalizeRarity(it.rarity).toUpperCase())}</span>
            </div>
          `;
        }).join('')}
      </div>
    ` : '';

    const passHtml = passives.length > 0 ? `
      <div class="msw-sys-section">
        <div class="msw-sys-sec-title"><span>⚡</span><span>[PASSIVE SKILLS]</span></div>
        ${passives.map(sk => {
          const rune = /shadow|stealth|dark/i.test(sk.name) ? '🌑' : (/sword|blade|slash/i.test(sk.name) ? '⚔️' : '🌀');
          return `
            <div class="msw-skill-row">
              <div class="msw-skill-left">
                <span class="msw-skill-rune">${rune}</span>
                <span class="msw-skill-name">${esc(sk.name)}</span>
              </div>
              <div class="msw-skill-badges">
                <span class="msw-lv-pill">${esc(sk.lv)}</span>
                <span class="msw-type-pill">${esc(sk.kind)}</span>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    ` : '';

    const traitHtml = traits.length > 0 ? `
      <div class="msw-sys-section">
        <div class="msw-sys-sec-title"><span>🛡️</span><span>[IMMUNITIES &amp; TRAITS]</span></div>
        <div class="msw-traits-grid">
          ${traits.map(tr => `
            <span class="msw-trait-chip">
              <span>${/IMMUNITY|RESIST/i.test(tr.kind) ? '🛡️' : '✦'}</span>
              <span>${esc(tr.name)}</span>
              <span class="msw-trait-kind">[${esc(tr.kind)}]</span>
            </span>
          `).join('')}
        </div>
      </div>
    ` : '';

    return `<div class="msw-status-sections${isCompact ? ' is-compact' : ''}">${eqpHtml}${passHtml}${traitHtml}</div>`;
  }

  function closeItemInspectModal() {
    if (typeof document === 'undefined' || typeof document.getElementById !== 'function') return;
    const el = document.getElementById('mswItemInspectBackdrop');
    if (el) el.classList.remove('open');
  }

  let pendingInspectAction = null;
  function openItemInspectModal(item, ctx = {}) {
    if (typeof document === 'undefined' || !document.body || !item) return;
    pendingInspectAction = ctx;
    let backdrop = document.getElementById('mswItemInspectBackdrop');
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.id = 'mswItemInspectBackdrop';
      backdrop.className = 'msw-inspect-backdrop';
      backdrop.innerHTML = `
        <div class="msw-inspect-win">
          <div class="msw-inspect-head">
            <strong style="font-size:12.5px; color:#00f0ff; letter-spacing:0.8px;">◈ SYSTEM ITEM ANALYSIS</strong>
            <button type="button" class="syswin-chip-btn" id="mswInspectCloseBtn">✕</button>
          </div>
          <div id="mswInspectBody" style="display:flex; flex-direction:column; gap:10px;"></div>
        </div>
      `;
      document.body.appendChild(backdrop);
      backdrop.addEventListener('click', (e) => { if (e.target === backdrop) closeItemInspectModal(); });
      const clsBtn = document.getElementById('mswInspectCloseBtn');
      if (clsBtn) clsBtn.addEventListener('click', closeItemInspectModal);
    }

    const body = document.getElementById('mswInspectBody');
    const rpg = getRpgState();
    const rarity = normalizeRarity(item.rarity);
    const cat = inferItemCategory(item);
    const liveEval = evaluateUnlockReq(item.unlockReq, rpg);
    const lockedNow = liveEval.hasReq ? !liveEval.unlocked : Boolean(item.locked);
    const eff = parseItemEffects(item.name, item.meta || '');
    const isCons = Boolean(item.consumable || eff.consumable);
    const chipsHtml = buildItemEffectChipsHtml(item);
    const reqText = liveEval.hasReq
      ? (lockedNow ? `🔒 Locked — Requires ${liveEval.missing.join(', ')}` : `🔓 Requirement Met (${liveEval.summary})`)
      : (lockedNow ? `🔒 Locked${item.price ? ': ' + item.price : ''}` : '🔓 Ready for Use');

    let actionBtnHtml = '';
    if (ctx.source === 'shop') {
      if (item.owned) {
        actionBtnHtml = `<button type="button" class="msw-rpg-bag-btn eqp" style="width:100%;" id="mswInspectGoBagBtn">✔ ALREADY OWNED • OPEN 🎒 BAG</button>`;
      } else if (!lockedNow && !ctx.previewMode) {
        actionBtnHtml = `<button type="button" class="msw-rpg-bag-btn" style="width:100%; border-color:#facc15; color:#fde047;" id="mswInspectActBtn">🪙 BUY NOW (${esc(item.price || 'CLAIM')})</button>`;
      }
    } else if ((ctx.source === 'bag' || ctx.source === 'inv') && !lockedNow && !ctx.previewMode) {
      const lbl = isCons ? '🧪 USE ITEM NOW' : (item.equipped ? '✔ UNEQUIP GEAR' : '⚔️ EQUIP TO PLAYER');
      actionBtnHtml = `<button type="button" class="msw-rpg-bag-btn ${isCons ? 'use' : (item.equipped ? 'eqp' : '')}" style="width:100%;" id="mswInspectActBtn">${lbl}</button>`;
    }

    body.innerHTML = `
      <div class="msw-inspect-hero">
        ${renderItemIconVisual(item, '📦', 'lg')}
        <div style="min-width:0; flex:1; display:flex; flex-direction:column; gap:4px;">
          <div style="display:flex; gap:5px; flex-wrap:wrap;">
            <span class="msw-rarity-pill rarity-${esc(rarity)}">[${esc(rarity.toUpperCase())}]</span>
            <span class="msw-cat-pill">[${esc(cat)}]</span>
            ${item.equipped ? '<span class="msw-lv-pill">EQUIPPED</span>' : ''}
            ${Number(item.qty) > 1 ? `<span class="msw-type-pill">QTY x${Number(item.qty)}</span>` : ''}
          </div>
          <div style="font-size:15px; font-weight:900; color:#f8fafc; line-height:1.2;">${esc(item.name)}</div>
          ${item.price ? `<div style="font-size:11.5px; font-weight:800; color:#fde047;">🪙 Price: ${esc(item.price)}</div>` : ''}
        </div>
      </div>
      <div class="msw-inspect-box">
        <div style="font-size:9.5px; font-weight:900; color:#38bdf8; letter-spacing:0.6px; margin-bottom:4px;">◆ SYSTEM EFFECTS &amp; ATTRIBUTES</div>
        ${chipsHtml || '<div style="color:#94a3b8;">Standard System item.</div>'}
        <div style="margin-top:6px; font-size:10.5px; color:${lockedNow ? '#fca5a5' : '#86efac'}; font-weight:800;">${esc(reqText)}</div>
      </div>
      ${actionBtnHtml}
    `;

    backdrop.classList.add('open');

    const goBag = document.getElementById('mswInspectGoBagBtn');
    if (goBag) goBag.onclick = () => { closeItemInspectModal(); openRpgDrawer('bag'); };

    const actBtn = document.getElementById('mswInspectActBtn');
    if (actBtn) {
      actBtn.onclick = () => {
        const c = pendingInspectAction || {};
        if (c.source === 'shop') {
          purchaseShopItem(c.msg, c.cfg, c.el, c.idx, c.buyBtn);
          closeItemInspectModal();
        } else if (c.source === 'bag') {
          equipOrUseInventoryItem(c.idx, { fromDrawer: true });
          closeItemInspectModal();
          if (document.getElementById('mswRpgDrawerBackdrop')?.classList.contains('open')) renderRpgDrawerBody();
        } else if (c.source === 'inv' && c.msg && !c.previewMode) {
          const list = (c.msg.systemConfig && c.msg.systemConfig.inventoryItems) || [];
          const t = list[c.idx];
          if (t) {
            t.equipped = !t.equipped;
            if (api() && typeof api().saveStudioState === 'function') api().saveStudioState();
            if (api() && typeof api().showToast === 'function') api().showToast(t.equipped ? `⚔️ Equipped ${t.name}!` : `🎒 Unequipped ${t.name}`);
            closeItemInspectModal();
            if (c.el && c.slotEl) {
              c.slotEl.classList.toggle('is-equipped', t.equipped);
            }
          }
        }
      };
    }
  }

  function purchaseShopItem(msg, cfg, el, idx, buyBtn, previewMode = false) {
    const target = (msg && msg.systemConfig && msg.systemConfig.shopItems && msg.systemConfig.shopItems[idx]) || (cfg && cfg.shopItems && cfg.shopItems[idx]);
    if (!target) return false;
    const curRpg = getRpgState();
    const liveEval = evaluateUnlockReq(target.unlockReq, curRpg);
    const lockedNow = liveEval.hasReq ? !liveEval.unlocked : Boolean(target.locked);
    if (lockedNow) {
      const msgTxt = liveEval.hasReq ? `🔒 Locked — Need: ${liveEval.missing.join(', ')}` : `🔒 Locked: ${target.meta || target.price}`;
      if (api() && typeof api().showToast === 'function') api().showToast(msgTxt);
      if (api() && typeof api().triggerSfxByName === 'function') api().triggerSfxByName('sting', 1.0);
      return false;
    }
    if (target.owned) return false;
    const eff = parseItemEffects(target.name, target.meta || '');
    const priceNum = /^LOCKED/i.test(target.price) ? parseCoinNumber(String(target.price).replace(/LV\.?\s*\d+/gi, '')) : parseCoinNumber(target.price);
    const headerCoins = parseCoinNumber(cfg && cfg.currencyText);
    if (!previewMode && !curRpg.active && priceNum > 0 && headerCoins >= priceNum) {
      curRpg.active = true;
      curRpg.coins = headerCoins;
    }
    const economyLinked = curRpg.active || (cfg && cfg.rpgLink && cfg.rpgLink.enabled) || (cfg && cfg.syncWithStoryRpg) || liveEval.hasReq;
    if (!previewMode && economyLinked && priceNum > 0) {
      if (curRpg.coins < priceNum) {
        if (api() && typeof api().showToast === 'function') api().showToast(`🪙 Need ${formatCoins(priceNum)} G (You have ${formatCoins(curRpg.coins)} G)`);
        if (api() && typeof api().triggerSfxByName === 'function') api().triggerSfxByName('sting', 1.0);
        return false;
      }
      curRpg.active = true;
      curRpg.coins -= priceNum;
      const existingInv = curRpg.inventory.find(it => it.name.toLowerCase() === String(target.name).toLowerCase());
      if (existingInv) {
        existingInv.qty += 1;
        if (!existingInv.iconImage && target.iconImage) existingInv.iconImage = target.iconImage;
        if (!existingInv.meta && target.meta) existingInv.meta = target.meta;
        if ((!existingInv.bonuses || !existingInv.bonuses.length) && eff.bonuses.length) existingInv.bonuses = eff.bonuses;
        if (!existingInv.consumable && eff.consumable) existingInv.consumable = eff.consumable;
      } else {
        curRpg.inventory.push({
          icon: target.icon || '🛒',
          iconImage: isExplicitItemImageUrl(target.iconImage) ? String(target.iconImage).trim() : '',
          name: target.name,
          rarity: normalizeRarity(target.rarity),
          qty: 1,
          equipped: false,
          meta: target.meta || '',
          bonuses: eff.bonuses,
          consumable: eff.consumable || null,
          unlockReq: '',
          locked: false
        });
      }
      target.owned = true;
      if (buyBtn) {
        buyBtn.classList.add('owned');
        buyBtn.textContent = '✔ OWNED';
      }
      if (el) {
        const curPill = el.querySelector('.msw-currency-pill');
        if (curPill) curPill.textContent = `🪙 ${formatCoins(curRpg.coins)} G`;
        const bagBtn = el.querySelector('.msw-card-rpg-bag');
        if (bagBtn) {
          const totalQ = curRpg.inventory.reduce((acc, it) => acc + Math.max(1, Number(it.qty) || 1), 0);
          bagBtn.textContent = `🎒 Bag (${totalQ})`;
        }
      }
      saveRpgState(curRpg);
      renderRpgHudBar({ pulseBag: true });
      if (api() && typeof api().triggerSfxByName === 'function') api().triggerSfxByName('sparkle', 1.1);
      if (api() && typeof api().showToast === 'function') {
        api().showToast(`🪙 Bought ${target.name} (-${formatCoins(priceNum)} G)!`, {
          actionLabel: eff.consumable ? '🎒 Bag / Use' : '🎒 Bag / Equip',
          onAction: () => openRpgDrawer('bag')
        });
      }
      if (api() && typeof api().saveStudioState === 'function') api().saveStudioState();
      return true;
    }
    target.owned = true;
    if (buyBtn) {
      buyBtn.classList.add('owned');
      buyBtn.textContent = '✔ OWNED';
    }
    if (economyLinked && !previewMode) {
      curRpg.active = true;
      curRpg.inventory.push({
        icon: target.icon || '🛒',
        iconImage: isExplicitItemImageUrl(target.iconImage) ? String(target.iconImage).trim() : '',
        name: target.name,
        rarity: normalizeRarity(target.rarity),
        qty: 1,
        equipped: false,
        meta: target.meta || '',
        bonuses: eff.bonuses,
        consumable: eff.consumable || null
      });
      saveRpgState(curRpg);
      renderRpgHudBar({ pulseBag: true });
    }
    if (api() && typeof api().triggerSfxByName === 'function') api().triggerSfxByName('sparkle', 1.1);
    if (api() && typeof api().showToast === 'function') api().showToast(`🪙 Purchased ${target.name}!`);
    if (!previewMode && api() && typeof api().saveStudioState === 'function') api().saveStudioState();
    return true;
  }

  let activeRpgDrawerTab = 'bag';
  let rpgHudPulseState = { bag: false, profile: false };

  function renderRpgHudBar(opts = {}) {
    if (typeof document === 'undefined' || typeof document.getElementById !== 'function') return;
    if (opts.pulseBag !== undefined) rpgHudPulseState.bag = Boolean(opts.pulseBag);
    if (opts.pulseProfile !== undefined) rpgHudPulseState.profile = Boolean(opts.pulseProfile);
    // Keep top info bar hidden so native WhatsApp / app chrome stays authentic
    const bar = document.getElementById('mswRpgHudBar');
    if (bar) {
      bar.style.display = 'none';
      bar.innerHTML = '';
    }
    const menuItem = document.getElementById('menuRpgBagItem');
    if (menuItem) {
      const rpg = getRpgState();
      const totalQty = (rpg.inventory || []).reduce((acc, it) => acc + Math.max(1, Number(it.qty) || 1), 0);
      menuItem.textContent = rpg.active
        ? `🎒 Player Bag (${totalQty}) • LV.${rpg.lv} • 📊 Profile`
        : '🎒 Player Bag & Boosted Profile';
    }
  }

  function closeRpgDrawer() {
    if (typeof document === 'undefined' || typeof document.getElementById !== 'function') return;
    const el = document.getElementById('mswRpgDrawerBackdrop');
    if (el) el.classList.remove('open');
  }

  function insertSyncedRpgCard(kind = 'status') {
    if (!api() || typeof api().upsertSystemWindowMessage !== 'function') return false;
    const preset = PRESETS.find(p => p.id === kind) || PRESETS[0];
    const cfg = normalizeConfig({ systemConfig: { ...cloneObj(preset.config), syncWithStoryRpg: true } });
    api().upsertSystemWindowMessage({
      title: cfg.headerTitle,
      text: cfg.bodyText || cfg.subtitle,
      systemConfig: cfg,
      delayMs: estimateSystemWindowHoldMs(cfg)
    });
    closeRpgDrawer();
    if (typeof api().showToast === 'function') {
      api().showToast(kind === 'inventory' ? '🎒 Inserted Live Inventory Card!' : '📊 Inserted Live Boosted Profile Card!');
    }
    return true;
  }

  function renderRpgDrawerBody() {
    if (typeof document === 'undefined' || typeof document.getElementById !== 'function') return;
    const body = document.getElementById('mswRpgDrawerBody');
    const bagTab = document.getElementById('mswRpgTabBag');
    const profTab = document.getElementById('mswRpgTabProfile');
    if (!body) return;
    const rpg = getRpgState();
    const totalQty = (rpg.inventory || []).reduce((acc, it) => acc + Math.max(1, Number(it.qty) || 1), 0);
    if (bagTab) {
      bagTab.classList.toggle('active', activeRpgDrawerTab === 'bag');
      bagTab.textContent = `🎒 Bag (${totalQty})`;
    }
    if (profTab) profTab.classList.toggle('active', activeRpgDrawerTab === 'profile');

    if (activeRpgDrawerTab === 'profile') {
      const statusPreset = PRESETS.find(p => p.id === 'status');
      const cardEl = renderSystemWindowElement({
        systemConfig: { ...cloneObj(statusPreset.config), syncWithStoryRpg: true }
      }, { previewMode: true });
      body.innerHTML = '';
      body.appendChild(cardEl);
      const actRow = document.createElement('div');
      actRow.style.cssText = 'display:flex; gap:8px; justify-content:flex-end; margin-top:4px;';
      actRow.innerHTML = `
        <button type="button" class="msw-rpg-bag-btn" onclick="window.ChatHubSystemWindows.insertSyncedRpgCard('status')">➕ Insert Profile Card to Chat</button>
      `;
      body.appendChild(actRow);
      return;
    }

    if (!rpg.inventory || rpg.inventory.length === 0) {
      body.innerHTML = `
        <div style="text-align:center; padding:22px 10px; color:#94a3b8; font-size:12px;">
          Your Bag is empty. Buy items from a <b>Coin Shop</b> or complete a <b>Quest</b> with reward items!
        </div>
      `;
      return;
    }

    body.innerHTML = rpg.inventory.map((it, idx) => {
      const liveEval = evaluateUnlockReq(it.unlockReq, rpg);
      const isLocked = liveEval.hasReq ? !liveEval.unlocked : Boolean(it.locked);
      const eff = parseItemEffects(it.name, it.meta || '');
      const effectLabel = eff.bonusSummary || it.meta || (it.consumable ? 'Consumable' : 'Gear');
      const btnCls = isLocked ? '' : (it.consumable ? 'use' : (it.equipped ? 'eqp' : ''));
      const btnLabel = isLocked ? '🔒 LOCKED' : (it.consumable ? '🧪 USE' : (it.equipped ? '✔ EQUIPPED' : '⚔️ EQUIP'));
      return `
        <div class="msw-rpg-bag-row ${it.equipped && !isLocked ? 'is-eqp' : ''}">
          <div class="msw-bag-inspect-hit" data-bag-inspect-idx="${idx}" style="display:flex; align-items:center; gap:9px; min-width:0; flex:1; cursor:pointer;" title="Tap for Item Info">
            ${renderItemIconVisual(it, '📦', 'sm')}
            <div style="min-width:0;">
              <div style="font-size:12.5px; font-weight:800; color:#f8fafc; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                ${esc(it.name)} ${it.qty > 1 ? `<span style="color:#facc15;">x${it.qty}</span>` : ''}
              </div>
              <div style="font-size:10.5px; color:${eff.bonusSummary ? '#4ade80' : '#94a3b8'}; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                ${esc(effectLabel)}
              </div>
            </div>
          </div>
          <button type="button" class="msw-rpg-bag-btn ${btnCls}" data-drawer-inv-idx="${idx}">${btnLabel}</button>
        </div>
      `;
    }).join('') + `
      <div style="display:flex; gap:8px; justify-content:space-between; align-items:center; margin-top:4px; padding-top:8px; border-top:1px solid #1e293b;">
        <button type="button" class="msw-rpg-bag-btn" onclick="window.ChatHubSystemWindows.openRpgDrawer('profile')">📊 Check Boosted Profile ➔</button>
        <button type="button" class="msw-rpg-bag-btn" onclick="window.ChatHubSystemWindows.insertSyncedRpgCard('inventory')">➕ Insert Bag Card</button>
      </div>
    `;

    body.querySelectorAll('[data-bag-inspect-idx]').forEach(hit => {
      hit.addEventListener('click', () => {
        const idx = Number(hit.dataset.bagInspectIdx);
        const it = rpg.inventory[idx];
        if (it) openItemInspectModal(it, { source: 'bag', idx });
      });
    });

    body.querySelectorAll('[data-drawer-inv-idx]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const idx = Number(btn.dataset.drawerInvIdx);
        equipOrUseInventoryItem(idx, { fromDrawer: true });
        renderRpgDrawerBody();
      });
    });
  }

  function openRpgDrawer(tab = 'bag') {
    if (typeof document === 'undefined' || !document.body) return;
    activeRpgDrawerTab = tab === 'profile' ? 'profile' : 'bag';
    if (activeRpgDrawerTab === 'bag') rpgHudPulseState.bag = false;
    if (activeRpgDrawerTab === 'profile') rpgHudPulseState.profile = false;
    renderRpgHudBar();
    let backdrop = document.getElementById('mswRpgDrawerBackdrop');
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.id = 'mswRpgDrawerBackdrop';
      backdrop.className = 'msw-rpg-drawer-backdrop';
      backdrop.innerHTML = `
        <div class="msw-rpg-drawer-win">
          <div class="msw-rpg-drawer-head">
            <strong style="font-size:13.5px; color:#00f0ff; letter-spacing:0.6px;">⚔️ PLAYER SYSTEM STORAGE & PROFILE</strong>
            <button type="button" class="syswin-chip-btn" id="mswRpgDrawerCloseBtn">✕</button>
          </div>
          <div class="msw-rpg-drawer-tabs">
            <button type="button" class="msw-rpg-drawer-tab" id="mswRpgTabBag">🎒 Bag</button>
            <button type="button" class="msw-rpg-drawer-tab" id="mswRpgTabProfile">📊 Boosted Profile</button>
          </div>
          <div class="msw-rpg-drawer-body" id="mswRpgDrawerBody"></div>
        </div>
      `;
      document.body.appendChild(backdrop);
      backdrop.addEventListener('click', (e) => { if (e.target === backdrop) closeRpgDrawer(); });
      const closeBtn = document.getElementById('mswRpgDrawerCloseBtn');
      if (closeBtn) closeBtn.addEventListener('click', closeRpgDrawer);
      const bagTab = document.getElementById('mswRpgTabBag');
      if (bagTab) bagTab.addEventListener('click', () => { activeRpgDrawerTab = 'bag'; rpgHudPulseState.bag = false; renderRpgDrawerBody(); renderRpgHudBar(); });
      const profTab = document.getElementById('mswRpgTabProfile');
      if (profTab) profTab.addEventListener('click', () => { activeRpgDrawerTab = 'profile'; rpgHudPulseState.profile = false; renderRpgDrawerBody(); renderRpgHudBar(); });
    }
    backdrop.classList.add('open');
    renderRpgDrawerBody();
  }

  function equipOrUseInventoryItem(idx, opts = {}) {
    const st = getRpgState();
    const target = st.inventory && st.inventory[idx];
    if (!target) return null;
    const liveEval = evaluateUnlockReq(target.unlockReq, st);
    const lockedNow = liveEval.hasReq ? !liveEval.unlocked : Boolean(target.locked);
    if (lockedNow) {
      const msgTxt = liveEval.hasReq ? `🔒 ${target.name} requires: ${liveEval.missing.join(', ')}` : `🔒 ${target.name} is Locked!`;
      if (api() && typeof api().showToast === 'function') api().showToast(msgTxt);
      if (api() && typeof api().triggerSfxByName === 'function') api().triggerSfxByName('sting', 1.0);
      return { locked: true };
    }

    st.active = true;
    const eff = parseItemEffects(target.name, target.meta || '');
    const cons = target.consumable || eff.consumable;
    if (cons) {
      const beforeHp = st.hp;
      const beforeMp = st.mp;
      if (cons.fullRestore) {
        st.hp = st.maxHp;
        st.mp = st.maxMp;
      } else {
        if (cons.hp > 0) st.hp = Math.min(st.maxHp, st.hp + cons.hp);
        if (cons.mp > 0) st.mp = Math.min(st.maxMp, st.mp + cons.mp);
      }
      if (target.qty > 1) target.qty -= 1;
      else st.inventory.splice(idx, 1);
      const saved = saveRpgState(st, { rerender: !opts.skipRerender });
      renderRpgHudBar({ pulseProfile: true });
      if (api() && typeof api().triggerSfxByName === 'function') api().triggerSfxByName('sparkle', 1.1);
      if (api() && typeof api().showToast === 'function') {
        const revived = beforeHp <= 0 && saved.hp > 0 ? '⚡ REVIVED! ' : '';
        api().showToast(`🧪 ${revived}Used ${target.name}! HP ${beforeHp} ➔ ${saved.hp}/${saved.maxHp} • MP ${beforeMp} ➔ ${saved.mp}/${saved.maxMp}`);
      }
      return { action: 'used', state: saved, beforeHp, beforeMp, itemName: target.name };
    }

    target.equipped = !target.equipped;
    const bonuses = (Array.isArray(target.bonuses) && target.bonuses.length > 0) ? target.bonuses : eff.bonuses;
    target.bonuses = bonuses;
    const saved = saveRpgState(st, { rerender: !opts.skipRerender });
    renderRpgHudBar({ pulseProfile: target.equipped });
    const bonusTxt = bonuses.map(b => `+${b.amount}${b.suffix} ${b.stat}`).join(', ');
    if (api() && typeof api().playPopSound === 'function') api().playPopSound(1.15);
    if (api() && typeof api().showToast === 'function') {
      api().showToast(target.equipped
        ? `⚔️ Equipped ${target.name}${bonusTxt ? ' (' + bonusTxt + ')' : ''}! Tap 📊 Profile to see boosted stats.`
        : `🎒 Unequipped ${target.name}`);
    }
    return { action: target.equipped ? 'equipped' : 'unequipped', state: saved, item: target, bonusTxt };
  }

  function getRpgState() {
    const raw = (api() && typeof api().getStoryRpgState === 'function')
      ? api().getStoryRpgState()
      : fallbackRpgState;
    return normalizeRpgState(raw);
  }

  function saveRpgState(nextState, opts = {}) {
    const norm = normalizeRpgState(nextState);
    if (api() && typeof api().setStoryRpgState === 'function') {
      api().setStoryRpgState(norm, opts);
    } else {
      fallbackRpgState = norm;
    }
    if (!opts || !opts.skipHud) {
      renderRpgHudBar();
    }
    return norm;
  }

  function resetRpgState(opts = {}) {
    rpgHudPulseState = { bag: false, profile: false };
    return saveRpgState(getDefaultRpgState(), opts);
  }

  function parseCoinNumber(str) {
    if (typeof str === 'number') return Math.max(0, Math.round(str));
    const digits = String(str || '').replace(/,/g, '').match(/(\d+)/);
    return digits ? Math.max(0, parseInt(digits[1], 10) || 0) : 0;
  }

  function formatCoins(n) {
    return Math.max(0, Math.round(Number(n) || 0)).toLocaleString('en-US');
  }

  function parseUnlockReq(reqInput) {
    const out = { minLv: 0, minCoins: 0, reqFlags: [], reqItems: [] };
    if (!reqInput) return out;
    if (typeof reqInput === 'object') {
      out.minLv = Math.max(0, Number(reqInput.minLv) || 0);
      out.minCoins = Math.max(0, Number(reqInput.minCoins) || 0);
      if (reqInput.reqFlag) out.reqFlags.push(String(reqInput.reqFlag).trim());
      if (reqInput.reqItem) out.reqItems.push(String(reqInput.reqItem).trim());
      return out;
    }
    String(reqInput).split(/[,;&]+/).map(s => s.trim()).filter(Boolean).forEach(part => {
      const clean = part.replace(/^REQ\s*:\s*/i, '').trim();
      const lvM = clean.match(/^(?:LV|LEVEL)\.?\s*(?:>=|:|=)?\s*(\d+)$/i);
      if (lvM) { out.minLv = Math.max(out.minLv, parseInt(lvM[1], 10) || 0); return; }
      const coinM = clean.match(/^(?:COINS?|GOLD)\.?\s*(?:>=|:|=)?\s*(\d[\d,]*)$/i) || clean.match(/^(\d[\d,]*)\s*(?:G|GOLD|COINS?)$/i);
      if (coinM) { out.minCoins = Math.max(out.minCoins, parseCoinNumber(coinM[1])); return; }
      const flagM = clean.match(/^FLAG\s*[:=]\s*(.+)$/i);
      if (flagM) { out.reqFlags.push(flagM[1].trim()); return; }
      const itemM = clean.match(/^ITEM\s*[:=]\s*(.+)$/i);
      if (itemM) { out.reqItems.push(itemM[1].trim()); return; }
      if (clean && !/^LOCKED$/i.test(clean)) {
        out.reqFlags.push(clean);
      }
    });
    return out;
  }

  function evaluateUnlockReq(reqInput, rpg) {
    const parsed = parseUnlockReq(reqInput);
    const hasReq = parsed.minLv > 0 || parsed.minCoins > 0 || parsed.reqFlags.length > 0 || parsed.reqItems.length > 0;
    if (!hasReq) return { hasReq: false, unlocked: true, missing: [], summary: '' };
    const st = rpg || getRpgState();
    const missing = [];
    const allLabels = [];
    if (parsed.minLv > 0) {
      allLabels.push(`LV.${parsed.minLv}`);
      if (st.lv < parsed.minLv) missing.push(`LV.${parsed.minLv}`);
    }
    if (parsed.minCoins > 0) {
      allLabels.push(`${formatCoins(parsed.minCoins)} G`);
      if (st.coins < parsed.minCoins) missing.push(`${formatCoins(parsed.minCoins)} G`);
    }
    const flagsLower = new Set((st.flags || []).map(f => String(f).toLowerCase()));
    parsed.reqFlags.forEach(f => {
      allLabels.push(`Flag:${f}`);
      if (!flagsLower.has(f.toLowerCase())) missing.push(f);
    });
    const invNamesLower = new Set((st.inventory || []).filter(it => (Number(it.qty) || 1) > 0).map(it => String(it.name).toLowerCase()));
    parsed.reqItems.forEach(itName => {
      allLabels.push(`Item:${itName}`);
      if (!invNamesLower.has(itName.toLowerCase())) missing.push(`Item: ${itName}`);
    });
    return {
      hasReq: true,
      unlocked: missing.length === 0,
      missing,
      summary: allLabels.join(' • ')
    };
  }

  function normalizeRpgLink(rawLink) {
    const s = (rawLink && typeof rawLink === 'object') ? rawLink : {};
    const pr = (s.passReward && typeof s.passReward === 'object') ? s.passReward : {};
    const fp = (s.failPenalty && typeof s.failPenalty === 'object') ? s.failPenalty : {};
    return {
      enabled: Boolean(s.enabled),
      passBtnIndex: Math.max(0, Number.isFinite(Number(s.passBtnIndex)) ? Math.round(Number(s.passBtnIndex)) : 0),
      failBtnIndex: Math.max(0, Number.isFinite(Number(s.failBtnIndex)) ? Math.round(Number(s.failBtnIndex)) : 1),
      resolvedOutcome: ['pass', 'fail'].includes(s.resolvedOutcome) ? s.resolvedOutcome : '',
      timerExpirePenalty: s.timerExpirePenalty !== false,
      autoHideAfterResolve: s.autoHideAfterResolve !== undefined ? Boolean(s.autoHideAfterResolve) : true,
      autoHideDelaySec: clampNum(s.autoHideDelaySec, 0.3, 10, 1.8),
      passReward: {
        coins: Math.max(0, Math.round(Number(pr.coins) || 0)),
        exp: Math.max(0, Math.round(Number(pr.exp) || 0)),
        hp: Math.round(Number(pr.hp) || 0),
        mp: Math.round(Number(pr.mp) || 0),
        itemName: String(pr.itemName || '').trim(),
        itemIcon: String(pr.itemIcon || '🗡️').trim() || '🗡️',
        itemRarity: normalizeRarity(pr.itemRarity || 'rare'),
        itemQty: Math.max(1, Math.round(Number(pr.itemQty) || 1)),
        flag: String(pr.flag || '').trim(),
        spawnTag: String(pr.spawnTag || '').trim()
      },
      failPenalty: {
        coins: Math.max(0, Math.round(Number(fp.coins) || 0)),
        hp: Math.max(0, Math.round(Number(fp.hp) || 0)),
        mp: Math.max(0, Math.round(Number(fp.mp) || 0)),
        loseItemName: String(fp.loseItemName || '').trim(),
        flag: String(fp.flag || '').trim(),
        spawnTag: String(fp.spawnTag || '').trim()
      }
    };
  }

  function buildBranchPayloadFromSpec(spawnSpec) {
    const raw = String(spawnSpec || '').trim();
    if (!raw) return null;
    let parsed = parseSysWindowLine(raw);
    if (!parsed) {
      const preset = PRESETS.find(p => p.id.toLowerCase() === raw.toLowerCase());
      if (preset) {
        parsed = {
          title: preset.config.headerTitle,
          text: preset.config.bodyText,
          systemConfig: normalizeConfig({ systemConfig: cloneObj(preset.config) }),
          delayMs: estimateSystemWindowHoldMs(preset.config)
        };
      }
    }
    if (!parsed || !parsed.systemConfig) return null;
    return {
      title: parsed.title || parsed.systemConfig.headerTitle,
      text: parsed.text || parsed.systemConfig.bodyText,
      systemConfig: parsed.systemConfig,
      delayMs: parsed.delayMs || estimateSystemWindowHoldMs(parsed.systemConfig)
    };
  }

  function spawnBranchWindowIfConfigured(spawnSpec) {
    if (!api() || typeof api().upsertSystemWindowMessage !== 'function') return false;
    const payload = buildBranchPayloadFromSpec(spawnSpec);
    if (!payload) return false;
    api().upsertSystemWindowMessage(payload);
    return true;
  }

  function applyRpgDelta(outcomeType, rule, opts = {}) {
    const st = getRpgState();
    st.active = true;
    const before = {
      lv: st.lv,
      hp: st.hp,
      maxHp: st.maxHp,
      mp: st.mp,
      maxMp: st.maxMp,
      exp: st.exp,
      nextExp: st.nextExp,
      coins: st.coins
    };
    const notes = [];
    const deltas = [];
    let leveledUp = false;
    let lostItemName = '';
    let gainedItemText = '';
    let gainedFlag = '';

    if (outcomeType === 'pass') {
      const r = rule || {};
      if (r.coins > 0) {
        st.coins += r.coins;
        notes.push(`+${formatCoins(r.coins)} G`);
        deltas.push({ label: 'COINS', deltaText: `${formatCoins(before.coins)} ➔ ${formatCoins(st.coins)} G (+${formatCoins(r.coins)})`, positive: true });
      }
      if (r.exp > 0) {
        st.exp += r.exp;
        notes.push(`+${r.exp} EXP`);
        while (st.exp >= st.nextExp) {
          st.exp -= st.nextExp;
          st.lv += 1;
          st.nextExp = Math.round(st.nextExp * 1.4);
          st.maxHp += 20;
          st.hp = st.maxHp;
          st.maxMp += 10;
          st.mp = st.maxMp;
          if (!st.baseStats) st.baseStats = getDefaultBaseStats();
          st.baseStats.STR = (st.baseStats.STR || 25) + 3;
          st.baseStats.AGI = (st.baseStats.AGI || 25) + 3;
          st.baseStats.INT = (st.baseStats.INT || 20) + 2;
          st.baseStats.VIT = (st.baseStats.VIT || 20) + 2;
          st.baseStats.PER = (st.baseStats.PER || 20) + 2;
          st.baseStats.ATK = (st.baseStats.ATK || 100) + 15;
          st.baseStats.DEF = (st.baseStats.DEF || 50) + 10;
          leveledUp = true;
        }
        if (leveledUp) {
          notes.push(`⚡ LV.${st.lv}!`);
          deltas.push({ label: 'LEVEL', deltaText: `LV.${before.lv} ➔ LV.${st.lv} (+${st.lv - before.lv})`, positive: true });
        } else {
          deltas.push({ label: 'EXP', deltaText: `${before.exp} ➔ ${st.exp} (+${r.exp})`, positive: true });
        }
      }
      if (r.hp && !leveledUp) {
        st.hp = Math.max(0, Math.min(st.maxHp, st.hp + r.hp));
        const hpDiff = st.hp - before.hp;
        notes.push(`${r.hp >= 0 ? '+' : ''}${r.hp} HP`);
        deltas.push({ label: 'HP', deltaText: `${before.hp} ➔ ${st.hp} (${hpDiff >= 0 ? '+' : ''}${hpDiff})`, positive: hpDiff >= 0 });
      } else if (leveledUp && st.hp !== before.hp) {
        const hpDiff = st.hp - before.hp;
        deltas.push({ label: 'HP', deltaText: `${before.hp} ➔ ${st.hp} (${hpDiff >= 0 ? '+' : ''}${hpDiff})`, positive: hpDiff >= 0 });
      }
      if (r.mp && !leveledUp) {
        st.mp = Math.max(0, Math.min(st.maxMp, st.mp + r.mp));
        const mpDiff = st.mp - before.mp;
        notes.push(`${r.mp >= 0 ? '+' : ''}${r.mp} MP`);
        deltas.push({ label: 'MP', deltaText: `${before.mp} ➔ ${st.mp} (${mpDiff >= 0 ? '+' : ''}${mpDiff})`, positive: mpDiff >= 0 });
      } else if (leveledUp && st.mp !== before.mp) {
        const mpDiff = st.mp - before.mp;
        deltas.push({ label: 'MP', deltaText: `${before.mp} ➔ ${st.mp} (${mpDiff >= 0 ? '+' : ''}${mpDiff})`, positive: mpDiff >= 0 });
      }
      if (r.itemName) {
        const existing = st.inventory.find(it => it.name.toLowerCase() === r.itemName.toLowerCase());
        const addQty = Math.max(1, Number(r.itemQty) || 1);
        if (existing) existing.qty += addQty;
        else st.inventory.push({ icon: r.itemIcon || '🗡️', name: r.itemName, rarity: normalizeRarity(r.itemRarity), qty: addQty, equipped: false });
        notes.push(`+${r.itemName}`);
        gainedItemText = `${r.itemIcon || '🎁'} +${addQty} ${r.itemName}`;
        deltas.push({ label: 'ITEM GAINED', deltaText: `+${addQty} ${r.itemName}`, positive: true });
      }
      if (r.flag && !st.flags.some(f => f.toLowerCase() === r.flag.toLowerCase())) {
        st.flags.push(r.flag);
        notes.push(`Flag: ${r.flag}`);
        gainedFlag = r.flag;
      }
    } else {
      const p = rule || {};
      if (p.hp > 0) {
        st.hp = Math.max(0, st.hp - p.hp);
        const lostHp = before.hp - st.hp;
        notes.push(`-${lostHp} HP`);
        deltas.push({ label: 'HP', deltaText: `${before.hp} ➔ ${st.hp} (-${lostHp})`, positive: false });
      }
      if (p.mp > 0) {
        st.mp = Math.max(0, st.mp - p.mp);
        const lostMp = before.mp - st.mp;
        notes.push(`-${lostMp} MP`);
        deltas.push({ label: 'MP', deltaText: `${before.mp} ➔ ${st.mp} (-${lostMp})`, positive: false });
      }
      if (p.coins > 0) {
        st.coins = Math.max(0, st.coins - p.coins);
        const lostCoins = before.coins - st.coins;
        notes.push(`-${formatCoins(lostCoins)} G`);
        deltas.push({ label: 'COINS', deltaText: `${formatCoins(before.coins)} ➔ ${formatCoins(st.coins)} G (-${formatCoins(lostCoins)})`, positive: false });
      }
      if (p.loseItemName) {
        const idx = st.inventory.findIndex(it => it.name.toLowerCase() === p.loseItemName.toLowerCase());
        if (idx >= 0) {
          if (st.inventory[idx].qty > 1) st.inventory[idx].qty -= 1;
          else st.inventory.splice(idx, 1);
          lostItemName = p.loseItemName;
          notes.push(`Lost ${p.loseItemName}`);
          deltas.push({ label: 'LOST ITEM', deltaText: `-1 ${p.loseItemName}`, positive: false });
        }
      }
      if (p.flag && !st.flags.some(f => f.toLowerCase() === p.flag.toLowerCase())) {
        st.flags.push(p.flag);
        notes.push(`Flag: ${p.flag}`);
        gainedFlag = p.flag;
      }
    }

    const isDead = st.hp <= 0;
    const hasSpawn = !opts.skipSpawn && rule && Boolean(String(rule.spawnTag || '').trim());
    let saved = saveRpgState(st, { rerender: !opts.skipRerender && !hasSpawn });
    if (hasSpawn) {
      const spawned = spawnBranchWindowIfConfigured(rule.spawnTag);
      if (!spawned && !opts.skipRerender && api() && typeof api().refreshChatStream === 'function') {
        api().refreshChatStream();
      }
    }
    return { state: saved, before, deltas, leveledUp, isDead, lostItemName, gainedItemText, gainedFlag, summary: notes.join(' • ') };
  }

  function buildOutcomeResultConfig(msg, outcomeType, res, opts = {}) {
    const src = (msg && msg.systemConfig) || {};
    const st = (res && res.state) || getRpgState();
    const b = (res && res.before) || st;
    const deltas = (res && Array.isArray(res.deltas)) ? res.deltas : [];
    const srcTitle = src.subtitle || src.headerTitle || 'System Quest';

    if (outcomeType === 'pass') {
      const themeId = res.leveledUp ? 'cyber_green' : 'hunter_blue';
      const bars = [];
      const hpBeforePct = clampPct((b.hp / b.maxHp) * 100, 100);
      const hpAfterPct = clampPct((st.hp / st.maxHp) * 100, 100);
      if (st.hp !== b.hp || res.leveledUp) {
        bars.push({ label: 'HP', fromValue: hpBeforePct, value: hpAfterPct, displayText: `${b.hp} ➔ ${st.hp} / ${st.maxHp}`, color: '#4ade80', animated: true });
      }
      if (st.mp !== b.mp || res.leveledUp) {
        const mpB = b.maxMp > 0 ? clampPct((b.mp / b.maxMp) * 100, 100) : 0;
        const mpA = st.maxMp > 0 ? clampPct((st.mp / st.maxMp) * 100, 100) : 0;
        bars.push({ label: 'MP', fromValue: mpB, value: mpA, displayText: `${b.mp} ➔ ${st.mp} / ${st.maxMp}`, color: '#38bdf8', animated: true });
      }
      if (st.exp !== b.exp || res.leveledUp) {
        const expB = clampPct((b.exp / Math.max(1, b.nextExp)) * 100, 0);
        const expA = clampPct((st.exp / Math.max(1, st.nextExp)) * 100, 0);
        bars.push({ label: 'EXP', fromValue: res.leveledUp ? 0 : expB, value: expA, displayText: `${st.exp} / ${st.nextExp}`, color: '#facc15', animated: true });
      }
      const statBoosts = deltas.map(d => ({ label: d.label, delta: d.deltaText }));
      if (statBoosts.length === 0) {
        statBoosts.push(
          { label: 'HP', delta: `${st.hp} / ${st.maxHp}` },
          { label: 'COINS', delta: `${formatCoins(st.coins)} G` }
        );
      }
      const unlockNotes = [];
      if (res.gainedItemText) unlockNotes.push(res.gainedItemText);
      if (res.gainedFlag) unlockNotes.push(`🔓 Unlocked Flag: ${res.gainedFlag}`);

      const cfg = normalizeConfig({
        systemConfig: {
          presetId: res.leveledUp ? 'levelup' : 'notification',
          ...themeProps(themeId),
          animation: 'impact',
          sfx: res.leveledUp ? 'sparkle' : 'scifi',
          headerIcon: res.leveledUp ? '⚡' : '✅',
          headerTitle: res.leveledUp ? 'QUEST CLEARED — LEVEL UP!' : 'QUEST CLEARED — RESULT',
          headerBadge: `LV.${st.lv}`,
          currencyText: `🪙 ${formatCoins(st.coins)} G`,
          subtitle: `${srcTitle} • Accepted & Completed`,
          bodyText: unlockNotes.length === 0 ? 'All quest objectives verified. Player status updated!' : '',
          levelTransition: res.leveledUp ? `LV.${b.lv} ➔ LV.${st.lv}` : '',
          unlockedAbility: unlockNotes.join('  •  '),
          statBoosts,
          bars,
          pills: ['Quest Result', ...(res.leveledUp ? ['Max HP/MP Restored!'] : [])],
          buttons: [],
          stampText: 'CLEARED',
          stampColor: '#4ade80',
          footerText: `Player LV.${st.lv} • HP ${st.hp}/${st.maxHp} • ${formatCoins(st.coins)} G`
        }
      });
      return { title: cfg.headerTitle, text: cfg.bodyText || cfg.subtitle, systemConfig: cfg, delayMs: estimateSystemWindowHoldMs(cfg) };
    }

    const isDead = Boolean(res && res.isDead);
    const hpBeforePct = clampPct((b.hp / Math.max(1, b.maxHp)) * 100, 100);
    const hpAfterPct = clampPct((st.hp / Math.max(1, st.maxHp)) * 100, 0);
    const failBars = [
      { label: 'HP', fromValue: hpBeforePct, value: hpAfterPct, displayText: `${b.hp} ➔ ${st.hp} / ${st.maxHp}`, color: '#ef4444', animated: true }
    ];
    if (st.mp !== b.mp && st.maxMp > 0) {
      failBars.push({
        label: 'MP',
        fromValue: clampPct((b.mp / st.maxMp) * 100, 100),
        value: clampPct((st.mp / st.maxMp) * 100, 0),
        displayText: `${b.mp} ➔ ${st.mp} / ${st.maxMp}`,
        color: '#f97316',
        animated: true
      });
    }
    const failBoosts = deltas.map(d => ({ label: d.label, delta: d.deltaText }));
    if (isDead) {
      failBoosts.push({ label: 'STATUS', delta: '💀 DEAD (0 HP)' });
    } else if (failBoosts.length === 0) {
      failBoosts.push(
        { label: 'HP', delta: `${b.hp} ➔ ${st.hp}` },
        { label: 'COINS', delta: `${formatCoins(st.coins)} G` }
      );
    }
    const cfg = normalizeConfig({
      systemConfig: {
        presetId: 'timer',
        ...themeProps('crimson_danger'),
        animation: 'impact',
        sfx: 'sting',
        headerIcon: '💀',
        headerTitle: isDead
          ? 'SYSTEM FATAL PENALTY — YOU ARE DEAD!'
          : (opts.fromTimer ? 'TIME EXPIRED — PENALTY APPLIED' : 'QUEST DECLINED — PENALTY APPLIED'),
        headerBadge: isDead ? '0 HP • DEAD' : 'PENALTY',
        currencyText: `🪙 ${formatCoins(st.coins)} G`,
        subtitle: isDead ? `${srcTitle} • Vitality Dropped to Zero` : `${srcTitle} • Failed / Rejected`,
        bodyText: isDead
          ? 'Critical Failure: Your HP fell to 0! System Vessel has been terminated.'
          : (res.gainedFlag ? `Penalty Flag Recorded: ${res.gainedFlag}` : 'Penalty deducted directly from Player Status.'),
        unlockedAbility: isDead ? `💀 STATUS CRITICAL: 0 / ${st.maxHp} HP — YOU ARE DEAD!` : '',
        statBoosts: failBoosts,
        bars: failBars,
        pills: isDead ? ['0 HP • Vessel Dead', 'Revive Required'] : ['Penalty Applied', `Remaining HP: ${st.hp}/${st.maxHp}`],
        timerEnabled: false,
        buttons: [],
        stampText: isDead ? 'YOU DIED!' : 'PENALTY!',
        stampColor: '#ef4444',
        footerText: `Player LV.${st.lv} • HP ${st.hp}/${st.maxHp} • ${formatCoins(st.coins)} G`
      }
    });
    return { title: cfg.headerTitle, text: cfg.bodyText || cfg.subtitle, systemConfig: cfg, delayMs: estimateSystemWindowHoldMs(cfg) };
  }

  const AUTO_OUTCOME_STAMP_RE = /^(CLEARED|PASS(ED)?|COMPLETED|PENALTY!?|FAIL(ED)?|DECLINED|EXPIRED|YOU\s+DIED!?)$/i;

  function resolveCardOutcome(msg, outcomeType, opts = {}) {
    if (!msg || !msg.systemConfig) return null;
    const link = normalizeRpgLink(msg.systemConfig.rpgLink);
    if (!link.enabled && !opts.force) return null;
    if (link.resolvedOutcome && !opts.force) return { alreadyResolved: true, state: getRpgState() };

    link.resolvedOutcome = outcomeType === 'pass' ? 'pass' : 'fail';
    msg.systemConfig.rpgLink = link;
    const curStamp = String(msg.systemConfig.stampText || '').trim();
    if (!curStamp || AUTO_OUTCOME_STAMP_RE.test(curStamp)) {
      msg.systemConfig.stampText = outcomeType === 'pass' ? 'CLEARED' : 'PENALTY!';
      msg.systemConfig.stampColor = outcomeType === 'pass' ? '#4ade80' : '#ef4444';
    }
    const rule = outcomeType === 'pass' ? link.passReward : link.failPenalty;
    const canAutoReplace = !opts.skipAutoReplace && link.autoHideAfterResolve && Boolean(msg.id) && Boolean(api() && typeof api().replaceSystemWindowMessage === 'function');
    const res = applyRpgDelta(outcomeType, rule, { ...opts, skipSpawn: canAutoReplace ? true : opts.skipSpawn });
    if (outcomeType === 'fail' && res && res.isDead && AUTO_OUTCOME_STAMP_RE.test(String(msg.systemConfig.stampText || ''))) {
      msg.systemConfig.stampText = 'YOU DIED!';
    }
    if (api() && typeof api().triggerSfxByName === 'function') {
      api().triggerSfxByName(outcomeType === 'pass' ? (res.leveledUp ? 'sparkle' : 'scifi') : 'sting', 1.05);
    }
    if (api() && typeof api().showToast === 'function') {
      const icon = outcomeType === 'pass' ? '✅ QUEST PASS' : (res && res.isDead ? '💀 YOU ARE DEAD!' : (opts.fromTimer ? '💀 TIME EXPIRED' : '❌ QUEST FAIL'));
      api().showToast(res.summary ? `${icon}: ${res.summary}` : icon);
    }
    if (canAutoReplace) {
      const resultPayload = (rule && String(rule.spawnTag || '').trim() ? buildBranchPayloadFromSpec(rule.spawnTag) : null)
        || buildOutcomeResultConfig(msg, outcomeType, res, opts);
      const waitMs = Math.max(300, Math.round((Number(link.autoHideDelaySec) || 1.8) * 1000));
      const fadeLead = Math.min(320, Math.floor(waitMs * 0.4));
      const msgKey = String(msg.id);
      setTimeout(() => {
        if (typeof document !== 'undefined' && typeof document.querySelector === 'function') {
          const cardEl = document.querySelector(`.manhwa-sys-win[data-msw-msg-id="${typeof CSS !== 'undefined' && CSS.escape ? CSS.escape(msgKey) : msgKey}"]`);
          if (cardEl && cardEl.classList) cardEl.classList.add('msw-outcome-fadeout');
        }
      }, Math.max(0, waitMs - fadeLead));
      setTimeout(() => {
        if (api() && typeof api().replaceSystemWindowMessage === 'function') {
          api().replaceSystemWindowMessage(msgKey, resultPayload);
          if (typeof api().triggerSfxByName === 'function') {
            api().triggerSfxByName(outcomeType === 'pass' ? (res.leveledUp ? 'sparkle' : 'scifi') : 'sting', 1.0);
          }
        }
      }, waitMs);
    }
    return res;
  }

  function getEmptyBaseConfig() {
    return {
      presetId: 'notification',
      ...themeProps('hunter_blue'),
      cardStyle: 'standard',
      canvasHeight: 380,
      layers: [],
      syncWithStoryRpg: false,
      unlockReq: '',
      rpgLink: normalizeRpgLink(null),
      hideHeader: false,
      starburst: false,
      transparentBg: false,
      iconSeamless: false,
      iconBlendDark: false,
      svgIcon: '',
      customIconData: '',
      customFrameSvg: '',
      cardBgImage: '',
      cardBgOpacity: 1,
      cardBgBlur: 0,
      cardBgBrightness: 1,
      cardBgTint: '#041226',
      cardBgTintOpacity: 0.35,
      elementStyles: normalizeElementStyles(null),
      animation: 'hologram',
      sfx: 'scifi',
      headerIcon: '',
      headerTitle: 'SYSTEM WINDOW',
      headerBadge: '',
      currencyText: '',
      subtitle: '',
      mediaUrl: '',
      mediaLayout: 'none',
      mediaCaption: '',
      bodyText: '',
      levelTransition: '',
      unlockedAbility: '',
      statBoosts: [],
      inventoryItems: [],
      shopItems: [],
      bars: [],
      statsCols: 2,
      statusLayout: 'sheet',
      shopLayout: 'rows',
      stats: [],
      pills: [],
      timerEnabled: false,
      timerSeconds: 0,
      timerLabel: 'TIME LEFT',
      buttons: [],
      stampText: '',
      stampColor: '#facc15',
      footerText: ''
    };
  }

  function normalizeRarity(r) {
    const k = String(r || 'common').trim().toLowerCase();
    if (['mythic', 'sss', 'ur', 'red'].includes(k)) return 'mythic';
    if (['legendary', 'ssr', 's', 's-rank', 'gold'].includes(k)) return 'legendary';
    if (['epic', 'a', 'a-rank', 'purple'].includes(k)) return 'epic';
    if (['rare', 'b', 'b-rank', 'blue'].includes(k)) return 'rare';
    return 'common';
  }

  function normalizeConfig(msgOrCfg) {
    const raw = (msgOrCfg && msgOrCfg.systemConfig) ? msgOrCfg.systemConfig : (msgOrCfg || {});
    const base = getEmptyBaseConfig();
    const merged = { ...base, ...raw };
    delete merged.id;
    delete merged.label;

    if (!merged.headerTitle && msgOrCfg && msgOrCfg.title) merged.headerTitle = msgOrCfg.title;
    if (!merged.bodyText && raw.bodyText === undefined && msgOrCfg && msgOrCfg.text && !msgOrCfg.systemConfig) {
      merged.bodyText = msgOrCfg.text;
    }
    merged.cardStyle = ['relic', 'codex', 'canvas'].includes(merged.cardStyle) ? merged.cardStyle : 'standard';
    merged.canvasHeight = clampNum(merged.canvasHeight, 180, 680, 380);
    merged.layers = Array.isArray(merged.layers) ? merged.layers.map((l, i) => normalizeCanvasLayer(l, i)) : [];
    const allSvg = getAllSvgIcons();
    merged.customIconData = merged.customIconData ? (sanitizeCustomSvg(merged.customIconData) || (isSafeUrl(merged.customIconData) ? String(merged.customIconData).trim() : '')) : '';
    merged.svgIcon = (merged.svgIcon && (allSvg[merged.svgIcon] || merged.customIconData)) ? merged.svgIcon : '';
    if (merged.svgIcon && allSvg[merged.svgIcon] && allSvg[merged.svgIcon].isCustom && !merged.customIconData) {
      merged.customIconData = allSvg[merged.svgIcon].rawSvg || allSvg[merged.svgIcon].imageUrl || '';
    }
    delete merged.customFrameUrl;
    merged.transparentBg = false;
    merged.customFrameSvg = merged.customFrameSvg ? sanitizeCustomSvg(merged.customFrameSvg) : '';
    if (merged.frameStyle && !merged.customFrameSvg) {
      const cf = loadCustomFrames().find(f => String(f.id) === String(merged.frameStyle));
      if (cf && cf.svg) merged.customFrameSvg = sanitizeCustomSvg(cf.svg);
    }
    merged.iconSeamless = Boolean(merged.iconSeamless);
    merged.iconBlendDark = Boolean(merged.iconBlendDark);
    merged.hideHeader = Boolean(merged.hideHeader);
    merged.starburst = Boolean(merged.starburst);
    merged.cardBgImage = isSafeUrl(merged.cardBgImage) ? String(merged.cardBgImage).trim() : '';
    merged.cardBgOpacity = Math.max(0.1, Math.min(1, Number.isFinite(Number(merged.cardBgOpacity)) ? Number(merged.cardBgOpacity) : 1));
    merged.cardBgBlur = Math.max(0, Math.min(24, Number(merged.cardBgBlur) || 0));
    merged.cardBgBrightness = Math.max(0.2, Math.min(1.6, Number.isFinite(Number(merged.cardBgBrightness)) ? Number(merged.cardBgBrightness) : 1));
    merged.cardBgTint = sanitizeCssColor(merged.cardBgTint) || '#041226';
    merged.cardBgTintOpacity = Math.max(0, Math.min(0.95, Number.isFinite(Number(merged.cardBgTintOpacity)) ? Number(merged.cardBgTintOpacity) : 0.35));
    merged.elementStyles = normalizeElementStyles(merged.elementStyles);
    merged.syncWithStoryRpg = Boolean(merged.syncWithStoryRpg);
    merged.unlockReq = String(merged.unlockReq || '').trim();
    merged.rpgLink = normalizeRpgLink(merged.rpgLink);
    merged.bars = Array.isArray(merged.bars) ? merged.bars.map(b => ({
      label: String(b.label || 'STAT'),
      value: clampPct(b.value, 100),
      fromValue: b.fromValue !== undefined ? clampPct(b.fromValue, clampPct(b.value, 100)) : clampPct(b.value, 100),
      displayText: String(b.displayText ?? ''),
      color: String(b.color || merged.accentColor || '#00f0ff'),
      animated: b.animated !== false
    })) : [];
    merged.stats = Array.isArray(merged.stats) ? merged.stats.map(s => ({
      label: String(s.label || 'STAT'),
      value: String(s.value ?? '')
    })) : [];
    merged.statBoosts = Array.isArray(merged.statBoosts) ? merged.statBoosts.map(sb => ({
      label: String(sb.label || 'STR'),
      delta: String(sb.delta || '+10')
    })) : [];
    merged.statsCols = [1, 2, 3].includes(Number(merged.statsCols)) ? Number(merged.statsCols) : 2;
    merged.statusLayout = merged.statusLayout === 'compact' ? 'compact' : 'sheet';
    merged.shopLayout = merged.shopLayout === 'grid' ? 'grid' : 'rows';
    merged.inventoryItems = Array.isArray(merged.inventoryItems) ? merged.inventoryItems.map(it => ({
      icon: String(it.icon || '📦'),
      iconImage: isExplicitItemImageUrl(it.iconImage) ? String(it.iconImage).trim() : '',
      name: String(it.name || 'Item'),
      rarity: normalizeRarity(it.rarity),
      qty: String(it.qty ?? '1'),
      meta: String(it.meta || ''),
      equipped: Boolean(it.equipped),
      locked: Boolean(it.locked),
      unlockReq: String(it.unlockReq || '').trim()
    })) : [];
    merged.shopItems = Array.isArray(merged.shopItems) ? merged.shopItems.map(sp => ({
      icon: String(sp.icon || '🛒'),
      iconImage: isExplicitItemImageUrl(sp.iconImage) ? String(sp.iconImage).trim() : '',
      name: String(sp.name || 'Shop Item'),
      rarity: normalizeRarity(sp.rarity),
      meta: String(sp.meta || ''),
      price: String(sp.price || '1,000 G'),
      locked: Boolean(sp.locked),
      owned: Boolean(sp.owned),
      unlockReq: String(sp.unlockReq || '').trim()
    })) : [];
    merged.pills = Array.isArray(merged.pills) ? merged.pills.map(p => String(p).trim()).filter(Boolean) : [];
    merged.buttons = Array.isArray(merged.buttons) ? merged.buttons.map(btn => ({
      label: String(btn.label || 'OK'),
      style: 'neutral'
    })) : [];
    return merged;
  }

  /* --------------------------------------------------------------------------
     PERSONAL USER PRESETS STORAGE
     -------------------------------------------------------------------------- */
  function loadPersonalPresets() {
    try {
      let raw = null;
      if (window.ChatHubStorage && typeof window.ChatHubStorage.get === 'function') {
        raw = window.ChatHubStorage.get(PRESETS_STORAGE_KEY);
      } else {
        raw = localStorage.getItem(PRESETS_STORAGE_KEY);
      }
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }

  function savePersonalPresets(list) {
    try {
      const json = JSON.stringify(list || []);
      if (window.ChatHubStorage && typeof window.ChatHubStorage.set === 'function') {
        window.ChatHubStorage.set(PRESETS_STORAGE_KEY, json);
      } else {
        localStorage.setItem(PRESETS_STORAGE_KEY, json);
      }
    } catch (e) {}
  }

  /* --------------------------------------------------------------------------
     LIVE CHAT WINDOW RENDERER
     -------------------------------------------------------------------------- */
  function animateBarsInElement(rootEl) {
    if (!rootEl) return;
    const fills = rootEl.querySelectorAll('.msw-bar-fill[data-target-pct]');
    fills.forEach(fill => {
      const fromPct = clampPct(fill.getAttribute('data-from-pct'), 0);
      const targetPct = clampPct(fill.getAttribute('data-target-pct'), 100);
      fill.style.width = fromPct + '%';
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          fill.style.width = targetPct + '%';
        });
      });
    });
  }

  function applyTimerVisualState(rootEl, remaining, total) {
    if (!rootEl) return;
    const pct = total > 0 ? Math.max(0, Math.min(100, (remaining / total) * 100)) : 0;
    const barFill = rootEl.querySelector('.msw-timer-bar-fill');
    const clockEl = rootEl.querySelector('.msw-timer-clock');
    if (barFill) barFill.style.width = pct.toFixed(1) + '%';
    if (clockEl) clockEl.textContent = formatTimerSeconds(remaining);

    if (remaining <= 0) {
      rootEl.classList.remove('is-timer-urgent');
      rootEl.classList.add('is-timer-expired');
      const lbl = rootEl.querySelector('.msw-timer-lbl');
      if (lbl && !lbl.dataset.expiredUpdated) {
        lbl.dataset.expiredUpdated = '1';
        lbl.textContent = '💀 PENALTY TRIGGERED!';
      }
      if (!rootEl.querySelector('.msw-stamp')) {
        const st = document.createElement('div');
        st.className = 'msw-stamp';
        st.style.setProperty('--stamp-color', '#ef4444');
        st.textContent = 'PENALTY!';
        rootEl.appendChild(st);
      }
    } else if (remaining <= 10) {
      rootEl.classList.add('is-timer-urgent');
    } else {
      rootEl.classList.remove('is-timer-urgent', 'is-timer-expired');
    }
  }

  function renderCanvasLayerInnerHtml(layer, cfg) {
    const t = layer.type;
    if (t === 'background') {
      const grad = `linear-gradient(155deg, ${esc(layer.color || '#041226')} 0%, ${esc(layer.color2 || layer.color || '#0f172a')} 100%)`;
      const imgHtml = isSafeUrl(layer.imageUrl)
        ? `<img class="msw-card-bg-img" src="${esc(layer.imageUrl)}" alt="" style="filter:blur(${layer.blur}px) brightness(${layer.brightness});">`
        : '';
      const tintHtml = `<div class="msw-card-bg-tint" style="background:${hexToRgba(layer.tintColor || '#041226', layer.tintOpacity ?? 0.35, 0)};"></div>`;
      return `<div class="msw-canvas-bg-box" style="background:${grad};">${imgHtml}${tintHtml}</div>`;
    }
    if (t === 'border') {
      const acc = esc(layer.color || cfg.accentColor || '#00f0ff');
      const sec = esc(layer.secondaryColor || layer.color || cfg.secondaryColor || '#38bdf8');
      const svg = getFrameSvgOverlay(layer.frameStyle, layer.customFrameSvg);
      const glow = layer.glowBlur > 0 ? `filter:drop-shadow(0 0 ${layer.glowBlur}px ${acc});` : '';
      if (svg) {
        return `<div class="msw-canvas-border-box" style="--sys-accent:${acc}; --sys-accent-2:${sec}; ${glow}">${svg}</div>`;
      }
      if (layer.frameStyle === 'none') return `<div class="msw-canvas-border-box"></div>`;
      return `<div class="msw-canvas-border-box" style="--sys-accent:${acc}; --sys-accent-2:${sec}; ${glow}"><div class="msw-canvas-border-css style-${esc(layer.frameStyle || 'tech_brackets')}"></div></div>`;
    }
    if (t === 'sparkles') {
      const acc = esc(layer.color || cfg.accentColor || '#fde047');
      const sec = esc(layer.secondaryColor || layer.color || cfg.secondaryColor || '#ef4444');
      if (layer.pattern === 'starburst') {
        return `<div class="msw-canvas-fx-box" style="background:radial-gradient(circle at 50% 42%, color-mix(in srgb, ${sec} 36%, transparent) 0%, transparent 65%), repeating-conic-gradient(from 0deg at 50% 42%, color-mix(in srgb, ${sec} 22%, transparent) 0deg 2deg, color-mix(in srgb, ${acc} 12%, transparent) 2deg 3.5deg, transparent 3.5deg 9deg);"></div>`;
      }
      if (layer.pattern === 'scanlines') {
        return `<div class="msw-canvas-fx-box" style="background:repeating-linear-gradient(to bottom, rgba(255,255,255,0.06) 0px, rgba(255,255,255,0.06) 1px, transparent 1px, transparent 4px);"></div>`;
      }
      if (layer.pattern === 'grid') {
        return `<div class="msw-canvas-fx-box" style="background-image:linear-gradient(color-mix(in srgb, ${acc} 16%, transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in srgb, ${acc} 16%, transparent) 1px, transparent 1px); background-size:18px 18px;"></div>`;
      }
      return `<div class="msw-canvas-fx-box" style="color:${acc}; text-shadow:0 0 8px ${sec};">
        <span style="position:absolute; top:12%; left:14%; font-size:14px;">✦</span>
        <span style="position:absolute; top:18%; right:15%; font-size:11px;">✧</span>
        <span style="position:absolute; top:45%; left:10%; font-size:10px;">✦</span>
        <span style="position:absolute; top:42%; right:11%; font-size:13px;">✦</span>
        <span style="position:absolute; bottom:18%; left:18%; font-size:14px;">✧</span>
        <span style="position:absolute; bottom:14%; right:18%; font-size:15px;">✦</span>
      </div>`;
    }
    if (t === 'icon') {
      const svgObj = layer.emoji ? null : getSvgIconEntry(layer.svgIcon, layer.customIconData);
      const acc = esc(layer.color || cfg.accentColor || '#00f0ff');
      const gc = esc(layer.glowColor || acc);
      const filt = layer.glowBlur > 0 ? `filter:drop-shadow(0 0 ${layer.glowBlur}px ${gc});` : '';
      const blend = layer.blendDark ? 'mix-blend-mode:screen;' : '';
      const content = layer.emoji
        ? `<span style="font-size:48px; line-height:1;">${esc(layer.emoji)}</span>`
        : (svgObj ? svgObj.svg : '<span style="font-size:40px;">✨</span>');
      return `<div class="msw-canvas-icon-box" style="color:${acc}; --sys-accent:${acc}; ${filt} ${blend}">${content}</div>`;
    }
    if (t === 'image') {
      if (!isSafeUrl(layer.imageUrl)) return `<div class="msw-canvas-image-box" style="border:1px dashed #334155; color:#64748b; font-size:11px;">No Image</div>`;
      const filt = layer.glowBlur > 0 ? `filter:drop-shadow(0 0 ${layer.glowBlur}px ${esc(layer.glowColor || '#00f0ff')});` : '';
      const blend = layer.blendDark ? 'mix-blend-mode:screen;' : '';
      return `<div class="msw-canvas-image-box" style="border-radius:${layer.rounded || 0}px; ${filt}"><img src="${esc(layer.imageUrl)}" alt="" style="object-fit:${layer.fit === 'cover' ? 'cover' : 'contain'}; border-radius:${layer.rounded || 0}px; ${blend}"></div>`;
    }
    const ff = resolveFontFamilyCss(layer.fontFamily) || PRESET_FONT_STACKS.hud;
    const justify = layer.textAlign === 'left' ? 'flex-start' : (layer.textAlign === 'right' ? 'flex-end' : 'center');
    const shadow = (layer.glowBlur > 0 || layer.glowColor) ? `text-shadow:0 0 ${layer.glowBlur || 8}px ${esc(layer.glowColor || layer.color || '#00f0ff')};` : '';
    const stroke = layer.strokeWidth > 0 ? `-webkit-text-stroke:${layer.strokeWidth}px ${esc(layer.strokeColor || '#020617')}; paint-order:stroke fill;` : '';
    const bgCss = layer.bgOpacity > 0 ? `background:${hexToRgba(layer.bgColor || '#020617', layer.bgOpacity, 0)}; border-radius:${layer.borderRadius || 0}px;` : '';
    return `<div class="msw-canvas-text-box" style="justify-content:${justify}; text-align:${esc(layer.textAlign || 'center')}; font-family:${ff}; font-size:${layer.fontSize || 18}px; font-weight:${esc(layer.fontWeight || '900')}; letter-spacing:${layer.letterSpacing || 0}px; color:${esc(layer.color || '#f8fafc')}; ${shadow} ${stroke} ${bgCss}"><span style="width:100%;">${esc(layer.text || '')}</span></div>`;
  }

  function renderCanvasModeElement(el, cfg, msg, opts) {
    const previewMode = !!opts.previewMode;
    el.className = [
      'manhwa-sys-win',
      'quest-card',
      'card-canvas',
      'glow-' + (cfg.glowIntensity || 'high'),
      'anim-' + (cfg.animation || 'hologram')
    ].join(' ');
    el.style.setProperty('--sys-accent', cfg.accentColor || '#00f0ff');
    el.style.setProperty('--sys-accent-2', cfg.secondaryColor || cfg.accentColor || '#38bdf8');
    el.style.setProperty('--sys-bg', hexToRgba(cfg.bgColor || '#041226', cfg.bgOpacity ?? 0.94));
    el.style.height = (cfg.canvasHeight || 380) + 'px';
    el.title = previewMode ? 'Drag, resize or rotate layers directly' : 'Click to edit Free Layer Canvas';

    const layers = Array.isArray(cfg.layers) ? cfg.layers : [];
    const activeLayer = layers.find(l => l.id === builderSelectedLayerId) || layers.find(l => l.visible && !l.locked) || layers[layers.length - 1] || null;
    if (previewMode && activeLayer && builderSelectedLayerId !== activeLayer.id) {
      builderSelectedLayerId = activeLayer.id;
    }

    const layersHtml = layers.map((l, idx) => {
      if (!l.visible) return '';
      const isSel = previewMode && activeLayer && activeLayer.id === l.id;
      const handlesHtml = (isSel && !l.locked) ? `
        <div class="msw-canvas-rot-handle" data-handle="rot" title="Drag to rotate">↻</div>
        <div class="msw-canvas-handle nw" data-handle="nw"></div>
        <div class="msw-canvas-handle ne" data-handle="ne"></div>
        <div class="msw-canvas-handle sw" data-handle="sw"></div>
        <div class="msw-canvas-handle se" data-handle="se"></div>
      ` : '';
      return `
        <div class="msw-canvas-layer type-${esc(l.type)} ${previewMode ? 'is-preview-layer' : ''} ${l.locked ? 'is-locked' : ''} ${isSel ? 'is-selected' : ''}"
             data-layer-id="${esc(l.id)}"
             style="left:${l.x}%; top:${l.y}%; width:${l.w}%; height:${l.h}%; z-index:${idx + 1}; opacity:${l.opacity}; transform:rotate(${l.rotation}deg);">
          ${renderCanvasLayerInnerHtml(l, cfg)}
          ${handlesHtml}
        </div>
      `;
    }).join('');

    const cardLock = evaluateUnlockReq(cfg.unlockReq, getRpgState());
    const lockOverlayHtml = cardLock.hasReq ? `
      <div class="${cardLock.unlocked ? 'msw-rpg-unlock-banner' : 'msw-rpg-lock-banner'}" style="position:absolute; left:10px; right:10px; bottom:10px; z-index:999; pointer-events:none;">
        <span>${cardLock.unlocked ? '🔓 UNLOCKED' : '🔒 LOCKED'}</span>
        <span>${esc(cardLock.unlocked ? cardLock.summary : 'Need: ' + cardLock.missing.join(' • '))}</span>
      </div>
    ` : '';

    el.innerHTML = `<div class="msw-canvas-stage">${layersHtml}${lockOverlayHtml}</div>`;

    if (previewMode && typeof el.querySelector === 'function') {
      const stage = el.querySelector('.msw-canvas-stage');
      if (stage && typeof stage.addEventListener === 'function') {
        stage.addEventListener('pointerdown', (e) => {
          const targetEl = e.target && e.target.closest ? e.target : null;
          if (!targetEl || !builderDraft || !Array.isArray(builderDraft.layers)) return;
          const handleEl = targetEl.closest('[data-handle]');
          const layerEl = targetEl.closest('[data-layer-id]');
          if (!layerEl) return;
          const lid = layerEl.dataset.layerId;
          const layerObj = builderDraft.layers.find(x => x.id === lid);
          if (!layerObj) return;

          e.preventDefault();
          e.stopPropagation();
          const prevSel = builderSelectedLayerId;
          builderSelectedLayerId = lid;

          if (layerObj.locked) {
            if (prevSel !== lid) {
              renderCanvasLayersEditor();
              refreshPreviewOnly();
            }
            return;
          }

          const stageRect = stage.getBoundingClientRect();
          if (!stageRect.width || !stageRect.height) return;
          const mode = handleEl ? handleEl.dataset.handle : 'move';
          const startX = e.clientX;
          const startY = e.clientY;
          const orig = { x: layerObj.x, y: layerObj.y, w: layerObj.w, h: layerObj.h, rot: layerObj.rotation || 0 };
          const layerRect = layerEl.getBoundingClientRect();
          const cx = layerRect.left + layerRect.width / 2;
          const cy = layerRect.top + layerRect.height / 2;
          let moved = false;

          const onMove = (ev) => {
            moved = true;
            const dxPct = ((ev.clientX - startX) / stageRect.width) * 100;
            const dyPct = ((ev.clientY - startY) / stageRect.height) * 100;
            if (mode === 'move') {
              layerObj.x = Math.round(clampNum(orig.x + dxPct, -50, 100, orig.x) * 10) / 10;
              layerObj.y = Math.round(clampNum(orig.y + dyPct, -50, 100, orig.y) * 10) / 10;
            } else if (mode === 'rot') {
              const deg = Math.round((Math.atan2(ev.clientY - cy, ev.clientX - cx) * 180) / Math.PI + 90);
              const normDeg = ((deg + 180) % 360 + 360) % 360 - 180;
              layerObj.rotation = normDeg;
            } else {
              let nx = orig.x, ny = orig.y, nw = orig.w, nh = orig.h;
              if (mode.includes('e')) nw = clampNum(orig.w + dxPct, 4, 150, orig.w);
              if (mode.includes('s')) nh = clampNum(orig.h + dyPct, 4, 150, orig.h);
              if (mode.includes('w')) {
                const maxShift = orig.w - 4;
                const shift = Math.min(maxShift, dxPct);
                nx = clampNum(orig.x + shift, -50, 100, orig.x);
                nw = clampNum(orig.w - shift, 4, 150, orig.w);
              }
              if (mode.includes('n')) {
                const maxShift = orig.h - 4;
                const shift = Math.min(maxShift, dyPct);
                ny = clampNum(orig.y + shift, -50, 100, orig.y);
                nh = clampNum(orig.h - shift, 4, 150, orig.h);
              }
              layerObj.x = Math.round(nx * 10) / 10;
              layerObj.y = Math.round(ny * 10) / 10;
              layerObj.w = Math.round(nw * 10) / 10;
              layerObj.h = Math.round(nh * 10) / 10;
            }
            layerEl.style.left = layerObj.x + '%';
            layerEl.style.top = layerObj.y + '%';
            layerEl.style.width = layerObj.w + '%';
            layerEl.style.height = layerObj.h + '%';
            layerEl.style.transform = `rotate(${layerObj.rotation}deg)`;

            const syncInp = (id, v) => { const inp = document.getElementById(id); if (inp) inp.value = v; };
            syncInp('sysLayInpX', layerObj.x);
            syncInp('sysLayInpY', layerObj.y);
            syncInp('sysLayInpW', layerObj.w);
            syncInp('sysLayInpH', layerObj.h);
            syncInp('sysLayInpRot', layerObj.rotation);
          };

          const onUp = () => {
            window.removeEventListener('pointermove', onMove);
            window.removeEventListener('pointerup', onUp);
            if (prevSel !== lid || moved) {
              renderCanvasLayersEditor();
              refreshPreviewOnly();
            }
          };
          window.addEventListener('pointermove', onMove);
          window.addEventListener('pointerup', onUp);
        });
      }
    } else if (!previewMode) {
      el.addEventListener('click', () => {
        if (typeof opts.onEditClick === 'function') {
          opts.onEditClick(msg);
        } else {
          openSystemWindowBuilder(msg.id);
        }
      });
    }
    return el;
  }

  function renderSystemWindowElement(msg, opts = {}) {
    injectCustomFontFaces();
    const cfg = normalizeConfig(msg);
    const previewMode = !!opts.previewMode;
    const rpg = getRpgState();

    let syncedGear = null;
    if (cfg.syncWithStoryRpg) {
      cfg.currencyText = `🪙 ${formatCoins(rpg.coins)} G`;
      cfg.headerBadge = `LV.${rpg.lv}`;
      if (Array.isArray(cfg.bars)) {
        cfg.bars = cfg.bars.map(b => {
          const lbl = String(b.label || '').toUpperCase();
          if (lbl === 'HP') {
            const pct = clampPct((rpg.hp / rpg.maxHp) * 100, 100);
            return { ...b, value: pct, fromValue: pct, displayText: `${rpg.hp} / ${rpg.maxHp}` };
          }
          if (lbl === 'MP') {
            const pct = rpg.maxMp > 0 ? clampPct((rpg.mp / rpg.maxMp) * 100, 100) : 0;
            return { ...b, value: pct, fromValue: pct, displayText: `${rpg.mp} / ${rpg.maxMp}` };
          }
          if (lbl === 'EXP') {
            const pct = clampPct((rpg.exp / rpg.nextExp) * 100, 0);
            return { ...b, value: pct, fromValue: pct, displayText: `${rpg.exp} / ${rpg.nextExp}` };
          }
          return b;
        });
      }
      if (cfg.presetId === 'status') {
        const gear = computeEquippedGearStats(rpg);
        syncedGear = gear;
        const existingStats = Array.isArray(cfg.stats) && cfg.stats.length > 0
          ? cloneObj(cfg.stats)
          : Object.entries(rpg.baseStats || getDefaultBaseStats()).map(([label, val]) => ({ label, value: String(val) }));
        const seenKeys = new Set();
        const mergedStats = existingStats.map(s => {
          const lbl = String(s.label || '').toUpperCase();
          seenKeys.add(lbl);
          const gb = gear.bonusMap[lbl];
          if (gb && gb.amount > 0 && /^\s*[+\-]?\d+\s*%?\s*$/.test(String(s.value || ''))) {
            const baseNum = parseInt(String(s.value).replace(/[^\d\-]/g, ''), 10) || 0;
            const totalNum = baseNum + gb.amount;
            return {
              ...s,
              value: `${baseNum} (+${gb.amount}${gb.suffix}) = ${totalNum}${gb.suffix}`,
              baseVal: String(baseNum),
              bonusText: `+${gb.amount}${gb.suffix}`,
              totalVal: `${totalNum}${gb.suffix}`,
              isBoosted: true
            };
          }
          return s;
        });
        gear.bonusList.forEach(gb => {
          if (seenKeys.has(gb.stat)) return;
          const baseNum = (rpg.baseStats && Number.isFinite(Number(rpg.baseStats[gb.stat])))
            ? Number(rpg.baseStats[gb.stat])
            : 0;
          const totalNum = baseNum + gb.amount;
          mergedStats.push({
            label: gb.stat,
            value: `${baseNum} (+${gb.amount}${gb.suffix}) = ${totalNum}${gb.suffix}`,
            baseVal: `${baseNum}${gb.suffix}`,
            bonusText: `+${gb.amount}${gb.suffix}`,
            totalVal: `${totalNum}${gb.suffix}`,
            isBoosted: true
          });
        });
        cfg.stats = mergedStats;
        cfg.pills = Array.isArray(cfg.pills)
          ? cfg.pills.filter(p => !/^⚔️?\s*Equipped:/i.test(String(p)))
          : [];
      }
      if (cfg.presetId === 'inventory' && rpg.inventory.length > 0) {
        cfg.inventoryItems = rpg.inventory.map(it => ({
          icon: it.icon || '📦',
          iconImage: isExplicitItemImageUrl(it.iconImage) ? String(it.iconImage).trim() : '',
          name: it.name,
          rarity: normalizeRarity(it.rarity),
          qty: String(it.qty || 1),
          equipped: Boolean(it.equipped),
          meta: it.meta || '',
          bonuses: it.bonuses || [],
          consumable: it.consumable || null,
          locked: Boolean(it.locked),
          unlockReq: it.unlockReq || ''
        }));
        cfg.headerBadge = `${cfg.inventoryItems.length}/20 SLOTS`;
      }
    } else if (rpg.active && (cfg.presetId === 'shop' || cfg.shopItems.some(sp => sp.unlockReq))) {
      cfg.currencyText = `🪙 ${formatCoins(rpg.coins)} G`;
    }

    const syncedFromRpgInv = Boolean(cfg.syncWithStoryRpg && cfg.presetId === 'inventory' && rpg.inventory.length > 0);
    const cardLockEval = evaluateUnlockReq(cfg.unlockReq, rpg);
    const el = document.createElement('div');
    if (msg && msg.id && !previewMode && el.dataset) {
      el.dataset.mswMsgId = String(msg.id);
    }
    if (cfg.cardStyle === 'canvas') {
      return renderCanvasModeElement(el, cfg, msg, opts);
    }

    const classes = [
      'manhwa-sys-win',
      'quest-card',
      'frame-' + (cfg.frameStyle || 'tech_brackets'),
      'font-' + (cfg.fontStyle || 'hud'),
      'glow-' + (cfg.glowIntensity || 'high'),
      'anim-' + (cfg.animation || 'hologram')
    ];
    if (cfg.cardStyle && cfg.cardStyle !== 'standard') classes.push('is-card-centered', 'card-' + cfg.cardStyle);
    if (cfg.customFrameSvg || String(cfg.frameStyle || '').startsWith('cframe_')) classes.push('has-custom-vector-frame');
    if (cfg.cardBgImage) classes.push('has-card-bg-image');
    if (cfg.iconSeamless) classes.push('is-icon-seamless');
    if (cfg.iconBlendDark) classes.push('is-icon-blend-dark');
    if (cfg.hideHeader) classes.push('has-hidden-header');
    if (cfg.scanlines) classes.push('has-scanlines');
    if (cfg.gridPattern) classes.push('has-grid');
    if (cfg.starburst) classes.push('has-starburst');
    if (cfg.sparkles) classes.push('has-sparkles');
    if (cfg.timerEnabled && Number(cfg.timerSeconds) > 0 && Number(cfg.timerSeconds) <= 10) {
      classes.push('is-timer-urgent');
    }
    el.className = classes.join(' ');

    el.style.setProperty('--sys-accent', cfg.accentColor || '#00f0ff');
    el.style.setProperty('--sys-accent-2', cfg.secondaryColor || cfg.accentColor || '#38bdf8');
    el.style.setProperty('--sys-bg', hexToRgba(cfg.bgColor || '#041226', cfg.bgOpacity ?? 0.94));
    el.title = previewMode ? 'Live System Window Preview' : 'Click to customize System Window';

    const elStyles = cfg.elementStyles || {};
    const titleCss = buildTextElementStyle(elStyles.title, cfg.accentColor);
    const subtitleCss = buildTextElementStyle(elStyles.subtitle, cfg.accentColor);
    const bodyCss = buildTextElementStyle(elStyles.body, cfg.accentColor);
    const iconCss = buildIconElementStyle(elStyles.icons, cfg.accentColor, 'text');
    const iconSlotCss = buildIconElementStyle(elStyles.icons, cfg.accentColor, 'slot');
    const iconBoxCss = buildIconElementStyle(elStyles.icons, cfg.accentColor, 'relic');
    const iconCodexCss = buildIconElementStyle(elStyles.icons, cfg.accentColor, 'codex');
    const titleStyleAttr = titleCss ? ` style="${titleCss}"` : '';
    const subtitleStyleAttr = subtitleCss ? ` style="${subtitleCss}"` : '';
    const bodyStyleAttr = bodyCss ? ` style="${bodyCss}"` : '';
    const iconStyleAttr = iconCss ? ` style="${iconCss}"` : '';
    const iconSlotStyleAttr = iconSlotCss ? ` style="${iconSlotCss}"` : '';
    const iconBoxStyleAttr = iconBoxCss ? ` style="${iconBoxCss}"` : '';
    const iconCodexStyleAttr = iconCodexCss ? ` style="${iconCodexCss}"` : '';

    const cardBgHtml = cfg.cardBgImage ? `
      <div class="msw-card-bg-layer" aria-hidden="true">
        <img class="msw-card-bg-img" src="${esc(cfg.cardBgImage)}" alt="" style="opacity:${cfg.cardBgOpacity}; filter:blur(${cfg.cardBgBlur}px) brightness(${cfg.cardBgBrightness});">
        <div class="msw-card-bg-tint" style="background:${hexToRgba(cfg.cardBgTint || '#041226', cfg.cardBgTintOpacity, 0)};"></div>
      </div>
    ` : '';

    const svgObj = getSvgIconEntry(cfg.svgIcon, cfg.customIconData);
    const hasImgMedia = isSafeUrl(cfg.mediaUrl);
    const hasMedia = (cfg.mediaLayout && cfg.mediaLayout !== 'none' && hasImgMedia) || (cfg.cardStyle === 'standard' && svgObj && !hasImgMedia && cfg.mediaLayout !== 'none');
    const artworkHtml = hasImgMedia
      ? `<img class="msw-media-img" src="${esc(cfg.mediaUrl)}" alt="System Visual">`
      : (svgObj ? svgObj.svg : '');
    const mediaHtml = hasMedia ? `
      <div class="msw-media-wrap layout-${esc(cfg.mediaLayout || 'icon_title')}">
        ${hasImgMedia ? `<img class="msw-media-img" src="${esc(cfg.mediaUrl)}" alt="System Visual">` : `<div class="msw-svg-icon-slot"${iconSlotStyleAttr}>${svgObj ? svgObj.svg : ''}</div>`}
        ${cfg.mediaCaption ? `<div class="msw-media-caption">${esc(cfg.mediaCaption)}</div>` : ''}
      </div>
    ` : '';

    const levelUpHtml = (cfg.levelTransition || cfg.unlockedAbility || cfg.statBoosts.length > 0) ? `
      ${cfg.levelTransition ? `
        <div class="msw-levelup-banner">
          <span style="font-size:10px; font-weight:900; color:var(--sys-accent); letter-spacing:0.6px;">⚡ LEVEL PROGRESSION</span>
          <span class="msw-lvl-jump">${esc(cfg.levelTransition)}</span>
        </div>
      ` : ''}
      ${cfg.unlockedAbility ? `<div class="msw-ability-box" ${/\b(?:DEAD|CRITICAL|0\s*\/\s*\d+\s*HP)\b/i.test(cfg.unlockedAbility) ? 'style="border-color:rgba(248,113,113,0.75); background:rgba(127,29,29,0.35); color:#fecaca;"' : ''}>${esc(cfg.unlockedAbility)}</div>` : ''}
      ${cfg.statBoosts.length > 0 ? `
        <div class="msw-boost-grid">
          ${cfg.statBoosts.map(sb => {
            const dStr = String(sb.delta || '');
            const isNeg = /(?:^[-▼]|[-]\d|DEAD|0\s*HP|LOST)/i.test(dStr);
            const prefix = dStr.includes('➔') ? '' : (isNeg ? '▼ ' : '▲ ');
            return `
            <div class="msw-boost-cell ${isNeg ? 'is-neg' : ''}">
              <span class="msw-boost-stat">${esc(sb.label)}</span>
              <span class="msw-boost-delta ${isNeg ? 'is-neg' : ''}">${prefix}${esc(sb.delta)}</span>
            </div>`;
          }).join('')}
        </div>
      ` : ''}
    ` : '';

    const inventoryHtml = cfg.inventoryItems.length > 0 ? `
      <div class="msw-inv-grid">
        ${cfg.inventoryItems.map((it, idx) => {
          const itEval = evaluateUnlockReq(it.unlockReq, rpg);
          const isLocked = itEval.hasReq ? !itEval.unlocked : Boolean(it.locked);
          const eff = parseItemEffects(it.name, it.meta || '');
          const isCons = Boolean(it.consumable || eff.consumable);
          const bonusHint = !isLocked && Array.isArray(it.bonuses) && it.bonuses.length > 0
            ? it.bonuses.slice(0, 1).map(b => `+${b.amount}${b.suffix} ${b.stat}`).join('')
            : (!isLocked && eff.bonusSummary ? eff.bonusSummary.split(',')[0].trim() : '');
          const reqHint = itEval.hasReq ? (isLocked ? `🔒 ${itEval.missing[0]}` : '🔓 READY') : '';
          return `
          <div class="msw-inv-slot rarity-${esc(it.rarity)} ${it.equipped && !isLocked && !isCons ? 'is-equipped' : ''} ${isLocked ? 'is-locked' : ''}" data-inv-idx="${idx}" title="${esc(it.name)} — Tap for info">
            ${isCons && !isLocked ? '<span class="msw-inv-tag use">USE</span>' : (it.equipped && !isLocked ? '<span class="msw-inv-tag eqp">EQP</span>' : (isLocked ? '<span class="msw-inv-tag lock">🔒</span>' : ''))}
            ${renderItemIconVisual(it, '📦', 'sm')}
            <span class="msw-inv-name">${esc(it.name)}</span>
            ${bonusHint && !reqHint ? `<span class="msw-inv-subbonus">${esc(bonusHint)}</span>` : ''}
            ${reqHint ? `<span class="msw-rpg-req-chip ${isLocked ? '' : 'unlocked'}">${esc(reqHint)}</span>` : (it.qty && it.qty !== '1' ? `<span class="msw-inv-qty">${esc(it.qty.startsWith('x') || isNaN(Number(it.qty)) ? it.qty : 'x' + it.qty)}</span>` : '')}
          </div>`;
        }).join('')}
      </div>
    ` : '';

    const shopNoticePill = cfg.presetId === 'shop'
      ? (cfg.pills || []).find(p => /discount|sale|privilege|event/i.test(String(p))) || ''
      : '';
    const isGridShop = cfg.shopLayout === 'grid';
    const shopHtml = cfg.shopItems.length > 0 ? `
      ${shopNoticePill ? `<div class="msw-shop-notice-bar"><span>⚡ SYSTEM EXCHANGE PRIVILEGE</span><span>${esc(shopNoticePill)}</span></div>` : ''}
      <div class="${isGridShop ? 'msw-shop-grid' : 'msw-shop-list'}">
        ${cfg.shopItems.map((sp, idx) => {
          const spEval = evaluateUnlockReq(sp.unlockReq, rpg);
          const isLocked = spEval.hasReq ? !spEval.unlocked : Boolean(sp.locked);
          const rarity = normalizeRarity(sp.rarity);
          const cat = inferItemCategory(sp);
          const btnPriceLabel = /^LOCKED/i.test(sp.price) ? (parseCoinNumber(sp.price.replace(/LV\.?\s*\d+/gi, '')) > 0 ? sp.price.replace(/^LOCKED\s*/i, '') : 'CLAIM') : sp.price;
          const chipsHtml = buildItemEffectChipsHtml(sp);
          const reqChipHtml = spEval.hasReq
            ? `<span class="msw-rpg-req-chip ${isLocked ? '' : 'unlocked'}">${isLocked ? `🔒 Req: ${esc(spEval.missing.join(', '))}` : `🔓 Unlocked`}</span>`
            : '';
          if (isGridShop) {
            return `
              <div class="msw-shop-tile rarity-${esc(rarity)} ${isLocked ? 'is-locked-item' : ''}" data-shop-inspect-idx="${idx}" title="Tap item for details">
                <div class="msw-shop-tags">
                  <span class="msw-rarity-pill rarity-${esc(rarity)}">[${esc(rarity.toUpperCase())}]</span>
                  <span class="msw-cat-pill">[${esc(cat)}]</span>
                </div>
                ${renderItemIconVisual(sp, '🛒')}
                <span class="msw-shop-name" style="white-space:normal; line-height:1.2;">${esc(sp.name)}</span>
                ${chipsHtml}
                ${reqChipHtml}
                <button type="button" class="msw-shop-buy-btn ${sp.owned ? 'owned' : (isLocked ? 'locked' : '')}" data-shop-idx="${idx}">
                  ${sp.owned ? '✔ OWNED' : (isLocked ? `🔒 ${esc(sp.price)}` : `🪙 BUY • ${esc(btnPriceLabel)}`)}
                </button>
              </div>
            `;
          }
          return `
          <div class="msw-shop-row is-manhwa rarity-${esc(rarity)} ${isLocked ? 'is-locked-item' : ''}" data-shop-inspect-idx="${idx}" title="Tap item for details">
            <div class="msw-shop-left">
              ${renderItemIconVisual(sp, '🛒')}
              <div class="msw-shop-info">
                <div class="msw-shop-tags">
                  <span class="msw-rarity-pill rarity-${esc(rarity)}">[${esc(rarity.toUpperCase())}]</span>
                  <span class="msw-cat-pill">[${esc(cat)}]</span>
                </div>
                <span class="msw-shop-name">${esc(sp.name)}</span>
                ${chipsHtml}
                ${reqChipHtml}
                <span class="msw-shop-tap-hint">Tap row for full item stats</span>
              </div>
            </div>
            <button type="button" class="msw-shop-buy-btn ${sp.owned ? 'owned' : (isLocked ? 'locked' : '')}" data-shop-idx="${idx}">
              ${sp.owned ? '✔ OWNED' : (isLocked ? `🔒 ${esc(sp.price)}` : `🪙 ${esc(btnPriceLabel)}`)}
            </button>
          </div>`;
        }).join('')}
      </div>
    ` : '';

    const barsHtml = cfg.bars.length > 0 ? `
      <div class="msw-bars-list">
        ${cfg.bars.map(b => {
          const initialPct = b.animated ? b.fromValue : b.value;
          const valLabel = b.displayText ? esc(b.displayText) : `${b.value}%`;
          return `
            <div class="msw-bar-item">
              <div class="msw-bar-top">
                <span class="msw-bar-label">${esc(b.label)}</span>
                <span class="msw-bar-val">${valLabel}</span>
              </div>
              <div class="msw-bar-track">
                <div class="msw-bar-fill" style="width:${initialPct}%; --bar-color:${esc(b.color || cfg.accentColor)};" data-from-pct="${b.fromValue}" data-target-pct="${b.value}"></div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    ` : '';

    let extractedPointsStat = null;
    let displayStats = Array.isArray(cfg.stats) ? cfg.stats : [];
    if (cfg.presetId === 'status' && displayStats.length >= 6) {
      const ptIdx = displayStats.findIndex(s => /^(POINTS|AP|ABILITY\s*POINTS)$/i.test(String(s.label || '').trim()));
      if (ptIdx >= 0 && displayStats.length > 5) {
        extractedPointsStat = displayStats[ptIdx];
        displayStats = displayStats.filter((_, i) => i !== ptIdx);
      }
    }
    const isCompactStatus = cfg.presetId === 'status' && cfg.statusLayout === 'compact';
    const gridColsNum = Number(cfg.statsCols) === 3 ? 3 : (Number(cfg.statsCols) === 1 ? 1 : 2);
    const statsHtml = displayStats.length > 0 ? (
      isCompactStatus ? `
        <div class="msw-stats-compact-table">
          ${displayStats.map((s, idx) => {
            const isLastOdd = (idx === displayStats.length - 1) && (displayStats.length % 2 === 1);
            return `
              <div class="msw-stat-row-compact ${s.isBoosted ? 'is-boosted' : ''} ${isLastOdd ? 'is-odd-span' : ''}">
                <span class="msw-stat-lbl">${esc(s.label)}</span>
                ${s.isBoosted
                  ? `<span class="msw-stat-val-inline"><span class="msw-stat-total">${esc(s.totalVal)}</span><span class="msw-stat-bonus">(${esc(s.bonusText)})</span></span>`
                  : `<span class="msw-stat-val">${esc(s.value)}</span>`}
              </div>
            `;
          }).join('')}
        </div>
        ${extractedPointsStat ? `<div class="msw-points-banner"><span class="msw-points-lbl">✨ Available Ability Points</span><span class="msw-points-val">${esc(extractedPointsStat.value)}</span></div>` : ''}
      ` : `
        <div class="msw-stats-grid cols-${gridColsNum}">
          ${displayStats.map((s, idx) => {
            const isLastOdd = (idx === displayStats.length - 1) && (gridColsNum > 1) && (displayStats.length % gridColsNum === 1);
            return `
            <div class="msw-stat-cell ${s.isBoosted ? 'is-boosted' : ''} ${isLastOdd ? 'is-odd-span' : ''}">
              ${s.isBoosted
                ? `<div class="msw-stat-head-row"><span class="msw-stat-lbl">${esc(s.label)}</span><span class="msw-stat-bonus-chip">▲ ${esc(s.bonusText)}</span></div>
                   <div class="msw-stat-val-row"><span class="msw-stat-total">${esc(s.totalVal)}</span><span class="msw-stat-base">(${esc(s.baseVal)} <span class="msw-stat-bonus">${esc(s.bonusText)}</span>)</span></div>`
                : `<span class="msw-stat-lbl">${esc(s.label)}</span><span class="msw-stat-val">${esc(s.value)}</span>`}
            </div>`;
          }).join('')}
        </div>
        ${extractedPointsStat ? `<div class="msw-points-banner"><span class="msw-points-lbl">✨ Available Ability Points</span><span class="msw-points-val">${esc(extractedPointsStat.value)}</span></div>` : ''}
      `
    ) : '';

    const remainingPills = shopNoticePill ? cfg.pills.filter(p => p !== shopNoticePill) : cfg.pills;
    const pillsHtml = cfg.presetId === 'status'
      ? renderManhwaStatusSections(cfg, syncedGear)
      : (remainingPills.length > 0 ? `
        <div class="msw-pills-row">
          ${remainingPills.map(p => `<span class="msw-pill-tag">${esc(p)}</span>`).join('')}
        </div>
      ` : '');

    const timerSec = Math.max(0, Number(cfg.timerSeconds) || 0);
    const timerHtml = cfg.timerEnabled ? `
      <div class="msw-timer-box">
        <div class="msw-timer-top">
          <span class="msw-timer-lbl">${esc(cfg.timerLabel || 'TIME LEFT')}</span>
          <span class="msw-timer-clock" data-timer-sec="${timerSec}">${formatTimerSeconds(timerSec)}</span>
        </div>
        <div class="msw-timer-track">
          <div class="msw-timer-bar-fill" style="width:${timerSec > 0 ? '100' : '0'}%;"></div>
        </div>
      </div>
    ` : '';

    const selectedBtnIdx = (cfg.selectedButtonIdx !== null && cfg.selectedButtonIdx !== undefined) ? Number(cfg.selectedButtonIdx) : -1;
    const isCardLocked = cardLockEval.hasReq && !cardLockEval.unlocked;
    const rpgLockBannerHtml = cardLockEval.hasReq ? (
      isCardLocked
        ? `<div class="msw-rpg-lock-banner"><span>🔒 LOCKED</span><span>Need: ${esc(cardLockEval.missing.join(' • '))}</span></div>`
        : `<div class="msw-rpg-unlock-banner"><span>🔓 UNLOCKED</span><span>${esc(cardLockEval.summary)}</span></div>`
    ) : '';
    const rpgResolvedHtml = (cfg.rpgLink && cfg.rpgLink.enabled && cfg.rpgLink.resolvedOutcome)
      ? `<div class="msw-rpg-resolved-bar ${cfg.rpgLink.resolvedOutcome === 'pass' ? 'pass' : 'fail'}"><span>${cfg.rpgLink.resolvedOutcome === 'pass' ? '✅ QUEST CLEARED — REWARDS CLAIMED' : '💀 QUEST FAILED / PENALTY APPLIED'}</span><span>LV.${rpg.lv} • ${formatCoins(rpg.coins)} G</span></div>`
      : '';

    const isOutcomeResolved = Boolean(cfg.rpgLink && cfg.rpgLink.enabled && cfg.rpgLink.resolvedOutcome);
    const isFailOutcome = isOutcomeResolved && cfg.rpgLink.resolvedOutcome === 'fail';
    const btnsHtml = cfg.buttons.length > 0 ? `
      <div class="msw-btn-row">
        ${cfg.buttons.map((b, i) => `
          <button type="button" class="msw-action-btn ${selectedBtnIdx === i ? (isFailOutcome ? 'selected is-outcome-fail' : 'selected') : ''} ${(isCardLocked || (isOutcomeResolved && selectedBtnIdx !== i)) ? 'is-disabled-locked' : ''}" ${(isCardLocked || isOutcomeResolved) ? 'disabled' : ''} data-msw-btn-idx="${i}">${esc(b.label)}</button>
        `).join('')}
      </div>
    ` : '';

    let displayStampText = cfg.stampText;
    let displayStampColor = cfg.stampColor || '#facc15';
    if (isOutcomeResolved && displayStampText && AUTO_OUTCOME_STAMP_RE.test(String(displayStampText).trim())) {
      if (cfg.rpgLink.resolvedOutcome === 'fail' && /^(CLEARED|PASS(ED)?|COMPLETED)$/i.test(String(displayStampText).trim())) {
        displayStampText = 'PENALTY!';
        displayStampColor = '#ef4444';
      } else if (cfg.rpgLink.resolvedOutcome === 'pass' && /^(PENALTY!?|FAIL(ED)?|DECLINED|EXPIRED)$/i.test(String(displayStampText).trim())) {
        displayStampText = 'CLEARED';
        displayStampColor = '#4ade80';
      }
    }
    const stampHtml = displayStampText ? `
      <div class="msw-stamp" style="--stamp-color:${esc(displayStampColor)}">${esc(displayStampText)}</div>
    ` : '';

    const splitClass = hasMedia && (cfg.mediaLayout === 'portrait_left' || cfg.mediaLayout === 'icon_title' || cfg.mediaLayout === 'circle_halo')
      ? `layout-${cfg.mediaLayout === 'icon_title' ? 'icon_title' : 'portrait_left'}`
      : '';

    const topBannerMedia = (hasMedia && cfg.mediaLayout === 'banner_top') ? mediaHtml : '';
    const sideMedia = (hasMedia && cfg.mediaLayout !== 'banner_top') ? mediaHtml : '';
    const frameSvgHtml = getFrameSvgOverlay(cfg.frameStyle, cfg.customFrameSvg);
    const relicSparklesHtml = (cfg.sparkles && cfg.cardStyle === 'relic') ? `
      <div class="msw-sparkles-layer" aria-hidden="true">
        <span style="top:13%; left:15%;">✦</span>
        <span style="top:17%; right:14%; font-size:11px;">✧</span>
        <span style="top:38%; left:9%; font-size:10px;">✦</span>
        <span style="top:42%; right:10%; font-size:12px;">✦</span>
        <span style="bottom:36%; left:12%; font-size:15px;">✦</span>
        <span style="bottom:30%; right:13%; font-size:11px;">✧</span>
        <span style="bottom:14%; left:22%; font-size:10px;">✧</span>
        <span style="bottom:12%; right:20%; font-size:14px;">✦</span>
      </div>` : '';

    const iconSizePx = (elStyles.icons && elStyles.icons.fontSize > 0) ? elStyles.icons.fontSize : 0;
    let mainInnerBodyHtml = '';
    if (cfg.cardStyle === 'relic') {
      const fallbackEmojiPx = iconSizePx > 0 ? Math.max(24, Math.round(iconSizePx * 1.45)) : 52;
      const emblemVisual = hasImgMedia
        ? `<img src="${esc(cfg.mediaUrl)}" alt="${esc(cfg.headerTitle)}">`
        : (svgObj ? svgObj.svg : `<span style="font-size:${fallbackEmojiPx}px;">${esc(cfg.headerIcon || '👁️')}</span>`);
      const emblemFrameHtml = getEmblemFrameSvg(cfg.frameStyle, cfg);
      mainInnerBodyHtml = `
        <div class="msw-relic-stage">
          <div class="msw-emblem-box ${cfg.frameStyle === 'demonic_thorn' ? 'is-thorn-emblem' : ''}"${iconBoxStyleAttr}>
            ${emblemFrameHtml}
            ${emblemVisual}
          </div>
          ${cfg.headerTitle ? `<div class="msw-relic-title"${titleStyleAttr}>${esc(cfg.headerTitle)}</div>` : ''}
          ${cfg.subtitle ? `<div class="msw-relic-subtitle"${subtitleStyleAttr}>${esc(cfg.subtitle)}</div>` : ''}
          ${cfg.bodyText ? `<div class="msw-relic-desc"${bodyStyleAttr}>${esc(cfg.bodyText)}</div>` : ''}
        </div>
        ${levelUpHtml}
        ${inventoryHtml}
        ${shopHtml}
        ${barsHtml}
        ${statsHtml}
      `;
    } else if (cfg.cardStyle === 'codex') {
      const fallbackCodexPx = iconSizePx > 0 ? Math.max(24, Math.round(iconSizePx * 1.45)) : 48;
      const diagramVisual = hasImgMedia
        ? `<img src="${esc(cfg.mediaUrl)}" alt="${esc(cfg.headerTitle)}">`
        : (svgObj ? svgObj.svg : `<span style="font-size:${fallbackCodexPx}px;">${esc(cfg.headerIcon || '📘')}</span>`);
      mainInnerBodyHtml = `
        <div class="msw-codex-stage">
          <div class="msw-codex-diagram"${iconCodexStyleAttr}>${diagramVisual}</div>
          ${cfg.headerTitle ? `<div class="msw-codex-title"${titleStyleAttr}>${esc(cfg.headerTitle)}</div>` : ''}
          ${cfg.subtitle ? `<div class="msw-subtitle"${subtitleStyleAttr ? ` style="text-align:center; ${subtitleCss}"` : ' style="text-align:center;"'}>${esc(cfg.subtitle)}</div>` : ''}
          ${cfg.bodyText ? `<div class="msw-codex-rules"${bodyStyleAttr}>${esc(cfg.bodyText)}</div>` : ''}
        </div>
        ${levelUpHtml}
        ${inventoryHtml}
        ${shopHtml}
        ${barsHtml}
        ${statsHtml}
      `;
    } else {
      mainInnerBodyHtml = `
        ${cfg.subtitle ? `<div class="msw-subtitle"${subtitleStyleAttr}>${esc(cfg.subtitle)}</div>` : ''}
        ${topBannerMedia}
        <div class="msw-main-split ${splitClass}">
          ${sideMedia}
          <div class="msw-content-col">
            ${cfg.bodyText ? `<div class="msw-body-text"${bodyStyleAttr}>${esc(cfg.bodyText)}</div>` : ''}
            ${levelUpHtml}
            ${inventoryHtml}
            ${shopHtml}
            ${barsHtml}
            ${statsHtml}
          </div>
        </div>
      `;
    }

    const showCardRpgBar = !previewMode && (['shop', 'inventory', 'status'].includes(cfg.presetId) || isOutcomeResolved);
    const totalBagQty = (rpg.inventory || []).reduce((acc, it) => acc + Math.max(1, Number(it.qty) || 1), 0);
    const cardRpgBarHtml = showCardRpgBar ? `
      <div class="msw-card-rpg-bar">
        <button type="button" class="msw-card-rpg-btn msw-card-rpg-bag">🎒 Bag (${totalBagQty})</button>
        <button type="button" class="msw-card-rpg-btn msw-card-rpg-prof">📊 Boosted Profile</button>
      </div>
    ` : '';

    el.innerHTML = `
      ${cardBgHtml}
      <div class="msw-corner tl"></div>
      <div class="msw-corner tr"></div>
      <div class="msw-corner bl"></div>
      <div class="msw-corner br"></div>
      <div class="msw-fx-overlay scanlines"></div>
      <div class="msw-fx-overlay grid"></div>
      <div class="msw-fx-overlay starburst"></div>
      ${relicSparklesHtml}
      ${frameSvgHtml}
      ${stampHtml}
      <div class="msw-inner">
        <div class="msw-header">
          <div class="msw-header-left">
            ${cfg.headerIcon ? `<span class="msw-header-icon"${iconStyleAttr}>${esc(cfg.headerIcon)}</span>` : ''}
            <span class="msw-header-title"${titleStyleAttr}>${esc(cfg.headerTitle || 'SYSTEM WINDOW')}</span>
          </div>
          <div style="display:flex; align-items:center; gap:5px; flex-shrink:0;">
            ${cfg.currencyText ? `<span class="msw-currency-pill">${esc(cfg.currencyText)}</span>` : ''}
            ${cfg.headerBadge ? `<span class="msw-badge">${esc(cfg.headerBadge)}</span>` : ''}
          </div>
        </div>
        ${mainInnerBodyHtml}
        ${rpgLockBannerHtml}
        ${rpgResolvedHtml}
        ${pillsHtml}
        ${timerHtml}
        ${btnsHtml}
        ${cardRpgBarHtml}
        ${cfg.footerText ? `<div class="msw-footer"><span>${esc(cfg.footerText)}</span></div>` : ''}
      </div>
    `;

    animateBarsInElement(el);

    el.querySelectorAll('.msw-card-rpg-bag').forEach(b => {
      b.addEventListener('click', (e) => {
        e.stopPropagation();
        openRpgDrawer('bag');
      });
    });
    el.querySelectorAll('.msw-card-rpg-prof').forEach(b => {
      b.addEventListener('click', (e) => {
        e.stopPropagation();
        openRpgDrawer('profile');
      });
    });

    el.querySelectorAll('[data-inspect-eqp-idx]').forEach(row => {
      row.addEventListener('click', (e) => {
        e.stopPropagation();
        const idx = Number(row.dataset.inspectEqpIdx);
        const eq = syncedGear && syncedGear.equippedItems && syncedGear.equippedItems[idx];
        if (!eq) return;
        const bagIdx = (rpg.inventory || []).findIndex(it => it.name === eq.name && it.equipped);
        openItemInspectModal(eq, { source: bagIdx >= 0 ? 'bag' : 'view', idx: bagIdx, previewMode });
      });
    });

    el.querySelectorAll('.msw-action-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const idx = Number(btn.dataset.mswBtnIdx);
        if (previewMode) {
          el.querySelectorAll('.msw-action-btn').forEach((b, i) => b.classList.toggle('selected', i === idx));
          if (api() && typeof api().playPopSound === 'function') api().playPopSound(1.1);
          return;
        }
        if (isCardLocked) {
          if (api() && typeof api().showToast === 'function') api().showToast(`🔒 Locked! Requires: ${cardLockEval.missing.join(', ')}`);
          if (api() && typeof api().triggerSfxByName === 'function') api().triggerSfxByName('sting', 1.0);
          return;
        }
        if (typeof opts.onButtonClick === 'function') {
          opts.onButtonClick(msg, idx, btn.textContent);
        } else if (msg && msg.systemConfig) {
          msg.systemConfig.selectedButtonIdx = idx;
          el.querySelectorAll('.msw-action-btn').forEach((b, i) => b.classList.toggle('selected', i === idx));
          const link = normalizeRpgLink(msg.systemConfig.rpgLink);
          if (link.enabled && !link.resolvedOutcome) {
            if (idx === link.passBtnIndex) resolveCardOutcome(msg, 'pass');
            else if (idx === link.failBtnIndex) resolveCardOutcome(msg, 'fail');
          } else {
            if (api() && typeof api().playPopSound === 'function') api().playPopSound(1.15);
          }
          if (api() && typeof api().saveStudioState === 'function') api().saveStudioState();
        }
      });
    });

    el.querySelectorAll('.msw-inv-slot').forEach(slotEl => {
      slotEl.addEventListener('click', (e) => {
        e.stopPropagation();
        const idx = Number(slotEl.dataset.invIdx);
        const target = syncedFromRpgInv && !previewMode && rpg.inventory[idx]
          ? rpg.inventory[idx]
          : ((msg && msg.systemConfig && msg.systemConfig.inventoryItems && msg.systemConfig.inventoryItems[idx]) || cfg.inventoryItems[idx]);
        if (!target) return;
        openItemInspectModal(target, {
          source: (syncedFromRpgInv && !previewMode) ? 'bag' : 'inv',
          idx,
          msg,
          cfg,
          el,
          slotEl,
          previewMode
        });
      });
    });

    el.querySelectorAll('[data-shop-inspect-idx]').forEach(rowEl => {
      rowEl.addEventListener('click', (e) => {
        if (e.target && e.target.closest('.msw-shop-buy-btn')) return;
        e.stopPropagation();
        const idx = Number(rowEl.dataset.shopInspectIdx);
        const target = (msg && msg.systemConfig && msg.systemConfig.shopItems && msg.systemConfig.shopItems[idx]) || cfg.shopItems[idx];
        const buyBtn = rowEl.querySelector('.msw-shop-buy-btn');
        if (target) openItemInspectModal(target, { source: 'shop', idx, msg, cfg, el, buyBtn, previewMode });
      });
    });

    el.querySelectorAll('.msw-shop-buy-btn').forEach(buyBtn => {
      buyBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const idx = Number(buyBtn.dataset.shopIdx);
        purchaseShopItem(msg, cfg, el, idx, buyBtn, previewMode);
      });
    });

    const alreadyResolved = Boolean(cfg.rpgLink && cfg.rpgLink.enabled && cfg.rpgLink.resolvedOutcome);
    if (cfg.timerEnabled && alreadyResolved && cfg.rpgLink.resolvedOutcome === 'fail') {
      applyTimerVisualState(el, 0, timerSec || 10);
    } else if (cfg.timerEnabled && !previewMode && timerSec > 0 && !alreadyResolved) {
      let remaining = timerSec;
      const total = timerSec;
      const iv = setInterval(() => {
        if (!el.isConnected) {
          clearInterval(iv);
          return;
        }
        remaining = Math.max(0, remaining - 1);
        applyTimerVisualState(el, remaining, total);
        if (remaining <= 0) {
          clearInterval(iv);
          const link = msg && msg.systemConfig ? normalizeRpgLink(msg.systemConfig.rpgLink) : null;
          if (link && link.enabled && link.timerExpirePenalty !== false && !link.resolvedOutcome) {
            resolveCardOutcome(msg, 'fail', { fromTimer: true });
            if (api() && typeof api().saveStudioState === 'function') api().saveStudioState();
          } else if (api() && typeof api().triggerSfxByName === 'function') {
            api().triggerSfxByName('sting', 0.95);
          }
        }
      }, 1000);
    }

    if (!previewMode) {
      el.addEventListener('click', () => {
        if (typeof opts.onEditClick === 'function') {
          opts.onEditClick(msg);
        } else {
          openSystemWindowBuilder(msg.id);
        }
      });
    }

    return el;
  }

  /* --------------------------------------------------------------------------
     CLEAN SHORTHAND SCREENPLAY PARSER & READABLE SERIALIZER
     -------------------------------------------------------------------------- */
  function applyThemeToConfig(cfg, themeId) {
    if (!THEMES[themeId]) return cfg;
    const t = themeProps(themeId);
    if (cfg && (cfg.cardStyle === 'relic' || cfg.cardStyle === 'codex')) {
      return {
        ...cfg,
        themeId: t.themeId,
        accentColor: t.accentColor,
        secondaryColor: t.secondaryColor,
        bgColor: t.bgColor,
        bgOpacity: t.bgOpacity,
        glowIntensity: t.glowIntensity
      };
    }
    return { ...cfg, ...t };
  }

  function applyOptionalTagModifiers(cfg, parts) {
    const cleanParts = [];
    parts.forEach(p => {
      const m = p.match(/^(theme|frame|accent|stamp|badge|icon|shoplayout|statuslayout)=([#\w\s\-\.\!\?\:\+%\(\)&,\[\]\/✦🔥💀⚡👑]+)$/i);
      if (m) {
        const key = m[1].toLowerCase();
        const val = m[2].trim();
        if (key === 'theme' && THEMES[val]) {
          Object.assign(cfg, themeProps(val));
        } else if (key === 'frame') {
          cfg.frameStyle = val;
        } else if (key === 'accent') {
          cfg.accentColor = val;
        } else if (key === 'stamp') {
          cfg.stampText = val;
        } else if (key === 'badge') {
          cfg.headerBadge = val;
        } else if (key === 'shoplayout') {
          cfg.shopLayout = val.toLowerCase() === 'grid' ? 'grid' : 'rows';
        } else if (key === 'statuslayout') {
          cfg.statusLayout = val.toLowerCase() === 'compact' ? 'compact' : 'sheet';
        } else if (key === 'icon') {
          if (getAllSvgIcons()[val]) {
            cfg.svgIcon = val;
          } else {
            cfg.headerIcon = val;
          }
        }
      } else {
        cleanParts.push(p);
      }
    });
    return cleanParts;
  }

  function parseQuestDeltaSpec(specStr = '', isFail = false) {
    const out = { coins: 0, exp: 0, hp: 0, mp: 0, itemName: '', flag: '' };
    String(specStr || '').split(',').map(s => s.trim()).filter(Boolean).forEach(tok => {
      const itemM = tok.match(/^ITEM:\s*(.+)$/i);
      if (itemM) { out.itemName = itemM[1].trim(); return; }
      const flagM = tok.match(/^FLAG:\s*(.+)$/i);
      if (flagM) { out.flag = flagM[1].trim(); return; }
      const m = tok.match(/^([+\-]?\d+)\s*(G|COINS?|GOLD|EXP|XP|HP|MP|MANA)$/i);
      if (!m) return;
      const num = Math.abs(parseInt(m[1], 10) || 0);
      const unit = m[2].toUpperCase();
      if (unit === 'G' || unit.startsWith('COIN') || unit === 'GOLD') out.coins += num;
      else if (unit === 'EXP' || unit === 'XP') out.exp += num;
      else if (unit === 'HP') out.hp += (isFail ? num : (parseInt(m[1], 10) || num));
      else if (unit === 'MP' || unit === 'MANA') out.mp += (isFail ? num : (parseInt(m[1], 10) || num));
    });
    return out;
  }

  function estimateSystemWindowHoldMs(cfg) {
    const c = (cfg && typeof cfg === 'object') ? cfg : {};
    const words = [c.headerTitle, c.subtitle, c.bodyText, c.levelTransition, c.unlockedAbility]
      .filter(Boolean).join(' ').trim().split(/\s+/).filter(Boolean).length;
    const itemCount =
      (Array.isArray(c.stats) ? c.stats.length : 0) +
      (Array.isArray(c.statBoosts) ? c.statBoosts.length : 0) +
      (Array.isArray(c.inventoryItems) ? c.inventoryItems.length : 0) +
      (Array.isArray(c.shopItems) ? c.shopItems.length : 0) +
      (Array.isArray(c.bars) ? c.bars.length : 0) +
      (Array.isArray(c.buttons) ? c.buttons.length : 0) +
      (Array.isArray(c.pills) ? c.pills.length : 0);
    return Math.max(3500, Math.min(5200, Math.round(3200 + itemCount * 220 + words * 65)));
  }

  function makeMsg(cfg, delayMs = 0, idx = 0) {
    const cleanCfg = normalizeConfig({ systemConfig: cfg });
    const autoHold = estimateSystemWindowHoldMs(cleanCfg);
    const resolvedDelay = (Number(delayMs) > 2500) ? Number(delayMs) : autoHold;
    return {
      id: 'm_syswin_' + Date.now() + '_' + idx,
      type: 'syswindow',
      title: cleanCfg.headerTitle,
      text: cleanCfg.bodyText || cleanCfg.subtitle || cleanCfg.levelTransition || cleanCfg.headerTitle,
      systemConfig: cleanCfg,
      delayMs: resolvedDelay
    };
  }

  function splitTopLevelItems(str) {
    const out = [];
    let cur = '';
    let depth = 0;
    for (let i = 0; i < str.length; i++) {
      const ch = str[i];
      if (ch === '(') depth++;
      else if (ch === ')' && depth > 0) depth--;
      if (ch === ',' && depth === 0) {
        if (cur.trim()) out.push(cur.trim());
        cur = '';
      } else {
        cur += ch;
      }
    }
    if (cur.trim()) out.push(cur.trim());
    return out;
  }

  function parseParenItemToken(token, isShop = false) {
    const m = token.match(/^([^\(]+?)\s*(?:\(([^\)]+)\))?$/);
    const name = m ? m[1].trim() : token.trim();
    const metaRaw = m && m[2] ? m[2].split(/,\s*(?!\d{3}\b)/).map(s => s.trim()).filter(Boolean) : [];
    let rarity = 'common';
    let qty = '1';
    let price = '1,000 G';
    let equipped = false;
    let locked = false;
    let owned = false;
    let unlockReq = '';
    let metaNotes = [];
    let icon = isShop ? '🛒' : '📦';

    const lower = name.toLowerCase();
    if (lower.includes('dagger') || lower.includes('fang') || lower.includes('blade') || lower.includes('sword')) icon = '🗡️';
    else if (lower.includes('potion') || lower.includes('elixir') || lower.includes('heal')) icon = '🧪';
    else if (lower.includes('key')) icon = '🗝️';
    else if (lower.includes('stone') || lower.includes('gem') || lower.includes('crystal')) icon = '💎';
    else if (lower.includes('cloak') || lower.includes('armor') || lower.includes('shield')) icon = '🛡️';
    else if (lower.includes('crown') || lower.includes('ring')) icon = '👑';
    else if (lower.includes('scroll') || lower.includes('book')) icon = '📜';
    else if (lower.includes('igris') || lower.includes('knight') || lower.includes('iron')) icon = '⚔️';
    else if (lower.includes('beru') || lower.includes('ant')) icon = '🐜';

    metaRaw.forEach(tok => {
      const tu = tok.toUpperCase();
      if (['MYTHIC', 'SSS', 'UR'].includes(tu)) { rarity = 'mythic'; qty = tu; }
      else if (['LEGENDARY', 'SSR', 'S', 'S-RANK'].includes(tu)) { rarity = 'legendary'; qty = tu; }
      else if (['EPIC', 'A', 'A-RANK'].includes(tu)) { rarity = 'epic'; qty = tu; }
      else if (['RARE', 'B', 'B-RANK'].includes(tu)) { rarity = 'rare'; qty = tu; }
      else if (['COMMON', 'C', 'D', 'E'].includes(tu)) { rarity = 'common'; qty = tu; }
      else if (tu === 'EQUIPPED' || tu === 'EQP') equipped = true;
      else if (tu.startsWith('LOCKED')) {
        locked = true;
        if (isShop) price = tok;
        const cond = tok.replace(/^LOCKED\s*/i, '').trim();
        if (cond) unlockReq = unlockReq ? `${unlockReq}, ${cond}` : cond;
      }
      else if (/^(?:REQ:|FLAG:|ITEM:|COINS?\s*>=?\s*\d|LV\s*>=?\s*\d)/i.test(tok)) {
        const cleanReq = tok.replace(/^REQ\s*:\s*/i, '').trim();
        if (cleanReq) unlockReq = unlockReq ? `${unlockReq}, ${cleanReq}` : cleanReq;
      }
      else if (tu === 'OWNED') owned = true;
      else if (/^x\d+$/i.test(tok)) qty = tok;
      else if (/\d[\d,]*\s*(?:G|GOLD|C|COINS|GEMS)/i.test(tok)) price = tok;
      else metaNotes.push(tok);
    });

    if (isShop) {
      return { icon, name, rarity, meta: metaNotes.join(' • '), price, locked, owned, unlockReq };
    }
    return { icon, name, rarity, qty, equipped, locked, unlockReq };
  }

  function parseSysWindowLine(line, idx = 0) {
    if (!line || typeof line !== 'string') return null;

    const fullMatch = line.match(/^\[SYSWINDOW:\s*(\{.+\})\]$/i);
    if (fullMatch) {
      try {
        const parsed = JSON.parse(fullMatch[1]);
        return makeMsg(parsed, Number(parsed.holdMs) || 0, idx);
      } catch (e) {}
    }

    const relicMatch = line.match(/^\[SYS_RELIC:\s*(.+)\]$/i);
    if (relicMatch) {
      const rawParts = relicMatch[1].split('|').map(s => s.trim()).filter(Boolean);
      const base = cloneObj(PRESETS.find(p => p.id === 'relic').config);
      const parts = applyOptionalTagModifiers(base, rawParts);
      base.headerTitle = parts[0] || 'DEVOUR';
      if (parts.length >= 3) {
        base.subtitle = parts[1] || '';
        base.bodyText = parts.slice(2).join('\n').replace(/\\n/g, '\n');
      } else {
        base.subtitle = '';
        base.bodyText = (parts[1] || '').replace(/\\n/g, '\n');
      }
      return makeMsg(base, 2400, idx);
    }

    const codexMatch = line.match(/^\[SYS_CODEX:\s*(.+)\]$/i);
    if (codexMatch) {
      const rawParts = codexMatch[1].split('|').map(s => s.trim()).filter(Boolean);
      const base = cloneObj(PRESETS.find(p => p.id === 'codex').config);
      const parts = applyOptionalTagModifiers(base, rawParts);
      const rawTitle = parts[0] || 'SYSTEM CODEX';
      base.headerTitle = /^\[.+\]$/.test(rawTitle) ? rawTitle : `[${rawTitle}]`;
      const rawRules = parts.slice(1).join('\n').replace(/\\n/g, '\n').replace(/\s*;;\s*|\s*;\s+/g, '\n').trim();
      base.bodyText = rawRules || '- ALL SYSTEM RULES APPLY EQUALLY.';
      return makeMsg(base, 2400, idx);
    }

    const statusMatch = line.match(/^\[SYS_STATUS:\s*(.+)\]$/i);
    if (statusMatch) {
      const rawParts = statusMatch[1].split('|').map(s => s.trim()).filter(Boolean);
      const base = cloneObj(PRESETS.find(p => p.id === 'status').config);
      base.syncWithStoryRpg = false;
      const parts = applyOptionalTagModifiers(base, rawParts);
      base.headerTitle = `${(parts[0] || 'PLAYER').toUpperCase()} — STATUS`;
      base.headerBadge = parts[1] || 'AWAKENED';
      base.subtitle = parts[1] || 'System Status';
      base.bars = [];
      base.stats = [];
      base.mediaUrl = '';
      base.mediaLayout = 'none';
      if (api() && typeof api().getCharacters === 'function' && parts[0]) {
        const ch = api().getCharacters().find(c => c.name.toLowerCase() === parts[0].toLowerCase());
        if (ch && ch.avatar) {
          base.mediaUrl = ch.avatar;
          base.mediaLayout = 'portrait_left';
          base.mediaCaption = ch.name.toUpperCase();
        }
      }
      parts.slice(2).forEach(part => {
        const barMatch = part.match(/^([A-Za-z0-9\s]+):\s*(\d+)%?$/);
        if (barMatch && /^(HP|MP|SP|EXP|MANA|STAMINA)$/i.test(barMatch[1].trim())) {
          const v = clampPct(barMatch[2], 100);
          base.bars.push({
            label: barMatch[1].trim().toUpperCase(),
            value: v,
            fromValue: Math.max(0, v - 25),
            displayText: `${v}%`,
            color: /HP/i.test(barMatch[1]) ? '#ef4444' : '#38bdf8',
            animated: true
          });
        } else if (part.includes(':')) {
          part.split(',').forEach(kv => {
            const [k, ...rest] = kv.split(':');
            if (k && rest.length) base.stats.push({ label: k.trim().toUpperCase(), value: rest.join(':').trim() });
          });
        } else {
          base.bodyText = (base.bodyText ? base.bodyText + '\n' : '') + part;
        }
      });
      return makeMsg(base, 2200, idx);
    }

    const lvlMatch = line.match(/^\[SYS_LEVELUP:\s*(.+)\]$/i);
    if (lvlMatch) {
      const rawParts = lvlMatch[1].split('|').map(s => s.trim()).filter(Boolean);
      const base = cloneObj(PRESETS.find(p => p.id === 'levelup').config);
      const parts = applyOptionalTagModifiers(base, rawParts);
      base.mediaUrl = '';
      base.mediaLayout = 'none';
      base.bars = [];
      base.statBoosts = [];
      base.levelTransition = (parts[0] || 'LEVEL UP!').replace(/->/g, '➔');
      base.unlockedAbility = '';
      parts.slice(1).forEach(p => {
        if (/^(NEW SKILL|ABILITY|UNLOCKED|SKILL):/i.test(p)) {
          base.unlockedAbility = '⚡ ' + p;
        } else if (/[+\-]\d+%?/.test(p) && (p.includes(',') || /^[A-Za-z\s]+[+\-:]/.test(p))) {
          p.split(',').forEach(item => {
            const m = item.trim().match(/^(.+?)\s*[: ]\s*([+\-]\d+\s*%?.*)$/);
            if (m) base.statBoosts.push({ label: m[1].trim().toUpperCase(), delta: m[2].trim() });
          });
        } else {
          base.bodyText = p;
        }
      });
      return makeMsg(base, 2200, idx);
    }

    const invMatch = line.match(/^\[SYS_INVENTORY:\s*(.+)\]$/i);
    if (invMatch) {
      const rawParts = invMatch[1].split('|').map(s => s.trim()).filter(Boolean);
      const base = cloneObj(PRESETS.find(p => p.id === 'inventory').config);
      base.syncWithStoryRpg = false;
      const parts = applyOptionalTagModifiers(base, rawParts);
      base.currencyText = parts[0] ? (parts[0].includes('🪙') ? parts[0] : '🪙 ' + parts[0]) : '🪙 0 G';
      const itemListRaw = parts[1] ? parts.slice(1).join(', ') : '';
      base.inventoryItems = splitTopLevelItems(itemListRaw).map(tok => parseParenItemToken(tok, false));
      base.headerBadge = `${base.inventoryItems.length}/20 SLOTS`;
      return makeMsg(base, 2200, idx);
    }

    const shopMatch = line.match(/^\[SYS_SHOP:\s*(.+)\]$/i);
    if (shopMatch) {
      const rawParts = shopMatch[1].split('|').map(s => s.trim()).filter(Boolean);
      const base = cloneObj(PRESETS.find(p => p.id === 'shop').config);
      const parts = applyOptionalTagModifiers(base, rawParts);
      base.headerTitle = parts[0] || 'SYSTEM COIN SHOP';
      base.currencyText = parts[1] ? (parts[1].includes('🪙') ? parts[1] : '🪙 ' + parts[1]) : '🪙 50,000 G';
      const itemListRaw = parts.slice(2).join(', ');
      base.shopItems = splitTopLevelItems(itemListRaw).map(tok => parseParenItemToken(tok, true));
      return makeMsg(base, 2300, idx);
    }

    const qbMatch = line.match(/^\[SYS_QUESTBOARD:\s*(.+)\]$/i);
    if (qbMatch) {
      const rawParts = qbMatch[1].split('|').map(s => s.trim()).filter(Boolean);
      const base = cloneObj(PRESETS.find(p => p.id === 'questboard').config);
      const parts = applyOptionalTagModifiers(base, rawParts);
      base.headerTitle = parts[0] || 'DAILY QUEST BOARD';
      base.headerBadge = parts[1] || 'DAILY';
      base.bars = [];
      base.timerEnabled = false;
      splitTopLevelItems(parts.slice(2).join(', ')).forEach(t => {
        const m = t.match(/^(.+?)\s+(\d+)\s*\/\s*(\d+)$/);
        if (m) {
          const pct = clampPct((Number(m[2]) / Math.max(1, Number(m[3]))) * 100, 50);
          base.bars.push({ label: m[1].trim(), value: pct, fromValue: pct, displayText: `${m[2]} / ${m[3]}`, color: pct >= 100 ? '#4ade80' : '#00f0ff', animated: pct < 100 });
        } else {
          base.pills.push(t);
        }
      });
      return makeMsg(base, 2100, idx);
    }

    const saMatch = line.match(/^\[SYS_SHADOWARMY:\s*(.+)\]$/i);
    if (saMatch) {
      const rawParts = saMatch[1].split('|').map(s => s.trim()).filter(Boolean);
      const base = cloneObj(PRESETS.find(p => p.id === 'shadowarmy').config);
      const parts = applyOptionalTagModifiers(base, rawParts);
      base.headerTitle = parts[0] || 'SHADOW SOLDIER ROSTER';
      base.currencyText = parts[1] || '🌑 SHADOWS';
      const itemListRaw = parts.slice(2).join(', ');
      base.inventoryItems = splitTopLevelItems(itemListRaw).map(tok => parseParenItemToken(tok, false));
      return makeMsg(base, 2100, idx);
    }

    const itemMatch = line.match(/^\[SYS_ITEM:\s*(.+)\]$/i);
    if (itemMatch) {
      const rawParts = itemMatch[1].split('|').map(s => s.trim()).filter(Boolean);
      const base = cloneObj(PRESETS.find(p => p.id === 'item').config);
      const parts = applyOptionalTagModifiers(base, rawParts);
      base.mediaUrl = '';
      base.mediaLayout = 'none';
      base.headerTitle = parts[0] || 'MYSTERY ARTIFACT';
      base.headerBadge = parts[1] || 'S-RANK';
      base.stats = [];
      base.pills = [];
      if (parts[2] && parts[2].includes(':')) {
        parts[2].split(',').forEach(kv => {
          const [k, ...rest] = kv.split(':');
          if (k && rest.length) base.stats.push({ label: k.trim().toUpperCase(), value: rest.join(':').trim() });
        });
        base.bodyText = parts.slice(3).join('\n');
      } else {
        base.bodyText = parts.slice(2).join('\n');
      }
      return makeMsg(base, 2000, idx);
    }

    const loadMatch = line.match(/^\[SYS_LOADING:\s*(.+)\]$/i);
    if (loadMatch) {
      const rawParts = loadMatch[1].split('|').map(s => s.trim()).filter(Boolean);
      const base = cloneObj(PRESETS.find(p => p.id === 'loading').config);
      const parts = applyOptionalTagModifiers(base, rawParts);
      base.headerTitle = parts[0] || 'SYSTEM LOADING...';
      const pct = clampPct(String(parts[1] || '100').replace('%', ''), 100);
      base.bars = [{ label: 'PROGRESS', value: pct, fromValue: 0, displayText: `${pct}%`, color: base.accentColor, animated: true }];
      base.bodyText = parts.slice(2).join('\n') || 'Synchronizing player core data...';
      base.stats = [];
      base.pills = [];
      return makeMsg(base, 2000, idx);
    }

    const affMatch = line.match(/^\[SYS_AFFECTION:\s*(.+)\]$/i);
    if (affMatch) {
      const rawParts = affMatch[1].split('|').map(s => s.trim()).filter(Boolean);
      const base = cloneObj(PRESETS.find(p => p.id === 'affection').config);
      const parts = applyOptionalTagModifiers(base, rawParts);
      const target = parts[0] || 'Heroine';
      base.headerTitle = `${target.toUpperCase()} — AFFECTION`;
      base.mediaUrl = '';
      base.mediaLayout = 'none';
      if (api() && typeof api().getCharacters === 'function') {
        const ch = api().getCharacters().find(c => c.name.toLowerCase() === target.toLowerCase());
        if (ch && ch.avatar) {
          base.mediaUrl = ch.avatar;
          base.mediaLayout = 'circle_halo';
          base.mediaCaption = ch.name.toUpperCase();
        }
      }
      const rawPct = parts[1] || '75';
      const arrowM = rawPct.match(/(\d+)\s*%?\s*(?:->|➔|to)\s*(\d+)/i);
      const fromV = arrowM ? clampPct(arrowM[1], 50) : 0;
      const toV = arrowM ? clampPct(arrowM[2], 75) : clampPct(rawPct.replace(/[^0-9]/g, ''), 75);
      const diff = toV - fromV;
      base.headerBadge = diff >= 0 ? `+${diff}%` : `${diff}%`;
      base.bars = [{ label: 'AFFECTION LEVEL', value: toV, fromValue: fromV, displayText: arrowM ? `${fromV}% ➔ ${toV}%` : `${toV}%`, color: '#ec4899', animated: true }];
      base.bodyText = parts.slice(2).join('\n') || '';
      base.stats = [];
      base.pills = [];
      return makeMsg(base, 2000, idx);
    }

    const constMatch = line.match(/^\[SYS_CONSTELLATION:\s*(.+)\]$/i);
    if (constMatch) {
      const rawParts = constMatch[1].split('|').map(s => s.trim()).filter(Boolean);
      const base = cloneObj(PRESETS.find(p => p.id === 'constellation').config);
      const parts = applyOptionalTagModifiers(base, rawParts);
      base.mediaUrl = '';
      base.mediaLayout = 'none';
      base.headerTitle = parts[0] || 'CONSTELLATION CHANNEL';
      base.headerBadge = parts[1] || '+500 Coins';
      base.currencyText = '';
      base.bodyText = parts.slice(2).join('\n') || 'A Constellation watches your battle with great amusement!';
      base.stats = [];
      base.pills = ['Star Stream'];
      return makeMsg(base, 1900, idx);
    }

    const timerMatch = line.match(/^\[SYS_TIMER:\s*(.+)\]$/i);
    if (timerMatch) {
      const rawParts = timerMatch[1].split('|').map(s => s.trim()).filter(Boolean);
      const base = cloneObj(PRESETS.find(p => p.id === 'timer').config);
      const parts = applyOptionalTagModifiers(base, rawParts);
      const timeStr = parts[0] || '10s';
      let secs = 10;
      if (timeStr.includes(':')) {
        const [m, s] = timeStr.split(':').map(n => parseInt(n, 10) || 0);
        secs = m * 60 + s;
      } else if (/m/i.test(timeStr)) {
        secs = (parseInt(timeStr, 10) || 1) * 60;
      } else {
        secs = parseInt(timeStr, 10) || 10;
      }
      base.timerEnabled = true;
      base.timerSeconds = secs;
      base.headerTitle = parts[1] || 'PENALTY COUNTDOWN';
      base.bodyText = parts.slice(2).join('\n') || 'Complete the survival task before time hits 00:00!';
      base.stats = [];
      base.pills = [];
      base.rpgLink = normalizeRpgLink({ enabled: false });
      return makeMsg(base, 0, idx);
    }

    const questMatch = line.match(/^\[SYS_QUEST:\s*(.+)\]$/i);
    if (questMatch) {
      const rawParts = questMatch[1].split('|').map(s => s.trim()).filter(Boolean);
      const base = cloneObj(PRESETS.find(p => p.id === 'notification').config);
      const afterMods = applyOptionalTagModifiers(base, rawParts);
      const posParts = [];
      let rewardTxt = '';
      let penaltyTxt = '';
      let passSpec = '';
      let failSpec = '';
      let customButtons = null;
      let timerSpec = '';
      afterMods.forEach(p => {
        const kv = p.match(/^(reward|penalty|pass|fail|buttons|timer)\s*[:=]\s*(.+)$/i);
        if (kv) {
          const k = kv[1].toLowerCase();
          const v = kv[2].trim();
          if (k === 'reward') rewardTxt = v;
          else if (k === 'penalty') penaltyTxt = v;
          else if (k === 'pass') passSpec = v;
          else if (k === 'fail') failSpec = v;
          else if (k === 'timer') timerSpec = v;
          else if (k === 'buttons') {
            customButtons = v.split(/\s*\/\s*|\s*,\s*/).map(s => s.trim()).filter(Boolean);
          }
        } else {
          posParts.push(p);
        }
      });
      base.headerTitle = posParts[0] || 'SYSTEM QUEST ALERT';
      base.bodyText = posParts[1] || 'Will you accept the System Quest contract?';
      if (!rewardTxt && posParts[2]) rewardTxt = posParts[2];
      if (!penaltyTxt && posParts[3]) penaltyTxt = posParts[3];
      base.subtitle = '';
      base.statsCols = 2;
      base.stats = [];
      if (rewardTxt) base.stats.push({ label: 'REWARD', value: rewardTxt });
      if (penaltyTxt) base.stats.push({ label: 'PENALTY', value: penaltyTxt });
      if (base.stats.length === 0) {
        base.stats = [{ label: 'REWARD', value: passSpec || 'System Awakening' }, { label: 'PENALTY', value: failSpec || 'System Penalty' }];
      }
      base.buttons = (customButtons && customButtons.length >= 2)
        ? customButtons.slice(0, 3).map(lbl => ({ label: lbl, style: 'neutral' }))
        : [{ label: '✔ ACCEPT', style: 'neutral' }, { label: '✖ DECLINE', style: 'neutral' }];
      if (timerSpec) {
        let secs = parseInt(timerSpec, 10) || 10;
        if (/m/i.test(timerSpec)) secs *= 60;
        base.timerEnabled = true;
        base.timerSeconds = Math.max(1, secs);
      }
      const passObj = parseQuestDeltaSpec(passSpec, false);
      const failObj = parseQuestDeltaSpec(failSpec, true);
      if (!passSpec && !failSpec) {
        passObj.exp = 50;
        passObj.coins = 100;
        failObj.hp = 20;
      }
      base.rpgLink = normalizeRpgLink({
        enabled: true,
        passBtnIndex: 0,
        failBtnIndex: 1,
        timerExpirePenalty: true,
        autoHideAfterResolve: true,
        autoHideDelaySec: 1.8,
        passReward: {
          coins: passObj.coins,
          exp: passObj.exp,
          hp: passObj.hp,
          mp: passObj.mp,
          itemName: passObj.itemName,
          flag: passObj.flag
        },
        failPenalty: {
          coins: failObj.coins,
          hp: failObj.hp,
          mp: failObj.mp,
          flag: failObj.flag
        }
      });
      return makeMsg(base, 0, idx);
    }

    return null;
  }

  function serializeSysWindowToTag(msg) {
    if (!msg || !msg.systemConfig) return '';
    const c = normalizeConfig(msg);
    if (c.cardStyle === 'canvas' || c.syncWithStoryRpg || c.unlockReq || (c.rpgLink && c.rpgLink.enabled)) {
      return `[SYSWINDOW: ${JSON.stringify(c)}]`;
    }
    const mods = [];
    const defPreset = PRESETS.find(p => p.id === c.presetId);
    if (c.themeId && (!defPreset || c.themeId !== defPreset.config.themeId) && c.themeId !== 'custom') {
      mods.push(`theme=${c.themeId}`);
    }
    if (c.frameStyle && (!defPreset || c.frameStyle !== defPreset.config.frameStyle)) {
      mods.push(`frame=${c.frameStyle}`);
    }
    if (c.svgIcon && (!defPreset || c.svgIcon !== defPreset.config.svgIcon)) {
      mods.push(`icon=${c.svgIcon}`);
    }
    if (c.stampText && (!defPreset || c.stampText !== defPreset.config.stampText)) {
      mods.push(`stamp=${c.stampText}`);
    }
    const modSuffix = mods.length ? ' | ' + mods.join(' | ') : '';

    if (c.presetId === 'levelup') {
      const boostStr = c.statBoosts.map(sb => `${sb.label} ${sb.delta}`).join(', ');
      const parts = [c.levelTransition || c.headerTitle];
      if (c.unlockedAbility) parts.push(c.unlockedAbility.replace(/^⚡\s*/, ''));
      if (boostStr) parts.push(boostStr);
      return `[SYS_LEVELUP: ${parts.join(' | ')}${modSuffix}]`;
    }
    if (c.presetId === 'inventory' && c.inventoryItems.length > 0) {
      const itemsStr = c.inventoryItems.map(it => {
        const tags = [it.rarity.toUpperCase()];
        if (it.qty && it.qty !== '1' && it.qty.toUpperCase() !== it.rarity.toUpperCase()) tags.push(it.qty);
        if (it.equipped) tags.push('EQUIPPED');
        if (it.locked) tags.push('LOCKED');
        if (it.unlockReq) tags.push(`REQ:${it.unlockReq}`);
        return `${it.name} (${tags.join(', ')})`;
      }).join(', ');
      return `[SYS_INVENTORY: ${c.currencyText || '0 G'} | ${itemsStr}${modSuffix}]`;
    }
    if (c.presetId === 'shop' && c.shopItems.length > 0) {
      const itemsStr = c.shopItems.map(sp => {
        const tags = [sp.locked ? (sp.price || 'LOCKED') : sp.price, sp.rarity.toUpperCase()];
        if (sp.owned) tags.push('OWNED');
        if (sp.unlockReq && !(sp.price || '').toUpperCase().includes(sp.unlockReq.toUpperCase())) tags.push(`REQ:${sp.unlockReq}`);
        return `${sp.name} (${tags.join(', ')})`;
      }).join(', ');
      return `[SYS_SHOP: ${c.headerTitle} | ${c.currencyText || '0 G'} | ${itemsStr}${modSuffix}]`;
    }
    if (c.presetId === 'questboard' && c.bars.length > 0) {
      const goalsStr = c.bars.map(b => `${b.label} ${(b.displayText || `${b.value}/100`).replace(/\s*\/\s*/, '/')}`).join(', ');
      return `[SYS_QUESTBOARD: ${c.headerTitle} | ${c.headerBadge || 'DAILY'} | ${goalsStr}${modSuffix}]`;
    }
    if (c.presetId === 'shadowarmy' && c.inventoryItems.length > 0) {
      const soldiersStr = c.inventoryItems.map(it => {
        const tags = [it.rarity.toUpperCase()];
        if (it.equipped) tags.push('EQUIPPED');
        if (it.locked) tags.push('LOCKED');
        return `${it.name} (${tags.join(', ')})`;
      }).join(', ');
      return `[SYS_SHADOWARMY: ${c.headerTitle} | ${c.currencyText || 'SHADOWS'} | ${soldiersStr}${modSuffix}]`;
    }
    if (c.presetId === 'timer' && c.timerEnabled) {
      return `[SYS_TIMER: ${c.timerSeconds}s | ${c.headerTitle} | ${(c.bodyText || '').replace(/\n/g, ' ')}${modSuffix}]`;
    }
    if (c.presetId === 'loading' && c.bars.length === 1) {
      return `[SYS_LOADING: ${c.headerTitle} | ${c.bars[0].value}% | ${(c.bodyText || '').replace(/\n/g, ' ')}${modSuffix}]`;
    }
    if (c.presetId === 'constellation') {
      return `[SYS_CONSTELLATION: ${c.headerTitle} | ${c.headerBadge || '+500 Coins'} | ${(c.bodyText || '').replace(/\n/g, ' ')}${modSuffix}]`;
    }
    if (c.presetId === 'affection' && c.bars.length > 0) {
      const name = c.mediaCaption || c.headerTitle.replace(/\s*—\s*AFFECTION$/i, '');
      const b = c.bars[0];
      return `[SYS_AFFECTION: ${name} | ${b.fromValue}->${b.value} | ${(c.bodyText || '').replace(/\n/g, ' ')}${modSuffix}]`;
    }
    if (c.presetId === 'status' && !c.mediaUrl?.startsWith('data:')) {
      const name = c.mediaCaption || c.headerTitle.replace(/\s*—\s*STATUS$/i, '');
      const barSegs = c.bars.map(b => `${b.label}:${b.value}`);
      const statSeg = c.stats.length ? c.stats.map(s => `${s.label}:${s.value}`).join(', ') : '';
      return `[SYS_STATUS: ${[name, c.headerBadge, ...barSegs, statSeg].filter(Boolean).join(' | ')}${modSuffix}]`;
    }
    if (c.presetId === 'item' && !c.mediaUrl?.startsWith('data:')) {
      const statSeg = c.stats.map(s => `${s.label}:${s.value}`).join(', ');
      return `[SYS_ITEM: ${[c.headerTitle, c.headerBadge, statSeg, (c.bodyText || '').replace(/\n/g, ' ')].filter(Boolean).join(' | ')}${modSuffix}]`;
    }
    if ((c.cardStyle === 'relic' || String(c.presetId || '').startsWith('relic')) && !c.mediaUrl?.startsWith('data:') && !c.customIconData && !c.customFrameSvg) {
      return `[SYS_RELIC: ${[c.headerTitle, c.subtitle, (c.bodyText || '').replace(/\n/g, '\\n')].filter(Boolean).join(' | ')}${modSuffix}]`;
    }
    if ((c.cardStyle === 'codex' || c.presetId === 'codex') && !c.mediaUrl?.startsWith('data:') && !c.customIconData && !c.customFrameSvg) {
      return `[SYS_CODEX: ${[c.headerTitle, (c.bodyText || '').replace(/\n/g, '\\n')].filter(Boolean).join(' | ')}${modSuffix}]`;
    }

    return `[SYSWINDOW: ${JSON.stringify(c)}]`;
  }

  /* --------------------------------------------------------------------------
     VISUAL SYSTEM WINDOW BUILDER MODAL STATE & RENDERER
     -------------------------------------------------------------------------- */
  let builderDraft = getDefaultConfig();
  let builderEditingMsgId = null;
  let builderActiveTab = 'presets';
  let builderHoldMs = 1900;
  let builderSvgFilter = 'all';

  function ensureBuilderModalDom() {
    if (document.getElementById('systemWindowBuilderModal')) return;
    const div = document.createElement('div');
    div.className = 'modal-backdrop';
    div.id = 'systemWindowBuilderModal';
    div.style.zIndex = '10030';
    div.innerHTML = `
      <div class="modal-window syswin-builder-window">
        <div class="modal-header" style="padding:10px 14px; border-bottom:1px solid #1e293b;">
          <div style="display:flex; align-items:center; gap:8px;">
            <button type="button" class="modal-back-btn" onclick="navigateModalBack()" title="Back">← Back</button>
            <span class="modal-title" id="sysWinModalTitle" style="font-size:14px; font-weight:900; color:#f8fafc;">🖥️ Manhwa System Studio</span>
          </div>
          <button type="button" class="modal-close-btn" onclick="closeSystemWindowBuilder()">✕</button>
        </div>

        <div class="syswin-preview-stage">
          <div style="display:flex; width:100%; justify-content:space-between; align-items:center; font-size:10.5px; color:#94a3b8;">
            <span style="font-weight:800; letter-spacing:0.6px; text-transform:uppercase;">⚡ Live Window Preview</span>
            <button type="button" class="syswin-chip-btn" style="padding:3px 9px; font-size:10.5px;" onclick="window.ChatHubSystemWindows.replayPreviewFx()">🔊 Test Animation & SFX</button>
          </div>
          <div id="sysWinPreviewHost" style="width:100%; display:flex; justify-content:center; flex-shrink:0;"></div>
        </div>

        <div class="syswin-tabs">
          <button type="button" class="syswin-tab-btn active" id="sysTabBtn_presets" onclick="window.ChatHubSystemWindows.switchTab('presets')">📋 Templates</button>
          <button type="button" class="syswin-tab-btn" id="sysTabBtn_content" onclick="window.ChatHubSystemWindows.switchTab('content')">📝 Text & Images</button>
          <button type="button" class="syswin-tab-btn" id="sysTabBtn_blocks" onclick="window.ChatHubSystemWindows.switchTab('blocks')">🧩 Stats, Shop & Inv</button>
          <button type="button" class="syswin-tab-btn" id="sysTabBtn_style" onclick="window.ChatHubSystemWindows.switchTab('style')">🎨 Theme & FX</button>
          <button type="button" class="syswin-tab-btn" id="sysTabBtn_layers" onclick="window.ChatHubSystemWindows.switchTab('layers')">🧱 Layers</button>
        </div>

        <div class="syswin-body" id="sysWinBuilderBody">
          <div class="syswin-tab-panel active" id="sysTabPanel_presets">
            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:6px;">
              <span style="font-size:11px; color:#94a3b8; font-weight:700;">Choose any of 24 Manhwa Windows & Ornate Relic Cards (100% editable):</span>
              <div style="display:flex; gap:5px; flex-wrap:wrap;">
                <button type="button" class="syswin-chip-btn" style="border-color:#fde047; color:#fde047;" onclick="window.ChatHubSystemWindows.newCleanRelicCard()">🔮 + New Blank Relic</button>
                <button type="button" class="syswin-chip-btn" style="border-color:#38bdf8; color:#38bdf8;" onclick="window.ChatHubSystemWindows.newBlankCanvasCard()">🎨 + New Blank Canvas</button>
              </div>
            </div>
            <div class="syswin-preset-grid" id="sysWinPresetGrid"></div>
            <div style="margin-top:6px; border-top:1px solid #1e293b; padding-top:8px;">
              <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:6px; margin-bottom:6px;">
                <span style="font-size:11.5px; font-weight:800; color:#e2e8f0;">💾 My Saved Custom Styles</span>
                <div style="display:flex; gap:5px; align-items:center;">
                  <input type="text" class="syswin-input" id="sysNewPresetNameInput" placeholder="Style name..." style="width:125px; padding:4px 8px; font-size:11px;">
                  <button type="button" class="syswin-chip-btn" onclick="window.ChatHubSystemWindows.saveCurrentAsPersonalPreset()">+ Save Style</button>
                </div>
              </div>
              <div id="sysWinSavedPresetsList" style="display:flex; flex-direction:column; gap:6px;"></div>
            </div>
          </div>

          <div class="syswin-tab-panel" id="sysTabPanel_content">
            <div class="syswin-field-row">
              <div>
                <label class="syswin-label">Header Title</label>
                <input type="text" class="syswin-input" id="sysInpHeaderTitle" placeholder="SYSTEM QUEST ALERT">
              </div>
              <div style="display:grid; grid-template-columns:56px 1fr 1fr; gap:5px;">
                <div>
                  <label class="syswin-label">Icon</label>
                  <input type="text" class="syswin-input" id="sysInpHeaderIcon" placeholder="❖">
                </div>
                <div>
                  <label class="syswin-label">Badge</label>
                  <input type="text" class="syswin-input" id="sysInpHeaderBadge" placeholder="[S-RANK]">
                </div>
                <div>
                  <label class="syswin-label">Coins / G</label>
                  <input type="text" class="syswin-input" id="sysInpCurrency" placeholder="🪙 100 G">
                </div>
              </div>
            </div>
            <div class="syswin-field-row">
              <div>
                <label class="syswin-label">Subtitle / OS Tag</label>
                <input type="text" class="syswin-input" id="sysInpSubtitle" placeholder="System OS v4.2">
              </div>
              <div>
                <label class="syswin-label">Footer Note</label>
                <input type="text" class="syswin-input" id="sysInpFooter" placeholder="Click to edit">
              </div>
            </div>
            <div>
              <label class="syswin-label">Body Narrative / Message</label>
              <textarea rows="2" class="syswin-textarea" id="sysInpBodyText" placeholder="Enter alert details, lore, item effect, or system command..."></textarea>
            </div>

            <div style="background:#131c31; border:1px solid #293548; border-radius:10px; padding:10px; display:flex; flex-direction:column; gap:8px;">
              <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:6px;">
                <span style="font-size:12px; font-weight:800; color:#38bdf8;">🖼️ Attach Image / Character / Item Icon</span>
                <div style="display:flex; gap:5px; flex-wrap:wrap;">
                  <input type="file" id="sysWinImageFileInput" accept="image/*" style="display:none;">
                  <button type="button" class="syswin-chip-btn" onclick="document.getElementById('sysWinImageFileInput').click()">📁 Upload PNG/GIF</button>
                  <button type="button" class="syswin-chip-btn" style="border-color:#c084fc; color:#e9d5ff;" onclick="window.ChatHubSystemWindows.stripCurrentImageBg()" title="Auto-strip dark or white box background from current image/badge">🪄 Remove BG</button>
                  <button type="button" class="syswin-chip-btn" onclick="window.ChatHubSystemWindows.clearImage()">✕ Clear</button>
                </div>
              </div>
              <div class="syswin-field-row">
                <div>
                  <label class="syswin-label">Image Layout Style</label>
                  <select class="syswin-select" id="sysSelMediaLayout">
                    <option value="none">No Image</option>
                    <option value="portrait_left">Portrait Left + Stats Right</option>
                    <option value="icon_title">Square Icon Next to Content</option>
                    <option value="banner_top">Wide Showcase Banner (Top)</option>
                    <option value="circle_halo">Circular Avatar + Glow Halo</option>
                  </select>
                </div>
                <div>
                  <label class="syswin-label">Image Caption</label>
                  <input type="text" class="syswin-input" id="sysInpMediaCaption" placeholder="e.g. KAITO [LV.42]">
                </div>
              </div>
              <div>
                <label class="syswin-label">Direct Image URL (or pick from Studio Cast / Assets below)</label>
                <input type="text" class="syswin-input" id="sysInpMediaUrl" placeholder="assets/characters/... or https://...">
              </div>
              <div class="syswin-media-picker-strip" id="sysWinMediaPickerStrip"></div>
            </div>

            <div style="background:#0f172a; border:1px solid #1e3a5f; border-radius:10px; padding:10px; display:flex; flex-direction:column; gap:7px;">
              <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:6px;">
                <span style="font-size:12px; font-weight:800; color:#facc15;">✨ Neon Vector & Relic Icons (36+ Built-In & Custom)</span>
                <div style="display:flex; gap:5px; flex-wrap:wrap;">
                  <button type="button" class="syswin-chip-btn" style="border-color:#4ade80; color:#4ade80;" onclick="window.ChatHubSystemWindows.toggleCustomIconDrawer()">+ Add Own Icon</button>
                  <button type="button" class="syswin-chip-btn" id="sysBtnDelSelectedSvg" style="display:none; border-color:#f87171; color:#fca5a5;" onclick="window.ChatHubSystemWindows.deleteSelectedCustomIcon()" title="Delete selected custom badge from your library">🗑️ Delete Badge</button>
                  <button type="button" class="syswin-chip-btn" id="sysBtnClearCustomSvgs" style="display:none; border-color:#fb923c; color:#fdba74;" onclick="window.ChatHubSystemWindows.clearAllUserCustomIcons()" title="Delete all uploaded custom badges">🧹 Clear Uploads</button>
                  <button type="button" class="syswin-chip-btn" onclick="window.ChatHubSystemWindows.selectSvgIcon('')" title="Remove badge/icon from preview card">✕ None</button>
                </div>
              </div>
              <div class="syswin-chip-row" id="sysWinSvgFilterRow">
                <button type="button" class="syswin-chip-btn active" data-svg-filter="all" onclick="window.ChatHubSystemWindows.setSvgFilter('all')">All</button>
                <button type="button" class="syswin-chip-btn" data-svg-filter="relic" onclick="window.ChatHubSystemWindows.setSvgFilter('relic')">🔮 Relic & Skills</button>
                <button type="button" class="syswin-chip-btn" data-svg-filter="codex" onclick="window.ChatHubSystemWindows.setSvgFilter('codex')">📘 Codex & Diagrams</button>
                <button type="button" class="syswin-chip-btn" data-svg-filter="custom" onclick="window.ChatHubSystemWindows.setSvgFilter('custom')">⭐ My Custom</button>
              </div>
              <div class="syswin-chip-row">
                <label class="syswin-chip-btn" title="Hide outer icon box border & backdrop so only the glowing icon floats on your template"><input type="checkbox" id="sysChkIconSeamless"> 🫥 No Box Behind Icon</label>
                <label class="syswin-chip-btn" title="Screen-blend dark/black PNG backgrounds straight onto your template color & scanlines"><input type="checkbox" id="sysChkIconBlendDark"> 🌌 Dissolve Black PNG BG</label>
              </div>
              <div class="syswin-custom-icon-maker" id="sysCustomIconDrawer">
                <div style="font-size:11px; font-weight:800; color:#38bdf8;">⚡ Create Neon Badge Icon OR Upload SVG / Transparent Icon</div>
                <div class="syswin-field-row">
                  <input type="text" class="syswin-input" id="sysNewIconLabel" placeholder="Name (e.g. Poison Fang)">
                  <div style="display:grid; grid-template-columns:1fr 1fr 44px; gap:5px;">
                    <input type="text" class="syswin-input" id="sysNewIconGlyph" placeholder="Emoji/Text (☠️, SSS)" maxlength="4">
                    <select class="syswin-select" id="sysNewIconShape">
                      <option value="hex">Hexagon</option>
                      <option value="circle">Circle</option>
                      <option value="diamond">Diamond</option>
                      <option value="shield">Shield</option>
                    </select>
                    <input type="color" id="sysNewIconColor" value="#00f0ff" style="width:44px; height:32px; border:none; background:none; cursor:pointer;">
                  </div>
                </div>
                <div style="display:flex; gap:6px; flex-wrap:wrap; align-items:center;">
                  <button type="button" class="syswin-chip-btn" style="border-color:#00f0ff; color:#00f0ff;" onclick="window.ChatHubSystemWindows.createCustomBadgeIcon()">✨ Save Neon Badge</button>
                  <input type="file" id="sysNewIconFileInput" accept=".svg,image/svg+xml,image/png,image/jpeg,image/webp,image/gif" multiple style="display:none;">
                  <button type="button" class="syswin-chip-btn" onclick="document.getElementById('sysNewIconFileInput').click()">📁 Upload .SVG / Icon PNG</button>
                  <label class="syswin-chip-btn" style="color:#a5f3fc; border-color:#0891b2;" title="Automatically converts solid black/dark or white PNG backgrounds to transparency"><input type="checkbox" id="sysChkNewIconRemoveBg" checked> 🪄 Auto-Remove BG</label>
                </div>
                <div style="display:flex; gap:6px; align-items:center;">
                  <input type="text" class="syswin-input" id="sysNewIconSvgInput" placeholder="Or paste <svg>...</svg> code here...">
                  <button type="button" class="syswin-chip-btn" style="white-space:nowrap;" onclick="window.ChatHubSystemWindows.createCustomRawSvgIcon()">+ Save SVG</button>
                </div>
              </div>
              <div class="syswin-svg-picker-grid" id="sysWinSvgPickerGrid"></div>
            </div>
          </div>

          <div class="syswin-tab-panel" id="sysTabPanel_blocks">
            <div style="background:#131c31; border:1px solid #293548; border-radius:8px; padding:8px; display:flex; flex-direction:column; gap:6px;">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <span style="font-size:11.5px; font-weight:900; color:#4ade80;">📈 Level-Up, New Ability & +Stat Gains</span>
                <button type="button" class="syswin-chip-btn" onclick="window.ChatHubSystemWindows.addStatBoost()">+ Add +Stat</button>
              </div>
              <div class="syswin-field-row">
                <input type="text" class="syswin-input" id="sysInpLevelJump" placeholder="Level Jump (e.g. LV. 12 ➔ LV. 13)">
                <input type="text" class="syswin-input" id="sysInpUnlockedAbility" placeholder="New Ability (e.g. ⚡ Shadow Extraction)">
              </div>
              <div class="syswin-block-list" id="sysWinBoostsList"></div>
            </div>

            <div style="display:flex; justify-content:space-between; align-items:center;">
              <span style="font-size:11.5px; font-weight:900; color:#38bdf8;">🎒 Inventory / Shadow Army Grid Slots</span>
              <button type="button" class="syswin-chip-btn" onclick="window.ChatHubSystemWindows.addInventoryItem()">+ Add Slot</button>
            </div>
            <div class="syswin-block-list" id="sysWinInvList"></div>

            <div style="display:flex; justify-content:space-between; align-items:center; gap:6px; flex-wrap:wrap;">
              <span style="font-size:11.5px; font-weight:900; color:#facc15;">🪙 System Coin Shop Items</span>
              <div style="display:flex; gap:5px; align-items:center;">
                <select class="syswin-select" id="sysSelShopLayout" style="width:auto; padding:3px 7px; font-size:11px;" title="Shop Layout Style">
                  <option value="rows">Holographic Rows</option>
                  <option value="grid">2-Col Relic Grid</option>
                </select>
                <button type="button" class="syswin-chip-btn" onclick="window.ChatHubSystemWindows.addShopItem()">+ Add Shop Item</button>
              </div>
            </div>
            <div class="syswin-block-list" id="sysWinShopList"></div>

            <div style="display:flex; justify-content:space-between; align-items:center;">
              <span style="font-size:11.5px; font-weight:900; color:#e2e8f0;">📊 Progress / HP / Loading / Affection Bars</span>
              <button type="button" class="syswin-chip-btn" onclick="window.ChatHubSystemWindows.addBar()">+ Add Bar</button>
            </div>
            <div class="syswin-block-list" id="sysWinBarsList"></div>

            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:2px; gap:6px; flex-wrap:wrap;">
              <span style="font-size:11.5px; font-weight:900; color:#e2e8f0;">🔢 Status Style &amp; Stat Grid</span>
              <div style="display:flex; gap:5px; align-items:center;">
                <select class="syswin-select" id="sysSelStatusLayout" style="width:auto; padding:3px 7px; font-size:11px;" title="Player Status Window Layout">
                  <option value="sheet">Solo Leveling Sheet</option>
                  <option value="compact">2-Col Hologram Table</option>
                </select>
                <select class="syswin-select" id="sysSelStatsCols" style="width:auto; padding:3px 7px; font-size:11px;">
                  <option value="1">1 Col</option>
                  <option value="2">2 Cols</option>
                  <option value="3">3 Cols</option>
                </select>
                <button type="button" class="syswin-chip-btn" onclick="window.ChatHubSystemWindows.addStat()">+ Add Stat</button>
              </div>
            </div>
            <div class="syswin-block-list" id="sysWinStatsList"></div>

            <div class="syswin-field-row" style="margin-top:2px;">
              <div>
                <label class="syswin-label">Trait / Tag Pills (comma-separated)</label>
                <input type="text" class="syswin-input" id="sysInpPills" placeholder="Shadow Step, Untradable">
              </div>
              <div>
                <label class="syswin-label">Action Buttons (neutral until tapped, separated by |)</label>
                <input type="text" class="syswin-input" id="sysInpButtons" placeholder="✔ ACCEPT | ✖ DECLINE">
              </div>
            </div>

            <div class="syswin-field-row">
              <div style="background:#131c31; border:1px solid #293548; border-radius:8px; padding:8px; display:flex; flex-direction:column; gap:6px;">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                  <label style="display:flex; align-items:center; gap:6px; font-size:11px; font-weight:800; color:#f8fafc; cursor:pointer;">
                    <input type="checkbox" id="sysChkTimer"> ⏱️ Dynamic Timer
                  </label>
                  <div style="display:flex; gap:3px;">
                    <button type="button" class="syswin-chip-btn" style="padding:2px 6px; font-size:9.5px;" onclick="window.ChatHubSystemWindows.setQuickTimer(10)">10s Shorts</button>
                    <button type="button" class="syswin-chip-btn" style="padding:2px 6px; font-size:9.5px;" onclick="window.ChatHubSystemWindows.setQuickTimer(60)">60s</button>
                    <button type="button" class="syswin-chip-btn" style="padding:2px 6px; font-size:9.5px;" onclick="window.ChatHubSystemWindows.setQuickTimer(300)">5m</button>
                  </div>
                </div>
                <div style="display:grid; grid-template-columns:1fr 75px; gap:6px;">
                  <input type="text" class="syswin-input" id="sysInpTimerLabel" placeholder="PENALTY IN">
                  <input type="number" class="syswin-input" id="sysInpTimerSeconds" min="0" max="86400" placeholder="12">
                </div>
              </div>

              <div style="background:#131c31; border:1px solid #293548; border-radius:8px; padding:8px; display:flex; flex-direction:column; gap:6px;">
                <label class="syswin-label" style="margin:0;">🏷️ Diagonal Overlay Seal Stamp</label>
                <div style="display:grid; grid-template-columns:1fr 44px; gap:6px;">
                  <input type="text" class="syswin-input" id="sysInpStampText" placeholder="COMPLETED / LEVEL UP! / PENALTY">
                  <input type="color" id="sysInpStampColor" value="#facc15" style="width:44px; height:32px; border:none; background:none; cursor:pointer;">
                </div>
              </div>
            </div>

            <div class="syswin-rpg-box" id="sysWinRpgPanel"></div>
          </div>

          <div class="syswin-tab-panel" id="sysTabPanel_style">
            <div>
              <label class="syswin-label">One-Click Manhwa OS Theme</label>
              <div class="syswin-chip-row" id="sysWinThemesRow"></div>
            </div>
            <div style="background:#0f172a; border:1px solid #1e3a5f; border-radius:10px; padding:10px; display:flex; flex-direction:column; gap:7px;">
              <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:6px;">
                <span style="font-size:12px; font-weight:800; color:#fde047;">🖼️ Ornate Card Frame (17 Built-In & Custom Vector Borders)</span>
                <button type="button" class="syswin-chip-btn" style="border-color:#4ade80; color:#4ade80;" onclick="window.ChatHubSystemWindows.toggleCustomFrameDrawer()">+ Add Own Frame</button>
              </div>
              <div class="syswin-custom-icon-maker" id="sysCustomFrameDrawer">
                <div style="font-size:11px; font-weight:800; color:#38bdf8;">✨ Create Procedural DEVOUR-Style Frame OR Upload Custom &lt;svg&gt; Frame</div>
                <div class="syswin-field-row">
                  <input type="text" class="syswin-input" id="sysNewFrameLabel" placeholder="Frame Name (e.g. Abyssal Vine)">
                  <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:5px;">
                    <select class="syswin-select" id="sysNewFrameMotif">
                      <option value="thorn">🔥 Spiky Thorns</option>
                      <option value="crown">👑 Demon Crown</option>
                      <option value="wings">🪽 Seraph Wings</option>
                      <option value="crystal">❄️ Frost Shards</option>
                      <option value="chains">⛓️ Blood Chains</option>
                      <option value="lotus">🪷 Murim Lotus</option>
                    </select>
                    <select class="syswin-select" id="sysNewFrameDensity">
                      <option value="medium">Medium Spikes</option>
                      <option value="high">Intense Spikes</option>
                      <option value="low">Clean Minimal</option>
                    </select>
                    <select class="syswin-select" id="sysNewFrameColorMode">
                      <option value="theme">Match Card Theme</option>
                      <option value="custom">Fixed Colors</option>
                    </select>
                  </div>
                </div>
                <div style="display:flex; gap:6px; align-items:center; flex-wrap:wrap;">
                  <button type="button" class="syswin-chip-btn" style="border-color:#fde047; color:#fde047;" onclick="window.ChatHubSystemWindows.createCustomGeneratedFrame()">✨ Generate Ornate Frame</button>
                  <input type="file" id="sysNewFrameFileInput" accept=".svg,image/svg+xml" style="display:none;">
                  <button type="button" class="syswin-chip-btn" onclick="document.getElementById('sysNewFrameFileInput').click()">📁 Upload .SVG Frame</button>
                </div>
                <div style="display:flex; gap:6px; align-items:center;">
                  <input type="text" class="syswin-input" id="sysNewFrameSvgInput" placeholder="Or paste hollow <svg viewBox='0 0 320 400'>...</svg> border...">
                  <button type="button" class="syswin-chip-btn" style="white-space:nowrap;" onclick="window.ChatHubSystemWindows.createCustomRawSvgFrame()">+ Save SVG</button>
                </div>
              </div>
              <div class="syswin-frame-picker-grid" id="sysWinFramePickerGrid"></div>
            </div>
            <div class="syswin-field-row">
              <div>
                <label class="syswin-label">Frame Geometry Selector</label>
                <select class="syswin-select" id="sysSelFrameStyle">
                  <option value="none">⬜ None (Borderless)</option>
                  <option value="tech_brackets">Tech L-Brackets (Solo Hunter)</option>
                  <option value="cyber_bevel">Cut-Corner Cyber Plate</option>
                  <option value="imperial_ornate">Ornate Imperial / Murim</option>
                  <option value="demonic_thorn">🔥 DEVOUR Organic Thorn & Vine (SVG)</option>
                  <option value="void_seraph">🪽 Celestial Seraph Wings (SVG)</option>
                  <option value="abyssal_crown">👑 Sovereign Demon Crown (SVG)</option>
                  <option value="frost_monarch">❄️ Frost Monarch Crystal (SVG)</option>
                  <option value="necromancer_rib">💀 Necromancer Bone Scythe (SVG)</option>
                  <option value="divine_lotus">🪷 Immortal Murim Lotus (SVG)</option>
                  <option value="blueprint_double">📐 Twin-Line Blueprint Codex</option>
                  <option value="celestial_arcane">⚜️ Celestial Archangel Halo (SVG)</option>
                  <option value="cursed_chains">⛓️ Cursed Blood Chains (SVG)</option>
                  <option value="cyber_circuit">🧬 Holo Circuit Trace (SVG)</option>
                  <option value="dragon_scroll">🐉 Murim Imperial Dragon (SVG)</option>
                  <option value="glitch_corrupted">Corrupted Glitch Frame</option>
                  <option value="glass_hud">Glassmorphic Minimal HUD</option>
                  <option value="comic_ink">Bold Comic Ink Box</option>
                </select>
              </div>
              <div>
                <label class="syswin-label">Typography Mood</label>
                <select class="syswin-select" id="sysSelFontStyle">
                  <option value="hud">Sci-Fi HUD Geometric</option>
                  <option value="manhwa">Clean Modern Manhwa</option>
                  <option value="serif">Royal Serif (Otome / Murim)</option>
                  <option value="mono">Hacker Terminal Monospace</option>
                  <option value="cinzel">Imperial Fantasy (Cinzel)</option>
                  <option value="impact">Action Manhwa Bold</option>
                  <option value="gothic">Dark Abyssal Gothic</option>
                  <option value="runic">Arcane Runic Serif</option>
                </select>
              </div>
            </div>
            <div>
              <label class="syswin-label">Card Layout Archetype</label>
              <div style="display:flex; gap:6px; align-items:center; flex-wrap:wrap;">
                <select class="syswin-select" id="sysSelCardStyle" style="flex:1; min-width:210px;">
                  <option value="standard">Standard Manhwa HUD Window</option>
                  <option value="relic">🔮 Centered Relic / Skill Emblem Card (DEVOUR Style)</option>
                  <option value="codex">📘 System Codex Diagram + Rule Card (Interverse Style)</option>
                  <option value="canvas">🎨 Free Layer Canvas Mode (Canva Drag/Resize)</option>
                </select>
                <button type="button" class="syswin-chip-btn" style="border-color:#fde047; color:#fde047; white-space:nowrap;" onclick="window.ChatHubSystemWindows.convertToCleanRelicMode()" title="Hide header bar, remove buttons/stats & enable DEVOUR sunburst + sparkles">🧹 Pure DEVOUR Setup</button>
              </div>
            </div>
            <div style="display:grid; grid-template-columns:repeat(4, minmax(0, 1fr)); gap:8px;">
              <div>
                <label class="syswin-label">Accent</label>
                <input type="color" id="sysInpAccentColor" value="#00f0ff" style="width:100%; height:34px; border:none; border-radius:6px; background:#0f172a; cursor:pointer;">
              </div>
              <div>
                <label class="syswin-label">Secondary</label>
                <input type="color" id="sysInpSecondaryColor" value="#38bdf8" style="width:100%; height:34px; border:none; border-radius:6px; background:#0f172a; cursor:pointer;">
              </div>
              <div>
                <label class="syswin-label">Bg Fill</label>
                <input type="color" id="sysInpBgColor" value="#041226" style="width:100%; height:34px; border:none; border-radius:6px; background:#0f172a; cursor:pointer;">
              </div>
              <div>
                <label class="syswin-label">Bg Opacity</label>
                <input type="range" id="sysInpBgOpacity" min="0.4" max="1" step="0.02" value="0.94" style="width:100%; margin-top:8px;">
              </div>
            </div>
            <div class="syswin-chip-row" style="padding:6px 0;">
              <label class="syswin-chip-btn"><input type="checkbox" id="sysChkScanlines"> Scanlines</label>
              <label class="syswin-chip-btn"><input type="checkbox" id="sysChkGrid"> Tactical Grid</label>
              <label class="syswin-chip-btn"><input type="checkbox" id="sysChkSparkles"> Sparkles</label>
              <label class="syswin-chip-btn"><input type="checkbox" id="sysChkStarburst"> Starburst Rays</label>
              <label class="syswin-chip-btn"><input type="checkbox" id="sysChkHideHeader"> Hide Header Bar</label>
            </div>

            <div style="background:#0f172a; border:1px solid #1e3a5f; border-radius:10px; padding:10px; display:flex; flex-direction:column; gap:7px;">
              <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:6px;">
                <span style="font-size:12px; font-weight:800; color:#38bdf8;">🖼️ Full Card Background Image</span>
                <div style="display:flex; gap:5px; flex-wrap:wrap;">
                  <input type="file" id="sysWinCardBgFileInput" accept="image/*" style="display:none;">
                  <button type="button" class="syswin-chip-btn" onclick="document.getElementById('sysWinCardBgFileInput').click()">📁 Upload BG</button>
                  <button type="button" class="syswin-chip-btn" onclick="window.ChatHubSystemWindows.clearCardBgImage()">✕ Clear BG</button>
                </div>
              </div>
              <input type="text" class="syswin-input" id="sysInpCardBgImage" placeholder="Background image URL (assets/... or https://...)">
              <div style="display:grid; grid-template-columns:repeat(3, minmax(0, 1fr)); gap:8px;">
                <div>
                  <label class="syswin-label">BG Opacity <span id="sysLblCardBgOpacity" style="color:#38bdf8;">100%</span></label>
                  <input type="range" id="sysInpCardBgOpacity" min="0.1" max="1" step="0.05" value="1" style="width:100%;">
                </div>
                <div>
                  <label class="syswin-label">BG Blur <span id="sysLblCardBgBlur" style="color:#38bdf8;">0px</span></label>
                  <input type="range" id="sysInpCardBgBlur" min="0" max="20" step="1" value="0" style="width:100%;">
                </div>
                <div>
                  <label class="syswin-label">Brightness <span id="sysLblCardBgBrightness" style="color:#38bdf8;">100%</span></label>
                  <input type="range" id="sysInpCardBgBrightness" min="0.2" max="1.6" step="0.05" value="1" style="width:100%;">
                </div>
              </div>
              <div style="display:grid; grid-template-columns:80px 1fr; gap:8px; align-items:center;">
                <div>
                  <label class="syswin-label">Tint Color</label>
                  <input type="color" id="sysInpCardBgTint" value="#041226" style="width:100%; height:30px; border:none; border-radius:6px; background:#1e293b; cursor:pointer;">
                </div>
                <div>
                  <label class="syswin-label">Tint Opacity <span id="sysLblCardBgTintOpacity" style="color:#38bdf8;">35%</span></label>
                  <input type="range" id="sysInpCardBgTintOpacity" min="0" max="0.95" step="0.05" value="0.35" style="width:100%;">
                </div>
              </div>
            </div>

            <div style="background:#131c31; border:1px solid #293548; border-radius:10px; padding:10px; display:flex; flex-direction:column; gap:8px;">
              <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:6px;">
                <span style="font-size:12px; font-weight:800; color:#facc15;">✏️ Per-Element Typography, Glow & Stroke</span>
                <button type="button" class="syswin-chip-btn" onclick="window.ChatHubSystemWindows.resetElementStyle()">↺ Reset Element</button>
              </div>
              <div class="syswin-chip-row" id="sysElTargetTabs">
                <button type="button" class="syswin-chip-btn active" data-el-target="title" onclick="window.ChatHubSystemWindows.selectElementStyleTarget('title')">Title</button>
                <button type="button" class="syswin-chip-btn" data-el-target="subtitle" onclick="window.ChatHubSystemWindows.selectElementStyleTarget('subtitle')">Subtitle</button>
                <button type="button" class="syswin-chip-btn" data-el-target="body" onclick="window.ChatHubSystemWindows.selectElementStyleTarget('body')">Body</button>
                <button type="button" class="syswin-chip-btn" data-el-target="icons" onclick="window.ChatHubSystemWindows.selectElementStyleTarget('icons')">Icons</button>
              </div>
              <div class="syswin-field-row">
                <div>
                  <label class="syswin-label">Font Family (Preset / Uploaded)</label>
                  <select class="syswin-select" id="sysSelElFontFamily"></select>
                </div>
                <div style="display:flex; flex-direction:column; justify-content:flex-end;">
                  <div style="display:flex; gap:5px; flex-wrap:wrap;">
                    <input type="file" id="sysWinCustomFontInput" accept=".ttf,.otf,.woff2,font/ttf,font/otf,font/woff2" style="display:none;">
                    <button type="button" class="syswin-chip-btn" style="border-color:#4ade80; color:#4ade80;" onclick="document.getElementById('sysWinCustomFontInput').click()">+ Upload Font (.ttf/.otf/.woff2)</button>
                    <button type="button" class="syswin-chip-btn" id="sysBtnDelCustomFont" style="display:none; border-color:#f87171; color:#fca5a5;" onclick="window.ChatHubSystemWindows.deleteSelectedCustomFont()">🗑️</button>
                  </div>
                </div>
              </div>
              <div style="display:grid; grid-template-columns:repeat(3, minmax(0, 1fr)); gap:8px;">
                <div>
                  <label class="syswin-label">Size <span id="sysLblElFontSize" style="color:#facc15;">auto</span></label>
                  <input type="range" id="sysInpElFontSize" min="0" max="42" step="1" value="0" style="width:100%;">
                </div>
                <div>
                  <label class="syswin-label">Glow <span id="sysLblElGlowBlur" style="color:#facc15;">auto</span></label>
                  <input type="range" id="sysInpElGlowBlur" min="0" max="30" step="1" value="0" style="width:100%;">
                </div>
                <div>
                  <label class="syswin-label">Stroke <span id="sysLblElStrokeWidth" style="color:#facc15;">0px</span></label>
                  <input type="range" id="sysInpElStrokeWidth" min="0" max="3" step="0.5" value="0" style="width:100%;">
                </div>
              </div>
              <div style="display:grid; grid-template-columns:repeat(3, minmax(0, 1fr)); gap:8px;">
                <div>
                  <label class="syswin-label">Text/Icon Color <a href="#" style="color:#94a3b8; font-weight:600;" onclick="event.preventDefault(); window.ChatHubSystemWindows.clearElementColor('color')">(reset)</a></label>
                  <input type="color" id="sysInpElColor" value="#ffffff" style="width:100%; height:30px; border:none; border-radius:6px; background:#0f172a; cursor:pointer;">
                </div>
                <div>
                  <label class="syswin-label">Glow Color <a href="#" style="color:#94a3b8; font-weight:600;" onclick="event.preventDefault(); window.ChatHubSystemWindows.clearElementColor('glowColor')">(reset)</a></label>
                  <input type="color" id="sysInpElGlowColor" value="#00f0ff" style="width:100%; height:30px; border:none; border-radius:6px; background:#0f172a; cursor:pointer;">
                </div>
                <div>
                  <label class="syswin-label">Stroke Color</label>
                  <input type="color" id="sysInpElStrokeColor" value="#020617" style="width:100%; height:30px; border:none; border-radius:6px; background:#0f172a; cursor:pointer;">
                </div>
              </div>
            </div>
            <div class="syswin-field-row">
              <div>
                <label class="syswin-label">Entrance Animation</label>
                <select class="syswin-select" id="sysSelAnimation">
                  <option value="hologram">Hologram Boot Unfold</option>
                  <option value="glitch">Glitch Snap-In</option>
                  <option value="unroll">Imperial Smooth Unroll</option>
                  <option value="impact">Screen Impact Shake</option>
                  <option value="pop">Comic Bounce Pop</option>
                </select>
              </div>
              <div>
                <label class="syswin-label">Audio Sound Effect</label>
                <select class="syswin-select" id="sysSelSfx">
                  <option value="scifi">⚡ Sci-Fi Chime</option>
                  <option value="sparkle">✨ Level-Up Sparkle</option>
                  <option value="vineboom">💥 Vineboom Drop</option>
                  <option value="sting">😱 Danger Sting</option>
                  <option value="sword">⚔️ Blade Slash</option>
                  <option value="boing">🤪 Comic Boing</option>
                  <option value="pop">💬 Crisp Pop</option>
                  <option value="">🔇 Muted</option>
                </select>
              </div>
            </div>
            <div class="syswin-field-row">
              <div>
                <label class="syswin-label">Neon Glow Strength</label>
                <select class="syswin-select" id="sysSelGlow">
                  <option value="high">High Neon Aura</option>
                  <option value="medium">Balanced Glow</option>
                  <option value="low">Subtle / Crisp Ink</option>
                </select>
              </div>
              <div>
                <label class="syswin-label">Cinema Hold Duration (seconds)</label>
                <input type="number" class="syswin-input" id="sysInpHoldSec" min="0.5" max="15" step="0.1" value="1.9">
              </div>
            </div>
          </div>

          <div class="syswin-tab-panel" id="sysTabPanel_layers">
            <div id="sysCanvasModeBanner" style="background:#0f172a; border:1px solid #1e3a5f; border-radius:10px; padding:10px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
              <div>
                <div style="font-size:12px; font-weight:900; color:#38bdf8;">🎨 Canva-Style Free Layer Canvas Mode</div>
                <div id="sysCanvasModeSub" style="font-size:10.5px; color:#94a3b8;">Assemble modular Background, Sparkles, Icons, Images, Borders & Text layers — drag, resize & rotate right on the preview!</div>
              </div>
              <div style="display:flex; gap:6px; flex-wrap:wrap;">
                <button type="button" class="syswin-chip-btn" id="sysBtnConvertToCanvas" style="border-color:#00f0ff; color:#00f0ff;" onclick="window.ChatHubSystemWindows.convertToCanvasMode()">🎨 Convert Card to Layers</button>
                <button type="button" class="syswin-chip-btn" style="border-color:#4ade80; color:#4ade80;" onclick="window.ChatHubSystemWindows.newBlankCanvasCard()">✨ Blank Canvas</button>
              </div>
            </div>

            <div id="sysCanvasEditorWrap" style="display:flex; flex-direction:column; gap:9px;">
              <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:6px;">
                <div class="syswin-chip-row">
                  <button type="button" class="syswin-chip-btn" onclick="window.ChatHubSystemWindows.addCanvasLayer('text')">+ Text</button>
                  <button type="button" class="syswin-chip-btn" onclick="window.ChatHubSystemWindows.addCanvasLayer('icon')">+ Icon</button>
                  <button type="button" class="syswin-chip-btn" onclick="window.ChatHubSystemWindows.addCanvasLayer('image')">+ Image</button>
                  <button type="button" class="syswin-chip-btn" onclick="window.ChatHubSystemWindows.addCanvasLayer('border')">+ Border</button>
                  <button type="button" class="syswin-chip-btn" onclick="window.ChatHubSystemWindows.addCanvasLayer('sparkles')">+ Sparkles</button>
                  <button type="button" class="syswin-chip-btn" onclick="window.ChatHubSystemWindows.addCanvasLayer('background')">+ BG</button>
                </div>
                <div style="display:flex; align-items:center; gap:6px;">
                  <label class="syswin-label" style="margin:0;">Height <span id="sysLblCanvasHeight" style="color:#38bdf8;">380px</span></label>
                  <input type="range" id="sysCanvasHeightInp" min="180" max="640" step="10" value="380" style="width:96px;">
                </div>
              </div>

              <div style="background:#090f20; border:1px solid #1e293b; border-radius:10px; padding:8px; display:flex; flex-direction:column; gap:6px;">
                <div style="font-size:11px; font-weight:800; color:#cbd5e1;">🧱 Layer Stack (Top = Frontmost)</div>
                <div class="syswin-layer-stack" id="sysCanvasLayerStack"></div>
              </div>

              <div id="sysCanvasLayerInspector" style="background:#131c31; border:1px solid #293548; border-radius:10px; padding:10px; display:flex; flex-direction:column; gap:8px;"></div>
            </div>
          </div>
        </div>

        <div class="modal-footer" style="padding:10px 14px; border-top:1px solid #1e293b; display:flex; justify-content:space-between; align-items:center; gap:8px; flex-wrap:wrap;">
          <button type="button" class="icon-btn danger" id="sysWinDeleteBtn" style="display:none; padding:8px 12px; font-size:12px; background:#7f1d1d; color:#fecaca;" onclick="window.ChatHubSystemWindows.deleteEditingWindow()">🗑️ Delete</button>
          <div style="display:flex; gap:8px; margin-left:auto;">
            <button type="button" class="btn-secondary-comic" style="padding:8px 14px; font-size:12px;" onclick="closeSystemWindowBuilder()">Cancel</button>
            <button type="button" class="btn-primary-comic" id="sysWinSaveBtn" style="padding:8px 18px; font-size:12.5px; font-weight:900;" onclick="window.ChatHubSystemWindows.commitWindow()">✨ Insert System Window</button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(div);
    bindBuilderDomEvents();
  }

  function refreshPreviewOnly() {
    const host = document.getElementById('sysWinPreviewHost');
    if (!host) return;
    host.innerHTML = '';
    host.appendChild(renderSystemWindowElement({ systemConfig: builderDraft }, { previewMode: true }));
  }

  function syncInputsFromDraft() {
    const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.value = val ?? ''; };
    const setChk = (id, val) => { const el = document.getElementById(id); if (el) el.checked = Boolean(val); };

    setVal('sysInpHeaderTitle', builderDraft.headerTitle);
    setVal('sysInpHeaderIcon', builderDraft.headerIcon);
    setVal('sysInpHeaderBadge', builderDraft.headerBadge);
    setVal('sysInpCurrency', builderDraft.currencyText);
    setVal('sysInpSubtitle', builderDraft.subtitle);
    setVal('sysInpFooter', builderDraft.footerText);
    setVal('sysInpBodyText', builderDraft.bodyText);

    setVal('sysInpLevelJump', builderDraft.levelTransition);
    setVal('sysInpUnlockedAbility', builderDraft.unlockedAbility);

    setVal('sysSelMediaLayout', builderDraft.mediaLayout || 'none');
    setVal('sysInpMediaCaption', builderDraft.mediaCaption || '');
    setVal('sysInpMediaUrl', builderDraft.mediaUrl || '');

    setVal('sysSelStatsCols', String(builderDraft.statsCols || 2));
    setVal('sysSelStatusLayout', builderDraft.statusLayout || 'sheet');
    setVal('sysSelShopLayout', builderDraft.shopLayout || 'rows');
    setVal('sysInpPills', (builderDraft.pills || []).join(', '));
    setVal('sysInpButtons', (builderDraft.buttons || []).map(b => b.label).join(' | '));
    setChk('sysChkTimer', builderDraft.timerEnabled);
    setVal('sysInpTimerLabel', builderDraft.timerLabel || 'TIME LEFT');
    setVal('sysInpTimerSeconds', builderDraft.timerSeconds ?? 12);
    setVal('sysInpStampText', builderDraft.stampText || '');
    setVal('sysInpStampColor', builderDraft.stampColor || '#facc15');

    setVal('sysSelFrameStyle', builderDraft.frameStyle || 'tech_brackets');
    setVal('sysSelFontStyle', builderDraft.fontStyle || 'hud');
    setVal('sysSelCardStyle', builderDraft.cardStyle || 'standard');
    setVal('sysCanvasHeightInp', builderDraft.canvasHeight || 380);
    setVal('sysInpAccentColor', builderDraft.accentColor || '#00f0ff');
    setVal('sysInpSecondaryColor', builderDraft.secondaryColor || '#38bdf8');
    setVal('sysInpBgColor', builderDraft.bgColor || '#041226');
    setVal('sysInpBgOpacity', builderDraft.bgOpacity ?? 0.94);
    setChk('sysChkScanlines', builderDraft.scanlines);
    setChk('sysChkGrid', builderDraft.gridPattern);
    setChk('sysChkSparkles', builderDraft.sparkles);
    setChk('sysChkStarburst', builderDraft.starburst);
    setChk('sysChkHideHeader', builderDraft.hideHeader);
    setChk('sysChkIconSeamless', builderDraft.iconSeamless);
    setChk('sysChkIconBlendDark', builderDraft.iconBlendDark);
    setVal('sysSelAnimation', builderDraft.animation || 'hologram');
    setVal('sysSelSfx', builderDraft.sfx !== undefined ? builderDraft.sfx : 'scifi');
    setVal('sysSelGlow', builderDraft.glowIntensity || 'high');
    setVal('sysInpHoldSec', (builderHoldMs / 1000).toFixed(1));
    setVal('sysInpCardBgImage', builderDraft.cardBgImage && String(builderDraft.cardBgImage).startsWith('data:') ? '(Uploaded Background Attached)' : (builderDraft.cardBgImage || ''));
    setVal('sysInpCardBgOpacity', builderDraft.cardBgOpacity ?? 1);
    setVal('sysInpCardBgBlur', builderDraft.cardBgBlur ?? 0);
    setVal('sysInpCardBgBrightness', builderDraft.cardBgBrightness ?? 1);
    setVal('sysInpCardBgTint', toHex6(builderDraft.cardBgTint, '#041226'));
    setVal('sysInpCardBgTintOpacity', builderDraft.cardBgTintOpacity ?? 0.35);
    const setTxt = (id, t) => { const el = document.getElementById(id); if (el) el.textContent = t; };
    setTxt('sysLblCardBgOpacity', Math.round((builderDraft.cardBgOpacity ?? 1) * 100) + '%');
    setTxt('sysLblCardBgBlur', (builderDraft.cardBgBlur ?? 0) + 'px');
    setTxt('sysLblCardBgBrightness', Math.round((builderDraft.cardBgBrightness ?? 1) * 100) + '%');
    setTxt('sysLblCardBgTintOpacity', Math.round((builderDraft.cardBgTintOpacity ?? 0.35) * 100) + '%');
    setTxt('sysLblCanvasHeight', (builderDraft.canvasHeight || 380) + 'px');

    renderPresetGrid();
    renderSavedPresetsList();
    renderThemeChips();
    renderFramePickerGrid();
    renderElementStyleEditor();
    renderCanvasLayersEditor();
    renderMediaPickerStrip();
    renderSvgIconPicker();
    renderBoostsEditor();
    renderInventoryEditor();
    renderShopEditor();
    renderBarsEditor();
    renderStatsEditor();
    renderRpgPanel();
    refreshPreviewOnly();
  }

  function renderPresetGrid() {
    const grid = document.getElementById('sysWinPresetGrid');
    if (!grid) return;
    grid.innerHTML = PRESETS.map(p => `
      <div class="syswin-preset-card ${builderDraft.presetId === p.id ? 'active' : ''}" onclick="window.ChatHubSystemWindows.applyPreset('${p.id}')">
        <span style="font-size:20px;">${p.icon}</span>
        <strong style="font-size:11.5px; color:#f8fafc;">${esc(p.name)}</strong>
        <span style="font-size:9.5px; color:#94a3b8; line-height:1.25;">${esc(p.desc)}</span>
      </div>
    `).join('');
  }

  function renderSavedPresetsList() {
    const listEl = document.getElementById('sysWinSavedPresetsList');
    if (!listEl) return;
    const saved = loadPersonalPresets();
    if (saved.length === 0) {
      listEl.innerHTML = `<div style="font-size:11px; color:#64748b; padding:6px 0;">No personal styles saved yet. Customize any frame & colors, then click "+ Save Current Design"!</div>`;
      return;
    }
    listEl.innerHTML = saved.map((sp, idx) => `
      <div class="syswin-block-row" style="justify-content:space-between;">
        <div style="display:flex; align-items:center; gap:8px;">
          <span style="width:12px; height:12px; border-radius:50%; background:${esc(sp.config?.accentColor || '#00f0ff')}; display:inline-block;"></span>
          <strong style="font-size:12px; color:#f8fafc;">${esc(sp.name)}</strong>
        </div>
        <div style="display:flex; gap:6px;">
          <button type="button" class="syswin-chip-btn" onclick="window.ChatHubSystemWindows.loadPersonalPreset(${idx})">Apply</button>
          <button type="button" class="syswin-chip-btn" style="color:#fca5a5;" onclick="window.ChatHubSystemWindows.deletePersonalPreset(${idx})">✕</button>
        </div>
      </div>
    `).join('');
  }

  function renderThemeChips() {
    const row = document.getElementById('sysWinThemesRow');
    if (!row) return;
    row.innerHTML = Object.values(THEMES).map(t => `
      <button type="button" class="syswin-chip-btn ${builderDraft.themeId === t.id ? 'active' : ''}" onclick="window.ChatHubSystemWindows.selectTheme('${t.id}')">${esc(t.label)}</button>
    `).join('');
  }

  function renderFramePickerGrid() {
    const grid = document.getElementById('sysWinFramePickerGrid');
    const sel = document.getElementById('sysSelFrameStyle');
    const allFrames = getAllFrames();
    if (sel) {
      const existingCustom = new Set(Array.from(sel.options).map(o => o.value));
      allFrames.forEach(fr => {
        if (fr.isCustom && !existingCustom.has(fr.id)) {
          const opt = document.createElement('option');
          opt.value = fr.id;
          opt.textContent = `✨ ${fr.label}`;
          sel.appendChild(opt);
        }
      });
      sel.value = builderDraft.frameStyle || 'tech_brackets';
    }
    if (!grid) return;
    const sorted = [...allFrames].sort((a, b) => (b.isCustom ? 1 : 0) - (a.isCustom ? 1 : 0) || (b.id === 'none' ? 1 : 0) - (a.id === 'none' ? 1 : 0) || (b.isOrnate ? 1 : 0) - (a.isOrnate ? 1 : 0));
    grid.innerHTML = sorted.map(fr => {
      const thumbSvg = fr.isCustom ? fr.svg : getFrameSvgOverlay(fr.id);
      const isActive = builderDraft.frameStyle === fr.id;
      return `
        <div class="syswin-svg-cell">
          <button type="button" class="syswin-svg-icon-btn syswin-frame-btn ${isActive ? 'active' : ''}" data-frame-key="${esc(fr.id)}" title="${esc(fr.label)}" style="--sys-accent:${esc(builderDraft.accentColor || '#fde047')}; --sys-accent-2:${esc(builderDraft.secondaryColor || '#ef4444')};">
            <div class="syswin-frame-thumb">${thumbSvg || `<span style="font-size:15px;">${esc(fr.icon)}</span>`}</div>
            <span>${esc(fr.label)}</span>
          </button>
          ${fr.isCustom ? `<button type="button" class="syswin-svg-del" data-del-frame-key="${esc(fr.id)}" title="Delete custom frame '${esc(fr.label)}'" aria-label="Delete frame">✕</button>` : ''}
        </div>
      `;
    }).join('');
    grid.querySelectorAll('.syswin-svg-icon-btn[data-frame-key]').forEach(btn => {
      btn.addEventListener('click', () => {
        window.ChatHubSystemWindows.selectFrameStyle(btn.dataset.frameKey);
      });
    });
    grid.querySelectorAll('.syswin-svg-del[data-del-frame-key]').forEach(delBtn => {
      delBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        window.ChatHubSystemWindows.deleteCustomFrame(delBtn.dataset.delFrameKey);
      });
    });
  }

  let activeElementStyleTarget = 'title';

  function renderElementStyleEditor() {
    if (!builderDraft) return;
    if (!builderDraft.elementStyles) builderDraft.elementStyles = normalizeElementStyles(null);
    const st = builderDraft.elementStyles[activeElementStyleTarget] || getEmptyElementStyle();

    const tabsEl = document.getElementById('sysElTargetTabs');
    if (tabsEl) {
      tabsEl.querySelectorAll('[data-el-target]').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.elTarget === activeElementStyleTarget);
      });
    }

    const fontSel = document.getElementById('sysSelElFontFamily');
    if (fontSel) {
      const customFonts = loadCustomFonts();
      const presetOpts = [
        { val: '', label: 'Inherit Card Mood' },
        { val: 'hud', label: 'Sci-Fi HUD Geometric' },
        { val: 'manhwa', label: 'Clean Modern Manhwa' },
        { val: 'serif', label: 'Royal Serif (Otome / Murim)' },
        { val: 'mono', label: 'Hacker Terminal Mono' },
        { val: 'cinzel', label: 'Imperial Fantasy (Cinzel)' },
        { val: 'impact', label: 'Action Manhwa Bold' },
        { val: 'gothic', label: 'Dark Abyssal Gothic' },
        { val: 'runic', label: 'Arcane Runic Serif' }
      ];
      fontSel.innerHTML = presetOpts.map(o => `<option value="${esc(o.val)}">${esc(o.label)}</option>`).join('') +
        customFonts.map(cf => `<option value="custom:${esc(cf.id)}">⭐ ${esc(cf.name)}</option>`).join('');
      fontSel.value = st.fontFamily || '';
      const delBtn = document.getElementById('sysBtnDelCustomFont');
      if (delBtn) delBtn.style.display = String(st.fontFamily || '').startsWith('custom:') ? '' : 'none';
    }

    const setElVal = (id, v) => { const el = document.getElementById(id); if (el) el.value = v; };
    const setElTxt = (id, t) => { const el = document.getElementById(id); if (el) el.textContent = t; };
    setElVal('sysInpElFontSize', st.fontSize || 0);
    setElVal('sysInpElGlowBlur', st.glowBlur || 0);
    setElVal('sysInpElStrokeWidth', st.strokeWidth || 0);
    setElVal('sysInpElColor', toHex6(st.color, '#ffffff'));
    setElVal('sysInpElGlowColor', toHex6(st.glowColor || builderDraft.accentColor, '#00f0ff'));
    setElVal('sysInpElStrokeColor', toHex6(st.strokeColor, '#020617'));
    setElTxt('sysLblElFontSize', st.fontSize > 0 ? `${st.fontSize}px` : 'auto');
    setElTxt('sysLblElGlowBlur', st.glowBlur > 0 ? `${st.glowBlur}px` : (st.glowColor ? '10px' : 'auto'));
    setElTxt('sysLblElStrokeWidth', `${st.strokeWidth || 0}px`);
  }

  function renderCanvasLayersEditor() {
    const wrap = document.getElementById('sysCanvasEditorWrap');
    const convertBtn = document.getElementById('sysBtnConvertToCanvas');
    const stackEl = document.getElementById('sysCanvasLayerStack');
    const inspEl = document.getElementById('sysCanvasLayerInspector');
    if (!builderDraft) return;
    const isCanvas = builderDraft.cardStyle === 'canvas';
    if (wrap) wrap.style.display = isCanvas ? 'flex' : 'none';
    if (convertBtn) convertBtn.style.display = isCanvas ? 'none' : 'inline-flex';
    if (!isCanvas || !stackEl || !inspEl) return;

    const layers = Array.isArray(builderDraft.layers) ? builderDraft.layers : [];
    if (!layers.find(l => l.id === builderSelectedLayerId)) {
      builderSelectedLayerId = layers.length ? layers[layers.length - 1].id : '';
    }

    if (layers.length === 0) {
      stackEl.innerHTML = '<div style="font-size:11px; color:#64748b; padding:8px; text-align:center;">No layers yet. Click + Text, + Icon, + Image, + Border, + Sparkles, or + BG above!</div>';
      inspEl.innerHTML = '<div style="font-size:11px; color:#64748b;">Select or add a layer to style & position it.</div>';
      return;
    }

    const typeIcon = { background: '🖼️', sparkles: '✨', image: '🧩', icon: '💠', text: '𝐓', border: '🔲' };
    stackEl.innerHTML = [...layers].reverse().map((l) => {
      const idx = layers.indexOf(l);
      const isSel = l.id === builderSelectedLayerId;
      return `
        <div class="syswin-layer-row ${isSel ? 'active' : ''} ${!l.visible ? 'is-hidden-layer' : ''}" data-sel-layer="${esc(l.id)}">
          <span class="syswin-layer-badge">${typeIcon[l.type] || '▪'} ${esc(l.type)}</span>
          <span class="syswin-layer-name">${esc(l.name || l.type)}</span>
          <div class="syswin-layer-acts">
            <button type="button" class="syswin-layer-mini-btn" title="Bring Forward" data-layer-act="up" data-lid="${esc(l.id)}" ${idx >= layers.length - 1 ? 'disabled style="opacity:0.35;"' : ''}>▲</button>
            <button type="button" class="syswin-layer-mini-btn" title="Send Backward" data-layer-act="down" data-lid="${esc(l.id)}" ${idx <= 0 ? 'disabled style="opacity:0.35;"' : ''}>▼</button>
            <button type="button" class="syswin-layer-mini-btn ${l.visible ? 'active' : ''}" title="Toggle Visible" data-layer-act="vis" data-lid="${esc(l.id)}">${l.visible ? '👁️' : '🙈'}</button>
            <button type="button" class="syswin-layer-mini-btn ${l.locked ? 'active' : ''}" title="Lock / Unlock Drag" data-layer-act="lock" data-lid="${esc(l.id)}">${l.locked ? '🔒' : '🔓'}</button>
            <button type="button" class="syswin-layer-mini-btn" title="Duplicate Layer" data-layer-act="dup" data-lid="${esc(l.id)}">⧉</button>
            <button type="button" class="syswin-layer-mini-btn" style="color:#fca5a5;" title="Delete Layer" data-layer-act="del" data-lid="${esc(l.id)}">✕</button>
          </div>
        </div>
      `;
    }).join('');

    stackEl.querySelectorAll('[data-sel-layer]').forEach(row => {
      row.addEventListener('click', (e) => {
        if (e.target && e.target.closest && e.target.closest('[data-layer-act]')) return;
        window.ChatHubSystemWindows.selectCanvasLayer(row.dataset.selLayer);
      });
    });
    stackEl.querySelectorAll('[data-layer-act]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const act = btn.dataset.layerAct;
        const lid = btn.dataset.lid;
        if (act === 'up') window.ChatHubSystemWindows.moveCanvasLayer(lid, 1);
        else if (act === 'down') window.ChatHubSystemWindows.moveCanvasLayer(lid, -1);
        else if (act === 'vis') window.ChatHubSystemWindows.toggleCanvasLayerProp(lid, 'visible');
        else if (act === 'lock') window.ChatHubSystemWindows.toggleCanvasLayerProp(lid, 'locked');
        else if (act === 'dup') window.ChatHubSystemWindows.duplicateCanvasLayer(lid);
        else if (act === 'del') window.ChatHubSystemWindows.deleteCanvasLayer(lid);
      });
    });

    const layer = layers.find(l => l.id === builderSelectedLayerId);
    if (!layer) {
      inspEl.innerHTML = '';
      return;
    }

    const customFonts = loadCustomFonts();
    const fontOptsHtml = [
      ['hud', 'Sci-Fi HUD'], ['manhwa', 'Modern Manhwa'], ['serif', 'Royal Serif'], ['mono', 'Terminal Mono'],
      ['cinzel', 'Imperial Cinzel'], ['impact', 'Action Bold'], ['gothic', 'Dark Gothic'], ['runic', 'Arcane Runic']
    ].map(([v, lbl]) => `<option value="${v}" ${layer.fontFamily === v ? 'selected' : ''}>${lbl}</option>`).join('') +
      customFonts.map(cf => `<option value="custom:${esc(cf.id)}" ${layer.fontFamily === 'custom:' + cf.id ? 'selected' : ''}>⭐ ${esc(cf.name)}</option>`).join('');

    let specificHtml = '';
    if (layer.type === 'text') {
      specificHtml = `
        <div>
          <label class="syswin-label">Text Content</label>
          <textarea rows="2" class="syswin-textarea" data-lay-field="text">${esc(layer.text || '')}</textarea>
        </div>
        <div class="syswin-field-row">
          <div>
            <label class="syswin-label">Font</label>
            <select class="syswin-select" data-lay-field="fontFamily">${fontOptsHtml}</select>
          </div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:5px;">
            <div>
              <label class="syswin-label">Align</label>
              <select class="syswin-select" data-lay-field="textAlign">
                <option value="left" ${layer.textAlign === 'left' ? 'selected' : ''}>Left</option>
                <option value="center" ${layer.textAlign === 'center' ? 'selected' : ''}>Center</option>
                <option value="right" ${layer.textAlign === 'right' ? 'selected' : ''}>Right</option>
              </select>
            </div>
            <div>
              <label class="syswin-label">Size (px)</label>
              <input type="number" class="syswin-input" min="8" max="72" data-lay-field="fontSize" data-lay-num="1" value="${layer.fontSize || 18}">
            </div>
          </div>
        </div>
        <div style="display:grid; grid-template-columns:repeat(4, minmax(0, 1fr)); gap:6px;">
          <div><label class="syswin-label">Color</label><input type="color" data-lay-field="color" value="${toHex6(layer.color, '#f8fafc')}" style="width:100%; height:28px; border:none; border-radius:5px; background:#0f172a;"></div>
          <div><label class="syswin-label">Glow Color</label><input type="color" data-lay-field="glowColor" value="${toHex6(layer.glowColor, '#00f0ff')}" style="width:100%; height:28px; border:none; border-radius:5px; background:#0f172a;"></div>
          <div><label class="syswin-label">Glow px</label><input type="number" class="syswin-input" min="0" max="32" data-lay-field="glowBlur" data-lay-num="1" value="${layer.glowBlur || 0}"></div>
          <div><label class="syswin-label">Stroke px</label><input type="number" class="syswin-input" min="0" max="4" step="0.5" data-lay-field="strokeWidth" data-lay-num="1" value="${layer.strokeWidth || 0}"></div>
        </div>
        <div style="display:grid; grid-template-columns:repeat(3, minmax(0, 1fr)); gap:6px;">
          <div><label class="syswin-label">Stroke Color</label><input type="color" data-lay-field="strokeColor" value="${toHex6(layer.strokeColor, '#020617')}" style="width:100%; height:28px; border:none; border-radius:5px; background:#0f172a;"></div>
          <div><label class="syswin-label">Box Fill</label><input type="color" data-lay-field="bgColor" value="${toHex6(layer.bgColor, '#020617')}" style="width:100%; height:28px; border:none; border-radius:5px; background:#0f172a;"></div>
          <div><label class="syswin-label">Box Opacity</label><input type="range" min="0" max="1" step="0.05" data-lay-field="bgOpacity" data-lay-num="1" value="${layer.bgOpacity || 0}" style="width:100%; margin-top:6px;"></div>
        </div>
      `;
    } else if (layer.type === 'icon') {
      const allSvg = getAllSvgIcons();
      const iconOpts = Object.entries(allSvg).map(([k, v]) => `<option value="${esc(k)}" ${layer.svgIcon === k ? 'selected' : ''}>${esc(v.label)}</option>`).join('');
      specificHtml = `
        <div class="syswin-field-row">
          <div>
            <label class="syswin-label">Neon SVG Icon</label>
            <select class="syswin-select" data-lay-field="svgIcon">${iconOpts}</select>
          </div>
          <div>
            <label class="syswin-label">Or Emoji / Glyph Override</label>
            <input type="text" class="syswin-input" maxlength="6" placeholder="e.g. 🔥 or ⚔️" data-lay-field="emoji" value="${esc(layer.emoji || '')}">
          </div>
        </div>
        <div style="display:grid; grid-template-columns:repeat(4, minmax(0, 1fr)); gap:6px; align-items:end;">
          <div><label class="syswin-label">Color</label><input type="color" data-lay-field="color" value="${toHex6(layer.color, '#00f0ff')}" style="width:100%; height:28px; border:none; border-radius:5px; background:#0f172a;"></div>
          <div><label class="syswin-label">Glow Color</label><input type="color" data-lay-field="glowColor" value="${toHex6(layer.glowColor, '#38bdf8')}" style="width:100%; height:28px; border:none; border-radius:5px; background:#0f172a;"></div>
          <div><label class="syswin-label">Glow px</label><input type="number" class="syswin-input" min="0" max="32" data-lay-field="glowBlur" data-lay-num="1" value="${layer.glowBlur || 0}"></div>
          <label class="syswin-chip-btn" style="text-align:center;"><input type="checkbox" data-lay-field="blendDark" data-lay-chk="1" ${layer.blendDark ? 'checked' : ''}> Blend BG</label>
        </div>
      `;
    } else if (layer.type === 'image') {
      const urlDisp = layer.imageUrl && String(layer.imageUrl).startsWith('data:') ? '(Uploaded Sticker/Image)' : (layer.imageUrl || '');
      specificHtml = `
        <div style="display:flex; gap:6px; flex-wrap:wrap; align-items:center;">
          <input type="file" id="sysLayImgUploadInp" accept="image/*" style="display:none;">
          <button type="button" class="syswin-chip-btn" onclick="document.getElementById('sysLayImgUploadInp').click()">📁 Upload PNG/Sticker</button>
          <button type="button" class="syswin-chip-btn" style="border-color:#c084fc; color:#e9d5ff;" id="sysLayStripBgBtn">🪄 Remove BG</button>
          <label class="syswin-chip-btn"><input type="checkbox" data-lay-field="blendDark" data-lay-chk="1" ${layer.blendDark ? 'checked' : ''}> Dissolve Black</label>
        </div>
        <input type="text" class="syswin-input" placeholder="Image URL (assets/... or https://...)" data-lay-field="imageUrl" value="${esc(urlDisp)}">
        <div style="display:grid; grid-template-columns:repeat(4, minmax(0, 1fr)); gap:6px;">
          <div>
            <label class="syswin-label">Fit</label>
            <select class="syswin-select" data-lay-field="fit">
              <option value="contain" ${layer.fit === 'contain' ? 'selected' : ''}>Contain</option>
              <option value="cover" ${layer.fit === 'cover' ? 'selected' : ''}>Cover</option>
            </select>
          </div>
          <div><label class="syswin-label">Radius px</label><input type="number" class="syswin-input" min="0" max="64" data-lay-field="rounded" data-lay-num="1" value="${layer.rounded || 0}"></div>
          <div><label class="syswin-label">Glow Color</label><input type="color" data-lay-field="glowColor" value="${toHex6(layer.glowColor, '#00f0ff')}" style="width:100%; height:28px; border:none; border-radius:5px; background:#0f172a;"></div>
          <div><label class="syswin-label">Glow px</label><input type="number" class="syswin-input" min="0" max="32" data-lay-field="glowBlur" data-lay-num="1" value="${layer.glowBlur || 0}"></div>
        </div>
      `;
    } else if (layer.type === 'border') {
      const frameOpts = getAllFrames().map(fr => `<option value="${esc(fr.id)}" ${layer.frameStyle === fr.id ? 'selected' : ''}>${esc(fr.icon || '🖼️')} ${esc(fr.label)}</option>`).join('');
      specificHtml = `
        <div class="syswin-field-row">
          <div><label class="syswin-label">Frame / Border Style</label><select class="syswin-select" data-lay-field="frameStyle">${frameOpts}</select></div>
          <div style="display:grid; grid-template-columns:1fr 1fr 64px; gap:5px;">
            <div><label class="syswin-label">Accent</label><input type="color" data-lay-field="color" value="${toHex6(layer.color, '#00f0ff')}" style="width:100%; height:28px; border:none; border-radius:5px; background:#0f172a;"></div>
            <div><label class="syswin-label">Secondary</label><input type="color" data-lay-field="secondaryColor" value="${toHex6(layer.secondaryColor, '#38bdf8')}" style="width:100%; height:28px; border:none; border-radius:5px; background:#0f172a;"></div>
            <div><label class="syswin-label">Glow</label><input type="number" class="syswin-input" min="0" max="28" data-lay-field="glowBlur" data-lay-num="1" value="${layer.glowBlur || 0}"></div>
          </div>
        </div>
      `;
    } else if (layer.type === 'sparkles') {
      specificHtml = `
        <div style="display:grid; grid-template-columns:1fr 68px 68px; gap:6px;">
          <div>
            <label class="syswin-label">Effect Pattern</label>
            <select class="syswin-select" data-lay-field="pattern">
              <option value="sparkles" ${layer.pattern === 'sparkles' ? 'selected' : ''}>✦ Sparkles</option>
              <option value="starburst" ${layer.pattern === 'starburst' ? 'selected' : ''}>🌟 Starburst Rays</option>
              <option value="scanlines" ${layer.pattern === 'scanlines' ? 'selected' : ''}>📺 HUD Scanlines</option>
              <option value="grid" ${layer.pattern === 'grid' ? 'selected' : ''}>📐 Tactical Grid</option>
            </select>
          </div>
          <div><label class="syswin-label">Primary</label><input type="color" data-lay-field="color" value="${toHex6(layer.color, '#fde047')}" style="width:100%; height:28px; border:none; border-radius:5px; background:#0f172a;"></div>
          <div><label class="syswin-label">Secondary</label><input type="color" data-lay-field="secondaryColor" value="${toHex6(layer.secondaryColor, '#ef4444')}" style="width:100%; height:28px; border:none; border-radius:5px; background:#0f172a;"></div>
        </div>
      `;
    } else if (layer.type === 'background') {
      const bgDisp = layer.imageUrl && String(layer.imageUrl).startsWith('data:') ? '(Uploaded Background)' : (layer.imageUrl || '');
      specificHtml = `
        <div style="display:flex; gap:6px; flex-wrap:wrap; align-items:center;">
          <input type="file" id="sysLayBgUploadInp" accept="image/*" style="display:none;">
          <button type="button" class="syswin-chip-btn" onclick="document.getElementById('sysLayBgUploadInp').click()">📁 Upload BG Image</button>
          <button type="button" class="syswin-chip-btn" id="sysLayClearBgImgBtn">✕ Clear BG Image</button>
        </div>
        <input type="text" class="syswin-input" placeholder="Background image URL (optional)" data-lay-field="imageUrl" value="${esc(bgDisp)}">
        <div style="display:grid; grid-template-columns:repeat(4, minmax(0, 1fr)); gap:6px;">
          <div><label class="syswin-label">Color 1</label><input type="color" data-lay-field="color" value="${toHex6(layer.color, '#041226')}" style="width:100%; height:28px; border:none; border-radius:5px; background:#0f172a;"></div>
          <div><label class="syswin-label">Color 2</label><input type="color" data-lay-field="color2" value="${toHex6(layer.color2, '#0f172a')}" style="width:100%; height:28px; border:none; border-radius:5px; background:#0f172a;"></div>
          <div><label class="syswin-label">Tint</label><input type="color" data-lay-field="tintColor" value="${toHex6(layer.tintColor, '#041226')}" style="width:100%; height:28px; border:none; border-radius:5px; background:#0f172a;"></div>
          <div><label class="syswin-label">Tint %</label><input type="range" min="0" max="0.95" step="0.05" data-lay-field="tintOpacity" data-lay-num="1" value="${layer.tintOpacity ?? 0.35}" style="width:100%; margin-top:6px;"></div>
        </div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
          <div><label class="syswin-label">Blur (px)</label><input type="range" min="0" max="20" step="1" data-lay-field="blur" data-lay-num="1" value="${layer.blur || 0}" style="width:100%;"></div>
          <div><label class="syswin-label">Brightness</label><input type="range" min="0.2" max="1.6" step="0.05" data-lay-field="brightness" data-lay-num="1" value="${layer.brightness ?? 1}" style="width:100%;"></div>
        </div>
      `;
    }

    inspEl.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:6px;">
        <span style="font-size:11.5px; font-weight:900; color:#facc15;">🎛️ Layer Inspector (${esc(layer.type.toUpperCase())})</span>
        <div style="display:flex; gap:4px; flex-wrap:wrap;">
          <button type="button" class="syswin-layer-mini-btn" onclick="window.ChatHubSystemWindows.alignCanvasLayer('centerH')">↔ Center</button>
          <button type="button" class="syswin-layer-mini-btn" onclick="window.ChatHubSystemWindows.alignCanvasLayer('centerV')">↕ Mid</button>
          <button type="button" class="syswin-layer-mini-btn" onclick="window.ChatHubSystemWindows.alignCanvasLayer('fill')">⛶ Fill</button>
          <button type="button" class="syswin-layer-mini-btn" onclick="window.ChatHubSystemWindows.alignCanvasLayer('front')">⬆ Front</button>
          <button type="button" class="syswin-layer-mini-btn" onclick="window.ChatHubSystemWindows.alignCanvasLayer('back')">⬇ Back</button>
        </div>
      </div>
      <div class="syswin-field-row">
        <div><label class="syswin-label">Layer Name</label><input type="text" class="syswin-input" data-lay-field="name" value="${esc(layer.name || '')}"></div>
        <div><label class="syswin-label">Opacity</label><input type="range" min="0" max="1" step="0.05" data-lay-field="opacity" data-lay-num="1" value="${layer.opacity ?? 1}" style="width:100%; margin-top:7px;"></div>
      </div>
      <div style="display:grid; grid-template-columns:repeat(5, minmax(0, 1fr)); gap:5px;">
        <div><label class="syswin-label">X %</label><input type="number" class="syswin-input" id="sysLayInpX" step="1" data-lay-field="x" data-lay-num="1" value="${layer.x}"></div>
        <div><label class="syswin-label">Y %</label><input type="number" class="syswin-input" id="sysLayInpY" step="1" data-lay-field="y" data-lay-num="1" value="${layer.y}"></div>
        <div><label class="syswin-label">W %</label><input type="number" class="syswin-input" id="sysLayInpW" min="4" step="1" data-lay-field="w" data-lay-num="1" value="${layer.w}"></div>
        <div><label class="syswin-label">H %</label><input type="number" class="syswin-input" id="sysLayInpH" min="4" step="1" data-lay-field="h" data-lay-num="1" value="${layer.h}"></div>
        <div><label class="syswin-label">Rot °</label><input type="number" class="syswin-input" id="sysLayInpRot" min="-180" max="180" step="5" data-lay-field="rotation" data-lay-num="1" value="${layer.rotation || 0}"></div>
      </div>
      ${specificHtml}
    `;

    inspEl.querySelectorAll('[data-lay-field]').forEach(inp => {
      const evt = (inp.tagName === 'SELECT' || inp.type === 'checkbox') ? 'change' : 'input';
      inp.addEventListener(evt, () => {
        const f = inp.dataset.layField;
        if (inp.dataset.layChk) {
          layer[f] = Boolean(inp.checked);
        } else if (inp.dataset.layNum) {
          layer[f] = parseFloat(inp.value) || 0;
        } else {
          const val = inp.value;
          if (f === 'imageUrl' && (val === '(Uploaded Sticker/Image)' || val === '(Uploaded Background)')) return;
          layer[f] = val;
          if (f === 'svgIcon') layer.customIconData = '';
          if (f === 'frameStyle') {
            const cf = loadCustomFrames().find(c => String(c.id) === String(val));
            layer.customFrameSvg = (cf && cf.svg) ? sanitizeCustomSvg(cf.svg) : '';
          }
        }
        if (f === 'name') {
          const nameSpan = stackEl.querySelector(`[data-sel-layer="${layer.id}"] .syswin-layer-name`);
          if (nameSpan) nameSpan.textContent = layer.name || layer.type;
        }
        refreshPreviewOnly();
      });
    });

    const layImgUp = document.getElementById('sysLayImgUploadInp');
    if (layImgUp) {
      layImgUp.addEventListener('change', (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        const r = new FileReader();
        r.onload = (ev) => {
          layer.imageUrl = ev.target.result;
          renderCanvasLayersEditor();
          refreshPreviewOnly();
        };
        r.readAsDataURL(file);
        e.target.value = '';
      });
    }
    const layStripBtn = document.getElementById('sysLayStripBgBtn');
    if (layStripBtn) {
      layStripBtn.addEventListener('click', async () => {
        if (!isSafeUrl(layer.imageUrl)) return;
        const cleaned = await stripImageBackgroundDataUrl(layer.imageUrl, { maxSize: 480, removeBg: true, forceGif: true });
        if (cleaned && isSafeUrl(cleaned)) {
          layer.imageUrl = cleaned;
          renderCanvasLayersEditor();
          refreshPreviewOnly();
          if (api() && typeof api().showToast === 'function') api().showToast('🪄 Background removed from image layer!');
        }
      });
    }
    const layBgUp = document.getElementById('sysLayBgUploadInp');
    if (layBgUp) {
      layBgUp.addEventListener('change', (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        const r = new FileReader();
        r.onload = (ev) => {
          layer.imageUrl = ev.target.result;
          renderCanvasLayersEditor();
          refreshPreviewOnly();
        };
        r.readAsDataURL(file);
        e.target.value = '';
      });
    }
    const layClearBgBtn = document.getElementById('sysLayClearBgImgBtn');
    if (layClearBgBtn) {
      layClearBgBtn.addEventListener('click', () => {
        layer.imageUrl = '';
        renderCanvasLayersEditor();
        refreshPreviewOnly();
      });
    }
  }

  function renderMediaPickerStrip() {
    const strip = document.getElementById('sysWinMediaPickerStrip');
    if (!strip) return;
    const candidates = [];
    if (api()) {
      const chars = typeof api().getCharacters === 'function' ? api().getCharacters() : [];
      chars.forEach(c => {
        if (c && isSafeUrl(c.avatar)) candidates.push({ url: c.avatar, label: c.name });
      });
      const stks = typeof api().getStickers === 'function' ? api().getStickers() : [];
      stks.forEach(s => {
        const u = s && (s.imageUrl || s.data || s.url);
        if (!s.isVideo && !s.isAudio && isSafeUrl(u)) candidates.push({ url: u, label: s.label || 'Image' });
      });
    }
    if (candidates.length === 0) {
      strip.innerHTML = '<span style="font-size:10.5px; color:#64748b;">Upload any PNG/GIF above or paste URL.</span>';
      return;
    }
    strip.innerHTML = candidates.slice(0, 24).map((item, idx) => `
      <button type="button" class="syswin-media-thumb-btn ${builderDraft.mediaUrl === item.url ? 'active' : ''}" title="${esc(item.label)}" data-pick-idx="${idx}">
        <img src="${esc(item.url)}" alt="${esc(item.label)}">
      </button>
    `).join('');
    strip.querySelectorAll('.syswin-media-thumb-btn').forEach(btn => {
      btn.onclick = () => {
        const item = candidates[Number(btn.dataset.pickIdx)];
        if (!item) return;
        builderDraft.mediaUrl = item.url;
        if (!builderDraft.mediaLayout || builderDraft.mediaLayout === 'none') {
          builderDraft.mediaLayout = 'portrait_left';
          const sel = document.getElementById('sysSelMediaLayout');
          if (sel) sel.value = 'portrait_left';
        }
        const urlInp = document.getElementById('sysInpMediaUrl');
        if (urlInp) urlInp.value = item.url;
        renderMediaPickerStrip();
        refreshPreviewOnly();
      };
    });
  }

  function renderSvgIconPicker() {
    const filterRow = document.getElementById('sysWinSvgFilterRow');
    if (filterRow) {
      filterRow.querySelectorAll('[data-svg-filter]').forEach(b => {
        b.classList.toggle('active', b.dataset.svgFilter === builderSvgFilter);
      });
    }
    const all = getAllSvgIcons();
    const customList = loadCustomIcons();
    const delSelectedBtn = document.getElementById('sysBtnDelSelectedSvg');
    if (delSelectedBtn) {
      const selEntry = builderDraft.svgIcon ? all[builderDraft.svgIcon] : null;
      delSelectedBtn.style.display = (selEntry && selEntry.isCustom) ? 'inline-flex' : 'none';
    }
    const clearUploadsBtn = document.getElementById('sysBtnClearCustomSvgs');
    if (clearUploadsBtn) {
      const userUploadCount = customList.filter(ci => !ci.marketplacePackId).length;
      clearUploadsBtn.style.display = userUploadCount > 0 ? 'inline-flex' : 'none';
    }
    const grid = document.getElementById('sysWinSvgPickerGrid');
    if (!grid) return;
    const entries = Object.entries(all).filter(([, item]) => {
      if (builderSvgFilter === 'all') return true;
      if (builderSvgFilter === 'custom') return Boolean(item.isCustom);
      return (item.cat || 'relic') === builderSvgFilter;
    });
    // Put custom user icons at the front when viewing 'all' or 'custom'
    entries.sort(([, a], [, b]) => (b.isCustom ? 1 : 0) - (a.isCustom ? 1 : 0));
    if (entries.length === 0) {
      grid.innerHTML = `<div style="grid-column:1/-1; font-size:11px; color:#64748b; padding:10px; text-align:center;">No custom icons yet — click "+ Add Own Icon" above or get free packs from Marketplace!</div>`;
      return;
    }
    grid.innerHTML = entries.map(([key, item]) => `
      <div class="syswin-svg-cell">
        <button type="button" class="syswin-svg-icon-btn ${builderDraft.svgIcon === key ? 'active' : ''}" data-svg-key="${esc(key)}" title="${esc(item.label)}">
          ${item.svg}
          <span>${esc(item.label)}</span>
        </button>
        ${item.isCustom ? `<button type="button" class="syswin-svg-del" data-del-svg-key="${esc(key)}" title="Delete custom badge '${esc(item.label)}'" aria-label="Delete ${esc(item.label)}">✕</button>` : ''}
      </div>
    `).join('');

    grid.querySelectorAll('.syswin-svg-icon-btn[data-svg-key]').forEach(btn => {
      btn.addEventListener('click', () => {
        window.ChatHubSystemWindows.selectSvgIcon(btn.dataset.svgKey);
      });
    });
    grid.querySelectorAll('.syswin-svg-del[data-del-svg-key]').forEach(delBtn => {
      delBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        window.ChatHubSystemWindows.deleteCustomIcon(delBtn.dataset.delSvgKey);
      });
    });
  }

  function renderBoostsEditor() {
    const list = document.getElementById('sysWinBoostsList');
    if (!list) return;
    if (!builderDraft.statBoosts || builderDraft.statBoosts.length === 0) {
      list.innerHTML = '<div style="font-size:10.5px; color:#64748b;">No +stat increases yet. Add STR +15 or ATK +20% above!</div>';
      return;
    }
    list.innerHTML = builderDraft.statBoosts.map((sb, idx) => `
      <div class="syswin-block-row">
        <input type="text" class="syswin-input" style="flex:1; min-width:85px;" value="${esc(sb.label)}" placeholder="Stat (e.g. ATK POWER)" data-boost-idx="${idx}" data-boost-field="label">
        <input type="text" class="syswin-input" style="width:95px;" value="${esc(sb.delta)}" placeholder="+20% or +15" data-boost-idx="${idx}" data-boost-field="delta">
        <button type="button" class="syswin-chip-btn" style="color:#fca5a5; padding:4px 8px;" onclick="window.ChatHubSystemWindows.removeStatBoost(${idx})">✕</button>
      </div>
    `).join('');
    list.querySelectorAll('[data-boost-idx]').forEach(inp => {
      inp.addEventListener('input', () => {
        const i = Number(inp.dataset.boostIdx);
        const f = inp.dataset.boostField;
        if (builderDraft.statBoosts[i]) builderDraft.statBoosts[i][f] = inp.value;
        refreshPreviewOnly();
      });
    });
  }

  function buildItemIconControlHtml(listKey, idx, item) {
    const imgSrc = getItemImageSrc(item);
    return `
      <div style="display:flex; align-items:center; gap:3px; flex-shrink:0;">
        <button type="button" class="syswin-chip-btn" style="padding:2px 6px; font-size:10px; display:inline-flex; align-items:center; gap:3px;" onclick="window.ChatHubSystemWindows.pickCustomItemImage('${listKey}', ${idx})" title="Upload PNG/JPG Icon">
          ${imgSrc ? `<img src="${esc(imgSrc)}" style="width:16px; height:16px; object-fit:cover; border-radius:3px;">` : '🖼️'}
        </button>
        ${imgSrc ? `<button type="button" class="syswin-chip-btn" style="padding:2px 5px; font-size:9px; color:#fca5a5;" onclick="window.ChatHubSystemWindows.clearCustomItemImage('${listKey}', ${idx})" title="Revert to Emoji Icon">↺</button>` : ''}
      </div>
    `;
  }

  function renderInventoryEditor() {
    const list = document.getElementById('sysWinInvList');
    if (!list) return;
    if (!builderDraft.inventoryItems || builderDraft.inventoryItems.length === 0) {
      list.innerHTML = '<div style="font-size:10.5px; color:#64748b;">No inventory slots yet. Click "+ Add Slot" to build a Solo Leveling grid!</div>';
      return;
    }
    list.innerHTML = builderDraft.inventoryItems.map((it, idx) => `
      <div class="syswin-block-row">
        ${buildItemIconControlHtml('inventoryItems', idx, it)}
        <input type="text" class="syswin-input" style="width:46px; text-align:center;" value="${esc(it.icon)}" placeholder="🗡️/URL" title="Emoji or Image URL" data-inv-eidx="${idx}" data-inv-efield="icon">
        <input type="text" class="syswin-input" style="flex:1; min-width:85px;" value="${esc(it.name)}" placeholder="Item Name" data-inv-eidx="${idx}" data-inv-efield="name">
        <select class="syswin-select" style="width:84px;" data-inv-eidx="${idx}" data-inv-efield="rarity">
          <option value="common" ${it.rarity === 'common' ? 'selected' : ''}>Common</option>
          <option value="rare" ${it.rarity === 'rare' ? 'selected' : ''}>Rare</option>
          <option value="epic" ${it.rarity === 'epic' ? 'selected' : ''}>Epic</option>
          <option value="legendary" ${it.rarity === 'legendary' ? 'selected' : ''}>Legend</option>
          <option value="mythic" ${it.rarity === 'mythic' ? 'selected' : ''}>Mythic</option>
        </select>
        <input type="text" class="syswin-input" style="width:44px;" value="${esc(it.qty)}" placeholder="x1" title="Qty / Rank" data-inv-eidx="${idx}" data-inv-efield="qty">
        <label style="font-size:10px; color:#4ade80; display:flex; align-items:center; gap:2px;"><input type="checkbox" ${it.equipped ? 'checked' : ''} data-inv-eidx="${idx}" data-inv-efield="equipped">EQP</label>
        <label style="font-size:10px; color:#fca5a5; display:flex; align-items:center; gap:2px;"><input type="checkbox" ${it.locked ? 'checked' : ''} data-inv-eidx="${idx}" data-inv-efield="locked">🔒</label>
        <input type="text" class="syswin-input" style="width:110px; font-size:10.5px;" value="${esc(it.unlockReq || '')}" placeholder="Req (LV>=5)" data-inv-eidx="${idx}" data-inv-efield="unlockReq" title="e.g. LV>=5, FLAG:boss_dead, ITEM:Key">
        <button type="button" class="syswin-chip-btn" style="color:#fca5a5; padding:4px 8px;" onclick="window.ChatHubSystemWindows.removeInventoryItem(${idx})">✕</button>
      </div>
    `).join('');
    list.querySelectorAll('[data-inv-eidx]').forEach(inp => {
      const evt = (inp.tagName === 'SELECT' || inp.type === 'checkbox') ? 'change' : 'input';
      inp.addEventListener(evt, () => {
        const i = Number(inp.dataset.invEidx);
        const f = inp.dataset.invEfield;
        if (!builderDraft.inventoryItems[i]) return;
        builderDraft.inventoryItems[i][f] = inp.type === 'checkbox' ? inp.checked : inp.value;
        refreshPreviewOnly();
      });
    });
  }

  function renderShopEditor() {
    const list = document.getElementById('sysWinShopList');
    if (!list) return;
    if (!builderDraft.shopItems || builderDraft.shopItems.length === 0) {
      list.innerHTML = '<div style="font-size:10.5px; color:#64748b;">No coin shop items yet. Click "+ Add Shop Item" to sell skills &amp; weapons!</div>';
      return;
    }
    list.innerHTML = builderDraft.shopItems.map((sp, idx) => `
      <div class="syswin-block-row">
        ${buildItemIconControlHtml('shopItems', idx, sp)}
        <input type="text" class="syswin-input" style="width:46px; text-align:center;" value="${esc(sp.icon)}" placeholder="🗡️/URL" title="Emoji or Image URL" data-shop-eidx="${idx}" data-shop-efield="icon">
        <input type="text" class="syswin-input" style="flex:1; min-width:85px;" value="${esc(sp.name)}" placeholder="Item Name" data-shop-eidx="${idx}" data-shop-efield="name">
        <select class="syswin-select" style="width:76px;" data-shop-eidx="${idx}" data-shop-efield="rarity" title="Rarity">
          <option value="common" ${sp.rarity === 'common' ? 'selected' : ''}>Common</option>
          <option value="rare" ${sp.rarity === 'rare' ? 'selected' : ''}>Rare</option>
          <option value="epic" ${sp.rarity === 'epic' ? 'selected' : ''}>Epic</option>
          <option value="legendary" ${sp.rarity === 'legendary' ? 'selected' : ''}>Legend</option>
          <option value="mythic" ${sp.rarity === 'mythic' ? 'selected' : ''}>Mythic</option>
        </select>
        <input type="text" class="syswin-input" style="flex:1; min-width:80px;" value="${esc(sp.meta)}" placeholder="Meta / ATK +240" data-shop-eidx="${idx}" data-shop-efield="meta">
        <input type="text" class="syswin-input" style="width:72px;" value="${esc(sp.price)}" placeholder="50,000 G" data-shop-eidx="${idx}" data-shop-efield="price">
        <label style="font-size:10px; color:#fca5a5; display:flex; align-items:center; gap:2px;"><input type="checkbox" ${sp.locked ? 'checked' : ''} data-shop-eidx="${idx}" data-shop-efield="locked">🔒</label>
        <input type="text" class="syswin-input" style="width:110px; font-size:10.5px;" value="${esc(sp.unlockReq || '')}" placeholder="Req (LV>=3)" data-shop-eidx="${idx}" data-shop-efield="unlockReq" title="e.g. LV>=5, 500 G, FLAG:gate_open, ITEM:Key">
        <button type="button" class="syswin-chip-btn" style="color:#fca5a5; padding:4px 8px;" onclick="window.ChatHubSystemWindows.removeShopItem(${idx})">✕</button>
      </div>
    `).join('');
    list.querySelectorAll('[data-shop-eidx]').forEach(inp => {
      const evt = (inp.tagName === 'SELECT' || inp.type === 'checkbox') ? 'change' : 'input';
      inp.addEventListener(evt, () => {
        const i = Number(inp.dataset.shopEidx);
        const f = inp.dataset.shopEfield;
        if (!builderDraft.shopItems[i]) return;
        builderDraft.shopItems[i][f] = inp.type === 'checkbox' ? inp.checked : inp.value;
        refreshPreviewOnly();
      });
    });
  }

  function renderBarsEditor() {
    const list = document.getElementById('sysWinBarsList');
    if (!list) return;
    if (!builderDraft.bars || builderDraft.bars.length === 0) {
      list.innerHTML = '<div style="font-size:10.5px; color:#64748b;">No bars attached. Click "+ Add Bar" for HP, MP, EXP, Loading, or Affection meters!</div>';
      return;
    }
    list.innerHTML = builderDraft.bars.map((b, idx) => `
      <div class="syswin-block-row">
        <input type="text" class="syswin-input" style="flex:1; min-width:85px;" value="${esc(b.label)}" placeholder="Label" data-bar-idx="${idx}" data-bar-field="label">
        <input type="number" class="syswin-input" style="width:54px;" min="0" max="100" value="${b.fromValue}" title="Start %" data-bar-idx="${idx}" data-bar-field="fromValue">
        <span style="font-size:11px; color:#94a3b8;">➔</span>
        <input type="number" class="syswin-input" style="width:54px;" min="0" max="100" value="${b.value}" title="Target %" data-bar-idx="${idx}" data-bar-field="value">
        <input type="text" class="syswin-input" style="flex:1; min-width:85px;" value="${esc(b.displayText || '')}" placeholder="Text (e.g. 99%)" data-bar-idx="${idx}" data-bar-field="displayText">
        <input type="color" value="${esc(b.color || '#00f0ff')}" style="width:32px; height:28px; border:none; background:none; cursor:pointer;" data-bar-idx="${idx}" data-bar-field="color">
        <button type="button" class="syswin-chip-btn" style="color:#fca5a5; padding:4px 8px;" onclick="window.ChatHubSystemWindows.removeBar(${idx})">✕</button>
      </div>
    `).join('');

    list.querySelectorAll('[data-bar-idx]').forEach(inp => {
      inp.addEventListener('input', () => {
        const i = Number(inp.dataset.barIdx);
        const f = inp.dataset.barField;
        if (!builderDraft.bars[i]) return;
        if (f === 'value' || f === 'fromValue') {
          builderDraft.bars[i][f] = clampPct(inp.value, 50);
          builderDraft.bars[i].animated = builderDraft.bars[i].fromValue !== builderDraft.bars[i].value;
        } else {
          builderDraft.bars[i][f] = inp.value;
        }
        refreshPreviewOnly();
      });
    });
  }

  function renderStatsEditor() {
    const list = document.getElementById('sysWinStatsList');
    if (!list) return;
    if (!builderDraft.stats || builderDraft.stats.length === 0) {
      list.innerHTML = '<div style="font-size:10.5px; color:#64748b;">No stat cells yet. Click "+ Add Stat" for STR/AGI, Item Attack, Price, etc.</div>';
      return;
    }
    list.innerHTML = builderDraft.stats.map((s, idx) => `
      <div class="syswin-block-row">
        <input type="text" class="syswin-input" style="flex:1; min-width:90px;" value="${esc(s.label)}" placeholder="Label (e.g. STR)" data-stat-idx="${idx}" data-stat-field="label">
        <input type="text" class="syswin-input" style="flex:1; min-width:110px;" value="${esc(s.value)}" placeholder="Value (e.g. 142)" data-stat-idx="${idx}" data-stat-field="value">
        <button type="button" class="syswin-chip-btn" style="color:#fca5a5; padding:4px 8px;" onclick="window.ChatHubSystemWindows.removeStat(${idx})">✕</button>
      </div>
    `).join('');

    list.querySelectorAll('[data-stat-idx]').forEach(inp => {
      inp.addEventListener('input', () => {
        const i = Number(inp.dataset.statIdx);
        const f = inp.dataset.statField;
        if (builderDraft.stats[i]) builderDraft.stats[i][f] = inp.value;
        refreshPreviewOnly();
      });
    });
  }

  function renderRpgPanel() {
    const panel = document.getElementById('sysWinRpgPanel');
    if (!panel || !builderDraft) return;
    const rpg = getRpgState();
    const link = normalizeRpgLink(builderDraft.rpgLink);
    builderDraft.rpgLink = link;
    const pr = link.passReward;
    const fp = link.failPenalty;
    const invSummary = rpg.inventory.length > 0
      ? rpg.inventory.map(it => `${it.icon || '📦'} ${it.name}${it.qty > 1 ? ' x' + it.qty : ''}`).join(', ')
      : 'Empty';

    panel.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:6px;">
        <span style="font-size:12px; font-weight:900; color:#38bdf8;">⚔️ Connected Story RPG State & Tree-Branching</span>
        <button type="button" class="syswin-chip-btn" style="border-color:#f87171; color:#fca5a5;" id="sysBtnResetRpgState">↺ Reset Player RPG</button>
      </div>
      <div style="display:grid; grid-template-columns:repeat(5, minmax(0, 1fr)); gap:5px;">
        <div><label class="syswin-label">LV</label><input type="number" class="syswin-input" min="1" data-rpg-stat="lv" value="${rpg.lv}"></div>
        <div><label class="syswin-label">HP / ${rpg.maxHp}</label><input type="number" class="syswin-input" min="0" data-rpg-stat="hp" value="${rpg.hp}"></div>
        <div><label class="syswin-label">MP / ${rpg.maxMp}</label><input type="number" class="syswin-input" min="0" data-rpg-stat="mp" value="${rpg.mp}"></div>
        <div><label class="syswin-label">EXP / ${rpg.nextExp}</label><input type="number" class="syswin-input" min="0" data-rpg-stat="exp" value="${rpg.exp}"></div>
        <div><label class="syswin-label">Coins (G)</label><input type="number" class="syswin-input" min="0" data-rpg-stat="coins" value="${rpg.coins}"></div>
      </div>
      <div class="syswin-field-row">
        <div>
          <label class="syswin-label">Active Story Flags (comma-separated)</label>
          <input type="text" class="syswin-input" id="sysInpRpgFlags" placeholder="e.g. dungeon_cleared, gate_open" value="${esc((rpg.flags || []).join(', '))}">
        </div>
        <div>
          <label class="syswin-label">Player Inventory (${rpg.inventory.length} items)</label>
          <div style="font-size:10.5px; color:#cbd5e1; background:#131c31; border:1px solid #293548; border-radius:7px; padding:6px 8px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${esc(invSummary)}">${esc(invSummary)}</div>
        </div>
      </div>
      <div class="syswin-field-row">
        <label class="syswin-chip-btn" style="display:flex; align-items:center; gap:6px;"><input type="checkbox" id="sysChkSyncRpg" ${builderDraft.syncWithStoryRpg ? 'checked' : ''}> 🔄 Sync Card Bars/Coins/Inv to Player</label>
        <input type="text" class="syswin-input" id="sysInpCardUnlockReq" placeholder="Card Lock Req (e.g. LV>=3, FLAG:x, ITEM:Key)" value="${esc(builderDraft.unlockReq || '')}">
      </div>
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:6px; border-top:1px solid #1e293b; padding-top:6px;">
        <label class="syswin-chip-btn" style="border-color:#00f0ff; color:#00f0ff; display:flex; align-items:center; gap:6px;">
          <input type="checkbox" id="sysChkRpgLink" ${link.enabled ? 'checked' : ''}> 🔗 Link Buttons & Timer to Outcomes
        </label>
        ${link.resolvedOutcome ? `<button type="button" class="syswin-chip-btn" id="sysBtnResetCardOutcome">↺ Clear "${esc(link.resolvedOutcome.toUpperCase())}" Lock</button>` : ''}
      </div>
      <div id="sysRpgBranchFields" style="display:${link.enabled ? 'flex' : 'none'}; flex-direction:column; gap:7px; background:#131c31; border:1px solid #293548; border-radius:8px; padding:8px;">
        <div style="display:grid; grid-template-columns:1fr 1fr auto; gap:6px; align-items:center;">
          <div><label class="syswin-label">PASS Button # (0=1st)</label><input type="number" class="syswin-input" min="0" max="5" data-rpg-link="passBtnIndex" value="${link.passBtnIndex}"></div>
          <div><label class="syswin-label">FAIL Button # (1=2nd)</label><input type="number" class="syswin-input" min="0" max="5" data-rpg-link="failBtnIndex" value="${link.failBtnIndex}"></div>
          <label class="syswin-chip-btn" style="margin-top:14px;"><input type="checkbox" data-rpg-link-chk="timerExpirePenalty" ${link.timerExpirePenalty ? 'checked' : ''}> 00:00 = FAIL</label>
        </div>
        <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
          <label class="syswin-chip-btn" style="flex:1; min-width:195px;" title="Hold stamp briefly after Accept/Reject or 00:00, then fade out Prompt and display Result card">
            <input type="checkbox" data-rpg-link-chk="autoHideAfterResolve" ${link.autoHideAfterResolve ? 'checked' : ''}> ⏳ Auto-Hide Prompt & Show Result after
          </label>
          <div style="display:flex; align-items:center; gap:4px;">
            <input type="number" class="syswin-input" style="width:62px;" min="0.3" max="10" step="0.1" data-rpg-link-num="autoHideDelaySec" value="${link.autoHideDelaySec}">
            <span style="font-size:10.5px; color:#94a3b8;">sec</span>
          </div>
        </div>
        <div style="font-size:10.5px; font-weight:900; color:#4ade80;">✅ On PASS Rewards:</div>
        <div style="display:grid; grid-template-columns:repeat(4, minmax(0, 1fr)); gap:5px;">
          <div><label class="syswin-label">+Coins</label><input type="number" class="syswin-input" min="0" data-rpg-pass="coins" data-num="1" value="${pr.coins}"></div>
          <div><label class="syswin-label">+EXP</label><input type="number" class="syswin-input" min="0" data-rpg-pass="exp" data-num="1" value="${pr.exp}"></div>
          <div><label class="syswin-label">+HP</label><input type="number" class="syswin-input" data-rpg-pass="hp" data-num="1" value="${pr.hp}"></div>
          <div><label class="syswin-label">+MP</label><input type="number" class="syswin-input" data-rpg-pass="mp" data-num="1" value="${pr.mp}"></div>
        </div>
        <div style="display:grid; grid-template-columns:46px 1fr 1fr 1fr; gap:5px;">
          <input type="text" class="syswin-input" style="text-align:center;" data-rpg-pass="itemIcon" value="${esc(pr.itemIcon || '🗡️')}" title="Reward Icon">
          <input type="text" class="syswin-input" placeholder="+Item Name (e.g. Abyssal Key)" data-rpg-pass="itemName" value="${esc(pr.itemName)}">
          <input type="text" class="syswin-input" placeholder="+Flag (e.g. gate_open)" data-rpg-pass="flag" value="${esc(pr.flag)}">
          <input type="text" class="syswin-input" placeholder="Spawn tag/preset (e.g. levelup)" data-rpg-pass="spawnTag" value="${esc(pr.spawnTag)}">
        </div>
        <div style="font-size:10.5px; font-weight:900; color:#fca5a5;">💀 On FAIL / 00:00 Penalty:</div>
        <div style="display:grid; grid-template-columns:repeat(3, minmax(0, 1fr)); gap:5px;">
          <div><label class="syswin-label">-Coins</label><input type="number" class="syswin-input" min="0" data-rpg-fail="coins" data-num="1" value="${fp.coins}"></div>
          <div><label class="syswin-label">-HP</label><input type="number" class="syswin-input" min="0" data-rpg-fail="hp" data-num="1" value="${fp.hp}"></div>
          <div><label class="syswin-label">-MP</label><input type="number" class="syswin-input" min="0" data-rpg-fail="mp" data-num="1" value="${fp.mp}"></div>
        </div>
        <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:5px;">
          <input type="text" class="syswin-input" placeholder="Lose Item Name" data-rpg-fail="loseItemName" value="${esc(fp.loseItemName)}">
          <input type="text" class="syswin-input" placeholder="+Flag (e.g. penalty_curse)" data-rpg-fail="flag" value="${esc(fp.flag)}">
          <input type="text" class="syswin-input" placeholder="Spawn tag/preset (e.g. penalty)" data-rpg-fail="spawnTag" value="${esc(fp.spawnTag)}">
        </div>
      </div>
    `;

    panel.querySelectorAll('[data-rpg-stat]').forEach(inp => {
      const updateStat = (rerenderChat) => {
        const cur = getRpgState();
        cur.active = true;
        cur[inp.dataset.rpgStat] = Math.max(0, parseInt(inp.value, 10) || 0);
        saveRpgState(cur, { rerender: rerenderChat });
        refreshPreviewOnly();
      };
      inp.addEventListener('input', () => updateStat(false));
      inp.addEventListener('change', () => updateStat(true));
    });
    const flagsInp = document.getElementById('sysInpRpgFlags');
    if (flagsInp) {
      const updateFlags = (rerenderChat) => {
        const cur = getRpgState();
        cur.active = true;
        cur.flags = String(flagsInp.value || '').split(',').map(s => s.trim()).filter(Boolean);
        saveRpgState(cur, { rerender: rerenderChat });
        refreshPreviewOnly();
      };
      flagsInp.addEventListener('input', () => updateFlags(false));
      flagsInp.addEventListener('change', () => updateFlags(true));
    }
    const resetRpgBtn = document.getElementById('sysBtnResetRpgState');
    if (resetRpgBtn) {
      resetRpgBtn.addEventListener('click', () => {
        resetRpgState();
        renderRpgPanel();
        refreshPreviewOnly();
        if (api() && typeof api().showToast === 'function') api().showToast('↺ Reset Story Player RPG State!');
      });
    }
    const syncChk = document.getElementById('sysChkSyncRpg');
    if (syncChk) {
      syncChk.addEventListener('change', () => {
        builderDraft.syncWithStoryRpg = Boolean(syncChk.checked);
        refreshPreviewOnly();
      });
    }
    const lockReqInp = document.getElementById('sysInpCardUnlockReq');
    if (lockReqInp) {
      lockReqInp.addEventListener('input', () => {
        builderDraft.unlockReq = lockReqInp.value;
        refreshPreviewOnly();
      });
    }
    const linkChk = document.getElementById('sysChkRpgLink');
    if (linkChk) {
      linkChk.addEventListener('change', () => {
        builderDraft.rpgLink.enabled = Boolean(linkChk.checked);
        const box = document.getElementById('sysRpgBranchFields');
        if (box) box.style.display = builderDraft.rpgLink.enabled ? 'flex' : 'none';
        refreshPreviewOnly();
      });
    }
    const clearOutBtn = document.getElementById('sysBtnResetCardOutcome');
    if (clearOutBtn) {
      clearOutBtn.addEventListener('click', () => {
        builderDraft.rpgLink.resolvedOutcome = '';
        builderDraft.selectedButtonIdx = null;
        if (AUTO_OUTCOME_STAMP_RE.test(String(builderDraft.stampText || '').trim())) {
          builderDraft.stampText = '';
        }
        renderRpgPanel();
        refreshPreviewOnly();
      });
    }
    panel.querySelectorAll('[data-rpg-link]').forEach(inp => {
      inp.addEventListener('input', () => {
        builderDraft.rpgLink[inp.dataset.rpgLink] = Math.max(0, parseInt(inp.value, 10) || 0);
      });
    });
    panel.querySelectorAll('[data-rpg-link-chk]').forEach(chk => {
      chk.addEventListener('change', () => {
        builderDraft.rpgLink[chk.dataset.rpgLinkChk] = Boolean(chk.checked);
      });
    });
    panel.querySelectorAll('[data-rpg-link-num]').forEach(inp => {
      inp.addEventListener('input', () => {
        builderDraft.rpgLink[inp.dataset.rpgLinkNum] = clampNum(inp.value, 0.3, 10, 1.8);
      });
    });
    panel.querySelectorAll('[data-rpg-pass]').forEach(inp => {
      inp.addEventListener('input', () => {
        builderDraft.rpgLink.passReward[inp.dataset.rpgPass] = inp.dataset.num ? (parseInt(inp.value, 10) || 0) : inp.value;
      });
    });
    panel.querySelectorAll('[data-rpg-fail]').forEach(inp => {
      inp.addEventListener('input', () => {
        builderDraft.rpgLink.failPenalty[inp.dataset.rpgFail] = inp.dataset.num ? (parseInt(inp.value, 10) || 0) : inp.value;
      });
    });
  }

  function bindBuilderDomEvents() {
    const bindInput = (id, key, transform) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener('input', () => {
        builderDraft[key] = transform ? transform(el.value) : el.value;
        refreshPreviewOnly();
      });
    };
    const bindChange = (id, key, transform) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener('change', () => {
        builderDraft[key] = transform ? transform(el.type === 'checkbox' ? el.checked : el.value) : (el.type === 'checkbox' ? el.checked : el.value);
        if (key === 'accentColor' || key === 'bgColor' || key === 'frameStyle') {
          builderDraft.themeId = 'custom';
          renderThemeChips();
        }
        refreshPreviewOnly();
      });
    };

    bindInput('sysInpHeaderTitle', 'headerTitle');
    bindInput('sysInpHeaderIcon', 'headerIcon');
    bindInput('sysInpHeaderBadge', 'headerBadge');
    bindInput('sysInpCurrency', 'currencyText');
    bindInput('sysInpSubtitle', 'subtitle');
    bindInput('sysInpFooter', 'footerText');
    bindInput('sysInpBodyText', 'bodyText');
    bindInput('sysInpLevelJump', 'levelTransition');
    bindInput('sysInpUnlockedAbility', 'unlockedAbility');
    bindInput('sysInpMediaCaption', 'mediaCaption');
    bindInput('sysInpMediaUrl', 'mediaUrl');
    bindChange('sysSelMediaLayout', 'mediaLayout');
    const cardStyleEl = document.getElementById('sysSelCardStyle');
    if (cardStyleEl) {
      cardStyleEl.addEventListener('change', () => {
        const nextStyle = cardStyleEl.value || 'standard';
        if (nextStyle === 'canvas') {
          window.ChatHubSystemWindows.convertToCanvasMode();
          return;
        }
        builderDraft.cardStyle = nextStyle;
        if (nextStyle === 'relic') {
          builderDraft.hideHeader = true;
          builderDraft.starburst = true;
          builderDraft.sparkles = true;
          if (!builderDraft.frameStyle || ['tech_brackets', 'cyber_bevel', 'glass_hud', 'comic_ink', 'blueprint_double'].includes(builderDraft.frameStyle)) {
            builderDraft.frameStyle = 'demonic_thorn';
            builderDraft.customFrameSvg = '';
          }
          if (!builderDraft.fontStyle || builderDraft.fontStyle === 'hud') builderDraft.fontStyle = 'serif';
          syncInputsFromDraft();
        } else {
          renderCanvasLayersEditor();
          refreshPreviewOnly();
        }
      });
    }
    const canvasHInp = document.getElementById('sysCanvasHeightInp');
    if (canvasHInp) {
      canvasHInp.addEventListener('input', () => {
        if (!builderDraft) return;
        builderDraft.canvasHeight = clampNum(canvasHInp.value, 180, 680, 380);
        const lbl = document.getElementById('sysLblCanvasHeight');
        if (lbl) lbl.textContent = builderDraft.canvasHeight + 'px';
        refreshPreviewOnly();
      });
    }

    bindChange('sysSelStatsCols', 'statsCols', v => Number(v) || 2);
    bindChange('sysSelStatusLayout', 'statusLayout', v => (v === 'compact' ? 'compact' : 'sheet'));
    bindChange('sysSelShopLayout', 'shopLayout', v => (v === 'grid' ? 'grid' : 'rows'));
    bindInput('sysInpPills', 'pills', v => String(v).split(',').map(s => s.trim()).filter(Boolean));
    bindInput('sysInpButtons', 'buttons', v => String(v).split('|').map(s => s.trim()).filter(Boolean).map(lbl => ({ label: lbl, style: 'neutral' })));
    bindChange('sysChkTimer', 'timerEnabled');
    bindInput('sysInpTimerLabel', 'timerLabel');
    bindInput('sysInpTimerSeconds', 'timerSeconds', v => Math.max(0, parseInt(v, 10) || 0));
    bindInput('sysInpStampText', 'stampText');
    bindInput('sysInpStampColor', 'stampColor');

    const frameSelEl = document.getElementById('sysSelFrameStyle');
    if (frameSelEl) {
      frameSelEl.addEventListener('change', () => {
        window.ChatHubSystemWindows.selectFrameStyle(frameSelEl.value);
      });
    }
    const accentEl = document.getElementById('sysInpAccentColor');
    const secAccentEl = document.getElementById('sysInpSecondaryColor');
    if (accentEl) accentEl.addEventListener('input', () => renderFramePickerGrid());
    if (secAccentEl) secAccentEl.addEventListener('input', () => renderFramePickerGrid());
    bindChange('sysSelFontStyle', 'fontStyle');
    bindInput('sysInpAccentColor', 'accentColor');
    bindInput('sysInpSecondaryColor', 'secondaryColor');
    bindInput('sysInpBgColor', 'bgColor');
    bindInput('sysInpBgOpacity', 'bgOpacity', v => parseFloat(v) || 0.94);
    bindChange('sysChkScanlines', 'scanlines');
    bindChange('sysChkGrid', 'gridPattern');
    bindChange('sysChkSparkles', 'sparkles');
    bindChange('sysChkStarburst', 'starburst');
    bindChange('sysChkHideHeader', 'hideHeader');
    bindChange('sysChkIconSeamless', 'iconSeamless');
    bindChange('sysChkIconBlendDark', 'iconBlendDark');
    bindChange('sysSelAnimation', 'animation');
    bindChange('sysSelSfx', 'sfx');
    bindChange('sysSelGlow', 'glowIntensity');

    const cardBgInp = document.getElementById('sysInpCardBgImage');
    if (cardBgInp) {
      cardBgInp.addEventListener('input', () => {
        if (!builderDraft) return;
        const v = String(cardBgInp.value || '').trim();
        if (v === '(Uploaded Background Attached)') return;
        builderDraft.cardBgImage = v;
        refreshPreviewOnly();
      });
    }
    const updateCardBgLbl = (id, txt) => { const el = document.getElementById(id); if (el) el.textContent = txt; };
    bindInput('sysInpCardBgOpacity', 'cardBgOpacity', v => { const n = parseFloat(v) || 1; updateCardBgLbl('sysLblCardBgOpacity', Math.round(n * 100) + '%'); return n; });
    bindInput('sysInpCardBgBlur', 'cardBgBlur', v => { const n = parseFloat(v) || 0; updateCardBgLbl('sysLblCardBgBlur', n + 'px'); return n; });
    bindInput('sysInpCardBgBrightness', 'cardBgBrightness', v => { const n = parseFloat(v) || 1; updateCardBgLbl('sysLblCardBgBrightness', Math.round(n * 100) + '%'); return n; });
    bindInput('sysInpCardBgTint', 'cardBgTint');
    bindInput('sysInpCardBgTintOpacity', 'cardBgTintOpacity', v => { const n = parseFloat(v); const out = Number.isFinite(n) ? n : 0.35; updateCardBgLbl('sysLblCardBgTintOpacity', Math.round(out * 100) + '%'); return out; });

    const cardBgFileInp = document.getElementById('sysWinCardBgFileInput');
    if (cardBgFileInp) {
      cardBgFileInp.addEventListener('change', (e) => {
        const f = e.target.files && e.target.files[0];
        if (!f) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
          builderDraft.cardBgImage = ev.target.result;
          const inp = document.getElementById('sysInpCardBgImage');
          if (inp) inp.value = '(Uploaded Background Attached)';
          refreshPreviewOnly();
        };
        reader.readAsDataURL(f);
        e.target.value = '';
      });
    }

    const bindElStyle = (id, key, evt, parser) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener(evt, () => {
        if (!builderDraft) return;
        if (!builderDraft.elementStyles) builderDraft.elementStyles = normalizeElementStyles(null);
        const target = builderDraft.elementStyles[activeElementStyleTarget] || getEmptyElementStyle();
        target[key] = parser ? parser(el.value) : el.value;
        builderDraft.elementStyles[activeElementStyleTarget] = target;
        if (key === 'fontFamily') {
          const delBtn = document.getElementById('sysBtnDelCustomFont');
          if (delBtn) delBtn.style.display = String(target.fontFamily || '').startsWith('custom:') ? '' : 'none';
        }
        if (key === 'fontSize') updateCardBgLbl('sysLblElFontSize', target.fontSize > 0 ? `${target.fontSize}px` : 'auto');
        if (key === 'glowBlur' || key === 'glowColor') updateCardBgLbl('sysLblElGlowBlur', target.glowBlur > 0 ? `${target.glowBlur}px` : (target.glowColor ? '10px' : 'auto'));
        if (key === 'strokeWidth') updateCardBgLbl('sysLblElStrokeWidth', `${target.strokeWidth || 0}px`);
        refreshPreviewOnly();
      });
    };
    bindElStyle('sysSelElFontFamily', 'fontFamily', 'change');
    bindElStyle('sysInpElFontSize', 'fontSize', 'input', v => Math.max(0, parseInt(v, 10) || 0));
    bindElStyle('sysInpElGlowBlur', 'glowBlur', 'input', v => Math.max(0, parseInt(v, 10) || 0));
    bindElStyle('sysInpElStrokeWidth', 'strokeWidth', 'input', v => Math.max(0, parseFloat(v) || 0));
    bindElStyle('sysInpElColor', 'color', 'input');
    bindElStyle('sysInpElGlowColor', 'glowColor', 'input');
    bindElStyle('sysInpElStrokeColor', 'strokeColor', 'input');

    const fontFileInp = document.getElementById('sysWinCustomFontInput');
    if (fontFileInp) {
      fontFileInp.addEventListener('change', (e) => {
        const f = e.target.files && e.target.files[0];
        if (!f) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
          const dataUrl = String(ev.target.result || '');
          if (!dataUrl.startsWith('data:')) return;
          const id = 'fnt_' + Date.now().toString(36);
          const cleanName = String(f.name || 'CustomFont').replace(/\.(ttf|otf|woff2)$/i, '').slice(0, 24);
          const list = loadCustomFonts();
          list.unshift({ id, name: cleanName, dataUrl, createdAt: Date.now() });
          saveCustomFonts(list.slice(0, 15));
          injectCustomFontFaces();
          if (!builderDraft.elementStyles) builderDraft.elementStyles = normalizeElementStyles(null);
          builderDraft.elementStyles[activeElementStyleTarget].fontFamily = 'custom:' + id;
          renderElementStyleEditor();
          refreshPreviewOnly();
          if (api() && typeof api().showToast === 'function') api().showToast(`🔤 Uploaded font "${cleanName}"!`);
        };
        reader.readAsDataURL(f);
        e.target.value = '';
      });
    }

    const holdEl = document.getElementById('sysInpHoldSec');
    if (holdEl) {
      holdEl.addEventListener('input', () => {
        builderHoldMs = Math.max(500, Math.min(15000, Math.round((parseFloat(holdEl.value) || 1.9) * 1000)));
      });
    }

    const fileInp = document.getElementById('sysWinImageFileInput');
    if (fileInp) {
      fileInp.addEventListener('change', (e) => {
        const f = e.target.files && e.target.files[0];
        if (!f) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
          builderDraft.mediaUrl = ev.target.result;
          if (!builderDraft.mediaLayout || builderDraft.mediaLayout === 'none') {
            builderDraft.mediaLayout = 'portrait_left';
            const sel = document.getElementById('sysSelMediaLayout');
            if (sel) sel.value = 'portrait_left';
          }
          const urlInp = document.getElementById('sysInpMediaUrl');
          if (urlInp) urlInp.value = '(Uploaded Image Attached)';
          renderMediaPickerStrip();
          refreshPreviewOnly();
        };
        reader.readAsDataURL(f);
        e.target.value = '';
      });
    }

    const customIconInp = document.getElementById('sysNewIconFileInput');
    if (customIconInp) {
      customIconInp.addEventListener('change', async (e) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;
        const labelInp = document.getElementById('sysNewIconLabel');
        const removeBgChk = document.getElementById('sysChkNewIconRemoveBg');
        const autoRemoveBg = removeBgChk ? removeBgChk.checked : true;
        let lastAddedId = '';
        let addedCount = 0;

        for (let idx = 0; idx < files.length; idx++) {
          const f = files[idx];
          const label = ((files.length === 1 && labelInp && labelInp.value.trim()) || f.name.replace(/\.[^/.]+$/, '').slice(0, 18) || 'My Icon').slice(0, 18);
          if (/svg/i.test(f.type) || /\.svg$/i.test(f.name)) {
            const rawText = await new Promise(res => {
              const r = new FileReader();
              r.onload = ev => res(ev.target.result || '');
              r.onerror = () => res('');
              r.readAsText(f);
            });
            const cleanSvg = sanitizeCustomSvg(rawText);
            if (!cleanSvg) {
              if (files.length === 1 && api() && typeof api().showToast === 'function') api().showToast('⚠️ Invalid or unsafe SVG file.');
              continue;
            }
            const id = 'custom_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 6);
            const list = loadCustomIcons();
            list.unshift({ id, label, svg: cleanSvg, createdAt: Date.now() });
            saveCustomIcons(list);
            lastAddedId = id;
            addedCount++;
          } else {
            const rawUrl = await new Promise(res => {
              const r = new FileReader();
              r.onload = ev => res(ev.target.result || '');
              r.onerror = () => res('');
              r.readAsDataURL(f);
            });
            if (!isSafeUrl(rawUrl)) continue;
            const processedUrl = await stripImageBackgroundDataUrl(rawUrl, { maxSize: 256, removeBg: autoRemoveBg });
            if (!isSafeUrl(processedUrl)) continue;
            const id = 'custom_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 6);
            const list = loadCustomIcons();
            list.unshift({ id, label, imageUrl: processedUrl, createdAt: Date.now() });
            saveCustomIcons(list);
            lastAddedId = id;
            addedCount++;
          }
        }
        if (labelInp && addedCount > 0) labelInp.value = '';
        if (lastAddedId) {
          window.ChatHubSystemWindows.selectSvgIcon(lastAddedId);
          if (api() && typeof api().showToast === 'function') {
            api().showToast(addedCount > 1 ? `✨ Added ${addedCount} custom neon badges!` : `✨ Added custom icon (${autoRemoveBg ? 'BG cleaned' : 'saved'})!`);
          }
        }
        e.target.value = '';
      });
    }

    const customFrameInp = document.getElementById('sysNewFrameFileInput');
    if (customFrameInp) {
      customFrameInp.addEventListener('change', (e) => {
        const f = e.target.files && e.target.files[0];
        if (!f) return;
        const labelInp = document.getElementById('sysNewFrameLabel');
        const label = (labelInp && labelInp.value.trim()) || f.name.replace(/\.[^/.]+$/, '').slice(0, 18) || 'Custom Frame';
        const reader = new FileReader();
        reader.onload = (ev) => {
          const cleanSvg = sanitizeCustomSvg(ev.target.result);
          if (!cleanSvg) {
            if (api() && typeof api().showToast === 'function') api().showToast('⚠️ Invalid or unsafe SVG frame file.');
            return;
          }
          const id = 'cframe_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 6);
          const list = loadCustomFrames();
          list.unshift({ id, label, svg: cleanSvg, createdAt: Date.now() });
          saveCustomFrames(list.slice(0, 40));
          if (labelInp) labelInp.value = '';
          window.ChatHubSystemWindows.selectFrameStyle(id);
          if (api() && typeof api().showToast === 'function') api().showToast(`🖼️ Added custom SVG frame "${label}"!`);
        };
        reader.readAsText(f);
        e.target.value = '';
      });
    }
  }

  function openSystemWindowBuilder(editMsgId = null, parentModalId = null) {
    ensureBuilderModalDom();
    if (parentModalId && typeof window.pushModalHistory === 'function') {
      window.pushModalHistory(parentModalId);
    }

    builderEditingMsgId = editMsgId || null;
    const titleEl = document.getElementById('sysWinModalTitle');
    const saveBtn = document.getElementById('sysWinSaveBtn');
    const delBtn = document.getElementById('sysWinDeleteBtn');

    if (editMsgId && api() && typeof api().getMessages === 'function') {
      const existing = api().getMessages().find(m => m.id === editMsgId);
      if (existing) {
        builderDraft = normalizeConfig(existing);
        builderHoldMs = existing.delayMs || 1900;
        if (titleEl) titleEl.textContent = '✏️ Edit System Window';
        if (saveBtn) saveBtn.textContent = '💾 Update Window';
        if (delBtn) delBtn.style.display = 'inline-flex';
      }
    } else {
      builderDraft = getDefaultConfig();
      builderHoldMs = 1900;
      if (titleEl) titleEl.textContent = '🖥️ Manhwa System Studio';
      if (saveBtn) saveBtn.textContent = '✨ Insert System Window';
      if (delBtn) delBtn.style.display = 'none';
    }

    syncInputsFromDraft();
    switchTab(editMsgId ? (builderDraft.cardStyle === 'canvas' ? 'layers' : 'content') : 'presets');
    const modal = document.getElementById('systemWindowBuilderModal');
    if (modal) modal.classList.add('open');
  }

  function closeSystemWindowBuilder() {
    const modal = document.getElementById('systemWindowBuilderModal');
    if (modal) modal.classList.remove('open');
    builderEditingMsgId = null;
  }

  function switchTab(tabId) {
    builderActiveTab = tabId;
    document.querySelectorAll('.syswin-tab-btn').forEach(b => b.classList.toggle('active', b.id === 'sysTabBtn_' + tabId));
    document.querySelectorAll('.syswin-tab-panel').forEach(p => p.classList.toggle('active', p.id === 'sysTabPanel_' + tabId));
  }

  function playSfxForConfig(cfg) {
    if (!api()) return;
    if (cfg && cfg.sfx && typeof api().triggerSfxByName === 'function') {
      api().triggerSfxByName(cfg.sfx, 1.05);
    }
  }

  function commitWindow() {
    if (!api() || typeof api().upsertSystemWindowMessage !== 'function') return;
    const cleanCfg = normalizeConfig({ systemConfig: builderDraft });
    cleanCfg.selectedButtonIdx = null;
    const firstCanvasText = cleanCfg.cardStyle === 'canvas' ? (cleanCfg.layers.find(l => l.visible && l.type === 'text' && l.text) || {}).text : '';
    api().upsertSystemWindowMessage({
      editMsgId: builderEditingMsgId,
      title: cleanCfg.headerTitle || firstCanvasText || 'SYSTEM WINDOW',
      text: firstCanvasText || cleanCfg.bodyText || cleanCfg.subtitle || cleanCfg.levelTransition || cleanCfg.headerTitle,
      systemConfig: cleanCfg,
      delayMs: builderHoldMs
    });
    playSfxForConfig(cleanCfg);
    closeSystemWindowBuilder();
    if (typeof api().showToast === 'function') {
      api().showToast(builderEditingMsgId ? '💾 System Window updated!' : '🖥️ Manhwa System Window inserted!');
    }
  }

  function deleteEditingWindow() {
    if (!builderEditingMsgId || !api() || typeof api().deleteMessageById !== 'function') return;
    api().deleteMessageById(builderEditingMsgId);
    closeSystemWindowBuilder();
  }

  window.openSystemWindowBuilder = openSystemWindowBuilder;
  window.closeSystemWindowBuilder = closeSystemWindowBuilder;

  window.ChatHubSystemWindows = {
    THEMES,
    PRESETS,
    BUILT_IN_FRAMES,
    NEON_SVG_ICONS,
    getAllSvgIcons,
    getAllFrames,
    normalizeConfig,
    estimateSystemWindowHoldMs,
    renderSystemWindowElement,
    animateBarsInElement,
    applyTimerVisualState,
    parseSysWindowLine,
    serializeSysWindowToTag,
    playSfxForConfig,
    getRpgState,
    saveRpgState,
    resetRpgState,
    parseUnlockReq,
    evaluateUnlockReq,
    applyRpgDelta,
    buildOutcomeResultConfig,
    resolveCardOutcome,
    parseItemEffects,
    computeEquippedGearStats,
    equipOrUseInventoryItem,
    renderRpgHudBar,
    openRpgDrawer,
    closeRpgDrawer,
    openItemInspectModal,
    closeItemInspectModal,
    insertSyncedRpgCard,
    openBuilder: openSystemWindowBuilder,
    closeBuilder: closeSystemWindowBuilder,
    switchTab,
    applyPreset(presetId) {
      const p = PRESETS.find(x => x.id === presetId);
      if (!p) return;
      builderDraft = cloneObj(p.config);
      syncInputsFromDraft();
      playSfxForConfig(builderDraft);
    },
    newCleanRelicCard() {
      const base = cloneObj(PRESETS.find(x => x.id === 'relic').config);
      base.headerTitle = 'NEW RELIC SKILL';
      base.subtitle = 'UNIQUE ABILITY / ARTIFACT RANK';
      base.bodyText = 'DESCRIBE THE UNIQUE ABILITY OR BLESSING EFFECT HERE.';
      base.svgIcon = 'soul_flame';
      builderDraft = base;
      syncInputsFromDraft();
      switchTab('content');
      playSfxForConfig(builderDraft);
      if (api() && typeof api().showToast === 'function') api().showToast('🔮 Blank Relic template ready — edit title, icon & frame!');
    },
    newBlankCanvasCard() {
      builderDraft = createBlankCanvasConfig();
      builderSelectedLayerId = builderDraft.layers.find(l => l.type === 'text')?.id || '';
      syncInputsFromDraft();
      switchTab('layers');
      playSfxForConfig(builderDraft);
      if (api() && typeof api().showToast === 'function') api().showToast('🎨 Blank Canva-Style Layer Card ready — drag, resize & rotate!');
    },
    convertToCanvasMode() {
      if (!builderDraft) return;
      if (!Array.isArray(builderDraft.layers) || builderDraft.layers.length === 0) {
        builderDraft.layers = buildLayersFromCardConfig(builderDraft);
      }
      builderDraft.cardStyle = 'canvas';
      builderDraft.canvasHeight = builderDraft.canvasHeight || 380;
      const topMovable = [...builderDraft.layers].reverse().find(l => !l.locked);
      builderSelectedLayerId = (topMovable && topMovable.id) || (builderDraft.layers[builderDraft.layers.length - 1]?.id || '');
      syncInputsFromDraft();
      switchTab('layers');
      if (api() && typeof api().showToast === 'function') api().showToast('🧱 Converted card into Free Editable Layers!');
    },
    addCanvasLayer(type) {
      if (!builderDraft) return;
      if (builderDraft.cardStyle !== 'canvas') this.convertToCanvasMode();
      builderDraft.layers = builderDraft.layers || [];
      const count = builderDraft.layers.filter(l => l.type === type).length + 1;
      const accent = builderDraft.accentColor || '#00f0ff';
      const sec = builderDraft.secondaryColor || '#38bdf8';
      const extra = {};
      if (count > 1) extra.name = `${createDefaultCanvasLayer(type).name} ${count}`;
      if (type === 'text') { extra.color = '#f8fafc'; extra.glowColor = accent; }
      else if (type === 'icon') { extra.color = accent; extra.glowColor = sec; }
      else if (type === 'border') { extra.color = accent; extra.secondaryColor = sec; }
      const newLayer = createDefaultCanvasLayer(type, extra);
      if (type === 'background') builderDraft.layers.unshift(newLayer);
      else builderDraft.layers.push(newLayer);
      builderSelectedLayerId = newLayer.id;
      renderCanvasLayersEditor();
      refreshPreviewOnly();
    },
    selectCanvasLayer(layerId) {
      builderSelectedLayerId = String(layerId || '');
      renderCanvasLayersEditor();
      refreshPreviewOnly();
    },
    moveCanvasLayer(layerId, delta) {
      if (!builderDraft || !Array.isArray(builderDraft.layers)) return;
      const idx = builderDraft.layers.findIndex(l => l.id === layerId);
      const next = idx + delta;
      if (idx < 0 || next < 0 || next >= builderDraft.layers.length) return;
      const [item] = builderDraft.layers.splice(idx, 1);
      builderDraft.layers.splice(next, 0, item);
      renderCanvasLayersEditor();
      refreshPreviewOnly();
    },
    toggleCanvasLayerProp(layerId, prop) {
      if (!builderDraft || !Array.isArray(builderDraft.layers) || !['visible', 'locked'].includes(prop)) return;
      const l = builderDraft.layers.find(x => x.id === layerId);
      if (!l) return;
      l[prop] = !l[prop];
      renderCanvasLayersEditor();
      refreshPreviewOnly();
    },
    duplicateCanvasLayer(layerId) {
      if (!builderDraft || !Array.isArray(builderDraft.layers)) return;
      const idx = builderDraft.layers.findIndex(x => x.id === layerId);
      if (idx < 0) return;
      const copy = cloneObj(builderDraft.layers[idx]);
      copy.id = makeCanvasLayerId();
      copy.name = (copy.name || 'Layer').slice(0, 24) + ' Copy';
      copy.locked = false;
      if (copy.type !== 'background' && copy.type !== 'border') {
        copy.x = Math.min(90, (copy.x || 0) + 4);
        copy.y = Math.min(90, (copy.y || 0) + 4);
      }
      builderDraft.layers.splice(idx + 1, 0, copy);
      builderSelectedLayerId = copy.id;
      renderCanvasLayersEditor();
      refreshPreviewOnly();
    },
    deleteCanvasLayer(layerId) {
      if (!builderDraft || !Array.isArray(builderDraft.layers)) return;
      const idx = builderDraft.layers.findIndex(x => x.id === layerId);
      if (idx < 0) return;
      builderDraft.layers.splice(idx, 1);
      if (builderSelectedLayerId === layerId) {
        builderSelectedLayerId = builderDraft.layers.length ? builderDraft.layers[Math.min(idx, builderDraft.layers.length - 1)].id : '';
      }
      renderCanvasLayersEditor();
      refreshPreviewOnly();
    },
    alignCanvasLayer(action) {
      if (!builderDraft || !Array.isArray(builderDraft.layers)) return;
      const idx = builderDraft.layers.findIndex(l => l.id === builderSelectedLayerId);
      if (idx < 0) return;
      const l = builderDraft.layers[idx];
      if (action === 'centerH') l.x = Math.round(((100 - l.w) / 2) * 10) / 10;
      else if (action === 'centerV') l.y = Math.round(((100 - l.h) / 2) * 10) / 10;
      else if (action === 'fill') { l.x = 0; l.y = 0; l.w = 100; l.h = 100; l.rotation = 0; }
      else if (action === 'front') {
        const [item] = builderDraft.layers.splice(idx, 1);
        builderDraft.layers.push(item);
      } else if (action === 'back') {
        const [item] = builderDraft.layers.splice(idx, 1);
        builderDraft.layers.unshift(item);
      }
      renderCanvasLayersEditor();
      refreshPreviewOnly();
    },
    convertToCleanRelicMode() {
      builderDraft.cardStyle = 'relic';
      builderDraft.hideHeader = true;
      builderDraft.starburst = true;
      builderDraft.sparkles = true;
      builderDraft.scanlines = false;
      builderDraft.gridPattern = false;
      builderDraft.buttons = [];
      builderDraft.stats = [];
      builderDraft.bars = [];
      builderDraft.statBoosts = [];
      builderDraft.inventoryItems = [];
      builderDraft.shopItems = [];
      builderDraft.pills = [];
      builderDraft.timerEnabled = false;
      builderDraft.footerText = '';
      builderDraft.currencyText = '';
      builderDraft.headerBadge = '';
      if (!builderDraft.frameStyle || ['tech_brackets', 'cyber_bevel', 'glass_hud', 'comic_ink', 'blueprint_double'].includes(builderDraft.frameStyle)) {
        builderDraft.frameStyle = 'demonic_thorn';
        builderDraft.customFrameSvg = '';
      }
      if (!builderDraft.fontStyle || builderDraft.fontStyle === 'hud') builderDraft.fontStyle = 'serif';
      syncInputsFromDraft();
      if (api() && typeof api().showToast === 'function') api().showToast('🧹 Converted to clean DEVOUR-style Relic Card!');
    },
    selectFrameStyle(frameId) {
      const custom = loadCustomFrames().find(cf => String(cf.id) === String(frameId));
      builderDraft.frameStyle = frameId || 'tech_brackets';
      builderDraft.customFrameSvg = (custom && custom.svg) ? sanitizeCustomSvg(custom.svg) : '';
      builderDraft.themeId = 'custom';
      const sel = document.getElementById('sysSelFrameStyle');
      if (sel) sel.value = builderDraft.frameStyle;
      renderThemeChips();
      renderFramePickerGrid();
      refreshPreviewOnly();
    },
    toggleCustomFrameDrawer() {
      const drw = document.getElementById('sysCustomFrameDrawer');
      if (drw) drw.classList.toggle('open');
    },
    createCustomGeneratedFrame() {
      const labelInp = document.getElementById('sysNewFrameLabel');
      const motifEl = document.getElementById('sysNewFrameMotif');
      const densityEl = document.getElementById('sysNewFrameDensity');
      const modeEl = document.getElementById('sysNewFrameColorMode');
      const label = (labelInp && labelInp.value.trim()) || 'Custom Frame';
      const svg = generateCustomOrnateFrameSvg(
        motifEl ? motifEl.value : 'thorn',
        densityEl ? densityEl.value : 'medium',
        modeEl ? modeEl.value : 'theme',
        builderDraft.accentColor,
        builderDraft.secondaryColor
      );
      const id = 'cframe_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 6);
      const list = loadCustomFrames();
      list.unshift({ id, label: label.slice(0, 18), svg, createdAt: Date.now() });
      saveCustomFrames(list.slice(0, 40));
      if (labelInp) labelInp.value = '';
      this.selectFrameStyle(id);
      if (api() && typeof api().showToast === 'function') api().showToast(`🖼️ Created custom frame "${label}"!`);
    },
    createCustomRawSvgFrame() {
      const labelInp = document.getElementById('sysNewFrameLabel');
      const svgInp = document.getElementById('sysNewFrameSvgInput');
      const cleanSvg = sanitizeCustomSvg(svgInp ? svgInp.value : '');
      if (!cleanSvg) {
        if (api() && typeof api().showToast === 'function') api().showToast('⚠️ Paste valid <svg>...</svg> border markup first.');
        return;
      }
      const label = (labelInp && labelInp.value.trim()) || 'Custom SVG Frame';
      const id = 'cframe_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 6);
      const list = loadCustomFrames();
      list.unshift({ id, label: label.slice(0, 18), svg: cleanSvg, createdAt: Date.now() });
      saveCustomFrames(list.slice(0, 40));
      if (labelInp) labelInp.value = '';
      if (svgInp) svgInp.value = '';
      this.selectFrameStyle(id);
      if (api() && typeof api().showToast === 'function') api().showToast(`🖼️ Saved custom SVG frame "${label}"!`);
    },
    deleteCustomFrame(frameKey) {
      if (!frameKey) return false;
      const before = loadCustomFrames();
      const target = before.find(cf => String(cf.id) === String(frameKey));
      saveCustomFrames(before.filter(cf => String(cf.id) !== String(frameKey)));
      if (String(builderDraft.frameStyle || '') === String(frameKey)) {
        builderDraft.frameStyle = 'demonic_thorn';
        builderDraft.customFrameSvg = '';
      }
      renderFramePickerGrid();
      refreshPreviewOnly();
      if (target && api() && typeof api().showToast === 'function') {
        api().showToast(`🗑️ Deleted frame "${target.label || 'Custom'}"`);
      }
      return Boolean(target);
    },
    getCustomFrames() {
      return loadCustomFrames();
    },
    clearCardBgImage() {
      if (!builderDraft) return;
      builderDraft.cardBgImage = '';
      const inp = document.getElementById('sysInpCardBgImage');
      if (inp) inp.value = '';
      refreshPreviewOnly();
    },
    selectElementStyleTarget(target) {
      if (!['title', 'subtitle', 'body', 'icons'].includes(target)) return;
      activeElementStyleTarget = target;
      renderElementStyleEditor();
    },
    clearElementColor(field) {
      if (!builderDraft || !['color', 'glowColor'].includes(field)) return;
      if (!builderDraft.elementStyles) builderDraft.elementStyles = normalizeElementStyles(null);
      builderDraft.elementStyles[activeElementStyleTarget][field] = '';
      renderElementStyleEditor();
      refreshPreviewOnly();
    },
    resetElementStyle() {
      if (!builderDraft) return;
      if (!builderDraft.elementStyles) builderDraft.elementStyles = normalizeElementStyles(null);
      builderDraft.elementStyles[activeElementStyleTarget] = getEmptyElementStyle();
      renderElementStyleEditor();
      refreshPreviewOnly();
    },
    deleteSelectedCustomFont() {
      if (!builderDraft || !builderDraft.elementStyles) return;
      const cur = String(builderDraft.elementStyles[activeElementStyleTarget]?.fontFamily || '');
      if (!cur.startsWith('custom:')) return;
      const id = cur.slice(7);
      saveCustomFonts(loadCustomFonts().filter(f => String(f.id) !== String(id)));
      ['title', 'subtitle', 'body', 'icons'].forEach(k => {
        if (builderDraft.elementStyles[k]?.fontFamily === cur) builderDraft.elementStyles[k].fontFamily = '';
      });
      injectCustomFontFaces();
      renderElementStyleEditor();
      refreshPreviewOnly();
      if (api() && typeof api().showToast === 'function') api().showToast('🗑️ Deleted custom font.');
    },
    selectTheme(themeId) {
      builderDraft = applyThemeToConfig(builderDraft, themeId);
      syncInputsFromDraft();
    },
    setSvgFilter(cat) {
      builderSvgFilter = cat || 'all';
      renderSvgIconPicker();
    },
    toggleCustomIconDrawer() {
      const drw = document.getElementById('sysCustomIconDrawer');
      if (drw) drw.classList.toggle('open');
    },
    createCustomBadgeIcon() {
      const labelInp = document.getElementById('sysNewIconLabel');
      const glyphInp = document.getElementById('sysNewIconGlyph');
      const shapeInp = document.getElementById('sysNewIconShape');
      const colorInp = document.getElementById('sysNewIconColor');
      const label = (labelInp && labelInp.value.trim()) || 'Custom Badge';
      const glyph = (glyphInp && glyphInp.value.trim()) || '⚡';
      const shape = (shapeInp && shapeInp.value) || 'hex';
      const color = (colorInp && colorInp.value) || '#00f0ff';
      const svg = generateNeonBadgeSvg(glyph, shape, color);
      const id = 'custom_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 6);
      const list = loadCustomIcons();
      list.unshift({ id, label: label.slice(0, 18), svg, createdAt: Date.now() });
      saveCustomIcons(list);
      if (labelInp) labelInp.value = '';
      if (glyphInp) glyphInp.value = '';
      builderSvgFilter = 'all';
      this.selectSvgIcon(id);
      if (api() && typeof api().showToast === 'function') api().showToast(`✨ Created Neon Icon "${label}"!`);
    },
    createCustomRawSvgIcon() {
      const labelInp = document.getElementById('sysNewIconLabel');
      const svgInp = document.getElementById('sysNewIconSvgInput');
      const cleanSvg = sanitizeCustomSvg(svgInp ? svgInp.value : '');
      if (!cleanSvg) {
        if (api() && typeof api().showToast === 'function') api().showToast('⚠️ Paste valid <svg>...</svg> markup first.');
        return;
      }
      const label = (labelInp && labelInp.value.trim()) || 'Custom SVG';
      const id = 'custom_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 6);
      const list = loadCustomIcons();
      list.unshift({ id, label: label.slice(0, 18), svg: cleanSvg, createdAt: Date.now() });
      saveCustomIcons(list);
      if (labelInp) labelInp.value = '';
      if (svgInp) svgInp.value = '';
      builderSvgFilter = 'all';
      this.selectSvgIcon(id);
      if (api() && typeof api().showToast === 'function') api().showToast(`✨ Saved Custom SVG "${label}"!`);
    },
    deleteCustomIcon(iconKey) {
      if (!iconKey) return false;
      const before = loadCustomIcons();
      const target = before.find(ci => String(ci.id) === String(iconKey));
      const list = before.filter(ci => String(ci.id) !== String(iconKey));
      saveCustomIcons(list);
      const removedMatchData = target && (builderDraft.customIconData === target.svg || builderDraft.customIconData === target.imageUrl);
      if (String(builderDraft.svgIcon || '') === String(iconKey) || removedMatchData) {
        builderDraft.svgIcon = '';
        builderDraft.customIconData = '';
      }
      renderSvgIconPicker();
      refreshPreviewOnly();
      if (target && api() && typeof api().showToast === 'function') {
        api().showToast(`🗑️ Deleted badge "${target.label || 'Custom'}"`);
      }
      return Boolean(target);
    },
    deleteSelectedCustomIcon() {
      if (!builderDraft.svgIcon) return false;
      return this.deleteCustomIcon(builderDraft.svgIcon);
    },
    clearAllUserCustomIcons() {
      const before = loadCustomIcons();
      const kept = before.filter(ci => Boolean(ci.marketplacePackId));
      const removedIds = new Set(before.filter(ci => !ci.marketplacePackId).map(ci => String(ci.id)));
      if (removedIds.size === 0) {
        if (api() && typeof api().showToast === 'function') api().showToast('ℹ️ Remaining badges belong to installed Marketplace packs (manage them in Marketplace).');
        return 0;
      }
      saveCustomIcons(kept);
      if (removedIds.has(String(builderDraft.svgIcon || ''))) {
        builderDraft.svgIcon = '';
        builderDraft.customIconData = '';
      }
      renderSvgIconPicker();
      refreshPreviewOnly();
      if (api() && typeof api().showToast === 'function') api().showToast(`🧹 Removed ${removedIds.size} uploaded custom badge${removedIds.size === 1 ? '' : 's'}!`);
      return removedIds.size;
    },
    async stripCurrentImageBg() {
      const all = getAllSvgIcons();
      const selEntry = builderDraft.svgIcon ? all[builderDraft.svgIcon] : null;
      if (isSafeUrl(builderDraft.mediaUrl)) {
        const cleaned = await stripImageBackgroundDataUrl(builderDraft.mediaUrl, { maxSize: 480, removeBg: true, forceGif: true });
        if (cleaned && isSafeUrl(cleaned)) {
          builderDraft.mediaUrl = cleaned;
          refreshPreviewOnly();
          if (api() && typeof api().showToast === 'function') api().showToast('🪄 Background removed from image!');
          return true;
        }
      } else if (selEntry && selEntry.isCustom && selEntry.imageUrl) {
        const cleaned = await stripImageBackgroundDataUrl(selEntry.imageUrl, { maxSize: 256, removeBg: true, forceGif: true });
        if (cleaned && isSafeUrl(cleaned)) {
          const list = loadCustomIcons();
          const idx = list.findIndex(ci => String(ci.id) === String(builderDraft.svgIcon));
          if (idx >= 0) {
            list[idx].imageUrl = cleaned;
            saveCustomIcons(list);
          }
          builderDraft.customIconData = cleaned;
          renderSvgIconPicker();
          refreshPreviewOnly();
          if (api() && typeof api().showToast === 'function') api().showToast(`🪄 Cleaned background from "${selEntry.label}"!`);
          return true;
        }
      }
      if (api() && typeof api().showToast === 'function') api().showToast('ℹ️ Upload or attach a raster PNG/JPG icon first.');
      return false;
    },
    selectSvgIcon(iconKey) {
      const all = getAllSvgIcons();
      const chosen = iconKey ? all[iconKey] : null;
      builderDraft.svgIcon = chosen ? iconKey : '';
      builderDraft.customIconData = (chosen && chosen.isCustom) ? (chosen.rawSvg || chosen.imageUrl || '') : '';
      if (builderDraft.svgIcon) {
        builderDraft.mediaUrl = '';
        const urlInp = document.getElementById('sysInpMediaUrl');
        if (urlInp) urlInp.value = '';
        if (builderDraft.cardStyle === 'standard' && (!builderDraft.mediaLayout || builderDraft.mediaLayout === 'none')) {
          builderDraft.mediaLayout = 'icon_title';
          const sel = document.getElementById('sysSelMediaLayout');
          if (sel) sel.value = 'icon_title';
        }
      }
      renderSvgIconPicker();
      renderMediaPickerStrip();
      refreshPreviewOnly();
    },
    getPersonalPresets() {
      return loadPersonalPresets();
    },
    getCustomIcons() {
      return loadCustomIcons();
    },
    installMarketplacePresets(packId, presetDefs = []) {
      const list = loadPersonalPresets();
      let count = 0;
      presetDefs.forEach((def, idx) => {
        if (!def || !def.config) return;
        const srcKey = String(def.sourceId || def.name || idx).trim();
        const existingIdx = list.findIndex(p => p.marketplacePackId === packId && p.marketplaceSourceId === srcKey);
        const entry = {
          name: String(def.name || def.config.headerTitle || 'System Style').slice(0, 32),
          savedAt: Date.now(),
          config: cloneObj(def.config),
          marketplacePackId: packId,
          marketplaceSourceId: srcKey
        };
        if (existingIdx >= 0) list[existingIdx] = entry;
        else list.unshift(entry);
        count++;
      });
      savePersonalPresets(list.slice(0, 60));
      renderSavedPresetsList();
      return count;
    },
    installMarketplaceIcons(packId, iconDefs = []) {
      const list = loadCustomIcons();
      let count = 0;
      iconDefs.forEach((def, idx) => {
        if (!def || !def.id) return;
        const cleanSvg = def.svg ? sanitizeCustomSvg(def.svg) : '';
        const cleanImg = (!cleanSvg && isSafeUrl(def.imageUrl)) ? def.imageUrl : '';
        if (!cleanSvg && !cleanImg) return;
        const existingIdx = list.findIndex(ci => ci.id === def.id);
        const rec = {
          id: String(def.id),
          label: String(def.label || 'System Icon').slice(0, 18),
          svg: cleanSvg || undefined,
          imageUrl: cleanImg || undefined,
          marketplacePackId: packId,
          createdAt: Date.now()
        };
        if (existingIdx >= 0) list[existingIdx] = rec;
        else list.unshift(rec);
        count++;
      });
      saveCustomIcons(list.slice(0, 80));
      renderSvgIconPicker();
      return count;
    },
    uninstallMarketplacePack(packId) {
      if (!packId) return;
      savePersonalPresets(loadPersonalPresets().filter(p => p.marketplacePackId !== packId));
      saveCustomIcons(loadCustomIcons().filter(ci => ci.marketplacePackId !== packId));
      renderSavedPresetsList();
      renderSvgIconPicker();
    },
    clearImage() {
      builderDraft.mediaUrl = '';
      builderDraft.mediaLayout = 'none';
      const urlInp = document.getElementById('sysInpMediaUrl');
      if (urlInp) urlInp.value = '';
      const sel = document.getElementById('sysSelMediaLayout');
      if (sel) sel.value = 'none';
      renderMediaPickerStrip();
      refreshPreviewOnly();
    },
    setQuickTimer(sec) {
      builderDraft.timerEnabled = true;
      builderDraft.timerSeconds = sec;
      const chk = document.getElementById('sysChkTimer');
      const secInp = document.getElementById('sysInpTimerSeconds');
      if (chk) chk.checked = true;
      if (secInp) secInp.value = sec;
      refreshPreviewOnly();
    },
    addStatBoost() {
      builderDraft.statBoosts = builderDraft.statBoosts || [];
      builderDraft.statBoosts.push({ label: 'STR', delta: '+10' });
      renderBoostsEditor();
      refreshPreviewOnly();
    },
    removeStatBoost(idx) {
      builderDraft.statBoosts.splice(idx, 1);
      renderBoostsEditor();
      refreshPreviewOnly();
    },
    addInventoryItem() {
      builderDraft.inventoryItems = builderDraft.inventoryItems || [];
      builderDraft.inventoryItems.push({ icon: '🗡️', name: 'New Item', rarity: 'rare', qty: '1', equipped: false, locked: false });
      renderInventoryEditor();
      refreshPreviewOnly();
    },
    removeInventoryItem(idx) {
      builderDraft.inventoryItems.splice(idx, 1);
      renderInventoryEditor();
      refreshPreviewOnly();
    },
    addShopItem() {
      builderDraft.shopItems = builderDraft.shopItems || [];
      builderDraft.shopItems.push({ icon: '🧪', name: 'Mystery Potion', rarity: 'epic', meta: 'Restores MP', price: '10,000 G', locked: false, owned: false });
      renderShopEditor();
      refreshPreviewOnly();
    },
    removeShopItem(idx) {
      builderDraft.shopItems.splice(idx, 1);
      renderShopEditor();
      refreshPreviewOnly();
    },
    pickCustomItemImage(listKey, idx) {
      if (!builderDraft || !Array.isArray(builderDraft[listKey]) || !builderDraft[listKey][idx]) return;
      const picker = document.createElement('input');
      picker.type = 'file';
      picker.accept = 'image/png,image/jpeg,image/webp,image/gif,image/svg+xml';
      picker.onchange = (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
          const rawUrl = String(ev.target.result || '');
          if (!rawUrl.startsWith('data:image/')) return;
          const finishAssign = (finalUrl) => {
            if (!builderDraft[listKey] || !builderDraft[listKey][idx]) return;
            builderDraft[listKey][idx].iconImage = finalUrl;
            if (listKey === 'shopItems') renderShopEditor();
            else renderInventoryEditor();
            refreshPreviewOnly();
            if (api() && typeof api().showToast === 'function') api().showToast('🖼️ Custom item icon attached!');
          };
          if (rawUrl.startsWith('data:image/svg') || rawUrl.startsWith('data:image/gif') || typeof Image === 'undefined') {
            finishAssign(rawUrl);
            return;
          }
          const img = new Image();
          img.onload = () => {
            const maxDim = 256;
            const scale = Math.min(1, maxDim / Math.max(img.width || maxDim, img.height || maxDim));
            const w = Math.max(1, Math.round((img.width || maxDim) * scale));
            const h = Math.max(1, Math.round((img.height || maxDim) * scale));
            try {
              const cv = document.createElement('canvas');
              cv.width = w;
              cv.height = h;
              const ctx = cv.getContext('2d');
              ctx.drawImage(img, 0, 0, w, h);
              finishAssign(cv.toDataURL('image/png'));
            } catch (err) {
              finishAssign(rawUrl);
            }
          };
          img.onerror = () => finishAssign(rawUrl);
          img.src = rawUrl;
        };
        reader.readAsDataURL(file);
      };
      picker.click();
    },
    clearCustomItemImage(listKey, idx) {
      if (!builderDraft || !Array.isArray(builderDraft[listKey]) || !builderDraft[listKey][idx]) return;
      builderDraft[listKey][idx].iconImage = '';
      if (listKey === 'shopItems') renderShopEditor();
      else renderInventoryEditor();
      refreshPreviewOnly();
    },
    addBar() {
      builderDraft.bars = builderDraft.bars || [];
      builderDraft.bars.push({ label: 'EXP', value: 85, fromValue: 20, displayText: '85%', color: builderDraft.accentColor || '#00f0ff', animated: true });
      renderBarsEditor();
      refreshPreviewOnly();
    },
    removeBar(idx) {
      builderDraft.bars.splice(idx, 1);
      renderBarsEditor();
      refreshPreviewOnly();
    },
    addStat() {
      builderDraft.stats = builderDraft.stats || [];
      builderDraft.stats.push({ label: 'NEW STAT', value: 'MAX' });
      renderStatsEditor();
      refreshPreviewOnly();
    },
    removeStat(idx) {
      builderDraft.stats.splice(idx, 1);
      renderStatsEditor();
      refreshPreviewOnly();
    },
    replayPreviewFx() {
      refreshPreviewOnly();
      playSfxForConfig(builderDraft);
    },
    saveCurrentAsPersonalPreset() {
      const nameInp = document.getElementById('sysNewPresetNameInput');
      const typedName = nameInp && nameInp.value.trim();
      const name = (typedName || builderDraft.headerTitle || 'Custom System Style').slice(0, 32);
      const list = loadPersonalPresets();
      list.unshift({ name, savedAt: Date.now(), config: cloneObj(builderDraft) });
      savePersonalPresets(list.slice(0, 60));
      if (nameInp) nameInp.value = '';
      renderSavedPresetsList();
      if (api() && typeof api().showToast === 'function') api().showToast(`💾 Saved "${name}" to My Styles!`);
    },
    loadPersonalPreset(idx) {
      const list = loadPersonalPresets();
      if (!list[idx] || !list[idx].config) return;
      builderDraft = normalizeConfig({ systemConfig: list[idx].config });
      syncInputsFromDraft();
      playSfxForConfig(builderDraft);
    },
    deletePersonalPreset(idx) {
      const list = loadPersonalPresets();
      list.splice(idx, 1);
      savePersonalPresets(list);
      renderSavedPresetsList();
    },
    commitWindow,
    deleteEditingWindow
  };
})();
