# PWA Instalável — Tasks

**Spec**: `.specs/features/pwa-installable/spec.md`
**Design**: `.specs/features/pwa-installable/design.md`
**Status**: Done

---

## Execution Plan

### Phase 1: Foundation (Assets + Manifest)
```
T1 → T2
```

### Phase 2: Metadata + Hook
```
T2 → T3 → T4
```

### Phase 3: UI Component + Integration
```
T4 → T5 → T6
```

---

## Task Breakdown

### T1: Generate PWA icons

**What**: Create the three PWA icon sizes from existing `public/logo-mini.png` (400x391 RGBA) using sharp, with opaque background fill to satisfy PWA installability requirements.
**Where**: `public/icons/icon-192.png` (new), `public/icons/icon-512.png` (new), `public/icons/apple-touch-icon.png` (new), `scripts/generate-pwa-icons.mjs` (new, dev-only helper)
**Depends on**: None
**Reuses**: `sharp` (already installed), `public/logo-mini.png`
**Requirement**: PWA-03, PWA-07

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] `public/icons/icon-192.png` exists (192x192, opaque, PNG)
- [ ] `public/icons/icon-512.png` exists (512x512, opaque, PNG)
- [ ] `public/icons/apple-touch-icon.png` exists (180x180, opaque, PNG)
- [ ] Generation script is idempotent and reproducible
- [ ] Gate check passes: `pnpm check`

**Tests**: none
**Gate**: build

**Commit**: `feat(pwa): generate pwa icons in required sizes`

---

### T2: Create Web App Manifest

**What**: Static Web App Manifest with all required fields (name, short_name, description, start_url, display, theme_color, background_color, icons).
**Where**: `public/manifest.webmanifest` (new)
**Depends on**: T1
**Reuses**: None
**Requirement**: PWA-06, PWA-04, PWA-05

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] File is valid JSON with `name`, `short_name`, `description`, `start_url`, `display: "standalone"`, `theme_color`, `background_color`, `icons[]` (192, 512)
- [ ] `start_url` points to `/dashboard` so installed app lands on dashboard
- [ ] `theme_color` matches the design (zinc-900 / `#18181b`)
- [ ] Gate check passes: `pnpm check`

**Tests**: none
**Gate**: build

**Commit**: `feat(pwa): add web app manifest`

---

### T3: Add PWA meta tags to root layout

**What**: Configure Next.js `metadata` to expose the manifest and iOS-specific PWA tags.
**Where**: `src/app/layout.tsx` (modify)
**Depends on**: T2
**Reuses**: Existing `metadata` object, `apple-touch-icon` already referenced
**Requirement**: PWA-04, PWA-05, PWA-08

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] `metadata.manifest = "/manifest.webmanifest"`
- [ ] `metadata.appleWebApp = { capable: true, statusBarStyle: "default", title: "AgroAnalise" }`
- [ ] `metadata.themeColor = "#18181b"`
- [ ] `metadata.formatDetection = { telephone: false }` (avoid iOS auto-link of phone numbers in reports)
- [ ] `apple-touch-icon` link points to `/icons/apple-touch-icon.png` (180x180)
- [ ] Gate check passes: `pnpm check`

**Tests**: none
**Gate**: build

**Commit**: `feat(pwa): add manifest and ios meta tags to root layout`

---

### T4: Create useInstallPrompt hook

