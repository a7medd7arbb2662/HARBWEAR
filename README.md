# HARBWEAR™

**Crafted for Everyday Style.**

Minimal · Functional · Timeless — premium everyday streetwear, designed in Cairo.

## Run it

```bash
npm start
```

Then open **http://localhost:8081**

## Stack

- Vanilla HTML / CSS / JS — **no build step, no frameworks to install**
- GSAP + ScrollTrigger + Lenis (vendored in `js/vendor/`, works offline)
- Self-hosted fonts: **Made Tommy** (display — MadeType) + **Inter** (body — Google Fonts, OFL)
- Real photography (Pexels) in `assets/img/`, color-audited: no yellow / off-brand hues

## Brand system (per branding plan)

| Role | Token | Hex |
|---|---|---|
| Deep Black (base bg) | `--black` | `#0D0D0D` |
| Charcoal (surfaces) | `--black-2` | `#1A1A1A` |
| Dark Gray (borders) | `--black-3` | `#2B2B2B` |
| Concrete | `--concrete` | `#525252` |
| Smoke (muted text) | `--smoke` | `#7A7A7A` |
| Steel Gray | `--steel` | `#A7A7A7` |
| Ash | `--ash` | `#BDBDBD` |
| Light Gray (accents) | `--light` | `#E6E6E6` |
| Pure White | `--white` | `#FFFFFF` |

Strictly monochrome — no accent color. High contrast: white/light-gray on deep black.

**Typography:** Made Tommy Bold/Uppercase/Wide for headlines · Inter for subheads, body & UI.
**Logo:** HARBWEAR™ wordmark + HW monogram (`assets/favicon.svg`).

## Structure

- `index.html` — preloader, hero, marquee (QUALITY OVER EVERYTHING • DESIGNED TO LAST • PREMIUM MATERIALS • MADE FOR YOU), collections, categories (pinned horizontal scroll), story, newsletter (STAY IN THE LOOP), footer
- `css/style.css` — full design system
- `js/main.js` — preloader engine, scroll magic, cursor, tilt, nav
- `assets/` — fonts, images, favicon

## Font licensing — read this

**Made Tommy** is © MadeType. The build includes the free **personal-use** cut.
Before launching HARBWEAR commercially, buy the commercial license:
https://pixelsurplus.com/products/made-tommy
**Inter** is SIL Open Font License (free for all use).

Made with ❤️ in Egypt. © 2026 HARBWEAR. ALL RIGHTS RESERVED.
