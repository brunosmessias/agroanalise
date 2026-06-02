import { z } from "zod";

const emptyToNull = z
  .union([z.string(), z.null(), z.undefined()])
  .transform((v) => (typeof v === "string" ? v.trim() || null : v));

const emptyToNullEmail = z
  .union([z.string(), z.null(), z.undefined()])
  .transform((v) => {
    if (typeof v !== "string") return v;
    const trimmed = v.trim();
    if (trimmed.length === 0) return null;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      throw new Error("Email inválido");
    }
    return trimmed;
  });

const emptyToNullDocument = z
  .union([z.string(), z.null(), z.undefined()])
  .transform((v) => {
    if (typeof v !== "string") return v;
    const trimmed = v.trim();
    if (trimmed.length === 0) return null;
    if (!/^[\d./-]+$/.test(trimmed)) {
      throw new Error("Documento inválido (use apenas números, pontos, barras e hífens)");
    }
    return trimmed;
  });

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
    if (trimmed.length > 120) {
      throw new Error("Máximo de 120 caracteres");
    }
    return trimmed;
  });

const emptyToNullLongText = z
  .union([z.string(), z.null(), z.undefined()])
  .transform((v) => {
    if (typeof v !== "string") return v;
    const trimmed = v.trim();
    if (trimmed.length === 0) return null;
    if (trimmed.length > 2000) {
      throw new Error("Máximo de 2000 caracteres");
    }
    return trimmed;
  });

export const createClientSchema = z.object({
  name: z.string().trim().min(2, "Nome deve ter pelo menos 2 caracteres"),
  document: emptyToNullDocument.nullable().optional(),
  email: emptyToNullEmail.nullable().optional(),
  phone: emptyToNullPhone.nullable().optional(),
  address: emptyToNullText.nullable().optional(),
  city: emptyToNullText.nullable().optional(),
  state: emptyToNullText.nullable().optional(),
  notes: emptyToNullLongText.nullable().optional(),
  image: z.string().url().nullable().optional(),
});

export const updateClientSchema = z.object({
  id: z.string(),
  name: z.string().trim().min(2, "Nome deve ter pelo menos 2 caracteres"),
  document: emptyToNullDocument.nullable().optional(),
  email: emptyToNullEmail.nullable().optional(),
  phone: emptyToNullPhone.nullable().optional(),
  address: emptyToNullText.nullable().optional(),
  city: emptyToNullText.nullable().optional(),
  state: emptyToNullText.nullable().optional(),
  notes: emptyToNullLongText.nullable().optional(),
  image: z.string().url().nullable().optional(),
});

export type CreateClientInput = z.infer<typeof createClientSchema>;
export type UpdateClientInput = z.infer<typeof updateClientSchema>;
