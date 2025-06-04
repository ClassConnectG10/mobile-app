import { Card, Icon, Text, useTheme } from "react-native-paper";
import { StyleSheet, View } from "react-native";
import { Notification } from "@/types/notification";

interface NotificationCardProps {
  notification: Notification;
  onPress?: () => void;
  onDismiss?: () => void;
}

const NotificationCard: React.FC<NotificationCardProps> = ({
  notification,
  onPress = () => {},
  onDismiss = () => {},
}) => {
  const theme = useTheme();

  return (
    <Card
      onPress={onPress}
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.onPrimary,
        },
      ]}
    >
      <View style={styles.row}>
        <Icon source={"bell"} size={24} color={theme.colors.primary} />
        <View style={{ flex: 1 }}>
          <View>
            <Text style={[styles.title, { color: theme.colors.onSurface }]}>
              {notification.title}
            </Text>
            <Text numberOfLines={3} style={styles.description}>
              {notification.body}
            </Text>
          </View>
          <Text style={[styles.date, { color: theme.colors.onSurfaceVariant }]}>
            {notification.date.toLocaleString()}
          </Text>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    elevation: 0,
    shadowColor: "transparent",
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  description: {
    fontSize: 14,
    marginTop: 4,
    fontWeight: "600",
  },
  date: {
    fontSize: 12,
    textAlign: "right",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
});

export default NotificationCard;
