"use client";

import { useRef, useState } from "react";
import { Camera, Loader2, Trash2, User } from "lucide-react";
import { toast } from "sonner";
import { api } from "~/trpc/react";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

interface ImageUploaderProps {
  value: string | null | undefined;
  onChange: (url: string | null) => void;
  name: string;
  purpose?: "avatar" | "analysis";
  size?: "sm" | "md" | "lg" | "xl";
  shape?: "circle" | "square";
  className?: string;
  disabled?: boolean;
}

const sizeClasses = {
  sm: "h-16 w-16",
  md: "h-24 w-24",
  lg: "h-32 w-32",
  xl: "h-40 w-40",
};

const iconSizeClasses = {
  sm: "h-6 w-6",
  md: "h-8 w-8",
  lg: "h-10 w-10",
  xl: "h-14 w-14",
};

export function ImageUploader({
  value,
  onChange,
  name,
  purpose = "avatar",
  size = "lg",
  shape = "circle",
  className,
  disabled = false,
}: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const getUploadUrlMutation = api.photos.getUploadUrl.useMutation();

  const initials = name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleFileSelect = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Selecione um arquivo de imagem válido");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 5MB");
      return;
    }

    setIsUploading(true);
    try {
      const { uploadUrl, objectName } = await getUploadUrlMutation.mutateAsync({
        fileName: file.name,
        contentType: file.type,
        purpose,
      });

      const publicUrl = `${window.location.origin}/api/storage/${objectName}`;

      const response = await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });

      if (!response.ok) {
        throw new Error("Falha no upload");
      }

      onChange(publicUrl);
      toast.success("Imagem enviada com sucesso!");
    } catch {
      toast.error("Erro ao enviar imagem");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemove = () => {
    onChange(null);
  };

  const handleClick = () => {
    if (!disabled && !isUploading) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      <div
        className={cn(
          "group relative cursor-pointer overflow-hidden border-2 border-dashed border-muted-foreground/25 bg-muted transition-all hover:border-primary",
          sizeClasses[size],
          shape === "circle" ? "rounded-full" : "rounded-lg",
        )}
        onClick={handleClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleClick();
          }
        }}
      >
        {value ? (
          <img
            src={value}
            alt={name}
            className="h-full w-full object-cover"
          />
        ) : (
          <Avatar
            className={cn(
              "h-full w-full",
              shape === "circle" ? "rounded-full" : "rounded-lg",
            )}
          >
            <AvatarFallback
              className={cn(
                "h-full w-full bg-primary/10 text-primary",
                shape === "circle" ? "rounded-full" : "rounded-lg",
              )}
            >
              {initials || <User className={iconSizeClasses[size]} />}
            </AvatarFallback>
          </Avatar>
        )}

        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <Loader2 className="h-6 w-6 animate-spin text-white" />
          </div>
        )}

        {!disabled && !isUploading && (
          <div
            className={cn(
              "absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100",
            )}
          >
            <Camera className={cn("text-white", iconSizeClasses[size])} />
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileSelect}
        disabled={disabled || isUploading}
      />

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleClick}
          disabled={disabled || isUploading}
        >
          <Camera className="mr-2 h-3.5 w-3.5" />
          {value ? "Trocar foto" : "Adicionar foto"}
        </Button>
        {value && !disabled && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleRemove}
            disabled={isUploading}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="mr-2 h-3.5 w-3.5" />
            Remover
          </Button>
        )}
      </div>
    </div>
  );
}
