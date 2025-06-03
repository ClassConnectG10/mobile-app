import { Portal, Dialog, Text, Button } from "react-native-paper";
import { View, StyleSheet, Dimensions } from "react-native";

interface AlertDialogProps {
  visible: boolean;
  onDismiss: () => void;
  onConfirm?: () => void;
  title?: string;
  content: string;
  dismissText: string;
  confirmText?: string;
}

export const AlertDialog: React.FC<AlertDialogProps> = ({
  visible,
  onDismiss,
  onConfirm,
  title = "Atención",
  content,
  dismissText,
  confirmText,
}) => {
  return (
    <Portal>
      {visible && (
        <View style={styles.fullScreenOverlay}>
          <Dialog visible={visible} onDismiss={onDismiss} style={styles.dialog}>
            <Dialog.Title>{title}</Dialog.Title>
            <Dialog.Content>
              <Text variant="bodyMedium">{content}</Text>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={onDismiss}>{dismissText}</Button>
              {confirmText && onConfirm && (
                <Button onPress={onConfirm}>{confirmText}</Button>
              )}
            </Dialog.Actions>
          </Dialog>
        </View>
      )}
    </Portal>
  );
};

const styles = StyleSheet.create({
  fullScreenOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },
  dialog: {
    width: "90%",
  },
});
