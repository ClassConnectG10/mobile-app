import { File } from "@/types/file";

/**
 * Tipos MIME permitidos para la autocorrección
 */
export const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'text/plain',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

/**
 * Valida si un archivo tiene un tipo MIME permitido para autocorrección
 * @param file - El archivo a validar
 * @returns true si el archivo tiene un tipo MIME permitido, false en caso contrario
 */
export function isFileTypeAllowed(file: File | null | undefined): boolean {
  if (!file || !file.type) {
    return false;
  }
  
  return ALLOWED_MIME_TYPES.includes(file.type);
}

/**
 * Obtiene el tipo de archivo en formato legible
 * @param file - El archivo del cual obtener el tipo
 * @returns El tipo de archivo en formato legible o "desconocido" si no se puede determinar
 */
export function getFileTypeDisplay(file: File | null | undefined): string {
  if (!file || !file.type) {
    return "desconocido";
  }
  
  switch (file.type) {
    case 'application/pdf':
      return 'PDF';
    case 'text/plain':
      return 'TXT';
    case 'application/msword':
      return 'DOC';
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      return 'DOCX';
    default:
      return "desconocido";
  }
}

/**
 * Valida si tanto el archivo de instrucciones como el archivo de respuesta del estudiante
 * son válidos para la autocorrección
 * @param instructionsFile - Archivo de instrucciones del docente
 * @param responseFile - Archivo de respuesta del estudiante
 * @returns Objeto con el resultado de la validación y mensaje de error si aplica
 */
export function validateFilesForAutocorrection(
  instructionsFile: File | null | undefined,
  responseFile: File | null | undefined
): { isValid: boolean; errorMessage?: string } {
  // Verificar que ambos archivos existan
  if (!instructionsFile) {
    return {
      isValid: false,
      errorMessage: "No se encontró el archivo de instrucciones del docente. La autocorrección requiere que el docente haya subido un archivo de instrucciones."
    };
  }
  
  if (!responseFile) {
    return {
      isValid: false,
      errorMessage: "No se encontró el archivo de respuesta del estudiante. La autocorrección requiere que el estudiante haya entregado un archivo."
    };
  }
  
  // Verificar que el archivo de instrucciones tenga un formato válido
  if (!isFileTypeAllowed(instructionsFile)) {
    return {
      isValid: false,
      errorMessage: `El archivo de instrucciones del docente no es válido. Solo se permiten archivos PDF, TXT, DOC y DOCX.`
    };
  }
  
  // Verificar que el archivo de respuesta tenga un formato válido
  if (!isFileTypeAllowed(responseFile)) {
    return {
      isValid: false,
      errorMessage: `El archivo de respuesta del estudiante no es válido. Solo se permiten archivos PDF, TXT, DOC y DOCX.`
    };
  }
  
  return { isValid: true };
}
