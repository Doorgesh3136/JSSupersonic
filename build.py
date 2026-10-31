#!/usr/bin/env python3
"""Builds the JS Supersonic site from data/catalog.json.

Every page is written as finished HTML so search engines and slow phones get the
content straight away. Run it after changing the catalogue:

    python3 build.py
"""
import html
import json
import re
from datetime import date
from pathlib import Path

ROOT = Path(__file__).parent
DATA = json.loads((ROOT / "data" / "catalog.json").read_text(encoding="utf-8"))
SITE = DATA["site"]
URL = SITE["url"].rstrip("/") + "/"
CATS = DATA["categories"]
CAT = {c["id"]: c for c in CATS}
STORES = DATA["stores"]
TODAY = date.today().isoformat()
DISTRICTS = ["Port Louis", "Pamplemousses", "Rivière du Rempart", "Flacq", "Grand Port", "Savanne",
             "Plaines Wilhems", "Moka", "Black River", "Rodrigues"]


def slug(s):
    s = s.lower().replace('"', "").replace("'", "").replace("&", "and")
    return re.sub(r"[^a-z0-9]+", "-", s).strip("-")


PRODUCTS = DATA["products"]
for p in PRODUCTS:
    p["slug"] = slug(p["name"])
    p["static"] = True
PID = {p["id"]: p for p in PRODUCTS}

e = lambda s: html.escape(str(s), quote=True)
fmt = lambda n: f"{SITE['currency']} {round(n):,}"
pct = lambda p: round((1 - p["price"] / p["old"]) * 100) if p.get("old") and p["old"] > p["price"] else 0


def monthly(price, m):
    import math
    return math.ceil(price * (1 + SITE["installments"][str(m)]) / int(m))


def img(i, w, h=None):
    if i.startswith("http"):
        return i
    return f"https://images.unsplash.com/photo-{i}?auto=format&fit=crop&w={w}&h={h or w}&q=70"


def srcset(i):
    return f'srcset="{img(i, 320)} 320w, {img(i, 480)} 480w, {img(i, 720)} 720w"'


def phone_href(num, root):
    digits = re.sub(r"\D", "", num)
    return f"tel:+{digits}" if len(digits) >= 10 else f"{root}help.html#contact"


def wa_href(num, root):
    digits = re.sub(r"\D", "", num)
    return f"https://wa.me/{digits}" if len(digits) >= 10 else f"{root}help.html#contact"


# ---------------------------------------------------------------- icons
# Square caps and mitred joins: a slightly harder line than the usual round icon sets.
ICON = {
    "search": '<circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5 21 21"/>',
    "cart": '<path d="M3 4h2.5l2.2 11h10.6L20.5 7H7"/><circle cx="9.5" cy="19.5" r="1.5"/><circle cx="17" cy="19.5" r="1.5"/>',
    "heart": '<path d="M12 20.5 4.2 12.8a4.9 4.9 0 0 1 6.9-6.9L12 6.8l.9-.9a4.9 4.9 0 0 1 6.9 6.9z"/>',
    "user": '<circle cx="12" cy="8" r="4"/><path d="M4 21c.8-4 4-6 8-6s7.2 2 8 6"/>',
    "menu": '<path d="M3 6h18M3 12h18M3 18h12"/>',
    "x": '<path d="M6 6l12 12M18 6 6 18"/>',
    "arrow": '<path d="M4 12h15M13 6l6 6-6 6"/>',
    "left": '<path d="M20 12H5M11 6l-6 6 6 6"/>',
    "home": '<path d="M3 11 12 4l9 7v9h-6v-6H9v6H3z"/>',
    "grid": '<path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z"/>',
    "truck": '<path d="M2 5h12v11H2zM14 9h4l4 4v3h-8"/><circle cx="6" cy="18" r="2"/><circle cx="18" cy="18" r="2"/>',
    "shield": '<path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z"/><path d="m8.5 12 2.5 2.5 4.5-5"/>',
    "store": '<path d="M3 9 5 4h14l2 5M4 9v11h16V9M9 20v-6h6v6"/>',
    "returns": '<path d="M4 4v6h6"/><path d="M4.5 15a8 8 0 1 0 1.9-8.3L4 10"/>',
    "calendar": '<path d="M3 5h18v16H3zM3 10h18M8 2v5M16 2v5"/>',
    "phone": '<path d="M5 3h4l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-2z"/>',
    "chat": '<path d="M4 4h16v12H8l-4 4z"/>',
    "mail": '<path d="M3 5h18v14H3z"/><path d="m3 6 9 7 9-7"/>',
    "pin": '<path d="M12 21s-7-6.5-7-12a7 7 0 0 1 14 0c0 5.5-7 12-7 12z"/><circle cx="12" cy="9" r="2.5"/>',
    "tag": '<path d="M3 3h8l10 10-8 8L3 11z"/><circle cx="7.5" cy="7.5" r="1.5"/>',
    "bag": '<path d="M5 8h14l-1 13H6z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',
    "check": '<path d="M4 12.5 9.5 18 20 6.5"/>',
    "lock": '<path d="M5 11h14v10H5zM8 11V7a4 4 0 0 1 8 0v4"/>',
    "fb": '<path d="M14 8h3V4h-3a4 4 0 0 0-4 4v3H7v4h3v7h4v-7h3l1-4h-4V8z"/>',
    "ig": '<path d="M4 4h16v16H4z"/><circle cx="12" cy="12" r="4"/><path d="M17 7h.01"/>',
}


def icon(n, c="ic-s"):
    return (f'<svg class="{c}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" '
            f'stroke-linecap="square" stroke-linejoin="miter" aria-hidden="true">{ICON[n]}</svg>')


LOGO = """<svg viewBox="0 0 232 48" role="img" aria-label="JS Supersonic"><title>JS Supersonic</title>
<path d="M0 17h13M3 25h10M0 33h9" stroke="#ff5a1f" stroke-width="3"/>
<g transform="skewX(-12)"><rect x="25" y="5" width="50" height="38" rx="7" fill="#ff5a1f"/></g>
<text x="45" y="33" text-anchor="middle" font-family="Archivo, Arial, sans-serif" font-weight="900" font-style="italic" font-size="23" fill="#11141b">JS</text>
<text x="80" y="28" font-family="Archivo, Arial, sans-serif" font-weight="800" font-size="20" textLength="150" lengthAdjust="spacingAndGlyphs" fill="#fff">SUPERSONIC</text>
<text x="81" y="41" font-family="Archivo, Arial, sans-serif" font-weight="600" font-size="8" textLength="148" lengthAdjust="spacingAndGlyphs" fill="#a3a9b6">ELECTRONICS · HOME · LIVING</text>
</svg>"""


# ---------------------------------------------------------------- shared pieces
def card(p, root):
    off = pct(p)
    name = e(p["name"])
    href = f'{root}product/{p["slug"]}.html'
    flags = (f'<span class="flag off"><span>-{off}%</span></span>' if off else "") + \
            ('<span class="flag new"><span>New</span></span>' if "new" in p["tags"] else "")
    low = f'<p class="low">Only {p["stock"]} left</p>' if 0 < p["stock"] <= 5 else ""
    was = f'<s><span class="sr">Was </span>{fmt(p["old"])}</s>' if off else ""
    return f"""<article class="pc" data-id="{p['id']}">
<a class="pc-img" href="{href}" tabindex="-1" aria-hidden="true"><img src="{img(p['img'], 480)}" {srcset(p['img'])} sizes="(max-width: 760px) 50vw, 300px" width="480" height="480" alt="{name}" loading="lazy" decoding="async"></a>
<div class="pc-flags">{flags}</div>
<button class="wish" type="button" data-wish="{p['id']}" aria-pressed="false" aria-label="Save {name} to wishlist">{icon('heart', 'ic')}</button>
<div class="pc-b">
<p class="pc-brand">{e(p['brand'])}</p>
<h3 class="pc-name"><a href="{href}">{name}</a></h3>
<p class="price"><span class="tag">{fmt(p['price'])}</span>{was}</p>
<p class="mo">or <b>{fmt(monthly(p['price'], 36))}</b> a month for 36 months</p>
{low}<div class="pc-add"><button class="btn btn-sm" type="button" data-add="{p['id']}">Add to cart</button></div>
</div>
</article>"""


def rail(items, root, label):
    return f"""<div class="rail-wrap"><button class="rail-btn p" type="button" aria-label="Scroll {e(label)} back">{icon('left')}</button>
<div class="rail" role="list" aria-label="{e(label)}">{''.join(card(p, root) for p in items)}</div>
<button class="rail-btn n" type="button" aria-label="Scroll {e(label)} forward">{icon('arrow')}</button></div>"""


def sec_head(title, link=None, tag="h2", hid=None):
    l = f'<a class="link" href="{link[0]}">{link[1]} {icon("arrow")}</a>' if link else ""
    i = f' id="{hid}"' if hid else ""
    return f'<div class="sec-h"><{tag} class="h-sec"{i}>{title}</{tag}><span class="rule"></span>{l}</div>'


def crumbs(items, root):
    lis = "".join(
        f'<li><a href="{root}{h}">{e(t)}</a></li>' if h is not None else f'<li aria-current="page"><span id="crumb">{e(t)}</span></li>'
        for t, h in items)
    return f'<nav aria-label="Breadcrumb"><ol class="crumbs">{lis}</ol></nav>'


def crumb_schema(items):
    return {"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [
        {"@type": "ListItem", "position": i + 1, "name": t, **({"item": URL + h} if h is not None else {})}
        for i, (t, h) in enumerate(items)]}


def brands_in(cat):
    seen = []
    for p in PRODUCTS:
        if p["cat"] == cat and p["brand"] not in seen:
            seen.append(p["brand"])
    return seen


