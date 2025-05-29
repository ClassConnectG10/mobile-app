import { View } from "react-native";
import { useTheme, Text, Icon } from "react-native-paper";

export interface StatCardProps {
  icon: string;
  value: string | number;
  label: string;
  color: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  icon,
  value,
  label,
  color,
}) => {
  const theme = useTheme();

  return (
    <View
      style={{
        backgroundColor: theme.colors.elevation.level1,
        borderRadius: 16,
        padding: 10,
        shadowColor: theme.colors.primary,
        shadowRadius: 4,
        flexDirection: "row",
        justifyContent: "space-between",
        // gap: 12,
        flex: 1,
      }}
    >
      <View
        style={{
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon source={icon} size={36} color={color} />
      </View>
      <View
        style={{
          flex: 1,
          justifyContent: "center",
        }}
      >
        <Text
          style={{
            fontSize: 28,
            fontWeight: "bold",
            color,
            textAlign: "center",
          }}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {value}
        </Text>
        <Text
          style={{
            fontSize: 13,
            color: theme.colors.onSurface,
            textAlign: "center",
          }}
        >
          {label}
        </Text>
      </View>
    </View>
  );
};
