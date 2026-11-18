<div align="center">

# 🌌 Aether Stream Hub

<p align="center">
  <strong>A modern, accessible movie & TV streaming catalog browser</strong><br>
  Built with React 18, TypeScript, Tailwind CSS, and a neo-brutalist design system
</p>

<p align="center">
  <a href="#-features"><strong>Features</strong></a> •
  <a href="#-quick-start"><strong>Quick Start</strong></a> •
  <a href="#-design-system"><strong>Design System</strong></a> •
  <a href="#-architecture"><strong>Architecture</strong></a> •
  <a href="#-accessibility"><strong>Accessibility</strong></a> •
  <a href="#-development"><strong>Development</strong></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React 18">
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript 5">
  <img src="https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS 3">
  <img src="https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite 5">
  <img src="https://img.shields.io/badge/Vitest-2-FF69B4?style=for-the-badge&logo=vitest&logoColor=white" alt="Vitest 2">
  <img src="https://img.shields.io/badge/ESLint-9-4B32C3?style=for-the-badge&logo=eslint&logoColor=white" alt="ESLint 9">
  <img src="https://img.shields.io/badge/Prettier-3-F7B93E?style=for-the-badge&logo=prettier&logoColor=white" alt="Prettier 3">
 
</p>

</div>

---

## ✨ Features

<table>
<tr>
<td width="50%">

### 🎨 **15 Rice Themes**
Beautiful color palettes inspired by popular Linux ricing communities: Catppuccin, Tokyo Night, Gruvbox, Nord, Dracula, and more. Switch instantly from the top bar.

</td>
<td width="50%">

### 🔍 **Command Palette Search**
Rofi-inspired modal with keyboard navigation (↑/↓/Enter), debounced search, direct TMDB/IMDb ID launching, and quick genre shortcuts.

</td>
</tr>
<tr>
<td>

### 📱 **Responsive Layouts**
Horizontal scrolling rows on desktop, responsive grids on mobile. Consistent card sizing across all views with smooth snap scrolling.

</td>
<td>

### 🎬 **Split-Pane Theater Player**
Video modal with episode sidebar for TV shows, server switching, cast sidebar, fullscreen support, and stream logging.

</td>
</tr>
<tr>
<td>

### 📋 **Watchlist & Stream Logs**
Persisted watchlist with play/remove actions. Terminal-style stream activity log with click-to-resume playback.

</td>
<td>

### ♿ **Accessibility First**
WCAG AA contrast, semantic HTML, full keyboard navigation, focus management, reduced motion support, and screen reader compatibility.

</td>
</tr>
</table>

---

## 🚀 Quick Start

```bash
# 1️⃣ Clone & install
git clone <your-repo>
cd movie
npm install

# 2️⃣ Configure TMDB API key
echo "VITE_TMDB_READ_API_KEY=your_tmdb_token" > .env.local

# 3️⃣ Start developing
npm run dev          # Opens http://localhost:3000
```

<details>
<summary>📋 <strong>All Available Commands</strong></summary>

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with HMR |
| `npm run build` | Type-check + production build |
| `npm run preview` | Preview production build locally |
| `npm run test` | Run Vitest test suite |
| `npm run test:watch` | Watch mode for tests |
| `npm run lint` | ESLint with TypeScript rules |
| `npm run format` | Prettier format all source files |
| `npm run format:check` | Check formatting without writing |

</details>

---

## 🎨 Design System

### Neo-Brutalist + Rice Themes

A distinctive design language combining **neo-brutalist** aesthetics (bold borders, offset shadows, raw typography) with **15 curated rice themes** from the Linux ricing community.

<details>
<summary>🎭 <strong>View All 15 Themes</strong></summary>

| Theme | Preview | Origin |
|-------|---------|--------|
| **Catppuccin Mocha** | `mocha` | Catppuccin |
| **Tokyo Night** | `tokyo` | Tokyo Night |
| **Gruvbox Dark** | `gruvbox` | Gruvbox |
| **Solarized Dark** | `solarized` | Solarized |
| **Nord** | `nord` | Nord |
| **Everforest** | `everforest` | Everforest |
| **Rosé Pine** | `rose-pine` | Rosé Pine |
| **Dracula** | `dracula` | Dracula |
| **Kanagawa** | `kanagawa` | Kanagawa |
| **Cyberpunk** | `cyberpunk` | Custom |
| **Doom One** | `doom-one` | Doom Emacs |
| **Ayu Dark** | `ayu` | Ayu |
| **One Dark** | `one-dark` | VS Code / Atom |
| **GitHub Dark** | `github-dark` | GitHub |
| **Catppuccin Frappé** | `frappe` | Catppuccin |

</details>

### Design Tokens

| Token | Description |
|-------|-------------|
| `--bg-crust` | Deep background |
| `--bg-mantle` | Panel/section background |
| `--bg-card` | Card/component background |
| `--text-main` | Primary text color |
| `--text-muted` | Secondary text |
| `--accent-primary` | Primary actions, highlights |
| `--accent-highlight` | Secondary accent |
| `--border-color` | Borders, dividers |

### Shadows & Motion

| Shadow | Value | Use Case |
|--------|-------|----------|
| `shadow-tile` | `0 4px 20px -2px rgba(0,0,0,0.5)` | Cards, rows |
| `shadow-tile-glow` | `0 0 15px -3px var(--accent-primary)` | Hover states |
| `shadow-window` | `0 8px 32px 0 rgba(0,0,0,0.6)` | Modals, drawers |

