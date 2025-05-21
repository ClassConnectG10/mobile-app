import { ActivityType, ExamItemType } from "@/types/activity";
import { z } from "zod";

export const activityDetailsSchema = z.object({
  title: z.string().min(1, "El título es requerido"),
  instructions: z.string().min(1, "La instrucción es requerida"),
  dueDate: z.date().refine((date) => date > new Date(), {
    message: "La fecha de entrega debe ser en el futuro",
  }),
  moduleId: z
    .number({
      required_error: "El módulo es requerido",
      invalid_type_error: "El módulo es requerido",
    })
    .int("El módulo debe ser un número entero"),
});

export const activityDetailsSchemaUpdate = z.object({
  title: z.string().min(1, "El título es requerido"),
  instructions: z.string().min(1, "La instrucción es requerida"),
  dueDate: z.date({ required_error: "La fecha de entrega es requerida" }),
});

const openQuestionSchema = z.object({
  type: z.literal(ExamItemType.OPEN),
  question: z.string().min(1, "La pregunta es requerida"),
  suggestedAnswer: z.string().min(1, "La respuesta sugerida es requerida"),
});

const multipleChoiceSchema = z.object({
  type: z.literal(ExamItemType.MULTIPLE_CHOICE),
  question: z.string().min(1, "La pregunta es requerida"),
  options: z
    .array(z.string().min(1, "La opción no puede estar vacía"))
    .min(2, "Debe haber al menos dos opciones"),
  correctAnswer: z
    .number({ required_error: "Debe seleccionar una opción correcta" })
    .int("La respuesta correcta debe ser un número entero")
    .min(0, "Debe seleccionar una opción correcta"),
});

const trueFalseSchema = z.object({
  type: z.literal(ExamItemType.TRUE_FALSE),
  question: z.string().min(1, "La pregunta es requerida"),
  correctAnswer: z.boolean({
    required_error: "Debe indicar la respuesta correcta",
    invalid_type_error: "La respuesta correcta debe ser verdadero o falso",
  }),
});

const multipleSelectSchema = z.object({
  type: z.literal(ExamItemType.MULTIPLE_SELECT),
  question: z.string().min(1, "La pregunta es requerida"),
  options: z
    .array(z.string().min(1, "La opción no puede estar vacía"))
    .min(2, "Debe haber al menos dos opciones"),
  correctAnswers: z
    .array(
      z
        .number({ required_error: "Debe seleccionar una opción correcta" })
        .int("La respuesta correcta debe ser un número entero")
        .min(0, "Debe seleccionar una opción correcta")
    )
    .min(1, "Debe seleccionar al menos una opción correcta"),
});

const examItemSchema = z.discriminatedUnion("type", [
  openQuestionSchema,
  multipleChoiceSchema,
  trueFalseSchema,
  multipleSelectSchema,
]);

export const examDetailsSchema = z.object({
  title: z.string().min(1, "El título es requerido"),
  instructions: z.string().min(1, "La instrucción es requerida"),
  dueDate: z.date({
    required_error: "La fecha de entrega es requerida",
    invalid_type_error: "La fecha de entrega es requerida",
  }),
  moduleId: z
    .number({ required_error: "El módulo es requerido" })
    .int("El módulo debe ser un número entero"),
  examItems: z
    .array(examItemSchema)
    .min(1, "Se requiere al menos un ítem de examen"),
});

const openAnswerSchema = z.object({
  type: z.literal(ExamItemType.OPEN),
  answer: z.string(),
});

const multipleChoiceAnswerSchema = z.object({
  type: z.literal(ExamItemType.MULTIPLE_CHOICE),
  answer: z.number(),
});

const trueFalseAnswerSchema = z.object({
  type: z.literal(ExamItemType.TRUE_FALSE),
  answer: z.boolean(),
});

const multipleSelectAnswerSchema = z.object({
  type: z.literal(ExamItemType.MULTIPLE_SELECT),
  answers: z.array(z.number()).min(1, "Debe seleccionar al menos una opción"),
});

export const examItemAnswerSchema = z.discriminatedUnion("type", [
  openAnswerSchema,
  multipleChoiceAnswerSchema,
  trueFalseAnswerSchema,
  multipleSelectAnswerSchema,
]);

export const submittedExamItemSchema = z.object({
  questionIndex: z.number().int().min(0, "Índice de pregunta inválido"),
  type: z.nativeEnum(ExamItemType),
  answer: examItemAnswerSchema,
  correct: z.boolean().optional(),
});

// export const examSubmissionSchema = z.object({
//   resourceId: z.number({ required_error: "El examen es requerido" }).int(),
//   type: z.nativeEnum(ActivityType),
//   studentId: z.number({ required_error: "El estudiante es requerido" }).int(),
//   submittedExamItems: z
//     .array(submittedExamItemSchema)
//     .min(1, "Debe haber al menos una respuesta"),
//   submited: z.boolean(),
//   dueDate: z.date(),
//   submissionDate: z.date().optional().nullable(),
// });
