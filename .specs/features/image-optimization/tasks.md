# Image Optimization Tasks

**Design**: `.specs/features/image-optimization/design.md`
**Status**: Done

---

## Execution Plan

### Phase 1: Foundation (Sequential)

```
T1 → T2 → T3
```

### Phase 2: Backend Integration (Sequential)

```
T3 → T4 → T5
```

### Phase 3: Frontend Integration (Sequential)

```
T5 → T6 → T7
```

### Phase 4: Migration Script (Sequential)

```
T7 → T8
```

---

## Task Breakdown

### T1: Install Sharp and create image processing service

**What**: Install `sharp` as a dependency and create the image processing utility functions
**Where**: `src/server/storage/image-processing.ts` (new)
**Depends on**: None
**Reuses**: None
**Requirement**: IMG-01, IMG-02, IMG-03, IMG-04, IMG-06

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] `sharp` added to dependencies in `package.json`
- [ ] `optimizeImage(buffer, options)` function: resize max 2048px, convert to WebP quality 80%
- [ ] `generateThumbnail(buffer, options)` function: resize 300px (square for avatars), WebP quality 70%
- [ ] `shouldSkipOptimization(buffer, contentType)` function: skip if < 500KB WebP or animated GIF
- [ ] All edge cases handled: GIF passthrough, tiny images (< 100px), already-optimized
- [ ] TypeScript compiles: `pnpm typecheck` passes
- [ ] Gate check passes: `pnpm check`

**Tests**: none
**Gate**: build

**Commit**: `feat(storage): add sharp image processing service`

---

### T2: Add thumbnailUrl column to database schema

**What**: Add nullable `thumbnailUrl` column to `analysisPhoto` table
**Where**: `src/server/db/schema.ts` (modify)
**Depends on**: None
**Reuses**: Existing schema patterns
**Requirement**: IMG-08

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] `thumbnailUrl: text("thumbnail_url")` added to `analysisPhoto` table
- [ ] Migration generated: `pnpm db:generate`
- [ ] TypeScript compiles: `pnpm typecheck` passes
- [ ] Gate check passes: `pnpm check`

**Tests**: none
**Gate**: build

**Commit**: `feat(db): add thumbnail_url column to analysis_photo`

---

### T3: Create server-side upload API route

**What**: Create `/api/upload` POST route that receives multipart form data, processes image with Sharp, and stores in MinIO
**Where**: `src/app/api/upload/route.ts` (new)
**Depends on**: T1
**Reuses**: `getMinioClient()`, `MINIO_BUCKET` from `src/server/storage/minio.ts`, image processing from T1
**Requirement**: IMG-01, IMG-02, IMG-05

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] POST handler accepts multipart form with `file` and `purpose` (avatar|analysis)
- [ ] Generates object name following existing convention: `photos/{userId}/{uuid}-{name}.webp`
- [ ] Calls `optimizeImage` → stores optimized image in MinIO via `putObject`
- [ ] Calls `generateThumbnail` → stores thumbnail with `_thumb` suffix in MinIO
- [ ] Returns `{ url, thumbnailUrl, objectName }` as JSON
- [ ] Handles errors: Sharp failure → save original as fallback, log warning
- [ ] Handles avatar purpose: square thumbnail (300x300)
- [ ] Authentication required (reads session)
- [ ] Gate check passes: `pnpm check`

**Tests**: none
**Gate**: build

**Commit**: `feat(api): add server-side upload route with image optimization`

---

### T4: Update photo tRPC router for new upload flow

**What**: Update photo router to work with new upload flow (remove getUploadUrl, update create to accept thumbnailUrl, update delete to clean up thumbnails)
**Where**: `src/server/api/routers/photo.ts` (modify)
**Depends on**: T2, T3
**Reuses**: Existing router structure
**Requirement**: IMG-05, IMG-08

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] `getUploadUrl` procedure removed (no longer needed)
- [ ] `create` procedure accepts optional `thumbnailUrl` and saves it
- [ ] `delete` procedure also deletes thumbnail object from MinIO (if exists)
- [ ] TypeScript compiles: `pnpm typecheck` passes
- [ ] Gate check passes: `pnpm check`

**Tests**: none
**Gate**: build

**Commit**: `feat(photos): update router for optimized upload flow`

---

### T5: Update ImageUploader component to use new upload endpoint

**What**: Replace presigned URL upload with POST to `/api/upload` in the ImageUploader component
**Where**: `src/components/image-uploader.tsx` (modify)
**Depends on**: T3
**Reuses**: Existing component props and UI
**Requirement**: IMG-01

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] Upload flow: `POST /api/upload` with FormData instead of presigned PUT
- [ ] Shows preview from returned optimized URL
- [ ] Shows upload progress / loading state
- [ ] Error handling preserved (toast on failure)
- [ ] Component props unchanged (backward compatible)
- [ ] Gate check passes: `pnpm check`

**Tests**: none
**Gate**: build

