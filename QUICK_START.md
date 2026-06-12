# Quick Start Guide - Telegram Mini App

**Status:** ✅ All development complete, ready to deploy  
**Time to Production:** 30-60 minutes

---

## Current State

✅ All code implemented and tested  
✅ Build successful  
✅ Tests passing (10/10)  
✅ CI/CD configured  
🔄 **Awaiting:** Database setup + BotFather configuration

---

## 🚀 Deploy in 7 Steps

### Step 1: Generate JWT Secret (1 min)

```bash
openssl rand -base64 48
```

Copy the output - this is your `SESSION_JWT_SECRET`.

---

### Step 2: Set Up Database (5 min)

**Recommended: Neon (Free tier, perfect for Vercel)**

1. Go to https://neon.tech and sign up
2. Create a new project: `tg-miniapp`
3. Create database: `tgapp`
4. Copy TWO connection strings:
   - **Direct:** `postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech:5432/tgapp`
   - **Pooled:** `postgresql://user:pass@ep-xxx.pooler.us-east-2.aws.neon.tech:5432/tgapp`

---

### Step 3: Create Telegram Bot (3 min)

1. Open Telegram and find [@BotFather](https://t.me/BotFather)
2. Send: `/newbot`
3. Choose a name: "My Mini App Bot"
4. Choose a username: "my_miniapp_bot" (must end in `_bot`)
5. **Copy the token** - this is your `TELEGRAM_BOT_TOKEN`
   - Format: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`

---

### Step 4: Deploy to Vercel (10 min)

#### Option A: Vercel Dashboard (Easiest)

1. Go to https://vercel.com and sign in with GitHub
2. Click "Add New..." → "Project"
3. Import this repository: `Telegram App/tg-miniapp`
4. Configure:
   - **Framework Preset:** Next.js (auto-detected)
   - **Root Directory:** `tg-miniapp` (if in monorepo)
   - **Build Command:** `npm run build` (default)
5. Add **Environment Variables:**

```env
DATABASE_URL = <POOLED connection from Step 2>
TELEGRAM_BOT_TOKEN = <Token from Step 3>
SESSION_JWT_SECRET = <Output from Step 1>
NEXT_PUBLIC_APP_URL = https://your-project.vercel.app
INITDATA_MAX_AGE_SECONDS = 3600
```

6. Click **"Deploy"**
7. Wait 2-3 minutes for build to complete
8. Copy your deployment URL: `https://your-project.vercel.app`

#### Option B: Vercel CLI

```bash
# Install CLI
npm i -g vercel

# Login
vercel login

# Deploy from project directory
cd "/home/leader/projects/next/Telegram App/tg-miniapp"
vercel --prod

# Add environment variables via dashboard or CLI:
vercel env add DATABASE_URL production
vercel env add TELEGRAM_BOT_TOKEN production
vercel env add SESSION_JWT_SECRET production
vercel env add NEXT_PUBLIC_APP_URL production
vercel env add INITDATA_MAX_AGE_SECONDS production
```

---

### Step 5: Run Database Migrations (2 min)

```bash
# From your local machine
cd "/home/leader/projects/next/Telegram App/tg-miniapp"

# Use DIRECT connection (not pooled) for migrations
DATABASE_URL="postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech:5432/tgapp" \
  npx prisma migrate deploy
```

You should see:
```
✔ Prisma Migrate applied the following migration(s):
migrations/
  └─ 20260612000000_init/
    └─ migration.sql
```

---

### Step 6: Configure Web App in BotFather (3 min)

1. In Telegram, send to @BotFather: `/newapp`
2. Select your bot from Step 3
3. Fill in:
   - **Title:** "Mini App"
   - **Short name:** "app" (alphanumeric, 1-64 chars)
   - **Description:** "My Telegram Mini App"
   - **Photo:** Upload a 640x360 PNG (optional)
   - **GIF:** Skip for now
   - **Web App URL:** `https://your-project.vercel.app` (from Step 4)
4. Send to @BotFather: `/setmenubutton`
5. Select your bot
6. Choose: "Edit menu button URL"
7. Set URL: `https://your-project.vercel.app`
8. Set button text: "Open App" or "Launch"

---

### Step 7: Test (5 min)

1. Open your bot in Telegram (tap the link @BotFather gave you)
2. You should see a menu button in the bottom-left corner
3. Tap the menu button → App should open in WebView
4. Verify:
   - ✅ App loads without errors
   - ✅ Authentication succeeds (you see your name)
   - ✅ Theme matches Telegram (try switching to dark mode)
   - ✅ Locale switcher works (EN ↔ AR)
   - ✅ Arabic shows RTL layout

**Test on multiple clients:**
- iOS/Android: Native Telegram app
- Desktop: Telegram Desktop
- Web: https://web.telegram.org

---

## 🎉 You're Live!

Your Mini App is now accessible at: `https://t.me/your_bot/app`

**Share this link** or tell users to:
1. Open your bot: `@your_bot`
2. Tap the menu button (bottom-left)

---

## ⚙️ Optional: Set Up Monitoring (10 min)

### Health Check Monitoring (UptimeRobot - Free)

1. Go to https://uptimerobot.com and sign up
2. Click "Add New Monitor"
3. Settings:
   - **Monitor Type:** HTTP(s)
   - **Friendly Name:** "TG Mini App"
   - **URL:** `https://your-project.vercel.app/api/health`
   - **Monitoring Interval:** 5 minutes
   - **Alert Contacts:** Your email
4. Click "Create Monitor"

You'll get email alerts if the app goes down.

### Error Tracking (Sentry - Optional)

```bash
cd "/home/leader/projects/next/Telegram App/tg-miniapp"
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

Follow the prompts, then add `SENTRY_DSN` to Vercel environment variables.

---

## 🐛 Troubleshooting

### "This app is not available"
**Cause:** Telegram can't reach your URL  
**Fix:**
1. Verify URL is HTTPS (required!)
2. Test in browser: `curl -I https://your-project.vercel.app`
3. Check Vercel deployment logs

### Authentication fails (shows "Authentication failed")
**Cause:** initData validation failing  
**Fix:**
1. Verify `TELEGRAM_BOT_TOKEN` is correct in Vercel
2. Check Vercel logs: `vercel logs`
3. Look for "initData rejected" messages
4. Increase `INITDATA_MAX_AGE_SECONDS` to 7200 if clock skew

### Theme not applying
**Cause:** Only works in Telegram WebView  
**Fix:**
- This is expected behavior when testing in browser
- Test in actual Telegram app

### Database connection errors
**Cause:** Wrong connection string or connection limit  
**Fix:**
1. Verify using **pooled** connection string in Vercel
2. Check Neon dashboard for connection limits
3. Restart Vercel deployment: `vercel --prod`

### Arabic layout looks wrong
**Cause:** Font not loading  
**Fix:**
1. Check browser console for errors
2. Verify Noto Sans Arabic loads in Network tab
3. Test on actual device (font may not render in desktop WebView)

---

## 📊 Check Health

```bash
# API health check
curl https://your-project.vercel.app/api/health

# Should return:
# {"status":"ok","db":"ok"}

# If DB is down:
# {"status":"degraded","db":"unreachable"}
```

---

## 🔐 Security Checklist

Before announcing to users:

- [ ] `TELEGRAM_BOT_TOKEN` is set as secret (not `NEXT_PUBLIC_`)
- [ ] `SESSION_JWT_SECRET` is at least 48 bytes random
- [ ] `DATABASE_URL` uses pooled connection
- [ ] HTTPS is working (test: `curl -I https://...`)
- [ ] `/api/health` returns 200
- [ ] Rate limiting works (spam auth endpoint → should get 429)
- [ ] No secrets in git history (`git log --all --full-history -- .env`)

---

## 📈 Next Steps (Post-Launch)

1. **Monitor Usage**
   - Check Vercel Analytics dashboard
   - Review Neon database usage
   - Set up alerts for errors

2. **Gather Feedback**
   - Add feedback button in app
   - Monitor user complaints

3. **Scale if Needed**
   - Vercel free tier: 100GB bandwidth/month
   - Neon free tier: 0.5GB storage, 3GB bandwidth
   - Upgrade when limits are reached

4. **Add Features**
   - See `PROJECT_STATUS.md` → "Recommended Enhancements"
   - Push notifications via Bot API
   - User analytics
   - Admin dashboard

---

## 📚 Documentation

- **Full Status Report:** `PROJECT_STATUS.md`
- **Deployment Details:** `DEPLOYMENT.md`
- **API Documentation:** See `src/app/api/*/route.ts` files
- **Architecture:** See `.verdent/AR Production Plan`

---

## 🆘 Getting Help

**Logs:**
```bash
# Vercel logs (real-time)
vercel logs --follow

# Check specific deployment
vercel logs <deployment-url>
```

**Database:**
```bash
# Open Prisma Studio
npm run prisma:studio

# Check schema
npx prisma validate
```

**Local Development:**
```bash
# Start dev server
npm run dev

# Run tests
npm run test

# Type check
npm run typecheck
```

---

## 🎯 Success Criteria

You're ready to announce when:

✅ App opens from bot menu button  
✅ Authentication works on all 4 Telegram clients  
✅ Theme matches Telegram (test light/dark)  
✅ Both EN and AR locales work  
✅ Health check returns OK  
✅ No console errors  
✅ Rate limiting prevents spam (tested)  
✅ Monitoring is set up (UptimeRobot)  

---

**Estimated Total Time:** 30-60 minutes  
**Cost:** $0/month (free tiers for Vercel + Neon)  
**Next Billing Threshold:** ~1,000 monthly active users

---

**Ready to deploy?** Start with Step 1! 🚀
