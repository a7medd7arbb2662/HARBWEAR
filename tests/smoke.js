/* HARBWEAR smoke test — no deps, run with: node tests/smoke.js */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
let fails = 0;

function check(name, ok, extra) {
  if (ok) {
    console.log('  ✓ ' + name);
  } else {
    fails++;
    console.log('  ✗ ' + name + (extra ? ' — ' + extra : ''));
  }
}

console.log('HARBWEAR smoke test\n');

// 1. HTML structure
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
check('index.html exists', !!html);
['preloader', 'hero', 'collections', 'categories', 'story', 'newsletter', 'footer'].forEach(id => {
  check('section #' + id, html.includes('id="' + id + '"'));
});
check('preloader counter', html.includes('id="pre-num"'));
check('3 title lines', (html.match(/class="line[" ]/g) || []).length === 3);
check('8 collection tiles', (html.match(/class="col-card/g) || []).length === 8);
check('8 collection filters', (html.match(/data-collection=/g) || []).length === 8);
check('HW monogram in header', html.includes('logo-mark'));
check('logo wordmark + TM', html.includes('HARBWEAR<sup>™</sup>'));
check('brand values marquee', html.includes('Quality Over Everything') && html.includes('Made For You'));
check('hero copy (plan)', html.includes('Minimal. Functional. Timeless.'));
check('footer columns', ['Shop', 'Company', 'Help', 'Legal'].every(c => html.includes('<h4>' + c + '</h4>')));
check('footer MADE FOR YOU', html.includes('MADE FOR YOU.'));
check('nav ids', ['nav-cart', 'nav-wish', 'nav-search', 'nav-cart-count'].every(i => html.includes('id="' + i + '"')));
check('cart drawer', html.includes('id="cart-drawer"') && html.includes('id="drawer-foot"') && html.includes('id="drawer-body"'));
check('search overlay', html.includes('id="search-overlay"') && html.includes('id="search-input"'));
check('product modal', html.includes('id="pm-backdrop"') && html.includes('id="pm-canvas"') && html.includes('id="pm-sizeguide"'));
check('size guide modal', html.includes('id="sg-backdrop"'));
check('checkout overlay', html.includes('id="co-backdrop"') && html.includes('id="co-next"') && html.includes('id="co-steps"'));
check('store scripts', ['three.min.js', 'OrbitControls.js', 'viewer3d.js', 'products.js', 'store.js'].every(f => html.includes(f)));
check('no external CDN scripts', !/https?:\/\/(cdnjs|cdn\.jsdelivr|unpkg|fonts\.googleapis|fonts\.gstatic)/.test(html));

// 2. CSS — monochrome + store components
const css = fs.readFileSync(path.join(ROOT, 'css/style.css'), 'utf8');
const storeCss = fs.readFileSync(path.join(ROOT, 'css/store.css'), 'utf8');
check('style.css exists', !!css);
check('store.css exists', !!storeCss);
['--gold', '#c9a227', '#e8c968', 'gold'].forEach(bad => {
  check('no gold in style.css: ' + bad, !css.includes(bad));
});
check('css has Made Tommy', css.includes('Made Tommy'));
check('css reduced-motion', css.includes('prefers-reduced-motion'));
['drawer', 'search-overlay', 'product-modal', 'checkout', 'otp-digit', 'loyalty-card', 'cat-fchip', 'size-btn', 'pm-zoom'].forEach(sel => {
  check('store.css has ' + sel, storeCss.includes(sel));
});

// 3. Product catalog
const prods = fs.readFileSync(path.join(ROOT, 'js/products.js'), 'utf8');
check('products.js exists', !!prods);
const productCount = (prods.match(/id: '/g) || []).length;
check('24 products in catalog', productCount === 24, productCount + ' found');
check('categories covered', ['t-shirts', 'hoodies', 'sweatshirts', 'jeans', 'shorts', 'sneakers', 'caps', 'bags', 'socks', 'cargo'].every(c => prods.includes("'" + c + "'")));
check('sizes in catalog', prods.includes('sizes: [\'S\', \'M\', \'L\', \'XL\', \'XXL\']'));
check('colors in catalog', prods.includes('colors: [\'Black\''));
check('size guide present', prods.includes('HB_SIZE_GUIDE') && prods.includes('Size Guide (cm)'));
check('coupons present', prods.includes('HARB10') && prods.includes('WELCOME50') && prods.includes('DROP100'));
check('loyalty tiers present', ['Bronze', 'Silver', 'Gold', 'Elite'].every(t => prods.includes(t)));
check('EGP prices in catalog', (prods.match(/price: \d+/g) || []).length === 24);

// 4. Store engine
const store = fs.readFileSync(path.join(ROOT, 'js/store.js'), 'utf8');
check('store.js exists', !!store);
['function renderGrid', 'function renderDrawer', 'function openCheckout', 'function renderStep', 'function renderStep1', 'function renderStep2', 'function renderStep3', 'function renderStep4', 'function openModal', 'function runSearch', 'function toggleWish', 'function addToCart', 'function loyaltyCardHTML'].forEach(fn => {
  check('store.js has ' + fn, store.includes(fn));
});
check('OTP flow', store.includes('coData.otp') && store.includes('demo-inbox') && store.includes('Resend Code'));
check('social sign-in', store.includes('co-google') && store.includes('co-apple'));
check('gift card validation', store.includes('HW-\\d{4}-\\d{4}'));
check('referral', store.includes('referral') && store.includes('+500'));

// 5. 3D viewer
const v3d = fs.readFileSync(path.join(ROOT, 'js/viewer3d.js'), 'utf8');
check('viewer3d.js exists', !!v3d);
['buildTee', 'buildSneaker', 'buildCap', 'buildBag', 'buildPants', 'OrbitControls', 'autoRotate'].forEach(fn => {
  check('viewer3d has ' + fn, v3d.includes(fn));
});
const three = fs.readFileSync(path.join(ROOT, 'js/vendor/three.min.js'), 'utf8');
check('three.min.js vendored', three.length > 100000, three.length + 'B');

// 6. Fonts
const fontsCss = fs.readFileSync(path.join(ROOT, 'assets/fonts/fonts.css'), 'utf8');
const woff2 = fs.readdirSync(path.join(ROOT, 'assets/fonts')).filter(f => f.endsWith('.woff2'));
check('6 woff2 files', woff2.length === 6, woff2.length + ' found');
check('font Made Tommy', fontsCss.includes('Made Tommy'));
check('font Inter', fontsCss.includes('Inter'));

// 7. Images
const imgDir = path.join(ROOT, 'assets/img');
const imgs = fs.readdirSync(imgDir).filter(f => f.endsWith('.jpg'));
check('31 images present', imgs.length === 31, imgs.length + ' found');
let small = [];
imgs.forEach(f => {
  const size = fs.statSync(path.join(imgDir, f)).size;
  if (size < 15000) small.push(f + ' (' + size + 'B)');
});
check('all images ≥ 15KB', small.length === 0, small.join(', '));

// 8. JS syntax via node --check
['js/main.js', 'js/store.js', 'js/products.js', 'js/viewer3d.js', 'tests/smoke.js'].forEach(f => {
  const p = path.join(ROOT, f);
  try {
    new Function(fs.readFileSync(p, 'utf8'));
    check('syntax ok: ' + f, true);
  } catch (e) {
    check('syntax ok: ' + f, false, e.message.split('\n')[0]);
  }
});

console.log('\n' + (fails ? '✗ ' + fails + ' check(s) failed' : '✓ All checks passed'));
process.exit(fails ? 1 : 0);