def header(root, page):
    nav_items = []
    for c in CATS:
        subs = list(dict.fromkeys(p["sub"] for p in PRODUCTS if p["cat"] == c["id"]))
        nav_items.append(f"""<li class="nav-i"><a class="nav-a{' on' if page == 'cat-' + c['id'] else ''}" href="{root}category/{c['id']}.html">{e(c['name'])}</a>
<div class="mega"><div class="w">
<div><h4>Shop by type</h4><ul>{''.join(f'<li><a href="{root}category/{c["id"]}.html?sub={e(s)}" data-label="{e(s)}">{e(s)}</a></li>' for s in subs)}<li><a href="{root}category/{c['id']}.html">All {e(c['name'])}</a></li></ul></div>
<div><h4>Brands</h4><ul>{''.join(f'<li><a href="{root}shop.html?cat={c["id"]}&amp;brand={e(b)}" data-label="{e(b)}">{e(b)}</a></li>' for b in brands_in(c['id'])[:6])}</ul></div>
<a class="mega-pic" href="{root}category/{c['id']}.html"><img src="{img(c['img'], 700, 420)}" alt="" loading="lazy" width="700" height="420"><div><strong>{e(c['name'])}</strong><span>{e(c['line'])}</span></div></a>
</div></div></li>""")
    tel = phone_href(SITE["phone"], root)
    return f"""<div class="topbar"><div class="w"><p>{e(SITE['announcement'])}</p>
<nav aria-label="Quick links"><a href="{root}track.html">Track my order</a><a href="{root}stores.html">Our stores</a><a href="{root}help.html">Help</a><a href="{tel}">{e(SITE['phone'])}</a></nav></div></div>
<header class="hdr"><div class="w hdr-row">
<button class="burger" type="button" data-open="menu" aria-label="Open menu" aria-controls="menu">{icon('menu', 'ic')}</button>
<a class="logo" href="{root}index.html" data-label="Home">{LOGO}</a>
<form class="search" action="{root}shop.html" role="search"><label class="sr" for="q-{page}">Search products</label>
<input id="q-{page}" type="search" name="q" placeholder="Search TVs, phones, fridges, sofas" autocomplete="off" enterkeyhint="search">
<button type="submit" aria-label="Search">{icon('search', 'ic')}</button><div class="suggest" hidden></div></form>
<div class="acts">
<a class="act hide-m" href="{root}account.html">{icon('user', 'ic')}<span class="t"><small>Sign in</small><span class="l">Account</span></span></a>
<a class="act hide-m" href="{root}wishlist.html" aria-label="Wishlist">{icon('heart', 'ic')}<span class="badge-n" data-wish-n hidden>0</span><span class="t"><small>Saved</small><span class="l">Wishlist</span></span></a>
<button class="act" type="button" data-open="cart" data-cart-target aria-label="Open cart" aria-controls="cart-drawer">{icon('cart', 'ic')}<span class="badge-n" data-cart-n hidden>0</span><span class="t"><small>Cart</small><span class="l" data-cart-sum>{fmt(0)}</span></span></button>
</div></div>
<nav class="nav" aria-label="Main"><div class="w"><ul style="display:flex;list-style:none">
<li class="nav-i"><a class="nav-a hot{' on' if page == 'deals' else ''}" href="{root}deals.html">Deals</a></li>
{''.join(nav_items)}
</ul><div class="nav-r"><a class="nav-a{' on' if page == 'new' else ''}" href="{root}new.html">New in</a><a class="nav-a{' on' if page == 'pay-monthly' else ''}" href="{root}pay-monthly.html">Pay monthly</a></div></div></nav>
</header>"""


def footer(root):
    tel = phone_href(SITE["phone"], root)
    wa = wa_href(SITE["whatsapp"], root)
    wa_attr = ' target="_blank" rel="noopener"' if wa.startswith("https") else ""
    year = date.today().year
    return f"""<footer class="ftr"><div class="w ftr-top">
<div class="ftr-about"><a class="logo" href="{root}index.html" data-label="Home">{LOGO}</a><p>{e(SITE['tagline'])}</p>
<div class="ftr-c"><a href="{tel}">{icon('phone')} {e(SITE['phone'])}</a><a href="{wa}"{wa_attr}>{icon('chat')} WhatsApp us</a><a href="mailto:{e(SITE['email'])}">{icon('mail')} {e(SITE['email'])}</a></div></div>
<div><h2>Shop</h2><ul>{''.join(f'<li><a href="{root}category/{c["id"]}.html">{e(c["name"])}</a></li>' for c in CATS)}<li><a href="{root}deals.html">Deals</a></li></ul></div>
<div><h2>Help</h2><ul><li><a href="{root}track.html">Track my order</a></li><li><a href="{root}help.html">Delivery and returns</a></li><li><a href="{root}pay-monthly.html">Pay monthly</a></li><li><a href="{root}help.html#contact">Contact us</a></li><li><a href="{root}account.html">My account</a></li></ul></div>
<div><h2>Company</h2><ul><li><a href="{root}stores.html">Our stores</a></li><li><a href="{root}brands.html">Brands</a></li><li><a href="{root}new.html">New in</a></li><li><a href="{root}privacy.html">Privacy policy</a></li><li><a href="{root}terms.html">Terms and conditions</a></li></ul></div>
<div><h2>We accept</h2><div class="pays"><span>VISA</span><span>Mastercard</span><span>Juice</span><span>my.t money</span><span>Blink</span><span>Cash</span></div>
<h2 style="margin-top:24px">Opening hours</h2><p>{e(SITE['hours'])}</p></div>
</div>
<div class="ftr-b"><div class="w"><span>© {year} {e(SITE['legal_name'])}. Prices include VAT.</span>
<nav aria-label="Legal"><a href="{root}privacy.html">Privacy</a><a href="{root}terms.html">Terms</a><button type="button" data-cookie-settings>Cookie settings</button><a href="{root}admin/index.html" data-plain>Staff login</a></nav></div></div>
</footer>"""


def chrome_end(root, page):
    def on(k):
        return ' class="on"' if page == k else ""
    return f"""<div class="scrim" data-close></div>
<aside class="drawer l" id="menu" aria-label="Menu" aria-hidden="true">
<div class="dr-h"><h2>Menu</h2><button class="x" type="button" data-close aria-label="Close menu">{icon('x', 'ic')}</button></div>
<nav class="dr-b mnav" aria-label="Mobile">
<a href="{root}index.html">Home {icon('arrow')}</a><a href="{root}deals.html">Deals {icon('arrow')}</a><a href="{root}new.html">New in {icon('arrow')}</a>
<h3>Categories</h3>{''.join(f'<a href="{root}category/{c["id"]}.html">{e(c["name"])} {icon("arrow")}</a>' for c in CATS)}
<h3>Help</h3><a href="{root}pay-monthly.html">Pay monthly {icon('arrow')}</a><a href="{root}track.html">Track my order {icon('arrow')}</a><a href="{root}stores.html">Our stores {icon('arrow')}</a><a href="{root}help.html">Help and contact {icon('arrow')}</a><a href="{root}account.html">My account {icon('arrow')}</a>
</nav></aside>
<aside class="drawer r" id="cart" aria-label="Cart" aria-hidden="true">
<div class="dr-h"><h2>Your cart</h2><button class="x" type="button" data-close aria-label="Close cart">{icon('x', 'ic')}</button></div>
<div class="dr-b" id="mc-body"></div><div class="dr-f" id="mc-foot"></div></aside>
<div class="cookie" id="cookie" role="region" aria-label="Cookie choice" hidden>
<p><b>Cookies.</b> We keep your cart on this device. Can we also use anonymous analytics? <a href="{root}privacy.html#cookies">Details</a></p>
<div class="r"><button class="btn btn-line btn-sm" type="button" data-consent="essential">No thanks</button><button class="btn btn-sm" type="button" data-consent="all">Allow</button></div></div>
<nav class="tabbar" aria-label="Quick actions">
<a href="{root}index.html"{on('home')}>{icon('home', 'ic')}Home</a>
<button type="button" data-open="menu">{icon('grid', 'ic')}Shop</button>
<button type="button" data-focus-search>{icon('search', 'ic')}Search</button>
<a href="{root}wishlist.html"{on('wishlist')}>{icon('heart', 'ic')}<span class="badge-n" data-wish-n hidden>0</span>Saved</a>
<a href="{root}cart.html" data-cart-target{on('cart')}>{icon('cart', 'ic')}<span class="badge-n" data-cart-n hidden>0</span>Cart</a>
</nav>"""


HEAD_JS = ("!function(d,l){try{if(l.protocol==='http:'&&!/^(localhost|127\\.|0\\.0|192\\.168\\.)/.test(l.hostname))"
           "l.replace('https:'+l.href.slice(5));if(sessionStorage.getItem('jss_nav')){d.documentElement.classList.add('entering');"
           "sessionStorage.removeItem('jss_nav')}}catch(e){}}(document,location)")