**What**: Client hook that captures `beforeinstallprompt`, detects standalone mode, and tracks dismissal timestamp in localStorage.
**Where**: `src/hooks/use-install-prompt.ts` (new)
**Depends on**: None (can be developed in parallel with T3)
**Reuses**: Browser APIs only
**Requirement**: PWA-01, PWA-10, PWA-11, PWA-12

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] `useInstallPrompt()` returns `{ canInstall, isInstalled, isIOS, promptInstall(), dismiss(), dismissed }`
- [ ] `canInstall` becomes true on `beforeinstallprompt` event
- [ ] `isInstalled` is true when `window.matchMedia('(display-mode: standalone)').matches` OR iOS `navigator.standalone === true`
- [ ] `isIOS` is true on iOS Safari (iPhone/iPad user-agent detection, not just iPod)
- [ ] `promptInstall()` calls `deferredPrompt.prompt()` and resolves with `userChoice.outcome`
- [ ] `dismiss()` writes `pwa_dismissed_at = Date.now()` to localStorage
- [ ] `dismissed` is true if `(now - pwa_dismissed_at) < 7 * 24 * 60 * 60 * 1000`
- [ ] Hook is SSR-safe (guards `typeof window`)
- [ ] Gate check passes: `pnpm check`

**Tests**: none
**Gate**: build

**Commit**: `feat(pwa): add useInstallPrompt hook`

---

### T5: Create InstallBanner component

**What**: Client component rendering a dismissible card in the dashboard. Android → CTA triggers `promptInstall()`. iOS → static instructions with share icon. Hidden when installed, dismissed, or desktop.
**Where**: `src/components/pwa/install-banner.tsx` (new)
**Depends on**: T4
**Reuses**: `Button` from `~/components/ui/button`, `Card` from `~/components/ui/card`, `Share` icon from `lucide-react`, `toast` from `sonner`, `useIsMobile` from `~/hooks/use-mobile`
**Requirement**: PWA-09, PWA-10, PWA-11, PWA-12

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] Returns `null` when not mobile, installed, or dismissed
- [ ] Android variant: title "Instale o app AgroAnalise" + description + button "Instalar" calling `promptInstall()`, success toast on accept
- [ ] iOS variant: title "Instale no iPhone" + description "Toque em Compartilhar (⬆️) e depois 'Adicionar à Tela de Início'" with a `Share` icon
- [ ] Close button writes dismissal timestamp; not shown for 7 days
- [ ] Card is non-intrusive (small, dismissible, placed at top of dashboard)
- [ ] Gate check passes: `pnpm check`

**Tests**: none
**Gate**: build

**Commit**: `feat(pwa): add install banner component`

---

### T6: Integrate InstallBanner in dashboard layout

**What**: Mount the InstallBanner inside the authenticated dashboard layout so it appears on every dashboard page.
**Where**: `src/app/(dashboard)/layout.tsx` (modify)
**Depends on**: T5
**Reuses**: `InstallBanner` from T5
**Requirement**: PWA-09

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] `InstallBanner` rendered just inside `<main>` of the dashboard layout (above page content)
- [ ] Dashboard pages (e.g. `/dashboard`, `/clients`) all show the banner when applicable
- [ ] Banner does not appear on auth pages (`(auth)/`) or public analysis pages (`/a/[slug]`)
- [ ] Gate check passes: `pnpm check`

**Tests**: none
**Gate**: build

**Commit**: `feat(pwa): show install banner in dashboard layout`

---

## Task Granularity Check

| Task | Scope | Status |
|------|-------|--------|
| T1: Generate icons | 1 script + 3 PNGs | Granular |
| T2: Manifest | 1 file | Granular |
| T3: Root layout meta | 1 file | Granular |
| T4: useInstallPrompt | 1 hook | Granular |
| T5: InstallBanner | 1 component | Granular |
| T6: Dashboard integration | 1 file | Granular |

## Diagram-Definition Cross-Check

| Task | Depends On (body) | Diagram Shows | Status |
|------|-------------------|---------------|--------|
| T1 | None | (offline asset) | Match |
| T2 | T1 | B manifest | Match |
| T3 | T2 | C meta tags | Match |
| T4 | None (parallel) | D hook | Match |
| T5 | T4 | E InstallBanner | Match |
| T6 | T5 | E → main page | Match |

## Test Co-location Validation

No TESTING.md exists. All tasks marked `Tests: none` / `Gate: build` (typecheck + lint), consistent with the project's lack of test infrastructure.
