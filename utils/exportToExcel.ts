import XLSX from "xlsx";
import { viewDocument } from "@react-native-documents/viewer";
import * as FileSystem from "expo-file-system";

export type ExcelSheet = {
  sheetName: string;
  table: Record<string, any>[];
};

/**
 * Exporta hojas de datos a un archivo Excel
 * @param sheets - Array de hojas con nombre y datos
 * @param fileName - Nombre del archivo (sin extensión)
 * @returns Promise<string> - Ruta completa del archivo creado
 */
export async function exportToExcel(
  sheets: ExcelSheet[],
  fileName: string,
): Promise<string> {
  if (sheets.length === 0) {
    throw new Error("No hay hojas para exportar.");
  }

  const wb = XLSX.utils.book_new();

  for (const hoja of sheets) {
    if (!hoja.table || hoja.table.length === 0) {
      console.warn(`Hoja "${hoja.sheetName}" sin datos para exportar.`);
      continue;
    }

    // Convertir a hoja desde JSON
    const ws = XLSX.utils.json_to_sheet(hoja.table, {
      header: Object.keys(hoja.table[0]),
    });

    // Agregar hoja al libro
    XLSX.utils.book_append_sheet(wb, ws, hoja.sheetName);
  }

  const wbout = XLSX.write(wb, { type: "base64", bookType: "xlsx" });
  const filePath = `${FileSystem.documentDirectory}${fileName}.xlsx`;

  try {
    await FileSystem.writeAsStringAsync(filePath, wbout, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return filePath;
  } catch (err) {
    console.error("Error al exportar el archivo:", err);
    throw new Error("No se pudo exportar el archivo.");
  }
}

/**
 * Abre un archivo Excel utilizando el visor de documentos
 * @param filePath - Ruta completa del archivo a abrir
 */
export async function openExcelFile(filePath: string): Promise<void> {
  try {
    await viewDocument({
      uri: filePath,
      mimeType:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      headerTitle: "Exportación",
    });
  } catch (err) {
    console.error("Error al abrir el archivo:", err);
    throw new Error("No se pudo abrir el archivo.");
  }
}
