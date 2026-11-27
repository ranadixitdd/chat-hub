/* ============================================================================
   MANHWA CHAT HUB — CREATOR MARKETPLACE CURATED CATALOG
   Quality-only baseline: real illustrated PNG characters & full multi-scene scripts.
   Zero procedural SVG filler stickers, duplicate SFX, or recolored SVG themes.
   ============================================================================ */
(() => {
  'use strict';

  const ORIGINAL_QUALITY_PACKS = [
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
      id: 'mkt_street_fighter_ren',
      title: 'Street Fighter Ren (9 Full-Body Action Poses)',
      category: 'characters',
      author: 'ChatHub Originals',
      authorHandle: '@chathub_studio',
      verified: true,
      isOfficial: true,
      priceUsd: 0,
      plannedPriceUsd: 4.99,
      license: 'Free for Personal & Shorts/Reels Videos',
      description: 'High-energy streetwear fighter with 9 full-body dynamic action sprites: combat, smirk, rage, shadow aura, shock, laugh & sad.',
      tags: ['Street Fighter', 'Cyberpunk', '9 Poses', 'Action'],
      coverImage: 'assets/characters/ren_street_body.png',
      baseInstalls: 1120,
      items: {
        characters: [{
          sourceId: 'ren_street_fighter',
          name: 'Ren',
          side: 'right',
          color: '#f59e0b',
          pitch: 0.98,
          role: 'Street Brawler',
          avatar: 'assets/characters/ren_street_body.png',
          expressions: {
            normal: 'assets/characters/ren_normal.png',
            smirk: 'assets/characters/ren_smirk.png',
            combat: 'assets/characters/ren_combat.png',
            laugh: 'assets/characters/ren_laugh.png',
            shock: 'assets/characters/ren_shock.png',
            angry: 'assets/characters/ren_angry.png',
            love: 'assets/characters/ren_love.png',
            sad: 'assets/characters/ren_sad.png',
            shadow: 'assets/characters/ren_shadow.png'
          }
        }]
      }
    },
    {
      id: 'mkt_anime_chibi_kenji',
      title: 'Anime Chibi Kenji (12 Full-Body Expressions)',
      category: 'characters',
      author: 'ChatHub Originals',
      authorHandle: '@chathub_studio',
      verified: true,
      isOfficial: true,
      priceUsd: 0,
      plannedPriceUsd: 4.99,
      license: 'Free for Personal & Shorts/Reels Videos',
      description: 'Ultra-expressive anime schoolboy with 12 complete full-body reaction sprites for comedy skits, romance, panic, and study chaos.',
      tags: ['Chibi', 'School Anime', '12 Faces', 'Comedy'],
      coverImage: 'assets/characters/kenji_chibi_body.png',
      baseInstalls: 1540,
      items: {
        characters: [{
          sourceId: 'kenji_chibi_student',
          name: 'Kenji',
          side: 'left',
          color: '#10b981',
          pitch: 1.15,
          role: 'Classmate',
          avatar: 'assets/characters/kenji_chibi_body.png',
          expressions: {
            normal: 'assets/characters/kenji_normal.png',
            happy: 'assets/characters/kenji_happy.png',
            love: 'assets/characters/kenji_love.png',
            laugh: 'assets/characters/kenji_laugh.png',
            shock: 'assets/characters/kenji_shock.png',
            angry: 'assets/characters/kenji_angry.png',
            cry: 'assets/characters/kenji_cry.png',
            smirk: 'assets/characters/kenji_smirk.png',
            combat: 'assets/characters/kenji_combat.png',
            panic: 'assets/characters/kenji_panic.png',
            confused: 'assets/characters/kenji_confused.png',
            sleepy: 'assets/characters/kenji_sleepy.png'
          }
        }]
      }
    },
    {
      id: 'mkt_otome_duke_cassian',
      title: 'Cold Northern Duke Cassian (Otome Isekai)',
      category: 'characters',
      author: 'ChatHub Originals',
      authorHandle: '@chathub_studio',
      verified: true,
      isOfficial: true,
      priceUsd: 0,
      plannedPriceUsd: 4.99,
      license: 'Free for Personal & Shorts/Reels Videos',
      description: 'The legendary Cold Duke of the North in imperial fur-trimmed coat with stoic glare, rare gentle smile, combat stance & shock.',
      tags: ['Otome Isekai', 'Cold Duke', 'Royalty', 'Romance'],
      coverImage: 'assets/characters/cassian_duke_body.png',
      baseInstalls: 1890,
      items: {
        characters: [{
          sourceId: 'duke_cassian_otome',
          name: 'Cassian',
          side: 'right',
          color: '#38bdf8',
          pitch: 0.88,
          role: 'Northern Duke',
          avatar: 'assets/characters/cassian_duke_body.png',
          expressions: {
            normal: 'assets/characters/cassian_normal.png',
            cold: 'assets/characters/cassian_cold.png',
            combat: 'assets/characters/cassian_combat.png',
            rare_smile: 'assets/characters/cassian_rare_smile.png',
            shock: 'assets/characters/cassian_shock.png',
            glare: 'assets/characters/cassian_cold.png'
          }
        }]
      }
    },
    {
      id: 'mkt_otome_lady_valerie',
      title: 'Imperial Noble Lady Valerie (Otome Villainess)',
      category: 'characters',
      author: 'ChatHub Originals',
      authorHandle: '@chathub_studio',
      verified: true,
      isOfficial: true,
      priceUsd: 0,
      plannedPriceUsd: 4.99,
      license: 'Free for Personal & Shorts/Reels Videos',
      description: 'Dramatic imperial villainess with aristocratic fan, sparkling schemes, dramatic tea insults, tears, and emotional tantrums.',
      tags: ['Otome Isekai', 'Villainess', 'Drama', 'Royalty'],
      coverImage: 'assets/characters/valerie_noble_body.png',
      baseInstalls: 2140,
      items: {
        characters: [{
          sourceId: 'lady_valerie_villainess',
          name: 'Valerie',
          side: 'left',
          color: '#a855f7',
          pitch: 1.28,
          role: 'Imperial Aristocrat',
          avatar: 'assets/characters/valerie_noble_body.png',
          expressions: {
            normal: 'assets/characters/valerie_normal.png',
            smirk: 'assets/characters/valerie_smirk.png',
            tantrum: 'assets/characters/valerie_tantrum.png',
            sparkle: 'assets/characters/valerie_sparkle.png',
            cry: 'assets/characters/valerie_cry.png',
            tea: 'assets/characters/valerie_tea.png',
            disdain: 'assets/characters/valerie_disdain.png'
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
            sourceId: 'tpl_red_gate',
            title: 'Dungeon Gate 14: The Rank-S Betrayal',
            desc: 'Original hunter betrayal thriller with System Quest, ChatGPT tactical check, and choice climax.',
            cast: ['Kaito', 'Hana', 'ChatGPT'],
            script: `[SYSTEM: 🎬 EPISODE 1: RED GATE 14 BETRAYAL]
[CHAT: group]
/delay 1.2sec
[Kaito:shock:vineboom]: Hana! Did you lock the dungeon portal from the outside?!
[Kaito:sfx]: ⚡ NANI?!
/delay 1.8sec
[Hana:angry]: The Guild Master ordered a containment seal! Nobody leaves Sector 14!
/delay 1.6sec
[PAUSE: 1.5s]
[QUEST: ⚠️ SURVIVAL QUEST: Break the Sector 14 Seal in 120 seconds or lose Shadow Core!]
/delay 2sec
[Kaito:angry:punch]: Fine. Then I'm tearing the gate down myself.
/delay 2.2sec
[SCENE: chatgpt]
[Kaito]: ChatGPT, scan the mana frequency of a Grade-S containment seal!
/delay 2.2sec
[ChatGPT]: Vulnerability detected at base rune #7. Strike with shadow resonance at full velocity!
/delay 2.2sec
[SCENE: whatsapp]
[CHOICE: Final Strike | ⚡ Shatter Rune #7 -> Kaito: 👑 ARISE!! SEAL SHATTERED!! | 🤝 Offer Hana a Truce -> Hana: 😱 Wait... you spared me?!]
/delay 2sec
[Hana:shock]: No one has ever broken a Grade-S lock from the inside...
/delay 1.6sec
[SYSTEM: 🎬 TO BE CONTINUED — PART 2]`
          },
          {
            sourceId: 'tpl_rooftop_1247',
            title: '12:47 AM: The Unsent Rooftop Note',
            desc: 'Rom-com midnight DM banter jumping from confrontation to secret confession choice.',
            cast: ['Kaito', 'Hana'],
            script: `[SYSTEM: 💖 12:47 AM — PRIVATE DM]
[CHAT: private: Hana]
/delay 1.2sec
[Kaito:normal]: Hana... did you leave a notebook on my desk after club practice?
/delay 1.8sec
[Hana:shock:boing]: WH-WHAT?! YOU DIDN'T OPEN PAGE 12, DID YOU?!
/delay 1.6sec
[Kaito:laugh]: The page titled "Reasons Kaito is annoying (and dangerously cute)"?
/delay 1.8sec
[Hana:angry]: THAT WAS A PRIVATE DRAFT!! DELETE YOUR MEMORY RIGHT NOW!!
[Hana:sfx]: 💢 B-BAKA!!
/delay 2sec
[CHOICE: How should Kaito reply? | 💖 I kept the page in my wallet -> Hana: 😍 W-WAIT... SERIOUSLY?! | 😂 Frame it on the club wall -> Hana: 🤬 KAITOOO RUN FOR YOUR LIFE!!]
/delay 1.8sec
[Hana:love]: ...Just meet me by the rooftop stairs before first period, okay?
/delay 1.6sec
[SYSTEM: 🎬 CHAPTER COMPLETE]`
          },
          {
            sourceId: 'tpl_rogue_ai',
            title: 'Midnight Mystery: The Rogue AI Signal',
            desc: 'Cross-app thriller jumping from WhatsApp to Gemini to decode a 3 AM emergency threat.',
            cast: ['Kaito', 'Hana', 'Gemini'],
            script: `[SYSTEM: 🚨 3:03 AM — UNKNOWN SIGNAL]
[CHAT: group]
/delay 1.2sec
[Hana:cry]: Kaito!! Every screen in my apartment just flashed the exact same coordinates!
/delay 1.8sec
[Kaito:shock:shock]: Wait... those coordinates are inside our school basement!
/delay 2sec
[SCENE: gemini]
[Kaito]: Gemini, decode the hex header attached to Hana's emergency ping!
/delay 2.2sec
[Gemini]: Warning: Signal originated from local subnet 192.168.0.14 — someone is ALREADY inside the building!
/delay 2.2sec
[SCENE: whatsapp]
[Kaito:angry:sting]: HANA! LOCK THE DOOR AND HIDE RIGHT NOW!!
/delay 1.6sec
[Hana:shock]: Someone just knocked twice on my window from the outside...
/delay 1.8sec
[SYSTEM: 🎬 LIKE FOR PART 2]`
          }
        ]
      }
    }
  ];

  window.CHAT_HUB_MARKETPLACE_CATALOG = ORIGINAL_QUALITY_PACKS;
  window.ChatHubMarketplaceArt = {};
})();
