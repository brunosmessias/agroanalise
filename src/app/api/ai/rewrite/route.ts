import { env } from "~/env";
import { NextResponse } from "next/server";

const SYSTEM_PROMPT = `Você é um assistente de redação para agrônomos. Reescreva o texto a seguir de forma profissional, clara e bem estruturada, adequada para um relatório técnico agronômico.

Regras:
- Mantenha TODAS as informações técnicas do texto original
- Use linguagem formal e profissional
- Corrija gramática e pontuação
- Melhore a estrutura e clareza
- NÃO invente informações que não estavam no original
- NÃO remova números, medidas ou dados específicos
- Responda APENAS com o texto reescrito, sem explicações ou comentários`;

const VARIANT_PROMPTS: Record<string, string> = {
  description:
    "O texto é a descrição de uma análise/visita técnica agronômica que será compartilhada com o cliente.",
  title:
    "O texto é o título de uma análise agronômica. Reescreva de forma concisa e profissional, mantendo curto (idealmente até 80 caracteres).",
  bio: "O texto é a biografia profissional de um agrônomo para sua página pública. Reescreva de forma atrativa e profissional.",
};

export async function POST(request: Request) {
  if (!env.OPENROUTER_API_KEY) {
    return NextResponse.json(
      { error: "IA não configurada. Adicione OPENROUTER_API_KEY ao .env" },
      { status: 500 },
    );
  }

  let body: { text?: string; variant?: string };
  try {
    body = (await request.json()) as { text?: string; variant?: string };
  } catch {
    return NextResponse.json(
      { error: "JSON inválido" },
      { status: 400 },
    );
  }

  const { text, variant } = body;

  if (!text || text.trim().length < 10) {
    return NextResponse.json(
      { error: "Texto muito curto para melhorar" },
      { status: 400 },
    );
  }

  const variantPrompt = VARIANT_PROMPTS[variant ?? "description"] ?? "";

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30_000);

  try {
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://agroanalise.app",
          "X-OpenRouter-Title": "AgroAnalise",
        },
        body: JSON.stringify({
          model: "google/gemma-3-27b-it:free",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...(variantPrompt
              ? [{ role: "system" as const, content: variantPrompt }]
              : []),
            { role: "user", content: text },
          ],
          temperature: 0.7,
          max_tokens: 2048,
        }),
        signal: controller.signal,
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[AI] OpenRouter error:", response.status, errorText);
      return NextResponse.json(
        { error: "Erro ao processar com IA. Tente novamente." },
        { status: 502 },
      );
    }

    const data = (await response.json()) as {
      choices: Array<{ message: { content: string } }>;
    };
    const rewritten = data.choices?.[0]?.message?.content?.trim();

    if (!rewritten) {
      return NextResponse.json(
        { error: "IA não retornou resultado" },
        { status: 502 },
      );
    }

    return NextResponse.json({ text: rewritten });
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      return NextResponse.json(
        { error: "Tempo esgotado. Tente novamente." },
        { status: 504 },
      );
    }
    console.error("[AI] Unexpected error:", err);
    return NextResponse.json(
      { error: "Erro inesperado ao processar com IA." },
      { status: 500 },
    );
  } finally {
    clearTimeout(timeout);
  }
}
