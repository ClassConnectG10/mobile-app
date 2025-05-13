import { ZodError } from "zod";

export function handleError(error: any, action: string): Error {
  if (error instanceof ZodError) {
    return new Error(
      `Error de validacion al ${action}: ${error.errors
        .map((e) => e.message)
        .join(", ")}`
    );
  }
  return new Error(`Error al ${action}: ${error}`);
}
