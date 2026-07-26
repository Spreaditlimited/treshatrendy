# Treshatrendy Hostinger Deployment

## Production Environment Variables

Add these in Hostinger for the Node/Next.js app:

```env
DATABASE_URL="mysql://u482495657_treshatrendy:YOUR_PASSWORD@srv1538.hstgr.io:3306/u482495657_treshatrendy"
AUTH_SECRET="GENERATE_A_LONG_RANDOM_SECRET"
NEXT_PUBLIC_SITE_URL="https://treshatrendy.com"
PAYPAL_ENV="sandbox"
PAYPAL_CLIENT_ID="YOUR_PAYPAL_CLIENT_ID"
PAYPAL_CLIENT_SECRET="YOUR_PAYPAL_SECRET"
NEXT_PUBLIC_PAYPAL_CLIENT_ID="YOUR_PAYPAL_CLIENT_ID"
```

Use `PAYPAL_ENV="live"` only after PayPal live credentials are ready.

## Build Settings

Use these commands:

```bash
npm install
npm run build
npm run start
```

The app expects Node.js 20.18 or newer.

## Database

The database tables have already been created with:

```bash
npm run db:setup
```

If the schema changes later, run:

```bash
npm run db:push
```

Do not run `npm run db:seed` on a live store after real products/orders exist unless you intentionally want to refresh sample data.

## Admin

Admin login:

```txt
/admin/login
```

Create or reset an admin:

```bash
npm run admin:create -- --email="admin@treshatrendy.com" --password="NEW_SECURE_PASSWORD" --name="Treshatrendy Admin"
```

## Health Check

After deployment, open:

```txt
https://treshatrendy.com/api/health
```

Expected response:

```json
{"ok":true,"database":"connected"}
```

## Remote MySQL Note

Remote MySQL access is only needed while connecting from your laptop. Once the site is deployed inside Hostinger, remove laptop IP allowlist entries unless you still need local development access.

## Pre-Launch Checklist

- Change the temporary admin password.
- Add PayPal sandbox credentials and test checkout.
- Switch PayPal to live credentials when ready.
- Add real product photos and descriptions.
- Test NGN, CAD, and USD currency switching.
- Test cart, checkout, and admin orders.
- Confirm `/sitemap.xml` and `/robots.txt` load.
