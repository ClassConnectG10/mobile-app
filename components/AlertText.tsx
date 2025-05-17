import { View } from "react-native";
import { Text } from "react-native-paper";
import { useTheme } from "react-native-paper";

interface AlertTextProps {
  text: string;
  error?: boolean;
}

export const AlertText: React.FC<AlertTextProps> = ({
  text,
  error = false,
}) => {
  const theme = useTheme();
  const textColor = error ? theme.colors.error : theme.colors.onSurface;
  const backgroundColor = error
    ? theme.colors.errorContainer
    : theme.colors.secondaryContainer;

  return (
    <View
      style={{
        backgroundColor: backgroundColor,
        padding: 8,
        borderRadius: 8,
      }}
    >
      <Text style={{ color: textColor }}>{text}</Text>
    </View>
  );
};
