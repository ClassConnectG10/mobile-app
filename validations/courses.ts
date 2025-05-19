import {
  CATEGORIES,
  LEVELS,
  MODALITIES,
} from "@/utils/constants/courseDetails";
import { z } from "zod";

export const courseDetailsSchema = z
  .object({
    title: z.string().min(1, "El título es obligatorio"),
    description: z.string().min(1, "La descripción es obligatoria"),
    maxNumberOfStudents: z
      .number()
      .min(1, "La cantidad máxima de estudiantes es obligatoria")
      .max(100, "La cantidad máxima de estudiantes debe ser menor a 100"),
    startDate: z
      .date()
      .refine((date) => date >= new Date(new Date().setHours(0, 0, 0, 0)), {
        message: "La fecha de inicio debe ser hoy o en el futuro",
      }),
    endDate: z
      .date()
      .refine((date) => date > new Date(new Date().setHours(0, 0, 0, 0)), {
        message: "La fecha de finalización debe ser hoy o en el futuro",
      }),
    level: z
      .string()
      .nonempty("El nivel es obligatorio")
      .refine((val) => LEVELS.hasBackValue(val), {
        message: "Nivel inválido",
      }),
    modality: z
      .string()
      .nonempty("La modalidad es obligatoria")
      .refine((val) => MODALITIES.hasBackValue(val), {
        message: "Modalidad inválida",
      }),
    category: z
      .string()
      .nonempty("La categoría es obligatoria")
      .refine((val) => CATEGORIES.hasBackValue(val), {
        message: "Categoría inválida",
      }),
    dependencies: z.array(z.string().uuid()),
  })
  .refine((data) => data.startDate <= data.endDate, {
    message: "La fecha de inicio debe ser anterior a la fecha de finalización",
  });

export const courseModuleSchema = z.object({
  title: z.string().min(1, "El título es obligatorio"),
  description: z.string().min(1, "La descripción es obligatoria"),
});
