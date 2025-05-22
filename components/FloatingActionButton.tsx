import { FAB } from "react-native-paper";

interface FloatingActionButtonProps {
  onPress: () => void;
  index?: number;
  icon?: string;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onPress,
  index = 0,
  icon = "plus",
}) => {
  return (
    <FAB
      icon={icon}
      style={{
        position: "absolute",
        right: 16 + index * 80,
        bottom: 16,
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: "center",
        alignItems: "center",
      }}
      onPress={onPress}
    />
  );
};