| Transition | Timing | Easing |
|------------|--------|--------|
| Fast | 100ms | `cubic-bezier(0.34, 1.56, 0.64, 1)` |
| Normal | 150ms | `cubic-bezier(0.34, 1.56, 0.64, 1)` |

### Typography

| Role | Font | Weights |
|------|------|---------|
| **Headings** | Space Grotesk / Inter | 700–800 |
| **Body** | Inter | 400–600 |
| **Mono** | JetBrains Mono / Fira Code | 400–600 |

---

## 🏗️ Architecture

> **📖 For detailed architecture documentation, see [ARCHITECTURE.md](./ARCHITECTURE.md)**

### High-Level Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    React Components                          │
│  (Pure UI — Waybar, MediaCard, VideoModal, etc.)            │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      React Hooks                             │
│  (State & Orchestration — useAetherApp, useRiceTheme)       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     Service Layer                            │
│  (Business Logic — apiService, watchlistService, etc.)      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Storage & Types                            │
│  (localStorage abstraction, shared TypeScript types)        │
└─────────────────────────────────────────────────────────────┘
```

### Key Principles

| Principle | Implementation |
|-----------|----------------|
| **Separation of Concerns** | Components → Hooks → Services → Storage |
| **Type Safety** | Shared types in `src/lib/types.ts` |
| **No Hardcoded Secrets** | All config via `.env.local` |
| **Encapsulation** | Services expose immutable APIs |
| **Testability** | Pure functions, dependency injection |

---

## ♿ Accessibility

| Feature | Implementation |
|---------|----------------|
| **Semantic HTML** | `header`, `main`, `section`, `nav`, `article`, `dialog` |
| **ARIA Roles** | `tablist`/`tab`/`tabpanel`, `dialog`, `alert`, `listbox`/`option` |
| **Keyboard Nav** | Tab order, Enter/Space activation, Escape to close, ↑/↓ in lists |
| **Focus Management** | 3px ring focus styles, focus trapping in modals, visible outlines |
| **Color Contrast** | WCAG AA verified across all 15 themes |
| **Reduced Motion** | `@media (prefers-reduced-motion)` disables animations |
| **High Contrast** | `@media (prefers-contrast: high)` strengthens borders |
| **Touch Targets** | Minimum 44×44px (36px for compact icon buttons) |

---

## 📁 Project Structure

```
movie/
├── 📄 index.html                 # Vite entry HTML
├── 📄 package.json               # Dependencies & scripts
├── 📄 vite.config.ts             # Vite config (React, port 3000)
├── 📄 tailwind.config.js         # Theme tokens + 15 rice themes
├── 📄 tsconfig.json              # TypeScript config
├── 📄 ARCHITECTURE.md            # Detailed architecture docs
├── 📄 README.md                  # This file
├── 📄 .eslintrc.cjs              # ESLint config
├── 📄 .prettierrc                # Prettier config
├── 📄 vitest.config.ts           # Vitest config
└── src/
    ├── 📄 main.tsx               # React entry point
    ├── 📄 App.tsx                # Root component + ErrorBoundary
    ├── 📄 index.css              # Tailwind + 15 theme CSS variables
    ├── components/               # Pure UI components
    │   ├── ErrorBoundary.tsx
    │   ├── Waybar.tsx
    │   ├── RofiSearchModal.tsx
    │   ├── WatchlistDrawer.tsx
    │   ├── StreamLogPanel.tsx
    │   ├── BrowseSections.tsx
    │   ├── MediaRow.tsx
    │   ├── MediaCard.tsx
    │   ├── SearchSection.tsx
    │   ├── VideoModal.tsx
    │   ├── LoadingOverlay.tsx
    │   └── ErrorBanner.tsx
    ├── hooks/                    # State & orchestration
    │   ├── useAetherApp.ts
    │   ├── useRiceTheme.ts
    │   └── useTheme.ts
    ├── lib/                      # Core logic & utilities
    │   ├── config.ts             # App configuration
    │   ├── types.ts              # Shared TypeScript types
    │   ├── services.ts           # Encapsulated business logic
    │   ├── storage.ts            # localStorage abstraction
    │   └── app.ts                # Legacy vanilla JS compat
    └── test/                     # Vitest tests
        ├── setup.ts
        ├── types.test.ts
        └── storage.test.ts
```

---

## 🔐 Security

- **Zero hardcoded secrets** — TMDB API key via `VITE_TMDB_READ_API_KEY` only
- **Environment-based config** — All sensitive values from `.env.local`
- **Safe `window.__CONFIG__`** — Legacy layer exposes only non-sensitive config
- **Content Security Policy** — Compatible with strict CSP headers

```env
# .env.local example
VITE_TMDB_READ_API_KEY=your_tmdb_read_access_token
VITE_BACKEND_URL=https://your-backend.example.com
VITE_HOSTNAME=your-host.example.com
```

---

## 🧪 Testing

```bash
npm run test           # Run once
npm run test:watch     # Watch mode
npm run test -- --coverage  # With coverage report
```

**Test Stack:** Vitest + jsdom + React Testing Library  
**Coverage:** Type definitions, storage utilities, service layer

---

## 📄 License

Original vanilla app logic preserved in `src/lib/app.ts` for compatibility.

---

<div align="center">

[⬆ Back to top](#-aether-stream-hub)

</div>