import { Card, Icon, Text, useTheme } from "react-native-paper";
import { StyleSheet, View } from "react-native";
import { ActivitySubmission } from "@/types/activity";
import { User } from "@/types/user";
import { getRelativeTimeFromDue, getRelativeTimeFromNow } from "@/utils/date";
import { customColors } from "@/utils/constants/colors";

interface SubmissionCardProps {
  student: User;
  submission: ActivitySubmission;
  onPress?: () => void;
}

const SubmissionCard: React.FC<SubmissionCardProps> = ({
  student,
  submission,
  onPress,
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

  return (
    <Card
      onPress={onPress}
      style={[styles.card, { backgroundColor: theme.colors.onPrimary }]}
    >
      <View style={styles.row}>
        <Icon source="account" size={36} color={theme.colors.primary} />
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: theme.colors.onSurface }]}>
            {firstName} {lastName}
          </Text>
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
