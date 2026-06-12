# How to Make Your Telegram Bot Work

## Why You're Seeing "Open in Telegram"

You're opening the app in a **web browser** (like Chrome, Firefox, etc.). This app is designed to **only work inside Telegram**.

Think of it like:
- ❌ Opening a Facebook Messenger chat link in your browser → shows a message
- ✅ Opening it in the Messenger app → works perfectly

Same thing here!

---

## Why `/start` Does Nothing

Your bot isn't configured yet! Right now your bot is like an empty shell. You need to:
1. Tell the bot about your app (create a Web App)
2. Add a menu button that opens the app
3. Click that button to open the app

`/start` is just a text command - it won't open a Web App.

---

## How to Fix This (3 Steps)

### Step 1: Expose Your Local Server with HTTPS

Telegram requires HTTPS (secure connection), even for testing. Your app is running on:
```
http://localhost:3002
```

But Telegram can't access this because:
- ❌ It's on your computer (not on the internet)
- ❌ It's HTTP, not HTTPS

**Solution: Create a secure tunnel**

#### Option A: Using Cloudflare Tunnel (Free, Easy)

Open a **new terminal** and run:

```bash
npx cloudflared tunnel --url http://localhost:3002
```

You'll see output like:
```
Your quick Tunnel has been created! Visit it at (it may take some time to be reachable):
https://random-word-1234.trycloudflare.com
```

**Copy that HTTPS URL!** (Something like `https://random-word-1234.trycloudflare.com`)

#### Option B: Using ngrok (Alternative)

If you have ngrok installed:

```bash
ngrok http 3002
```

You'll get a URL like: `https://xyz123.ngrok-free.app`

**Leave this terminal running!** The tunnel needs to stay open.

---

### Step 2: Configure Your Bot in BotFather

Now you need to tell Telegram about your app.

#### 2.1: Create a Web App

1. Open Telegram and find **@BotFather**
2. Send this command:
   ```
   /newapp
   ```

3. BotFather will ask: "Choose a bot"
   - Select your bot from the list

4. Fill in the details:
   - **Title:** `Mini App` (or any name you want)
   - **Short name:** `app` (alphanumeric, lowercase, no spaces)
   - **Description:** `My Telegram Mini App`
   - **Photo:** You can skip this (send `/empty`)
   - **GIF:** You can skip this (send `/empty`)
   - **Web App URL:** Paste the HTTPS URL from Step 1
     ```
     https://random-word-1234.trycloudflare.com
     ```

5. BotFather will confirm with a link like:
   ```
   https://t.me/your_bot/app
   ```

#### 2.2: Add a Menu Button

1. In BotFather, send:
   ```
   /setmenubutton
   ```

2. Choose your bot from the list

3. BotFather asks: "Choose action"
   - Select **"Edit menu button URL"**

4. Enter the same HTTPS URL:
   ```
   https://random-word-1234.trycloudflare.com
   ```

5. BotFather asks for button text:
   ```
   Open App
   ```
   (or any text like "Launch", "Start", etc.)

6. Done! BotFather confirms the menu button is set.

---

### Step 3: Open Your Bot and Test

1. **Find your bot** in Telegram
   - Search for your bot's username
   - Or tap the link BotFather gave you

2. **Look at the bottom-left corner**
   - You should see a **menu button** (looks like ☰ or has your button text)

3. **Tap the menu button**
   - Your app will open **inside Telegram**
   - You should see the app interface (not the "Open in Telegram" message)
   - Authentication should happen automatically

---

## What Should Happen

### ✅ When Working Correctly

1. Tap menu button in your bot
2. App opens in Telegram (WebView)
3. You see your Telegram name/username
4. Theme matches your Telegram theme (dark/light)
5. You can switch languages (EN ↔ AR)

### ❌ Common Issues

#### Issue 1: "This app is not available"

**Cause:** Tunnel URL is wrong or tunnel stopped

