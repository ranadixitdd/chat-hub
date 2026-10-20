# 📱 Manhwa Chat Hub — WhatsApp Comic Studio

An interactive comic and chat story creator disguised as a WhatsApp / ChatGPT / Gemini messenger interface. Direct character dialogues, custom stickers, sound effects, meme brushes, and export your comic stories.

---

## 🚀 Quick Start (PC)

### Option 1: Via Node.js Server (Recommended)
Run the following in the project terminal:
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
You can also directly double-click `index.html` in your file explorer to open it in Chrome, Edge, Brave, or Firefox without starting a server!

---

## 📱 How to Use on Mobile (Smartphone / Tablet)

### Step 1: Connect to Same Wi-Fi
Ensure your **phone and PC are connected to the same Wi-Fi network** (or connect your phone to your PC's mobile hotspot).

### Step 2: Open the Mobile Link in Phone Browser
Look at the terminal output when running `npm start`. It will display your computer's local IP address:
```
📱 Mobile (Wi-Fi): http://<YOUR-PC-IP>:3000
```
*(For example: `http://10.168.92.167:3000`)*

Type this address into Safari (iPhone) or Chrome (Android).

### Step 3: Install as an App (Full-Screen Experience)
You can install this web app directly to your phone's home screen without downloading anything from the app store:
- **iPhone (iOS Safari):**
  1. Open the link in Safari.
  2. Tap the **Share** button (box with an upward arrow at the bottom).
  3. Scroll down and tap **"Add to Home Screen"**.
  4. Tap **Add**. The app icon will appear on your home screen and open in full-screen mode without browser bars!
- **Android (Chrome):**
  1. Open the link in Chrome.
  2. Tap the **Three Dots Menu (⋮)** in the top right.
  3. Tap **"Install app"** or **"Add to Home screen"**.
  4. Confirm and open it like a native mobile app!

---

## 💾 Where Data is Stored

### 1. Browser LocalStorage (Primary Storage)
All your active working data is stored **locally inside your web browser's `localStorage`**:
- **Active Story State**: `manhwa_whatsapp_comic_studio_v3` (stores current messages, active characters, custom avatars, active background wallpaper, audio and animation timings).
- **Saved Story Library**: `manhwa_saved_stories_library` (stores all saved story episodes you create).
- **UI Settings**: `wh_current_story_title`, `chathub_active_app` (WhatsApp, ChatGPT, or Gemini theme), `wh_chat_theme_style`.

> 🔒 **100% Private & Offline**: No messages, avatars, or media are uploaded to any third-party cloud server. Everything stays strictly inside your device's browser sandbox.

### 2. JSON Backup & Transfer (Disk / Downloads)
- Tap the **Menu (⋮)** in the studio header and select **Export JSON** or use the **Stories** manager to export.
- This downloads a `.json` file containing your entire story or script directly into your `Downloads` folder.
- You can transfer this JSON file between PC and Phone (via AirDrop, WhatsApp, Drive, or Email) and tap **Import JSON** to resume your story on any device!

### 3. Media Files & Custom Images
- Built-in backgrounds, meme stickers, and sound brushes are stored in the local [`assets/`](assets/) folder.
- Custom avatars and custom wallpapers you upload from your phone or PC are automatically compressed on-the-fly and stored as base64 Data URLs inside `localStorage` so they stay cached across browser reloads.

---

## 🌐 Free Public Web Hosting (Use from Anywhere without Wi-Fi)

To access your studio on mobile anywhere in the world (even when not on the same Wi-Fi), you can host this project completely free on:
- **Vercel** / **Netlify**: Drag and drop this folder onto netlify.com or deploy via GitHub.
- **GitHub Pages**: Push this repo to GitHub and enable Pages in repository settings.
- **Cloudflare Pages**: Link your repository for free worldwide hosting with SSL.
