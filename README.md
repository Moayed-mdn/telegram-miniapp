# Telegram Mini App

A production-ready Telegram Web App (Mini App) built with Next.js 15, featuring secure authentication, RTL support for Arabic, and automatic theme adaptation.

[![Open in Telegram](https://img.shields.io/badge/Open%20in-Telegram-blue?style=for-the-badge&logo=telegram)](https://t.me/my_miniapp_moayad_bot/app)
[![Live Demo](https://img.shields.io/badge/Live-Demo-success?style=for-the-badge)](https://ephemeral-squirrel-4a4d16.netlify.app/)

## 🚀 Live Demo

- **Telegram Bot:** [@my_miniapp_moayad_bot](https://t.me/my_miniapp_moayad_bot/app)
- **Web App URL:** https://ephemeral-squirrel-4a4d16.netlify.app/
- **Deploy Status:** [![Netlify Status](https://api.netlify.com/api/v1/badges/YOUR_SITE_ID/deploy-status)](https://app.netlify.com/sites/ephemeral-squirrel-4a4d16/deploys)

> **Note:** The app is designed to work inside Telegram. Open it via the bot link above for the full experience with user authentication and theme integration.

## ✨ Features

- 🔒 **Secure Authentication**: Server-side HMAC-SHA256 validation of Telegram initData
- 🎨 **Theme Integration**: Automatic adaptation to Telegram's light/dark/custom themes
- 🌍 **Bilingual**: English (LTR) and Arabic (RTL) with locale-specific routing
- ⚡ **Modern Stack**: Next.js 15, TypeScript, Prisma 6, PostgreSQL
- 🎯 **Type-Safe**: Full TypeScript coverage with Zod validation
- 🧪 **Tested**: Unit tests for critical security components
- 📱 **Responsive**: Works across Telegram iOS, Android, Desktop, and Web clients

## 🛠️ Tech Stack

| Concern | Technology |
|---------|-----------|
| Framework | Next.js 15 (App Router, TypeScript, RSC) |
| Database | Prisma 6 + PostgreSQL |
| UI | Tailwind CSS v4 + shadcn/ui |
| Auth | jose JWT (httpOnly cookies) |
| i18n | next-intl (EN/AR with RTL support) |
| State | Zustand + TanStack Query v5 |
| Validation | Zod |
| Testing | Vitest |
| Logging | pino |

## 🚀 Getting Started

### Prerequisites

- Node.js 20+ or 22+
- PostgreSQL database (local or hosted: Neon, Supabase, RDS)
- Telegram Bot Token (from [@BotFather](https://t.me/BotFather))

### Installation

1. **Clone and install dependencies:**

```bash
cd tg-miniapp
npm install
```

2. **Set up environment variables:**

Copy `.env.example` to `.env` and fill in your values:

```bash
DATABASE_URL="postgresql://user:pass@host:5432/tgapp?sslmode=require"
TELEGRAM_BOT_TOKEN="123456:ABC-..." # from @BotFather
SESSION_JWT_SECRET="" # generate with: openssl rand -base64 48
NEXT_PUBLIC_APP_URL="http://localhost:3000"
INITDATA_MAX_AGE_SECONDS="3600"
```

3. **Initialize the database:**

```bash
npm run prisma:migrate
npm run prisma:generate
```

4. **Start the development server:**

```bash
npm run dev
```

The app will be available at `http://localhost:3000`.

### Local Testing with Telegram

Telegram requires HTTPS even in development. Use a tunnel:

**Option 1: Cloudflare Tunnel**
```bash
npx cloudflared tunnel --url http://localhost:3000
```

**Option 2: ngrok**
```bash
ngrok http 3000
```

Then configure your bot with [@BotFather](https://t.me/BotFather):
1. `/newapp` → attach to your bot → set the HTTPS URL from tunnel
2. `/setmenubutton` → set menu button to launch the app

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm test` | Run unit tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run typecheck` | Check TypeScript types |
| `npm run prisma:generate` | Generate Prisma Client |
| `npm run prisma:migrate` | Run database migrations (dev) |
| `npm run prisma:deploy` | Deploy migrations (production) |
| `npm run prisma:studio` | Open Prisma Studio |

## 🏗️ Project Structure

```
src/
├── app/
│   ├── [locale]/              # EN/AR locale routing
│   │   ├── layout.tsx        # Root layout with dir switching
│   │   ├── page.tsx          # Home page
│   │   └── error.tsx         # Error boundary
│   ├── api/
│   │   ├── auth/telegram/    # Auth endpoint (initData validation)
│   │   ├── user/locale/      # User locale preference API
│   │   └── health/           # Health check endpoint
│   ├── global-error.tsx      # Global error fallback
│   └── globals.css           # Tailwind + theme bridge
├── components/
│   ├── ui/                   # shadcn/ui primitives
│   └── providers/
│       ├── telegram-provider.tsx  # Telegram SDK integration
│       └── query-provider.tsx     # TanStack Query setup
├── i18n/
│   ├── routing.ts            # Locale configuration
│   ├── request.ts            # next-intl setup
│   └── navigation.ts         # Typed navigation helpers
├── lib/
│   ├── telegram/
│   │   ├── validate-init-data.ts      # HMAC-SHA256 validator
│   │   └── validate-init-data.test.ts # Security tests
│   ├── auth/session.ts       # JWT verification
│   ├── prisma.ts             # Singleton Prisma client
│   ├── logger.ts             # Structured logging
│   ├── rate-limit.ts         # Token bucket limiter
│   └── utils.ts              # cn() helper
├── hooks/
│   └── use-telegram-buttons.ts  # BackButton/MainButton hooks
├── stores/
│   └── ui-store.ts           # Zustand UI state
├── types/
│   └── telegram.d.ts         # Telegram WebApp types
└── middleware.ts             # next-intl middleware

prisma/
└── schema.prisma             # Database schema

messages/
├── en.json                   # English translations
└── ar.json                   # Arabic translations
```

## 🔐 Security Features

### 1. initData Validation (HMAC-SHA256)
Server-side cryptographic verification of Telegram's `initData` parameter:
- HMAC secret derived from bot token
- Timing-safe comparison (prevents timing attacks)
- Auth date replay protection (configurable max age)
- Never trusts client-provided `initDataUnsafe`

### 2. Session Management
- JWT stored in `httpOnly; secure; sameSite=none` cookie
- 24-hour expiration with automatic refresh
- Server-side verification on all protected routes

### 3. Rate Limiting
- Token bucket algorithm on auth endpoint
- Per-IP limiting (configurable capacity/refill rate)
- Automatic bucket cleanup

### 4. Security Headers
- CSP: `frame-ancestors` restricted to Telegram domains
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`

### 5. Data Protection
- Zod validation on all API inputs
- PostgreSQL prepared statements (via Prisma)
- Sensitive values redacted from logs
- Environment secrets never exposed to client

## 🌍 Internationalization

### Locale Switching
- Default: English (`/` routes to `/en`)
- Arabic: `/ar/*` routes with `dir="rtl"`
- Preserved across navigation with locale-aware `Link`/`useRouter`
- User preference stored in database

### RTL Support
- Tailwind logical properties (`ms-*`, `me-*`, `ps-*`, `pe-*`)
- Arabic font (Noto Sans Arabic) loaded conditionally
- Mirrored layouts via `dir` attribute
- Number/date formatting with `Intl` APIs

### Adding Translations
1. Add keys to `messages/en.json` and `messages/ar.json`
2. Use in components: `const t = useTranslations(); t('key')`

## 🎨 Theming

Telegram theme colors are automatically mapped to CSS variables:

| Telegram Param | CSS Variable |
|----------------|--------------|
| `bg_color` | `--background` |
| `text_color` | `--foreground` |
| `button_color` | `--primary` |
| `button_text_color` | `--primary-foreground` |
| `secondary_bg_color` | `--card` |
| `hint_color` | `--muted-foreground` |
| `destructive_text_color` | `--destructive` |

Updates automatically on `themeChanged` events. shadcn/ui components consume these tokens.

## 🧪 Testing

Run the test suite:

```bash
npm test
```

Tests cover:
- ✅ Valid initData acceptance
- ✅ Tampered hash rejection
- ✅ Replay attack prevention (expired auth_date)
- ✅ Missing/malformed user data handling
- ✅ Wrong bot token rejection
- ✅ Timing-safe comparison

## 🚢 Deployment

### Current Deployment

This app is currently deployed on **Netlify**:
- **URL:** https://ephemeral-squirrel-4a4d16.netlify.app/
- **Bot Link:** [@my_miniapp_moayad_bot](https://t.me/my_miniapp_moayad_bot/app)

### Netlify Deployment

The project includes `netlify.toml` configuration for automatic deployments:

1. Push to GitHub (main branch)
2. Netlify automatically builds and deploys
3. Set environment variables in Netlify dashboard:
   - `DATABASE_URL` (use pooled connection string)
   - `DIRECT_URL` (for migrations)
   - `TELEGRAM_BOT_TOKEN`
   - `SESSION_JWT_SECRET`
   - `NEXT_PUBLIC_APP_URL`
   - `INITDATA_MAX_AGE_SECONDS`
4. Deploy automatically on push

### Vercel (Alternative)

1. Push to GitHub
2. Connect to Vercel
3. Set environment variables in Vercel dashboard:
   - `DATABASE_URL` (use pooled connection string)
   - `TELEGRAM_BOT_TOKEN`
   - `SESSION_JWT_SECRET`
   - `NEXT_PUBLIC_APP_URL`
   - `INITDATA_MAX_AGE_SECONDS`
4. Deploy

The build automatically runs:
- Type checking
- Linting
- Prisma generation
- Next.js build

### Docker

Build with standalone output:

```bash
export DOCKER_BUILD=1
npm run build
```

Sample `Dockerfile`:

```dockerfile
FROM node:22-alpine AS base

FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV DOCKER_BUILD=1
RUN npm run prisma:generate && npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
ENV PORT=3000
CMD ["node", "server.js"]
```

### Database Migrations

**Development:**
```bash
npm run prisma:migrate
```

**Production (CI/CD):**
```bash
npm run prisma:deploy
```

⚠️ Always use a **pooled connection string** for serverless deployments (Neon, Supabase PgBouncer, or Prisma Accelerate).

## 📋 Pre-Launch Checklist

- [ ] Bot token and JWT secret are production secrets (not dev placeholders)
- [ ] Database uses pooled connections for serverless
- [ ] HTTPS configured (Let's Encrypt or platform-managed)
- [ ] Environment variables set in production
- [ ] Prisma migrations deployed (`npm run prisma:deploy`)
- [ ] Health check endpoint `/api/health` returns 200
- [ ] Rate limiting active (test 429 response on auth endpoint)
- [ ] Tested on all Telegram clients (iOS, Android, Desktop, Web)
- [ ] Tested in both light and dark Telegram themes
- [ ] Tested both English and Arabic locales (including RTL layout)
- [ ] Error boundaries render localized messages
- [ ] Logs shipped to monitoring service (optional: Sentry, LogDNA)
- [ ] Bot menu button configured in @BotFather

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is private and proprietary.

## 🆘 Support

For issues or questions:
1. Check the [Telegram Mini Apps documentation](https://core.telegram.org/bots/webapps)
2. Review the security validation in `src/lib/telegram/validate-init-data.ts`
3. Check logs: `npm run dev` shows pino-pretty formatted logs

## 🔗 Resources

- [Telegram Mini Apps Guide](https://core.telegram.org/bots/webapps)
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [shadcn/ui](https://ui.shadcn.com/)
