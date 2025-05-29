import { Card, Icon, Text, useTheme } from "react-native-paper";
import { StyleSheet, View } from "react-native";
import {
  ActivitySubmission,
  ActivityType,
  StudentActivity,
  TeacherActivity,
} from "@/types/activity";
import { User } from "@/types/user";
import { getRelativeTimeFromDue, getRelativeTimeFromNow } from "@/utils/date";
import { customColors } from "@/utils/constants/colors";

interface SubmissionCardProps {
  student: User;
  submission: ActivitySubmission;
  onPress?: () => void;
  viewActivityMode?: boolean;
  activity?: TeacherActivity | StudentActivity;
}

const SubmissionCard: React.FC<SubmissionCardProps> = ({
  student,
  submission,
  onPress,
  viewActivityMode = false,
  activity,
}) => {
  const theme = useTheme();
  const { firstName, lastName } = student.userInformation;

  const { relativeTime, isOverdue } = submission.submited
    ? getRelativeTimeFromDue(submission.dueDate, submission.submissionDate)
    : getRelativeTimeFromNow(submission.dueDate);

  const statusColor = submission.submited
    ? customColors.success
    : isOverdue
    ? customColors.error
    : theme.colors.onSurface;

  const statusIcon = submission.submited ? (
    <Icon source="check-circle" size={24} color={customColors.success} />
  ) : isOverdue ? (
    <Icon source="alert-circle" size={24} color={customColors.error} />
  ) : undefined;

  const cardIcon =
    viewActivityMode && activity ? (
      <Icon
        source={
          activity.activity.type === ActivityType.TASK
            ? "file-document"
            : "test-tube"
        }
        size={24}
        color={theme.colors.primary}
      />
    ) : (
      <Icon source="account" size={36} color={theme.colors.primary} />
    );

  const mainText = (
    <Text style={[styles.title, { color: theme.colors.onSurface }]}>
      {viewActivityMode && activity
        ? activity.activity.activityDetails.title
        : `${firstName} ${lastName}`}
    </Text>
  );

  return (
    <Card
      onPress={onPress}
      style={[styles.card, { backgroundColor: theme.colors.onPrimary }]}
    >
      <View style={styles.row}>
        {cardIcon}
        <View style={{ flex: 1 }}>
          {mainText}
          <Text style={[styles.dueDate, { color: statusColor }]}>
            {relativeTime}
          </Text>
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

export default SubmissionCard;
