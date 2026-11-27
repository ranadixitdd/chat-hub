# UNANSWERED QUESTIONS REQUIRING DEVELOPER / FOUNDER INPUT

> These strategic, legal, technical, and resource decisions cannot be safely guessed from the codebase or public market data. Clear answers from you will lock in the exact execution plan after this intelligence report.

---

### 1. Product Identity & Intellectual Property Strategy
1. **Are you willing to remove copyrighted characters (`Nobita`, `Doraemon`, `Shizuka`, `Gian`, `Sung Jinwoo`, `Gojo`, `Light/L`) and literal `WhatsApp`/`ChatGPT`/`Gemini` branding from official defaults?**
   - *Context:* Essential for App Store/Google Play approval, Stripe billing, and avoiding DMCA/trademark takedowns (while still allowing users to upload their own custom sprites locally).
2. **Which core product identity do you want to commit to first?**
   - *Option A (Recommended):* **Creator Video & Playable Episode Studio** (Shorts/TikTok/Reels creators + visual stage + chat + 1-click MP4 + web remix links).
   - *Option B:* **Interactive Story Reader App** (like Plotta/Webtoon with pre-made playable episodes).
   - *Option C:* **Open-Source Hobby Utility** (keep MIT free GitHub tool, zero commercial ambition).

### 2. Visual Direction (`Chat Bubbles` vs. `Full-Body Stage`)
3. **Should `stage_preview.html` (full-body characters + directional dialogue bubbles) be merged into the main app as a `[SCENE: stage]` mode, or replace round avatars as the primary view?**
4. **How will original multi-expression character art (`normal`, `angry`, `shock`, `cry`, `love`, `laugh`) be sourced legally?**
   - Commission freelance anime/manhwa illustrators for 8–12 signature original casts? Generate cleanly licensed base sheets + human cleanup? Build modular Gacha-style paper-doll layers?

### 3. Monetization & Budget Boundaries
5. **Given the financial math in `BUSINESS_MONETIZATION.md`, are you comfortable with a "Free Local Manual Studio + Paid Creator Pro (`\$9.99/mo`) / Voice-AI Credits / Asset Packs (`\$2.99–\$9.99`)" model?**
   - *Specifically:* If you strictly refuse *both* ads and *any* paid features/credits/packs, how would you fund server hosting, public story CDN bandwidth, TTS voice APIs, and moderation?
6. **What is your realistic monthly out-of-pocket budget and time commitment for the next 3–6 months?**
   - E.g., `\$0–\$200/mo` solo nights-and-weekends vs. `\$1,000+/mo` with freelance art/contract help?

### 4. Technology & Video Export Constraints
7. **Target Platform Priority:** Do you want to stay **Web-First PWA** (zero 30% app store tax on web Stripe, instant URL sharing) before wrapping for iOS/Android, or prioritize **Native Mobile Apps** immediately?
8. **AI Policy Preference:** For users who want script/voice AI inside the app, do you prefer:
   - **Prepaid Credits / Pro Tier** (best UX, you manage API keys & abuse rate limits), OR
   - **Bring-Your-Own-Key (BYO Gemini/OpenAI Key)** for zero server burn, OR
   - **No In-App AI at Launch** (focus 100% on visual acting, TTS voices, and MP4 video export first)?
9. **Open Source vs. Commercial Repo:** Currently `README.md` / `package.json` list **MIT / ISC open-source**. If you plan to build a commercial SaaS/Pro export/marketplace business, do you intend to keep the core editor open-source (`MIT`) and monetize cloud hosting/voices/packs, or transition future commercial modules to a private repo?

### 5. Creator & Audience Validation Willingness
10. **Are you ready to run the 3-week low-cost validation tests (`E1–E4` in `PRODUCT_ROADMAP.md`)—specifically posting 10–20 test Shorts/Reels and interviewing 10–15 actual Gacha/TextingStory creators—before writing major new backend features?**