def layout(*, page, path, title, desc, body, schema=(), index=True, extra_body_attr="", intro="", base=None):
    root = "../" if "/" in path else ""
    if base:
        root = ""
    canon = URL + ("" if path == "index.html" else path)
    ld = "".join(f'<script type="application/ld+json">{json.dumps(s, ensure_ascii=False)}</script>' for s in schema)
    robots = "index, follow" if index else "noindex, follow"
    from urllib.parse import urlsplit
    prefix = urlsplit(URL).path or "/"
    # 404 can be served at any depth, so pick the base path at runtime (works on GitHub Pages, a custom domain and locally)
    base_tag = (f"<script>!function(){{var p='{prefix}',b=document.createElement('base');"
                f"b.href=location.pathname.indexOf(p)===0?p:'/';document.head.appendChild(b)}}()</script>") if base else ""
    return f"""<!doctype html>
<html lang="en" data-root="{root}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
{base_tag}<title>{e(title)}</title>
<meta name="description" content="{e(desc)}">
<meta name="robots" content="{robots}">
<link rel="canonical" href="{canon}">
<meta http-equiv="Content-Security-Policy" content="upgrade-insecure-requests">
<meta name="theme-color" content="#11141b">
<meta property="og:type" content="website">
<meta property="og:site_name" content="{e(SITE['name'])}">
<meta property="og:title" content="{e(title)}">
<meta property="og:description" content="{e(desc)}">
<meta property="og:url" content="{canon}">
<meta property="og:image" content="{URL}assets/img/og.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:locale" content="en_MU">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="{root}favicon.svg" type="image/svg+xml">
<link rel="icon" href="{root}assets/img/favicon-32.png" sizes="32x32" type="image/png">
<link rel="apple-touch-icon" href="{root}assets/img/apple-touch-icon.png">
<link rel="preload" href="{root}assets/fonts/archivo-var.woff" as="font" type="font/woff" crossorigin>
<link rel="preconnect" href="https://images.unsplash.com">
<link rel="stylesheet" href="{root}assets/css/site.css">
<script>{HEAD_JS}</script>
{ld}
</head>
<body data-page="{page}"{extra_body_attr}>
<a class="skip" href="#main">Skip to content</a>
<div id="curtain" aria-hidden="true"><i></i><b><span></span></b></div>
{intro}{header(root, page)}
<main id="main">
{body}
</main>
{footer(root)}
{chrome_end(root, page)}
<script src="{root}assets/js/catalog.js" defer></script>
<script src="{root}assets/js/site.js" defer></script>
</body>
</html>
"""


PAGES = {}


def write(path, **kw):
    out = ROOT / path
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(layout(path=path, **kw), encoding="utf-8")
    PAGES[path] = kw.get("index", True)


ORG = {
    "@context": "https://schema.org", "@type": "ElectronicsStore", "@id": URL + "#store",
    "name": SITE["name"], "url": URL, "logo": URL + "assets/img/apple-touch-icon.png", "image": URL + "assets/img/og.png",
    "description": SITE["tagline"], "email": SITE["email"], "priceRange": "Rs 2,000 to Rs 70,000",
    "currenciesAccepted": "MUR", "paymentAccepted": "Cash, Credit Card, Debit Card, Juice, my.t money, Blink",
    "address": {"@type": "PostalAddress", "streetAddress": "Royal Road", "addressLocality": "Port Louis", "addressCountry": "MU"},
    "openingHoursSpecification": [
        {"@type": "OpeningHoursSpecification", "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"], "opens": "09:00", "closes": "18:00"},
        {"@type": "OpeningHoursSpecification", "dayOfWeek": "Sunday", "opens": "09:00", "closes": "13:00"}],
    "department": [{"@type": "ElectronicsStore", "name": f"{SITE['name']} {s['name']}",
                    "address": {"@type": "PostalAddress", "streetAddress": s["address"].split(",")[0], "addressLocality": s["name"], "addressCountry": "MU"}} for s in STORES],
}
if len(re.sub(r"\D", "", SITE["phone"])) >= 10:
    ORG["telephone"] = SITE["phone"]
WEBSITE = {"@context": "https://schema.org", "@type": "WebSite", "name": SITE["name"], "url": URL,
           "potentialAction": {"@type": "SearchAction", "target": URL + "shop.html?q={search_term_string}", "query-input": "required name=search_term_string"}}


def listing_block(root, sort_default="featured", title_id="title"):
    sorts = [("featured", "Featured"), ("price-asc", "Price, low to high"), ("price-desc", "Price, high to low"), ("discount", "Biggest saving"), ("newest", "Newest")]
    return f"""<div class="shop"><aside class="filters" id="filters" aria-label="Filters"></aside>
<div><div class="bar"><p class="cnt" id="count" aria-live="polite"></p><div class="bar-r">
<button class="btn btn-line btn-sm fl-open" id="fl-open" type="button">Filters</button>
<label class="sr" for="sort">Sort by</label><select class="sel" id="sort" style="min-height:44px;width:auto">{''.join(f'<option value="{v}"{" selected" if v == sort_default else ""}>{t}</option>' for v, t in sorts)}</select></div></div>
<div class="chips" id="chips"></div>
<div class="grid" id="grid">{{grid}}</div>
<div class="more" id="more" hidden><button class="btn btn-line" type="button">Show more</button></div></div></div>"""


def hp_field():
    return '<div class="hp" aria-hidden="true"><label>Company<input name="company" tabindex="-1" autocomplete="off"></label></div>'


def fld(label, name, typ="text", req=True, full=False, auto="", extra="", err=None, ph=""):
    r = ' required' if req else ""
    star = ' <span class="req" aria-hidden="true">*</span>' if req else ' <span style="color:var(--muted);font-weight:500">(optional)</span>'
    a = f' autocomplete="{auto}"' if auto else ""
    p = f' placeholder="{e(ph)}"' if ph else ""
    fid = f"f-{name}"
    inp = (f'<textarea class="in" id="{fid}" name="{name}"{r}{extra}></textarea>' if typ == "textarea"
           else f'<input class="in" id="{fid}" name="{name}" type="{typ}"{r}{a}{p}{extra}>')
    return f'<div class="fld{" full" if full else ""}"><label for="{fid}">{label}{star}</label>{inp}<p class="err" id="{fid}-e">{err or "Please fill this in."}</p></div>'


# ================================================================ HOME
def build_home():
    root = ""
    slides = []
    for i, s in enumerate(DATA["slides"]):
        tag = "h1" if i == 0 else "h2"
        words = s["title"].split()
        title = " ".join(f'<span class="ln"><span style="--i:{k}">{e(w)}</span></span>' for k, w in enumerate(words))
        slides.append(f"""<div class="slide{' on' if i == 0 else ''}" aria-roledescription="slide" aria-label="{i + 1} of {len(DATA['slides'])}">
<div class="slide-img"><img src="{img(s['img'], 1600, 900)}" srcset="{img(s['img'], 800, 900)} 800w, {img(s['img'], 1600, 900)} 1600w" sizes="100vw" alt="" width="1600" height="900"{' fetchpriority="high"' if i == 0 else ' loading="lazy"'}></div>
<div class="w slide-c"><p class="slide-k"><span>{e(s['kicker'])}</span></p><{tag} class="disp">{title}</{tag}>
<p class="slide-t">{e(s['text'])}</p><div class="slide-a"><a class="btn" href="{s['href']}">{e(s['cta'])} {icon('arrow')}</a></div></div></div>""")
    deal = max((p for p in PRODUCTS if p["stock"] > 0), key=pct)
    order = ["tv-audio", "phones", "appliances", "computing", "gaming", "kitchen", "furniture"]
    tiles = "".join(f"""<a class="tile" href="category/{c}.html"><img src="{img(CAT[c]['img'], 900 if i == 0 else 600, 700 if i == 0 else 450)}" alt="" loading="lazy" width="600" height="450">
<span class="tile-l"><strong>{e(CAT[c]['name'])}</strong><span>{sum(1 for p in PRODUCTS if p['cat'] == c)} products {icon('arrow')}</span></span></a>""" for i, c in enumerate(order))
    deals = sorted([p for p in PRODUCTS if pct(p)], key=pct, reverse=True)[:10]
    best_tabs = [("", "All"), ("tv-audio", "TV & Audio"), ("phones", "Phones"), ("appliances", "Appliances"), ("furniture", "Furniture")]
    best = sorted(PRODUCTS, key=lambda p: ("best" in p["tags"], p["reviews"]), reverse=True)[:8]
    new = [p for p in PRODUCTS if "new" in p["tags"]]
    brands = list(dict.fromkeys(p["brand"] for p in PRODUCTS if p["brand"] != "Supersonic Home"))
    brand_links = "".join(f'<a href="shop.html?brand={e(b)}" data-label="{e(b)}">{e(b)}</a>' for b in brands)
    ticker_items = ["Free delivery over Rs 5,000", "6 months at no extra cost", "Click & Collect in 2 hours", "Official local warranty", "Air con installation by our own team", "Open Sundays in Grand Baie"]
    tick = "".join(f"<span>{e(t)}</span>" for t in ticker_items)
    stores = "".join(f'<div class="store"><span class="n">0{i + 1}</span><h3>{e(s["name"])}</h3><p>{e(s["address"])}<br>{e(s["hours"])}</p></div>' for i, s in enumerate(STORES))
    intro = """<div id="intro" aria-hidden="true"><div class="intro-lines"><i style="top:30%;animation-delay:0s"></i><i style="top:42%;animation-delay:.08s"></i><i style="top:58%;animation-delay:.16s"></i><i style="top:70%;animation-delay:.05s"></i></div>
<div class="intro-core"><span class="intro-ring"></span><span class="intro-badge"><b>JS</b></span><span class="intro-word">""" + \
        "".join(f'<span style="--i:{i}">{ch}</span>' for i, ch in enumerate("SUPERSONIC")) + \
        """</span></div><p class="intro-sub">Electronics · Home · Living</p></div>
<script>(function(){var i=document.getElementById('intro');try{if(sessionStorage.getItem('jss_intro')||matchMedia('(prefers-reduced-motion: reduce)').matches||document.documentElement.classList.contains('entering')){i.remove()}}catch(e){i.remove()}})()</script>"""
    body = f"""<section class="hero" aria-roledescription="carousel" aria-label="Featured offers">
{''.join(slides)}
<div class="hero-ui"><div class="w"><p class="hero-n" aria-hidden="true"><b>01</b> / 0{len(DATA['slides'])}</p>
<div class="bars">{''.join(f'<button type="button" aria-label="Show slide {i + 1}"></button>' for i in range(len(DATA['slides'])))}</div>
<div class="hero-arr"><button class="p" type="button" aria-label="Previous slide">{icon('left')}</button><button class="n" type="button" aria-label="Next slide">{icon('arrow')}</button></div></div></div>
<a class="dotd" href="product/{deal['slug']}.html"><img src="{img(deal['img'], 200)}" alt="" width="96" height="96"><span><span class="dotd-k">Deal of the day, -{pct(deal)}%</span>
<h2>{e(deal['name'])}</h2><span class="tag" style="font-size:16px">{fmt(deal['price'])}</span><span class="cd" data-cd style="display:block"></span></span></a>
</section>
<div class="ticker" aria-label="Why shop with us"><div class="ticker-t">{tick}{tick.replace('<span>', '<span aria-hidden="true">')}</div></div>

<section class="sec w" aria-labelledby="cats-h">{sec_head('Shop by category', ('shop.html', 'All products'), hid='cats-h')}
<div class="bento">{tiles}</div></section>

<section class="band" aria-labelledby="flash-h"><div class="w">
<div class="sec-h"><h2 class="h-sec" id="flash-h">Flash deals</h2><span class="rule"></span><div class="cd-big" data-cd="big" aria-label="Time left"></div></div>
<p class="sec-sub" style="color:#b9bec9">These prices end at midnight. Stock is limited on most of them.</p>
{rail(deals, root, 'Flash deals')}
<p style="margin-top:18px"><a class="link" href="deals.html">See every deal {icon('arrow')}</a></p></div></section>

<section class="sec w" aria-labelledby="best-h">{sec_head('Bestsellers', ('shop.html?sort=featured', 'Shop all'), hid='best-h')}
<div id="best-tabs"><div class="tabs" role="tablist" aria-label="Bestsellers by category">{''.join(f'<button type="button" role="tab" data-cat="{c}" aria-selected="{"true" if i == 0 else "false"}"{"" if i == 0 else " tabindex=-1"}>{t}</button>' for i, (c, t) in enumerate(best_tabs))}</div></div>
<div class="grid" id="best" role="tabpanel" aria-labelledby="best-h">{''.join(card(p, root) for p in best)}</div></section>

<section class="sec w" aria-label="Offers"><div class="duo">
<a class="promo" href="pay-monthly.html"><img src="{img('1560185128-e173042f79dd', 1100, 700)}" alt="" loading="lazy" width="1100" height="700">
<h2 class="disp">Pay monthly</h2><p>Spread any order over 6 to 36 months. Six months costs nothing extra and most answers come the same day.</p><span class="btn btn-white" style="align-self:flex-start">See how it works {icon('arrow')}</span></a>
<a class="promo solid" href="deals.html"><span class="big">-10%</span><h2 class="disp" style="font-size:clamp(24px,2.6vw,34px)">On your first online order</h2>
<p>Enter <span class="code">SUPERSONIC10</span> in your cart. One use per customer.</p><span class="btn btn-ink" style="align-self:flex-start">Shop deals {icon('arrow')}</span></a>
</div></section>

<section class="sec w" aria-labelledby="new-h">{sec_head('Just landed', ('new.html', 'Everything new'), hid='new-h')}
{rail(new, root, 'New arrivals')}</section>

<section class="sec" aria-labelledby="brands-h"><div class="w">{sec_head('Brands we stock', ('brands.html', 'All brands'), hid='brands-h')}</div>
<div class="brands"><div class="brands-t">{brand_links}{brand_links.replace('<a ', '<a tabindex="-1" aria-hidden="true" ')}</div></div></section>

<section class="sec w" aria-labelledby="stores-h">{sec_head('Visit a showroom', ('stores.html', 'Opening hours and directions'), hid='stores-h')}
<div class="stores">{stores}</div></section>

<div class="w"><section class="news" aria-labelledby="news-h"><div><h2 class="disp" id="news-h">Flash sales, first</h2><p>One email a week with the deals before they go on the site. No spam, unsubscribe in one click.</p></div>
<div><form data-news data-guard novalidate>{hp_field()}<label class="sr" for="news-email">Email address</label><input id="news-email" type="email" name="email" required placeholder="Your email address" autocomplete="email"><button class="btn" type="submit">Sign up</button></form>
<p class="msg" role="status"></p></div></section></div>"""
    write("index.html", page="home", title=f"{SITE['name']} | TVs, Phones, Appliances and Furniture in Mauritius",
          desc="Shop TVs, phones, laptops, gaming, appliances and furniture with free delivery across Mauritius over Rs 5,000, Click & Collect and pay monthly up to 36 months.",
          body=body, schema=[ORG, WEBSITE], intro=intro)


