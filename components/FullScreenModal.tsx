import { Portal, Modal } from "react-native-paper";
import { View, StyleSheet, Dimensions } from "react-native";

interface FullScreenModalProps {
  visible: boolean;
  children: React.ReactNode;
  onDismiss: () => void;
}

export const FullScreenModal: React.FC<FullScreenModalProps> = ({
  visible,
  children,
  onDismiss,
}) => {
  return (
    <Portal>
      {visible && (
        <View style={styles.fullScreenOverlay}>
          <Modal
            visible={visible}
            onDismiss={onDismiss}
            contentContainerStyle={styles.modalContainer}
            style={styles.modalContent}
          >
            {children}
          </Modal>
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
  modalContainer: {
    backgroundColor: "white",
    padding: 20,
    margin: 20,
    borderRadius: 8,
    elevation: 5,
    gap: 16,
  },
  modalContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
