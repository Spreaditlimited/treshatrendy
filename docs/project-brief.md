# Treshatrendy Ecommerce Build Brief

## Step 1 Decisions

- Brand name: Treshatrendy
- Store type: custom African fashion ecommerce store
- Product categories: Tops, Hoodies, Dresses, Jumpsuits, Bottoms, Sets, Kids, Men
- Launch markets: Nigeria, Canada, United States
- Currencies: NGN, CAD, USD
- Currency defaults:
  - Nigeria visitors see NGN
  - Canada visitors see CAD
  - All other visitors see USD
- Product pricing: manual prices per currency
- Checkout: immediate online checkout
- Current payment methods: Stripe for CAD/USD and Paystack for NGN
- Inventory: stock tracked per size, color, and region
- Sizes: 6, 8, 10, 12, 14, 16, 18, 20, 22
- Product images: multiple photos per product
- Admin users: one admin at launch

## Build Direction

The implementation uses Next.js with TypeScript and Tailwind CSS. The planned production setup is Vercel for hosting, Supabase Postgres for the database, and Cloudinary for product images. Product and admin data is modeled so each product can have categories, images, manual prices, regional variants, SEO metadata, and publish status.

## Step 2 Decisions

The project was scaffolded as a Next.js app with TypeScript, Tailwind CSS, and the App Router. The first branded homepage, shared store constants, and temporary hero image were added.

## Step 3 Decisions

The database uses Supabase Postgres with Prisma. The schema covers products, categories, product images, manual currency prices, regional variants, admin users, carts, orders, order items, addresses, Stripe metadata, and Paystack metadata.

## Step 4 Decisions

The app now has a Prisma database client, seed data, and seed scripts. Until a real `DATABASE_URL` is added, shop pages use the same seed data as a fallback so development can continue. Once Supabase is connected, `npm run db:setup` will create the tables and seed starter categories/products.

## Next Step

Step 5 is building search and filters on the shop page, then turning product detail actions into real cart behavior.
