# Database Setup Guide

## Understanding Connection Strings

### DATABASE_URL vs DIRECT_URL

When using **serverless databases** (Neon, Supabase, PlanetScale), you need TWO connection strings:

| Variable | Purpose | When Used | Speed | Connection Limit |
|----------|---------|-----------|-------|------------------|
| `DATABASE_URL` | Runtime queries | App running | Fast | Pooled (many connections) |
| `DIRECT_URL` | Migrations | `prisma migrate deploy` | Slower | Direct (few connections) |

### Why Two Connections?

**Serverless databases** use **connection pooling** to handle thousands of concurrent connections efficiently. However, migrations require **direct database access** to modify schema (DDL commands like `CREATE TABLE`, `ALTER TABLE`).

## Current Setup (Neon)

Your `.env` currently has:

```env
DATABASE_URL="postgresql://neondb_owner:<YOUR_PASSWORD>@ep-summer-snow-aidg5jgp.c-4.us-east-1.aws.neon.tech/tgapp?sslmode=require&channel_binding=require"
DIRECT_URL="postgresql://neondb_owner:<YOUR_PASSWORD>@ep-summer-snow-aidg5jgp.c-4.us-east-1.aws.neon.tech/tgapp?sslmode=require&channel_binding=require"
```

### ⚠️ Important Note

Both URLs are currently **the same**. This works, but for **optimal performance in production**, you should get the pooled endpoint from Neon.

## How to Get Both Connection Strings

### For Neon (Your Current Provider)

1. Go to your [Neon Dashboard](https://console.neon.tech)
2. Select your project: `tgapp`
3. Click on **"Connection Details"**
4. You'll see two types:

**Option A: Pooled Connection (for DATABASE_URL)**
```
Host: ep-summer-snow-aidg5jgp.pooler.c-4.us-east-1.aws.neon.tech
Port: 5432
```

**Option B: Direct Connection (for DIRECT_URL)** 
```
Host: ep-summer-snow-aidg5jgp.c-4.us-east-1.aws.neon.tech
Port: 5432
```

### Updated .env (Optimal Setup)

```env
# Runtime - Uses pooled connection (note .pooler. in hostname)
DATABASE_URL="postgresql://neondb_owner:<YOUR_PASSWORD>@ep-summer-snow-aidg5jgp.pooler.c-4.us-east-1.aws.neon.tech/tgapp?sslmode=require&channel_binding=require"

# Migrations - Uses direct connection (no .pooler. in hostname)
DIRECT_URL="postgresql://neondb_owner:<YOUR_PASSWORD>@ep-summer-snow-aidg5jgp.c-4.us-east-1.aws.neon.tech/tgapp?sslmode=require&channel_binding=require"
```

**Notice the difference:** `.pooler.` is added to the hostname for `DATABASE_URL`.

## For Other Providers

### Supabase

```env
# Runtime - Port 6543 (PgBouncer pooler)
DATABASE_URL="postgresql://postgres:password@db.xxxxx.supabase.co:6543/postgres"

# Migrations - Port 5432 (direct)
DIRECT_URL="postgresql://postgres:password@db.xxxxx.supabase.co:5432/postgres"
```

### Railway

Railway provides a single connection URL. Use it for both:

```env
DATABASE_URL="postgresql://postgres:password@containers-us-west-123.railway.app:5432/railway"
DIRECT_URL="postgresql://postgres:password@containers-us-west-123.railway.app:5432/railway"
```

### Local PostgreSQL

For local development, use the same URL for both:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/mydb"
DIRECT_URL="postgresql://user:password@localhost:5432/mydb"
```

## Running Migrations

### Development (Local)

```bash
npm run prisma:migrate
```

This uses `DIRECT_URL` automatically.

### Production (CI/CD or Manual)

```bash
npm run prisma:deploy
```

This also uses `DIRECT_URL` automatically.

## Prisma Configuration

Your `prisma/schema.prisma` is configured to use both:

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")      # Runtime queries
  directUrl = env("DIRECT_URL")        # Migrations
}
```

### How It Works

- **When your app runs:** Prisma uses `DATABASE_URL` (pooled, fast)
- **When you run migrations:** Prisma uses `DIRECT_URL` (direct, can modify schema)

## Testing Your Setup

### 1. Test Direct Connection (Migrations)

```bash
npx prisma migrate status
```

If successful, you'll see:
```
Database schema is up to date!
```

### 2. Test Pooled Connection (Runtime)

```bash
npx prisma studio
```

Opens a web UI to browse your database.

### 3. Run the Migration

```bash
npm run prisma:deploy
```

This will create the `User` and `AuditEvent` tables.

## Common Issues

### Issue: "Can't reach database server"

**Cause:** Wrong connection string or database not running

**Fix:**
1. Copy connection strings from your database provider dashboard
2. Make sure to use the **exact format** they provide
3. Check that `sslmode=require` is present for cloud databases

### Issue: "Direct connection not configured"

**Cause:** `DIRECT_URL` missing from `.env`

**Fix:** Add `DIRECT_URL` to your `.env` file (see examples above)

### Issue: "P1001: Can't reach database"

**Cause:** IP address may be blocked (Neon/Supabase have IP allowlists)

**Fix:** 
- Check your database provider's firewall settings
- Add `0.0.0.0/0` to allow all IPs (for development)
- For production, add your server's IP address

### Issue: Migration fails with pooled connection

**Cause:** Using pooled connection for migrations

**Fix:** Make sure `DIRECT_URL` points to the direct (non-pooled) endpoint

## Verifying Your Current Setup

Run this to check your connection:

```bash
npx prisma db pull
```

If it works, your `DIRECT_URL` is configured correctly!

## Next Steps

1. ✅ **`DIRECT_URL` is now configured** in your `.env`
2. ✅ **Prisma schema updated** to use both URLs
3. 🔄 **Optional:** Get the pooled endpoint from Neon for `DATABASE_URL`
4. ✅ **Run migration:** `npm run prisma:deploy`

Your database is ready! 🎉
