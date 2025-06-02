import { View } from "react-native";
import { Badge, IconButton } from "react-native-paper";

interface IconBadgeProps {
  icon: string;
  count: number;
  showBadge?: boolean;
  onPress?: () => void;
}

const numberOfNotifications = (count: number): string => {
  if (count > 9) {
    return "+9";
  }
  return count.toString();
};

export const IconBadge: React.FC<IconBadgeProps> = ({
  icon,
  count,
  showBadge = true,
  onPress = () => {},
}) => {
  return (
    <View style={{ position: "relative" }}>
      <IconButton icon={icon} size={24} onPress={onPress} />
      {showBadge && count > 0 && (
        <Badge
          style={{
            position: "absolute",
            top: 4,
            right: 4,
            zIndex: 1,
          }}
        >
          {numberOfNotifications(count)}
        </Badge>
      )}
    </View>
  );
};