# ================================================================ SHOP
def build_shop():
    root = ""
    items = [("Home", "index.html"), ("All products", None)]
    body = f"""<div class="w"><header class="ph">{crumbs(items, root)}<h1 class="disp" id="title">All products</h1>
<p class="lead">Every product we sell, with prices that include VAT and delivery across the island.</p></header>
{listing_block(root).replace('{grid}', ''.join(card(p, root) for p in PRODUCTS))}</div>"""
    write("shop.html", page="shop", title=f"All products | {SITE['name']}",
          desc=f"Browse all {len(PRODUCTS)} products at {SITE['name']}: TVs, phones, laptops, consoles, fridges, washing machines, air conditioners and furniture.",
          body=body, schema=[crumb_schema(items)])


# ================================================================ CATEGORIES
def build_categories():
    root = "../"
    for c in CATS:
        items = [p for p in PRODUCTS if p["cat"] == c["id"]]
        subs = list(dict.fromkeys(p["sub"] for p in items))
        spot = max(items, key=lambda p: ("best" in p["tags"], pct(p), p["reviews"]))
        cr = [("Home", "index.html"), (c["name"], None)]
        sub_links = f'<a class="sub on" href="{c["id"]}.html" data-sub="">All <small>{len(items)}</small></a>' + "".join(
            f'<a class="sub" href="{c["id"]}.html?sub={e(s)}" data-sub="{e(s)}">{e(s)} <small>{sum(1 for p in items if p["sub"] == s)}</small></a>' for s in subs)
        spec_items = "".join(f"<li>{e(k)}: {e(v)}</li>" for k, v in list(spot["specs"].items())[:3])
        body = f"""<section class="chero"><img src="{img(c['img'], 1600, 700)}" alt="" width="1600" height="700" fetchpriority="high">
<div class="w">{crumbs(cr, root)}<div class="chero-c"><h1 class="disp">{e(c['name'])}</h1><p>{e(c['line'])}</p>
<nav class="subs" aria-label="{e(c['name'])} types">{sub_links}</nav></div></div></section>
<div class="w">
<section class="sec" aria-labelledby="spot-h"><article class="spot"><a class="spot-img" href="../product/{spot['slug']}.html" tabindex="-1" aria-hidden="true"><img src="{img(spot['img'], 900)}" alt="" loading="lazy" width="900" height="900"></a>
<div class="spot-c"><p class="k">Our pick in {e(c['name'])}</p><h2 id="spot-h"><a href="../product/{spot['slug']}.html">{e(spot['name'])}</a></h2><p style="color:var(--muted)">{e(spot['desc'])}</p>
<ul>{spec_items}</ul><p class="price"><span class="tag">{fmt(spot['price'])}</span>{f'<s><span class="sr">Was </span>{fmt(spot["old"])}</s>' if pct(spot) else ''}</p>
<p class="mo">or <b>{fmt(monthly(spot['price'], 36))}</b> a month for 36 months</p>
<div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:8px"><button class="btn" type="button" data-add="{spot['id']}">Add to cart</button><a class="btn btn-line" href="../product/{spot['slug']}.html">Details</a></div></div></article></section>
<section class="sec" aria-labelledby="all-h">{sec_head(f"All {e(c['name'])}", hid='all-h')}
{listing_block(root).replace('{grid}', ''.join(card(p, root) for p in items))}</section>
<section class="sec" aria-labelledby="tips-h"><div class="tips"><h2 class="h-sec" id="tips-h">Before you buy</h2><ol>{''.join(f'<li><p>{e(t)}</p></li>' for t in c['tips'])}</ol></div></section>
</div>"""
        write(f"category/{c['id']}.html", page=f"cat-{c['id']}", title=f"{c['name']} | {SITE['name']} Mauritius",
              desc=f"{c['line']} {len(items)} products with free delivery over Rs 5,000 and pay monthly.",
              body=body, schema=[crumb_schema(cr), {"@context": "https://schema.org", "@type": "CollectionPage", "name": c["name"], "url": URL + f"category/{c['id']}.html",
                                                     "mainEntity": {"@type": "ItemList", "itemListElement": [{"@type": "ListItem", "position": i + 1, "url": URL + f"product/{p['slug']}.html"} for i, p in enumerate(items)]}}],
              extra_body_attr=f' data-cat="{c["id"]}"')
        # the JS module is keyed on page name, so mark category pages
        f = ROOT / f"category/{c['id']}.html"
        f.write_text(f.read_text(encoding="utf-8").replace(f'data-page="cat-{c["id"]}"', 'data-page="category"'), encoding="utf-8")


