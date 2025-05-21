import { Card, Icon, Text, useTheme } from "react-native-paper";
import { StyleSheet, View } from "react-native";
import { ExamSubmission } from "@/types/activity";
import { User } from "@/types/user";
import { getRelativeTimeFromDue, getRelativeTimeFromNow } from "@/utils/date";
import { customColors } from "@/utils/constants/colors";

interface ExamSubmissionCardProps {
  // TODO: Unificar con la otra CARD de SUBMISSION cuando cambien los tipos
  student: User;
  examSubmission: ExamSubmission;
  onPress?: () => void;
}

const ExamSubmissionCard: React.FC<ExamSubmissionCardProps> = ({
  student,
  examSubmission,
  onPress,
}) => {
  const theme = useTheme();
  const { firstName, lastName } = student.userInformation;

  const { relativeTime, isOverdue } = examSubmission.submited
    ? getRelativeTimeFromDue(
        examSubmission.dueDate,
        examSubmission.submissionDate
      )
    : getRelativeTimeFromNow(examSubmission.dueDate);

  const statusColor = examSubmission.submited
    ? customColors.success
    : isOverdue
    ? customColors.error
    : theme.colors.onSurface;

  const statusIcon = examSubmission.submited ? (
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

export default ExamSubmissionCard;
