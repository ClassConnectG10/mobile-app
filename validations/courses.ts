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

export const courseDetailsUpdateSchema = z
  .object({
    title: z.string().min(1, "El título es obligatorio"),
    description: z.string().min(1, "La descripción es obligatoria"),
    maxNumberOfStudents: z
      .number()
      .min(1, "La cantidad máxima de estudiantes es obligatoria")
      .max(100, "La cantidad máxima de estudiantes debe ser menor a 100"),
    startDate: z.date({
      required_error: "La fecha de inicio es obligatoria",
      invalid_type_error: "La fecha de inicio es obligatoria",
    }),
    endDate: z.date({
      required_error: "La fecha de fin es obligatoria",
      invalid_type_error: "La fecha de fin es obligatoria",
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

// Genera un esquema de validación para una nota (mark) y un comentario (comment)
export const markAndCommentSchema = z
  .object({
    mark: z
      .number({
        required_error: "La nota es obligatoria",
        invalid_type_error: "La nota debe ser un número",
      })
      .min(0, "La nota debe ser mayor o igual a 0")
      .max(10, "La nota debe ser menor o igual a 10"),
    comment: z.string({
      required_error: "El comentario es obligatorio",
      invalid_type_error: "El comentario debe ser un texto",
    }),
  })
  .refine((data) => data.mark >= 0 && data.mark <= 10, {
    message: "La nota debe estar entre 0 y 10",
  });