# ================================================================ PRODUCT PAGES
def product_body(p, root, dynamic=False):
    c = CAT[p["cat"]]
    off = pct(p)
    crops = [img(p["img"], 900),
             f"https://images.unsplash.com/photo-{p['img']}?auto=format&fit=crop&w=900&h=900&crop=focalpoint&fp-x=.5&fp-y=.5&fp-z=1.6&q=70",
             f"https://images.unsplash.com/photo-{p['img']}?auto=format&fit=crop&w=900&h=900&crop=focalpoint&fp-x=.3&fp-y=.45&fp-z=2.1&q=70",
             f"https://images.unsplash.com/photo-{p['img']}?auto=format&fit=crop&w=900&h=900&crop=focalpoint&fp-x=.7&fp-y=.55&fp-z=2.1&q=70"]
    thumbs = "" if dynamic else "".join(
        f'<button type="button" data-src="{u}" aria-current="{"true" if i == 0 else "false"}" aria-label="Photo {i + 1}"><img src="{u.replace("w=900&h=900", "w=200&h=200")}" alt="" loading="lazy" width="200" height="200"></button>'
        for i, u in enumerate(crops))
    stock = "In stock" if p["stock"] > 5 else (f"Only {p['stock']} left" if p["stock"] > 0 else "Out of stock")
    terms = "".join(f'<button type="button" aria-pressed="{"true" if m == "24" else "false"}"><b>{fmt(monthly(p["price"], m))}</b>a month, {m} months</button>' for m in SITE["installments"])
    specs = "".join(f'<tr><th scope="row">{e(k)}</th><td>{e(v)}</td></tr>' for k, v in p["specs"].items())
    related = [x for x in PRODUCTS if x["cat"] == p["cat"] and x["id"] != p["id"]]
    related += [x for x in PRODUCTS if x["cat"] != p["cat"] and "best" in x["tags"]]
    cr = [("Home", "index.html"), (c["name"], f"category/{c['id']}.html"), (p["name"], None)]
    warranty = p["specs"].get("Warranty", "1 year")
    return cr, f"""<div class="w">{crumbs(cr, root).replace(f'href="{root}category/{c["id"]}.html"', f'href="{root}category/{c["id"]}.html" data-p-crumb-cat').replace('<span id="crumb">', '<span id="crumb" data-p-crumb>')}
<div class="pdp">
<div class="gal"><div class="gal-main"><img src="{crops[0]}" {srcset(p['img'])} sizes="(max-width: 1080px) 100vw, 640px" alt="{e(p['name'])}" width="900" height="900" fetchpriority="high">
<div class="pc-flags">{f'<span class="flag off"><span>-{off}%</span></span>' if off else ''}{'<span class="flag new"><span>New</span></span>' if 'new' in p['tags'] else ''}</div></div>
<div class="gal-th">{thumbs}</div></div>
<div class="buy">
<p class="pc-brand"><a href="{root}shop.html?brand={e(p['brand'])}" data-p-brand>{e(p['brand'])}</a></p>
<h1 data-p-name>{e(p['name'])}</h1>
<div class="meta"><span class="instock" data-p-stock>{stock}</span><span>Item no. JSS-{p['id']:05d}</span></div>
<div class="pbox"><p class="price"><span class="tag" data-p-price>{fmt(p['price'])}</span>{f'<s data-p-old><span class="sr">Was </span>{fmt(p["old"])}</s> <span class="save">Save {fmt(p["old"] - p["price"])}</span>' if off else ''}</p>
<p class="vat">Includes VAT. {'Free delivery.' if p['price'] >= SITE['free_delivery_from'] else f"Free delivery on orders over {fmt(SITE['free_delivery_from'])}."}</p>
<div class="terms" role="group" aria-label="Pay monthly options">{terms}</div>
<p class="terms-n">Pay monthly is subject to approval. Six months costs nothing extra. <a class="link" href="{root}pay-monthly.html">How it works</a></p></div>
<div class="buy-row"><div class="qty"><button type="button" data-step="-1" aria-label="One less">−</button><label class="sr" for="qty">Quantity</label><input id="qty" type="number" value="1" min="1" max="10" inputmode="numeric"><button type="button" data-step="1" aria-label="One more">+</button></div>
<button class="btn" type="button" data-add-main>{icon('cart')} Add to cart</button>
<button class="wish" type="button" data-wish="{p['id']}" aria-pressed="false" aria-label="Save to wishlist" style="position:static;width:54px;height:54px;box-shadow:inset 0 0 0 2px var(--line)">{icon('heart', 'ic')}</button></div>
<button class="btn btn-ink btn-block" type="button" id="buy-now" style="margin-top:10px;min-height:54px">Buy now</button>
<ul class="perks">
<li>{icon('truck')}<span><b>Delivery in 24 to 72 hours</b><span>Anywhere on the main island. Large items are carried in and placed.</span></span></li>
<li>{icon('store')}<span><b>Click & Collect</b><span>Free from {', '.join(s['name'] for s in STORES)}. Usually ready in 2 hours.</span></span></li>
<li>{icon('shield')}<span><b>{e(warranty)} warranty</b><span>Repairs handled locally at our Port Louis service desk.</span></span></li>
<li>{icon('returns')}<span><b>7 day returns</b><span>On unopened items with the receipt.</span></span></li>
</ul></div></div>

<section class="pinfo" aria-label="Product information">
<div class="tabs" role="tablist" aria-label="Product information">
<button type="button" role="tab" id="t-ov" aria-controls="p-ov" aria-selected="true">Overview</button>
<button type="button" role="tab" id="t-sp" aria-controls="p-sp" aria-selected="false" tabindex="-1">Specifications</button>
<button type="button" role="tab" id="t-dl" aria-controls="p-dl" aria-selected="false" tabindex="-1">Delivery and returns</button></div>
<div class="panel-t" id="p-ov" role="tabpanel" aria-labelledby="t-ov"><p data-p-desc>{e(p['desc'])}</p>
<p>Buy it online or see it in any of our {len(STORES)} showrooms. Everything in {e(c['name'])} comes with a local warranty and can be paid monthly.</p></div>
<div class="panel-t" id="p-sp" role="tabpanel" aria-labelledby="t-sp" hidden><table class="specs"><caption class="sr">Specifications</caption><tbody data-p-specs><tr><th scope="row">Brand</th><td>{e(p['brand'])}</td></tr>{specs}</tbody></table></div>
<div class="panel-t" id="p-dl" role="tabpanel" aria-labelledby="t-dl" hidden><p>Delivery is free on orders over {fmt(SITE['free_delivery_from'])}. Below that it costs {fmt(SITE['delivery_fee'])} anywhere on the main island. We call the day before with a time slot.</p>
<p>Unopened items can be returned within 7 days with the receipt. If something arrives damaged, take photos and contact us the same day and we replace it. <a class="link" href="{root}help.html">Delivery and returns help</a></p></div>
</section>

<section class="sec" aria-labelledby="rel-h">{sec_head('You might also like', hid='rel-h')}{rail(related[:10], root, 'Related products')}</section>
<section class="sec" aria-labelledby="rec-h" hidden>{sec_head('Recently viewed', hid='rec-h')}<div class="rail-wrap"><div class="rail" id="recent"></div></div></section>
</div>
<div class="sticky-buy" aria-hidden="true"><span class="tag" data-p-price>{fmt(p['price'])}</span><button class="btn" type="button" data-add-main tabindex="-1">Add to cart</button></div>"""


def build_products():
    root = "../"
    for p in PRODUCTS:
        cr, body = product_body(p, root)
        offer = {"@type": "Offer", "price": p["price"], "priceCurrency": "MUR", "url": URL + f"product/{p['slug']}.html",
                 "availability": "https://schema.org/InStock" if p["stock"] > 0 else "https://schema.org/OutOfStock",
                 "itemCondition": "https://schema.org/NewCondition", "seller": {"@id": URL + "#store"}}
        schema = [crumb_schema(cr), {"@context": "https://schema.org", "@type": "Product", "name": p["name"], "sku": f"JSS-{p['id']:05d}",
                                     "brand": {"@type": "Brand", "name": p["brand"]}, "category": CAT[p["cat"]]["name"],
                                     "description": p["desc"], "image": img(p["img"], 900), "offers": offer}]
        price_bit = f"{fmt(p['price'])}" + (f", save {fmt(p['old'] - p['price'])}" if pct(p) else "")
        write(f"product/{p['slug']}.html", page="product", title=f"{p['name']} | {SITE['name']}",
              desc=f"{p['desc']} {price_bit}. Delivery across Mauritius or pay monthly from {fmt(monthly(p['price'], 36))} a month."[:300],
              body=body, schema=schema, extra_body_attr=f' data-id="{p["id"]}"')
    # template used for products added in the admin panel before the next rebuild
    _, body = product_body(PRODUCTS[0], "", dynamic=True)
    write("product.html", page="product", title=f"Product | {SITE['name']}", desc="Product details, price, pay monthly options and delivery information at JS Supersonic.", body=body, index=False)


# ================================================================ DEALS
def build_deals():
    root = ""
    deals = sorted([p for p in PRODUCTS if pct(p)], key=pct, reverse=True)
    top = deals[0]
    saved = sum(p["old"] - p["price"] for p in deals)
    cr = [("Home", "index.html"), ("Deals", None)]
    body = f"""<section class="band" style="margin-top:0;padding-top:8px"><div class="w">{crumbs(cr, root).replace('class="crumbs"', 'class="crumbs" style="color:#b9bec9"')}
<div style="display:flex;justify-content:space-between;align-items:flex-end;gap:24px;flex-wrap:wrap;padding:6px 0 30px">
<div><h1 class="disp" style="font-size:clamp(44px,7vw,100px)">Today's deals</h1><p style="color:#b9bec9;margin-top:12px;max-width:52ch">{len(deals)} products are reduced right now, with {fmt(saved)} off in total. Prices reset at midnight.</p></div>
<div class="cd-big" data-cd="big" aria-label="Time left"></div></div>
<article class="spot" style="color:var(--ink)"><a class="spot-img" href="product/{top['slug']}.html" tabindex="-1" aria-hidden="true"><img src="{img(top['img'], 900)}" alt="" width="900" height="900"></a>
<div class="spot-c"><p class="k">Biggest saving today, -{pct(top)}%</p><h2><a href="product/{top['slug']}.html">{e(top['name'])}</a></h2><p style="color:var(--muted)">{e(top['desc'])}</p>
<p class="price"><span class="tag">{fmt(top['price'])}</span><s><span class="sr">Was </span>{fmt(top['old'])}</s> <span class="save">Save {fmt(top['old'] - top['price'])}</span></p>
<div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:8px"><button class="btn" type="button" data-add="{top['id']}">Add to cart</button><a class="btn btn-line" href="product/{top['slug']}.html">Details</a></div></div></article>
</div></section>
<div class="w"><section class="sec" aria-labelledby="all-h">{sec_head('Every deal', hid='all-h')}
{listing_block(root, 'discount').replace('{grid}', ''.join(card(p, root) for p in deals))}</section></div>"""
    write("deals.html", page="deals", title=f"Today's deals | {SITE['name']}",
          desc=f"{len(deals)} products reduced today at {SITE['name']}: TVs, phones, fridges, air conditioners and sofas. Prices reset at midnight.",
          body=body, schema=[crumb_schema(cr)])


