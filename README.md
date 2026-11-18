# 📱 Manhwa Chat Hub — Anime & Webtoon Comic Story Studio

[![GitHub License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![GitHub Pages](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-success.svg)](https://ranadixitdd.github.io/chat-hub/)
[![AI Ready](https://img.shields.io/badge/AI%20Standard-llms.txt%20Ready-purple.svg)](llms.txt)

**Manhwa Chat Hub** is a free, interactive web studio designed for content creators, animators, and webtoon storytellers to create, direct, and record viral anime and manhwa chat stories. Disguised as authentic **WhatsApp**, **ChatGPT 4o**, and **Google Gemini** interfaces, it provides built-in cinematic auto-playback, Solo Leveling system quest alerts, multi-sprite emotion wardrobes, meme stickers, and synchronized sound effects.

👉 **Live Web App:** [https://ranadixitdd.github.io/chat-hub/](https://ranadixitdd.github.io/chat-hub/)

---

## 🌟 Key Features

* **🎭 Multiverse App Switcher:** Seamlessly switch between WhatsApp Squad Chats, ChatGPT AI dialogues, and Gemini queries in the same story with realistic app-switching transitions.
* **⚡ Solo Leveling Holographic Quests:** Trigger futuristic neon quest popups with `[QUEST: mission objective]` or `/quest`.
* **👗 Multi-Sprite Character Wardrobe:** Characters dynamically change face avatars and emotion tags based on screenplay dialogue (`[Nobita:shock]`, `[Doraemon:angry]`, `[Nobita:cry]`).
* **🎬 Cinematic Auto-Play & Video Recording:** Auto punch-zooms, realistic typing suspense, dynamic reading pauses, and instant "Pure View" (press `H`) to record clean videos for **YouTube Shorts**, **Instagram Reels**, and **TikTok**.
* **🔊 Visual Sound Effects Engine:** Anime chimes, dramatic hits, comic pops, vine thuds, and custom character pitch tuning.
* **🖼️ Sticker & Meme Vault:** Built-in comic reaction stickers, Flork memes, and custom photo/audio uploads.
* **💾 Client-Side Storage & Backup:** Unlimited IndexedDB offline storage with one-click JSON backup export and restore.

---

## 📜 Screenplay Format (For AI & ChatGPT Script Importers)

You can copy and paste scripts directly into the **AI Script Importer** modal using this standardized format:

```text
[SCENE: WhatsApp Group]
[Doraemon:normal]: Hey Nobita, did you finish your homework?
[Nobita:cry]: Doraemon! Gian is chasing me again!!
[QUEST: ⚡ URGENT SURVIVAL MISSION: Evade Gian for 5 minutes without gadgets!]
[Nobita:shock]: What?! A System Quest appeared on my phone?!
[Doraemon:laugh]: [STICKER: Dorayaki Feast]
[Doraemon:smug]: Good luck, Hunter Nobita!
```

---

## 🚀 Quick Start (Local Development)

### Option 1: Via Node.js Server (Recommended)
Run the following in your terminal:
```bash
npm start
```
Or directly:
```bash
node server.js
```
Then open:
👉 **[http://localhost:3000](http://localhost:3000)**

### Option 2: Direct Browser Double-Click
Double-click `index.html` in your file explorer to open it in Chrome, Safari, Edge, Brave, or Firefox without any server required!

---

## 📱 How to Use on Mobile (Smartphone / Tablet)

1. **Connect to Same Wi-Fi:** Ensure your phone and PC share the same Wi-Fi network (or connect your phone to your PC's mobile hotspot).
2. **Open the IP link:** When running `npm start`, type the printed IP address into Safari or Chrome (e.g. `http://192.168.1.10:3000`).
3. **Install as PWA (Full-Screen):**
   * **iOS Safari:** Tap the **Share** button -> **"Add to Home Screen"**.
   * **Android Chrome:** Tap **Menu (⋮)** -> **"Install App"** / **"Add to Home screen"**.

---

## 📦 Backup & Data Portability

* **Download Full Backup:** Exports all custom characters, wardrobe emotion sprites, custom stickers, audio tracks, and story libraries into a single portable `.json` file.
* **Restore Backup:** Imports your JSON backup, writes it directly into IndexedDB, and restores your entire studio state with zero data loss.

---

## 📄 License

Open-source under the MIT License. Created by [Rana Dixit](https://github.com/ranadixitdd).
