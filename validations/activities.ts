import { ExamItemType } from "@/types/activity";
import { z } from "zod";

export const activityDetailsSchema = z.object({
  title: z
    .string({
      required_error: "El título es requerido",
      invalid_type_error: "El título es requerido",
    })
    .min(1, "El título es requerido"),
  instructions: z
    .string({
      required_error: "La instrucción es requerida",
      invalid_type_error: "La instrucción es requerida",
    })
    .min(1, "La instrucción es requerida"),
  dueDate: z
    .date({
      required_error: "La fecha de entrega es requerida",
      invalid_type_error: "La fecha de entrega debe ser una fecha válida",
    })
    .refine((date) => date > new Date(), {
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
  title: z
    .string({
      required_error: "El título es requerido",
      invalid_type_error: "El título es requerido",
    })
    .min(1, "El título es requerido"),
  instructions: z
    .string({
      required_error: "La instrucción es requerida",
      invalid_type_error: "La instrucción es requerida",
    })
    .min(1, "La instrucción es requerida"),
  dueDate: z.date({
    required_error: "La fecha de entrega es requerida",
    invalid_type_error: "La fecha de entrega debe ser una fecha válida",
  }),
});

const openQuestionSchema = z.object({
  type: z.literal(ExamItemType.OPEN, {
    required_error: "El tipo de pregunta es requerido",
    invalid_type_error: "El tipo de pregunta es inválido",
  }),
  question: z
    .string({
      required_error: "La pregunta es requerida",
      invalid_type_error: "La pregunta es requerida",
    })
    .min(1, "La pregunta es requerida"),
  suggestedAnswer: z
    .string({
      required_error: "La respuesta sugerida es requerida",
      invalid_type_error: "La respuesta sugerida es requerida",
    })
    .min(1, "La respuesta sugerida es requerida"),
});

const multipleChoiceSchema = z.object({
  type: z.literal(ExamItemType.MULTIPLE_CHOICE, {
    required_error: "El tipo de pregunta es requerido",
    invalid_type_error: "El tipo de pregunta es inválido",
  }),
  question: z
    .string({
      required_error: "La pregunta es requerida",
      invalid_type_error: "La pregunta es requerida",
    })
    .min(1, "La pregunta es requerida"),
  options: z
    .array(
      z
        .string({
          required_error: "La opción es requerida",
          invalid_type_error: "La opción debe ser un texto",
        })
        .min(1, "La opción no puede estar vacía")
    )
    .min(2, "Debe haber al menos dos opciones"),
  correctAnswer: z
    .number({
      required_error: "Debe seleccionar una opción correcta",
      invalid_type_error: "La respuesta correcta debe ser un número",
    })
    .int("La respuesta correcta debe ser un número entero")
    .min(0, "Debe seleccionar una opción correcta"),
});

const trueFalseSchema = z.object({
  type: z.literal(ExamItemType.TRUE_FALSE, {
    required_error: "El tipo de pregunta es requerido",
    invalid_type_error: "El tipo de pregunta es inválido",
  }),
  question: z
    .string({
      required_error: "La pregunta es requerida",
      invalid_type_error: "La pregunta es requerida",
    })
    .min(1, "La pregunta es requerida"),
  correctAnswer: z.boolean({
    required_error: "Debe indicar la respuesta correcta",
    invalid_type_error: "La respuesta correcta debe ser verdadero o falso",
  }),
});

const multipleSelectSchema = z.object({
  type: z.literal(ExamItemType.MULTIPLE_SELECT, {
    required_error: "El tipo de pregunta es requerido",
    invalid_type_error: "El tipo de pregunta es inválido",
  }),
  question: z
    .string({
      required_error: "La pregunta es requerida",
      invalid_type_error: "La pregunta es requerida",
    })
    .min(1, "La pregunta es requerida"),
  options: z
    .array(
      z
        .string({
          required_error: "La opción es requerida",
          invalid_type_error: "La opción debe ser un texto",
        })
        .min(1, "La opción no puede estar vacía")
    )
    .min(2, "Debe haber al menos dos opciones"),
  correctAnswers: z
    .array(
      z
        .number({
          required_error: "Debe seleccionar una opción correcta",
          invalid_type_error: "La respuesta correcta debe ser un número",
        })
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
  title: z
    .string({
      required_error: "El título es requerido",
      invalid_type_error: "El título es requerido",
    })
    .min(1, "El título es requerido"),
  instructions: z
    .string({
      required_error: "La instrucción es requerida",
      invalid_type_error: "La instrucción es requerida",
    })
    .min(1, "La instrucción es requerida"),
  dueDate: z.date({
    required_error: "La fecha de entrega es requerida",
    invalid_type_error: "La fecha de entrega debe ser una fecha válida",
  }),
  moduleId: z
    .number({
      required_error: "El módulo es requerido",
      invalid_type_error: "El módulo es requerido",
    })
    .int("El módulo debe ser un número entero"),
  examItems: z
    .array(examItemSchema)
    .min(1, "Se requiere al menos un ítem de examen"),
});

const openAnswerSchema = z.object({
  type: z.literal(ExamItemType.OPEN, {
    required_error: "El tipo de pregunta es requerido",
    invalid_type_error: "El tipo de pregunta es inválido",
  }),
  answer: z
    .string({
      required_error: "Faltan preguntas por responder",
      invalid_type_error: "Faltan preguntas por responder",
    })
    .min(1, "Faltan preguntas por responder"),
});

const multipleChoiceAnswerSchema = z.object({
  type: z.literal(ExamItemType.MULTIPLE_CHOICE, {
    required_error: "El tipo de pregunta es requerido",
    invalid_type_error: "El tipo de pregunta es inválido",
  }),
  answer: z.number({
    required_error: "Faltan preguntas por responder",
    invalid_type_error: "Faltan preguntas por responder",
  }),
});

const trueFalseAnswerSchema = z.object({
  type: z.literal(ExamItemType.TRUE_FALSE, {
    required_error: "El tipo de pregunta es requerido",
    invalid_type_error: "El tipo de pregunta es inválido",
  }),
  answer: z.boolean({
    required_error: "Faltan preguntas por responder",
    invalid_type_error: "Faltan preguntas por responder",
  }),
});

const multipleSelectAnswerSchema = z.object({
  type: z.literal(ExamItemType.MULTIPLE_SELECT, {
    required_error: "El tipo de pregunta es requerido",
    invalid_type_error: "El tipo de pregunta es inválido",
  }),
  answers: z
    .array(
      z.number({
        required_error: "Faltan preguntas por responder",
        invalid_type_error: "Faltan preguntas por responder",
      })
    )
    .min(1, "Faltan preguntas por responder"),
});

export const examItemAnswerSchema = z.discriminatedUnion("type", [
  openAnswerSchema,
  multipleChoiceAnswerSchema,
  trueFalseAnswerSchema,
  multipleSelectAnswerSchema,
]);

export const submittedExamItemSchema = z.object({
  questionIndex: z
    .number({
      required_error: "El índice de la pregunta es requerido",
      invalid_type_error: "El índice de la pregunta debe ser un número",
    })
    .int()
    .min(0, "Índice de pregunta inválido"),
  type: z.nativeEnum(ExamItemType, {
    required_error: "El tipo de pregunta es requerido",
    invalid_type_error: "El tipo de pregunta es inválido",
  }),
  answer: examItemAnswerSchema,
});

export const taskGradeSchema = z.object({
  mark: z
    .number({
      required_error: "La nota es requerida",
      invalid_type_error: "La nota debe ser un número valido",
    })
    .int()
    .min(0, "La nota debe estar entre 0 y 10")
    .max(10, "La nota debe estar entre 0 y 10"),
  feedback_message: z.string({
    required_error: "El comentario de retroalimentación es requerido",
    invalid_type_error: "El comentario de retroalimentacióndebe ser un texto",
  }),
});

export const examGradeSchema = z.object({
  mark: z
    .number({
      required_error: "La nota es requerida",
      invalid_type_error: "La nota debe ser un número valido",
    })
    .int()
    .min(0, "La nota debe estar entre 0 y 10")
    .max(10, "La nota debe estar entre 0 y 10"),
  feedback_message: z.string({
    required_error: "El comentario de retroalimentación es requerido",
    invalid_type_error: "El comentario de retroalimentacióndebe ser un texto",
  }),
  correctExamItems: z
    .array(z.boolean().nullable(), {
      required_error: "Debe indicar si las preguntas son correctas",
      invalid_type_error: "Debe indicar si las preguntas son correctas",
    })
    .refine((arr) => arr.every((val) => val !== null), {
      message:
        "Debe marcar si las respuestas de las preguntas abiertas son correctas",
    }),
});
