# PRODUCT-MARKET FIT TEST, SCORING MATRIX & ROADMAP

---

## PART 1: PRODUCT-MARKET FIT (PMF) ASSESSMENT & VALIDATION PLAN (SECTION 8)

### Answering the 10 PMF Litmus Questions
1. **Is there real demand?** **YES** — proven by `20M+` TextingStory users (`4.6–4.7★`), `31.3B` anime + `\$7.6B–\$11.5B` webtoon markets, `15M+` Sekai user creations, and massive TikTok/Shorts manhwa/Gacha storytelling ecosystems **[VERIFIED]**.
2. **Is the target audience large enough?** **YES** — hundreds of thousands of Shorts/TikTok/Reels storytellers, GachaTubers, and indie fanfic/webtoon writers globally, plus tens of millions of mobile viewers.
3. **Are people already paying for similar experiences?** **YES** — creators pay for TextingStory Pro, CapCut Pro, ElevenLabs/TTS voices, and asset commissions; story players pay AI Dungeon (`\$14.99–\$99.99/mo`) and Plotta/Saylo token packs **[VERIFIED]**.
4. **Are existing solutions insufficient?** **YES** — TextingStory has flat SMS bubbles with zero anime acting; Gacha Life 2 requires weeks of manual screenshotting in CapCut; Plotta/Saylo trap stories inside energy walls and lack directorial control/video export.
5. **Is our proposed difference meaningful?** **CONDITIONAL YES** — *only* once `stage_preview.html` (full-body acting), 1-click MP4 export, TTS voices, and playable web sharing are unified. Today's WhatsApp-clone + external ChatGPT copy-paste is **not** meaningful enough.
6. **Will people return after their first session?** **NOT TODAY** (steep onboarding + manual copy-paste friction + no mobile export). **YES** once creators can produce a finished, voiced, downloadable Short in `<15 minutes` and see viewer engagement.
7. **Will creators continue producing content?** **YES**, if serialized cast/wardrobes carry cleanly across episodes and viewers demand `"Part 2"`.
8. **Will viewers become users?** **ONLY IF** clickable **Playable Web Episode Links** exist (`Watch Short → Tap Bio/Pinned Link → Play Alternate Ending → Remix`). Pure video viewers never discover an offline local HTML page on their own.
9. **What would make users abandon us?** (a) Mobile export failing; (b) Lost stories when browser storage clears; (c) Cheap SVG circle characters; (d) Confusing 4,000-word external ChatGPT prompt workflow; (e) Surprise paywalls or ads mid-scene.
10. **What is the smallest version worth launching?** A **focused Hybrid Chat + Full-Body Manhwa Stage Web Studio** featuring 8 original expressive characters, clean script editor, 1-click `9:16` MP4 export (with SFX/optional TTS), and 1-click publish to a shareable playable web link.

---

### Core PMF Hypothesis **[HYPOTHESIS]**
> *"If non-drawing anime/manhwa story creators can turn a short script into a high-energy 30–60 second `9:16` video (combining expressive full-body stage scenes, chat bubbles, Sakuga VFX, and audio) in under 15 minutes AND publish a playable branching web link, then **>=25% of activated creators will export a second story within 7 days**, and **>=4% of active creators will pay for Pro Export/Voices/Asset Packs** without any forced ads."*

---

### Low-Cost Validation Experiments (Run BEFORE Months of Heavy Engineering)

