/* ═══════════════════════════════════════════════════════════
   HARBWEAR™ — landing experience engine
   Preloader · Lenis smooth scroll · GSAP scroll magic
   (store features: cart/wishlist/search/checkout live in store.js)
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  var hasGsap = typeof window.gsap !== 'undefined';
  var hasST = hasGsap && typeof window.ScrollTrigger !== 'undefined';
  var hasLenis = typeof window.Lenis !== 'undefined';

  var body = document.body;
  var pendingAnchor = null;

  /* ── Fail-safe: no vendor libs → just show the page ── */
  if (!hasGsap) {
    var pl = $('#preloader');
    if (pl) pl.style.display = 'none';
    body.classList.remove('lock');
    return;
  }
  if (hasST) gsap.registerPlugin(ScrollTrigger);

  var lenis = null;
  if (hasLenis) {
    lenis = new Lenis({ duration: 1.15, easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); } });
    if (hasST) lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);
    window.lenis = lenis;
  }

  function smoothTo(target, offset) {
    if (!lenis) {
      var el = typeof target === 'string' ? $(target) : target;
      if (el) el.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    lenis.scrollTo(target, { offset: offset || -70, duration: 1.4 });
  }

  /* ══════════ PRELOADER ══════════ */
  var preloader = $('#preloader');
  var numEl = $('#pre-num');
  var fillEl = $('#pre-fill');
  var ruleEl = $('.pre-logo-rule');

  function runPreloader() {
    body.classList.add('lock');
    if (lenis) lenis.stop();

    var firstVisit = !sessionStorage.getItem('hb_seen');
    sessionStorage.setItem('hb_seen', '1');
    var duration = firstVisit ? 2100 : 750;

    var fontsReady = (document.fonts && document.fonts.ready) || Promise.resolve();
    var counter = { v: 0 };

    gsap.to(counter, {
      v: 100, duration: duration / 1000, ease: 'power2.inOut',
      onUpdate: function () {
        var n = Math.round(counter.v);
        if (numEl) numEl.textContent = n;
        if (fillEl) fillEl.style.width = n + '%';
        if (ruleEl) ruleEl.style.width = (n / 100 * 64) + 'px';
      },
      onComplete: function () {
        fontsReady.then(exitPreloader);
      }
    });
  }

  function exitPreloader() {
    var tl = gsap.timeline();
    tl.to('.pre-logo', { y: -70, opacity: 0, duration: .55, ease: 'power3.in' })
      .to('.pre-word', { y: -70, opacity: 0, duration: .55, ease: 'power3.in' }, '-=.42')
      .to('.pre-count, .pre-tag, .pre-bar', { opacity: 0, duration: .35 }, '-=.5')
      .to(preloader, { yPercent: -100, duration: .9, ease: 'power4.inOut' })
      .set(preloader, { display: 'none' })
      .add(function () {
        body.classList.remove('lock');
        if (lenis) lenis.start();
        if (pendingAnchor) {
          smoothTo(pendingAnchor, 0);
          pendingAnchor = null;
        }
      }, '-=.15')
      .add(heroIntro, '-=.55');
  }

  /* ══════════ HERO INTRO ══════════ */
  function heroIntro() {
    var tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
    tl.from('.hero-bg', { opacity: 0, duration: 1.4, ease: 'power2.out' })
      .from('.hero-kicker', { y: 26, opacity: 0, duration: .8 }, '-=1.0')
      .from('.hero-title .line-inner', { yPercent: 112, duration: 1.15, stagger: .1 }, '-=.85')
      .from('.hero-sub', { y: 24, opacity: 0, duration: .8 }, '-=.7')
      .from('.hero-cta .btn', { y: 24, opacity: 0, duration: .7, stagger: .12 }, '-=.65')
      .from('.hero-side', { opacity: 0, duration: 1 }, '-=.5')
      .from('.hero-card', {
        opacity: 0, scale: .82, duration: 1.1, stagger: .16, ease: 'back.out(1.35)'
      }, '-=1.1');
  }

  /* ══════════ SCROLL FX ══════════ */
  function scrollFX() {
    if (!hasST) return;

    /* hero parallax */
    gsap.to('.hero-bg', {
      yPercent: 14, ease: 'none',
      scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true }
    });
    gsap.to('.hero-content', {
      yPercent: -12, opacity: .25, ease: 'none',
      scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true }
    });
    gsap.to('.card-sneaker', {
      yPercent: -26, ease: 'none',
      scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true }
    });
    gsap.to('.card-hoodie', {
      yPercent: -40, ease: 'none',
      scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true }
    });

    /* collections reveal */
    gsap.from('.col-card', {
      y: 90, opacity: 0, duration: 1.15, ease: 'power3.out', stagger: .09,
      scrollTrigger: { trigger: '.col-grid', start: 'top 84%' }
    });

    /* parallax inside collection cards */
    $$('.col-card').forEach(function (card) {
      var img = $('.cc-img img', card);
      if (!img) return;
      gsap.fromTo(img, { yPercent: -9 }, {
        yPercent: 9, ease: 'none',
        scrollTrigger: { trigger: card, start: 'top bottom', end: 'bottom top', scrub: true }
      });
    });

    /* categories: pinned horizontal scroll (desktop) */
    var mm = gsap.matchMedia();
    mm.add('(min-width: 993px)', function () {
      var strip = $('.cat-strip');
      var intro = $('.cat-intro');
      if (!strip) return;
      var dist = function () {
        return Math.max(0, strip.scrollWidth - (window.innerWidth - intro.offsetWidth) + 90);
      };
      gsap.to(strip, {
        x: function () { return -dist(); }, ease: 'none',
        scrollTrigger: {
          trigger: '#categories', start: 'top top', end: function () { return '+=' + dist(); },
          pin: true, scrub: 1, anticipatePin: 1, invalidateOnRefresh: true
        }
      });
    });

    /* story */
    gsap.from('.story-media, .story-body', {
      y: 80, opacity: 0, duration: 1.15, ease: 'power3.out', stagger: .15,
      scrollTrigger: { trigger: '#story', start: 'top 78%' }
    });
    gsap.fromTo('.story-img img', { yPercent: -7 }, {
      yPercent: 7, ease: 'none',
      scrollTrigger: { trigger: '.story-media', start: 'top bottom', end: 'bottom top', scrub: true }
    });

    /* stat counters */
    $$('.stat-num').forEach(function (el) {
      var target = parseInt(el.dataset.count, 10) || 0;
      var obj = { v: 0 };
      gsap.to(obj, {
        v: target, duration: 1.9, ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        onUpdate: function () { el.textContent = Math.round(obj.v); }
      });
    });

    /* newsletter + footer reveal */
    gsap.from('#newsletter > *', {
      y: 50, opacity: 0, duration: .9, stagger: .08, ease: 'power3.out',
      scrollTrigger: { trigger: '#newsletter', start: 'top 80%' }
    });
    gsap.from('.foot-top > *, .foot-pay, .foot-bottom', {
      y: 40, opacity: 0, duration: .9, stagger: .07, ease: 'power3.out',
      scrollTrigger: { trigger: '#footer', start: 'top 88%' }
    });
  }

  /* ══════════ NAV ══════════ */
  function navFX() {
    var nav = $('#nav');
    function onScroll() {
      if (!nav) return;
      nav.classList.toggle('scrolled', (lenis ? lenis.scroll : window.scrollY) > 40);
    }
    if (lenis) lenis.on('scroll', onScroll); else window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ══════════ SMOOTH ANCHORS ══════════ */
  function anchors() {
    $$('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var id = a.getAttribute('href');
        if (!id || id === '#') return;
        var target = $(id);
        if (!target) return;
        e.preventDefault();
        if (body.classList.contains('lock')) { pendingAnchor = target; return; }
        smoothTo(target, 0);
      });
    });
  }

  /* ══════════ CURSOR ══════════ */
  function cursorFX() {
    var dot = $('#cursor-dot');
    var ring = $('#cursor-ring');
    if (!dot || !ring || window.matchMedia('(pointer: coarse)').matches) return;

    gsap.set([dot, ring], { xPercent: -50, yPercent: -50 });
    var dx = gsap.quickTo(dot, 'x', .16), dy = gsap.quickTo(dot, 'y', .16);
    var rx = gsap.quickTo(ring, 'x', .42), ry = gsap.quickTo(ring, 'y', .42);

    window.addEventListener('mousemove', function (e) {
      dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY);
    }, { passive: true });

    $$('a, button, [data-hover], input').forEach(function (el) {
      el.addEventListener('mouseenter', function () { ring.classList.add('is-hover'); });
      el.addEventListener('mouseleave', function () { ring.classList.remove('is-hover'); });
    });
    window.addEventListener('mousedown', function () { gsap.to(dot, { scale: 2.2, duration: .2 }); });
    window.addEventListener('mouseup', function () { gsap.to(dot, { scale: 1, duration: .3 }); });
  }

  /* ══════════ TILT (hero cards) ══════════ */
  function tiltFX() {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    $$('[data-tilt]').forEach(function (card) {
      var target = $('.hc-img', card) || card;
      var rx = gsap.quickTo(target, 'rotationX', .5);
      var ry = gsap.quickTo(target, 'rotationY', .5);
      card.addEventListener('mousemove', function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - .5;
        var py = (e.clientY - r.top) / r.height - .5;
        ry(px * 9); rx(-py * 9);
      });
      card.addEventListener('mouseleave', function () { rx(0); ry(0); });
    });
  }

  /* ══════════ NEWSLETTER ══════════ */
  function newsletter() {
    var form = $('#nl-form');
    var email = $('#nl-email');
    var note = $('#nl-note');
    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var v = email.value.trim();
      var ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
      if (!ok) {
        note.textContent = 'Please enter a valid email address.';
        email.focus();
        return;
      }
      var stored = localStorage.getItem('harbwear_club');
      if (stored === v) {
        note.textContent = 'Already in the club — see you at the drop ✦';
      } else {
        localStorage.setItem('harbwear_club', v);
        note.textContent = 'You\u2019re on the list — first drop news coming soon ✦';
      }
      form.reset();
    });
  }

  /* ══════════ BOOT ══════════ */
  function boot() {
    runPreloader();
    scrollFX();
    navFX();
    anchors();
    cursorFX();
    tiltFX();
    newsletter();

    if (hasST) {
      window.addEventListener('load', function () { ScrollTrigger.refresh(); });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
