# Geração de PDF de Análise — Tasks

**Design**: `.specs/features/pdf-export/design.md`
**Status**: Done

---

## Execution Plan

### Phase 1: Foundation (Sequential)
```
T1 → T2
```

### Phase 2: Core (Sequential — builds on foundation)
```
T2 → T3 → T4
```

### Phase 3: Integration (Sequential)
```
T4 → T5 → T6
```

---

## Task Breakdown

### T1: Install @react-pdf/renderer dependency

**What**: Install the PDF generation library
**Where**: `package.json` (via pnpm)
**Depends on**: None
**Reuses**: N/A
**Requirement**: PDF-01

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] `@react-pdf/renderer` installed and in package.json
- [ ] `pnpm typecheck` passes

**Tests**: none
**Gate**: build

---

### T2: Create AnalysisPdfDocument component

**What**: React-PDF document component that renders analysis data as a professional PDF with all sections (header, cover, stats, photos, farm details, agronomist card, footer)
**Where**: `src/components/pdf/analysis-pdf-document.tsx`
**Depends on**: T1
**Reuses**: Visual structure from `src/app/a/[slug]/page.tsx`, data shape from `getBySlug` output
**Requirement**: PDF-04, PDF-05

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] Component renders Document with all 7 sections
- [ ] Photos displayed 2 per row with descriptions
- [ ] Broken image URLs show placeholder "Imagem indisponível"
- [ ] Long descriptions paginate correctly (no overflow)
- [ ] No photos case handled (text-only PDF)
- [ ] PDF named via Document title/author metadata
- [ ] No TypeScript errors

**Tests**: none
**Gate**: build

---

### T3: Create PDF API route

**What**: POST `/api/pdf/analysis` route that fetches analysis data and returns rendered PDF buffer
**Where**: `src/app/api/pdf/analysis/route.ts`
**Depends on**: T2
**Reuses**: `api.analyses.getBySlug` from `src/trpc/server.ts`
**Requirement**: PDF-01, PDF-03, PDF-05

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] Route accepts POST with `{ slug }` body
- [ ] Returns PDF with `Content-Type: application/pdf`
- [ ] `Content-Disposition: attachment; filename=analise-{slug}.pdf`
- [ ] Returns 404 when slug not found
- [ ] Timeout handling (>30s returns error)
- [ ] No TypeScript errors

**Tests**: none
**Gate**: build

---

### T4: Create ExportPdfButton component

**What**: Client component with loading state that calls PDF API and triggers browser download
**Where**: `src/components/pdf/export-pdf-button.tsx`
**Depends on**: T3
**Reuses**: Button from `src/components/ui/button`, toast from sonner
**Requirement**: PDF-02, PDF-06

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] Shows loading spinner while generating
- [ ] Downloads PDF as `analise-{slug}.pdf`
- [ ] Shows error toast on failure, button stays enabled for retry
- [ ] Accepts `label` and `variant` props
- [ ] Uses AbortController with 35s timeout
- [ ] No TypeScript errors

**Tests**: none
**Gate**: build

---

### T5: Integrate ExportPdfButton on public analysis page

**What**: Add the PDF download button to the floating header on `/a/[slug]`
**Where**: `src/app/a/[slug]/page.tsx`
**Depends on**: T4
**Reuses**: ExportPdfButton from T4
**Requirement**: PDF-07, PDF-08

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] Button visible in floating header next to "Relatório Técnico" badge
- [ ] Button works without authentication (public page)
- [ ] No layout regression on mobile or desktop
- [ ] No TypeScript errors

**Tests**: none
**Gate**: build

**Commit**: `feat(pdf): add export pdf button on public analysis page`

---

### T6: Integrate ExportPdfButton on dashboard analysis edit page

**What**: Add the PDF download button on step 3 ("Concluído") next to "Abrir relatório"
**Where**: `src/app/(dashboard)/clients/[id]/analyses/[analysisId]/analysis-edit-client.tsx`
**Depends on**: T4
**Reuses**: ExportPdfButton from T4
**Requirement**: PDF-01, PDF-07

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] Button visible on step 3 next to "Abrir relatório"
- [ ] Button uses slug from analysis data
- [ ] No layout regression
- [ ] No TypeScript errors

**Tests**: none
**Gate**: build

**Commit**: `feat(pdf): add export pdf button on dashboard analysis page`

---

## Task Granularity Check

| Task | Scope | Status |
|------|-------|--------|
| T1: Install dependency | 1 package | ✅ Granular |
| T2: AnalysisPdfDocument | 1 component | ✅ Granular |
| T3: PDF API route | 1 endpoint | ✅ Granular |
| T4: ExportPdfButton | 1 component | ✅ Granular |
| T5: Integrate on public page | 1 file change | ✅ Granular |
| T6: Integrate on dashboard | 1 file change | ✅ Granular |

## Diagram-Definition Cross-Check

| Task | Depends On (body) | Diagram Shows | Status |
|------|-------------------|---------------|--------|
| T1 | None | Entry point | ✅ Match |
| T2 | T1 | T1 → T2 | ✅ Match |
| T3 | T2 | T2 → T3 | ✅ Match |
| T4 | T3 | T3 → T4 | ✅ Match |
| T5 | T4 | T4 → T5 | ✅ Match |
| T6 | T4 | T4 → T6 | ✅ Match |

## Test Co-location Validation

No TESTING.md exists. All tasks are marked `Tests: none` / `Gate: build` (typecheck + lint). This is consistent since the project has no test infrastructure.

---

## Parallel Execution Map

```
Phase 1 (Sequential):
  T1 ──→ T2 ──→ T3 ──→ T4

Phase 2 (Parallel):
  T4 complete, then:
    ├── T5
    └── T6
```
