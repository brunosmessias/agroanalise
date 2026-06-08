# Offline Sync — Tasks

**Spec**: `.specs/features/offline-sync/spec.md`
**Design**: `.specs/features/offline-sync/design.md`
**Status**: Done

---

## Execution Plan

### Phase 1: Foundation (Dexie + queue)
```
T1 → T2 → T3
```

### Phase 2: React hooks & components
```
T3 → T4 → T5 → T6 → T7 → T8
```

### Phase 3: Wiring into existing pages
```
T8 → T9 → T10 → T11
```

### Phase 4: Validation
```
T11 → T12
```

---

## Task Breakdown

### T1: Install Dexie

**What**: Add Dexie.js as a dependency for IndexedDB wrapper
**Where**: `package.json` (modify)
**Depends on**: None
**Reuses**: None
**Requirement**: SYNC-02, SYNC-03

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [x] `dexie` added to dependencies
- [x] `pnpm install` completes
- [x] `pnpm typecheck` passes

**Tests**: none
**Gate**: build
**Commit**: `chore(deps): add dexie for offline storage`

---

### T2: Create Dexie schema and DB module

**What**: Create `src/lib/offline/db.ts` with Dexie schema (pendingAnalyses + pendingPhotos) and TypeScript interfaces
**Where**: `src/lib/offline/db.ts` (new)
**Depends on**: T1
**Reuses**: None
**Requirement**: SYNC-02, SYNC-03

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [x] Schema defines `pendingAnalyses` table: `++id, clientId, title, visitDate, description, status, error, createdAt, syncedAt`
- [x] Schema defines `pendingPhotos` table: `++id, pendingAnalysisId, blob, mime, fileName, description, order, status`
- [x] Status values: `"pending" | "syncing" | "synced" | "error"`
- [x] Helper functions: `addPendingAnalysis`, `addPendingPhoto`, `getPendingAnalyses`, `updateAnalysisStatus`, `updatePhotoStatus`, `deletePendingAnalysis`, `countByStatus`, `cleanupSynced`
- [x] SSR-safe: no-ops on server (window check)
- [x] `pnpm typecheck` passes

**Tests**: none
**Gate**: build
**Commit**: `feat(offline): add dexie schema and db helpers`

---

### T3: Create sync queue orchestrator

**What**: Create `src/lib/offline/sync-queue.ts` with `enqueueAnalysis`, `processQueue`, `retryFailed`, `getPendingCount`
**Where**: `src/lib/offline/sync-queue.ts` (new)
**Depends on**: T2
**Reuses**: tRPC `api.analyses.create`, `api.photos.create`, `/api/upload` endpoint
**Requirement**: SYNC-01, SYNC-05, SYNC-06, SYNC-07, SYNC-15

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [x] `enqueueAnalysis(data, photos, clientName?)` saves analysis + photo blobs to IndexedDB
- [x] `processQueue()` iterates pending/error items, for each:
  - Sets status `"syncing"`
  - Calls `api.analyses.create`
  - For each photo: uploads via `/api/upload`, calls `api.photos.create` with thumbnailUrl
  - On success: status `"synced"`, deletes blob (keep record for 7 days)
  - On error: status `"error"`, stores error message
