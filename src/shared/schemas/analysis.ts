import { z } from "zod";

export const createAnalysisSchema = z.object({
  title: z.string().min(2, "Título deve ter pelo menos 2 caracteres"),
  description: z.string().optional(),
  visitDate: z.string().min(1, "Data da análise é obrigatória"),
  clientId: z.string().min(1, "Cliente é obrigatório"),
});

export const updateAnalysisSchema = z.object({
  id: z.string(),
  title: z.string().min(2, "Título deve ter pelo menos 2 caracteres"),
  description: z.string().optional(),
  visitDate: z.string().min(1, "Data da análise é obrigatória"),
});

export type CreateAnalysisInput = z.infer<typeof createAnalysisSchema>;
export type UpdateAnalysisInput = z.infer<typeof updateAnalysisSchema>;
