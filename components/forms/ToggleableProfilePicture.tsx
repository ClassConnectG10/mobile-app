import React, { useEffect } from "react";
import { Text, View, StyleSheet, Image } from "react-native";
import {
  Avatar,
  IconButton,
  ActivityIndicator,
  useTheme,
} from "react-native-paper";
import { errorCodes, pick } from "@react-native-documents/picker";
import { File } from "@/types/file";
import { getStorage } from "@react-native-firebase/storage";
import { documentDirectory, downloadAsync } from "expo-file-system";
import { FullScreenModal } from "@/components/FullScreenModal";

interface ToggleableProfilePictureProps {
  file: File | null;
  setFile?: (file: File | null) => void;
  editable?: boolean;
  size?: number;
}

export const ToggleableProfilePicture: React.FC<
  ToggleableProfilePictureProps
> = ({
  file: initialFile,
  setFile: setInitialFile = () => {},
  editable = false,
  size = 96,
}) => {
  const theme = useTheme();

  const [isLoading, setIsLoading] = React.useState(false);
  const [isModalVisible, setIsModalVisible] = React.useState(false);
  const [file, setFile] = React.useState<File | null>(null);
  const [isDisabled, setIsDisabled] = React.useState(false);

  const setFileAndInitialFile = (newFile: File | null) => {
    setFile(newFile);
    setInitialFile(newFile);
  };

  const pickImage = async () => {
    if (isDisabled) return;

    setIsDisabled(true);
    try {
      const results = await pick({
        type: "image/*",
        multiple: false,
        allowEditing: true,
        mediaType: "photo",
      });
      if (!results || results.length === 0) {
        return;
      }

      const newFile = results.map(
        (result: any) => new File(result.name, result.type, result.uri)
      )[0];

      setFileAndInitialFile(newFile);
    } catch (err) {
      if (err.code && err.code === errorCodes.OPERATION_CANCELED) {
        return; // El usuario canceló la selección
      }

      console.error("Error al seleccionar documento:", err);
    } finally {
      setIsDisabled(false);
    }
  };

  const removeImage = () => {
    setFileAndInitialFile(null);
  };

  const downloadImage = async () => {
    if (!file || file.localUri || !file.firebaseUrl) return;
    setIsLoading(true);

    try {
      const firebaseRef = getStorage().ref(file.firebaseUrl);
      const firebaseUri = await firebaseRef.getDownloadURL();

      const localUri = documentDirectory + file.name;
      const downloaded = await downloadAsync(firebaseUri, localUri);

      setFileAndInitialFile({ ...file, localUri: downloaded.uri });
    } catch (err) {
      console.error("Error al descargar la imagen desde Firebase:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setFile(initialFile);
  }, [initialFile]);

  useEffect(() => {
    downloadImage();
  }, [file]);

  const openImageModal = () => {
    setIsModalVisible(true);
  };

  const closeImageModal = () => {
    setIsModalVisible(false);
  };

  return (
    <View style={styles.container}>
      {isLoading ? (
        <View
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: theme.colors.primary,
          }}
        >
          <ActivityIndicator
            animating={true}
            size="small"
            color={theme.colors.onPrimary}
          />
        </View>
      ) : file ? (
        <Avatar.Image
          size={size}
          source={{ uri: file.localUri }}
          onTouchEnd={() => {
            if (file.localUri) {
              openImageModal();
            }
          }}
        />
      ) : (
        <Avatar.Icon
          size={size}
          icon="account"
          onTouchEnd={() => {
            if (editable && !isDisabled) {
              pickImage();
            }
          }}
        />
      )}

      {editable && (
        <IconButton
          icon="plus"
          mode="contained"
          size={size / 6}
          style={styles.plusIcon}
          onPress={pickImage}
          disabled={isDisabled}
        />
      )}

      {editable && file && (
        <IconButton
          icon="delete"
          mode="contained"
          size={size / 6}
          style={styles.trashIcon}
          onPress={removeImage}
          disabled={isDisabled}
        />
      )}

      {isModalVisible && file && (
        <FullScreenModal visible={isModalVisible} onDismiss={closeImageModal}>
          <Image
            style={{ width: 300, height: 300 }} // Tamaño fijo para el modal
            source={{ uri: file.localUri }}
          />
        </FullScreenModal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignSelf: "flex-start", // Ajusta el ancho del View al contenido
  },
  plusIcon: {
    position: "absolute",
    bottom: 0,
    right: 0,
    margin: 0,
  },
  trashIcon: {
    position: "absolute",
    top: 0,
    right: 0,
    margin: 0,
  },
});
