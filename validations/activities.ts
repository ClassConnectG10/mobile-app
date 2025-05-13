import { z } from "zod";

export const activityDetailsSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  instruction: z.string().min(1, "Instruction is required"),
  dueDate: z.date().refine((date) => date > new Date(), {
    message: "Due date must be in the future",
  }),
});

export const activityDetailsSchemaUpdate = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  instruction: z.string().min(1, "Instruction is required"),
  dueDate: z.date(),
});
