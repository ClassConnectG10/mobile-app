import { AxiosInstance } from "axios";
import { ZodError } from "zod";
import { File } from "@/types/file";
import Blob from "react-native/Libraries/Blob/Blob";

export function handleError(error: any, action: string): Error {
  if (error instanceof ZodError) {
    return new Error(
      `Error de validacion al ${action}: ${error.errors[0].message}`
    );
  }
  return new Error(`Error al ${action}: ${error}`);
}

export function postFile(
  axiosInstance: AxiosInstance,
  uri: string,
  file: File
): Promise<any> {
  const formData = new FormData();
  formData.append("file", {
    uri: file.localUri,
    name: file.name,
    type: file.type,
  } as any);

  return axiosInstance.post(uri, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}
