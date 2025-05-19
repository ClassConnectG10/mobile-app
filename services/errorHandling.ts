import { ZodError } from "zod";

export function handleError(error: any, action: string): Error {
  if (error instanceof ZodError) {
    return new Error(
      `Error de validacion al ${action}: ${error.errors[0].message}`
    );
  }
  return new Error(`Error al ${action}: ${error}`);
}
