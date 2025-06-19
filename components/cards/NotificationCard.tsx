import { Card, Text, useTheme, IconButton } from "react-native-paper";
import { StyleSheet, View } from "react-native";
import { Notification } from "@/types/notification";
import { formatLocalDateTime } from "@/utils/date";

interface NotificationCardProps {
  notification: Notification;
  onPress?: () => void;
  onDelete?: () => void;
}

const NotificationCard: React.FC<NotificationCardProps> = ({
  notification,
  onPress = () => {},
  onDelete = () => {},
}) => {
  const theme = useTheme();

  const getNotificationIcon = () => {
    return "bell";
  };

  return (
    <Card
      onPress={onPress}
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          borderLeftColor: theme.colors.primary,
          borderLeftWidth: 4,
        },
      ]}
      elevation={2}
    >
      <View style={styles.row}>
        <IconButton
          mode="contained"
          icon={getNotificationIcon()}
          size={24}
          iconColor={theme.colors.primary}
        />

        <View style={styles.content}>
          <View style={styles.header}>
            <Text
              style={[styles.title, { color: theme.colors.onSurface }]}
              numberOfLines={2}
            >
              {notification.title}
            </Text>
            <Text
              numberOfLines={3}
              style={[
                styles.description,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              {notification.body}
            </Text>
          </View>

          <Text style={[styles.date, { color: theme.colors.onSurfaceVariant }]}>
            {formatLocalDateTime(new Date(notification.date))}
          </Text>
        </View>

        <IconButton
          icon="close"
          size={24}
          style={styles.deleteButton}
          onPress={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          iconColor={theme.colors.onSurfaceVariant}
        />
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  content: {
    flex: 1,
    gap: 8,
  },
  header: {
    gap: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
  },
  description: {
    fontSize: 14,
    fontWeight: "400",
  },
  date: {
    fontSize: 12,
    fontWeight: "500",
    textAlign: "right",
  },
  deleteButton: {
    margin: 0,
  },
});

export default NotificationCard;
