  /* =====================================================================
     1. OFFLINE SVG AVATAR GENERATOR & SAFE STORAGE HELPERS
     ===================================================================== */
  const STORAGE_KEY = 'manhwa_whatsapp_comic_studio_v3';
  const STORIES_LIB_KEY = 'manhwa_saved_stories_library';
  let currentStoryTitle = safeGetStorage('wh_current_story_title') || 'Episode 1: The Dorayaki Crisis';
  let currentStoryId = safeGetStorage('wh_current_story_id') || '';
  let savedStories = [];
  try {
    const rawStories = safeGetStorage(STORIES_LIB_KEY);
    if (rawStories) savedStories = JSON.parse(rawStories);
  } catch (e) {
    savedStories = [];
  }

  function safeGetStorage(key) {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      return null;
    }
  }

  function safeSetStorage(key, value) {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (e) {
      showToast('⚠️ Storage full! Use a smaller image or export JSON.');
      return false;
    }
  }

  function makeComicAvatarDataUri(name, bgHex = '#38bdf8', emoji = '⚡') {
    const initials = (name || 'C').trim().slice(0, 2).toUpperCase();
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160">
      <defs>
        <radialGradient id="g" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.35"/>
          <stop offset="100%" stop-color="${bgHex}" stop-opacity="1"/>
        </radialGradient>
      </defs>
      <circle cx="80" cy="80" r="78" fill="${bgHex}"/>
      <circle cx="80" cy="80" r="74" fill="url(#g)" stroke="#0f172a" stroke-width="5"/>
      <text x="80" y="76" font-family="Impact, Arial Black, sans-serif" font-size="42" font-weight="900" fill="#ffffff" stroke="#0f172a" stroke-width="3" text-anchor="middle" dominant-baseline="central">${initials}</text>
      <text x="80" y="122" font-size="34" text-anchor="middle">${emoji}</text>
    </svg>`;
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
  }

  const BUILTIN_EXPRESSIONS = [
    { key: 'normal', label: 'Normal / Default', emoji: '😊' },
    { key: 'cry', label: 'Crying / Sad', emoji: '😭' },
    { key: 'shock', label: 'Shocked / Stunned', emoji: '😱' },
    { key: 'angry', label: 'Angry / Raging', emoji: '💢' },
    { key: 'love', label: 'Love / Blushing', emoji: '😍' },
    { key: 'laugh', label: 'Laughing / Joy', emoji: '🤣' }
  ];

  function ensureCharacterExpressions(char) {
    if (!char) return;
    if (!char.expressions || typeof char.expressions !== 'object') {
      char.expressions = {};
    }
    const nameLower = (char.name || '').toLowerCase();
    const bg = char.color || '#38bdf8';

    if (!char.expressions.normal) {
      char.expressions.normal = char.avatar || makeComicAvatarDataUri(char.name, bg, '😊');
    }

    if (!char.expressions.cry) {
      if (nameLower.includes('nobita')) {
        char.expressions.cry = makeComicAvatarDataUri('NO', bg, '😭');
      } else if (nameLower.includes('doraemon')) {
        char.expressions.cry = makeComicAvatarDataUri('DO', bg, '😭');
      } else if (nameLower.includes('shizuka')) {
        char.expressions.cry = makeComicAvatarDataUri('SH', bg, '😢');
      } else {
        char.expressions.cry = makeComicAvatarDataUri(char.name, bg, '😭');
      }
    }

    if (!char.expressions.shock) {
      if (nameLower.includes('nobita')) {
        char.expressions.shock = makeComicAvatarDataUri('NO', bg, '😱');
      } else if (nameLower.includes('doraemon')) {
        char.expressions.shock = makeComicAvatarDataUri('DO', bg, '🐭');
      } else if (nameLower.includes('shizuka')) {
        char.expressions.shock = makeComicAvatarDataUri('SH', bg, '😱');
      } else {
        char.expressions.shock = makeComicAvatarDataUri(char.name, bg, '😱');
      }
    }

    if (!char.expressions.angry) {
      if (nameLower.includes('nobita')) {
        char.expressions.angry = makeComicAvatarDataUri('NO', bg, '😠');
      } else if (nameLower.includes('doraemon')) {
        char.expressions.angry = makeComicAvatarDataUri('DO', bg, '💢');
      } else if (nameLower.includes('shizuka')) {
        char.expressions.angry = makeComicAvatarDataUri('SH', bg, '😤');
      } else {
        char.expressions.angry = makeComicAvatarDataUri(char.name, bg, '💢');
      }
    }

    if (!char.expressions.love) {
      if (nameLower.includes('nobita')) {
        char.expressions.love = makeComicAvatarDataUri('NO', bg, '😍');
      } else if (nameLower.includes('doraemon')) {
        char.expressions.love = makeComicAvatarDataUri('DO', bg, '🥞');
      } else if (nameLower.includes('shizuka')) {
        char.expressions.love = makeComicAvatarDataUri('SH', bg, '💖');
      } else {
        char.expressions.love = makeComicAvatarDataUri(char.name, bg, '😍');
      }
    }

    if (!char.expressions.laugh) {
      if (nameLower.includes('nobita')) {
        char.expressions.laugh = makeComicAvatarDataUri('NO', bg, '🤣');
      } else if (nameLower.includes('doraemon')) {
        char.expressions.laugh = makeComicAvatarDataUri('DO', bg, '🤣');
      } else if (nameLower.includes('shizuka')) {
        char.expressions.laugh = makeComicAvatarDataUri('SH', bg, '✨');
      } else {
        char.expressions.laugh = makeComicAvatarDataUri(char.name, bg, '🤣');
      }
    }
  }

  function getCharacterAvatarForExpr(char, expr) {
    if (!char) return '';
    ensureCharacterExpressions(char);
    const cleanExpr = (expr || 'normal').toString().trim().toLowerCase();
    if (char.expressions && char.expressions[cleanExpr]) {
      return char.expressions[cleanExpr];
    }
    return char.expressions?.normal || char.avatar || '';
  }

  let groupProfile = {
    name: 'Anime Squad Hub ⚡',
    status: '',
    dp: makeComicAvatarDataUri('AS', '#f59e0b', '⚡'),
    wallpaper: 'wall-doodle',
    customWallpaperData: null,
    aspectRatio: 'ratio-9-16'
  };

  let characters = [
    {
      id: 'c1',
      name: 'Nobita',
      side: 'left',
      color: '#eab308',
      pitch: 1.25,
      avatar: makeComicAvatarDataUri('NO', '#facc15', '👓')
    },
    {
      id: 'c2',
      name: 'Doraemon',
      side: 'right',
      color: '#0284c7',
      pitch: 0.92,
      avatar: makeComicAvatarDataUri('DO', '#38bdf8', '🔔')
    },
    {
      id: 'c3',
      name: 'Shizuka',
      side: 'left',
      color: '#ec4899',
      pitch: 1.38,
      avatar: makeComicAvatarDataUri('SH', '#f472b6', '🌸')
    }
  ];

  characters.forEach(c => ensureCharacterExpressions(c));

  let deletedCastIds = [];

  // Built-in Comic Stickers
  const builtInStickers = [
    { id: 's1', emoji: '🤣', label: 'ROFL', bg: '#fef08a', expr: 'laugh', sfx: 'boing' },
    { id: 's2', emoji: '😭', label: 'WAAH', bg: '#bfdbfe', expr: 'cry', sfx: 'sad' },
    { id: 's3', emoji: '🤬', label: 'RAGE', bg: '#fecaca', expr: 'angry', sfx: 'boom' },
    { id: 's4', emoji: '😱', label: 'SHOCK', bg: '#e9d5ff', expr: 'shock', sfx: 'shock' },
    { id: 's5', emoji: '😍', label: 'LOVE', bg: '#fbcfe8', expr: 'love', sfx: 'sparkle' },
    { id: 's6', emoji: '🫡', label: 'SALUTE', bg: '#bbf7d0', expr: 'normal', sfx: 'pop' },
    { id: 's7', emoji: '💀', label: 'DEAD', bg: '#e2e8f0', expr: 'shock', sfx: 'boom' },
    { id: 's8', emoji: '🎉', label: 'PARTY', bg: '#fde68a', expr: 'laugh', sfx: 'sparkle' },
    { id: 's9', emoji: '🤡', label: 'CLOWN', bg: '#fed7aa', expr: 'shock', sfx: 'vineboom' },
    { id: 's10', emoji: '🗿', label: 'CHAD', bg: '#cbd5e1', expr: 'normal', sfx: 'vineboom' },
    { id: 's11', emoji: '🔥', label: 'FIRE', bg: '#ffedd5', expr: 'angry', sfx: 'boom' },
    { id: 's12', emoji: '👀', label: 'STARE', bg: '#f1f5f9', expr: 'normal', sfx: 'shock' },
    { id: 's13', emoji: '🥺', label: 'PLEASE', bg: '#fee2e2', expr: 'cry', sfx: 'sad' },
    { id: 's14', emoji: '🥶', label: 'COLD', bg: '#bae6fd', expr: 'shock', sfx: 'shock' },
    { id: 's15', emoji: '🤯', label: 'BLOWN', bg: '#fef08a', expr: 'shock', sfx: 'boom' },
    { id: 's16', emoji: '💅', label: 'SLAY', bg: '#fce7f3', expr: 'love', sfx: 'sparkle' },
    { id: 's17', emoji: '😎', label: 'COOL', bg: '#fef9c3', expr: 'normal', sfx: 'pop' },
    { id: 's18', emoji: '🤫', label: 'SECRET', bg: '#e2e8f0', expr: 'normal', sfx: 'pop' },
    { id: 's19', emoji: '😴', label: 'SLEEPY', bg: '#e0e7ff', expr: 'normal', sfx: 'sad' },
    { id: 's20', emoji: '🤤', label: 'DROOL', bg: '#fef3c7', expr: 'love', sfx: 'boing' },
    { id: 's21', emoji: '🤢', label: 'CRINGE', bg: '#dcfce7', expr: 'shock', sfx: 'sad' },
    { id: 's22', emoji: '🫠', label: 'MELT', bg: '#fef08a', expr: 'cry', sfx: 'sad' },
    { id: 's23', emoji: '🥳', label: 'HYPE', bg: '#fbcfe8', expr: 'laugh', sfx: 'sparkle' },
    { id: 's24', emoji: '🤔', label: 'THINK', bg: '#ede9fe', expr: 'normal', sfx: 'pop' },
    { id: 's25', emoji: '😈', label: 'DEVIL', bg: '#f3e8ff', expr: 'angry', sfx: 'boom' },
    { id: 's26', emoji: '👻', label: 'SPOOKY', bg: '#f1f5f9', expr: 'shock', sfx: 'shock' },
    { id: 's27', emoji: '⚡', label: 'BOLT', bg: '#fef08a', expr: 'shock', sfx: 'shock' },
    { id: 's28', emoji: '💖', label: 'HEART', bg: '#ffe4e6', expr: 'love', sfx: 'sparkle' },
    { id: 's29', emoji: '🍰', label: 'CAKE', bg: '#fed7aa', expr: 'love', sfx: 'boing' },
    { id: 's30', emoji: '💣', label: 'BOMB', bg: '#fee2e2', expr: 'angry', sfx: 'boom' },
    { id: 's31', emoji: '👑', label: 'CROWN', bg: '#fef08a', expr: 'normal', sfx: 'sparkle' },
    { id: 's32', emoji: '🥊', label: 'PUNCH', bg: '#fee2e2', expr: 'angry', sfx: 'punch' }
  ];

  let customBuiltInLabels = {};
  try {
    const rawLabels = safeGetStorage('wh_builtin_sticker_labels');
    if (rawLabels) {
      customBuiltInLabels = JSON.parse(rawLabels);
      builtInStickers.forEach(s => {
        if (customBuiltInLabels[s.id]) {
          s.label = customBuiltInLabels[s.id];
        }
      });
    }
  } catch (_) {}

  // Built-in Manga Quick Reactions
  const builtInReactions = [
    { emoji: '💢', label: 'Anger Vein', expr: 'angry', sfx: 'boom' },
    { emoji: '💧', label: 'Sweat Drop', expr: 'cry', sfx: 'sad' },
    { emoji: '😱', label: 'Soul Left Body', expr: 'shock', sfx: 'shock' },
    { emoji: '😍', label: 'Doki Doki', expr: 'love', sfx: 'sparkle' },
    { emoji: '🤣', label: 'Spit Take', expr: 'laugh', sfx: 'boing' },
    { emoji: '🔥', label: 'Max Aura', expr: 'angry', sfx: 'boom' },
    { emoji: '💀', label: 'Critical Hit', expr: 'shock', sfx: 'shock' },
    { emoji: '❓', label: 'Nani?!', expr: 'shock', sfx: 'pop' }
  ];

  let currentSfxCategory = 'all';
  const builtInSfxBursts = [
    // 💥 Combat & Impact
    { text: '👊 POW!!', category: 'combat', expr: 'angry', sfx: 'punch' },
    { text: '💥 BAM!!', category: 'combat', expr: 'angry', sfx: 'punch' },
    { text: '🥊 ORA ORA!!', category: 'combat', expr: 'angry', sfx: 'punch' },
    { text: '⚔️ CLASH!!', category: 'combat', expr: 'shock', sfx: 'sword' },
    { text: '💫 SMACK!!', category: 'combat', expr: 'angry', sfx: 'punch' },
    { text: '💨 WHOOSH!', category: 'combat', expr: 'normal', sfx: 'pop' },
    { text: '⚡ CRACKLE!!', category: 'combat', expr: 'shock', sfx: 'shock' },

    // 😱 Drama & Suspense
    { text: '⚡ NANI?!', category: 'drama', expr: 'shock', sfx: 'sting' },
    { text: '👀 GULP...', category: 'drama', expr: 'shock', sfx: 'vineboom' },
    { text: '💀 OMAE WA MOU...', category: 'drama', expr: 'shock', sfx: 'vineboom' },
    { text: '⚠️ MENACING (ゴゴゴ)', category: 'drama', expr: 'angry', sfx: 'vineboom' },
    { text: '❄️ SHIVER...', category: 'drama', expr: 'cry', sfx: 'shock' },
    { text: '👀 STARE...', category: 'drama', expr: 'normal', sfx: 'shock' },

    // 😂 Comedy & Memes
    { text: '🤣 BWAHAHA!', category: 'comedy', expr: 'laugh', sfx: 'boing' },
    { text: '🤡 BRUH...', category: 'comedy', expr: 'shock', sfx: 'vineboom' },
    { text: '🗿 CHAD SILENCE', category: 'comedy', expr: 'normal', sfx: 'vineboom' },
    { text: '🪗 BOING!!', category: 'comedy', expr: 'laugh', sfx: 'boing' },
    { text: '😭 WAAAHH!!', category: 'comedy', expr: 'cry', sfx: 'sad' },
    { text: '💨 NIGERUNDAYO!!', category: 'comedy', expr: 'shock', sfx: 'pop' },

    // 🔥 Auras & Power
    { text: '🔥 AWAKEN!!', category: 'aura', expr: 'angry', sfx: 'boom' },
    { text: '🌌 DOMAIN EXPANSION!!', category: 'aura', expr: 'shock', sfx: 'scifi' },
    { text: '⚡ 100% POWER!!', category: 'aura', expr: 'angry', sfx: 'boom' },
    { text: '👁️ SHARINGAN!!', category: 'aura', expr: 'shock', sfx: 'sting' },
    { text: '🟦 SYSTEM QUEST!!', category: 'aura', expr: 'normal', sfx: 'scifi' }
  ];

  let currentSoundCategory = 'all';
  const builtInSounds = [
    // 🥊 Combat
    { id: 'punch', category: 'combat', label: '🥊 Gian Punch', fn: () => playPunchSound() },
    { id: 'boom', category: 'combat', label: '💥 Anime Boom', fn: () => playBoomSound() },
    { id: 'sword', category: 'combat', label: '⚔️ Sword Slash', fn: () => playSwordSlashSound() },

    // 😱 Drama
    { id: 'vineboom', category: 'drama', label: '🗿 Vine Boom', fn: () => playVineBoomSound() },
    { id: 'sting', category: 'drama', label: '⚡ Anime Sting', fn: () => playAnimeStingSound() },
    { id: 'shock', category: 'drama', label: '😱 Shock Chord', fn: () => playShockSound() },
    { id: 'scifi', category: 'drama', label: '🟦 Quest Chime', fn: () => playSciFiChimeSound() },

    // 😂 Comedy & Memes
    { id: 'boing', category: 'comedy', label: '🤪 Funny Boing', fn: () => playBoingSound() },
    { id: 'sad', category: 'comedy', label: '🎻 Sad Slide', fn: () => playSadSlideSound() },
    { id: 'sparkle', category: 'comedy', label: '✨ Magic Chime', fn: () => playSparkleSound() },
    { id: 'pop', category: 'comedy', label: '💬 Bubble Pop', fn: () => playPopSound() }
  ];

  let customStickers = [];
  let customAudioClips = [];
  let isDrawerEditMode = false;
  let isVaultEditMode = false;
  let chatStickerSize = parseInt(safeGetStorage('wh_chat_sticker_size'), 10) || 120;
  try {
    document.documentElement.style.setProperty('--chat-sticker-size', `${chatStickerSize}px`);
  } catch (_) {}

  let messages = [
    { id: 'm1', type: 'divider', text: 'EPISODE 1: THE 4D POCKET CRISIS' },
    { id: 'm2', type: 'text', charId: 'c1', text: 'Doraemon!! Help me! Gian said he will turn me into a pancake after school! 😭', expr: 'cry', time: '4:12 PM' },
    { id: 'm3', type: 'text', charId: 'c2', text: 'Sigh... Again?! Did you step on his comic book or challenge him to baseball?', expr: 'angry', time: '4:13 PM' },
    { id: 'm4', type: 'sticker', charId: 'c1', stickerData: builtInStickers[3], expr: 'shock', time: '4:13 PM' },
    { id: 'm5', type: 'text', charId: 'c3', text: 'Wait guys! Look what I just baked for everyone! 🍰✨', expr: 'love', time: '4:14 PM' },
    { id: 'm6', type: 'sfx', charId: 'c2', text: '⚡ DORAYAKI RADAR ACTIVATED!!', expr: 'laugh', time: '4:15 PM' }
  ];

  let currentCharId = 'c1';
  let currentExpr = 'normal';
  let activeDrawerTab = 'stickers';
  let soundEnabled = true;
  let groupConsecutiveMessages = true;
  let cleanRecordMode = false;
  let activeReplyMsgId = null;

  // Typing & Cinema Timers
  let activeTypingTimer = null;
  let activeTypingTickTimer = null;
  let pendingMessageCommit = null;
  let isCinemaPlaying = false;
  let isCinemaPaused = false;
  let cinemaStepTimeout = null;
  let cinemaSpeedMultiplier = parseFloat(safeGetStorage('wh_cinema_speed') || '1.0');
  let cinemaSpamDelayMs = parseInt(safeGetStorage('wh_cinema_spam_delay') || '280', 10);
  let cinemaCameraEngineEnabled = safeGetStorage('wh_cinema_cam_engine') !== 'false';
  let cinemaCamTimeout = null;

  /* =====================================================================
     DYNAMIC 3-5s CINEMA CAMERA ENGINE (AUTO-ZOOM)
     ===================================================================== */
  function setCinemaCamera(camClass, durationMs = 0) {
    if (!cinemaCameraEngineEnabled) return;
    const wrapper = document.getElementById('phoneWrapper');
    if (!wrapper) return;
    if (cinemaCamTimeout) {
      clearTimeout(cinemaCamTimeout);
      cinemaCamTimeout = null;
    }
    wrapper.classList.remove('cam-zoom-left', 'cam-zoom-right', 'cam-zoom-climax', 'cam-normal');
    if (camClass === 'cam-normal') {
      wrapper.classList.add('cam-normal');
      return;
    }
    wrapper.classList.add(camClass);
    if (durationMs > 0) {
      cinemaCamTimeout = setTimeout(() => {
        if (!isCinemaPlaying) return;
        wrapper.classList.remove('cam-zoom-left', 'cam-zoom-right', 'cam-zoom-climax');
        wrapper.classList.add('cam-normal');
      }, durationMs / cinemaSpeedMultiplier);
    }
  }

  function resetCinemaCamera() {
    if (cinemaCamTimeout) {
      clearTimeout(cinemaCamTimeout);
      cinemaCamTimeout = null;
    }
    const wrapper = document.getElementById('phoneWrapper');
    if (wrapper) {
      wrapper.classList.remove('cam-zoom-left', 'cam-zoom-right', 'cam-zoom-climax');
      wrapper.classList.add('cam-normal');
    }
  }

  function toggleCinemaCameraEngine() {
    cinemaCameraEngineEnabled = !cinemaCameraEngineEnabled;
    safeSetStorage('wh_cinema_cam_engine', cinemaCameraEngineEnabled ? 'true' : 'false');
    if (!cinemaCameraEngineEnabled) {
      resetCinemaCamera();
    }
    updateCinemaCamBtnUI();
    showToast(cinemaCameraEngineEnabled ? '🎥 Dynamic Cinema Camera: ON' : '🎥 Dynamic Cinema Camera: OFF');
  }

  function updateCinemaCamBtnUI() {
    const btn = document.getElementById('cinemaCamToggleBtn');
    if (btn) {
      btn.textContent = cinemaCameraEngineEnabled ? '🎥 Cam: ON' : '🎥 Cam: OFF';
      btn.style.borderColor = cinemaCameraEngineEnabled ? '#38bdf8' : '#475569';
      btn.style.color = cinemaCameraEngineEnabled ? '#38bdf8' : '#94a3b8';
    }
    const modalBtn = document.getElementById('modalCamToggleBtn');
    if (modalBtn) {
      modalBtn.textContent = cinemaCameraEngineEnabled ? 'ON' : 'OFF';
      modalBtn.style.background = cinemaCameraEngineEnabled ? '#0284c7' : '#475569';
    }
  }


  /* =====================================================================
     THEME CONTROLLER: REALISTIC WHATSAPP VS POLISHED MANHWA COMIC
     ===================================================================== */
  let chatThemeStyle = safeGetStorage('wh_chat_theme_style') || 'realistic';

  function toggleChatStyle() {
    chatThemeStyle = (chatThemeStyle === 'realistic') ? 'comic' : 'realistic';
    safeSetStorage('wh_chat_theme_style', chatThemeStyle);
    applyChatStyle(chatThemeStyle);
    const msg = (chatThemeStyle === 'realistic') ? '💬 Realistic WhatsApp Style Active' : '💥 Manhwa Comic Style Active';
    showToast(msg);
  }

  function applyChatStyle(style) {
    chatThemeStyle = style;
    const wrapper = document.getElementById('phoneWrapper');
    if (wrapper) {
      if (style === 'comic') {
        wrapper.classList.remove('theme-realistic');
        wrapper.classList.add('theme-comic');
      } else {
        wrapper.classList.remove('theme-comic');
        wrapper.classList.add('theme-realistic');
      }
    }

    const themeBtn = document.getElementById('themeToggleBtn');
    if (themeBtn) {
      themeBtn.title = (style === 'realistic') ? 'Current: Realistic WhatsApp (Click for Comic)' : 'Current: Manhwa Comic (Click for Realistic)';
      themeBtn.textContent = (style === 'realistic') ? '💬' : '🎨';
    }

    const menuThemeItem = document.getElementById('menuThemeToggleItem');
    if (menuThemeItem) {
      menuThemeItem.innerHTML = (style === 'realistic')
        ? '🎨 Style: <b>Realistic WhatsApp</b> (Switch)'
        : '🎨 Style: <b>Manhwa Comic</b> (Switch)';
    }
  }

  function openSpecialEventModal() {
    const m = document.getElementById('specialEventModal');
    if (m) m.classList.add('open');
  }

  function closeSpecialEventModal() {
    const m = document.getElementById('specialEventModal');
    if (m) m.classList.remove('open');
  }


  /* =====================================================================
     MULTIVERSE STORY ENGINE: MULTI-APP SCENE & MULTI-THREAD SYSTEM
     ===================================================================== */
  let activeAppMode = safeGetStorage('chathub_active_app') || 'whatsapp'; // 'whatsapp' | 'chatgpt' | 'gemini'
  let activeGptModel = safeGetStorage('chathub_gpt_model') || 'ChatGPT 4o';
  let activeGeminiModel = safeGetStorage('chathub_gemini_model') || 'Gemini 1.5 Pro';

  let storyScenes = {
    whatsapp: [],
    chatgptThreads: [
      {
        id: 't_gpt_1',
        title: 'Solo Leveling Boss Raid',
        model: 'ChatGPT 4o',
        messages: [
          { id: 'gpt_m1', type: 'text', charId: 'c1', text: 'Hey ChatGPT, analyze the dungeon boss weaknesses from the new Solo Leveling chapter!', expr: 'normal', time: '10:02 AM' },
          { id: 'gpt_m2', type: 'text', charId: 'c_gpt', text: 'Based on the mana signatures, the Shadow Monarch ability will bypass the boss barrier directly if timed within 3 seconds of the roar.', expr: 'shock', time: '10:03 AM' },
          { id: 'gpt_m3', type: 'sfx', charId: 'c_gpt', text: '⚡ BOSS WEAKNESS EXPOSED!', expr: 'angry', time: '10:03 AM' }
        ]
      },
      {
        id: 't_gpt_2',
        title: 'Doraemon Gadget Analysis',
        model: 'ChatGPT 4o',
        messages: [
          { id: 'gpt_m4', type: 'text', charId: 'c2', text: 'ChatGPT, how do we optimize the battery consumption of the Take-Copter?', expr: 'laugh', time: '10:15 AM' },
          { id: 'gpt_m5', type: 'text', charId: 'c_gpt', text: 'By incorporating solar kinetic regeneration on the rotary blades, flight duration increases by 340%!', expr: 'love', time: '10:16 AM' }
        ]
      }
    ],
    activeGptThreadId: 't_gpt_1',
    chatgptProjects: [
      { id: 'p1', name: 'Manhwa Script v1' },
      { id: 'p2', name: 'Solo Leveling Boss Mechanics' },
      { id: 'p3', name: 'Doraemon Gadget Inventions' }
    ],
    chatgptPlugins: [
      { id: 'pl1', name: 'Comic Story Architect', icon: '🤖' },
      { id: 'pl2', name: 'Manhwa Fight Choreographer', icon: '⚔️' },
      { id: 'pl3', name: 'Korean Webtoon Translator', icon: '🌐' }
    ],
    geminiThreads: [
      {
        id: 't_gem_1',
        title: 'Shadow Monarch Aura Study',
        model: 'Gemini 1.5 Pro',
        messages: [
          { id: 'gem_m1', type: 'text', charId: 'c1', text: 'Gemini, do you agree with ChatGPT\'s tactical analysis for the raid?', expr: 'normal', time: '10:05 AM' },
          { id: 'gem_m2', type: 'text', charId: 'c_gem', text: 'ChatGPT is partially right, but watch out: the boss has a secondary berserk phase. Doraemon should ready the Anywhere Door as an emergency escape!', expr: 'love', time: '10:06 AM' }
        ]
      },
      {
        id: 't_gem_2',
        title: 'Urgent Solo Leveling Raid Tactics',
        model: 'Gemini 1.5 Pro',
        messages: [
          { id: 'gem_m3', type: 'text', charId: 'c1', text: 'Gemini, what happens if the portal closes before we escape?', expr: 'cry', time: '10:20 AM' },
          { id: 'gem_m4', type: 'text', charId: 'c_gem', text: 'A dimensional rift warning activates! You will need to trigger a System Quest countermeasure immediately.', expr: 'shock', time: '10:21 AM' }
        ]
      }
    ],
    activeGeminiThreadId: 't_gem_1',
    geminiGems: [
      { id: 'g1', name: 'Anime Script Polisher', icon: '💎' },
      { id: 'g2', name: 'Webtoon Lore Master', icon: '📜' },
      { id: 'g3', name: 'Doraemon Anywhere Planner', icon: '🚪' }
    ]
  };

  function ensureAiCastMembers() {
    if (!Array.isArray(deletedCastIds)) deletedCastIds = [];
    if (!deletedCastIds.includes('c_gpt') && !characters.some(c => c.id === 'c_gpt')) {
      characters.push({
        id: 'c_gpt',
        name: 'ChatGPT',
        side: 'left',
        color: '#10a37f',
        pitch: 0.95,
        role: 'AI Sage',
        avatar: makeComicAvatarDataUri('AI', '#10a37f', '🤖')
      });
    }
    if (!deletedCastIds.includes('c_gem') && !characters.some(c => c.id === 'c_gem')) {
      characters.push({
        id: 'c_gem',
        name: 'Gemini',
        side: 'left',
        color: '#4285f4',
        pitch: 1.1,
        role: 'Lore Master',
        avatar: makeComicAvatarDataUri('GM', '#4285f4', '✨')
      });
    }
  }

  function getActiveGptThread() {
    return storyScenes.chatgptThreads.find(t => t.id === storyScenes.activeGptThreadId) || storyScenes.chatgptThreads[0];
  }

  function getActiveGeminiThread() {
    return storyScenes.geminiThreads.find(t => t.id === storyScenes.activeGeminiThreadId) || storyScenes.geminiThreads[0];
  }

  function syncCurrentAppMessagesToStorage() {
    if (activeAppMode === 'whatsapp') {
      storyScenes.whatsapp = messages;
    } else if (activeAppMode === 'chatgpt') {
      const t = getActiveGptThread();
      if (t) t.messages = messages;
    } else if (activeAppMode === 'gemini') {
      const t = getActiveGeminiThread();
      if (t) t.messages = messages;
    }
  }

  function switchAppMode(newApp, isCinemaTransition = false) {
    if (!['whatsapp', 'chatgpt', 'gemini'].includes(newApp)) return;

    if (!isCinemaTransition) {
      // 1. Save active scene messages
      syncCurrentAppMessagesToStorage();
    }

    // 2. Switch mode
    activeAppMode = newApp;
    safeSetStorage('chathub_active_app', activeAppMode);

    if (!isCinemaTransition) {
      // 3. Load target messages
      if (activeAppMode === 'whatsapp') {
        messages = storyScenes.whatsapp || [];
      } else if (activeAppMode === 'chatgpt') {
        const t = getActiveGptThread();
        messages = t ? (t.messages || []) : [];
      } else if (activeAppMode === 'gemini') {
        const t = getActiveGeminiThread();
        messages = t ? (t.messages || []) : [];
      }
    }

    // 4. Update UI classes
    const wrapper = document.getElementById('phoneWrapper');
    if (wrapper) {
      wrapper.classList.remove('app-whatsapp', 'app-chatgpt', 'app-gemini');
      wrapper.classList.add('app-' + activeAppMode);
    }

    // 5. Update input placeholder & header labels
    const inputEl = document.getElementById('chatMessageInput');
    if (inputEl) {
      if (activeAppMode === 'chatgpt') inputEl.placeholder = 'Message ' + activeGptModel + '...';
      else if (activeAppMode === 'gemini') inputEl.placeholder = 'Ask ' + activeGeminiModel + '...';
      else inputEl.placeholder = 'Type a message...';
    }

    const gptModelLabel = document.getElementById('gptCurrentModelLabel');
    if (gptModelLabel) gptModelLabel.textContent = activeGptModel;

    const geminiModelLabel = document.getElementById('geminiCurrentModelLabel');
    if (geminiModelLabel) geminiModelLabel.textContent = activeGeminiModel;

    // 6. Set appropriate speaker for app
    if (activeAppMode === 'chatgpt') {
      const gptChar = characters.find(c => c.id === 'c_gpt');
      if (gptChar && currentCharId !== 'c1') currentCharId = gptChar.id;
    } else if (activeAppMode === 'gemini') {
      const gemChar = characters.find(c => c.id === 'c_gem');
      if (gemChar && currentCharId !== 'c1') currentCharId = gemChar.id;
    }

    if (!isCinemaTransition) {
      // 7. Update sidebars, stream and settings modal
      renderGptSidebarContent();
      renderGeminiSidebarContent();
      renderDirectorStrip();
      renderChatStream();
      updateGlobalSettingsModalUI();
      saveStudioState();

      const appTitles = { whatsapp: '📱 WhatsApp Scene', chatgpt: '🤖 ChatGPT Scene', gemini: '✨ Gemini Scene' };
      showToast(appTitles[activeAppMode] || 'Scene Switched');
    }
  }

  /* === GLOBAL STUDIO & MULTIVERSE HUB MODAL LOGIC === */
  function openGlobalSettingsModal() {
    closeDropdownMenu();
    updateGlobalSettingsModalUI();
    const modal = document.getElementById('globalSettingsModal');
    if (modal) modal.classList.add('open');
  }

  function closeGlobalSettingsModal() {
    const modal = document.getElementById('globalSettingsModal');
    if (modal) modal.classList.remove('open');
  }

  function updateGlobalSettingsModalUI() {
    const cardWa = document.getElementById('globalCardWa');
    const cardGpt = document.getElementById('globalCardGpt');
    const cardGem = document.getElementById('globalCardGemini');

    const badgeWa = document.getElementById('globalBadgeWa');
    const badgeGpt = document.getElementById('globalBadgeGpt');
    const badgeGem = document.getElementById('globalBadgeGemini');

    if (cardWa) cardWa.classList.toggle('active', activeAppMode === 'whatsapp');
    if (cardGpt) cardGpt.classList.toggle('active', activeAppMode === 'chatgpt');
    if (cardGem) cardGem.classList.toggle('active', activeAppMode === 'gemini');

    if (badgeWa) badgeWa.textContent = (activeAppMode === 'whatsapp') ? 'ACTIVE' : 'SWITCH';
    if (badgeGpt) badgeGpt.textContent = (activeAppMode === 'chatgpt') ? 'ACTIVE' : 'SWITCH';
    if (badgeGem) badgeGem.textContent = (activeAppMode === 'gemini') ? 'ACTIVE' : 'SWITCH';

    const chipWa = document.getElementById('quickChipWa');
    const chipGpt = document.getElementById('quickChipGpt');
    const chipGem = document.getElementById('quickChipGemini');
    if (chipWa) chipWa.classList.toggle('active', activeAppMode === 'whatsapp');
    if (chipGpt) chipGpt.classList.toggle('active', activeAppMode === 'chatgpt');
    if (chipGem) chipGem.classList.toggle('active', activeAppMode === 'gemini');

    const deckBtn = document.getElementById('deckQuickAppBtn');
    if (deckBtn) {
      const appEmojis = { whatsapp: '💬 WA', chatgpt: '🤖 GPT', gemini: '✨ Gemini' };
      deckBtn.textContent = appEmojis[activeAppMode] || '📱 App';
    }

    const waStats = document.getElementById('waSceneStats');
    if (waStats) waStats.textContent = `Group squad chat • ${(storyScenes.whatsapp || []).length} lines`;

    const gptStats = document.getElementById('gptSceneStats');
    if (gptStats) gptStats.textContent = `${activeGptModel} • ${storyScenes.chatgptThreads.length} topics`;

    const gemStats = document.getElementById('geminiSceneStats');
    if (gemStats) gemStats.textContent = `${activeGeminiModel} • ${storyScenes.geminiThreads.length} topics`;

    renderHubCastList();

    const styleLabel = document.getElementById('globalStyleLabel');
    const styleIcon = document.getElementById('globalStyleIcon');
    if (styleLabel) styleLabel.textContent = (chatThemeStyle === 'comic') ? 'Comic Mode' : 'WhatsApp Mode';
    if (styleIcon) styleIcon.textContent = (chatThemeStyle === 'comic') ? '🎨' : '💬';

    const groupLabel = document.getElementById('globalGroupingLabel');
    if (groupLabel) groupLabel.textContent = '🔗 Group: ' + (groupConsecutiveMessages ? 'ON' : 'OFF');

    const soundLabel = document.getElementById('globalSoundLabel');
    const soundIcon = document.getElementById('globalSoundIcon');
    if (soundLabel) soundLabel.textContent = 'Audio FX: ' + (soundEnabled ? 'ON' : 'MUTED');
    if (soundIcon) soundIcon.textContent = soundEnabled ? '🔊' : '🔇';
  }

  function cycleQuickAppMode() {
    const apps = ['whatsapp', 'chatgpt', 'gemini'];
    const curIdx = apps.indexOf(activeAppMode);
    const nextApp = apps[(curIdx + 1) % apps.length];
    switchAppMode(nextApp);
    const appTitles = { whatsapp: 'WhatsApp', chatgpt: 'ChatGPT', gemini: 'Google Gemini' };
    showToast(`📱 Active App: ${appTitles[nextApp]}`);
  }

  /* === AI MODEL PICKER (CHATGPT & GEMINI DEDICATED) === */
  function openModelPicker(appType) {
    const modal = document.getElementById('modelPickerModal');
    const title = document.getElementById('modelPickerTitle');
    const list = document.getElementById('modelPickerList');
    if (!modal || !list) return;

    if (appType === 'chatgpt') {
      title.textContent = '🤖 Select ChatGPT Model';
      const models = [
        { name: 'ChatGPT 4o', desc: 'Omni — Default flagship for reasoning & creative story' },
        { name: 'ChatGPT 4o mini', desc: 'Fast, lightweight conversational helper' },
        { name: 'o1-preview', desc: 'Deep thinking & step-by-step tactical logic' },
        { name: 'ChatGPT 999 ⚡', desc: 'Overpowered Manhwa Transcendent Mode (God Tier)' }
      ];

      list.innerHTML = models.map(m => `
        <button type="button" class="global-app-card${activeGptModel === m.name ? ' active chatgpt' : ''}" style="width:100%;" onclick="selectAiModel('chatgpt', '${m.name}')">
          <div class="global-app-info">
            <span class="global-app-title" style="display:flex; justify-content:space-between;">
              <span>${escapeHtml(m.name)}</span>
              ${activeGptModel === m.name ? '<span class="global-app-badge" style="background:#10a37f; color:#fff;">ACTIVE</span>' : ''}
            </span>
            <span class="global-app-desc">${escapeHtml(m.desc)}</span>
          </div>
        </button>
      `).join('') + `
        <button type="button" class="btn-secondary-comic" style="width:100%; margin-top:6px; padding:10px;" onclick="promptCustomModel('chatgpt')">
          ➕ Enter Custom Model Name...
        </button>
      `;
    } else {
      title.textContent = '✨ Select Gemini Model';
      const models = [
        { name: 'Gemini 1.5 Pro', desc: 'Flagship — 1M token context & deep narrative intelligence' },
        { name: 'Gemini 1.5 Flash', desc: 'Ultra-fast, responsive multimodal model' },
        { name: 'Gemini 3.8 Ultra ⚡', desc: 'Omni Lore Master & Cinematic Story Director' }
      ];

      list.innerHTML = models.map(m => `
        <button type="button" class="global-app-card${activeGeminiModel === m.name ? ' active gemini' : ''}" style="width:100%;" onclick="selectAiModel('gemini', '${m.name}')">
          <div class="global-app-info">
            <span class="global-app-title" style="display:flex; justify-content:space-between;">
              <span>${escapeHtml(m.name)}</span>
              ${activeGeminiModel === m.name ? '<span class="global-app-badge" style="background:#4285f4; color:#fff;">ACTIVE</span>' : ''}
            </span>
            <span class="global-app-desc">${escapeHtml(m.desc)}</span>
          </div>
        </button>
      `).join('') + `
        <button type="button" class="btn-secondary-comic" style="width:100%; margin-top:6px; padding:10px;" onclick="promptCustomModel('gemini')">
          ➕ Enter Custom Model Name...
        </button>
      `;
    }

    modal.classList.add('open');
  }

  function closeModelPicker() {
    const modal = document.getElementById('modelPickerModal');
    if (modal) modal.classList.remove('open');
  }

  function selectAiModel(appType, modelName) {
    if (appType === 'chatgpt') {
      activeGptModel = modelName;
      safeSetStorage('chathub_gpt_model', activeGptModel);
      const label = document.getElementById('gptCurrentModelLabel');
      if (label) label.textContent = activeGptModel;
      const input = document.getElementById('chatMessageInput');
      if (input && activeAppMode === 'chatgpt') input.placeholder = 'Message ' + activeGptModel + '...';
      const activeThread = getActiveGptThread();
      if (activeThread) activeThread.model = activeGptModel;
    } else {
      activeGeminiModel = modelName;
      safeSetStorage('chathub_gemini_model', activeGeminiModel);
      const label = document.getElementById('geminiCurrentModelLabel');
      if (label) label.textContent = activeGeminiModel;
      const input = document.getElementById('chatMessageInput');
      if (input && activeAppMode === 'gemini') input.placeholder = 'Ask ' + activeGeminiModel + '...';
      const activeThread = getActiveGeminiThread();
      if (activeThread) activeThread.model = activeGeminiModel;
    }
    closeModelPicker();
    saveStudioState();
    showToast('Switched to ' + modelName);
  }

  function promptCustomModel(appType) {
    closeModelPicker();
    openCustomPromptModal({
      title: '➕ Custom AI Model Name',
      desc: 'Enter custom model identifier (e.g. SoloLeveling-AI-v2):',
      defaultValue: appType === 'chatgpt' ? 'ChatGPT 999 Max' : 'Gemini 3.8 Ultra Flash',
      showInput: true,
      onConfirm: (val) => {
        if (!val || !val.trim()) return;
        selectAiModel(appType, val.trim());
      }
    });
  }

  /* === CHATGPT SIDEBAR TOOLS & THREADS RENDERER === */
  function toggleGptSidebar(forceState = null) {
    const sb = document.getElementById('gptSidebar');
    const bd = document.getElementById('gptSidebarBackdrop');
    if (!sb) return;
    const shouldOpen = forceState !== null ? forceState : !sb.classList.contains('open');
    if (shouldOpen) {
      renderGptSidebarContent();
      sb.classList.add('open');
      if (bd) bd.classList.add('open');
    } else {
      sb.classList.remove('open');
      if (bd) bd.classList.remove('open');
    }
  }

  function renderGptSidebarContent() {
    const projContainer = document.getElementById('gptProjectsList');
    if (projContainer) {
      projContainer.innerHTML = storyScenes.chatgptProjects.map(p => `
        <div class="gpt-tool-item" style="justify-content:space-between;" onclick="selectGptProject('${p.id}')">
          <span style="display:flex; align-items:center; gap:8px;">
            <span>📁</span> <span style="font-size:12px;">${escapeHtml(p.name)}</span>
          </span>
          <div class="gpt-item-actions">
            <button type="button" class="gpt-mini-btn" onclick="event.stopPropagation(); renameGptProject('${p.id}')" title="Rename">✏️</button>
            <button type="button" class="gpt-mini-btn" onclick="event.stopPropagation(); deleteGptProject('${p.id}')" title="Delete">✕</button>
          </div>
        </div>
      `).join('');
    }

    const plugContainer = document.getElementById('gptPluginsList');
    if (plugContainer) {
      plugContainer.innerHTML = storyScenes.chatgptPlugins.map(pl => `
        <div class="gpt-tool-item" onclick="showToast('🧩 Plugin: ${escapeHtml(pl.name)} Active')">
          <span>${pl.icon || '🧩'}</span> <span>${escapeHtml(pl.name)}</span>
        </div>
      `).join('');
    }

    const threadsContainer = document.getElementById('gptThreadsList');
    if (threadsContainer) {
      threadsContainer.innerHTML = storyScenes.chatgptThreads.map(t => `
        <div class="gpt-history-item${t.id === storyScenes.activeGptThreadId ? ' active' : ''}" onclick="selectGptThread('${t.id}')">
          <div class="gpt-history-title-wrap">
            <span>💬</span> <span>${escapeHtml(t.title)}</span>
          </div>
          <div class="gpt-item-actions">
            <button type="button" class="gpt-mini-btn" onclick="event.stopPropagation(); renameGptThread('${t.id}')" title="Rename Topic">✏️</button>
            <button type="button" class="gpt-mini-btn" onclick="event.stopPropagation(); deleteGptThread('${t.id}')" title="Delete Topic">✕</button>
          </div>
        </div>
      `).join('');
    }
  }

  function selectGptThread(threadId) {
    syncCurrentAppMessagesToStorage();
    storyScenes.activeGptThreadId = threadId;
    const target = getActiveGptThread();
    messages = target ? (target.messages || []) : [];
    if (target && target.model) {
      activeGptModel = target.model;
      const label = document.getElementById('gptCurrentModelLabel');
      if (label) label.textContent = activeGptModel;
    }
    toggleGptSidebar(false);
    renderChatStream();
    saveStudioState();
    showToast('Loaded: ' + (target ? target.title : 'Chat'));
  }

  function promptNewGptChat() {
    toggleGptSidebar(false);
    openCustomPromptModal({
      title: '✏️ New ChatGPT Scene Chat',
      desc: 'Enter topic or scene title for this ChatGPT session:',
      defaultValue: 'Chapter ' + (storyScenes.chatgptThreads.length + 1) + ' Tactical Discussion',
      showInput: true,
      onConfirm: (title) => {
        if (!title || !title.trim()) return;
        syncCurrentAppMessagesToStorage();
        const newId = 't_gpt_' + Date.now();
        storyScenes.chatgptThreads.unshift({
          id: newId,
          title: title.trim(),
          model: activeGptModel,
          messages: []
        });
        storyScenes.activeGptThreadId = newId;
        messages = [];
        renderChatStream();
        saveStudioState();
        showToast('✨ Started New ChatGPT Scene');
      }
    });
  }

  function renameGptThread(threadId) {
    const t = storyScenes.chatgptThreads.find(x => x.id === threadId);
    if (!t) return;
    openCustomPromptModal({
      title: '✏️ Rename Topic',
      desc: 'Enter new topic title:',
      defaultValue: t.title,
      showInput: true,
      onConfirm: (newTitle) => {
        if (!newTitle || !newTitle.trim()) return;
        t.title = newTitle.trim();
        renderGptSidebarContent();
        saveStudioState();
      }
    });
  }

  function deleteGptThread(threadId) {
    if (storyScenes.chatgptThreads.length <= 1) {
      showToast('⚠️ Must keep at least one chat topic!');
      return;
    }
    storyScenes.chatgptThreads = storyScenes.chatgptThreads.filter(t => t.id !== threadId);
    if (storyScenes.activeGptThreadId === threadId) {
      storyScenes.activeGptThreadId = storyScenes.chatgptThreads[0].id;
      messages = storyScenes.chatgptThreads[0].messages || [];
      renderChatStream();
    }
    renderGptSidebarContent();
    saveStudioState();
    showToast('🗑️ Topic deleted');
  }

  function promptAddGptProject() {
    openCustomPromptModal({
      title: '📁 Add Story Project',
      desc: 'Enter project workspace name:',
      defaultValue: 'Dungeon Raid Plan v' + (storyScenes.chatgptProjects.length + 1),
      showInput: true,
      onConfirm: (name) => {
        if (!name || !name.trim()) return;
        storyScenes.chatgptProjects.push({ id: 'p_' + Date.now(), name: name.trim() });
        renderGptSidebarContent();
        saveStudioState();
        showToast('📁 Added Project: ' + name.trim());
      }
    });
  }

  function renameGptProject(projId) {
    const p = storyScenes.chatgptProjects.find(x => x.id === projId);
    if (!p) return;
    openCustomPromptModal({
      title: '✏️ Rename Project',
      desc: 'Enter new project name:',
      defaultValue: p.name,
      showInput: true,
      onConfirm: (newName) => {
        if (!newName || !newName.trim()) return;
        p.name = newName.trim();
        renderGptSidebarContent();
        saveStudioState();
      }
    });
  }

  function deleteGptProject(projId) {
    storyScenes.chatgptProjects = storyScenes.chatgptProjects.filter(x => x.id !== projId);
    renderGptSidebarContent();
    saveStudioState();
    showToast('🗑️ Project removed');
  }

  function selectGptProject(projId) {
    const p = storyScenes.chatgptProjects.find(x => x.id === projId);
    if (p) showToast('📁 Loaded Project Context: ' + p.name);
  }

  function promptAddGptPlugin() {
    openCustomPromptModal({
      title: '🧩 Add Custom GPT / Plugin',
      desc: 'Enter custom assistant name:',
      defaultValue: 'Manga Lore Analyst',
      showInput: true,
      onConfirm: (name) => {
        if (!name || !name.trim()) return;
        storyScenes.chatgptPlugins.push({ id: 'pl_' + Date.now(), name: name.trim(), icon: '🧩' });
        renderGptSidebarContent();
        saveStudioState();
        showToast('🧩 Plugin Added: ' + name.trim());
      }
    });
  }

  /* === GEMINI SIDEBAR TOOLS & THREADS RENDERER === */
  function toggleGeminiSidebar(forceState = null) {
    const sb = document.getElementById('geminiSidebar');
    const bd = document.getElementById('geminiSidebarBackdrop');
    if (!sb) return;
    const shouldOpen = forceState !== null ? forceState : !sb.classList.contains('open');
    if (shouldOpen) {
      renderGeminiSidebarContent();
      sb.classList.add('open');
      if (bd) bd.classList.add('open');
    } else {
      sb.classList.remove('open');
      if (bd) bd.classList.remove('open');
    }
  }

  function renderGeminiSidebarContent() {
    const gemsContainer = document.getElementById('geminiGemsList');
    if (gemsContainer) {
      gemsContainer.innerHTML = storyScenes.geminiGems.map(g => `
        <div class="gemini-gem-item" style="justify-content:space-between;" onclick="showToast('💎 Gem Activated: ${escapeHtml(g.name)}')">
          <span style="display:flex; align-items:center; gap:8px;">
            <span>${g.icon || '💎'}</span> <span style="font-size:12px;">${escapeHtml(g.name)}</span>
          </span>
          <div class="gpt-item-actions">
            <button type="button" class="gpt-mini-btn" onclick="event.stopPropagation(); renameGeminiGem('${g.id}')" title="Rename">✏️</button>
            <button type="button" class="gpt-mini-btn" onclick="event.stopPropagation(); deleteGeminiGem('${g.id}')" title="Delete">✕</button>
          </div>
        </div>
      `).join('');
    }

    const threadsContainer = document.getElementById('geminiThreadsList');
    if (threadsContainer) {
      threadsContainer.innerHTML = storyScenes.geminiThreads.map(t => `
        <div class="gemini-history-item${t.id === storyScenes.activeGeminiThreadId ? ' active' : ''}" onclick="selectGeminiThread('${t.id}')">
          <div class="gpt-history-title-wrap">
            <span>📌</span> <span>${escapeHtml(t.title)}</span>
          </div>
          <div class="gpt-item-actions">
            <button type="button" class="gpt-mini-btn" onclick="event.stopPropagation(); renameGeminiThread('${t.id}')" title="Rename Topic">✏️</button>
            <button type="button" class="gpt-mini-btn" onclick="event.stopPropagation(); deleteGeminiThread('${t.id}')" title="Delete Topic">✕</button>
          </div>
        </div>
      `).join('');
    }
  }

  function selectGeminiThread(threadId) {
    syncCurrentAppMessagesToStorage();
    storyScenes.activeGeminiThreadId = threadId;
    const target = getActiveGeminiThread();
    messages = target ? (target.messages || []) : [];
    if (target && target.model) {
      activeGeminiModel = target.model;
      const label = document.getElementById('geminiCurrentModelLabel');
      if (label) label.textContent = activeGeminiModel;
    }
    toggleGeminiSidebar(false);
    renderChatStream();
    saveStudioState();
    showToast('Loaded: ' + (target ? target.title : 'Gemini Chat'));
  }

  function promptNewGeminiChat() {
    toggleGeminiSidebar(false);
    openCustomPromptModal({
      title: '✏️ New Gemini Scene Chat',
      desc: 'Enter topic or scene title for this Gemini session:',
      defaultValue: 'Gemini Research Session ' + (storyScenes.geminiThreads.length + 1),
      showInput: true,
      onConfirm: (title) => {
        if (!title || !title.trim()) return;
        syncCurrentAppMessagesToStorage();
        const newId = 't_gem_' + Date.now();
        storyScenes.geminiThreads.unshift({
          id: newId,
          title: title.trim(),
          model: activeGeminiModel,
          messages: []
        });
        storyScenes.activeGeminiThreadId = newId;
        messages = [];
        renderChatStream();
        saveStudioState();
        showToast('✨ Started New Gemini Scene');
      }
    });
  }

  function renameGeminiThread(threadId) {
    const t = storyScenes.geminiThreads.find(x => x.id === threadId);
    if (!t) return;
    openCustomPromptModal({
      title: '✏️ Rename Gemini Topic',
      desc: 'Enter new topic title:',
      defaultValue: t.title,
      showInput: true,
      onConfirm: (newTitle) => {
        if (!newTitle || !newTitle.trim()) return;
        t.title = newTitle.trim();
        renderGeminiSidebarContent();
        saveStudioState();
      }
    });
  }

  function deleteGeminiThread(threadId) {
    if (storyScenes.geminiThreads.length <= 1) {
      showToast('⚠️ Must keep at least one chat topic!');
      return;
    }
    storyScenes.geminiThreads = storyScenes.geminiThreads.filter(t => t.id !== threadId);
    if (storyScenes.activeGeminiThreadId === threadId) {
      storyScenes.activeGeminiThreadId = storyScenes.geminiThreads[0].id;
      messages = storyScenes.geminiThreads[0].messages || [];
      renderChatStream();
    }
    renderGeminiSidebarContent();
    saveStudioState();
    showToast('🗑️ Topic deleted');
  }

  function promptAddGeminiGem() {
    openCustomPromptModal({
      title: '💎 Create Gemini Gem',
      desc: 'Enter custom gem name for storytelling assistance:',
      defaultValue: 'Anime Dialogue Enhancer',
      showInput: true,
      onConfirm: (name) => {
        if (!name || !name.trim()) return;
        storyScenes.geminiGems.push({ id: 'g_' + Date.now(), name: name.trim(), icon: '💎' });
        renderGeminiSidebarContent();
        saveStudioState();
        showToast('💎 Created Gem: ' + name.trim());
      }
    });
  }

  function renameGeminiGem(gemId) {
    const g = storyScenes.geminiGems.find(x => x.id === gemId);
    if (!g) return;
    openCustomPromptModal({
      title: '✏️ Rename Gem',
      desc: 'Enter new gem name:',
      defaultValue: g.name,
      showInput: true,
      onConfirm: (newName) => {
        if (!newName || !newName.trim()) return;
        g.name = newName.trim();
        renderGeminiSidebarContent();
        saveStudioState();
      }
    });
  }

  function deleteGeminiGem(gemId) {
    storyScenes.geminiGems = storyScenes.geminiGems.filter(x => x.id !== gemId);
    renderGeminiSidebarContent();
    saveStudioState();
    showToast('🗑️ Gem removed');
  }

  function insertGeminiPrompt(promptText) {
    const input = document.getElementById('chatMessageInput');
    if (input) {
      input.value = promptText;
      input.focus();
    }
  }

  /* =====================================================================
     2. WEB AUDIO SYNTHESIZER & CUSTOM AUDIO ENGINE
     ===================================================================== */
  let audioCtx = null;

  function ensureAudioCtx() {
    if (!soundEnabled) return null;
    try {
      if (!audioCtx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) audioCtx = new AudioContext();
      }
      if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      return audioCtx;
    } catch (e) {
      return null;
    }
  }

  function playPopSound(pitch = 1.0) {
    const ctx = ensureAudioCtx();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(420 * pitch, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880 * pitch, ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.16, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.09);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.09);
  }

  function playTypingTickSound(pitch = 1.0) {
    const ctx = ensureAudioCtx();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(680 * pitch, ctx.currentTime);
    gain.gain.setValueAtTime(0.04, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.03);
  }

  function playBoingSound() {
    const ctx = ensureAudioCtx();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    const now = ctx.currentTime;
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(620, now + 0.14);
    osc.frequency.exponentialRampToValueAtTime(280, now + 0.28);
    osc.frequency.exponentialRampToValueAtTime(540, now + 0.42);
    gain.gain.setValueAtTime(0.24, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(now + 0.45);
  }

  function playBoomSound() {
    const ctx = ensureAudioCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(32, now + 0.38);
    gain.gain.setValueAtTime(0.32, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(now + 0.4);
  }

  function playShockSound() {
    const ctx = ensureAudioCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    [520, 660, 880].forEach((freq) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.72, now + 0.28);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(now + 0.3);
    });
  }

  function playSadSlideSound() {
    const ctx = ensureAudioCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(480, now);
    osc.frequency.linearRampToValueAtTime(240, now + 0.45);
    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.48);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(now + 0.48);
  }

  function playSparkleSound() {
    const ctx = ensureAudioCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    [587.33, 880, 1174.66, 1567.98].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.055);
      gain.gain.setValueAtTime(0.12, now + i * 0.055);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.055 + 0.22);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.055);
      osc.stop(now + i * 0.055 + 0.22);
    });
  }
function playSciFiChimeSound() {
    if (!soundEnabled) return;
    const ctx = ensureAudioCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    [587.33, 880, 1174.66, 1760].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.05);
      gain.gain.setValueAtTime(0.18, now + i * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.05 + 0.45);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.05);
      osc.stop(now + i * 0.05 + 0.45);
    });
  }

  function playAppSwitchSound() {
    if (!soundEnabled) return;
    const ctx = ensureAudioCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.16);
      gain.gain.setValueAtTime(0.22, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.26);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.26);
    } catch (_) {}
  }

  function playPunchSound() {
    if (!soundEnabled) return;
    const ctx = ensureAudioCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.exponentialRampToValueAtTime(32, now + 0.16);
    gain.gain.setValueAtTime(0.42, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.18);
    try {
      const bufferSize = Math.floor(ctx.sampleRate * 0.08);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.35));
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const nGain = ctx.createGain();
      nGain.gain.setValueAtTime(0.35, now);
      nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      noise.connect(nGain);
      nGain.connect(ctx.destination);
      noise.start(now);
    } catch (e) {}
  }

  function playSwordSlashSound() {
    if (!soundEnabled) return;
    const ctx = ensureAudioCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(1400, now);
    osc.frequency.exponentialRampToValueAtTime(350, now + 0.18);
    gain.gain.setValueAtTime(0.28, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.2);
  }

  function playVineBoomSound() {
    if (!soundEnabled) return;
    const ctx = ensureAudioCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(110, now);
    osc.frequency.exponentialRampToValueAtTime(26, now + 0.7);
    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.75);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.75);
  }

  function playAnimeStingSound() {
    if (!soundEnabled) return;
    const ctx = ensureAudioCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    [659.25, 830.61, 1046.5].forEach((freq) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.45);
    });
  }

  function playCustomAudio(dataUrl) {
    if (!soundEnabled || !dataUrl) return;
    const audio = new Audio(dataUrl);
    audio.volume = 0.85;
    audio.play().catch(() => {});
  }

  function playCustomAudioById(soundId) {
    const clip = customAudioClips.find(s => s.id === soundId);
    if (clip && clip.data) {
      playCustomAudio(clip.data);
    } else {
      playBoingSound();
    }
  }

  function triggerSfxByName(sfxKey, charPitch = 1.0) {
    if (!soundEnabled) return;
    switch (sfxKey) {
      case 'punch': playPunchSound(); break;
      case 'sword': playSwordSlashSound(); break;
      case 'vineboom': playVineBoomSound(); break;
      case 'sting': playAnimeStingSound(); break;
      case 'scifi': playSciFiChimeSound(); break;
      case 'boing': playBoingSound(); break;
      case 'boom': playBoomSound(); break;
      case 'shock': playShockSound(); break;
      case 'sad': playSadSlideSound(); break;
      case 'sparkle': playSparkleSound(); break;
      default: playPopSound(charPitch); break;
    }
  }

  function triggerExpressionEffects(expr, charPitch = 1.0, bubbleEl = null) {
    if (bubbleEl) {
      if (expr === 'angry') {
        bubbleEl.classList.remove('in-box-angry');
        void bubbleEl.offsetWidth;
        bubbleEl.classList.add('in-box-angry');
      } else if (expr === 'shock') {
        bubbleEl.classList.remove('in-box-shock');
        void bubbleEl.offsetWidth;
        bubbleEl.classList.add('in-box-shock');
      } else if (expr === 'love') {
        bubbleEl.classList.remove('in-box-pulse');
        void bubbleEl.offsetWidth;
        bubbleEl.classList.add('in-box-pulse');
      }
    }

    if (!soundEnabled) return;
    if (expr === 'cry') {
      playSadSlideSound();
    } else if (expr === 'laugh') {
      playBoingSound();
    } else if (expr === 'angry') {
      playBoomSound();
    } else if (expr === 'shock') {
      playShockSound();
    } else if (expr === 'love') {
      playSparkleSound();
    } else {
      playPopSound(charPitch);
    }
  }

  function triggerScreenShake() {
    // Screen shake permanently removed to eliminate lag & screen freeze
  }

  let directorDeckMode = safeGetStorage('chathub_director_deck_mode') || 'compact';
  window.directorDeckMode = directorDeckMode;

  /* =====================================================================
     4. STATE PERSISTENCE (LOCAL STORAGE)
     ===================================================================== */
  function saveStudioState() {
    syncCurrentAppMessagesToStorage();

    const payload = {
      groupProfile,
      characters,
      messages,
      storyScenes,
      activeAppMode,
      activeGptModel,
      activeGeminiModel,
      customStickers,
      customAudioClips,
      groupConsecutiveMessages,
      directorDeckMode,
      deletedCastIds: deletedCastIds || []
    };
    safeSetStorage(STORAGE_KEY, JSON.stringify(payload));
  }

  function ensureDefaultCastMembers() {
    if (!Array.isArray(deletedCastIds)) deletedCastIds = [];

    // Migrate legacy placeholders if they exist in localStorage (c1: Sung Jinwoo -> Nobita, etc.)
    const c1 = characters.find(c => c.id === 'c1');
    if (c1 && (c1.name === 'Sung Jinwoo' || c1.name === 'Jinwoo')) {
      c1.name = 'Nobita';
      c1.color = '#eab308';
      c1.pitch = 1.25;
      c1.avatar = makeComicAvatarDataUri('NO', '#facc15', '👓');
    }
    const c2 = characters.find(c => c.id === 'c2');
    if (c2 && (c2.name === 'Gojo Satoru' || c2.name === 'Gojo')) {
      c2.name = 'Doraemon';
      c2.color = '#0284c7';
      c2.pitch = 0.92;
      c2.avatar = makeComicAvatarDataUri('DO', '#38bdf8', '🔔');
    }
    const c3 = characters.find(c => c.id === 'c3');
    if (c3 && (c3.name === 'Sakura' || c3.name === 'Waifu')) {
      c3.name = 'Shizuka';
      c3.color = '#ec4899';
      c3.pitch = 1.38;
      c3.avatar = makeComicAvatarDataUri('SH', '#f472b6', '🌸');
    }

    // Ensure Nobita exists if not explicitly deleted
    if (!deletedCastIds.includes('c1') && !characters.some(c => c.id === 'c1' || c.name.toLowerCase() === 'nobita')) {
      characters.unshift({
        id: 'c1',
        name: 'Nobita',
        side: 'left',
        color: '#eab308',
        pitch: 1.25,
        avatar: makeComicAvatarDataUri('NO', '#facc15', '👓')
      });
    }

    // Ensure Doraemon exists if not explicitly deleted
    if (!deletedCastIds.includes('c2') && !characters.some(c => c.id === 'c2' || c.name.toLowerCase() === 'doraemon')) {
      const idx = characters.findIndex(c => c.id === 'c1') + 1;
      characters.splice(idx > 0 ? idx : 1, 0, {
        id: 'c2',
        name: 'Doraemon',
        side: 'right',
        color: '#0284c7',
        pitch: 0.92,
        avatar: makeComicAvatarDataUri('DO', '#38bdf8', '🔔')
      });
    }
  }

  function loadStudioState() {
    const raw = safeGetStorage(STORAGE_KEY);
    if (!raw) {
      ensureDefaultCastMembers();
      characters.forEach(c => ensureCharacterExpressions(c));
      return;
    }
    try {
      const parsed = JSON.parse(raw);
      if (parsed.groupProfile) groupProfile = { ...groupProfile, ...parsed.groupProfile };
      if (Array.isArray(parsed.deletedCastIds)) {
        deletedCastIds = parsed.deletedCastIds;
      }
      if (Array.isArray(parsed.characters) && parsed.characters.length > 0) {
        characters = parsed.characters.map(c => ({
          pitch: 1.05,
          ...c
        }));
      }
      ensureAiCastMembers();
      ensureDefaultCastMembers();
      characters.forEach(c => ensureCharacterExpressions(c));
      if (parsed.directorDeckMode) {
        directorDeckMode = parsed.directorDeckMode;
      }
      if (parsed.storyScenes && typeof parsed.storyScenes === 'object') {
        storyScenes = { ...storyScenes, ...parsed.storyScenes };
      }
      if (Array.isArray(parsed.messages) && (!storyScenes.whatsapp || storyScenes.whatsapp.length === 0)) {
        storyScenes.whatsapp = parsed.messages;
      }
      if (parsed.activeAppMode && ['whatsapp', 'chatgpt', 'gemini'].includes(parsed.activeAppMode)) {
        activeAppMode = parsed.activeAppMode;
      }
      if (parsed.activeGptModel) activeGptModel = parsed.activeGptModel;
      if (parsed.activeGeminiModel) activeGeminiModel = parsed.activeGeminiModel;

      if (activeAppMode === 'whatsapp') {
        messages = storyScenes.whatsapp || [];
      } else if (activeAppMode === 'chatgpt') {
        const t = getActiveGptThread();
        messages = t ? (t.messages || []) : [];
      } else if (activeAppMode === 'gemini') {
        const t = getActiveGeminiThread();
        messages = t ? (t.messages || []) : [];
      }
      if (Array.isArray(parsed.customStickers)) customStickers = parsed.customStickers;
      if (Array.isArray(parsed.customAudioClips)) customAudioClips = parsed.customAudioClips;
      if (typeof parsed.groupConsecutiveMessages === 'boolean') {
        groupConsecutiveMessages = parsed.groupConsecutiveMessages;
      }
      currentCharId = characters.length > 0 ? characters[0].id : 'c1';
    } catch (e) {
      console.warn('Could not parse saved state', e);
      ensureDefaultCastMembers();
    }
  }

  /* =====================================================================
     5. RENDER GROUP HEADER, WALLPAPER & DIRECTOR STRIP
     ===================================================================== */
  function renderGroupHeader() {
    document.getElementById('headerGroupDp').src = groupProfile.dp;
    document.getElementById('headerGroupName').textContent = groupProfile.name;

    const autoStatus = characters.map(c => c.name).join(', ');
    document.getElementById('headerGroupStatus').textContent = groupProfile.status.trim() || autoStatus;

    const wallEl = document.getElementById('wallpaperLayer');
    wallEl.className = 'wallpaper-layer ' + (groupProfile.wallpaper || 'wall-doodle');
    if (groupProfile.wallpaper === 'wall-custom' && groupProfile.customWallpaperData) {
      wallEl.classList.add('wall-custom-bg');
      wallEl.style.backgroundImage = `url(${groupProfile.customWallpaperData})`;
      wallEl.style.backgroundSize = 'cover';
      wallEl.style.backgroundPosition = 'center';
    } else {
      wallEl.style.backgroundImage = '';
    }

    const wrapper = document.getElementById('phoneWrapper');
    const currentCamClass = Array.from(wrapper.classList).find(c => c.startsWith('cam-')) || '';
    wrapper.className = 'phone-wrapper ' + (groupProfile.aspectRatio || 'ratio-9-16') + (cleanRecordMode ? ' clean-record-mode' : '') + (chatThemeStyle === 'comic' ? ' theme-comic' : ' theme-realistic') + ' app-' + (activeAppMode || 'whatsapp') + (currentCamClass ? ' ' + currentCamClass : '');

    const currentRatio = groupProfile.aspectRatio || 'ratio-9-16';

    const menu916 = document.getElementById('menuRatio916');
    const menu169 = document.getElementById('menuRatio169');
    const menuFull = document.getElementById('menuRatioFull');
    if (menu916) menu916.innerHTML = (currentRatio === 'ratio-9-16' ? '✓ ' : '') + '📱 9:16 Shorts (Reels / TikTok)';
    if (menu169) menu169.innerHTML = (currentRatio === 'ratio-16-9' ? '✓ ' : '') + '🖥️ 16:9 YouTube (Landscape)';
    if (menuFull) menuFull.innerHTML = (currentRatio === 'ratio-full' ? '✓ ' : '') + '🔲 Full Screen (Edge-to-Edge)';

    const mod916 = document.getElementById('modalRatio916');
    const mod169 = document.getElementById('modalRatio169');
    const modFull = document.getElementById('modalRatioFull');
    if (mod916) {
      mod916.style.background = currentRatio === 'ratio-9-16' ? '#facc15' : '#334155';
      mod916.style.color = currentRatio === 'ratio-9-16' ? '#0f172a' : '#f8fafc';
    }
    if (mod169) {
      mod169.style.background = currentRatio === 'ratio-16-9' ? '#facc15' : '#334155';
      mod169.style.color = currentRatio === 'ratio-16-9' ? '#0f172a' : '#f8fafc';
    }
    if (modFull) {
      modFull.style.background = currentRatio === 'ratio-full' ? '#facc15' : '#334155';
      modFull.style.color = currentRatio === 'ratio-full' ? '#0f172a' : '#f8fafc';
    }

    document.getElementById('menuGroupMsgItem').textContent = `🔗 Group Same-Speaker: ${groupConsecutiveMessages ? 'ON' : 'OFF'}`;
  }

  function renderDirectorStrip() {
    const compactRow = document.getElementById('deckCompactRow');
    const stripRow = document.getElementById('deckStripRow');
    const strip = document.getElementById('charSelectorStrip');
    const pickerList = document.getElementById('castPickerList');

    if (!Array.isArray(characters) || characters.length === 0) {
      ensureDefaultCastMembers();
    }

    let activeChar = characters.find(c => c.id === currentCharId);
    if (!activeChar) {
      activeChar = characters[0];
      if (activeChar) currentCharId = activeChar.id;
    }

    // 1. Toggle visibility based on directorDeckMode ('compact' vs 'strip')
    if (compactRow && stripRow) {
      if (directorDeckMode === 'strip') {
        compactRow.style.display = 'none';
        stripRow.style.display = 'flex';
      } else {
        compactRow.style.display = 'flex';
        stripRow.style.display = 'none';
      }
    }

    // 2. Render Compact Row (Selected Character Only)
    const speakerAvatar = document.getElementById('activeSpeakerAvatar');
    const speakerName = document.getElementById('activeSpeakerName');
    const speakerPill = document.getElementById('activeSpeakerPill');
    const sideSwitchBtn = document.getElementById('sideSwitchBtn');
    const sideSwitchBtnStrip = document.getElementById('sideSwitchBtnStrip');

    if (activeChar) {
      if (speakerAvatar) {
        speakerAvatar.src = activeChar.avatar;
        speakerAvatar.alt = activeChar.name;
        speakerAvatar.style.borderColor = activeChar.color || '#facc15';
      }
      if (speakerName) {
        speakerName.textContent = activeChar.name;
      }
      if (speakerPill) {
        speakerPill.style.borderColor = activeChar.color || '#facc15';
      }
      const sideText = `⇄ Side: ${activeChar.side === 'left' ? 'Left' : 'Right'}`;
      if (sideSwitchBtn) sideSwitchBtn.textContent = sideText;
      if (sideSwitchBtnStrip) sideSwitchBtnStrip.textContent = sideText;
    }

    // 3. Render Expanded Strip Row (All Characters Horizontal Carousel)
    if (strip) {
      strip.innerHTML = '';
      characters.forEach(c => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `char-pill ${c.id === currentCharId ? 'active' : ''}`;
        btn.onclick = (e) => {
          e.stopPropagation();
          currentCharId = c.id;
          saveStudioState();
          renderDirectorStrip();
        };
        btn.innerHTML = `<img src="${c.avatar}" alt="${escapeHtml(c.name)}"><span>${escapeHtml(c.name)}</span>`;
        strip.appendChild(btn);
      });
    }

    // 4. Render Floating Quick Cast Picker Popover
    if (pickerList) {
      pickerList.innerHTML = '';
      characters.forEach(c => {
        const item = document.createElement('button');
        item.type = 'button';
        item.className = `cast-picker-item ${c.id === currentCharId ? 'active' : ''}`;
        item.onclick = (e) => {
          e.stopPropagation();
          selectActiveSpeaker(c.id);
          closeCastPickerPopover();
        };
        item.innerHTML = `
          <div class="cast-picker-item-left">
            <img src="${c.avatar}" class="cast-picker-item-avatar" alt="${escapeHtml(c.name)}" style="border-color:${c.color || '#facc15'}">
            <div>
              <div class="cast-picker-item-name">${escapeHtml(c.name)}</div>
              ${c.role ? `<div style="font-size:10px; color:#94a3b8; font-weight:600;">${escapeHtml(c.role)}</div>` : ''}
            </div>
          </div>
          <span class="cast-picker-item-badge">${c.side === 'left' ? 'Left' : 'Right'}</span>
        `;
        pickerList.appendChild(item);
      });
    }
  }

  function cycleNextSpeaker() {
    if (!characters || characters.length <= 1) return;
    const idx = characters.findIndex(c => c.id === currentCharId);
    const nextIdx = (idx + 1) % characters.length;
    currentCharId = characters[nextIdx].id;
    saveStudioState();
    renderDirectorStrip();
    if (soundEnabled) playPopSound();
  }

  function cyclePrevSpeaker() {
    if (!characters || characters.length <= 1) return;
    const idx = characters.findIndex(c => c.id === currentCharId);
    const prevIdx = (idx - 1 + characters.length) % characters.length;
    currentCharId = characters[prevIdx].id;
    saveStudioState();
    renderDirectorStrip();
    if (soundEnabled) playPopSound();
  }

  function toggleDirectorDeckMode() {
    directorDeckMode = directorDeckMode === 'compact' ? 'strip' : 'compact';
    window.directorDeckMode = directorDeckMode;
    safeSetStorage('chathub_director_deck_mode', directorDeckMode);
    closeCastPickerPopover();
    renderDirectorStrip();
    showToast(directorDeckMode === 'compact' ? '👤 Single Character Mode' : '👥 All Characters Strip');
  }

  function toggleCastPickerPopover() {
    const popover = document.getElementById('castPickerPopover');
    if (!popover) return;
    popover.classList.toggle('open');
  }

  function closeCastPickerPopover() {
    const popover = document.getElementById('castPickerPopover');
    if (popover) popover.classList.remove('open');
  }

  function toggleCurrentCharSide() {
    const char = characters.find(c => c.id === currentCharId);
    if (!char) return;
    char.side = char.side === 'left' ? 'right' : 'left';
    saveStudioState();
    renderDirectorStrip();
    renderChatStream();
  }

  // Explicit window bindings for direct inline HTML onclick handlers
  window.cycleNextSpeaker = cycleNextSpeaker;
  window.cyclePrevSpeaker = cyclePrevSpeaker;
  window.toggleDirectorDeckMode = toggleDirectorDeckMode;
  window.toggleCastPickerPopover = toggleCastPickerPopover;
  window.closeCastPickerPopover = closeCastPickerPopover;
  window.toggleCurrentCharSide = toggleCurrentCharSide;
  window.selectActiveSpeaker = selectActiveSpeaker;
  window.toggleCleanRecordMode = toggleCleanRecordMode;

  function selectExpression(expr) {
    currentExpr = expr;
    document.querySelectorAll('.expr-pill').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.expr === expr);
    });
  }

  /* =====================================================================
     6. RENDER CHAT MESSAGES, STICKERS & SOUND BUBBLES
     ===================================================================== */
  const exprBadgeMap = {
    normal: '',
    cry: '😭',
    laugh: '😂',
    angry: '💢',
    shock: '😱',
    love: '😍'
  };

  const exprLabelMap = {
    normal: '',
    cry: 'Crying',
    laugh: 'Laughing',
    angry: 'Raging',
    shock: 'Shocked',
    love: 'In Love'
  };

  /* Determine character alignment side dynamically based on active app:
     - In ChatGPT app: ChatGPT is ALWAYS left; any person talking is ALWAYS right.
     - In Gemini app: Gemini is ALWAYS left; any person talking is ALWAYS right.
     - In WhatsApp app: follows group chat side (char.side).
  */
  function getEffectiveSideForMessage(char, appMode = activeAppMode) {
    if (!char) return 'left';
    if (appMode === 'chatgpt') {
      const isAi = (char.id === 'c_gpt' || (char.name && char.name.toLowerCase().includes('chatgpt')) || char.role === 'AI Sage' || (char.role && char.role.toLowerCase().includes('ai')));
      return isAi ? 'left' : 'right';
    }
    if (appMode === 'gemini') {
      const isAi = (char.id === 'c_gem' || (char.name && char.name.toLowerCase().includes('gemini')) || char.role === 'Lore Master');
      return isAi ? 'left' : 'right';
    }
    return char.side || 'left';
  }

  function showAppSwitchTransition(targetApp, info) {
    const wrapper = document.getElementById('phoneWrapper');
    const overlay = document.getElementById('phoneAppSwitchOverlay');
    const iconEl = document.getElementById('appSwitchBadgeIcon');
    const titleEl = document.getElementById('appSwitchBadgeTitle');
    const subEl = document.getElementById('appSwitchBadgeSub');

    if (wrapper) wrapper.classList.add('app-switching');
    if (iconEl) {
      iconEl.className = `app-switch-badge-icon ${targetApp}`;
      iconEl.textContent = (info && info.icon) || '📱';
    }
    if (titleEl) titleEl.textContent = (info && info.title) || targetApp;
    if (subEl) subEl.textContent = (info && info.sub) || 'Switching app...';
    if (overlay) overlay.classList.add('active');
  }

  function hideAppSwitchTransition() {
    const wrapper = document.getElementById('phoneWrapper');
    const overlay = document.getElementById('phoneAppSwitchOverlay');
    if (overlay) overlay.classList.remove('active');
    if (wrapper) wrapper.classList.remove('app-switching');
  }

  function createMessageRowElement(msg, index, listToRender) {
    if (msg.type === 'app_switch') {
      const banner = document.createElement('div');
      banner.className = 'scene-switch-banner';
      banner.title = 'Click to edit or delete Scene Transition';
      const targetApp = msg.targetApp || 'whatsapp';
      const icon = targetApp === 'chatgpt' ? '🤖' : (targetApp === 'gemini' ? '✨' : '📱');
      const appName = targetApp === 'chatgpt' ? 'ChatGPT' : (targetApp === 'gemini' ? 'Gemini' : 'WhatsApp');
      banner.innerHTML = `
        <div class="scene-switch-pill">
          <span class="scene-switch-icon">${icon}</span>
          <span class="scene-switch-label">SCENE TRANSITION ➔ ${appName.toUpperCase()}</span>
          ${msg.note ? `<span class="scene-switch-note">(${escapeHtml(msg.note)})</span>` : ''}
        </div>
      `;
      banner.onclick = () => openMessageEditModal(msg.id);
      return banner;
    }

    if (msg.type === 'divider') {
      const div = document.createElement('div');
      div.className = 'episode-divider';
      div.textContent = msg.text;
      div.title = 'Click to edit or delete banner';
      div.onclick = () => openMessageEditModal(msg.id);
      return div;
    }

    if (msg.type === 'system') {
      const sys = document.createElement('div');
      sys.className = 'system-alert-pill';
      sys.textContent = msg.text;
      sys.title = 'Click to edit or delete system alert';
      sys.onclick = () => openMessageEditModal(msg.id);
      return sys;
    }
if (msg.type === 'quest') {
      const quest = document.createElement('div');
      quest.className = 'system-quest-box';
      quest.title = 'Click to edit or delete quest';
      quest.innerHTML = `
        <div class="system-quest-brackets sq-tl"></div>
        <div class="system-quest-brackets sq-tr"></div>
        <div class="system-quest-brackets sq-bl"></div>
        <div class="system-quest-brackets sq-br"></div>
        <div class="system-quest-header">
          <span class="system-quest-badge">❖ ${escapeHtml(msg.title || 'SYSTEM QUEST ALERT')}</span>
          <span style="font-size:9.5px; opacity:0.85; letter-spacing:0.8px;">[do or die]</span>
        </div>
        <div class="system-quest-body">${escapeHtml(msg.text)}</div>
      `;
      quest.onclick = () => openMessageEditModal(msg.id);
      return quest;
    }

    if (msg.type === 'pause') {
      const pauseDiv = document.createElement('div');
      pauseDiv.className = 'scene-pause-pill';
      pauseDiv.style.cssText = 'align-self:center; margin:8px auto; font-size:11px; color:#94a3b8; font-style:italic; background:rgba(148,163,184,0.12); border:1px dashed rgba(148,163,184,0.35); padding:4px 14px; border-radius:999px; display:inline-flex; align-items:center; gap:6px; cursor:pointer; user-select:none;';
      pauseDiv.innerHTML = `<span>⏸️</span><span>Dramatic Pause (${((msg.delayMs || 1500) / 1000).toFixed(1)}s)</span>`;
      pauseDiv.title = 'Click to edit or remove pause';
      pauseDiv.onclick = () => openMessageEditModal(msg.id);
      return pauseDiv;
    }

    const char = characters.find(c => c.id === msg.charId) || characters[0];
    const expr = msg.expr || 'normal';
    const effectiveSide = getEffectiveSideForMessage(char, activeAppMode);

    // Check consecutive speaker grouping
    const prevMsg = index > 0 ? listToRender[index - 1] : null;
    const prevChar = prevMsg && prevMsg.charId ? (characters.find(c => c.id === prevMsg.charId) || characters[0]) : null;
    const prevEffectiveSide = prevChar ? getEffectiveSideForMessage(prevChar, activeAppMode) : null;
    const isGroupedFollowup = groupConsecutiveMessages &&
      prevMsg &&
      prevMsg.type !== 'divider' &&
      prevMsg.type !== 'system' &&
      prevMsg.charId === char.id &&
      prevChar && prevEffectiveSide === effectiveSide &&
      (prevMsg.expr || 'normal') === expr;

    const row = document.createElement('div');
    row.className = `msg-row ${effectiveSide} expr-style-${expr}${isGroupedFollowup ? ' grouped-followup' : ''}`;

    const tickHtml = effectiveSide === 'right' ? '<span class="read-ticks">✓✓</span>' : '';

    // Quoted Reply Box HTML
    let replyBoxHtml = '';
    if (msg.replyToId) {
      const refMsg = messages.find(m => m.id === msg.replyToId);
      if (refMsg) {
        const refChar = characters.find(c => c.id === refMsg.charId);
        const refAuthor = refChar ? refChar.name : 'System';
        const refSnippet = refMsg.type === 'sticker'
          ? `[Sticker: ${(refMsg.stickerData && refMsg.stickerData.label) || 'Sticker'}]`
          : (refMsg.text || '');
        replyBoxHtml = `
          <div class="reply-quote-box">
            <span class="reply-quote-author" style="color: ${refChar ? refChar.color : '#00a884'};	">${escapeHtml(refAuthor)}</span>
            <div class="reply-quote-snip">${escapeHtml(refSnippet)}</div>
          </div>
        `;
      }
    }

    let bubbleContentHtml = '';

    if (msg.type === 'sticker') {
      const st = msg.stickerData || builtInStickers[0];
      const innerArt = st.isVideo
        ? `<video src="${st.imageUrl}" autoplay loop muted playsinline style="max-width:var(--chat-sticker-size, 120px); max-height:var(--chat-sticker-size, 120px); width:auto; height:auto; border-radius:12px; object-fit:contain;"></video>`
        : (st.imageUrl
            ? `<img src="${st.imageUrl}" alt="${escapeHtml(st.label || 'Sticker')}" style="max-width:var(--chat-sticker-size, 120px); max-height:var(--chat-sticker-size, 120px); width:auto; height:auto; object-fit:contain;">`
            : `<div class="sticker-emoji-art" style="background:${st.bg || '#fef08a'}">${st.emoji || '🎭'}</div>`);

      bubbleContentHtml = `
        <div class="sticker-card" onclick="openMessageEditModal('${msg.id}')">
          ${innerArt}
          ${st.label ? `<span class="sticker-caption">${escapeHtml(st.label)}</span>` : ''}
          <div class="bubble-meta" style="width:100%; justify-content:flex-end; float:none; margin-top:2px;">
            <span>${msg.time || getNextStoryTime()}</span> ${tickHtml}
          </div>
        </div>
      `;
    } else if (msg.type === 'image') {
      const srcUrl = msg.imageUrl || msg.url || (msg.mediaData && msg.mediaData.url) || '';
      bubbleContentHtml = `
        <div class="sticker-card" onclick="openMessageEditModal('${msg.id}')">
          <img src="${srcUrl}" alt="${escapeHtml(msg.caption || msg.text || 'Image')}" style="max-width:var(--chat-sticker-size, 120px); max-height:var(--chat-sticker-size, 120px); width:auto; height:auto; border-radius:12px; object-fit:contain; display:block;" onerror="this.onerror=null; this.src=makeComicAvatarDataUri('IMG', '#38bdf8', '🖼️');">
          ${msg.caption || (msg.text && msg.text !== srcUrl) ? `<span class="sticker-caption">${escapeHtml(msg.caption || msg.text)}</span>` : ''}
          <div class="bubble-meta" style="width:100%; justify-content:flex-end; float:none; margin-top:2px;">
            <span>${msg.time || getNextStoryTime()}</span> ${tickHtml}
          </div>
        </div>
      `;
    } else if (msg.type === 'video') {
      const srcUrl = msg.videoUrl || msg.url || (msg.mediaData && msg.mediaData.url) || '';
      bubbleContentHtml = `
        <div class="sticker-card" onclick="openMessageEditModal('${msg.id}')">
          <video src="${srcUrl}" controls playsinline style="max-width:var(--chat-sticker-size, 120px); max-height:var(--chat-sticker-size, 120px); width:auto; height:auto; border-radius:12px; object-fit:contain; display:block;"></video>
          ${msg.caption || (msg.text && msg.text !== srcUrl) ? `<span class="sticker-caption">${escapeHtml(msg.caption || msg.text)}</span>` : ''}
          <div class="bubble-meta" style="width:100%; justify-content:flex-end; float:none; margin-top:2px;">
            <span>${msg.time || getNextStoryTime()}</span> ${tickHtml}
          </div>
        </div>
      `;
    } else if (msg.type === 'audio' || msg.type === 'voice') {
      const audioSrc = msg.audioUrl || msg.url || msg.data || '';
      bubbleContentHtml = `
        <div class="speech-bubble" onclick="openMessageEditModal('${msg.id}')" style="min-width:180px;">
          ${replyBoxHtml}
          <div style="display:flex; align-items:center; gap:8px; padding:4px 0;">
            <button type="button" class="icon-btn" style="background:#00a884; color:#fff; border-radius:50%; width:30px; height:30px; padding:0; display:flex; align-items:center; justify-content:center; flex-shrink:0;" onclick="event.stopPropagation(); playCustomAudio('${audioSrc}')">▶</button>
            <div style="display:flex; flex-direction:column;">
              <span style="font-size:12px; font-weight:800; color:#f8fafc;">${escapeHtml(msg.label || 'Voice Message')}</span>
              <span style="font-size:10px; color:#94a3b8;">${msg.duration || '0:05'}</span>
            </div>
          </div>
          <span class="bubble-meta">
            <span>${msg.time || getNextStoryTime()}</span> ${tickHtml}
          </span>
        </div>
      `;
    } else if (msg.type === 'sfx') {
      bubbleContentHtml = `
        <div class="speech-bubble sfx-burst-bubble" onclick="openMessageEditModal('${msg.id}')">
          ${replyBoxHtml}
          <span class="bubble-text" style="font-weight:900;">${escapeHtml(msg.text)}</span>
          <span class="bubble-meta" style="color:#0f172a;">
            <span>${msg.time || getNextStoryTime()}</span>
          </span>
        </div>
      `;
    } else {
      const emotionBubbleClass = (expr === 'angry' || expr === 'shock' || expr === 'love' || expr === 'cry' || expr === 'whisper') ? `bubble-${expr}` : '';
      bubbleContentHtml = `
        <div class="speech-bubble ${emotionBubbleClass}" onclick="openMessageEditModal('${msg.id}')" title="Click to Edit, Reply, Reorder or Delete">
          ${replyBoxHtml}
          <span class="bubble-text">${escapeHtml(msg.text)}</span>
          <span class="bubble-meta">
            <span>${msg.time || getNextStoryTime()}</span> ${tickHtml}
          </span>
        </div>
      `;
    }

    // Completely clean avatar (NO reaction emoji badge, NO mood pill)
    row.innerHTML = `
      <div class="char-avatar-box" onclick="triggerExpressionEffects('${expr}', ${char.pitch || 1.05}, this.closest('.msg-row').querySelector('.speech-bubble, .sticker-card'))" title="${escapeHtml(char.name)}">
        <img class="char-avatar-img" src="${getCharacterAvatarForExpr(char, expr)}" alt="${escapeHtml(char.name)}">
      </div>
      <div class="bubble-wrapper">
        <div class="sender-name-label" style="color: ${char.color}">
          <span>${escapeHtml(char.name)}</span>
        </div>
        ${bubbleContentHtml}
      </div>
    `;

    return row;
  }

  function renderChatStream(subsetMessages = null) {
    const stream = document.getElementById('chatStream');
    stream.innerHTML = '';
    const listToRender = subsetMessages || messages;
    const fragment = document.createDocumentFragment();

    if (activeAppMode === 'gemini') {
      const hero = document.getElementById('geminiHeroContainer');
      if (hero) stream.appendChild(hero);
    }

    listToRender.forEach((msg, index) => {
      const el = createMessageRowElement(msg, index, listToRender);
      fragment.appendChild(el);
    });

    stream.appendChild(fragment);
    stream.scrollTop = stream.scrollHeight;
  }

  function replayStickerCard(msgId) {
    const msg = messages.find(m => m.id === msgId);
    if (!msg) return;
    const char = characters.find(c => c.id === msg.charId) || characters[0];
    const st = msg.stickerData || {};
    if (st.customAudioData) {
      playCustomAudio(st.customAudioData);
    } else if (st.sfx) {
      triggerSfxByName(st.sfx, char.pitch || 1.05);
    }
    triggerExpressionEffects(msg.expr || st.expr || 'normal', char.pitch || 1.05);
    if (!isCinemaPlaying) {
      openMessageEditModal(msgId);
    }
  }

  /* =====================================================================
     7. SENDING MESSAGES, STICKERS & REALISTIC TYPING INDICATOR
     ===================================================================== */
  let activePovComposerTimer = null;
  let activePreDelayTimer = null;
  let userComposerDraftBackup = '';
  let cinemaPlaybackMode = 'natural'; // 'natural' | 'instant'

  function clearTypingTimers() {
    if (activeTypingTimer) {
      clearTimeout(activeTypingTimer);
      activeTypingTimer = null;
    }
    if (activeTypingTickTimer) {
      clearInterval(activeTypingTickTimer);
      activeTypingTickTimer = null;
    }
    if (activePovComposerTimer) {
      clearTimeout(activePovComposerTimer);
      activePovComposerTimer = null;
    }
    if (activePreDelayTimer) {
      clearTimeout(activePreDelayTimer);
      activePreDelayTimer = null;
    }
    document.querySelectorAll('.typing-indicator-row').forEach(el => el.remove());
    const input = document.getElementById('chatMessageInput');
    if (input) {
      input.classList.remove('simulated-typing-active');
      if (isCinemaPlaying) {
        input.value = '';
        autoResizeComposerInput(input);
      }
    }
    const statusEl = document.getElementById('headerGroupStatus');
    if (statusEl) {
      statusEl.classList.remove('typing-pulse-status');
      const autoStatus = characters.map(c => c.name).join(', ');
      statusEl.textContent = groupProfile.status.trim() || autoStatus;
    }
  }

  /* Dynamically auto-expand composer textarea up to 120px and adjust Cinema HUD dock position */
  function autoResizeComposerInput(el) {
    if (!el) el = document.getElementById('chatMessageInput');
    if (!el) return;
    el.style.height = 'auto';
    const computedH = Math.min(Math.max(el.scrollHeight, 40), 120);
    el.style.height = computedH + 'px';
    if (el.scrollHeight > 120) {
      el.style.overflowY = 'auto';
    } else {
      el.style.overflowY = 'hidden';
    }
    const bar = document.getElementById('waInputBar');
    const barH = bar ? bar.offsetHeight : (computedH + 16);
    document.documentElement.style.setProperty('--composer-height', `${barH}px`);
  }

  /* Adaptive message-length-aware timing calculation for snappy short messages & smooth long paragraphs */
  function calculateAdaptiveTypingTiming(text, speedMultiplier = 1.0, isPov = false) {
    const mult = Math.max(0.2, speedMultiplier || 1.0);
    const rawLen = (text || '').trim().length;
    const len = Math.max(1, rawLen);

    // Adaptive typing duration based on character length using sub-linear curve
    // Short messages (3-15 chars): ~220ms - 450ms
    // Medium messages (20-60 chars): ~500ms - 1200ms
    // Long messages (100-300+ chars): ~1200ms - 2200ms max
    const rawTypingDuration = 220 + Math.pow(len, 0.76) * 24;
    const maxCap = isPov ? 2200 : 2400;
    const minCap = isPov ? 220 : 300;
    const clampedBaseDuration = Math.max(minCap, Math.min(maxCap, rawTypingDuration));
    const typingDuration = clampedBaseDuration / mult;

    // Per-character delay for POV composer typing
    const baseCharDelay = clampedBaseDuration / len;
    const charDelay = Math.max(14, baseCharDelay / mult);

    // Pre-typing think pause (reaction time before typing starts)
    const rawThink = isPov
      ? (140 + Math.min(len * 2, 140))
      : (180 + Math.min(len * 3, 200));
    const thinkPause = Math.max(100, rawThink / mult);

    // Post-bubble reading pause (time viewers need to read the message on screen)
    const rawReading = Math.max(450, Math.min(1800, 320 + Math.pow(len, 0.72) * 20));
    const readingPause = rawReading / mult;

    return {
      typingDuration,
      charDelay,
      thinkPause,
      readingPause,
      baseCharDelay
    };
  }

  function flushPendingLiveMessage() {
    if (typeof pendingMessageCommit === 'function') {
      const fn = pendingMessageCommit;
      pendingMessageCommit = null;
      clearTypingTimers();
      fn();
    }
  }

  function getNextStoryTime() {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].time && typeof messages[i].time === 'string' && messages[i].time.trim()) {
        return messages[i].time.trim();
      }
    }
    return '4:15 PM';
  }

  function showTypingIndicatorThenRun(char, durationMs, callback, expr = 'normal') {
    clearTypingTimers();
    const stream = document.getElementById('chatStream');
    const typingRow = document.createElement('div');
    typingRow.className = `typing-indicator-row ${char.side}`;
    const avatarSrc = getCharacterAvatarForExpr(char, expr || currentExpr || 'normal');
    typingRow.innerHTML = `
      <img src="${avatarSrc}" style="width:32px; height:32px; border-radius:50%; border:2px solid #0f172a; object-fit:cover;">
      <div class="typing-bubble">
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
      </div>
      <span class="typing-text-label">${escapeHtml(char.name)} is typing...</span>
    `;
    stream.appendChild(typingRow);
    stream.scrollTop = stream.scrollHeight;

    const statusEl = document.getElementById('headerGroupStatus');
    if (statusEl && char.side === 'left') {
      statusEl.textContent = `${char.name} is typing...`;
      statusEl.classList.add('typing-pulse-status');
    }

    if (soundEnabled) {
      activeTypingTickTimer = setInterval(() => {
        playTypingTickSound(char.pitch || 1.05);
      }, 140);
    }

    activeTypingTimer = setTimeout(() => {
      clearTypingTimers();
      pendingMessageCommit = null;
      callback();
    }, durationMs);
  }

  function sendUserMessage() {
    flushPendingLiveMessage();
    const input = document.getElementById('chatMessageInput');
    const text = input.value.trim();
    if (!text) return;

    if (text.toLowerCase().startsWith('/quest ')) {
      const qText = text.slice(7).trim();
      if (!qText) return;
      input.value = '';
      autoResizeComposerInput(input);
      messages.push({
        id: 'm_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
        type: 'quest',
        title: 'SYSTEM QUEST ALERT',
        text: qText
      });
      saveStudioState();
      renderChatStream();
      if (soundEnabled) playSciFiChimeSound();
      showToast('🟦 System Quest Activated!');
      return;
    }

    const char = characters.find(c => c.id === currentCharId) || characters[0];
    const exprToUse = currentExpr;
    const replyIdToUse = activeReplyMsgId;
    input.value = '';
    autoResizeComposerInput(input);
    clearActiveReply();

    const commitFn = () => {
      messages.push({
        id: 'm_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
        type: 'text',
        charId: char.id,
        text,
        expr: exprToUse,
        replyToId: replyIdToUse || null,
        time: getNextStoryTime()
      });
      saveStudioState();
      renderChatStream();
      triggerExpressionEffects(exprToUse, char.pitch || 1.05);
    };

    pendingMessageCommit = commitFn;
    showTypingIndicatorThenRun(char, 420, commitFn);
  }

  function sendStickerItem(stickerObj) {
    flushPendingLiveMessage();
    const char = characters.find(c => c.id === currentCharId) || characters[0];
    const exprToUse = stickerObj.expr || currentExpr;

    messages.push({
      id: 'm_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
      type: 'sticker',
      charId: char.id,
      stickerData: stickerObj,
      expr: exprToUse,
      replyToId: activeReplyMsgId || null,
      time: getNextStoryTime()
    });

    clearActiveReply();
    saveStudioState();
    renderChatStream();

    if (stickerObj.customAudioData) {
      playCustomAudio(stickerObj.customAudioData);
    } else if (stickerObj.sfx) {
      triggerSfxByName(stickerObj.sfx, char.pitch || 1.05);
    }
    triggerExpressionEffects(exprToUse, char.pitch || 1.05);
  }

  function sendSfxBurst(burstObj) {
    flushPendingLiveMessage();
    const char = characters.find(c => c.id === currentCharId) || characters[0];
    messages.push({
      id: 'm_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
      type: 'sfx',
      charId: char.id,
      text: burstObj.text,
      expr: burstObj.expr || 'angry',
      replyToId: activeReplyMsgId || null,
      time: getNextStoryTime()
    });
    clearActiveReply();
    saveStudioState();
    renderChatStream();
    triggerSfxByName(burstObj.sfx || 'boom', char.pitch || 1.05);
    triggerExpressionEffects(burstObj.expr || 'angry', char.pitch || 1.05);
  }

  const composerInputElement = document.getElementById('chatMessageInput');
  if (composerInputElement) {
    composerInputElement.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendUserMessage();
      }
    });
    composerInputElement.addEventListener('input', () => {
      autoResizeComposerInput(composerInputElement);
    });
  }

  /* =====================================================================
     8. STICKER, REACTIONS, SFX & SOUNDBOARD DRAWER
     ===================================================================== */
  function toggleStickerDrawer() {
    const drawer = document.getElementById('stickerDrawer');
    const btn = document.getElementById('stickerToggleBtn');
    const isOpen = drawer.classList.toggle('open');
    btn.classList.toggle('active', isOpen);
    if (isOpen) renderDrawerContent();
  }

  function switchDrawerTab(tabName) {
    activeDrawerTab = tabName;
    const btnStickers = document.getElementById('tabBtnStickers');
    const btnUploads = document.getElementById('tabBtnUploads');
    const btnSfx = document.getElementById('tabBtnSfx');
    const btnSounds = document.getElementById('tabBtnSounds');
    if (btnStickers) btnStickers.classList.toggle('active', tabName === 'stickers');
    if (btnUploads) btnUploads.classList.toggle('active', tabName === 'uploads');
    if (btnSfx) btnSfx.classList.toggle('active', tabName === 'sfx');
    if (btnSounds) btnSounds.classList.toggle('active', tabName === 'sounds');
    const grid = document.getElementById('drawerGridContent');
    if (grid) grid.scrollTop = 0;
    renderDrawerContent();
  }

  function renderDrawerContent() {
    const grid = document.getElementById('drawerGridContent');
    const subBar = document.getElementById('drawerSubBar');
    grid.innerHTML = '';

    // Handle Fixed Category Sub-Bar (Permanent strip above grid: Never scrolls off or overlaps)
    if (subBar) {
      subBar.innerHTML = '';
      if (activeDrawerTab === 'sfx') {
        subBar.classList.add('active');
        const cats = [
          { id: 'all', label: 'All SFX' },
          { id: 'combat', label: '💥 Combat' },
          { id: 'drama', label: '😱 Drama' },
          { id: 'comedy', label: '😂 Comedy' },
          { id: 'aura', label: '🔥 Auras' }
        ];
        cats.forEach(c => {
          const b = document.createElement('button');
          b.type = 'button';
          b.className = `subbar-pill ${currentSfxCategory === c.id ? 'active' : ''}`;
          b.textContent = c.label;
          b.onclick = (e) => {
            e.stopPropagation();
            currentSfxCategory = c.id;
            grid.scrollTop = 0;
            renderDrawerContent();
          };
          subBar.appendChild(b);
        });
      } else if (activeDrawerTab === 'sounds') {
        subBar.classList.add('active');
        const cats = [
          { id: 'all', label: 'All Sounds' },
          { id: 'combat', label: '🥊 Combat' },
          { id: 'drama', label: '😱 Drama' },
          { id: 'comedy', label: '😂 Comedy' }
        ];
        cats.forEach(c => {
          const b = document.createElement('button');
          b.type = 'button';
          b.className = `subbar-pill ${currentSoundCategory === c.id ? 'active' : ''}`;
          b.textContent = c.label;
          b.onclick = (e) => {
            e.stopPropagation();
            currentSoundCategory = c.id;
            grid.scrollTop = 0;
            renderDrawerContent();
          };
          subBar.appendChild(b);
        });
      } else if (activeDrawerTab === 'stickers' || activeDrawerTab === 'uploads') {
        subBar.classList.add('active');
        subBar.innerHTML = '';

        // Live Size Slider
        const sliderWrap = document.createElement('div');
        sliderWrap.style.cssText = 'display:flex; align-items:center; gap:5px; font-size:11px; color:#cbd5e1; flex-shrink:0;';
        sliderWrap.innerHTML = `
          <span title="Adjust sticker display size in chat">📏 Size:</span>
          <input type="range" id="drawerStickerSizeSlider" min="70" max="170" step="5" value="${chatStickerSize}" oninput="updateChatStickerSize(this.value)" style="width:70px; accent-color:#facc15; cursor:pointer;">
          <span id="drawerStickerSizeLabel" style="font-size:10px; font-weight:800; color:#facc15; min-width:32px;">${chatStickerSize}px</span>
        `;
        subBar.appendChild(sliderWrap);

        // Edit Mode Toggle Button
        const editModeBtn = document.createElement('button');
        editModeBtn.type = 'button';
        editModeBtn.className = `subbar-pill ${isDrawerEditMode ? 'active' : ''}`;
        editModeBtn.style.cssText = isDrawerEditMode ? 'background:#facc15; color:#0f172a; font-weight:900;' : '';
        editModeBtn.innerHTML = isDrawerEditMode ? '✅ Done' : '✏️ Edit Mode';
        editModeBtn.title = isDrawerEditMode ? 'Done editing (return to tap-to-send)' : 'Toggle edit mode to rename sticker labels';
        editModeBtn.onclick = (e) => {
          e.stopPropagation();
          toggleDrawerEditMode();
        };
        subBar.appendChild(editModeBtn);

        const count = (activeDrawerTab === 'stickers') ? builtInStickers.length : customStickers.length;
        const countSpan = document.createElement('span');
        countSpan.style.cssText = 'font-size:11px; font-weight:800; color:#94a3b8; align-self:center; margin-left:auto;';
        countSpan.textContent = activeDrawerTab === 'stickers' ? `${count} Stickers` : `${count} Uploads`;
        subBar.appendChild(countSpan);
      } else {
        subBar.classList.remove('active');
      }
    }

    if (activeDrawerTab === 'stickers') {
      builtInStickers.forEach((st) => {
        const card = document.createElement('div');
        card.className = `sticker-option-item ${isDrawerEditMode ? 'vault-edit-mode' : ''}`;
        card.onclick = () => {
          if (isDrawerEditMode) {
            renameBuiltInSticker(st.id);
          } else {
            sendStickerItem(st);
          }
        };

        const artHtml = st.imageUrl
          ? `<img src="${st.imageUrl}" alt="Sticker">`
          : `<span class="sticker-option-emoji">${st.emoji}</span>`;

        card.innerHTML = `
          ${isDrawerEditMode ? `<div class="edit-custom-btn" title="Click to rename label">✏️</div>` : ''}
          ${artHtml}
          <span class="sticker-option-label">${escapeHtml(st.label || 'Sticker')}</span>
        `;
        grid.appendChild(card);
      });
    } else if (activeDrawerTab === 'uploads') {
      if (customStickers.length === 0) {
        grid.innerHTML = `
          <div style="grid-column: 1 / -1; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:28px 10px; color:#94a3b8; text-align:center; gap:8px;">
            <span style="font-size:36px;">📁</span>
            <strong style="color:#f8fafc; font-size:13px;">Media Vault is Empty</strong>
            <p style="font-size:11px; max-width:240px; margin:0;">Upload your custom manhwa stickers, memes, PNGs, GIFs, or short video clips.</p>
            <button class="icon-btn" style="background:#00a884; margin-top:6px; padding:6px 14px; font-size:12px;" onclick="triggerCustomUploadForDrawer()">+ Upload Media (Multiple)</button>
          </div>
        `;
        return;
      }

      customStickers.forEach((st) => {
        const card = document.createElement('div');
        card.className = `sticker-option-item ${isDrawerEditMode ? 'vault-edit-mode' : ''}`;
        card.onclick = () => {
          if (isDrawerEditMode) {
            renameCustomSticker(st.id);
          } else {
            sendStickerItem(st);
          }
        };

        const mediaPreview = st.isVideo
          ? `<video src="${st.imageUrl}" muted autoplay loop playsinline style="width:52px; height:52px; border-radius:8px; object-fit:contain; background:rgba(0,0,0,0.05); pointer-events:none;"></video>`
          : `<img src="${st.imageUrl}" alt="Media" style="width:52px; height:52px; border-radius:8px; object-fit:contain; background:rgba(0,0,0,0.05);">`;

        card.innerHTML = `
          ${isDrawerEditMode ? `<div class="edit-custom-btn" title="Click to rename label">✏️</div>` : ''}
          ${isDrawerEditMode ? `<div class="delete-custom-btn" onclick="event.stopPropagation(); deleteCustomSticker('${st.id}')" title="Delete from Vault">✕</div>` : ''}
          ${mediaPreview}
          <span class="sticker-option-label">${escapeHtml(st.label || 'Media')}</span>
        `;
        grid.appendChild(card);
      });
    } else if (activeDrawerTab === 'sfx') {
      const filtered = currentSfxCategory === 'all'
        ? builtInSfxBursts
        : builtInSfxBursts.filter(b => b.category === currentSfxCategory);

      filtered.forEach(burst => {
        const card = document.createElement('div');
        card.className = 'sticker-option-item';
        card.style.background = burst.category === 'combat' ? '#fee2e2' : (burst.category === 'aura' ? '#ede9fe' : (burst.category === 'drama' ? '#e0f2fe' : '#fef08a'));
        card.onclick = () => sendSfxBurst(burst);
        card.innerHTML = `
          <span style="font-size:16px; font-weight:900; text-align:center; color:#0f172a; line-height:1.2;">${escapeHtml(burst.text)}</span>
          <span class="sticker-option-label" style="background:#0f172a; color:#fff; font-size:9.5px; padding:1px 6px; border-radius:6px; margin-top:4px;">${burst.sfx.toUpperCase()}</span>
        `;
        grid.appendChild(card);
      });
    } else if (activeDrawerTab === 'sounds') {
      const filtered = currentSoundCategory === 'all'
        ? builtInSounds
        : builtInSounds.filter(s => s.category === currentSoundCategory);

      filtered.forEach(snd => {
        const card = document.createElement('div');
        card.className = 'sticker-option-item';
        card.onclick = () => snd.fn();
        const icon = snd.category === 'combat' ? '🥊' : (snd.category === 'drama' ? '⚡' : '🔊');
        card.innerHTML = `
          <span style="font-size:22px;">${icon}</span>
          <span class="sticker-option-label">${escapeHtml(snd.label)}</span>
        `;
        grid.appendChild(card);
      });

      customAudioClips.forEach(snd => {
        const card = document.createElement('div');
        card.className = 'sticker-option-item';
        card.style.background = '#dcfce7';
        card.onclick = () => playCustomAudioById(snd.id);
        card.innerHTML = `
          <div class="delete-custom-btn" onclick="event.stopPropagation(); deleteCustomSound('${snd.id}')">✕</div>
          <span style="font-size:22px;">🎵</span>
          <span class="sticker-option-label">${escapeHtml(snd.label)}</span>
        `;
        grid.appendChild(card);
      });
    }
  }

  function triggerCustomUploadForDrawer() {
    if (activeDrawerTab === 'sounds') {
      document.getElementById('hiddenSoundInput').click();
    } else {
      document.getElementById('hiddenMediaInput').click();
    }
  }

  function handleMultipleMediaUpload(e) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    let processed = 0;
    files.forEach((file, idx) => {
      const reader = new FileReader();
      const isVideo = file.type.startsWith('video');
      const cleanBase = file.name.replace(/\.[^/.]+$/, '').trim();
      const baseLabel = cleanBase.replace(/[\-_]/g, ' ').slice(0, 20).toUpperCase() || 'MEDIA';

      reader.onload = (ev) => {
        customStickers.unshift({
          id: 'cust_media_' + Date.now() + '_' + idx + '_' + Math.random().toString(36).slice(2, 6),
          imageUrl: ev.target.result,
          label: baseLabel,
          isVideo: isVideo,
          expr: 'normal',
          sfx: isVideo ? 'pop' : 'boing',
          isCustom: true
        });
        processed++;
        if (processed === files.length) {
          saveStudioState();
          switchDrawerTab('uploads');
          showToast(`📁 Added ${files.length} item${files.length > 1 ? 's' : ''} to Media Vault!`);
        }
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  }

  function updateChatStickerSize(size) {
    chatStickerSize = Math.max(65, Math.min(180, parseInt(size, 10) || 120));
    try {
      document.documentElement.style.setProperty('--chat-sticker-size', `${chatStickerSize}px`);
    } catch (_) {}
    safeSetStorage('wh_chat_sticker_size', chatStickerSize.toString());
    const labels = document.querySelectorAll('#vaultStickerSizeLabel, #drawerStickerSizeLabel');
    labels.forEach(l => l.textContent = `${chatStickerSize}px`);
  }

  function toggleDrawerEditMode() {
    isDrawerEditMode = !isDrawerEditMode;
    isVaultEditMode = isDrawerEditMode;
    renderDrawerContent();
    showToast(isDrawerEditMode ? '✏️ Edit Mode ON: Click any sticker to rename label' : '✅ Edit Mode OFF: Tapping sends stickers');
  }
  const toggleVaultEditMode = toggleDrawerEditMode;

  function renameBuiltInSticker(id) {
    const st = builtInStickers.find(s => s.id === id);
    if (!st) return;
    const current = st.label || '';
    const newName = prompt(`✏️ Rename sticker "${st.emoji}" label (used in scripts e.g. [Char:STICKER]: LABEL):`, current);
    if (newName === null) return;
    const clean = newName.trim().toUpperCase() || 'STICKER';
    st.label = clean;
    customBuiltInLabels[id] = clean;
    safeSetStorage('wh_builtin_sticker_labels', JSON.stringify(customBuiltInLabels));
    renderDrawerContent();
    renderChatStream();
    showToast(`✏️ Renamed "${st.emoji}" sticker to "${clean}"`);
  }

  function setVaultFitMode(mode) {
    vaultFitMode = mode;
    safeSetStorage('wh_vault_fit_mode', vaultFitMode);
    renderDrawerContent();
    renderChatStream();
    showToast(vaultFitMode === 'contain' ? '🔍 Stickers: Full Artwork (No Crop)' : '🔲 Stickers: Square Fit (Cover)');
  }

  function renameCustomSticker(id) {
    const st = customStickers.find(s => s.id === id);
    if (!st) return;
    const current = st.label || '';
    const newName = prompt('✏️ Rename sticker/media label (used in scripts e.g. [Char:STICKER]: LABEL):', current);
    if (newName === null) return;
    const clean = newName.trim().toUpperCase() || 'STICKER';
    st.label = clean;
    saveStudioState();
    renderDrawerContent();
    renderChatStream();
    showToast(`✏️ Renamed sticker to "${clean}"`);
  }

  document.getElementById('hiddenSoundInput').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const cleanName = file.name.replace(/\.[^/.]+$/, '').slice(0, 14);
      customAudioClips.push({
        id: 'aud_' + Date.now(),
        label: cleanName,
        data: ev.target.result
      });
      saveStudioState();
      switchDrawerTab('sounds');
      playCustomAudio(ev.target.result);
      showToast('🎵 Sound clip uploaded!');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  });

  function deleteCustomSticker(id) {
    customStickers = customStickers.filter(s => s.id !== id);
    saveStudioState();
    renderDrawerContent();
  }

  function deleteCustomSound(id) {
    customAudioClips = customAudioClips.filter(s => s.id !== id);
    saveStudioState();
    renderDrawerContent();
  }

  /* =====================================================================
     9. INTERACTIVE CIRCULAR AVATAR CROPPER (FOR GROUP DP & CAST DPS)
     ===================================================================== */
  let cropTargetId = null;
  let cropImageObj = null;
  let cropOffsetX = 0;
  let cropOffsetY = 0;
  let cropIsDragging = false;
  let cropDragStartX = 0;
  let cropDragStartY = 0;

  function startAvatarCrop(targetId) {
    cropTargetId = targetId;
    document.getElementById('hiddenAvatarInput').click();
  }

  document.getElementById('hiddenAvatarInput').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        cropImageObj = img;
        cropOffsetX = 0;
        cropOffsetY = 0;
        document.getElementById('cropZoomSlider').value = 1;
        document.getElementById('cropperModal').classList.add('open');
        renderCropperCanvas();
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  });

  function renderCropperCanvas() {
    if (!cropImageObj) return;
    const canvas = document.getElementById('avatarCropCanvas');
    const ctx = canvas.getContext('2d');
    const zoom = parseFloat(document.getElementById('cropZoomSlider').value) || 1;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const baseScale = Math.max(canvas.width / cropImageObj.width, canvas.height / cropImageObj.height);
    const drawW = cropImageObj.width * baseScale * zoom;
    const drawH = cropImageObj.height * baseScale * zoom;
    const drawX = (canvas.width - drawW) / 2 + cropOffsetX;
    const drawY = (canvas.height - drawH) / 2 + cropOffsetY;

    ctx.drawImage(cropImageObj, drawX, drawY, drawW, drawH);
  }

  const cropBox = document.getElementById('cropperTouchBox');

  cropBox.addEventListener('pointerdown', (e) => {
    cropIsDragging = true;
    cropDragStartX = e.clientX - cropOffsetX;
    cropDragStartY = e.clientY - cropOffsetY;
    cropBox.setPointerCapture(e.pointerId);
  });

  cropBox.addEventListener('pointermove', (e) => {
    if (!cropIsDragging) return;
    cropOffsetX = e.clientX - cropDragStartX;
    cropOffsetY = e.clientY - cropDragStartY;
    renderCropperCanvas();
  });

  cropBox.addEventListener('pointerup', () => {
    cropIsDragging = false;
  });

  function applyAvatarCrop() {
    const canvas = document.getElementById('avatarCropCanvas');
    const croppedDataUrl = canvas.toDataURL('image/jpeg', 0.88);

    if (cropTargetId === 'GROUP') {
      groupProfile.dp = croppedDataUrl;
      document.getElementById('modalGroupDpPreview').src = croppedDataUrl;
      renderGroupHeader();
    } else if (typeof cropTargetId === 'string' && cropTargetId.includes('__expr__')) {
      const parts = cropTargetId.split('__expr__');
      const charId = parts[0];
      const exprKey = parts[1];
      const char = characters.find(c => c.id === charId);
      if (char) {
        ensureCharacterExpressions(char);
        char.expressions[exprKey] = croppedDataUrl;
        if (exprKey === 'normal') {
          char.avatar = croppedDataUrl;
        }
        renderCastModalList();
        renderHubCastList();
        renderDirectorStrip();
        renderChatStream();
        if (currentCharWardrobeId === charId) {
          renderCharacterExpressionWardrobe(charId);
        }
      }
    } else {
      const char = characters.find(c => c.id === cropTargetId);
      if (char) {
        char.avatar = croppedDataUrl;
        ensureCharacterExpressions(char);
        char.expressions.normal = croppedDataUrl;
        renderCastModalList();
        renderHubCastList();
        renderDirectorStrip();
        renderChatStream();
      }
    }
    saveStudioState();
    closeCropperModal();
    showToast('✂️ Avatar cropped and saved!');
  }

  function closeCropperModal() {
    document.getElementById('cropperModal').classList.remove('open');
    cropImageObj = null;
  }

  /* =====================================================================
     10. GROUP SETTINGS & CHARACTER CAST MANAGER MODALS
     ===================================================================== */
  function openGroupModal() {
    document.getElementById('modalGroupDpPreview').src = groupProfile.dp;
    document.getElementById('groupNameInput').value = groupProfile.name;
    document.getElementById('groupStatusInput').value = groupProfile.status;
    document.querySelectorAll('.wall-swatch').forEach(sw => {
      sw.classList.toggle('active', sw.dataset.wall === groupProfile.wallpaper);
    });
    document.getElementById('groupModal').classList.add('open');
  }

  function closeGroupModal() {
    document.getElementById('groupModal').classList.remove('open');
  }

  function selectWallpaper(wallClass) {
    groupProfile.wallpaper = wallClass;
    document.querySelectorAll('.wall-swatch').forEach(sw => {
      sw.classList.toggle('active', sw.dataset.wall === wallClass);
    });
    renderGroupHeader();
    saveStudioState();
  }

  // Compress uploaded wallpaper so localStorage never overflows
  document.getElementById('hiddenWallpaperInput').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const maxDim = 900;
        let w = img.width;
        let h = img.height;
        if (w > maxDim || h > maxDim) {
          if (w > h) { h = Math.round(h * (maxDim / w)); w = maxDim; }
          else { w = Math.round(w * (maxDim / h)); h = maxDim; }
        }
        const offCanvas = document.createElement('canvas');
        offCanvas.width = w;
        offCanvas.height = h;
        offCanvas.getContext('2d').drawImage(img, 0, 0, w, h);
        groupProfile.wallpaper = 'wall-custom';
        groupProfile.customWallpaperData = offCanvas.toDataURL('image/jpeg', 0.82);
        renderGroupHeader();
        saveStudioState();
        showToast('🖼️ Custom wallpaper applied!');
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  });

  function saveGroupSettings() {
    const newName = document.getElementById('groupNameInput').value.trim();
    if (newName) groupProfile.name = newName;
    groupProfile.status = document.getElementById('groupStatusInput').value.trim();
    saveStudioState();
    renderGroupHeader();
    closeGroupModal();
    showToast('✅ Group settings saved!');
  }

  function openCastModal() {
    renderCastModalList();
    document.getElementById('castModal').classList.add('open');
  }

  function closeCastModal() {
    document.getElementById('castModal').classList.remove('open');
  }


  /* === HUB TAB SYSTEM === */
  let activeHubTab = 'scenes';

  function switchHubTab(tabName) {
    activeHubTab = tabName;
    const tabs = ['scenes', 'cast', 'stage', 'tools'];
    tabs.forEach(t => {
      const btn = document.getElementById('tabBtnHub' + t.charAt(0).toUpperCase() + t.slice(1));
      const panel = document.getElementById('hubPanel' + t.charAt(0).toUpperCase() + t.slice(1));
      if (btn) btn.classList.toggle('active', t === tabName);
      if (panel) panel.classList.toggle('active', t === tabName);
    });

    if (tabName === 'cast') {
      renderHubCastList();
    }
  }

  /* === VOICE PITCH TESTER === */
  function testCharVoice(pitch) {
    if (soundEnabled) {
      playTypingTickSound(pitch || 1.05);
      setTimeout(() => playPopSound(pitch || 1.05), 140);
    } else {
      showToast('🔊 Turn Sound ON in tools to hear voice preview');
    }
  }

  /* === CHARACTER REORDERING === */
  function moveCharacterOrder(index, delta) {
    const targetIdx = index + delta;
    if (targetIdx < 0 || targetIdx >= characters.length) return;
    const temp = characters[index];
    characters[index] = characters[targetIdx];
    characters[targetIdx] = temp;
    saveStudioState();
    renderCastModalList();
    renderHubCastList();
    renderDirectorStrip();
    renderChatStream();
  }

  /* === QUICK PRESET CHARACTERS === */
  function addPresetCharacter(presetKey) {
    const presets = {
      jinwoo: { name: 'Sung Jinwoo', color: '#8b5cf6', pitch: 0.85, emoji: '⚔️', role: 'Shadow Monarch' },
      gojo: { name: 'Gojo Satoru', color: '#0ea5e9', pitch: 1.15, emoji: '⚡', role: 'Special Grade' },
      chatgpt: { name: 'ChatGPT 4o', color: '#10a37f', pitch: 0.95, emoji: '🤖', role: 'AI Sage' },
      gemini: { name: 'Gemini', color: '#4285f4', pitch: 1.10, emoji: '✨', role: 'Lore Master' },
      doraemon: { name: 'Doraemon', color: '#38bdf8', pitch: 0.92, emoji: '🚪', role: 'Gadget Master' },
      nobita: { name: 'Nobita', color: '#facc15', pitch: 1.25, emoji: '👦', role: 'Protagonist' },
      waifu: { name: 'Sakura', color: '#f43f5e', pitch: 1.35, emoji: '🌸', role: 'Heroine' }
    };

    const p = presets[presetKey] || presets.jinwoo;
    const newId = (presetKey === 'chatgpt') ? 'c_gpt' : ((presetKey === 'gemini') ? 'c_gem' : 'c_' + Date.now());

    // If previously deleted AI cast, clear its exclusion so it can be re-added
    if (Array.isArray(deletedCastIds)) {
      deletedCastIds = deletedCastIds.filter(id => id !== newId);
    }

    const existing = characters.find(c => c.id === newId);
    if (existing) {
      existing.name = p.name;
      existing.color = p.color;
      existing.pitch = p.pitch;
      existing.role = p.role;
      existing.avatar = makeComicAvatarDataUri(p.name, p.color, p.emoji);
      currentCharId = existing.id;
    } else {
      characters.push({
        id: newId,
        name: p.name,
        side: characters.length % 2 === 0 ? 'left' : 'right',
        color: p.color,
        pitch: p.pitch,
        role: p.role,
        avatar: makeComicAvatarDataUri(p.name, p.color, p.emoji)
      });
      currentCharId = newId;
    }

    saveStudioState();
    renderCastModalList();
    renderHubCastList();
    renderGroupHeader();
    renderDirectorStrip();
    showToast('✨ Added Cast: ' + p.name + '!');
  }

  /* === UNIVERSAL CAST CARD BUILDER === */
  function createCastCardElement(c, idx, inHub = false) {
    const card = document.createElement('div');
    card.className = 'cast-card';
    const isCurrentSpeaker = (currentCharId === c.id);
    const accentColor = c.color || '#38bdf8';

    card.innerHTML = `
      <div class="cast-card-top-row">
        <div class="cast-card-reorder-group" title="Reorder character in roster">
          ${idx > 0 ? `<button type="button" class="cast-reorder-btn" onclick="moveCharacterOrder(${idx}, -1)" title="Move Up">▲</button>` : `<div style="width:26px; height:26px;"></div>`}
          ${idx < characters.length - 1 ? `<button type="button" class="cast-reorder-btn" onclick="moveCharacterOrder(${idx}, 1)" title="Move Down">▼</button>` : `<div style="width:26px; height:26px;"></div>`}
        </div>

        <div class="cast-dp-btn" style="border-color:${accentColor};" onclick="${inHub ? 'closeGlobalSettingsModal(); ' : ''}startAvatarCrop('${c.id}')" title="Click to Upload & Crop DP">
          <img src="${c.avatar}" alt="${escapeHtml(c.name)}">
          <div class="cast-dp-overlay">✂️ CROP</div>
        </div>

        <div class="cast-card-main-info">
          <div class="cast-name-row">
            <input type="text" class="cast-name-input" value="${escapeHtml(c.name)}" placeholder="Character Name"
              oninput="updateCharProp('${c.id}', 'name', this.value)" title="Edit Character Name">
            <input type="color" class="cast-color-picker" value="${c.color || '#38bdf8'}"
              onchange="updateCharProp('${c.id}', 'color', this.value)" title="Choose Accent Color">
          </div>

          <div class="cast-controls-row">
            <select class="cast-select" onchange="updateCharProp('${c.id}', 'side', this.value)" title="Speech Bubble Alignment Side">
              <option value="left" ${c.side === 'left' ? 'selected' : ''}>⬅️ Left Side</option>
              <option value="right" ${c.side === 'right' ? 'selected' : ''}>➡️ Right Side</option>
            </select>

            <select class="cast-select" onchange="updateCharProp('${c.id}', 'pitch', parseFloat(this.value))" title="Voice Pitch Audio Tone">
              <option value="0.85" ${(c.pitch || 1.05) < 0.95 ? 'selected' : ''}>🔉 Deep Voice (0.85x)</option>
              <option value="1.05" ${(c.pitch || 1.05) >= 0.95 && (c.pitch || 1.05) <= 1.2 ? 'selected' : ''}>🔊 Normal Voice (1.05x)</option>
              <option value="1.32" ${(c.pitch || 1.05) > 1.2 ? 'selected' : ''}>🎵 High Pitch (1.32x)</option>
            </select>

            <button type="button" class="icon-btn" style="padding:5px 9px; font-size:12px; background:#0f172a; border:1px solid #334155;" onclick="testCharVoice(${c.pitch || 1.05})" title="Preview voice synthesis audio">
              🔊 Test
            </button>
          </div>
        </div>
      </div>

      <div class="cast-card-actions-row">
        <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
          ${isCurrentSpeaker ? 
            `<span class="cast-active-speaker-tag">🎤 Active Speaker</span>` :
            `<button type="button" class="cast-set-speaker-btn" onclick="selectActiveSpeaker('${c.id}')" title="Set this character as current dialogue speaker">🎙️ Set Speaker</button>`
          }
          <button type="button" class="cast-set-speaker-btn" style="background:#4338ca; border-color:#6366f1; color:#fff;" onclick="${inHub ? 'closeGlobalSettingsModal(); ' : ''}openCharExpressionModal('${c.id}')" title="Customize facial expressions & wardrobe">
            🎭 Expressions (${Object.keys(c.expressions || {}).length || 6})
          </button>
          ${c.role ? `<span class="cast-role-tag">${escapeHtml(c.role)}</span>` : ''}
        </div>

        <button type="button" class="cast-delete-btn" onclick="confirmDeleteCharacter('${c.id}')" title="Remove ${escapeHtml(c.name)} from cast roster">
          🗑️ Remove
        </button>
      </div>
    `;

    return card;
  }

  function selectActiveSpeaker(charId) {
    currentCharId = charId;
    saveStudioState();
    renderDirectorStrip();
    renderCastModalList();
    renderHubCastList();
    const c = characters.find(x => x.id === charId);
    showToast(`🎙️ Speaker set to: ${c ? c.name : 'Character'}`);
  }

  function renderHubCastList() {
    const hubCount = document.getElementById('hubCastCount');
    if (hubCount) hubCount.textContent = characters.length;
    const container = document.getElementById('hubCastListContainer');
    if (!container) return;
    container.innerHTML = '';
    characters.forEach((c, idx) => {
      container.appendChild(createCastCardElement(c, idx, true));
    });
  }

  function renderCastModalList() {
    const container = document.getElementById('castListContainer');
    if (!container) return;
    container.innerHTML = '';
    characters.forEach((c, idx) => {
      container.appendChild(createCastCardElement(c, idx, false));
    });
  }

  function updateCharProp(charId, prop, value) {
    const char = characters.find(c => c.id === charId);
    if (!char) return;
    char[prop] = value;
    saveStudioState();
    renderGroupHeader();
    renderDirectorStrip();
    renderChatStream();
  }

  function addNewCharacter() {
    const palette = ['#a855f7', '#10b981', '#f97316', '#ec4899', '#3b82f6'];
    const emojis = ['🔥', '⚔️', '🌟', '🦊', '👑'];
    const idx = characters.length;
    const newId = 'c_' + Date.now();
    const defaultName = 'Hero ' + (idx + 1);
    const color = palette[idx % palette.length];
    const newChar = {
      id: newId,
      name: defaultName,
      side: idx % 2 === 0 ? 'left' : 'right',
      color,
      pitch: 1.05,
      avatar: makeComicAvatarDataUri(defaultName, color, emojis[idx % emojis.length])
    };
    ensureCharacterExpressions(newChar);
    characters.push(newChar);
    currentCharId = newId;
    saveStudioState();
    renderCastModalList();
    renderHubCastList();
    renderGroupHeader();
    renderDirectorStrip();
    showToast(`➕ Added ${defaultName}!`);
  }

  /* === CHARACTER DELETION & CONFIRMATION SYSTEM === */
  let characterPendingDeleteId = null;

  function confirmDeleteCharacter(charId) {
    if (characters.length <= 1) {
      showToast('⚠️ Cannot delete! You need at least 1 character in the cast roster.');
      return;
    }
    const char = characters.find(c => c.id === charId);
    if (!char) return;

    characterPendingDeleteId = charId;
    const nameEl = document.getElementById('deleteConfirmCharName');
    const avatarEl = document.getElementById('deleteConfirmAvatar');
    if (nameEl) nameEl.textContent = char.name;
    if (avatarEl) {
      avatarEl.src = char.avatar;
      avatarEl.alt = char.name;
    }
    const modal = document.getElementById('deleteConfirmModal');
    if (modal) modal.classList.add('open');
  }

  function closeDeleteConfirmModal() {
    const modal = document.getElementById('deleteConfirmModal');
    if (modal) modal.classList.remove('open');
    characterPendingDeleteId = null;
  }

  function executeCharacterDeletion() {
    if (!characterPendingDeleteId) return;
    const charId = characterPendingDeleteId;
    const target = characters.find(c => c.id === charId);
    const targetName = target ? target.name : 'Character';

    // Track ID in deletedCastIds to prevent ensureAiCastMembers() from recreating it
    if (!Array.isArray(deletedCastIds)) deletedCastIds = [];
    if (!deletedCastIds.includes(charId)) {
      deletedCastIds.push(charId);
    }

    // Filter out character
    characters = characters.filter(c => c.id !== charId);

    // If current active speaker was deleted, fall back to first character
    if (currentCharId === charId) {
      currentCharId = characters.length > 0 ? characters[0].id : '';
    }

    closeDeleteConfirmModal();
    saveStudioState();
    renderCastModalList();
    renderHubCastList();
    renderGroupHeader();
    renderDirectorStrip();
    renderChatStream();

    showToast(`🗑️ Removed "${targetName}" from cast!`);
  }

  function deleteCharacter(charId) {
    confirmDeleteCharacter(charId);
  }

  /* =====================================================================
     10B. CHARACTER FACIAL EXPRESSIONS WARDROBE SYSTEM
     ===================================================================== */
  let currentCharWardrobeId = null;

  function openCharExpressionModal(charId) {
    currentCharWardrobeId = charId;
    const char = characters.find(c => c.id === charId);
    if (!char) return;
    ensureCharacterExpressions(char);

    const titleEl = document.getElementById('exprModalTitle');
    if (titleEl) titleEl.textContent = `🎭 ${char.name}'s Wardrobe & Faces`;

    const roleEl = document.getElementById('exprModalRoleTag');
    if (roleEl) roleEl.textContent = (char.side === 'left' ? '⬅️ Left Side' : '➡️ Right Side');

    renderCharacterExpressionWardrobe(charId);

    const modal = document.getElementById('charExpressionModal');
    if (modal) modal.classList.add('open');
  }

  function closeCharExpressionModal() {
    const modal = document.getElementById('charExpressionModal');
    if (modal) modal.classList.remove('open');
    currentCharWardrobeId = null;
  }

  function renderCharacterExpressionWardrobe(charId) {
    const char = characters.find(c => c.id === charId);
    if (!char) return;
    ensureCharacterExpressions(char);

    const grid = document.getElementById('charExpressionGrid');
    if (!grid) return;
    grid.innerHTML = '';

    const standardExprs = [
      { key: 'normal', label: 'Normal / Default' },
      { key: 'cry', label: 'Crying / Sad' },
      { key: 'shock', label: 'Shocked / Stunned' },
      { key: 'angry', label: 'Angry / Raging' },
      { key: 'love', label: 'Love / Blushing' },
      { key: 'laugh', label: 'Laughing / Joy' }
    ];

    const processedKeys = new Set();

    standardExprs.forEach(std => {
      processedKeys.add(std.key);
      const imgData = char.expressions[std.key] || char.avatar;
      const card = document.createElement('div');
      card.className = 'char-expr-card';
      card.innerHTML = `
        <div class="char-expr-img-wrap" onclick="startAvatarCrop('${char.id}__expr__${std.key}')" title="Click to upload & crop ${std.label}">
          <img class="char-expr-img" src="${imgData}" alt="${std.label}">
          <div class="char-expr-overlay">✂️ CROP</div>
        </div>
        <div class="char-expr-name" title="${std.label}">${std.label}</div>
        <div class="char-expr-tag">[${escapeHtml(char.name)}:${std.key}]</div>
        <div style="display:flex; gap:4px; width:100%;">
          <button type="button" class="char-expr-crop-btn" style="flex:1;" onclick="startAvatarCrop('${char.id}__expr__${std.key}')" title="Change ${std.label} image">
            ✂️ Crop
          </button>
          <button type="button" class="char-expr-edit-btn" style="padding:4px 8px;" onclick="openExprEditModal('${char.id}', '${std.key}')" title="Edit expression">
            ✏️
          </button>
        </div>
      `;
      grid.appendChild(card);
    });

    const allKeys = Object.keys(char.expressions || {});
    allKeys.forEach(k => {
      if (processedKeys.has(k)) return;
      processedKeys.add(k);
      const imgData = char.expressions[k];
      const displayLabel = k.charAt(0).toUpperCase() + k.slice(1).replace(/_/g, ' ');
      const card = document.createElement('div');
      card.className = 'char-expr-card';
      card.innerHTML = `
        <div class="char-expr-img-wrap" onclick="startAvatarCrop('${char.id}__expr__${k}')" title="Click to upload & crop ${displayLabel}">
          <img class="char-expr-img" src="${imgData}" alt="${displayLabel}">
          <div class="char-expr-overlay">✂️ CROP</div>
        </div>
        <div class="char-expr-name" title="${displayLabel}">${displayLabel}</div>
        <div class="char-expr-tag">[${escapeHtml(char.name)}:${k}]</div>
        <div style="display:flex; gap:4px; width:100%;">
          <button type="button" class="char-expr-crop-btn" style="flex:1;" onclick="startAvatarCrop('${char.id}__expr__${k}')" title="Change face image">
            ✂️ Crop
          </button>
          <button type="button" class="char-expr-edit-btn" style="padding:4px 8px;" onclick="openExprEditModal('${char.id}', '${k}')" title="Rename or edit expression tag">
            ✏️
          </button>
          <button type="button" class="char-expr-crop-btn" style="width:28px; padding:4px 0; background:#450a0a; border-color:#991b1b; color:#fca5a5;" onclick="removeCustomEmotionFromCurrentChar('${k}')" title="Remove this emotion">
            ✕
          </button>
        </div>
      `;
      grid.appendChild(card);
    });
  }

  /* === EDIT EXPRESSION SYSTEM === */
  let editingExprCharId = null;
  let editingExprKey = null;

  function openExprEditModal(charId, exprKey) {
    const char = characters.find(c => c.id === charId);
    if (!char) return;
    ensureCharacterExpressions(char);
    editingExprCharId = charId;
    editingExprKey = exprKey;

    const charNameEl = document.getElementById('exprEditCharName');
    const tagEl = document.getElementById('exprEditCurrentTag');
    const imgEl = document.getElementById('exprEditAvatarImg');
    const inputEl = document.getElementById('exprEditNameInput');

    if (charNameEl) charNameEl.textContent = char.name;
    if (tagEl) tagEl.textContent = `Current Tag: [${char.name}:${exprKey}]`;
    if (imgEl) imgEl.src = char.expressions[exprKey] || char.avatar;
    if (inputEl) inputEl.value = exprKey;

    const modal = document.getElementById('exprEditModal');
    if (modal) modal.classList.add('open');
  }

  function closeExprEditModal() {
    const modal = document.getElementById('exprEditModal');
    if (modal) modal.classList.remove('open');
    editingExprCharId = null;
    editingExprKey = null;
  }

  function saveEditedExpression() {
    if (!editingExprCharId || !editingExprKey) return;
    const char = characters.find(c => c.id === editingExprCharId);
    if (!char) return;
    ensureCharacterExpressions(char);

    const input = document.getElementById('exprEditNameInput');
    const rawVal = (input.value || '').trim();
    if (!rawVal) {
      showToast('⚠️ Please enter an expression tag name!');
      return;
    }
    const cleanKey = rawVal.toLowerCase().replace(/[^a-z0-9_]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');
    if (!cleanKey) {
      showToast('⚠️ Invalid expression tag!');
      return;
    }

    if (cleanKey !== editingExprKey) {
      const imgData = char.expressions[editingExprKey] || char.avatar;
      char.expressions[cleanKey] = imgData;

      const standardKeys = ['normal', 'cry', 'shock', 'angry', 'love', 'laugh'];
      if (!standardKeys.includes(editingExprKey)) {
        delete char.expressions[editingExprKey];
      }

      // Update any active chat messages using the old tag
      if (Array.isArray(messages)) {
        messages.forEach(m => {
          if (m.charId === char.id && m.expr === editingExprKey) {
            m.expr = cleanKey;
          }
        });
      }
      showToast(`✏️ Emotion tag updated to "[${char.name}:${cleanKey}]"!`);
    } else {
      showToast('👍 Expression tag saved!');
    }

    saveStudioState();
    closeExprEditModal();
    renderCharacterExpressionWardrobe(char.id);
    renderChatStream();
  }

  function addNewCustomEmotionToCurrentChar() {
    if (!currentCharWardrobeId) return;
    const char = characters.find(c => c.id === currentCharWardrobeId);
    if (!char) return;
    ensureCharacterExpressions(char);

    const input = document.getElementById('newCustomExprNameInput');
    const raw = (input.value || '').trim();
    if (!raw) {
      showToast('⚠️ Please enter an emotion name (e.g. Bruised, Dorayaki Bliss, Smirk)!');
      return;
    }

    const cleanKey = raw.toLowerCase().replace(/[^a-z0-9_-]/g, '_');
    if (!cleanKey) {
      showToast('⚠️ Invalid emotion name.');
      return;
    }

    if (char.expressions[cleanKey]) {
      showToast(`⚠️ Emotion '${cleanKey}' already exists for ${char.name}!`);
      return;
    }

    char.expressions[cleanKey] = makeComicAvatarDataUri(char.name, char.color || '#38bdf8', '✨');
    input.value = '';
    saveStudioState();
    renderCharacterExpressionWardrobe(currentCharWardrobeId);
    showToast(`✨ Added emotion '${cleanKey}'! Tap ✂️ CROP to upload your custom image.`);
  }

  function removeCustomEmotionFromCurrentChar(exprKey) {
    if (!currentCharWardrobeId) return;
    const char = characters.find(c => c.id === currentCharWardrobeId);
    if (!char || !char.expressions) return;

    delete char.expressions[exprKey];
    saveStudioState();
    renderCharacterExpressionWardrobe(currentCharWardrobeId);
    showToast(`🗑️ Removed emotion '${exprKey}'.`);
  }

  window.openCharExpressionModal = openCharExpressionModal;
  window.closeCharExpressionModal = closeCharExpressionModal;
  window.addNewCustomEmotionToCurrentChar = addNewCustomEmotionToCurrentChar;
  window.removeCustomEmotionFromCurrentChar = removeCustomEmotionFromCurrentChar;

  /* =====================================================================
     11. IN-APP MESSAGE EDITOR, QUOTE REPLY & REORDERING
     ===================================================================== */
  let editingMessageId = null;

  function openMessageEditModal(msgId) {
    if (isCinemaPlaying) return;
    const msg = messages.find(m => m.id === msgId);
    if (!msg) return;
    editingMessageId = msgId;

    const speakerGroup = document.getElementById('msgEditSpeakerGroup');
    const charSelect = document.getElementById('msgEditCharSelect');
    const exprSelect = document.getElementById('msgEditExprSelect');
    const textInput = document.getElementById('msgEditTextarea');

    charSelect.innerHTML = characters.map(c =>
      `<option value="${c.id}" ${c.id === msg.charId ? 'selected' : ''}>${escapeHtml(c.name)} (${c.side})</option>`
    ).join('');

    function updateMsgEditExprOptions(targetCharId, selectedExpr) {
      const char = characters.find(c => c.id === targetCharId);
      const standardList = [
        { key: 'normal', label: '🙂 Normal' },
        { key: 'cry', label: '😭 Cry' },
        { key: 'laugh', label: '😂 Laugh' },
        { key: 'angry', label: '😡 Angry' },
        { key: 'shock', label: '😱 Shock' },
        { key: 'love', label: '😍 Love' }
      ];
      if (char && char.expressions) {
        Object.keys(char.expressions).forEach(k => {
          if (!standardList.some(s => s.key === k)) {
            const display = k.charAt(0).toUpperCase() + k.slice(1).replace(/_/g, ' ');
            standardList.push({ key: k, label: `✨ ${display}` });
          }
        });
      }
      exprSelect.innerHTML = standardList.map(e =>
        `<option value="${e.key}" ${e.key === selectedExpr ? 'selected' : ''}>${e.label}</option>`
      ).join('');
    }

    charSelect.onchange = () => {
      updateMsgEditExprOptions(charSelect.value, exprSelect.value);
    };

    updateMsgEditExprOptions(msg.charId, msg.expr || 'normal');

    if (msg.type === 'divider' || msg.type === 'system' || msg.type === 'quest') {
      speakerGroup.style.display = 'none';
      textInput.value = msg.text || '';
    } else if (msg.type === 'sticker') {
      speakerGroup.style.display = 'flex';
      exprSelect.value = msg.expr || 'normal';
      textInput.value = (msg.stickerData && msg.stickerData.label) || '';
    } else {
      speakerGroup.style.display = 'flex';
      exprSelect.value = msg.expr || 'normal';
      textInput.value = msg.text || '';
    }

    const timeGroup = document.getElementById('msgEditTimeGroup');
    const timeInput = document.getElementById('msgEditTimeInput');
    if (timeGroup && timeInput) {
      if (msg.type === 'divider' || msg.type === 'system' || msg.type === 'quest') {
        timeGroup.style.display = 'none';
      } else {
        timeGroup.style.display = 'block';
        timeInput.value = msg.time || getNextStoryTime();
      }
    }

    document.getElementById('messageEditModal').classList.add('open');
  }

  function closeMessageEditModal() {
    document.getElementById('messageEditModal').classList.remove('open');
    editingMessageId = null;
  }

  function saveMessageEdit() {
    const msg = messages.find(m => m.id === editingMessageId);
    if (!msg) return;

    const newText = document.getElementById('msgEditTextarea').value.trim();
    if (msg.type === 'divider' || msg.type === 'system' || msg.type === 'quest') {
      if (newText) msg.text = newText;
    } else if (msg.type === 'sticker') {
      msg.charId = document.getElementById('msgEditCharSelect').value;
      msg.expr = document.getElementById('msgEditExprSelect').value;
      if (msg.stickerData) {
        msg.stickerData = { ...msg.stickerData, label: newText.toUpperCase() };
      }
    } else {
      msg.charId = document.getElementById('msgEditCharSelect').value;
      msg.expr = document.getElementById('msgEditExprSelect').value;
      if (newText) msg.text = newText;
    }

    saveStudioState();
    renderChatStream();
    closeMessageEditModal();
    showToast('💾 Message updated!');
  }

  function deleteEditingMessage() {
    if (!editingMessageId) return;
    messages = messages.filter(m => m.id !== editingMessageId);
    saveStudioState();
    renderChatStream();
    closeMessageEditModal();
    showToast('🗑️ Line deleted');
  }

  function moveEditingMessage(direction) {
    const idx = messages.findIndex(m => m.id === editingMessageId);
    if (idx === -1) return;
    const targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= messages.length) return;
    const temp = messages[idx];
    messages[idx] = messages[targetIdx];
    messages[targetIdx] = temp;
    saveStudioState();
    renderChatStream();
    showToast(direction < 0 ? '⬆️ Moved Up' : '⬇️ Moved Down');
  }

  function insertLineAfterEditingMessage() {
    const idx = messages.findIndex(m => m.id === editingMessageId);
    if (idx === -1) return;
    const char = characters.find(c => c.id === currentCharId) || characters[0];
    const newMsg = {
      id: 'm_' + Date.now(),
      type: 'text',
      charId: char.id,
      text: 'New dialogue line...',
      expr: currentExpr,
      time: getNextStoryTime()
    };
    messages.splice(idx + 1, 0, newMsg);
    saveStudioState();
    renderChatStream();
    closeMessageEditModal();
    openMessageEditModal(newMsg.id);
  }

  function replyToEditingMessage() {
    const msg = messages.find(m => m.id === editingMessageId);
    if (!msg) return;
    activeReplyMsgId = msg.id;
    const char = characters.find(c => c.id === msg.charId);
    document.getElementById('replyBarAuthor').textContent = char ? char.name : 'System';
    const snippet = msg.type === 'sticker'
      ? `[Sticker: ${(msg.stickerData && msg.stickerData.label) || 'Sticker'}]`
      : (msg.text || '');
    document.getElementById('replyBarSnippet').textContent = snippet;
    document.getElementById('composerReplyBar').classList.add('open');
    closeMessageEditModal();
    document.getElementById('chatMessageInput').focus();
  }

  function clearActiveReply() {
    activeReplyMsgId = null;
    document.getElementById('composerReplyBar').classList.remove('open');
  }

  /* =====================================================================
     12. SMART CINEMA AUTO-PLAYBACK ENGINE & IN-BUILT SCREEN RECORDER
     ===================================================================== */
  let cinemaAutoHideTimeout = null;
  let turboHoldTimer = null;
  let isTurboActive = false;
  let preTurboSpeed = 1.0;
  let mediaRecorder = null;
  let recordedChunks = [];
  let isBuiltinRecording = false;
  let recordingTimerInterval = null;
  let recordingSeconds = 0;

  function resetCinemaAutoHideTimer() {
    const dock = document.getElementById('cinemaDock');
    if (!dock || !isCinemaPlaying) return;
    dock.classList.remove('auto-faded');
    if (cinemaAutoHideTimeout) clearTimeout(cinemaAutoHideTimeout);
    
    // Don't auto-fade if paused or speed popover is open
    const popover = document.getElementById('cinemaSpeedPopover');
    if (isCinemaPaused || (popover && popover.classList.contains('open'))) return;
    
    cinemaAutoHideTimeout = setTimeout(() => {
      if (isCinemaPlaying && !isCinemaPaused && (!popover || !popover.classList.contains('open'))) {
        dock.classList.add('auto-faded');
      }
    }, 2800);
  }

  function startCinemaPlayback() {
    if (messages.length === 0) {
      showToast('⚠️ Add some messages first before playing!');
      return;
    }
    if (cinemaStepTimeout) {
      clearTimeout(cinemaStepTimeout);
      cinemaStepTimeout = null;
    }
    flushPendingLiveMessage();
    clearTypingTimers();
    resetCinemaCamera();
    hideSpeedPopover();
    hideAppSwitchTransition();
    closeCastPickerPopover();
    isCinemaPlaying = true;
    isCinemaPaused = false;

    document.getElementById('directorDeck').classList.add('hidden');
    const initialWaBar = document.getElementById('waInputBar');
    if (initialWaBar) initialWaBar.style.display = 'flex';
    document.getElementById('composerReplyBar').classList.remove('open');
    document.getElementById('stickerDrawer').classList.remove('open');

    const composerInput = document.getElementById('chatMessageInput');
    if (composerInput) {
      userComposerDraftBackup = composerInput.value || '';
      composerInput.value = '';
      autoResizeComposerInput(composerInput);
    }
    
    const dock = document.getElementById('cinemaDock');
    if (dock) {
      dock.classList.add('active');
      dock.classList.remove('auto-faded');
    }

    const pauseBtn = document.getElementById('cinemaPauseBtn');
    if (pauseBtn) {
      const icon = pauseBtn.querySelector('.btn-icon');
      const text = pauseBtn.querySelector('.btn-text');
      if (icon) icon.textContent = '⏸️';
      if (text) text.textContent = 'Pause';
      pauseBtn.title = 'Pause Playback';
    }

    const restartBtn = document.getElementById('cinemaRestartBtn');
    if (restartBtn) restartBtn.classList.remove('pulse-glow');

    updateCinemaSpeedUI();
    resetCinemaAutoHideTimer();

    const fullQueue = [...messages];
    const stream = document.getElementById('chatStream');
    stream.innerHTML = ''; // Start clean for scene recording

    // Multi-App Scene Isolation: Keep each app's conversation separated
    let currentCinemaApp = activeAppMode || 'whatsapp';
    const appSceneStreams = {
      whatsapp: [],
      chatgpt: [],
      gemini: []
    };

    let stepIndex = 0;

    function playNextStep() {
      if (!isCinemaPlaying) return;
      if (isCinemaPaused) {
        cinemaStepTimeout = setTimeout(playNextStep, 200);
        return;
      }

      if (stepIndex >= fullQueue.length) {
        resetCinemaCamera();
        const statusText = document.getElementById('cinemaStatusText');
        if (statusText) statusText.textContent = '✅ Finished';
        
        // Restore dock visibility so user can restart or exit
        if (dock) dock.classList.remove('auto-faded');
        
        // Highlight restart button with pulsing glow
        const rBtn = document.getElementById('cinemaRestartBtn');
        if (rBtn) {
          rBtn.classList.add('pulse-glow');
        }

        const composer = document.getElementById('chatMessageInput');
        if (composer) {
          composer.classList.remove('simulated-typing-active');
          if (userComposerDraftBackup !== undefined && userComposerDraftBackup !== '') {
            composer.value = userComposerDraftBackup;
            userComposerDraftBackup = '';
          } else {
            composer.value = '';
          }
          autoResizeComposerInput(composer);
        }

        if (isBuiltinRecording) {
          setTimeout(() => {
            if (isBuiltinRecording) stopBuiltinRecording();
          }, 1200);
        }
        return;
      }

      const nextMsg = fullQueue[stepIndex];
      const statusText = document.getElementById('cinemaStatusText');
      if (statusText) statusText.textContent = `Line ${stepIndex + 1}/${fullQueue.length}`;

      // Dynamic Camera
      if (nextMsg.type === 'quest') {
        setCinemaCamera('cam-zoom-climax', 3200);
      } else if (nextMsg.expr === 'angry' || nextMsg.expr === 'shock' || nextMsg.expr === 'cry' || nextMsg.type === 'sfx') {
        const char = characters.find(c => c.id === nextMsg.charId) || characters[0];
        const effectiveSide = getEffectiveSideForMessage(char, activeAppMode);
        const sideClass = (effectiveSide === 'left') ? 'cam-zoom-left' : 'cam-zoom-right';
        setCinemaCamera(sideClass, 2800);
      } else if (nextMsg.type === 'text' || nextMsg.type === 'sticker') {
        const char = characters.find(c => c.id === nextMsg.charId) || characters[0];
        const effectiveSide = getEffectiveSideForMessage(char, activeAppMode);
        const prevMsg = stepIndex > 0 ? fullQueue[stepIndex - 1] : null;
        const prevChar = prevMsg ? (characters.find(c => c.id === prevMsg.charId) || null) : null;
        const prevEffectiveSide = prevChar ? getEffectiveSideForMessage(prevChar, activeAppMode) : null;
        if (!prevChar || prevEffectiveSide !== effectiveSide) {
          const sideClass = (effectiveSide === 'left') ? 'cam-zoom-left' : 'cam-zoom-right';
          setCinemaCamera(sideClass, 3200);
        }
      } else {
        setCinemaCamera('cam-normal');
      }

      // App Switch Scene Transition (WhatsApp <-> ChatGPT <-> Gemini)
      if (nextMsg.type === 'app_switch') {
        const targetApp = nextMsg.targetApp || 'whatsapp';
        const appInfo = {
          whatsapp: { title: 'WhatsApp', icon: '📱', sub: 'Switching to WhatsApp Group Chat...' },
          chatgpt: { title: 'ChatGPT', icon: '🤖', sub: 'Launching ChatGPT Assistant...' },
          gemini: { title: 'Google Gemini', icon: '✨', sub: 'Launching Google Gemini AI...' }
        }[targetApp] || { title: targetApp, icon: '🚀', sub: 'Switching App...' };

        if (statusText) statusText.textContent = `🚀 ${appInfo.title}`;

        // 1. Sleek audio whoosh chime
        playAppSwitchSound();

        // 2. Realistic Mobile OS App-Switcher transition animation
        showAppSwitchTransition(targetApp, appInfo);

        // 3. Save current active stream children
        appSceneStreams[currentCinemaApp] = Array.from(stream.children);

        // Calculate transition hold time: respect explicit preDelayMs (e.g. from /delay 3sec), delayMs, or minimum 1200ms
        const configuredHoldMs = nextMsg.preDelayMs || nextMsg.delayMs || 1500;
        const transitionHold = Math.max(1200, configuredHoldMs) / cinemaSpeedMultiplier;

        setTimeout(() => {
          if (!isCinemaPlaying) return;

          // 4. Switch app mode shell & theme
          switchAppMode(targetApp, true);
          currentCinemaApp = targetApp;

          document.getElementById('directorDeck').classList.add('hidden');
          const switchWaBar = document.getElementById('waInputBar');
          if (switchWaBar) switchWaBar.style.display = 'flex';
          if (dock) dock.classList.add('active');

          // 5. SEPARATE CHAT STREAM PER APP:
          // Clear current screen so previous app's messages NEVER leak into this app!
          stream.innerHTML = '';

          if (targetApp === 'gemini') {
            const hero = document.getElementById('geminiHeroContainer');
            if (hero) stream.appendChild(hero);
          }

          // Restore only this app's conversation history
          if (appSceneStreams[targetApp] && appSceneStreams[targetApp].length > 0) {
            appSceneStreams[targetApp].forEach(node => {
              if (node.id !== 'geminiHeroContainer') {
                stream.appendChild(node);
              }
            });
          }

          stream.scrollTop = stream.scrollHeight;

          setTimeout(() => {
            hideAppSwitchTransition();
          }, 220);

          stepIndex++;
          cinemaStepTimeout = setTimeout(playNextStep, 800 / cinemaSpeedMultiplier);
        }, transitionHold);
        return;
      }

      if (nextMsg.type === 'pause') {
        const pauseMs = (nextMsg.delayMs || 1500) / cinemaSpeedMultiplier;
        if (statusText) statusText.textContent = `⏸️ ${((nextMsg.delayMs || 1500) / 1000).toFixed(1)}s`;
        stepIndex++;
        cinemaStepTimeout = setTimeout(playNextStep, pauseMs);
        return;
      }

      if (nextMsg.type === 'divider' || nextMsg.type === 'system' || nextMsg.type === 'quest') {
        const el = createMessageRowElement(nextMsg, stepIndex, fullQueue);
        stream.appendChild(el);
        if (appSceneStreams[currentCinemaApp]) appSceneStreams[currentCinemaApp].push(el);
        stream.scrollTo({ top: stream.scrollHeight, behavior: 'smooth' });
        if (soundEnabled) {
          if (nextMsg.type === 'quest') playSciFiChimeSound();
          else playPopSound();
        }
        stepIndex++;
        cinemaStepTimeout = setTimeout(playNextStep, (nextMsg.delayMs || (nextMsg.type === 'quest' ? 1400 : 1000)) / cinemaSpeedMultiplier);
        return;
      }

      if (nextMsg.type === 'sfx') {
        const el = createMessageRowElement(nextMsg, stepIndex, fullQueue);
        stream.appendChild(el);
        if (appSceneStreams[currentCinemaApp]) appSceneStreams[currentCinemaApp].push(el);
        stream.scrollTo({ top: stream.scrollHeight, behavior: 'smooth' });
        const char = characters.find(c => c.id === nextMsg.charId) || characters[0];
        if (soundEnabled) {
          triggerSfxByName(nextMsg.sfx || 'punch', char.pitch || 1.05);
        }
        const bubbleEl = el.querySelector('.speech-bubble') || el.querySelector('.sfx-burst-bubble');
        if (bubbleEl) {
          bubbleEl.classList.remove('in-box-shock');
          void bubbleEl.offsetWidth;
          bubbleEl.classList.add('in-box-shock');
        }
        stepIndex++;
        cinemaStepTimeout = setTimeout(playNextStep, (nextMsg.delayMs || 420) / cinemaSpeedMultiplier);
        return;
      }

      // 5. Multimedia Story Events (Sticker, Image, Video, Audio)
      if (nextMsg.type === 'sticker' || nextMsg.type === 'image' || nextMsg.type === 'video' || nextMsg.type === 'audio') {
        const char = characters.find(c => c.id === nextMsg.charId) || characters[0];
        const effectiveSide = getEffectiveSideForMessage(char, activeAppMode);
        
        // Instant Playback mode (Skip delays)
        if (cinemaPlaybackMode === 'instant' || cinemaSpeedMultiplier >= 8.0) {
          clearTypingTimers();
          const el = createMessageRowElement(nextMsg, stepIndex, fullQueue);
          stream.appendChild(el);
          if (appSceneStreams[currentCinemaApp]) appSceneStreams[currentCinemaApp].push(el);
          stream.scrollTo({ top: stream.scrollHeight, behavior: 'smooth' });
          if (soundEnabled) playPopSound(char.pitch || 1.05);
          stepIndex++;
          cinemaStepTimeout = setTimeout(playNextStep, 60);
          return;
        }

        const mediaPreDelay = (nextMsg.preDelayMs || 0) / cinemaSpeedMultiplier;
        const sendDuration = (mediaPreDelay > 0 ? mediaPreDelay : (550 / cinemaSpeedMultiplier));

        const statusEl = document.getElementById('headerGroupStatus');
        if (effectiveSide === 'left') {
          if (statusEl && activeAppMode === 'whatsapp') {
            statusEl.textContent = `${char.name} is typing...`;
            statusEl.classList.add('typing-pulse-status');
          }
          const typingRow = document.createElement('div');
          typingRow.className = `typing-indicator-row ${effectiveSide}`;
          const avatarSrc = getCharacterAvatarForExpr(char, nextMsg.expr);
          typingRow.innerHTML = `
            <img src="${avatarSrc}" style="width:32px; height:32px; border-radius:50%; border:2px solid #0f172a; object-fit:cover;">
            <div class="typing-bubble">
              <div class="typing-dot"></div>
              <div class="typing-dot"></div>
              <div class="typing-dot"></div>
            </div>
            <span class="typing-text-label">${escapeHtml(char.name)} is sharing media...</span>
          `;
          stream.appendChild(typingRow);
          stream.scrollTop = stream.scrollHeight;
        }

        activePreDelayTimer = setTimeout(() => {
          clearTypingTimers();
          if (!isCinemaPlaying) return;
          if (isCinemaPaused) {
            cinemaStepTimeout = setTimeout(playNextStep, 200);
            return;
          }
          if (statusEl && activeAppMode === 'whatsapp') {
            statusEl.classList.remove('typing-pulse-status');
            const autoStatus = characters.map(c => c.name).join(', ');
            statusEl.textContent = groupProfile.status.trim() || autoStatus;
          }
          const el = createMessageRowElement(nextMsg, stepIndex, fullQueue);
          stream.appendChild(el);
          if (appSceneStreams[currentCinemaApp]) appSceneStreams[currentCinemaApp].push(el);
          stream.scrollTo({ top: stream.scrollHeight, behavior: 'smooth' });
          if (soundEnabled) playPopSound(char.pitch || 1.05);

          const bubbleEl = el.querySelector('.sticker-card') || el.querySelector('.speech-bubble');
          triggerExpressionEffects(nextMsg.expr || 'normal', char.pitch || 1.05, bubbleEl);

          stepIndex++;
          cinemaStepTimeout = setTimeout(playNextStep, (nextMsg.delayMs || 700) / cinemaSpeedMultiplier);
        }, sendDuration);
        return;
      }

      const char = characters.find(c => c.id === nextMsg.charId) || characters[0];
      const effectiveSide = getEffectiveSideForMessage(char, activeAppMode);
      const isPovSide = (effectiveSide === 'right');
      const timing = calculateAdaptiveTypingTiming(nextMsg.text || '', cinemaSpeedMultiplier, isPovSide);

      // Instant Playback mode (Skip typing delays entirely)
      if (cinemaPlaybackMode === 'instant' || cinemaSpeedMultiplier >= 8.0) {
        clearTypingTimers();
        const el = createMessageRowElement(nextMsg, stepIndex, fullQueue);
        stream.appendChild(el);
        if (appSceneStreams[currentCinemaApp]) appSceneStreams[currentCinemaApp].push(el);
        stream.scrollTo({ top: stream.scrollHeight, behavior: 'smooth' });
        if (soundEnabled) playPopSound(char.pitch || 1.05);
        stepIndex++;
        cinemaStepTimeout = setTimeout(playNextStep, 60);
        return;
      }

      // Explicit Fast / Burst override (only if explicitly tagged as fast/burst!)
      const isExplicitFast = Boolean(nextMsg.fast || (nextMsg.delayMs && nextMsg.delayMs <= 200 && !nextMsg.preDelayMs));
      if (isExplicitFast) {
        const el = createMessageRowElement(nextMsg, stepIndex, fullQueue);
        stream.appendChild(el);
        if (appSceneStreams[currentCinemaApp]) appSceneStreams[currentCinemaApp].push(el);
        stream.scrollTo({ top: stream.scrollHeight, behavior: 'smooth' });
        if (soundEnabled) playPopSound(char.pitch || 1.05);
        const bubbleEl = el.querySelector('.speech-bubble') || el.querySelector('.sticker-card');
        triggerExpressionEffects(nextMsg.expr || 'normal', char.pitch || 1.05, bubbleEl);
        stepIndex++;
        cinemaStepTimeout = setTimeout(playNextStep, (nextMsg.delayMs || 250) / cinemaSpeedMultiplier);
        return;
      }

      // Author-configured delay (via /delay 3sec or custom timing)
      const configuredPreDelay = (nextMsg.preDelayMs || 0) / cinemaSpeedMultiplier;

      // ==========================================
      // BEHAVIOR A: INCOMING CHARACTER (LEFT SIDE)
      // ==========================================
      if (!isPovSide) {
        const isGpt = (activeAppMode === 'chatgpt');
        const isGemini = (activeAppMode === 'gemini');
        const statusEl = document.getElementById('headerGroupStatus');

        function startIncomingTypingIndicator(durationMs) {
          if (!isCinemaPlaying) return;
          if (statusEl && !isGpt && !isGemini) {
            statusEl.textContent = `${char.name} is typing...`;
            statusEl.classList.add('typing-pulse-status');
          }

          const typingRow = document.createElement('div');
          typingRow.className = `typing-indicator-row ${effectiveSide}`;
          const avatarSrc = getCharacterAvatarForExpr(char, nextMsg.expr);

          if (isGpt) {
            typingRow.innerHTML = `
              <img src="${avatarSrc}" style="width:28px; height:28px; border-radius:50%; object-fit:cover;">
              <div class="typing-bubble">
                <span class="gpt-thinking-dot"></span>
                <span class="gpt-thinking-label">${escapeHtml(char.name || 'ChatGPT')} is thinking...</span>
              </div>
            `;
          } else if (isGemini) {
            typingRow.innerHTML = `
              <img src="${avatarSrc}" style="width:28px; height:28px; border-radius:50%; object-fit:cover;">
              <div class="typing-bubble">
                <span class="gemini-sparkle-dot">✦</span>
                <span class="gemini-thinking-label">${escapeHtml(char.name || 'Gemini')} is thinking...</span>
              </div>
            `;
          } else {
            typingRow.innerHTML = `
              <img src="${avatarSrc}" style="width:32px; height:32px; border-radius:50%; border:2px solid #0f172a; object-fit:cover;">
              <div class="typing-bubble">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
              </div>
              <span class="typing-text-label">${escapeHtml(char.name)} is typing...</span>
            `;
          }
          stream.appendChild(typingRow);
          stream.scrollTop = stream.scrollHeight;

          if (soundEnabled) {
            activeTypingTickTimer = setInterval(() => {
              playTypingTickSound(char.pitch || 1.05);
            }, 140);
          }

          // Prior outgoing messages on right flip to double blue checkmarks (read)
          if (!isGpt && !isGemini) {
            document.querySelectorAll('.msg-row.right .read-ticks').forEach(t => {
              t.textContent = '✓✓';
              t.style.color = '#0284c7';
            });
          }

          activeTypingTimer = setTimeout(() => {
            clearTypingTimers();
            if (!isCinemaPlaying) return;
            if (isCinemaPaused) {
              cinemaStepTimeout = setTimeout(playNextStep, 200);
              return;
            }

            if (statusEl && !isGpt && !isGemini) {
              statusEl.classList.remove('typing-pulse-status');
              const autoStatus = characters.map(c => c.name).join(', ');
              statusEl.textContent = groupProfile.status.trim() || autoStatus;
            }

            const el = createMessageRowElement(nextMsg, stepIndex, fullQueue);
            stream.appendChild(el);
            if (appSceneStreams[currentCinemaApp]) appSceneStreams[currentCinemaApp].push(el);
            stream.scrollTo({ top: stream.scrollHeight, behavior: 'smooth' });

            if (soundEnabled) playPopSound(char.pitch || 1.05);

            const bubbleEl = el.querySelector('.speech-bubble') || el.querySelector('.sticker-card');
            triggerExpressionEffects(nextMsg.expr || 'normal', char.pitch || 1.05, bubbleEl);

            stepIndex++;
            const readingPause = nextMsg.delayMs ? (nextMsg.delayMs / cinemaSpeedMultiplier) : timing.readingPause;
            cinemaStepTimeout = setTimeout(playNextStep, readingPause);
          }, durationMs);
        }

        if (configuredPreDelay > 0) {
          // Explicit /delay (e.g. 3sec): typing indicator remains active throughout that full interval
          startIncomingTypingIndicator(configuredPreDelay);
        } else {
          // Natural human thinking pause before typing starts
          activePreDelayTimer = setTimeout(() => {
            if (!isCinemaPlaying) return;
            startIncomingTypingIndicator(timing.typingDuration);
          }, timing.thinkPause);
        }

      // ==========================================
      // BEHAVIOR B: POV CHARACTER (RIGHT SIDE)
      // ==========================================
      } else {
        // Step 1: Pre-typing wait
        const povWait = configuredPreDelay > 0 ? configuredPreDelay : timing.thinkPause;

        activePreDelayTimer = setTimeout(() => {
          if (!isCinemaPlaying) return;
          if (isCinemaPaused) {
            cinemaStepTimeout = setTimeout(playNextStep, 200);
            return;
          }

          // Step 2: Gradually type the message into bottom composer letter by letter
          const composerInput = document.getElementById('chatMessageInput');
          const sendBtn = document.querySelector('.wa-send-btn');
          const fullText = nextMsg.text || '';

          if (composerInput) {
            composerInput.value = '';
            autoResizeComposerInput(composerInput);
            composerInput.classList.add('simulated-typing-active');
            composerInput.focus();
          }

          let charIdx = 0;

          function typeNextChar() {
            if (!isCinemaPlaying) return;
            if (isCinemaPaused) {
              activePovComposerTimer = setTimeout(typeNextChar, 180);
              return;
            }

            charIdx++;
            if (composerInput) {
              composerInput.value = fullText.slice(0, charIdx);
              autoResizeComposerInput(composerInput);
              composerInput.scrollTop = composerInput.scrollHeight;
              composerInput.scrollLeft = composerInput.scrollWidth;
              try {
                composerInput.setSelectionRange(charIdx, charIdx);
              } catch (_) {}
            }

            if (soundEnabled && charIdx % 2 === 0) {
              playTypingTickSound(char.pitch || 1.05);
            }

            if (charIdx < fullText.length) {
              // Dynamic speed scaling: evaluate multiplier on every character
              const currentMultiplier = Math.max(0.2, cinemaSpeedMultiplier || 1.0);
              const dynamicCharDelay = Math.max(14, timing.baseCharDelay / currentMultiplier);
              activePovComposerTimer = setTimeout(typeNextChar, dynamicCharDelay);
            } else {
              // Simulated typing complete! Brief sending pause
              if (composerInput) {
                composerInput.classList.remove('simulated-typing-active');
              }
              const sendPause = Math.max(100, 200 / cinemaSpeedMultiplier);

              activePovComposerTimer = setTimeout(() => {
                if (!isCinemaPlaying) return;
                if (isCinemaPaused) {
                  activePovComposerTimer = setTimeout(playNextStep, 180);
                  return;
                }

                // Clear composer & reset auto-expand height
                if (composerInput) {
                  composerInput.value = '';
                  autoResizeComposerInput(composerInput);
                }
                if (sendBtn) {
                  sendBtn.classList.add('btn-press-anim');
                  setTimeout(() => sendBtn.classList.remove('btn-press-anim'), 160);
                }

                // Append outgoing message
                const el = createMessageRowElement(nextMsg, stepIndex, fullQueue);
                const tickEl = el.querySelector('.read-ticks');
                if (tickEl) {
                  tickEl.textContent = '✓';
                  tickEl.style.color = '#94a3b8';
                  setTimeout(() => {
                    if (tickEl && tickEl.textContent === '✓') {
                      tickEl.textContent = '✓✓';
                    }
                  }, 350 / cinemaSpeedMultiplier);
                }

                stream.appendChild(el);
                if (appSceneStreams[currentCinemaApp]) appSceneStreams[currentCinemaApp].push(el);
                stream.scrollTo({ top: stream.scrollHeight, behavior: 'smooth' });

                if (soundEnabled) playPopSound(char.pitch || 1.05);

                const bubbleEl = el.querySelector('.speech-bubble') || el.querySelector('.sticker-card');
                triggerExpressionEffects(nextMsg.expr || 'normal', char.pitch || 1.05, bubbleEl);

                stepIndex++;
                const readingPause = nextMsg.delayMs ? (nextMsg.delayMs / cinemaSpeedMultiplier) : timing.readingPause;
                cinemaStepTimeout = setTimeout(playNextStep, readingPause);
              }, sendPause);
            }
          }

          typeNextChar();
        }, povWait);
      }
    }

    playNextStep();
  }

  function restartCinemaPlayback() {
    if (!messages || messages.length === 0) {
      showToast('⚠️ No messages in this episode to play!');
      return;
    }
    if (cinemaStepTimeout) clearTimeout(cinemaStepTimeout);
    if (cinemaAutoHideTimeout) clearTimeout(cinemaAutoHideTimeout);
    clearTypingTimers();
    resetCinemaCamera();
    hideSpeedPopover();
    hideAppSwitchTransition();
    
    const rBtn = document.getElementById('cinemaRestartBtn');
    if (rBtn) rBtn.classList.remove('pulse-glow');

    startCinemaPlayback();
    showToast('⏮️ Auto-Play restarted from Line 1');
  }

  const replayCinemaStory = restartCinemaPlayback;

  function toggleCinemaPause() {
    isCinemaPaused = !isCinemaPaused;
    if (isCinemaPaused) {
      clearTypingTimers();
    }
    const pauseBtn = document.getElementById('cinemaPauseBtn');
    if (pauseBtn) {
      const icon = pauseBtn.querySelector('.btn-icon');
      const text = pauseBtn.querySelector('.btn-text');
      if (icon) icon.textContent = isCinemaPaused ? '▶️' : '⏸️';
      if (text) text.textContent = isCinemaPaused ? 'Resume' : 'Pause';
      pauseBtn.title = isCinemaPaused ? 'Resume Playback' : 'Pause Playback';
    }
    const statusText = document.getElementById('cinemaStatusText');
    if (statusText) statusText.textContent = isCinemaPaused ? '⏸️ Paused' : '🎥 Playing';
    resetCinemaAutoHideTimer();
  }

  function updateCinemaSpeedUI() {
    const isInstant = (cinemaPlaybackMode === 'instant' || cinemaSpeedMultiplier >= 8.0);
    const speedStr = isInstant ? 'Instant' : `${cinemaSpeedMultiplier.toFixed(1).replace(/\.0$/, '')}x`;
    const speedTextEl = document.getElementById('cinemaSpeedText');
    if (speedTextEl) speedTextEl.textContent = speedStr;

    const btn = document.getElementById('cinemaSpeedBtn');
    if (btn) btn.title = `Playback Speed: ${speedStr} (Tap to change)`;

    // Update active state in named choice buttons
    const slowBtn = document.getElementById('speedChoiceSlow');
    if (slowBtn) slowBtn.classList.toggle('active', !isInstant && Math.abs(cinemaSpeedMultiplier - 0.6) < 0.1);

    const normBtn = document.getElementById('speedChoiceNormal');
    if (normBtn) normBtn.classList.toggle('active', !isInstant && Math.abs(cinemaSpeedMultiplier - 1.0) < 0.1);

    const fastBtn = document.getElementById('speedChoiceFast');
    if (fastBtn) fastBtn.classList.toggle('active', !isInstant && Math.abs(cinemaSpeedMultiplier - 1.6) < 0.15);

    const vFastBtn = document.getElementById('speedChoiceVeryFast');
    if (vFastBtn) vFastBtn.classList.toggle('active', !isInstant && Math.abs(cinemaSpeedMultiplier - 2.5) < 0.2);

    const instantBtn = document.getElementById('speedChoiceInstant');
    if (instantBtn) instantBtn.classList.toggle('active', isInstant);

    // Update active state in popover pill buttons
    document.querySelectorAll('.speed-pill-btn').forEach(pill => {
      if (['speedChoiceSlow', 'speedChoiceNormal', 'speedChoiceFast', 'speedChoiceVeryFast', 'speedChoiceInstant'].includes(pill.id)) return;
      const text = pill.textContent.trim().toLowerCase();
      if (isInstant && text.includes('instant')) {
        pill.classList.add('active');
      } else if (!isInstant && !text.includes('instant')) {
        const pillVal = parseFloat(text);
        if (!isNaN(pillVal) && Math.abs(pillVal - cinemaSpeedMultiplier) < 0.08) {
          pill.classList.add('active');
        } else {
          pill.classList.remove('active');
        }
      } else {
        pill.classList.remove('active');
      }
    });

    const quickSlider = document.getElementById('cinemaQuickSpeedSlider');
    if (quickSlider && !isInstant) quickSlider.value = cinemaSpeedMultiplier;

    const speedLbl = document.getElementById('speedValLabel');
    if (speedLbl) speedLbl.textContent = isInstant ? 'Instant' : `${cinemaSpeedMultiplier.toFixed(2)}x`;
    const speedSlider = document.getElementById('cinemaSpeedSlider');
    if (speedSlider && !isInstant) speedSlider.value = cinemaSpeedMultiplier;
    const spamLbl = document.getElementById('spamDelayValLabel');
    if (spamLbl) spamLbl.textContent = `${cinemaSpamDelayMs} ms`;
    const spamSlider = document.getElementById('cinemaSpamDelaySlider');
    if (spamSlider) spamSlider.value = cinemaSpamDelayMs;
    updateCinemaCamBtnUI();
  }

  function toggleCinemaSpeedPopover(e) {
    if (e) e.stopPropagation();
    const popover = document.getElementById('cinemaSpeedPopover');
    if (!popover) return;
    const isOpen = popover.classList.toggle('open');
    if (isOpen) {
      updateCinemaSpeedUI();
      const dock = document.getElementById('cinemaDock');
      if (dock) dock.classList.remove('auto-faded');
    }
  }

  function hideSpeedPopover() {
    const popover = document.getElementById('cinemaSpeedPopover');
    if (popover) popover.classList.remove('open');
  }

  function cycleCinemaSpeed() {
    const speeds = [0.6, 1.0, 1.6, 2.5];
    const curr = parseFloat(cinemaSpeedMultiplier.toFixed(1));
    const nextIdx = (speeds.indexOf(curr) + 1) % speeds.length;
    setQuickCinemaSpeed(speeds[nextIdx]);
  }

  function setQuickCinemaSpeed(val) {
    if (val === 'instant') {
      cinemaPlaybackMode = 'instant';
      cinemaSpeedMultiplier = 10.0;
      showToast('⚡ Instant Playback Mode (Zero delay)');
    } else {
      cinemaPlaybackMode = 'natural';
      if (val === 'slow') cinemaSpeedMultiplier = 0.6;
      else if (val === 'normal') cinemaSpeedMultiplier = 1.0;
      else if (val === 'fast') cinemaSpeedMultiplier = 1.6;
      else if (val === 'very_fast') cinemaSpeedMultiplier = 2.5;
      else cinemaSpeedMultiplier = Math.max(0.4, Math.min(3.0, parseFloat(val) || 1.0));

      safeSetStorage('wh_cinema_speed', cinemaSpeedMultiplier.toString());
      showToast(`⚡ Playback Speed: ${cinemaSpeedMultiplier.toFixed(1)}x`);
    }
    updateCinemaSpeedUI();
  }

  function updateCinemaSpeedSlider(val) {
    cinemaPlaybackMode = 'natural';
    cinemaSpeedMultiplier = Math.max(0.4, Math.min(3.0, parseFloat(val)));
    safeSetStorage('wh_cinema_speed', cinemaSpeedMultiplier.toString());
    updateCinemaSpeedUI();
  }

  function updateCinemaSpamSlider(val) {
    cinemaSpamDelayMs = parseInt(val, 10);
    safeSetStorage('wh_cinema_spam_delay', cinemaSpamDelayMs.toString());
    updateCinemaSpeedUI();
  }

  function setQuickSpamDelay(val) {
    cinemaSpamDelayMs = parseInt(val, 10);
    safeSetStorage('wh_cinema_spam_delay', cinemaSpamDelayMs.toString());
    updateCinemaSpeedUI();
    showToast(`⏱️ Spam Pace: ${cinemaSpamDelayMs}ms`);
  }

  function openCinemaSpeedModal() {
    updateCinemaSpeedUI();
    document.getElementById('cinemaSpeedModal').classList.add('open');
  }

  function closeCinemaSpeedModal() {
    document.getElementById('cinemaSpeedModal').classList.remove('open');
  }

  function resetCinemaSpeedDefaults() {
    cinemaSpeedMultiplier = 1.0;
    cinemaSpamDelayMs = 280;
    safeSetStorage('wh_cinema_speed', '1.0');
    safeSetStorage('wh_cinema_spam_delay', '280');
    cinemaCameraEngineEnabled = true;
    safeSetStorage('wh_cinema_cam_engine', 'true');
    updateCinemaSpeedUI();
    showToast('⏱️ Speed & Camera settings reset to defaults');
  }

  /* =====================================================================
     IN-BUILT SCREEN & AUDIO RECORDER (PURE CHAT CAPTURE)
     ===================================================================== */
  async function toggleBuiltinRecording() {
    if (isBuiltinRecording) {
      stopBuiltinRecording();
    } else {
      await startBuiltinRecording();
    }
  }

  function updateCinemaRecordBtnUI() {
    const recBtn = document.getElementById('cinemaRecBtn');
    const recText = document.getElementById('cinemaRecBtnText');
    const recDot = document.getElementById('cinemaRecDot');
    if (!recBtn) return;

    if (isBuiltinRecording) {
      recBtn.classList.add('recording');
      if (recText) recText.textContent = 'Stop REC';
      recBtn.title = 'Stop In-Built Recording & Export Video';
      if (recDot) recDot.style.background = '#ef4444';
    } else {
      recBtn.classList.remove('recording');
      if (recText) recText.textContent = 'REC';
      recBtn.title = 'In-Built Screen & Audio Recorder (Pure Chat Video)';
      if (recDot) recDot.style.background = '#facc15';
    }
  }

  async function startBuiltinRecording() {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
        enableCleanMobileRecording();
        return;
      }

      // Request browser screen/tab stream
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: 'browser',
          frameRate: { ideal: 60, max: 60 }
        },
        audio: true
      });

      if (!stream) return;

      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.onended = () => {
          if (isBuiltinRecording) stopBuiltinRecording();
        };
      }

      const types = [
        'video/webm;codecs=vp9,opus',
        'video/webm;codecs=vp8,opus',
        'video/webm',
        'video/mp4'
      ];
      let supportedType = types.find(t => MediaRecorder.isTypeSupported(t)) || '';

      recordedChunks = [];
      try {
        mediaRecorder = new MediaRecorder(stream, supportedType ? { mimeType: supportedType } : undefined);
      } catch (e) {
        mediaRecorder = new MediaRecorder(stream);
      }

      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          recordedChunks.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        clearInterval(recordingTimerInterval);
        stream.getTracks().forEach(track => track.stop());
        exportRecordedVideo(supportedType);
      };

      mediaRecorder.start(250);
      isBuiltinRecording = true;
      recordingSeconds = 0;
      updateCinemaRecordBtnUI();

      // Automatically activate pure recording mode so no director docks appear in video
      const wrapper = document.getElementById('phoneWrapper');
      if (wrapper) wrapper.classList.add('pure-recording-mode');
      document.body.classList.add('studio-recording-active');

      recordingTimerInterval = setInterval(() => {
        recordingSeconds++;
        const mins = Math.floor(recordingSeconds / 60);
        const secs = recordingSeconds % 60;
        const timeStr = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        const recText = document.getElementById('cinemaRecBtnText');
        if (recText && isBuiltinRecording) {
          recText.textContent = `Stop (${timeStr})`;
        }
      }, 1000);

      // Start story from beginning for clean recording
      startCinemaPlayback();

      showToast('🔴 In-Built Recording Started! Director chrome hidden for pure video capture');
    } catch (err) {
      console.warn('Screen recording error or permission denied:', err);
      if (err.name !== 'AbortError' && err.name !== 'NotAllowedError') {
        enableCleanMobileRecording();
      }
    }
  }

  function stopBuiltinRecording() {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
    }
    isBuiltinRecording = false;
    clearInterval(recordingTimerInterval);
    updateCinemaRecordBtnUI();

    const wrapper = document.getElementById('phoneWrapper');
    if (wrapper) wrapper.classList.remove('pure-recording-mode');
    document.body.classList.remove('studio-recording-active');

    const dock = document.getElementById('cinemaDock');
    if (dock) dock.classList.remove('auto-faded');
  }

  function exportRecordedVideo(mimeType) {
    if (recordedChunks.length === 0) return;
    const blob = new Blob(recordedChunks, { type: mimeType || 'video/webm' });
    const isMp4 = mimeType && mimeType.includes('mp4');
    const ext = isMp4 ? 'mp4' : 'webm';
    const safeTitle = (currentStoryTitle || 'Story').replace(/[^a-zA-Z0-9_-]/g, '_');
    const filename = `ChatHub_${safeTitle}_${Date.now()}.${ext}`;

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 2000);

    showToast(`🎉 Recording Saved: ${filename}`);
  }

  function enableCleanMobileRecording() {
    cleanRecordMode = true;
    renderGroupHeader();
    const wrapper = document.getElementById('phoneWrapper');
    if (wrapper) {
      wrapper.classList.add('clean-record-mode');
      wrapper.classList.add('pure-recording-mode');
    }
    const dock = document.getElementById('cinemaDock');
    if (dock) dock.classList.add('auto-faded');

    showToast('📱 Pure Chat Active! Turn on Phone Screen Recorder. Tap top corner to restore studio.');

    if (!isCinemaPlaying) {
      startCinemaPlayback();
    }
  }

  function stopCinemaMode() {
    isCinemaPlaying = false;
    isCinemaPaused = false;
    if (cinemaStepTimeout) clearTimeout(cinemaStepTimeout);
    if (cinemaAutoHideTimeout) clearTimeout(cinemaAutoHideTimeout);
    clearTypingTimers();
    resetCinemaCamera();
    hideSpeedPopover();
    hideAppSwitchTransition();

    if (isBuiltinRecording) {
      stopBuiltinRecording();
    }

    const dock = document.getElementById('cinemaDock');
    if (dock) {
      dock.classList.remove('active');
      dock.classList.remove('auto-faded');
    }

    document.getElementById('directorDeck').classList.remove('hidden');
    const exitWaBar = document.getElementById('waInputBar');
    if (exitWaBar) exitWaBar.style.display = 'flex';

    // Safely restore user composer draft if one was active before playback
    const composer = document.getElementById('chatMessageInput');
    if (composer) {
      composer.classList.remove('simulated-typing-active');
      if (userComposerDraftBackup !== undefined && userComposerDraftBackup !== '') {
        composer.value = userComposerDraftBackup;
        userComposerDraftBackup = '';
      } else {
        composer.value = '';
      }
      autoResizeComposerInput(composer);
    }

    const wrapper = document.getElementById('phoneWrapper');
    if (wrapper) {
      wrapper.classList.remove('pure-recording-mode');
      wrapper.classList.remove('clean-record-mode');
    }

    const ghostTrigger = document.getElementById('cinemaGhostTrigger');
    if (ghostTrigger) ghostTrigger.style.display = 'none';

    renderChatStream();
  }

  function initTurboGestures() {
    const stream = document.getElementById('chatStream');
    if (!stream) return;

    function startTurbo() {
      if (!isCinemaPlaying || isCinemaPaused || isTurboActive) return;
      isTurboActive = true;
      preTurboSpeed = cinemaSpeedMultiplier;
      cinemaSpeedMultiplier = 2.5;
      updateCinemaSpeedUI();
      showTurboBadge(true);
    }

    function endTurbo() {
      if (!isTurboActive) return;
      isTurboActive = false;
      cinemaSpeedMultiplier = preTurboSpeed || 1.0;
      updateCinemaSpeedUI();
      showTurboBadge(false);
    }

    stream.addEventListener('pointerdown', (e) => {
      if (!isCinemaPlaying) return;
      if (e.target.closest('button, a, input, .dropdown-menu, .cinema-control-dock, .cinema-ghost-trigger')) return;
      turboHoldTimer = setTimeout(startTurbo, 350);
    });

    const cancelTurbo = () => {
      if (turboHoldTimer) clearTimeout(turboHoldTimer);
      endTurbo();
    };

    stream.addEventListener('pointerup', cancelTurbo);
    stream.addEventListener('pointercancel', cancelTurbo);
    stream.addEventListener('pointerleave', cancelTurbo);
  }

  function showTurboBadge(show) {
    let badge = document.getElementById('cinemaTurboBadge');
    if (!badge) {
      badge = document.createElement('div');
      badge.id = 'cinemaTurboBadge';
      badge.className = 'cinema-turbo-badge';
      badge.innerHTML = '<span>⚡ 2.5x TURBO FAST FORWARD</span>';
      const wrapper = document.getElementById('phoneWrapper');
      if (wrapper) wrapper.appendChild(badge);
    }
    badge.style.display = show ? 'flex' : 'none';
  }

  /* =====================================================================
     13. AI SCRIPT IMPORTER, STUDIO TOOLS & IN-APP MODALS
     ===================================================================== */
  function openScriptModal() {
    document.getElementById('scriptModal').classList.add('open');
  }

  function closeScriptModal() {
    document.getElementById('scriptModal').classList.remove('open');
  }

  /* =====================================================================
     STORIES MANAGER (SAVE / LOAD / NEW / EXPORT / IMPORT)
     ===================================================================== */
  function openStoriesModal() {
    const titleInput = document.getElementById('currentStoryTitleInput');
    if (titleInput) titleInput.value = currentStoryTitle;
    renderStoriesList();
    document.getElementById('storiesModal').classList.add('open');
  }

  function closeStoriesModal() {
    document.getElementById('storiesModal').classList.remove('open');
  }

  function saveCurrentStory(isSaveAsNew = false) {
    const titleInput = document.getElementById('currentStoryTitleInput');
    const title = ((titleInput && titleInput.value) || '').trim() || 'Untitled Episode';
    currentStoryTitle = title;
    safeSetStorage('wh_current_story_title', currentStoryTitle);

    // Sync active messages before saving
    syncCurrentAppMessagesToStorage();

    const storyId = (isSaveAsNew || !currentStoryId) ? ('story_' + Date.now()) : currentStoryId;
    currentStoryId = storyId;
    safeSetStorage('wh_current_story_id', currentStoryId);

    const storyData = {
      id: storyId,
      title: title,
      date: new Date().toLocaleDateString(),
      activeAppMode: activeAppMode,
      messageCount: Array.isArray(messages) ? messages.length : 0,
      groupProfile: JSON.parse(JSON.stringify(groupProfile)),
      characters: JSON.parse(JSON.stringify(characters)),
      messages: JSON.parse(JSON.stringify(messages || [])),
      storyScenes: JSON.parse(JSON.stringify(storyScenes || {})),
      gptThreads: (typeof storyScenes !== 'undefined' && storyScenes.chatgptThreads) ? JSON.parse(JSON.stringify(storyScenes.chatgptThreads)) : [],
      geminiThreads: (typeof storyScenes !== 'undefined' && storyScenes.geminiThreads) ? JSON.parse(JSON.stringify(storyScenes.geminiThreads)) : [],
      customStickers: JSON.parse(JSON.stringify(customStickers || []))
    };

    if (isSaveAsNew) {
      savedStories.unshift(storyData);
    } else {
      const existingIdx = savedStories.findIndex(s => s.id === storyId);
      if (existingIdx >= 0) {
        savedStories[existingIdx] = storyData;
      } else {
        savedStories.unshift(storyData);
      }
    }

    safeSetStorage(STORIES_LIB_KEY, JSON.stringify(savedStories));
    saveStudioState();
    renderStoriesList();
    showToast(isSaveAsNew ? `💾 Saved as new episode "${title}"!` : `💾 Story "${title}" updated!`);
  }

  function renderStoriesList() {
    const container = document.getElementById('storiesListContainer');
    if (!container) return;
    container.innerHTML = '';

    if (savedStories.length === 0) {
      container.innerHTML = `
        <div style="text-align:center; padding:24px 10px; color:#94a3b8; font-size:12px;">
          <p style="margin:0 0 6px 0;">No saved stories yet.</p>
          <p style="margin:0; font-size:11px;">Type a title above and click <b>💾 Save</b> to keep episodes in your library!</p>
        </div>
      `;
      return;
    }

    savedStories.forEach((story) => {
      const isCurrent = (story.id === currentStoryId) || (!currentStoryId && (story.title || '').toLowerCase() === currentStoryTitle.toLowerCase());
      const card = document.createElement('div');
      card.className = `story-item-card ${isCurrent ? 'current' : ''}`;
      const appIcon = { whatsapp: '💬 WA', chatgpt: '🤖 GPT', gemini: '✨ Gemini' }[story.activeAppMode] || '💬 WA';
      card.innerHTML = `
        <div style="flex:1; overflow:hidden;">
          <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
            <strong style="font-size:12.5px; color:#f8fafc; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:200px;">${escapeHtml(story.title || 'Untitled')}</strong>
            ${isCurrent ? '<span style="background:#00a884; color:#fff; font-size:9.5px; font-weight:800; padding:1px 6px; border-radius:10px;">ACTIVE</span>' : ''}
          </div>
          <p style="font-size:11px; color:#94a3b8; margin:2px 0 0 0;">${story.messageCount || (story.messages ? story.messages.length : 0)} lines • ${appIcon} • ${story.date || 'Saved'}</p>
        </div>
        <div style="display:flex; gap:4px; flex-shrink:0; align-items:center;">
          <button class="icon-btn" style="background:#3b82f6; color:#fff; font-size:11px; padding:4px 8px;" onclick="loadStoryById('${story.id}')" title="Load this story">📂 Load</button>
          <button class="icon-btn" style="background:#475569; color:#fff; font-size:11px; padding:4px 7px;" onclick="renameStoryById('${story.id}')" title="Rename story title">✏️</button>
          <button class="icon-btn" style="background:#0284c7; color:#fff; font-size:11px; padding:4px 7px;" onclick="duplicateStoryById('${story.id}')" title="Duplicate story copy">📑</button>
          <button class="icon-btn" style="background:#334155; color:#cbd5e1; font-size:11px; padding:4px 7px;" onclick="exportStoryById('${story.id}')" title="Export as JSON">💾</button>
          <button class="icon-btn danger" style="background:#ef4444; color:#fff; font-size:11px; padding:4px 7px;" onclick="deleteStoryById('${story.id}')" title="Delete story">🗑️</button>
        </div>
      `;
      container.appendChild(card);
    });
  }

  function loadStoryById(storyId) {
    const story = savedStories.find(s => s.id === storyId);
    if (!story) return;

    currentStoryId = story.id;
    safeSetStorage('wh_current_story_id', currentStoryId);
    currentStoryTitle = story.title || 'Untitled Story';
    safeSetStorage('wh_current_story_title', currentStoryTitle);

    const titleInput = document.getElementById('currentStoryTitleInput');
    if (titleInput) titleInput.value = currentStoryTitle;

    if (Array.isArray(story.characters) && story.characters.length > 0) characters = story.characters;
    if (story.groupProfile) groupProfile = { ...groupProfile, ...story.groupProfile };
    if (Array.isArray(story.customStickers)) customStickers = story.customStickers;

    if (story.storyScenes) {
      storyScenes = story.storyScenes;
      if (Array.isArray(story.gptThreads)) storyScenes.chatgptThreads = story.gptThreads;
      if (Array.isArray(story.geminiThreads)) storyScenes.geminiThreads = story.geminiThreads;
    }

    const targetMode = story.activeAppMode || 'whatsapp';
    activeAppMode = targetMode;

    if (Array.isArray(story.messages)) {
      messages = story.messages;
    } else if (storyScenes && storyScenes[targetMode]) {
      messages = storyScenes[targetMode];
    } else {
      messages = [];
    }

    switchAppMode(activeAppMode, false);
    saveStudioState();
    renderGroupHeader();
    renderDirectorStrip();
    renderChatStream();
    renderDrawerContent();
    renderStoriesList();
    closeStoriesModal();
    showToast(`📂 Loaded "${story.title}"`);
  }

  function deleteStoryById(storyId) {
    const target = savedStories.find(s => s.id === storyId);
    if (!target) return;
    openCustomPromptModal({
      title: '🗑️ Delete Saved Story',
      desc: `Are you sure you want to permanently delete "${target.title}"?`,
      showInput: false,
      onConfirm: () => {
        savedStories = savedStories.filter(s => s.id !== storyId);
        if (currentStoryId === storyId) {
          currentStoryId = '';
          safeSetStorage('wh_current_story_id', '');
        }
        safeSetStorage(STORIES_LIB_KEY, JSON.stringify(savedStories));
        renderStoriesList();
        showToast('🗑️ Story deleted');
      }
    });
  }

  function renameStoryById(storyId) {
    const target = savedStories.find(s => s.id === storyId);
    if (!target) return;
    openCustomPromptModal({
      title: '✏️ Rename Story Title',
      desc: 'Enter new episode title:',
      defaultValue: target.title,
      showInput: true,
      onConfirm: (newTitle) => {
        if (!newTitle || !newTitle.trim()) return;
        const clean = newTitle.trim();
        target.title = clean;
        if (currentStoryId === storyId) {
          currentStoryTitle = clean;
          safeSetStorage('wh_current_story_title', currentStoryTitle);
          const titleInput = document.getElementById('currentStoryTitleInput');
          if (titleInput) titleInput.value = currentStoryTitle;
        }
        safeSetStorage(STORIES_LIB_KEY, JSON.stringify(savedStories));
        renderStoriesList();
        showToast(`✏️ Renamed story to "${clean}"`);
      }
    });
  }

  function duplicateStoryById(storyId) {
    const target = savedStories.find(s => s.id === storyId);
    if (!target) return;
    const clone = JSON.parse(JSON.stringify(target));
    clone.id = 'story_' + Date.now();
    clone.title = (target.title || 'Story') + ' (Copy)';
    clone.date = new Date().toLocaleDateString();
    savedStories.unshift(clone);
    safeSetStorage(STORIES_LIB_KEY, JSON.stringify(savedStories));
    renderStoriesList();
    showToast(`📑 Duplicated "${clone.title}"`);
  }

  function startNewBlankStory() {
    openCustomPromptModal({
      title: '➕ New Blank Story',
      desc: 'Enter Episode Title for your new story:',
      defaultValue: 'Episode ' + (savedStories.length + 1) + ': New Adventure',
      showInput: true,
      onConfirm: (title) => {
        if (!title) return;
        currentStoryTitle = title.trim();
        currentStoryId = 'story_' + Date.now();
        safeSetStorage('wh_current_story_id', currentStoryId);
        safeSetStorage('wh_current_story_title', currentStoryTitle);
        messages = [
          {
            id: 'm_init_' + Date.now(),
            type: 'divider',
            text: currentStoryTitle.toUpperCase()
          }
        ];
        saveStudioState();
        renderChatStream();
        renderStoriesList();
        closeStoriesModal();
        showToast(`✨ Started "${currentStoryTitle}"`);
      }
    });
  }

  function exportStoryById(storyId) {
    const story = savedStories.find(s => s.id === storyId) || {
      title: currentStoryTitle,
      groupProfile,
      characters,
      messages,
      customStickers
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(story, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    const safeName = (story.title || 'manhwa_story').toLowerCase().replace(/[^a-z0-9]/g, '_');
    a.download = `${safeName}.json`;
    a.click();
    showToast('💾 Story JSON exported!');
  }

  function importStoryFromFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        const title = data.title || (data.groupProfile && data.groupProfile.name) || 'Imported Story';
        const newStory = {
          id: 'story_imp_' + Date.now(),
          title: title,
          date: new Date().toLocaleDateString(),
          messageCount: Array.isArray(data.messages) ? data.messages.length : 0,
          groupProfile: data.groupProfile || groupProfile,
          characters: data.characters || characters,
          messages: data.messages || [],
          customStickers: data.customStickers || []
        };
        savedStories.unshift(newStory);
        safeSetStorage(STORIES_LIB_KEY, JSON.stringify(savedStories));
        loadStoryById(newStory.id);
        showToast(`📥 Imported and loaded "${title}"!`);
      } catch (err) {
        showToast('⚠️ Could not parse JSON file!');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  /* =====================================================================
     SCRIPT & AUTO-DIRECTOR STUDIO (DUAL-FORMAT ENGINE: SCRIPT + JSON + LIBRARY)
     ===================================================================== */
  let activeScriptStudioTab = 'text';

  // 5 Curated Built-In Anime/Manhwa Episodes
  const BUILTIN_STORY_PRESETS = [
    {
      id: 'preset_gian_revenge',
      title: "Episode 1: Gian's Revenge & Dorayaki Crisis",
      desc: "Gian cornered Nobita outside his house! A Solo Leveling Quest suddenly appears!",
      cast: ['Nobita', 'Doraemon', 'Gian'],
      script: `[SYSTEM: EPISODE 1: GIAN'S REVENGE]
[Nobita:cry]: Doraemon!! Help me! Gian is waiting outside my house with a baseball bat!
[Nobita:SFX]: 😭 WAAAHH!!
[Doraemon:angry]: Again?! What did you do to anger him this time?!
[Nobita]: I accidentally stepped on his prized baseball card...
[Gian:SFX]: 👊 POW!!
[Gian]: NOBITAAA! COME OUT HERE RIGHT NOW!
[QUEST: SURVIVAL QUEST: Evade Gian for 5 minutes without using any 4D gadgets!]
[Nobita:shock]: A System Quest appeared?! Since when do we have manhwa quests?!
[Doraemon:laugh]: Bwahaha! Looks like you have to face him like a man!
[Nobita:SFX]: 💨 NIGERUNDAYO!!`
    },
    {
      id: 'preset_solo_awakening',
      title: "Solo Leveling: Double Dungeon Awakening",
      desc: "Trapped in the temple of the God Statue! Player Jinwoo awakens his hunter system!",
      cast: ['Sung_Jinwoo', 'Hunter_Song', 'System'],
      script: `[SYSTEM: EPISODE: AWAKENING IN THE DOUBLE DUNGEON]
[Sung_Jinwoo:shock]: The statue's eyes... they're glowing red?!
[Hunter_Song:angry]: Everyone get down! Don't look into its eyes!
[Sung_Jinwoo:SFX]: ⚡ NANI?!
[Statue_God:SFX]: 💀 OMAE WA MOU...
[Sung_Jinwoo:cry]: My leg... I can't move! Is this how it ends?!
[QUEST: COURAGE OF THE WEAK: Complete the secret trial of the God Statue!]
[QUEST: REWARD: Player Awakening & System Administrator Access]
[Sung_Jinwoo:shock]: A holographic quest window in front of my eyes?!
[System]: Welcome, Player Sung Jinwoo. Will you accept the quest?
[Sung_Jinwoo:angry]: If I don't... I'll die anyway. I ACCEPT!
[Sung_Jinwoo:SFX]: 🔥 AWAKEN!!`
    },
    {
      id: 'preset_jjk_showdown',
      title: "Jujutsu Kaisen: Shinjuku Group Chat Showdown",
      desc: "Sukuna infiltrates the Tokyo Jujutsu squad chat. Gojo drops the ultimate catchphrase.",
      cast: ['Megumi', 'Sukuna', 'Gojo'],
      script: `[SYSTEM: EPISODE: SHINJUKU SHOWDOWN IN THE GROUP CHAT]
[Megumi:shock]: Gojo-sensei... Sukuna just joined the squad chat!
[Sukuna:laugh]: Bwahaha! What a pathetic gathering of insects.
[Sukuna:SFX]: 💀 OMAE WA MOU...
[Gojo:laugh]: Oh? Look who decided to crawl out of his fingers!
[Gojo]: You know you're just a challenger here, right?
[Sukuna:angry]: Insolent brat. I'll cleave you before you can blink!
[Sukuna:SFX]: 💥 BAM!!
[Gojo:love]: Nah, I'd win. 💅
[Gojo:SFX]: ⚡ HOLLOW PURPLE!!
[QUEST: SYSTEM ALERT: Special Grade Cursed Energy Surge Detected!]
[Megumi:cry]: Sensei please don't destroy Tokyo again...`
    },
    {
      id: 'preset_death_note_chip',
      title: "Death Note: Light's Dramatic Potato Chip",
      desc: "Light Yagami faces L's surveillance cameras while eating a potato chip with godlike drama.",
      cast: ['L', 'Light', 'Ryuk'],
      script: `[SYSTEM: EPISODE: LIGHT'S ULTIMATE DEDUCTION]
[L:shock]: The suspect must be someone within the police department...
[Light]: I'm just an innocent student studying for university entrance exams.
[Ryuk:laugh]: Hehehe... humans are so interesting.
[Ryuk:SFX]: 🤣 BWAHAHA!
[Light]: I'll take a potato chip...
[Light:angry]: AND EAT IT!!
[Light:SFX]: 💥 BAM!!
[QUEST: MIND GAME: Deduce L's real name before the 40-second timer expires!]
[L:shock]: His heart rate didn't change at all... Could he really not be Kira?!`
    },
    {
      id: 'preset_romcom_tsundere',
      title: "Anime Rom-Com: The Rooftop Tsundere Confession",
      desc: "Sakura is caught red-handed with her secret notebook on the school rooftop.",
      cast: ['Senpai', 'Sakura'],
      script: `[SYSTEM: EPISODE: AFTER-SCHOOL ROOFTOP CONFESSION]
[Senpai]: Hey Sakura, thanks for meeting me on the rooftop.
[Sakura:angry]: D-Don't get the wrong idea! I only came because it was on my way home!
[Sakura:SFX]: 😡 B-BAKA!!
[Senpai]: I found your notebook... the one with all the sketches of me.
[Sakura:shock]: WH-WHAT?! YOU SAW THAT?!
[Sakura:cry]: I'm so embarrassed I could die right now!!
[QUEST: ROM-COM MISSION: Confess your true feelings before the bell rings!]
[Senpai:love]: Actually... I really liked the drawings.
[Sakura:love]: I-It's not like I like you or anything... baka!`
    }
  ];

  function openScriptModal() {
    renderScriptLibrary();
    document.getElementById('scriptModal').classList.add('open');
  }

  function closeScriptModal() {
    document.getElementById('scriptModal').classList.remove('open');
  }

  function switchScriptStudioTab(tab) {
    activeScriptStudioTab = tab;
    const btnText = document.getElementById('tabBtnScriptText');
    const btnJson = document.getElementById('tabBtnScriptJson');
    const btnLib = document.getElementById('tabBtnScriptLibrary');
    const panelText = document.getElementById('scriptPanelText');
    const panelJson = document.getElementById('scriptPanelJson');
    const panelLib = document.getElementById('scriptPanelLibrary');

    if (btnText) btnText.classList.toggle('active', tab === 'text');
    if (btnJson) btnJson.classList.toggle('active', tab === 'json');
    if (btnLib) btnLib.classList.toggle('active', tab === 'library');

    if (panelText) panelText.classList.toggle('active', tab === 'text');
    if (panelJson) panelJson.classList.toggle('active', tab === 'json');
    if (panelLib) panelLib.classList.toggle('active', tab === 'library');

    if (tab === 'library') {
      renderScriptLibrary();
    }
  }

  function renderScriptLibrary() {
    const list = document.getElementById('scriptLibraryList');
    if (!list) return;
    list.innerHTML = '';

    // Load custom saved stories
    let customPresets = [];
    try {
      const raw = safeGetStorage('manhwa_script_library_custom');
      if (raw) customPresets = JSON.parse(raw);
    } catch (e) {
      customPresets = [];
    }

    const allPresets = [...customPresets, ...BUILTIN_STORY_PRESETS];

    allPresets.forEach((p, idx) => {
      const card = document.createElement('div');
      card.className = 'script-library-card';
      const castBadges = (p.cast || []).map(c => `<span class="script-lib-badge">👤 ${escapeHtml(c)}</span>`).join('');
      const isCustom = !p.id.startsWith('preset_');

      card.innerHTML = `
        <div style="flex:1; min-width:0;">
          <div style="display:flex; align-items:center; gap:6px;">
            <span class="script-lib-title">${escapeHtml(p.title)}</span>
            ${isCustom ? '<span style="font-size:9px; background:#00a884; color:#fff; padding:1px 5px; border-radius:4px; font-weight:800;">CUSTOM</span>' : '<span style="font-size:9px; background:#38bdf8; color:#0f172a; padding:1px 5px; border-radius:4px; font-weight:800;">OFFICIAL</span>'}
          </div>
          <div class="script-lib-desc">${escapeHtml(p.desc || '')}</div>
          <div class="script-lib-cast">${castBadges}</div>
        </div>
        <div style="display:flex; flex-direction:column; gap:4px; flex-shrink:0;">
          <button type="button" class="icon-btn" style="background:linear-gradient(135deg, #f43f5e 0%, #e11d48 100%); color:#fff; font-size:11px; padding:5px 10px;" onclick="loadAndAutoDirectStory(${idx})">▶ Auto-Direct & Play</button>
          <div style="display:flex; gap:4px;">
            <button type="button" class="icon-btn" style="background:#1e293b; font-size:10px; padding:3px 7px;" onclick="loadPresetIntoScriptEditor(${idx})">📝 Script</button>
            <button type="button" class="icon-btn" style="background:#1e293b; font-size:10px; padding:3px 7px;" onclick="loadPresetIntoJsonEditor(${idx})">📦 JSON</button>
          </div>
        </div>
      `;
      list.appendChild(card);
    });
  }

  function getLibraryPresetByIndex(idx) {
    let customPresets = [];
    try {
      const raw = safeGetStorage('manhwa_script_library_custom');
      if (raw) customPresets = JSON.parse(raw);
    } catch (e) {
      customPresets = [];
    }
    const allPresets = [...customPresets, ...BUILTIN_STORY_PRESETS];
    return allPresets[idx] || BUILTIN_STORY_PRESETS[0];
  }

  function loadAndAutoDirectStory(idx) {
    const p = getLibraryPresetByIndex(idx);
    document.getElementById('scriptInputBox').value = p.script;
    handleScriptStudioImport(true, true);
  }

  function loadPresetIntoScriptEditor(idx) {
    const p = getLibraryPresetByIndex(idx);
    document.getElementById('scriptInputBox').value = p.script;
    switchScriptStudioTab('text');
    showToast(`📝 Loaded "${p.title}" into script editor!`);
  }

  function loadPresetIntoJsonEditor(idx) {
    const p = getLibraryPresetByIndex(idx);
    document.getElementById('scriptInputBox').value = p.script;
    convertScriptToJsonView();
    showToast(`📦 Converted "${p.title}" to JSON!`);
  }

  function saveCurrentStoryAsTemplate() {
    openCustomPromptModal({
      title: '💾 Save Current Story as Template',
      desc: 'Enter a title for this preset template:',
      defaultValue: currentStoryTitle || 'My Anime Episode',
      showInput: true,
      onConfirm: (title) => {
        if (!title) return;
        const scriptText = convertChatMessagesToScriptText(messages);
        const newPreset = {
          id: 'custom_' + Date.now(),
          title: title.trim(),
          desc: `Custom script template with ${messages.length} lines & ${characters.length} characters`,
          cast: characters.map(c => c.name),
          script: scriptText
        };

        let customPresets = [];
        try {
          const raw = safeGetStorage('manhwa_script_library_custom');
          if (raw) customPresets = JSON.parse(raw);
        } catch (e) {
          customPresets = [];
        }

        customPresets.unshift(newPreset);
        safeSetStorage('manhwa_script_library_custom', JSON.stringify(customPresets));
        renderScriptLibrary();
        showToast(`✨ Saved "${title}" to your Story Library!`);
      }
    });
  }

  function copyScriptInputText() {
    const box = document.getElementById('scriptInputBox');
    if (!box || !box.value.trim()) {
      showToast('⚠️ Script editor is empty!');
      return;
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(box.value).then(() => {
        showToast('📋 Script copied to clipboard!');
      }).catch(() => {
        box.select();
        document.execCommand('copy');
        showToast('📋 Script copied to clipboard!');
      });
    } else {
      box.select();
      document.execCommand('copy');
      showToast('📋 Script copied to clipboard!');
    }
  }

  function pasteScriptInputText() {
    const box = document.getElementById('scriptInputBox');
    if (!box) return;
    if (navigator.clipboard && navigator.clipboard.readText) {
      navigator.clipboard.readText().then(text => {
        if (!text) {
          showToast('⚠️ Clipboard is empty!');
          return;
        }
        box.value = text;
        showToast('📥 Script pasted from clipboard!');
      }).catch(() => {
        box.focus();
        showToast('👉 Press Ctrl+V (or tap paste) into the box');
      });
    } else {
      box.focus();
      showToast('👉 Press Ctrl+V to paste');
    }
  }

  function clearScriptInputText() {
    const box = document.getElementById('scriptInputBox');
    if (!box || !box.value.trim()) return;
    box.value = '';
    showToast('🗑️ Script editor cleared!');
  }

  function copyScriptJsonText() {
    const box = document.getElementById('scriptJsonBox');
    if (!box || !box.value.trim()) {
      showToast('⚠️ JSON editor is empty!');
      return;
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(box.value).then(() => {
        showToast('📋 JSON copied to clipboard!');
      }).catch(() => {
        box.select();
        document.execCommand('copy');
        showToast('📋 JSON copied to clipboard!');
      });
    } else {
      box.select();
      document.execCommand('copy');
      showToast('📋 JSON copied to clipboard!');
    }
  }

  function pasteScriptJsonText() {
    const box = document.getElementById('scriptJsonBox');
    if (!box) return;
    if (navigator.clipboard && navigator.clipboard.readText) {
      navigator.clipboard.readText().then(text => {
        if (!text) {
          showToast('⚠️ Clipboard is empty!');
          return;
        }
        box.value = text;
        showToast('📥 JSON pasted from clipboard!');
      }).catch(() => {
        box.focus();
        showToast('👉 Press Ctrl+V (or tap paste) into the box');
      });
    } else {
      box.focus();
      showToast('👉 Press Ctrl+V to paste');
    }
  }

  function clearScriptJsonText() {
    const box = document.getElementById('scriptJsonBox');
    if (!box || !box.value.trim()) return;
    box.value = '';
    showToast('🗑️ JSON editor cleared!');
  }

  function copyChatGptTemplate() {
    // 1. Build live cast section
    let castRosterList = '';
    if (Array.isArray(characters) && characters.length > 0) {
      characters.forEach(c => {
        const exprKeys = Object.keys(c.expressions || {});
        const allTags = Array.from(new Set(['normal', 'cry', 'shock', 'angry', 'love', 'laugh', ...exprKeys]));
        const sideDesc = (c.side === 'right') ? 'POV User (Right side)' : 'Partner / Squad (Left side)';
        castRosterList += `• ${c.name} [${sideDesc}]:\n  Available emotion tags: ${allTags.map(t => `[${c.name}:${t}]`).join(', ')}\n`;
      });
    } else {
      castRosterList += `• Nobita: [Nobita:normal], [Nobita:cry], [Nobita:shock], [Nobita:angry], [Nobita:love], [Nobita:laugh]\n`;
      castRosterList += `• Doraemon: [Doraemon:normal], [Doraemon:laugh], [Doraemon:angry]\n`;
    }

    // 2. Build live stickers & vault section
    let stickersList = '';
    if (Array.isArray(customStickers) && customStickers.length > 0) {
      stickersList += `• Custom Vault Stickers (Use [Character:STICKER]: label):\n  `;
      stickersList += customStickers.map(s => s.label).join(', ') + '\n';
    }
    if (typeof builtInStickers !== 'undefined' && Array.isArray(builtInStickers) && builtInStickers.length > 0) {
      stickersList += `• Built-in Comic Stickers:\n  `;
      stickersList += builtInStickers.slice(0, 16).map(s => s.label || s.id).join(', ') + '\n';
    }

    const prompt = `You are a professional Anime & Manhwa Webtoon Screenwriter. Write a dynamic multi-scene comic chat dialogue script using this EXACT syntax so my Chat Studio app can direct and auto-play it with realistic typing animations, sound effects, facial expressions, and interface switching:

=== YOUR CONFIGURED CAST ROSTER & EXPRESSIONS ===
${castRosterList.trim()}

${stickersList ? `=== CONFIGURED MEDIA VAULT & STICKERS ===\n${stickersList.trim()}\n` : ''}=== SCRIPT SYNTAX CHEAT SHEET ===
1. NATURAL LIVE TYPING & CUSTOM DELAYS (High Recommended):
   /delay 3sec  -> Displays realistic typing for 3 seconds before next message
   /delay 1.5s  -> 1.5 seconds typing delay
   /delay 800ms -> 800 milliseconds quick response delay
   * Behavior: Incoming characters show an animated 3-dot typing bubble & header "typing..." pulse. POV user messages simulate letter-by-letter typing directly inside the bottom composer!

2. CHARACTER DIALOGUE & FACIAL EXPRESSIONS:
   [CharacterName]: normal dialogue text
   [CharacterName:emotion]: dialogue with specific facial expression (e.g. cry, shock, angry, love, laugh, or any custom tag listed above)

3. WAITING SECONDS & SUSPENSE SILENCE:
   [PAUSE: 2s] -> Dramatic silent pause before next event

4. MULTI-APP SCENE MORPHING (WhatsApp <-> ChatGPT <-> Gemini):
   [SCENE: whatsapp] -> Switches interface to WhatsApp (header typing pulse, double read ticks ✓✓)
   [SCENE: chatgpt] -> Switches interface to ChatGPT (authentic ChatGPT thinking indicator ●)
   [SCENE: gemini] -> Switches interface to Google Gemini (authentic Gemini sparkle thinking ✦)

5. ACTION SOUND EFFECT (SFX) BURSTS & SCREENSHAKE:
   [CharacterName:SFX]: 💥 BAM!! (or 👊 POW!!, 🥊 ORA ORA!!, ⚔️ CLASH!!, ⚡ NANI?!, 💀 OMAE WA MOU..., 😭 WAAAHH!!, 🤣 BWAHAHA!)

6. MULTIMEDIA & STICKERS:
   [CharacterName:STICKER]: label (Use any sticker label from the vault list above)
   [CharacterName:IMAGE]: https://example.com/photo.jpg (or [IMAGE: url])
   [CharacterName:VIDEO]: https://example.com/video.mp4 (or [VIDEO: url])
   [CharacterName:AUDIO]: https://example.com/voice.mp3 (or [AUDIO: url])

7. SYSTEM NOTIFICATIONS & QUEST ALERTS:
   [SYSTEM: Episode Title or Location Banner]
   [QUEST: SURVIVAL QUEST: Solo Leveling holographic alert text]

8. PLAYBACK PACING & SPEED:
   [SPEED: 1.0x] (or 1.25x, 1.5x)
   [CharacterName:FAST]: rapid fire comic texting
   [CharacterName:SLOW]: deliberate dramatic delivery

=== EXAMPLE FULL EPISODE SCRIPT ===
[SYSTEM: EPISODE 1: GIAN'S REVENGE]
/delay 1.5sec
[Nobita:cry]: Doraemon!! Help me! Gian is waiting outside my house!
[Nobita:SFX]: 😭 WAAAHH!!
/delay 2sec
[Doraemon:angry]: Again?! What did you do to anger him this time?!
/delay 1.2sec
[Nobita]: I accidentally stepped on his prized baseball card...
[Gian:SFX]: 👊 POW!!
[Gian]: NOBITAAA! COME OUT HERE RIGHT NOW!
[QUEST: SURVIVAL QUEST: Evade Gian for 5 minutes without 4D gadgets!]
/delay 1sec
[Nobita:shock]: A System Quest appeared?! Since when do we have manhwa quests?!
[Doraemon:laugh]: Bwahaha! Looks like you have to face him like a man!
/delay 2sec
[SCENE: chatgpt]
[Nobita]: ChatGPT, give me a quick escape strategy against an angry baseball kid!
/delay 2.5sec
[ChatGPT]: 1. Distract with a shiny baseball. 2. Apologize with snacks. 3. Run at top speed!
/delay 1.5sec
[SCENE: whatsapp]
[Nobita:bliss]: That's actually brilliant! Doraemon, lend me a snack!
/delay 1sec
[Doraemon:love]: Only if it's NOT my Dorayaki!
[Nobita:SFX]: 💨 NIGERUNDAYO!!

=== ALTERNATIVE: JSON FORMAT SCHEMA ===
If JSON format is preferred, you can output this JSON structure directly:
{
  "title": "Episode 1: Gian's Revenge",
  "activeApp": "whatsapp",
  "style": "realistic",
  "characters": [
    { "id": "c1", "name": "Nobita", "side": "left", "color": "#eab308" },
    { "id": "c2", "name": "Doraemon", "side": "right", "color": "#0284c7" },
    { "id": "c3", "name": "ChatGPT", "side": "left", "color": "#10a37f" }
  ],
  "messages": [
    { "id": "m1", "type": "divider", "text": "EPISODE 1: GIAN'S REVENGE" },
    { "id": "m2", "type": "text", "charId": "c1", "text": "Doraemon!! Help me!", "expr": "cry", "preDelayMs": 1500 },
    { "id": "m3", "type": "pause", "delayMs": 1500 },
    { "id": "m4", "type": "app_switch", "targetApp": "chatgpt" },
    { "id": "m5", "type": "text", "charId": "c1", "text": "ChatGPT, give me an escape plan!", "expr": "normal" },
    { "id": "m6", "type": "text", "charId": "c3", "text": "Tactical advice: 1. Apologize. 2. Run!", "expr": "normal", "preDelayMs": 2500 }
  ]
}`;

    const fallbackCopy = (text) => {
      try {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        showToast('📋 AI Prompt copied with your characters, expressions & stickers!');
      } catch (err) {
        showToast('⚠️ Could not auto-copy. Please copy manually.');
      }
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(prompt).then(() => {
        showToast('📋 AI Prompt copied with your characters, expressions & stickers!');
      }).catch(() => fallbackCopy(prompt));
    } else {
      fallbackCopy(prompt);
    }
  }

  function loadDemoScriptIntoModal() {
    document.getElementById('scriptInputBox').value = `[SYSTEM: EPISODE 1: GIAN'S REVENGE]
/delay 1.5sec
[Nobita:cry]: Doraemon!! Help me! Gian is waiting outside my house!
[Nobita:SFX]: 😭 WAAAHH!!
/delay 2sec
[Doraemon:angry]: Again?! What did you do to anger him this time?!
/delay 1.2sec
[Nobita]: I accidentally stepped on his prized baseball card...
[Gian:SFX]: 👊 POW!!
[Gian]: NOBITAAA! COME OUT HERE RIGHT NOW!
[QUEST: SURVIVAL QUEST: Evade Gian for 5 minutes without using any 4D gadgets!]
/delay 1sec
[Nobita:shock]: A System Quest appeared?! Since when do we have manhwa quests?!
[Doraemon:laugh]: Bwahaha! Looks like you have to face him like a man!
/delay 2sec
[SCENE: chatgpt]
[Nobita]: ChatGPT, give me a quick escape strategy against an angry baseball kid!
/delay 2.5sec
[ChatGPT]: 1. Distract with a shiny baseball. 2. Apologize with snacks. 3. Run at top speed!
/delay 1.5sec
[SCENE: whatsapp]
[Nobita:bliss]: That's actually brilliant! Doraemon, lend me a snack!
/delay 1sec
[Doraemon:love]: Only if it's NOT my Dorayaki!
[Nobita:SFX]: 💨 NIGERUNDAYO!!`;
    showToast('⚡ Rich sample script with natural typing delays loaded!');
  }

  // Converts in-memory messages array to script dialogue text format
  function convertChatMessagesToScriptText(msgList) {
    const lines = [];
    (msgList || []).forEach(m => {
      if (m.preDelayMs && m.preDelayMs > 0) {
        lines.push(`/delay ${(m.preDelayMs / 1000).toFixed(1).replace(/\.0$/, '')}sec`);
      }
      if (m.type === 'divider') {
        lines.push(`[SYSTEM: ${m.text || ''}]`);
      } else if (m.type === 'quest') {
        lines.push(`[QUEST: ${m.text || ''}]`);
      } else if (m.type === 'app_switch') {
        lines.push(`[SCENE: ${m.targetApp || 'whatsapp'}]`);
      } else if (m.type === 'pause') {
        lines.push(`/delay ${(m.delayMs / 1000).toFixed(1).replace(/\.0$/, '')}sec`);
      } else if (m.type === 'image') {
        const char = characters.find(c => c.id === m.charId) || { name: 'Character' };
        lines.push(`[${char.name}:IMAGE]: ${m.imageUrl || m.text || ''}`);
      } else if (m.type === 'video') {
        const char = characters.find(c => c.id === m.charId) || { name: 'Character' };
        lines.push(`[${char.name}:VIDEO]: ${m.videoUrl || m.text || ''}`);
      } else if (m.type === 'audio') {
        const char = characters.find(c => c.id === m.charId) || { name: 'Character' };
        lines.push(`[${char.name}:AUDIO]: ${m.audioUrl || m.text || ''}`);
      } else if (m.type === 'sfx') {
        const char = characters.find(c => c.id === m.charId) || { name: 'Character' };
        lines.push(`[${char.name}:SFX]: ${m.text || '💥 BAM!!'}`);
      } else if (m.type === 'sticker') {
        const char = characters.find(c => c.id === m.charId) || { name: 'Character' };
        const label = (m.stickerData && m.stickerData.label) || 'sticker';
        lines.push(`[${char.name}:STICKER]: ${label}`);
      } else {
        const char = characters.find(c => c.id === m.charId) || { name: 'Character' };
        const exprTag = (m.expr && m.expr !== 'normal') ? `:${m.expr}` : '';
        lines.push(`[${char.name}${exprTag}]: ${m.text || ''}`);
      }
    });
    return lines.join('\n');
  }

  // Parse Dialogue Script into Structured Data Objects (with Smart Auto-Timing)
  function parseScriptLinesToMessages(rawScript) {
    const lines = (rawScript || '').split('\n').map(l => l.trim()).filter(Boolean);
    const parsedMsgs = [];
    const validExprs = ['normal', 'cry', 'laugh', 'angry', 'shock', 'love', 'whisper'];
    let pendingDelayMs = 0;

    lines.forEach((line, idx) => {
      // 0. Custom delay command: /delay 3sec, /delay 1.5s, /delay 800ms, /delay 2.5sec, /delay 3sec[push]
      const delayCmdMatch = line.match(/^\/delay\s+([\d\.]+)\s*(seconds|second|secs|sec|ms|s)?(?:\s*\[?([a-zA-Z0-9_\-]+)\]?)?/i);
      if (delayCmdMatch) {
        const val = parseFloat(delayCmdMatch[1]);
        if (!isNaN(val) && val > 0) {
          const unit = (delayCmdMatch[2] || '').toLowerCase();
          const ms = (unit === 'ms') ? val : (val * 1000);
          const clamped = Math.max(100, Math.min(30000, ms));
          pendingDelayMs = Math.min(30000, pendingDelayMs + clamped);
        }
        return;
      }

      // [PAUSE: 1.5s] or [PAUSE: 2000]
      const pauseMatch = line.match(/^\[PAUSE:\s*([\d\.]+)\s*(seconds|second|secs|sec|ms|s)?\]/i);
      if (pauseMatch) {
        const val = parseFloat(pauseMatch[1]);
        if (!isNaN(val) && val > 0) {
          const unit = (pauseMatch[2] || '').toLowerCase();
          const ms = (unit === 'ms') ? val : (val * 1000);
          const clamped = Math.max(100, Math.min(30000, ms));
          pendingDelayMs = Math.min(30000, pendingDelayMs + clamped);
        }
        return;
      }

      const eventPreDelay = pendingDelayMs;
      pendingDelayMs = 0;

      // 1. [SYSTEM: text]
      const sysMatch = line.match(/^\[SYSTEM:\s*(.+)\]$/i);
      if (sysMatch) {
        parsedMsgs.push({
          id: 'm_sys_' + Date.now() + '_' + idx,
          type: 'divider',
          text: sysMatch[1].trim(),
          preDelayMs: eventPreDelay,
          delayMs: 1100
        });
        return;
      }

      // 2. [QUEST: text]
      const questMatch = line.match(/^\[(?:SYSTEM\s+)?QUEST:\s*(.+)\]$/i);
      if (questMatch) {
        parsedMsgs.push({
          id: 'm_quest_' + Date.now() + '_' + idx,
          type: 'quest',
          title: 'SYSTEM QUEST ALERT',
          text: questMatch[1].trim(),
          preDelayMs: eventPreDelay,
          delayMs: 1600
        });
        return;
      }

      // 3. [APP: appName] or [SCENE: appName] or [SCENE: appName : 3s]
      const appMatch = line.match(/^\[(?:APP|SCENE):\s*(whatsapp|chatgpt|gemini)(?:\s*[:,\-]?\s*([\d\.]+\s*(?:seconds|second|secs|sec|ms|s)?))?(?:\s*[:,\-]?\s*\[?([a-zA-Z0-9_\-]+)\]?)?\]$/i);
      if (appMatch) {
        let customSceneDelay = 0;
        if (appMatch[2]) {
          const rawVal = parseFloat(appMatch[2]);
          if (!isNaN(rawVal) && rawVal > 0) {
            customSceneDelay = /ms/i.test(appMatch[2]) ? rawVal : (rawVal * 1000);
          }
        }
        parsedMsgs.push({
          id: 'm_app_' + Date.now() + '_' + idx,
          type: 'app_switch',
          targetApp: appMatch[1].toLowerCase(),
          preDelayMs: eventPreDelay || customSceneDelay,
          delayMs: customSceneDelay || 1400
        });
        return;
      }

      // Standalone Media Tags: [IMAGE: url], [PHOTO: url], [VIDEO: url], [AUDIO: url]
      const standaloneMediaMatch = line.match(/^\[(IMAGE|PHOTO|VIDEO|AUDIO|MEDIA):\s*(.+)\]$/i);
      if (standaloneMediaMatch) {
        const mType = standaloneMediaMatch[1].toUpperCase();
        const mUrl = standaloneMediaMatch[2].trim();
        const activeChar = characters.find(c => c.id === currentCharId) || characters[0];
        parsedMsgs.push({
          id: 'm_media_' + Date.now() + '_' + idx,
          type: (mType === 'VIDEO' ? 'video' : (mType === 'AUDIO' ? 'audio' : 'image')),
          charId: activeChar.id,
          imageUrl: (mType !== 'VIDEO' && mType !== 'AUDIO') ? mUrl : null,
          videoUrl: (mType === 'VIDEO') ? mUrl : null,
          audioUrl: (mType === 'AUDIO') ? mUrl : null,
          preDelayMs: eventPreDelay,
          delayMs: 800,
          time: getNextStoryTime()
        });
        return;
      }

      // 5. [SPEED: 1.5x]
      const speedMatch = line.match(/^\[SPEED:\s*([\d\.]+)x?\]$/i);
      if (speedMatch) {
        cinemaSpeedMultiplier = parseFloat(speedMatch[1]) || 1.0;
        safeSetStorage('wh_cinema_speed', cinemaSpeedMultiplier.toString());
        return;
      }

      // 6. Character dialogue lines
      let charName = '';
      let tag1 = 'normal';
      let tag2 = '';
      let msgBody = '';

      const bracketMatch = line.match(/^\[([^:\]]+)(?::([^:\]]+))?(?::([^\]]+))?\]:\s*(.+)$/);
      if (bracketMatch) {
        charName = bracketMatch[1].trim();
        tag1 = (bracketMatch[2] || 'normal').trim();
        tag2 = (bracketMatch[3] || '').trim();
        msgBody = bracketMatch[4].trim();
      } else {
        const colonIdx = line.indexOf(':');
        if (colonIdx === -1) return;
        charName = line.slice(0, colonIdx).trim();
        msgBody = line.slice(colonIdx + 1).trim();
      }

      if (!charName || !msgBody) return;

      // Auto-create missing characters with vibrant palette & avatar
      let char = characters.find(c => c.name.toLowerCase() === charName.toLowerCase());
      if (!char) {
        const palette = ['#eab308', '#0284c7', '#ec4899', '#a855f7', '#10b981', '#f97316', '#06b6d4'];
        const cIdx = characters.length;
        const color = palette[cIdx % palette.length];
        char = {
          id: 'c_auto_' + Date.now() + '_' + idx,
          name: charName,
          side: cIdx % 2 === 0 ? 'left' : 'right',
          color,
          pitch: 1.0 + (cIdx % 3) * 0.12,
          avatar: makeComicAvatarDataUri(charName, color, '⚡')
        };
        ensureCharacterExpressions(char);
        characters.push(char);
      }

      const upperTag1 = tag1.toUpperCase();
      const upperTag2 = tag2.toUpperCase();

      // Check Media within character bracket: [Dora:IMAGE]: url, [Dora:VIDEO]: url
      if (upperTag1 === 'IMAGE' || upperTag1 === 'PHOTO' || upperTag2 === 'IMAGE') {
        parsedMsgs.push({
          id: 'm_img_' + Date.now() + '_' + idx,
          type: 'image',
          charId: char.id,
          imageUrl: msgBody,
          preDelayMs: eventPreDelay,
          delayMs: 800,
          time: getNextStoryTime()
        });
        return;
      }
      if (upperTag1 === 'VIDEO' || upperTag2 === 'VIDEO') {
        parsedMsgs.push({
          id: 'm_vid_' + Date.now() + '_' + idx,
          type: 'video',
          charId: char.id,
          videoUrl: msgBody,
          preDelayMs: eventPreDelay,
          delayMs: 800,
          time: getNextStoryTime()
        });
        return;
      }
      if (upperTag1 === 'AUDIO' || upperTag1 === 'VOICE' || upperTag2 === 'AUDIO') {
        parsedMsgs.push({
          id: 'm_aud_' + Date.now() + '_' + idx,
          type: 'audio',
          charId: char.id,
          audioUrl: msgBody,
          preDelayMs: eventPreDelay,
          delayMs: 800,
          time: getNextStoryTime()
        });
        return;
      }

      // Check SFX Burst
      if (upperTag1 === 'SFX' || upperTag2 === 'SFX') {
        const bodyLower = msgBody.toLowerCase();
        let soundType = 'punch';
        if (bodyLower.includes('bam') || bodyLower.includes('pow') || bodyLower.includes('punch') || bodyLower.includes('hit')) soundType = 'punch';
        else if (bodyLower.includes('slash') || bodyLower.includes('sword') || bodyLower.includes('blade') || bodyLower.includes('cut')) soundType = 'sword';
        else if (bodyLower.includes('boom') || bodyLower.includes('vineboom') || bodyLower.includes('bruh') || bodyLower.includes('explode')) soundType = 'vineboom';
        else if (bodyLower.includes('nani') || bodyLower.includes('shock') || bodyLower.includes('omae') || bodyLower.includes('sting')) soundType = 'sting';
        else if (bodyLower.includes('awaken') || bodyLower.includes('quest') || bodyLower.includes('mana') || bodyLower.includes('system') || bodyLower.includes('level')) soundType = 'scifi';
        else if (bodyLower.includes('wah') || bodyLower.includes('cry') || bodyLower.includes('tear') || bodyLower.includes('sob')) soundType = 'sad';
        else if (bodyLower.includes('bwaha') || bodyLower.includes('haha') || bodyLower.includes('laugh') || bodyLower.includes('rofl')) soundType = 'boing';

        const matchBurst = builtInSfxBursts.find(b => b.text.toLowerCase().includes(bodyLower) || bodyLower.includes(b.id));
        if (matchBurst && matchBurst.sfx) soundType = matchBurst.sfx;

        parsedMsgs.push({
          id: 'm_sfx_' + Date.now() + '_' + idx,
          type: 'sfx',
          charId: char.id,
          text: msgBody,
          expr: (matchBurst && matchBurst.expr) || (soundType === 'sad' ? 'cry' : (soundType === 'boing' ? 'laugh' : 'angry')),
          sfx: soundType,
          preDelayMs: eventPreDelay,
          delayMs: 380,
          screenShake: true,
          time: getNextStoryTime()
        });
        return;
      }

      // Check Sticker / Media
      if (upperTag1 === 'STICKER' || upperTag1 === 'MEDIA' || upperTag1 === 'GIF' || upperTag2 === 'STICKER') {
        const found = customStickers.find(s => s.label.toLowerCase().includes(msgBody.toLowerCase())) ||
                      builtInStickers.find(s => (s.label || '').toLowerCase().includes(msgBody.toLowerCase())) ||
                      customStickers[0] || builtInStickers[0];
        parsedMsgs.push({
          id: 'm_stk_' + Date.now() + '_' + idx,
          type: 'sticker',
          charId: char.id,
          stickerData: found,
          expr: 'normal',
          preDelayMs: eventPreDelay,
          delayMs: 550,
          time: getNextStoryTime()
        });
        return;
      }

      // Emotion & Auto-Timing
      let expr = tag1.toLowerCase();
      const hasCustomExpr = Boolean(char && char.expressions && char.expressions[expr]);
      if (!validExprs.includes(expr) && !hasCustomExpr) {
        let autoExpr = 'normal';
        if (msgBody.includes('😭') || msgBody.includes('😢')) autoExpr = 'cry';
        else if (msgBody.includes('😂') || msgBody.includes('🤣')) autoExpr = 'laugh';
        else if (msgBody.includes('😡') || msgBody.includes('!')) autoExpr = 'angry';
        else if (msgBody.includes('😱') || msgBody.includes('?!')) autoExpr = 'shock';
        else if (msgBody.includes('😍') || msgBody.includes('💖') || msgBody.includes('💅')) autoExpr = 'love';
        expr = autoExpr;
      }

      // Smart Typing Delay (words pace)
      const textLen = msgBody.length;
      let calculatedDelay = Math.max(300, Math.min(1200, textLen * 24));
      if (expr === 'angry') calculatedDelay = Math.max(220, textLen * 16);
      const isFast = (upperTag1 === 'FAST' || upperTag2 === 'FAST' || upperTag1 === 'BURST' || upperTag2 === 'BURST');
      if (isFast) calculatedDelay = 220;
      if (upperTag1 === 'SLOW' || upperTag2 === 'SLOW') calculatedDelay = 1200;

      parsedMsgs.push({
        id: 'm_imp_' + Date.now() + '_' + idx,
        type: 'text',
        charId: char.id,
        text: msgBody,
        expr,
        fast: isFast,
        preDelayMs: eventPreDelay,
        delayMs: calculatedDelay,
        time: getNextStoryTime()
      });
    });

    if (pendingDelayMs > 0) {
      parsedMsgs.push({
        id: 'm_pause_end',
        type: 'pause',
        delayMs: pendingDelayMs
      });
    }

    return parsedMsgs;
  }

  function convertScriptToJsonView() {
    const raw = (document.getElementById('scriptInputBox').value || '').trim();
    if (!raw) {
      showToast('⚠️ Script box is empty! Enter script lines first.');
      return;
    }
    const msgs = parseScriptLinesToMessages(raw);
    const fullJson = {
      title: currentStoryTitle || 'My Anime Manhwa Episode',
      activeApp: activeAppMode,
      style: chatThemeStyle,
      speedMultiplier: cinemaSpeedMultiplier,
      characters: characters.map(c => ({ id: c.id, name: c.name, side: c.side, color: c.color })),
      messages: msgs
    };
    document.getElementById('scriptJsonBox').value = JSON.stringify(fullJson, null, 2);
    switchScriptStudioTab('json');
    showToast('📦 Script converted to JSON Studio code!');
  }

  function convertJsonToScriptView() {
    const raw = (document.getElementById('scriptJsonBox').value || '').trim();
    if (!raw) {
      showToast('⚠️ JSON box is empty! Paste JSON first.');
      return;
    }
    try {
      const data = JSON.parse(raw);
      const msgList = Array.isArray(data) ? data : (data.messages || []);
      const scriptText = convertChatMessagesToScriptText(msgList);
      document.getElementById('scriptInputBox').value = scriptText;
      switchScriptStudioTab('text');
      showToast('📜 JSON converted to readable Script dialogue!');
    } catch (e) {
      showToast('⚠️ Invalid JSON syntax! Please check formatting.');
    }
  }

  function exportCurrentChatToJsonBox() {
    const fullJson = {
      title: currentStoryTitle,
      activeApp: activeAppMode,
      style: chatThemeStyle,
      speedMultiplier: cinemaSpeedMultiplier,
      characters,
      messages
    };
    document.getElementById('scriptJsonBox').value = JSON.stringify(fullJson, null, 2);
    showToast('📥 Current chat exported to JSON Studio!');
  }

  function handleScriptStudioImport(replaceExisting, autoPlayCinema) {
    let parsedMsgs = [];
    let scriptContent = '';

    if (activeScriptStudioTab === 'json') {
      scriptContent = (document.getElementById('scriptJsonBox').value || '').trim();
    } else {
      scriptContent = (document.getElementById('scriptInputBox').value || '').trim();
    }

    if (!scriptContent) {
      showToast('⚠️ Input box is empty!');
      return;
    }

    // Auto-detect JSON even in script tab!
    if (scriptContent.startsWith('{') || scriptContent.startsWith('[')) {
      try {
        const data = JSON.parse(scriptContent);
        if (data.title) {
          currentStoryTitle = data.title;
          safeSetStorage('wh_current_story_title', currentStoryTitle);
        }
        if (data.activeApp) switchAppMode(data.activeApp);
        if (data.style) applyChatStyle(data.style);
        if (data.speedMultiplier) {
          cinemaSpeedMultiplier = data.speedMultiplier;
          safeSetStorage('wh_cinema_speed', cinemaSpeedMultiplier.toString());
        }
        if (Array.isArray(data.characters)) {
          data.characters.forEach(c => {
            if (!characters.some(existing => existing.id === c.id || existing.name.toLowerCase() === c.name.toLowerCase())) {
              characters.push(c);
            }
          });
        }
        parsedMsgs = Array.isArray(data) ? data : (data.messages || []);
      } catch (err) {
        showToast('⚠️ Invalid JSON! Parsing as text script...');
        parsedMsgs = parseScriptLinesToMessages(scriptContent);
      }
    } else {
      parsedMsgs = parseScriptLinesToMessages(scriptContent);
    }

    if (parsedMsgs.length === 0) {
      showToast('⚠️ No valid dialogue lines detected!');
      return;
    }

    // If script explicitly begins with an app scene directive (e.g. [SCENE: chatgpt]), activate it immediately
    if (parsedMsgs.length > 0 && parsedMsgs[0].type === 'app_switch') {
      switchAppMode(parsedMsgs[0].targetApp, true);
    }

    if (replaceExisting) {
      messages = parsedMsgs;
    } else {
      messages.push(...parsedMsgs);
    }

    saveStudioState();
    renderGroupHeader();
    renderDirectorStrip();
    renderChatStream();
    closeScriptModal();

    if (autoPlayCinema) {
      showToast('🎬 Auto-Directing Scene...');
      setTimeout(() => {
        startCinemaPlayback();
      }, 200);
    } else {
      showToast(`✨ ${replaceExisting ? 'Loaded' : 'Appended'} ${parsedMsgs.length} lines!`);
    }
  }

  /* Universal Custom Prompt / Confirm Modal */
  let customPromptCallback = null;

  function openCustomPromptModal({ title, desc, defaultValue = '', showInput = true, onConfirm }) {
    document.getElementById('customPromptTitle').textContent = title || 'Studio Prompt';
    document.getElementById('customPromptDesc').textContent = desc || '';
    const inputEl = document.getElementById('customPromptInput');
    inputEl.style.display = showInput ? 'block' : 'none';
    inputEl.value = defaultValue;
    customPromptCallback = onConfirm;
    document.getElementById('customPromptModal').classList.add('open');
    if (showInput) setTimeout(() => inputEl.focus(), 50);
  }

  function closeCustomPromptModal() {
    document.getElementById('customPromptModal').classList.remove('open');
    customPromptCallback = null;
  }

  document.getElementById('customPromptConfirmBtn').addEventListener('click', () => {
    const val = document.getElementById('customPromptInput').value.trim();
    const cb = customPromptCallback;
    closeCustomPromptModal();
    if (typeof cb === 'function') cb(val);
  });

  document.getElementById('customPromptInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      document.getElementById('customPromptConfirmBtn').click();
    }
  });

  function promptEpisodeDivider() {
    openCustomPromptModal({
      title: '🏷️ Add Episode Banner',
      desc: 'Enter Episode or Scene Banner Text:',
      defaultValue: 'EPISODE 2: THE NEXT MORNING',
      showInput: true,
      onConfirm: (txt) => {
        if (!txt) return;
        messages.push({ id: 'm_' + Date.now(), type: 'divider', text: txt });
        saveStudioState();
        renderChatStream();
      }
    });
  }

  function promptSystemAlert() {
    openCustomPromptModal({
      title: '📢 Add System / Narrator Line',
      desc: 'Enter Narrator or System Notification Text:',
      defaultValue: '⚡ Meanwhile at the school rooftop...',
      showInput: true,
      onConfirm: (txt) => {
        if (!txt) return;
        messages.push({ id: 'm_' + Date.now(), type: 'system', text: txt });
        saveStudioState();
        renderChatStream();
      }
    });
  }
  function promptQuestAlert() {
    openCustomPromptModal({
      title: '🟦 Solo Leveling Quest Popup',
      desc: 'Enter Quest Hologram Text (or type /quest in chat):',
      defaultValue: '⚠️ URGENT QUEST: Retrieve Nobita\'s Comic Book from Gian within 10 minutes!',
      showInput: true,
      onConfirm: (txt) => {
        if (!txt) return;
        messages.push({
          id: 'm_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
          type: 'quest',
          title: 'SYSTEM QUEST ALERT',
          text: txt
        });
        saveStudioState();
        renderChatStream();
        if (soundEnabled) playSciFiChimeSound();
        showToast('🟦 System Quest Activated!');
      }
    });
  }

  function promptSceneTransition() {
    openCustomPromptModal({
      title: '🚀 Switch App Scene',
      desc: 'Enter target app name (whatsapp, chatgpt, or gemini):',
      defaultValue: activeAppMode === 'whatsapp' ? 'chatgpt' : 'whatsapp',
      showInput: true,
      onConfirm: (app) => {
        const raw = (app || '').trim().toLowerCase();
        const target = ['whatsapp', 'chatgpt', 'gemini'].includes(raw) ? raw : 'chatgpt';
        messages.push({
          id: 'm_app_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
          type: 'app_switch',
          targetApp: target,
          delayMs: 900
        });
        saveStudioState();
        renderChatStream();
        if (soundEnabled) playSciFiChimeSound();
        showToast(`🚀 Added Scene Transition to ${target.toUpperCase()}!`);
      }
    });
  }

  function toggleMessageGrouping() {
    groupConsecutiveMessages = !groupConsecutiveMessages;
    saveStudioState();
    renderGroupHeader();
    renderChatStream();
    showToast(`🔗 Same-Speaker Grouping: ${groupConsecutiveMessages ? 'ON' : 'OFF'}`);
  }

  function setAspectRatio(ratio) {
    if (!['ratio-9-16', 'ratio-16-9', 'ratio-full'].includes(ratio)) ratio = 'ratio-9-16';
    groupProfile.aspectRatio = ratio;
    saveStudioState();
    renderGroupHeader();
    const names = {
      'ratio-9-16': '📱 9:16 Shorts',
      'ratio-16-9': '🖥️ 16:9 YouTube',
      'ratio-full': '🔲 Full Screen'
    };
    showToast(names[ratio] || ratio);
  }

  function cycleAspectRatio() {
    const order = ['ratio-9-16', 'ratio-16-9', 'ratio-full'];
    const currIdx = order.indexOf(groupProfile.aspectRatio || 'ratio-9-16');
    setAspectRatio(order[(currIdx + 1) % order.length]);
  }

  function toggleBrowserFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {
        showToast('⛶ Press F11 for Full Screen');
      });
    } else {
      if (document.exitFullscreen) document.exitFullscreen();
    }
  }

  function toggleDirectorDeck() {
    const deck = document.getElementById('directorDeck');
    const isHidden = deck.classList.toggle('hidden');
    const label = document.getElementById('toggleDeckMenuLabel');
    if (label) label.textContent = isHidden ? '🎛️ Show Director Deck' : '🎛️ Hide Director Deck';
  }

  function toggleCleanRecordMode() {
    cleanRecordMode = !cleanRecordMode;
    renderGroupHeader();

    const wrapper = document.getElementById('phoneWrapper');
    if (wrapper) {
      if (cleanRecordMode) {
        wrapper.classList.add('clean-record-mode');
      } else {
        wrapper.classList.remove('clean-record-mode');
        wrapper.classList.remove('pure-recording-mode');
      }
    }

    const cleanBtn = document.getElementById('cinemaCleanBtn');
    if (cleanBtn) {
      const textSpan = cleanBtn.querySelector('.btn-text');
      if (textSpan) textSpan.textContent = cleanRecordMode ? 'Exit Pure' : 'Pure';
      cleanBtn.style.borderColor = cleanRecordMode ? '#facc15' : '#475569';
    }

    const dock = document.getElementById('cinemaDock');
    if (dock) {
      if (cleanRecordMode) {
        dock.classList.add('auto-faded');
      } else {
        dock.classList.remove('auto-faded');
      }
    }

    const ghostTrigger = document.getElementById('cinemaGhostTrigger');
    if (ghostTrigger) {
      ghostTrigger.style.display = cleanRecordMode ? 'inline-flex' : 'none';
    }

    const label = document.getElementById('cleanRecordMenuLabel');
    if (label) label.textContent = cleanRecordMode ? '👁️ Exit Pure View (H)' : '👁️ Pure Chat View (H)';
    showToast(cleanRecordMode ? '👁️ Pure Chat Mode ON (Press H to restore)' : '🎬 Studio Controls Restored');
  }

  function toggleSound() {
    soundEnabled = !soundEnabled;
    const btn = document.getElementById('soundToggleBtn');
    if (btn) btn.textContent = soundEnabled ? '🔊' : '🔇';
    showToast(soundEnabled ? '🔊 Sound ON' : '🔇 Sound Muted');
  }

  function toggleDropdownMenu(e) {
    e.stopPropagation();
    document.getElementById('studioDropdown').classList.toggle('open');
  }

  function closeDropdownMenu() {
    document.getElementById('studioDropdown').classList.remove('open');
  }

  function exportBackupJson() {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify({
      groupProfile, characters, messages, customStickers
    }, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = 'manhwa_chat_story.json';
    a.click();
    showToast('💾 Story JSON exported!');
  }

  function confirmClearChat() {
    openCustomPromptModal({
      title: '🗑️ Clear All Messages?',
      desc: 'Are you sure you want to clear all messages in the current chat story?',
      showInput: false,
      onConfirm: () => {
        messages = [];
        saveStudioState();
        renderChatStream();
        showToast('🗑️ Chat cleared');
      }
    });
  }

  let toastTimeout = null;
  function showToast(text) {
    const el = document.getElementById('appToast');
    el.textContent = text;
    el.style.display = 'flex';
    if (toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      el.style.display = 'none';
    }, 2400);
  }

  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // Keyboard shortcut 'H' for Clean Record View
  document.addEventListener('keydown', (e) => {
    const tag = document.activeElement ? document.activeElement.tagName : '';
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
    if (e.key.toLowerCase() === 'h') {
      e.preventDefault();
      toggleCleanRecordMode();
    }
  });

  /* =====================================================================
     14. INITIALIZE STUDIO
     ===================================================================== */
  loadStudioState();
  ensureAiCastMembers();
  applyChatStyle(chatThemeStyle);
  switchAppMode(activeAppMode);
  renderGroupHeader();
  renderDirectorStrip();
  renderChatStream();
  renderDrawerContent();
  updateCinemaSpeedUI();
  autoResizeComposerInput(document.getElementById('chatMessageInput'));
  initTurboGestures();

  // Cinema Dock Auto-Hide Interaction Listeners (keeps video capture crystal clean)
  const phoneWrapperEl = document.getElementById('phoneWrapper');
  if (phoneWrapperEl) {
    phoneWrapperEl.addEventListener('mousemove', resetCinemaAutoHideTimer);
    phoneWrapperEl.addEventListener('touchstart', resetCinemaAutoHideTimer, { passive: true });
    phoneWrapperEl.addEventListener('click', resetCinemaAutoHideTimer);
  }

  // Mobile virtual keyboard handling: scroll to bottom on input focus
  const mobileInputEl = document.getElementById('chatMessageInput');
  if (mobileInputEl) {
    mobileInputEl.addEventListener('focus', () => {
      setTimeout(() => {
        const stream = document.getElementById('chatStream');
        if (stream) stream.scrollTop = stream.scrollHeight;
      }, 300);
    });
  }

  /* =====================================================================
     GLOBAL OUTSIDE-CLICK & ESCAPE KEY LISTENERS (TAP ANYWHERE TO CLOSE)
     ===================================================================== */
  function closeAllModals() {
    document.querySelectorAll('.modal-backdrop').forEach(modal => {
      modal.classList.remove('open');
    });
  }

  // Tap anywhere outside to close modals, dropdown menu, or sticker drawer
  document.addEventListener('click', (e) => {
    // 1. If clicked on modal backdrop (outside the modal window)
    if (e.target.classList.contains('modal-backdrop')) {
      e.target.classList.remove('open');
    }

    // 2. If studio dropdown menu is open and click was outside
    const dropdown = document.getElementById('studioDropdown');
    if (dropdown && dropdown.classList.contains('open')) {
      if (!e.target.closest('#studioDropdown') && !e.target.closest('.header-icon-btn') && !e.target.closest('[onclick*="toggleDropdownMenu"]')) {
        closeDropdownMenu();
      }
    }

    // 3. If sticker drawer is open and click was outside (allow clicking directorDeck to switch chars)
    const drawer = document.getElementById('stickerDrawer');
    if (drawer && drawer.classList.contains('open')) {
      if (!e.target.closest('#stickerDrawer') && !e.target.closest('#stickerToggleBtn') && !e.target.closest('.drawer-tab') && !e.target.closest('#directorDeck')) {
        drawer.classList.remove('open');
        const btn = document.getElementById('stickerToggleBtn');
        if (btn) btn.classList.remove('active');
      }
    }

    // 4. If cinema speed popover is open and click was outside
    const speedPopover = document.getElementById('cinemaSpeedPopover');
    if (speedPopover && speedPopover.classList.contains('open')) {
      if (!e.target.closest('#cinemaSpeedPopover') && !e.target.closest('#cinemaSpeedBtn')) {
        hideSpeedPopover();
      }
    }

    // 5. If character picker popover is open and click was outside directorDeck
    const castPopover = document.getElementById('castPickerPopover');
    if (castPopover && castPopover.classList.contains('open')) {
      if (!e.target.closest('#directorDeck')) {
        closeCastPickerPopover();
      }
    }
  });

  // Escape key closes any active modal, menu, or drawer immediately
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeAllModals();
      closeDropdownMenu();
      hideSpeedPopover();
      closeCastPickerPopover();
      const drawer = document.getElementById('stickerDrawer');
      if (drawer) drawer.classList.remove('open');
    }
  });
