import { renderToBuffer } from "@react-pdf/renderer";
import { type NextRequest, NextResponse } from "next/server";
import { api } from "~/trpc/server";
import { AnalysisPdfDocument } from "~/components/pdf/analysis-pdf-document";

export async function POST(request: NextRequest) {
  let slug: string | undefined;

  try {
    const body = (await request.json()) as { slug?: string };
    slug = body.slug;
  } catch {
    return NextResponse.json(
      { error: "Requisição inválida" },
      { status: 400 },
    );
  }

  if (!slug || typeof slug !== "string") {
    return NextResponse.json(
      { error: "Slug é obrigatório" },
      { status: 400 },
    );
  }

  const data = await api.analyses.getBySlug({ slug });

  if (!data) {
    return NextResponse.json(
      { error: "Análise não encontrada" },
      { status: 404 },
    );
  }

  const document = <AnalysisPdfDocument data={data} />;
  const filename = `analise-${slug}.pdf`;

  try {
    const timeoutMs = 30_000;
    const buffer = await Promise.race([
      renderToBuffer(document),
      new Promise<never>((_, reject) =>
        setTimeout(
          () => reject(new Error("PDF generation timed out")),
          timeoutMs,
        ),
      ),
    ]);

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": buffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("[PDF Generation Error]", error);
    return NextResponse.json(
      { error: "Erro ao gerar PDF" },
      { status: 500 },
    );
  }
}
