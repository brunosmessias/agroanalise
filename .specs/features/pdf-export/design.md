# Geração de PDF de Análise — Design

**Spec**: `.specs/features/pdf-export/spec.md`
**Status**: Approved

---

## Architecture Overview

Server-side PDF generation via Next.js API route using `@react-pdf/renderer`. The PDF document component mirrors the public page layout. A shared client-side button component triggers the download via `fetch()` to the API route, handling loading/error states.

```
[ExportPdfButton] ──POST──→ [/api/pdf/analysis]
  (client)                       (server route)
   ↓ loading state                  ↓
   ↓ download blob                  ↓ getBySlug data
   ↓ error toast                  ↓ renderToBuffer(<AnalysisPdfDocument />)
                                   ↓ return PDF buffer
```

---

## Code Reuse Analysis

### Existing Components to Leverage

| Component | Location | How to Use |
|-----------|----------|------------|
| `getBySlug` procedure | `src/server/api/routers/analysis.ts` | Reuse for PDF data — returns analysis + photos + client + agronomist |
| Public page layout | `src/app/a/[slug]/page.tsx` | Mirror visual structure in PDF |
| `api` server caller | `src/trpc/server.ts` | Call tRPC from API route |

### Integration Points

| System | Integration Method |
|--------|--------------------|
| tRPC API | Server-side caller via `api.analyses.getBySlug()` |
| Next.js API Routes | New `/api/pdf/analysis` route handler |

---

## Components

### AnalysisPdfDocument

- **Purpose**: React-PDF document that renders the analysis as a professional PDF
- **Location**: `src/components/pdf/analysis-pdf-document.tsx`
- **Interfaces**:
  - Props: `{ analysis: getBySlug output type }`
- **Dependencies**: `@react-pdf/renderer`
- **Reuses**: Visual structure from public page (`/a/[slug]/page.tsx`)

**PDF Sections:**
1. Header — AgroAnalise logo text + date
2. Cover section — title, description, client name, visit date
3. Stats strip — date, photo count, location
4. Photo gallery — each photo with image + description, 2 per row, paginated
5. Farm details — name, document, address, phone, email, notes
6. Agronomist card — name, company, email, phone
7. Footer — "Relatório gerado em {date}" + AgroAnalise branding

### ExportPdfButton

- **Purpose**: Client component that triggers PDF download with loading/error states
- **Location**: `src/components/pdf/export-pdf-button.tsx`
- **Interfaces**:
  - Props: `{ slug: string; label?: string; variant?: ButtonVariant }`
- **Dependencies**: `sonner` (toast), `lucide-react` (icons), Button from shadcn
- **Reuses**: Button component from shadcn/ui

### PDF API Route

- **Purpose**: Server-side route that generates PDF buffer and returns it
- **Location**: `src/app/api/pdf/analysis/route.ts`
- **Interfaces**:
  - POST body: `{ slug: string }`
  - Response: PDF file with `Content-Disposition` header
- **Dependencies**: `@react-pdf/renderer`, tRPC server caller
- **Reuses**: `api.analyses.getBySlug` for data

---

## Data Models

No new database tables or schema changes needed. The PDF reuses the existing `getBySlug` response:

```typescript
type AnalysisPdfData = NonNullable<RouterOutputs["analyses"]["getBySlug"]>;
// Contains: title, description, slug, visitDate, photos[], client, agronomist
```

---

## Error Handling Strategy

| Error Scenario | Handling | User Impact |
|----------------|----------|-------------|
| Analysis not found | Return 404 | Toast "Análise não encontrada" |
| Broken photo URL | Catch in PDF render, show placeholder | "Imagem indisponível" in PDF |
| PDF generation timeout (>30s) | AbortController on client, timeout on server | Toast "Tempo esgotado, tente novamente" |
| Server error (500) | Catch in fetch, show toast | Toast "Erro ao gerar PDF" |
| No photos | PDF generated with text-only content | Works normally, no photos section |

---

## Tech Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| PDF library | `@react-pdf/renderer` | React components → PDF, works server-side, no Chromium dependency, renders to buffer for API routes |
| Generation approach | Server-side API route (POST) | No client-side JS overhead, works on public page without auth, consistent output |
| Image handling | Direct URL fetch by react-pdf | react-pdf `<Image>` fetches URLs natively; broken URLs caught with try/catch per photo |
| Button behavior | Fetch blob → download via URL.createObjectURL | Better control of loading state, filename, and error handling vs `PDFDownloadLink` |
| File naming | `analise-{slug}.pdf` | Slug is already URL-safe, matches spec requirement PDF-03 |

---

## Placement

### Public page (`/a/[slug]`)
- Add `ExportPdfButton` in the floating header, next to "Relatório Técnico" badge
- Visible to all visitors (no auth required)

### Dashboard edit page (step 3 "Concluído")
- Add `ExportPdfButton` next to "Abrir relatório" button
- Uses agronomist's auth context implicitly (PDF API is public via slug)
