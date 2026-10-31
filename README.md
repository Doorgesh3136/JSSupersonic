# JS Supersonic — online store

A full e-commerce storefront for **JS Supersonic** (electronics, appliances and furniture, Mauritius), in the style of the big local retailers: mega-menu categories, flash deals with a countdown, pay-monthly (hire purchase) pricing on every product, cart, and a multi-step checkout.

It's a static site (plain HTML, CSS and JavaScript, with no build step), so it runs on GitHub Pages or any web host.

## Pages

| Page | What it does |
|---|---|
| `index.html` | Home page: hero slider, category tiles, flash deals with a countdown to midnight, bestsellers, pay-monthly calculator, new arrivals, brands, newsletter |
| `shop.html` | Catalogue with category, brand, price and offer filters, sorting, search (`?q=`) and wishlist (`?wish=1`) |
| `product.html?id=N` | Product page: image gallery, price and savings, monthly-payment terms, quantity, specs, delivery and warranty info, related products |
| `cart.html` | Cart: quantities, promo codes, free-delivery progress bar |
| `checkout.html` | Checkout: customer details, home delivery or Click & Collect, payment method, order confirmation |
| `stores.html` | Showrooms and contact form |

The cart, wishlist and orders are saved in the browser (`localStorage`).

## Payments: demo mode

Checkout shows card, Juice, my.t money, Blink, cash on delivery and pay monthly as options, but **none of them are connected**. Placing an order only shows a confirmation screen. To go live, connect a payment gateway (for example MIPS or an MCB/SBM gateway) and a backend that saves orders.

Promo codes for testing: `SUPERSONIC10` (10% off) and `WELCOME5` (5% off).

## Editing content

Everything lives in **`assets/js/data.js`**:

- `SITE`: phone, WhatsApp, email, delivery fee, free-delivery threshold, promo codes, pay-monthly rates
- `CATEGORIES`: shop categories
- `PRODUCTS`: the catalogue (name, brand, price, old price, image, specs, tags `deal` / `new` / `best`)
- `STORES`: showroom names, addresses and hours

⚠️ All products, prices, phone numbers, emails and store addresses are **placeholders**. Replace them with JS Supersonic's real details before launch.

Product images are hotlinked from [Unsplash](https://unsplash.com) (free to use under the Unsplash License). Replace them with real product photos.

## Run locally

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

## Deploy on GitHub Pages

Go to **Settings → Pages → Source: Deploy from a branch**, then choose `main` and `/ (root)`.
