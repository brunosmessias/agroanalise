"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "~/components/ui/button";
import { Sparkles, Loader2, Undo2 } from "lucide-react";
import { toast } from "sonner";

interface AiRewriteButtonProps {
  value: string;
  onRewrite: (rewrittenText: string) => void;
  minLength?: number;
  variant?: "description" | "title" | "bio";
  disabled?: boolean;
}

export function AiRewriteButton({
  value,
  onRewrite,
  minLength = 10,
  variant = "description",
  disabled = false,
}: AiRewriteButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [previousText, setPreviousText] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const handleRewrite = useCallback(async () => {
    if (value.trim().length < minLength) {
      toast.error("Texto muito curto para melhorar");
      return;
    }

    if (abortRef.current) {
      abortRef.current.abort();
    }

    const controller = new AbortController();
    abortRef.current = controller;

    setPreviousText(value);
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai/rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: value, variant }),
        signal: controller.signal,
      });

      const data = (await response.json()) as {
        text?: string;
        error?: string;
      };

      if (!response.ok) {
        toast.error(data.error ?? "Erro ao processar com IA");
        setPreviousText(null);
        return;
      }

      if (data.text) {
        onRewrite(data.text);
        toast.success("Texto melhorado com IA!");
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      toast.error("Erro inesperado. Tente novamente.");
      setPreviousText(null);
    } finally {
      setIsLoading(false);
      abortRef.current = null;
    }
  }, [value, minLength, variant, onRewrite]);

  const handleUndo = useCallback(() => {
    if (previousText !== null) {
      onRewrite(previousText);
      setPreviousText(null);
      toast.success("Texto original restaurado!");
    }
  }, [previousText, onRewrite]);

  return (
    <div className="flex items-center gap-1">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleRewrite}
        disabled={isLoading || disabled || value.trim().length < minLength}
        className="h-7 gap-1.5 text-xs"
      >
        {isLoading ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <Sparkles className="h-3 w-3" />
        )}
        {isLoading ? "Melhorando..." : "Melhorar com IA"}
      </Button>
      {previousText !== null && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleUndo}
          className="h-7 gap-1.5 text-xs"
        >
          <Undo2 className="h-3 w-3" />
          Desfazer
        </Button>
      )}
    </div>
  );
}