- [x] `retryFailed()` re-processes items with status `"error"`
- [x] `getPendingCount()` returns counts by status
- [x] Returns `SyncResult { synced, errors, total }`
- [x] Detects online state via `navigator.onLine`; returns early if offline
- [x] Photo upload timeout handled gracefully (per-photo error doesn't fail the analysis)
- [x] `pnpm typecheck` passes

**Tests**: none
**Gate**: build
**Commit**: `feat(offline): add sync queue orchestrator`

---

### T4: Create `useSyncStatus` hook

**What**: React hook monitoring online state, pending counts, syncing state, last sync time
**Where**: `src/hooks/use-sync-status.ts` (new)
**Depends on**: T3
**Reuses**: Dexie `countByStatus`
**Requirement**: SYNC-12, SYNC-13

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [x] Returns `{ isOnline, pendingCount, syncingCount, errorCount, isSyncing, lastSyncAt, retryFailed }`
- [x] Listens to `online` / `offline` window events
- [x] Auto-triggers `processQueue()` on `online` event
- [x] Subscribes to Dexie changes for live count updates
- [x] `retryFailed()` exposed for manual retry
- [x] `pnpm typecheck` passes

**Tests**: none
**Gate**: build
**Commit**: `feat(offline): add useSyncStatus hook with online detection`

---

### T5: Create `useOfflineAnalysis` hook

**What**: Abstraction that decides whether to save locally or send to server
**Where**: `src/hooks/use-offline-analysis.ts` (new)
**Depends on**: T3
**Reuses**: `useSyncStatus` for online detection, sync queue
**Requirement**: SYNC-01, SYNC-03, SYNC-04

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [x] `saveAnalysis(input, photoFiles)` returns `{ mode: "online" | "offline", analysisId?, localId? }`
- [x] Online: creates analysis via tRPC, uploads photos, returns server id
- [x] Offline: enqueues to sync queue, returns local id
- [x] Toast feedback: "Análise salva — será sincronizada quando online" when offline
- [x] `pnpm typecheck` passes

**Tests**: none
**Gate**: build
**Commit**: `feat(offline): add useOfflineAnalysis hook`

---

### T6: Create `SyncBadge` component

**What**: Status badge with icon and label for analysis cards
**Where**: `src/components/sync/sync-badge.tsx` (new)
**Depends on**: None
**Reuses**: shadcn `Badge` primitive
**Requirement**: SYNC-04, SYNC-08, SYNC-09, SYNC-10

**Tools**:
- MCP: shadcn (badge)
- Skill: NONE

**Done when**:
- [x] Variants: `pending` (yellow + Clock), `syncing` (blue + Loader2 spin), `synced` (green + Check), `error` (red + AlertCircle)
- [x] Optional `onRetry` callback shows "Tentar novamente" button when `error`
- [x] Compact display in card headers
- [x] `pnpm typecheck` passes

**Tests**: none
**Gate**: build
**Commit**: `feat(ui): add sync status badge component`

---

### T7: Create `SyncBanner` component

**What**: Top-of-dashboard banner showing pending analysis count with sync-now action
**Where**: `src/components/sync/sync-banner.tsx` (new)
**Depends on**: T4
**Reuses**: `useSyncStatus`
**Requirement**: SYNC-11, SYNC-13, SYNC-14

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [x] Renders nothing when no pending items
- [x] Renders banner "X análises pendentes de sincronização" + button "Sincronizar agora" when `pendingCount > 0` or `errorCount > 0`
- [x] Shows "Sincronizando..." subtle indicator when `isSyncing`
- [x] After sync, toast "X análises sincronizadas" (from sync-queue)
- [x] `pnpm typecheck` passes

**Tests**: none
**Gate**: build
**Commit**: `feat(ui): add sync banner for dashboard`

---

### T8: Create `SyncProvider` component

**What**: Client component mounted in dashboard layout — exposes `useSyncStatus` globally and listens to online events
**Where**: `src/components/sync/sync-provider.tsx` (new)
**Depends on**: T4
**Reuses**: `useSyncStatus`
**Requirement**: SYNC-05, SYNC-12, SYNC-15

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [x] Mounts global listeners (online/offline)
- [x] Triggers auto-sync on reconnect
- [x] Wraps children (just renders them, no DOM impact)
- [x] `pnpm typecheck` passes

**Tests**: none
**Gate**: build
**Commit**: `feat(offline): add sync provider for global event handling`

---

### T9: Wire offline support into new analysis page

**What**: Modify new analysis step form to use `useOfflineAnalysis` hook — offline creates queue locally with badge, online still works as before
**Where**: `src/app/(dashboard)/clients/[id]/analyses/new/analysis-new-client.tsx` (modify)
**Depends on**: T5
**Reuses**: existing form, `useOfflineAnalysis`
**Requirement**: SYNC-01, SYNC-02, SYNC-03, SYNC-04

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [x] Step 1 submit uses `useOfflineAnalysis` instead of `api.analyses.create`
- [x] Offline: toast "Análise salva — será sincronizada quando online", redirect to client detail
- [x] Online: behaves exactly as before (creates analysis, advances to step 2)
- [x] Photos step continues to work for both modes (online uploads immediately, offline queues in sync-queue)
- [x] Status banner visible on form when offline
- [x] `pnpm typecheck` passes

**Tests**: none
**Gate**: build
**Commit**: `feat(analyses): support offline creation in new analysis form`

---

### T10: Wire sync badge into client detail (analyses list)

**What**: Render `SyncBadge` next to each analysis card when a pending local analysis exists for the same client
**Where**: `src/app/(dashboard)/clients/[id]/client-detail-client.tsx` (modify)
**Depends on**: T4, T6
**Reuses**: `useSyncStatus`
**Requirement**: SYNC-04, SYNC-08, SYNC-09, SYNC-10

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [x] Listens to pending analyses from Dexie
- [x] Renders pending items above server list with "Pendente" badge
- [x] Renders error items with "Erro" badge + "Tentar novamente" button
- [x] Pending items show optimistic data (title, date, description) from local DB
- [x] Pending items disappear from list after successful sync
- [x] `pnpm typecheck` passes

**Tests**: none
**Gate**: build
**Commit**: `feat(clients): show pending local analyses in client detail`

---

### T11: Wire sync provider + banner into dashboard layout

**What**: Mount `SyncProvider` and `SyncBanner` in dashboard layout
**Where**: `src/app/(dashboard)/layout.tsx` (modify)
**Depends on**: T7, T8
**Reuses**: components from T7/T8
**Requirement**: SYNC-11, SYNC-12

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [x] `SyncProvider` wraps the main content
- [x] `SyncBanner` renders above children
- [x] `pnpm typecheck` passes

**Tests**: none
**Gate**: build
**Commit**: `feat(dashboard): mount sync provider and banner`

---

### T12: Final typecheck + lint + build

**What**: Run the full check command and ensure no regressions
**Where**: project root
**Depends on**: T1–T11
**Reuses**: `pnpm check` and `pnpm build`
**Requirement**: All

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [x] `pnpm typecheck` passes
- [x] `pnpm lint` (new files clean, pre-existing errors untouched)
- [x] `pnpm build` passes

**Tests**: none
**Gate**: build
**Commit**: `chore(offline): validate build after offline sync feature`

---

## Requirement Coverage

| Requirement ID | Task | Status |
|----------------|------|--------|
| SYNC-01 | T3, T9 | Done |
| SYNC-02 | T1, T2, T9 | Done |
| SYNC-03 | T2, T3, T9 | Done |
| SYNC-04 | T5, T6, T9, T10 | Done |
| SYNC-05 | T3, T8 | Done |
| SYNC-06 | T3 | Done |
| SYNC-07 | T3, T6, T10 | Done |
| SYNC-08 | T6, T10 | Done |
| SYNC-09 | T6, T10 | Done |
| SYNC-10 | T6, T10 | Done |
| SYNC-11 | T7, T11 | Done |
| SYNC-12 | T4, T8, T11 | Done |
| SYNC-13 | T4, T7 | Done |
| SYNC-14 | T3, T7 | Done |
| SYNC-15 | T3, T8 | Done |
