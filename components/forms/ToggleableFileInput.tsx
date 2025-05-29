import { File } from "@/types/file";
import { errorCodes, pick } from "@react-native-documents/picker";
import { viewDocument } from "@react-native-documents/viewer";
import { Pressable, View } from "react-native";
import { getStorage } from "@react-native-firebase/storage";
import { documentDirectory, downloadAsync } from "expo-file-system";

import {
  ActivityIndicator,
  Button,
  Card,
  Icon,
  IconButton,
  Text,
  useTheme,
} from "react-native-paper";
import React, { useState } from "react";

interface ToggleableFileInputProps {
  // label: string;
  files: File[];
  editable?: boolean;
  onChange: (files: File[]) => void;
  maxFiles?: number;
}

export const ToggleableFileInput: React.FC<ToggleableFileInputProps> = ({
  files,
  editable = true,
  onChange,
  maxFiles,
}) => {
  const theme = useTheme();
  const [loadingIndex, setLoadingIndex] = useState<number | null>(null);

  const viewFile = async (file: File) => {
    try {
      await viewDocument({
        uri: file.localUri,
        mimeType: file.type,
      });
    } catch (err) {
      console.error("Error al abrir el archivo:", err);
    }
  };

  const downloadAndOpenFile = async (index: number) => {
    try {
      setLoadingIndex(index);
      const file = files[index];

      const firebaseRef = getStorage().ref(file.firebaseUrl);
      const firebaseUri = await firebaseRef.getDownloadURL();

      const localUri = documentDirectory + file.name;
      const downloaded = await downloadAsync(firebaseUri, localUri);
      const newFile = {
        ...file,
        localUri: downloaded.uri,
      };
      const newFiles = [...files];
      newFiles[index] = newFile;

      onChange(newFiles);
      await viewFile(newFile);
    } catch (err) {
      console.error("Error al descargar el archivo:", err);
    } finally {
      setLoadingIndex(null);
    }
  };

  const openFile = async (index: number) => {
    try {
      const file = files[index];
      if (!file.localUri) {
        if (file.firebaseUrl) {
          await downloadAndOpenFile(index);
        } else {
          console.error(
            "No se puede abrir el archivo, no hay URI local ni URL de Firebase"
          );
        }
      } else {
        await viewFile(file);
      }
    } catch (err) {
      console.error("Error al abrir el archivo:", err);
    }
  };

  const pickFile = async () => {
    try {
      const results = await pick();
      if (!results || results.length === 0) {
        return;
      }

      const newFile = results.map(
        (result: any) => new File(result.name, result.type, result.uri)
      )[0];

      const newFiles = [...files, newFile];
      onChange(newFiles);
    } catch (err) {
      if (err.code && err.code === errorCodes.OPERATION_CANCELED) {
        return; // El usuario canceló la selección
      }

      console.error("Error al seleccionar documento:", err);
    }
  };

  const deleteFile = (file: File) => {
    const newFiles = files.filter((f) => f !== file);
    onChange(newFiles);
  };

  return (
    <View style={{ gap: 4 }}>
      {files.length === 0 && (
        <Text style={{ textAlign: "center" }}>No hay archivos adjuntos</Text>
      )}
      {files.map((file, index) => (
        <Pressable key={index} onPress={() => openFile(index)}>
          <Card
            style={{
              paddingHorizontal: 10,
              paddingVertical: 5,
              borderRadius: 8,
              elevation: 1,
              height: 50,
              justifyContent: "center",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
              }}
            >
              <Icon
                source={iconByType(file.type)}
                size={24}
                color={theme.colors.primary}
              />

              <View style={{ flex: 1 }}>
                <Text numberOfLines={1}>{file.name}</Text>
              </View>

              {/* Estado de descarga */}
              <View style={{ marginRight: editable ? 0 : 8 }}>
                {loadingIndex === index ? (
                  <ActivityIndicator size={24} />
                ) : file.localUri ? (
                  <Icon
                    source="cloud-check-outline"
                    size={24}
                    color={theme.colors.primary}
                  />
                ) : (
                  <Icon
                    source="cloud-outline"
                    size={24}
                    color={theme.colors.primary}
                  />
                )}
              </View>

              {editable && (
                <IconButton
                  size={24}
                  style={{ margin: 0 }}
                  icon="trash-can"
                  onPress={() => deleteFile(file)}
                />
              )}
            </View>
          </Card>
        </Pressable>
      ))}
      {editable && files.length < (maxFiles || Infinity) && (
        <Button
          icon="paperclip"
          mode="contained"
          onPress={pickFile}
          style={{ marginTop: 10 }}
        >
          Agregar adjunto
        </Button>
      )}
    </View>
  );
};

const iconByType = (type: string): string => {
  switch (type) {
    // PDF
    case "application/pdf":
      return "file-pdf-box";

    // Images
    case "image/jpeg":
    case "image/png":
    case "image/webp":
    case "image/gif":
    case "image/svg+xml":
      return "image";

    // Word documents
    case "application/msword":
    case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      return "file-word";

    // Excel spreadsheets
    case "application/vnd.ms-excel":
    case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
      return "file-excel";

    // PowerPoint presentations
    case "application/vnd.ms-powerpoint":
    case "application/vnd.openxmlformats-officedocument.presentationml.presentation":
      return "file-powerpoint";

    // Text files
    case "text/plain":
      return "file-document";

    // Compressed files
    case "application/zip":
    case "application/x-rar-compressed":
    case "application/x-7z-compressed":
    case "application/x-tar":
    case "application/gzip":
      return "folder-zip";

    // Audio files
    case "audio/mpeg":
    case "audio/wav":
    case "audio/ogg":
      return "music";

    // Video files
    case "video/mp4":
    case "video/x-msvideo":
    case "video/webm":
      return "video";

    // Default
    default:
      return "file";
  }
};
