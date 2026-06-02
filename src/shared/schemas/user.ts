import { z } from "zod";

const emptyToNullPhone = z
  .union([z.string(), z.null(), z.undefined()])
  .transform((v) => {
    if (typeof v !== "string") return v;
    const trimmed = v.trim();
    if (trimmed.length === 0) return null;
    if (!/^[\d\s()+()-]+$/.test(trimmed)) {
      throw new Error("Telefone inválido");
    }
    return trimmed;
  });

const emptyToNullText = z
  .union([z.string(), z.null(), z.undefined()])
  .transform((v) => {
    if (typeof v !== "string") return v;
    const trimmed = v.trim();
    if (trimmed.length === 0) return null;
    if (trimmed.length > 160) {
      throw new Error("Máximo de 160 caracteres");
    }
    return trimmed;
  });

const emptyToNullLongText = z
  .union([z.string(), z.null(), z.undefined()])
  .transform((v) => {
    if (typeof v !== "string") return v;
    const trimmed = v.trim();
    if (trimmed.length === 0) return null;
    if (trimmed.length > 500) {
      throw new Error("Máximo de 500 caracteres");
    }
    return trimmed;
  });

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2, "Nome deve ter pelo menos 2 caracteres"),
  phone: emptyToNullPhone.nullable().optional(),
  company: emptyToNullText.nullable().optional(),
  bio: emptyToNullLongText.nullable().optional(),
  image: z.string().url().nullable().optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
