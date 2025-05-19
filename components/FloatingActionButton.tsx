import { FAB } from "react-native-paper";
import { StyleSheet } from "react-native";

interface FloatingActionButtonProps {
  onPress: () => void;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onPress,
}) => {
  return <FAB icon="plus" style={styles.fab} onPress={onPress} />;
};

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    right: 16,
    bottom: 16,
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
  },
});