# ================================================================ NEW IN
def build_new():
    root = ""
    new = [p for p in PRODUCTS if "new" in p["tags"]]
    a, b = new[0], new[1]
    cr = [("Home", "index.html"), ("New in", None)]

    def feat(p):
        return f"""<a class="promo" href="product/{p['slug']}.html" style="min-height:440px"><img src="{img(p['img'], 1000, 800)}" alt="" width="1000" height="800">
<p class="pc-brand" style="color:var(--yellow)">{e(p['brand'])}</p><h2 class="disp" style="font-size:clamp(26px,3vw,40px)">{e(p['name'])}</h2>
<p><span class="tag">{fmt(p['price'])}</span></p></a>"""
    body = f"""<div class="w"><header class="ph">{crumbs(cr, root)}<h1 class="disp">New in</h1>
<p class="lead">The latest phones, consoles, laptops and furniture to arrive in our showrooms.</p></header>
<div class="duo">{feat(a)}{feat(b)}</div>
<section class="sec" aria-labelledby="more-h">{sec_head('All new arrivals', hid='more-h')}<div class="grid">{''.join(card(p, root) for p in new)}</div></section></div>"""
    write("new.html", page="new", title=f"New in | {SITE['name']}", desc="New phones, consoles, laptops, TVs and furniture just arrived at JS Supersonic Mauritius.",
          body=body, schema=[crumb_schema(cr)])


# ================================================================ BRANDS
def build_brands():
    root = ""
    brands = sorted(set(p["brand"] for p in PRODUCTS), key=str.lower)
    cr = [("Home", "index.html"), ("Brands", None)]
    links = "".join(f'<a href="shop.html?brand={e(b)}" data-label="{e(b)}"><strong>{e(b)}</strong><span>{sum(1 for p in PRODUCTS if p["brand"] == b)} products</span></a>' for b in brands)
    body = f"""<div class="w"><header class="ph">{crumbs(cr, root)}<h1 class="disp">Brands</h1>
<p class="lead">{len(brands)} brands, all bought through official distributors with a local warranty.</p></header><div class="az">{links}</div></div>"""
    write("brands.html", page="brands", title=f"Brands | {SITE['name']}", desc=f"Shop {', '.join(brands[:8])} and more at {SITE['name']} Mauritius.",
          body=body, schema=[crumb_schema(cr)])