| # | Experiment | Target & Sample | Method & Cost (`<\$500` total) | Success Threshold (**PASS**) | Failure Threshold (**KILL / PIVOT**) |
|---|---|---|---|---|---|
| **E1** | **Short-Video Format Test** | Shorts / TikTok / Reels viewers (`20` clips) | Manually produce 10 `Chat-Only` clips vs. 10 `Hybrid Chat + Full-Body Stage` clips using current tools + screen capture. Cost: `\$0`. | Hybrid format beats Chat-Only on average 3s hold (`>65%`) & completion (`>45%`), generating organic `"what app is this?"` comments (`>=20` inquiries). | `<25%` completion or zero creator curiosity across 20 varied hooks. |
| **E2** | **Fake-Door Pricing & Export Landing Page** | Paid/organic Shorts & Discord creator traffic (`500` clicks) | Simple landing page contrasting Free Local Studio vs. `\$9.99/mo` Creator Pro (1-click HD MP4, TTS Voices, Cloud Sync, Clean Export) & `\$4.99` Character Packs. Cost: `~\$100–\$200`. | `>=12%` email/waitlist signup AND `>=4%` click intent on paid Pro/Pack checkout buttons. | `<5%` signup or `<1%` paid intent (means creators want 100% free only). |
| **E3** | **Concierge Creator Onboarding Interviews** | `15` GachaTubers / TextingStory creators | Watch them make 1 full episode live over Discord/screen-share with current studio + stage prototype. Cost: `\$0` (or `\$10` gift cards = `\$150`). | `>=10/15` finish a 30s story in `<25 min` and spontaneously ask to keep using it for their channel. | `>60%` rage-quit during asset setup, script formatting, or recording. |
| **E4** | **Playable Web Link Funnel Test** | Viewers of 10 test Shorts (`~50K+` views) | Pin link to an interactive web episode (`"Tap to unlock the secret ending!"`). Cost: `\$0` (static JSON viewer). | `>=1.5%` link CTR, `>=55%` web story completion, `>=5%` click `"Remix / Create Yours"`. | `<0.3%` CTR or `<20%` web completion (proves viewers won't leave TikTok/YT). |
| **E5** | **Micro-Contest Retention Pilot** | `30` seeded creators | Run 2-week `"Dungeon / Rom-Com Twist"` jam with `\$200` total prizes + original sprite packs; track D14 retention without cash incentives afterward. | `>=30%` of entrants publish an uncompensated follow-up story in Weeks 3–4. | `<10%` post again once prize stops (means growth was purely mercenary). |

---

## PART 2: OPPORTUNITY & PRIORITY SCORING ENGINE (SECTION 10)

### Transparent Scoring Formula
- **Positive Value Score (`PVS`)** = `(User Value × 0.20) + (Creator Value × 0.25) + (Revenue Potential × 0.25) + (Growth Potential × 0.15) + (Competitive Diff × 0.15)` *(Scale 1–10)*
- **Cost & Friction Penalty (`CFP`)** = `(Dev Complexity × 0.40) + (Operating Cost × 0.35) + (Technical Risk × 0.25)` *(Scale 1–10)*
- **Net Priority Score (`NPS`)** = `PVS − (0.45 × CFP)` *(Higher = build sooner; maximum theoretical ≈ `9.55`)*

| Feature / Initiative | User Val | Creator Val | Rev Pot | Growth Pot | Comp Diff | Dev Cplx | Op Cost | Tech Risk | **Net Priority Score** | Tier |
|---|---|---|---|---|---|---|---|---|---|---|
| **Security, XSS Sanitization, Storage Dedup & Clean Original IP Pack** | 7 | 8 | 6 | 5 | 6 | 4 | 1 | 2 | **5.48** | **A. Must-Have** |
| **Integrate Full-Body Stage (`stage_preview.html`) + Expressive Cast** | 9 | 9 | 7 | 8 | 9 | 5 | 2 | 3 | **6.88** | **A. Must-Have** |
| **Deterministic 1-Click 9:16 & 16:9 Video + Audio Export** | 7 | 10 | 9 | 9 | 7 | 7 | 2 | 6 | **6.30** | **A. Must-Have** |
| **Zero-Friction Visual Onboarding + Guided Script/Block Composer** | 8 | 9 | 6 | 7 | 5 | 4 | 1 | 2 | **6.10** | **A. Must-Have** |
| **Shareable Playable Web Episode Links + 1-Tap Remix** | 9 | 8 | 7 | 10 | 8 | 6 | 3 | 4 | **6.30** | **A. Must-Have** |
| **Pro Voice Acting (Metered TTS Credits) + Voice Cloning/Timing** | 8 | 9 | 9 | 7 | 7 | 5 | 6 | 4 | **5.85** | **B. High-Value** |
| **Optional In-App AI Script Co-Writer (Credit/BYO-Key Metered)** | 6 | 8 | 8 | 6 | 5 | 4 | 6 | 4 | **4.63** | **B. High-Value** |
| **Curated Premium Character & Stage Pack Store (1st-Party)** | 7 | 8 | 9 | 6 | 7 | 4 | 2 | 2 | **6.30** | **B. High-Value** |
| **Creator Marketplace (`70/30` Artist Pack Commissions)** | 7 | 8 | 8 | 7 | 7 | 7 | 4 | 6 | **4.98** | **C. Nice-to-Have (Phase 2–3)** |
| **Interactive Creator Profiles, Comments & Story Jam Feed** | 8 | 7 | 5 | 8 | 6 | 6 | 4 | 5 | **4.53** | **C. Nice-to-Have** |
| **Auto-Generated 15s Vertical Teaser + OG Social Cards** | 6 | 8 | 5 | 8 | 6 | 5 | 2 | 3 | **5.05** | **C. Nice-to-Have** |
| **B2B / EdTech Language Dialogue Mode (Clean Classroom Skin)** | 5 | 6 | 7 | 4 | 5 | 5 | 2 | 3 | **4.05** | **D. Experimental (Year 2)** |
| **Programmatic Script-to-Video REST API** | 3 | 5 | 7 | 4 | 6 | 8 | 7 | 7 | **1.68** | **D. Experimental (Year 2+)** |
| **Free Unlimited Cloud AI Character Chatbot (Character.AI Clone)** | 6 | 3 | 2 | 5 | 1 | 8 | 10 | 9 | **-0.43** | **E. AVOID** |
| **Real-Time Multiplayer Co-Op Editing** | 4 | 4 | 2 | 3 | 3 | 9 | 5 | 8 | **0.08** | **E. POSTPONE** |
| **Custom 3D Rigging / Keyframe Animation Engine** | 5 | 5 | 4 | 4 | 4 | 10 | 4 | 9 | **0.98** | **E. AVOID** |
| **White-Label Agency Portals / Custom Enterprise Deployments** | 2 | 2 | 5 | 1 | 2 | 8 | 5 | 6 | **-0.38** | **E. POSTPONE** |

---

## PART 3: PHASED DEVELOPMENT ROADMAP

### Phase 0: Pre-Launch Cleanup & PMF Validation *(Weeks 1–4)*
- **Goal:** Eliminate fatal security/legal risks and run Experiments `E1–E3` before writing heavy cloud infrastructure.
- **Deliverables:**
  1. Patch DOM XSS vectors (`app.js` URL sanitization + safe DOM text setters) & secure `server.js` (`127.0.0.1` bind + pairing token for LAN).
  2. Fix IndexedDB media deduplication (`assetId` references instead of duplicating base64 data per saved story).
  3. Replace copyrighted defaults (`Doraemon`, `Gojo`, `Solo Leveling`, `WhatsApp/ChatGPT/Gemini` trademarks) in official shipped presets with 8 clean original Manhwa/Anime cast packs (integrating `assets/characters/` art properly!) + remove `scripts/` Tenor scrapers.
  4. Simplify UI clutter (hide fake sidebar buttons in ChatGPT/Gemini modes; add 3-step guided starter flow).
  5. Execute `E1` (20 Shorts format test), `E2` (Pricing smoke page), `E3` (15 creator interviews).

### Phase 1: The Core Creator Engine *(Months 2–4 — Only if Phase 0 Passes)*
- **Goal:** Deliver the complete **No-Drawing Manhwa Chat + Stage Video Studio**.
- **Deliverables:**
  1. Integrate `stage_preview.html` as `[SCENE: stage]` inside the main timeline, synced with `SakugaFX` & `ChatHubVfx` + highlight tags (`<mark>`).
  2. Ship deterministic client-side **1-Click `9:16` / `16:9` Video Export** (Canvas/WebCodecs + Web Audio mixdown, with clean web/mobile fallback).
  3. Ship **Visual Block Timeline Composer** (so creators never have to memorize `[Name:expr:sfx]` brackets manually—while keeping screenplay paste as a Pro power import).
  4. Bundle **30+ original multi-expression character sprites & backdrops** (Hunter, Rom-Com, Mystery, Academy).

### Phase 2: Playable Sharing, Voice Acting & Monetization *(Months 5–8)*
- **Goal:** Activate the viral `Watch → Play → Remix` loop and sustainable revenue.
- **Deliverables:**
  1. **Playable Web Episode Hosting:** 1-click publish to `chathub.studio/s/<id>` with interactive `[CHOICE:]` playback, OpenGraph previews, and **"Remix Cast / Episode"** button.
  2. **Metered AI Voiceovers (TTS) + Optional Script Co-Pilot:** Powered strictly by prepaid credits / **Creator Pro (`\$9.99/mo`)** + optional **BYO API Key** mode.
  3. **First-Party Asset Store (`\$2.99–\$9.99` packs)** + Stripe checkout + subtle optional free-tier attribution pill.
  4. Automated content moderation + DMCA reporting queue for public shared stories.

### Phase 3: Creator Ecosystem & Scale *(Months 9–18)*
- **Goal:** Compound network effects once `>10K` active creators exist.
- **Deliverables:**
  1. **Community Artist Marketplace (`70/30` split)** for verified custom expression packs, stickers, and backgrounds.
  2. **Creator Profiles, Series Subscriptions & Voluntary Tipping**.
  3. **Native Mobile Wrapper (Capacitor / React Native shell)** for App Store & Google Play distribution (with clean original IP + age-safe guardrails).
  4. **Modular Codebase Refactor:** Break 11K-line `app.js` monolith into ES modules / TypeScript + virtualized stream rendering before team scaling.