**Fix:**
- Make sure tunnel is still running (don't close that terminal)
- Check the tunnel URL is correct in BotFather
- Try creating a new tunnel

#### Issue 2: "Failed to load page"

**Cause:** Dev server not running

**Fix:**
```bash
# In the project directory
npm run dev
```

Keep this running!

#### Issue 3: Still seeing "Open in Telegram" inside Telegram

**Cause:** App thinks it's in a browser, not Telegram

**Fix:**
- Make sure you opened it from the **menu button** (not by pasting the URL in browser)
- Clear Telegram cache: Settings → Data and Storage → Clear Cache

#### Issue 4: Authentication fails

**Cause:** Bot token mismatch or validation failing

**Fix:**
- Check your bot token in `.env` matches the bot you're configuring
- Check server logs for errors
- Make sure the HTTPS tunnel is working

---

## Visual Guide

### Where's the Menu Button?

Open your bot in Telegram and look here:

```
┌─────────────────────────────┐
│  Your Bot Name             ×│
├─────────────────────────────┤
│                             │
│  (Chat messages appear      │
│   here)                     │
│                             │
│                             │
├─────────────────────────────┤
│ ☰  [Type a message...]     ↗│ ← Menu button is the ☰ icon
└─────────────────────────────┘
```

**Tap the ☰ icon** (or button with your custom text) to open the app!

---

## Testing Checklist

Once you've done all 3 steps:

- [ ] Dev server is running (`npm run dev`)
- [ ] Tunnel is running and shows HTTPS URL
- [ ] Web App created in BotFather with tunnel URL
- [ ] Menu button set in BotFather with tunnel URL
- [ ] Menu button appears in bot (bottom-left)
- [ ] Tapping menu button opens the app
- [ ] App shows inside Telegram (not browser)
- [ ] You see your Telegram name/info
- [ ] Theme matches Telegram

---

## Quick Summary

### What You Need Running

**Terminal 1:** Dev server
```bash
cd "/home/leader/projects/next/Telegram App/tg-miniapp"
npm run dev
```

**Terminal 2:** Tunnel (for HTTPS)
```bash
npx cloudflared tunnel --url http://localhost:3002
```

**Don't close either terminal!** Both need to stay running.

### What to Configure in BotFather

1. `/newapp` → Create Web App with tunnel URL
2. `/setmenubutton` → Add menu button with tunnel URL

### How to Open the App

**❌ Wrong:**
- Sending `/start` to the bot
- Opening the tunnel URL in Chrome/Firefox
- Pasting the link in Telegram chat

**✅ Right:**
- Open your bot in Telegram
- Tap the **menu button** (bottom-left)
- App opens inside Telegram

---

## Still Not Working?

### Check These Things

1. **Is dev server running?**
   ```bash
   curl http://localhost:3002/api/health
   # Should show: {"status":"ok","db":"ok"}
   ```

2. **Is tunnel working?**
   - Visit the HTTPS URL in your browser
   - You should see the "Open in Telegram" message
   - If you see "Unable to connect", tunnel is down

3. **Is bot token correct?**
   - Open `.env` file
   - Make sure `TELEGRAM_BOT_TOKEN` matches your bot

4. **Did you configure the RIGHT bot?**
   - Make sure the bot in BotFather matches your token
   - Check bot username: Search for your bot in Telegram

5. **Check logs:**
   ```bash
   # In the terminal running npm run dev
   # Look for errors when you tap the menu button
   ```

---

## What's Next?

Once your app is working in Telegram:

1. **Test Authentication**
   - Your Telegram info should appear
   - Check database: User should be created

2. **Test Theme Sync**
   - Switch Telegram theme (Settings → Chat Settings → Theme)
   - App colors should change automatically

3. **Test Languages**
   - Tap language switcher (top-right)
   - Switch between English and Arabic
   - Arabic should show RTL (right-to-left) layout

4. **Test on Multiple Devices**
   - iOS Telegram
   - Android Telegram
   - Desktop Telegram
   - Web Telegram (https://web.telegram.org)

---

## Need Help?

### Show Me Your Setup

If it's still not working, share:

1. **Tunnel URL:** The HTTPS link from cloudflared/ngrok
2. **Bot Username:** Your bot's @username
3. **Error Message:** Screenshot or exact error text
4. **Server Logs:** Copy the output from `npm run dev` terminal

### Common Questions

**Q: Do I need to keep the tunnel running forever?**  
A: Only during development. For production, deploy to Vercel/Railway (they give you permanent HTTPS).

**Q: Can others test my app?**  
A: Yes! Anyone who opens your bot can use the app (while your tunnel is running).

**Q: Is this secure?**  
A: For development, yes. The tunnel is temporary. For production, deploy properly.

**Q: Can I use my own domain?**  
A: Yes! Once you deploy to production, use your real domain (like `https://myapp.com`).

---

**Good luck! Your app should work once you follow these 3 steps.** 🚀

---

## Quick Reference Card

```
┌─────────────────────────────────────────────┐
│  TELEGRAM BOT SETUP QUICK REFERENCE         │
├─────────────────────────────────────────────┤
│                                             │
│  Step 1: Start Dev Server                  │
│  $ npm run dev                              │
│  → Running on http://localhost:3002         │
│                                             │
│  Step 2: Create Tunnel                     │
│  $ npx cloudflared tunnel --url :3002      │
│  → Copy the https://... URL                 │
│                                             │
│  Step 3: Configure Bot                     │
│  Open @BotFather in Telegram:              │
│  /newapp → Set Web App URL                 │
│  /setmenubutton → Set button URL           │
│                                             │
│  Step 4: Test                              │
│  Open bot → Tap menu button (☰)            │
│                                             │
└─────────────────────────────────────────────┘
```
