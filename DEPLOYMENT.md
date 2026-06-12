# Deployment Guide

This guide covers deploying the Telegram Mini App to production environments.

## Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Environment Variables](#environment-variables)
3. [Database Setup](#database-setup)
4. [Deployment Options](#deployment-options)
   - [Vercel (Recommended)](#vercel-recommended)
   - [Docker + VPS](#docker--vps)
   - [Other Platforms](#other-platforms)
5. [BotFather Configuration](#botfather-configuration)
6. [Post-Deployment](#post-deployment)
7. [Monitoring](#monitoring)

## Pre-Deployment Checklist

Before deploying, ensure:

- [ ] **Strong secrets generated**
  ```bash
  openssl rand -base64 48  # SESSION_JWT_SECRET
  ```
- [ ] **Production database provisioned** (Neon, Supabase, or AWS RDS)
- [ ] **Bot token obtained** from [@BotFather](https://t.me/BotFather)
- [ ] **Domain/subdomain ready** with HTTPS (required by Telegram)
- [ ] **All tests passing**
  ```bash
  npm run test
  npm run typecheck
  npm run lint
  ```
- [ ] **Production build successful**
  ```bash
  npm run build
  ```

## Environment Variables

### Required Production Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection (pooled) | `postgresql://user:pass@host.region.neon.tech:5432/db?sslmode=require` |
| `TELEGRAM_BOT_TOKEN` | Bot token from @BotFather | `123456789:ABCdefGHIjklMNOpqrsTUVwxyz` |
| `SESSION_JWT_SECRET` | 48+ byte random secret | Output of `openssl rand -base64 48` |
| `NEXT_PUBLIC_APP_URL` | Public HTTPS URL | `https://app.example.com` |
| `INITDATA_MAX_AGE_SECONDS` | Auth window (3600 = 1 hour) | `3600` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `LOG_LEVEL` | Logging verbosity | `info` |
| `NODE_ENV` | Environment | `production` |

## Database Setup

### 1. Choose a Provider

**Neon (Recommended for Vercel)**
- Free tier available
- Serverless Postgres with connection pooling
- Auto-pause when idle
- [Sign up](https://neon.tech)

**Supabase**
- Free tier with 500MB database
- Built-in connection pooler (PgBouncer)
- [Sign up](https://supabase.com)

**AWS RDS**
- Full PostgreSQL control
- Requires VPC configuration
- Use RDS Proxy for connection pooling

### 2. Create Database

```sql
CREATE DATABASE tgapp;
```

### 3. Get Connection Strings

You need **two** connection strings:

1. **Direct connection** (for migrations in CI/CD):
   ```
   postgresql://user:pass@host:5432/tgapp?sslmode=require
   ```

2. **Pooled connection** (for serverless runtime):
   ```
   postgresql://user:pass@pooler.host:5432/tgapp?sslmode=require
   ```

For Neon, the pooled endpoint ends with `.pooler.neon.tech`.
For Supabase, use the connection string with port `6543` (PgBouncer).

### 4. Run Migrations

In CI/CD or manually:

```bash
DATABASE_URL="<direct-connection>" npm run prisma:deploy
```

## Deployment Options

### Vercel (Recommended)

#### Via Vercel Dashboard

1. **Connect Repository**
   - Go to [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Select your GitHub repository

2. **Configure Build Settings**
   - Framework Preset: **Next.js**
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)
   - Install Command: `npm ci` (default)

3. **Set Environment Variables**
   Go to Project Settings → Environment Variables:
   
   ```
   DATABASE_URL = postgresql://...pooler...
   TELEGRAM_BOT_TOKEN = 123456:ABC...
   SESSION_JWT_SECRET = <openssl output>
   NEXT_PUBLIC_APP_URL = https://your-project.vercel.app
   INITDATA_MAX_AGE_SECONDS = 3600
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete

5. **Run Migrations**
   After first deploy, run migrations via Vercel CLI:
   
   ```bash
   npm i -g vercel
   vercel login
   vercel env pull .env.production
   DATABASE_URL="<direct-connection>" npx prisma migrate deploy
   ```

#### Via Vercel CLI

```bash
npm i -g vercel
vercel login
vercel --prod
```

### Docker + VPS

#### 1. Build Image

```bash
docker build -t tg-miniapp .
```

#### 2. Run Container

```bash
docker run -d \
  --name tg-miniapp \
  -p 3000:3000 \
  -e DATABASE_URL="postgresql://..." \
  -e TELEGRAM_BOT_TOKEN="123456:ABC..." \
  -e SESSION_JWT_SECRET="<secret>" \
  -e NEXT_PUBLIC_APP_URL="https://app.example.com" \
  -e INITDATA_MAX_AGE_SECONDS="3600" \
  tg-miniapp
```

#### 3. Nginx Reverse Proxy with SSL

Create `/etc/nginx/sites-available/tg-miniapp`:

```nginx
server {
    listen 443 ssl http2;
    server_name app.example.com;

    ssl_certificate /etc/letsencrypt/live/app.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/app.example.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

server {
    listen 80;
    server_name app.example.com;
    return 301 https://$server_name$request_uri;
}
```

Enable and reload:

```bash
sudo ln -s /etc/nginx/sites-available/tg-miniapp /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### 4. SSL Certificate (Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d app.example.com
```

#### 5. Run Migrations

From the container or host:

```bash
docker exec tg-miniapp npx prisma migrate deploy
```

### Other Platforms

#### Railway

1. Create new project from GitHub repo
2. Add PostgreSQL service
3. Set environment variables
4. Deploy automatically on push

#### Render

1. Create new Web Service
2. Connect GitHub repository
3. Build command: `npm ci && npm run prisma:generate && npm run build`
4. Start command: `npm start`
5. Add PostgreSQL database
6. Set environment variables

#### DigitalOcean App Platform

1. Create new app from GitHub
2. Add managed PostgreSQL database
3. Configure environment variables
4. Deploy

## BotFather Configuration

### 1. Create Bot (if not done)

Open [@BotFather](https://t.me/BotFather):

```
/newbot
# Follow prompts to get your TELEGRAM_BOT_TOKEN
```

### 2. Create Web App

```
/newapp
# Select your bot
# Set name: "My Mini App"
# Set short name: "myapp"
# Upload 640x360 PNG icon
# Set Web App URL: https://app.example.com
# Set description
```

You'll receive a Web App URL like: `https://t.me/mybot/myapp`

### 3. Configure Menu Button

```
/setmenubutton
# Select your bot
# Choose "Edit menu button URL"
# Set URL: https://app.example.com
# Set button text: "Open App"
```

### 4. Test

Open your bot and click the menu button (bottom left). The app should open in Telegram's WebView.

## Post-Deployment

### 1. Smoke Tests

Test critical paths:

```bash
# Health check
curl https://app.example.com/api/health

# Should return: {"status":"ok","db":"ok"}
```

### 2. Manual Testing Matrix

Test on all Telegram clients:

- [ ] **iOS** (iPhone/iPad)
- [ ] **Android**
- [ ] **Desktop** (Windows/macOS/Linux)
- [ ] **Web** (https://web.telegram.org)

For each client:
- [ ] App opens from menu button
- [ ] Authentication succeeds
- [ ] Theme matches Telegram (test light/dark/custom)
- [ ] English locale renders correctly
- [ ] Arabic locale renders with RTL layout
- [ ] Locale switcher works
- [ ] No console errors

### 3. Security Verification

```bash
# Check security headers
curl -I https://app.example.com

# Should include:
# Content-Security-Policy: frame-ancestors https://web.telegram.org ...
# X-Content-Type-Options: nosniff
# Referrer-Policy: strict-origin-when-cross-origin
```

### 4. Rate Limit Test

```bash
# Hammer the auth endpoint (should return 429)
for i in {1..20}; do
  curl -X POST https://app.example.com/api/auth/telegram \
    -H "Content-Type: application/json" \
    -d '{"initData":"invalid"}' &
done
```

## Monitoring

### Health Checks

Set up uptime monitoring:

**UptimeRobot** (Free)
- Add HTTP(s) monitor
- URL: `https://app.example.com/api/health`
- Interval: 5 minutes
- Alert via email/SMS/Slack

**Vercel** (Built-in for Vercel deployments)
- Automatically monitors deployments
- Alerts on build failures

### Error Tracking

**Sentry** (Recommended)

1. Install:
   ```bash
   npm install @sentry/nextjs
   ```

2. Initialize:
   ```bash
   npx @sentry/wizard@latest -i nextjs
   ```

3. Set `SENTRY_DSN` environment variable

4. Errors automatically captured from:
   - Server-side API routes
   - Client-side components
   - Error boundaries

### Logging

**Production logs via Vercel:**
```bash
vercel logs <deployment-url>
```

**Docker logs:**
```bash
docker logs -f tg-miniapp
```

**Structured JSON logs** (via pino) can be shipped to:
- Datadog
- LogDNA
- Logtail
- Papertrail

## Rollback Procedure

### Vercel

```bash
# List deployments
vercel ls

# Promote previous deployment
vercel promote <deployment-url>
```

### Docker

```bash
# Tag current as backup
docker tag tg-miniapp:latest tg-miniapp:backup

# Pull and run previous image
docker stop tg-miniapp
docker rm tg-miniapp
docker run -d ... tg-miniapp:backup
```

### Database Rollback

Prisma migrations are **forward-only** by default. To rollback:

1. Identify the migration to revert
2. Manually write a rollback migration
3. Apply via `prisma migrate deploy`

⚠️ **Always backup the database before schema changes!**

## Troubleshooting

### Issue: "This app is not available"

**Cause:** Telegram can't reach your URL

**Fix:**
1. Verify HTTPS is working: `curl -I https://app.example.com`
2. Check CSP headers allow Telegram iframes
3. Ensure no `X-Frame-Options: DENY` header

### Issue: Authentication fails (401)

**Cause:** initData validation failing

**Debug:**
1. Check server logs for "initData rejected"
2. Verify `TELEGRAM_BOT_TOKEN` matches the bot
3. Check `INITDATA_MAX_AGE_SECONDS` (increase if clock skew)

### Issue: Database connection errors

**Cause:** Connection limit reached or wrong connection string

**Fix:**
1. Verify using **pooled** connection string
2. Check database provider connection limits
3. Review Prisma connection pool settings

### Issue: Theme not applying

**Cause:** Telegram SDK not loaded or CSP blocking

**Fix:**
1. Check `telegram-web-app.js` loads before React hydration
2. Verify CSP doesn't block Telegram scripts
3. Test in actual Telegram (themes don't work in browser)

## CI/CD Pipeline

The project includes GitHub Actions workflows:

### `.github/workflows/ci.yml`
Runs on every push/PR:
- Linting
- Type checking
- Unit tests
- Build verification

### `.github/workflows/deploy.yml`
Runs on push to `main`:
- Database migrations (`prisma deploy`)
- Production build
- Deployment (Vercel or Docker)
- Health check
- Notifications

### Required GitHub Secrets

Go to Repository Settings → Secrets and Variables → Actions:

```
DATABASE_URL
TELEGRAM_BOT_TOKEN
SESSION_JWT_SECRET
NEXT_PUBLIC_APP_URL
INITDATA_MAX_AGE_SECONDS
```

Optional (for Vercel):
```
VERCEL_TOKEN
VERCEL_ORG_ID
VERCEL_PROJECT_ID
```

Optional (for Docker):
```
DOCKER_REGISTRY
DOCKER_IMAGE
```

## Cost Estimates

### Free Tier (Development/Low Traffic)

- **Hosting:** Vercel (Free tier: 100GB bandwidth/month)
- **Database:** Neon (Free tier: 0.5GB storage, 3GB bandwidth/month)
- **Domain:** Cloudflare (Free SSL)
- **Monitoring:** UptimeRobot (Free: 50 monitors)

**Total:** $0/month for low traffic

### Production (Medium Traffic)

- **Hosting:** Vercel Pro ($20/month)
- **Database:** Neon Pro ($10-50/month based on usage)
- **Domain:** Namecheap (~$10/year)
- **Monitoring:** Sentry (~$26/month)

**Total:** ~$60-100/month

### Enterprise (High Traffic)

- **Hosting:** VPS (DigitalOcean Droplet $40-80/month)
- **Database:** Managed PostgreSQL ($60+/month)
- **CDN:** Cloudflare Pro ($20/month)
- **Monitoring:** Datadog/New Relic ($100+/month)

**Total:** ~$220+/month

## Support

For deployment issues:
1. Check [Next.js Deployment Docs](https://nextjs.org/docs/deployment)
2. Check [Prisma Deployment Docs](https://www.prisma.io/docs/guides/deployment)
3. Review this repository's Issues
4. Telegram Mini Apps: https://core.telegram.org/bots/webapps
