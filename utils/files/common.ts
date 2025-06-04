import { viewDocument, errorCodes } from "@react-native-documents/viewer";
import { File } from "@/types/file";

/**
 * Abre un archivo Excel utilizando el visor de documentos
 * @param file - El archivo a abrir
 */
export async function openFile(file: File): Promise<void> {
  try {
    await viewDocument({
      uri: file.localUri,
      mimeType: file.type,
    });
  } catch (err) {
    if (err.code === errorCodes.UNABLE_TO_OPEN_FILE_TYPE) {
      throw new Error(
        "No hay una aplicación compatible para abrir este archivo."
      );
    }

    throw new Error("No se pudo abrir el archivo.");
  }
}
