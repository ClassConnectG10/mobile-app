import { File } from "@/types/file";
import { pick } from "@react-native-documents/picker";
import { viewDocument } from "@react-native-documents/viewer";
import { Pressable, View } from "react-native";
// import { storage } from "@/firebase"; // tu instancia de Firebase Storage
import { Button, Icon, IconButton, Text } from "react-native-paper";

interface ToggleableFileInputProps {
  // label: string;
  files: File[];
  editable?: boolean;
  onChange: (files: File[]) => void;
  maxFiles?: number;
}

const iconByType = (type: string) => {
  // use Material Design Icons
  switch (type) {
    case "application/pdf":
      return "file-pdf-box";
    case "image/jpeg":
      return "image";
    case "image/png":
      return "image";
    case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      return "file-word";
    case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
      return "file-excel";
    default:
      return "file";
  }
};

export const ToggleableFileInput: React.FC<ToggleableFileInputProps> = ({
  // label,
  files,
  editable = true,
  onChange,
  maxFiles,
}) => {
  const downLoadFile = async (file: File) => {
    // TODO
  };

  const viewFile = async (file: File) => {
    if (file.localUrl) {
      await viewDocument({ uri: file.localUrl, mimeType: file.fileType });
    } else if (file.firebaseUrl) {
      await downLoadFile(file);
      await viewDocument({ uri: file.firebaseUrl, mimeType: file.fileType });
    }
  };

  const pickFile = async () => {
    try {
      const results = await pick();
      if (results && results.length > 0) {
        const newFiles = results.map(
          (result: any) => new File(result.name, result.type, result.uri),
        );
        if (maxFiles && files.length + newFiles.length > maxFiles) {
          newFiles.splice(
            maxFiles - files.length,
            newFiles.length - (files.length + newFiles.length - maxFiles),
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
    <View>
      {files.map((file, index) => (
        <Pressable>
          <View key={index} style={{ flexDirection: "row", height: 50 }}>
            <Icon source={iconByType(file.fileType)} size={24} />
            <Text>{file.fileName}</Text>
            {editable && (
              <IconButton icon="Delete" onPress={() => deleteFile(file)} />
            )}
            <IconButton icon="View" onPress={() => viewFile(file)} />
          </View>
        </Pressable>
      ))}
      {editable && (
        <Button
          icon="Plus"
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
