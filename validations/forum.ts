import { z } from "zod";

export const forumQuestionSchema = z.object({
  title: z.string().min(1, "El título es obligatorio"),
  content: z.string().min(1, "El contenido es obligatorio"),
});

export const forumAnswerSchema = z.object({
  content: z.string().min(1, "El contenido es obligatorio"),
});
