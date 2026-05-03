"# PRD — Zaraj Gold (زَرَج گُلد)

## Problem Statement
میخوام یه وب سایت کامل با تمام جزئیات بزنی یه وب سایت فروش انگشتر و گردنبند طلا و موارد دیگه

A full-featured Persian (RTL) e-commerce website for selling gold rings, necklaces, bracelets, earrings, and other jewelry (gold/silver, with/without gemstones).

## User Choices
- Products: rings, necklaces, bracelets, earrings, gold/silver, with gemstones
- Auth: email/password + JWT
- Payment: shopping cart + Stripe checkout
- Full admin panel
- Design: minimal & light, cream/gold (Vazirmatn), RTL

## Architecture
- **Frontend**: React 19 + React Router 7 + Tailwind + shadcn/ui + sonner + axios + Vazirmatn font, RTL
- **Backend**: FastAPI + motor (MongoDB async) + bcrypt + PyJWT + emergentintegrations (Stripe)
- **DB**: MongoDB (`users`, `products`, `orders`, `payment_transactions`)

## Core Features (Implemented 2026-02)
- RTL Persian UI with cream `#FCFBF8` + gold `#C5A059` palette, Vazirmatn font
- Home: hero, category grid, featured products, story section, footer
- Shop: filter by category/material/gem/price, search, sort, client-side
- Product detail: gallery, specs (karat, weight, gem), qty picker, add-to-cart
- Cart: localStorage, qty update, remove, summary
- Auth: register/login with JWT httpOnly cookie, `/api/auth/me`
- Protected checkout with Stripe: server-side total, pending order + payment_transaction, polling at `/checkout/success`
- User: account, orders history
- **Admin Panel**: dashboard stats, product CRUD (dialog form), order status update, users table
- Seeded: admin (admin@zarajgold.ir/admin123) + 10 products

## Credentials
See `/app/memory/test_credentials.md`

## Backlog (P1)
- Product image gallery / multi-images
- Google social login (Emergent Google Auth)
- Email notifications (Resend) for orders
- Persian price display (تومان) + IRR currency option
- Wishlist / favorites
- Product reviews & ratings
- Discount coupons
- Admin: analytics charts, export CSV
- Stripe crypto / local Iranian gateway alternatives

## Next Action Items
- Collect feedback on visuals / flow
- Consider adding product recommendations (cross-sell)
- Add wishlist persistence for logged-in users
"
