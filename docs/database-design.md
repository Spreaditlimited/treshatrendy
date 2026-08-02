# Step 3: Database Design

Treshatrendy will use a relational database because ecommerce data has strong relationships: products have categories, images, prices, variants, stock, carts, orders, addresses, and payment records.

The production target is Supabase Postgres, which fits the Vercel hosting direction. Prisma is used as the schema layer so the database structure stays versioned with the code. Prisma 7 keeps the database URL in `prisma.config.ts`, which reads `DIRECT_URL` for schema commands and falls back to `DATABASE_URL`.

## Core Tables

- `AdminUser`: one admin at launch, expandable later for staff accounts.
- `Category`: Tops, Hoodies, Dresses, Jumpsuits, Bottoms, Sets, Kids, Men.
- `Product`: product content, SEO fields, publish status, and timestamps.
- `ProductCategory`: supports products appearing in more than one category.
- `ProductImage`: multiple images per product with alt text and ordering.
- `ProductPrice`: manual prices per product in NGN, CAD, and USD.
- `ProductVariant`: size/color/regional stock rows, for example size 12 in Red with Nigeria and Canada stock counts.
- `Customer`: optional customer profile created from checkout details.
- `Cart`: guest or customer cart with selected currency.
- `CartItem`: product variant and quantity inside a cart.
- `Order`: checkout record, customer contact, totals, order status, and payment provider references.
- `OrderItem`: frozen purchase snapshot so old orders do not change if product details change later.
- `Address`: shipping and billing addresses for orders/customers.

## Important Rules

- Prices are stored manually per currency, not auto-converted.
- Product stock is tracked at the variant level by size, color, and region.
- Product pages can be unpublished without deleting product history.
- Orders store product names, slugs, sizes, colors, and prices at purchase time.
- Stripe is used for CAD/USD checkout and Paystack is used for NGN checkout.
- Guest checkout is supported through order email and cart session IDs.

## Currency Defaults

- Nigeria: `NGN`
- Canada: `CAD`
- Everywhere else: `USD`

The database stores currency choices, but visitor detection will be implemented in the app layer in a later step.

## Creating The Database

After creating a Supabase project, copy `.env.example` to `.env`, replace `DATABASE_URL` with the transaction pooler URL and `DIRECT_URL` with the session/direct URL, then run:

```bash
npm run db:setup
```

This runs `prisma db push` to create the tables and `tsx prisma/seed.ts` to insert starter categories/products.

## Next Step

Step 5 will add search and filters, then connect product detail actions to cart behavior.
