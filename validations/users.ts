import { z } from "zod";
import { countries } from "../utils/constants/countries";

export const loginSchema = z.object({
  email: z.string().email("Dirección de correo electrónico inválida"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
});

export const registerSchema = z
  .object({
    email: z
      .string()
      .email("Dirección de correo electrónico inválida")
      .nonempty("El correo electrónico es obligatorio"),
    password: z
      .string()
      .min(8, "La contraseña debe tener al menos 8 caracteres")
      .regex(/[a-zA-Z]/, "La contraseña debe contener al menos una letra")
      .regex(/[0-9]/, "La contraseña debe contener al menos un número")
      .regex(
        /[@$!%*?&]/,
        "La contraseña debe contener al menos un carácter especial"
      ),
    confirmPassword: z
      .string()
      .nonempty("La confirmación de contraseña es obligatoria"),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        path: ["confirmPassword"],
        code: z.ZodIssueCode.custom,
        message: "Las contraseñas no coinciden",
      });
    }
  });

export const userDetailsSchema = z.object({
  firstName: z
    .string()
    .nonempty("El nombre es obligatorio")
    .min(2, "El nombre debe tener al menos 2 caracteres"),
  lastName: z
    .string()
    .nonempty("El apellido es obligatorio")
    .min(2, "El apellido debe tener al menos 2 caracteres"),
  country: z
    .string()
    .nonempty("El país es obligatorio")
    .min(2, "El país debe tener al menos 2 caracteres")
    .refine((val) => countries.includes(val), {
      message: "Nombre de país inválido",
    }),
});

export const userSchema = z.object({
  id: z.number(),
  userInformation: userDetailsSchema,
});
