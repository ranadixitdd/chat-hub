/* ============================================================================
   MANHWA CHAT HUB — MODULAR MANHWA SYSTEM WINDOW STUDIO
   17 Presets • Inventory & Coin Shop • Level-Up +Stats • Dynamic Penalty Climax
   ============================================================================ */
(() => {
  'use strict';

  const PRESETS_STORAGE_KEY = 'chathub_sys_presets_v1';
  const CUSTOM_ICONS_STORAGE_KEY = 'chathub_sys_custom_icons_v1';

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

  function hexToRgba(hex, alpha = 0.94) {
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
    const a = Math.max(0.2, Math.min(1, Number(alpha) || 0.94));
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

  function getThornFrameSvg() {
    return `<svg class="msw-thorn-svg-frame" viewBox="0 0 320 400" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="mswThornGold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#fef9c3"/>
          <stop offset="50%" stop-color="#facc15"/>
          <stop offset="100%" stop-color="#ea580c"/>
        </linearGradient>
      </defs>
      <path d="M8 14 L22 2 L36 13 L50 2 L66 13 L82 2 L98 13 L114 2 L130 13 L146 2 L160 12 L176 2 L192 13 L208 2 L224 13 L240 2 L256 13 L272 2 L288 13 L302 2 L314 16 L305 32 L318 48 L305 64 L318 82 L305 100 L318 118 L305 138 L318 158 L305 178 L318 198 L305 220 L318 242 L305 264 L318 286 L305 308 L318 332 L305 354 L316 382 L298 397 L280 386 L262 398 L242 387 L222 398 L202 387 L182 398 L160 387 L138 398 L118 387 L98 398 L78 387 L58 398 L40 386 L22 397 L6 382 L15 354 L2 332 L15 308 L2 286 L15 264 L2 242 L15 220 L2 198 L15 178 L2 158 L15 138 L2 118 L15 100 L2 82 L15 64 L2 48 L15 32 Z"
        fill="none" stroke="url(#mswThornGold)" stroke-width="3.6" stroke-linejoin="round"/>
      <path d="M12 18 Q42 8 68 17 M252 17 Q278 8 308 18 M12 382 Q42 392 68 383 M252 383 Q278 392 308 382 M14 20 L36 30 L20 50 M306 20 L284 30 L300 50 M14 380 L36 370 L20 350 M306 380 L284 370 L300 350"
        fill="none" stroke="#ef4444" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
      <rect x="11" y="11" width="298" height="378" rx="16" fill="none" stroke="#dc2626" stroke-width="2" stroke-dasharray="12 4"/>
    </svg>`;
  }

  function getEmblemFrameSvg() {
    return `<svg class="msw-emblem-frame-svg" viewBox="0 0 120 120" preserveAspectRatio="none" aria-hidden="true">
      <path d="M8 10 L20 3 L32 10 L46 3 L60 10 L74 3 L88 10 L100 3 L112 10 L117 22 L110 36 L117 50 L110 64 L117 78 L110 92 L117 108 L110 112 L98 117 L86 110 L72 117 L60 110 L48 117 L34 110 L22 117 L8 110 L3 94 L10 80 L3 66 L10 52 L3 38 L10 24 Z"
        fill="none" stroke="#fde047" stroke-width="2.8" stroke-linejoin="round"/>
      <rect x="6" y="6" width="108" height="108" rx="10" fill="none" stroke="#dc2626" stroke-width="1.8" stroke-dasharray="6 3"/>
    </svg>`;
  }

  function getFrameSvgOverlay(frameStyle) {
    if (frameStyle === 'demonic_thorn') return getThornFrameSvg();
    if (frameStyle === 'celestial_arcane') {
      return `<svg class="msw-thorn-svg-frame" viewBox="0 0 320 400" preserveAspectRatio="none" aria-hidden="true">
        <rect x="8" y="8" width="304" height="384" rx="14" fill="none" stroke="#fde047" stroke-width="2"/>
        <rect x="14" y="14" width="292" height="372" rx="10" fill="none" stroke="#fef08a" stroke-width="1" stroke-dasharray="6 4"/>
        <path d="M10 48 C18 22 36 16 64 10 M310 48 C302 22 284 16 256 10 M10 352 C18 378 36 384 64 390 M310 352 C302 378 284 384 256 390" fill="none" stroke="#fde047" stroke-width="2.8" stroke-linecap="round"/>
        <polygon points="160,3 166,11 160,19 154,11" fill="#fef08a"/>
        <polygon points="160,381 166,389 160,397 154,389" fill="#fef08a"/>
      </svg>`;
    }
    if (frameStyle === 'cursed_chains') {
      return `<svg class="msw-thorn-svg-frame" viewBox="0 0 320 400" preserveAspectRatio="none" aria-hidden="true">
        <rect x="9" y="9" width="302" height="382" rx="8" fill="none" stroke="#ef4444" stroke-width="2.4" stroke-dasharray="14 6"/>
        <path d="M4 34 L34 4 M286 4 L316 34 M4 366 L34 396 M286 396 L316 366" stroke="#fca5a5" stroke-width="3.2" stroke-linecap="round"/>
        <circle cx="16" cy="16" r="5" fill="none" stroke="#facc15" stroke-width="2"/>
        <circle cx="304" cy="16" r="5" fill="none" stroke="#facc15" stroke-width="2"/>
        <circle cx="16" cy="384" r="5" fill="none" stroke="#facc15" stroke-width="2"/>
        <circle cx="304" cy="384" r="5" fill="none" stroke="#facc15" stroke-width="2"/>
      </svg>`;
    }
    if (frameStyle === 'cyber_circuit') {
      return `<svg class="msw-thorn-svg-frame" viewBox="0 0 320 400" preserveAspectRatio="none" aria-hidden="true">
        <path d="M12 40 V12 H66 L80 20 H130 M308 40 V12 H254 L240 20 H190 M12 360 V388 H66 L80 380 H130 M308 360 V388 H254 L240 380 H190" fill="none" stroke="#00f0ff" stroke-width="2.4" stroke-linejoin="round"/>
        <circle cx="130" cy="20" r="3" fill="#00f0ff"/><circle cx="190" cy="20" r="3" fill="#00f0ff"/>
        <circle cx="130" cy="380" r="3" fill="#00f0ff"/><circle cx="190" cy="380" r="3" fill="#00f0ff"/>
      </svg>`;
    }
    if (frameStyle === 'dragon_scroll') {
      return `<svg class="msw-thorn-svg-frame" viewBox="0 0 320 400" preserveAspectRatio="none" aria-hidden="true">
        <path d="M10 38 H28 V16 H52 M310 38 H292 V16 H268 M10 362 H28 V384 H52 M310 362 H292 V384 H268" fill="none" stroke="#fde047" stroke-width="2.8" stroke-linejoin="round"/>
        <rect x="14" y="14" width="292" height="372" rx="4" fill="none" stroke="currentColor" stroke-width="1.4" stroke-opacity="0.6"/>
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
        footerText: 'Player System Notification • [Click to Edit]'
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
        footerText: 'Status Synced with Soul Core'
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
        stats: [],
        pills: ['Soul-Bound Vault', 'Zero Weight Limit'],
        timerEnabled: false,
        timerSeconds: 0,
        timerLabel: '',
        buttons: [],
        stampText: '',
        stampColor: '#00f0ff',
        footerText: 'Tap item slot to toggle Equip / Inspect'
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
        footerText: 'DO NOT STOP RUNNING'
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
    }
  ];

  function getDefaultConfig() {
    return cloneObj(PRESETS[0].config);
  }

  function getEmptyBaseConfig() {
    return {
      presetId: 'notification',
      ...themeProps('hunter_blue'),
      cardStyle: 'standard',
      hideHeader: false,
      starburst: false,
      transparentBg: false,
      iconSeamless: false,
      iconBlendDark: false,
      svgIcon: '',
      customIconData: '',
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
    merged.cardStyle = ['relic', 'codex'].includes(merged.cardStyle) ? merged.cardStyle : 'standard';
    const allSvg = getAllSvgIcons();
    merged.customIconData = merged.customIconData ? (sanitizeCustomSvg(merged.customIconData) || (isSafeUrl(merged.customIconData) ? String(merged.customIconData).trim() : '')) : '';
    merged.svgIcon = (merged.svgIcon && (allSvg[merged.svgIcon] || merged.customIconData)) ? merged.svgIcon : '';
    if (merged.svgIcon && allSvg[merged.svgIcon] && allSvg[merged.svgIcon].isCustom && !merged.customIconData) {
      merged.customIconData = allSvg[merged.svgIcon].rawSvg || allSvg[merged.svgIcon].imageUrl || '';
    }
    delete merged.customFrameUrl;
    merged.transparentBg = false;
    merged.iconSeamless = Boolean(merged.iconSeamless);
    merged.iconBlendDark = Boolean(merged.iconBlendDark);
    merged.hideHeader = Boolean(merged.hideHeader);
    merged.starburst = Boolean(merged.starburst);
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
    merged.inventoryItems = Array.isArray(merged.inventoryItems) ? merged.inventoryItems.map(it => ({
      icon: String(it.icon || '📦'),
      name: String(it.name || 'Item'),
      rarity: normalizeRarity(it.rarity),
      qty: String(it.qty ?? '1'),
      equipped: Boolean(it.equipped),
      locked: Boolean(it.locked)
    })) : [];
    merged.shopItems = Array.isArray(merged.shopItems) ? merged.shopItems.map(sp => ({
      icon: String(sp.icon || '🛒'),
      name: String(sp.name || 'Shop Item'),
      rarity: normalizeRarity(sp.rarity),
      meta: String(sp.meta || ''),
      price: String(sp.price || '1,000 G'),
      locked: Boolean(sp.locked),
      owned: Boolean(sp.owned)
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

  function renderSystemWindowElement(msg, opts = {}) {
    const cfg = normalizeConfig(msg);
    const previewMode = !!opts.previewMode;
    const el = document.createElement('div');

    const classes = [
      'manhwa-sys-win',
      'quest-card',
      'frame-' + (cfg.frameStyle || 'tech_brackets'),
      'font-' + (cfg.fontStyle || 'hud'),
      'glow-' + (cfg.glowIntensity || 'high'),
      'anim-' + (cfg.animation || 'hologram')
    ];
    if (cfg.cardStyle && cfg.cardStyle !== 'standard') classes.push('is-card-centered', 'card-' + cfg.cardStyle);
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

    const svgObj = getSvgIconEntry(cfg.svgIcon, cfg.customIconData);
    const hasImgMedia = isSafeUrl(cfg.mediaUrl);
    const hasMedia = (cfg.mediaLayout && cfg.mediaLayout !== 'none' && hasImgMedia) || (cfg.cardStyle === 'standard' && svgObj && !hasImgMedia && cfg.mediaLayout !== 'none');
    const artworkHtml = hasImgMedia
      ? `<img class="msw-media-img" src="${esc(cfg.mediaUrl)}" alt="System Visual">`
      : (svgObj ? svgObj.svg : '');
    const mediaHtml = hasMedia ? `
      <div class="msw-media-wrap layout-${esc(cfg.mediaLayout || 'icon_title')}">
        ${hasImgMedia ? `<img class="msw-media-img" src="${esc(cfg.mediaUrl)}" alt="System Visual">` : `<div class="msw-svg-icon-slot">${svgObj ? svgObj.svg : ''}</div>`}
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
      ${cfg.unlockedAbility ? `<div class="msw-ability-box">${esc(cfg.unlockedAbility)}</div>` : ''}
      ${cfg.statBoosts.length > 0 ? `
        <div class="msw-boost-grid">
          ${cfg.statBoosts.map(sb => `
            <div class="msw-boost-cell">
              <span class="msw-boost-stat">${esc(sb.label)}</span>
              <span class="msw-boost-delta">▲ ${esc(sb.delta)}</span>
            </div>
          `).join('')}
        </div>
      ` : ''}
    ` : '';

    const inventoryHtml = cfg.inventoryItems.length > 0 ? `
      <div class="msw-inv-grid">
        ${cfg.inventoryItems.map((it, idx) => `
          <div class="msw-inv-slot rarity-${esc(it.rarity)} ${it.equipped ? 'is-equipped' : ''} ${it.locked ? 'is-locked' : ''}" data-inv-idx="${idx}" title="${esc(it.name)} (${esc(it.rarity.toUpperCase())})">
            ${it.equipped ? '<span class="msw-inv-tag eqp">EQP</span>' : (it.locked ? '<span class="msw-inv-tag lock">🔒</span>' : '')}
            <span class="msw-inv-icon">${esc(it.icon)}</span>
            <span class="msw-inv-name">${esc(it.name)}</span>
            ${it.qty && it.qty !== '1' ? `<span class="msw-inv-qty">${esc(it.qty.startsWith('x') || isNaN(Number(it.qty)) ? it.qty : 'x' + it.qty)}</span>` : ''}
          </div>
        `).join('')}
      </div>
    ` : '';

    const shopHtml = cfg.shopItems.length > 0 ? `
      <div class="msw-shop-list">
        ${cfg.shopItems.map((sp, idx) => `
          <div class="msw-shop-row rarity-${esc(sp.rarity)}">
            <div class="msw-shop-left">
              <span style="font-size:19px; flex-shrink:0;">${esc(sp.icon)}</span>
              <div class="msw-shop-info">
                <span class="msw-shop-name">${esc(sp.name)}</span>
                ${sp.meta ? `<span class="msw-shop-meta">${esc(sp.meta)}</span>` : ''}
              </div>
            </div>
            <button type="button" class="msw-shop-buy-btn ${sp.owned ? 'owned' : (sp.locked ? 'locked' : '')}" data-shop-idx="${idx}">
              ${sp.owned ? '✔ OWNED' : (sp.locked ? `🔒 ${esc(sp.price)}` : `🪙 ${esc(sp.price)}`)}
            </button>
          </div>
        `).join('')}
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

    const statsHtml = cfg.stats.length > 0 ? `
      <div class="msw-stats-grid cols-${Number(cfg.statsCols) === 3 ? 3 : (Number(cfg.statsCols) === 1 ? 1 : 2)}">
        ${cfg.stats.map(s => `
          <div class="msw-stat-cell">
            <span class="msw-stat-lbl">${esc(s.label)}</span>
            <span class="msw-stat-val">${esc(s.value)}</span>
          </div>
        `).join('')}
      </div>
    ` : '';

    const pillsHtml = cfg.pills.length > 0 ? `
      <div class="msw-pills-row">
        ${cfg.pills.map(p => `<span class="msw-pill-tag">${esc(p)}</span>`).join('')}
      </div>
    ` : '';

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
    const btnsHtml = cfg.buttons.length > 0 ? `
      <div class="msw-btn-row">
        ${cfg.buttons.map((b, i) => `
          <button type="button" class="msw-action-btn ${selectedBtnIdx === i ? 'selected' : ''}" data-msw-btn-idx="${i}">${esc(b.label)}</button>
        `).join('')}
      </div>
    ` : '';

    const stampHtml = cfg.stampText ? `
      <div class="msw-stamp" style="--stamp-color:${esc(cfg.stampColor || '#facc15')}">${esc(cfg.stampText)}</div>
    ` : '';

    const splitClass = hasMedia && (cfg.mediaLayout === 'portrait_left' || cfg.mediaLayout === 'icon_title' || cfg.mediaLayout === 'circle_halo')
      ? `layout-${cfg.mediaLayout === 'icon_title' ? 'icon_title' : 'portrait_left'}`
      : '';

    const topBannerMedia = (hasMedia && cfg.mediaLayout === 'banner_top') ? mediaHtml : '';
    const sideMedia = (hasMedia && cfg.mediaLayout !== 'banner_top') ? mediaHtml : '';
    const frameSvgHtml = getFrameSvgOverlay(cfg.frameStyle);
    const relicSparklesHtml = (cfg.sparkles && cfg.cardStyle === 'relic') ? `
      <div class="msw-sparkles-layer" aria-hidden="true">
        <span style="top:16%; left:14%;">✦</span>
        <span style="top:20%; right:15%; font-size:11px;">✧</span>
        <span style="bottom:32%; left:11%;">✦</span>
        <span style="bottom:28%; right:12%;">✦</span>
      </div>` : '';

    let mainInnerBodyHtml = '';
    if (cfg.cardStyle === 'relic') {
      const emblemVisual = hasImgMedia
        ? `<img src="${esc(cfg.mediaUrl)}" alt="${esc(cfg.headerTitle)}">`
        : (svgObj ? svgObj.svg : `<span style="font-size:52px;">${esc(cfg.headerIcon || '👁️')}</span>`);
      mainInnerBodyHtml = `
        <div class="msw-relic-stage">
          <div class="msw-emblem-box ${cfg.frameStyle === 'demonic_thorn' ? 'is-thorn-emblem' : ''}">
            ${cfg.frameStyle === 'demonic_thorn' ? getEmblemFrameSvg() : ''}
            ${emblemVisual}
          </div>
          ${cfg.headerTitle ? `<div class="msw-relic-title">${esc(cfg.headerTitle)}</div>` : ''}
          ${cfg.subtitle ? `<div class="msw-relic-subtitle">${esc(cfg.subtitle)}</div>` : ''}
          ${cfg.bodyText ? `<div class="msw-relic-desc">${esc(cfg.bodyText)}</div>` : ''}
        </div>
        ${levelUpHtml}
        ${inventoryHtml}
        ${shopHtml}
        ${barsHtml}
        ${statsHtml}
      `;
    } else if (cfg.cardStyle === 'codex') {
      const diagramVisual = hasImgMedia
        ? `<img src="${esc(cfg.mediaUrl)}" alt="${esc(cfg.headerTitle)}">`
        : (svgObj ? svgObj.svg : `<span style="font-size:48px;">${esc(cfg.headerIcon || '📘')}</span>`);
      mainInnerBodyHtml = `
        <div class="msw-codex-stage">
          <div class="msw-codex-diagram">${diagramVisual}</div>
          ${cfg.headerTitle ? `<div class="msw-codex-title">${esc(cfg.headerTitle)}</div>` : ''}
          ${cfg.subtitle ? `<div class="msw-subtitle" style="text-align:center;">${esc(cfg.subtitle)}</div>` : ''}
          ${cfg.bodyText ? `<div class="msw-codex-rules">${esc(cfg.bodyText)}</div>` : ''}
        </div>
        ${levelUpHtml}
        ${inventoryHtml}
        ${shopHtml}
        ${barsHtml}
        ${statsHtml}
      `;
    } else {
      mainInnerBodyHtml = `
        ${cfg.subtitle ? `<div class="msw-subtitle">${esc(cfg.subtitle)}</div>` : ''}
        ${topBannerMedia}
        <div class="msw-main-split ${splitClass}">
          ${sideMedia}
          <div class="msw-content-col">
            ${cfg.bodyText ? `<div class="msw-body-text">${esc(cfg.bodyText)}</div>` : ''}
            ${levelUpHtml}
            ${inventoryHtml}
            ${shopHtml}
            ${barsHtml}
            ${statsHtml}
          </div>
        </div>
      `;
    }

    el.innerHTML = `
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
            ${cfg.headerIcon ? `<span class="msw-header-icon">${esc(cfg.headerIcon)}</span>` : ''}
            <span class="msw-header-title">${esc(cfg.headerTitle || 'SYSTEM WINDOW')}</span>
          </div>
          <div style="display:flex; align-items:center; gap:5px; flex-shrink:0;">
            ${cfg.currencyText ? `<span class="msw-currency-pill">${esc(cfg.currencyText)}</span>` : ''}
            ${cfg.headerBadge ? `<span class="msw-badge">${esc(cfg.headerBadge)}</span>` : ''}
          </div>
        </div>
        ${mainInnerBodyHtml}
        ${pillsHtml}
        ${timerHtml}
        ${btnsHtml}
        ${cfg.footerText ? `<div class="msw-footer"><span>${esc(cfg.footerText)}</span></div>` : ''}
      </div>
    `;

    animateBarsInElement(el);

    el.querySelectorAll('.msw-action-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const idx = Number(btn.dataset.mswBtnIdx);
        if (previewMode) {
          el.querySelectorAll('.msw-action-btn').forEach((b, i) => b.classList.toggle('selected', i === idx));
          if (api() && typeof api().playPopSound === 'function') api().playPopSound(1.1);
          return;
        }
        if (typeof opts.onButtonClick === 'function') {
          opts.onButtonClick(msg, idx, btn.textContent);
        } else if (msg && msg.systemConfig) {
          msg.systemConfig.selectedButtonIdx = idx;
          el.querySelectorAll('.msw-action-btn').forEach((b, i) => b.classList.toggle('selected', i === idx));
          if (api() && typeof api().playPopSound === 'function') api().playPopSound(1.15);
          if (api() && typeof api().saveStudioState === 'function') api().saveStudioState();
        }
      });
    });

    el.querySelectorAll('.msw-inv-slot').forEach(slotEl => {
      slotEl.addEventListener('click', (e) => {
        e.stopPropagation();
        const idx = Number(slotEl.dataset.invIdx);
        const target = (msg && msg.systemConfig && msg.systemConfig.inventoryItems && msg.systemConfig.inventoryItems[idx]) || cfg.inventoryItems[idx];
        if (!target) return;
        if (target.locked) {
          if (api() && typeof api().showToast === 'function') api().showToast(`🔒 ${target.name} is Locked!`);
          if (api() && typeof api().triggerSfxByName === 'function') api().triggerSfxByName('sting', 1.0);
          return;
        }
        target.equipped = !target.equipped;
        slotEl.classList.toggle('is-equipped', target.equipped);
        let tag = slotEl.querySelector('.msw-inv-tag.eqp');
        if (target.equipped && !tag) {
          tag = document.createElement('span');
          tag.className = 'msw-inv-tag eqp';
          tag.textContent = 'EQP';
          slotEl.prepend(tag);
        } else if (!target.equipped && tag) {
          tag.remove();
        }
        if (api() && typeof api().playPopSound === 'function') api().playPopSound(1.15);
        if (api() && typeof api().showToast === 'function') api().showToast(target.equipped ? `⚔️ Equipped ${target.name}!` : `🎒 Unequipped ${target.name}`);
        if (!previewMode && api() && typeof api().saveStudioState === 'function') api().saveStudioState();
      });
    });

    el.querySelectorAll('.msw-shop-buy-btn').forEach(buyBtn => {
      buyBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const idx = Number(buyBtn.dataset.shopIdx);
        const target = (msg && msg.systemConfig && msg.systemConfig.shopItems && msg.systemConfig.shopItems[idx]) || cfg.shopItems[idx];
        if (!target) return;
        if (target.locked) {
          if (api() && typeof api().showToast === 'function') api().showToast(`🔒 Locked: ${target.meta || target.price}`);
          if (api() && typeof api().triggerSfxByName === 'function') api().triggerSfxByName('sting', 1.0);
          return;
        }
        target.owned = true;
        buyBtn.classList.add('owned');
        buyBtn.textContent = '✔ OWNED';
        if (api() && typeof api().triggerSfxByName === 'function') api().triggerSfxByName('sparkle', 1.1);
        if (api() && typeof api().showToast === 'function') api().showToast(`🪙 Purchased ${target.name}!`);
        if (!previewMode && api() && typeof api().saveStudioState === 'function') api().saveStudioState();
      });
    });

    if (cfg.timerEnabled && !previewMode && timerSec > 0) {
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
          if (api() && typeof api().triggerSfxByName === 'function') api().triggerSfxByName('sting', 0.95);
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
    return { ...cfg, ...themeProps(themeId) };
  }

  function applyOptionalTagModifiers(cfg, parts) {
    const cleanParts = [];
    parts.forEach(p => {
      const m = p.match(/^(theme|frame|accent|stamp|badge|icon)=([#\w\s\-\.\[\]\/✦🔥💀⚡👑]+)$/i);
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

  function makeMsg(cfg, delayMs = 2000, idx = 0) {
    const cleanCfg = normalizeConfig({ systemConfig: cfg });
    return {
      id: 'm_syswin_' + Date.now() + '_' + idx,
      type: 'syswindow',
      title: cleanCfg.headerTitle,
      text: cleanCfg.bodyText || cleanCfg.subtitle || cleanCfg.levelTransition || cleanCfg.headerTitle,
      systemConfig: cleanCfg,
      delayMs
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
      else if (tu.startsWith('LOCKED')) { locked = true; if (isShop) price = tok; }
      else if (tu === 'OWNED') owned = true;
      else if (/^x\d+$/i.test(tok)) qty = tok;
      else if (/\d[\d,]*\s*(?:G|GOLD|C|COINS|GEMS)/i.test(tok)) price = tok;
      else metaNotes.push(tok);
    });

    if (isShop) {
      return { icon, name, rarity, meta: metaNotes.join(' • '), price, locked, owned };
    }
    return { icon, name, rarity, qty, equipped, locked };
  }

  function parseSysWindowLine(line, idx = 0) {
    if (!line || typeof line !== 'string') return null;

    const fullMatch = line.match(/^\[SYSWINDOW:\s*(\{.+\})\]$/i);
    if (fullMatch) {
      try {
        const parsed = JSON.parse(fullMatch[1]);
        return makeMsg(parsed, Number(parsed.holdMs) || 1900, idx);
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
      return makeMsg(base, 2000, idx);
    }

    return null;
  }

  function serializeSysWindowToTag(msg) {
    if (!msg || !msg.systemConfig) return '';
    const c = normalizeConfig(msg);
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
        return `${it.name} (${tags.join(', ')})`;
      }).join(', ');
      return `[SYS_INVENTORY: ${c.currencyText || '0 G'} | ${itemsStr}${modSuffix}]`;
    }
    if (c.presetId === 'shop' && c.shopItems.length > 0) {
      const itemsStr = c.shopItems.map(sp => {
        const tags = [sp.locked ? (sp.price || 'LOCKED') : sp.price, sp.rarity.toUpperCase()];
        if (sp.owned) tags.push('OWNED');
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
    if ((c.cardStyle === 'relic' || c.presetId === 'relic') && !c.mediaUrl?.startsWith('data:')) {
      return `[SYS_RELIC: ${[c.headerTitle, c.subtitle, (c.bodyText || '').replace(/\n/g, '\\n')].filter(Boolean).join(' | ')}${modSuffix}]`;
    }
    if ((c.cardStyle === 'codex' || c.presetId === 'codex') && !c.mediaUrl?.startsWith('data:')) {
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
        </div>

        <div class="syswin-body" id="sysWinBuilderBody">
          <div class="syswin-tab-panel active" id="sysTabPanel_presets">
            <div style="font-size:11px; color:#94a3b8; font-weight:700;">Choose any of the 19 Manhwa System Windows (100% editable afterwards):</div>
            <div class="syswin-preset-grid" id="sysWinPresetGrid"></div>
            <div style="margin-top:6px; border-top:1px solid #1e293b; padding-top:8px;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                <span style="font-size:11.5px; font-weight:800; color:#e2e8f0;">💾 My Saved Custom Styles</span>
                <button type="button" class="syswin-chip-btn" onclick="window.ChatHubSystemWindows.saveCurrentAsPersonalPreset()">+ Save Current Design</button>
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

            <div style="display:flex; justify-content:space-between; align-items:center;">
              <span style="font-size:11.5px; font-weight:900; color:#facc15;">🪙 System Coin Shop Items</span>
              <button type="button" class="syswin-chip-btn" onclick="window.ChatHubSystemWindows.addShopItem()">+ Add Shop Item</button>
            </div>
            <div class="syswin-block-list" id="sysWinShopList"></div>

            <div style="display:flex; justify-content:space-between; align-items:center;">
              <span style="font-size:11.5px; font-weight:900; color:#e2e8f0;">📊 Progress / HP / Loading / Affection Bars</span>
              <button type="button" class="syswin-chip-btn" onclick="window.ChatHubSystemWindows.addBar()">+ Add Bar</button>
            </div>
            <div class="syswin-block-list" id="sysWinBarsList"></div>

            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:2px;">
              <span style="font-size:11.5px; font-weight:900; color:#e2e8f0;">🔢 Key-Value Stat Grid</span>
              <div style="display:flex; gap:5px; align-items:center;">
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
          </div>

          <div class="syswin-tab-panel" id="sysTabPanel_style">
            <div>
              <label class="syswin-label">One-Click Manhwa OS Theme</label>
              <div class="syswin-chip-row" id="sysWinThemesRow"></div>
            </div>
            <div class="syswin-field-row">
              <div>
                <label class="syswin-label">Frame Geometry (12 Built-In Vector Frames)</label>
                <select class="syswin-select" id="sysSelFrameStyle">
                  <option value="tech_brackets">Tech L-Brackets (Solo Hunter)</option>
                  <option value="cyber_bevel">Cut-Corner Cyber Plate</option>
                  <option value="imperial_ornate">Ornate Imperial / Murim</option>
                  <option value="demonic_thorn">🔥 DEVOUR Thorn & Bone (SVG Frame)</option>
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
                </select>
              </div>
            </div>
            <div>
              <label class="syswin-label">Card Layout Archetype</label>
              <select class="syswin-select" id="sysSelCardStyle">
                <option value="standard">Standard Manhwa HUD Window</option>
                <option value="relic">🔮 Centered Relic / Skill Emblem Card (DEVOUR Style)</option>
                <option value="codex">📘 System Codex Diagram + Rule Card (Interverse Style)</option>
              </select>
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

    renderPresetGrid();
    renderSavedPresetsList();
    renderThemeChips();
    renderMediaPickerStrip();
    renderSvgIconPicker();
    renderBoostsEditor();
    renderInventoryEditor();
    renderShopEditor();
    renderBarsEditor();
    renderStatsEditor();
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

  function renderInventoryEditor() {
    const list = document.getElementById('sysWinInvList');
    if (!list) return;
    if (!builderDraft.inventoryItems || builderDraft.inventoryItems.length === 0) {
      list.innerHTML = '<div style="font-size:10.5px; color:#64748b;">No inventory slots yet. Click "+ Add Slot" to build a Solo Leveling grid!</div>';
      return;
    }
    list.innerHTML = builderDraft.inventoryItems.map((it, idx) => `
      <div class="syswin-block-row">
        <input type="text" class="syswin-input" style="width:42px; text-align:center;" value="${esc(it.icon)}" data-inv-eidx="${idx}" data-inv-efield="icon">
        <input type="text" class="syswin-input" style="flex:1; min-width:90px;" value="${esc(it.name)}" placeholder="Item Name" data-inv-eidx="${idx}" data-inv-efield="name">
        <select class="syswin-select" style="width:88px;" data-inv-eidx="${idx}" data-inv-efield="rarity">
          <option value="common" ${it.rarity === 'common' ? 'selected' : ''}>Common</option>
          <option value="rare" ${it.rarity === 'rare' ? 'selected' : ''}>Rare</option>
          <option value="epic" ${it.rarity === 'epic' ? 'selected' : ''}>Epic</option>
          <option value="legendary" ${it.rarity === 'legendary' ? 'selected' : ''}>Legend</option>
          <option value="mythic" ${it.rarity === 'mythic' ? 'selected' : ''}>Mythic</option>
        </select>
        <input type="text" class="syswin-input" style="width:48px;" value="${esc(it.qty)}" placeholder="x1" title="Qty / Rank" data-inv-eidx="${idx}" data-inv-efield="qty">
        <label style="font-size:10px; color:#4ade80; display:flex; align-items:center; gap:2px;"><input type="checkbox" ${it.equipped ? 'checked' : ''} data-inv-eidx="${idx}" data-inv-efield="equipped">EQP</label>
        <label style="font-size:10px; color:#fca5a5; display:flex; align-items:center; gap:2px;"><input type="checkbox" ${it.locked ? 'checked' : ''} data-inv-eidx="${idx}" data-inv-efield="locked">🔒</label>
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
      list.innerHTML = '<div style="font-size:10.5px; color:#64748b;">No coin shop items yet. Click "+ Add Shop Item" to sell skills & weapons!</div>';
      return;
    }
    list.innerHTML = builderDraft.shopItems.map((sp, idx) => `
      <div class="syswin-block-row">
        <input type="text" class="syswin-input" style="width:42px; text-align:center;" value="${esc(sp.icon)}" data-shop-eidx="${idx}" data-shop-efield="icon">
        <input type="text" class="syswin-input" style="flex:1; min-width:90px;" value="${esc(sp.name)}" placeholder="Item Name" data-shop-eidx="${idx}" data-shop-efield="name">
        <input type="text" class="syswin-input" style="flex:1; min-width:85px;" value="${esc(sp.meta)}" placeholder="Meta / ATK" data-shop-eidx="${idx}" data-shop-efield="meta">
        <input type="text" class="syswin-input" style="width:76px;" value="${esc(sp.price)}" placeholder="50,000 G" data-shop-eidx="${idx}" data-shop-efield="price">
        <label style="font-size:10px; color:#fca5a5; display:flex; align-items:center; gap:2px;"><input type="checkbox" ${sp.locked ? 'checked' : ''} data-shop-eidx="${idx}" data-shop-efield="locked">🔒</label>
        <button type="button" class="syswin-chip-btn" style="color:#fca5a5; padding:4px 8px;" onclick="window.ChatHubSystemWindows.removeShopItem(${idx})">✕</button>
      </div>
    `).join('');
    list.querySelectorAll('[data-shop-eidx]').forEach(inp => {
      const evt = inp.type === 'checkbox' ? 'change' : 'input';
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
    bindChange('sysSelCardStyle', 'cardStyle');

    bindChange('sysSelStatsCols', 'statsCols', v => Number(v) || 2);
    bindInput('sysInpPills', 'pills', v => String(v).split(',').map(s => s.trim()).filter(Boolean));
    bindInput('sysInpButtons', 'buttons', v => String(v).split('|').map(s => s.trim()).filter(Boolean).map(lbl => ({ label: lbl, style: 'neutral' })));
    bindChange('sysChkTimer', 'timerEnabled');
    bindInput('sysInpTimerLabel', 'timerLabel');
    bindInput('sysInpTimerSeconds', 'timerSeconds', v => Math.max(0, parseInt(v, 10) || 0));
    bindInput('sysInpStampText', 'stampText');
    bindInput('sysInpStampColor', 'stampColor');

    bindChange('sysSelFrameStyle', 'frameStyle');
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
    switchTab(editMsgId ? 'content' : 'presets');
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
    api().upsertSystemWindowMessage({
      editMsgId: builderEditingMsgId,
      title: cleanCfg.headerTitle || 'SYSTEM WINDOW',
      text: cleanCfg.bodyText || cleanCfg.subtitle || cleanCfg.levelTransition || cleanCfg.headerTitle,
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
    NEON_SVG_ICONS,
    getAllSvgIcons,
    normalizeConfig,
    renderSystemWindowElement,
    animateBarsInElement,
    applyTimerVisualState,
    parseSysWindowLine,
    serializeSysWindowToTag,
    playSfxForConfig,
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
      const name = (builderDraft.headerTitle || 'Custom System Style').slice(0, 32);
      const list = loadPersonalPresets();
      list.unshift({ name, savedAt: Date.now(), config: cloneObj(builderDraft) });
      savePersonalPresets(list.slice(0, 20));
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
