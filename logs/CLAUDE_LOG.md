# Claude Session Log
> Auto-maintained log of all changes made via Claude Code. Useful context for any AI tool picking up this project.

---

## 2026-05-24 (session 2)

### v4-framer — New portfolio build (iamframer.com replica)
- Created `Portfolios/v4-framer/` with `index.html`, `style.css`, `script.js`
- Full dark-theme replica of iamframer.com structure: Nav, Hero, Editor, CMS, Localization, Live Collab, Fonts, Icons, Newsletter, Footer
- Assets reference `../../References/IamFramer/I am Framer_files/` (local scrape, gitignored)
- Hero: `<span class="dim">I'm&nbsp;</span><span class="bright">Priyanka Shanmugham</span>` — grey + white split
- Nav logo: `PS`
- Font: Inter via Google Fonts (GT Walsheim substitute)
- Design tokens: `--bg: #000000`, `--accent: #009EFF`, `--border: #242424`, `--muted: #777777`
- Hero title: `clamp(2rem, 5.5vw, 6rem)` to fit long name on one line

### v0-home — Added Project 04 tile + reordered grid
- Active portfolio (v3) moved to position 1 in the works grid
- v4-framer added as Project 04 with `is-dev` badge, linked to `../Portfolios/v4-framer/index.html`
- Thumbnail: screenshot taken via dev-browser, saved to `v0-home/assets/thumbnails/v4-framer.png`
- Grid order: v3 (Active) → v2a (Dev) → v2b (Dev) → v4 (Dev)

### Repo cleanup
- Moved `newmix.html`, `newmix_files/`, `aero-button.html` from root → `References/`
- Added `References/` to `.gitignore` (all reference scrapes now live there, gitignored)
- Removed 83 previously-tracked files from git history (newmix assets etc.)
- Root now only contains: `v0-home/`, `Portfolios/`, `logs/`, `index.html`, `.gitignore`

---

## 2026-05-24 (session 1)

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
│   ├── ripple-bg.js
│   └── assets/thumbnails/  ← v3-real-content.png, v4-framer.png, etc.
├── Portfolios/           ← All portfolio versions
│   ├── v1-cinematic/
│   ├── v2-newmixcoffee-v1/
│   ├── v2-newmixcoffee-v2/
│   ├── v3-real-content/  ← Active portfolio
│   └── v4-framer/        ← In Development (iamframer replica)
├── References/           ← Local reference scrapes (gitignored)
├── logs/
│   └── CLAUDE_LOG.md
├── index.html            ← Root redirect to v0-home
└── .gitignore
```

## Gitignored (not pushed)
- `References/` — all scraped reference sites (newmix, JW, iamframer, aero-button)
- `Works — Jack Watkins.html` + `Works — Jack Watkins_files/` — JW reference (still at root, gitignored)
- `my-video/` — Remotion video project (separate tool)
- `Portfolio-Content/` — content handoff folder
- `Priyanka-3DP/` — GitHub repo clone (tracked separately)
- `assets/` — root-level scratch assets

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
