/* ==========================================================================
   JS Supersonic — storefront logic (vanilla JS, no build step)
   ========================================================================== */
(() => {
  "use strict";

  /* ---------------- Icons ---------------- */
  const P = {
    tv: '<rect x="2" y="4" width="20" height="13" rx="2"/><path d="M8 21h8M12 17v4"/>',
    phone: '<rect x="6" y="2" width="12" height="20" rx="2.5"/><path d="M11 18h2"/>',
    laptop: '<rect x="4" y="4" width="16" height="11" rx="1.5"/><path d="M2 19h20l-2-4H4z"/>',
    gamepad: '<path d="M6 9h4M8 7v4M15 10h.01M18 8h.01"/><path d="M17.3 5H6.7A4.7 4.7 0 0 0 2 9.7V14a3 3 0 0 0 5.3 1.9L9 14h6l1.7 1.9A3 3 0 0 0 22 14V9.7A4.7 4.7 0 0 0 17.3 5z"/>',
    fridge: '<rect x="5" y="2" width="14" height="20" rx="2"/><path d="M5 10h14M9 5v2M9 13v3"/>',
    kitchen: '<rect x="3" y="7" width="18" height="13" rx="2"/><rect x="6" y="10" width="9" height="7" rx="1"/><path d="M18 11v.01M18 14v.01M8 4h8"/>',
    sofa: '<path d="M4 11V8a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v3"/><path d="M2 13a2 2 0 0 1 4 0v2h12v-2a2 2 0 0 1 4 0v4a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2z"/><path d="M5 19v2M19 19v2"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    cart: '<circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/><path d="M2 3h3l2.7 12.4a2 2 0 0 0 2 1.6h8.6a2 2 0 0 0 2-1.5L22 7H6"/>',
    heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 1 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8z"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    pin: '<path d="M12 22s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/>',
    call: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.9 2z"/>',
    truck: '<path d="M1 4h14v12H1zM15 9h4l3 3v4h-7"/><circle cx="5.5" cy="18.5" r="2"/><circle cx="18.5" cy="18.5" r="2"/>',
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>',
    card: '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20M6 15h4"/>',
    calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
    store: '<path d="M3 9 4.5 4h15L21 9"/><path d="M3 9a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0"/><path d="M5 12v9h14v-9M10 21v-5h4v5"/>',
    right: '<path d="m9 18 6-6-6-6"/>',
    left: '<path d="m15 18-6-6 6-6"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    menu: '<path d="M3 6h18M3 12h18M3 18h18"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    trash: '<path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>',
    filter: '<path d="M22 3H2l8 9.5V19l4 2v-8.5z"/>',
    home: '<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/>',
    grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
    mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 6-10 7L2 6"/>',
    bolt: '<path d="M13 2 3 14h9l-1 8 10-12h-9z"/>',
    lock: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
    returns: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    tag: '<path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L2 12V2h10l8.6 8.6a2 2 0 0 1 0 2.8z"/><circle cx="7" cy="7" r="1.5"/>',
    fb: '<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>',
    ig: '<rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17.5 6.5h.01"/>',
    chat: '<path d="M21 11.5a8.4 8.4 0 0 1-12.4 7.4L3 21l2.1-5.6A8.4 8.4 0 1 1 21 11.5z"/>',
  };
  const icon = (n, cls = "icon") =>
    `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[n] || ""}</svg>`;

  const LOGO = `
  <svg viewBox="0 0 236 48" role="img" aria-label="JS Supersonic">
    <path d="M2 16h12M0 24h12M2 32h8" stroke="#22d3ee" stroke-width="3" stroke-linecap="round"/>
    <g transform="skewX(-12)"><rect x="24" y="4" width="50" height="40" rx="10" fill="#ff5a1f"/></g>
    <text x="45" y="33" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-weight="800" font-style="italic" font-size="23" fill="#fff">JS</text>
    <text x="82" y="29" font-family="Plus Jakarta Sans, sans-serif" font-weight="800" font-size="21" textLength="150" lengthAdjust="spacingAndGlyphs" fill="#fff">SUPERSONIC</text>
    <text x="83" y="42" font-family="Plus Jakarta Sans, sans-serif" font-weight="600" font-size="8.4" textLength="148" lengthAdjust="spacingAndGlyphs" fill="#94a3b8">ELECTRONICS · HOME · LIVING</text>
  </svg>`;

  /* ---------------- Helpers ---------------- */
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const fmt = (n) => `${SITE.currency} ${Math.round(n).toLocaleString("en-US")}`;
  const byId = (id) => PRODUCTS.find((p) => p.id === Number(id));
  const catName = (id) => (CATEGORIES.find((c) => c.id === id) || {}).name || "";
  const monthly = (price, months) => Math.ceil((price * (1 + (SITE.installments[months] || 0))) / months);
  const pct = (p) => (p.old ? Math.round((1 - p.price / p.old) * 100) : 0);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const params = () => new URLSearchParams(location.search);
  const stars = (r) => {
    const full = Math.round(r);
    return "★".repeat(full) + "☆".repeat(5 - full);
  };
  const imgTag = (p, w = 600, extra = "") =>
    `<img src="${IMG(p.img, w)}" alt="${esc(p.name)}" loading="lazy" ${extra} onerror="this.onerror=null;this.alt='';this.removeAttribute('src');this.classList.add('img-broken')">`;

  /* ---------------- Storage (safe) ---------------- */
  const mem = {};
  const store = {
    get(k, d) {
      try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return k in mem ? mem[k] : d; }
    },
    set(k, v) {
      try { localStorage.setItem(k, JSON.stringify(v)); } catch { mem[k] = v; }
    },
  };

  const Cart = {
    items: () => store.get("jss_cart", []).filter((i) => byId(i.id)),
    save(items) { store.set("jss_cart", items); updateBadges(); },
    add(id, qty = 1) {
      const items = Cart.items();
      const found = items.find((i) => i.id === Number(id));
      if (found) found.qty = Math.min(found.qty + qty, 10);
      else items.push({ id: Number(id), qty: Math.min(qty, 10) });
      Cart.save(items);
    },
    setQty(id, qty) {
      let items = Cart.items();
      if (qty <= 0) items = items.filter((i) => i.id !== Number(id));
      else items.forEach((i) => { if (i.id === Number(id)) i.qty = Math.min(qty, 10); });
      Cart.save(items);
    },
    remove(id) { Cart.save(Cart.items().filter((i) => i.id !== Number(id))); },
    clear() { Cart.save([]); },
    count: () => Cart.items().reduce((s, i) => s + i.qty, 0),
    subtotal: () => Cart.items().reduce((s, i) => s + byId(i.id).price * i.qty, 0),
  };

  const Wish = {
    ids: () => store.get("jss_wish", []),
    has: (id) => Wish.ids().includes(Number(id)),
    toggle(id) {
      id = Number(id);
      const ids = Wish.ids();
      const on = !ids.includes(id);
      store.set("jss_wish", on ? [...ids, id] : ids.filter((x) => x !== id));
      updateBadges();
      return on;
    },
  };

  const totals = () => {
    const sub = Cart.subtotal();
    const code = store.get("jss_promo", "");
    const rate = SITE.promoCodes[code] || 0;
    const discount = Math.round(sub * rate);
    const after = sub - discount;
    const delivery = sub === 0 || after >= SITE.freeDeliveryFrom ? 0 : SITE.deliveryFee;
    return { sub, code: rate ? code : "", discount, delivery, total: after + delivery };
  };

  /* ---------------- Toast ---------------- */
  function toast(msg, link) {
    let wrap = $(".toast-wrap");
    if (!wrap) { wrap = document.createElement("div"); wrap.className = "toast-wrap"; document.body.appendChild(wrap); }
    const t = document.createElement("div");
    t.className = "toast";
    t.innerHTML = `${icon("check", "icon-sm")}<span>${msg}</span>${link ? `<a href="${link.href}">${link.label}</a>` : ""}`;
    wrap.appendChild(t);
    setTimeout(() => { t.style.transition = "opacity .3s"; t.style.opacity = "0"; setTimeout(() => t.remove(), 300); }, 2600);
  }

  /* ---------------- Shared layout ---------------- */
  function renderHeader() {
    const page = document.body.dataset.page;
    const q = params();
    const el = $("#header");
    if (!el) return;
    el.innerHTML = `
      <div class="topbar">
        <div class="container">
          <div class="topbar-msg">${icon("truck", "icon-sm")} <span><strong>Free islandwide delivery</strong> on orders over ${fmt(SITE.freeDeliveryFrom)} · Pay monthly up to 36 months</span></div>
          <div class="topbar-links">
            <a href="stores.html">${icon("pin", "icon-sm")} Find a store</a>
            <a href="tel:${SITE.phone.replace(/\s/g, "")}">${icon("call", "icon-sm")} ${SITE.phone}</a>
            <a href="stores.html#contact">Help & Contact</a>
          </div>
        </div>
      </div>
      <header class="header">
        <div class="container header-inner">
          <button class="burger" data-open="menu" aria-label="Open menu">${icon("menu")}</button>
          <a href="index.html" class="logo" aria-label="JS Supersonic home">${LOGO}</a>
          <form class="search" action="shop.html" role="search">
            <select name="cat" aria-label="Category">
              <option value="">All categories</option>
              ${CATEGORIES.map((c) => `<option value="${c.id}" ${q.get("cat") === c.id ? "selected" : ""}>${c.name}</option>`).join("")}
            </select>
            <input type="search" name="q" placeholder="Search TVs, phones, fridges, sofas…" value="${esc(q.get("q") || "")}" aria-label="Search products">
            <button type="submit" aria-label="Search">${icon("search")}</button>
          </form>
          <div class="header-actions">
            <a class="hact hide-sm" href="stores.html">${icon("pin")}<span class="txt"><small>Our</small><span class="lbl">Stores</span></span></a>
            <a class="hact" href="shop.html?wish=1" aria-label="Wishlist">${icon("heart")}<span class="count" data-wish-count hidden>0</span><span class="txt"><small>My</small><span class="lbl">Wishlist</span></span></a>
            <button class="hact" data-open="cart" aria-label="Cart">${icon("cart")}<span class="count" data-cart-count hidden>0</span><span class="txt"><small>My cart</small><span class="lbl" data-cart-total>${fmt(0)}</span></span></button>
          </div>
        </div>
      </header>
      <nav class="catnav" aria-label="Categories">
        <div class="container">
          <div class="allcats">
            <button class="allcats-btn" aria-haspopup="true">${icon("grid", "icon-sm")} All Categories</button>
            <div class="mega">
              ${CATEGORIES.map((c) => `<a href="shop.html?cat=${c.id}">${icon(c.icon)} ${c.name} ${icon("right", "icon-sm chev")}</a>`).join("")}
            </div>
          </div>
          <div class="navlinks">
            <a href="shop.html?deal=1" class="hot ${page === "shop" && q.get("deal") ? "active" : ""}">🔥 Deals</a>
            <a href="shop.html?new=1" class="${page === "shop" && q.get("new") ? "active" : ""}">New Arrivals</a>
            ${CATEGORIES.slice(0, 5).map((c) => `<a href="shop.html?cat=${c.id}" class="${page === "shop" && q.get("cat") === c.id ? "active" : ""}">${c.name}</a>`).join("")}
            <a href="index.html#paymonthly">Pay Monthly</a>
          </div>
          <div class="catnav-right">${icon("chat", "icon-sm")} Need help? <strong>${SITE.whatsapp}</strong></div>
        </div>
      </nav>

      <div class="overlay" data-close></div>
      <aside class="drawer drawer-left" id="menu" aria-label="Menu">
        <div class="drawer-head"><h3>Menu</h3><button class="icon-btn" data-close aria-label="Close">${icon("x")}</button></div>
        <div class="drawer-body mnav">
          <a href="index.html">${icon("home")} Home</a>
          <a href="shop.html?deal=1">${icon("tag")} Deals</a>
          <a href="shop.html?new=1">${icon("bolt")} New Arrivals</a>
          <h4>Shop by category</h4>
          ${CATEGORIES.map((c) => `<a href="shop.html?cat=${c.id}">${icon(c.icon)} ${c.name}</a>`).join("")}
          <h4>Help</h4>
          <a href="index.html#paymonthly">${icon("calendar")} Pay Monthly</a>
          <a href="stores.html">${icon("pin")} Stores & Contact</a>
        </div>
      </aside>
      <aside class="drawer drawer-right" id="cart" aria-label="Cart">
        <div class="drawer-head"><h3>Your cart</h3><button class="icon-btn" data-close aria-label="Close">${icon("x")}</button></div>
        <div class="drawer-body" data-mini-cart></div>
        <div class="drawer-foot" data-mini-foot></div>
      </aside>`;

    // Mobile tab bar
    const bar = document.createElement("nav");
    bar.className = "mobile-tabbar";
    bar.innerHTML = `
      <a href="index.html" class="${page === "home" ? "active" : ""}">${icon("home")}Home</a>
      <button data-open="menu">${icon("grid")}Categories</button>
      <a href="shop.html?deal=1">${icon("tag")}Deals</a>
      <a href="shop.html?wish=1">${icon("heart")}Wishlist</a>
      <a href="cart.html" class="${page === "cart" ? "active" : ""}">${icon("cart")}<span class="count" data-cart-count hidden>0</span>Cart</a>`;
    document.body.appendChild(bar);
  }

  function renderFooter() {
    const el = $("#footer");
    if (!el) return;
    el.innerHTML = `
      <footer class="footer">
        <div class="container footer-top">
          <div>
            <a href="index.html" class="logo">${LOGO}</a>
            <p>${SITE.tagline}</p>
            <div class="footer-contact">
              <div>${icon("call", "icon-sm")} ${SITE.phone}</div>
              <div>${icon("mail", "icon-sm")} ${SITE.email}</div>
              <div>${icon("clock", "icon-sm")} Mon–Sat 9:00–18:00</div>
            </div>
            <div class="socials">
              <a href="#" aria-label="Facebook">${icon("fb", "icon-sm")}</a>
              <a href="#" aria-label="Instagram">${icon("ig", "icon-sm")}</a>
              <a href="#" aria-label="WhatsApp">${icon("chat", "icon-sm")}</a>
            </div>
          </div>
          <div>
            <h4>Shop</h4>
            <ul>${CATEGORIES.map((c) => `<li><a href="shop.html?cat=${c.id}">${c.name}</a></li>`).join("")}</ul>
          </div>
          <div>
            <h4>Customer care</h4>
            <ul>
              <li><a href="index.html#paymonthly">Pay monthly</a></li>
              <li><a href="stores.html#contact">Delivery & installation</a></li>
              <li><a href="stores.html#contact">Returns & warranty</a></li>
              <li><a href="stores.html#contact">Track my order</a></li>
              <li><a href="stores.html#contact">Contact us</a></li>
            </ul>
          </div>
          <div>
            <h4>Our stores</h4>
            <ul>${STORES.map((s) => `<li><a href="stores.html">${s.name}</a></li>`).join("")}</ul>
          </div>
          <div>
            <h4>We accept</h4>
            <div class="pay-badges">
              <span class="pay-badge">VISA</span><span class="pay-badge">Mastercard</span>
              <span class="pay-badge">Juice</span><span class="pay-badge">my.t money</span>
              <span class="pay-badge">Blink</span><span class="pay-badge">Cash</span>
            </div>
            <h4 style="margin-top:22px">Secure shopping</h4>
            <p style="margin:0;display:flex;gap:8px;align-items:center">${icon("lock", "icon-sm")} SSL encrypted checkout</p>
          </div>
        </div>
        <div class="footer-bottom">
          <div class="container">
            <span>© ${new Date().getFullYear()} ${SITE.name} Ltd · Mauritius. All rights reserved.</span>
            <span>Prices include VAT · Images for illustration only</span>
          </div>
        </div>
      </footer>`;
  }

  function updateBadges() {
    const c = Cart.count();
    const w = Wish.ids().length;
    $$("[data-cart-count]").forEach((e) => { e.textContent = c; e.hidden = c === 0; });
    $$("[data-wish-count]").forEach((e) => { e.textContent = w; e.hidden = w === 0; });
    $$("[data-cart-total]").forEach((e) => (e.textContent = fmt(Cart.subtotal())));
    renderMiniCart();
  }

  function renderMiniCart() {
    const body = $("[data-mini-cart]");
    const foot = $("[data-mini-foot]");
    if (!body) return;
    const items = Cart.items();
    if (!items.length) {
      body.innerHTML = `<div class="empty">${icon("cart")}<p><strong>Your cart is empty</strong><br>Let's find something supersonic.</p><a class="btn" href="shop.html?deal=1">Shop today's deals</a></div>`;
      foot.innerHTML = "";
      return;
    }
    body.innerHTML = items.map(({ id, qty }) => {
      const p = byId(id);
      return `<div class="mini-item">
        <a href="product.html?id=${p.id}">${imgTag(p, 160)}</a>
        <div><div class="t">${esc(p.name)}</div><div class="p">${qty} × ${fmt(p.price)}</div></div>
        <button class="icon-btn" data-remove="${p.id}" aria-label="Remove">${icon("trash", "icon-sm")}</button>
      </div>`;
    }).join("");
    foot.innerHTML = `<div class="mini-total"><span>Subtotal</span><span>${fmt(Cart.subtotal())}</span></div>
      <div class="mini-actions"><a class="btn btn-ghost" href="cart.html">View cart</a><a class="btn" href="checkout.html">Checkout</a></div>`;
  }

  function openDrawer(id) {
    $("#" + id)?.classList.add("open");
    $(".overlay")?.classList.add("show");
    document.body.style.overflow = "hidden";
  }
  function closeDrawers() {
    $$(".drawer.open, .filters.open").forEach((d) => d.classList.remove("open"));
    $(".overlay")?.classList.remove("show");
    document.body.style.overflow = "";
  }

  /* ---------------- Product card ---------------- */
  function card(p) {
    const off = pct(p);
    const badges = [
      off ? `<span class="badge">-${off}%</span>` : "",
      p.tags.includes("new") ? `<span class="badge new">NEW</span>` : "",
      p.tags.includes("best") && !off ? `<span class="badge best">BESTSELLER</span>` : "",
    ].join("");
    return `<article class="card">
      <div class="card-media">
        <a href="product.html?id=${p.id}">${imgTag(p, 500)}</a>
        <div class="badges">${badges}</div>
        <button class="wish-btn ${Wish.has(p.id) ? "on" : ""}" data-wish="${p.id}" aria-label="Add to wishlist">${icon("heart", "icon-sm")}</button>
      </div>
      <div class="card-body">
        <div class="card-brand">${esc(p.brand)}</div>
        <a class="card-title" href="product.html?id=${p.id}">${esc(p.name)}</a>
        <div class="stars"><span class="s">${stars(p.rating)}</span>(${p.reviews})</div>
        <div class="price"><span class="now ${off ? "sale" : ""}">${fmt(p.price)}</span>${p.old ? `<span class="was">${fmt(p.old)}</span>` : ""}</div>
        <div class="monthly">or <strong>${fmt(monthly(p.price, 36))}/mo</strong> over 36 months</div>
        <div class="card-actions"><button class="btn btn-block" data-add="${p.id}">${icon("cart", "icon-sm")} Add to cart</button></div>
      </div>
    </article>`;
  }

  /* ---------------- Global events ---------------- */
  document.addEventListener("click", (e) => {
    const t = e.target.closest("[data-add],[data-wish],[data-remove],[data-open],[data-close],.allcats-btn");
    if (!t) return;
    if (t.matches("[data-add]")) {
      const p = byId(t.dataset.add);
      Cart.add(p.id, 1);
      toast(`Added to cart`, { href: "cart.html", label: "View cart" });
      t.innerHTML = `${icon("check", "icon-sm")} Added`;
      setTimeout(() => (t.innerHTML = `${icon("cart", "icon-sm")} Add to cart`), 1400);
    } else if (t.matches("[data-wish]")) {
      e.preventDefault();
      const on = Wish.toggle(t.dataset.wish);
      $$(`[data-wish="${t.dataset.wish}"]`).forEach((b) => b.classList.toggle("on", on));
      toast(on ? "Saved to wishlist" : "Removed from wishlist", on ? { href: "shop.html?wish=1", label: "View" } : null);
      if (document.body.dataset.page === "shop" && params().get("wish")) Shop?.render();
    } else if (t.matches("[data-remove]")) {
      Cart.remove(t.dataset.remove);
      if (document.body.dataset.page === "cart") CartPage.render();
    } else if (t.matches("[data-open]")) {
      openDrawer(t.dataset.open);
    } else if (t.matches("[data-close]")) {
      closeDrawers();
    } else if (t.matches(".allcats-btn")) {
      t.parentElement.classList.toggle("open");
    }
  });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeDrawers(); });
  document.addEventListener("click", (e) => {
    const ac = $(".allcats.open");
    if (ac && !ac.contains(e.target)) ac.classList.remove("open");
  });

  /* ==========================================================================
     Pages
     ========================================================================== */

  /* ---------------- Home ---------------- */
  const Home = {
    init() {
      // slider
      const slides = $$(".slide");
      const dots = $(".dots");
      let i = 0, timer;
      dots.innerHTML = slides.map((_, n) => `<button aria-label="Slide ${n + 1}"></button>`).join("");
      const go = (n) => {
        i = (n + slides.length) % slides.length;
        slides.forEach((s, k) => s.classList.toggle("active", k === i));
        $$("button", dots).forEach((d, k) => d.classList.toggle("active", k === i));
      };
      const auto = () => { clearInterval(timer); timer = setInterval(() => go(i + 1), 6000); };
      $$("button", dots).forEach((d, k) => d.addEventListener("click", () => { go(k); auto(); }));
      $(".slider-arrow.prev").addEventListener("click", () => { go(i - 1); auto(); });
      $(".slider-arrow.next").addEventListener("click", () => { go(i + 1); auto(); });
      go(0); auto();

      // categories
      $("#cat-grid").innerHTML = CATEGORIES.map((c) => {
        const n = PRODUCTS.filter((p) => p.cat === c.id).length;
        return `<a class="cat-tile" href="shop.html?cat=${c.id}"><div class="ico">${icon(c.icon)}</div><strong>${c.name}</strong><span>${n} products</span></a>`;
      }).join("");

      // rails
      const deals = PRODUCTS.filter((p) => p.old).sort((a, b) => pct(b) - pct(a)).slice(0, 10);
      $("#rail-deals").innerHTML = deals.map(card).join("");
      $("#rail-best").innerHTML = PRODUCTS.filter((p) => p.tags.includes("best")).slice(0, 10).map(card).join("");
      $("#rail-new").innerHTML = PRODUCTS.filter((p) => p.tags.includes("new")).slice(0, 10).map(card).join("");
      $("#grid-home").innerHTML = PRODUCTS.filter((p) => p.cat === "furniture" || p.cat === "appliances").slice(0, 8).map(card).join("");

      // brands
      const brands = [...new Set(PRODUCTS.map((p) => p.brand))].filter((b) => b !== "Supersonic Home").slice(0, 16);
      $("#brands").innerHTML = brands.map((b) => `<a class="brand" href="shop.html?brand=${encodeURIComponent(b)}">${esc(b)}</a>`).join("");

      // countdown (to midnight)
      const cd = $("#countdown");
      const tick = () => {
        const now = new Date(), end = new Date(now); end.setHours(24, 0, 0, 0);
        let s = Math.max(0, Math.floor((end - now) / 1000));
        const h = String(Math.floor(s / 3600)).padStart(2, "0"); s %= 3600;
        const m = String(Math.floor(s / 60)).padStart(2, "0"); s = String(s % 60).padStart(2, "0");
        cd.innerHTML = `<div class="unit">${h}<small>hrs</small></div><span class="sep">:</span><div class="unit">${m}<small>min</small></div><span class="sep">:</span><div class="unit">${s}<small>sec</small></div>`;
      };
      tick(); setInterval(tick, 1000);

      // pay monthly calculator
      const range = $("#calc-amount"), out = $("#calc-amount-out"), res = $("#calc-result");
      let months = 24;
      const calc = () => {
        const v = Number(range.value);
        out.textContent = fmt(v);
        res.innerHTML = `<small>Estimated monthly payment</small><div class="big">${fmt(monthly(v, months))}</div><small>${months} months · indicative only, subject to approval</small>`;
      };
      $$(".term-tabs button").forEach((b) => b.addEventListener("click", () => {
        $$(".term-tabs button").forEach((x) => x.classList.remove("active"));
        b.classList.add("active"); months = Number(b.dataset.m); calc();
      }));
      range.addEventListener("input", calc); calc();

      // newsletter
      $("#newsletter").addEventListener("submit", (e) => {
        e.preventDefault();
        e.target.reset();
        toast("Thanks! You're on the list for exclusive deals.");
      });
    },
  };

  /* ---------------- Shop ---------------- */
  const Shop = {
    state: {},
    readState() {
      const q = params();
      this.state = {
        cat: q.get("cat") || "",
        q: (q.get("q") || "").trim(),
        brands: (q.get("brand") || "").split(",").filter(Boolean),
        min: q.get("min") || "",
        max: q.get("max") || "",
        deal: q.get("deal") === "1",
        isNew: q.get("new") === "1",
        wish: q.get("wish") === "1",
        sort: q.get("sort") || "featured",
      };
    },
    writeState() {
      const s = this.state, q = new URLSearchParams();
      if (s.cat) q.set("cat", s.cat);
      if (s.q) q.set("q", s.q);
      if (s.brands.length) q.set("brand", s.brands.join(","));
      if (s.min) q.set("min", s.min);
      if (s.max) q.set("max", s.max);
      if (s.deal) q.set("deal", "1");
      if (s.isNew) q.set("new", "1");
      if (s.wish) q.set("wish", "1");
      if (s.sort !== "featured") q.set("sort", s.sort);
      history.replaceState(null, "", "shop.html" + (q.toString() ? "?" + q : ""));
    },
    base() {
      const s = this.state, words = s.q.toLowerCase().split(/\s+/).filter(Boolean);
      return PRODUCTS.filter((p) => {
        if (s.cat && p.cat !== s.cat) return false;
        if (s.wish && !Wish.has(p.id)) return false;
        if (words.length) {
          const hay = `${p.name} ${p.brand} ${catName(p.cat)} ${p.desc}`.toLowerCase();
          if (!words.every((w) => hay.includes(w))) return false;
        }
        return true;
      });
    },
    filtered() {
      const s = this.state;
      let list = this.base().filter((p) => {
        if (s.brands.length && !s.brands.includes(p.brand)) return false;
        if (s.min && p.price < Number(s.min)) return false;
        if (s.max && p.price > Number(s.max)) return false;
        if (s.deal && !p.old) return false;
        if (s.isNew && !p.tags.includes("new")) return false;
        return true;
      });
      const sorters = {
        "price-asc": (a, b) => a.price - b.price,
        "price-desc": (a, b) => b.price - a.price,
        rating: (a, b) => b.rating - a.rating,
        discount: (a, b) => pct(b) - pct(a),
        featured: (a, b) => b.tags.length - a.tags.length || b.reviews - a.reviews,
      };
      return list.sort(sorters[s.sort] || sorters.featured);
    },
    title() {
      const s = this.state;
      if (s.wish) return "My Wishlist";
      if (s.q) return `Results for “${esc(s.q)}”`;
      if (s.cat) return catName(s.cat);
      if (s.deal) return "Today's Deals";
      if (s.isNew) return "New Arrivals";
      if (s.brands.length === 1) return esc(s.brands[0]);
      return "All Products";
    },
    renderFilters() {
      const s = this.state;
      const base = this.base();
      const brands = [...new Set(PRODUCTS.filter((p) => !s.cat || p.cat === s.cat).map((p) => p.brand))].sort();
      $("#filters").innerHTML = `
        <div class="drawer-head" style="padding:6px 0 12px;border:0;display:${matchMedia("(max-width:980px)").matches ? "flex" : "none"}"><h3>Filters</h3><button class="icon-btn" data-close aria-label="Close">${icon("x")}</button></div>
        <div class="filter-group">
          <h4>Category</h4>
          <label class="check"><input type="radio" name="cat" value="" ${!s.cat ? "checked" : ""}> All categories</label>
          ${CATEGORIES.map((c) => `<label class="check"><input type="radio" name="cat" value="${c.id}" ${s.cat === c.id ? "checked" : ""}> ${c.name}<span class="n">${PRODUCTS.filter((p) => p.cat === c.id).length}</span></label>`).join("")}
        </div>
        <div class="filter-group">
          <h4>Offers</h4>
          <label class="check"><input type="checkbox" name="deal" ${s.deal ? "checked" : ""}> On sale<span class="n">${base.filter((p) => p.old).length}</span></label>
          <label class="check"><input type="checkbox" name="isNew" ${s.isNew ? "checked" : ""}> New arrivals<span class="n">${base.filter((p) => p.tags.includes("new")).length}</span></label>
        </div>
        <div class="filter-group">
          <h4>Price (Rs)</h4>
          <div class="price-inputs">
            <input class="input" type="number" name="min" placeholder="Min" value="${s.min}" min="0">
            <input class="input" type="number" name="max" placeholder="Max" value="${s.max}" min="0">
          </div>
        </div>
        <div class="filter-group">
          <h4>Brand</h4>
          ${brands.map((b) => `<label class="check"><input type="checkbox" name="brand" value="${esc(b)}" ${s.brands.includes(b) ? "checked" : ""}> ${esc(b)}<span class="n">${base.filter((p) => p.brand === b).length}</span></label>`).join("")}
        </div>
        <button class="btn btn-ghost btn-block" id="clear-filters">Clear all filters</button>`;

      $("#filters").onchange = (e) => {
        const t = e.target;
        if (t.name === "cat") { s.cat = t.value; s.brands = []; }
        if (t.name === "deal") s.deal = t.checked;
        if (t.name === "isNew") s.isNew = t.checked;
        if (t.name === "min") s.min = t.value;
        if (t.name === "max") s.max = t.value;
        if (t.name === "brand") s.brands = $$('#filters input[name=brand]:checked').map((x) => x.value);
        this.writeState(); this.render(t.name === "cat");
      };
      $("#clear-filters").onclick = () => {
        this.state = { cat: "", q: "", brands: [], min: "", max: "", deal: false, isNew: false, wish: false, sort: s.sort };
        this.writeState(); this.render(true);
      };
    },
    render(refreshFilters = true) {
      if (refreshFilters) this.renderFilters();
      const s = this.state, list = this.filtered();
      $("#shop-title").innerHTML = this.title();
      $("#crumb-current").innerHTML = this.title();
      $("#result-count").innerHTML = `<strong>${list.length}</strong> product${list.length === 1 ? "" : "s"}`;
      $("#sort").value = s.sort;
      const chips = [];
      if (s.q) chips.push(["q", `“${esc(s.q)}”`]);
      if (s.cat) chips.push(["cat", catName(s.cat)]);
      s.brands.forEach((b) => chips.push(["brand:" + b, esc(b)]));
      if (s.deal) chips.push(["deal", "On sale"]);
      if (s.isNew) chips.push(["isNew", "New"]);
      if (s.min || s.max) chips.push(["price", `${s.min || 0} – ${s.max || "∞"}`]);
      $("#chips").innerHTML = chips.map(([k, l]) => `<span class="chip">${l}<button data-chip="${esc(k)}" aria-label="Remove filter">${icon("x", "icon-sm")}</button></span>`).join("");
      $("#product-grid").innerHTML = list.length
        ? list.map(card).join("")
        : `<div class="panel empty" style="grid-column:1/-1">${icon(s.wish ? "heart" : "search")}<p><strong>${s.wish ? "Your wishlist is empty" : "No products match your filters"}</strong><br>${s.wish ? "Tap the heart on any product to save it here." : "Try removing a filter or searching for something else."}</p><a class="btn" href="shop.html">Browse all products</a></div>`;
    },
    init() {
      this.readState();
      this.render();
      $("#sort").addEventListener("change", (e) => { this.state.sort = e.target.value; this.writeState(); this.render(false); });
      $("#chips").addEventListener("click", (e) => {
        const b = e.target.closest("[data-chip]"); if (!b) return;
        const k = b.dataset.chip, s = this.state;
        if (k === "q") s.q = "";
        else if (k === "cat") { s.cat = ""; }
        else if (k.startsWith("brand:")) s.brands = s.brands.filter((x) => x !== k.slice(6));
        else if (k === "price") { s.min = ""; s.max = ""; }
        else s[k] = false;
        this.writeState(); this.render();
      });
      $("#filter-toggle").addEventListener("click", () => {
        $("#filters").classList.add("open");
        $(".overlay").classList.add("show");
      });
    },
  };

  /* ---------------- Product ---------------- */
  const Product = {
    init() {
      const p = byId(params().get("id")) || PRODUCTS[0];
      document.title = `${p.name} | ${SITE.name}`;
      const off = pct(p);
      const crops = [
        IMG(p.img, 900),
        `https://images.unsplash.com/photo-${p.img}?auto=format&fit=crop&w=900&h=900&crop=focalpoint&fp-x=.5&fp-y=.5&fp-z=1.6&q=75`,
        `https://images.unsplash.com/photo-${p.img}?auto=format&fit=crop&w=900&h=900&crop=focalpoint&fp-x=.35&fp-y=.5&fp-z=2&q=75`,
        `https://images.unsplash.com/photo-${p.img}?auto=format&fit=crop&w=900&h=900&crop=focalpoint&fp-x=.65&fp-y=.5&fp-z=2&q=75`,
      ];
      $("#crumbs").innerHTML = `<a href="index.html">Home</a><span class="sep">/</span><a href="shop.html?cat=${p.cat}">${catName(p.cat)}</a><span class="sep">/</span><span>${esc(p.name)}</span>`;
      $("#pdp").innerHTML = `
        <div>
          <div class="pdp-media">
            <img id="main-img" src="${crops[0]}" alt="${esc(p.name)}" onerror="this.onerror=null;this.removeAttribute('src');this.parentElement.classList.add('img-fallback')">
            <div class="badges">${off ? `<span class="badge">-${off}%</span>` : ""}${p.tags.includes("new") ? `<span class="badge new">NEW</span>` : ""}</div>
            <button class="wish-btn ${Wish.has(p.id) ? "on" : ""}" data-wish="${p.id}" aria-label="Add to wishlist">${icon("heart", "icon-sm")}</button>
          </div>
          <div class="pdp-thumbs">${crops.map((src, i) => `<button class="${i === 0 ? "active" : ""}" data-src="${src}" aria-label="View image ${i + 1}"><img src="${src.replace("w=900", "w=200").replace("h=900", "h=200")}" alt="" loading="lazy" onerror="this.style.visibility='hidden'"></button>`).join("")}</div>
        </div>
        <div class="pdp-info">
          <div class="card-brand">${esc(p.brand)}</div>
          <h1>${esc(p.name)}</h1>
          <div class="pdp-meta">
            <span class="stars"><span class="s">${stars(p.rating)}</span> ${p.rating} (${p.reviews} reviews)</span>
            <span>SKU: JSS-${String(p.id).padStart(5, "0")}</span>
            <span class="stock">In stock</span>
          </div>
          <div class="price-box">
            <div class="price"><span class="now ${off ? "sale" : ""}">${fmt(p.price)}</span>${p.old ? `<span class="was">${fmt(p.old)}</span> <span class="save-tag">Save ${fmt(p.old - p.price)}</span>` : ""}</div>
            <div class="vat">Price includes VAT · Free delivery ${p.price >= SITE.freeDeliveryFrom ? "included" : `on orders over ${fmt(SITE.freeDeliveryFrom)}`}</div>
          </div>
          <div class="hp-box">
            <h4>${icon("calendar", "icon-sm")} Pay monthly — choose your term</h4>
            <div class="hp-terms">${Object.keys(SITE.installments).map((m) => `<button data-m="${m}" class="${m === "24" ? "active" : ""}"><strong>${fmt(monthly(p.price, m))}</strong>× ${m} months</button>`).join("")}</div>
            <p class="hp-note">Indicative hire-purchase amounts, subject to approval. 6 months at 0% interest.</p>
          </div>
          <div class="buy-row">
            <div class="qty"><button data-q="-1" aria-label="Decrease">−</button><input id="qty" type="number" value="1" min="1" max="10" aria-label="Quantity"><button data-q="1" aria-label="Increase">+</button></div>
            <button class="btn btn-dark btn-lg" id="add-btn">${icon("cart", "icon-sm")} Add to cart</button>
            <button class="btn btn-lg" id="buy-btn">Buy now</button>
          </div>
          <div class="perks">
            <div class="perk">${icon("truck", "icon-sm")}<div><strong>Islandwide delivery</strong><span>Within 24–72h, installation available</span></div></div>
            <div class="perk">${icon("store", "icon-sm")}<div><strong>Click & Collect</strong><span>Pick up free from any store</span></div></div>
            <div class="perk">${icon("shield", "icon-sm")}<div><strong>${esc(p.specs.Warranty || "1 year")} warranty</strong><span>Official local warranty</span></div></div>
            <div class="perk">${icon("returns", "icon-sm")}<div><strong>7-day returns</strong><span>On unopened items</span></div></div>
          </div>
        </div>`;

      $("#tab-desc").innerHTML = `<p style="margin-top:0">${esc(p.desc)}</p><p>Buy the <strong>${esc(p.name)}</strong> from ${SITE.name} with islandwide delivery, official warranty and flexible monthly payments. Visit any of our ${STORES.length} showrooms to see it in person.</p>`;
      $("#tab-specs").innerHTML = `<table class="spec-table"><tbody><tr><th>Brand</th><td>${esc(p.brand)}</td></tr>${Object.entries(p.specs).map(([k, v]) => `<tr><th>${esc(k)}</th><td>${esc(v)}</td></tr>`).join("")}</tbody></table>`;
      $("#tab-delivery").innerHTML = `<ul style="margin:0;padding-left:18px;line-height:1.9">
        <li>Free islandwide delivery on orders over ${fmt(SITE.freeDeliveryFrom)} (otherwise ${fmt(SITE.deliveryFee)}).</li>
        <li>Large appliances and furniture are delivered and placed in the room of your choice.</li>
        <li>Air conditioner installation can be booked at checkout.</li>
        <li>Click & Collect is free from ${STORES.map((s) => s.name).join(", ")}.</li>
        <li>Rodrigues deliveries are quoted separately.</li></ul>`;

      $("#related").innerHTML = PRODUCTS.filter((x) => x.cat === p.cat && x.id !== p.id).concat(PRODUCTS.filter((x) => x.cat !== p.cat && x.tags.includes("best"))).slice(0, 10).map(card).join("");

      // interactions
      $$(".pdp-thumbs button").forEach((b) => b.addEventListener("click", () => {
        $$(".pdp-thumbs button").forEach((x) => x.classList.remove("active"));
        b.classList.add("active");
        const m = $("#main-img"); m.parentElement.classList.remove("img-fallback"); m.src = b.dataset.src;
      }));
      $$(".hp-terms button").forEach((b) => b.addEventListener("click", () => {
        $$(".hp-terms button").forEach((x) => x.classList.remove("active")); b.classList.add("active");
      }));
      const qty = $("#qty");
      $$("[data-q]").forEach((b) => b.addEventListener("click", () => { qty.value = Math.max(1, Math.min(10, Number(qty.value) + Number(b.dataset.q))); }));
      $("#add-btn").addEventListener("click", () => { Cart.add(p.id, Number(qty.value) || 1); toast("Added to cart", { href: "cart.html", label: "View cart" }); openDrawer("cart"); });
      $("#buy-btn").addEventListener("click", () => { Cart.add(p.id, Number(qty.value) || 1); location.href = "checkout.html"; });
      $$(".tab-btns button").forEach((b) => b.addEventListener("click", () => {
        $$(".tab-btns button").forEach((x) => x.classList.toggle("active", x === b));
        $$(".tab-panel").forEach((x) => x.classList.toggle("active", x.id === b.dataset.tab));
      }));
    },
  };

  /* ---------------- Cart ---------------- */
  const CartPage = {
    render() {
      const items = Cart.items();
      const wrap = $("#cart-wrap");
      if (!items.length) {
        wrap.innerHTML = `<div class="panel empty">${icon("cart")}<p><strong>Your cart is empty</strong><br>Browse our deals and fill it up.</p><a class="btn" href="shop.html?deal=1">Shop today's deals</a></div>`;
        $("#cart-recs").innerHTML = PRODUCTS.filter((p) => p.tags.includes("best")).slice(0, 8).map(card).join("");
        return;
      }
      const t = totals();
      const left = SITE.freeDeliveryFrom - (t.sub - t.discount);
      wrap.innerHTML = `<div class="cart-layout">
        <div class="panel">
          <h3>Items (${Cart.count()})</h3>
          ${items.map(({ id, qty }) => {
            const p = byId(id);
            return `<div class="cart-item">
              <a href="product.html?id=${p.id}">${imgTag(p, 200)}</a>
              <div>
                <div class="b">${esc(p.brand)}</div>
                <a class="t" href="product.html?id=${p.id}">${esc(p.name)}</a>
                <div class="ctrl">
                  <div class="qty sm"><button data-cq="${p.id}" data-d="-1" aria-label="Decrease">−</button><input value="${qty}" readonly aria-label="Quantity"><button data-cq="${p.id}" data-d="1" aria-label="Increase">+</button></div>
                  <button class="link-btn" data-remove="${p.id}">${icon("trash", "icon-sm")} Remove</button>
                </div>
              </div>
              <div class="line">${fmt(p.price * qty)}<small>${fmt(p.price)} each</small></div>
            </div>`;
          }).join("")}
        </div>
        <div class="panel">
          <h3>Order summary</h3>
          <div class="progress">${left > 0 ? `Add <strong>${fmt(left)}</strong> more for <strong>free delivery</strong>` : `🎉 You've unlocked <strong>free delivery!</strong>`}
            <div class="bar"><span style="width:${Math.min(100, ((t.sub - t.discount) / SITE.freeDeliveryFrom) * 100)}%"></span></div></div>
          <div class="sum-row"><span>Subtotal</span><span>${fmt(t.sub)}</span></div>
          ${t.discount ? `<div class="sum-row discount"><span>Promo (${t.code})</span><span>− ${fmt(t.discount)}</span></div>` : ""}
          <div class="sum-row"><span>Delivery</span><span class="${t.delivery ? "" : "free"}">${t.delivery ? fmt(t.delivery) : "FREE"}</span></div>
          <form class="promo" id="promo-form"><input class="input" name="code" placeholder="Promo code" value="${t.code}" aria-label="Promo code"><button class="btn btn-dark" type="submit">Apply</button></form>
          <div class="sum-row total"><span>Total</span><span>${fmt(t.total)}</span></div>
          <div class="monthly" style="text-align:right;margin-bottom:14px">or from <strong>${fmt(monthly(t.total, 36))}/mo</strong> with Pay Monthly</div>
          <a class="btn btn-lg btn-block" href="checkout.html">Proceed to checkout ${icon("right", "icon-sm")}</a>
          <a class="btn btn-ghost btn-block" href="shop.html" style="margin-top:10px">Continue shopping</a>
          <div class="secure">${icon("lock", "icon-sm")} Secure checkout · VAT included</div>
        </div>
      </div>`;
      $("#cart-recs").innerHTML = PRODUCTS.filter((p) => !items.some((i) => i.id === p.id) && p.old).slice(0, 8).map(card).join("");

      $$("[data-cq]").forEach((b) => b.addEventListener("click", () => {
        const it = Cart.items().find((i) => i.id === Number(b.dataset.cq));
        Cart.setQty(b.dataset.cq, it.qty + Number(b.dataset.d));
        this.render();
      }));
      $("#promo-form").addEventListener("submit", (e) => {
        e.preventDefault();
        const code = e.target.code.value.trim().toUpperCase();
        if (SITE.promoCodes[code]) { store.set("jss_promo", code); toast(`Promo ${code} applied`); }
        else { store.set("jss_promo", ""); toast(code ? "That code isn't valid" : "Promo removed"); }
        this.render();
      });
    },
    init() { this.render(); },
  };

  /* ---------------- Checkout ---------------- */
  const Checkout = {
    summary() {
      const t = totals();
      $("#co-summary").innerHTML = `
        <h3>Your order</h3>
        <div class="co-items">${Cart.items().map(({ id, qty }) => { const p = byId(id); return `<div class="co-item">${imgTag(p, 120)}<div>${esc(p.name)}<div class="qbadge">Qty ${qty}</div></div><strong>${fmt(p.price * qty)}</strong></div>`; }).join("")}</div>
        <div class="sum-row"><span>Subtotal</span><span>${fmt(t.sub)}</span></div>
        ${t.discount ? `<div class="sum-row discount"><span>Promo (${t.code})</span><span>− ${fmt(t.discount)}</span></div>` : ""}
        <div class="sum-row"><span>Delivery</span><span class="${this.deliveryFee() ? "" : "free"}">${this.deliveryFee() ? fmt(this.deliveryFee()) : "FREE"}</span></div>
        ${this.installFee() ? `<div class="sum-row"><span>AC installation</span><span>${fmt(this.installFee())}</span></div>` : ""}
        <div class="sum-row total"><span>Total</span><span>${fmt(this.grand())}</span></div>
        <button class="btn btn-lg btn-block" form="co-form" type="submit" style="margin-top:16px">${icon("lock", "icon-sm")} Place order</button>
        <div class="secure">${icon("shield", "icon-sm")} Demo mode — no payment is taken</div>`;
    },
    method: () => ($("input[name=delivery]:checked") || {}).value || "home",
    deliveryFee() { return this.method() === "collect" ? 0 : totals().delivery; },
    installFee() { return $("#install")?.checked ? 1500 : 0; },
    grand() { const t = totals(); return t.sub - t.discount + this.deliveryFee() + this.installFee(); },
    init() {
      if (!Cart.items().length) {
        $("#checkout").innerHTML = `<div class="panel empty">${icon("cart")}<p><strong>Your cart is empty</strong><br>Add something before checking out.</p><a class="btn" href="shop.html">Start shopping</a></div>`;
        return;
      }
      $("#district").innerHTML = `<option value="">Select district</option>` + DISTRICTS.map((d) => `<option>${d}</option>`).join("");
      $("#store").innerHTML = STORES.map((s) => `<option>${s.name} — ${s.address}</option>`).join("");
      const hasAC = Cart.items().some(({ id }) => /Air Conditioner/i.test(byId(id).name));
      $("#install-wrap").hidden = !hasAC;

      const sync = () => {
        $$(".option").forEach((o) => o.classList.toggle("checked", $("input", o).checked));
        const m = this.method();
        $("#home-fields").hidden = m !== "home";
        $("#collect-fields").hidden = m !== "collect";
        $$("#home-fields [data-req]").forEach((i) => (i.required = m === "home"));
        const pay = ($("input[name=pay]:checked") || {}).value;
        $$(".pay-detail").forEach((d) => d.classList.toggle("show", d.dataset.for === pay));
        $$("#card-fields input").forEach((i) => (i.required = pay === "card"));
        $$("#hp-fields input, #hp-fields select").forEach((i) => (i.required = pay === "hp"));
        if (pay === "hp") {
          const g = this.grand();
          $("#hp-plan").innerHTML = Object.keys(SITE.installments).map((n) => `<option value="${n}">${n} months — ${fmt(monthly(g, n))}/mo</option>`).join("");
        }
        this.summary();
      };
      $("#co-form").addEventListener("change", sync);
      sync();

      // card formatting
      $("#cc-num").addEventListener("input", (e) => { e.target.value = e.target.value.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim(); });
      $("#cc-exp").addEventListener("input", (e) => { let v = e.target.value.replace(/\D/g, "").slice(0, 4); if (v.length > 2) v = v.slice(0, 2) + "/" + v.slice(2); e.target.value = v; });
      $("#cc-cvc").addEventListener("input", (e) => { e.target.value = e.target.value.replace(/\D/g, "").slice(0, 4); });

      $("#co-form").addEventListener("submit", (e) => {
        e.preventDefault();
        const form = e.target;
        let ok = true;
        $$(".field", form).forEach((f) => {
          const i = $("input, select, textarea", f);
          if (!i || i.closest("[hidden]") || i.closest(".pay-detail:not(.show)")) { f.classList.remove("invalid"); return; }
          let valid = i.checkValidity();
          if (i.id === "phone") valid = valid && /^[\d\s+]{7,}$/.test(i.value);
          if (i.id === "cc-num" && i.required) valid = i.value.replace(/\s/g, "").length >= 15;
          if (i.id === "cc-exp" && i.required) valid = /^(0[1-9]|1[0-2])\/\d\d$/.test(i.value);
          f.classList.toggle("invalid", !valid);
          if (!valid) ok = false;
        });
        if (!ok) { toast("Please check the highlighted fields"); $(".field.invalid")?.scrollIntoView({ behavior: "smooth", block: "center" }); return; }

        const payLabels = { card: "Credit / debit card", juice: "Juice by MCB", myt: "my.t money", blink: "Blink by Emtel", cod: "Cash on delivery", hp: "Pay monthly (hire purchase)" };
        const pay = form.pay.value;
        const order = {
          no: "JSS-" + Date.now().toString().slice(-7),
          date: new Date().toLocaleString("en-GB"),
          name: form.fname.value + " " + form.lname.value,
          email: form.email.value,
          method: this.method() === "home" ? `Home delivery — ${form.district.value}` : `Click & Collect — ${form.store.value.split(" — ")[0]}`,
          pay: payLabels[pay] + (pay === "hp" ? ` (${form.hpplan.value} months)` : ""),
          total: this.grand(),
          items: Cart.items(),
        };
        store.set("jss_orders", [order, ...store.get("jss_orders", [])]);
        Cart.clear(); store.set("jss_promo", "");
        $("#checkout").innerHTML = `<div class="panel success">
          <div class="tick">${icon("check")}</div>
          <h1>Thank you, ${esc(form.fname.value)}!</h1>
          <p style="color:var(--muted)">Your order has been received. A confirmation will be sent to <strong>${esc(order.email)}</strong>${pay === "hp" ? " and our credit team will call you to finalise your pay-monthly plan" : ""}.</p>
          <div class="order-box">
            <div><span>Order number</span><strong>${order.no}</strong></div>
            <div><span>Date</span><span>${order.date}</span></div>
            <div><span>Delivery</span><span>${esc(order.method)}</span></div>
            <div><span>Payment</span><span>${esc(order.pay)}</span></div>
            <div><span>Total</span><strong>${fmt(order.total)}</strong></div>
          </div>
          <p style="font-size:13px;color:var(--muted)">This is a demo store — no payment was processed.</p>
          <a class="btn btn-lg" href="index.html">Continue shopping</a>
        </div>`;
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    },
  };

  /* ---------------- Stores ---------------- */
  const Stores = {
    init() {
      $("#stores-grid").innerHTML = STORES.map((s) => `<div class="store-card">
        <div class="pin">${icon("pin")}</div>
        <h3>JS Supersonic ${s.name}</h3>
        <p>${s.address}</p><p>${s.hours}</p><p>${s.phone}</p>
        <a class="see-all" href="https://www.google.com/maps/search/${encodeURIComponent(s.address + ", Mauritius")}" target="_blank" rel="noopener">Get directions ${icon("right", "icon-sm")}</a>
      </div>`).join("");
      $("#contact-info").innerHTML = `
        <div><span class="ico">${icon("call")}</span><div><strong>Call us</strong><br>${SITE.phone}</div></div>
        <div><span class="ico">${icon("chat")}</span><div><strong>WhatsApp</strong><br>${SITE.whatsapp}</div></div>
        <div><span class="ico">${icon("mail")}</span><div><strong>Email</strong><br>${SITE.email}</div></div>
        <div><span class="ico">${icon("clock")}</span><div><strong>Customer care hours</strong><br>Mon–Sat 9:00–18:00</div></div>`;
      $("#contact-form").addEventListener("submit", (e) => {
        e.preventDefault(); e.target.reset();
        toast("Message sent — we'll reply within 24 hours.");
      });
    },
  };

  /* ---------------- Boot ---------------- */
  renderHeader();
  renderFooter();
  const pages = { home: Home, shop: Shop, product: Product, cart: CartPage, checkout: Checkout, stores: Stores };
  pages[document.body.dataset.page]?.init();
  updateBadges();
  window.addEventListener("storage", updateBadges);
})();