# ================================================================ PAY MONTHLY
def build_paymonthly():
    root = ""
    cr = [("Home", "index.html"), ("Pay monthly", None)]
    faqs = DATA["faqs"]["Pay monthly"]
    rates = "".join(f'<li>{m} months: {"no extra cost" if r == 0 else f"{round(r * 100)}% added in total"}</li>' for m, r in SITE["installments"].items())
    body = f"""<div class="w"><header class="ph">{crumbs(cr, root)}<h1 class="disp">Pay monthly</h1>
<p class="lead">Take your TV, fridge or sofa home now and pay for it over 6 to 36 months. Apply at checkout or in any showroom.</p></header>
<section class="calc" aria-labelledby="calc-h"><div class="calc-in"><h2 class="h-sec" id="calc-h" style="margin-bottom:18px">Work out your payment</h2>
<label for="amt" style="font-weight:700">How much do you want to spend?</label><p class="rv" id="amt-out" aria-hidden="true"></p>
<input class="range" id="amt" type="range" min="5000" max="150000" step="500" value="35000">
<p style="font-weight:700;margin-top:18px" id="term-l">Over how long?</p>
<div class="seg" role="group" aria-labelledby="term-l">{''.join(f'<button type="button" data-m="{m}" aria-pressed="{"true" if m == "24" else "false"}">{m} mo</button>' for m in SITE["installments"])}</div></div>
<div class="calc-out" id="res" aria-live="polite"><p>You would pay about</p><p class="amt"></p><p>a month</p>
<dl><dt>Term</dt><dd id="res-term"></dd><dt>Total you pay</dt><dd id="res-total"></dd><dt>Extra cost</dt><dd id="res-extra"></dd></dl>
<p style="color:#b9bec9;font-size:13px;margin-top:16px">An estimate only. Your exact plan is confirmed when you are approved.</p></div></section>
<section class="sec" aria-labelledby="how-h">{sec_head('How it works', hid='how-h')}
<ol class="howto"><li><h3>Choose your products</h3><p>Add them to your cart and pick Pay monthly as the payment at checkout.</p></li>
<li><h3>We call you</h3><p>Our credit team phones within one working day to check your documents and agree the plan.</p></li>
<li><h3>Delivered to your door</h3><p>Once you are approved we deliver as normal. Payments start the following month.</p></li></ol></section>
<section class="sec" aria-labelledby="docs-h"><div class="tips"><h2 class="h-sec" id="docs-h">What you need</h2><ol>
<li><p>Your National Identity Card.</p></li><li><p>Your latest payslip, or three months of bank statements if you are self-employed.</p></li><li><p>A recent utility bill as proof of address.</p></li></ol></div></section>
<section class="sec" aria-labelledby="rates-h"><div class="tips"><h2 class="h-sec" id="rates-h">Plan costs</h2><ol style="counter-reset:none">{rates.replace('<li>', '<li style="grid-template-columns:1fr">')}</ol></div></section>
<section class="sec" aria-labelledby="pfaq-h">{sec_head('Questions', hid='pfaq-h')}<div class="acc">{''.join(f'<details><summary>{e(q)}<i></i></summary><p class="ans">{e(a)}</p></details>' for q, a in faqs)}</div>
<p style="margin-top:28px"><a class="btn" href="deals.html">Find something to buy {icon('arrow')}</a></p></section></div>"""
    faq_schema = {"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in faqs]}
    write("pay-monthly.html", page="pay-monthly", title=f"Pay monthly | {SITE['name']}",
          desc="Spread the cost of TVs, appliances and furniture over 6 to 36 months at JS Supersonic. Six months costs nothing extra. Calculate your monthly payment.",
          body=body, schema=[crumb_schema(cr), faq_schema])


# ================================================================ STORES
def build_stores():
    root = ""
    cr = [("Home", "index.html"), ("Our stores", None)]
    tel = phone_href(SITE["phone"], root)
    cards = "".join(f"""<article class="st-card"><span class="note">{e(s['note'])}</span><h2>{e(s['name'])}</h2><p>{e(s['address'])}</p><p>{e(s['hours'])}</p>
<div class="acts-r"><a class="btn btn-sm" href="https://www.google.com/maps/search/?api=1&amp;query={e((SITE['name'] + ' ' + s['address'] + ' Mauritius').replace(' ', '+'))}" target="_blank" rel="noopener">Directions {icon('arrow')}</a><a class="btn btn-line btn-sm" href="{tel}">Call</a></div></article>""" for s in STORES)
    body = f"""<div class="w"><header class="ph">{crumbs(cr, root)}<h1 class="disp">Our stores</h1>
<p class="lead">See the products before you buy, collect online orders free, or bring something in for a warranty repair.</p></header>
<div class="stores-p">{cards}</div>
<section class="sec"><div class="tips"><h2 class="h-sec">In every showroom</h2><ol><li><p>Click & Collect for online orders, usually ready in 2 hours.</p></li><li><p>Pay monthly applications answered the same day for most customers.</p></li><li><p>Trade-in quotes for your old phone.</p></li></ol></div></section></div>"""
    write("stores.html", page="stores", title=f"Our stores | {SITE['name']}",
          desc=f"Find a JS Supersonic showroom in {', '.join(s['name'] for s in STORES)}. Opening hours, directions and Click & Collect.",
          body=body, schema=[crumb_schema(cr), ORG])


# ================================================================ HELP
def build_help():
    root = ""
    cr = [("Home", "index.html"), ("Help and contact", None)]
    faqs = DATA["faqs"]
    topics = list(faqs.keys())
    tabs_html = "".join(f'<button type="button" role="tab" id="ht-{i}" aria-controls="hp-{i}" aria-selected="{"true" if i == 0 else "false"}"{"" if i == 0 else " tabindex=-1"}>{e(t)}</button>' for i, t in enumerate(topics))
    panels = "".join(f'<div class="acc" id="hp-{i}" role="tabpanel" aria-labelledby="ht-{i}"{"" if i == 0 else " hidden"}>' +
                     "".join(f'<details><summary>{e(q)}<i></i></summary><p class="ans">{e(a)}</p></details>' for q, a in faqs[t]) + "</div>" for i, t in enumerate(topics))
    tel, wa = phone_href(SITE["phone"], root), wa_href(SITE["whatsapp"], root)
    form = f"""<form class="box" id="contact" data-guard novalidate style="margin-top:40px"><h2 class="h-sec" style="margin-bottom:6px">Send us a message</h2><p class="mo" style="margin-bottom:18px">We reply within one working day.</p>
{hp_field()}<div class="fgrid">{fld('Your name', 'name', auto='name', err='Please tell us your name.')}{fld('Phone', 'phone', 'tel', req=False, auto='tel')}
{fld('Email', 'email', 'email', full=True, auto='email', err='Please enter a valid email address.')}
<div class="fld full"><label for="f-topic">What is it about?</label><select class="sel" id="f-topic" name="topic"><option>An order or delivery</option><option>Pay monthly</option><option>Warranty or repair</option><option>A return</option><option>Business order</option><option>Something else</option></select></div>
{fld('Message', 'message', 'textarea', full=True, err='Please write your message.')}</div>
<button class="btn" type="submit" style="margin-top:16px">Send message</button><p class="form-msg" role="status"></p></form>"""
    body = f"""<div class="w"><header class="ph">{crumbs(cr, root)}<h1 class="disp">Help and contact</h1>
<p class="lead">Answers about orders, delivery, returns, warranty and paying monthly.</p></header>
<div class="help"><div><div id="faq-tabs"><div class="tabs" role="tablist" aria-label="Help topics">{tabs_html}</div></div>{panels}<div id="contact" style="scroll-margin-top:150px"></div>{form.replace('id="contact" ', '')}</div>
<aside class="contact-card" aria-label="Contact details"><h2 class="disp">Talk to us</h2>
<a href="{tel}">{icon('phone', 'ic')} {e(SITE['phone'])}</a><a href="{wa}"{' target="_blank" rel="noopener"' if wa.startswith('https') else ''}>{icon('chat', 'ic')} WhatsApp</a><a href="mailto:{e(SITE['email'])}">{icon('mail', 'ic')} {e(SITE['email'])}</a><a href="track.html">{icon('truck', 'ic')} Track my order</a>
<p>{e(SITE['hours'])}</p></aside></div></div>"""
    body = body.replace('<form class="box" data-guard', '<form class="box" id="contact-form" data-guard')
    faq_schema = {"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for t in topics for q, a in faqs[t]]}
    write("help.html", page="help", title=f"Help and contact | {SITE['name']}",
          desc="Delivery costs, returns, warranty repairs and pay monthly questions answered. Call, WhatsApp or message JS Supersonic.",
          body=body, schema=[crumb_schema(cr), faq_schema])
    f = ROOT / "help.html"
    f.write_text(f.read_text(encoding="utf-8").replace('id="contact-form"', 'id="contact"').replace('<div id="contact" style="scroll-margin-top:150px"></div>', ''), encoding="utf-8")


# ================================================================ SIMPLE PAGES
def build_simple():
    root = ""
    # cart
    cr = [("Home", "index.html"), ("Cart", None)]
    write("cart.html", page="cart", title=f"Your cart | {SITE['name']}", desc="Review the products in your JS Supersonic cart, apply a promo code and see delivery costs.", index=False,
          body=f"""<div class="w"><header class="ph">{crumbs(cr, root)}<h1 class="disp">Your cart</h1></header><div id="cart"></div>
<section class="sec" aria-labelledby="recs-h">{sec_head('Also on sale', hid='recs-h')}<div class="rail-wrap"><button class="rail-btn p" type="button" aria-label="Scroll back">{icon('left')}</button><div class="rail" id="recs"></div><button class="rail-btn n" type="button" aria-label="Scroll forward">{icon('arrow')}</button></div></section></div>""")
    # wishlist
    cr = [("Home", "index.html"), ("Wishlist", None)]
    write("wishlist.html", page="wishlist", title=f"Wishlist | {SITE['name']}", desc="The products you saved for later at JS Supersonic, with current prices.", index=False,
          body=f"""<div class="w"><header class="ph">{crumbs(cr, root)}<h1 class="disp">Your wishlist</h1><p class="lead">Saved on this device. Prices update when we change them.</p></header>
<div class="bar"><p class="cnt" id="count"></p><a class="link" id="wish-all" href="shop.html" hidden>Keep browsing {icon('arrow')}</a></div><div class="grid" id="grid"></div></div>""")
    # track
    cr = [("Home", "index.html"), ("Track my order", None)]
    write("track.html", page="track", title=f"Track my order | {SITE['name']}", desc="Check where your JS Supersonic order is.", index=False,
          body=f"""<div class="w" style="max-width:760px"><header class="ph">{crumbs(cr, root)}<h1 class="disp">Track my order</h1><p class="lead">Enter the order number from your confirmation.</p></header>
<form class="box" id="track-f" data-guard novalidate><div class="fgrid">{fld('Order number', 'no', auto='off', ph='JSS1234567', err='Please enter your order number.')}{fld('Email used for the order', 'email', 'email', req=False, auto='email')}</div>
<button class="btn" type="submit" style="margin-top:16px">Find my order</button></form><div id="track-out" aria-live="polite"></div></div>""")
    # account
    cr = [("Home", "index.html"), ("My account", None)]
    write("account.html", page="account", title=f"My account | {SITE['name']}", desc="Sign in to see your orders and details.", index=False,
          body=f"""<div class="w" id="acct"><header class="ph">{crumbs(cr, root)}<h1 class="disp">My account</h1></header>
<div class="auth" id="auth">
<form class="box" id="login" novalidate><h2>Sign in</h2>{fld('Email', 'email', 'email', auto='email', err='Please enter your email.')}<div style="height:14px"></div>{fld('Password', 'password', 'password', auto='current-password', err='Please enter your password.')}
<button class="btn btn-block" type="submit" style="margin-top:18px">Sign in</button><p class="form-msg" role="status"></p></form>
<form class="box" id="register" data-guard novalidate><h2>Create an account</h2>{hp_field()}<div class="fgrid">{fld('First name', 'fname', auto='given-name')}{fld('Last name', 'lname', auto='family-name')}
{fld('Email', 'email', 'email', full=True, auto='email', err='Please enter a valid email.')}{fld('Mobile', 'phone', 'tel', full=True, auto='tel', err='Please enter a valid phone number.')}
{fld('Password', 'password', 'password', full=True, auto='new-password', extra=' minlength="8"', err='At least 8 characters.')}</div>
<button class="btn btn-ink btn-block" type="submit" style="margin-top:18px">Create account</button><p class="form-msg" role="status"></p>
<p class="mo" style="margin-top:10px">Accounts in this preview are stored on this device only.</p></form></div>
<div id="dash" hidden><div class="acct"><div id="acct-tabs"><div class="tabs acct-nav" role="tablist" aria-label="Account sections" style="border:0;margin:0;flex-direction:column">
<button type="button" role="tab" id="at-o" aria-controls="ap-o" aria-selected="true">Orders</button><button type="button" role="tab" id="at-d" aria-controls="ap-d" aria-selected="false" tabindex="-1">My details</button></div>
<button class="btn btn-line btn-block" id="logout" type="button" style="margin-top:10px">Sign out</button></div>
<div><h2 class="h-sec" id="hello" style="margin-bottom:16px"></h2>
<section class="box" id="ap-o" role="tabpanel" aria-labelledby="at-o"><div id="my-orders"></div></section>
<section class="box" id="ap-d" role="tabpanel" aria-labelledby="at-d" hidden><form id="details" novalidate><div class="fgrid">{fld('First name', 'fname', auto='given-name')}{fld('Last name', 'lname', auto='family-name')}
{fld('Email', 'email', 'email', full=True, extra=' readonly')}{fld('Mobile', 'phone', 'tel', full=True, auto='tel')}</div><button class="btn" type="submit" style="margin-top:16px">Save details</button><p class="form-msg" role="status"></p></form></section>
</div></div></div></div>""")
    # checkout
    cr = [("Home", "index.html"), ("Cart", "cart.html"), ("Checkout", None)]
    pay_opts = [("card", "Credit or debit card", "Visa or Mastercard, secured with 3-D Secure", "VISA, MC"),
                ("juice", "Juice by MCB", "A payment request is sent to your Juice app", ""),
                ("myt", "my.t money", "Scan a QR code with your my.t money app", ""),
                ("blink", "Blink by Emtel", "Confirm the payment in the Blink app", ""),
                ("cod", "Cash on delivery", "Pay in cash or by card when it arrives", ""),
                ("hp", "Pay monthly", "6 to 36 months, subject to approval", "")]
    opts = "".join(f'<label class="opt"><input type="radio" name="pay" value="{v}"{" checked" if i == 0 else ""}><span><strong>{t}</strong><span>{d}</span></span>{f"<em>{x}</em>" if x else ""}</label>' for i, (v, t, d, x) in enumerate(pay_opts))
    write("checkout.html", page="checkout", title=f"Checkout | {SITE['name']}", desc="Check out from JS Supersonic with home delivery or Click & Collect and pay by card, Juice, my.t money or monthly.", index=False,
          body=f"""<div class="w" id="co"><header class="ph">{crumbs(cr, root)}<h1 class="disp">Checkout</h1></header>
<ol class="steps-co" aria-label="Checkout steps"><li class="on">Your details</li><li>Delivery</li><li>Payment</li></ol>
<div class="notice">{icon('lock', 'ic')}<span><b>Preview checkout.</b> Online payments are not switched on yet, so placing an order here does not charge you.</span></div>
<div class="cart"><form id="co-form" data-guard novalidate>{hp_field()}
<section class="box co-sec" aria-labelledby="co1"><h2 id="co1">1. Your details</h2><div class="fgrid">{fld('First name', 'fname', auto='given-name', err='Please enter your first name.')}{fld('Last name', 'lname', auto='family-name', err='Please enter your last name.')}
{fld('Mobile', 'phone', 'tel', auto='tel', ph='5 123 4567', err='Please enter a phone number we can call.')}{fld('Email', 'email', 'email', auto='email', err='Please enter a valid email for your receipt.')}</div></section>
<section class="box co-sec" aria-labelledby="co2"><h2 id="co2">2. Delivery</h2>
<div class="opts two-c"><label class="opt"><input type="radio" name="delivery" value="home" checked><span><strong>Deliver to me</strong><span>24 to 72 hours on the main island</span></span></label>
<label class="opt"><input type="radio" name="delivery" value="collect"><span><strong>Click & Collect</strong><span>Free, usually ready in 2 hours</span></span><em style="color:var(--green)">Free</em></label></div>
<div id="home-f" style="margin-top:16px"><div class="fgrid">
<div class="fld full"><label for="f-address">Street and house number <span class="req" aria-hidden="true">*</span></label><input class="in" id="f-address" name="address" data-req autocomplete="street-address"><p class="err">Please enter your address.</p></div>
<div class="fld"><label for="f-town">Town or village <span class="req" aria-hidden="true">*</span></label><input class="in" id="f-town" name="town" data-req autocomplete="address-level2"><p class="err">Please enter your town.</p></div>
<div class="fld"><label for="district">District <span class="req" aria-hidden="true">*</span></label><select class="sel" id="district" name="district" data-req><option value="">Choose</option></select><p class="err">Please choose your district.</p></div>
{fld('Notes for the driver', 'notes', req=False, full=True, ph='Gate code, floor, best time to call')}</div>
<label class="chk" id="install-row" hidden style="margin-top:8px"><input type="checkbox" id="install"> Install my air conditioner (<span id="install-fee"></span>)</label></div>
<div id="collect-f" style="margin-top:16px" hidden><div class="fld"><label for="store">Collect from</label><select class="sel" id="store" name="store"></select></div></div></section>
<section class="box co-sec" aria-labelledby="co3"><h2 id="co3">3. Payment</h2><div class="opts">{opts}</div>
<div class="pay-x" data-pay="card" id="card-x"><div class="fgrid">
<div class="fld full"><label for="cc-num">Card number <span class="req" aria-hidden="true">*</span></label><input class="in" id="cc-num" inputmode="numeric" autocomplete="cc-number" data-rule="card" placeholder="1234 5678 9012 3456"><p class="err">Please check the card number.</p></div>
<div class="fld"><label for="cc-exp">Expiry <span class="req" aria-hidden="true">*</span></label><input class="in" id="cc-exp" inputmode="numeric" autocomplete="cc-exp" data-rule="exp" placeholder="MM/YY"><p class="err">Use MM/YY.</p></div>
<div class="fld"><label for="cc-cvc">Security code <span class="req" aria-hidden="true">*</span></label><input class="in" id="cc-cvc" inputmode="numeric" autocomplete="cc-csc" minlength="3" placeholder="3 digits on the back"><p class="err">3 or 4 digits.</p></div></div></div>
<div class="pay-x" data-pay="juice" hidden>We send a payment request to the Juice app on the mobile number above.</div>
<div class="pay-x" data-pay="myt" hidden>A my.t money QR code appears after you place the order.</div>
<div class="pay-x" data-pay="blink" hidden>You confirm the payment in the Blink app after placing the order.</div>
<div class="pay-x" data-pay="cod" hidden>Our drivers carry a card machine, so you can pay by card at the door too.</div>
<div class="pay-x" data-pay="hp" id="hp-x" hidden><div class="fld"><label for="hp-plan">Preferred plan</label><select class="sel" id="hp-plan" name="hpplan"></select></div>
<p class="mo" style="margin-top:10px">Our credit team calls you within one working day. Have your ID card, latest payslip and a utility bill ready.</p></div>
</section></form>
<aside class="box sum" id="co-sum" aria-label="Order summary"></aside></div></div>""")
    # privacy + terms
    upd = date.today().strftime("%-d %B %Y")
    privacy = f"""<h2>Who we are</h2><p>{e(SITE['legal_name'])} sells electronics, appliances and furniture in Mauritius and runs this website. For anything about your personal data, email {e(SITE['email'])}.</p>
<h2>What we collect</h2><ul><li>Details you give us when you order, create an account or contact us: name, email, phone, delivery address and messages.</li><li>Your cart, wishlist and recently viewed products, kept in your browser.</li><li>If you accept analytics cookies: anonymous information about pages visited.</li></ul>
<h2>Why we use it</h2><ul><li>To deliver your order, take payment and handle warranty and returns.</li><li>To assess a pay monthly application, which you ask us to do.</li><li>To send offers, only if you signed up. Every email has an unsubscribe link.</li></ul>
<h2>Who we share it with</h2><p>Delivery staff, our payment providers and, for pay monthly, our credit partner. We do not sell personal data.</p>
<h2>How long we keep it</h2><p>Order records are kept for 7 years for accounting. Marketing consent is kept until you withdraw it.</p>
<h2>Your rights</h2><p>Under the Data Protection Act 2017 you can ask to see, correct or delete your data, or object to how we use it. Email us and we reply within one month. You can also complain to the Data Protection Office of Mauritius.</p>
<h2 id="cookies">Cookies</h2><p>Essential storage keeps your cart, wishlist and cookie choice on your device. Analytics cookies are only set if you choose Accept all. You can change your choice at any time with Cookie settings at the bottom of every page.</p>"""
    terms = f"""<h2>Prices</h2><p>All prices are in Mauritian rupees and include VAT. We check prices carefully, but if a price is clearly wrong we will contact you before processing the order.</p>
<h2>Orders</h2><p>An order is accepted when we confirm it by email or phone. We may cancel an order if an item is out of stock, and refund you in full.</p>
<h2>Delivery</h2><p>Delivery is free on orders over {fmt(SITE['free_delivery_from'])} on the main island. Below that it costs {fmt(SITE['delivery_fee'])}. Rodrigues deliveries are quoted separately.</p>
<h2>Returns</h2><p>Unopened items can be returned within 7 days with proof of purchase. This does not affect your rights if an item is faulty.</p>
<h2>Warranty</h2><p>Products carry the warranty listed on their page. Warranty does not cover damage from misuse, power surges or unauthorised repairs.</p>
<h2>Pay monthly</h2><p>Plans are subject to approval and a separate agreement that sets out the full cost before you sign.</p>
<h2>Law</h2><p>These terms are governed by the laws of the Republic of Mauritius.</p>"""
    for path, h, txt, d in [("privacy.html", "Privacy policy", privacy, "How JS Supersonic collects, uses and protects personal data under the Mauritius Data Protection Act 2017."),
                            ("terms.html", "Terms and conditions", terms, "Terms for buying from JS Supersonic: prices, orders, delivery, returns, warranty and pay monthly.")]:
        cr = [("Home", "index.html"), (h, None)]
        write(path, page=path[:-5], title=f"{h} | {SITE['name']}", desc=d,
              body=f'<div class="w"><header class="ph">{crumbs(cr, root)}<h1 class="disp">{h}</h1></header><article class="prose"><p class="upd">Last updated {upd}. This is a starting template and should be checked by the business before launch.</p>{txt}</article></div>',
              schema=[crumb_schema(cr)])
    # 404 (base href so links work at any depth)
    picks = sorted(PRODUCTS, key=lambda p: ("best" in p["tags"], p["reviews"]), reverse=True)[:4]
    write("404.html", page="404", title=f"Page not found | {SITE['name']}", desc="This page does not exist. Search JS Supersonic or go back to the homepage.", index=False, base=URL,
          body=f"""<div class="w nf"><p class="big" aria-hidden="true">4<span>0</span>4</p><h1 class="h-sec">This page went supersonic</h1>
<p>The link may be old or mistyped. Search for what you need or start from one of these.</p>
<form class="search" action="shop.html" role="search" style="max-width:560px;margin:0 auto 22px;box-shadow:0 0 0 2px var(--ink)"><label class="sr" for="q404">Search products</label><input id="q404" type="search" name="q" placeholder="Search products"><button type="submit" aria-label="Search">{icon('search', 'ic')}</button><div class="suggest" hidden></div></form>
<div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap"><a class="btn" href="index.html">Go to the homepage</a><a class="btn btn-line" href="deals.html">Today's deals</a></div>
<section class="sec" style="text-align:left">{sec_head('Popular right now')}<div class="grid">{''.join(card(p, '') for p in picks)}</div></section></div>""")


# ================================================================ DATA + SEO FILES
def build_data_files():
    pub = {"site": {k: v for k, v in SITE.items()}, "categories": CATS, "products": PRODUCTS, "stores": STORES, "districts": DISTRICTS}
    (ROOT / "assets/js/catalog.js").write_text(
        "/* Generated by build.py from data/catalog.json. Do not edit by hand. */\nwindow.JSS=" + json.dumps(pub, ensure_ascii=False, separators=(",", ":")) + ";\n", encoding="utf-8")
    urls = [p for p, idx in PAGES.items() if idx]
    pri = lambda p: "1.0" if p == "index.html" else "0.8" if p.startswith("category/") or p in ("deals.html", "shop.html") else "0.6"
    sm = "\n".join(f"  <url><loc>{URL}{'' if p == 'index.html' else p}</loc><lastmod>{TODAY}</lastmod><priority>{pri(p)}</priority></url>" for p in sorted(urls, key=lambda x: (x != "index.html", x)))
    (ROOT / "sitemap.xml").write_text(f'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n{sm}\n</urlset>\n', encoding="utf-8")
    (ROOT / "robots.txt").write_text(f"User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /cart.html\nDisallow: /checkout.html\nDisallow: /account.html\nDisallow: /track.html\nDisallow: /wishlist.html\n\nSitemap: {URL}sitemap.xml\n", encoding="utf-8")
    lines = [f"# {SITE['name']}", "", f"> {SITE['tagline']} Online shop and {len(STORES)} showrooms in Mauritius ({', '.join(s['name'] for s in STORES)}).", "",
             "Prices are in Mauritian rupees (Rs) and include VAT. Delivery is free on orders over Rs 5,000. Pay monthly over 6 to 36 months.", "",
             "## Main pages", f"- [All products]({URL}shop.html)", f"- [Today's deals]({URL}deals.html)", f"- [New in]({URL}new.html)", f"- [Pay monthly]({URL}pay-monthly.html)",
             f"- [Stores and opening hours]({URL}stores.html)", f"- [Help, delivery and returns]({URL}help.html)", "", "## Categories"]
    lines += [f"- [{c['name']}]({URL}category/{c['id']}.html): {c['line']}" for c in CATS]
    lines += ["", "## Products"] + [f"- [{p['name']}]({URL}product/{p['slug']}.html): {fmt(p['price'])}" for p in PRODUCTS]
    (ROOT / "llms.txt").write_text("\n".join(lines) + "\n", encoding="utf-8")


if __name__ == "__main__":
    build_home()
    build_shop()
    build_categories()
    build_products()
    build_deals()
    build_new()
    build_brands()
    build_paymonthly()
    build_stores()
    build_help()
    build_simple()
    build_data_files()
    print(f"Built {len(PAGES)} pages ({sum(PAGES.values())} in the sitemap).")