**Commit**: `feat(ui): update image uploader to use optimized upload`

---

### T6: Update analysis form multi-photo upload

**What**: Update new and edit analysis forms to use new upload endpoint for multi-photo uploads
**Where**: `src/app/(dashboard)/clients/[id]/analyses/new/analysis-new-client.tsx` (modify), `src/app/(dashboard)/clients/[id]/analyses/[analysisId]/analysis-edit-client.tsx` (modify)
**Depends on**: T3, T4
**Reuses**: Existing form state management, `uploadOnePhoto` pattern
**Requirement**: IMG-01, IMG-08

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] `uploadOnePhoto` uses `POST /api/upload` instead of presigned URL flow
- [ ] Saves both `imageUrl` and `thumbnailUrl` from upload response
- [ ] `createPhoto` mutation includes `thumbnailUrl`
- [ ] Photo grid in form shows thumbnails for existing photos
- [ ] Lightbox still shows full-size optimized image
- [ ] Gate check passes: `pnpm check`

**Tests**: none
**Gate**: build

**Commit**: `feat(analyses): use optimized upload for analysis photos`

---

### T7: Update display components to use thumbnails

**What**: Update list/card views to use thumbnail URLs instead of full images for faster loading
**Where**: `src/app/a/[slug]/gallery-lightbox.tsx` (modify), analysis form photo grids (modify)
**Depends on**: T4, T6
**Reuses**: Existing display components
**Requirement**: IMG-07, IMG-08

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] Photo grid in analysis forms shows thumbnail in card, full image in lightbox
- [ ] Gallery lightbox on public page shows thumbnails in strip, full image in main view
- [ ] Client card avatars remain unchanged (already small)
- [ ] Fallback to full imageUrl if thumbnailUrl is null (backward compat)
- [ ] Gate check passes: `pnpm check`

**Tests**: none
**Gate**: build

**Commit**: `feat(ui): use thumbnails in list views and photo grids`

---

### T8: Create migration script for existing images

**What**: Script to process existing images in MinIO, apply optimization, and generate thumbnails
**Where**: `scripts/optimize-existing-images.ts` (new)
**Depends on**: T1
**Reuses**: `optimizeImage`, `generateThumbnail` from T1, MinIO client, DB access
**Requirement**: IMG-09, IMG-10

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] Script fetches all `analysisPhoto` records from DB
- [ ] For each photo: downloads from MinIO, optimizes, generates thumbnail, re-uploads both
- [ ] Updates DB record with new `thumbnailUrl`
- [ ] Logs: total processed, total saved (MB), errors
- [ ] Handles edge cases: already optimized, GIF, corrupt files
- [ ] Script is runnable: `npx tsx scripts/optimize-existing-images.ts`
- [ ] Gate check passes: `pnpm check`

**Tests**: none
**Gate**: build

**Commit**: `feat(scripts): add image optimization migration for existing photos`

---

## Parallel Execution Map

```
Phase 1 (Sequential — Foundation):
  T1 ──→ T2 (parallel start)
       └→ T3 (depends on T1)

Phase 2 (Sequential — Backend):
  T2 + T3 ──→ T4 ──→ T5

Phase 3 (Sequential — Frontend):
  T5 ──→ T6 ──→ T7

Phase 4 (Sequential — Migration):
  T1 ──→ T8 (can run in parallel with T5-T7)
```

**Note**: Tasks are sequential because each builds on the previous. T2 and T3 can run in parallel since T2 (schema) and T3 (API route) are independent, but T3's API route will be tested alongside T4 which needs both.

---

## Task Granularity Check

| Task | Scope | Status |
| --- | --- | --- |
| T1: Image processing service | 1 new file, ~100 lines | ✅ Granular |
| T2: Schema column addition | 1 line change + migration | ✅ Granular |
| T3: Upload API route | 1 new file, ~80 lines | ✅ Granular |
| T4: Photo router update | 1 file modify | ✅ Granular |
| T5: ImageUploader update | 1 file modify | ✅ Granular |
| T6: Analysis form update | 2 files modify | ✅ Granular (same pattern) |
| T7: Display components update | 2-3 files modify | ✅ Granular (same pattern) |
| T8: Migration script | 1 new file | ✅ Granular |

---

## Diagram-Definition Cross-Check

| Task | Depends On (body) | Diagram Shows | Status |
| --- | --- | --- | --- |
| T1 | None | No incoming arrows | ✅ Match |
| T2 | None | No incoming arrows | ✅ Match |
| T3 | T1 | Arrow from T1 | ✅ Match |
| T4 | T2, T3 | Arrows from T2+T3 | ✅ Match |
| T5 | T3 | Arrow from T3 | ✅ Match |
| T6 | T3, T4 | Arrows from T3+T4 | ✅ Match |
| T7 | T4, T6 | Arrows from T4+T6 | ✅ Match |
| T8 | T1 | Arrow from T1 | ✅ Match |
