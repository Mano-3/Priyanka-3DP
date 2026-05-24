# Claude Session Log
> Auto-maintained log of all changes made via Claude Code. Useful context for any AI tool picking up this project.

---

## 2026-05-24

### Repo reorganisation
- Created `Portfolios/` folder; moved `v1-cinematic/`, `v2-newmixcoffee-v1/`, `v2-newmixcoffee-v2/`, `v3-real-content/` into it
- `v0-home/` (gallery homepage) stays at root — it is the entry point
- Updated all `../v2-*/` and `../v3-*/` links in `v0-home/index.html` → `../Portfolios/v*/`
- Fixed `Portfolios/v3-real-content/index.html` mp4 path: `../Priyanka_Intro1.mp4` → `../../Priyanka_Intro1.mp4`
- Added `newmix.html` + `newmix_files/` to `.gitignore` (reference scrape, not used in site)

### v0-home — Title font & effects
- Switched title font from **Outfit 700** → **Montserrat ExtraBold 800** (Google Fonts)
- Bumped font size: `clamp(24px, 3.8vw, 62px)` → `clamp(36px, 5.5vw, 80px)`
- Fixed descender clipping (y, g) by increasing `line-height: 1` → `1.25`
- Added 3D emboss via stacked `filter: drop-shadow()` — thin 2px solid line shadow, works with `background-clip: text`

---

## 2026-05-13 (from memory)

### v0-home — Initial gallery build (JW-matched design)
- Pill navbar with progressive blur (10-panel JW technique)
- Hero: `Priyanka Shanmugham` title with radial gradient spotlight on hover
- Works grid: 2 cols, 40px col-gap, 96px row-gap, 16:9 landscape tiles
- Cards: 6px radius, JW 4-layer box-shadow, "View work" pill overlay, gradient shimmer
- Tag labels: `#040021` bg, `blur(10px)`, 2px letter-spacing uppercase
- Tile status badges: Active (green pulsing dot) / In Development (amber)
- Gallery eyebrow subtitle: `Product Designer · Portfolio`
- 4 tiles: Portfolio v3, Newmix Coffee v2, Newmix Coffee v1, Portfolio v1 (Film)
- Thumbnail images not yet added (`assets/thumbnails/` — user will share)

---

## Project structure (current)
```
priyanka-3d/
├── v0-home/              ← Gallery homepage (entry point)
│   ├── index.html
│   ├── style.css
│   ├── script.js
│   ├── name-effect.js
│   └── assets/thumbnails/
├── Portfolios/           ← All portfolio versions
│   ├── v1-cinematic/
│   ├── v2-newmixcoffee-v1/
│   ├── v2-newmixcoffee-v2/
│   └── v3-real-content/  ← Active portfolio (links: About, Resume)
├── Priyanka_Intro1.mp4   ← Used by v3-real-content (9MB, kept at root)
├── CLAUDE_LOG.md         ← This file
└── .gitignore
```

## Gitignored (not pushed)
- `newmix.html` + `newmix_files/` — scraped reference
- `Works — Jack Watkins.html` + `Works — Jack Watkins_files/` — JW reference
- `my-video/` — Remotion video project (separate tool)
- `Portfolio-Content/` — content handoff folder
- `Priyanka-3DP/` — GitHub repo clone (tracked separately)

## Design tokens (v0-home)
| Token | Value |
|---|---|
| Background | `#010008` |
| White | `#f6f3f0` |
| Lift (tag bg) | `#040021` |
| Title font | Montserrat 800 |
| Body font | Outfit 600/700 |
| Card radius | 6px |
| Card aspect | 16/9 |
| Nav pill blur | `blur(12px)` |
