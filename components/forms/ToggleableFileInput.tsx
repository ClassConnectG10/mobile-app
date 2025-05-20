import { File } from "@/types/file";
import { pick } from "@react-native-documents/picker";
import { viewDocument } from "@react-native-documents/viewer";
import { Pressable, View } from "react-native";
// import { storage } from "@/firebase"; // tu instancia de Firebase Storage
import {
  Button,
  Card,
  Icon,
  IconButton,
  Text,
  useTheme,
} from "react-native-paper";

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

  const downLoadFile = async (file: File) => {
    // TODO: set the localUrl
  };

  const viewFile = async (file: File) => {
    if (!file.localUrl) {
      if (file.firebaseUrl) {
        await downLoadFile(file);
      } else {
        return;
      }
    }

    await viewDocument({ uri: file.localUrl, mimeType: file.fileType });
  };

  const pickFile = async () => {
    try {
      const results = await pick();
      if (results && results.length > 0) {
        const newFiles = results.map(
          (result: any) => new File(result.name, result.type, result.uri)
        );
        if (maxFiles && files.length + newFiles.length > maxFiles) {
          newFiles.splice(
            maxFiles - files.length,
            newFiles.length - (files.length + newFiles.length - maxFiles)
          );
        }
        onChange([...files, ...newFiles]);
      }
    } catch (err) {
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
        <Pressable key={index} onPress={() => viewFile(file)}>
          <Card
            style={{
              paddingHorizontal: 10,
              paddingVertical: 5,
              borderRadius: 8,
              elevation: 1,
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
                source={iconByType(file.fileType)}
                size={24}
                color={theme.colors.primary}
              />

              <View style={{ flex: 1 }}>
                <Text numberOfLines={1}>{file.fileName}</Text>
              </View>
              {editable && (
                <IconButton
                  size={24}
                  style={{ margin: 0 }}
                  icon="trash-can"
                  onPress={() => deleteFile(file)}
                />
              )}

              {/* <IconButton icon="View" onPress={() => viewFile(file)} /> */}
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
