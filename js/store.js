/* ═══════════════════════════════════════════════════════════
   HARBWEAR™ — store engine
   Cart · Wishlist · Search · Product modal (zoom/3D/sizes) ·
   Checkout (address → payment → email OTP → done) · Loyalty
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  var PRODUCTS = window.HB_PRODUCTS || [];
  var SIZE_GUIDE = window.HB_SIZE_GUIDE || {};
  var COUPONS = window.HB_COUPONS || {};
  var TIERS = window.HB_TIERS || [];
  var hasGsap = typeof window.gsap !== 'undefined';

  var LS = {
    cart: 'harbwear_cart',
    wish: 'harbwear_wishlist',
    prof: 'harbwear_profile'
  };

  /* ── helpers ── */
  function load(k, def) { try { return JSON.parse(localStorage.getItem(k)) || def; } catch (e) { return def; } }
  function save(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function fmt(n) { return 'EGP ' + (Math.round(Number(n || 0) * 100) / 100).toLocaleString('en-US', { maximumFractionDigits: 2 }); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (m) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]; }); }
  function byId(id) { for (var i = 0; i < PRODUCTS.length; i++) { if (PRODUCTS[i].id === id) return PRODUCTS[i]; } return null; }
  function rnd(n) { return Math.floor(Math.random() * n); }
  function genCode(prefix, len) { var s = ''; for (var i = 0; i < len; i++) s += '0123456789ABCDEFGHJKLMNPQRSTUVWXYZ'[rnd(32)]; return prefix + s; }
  function emailOk(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v); }

  /* ── profile / loyalty ── */
  function profile() {
    var p = load(LS.prof, null);
    if (!p) {
      p = { name: '', email: '', phone: '', password: '', referralCode: genCode('HW-', 6), points: 0, spent: 0, orders: [], referredBy: '' };
      save(LS.prof, p);
    }
    return p;
  }
  function tierFor(points) {
    var t = TIERS[0];
    for (var i = 0; i < TIERS.length; i++) { if (points >= TIERS[i].min) t = TIERS[i]; }
    return t;
  }
  function nextTier(points) {
    for (var i = 0; i < TIERS.length; i++) { if (TIERS[i].min > points) return TIERS[i]; }
    return null;
  }
  function tierProgress(points) {
    var t = tierFor(points), n = nextTier(points);
    if (!n) return 100;
    return Math.min(100, Math.round((points - t.min) / (n.min - t.min) * 100));
  }
  function loyaltyCardHTML(compact) {
    var p = profile(), t = tierFor(p.points), n = nextTier(p.points), prog = tierProgress(p.points);
    var h = '<div class="loyalty-card' + (compact ? ' mini' : '') + '">';
    h += '<div class="lc-top"><span class="lc-tier">' + t.name + ' Member</span><span class="lc-pts">' + p.points.toLocaleString() + ' pts</span></div>';
    h += '<div class="lc-bar"><i style="width:' + prog + '%"></i></div>';
    h += '<div class="lc-bot">' + (n ? 'Next: <b>' + n.name + '</b> at ' + n.min.toLocaleString() + ' pts' : '<b>Elite</b> — highest tier reached') + '</div>';
    h += '</div>';
    return h;
  }

  /* ── cart ── */
  function cart() { return load(LS.cart, []); }
  function saveCart(c) { save(LS.cart, c); renderAll(); }
  function cartCount() { return cart().reduce(function (s, i) { return s + i.qty; }, 0); }
  function cartSubtotal() { return cart().reduce(function (s, i) { return s + i.qty * i.price; }, 0); }
  function wish() { return load(LS.wish, []); }
  function saveWish(w) { save(LS.wish, w); renderAll(); }
  function inWish(id) { return wish().indexOf(id) !== -1; }

  /* ══════════ PRODUCT GRID ══════════ */
  var activeCat = 'all';
  var activeCol = null;

  function catLabel(c) {
    var m = { 't-shirts': 'T-Shirts', 'hoodies': 'Hoodies', 'sweatshirts': 'Sweatshirts', 'cargo': 'Cargo', 'jeans': 'Jeans', 'shorts': 'Shorts', 'sneakers': 'Sneakers', 'caps': 'Caps', 'bags': 'Bags', 'socks': 'Socks', 'pants': 'Pants', 'accessories': 'Accessories', 'oversized': 'Oversized' };
    return m[c] || c;
  }

  function renderCatChips() {
    var wrap = $('#cat-filter');
    if (!wrap) return;
    var cats = ['all'];
    PRODUCTS.forEach(function (p) { if (cats.indexOf(p.cat) === -1) cats.push(p.cat); });
    var h = '<button class="cat-fchip active" data-cat="all">All <i>' + PRODUCTS.length + '</i></button>';
    cats.slice(1).forEach(function (c) {
      var n = PRODUCTS.filter(function (p) { return p.cat === c || (p.cats || []).indexOf(c) !== -1; }).length;
      h += '<button class="cat-fchip" data-cat="' + esc(c) + '">' + catLabel(c) + ' <i>' + n + '</i></button>';
    });
    wrap.innerHTML = h;
    $$('.cat-fchip', wrap).forEach(function (btn) {
      btn.addEventListener('click', function () {
        activeCat = btn.dataset.cat;
        activeCol = null;
        $$('.cat-fchip', wrap).forEach(function (b) { b.classList.toggle('active', b === btn); });
        $('#filter-chip').hidden = true;
        var t = $('#prods-title');
        if (t) t.innerHTML = 'New<br><em>Arrivals</em>';
        renderGrid();
      });
    });
  }

  function renderGrid() {
    var grid = $('#prod-grid');
    if (!grid) return;
    var items = PRODUCTS.filter(function (p) {
      if (activeCol && (p.cats || []).indexOf(activeCol) === -1) return false;
      if (activeCat !== 'all' && p.cat !== activeCat && (p.cats || []).indexOf(activeCat) === -1) return false;
      return true;
    });
    var h = '';
    items.forEach(function (p) {
      h += '<div class="prod-card" data-product="' + esc(p.id) + '">';
      h += '<a class="pc-img" href="#" data-open="' + esc(p.id) + '" data-hover><img src="assets/img/' + p.img + '" alt="' + esc(p.name) + '" loading="lazy">';
      if (p.tag) h += '<span class="pc-tag">' + esc(p.tag) + '</span>';
      h += '</a>';
      h += '<button class="pc-wish' + (inWish(p.id) ? ' on' : '') + '" data-wish="' + esc(p.id) + '" aria-label="Wishlist">' + (inWish(p.id) ? '♥' : '♡') + '</button>';
      h += '<div class="pc-meta"><span class="pc-name">' + esc(p.name) + '</span><span class="pc-price">' + fmt(p.price) + '</span></div>';
      h += '<button class="pc-btn" data-add="' + esc(p.id) + '" type="button" data-hover><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M6 8h12l-1.2 12.2a1.6 1.6 0 0 1-1.6 1.4H8.8a1.6 1.6 0 0 1-1.6-1.4L6 8Z"/><path d="M9 10V6a3 3 0 0 1 6 0v4"/></svg><span>Add to Cart</span></button>';
      h += '</div>';
    });
    grid.innerHTML = h;
    if (hasGsap) {
      gsap.fromTo('#prod-grid .prod-card', { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: .8, stagger: .05, ease: 'power3.out', overwrite: true });
    }
    bindGrid();
  }

  function bindGrid() {
    $$('[data-open]').forEach(function (a) {
      a.addEventListener('click', function (e) { e.preventDefault(); openModal(a.dataset.open); });
    });
    $$('[data-wish]').forEach(function (b) {
      b.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); toggleWish(b.dataset.wish); });
    });
    $$('[data-add]').forEach(function (b) {
      b.addEventListener('click', function (e) {
        e.preventDefault();
        var p = byId(b.dataset.add);
        if (!p) return;
        addToCart(p, p.sizes[0], p.colors[0], 1);
        flashBtn(b);
      });
    });
  }

  function flashBtn(btn) {
    btn.classList.add('added');
    var span = btn.querySelector('span');
    var old = span.textContent;
    span.textContent = 'Added ✓';
    setTimeout(function () { btn.classList.remove('added'); span.textContent = old; }, 1300);
  }

  /* ══════════ CART + WISHLIST ACTIONS ══════════ */
  function addToCart(p, size, color, qty) {
    var c = cart();
    var found = null;
    for (var i = 0; i < c.length; i++) {
      if (c[i].id === p.id && c[i].size === size && c[i].color === color) { found = c[i]; break; }
    }
    if (found) { found.qty += qty; } else {
      c.push({ id: p.id, name: p.name, price: p.price, img: p.img, size: size, color: color, qty: qty });
    }
    saveCart(c);
    var badge = $('#nav-cart-count');
    if (badge && hasGsap) gsap.fromTo(badge, { scale: 1.8 }, { scale: 1, duration: .5, ease: 'back.out(3)' });
  }

  function toggleWish(id) {
    var w = wish();
    var i = w.indexOf(id);
    if (i === -1) { w.push(id); } else { w.splice(i, 1); }
    saveWish(w);
    var btn = $('[data-wish="' + id + '"]');
    if (btn) { btn.classList.toggle('on', inWish(id)); btn.textContent = inWish(id) ? '♥' : '♡'; }
    renderAll();
  }

  /* ══════════ DRAWER (cart / wishlist) ══════════ */
  function openDrawer() {
    $('#drawer-backdrop').classList.add('show');
    $('#cart-drawer').classList.add('open');
    document.body.classList.add('ov-open');
  }
  function closeDrawer() {
    $('#drawer-backdrop').classList.remove('show');
    $('#cart-drawer').classList.remove('open');
    document.body.classList.remove('ov-open');
  }

  function renderDrawer() {
    var tab = ($('.dtab.active') || {}).dataset ? $('.dtab.active').dataset.tab : 'cart';
    var body = $('#drawer-body'), foot = $('#drawer-foot');
    if (tab === 'wish') { renderWishTab(); return; }
    var c = cart();
    var h = '';
    if (!c.length) {
      h = '<div class="drawer-empty"><span class="de-mark">🛍</span><p>Your cart is empty.</p><button class="btn btn-ghost" id="de-shop">Browse Products</button></div>';
    } else {
      c.forEach(function (i, idx) {
        h += '<div class="d-item">';
        h += '<img src="assets/img/' + i.img + '" alt="' + esc(i.name) + '">';
        h += '<div class="di-info"><span class="di-name">' + esc(i.name) + '</span>';
        h += '<span class="di-vars">' + esc(i.color) + (i.size && i.size !== 'One Size' ? ' · ' + esc(i.size) : '') + '</span>';
        h += '<span class="di-price">' + fmt(i.price) + '</span></div>';
        h += '<div class="di-qty"><button data-q="' + idx + '" data-d="-1">−</button><span>' + i.qty + '</span><button data-q="' + idx + '" data-d="1">+</button></div>';
        h += '<button class="di-rm" data-rm="' + idx + '" aria-label="Remove">✕</button>';
        h += '</div>';
      });
    }
    body.innerHTML = h;

    if (c.length) {
      var sub = cartSubtotal();
      var freeProg = Math.min(100, Math.round(sub / 1500 * 100));
      foot.innerHTML =
        '<div class="ship-bar"><i style="width:' + freeProg + '%"></i></div>' +
        '<div class="ship-note">' + (sub >= 1500 ? '🎉 Free standard shipping unlocked' : 'Add <b>' + fmt(1500 - sub) + '</b> for free shipping') + '</div>' +
        loyaltyCardHTML(true) +
        '<div class="drawer-sub"><span>Subtotal</span><span id="drawer-subtotal">' + fmt(sub) + '</span></div>' +
        '<button class="btn btn-primary w-full" id="drawer-checkout">Continue to Payment →</button>';
      var co = $('#drawer-checkout');
      if (co) co.addEventListener('click', function () { closeDrawer(); openCheckout(); });
    } else {
      foot.innerHTML = '<button class="btn btn-primary w-full" id="de-shop2">Browse Products</button>';
      $('#de-shop2').addEventListener('click', function () { closeDrawer(); smoothTo('#products'); });
    }
    var ds = $('#de-shop');
    if (ds) ds.addEventListener('click', function () { closeDrawer(); smoothTo('#products'); });

    $$('[data-q]').forEach(function (b) {
      b.addEventListener('click', function () {
        var c2 = cart(), i = c2[+b.dataset.q];
        if (!i) return;
        i.qty += +b.dataset.d;
        if (i.qty < 1) i.qty = 1;
        saveCart(c2);
      });
    });
    $$('[data-rm]').forEach(function (b) {
      b.addEventListener('click', function () {
        var c2 = cart(); c2.splice(+b.dataset.rm, 1); saveCart(c2);
      });
    });
    $('#drawer-cart-count').textContent = cartCount();
  }

  function renderWishTab() {
    var body = $('#drawer-body'), foot = $('#drawer-foot');
    var w = wish();
    var h = '';
    if (!w.length) {
      h = '<div class="drawer-empty"><span class="de-mark">♡</span><p>No saved items yet.</p><p class="de-sub">Tap the heart on any product.</p><button class="btn btn-ghost" id="de-wish-shop">Browse Products</button></div>';
    } else {
      w.forEach(function (id) {
        var p = byId(id);
        if (!p) return;
        h += '<div class="d-item">';
        h += '<img src="assets/img/' + p.img + '" alt="' + esc(p.name) + '">';
        h += '<div class="di-info"><span class="di-name">' + esc(p.name) + '</span><span class="di-price">' + fmt(p.price) + '</span></div>';
        h += '<button class="di-add" data-wadd="' + esc(p.id) + '">Add</button>';
        h += '<button class="di-rm" data-wrm="' + esc(id) + '" aria-label="Remove">✕</button>';
        h += '</div>';
      });
    }
    body.innerHTML = h;
    foot.innerHTML = w.length ? loyaltyCardHTML(true) : '';
    $$('[data-wadd]').forEach(function (b) {
      b.addEventListener('click', function () {
        var p = byId(b.dataset.wadd); if (!p) return;
        addToCart(p, p.sizes[0], p.colors[0], 1);
        b.textContent = '✓';
      });
    });
    $$('[data-wrm]').forEach(function (b) {
      b.addEventListener('click', function () { toggleWish(b.dataset.wrm); });
    });
    var ds = $('#de-wish-shop');
    if (ds) ds.addEventListener('click', function () { closeDrawer(); smoothTo('#products'); });
    $('#drawer-wish-count').textContent = w.length;
  }

  /* ══════════ SEARCH ══════════ */
  function openSearch() { $('#search-overlay').hidden = false; document.body.classList.add('ov-open'); setTimeout(function () { var i = $('#search-input'); if (i) i.focus(); }, 50); }
  function closeSearch() { $('#search-overlay').hidden = true; document.body.classList.remove('ov-open'); }

  function runSearch(q) {
    var wrap = $('#search-results'), hint = $('#search-hint');
    q = (q || '').trim().toLowerCase();
    if (!q) { wrap.innerHTML = ''; hint.textContent = 'Type to search ' + PRODUCTS.length + ' products'; return; }
    var hits = PRODUCTS.filter(function (p) {
      return (p.name + ' ' + p.cat + ' ' + (p.cats || []).join(' ') + ' ' + p.desc).toLowerCase().indexOf(q) !== -1;
    });
    hint.textContent = hits.length + ' result' + (hits.length === 1 ? '' : 's') + ' for "' + esc(q) + '"';
    var h = '';
    hits.slice(0, 12).forEach(function (p) {
      h += '<div class="s-result" data-open="' + esc(p.id) + '">';
      h += '<img src="assets/img/' + p.img + '" alt="">';
      h += '<div><span class="s-name">' + esc(p.name) + '</span><span class="s-cat">' + catLabel(p.cat) + '</span></div>';
      h += '<span class="s-price">' + fmt(p.price) + '</span></div>';
    });
    wrap.innerHTML = h || '<p class="s-none">Nothing found for "' + esc(q) + '". Try "tee", "hoodie", "cap".</p>';
    $$('[data-open]', wrap).forEach(function (r) {
      r.addEventListener('click', function () { closeSearch(); openModal(r.dataset.open); });
    });
  }

  /* ══════════ PRODUCT MODAL ══════════ */
  var currentProduct = null, currentColor = null, currentSize = null, pmQty = 1;

  function openModal(id) {
    var p = byId(id);
    if (!p) return;
    currentProduct = p;
    currentColor = p.colors[0];
    currentSize = p.sizes.length === 1 ? p.sizes[0] : null;
    pmQty = 1;
    $('#pm-backdrop').hidden = false;
    document.body.classList.add('ov-open');
    var img = $('#pm-img');
    img.src = 'assets/img/' + p.img;
    img.onload = function () { $('#pm-zoom').style.backgroundImage = 'url(' + img.src + ')'; };
    $('#pm-tag').textContent = p.tag || 'HARBWEAR';
    $('#pm-tag').style.display = p.tag ? '' : 'none';
    $('#pm-name').textContent = p.name;
    $('#pm-price').textContent = fmt(p.price);
    $('#pm-desc').textContent = p.desc;
    $('#pm-qval').textContent = '1';
    $('#pm-msg').textContent = '';
    $('#pm-wish').textContent = inWish(p.id) ? '♥ Saved to Wishlist' : '♡ Add to Wishlist';
    renderColors(); renderSizes();
    switchPmView('photo');
  }

  function closeModal() {
    $('#pm-backdrop').hidden = true;
    document.body.classList.remove('ov-open');
    HBViewer3D.dispose();
  }

  function renderColors() {
    var wrap = $('#pm-colors');
    var h = '';
    currentProduct.colors.forEach(function (c) {
      var hex = { Black: '#1a1a1a', White: '#f2f2f2', Gray: '#9a9a9a', Green: '#3a4a3e', Brown: '#5a4632' }[c] || '#888';
      h += '<button class="swatch' + (c === currentColor ? ' on' : '') + '" data-color="' + esc(c) + '" style="background:' + hex + '" title="' + esc(c) + '"></button>';
    });
    wrap.innerHTML = h;
    $$('.swatch', wrap).forEach(function (b) {
      b.addEventListener('click', function () {
        currentColor = b.dataset.color;
        renderColors();
        if (HBViewer3D && !$('#pm-canvas').hidden) HBViewer3D.setProduct(currentProduct.cat, swatchHex(currentColor));
      });
    });
  }

  function swatchHex(c) { return { Black: 0x1a1a1a, White: 0xf2f2f2, Gray: 0x9a9a9a, Green: 0x3a4a3e, Brown: 0x5a4632 }[c] || 0x888888; }

  function renderSizes() {
    var wrap = $('#pm-sizes');
    var h = '';
    currentProduct.sizes.forEach(function (s) {
      h += '<button class="size-btn' + (s === currentSize ? ' on' : '') + '" data-size="' + esc(s) + '">' + esc(s) + '</button>';
    });
    wrap.innerHTML = h;
    $$('.size-btn', wrap).forEach(function (b) {
      b.addEventListener('click', function () { currentSize = b.dataset.size; renderSizes(); });
    });
  }

  function switchPmView(view) {
    var photo = $('#pm-photo'), canvas = $('#pm-canvas');
    $$('.pmtab').forEach(function (t) { t.classList.toggle('active', t.dataset.view === view); });
    if (view === '3d') {
      photo.hidden = true;
      canvas.hidden = false;
      var ok = false;
      if (window.HBViewer3D && window.THREE) {
        ok = HBViewer3D.init(canvas, swatchHex(currentColor));
        if (ok) {
          HBViewer3D.setProduct(currentProduct.cat, swatchHex(currentColor));
          setTimeout(function () { HBViewer3D.resize(); }, 60);
        }
      }
      if (!ok) {
        canvas.hidden = true;
        photo.hidden = false;
        $$('.pmtab').forEach(function (t) { t.classList.toggle('active', t.dataset.view === 'photo'); });
        $('#pm-msg').textContent = '3D preview needs WebGL — showing the photo instead.';
      }
    } else {
      photo.hidden = false;
      canvas.hidden = true;
      HBViewer3D.dispose();
    }
  }

  /* zoom lens */
  function bindZoom() {
    var box = $('#pm-photo'), lens = $('#pm-zoom'), img = $('#pm-img');
    box.addEventListener('mousemove', function (e) {
      var r = box.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      lens.style.opacity = '1';
      lens.style.left = Math.max(0, Math.min(r.width - 150, x * r.width - 75)) + 'px';
      lens.style.top = Math.max(0, Math.min(r.height - 150, y * r.height - 75)) + 'px';
      lens.style.backgroundSize = r.width * 2.4 + 'px auto';
      lens.style.backgroundPosition = (-x * r.width * 1.4 + 75) + 'px ' + (-y * r.height * 1.4 + 75) + 'px';
    });
    box.addEventListener('mouseleave', function () { lens.style.opacity = '0'; });
  }

  /* size guide */
  function openSizeGuide() {
    var p = currentProduct;
    var key = p.cat === 'sneakers' ? 'shoes' : ((p.cat === 'jeans' || p.cat === 'cargo' || p.cat === 'shorts') ? 'bottoms' : (p.sizes.length === 1 ? 'one' : 'tops'));
    var g = SIZE_GUIDE[key] || SIZE_GUIDE.tops;
    var h = '<h3>' + esc(g.title) + '</h3><table>';
    g.rows.forEach(function (row, ri) {
      h += '<tr>' + row.map(function (cell, ci) { return (ri === 0 || ci === 0) ? '<th>' + esc(cell) + '</th>' : '<td>' + esc(cell) + '</td>'; }).join('') + '</tr>';
    });
    h += '</table><p class="sg-note">Measurements in cm. If between sizes, size up for an oversized fit.</p>';
    $('#sg-body').innerHTML = h;
    $('#sg-backdrop').hidden = false;
  }
  function closeSizeGuide() { $('#sg-backdrop').hidden = true; }

  /* ══════════ CHECKOUT ══════════ */
  var coStep = 1;
  var coData = { shipping: null, payment: null, coupon: null, gift: null, otp: null, demoEmail: '' };
  var coCart = [];

  function openCheckout() {
    var c = cart();
    if (!c.length) { alert('Your cart is empty.'); return; }
    coCart = c;
    coStep = 1;
    coData = { shipping: null, payment: null, coupon: null, gift: null, otp: null, demoEmail: '' };
    $('#co-backdrop').hidden = false;
    document.body.classList.add('ov-open');
    renderStep();
  }
  function closeCheckout() {
    $('#co-backdrop').hidden = true;
    document.body.classList.remove('ov-open');
  }

  function totals() {
    var sub = coCart.reduce(function (s, i) { return s + i.qty * i.price; }, 0);
    var discount = 0, gift = 0, shipping = 0;
    if (coData.coupon) {
      if (coData.coupon.type === 'percent') discount = sub * coData.coupon.value / 100;
      else discount = Math.min(coData.coupon.value, sub);
    }
    if (coData.gift) gift = Math.min(200, sub - discount);
    if (coData.shipping === 'express') shipping = 120;
    else if (coData.shipping === 'standard' && sub - discount - gift < 1500) shipping = 60;
    var base = Math.max(0, sub - discount - gift);
    var vat = base * .14;
    var total = base + shipping + vat;
    if (coData.payment === 'cod') total += 30; // COD handling fee
    return { sub: sub, discount: discount, gift: gift, shipping: shipping, vat: vat, total: total };
  }

  function renderStep() {
    var titles = ['Contact & Address', 'Delivery & Payment', 'Verify Email', 'Order Confirmed'];
    $('#co-title').textContent = titles[coStep - 1];
    $('#co-steps').textContent = coStep + ' / 4';
    $('#co-back').hidden = coStep === 1 || coStep === 4;
    $('#co-next').hidden = coStep === 4;
    $('#co-next').textContent = coStep === 1 ? 'Continue to Payment →' : (coStep === 2 ? 'Send OTP →' : 'Verify & Place Order');
    var body = $('#co-body');
    if (coStep === 1) renderStep1(body);
    if (coStep === 2) renderStep2(body);
    if (coStep === 3) renderStep3(body);
    if (coStep === 4) renderStep4(body);
  }

  /* STEP 1 — contact, address, account, referral, social sign-in */
  function renderStep1(body) {
    var p = profile();
    var h = '';
    h += '<div class="co-grid2">';
    h += '<div class="co-col">';
    h += '<h4>Contact</h4>';
    h += '<div class="social-row"><button class="social-btn" id="co-google"><svg viewBox="0 0 24 24" width="16" height="16"><path fill="#4285F4" d="M22.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.4h5.9a5 5 0 0 1-2.2 3.3v2.7h3.5c2-1.9 3.3-4.7 3.3-8.1Z"/><path fill="#34A853" d="M12 23c3 0 5.5-1 7.3-2.6l-3.5-2.7c-1 .7-2.3 1-3.8 1-2.9 0-5.4-2-6.3-4.6H2.1v2.8A11 11 0 0 0 12 23Z"/><path fill="#FBBC05" d="M5.7 14.1a6.6 6.6 0 0 1 0-4.2V7.1H2.1a11 11 0 0 0 0 9.8l3.6-2.8Z"/><path fill="#EA4335" d="M12 5.4c1.6 0 3.1.6 4.2 1.7l3.2-3.2A11 11 0 0 0 2.1 7.1l3.6 2.8C6.6 7.4 9.1 5.4 12 5.4Z"/></svg>Continue with Google</button>';
    h += '<button class="social-btn" id="co-apple"><svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01ZM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25Z"/></svg>Continue with Apple</button>';
    h += '<div class="or-line"><span>or</span></div>';
    h += '<label>Full Name<input id="co-name" value="' + esc(p.name) + '" placeholder="Ahmed Khaled" required></label>';
    h += '<label>Email<input id="co-email" type="email" value="' + esc(p.email) + '" placeholder="you@email.com" required><span class="f-hint">A 6-digit code will be sent here to verify</span></label>';
    h += '<label>Phone<input id="co-phone" type="tel" value="' + esc(p.phone) + '" placeholder="+20 1X XXX XXXX" required></label>';
    h += '</div>';
    h += '<div class="co-col">';
    h += '<h4>Shipping Address</h4>';
    h += '<label>Country<select id="co-country"><option selected>Egypt</option><option>UAE</option><option>Saudi Arabia</option><option>Kuwait</option><option>Qatar</option><option>Other</option></select></label>';
    h += '<label>City<input id="co-city" placeholder="Cairo"></label>';
    h += '<label>Address<input id="co-address" placeholder="Street, building, apartment"></label>';
    h += '<label>Postal Code<input id="co-zip" placeholder="Optional"></label>';
    h += '<label class="check"><input type="checkbox" id="co-create"> Create an account (track orders &amp; earn points)</label>';
    h += '<label id="co-pw-wrap" hidden>Password<input id="co-pw" type="password" placeholder="Min 8 characters"></label>';
    h += '<label>Referral Code (optional)<input id="co-referral" placeholder="HW-XXXXXX — get +500 pts"></label>';
    h += '</div></div>';
    h += '<div class="co-note">' + loyaltyCardHTML(false) + '</div>';
    body.innerHTML = h;

    $('#co-create').addEventListener('change', function () { $('#co-pw-wrap').hidden = !this.checked; });
    $('#co-google').addEventListener('click', function () {
      $('#co-email').value = $('#co-email').value || 'demo.google@gmail.com';
      $('#co-name').value = $('#co-name').value || 'Google User';
      $('#co-email').focus();
      $('#co-msg-zone') || flashCo('Signed in with Google (demo) — we\'ll verify this email with a code.');
    });
    $('#co-apple').addEventListener('click', function () {
      $('#co-email').value = $('#co-email').value || 'demo.apple@icloud.com';
      $('#co-name').value = $('#co-name').value || 'Apple User';
      flashCo('Signed in with Apple (demo) — we\'ll verify this email with a code.');
    });
  }

  function flashCo(msg) {
    var z = $('#co-msg-zone');
    if (!z) return;
    z.textContent = msg;
    setTimeout(function () { z.textContent = ''; }, 4000);
  }

  /* STEP 2 — shipping + payment + coupons + summary */
  function renderStep2(body) {
    var t = totals();
    var h = '';
    h += '<div class="co-grid2">';
    h += '<div class="co-col">';
    h += '<h4>Delivery</h4>';
    h += '<label class="radio-card"><input type="radio" name="ship" value="standard"' + (coData.shipping === 'standard' ? ' checked' : '') + '><div><b>Standard</b><span>5–7 days</span></div><span class="rc-price">' + (t.sub >= 1500 ? 'Free' : 'EGP 60') + '</span></label>';
    h += '<label class="radio-card"><input type="radio" name="ship" value="express"' + (coData.shipping === 'express' ? ' checked' : '') + '><div><b>Express</b><span>1–2 days</span></div><span class="rc-price">EGP 120</span></label>';
    h += '<h4 style="margin-top:1.4rem">Payment</h4>';
    h += '<div class="pay-grid">';
    [['cod', 'Cash on Delivery', '💵'], ['card', 'Card · Visa / MC / Meeza', '💳'], ['paymob', 'Paymob', '🔐'], ['fawry', 'Fawry', '🧾'], ['applepay', 'Apple Pay', ''], ['googlepay', 'Google Pay', ''], ['paypal', 'PayPal', '']].forEach(function (pm) {
      h += '<label class="pay-card"><input type="radio" name="pay" value="' + pm[0] + '"' + (coData.payment === pm[0] ? ' checked' : '') + '><span>' + (pm[2] ? pm[2] + ' ' : '') + pm[1] + '</span></label>';
    });
    h += '</div>';
    h += '<div id="co-pay-fields"></div>';
    h += '<h4 style="margin-top:1.4rem">Coupon &amp; Gift Card</h4>';
    h += '<div class="code-row"><input id="co-coupon" placeholder="Coupon — try HARB10 / WELCOME50" ' + (coData.coupon ? 'disabled value="' + esc(coData.coupon.label) + '"' : '') + '><button class="btn btn-ghost sm" id="co-coupon-btn">' + (coData.coupon ? '✓ Applied' : 'Apply') + '</button></div>';
    h += '<div class="code-row"><input id="co-gift" placeholder="Gift card — HW-XXXX-XXXX" ' + (coData.gift ? 'disabled value="EGP 200 demo card"' : '') + '><button class="btn btn-ghost sm" id="co-gift-btn">' + (coData.gift ? '✓ Applied' : 'Apply') + '</button></div>';
    h += '<p class="f-hint">Demo: any well-formed gift card code (HW-####-####) carries a demo balance of EGP 200.</p>';
    h += '</div>';
    h += '<div class="co-col">';
    h += '<h4>Order Summary</h4><div class="co-summary">';
    coCart.forEach(function (i) {
      h += '<div class="cs-row"><span>' + esc(i.name) + (i.size && i.size !== 'One Size' ? ' · ' + esc(i.size) : '') + ' ×' + i.qty + '</span><span>' + fmt(i.qty * i.price) + '</span></div>';
    });
    h += '<div class="cs-line"><span>Subtotal</span><span>' + fmt(t.sub) + '</span></div>';
    if (t.discount) h += '<div class="cs-line good"><span>Coupon (' + esc(coData.coupon.label) + ')</span><span>−' + fmt(t.discount) + '</span></div>';
    if (t.gift) h += '<div class="cs-line good"><span>Gift Card</span><span>−' + fmt(t.gift) + '</span></div>';
    h += '<div class="cs-line"><span>Shipping</span><span>' + (t.shipping ? fmt(t.shipping) : 'Free') + '</span></div>';
    if (coData.payment === 'cod') h += '<div class="cs-line"><span>COD fee</span><span>' + fmt(30) + '</span></div>';
    h += '<div class="cs-line"><span>VAT (14%)</span><span>' + fmt(t.vat) + '</span></div>';
    h += '<div class="cs-total"><span>Total</span><span>' + fmt(t.total) + '</span></div>';
    h += '</div><p class="co-pts-note">You\'ll earn ~<b>' + estPoints(t.total) + ' pts</b> on this order (' + tierFor(profile().points).name + ' tier)</p>';
    h += '</div></div>';
    body.innerHTML = h;

    $$('input[name="ship"]').forEach(function (r) {
      r.addEventListener('change', function () { coData.shipping = r.value; renderStep2(body); });
    });
    $$('input[name="pay"]').forEach(function (r) {
      r.addEventListener('change', function () { coData.payment = r.value; renderStep2(body); });
    });
    renderPayFields();
    $('#co-coupon-btn').addEventListener('click', function () {
      var code = $('#co-coupon').value.trim().toUpperCase();
      if (COUPONS[code]) { coData.coupon = COUPONS[code]; coData.coupon.code = code; renderStep2(body); }
      else { alert('Unknown coupon "' + code + '". Try HARB10, WELCOME50 or DROP100.'); }
    });
    $('#co-gift-btn').addEventListener('click', function () {
      var code = $('#co-gift').value.trim().toUpperCase();
      if (/^HW-\d{4}-\d{4}$/.test(code)) { coData.gift = { code: code, balance: 200 }; renderStep2(body); }
      else { alert('Gift card format: HW-1234-5678 (demo balance EGP 200).'); }
    });
  }

  function estPoints(total) {
    var mult = tierFor(profile().points).mult;
    return Math.floor(total / 10) * mult;
  }

  function renderPayFields() {
    var wrap = $('#co-pay-fields');
    if (!wrap) return;
    var h = '';
    if (coData.payment === 'card' || coData.payment === 'paymob') {
      h = '<div class="card-fields">' +
        '<label>Card Number<input id="co-cardnum" inputmode="numeric" maxlength="19" placeholder="1234 5678 9012 3456"></label>' +
        '<div class="co-grid2"><label>Expiry<input id="co-cardexp" placeholder="MM / YY" maxlength="7"></label>' +
        '<label>CVV<input id="co-cardcvv" type="password" maxlength="4" placeholder="•••"></label></div>' +
        '<p class="f-hint">' + (coData.payment === 'paymob' ? 'Secured by Paymob. Demo — no real charge.' : 'Demo — no real charge is made.') + '</p></div>';
    }
    if (coData.payment === 'fawry') {
      var code = 'FAWRY-' + rnd(900000) + 100000;
      h = '<div class="fawry-box"><b>Pay via Fawry</b><p>Use this code at any Fawry machine or the Fawry app:</p><div class="fawry-code">' + code + '</div><p class="f-hint">Demo code — press "I\'ve Paid" after completing it outside the demo.</p><button class="btn btn-ghost sm" id="co-fawry-paid">I\'ve Paid ✓</button></div>';
    }
    wrap.innerHTML = h;
    if (coData.payment === 'fawry') {
      var btn = $('#co-fawry-paid');
      if (btn) btn.addEventListener('click', function () { flashCo('Fawry payment confirmed (demo).'); });
    }
  }

  /* STEP 3 — OTP */
  function renderStep3(body) {
    var email = $('#co-email') ? $('#co-email').value.trim() : profile().email;
    if (!emailOk(email)) email = 'demo@harbwear.com';
    coData.demoEmail = email;
    coData.otp = String(rnd(900000) + 100000);
    var h = '';
    h += '<div class="otp-wrap">';
    h += '<div class="otp-icon">✉️</div>';
    h += '<h4>Verify your email</h4>';
    h += '<p>We sent a 6-digit code to <b>' + esc(email) + '</b>. Enter it below to confirm your order.</p>';
    h += '<div class="otp-inputs" id="otp-inputs">';
    for (var i = 0; i < 6; i++) h += '<input class="otp-digit" maxlength="1" inputmode="numeric" data-i="' + i + '">';
    h += '</div>';
    h += '<p class="f-hint" id="otp-err"></p>';
    h += '<button class="btn btn-ghost sm" id="otp-resend">Resend Code</button>';
    h += '<div class="demo-inbox"><b>📩 Demo inbox</b><p>In a real deployment this email is sent to <b>' + esc(email) + '</b>:</p><div class="demo-mail"><span>From: no-reply@harbwear.com</span><span>Subject: Your HARBWEAR verification code</span><p>Your verification code is <b class="demo-code">' + coData.otp + '</b>. It expires in 10 minutes.</p></div><p class="f-hint">Front-end demo — the code is shown here instead of a real email server.</p></div>';
    h += '</div>';
    body.innerHTML = h;

    var digits = $$('.otp-digit');
    digits.forEach(function (d, idx) {
      d.addEventListener('input', function () {
        d.value = d.value.replace(/\D/g, '');
        if (d.value && idx < 5) digits[idx + 1].focus();
      });
      d.addEventListener('keydown', function (e) {
        if (e.key === 'Backspace' && !d.value && idx > 0) digits[idx - 1].focus();
      });
    });
    setTimeout(function () { if (digits[0]) digits[0].focus(); }, 80);
    $('#otp-resend').addEventListener('click', function () {
      coData.otp = String(rnd(900000) + 100000);
      var code = $('.demo-code');
      if (code) code.textContent = coData.otp;
      var err = $('#otp-err');
      if (err) { err.textContent = 'New code sent (demo).'; err.style.color = 'var(--light)'; }
    });
    setTimeout(function () {
      var check = function () {
        var val = digits.map(function (d) { return d.value; }).join('');
        if (val.length === 6) {
          if (val === coData.otp) { coStep = 4; renderStep(); }
          else { var err = $('#otp-err'); if (err) { err.textContent = 'Incorrect code — check the demo inbox.'; err.style.color = '#e08a8a'; } digits.forEach(function (d) { d.value = ''; }); if (digits[0]) digits[0].focus(); }
        }
      };
      digits.forEach(function (d) { d.addEventListener('input', check); d.addEventListener('paste', function () { setTimeout(check, 10); }); });
    }, 100);
  }

  /* STEP 4 — success */
  function renderStep4(body) {
    var t = totals();
    var p = profile();
    var pts = estPoints(t.total);
    var orderNo = 'HW-' + (2040 + rnd(900));
    var referred = $('#co-referral') && $('#co-referral').value.trim() ? $('#co-referral').value.trim().toUpperCase() : '';
    if (referred && !p.referredBy && referred !== p.referralCode) {
      p.referredBy = referred;
      p.points += 500;
    }
    p.points += pts;
    p.spent += t.total;
    p.name = p.name || (($('#co-name') || {}).value || '');
    p.email = coData.demoEmail;
    p.phone = p.phone || (($('#co-phone') || {}).value || '');
    p.orders.push({ no: orderNo, date: new Date().toISOString(), total: t.total, items: coCart.map(function (i) { return i.name + ' ×' + i.qty; }) });
    save(LS.prof, p);
    save(LS.cart, []);
    renderAll();

    var h = '';
    h += '<div class="done-wrap">';
    h += '<div class="done-check">✓</div>';
    h += '<h3>Order Confirmed</h3>';
    h += '<p class="done-no">Order <b>' + orderNo + '</b> · ' + new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) + '</p>';
    h += '<div class="done-sum">';
    coCart.forEach(function (i) { h += '<div class="cs-row"><span>' + esc(i.name) + (i.size && i.size !== 'One Size' ? ' · ' + esc(i.size) : '') + ' ×' + i.qty + '</span><span>' + fmt(i.qty * i.price) + '</span></div>'; });
    h += '<div class="cs-total"><span>Paid</span><span>' + fmt(t.total) + '</span></div>';
    h += '</div>';
    h += '<div class="done-loyalty"><span>🎁 You earned <b>+' + pts + ' pts</b>' + (referred && p.referredBy ? ' + <b>+500 pts</b> referral bonus' : '') + '</span>' + loyaltyCardHTML(true) + '</div>';
    h += '<p class="done-note">' + (coData.payment === 'cod' ? 'You\'ll pay ' + fmt(t.total) + ' in cash when your order arrives.' : 'Payment ' + (coData.payment === 'fawry' ? 'via Fawry' : 'confirmed') + ' (demo).') + '</p>';
    h += '</div>';
    body.innerHTML = h;
    $('#co-next').hidden = true;
    $('#co-back').hidden = true;
  }

  /* ══════════ RENDER ALL / BIND ══════════ */
  function renderAll() {
    var b = $('#nav-cart-count'); if (b) b.textContent = cartCount();
    var w = $('#nav-wish-count'); if (w) w.textContent = wish().length;
    if ($('#cart-drawer').classList.contains('open')) renderDrawer();
  }

  function smoothTo(target, offset) {
    if (window.lenis) window.lenis.scrollTo(target, { offset: offset || -60, duration: 1.2 });
    else {
      var el = typeof target === 'string' ? $(target) : target;
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  }

  /* ══════════ BOOT ══════════ */
  function boot() {
    if (!PRODUCTS.length) return;
    renderCatChips();
    renderGrid();

    /* collection cards → filter grid */
    var COLS = { essentials: 'Essentials', oversized: 'Oversized', premium: 'Premium', streetwear: 'Streetwear', black: 'Black Collection', white: 'White Collection', limited: 'Limited Edition', 'new-arrival': 'New Arrival' };
    $$('.col-card[data-collection]').forEach(function (card) {
      card.addEventListener('click', function (e) {
        e.preventDefault();
        var col = card.dataset.collection;
        activeCol = col;
        activeCat = 'all';
        $$('.cat-fchip').forEach(function (b) { b.classList.toggle('active', b.dataset.cat === 'all'); });
        var chip = $('#filter-chip');
        if (chip) { chip.hidden = false; $('#filter-name').textContent = COLS[col] || col; }
        var t = $('#prods-title');
        if (t) t.innerHTML = (COLS[col] || 'New') + '<br><em>Arrivals</em>';
        renderGrid();
        smoothTo('#products', -40);
      });
    });
    var clearBtn = $('#filter-clear');
    if (clearBtn) clearBtn.addEventListener('click', function () {
      activeCol = null; activeCat = 'all';
      $('#filter-chip').hidden = true;
      var t = $('#prods-title'); if (t) t.innerHTML = 'New<br><em>Arrivals</em>';
      $$('.cat-fchip').forEach(function (b) { b.classList.toggle('active', b.dataset.cat === 'all'); });
      renderGrid();
    });

    /* landing category chips → filter */
    $$('.cat-chip').forEach(function (chip) {
      chip.addEventListener('click', function (e) {
        e.preventDefault();
        var map = { 'T-Shirts': 't-shirts', 'Hoodies': 'hoodies', 'Pants': 'pants', 'Sneakers': 'sneakers', 'Caps': 'caps', 'Accessories': 'accessories' };
        var c = map[chip.querySelector('.chip-name').textContent.trim().split(' ')[0]];
        activeCat = c || 'all';
        activeCol = null;
        $$('.cat-fchip').forEach(function (b) { b.classList.toggle('active', b.dataset.cat === activeCat); });
        $('#filter-chip').hidden = true;
        renderGrid();
        smoothTo('#products', -40);
      });
    });

    /* nav buttons */
    var nc = $('#nav-cart'); if (nc) nc.addEventListener('click', function () { renderDrawer(); openDrawer(); });
    var nw = $('#nav-wish'); if (nw) nw.addEventListener('click', function () {
      $('.dtab[data-tab="wish"]').classList.add('active');
      $('.dtab[data-tab="cart"]').classList.remove('active');
      renderWishTab(); openDrawer();
    });
    var ns = $('#nav-search'); if (ns) ns.addEventListener('click', openSearch);

    /* drawer */
    $('#drawer-close').addEventListener('click', closeDrawer);
    $('#drawer-backdrop').addEventListener('click', closeDrawer);
    $$('.dtab').forEach(function (t) {
      t.addEventListener('click', function () {
        $$('.dtab').forEach(function (x) { x.classList.toggle('active', x === t); });
        renderDrawer();
      });
    });

    /* search */
    $('#search-close').addEventListener('click', closeSearch);
    $('#search-input').addEventListener('input', function () { runSearch(this.value); });
    $('#search-input').addEventListener('keydown', function (e) { if (e.key === 'Enter') { var f = $('#search-results [data-open]'); if (f) f.click(); } });

    /* product modal */
    $('#pm-close').addEventListener('click', closeModal);
    $('#pm-backdrop').addEventListener('click', function (e) { if (e.target === this) closeModal(); });
    $('#pm-add').addEventListener('click', function () {
      if (!currentProduct) return;
      if (!currentSize) { $('#pm-msg').textContent = 'Please select a size.'; return; }
      addToCart(currentProduct, currentSize, currentColor, pmQty);
      $('#pm-msg').textContent = 'Added to cart ✓';
      $('#pm-msg').style.color = 'var(--light)';
      setTimeout(function () { $('#pm-msg').textContent = ''; }, 1600);
    });
    $('#pm-wish').addEventListener('click', function () { toggleWish(currentProduct.id); this.textContent = inWish(currentProduct.id) ? '♥ Saved to Wishlist' : '♡ Add to Wishlist'; });
    $('#pm-qminus').addEventListener('click', function () { pmQty = Math.max(1, pmQty - 1); $('#pm-qval').textContent = pmQty; });
    $('#pm-qplus').addEventListener('click', function () { pmQty = Math.min(10, pmQty + 1); $('#pm-qval').textContent = pmQty; });
    $('#pm-sizeguide').addEventListener('click', openSizeGuide);
    $$('.pmtab').forEach(function (t) { t.addEventListener('click', function () { switchPmView(t.dataset.view); }); });
    bindZoom();

    /* size guide */
    $('#sg-close').addEventListener('click', closeSizeGuide);
    $('#sg-backdrop').addEventListener('click', function (e) { if (e.target === this) closeSizeGuide(); });

    /* checkout */
    $('#co-close').addEventListener('click', closeCheckout);
    $('#co-backdrop').addEventListener('click', function (e) { if (e.target === this) closeCheckout(); });
    $('#co-back').addEventListener('click', function () { if (coStep > 1 && coStep < 4) { coStep--; renderStep(); } });
    $('#co-next').addEventListener('click', function () {
      if (coStep === 1) {
        var name = $('#co-name').value.trim(), email = $('#co-email').value.trim(), phone = $('#co-phone').value.trim();
        var city = $('#co-city').value.trim(), addr = $('#co-address').value.trim();
        if (!name) { alert('Please enter your name.'); return; }
        if (!emailOk(email)) { alert('Please enter a valid email.'); return; }
        if (!phone) { alert('Please enter your phone number.'); return; }
        if (!city || !addr) { alert('Please enter your full shipping address.'); return; }
        var p = profile();
        p.name = name; p.email = email; p.phone = phone;
        if ($('#co-create').checked) {
          var pw = $('#co-pw').value;
          if (pw.length < 8) { alert('Password must be at least 8 characters.'); return; }
          p.password = pw;
        }
        save(LS.prof, p);
        coStep = 2; renderStep();
      } else if (coStep === 2) {
        var ship = $('input[name="ship"]:checked');
        var pay = $('input[name="pay"]:checked');
        if (!ship) { alert('Please choose a delivery method.'); return; }
        if (!pay) { alert('Please choose a payment method.'); return; }
        coData.shipping = ship.value;
        coData.payment = pay.value;
        if (pay.value === 'card' || pay.value === 'paymob') {
          var num = ($('#co-cardnum').value || '').replace(/\s/g, '');
          var exp = $('#co-cardexp').value.trim();
          var cvv = $('#co-cardcvv').value.trim();
          if (!/^\d{16}$/.test(num)) { alert('Card number must be 16 digits.'); return; }
          if (!/^\d{2}\s?\/\s?\d{2}$/.test(exp)) { alert('Expiry must be MM/YY.'); return; }
          if (!/^\d{3,4}$/.test(cvv)) { alert('Enter the CVV (3–4 digits).'); return; }
        }
        if (pay.value === 'applepay' || pay.value === 'googlepay' || pay.value === 'paypal') {
          flashCo('Redirecting to ' + pay.value + ' (demo)…');
          setTimeout(function () { coStep = 3; renderStep(); }, 1200);
          return;
        }
        coStep = 3; renderStep();
      } else if (coStep === 3) {
        /* OTP auto-verifies on 6 digits; button acts as fallback check */
        var val = $$('.otp-digit').map(function (d) { return d.value; }).join('');
        if (val.length !== 6) { var err = $('#otp-err'); if (err) { err.textContent = 'Enter the 6-digit code.'; err.style.color = '#e08a8a'; } return; }
        if (val === coData.otp) { coStep = 4; renderStep(); }
        else { var err2 = $('#otp-err'); if (err2) { err2.textContent = 'Incorrect code — check the demo inbox.'; err2.style.color = '#e08a8a'; } }
      }
    });

    renderAll();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
