import { Card, Icon, Text, useTheme } from "react-native-paper";
import { StyleSheet, View } from "react-native";
import {
  ActivityType,
  StudentActivity,
  TeacherActivity,
} from "@/types/activity";
import { getRelativeTimeFromNow } from "@/utils/date";
import { customColors } from "@/utils/constants/colors";

interface ActivityCardProps {
  activity: TeacherActivity | StudentActivity;
  onPress?: () => void;
}

const ActivityCard: React.FC<ActivityCardProps> = ({ activity, onPress }) => {
  const theme = useTheme();
  const { type, activityDetails } = activity.activity;
  const { title, dueDate } = activityDetails;

  const { relativeTime, isOverdue, isWarning } =
    getRelativeTimeFromNow(dueDate);

  let statusText;
  let statusIcon;
  let typeIcon;

  typeIcon = (
    <Icon
      source={type === ActivityType.TASK ? "file-document" : "test-tube"}
      size={24}
      color={theme.colors.primary}
    />
  );

  if (activity instanceof StudentActivity) {
    if (activity.submited) {
      statusIcon = (
        <Icon source="check-circle" size={24} color={customColors.success} />
      );
    } else {
      const statusColor = isOverdue
        ? customColors.error
        : isWarning
        ? customColors.warning
        : theme.colors.onSurface;

      statusText = (
        <Text style={[styles.dueDate, { color: statusColor }]}>
          {relativeTime}
        </Text>
      );

      if (isOverdue || isWarning) {
        statusIcon = (
          <Icon
            source={isOverdue ? "alert-circle" : "clock"}
            size={24}
            color={statusColor}
          />
        );
      }
    }
  } else {
    const { visible } = activity;

    if (visible) {
      statusText = <Text style={[styles.dueDate]}>{relativeTime}</Text>;
    } else {
      statusIcon = (
        <Icon source={"eye-off"} size={24} color={customColors.error} />
      );
      statusText = (
        <Text style={[styles.dueDate, { color: customColors.error }]}>
          No publicado
        </Text>
      );
    }
  }

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
        {typeIcon}
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: theme.colors.onSurface }]}>
            {title}
          </Text>
          {statusText}
        </View>
        {statusIcon}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 8,
    elevation: 0,
    shadowColor: "transparent",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  dueDate: {
    fontSize: 14,
    marginTop: 4,
    fontWeight: "600",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
});

export default ActivityCard;
