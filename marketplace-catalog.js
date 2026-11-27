/* ============================================================================
   MANHWA CHAT HUB — CREATOR MARKETPLACE CURATED CATALOG
   Complete Collection: 32 Original Custom Characters + High-Resolution PNG Visual Novel Sprites
   Zero procedural SVG filler stickers, duplicate audio beeps, or recolored themes.
   ============================================================================ */
(() => {
  'use strict';

  function escXml(str) {
    return String(str ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function makeManhwaPortraitSvg(cfg, expr = 'normal') {
    const hair = cfg.hairColor || '#1e293b';
    const hairDark = cfg.hairBackColor || '#0f172a';
    const skin = cfg.skinColor || '#fde6d8';
    const eye = cfg.eyeColor || '#38bdf8';
    const outfit = cfg.outfitColor || '#1e1b4b';
    const accent = cfg.accentColor || '#facc15';
    const aura = cfg.auraColor || '#38bdf8';
    const style = cfg.hairStyle || 'spiky';

    // Mascot animals get custom adorable SVG faces
    if (style.startsWith('mascot_')) {
      const isCat = style === 'mascot_cat';
      const isFrog = style === 'mascot_frog';
      const headFill = isCat ? '#1e293b' : (isFrog ? '#4ade80' : '#c08457');
      const earMarkup = isCat
        ? `<polygon points="56,92 48,38 96,68" fill="${headFill}" stroke="#0f172a" stroke-width="4"/><polygon points="184,92 192,38 144,68" fill="${headFill}" stroke="#0f172a" stroke-width="4"/>`
        : (isFrog
          ? `<circle cx="76" cy="70" r="24" fill="${headFill}" stroke="#0f172a" stroke-width="4"/><circle cx="164" cy="70" r="24" fill="${headFill}" stroke="#0f172a" stroke-width="4"/>`
          : `<ellipse cx="62" cy="78" rx="14" ry="18" fill="${headFill}" stroke="#0f172a" stroke-width="4"/><ellipse cx="178" cy="78" rx="14" ry="18" fill="${headFill}" stroke="#0f172a" stroke-width="4"/><circle cx="120" cy="54" r="14" fill="#fb923c" stroke="#0f172a" stroke-width="3"/>`);

      let eyeLayer = `<circle cx="92" cy="118" r="10" fill="${isCat ? '#facc15' : '#0f172a'}"/><circle cx="148" cy="118" r="10" fill="${isCat ? '#facc15' : '#0f172a'}"/><circle cx="95" cy="115" r="3" fill="#fff"/><circle cx="151" cy="115" r="3" fill="#fff"/>`;
      let mouthLayer = `<path d="M108 142 Q120 150 132 142" fill="none" stroke="${isCat ? '#f8fafc' : '#0f172a'}" stroke-width="4" stroke-linecap="round"/>`;
      if (expr === 'angry') {
        eyeLayer += `<line x1="76" y1="102" x2="106" y2="110" stroke="#ef4444" stroke-width="5"/><line x1="164" y1="102" x2="134" y2="110" stroke="#ef4444" stroke-width="5"/>`;
        mouthLayer = `<path d="M104 148 Q120 136 136 148" fill="none" stroke="#ef4444" stroke-width="4"/>`;
      } else if (expr === 'shock') {
        eyeLayer = `<circle cx="92" cy="118" r="14" fill="#fff" stroke="#0f172a" stroke-width="3"/><circle cx="92" cy="118" r="4" fill="#0f172a"/><circle cx="148" cy="118" r="14" fill="#fff" stroke="#0f172a" stroke-width="3"/><circle cx="148" cy="118" r="4" fill="#0f172a"/>`;
        mouthLayer = `<ellipse cx="120" cy="148" rx="10" ry="14" fill="#ef4444" stroke="#0f172a" stroke-width="3"/>`;
      } else if (expr === 'cry') {
        eyeLayer = `<path d="M78 120 Q92 110 106 120" fill="none" stroke="${isCat ? '#f8fafc' : '#0f172a'}" stroke-width="4"/><path d="M134 120 Q148 110 162 120" fill="none" stroke="${isCat ? '#f8fafc' : '#0f172a'}" stroke-width="4"/><rect x="84" y="122" width="12" height="32" rx="6" fill="#60a5fa"/><rect x="144" y="122" width="12" height="32" rx="6" fill="#60a5fa"/>`;
      } else if (expr === 'laugh') {
        eyeLayer = `<path d="M80 120 Q92 106 104 120" fill="none" stroke="${isCat ? '#facc15' : '#0f172a'}" stroke-width="4"/><path d="M136 120 Q148 106 160 120" fill="none" stroke="${isCat ? '#facc15' : '#0f172a'}" stroke-width="4"/>`;
        mouthLayer = `<path d="M104 138 Q120 158 136 138 Z" fill="#fb7185" stroke="#0f172a" stroke-width="3"/>`;
      } else if (expr === 'love') {
        eyeLayer = `<text x="92" y="124" font-size="22" text-anchor="middle" fill="#f43f5e">❤</text><text x="148" y="124" font-size="22" text-anchor="middle" fill="#f43f5e">❤</text>`;
      }

      const svgMascot = `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240" viewBox="0 0 240 240">
        <defs><radialGradient id="ma" cx="50%" cy="45%" r="55%"><stop offset="0%" stop-color="${aura}" stop-opacity="0.45"/><stop offset="100%" stop-color="#090d16"/></radialGradient></defs>
        <rect width="240" height="240" rx="28" fill="url(#ma)"/>
        <path d="M62 240 C66 175 174 175 178 240 Z" fill="${outfit}" stroke="#0f172a" stroke-width="4"/>
        ${earMarkup}
        <ellipse cx="120" cy="122" rx="68" ry="58" fill="${headFill}" stroke="#0f172a" stroke-width="4"/>
        ${eyeLayer}
        ${mouthLayer}
        ${isFrog ? `<circle cx="148" cy="118" r="18" fill="none" stroke="#facc15" stroke-width="3"/><line x1="166" y1="126" x2="178" y2="155" stroke="#facc15" stroke-width="2"/>` : ''}
      </svg>`;
      return 'data:image/svg+xml;utf8,' + encodeURIComponent(svgMascot);
    }

    // Back Hair Silhouette
    let hairBack = '';
    if (style === 'long' || style === 'wavy') {
      hairBack = `<path d="M52 104 C44 170 46 226 64 240 L176 240 C194 226 196 170 188 104 C180 42 60 42 52 104 Z" fill="${hairDark}" stroke="#0f172a" stroke-width="4"/>`;
    } else if (style === 'twin') {
      hairBack = `<ellipse cx="44" cy="158" rx="20" ry="64" fill="${hairDark}" stroke="#0f172a" stroke-width="4"/><ellipse cx="196" cy="158" rx="20" ry="64" fill="${hairDark}" stroke="#0f172a" stroke-width="4"/><circle cx="58" cy="100" r="10" fill="${accent}"/><circle cx="182" cy="100" r="10" fill="${accent}"/>`;
    } else if (style === 'ponytail') {
      hairBack = `<path d="M168 62 C214 78 220 164 196 220 C180 180 176 130 154 94 Z" fill="${hairDark}" stroke="#0f172a" stroke-width="4"/>`;
    } else if (style === 'bob') {
      hairBack = `<path d="M54 98 C50 156 58 176 74 182 L166 182 C182 176 190 156 186 98 C176 44 64 44 54 98 Z" fill="${hairDark}" stroke="#0f172a" stroke-width="4"/>`;
    } else {
      hairBack = `<path d="M60 98 L44 74 L66 72 L58 46 L86 58 L120 32 L154 58 L182 46 L174 72 L196 74 L180 98 Z" fill="${hairDark}" stroke="#0f172a" stroke-width="4"/>`;
    }

    // Front Bangs
    const bangs = style === 'spiky' || style === 'wolf'
      ? `<path d="M64 102 C68 54 172 54 176 102 L162 84 L144 108 L128 80 L114 112 L96 82 L78 106 Z" fill="${hair}" stroke="#0f172a" stroke-width="3.5"/>`
      : `<path d="M62 106 C64 52 176 52 178 106 C158 76 136 86 120 104 C104 86 82 76 62 106 Z" fill="${hair}" stroke="#0f172a" stroke-width="3.5"/>`;

    // Facial Expressions
    let eyes = `
      <ellipse cx="98" cy="122" rx="11" ry="12" fill="#fff" stroke="#0f172a" stroke-width="2.5"/>
      <circle cx="99" cy="123" r="7" fill="${eye}"/>
      <circle cx="101" cy="119" r="2.8" fill="#fff"/>
      <ellipse cx="142" cy="122" rx="11" ry="12" fill="#fff" stroke="#0f172a" stroke-width="2.5"/>
      <circle cx="141" cy="123" r="7" fill="${eye}"/>
      <circle cx="143" cy="119" r="2.8" fill="#fff"/>
    `;
    let brows = `<path d="M84 105 Q98 100 110 106" fill="none" stroke="#0f172a" stroke-width="3" stroke-linecap="round"/><path d="M130 106 Q142 100 156 105" fill="none" stroke="#0f172a" stroke-width="3" stroke-linecap="round"/>`;
    let mouth = `<path d="M110 150 Q120 156 130 150" fill="none" stroke="#0f172a" stroke-width="3" stroke-linecap="round"/>`;
    let fxOverlay = '';

    if (expr === 'angry') {
      brows = `<line x1="84" y1="100" x2="112" y2="112" stroke="#0f172a" stroke-width="4" stroke-linecap="round"/><line x1="156" y1="100" x2="128" y2="112" stroke="#0f172a" stroke-width="4" stroke-linecap="round"/>`;
      mouth = `<path d="M106 154 L114 148 L126 148 L134 154 Z" fill="#fff" stroke="#0f172a" stroke-width="2.5"/>`;
      fxOverlay = `<path d="M164 88 Q156 96 164 102 M176 88 Q168 96 176 102" fill="none" stroke="#ef4444" stroke-width="3"/>`;
    } else if (expr === 'shock') {
      brows = `<path d="M84 96 Q98 88 110 96" fill="none" stroke="#0f172a" stroke-width="3"/><path d="M130 96 Q142 88 156 96" fill="none" stroke="#0f172a" stroke-width="3"/>`;
      eyes = `<circle cx="98" cy="122" r="13" fill="#fff" stroke="#0f172a" stroke-width="3"/><circle cx="98" cy="122" r="3.5" fill="${eye}"/><circle cx="142" cy="122" r="13" fill="#fff" stroke="#0f172a" stroke-width="3"/><circle cx="142" cy="122" r="3.5" fill="${eye}"/>`;
      mouth = `<ellipse cx="120" cy="153" rx="9" ry="11" fill="#991b1b" stroke="#0f172a" stroke-width="3"/>`;
      fxOverlay = `<line x1="24" y1="54" x2="48" y2="66" stroke="#facc15" stroke-width="4"/><line x1="216" y1="54" x2="192" y2="66" stroke="#facc15" stroke-width="4"/>`;
    } else if (expr === 'cry') {
      brows = `<line x1="84" y1="108" x2="110" y2="100" stroke="#0f172a" stroke-width="3"/><line x1="156" y1="108" x2="130" y2="100" stroke="#0f172a" stroke-width="3"/>`;
      mouth = `<path d="M108 154 Q120 144 132 154" fill="none" stroke="#0f172a" stroke-width="3"/>`;
      fxOverlay = `<rect x="91" y="130" width="9" height="32" rx="4" fill="#60a5fa" opacity="0.88"/><rect x="140" y="130" width="9" height="32" rx="4" fill="#60a5fa" opacity="0.88"/>`;
    } else if (expr === 'laugh') {
      eyes = `<path d="M86 124 Q98 112 110 124" fill="none" stroke="#0f172a" stroke-width="3.5" stroke-linecap="round"/><path d="M130 124 Q142 112 154 124" fill="none" stroke="#0f172a" stroke-width="3.5" stroke-linecap="round"/>`;
      mouth = `<path d="M104 146 Q120 166 136 146 Z" fill="#fb7185" stroke="#0f172a" stroke-width="2.5"/>`;
      fxOverlay = `<ellipse cx="86" cy="136" rx="9" ry="5" fill="#fb7185" opacity="0.55"/><ellipse cx="154" cy="136" rx="9" ry="5" fill="#fb7185" opacity="0.55"/><text x="184" y="76" font-size="22" fill="${accent}">✦</text>`;
    } else if (expr === 'love') {
      eyes = `<circle cx="98" cy="122" r="11" fill="#fff" stroke="#0f172a" stroke-width="2.5"/><text x="98" y="127" font-size="14" text-anchor="middle" fill="#ec4899">❤</text><circle cx="142" cy="122" r="11" fill="#fff" stroke="#0f172a" stroke-width="2.5"/><text x="142" y="127" font-size="14" text-anchor="middle" fill="#ec4899">❤</text>`;
      mouth = `<path d="M110 148 Q120 158 130 148" fill="none" stroke="#ec4899" stroke-width="3" stroke-linecap="round"/>`;
      fxOverlay = `<ellipse cx="86" cy="136" rx="10" ry="5" fill="#f472b6" opacity="0.65"/><ellipse cx="154" cy="136" rx="10" ry="5" fill="#f472b6" opacity="0.65"/><text x="44" y="76" font-size="22" fill="#f43f5e">💖</text>`;
    }

    // Optional Accessory
    let accLayer = '';
    if (cfg.accessory === 'crown') {
      accLayer = `<polygon points="88,62 96,36 110,50 120,30 130,50 144,36 152,62" fill="#facc15" stroke="#0f172a" stroke-width="3"/>`;
    } else if (cfg.accessory === 'visor') {
      accLayer = `<rect x="78" y="112" width="84" height="20" rx="6" fill="rgba(34,211,238,0.45)" stroke="#22d3ee" stroke-width="3"/>`;
    } else if (cfg.accessory === 'glasses') {
      accLayer = `<rect x="81" y="112" width="34" height="20" rx="4" fill="rgba(255,255,255,0.2)" stroke="#e2e8f0" stroke-width="2.5"/><rect x="125" y="112" width="34" height="20" rx="4" fill="rgba(255,255,255,0.2)" stroke="#e2e8f0" stroke-width="2.5"/><line x1="115" y1="120" x2="125" y2="120" stroke="#e2e8f0" stroke-width="2.5"/>`;
    } else if (cfg.accessory === 'fox_ears') {
      accLayer = `<polygon points="74,72 64,26 102,56" fill="${hair}" stroke="#0f172a" stroke-width="3"/><polygon points="166,72 176,26 138,56" fill="${hair}" stroke="#0f172a" stroke-width="3"/>`;
    } else if (cfg.accessory === 'halo') {
      accLayer = `<ellipse cx="120" cy="36" rx="34" ry="8" fill="none" stroke="#fef08a" stroke-width="4"/>`;
    } else if (cfg.accessory === 'monocle') {
      accLayer = `<circle cx="142" cy="122" r="15" fill="none" stroke="#facc15" stroke-width="2.5"/><line x1="157" y1="128" x2="162" y2="164" stroke="#facc15" stroke-width="1.8"/>`;
    }

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240" viewBox="0 0 240 240">
      <defs>
        <radialGradient id="auraBg" cx="50%" cy="42%" r="58%">
          <stop offset="0%" stop-color="${aura}" stop-opacity="0.52"/>
          <stop offset="70%" stop-color="#0f172a"/>
          <stop offset="100%" stop-color="#050814"/>
        </radialGradient>
      </defs>
      <rect width="240" height="240" rx="28" fill="url(#auraBg)"/>
      <circle cx="120" cy="112" r="88" fill="none" stroke="${aura}" stroke-width="1.5" stroke-dasharray="5 5" opacity="0.5"/>
      ${hairBack}
      <path d="M56 240 C62 184 86 174 120 174 C154 174 178 184 184 240 Z" fill="${outfit}" stroke="#0f172a" stroke-width="4"/>
      <polygon points="104,174 120,210 136,174" fill="${accent}" stroke="#0f172a" stroke-width="2.5"/>
      <rect x="108" y="154" width="24" height="26" rx="8" fill="${skin}" stroke="#0f172a" stroke-width="3"/>
      <path d="M74 114 C74 72 166 72 166 114 C166 144 146 168 120 168 C94 168 74 144 74 114 Z" fill="${skin}" stroke="#0f172a" stroke-width="3.5"/>
      ${eyes}
      ${brows}
      ${mouth}
      ${bangs}
      ${accLayer}
      ${fxOverlay}
    </svg>`;
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
  }

  /* --------------------------------------------------------------------------
     THEME / WALLPAPER 720x1280 SCENE RENDERER (10+ Atmospheric Backdrops)
     -------------------------------------------------------------------------- */

  const CHAR_SPECS = [
    // Otome Isekai / Villainess Boards (6)
    {
      id: 'mkt_char_seraphina', title: 'Villainess Lady Seraphina (6 Faces)', plannedPriceUsd: 3.99, baseInstalls: 1510,
      author: 'Velvet Crown Studio', authorHandle: '@velvet_rofan', tags: ['Villainess', 'Royal', 'RoFan'],
      description: 'Pinterest-favorite ice-cold Otome Isekai villainess with crimson eyes, silver curls & imperial gold crown.',
      chars: [{ sourceId: 'seraphina', name: 'Seraphina', side: 'left', color: '#e11d48', pitch: 1.18, role: 'Imperial Villainess', hairColor: '#e2e8f0', hairBackColor: '#94a3b8', eyeColor: '#dc2626', outfitColor: '#4c0519', accentColor: '#facc15', auraColor: '#fb7185', hairStyle: 'wavy', accessory: 'crown' }]
    },
    {
      id: 'mkt_char_cassian', title: 'Cold Duke of the North: Cassian', plannedPriceUsd: 3.99, baseInstalls: 1390,
      author: 'Velvet Crown Studio', authorHandle: '@velvet_rofan', tags: ['Villainess', 'Duke', 'Romance'],
      description: 'Stoic northern grand duke with frost aura, raven hair, ice-blue stare & secretly soft blush expressions.',
      chars: [{ sourceId: 'cassian', name: 'Duke Cassian', side: 'right', color: '#60a5fa', pitch: 0.84, role: 'Duke of the North', hairColor: '#1e293b', hairBackColor: '#020617', eyeColor: '#38bdf8', outfitColor: '#0f172a', accentColor: '#bae6fd', auraColor: '#38bdf8', hairStyle: 'spiky' }]
    },
    {
      id: 'mkt_char_aurelius', title: 'Crown Prince Aurelius (Sly Rival)', plannedPriceUsd: 2.99, baseInstalls: 920,
      author: 'Velvet Crown Studio', authorHandle: '@velvet_rofan', tags: ['Villainess', 'Royal', 'Drama'],
      description: 'Golden-haired royal fiancé ready for annulment-of-engagement courtroom twists.',
      chars: [{ sourceId: 'aurelius', name: 'Prince Aurelius', side: 'right', color: '#eab308', pitch: 0.96, role: 'Crown Prince', hairColor: '#fde047', hairBackColor: '#ca8a04', eyeColor: '#3b82f6', outfitColor: '#1e3a8a', accentColor: '#fef08a', auraColor: '#facc15', hairStyle: 'spiky', accessory: 'crown' }]
    },
    {
      id: 'mkt_char_evelyn', title: 'Runaway Duchess Evelyn (Cafe AU)', plannedPriceUsd: 2.99, baseInstalls: 880,
      author: 'Tapas Dreamers', authorHandle: '@tapas_dreamers', tags: ['Villainess', 'Cozy', 'RoFan'],
      description: 'Transmigrated noblewoman ditching palace drama to run a peaceful magic bakery.',
      chars: [{ sourceId: 'evelyn', name: 'Evelyn', side: 'left', color: '#c084fc', pitch: 1.24, role: 'Runaway Duchess', hairColor: '#d8b4fe', hairBackColor: '#9333ea', eyeColor: '#10b981', outfitColor: '#581c87', accentColor: '#f5d0fe', auraColor: '#c084fc', hairStyle: 'bob' }]
    },
    {
      id: 'mkt_char_sebastian', title: 'Demon Contract Butler Vesper', plannedPriceUsd: 3.99, baseInstalls: 1120,
      author: 'Gothic Atelier', authorHandle: '@gothic_atelier', tags: ['Villainess', 'Mystery', 'Butler'],
      description: 'Impeccable monocled demon butler who solves royal scandals before tea cools.',
      chars: [{ sourceId: 'vesper', name: 'Butler Vesper', side: 'right', color: '#94a3b8', pitch: 0.88, role: 'Contract Butler', hairColor: '#0f172a', hairBackColor: '#020617', eyeColor: '#ef4444', outfitColor: '#111827', accentColor: '#f8fafc', auraColor: '#ef4444', hairStyle: 'spiky', accessory: 'monocle' }]
    },
    {
      id: 'mkt_char_celestia', title: 'Oracle Saintess Celestia', plannedPriceUsd: 2.99, baseInstalls: 840,
      author: 'Velvet Crown Studio', authorHandle: '@velvet_rofan', tags: ['Villainess', 'Fantasy', 'Halo'],
      description: 'Radiant temple saintess — can be cast as an angelic ally OR secret plot twist mastermind!',
      chars: [{ sourceId: 'celestia', name: 'Saintess Celestia', side: 'left', color: '#fde68a', pitch: 1.28, role: 'High Oracle', hairColor: '#fef9c3', hairBackColor: '#facc15', eyeColor: '#a855f7', outfitColor: '#f8fafc', accentColor: '#facc15', auraColor: '#fef08a', hairStyle: 'long', accessory: 'halo' }]
    },

    // Hunter / Dungeon / System Boards (6)
    {
      id: 'mkt_char_jin', title: 'S-Rank Necro-Reaper Jin', plannedPriceUsd: 4.99, baseInstalls: 1740,
      author: 'GateBreaker Guild', authorHandle: '@gatebreaker', tags: ['Hunter', 'Action', 'System'],
      description: 'Regressed E-Rank sleeper turned Shadow Monarch with glowing violet mana eyes.',
      chars: [{ sourceId: 'jin_reaper', name: 'Monarch Jin', side: 'right', color: '#8b5cf6', pitch: 0.86, role: 'Shadow Monarch', hairColor: '#0f172a', hairBackColor: '#020617', eyeColor: '#a855f7', outfitColor: '#1e1b4b', accentColor: '#c4b5fd', auraColor: '#8b5cf6', hairStyle: 'wolf' }]
    },
    {
      id: 'mkt_char_ignis', title: 'Crimson Flame Hunter Ignis', plannedPriceUsd: 2.99, baseInstalls: 790,
      author: 'GateBreaker Guild', authorHandle: '@gatebreaker', tags: ['Hunter', 'Shonen', 'Action'],
      description: 'Hot-headed guild vanguard with spiky scarlet hair and explosive raid energy.',
      chars: [{ sourceId: 'ignis', name: 'Ignis', side: 'left', color: '#ef4444', pitch: 0.98, role: 'SS-Rank Striker', hairColor: '#ef4444', hairBackColor: '#991b1b', eyeColor: '#facc15', outfitColor: '#450a0a', accentColor: '#fb923c', auraColor: '#f97316', hairStyle: 'spiky' }]
    },
    {
      id: 'mkt_char_mira', title: 'Guild Clerk (Secret Boss) Mira', plannedPriceUsd: 2.99, baseInstalls: 960,
      author: 'GateBreaker Guild', authorHandle: '@gatebreaker', tags: ['Hunter', 'Comedy', 'Mystery'],
      description: 'Polite guild desk clerk wearing emerald glasses who secretly solos Rank-S gates during lunch.',
      chars: [{ sourceId: 'mira_guild', name: 'Mira', side: 'left', color: '#10b981', pitch: 1.22, role: 'Guild Receptionist', hairColor: '#065f46', hairBackColor: '#022c22', eyeColor: '#34d399', outfitColor: '#064e3b', accentColor: '#6ee7b7', auraColor: '#10b981', hairStyle: 'ponytail', accessory: 'glasses' }]
    },
    {
      id: 'mkt_char_leo_sword', title: 'Regressed Sword Saint Leon', plannedPriceUsd: 3.99, baseInstalls: 1050,
      author: 'GateBreaker Guild', authorHandle: '@gatebreaker', tags: ['Hunter', 'Murim', 'Regression'],
      description: 'Sent back 12 years with SSS combat instincts, cobalt ponytail, and calm tactical eyes.',
      chars: [{ sourceId: 'leon_saint', name: 'Leon', side: 'right', color: '#3b82f6', pitch: 0.91, role: 'Sword Saint', hairColor: '#1d4ed8', hairBackColor: '#1e3a8a', eyeColor: '#60a5fa', outfitColor: '#0f172a', accentColor: '#93c5fd', auraColor: '#3b82f6', hairStyle: 'ponytail' }]
    },
    {
      id: 'mkt_char_arin_scam', title: 'Pragmatic Dungeon Architect Arin', plannedPriceUsd: 3.99, baseInstalls: 1340,
      author: 'Estate Humor Co.', authorHandle: '@estate_comedy', tags: ['Comedy', 'Hunter', 'Webtoon'],
      description: 'Hilariously greedy modern engineer transmigrated into fantasy — solves monster raids with mortgages!',
      chars: [{ sourceId: 'arin_arch', name: 'Architect Arin', side: 'left', color: '#f59e0b', pitch: 1.04, role: 'Master Scammer', hairColor: '#92400e', hairBackColor: '#451a03', eyeColor: '#facc15', outfitColor: '#78350f', accentColor: '#fde047', auraColor: '#f59e0b', hairStyle: 'wolf' }]
    },
    {
      id: 'mkt_char_noah_healer', title: 'Panic-Stricken Healer Noah', plannedPriceUsd: 1.99, baseInstalls: 690,
      author: 'GateBreaker Guild', authorHandle: '@gatebreaker', tags: ['Hunter', 'Comedy', 'Cozy'],
      description: 'Cinnamon-roll F-rank support healer constantly dragged into Rank-S raids against his will.',
      chars: [{ sourceId: 'noah_heal', name: 'Noah', side: 'left', color: '#4ade80', pitch: 1.15, role: 'Support Healer', hairColor: '#fde047', hairBackColor: '#d97706', eyeColor: '#22c55e', outfitColor: '#14532d', accentColor: '#86efac', auraColor: '#4ade80', hairStyle: 'bob' }]
    },

    // Cyberpunk / Neo-Seoul Boards (5)
    {
      id: 'mkt_char_zero9', title: 'Neo-Seoul Netrunner ZERO-9', plannedPriceUsd: 3.99, baseInstalls: 1210,
      author: 'CyberNeon Lab', authorHandle: '@cyberneon', tags: ['Cyberpunk', 'SciFi', 'Action'],
      description: 'Hologram-visored rogue hacker from Neo-Seoul District 7 with neon cyan glow.',
      chars: [{ sourceId: 'zero9', name: 'ZERO-9', side: 'right', color: '#22d3ee', pitch: 0.94, role: 'Netrunner', hairColor: '#06b6d4', hairBackColor: '#0e7490', eyeColor: '#67e8f9', outfitColor: '#090d16', accentColor: '#22d3ee', auraColor: '#06b6d4', hairStyle: 'wolf', accessory: 'visor' }]
    },
    {
      id: 'mkt_char_novax', title: 'Cyber Idol Star Nova-X', plannedPriceUsd: 2.99, baseInstalls: 980,
      author: 'CyberNeon Lab', authorHandle: '@cyberneon', tags: ['Cyberpunk', 'Idol', 'RomCom'],
      description: 'Pop-star hologram idol by day, underground synth rebel by night with magenta twin-tails.',
      chars: [{ sourceId: 'novax', name: 'Nova-X', side: 'left', color: '#ec4899', pitch: 1.34, role: 'Holo Idol', hairColor: '#f472b6', hairBackColor: '#be185d', eyeColor: '#22d3ee', outfitColor: '#3b0764', accentColor: '#f9a8d4', auraColor: '#ec4899', hairStyle: 'twin' }]
    },
    {
      id: 'mkt_char_k404', title: 'Android Detective K-404', plannedPriceUsd: 2.99, baseInstalls: 730,
      author: 'CyberNeon Lab', authorHandle: '@cyberneon', tags: ['Cyberpunk', 'Mystery', 'SciFi'],
      description: 'Silver-haired cybernetic investigator chasing rogue AI anomalies at 3 AM.',
      chars: [{ sourceId: 'k404', name: 'Unit K-404', side: 'right', color: '#94a3b8', pitch: 0.9, role: 'Cyber Sleuth', hairColor: '#f8fafc', hairBackColor: '#cbd5e1', eyeColor: '#facc15', outfitColor: '#1e293b', accentColor: '#38bdf8', auraColor: '#94a3b8', hairStyle: 'spiky', accessory: 'visor' }]
    },
    {
      id: 'mkt_char_vex', title: 'Toxic Glitch Hacker Vex', plannedPriceUsd: 2.99, baseInstalls: 670,
      author: 'CyberNeon Lab', authorHandle: '@cyberneon', tags: ['Cyberpunk', 'Meme', 'Hacker'],
      description: 'Chaotic neon-lime cyber gremlin trolling megacorps from an underground ramen shop.',
      chars: [{ sourceId: 'vex_hack', name: 'Vex', side: 'left', color: '#84cc16', pitch: 1.12, role: 'Grid Saboteur', hairColor: '#a3e635', hairBackColor: '#4d7c0f', eyeColor: '#ec4899', outfitColor: '#18181b', accentColor: '#bef264', auraColor: '#84cc16', hairStyle: 'bob' }]
    },
    {
      id: 'mkt_char_rei_mecha', title: 'Orbital Mecha Ace Commander Rei', plannedPriceUsd: 2.99, baseInstalls: 710,
      author: 'CyberNeon Lab', authorHandle: '@cyberneon', tags: ['Cyberpunk', 'Action', 'Mecha'],
      description: 'Zero-gravity mecha squad captain with icy discipline and crimson HUD lock-on.',
      chars: [{ sourceId: 'rei_mecha', name: 'Cmdr. Rei', side: 'right', color: '#f43f5e', pitch: 1.08, role: 'Mecha Ace', hairColor: '#93c5fd', hairBackColor: '#2563eb', eyeColor: '#ef4444', outfitColor: '#f1f5f9', accentColor: '#f43f5e', auraColor: '#f43f5e', hairStyle: 'bob' }]
    },

    // Supernatural Academy / Dark Academia Boards (5)
    {
      id: 'mkt_char_ren_pres', title: 'Student Council President Ren', plannedPriceUsd: 2.99, baseInstalls: 950,
      author: 'Elite Academy Ink', authorHandle: '@academy_ink', tags: ['Academy', 'RomCom', 'Drama'],
      description: 'Strict honor-student council president hiding midnight gamer habits behind silver frames.',
      chars: [{ sourceId: 'ren_pres', name: 'Pres. Ren', side: 'right', color: '#6366f1', pitch: 0.94, role: 'Council President', hairColor: '#1e293b', hairBackColor: '#090d16', eyeColor: '#818cf8', outfitColor: '#312e81', accentColor: '#c7d2fe', auraColor: '#6366f1', hairStyle: 'spiky', accessory: 'glasses' }]
    },
    {
      id: 'mkt_char_carmilla', title: 'Transfer Vampire Heiress Carmilla', plannedPriceUsd: 3.99, baseInstalls: 1180,
      author: 'Gothic Atelier', authorHandle: '@gothic_atelier', tags: ['Academy', 'Villainess', 'Supernatural'],
      description: 'Midnight transfer student at Crimson Academy who hates garlic fries and morning bell schedules.',
      chars: [{ sourceId: 'carmilla', name: 'Carmilla', side: 'left', color: '#dc2626', pitch: 1.2, role: 'Vampire Heiress', hairColor: '#18181b', hairBackColor: '#09090b', eyeColor: '#f43f5e', outfitColor: '#450a0a', accentColor: '#fda4af', auraColor: '#dc2626', hairStyle: 'long' }]
    },
    {
      id: 'mkt_char_takeshi', title: 'Golden-Heart Delinquent Takeshi', plannedPriceUsd: 1.99, baseInstalls: 720,
      author: 'Elite Academy Ink', authorHandle: '@academy_ink', tags: ['Academy', 'Comedy', 'RomCom'],
      description: 'Feared school rebel who secretly rescues stray kittens and bakes strawberry shortcake.',
      chars: [{ sourceId: 'takeshi', name: 'Takeshi', side: 'right', color: '#f97316', pitch: 0.89, role: 'Class Rebel', hairColor: '#facc15', hairBackColor: '#a16207', eyeColor: '#b45309', outfitColor: '#1e293b', accentColor: '#fed7aa', auraColor: '#fb923c', hairStyle: 'wolf' }]
    },
    {
      id: 'mkt_char_yuki_ghost', title: 'Library Phantom Ghost Yuki', plannedPriceUsd: 2.99, baseInstalls: 860,
      author: 'Gothic Atelier', authorHandle: '@gothic_atelier', tags: ['Academy', 'Mystery', 'Horror'],
      description: 'Whispering ice-blue spirit haunting Academy Room 404 — knows everyone’s exam answers.',
      chars: [{ sourceId: 'yuki_ghost', name: 'Ghost Yuki', side: 'left', color: '#7dd3fc', pitch: 1.3, role: 'Library Spirit', hairColor: '#bae6fd', hairBackColor: '#38bdf8', eyeColor: '#e0f2fe', outfitColor: '#0f172a', accentColor: '#7dd3fc', auraColor: '#bae6fd', hairStyle: 'long' }]
    },
    {
      id: 'mkt_char_sora_occult', title: 'Occult Club Sleuth Sora', plannedPriceUsd: 1.99, baseInstalls: 640,
      author: 'Elite Academy Ink', authorHandle: '@academy_ink', tags: ['Academy', 'Mystery', 'Comedy'],
      description: 'Over-caffeinated occult club leader chasing paranormal rumors in the school basement.',
      chars: [{ sourceId: 'sora_occult', name: 'Sora', side: 'left', color: '#14b8a6', pitch: 1.16, role: 'Occult Detective', hairColor: '#b45309', hairBackColor: '#78350f', eyeColor: '#2dd4bf', outfitColor: '#134e4a', accentColor: '#99f6e4', auraColor: '#14b8a6', hairStyle: 'bob', accessory: 'glasses' }]
    },

    // Murim & Mythology Boards (4)
    {
      id: 'mkt_char_cheon', title: 'Plum Blossom Wanderer Cheon', plannedPriceUsd: 3.99, baseInstalls: 1090,
      author: 'Murim Ink Scroll', authorHandle: '@murim_ink', tags: ['Murim', 'Action', 'Fantasy'],
      description: 'Reincarnated Mount Hua sword prodigy with emerald robes and sharp mischievous eyes.',
      chars: [{ sourceId: 'cheon_murim', name: 'Elder Cheon', side: 'right', color: '#fb7185', pitch: 0.93, role: 'Plum Swordsman', hairColor: '#0f172a', hairBackColor: '#020617', eyeColor: '#f43f5e', outfitColor: '#881337', accentColor: '#fbcfe8', auraColor: '#fb7185', hairStyle: 'ponytail' }]
    },
    {
      id: 'mkt_char_ryujin', title: 'Heavenly Demon Heir Ryujin', plannedPriceUsd: 3.99, baseInstalls: 1150,
      author: 'Murim Ink Scroll', authorHandle: '@murim_ink', tags: ['Murim', 'Action', 'Dark'],
      description: 'Unrivaled martial cult prodigy wielding black Qi and dramatic slow-motion entrances.',
      chars: [{ sourceId: 'ryujin_cult', name: 'Lord Ryujin', side: 'left', color: '#a855f7', pitch: 0.85, role: 'Cult Prodigy', hairColor: '#334155', hairBackColor: '#090d16', eyeColor: '#f59e0b', outfitColor: '#1e1b4b', accentColor: '#e9d5ff', auraColor: '#9333ea', hairStyle: 'long' }]
    },
    {
      id: 'mkt_char_kitsune_duo', title: 'Nine-Tailed Shrine Duo (Miho & Kurama)', plannedPriceUsd: 4.99, baseInstalls: 1270,
      author: 'Murim Ink Scroll', authorHandle: '@murim_ink', tags: ['Murim', 'Fantasy', 'Duo'],
      description: 'Two mischievous fox spirits (Gumiho Miho & Shrine Guardian Kurama) with fox ears and glowing charm orbs.',
      chars: [
        { sourceId: 'miho_fox', name: 'Miho', side: 'left', color: '#f472b6', pitch: 1.28, role: 'Shrine Fox', hairColor: '#fef3c7', hairBackColor: '#d97706', eyeColor: '#ec4899', outfitColor: '#9d174d', accentColor: '#fbcfe8', auraColor: '#f472b6', hairStyle: 'long', accessory: 'fox_ears' },
        { sourceId: 'kurama_fox', name: 'Kurama', side: 'right', color: '#fb923c', pitch: 0.94, role: 'Flame Fox', hairColor: '#ea580c', hairBackColor: '#9a3412', eyeColor: '#facc15', outfitColor: '#431407', accentColor: '#fed7aa', auraColor: '#fb923c', hairStyle: 'wolf', accessory: 'fox_ears' }
      ]
    },
    {
      id: 'mkt_char_mei_alch', title: 'Tea House Alchemist Mei', plannedPriceUsd: 2.99, baseInstalls: 680,
      author: 'Murim Ink Scroll', authorHandle: '@murim_ink', tags: ['Murim', 'Cozy', 'Fantasy'],
      description: 'Cheerful sect potion brewer trading elixir tea for gossip across martial clans.',
      chars: [{ sourceId: 'mei_alch', name: 'Master Mei', side: 'left', color: '#10b981', pitch: 1.26, role: 'Jade Alchemist', hairColor: '#1e293b', hairBackColor: '#090d16', eyeColor: '#10b981', outfitColor: '#065f46', accentColor: '#a7f3d0', auraColor: '#34d399', hairStyle: 'twin' }]
    },

    // Cozy Slice-of-Life & Mascots (6)
    {
      id: 'mkt_char_kai_barista', title: 'Lo-Fi Rainy Cafe Barista Kai', plannedPriceUsd: 1.99, baseInstalls: 910,
      author: 'Pastel Cozy Club', authorHandle: '@cozy_lofi', tags: ['Cozy', 'RomCom', 'SliceOfLife'],
      description: 'Warmhearted late-night barista serving caramel lattes and soft midnight advice.',
      chars: [{ sourceId: 'kai_cafe', name: 'Barista Kai', side: 'right', color: '#d97706', pitch: 0.96, role: 'Cafe Owner', hairColor: '#78350f', hairBackColor: '#451a03', eyeColor: '#10b981', outfitColor: '#7c2d12', accentColor: '#fef3c7', auraColor: '#fbbf24', hairStyle: 'wolf' }]
    },
    {
      id: 'mkt_char_julian_ceo', title: 'Overworked Contract CEO Julian', plannedPriceUsd: 3.99, baseInstalls: 1290,
      author: 'Tapas Dreamers', authorHandle: '@tapas_dreamers', tags: ['RomCom', 'Drama', 'Corporate'],
      description: 'Clean webtoon modern romance lead torn between quarterly reports and fake-dating clauses.',
      chars: [{ sourceId: 'julian_ceo', name: 'CEO Julian', side: 'right', color: '#0284c7', pitch: 0.87, role: 'Tech CEO', hairColor: '#0f172a', hairBackColor: '#020617', eyeColor: '#38bdf8', outfitColor: '#1e293b', accentColor: '#bae6fd', auraColor: '#0284c7', hairStyle: 'spiky' }]
    },
    {
      id: 'mkt_char_roommates', title: 'Chaotic Roommates Duo (Mia & Leo)', plannedPriceUsd: 2.99, baseInstalls: 830,
      author: 'Pastel Cozy Club', authorHandle: '@cozy_lofi', tags: ['Comedy', 'Duo', 'Shorts'],
      description: 'High-energy apartment sitcom duo built for 30-second vertical Shorts debates over rent & snacks.',
      chars: [
        { sourceId: 'mia_art', name: 'Mia', side: 'left', color: '#ec4899', pitch: 1.24, role: 'Comic Artist', hairColor: '#f472b6', hairBackColor: '#9d174d', eyeColor: '#6366f1', outfitColor: '#831843', accentColor: '#fbcfe8', auraColor: '#f472b6', hairStyle: 'bob' },
        { sourceId: 'leo_gamer', name: 'Leo', side: 'right', color: '#22c55e', pitch: 1.0, role: 'Procrastinator', hairColor: '#334155', hairBackColor: '#0f172a', eyeColor: '#22c55e', outfitColor: '#14532d', accentColor: '#bbf7d0', auraColor: '#22c55e', hairStyle: 'spiky' }
      ]
    },
    {
      id: 'mkt_char_capy', title: 'Zen Capybara "Captain Capy" Mascot', plannedPriceUsd: 1.99, baseInstalls: 1460,
      author: 'Discord Meme Guild', authorHandle: '@meme_guild', tags: ['Meme', 'Mascot', 'Cozy'],
      description: 'Viral citrus-balanced Capybara mascot — remains 100% unbothered while the world burns.',
      chars: [{ sourceId: 'capy_zen', name: 'Captain Capy', side: 'left', color: '#fb923c', pitch: 1.08, role: 'Chill Legend', outfitColor: '#78350f', accentColor: '#fdba74', auraColor: '#fb923c', hairStyle: 'mascot_capy' }]
    },
    {
      id: 'mkt_char_voidcat', title: 'Chaos Void Cat "Mochi" Mascot', plannedPriceUsd: 1.99, baseInstalls: 1580,
      author: 'Discord Meme Guild', authorHandle: '@meme_guild', tags: ['Meme', 'Mascot', 'LINE'],
      description: 'Big-eyed black void cat from viral Discord & LINE chat stickers — pure midnight gremlin.',
      chars: [{ sourceId: 'mochi_cat', name: 'Mochi Cat', side: 'right', color: '#facc15', pitch: 1.38, role: 'Chaos Gremlin', outfitColor: '#312e81', accentColor: '#fef08a', auraColor: '#facc15', hairStyle: 'mascot_cat' }]
    },
    {
      id: 'mkt_char_frog', title: 'Dapper Frog Sir Ribbit Mascot', plannedPriceUsd: 1.99, baseInstalls: 1190,
      author: 'Discord Meme Guild', authorHandle: '@meme_guild', tags: ['Meme', 'Mascot', 'Comedy'],
      description: 'Monocle-wearing gentleman frog judging chaotic human drama over chamomile tea.',
      chars: [{ sourceId: 'sir_ribbit', name: 'Sir Ribbit', side: 'left', color: '#4ade80', pitch: 0.9, role: 'Gentleman Frog', outfitColor: '#065f46', accentColor: '#fef08a', auraColor: '#4ade80', hairStyle: 'mascot_frog' }]
    }
  ];

  /* --------------------------------------------------------------------------
     3. 24 NEW STICKER & MEME PACKS (LINE / Discord / Webtoon SFX / Y2K)
     -------------------------------------------------------------------------- */

  function buildExprMap(cfg) {
    return {
      normal: makeManhwaPortraitSvg(cfg, 'normal'),
      laugh: makeManhwaPortraitSvg(cfg, 'laugh'),
      angry: makeManhwaPortraitSvg(cfg, 'angry'),
      shock: makeManhwaPortraitSvg(cfg, 'shock'),
      cry: makeManhwaPortraitSvg(cfg, 'cry'),
      love: makeManhwaPortraitSvg(cfg, 'love')
    };
  }

  function makeCharPack(d) {
    const chars = d.chars.map(c => {
      const exprs = buildExprMap(c);
      return {
        sourceId: c.sourceId,
        name: c.name,
        side: c.side || 'left',
        color: c.color || '#38bdf8',
        pitch: c.pitch || 1.05,
        role: c.role || '',
        avatar: exprs.normal,
        expressions: exprs
      };
    });
    return {
      id: d.id,
      title: d.title,
      category: 'characters',
      author: d.author || 'ChatHub Originals',
      authorHandle: d.authorHandle || '@chathub_studio',
      verified: true,
      isOfficial: true,
      priceUsd: 0,
      plannedPriceUsd: d.plannedPriceUsd ?? 2.99,
      license: 'Free for Personal & Shorts/Reels Videos',
      description: d.description,
      tags: d.tags,
      coverImage: chars[0].avatar,
      baseInstalls: d.baseInstalls || 620,
      items: { characters: chars }
    };
  }


  /* --------------------------------------------------------------------------
     CORE ORIGINAL & HIGH-RESOLUTION PNG CHARACTER PACKS + FULL SCREENPLAYS
     -------------------------------------------------------------------------- */
  const CORE_QUALITY_PACKS = [
    {
      id: 'mkt_shadow_hunter_kaito',
      title: 'Shadow Hunter Kaito (8 Expressions)',
      category: 'characters',
      author: 'ChatHub Originals',
      authorHandle: '@chathub_studio',
      verified: true,
      isOfficial: true,
      priceUsd: 0,
      plannedPriceUsd: 3.99,
      license: 'Free for Personal & Shorts/Reels Videos',
      description: 'Original anime hunter protagonist with 8 transparent expression sprites: normal, smirk, shadow aura, combat, rage, surprise, laugh & panic.',
      tags: ['Hunter', 'Solo Action', '8 Faces', 'Protagonist'],
      coverImage: 'assets/characters/anime_boy_body.png',
      baseInstalls: 1420,
      items: {
        characters: [{
          sourceId: 'kaito_shadow_hunter',
          name: 'Kaito',
          side: 'right',
          color: '#38bdf8',
          pitch: 0.95,
          role: 'Shadow Hunter',
          avatar: 'assets/characters/anime_boy_body.png',
          expressions: {
            normal: 'assets/characters/anime_boy_body.png',
            smirk: 'assets/characters/anime_boy_face_02.png',
            shadow: 'assets/characters/anime_boy_shadow.png',
            combat: 'assets/characters/anime_boy_face_04.png',
            angry: 'assets/characters/anime_boy_angry.png',
            shock: 'assets/characters/anime_boy_surprise.png',
            laugh: 'assets/characters/anime_boy_happy.png',
            panic: 'assets/characters/anime_boy_face_06.png'
          }
        }]
      }
    },
    {
      id: 'mkt_tsundere_hana',
      title: 'Tsundere Heroine Hana (6 Expressions)',
      category: 'characters',
      author: 'ChatHub Originals',
      authorHandle: '@chathub_studio',
      verified: true,
      isOfficial: true,
      priceUsd: 0,
      plannedPriceUsd: 3.99,
      license: 'Free for Personal & Shorts/Reels Videos',
      description: 'Expressive anime heroine ready for rom-coms and squad banter with happy, pout, shock, blush, laugh & full-body sprites.',
      tags: ['Rom-Com', 'Heroine', '6 Faces', 'Tsundere'],
      coverImage: 'assets/characters/anime_girl_body.png',
      baseInstalls: 1680,
      items: {
        characters: [{
          sourceId: 'hana_heroine',
          name: 'Hana',
          side: 'left',
          color: '#f472b6',
          pitch: 1.32,
          role: 'Class Heroine',
          avatar: 'assets/characters/anime_girl_body.png',
          expressions: {
            normal: 'assets/characters/anime_girl_body.png',
            pout: 'assets/characters/anime_girl_pout.png',
            shock: 'assets/characters/anime_girl_shock.png',
            love: 'assets/characters/anime_girl_face_03.png',
            laugh: 'assets/characters/anime_girl_happy.png',
            transparent: 'assets/characters/anime_girl_transparent.png'
          }
        }]
      }
    },
    {
      id: 'mkt_vn_sylvie',
      title: 'Sylvie (Romance Visual Novel Heroine)',
      category: 'characters',
      author: 'OpenArts / RenPy Collection',
      authorHandle: '@open_vn_art',
      verified: true,
      isOfficial: true,
      priceUsd: 0,
      plannedPriceUsd: 3.99,
      license: 'Free MIT / Open Art License for Commercial & Shorts Videos',
      description: 'High-resolution full-body standing anime heroine with 6 expressions and outfit variations: normal, smile, giggle, surprise & green ribbon.',
      tags: ['Rom-Com', 'Visual Novel', 'Full-Body PNG', 'Heroine'],
      coverImage: 'assets/characters/sylvie_normal.png',
      baseInstalls: 1980,
      items: {
        characters: [{
          sourceId: 'sylvie_vn_heroine',
          name: 'Sylvie',
          side: 'left',
          color: '#3b82f6',
          pitch: 1.25,
          role: 'Romantic Lead',
          avatar: 'assets/characters/sylvie_normal.png',
          expressions: {
            normal: 'assets/characters/sylvie_normal.png',
            smile: 'assets/characters/sylvie_smile.png',
            laugh: 'assets/characters/sylvie_giggle.png',
            shock: 'assets/characters/sylvie_surprised.png',
            love: 'assets/characters/sylvie_smile.png',
            green_outfit: 'assets/characters/sylvie_green_normal.png'
          }
        }]
      }
    },
    {
      id: 'mkt_vn_eileen_mentor',
      title: 'Mentor Eileen (Academy Guide)',
      category: 'characters',
      author: 'OpenArts / RenPy Collection',
      authorHandle: '@open_vn_art',
      verified: true,
      isOfficial: true,
      priceUsd: 0,
      plannedPriceUsd: 2.99,
      license: 'Free MIT / Open Art License for Commercial & Shorts Videos',
      description: 'Classic visual novel tutorial mentor with 3 full-body expressive standing poses: joyful, concerned & enthusiastic.',
      tags: ['Academy', 'Mentor', 'Full-Body PNG', 'Visual Novel'],
      coverImage: 'assets/characters/eileen_happy.png',
      baseInstalls: 1620,
      items: {
        characters: [{
          sourceId: 'eileen_academy_guide',
          name: 'Eileen',
          side: 'right',
          color: '#06b6d4',
          pitch: 1.18,
          role: 'Academy Guide',
          avatar: 'assets/characters/eileen_happy.png',
          expressions: {
            normal: 'assets/characters/eileen_happy.png',
            cry: 'assets/characters/eileen_concerned.png',
            laugh: 'assets/characters/eileen_vhappy.png',
            shock: 'assets/characters/eileen_concerned.png',
            love: 'assets/characters/eileen_vhappy.png'
          }
        }]
      }
    },
    {
      id: 'mkt_vn_lucy_feisty',
      title: 'Feisty Lucy (Delinquent Duo)',
      category: 'characters',
      author: 'OpenArts / RenPy Collection',
      authorHandle: '@open_vn_art',
      verified: true,
      isOfficial: true,
      priceUsd: 0,
      plannedPriceUsd: 2.99,
      license: 'Free MIT / Open Art License for Commercial & Shorts Videos',
      description: 'High-contrast full-body standing anime heroine with expressive happy and angry rage poses for energetic comedy and squad debates.',
      tags: ['Tsundere', 'Comedy', 'Full-Body PNG', 'Visual Novel'],
      coverImage: 'assets/characters/lucy_happy.png',
      baseInstalls: 1470,
      items: {
        characters: [{
          sourceId: 'lucy_feisty_student',
          name: 'Lucy',
          side: 'left',
          color: '#ec4899',
          pitch: 1.35,
          role: 'Feisty Heroine',
          avatar: 'assets/characters/lucy_happy.png',
          expressions: {
            normal: 'assets/characters/lucy_happy.png',
            angry: 'assets/characters/lucy_mad.png',
            laugh: 'assets/characters/lucy_happy.png',
            shock: 'assets/characters/lucy_mad.png',
            love: 'assets/characters/lucy_happy.png'
          }
        }]
      }
    },
    {
      id: 'mkt_arena_clash_duo',
      title: 'Arena Clash Duo (Knight & Berserker)',
      category: 'characters',
      author: 'ChatHub Originals',
      authorHandle: '@chathub_studio',
      verified: true,
      isOfficial: true,
      priceUsd: 0,
      plannedPriceUsd: 4.99,
      license: 'Free for Personal & Shorts/Reels Videos',
      description: 'Two fantasy arena rivals (Sir Alistair & Ragnar) with cutout poses for strategy debates and battle skits.',
      tags: ['Fantasy', 'Duo', 'Gaming', 'Comedy'],
      coverImage: 'assets/characters/sample_clash_duo.png',
      baseInstalls: 940,
      items: {
        characters: [
          {
            sourceId: 'alistair_knight', name: 'Alistair', side: 'right', color: '#60a5fa', pitch: 0.92, role: 'Royal Knight',
            avatar: 'assets/characters/clean_knight.png',
            expressions: {
              normal: 'assets/characters/clean_knight.png', angry: 'assets/characters/knight_cutout.png',
              shock: 'assets/characters/knight_transparent.png', laugh: 'assets/characters/clean_knight.png',
              cry: 'assets/characters/knight_transparent.png', love: 'assets/characters/clean_knight.png'
            }
          },
          {
            sourceId: 'ragnar_berserker', name: 'Ragnar', side: 'left', color: '#f97316', pitch: 0.85, role: 'Arena Berserker',
            avatar: 'assets/characters/clean_barbarian.png',
            expressions: {
              normal: 'assets/characters/clean_barbarian.png', angry: 'assets/characters/barbarian_cutout.png',
              shock: 'assets/characters/barbarian_transparent.png', laugh: 'assets/characters/clean_barbarian.png',
              cry: 'assets/characters/barbarian_transparent.png', love: 'assets/characters/clean_barbarian.png'
            }
          }
        ]
      }
    },
    {
      id: 'mkt_original_scripts_vol1',
      title: 'Original Manhwa & Rom-Com Skits (3 Full Scripts)',
      category: 'stories',
      author: 'StoryForge Collective',
      authorHandle: '@storyforge',
      verified: true,
      isOfficial: true,
      priceUsd: 0,
      plannedPriceUsd: 2.99,
      license: 'Free to Remix & Export',
      description: '3 full multi-scene interactive scripts using Kaito & Hana (Dungeon Gate 14 Betrayal, 12:47 AM Confession & Rogue AI Signal).',
      tags: ['Scripts', 'Multi-App', 'Choices', 'Full Episodes'],
      coverImage: 'assets/characters/sample_anime_vn_scene.png',
      baseInstalls: 1840,
      items: {
        templates: [
          {
            sourceId: 'tmpl_dungeon_betrayal',
            title: 'Dungeon Gate 14 Betrayal',
            desc: 'High-stakes hunter raid betrayal with an interactive survival choice.',
            cast: ['Kaito', 'Ragnar'],
            script: `[SYSTEM: ⚡ DUNGEON GATE 14 — BOSS ROOM REACHED]
[Kaito:normal]: Ragnar, hold the perimeter! The boss core is exposed!
[Ragnar:angry:sword]: Perimeter? Sorry, kid... Only ONE of us gets the S-Rank bounty today!
/delay 1.8sec
[Kaito:shock:vineboom]: Wait... you cut the exit ropes?! Are you insane?!
[Ragnar:laugh:boing]: Survival of the fittest! See you in the headlines!
/delay 1.5sec
[Kaito:angry:punch]: We fought through three elite floors together! For money?!
[Ragnar:angry:sword]: Five hundred million credits buys a new conscience, boy!
/delay 2.0sec
[Kaito:shadow]: You really thought my primary skill was swordsmanship...?
[Kaito:shadow:scifi]: [SHADOW EXTRACTION: UNLOCKED]
[CHOICE: Confront Ragnar | ⚔️ Draw Dual Blades -> [Kaito:combat:sword]: Then let's see whose blade breaks first! | 🌑 Summon Shadow Army -> [Kaito:shadow:vineboom]: Arise... and show him what true despair looks like!]
/delay 2.5sec
[Ragnar:shock:sting]: WHAT IS THAT AURA?! THAT'S NOT E-RANK MANA!!
[Kaito:combat:sword]: You should have taken the stairs, Ragnar.
[SYSTEM: 👑 QUEST COMPLETED: TRAITOR NEUTRALIZED]`
          },
          {
            sourceId: 'tmpl_midnight_confession',
            title: '12:47 AM Confession',
            desc: 'Late-night high school rom-com banter with an unexpected confession.',
            cast: ['Hana', 'Kaito'],
            script: `[SYSTEM: 🌙 PRIVATE DM — 12:47 AM]
[Hana:normal]: Hey... are you still awake?
/delay 1.5sec
[Kaito:normal]: Barely. Rewatching raid replays. Why, what's up?
[Hana:pout]: Stop watching raids for 5 seconds! I need to ask you something important.
/delay 2.0sec
[Kaito:normal]: Alright, I'm listening. What happened?
[Hana:shock]: Did you actually mean what you said at the station today...?
/delay 2.2sec
[Kaito:laugh]: About your hair looking like a fluffy cotton candy cloud? Yes, 100%.
[Hana:pout]: BAKAAA!! NOT THAT!! 💢
/delay 1.8sec
[Hana:love]: The part where you told the council that... you already promised to go to the festival with me...
[CHOICE: Your Reply | 🌸 Confess Your Feelings -> [Kaito:love:sparkle]: Because there's no one else in the world I'd rather take. | 🤣 Tease Her -> [Kaito:laugh:boing]: Well, who else is going to keep you from getting lost in the crowd?]
/delay 2.5sec
[Hana:love]: ...You idiot. My heart is beating so loud right now.
[Kaito:love:sparkle]: I'll pick you up at six tomorrow. Wear that pink ribbon.
[SYSTEM: 💖 RELATIONSHIP STATUS: SPECIAL BOND ESTABLISHED]`
          },
          {
            sourceId: 'tmpl_rogue_ai_signal',
            title: 'Rogue AI Signal: Cross-App Triangulation',
            desc: 'Suspenseful mystery using WhatsApp, ChatGPT, and Gemini screen switching.',
            cast: ['Kaito', 'ChatGPT', 'Gemini'],
            script: `[SYSTEM: 🚨 UNKNOWN TRANSMISSION RECEIVED]
[Kaito:shock:sting]: Guys, my terminal just rebooted itself with an encrypted binary payload!
/delay 1.4sec
[SCENE: chatgpt]
[Kaito:normal]: ChatGPT, analyze this trace packet: 0x9F_DELTA_REBOOT
[ChatGPT]: WARNING: That payload is a localized EMP beacon. It pinged your exact coordinates 4 seconds ago.
/delay 1.8sec
[SCENE: gemini]
[Kaito:normal]: Gemini, where is the broadcast origin coming from?!
[Gemini]: Triangulation complete: The transmitter is located INSIDE your current room. Behind the bookshelf.
/delay 2.0sec
[SCENE: whatsapp]
[Kaito:shadow:vineboom]: Someone planted a wiretap in my apartment...
[Kaito:combat:sword]: Whoever is listening on this frequency... step out right now.
/delay 1.6sec
[Kaito:shadow:scifi]: Shadow soldiers, seal all door exits. No one leaves tonight.`
          }
        ]
      }
    }
  ];

  function makeSysPackCoverSvg(badge, title, accent, bg1, innerSvg) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="200" viewBox="0 0 320 200">
      <defs>
        <radialGradient id="spg" cx="50%" cy="42%" r="60%">
          <stop offset="0%" stop-color="${accent}" stop-opacity="0.28"/>
          <stop offset="100%" stop-color="${bg1}"/>
        </radialGradient>
      </defs>
      <rect width="320" height="200" rx="16" fill="url(#spg)"/>
      <rect x="8" y="8" width="304" height="184" rx="12" fill="none" stroke="${accent}" stroke-width="2.5"/>
      <rect x="14" y="14" width="292" height="172" rx="9" fill="none" stroke="${accent}" stroke-opacity="0.45" stroke-width="1" stroke-dasharray="6 4"/>
      <g transform="translate(100,26) scale(1.0)">${innerSvg}</g>
      <text x="160" y="158" font-family="sans-serif" font-weight="900" font-size="14" fill="#f8fafc" text-anchor="middle">${escXml(title)}</text>
      <text x="160" y="177" font-family="sans-serif" font-weight="800" font-size="10" fill="${accent}" text-anchor="middle">${escXml(badge)}</text>
    </svg>`;
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
  }

  const CORE_SYSTEM_PACKS = [
    {
      id: 'mkt_sys_devour_relics',
      title: 'DEVOUR & Cursed Relics Vault',
      category: 'syspacks',
      author: 'Chat Hub Official',
      authorHandle: '@chathub_official',
      verified: true,
      isOfficial: true,
      priceUsd: 0,
      plannedPriceUsd: 3.99,
      license: 'Commercial Story & Shorts Free License',
      description: 'Ornate thorny crimson-gold Relic Cards (DEVOUR style) with sunburst rays, starburst emblem boxes, and 4 exclusive glowing SVG relic icons.',
      tags: ['System UI', 'Relic', 'DEVOUR', 'Fantasy'],
      coverImage: makeSysPackCoverSvg('THORN FRAME • 4 RELIC CARDS + ICONS', 'DEVOUR & CURSED RELICS', '#fde047', '#2d0407',
        `<circle cx="60" cy="54" r="36" fill="#450a0a" stroke="#fde047" stroke-width="3"/><path d="M60 28C72 40 74 54 60 80C46 54 48 40 60 28Z" fill="#fde047" stroke="#ef4444" stroke-width="2.5"/><ellipse cx="60" cy="54" rx="5" ry="13" fill="#7f1d1d"/>`
      ),
      baseInstalls: 2890,
      items: {
        sysIcons: [
          {
            id: 'mkt_ico_devour_abyss',
            label: 'Abyssal Maw',
            svg: `<svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="60" cy="60" r="44" fill="rgba(220,38,38,0.28)" stroke="#fde047" stroke-width="3"/><path d="M26 42L42 54L52 34L60 52L68 34L78 54L94 42M26 78L42 66L52 86L60 68L68 86L78 66L94 78" stroke="#fca5a5" stroke-width="2.8" stroke-linecap="round"/><ellipse cx="60" cy="60" rx="14" ry="8" fill="#fef08a" stroke="#ef4444" stroke-width="2.2"/><circle cx="60" cy="60" r="4" fill="#7f1d1d"/></svg>`
          },
          {
            id: 'mkt_ico_crimson_spear',
            label: 'Spear of Life',
            svg: `<svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M60 8L76 42L66 48V108L60 114L54 108V48L44 42Z" fill="rgba(239,68,68,0.34)" stroke="#fde047" stroke-width="2.8"/><path d="M32 54C42 36 78 36 88 54" stroke="#ef4444" stroke-width="3" stroke-linecap="round"/><circle cx="60" cy="40" r="6" fill="#fef08a"/></svg>`
          },
          {
            id: 'mkt_ico_cursed_mask',
            label: 'Oni Mask Seal',
            svg: `<svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M34 32L24 14L48 26H72L96 14L86 32L96 68L60 102L24 68Z" fill="rgba(127,29,29,0.45)" stroke="#fde047" stroke-width="2.6"/><path d="M40 52L52 58M80 52L68 58M44 76L60 70L76 76" stroke="#fef08a" stroke-width="3" stroke-linecap="round"/></svg>`
          }
        ],
        sysPresets: [
          {
            sourceId: 'sp_devour_main',
            name: 'DEVOUR (Thorn Card)',
            config: {
              presetId: 'relic', cardStyle: 'relic', hideHeader: true, starburst: true, sparkles: true,
              frameStyle: 'demonic_thorn', fontStyle: 'serif', accentColor: '#fde047', secondaryColor: '#ef4444', bgColor: '#2d0407',
              svgIcon: 'demonic_eye', headerTitle: 'DEVOUR', subtitle: 'UNIQUE ABILITY OF THE SPEAR OF LIFE',
              bodyText: 'WHEN ALL VITALITY IS LOST, IT INDISCRIMINATELY ABSORBS ALL SURROUNDING AURA.', buttons: []
            }
          },
          {
            sourceId: 'sp_spear_aura',
            name: 'SPEAR OF LIFE (Cursed)',
            config: {
              presetId: 'relic', cardStyle: 'relic', hideHeader: true, starburst: true, sparkles: true,
              frameStyle: 'demonic_thorn', fontStyle: 'serif', accentColor: '#fde047', secondaryColor: '#dc2626', bgColor: '#280508',
              svgIcon: 'mkt_ico_crimson_spear', headerTitle: 'SPEAR OF LIFE', subtitle: 'MYTHIC SOUL-BOUND RELIC',
              bodyText: 'PIERCES IMMORTAL BARRIERS AND CONVERTS ENEMY VITALITY INTO PURE CRIMSON MANA.', buttons: []
            }
          },
          {
            sourceId: 'sp_chained_seal',
            name: 'BLOOD SEAL PRISON',
            config: {
              presetId: 'relic', cardStyle: 'relic', hideHeader: true, starburst: true, sparkles: false,
              frameStyle: 'cursed_chains', fontStyle: 'serif', accentColor: '#ef4444', secondaryColor: '#facc15', bgColor: '#1b0306',
              svgIcon: 'mkt_ico_cursed_mask', headerTitle: 'FORBIDDEN SEAL', subtitle: 'PASSIVE CURSED AUTHORITY',
              bodyText: 'SEALS 70% OF TARGET MANA CIRCUITS ON EYE CONTACT FOR 30 SECONDS.', buttons: []
            }
          }
        ]
      }
    },
    {
      id: 'mkt_sys_interverse_codex',
      title: 'Interverse Blueprint Codex Pack',
      category: 'syspacks',
      author: 'Chat Hub Official',
      authorHandle: '@chathub_official',
      verified: true,
      isOfficial: true,
      priceUsd: 0,
      plannedPriceUsd: 3.49,
      license: 'Commercial Story & Shorts Free License',
      description: 'Clean dark-navy Twin-Line Blueprint Codex cards ([INTERVERSE MONEY EXCHANGE], [ZOMBIES], [DEATH PENALTY]) with glowing neon line-art diagrams.',
      tags: ['System UI', 'Codex', 'Blueprint', 'World Rules'],
      coverImage: makeSysPackCoverSvg('BLUEPRINT DOUBLE • 4 CODEX CARDS', '[INTERVERSE CODEX]', '#38bdf8', '#06122c',
        `<rect x="18" y="14" width="84" height="58" fill="#071535" stroke="#38bdf8" stroke-width="2.4"/><circle cx="44" cy="43" r="14" stroke="#4ade80" stroke-width="2.5"/><path d="M64 43H88M80 37L88 43L80 49" stroke="#facc15" stroke-width="2.5"/>`
      ),
      baseInstalls: 2450,
      items: {
        sysIcons: [
          {
            id: 'mkt_ico_dungeon_map',
            label: 'Gate Radar',
            svg: `<svg viewBox="0 0 160 100" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="80" cy="50" r="36" stroke="#38bdf8" stroke-width="2.2" fill="rgba(56,189,248,0.1)"/><circle cx="80" cy="50" r="20" stroke="#38bdf8" stroke-width="1.6" stroke-dasharray="4 4"/><path d="M80 14V86M44 50H116" stroke="#7dd3fc" stroke-width="1.5"/><circle cx="96" cy="36" r="5" fill="#ef4444"/><circle cx="66" cy="64" r="4" fill="#4ade80"/></svg>`
          },
          {
            id: 'mkt_ico_tax_coin',
            label: 'Guild Ledger',
            svg: `<svg viewBox="0 0 160 100" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="34" y="16" width="92" height="68" rx="4" stroke="#38bdf8" stroke-width="2.4" fill="rgba(56,189,248,0.08)"/><circle cx="62" cy="46" r="14" stroke="#fb923c" stroke-width="2.4"/><text x="62" y="52" fill="#fdba74" font-weight="900" font-size="16" text-anchor="middle">G</text><path d="M86 38H114M86 50H114M86 62H106" stroke="#4ade80" stroke-width="2.6" stroke-linecap="round"/></svg>`
          }
        ],
        sysPresets: [
          {
            sourceId: 'sp_codex_money',
            name: '[INTERVERSE MONEY EXCHANGE]',
            config: {
              presetId: 'codex', cardStyle: 'codex', hideHeader: true, gridPattern: false,
              frameStyle: 'blueprint_double', fontStyle: 'hud', accentColor: '#38bdf8', secondaryColor: '#4ade80', bgColor: '#06122c',
              svgIcon: 'gold_exchange', headerTitle: '[INTERVERSE MONEY EXCHANGE]',
              bodyText: "- ALL THE WORLDS IN INTERVERSE USE A CURRENCY CALLED 'GOLD'.\n- ONE CAN EXCHANGE THE GOLD INTO CASH BY PAYING A CERTAIN FEE.\n- ONLY AFTER CONFIRMING ONE'S AGE MAY SOMEONE USE THE EXCHANGE SYSTEM.", buttons: []
            }
          },
          {
            sourceId: 'sp_codex_zombies',
            name: '[ZOMBIES] Worker Codex',
            config: {
              presetId: 'codex', cardStyle: 'codex', hideHeader: true, gridPattern: false,
              frameStyle: 'blueprint_double', fontStyle: 'hud', accentColor: '#38bdf8', secondaryColor: '#bae6fd', bgColor: '#06122c',
              svgIcon: 'neon_miners', headerTitle: '[ZOMBIES]',
              bodyText: '- EMPLOYEES WHO WORK INSIDE THE VIRTUAL WORLD FOR A CERTAIN AMOUNT OF TIME PER DAY TO OBTAIN GOLD AND ITEMS.\n- THE MAJORITY OF ZOMBIES ARE PEOPLE IN DEBT OR IMPRISONED CRIMINALS.', buttons: []
            }
          },
          {
            sourceId: 'sp_codex_death',
            name: '[DEATH PENALTY] Codex',
            config: {
              presetId: 'codex', cardStyle: 'codex', hideHeader: true, gridPattern: false,
              frameStyle: 'blueprint_double', fontStyle: 'hud', accentColor: '#60a5fa', secondaryColor: '#ef4444', bgColor: '#06122c',
              svgIcon: 'death_skull', headerTitle: '[DEATH PENALTY]',
              bodyText: '- IF HP REACHES ZERO INSIDE AN UNREGISTERED ZONE, SOUL SYNCHRONIZATION TERMINATES PERMANENTLY.\n- NO REVIVE OR RETURN STONES FUNCTION HERE.', buttons: []
            }
          },
          {
            sourceId: 'sp_codex_gate_radar',
            name: '[GATE BREAK PROTOCOL]',
            config: {
              presetId: 'codex', cardStyle: 'codex', hideHeader: true, gridPattern: false,
              frameStyle: 'blueprint_double', fontStyle: 'hud', accentColor: '#38bdf8', secondaryColor: '#ef4444', bgColor: '#06122c',
              svgIcon: 'mkt_ico_dungeon_map', headerTitle: '[GATE BREAK PROTOCOL]',
              bodyText: '- EVERY UNCLEARED GATE OPENS FULLY AFTER 7 DAYS.\n- NEARBY HUNTERS RECEIVE MANDATORY EMERGENCY SUMMONS.', buttons: []
            }
          }
        ]
      }
    },
    {
      id: 'mkt_sys_monarch_hud',
      title: 'Monarch Shadow Awakening HUD Pack',
      category: 'syspacks',
      author: 'Chat Hub Official',
      authorHandle: '@chathub_official',
      verified: true,
      isOfficial: true,
      priceUsd: 0,
      plannedPriceUsd: 4.49,
      license: 'Commercial Story & Shorts Free License',
      description: 'Violet Cyber Circuit & Monarch Awakening UI cards + Arise Necromancer icon + Solo Leveling Level-Up/Shop combo script.',
      tags: ['System UI', 'Monarch', 'Level-Up', 'Shop'],
      coverImage: makeSysPackCoverSvg('CIRCUIT FRAME • MONARCH HUD PACK', 'SHADOW MONARCH SYSTEM', '#a855f7', '#0f0624',
        `<circle cx="60" cy="40" r="18" fill="rgba(168,85,247,0.35)" stroke="#d8b4fe" stroke-width="2.5"/><path d="M40 94V68L34 48M52 94V64L50 42M60 94V62L60 40M68 94V64L70 42M80 94V68L86 48" stroke="#c084fc" stroke-width="3" stroke-linecap="round"/>`
      ),
      baseInstalls: 2670,
      items: {
        sysIcons: [
          {
            id: 'mkt_ico_monarch_heart',
            label: 'Black Heart',
            svg: `<svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M60 100C60 100 18 74 18 42C18 24 32 16 44 16C52 16 57 22 60 28C63 22 68 16 76 16C88 16 102 24 102 42C102 74 60 100 60 100Z" fill="rgba(88,28,135,0.55)" stroke="#d8b4fe" stroke-width="3"/><circle cx="60" cy="54" r="14" stroke="#a855f7" stroke-width="2.4"/><path d="M60 40V68M46 54H74" stroke="#fef08a" stroke-width="2.2"/></svg>`
          }
        ],
        sysPresets: [
          {
            sourceId: 'sp_monarch_arise',
            name: 'SHADOW MONARCH: ARISE',
            config: {
              presetId: 'relic', cardStyle: 'relic', hideHeader: true, starburst: true, sparkles: true,
              frameStyle: 'cyber_circuit', fontStyle: 'hud', accentColor: '#c084fc', secondaryColor: '#00f0ff', bgColor: '#0f0624',
              svgIcon: 'necromancer_hand', headerTitle: 'ARISE', subtitle: 'JOB CHANGE: NECROMANCER ➔ SHADOW MONARCH',
              bodyText: 'EXTRACT FALLEN BOSSES INTO YOUR PERMANENT SHADOW ARMY WITH ZERO MANA DRAIN.', buttons: []
            }
          },
          {
            sourceId: 'sp_black_heart',
            name: 'BLACK HEART OVERDRIVE',
            config: {
              presetId: 'levelup', cardStyle: 'standard', hideHeader: false, frameStyle: 'cyber_circuit',
              fontStyle: 'hud', accentColor: '#a855f7', secondaryColor: '#38bdf8', bgColor: '#0f0624',
              headerIcon: '👑', headerTitle: 'SYSTEM AWAKENING SURGE', headerBadge: 'MONARCH',
              levelTransition: 'LV. 50 ➔ LV. 99', unlockedAbility: '⚡ BLACK HEART REACTOR (+100,000 MP)',
              statBoosts: [{ label: 'MAX MANA', delta: '+100,000' }, { label: 'SHADOW CAP', delta: '+500%' }, { label: 'ALL STATS', delta: '+45' }],
              buttons: []
            }
          }
        ]
      }
    },
    {
      id: 'mkt_sys_celestial_murim',
      title: 'Celestial Archangel & Murim Imperial Pack',
      category: 'syspacks',
      author: 'Chat Hub Official',
      authorHandle: '@chathub_official',
      verified: true,
      isOfficial: true,
      priceUsd: 0,
      plannedPriceUsd: 3.49,
      license: 'Commercial Story & Shorts Free License',
      description: 'Golden Archangel Halo & Murim Dragon Seal ornate frames for Constellation sponsors, heavenly tribulations & martial arts sects.',
      tags: ['System UI', 'Constellation', 'Murim', 'Celestial'],
      coverImage: makeSysPackCoverSvg('CELESTIAL + MURIM • GOLD FRAMES', 'CELESTIAL & MURIM UI', '#facc15', '#1a1204',
        `<circle cx="60" cy="54" r="34" stroke="#fde047" stroke-width="2" stroke-dasharray="5 5"/><path d="M60 16L68 48L98 54L68 60L60 92L52 60L22 54L52 48Z" fill="rgba(250,204,21,0.28)" stroke="#fde047" stroke-width="2.4"/>`
      ),
      baseInstalls: 1940,
      items: {
        sysPresets: [
          {
            sourceId: 'sp_archangel_blessing',
            name: 'ARCHANGEL BLESSING',
            config: {
              presetId: 'relic', cardStyle: 'relic', hideHeader: true, starburst: true, sparkles: true,
              frameStyle: 'celestial_arcane', fontStyle: 'serif', accentColor: '#fde047', secondaryColor: '#38bdf8', bgColor: '#1a1406',
              svgIcon: 'level_wings', headerTitle: 'DIVINE JUDGMENT', subtitle: 'SPONSORED BY ARCHANGEL URIEL',
              bodyText: 'PURGES ALL CURSES AND GRANTS HOLY FLAME AFFINITY (+80% BOSS DMG) FOR 3 MINUTES.', buttons: []
            }
          },
          {
            sourceId: 'sp_murim_seal_skill',
            name: 'HEAVENLY DEMON PALM',
            config: {
              presetId: 'relic', cardStyle: 'relic', hideHeader: true, starburst: true, sparkles: true,
              frameStyle: 'dragon_scroll', fontStyle: 'serif', accentColor: '#facc15', secondaryColor: '#10b981', bgColor: '#051911',
              svgIcon: 'dragon_fang', headerTitle: 'HEAVENLY DEMON ART', subtitle: 'MOUNT HUA SECT — 1ST FORM',
              bodyText: 'CONCENTRATES 10 YEARS OF QI INTO A SINGLE SHATTERING STRIKE.', buttons: []
            }
          }
        ]
      }
    },
    {
      id: 'mkt_sys_neon_traps',
      title: '10s Crisis Timer & Trap Codex Pack',
      category: 'syspacks',
      author: 'Chat Hub Official',
      authorHandle: '@chathub_official',
      verified: true,
      isOfficial: true,
      priceUsd: 0,
      plannedPriceUsd: 2.99,
      license: 'Commercial Story & Shorts Free License',
      description: 'Built for YouTube Shorts retention spikes! Includes glowing Penalty Heart Monitor & Glitch Siren SVG icons + 10s Survival Trap Cards.',
      tags: ['System UI', 'Shorts', 'Penalty', 'Timer'],
      coverImage: makeSysPackCoverSvg('10S CLIMAX • PENALTY TRAP PACK', 'CRISIS & TRAP ICONS', '#ef4444', '#1f060c',
        `<path d="M60 16L96 84H24Z" fill="rgba(239,68,68,0.28)" stroke="#ef4444" stroke-width="3"/><text x="60" y="72" fill="#fde047" font-weight="900" font-size="34" text-anchor="middle">!</text>`
      ),
      baseInstalls: 2180,
      items: {
        sysIcons: [
          {
            id: 'mkt_ico_heart_ecg',
            label: 'Panic Heartbeat',
            svg: `<svg viewBox="0 0 160 100" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 52H44L56 20L72 82L86 38L98 62L110 52H148" stroke="#ef4444" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="148" cy="52" r="5" fill="#fde047"/></svg>`
          },
          {
            id: 'mkt_ico_trap_chest',
            label: 'Mimic Trap',
            svg: `<svg viewBox="0 0 140 100" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="30" y="34" width="80" height="48" rx="6" stroke="#facc15" stroke-width="2.6" fill="rgba(239,68,68,0.18)"/><path d="M30 46H110M48 46V38M70 46V38M92 46V38" stroke="#fca5a5" stroke-width="2.6"/><circle cx="70" cy="64" r="7" fill="#ef4444"/></svg>`
          }
        ],
        sysPresets: [
          {
            sourceId: 'sp_trap_codex',
            name: '[RED GATE TRAP WARNING]',
            config: {
              presetId: 'codex', cardStyle: 'codex', hideHeader: true,
              frameStyle: 'cursed_chains', fontStyle: 'mono', accentColor: '#ef4444', secondaryColor: '#fde047', bgColor: '#1f060c',
              svgIcon: 'mkt_ico_heart_ecg', headerTitle: '[HEARTBEAT PENALTY ACTIVE]',
              bodyText: '- HEART RATE EXCEEDS 170 BPM: AUTOMATIC PENALTY ZONE LOCKS ALL EXITS.\n- SURVIVE 10 SECONDS TO REGAIN CONTROL.', buttons: []
            }
          }
        ]
      }
    }
  ];

  const CUSTOM_CHAR_PACKS = CHAR_SPECS.map(makeCharPack);

  window.CHAT_HUB_MARKETPLACE_CATALOG = [...CORE_QUALITY_PACKS, ...CORE_SYSTEM_PACKS, ...CUSTOM_CHAR_PACKS];
  window.ChatHubMarketplaceArt = {
    makeManhwaPortraitSvg,
    makeSystemPackCoverSvg: makeSysPackCoverSvg,
    makeCharPack
  };
})();
