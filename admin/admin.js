/* JS Supersonic admin panel.
   Works without a server: changes are saved in this browser (localStorage) and the shop
   reads them on this device straight away. To publish them for every visitor, use
   Settings > Download catalogue and replace data/catalog.json in the GitHub repo. */
(() => {
  "use strict";
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const LS = {
    get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { toast("Browser storage is full or blocked."); } },
  };
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const fmt = (n) => "Rs " + Math.round(n || 0).toLocaleString("en-US");
  const imgUrl = (id, w) => (/^https?:|^data:/.test(id || "") ? id : `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&h=${w}&q=70`);
  const day = (d) => new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  const when = (d) => new Date(d).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" });
  const STATUSES = ["Placed", "Confirmed", "Out for delivery", "Delivered", "Cancelled"];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  // Images that fail to load show as an empty tile
  document.addEventListener("error", (e) => { if (e.target.tagName === "IMG") e.target.classList.add("broken"); }, true);

  /* ------------------------------------------------ data */
  let BASE = null; // the published catalogue (data/catalog.json)
  const state = { products: [], site: {} };
  async function loadBase() {
    try {
      const r = await fetch("../data/catalog.json", { cache: "no-store" });
      if (!r.ok) throw new Error();
      BASE = await r.json();
    } catch {
      // opened from disk: fall back to the generated catalogue
      const J = window.JSS;
      BASE = { site: J.site, categories: J.categories, products: J.products.map(({ slug, static: s, ...p }) => p), stores: J.stores, slides: [], faqs: {} };
    }
    const db = LS.get("jss_db", null);
    state.site = Object.assign({}, BASE.site, db && db.site);
    state.products = (db && Array.isArray(db.products) ? db.products : BASE.products).map((p) => ({ ...p }));
  }
  const CATS = () => BASE.categories;
  const catName = (id) => (CATS().find((c) => c.id === id) || {}).name || id;
  function save(msg) {
    const slugify = (s) => s.toLowerCase().replace(/["']/g, "").replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const published = new Set((window.JSS?.products || []).map((p) => p.id));
    state.products.forEach((p) => {
      p.slug = slugify(p.name);
      p.static = published.has(p.id) && window.JSS.products.find((x) => x.id === p.id).slug === p.slug;
    });
    LS.set("jss_db", { site: state.site, products: state.products, saved: new Date().toISOString() });
    LS.set("jss_db_dirty", true);
    if (msg) toast(msg);
    banner();
  }
  const orders = () => LS.get("jss_orders", []);
  const setOrders = (o) => LS.set("jss_orders", o);

  /* ------------------------------------------------ ui helpers */
  function toast(m) {
    const t = document.createElement("div"); t.className = "toast"; t.textContent = m;
    $(".toasts").appendChild(t); setTimeout(() => t.remove(), 2800);
  }
  function confirmBox(title, msg, yes = "Delete") {
    return new Promise((res) => {
      const d = $("#confirm");
      $("#c-t").textContent = title; $("#c-m").textContent = msg; $("#c-yes").textContent = yes;
      const done = (v) => { d.close(); res(v); };
      $("#c-yes").onclick = () => done(true); $("#c-no").onclick = () => done(false);
      d.oncancel = () => res(false);
      d.showModal();
    });
  }
  function openPanel(title, body, foot) {
    $("#panel-t").textContent = title; $("#panel-b").innerHTML = body; $("#panel-f").innerHTML = foot || "";
    $("#panel").classList.add("on"); $("#panel").setAttribute("aria-hidden", "false"); $("#scrim").classList.add("on");
    setTimeout(() => $("#panel-b input, #panel-b select, #panel-b button")?.focus(), 80);
  }
  function closePanel() {
    $("#panel").classList.remove("on"); $("#panel").setAttribute("aria-hidden", "true"); $("#scrim").classList.remove("on");
    $("#side").classList.remove("on");
  }
  document.addEventListener("click", (e) => { if (e.target.closest("[data-close]") || e.target.id === "scrim") closePanel(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closePanel(); });
  function download(name, text, type = "application/json") {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([text], { type })); a.download = name; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }
  const csv = (rows) => rows.map((r) => r.map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
  function banner() {
    const b = $("#dirty"); if (!b) return;
    b.hidden = !LS.get("jss_db_dirty", false);
  }
  const dirtyBanner = `<div class="banner" id="dirty" hidden><span><b>Unpublished changes.</b> They show in this browser only. Download the catalogue and upload it to GitHub to publish them for everyone.</span><button class="btn sm ink" type="button" data-export>Download catalogue</button></div>`;

  /* ------------------------------------------------ auth (no password is stored in the code) */
  async function hash(s, salt) {
    const data = new TextEncoder().encode(salt + ":" + s);
    const buf = await crypto.subtle.digest("SHA-256", data);
    return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
  }
  async function gate() {
    const cred = LS.get("jss_admin", null);
    try { if (sessionStorage.getItem("jss_admin_ok") === "1" && cred) return start(); } catch { /* private mode */ }
    $("#gate").hidden = false;
    const setup = !cred;
    if (setup) {
      $("#gate-title").textContent = "Create the admin password";
      $("#gate-note").textContent = "First visit on this browser. Choose a password of at least 8 characters. Only a scrambled version is saved.";
      $("#pw2-row").hidden = false; $("#gate-btn").textContent = "Create password";
      $("#pw").autocomplete = "new-password";
    }
    let tries = 0;
    $("#gate-form").addEventListener("submit", async (e) => {
      e.preventDefault();
      const pw = $("#pw").value, err = $("#gate-err");
      if (pw.length < 8) { err.textContent = "Use at least 8 characters."; return; }
      if (setup) {
        if (pw !== $("#pw2").value) { err.textContent = "The two passwords don't match."; return; }
        const salt = crypto.getRandomValues(new Uint32Array(2)).join("");
        LS.set("jss_admin", { salt, hash: await hash(pw, salt) });
      } else {
        if (tries >= 5) { err.textContent = "Too many tries. Reload the page to try again."; return; }
        if ((await hash(pw, cred.salt)) !== cred.hash) { tries++; err.textContent = "That password is not right."; $("#pw").select(); return; }
      }
      try { sessionStorage.setItem("jss_admin_ok", "1"); } catch { /* ignore */ }
      $("#gate").hidden = true; start();
    });
    $("#pw").focus();
  }

  /* ------------------------------------------------ router with sliding nav highlight */
  const VIEWS = {};
  let current = "";
  function route() {
    const v = (location.hash.replace(/^#\//, "") || "dashboard").split("?")[0];
    const view = VIEWS[v] ? v : "dashboard";
    $$("#nav a").forEach((a) => { if (a.dataset.v === view) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current"); });
    const on = $(`#nav a[data-v="${view}"]`);
    $("#nav .hl").style.transform = `translateY(${on.offsetTop}px)`;
    $("#v-acts").innerHTML = "";
    const el = $("#view");
    el.classList.remove("in"); void el.offsetWidth;
    VIEWS[view](el);
    el.classList.add("in");
    if (current && current !== view) el.focus({ preventScroll: true });
    current = view;
    document.title = `${$("#v-title").textContent} | JS Supersonic admin`;
    closePanel(); window.scrollTo(0, 0); badges(); banner();
  }
  function badges() {
    const pend = orders().filter((o) => o.status === "Placed").length;
    $("#n-orders").hidden = !pend; $("#n-orders").textContent = pend;
    const unread = LS.get("jss_msgs", []).filter((m) => !m.read).length;
    $("#n-msgs").hidden = !unread; $("#n-msgs").textContent = unread;
  }
  const title = (t, acts = "") => { $("#v-title").textContent = t; $("#v-acts").innerHTML = acts; };

  /* ------------------------------------------------ dashboard */
  VIEWS.dashboard = (el) => {
    title("Dashboard", `<a class="btn sm line" href="#/orders">All orders</a>`);
    const all = orders(), live = all.filter((o) => o.status !== "Cancelled");
    const revenue = live.reduce((s, o) => s + o.total, 0);
    const since = Date.now() - 30 * 864e5;
    const last30 = live.filter((o) => new Date(o.date) >= since);
    const low = state.products.filter((p) => !p.hidden && p.stock <= 5).sort((a, b) => a.stock - b.stock);
    // top sellers from order lines
    const sold = {};
    live.forEach((o) => o.items.forEach((i) => { sold[i.id] = sold[i.id] || { name: i.name, qty: 0, rev: 0 }; sold[i.id].qty += i.qty; sold[i.id].rev += i.qty * i.price; }));
    const top = Object.values(sold).sort((a, b) => b.rev - a.rev).slice(0, 5);
    el.innerHTML = `${dirtyBanner}
      ${all.length ? "" : `<div class="banner"><span><b>No orders yet.</b> Orders placed on the shop from this browser appear here. You can load sample orders to see how the dashboard works.</span><button class="btn sm" type="button" id="seed">Load sample orders</button></div>`}
      <div class="kpis">
        <div class="kpi dark"><p>Revenue, last 30 days</p><strong>${fmt(last30.reduce((s, o) => s + o.total, 0))}</strong><span>${fmt(revenue)} all time</span></div>
        <div class="kpi"><p>Orders, last 30 days</p><strong>${last30.length}</strong><span>${all.filter((o) => o.status === "Placed").length} waiting to be confirmed</span></div>
        <div class="kpi"><p>Average order</p><strong>${fmt(live.length ? revenue / live.length : 0)}</strong><span>${live.length} orders counted</span></div>
        <div class="kpi"><p>Products live</p><strong>${state.products.filter((p) => !p.hidden).length}</strong><span>${low.length} low on stock</span></div>
      </div>
      <div class="grid2">
        <section class="card" aria-labelledby="ch-t"><h2 id="ch-t">Sales per day, last 14 days</h2><div class="chart" id="chart"></div></section>
        <section class="card"><h2>Low stock <a href="#/products">Manage</a></h2>
          ${low.length ? `<ul class="list">${low.slice(0, 7).map((p) => `<li><span>${esc(p.name)}</span><span class="pill ${p.stock === 0 ? "low" : ""}">${p.stock} left</span></li>`).join("")}</ul>` : `<p class="empty-s">Every product has more than 5 in stock.</p>`}</section>
      </div>
      <div class="grid2 even">
        <section class="card"><h2>Latest orders <a href="#/orders">See all</a></h2>
          ${all.length ? `<ul class="list">${all.slice(0, 6).map((o) => `<li><span><b>${esc(o.no)}</b> <span class="sub" style="color:var(--muted)">${esc(o.name)}</span></span><span><span class="pill ${esc(o.status.split(" ")[0])}">${esc(o.status)}</span> <b>${fmt(o.total)}</b></span></li>`).join("")}</ul>` : `<p class="empty-s">No orders yet.</p>`}</section>
        <section class="card"><h2>Best sellers by revenue</h2>
          ${top.length ? `<ul class="list">${top.map((t) => `<li><span>${esc(t.name)} <span style="color:var(--muted)">x${t.qty}</span></span><b>${fmt(t.rev)}</b></li>`).join("")}</ul>` : `<p class="empty-s">Appears once orders come in.</p>`}</section>
      </div>`;
    chart($("#chart"), live);
    $("#seed")?.addEventListener("click", seed);
  };
  function chart(box, live) {
    const days = [...Array(14)].map((_, i) => { const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - (13 - i)); return d; });
    const vals = days.map((d) => live.filter((o) => { const x = new Date(o.date); x.setHours(0, 0, 0, 0); return +x === +d; }).reduce((s, o) => s + o.total, 0));
    const W = 640, H = 260, L = 48, B = 26, T = 18, max = Math.max(...vals, 1);
    const step = (() => { const raw = max / 4, p = 10 ** Math.floor(Math.log10(raw)), n = raw / p; return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * p; })();
    const top = Math.ceil(max / step) * step, y = (v) => T + (H - T - B) * (1 - v / top);
    const slot = (W - L) / 14, bw = Math.min(24, slot - 6);
    const short = (v) => (v >= 1000 ? Math.round(v / 1000) + "K" : String(v));
    const peak = vals.indexOf(Math.max(...vals));
    let g = `<g class="grid">`, ax = `<g class="ax">`;
    for (let v = 0; v <= top; v += step) { g += `<line x1="${L}" x2="${W}" y1="${y(v)}" y2="${y(v)}"/>`; ax += `<text x="${L - 8}" y="${y(v) + 4}" text-anchor="end">${v ? "Rs " + short(v) : "0"}</text>`; }
    days.forEach((d, i) => { if (i % 2 === 0 || i === 13) ax += `<text x="${L + slot * i + slot / 2}" y="${H - 6}" text-anchor="middle">${day(d)}</text>`; });
    g += "</g>"; ax += "</g>";
    const bars = vals.map((v, i) => {
      const x = L + slot * i + (slot - bw) / 2, h = Math.max(0, y(0) - y(v)), r = Math.min(4, h);
      const path = h ? `M${x},${y(0)} V${y(v) + r} Q${x},${y(v)} ${x + r},${y(v)} H${x + bw - r} Q${x + bw},${y(v)} ${x + bw},${y(v) + r} V${y(0)} Z` : "";
      return `<g data-i="${i}"><rect class="hit" x="${L + slot * i}" y="${T}" width="${slot}" height="${H - T - B}"/><path class="bar" d="${path}"/>${i === peak && v ? `<text class="lbl" x="${x + bw / 2}" y="${y(v) - 6}" text-anchor="middle">${short(v)}</text>` : ""}</g>`;
    }).join("");
    box.innerHTML = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Sales per day for the last 14 days. Highest: ${fmt(vals[peak])} on ${day(days[peak])}.">${g}${ax}${bars}</svg><div class="tip" aria-hidden="true"></div>
      <table class="sr"><caption>Sales per day</caption><tbody>${days.map((d, i) => `<tr><th>${day(d)}</th><td>${fmt(vals[i])}</td></tr>`).join("")}</tbody></table>`;
    const tip = $(".tip", box), svg = $("svg", box);
    $$("g[data-i]", svg).forEach((gEl) => {
      gEl.addEventListener("mouseenter", () => {
        const i = +gEl.dataset.i, r = svg.getBoundingClientRect(), k = r.width / W;
        const orderCount = live.filter((o) => { const x = new Date(o.date); x.setHours(0, 0, 0, 0); return +x === +days[i]; }).length;
        tip.innerHTML = `${day(days[i])}<b>${fmt(vals[i])}</b>${orderCount} order${orderCount === 1 ? "" : "s"}`;
        tip.style.left = (L + slot * i + slot / 2) * k + "px"; tip.style.top = y(vals[i]) * k + "px";
        tip.classList.add("on"); gEl.classList.add("on");
      });
      gEl.addEventListener("mouseleave", () => { tip.classList.remove("on"); gEl.classList.remove("on"); });
    });
  }
  function seed() {
    const names = ["Priya Ramsamy", "Kevin Li Kam Wa", "Anne-Laure Duval", "Rajesh Boodhoo", "Sarah Jolicoeur", "Yash Gopaul", "Nadia Peerbux", "Jean-Marc Lebon"];
    const live = state.products.filter((p) => !p.hidden);
    const list = [];
    for (let i = 0; i < 26; i++) {
      const d = new Date(Date.now() - Math.random() * 14 * 864e5);
      const items = [...Array(1 + Math.floor(Math.random() * 2))].map(() => { const p = live[Math.floor(Math.random() * live.length)]; return { id: p.id, qty: 1, name: p.name, price: p.price }; });
      const sub = items.reduce((s, x) => s + x.price * x.qty, 0), name = names[i % names.length];
      const st = d < Date.now() - 4 * 864e5 ? (i % 9 === 0 ? "Cancelled" : "Delivered") : STATUSES[i % 3];
      list.push({ no: "JSS" + (9000000 + i), date: d.toISOString(), name, email: name.toLowerCase().replace(/[^a-z]+/g, ".") + "@example.com", phone: "5" + String(7000000 + i * 1371).slice(0, 7),
        method: i % 3 ? "home" : "collect", address: i % 3 ? "Sample address, Quatre Bornes, Plaines Wilhems" : "", store: i % 3 ? "" : "Curepipe", notes: "",
        pay: ["Card", "Juice by MCB", "Cash on delivery", "Pay monthly (24 months)"][i % 4], items, sub, discount: 0, delivery: sub >= 5000 ? 0 : 300, install: 0,
        total: sub + (sub >= 5000 ? 0 : 300), status: st, history: [{ status: "Placed", at: d.toISOString() }].concat(st !== "Placed" ? [{ status: st, at: new Date(+d + 864e5).toISOString() }] : []), sample: true });
    }
    setOrders(list.sort((a, b) => new Date(b.date) - new Date(a.date)).concat(orders()));
    toast("Sample orders loaded. Clear them in Settings.");
    if (current === "dashboard") route(); else location.hash = "#/dashboard";
  }

  /* ------------------------------------------------ products */
  VIEWS.products = (el) => {
    title("Products", `<button class="btn sm" type="button" id="add-p">Add product</button>`);
    el.innerHTML = `${dirtyBanner}<div class="tools">
      <label class="sr" for="p-q">Search products</label><input class="in" id="p-q" type="search" placeholder="Search name or brand">
      <label class="sr" for="p-c">Category</label><select class="sel" id="p-c"><option value="">All categories</option>${CATS().map((c) => `<option value="${c.id}">${esc(c.name)}</option>`).join("")}</select>
      <label class="sr" for="p-s">Show</label><select class="sel" id="p-s"><option value="">All products</option><option value="live">Live</option><option value="hidden">Hidden</option><option value="low">Low stock (5 or less)</option><option value="sale">On sale</option></select>
      <span class="sp" id="p-n" style="color:var(--muted);font-size:14px;align-self:center"></span></div>
      <div class="tbl-wrap"><table class="t"><thead><tr><th></th><th>Product</th><th class="hide-s">Category</th><th class="num">Price</th><th class="num hide-s">Was</th><th class="num">Stock</th><th>Status</th><th><span class="sr">Actions</span></th></tr></thead><tbody id="p-rows"></tbody></table></div>`;
    const draw = () => {
      const q = $("#p-q").value.toLowerCase(), c = $("#p-c").value, s = $("#p-s").value;
      const list = state.products.filter((p) => (!q || `${p.name} ${p.brand}`.toLowerCase().includes(q)) && (!c || p.cat === c) &&
        (!s || (s === "live" && !p.hidden) || (s === "hidden" && p.hidden) || (s === "low" && p.stock <= 5) || (s === "sale" && p.old > p.price)));
      $("#p-n").textContent = `${list.length} of ${state.products.length}`;
      $("#p-rows").innerHTML = list.map((p) => `<tr class="click" data-id="${p.id}">
        <td><img src="${imgUrl(p.img, 96)}" alt="" loading="lazy" width="48" height="48"></td>
        <td><span class="name">${esc(p.name)}</span><br><span class="sub">${esc(p.brand)} · ${esc(p.sub || "")}</span></td>
        <td class="hide-s">${esc(catName(p.cat))}</td><td class="num"><b>${fmt(p.price)}</b></td><td class="num hide-s">${p.old ? fmt(p.old) : ""}</td>
        <td class="num">${p.stock <= 5 ? `<span class="pill low">${p.stock}</span>` : p.stock}</td>
        <td>${p.hidden ? '<span class="pill off">Hidden</span>' : '<span class="pill live">Live</span>'}</td>
        <td><div class="row-acts"><button class="btn sm line" type="button" data-edit="${p.id}">Edit</button></div></td></tr>`).join("") ||
        `<tr><td colspan="8" class="empty-s">No products match.</td></tr>`;
    };
    ["p-q", "p-c", "p-s"].forEach((id) => $("#" + id).addEventListener("input", draw));
    $("#p-rows").addEventListener("click", (e) => { const r = e.target.closest("tr[data-id]"); if (r) editProduct(+r.dataset.id, draw); });
    $("#add-p").addEventListener("click", () => editProduct(null, draw));
    draw();
  };
  function editProduct(id, redraw) {
    const p = id ? state.products.find((x) => x.id === id) : { id: Math.max(0, ...state.products.map((x) => x.id)) + 1, cat: CATS()[0].id, sub: "", brand: "", name: "", price: 0, stock: 10, img: "", tags: [], desc: "", specs: {}, isNew: true };
    const subs = (cat) => [...new Set(state.products.filter((x) => x.cat === cat).map((x) => x.sub).filter(Boolean))];
    openPanel(id ? "Edit product" : "Add product", `
      <div class="prev"><img id="e-prev" src="${imgUrl(p.img, 200)}" alt=""><div><b id="e-pn">${esc(p.name || "New product")}</b><br><span style="color:var(--muted);font-size:14px">Item no. JSS-${String(p.id).padStart(5, "0")}</span></div></div>
      <label class="f">Product name<input class="in" id="e-name" value="${esc(p.name)}" required></label>
      <div class="two"><label class="f">Brand<input class="in" id="e-brand" value="${esc(p.brand)}" list="brands"></label>
      <label class="f">Category<select class="sel" id="e-cat">${CATS().map((c) => `<option value="${c.id}"${c.id === p.cat ? " selected" : ""}>${esc(c.name)}</option>`).join("")}</select></label></div>
      <datalist id="brands">${[...new Set(state.products.map((x) => x.brand))].map((b) => `<option value="${esc(b)}">`).join("")}</datalist>
      <label class="f">Type <small>Shown as a filter on the category page, e.g. TVs or Sofas</small><input class="in" id="e-sub" value="${esc(p.sub || "")}" list="subs"></label><datalist id="subs">${subs(p.cat).map((s) => `<option value="${esc(s)}">`).join("")}</datalist>
      <div class="three"><label class="f">Price (Rs)<input class="in" id="e-price" type="number" min="0" step="10" value="${p.price || ""}"></label>
      <label class="f">Was (Rs) <small>Leave empty if not on sale</small><input class="in" id="e-old" type="number" min="0" step="10" value="${p.old || ""}"></label>
      <label class="f">In stock<input class="in" id="e-stock" type="number" min="0" value="${p.stock ?? 0}"></label></div>
      <label class="f">Photo <small>Paste an image link, or an Unsplash photo id</small><input class="in" id="e-img" value="${esc(p.img)}"></label>
      <label class="f">Description<textarea class="in" id="e-desc">${esc(p.desc)}</textarea></label>
      <label class="f">Specifications <small>One per line, written as Name: value</small><textarea class="in" id="e-specs" style="min-height:130px">${esc(Object.entries(p.specs || {}).map(([k, v]) => `${k}: ${v}`).join("\n"))}</textarea></label>
      <div class="checks"><label><input type="checkbox" id="e-new"${(p.tags || []).includes("new") ? " checked" : ""}> New arrival</label><label><input type="checkbox" id="e-best"${(p.tags || []).includes("best") ? " checked" : ""}> Bestseller</label><label><input type="checkbox" id="e-hidden"${p.hidden ? " checked" : ""}> Hide from the shop</label></div>
      <p class="err" id="e-err" role="alert"></p>`,
      `${id ? `<button class="btn danger sm" type="button" id="e-del" style="margin-right:auto">Delete</button><button class="btn line sm" type="button" id="e-dup">Duplicate</button>` : ""}<button class="btn line sm" type="button" data-close>Cancel</button><button class="btn sm" type="button" id="e-save">Save</button>`);
    $("#e-img").addEventListener("change", () => { const i = $("#e-prev"); i.classList.remove("broken"); i.src = imgUrl($("#e-img").value.trim(), 200); });
    $("#e-name").addEventListener("input", () => ($("#e-pn").textContent = $("#e-name").value || "New product"));
    $("#e-save").addEventListener("click", () => {
      const name = $("#e-name").value.trim(), price = +$("#e-price").value, old = +$("#e-old").value || 0;
      const err = $("#e-err");
      if (!name) { err.textContent = "Give the product a name."; $("#e-name").focus(); return; }
      if (!(price > 0)) { err.textContent = "Enter a price above zero."; $("#e-price").focus(); return; }
      if (old && old <= price) { err.textContent = "The was price must be higher than the price."; $("#e-old").focus(); return; }
      const specs = {};
      $("#e-specs").value.split("\n").forEach((l) => { const i = l.indexOf(":"); if (i > 0) specs[l.slice(0, i).trim()] = l.slice(i + 1).trim(); });
      const tags = [old ? "deal" : "", $("#e-new").checked ? "new" : "", $("#e-best").checked ? "best" : ""].filter(Boolean);
      Object.assign(p, { name, brand: $("#e-brand").value.trim() || "Supersonic Home", cat: $("#e-cat").value, sub: $("#e-sub").value.trim(), price, stock: Math.max(0, +$("#e-stock").value || 0),
        img: $("#e-img").value.trim(), desc: $("#e-desc").value.trim(), specs, tags, hidden: $("#e-hidden").checked });
      if (old) p.old = old; else delete p.old;
      if (p.isNew) { delete p.isNew; p.rating = 0; p.reviews = 0; state.products.push(p); }
      save(`${name} saved`); closePanel(); redraw();
    });
    $("#e-del")?.addEventListener("click", async () => {
      if (!(await confirmBox("Delete this product?", `${p.name} will be removed from the shop. You can't undo this.`))) return;
      state.products = state.products.filter((x) => x.id !== p.id); save("Product deleted"); closePanel(); redraw();
    });
    $("#e-dup")?.addEventListener("click", () => {
      const copy = JSON.parse(JSON.stringify(p)); copy.id = Math.max(...state.products.map((x) => x.id)) + 1; copy.name += " (copy)"; copy.hidden = true;
      state.products.push(copy); save("Copy created, hidden until you edit it"); closePanel(); redraw();
    });
  }

  /* ------------------------------------------------ orders */
  VIEWS.orders = (el) => {
    title("Orders", `<button class="btn sm line" type="button" id="o-csv">Export CSV</button>`);
    el.innerHTML = `<div class="tools"><label class="sr" for="o-q">Search orders</label><input class="in" id="o-q" type="search" placeholder="Order number, name or email">
      <label class="sr" for="o-s">Status</label><select class="sel" id="o-s"><option value="">Every status</option>${STATUSES.map((s) => `<option>${s}</option>`).join("")}</select><span class="sp" id="o-n" style="color:var(--muted);font-size:14px;align-self:center"></span></div>
      <div class="tbl-wrap"><table class="t"><thead><tr><th>Order</th><th>Customer</th><th class="hide-s">Date</th><th class="hide-s">Delivery</th><th>Status</th><th class="num">Total</th></tr></thead><tbody id="o-rows"></tbody></table></div>`;
    const draw = () => {
      const q = $("#o-q").value.toLowerCase(), s = $("#o-s").value;
      const list = orders().filter((o) => (!q || `${o.no} ${o.name} ${o.email}`.toLowerCase().includes(q)) && (!s || o.status === s));
      $("#o-n").textContent = `${list.length} order${list.length === 1 ? "" : "s"}`;
      $("#o-rows").innerHTML = list.map((o) => `<tr class="click" data-no="${esc(o.no)}" tabindex="0"><td><b>${esc(o.no)}</b>${o.sample ? ' <span class="pill">Sample</span>' : ""}</td><td>${esc(o.name)}<br><span class="sub">${esc(o.email)}</span></td>
        <td class="hide-s">${when(o.date)}</td><td class="hide-s">${o.method === "collect" ? "Collect, " + esc(o.store) : "Home delivery"}</td><td><span class="pill ${esc(o.status.split(" ")[0])}">${esc(o.status)}</span></td><td class="num"><b>${fmt(o.total)}</b></td></tr>`).join("") ||
        `<tr><td colspan="6" class="empty-s">No orders${q || s ? " match" : " yet. They appear here when customers check out"}.</td></tr>`;
    };
    $("#o-q").addEventListener("input", draw); $("#o-s").addEventListener("input", draw);
    const openRow = (e) => { const r = e.target.closest("tr[data-no]"); if (r && (e.type === "click" || e.key === "Enter")) showOrder(r.dataset.no, draw); };
    $("#o-rows").addEventListener("click", openRow); $("#o-rows").addEventListener("keydown", openRow);
    $("#o-csv").addEventListener("click", () => download(`orders-${new Date().toISOString().slice(0, 10)}.csv`,
      csv([["Order", "Date", "Customer", "Email", "Phone", "Delivery", "Address or store", "Payment", "Items", "Total", "Status"]].concat(orders().map((o) => [o.no, when(o.date), o.name, o.email, o.phone, o.method, o.address || o.store, o.pay, o.items.map((i) => `${i.qty} x ${i.name}`).join("; "), o.total, o.status]))), "text/csv"));
    draw();
  };
  function showOrder(no, redraw) {
    const all = orders(), o = all.find((x) => x.no === no);
    openPanel(`Order ${o.no}`, `
      <label class="f">Status<select class="sel" id="o-status">${STATUSES.map((s) => `<option${s === o.status ? " selected" : ""}>${s}</option>`).join("")}</select></label>
      <dl class="kv"><dt>Customer</dt><dd>${esc(o.name)}</dd><dt>Email</dt><dd><a href="mailto:${esc(o.email)}">${esc(o.email)}</a></dd><dt>Phone</dt><dd><a href="tel:${esc(o.phone)}">${esc(o.phone)}</a></dd>
      <dt>${o.method === "collect" ? "Collect from" : "Deliver to"}</dt><dd>${esc(o.address || o.store)}</dd>${o.notes ? `<dt>Notes</dt><dd>${esc(o.notes)}</dd>` : ""}<dt>Payment</dt><dd>${esc(o.pay)}</dd><dt>Placed</dt><dd>${when(o.date)}</dd></dl>
      <div class="card" style="padding:0"><table class="t"><tbody>${o.items.map((i) => `<tr><td>${i.qty} x ${esc(i.name)}</td><td class="num">${fmt(i.price * i.qty)}</td></tr>`).join("")}
      <tr><td>Delivery</td><td class="num">${o.delivery ? fmt(o.delivery) : "Free"}</td></tr>${o.discount ? `<tr><td>Promo ${esc(o.code)}</td><td class="num">− ${fmt(o.discount)}</td></tr>` : ""}${o.install ? `<tr><td>Installation</td><td class="num">${fmt(o.install)}</td></tr>` : ""}
      <tr><td><b>Total</b></td><td class="num"><b>${fmt(o.total)}</b></td></tr></tbody></table></div>
      <div><h3 style="font-size:14px;margin-bottom:10px">History</h3><ul class="hist">${(o.history || []).map((h) => `<li><b>${esc(h.status)}</b><small>${when(h.at)}</small></li>`).join("")}</ul></div>`,
      `<button class="btn danger sm" type="button" id="o-del" style="margin-right:auto">Delete</button><button class="btn line sm" type="button" data-close>Close</button><button class="btn sm" type="button" id="o-save">Update status</button>`);
    $("#o-save").addEventListener("click", () => {
      const s = $("#o-status").value;
      if (s !== o.status) { o.status = s; (o.history = o.history || []).push({ status: s, at: new Date().toISOString() }); setOrders(all); toast(`${o.no} marked ${s.toLowerCase()}`); }
      closePanel(); redraw(); badges();
    });
    $("#o-del").addEventListener("click", async () => {
      if (!(await confirmBox("Delete this order?", `${o.no} will be removed for good.`))) return;
      setOrders(all.filter((x) => x.no !== o.no)); closePanel(); redraw(); badges(); toast("Order deleted");
    });
  }

  /* ------------------------------------------------ customers */
  VIEWS.customers = (el) => {
    title("Customers", `<button class="btn sm line" type="button" id="c-csv">Export CSV</button>`);
    const map = {};
    LS.get("jss_users", []).forEach((u) => (map[u.email] = { name: `${u.fname} ${u.lname}`, email: u.email, phone: u.phone, orders: 0, spent: 0, account: true, last: u.created }));
    orders().forEach((o) => {
      const c = map[o.email] = map[o.email] || { name: o.name, email: o.email, phone: o.phone, orders: 0, spent: 0, account: false, last: o.date };
      c.orders++; if (o.status !== "Cancelled") c.spent += o.total; if (new Date(o.date) > new Date(c.last)) c.last = o.date;
    });
    const list = Object.values(map).sort((a, b) => b.spent - a.spent);
    const subs = LS.get("jss_subs", []);
    el.innerHTML = `<div class="tbl-wrap"><table class="t"><thead><tr><th>Customer</th><th class="hide-s">Phone</th><th class="num">Orders</th><th class="num">Spent</th><th class="hide-s">Account</th></tr></thead><tbody>
      ${list.map((c) => `<tr><td><span class="name">${esc(c.name)}</span><br><span class="sub">${esc(c.email)}</span></td><td class="hide-s">${esc(c.phone || "")}</td><td class="num">${c.orders}</td><td class="num"><b>${fmt(c.spent)}</b></td><td class="hide-s">${c.account ? '<span class="pill live">Yes</span>' : '<span class="pill off">Guest</span>'}</td></tr>`).join("") || `<tr><td colspan="5" class="empty-s">No customers yet.</td></tr>`}</tbody></table></div>
      <section class="card" style="margin-top:16px"><h2>Newsletter sign-ups (${subs.length}) ${subs.length ? '<a href="#" id="s-csv">Export</a>' : ""}</h2>${subs.length ? `<ul class="list">${subs.slice(0, 20).map((s) => `<li><span>${esc(s.email)}</span><span style="color:var(--muted)">${day(s.at)}</span></li>`).join("")}</ul>` : '<p class="empty-s">Nobody has signed up yet.</p>'}</section>`;
    $("#c-csv").addEventListener("click", () => download("customers.csv", csv([["Name", "Email", "Phone", "Orders", "Spent", "Account"]].concat(list.map((c) => [c.name, c.email, c.phone, c.orders, c.spent, c.account ? "yes" : "guest"]))), "text/csv"));
    $("#s-csv")?.addEventListener("click", (e) => { e.preventDefault(); download("newsletter.csv", csv([["Email", "Signed up"]].concat(subs.map((s) => [s.email, s.at]))), "text/csv"); });
  };

  /* ------------------------------------------------ messages */
  VIEWS.messages = (el) => {
    title("Messages");
    const draw = () => {
      const msgs = LS.get("jss_msgs", []);
      el.innerHTML = msgs.length ? `<div class="tbl-wrap"><table class="t"><thead><tr><th>From</th><th>Topic</th><th class="hide-s">Received</th><th><span class="sr">Actions</span></th></tr></thead><tbody>
        ${msgs.map((m, i) => `<tr class="click" data-i="${i}" tabindex="0"><td>${m.read ? "" : '<span class="pill Out">New</span> '}<span class="name">${esc(m.name)}</span><br><span class="sub">${esc(m.email)}</span></td><td>${esc(m.topic)}<br><span class="sub">${esc((m.message || "").slice(0, 70))}${(m.message || "").length > 70 ? "…" : ""}</span></td><td class="hide-s">${when(m.at)}</td><td><div class="row-acts"><button class="btn sm line" type="button">Open</button></div></td></tr>`).join("")}</tbody></table></div>`
        : `<div class="card empty-s">No messages yet. Messages sent from the Help page appear here.</div>`;
      $$("tr[data-i]", el).forEach((r) => {
        const open = () => {
          const all = LS.get("jss_msgs", []), m = all[+r.dataset.i]; m.read = true; LS.set("jss_msgs", all); badges();
          openPanel(esc(m.topic), `<dl class="kv"><dt>From</dt><dd>${esc(m.name)}</dd><dt>Email</dt><dd><a href="mailto:${esc(m.email)}">${esc(m.email)}</a></dd>${m.phone ? `<dt>Phone</dt><dd><a href="tel:${esc(m.phone)}">${esc(m.phone)}</a></dd>` : ""}<dt>Received</dt><dd>${when(m.at)}</dd></dl><p style="white-space:pre-wrap;background:var(--paper);padding:14px;border-radius:8px">${esc(m.message)}</p>`,
            `<button class="btn danger sm" type="button" id="m-del" style="margin-right:auto">Delete</button><a class="btn sm" href="mailto:${esc(m.email)}?subject=${encodeURIComponent("Re: " + m.topic)}">Reply by email</a>`);
          $("#m-del").onclick = () => { LS.set("jss_msgs", LS.get("jss_msgs", []).filter((_, j) => j !== +r.dataset.i)); closePanel(); draw(); badges(); toast("Message deleted"); };
          draw();
        };
        r.addEventListener("click", open); r.addEventListener("keydown", (e) => e.key === "Enter" && open());
      });
    };
    draw();
  };

  /* ------------------------------------------------ promotions */
  VIEWS.promotions = (el) => {
    title("Promotions");
    const draw = () => {
      const codes = state.site.promo_codes || {};
      el.innerHTML = `${dirtyBanner}<div class="set">
        <section class="card"><h2>Promo codes</h2><p class="help">Customers type these in the cart. The discount comes off the subtotal.</p>
          <div class="tbl-wrap" style="border:2px solid var(--line)"><table class="t"><thead><tr><th>Code</th><th class="num">Discount</th><th><span class="sr">Remove</span></th></tr></thead><tbody>
          ${Object.entries(codes).map(([c, r]) => `<tr><td><b>${esc(c)}</b></td><td class="num">${Math.round(r * 100)}%</td><td><div class="row-acts"><button class="btn sm danger" type="button" data-rm="${esc(c)}">Remove</button></div></td></tr>`).join("") || '<tr><td colspan="3" class="empty-s">No codes.</td></tr>'}</tbody></table></div>
          <form id="code-f" class="two" novalidate style="align-items:end"><label class="f">New code<input class="in" id="code-n" placeholder="e.g. WINTER15" maxlength="20"></label><label class="f">Discount %<input class="in" id="code-r" type="number" min="1" max="90" placeholder="15"></label><button class="btn sm" type="submit" style="grid-column:1/-1">Add code</button></form></section>
        <section class="card"><h2>Announcement bar</h2><p class="help">The orange line at the very top of every page.</p>
          <label class="f">Text<input class="in" id="ann" value="${esc(state.site.announcement || "")}" maxlength="90"></label><button class="btn sm" type="button" id="ann-save" style="justify-self:start">Save text</button>
          <h2 style="margin-top:10px">Products on sale</h2><p class="help">${state.products.filter((p) => p.old > p.price && !p.hidden).length} products have a was price and appear on the Deals page. Set the was price on each product.</p><a class="btn sm line" href="#/products" style="justify-self:start">Go to products</a></section></div>`;
      $$("[data-rm]", el).forEach((b) => b.addEventListener("click", () => { delete state.site.promo_codes[b.dataset.rm]; save("Code removed"); draw(); }));
      $("#code-f").addEventListener("submit", (e) => {
        e.preventDefault();
        const c = $("#code-n").value.trim().toUpperCase().replace(/\s+/g, ""), r = +$("#code-r").value;
        if (!/^[A-Z0-9]{3,20}$/.test(c)) return toast("Codes use 3 to 20 letters or numbers.");
        if (!(r >= 1 && r <= 90)) return toast("Discount must be between 1 and 90%.");
        state.site.promo_codes = { ...(state.site.promo_codes || {}), [c]: r / 100 }; save(`${c} added`); draw();
      });
      $("#ann-save").addEventListener("click", () => { state.site.announcement = $("#ann").value.trim(); save("Announcement saved"); });
    };
    draw();
  };

  /* ------------------------------------------------ settings */
  VIEWS.settings = (el) => {
    title("Settings");
    const s = state.site;
    const f = (k, label, type = "text", help = "") => `<label class="f">${label}${help ? ` <small>${help}</small>` : ""}<input class="in" data-k="${k}" type="${type}" value="${esc(s[k] ?? "")}"></label>`;
    el.innerHTML = `${dirtyBanner}<div class="set">
      <section class="card"><h2>Store details</h2>${f("phone", "Phone", "tel")}${f("whatsapp", "WhatsApp number", "tel", "With country code, e.g. +230 5123 4567")}${f("email", "Email", "email")}${f("hours", "Opening hours")}${f("address", "Head office address")}
        <button class="btn sm" type="button" data-save style="justify-self:start">Save details</button></section>
      <section class="card"><h2>Delivery and analytics</h2>${f("free_delivery_from", "Free delivery from (Rs)", "number")}${f("delivery_fee", "Delivery fee below that (Rs)", "number")}${f("install_fee", "Air conditioner installation (Rs)", "number")}
        ${f("ga_id", "Google Analytics 4 ID", "text", "Looks like G-XXXXXXX. Only loads for visitors who accept cookies.")}<button class="btn sm" type="button" data-save style="justify-self:start">Save</button></section>
      <section class="card"><h2>Publish changes</h2><p class="help">Changes made here are saved in this browser. To put them live for every visitor:</p>
        <ol style="margin:0;padding-left:18px;font-size:14px;display:grid;gap:4px"><li>Download the catalogue below.</li><li>In GitHub, open the <b>data</b> folder and upload it, replacing <b>catalog.json</b>.</li><li>Run <code>python3 build.py</code> and commit the result.</li></ol>
        <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn sm" type="button" data-export>Download catalogue</button><button class="btn sm line" type="button" id="imp">Upload a catalogue</button></div>
        <button class="btn sm danger" type="button" id="reset" style="justify-self:start">Undo all unpublished changes</button></section>
      <section class="card"><h2>Security and data</h2>
        <form id="pw-f" style="display:grid;gap:10px" novalidate><label class="f">Current password<input class="in" type="password" id="pw-o" autocomplete="current-password"></label><label class="f">New password<input class="in" type="password" id="pw-n" autocomplete="new-password" minlength="8"></label><button class="btn sm ink" type="submit" style="justify-self:start">Change password</button></form>
        <p class="help">This preview admin runs in the browser. Before going live with real customers, connect it to a hosted database so orders reach you from every device.</p>
        <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn sm line" type="button" id="add-sample">Load sample orders</button><button class="btn sm line" type="button" id="clr-sample">Clear sample orders</button><button class="btn sm danger" type="button" id="clr-orders">Delete all orders</button></div></section></div>`;
    $$("[data-save]", el).forEach((b) => b.addEventListener("click", () => {
      $$("[data-k]", el).forEach((i) => (s[i.dataset.k] = i.type === "number" ? Math.max(0, +i.value || 0) : i.value.trim()));
      if (s.ga_id && !/^G-[A-Z0-9]{4,}$/.test(s.ga_id)) { toast("That Analytics ID doesn't look right. It starts with G-."); return; }
      save("Settings saved");
    }));
    $("#imp").addEventListener("click", () => $("#import").click());
    $("#reset").addEventListener("click", async () => {
      if (!(await confirmBox("Undo unpublished changes?", "Products and settings go back to the published catalogue. Orders are kept.", "Undo changes"))) return;
      localStorage.removeItem("jss_db"); localStorage.removeItem("jss_db_dirty"); await loadBase(); toast("Back to the published catalogue"); route();
    });
    $("#pw-f").addEventListener("submit", async (e) => {
      e.preventDefault();
      const cred = LS.get("jss_admin", null);
      if ((await hash($("#pw-o").value, cred.salt)) !== cred.hash) return toast("The current password is not right.");
      if ($("#pw-n").value.length < 8) return toast("The new password needs at least 8 characters.");
      const salt = crypto.getRandomValues(new Uint32Array(2)).join("");
      LS.set("jss_admin", { salt, hash: await hash($("#pw-n").value, salt) }); e.target.reset(); toast("Password changed");
    });
    $("#add-sample").addEventListener("click", () => { seed(); });
    $("#clr-sample").addEventListener("click", () => { setOrders(orders().filter((o) => !o.sample)); toast("Sample orders cleared"); badges(); });
    $("#clr-orders").addEventListener("click", async () => {
      if (!(await confirmBox("Delete every order?", "All orders saved in this browser will be removed.", "Delete all"))) return;
      setOrders([]); toast("All orders deleted"); badges();
    });
  };

  /* export / import used from several views */
  document.addEventListener("click", (e) => {
    if (!e.target.closest("[data-export]")) return;
    const out = { ...BASE, site: state.site, products: state.products.map(({ slug, static: st, ...p }) => p) };
    download("catalog.json", JSON.stringify(out, null, 2));
    LS.set("jss_db_dirty", false); banner();
    toast("catalog.json downloaded");
  });
  $("#import").addEventListener("change", async (e) => {
    const file = e.target.files[0]; if (!file) return;
    try {
      const data = JSON.parse(await file.text());
      if (!Array.isArray(data.products) || !data.site) throw new Error();
      state.products = data.products; state.site = data.site; save("Catalogue uploaded"); route();
    } catch { toast("That file is not a JS Supersonic catalogue."); }
    e.target.value = "";
  });

  /* ------------------------------------------------ start */
  async function start() {
    await loadBase();
    $("#app").hidden = false;
    $("#menu-btn").addEventListener("click", () => { $("#side").classList.add("on"); $("#scrim").classList.add("on"); });
    $$("#nav a").forEach((a) => a.addEventListener("click", () => { $("#side").classList.remove("on"); $("#scrim").classList.remove("on"); }));
    $("#logout").addEventListener("click", () => { try { sessionStorage.removeItem("jss_admin_ok"); } catch { /* ignore */ } location.reload(); });
    addEventListener("hashchange", route);
    if (!location.hash) history.replaceState(null, "", "#/dashboard");
    route();
    addEventListener("resize", () => { const on = $("#nav a[aria-current]"); if (on) $("#nav .hl").style.transform = `translateY(${on.offsetTop}px)`; });
    if (reduce) $("#nav .hl").style.transition = "none";
  }
  if (!window.crypto || !crypto.subtle) {
    document.body.innerHTML = '<p style="padding:40px;font-family:sans-serif">The admin panel needs a secure (https) connection.</p>';
  } else gate();
})();
